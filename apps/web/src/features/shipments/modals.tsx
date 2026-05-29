import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { calcPayable, checkPayableSum } from '@wsm/shared';
import { api } from '../../lib/api';
import { Modal, fmtKg } from '../../components/ui';
import type { Driver, ShipmentItem } from '../../lib/types';
import { useRefData } from './refData';

export function DriverModal({ driver, onClose }: { driver: Driver; onClose: () => void }) {
  const [toast, setToast] = useState<string | null>(null);
  const copy = (text: string, msg: string) => {
    navigator.clipboard?.writeText(text);
    setToast(msg);
    setTimeout(() => setToast(null), 1400);
  };
  const all = `${driver.fio}\n${driver.phone}\n${driver.info ?? ''}`;
  return (
    <Modal title="👤 Карточка водителя" onClose={onClose}
      footer={<>
        <button className="btn" onClick={() => copy(driver.phone, '📞 телефон скопирован')}>📋 Телефон</button>
        <button className="btn primary" onClick={() => copy(all, '📋 всё скопировано')}>📋 Всё</button>
        {toast && <span className="muted">{toast}</span>}
      </>}>
      <div className="field"><label>ФИО</label><div style={{ fontSize: 18, fontWeight: 700 }}>{driver.fio} {driver.carrier && <span className="pill">🚛 {driver.carrier.name}</span>}</div></div>
      <div className="field"><label>Телефон</label><div className="mono" style={{ fontSize: 16 }}>{driver.phone}</div></div>
      <div className="field"><label>Инфо</label><div className="banner" style={{ whiteSpace: 'pre-wrap' }}>{driver.info ?? '—'}</div></div>
    </Modal>
  );
}

export function QualityModal({ item, canEdit, onClose }: { item: ShipmentItem; canEdit: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const q = item.quality;
  const payableParams = (item.rawMaterial.qualityParams ?? []).filter((p) => p.role === 'PAYABLE');

  const [factKg, setFact] = useState(Number(q?.factKg ?? item.kg));
  const [rejectKg, setReject] = useState(Number(q?.rejectKg ?? 0));
  const [nonStdKg, setNonStd] = useState(Number(q?.nonStdKg ?? 0));
  const [paid, setPaid] = useState(q?.nonStdPaidSeparately ?? false);
  const [price, setPrice] = useState(Number(q?.nonStdPrice ?? 0));
  const [actNumber, setAct] = useState(q?.actNumber ?? item.actNumber ?? '');
  const [comment, setComment] = useState(q?.comment ?? '');
  const [pdf, setPdf] = useState<File | null>(null);
  const [calibers, setCalibers] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const p of payableParams) init[p.id] = Number(q?.calibers.find((c) => c.qualityParamId === p.id)?.kg ?? 0);
    return init;
  });
  const [err, setErr] = useState<string | null>(null);

  const { payableKg, payablePct } = useMemo(() => calcPayable({ factKg, rejectKg, nonStdKg, nonStdPaidSeparately: paid }), [factKg, rejectKg, nonStdKg, paid]);
  const sumCheck = useMemo(() => checkPayableSum(payableParams.map((p) => calibers[p.id] ?? 0), payableKg), [calibers, payableKg, payableParams]);

  const save = useMutation({
    mutationFn: async () => {
      const data = {
        factKg, rejectKg, nonStdKg, nonStdPaidSeparately: paid,
        nonStdPrice: paid ? price : undefined,
        actNumber: actNumber || undefined, comment: comment || undefined,
        calibers: payableParams.map((p) => ({ qualityParamId: p.id, kg: calibers[p.id] ?? 0 })),
      };
      if (pdf) {
        const fd = new FormData();
        fd.append('data', JSON.stringify(data));
        fd.append('pdf', pdf);
        return api.patchForm(`/shipment-items/${item.id}/quality`, fd);
      }
      return api.patch(`/shipment-items/${item.id}/quality`, data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['shipments'] }); onClose(); },
    onError: (e) => setErr(e instanceof Error ? e.message : 'Ошибка'),
  });

  const num = (v: number, set: (n: number) => void, label: string, extra?: React.ReactNode) => (
    <div className="field"><label>{label}</label>
      <div className="row">
        <input type="number" value={v} disabled={!canEdit} onChange={(e) => set(Number(e.target.value))} style={{ width: 140 }} />
        {extra}
      </div>
    </div>
  );

  return (
    <Modal title={`📊 Качество приёмки · ${item.rawMaterial.name}`} onClose={onClose}
      footer={canEdit ? <>
        <button className="btn" onClick={onClose}>Отмена</button>
        <button className="btn primary" disabled={save.isPending} onClick={() => save.mutate()}>Сохранить</button>
      </> : <button className="btn" onClick={onClose}>Закрыть</button>}>
      <div style={{ fontWeight: 600 }}>① Базовый расчёт</div>
      {num(factKg, setFact, 'Вес факт, кг')}
      {num(rejectKg, setReject, 'Брак, кг', <span className="muted">{factKg > 0 ? Math.round((rejectKg / factKg) * 100) : 0}%</span>)}
      {num(nonStdKg, setNonStd, 'Нестандарт, кг', <span className="muted">{factKg > 0 ? Math.round((nonStdKg / factKg) * 100) : 0}%</span>)}
      <label className="row"><input type="checkbox" checked={paid} disabled={!canEdit} onChange={(e) => setPaid(e.target.checked)} /> Нестандарт оплачивается отдельно</label>
      {paid && num(price, setPrice, 'Цена нестандарта, ₽/кг')}
      <div className="banner">Вес к оплате: <b>{fmtKg(payableKg)} кг</b> ({payablePct}%) — = факт − брак {paid ? '' : '− нестандарт'}</div>

      {payableParams.length > 0 && (
        <>
          <div style={{ fontWeight: 600 }}>② Калибры</div>
          {payableParams.map((p) => (
            <div className="field" key={p.id}><label>{p.name}</label>
              <input type="number" value={calibers[p.id] ?? 0} disabled={!canEdit}
                onChange={(e) => setCalibers({ ...calibers, [p.id]: Number(e.target.value) })} style={{ width: 140 }} />
            </div>
          ))}
          <div style={{ color: sumCheck.ok ? 'var(--accent)' : '#b3261e', fontWeight: 600 }}>
            Σ: {fmtKg(sumCheck.sum)} / {fmtKg(sumCheck.target)} {sumCheck.ok ? '✓' : `✗ расхождение ${fmtKg(Math.abs(sumCheck.diff))} кг`}
          </div>
        </>
      )}

      <div style={{ fontWeight: 600 }}>③ Документ</div>
      <div className="field"><label>№ акта</label><input value={actNumber} disabled={!canEdit} onChange={(e) => setAct(e.target.value)} /></div>
      {canEdit && <div className="field"><label>PDF акта</label><input type="file" accept="application/pdf" onChange={(e) => setPdf(e.target.files?.[0] ?? null)} /></div>}
      {q?.hasPdf && !pdf && <div className="muted">📎 прикреплён: {q.pdfName} ({q.pdfSize})</div>}
      <div className="field"><label>Комментарий</label><textarea rows={2} value={comment} disabled={!canEdit} onChange={(e) => setComment(e.target.value)} /></div>
      {err && <div className="error">{err}</div>}
    </Modal>
  );
}

interface ItemDraft { rawMaterialId: string; supplierId: string; kg: number; taraTypeId: string; taraCount: string }

export function ShipmentFormModal({ onClose, prefill }: {
  onClose: () => void;
  prefill?: { rawMaterialId: string; supplierId: string; kg: number; arrDate: string };
}) {
  const qc = useQueryClient();
  const { raws, suppliers, drivers, tara } = useRefData();
  const [arrDate, setArr] = useState(prefill?.arrDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [shipDate, setShip] = useState('');
  const [driverId, setDriver] = useState('');
  const [status, setStatus] = useState<'PLANNED' | 'SHIPPED'>('PLANNED');
  const [comment, setComment] = useState('');
  const [items, setItems] = useState<ItemDraft[]>([
    { rawMaterialId: prefill?.rawMaterialId ?? '', supplierId: prefill?.supplierId ?? '', kg: prefill?.kg ?? 0, taraTypeId: '', taraCount: '' },
  ]);
  const [err, setErr] = useState<string | null>(null);

  const driver = drivers.find((d) => d.id === driverId);

  const save = useMutation({
    mutationFn: () => api.post('/shipments', {
      arrDate: new Date(arrDate).toISOString(),
      shipDate: shipDate ? new Date(shipDate).toISOString() : undefined,
      driverId: driverId || undefined,
      carrierId: driver?.carrierId || undefined,
      status,
      comment: comment || undefined,
      items: items.filter((i) => i.rawMaterialId && i.supplierId && i.kg > 0).map((i) => ({
        rawMaterialId: i.rawMaterialId, supplierId: i.supplierId, kg: Number(i.kg),
        taraTypeId: i.taraTypeId || undefined, taraCount: i.taraCount ? Number(i.taraCount) : undefined,
      })),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['shipments'] }); qc.invalidateQueries({ queryKey: ['week-plan'] }); onClose(); },
    onError: (e) => setErr(e instanceof Error ? e.message : 'Ошибка'),
  });

  const setItem = (idx: number, patch: Partial<ItemDraft>) => setItems(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  return (
    <Modal title={prefill ? '＋ Отгрузка из плана' : '＋ Новая отгрузка'} onClose={onClose}
      footer={<>
        <button className="btn" onClick={onClose}>Отмена</button>
        <button className="btn primary" disabled={save.isPending} onClick={() => save.mutate()}>Сохранить</button>
      </>}>
      <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
        <div className="field"><label>Дата прихода</label><input type="date" value={arrDate} onChange={(e) => setArr(e.target.value)} /></div>
        <div className="field"><label>Дата отгрузки</label><input type="date" value={shipDate} onChange={(e) => setShip(e.target.value)} /></div>
        <div className="field"><label>Статус</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as 'PLANNED' | 'SHIPPED')}>
            <option value="PLANNED">Запланировано</option>
            <option value="SHIPPED">Отправлено</option>
          </select>
        </div>
      </div>
      <div className="field"><label>Водитель</label>
        <select value={driverId} onChange={(e) => setDriver(e.target.value)}>
          <option value="">— не назначен —</option>
          {drivers.map((d) => <option key={d.id} value={d.id}>{d.fio} {d.carrier ? `· ${d.carrier.name}` : ''}</option>)}
        </select>
      </div>

      <div style={{ fontWeight: 600 }}>Позиции</div>
      {items.map((it, idx) => (
        <div className="card" key={idx} style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
            <select value={it.rawMaterialId} onChange={(e) => setItem(idx, { rawMaterialId: e.target.value })}>
              <option value="">Сырьё…</option>
              {raws.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <select value={it.supplierId} onChange={(e) => setItem(idx, { supplierId: e.target.value })}>
              <option value="">Поставщик…</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input type="number" placeholder="кг" value={it.kg || ''} onChange={(e) => setItem(idx, { kg: Number(e.target.value) })} style={{ width: 90 }} />
            <select value={it.taraTypeId} onChange={(e) => setItem(idx, { taraTypeId: e.target.value })}>
              <option value="">Тара…</option>
              {tara.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <input type="number" placeholder="кол-во" value={it.taraCount} onChange={(e) => setItem(idx, { taraCount: e.target.value })} style={{ width: 80 }} />
            {items.length > 1 && <button className="btn sm" onClick={() => setItems(items.filter((_, i) => i !== idx))}>✕</button>}
          </div>
        </div>
      ))}
      <button className="btn sm" onClick={() => setItems([...items, { rawMaterialId: '', supplierId: '', kg: 0, taraTypeId: '', taraCount: '' }])}>＋ Добавить позицию</button>

      <div className="field"><label>Комментарий</label><textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} /></div>
      {err && <div className="error">{err}</div>}
    </Modal>
  );
}
