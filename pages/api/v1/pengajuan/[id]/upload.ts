import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../../../../src/middleware';
import { PrismaClient } from '@prisma/client';
import formidable, { File as FormidableFile } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient();

async function handler(req: NextApiRequest & { session?: any }, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = req.session;
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (session.role !== 'SALES') return res.status(403).json({ error: 'Forbidden' });

  const { id } = req.query;
  const pengajuanId = String(id ?? '');
  if (!pengajuanId) return res.status(400).json({ error: 'Missing pengajuan id' });

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({ multiples: true, uploadDir, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error', err);
      return res.status(500).json({ error: 'Upload error' });
    }

    // files can be single or multiple; normalize to array
    const fileList: FormidableFile[] = [];
    for (const key of Object.keys(files || {})) {
      const f = (files as any)[key];
      if (Array.isArray(f)) fileList.push(...f);
      else fileList.push(f as FormidableFile);
    }

    try {
      const createdDocs = [] as any[];
      for (const f of fileList) {
        const filename = path.basename(f.filepath || (f as any).path || f.newFilename || f.originalFilename);
        const publicPath = `/uploads/${filename}`;

        // create dokumen record
        const jenis = (fields.jenisDokumen as any) ?? 'UNKNOWN';
        const doc = await prisma.dokumen.create({
          data: {
            pengajuanId,
            jenisDokumen: String(jenis),
            urlFile: publicPath,
          },
        });
        createdDocs.push(doc);
      }

      return res.status(201).json({ ok: true, docs: createdDocs });
    } catch (e: any) {
      console.error('Save dokumen error', e);
      return res.status(500).json({ error: 'Failed to save document metadata' });
    }
  });
}

export default withAuth(handler, ['SALES']);
