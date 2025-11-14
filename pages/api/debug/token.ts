import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

// Development-only helper to issue JWTs for seeded users.
// Disabled when NODE_ENV=production.

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'Disabled in production' });

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, type } = req.body || {};
  if (!username) return res.status(400).json({ error: 'username required' });

  try {
    // Try to find user in Sales first, then internal
    let user = await prisma.salesDealer.findUnique({ where: { username } });
    let role = 'SALES';
    if (!user) {
      const internal = await prisma.userInternal.findUnique({ where: { username } });
      if (internal) {
        user = internal as any;
        role = internal.role as any;
      }
    }

    if (!user) return res.status(404).json({ error: 'User not found' });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'JWT_SECRET not set' });

    const token = jwt.sign({ role }, secret, { subject: user.id, expiresIn: '8h' });
    return res.status(200).json({ ok: true, token, user: { id: user.id, username: (user as any).username, role } });
  } catch (err: any) {
    console.error('Token issue error', err);
    return res.status(500).json({ error: 'Internal error', details: err.message });
  }
}
