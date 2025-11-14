import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/src/middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest & { session?: any }, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = req.session;
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (session.role !== 'SALES') return res.status(403).json({ error: 'Forbidden' });

  try {
    const body = req.body;

    // Expect body to contain: dataKonsumen, dataKendaraan, dataPinjaman
    const { dataKonsumen, dataKendaraan, dataPinjaman } = body;
    if (!dataKonsumen || !dataKendaraan || !dataPinjaman) {
      return res.status(400).json({ error: 'Missing dataKonsumen / dataKendaraan / dataPinjaman' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1) create PengajuanKredit first
      const pengajuan = await tx.pengajuanKredit.create({
        data: {
          salesDealerId: session.userId,
        },
      });

      // 2) create DataKonsumen
      await tx.dataKonsumen.create({
        data: {
          pengajuanId: pengajuan.id,
          nama: dataKonsumen.nama,
          nik: dataKonsumen.nik,
          tanggalLahir: new Date(dataKonsumen.tanggalLahir),
          statusPerkawinan: dataKonsumen.statusPerkawinan ?? '',
          dataPasangan: dataKonsumen.dataPasangan ?? null,
        },
      });

      // 3) create DataKendaraan
      await tx.dataKendaraan.create({
        data: {
          pengajuanId: pengajuan.id,
          dealer: dataKendaraan.dealer,
          merkKendaraan: dataKendaraan.merkKendaraan,
          modelKendaraan: dataKendaraan.modelKendaraan,
          tipeKendaraan: dataKendaraan.tipeKendaraan,
          warnaKendaraan: dataKendaraan.warnaKendaraan,
          hargaKendaraan: Number(dataKendaraan.hargaKendaraan),
        },
      });

      // 4) create DataPinjaman
      await tx.dataPinjaman.create({
        data: {
          pengajuanId: pengajuan.id,
          asuransi: dataPinjaman.asuransi ?? '',
          downPayment: Number(dataPinjaman.downPayment ?? 0),
          lamaKreditBulan: Number(dataPinjaman.lamaKreditBulan ?? 0),
          angsuranBulanan: Number(dataPinjaman.angsuranBulanan ?? 0),
        },
      });

      // 5) create HistoriApproval entry
      await tx.historiApproval.create({
        data: {
          pengajuanId: pengajuan.id,
          statusDari: '',
          statusKe: 'BARU_DISUBMIT_SALES',
          catatan: 'Pengajuan dibuat oleh Sales',
          olehUser: session.userId,
        },
      });

      return pengajuan;
    });

    return res.status(201).json({ ok: true, pengajuanId: result.id });
  } catch (err: any) {
    console.error('Submit pengajuan error', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}

export default withAuth(handler, ['SALES']);
