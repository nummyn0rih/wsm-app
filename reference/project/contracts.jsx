/* ─────────── 4. КОНТРАКТЫ ─────────── */
/* Использует глобальные атомы: Box, Label, Pill, HR, RAW_COLORS, StatusChip */
const { useState: useStateC } = React;

const C_RAW = window.RAW_COLORS;
const CBox = window.Box;
const CLabel = window.Label;
const CPill = window.Pill;
const CHR = window.HR;

/* Хелперы */
const fmtKg = (n) => n.toLocaleString('ru-RU').replace(/,/g, ' ');
const fmtRub = (n) => n.toLocaleString('ru-RU').replace(/,/g, ' ') + ' ₽';

/* Статус контракта */
const ContractStatusChip = ({ status }) => {
  if (status === 'Активный') return <CPill color="#c8e8c8" textColor="#1a6b3a" size={11}>● Активный</CPill>;
  if (status === 'Закрыт')   return <CPill color="#dcdcdc" textColor="#555"    size={11}>✓ Закрыт</CPill>;
  if (status === 'Черновик') return <CPill color="#fff0c8" textColor="#a06000" size={11}>◷ Черновик</CPill>;
  return <CPill color="#eee" size={11}>{status}</CPill>;
};

/* Пилюля сырья (мелкая, для ячеек) */
const RawPill = ({ raw, size = 11 }) => {
  const c = C_RAW[raw] || { bg:'#eee', dot:'#999' };
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap:4,
      padding:'1px 7px 1px 4px',
      background: c.bg, border:'1.5px solid #333', borderRadius:20,
      fontFamily:'Caveat', fontSize: size, whiteSpace:'nowrap'
    }}>
      <div style={{ width:7, height:7, borderRadius:8, background:c.dot, flexShrink:0 }}/>
      <span>{raw}</span>
    </div>
  );
};

/* Прогресс-бар одной позиции: контур = план, заливка цветом сырья = факт */
const PositionProgress = ({ raw, planKg, factKg, dateRange, height = 22 }) => {
  const c = C_RAW[raw] || { bg:'#eee', dot:'#999' };
  const pct = planKg > 0 ? Math.min(100, Math.round((factKg / planKg) * 100)) : 0;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:3, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:9, height:9, borderRadius:9, background:c.dot, flexShrink:0 }}/>
          <CLabel size={13} bold>{raw}</CLabel>
        </div>
        <CLabel size={12} color="#555">·</CLabel>
        <CLabel size={12} bold color="#222" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>
          {fmtKg(factKg)} / {fmtKg(planKg)} кг
        </CLabel>
        <CLabel size={12} color="#555">·</CLabel>
        <CLabel size={13} bold color={pct >= 75 ? '#1a6b3a' : pct >= 30 ? '#a06000' : '#999'}>{pct}%</CLabel>
        <div style={{ flex:1 }}/>
        {dateRange && <CLabel size={11} color="#888" style={{ fontStyle:'italic' }}>{dateRange}</CLabel>}
      </div>
      <div style={{
        height, background:'#fff',
        border:`2px solid ${c.dot.includes('gradient') ? '#333' : c.dot}`,
        borderRadius: 3, position:'relative', overflow:'hidden'
      }}>
        <div style={{
          width: `${pct}%`, height:'100%',
          background: c.dot.includes('gradient') ? c.dot : c.dot,
          opacity: 0.85,
          transition:'width .3s'
        }}/>
        {/* лёгкая штриховка на пустой части */}
        <div style={{
          position:'absolute', top:0, left:`${pct}%`, right:0, bottom:0,
          background:'repeating-linear-gradient(-45deg, transparent, transparent 4px, #f0ede8 4px, #f0ede8 6px)'
        }}/>
      </div>
    </div>
  );
};

/* ─────────── 4.1 СПИСОК КОНТРАКТОВ ─────────── */
const ContractsList = () => {
  const contracts = [
    {
      supplier:'Генералов', season:'2025/2026',
      items:['Огурцы','Томаты'],
      planKg: 650000, factKg: 148000,
      planRub: 33000000, factRub: 6660000,
      status:'Активный'
    },
    {
      supplier:'Цой К.Т.', season:'2025/2026',
      items:['Черри','Томаты'],
      planKg: 420000, factKg: 220500,
      planRub: 25200000, factRub: 13230000,
      status:'Активный'
    },
    {
      supplier:'Ким Т.', season:'2025/2026',
      items:['Томаты','Перец'],
      planKg: 380000, factKg: 380000,
      planRub: 22800000, factRub: 22800000,
      status:'Закрыт'
    },
    {
      supplier:'Пак И.', season:'2025/2026',
      items:['Патиссоны','Халапеньо','Баклажан'],
      planKg: 180000, factKg: 0,
      planRub: 14400000, factRub: 0,
      status:'Черновик'
    },
    {
      supplier:'Ли Д.', season:'2025/2026',
      items:['Перец','Баклажан'],
      planKg: 290000, factKg: 87000,
      planRub: 20300000, factRub: 6090000,
      status:'Активный'
    },
    {
      supplier:'Генералов', season:'2024/2025',
      items:['Огурцы','Томаты','Перец'],
      planKg: 580000, factKg: 562300,
      planRub: 28000000, factRub: 27184000,
      status:'Закрыт'
    },
  ];

  const COLW = {
    supplier: 130, season: 100, items: 220,
    planKg: 110, factKg: 110, pct: 78,
    planRub: 130, factRub: 130, status: 110, edit: 30
  };
  const totalW = Object.values(COLW).reduce((a,b) => a+b, 0);

  return (
    <div style={{ padding: 12, fontFamily: 'Caveat', position:'relative' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <CBox className="sk-gray" style={{ padding: '5px 16px', cursor: 'pointer', display:'flex',alignItems:'center',gap:6, background:'#1a6b3a', borderColor:'#0d4020', minWidth:140 }}>
          <span style={{fontSize:14, color:'#fff'}}>＋</span><CLabel size={14} bold color="#fff" style={{whiteSpace:'nowrap'}}>Контракт</CLabel>
        </CBox>
        <div style={{ flex: 1 }} />
        <CBox className="sk-gray" style={{ padding: '5px 10px' }}><CLabel size={13}>🔍 Поиск</CLabel></CBox>
        <CBox className="sk-gray" style={{ padding: '5px 10px' }}><CLabel size={13}>↓ Excel</CLabel></CBox>
        <CBox className="sk-gray" style={{ padding: '5px 10px' }}><CLabel size={13}>🖨</CLabel></CBox>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:6, marginBottom: 8, alignItems:'center', flexWrap:'wrap', padding:'6px 8px', background:'#f5f3ed', border:'1.5px solid #ccc', borderRadius:3 }}>
        <CLabel size={13} bold color="#555" style={{marginRight:4}}>Фильтры:</CLabel>
        <CBox className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer', background:'#1a6b3a', borderColor:'#0d4020' }}>
          <CLabel size={12} color="#fff" bold>📅 Сезон 2025/2026 ▾</CLabel>
        </CBox>
        <CBox className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer' }}>
          <CLabel size={12}>🏢 Поставщик: все ▾</CLabel>
        </CBox>
        <CBox className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer' }}>
          <CLabel size={12}>🥒 Сырьё: все ▾</CLabel>
        </CBox>
        <CBox className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer' }}>
          <CLabel size={12}>● Статус: все ▾</CLabel>
        </CBox>
        <div style={{ flex:1 }} />
        <CLabel size={11} color="#888" style={{fontStyle:'italic'}}>очистить все</CLabel>
      </div>

      {/* Table */}
      <div style={{ border: '2px solid #333', borderRadius: 3, overflow: 'hidden', background: '#fff' }}>
        {/* Header */}
        <div style={{ display:'flex', background:'#2a2a2a', color:'#fff' }}>
          <div style={{ width: COLW.supplier, padding:'5px 8px', borderRight:'1px solid #555' }}><CLabel size={12} bold color="#fff">Поставщик</CLabel></div>
          <div style={{ width: COLW.season,   padding:'5px 8px', borderRight:'1px solid #555' }}><CLabel size={12} bold color="#fff">Сезон</CLabel></div>
          <div style={{ width: COLW.items,    padding:'5px 8px', borderRight:'1px solid #555' }}><CLabel size={12} bold color="#fff">Позиции</CLabel></div>
          <div style={{ width: COLW.planKg,   padding:'5px 8px', borderRight:'1px solid #555', textAlign:'right' }}><CLabel size={12} bold color="#fff">Σ план кг</CLabel></div>
          <div style={{ width: COLW.factKg,   padding:'5px 8px', borderRight:'1px solid #555', textAlign:'right' }}><CLabel size={12} bold color="#fff">Σ факт кг</CLabel></div>
          <div style={{ width: COLW.pct,      padding:'5px 8px', borderRight:'1px solid #555', textAlign:'center' }}><CLabel size={12} bold color="#fff">% вып.</CLabel></div>
          <div style={{ width: COLW.planRub,  padding:'5px 8px', borderRight:'1px solid #555', textAlign:'right' }}><CLabel size={12} bold color="#fff">Σ план ₽</CLabel></div>
          <div style={{ width: COLW.factRub,  padding:'5px 8px', borderRight:'1px solid #555', textAlign:'right' }}><CLabel size={12} bold color="#fff">Σ факт ₽</CLabel></div>
          <div style={{ width: COLW.status,   padding:'5px 8px', borderRight:'1px solid #555' }}><CLabel size={12} bold color="#fff">Статус</CLabel></div>
          <div style={{ width: COLW.edit,     padding:'5px 0',   textAlign:'center' }}><CLabel size={11} bold color="#fff">⚙</CLabel></div>
        </div>

        {/* Body */}
        {contracts.map((c, i) => {
          const pct = c.planKg > 0 ? Math.round((c.factKg / c.planKg) * 100) : 0;
          const draft = c.status === 'Черновик';
          const closed = c.status === 'Закрыт';
          const rowBg = draft
            ? 'repeating-linear-gradient(-45deg,#fff,#fff 6px,#fff8e8 6px,#fff8e8 8px)'
            : (i % 2 === 0 ? '#fafafa' : '#fff');
          return (
            <div key={i} style={{
              display:'flex', borderBottom:'1px solid #ddd',
              background: rowBg, opacity: closed ? 0.75 : 1
            }}>
              <div style={{ width: COLW.supplier, padding:'6px 8px', borderRight:'1px solid #eee', display:'flex', alignItems:'center' }}>
                <CLabel size={13} bold color="#222">{c.supplier}</CLabel>
              </div>
              <div style={{ width: COLW.season, padding:'6px 8px', borderRight:'1px solid #eee', display:'flex', alignItems:'center' }}>
                <CLabel size={12} color="#555" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>{c.season}</CLabel>
              </div>
              <div style={{ width: COLW.items, padding:'4px 8px', borderRight:'1px solid #eee', display:'flex', alignItems:'center', gap:3, flexWrap:'wrap' }}>
                {c.items.map((r, j) => <RawPill key={j} raw={r} />)}
              </div>
              <div style={{ width: COLW.planKg, padding:'6px 8px', borderRight:'1px solid #eee', display:'flex', alignItems:'center', justifyContent:'flex-end' }}>
                <CLabel size={12} color="#333" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>{fmtKg(c.planKg)}</CLabel>
              </div>
              <div style={{ width: COLW.factKg, padding:'6px 8px', borderRight:'1px solid #eee', display:'flex', alignItems:'center', justifyContent:'flex-end' }}>
                <CLabel size={12} bold color="#1a6b3a" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>{fmtKg(c.factKg)}</CLabel>
              </div>
              <div style={{ width: COLW.pct, padding:'4px 6px', borderRight:'1px solid #eee', display:'flex', alignItems:'center', gap:4 }}>
                <div style={{ flex:1, height:8, background:'#eee', border:'1px solid #bbb', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ width:`${pct}%`, height:'100%', background: pct >= 75 ? '#1a6b3a' : pct >= 30 ? '#c8a020' : '#aaa' }}/>
                </div>
                <CLabel size={11} bold color="#333" style={{ width:28, textAlign:'right' }}>{pct}%</CLabel>
              </div>
              <div style={{ width: COLW.planRub, padding:'6px 8px', borderRight:'1px solid #eee', display:'flex', alignItems:'center', justifyContent:'flex-end' }}>
                <CLabel size={11} color="#555" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>{fmtRub(c.planRub)}</CLabel>
              </div>
              <div style={{ width: COLW.factRub, padding:'6px 8px', borderRight:'1px solid #eee', display:'flex', alignItems:'center', justifyContent:'flex-end' }}>
                <CLabel size={11} bold color="#1a4a8a" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>{fmtRub(c.factRub)}</CLabel>
              </div>
              <div style={{ width: COLW.status, padding:'6px 8px', borderRight:'1px solid #eee', display:'flex', alignItems:'center' }}>
                <ContractStatusChip status={c.status} />
              </div>
              <div style={{ width: COLW.edit, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <CLabel size={14} color="#555">✎</CLabel>
              </div>
            </div>
          );
        })}

        {/* Footer total */}
        <div style={{
          display:'flex', background:'#f0f0c8',
          borderTop:'2px dashed #bbb'
        }}>
          <div style={{ width: COLW.supplier + COLW.season, padding:'6px 8px', borderRight:'1px solid #ddd', display:'flex', alignItems:'center' }}>
            <CLabel size={13} bold color="#555">Итого: 6 контрактов</CLabel>
          </div>
          <div style={{ width: COLW.items, padding:'6px 8px', borderRight:'1px solid #ddd', display:'flex', alignItems:'center', gap:3, flexWrap:'wrap' }}>
            <CLabel size={11} color="#777">7 видов сырья</CLabel>
          </div>
          <div style={{ width: COLW.planKg, padding:'6px 8px', borderRight:'1px solid #ddd', textAlign:'right' }}>
            <CLabel size={12} bold style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>2 500 000</CLabel>
          </div>
          <div style={{ width: COLW.factKg, padding:'6px 8px', borderRight:'1px solid #ddd', textAlign:'right' }}>
            <CLabel size={12} bold color="#1a6b3a" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>1 397 800</CLabel>
          </div>
          <div style={{ width: COLW.pct, padding:'6px 8px', borderRight:'1px solid #ddd', textAlign:'center' }}>
            <CLabel size={12} bold color="#a06000">56%</CLabel>
          </div>
          <div style={{ width: COLW.planRub, padding:'6px 8px', borderRight:'1px solid #ddd', textAlign:'right' }}>
            <CLabel size={11} bold style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>143 700 000 ₽</CLabel>
          </div>
          <div style={{ width: COLW.factRub, padding:'6px 8px', borderRight:'1px solid #ddd', textAlign:'right' }}>
            <CLabel size={11} bold color="#1a4a8a" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>75 964 000 ₽</CLabel>
          </div>
          <div style={{ width: COLW.status + COLW.edit }}/>
        </div>
      </div>

      <div style={{ marginTop: 12, padding: '8px 12px', background: '#fffbe8', border: '1.5px dashed #e09a20', borderRadius: 4 }}>
        <CLabel size={13} color="#b06000">
          ✦ Клик по строке → карточка контракта · клик ＋ Контракт → форма · черновики — полосатой штриховкой, как «Запланировано» в отгрузках
        </CLabel>
      </div>
    </div>
  );
};

/* ─────────── 4.2 ФОРМА КОНТРАКТА (модалка) ─────────── */
const Field2 = ({ label, hint, value, placeholder, type, required, w }) => (
  <div style={{ flex: w || 1, minWidth: 0 }}>
    <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:2 }}>
      <CLabel size={12} bold>{label}{required && <span style={{color:'#c33'}}> *</span>}</CLabel>
      {hint && <CLabel size={10} color="#999">{hint}</CLabel>}
    </div>
    <div style={{
      border: '1.5px solid #999', borderRadius: 3,
      padding: '3px 7px', background: '#fff',
      display:'flex', alignItems:'center', justifyContent:'space-between', minHeight: 22
    }}>
      {value
        ? <CLabel size={12} bold>{value}</CLabel>
        : <CLabel size={11} color="#bbb">{placeholder || (type === 'select' ? 'Выбрать...' : type === 'date' ? 'дд.мм' : '—')}</CLabel>}
      {type === 'select' && <CLabel size={11} color="#999">▾</CLabel>}
    </div>
  </div>
);

const ContractForm = () => {
  const positions = [
    { raw:'Огурцы',  from:'01.06', to:'31.07', planKg: 400000, price: 45 },
    { raw:'Томаты',  from:'01.08', to:'30.09', planKg: 250000, price: 60 },
  ];
  const totalKg  = positions.reduce((s,p) => s + p.planKg, 0);
  const totalRub = positions.reduce((s,p) => s + p.planKg * p.price, 0);

  return (
    <div style={{ padding: 12 }}>
      <div style={{
        border: '2.5px solid #333', borderRadius: 6, background: '#fff',
        boxShadow: '4px 4px 0 #33333340'
      }}>
        {/* Header */}
        <div style={{
          background: '#1a6b3a', padding: '8px 14px',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <span style={{ fontSize:16 }}>📄</span>
          <CLabel size={16} bold color="#fff">Новый контракт</CLabel>
          <CPill color="#fff0c8" textColor="#a06000" size={11}>◷ Черновик</CPill>
          <div style={{ flex: 1 }} />
          <CLabel size={18} color="#aed6be" style={{ cursor: 'pointer' }}>✕</CLabel>
        </div>

        <div style={{ padding: '10px 14px' }}>
          {/* Section 1: Шапка */}
          <div style={{ background:'#f5f3ef', padding:'8px 10px', border:'1px dashed #bbb', borderRadius:3, marginBottom:10 }}>
            <CLabel size={11} color="#666" style={{ marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>— Шапка контракта —</CLabel>
            <div style={{ display:'flex', gap:8, marginBottom:6 }}>
              <Field2 label="Поставщик" type="select" required value="Генералов" w={1.5} />
              <Field2 label="Сезон" hint="из справочника" type="select" required value="2025/2026" />
            </div>
            <div>
              <CLabel size={12} bold style={{ marginBottom:2 }}>Комментарий <span style={{color:'#999', fontWeight:400, fontSize:10}}>опц.</span></CLabel>
              <div style={{ border:'1.5px solid #999', borderRadius:3, padding:'4px 7px', background:'#fff', minHeight:38 }}>
                <CLabel size={12} color="#a06000" style={{ fontStyle:'italic' }}>
                  Контракт на огурцы (июн–июл) и томаты (авг–сен). Цены фиксированные на сезон.
                </CLabel>
              </div>
            </div>
          </div>

          {/* Section 2: Позиции */}
          <div style={{ marginBottom: 6, display:'flex', alignItems:'baseline', gap:6 }}>
            <CLabel size={13} bold>Позиции контракта</CLabel>
            <CLabel size={11} color="#888">у каждой позиции свои даты, цена и план</CLabel>
          </div>

          <div style={{ border:'1.5px solid #333', borderRadius:3, overflow:'hidden' }}>
            {/* Header */}
            <div style={{ display:'flex', background:'#2a2a2a', color:'#fff', padding:'4px 6px', gap:6 }}>
              <CLabel size={11} bold color="#fff" style={{ width:20 }}>№</CLabel>
              <CLabel size={11} bold color="#fff" style={{ flex:1.4 }}>Сырьё *</CLabel>
              <CLabel size={11} bold color="#fff" style={{ flex:0.9 }}>Дата от *</CLabel>
              <CLabel size={11} bold color="#fff" style={{ flex:0.9 }}>Дата до *</CLabel>
              <CLabel size={11} bold color="#fff" style={{ flex:1.1 }}>План кг *</CLabel>
              <CLabel size={11} bold color="#fff" style={{ flex:1 }}>Цена ₽/кг *</CLabel>
              <CLabel size={11} bold color="#fff" style={{ flex:1.2 }}>План ₽ <span style={{fontWeight:400,opacity:0.7}}>авто</span></CLabel>
              <CLabel size={11} bold color="#fff" style={{ width:22 }}></CLabel>
            </div>
            {positions.map((p, i) => {
              const c = C_RAW[p.raw] || { bg:'#eee', dot:'#999' };
              const planRub = p.planKg * p.price;
              return (
                <div key={i} style={{
                  display:'flex', gap:6, padding:'5px 6px',
                  background: c.bg + '55', borderBottom:'1px dashed #ccc', alignItems:'center'
                }}>
                  <CLabel size={11} color="#888" style={{ width:20 }}>{i+1}</CLabel>
                  <div style={{ flex:1.4, border:'1px solid #aaa', borderRadius:2, padding:'2px 5px', background:'#fff', display:'flex', alignItems:'center', gap:4 }}>
                    <div style={{ width:8, height:8, borderRadius:8, background:c.dot }}/>
                    <CLabel size={12} bold>{p.raw}</CLabel>
                    <div style={{ flex:1 }}/>
                    <CLabel size={10} color="#999">▾</CLabel>
                  </div>
                  <div style={{ flex:0.9, border:'1px solid #aaa', borderRadius:2, padding:'2px 5px', background:'#fff', display:'flex', alignItems:'center' }}>
                    <CLabel size={12} style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>{p.from}</CLabel>
                    <div style={{ flex:1 }}/>
                    <CLabel size={10} color="#999">📅</CLabel>
                  </div>
                  <div style={{ flex:0.9, border:'1px solid #aaa', borderRadius:2, padding:'2px 5px', background:'#fff', display:'flex', alignItems:'center' }}>
                    <CLabel size={12} style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>{p.to}</CLabel>
                    <div style={{ flex:1 }}/>
                    <CLabel size={10} color="#999">📅</CLabel>
                  </div>
                  <div style={{ flex:1.1, border:'1px solid #aaa', borderRadius:2, padding:'2px 5px', background:'#fff', textAlign:'right' }}>
                    <CLabel size={12} style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>{fmtKg(p.planKg)}</CLabel>
                  </div>
                  <div style={{ flex:1, border:'1px solid #aaa', borderRadius:2, padding:'2px 5px', background:'#fff', textAlign:'right' }}>
                    <CLabel size={12} style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>{p.price}</CLabel>
                  </div>
                  <div style={{ flex:1.2, padding:'2px 5px', textAlign:'right',
                    background:'#f0f0c8', borderRadius:2, border:'1px dashed #c8a020' }}>
                    <CLabel size={12} bold color="#1a4a8a" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>{fmtRub(planRub)}</CLabel>
                  </div>
                  <CLabel size={14} color="#c33" style={{ width:22, textAlign:'center', cursor:'pointer' }}>✕</CLabel>
                </div>
              );
            })}
            <div style={{ padding:'5px 8px', background:'#f0f0c8', cursor:'pointer', borderTop:'1px solid #bbb' }}>
              <CLabel size={12} bold color="#1a6b3a">＋ Добавить позицию</CLabel>
            </div>
          </div>

          {/* Итог */}
          <div style={{ marginTop:8, padding:'6px 10px', background:'#eef6ee', borderRadius:3, display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <CLabel size={13} bold color="#1a6b3a">Итог по контракту:</CLabel>
            <CPill color="#fff" size={12}>Σ {fmtKg(totalKg)} кг</CPill>
            <CPill color="#fff" size={12}>Σ {fmtRub(totalRub)}</CPill>
            <CPill color="#fff" size={12}>{positions.length} позиции</CPill>
          </div>

          <CHR my={10} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <CBox className="sk-gray" style={{ padding: '5px 16px', cursor: 'pointer' }}>
              <CLabel size={13}>Отмена</CLabel>
            </CBox>
            <div style={{
              background: '#eee', border: '2px solid #333',
              padding: '5px 16px', borderRadius: 3, cursor: 'pointer'
            }}>
              <CLabel size={13}>Сохранить как черновик</CLabel>
            </div>
            <div style={{
              background: '#1a6b3a', border: '2px solid #333',
              padding: '5px 16px', borderRadius: 3, cursor: 'pointer'
            }}>
              <CLabel size={13} bold color="#fff">✓ Активировать контракт</CLabel>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 10, padding: '8px 12px', background: '#fffbe8', border: '1.5px dashed #e09a20', borderRadius: 4 }}>
        <CLabel size={13} color="#b06000">
          ✦ Шапка с поставщиком и сезоном · позиции с собственными датами (огурцы июн–июл, томаты авг–сен) · «План ₽» считается автоматически как кг × цена
        </CLabel>
      </div>
    </div>
  );
};

/* ─────────── 4.3 КАРТОЧКА КОНТРАКТА ─────────── */
const ContractDetail = () => {
  const [season, setSeason] = useStateC('2025/2026');

  const seasons = {
    '2025/2026': {
      status: 'Активный',
      positions: [
        { raw:'Огурцы', planKg: 400000, factKg: 148000, price: 45, dateRange:'01 июн – 31 июл' },
        { raw:'Томаты', planKg: 250000, factKg: 0,      price: 60, dateRange:'01 авг – 30 сен' },
      ],
      comment: 'Контракт на огурцы и томаты. Цены фиксированные на сезон.',
    },
    '2024/2025': {
      status: 'Закрыт',
      positions: [
        { raw:'Огурцы', planKg: 350000, factKg: 348200, price: 42, dateRange:'01 июн – 31 июл' },
        { raw:'Томаты', planKg: 200000, factKg: 198400, price: 55, dateRange:'01 авг – 30 сен' },
        { raw:'Перец',  planKg: 30000,  factKg: 30000,  price: 70, dateRange:'15 авг – 30 сен' },
      ],
      comment: 'Сезон закрыт. Выполнение 99,7%.',
    },
  };

  const cur = seasons[season];
  const totalPlanKg  = cur.positions.reduce((s,p) => s + p.planKg, 0);
  const totalFactKg  = cur.positions.reduce((s,p) => s + p.factKg, 0);
  const totalPlanRub = cur.positions.reduce((s,p) => s + p.planKg * p.price, 0);
  const totalFactRub = cur.positions.reduce((s,p) => s + p.factKg * p.price, 0);
  const remainKg  = totalPlanKg - totalFactKg;
  const remainRub = totalPlanRub - totalFactRub;
  const overallPct = totalPlanKg > 0 ? Math.round((totalFactKg / totalPlanKg) * 100) : 0;

  // Для side-by-side: загружаем оба сезона, сопоставляем по сырью
  const both = {
    a: seasons['2024/2025'],
    b: seasons['2025/2026'],
  };
  const allRaws = Array.from(new Set([
    ...both.a.positions.map(p => p.raw),
    ...both.b.positions.map(p => p.raw),
  ]));

  return (
    <div style={{ padding: 12, fontFamily: 'Caveat' }}>
      {/* Breadcrumb / back */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
        <CLabel size={12} color="#888" style={{ cursor:'pointer' }}>← Контракты</CLabel>
        <CLabel size={12} color="#bbb">/</CLabel>
        <CLabel size={12} color="#555">Генералов · {season}</CLabel>
        <div style={{ flex:1 }}/>
        <CBox className="sk-gray" style={{ padding:'4px 10px', cursor:'pointer' }}>
          <CLabel size={12} bold>✎ Редактировать</CLabel>
        </CBox>
        <CBox className="sk-gray" style={{ padding:'4px 10px', cursor:'pointer' }}>
          <CLabel size={12}>↓ Excel</CLabel>
        </CBox>
        <CBox className="sk-gray" style={{ padding:'4px 10px', cursor:'pointer' }}>
          <CLabel size={12}>🖨</CLabel>
        </CBox>
      </div>

      {/* HEADER CARD */}
      <div style={{ border:'2px solid #333', borderRadius:4, background:'#fff', overflow:'hidden', marginBottom:10 }}>
        <div style={{ background:'#1a6b3a', padding:'8px 14px', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
          <span style={{ fontSize:18 }}>📄</span>
          <CLabel size={18} bold color="#fff">Генералов</CLabel>
          <CPill color="#12532c" textColor="#fff" size={12}>Сезон {season}</CPill>
          <ContractStatusChip status={cur.status} />
          <div style={{ flex:1 }}/>
          {/* Season switcher */}
          <div style={{
            display:'inline-flex', border:'2px solid #fff', borderRadius:3,
            background:'rgba(0,0,0,0.2)', overflow:'hidden'
          }}>
            {['2024/2025', '2025/2026'].map(s => (
              <div key={s}
                onClick={() => setSeason(s)}
                style={{
                  padding:'3px 10px', cursor:'pointer',
                  background: season === s ? '#fff' : 'transparent',
                  borderRight: s === '2024/2025' ? '2px solid #fff' : 'none'
                }}>
                <CLabel size={12} bold color={season === s ? '#1a6b3a' : '#fff'}>{s}</CLabel>
              </div>
            ))}
          </div>
        </div>

        {/* Comment + KPI */}
        <div style={{ padding:'10px 14px', display:'flex', gap:14, flexWrap:'wrap', alignItems:'flex-start' }}>
          <div style={{ flex:'1 1 280px', minWidth:240 }}>
            <CLabel size={11} color="#888" style={{ textTransform:'uppercase', letterSpacing:1 }}>Комментарий</CLabel>
            <div style={{
              marginTop:3, padding:'5px 10px',
              background:'#fffbe8', border:'1.5px dashed #d4b878', borderRadius:3
            }}>
              <CLabel size={12} color="#a06000" style={{ fontStyle:'italic' }}>{cur.comment}</CLabel>
            </div>
          </div>
          {[
            { l:'Σ план кг', v: fmtKg(totalPlanKg), c:'#555' },
            { l:'Σ факт кг', v: fmtKg(totalFactKg), c:'#1a6b3a', bold:true },
            { l:'% выполнения', v: overallPct + '%', c: overallPct >= 75 ? '#1a6b3a' : '#a06000', bold:true },
          ].map((k, i) => (
            <div key={i} style={{ minWidth:90 }}>
              <CLabel size={11} color="#888" style={{ textTransform:'uppercase', letterSpacing:1 }}>{k.l}</CLabel>
              <CLabel size={18} bold={k.bold} color={k.c} style={{ fontFamily:'JetBrains Mono, monospace', fontSize:16 }}>{k.v}</CLabel>
            </div>
          ))}
        </div>
      </div>

      {/* PROGRESS PER POSITION */}
      <div style={{ border:'2px solid #333', borderRadius:4, background:'#fff', marginBottom:10 }}>
        <div style={{ background:'#2a2a2a', padding:'5px 12px' }}>
          <CLabel size={13} bold color="#fff">Прогресс по позициям</CLabel>
        </div>
        <div style={{ padding:'12px 14px' }}>
          {cur.positions.map((p, i) => (
            <PositionProgress key={i} {...p} />
          ))}
        </div>
      </div>

      {/* FINANCE BLOCK */}
      <div style={{ border:'2px solid #333', borderRadius:4, background:'#fff', marginBottom:10 }}>
        <div style={{ background:'#2a2a2a', padding:'5px 12px' }}>
          <CLabel size={13} bold color="#fff">Финансы</CLabel>
        </div>
        <div style={{ padding:'10px 14px', display:'flex', gap:10, flexWrap:'wrap' }}>
          {[
            { l:'Стоимость привезённого', v: fmtRub(totalFactRub), c:'#1a4a8a', sub: `${fmtKg(totalFactKg)} кг`, bg:'#eaf2ff' },
            { l:'Остаток к выборке',      v: fmtRub(remainRub),    c:'#a06000', sub: `${fmtKg(remainKg)} кг`,    bg:'#fffbe8' },
            { l:'Полный план',            v: fmtRub(totalPlanRub), c:'#555',    sub: `${fmtKg(totalPlanKg)} кг`,  bg:'#f5f3ef' },
          ].map((k, i) => (
            <div key={i} style={{
              flex:'1 1 200px', minWidth:180,
              padding:'8px 12px', background: k.bg,
              border:'1.5px solid #ccc', borderRadius:3
            }}>
              <CLabel size={11} color="#888" style={{ textTransform:'uppercase', letterSpacing:1 }}>{k.l}</CLabel>
              <CLabel size={20} bold color={k.c} style={{ fontFamily:'JetBrains Mono, monospace', fontSize:18 }}>{k.v}</CLabel>
              <CLabel size={11} color="#777" style={{ fontStyle:'italic' }}>{k.sub}</CLabel>
            </div>
          ))}
        </div>
      </div>

      {/* SEASON COMPARE */}
      <div style={{ border:'2px solid #333', borderRadius:4, background:'#fff' }}>
        <div style={{ background:'#2a2a2a', padding:'5px 12px', display:'flex', alignItems:'center', gap:8 }}>
          <CLabel size={13} bold color="#fff">Сравнение сезонов</CLabel>
          <CLabel size={11} color="#aaa" style={{ fontStyle:'italic' }}>2024/2025 vs 2025/2026</CLabel>
        </div>
        <div style={{ display:'flex', borderTop:'1px solid #333' }}>
          {/* LEFT: 2024/2025 */}
          <div style={{ flex:1, borderRight:'2px dashed #aaa', padding:'10px 12px', background:'#fafafa' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <CPill color="#dcdcdc" textColor="#555" size={11}>Сезон 2024/2025</CPill>
              <ContractStatusChip status={both.a.status} />
              <div style={{ flex:1 }}/>
              <CLabel size={12} bold color="#1a6b3a">99,7%</CLabel>
            </div>
            {allRaws.map((raw, i) => {
              const p = both.a.positions.find(x => x.raw === raw);
              if (!p) {
                return (
                  <div key={i} style={{ marginBottom:8, opacity:0.4 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:3 }}>
                      <RawPill raw={raw} />
                      <CLabel size={11} color="#999" style={{ fontStyle:'italic' }}>не было в этом сезоне</CLabel>
                    </div>
                    <div style={{ height:22, background:'#f0ede8', border:'1.5px dashed #ccc', borderRadius:3 }}/>
                  </div>
                );
              }
              return <PositionProgress key={i} {...p} />;
            })}
            <CHR my={6} dashed />
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              <CPill color="#fff" size={11}>Σ план: {fmtKg(both.a.positions.reduce((s,p)=>s+p.planKg,0))} кг</CPill>
              <CPill color="#fff" size={11}>Σ факт: {fmtKg(both.a.positions.reduce((s,p)=>s+p.factKg,0))} кг</CPill>
              <CPill color="#fff" size={11}>{fmtRub(both.a.positions.reduce((s,p)=>s+p.factKg*p.price,0))}</CPill>
            </div>
          </div>
          {/* RIGHT: 2025/2026 */}
          <div style={{ flex:1, padding:'10px 12px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <CPill color="#c8e8c8" textColor="#1a6b3a" size={11}>Сезон 2025/2026</CPill>
              <ContractStatusChip status={both.b.status} />
              <div style={{ flex:1 }}/>
              <CLabel size={12} bold color="#a06000">23%</CLabel>
            </div>
            {allRaws.map((raw, i) => {
              const p = both.b.positions.find(x => x.raw === raw);
              if (!p) {
                return (
                  <div key={i} style={{ marginBottom:8, opacity:0.4 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:3 }}>
                      <RawPill raw={raw} />
                      <CLabel size={11} color="#999" style={{ fontStyle:'italic' }}>нет в этом сезоне</CLabel>
                    </div>
                    <div style={{ height:22, background:'#f0ede8', border:'1.5px dashed #ccc', borderRadius:3 }}/>
                  </div>
                );
              }
              return <PositionProgress key={i} {...p} />;
            })}
            <CHR my={6} dashed />
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              <CPill color="#fff" size={11}>Σ план: {fmtKg(both.b.positions.reduce((s,p)=>s+p.planKg,0))} кг</CPill>
              <CPill color="#fff" size={11}>Σ факт: {fmtKg(both.b.positions.reduce((s,p)=>s+p.factKg,0))} кг</CPill>
              <CPill color="#fff" size={11}>{fmtRub(both.b.positions.reduce((s,p)=>s+p.factKg*p.price,0))}</CPill>
            </div>
          </div>
        </div>
        {/* Diff footer */}
        <div style={{ padding:'6px 12px', background:'#f0f0c8', borderTop:'2px dashed #bbb', display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
          <CLabel size={12} bold color="#555">Δ план кг:</CLabel>
          <CPill color="#d4eac2" size={11}>+ {fmtKg(totalPlanKg - both.a.positions.reduce((s,p)=>s+p.planKg,0))} кг</CPill>
          <CLabel size={12} bold color="#555" style={{ marginLeft:8 }}>Δ цена огурцы:</CLabel>
          <CPill color="#ffe0c2" size={11}>42 → 45 ₽/кг (+7%)</CPill>
          <CLabel size={12} bold color="#555" style={{ marginLeft:8 }}>Δ цена томаты:</CLabel>
          <CPill color="#ffe0c2" size={11}>55 → 60 ₽/кг (+9%)</CPill>
        </div>
      </div>

      <div style={{ marginTop: 12, padding: '8px 12px', background: '#fffbe8', border: '1.5px dashed #e09a20', borderRadius: 4 }}>
        <CLabel size={13} color="#b06000">
          ✦ Шапка с прогрессом по позициям (контур = план, заливка цветом сырья = факт) · финансовый блок · сравнение сезонов side-by-side с дельтами по цене
        </CLabel>
      </div>
    </div>
  );
};

/* Expose to host */
Object.assign(window, { ContractsList, ContractForm, ContractDetail });
