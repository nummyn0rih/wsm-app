import { useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { LoginPage } from './features/auth/LoginPage';
import { ShipmentsPage } from './features/shipments/ShipmentsPage';
import { ReferencesPage } from './features/references/ReferencesPage';
import { OfflineIndicator, Spinner } from './components/ui';

const ROLE_LABEL: Record<string, string> = { ADMIN: '👑 Админ', OPERATOR: '🛠 Оператор', USER: '👁 Пользователь', MANAGER: '📊 Руководитель' };
const ROLE_HINT: Record<string, string> = {
  ADMIN: '👑 Админу доступно всё',
  OPERATOR: '🛠 Оператору доступны Отгрузки, акты и Справочники',
  USER: '👤 Пользователю доступны только Отгрузки и Водители',
  MANAGER: '📊 Руководителю доступны Отгрузки и Аналитика',
};

// MVP-доступные разделы + заглушки будущих (future → disabled).
interface NavItem { id: string; icon: string; label: string; to?: string; future?: boolean; children?: string[] }
const NAV: NavItem[] = [
  { id: 'shipments', icon: '📋', label: 'Отгрузки', to: '/' },
  { id: 'logistics', icon: '📦', label: 'Логистика материалов', future: true },
  { id: 'contracts', icon: '📄', label: 'Контракты', future: true },
  { id: 'analytics', icon: '📊', label: 'Аналитика', future: true },
  { id: 'notifications', icon: '🔔', label: 'Уведомления', future: true },
  { id: 'refs', icon: '📚', label: 'Справочники', to: '/references', children: ['Сырьё', 'Поставщики', 'ТК', 'Водители', 'Виды тары', 'Ингредиенты', 'Сезоны'] },
  { id: 'settings', icon: '⚙', label: 'Настройки', future: true },
];

function SidebarItem({ icon, label, active, disabled, collapsed, hasChildren, expanded, isChild, onClick }: {
  icon?: string; label: string; active?: boolean; disabled?: boolean; collapsed?: boolean;
  hasChildren?: boolean; expanded?: boolean; isChild?: boolean; onClick?: () => void;
}) {
  const cls = ['nav-item', isChild ? 'nav-child' : '', active ? 'active' : '', disabled ? 'disabled' : ''].filter(Boolean).join(' ');
  return (
    <button type="button" className={cls} disabled={disabled} title={collapsed ? label : (disabled ? 'Следующая итерация' : undefined)} onClick={disabled ? undefined : onClick}>
      {icon && <span className="nav-icon">{icon}</span>}
      {!collapsed && <span className="nav-label">{isChild ? `· ${label}` : label}</span>}
      {!collapsed && hasChildren && <span className="nav-chevron">{expanded ? '▾' : '▸'}</span>}
    </button>
  );
}

export function App() {
  const { user, loading, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ refs: true });
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) return <Spinner />;
  if (!user) return <LoginPage />;

  // Активный раздел определяем по маршруту.
  const activeId = location.pathname.startsWith('/references') ? 'refs' : 'shipments';

  return (
    <div className="shell">
      <header className="topbar">
        <button className="tb-burger" onClick={() => setCollapsed((c) => !c)} title={collapsed ? 'Развернуть меню' : 'Свернуть меню'}>☰</button>
        <strong className="tb-brand">Учёт отгрузок · WSM</strong>
        <OfflineIndicator />
        <span className="spacer" />
        <button className="tb-bell" disabled title="Уведомления — скоро">🔔</button>
        <span className="chip tb-role">{ROLE_LABEL[user.role]}</span>
        <span className="tb-avatar" title={user.name}>{user.name.slice(0, 1).toUpperCase()}</span>
        <button className="btn sm" onClick={() => void logout()}>Выйти</button>
      </header>

      <div className="shell-body">
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-nav">
            {NAV.map((item) => {
              const isActive = activeId === item.id;
              const isExpanded = !!expanded[item.id];
              return (
                <div key={item.id}>
                  <SidebarItem
                    icon={item.icon}
                    label={item.label}
                    active={isActive}
                    disabled={item.future}
                    collapsed={collapsed}
                    hasChildren={!!item.children}
                    expanded={isExpanded}
                    onClick={() => {
                      if (item.children) setExpanded((e) => ({ ...e, [item.id]: !e[item.id] }));
                      if (item.to) navigate(item.to);
                    }}
                  />
                  {!collapsed && item.children && isExpanded && (
                    <div className="nav-children">
                      {item.children.map((ch) => (
                        <SidebarItem key={ch} isChild label={ch} onClick={() => navigate(item.to!)} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {!collapsed && <div className="sidebar-foot">{ROLE_HINT[user.role]}</div>}
        </aside>

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
