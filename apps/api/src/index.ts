import { buildApp } from './app.js';
import { env } from './env.js';

const app = await buildApp();
try {
  await app.listen({ port: env.port, host: '0.0.0.0' });
  app.log.info(`WSM API on http://localhost:${env.port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
