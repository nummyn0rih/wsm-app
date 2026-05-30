import type { FastifyInstance, FastifyRequest } from 'fastify';
import { prisma } from '@wsm/db';
import {
  calcPayable,
  qualityInput,
  shipmentCreate,
  shipmentFilters,
  shipmentStatusChange,
  shipmentUpdate,
  transitionError,
} from '@wsm/shared';
import { badRequest, forbidden, notFound } from '../lib/errors.js';
import { weekRange } from '../lib/week.js';

const shipmentInclude = {
  driver: { include: { carrier: true } },
  carrier: true,
  items: {
    include: {
      rawMaterial: { include: { qualityParams: { orderBy: { order: 'asc' } } } },
      supplier: true,
      taraType: true,
      quality: { include: { calibers: true } },
    },
  },
} as const;

export async function shipmentRoutes(app: FastifyInstance): Promise<void> {
  const auth = { preHandler: [app.authenticate] };
  const write = { preHandler: [app.authenticate, app.requireCap('shipments:write')] };
  const quality = { preHandler: [app.authenticate, app.requireCap('quality:write')] };

  // ── List with filters ──
  app.get('/shipments', auth, async (req) => {
    const f = shipmentFilters.parse(req.query);
    const where: Record<string, unknown> = {};
    if (f.status) where.status = f.status;
    if (f.year && f.week) {
      const { start, end } = weekRange(f.year, f.week);
      where.arrDate = { gte: start, lt: end };
    }
    const itemSome: Record<string, unknown> = {};
    if (f.supplierId) itemSome.supplierId = f.supplierId;
    if (f.rawMaterialId) itemSome.rawMaterialId = f.rawMaterialId;
    if (f.processed !== undefined) itemSome.processed = f.processed;
    if (Object.keys(itemSome).length) where.items = { some: itemSome };

    return prisma.shipment.findMany({ where, include: shipmentInclude, orderBy: { arrDate: 'asc' } });
  });

  app.get('/shipments/:id', auth, async (req) => {
    const { id } = req.params as { id: string };
    const row = await prisma.shipment.findUnique({ where: { id }, include: shipmentInclude });
    if (!row) throw notFound();
    return row;
  });

  // ── Create ──
  app.post('/shipments', write, async (req, reply) => {
    const d = shipmentCreate.parse(req.body);
    const row = await prisma.shipment.create({
      data: {
        arrDate: new Date(d.arrDate),
        shipDate: d.shipDate ? new Date(d.shipDate) : null,
        driverId: d.driverId ?? null,
        carrierId: d.carrierId ?? null,
        status: d.status,
        comment: d.comment ?? null,
        items: {
          create: d.items.map((it) => ({
            rawMaterialId: it.rawMaterialId,
            kg: it.kg,
            supplierId: it.supplierId,
            taraTypeId: it.taraTypeId ?? null,
            taraCount: it.taraCount ?? null,
          })),
        },
      },
      include: shipmentInclude,
    });
    return reply.status(201).send(row);
  });

  // ── Update (scalar fields; if items provided — replace) ──
  app.patch('/shipments/:id', write, async (req) => {
    const { id } = req.params as { id: string };
    const d = shipmentUpdate.parse(req.body);
    const existing = await prisma.shipment.findUnique({ where: { id } });
    if (!existing) throw notFound();

    return prisma.$transaction(async (tx) => {
      if (d.items) {
        await tx.shipmentItem.deleteMany({ where: { shipmentId: id } });
        await tx.shipmentItem.createMany({
          data: d.items.map((it) => ({
            shipmentId: id,
            rawMaterialId: it.rawMaterialId,
            kg: it.kg,
            supplierId: it.supplierId,
            taraTypeId: it.taraTypeId ?? null,
            taraCount: it.taraCount ?? null,
          })),
        });
      }
      return tx.shipment.update({
        where: { id },
        data: {
          ...(d.arrDate !== undefined ? { arrDate: new Date(d.arrDate) } : {}),
          ...(d.shipDate !== undefined ? { shipDate: d.shipDate ? new Date(d.shipDate) : null } : {}),
          ...(d.driverId !== undefined ? { driverId: d.driverId } : {}),
          ...(d.carrierId !== undefined ? { carrierId: d.carrierId } : {}),
          ...(d.status !== undefined ? { status: d.status } : {}),
          ...(d.comment !== undefined ? { comment: d.comment } : {}),
        },
        include: shipmentInclude,
      });
    });
  });

  // ── Delete (only PLANNED) ──
  app.delete('/shipments/:id', write, async (req, reply) => {
    const { id } = req.params as { id: string };
    const s = await prisma.shipment.findUnique({ where: { id } });
    if (!s) throw notFound();
    if (s.status !== 'PLANNED') throw badRequest('Удалять можно только отгрузки в статусе «Запланировано»');
    await prisma.shipment.delete({ where: { id } });
    return reply.status(204).send();
  });

  // ── Status change (sequential + RBAC enforced in shared) ──
  app.patch('/shipments/:id/status', auth, async (req) => {
    const { id } = req.params as { id: string };
    const { to } = shipmentStatusChange.parse(req.body);
    const s = await prisma.shipment.findUnique({ where: { id } });
    if (!s) throw notFound();

    const err = transitionError(req.user.role, s.status, to);
    if (err) {
      // role-related → 403, sequence/other → 400
      if (err.includes('не может')) throw forbidden(err);
      throw badRequest(err);
    }

    return prisma.shipment.update({
      where: { id },
      data: {
        status: to,
        ...(to === 'SHIPPED' && !s.shipDate ? { shipDate: new Date() } : {}),
      },
      include: shipmentInclude,
    });
  });

  // ── Quality of a shipment item (data + optional PDF act) ──
  app.patch('/shipment-items/:id/quality', quality, async (req: FastifyRequest) => {
    const { id } = req.params as { id: string };
    const item = await prisma.shipmentItem.findUnique({ where: { id } });
    if (!item) throw notFound('Позиция отгрузки не найдена');

    let raw: unknown;
    let pdfBuffer: Buffer | null = null;
    let pdfOriginalName: string | null = null;

    if (req.isMultipart()) {
      const parts = req.parts();
      for await (const part of parts) {
        if (part.type === 'file' && part.fieldname === 'pdf') {
          pdfBuffer = await part.toBuffer();
          pdfOriginalName = part.filename;
        } else if (part.type === 'field' && part.fieldname === 'data') {
          raw = JSON.parse(part.value as string);
        }
      }
    } else {
      raw = req.body;
    }

    const d = qualityInput.parse(raw);
    const { payableKg, payablePct } = calcPayable({
      factKg: d.factKg,
      rejectKg: d.rejectKg,
      nonStdKg: d.nonStdKg,
      nonStdPaidSeparately: d.nonStdPaidSeparately,
    });

    let pdfFields: { pdfName: string; pdfPath: string; pdfSize: string } | null = null;
    if (pdfBuffer) {
      const key = `acts/${id}-${Date.now()}.pdf`;
      const stored = await app.storage.put(key, pdfBuffer);
      pdfFields = { pdfName: pdfOriginalName ?? 'act.pdf', pdfPath: stored.key, pdfSize: stored.size };
    }

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.quality.findUnique({ where: { shipmentItemId: id } });
      const base = {
        factKg: d.factKg,
        rejectKg: d.rejectKg,
        nonStdKg: d.nonStdKg,
        nonStdPaidSeparately: d.nonStdPaidSeparately,
        nonStdPrice: d.nonStdPaidSeparately ? d.nonStdPrice ?? null : null,
        payableKg,
        payablePct,
        actNumber: d.actNumber ?? null,
        comment: d.comment ?? null,
        hasData: true,
        ...(pdfFields ? { ...pdfFields, hasPdf: true } : {}),
      };

      const q = existing
        ? await tx.quality.update({ where: { shipmentItemId: id }, data: base })
        : await tx.quality.create({ data: { shipmentItemId: id, hasPdf: !!pdfFields, ...base } });

      // replace calibers
      await tx.qualityCaliber.deleteMany({ where: { qualityId: q.id } });
      if (d.calibers.length) {
        await tx.qualityCaliber.createMany({
          data: d.calibers.map((c) => ({ qualityId: q.id, qualityParamId: c.qualityParamId, kg: c.kg })),
        });
      }

      await tx.shipmentItem.update({
        where: { id },
        data: { processed: true, ...(d.actNumber ? { actNumber: d.actNumber } : {}) },
      });

      return tx.quality.findUnique({ where: { id: q.id }, include: { calibers: true } });
    });

    return result;
  });
}
