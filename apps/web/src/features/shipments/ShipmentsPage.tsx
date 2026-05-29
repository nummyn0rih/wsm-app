import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { STATUS_ORDER, STATUS_LABEL, type ShipmentStatus } from '@wsm/shared';
import { api } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';
import { StatusChip, RawPill, Spinner, fmtKg } from '../../components/ui';
import type { Driver, Shipment, ShipmentItem, WeekPlanResponse } from '../../lib/types';
import { DOW_LABELS, dayDate, dowOf, fmtDay, isoWeekOf, weekMonday } from '../../lib/week';
import { DriverModal, QualityModal, ShipmentFormModal } from './modals';
import { QualityBadge } from './QualityBadge';

type Mode = 'table' | 'heatmap' | 'plan';

export function ShipmentsPage() {
  const { can } = useAuth();
  const [mode, setMode] = useState<Mode>(() => (sessionStorage.getItem('wsm.mode') as Mode) || 'table');
  // default to seeded demo week (17/2025) so data is visible out of the box
  const [{ year, week }, setWeek] = useState(() => ({ year: 2025, week: 17 }));
  const [driverCard, setDriverCard] = useState<Driver | null>(null);
  const [quality, setQuality] = useState<ShipmentItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  const setModePersist = (m: Mode) => { setMode(m); sessionStorage.setItem('wsm.mode', m); };
  const shiftWeek = (delta: number) => {
    const m = weekMonday(year, week);
    m.setUTCDate(m.getUTCDate() + delta * 7);
    setWeek(isoWeekOf(m));
  };
  const monday = weekMonday(year, week);
  const rangeLabel = `${fmtDay(monday)} – ${fmtDay(dayDate(year, week, 6))}`;

  return (
    <div className="col" style={{ gap: 12 }}>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        {can('shipments:write') && <button className="btn primary" onClick={() => setShowForm(true)}>＋ Отгрузка</button>}
        <div className="row" style={{ marginLeft: 8 }}>
          <button className="btn sm" onClick={() => shiftWeek(-1)}>←</button>
          <button className="btn sm" onClick={() => setWeek(isoWeekOf(new Date()))}>сегодня</button>
          <button className="btn sm" onClick={() => shiftWeek(1)}>→</button>
          <strong style={{ marginLeft: 6 }}>Неделя {week} · {year}</strong>
          <span className="muted">{rangeLabel}</span>
        </div>
        <span className="spacer" />
        <div className="seg">
          <button className={mode === 'table' ? 'on' : ''} onClick={() => setModePersist('table')}>▤ Таблица</button>
          <button className={mode === 'heatmap' ? 'on' : ''} onClick={() => setModePersist('heatmap')}>▦ Heatmap</button>
          <button className={mode === 'plan' ? 'on' : ''} onClick={() => setModePersist('plan')}>◫ План</button>
        </div>
      </div>

      {mode === 'table' && <TableView year={year} week={week} onDriver={setDriverCard} onQuality={setQuality} />}
      {mode === 'heatmap' && <HeatmapView year={year} week={week} />}
      {mode === 'plan' && <PlanView year={year} week={week} />}

      {driverCard && <DriverModal driver={driverCard} onClose={() => setDriverCard(null)} />}
      {quality && <QualityModal item={quality} canEdit={can('quality:write')} onClose={() => setQuality(null)} />}
      {showForm && <ShipmentFormModal onClose={() => setShowForm(false)} />}
    </div>
  );
}

function useShipments(year: number, week: number) {
  return useQuery({
    queryKey: ['shipments', year, week],
    queryFn: () => api.get<Shipment[]>(`/shipments?year=${year}&week=${week}`),
  });
}

/* ─────────── TABLE ─────────── */
function TableView({ year, week, onDriver, onQuality }: { year: number; week: number; onDriver: (d: Driver) => void; onQuality: (i: ShipmentItem) => void }) {
  const { can } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading } = useShipments(year, week);
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'all'>('all');

  const changeStatus = useMutation({
    mutationFn: ({ id, to }: { id: string; to: ShipmentStatus }) => api.patch(`/shipments/${id}/status`, { to }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shipments'] }),
    onError: (e) => alert(e instanceof Error ? e.message : 'Ошибка'),
  });

  const byDay = useMemo(() => {
    const map = new Map<string, Shipment[]>();
    for (const s of data ?? []) {
      if (statusFilter !== 'all' && s.status !== statusFilter) continue;
      const key = s.arrDate.slice(0, 10);
      (map.get(key) ?? map.set(key, []).get(key)!).push(s);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [data, statusFilter]);

  if (isLoading) return <Spinner />;
  if (!data?.length) return <div className="banner">Нет отгрузок за эту неделю.</div>;

  const nextStatus = (s: ShipmentStatus): ShipmentStatus | null => {
    const i = STATUS_ORDER.indexOf(s);
    return i < STATUS_ORDER.length - 1 ? STATUS_ORDER[i + 1]! : null;
  };

  return (
    <div className="col" style={{ gap: 10 }}>
      <div className="row">
        <span className="muted">Статус:</span>
        {(['all', ...STATUS_ORDER] as const).map((s) => (
          <button key={s} className={`btn sm ${statusFilter === s ? 'primary' : ''}`} onClick={() => setStatusFilter(s)}>
            {s === 'all' ? 'все' : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {byDay.map(([day, ships]) => {
        const total = ships.reduce((sum, s) => sum + s.items.reduce((a, it) => a + Number(it.kg), 0), 0);
        return (
          <div className="card" key={day} style={{ overflow: 'hidden' }}>
            <div className="row" style={{ background: 'var(--surface-2)', padding: '6px 12px', fontWeight: 600 }}>
              <span>{fmtDay(new Date(day))}</span><span className="spacer" />
              <span className="muted">{ships.length} маш · Σ {fmtKg(total)} кг</span>
            </div>
            {ships.map((s) => {
              const next = nextStatus(s.status);
              const canAdvance = next && (next === 'SHIPPED' ? can('shipments:write') : can('shipments:markArrived'));
              return (
                <div key={s.id} className={`col ${s.status === 'PLANNED' ? 'striped' : ''}`} style={{ borderTop: '1px solid var(--border)', padding: '6px 12px', gap: 4 }}>
                  <div className="row" style={{ flexWrap: 'wrap' }}>
                    <StatusChip status={s.status} />
                    <span className="muted">{s.shipDate ? fmtDay(new Date(s.shipDate)) : '—'} →</span>
                    <b>{fmtDay(new Date(s.arrDate))}</b>
                    {s.driver
                      ? <button className="btn sm" onClick={() => onDriver(s.driver!)}>🚚 {s.driver.fio}{s.carrier ? ` · ${s.carrier.name}` : ''}</button>
                      : <span className="muted">🕒 водитель не назначен</span>}
                    {s.comment && <span className="muted">💬 {s.comment}</span>}
                    <span className="spacer" />
                    {canAdvance && next && (
                      <button className="btn sm" onClick={() => changeStatus.mutate({ id: s.id, to: next })}>→ {STATUS_LABEL[next]}</button>
                    )}
                  </div>
                  {s.items.map((it) => (
                    <div className="row" key={it.id} style={{ flexWrap: 'wrap', paddingLeft: 8 }}>
                      <RawPill raw={it.rawMaterial} />
                      <span className="mono">{fmtKg(it.kg)} кг</span>
                      <span className="muted">{it.supplier.name}</span>
                      {it.taraType && <span className="pill">{it.taraType.name}{it.taraCount ? ` ×${it.taraCount}` : ''}</span>}
                      {it.processed && <span className="mono muted">№ {it.actNumber}</span>}
                      {it.processed && <QualityBadge item={it} onClick={() => onQuality(it)} />}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────── HEATMAP (raw × day) ─────────── */
function HeatmapView({ year, week }: { year: number; week: number }) {
  const { data, isLoading } = useShipments(year, week);
  const monday = weekMonday(year, week);

  const { matrix, raws, max } = useMemo(() => {
    const m: Record<string, { name: string; colorBg: string; colorDot: string; days: number[] }> = {};
    let mx = 0;
    for (const s of data ?? []) {
      const dow = dowOf(s.arrDate, monday);
      if (!dow) continue;
      for (const it of s.items) {
        const r = (m[it.rawMaterialId] ??= { name: it.rawMaterial.name, colorBg: it.rawMaterial.colorBg, colorDot: it.rawMaterial.colorDot, days: [0, 0, 0, 0, 0, 0] });
        r.days[dow - 1]! += Number(it.kg);
        mx = Math.max(mx, r.days[dow - 1]!);
      }
    }
    return { matrix: m, raws: Object.values(m), max: mx };
  }, [data, monday]);

  if (isLoading) return <Spinner />;
  if (!raws.length) return <div className="banner">Нет данных для heatmap за эту неделю.</div>;

  return (
    <div className="card" style={{ overflow: 'auto' }}>
      <table className="tbl">
        <thead><tr><th>Сырьё</th>{DOW_LABELS.map((d) => <th key={d}>{d}</th>)}<th>Σ</th></tr></thead>
        <tbody>
          {raws.map((r) => {
            const sum = r.days.reduce((a, b) => a + b, 0);
            return (
              <tr key={r.name}>
                <td><RawPill raw={r} /></td>
                {r.days.map((v, i) => (
                  <td key={i} style={{ background: v ? `${r.colorDot}${Math.round((v / max) * 90 + 10).toString(16).padStart(2, '0')}` : undefined, textAlign: 'right' }} className="mono">
                    {v ? fmtKg(v) : ''}
                  </td>
                ))}
                <td className="mono" style={{ fontWeight: 700, textAlign: 'right' }}>{fmtKg(sum)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────── PLAN (week grid) ─────────── */
function PlanView({ year, week }: { year: number; week: number }) {
  const { can } = useAuth();
  const qc = useQueryClient();
  const editable = can('plan:write');
  const { data, isLoading } = useQuery({ queryKey: ['week-plan', year, week], queryFn: () => api.get<WeekPlanResponse>(`/week-plan?year=${year}&week=${week}`) });
  const [draft, setDraft] = useState<Record<string, number>>({});

  const save = useMutation({
    mutationFn: (cells: { rawMaterialId: string; dayOfWeek: number; planKg: number }[]) => api.patch('/week-plan', { year, week, cells }),
    onSuccess: () => { setDraft({}); qc.invalidateQueries({ queryKey: ['week-plan', year, week] }); },
  });

  if (isLoading || !data) return <Spinner />;

  const cellKey = (raw: string, dow: number) => `${raw}:${dow}`;
  const planOf = (raw: string, dow: number) => {
    const k = cellKey(raw, dow);
    if (k in draft) return draft[k]!;
    return data.cells.find((c) => c.rawMaterialId === raw && c.dayOfWeek === dow)?.planKg ?? 0;
  };
  const factOf = (raw: string, dow: number) => data.fact[raw]?.[dow] ?? 0;
  const visible = (raw: string) => data.visibility.find((v) => v.rawMaterialId === raw)?.visible ?? true;
  const raws = data.raws.filter((r) => visible(r.id));

  const cellColor = (plan: number, fact: number) => {
    if (plan === 0 && fact === 0) return undefined;
    if (plan === 0 && fact > 0) return '#ffe0b8'; // незапланированное поступление
    const pct = (fact / plan) * 100;
    if (pct < 80) return '#fde2e2';
    if (pct <= 100) return '#fff3cd';
    if (pct <= 120) return '#d6ecd9';
    return '#ffd9a8';
  };

  const dirtyCells = Object.entries(draft).map(([k, planKg]) => {
    const [rawMaterialId, dow] = k.split(':');
    return { rawMaterialId: rawMaterialId!, dayOfWeek: Number(dow), planKg };
  });

  return (
    <div className="col" style={{ gap: 8 }}>
      {editable && dirtyCells.length > 0 && (
        <div className="row"><span className="muted">Изменено ячеек: {dirtyCells.length}</span>
          <button className="btn primary sm" disabled={save.isPending} onClick={() => save.mutate(dirtyCells)}>Сохранить план</button>
          <button className="btn sm" onClick={() => setDraft({})}>Отмена</button>
        </div>
      )}
      <div className="card" style={{ overflow: 'auto' }}>
        <table className="tbl">
          <thead><tr><th>Сырьё</th>{DOW_LABELS.map((d, i) => <th key={d}>{d}<br /><span className="muted" style={{ fontWeight: 400 }}>{fmtDay(dayDate(year, week, i + 1))}</span></th>)}<th>Σ план</th></tr></thead>
          <tbody>
            {raws.map((r) => {
              let rowPlan = 0;
              return (
                <tr key={r.id}>
                  <td><RawPill raw={r} /></td>
                  {[1, 2, 3, 4, 5, 6].map((dow) => {
                    const plan = planOf(r.id, dow); const fact = factOf(r.id, dow); rowPlan += plan;
                    const pct = plan > 0 ? Math.round((fact / plan) * 100) : fact > 0 ? 999 : 0;
                    return (
                      <td key={dow} style={{ background: cellColor(plan, fact), minWidth: 92 }}>
                        <div className="col" style={{ gap: 2 }}>
                          <div className="row" style={{ gap: 4 }}>
                            <span className="muted" style={{ fontSize: 11 }}>план</span>
                            {editable
                              ? <input type="number" value={plan || ''} onChange={(e) => setDraft({ ...draft, [cellKey(r.id, dow)]: Number(e.target.value) })} style={{ width: 64, padding: '2px 4px' }} />
                              : <span className="mono">{fmtKg(plan)}</span>}
                          </div>
                          <div className="mono" style={{ fontSize: 12 }}>факт {fmtKg(fact)} · {pct === 999 ? '∞' : `${pct}%`}</div>
                        </div>
                      </td>
                    );
                  })}
                  <td className="mono" style={{ fontWeight: 700, textAlign: 'right' }}>{fmtKg(rowPlan)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="banner">Цвет ячейки: серый — нет плана/факта · красный &lt;80% · жёлтый ≤100% · зелёный ≤120% · оранжевый &gt;120% или поступление без плана.</div>
    </div>
  );
}
