/* ─────────── ЛОГИСТИКА МАТЕРИАЛОВ ──────────────────────────────────
   Тара (дашборд, отправки, лом, передачи, журнал, инвентаризация)
   и Ингредиенты (отдельный интерфейс).
   Только Админ.
   ──────────────────────────────────────────────────────────────────── */

const { useState: useStateLG } = React;
const BoxL   = window.Box;
const LabelL = window.Label;
const PillL  = window.Pill;
const HRL    = window.HR;

/* ===== Цвета по типу тары — единая палитра, переиспользуется везде ===== */
const TARA_COLORS = {
  'Ящик':           { bg:'#d4eac2', dot:'#4a8f2a', icon:'▦' },
  'Бочка железо':   { bg:'#e0d4c0', dot:'#7a5a30', icon:'⏺' },
  'Бочка пластик':  { bg:'#c8dce8', dot:'#3a6b8a', icon:'⏺' },
};
const taraColor = (k) => TARA_COLORS[k] || { bg:'#eee', dot:'#999', icon:'▢' };

const INGR_COLORS = {
  'Уксус':              { bg:'#f0e0d0', dot:'#a06030' },
  'Соль':               { bg:'#eef0f2', dot:'#7a8a98' },
  'Аскорбиновая к-та':  { bg:'#fff0d8', dot:'#c08020' },
  'Пиросульфит':        { bg:'#e8d8e8', dot:'#7a5080' },
};
const ingrColor = (k) => INGR_COLORS[k] || { bg:'#eee', dot:'#999' };

/* ============================================================
   Общая «банковская» строка для жёсткой табличной вёрстки
   ============================================================ */
const Cell = ({ w, children, bold, color, mono, size, bg, align }) => (
  <div style={{
    width: w, flexShrink: 0,
    padding:'3px 8px',
    borderRight:'1px solid #d8d8d2',
    background: bg || 'transparent',
    display:'flex', alignItems:'center',
    justifyContent: align === 'right' ? 'flex-end' : (align === 'center' ? 'center' : 'flex-start'),
    overflow:'hidden', minHeight:24
  }}>
    <span style={{
      fontFamily: mono ? 'JetBrains Mono, monospace' : 'Caveat, cursive',
      fontSize: size || 12,
      fontWeight: bold ? 700 : 400,
      color: color || '#333',
      whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'
    }}>{children}</span>
  </div>
);

/* ============================================================
   6.1  ДАШБОРД ТАРЫ
   ============================================================ */
const TaraDashboard = () => {
  // alerts ribbon
  const alerts = [
    { sup:'Цой К.Т.',     tara:'ящик',    qty:8500, days:14, sev:'high' },
    { sup:'Мищенко',      tara:'бочка ж', qty:380,  days:9,  sev:'mid'  },
    { sup:'Генералов',    tara:'бочка п', qty:240,  days:7,  sev:'mid'  },
  ];

  // Завод
  const factory = {
    'Ящик':           { stock:6000,  scrap:0,   transit:12000 },
    'Бочка железо':   { stock:920,   scrap:0,   transit:140   },
    'Бочка пластик':  { stock:1450,  scrap:0,   transit:300   },
  };

  // Поставщики
  const suppliers = [
    { name:'Цой К.Т.',     region:'Ставрополь', flag:'stuck',
      tara:{ 'Ящик':{stock:8500, scrap:800, transit:3500}, 'Бочка железо':{stock:120, scrap:40, transit:0}, 'Бочка пластик':{stock:0, scrap:0, transit:0} } },
    { name:'Байрамов А.',  region:'Краснодар',  flag:'ok',
      tara:{ 'Ящик':{stock:2400, scrap:120, transit:600}, 'Бочка железо':{stock:0, scrap:0, transit:0}, 'Бочка пластик':{stock:90, scrap:0, transit:0} } },
    { name:'Генералов',    region:'Ростов',     flag:'mid',
      tara:{ 'Ящик':{stock:1200, scrap:90, transit:400}, 'Бочка железо':{stock:340, scrap:60, transit:120}, 'Бочка пластик':{stock:240, scrap:0, transit:0} } },
    { name:'Мищенко',      region:'Краснодар',  flag:'mid',
      tara:{ 'Ящик':{stock:0, scrap:0, transit:0}, 'Бочка железо':{stock:1180, scrap:380, transit:200}, 'Бочка пластик':{stock:0, scrap:0, transit:0} } },
    { name:'Ким Т.',       region:'Краснодар',  flag:'ok',
      tara:{ 'Ящик':{stock:0, scrap:0, transit:0}, 'Бочка железо':{stock:0, scrap:0, transit:0}, 'Бочка пластик':{stock:660, scrap:80, transit:120}} },
  ];

  const taraTypes = ['Ящик','Бочка железо','Бочка пластик'];

  const TriCell = ({ stock, scrap, transit, transitLabel = 'в пути' }) => (
    <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
      <div style={{ display:'flex', gap:4, alignItems:'baseline' }}>
        <LabelL size={15} bold color="#222" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:13 }}>
          {stock.toLocaleString()}
        </LabelL>
        <LabelL size={10} color="#888">шт</LabelL>
      </div>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        {scrap > 0 && (
          <PillL color="#f5d8c8" textColor="#a04020" size={10}>лом {scrap}</PillL>
        )}
        {transit > 0 && (
          <PillL color="#fff0c8" textColor="#a06000" size={10}>↗ {transit} {transitLabel}</PillL>
        )}
        {scrap === 0 && transit === 0 && (
          <LabelL size={10} color="#bbb">— · —</LabelL>
        )}
      </div>
    </div>
  );

  const flagBadge = (f) =>
    f === 'stuck' ? <PillL color="#f5c8c8" textColor="#a02020" size={10}>⚠ зависшая</PillL>
    : f === 'mid' ? <PillL color="#fff0c8" textColor="#a06000" size={10}>● внимание</PillL>
    : null;

  return (
    <div style={{ padding:14, fontFamily:'Caveat' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
        <LabelL size={20} bold color="#222">📦 Тара · Дашборд</LabelL>
        <PillL color="#fff0c8" textColor="#a06000" size={11}>👑 только Админ</PillL>
        <div style={{ flex:1 }} />
        <BoxL className="sk-gray" style={{ padding:'4px 10px', cursor:'pointer' }}>
          <LabelL size={12}>↓ Excel</LabelL>
        </BoxL>
        <BoxL className="sk-gray" style={{ padding:'4px 10px', cursor:'pointer' }}>
          <LabelL size={12}>🖨</LabelL>
        </BoxL>
      </div>

      {/* Alerts ribbon */}
      <div style={{
        background:'#fff5e8', border:'1.5px solid #e0a060', borderRadius:4,
        padding:'6px 10px', marginBottom:12,
        display:'flex', alignItems:'center', gap:10, flexWrap:'wrap'
      }}>
        <LabelL size={14} bold color="#a04000" style={{ whiteSpace:'nowrap' }}>⚠ Зависшая тара:</LabelL>
        {alerts.map((a, i) => (
          <div key={i} style={{
            display:'flex', alignItems:'center', gap:5,
            padding:'2px 8px',
            background: a.sev === 'high' ? '#f5c8c8' : '#ffe8c8',
            border:'1px solid #c08040', borderRadius:14
          }}>
            <LabelL size={12} bold color="#702020">{a.sup}</LabelL>
            <LabelL size={11} color="#702020">· {a.qty.toLocaleString()} {a.tara}</LabelL>
            <LabelL size={11} color="#a04000" style={{ fontStyle:'italic' }}>· {a.days} дн.</LabelL>
          </div>
        ))}
        <div style={{ flex:1 }} />
        <LabelL size={11} color="#a06000" style={{ fontStyle:'italic' }}>порог: &gt; 7 дн. без движения</LabelL>
      </div>

      {/* Завод card — featured */}
      <div style={{
        border:'2.5px solid #1a6b3a', borderRadius:5, marginBottom:14,
        boxShadow:'3px 3px 0 #1a6b3a30', overflow:'hidden'
      }}>
        <div style={{
          background:'#1a6b3a', padding:'7px 12px',
          display:'flex', alignItems:'center', gap:10
        }}>
          <span style={{ fontSize:18 }}>🏭</span>
          <LabelL size={17} bold color="#fff">Завод</LabelL>
          <PillL color="#0d4020" textColor="#aed6be" size={11}>центральный склад</PillL>
          <div style={{ flex:1 }} />
          <BoxL className="sk-gray" style={{ padding:'2px 10px', cursor:'pointer', background:'#0d4020', borderColor:'#082810' }}>
            <LabelL size={11} color="#aed6be">⚙ скорректировать остаток</LabelL>
          </BoxL>
        </div>
        <div style={{ display:'flex', background:'#fff' }}>
          {taraTypes.map((t, i) => {
            const c = taraColor(t);
            const d = factory[t];
            return (
              <div key={t} style={{
                flex:1, padding:'10px 14px',
                borderRight: i < taraTypes.length - 1 ? '1.5px dashed #c8c8c0' : 'none',
                background: c.bg + '30'
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                  <div style={{ width:12, height:12, borderRadius:3, background:c.dot }} />
                  <LabelL size={14} bold color="#333">{t}</LabelL>
                </div>
                <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
                  <LabelL size={26} bold color="#1a6b3a" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:22 }}>
                    {d.stock.toLocaleString()}
                  </LabelL>
                  <LabelL size={12} color="#888">шт</LabelL>
                </div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:5 }}>
                  {d.scrap > 0
                    ? <PillL color="#f5d8c8" textColor="#a04020" size={11}>лом {d.scrap}</PillL>
                    : <PillL color="#eee" textColor="#999" size={11}>лом 0</PillL>}
                  {d.transit > 0 && (
                    <PillL color="#fff0c8" textColor="#a06000" size={11}>↗ {d.transit.toLocaleString()} в пути на завод</PillL>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suppliers grid */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
        <LabelL size={15} bold color="#333">Поставщики с тарой</LabelL>
        <PillL color="#e8e5df" size={11}>{suppliers.length}</PillL>
        <div style={{ flex:1 }} />
        <BoxL className="sk-gray" style={{ padding:'2px 8px', cursor:'pointer' }}>
          <LabelL size={11}>🔍 поиск</LabelL>
        </BoxL>
        <BoxL className="sk-gray" style={{ padding:'2px 8px', cursor:'pointer' }}>
          <LabelL size={11}>⌕ регион ▾</LabelL>
        </BoxL>
        <BoxL className="sk-gray" style={{ padding:'2px 8px', cursor:'pointer' }}>
          <LabelL size={11}>⚠ только зависшие</LabelL>
        </BoxL>
      </div>

      {/* Table-like grid: supplier rows × 3 tara columns */}
      <div style={{ border:'2px solid #333', borderRadius:3, overflow:'hidden', background:'#fff' }}>
        {/* header */}
        <div style={{ display:'flex', background:'#2a2a2a', color:'#fff' }}>
          <div style={{ width:200, padding:'5px 10px', borderRight:'1px solid #555' }}>
            <LabelL size={12} bold color="#fff">Поставщик</LabelL>
          </div>
          {taraTypes.map((t, i) => (
            <div key={t} style={{
              flex:1, padding:'5px 10px',
              borderRight: i < taraTypes.length - 1 ? '1px solid #555' : 'none',
              display:'flex', alignItems:'center', gap:6
            }}>
              <div style={{ width:10, height:10, borderRadius:2, background:taraColor(t).dot }} />
              <LabelL size={12} bold color="#fff">{t}</LabelL>
              <LabelL size={10} color="#aaa" style={{ fontStyle:'italic' }}>остаток · лом · в пути</LabelL>
            </div>
          ))}
          <div style={{ width:32 }} />
        </div>
        {/* rows */}
        {suppliers.map((s, i) => (
          <div key={i} style={{
            display:'flex', borderBottom:'1px solid #e8e5df',
            background: s.flag === 'stuck' ? 'repeating-linear-gradient(-45deg,#fff,#fff 6px,#fff0e8 6px,#fff0e8 8px)' : (i % 2 ? '#fafafa' : '#fff')
          }}>
            <div style={{ width:200, padding:'7px 10px', borderRight:'1px solid #e0e0e0', display:'flex', flexDirection:'column', gap:2 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <LabelL size={14} bold color="#222">{s.name}</LabelL>
                {flagBadge(s.flag)}
              </div>
              <LabelL size={11} color="#888">📍 {s.region}</LabelL>
            </div>
            {taraTypes.map((t, j) => {
              const d = s.tara[t];
              const empty = d.stock === 0 && d.scrap === 0 && d.transit === 0;
              return (
                <div key={t} style={{
                  flex:1, padding:'7px 10px',
                  borderRight: j < taraTypes.length - 1 ? '1px solid #e0e0e0' : 'none',
                  background: empty ? '#f5f3ef' : 'transparent',
                  opacity: empty ? 0.45 : 1
                }}>
                  {empty
                    ? <LabelL size={11} color="#aaa" style={{ fontStyle:'italic' }}>— нет —</LabelL>
                    : <TriCell stock={d.stock} scrap={d.scrap} transit={d.transit} transitLabel="в пути к нему" />}
                </div>
              );
            })}
            <div style={{ width:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <LabelL size={14} color="#888">⋯</LabelL>
            </div>
          </div>
        ))}
        {/* footer totals */}
        <div style={{ display:'flex', background:'#f0f0c8', borderTop:'2px dashed #bbb' }}>
          <div style={{ width:200, padding:'5px 10px', borderRight:'1px solid #d8d8c0' }}>
            <LabelL size={13} bold color="#555">Итого у поставщиков</LabelL>
          </div>
          {taraTypes.map((t, j) => {
            const sum = suppliers.reduce((a, s) => ({
              stock:   a.stock   + s.tara[t].stock,
              scrap:   a.scrap   + s.tara[t].scrap,
              transit: a.transit + s.tara[t].transit,
            }), { stock:0, scrap:0, transit:0 });
            return (
              <div key={t} style={{
                flex:1, padding:'5px 10px',
                borderRight: j < taraTypes.length - 1 ? '1px solid #d8d8c0' : 'none'
              }}>
                <TriCell stock={sum.stock} scrap={sum.scrap} transit={sum.transit} transitLabel="суммарно" />
              </div>
            );
          })}
          <div style={{ width:32 }} />
        </div>
      </div>

      <div style={{ marginTop:10, padding:'8px 12px', background:'#fffbe8', border:'1.5px dashed #e09a20', borderRadius:4 }}>
        <LabelL size={13} color="#b06000">
          ✦ Завод сверху, особо выделен · поставщики ниже · алерты по зависшей таре наверху · клик по поставщику → карточка с журналом и инвентаризацией
        </LabelL>
      </div>
    </div>
  );
};

/* ============================================================
   6.2  ОТПРАВКИ ТАРЫ НА ПОСТАВЩИКОВ
   ============================================================ */
const TaraOutbound = () => {
  // documents — модель как у отгрузок: одна машина = N позиций для разных поставщиков
  const docs = [
    {
      id:'#T-0421',
      date:'21 апр',
      driver:'Кузнецов А.',
      tk:'АвтоЛогист',
      car:'Е 712 ВК 77',
      status:'В пути',
      autoHint: false,
      items:[
        { sup:'Цой К.Т.',    tara:'Ящик',          qty:1500 },
        { sup:'Байрамов А.', tara:'Ящик',          qty:600  },
        { sup:'Мищенко',     tara:'Бочка железо',  qty:120  },
      ]
    },
    {
      id:'#T-0419',
      date:'19 апр',
      driver:'Ахмедов Р.',
      tk:'ТрансЮг',
      car:'М 045 НА 50',
      status:'В пути',
      autoHint: true, // прошло > 2 дней
      items:[
        { sup:'Генералов',   tara:'Бочка пластик', qty:240  },
        { sup:'Цой К.Т.',    tara:'Ящик',          qty:2000 },
      ]
    },
    {
      id:'#T-0417',
      date:'17 апр',
      driver:'Гриненко К.',
      tk:'Дальпуть',
      car:'А 318 СН 77',
      status:'Доставлено',
      autoHint: false,
      items:[
        { sup:'Цой К.Т.',    tara:'Ящик',          qty:5000 },
      ]
    },
    {
      id:'#T-0415',
      date:'15 апр',
      driver:'Шахматов',
      tk:'АвтоЛогист',
      car:'Х 902 ЕМ 50',
      status:'Доставлено',
      autoHint: false,
      items:[
        { sup:'Ким Т.',      tara:'Бочка пластик', qty:200  },
        { sup:'Мищенко',     tara:'Бочка железо',  qty:60   },
      ]
    },
  ];

  const StatusBadge = ({ s }) => {
    if (s === 'Доставлено') return <PillL color="#c8e8c8" textColor="#1a6b3a" size={11}>✓ Доставлено</PillL>;
    return <PillL color="#fff0c8" textColor="#a06000" size={11}>↗ В пути</PillL>;
  };

  return (
    <div style={{ padding:14, fontFamily:'Caveat' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
        <LabelL size={20} bold color="#222">🚚 Отправки тары на поставщиков</LabelL>
        <PillL color="#fff0c8" textColor="#a06000" size={11}>👑 только Админ</PillL>
        <div style={{ flex:1 }} />
        <BoxL className="sk-gray" style={{ padding:'5px 14px', cursor:'pointer', background:'#1a6b3a', borderColor:'#0d4020' }}>
          <LabelL size={13} bold color="#fff">＋ Новая отправка</LabelL>
        </BoxL>
      </div>

      {/* Info banner */}
      <div style={{
        background:'#eef6ee', border:'1.5px dashed #1a6b3a', borderRadius:4,
        padding:'6px 10px', marginBottom:10
      }}>
        <LabelL size={13} color="#1a6b3a">
          ℹ В одной машине может ехать тара для разных поставщиков — модель как у отгрузок сырья.
          Списание с «Завода» — в момент создания. Поступление к поставщику — при переводе в «Доставлено».
          Эти рейсы попадают в аналитику ТК как «Обратный рейс».
        </LabelL>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:6, marginBottom:8, alignItems:'center', flexWrap:'wrap', padding:'6px 8px', background:'#f5f3ed', border:'1.5px solid #ccc', borderRadius:3 }}>
        <LabelL size={13} bold color="#555" style={{ marginRight:4 }}>Фильтры:</LabelL>
        <BoxL className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer' }}>
          <LabelL size={12}>📅 Период: апрель ▾</LabelL>
        </BoxL>
        <BoxL className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer' }}>
          <LabelL size={12}>🏭 Поставщик: все ▾</LabelL>
        </BoxL>
        <BoxL className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer' }}>
          <LabelL size={12}>📦 Тип тары: все ▾</LabelL>
        </BoxL>
        <BoxL className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer' }}>
          <LabelL size={12}>◷ Статус: все ▾</LabelL>
        </BoxL>
        <BoxL className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer' }}>
          <LabelL size={12}>🚛 ТК: все ▾</LabelL>
        </BoxL>
      </div>

      {/* List */}
      <div style={{ border:'2px solid #333', borderRadius:3, overflow:'hidden', background:'#fff' }}>
        {/* Column header */}
        <div style={{ display:'flex', background:'#2a2a2a', color:'#fff' }}>
          <Cell w={280} bold color="#fff" size={12}>Документ · Дата · Водитель · ТК · Машина · Статус</Cell>
          <Cell w={null} bold color="#fff" size={12}>Позиции (поставщик · тип тары · количество)</Cell>
        </div>

        {docs.map((d, i) => {
          const planned = d.status !== 'Доставлено';
          return (
            <div key={i} style={{
              display:'flex',
              borderBottom:'1.5px solid #c8c8c0',
              background: planned ? 'repeating-linear-gradient(-45deg,#fff,#fff 6px,#fff8e8 6px,#fff8e8 8px)' : '#fff'
            }}>
              {/* meta */}
              <div style={{ width:280, padding:'6px 10px', borderRight:'1.5px solid #aaa', display:'flex', flexDirection:'column', gap:4, justifyContent:'center' }}>
                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                  <LabelL size={13} bold color="#1a4a8a" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>{d.id}</LabelL>
                  <LabelL size={13} bold color="#333">· {d.date}</LabelL>
                  <div style={{ flex:1 }} />
                  <StatusBadge s={d.status} />
                </div>
                <LabelL size={11} color="#555">
                  🚚 <span style={{ color:'#1a4a8a', textDecoration:'underline', textDecorationStyle:'dotted' }}>{d.driver}</span>
                  {' · '}
                  <span style={{ color:'#888' }}>{d.tk}</span>
                </LabelL>
                <LabelL size={10} color="#888" style={{ fontFamily:'JetBrains Mono, monospace' }}>{d.car}</LabelL>
                {d.autoHint && (
                  <div style={{
                    marginTop:2, padding:'3px 6px',
                    background:'#fff5e8', border:'1.5px dashed #e0a060', borderRadius:3,
                    display:'flex', alignItems:'center', gap:5
                  }}>
                    <LabelL size={11} color="#a04000" bold>⏰ Прошло &gt; 2 дн.</LabelL>
                    <BoxL className="sk-gray" style={{ padding:'1px 6px', cursor:'pointer', background:'#1a6b3a', borderColor:'#0d4020' }}>
                      <LabelL size={10} bold color="#fff">✓ Пометить доставленным</LabelL>
                    </BoxL>
                  </div>
                )}
              </div>
              {/* items */}
              <div style={{ flex:1 }}>
                {d.items.map((it, j) => {
                  const c = taraColor(it.tara);
                  return (
                    <div key={j} style={{
                      display:'flex', alignItems:'center',
                      borderTop: j === 0 ? 'none' : '1px dashed #d8d8d2',
                      background: c.bg + '30',
                      minHeight:26
                    }}>
                      <div style={{ width:4, background:c.dot }} />
                      <div style={{ width:160, padding:'3px 8px', borderRight:'1px solid #d8d8d2' }}>
                        <LabelL size={12} bold color="#222">{it.sup}</LabelL>
                      </div>
                      <div style={{ width:160, padding:'3px 8px', borderRight:'1px solid #d8d8d2', display:'flex', alignItems:'center', gap:5 }}>
                        <div style={{ width:8, height:8, borderRadius:2, background:c.dot }} />
                        <LabelL size={12} color="#333">{it.tara}</LabelL>
                      </div>
                      <div style={{ width:120, padding:'3px 8px', borderRight:'1px solid #d8d8d2' }}>
                        <LabelL size={13} bold color="#222" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:12 }}>
                          {it.qty.toLocaleString()} шт
                        </LabelL>
                      </div>
                      <div style={{ flex:1 }} />
                      <div style={{ width:28, textAlign:'center', cursor:'pointer' }}>
                        <LabelL size={13} color="#555">✎</LabelL>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Inline form preview */}
      <div style={{ marginTop:14 }}>
        <LabelL size={15} bold color="#333" style={{ marginBottom:6 }}>＋ Форма создания (превью)</LabelL>
        <div style={{ border:'2px solid #333', borderRadius:4, background:'#fff', overflow:'hidden' }}>
          <div style={{ background:'#1a6b3a', padding:'7px 12px', display:'flex', alignItems:'center', gap:8 }}>
            <LabelL size={14} bold color="#fff">Новая отправка тары</LabelL>
            <PillL color="#fff0c8" textColor="#a06000" size={11}>● ↗ В пути (по умолчанию)</PillL>
            <div style={{ flex:1 }} />
            <LabelL size={16} color="#aed6be" style={{ cursor:'pointer' }}>✕</LabelL>
          </div>
          <div style={{ padding:'10px 14px' }}>
            {/* машина — общая шапка */}
            <div style={{ background:'#f5f3ef', padding:'8px 10px', border:'1px dashed #bbb', borderRadius:3, marginBottom:10 }}>
              <LabelL size={11} color="#666" style={{ marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>— Машина (общее) —</LabelL>
              <div style={{ display:'flex', gap:8, marginBottom:6 }}>
                <FieldL label="Дата" hint="отправки с завода" required value="21 апр" />
                <FieldL label="Водитель" hint="ТК подставится автоматом" required value="Кузнецов А." dropdown />
                <FieldL label="ТК" hint="🔒 авто" value="АвтоЛогист" locked />
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <FieldL label="Машина / госномер" value="Е 712 ВК 77" mono />
                <FieldL label="Статус" value="↗ В пути" pillStyle />
              </div>
            </div>

            {/* позиции */}
            <div style={{ marginBottom:6, display:'flex', alignItems:'baseline', gap:6 }}>
              <LabelL size={13} bold>Позиции в машине</LabelL>
              <LabelL size={11} color="#888">можно добавить несколько — для разных поставщиков и видов тары</LabelL>
            </div>
            <div style={{ border:'1.5px solid #333', borderRadius:3, overflow:'hidden' }}>
              <div style={{ display:'flex', background:'#2a2a2a', color:'#fff', padding:'3px 6px', gap:6 }}>
                <LabelL size={11} bold color="#fff" style={{ width:16 }}>№</LabelL>
                <LabelL size={11} bold color="#fff" style={{ flex:1.5 }}>Поставщик *</LabelL>
                <LabelL size={11} bold color="#fff" style={{ flex:1.3 }}>Тип тары *</LabelL>
                <LabelL size={11} bold color="#fff" style={{ flex:1 }}>Количество *</LabelL>
                <LabelL size={11} bold color="#fff" style={{ width:20 }}></LabelL>
              </div>
              {[
                { sup:'Цой К.Т.',    tara:'Ящик',          qty:'1 500' },
                { sup:'Байрамов А.', tara:'Ящик',          qty:'600' },
                { sup:'Мищенко',     tara:'Бочка железо',  qty:'120' },
              ].map((it, i) => {
                const c = taraColor(it.tara);
                return (
                  <div key={i} style={{
                    display:'flex', gap:6, padding:'4px 6px',
                    background: c.bg + '40', borderBottom:'1px dashed #ccc', alignItems:'center'
                  }}>
                    <LabelL size={11} color="#888" style={{ width:16 }}>{i+1}</LabelL>
                    <div style={{ flex:1.5, border:'1px solid #aaa', borderRadius:2, padding:'2px 6px', background:'#fff', display:'flex', alignItems:'center' }}>
                      <LabelL size={12} bold>{it.sup}</LabelL>
                      <div style={{ flex:1 }} />
                      <LabelL size={10} color="#999">▾</LabelL>
                    </div>
                    <div style={{ flex:1.3, border:'1px solid #aaa', borderRadius:2, padding:'2px 6px', background:'#fff', display:'flex', alignItems:'center', gap:5 }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:c.dot }} />
                      <LabelL size={12}>{it.tara}</LabelL>
                      <div style={{ flex:1 }} />
                      <LabelL size={10} color="#999">▾</LabelL>
                    </div>
                    <div style={{ flex:1, border:'1px solid #aaa', borderRadius:2, padding:'2px 6px', background:'#fff' }}>
                      <LabelL size={12} mono>{it.qty} шт</LabelL>
                    </div>
                    <LabelL size={14} color="#c33" style={{ width:20, textAlign:'center', cursor:'pointer' }}>✕</LabelL>
                  </div>
                );
              })}
              <div style={{ padding:'5px 8px', background:'#f0f0c8', cursor:'pointer', borderTop:'1px solid #bbb' }}>
                <LabelL size={12} bold color="#1a6b3a">＋ Добавить позицию</LabelL>
              </div>
            </div>
            <div style={{ marginTop:8, padding:'5px 10px', background:'#eef6ee', borderRadius:3, display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
              <LabelL size={12} bold color="#1a6b3a">Итого в машине:</LabelL>
              <PillL color="#fff" size={11}>3 позиции</PillL>
              <PillL color="#fff" size={11}>3 поставщика</PillL>
              <PillL color="#fff" size={11}>ящ: 2 100</PillL>
              <PillL color="#fff" size={11}>бочка ж: 120</PillL>
            </div>

            <HRL my={10} />
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <BoxL className="sk-gray" style={{ padding:'5px 16px', cursor:'pointer' }}>
                <LabelL size={13}>Отмена</LabelL>
              </BoxL>
              <div style={{ background:'#1a6b3a', border:'2px solid #333', padding:'5px 16px', borderRadius:3, cursor:'pointer' }}>
                <LabelL size={13} bold color="#fff">✓ Создать (списать с завода)</LabelL>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop:10, padding:'8px 12px', background:'#fffbe8', border:'1.5px dashed #e09a20', borderRadius:4 }}>
        <LabelL size={13} color="#b06000">
          ✦ Формы и список — единая модель с отгрузками сырья · через 2 дня — авто-баннер «Пометить доставленным?» с кнопкой одного клика
        </LabelL>
      </div>
    </div>
  );
};

/* ===== простой Field для форм логистики ===== */
const FieldL = ({ label, hint, value, locked, mono, dropdown, pillStyle, required }) => (
  <div style={{ flex:1, minWidth:0 }}>
    <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:2 }}>
      <LabelL size={11} bold color="#555">{label}{required && <span style={{color:'#c33'}}> *</span>}</LabelL>
      {hint && <LabelL size={10} color="#999">{hint}</LabelL>}
    </div>
    <div style={{
      border:'1.5px solid #999', borderRadius:3, padding:'3px 7px',
      background: locked ? '#f5f3ef' : '#fff',
      display:'flex', alignItems:'center', justifyContent:'space-between', minHeight:22
    }}>
      {pillStyle
        ? <PillL color="#fff0c8" textColor="#a06000" size={11}>{value}</PillL>
        : <LabelL size={12} bold color={locked ? '#888' : '#222'} style={{ fontFamily: mono ? 'JetBrains Mono, monospace' : undefined, fontSize: mono ? 11 : 12 }}>{value}</LabelL>}
      {dropdown && <LabelL size={11} color="#999">▾</LabelL>}
    </div>
  </div>
);

/* ============================================================
   6.4  СПИСАНИЕ ЛОМА
   ============================================================ */
const TaraScrap = () => {
  const docs = [
    { date:'18 апр', sup:'Цой К.Т.',  tara:'Ящик',         qty:120, comment:'Раздавлено погрузчиком', state:'active' },
    { date:'17 апр', sup:'Мищенко',   tara:'Бочка железо', qty:80,  comment:'Прогнила обечайка',       state:'active' },
    { date:'15 апр', sup:'Цой К.Т.',  tara:'Ящик',         qty:340, comment:'',                         state:'utilized', util:'Утилизировано 16 апр · «Отправлено на переработку с водителем Кобец»' },
    { date:'12 апр', sup:'Генералов', tara:'Бочка пластик',qty:60,  comment:'Трещины',                  state:'active' },
    { date:'10 апр', sup:'Байрамов',  tara:'Ящик',         qty:120, comment:'',                         state:'utilized', util:'Утилизировано 12 апр · «Сожжено на месте»' },
  ];

  const stocks = [
    { sup:'Цой К.Т.',     'Ящик':800,         'Бочка железо':40,  'Бочка пластик':0   },
    { sup:'Мищенко',      'Ящик':0,           'Бочка железо':380, 'Бочка пластик':0   },
    { sup:'Генералов',    'Ящик':90,          'Бочка железо':60,  'Бочка пластик':0   },
    { sup:'Байрамов А.',  'Ящик':120,         'Бочка железо':0,   'Бочка пластик':0   },
    { sup:'Ким Т.',       'Ящик':0,           'Бочка железо':0,   'Бочка пластик':80  },
  ];

  return (
    <div style={{ padding:14, fontFamily:'Caveat' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
        <LabelL size={20} bold color="#222">🗑 Списание лома</LabelL>
        <PillL color="#fff0c8" textColor="#a06000" size={11}>👑 только Админ</PillL>
        <PillL color="#f5d8c8" textColor="#a04020" size={11}>лом образуется только у поставщика</PillL>
        <div style={{ flex:1 }} />
        <BoxL className="sk-gray" style={{ padding:'5px 14px', cursor:'pointer', background:'#1a6b3a', borderColor:'#0d4020' }}>
          <LabelL size={13} bold color="#fff">＋ Списать в лом</LabelL>
        </BoxL>
      </div>

      {/* Stocks summary */}
      <LabelL size={13} bold color="#555" style={{ marginBottom:6 }}>Текущие остатки лома по поставщикам</LabelL>
      <div style={{ border:'2px solid #333', borderRadius:3, overflow:'hidden', background:'#fff', marginBottom:14 }}>
        <div style={{ display:'flex', background:'#2a2a2a' }}>
          <Cell w={220} bold color="#fff" size={12}>Поставщик</Cell>
          {['Ящик','Бочка железо','Бочка пластик'].map(t => (
            <div key={t} style={{ flex:1, padding:'5px 10px', borderRight:'1px solid #555', display:'flex', alignItems:'center', gap:5 }}>
              <div style={{ width:9, height:9, borderRadius:2, background:taraColor(t).dot }} />
              <LabelL size={12} bold color="#fff">{t}</LabelL>
            </div>
          ))}
          <div style={{ width:160, padding:'5px 10px' }}>
            <LabelL size={12} bold color="#fff">Действия</LabelL>
          </div>
        </div>
        {stocks.map((s, i) => (
          <div key={i} style={{ display:'flex', borderBottom:'1px solid #e8e5df', background: i % 2 ? '#fafafa' : '#fff' }}>
            <Cell w={220} bold size={13}>{s.sup}</Cell>
            {['Ящик','Бочка железо','Бочка пластик'].map(t => (
              <div key={t} style={{ flex:1, padding:'5px 10px', borderRight:'1px solid #e0e0e0' }}>
                {s[t] > 0
                  ? <PillL color="#f5d8c8" textColor="#a04020" size={11}>лом {s[t]}</PillL>
                  : <LabelL size={11} color="#bbb">—</LabelL>}
              </div>
            ))}
            <div style={{ width:160, padding:'5px 10px', display:'flex', gap:5 }}>
              <BoxL className="sk-gray" style={{ padding:'2px 7px', cursor:'pointer', background:'#1a6b3a', borderColor:'#0d4020' }}>
                <LabelL size={10} bold color="#fff">♻ Утилизировать</LabelL>
              </BoxL>
              <BoxL className="sk-gray" style={{ padding:'2px 7px', cursor:'pointer' }}>
                <LabelL size={10}>⚙ Корректировка</LabelL>
              </BoxL>
            </div>
          </div>
        ))}
      </div>

      {/* Documents log */}
      <LabelL size={13} bold color="#555" style={{ marginBottom:6 }}>Документы списания / утилизации</LabelL>
      <div style={{ border:'2px solid #333', borderRadius:3, overflow:'hidden', background:'#fff' }}>
        <div style={{ display:'flex', background:'#2a2a2a' }}>
          <Cell w={80} bold color="#fff" size={12}>Дата</Cell>
          <Cell w={180} bold color="#fff" size={12}>Поставщик</Cell>
          <Cell w={150} bold color="#fff" size={12}>Тип тары</Cell>
          <Cell w={90} bold color="#fff" size={12} align="right">Кол-во</Cell>
          <Cell w={null} bold color="#fff" size={12}>Комментарий · Утилизация</Cell>
          <div style={{ width:60, padding:'5px 8px' }}>
            <LabelL size={11} bold color="#fff">⚙</LabelL>
          </div>
        </div>
        {docs.map((d, i) => {
          const c = taraColor(d.tara);
          const utilized = d.state === 'utilized';
          return (
            <div key={i} style={{
              display:'flex',
              borderBottom:'1px solid #e8e5df',
              background: utilized ? '#f5f7f3' : (i % 2 ? '#fafafa' : '#fff')
            }}>
              <Cell w={80} mono size={11}>{d.date}</Cell>
              <Cell w={180} bold>{d.sup}</Cell>
              <div style={{ width:150, padding:'3px 8px', borderRight:'1px solid #d8d8d2', display:'flex', alignItems:'center', gap:5, background:c.bg+'40' }}>
                <div style={{ width:8, height:8, borderRadius:2, background:c.dot }} />
                <LabelL size={12}>{d.tara}</LabelL>
              </div>
              <Cell w={90} bold size={13} mono align="right" color={utilized ? '#888' : '#a04020'}>
                {utilized ? '−' : ''}{d.qty}
              </Cell>
              <div style={{ flex:1, padding:'3px 8px', borderRight:'1px solid #d8d8d2', display:'flex', flexDirection:'column', gap:1 }}>
                {d.comment && <LabelL size={12} color={utilized ? '#888' : '#444'}>💬 {d.comment}</LabelL>}
                {utilized && (
                  <LabelL size={11} color="#1a6b3a" bold>♻ {d.util}</LabelL>
                )}
                {!d.comment && !utilized && <LabelL size={11} color="#bbb" style={{ fontStyle:'italic' }}>— без комментария (акт не нужен) —</LabelL>}
              </div>
              <div style={{ width:60, padding:'3px 8px', display:'flex', gap:6, alignItems:'center' }}>
                {!utilized && <LabelL size={13} color="#1a6b3a" style={{ cursor:'pointer' }} title="Утилизировать">♻</LabelL>}
                <LabelL size={13} color="#555" style={{ cursor:'pointer' }}>✎</LabelL>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mini form preview */}
      <div style={{ marginTop:14, display:'flex', gap:14, alignItems:'flex-start' }}>
        {/* Списание */}
        <div style={{ flex:1, border:'2px solid #333', borderRadius:4, background:'#fff', overflow:'hidden' }}>
          <div style={{ background:'#a04020', padding:'6px 12px', display:'flex', alignItems:'center', gap:8 }}>
            <LabelL size={13} bold color="#fff">＋ Списание в лом (форма)</LabelL>
          </div>
          <div style={{ padding:'10px 12px', display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ display:'flex', gap:8 }}>
              <FieldL label="Дата" required value="21 апр" />
              <FieldL label="Поставщик" required value="Цой К.Т." dropdown />
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <FieldL label="Тип тары" required value="Ящик" dropdown />
              <FieldL label="Количество" required value="120 шт" mono />
            </div>
            <FieldL label="Комментарий" hint="опц., акт не требуется" value="Раздавлено погрузчиком" />
            <div style={{ display:'flex', gap:6, justifyContent:'flex-end', marginTop:4 }}>
              <BoxL className="sk-gray" style={{ padding:'4px 10px', cursor:'pointer' }}><LabelL size={12}>Отмена</LabelL></BoxL>
              <div style={{ background:'#a04020', border:'2px solid #333', padding:'4px 12px', borderRadius:3, cursor:'pointer' }}>
                <LabelL size={12} bold color="#fff">Списать в лом</LabelL>
              </div>
            </div>
          </div>
        </div>
        {/* Утилизация */}
        <div style={{ flex:1, border:'2px solid #333', borderRadius:4, background:'#fff', overflow:'hidden' }}>
          <div style={{ background:'#1a6b3a', padding:'6px 12px', display:'flex', alignItems:'center', gap:8 }}>
            <LabelL size={13} bold color="#fff">♻ Утилизировать лом (форма)</LabelL>
          </div>
          <div style={{ padding:'10px 12px', display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ background:'#eef6ee', padding:'6px 8px', borderRadius:3, border:'1px dashed #1a6b3a' }}>
              <LabelL size={12} color="#1a6b3a">
                Текущий лом у <b>Цой К.Т.</b>: ящик <b>800</b>, бочка ж <b>40</b>
              </LabelL>
            </div>
            <FieldL label="Тип тары" required value="Ящик" dropdown />
            <FieldL label="Сколько утилизировать" required value="800 шт (= весь)" mono />
            <FieldL label="Комментарий" required hint="обязательно для утилизации" value="Отправлено на переработку с водителем Кобец" />
            <div style={{ display:'flex', gap:6, justifyContent:'flex-end', marginTop:4 }}>
              <BoxL className="sk-gray" style={{ padding:'4px 10px', cursor:'pointer' }}><LabelL size={12}>Отмена</LabelL></BoxL>
              <div style={{ background:'#1a6b3a', border:'2px solid #333', padding:'4px 12px', borderRadius:3, cursor:'pointer' }}>
                <LabelL size={12} bold color="#fff">♻ Утилизировать</LabelL>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop:10, padding:'8px 12px', background:'#fffbe8', border:'1.5px dashed #e09a20', borderRadius:4 }}>
        <LabelL size={13} color="#b06000">
          ✦ Утилизация → лом в ноль с обязательным комментарием · ручная корректировка остатка лома доступна без причины
        </LabelL>
      </div>
    </div>
  );
};

/* ============================================================
   6.5  ПЕРЕДАЧИ ТАРЫ МЕЖДУ ПОСТАВЩИКАМИ
   ============================================================ */
const TaraTransfers = () => {
  const docs = [
    { date:'20 апр', from:'Цой К.Т.',    to:'Мищенко',     tara:'Ящик',          qty:300, comment:'По договорённости — нужен срочно для огурцов' },
    { date:'18 апр', from:'Генералов',   to:'Байрамов А.', tara:'Бочка пластик', qty:60,  comment:'' },
    { date:'15 апр', from:'Ким Т.',      to:'Цой К.Т.',    tara:'Бочка пластик', qty:120, comment:'Возврат свободной тары после черри' },
    { date:'12 апр', from:'Байрамов А.', to:'Генералов',   tara:'Ящик',          qty:200, comment:'' },
  ];

  return (
    <div style={{ padding:14, fontFamily:'Caveat' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
        <LabelL size={20} bold color="#222">↔ Передачи тары между поставщиками</LabelL>
        <PillL color="#fff0c8" textColor="#a06000" size={11}>👑 только Админ</PillL>
        <div style={{ flex:1 }} />
        <BoxL className="sk-gray" style={{ padding:'5px 14px', cursor:'pointer', background:'#1a6b3a', borderColor:'#0d4020' }}>
          <LabelL size={13} bold color="#fff">＋ Новая передача</LabelL>
        </BoxL>
      </div>

      <div style={{ background:'#eef6ee', border:'1.5px dashed #1a6b3a', borderRadius:4, padding:'6px 10px', marginBottom:10 }}>
        <LabelL size={13} color="#1a6b3a">
          ℹ Логика «В пути» НЕ применяется — остатки изменяются сразу при создании документа.
        </LabelL>
      </div>

      <div style={{ border:'2px solid #333', borderRadius:3, overflow:'hidden', background:'#fff' }}>
        <div style={{ display:'flex', background:'#2a2a2a' }}>
          <Cell w={80} bold color="#fff" size={12}>Дата</Cell>
          <Cell w={180} bold color="#fff" size={12}>От поставщика</Cell>
          <Cell w={40} bold color="#fff" size={12} align="center">→</Cell>
          <Cell w={180} bold color="#fff" size={12}>К поставщику</Cell>
          <Cell w={150} bold color="#fff" size={12}>Тип тары</Cell>
          <Cell w={100} bold color="#fff" size={12} align="right">Кол-во</Cell>
          <Cell w={null} bold color="#fff" size={12}>Комментарий</Cell>
          <div style={{ width:50, padding:'5px 8px' }}>
            <LabelL size={11} bold color="#fff">⚙</LabelL>
          </div>
        </div>
        {docs.map((d, i) => {
          const c = taraColor(d.tara);
          return (
            <div key={i} style={{ display:'flex', borderBottom:'1px solid #e8e5df', background: i % 2 ? '#fafafa' : '#fff' }}>
              <Cell w={80} mono size={11}>{d.date}</Cell>
              <Cell w={180} bold color="#a04020">↓ {d.from}</Cell>
              <div style={{ width:40, padding:'3px 8px', borderRight:'1px solid #d8d8d2', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <LabelL size={16} bold color="#888">→</LabelL>
              </div>
              <Cell w={180} bold color="#1a6b3a">↑ {d.to}</Cell>
              <div style={{ width:150, padding:'3px 8px', borderRight:'1px solid #d8d8d2', display:'flex', alignItems:'center', gap:5, background:c.bg+'40' }}>
                <div style={{ width:8, height:8, borderRadius:2, background:c.dot }} />
                <LabelL size={12}>{d.tara}</LabelL>
              </div>
              <Cell w={100} bold size={13} mono align="right">{d.qty} шт</Cell>
              <div style={{ flex:1, padding:'3px 8px', borderRight:'1px solid #d8d8d2' }}>
                {d.comment
                  ? <LabelL size={12} color="#444">💬 {d.comment}</LabelL>
                  : <LabelL size={11} color="#bbb" style={{ fontStyle:'italic' }}>—</LabelL>}
              </div>
              <div style={{ width:50, padding:'3px 8px' }}>
                <LabelL size={13} color="#555" style={{ cursor:'pointer' }}>✎</LabelL>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop:10, padding:'8px 12px', background:'#fffbe8', border:'1.5px dashed #e09a20', borderRadius:4 }}>
        <LabelL size={13} color="#b06000">
          ✦ Простой документ: Дата · От · К · Тип · Кол-во · Комментарий · мгновенное движение остатков
        </LabelL>
      </div>
    </div>
  );
};

/* ============================================================
   6.6  ЖУРНАЛ ДВИЖЕНИЙ ТАРЫ — карточка поставщика как банк-выписка
   ============================================================ */
const TaraJournal = () => {
  const cards = [
    { id:'factory', name:'Завод', icon:'🏭', accent:'#1a6b3a',
      balances:{ 'Ящик':6000, 'Бочка железо':920, 'Бочка пластик':1450 },
      ops:[
        { date:'21 апр', type:'отправка с завода', tara:'Ящик',         delta:-2100, after:6000, doc:'#T-0421' },
        { date:'21 апр', type:'отправка с завода', tara:'Бочка железо', delta:-120,  after:920,  doc:'#T-0421' },
        { date:'20 апр', type:'приёмка с овощами', tara:'Ящик',         delta:+420,  after:8100, doc:'отгр. сырья · Вихров 21 апр' },
        { date:'19 апр', type:'отправка с завода', tara:'Ящик',         delta:-2000, after:7680, doc:'#T-0419' },
        { date:'17 апр', type:'отправка с завода', tara:'Ящик',         delta:-5000, after:9680, doc:'#T-0417' },
        { date:'16 апр', type:'приёмка с овощами', tara:'Ящик',         delta:+340,  after:14680,doc:'отгр. сырья · Мартыно 17 апр' },
        { date:'14 апр', type:'корректировка',     tara:'Бочка пластик',delta:+50,   after:1450, doc:'инвентаризация' },
      ]
    },
    { id:'tsoy', name:'Цой К.Т.', icon:'🏢', accent:'#7a5080',
      balances:{ 'Ящик':8500, 'Бочка железо':120, 'Бочка пластик':0 },
      ops:[
        { date:'18 апр', type:'лом',                tara:'Ящик', delta:-120,  after:8500, doc:'списание · «раздавлено»' },
        { date:'17 апр', type:'утилизация',          tara:'Ящик', delta:-340,  after:8620, doc:'утилизация · «с водителем Кобец»' },
        { date:'17 апр', type:'отправка с завода',   tara:'Ящик', delta:+5000, after:8960, doc:'#T-0417 (доставлено)' },
        { date:'15 апр', type:'передача от',         tara:'Бочка пластик', delta:+120, after:0, doc:'от Ким Т. · 15 апр' },
        { date:'14 апр', type:'приёмка с овощами',   tara:'Ящик', delta:-420,  after:3960, doc:'отгрузка сырья на завод' },
        { date:'12 апр', type:'передача к',          tara:'Ящик', delta:-300,  after:4380, doc:'к Мищенко · 20 апр (план.)' },
      ]
    },
  ];

  // type → colored badge
  const typeBadge = (t) => {
    const map = {
      'отправка с завода':  { bg:'#c8dce8', tx:'#1a4a8a', icon:'↗' },
      'приёмка с овощами':  { bg:'#d4eac2', tx:'#1a6b3a', icon:'↙' },
      'лом':                { bg:'#f5d8c8', tx:'#a04020', icon:'⚠' },
      'утилизация':          { bg:'#e8d8e8', tx:'#7a5080', icon:'♻' },
      'передача от':         { bg:'#fff0c8', tx:'#a06000', icon:'⬇' },
      'передача к':          { bg:'#fff0c8', tx:'#a06000', icon:'⬆' },
      'корректировка':       { bg:'#e8e5df', tx:'#666',    icon:'⚙' },
    };
    const c = map[t] || { bg:'#eee', tx:'#666', icon:'·' };
    return <PillL color={c.bg} textColor={c.tx} size={10}>{c.icon} {t}</PillL>;
  };

  return (
    <div style={{ padding:14, fontFamily:'Caveat' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
        <LabelL size={20} bold color="#222">📒 Журнал движений тары</LabelL>
        <PillL color="#fff0c8" textColor="#a06000" size={11}>👑 только Админ</PillL>
        <PillL color="#e8e5df" size={11}>как банковская выписка</PillL>
        <div style={{ flex:1 }} />
        <BoxL className="sk-gray" style={{ padding:'4px 10px', cursor:'pointer' }}>
          <LabelL size={12}>↓ Excel</LabelL>
        </BoxL>
      </div>

      <div style={{ display:'flex', gap:6, marginBottom:10, alignItems:'center', flexWrap:'wrap', padding:'6px 8px', background:'#f5f3ed', border:'1.5px solid #ccc', borderRadius:3 }}>
        <LabelL size={13} bold color="#555">Карточка:</LabelL>
        <BoxL className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer', background:'#1a6b3a', borderColor:'#0d4020' }}>
          <LabelL size={12} color="#fff" bold>🏭 Завод</LabelL>
        </BoxL>
        <BoxL className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer' }}>
          <LabelL size={12}>🏢 Цой К.Т. ▾</LabelL>
        </BoxL>
        <div style={{ width:1, height:20, background:'#ccc' }} />
        <LabelL size={12} color="#555">Период:</LabelL>
        <BoxL className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer' }}><LabelL size={12}>📅 апрель ▾</LabelL></BoxL>
        <LabelL size={12} color="#555">Тип:</LabelL>
        <BoxL className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer' }}><LabelL size={12}>все ▾</LabelL></BoxL>
        <LabelL size={12} color="#555">Тара:</LabelL>
        <BoxL className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer' }}><LabelL size={12}>все ▾</LabelL></BoxL>
      </div>

      <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
        {cards.map(card => (
          <div key={card.id} style={{ flex:1, border:'2px solid #333', borderRadius:4, overflow:'hidden', background:'#fff' }}>
            {/* Header w/ balances */}
            <div style={{ background: card.accent, padding:'7px 12px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:18 }}>{card.icon}</span>
                <LabelL size={15} bold color="#fff">{card.name}</LabelL>
                <div style={{ flex:1 }} />
                <LabelL size={11} color="#fff" style={{ opacity:0.8, fontStyle:'italic' }}>текущий остаток</LabelL>
              </div>
              <div style={{ display:'flex', gap:6, marginTop:5, flexWrap:'wrap' }}>
                {Object.entries(card.balances).map(([t, v]) => {
                  const c = taraColor(t);
                  return (
                    <div key={t} style={{
                      display:'flex', alignItems:'center', gap:5,
                      padding:'2px 8px', background:'rgba(255,255,255,0.18)',
                      border:'1px solid rgba(255,255,255,0.4)', borderRadius:14
                    }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:c.dot }} />
                      <LabelL size={11} color="#fff">{t}</LabelL>
                      <LabelL size={12} bold color="#fff" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>{v.toLocaleString()}</LabelL>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ops list */}
            <div style={{ display:'flex', background:'#2a2a2a', color:'#fff' }}>
              <Cell w={68}  bold color="#fff" size={11}>Дата</Cell>
              <Cell w={140} bold color="#fff" size={11}>Операция</Cell>
              <Cell w={110} bold color="#fff" size={11}>Тара</Cell>
              <Cell w={70}  bold color="#fff" size={11} align="right">±</Cell>
              <Cell w={70}  bold color="#fff" size={11} align="right">Остаток</Cell>
              <Cell w={null} bold color="#fff" size={11}>Документ</Cell>
            </div>
            {card.ops.map((o, i) => {
              const c = taraColor(o.tara);
              const positive = o.delta >= 0;
              return (
                <div key={i} style={{ display:'flex', borderBottom:'1px solid #ececec', background: i % 2 ? '#fafafa' : '#fff' }}>
                  <Cell w={68}  mono size={11} color="#666">{o.date}</Cell>
                  <div style={{ width:140, padding:'3px 8px', borderRight:'1px solid #d8d8d2', display:'flex', alignItems:'center' }}>
                    {typeBadge(o.type)}
                  </div>
                  <div style={{ width:110, padding:'3px 8px', borderRight:'1px solid #d8d8d2', display:'flex', alignItems:'center', gap:5, background:c.bg+'40' }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:c.dot }} />
                    <LabelL size={11}>{o.tara}</LabelL>
                  </div>
                  <Cell w={70} bold size={13} mono align="right" color={positive ? '#1a6b3a' : '#a04020'}>
                    {positive ? '+' : ''}{o.delta}
                  </Cell>
                  <Cell w={70} mono size={12} align="right" color="#444">{o.after.toLocaleString()}</Cell>
                  <div style={{ flex:1, padding:'3px 8px' }}>
                    <LabelL size={11} color="#1a4a8a" style={{ textDecoration:'underline', textDecorationStyle:'dotted' }}>{o.doc}</LabelL>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ marginTop:10, padding:'8px 12px', background:'#fffbe8', border:'1.5px dashed #e09a20', borderRadius:4 }}>
        <LabelL size={13} color="#b06000">
          ✦ Лента как банковская выписка: дата · тип операции · тара · ±количество · остаток после · ссылка на документ · приёмка с овощами учтена автоматически
        </LabelL>
      </div>
    </div>
  );
};

/* ============================================================
   6.8  ИНГРЕДИЕНТЫ — отдельный интерфейс
   ============================================================ */
const Ingredients = () => {
  const docs = [
    { id:'#I-0421', date:'21 апр', from:'Завод', to:'Цой К.Т.',     ingr:'Уксус',             qty:'200 л',  driver:'Вихров П.',   tk:'ИП Фастов', status:'В пути',     hint:false },
    { id:'#I-0419', date:'19 апр', from:'Завод', to:'Мищенко',      ingr:'Соль',              qty:'500 кг', driver:'Ахмедов Р.',  tk:'ТрансЮг',   status:'В пути',     hint:true  },
    { id:'#I-0418', date:'18 апр', from:'Цой К.Т.', to:'Байрамов А.', ingr:'Пиросульфит',     qty:'40 кг',  driver:'Мартыно В.',  tk:'ИП Рябов',  status:'В пути',     hint:true  },
    { id:'#I-0415', date:'15 апр', from:'Завод', to:'Генералов',    ingr:'Аскорбиновая к-та', qty:'25 кг',  driver:'Кузнецов А.', tk:'АвтоЛогист', status:'Доставлено', hint:false },
    { id:'#I-0412', date:'12 апр', from:'Завод', to:'Цой К.Т.',     ingr:'Уксус',             qty:'400 л',  driver:'Гриненко К.', tk:'ИП Кузн.',  status:'Доставлено', hint:false },
  ];

  const StatusBadge = ({ s }) =>
    s === 'Доставлено'
      ? <PillL color="#c8e8c8" textColor="#1a6b3a" size={11}>✓ Доставлено</PillL>
      : <PillL color="#fff0c8" textColor="#a06000" size={11}>↗ В пути</PillL>;

  return (
    <div style={{ padding:14, fontFamily:'Caveat' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
        <LabelL size={20} bold color="#222">🧪 Ингредиенты</LabelL>
        <PillL color="#fff0c8" textColor="#a06000" size={11}>👑 только Админ</PillL>
        <PillL color="#e8e5df" size={11}>отдельный интерфейс — не смешивать с тарой</PillL>
        <div style={{ flex:1 }} />
        <BoxL className="sk-gray" style={{ padding:'5px 14px', cursor:'pointer', background:'#1a6b3a', borderColor:'#0d4020' }}>
          <LabelL size={13} bold color="#fff">＋ Новая отправка ингредиентов</LabelL>
        </BoxL>
      </div>

      <div style={{ background:'#eef6ee', border:'1.5px dashed #1a6b3a', borderRadius:4, padding:'6px 10px', marginBottom:10 }}>
        <LabelL size={13} color="#1a6b3a">
          ℹ Ингредиенты не оборотные: едут только <b>Завод → Поставщик</b> и <b>Поставщик → Поставщик</b>.
          Сущности из справочника: уксус, соль, аскорбиновая кислота, пиросульфит. Учитываются в аналитике ТК как «Обратный рейс».
        </LabelL>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:6, marginBottom:8, alignItems:'center', flexWrap:'wrap', padding:'6px 8px', background:'#f5f3ed', border:'1.5px solid #ccc', borderRadius:3 }}>
        <LabelL size={13} bold color="#555">Фильтры:</LabelL>
        <BoxL className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer' }}><LabelL size={12}>📅 апрель ▾</LabelL></BoxL>
        <BoxL className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer' }}><LabelL size={12}>📤 Откуда: все ▾</LabelL></BoxL>
        <BoxL className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer' }}><LabelL size={12}>📥 Куда: все ▾</LabelL></BoxL>
        <BoxL className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer' }}><LabelL size={12}>🧪 Ингредиент: все ▾</LabelL></BoxL>
        <BoxL className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer' }}><LabelL size={12}>◷ Статус: все ▾</LabelL></BoxL>
      </div>

      <div style={{ border:'2px solid #333', borderRadius:3, overflow:'hidden', background:'#fff' }}>
        <div style={{ display:'flex', background:'#2a2a2a' }}>
          <Cell w={88}  bold color="#fff" size={12}>Документ</Cell>
          <Cell w={70}  bold color="#fff" size={12}>Дата</Cell>
          <Cell w={130} bold color="#fff" size={12}>Откуда</Cell>
          <Cell w={130} bold color="#fff" size={12}>Куда</Cell>
          <Cell w={150} bold color="#fff" size={12}>Ингредиент</Cell>
          <Cell w={90}  bold color="#fff" size={12} align="right">Кол-во</Cell>
          <Cell w={120} bold color="#fff" size={12}>Водитель</Cell>
          <Cell w={100} bold color="#fff" size={12}>ТК</Cell>
          <Cell w={120} bold color="#fff" size={12}>Статус</Cell>
          <div style={{ width:36, padding:'5px 8px' }}>
            <LabelL size={11} bold color="#fff">⚙</LabelL>
          </div>
        </div>
        {docs.map((d, i) => {
          const c = ingrColor(d.ingr);
          const planned = d.status !== 'Доставлено';
          return (
            <div key={i} style={{
              display:'flex',
              borderBottom:'1px solid #e8e5df',
              background: planned ? 'repeating-linear-gradient(-45deg,#fff,#fff 6px,#fff8e8 6px,#fff8e8 8px)' : (i % 2 ? '#fafafa' : '#fff')
            }}>
              <Cell w={88} mono size={11} color="#1a4a8a">{d.id}</Cell>
              <Cell w={70} mono size={11}>{d.date}</Cell>
              <div style={{ width:130, padding:'3px 8px', borderRight:'1px solid #d8d8d2', display:'flex', alignItems:'center', gap:4 }}>
                <LabelL size={11} color={d.from === 'Завод' ? '#1a6b3a' : '#a04020'}>
                  {d.from === 'Завод' ? '🏭' : '🏢'}
                </LabelL>
                <LabelL size={12} bold color={d.from === 'Завод' ? '#1a6b3a' : '#333'}>{d.from}</LabelL>
              </div>
              <div style={{ width:130, padding:'3px 8px', borderRight:'1px solid #d8d8d2', display:'flex', alignItems:'center', gap:4 }}>
                <LabelL size={11} color="#a06000">🏢</LabelL>
                <LabelL size={12} bold color="#333">{d.to}</LabelL>
              </div>
              <div style={{ width:150, padding:'3px 8px', borderRight:'1px solid #d8d8d2', display:'flex', alignItems:'center', gap:5, background:c.bg+'40' }}>
                <div style={{ width:8, height:8, borderRadius:8, background:c.dot }} />
                <LabelL size={12} bold>{d.ingr}</LabelL>
              </div>
              <Cell w={90} bold size={13} mono align="right">{d.qty}</Cell>
              <Cell w={120}>
                <span style={{ color:'#1a4a8a', textDecoration:'underline', textDecorationStyle:'dotted' }}>{d.driver}</span>
              </Cell>
              <Cell w={100} color="#888" size={11}>{d.tk}</Cell>
              <div style={{ width:120, padding:'3px 8px', borderRight:'1px solid #d8d8d2', display:'flex', alignItems:'center', gap:5 }}>
                <StatusBadge s={d.status} />
                {d.hint && <LabelL size={10} color="#a04000" bold title="Прошло > 2 дн.">⏰</LabelL>}
              </div>
              <div style={{ width:36, padding:'3px 8px', textAlign:'center' }}>
                <LabelL size={13} color="#555" style={{ cursor:'pointer' }}>✎</LabelL>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hint banner for one of the rows */}
      <div style={{
        marginTop:10, padding:'7px 10px',
        background:'#fff5e8', border:'1.5px dashed #e0a060', borderRadius:4,
        display:'flex', alignItems:'center', gap:10
      }}>
        <LabelL size={13} bold color="#a04000">⏰ #I-0419 (Соль · Мищенко) — прошло 2 дня</LabelL>
        <LabelL size={12} color="#a04000">Пометить доставленным?</LabelL>
        <BoxL className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer', background:'#1a6b3a', borderColor:'#0d4020' }}>
          <LabelL size={11} bold color="#fff">✓ Да, доставлено</LabelL>
        </BoxL>
      </div>

      {/* Form preview */}
      <div style={{ marginTop:14 }}>
        <LabelL size={15} bold color="#333" style={{ marginBottom:6 }}>＋ Форма создания (превью)</LabelL>
        <div style={{ border:'2px solid #333', borderRadius:4, background:'#fff', overflow:'hidden' }}>
          <div style={{ background:'#1a6b3a', padding:'7px 12px', display:'flex', alignItems:'center', gap:8 }}>
            <LabelL size={14} bold color="#fff">Новая отправка ингредиентов</LabelL>
            <PillL color="#fff0c8" textColor="#a06000" size={11}>● ↗ В пути (по умолчанию)</PillL>
            <div style={{ flex:1 }} />
            <LabelL size={16} color="#aed6be" style={{ cursor:'pointer' }}>✕</LabelL>
          </div>
          <div style={{ padding:'10px 14px', display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ display:'flex', gap:8 }}>
              <FieldL label="Откуда" hint="по умолчанию «Завод»" required value="Завод" dropdown />
              <FieldL label="Куда" hint="поставщик" required value="Цой К.Т." dropdown />
              <FieldL label="Дата" required value="21 апр" />
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <FieldL label="Ингредиент" required value="Уксус" dropdown />
              <FieldL label="Количество" required value="200 л" mono />
              <FieldL label="Ед. изм." hint="🔒 авто из справочника" value="л" locked />
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <FieldL label="Водитель" required value="Вихров П." dropdown />
              <FieldL label="ТК" hint="🔒 авто" value="ИП Фастов" locked />
              <FieldL label="Машина / госномер" value="К 245 ОР 77" mono />
            </div>
            <FieldL label="Комментарий" hint="опц." value="Срочно — закончилось у поставщика" />
            <div style={{
              padding:'5px 10px', background:'#fff5e8',
              border:'1px dashed #e0a060', borderRadius:3
            }}>
              <LabelL size={11} color="#a06000">
                ⏰ Через 2 дня после даты появится баннер «Пометить доставленным?» · рейс попадёт в аналитику ТК как «Обратный рейс»
              </LabelL>
            </div>
            <div style={{ display:'flex', gap:6, justifyContent:'flex-end', marginTop:4 }}>
              <BoxL className="sk-gray" style={{ padding:'5px 16px', cursor:'pointer' }}>
                <LabelL size={13}>Отмена</LabelL>
              </BoxL>
              <div style={{ background:'#1a6b3a', border:'2px solid #333', padding:'5px 16px', borderRadius:3, cursor:'pointer' }}>
                <LabelL size={13} bold color="#fff">✓ Создать (статус «В пути»)</LabelL>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop:10, padding:'8px 12px', background:'#fffbe8', border:'1.5px dashed #e09a20', borderRadius:4 }}>
        <LabelL size={13} color="#b06000">
          ✦ Не оборотные: только Завод → Поставщик и Поставщик → Поставщик · авто-баннер через 2 дня · аналитика ТК как «Обратный рейс»
        </LabelL>
      </div>
    </div>
  );
};

/* ============================================================
   6.7 ИНВЕНТАРИЗАЦИЯ — компактная карточка-вкладыш
   (Кнопка + модалка коррекции остатка для Завода и поставщика)
   ============================================================ */
const TaraInventory = () => {
  return (
    <div style={{ padding:14, fontFamily:'Caveat' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
        <LabelL size={20} bold color="#222">⚙ Инвентаризация / корректировка</LabelL>
        <PillL color="#fff0c8" textColor="#a06000" size={11}>👑 только Админ</PillL>
        <PillL color="#e8e5df" size={11}>встроена в карточки</PillL>
      </div>

      <LabelL size={13} color="#555" style={{ marginBottom:6 }}>
        Кнопка «Скорректировать остаток» доступна в карточке Завода и в карточке каждого поставщика на дашборде. Поле нового значения, без причины — событие фиксируется в журнале как «корректировка».
      </LabelL>

      <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
        {/* Left: card with stock + button */}
        <div style={{ flex:1, border:'2px solid #333', borderRadius:4, background:'#fff', overflow:'hidden' }}>
          <div style={{ background:'#7a5080', padding:'7px 12px', display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:18 }}>🏢</span>
            <LabelL size={15} bold color="#fff">Цой К.Т.</LabelL>
            <PillL color="rgba(255,255,255,0.18)" textColor="#fff" size={10}>Ставрополь</PillL>
            <div style={{ flex:1 }} />
            <BoxL className="sk-gray" style={{ padding:'2px 10px', cursor:'pointer', background:'#5a3060', borderColor:'#3a1840' }}>
              <LabelL size={11} color="#fff" bold>⚙ Скорректировать остаток</LabelL>
            </BoxL>
          </div>
          <div style={{ padding:'10px 14px' }}>
            <LabelL size={12} bold color="#555" style={{ marginBottom:6 }}>Текущие остатки</LabelL>
            {[
              { t:'Ящик',          stock:8500, scrap:800, transit:3500 },
              { t:'Бочка железо',  stock:120,  scrap:40,  transit:0    },
              { t:'Бочка пластик', stock:0,    scrap:0,   transit:0    },
            ].map(x => {
              const c = taraColor(x.t);
              return (
                <div key={x.t} style={{
                  display:'flex', alignItems:'center', gap:8,
                  padding:'5px 8px', background:c.bg+'30',
                  borderRadius:3, marginBottom:4
                }}>
                  <div style={{ width:10, height:10, borderRadius:2, background:c.dot }} />
                  <LabelL size={13} bold style={{ width:120 }}>{x.t}</LabelL>
                  <LabelL size={13} bold mono style={{ fontFamily:'JetBrains Mono, monospace', fontSize:12, width:70 }}>{x.stock.toLocaleString()}</LabelL>
                  {x.scrap > 0 && <PillL color="#f5d8c8" textColor="#a04020" size={10}>лом {x.scrap}</PillL>}
                  {x.transit > 0 && <PillL color="#fff0c8" textColor="#a06000" size={10}>↗ {x.transit}</PillL>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: correction modal preview */}
        <div style={{ flex:1, border:'2.5px solid #333', borderRadius:5, background:'#fff', overflow:'hidden', boxShadow:'4px 4px 0 #33333340' }}>
          <div style={{ background:'#2a2a2a', padding:'7px 12px', display:'flex', alignItems:'center', gap:8 }}>
            <LabelL size={14} bold color="#fff">⚙ Скорректировать остаток</LabelL>
            <div style={{ flex:1 }} />
            <LabelL size={16} color="#aaa" style={{ cursor:'pointer' }}>✕</LabelL>
          </div>
          <div style={{ padding:'10px 14px', display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ background:'#f5f3ef', padding:'6px 10px', borderRadius:3, border:'1px dashed #bbb' }}>
              <LabelL size={11} color="#666">Карточка</LabelL>
              <LabelL size={14} bold color="#222">🏢 Цой К.Т. → 📦 Ящик</LabelL>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <FieldL label="Текущее значение" hint="🔒 read-only" value="8 500" locked mono />
              <FieldL label="Новое значение" required value="8 420" mono />
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <FieldL label="Лом — текущее" hint="🔒 read-only" value="800" locked mono />
              <FieldL label="Лом — новое" hint="опц." value="800" mono />
            </div>
            <div style={{
              padding:'6px 10px', background:'#eef6ee', borderRadius:3,
              border:'1px dashed #1a6b3a'
            }}>
              <LabelL size={11} color="#1a6b3a">
                ✓ Движение в журнале: «корректировка» · Δ −80 · без причины
              </LabelL>
            </div>
            <div style={{ display:'flex', gap:6, justifyContent:'flex-end', marginTop:4 }}>
              <BoxL className="sk-gray" style={{ padding:'4px 12px', cursor:'pointer' }}><LabelL size={12}>Отмена</LabelL></BoxL>
              <div style={{ background:'#1a6b3a', border:'2px solid #333', padding:'4px 14px', borderRadius:3, cursor:'pointer' }}>
                <LabelL size={12} bold color="#fff">✓ Сохранить</LabelL>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop:10, padding:'8px 12px', background:'#fffbe8', border:'1.5px dashed #e09a20', borderRadius:4 }}>
        <LabelL size={13} color="#b06000">
          ✦ Без обязательной причины · фиксируется в журнале как «корректировка» · доступно для Завода и каждого поставщика
        </LabelL>
      </div>
    </div>
  );
};

/* expose */
Object.assign(window, {
  TaraDashboard, TaraOutbound, TaraScrap, TaraTransfers, TaraJournal, TaraInventory, Ingredients,
});
