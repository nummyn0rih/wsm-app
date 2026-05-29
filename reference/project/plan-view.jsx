/* ─────────── PLAN VIEW (8.3а-1) ───────────
   Двухуровневое недельное планирование поставок:
   – верхний уровень: план завода (тонны по овощам × дни недели)
   – нижний уровень: плановые отгрузки от фермеров, наполняющие план
   Плановая и фактическая отгрузка — одна сущность в разных статусах:
     План → Запланировано → Отправлено → Прибыло.
*/

const { Box, Label, Pill, RAW_COLORS, StatusChip } = window;

/* Все овощи из справочника видов сырья.
   Первые 7 — с плановым/фактическим объёмом на текущей неделе.
   Остальные — сезонные, без отгрузок (используются в попапе видимости). */
const PLAN_RAWS = [
  'Огурцы', 'Черри', 'Томаты', 'Перец', 'Баклажан', 'Патиссоны', 'Халапеньо',
  'Кабачки', 'Тыква', 'Морковь', 'Свёкла', 'Лук', 'Капуста',
];
const PLAN_DAYS = [
  { code: 'ПН', long: 'понедельник' },
  { code: 'ВТ', long: 'вторник' },
  { code: 'СР', long: 'среда' },
  { code: 'ЧТ', long: 'четверг' },
  { code: 'ПТ', long: 'пятница' },
  { code: 'СБ', long: 'суббота' },
];
const PLAN_FARMERS = [
  'Генералов И.П.',
  'Мищенко А.С.',
  'Петров В.В.',
  'Байрамов А.Г.',
  'Цой К.Т.',
  'Ким Т.С.',
  'Шахматов Д.Р.',
];

/* три недели: прошлая (архив), текущая, следующая */
const PLAN_WEEKS = [
  /* ── архив ── (полностью в прошлом, read-only) */
  {
    offset: -1,
    weekNum: 16,
    label: 'Неделя 16',
    range: '14 – 19 апр 2025',
    daysOfMonth: ['14', '15', '16', '17', '18', '19'],
    monthLabel: 'апр 2025',
    archive: true,
    plan: {
      'Огурцы':    [15, 15, 15, 12, 10,  8],
      'Черри':     [10, 12, 12, 10,  8,  6],
      'Томаты':    [ 8, 10, 12, 12, 10,  0],
      'Перец':     [12,  0,  8, 10,  8,  0],
      'Баклажан':  [ 0,  0,  6,  6,  6,  0],
      'Патиссоны': [ 4,  4,  4,  0,  0,  0],
      'Халапеньо': [ 6,  6,  0,  0,  0,  0],
    },
    shipments: [
      { id:'s16-1',  day:0, raw:'Огурцы',    farmer:'Генералов И.П.', tons:8,   status:'Прибыло' },
      { id:'s16-2',  day:0, raw:'Огурцы',    farmer:'Мищенко А.С.',   tons:7,   status:'Прибыло' },
      { id:'s16-3',  day:0, raw:'Черри',     farmer:'Цой К.Т.',       tons:10,  status:'Прибыло' },
      { id:'s16-4',  day:0, raw:'Перец',     farmer:'Петров В.В.',    tons:12,  status:'Прибыло' },
      { id:'s16-5',  day:1, raw:'Огурцы',    farmer:'Байрамов А.Г.',  tons:15,  status:'Прибыло' },
      { id:'s16-6',  day:1, raw:'Черри',     farmer:'Цой К.Т.',       tons:12,  status:'Прибыло' },
      { id:'s16-7',  day:1, raw:'Томаты',    farmer:'Ким Т.С.',       tons:10,  status:'Прибыло' },
      { id:'s16-8',  day:2, raw:'Томаты',    farmer:'Ким Т.С.',       tons:12,  status:'Прибыло' },
      { id:'s16-9',  day:2, raw:'Огурцы',    farmer:'Генералов И.П.', tons:15,  status:'Прибыло' },
      { id:'s16-10', day:3, raw:'Баклажан',  farmer:'Шахматов Д.Р.',  tons:6,   status:'Прибыло' },
      { id:'s16-11', day:4, raw:'Перец',     farmer:'Петров В.В.',    tons:8,   status:'Прибыло' },
      { id:'s16-12', day:5, raw:'Огурцы',    farmer:'Генералов И.П.', tons:8,   status:'Прибыло' },
    ],
  },
  /* ── текущая неделя ── (показывает все 5 состояний цвета) */
  {
    offset: 0,
    weekNum: 17,
    label: 'Неделя 17',
    range: '21 – 26 апр 2025',
    daysOfMonth: ['21', '22', '23', '24', '25', '26'],
    monthLabel: 'апр 2025',
    archive: false,
    plan: {
      'Огурцы':    [20, 18, 20, 18, 15, 10],
      'Черри':     [ 0, 15, 15, 18, 15, 10],
      'Томаты':    [10, 12, 15, 15, 12,  0],
      'Перец':     [15,  0, 10, 12, 10,  0],
      'Баклажан':  [ 0,  0,  0,  8,  8,  0],
      'Патиссоны': [ 5,  5,  5,  0,  0,  0],
      'Халапеньо': [ 8,  8,  0,  0,  0,  0],
    },
    shipments: [
      // Огурцы ПН: 12+8=20 → норма (100%)
      { id:'s17-1',  day:0, raw:'Огурцы',    farmer:'Генералов И.П.', tons:12,  status:'Прибыло' },
      { id:'s17-2',  day:0, raw:'Огурцы',    farmer:'Мищенко А.С.',   tons:8,   status:'Отправлено' },
      // Огурцы ВТ: 14 / 18 = 78% → недобор (красный)
      { id:'s17-3',  day:1, raw:'Огурцы',    farmer:'Петров В.В.',    tons:14,  status:'Запланировано' },
      // Огурцы СР: 12+10=22 / 20 = 110% → норма (на грани)
      { id:'s17-4',  day:2, raw:'Огурцы',    farmer:'Генералов И.П.', tons:12,  status:'Запланировано' },
      { id:'s17-5',  day:2, raw:'Огурцы',    farmer:'Байрамов А.Г.',  tons:10,  status:'План' },
      // Огурцы ЧТ: 18+4=22 / 18 = 122% → перебор (оранж)
      { id:'s17-6',  day:3, raw:'Огурцы',    farmer:'Генералов И.П.', tons:18,  status:'План' },
      { id:'s17-7',  day:3, raw:'Огурцы',    farmer:'Мищенко А.С.',   tons:4,   status:'План' },
      // Огурцы ПТ: 14 / 15 = 93% → жёлтый
      { id:'s17-8',  day:4, raw:'Огурцы',    farmer:'Петров В.В.',    tons:14,  status:'План' },
      // Огурцы СБ: пустая ячейка с планом 10 → красный 0%
      // Черри: ПН plan 0
      { id:'s17-9',  day:0, raw:'Черри',     farmer:'Цой К.Т.',       tons:8,   status:'Прибыло' },  // план 0, фак 8 — серый/перебор? план=0 → empty/grey
      // Черри ВТ: 15 / 15 = 100% норма
      { id:'s17-10', day:1, raw:'Черри',     farmer:'Цой К.Т.',       tons:15,  status:'Отправлено' },
      // Черри СР: 8 / 15 = 53% красный
      { id:'s17-11', day:2, raw:'Черри',     farmer:'Цой К.Т.',       tons:8,   status:'Запланировано' },
      // Черри ЧТ: 10+8=18 / 18 = 100% норма
      { id:'s17-12', day:3, raw:'Черри',     farmer:'Цой К.Т.',       tons:10,  status:'План' },
      { id:'s17-13', day:3, raw:'Черри',     farmer:'Байрамов А.Г.',  tons:8,   status:'План' },
      // Томаты ПН: 10 / 10 = 100% норма
      { id:'s17-14', day:0, raw:'Томаты',    farmer:'Ким Т.С.',       tons:10,  status:'Прибыло' },
      // Томаты ВТ: 12 / 12 = 100% норма
      { id:'s17-15', day:1, raw:'Томаты',    farmer:'Ким Т.С.',       tons:12,  status:'Отправлено' },
      // Томаты СР: 16 / 15 = 107% норма
      { id:'s17-16', day:2, raw:'Томаты',    farmer:'Ким Т.С.',       tons:16,  status:'Запланировано' },
      // Перец ПН: 17 / 15 = 113% перебор
      { id:'s17-17', day:0, raw:'Перец',     farmer:'Петров В.В.',    tons:17,  status:'Запланировано' },
      // Перец СР: 5 / 10 = 50% красный
      { id:'s17-18', day:2, raw:'Перец',     farmer:'Петров В.В.',    tons:5,   status:'План' },
      // Баклажан ЧТ: 8 / 8 = 100%
      { id:'s17-19', day:3, raw:'Баклажан',  farmer:'Шахматов Д.Р.',  tons:8,   status:'План' },
      // Патиссоны ПН: 5 / 5 = 100%
      { id:'s17-20', day:0, raw:'Патиссоны', farmer:'Шахматов Д.Р.',  tons:5,   status:'Отправлено' },
      // Халапеньо ПН: 9 / 8 = 113% перебор
      { id:'s17-21', day:0, raw:'Халапеньо', farmer:'Шахматов Д.Р.',  tons:9,   status:'Прибыло' },
      // Халапеньо ВТ: 6 / 8 = 75% красный
      { id:'s17-22', day:1, raw:'Халапеньо', farmer:'Шахматов Д.Р.',  tons:6,   status:'Запланировано' },
    ],
  },
  /* ── следующая неделя ── */
  {
    offset: 1,
    weekNum: 18,
    label: 'Неделя 18',
    range: '28 апр – 3 мая 2025',
    daysOfMonth: ['28', '29', '30', '1', '2', '3'],
    monthLabel: 'апр – мая 2025',
    archive: false,
    plan: {
      'Огурцы':    [18, 18, 16, 16, 14, 10],
      'Черри':     [12, 15, 15, 15, 12,  8],
      'Томаты':    [10, 12, 12, 12, 10,  0],
      'Перец':     [12,  0,  8, 10,  8,  0],
      'Баклажан':  [ 0,  0,  6,  6,  6,  0],
      'Патиссоны': [ 4,  4,  4,  0,  0,  0],
      'Халапеньо': [ 6,  6,  0,  0,  0,  0],
    },
    shipments: [
      { id:'s18-1', day:0, raw:'Огурцы',    farmer:'Генералов И.П.', tons:10, status:'План' },
      { id:'s18-2', day:0, raw:'Огурцы',    farmer:'Мищенко А.С.',   tons:8,  status:'План' },
      { id:'s18-3', day:1, raw:'Огурцы',    farmer:'Байрамов А.Г.',  tons:12, status:'План' },
      { id:'s18-4', day:0, raw:'Черри',     farmer:'Цой К.Т.',       tons:8,  status:'План' },
      { id:'s18-5', day:1, raw:'Томаты',    farmer:'Ким Т.С.',       tons:10, status:'План' },
      { id:'s18-6', day:2, raw:'Баклажан',  farmer:'Шахматов Д.Р.',  tons:6,  status:'План' },
      { id:'s18-7', day:0, raw:'Перец',     farmer:'Петров В.В.',    tons:9,  status:'План' },
    ],
  },
];

const findWeek = (offset) => PLAN_WEEKS.find(w => w.offset === offset) || PLAN_WEEKS[1];

/* Цветовая индикация ячейки по соотношению факт/план
   ЗАФИКСИРОВАННОЕ ПРАВИЛО (задача 8.3а-2, часть 2):
     plan = 0, fact = 0  → empty    (серый, нет данных)
     plan = 0, fact > 0  → emptyOver (оранжевый, перебор без плана)
     fact < 80% plan     → short    (красный)
     80% ≤ fact < 100%   → close    (жёлтый)
     100% ≤ fact ≤ 120%  → norm     (зелёный)
     fact > 120%         → over     (оранжевый)
*/
function getCellState(plan, fact) {
  if (!plan || plan <= 0) {
    return (fact && fact > 0) ? 'emptyOver' : 'empty';
  }
  const pct = (fact / plan) * 100;
  if (pct < 80)   return 'short';
  if (pct < 100)  return 'close';
  if (pct <= 120) return 'norm';
  return 'over';
}

const CELL_STYLES = {
  empty:     { bg:'#f5f3ed', border:'#d8d4c8', bar:'#c8c4b8', label:'#999',   tag:null },
  emptyOver: { bg:'#fadbb8', border:'#d89060', bar:'#c06820', label:'#a04000', tag:'перебор (без плана)' },
  short:     { bg:'#fbe0e0', border:'#e0a0a0', bar:'#c04040', label:'#a02020', tag:'недобор' },
  close:     { bg:'#fbf2d8', border:'#d8c068', bar:'#c89020', label:'#a06000', tag:'почти план' },
  norm:      { bg:'#d8ead4', border:'#7eb070', bar:'#1a6b3a', label:'#1a6b3a', tag:'норма' },
  over:      { bg:'#fadbb8', border:'#d89060', bar:'#c06820', label:'#a04000', tag:'перебор' },
};

/* ─────────── ATOM: Progress bar ───────────
   Полноценный bar: 0–100% заполнение сплошным цветом по состоянию,
   <80% — красный, 80–99% — жёлтый, 100–120% — зелёный, >120% — зелёная база
   плюс штриховой «перебор» поверх правой части (за пределами 100%).
   Бар всегда занимает 100% ширины: шкала фиксированная 0…150%. */
const ProgressBar = ({ pct, plan, color, height = 8 }) => {
  const SCALE = 150;                                        // визуальная шкала bar'а
  const clamped = Math.max(0, Math.min(SCALE, pct));
  const fillW = (Math.min(100, clamped) / SCALE) * 100;     // % ширины bar'а
  const overW = pct > 100 ? ((Math.min(SCALE, pct) - 100) / SCALE) * 100 : 0;
  return (
    <div style={{
      width:'100%', height, position:'relative',
      background:'#fff', border:'1px solid #b8b4a8', borderRadius:2, overflow:'hidden',
    }}>
      {/* 100%-маркер */}
      <div style={{
        position:'absolute', top:-1, bottom:-1, left:`${(100/SCALE)*100}%`,
        width:1, background:'#333',
      }} />
      {/* фактическая заливка */}
      {plan > 0 && (
        <div style={{
          position:'absolute', top:0, left:0, height:'100%',
          width:`${fillW}%`, background: color, transition:'width .2s'
        }} />
      )}
      {/* перебор — штриховка справа от 100% */}
      {overW > 0 && (
        <div style={{
          position:'absolute', top:0, height:'100%',
          left:`${(100/SCALE)*100}%`, width:`${overW}%`,
          background:'repeating-linear-gradient(-45deg,#c06820,#c06820 3px,#fadbb8 3px,#fadbb8 6px)',
        }} />
      )}
      {/* нет плана, но есть факт — заполняем весь bar штриховкой как сигнал */}
      {plan <= 0 && pct === 0 && (
        <div style={{
          position:'absolute', inset:0,
          background:'repeating-linear-gradient(-45deg,#eceae2,#eceae2 3px,#fff 3px,#fff 6px)',
        }} />
      )}
    </div>
  );
};

/* ─────────── ATOM: Plan cell ───────────
   Вертикальный стек — день колонка узкая (~110–120px),
   план/факт каждый получает свою строку, input занимает всю доступную ширину. */
const PlanCell = ({ raw, day, plan, fact, count, open, onClick, onPlanChange, readonly }) => {
  const state = getCellState(plan, fact);
  const st = CELL_STYLES[state];
  const pct = plan > 0 ? Math.round((fact / plan) * 100) : 0;
  const rawC = RAW_COLORS[raw] || {};
  const formatTons = (n) => (Math.round(n * 10) / 10).toLocaleString('ru-RU', { maximumFractionDigits: 1 });
  const hasAny = plan > 0 || fact > 0;
  return (
    <div
      onClick={onClick}
      style={{
        position:'relative',
        height: 86,
        background: open ? '#fffbe8' : st.bg,
        border: open ? '2px solid #1a4a8a' : `1.5px solid ${st.border}`,
        borderRadius: 3,
        padding: '5px 6px 5px 10px',
        cursor:'pointer',
        display:'flex', flexDirection:'column', gap:3,
        boxShadow: open ? '0 0 0 3px rgba(26,74,138,0.18)' : 'none',
        overflow: 'hidden',
      }}
      title="Клик — открыть детализацию ячейки"
    >
      {/* row 1: «план» + input на всю ширину */}
      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
        <Label size={11} color="#7a7568" style={{ lineHeight:1, flexShrink:0 }}>план</Label>
        <input
          type="number"
          step="0.5"
          min="0"
          value={plan || ''}
          disabled={readonly}
          placeholder="—"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onPlanChange && onPlanChange(parseFloat(e.target.value) || 0)}
          style={{
            flex:1, width: 0, minWidth: 0,
            fontFamily:'JetBrains Mono, monospace', fontSize:13, fontWeight:700,
            border:'1px dashed #999', borderRadius:2,
            padding:'1px 4px', background: readonly ? '#f0ede5' : '#fffdf2',
            color:'#222', textAlign:'right', lineHeight:1.2,
          }}
        />
        <Label size={10} color="#888" style={{ lineHeight:1, flexShrink:0 }}>т</Label>
      </div>

      {/* row 2: «факт» + крупное значение */}
      <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
        <Label size={11} color="#7a7568" style={{ lineHeight:1, flexShrink:0 }}>факт</Label>
        <Label
          size={16}
          bold
          color={hasAny ? st.label : '#999'}
          style={{ fontFamily:'JetBrains Mono, monospace', lineHeight:1, flex:1, textAlign:'right' }}
        >
          {fact ? formatTons(fact) : '0'}
        </Label>
        <Label size={10} color="#888" style={{ lineHeight:1, flexShrink:0 }}>т</Label>
      </div>

      {/* row 3: настоящий progress bar */}
      <ProgressBar pct={pct} plan={plan} color={st.bar} height={8} />

      {/* row 4: % + count */}
      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
        <Label
          size={12}
          bold
          color={hasAny ? st.label : '#999'}
          style={{ fontFamily:'JetBrains Mono, monospace', lineHeight:1 }}
        >
          {plan > 0 ? pct + '%' : (fact > 0 ? 'без плана' : '—')}
        </Label>
        <div style={{ flex:1 }} />
        {count > 0 && (
          <span style={{
            display:'inline-flex', alignItems:'center', justifyContent:'center',
            minWidth:18, height:15, padding:'0 5px',
            background:'#fff', border:'1px solid #333', borderRadius:8,
            fontFamily:'JetBrains Mono, monospace', fontSize:10, fontWeight:700, color:'#333',
            lineHeight:1,
          }} title={`Плановых отгрузок: ${count}`}>{count} шт</span>
        )}
      </div>

      {/* corner ribbon — raw colour */}
      <div style={{
        position:'absolute', top:0, left:0, width:4, height:'100%',
        background: rawC.dot || '#999'
      }} />
    </div>
  );
};

/* ─────────── ATOM: Add-shipment modal ─────────── */
const PlanModal = ({ prefill, onSave, onClose }) => {
  const [farmer, setFarmer] = React.useState('');
  const [raw, setRaw] = React.useState(prefill?.raw || '');
  const [day, setDay] = React.useState(prefill?.day != null ? String(prefill.day) : '');
  const [tons, setTons] = React.useState('');

  const canSave = farmer && raw && day !== '' && parseFloat(tons) > 0;

  return (
    <div
      onClick={onClose}
      style={{
        position:'absolute', inset:0, background:'rgba(20,20,20,0.45)',
        display:'flex', alignItems:'center', justifyContent:'center',
        zIndex:50, fontFamily:'Caveat'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 440, background:'#fff', border:'2px solid #333', borderRadius:4,
          boxShadow:'4px 6px 0 rgba(0,0,0,0.18)', overflow:'hidden'
        }}
      >
        {/* Header */}
        <div style={{ background:'#2a2a2a', color:'#fff', padding:'7px 14px', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:16 }}>✎</span>
          <Label size={15} bold color="#fff">Новая плановая отгрузка</Label>
          <div style={{ flex:1 }} />
          <span onClick={onClose} style={{ cursor:'pointer', color:'#fff', fontSize:18, lineHeight:1 }} title="Закрыть">✕</span>
        </div>

        {/* Body */}
        <div style={{ padding:'12px 16px', display:'flex', flexDirection:'column', gap:10 }}>
          {prefill && (
            <div style={{
              padding:'5px 10px', background:'#e0ebf6', border:'1.5px dashed #1a4a8a',
              borderRadius:3, display:'flex', alignItems:'center', gap:6
            }}>
              <Label size={11} color="#1a4a8a" bold>ⓘ Открыто из ячейки таблицы — овощ и день предзаполнены</Label>
            </div>
          )}

          <div>
            <Label size={11} color="#888" style={{ textTransform:'uppercase', letterSpacing:1 }}>Фермер *</Label>
            <select
              value={farmer}
              onChange={(e) => setFarmer(e.target.value)}
              style={{ width:'100%', padding:'5px 8px', border:'1.5px solid #ccc', borderRadius:3, background:'#fffdf2', fontFamily:'Caveat', fontSize:15, marginTop:2 }}
            >
              <option value="">— выберите фермера —</option>
              {PLAN_FARMERS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div>
            <Label size={11} color="#888" style={{ textTransform:'uppercase', letterSpacing:1 }}>Овощ *</Label>
            <select
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              disabled={!!prefill?.raw}
              style={{ width:'100%', padding:'5px 8px', border:'1.5px solid #ccc', borderRadius:3, background: prefill?.raw ? '#e8e5df' : '#fffdf2', fontFamily:'Caveat', fontSize:15, marginTop:2 }}
            >
              <option value="">— выберите овощ —</option>
              {PLAN_RAWS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div style={{ display:'flex', gap:10 }}>
            <div style={{ flex:1 }}>
              <Label size={11} color="#888" style={{ textTransform:'uppercase', letterSpacing:1 }}>Дата прихода *</Label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                disabled={prefill?.day != null}
                style={{ width:'100%', padding:'5px 8px', border:'1.5px solid #ccc', borderRadius:3, background: prefill?.day != null ? '#e8e5df' : '#fffdf2', fontFamily:'Caveat', fontSize:15, marginTop:2 }}
              >
                <option value="">— день —</option>
                {PLAN_DAYS.map((d, i) => <option key={i} value={i}>{d.code} · {d.long}</option>)}
              </select>
              <Label size={10} color="#888" style={{ marginTop:2, fontStyle:'italic' }}>в пределах рабочих дней (ПН–СБ) недели</Label>
            </div>
            <div style={{ width: 130 }}>
              <Label size={11} color="#888" style={{ textTransform:'uppercase', letterSpacing:1 }}>Тоннаж, т *</Label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="0.0"
                value={tons}
                onChange={(e) => setTons(e.target.value)}
                style={{ width:'100%', padding:'5px 8px', border:'1.5px solid #ccc', borderRadius:3, background:'#fffdf2', fontFamily:'JetBrains Mono, monospace', fontSize:14, fontWeight:700, marginTop:2, textAlign:'right' }}
              />
              <Label size={10} color="#888" style={{ marginTop:2, fontStyle:'italic' }}>шаг 0,1</Label>
            </div>
          </div>

          <div style={{
            padding:'5px 10px', background:'#f5f3ed', border:'1.5px dashed #aaa',
            borderRadius:3
          }}>
            <Label size={11} color="#666">
              Статус новой отгрузки: <Pill color="#e2d4f0" textColor="#5530a0" size={11}>✎ План</Pill> · далее переводится в «Запланировано / Отправлено / Прибыло» из полной формы отгрузки.
            </Label>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:'10px 16px', background:'#f5f3ed', borderTop:'1.5px solid #ccc', display:'flex', gap:8, alignItems:'center' }}>
          <div style={{ flex:1 }} />
          <Box className="sk-gray" onClick={onClose} style={{ padding:'5px 14px', cursor:'pointer' }}>
            <Label size={13} bold>Отмена</Label>
          </Box>
          <Box
            onClick={() => canSave && onSave({ farmer, raw, day: parseInt(day, 10), tons: parseFloat(tons) })}
            className="sk-gray"
            style={{
              padding:'5px 14px', cursor: canSave ? 'pointer' : 'not-allowed',
              background: canSave ? '#1a6b3a' : '#a8a8a0',
              borderColor: canSave ? '#0d4020' : '#888',
              opacity: canSave ? 1 : 0.7,
            }}
          >
            <Label size={13} bold color="#fff">✓ Сохранить</Label>
          </Box>
        </div>
      </div>
    </div>
  );
};

/* ─────────── MAIN: PlanView ─────────── */
const PlanView = ({ initialWeekOffset = 0, initialOpenCell = null, initialModalOpen = false }) => {
  const [weekOffset, setWeekOffset] = React.useState(initialWeekOffset);
  const week = findWeek(weekOffset);

  // editable copies of plan + shipments (per session)
  const [planEdits, setPlanEdits] = React.useState({}); // key `${offset}|${raw}|${day}` → number
  const [extraShipments, setExtraShipments] = React.useState([]); // {weekOffset, ...rest}
  const [removedShipmentIds, setRemovedShipmentIds] = React.useState([]);
  const [statusOverrides, setStatusOverrides] = React.useState({}); // {shipmentId → newStatus}
  const [expanding, setExpanding] = React.useState(null); // shipment object being expanded

  const [openCell, setOpenCell] = React.useState(initialOpenCell); // {raw, day}
  const [modal, setModal] = React.useState(initialModalOpen ? { prefill: initialOpenCell } : null);

  const readonly = week.archive;

  // Build the combined shipment list for this week
  const shipments = React.useMemo(() => {
    const base = week.shipments.filter(s => !removedShipmentIds.includes(s.id));
    const extras = extraShipments.filter(s => s._wo === weekOffset).map(s => {
      const { _wo, ...rest } = s; return rest;
    });
    const all = [...base, ...extras];
    // Apply status overrides
    return all.map(s => statusOverrides[s.id] ? { ...s, status: statusOverrides[s.id] } : s);
  }, [week, extraShipments, removedShipmentIds, weekOffset, statusOverrides]);

  // Effective plan (week.plan + edits)
  const getPlan = (raw, day) => {
    const key = `${weekOffset}|${raw}|${day}`;
    if (planEdits[key] != null) return planEdits[key];
    return week.plan[raw]?.[day] ?? 0;
  };
  const setPlan = (raw, day, v) => {
    const key = `${weekOffset}|${raw}|${day}`;
    setPlanEdits(prev => ({ ...prev, [key]: v }));
  };

  // Aggregations
  const factFor = (raw, day) =>
    shipments.filter(s => s.raw === raw && s.day === day).reduce((a, s) => a + s.tons, 0);

  const planRow = (raw) => PLAN_DAYS.reduce((a, _, i) => a + getPlan(raw, i), 0);
  const factRow = (raw) => PLAN_DAYS.reduce((a, _, i) => a + factFor(raw, i), 0);
  const planCol = (day) => PLAN_RAWS.reduce((a, r) => a + getPlan(r, day), 0);
  const factCol = (day) => PLAN_RAWS.reduce((a, r) => a + factFor(r, day), 0);
  const planTotal = PLAN_RAWS.reduce((a, r) => a + planRow(r), 0);
  const factTotal = PLAN_RAWS.reduce((a, r) => a + factRow(r), 0);

  const cellShipments = openCell
    ? shipments.filter(s => s.raw === openCell.raw && s.day === openCell.day)
    : [];

  const onCellClick = (raw, day) => {
    if (openCell && openCell.raw === raw && openCell.day === day) {
      setOpenCell(null);
    } else {
      setOpenCell({ raw, day });
    }
  };

  const handleSave = ({ farmer, raw, day, tons }) => {
    const id = 'new-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    setExtraShipments(prev => [
      ...prev,
      { _wo: weekOffset, id, farmer, raw, day, tons, status: 'План' },
    ]);
    setModal(null);
  };

  const removeShipment = (id) => setRemovedShipmentIds(prev => [...prev, id]);

  /* ───── Per-week visibility of vegetables (LocalStorage) ───── */
  const visKey = `planVisibleVegetables_W${week.weekNum}_2025`;
  // null = «всё видно» (по умолчанию для новой недели)
  const [hiddenRaws, setHiddenRaws] = React.useState(() => {
    try {
      const raw = localStorage.getItem(visKey);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  });
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(visKey);
      setHiddenRaws(raw ? (JSON.parse(raw) || []) : []);
    } catch (e) { setHiddenRaws([]); }
  }, [visKey]);

  const persistHidden = (next) => {
    setHiddenRaws(next);
    try { localStorage.setItem(visKey, JSON.stringify(next)); } catch (e) {}
  };

  // Овощ нельзя скрыть, если в текущей неделе по нему есть план или отгрузки
  const isProtected = (raw) => {
    const hasPlan = PLAN_DAYS.some((_, di) => getPlan(raw, di) > 0);
    const hasShip = shipments.some(s => s.raw === raw);
    return hasPlan || hasShip;
  };
  // Защищённые овощи нельзя оставлять в hiddenRaws (на всякий случай чистим)
  const effectiveHidden = hiddenRaws.filter(r => !isProtected(r));
  const visibleRaws = PLAN_RAWS.filter(r => !effectiveHidden.includes(r));

  const [visPopoverOpen, setVisPopoverOpen] = React.useState(false);

  /* ───── Open full shipment form (form E reuse) ───── */
  // При клике «Раскрыть» — открывается существующая форма E с предзаполнением
  // (см. компонент FullShipmentFormModal ниже).

  const VEG_COL_W = 118;
  const TOTAL_COL_W = 118;

  const formatTons = (n) =>
    (Math.round(n * 10) / 10).toLocaleString('ru-RU', { maximumFractionDigits: 1 });

  return (
    <div style={{ padding: 12, fontFamily:'Caveat', position:'relative' }}>
      {/* ── 1. WEEK NAVIGATION ── */}
      <div style={{
        display:'flex', alignItems:'center', gap:10,
        padding:'8px 12px', background:'#fff',
        border:'2px solid #333', borderRadius:3, marginBottom: 10,
        boxShadow:'2px 3px 0 rgba(0,0,0,0.08)'
      }}>
        <Box
          onClick={() => weekOffset > -1 && setWeekOffset(weekOffset - 1)}
          className="sk-gray"
          style={{ padding:'4px 12px', cursor: weekOffset > -1 ? 'pointer' : 'not-allowed', opacity: weekOffset > -1 ? 1 : 0.4 }}
        >
          <Label size={15} bold>← Пред. неделя</Label>
        </Box>
        <div style={{ flex:1, textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
          <span style={{ fontSize:18 }}>📅</span>
          <Label size={20} bold color="#222">{week.label}</Label>
          <Label size={16} color="#555">·</Label>
          <Label size={17} color="#1a6b3a" bold>{week.range}</Label>
          {readonly && (
            <Pill color="#e8e5df" textColor="#666" size={12}>🔒 Архив (read-only)</Pill>
          )}
          {weekOffset === 0 && (
            <Pill color="#d4ead4" textColor="#1a6b3a" size={12}>● Текущая</Pill>
          )}
          {weekOffset === 1 && (
            <Pill color="#e0ebf6" textColor="#1a4a8a" size={12}>↗ Следующая</Pill>
          )}
        </div>
        <Box
          onClick={() => setWeekOffset(0)}
          className="sk-gray"
          style={{ padding:'4px 12px', cursor:'pointer', background: weekOffset === 0 ? '#1a6b3a' : undefined, borderColor: weekOffset === 0 ? '#0d4020' : undefined }}
        >
          <Label size={14} bold color={weekOffset === 0 ? '#fff' : '#333'}>⌂ Сегодня</Label>
        </Box>
        <Box
          onClick={() => weekOffset < 1 && setWeekOffset(weekOffset + 1)}
          className="sk-gray"
          style={{ padding:'4px 12px', cursor: weekOffset < 1 ? 'pointer' : 'not-allowed', opacity: weekOffset < 1 ? 1 : 0.4 }}
        >
          <Label size={15} bold>След. неделя →</Label>
        </Box>
      </div>

      {/* ── 4. CREATE BUTTON + summary line ── */}
      <div style={{
        display:'flex', alignItems:'center', gap:10, marginBottom: 8,
        padding:'6px 10px', background:'#f5f3ed',
        border:'1.5px solid #ccc', borderRadius:3
      }}>
        <Label size={14} bold color="#555">План завода</Label>
        <Label size={13} color="#888">·</Label>
        <Pill color="#e8e5df" size={12}>план Σ {formatTons(planTotal)} т</Pill>
        <Pill color={factTotal >= planTotal ? '#d4ead4' : '#fbe0e0'} textColor={factTotal >= planTotal ? '#1a6b3a' : '#a02020'} size={12}>
          набрано {formatTons(factTotal)} т
          {planTotal > 0 && ` · ${Math.round((factTotal/planTotal)*100)}%`}
        </Pill>
        {effectiveHidden.length > 0 && (
          <Pill color="#e8e5df" textColor="#666" size={11}>
            скрыто овощей: {effectiveHidden.length}
          </Pill>
        )}
        <div style={{ flex:1 }} />
        {!readonly && (
          <Box
            onClick={() => setModal({ prefill: null })}
            className="sk-gray"
            style={{ padding:'5px 14px', cursor:'pointer', background:'#1a6b3a', borderColor:'#0d4020', display:'flex', alignItems:'center', gap:5 }}
          >
            <span style={{ fontSize:14, color:'#fff' }}>＋</span>
            <Label size={14} bold color="#fff">Плановая отгрузка</Label>
          </Box>
        )}
        {/* Настройки видимости овощей */}
        <div style={{ position:'relative' }}>
          <Box
            onClick={() => setVisPopoverOpen(v => !v)}
            className="sk-gray"
            style={{
              padding:'5px 12px', cursor:'pointer',
              background: visPopoverOpen ? '#e8e5df' : '#fff',
              display:'flex', alignItems:'center', gap:5
            }}
            title="Настроить видимость овощей в таблице плана (для текущей недели)"
          >
            <span style={{ fontSize:14 }}>⚙</span>
            <Label size={13} bold>Настроить овощи</Label>
            {effectiveHidden.length > 0 && (
              <span style={{
                display:'inline-flex', alignItems:'center', justifyContent:'center',
                minWidth:16, height:16, padding:'0 4px',
                background:'#a02020', color:'#fff',
                borderRadius:8, fontSize:10, fontFamily:'JetBrains Mono, monospace', fontWeight:700,
              }}>{effectiveHidden.length}</span>
            )}
          </Box>
          {visPopoverOpen && (
            <VegVisibilityPopover
              allRaws={PLAN_RAWS}
              hiddenRaws={effectiveHidden}
              isProtected={isProtected}
              weekLabel={week.label}
              weekRange={week.range}
              onChange={persistHidden}
              onClose={() => setVisPopoverOpen(false)}
            />
          )}
        </div>
      </div>

      {/* ── 2. PLAN TABLE ── */}
      <div className="wsm-scroll" style={{
        border:'2px solid #333', borderRadius:3, overflow:'hidden', background:'#fff', marginBottom: 10,
      }}>
        <div style={{ width: '100%' }}>
          {/* Header row */}
          <div style={{ display:'flex', background:'#2a2a2a' }}>
            <div style={{
              width: VEG_COL_W, flexShrink:0, padding:'6px 10px',
              borderRight:'1px solid #555', background:'#2a2a2a'
            }}>
              <Label size={13} bold color="#fff">Овощ \ День</Label>
            </div>
            {PLAN_DAYS.map((d, i) => (
              <div key={i} style={{ flex:1, minWidth:0, padding:'6px 8px', borderRight:'1px solid #555', textAlign:'center' }}>
                <Label size={13} bold color="#fff" center>{d.code} · {week.daysOfMonth[i]}</Label>
                <Label size={10} color="#aaa" center style={{ fontStyle:'italic' }}>{week.monthLabel}</Label>
              </div>
            ))}
            <div style={{ width: TOTAL_COL_W, flexShrink:0, padding:'6px 8px', background:'#0d4020', textAlign:'center' }}>
              <Label size={13} bold color="#fff" center>Итого за неделю</Label>
            </div>
          </div>

          {/* Body rows: vegetables */}
          {visibleRaws.map((raw, ri) => {
            const c = RAW_COLORS[raw] || {};
            const planR = planRow(raw);
            const factR = factRow(raw);
            const rowPct = planR > 0 ? Math.round((factR / planR) * 100) : 0;
            const rowState = getCellState(planR, factR);
            const rowSt = CELL_STYLES[rowState];
            return (
              <React.Fragment key={raw}>
                <div style={{ display:'flex', background: ri % 2 === 0 ? '#fafaf6' : '#fff', borderTop:'1px solid #e5e2d8' }}>
                  {/* Veg name */}
                  <div style={{
                    width: VEG_COL_W, flexShrink:0, padding:'6px 10px', borderRight:'1px solid #ccc',
                    display:'flex', alignItems:'center', gap:6,
                    background: ri % 2 === 0 ? '#fafaf6' : '#fff'
                  }}>
                    <div style={{ width:12, height:12, borderRadius:12, background: c.dot || '#999', border:'1.5px solid #333', flexShrink:0 }} />
                    <Label size={15} bold color="#222">{raw}</Label>
                  </div>
                  {/* Day cells */}
                  {PLAN_DAYS.map((_, di) => {
                    const plan = getPlan(raw, di);
                    const fact = factFor(raw, di);
                    const count = shipments.filter(s => s.raw === raw && s.day === di).length;
                    const isOpen = openCell && openCell.raw === raw && openCell.day === di;
                    return (
                      <div key={di} style={{ flex:1, minWidth:0, padding:'4px', borderRight:'1px solid #e5e2d8' }}>
                        <PlanCell
                          raw={raw} day={di}
                          plan={plan} fact={fact} count={count}
                          open={isOpen}
                          onClick={() => onCellClick(raw, di)}
                          onPlanChange={(v) => setPlan(raw, di, v)}
                          readonly={readonly}
                        />
                      </div>
                    );
                  })}
                  {/* Row total */}
                  <div style={{
                    width: TOTAL_COL_W, flexShrink:0, padding:'6px 8px', background: '#f0f0c8',
                    display:'flex', flexDirection:'column', justifyContent:'center', gap:2
                  }}>
                    <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
                      <Label size={11} color="#666">план</Label>
                      <Label size={14} bold color="#222" style={{ fontFamily:'JetBrains Mono, monospace' }}>{formatTons(planR)}</Label>
                      <Label size={11} color="#666">т</Label>
                    </div>
                    <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
                      <Label size={11} color="#666">факт</Label>
                      <Label size={14} bold color={rowSt.label} style={{ fontFamily:'JetBrains Mono, monospace' }}>{formatTons(factR)}</Label>
                      <Label size={11} color="#666">т</Label>
                    </div>
                    {planR > 0 && (
                      <Label size={11} bold color={rowSt.label} style={{ fontFamily:'JetBrains Mono, monospace' }}>{rowPct}%</Label>
                    )}
                  </div>
                </div>

                {/* Cell detail panel — shown under the row that contains the open cell */}
                {openCell && openCell.raw === raw && (
                  <CellDetail
                    raw={raw}
                    day={openCell.day}
                    dayLabel={`${PLAN_DAYS[openCell.day].code}, ${week.daysOfMonth[openCell.day]} ${week.monthLabel.split(' ')[0]}`}
                    shipments={cellShipments}
                    plan={getPlan(raw, openCell.day)}
                    fact={factFor(raw, openCell.day)}
                    readonly={readonly}
                    onClose={() => setOpenCell(null)}
                    onAdd={() => setModal({ prefill: { raw, day: openCell.day } })}
                    onRemove={removeShipment}
                  />
                )}
              </React.Fragment>
            );
          })}

          {/* Footer row: day totals — считается по ВСЕМ овощам, включая скрытые */}
          <div style={{ display:'flex', background:'#0d4020', borderTop:'2px solid #1a6b3a' }}>
            <div style={{ width: VEG_COL_W, flexShrink:0, padding:'7px 10px', borderRight:'1px solid #1a6b3a', background:'#0d4020' }}>
              <Label size={14} bold color="#fff">Итого за день</Label>
              {effectiveHidden.length > 0 && (
                <Label size={9} color="#aed6be" style={{ fontStyle:'italic' }}>включая скрытые овощи</Label>
              )}
            </div>
            {PLAN_DAYS.map((_, di) => {
              const p = planCol(di);
              const f = factCol(di);
              const pct = p > 0 ? Math.round((f / p) * 100) : 0;
              const st = CELL_STYLES[getCellState(p, f)];
              return (
                <div key={di} style={{ flex:1, minWidth:0, padding:'6px 8px', borderRight:'1px solid #1a6b3a', textAlign:'center' }}>
                  <div style={{ display:'flex', justifyContent:'center', alignItems:'baseline', gap:4 }}>
                    <Label size={11} color="#aed6be">план</Label>
                    <Label size={14} bold color="#fff" style={{ fontFamily:'JetBrains Mono, monospace' }}>{formatTons(p)}</Label>
                  </div>
                  <div style={{ display:'flex', justifyContent:'center', alignItems:'baseline', gap:4 }}>
                    <Label size={11} color="#aed6be">факт</Label>
                    <Label size={13} bold color="#fff" style={{ fontFamily:'JetBrains Mono, monospace', background:st.bar, padding:'0 5px', borderRadius:2 }}>{formatTons(f)}</Label>
                    {p > 0 && <Label size={11} color="#aed6be">· {pct}%</Label>}
                  </div>
                </div>
              );
            })}
            <div style={{ width: TOTAL_COL_W, flexShrink:0, padding:'6px 8px', background:'#1a6b3a', textAlign:'center', display:'flex', flexDirection:'column', justifyContent:'center', gap:2 }}>
              <Label size={13} color="#aed6be">всего</Label>
              <Label size={17} bold color="#fff" style={{ fontFamily:'JetBrains Mono, monospace' }}>{formatTons(factTotal)} / {formatTons(planTotal)}</Label>
              <Label size={11} color="#aed6be">факт / план, т</Label>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display:'flex', gap:8, alignItems:'center', flexWrap:'wrap',
        padding:'6px 10px', background:'#fffbe8', border:'1.5px dashed #e09a20',
        borderRadius:3, marginBottom: 10
      }}>
        <Label size={12} bold color="#b06000">Цвет ячейки:</Label>
        {[
          { st:'empty',     l:'план не задан · факт = 0' },
          { st:'emptyOver', l:'план = 0, факт > 0 (перебор)' },
          { st:'short',     l:'недобор (<80%)' },
          { st:'close',     l:'почти план (80–99%)' },
          { st:'norm',      l:'норма (100–120%)' },
          { st:'over',      l:'перебор (>120%)' },
        ].map(it => (
          <div key={it.st} style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{ width:14, height:14, background: CELL_STYLES[it.st].bg, border:`1.5px solid ${CELL_STYLES[it.st].border}`, borderRadius:2 }} />
            <Label size={12} color="#666">{it.l}</Label>
          </div>
        ))}
        <div style={{ flex:1 }} />
        <Label size={11} color="#888" style={{ fontStyle:'italic' }}>
          клик по ячейке — детализация · «факт» = сумма всех плановых отгрузок (любого статуса)
        </Label>
      </div>

      {/* ── 5. WEEK SHIPMENTS LIST ── */}
      <ShipmentsList
        shipments={shipments}
        week={week}
        readonly={readonly}
        onRemove={removeShipment}
        onExpand={(s) => setExpanding(s)}
      />

      {/* ── Modal ── */}
      {modal && (
        <PlanModal
          prefill={modal.prefill}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* ── Expand → reuse existing Form E (with prefill) ── */}
      {expanding && (
        <FullShipmentFormModal
          shipment={expanding}
          week={week}
          onClose={() => setExpanding(null)}
          onConfirm={(id) => {
            // Одна и та же запись: переводим статус «План» → «Запланировано» (без дубликата)
            setStatusOverrides(prev => ({ ...prev, [id]: 'Запланировано' }));
            setExpanding(null);
          }}
        />
      )}
    </div>
  );
};

/* ─────────── ATOM: Cell detail (inline expander under row) ─────────── */
const CellDetail = ({ raw, day, dayLabel, shipments, plan, fact, readonly, onClose, onAdd, onRemove }) => {
  const c = RAW_COLORS[raw] || {};
  const pct = plan > 0 ? Math.round((fact / plan) * 100) : 0;
  const st = CELL_STYLES[getCellState(plan, fact)];
  return (
    <div style={{
      display:'flex', background:'#fffbe8',
      borderTop:'2px solid #1a4a8a', borderBottom:'2px solid #1a4a8a',
    }}>
      <div style={{
        flex:1, padding:'10px 14px',
        display:'flex', flexDirection:'column', gap:8
      }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
          <Label size={15} bold color="#1a4a8a">↳ Детализация ячейки</Label>
          <div style={{ width:10, height:10, borderRadius:10, background:c.dot || '#999', border:'1.5px solid #333' }} />
          <Label size={16} bold color="#222">{raw}</Label>
          <Label size={13} color="#888">·</Label>
          <Label size={16} bold color="#1a6b3a">{dayLabel}</Label>
          <Pill color={st.bg} textColor={st.label} size={11}>план {plan} т · факт {fact} т {plan > 0 ? `· ${pct}%` : ''}</Pill>
          <div style={{ flex:1 }} />
          <span onClick={onClose} style={{ cursor:'pointer', color:'#1a4a8a', fontSize:18, lineHeight:1 }} title="Свернуть">✕</span>
        </div>

        {/* Shipments list */}
        {shipments.length === 0 ? (
          <div style={{
            padding:'10px 12px', background:'#fff', border:'1.5px dashed #c8c4b8',
            borderRadius:3, textAlign:'center'
          }}>
            <Label size={13} color="#888" style={{ fontStyle:'italic' }}>На эту ячейку плановых отгрузок ещё нет</Label>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {shipments.map((s, i) => (
              <div key={s.id} style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'5px 10px', background:'#fff',
                border:'1.5px solid #d8d4c8', borderRadius:3
              }}>
                <Label size={11} color="#888" style={{ minWidth: 22, fontFamily:'JetBrains Mono, monospace' }}>#{i+1}</Label>
                <Label size={15} bold color="#222" style={{ minWidth: 160 }}>{s.farmer}</Label>
                <Label size={14} bold color="#1a6b3a" style={{ fontFamily:'JetBrains Mono, monospace', minWidth: 70 }}>{s.tons} т</Label>
                <StatusChip status={s.status} />
                <div style={{ flex:1 }} />
                {!readonly && s.status === 'План' && (
                  <Box className="sk-gray" style={{ padding:'2px 9px', cursor:'pointer' }}>
                    <Label size={12} bold>✎ Изменить</Label>
                  </Box>
                )}
                {!readonly && s.status !== 'План' && (
                  <Box className="sk-gray" style={{ padding:'2px 9px', cursor:'pointer' }}>
                    <Label size={12} bold>↗ Открыть</Label>
                  </Box>
                )}
                {!readonly && s.status === 'План' && (
                  <Box onClick={() => onRemove(s.id)} className="sk-gray" style={{ padding:'2px 9px', cursor:'pointer', background:'#fbe0e0', borderColor:'#a02020' }}>
                    <Label size={12} bold color="#a02020">× Удалить</Label>
                  </Box>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add button */}
        {!readonly && (
          <Box onClick={onAdd} className="sk-gray" style={{
            padding:'6px 12px', cursor:'pointer', background:'#1a4a8a', borderColor:'#0d2a55',
            alignSelf:'flex-start', display:'flex', alignItems:'center', gap:5
          }}>
            <span style={{ fontSize:14, color:'#fff' }}>＋</span>
            <Label size={13} bold color="#fff">Добавить отгрузку в эту ячейку</Label>
          </Box>
        )}
        {readonly && (
          <Label size={11} color="#888" style={{ fontStyle:'italic' }}>
            Архивная неделя — редактирование и добавление отключены.
          </Label>
        )}
      </div>
    </div>
  );
};

/* ─────────── ATOM: Shipments list (full week) ─────────── */
const ShipmentsList = ({ shipments, week, readonly, onRemove, onExpand }) => {
  const [statusFilter, setStatusFilter] = React.useState('all');
  const STATUSES = ['План', 'Запланировано', 'Отправлено', 'Прибыло'];
  const filtered = statusFilter === 'all' ? shipments : shipments.filter(s => s.status === statusFilter);
  const sorted = [...filtered].sort((a, b) => a.day - b.day || PLAN_RAWS.indexOf(a.raw) - PLAN_RAWS.indexOf(b.raw));

  return (
    <div style={{
      border:'2px solid #333', borderRadius:3, background:'#fff', overflow:'hidden',
    }}>
      <div style={{
        background:'#2a2a2a', padding:'7px 12px',
        display:'flex', alignItems:'center', gap:10
      }}>
        <Label size={14} bold color="#fff">Плановые отгрузки недели</Label>
        <Pill color="#444" textColor="#fff" size={11}>{shipments.length} шт</Pill>
        <div style={{ flex:1 }} />
        <Label size={12} color="#aaa">Статус:</Label>
        <div style={{ display:'inline-flex', gap:0, border:'1.5px solid #555', borderRadius:3, overflow:'hidden' }}>
          {['all', ...STATUSES].map((s, i) => (
            <div
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding:'3px 9px',
                background: statusFilter === s ? '#1a6b3a' : '#3a3a3a',
                borderRight: i < STATUSES.length ? '1.5px solid #555' : 'none',
                cursor:'pointer',
              }}
            >
              <Label size={11} bold color="#fff">{s === 'all' ? 'все' : s}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Column header */}
      <div style={{ display:'flex', background:'#444' }}>
        <div style={{ width: 110, padding:'5px 10px', borderRight:'1px solid #555' }}><Label size={12} bold color="#fff">Дата</Label></div>
        <div style={{ width: 200, padding:'5px 10px', borderRight:'1px solid #555' }}><Label size={12} bold color="#fff">Фермер</Label></div>
        <div style={{ width: 140, padding:'5px 10px', borderRight:'1px solid #555' }}><Label size={12} bold color="#fff">Овощ</Label></div>
        <div style={{ width: 90, padding:'5px 10px', borderRight:'1px solid #555', textAlign:'right' }}><Label size={12} bold color="#fff">Тонны</Label></div>
        <div style={{ width: 140, padding:'5px 10px', borderRight:'1px solid #555' }}><Label size={12} bold color="#fff">Статус</Label></div>
        <div style={{ flex:1, padding:'5px 10px' }}><Label size={12} bold color="#fff">Действия</Label></div>
      </div>

      {sorted.length === 0 ? (
        <div style={{ padding:'20px', textAlign:'center' }}>
          <Label size={13} color="#888" style={{ fontStyle:'italic' }}>Плановых отгрузок по выбранному фильтру нет</Label>
        </div>
      ) : (
        sorted.map((s, i) => {
          const c = RAW_COLORS[s.raw] || {};
          const planned = s.status === 'Запланировано';
          const rowBg = planned
            ? 'repeating-linear-gradient(-45deg,#fff,#fff 6px,#fff8e8 6px,#fff8e8 8px)'
            : (i % 2 === 0 ? '#fafaf6' : '#fff');
          return (
            <div key={s.id} style={{ display:'flex', background: rowBg, borderBottom:'1px solid #e5e2d8', alignItems:'stretch' }}>
              <div style={{ width: 110, padding:'5px 10px', borderRight:'1px solid #e5e2d8', display:'flex', alignItems:'center', gap:5 }}>
                <Label size={13} bold color="#1a6b3a">{PLAN_DAYS[s.day].code}</Label>
                <Label size={13} color="#555">{week.daysOfMonth[s.day]} {week.monthLabel.split(' ')[0]}</Label>
              </div>
              <div style={{ width: 200, padding:'5px 10px', borderRight:'1px solid #e5e2d8', display:'flex', alignItems:'center' }}>
                <Label size={14} bold color="#222">{s.farmer}</Label>
              </div>
              <div style={{ width: 140, padding:'5px 10px', borderRight:'1px solid #e5e2d8', display:'flex', alignItems:'center', gap:5 }}>
                <div style={{ width:9, height:9, borderRadius:9, background:c.dot || '#999', border:'1.2px solid #333', flexShrink:0 }} />
                <Label size={13} color="#222">{s.raw}</Label>
              </div>
              <div style={{ width: 90, padding:'5px 10px', borderRight:'1px solid #e5e2d8', display:'flex', alignItems:'center', justifyContent:'flex-end' }}>
                <Label size={14} bold color="#1a6b3a" style={{ fontFamily:'JetBrains Mono, monospace' }}>{s.tons} т</Label>
              </div>
              <div style={{ width: 140, padding:'5px 10px', borderRight:'1px solid #e5e2d8', display:'flex', alignItems:'center' }}>
                <StatusChip status={s.status} />
              </div>
              <div style={{ flex:1, padding:'4px 10px', display:'flex', alignItems:'center', gap:5 }}>
                {!readonly && s.status === 'План' && (
                  <Box className="sk-gray" style={{ padding:'2px 8px', cursor:'pointer' }} title="Быстрое редактирование плановой отгрузки">
                    <Label size={12} bold>✎ Редакт.</Label>
                  </Box>
                )}
                {s.status === 'План' ? (
                  <Box
                    onClick={() => onExpand && onExpand(s)}
                    className="sk-gray"
                    style={{ padding:'2px 8px', cursor:'pointer', background:'#1a4a8a', borderColor:'#0d2a55' }}
                    title="Раскрыть в полную отгрузку: предзаполнит фермера, овощ, дату, тоннаж — менеджер дозаполняет остальное"
                  >
                    <Label size={12} bold color="#fff">↗ Раскрыть</Label>
                  </Box>
                ) : (
                  <Box className="sk-gray" style={{ padding:'2px 8px', cursor:'pointer' }} title="Открыть карточку отгрузки">
                    <Label size={12} bold>↗ Открыть</Label>
                  </Box>
                )}
                {!readonly && s.status === 'План' && (
                  <Box onClick={() => onRemove(s.id)} className="sk-gray" style={{ padding:'2px 8px', cursor:'pointer', background:'#fbe0e0', borderColor:'#a02020' }}>
                    <Label size={12} bold color="#a02020">× Удалить</Label>
                  </Box>
                )}
              </div>
            </div>
          );
        })
      )}

      {/* Footer summary */}
      <div style={{
        display:'flex', padding:'6px 12px', background:'#f0f0c8',
        borderTop:'2px dashed #bbb', alignItems:'center', gap:10, flexWrap:'wrap'
      }}>
        <Label size={13} bold color="#555">Итого по фильтру:</Label>
        <Pill color="#fff" size={12}>{sorted.length} отгрузок</Pill>
        <Pill color="#fff" size={12}>Σ {sorted.reduce((a, s) => a + s.tons, 0).toFixed(1).replace('.', ',')} т</Pill>
        {['План', 'Запланировано', 'Отправлено', 'Прибыло'].map(st => {
          const cnt = sorted.filter(s => s.status === st).length;
          if (cnt === 0) return null;
          return <span key={st}><StatusChip status={st} /> <span style={{fontFamily:'Caveat',fontSize:12,color:'#555'}}>×{cnt}</span></span>;
        })}
      </div>
    </div>
  );
};

/* ─────────── ATOM: Full shipment form (форма E с предзаполнением) ───────────
   Переиспользование экрана «E · Форма добавления (мульти-позиции)».
   При раскрытии плановой отгрузки:
     – предзаполняется ОДНА позиция машины (сырьё, вес, поставщик)
     – предзаполняется «дата поступления на завод»
     – менеджер дозаполняет шапку (водитель, ТК, дата отгрузки) и при необходимости
       добавляет ДОПОЛНИТЕЛЬНЫЕ позиции (другие овощи / поставщики)
     – запись остаётся ОДНОЙ сущностью, статус «План» → «Запланировано»
*/
const PLAN_DRIVERS = [
  { name:'Мартыно В.', tk:'ИП Рябов' },
  { name:'Ахмедов Р.', tk:'ТК Авто' },
  { name:'Шахматов Д.', tk:'ТК Авто' },
  { name:'Иванов П.',  tk:'ИП Самойлов' },
];

const FormFieldE = ({ label, hint, value, onChange, placeholder, type='text', required, options, prefilled, readonly, mono, wide }) => {
  const baseInputStyle = {
    width:'100%', padding:'4px 7px',
    border:'1.5px solid #999', borderRadius:3,
    background: prefilled ? '#e0ebf6' : (readonly ? '#f0ede5' : '#fffdf2'),
    fontFamily: mono ? 'JetBrains Mono, monospace' : 'Caveat',
    fontSize: mono ? 13 : 14,
    fontWeight: prefilled ? 700 : 400,
    color:'#222',
  };
  return (
    <div style={{ flex: wide ? 2 : 1, minWidth: 0 }}>
      <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:2 }}>
        <Label size={11} bold color="#444">{label}{required && <span style={{ color:'#a02020' }}> *</span>}</Label>
        {hint && <Label size={10} color="#999" style={{ fontStyle:'italic' }}>{hint}</Label>}
        {prefilled && (
          <Pill color="#cfe0f4" textColor="#1a4a8a" size={9}>из плана</Pill>
        )}
      </div>
      {options ? (
        <select value={value} onChange={(e)=>onChange && onChange(e.target.value)} disabled={readonly} style={baseInputStyle}>
          <option value="">— выберите —</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={readonly}
          onChange={(e)=>onChange && onChange(e.target.value)}
          style={baseInputStyle}
        />
      )}
    </div>
  );
};

const FullShipmentFormModal = ({ shipment, week, onClose, onConfirm }) => {
  if (!shipment) return null;
  const dayLabel = `${PLAN_DAYS[shipment.day].code}, ${week.daysOfMonth[shipment.day]} ${week.monthLabel.split(' ')[0]}`;

  /* шапка */
  const [arrDate]   = React.useState(dayLabel); // предзаполнено, не редактируется здесь
  const [shipDate, setShipDate] = React.useState('');
  const [driver,   setDriver]   = React.useState('');
  const [comment,  setComment]  = React.useState('Раскрыто из плана недели · ' + week.label);

  // Автозаполнение ТК по водителю
  const tk = React.useMemo(() => {
    const d = PLAN_DRIVERS.find(d => d.name === driver);
    return d ? d.tk : '';
  }, [driver]);

  /* позиции */
  const [items, setItems] = React.useState([
    {
      id: 1,
      raw: shipment.raw,
      kg: String(Math.round(shipment.tons * 1000)),
      supplier: shipment.farmer,
      tara: '',
      prefilled: true, // визуально подсвечена как «из плана»
    },
  ]);

  const setItem = (id, patch) =>
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it));
  const addItem = () =>
    setItems(prev => [...prev, { id: Date.now(), raw:'', kg:'', supplier:'', tara:'', prefilled:false }]);
  const removeItem = (id) =>
    setItems(prev => prev.length > 1 ? prev.filter(it => it.id !== id) : prev);

  const totalKg = items.reduce((a, it) => a + (parseFloat(it.kg) || 0), 0);
  const uniqueSuppliers = new Set(items.map(it => it.supplier).filter(Boolean)).size;

  return (
    <div
      onClick={onClose}
      style={{
        position:'fixed', inset:0, background:'rgba(20,20,20,0.5)',
        display:'flex', alignItems:'flex-start', justifyContent:'center',
        paddingTop: 24, paddingBottom: 24, zIndex:1000, fontFamily:'Caveat', overflowY:'auto'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 760, maxWidth:'calc(100vw - 40px)',
          background:'#fff', border:'2.5px solid #333', borderRadius:6,
          boxShadow:'4px 4px 0 #33333340'
        }}
      >
        {/* Header — как в форме E, плюс баннер «раскрыто из плана» */}
        <div style={{
          background: '#1a6b3a', padding: '8px 14px',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <Label size={16} bold color="#fff">Новая отгрузка</Label>
          <Pill color="#cfe0f4" textColor="#1a4a8a" size={11}>↗ Раскрыто из плана</Pill>
          <Pill color="#e2d4f0" textColor="#5530a0" size={11}>✎ План</Pill>
          <Label size={14} color="#aed6be">→</Label>
          <Pill color="#fff0c8" textColor="#a06000" size={11}>⏷ Запланировано</Pill>
          <div style={{ flex: 1 }} />
          <Label size={18} color="#aed6be" style={{ cursor: 'pointer' }} onClick={onClose}>✕</Label>
        </div>

        <div style={{ padding:'10px 14px' }}>
          {/* Plan source banner */}
          <div style={{
            padding:'5px 10px', marginBottom:10,
            background:'#e0ebf6', border:'1.5px dashed #1a4a8a', borderRadius:3,
            display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'
          }}>
            <Label size={12} color="#1a4a8a" bold>ⓘ Используется существующая форма отгрузки. Поля из плана предзаполнены — менеджер дозаполняет остальное.</Label>
            <div style={{ flex:1 }} />
            <Pill color="#fff" textColor="#1a4a8a" size={11}>{week.label} · {dayLabel}</Pill>
          </div>

          {/* Section 1: Общая инфо (шапка машины) */}
          <div style={{ background:'#f5f3ef', padding:'8px 10px', border:'1px dashed #bbb', borderRadius:3, marginBottom:10 }}>
            <Label size={11} color="#666" style={{ marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>— Общая информация (1 машина) —</Label>
            <div style={{ display:'flex', gap:8, marginBottom:6 }}>
              <FormFieldE
                label="Дата отгрузки" hint="у поставщика"
                value={shipDate} onChange={setShipDate} placeholder="дд.мм" type="text" required mono
              />
              <FormFieldE
                label="Дата поступления" hint="на завод · из плана"
                value={dayLabel} prefilled readonly required
              />
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:6 }}>
              <FormFieldE
                label="Водитель" value={driver} onChange={setDriver}
                options={PLAN_DRIVERS.map(d => d.name)} required
              />
              <FormFieldE
                label="Транспортная компания" hint="авто по водителю"
                value={tk} readonly={!!driver} placeholder="выберется по водителю"
              />
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
              <div style={{ flex:1 }}>
                <Label size={12} bold style={{ marginBottom:2 }}>Статус</Label>
                <div style={{ display:'flex', gap:4 }}>
                  <Pill color="#fff0c8" textColor="#a06000" size={11}>● ⏷ Запланировано</Pill>
                  <Pill color="#f5f3ef" textColor="#999" size={11}>○ ✓ Отправлено</Pill>
                </div>
              </div>
              <div style={{ flex:1 }}>
                <Label size={12} bold style={{ marginBottom:2 }}>Комментарий <span style={{color:'#999', fontWeight:400, fontSize:10}}>опц.</span></Label>
                <input
                  value={comment} onChange={(e)=>setComment(e.target.value)}
                  style={{
                    width:'100%', padding:'3px 7px',
                    border:'1.5px solid #999', borderRadius:3,
                    background:'#fff', fontFamily:'Caveat', fontSize:13,
                    color:'#a06000', fontStyle:'italic',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Позиции */}
          <div style={{ marginBottom: 6, display:'flex', alignItems:'baseline', gap:6 }}>
            <Label size={13} bold>Позиции в машине</Label>
            <Label size={11} color="#888">первая позиция — из плановой отгрузки · можно добавить дополнительные (другие овощи / поставщики)</Label>
          </div>

          <div style={{ border:'1.5px solid #333', borderRadius:3, overflow:'hidden' }}>
            {/* Header */}
            <div style={{ display:'flex', background:'#2a2a2a', color:'#fff', padding:'3px 6px', gap:6 }}>
              <Label size={11} bold color="#fff" style={{ width:20 }}>№</Label>
              <Label size={11} bold color="#fff" style={{ flex:1.3 }}>Сырьё *</Label>
              <Label size={11} bold color="#fff" style={{ flex:1 }}>Вес, кг *</Label>
              <Label size={11} bold color="#fff" style={{ flex:1.5 }}>Поставщик *</Label>
              <Label size={11} bold color="#fff" style={{ flex:1.3 }}>Тара <span style={{fontWeight:400,opacity:0.7}}>опц.</span></Label>
              <Label size={11} bold color="#fff" style={{ width:20 }}></Label>
            </div>
            {items.map((it, i) => {
              const ic = RAW_COLORS[it.raw] || { bg:'#eee', dot:'#999' };
              const pf = it.prefilled;
              const cellBase = {
                borderRadius:2, padding:'2px 5px',
                background: pf ? '#e0ebf6' : '#fff',
                border: pf ? '1.5px dashed #1a4a8a' : '1px solid #aaa',
                display:'flex', alignItems:'center', gap:4,
              };
              return (
                <div key={it.id} style={{
                  display:'flex', gap:6, padding:'4px 6px',
                  background: (it.raw ? (ic.bg + '55') : '#fff'),
                  borderBottom:'1px dashed #ccc', alignItems:'center'
                }}>
                  <div style={{ width:20, display:'flex', alignItems:'center', gap:3 }}>
                    <Label size={11} color="#888">{i+1}</Label>
                    {pf && <span title="из плана" style={{ fontSize:10, color:'#1a4a8a' }}>★</span>}
                  </div>
                  <div style={{ flex:1.3, ...cellBase }}>
                    <div style={{ width:8, height:8, borderRadius:8, background: ic.dot || '#999' }}/>
                    <select
                      value={it.raw}
                      onChange={(e)=>setItem(it.id, { raw: e.target.value })}
                      style={{ flex:1, border:'none', background:'transparent', fontFamily:'Caveat', fontSize:13, fontWeight: pf ? 700 : 400, outline:'none', cursor:'pointer' }}
                    >
                      <option value="">— овощ —</option>
                      {PLAN_RAWS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div style={{ flex:1, ...cellBase }}>
                    <input
                      type="number"
                      value={it.kg}
                      onChange={(e)=>setItem(it.id, { kg: e.target.value })}
                      placeholder="0"
                      style={{ width:'100%', border:'none', background:'transparent', fontFamily:'JetBrains Mono, monospace', fontSize:12, fontWeight: pf ? 700 : 400, outline:'none', textAlign:'right' }}
                    />
                  </div>
                  <div style={{ flex:1.5, ...cellBase }}>
                    <select
                      value={it.supplier}
                      onChange={(e)=>setItem(it.id, { supplier: e.target.value })}
                      style={{ flex:1, border:'none', background:'transparent', fontFamily:'Caveat', fontSize:13, fontWeight: pf ? 700 : 400, outline:'none', cursor:'pointer' }}
                    >
                      <option value="">— поставщик —</option>
                      {PLAN_FARMERS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div style={{ flex:1.3, ...cellBase, background: pf ? '#e0ebf6' : (it.tara ? '#fff' : '#f5f3ef'), border: pf ? '1.5px dashed #1a4a8a' : '1px solid #aaa' }}>
                    <input
                      value={it.tara}
                      onChange={(e)=>setItem(it.id, { tara: e.target.value })}
                      placeholder="—"
                      style={{ flex:1, border:'none', background:'transparent', fontFamily:'Caveat', fontSize:13, outline:'none', color: it.tara ? '#333' : '#bbb' }}
                    />
                  </div>
                  <Label
                    size={14} color={items.length > 1 ? '#c33' : '#ddd'}
                    style={{ width:20, textAlign:'center', cursor: items.length > 1 ? 'pointer' : 'not-allowed' }}
                    onClick={()=>removeItem(it.id)}
                  >✕</Label>
                </div>
              );
            })}
            {/* Add row */}
            <div onClick={addItem} style={{ padding:'5px 8px', background:'#f0f0c8', cursor:'pointer', borderTop:'1px solid #bbb' }}>
              <Label size={12} bold color="#1a6b3a">＋ Добавить позицию (ещё сырьё / ещё поставщик)</Label>
            </div>
          </div>

          {/* Summary */}
          <div style={{ marginTop:8, padding:'5px 10px', background:'#eef6ee', borderRadius:3, display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <Label size={12} bold color="#1a6b3a">Итого в машине:</Label>
            <Pill color="#fff" size={11}>Σ {totalKg.toLocaleString('ru-RU')} кг</Pill>
            <Pill color="#fff" size={11}>{items.length} {items.length === 1 ? 'позиция' : items.length < 5 ? 'позиции' : 'позиций'}</Pill>
            <Pill color="#fff" size={11}>{uniqueSuppliers} {uniqueSuppliers === 1 ? 'поставщик' : 'поставщика'}</Pill>
          </div>

          {/* Info — same record, no duplicate */}
          <div style={{
            marginTop:8, padding:'6px 10px',
            background:'#fffbe8', border:'1.5px dashed #e09a20', borderRadius:3,
            display:'flex', flexDirection:'column', gap:2
          }}>
            <Label size={11} color="#b06000">ⓘ После сохранения:</Label>
            <Label size={11} color="#b06000">· запись та же — НЕ создаётся дубликат</Label>
            <Label size={11} color="#b06000">· статус: «План» → «Запланировано»</Label>
            <Label size={11} color="#b06000">· продолжает учитываться в ячейке плана недели по тому же овощу и дате прихода</Label>
            <Label size={11} color="#b06000">· дополнительные позиции учитываются в плане по своим овощам</Label>
          </div>

          <div style={{ borderTop:'1.5px dashed #ccc', margin:'10px 0' }} />

          {/* Footer — действия как в форме E */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems:'center' }}>
            <Box className="sk-gray" onClick={onClose} style={{ padding: '5px 16px', cursor: 'pointer' }}>
              <Label size={13}>Отмена</Label>
            </Box>
            <Box
              onClick={() => onConfirm && onConfirm(shipment.id)}
              className="sk-gray"
              style={{ padding: '5px 16px', cursor: 'pointer', background:'#eee' }}
            >
              <Label size={13}>Сохранить как запланировано</Label>
            </Box>
            <Box
              onClick={() => onConfirm && onConfirm(shipment.id)}
              className="sk-gray"
              style={{ padding: '5px 16px', cursor: 'pointer', background: '#1a6b3a', borderColor:'#0d4020' }}
            >
              <Label size={13} bold color="#fff">✓ Сохранить и отправить</Label>
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────── ATOM: Vegetable visibility popover ─────────── */
const VegVisibilityPopover = ({ allRaws, hiddenRaws, isProtected, weekLabel, weekRange, onChange, onClose }) => {
  const [local, setLocal] = React.useState(hiddenRaws);

  // Click-outside close
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose && onClose();
    };
    // small delay so the click that opened the popover doesn't immediately close it
    const t = setTimeout(() => document.addEventListener('mousedown', onDoc), 10);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', onDoc); };
  }, [onClose]);

  const toggle = (raw) => {
    if (isProtected(raw)) return;
    const next = local.includes(raw) ? local.filter(r => r !== raw) : [...local, raw];
    setLocal(next);
    onChange && onChange(next);
  };

  const allOn = () => { setLocal([]); onChange && onChange([]); };
  const hideUnused = () => {
    const next = allRaws.filter(r => !isProtected(r));
    setLocal(next); onChange && onChange(next);
  };

  const visibleCount = allRaws.length - local.filter(r => !isProtected(r)).length;

  return (
    <div
      ref={ref}
      style={{
        position:'absolute', top:'calc(100% + 6px)', right:0, zIndex:200,
        width: 320,
        background:'#fff', border:'2px solid #333', borderRadius:4,
        boxShadow:'4px 6px 0 rgba(0,0,0,0.18)',
        fontFamily:'Caveat',
      }}
    >
      {/* Header */}
      <div style={{ background:'#2a2a2a', color:'#fff', padding:'7px 12px', display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:14 }}>⚙</span>
        <Label size={14} bold color="#fff">Видимость овощей в таблице</Label>
        <div style={{ flex:1 }} />
        <span onClick={onClose} style={{ cursor:'pointer', color:'#fff', fontSize:16, lineHeight:1 }}>✕</span>
      </div>

      {/* Week scope */}
      <div style={{ padding:'5px 12px', background:'#f5f3ed', borderBottom:'1.5px solid #ccc' }}>
        <Label size={11} color="#666">Настройка применяется к неделе:</Label>
        <Label size={13} bold color="#1a6b3a"> {weekLabel} · {weekRange}</Label>
      </div>

      {/* Quick actions */}
      <div style={{ padding:'6px 10px', borderBottom:'1px solid #e5e2d8', display:'flex', gap:6 }}>
        <Box onClick={allOn} className="sk-gray" style={{ padding:'2px 8px', cursor:'pointer' }}>
          <Label size={11} bold>☑ Показать все</Label>
        </Box>
        <Box onClick={hideUnused} className="sk-gray" style={{ padding:'2px 8px', cursor:'pointer' }}>
          <Label size={11} bold>☐ Скрыть незанятые</Label>
        </Box>
        <div style={{ flex:1 }} />
        <Pill color="#e8e5df" size={10}>{visibleCount} / {allRaws.length}</Pill>
      </div>

      {/* List */}
      <div style={{ maxHeight: 320, overflowY:'auto', padding:'4px 6px' }}>
        {allRaws.map(raw => {
          const c = RAW_COLORS[raw] || {};
          const prot = isProtected(raw);
          const hidden = local.includes(raw) && !prot;
          const checked = !hidden;
          return (
            <div
              key={raw}
              onClick={() => toggle(raw)}
              style={{
                display:'flex', alignItems:'center', gap:8,
                padding:'5px 7px', borderRadius:3,
                cursor: prot ? 'not-allowed' : 'pointer',
                background: prot ? '#fafaf6' : 'transparent',
                opacity: prot ? 1 : 1,
              }}
              onMouseEnter={(e) => { if (!prot) e.currentTarget.style.background = '#f0f0c8'; }}
              onMouseLeave={(e) => { if (!prot) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{
                width:16, height:16, border:'1.5px solid ' + (prot ? '#888' : '#333'),
                borderRadius:2,
                background: checked ? (prot ? '#888' : '#1a6b3a') : '#fff',
                display:'flex', alignItems:'center', justifyContent:'center',
                flexShrink:0,
              }}>
                {checked && <span style={{ color:'#fff', fontSize:11, lineHeight:1, fontWeight:700 }}>✓</span>}
              </div>
              <div style={{ width:10, height:10, borderRadius:10, background: c.dot || '#999', border:'1px solid #333', flexShrink:0 }} />
              <Label size={14} bold color={hidden ? '#999' : '#222'} style={{ flex:1, textDecoration: hidden ? 'line-through' : 'none' }}>{raw}</Label>
              {prot && (
                <Pill color="#fff0c8" textColor="#a06000" size={9}>
                  есть отгрузки
                </Pill>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div style={{ padding:'6px 10px', background:'#fffbe8', borderTop:'1.5px dashed #e09a20', display:'flex', flexDirection:'column', gap:2 }}>
        <Label size={10} color="#b06000">ⓘ Овощи с плановыми/фактическими отгрузками на этой неделе нельзя скрыть.</Label>
        <Label size={10} color="#b06000">Итог «по дню» считается по ВСЕМ овощам (включая скрытые). Сохраняется по неделям.</Label>
      </div>
    </div>
  );
};

window.PlanView = PlanView;
