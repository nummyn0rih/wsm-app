import type { ReactNode } from 'react';
import { STATUS_LABEL, type ShipmentStatus } from '@wsm/shared';
import type { RawMaterial } from '../lib/types';
import { useOnline } from '../lib/network';

// 3 статуса (прототип): ◷ Заплан. / ✓ Отпр. / ⚑ Прибыло. Fallback на неизвестный (урок chat15).
const STATUS_CHIP: Record<string, { icon: string; short: string }> = {
  PLANNED: { icon: '◷', short: 'Заплан.' },
  SHIPPED: { icon: '✓', short: 'Отпр.' },
  ARRIVED: { icon: '⚑', short: 'Прибыло' },
};

export function StatusChip({ status }: { status: ShipmentStatus }) {
  const meta = STATUS_CHIP[status] ?? { icon: '•', short: STATUS_LABEL[status] ?? String(status) };
  return <span className={`chip st-${status}`}>{meta.icon} {meta.short}</span>;
}

export function RawPill({ raw, children }: { raw: Pick<RawMaterial, 'name' | 'colorBg' | 'colorDot'>; children?: ReactNode }) {
  return (
    <span className="pill" style={{ background: raw.colorBg }}>
      <span className="dot" style={{ background: raw.colorDot }} />
      {raw.name}{children}
    </span>
  );
}

export function fmtKg(v: string | number): string {
  return Number(v).toLocaleString('ru-RU');
}

export function OfflineIndicator() {
  const online = useOnline();
  return (
    <span className="chip" style={{ background: online ? 'var(--st-shipped-bg)' : '#fde2e2', color: online ? 'var(--accent)' : '#b3261e' }}>
      {online ? '● в сети' : '⚠ офлайн · только просмотр'}
    </span>
  );
}

export function Modal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header>
          <span>{title}</span>
          <span className="spacer" />
          <button className="btn sm" onClick={onClose}>✕</button>
        </header>
        <div className="body">{children}</div>
        {footer && <footer>{footer}</footer>}
      </div>
    </div>
  );
}

export function Spinner({ label = 'Загрузка…' }: { label?: string }) {
  return <div className="center muted">{label}</div>;
}
