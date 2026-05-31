// Deterministic shipment seed — 50 demo shipments across current week ±1.
// Reused by `prisma/seed.ts` (full seed) and the API dev-reset route, so the
// generated set is reproducible: same anchor week → identical data each run.
import { PrismaClient, ShipmentStatus, QualityParamRole } from '@prisma/client';

// Mulberry32 — tiny deterministic PRNG so reset always rebuilds the same set.
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Monday 00:00 UTC of the ISO week containing `date`.
function isoMonday(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7; // Sun=7
  d.setUTCDate(d.getUTCDate() - (day - 1));
  return d;
}

function isoWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + n);
  return d;
}

function payable(factKg: number, rejectKg: number, nonStdKg: number, nonStdPaid: boolean) {
  const payableKg = factKg - rejectKg - (nonStdPaid ? 0 : nonStdKg);
  const payablePct = factKg > 0 ? Math.round((payableKg / factKg) * 10000) / 100 : 0;
  return { payableKg, payablePct };
}

const pick = <T>(r: () => number, arr: T[]): T => arr[Math.floor(r() * arr.length)]!;

export interface SeedShipmentsResult {
  shipments: number;
  weeks: { year: number; week: number }[];
}

/**
 * Wipe all shipment-related rows + week-plan cells, then regenerate 50 demo
 * shipments spread over the previous / current / next ISO week. Reference data
 * (raw materials, drivers, suppliers, tara, quality params) must already exist.
 */
export async function seedDefaultShipments(
  prisma: PrismaClient,
  now: Date = new Date(),
): Promise<SeedShipmentsResult> {
  // ── wipe shipment graph + plan ──
  await prisma.qualityCaliber.deleteMany();
  await prisma.quality.deleteMany();
  await prisma.shipmentItem.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.weekPlanCell.deleteMany();

  // ── load refs ──
  const [raws, drivers, suppliers, taras, cucParams] = await Promise.all([
    prisma.rawMaterial.findMany(),
    prisma.driver.findMany(),
    prisma.supplier.findMany(),
    prisma.taraType.findMany(),
    prisma.qualityParam.findMany({ where: { role: QualityParamRole.PAYABLE }, orderBy: { order: 'asc' } }),
  ]);
  if (!raws.length || !drivers.length || !suppliers.length) {
    throw new Error('seedDefaultShipments: справочники пусты — сначала засейте refs');
  }
  const cucumber = raws.find((r) => r.name === 'Огурцы');
  const cucPayableParams = cucumber ? cucParams.filter((p) => p.rawMaterialId === cucumber.id) : [];

  const r = rng(20260531); // fixed seed → reproducible
  const monThis = isoMonday(now);
  const weekMondays = [addDays(monThis, -7), monThis, addDays(monThis, 7)];
  const weeks = weekMondays.map((m) => isoWeek(m));

  // Status distribution per week: past → done, current → mixed, next → ahead.
  const statusByWeek: ShipmentStatus[][] = [
    [ShipmentStatus.ARRIVED, ShipmentStatus.ARRIVED, ShipmentStatus.ARRIVED, ShipmentStatus.SHIPPED],
    [ShipmentStatus.ARRIVED, ShipmentStatus.SHIPPED, ShipmentStatus.SHIPPED, ShipmentStatus.PLANNED],
    [ShipmentStatus.PLANNED, ShipmentStatus.PLANNED, ShipmentStatus.SHIPPED, ShipmentStatus.ARRIVED],
  ];

  const TOTAL = 50;
  let actSeq = 1;

  for (let i = 0; i < TOTAL; i++) {
    const wi = i % 3; // round-robin across the 3 weeks → ~17 each
    const monday = weekMondays[wi]!;
    const dow = 1 + Math.floor(r() * 6); // 1..6 Пн..Сб
    const arrDate = addDays(monday, dow - 1);
    const status = pick(r, statusByWeek[wi]!);

    const driver = pick(r, drivers);
    const transit = 1 + Math.floor(r() * 3); // 1..3 дня в пути
    const shipDate = status === ShipmentStatus.PLANNED && r() < 0.5 ? null : addDays(arrDate, -transit);

    const ship = await prisma.shipment.create({
      data: {
        arrDate,
        shipDate,
        driverId: driver.id,
        carrierId: driver.carrierId,
        status,
        comment: r() < 0.25 ? pick(r, ['Догруз по пути', 'Ожидаем подтв.', 'Срочно', 'Замена машины']) : null,
      },
    });

    const itemCount = 1 + Math.floor(r() * 3); // 1..3 овоща
    const usedRaw = new Set<string>();
    const dateTag = `${String(arrDate.getUTCMonth() + 1).padStart(2, '0')}${String(arrDate.getUTCDate()).padStart(2, '0')}`;

    for (let j = 0; j < itemCount; j++) {
      let raw = pick(r, raws);
      let guard = 0;
      while (usedRaw.has(raw.id) && guard++ < 6) raw = pick(r, raws);
      usedRaw.add(raw.id);

      const supplier = pick(r, suppliers);
      const kg = Math.round((4000 + r() * 16000) / 100) * 100; // 4 000–20 000, кратно 100
      const tara = r() < 0.7 ? pick(r, taras) : null;
      const taraCount = tara ? 10 + Math.floor(r() * 500) : null;
      const processed = status === ShipmentStatus.ARRIVED;
      const actNumber = processed ? `А-${dateTag}/${String(actSeq++).padStart(2, '0')}` : null;

      const item = await prisma.shipmentItem.create({
        data: {
          shipmentId: ship.id,
          rawMaterialId: raw.id,
          kg,
          supplierId: supplier.id,
          taraTypeId: tara?.id ?? null,
          taraCount,
          processed,
          actNumber,
        },
      });

      // Качество для прибывших позиций.
      if (status === ShipmentStatus.ARRIVED) {
        const rejectKg = Math.round(kg * (r() * 0.03) / 10) * 10;
        const nonStdKg = Math.round(kg * (r() * 0.04) / 10) * 10;
        const { payableKg, payablePct } = payable(kg, rejectKg, nonStdKg, false);
        const hasPdf = r() < 0.5;
        const q = await prisma.quality.create({
          data: {
            shipmentItemId: item.id,
            factKg: kg, rejectKg, nonStdKg, nonStdPaidSeparately: false,
            payableKg, payablePct, actNumber,
            hasData: true, hasPdf,
            ...(hasPdf ? { pdfName: `akt-${actNumber?.replace('/', '-')}.pdf`, pdfPath: `acts/demo-${dateTag}-${item.id}.pdf`, pdfSize: `${120 + Math.floor(r() * 120)} КБ` } : {}),
          },
        });
        // Калибры для огурцов (2 payable-параметра суммой = payableKg).
        if (cucumber && raw.id === cucumber.id && cucPayableParams.length === 2) {
          const first = Math.round(payableKg * (0.4 + r() * 0.2));
          await prisma.qualityCaliber.createMany({
            data: [
              { qualityId: q.id, qualityParamId: cucPayableParams[0]!.id, kg: first },
              { qualityId: q.id, qualityParamId: cucPayableParams[1]!.id, kg: payableKg - first },
            ],
          });
        }
      }
    }
  }

  // ── План на каждую из 3 недель: сырьё × день ──
  const planRows: { year: number; weekNumber: number; rawMaterialId: string; dayOfWeek: number; planKg: number }[] = [];
  for (const w of weeks) {
    for (const raw of raws) {
      for (let dow = 1; dow <= 5; dow++) {
        if (r() < 0.45) {
          planRows.push({
            year: w.year, weekNumber: w.week, rawMaterialId: raw.id, dayOfWeek: dow,
            planKg: Math.round((6000 + r() * 18000) / 500) * 500,
          });
        }
      }
    }
  }
  if (planRows.length) await prisma.weekPlanCell.createMany({ data: planRows });

  return { shipments: TOTAL, weeks };
}
