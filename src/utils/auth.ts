import jwt from 'jsonwebtoken';

export type Session = {
  userId: string;
  role: string;
};

export function verifyToken(token: string): Session {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET in environment');

  const payload = jwt.verify(token, secret) as any;
  const userId = payload.sub ?? payload.userId ?? payload.id;
  const role = payload.role ?? payload.roles ?? payload.roleName;

  if (!userId || !role) throw new Error('Invalid token payload');

  return { userId: String(userId), role: String(role) };
}

export function getSessionFromHeader(authorization?: string | null): Session | null {
  if (!authorization) return null;
  const m = authorization.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  try {
    return verifyToken(m[1]);
  } catch (err) {
    return null;
  }
}

// Generic helper to extract session from different request shapes
export async function getSession(req: any): Promise<Session | null> {
  // Support both Next.js route handlers (Request) and NextApiRequest
  const header = req?.headers?.authorization ?? (typeof req?.headers?.get === 'function' ? req.headers.get('authorization') : undefined) ?? req?.headers?.Authorization ?? req?.headers?.authorization;

  return getSessionFromHeader(header ?? null);
}

export default {
  verifyToken,
  getSessionFromHeader,
  getSession,
};
