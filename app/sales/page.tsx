'use client';

import { useEffect, useState } from 'react';

type Pengajuan = any;

export default function SalesDashboard() {
  const [pengajuans, setPengajuans] = useState<Pengajuan[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({
    dataKonsumen: { nama: '', nik: '', tanggalLahir: '', statusPerkawinan: '' },
    dataKendaraan: { dealer: '', merkKendaraan: '', modelKendaraan: '', tipeKendaraan: '', warnaKendaraan: '', hargaKendaraan: 0 },
    dataPinjaman: { asuransi: '', downPayment: 0, lamaKreditBulan: 12, angsuranBulanan: 0 },
  });

  function authHeaders(): HeadersInit {
    const t = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (t) headers.Authorization = 'Bearer ' + t;
    return headers;
  }

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    setLoading(true);
    try {
      const r = await fetch('/api/v1/pengajuan/saya', { headers: authHeaders() });
      const j = await r.json();
      if (r.ok) setPengajuans(j.data || []);
      else console.error(j);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function submit(e: any) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch('/api/v1/pengajuan', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()), body: JSON.stringify(form) });
      const j = await r.json();
      if (r.ok) {
        setShowForm(false);
        fetchList();
        alert('Pengajuan submitted: ' + j.pengajuanId);
      } else {
        alert('Error: ' + (j.error || 'unknown'));
      }
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  }

  async function uploadFiles(id: string, input: HTMLInputElement) {
    const files = input.files;
    if (!files || files.length === 0) return alert('Choose files');
    const fd = new FormData();
    for (const f of Array.from(files)) fd.append('file', f as File, (f as File).name);
    fd.append('jenisDokumen', 'KTP');
    const r = await fetch('/api/v1/pengajuan/' + id + '/upload', { method: 'POST', headers: authHeaders(), body: fd });
    const j = await r.json();
    if (r.ok) {
      alert('Uploaded');
      fetchList();
    } else alert('Upload error: ' + (j.error || j.details));
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <h1>Sales Dashboard</h1>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close Form' : 'New Pengajuan'}</button>
        <button onClick={fetchList} style={{ marginLeft: 8 }}>
          Refresh
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12 }}>
          <h3>Data Konsumen</h3>
          <input placeholder="Nama" value={form.dataKonsumen.nama} onChange={(e) => setForm({ ...form, dataKonsumen: { ...form.dataKonsumen, nama: e.target.value } })} />
          <input placeholder="NIK" value={form.dataKonsumen.nik} onChange={(e) => setForm({ ...form, dataKonsumen: { ...form.dataKonsumen, nik: e.target.value } })} />
          <input placeholder="Tanggal Lahir (YYYY-MM-DD)" value={form.dataKonsumen.tanggalLahir} onChange={(e) => setForm({ ...form, dataKonsumen: { ...form.dataKonsumen, tanggalLahir: e.target.value } })} />

          <h3>Data Kendaraan</h3>
          <input placeholder="Dealer" value={form.dataKendaraan.dealer} onChange={(e) => setForm({ ...form, dataKendaraan: { ...form.dataKendaraan, dealer: e.target.value } })} />
          <input placeholder="Merk" value={form.dataKendaraan.merkKendaraan} onChange={(e) => setForm({ ...form, dataKendaraan: { ...form.dataKendaraan, merkKendaraan: e.target.value } })} />
          <input placeholder="Model" value={form.dataKendaraan.modelKendaraan} onChange={(e) => setForm({ ...form, dataKendaraan: { ...form.dataKendaraan, modelKendaraan: e.target.value } })} />
          <input placeholder="Harga" type="number" value={form.dataKendaraan.hargaKendaraan} onChange={(e) => setForm({ ...form, dataKendaraan: { ...form.dataKendaraan, hargaKendaraan: Number(e.target.value) } })} />

          <h3>Data Pinjaman</h3>
          <input placeholder="Asuransi" value={form.dataPinjaman.asuransi} onChange={(e) => setForm({ ...form, dataPinjaman: { ...form.dataPinjaman, asuransi: e.target.value } })} />
          <input placeholder="Down Payment" type="number" value={form.dataPinjaman.downPayment} onChange={(e) => setForm({ ...form, dataPinjaman: { ...form.dataPinjaman, downPayment: Number(e.target.value) } })} />

          <div style={{ marginTop: 8 }}>
            <button type="submit">Submit</button>
          </div>
        </form>
      )}

      <h2>My Pengajuan</h2>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <div>
          {pengajuans.map((p) => (
            <div key={p.id} style={{ border: '1px solid #eee', padding: 10, marginBottom: 8 }}>
              <div>
                <strong>ID:</strong> {p.id}
              </div>
              <div>
                <strong>Status:</strong> {p.status}
              </div>
              <div>
                <strong>Created:</strong> {new Date(p.createdAt).toLocaleString()}
              </div>
              <div style={{ marginTop: 6 }}>
                <input
                  type="file"
                  ref={(el) => {
                    (p as any)._fileInput = el;
                  }}
                />
                <button onClick={() => uploadFiles(p.id, (p as any)._fileInput)}>Upload</button>
                <button
                  style={{ marginLeft: 8 }}
                  onClick={() => {
                    navigator.clipboard.writeText(p.id);
                    alert('Copied id');
                  }}
                >
                  Copy ID
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
