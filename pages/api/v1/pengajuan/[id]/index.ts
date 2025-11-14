import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/src/middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest & { session?: any }, res: NextApiResponse) {
  const { id } = req.query;
  const pengajuanId = String(id ?? '');
  if (!pengajuanId) return res.status(400).json({ error: 'Missing id' });

  const session = req.session;
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (!['MARKETING', 'ATASAN_MARKETING'].includes(session.role)) return res.status(403).json({ error: 'Forbidden' });

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const pengajuan = await prisma.pengajuanKredit.findUnique({
      where: { id: pengajuanId },
      include: {
        dataKonsumen: true,
        dataKendaraan: true,
        dataPinjaman: true,
        dokumen: true,
        histori: { orderBy: { timestamp: 'desc' } },
        salesDealer: { select: { id: true, username: true, nama_sales: true, nama_dealer: true } },
      },
    });

    if (!pengajuan) return res.status(404).json({ error: 'Pengajuan not found' });

    return res.status(200).json({ ok: true, data: pengajuan });
  } catch (err: any) {
    console.error('Fetch pengajuan detail error', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}

export default withAuth(handler, ['MARKETING', 'ATASAN_MARKETING']);
