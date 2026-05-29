import 'dotenv/config';

function req(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Missing env ${name}`);
  return v;
}

export const env = {
  databaseUrl: req('DATABASE_URL'),
  jwtSecret: req('JWT_SECRET', 'dev-secret-change-me'),
  port: Number(req('PORT', '3001')),
  storageDir: req('STORAGE_DIR', '../../storage'),
  cookieSecure: req('COOKIE_SECURE', 'false') === 'true',
  webOrigin: req('WEB_ORIGIN', 'http://localhost:5173'),
  nodeEnv: process.env.NODE_ENV ?? 'development',
};

export const COOKIE_NAME = 'wsm_token';
