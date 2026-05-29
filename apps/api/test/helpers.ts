import type { FastifyInstance } from 'fastify';

// Extract the auth cookie from a login response for reuse in later requests.
export function cookieFrom(res: { headers: Record<string, unknown> }): string {
  const raw = res.headers['set-cookie'];
  const arr = Array.isArray(raw) ? raw : [raw];
  const c = arr.find((s) => typeof s === 'string' && s.startsWith('wsm_token='));
  if (!c) throw new Error('no auth cookie in response');
  return (c as string).split(';')[0]!; // "wsm_token=..."
}

export async function login(app: FastifyInstance, email: string): Promise<string> {
  const res = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email, password: 'wsm12345' },
  });
  if (res.statusCode !== 200) throw new Error(`login failed for ${email}: ${res.statusCode} ${res.body}`);
  return cookieFrom(res);
}
