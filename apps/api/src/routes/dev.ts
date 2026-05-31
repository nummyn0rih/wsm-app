import type { FastifyInstance } from 'fastify';
import { prisma, seedDefaultShipments } from '@wsm/db';

// Dev-only helpers. Registered solely when nodeEnv !== 'production'.
// Гард: shipments:write (только Админ) + сам роут существует лишь вне прода.
export async function devRoutes(app: FastifyInstance): Promise<void> {
  const admin = { preHandler: [app.authenticate, app.requireCap('shipments:write')] };

  // Сбросить все отгрузки/качество/план к дефолтным сид-данным.
  app.post('/dev/reset-shipments', admin, async () => {
    const res = await seedDefaultShipments(prisma);
    return { ok: true, ...res };
  });
}
