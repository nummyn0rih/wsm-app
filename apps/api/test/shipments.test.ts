import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { prisma } from '@wsm/db';
import { buildApp } from '../src/app.js';
import { login } from './helpers.js';

let app: FastifyInstance;
let adminCookie: string;
let operatorCookie: string;
let userCookie: string;
let rawId: string;
let supplierId: string;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
  adminCookie = await login(app, 'admin@wsm.local');
  operatorCookie = await login(app, 'operator@wsm.local');
  userCookie = await login(app, 'user@wsm.local');
  rawId = (await prisma.rawMaterial.findFirstOrThrow({ where: { name: 'Огурцы' } })).id;
  supplierId = (await prisma.supplier.findFirstOrThrow({ where: { name: 'Генералов' } })).id;
});
afterAll(async () => { await app.close(); });

async function createPlanned(cookie: string) {
  return app.inject({
    method: 'POST',
    url: '/shipments',
    headers: { cookie },
    payload: {
      arrDate: new Date('2025-04-23').toISOString(),
      status: 'PLANNED',
      items: [{ rawMaterialId: rawId, kg: 5000, supplierId }],
    },
  });
}

describe('shipments crud + filters', () => {
  it('USER cannot create a shipment (403)', async () => {
    const res = await createPlanned(userCookie);
    expect(res.statusCode).toBe(403);
  });

  it('ADMIN creates a shipment', async () => {
    const res = await createPlanned(adminCookie);
    expect(res.statusCode).toBe(201);
    const id = res.json().id;
    await prisma.shipment.delete({ where: { id } });
  });

  it('GET /shipments filter by week 17/2025 returns seeded data', async () => {
    const res = await app.inject({ method: 'GET', url: '/shipments?year=2025&week=17', headers: { cookie: userCookie } });
    expect(res.statusCode).toBe(200);
    expect(res.json().length).toBeGreaterThan(0);
  });
});

describe('status transitions (sequential + rbac)', () => {
  it('OPERATOR cannot PLANNED→SHIPPED (403), ADMIN can; then OPERATOR SHIPPED→ARRIVED', async () => {
    const created = await createPlanned(adminCookie);
    const id = created.json().id;

    // operator forbidden on PLANNED→SHIPPED
    const opTry = await app.inject({ method: 'PATCH', url: `/shipments/${id}/status`, headers: { cookie: operatorCookie }, payload: { to: 'SHIPPED' } });
    expect(opTry.statusCode).toBe(403);

    // admin skip PLANNED→ARRIVED forbidden (sequence)
    const skip = await app.inject({ method: 'PATCH', url: `/shipments/${id}/status`, headers: { cookie: adminCookie }, payload: { to: 'ARRIVED' } });
    expect(skip.statusCode).toBe(400);

    // admin PLANNED→SHIPPED ok
    const ship = await app.inject({ method: 'PATCH', url: `/shipments/${id}/status`, headers: { cookie: adminCookie }, payload: { to: 'SHIPPED' } });
    expect(ship.statusCode).toBe(200);
    expect(ship.json().status).toBe('SHIPPED');

    // operator SHIPPED→ARRIVED ok
    const arr = await app.inject({ method: 'PATCH', url: `/shipments/${id}/status`, headers: { cookie: operatorCookie }, payload: { to: 'ARRIVED' } });
    expect(arr.statusCode).toBe(200);
    expect(arr.json().status).toBe('ARRIVED');

    await prisma.shipment.delete({ where: { id } });
  });

  it('cannot delete non-PLANNED shipment', async () => {
    const created = await createPlanned(adminCookie);
    const id = created.json().id;
    await app.inject({ method: 'PATCH', url: `/shipments/${id}/status`, headers: { cookie: adminCookie }, payload: { to: 'SHIPPED' } });
    const del = await app.inject({ method: 'DELETE', url: `/shipments/${id}`, headers: { cookie: adminCookie } });
    expect(del.statusCode).toBe(400);
    await prisma.shipment.delete({ where: { id } });
  });
});

describe('quality', () => {
  it('OPERATOR records quality, payable computed', async () => {
    const created = await createPlanned(adminCookie);
    const shipId = created.json().id;
    const itemId = created.json().items[0].id;

    const res = await app.inject({
      method: 'PATCH',
      url: `/shipment-items/${itemId}/quality`,
      headers: { cookie: operatorCookie },
      payload: { factKg: 5000, rejectKg: 100, nonStdKg: 750, nonStdPaidSeparately: false, actNumber: 'TEST/01' },
    });
    expect(res.statusCode).toBe(200);
    expect(Number(res.json().payableKg)).toBe(4150);
    expect(Number(res.json().payablePct)).toBe(83);

    await prisma.shipment.delete({ where: { id: shipId } });
  });

  it('USER cannot record quality (403)', async () => {
    const created = await createPlanned(adminCookie);
    const shipId = created.json().id;
    const itemId = created.json().items[0].id;
    const res = await app.inject({ method: 'PATCH', url: `/shipment-items/${itemId}/quality`, headers: { cookie: userCookie }, payload: { factKg: 1000 } });
    expect(res.statusCode).toBe(403);
    await prisma.shipment.delete({ where: { id: shipId } });
  });
});

describe('week plan', () => {
  it('GET /week-plan returns cells + fact for 17/2025', async () => {
    const res = await app.inject({ method: 'GET', url: '/week-plan?year=2025&week=17', headers: { cookie: userCookie } });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.cells.length).toBeGreaterThan(0);
    expect(body.raws.length).toBe(5);
  });
});
