import { timingSafeEqual } from 'node:crypto';
import type { Context, Next } from 'hono';

function equalSecret(actual: string, expected: string) {
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function bearer(c: Context) {
  const value = c.req.header('authorization');
  return value?.startsWith('Bearer ') ? value.slice(7) : '';
}

export async function requireAdmin(c: Context, next: Next) {
  const expected = process.env.ASHHOLE_ADMIN_TOKEN;
  if (!expected) return c.json({ error: 'Admin access is not configured.' }, 503);
  if (!equalSecret(bearer(c), expected)) return c.json({ error: 'Unauthorized.' }, 401);
  await next();
}
