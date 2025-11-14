import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/src/middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Body = {
  tindakan: 'SETUJU' | 'TOLAK' | 'REVISI';
  catatan?: string;
};

async function handler(req: NextApiRequest & { session?: any }, res: NextApiResponse) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

  const session = req.session;
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (!['MARKETING', 'ATASAN_MARKETING'].includes(session.role)) return res.status(403).json({ error: 'Forbidden' });

  const { id } = req.query;
  const pengajuanId = String(id ?? '');
  if (!pengajuanId) return res.status(400).json({ error: 'Missing id' });

  const body: Body = req.body;
  if (!body || !body.tindakan) return res.status(400).json({ error: 'Missing tindakan' });

  try {
    const pengajuan = await prisma.pengajuanKredit.findUnique({ where: { id: pengajuanId } });
    if (!pengajuan) return res.status(404).json({ error: 'Pengajuan not found' });

    let newStatus = pengajuan.status;
    const prevStatus = pengajuan.status;

    if (session.role === 'MARKETING') {
      if (body.tindakan === 'SETUJU') {
        newStatus = 'DIVERIFIKASI_MK';
      } else if (body.tindakan === 'REVISI') {
        newStatus = 'PERLU_REVISI_SALES';
      } else {
        return res.status(400).json({ error: 'Invalid tindakan for MARKETING' });
      }
    } else if (session.role === 'ATASAN_MARKETING') {
      if (body.tindakan === 'SETUJU') {
        newStatus = 'DISETUJUI_ATASAN';
      } else if (body.tindakan === 'TOLAK') {
        newStatus = 'DITOLAK';
      } else if (body.tindakan === 'REVISI') {
        newStatus = 'PERLU_REVISI_SALES';
      } else {
        return res.status(400).json({ error: 'Invalid tindakan for ATASAN_MARKETING' });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.pengajuanKredit.update({
        where: { id: pengajuanId },
        data: {
          status: newStatus as any,
          ...(session.role === 'MARKETING' && { marketingId: session.userId }),
          ...(session.role === 'ATASAN_MARKETING' && { atasanId: session.userId }),
        },
      });

      await tx.historiApproval.create({
        data: {
          pengajuanId,
          statusDari: String(prevStatus),
          statusKe: String(newStatus),
          catatan: body.catatan ?? null,
          olehUser: session.userId,
        },
      });

      return updated;
    });

    return res.status(200).json({ ok: true, data: result });
  } catch (err: any) {
    console.error('Tindakan error', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}

export default withAuth(handler, ['MARKETING', 'ATASAN_MARKETING']);
