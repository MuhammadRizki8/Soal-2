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
    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.pengajuanKredit.findUnique({ where: { id: pengajuanId } });
      if (!current) throw new Error('Pengajuan not found');
      const prevStatus = String(current.status);

      const p = await tx.pengajuanKredit.update({
        where: { id: pengajuanId },
        data: { status: 'PROSES_TTE' as any },
      });

      await tx.historiApproval.create({
        data: {
          pengajuanId,
          statusDari: prevStatus,
          statusKe: 'PROSES_TTE',
          catatan: 'Dokumen dikirim untuk proses TTE (simulasi)',
          olehUser: session.userId,
        },
      });

      return p;
    });

    return res.status(200).json({ ok: true, data: updated });
  } catch (err: any) {
    console.error('Kirim dokumen error', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}

export default withAuth(handler, ['ADMIN_BACKOFFICE']);
