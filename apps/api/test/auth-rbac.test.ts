import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { login } from './helpers.js';

let app: FastifyInstance;
beforeAll(async () => { app = await buildApp(); await app.ready(); });
afterAll(async () => { await app.close(); });

describe('auth', () => {
  it('rejects bad password', async () => {
    const res = await app.inject({ method: 'POST', url: '/auth/login', payload: { email: 'admin@wsm.local', password: 'nope' } });
    expect(res.statusCode).toBe(401);
  });

  it('login + /me returns role', async () => {
    const cookie = await login(app, 'operator@wsm.local');
    const me = await app.inject({ method: 'GET', url: '/auth/me', headers: { cookie } });
    expect(me.statusCode).toBe(200);
    expect(me.json().role).toBe('OPERATOR');
  });

  it('/me unauthenticated → 401', async () => {
    const res = await app.inject({ method: 'GET', url: '/auth/me' });
    expect(res.statusCode).toBe(401);
  });
});

describe('rbac on references', () => {
  it('USER cannot create a carrier (403)', async () => {
    const cookie = await login(app, 'user@wsm.local');
    const res = await app.inject({ method: 'POST', url: '/carriers', headers: { cookie }, payload: { name: 'X' } });
    expect(res.statusCode).toBe(403);
  });

  it('USER can read references', async () => {
    const cookie = await login(app, 'user@wsm.local');
    const res = await app.inject({ method: 'GET', url: '/drivers', headers: { cookie } });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.json())).toBe(true);
  });

  it('ADMIN can create + delete a carrier', async () => {
    const cookie = await login(app, 'admin@wsm.local');
    const create = await app.inject({ method: 'POST', url: '/carriers', headers: { cookie }, payload: { name: 'ТестТК' } });
    expect(create.statusCode).toBe(201);
    const id = create.json().id;
    const del = await app.inject({ method: 'DELETE', url: `/carriers/${id}`, headers: { cookie } });
    expect(del.statusCode).toBe(204);
  });
});
