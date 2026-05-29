import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import { prisma } from '@wsm/db';
import {
  carrierCreate, carrierUpdate,
  driverCreate, driverUpdate,
  ingredientCreate, ingredientUpdate,
  qualityParamCreate, qualityParamUpdate,
  rawMaterialCreate, rawMaterialUpdate,
  seasonCreate, seasonUpdate,
  supplierCreate, supplierUpdate,
  taraTypeCreate, taraTypeUpdate,
} from '@wsm/shared';
import { notFound } from '../lib/errors.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface CrudOpts {
  path: string;
  delegate: any; // prisma model delegate
  create: z.ZodTypeAny;
  update: z.ZodTypeAny;
  findManyArgs?: Record<string, unknown>;
  findOneInclude?: Record<string, unknown>;
  transform?: (data: any) => any; // map DTO → prisma input (e.g. dates)
}

function registerCrud(app: FastifyInstance, opts: CrudOpts): void {
  const { path, delegate, create, update, findManyArgs, findOneInclude, transform } = opts;
  const auth = { preHandler: [app.authenticate] };
  const write = { preHandler: [app.authenticate, app.requireCap('references:write')] };
  const t = transform ?? ((x: any) => x);

  app.get(path, auth, async () => delegate.findMany(findManyArgs ?? {}));

  app.get(`${path}/:id`, auth, async (req) => {
    const { id } = req.params as { id: string };
    const row = await delegate.findUnique({ where: { id }, include: findOneInclude });
    if (!row) throw notFound();
    return row;
  });

  app.post(path, write, async (req, reply) => {
    const data = t(create.parse(req.body));
    const row = await delegate.create({ data });
    return reply.status(201).send(row);
  });

  app.patch(`${path}/:id`, write, async (req) => {
    const { id } = req.params as { id: string };
    const data = t(update.parse(req.body));
    return delegate.update({ where: { id }, data });
  });

  app.delete(`${path}/:id`, write, async (req, reply) => {
    const { id } = req.params as { id: string };
    await delegate.delete({ where: { id } });
    return reply.status(204).send();
  });
}

// startDate ISO string → Date for prisma
const dateTransform = (data: any) => {
  if (data && typeof data.startDate === 'string') return { ...data, startDate: new Date(data.startDate) };
  return data;
};

export async function referenceRoutes(app: FastifyInstance): Promise<void> {
  registerCrud(app, {
    path: '/raw-materials', delegate: prisma.rawMaterial, create: rawMaterialCreate, update: rawMaterialUpdate,
    findManyArgs: { include: { qualityParams: { orderBy: { order: 'asc' } } }, orderBy: { name: 'asc' } },
    findOneInclude: { qualityParams: { orderBy: { order: 'asc' } } },
  });
  registerCrud(app, {
    path: '/quality-params', delegate: prisma.qualityParam, create: qualityParamCreate, update: qualityParamUpdate,
  });
  registerCrud(app, {
    path: '/carriers', delegate: prisma.carrier, create: carrierCreate, update: carrierUpdate,
    findManyArgs: { orderBy: { name: 'asc' } },
  });
  registerCrud(app, {
    path: '/drivers', delegate: prisma.driver, create: driverCreate, update: driverUpdate,
    findManyArgs: { include: { carrier: true }, orderBy: { fio: 'asc' } },
    findOneInclude: { carrier: true },
  });
  registerCrud(app, {
    path: '/suppliers', delegate: prisma.supplier, create: supplierCreate, update: supplierUpdate,
    findManyArgs: { orderBy: { name: 'asc' } },
    findOneInclude: { avgTripWeights: { include: { rawMaterial: true } } },
    transform: dateTransform,
  });
  registerCrud(app, {
    path: '/tara-types', delegate: prisma.taraType, create: taraTypeCreate, update: taraTypeUpdate,
    findManyArgs: { orderBy: { name: 'asc' } },
  });
  registerCrud(app, {
    path: '/ingredients', delegate: prisma.ingredient, create: ingredientCreate, update: ingredientUpdate,
    findManyArgs: { orderBy: { name: 'asc' } },
  });
  registerCrud(app, {
    path: '/seasons', delegate: prisma.season, create: seasonCreate, update: seasonUpdate,
    findManyArgs: { orderBy: { name: 'asc' } },
  });
}
