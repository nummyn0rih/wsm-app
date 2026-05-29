import type { ShipmentItem } from '../../lib/types';
import { fmtKg } from '../../components/ui';

// 4 states: none / data / pdf / both — same semantics as prototype.
export function QualityBadge({ item, onClick }: { item: ShipmentItem; onClick: () => void }) {
  const q = item.quality;
  const hasData = !!q?.hasData;
  const hasPdf = !!q?.hasPdf;
  const tip = hasData && q
    ? `К оплате: ${fmtKg(q.payableKg)} кг (${q.payablePct}%) · Брак: ${fmtKg(q.rejectKg)} · Нестандарт: ${fmtKg(q.nonStdKg)}`
    : hasPdf ? 'Прикреплён PDF, данные не внесены' : 'Данные качества не внесены';
  const color = hasData ? 'var(--accent)' : hasPdf ? '#1a4a8a' : '#888';
  const bg = hasData ? '#e4f1e0' : hasPdf ? '#e0ebf6' : '#ececec';
  return (
    <button title={tip} onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{ border: `1px solid ${color}`, background: bg, color, borderRadius: 9, padding: '0 6px', fontSize: 12, lineHeight: '18px' }}>
      📊{hasData ? '✓' : ''}{hasPdf ? '📎' : ''}
    </button>
  );
}
