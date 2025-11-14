'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SalesLoginPage() {
  const [username, setUsername] = useState('sales_dealer_A');
  const [password, setPassword] = useState('sales123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/sales/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Login failed');
        setLoading(false);
        return;
      }
      // store token
      localStorage.setItem('token', json.token);
      localStorage.setItem('user', JSON.stringify(json.user));
      router.push('/sales');
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h1>Sales Login</h1>
      <form onSubmit={submit}>
        <label>Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging…' : 'Login'}
          </button>
        </div>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </form>
      <p style={{ marginTop: 12, color: '#555' }}>
        Use seeded user <code>sales_dealer_A</code> / <code>sales123</code>.
      </p>
    </div>
  );
}
