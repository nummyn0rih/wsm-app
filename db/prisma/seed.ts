// Seed WSM demo data. Derived from reference/ prototype (palette, drivers, suppliers, quality params).
// Idempotent: clears tables in FK-safe order, then recreates.
import { PrismaClient, Role, SupplierStatus, TaraKind, IngredientUnit, QualityParamRole } from '@prisma/client';
import argon2 from 'argon2';
import { seedDefaultShipments } from '../src/seed-shipments.js';

const prisma = new PrismaClient();

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

  // ── Демо-отгрузки: 50 шт по 3 неделям (текущая ±1), детерминированно ──
  const ship = await seedDefaultShipments(prisma);

  console.log('Seed complete:');
  console.log('  users: 3 (admin/operator/user @wsm.local · pass: wsm12345)');
  console.log(`  raw materials: ${rawDefs.length}, carriers: ${carrierNames.length}, drivers: ${driverDefs.length}, suppliers: ${supplierNames.length}`);
  console.log(`  shipments: ${ship.shipments} (недели ${ship.weeks.map((w) => `${w.week}/${w.year}`).join(', ')}) + week plan cells`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
