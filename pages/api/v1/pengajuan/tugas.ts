import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/src/middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest & { session?: any }, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const session = req.session;
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (!['MARKETING', 'ATASAN_MARKETING'].includes(session.role)) return res.status(403).json({ error: 'Forbidden' });

  try {
    const statusToFetch = session.role === 'MARKETING' ? 'BARU_DISUBMIT_SALES' : 'DIVERIFIKASI_MK';

    const pengajuans = await prisma.pengajuanKredit.findMany({
      where: { status: statusToFetch },
      orderBy: { createdAt: 'asc' },
      include: {
        dataKonsumen: true,
        dataKendaraan: true,
        dataPinjaman: true,
        dokumen: true,
        histori: { orderBy: { timestamp: 'desc' } },
        salesDealer: { select: { id: true, username: true, nama_sales: true, nama_dealer: true } },
      },
    });

    return res.status(200).json({ ok: true, data: pengajuans });
  } catch (err: any) {
    console.error('Fetch tugas error', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}

export default withAuth(handler, ['MARKETING', 'ATASAN_MARKETING']);
