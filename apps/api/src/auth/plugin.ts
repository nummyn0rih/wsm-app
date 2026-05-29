import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import { can, type Capability, type Role } from '@wsm/shared';
import { env, COOKIE_NAME } from '../env.js';
import { forbidden, unauthorized } from '../lib/errors.js';

// JWT payload shape.
interface TokenPayload {
  id: string;
  role: Role;
  email: string;
  name: string;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: TokenPayload;
    user: TokenPayload;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireCap: (cap: Capability) => (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export async function registerAuth(app: FastifyInstance): Promise<void> {
  await app.register(fastifyCookie);
  await app.register(fastifyJwt, {
    secret: env.jwtSecret,
    cookie: { cookieName: COOKIE_NAME, signed: false },
  });

  // Verify token from cookie; populates request.user.
  app.decorate('authenticate', async (req: FastifyRequest) => {
    try {
      await req.jwtVerify();
    } catch {
      throw unauthorized();
    }
  });

  // preHandler factory enforcing a capability.
  app.decorate('requireCap', (cap: Capability) => async (req: FastifyRequest) => {
    if (!req.user) throw unauthorized();
    if (!can(req.user.role, cap)) throw forbidden(`Нужна возможность: ${cap}`);
  });
}
