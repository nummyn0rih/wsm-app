import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  INGREDIENT_UNIT_LABEL, TARA_KIND_LABEL, IngredientUnit, TaraKind, SupplierStatus,
} from '@wsm/shared';
import { api } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';
import { Modal, RawPill, Spinner } from '../../components/ui';
import type { Carrier } from '../../lib/types';

type FieldType = 'text' | 'textarea' | 'number' | 'enum' | 'carrier' | 'bool';
interface Field { key: string; label: string; type: FieldType; options?: { value: string; label: string }[] }
interface RefConfig {
  key: string; label: string; path: string;
  columns: { key: string; label: string; render?: (row: any) => React.ReactNode }[];
  fields: Field[];
  search?: (row: any) => string;
}

const ENUM = (m: Record<string, string>) => Object.entries(m).map(([value, label]) => ({ value, label }));

const REFS: RefConfig[] = [
  {
    key: 'raw-materials', label: 'Сырьё', path: '/raw-materials',
    columns: [
      { key: 'name', label: 'Название', render: (r) => <RawPill raw={r} /> },
      { key: 'defaultUnit', label: 'Ед.' },
      { key: 'params', label: 'Параметры качества', render: (r) => (r.qualityParams?.length ?? 0) + ' шт' },
    ],
    fields: [
      { key: 'name', label: 'Название', type: 'text' },
      { key: 'defaultUnit', label: 'Единица', type: 'text' },
      { key: 'colorBg', label: 'Цвет фона (hex)', type: 'text' },
      { key: 'colorDot', label: 'Цвет точки (hex)', type: 'text' },
    ],
    search: (r) => r.name,
  },
  {
    key: 'drivers', label: 'Водители', path: '/drivers',
    columns: [
      { key: 'fio', label: 'ФИО' },
      { key: 'phone', label: 'Телефон', render: (r) => <span className="mono">{r.phone}</span> },
      { key: 'tk', label: 'ТК', render: (r) => r.carrier?.name ?? '—' },
      { key: 'info', label: 'Инфо', render: (r) => <span className="muted" style={{ whiteSpace: 'pre-wrap' }}>{r.info}</span> },
    ],
    fields: [
      { key: 'fio', label: 'ФИО', type: 'text' },
      { key: 'phone', label: 'Телефон', type: 'text' },
      { key: 'carrierId', label: 'ТК', type: 'carrier' },
      { key: 'info', label: 'Инфо', type: 'textarea' },
    ],
    search: (r) => `${r.fio} ${r.phone}`,
  },
  {
    key: 'suppliers', label: 'Поставщики', path: '/suppliers',
    columns: [
      { key: 'name', label: 'Название' },
      { key: 'inn', label: 'ИНН', render: (r) => <span className="mono">{r.inn ?? '—'}</span> },
      { key: 'status', label: 'Статус', render: (r) => (r.status === 'ACTIVE' ? 'активный' : 'архив') },
    ],
    fields: [
      { key: 'name', label: 'Название', type: 'text' },
      { key: 'inn', label: 'ИНН', type: 'text' },
      { key: 'legalForm', label: 'Юр. форма', type: 'text' },
      { key: 'status', label: 'Статус', type: 'enum', options: [{ value: 'ACTIVE', label: 'активный' }, { value: 'ARCHIVE', label: 'архив' }] },
      { key: 'note', label: 'Заметка', type: 'textarea' },
    ],
    search: (r) => `${r.name} ${r.inn ?? ''}`,
  },
  {
    key: 'carriers', label: 'ТК', path: '/carriers',
    columns: [{ key: 'name', label: 'Название' }],
    fields: [{ key: 'name', label: 'Название', type: 'text' }],
    search: (r) => r.name,
  },
  {
    key: 'tara-types', label: 'Виды тары', path: '/tara-types',
    columns: [
      { key: 'name', label: 'Название' },
      { key: 'kind', label: 'Тип', render: (r) => TARA_KIND_LABEL[r.kind as TaraKind] },
    ],
    fields: [
      { key: 'name', label: 'Название', type: 'text' },
      { key: 'kind', label: 'Тип', type: 'enum', options: ENUM(TARA_KIND_LABEL) },
    ],
    search: (r) => r.name,
  },
  {
    key: 'ingredients', label: 'Ингредиенты', path: '/ingredients',
    columns: [
      { key: 'name', label: 'Название' },
      { key: 'unit', label: 'Ед.', render: (r) => INGREDIENT_UNIT_LABEL[r.unit as IngredientUnit] },
      { key: 'qtyOnPlant', label: 'Остаток на заводе', render: (r) => <span className="mono">{Number(r.qtyOnPlant).toLocaleString('ru-RU')}</span> },
    ],
    fields: [
      { key: 'name', label: 'Название', type: 'text' },
      { key: 'unit', label: 'Единица', type: 'enum', options: ENUM(INGREDIENT_UNIT_LABEL) },
      { key: 'qtyOnPlant', label: 'Остаток', type: 'number' },
    ],
    search: (r) => r.name,
  },
  {
    key: 'seasons', label: 'Сезоны', path: '/seasons',
    columns: [
      { key: 'name', label: 'Название' },
      { key: 'isCurrent', label: 'Текущий', render: (r) => (r.isCurrent ? '✓' : '') },
    ],
    fields: [
      { key: 'name', label: 'Название', type: 'text' },
      { key: 'isCurrent', label: 'Текущий', type: 'bool' },
    ],
    search: (r) => r.name,
  },
];

export function ReferencesPage() {
  const [tab, setTab] = useState(REFS[0]!.key);
  const cfg = REFS.find((r) => r.key === tab)!;
  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        {REFS.map((r) => (
          <button key={r.key} className={`btn sm ${r.key === tab ? 'primary' : ''}`} onClick={() => setTab(r.key)}>{r.label}</button>
        ))}
      </div>
      <ReferenceTable key={cfg.key} cfg={cfg} />
    </div>
  );
}

function ReferenceTable({ cfg }: { cfg: RefConfig }) {
  const { can } = useAuth();
  const qc = useQueryClient();
  const canWrite = can('references:write');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<any | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['ref', cfg.key], queryFn: () => api.get<any[]>(cfg.path) });
  const carriers = useQuery({ queryKey: ['ref', 'carriers'], queryFn: () => api.get<Carrier[]>('/carriers'), enabled: cfg.fields.some((f) => f.type === 'carrier') });

  const del = useMutation({
    mutationFn: (id: string) => api.del(`${cfg.path}/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ref', cfg.key] }),
  });

  const rows = useMemo(() => {
    if (!data) return [];
    if (!q || !cfg.search) return data;
    const needle = q.toLowerCase();
    return data.filter((r) => cfg.search!(r).toLowerCase().includes(needle));
  }, [data, q, cfg]);

  if (isLoading) return <Spinner />;

  return (
    <div className="col" style={{ gap: 10 }}>
      <div className="row">
        {cfg.search && <input placeholder="🔍 Поиск…" value={q} onChange={(e) => setQ(e.target.value)} style={{ padding: '6px 10px', border: '1px solid var(--border-strong)', borderRadius: 6, width: 280 }} />}
        <span className="muted">{rows.length} зап.</span>
        <span className="spacer" />
        {canWrite && <button className="btn primary sm" onClick={() => setEditing({})}>＋ Добавить</button>}
      </div>

      <div className="card" style={{ overflow: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              {cfg.columns.map((c) => <th key={c.key}>{c.label}</th>)}
              {canWrite && <th style={{ width: 110 }}></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {cfg.columns.map((c) => <td key={c.key}>{c.render ? c.render(row) : (row[c.key] ?? '—')}</td>)}
                {canWrite && (
                  <td>
                    <div className="row">
                      <button className="btn sm" onClick={() => setEditing(row)}>✎</button>
                      <button className="btn sm" onClick={() => { if (confirm('Удалить запись?')) del.mutate(row.id); }}>🗑</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditModal
          cfg={cfg}
          row={editing}
          carriers={carriers.data ?? []}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ['ref', cfg.key] }); }}
        />
      )}
    </div>
  );
}

function EditModal({ cfg, row, carriers, onClose, onSaved }: {
  cfg: RefConfig; row: any; carriers: Carrier[]; onClose: () => void; onSaved: () => void;
}) {
  const isNew = !row.id;
  const [form, setForm] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    for (const f of cfg.fields) init[f.key] = row[f.key] ?? (f.type === 'bool' ? false : f.type === 'number' ? 0 : '');
    return init;
  });
  const [err, setErr] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () => {
      const payload: Record<string, any> = {};
      for (const f of cfg.fields) {
        let v = form[f.key];
        if (f.type === 'number') v = Number(v);
        if (f.type === 'carrier' && v === '') v = null;
        payload[f.key] = v;
      }
      return isNew ? api.post(cfg.path, payload) : api.patch(`${cfg.path}/${row.id}`, payload);
    },
    onSuccess: onSaved,
    onError: (e) => setErr(e instanceof Error ? e.message : 'Ошибка'),
  });

  return (
    <Modal
      title={`${isNew ? 'Новая запись' : 'Редактирование'} · ${cfg.label}`}
      onClose={onClose}
      footer={<>
        <button className="btn" onClick={onClose}>Отмена</button>
        <button className="btn primary" disabled={save.isPending} onClick={() => save.mutate()}>Сохранить</button>
      </>}
    >
      {cfg.fields.map((f) => (
        <div className="field" key={f.key}>
          <label>{f.label}</label>
          {f.type === 'textarea' ? (
            <textarea rows={3} value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
          ) : f.type === 'bool' ? (
            <input type="checkbox" checked={!!form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })} style={{ width: 18, height: 18 }} />
          ) : f.type === 'enum' ? (
            <select value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}>
              {f.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : f.type === 'carrier' ? (
            <select value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}>
              <option value="">— нет —</option>
              {carriers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          ) : (
            <input type={f.type === 'number' ? 'number' : 'text'} value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
          )}
        </div>
      ))}
      {err && <div className="error">{err}</div>}
    </Modal>
  );
}
