import Fastify, { type FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import { ZodError } from 'zod';
import { env } from './env.js';
import { HttpError } from './lib/errors.js';
import { registerAuth } from './auth/plugin.js';
import { DiskStorage, type StorageProvider } from './storage/provider.js';
import { authRoutes } from './routes/auth.js';
import { referenceRoutes } from './routes/references.js';
import { shipmentRoutes } from './routes/shipments.js';
import { planRoutes } from './routes/plan.js';
import { devRoutes } from './routes/dev.js';

declare module 'fastify' {
  interface FastifyInstance {
    storage: StorageProvider;
  }
}

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: env.nodeEnv !== 'test' });

  await app.register(fastifyCors, { origin: env.webOrigin, credentials: true });
  await app.register(fastifyMultipart, { limits: { fileSize: 15 * 1024 * 1024 } });
  await registerAuth(app);

  app.decorate('storage', new DiskStorage(env.storageDir));

  // Global error handler — maps HttpError / ZodError to clean JSON.
  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof HttpError) {
      return reply.status(err.statusCode).send({ error: err.message });
    }
    if (err instanceof ZodError) {
      return reply.status(400).send({ error: 'Ошибка валидации', issues: err.issues });
    }
    app.log.error(err);
    return reply.status(500).send({ error: 'Внутренняя ошибка сервера' });
  });

  app.get('/health', async () => ({ ok: true }));

  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(referenceRoutes);
  await app.register(shipmentRoutes);
  await app.register(planRoutes);
  if (env.nodeEnv !== 'production') await app.register(devRoutes);

  return app;
}
