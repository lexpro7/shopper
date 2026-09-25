import { cookies } from 'next/headers';
import { db } from './db';
import { createHmac, timingSafeEqual } from 'node:crypto';
const secret = process.env.SESSION_SECRET || 'seconda-local-demo-only';
export function sessionToken(id: string) {
  return `${id}.${createHmac('sha256', secret).update(id).digest('hex')}`;
}
export async function currentUser() {
  const token = (await cookies()).get('seconda-session')?.value;
  if (token) {
    const [id, signature] = token.split('.');
    const expected = sessionToken(id).split('.')[1];
    if (
      signature &&
      signature.length === expected.length &&
      timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    )
      return db.user.findFirst({ where: { id, status: 'Active' } });
  }
  return process.env.DEMO_MODE === 'true' ? db.user.findUnique({ where: { id: 'alex' } }) : null;
}
