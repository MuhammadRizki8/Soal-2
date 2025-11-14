import { NextApiRequest, NextApiResponse } from 'next';
import { getSessionFromHeader, Session } from './utils/auth';

// Higher-order wrapper for Next.js API routes (pages/api or API handlers using NextApiRequest)
export function withAuth(handler: (req: NextApiRequest & { session?: Session }, res: NextApiResponse) => unknown, allowedRoles?: string[]) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authHeader = (req.headers as any).authorization || (req.headers as any).Authorization;
    const session = getSessionFromHeader(authHeader ?? null);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });
    if (allowedRoles && !allowedRoles.includes(session.role)) return res.status(403).json({ error: 'Forbidden' });
    (req as any).session = session;
    return handler(req as any, res);
  };
}

// Helper for Request/Route Handler style (app dir). Throws a Response if unauthorized.
export function requireAuthForRequest(req: Request, allowedRoles?: string[]) {
  const authHeader = req.headers.get('authorization');
  const session = getSessionFromHeader(authHeader ?? null);
  if (!session) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } });
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    throw new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'content-type': 'application/json' } });
  }
  return session;
}

export default { withAuth, requireAuthForRequest };
