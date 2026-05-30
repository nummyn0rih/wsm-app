import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { STATUS_ORDER, STATUS_LABEL, type ShipmentStatus } from '@wsm/shared';
import { api } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';
import { StatusChip, RawPill, Spinner, fmtKg } from '../../components/ui';
import { SkButton, ColorPill } from '../../components/sketch';
import type { Driver, Shipment, ShipmentItem, WeekPlanResponse } from '../../lib/types';
import { DOW_LABELS, dayDate, dowOf, fmtDay, isoWeekOf, weekMonday } from '../../lib/week';
import { DriverModal, QualityModal, ShipmentFormModal } from './modals';
import { QualityBadge } from './QualityBadge';

type Mode = 'table' | 'heatmap' | 'plan';

// Ширины колонок таблицы позиций (как в прототипе VariantA).
const COLS = { meta: 360, bar: 4, raw: 110, weight: 92, supplier: 124, tara: 84, proc: 150, gear: 28 };
const WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const dayLabel = (iso: string) => `${fmtDay(new Date(iso))}, ${WD[new Date(iso).getUTCDay()]}`;
// «Вихров Павел Игоревич» → «Вихров П.И.» (модалка показывает полное ФИО)
const shortFio = (fio: string) => {
  const p = fio.trim().split(/\s+/);
  return p.length < 2 ? fio : `${p[0]} ${p.slice(1).map((w) => w[0] + '.').join('')}`;
};

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
    <div className="col" style={{ gap: 10 }}>
      {/* ── Toolbar ── */}
      <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
        {can('shipments:write') && <SkButton green big onClick={() => setShowForm(true)}>＋ Отгрузка</SkButton>}
        <span className="spacer" />
        <SkButton title="Поиск (скоро)">🔍 Поиск</SkButton>
        <SkButton title="Фильтры (скоро)">⌕ Фильтры</SkButton>
        <SkButton title="Колонки (скоро)">⚙ Колонки</SkButton>
        <SkButton title="Экспорт (скоро)">↓ Excel</SkButton>
        <SkButton title="Печать (скоро)">🖨</SkButton>
        <div className="seg">
          <button className={mode === 'table' ? 'on' : ''} onClick={() => setModePersist('table')}>▤ Таблица</button>
          <button className={mode === 'heatmap' ? 'on' : ''} onClick={() => setModePersist('heatmap')}>▦ Heatmap</button>
          <button className={mode === 'plan' ? 'on' : ''} onClick={() => setModePersist('plan')}>◫ План</button>
        </div>
      </div>

      {/* ── Неделя-навигация (для Heatmap/План; в Таблице — внутри фильтр-бара) ── */}
      {mode !== 'table' && (
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <SkButton onClick={() => shiftWeek(-1)}>←</SkButton>
          <SkButton onClick={() => setWeek(isoWeekOf(new Date()))}>сегодня</SkButton>
          <SkButton onClick={() => shiftWeek(1)}>→</SkButton>
          <strong style={{ marginLeft: 6, fontSize: '1.1em' }}>Неделя {week} · {year}</strong>
          <span className="muted">{rangeLabel}</span>
        </div>
      )}

      {mode === 'table' && <TableView year={year} week={week} onPrev={() => shiftWeek(-1)} onNext={() => shiftWeek(1)} onToday={() => setWeek(isoWeekOf(new Date()))} onDriver={setDriverCard} onQuality={setQuality} />}
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

// Агрегация веса по сырью (для пилюль в итогах дня/недели).
function rawTotals(ships: Shipment[]): { name: string; kg: number; bg: string; dot: string }[] {
  const m = new Map<string, { name: string; kg: number; bg: string; dot: string }>();
  for (const s of ships) for (const it of s.items) {
    const e = m.get(it.rawMaterial.name) ?? { name: it.rawMaterial.name, kg: 0, bg: it.rawMaterial.colorBg, dot: it.rawMaterial.colorDot };
    e.kg += Number(it.kg);
    m.set(it.rawMaterial.name, e);
  }
  return [...m.values()].sort((a, b) => b.kg - a.kg);
}

// Сумма тары по видам (для пилюль «бочка: N · ящик: N» в итоге дня).
function taraTotals(ships: Shipment[]): { name: string; count: number }[] {
  const m = new Map<string, number>();
  for (const s of ships) for (const it of s.items) {
    if (it.taraType && it.taraCount) m.set(it.taraType.name, (m.get(it.taraType.name) ?? 0) + it.taraCount);
  }
  return [...m.entries()].map(([name, count]) => ({ name, count }));
}

/* ─────────── TABLE (аккордеон неделя → день → отгрузка) ─────────── */
function TableView({ year, week, onPrev, onNext, onToday, onDriver, onQuality }: { year: number; week: number; onPrev: () => void; onNext: () => void; onToday: () => void; onDriver: (d: Driver) => void; onQuality: (i: ShipmentItem) => void }) {
  const { can } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading } = useShipments(year, week);
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'all'>('all');
  const [hidePlanned, setHidePlanned] = useState(false);
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set());
  const [weekOpen, setWeekOpen] = useState(true);

  // auto-hide overlay scrollbar (как в прототипе)
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let t: ReturnType<typeof setTimeout>;
    const onScroll = () => { el.classList.add('is-scrolling'); clearTimeout(t); t = setTimeout(() => el.classList.remove('is-scrolling'), 900); };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { clearTimeout(t); el.removeEventListener('scroll', onScroll); };
  }, []);

  const changeStatus = useMutation({
    mutationFn: ({ id, to }: { id: string; to: ShipmentStatus }) => api.patch(`/shipments/${id}/status`, { to }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shipments'] }),
    onError: (e) => alert(e instanceof Error ? e.message : 'Ошибка'),
  });

  const byDay = useMemo(() => {
    const map = new Map<string, Shipment[]>();
    for (const s of data ?? []) {
      if (statusFilter !== 'all' && s.status !== statusFilter) continue;
      if (hidePlanned && s.status === 'PLANNED') continue;
      const key = s.arrDate.slice(0, 10);
      const arr = map.get(key) ?? (map.set(key, []).get(key)!);
      arr.push(s);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [data, statusFilter, hidePlanned]);

  const nextStatus = (s: ShipmentStatus): ShipmentStatus | null => {
    const i = STATUS_ORDER.indexOf(s);
    return i < STATUS_ORDER.length - 1 ? STATUS_ORDER[i + 1]! : null;
  };

  const allShips = byDay.flatMap(([, s]) => s);
  const weekKg = allShips.reduce((sum, s) => sum + s.items.reduce((a, it) => a + Number(it.kg), 0), 0);
  const rangeLabel = `${fmtDay(weekMonday(year, week))} – ${fmtDay(dayDate(year, week, 6))}`;

  return (
    <div className="col" style={{ gap: 8 }}>
      {/* ── Фильтр-бар ── */}
      <div className="row sk-gray" style={{ flexWrap: 'wrap', gap: 6, padding: '6px 8px', border: '1.5px solid #ccc', borderRadius: 3 }}>
        <strong className="muted" style={{ marginRight: 2 }}>Фильтры:</strong>
        <SkButton onClick={onPrev} title="Предыдущая неделя">←</SkButton>
        <SkButton active title="Текущая неделя">📅 {week} нед · {year}</SkButton>
        <SkButton onClick={onNext} title="Следующая неделя">→</SkButton>
        <SkButton onClick={onToday}>сегодня</SkButton>
        <SkButton title="Поставщик (скоро)">🏢 Поставщик: все ▾</SkButton>
        <SkButton title="Сырьё (скоро)">🥒 Сырьё: все ▾</SkButton>
        <span className="muted" style={{ marginLeft: 4 }}>Статус:</span>
        {(['all', ...STATUS_ORDER] as const).map((s) => (
          <SkButton key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
            {s === 'all' ? 'все' : STATUS_LABEL[s]}
          </SkButton>
        ))}
        <SkButton title="Переработка (скоро)">☑ Переработка: все ▾</SkButton>
        <SkButton active={hidePlanned} onClick={() => setHidePlanned((v) => !v)}>
          {hidePlanned ? '☑' : '☐'} Скрыть плановые
        </SkButton>
        <span className="spacer" />
        <button className="btn sm" onClick={() => { setStatusFilter('all'); setHidePlanned(false); }}>очистить</button>
      </div>

      {isLoading ? <Spinner /> : !allShips.length ? (
        <div className="banner">Нет отгрузок за эту неделю.</div>
      ) : (
        <div className="sk-box tbl-dense" style={{ overflow: 'hidden' }}>
          {/* dark column header */}
          <div className="row sk-week" style={{ gap: 0 }}>
            <HCell w={COLS.meta}>Отгр. → Пост. · Водитель · ТК · Статус</HCell>
            <div style={{ width: COLS.bar }} />
            <HCell w={COLS.raw}>Сырьё</HCell>
            <HCell w={COLS.weight}>Вес, кг</HCell>
            <HCell w={COLS.supplier}>Поставщик</HCell>
            <HCell w={COLS.tara}>Тара</HCell>
            <HCell flex>☑ Переработка · № акта</HCell>
            <HCell w={COLS.gear} center>⚙</HCell>
          </div>

          <div ref={scrollRef} className="wsm-scroll" style={{ maxHeight: '62vh', overflowY: 'auto' }}>
            {/* week bar */}
            <div className="row" onClick={() => setWeekOpen((o) => !o)}
              style={{ gap: 8, padding: '6px 10px', background: 'var(--accent)', color: '#fff', cursor: 'pointer', borderBottom: '2px solid #333' }}>
              <span>{weekOpen ? '▾' : '▸'}</span>
              <strong style={{ fontSize: '1.05em' }}>{week} неделя · {rangeLabel}</strong>
              <span className="spacer" />
              <ColorPill bg="#12532c">{byDay.length} дн.</ColorPill>
              <ColorPill bg="#12532c">Σ {fmtKg(weekKg)} кг</ColorPill>
            </div>

            {weekOpen && byDay.map(([day, ships]) => {
              const collapsed = collapsedDays.has(day);
              const dayKg = ships.reduce((sum, s) => sum + s.items.reduce((a, it) => a + Number(it.kg), 0), 0);
              const posCount = ships.reduce((a, s) => a + s.items.length, 0);
              return (
                <div key={day}>
                  {/* day header */}
                  <div className="row sk-day" onClick={() => setCollapsedDays((prev) => { const n = new Set(prev); n.has(day) ? n.delete(day) : n.add(day); return n; })}
                    style={{ gap: 6, padding: '4px 8px 4px 22px', borderBottom: '1px solid #ccc', cursor: 'pointer' }}>
                    <span>{collapsed ? '▸' : '▾'}</span>
                    <strong style={{ color: 'var(--accent)' }}>{dayLabel(day)}</strong>
                    <span className="spacer" />
                    <span className="muted">{ships.length} маш · {posCount} поз · Σ {fmtKg(dayKg)} кг</span>
                  </div>

                  {!collapsed && ships.map((s) => {
                    const next = nextStatus(s.status);
                    const canAdvance = next && (next === 'SHIPPED' ? can('shipments:write') : can('shipments:markArrived'));
                    return (
                      <div key={s.id} className="row" style={{ alignItems: 'stretch', gap: 0, borderBottom: '1.5px solid #c8c8c0', background: s.status === 'PLANNED' ? undefined : '#fff' }}>
                        {/* meta column */}
                        <div className={`col ${s.status === 'PLANNED' ? 'striped' : ''}`} style={{ width: COLS.meta, flexShrink: 0, gap: 2, padding: '5px 10px', borderRight: '1.5px solid #aaa', justifyContent: 'center' }}>
                          <div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
                            <span className="muted">{s.shipDate ? fmtDay(new Date(s.shipDate)) : '—'}</span>
                            <span className="muted">→</span>
                            <b style={{ color: 'var(--accent)' }}>{fmtDay(new Date(s.arrDate))}</b>
                            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {s.driver ? (
                                <>🚚 <button onClick={() => onDriver(s.driver!)} title={`${s.driver.fio} · карточка водителя`}
                                  style={{ border: 'none', background: 'none', color: '#1a4a8a', textDecoration: 'underline dotted', cursor: 'pointer', padding: 0, font: 'inherit' }}>{shortFio(s.driver.fio)}</button>
                                  {s.carrier && <span className="muted"> · {s.carrier.name}</span>}</>
                              ) : <span className="muted" style={{ fontStyle: 'italic' }}>🕒 водитель не назначен</span>}
                            </span>
                            <StatusChip status={s.status} />
                          </div>
                          <div className="row" style={{ gap: 6 }}>
                            {s.comment && <span className="muted" style={{ fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>💬 {s.comment}</span>}
                            <span className="spacer" />
                            {canAdvance && next && (
                              <button className="btn sm" title={`Перевести в «${STATUS_LABEL[next]}»`} onClick={() => changeStatus.mutate({ id: s.id, to: next })}>→ {STATUS_LABEL[next]}</button>
                            )}
                          </div>
                        </div>

                        {/* items column */}
                        <div className="col" style={{ flex: 1, minWidth: 0 }}>
                          {s.items.map((it, i) => (
                            <ItemLine key={it.id} item={it} first={i === 0} onQuality={() => onQuality(it)} />
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* day subtotal */}
                  {!collapsed && (
                    <div className="row sk-subtotal" style={{ flexWrap: 'wrap', gap: 6, padding: '4px 8px 4px 22px', borderBottom: '1px solid #ccc' }}>
                      <strong className="muted">Итого {dayLabel(day)}:</strong>
                      <ColorPill bg="#e8e8a0">Σ {fmtKg(dayKg)} кг</ColorPill>
                      {rawTotals(ships).map((r) => (
                        <ColorPill key={r.name} bg={r.bg} dot={r.dot}>{r.name} {fmtKg(r.kg)}</ColorPill>
                      ))}
                      {taraTotals(ships).map((t) => (
                        <ColorPill key={t.name} bg="#eee">{t.name}: {t.count}</ColorPill>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* week subtotal */}
            {weekOpen && (
              <div className="row" style={{ flexWrap: 'wrap', gap: 8, padding: '6px 12px', background: 'var(--week-total)', borderTop: '2px solid var(--accent)' }}>
                <strong style={{ color: 'var(--accent)' }}>Итого {week} нед.:</strong>
                <ColorPill bg="#b8dcc0">Σ {fmtKg(weekKg)} кг</ColorPill>
                {rawTotals(allShips).map((r) => (
                  <ColorPill key={r.name} bg={r.bg} dot={r.dot}>{r.name} {fmtKg(r.kg)}</ColorPill>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function HCell({ w, flex, center, children }: { w?: number; flex?: boolean; center?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ width: w, flex: flex ? 1 : undefined, flexShrink: w ? 0 : undefined, minWidth: flex ? 110 : undefined, padding: '5px 8px', borderRight: '1px solid #555', fontWeight: 600, textAlign: center ? 'center' : 'left' }}>
      {children}
    </div>
  );
}

// Одна позиция отгрузки — строка-таблица с цветной полосой по сырью.
function ItemLine({ item, first, onQuality }: { item: ShipmentItem; first: boolean; onQuality: () => void }) {
  const raw = item.rawMaterial;
  const deco = item.processed ? 'line-through' : 'none';
  const rowBg = item.processed
    ? 'repeating-linear-gradient(135deg,#ececec,#ececec 4px,#e0e0e0 4px,#e0e0e0 8px)'
    : `${raw.colorBg}55`;
  return (
    <div className="row" style={{ alignItems: 'stretch', gap: 0, background: rowBg, borderTop: first ? 'none' : '1px dashed #c8d0bd', minHeight: 26 }}>
      <div style={{ width: COLS.bar, background: raw.colorDot, flexShrink: 0 }} />
      {/* сырьё */}
      <div className="row" style={{ width: COLS.raw, flexShrink: 0, gap: 5, padding: '2px 6px' }}>
        <span className="dot" style={{ width: 8, height: 8, borderRadius: '50%', background: raw.colorDot, flexShrink: 0 }} />
        <b style={{ textDecoration: deco }}>{raw.name}</b>
      </div>
      {/* вес — инлайн-поле */}
      <div style={{ width: COLS.weight, flexShrink: 0, padding: '2px 6px', borderLeft: '1px solid #ccd', display: 'flex', alignItems: 'center' }}>
        <span className={`sk-input ${item.processed ? 'done' : ''}`} style={{ flex: 1 }}>
          <b className="mono" style={{ textDecoration: deco }}>{fmtKg(item.kg)}</b>
          <span className="spacer" />
          <span className="muted" style={{ fontSize: 11 }}>✎</span>
        </span>
      </div>
      {/* поставщик */}
      <div style={{ width: COLS.supplier, flexShrink: 0, padding: '2px 6px', borderLeft: '1px solid #ccd', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <span style={{ textDecoration: deco, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.supplier.name}</span>
      </div>
      {/* тара */}
      <div style={{ width: COLS.tara, flexShrink: 0, padding: '2px 6px', borderLeft: '1px solid #ccd', display: 'flex', alignItems: 'center' }}>
        {item.taraType ? <span className="pill">{item.taraType.name}{item.taraCount ? `×${item.taraCount}` : ''}</span> : <span className="muted">—</span>}
      </div>
      {/* переработка · № акта · качество */}
      <div className="row" style={{ flex: 1, minWidth: 110, gap: 5, padding: '2px 6px', borderLeft: '1px solid #ccd' }}>
        <span style={{ width: 14, height: 14, border: '1.5px solid #333', borderRadius: 2, background: item.processed ? 'var(--accent)' : '#fff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>
          {item.processed && '✓'}
        </span>
        <span className={`sk-input ${item.processed ? 'done' : ''}`} style={{ flex: 1, borderColor: '#aaa', background: item.processed ? '#e8f0e4' : '#fafafa' }}>
          <span className="mono" style={{ color: item.processed ? 'var(--accent)' : '#bbb' }}>
            {item.processed ? `№ ${item.actNumber ?? '—'}` : '№ акта'}
          </span>
          <span className="spacer" />
          {item.processed && <QualityBadge item={item} onClick={onQuality} />}
        </span>
      </div>
      {/* gear */}
      <div style={{ width: COLS.gear, flexShrink: 0, borderLeft: '1px solid #ccd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>✎</div>
    </div>
  );
}

/* ─────────── HEATMAP (сырьё × дни) — стиль PivotV2 ─────────── */
const RAW_W = 150, TOT_W = 100;

function heatBg(hex: string, v: number, max: number): string {
  if (!v || max <= 0) return '#f8f8f5';
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  const a = (0.25 + 0.75 * (v / max)).toFixed(2);
  return `rgba(${r},${g},${b},${a})`;
}

function HeatmapView({ year, week }: { year: number; week: number }) {
  const { data, isLoading } = useShipments(year, week);
  const monday = weekMonday(year, week);

  const { raws, max } = useMemo(() => {
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
    return { raws: Object.values(m), max: mx };
  }, [data, monday]);

  if (isLoading) return <Spinner />;
  if (!raws.length) return <div className="banner">Нет данных для heatmap за эту неделю.</div>;

  const colTotal = (i: number) => raws.reduce((a, r) => a + r.days[i]!, 0);
  const grand = raws.reduce((a, r) => a + r.days.reduce((x, y) => x + y, 0), 0);
  const range = `${fmtDay(monday)} – ${fmtDay(dayDate(year, week, 6))}`;

  return (
    <div className="col tbl-dense" style={{ gap: 0 }}>
      {/* зелёная шапка недели */}
      <div className="row" style={{ background: 'var(--accent)', color: '#fff', padding: '5px 12px', borderRadius: '3px 3px 0 0' }}>
        <strong style={{ fontSize: '1.05em' }}>{week} неделя · {range}</strong>
        <span className="spacer" />
        <ColorPill bg="var(--accent-dark)">Σ {fmtKg(grand)} кг</ColorPill>
      </div>
      <div className="sk-box" style={{ borderRadius: '0 0 3px 3px', overflow: 'auto' }}>
        {/* dark header */}
        <div className="row sk-week" style={{ gap: 0 }}>
          <div style={{ width: RAW_W, flexShrink: 0, padding: '5px 8px', borderRight: '1px solid #555', fontWeight: 600 }}>Сырьё</div>
          {DOW_LABELS.map((d, i) => (
            <div key={d} style={{ flex: 1, minWidth: 0, padding: '4px 6px', borderRight: '1px solid #555', textAlign: 'center', fontWeight: 600 }}>
              {d}<br /><span className="muted" style={{ color: '#aaa', fontWeight: 400 }}>{fmtDay(dayDate(year, week, i + 1))}</span>
            </div>
          ))}
          <div style={{ width: TOT_W, flexShrink: 0, padding: '5px 8px', background: 'var(--accent-dark)', textAlign: 'center', fontWeight: 600 }}>Итого</div>
        </div>
        {/* rows */}
        {raws.map((r) => {
          const sum = r.days.reduce((a, b) => a + b, 0);
          return (
            <div key={r.name} className="row" style={{ gap: 0, borderTop: '1px solid #e5e2d8' }}>
              <div className="row" style={{ width: RAW_W, flexShrink: 0, gap: 6, padding: '4px 8px', borderRight: '1px solid #ddd' }}>
                <span className="dot" style={{ width: 10, height: 10, borderRadius: '50%', background: r.colorDot, border: '1.5px solid #333', flexShrink: 0 }} />
                <b>{r.name}</b>
              </div>
              {r.days.map((v, i) => (
                <div key={i} className="mono" style={{ flex: 1, minWidth: 0, padding: '5px 6px', borderRight: '1px solid #fff', background: heatBg(r.colorBg, v, max), textAlign: 'center', fontWeight: v > max * 0.5 ? 700 : 400, color: v ? '#222' : '#ccc' }}>
                  {v ? fmtKg(v) : '·'}
                </div>
              ))}
              <div className="mono" style={{ width: TOT_W, flexShrink: 0, padding: '4px 8px', background: '#eef6ee', textAlign: 'right', fontWeight: 700, color: 'var(--accent)' }}>{fmtKg(sum)}</div>
            </div>
          );
        })}
        {/* footer: Σ день */}
        <div className="row sk-week" style={{ gap: 0, background: 'var(--accent)' }}>
          <div style={{ width: RAW_W, flexShrink: 0, padding: '5px 8px', borderRight: '1px solid var(--accent-dark)', fontWeight: 600 }}>Σ день</div>
          {DOW_LABELS.map((d, i) => (
            <div key={d} className="mono" style={{ flex: 1, minWidth: 0, padding: '5px 6px', borderRight: '1px solid var(--accent-dark)', textAlign: 'center', fontWeight: 600 }}>{colTotal(i) ? fmtKg(colTotal(i)) : '—'}</div>
          ))}
          <div className="mono" style={{ width: TOT_W, flexShrink: 0, padding: '5px 8px', background: 'var(--accent-dark)', textAlign: 'center', fontWeight: 700 }}>{fmtKg(grand)}</div>
        </div>
      </div>
    </div>
  );
}

/* ─────────── PLAN (недельная сетка) — стиль plan-view.jsx ─────────── */
type CellState = 'empty' | 'emptyOver' | 'short' | 'close' | 'norm' | 'over';
function getCellState(plan: number, fact: number): CellState {
  if (!plan || plan <= 0) return fact > 0 ? 'emptyOver' : 'empty';
  const pct = (fact / plan) * 100;
  if (pct < 80) return 'short';
  if (pct < 100) return 'close';
  if (pct <= 120) return 'norm';
  return 'over';
}
const CELL_STYLES: Record<CellState, { bg: string; border: string; bar: string; label: string }> = {
  empty: { bg: '#f5f3ed', border: '#d8d4c8', bar: '#c8c4b8', label: '#999' },
  emptyOver: { bg: '#fadbb8', border: '#d89060', bar: '#c06820', label: '#a04000' },
  short: { bg: '#fbe0e0', border: '#e0a0a0', bar: '#c04040', label: '#a02020' },
  close: { bg: '#fbf2d8', border: '#d8c068', bar: '#c89020', label: '#a06000' },
  norm: { bg: '#d8ead4', border: '#7eb070', bar: '#1a6b3a', label: '#1a6b3a' },
  over: { bg: '#fadbb8', border: '#d89060', bar: '#c06820', label: '#a04000' },
};

function ProgressBar({ pct, plan, color }: { pct: number; plan: number; color: string }) {
  const SCALE = 150;
  const clamped = Math.max(0, Math.min(SCALE, pct));
  const fillW = (Math.min(100, clamped) / SCALE) * 100;
  const overW = pct > 100 ? ((Math.min(SCALE, pct) - 100) / SCALE) * 100 : 0;
  return (
    <div style={{ width: '100%', height: 8, position: 'relative', background: '#fff', border: '1px solid #b8b4a8', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -1, bottom: -1, left: `${(100 / SCALE) * 100}%`, width: 1, background: '#333' }} />
      {plan > 0 && <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${fillW}%`, background: color }} />}
      {overW > 0 && <div style={{ position: 'absolute', top: 0, height: '100%', left: `${(100 / SCALE) * 100}%`, width: `${overW}%`, background: 'repeating-linear-gradient(-45deg,#c06820,#c06820 3px,#fadbb8 3px,#fadbb8 6px)' }} />}
    </div>
  );
}

const PVEG_W = 150, PTOT_W = 130;

function PlanCell({ plan, fact, editable, onPlan }: { plan: number; fact: number; editable: boolean; onPlan: (v: number) => void }) {
  const st = CELL_STYLES[getCellState(plan, fact)];
  const pct = plan > 0 ? Math.round((fact / plan) * 100) : 0;
  const hasAny = plan > 0 || fact > 0;
  return (
    <div style={{ height: 82, background: st.bg, border: `1.5px solid ${st.border}`, borderRadius: 3, padding: '5px 6px 5px 9px', display: 'flex', flexDirection: 'column', gap: 3, overflow: 'hidden', position: 'relative' }}>
      <div className="row" style={{ gap: 4 }}>
        <span className="muted" style={{ fontSize: 11, flexShrink: 0 }}>план</span>
        {editable
          ? <input type="number" value={plan || ''} placeholder="—" onChange={(e) => onPlan(Number(e.target.value) || 0)}
              className="mono" style={{ flex: 1, width: 0, minWidth: 0, border: '1px dashed #999', borderRadius: 2, padding: '1px 4px', background: '#fffdf2', textAlign: 'right', fontWeight: 700 }} />
          : <span className="mono" style={{ flex: 1, textAlign: 'right', fontWeight: 700 }}>{fmtKg(plan)}</span>}
      </div>
      <div className="row" style={{ gap: 4, alignItems: 'baseline' }}>
        <span className="muted" style={{ fontSize: 11, flexShrink: 0 }}>факт</span>
        <b className="mono" style={{ flex: 1, textAlign: 'right', fontSize: 15, color: hasAny ? st.label : '#999' }}>{fmtKg(fact)}</b>
      </div>
      <ProgressBar pct={pct} plan={plan} color={st.bar} />
      <b className="mono" style={{ fontSize: 12, color: hasAny ? st.label : '#999' }}>{plan > 0 ? `${pct}%` : fact > 0 ? 'без плана' : '—'}</b>
    </div>
  );
}

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
  const DOWS = [1, 2, 3, 4, 5, 6];

  const planCol = (dow: number) => raws.reduce((a, r) => a + planOf(r.id, dow), 0);
  const factCol = (dow: number) => raws.reduce((a, r) => a + factOf(r.id, dow), 0);
  const planTotal = raws.reduce((a, r) => a + DOWS.reduce((x, d) => x + planOf(r.id, d), 0), 0);
  const factTotal = raws.reduce((a, r) => a + DOWS.reduce((x, d) => x + factOf(r.id, d), 0), 0);
  const range = `${fmtDay(weekMonday(year, week))} – ${fmtDay(dayDate(year, week, 6))}`;

  const dirtyCells = Object.entries(draft).map(([k, planKg]) => {
    const [rawMaterialId, dow] = k.split(':');
    return { rawMaterialId: rawMaterialId!, dayOfWeek: Number(dow), planKg };
  });

  return (
    <div className="col tbl-dense" style={{ gap: 8 }}>
      {/* summary bar */}
      <div className="row sk-gray" style={{ gap: 10, padding: '6px 10px', border: '1.5px solid #ccc', borderRadius: 3, flexWrap: 'wrap' }}>
        <strong>План завода · {week} неделя</strong>
        <span className="muted">{range}</span>
        <ColorPill bg="#e8e5df">план Σ {fmtKg(planTotal)} кг</ColorPill>
        <ColorPill bg={factTotal >= planTotal ? '#d4ead4' : '#fbe0e0'}>
          набрано {fmtKg(factTotal)} кг{planTotal > 0 ? ` · ${Math.round((factTotal / planTotal) * 100)}%` : ''}
        </ColorPill>
        <span className="spacer" />
        {editable && dirtyCells.length > 0 && (
          <>
            <span className="muted">изменено: {dirtyCells.length}</span>
            <button className="btn primary sm" disabled={save.isPending} onClick={() => save.mutate(dirtyCells)}>Сохранить план</button>
            <button className="btn sm" onClick={() => setDraft({})}>Отмена</button>
          </>
        )}
      </div>

      <div className="sk-box" style={{ overflow: 'auto' }}>
        {/* dark header */}
        <div className="row sk-week" style={{ gap: 0 }}>
          <div style={{ width: PVEG_W, flexShrink: 0, padding: '6px 10px', borderRight: '1px solid #555', fontWeight: 600 }}>Овощ \ День</div>
          {DOWS.map((d, i) => (
            <div key={d} style={{ flex: 1, minWidth: 0, padding: '4px 6px', borderRight: '1px solid #555', textAlign: 'center', fontWeight: 600 }}>
              {DOW_LABELS[i]}<br /><span style={{ color: '#aaa', fontWeight: 400 }}>{fmtDay(dayDate(year, week, d))}</span>
            </div>
          ))}
          <div style={{ width: PTOT_W, flexShrink: 0, padding: '6px 8px', background: 'var(--accent-dark)', textAlign: 'center', fontWeight: 600 }}>Итого за неделю</div>
        </div>
        {/* rows */}
        {raws.map((r, ri) => {
          const planR = DOWS.reduce((a, d) => a + planOf(r.id, d), 0);
          const factR = DOWS.reduce((a, d) => a + factOf(r.id, d), 0);
          const rowSt = CELL_STYLES[getCellState(planR, factR)];
          const rowPct = planR > 0 ? Math.round((factR / planR) * 100) : 0;
          return (
            <div key={r.id} className="row" style={{ gap: 0, background: ri % 2 ? '#fff' : '#fafaf6', borderTop: '1px solid #e5e2d8', alignItems: 'stretch' }}>
              <div className="row" style={{ width: PVEG_W, flexShrink: 0, gap: 6, padding: '6px 10px', borderRight: '1px solid #ccc' }}>
                <span className="dot" style={{ width: 12, height: 12, borderRadius: '50%', background: r.colorDot, border: '1.5px solid #333', flexShrink: 0 }} />
                <b>{r.name}</b>
              </div>
              {DOWS.map((dow) => (
                <div key={dow} style={{ flex: 1, minWidth: 0, padding: 4, borderRight: '1px solid #e5e2d8' }}>
                  <PlanCell plan={planOf(r.id, dow)} fact={factOf(r.id, dow)} editable={editable} onPlan={(v) => setDraft({ ...draft, [cellKey(r.id, dow)]: v })} />
                </div>
              ))}
              <div className="col" style={{ width: PTOT_W, flexShrink: 0, padding: '6px 8px', background: 'var(--subtotal)', justifyContent: 'center', gap: 2 }}>
                <div className="row" style={{ gap: 4 }}><span className="muted" style={{ fontSize: 11 }}>план</span><b className="mono">{fmtKg(planR)}</b></div>
                <div className="row" style={{ gap: 4 }}><span className="muted" style={{ fontSize: 11 }}>факт</span><b className="mono" style={{ color: rowSt.label }}>{fmtKg(factR)}</b></div>
                {planR > 0 && <b className="mono" style={{ fontSize: 11, color: rowSt.label }}>{rowPct}%</b>}
              </div>
            </div>
          );
        })}
        {/* footer: итого за день */}
        <div className="row sk-week" style={{ gap: 0, background: 'var(--accent-dark)', alignItems: 'stretch' }}>
          <div style={{ width: PVEG_W, flexShrink: 0, padding: '7px 10px', borderRight: '1px solid #1a6b3a', fontWeight: 600 }}>Итого за день</div>
          {DOWS.map((dow) => {
            const p = planCol(dow), f = factCol(dow);
            const pct = p > 0 ? Math.round((f / p) * 100) : 0;
            return (
              <div key={dow} className="col" style={{ flex: 1, minWidth: 0, padding: '5px 6px', borderRight: '1px solid #1a6b3a', textAlign: 'center', gap: 1 }}>
                <span className="mono"><span style={{ color: '#aed6be' }}>п </span>{fmtKg(p)}</span>
                <span className="mono"><span style={{ color: '#aed6be' }}>ф </span>{fmtKg(f)}{p > 0 ? ` ${pct}%` : ''}</span>
              </div>
            );
          })}
          <div className="col" style={{ width: PTOT_W, flexShrink: 0, padding: '5px 8px', background: 'var(--accent)', textAlign: 'center', gap: 1, justifyContent: 'center' }}>
            <span style={{ color: '#aed6be', fontSize: 11 }}>факт / план</span>
            <b className="mono">{fmtKg(factTotal)} / {fmtKg(planTotal)}</b>
          </div>
        </div>
      </div>

      <div className="row" style={{ flexWrap: 'wrap', gap: 8, padding: '6px 10px', background: '#fffbe8', border: '1.5px dashed #e09a20', borderRadius: 3 }}>
        <strong style={{ color: '#b06000' }}>Цвет ячейки:</strong>
        {([['empty', 'план не задан'], ['short', 'недобор <80%'], ['close', 'почти 80–99%'], ['norm', 'норма 100–120%'], ['over', 'перебор >120%'], ['emptyOver', 'без плана']] as [CellState, string][]).map(([st, l]) => (
          <span key={st} className="row" style={{ gap: 5 }}>
            <span style={{ width: 14, height: 14, background: CELL_STYLES[st].bg, border: `1.5px solid ${CELL_STYLES[st].border}`, borderRadius: 2 }} />
            <span className="muted">{l}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
