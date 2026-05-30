// Seed WSM demo data. Derived from reference/ prototype (palette, drivers, suppliers, quality params).
// Idempotent: clears tables in FK-safe order, then recreates.
import { PrismaClient, Role, ShipmentStatus, SupplierStatus, TaraKind, IngredientUnit, QualityParamRole } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

// payable = факт − брак − (нестандарт если НЕ оплачивается отдельно)
function calcPayable(factKg: number, rejectKg: number, nonStdKg: number, nonStdPaid: boolean) {
  const payableKg = factKg - rejectKg - (nonStdPaid ? 0 : nonStdKg);
  const payablePct = factKg > 0 ? Math.round((payableKg / factKg) * 10000) / 100 : 0;
  return { payableKg, payablePct };
}

async function clear() {
  // delete deepest dependents first
  await prisma.qualityCaliber.deleteMany();
  await prisma.quality.deleteMany();
  await prisma.shipmentItem.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.weekPlanCell.deleteMany();
  await prisma.weekPlanRawVisibility.deleteMany();
  await prisma.avgTripWeight.deleteMany();
  await prisma.qualityParam.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.taraType.deleteMany();
  await prisma.season.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.carrier.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.rawMaterial.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await clear();

  // ── Users (один на каждую роль) ──
  const passwordHash = await argon2.hash('wsm12345');
  await prisma.user.createMany({
    data: [
      { email: 'admin@wsm.local', name: 'Администратор', role: Role.ADMIN, passwordHash },
      { email: 'operator@wsm.local', name: 'Оператор', role: Role.OPERATOR, passwordHash },
      { email: 'user@wsm.local', name: 'Пользователь', role: Role.USER, passwordHash },
    ],
  });

  // ── Сырьё (палитра сокращена по решению пользователя) ──
  const rawDefs = [
    { name: 'Огурцы', colorBg: '#d4eac2', colorDot: '#4a8f2a' },
    { name: 'Черри', colorBg: '#ffd0c0', colorDot: '#c24a28' },
    { name: 'Томаты', colorBg: '#ffe0b8', colorDot: '#c87020' },
    { name: 'Патиссоны', colorBg: '#fff4a8', colorDot: '#c49a00' },
    { name: 'Халапеньо', colorBg: '#c4dca8', colorDot: '#1e5020' },
  ];
  const raws: Record<string, string> = {};
  for (const r of rawDefs) {
    const created = await prisma.rawMaterial.create({ data: r });
    raws[r.name] = created.id;
  }

  // Параметры качества (Огурцы заполнены, у остальных пусто)
  await prisma.qualityParam.createMany({
    data: [
      { rawMaterialId: raws['Огурцы']!, name: 'Калибр 6–9 см', role: QualityParamRole.PAYABLE, order: 0 },
      { rawMaterialId: raws['Огурцы']!, name: 'Калибр 9–12 см', role: QualityParamRole.PAYABLE, order: 1 },
      { rawMaterialId: raws['Огурцы']!, name: 'Калибр 12+ см', role: QualityParamRole.NONSTD, order: 2 },
    ],
  });

  // ── ТК (Carriers) ──
  const carrierNames = ['ИП Фастов', 'ИП Рябов', 'ТК Авто', 'ИП Кузн.', 'АвтоЛогист'];
  const carriers: Record<string, string> = {};
  for (const name of carrierNames) {
    const c = await prisma.carrier.create({ data: { name } });
    carriers[name] = c.id;
  }

  // ── Водители (из DRIVERS_FULL) ──
  const driverDefs = [
    { fio: 'Кобец Сергей Васильевич', phone: '+7 927 119 61 51', tk: 'АвтоЛогист', info: 'DAF, В383НЕ_164, АН6222_64\nсерия: 63 05 №804684, выдан 30.03.2006\nОВД Екатериновского р-на Саратовской обл.' },
    { fio: 'Вихров Павел Игоревич', phone: '+7 900 123-45-67', tk: 'ИП Фастов', info: 'Volvo FH · К 245 ОР 77\nПаспорт 4512 №876342\nСтаж 12 лет · рефрижератор, тент' },
    { fio: 'Мартыно Виктор Олегович', phone: '+7 901 234-56-78', tk: 'ИП Рябов', info: 'MAN TGX · О 891 РТ 50\nПаспорт 4513 №129084\nДогрузы, гибкий график' },
    { fio: 'Кузнецов Алексей Петрович', phone: '+7 902 345-67-89', tk: 'ТК Авто', info: 'Scania R450 · Е 712 ВК 77\nТягач + полуприцеп 82 м³' },
    { fio: 'Ахмедов Рустам Шамилевич', phone: '+7 903 456-78-90', tk: 'ТК Авто', info: 'DAF XF · М 045 НА 50\nПо предзаказу, бочки/IBC' },
    { fio: 'Гриненко Кирилл Андреевич', phone: '+7 904 567-89-01', tk: 'ИП Кузн.', info: 'Renault T · А 318 СН 77\nТолько томатная группа' },
    { fio: 'Шахматов Дмитрий Сергеевич', phone: '+7 905 678-90-12', tk: 'ТК Авто', info: 'Iveco Stralis · Х 902 ЕМ 50\nЧасто перец/баклажаны' },
    { fio: 'Петросян Армен Вазгенович', phone: '+7 906 789-01-23', tk: 'АвтоЛогист', info: 'MAN TGS · Т 558 КН 77' },
  ];
  const drivers: Record<string, string> = {};
  for (const d of driverDefs) {
    const created = await prisma.driver.create({
      data: { fio: d.fio, phone: d.phone, info: d.info, carrierId: carriers[d.tk]! },
    });
    drivers[d.fio] = created.id;
  }

  // ── Поставщики ──
  const supplierNames = ['Генералов', 'Цой К.Т.', 'Ким Т.', 'Пак', 'Ли', 'Байрамов А.', 'Мищенко'];
  const suppliers: Record<string, string> = {};
  for (const name of supplierNames) {
    const s = await prisma.supplier.create({
      data: {
        name,
        status: SupplierStatus.ACTIVE,
        inn: '64' + Math.floor(10000000 + Math.random() * 89999999),
        legalForm: 'ИП',
      },
    });
    suppliers[name] = s.id;
  }

  // ── Виды тары ──
  await prisma.taraType.createMany({
    data: [
      { name: 'Ящик', kind: TaraKind.BOX },
      { name: 'Бочка 200л', kind: TaraKind.DRUM_METAL },
      { name: 'Бочка пластик 220л', kind: TaraKind.DRUM_PLASTIC },
    ],
  });
  const taraBox = await prisma.taraType.findFirst({ where: { kind: TaraKind.BOX } });
  const taraDrum = await prisma.taraType.findFirst({ where: { kind: TaraKind.DRUM_METAL } });

  // ── Ингредиенты ──
  await prisma.ingredient.createMany({
    data: [
      { name: 'Уксус', unit: IngredientUnit.LITER, qtyOnPlant: 1250 },
      { name: 'Соль', unit: IngredientUnit.TON, qtyOnPlant: 18 },
      { name: 'Аскорбиновая кислота', unit: IngredientUnit.KG, qtyOnPlant: 340 },
      { name: 'Пиросульфит', unit: IngredientUnit.KG, qtyOnPlant: 45 },
    ],
  });

  // ── Сезоны (июнь–май) ──
  await prisma.season.createMany({
    data: [
      { name: 'Сезон 2024/2025', isCurrent: false },
      { name: 'Сезон 2025/2026', isCurrent: true },
      { name: 'Сезон 2026/2027', isCurrent: false },
    ],
  });

  // ── Средний вес рейса по сырью (для Генералова) ──
  await prisma.avgTripWeight.createMany({
    data: [
      { supplierId: suppliers['Генералов']!, rawMaterialId: raws['Огурцы']!, autoKg: 18200, useManual: false },
      { supplierId: suppliers['Генералов']!, rawMaterialId: raws['Халапеньо']!, autoKg: 12100, manualKg: 12500, useManual: true },
    ],
  });

  // ── Демо-отгрузки (неделя 17, 21–22 апр 2025) ──
  const d = (s: string) => new Date(s);

  // Отгрузка 1 — Прибыло, огурцы, качество + PDF
  {
    const ship = await prisma.shipment.create({
      data: {
        shipDate: d('2025-04-19'), arrDate: d('2025-04-21'),
        driverId: drivers['Вихров Павел Игоревич']!, carrierId: carriers['ИП Фастов']!,
        status: ShipmentStatus.ARRIVED,
      },
    });
    const item = await prisma.shipmentItem.create({
      data: {
        shipmentId: ship.id, rawMaterialId: raws['Огурцы']!, kg: 18500,
        supplierId: suppliers['Байрамов А.']!, taraTypeId: taraBox?.id, taraCount: 420,
        processed: true, actNumber: 'А-0421/01',
      },
    });
    const { payableKg, payablePct } = calcPayable(18500, 300, 400, false);
    const q = await prisma.quality.create({
      data: {
        shipmentItemId: item.id, factKg: 18500, rejectKg: 300, nonStdKg: 400,
        nonStdPaidSeparately: false, payableKg, payablePct,
        actNumber: 'А-0421/01', hasData: true, hasPdf: true,
        pdfName: 'akt-А-0421-01.pdf', pdfPath: 'acts/demo-akt-0421-01.pdf', pdfSize: '184 КБ',
        comment: 'Данные качества внесены приёмщиком.',
      },
    });
    // калибры огурцов (payable-параметры): 6–9 и 9–12 суммой = payableKg
    const cucParams = await prisma.qualityParam.findMany({
      where: { rawMaterialId: raws['Огурцы']!, role: QualityParamRole.PAYABLE }, orderBy: { order: 'asc' },
    });
    if (cucParams.length === 2) {
      await prisma.qualityCaliber.createMany({
        data: [
          { qualityId: q.id, qualityParamId: cucParams[0]!.id, kg: 7800 },
          { qualityId: q.id, qualityParamId: cucParams[1]!.id, kg: payableKg - 7800 },
        ],
      });
    }
  }

  // Отгрузка 2 — Отправлено, mixed (черри + томаты)
  {
    const ship = await prisma.shipment.create({
      data: {
        shipDate: d('2025-04-20'), arrDate: d('2025-04-21'),
        driverId: drivers['Мартыно Виктор Олегович']!, carrierId: carriers['ИП Рябов']!,
        status: ShipmentStatus.SHIPPED, comment: 'Догруз по пути',
      },
    });
    const cherry = await prisma.shipmentItem.create({
      data: { shipmentId: ship.id, rawMaterialId: raws['Черри']!, kg: 10000, supplierId: suppliers['Цой К.Т.']!, processed: true, actNumber: 'А-0421/02' },
    });
    const cp = calcPayable(10000, 150, 300, false);
    await prisma.quality.create({
      data: { shipmentItemId: cherry.id, factKg: 10000, rejectKg: 150, nonStdKg: 300, nonStdPaidSeparately: false, payableKg: cp.payableKg, payablePct: cp.payablePct, actNumber: 'А-0421/02', hasData: true, hasPdf: false, comment: 'Данные внесены, PDF ещё нет.' },
    });
    await prisma.shipmentItem.create({
      data: { shipmentId: ship.id, rawMaterialId: raws['Томаты']!, kg: 10000, supplierId: suppliers['Ким Т.']!, processed: true, actNumber: 'А-0421/03' },
    });
    // у томатов только PDF, без структурированных данных — отметим через Quality с hasPdf
    const tomItem = await prisma.shipmentItem.findFirst({ where: { shipmentId: ship.id, actNumber: 'А-0421/03' } });
    if (tomItem) {
      const tp = calcPayable(10000, 0, 0, false);
      await prisma.quality.create({
        data: { shipmentItemId: tomItem.id, factKg: 10000, payableKg: tp.payableKg, payablePct: tp.payablePct, actNumber: 'А-0421/03', hasData: false, hasPdf: true, pdfName: 'akt-А-0421-03.pdf', pdfPath: 'acts/demo-akt-0421-03.pdf', pdfSize: '120 КБ' },
      });
    }
  }

  // Отгрузка 3 — Запланировано (халапеньо, без качества)
  {
    const ship = await prisma.shipment.create({
      data: {
        shipDate: d('2025-04-21'), arrDate: d('2025-04-21'),
        driverId: drivers['Ахмедов Рустам Шамилевич']!, carrierId: carriers['ТК Авто']!,
        status: ShipmentStatus.PLANNED, comment: 'Ожидаем подтв.',
      },
    });
    await prisma.shipmentItem.create({
      data: { shipmentId: ship.id, rawMaterialId: raws['Халапеньо']!, kg: 8724, supplierId: suppliers['Мищенко']!, taraTypeId: taraDrum?.id, taraCount: 14 },
    });
  }

  // ── План недели 17/2025: целевые значения по сырьё × день ──
  const planCells: { rawMaterialId: string; dayOfWeek: number; planKg: number }[] = [
    { rawMaterialId: raws['Огурцы']!, dayOfWeek: 1, planKg: 20000 },
    { rawMaterialId: raws['Огурцы']!, dayOfWeek: 2, planKg: 18000 },
    { rawMaterialId: raws['Черри']!, dayOfWeek: 1, planKg: 12000 },
    { rawMaterialId: raws['Томаты']!, dayOfWeek: 2, planKg: 15000 },
    { rawMaterialId: raws['Халапеньо']!, dayOfWeek: 1, planKg: 10000 },
  ];
  await prisma.weekPlanCell.createMany({
    data: planCells.map((c) => ({ year: 2025, weekNumber: 17, ...c })),
  });

  console.log('Seed complete:');
  console.log('  users: 3 (admin/operator/user @wsm.local · pass: wsm12345)');
  console.log(`  raw materials: ${rawDefs.length}, carriers: ${carrierNames.length}, drivers: ${driverDefs.length}, suppliers: ${supplierNames.length}`);
  console.log('  shipments: 3 (demo week 17/2025) + week plan cells');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
