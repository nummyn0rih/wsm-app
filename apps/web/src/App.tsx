import { useState } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { LoginPage } from './features/auth/LoginPage';
import { ShipmentsPage } from './features/shipments/ShipmentsPage';
import { ReferencesPage } from './features/references/ReferencesPage';
import { OfflineIndicator, Spinner } from './components/ui';

const ROLE_LABEL: Record<string, string> = { ADMIN: '👑 Админ', OPERATOR: '🛠 Оператор', USER: '👁 Пользователь', MANAGER: '📊 Руководитель' };

// MVP-доступные разделы + заглушки будущих (disabled).
const NAV = [
  { to: '/', icon: '📋', label: 'Отгрузки' },
  { to: '/references', icon: '📚', label: 'Справочники' },
];
const FUTURE = ['📦 Логистика', '📄 Контракты', '📊 Аналитика', '🔔 Уведомления', '⚙ Настройки'];

export function App() {
  const { user, loading, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (loading) return <Spinner />;
  if (!user) return <LoginPage />;

  return (
    <div className="app">
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="brand">{collapsed ? 'W' : 'WSM'}</div>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span>{n.icon}</span>{!collapsed && <span>{n.label}</span>}
          </NavLink>
        ))}
        {!collapsed && <div style={{ padding: '12px 10px 4px', fontSize: 11, opacity: .5 }}>СКОРО</div>}
        {!collapsed && FUTURE.map((f) => (
          <span key={f} className="nav-item disabled" title="Следующая итерация">{f}</span>
        ))}
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="btn sm" onClick={() => setCollapsed((c) => !c)}>☰</button>
          <strong>Учёт отгрузок овощного сырья</strong>
          <span className="spacer" />
          <OfflineIndicator />
          <span className="chip" style={{ background: 'var(--surface-2)' }}>{ROLE_LABEL[user.role]}</span>
          <span className="muted">{user.name}</span>
          <button className="btn sm" onClick={() => void logout()}>Выйти</button>
        </header>
        <main className="content">
          <Routes>
            <Route path="/" element={<ShipmentsPage />} />
            <Route path="/references" element={<ReferencesPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
