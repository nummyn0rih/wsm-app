/* ─────────── MOBILE: Тара (7.1) и Аналитика (7.2) ─────────── */
(() => {
const { Box: TBox, Label: TLabel, Pill: TPill, RAW_COLORS: TRC } = window;
const { useState: useStateTA } = React;

const fmtKgTA = (n) => n.toLocaleString('ru-RU');
const fmtRubTA = (n) => n.toLocaleString('ru-RU');

/* ─────────── Общий хедер мобильных экранов (Тара/Аналитика) ─────────── */
const TAHeader = ({ title, subtitle, online, syncing, queued, accent = '#1a6b3a' }) => (
  <div style={{
    background: accent, color: '#fff', padding: '10px 14px 8px',
    position: 'sticky', top: 0, zIndex: 5,
    boxShadow: '0 1px 0 rgba(0,0,0,0.1)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <TLabel size={18} bold color="#fff">{title}</TLabel>
      <div style={{ flex: 1 }} />
      {/* Network indicator */}
      {!online ? (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: '#fff5e6', border: '1px solid #e09a20',
          borderRadius: 14, padding: '2px 9px'
        }}>
          <span style={{ width: 7, height: 7, borderRadius: 7, background: '#e09a20' }} />
          <TLabel size={12} bold color="#a06000">офлайн · очередь {queued}</TLabel>
        </div>
      ) : syncing ? (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: '#e8f4ed', border: '1px solid #7ab098',
          borderRadius: 14, padding: '2px 9px'
        }}>
          <span style={{ width: 7, height: 7, borderRadius: 7, background: '#1a6b3a' }} />
          <TLabel size={12} bold color="#1a6b3a">синхронизация</TLabel>
        </div>
      ) : (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, opacity: 0.85 }}>
          <span style={{ width: 7, height: 7, borderRadius: 7, background: '#aed6be' }} />
          <TLabel size={11} color="rgba(255,255,255,0.85)">в сети</TLabel>
        </div>
      )}
      {/* Menu */}
      <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <TLabel size={20} bold color="#fff">⋮</TLabel>
      </div>
    </div>
    {subtitle && (
      <div style={{ marginTop: 2 }}>
        <TLabel size={12} color="rgba(255,255,255,0.85)">{subtitle}</TLabel>
      </div>
    )}
  </div>
);

/* ─────────── FAB (тематизированная) ─────────── */
const TAFab = ({ icon = '＋', label, onClick }) => (
  <div onClick={onClick} style={{
    position: 'absolute', right: 16, bottom: 16,
    minWidth: 56, height: 56, borderRadius: 28,
    background: '#1a6b3a', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: label ? '0 18px' : 0,
    boxShadow: '0 4px 10px rgba(0,0,0,0.25)', cursor: 'pointer', zIndex: 6
  }}>
    <span style={{ fontSize: 26, fontWeight: 300, lineHeight: 1, marginTop: -2 }}>{icon}</span>
    {label && <TLabel size={14} bold color="#fff">{label}</TLabel>}
  </div>
);

/* ─────────── Демо-данные тары ─────────── */
const TARA_FACTORY = {
  name: 'Завод',
  rows: [
    { type: 'Бочка 200 л', stock: 412, scrap: 18, transit: 56 },
    { type: 'Ящик пласт.', stock: 1840, scrap: 92, transit: 220 },
    { type: 'IBC-куб',     stock: 38,  scrap: 4,  transit: 12 },
  ],
};
const TARA_SUPPLIERS = [
  { name: 'Байрамов А.', alert: false, rows: [
    { type: 'Ящик пласт.', stock: 420, scrap: 12, transit: 0 },
    { type: 'Бочка 200 л', stock: 24,  scrap: 2,  transit: 8 },
  ]},
  { name: 'Цой К.Т.', alert: true, rows: [
    { type: 'Бочка 200 л', stock: 6,   scrap: 14, transit: 30 },
    { type: 'IBC-куб',     stock: 2,   scrap: 0,  transit: 4 },
  ]},
  { name: 'Генералов', alert: false, rows: [
    { type: 'Бочка 200 л', stock: 88,  scrap: 5,  transit: 12 },
    { type: 'Ящик пласт.', stock: 360, scrap: 8,  transit: 0 },
  ]},
  { name: 'Мищенко',   alert: false, rows: [
    { type: 'Бочка 200 л', stock: 42,  scrap: 1,  transit: 0 },
  ]},
  { name: 'Ким Т.',    alert: false, rows: [
    { type: 'Ящик пласт.', stock: 180, scrap: 4,  transit: 60 },
  ]},
];

/* ─────────── Маленький KPI-блок (3 числа в карточке тары) ─────────── */
const TaraKpi = ({ k, v, accent }) => (
  <div style={{ flex: 1, padding: '6px 8px', background: '#fff', borderRadius: 6, border: '1px solid #ececec', minWidth: 0 }}>
    <TLabel size={10} color="#888" style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>{k}</TLabel>
    <TLabel size={16} bold color={accent || '#222'}>{v}</TLabel>
  </div>
);

/* ─────────── Карточка одной точки (Завод/Поставщик) ─────────── */
const TaraCard = ({ title, factory, alert, rows }) => {
  const sumStock   = rows.reduce((a, r) => a + r.stock, 0);
  const sumScrap   = rows.reduce((a, r) => a + r.scrap, 0);
  const sumTransit = rows.reduce((a, r) => a + r.transit, 0);
  return (
    <div style={{
      background: '#fff', borderRadius: 10,
      border: factory ? '2px solid #1a6b3a' : (alert ? '1px solid #e09a20' : '1px solid #ececec'),
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden'
    }}>
      {/* Card header */}
      <div style={{
        padding: '8px 12px',
        background: factory ? '#1a6b3a' : (alert ? '#fff5e6' : '#fafafa'),
        color: factory ? '#fff' : '#222',
        display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: '1px solid ' + (factory ? '#0d4020' : '#ececec')
      }}>
        <span style={{ fontSize: 16 }}>{factory ? '🏭' : '🏡'}</span>
        <TLabel size={15} bold color={factory ? '#fff' : '#222'}>{title}</TLabel>
        {alert && !factory && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10,
            background: '#e09a20', color: '#fff'
          }}>низкий остаток</span>
        )}
        <div style={{ flex: 1 }} />
        <TLabel size={11} color={factory ? 'rgba(255,255,255,0.85)' : '#888'}>{rows.length} тип{rows.length === 1 ? '' : (rows.length < 5 ? 'а' : 'ов')}</TLabel>
      </div>

      {/* Sum KPIs */}
      <div style={{ display: 'flex', gap: 6, padding: '8px 10px', background: '#f7f6f2' }}>
        <TaraKpi k="Остаток" v={fmtKgTA(sumStock)} accent="#1a6b3a" />
        <TaraKpi k="Лом" v={fmtKgTA(sumScrap)} accent="#a06000" />
        <TaraKpi k="В пути" v={fmtKgTA(sumTransit)} accent="#1a4a8a" />
      </div>

      {/* Per-type rows */}
      <div style={{ padding: '4px 10px 8px' }}>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 4px', borderTop: i ? '1px dashed #ececec' : 'none'
          }}>
            <TLabel size={13} bold color="#222" style={{ flex: 1, minWidth: 0 }}>{r.type}</TLabel>
            <div style={{ display: 'flex', gap: 10 }}>
              <TLabel size={13} bold color="#1a6b3a">{r.stock}</TLabel>
              <TLabel size={12} color="#a06000" style={{ minWidth: 28, textAlign: 'right' }}>{r.scrap}</TLabel>
              <TLabel size={12} color="#1a4a8a" style={{ minWidth: 28, textAlign: 'right' }}>{r.transit > 0 ? '↑' + r.transit : '—'}</TLabel>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────── Bottom sheet (общий) ─────────── */
const BottomSheet = ({ title, onClose, children, footer }) => (
  <div style={{
    position: 'absolute', inset: 0, background: 'rgba(20,20,20,0.45)',
    display: 'flex', alignItems: 'flex-end', zIndex: 10
  }} onClick={onClose}>
    <div onClick={(e) => e.stopPropagation()} style={{
      width: '100%', maxHeight: '88%', background: '#fff',
      borderRadius: '12px 12px 0 0', overflow: 'hidden',
      display: 'flex', flexDirection: 'column'
    }}>
      <div style={{
        padding: '8px 14px', background: '#1a6b3a', color: '#fff',
        display: 'flex', alignItems: 'center', gap: 8
      }}>
        <span style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.4)', borderRadius: 2, position: 'absolute', left: '50%', top: 4, transform: 'translateX(-50%)' }} />
        <TLabel size={15} bold color="#fff">{title}</TLabel>
        <div style={{ flex: 1 }} />
        <span onClick={onClose} style={{ cursor: 'pointer', fontSize: 18, color: '#fff' }}>✕</span>
      </div>
      <div style={{ padding: '12px 14px', overflowY: 'auto', flex: 1 }}>{children}</div>
      {footer && (
        <div style={{ padding: '10px 14px', borderTop: '1px solid #ececec', background: '#fafafa' }}>
          {footer}
        </div>
      )}
    </div>
  </div>
);

/* ─────────── Поле формы (мобильное) ─────────── */
const MField = ({ label, value, placeholder, hint, kind, required }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
      <TLabel size={12} bold color="#444">{label}{required && <span style={{ color: '#c33' }}> *</span>}</TLabel>
      {hint && <TLabel size={10} color="#999">{hint}</TLabel>}
    </div>
    <div style={{
      border: '1.5px solid #ccc', borderRadius: 6,
      padding: '8px 10px', background: '#fff',
      display: 'flex', alignItems: 'center', minHeight: 36
    }}>
      {value
        ? <TLabel size={14} bold color="#222">{value}</TLabel>
        : <TLabel size={13} color="#bbb">{placeholder || '—'}</TLabel>}
      <div style={{ flex: 1 }} />
      {kind === 'select' && <TLabel size={12} color="#999">▾</TLabel>}
      {kind === 'date' && <TLabel size={14} color="#999">📅</TLabel>}
      {kind === 'num' && <TLabel size={12} color="#999">кг</TLabel>}
    </div>
  </div>
);

/* ─────────── Форма «Отправить тару поставщику» ─────────── */
const FormSend = ({ onClose }) => {
  const items = [
    { sup: 'Цой К.Т.',    type: 'Бочка 200 л', qty: 30 },
    { sup: 'Цой К.Т.',    type: 'IBC-куб',     qty: 4  },
    { sup: 'Байрамов А.', type: 'Ящик пласт.', qty: 60 },
  ];
  return (
    <BottomSheet title="📤 Отправить тару поставщику" onClose={onClose} footer={
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, padding: '10px', textAlign: 'center', background: '#eee', borderRadius: 6, cursor: 'pointer' }}>
          <TLabel size={13} color="#555">Отмена</TLabel>
        </div>
        <div style={{ flex: 2, padding: '10px', textAlign: 'center', background: '#1a6b3a', borderRadius: 6, cursor: 'pointer' }}>
          <TLabel size={13} bold color="#fff">✓ Сохранить отправку</TLabel>
        </div>
      </div>
    }>
      <MField label="Дата отправки" required kind="date" value="22 апр" />
      <MField label="Водитель" required kind="select" value="Мартыно В." />
      <MField label="Машина / номер" hint="по водителю" kind="select" value="MAN TGX · О 891 РТ 50" />

      <div style={{ marginTop: 4, marginBottom: 6, display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <TLabel size={13} bold color="#222">Позиции</TLabel>
        <TLabel size={11} color="#888">— разные поставщики и типы тары</TLabel>
      </div>
      <div style={{ border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden', background: '#fafafa' }}>
        {items.map((it, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 10px', background: '#fff',
            borderBottom: '1px dashed #ececec'
          }}>
            <span style={{
              fontSize: 11, fontWeight: 700, width: 18, height: 18, borderRadius: 9,
              background: '#1a6b3a', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>{i + 1}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <TLabel size={13} bold color="#222">{it.type}</TLabel>
              <TLabel size={11} color="#666">→ {it.sup}</TLabel>
            </div>
            <div style={{
              padding: '4px 10px', background: '#f0f0c8',
              border: '1px solid #d4c878', borderRadius: 6
            }}>
              <TLabel size={14} bold color="#222">{it.qty} шт</TLabel>
            </div>
            <TLabel size={16} color="#c33" style={{ cursor: 'pointer' }}>✕</TLabel>
          </div>
        ))}
        <div style={{ padding: '10px', textAlign: 'center', background: '#f0f0c8', cursor: 'pointer' }}>
          <TLabel size={13} bold color="#1a6b3a">＋ Добавить позицию</TLabel>
        </div>
      </div>

      <div style={{ marginTop: 12, padding: '8px 10px', background: '#eef6ee', borderRadius: 6, display: 'flex', gap: 8 }}>
        <TLabel size={12} bold color="#1a6b3a">Итого:</TLabel>
        <TLabel size={12} color="#222">3 поз. · 94 шт</TLabel>
        <div style={{ flex: 1 }} />
        <TLabel size={11} color="#666">2 поставщика</TLabel>
      </div>
    </BottomSheet>
  );
};

/* ─────────── Форма «Списать в лом / утилизировать» ─────────── */
const FormScrap = ({ onClose }) => {
  const [mode, setMode] = useStateTA('scrap'); // 'scrap' | 'util'
  return (
    <BottomSheet title="♻ Лом тары" onClose={onClose} footer={
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, padding: '10px', textAlign: 'center', background: '#eee', borderRadius: 6, cursor: 'pointer' }}>
          <TLabel size={13} color="#555">Отмена</TLabel>
        </div>
        <div style={{ flex: 2, padding: '10px', textAlign: 'center', background: mode === 'scrap' ? '#a06000' : '#7a2a2a', borderRadius: 6, cursor: 'pointer' }}>
          <TLabel size={13} bold color="#fff">{mode === 'scrap' ? '✓ Списать в лом' : '✓ Утилизировать'}</TLabel>
        </div>
      </div>
    }>
      {/* Mode toggle */}
      <div style={{
        display: 'flex', border: '1.5px solid #ccc', borderRadius: 8,
        overflow: 'hidden', marginBottom: 12, background: '#f5f3ed'
      }}>
        <div onClick={() => setMode('scrap')} style={{
          flex: 1, padding: '8px', textAlign: 'center', cursor: 'pointer',
          background: mode === 'scrap' ? '#a06000' : 'transparent'
        }}>
          <TLabel size={13} bold color={mode === 'scrap' ? '#fff' : '#666'}>В лом</TLabel>
        </div>
        <div onClick={() => setMode('util')} style={{
          flex: 1, padding: '8px', textAlign: 'center', cursor: 'pointer',
          background: mode === 'util' ? '#7a2a2a' : 'transparent'
        }}>
          <TLabel size={13} bold color={mode === 'util' ? '#fff' : '#666'}>Утилизировать лом</TLabel>
        </div>
      </div>

      <MField label="Поставщик / Завод" required kind="select" value="Цой К.Т." />
      <MField label="Тип тары" required kind="select" value="Бочка 200 л" />
      <MField label="Количество" required kind="num" value="14" />
      <div style={{ marginBottom: 4 }}>
        <TLabel size={12} bold color="#444" style={{ marginBottom: 3 }}>Комментарий</TLabel>
        <div style={{
          border: '1.5px solid #ccc', borderRadius: 6,
          padding: '8px 10px', background: '#fff', minHeight: 64
        }}>
          <TLabel size={13} color="#a06000" style={{ fontStyle: 'italic' }}>
            {mode === 'scrap'
              ? 'Прошлогодние бочки, дно проржавело — отметили на приёмке 22.04'
              : 'Лом сдан в утилизацию (накл. №2241 от 22.04)'}
          </TLabel>
        </div>
      </div>

      <div style={{ marginTop: 14, padding: '8px 10px', background: '#fff5e6', border: '1px dashed #e09a20', borderRadius: 6 }}>
        <TLabel size={11} color="#a06000">
          {mode === 'scrap'
            ? '✦ Уйдёт в столбец «Лом» у выбранного поставщика. Остаток уменьшится на 14.'
            : '✦ Списание из «Лом» — изменения остатка нет, только обнуление лома.'}
        </TLabel>
      </div>
    </BottomSheet>
  );
};

/* ─────────── Форма «Корректировка остатка» ─────────── */
const FormAdjust = ({ onClose }) => (
  <BottomSheet title="✎ Корректировка остатка" onClose={onClose} footer={
    <div style={{ display: 'flex', gap: 8 }}>
      <div style={{ flex: 1, padding: '10px', textAlign: 'center', background: '#eee', borderRadius: 6, cursor: 'pointer' }}>
        <TLabel size={13} color="#555">Отмена</TLabel>
      </div>
      <div style={{ flex: 2, padding: '10px', textAlign: 'center', background: '#1a6b3a', borderRadius: 6, cursor: 'pointer' }}>
        <TLabel size={13} bold color="#fff">✓ Сохранить корректировку</TLabel>
      </div>
    </div>
  }>
    <MField label="Точка" required hint="поставщик или Завод" kind="select" value="🏭 Завод" />
    <MField label="Тип тары" required kind="select" value="Ящик пласт." />

    <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
      <div style={{ flex: 1 }}>
        <TLabel size={12} bold color="#444" style={{ marginBottom: 3 }}>Текущее</TLabel>
        <div style={{
          border: '1.5px solid #ccc', borderRadius: 6,
          padding: '8px 10px', background: '#f5f3ed', display: 'flex', alignItems: 'center'
        }}>
          <TLabel size={16} bold color="#666">1 840</TLabel>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <TLabel size={12} bold color="#444" style={{ marginBottom: 3 }}>Новое значение <span style={{ color: '#c33' }}>*</span></TLabel>
        <div style={{
          border: '2px solid #1a6b3a', borderRadius: 6,
          padding: '8px 10px', background: '#fff', display: 'flex', alignItems: 'center'
        }}>
          <TLabel size={16} bold color="#1a6b3a">1 812</TLabel>
        </div>
      </div>
    </div>

    <div style={{ padding: '8px 10px', background: '#eef6ee', borderRadius: 6, marginBottom: 10 }}>
      <TLabel size={12} color="#1a6b3a">Δ = −28 шт (расхождение пересчёта)</TLabel>
    </div>

    <div style={{ marginBottom: 4 }}>
      <TLabel size={12} bold color="#444" style={{ marginBottom: 3 }}>Комментарий</TLabel>
      <div style={{
        border: '1.5px solid #ccc', borderRadius: 6,
        padding: '8px 10px', background: '#fff', minHeight: 60
      }}>
        <TLabel size={13} color="#666" style={{ fontStyle: 'italic' }}>
          Инвентаризация на складе 22.04, недостача в секции B
        </TLabel>
      </div>
    </div>
  </BottomSheet>
);

/* ─────────── Меню действий FAB (3 быстрые формы) ─────────── */
const FabMenu = ({ onPick, onClose }) => (
  <div onClick={onClose} style={{
    position: 'absolute', inset: 0, background: 'rgba(20,20,20,0.35)',
    zIndex: 8
  }}>
    <div style={{ position: 'absolute', right: 16, bottom: 84, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[
        { key: 'send',   icon: '📤', label: 'Отправить тару поставщику', bg: '#1a6b3a' },
        { key: 'scrap',  icon: '♻',  label: 'Списать в лом / утилизация', bg: '#a06000' },
        { key: 'adjust', icon: '✎',  label: 'Корректировка остатка',      bg: '#1a4a8a' },
      ].map(a => (
        <div key={a.key} onClick={(e) => { e.stopPropagation(); onPick(a.key); }} style={{
          display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end'
        }}>
          <div style={{
            background: '#fff', padding: '6px 12px', borderRadius: 18,
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
          }}>
            <TLabel size={13} bold color="#222">{a.label}</TLabel>
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: 22,
            background: a.bg, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 3px 8px rgba(0,0,0,0.25)', cursor: 'pointer'
          }}>
            <span style={{ fontSize: 20 }}>{a.icon}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ─────────── 7.1 ТАРА · МОБИЛЬНАЯ ─────────── */
const MobileTara = ({ initialSheet }) => {
  const [sheet, setSheet] = useStateTA(initialSheet || null);
  const [fabOpen, setFabOpen] = useStateTA(false);

  return (
    <AndroidDevice width={380} height={760}>
      <div style={{ background: '#f0eee9', minHeight: '100%', position: 'relative', fontFamily: 'system-ui, -apple-system, Roboto, sans-serif' }}>
        <TAHeader
          title="Тара"
          subtitle="22 апр · обновлено 11:42"
          online={false}
          queued={3}
        />

        {/* Compact filter / sort row */}
        <div style={{
          display: 'flex', gap: 6, padding: '8px 12px', background: '#fff',
          borderBottom: '1px solid #e0e0e0', overflowX: 'auto', alignItems: 'center'
        }}>
          {['Все', 'С алертом', 'По остатку ↓'].map((t, i) => (
            <div key={i} style={{
              padding: '4px 12px',
              border: '1px solid ' + (i === 0 ? '#1a6b3a' : '#ccc'),
              background: i === 0 ? '#1a6b3a' : '#fff',
              color: i === 0 ? '#fff' : '#555',
              borderRadius: 14, fontSize: 12, fontWeight: i === 0 ? 600 : 400,
              whiteSpace: 'nowrap'
            }}>{t}</div>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ padding: '4px 10px', border: '1px solid #ccc', borderRadius: 14, fontSize: 12, color: '#555', whiteSpace: 'nowrap' }}>🔍</div>
        </div>

        {/* Cards */}
        <div style={{ padding: '10px 12px 90px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <TaraCard title="Завод" factory rows={TARA_FACTORY.rows} />

          {/* Date group label — отделяем поставщиков */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, marginBottom: -2 }}>
            <TLabel size={11} bold color="#888" style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>Поставщики · 5</TLabel>
            <div style={{ flex: 1, height: 1, background: '#d8d3c8' }} />
            <TLabel size={11} color="#a06000">⚠ 1 алерт</TLabel>
          </div>

          {TARA_SUPPLIERS.map((s, i) => (
            <TaraCard key={i} title={s.name} alert={s.alert} rows={s.rows} />
          ))}
        </div>

        {/* FAB */}
        {!sheet && !fabOpen && (
          <TAFab onClick={() => setFabOpen(true)} />
        )}

        {/* FAB action menu */}
        {fabOpen && !sheet && (
          <FabMenu
            onClose={() => setFabOpen(false)}
            onPick={(k) => { setFabOpen(false); setSheet(k); }}
          />
        )}

        {/* Bottom sheets */}
        {sheet === 'send'   && <FormSend   onClose={() => setSheet(null)} />}
        {sheet === 'scrap'  && <FormScrap  onClose={() => setSheet(null)} />}
        {sheet === 'adjust' && <FormAdjust onClose={() => setSheet(null)} />}
      </div>
    </AndroidDevice>
  );
};

/* ─────────── 7.2 АНАЛИТИКА · МОБИЛЬНАЯ ─────────── */
const ANALYTICS_KPI = [
  { raw: 'Огурцы',    kg: 38200, pct: 96, rub: 2_482_000 },
  { raw: 'Черри',     kg: 65300, pct: 102, rub: 6_204_350 },
  { raw: 'Томаты',    kg: 58100, pct: 88, rub: 3_486_000 },
  { raw: 'Патиссоны', kg: 14536, pct: 72, rub:   872_160 },
  { raw: 'Халапеньо', kg: 21164, pct: 110, rub: 2_751_320 },
  { raw: 'Перец',     kg: 20000, pct: 64, rub: 1_400_000 },
  { raw: 'Баклажан',  kg:  9800, pct: 49, rub:   686_000 },
];

const KpiTile = ({ d }) => {
  const c = TRC[d.raw] || { bg: '#eee', dot: '#999' };
  const pctColor = d.pct >= 100 ? '#1a6b3a' : d.pct >= 80 ? '#a06000' : '#c33';
  const pctBg    = d.pct >= 100 ? '#e8f4ed' : d.pct >= 80 ? '#fff5e6' : '#fdecec';
  return (
    <div style={{
      background: '#fff', borderRadius: 10, overflow: 'hidden',
      border: '1px solid #ececec', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
    }}>
      {/* color bar */}
      <div style={{ height: 4, background: c.dot }} />
      <div style={{ padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 10, background: c.dot }} />
          <TLabel size={14} bold color="#222">{d.raw}</TLabel>
          <div style={{ flex: 1 }} />
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
            background: pctBg, color: pctColor
          }}>{d.pct}% плана</span>
        </div>
        {/* 3-column numbers */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <TLabel size={10} color="#888" style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>Привезено</TLabel>
            <TLabel size={16} bold color="#222">{fmtKgTA(d.kg)}<span style={{ fontSize: 11, color: '#888', fontWeight: 400 }}> кг</span></TLabel>
          </div>
          <div style={{ flex: 1 }}>
            <TLabel size={10} color="#888" style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>Σ ₽</TLabel>
            <TLabel size={16} bold color="#1a4a8a">{fmtRubTA(Math.round(d.rub / 1000))}<span style={{ fontSize: 11, color: '#888', fontWeight: 400 }}> тыс</span></TLabel>
          </div>
        </div>
        {/* Mini progress bar */}
        <div style={{ marginTop: 8, height: 6, background: '#f0eee9', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            width: Math.min(d.pct, 100) + '%', height: '100%',
            background: pctColor, opacity: 0.85
          }} />
        </div>
      </div>
    </div>
  );
};

const ChartCard = ({ icon, title, subtitle, open, onToggle, children, badge, badgeColor }) => (
  <div style={{
    background: '#fff', borderRadius: 10,
    border: '1px solid #ececec', overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  }}>
    <div onClick={onToggle} style={{
      padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
      background: open ? '#fafafa' : '#fff'
    }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <TLabel size={14} bold color="#222">{title}</TLabel>
        {subtitle && <TLabel size={11} color="#888">{subtitle}</TLabel>}
      </div>
      {badge && (
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
          background: badgeColor || '#fff5e6', color: '#a06000'
        }}>{badge}</span>
      )}
      <TLabel size={14} color="#888">{open ? '▾' : '▸'}</TLabel>
    </div>
    {open && (
      <div style={{ padding: '10px 12px 14px', borderTop: '1px solid #ececec' }}>
        {children}
      </div>
    )}
  </div>
);

/* Tiny mini-bar chart for poor man's preview */
const MiniBars = ({ data, accent = '#1a6b3a' }) => {
  const max = Math.max(...data.map(d => d.v), 1);
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 80, paddingBottom: 18, position: 'relative' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div style={{
            width: '100%', height: ((d.v / max) * 60) + 'px',
            background: d.v ? (d.color || accent) : '#eee',
            borderRadius: '3px 3px 0 0', minHeight: d.v ? 4 : 2
          }} />
          <TLabel size={9} color="#888" style={{ textAlign: 'center' }}>{d.l}</TLabel>
        </div>
      ))}
    </div>
  );
};

const MobileAnalytics = () => {
  const [period, setPeriod] = useStateTA('17 нед');
  const [openCard, setOpenCard] = useStateTA('contracts'); // первая раскрыта по умолчанию демо
  const toggle = (k) => setOpenCard(openCard === k ? null : k);

  return (
    <AndroidDevice width={380} height={760}>
      <div style={{ background: '#f0eee9', minHeight: '100%', position: 'relative', fontFamily: 'system-ui, -apple-system, Roboto, sans-serif' }}>
        <TAHeader
          title="Аналитика"
          subtitle="3 алерта · обновлено 11:42"
          online={true}
          syncing={false}
        />

        {/* Period selector */}
        <div style={{
          display: 'flex', gap: 6, padding: '8px 12px', background: '#fff',
          borderBottom: '1px solid #e0e0e0', overflowX: 'auto', alignItems: 'center'
        }}>
          <TLabel size={12} color="#888" style={{ marginRight: 2 }}>Период:</TLabel>
          {['Сегодня', '17 нед', 'Месяц', 'Сезон', '12.04—22.04'].map((t, i) => {
            const active = t === period;
            const calendar = i === 4;
            return (
              <div key={i} onClick={() => setPeriod(t)} style={{
                padding: '4px 10px',
                border: '1px solid ' + (active ? '#1a6b3a' : '#ccc'),
                background: active ? '#1a6b3a' : '#fff',
                color: active ? '#fff' : '#555',
                borderRadius: 14, fontSize: 12, fontWeight: active ? 600 : 400,
                whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4
              }}>
                {calendar && <span style={{ fontSize: 11 }}>📅</span>}{t}
              </div>
            );
          })}
        </div>

        {/* KPI tiles */}
        <div style={{ padding: '10px 12px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <TLabel size={13} bold color="#222">KPI по сырью</TLabel>
            <TLabel size={11} color="#888">{period}</TLabel>
            <div style={{ flex: 1 }} />
            <TLabel size={11} color="#1a6b3a" bold>Σ 17.8 млн ₽</TLabel>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ANALYTICS_KPI.map((d, i) => <KpiTile key={i} d={d} />)}
          </div>
        </div>

        {/* Collapsed charts list */}
        <div style={{ padding: '10px 12px 90px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: -2 }}>
            <TLabel size={13} bold color="#222">Графики</TLabel>
            <TLabel size={11} color="#888">тапни, чтобы раскрыть</TLabel>
            <div style={{ flex: 1 }} />
            <TLabel size={11} color="#888">6</TLabel>
          </div>

          <ChartCard
            icon="📄"
            title="Выполнение контрактов"
            subtitle="3 контракта · 1 риск"
            open={openCard === 'contracts'}
            onToggle={() => toggle('contracts')}
            badge="1 ⚠"
          >
            {[
              { name: 'Цой К.Т. · Черри', plan: 64000, fact: 65300, color: TRC['Черри']?.dot },
              { name: 'Ким Т. · Томаты',  plan: 66000, fact: 58100, color: TRC['Томаты']?.dot },
              { name: 'Генералов · Перец',plan: 31000, fact: 20000, color: TRC['Перец']?.dot },
            ].map((c, i) => {
              const pct = Math.round((c.fact / c.plan) * 100);
              const colP = pct >= 100 ? '#1a6b3a' : pct >= 80 ? '#a06000' : '#c33';
              return (
                <div key={i} style={{ marginTop: i ? 10 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 8, background: c.color }} />
                    <TLabel size={12} bold color="#222">{c.name}</TLabel>
                    <div style={{ flex: 1 }} />
                    <TLabel size={12} bold color={colP}>{pct}%</TLabel>
                  </div>
                  <div style={{ height: 6, background: '#f0eee9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: Math.min(pct, 100) + '%', height: '100%', background: colP, opacity: 0.85 }} />
                  </div>
                  <TLabel size={10} color="#888" style={{ marginTop: 2 }}>план {fmtKgTA(c.plan)} · факт {fmtKgTA(c.fact)}</TLabel>
                </div>
              );
            })}
          </ChartCard>

          <ChartCard
            icon="📈"
            title="Поставки по дням"
            subtitle="17 неделя · по дням"
            open={openCard === 'days'}
            onToggle={() => toggle('days')}
          >
            <MiniBars data={[
              { l: 'Пн', v: 68 }, { l: 'Вт', v: 39 }, { l: 'Ср', v: 0 },
              { l: 'Чт', v: 44 }, { l: 'Пт', v: 52 }, { l: 'Сб', v: 38 },
            ]} />
            <TLabel size={11} color="#888">Σ 241.8 т · средн. 40.3 т/день</TLabel>
          </ChartCard>

          <ChartCard
            icon="🏭"
            title="Топ-поставщики"
            subtitle="за период"
            open={openCard === 'top'}
            onToggle={() => toggle('top')}
          >
            {[
              { name: 'Цой К.Т.',    kg: 65300, color: TRC['Черри']?.dot },
              { name: 'Ким Т.',      kg: 58100, color: TRC['Томаты']?.dot },
              { name: 'Байрамов А.', kg: 38200, color: TRC['Огурцы']?.dot },
              { name: 'Генералов',   kg: 41700, color: '#999' },
              { name: 'Мищенко',     kg:  8724, color: TRC['Халапеньо']?.dot },
            ].sort((a, b) => b.kg - a.kg).map((s, i) => {
              const max = 65300;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                  <TLabel size={11} color="#888" style={{ width: 12 }}>{i + 1}</TLabel>
                  <div style={{ width: 8, height: 8, borderRadius: 8, background: s.color }} />
                  <TLabel size={12} bold color="#222" style={{ width: 80 }}>{s.name}</TLabel>
                  <div style={{ flex: 1, height: 8, background: '#f0eee9', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: ((s.kg / max) * 100) + '%', height: '100%', background: s.color }} />
                  </div>
                  <TLabel size={11} color="#222" style={{ minWidth: 56, textAlign: 'right' }}>{fmtKgTA(s.kg)}</TLabel>
                </div>
              );
            })}
          </ChartCard>

          <ChartCard
            icon="▦"
            title="Heatmap · сырьё × дни"
            subtitle="плотность поставок"
            open={openCard === 'heat'}
            onToggle={() => toggle('heat')}
          >
            {(() => {
              const raws = ['Огурцы', 'Черри', 'Томаты', 'Патиссоны', 'Халапеньо', 'Перец'];
              const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
              const hash = (r, d) => ((r.charCodeAt(0) * 13 + d.charCodeAt(0) * 7) % 100);
              return (
                <div>
                  {/* days header */}
                  <div style={{ display: 'flex', gap: 3, paddingLeft: 70 }}>
                    {days.map(d => (
                      <div key={d} style={{ flex: 1, textAlign: 'center' }}>
                        <TLabel size={10} color="#888">{d}</TLabel>
                      </div>
                    ))}
                  </div>
                  {raws.map(r => (
                    <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
                      <TLabel size={11} color="#222" style={{ width: 70 }}>{r}</TLabel>
                      {days.map(d => {
                        const v = hash(r, d);
                        const op = v < 15 ? 0.08 : (v / 100);
                        return (
                          <div key={d} style={{
                            flex: 1, height: 18,
                            background: TRC[r]?.dot || '#999',
                            opacity: op, borderRadius: 2
                          }} />
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })()}
          </ChartCard>

          <ChartCard
            icon="🚚"
            title="Рейсы по ТК"
            subtitle="кол-во рейсов и объём"
            open={openCard === 'tk'}
            onToggle={() => toggle('tk')}
          >
            {[
              { name: 'ТК Авто',    trips: 9, kg: 92500 },
              { name: 'ИП Фастов',  trips: 4, kg: 41200 },
              { name: 'ИП Рябов',   trips: 3, kg: 38400 },
              { name: 'ИП Кузн.',   trips: 2, kg: 19350 },
            ].map((t, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 0', borderTop: i ? '1px dashed #ececec' : 'none'
              }}>
                <TLabel size={13} bold color="#222" style={{ flex: 1 }}>{t.name}</TLabel>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 10,
                  background: '#e8f4ed', color: '#1a6b3a'
                }}>{t.trips} рейс.</span>
                <TLabel size={12} color="#222" style={{ minWidth: 56, textAlign: 'right' }}>{fmtKgTA(t.kg)}</TLabel>
              </div>
            ))}
          </ChartCard>

          <ChartCard
            icon="⚠"
            title="Алерты"
            subtitle="требуют внимания"
            open={openCard === 'alerts'}
            onToggle={() => toggle('alerts')}
            badge="3"
            badgeColor="#fdecec"
          >
            {[
              { sev: 'high',   text: 'Цой К.Т.: остаток бочек 6 шт — ниже минимума (мин. 20)' },
              { sev: 'mid',    text: 'Контракт «Ким Т. · Томаты» — отставание 12% к плану' },
              { sev: 'low',    text: '3 рейса без актов переработки старше 5 дней' },
            ].map((a, i) => {
              const map = {
                high: { c: '#c33', bg: '#fdecec', l: 'высокий' },
                mid:  { c: '#a06000', bg: '#fff5e6', l: 'средний' },
                low:  { c: '#1a4a8a', bg: '#eaf0fa', l: 'низкий' },
              }[a.sev];
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  padding: '8px 10px', borderRadius: 6, background: map.bg,
                  marginTop: i ? 6 : 0
                }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 8,
                    background: '#fff', color: map.c, border: '1px solid ' + map.c, flexShrink: 0
                  }}>{map.l}</span>
                  <TLabel size={12} color="#222" style={{ flex: 1 }}>{a.text}</TLabel>
                </div>
              );
            })}
          </ChartCard>
        </div>
      </div>
    </AndroidDevice>
  );
};

window.MobileTara = MobileTara;
window.MobileAnalytics = MobileAnalytics;
})();
