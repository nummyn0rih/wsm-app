import { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@wsm.local');
  const [password, setPassword] = useState('wsm12345');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login(email, password);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Ошибка входа');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="center">
      <form className="card" style={{ padding: 24, width: 340, display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={submit}>
        <div style={{ fontWeight: 700, fontSize: 20 }}>WSM · вход</div>
        <div className="field">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        </div>
        <div className="field">
          <label>Пароль</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        {err && <div className="error">{err}</div>}
        <button className="btn primary" disabled={busy}>{busy ? 'Вход…' : 'Войти'}</button>
        <div className="muted" style={{ fontSize: 12 }}>
          demo: admin / operator / user @wsm.local · пароль <span className="mono">wsm12345</span>
        </div>
      </form>
    </div>
  );
}
