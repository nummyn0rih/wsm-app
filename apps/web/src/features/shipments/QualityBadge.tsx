import type { ShipmentItem } from '../../lib/types';
import { fmtKg } from '../../components/ui';

// 4 состояния (прототип): none 📊 / data 📊✓ / pdf 📎 / both 📊✓📎. Клик → модалка приёмки.
export function QualityBadge({ item, onClick }: { item: ShipmentItem; onClick: () => void }) {
  const q = item.quality;
  const hasData = !!q?.hasData;
  const hasPdf = !!q?.hasPdf;
  const state = hasData && hasPdf ? 'both' : hasData ? 'data' : hasPdf ? 'pdf' : 'none';

  const tip = hasData && q
    ? `К оплате: ${fmtKg(q.payableKg)} кг (${q.payablePct}%) · Брак: ${fmtKg(q.rejectKg)} · Нестандарт: ${fmtKg(q.nonStdKg)}${hasPdf ? ' · PDF прикреплён' : ''}`
    : hasPdf
      ? 'Прикреплён PDF акта · данные качества ещё не внесены'
      : 'Данные качества не внесены, PDF не прикреплён · клик — открыть форму';

  const palette = {
    none: { bg: '#ececec', border: '#999', fg: '#666' },
    data: { bg: '#e4f1e0', border: 'var(--accent)', fg: 'var(--accent)' },
    pdf: { bg: '#e0ebf6', border: '#1a4a8a', fg: '#1a4a8a' },
    both: { bg: '#e4f1e0', border: 'var(--accent)', fg: 'var(--accent)' },
  }[state];

  return (
    <button
      title={tip}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 1, lineHeight: 1,
        padding: '1px 5px', height: 18, borderRadius: 9,
        background: palette.bg, border: `1.2px solid ${palette.border}`, color: palette.fg,
        cursor: 'pointer', flexShrink: 0,
      }}
    >
      {(state === 'none' || state === 'data' || state === 'both') && <span style={{ fontSize: 11 }}>📊</span>}
      {(state === 'data' || state === 'both') && <span style={{ fontWeight: 700, fontSize: 10 }}>✓</span>}
      {(state === 'pdf' || state === 'both') && <span style={{ fontSize: 11, marginLeft: state === 'both' ? 1 : 0 }}>📎</span>}
    </button>
  );
}
