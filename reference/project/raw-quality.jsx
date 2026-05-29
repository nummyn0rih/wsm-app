/* ============================================================
   3.6  СПРАВОЧНИК «СЫРЬЁ» — расширение карточки вида сырья
        блоком «Параметры качества»

   Только карточки видов сырья. Список и др. части справочника
   из этой задачи не трогаем.
   ============================================================ */

const { useState: useStateRQ } = React;

const Box3   = window.Box;
const Label3 = window.Label;
const Pill3  = window.Pill;
const RAW3   = window.RAW_COLORS;

/* ───── атомы ───── */

const RoleBadge3 = ({ admin }) => (
  admin
    ? <Pill3 color="#fff0c8" textColor="#a06000" size={11}>👑 Только Админ</Pill3>
    : <Pill3 color="#e8f0e4" textColor="#1a6b3a" size={11}>👁 Просмотр</Pill3>
);

const Field3 = ({ label, value, w, mono }) => (
  <div style={{ flex: w ? `0 0 ${w}px` : 1, marginRight: 10 }}>
    <Label3 size={10} bold color="#666" style={{ textTransform:'uppercase', letterSpacing:0.5 }}>{label}</Label3>
    <div style={{
      border:'1.5px solid #999', borderRadius:3,
      padding:'4px 8px', background:'#fff', minHeight:24,
      marginTop:2,
      fontFamily: mono ? 'JetBrains Mono, monospace' : 'Caveat, cursive',
      fontSize: mono ? 11 : 14,
    }}>{value}</div>
  </div>
);

/* ───── роли параметра ───── */

const ROLES = {
  payable: {
    label: 'Детализирует вес к оплате',
    short: 'к оплате',
    bg:    '#d4e8c2',
    dot:   '#1a6b3a',
    hint:  'Σ таких параметров должна сходиться с весом к оплате',
  },
  nonstd: {
    label: 'Дублирует поле Нестандарт',
    short: '= Нестандарт',
    bg:    '#fff0c8',
    dot:   '#a06000',
    hint:  'Зеркалит базовое поле «Нестандарт» — может быть только один',
  },
  reject: {
    label: 'Дублирует поле Брак',
    short: '= Брак',
    bg:    '#ffd6d0',
    dot:   '#a83020',
    hint:  'На будущее — зеркало поля «Брак»',
  },
  info: {
    label: 'Информационный',
    short: 'инфо',
    bg:    '#e0e0e0',
    dot:   '#666',
    hint:  'Не участвует в расчётах',
  },
};

/* ───── одна строка параметра ───── */

const ParamRow = ({ p, admin, i, last }) => {
  const r = ROLES[p.role];
  return (
    <div style={{
      display:'flex', alignItems:'stretch',
      borderBottom: last ? 'none' : '1px solid #eee',
      background: i % 2 === 0 ? '#fafafa' : '#fff',
    }}>
      <div style={{ width:4, background:r.dot, flexShrink:0 }}/>
      {/* Название */}
      <div style={{ flex:1, padding:'6px 10px', display:'flex', alignItems:'center', gap:6, borderRight:'1px solid #eee' }}>
        <Label3 size={13} bold>{p.name}</Label3>
      </div>
      {/* Единица */}
      <div style={{ flex:'0 0 90px', padding:'6px 10px', display:'flex', alignItems:'center', borderRight:'1px solid #eee' }}>
        <Pill3 color="#e8e5df" size={11}>{p.unit}</Pill3>
      </div>
      {/* Роль — выпадающий список */}
      <div style={{ flex:'0 0 290px', padding:'6px 10px', display:'flex', alignItems:'center', gap:6, borderRight:'1px solid #eee' }}>
        <div style={{
          flex:1,
          border:'1.5px solid #999', borderRadius:3,
          padding:'2px 8px', background: admin ? '#fff' : '#f5f3ef',
          display:'flex', alignItems:'center', gap:6, minHeight:22,
        }}>
          <div style={{ width:8, height:8, borderRadius:8, background:r.dot, flexShrink:0 }}/>
          <Pill3 color={r.bg} size={10}>{r.short}</Pill3>
          <Label3 size={11} color="#444" style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {r.label}
          </Label3>
          <div style={{ flex:1 }}/>
          <Label3 size={11} color="#999">▾</Label3>
        </div>
      </div>
      {/* Кнопка удаления */}
      <div style={{ flex:'0 0 50px', padding:'6px 10px', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {admin
          ? <span title="Удалить параметр" style={{ cursor:'pointer', fontSize:14, color:'#c33' }}>🗑</span>
          : <span style={{ fontSize:14, opacity:0.25 }}>🗑</span>}
      </div>
    </div>
  );
};

/* ───── блок «Параметры качества» ───── */

const QualityBlock = ({ params, admin, baseRaw }) => {
  const c = RAW3[baseRaw] || { bg:'#eee', dot:'#999' };
  const payableSum = params.filter(p => p.role === 'payable').reduce((s,p) => s + (p.demoKg || 0), 0);
  const hasNonstd  = params.some(p => p.role === 'nonstd');

  return (
    <div style={{ marginTop: 16 }}>
      {/* Заголовок блока */}
      <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:6, flexWrap:'wrap' }}>
        <Label3 size={14} bold>🔬 Параметры качества</Label3>
        <Label3 size={11} color="#888" style={{ fontStyle:'italic' }}>
          определяют структуру модалки приёмки для «{baseRaw}»
        </Label3>
        <div style={{ flex:1 }}/>
        {params.length > 0 && (
          <>
            <Pill3 color="#d4e8c2" textColor="#1a6b3a" size={10}>
              к оплате: {params.filter(p=>p.role==='payable').length}
            </Pill3>
            {hasNonstd && <Pill3 color="#fff0c8" textColor="#a06000" size={10}>= Нестандарт</Pill3>}
          </>
        )}
      </div>

      {params.length > 0 ? (
        <>
          <div style={{ border:'1.5px solid #333', borderRadius:3, background:'#fff', overflow:'hidden' }}>
            {/* Header */}
            <div style={{ display:'flex', background:'#2a2a2a', color:'#fff', padding:'4px 0' }}>
              <div style={{ width:4 }}/>
              <Label3 size={11} bold color="#fff" style={{ flex:1, padding:'0 10px', borderRight:'1px solid #555' }}>Название</Label3>
              <Label3 size={11} bold color="#fff" style={{ flex:'0 0 90px', padding:'0 10px', borderRight:'1px solid #555' }}>Единица</Label3>
              <Label3 size={11} bold color="#fff" style={{ flex:'0 0 290px', padding:'0 10px', borderRight:'1px solid #555' }}>Роль</Label3>
              <Label3 size={11} bold color="#fff" style={{ flex:'0 0 50px', padding:'0 10px', textAlign:'center' }}>⌫</Label3>
            </div>
            {params.map((p, i) => (
              <ParamRow key={i} p={p} admin={admin} i={i} last={i === params.length - 1} />
            ))}
          </div>

          {/* Кнопка добавления */}
          {admin && (
            <div style={{
              marginTop:6,
              border:'1.5px dashed #1a6b3a', borderRadius:3,
              padding:'6px 10px', cursor:'pointer',
              background:'#f0f6ec',
              display:'inline-block',
            }}>
              <Label3 size={12} bold color="#1a6b3a">＋ Добавить параметр</Label3>
            </div>
          )}

          {/* Демо-сверка (на одну реальную приёмку) */}
          {payableSum > 0 && (
            <div style={{ marginTop:8, padding:'6px 10px', background:'#f5f3ef', border:'1px solid #ddd', borderRadius:3, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              <Label3 size={11} color="#666" bold style={{ textTransform:'uppercase', letterSpacing:0.5 }}>пример сверки</Label3>
              <Label3 size={11} color="#444">Σ «к оплате»:</Label3>
              <Pill3 color={c.bg} size={11}>
                {params.filter(p=>p.role==='payable').map(p=>p.demoKg.toLocaleString('ru-RU')).join(' + ')} = {payableSum.toLocaleString('ru-RU')} кг
              </Pill3>
              <Label3 size={11} color="#444">=</Label3>
              <Pill3 color="#d4e8c2" textColor="#1a6b3a" size={11}>вес к оплате {payableSum.toLocaleString('ru-RU')} кг ✓</Pill3>
            </div>
          )}
        </>
      ) : (
        <div style={{
          border:'1.5px dashed #bbb', borderRadius:4,
          padding:'18px 14px', background:'#fafafa',
          textAlign:'center',
        }}>
          <Label3 size={13} color="#888" style={{ fontStyle:'italic' }}>
            ⬚ Параметры качества не заданы
          </Label3>
          <div style={{ height:6 }}/>
          <Label3 size={11} color="#aaa">
            модалка приёмки покажет только базовый расчёт
          </Label3>
          <div style={{ height:8 }}/>
          {admin && (
            <div style={{
              display:'inline-block',
              border:'1.5px dashed #1a6b3a', borderRadius:3,
              padding:'5px 12px', cursor:'pointer',
              background:'#f0f6ec',
            }}>
              <Label3 size={12} bold color="#1a6b3a">＋ Добавить параметр</Label3>
            </div>
          )}
        </div>
      )}

      {/* Подсказка */}
      <div style={{ marginTop:8, padding:'7px 10px', background:'#eef4ff', border:'1px solid #c8d6ee', borderRadius:3, display:'flex', gap:6, alignItems:'flex-start' }}>
        <span style={{ fontSize:13, lineHeight:'16px' }}>💡</span>
        <Label3 size={11} color="#3a4a7a" style={{ lineHeight:1.4 }}>
          Параметры качества определяют структуру модалки приёмки для этого сырья.
          Если параметров нет — модалка покажет только базовый расчёт (факт / брак / нестандарт / к оплате).
        </Label3>
      </div>
    </div>
  );
};

/* ───── карточка вида сырья (с базовыми полями + блок параметров) ───── */

const RawMaterialCard = ({ raw, admin }) => {
  const c = RAW3[raw.name] || { bg:'#eee', dot:'#999' };
  return (
    <div style={{
      border:'2px solid #333', borderRadius:4, background:'#fff',
      padding:14,
    }}>
      {/* Шапка */}
      <div style={{ display:'flex', alignItems:'center', gap:10, paddingBottom:10, borderBottom:'1.5px dashed #ccc' }}>
        <div style={{
          width:36, height:36, borderRadius:18,
          background:c.bg, border:`2px solid ${c.dot}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:18, flexShrink:0,
        }}>{raw.icon}</div>
        <div style={{ display:'flex', flexDirection:'column' }}>
          <Label3 size={18} bold>{raw.name}</Label3>
          <div style={{ display:'flex', gap:6, marginTop:2 }}>
            <Pill3 color={c.bg} size={10}>цветовая метка</Pill3>
            {raw.active
              ? <Pill3 color="#d4e8c2" textColor="#1a6b3a" size={10}>активно</Pill3>
              : <Pill3 color="#eee" textColor="#999" size={10}>архив</Pill3>}
          </div>
        </div>
        <div style={{ flex:1 }}/>
        <RoleBadge3 admin={admin}/>
        {admin && (
          <Box3 className="sk-gray" style={{ padding:'4px 10px', cursor:'pointer' }}>
            <Label3 size={11}>✎ Редактировать</Label3>
          </Box3>
        )}
      </div>

      {/* Основные поля */}
      <div style={{ display:'flex', marginTop:10 }}>
        <Field3 label="Название" value={raw.name} w={200}/>
        <Field3 label="Ед. изм." value={raw.unit} w={100}/>
        <Field3 label="Сезон" value={raw.season} w={170}/>
        <Field3 label="Цвет (HEX)" value={c.dot} w={130} mono/>
      </div>

      {/* Блок параметров качества */}
      <QualityBlock params={raw.params} admin={admin} baseRaw={raw.name}/>
    </div>
  );
};

/* ───── две демо-карточки ───── */

const CUCUMBER = {
  name:'Огурцы',
  unit:'кг',
  season:'15 мая – 30 сен',
  active:true,
  icon:'🥒',
  params: [
    { name:'Калибр 6–9 см',  unit:'кг', role:'payable', demoKg: 12_400 },
    { name:'Калибр 9–12 см', unit:'кг', role:'payable', demoKg:  5_600 },
    { name:'Калибр 12+ см',  unit:'кг', role:'nonstd',  demoKg:    500 },
  ],
};

const TOMATO = {
  name:'Томаты',
  unit:'кг',
  season:'01 июл – 15 окт',
  active:true,
  icon:'🍅',
  params: [],
};

/* Полный экран справочника «Сырьё» с обеими карточками раскрытыми. */

const RawMaterialsCards = ({ admin }) => (
  <div style={{ padding:14 }}>
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, flexWrap:'wrap' }}>
      <Label3 size={18} bold>🥒 Справочник «Сырьё»</Label3>
      <Pill3 color="#fffbe8" textColor="#b06000" size={11}>расширение: «Параметры качества»</Pill3>
      <RoleBadge3 admin={admin}/>
      <div style={{ flex:1 }}/>
      {admin && (
        <Box3 className="sk-gray" style={{ padding:'5px 14px', cursor:'pointer', background:'#1a6b3a', borderColor:'#0d4020' }}>
          <Label3 size={13} bold color="#fff">＋ Новый вид сырья</Label3>
        </Box3>
      )}
    </div>

    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <RawMaterialCard raw={CUCUMBER} admin={admin}/>
      <RawMaterialCard raw={TOMATO}   admin={admin}/>
    </div>

    <div style={{ marginTop:12, padding:'8px 12px', background:'#fffbe8', border:'1.5px dashed #e09a20', borderRadius:4 }}>
      <Label3 size={13} color="#b06000">
        ✦ Новый блок в карточке вида сырья: <b>Параметры качества</b> · название · единица (по умолчанию «кг») · роль (выпадающий список: к оплате / = Нестандарт / = Брак / инфо) · кнопка 🗑 · ＋ Добавить параметр · подсказка о связке с модалкой приёмки
      </Label3>
    </div>
  </div>
);

/* ───── также — фрагмент с одним только блоком (для отдельного артборда) ───── */

const RawQualityBlockOnly = ({ raw, admin }) => (
  <div style={{ padding:14, background:'#f5f3ef' }}>
    <Label3 size={11} color="#888" style={{ textTransform:'uppercase', letterSpacing:0.5 }}>
      фрагмент карточки «{raw.name}» — блок параметров
    </Label3>
    <div style={{ height:6 }}/>
    <div style={{ border:'2px solid #333', borderRadius:4, background:'#fff', padding:14 }}>
      <QualityBlock params={raw.params} admin={admin} baseRaw={raw.name}/>
    </div>
  </div>
);

/* ===== expose ===== */
Object.assign(window, {
  RawMaterialsCards,
  RawQualityBlockOnly,
  __RAW_DEMO: { CUCUMBER, TOMATO },
});
