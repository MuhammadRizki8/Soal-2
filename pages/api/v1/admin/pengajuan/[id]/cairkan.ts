import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/src/middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest & { session?: any }, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = req.session;
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (session.role !== 'ADMIN_BACKOFFICE') return res.status(403).json({ error: 'Forbidden' });

  const { id } = req.query;
  const pengajuanId = String(id ?? '');
  if (!pengajuanId) return res.status(400).json({ error: 'Missing id' });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const p = await tx.pengajuanKredit.findUnique({ where: { id: pengajuanId } });
      if (!p) throw new Error('Pengajuan not found');
      if (p.status !== 'PROSES_TTE') throw new Error('Pengajuan not in PROSES_TTE');
      const prevStatus = String(p.status);

      // Update to PROSES_PENCAIRAN, then SELESAI
      const step1 = await tx.pengajuanKredit.update({ where: { id: pengajuanId }, data: { status: 'PROSES_PENCAIRAN' as any } });

      await tx.historiApproval.create({
        data: {
          pengajuanId,
          statusDari: prevStatus,
          statusKe: 'PROSES_PENCAIRAN',
          catatan: 'Memulai proses pencairan (simulasi)',
          olehUser: session.userId,
        },
      });

      const step2 = await tx.pengajuanKredit.update({ where: { id: pengajuanId }, data: { status: 'SELESAI' as any } });

      await tx.historiApproval.create({
        data: {
          pengajuanId,
          statusDari: 'PROSES_PENCAIRAN',
          statusKe: 'SELESAI',
          catatan: 'Pencairan selesai (simulasi)',
          olehUser: session.userId,
        },
      });

      return step2;
    });

    return res.status(200).json({ ok: true, data: result });
  } catch (err: any) {
    console.error('Cairkan error', err);
    return res.status(400).json({ error: 'Failed', details: err.message });
  }
}

export default withAuth(handler, ['ADMIN_BACKOFFICE']);
