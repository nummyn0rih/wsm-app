import type { FastifyInstance } from 'fastify';
import { prisma } from '@wsm/db';
import {
  planExpandToShipment,
  weekPlanQuery,
  weekPlanUpdate,
  weekPlanVisibilityUpdate,
} from '@wsm/shared';
import { badRequest } from '../lib/errors.js';
import { weekRange } from '../lib/week.js';

export async function planRoutes(app: FastifyInstance): Promise<void> {
  const auth = { preHandler: [app.authenticate] };
  const write = { preHandler: [app.authenticate, app.requireCap('plan:write')] };

  // ── Week plan grid: target cells + per-week visibility + computed fact ──
  app.get('/week-plan', auth, async (req) => {
    const { year, week } = weekPlanQuery.parse(req.query);
    const { start, end } = weekRange(year, week);

    const [raws, cells, visibility, shipments] = await Promise.all([
      prisma.rawMaterial.findMany({ orderBy: { name: 'asc' } }),
      prisma.weekPlanCell.findMany({ where: { year, weekNumber: week } }),
      prisma.weekPlanRawVisibility.findMany({ where: { year, weekNumber: week } }),
      prisma.shipment.findMany({
        where: { arrDate: { gte: start, lt: end } },
        include: { items: true },
      }),
    ]);

    // fact[rawMaterialId][dayOfWeek 1..6] = Σ kg
    const fact: Record<string, Record<number, number>> = {};
    for (const s of shipments) {
      const dow = Math.floor((s.arrDate.getTime() - start.getTime()) / 86400000) + 1; // 1..7
      if (dow < 1 || dow > 6) continue;
      for (const it of s.items) {
        fact[it.rawMaterialId] ??= {};
        fact[it.rawMaterialId]![dow] = (fact[it.rawMaterialId]![dow] ?? 0) + Number(it.kg);
      }
    }

    return {
      year,
      week,
      raws,
      cells: cells.map((c) => ({
        rawMaterialId: c.rawMaterialId,
        dayOfWeek: c.dayOfWeek,
        planKg: Number(c.planKg),
      })),
      visibility: visibility.map((v) => ({ rawMaterialId: v.rawMaterialId, visible: v.visible })),
      fact,
    };
  });

  // ── Upsert plan target cells ──
  app.patch('/week-plan', write, async (req) => {
    const d = weekPlanUpdate.parse(req.body);
    await prisma.$transaction(
      d.cells.map((c) =>
        prisma.weekPlanCell.upsert({
          where: {
            year_weekNumber_rawMaterialId_dayOfWeek: {
              year: d.year,
              weekNumber: d.week,
              rawMaterialId: c.rawMaterialId,
              dayOfWeek: c.dayOfWeek,
            },
          },
          create: { year: d.year, weekNumber: d.week, rawMaterialId: c.rawMaterialId, dayOfWeek: c.dayOfWeek, planKg: c.planKg },
          update: { planKg: c.planKg },
        }),
      ),
    );
    return { ok: true };
  });

  // ── Per-week raw visibility (can't hide a raw that has shipments/plan this week) ──
  app.patch('/week-plan/visibility', write, async (req) => {
    const d = weekPlanVisibilityUpdate.parse(req.body);
    const { start, end } = weekRange(d.year, d.week);

    for (const item of d.items) {
      if (item.visible) continue;
      const [hasShip, hasPlan] = await Promise.all([
        prisma.shipmentItem.count({
          where: { rawMaterialId: item.rawMaterialId, shipment: { arrDate: { gte: start, lt: end } } },
        }),
        prisma.weekPlanCell.count({
          where: { year: d.year, weekNumber: d.week, rawMaterialId: item.rawMaterialId, planKg: { gt: 0 } },
        }),
      ]);
      if (hasShip > 0 || hasPlan > 0) {
        throw badRequest('Нельзя скрыть сырьё: в этой неделе есть отгрузки или план по нему');
      }
    }

    await prisma.$transaction(
      d.items.map((item) =>
        prisma.weekPlanRawVisibility.upsert({
          where: {
            year_weekNumber_rawMaterialId: { year: d.year, weekNumber: d.week, rawMaterialId: item.rawMaterialId },
          },
          create: { year: d.year, weekNumber: d.week, rawMaterialId: item.rawMaterialId, visible: item.visible },
          update: { visible: item.visible },
        }),
      ),
    );
    return { ok: true };
  });

  // ── Expand a plan cell into a real PLANNED shipment ──
  app.post('/week-plan/expand', write, async (req, reply) => {
    const d = planExpandToShipment.parse(req.body);
    const ship = await prisma.shipment.create({
      data: {
        arrDate: new Date(d.arrDate),
        status: 'PLANNED',
        items: { create: [{ rawMaterialId: d.rawMaterialId, kg: d.kg, supplierId: d.supplierId }] },
      },
      include: { items: true },
    });
    return reply.status(201).send(ship);
  });
}
