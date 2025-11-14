'use client';

import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [tugas, setTugas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  function authHeaders(): HeadersInit {
    const t = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (t) headers.Authorization = 'Bearer ' + t;
    return headers;
  }

  useEffect(() => {
    fetchTugas();
  }, []);

  async function fetchTugas() {
    setLoading(true);
    try {
      const r = await fetch('/api/v1/admin/tugas', { headers: authHeaders() });
      const j = await r.json();
      if (r.ok) setTugas(j.data || []);
      else console.error(j);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function kirim(id: string) {
    const r = await fetch('/api/v1/admin/pengajuan/' + id + '/kirim-dokumen', { method: 'POST', headers: authHeaders() });
    const j = await r.json();
    if (r.ok) alert('Sent to TTE');
    else alert('Error: ' + (j.error || j.details));
    fetchTugas();
  }
  async function cairkan(id: string) {
    const r = await fetch('/api/v1/admin/pengajuan/' + id + '/cairkan', { method: 'POST', headers: authHeaders() });
    const j = await r.json();
    if (r.ok) alert('Cairkan done');
    else alert('Error: ' + (j.error || j.details));
    fetchTugas();
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <h1>Admin Backoffice</h1>
      <button onClick={fetchTugas}>Refresh</button>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <div>
          {tugas.map((t) => (
            <div key={t.id} style={{ border: '1px solid #eee', padding: 10, marginTop: 8 }}>
              <div>
                <strong>ID:</strong> {t.id}
              </div>
              <div>
                <strong>Status:</strong> {t.status}
              </div>
              <div style={{ marginTop: 6 }}>
                <button onClick={() => kirim(t.id)}>Kirim Dokumen</button>
                <button onClick={() => cairkan(t.id)} style={{ marginLeft: 8 }}>
                  Cairkan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
