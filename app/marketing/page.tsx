'use client';

import { useEffect, useState } from 'react';

export default function MarketingPage() {
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
      const r = await fetch('/api/v1/pengajuan/tugas', { headers: authHeaders() });
      const j = await r.json();
      if (r.ok) setTugas(j.data || []);
      else console.error(j);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function tindakan(id: string, action: string) {
    const r = await fetch('/api/v1/pengajuan/' + id + '/tindakan', {
      method: 'PUT',
      headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
      body: JSON.stringify({ tindakan: action, catatan: 'UI action ' + action }),
    });
    const j = await r.json();
    if (r.ok) alert('Done');
    else alert('Error: ' + (j.error || j.details));
    fetchTugas();
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <h1>Marketing / Atasan Tasks</h1>
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
                <button onClick={() => tindakan(t.id, 'SETUJU')}>Setuju</button>
                <button onClick={() => tindakan(t.id, 'REVISI')} style={{ marginLeft: 8 }}>
                  Revisi
                </button>
                <button onClick={() => tindakan(t.id, 'TOLAK')} style={{ marginLeft: 8 }}>
                  Tolak
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
