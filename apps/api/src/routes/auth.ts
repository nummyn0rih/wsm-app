import type { FastifyInstance } from 'fastify';
import argon2 from 'argon2';
import { prisma } from '@wsm/db';
import { loginSchema, type UserDto } from '@wsm/shared';
import { env, COOKIE_NAME } from '../env.js';
import { unauthorized } from '../lib/errors.js';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post('/login', async (req, reply) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.active) throw unauthorized('Неверный email или пароль');

    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) throw unauthorized('Неверный email или пароль');

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const payload = { id: user.id, role: user.role, email: user.email, name: user.name };
    const token = app.jwt.sign(payload, { expiresIn: '7d' });

    reply.setCookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.cookieSecure,
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    const dto: UserDto = { id: user.id, email: user.email, name: user.name, role: user.role };
    return dto;
  });

  app.post('/logout', async (_req, reply) => {
    reply.clearCookie(COOKIE_NAME, { path: '/' });
    return { ok: true };
  });

  app.get('/me', { preHandler: [app.authenticate] }, async (req) => {
    const u = req.user;
    const dto: UserDto = { id: u.id, email: u.email, name: u.name, role: u.role };
    return dto;
  });
}
