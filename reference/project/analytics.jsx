/* ─────────── 5. АНАЛИТИКА (только Админ) ─────────── */
/* Использует глобальные атомы: Box, Label, Pill, HR, RAW_COLORS */

const { useState: useStateAn } = React;

const A_RAW   = window.RAW_COLORS;
const ABox    = window.Box;
const ALabel  = window.Label;
const APill   = window.Pill;
const AHR     = window.HR;

const aFmtKg  = (n) => n.toLocaleString('ru-RU').replace(/,/g, ' ');
const aFmtRub = (n) => n.toLocaleString('ru-RU').replace(/,/g, ' ') + ' ₽';
const aFmtRubM = (n) => (n / 1_000_000).toFixed(1).replace('.', ',') + ' млн ₽';

/* Резолвер цвета (gradient → fallback color) */
const aDot = (raw) => {
  const c = A_RAW[raw];
  if (!c) return '#999';
  if (c.dot.includes('gradient')) return '#c03030';
  return c.dot;
};

/* Маленькая «пилюля» сырья — для шапок */
const ARawPill = ({ raw, size = 12 }) => {
  const c = A_RAW[raw] || { bg:'#eee', dot:'#999' };
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap:4,
      padding:'1px 7px 1px 4px',
      background: c.bg, border:'1.5px solid #333', borderRadius:20,
      fontFamily:'Caveat', fontSize: size, whiteSpace:'nowrap'
    }}>
      <div style={{ width:8, height:8, borderRadius:8, background:c.dot.includes('gradient') ? c.dot : c.dot, flexShrink:0 }}/>
      <span>{raw}</span>
    </div>
  );
};

/* Sketch-подобная панель-карточка */
const APanel = ({ title, subtitle, right, children, style = {} }) => (
  <div style={{
    background:'#fff', border:'2px solid #333', borderRadius:3,
    boxShadow:'2px 3px 0 rgba(0,0,0,0.08)',
    ...style
  }}>
    {(title || right) && (
      <div style={{
        display:'flex', alignItems:'center', gap:10,
        padding:'6px 12px', borderBottom:'1.5px dashed #bbb',
        background:'#f7f5ef'
      }}>
        <ALabel size={16} bold color="#222">{title}</ALabel>
        {subtitle && <ALabel size={12} color="#888" style={{ fontStyle:'italic' }}>· {subtitle}</ALabel>}
        <div style={{ flex:1 }}/>
        {right}
      </div>
    )}
    <div style={{ padding:12 }}>{children}</div>
  </div>
);

/* Кнопка-ссылка sketch */
const ABtn = ({ children, active, onClick, color = '#fff' }) => (
  <div
    onClick={onClick}
    style={{
      cursor:'pointer', userSelect:'none',
      padding:'2px 9px', borderRadius:3,
      border:'1.5px solid #333',
      background: active ? '#2a2a2a' : color,
      color: active ? '#fff' : '#222',
      fontFamily:'Caveat', fontSize:13, fontWeight: active ? 700 : 400,
      whiteSpace:'nowrap',
      boxShadow: active ? 'none' : '1px 2px 0 rgba(0,0,0,0.08)'
    }}
  >{children}</div>
);

const AInput = ({ value, w = 120, placeholder, icon }) => (
  <div style={{
    display:'flex', alignItems:'center', gap:5,
    padding:'2px 8px', width:w,
    background:'#fffdf2', border:'1.5px solid #333', borderRadius:3,
    fontFamily:'Caveat'
  }}>
    {icon && <span style={{ fontSize:12 }}>{icon}</span>}
    <span style={{ fontSize:13, color: value ? '#222' : '#aaa', flex:1, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
      {value || placeholder}
    </span>
    <span style={{ color:'#888', fontSize:11 }}>▾</span>
  </div>
);

/* ─────────── ШАПКА ФИЛЬТРОВ ─────────── */
const FiltersHeader = () => {
  const [period, setPeriod] = useStateAn('Сезон');
  const [compare, setCompare] = useStateAn(false);
  const periods = ['Сезон','Месяц','Неделя','Произв.','Сравнение 2 периодов'];

  return (
    <APanel
      title="Аналитика"
      subtitle="сезон 2025"
      right={
        <div style={{ display:'flex', gap:6 }}>
          <ABtn>↓ Excel (срез)</ABtn>
          <ABtn>🖨 Печать</ABtn>
        </div>
      }
    >
      {/* Период — toggle */}
      <div style={{ display:'flex', gap:14, alignItems:'center', flexWrap:'wrap' }}>
        <ALabel size={12} color="#888" style={{ textTransform:'uppercase', letterSpacing:1 }}>Период</ALabel>
        <div style={{ display:'flex', gap:5 }}>
          {periods.map(p => (
            <ABtn key={p} active={period === p} onClick={() => setPeriod(p)}>{p}</ABtn>
          ))}
        </div>
        <div style={{ width:1, height:22, background:'#ccc' }}/>
        {/* Конкретный диапазон */}
        {period === 'Сравнение 2 периодов' ? (
          <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
            <ALabel size={12} color="#666">A:</ALabel>
            <AInput value="01.06.2025 — 30.09.2025" w={190} icon="📅"/>
            <ALabel size={12} color="#666">vs B:</ALabel>
            <AInput value="01.06.2024 — 30.09.2024" w={190} icon="📅"/>
          </div>
        ) : (
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <AInput value="01.06.2025" w={110} icon="📅"/>
            <ALabel size={12} color="#888">→</ALabel>
            <AInput value="14.10.2025" w={110} icon="📅"/>
          </div>
        )}
      </div>

      <div style={{ height:8 }}/>

      {/* Поставщик / Сырьё / ТК */}
      <div style={{ display:'flex', gap:14, alignItems:'center', flexWrap:'wrap' }}>
        <ALabel size={12} color="#888" style={{ textTransform:'uppercase', letterSpacing:1 }}>Срез</ALabel>
        <AInput value="Все поставщики" w={170} icon="🏭"/>
        <AInput value="Все виды сырья" w={170} icon="🥒"/>
        <AInput value="Все ТК" w={140} icon="🚛"/>
        <div style={{ flex:1 }}/>
        <ALabel size={11} color="#888" style={{ fontStyle:'italic' }}>
          обновлено 14.10.2025 09:42
        </ALabel>
      </div>
    </APanel>
  );
};

/* ─────────── KPI-ПЛИТКИ ─────────── */
const KPI_DATA = [
  { raw: 'Огурцы',    fact: 1_482_000, plan: 4_000_000, rub: 88_920_000, planRub: 240_000_000, contracts: 12 },
  { raw: 'Черри',     fact:   312_000, plan:   600_000, rub: 28_080_000, planRub:  54_000_000, contracts: 4 },
  { raw: 'Томаты',    fact:   980_000, plan: 1_500_000, rub: 49_000_000, planRub:  75_000_000, contracts: 8 },
  { raw: 'Патиссоны', fact:   124_000, plan:   200_000, rub:  9_300_000, planRub:  15_000_000, contracts: 3 },
  { raw: 'Халапеньо', fact:    68_000, plan:    80_000, rub:  6_120_000, planRub:   7_200_000, contracts: 2 },
  { raw: 'Перец',     fact:   220_000, plan:   400_000, rub: 17_600_000, planRub:  32_000_000, contracts: 5 },
  { raw: 'Баклажан',  fact:    96_000, plan:   180_000, rub:  6_720_000, planRub:  12_600_000, contracts: 3 },
];

const KpiTile = ({ raw, fact, plan, rub, planRub, contracts, total }) => {
  const c = total ? { bg:'#222', dot:'#222' } : (A_RAW[raw] || { bg:'#eee', dot:'#999' });
  const pct = plan > 0 ? Math.min(999, Math.round(fact / plan * 100)) : 0;
  const pctRub = planRub > 0 ? Math.round(rub / planRub * 100) : 0;
  const pctColor = pct >= 75 ? '#1a6b3a' : pct >= 30 ? '#a06000' : '#a23';
  const dotBg = total ? '#222' : (c.dot.includes('gradient') ? c.dot : c.dot);

  return (
    <div style={{
      width: 200, flexShrink: 0,
      background: total ? '#2a2a2a' : '#fff',
      color: total ? '#fff' : '#222',
      border:'2px solid #333', borderRadius:3,
      boxShadow:'2px 3px 0 rgba(0,0,0,0.08)',
      padding:'8px 10px', position:'relative', overflow:'hidden'
    }}>
      {/* левый цветной кант */}
      {!total && (
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:5, background: dotBg }}/>
      )}
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
        {!total && <div style={{ width:10, height:10, borderRadius:10, background: dotBg, flexShrink:0 }}/>}
        <ALabel size={total ? 16 : 15} bold color={total ? '#fff' : '#222'}>
          {total ? '∑ Всего' : raw}
        </ALabel>
        <div style={{ flex:1 }}/>
        <ALabel size={11} color={total ? '#bbb' : '#888'} style={{ fontStyle:'italic' }}>{contracts} контр.</ALabel>
      </div>

      <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:18, fontWeight:700, color: total ? '#fff' : '#222', lineHeight:1.1 }}>
        {aFmtKg(fact)} <span style={{ fontSize:11, color: total ? '#aaa' : '#888', fontWeight:400 }}>кг</span>
      </div>
      <div style={{ display:'flex', alignItems:'baseline', gap:5, marginTop:1 }}>
        <ALabel size={11} color={total ? '#aaa' : '#888'}>план {aFmtKg(plan)} кг ·</ALabel>
        <ALabel size={14} bold color={total ? '#9ee0a8' : pctColor}>{pct}%</ALabel>
      </div>

      {/* мини-бар */}
      <div style={{ height:6, background: total ? '#444' : '#f0ede8', border:`1px solid ${total ? '#555' : '#bbb'}`, borderRadius:2, marginTop:5, overflow:'hidden' }}>
        <div style={{
          width: `${Math.min(100, pct)}%`, height:'100%',
          background: total ? '#9ee0a8' : (c.dot.includes('gradient') ? c.dot : c.dot)
        }}/>
      </div>

      <div style={{ marginTop:6, display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
        <ALabel size={11} color={total ? '#aaa' : '#888'}>₽ факт / план</ALabel>
        <ALabel size={12} bold color={total ? '#fff' : '#222'} style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>
          {aFmtRubM(rub)} / {aFmtRubM(planRub)} <span style={{ color: total ? '#9ee0a8' : pctColor, fontWeight:700 }}>· {pctRub}%</span>
        </ALabel>
      </div>
    </div>
  );
};

const KpiTilesRow = () => {
  const totalFact = KPI_DATA.reduce((s, k) => s + k.fact, 0);
  const totalPlan = KPI_DATA.reduce((s, k) => s + k.plan, 0);
  const totalRub = KPI_DATA.reduce((s, k) => s + k.rub, 0);
  const totalPlanRub = KPI_DATA.reduce((s, k) => s + k.planRub, 0);
  const totalContracts = KPI_DATA.reduce((s, k) => s + k.contracts, 0);
  return (
    <div style={{ display:'flex', gap:10, overflowX:'auto', padding:'2px 2px 6px' }} className="wsm-scroll">
      <KpiTile total raw="Всего" fact={totalFact} plan={totalPlan} rub={totalRub} planRub={totalPlanRub} contracts={totalContracts}/>
      {KPI_DATA.map(k => <KpiTile key={k.raw} {...k} />)}
    </div>
  );
};

/* ─────────── 1. ВЫПОЛНЕНИЕ КОНТРАКТОВ ─────────── */
const CONTRACTS_DATA = [
  { supplier:'ИП Генералов',     raw:'Огурцы',    fact: 148_000, plan: 400_000 },
  { supplier:'КФХ Зорин',        raw:'Огурцы',    fact: 380_000, plan: 400_000 },
  { supplier:'Агро-М',           raw:'Томаты',    fact: 220_000, plan: 300_000 },
  { supplier:'Агро-М',           raw:'Черри',     fact: 156_000, plan: 200_000 },
  { supplier:'ООО «Южгаз»',      raw:'Перец',     fact:  88_000, plan: 200_000 },
  { supplier:'СПК «Восход»',     raw:'Патиссоны', fact:  62_000, plan: 100_000 },
  { supplier:'Огород-Юг',        raw:'Халапеньо', fact:  68_000, plan:  80_000 },
  { supplier:'ИП Самойлов',      raw:'Баклажан',  fact:  44_000, plan: 100_000 },
  { supplier:'КФХ Дубровин',     raw:'Огурцы',    fact: 410_000, plan: 400_000 },
  { supplier:'СПК «Восход»',     raw:'Огурцы',    fact: 280_000, plan: 600_000 },
  { supplier:'ИП Овчаренко',     raw:'Томаты',    fact: 142_000, plan: 250_000 },
  { supplier:'Агро-Дон',         raw:'Перец',     fact:  62_000, plan: 100_000 },
];

const ContractProgressRow = ({ supplier, raw, fact, plan }) => {
  const c = A_RAW[raw] || { bg:'#eee', dot:'#999' };
  const pct = plan > 0 ? Math.round(fact / plan * 100) : 0;
  const pctClamped = Math.min(100, pct);
  const pctColor = pct >= 100 ? '#1a6b3a' : pct >= 75 ? '#1a6b3a' : pct >= 30 ? '#a06000' : '#a23';

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:3, flexWrap:'wrap' }}>
        <div style={{ width:8, height:8, borderRadius:8, background:c.dot.includes('gradient') ? c.dot : c.dot, flexShrink:0 }}/>
        <ALabel size={13} bold color="#222">{supplier}</ALabel>
        <ALabel size={12} color="#888">·</ALabel>
        <ALabel size={12} color="#555">{raw}</ALabel>
        <ALabel size={12} color="#888">·</ALabel>
        <ALabel size={11} color="#222" style={{ fontFamily:'JetBrains Mono, monospace' }}>
          {aFmtKg(fact)} / {aFmtKg(plan)} кг
        </ALabel>
        <div style={{ flex:1 }}/>
        <ALabel size={13} bold color={pctColor}>{pct}%</ALabel>
      </div>
      <div style={{
        height: 18, background:'#fff',
        border: `2px solid ${c.dot.includes('gradient') ? '#333' : c.dot}`,
        borderRadius: 3, position:'relative', overflow:'hidden'
      }}>
        <div style={{
          width: `${pctClamped}%`, height:'100%',
          background: c.dot.includes('gradient') ? c.dot : c.dot,
          opacity: 0.85
        }}/>
        {/* Перевыполнение — штриховка тёмная */}
        {pct > 100 && (
          <div style={{
            position:'absolute', top:0, right:0, bottom:0, width:'12%',
            background:'repeating-linear-gradient(-45deg,#1a6b3a,#1a6b3a 4px,#0f4a26 4px,#0f4a26 8px)'
          }}/>
        )}
        {/* пустая часть — лёгкая штриховка */}
        <div style={{
          position:'absolute', top:0, left:`${pctClamped}%`, right:0, bottom:0,
          background:'repeating-linear-gradient(-45deg, transparent, transparent 4px, #f0ede8 4px, #f0ede8 6px)'
        }}/>
      </div>
    </div>
  );
};

const ContractsExecution = () => {
  const [sort, setSort] = useStateAn('pct');
  const sorted = [...CONTRACTS_DATA].sort((a,b) => {
    if (sort === 'pct') return (b.fact/b.plan) - (a.fact/a.plan);
    return b.fact - a.fact;
  });
  return (
    <APanel
      title="Выполнение контрактов"
      subtitle={`${CONTRACTS_DATA.length} активных позиций`}
      right={
        <div style={{ display:'flex', gap:5 }}>
          <ABtn active={sort==='pct'} onClick={() => setSort('pct')}>по %</ABtn>
          <ABtn active={sort==='vol'} onClick={() => setSort('vol')}>по объёму</ABtn>
          <ABtn>↓ Excel</ABtn>
        </div>
      }
    >
      <div style={{ maxHeight: 380, overflowY:'auto' }} className="wsm-scroll">
        {sorted.map((c, i) => <ContractProgressRow key={i} {...c}/>)}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:6, paddingTop:6, borderTop:'1px dashed #bbb' }}>
        <ALabel size={11} color="#888">контур = план · заливка цветом сырья = факт ·</ALabel>
        <div style={{
          display:'inline-block', width:14, height:10,
          background:'repeating-linear-gradient(-45deg,#1a6b3a,#1a6b3a 3px,#0f4a26 3px,#0f4a26 6px)',
          border:'1px solid #333'
        }}/>
        <ALabel size={11} color="#888">перевыполнение</ALabel>
      </div>
    </APanel>
  );
};

/* ─────────── 2. РАДИАЛЬНЫЕ % ПЛАНА ПО СЫРЬЮ (donut/радиал) ─────────── */
const RadialOne = ({ raw, fact, plan }) => {
  const c = A_RAW[raw] || { bg:'#eee', dot:'#999' };
  const pct = Math.min(100, Math.round(fact / plan * 100));
  const r = 36, C = 2 * Math.PI * r;
  const filled = (pct / 100) * C;
  const stroke = c.dot.includes('gradient') ? '#c03030' : c.dot;
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, width: 110 }}>
      <svg width={92} height={92} viewBox="0 0 92 92" style={{ transform:'rotate(-90deg)' }}>
        <circle cx={46} cy={46} r={r} fill="none" stroke="#e8e5df" strokeWidth={10}/>
        <circle
          cx={46} cy={46} r={r} fill="none"
          stroke={stroke} strokeWidth={10}
          strokeDasharray={`${filled} ${C}`}
          strokeLinecap="butt"
        />
        <text
          x={46} y={50} textAnchor="middle" dominantBaseline="middle"
          fontFamily="JetBrains Mono, monospace" fontSize={18} fontWeight={700}
          fill="#222" transform="rotate(90 46 46)"
        >{pct}%</text>
      </svg>
      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
        <div style={{ width:8, height:8, borderRadius:8, background: c.dot.includes('gradient') ? c.dot : c.dot, flexShrink:0 }}/>
        <ALabel size={13} bold>{raw}</ALabel>
      </div>
      <ALabel size={10} color="#888" style={{ fontFamily:'JetBrains Mono, monospace' }}>
        {aFmtKg(fact)} / {aFmtKg(plan)}
      </ALabel>
    </div>
  );
};

const RadialPlans = () => {
  return (
    <APanel title="% выполнения сезонного плана" subtitle="по видам сырья">
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'space-around' }}>
        {KPI_DATA.map(k => (
          <RadialOne key={k.raw} raw={k.raw} fact={k.fact} plan={k.plan}/>
        ))}
      </div>
    </APanel>
  );
};

/* ─────────── 3. ГРАФИК ПОСТАВОК ПО НЕДЕЛЯМ ─────────── */
/* 18 недель, по каждой недели — стек по сырью */
const WEEKS = ['Н23','Н24','Н25','Н26','Н27','Н28','Н29','Н30','Н31','Н32','Н33','Н34','Н35','Н36','Н37','Н38','Н39','Н40'];
/* Объёмы (кг) по неделям × сырьё — генерим псевдо-сезонный профиль */
const WEEKLY_DATA = WEEKS.map((w, i) => {
  const peak = Math.exp(-Math.pow((i-9)/4.5, 2));
  return {
    week: w,
    'Огурцы':    Math.round(110000 * peak + 8000),
    'Черри':     Math.round( 28000 * peak + 1500),
    'Томаты':    Math.round( 70000 * Math.exp(-Math.pow((i-12)/3.5, 2)) + 2000),
    'Патиссоны': Math.round( 12000 * peak + 500),
    'Халапеньо': Math.round(  6500 * peak + 200),
    'Перец':     Math.round( 22000 * Math.exp(-Math.pow((i-13)/3, 2)) + 600),
    'Баклажан':  Math.round( 11000 * Math.exp(-Math.pow((i-14)/3, 2)) + 200),
  };
});

const WeeklyChart = () => {
  const [mode, setMode] = useStateAn('week'); // week / day
  const RAWS = ['Огурцы','Черри','Томаты','Патиссоны','Халапеньо','Перец','Баклажан'];
  const totals = WEEKLY_DATA.map(d => RAWS.reduce((s, r) => s + d[r], 0));
  const max = Math.max(...totals);
  const H = 220;

  return (
    <APanel
      title="Поставки по неделям"
      subtitle="разрез по сырью"
      right={
        <div style={{ display:'flex', gap:5 }}>
          <ABtn active={mode==='week'} onClick={() => setMode('week')}>по неделям</ABtn>
          <ABtn active={mode==='day'} onClick={() => setMode('day')}>по дням</ABtn>
          <ABtn>↓ Excel</ABtn>
        </div>
      }
    >
      <div style={{ display:'flex', gap:2, height: H, alignItems:'flex-end', padding:'4px 4px 0', borderBottom:'1.5px solid #333', borderLeft:'1.5px solid #333', position:'relative' }}>
        {/* gridlines */}
        {[0.25,0.5,0.75,1].map(g => (
          <div key={g} style={{
            position:'absolute', left:0, right:0, bottom: g*H,
            borderTop:'1px dashed #ddd', pointerEvents:'none'
          }}>
            <span style={{ position:'absolute', left:-44, top:-7, fontFamily:'JetBrains Mono, monospace', fontSize:9, color:'#999' }}>
              {Math.round(max*g/1000)}т
            </span>
          </div>
        ))}
        {WEEKLY_DATA.map((d, i) => {
          const total = totals[i];
          const h = (total / max) * (H - 8);
          let bottom = 0;
          return (
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'flex-end', alignItems:'center', minWidth: 18, position:'relative' }}>
              <div style={{ width:'78%', height: h, display:'flex', flexDirection:'column-reverse', border:'1px solid #333', overflow:'hidden' }}>
                {RAWS.map(r => {
                  const v = d[r];
                  const seg = (v / total) * h;
                  const c = A_RAW[r];
                  return (
                    <div key={r} style={{
                      height: seg,
                      background: c.dot.includes('gradient') ? c.dot : c.dot,
                      opacity: 0.85,
                      borderTop: '1px solid rgba(0,0,0,0.12)'
                    }}/>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display:'flex', gap:2, padding:'3px 4px 0', marginLeft:0 }}>
        {WEEKLY_DATA.map((d, i) => (
          <div key={i} style={{ flex:1, textAlign:'center', minWidth:18 }}>
            <ALabel size={10} color="#888" style={{ fontFamily:'JetBrains Mono, monospace' }}>{d.week}</ALabel>
          </div>
        ))}
      </div>
      {/* legend */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:8, paddingTop:6, borderTop:'1px dashed #bbb' }}>
        {RAWS.map(r => <ARawPill key={r} raw={r} size={11}/>)}
      </div>
    </APanel>
  );
};

/* ─────────── 4. ТОП-ПОСТАВЩИКИ — два рейтинга ─────────── */
const TOP_VOL = [
  { supplier:'КФХ Дубровин',  raw:'Огурцы',  vol: 410_000 },
  { supplier:'КФХ Зорин',     raw:'Огурцы',  vol: 380_000 },
  { supplier:'СПК «Восход»',  raw:'Огурцы',  vol: 280_000 },
  { supplier:'Агро-М',        raw:'Томаты',  vol: 220_000 },
  { supplier:'Агро-М',        raw:'Черри',   vol: 156_000 },
  { supplier:'ИП Генералов',  raw:'Огурцы',  vol: 148_000 },
  { supplier:'ИП Овчаренко',  raw:'Томаты',  vol: 142_000 },
  { supplier:'ООО «Южгаз»',   raw:'Перец',   vol:  88_000 },
];
const TOP_PCT = [
  { supplier:'КФХ Дубровин',  raw:'Огурцы',     pct: 103 },
  { supplier:'КФХ Зорин',     raw:'Огурцы',     pct:  95 },
  { supplier:'Огород-Юг',     raw:'Халапеньо',  pct:  85 },
  { supplier:'Агро-М',        raw:'Черри',      pct:  78 },
  { supplier:'Агро-М',        raw:'Томаты',     pct:  73 },
  { supplier:'СПК «Восход»',  raw:'Патиссоны',  pct:  62 },
  { supplier:'ИП Овчаренко',  raw:'Томаты',     pct:  57 },
  { supplier:'СПК «Восход»',  raw:'Огурцы',     pct:  47 },
];

const TopList = ({ items, kind }) => {
  const max = kind === 'vol' ? items[0].vol : 100;
  return (
    <div>
      {items.map((it, i) => {
        const c = A_RAW[it.raw];
        const val = kind === 'vol' ? it.vol : it.pct;
        const w = (val / max) * 100;
        const stroke = c.dot.includes('gradient') ? '#c03030' : c.dot;
        return (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:6, marginBottom: 5 }}>
            <div style={{ width:18, textAlign:'right' }}>
              <ALabel size={12} color="#888" bold style={{ fontFamily:'JetBrains Mono, monospace' }}>{i+1}</ALabel>
            </div>
            <div style={{ width:130, minWidth:130, overflow:'hidden' }}>
              <ALabel size={12} bold color="#222" style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{it.supplier}</ALabel>
            </div>
            <div style={{ width:80, minWidth:80 }}>
              <ARawPill raw={it.raw} size={10}/>
            </div>
            <div style={{ flex:1, height:14, background:'#f5f3ed', border:'1px solid #333', borderRadius:2, overflow:'hidden' }}>
              <div style={{ width: `${Math.min(100,w)}%`, height:'100%', background: stroke, opacity:0.85 }}/>
            </div>
            <div style={{ width:74, textAlign:'right' }}>
              <ALabel size={12} bold color="#222" style={{ fontFamily:'JetBrains Mono, monospace' }}>
                {kind === 'vol' ? aFmtKg(val) + ' кг' : val + ' %'}
              </ALabel>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TopSuppliers = () => {
  return (
    <APanel title="Топ-поставщики" subtitle="по объёму и по % выполнения">
      <div style={{ display:'flex', gap:14 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <ALabel size={12} color="#888" style={{ textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>📦 По объёму</ALabel>
          <TopList items={TOP_VOL} kind="vol"/>
        </div>
        <div style={{ width:1, background:'#ddd' }}/>
        <div style={{ flex:1, minWidth:0 }}>
          <ALabel size={12} color="#888" style={{ textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>🎯 По % выполнения</ALabel>
          <TopList items={TOP_PCT} kind="pct"/>
        </div>
      </div>
    </APanel>
  );
};

/* ─────────── 5. HEATMAP «поставщик × неделя» ─────────── */
const HEATMAP_SUPPLIERS = [
  'КФХ Дубровин','КФХ Зорин','СПК «Восход»','Агро-М',
  'ИП Генералов','ИП Овчаренко','ООО «Южгаз»','Агро-Дон',
  'Огород-Юг','ИП Самойлов','Агро-Юг','КФХ Степной'
];

/* фейковый объём (кг) — псевдослучайный */
const heatVal = (s, w) => {
  const seed = (s * 9301 + w * 49297) % 233280;
  const x = (seed / 233280);
  // сезонный профиль повторяет общую кривую
  const peak = Math.exp(-Math.pow((w-9)/4.5, 2));
  return Math.round(x * 35000 * peak * (0.4 + (s % 3) * 0.4));
};

const Heatmap = () => {
  const cellW = 30, cellH = 22;
  // максимум для нормировки
  let max = 0;
  HEATMAP_SUPPLIERS.forEach((_, s) => {
    WEEKS.forEach((_, w) => {
      const v = heatVal(s, w);
      if (v > max) max = v;
    });
  });
  return (
    <APanel
      title="Heatmap «поставщик × неделя»"
      subtitle="цвет = объём поставок, кг"
      right={<ABtn>↓ Excel</ABtn>}
    >
      <div style={{ display:'flex', overflowX:'auto' }} className="wsm-scroll">
        {/* labels column */}
        <div style={{ flexShrink:0 }}>
          <div style={{ height: cellH }}/>
          {HEATMAP_SUPPLIERS.map((s, i) => (
            <div key={i} style={{ height: cellH, display:'flex', alignItems:'center', paddingRight:8, borderRight:'1.5px solid #333' }}>
              <ALabel size={12} bold color="#222" style={{ whiteSpace:'nowrap' }}>{s}</ALabel>
            </div>
          ))}
        </div>
        <div>
          <div style={{ display:'flex', height: cellH, borderBottom:'1.5px solid #333' }}>
            {WEEKS.map(w => (
              <div key={w} style={{ width: cellW, textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <ALabel size={10} color="#888" style={{ fontFamily:'JetBrains Mono, monospace' }}>{w}</ALabel>
              </div>
            ))}
            <div style={{ width: 64, textAlign:'right', paddingRight:5, display:'flex', alignItems:'center', justifyContent:'flex-end' }}>
              <ALabel size={10} color="#888" bold>Σ</ALabel>
            </div>
          </div>
          {HEATMAP_SUPPLIERS.map((s, si) => {
            const rowSum = WEEKS.reduce((acc, _, wi) => acc + heatVal(si, wi), 0);
            return (
              <div key={si} style={{ display:'flex', height: cellH, borderBottom:'1px solid #eee' }}>
                {WEEKS.map((w, wi) => {
                  const v = heatVal(si, wi);
                  const intensity = max > 0 ? v / max : 0;
                  // Blend white -> dark green
                  const bg = `rgba(40, 110, 60, ${intensity * 0.85})`;
                  return (
                    <div key={wi} title={`${s} · ${w}: ${aFmtKg(v)} кг`} style={{
                      width: cellW, background: bg,
                      borderRight:'1px solid #fff', borderBottom:'1px solid #fff',
                      display:'flex', alignItems:'center', justifyContent:'center'
                    }}>
                      {v > max * 0.4 && (
                        <ALabel size={9} color={intensity > 0.5 ? '#fff' : '#222'} style={{ fontFamily:'JetBrains Mono, monospace' }}>
                          {Math.round(v/1000)}
                        </ALabel>
                      )}
                    </div>
                  );
                })}
                <div style={{ width:64, textAlign:'right', paddingRight:5, display:'flex', alignItems:'center', justifyContent:'flex-end', background:'#f7f5ef', borderLeft:'1px solid #ccc' }}>
                  <ALabel size={11} bold color="#222" style={{ fontFamily:'JetBrains Mono, monospace' }}>
                    {Math.round(rowSum/1000)}т
                  </ALabel>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* легенда-градиент */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:8, paddingTop:6, borderTop:'1px dashed #bbb' }}>
        <ALabel size={11} color="#888">меньше</ALabel>
        <div style={{ width:160, height:10, background:'linear-gradient(90deg, #fff, rgba(40,110,60,0.85))', border:'1px solid #333' }}/>
        <ALabel size={11} color="#888">больше · числа в тоннах</ALabel>
      </div>
    </APanel>
  );
};

/* ─────────── 6. РЕЙСЫ ПО ТРАНСПОРТНЫМ КОМПАНИЯМ ─────────── */
const TK_DATA = [
  { tk:'ИП Фастов',     direct: 142, reverse: 18, kg: 4_120_000 },
  { tk:'ИП Рябов',      direct:  98, reverse: 12, kg: 2_840_000 },
  { tk:'ТК Авто',       direct: 186, reverse: 24, kg: 5_580_000 },
  { tk:'ИП Кузн.',      direct:  56, reverse:  6, kg: 1_650_000 },
  { tk:'АвтоЛогист',    direct:  74, reverse:  9, kg: 2_180_000 },
  { tk:'Логист-Юг',     direct:  42, reverse:  5, kg: 1_220_000 },
];

const TKCarriers = () => {
  const max = Math.max(...TK_DATA.map(t => t.direct + t.reverse));
  return (
    <APanel
      title="Рейсы по транспортным компаниям"
      subtitle="прямые (с сырьём) + обратные (тара/ингредиенты)"
      right={<ABtn>↓ Excel</ABtn>}
    >
      {TK_DATA.map((t, i) => {
        const total = t.direct + t.reverse;
        const dW = (t.direct / max) * 100;
        const rW = (t.reverse / max) * 100;
        return (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <div style={{ width:110 }}>
              <ALabel size={13} bold color="#222">🚛 {t.tk}</ALabel>
            </div>
            <div style={{ flex:1, height:18, display:'flex', border:'1.5px solid #333', borderRadius:2, background:'#f5f3ed', overflow:'hidden' }}>
              <div style={{ width:`${dW}%`, background:'#3a8a2a', display:'flex', alignItems:'center', paddingLeft:5 }}>
                {dW > 12 && <ALabel size={10} bold color="#fff" style={{ fontFamily:'JetBrains Mono, monospace' }}>{t.direct}</ALabel>}
              </div>
              <div style={{ width:`${rW}%`, background:'repeating-linear-gradient(-45deg,#a06000,#a06000 4px,#7a4a00 4px,#7a4a00 8px)', display:'flex', alignItems:'center', paddingLeft:5 }}>
                {rW > 8 && <ALabel size={10} bold color="#fff" style={{ fontFamily:'JetBrains Mono, monospace' }}>{t.reverse}</ALabel>}
              </div>
            </div>
            <div style={{ width:90, textAlign:'right' }}>
              <ALabel size={12} bold color="#222" style={{ fontFamily:'JetBrains Mono, monospace' }}>
                {total} рейс.
              </ALabel>
            </div>
            <div style={{ width:80, textAlign:'right' }}>
              <ALabel size={11} color="#888" style={{ fontFamily:'JetBrains Mono, monospace' }}>
                {aFmtKg(t.kg/1000)} т
              </ALabel>
            </div>
          </div>
        );
      })}
      <div style={{ display:'flex', gap:14, marginTop:8, paddingTop:6, borderTop:'1px dashed #bbb', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:14, height:10, background:'#3a8a2a', border:'1px solid #333' }}/>
          <ALabel size={11} color="#666">прямой рейс (сырьё)</ALabel>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:14, height:10, background:'repeating-linear-gradient(-45deg,#a06000,#a06000 3px,#7a4a00 3px,#7a4a00 6px)', border:'1px solid #333' }}/>
          <ALabel size={11} color="#666">обратный рейс (тара/ингредиенты)</ALabel>
        </div>
        <div style={{ flex:1 }}/>
        <ALabel size={11} color="#888" style={{ fontStyle:'italic' }}>
          всего: {TK_DATA.reduce((s,t)=>s+t.direct,0)} прямых + {TK_DATA.reduce((s,t)=>s+t.reverse,0)} обратных
        </ALabel>
      </div>
    </APanel>
  );
};

/* ─────────── 7. ТАБЛИЦА «Осталось машин до выполнения плана» ─────────── */
const TRUCKS_DATA = [
  { supplier:'ИП Генералов',  raw:'Огурцы',    plan: 400_000, fact: 148_000, avgAuto: 19_500, avgManual: 20_000 },
  { supplier:'КФХ Дубровин',  raw:'Огурцы',    plan: 400_000, fact: 410_000, avgAuto: 20_200, avgManual: null  },
  { supplier:'КФХ Зорин',     raw:'Огурцы',    plan: 400_000, fact: 380_000, avgAuto: 18_800, avgManual: null  },
  { supplier:'СПК «Восход»',  raw:'Огурцы',    plan: 600_000, fact: 280_000, avgAuto: 17_400, avgManual: 18_000 },
  { supplier:'Агро-М',        raw:'Томаты',    plan: 300_000, fact: 220_000, avgAuto: 16_800, avgManual: null  },
  { supplier:'Агро-М',        raw:'Черри',     plan: 200_000, fact: 156_000, avgAuto:  9_400, avgManual: 10_000 },
  { supplier:'ИП Овчаренко',  raw:'Томаты',    plan: 250_000, fact: 142_000, avgAuto: 15_900, avgManual: null  },
  { supplier:'ООО «Южгаз»',   raw:'Перец',     plan: 200_000, fact:  88_000, avgAuto: 12_200, avgManual: 13_000 },
  { supplier:'СПК «Восход»',  raw:'Патиссоны', plan: 100_000, fact:  62_000, avgAuto:  8_700, avgManual: null  },
  { supplier:'Огород-Юг',     raw:'Халапеньо', plan:  80_000, fact:  68_000, avgAuto:  4_800, avgManual:  5_000 },
  { supplier:'ИП Самойлов',   raw:'Баклажан',  plan: 100_000, fact:  44_000, avgAuto:  7_200, avgManual: null  },
  { supplier:'Агро-Дон',      raw:'Перец',     plan: 100_000, fact:  62_000, avgAuto: 11_600, avgManual: null  },
];

const TrucksLeft = () => {
  return (
    <APanel
      title="Осталось машин до выполнения плана"
      subtitle="поставщик × сырьё"
      right={<ABtn>↓ Excel</ABtn>}
    >
      <div style={{ overflowX:'auto' }} className="wsm-scroll">
        <div style={{ minWidth: 900 }}>
          {/* header */}
          <div style={{ display:'flex', background:'#2a2a2a', color:'#fff', padding:'5px 0', borderRadius:'2px 2px 0 0' }}>
            {[
              {t:'Поставщик', w:170},
              {t:'Сырьё',     w:110},
              {t:'План, кг',  w:90,  align:'right'},
              {t:'Привезено, кг', w:110, align:'right'},
              {t:'Остаток, кг', w:90, align:'right'},
              {t:'Ср.вес рейса (авто)', w:120, align:'right'},
              {t:'Ср.вес (ручной)',     w:100, align:'right'},
              {t:'Машин осталось', w:100, align:'right'},
            ].map((c, i) => (
              <div key={i} style={{ width:c.w, padding:'0 8px', textAlign: c.align || 'left' }}>
                <ALabel size={11} bold color="#fff" style={{ textTransform:'uppercase', letterSpacing:0.5 }}>{c.t}</ALabel>
              </div>
            ))}
          </div>
          {TRUCKS_DATA.map((t, i) => {
            const left = Math.max(0, t.plan - t.fact);
            const avgUsed = t.avgManual || t.avgAuto;
            const trucksLeft = left > 0 ? Math.ceil(left / avgUsed) : 0;
            const done = left === 0;
            const c = A_RAW[t.raw];
            const stripe = (i % 2 === 0);
            return (
              <div key={i} style={{
                display:'flex', alignItems:'center',
                padding:'3px 0', minHeight: 30,
                background: stripe ? '#fafaf6' : '#fff',
                borderBottom:'1px solid #eee'
              }}>
                <div style={{ width:170, padding:'0 8px' }}>
                  <ALabel size={12} bold color="#222">{t.supplier}</ALabel>
                </div>
                <div style={{ width:110, padding:'0 8px' }}>
                  <ARawPill raw={t.raw} size={11}/>
                </div>
                <div style={{ width:90, padding:'0 8px', textAlign:'right' }}>
                  <ALabel size={12} color="#222" style={{ fontFamily:'JetBrains Mono, monospace' }}>{aFmtKg(t.plan)}</ALabel>
                </div>
                <div style={{ width:110, padding:'0 8px', textAlign:'right' }}>
                  <ALabel size={12} bold color="#1a6b3a" style={{ fontFamily:'JetBrains Mono, monospace' }}>{aFmtKg(t.fact)}</ALabel>
                </div>
                <div style={{ width:90, padding:'0 8px', textAlign:'right' }}>
                  {done ? (
                    <APill color="#c8e8c8" textColor="#1a6b3a" size={11}>✓ выполнен</APill>
                  ) : (
                    <ALabel size={12} bold color="#a23" style={{ fontFamily:'JetBrains Mono, monospace' }}>−{aFmtKg(left)}</ALabel>
                  )}
                </div>
                <div style={{ width:120, padding:'0 8px', textAlign:'right' }}>
                  <ALabel size={11} color={t.avgManual ? '#888' : '#222'} style={{ fontFamily:'JetBrains Mono, monospace', textDecoration: t.avgManual ? 'line-through' : 'none' }}>
                    {aFmtKg(t.avgAuto)} <span style={{ fontSize:9 }}>авт</span>
                  </ALabel>
                </div>
                <div style={{ width:100, padding:'0 8px', textAlign:'right' }}>
                  {t.avgManual ? (
                    <div style={{ display:'inline-flex', alignItems:'center', gap:3, padding:'1px 5px', background:'#fffbe8', border:'1px dashed #d4b878', borderRadius:2 }}>
                      <span style={{ fontSize:10 }}>✎</span>
                      <ALabel size={11} bold color="#222" style={{ fontFamily:'JetBrains Mono, monospace' }}>{aFmtKg(t.avgManual)}</ALabel>
                    </div>
                  ) : (
                    <ALabel size={11} color="#bbb">—</ALabel>
                  )}
                </div>
                <div style={{ width:100, padding:'0 8px', textAlign:'right' }}>
                  {done ? (
                    <ALabel size={13} bold color="#1a6b3a">0</ALabel>
                  ) : (
                    <div style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
                      <span style={{ fontSize:14 }}>🚚</span>
                      <ALabel size={15} bold color="#222">{trucksLeft}</ALabel>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ marginTop:8, paddingTop:6, borderTop:'1px dashed #bbb', display:'flex', gap:14, flexWrap:'wrap' }}>
        <ALabel size={11} color="#888" style={{ fontStyle:'italic' }}>
          Машин осталось = ⌈ Остаток / Ср.вес рейса ⌉ · ручной вес перебивает авто
        </ALabel>
      </div>
    </APanel>
  );
};

/* ─────────── 8. ЛЕНТА АЛЕРТОВ ─────────── */
const ALERTS = [
  { kind:'90',   raw:'Огурцы',    title:'КФХ Зорин · Огурцы',    note:'выполнено 95% — близко к закрытию контракта',     date:'14.10' },
  { kind:'over', raw:'Огурцы',    title:'КФХ Дубровин · Огурцы', note:'перевыполнение 103% (410 000 / 400 000 кг)',       date:'12.10' },
  { kind:'gap',  raw:'Перец',     title:'ООО «Южгаз» · Перец',   note:'нет поставок 9 дней при активном контракте',       date:'14.10' },
  { kind:'90',   raw:'Халапеньо', title:'Огород-Юг · Халапеньо', note:'выполнено 85% (68 000 / 80 000 кг)',               date:'13.10' },
  { kind:'gap',  raw:'Баклажан',  title:'ИП Самойлов · Баклажан',note:'нет поставок 8 дней',                              date:'14.10' },
  { kind:'over', raw:'Огурцы',    title:'КФХ Дубровин · Огурцы', note:'2-я машина с перевесом (+22 000 кг к плану)',      date:'10.10' },
];

const AlertIcon = ({ kind }) => {
  if (kind === '90')   return <span style={{ fontSize:18 }}>🎯</span>;
  if (kind === 'over') return <span style={{ fontSize:18 }}>📈</span>;
  return <span style={{ fontSize:18 }}>⚠️</span>;
};
const alertBg = (k) => k === '90' ? '#e0f0d8' : k === 'over' ? '#fff0c8' : '#ffd8d0';
const alertBorder = (k) => k === '90' ? '#5a8a3a' : k === 'over' ? '#a06000' : '#a23';

const AlertsFeed = () => {
  return (
    <APanel
      title="Лента алертов"
      subtitle={`${ALERTS.length} событий`}
      right={
        <div style={{ display:'flex', gap:5 }}>
          <ABtn>все</ABtn>
          <ABtn>🎯 90%</ABtn>
          <ABtn>⚠️ простой</ABtn>
          <ABtn>📈 перевып.</ABtn>
        </div>
      }
    >
      <div style={{ maxHeight: 320, overflowY:'auto', display:'flex', flexDirection:'column', gap:6 }} className="wsm-scroll">
        {ALERTS.map((a, i) => (
          <div key={i} style={{
            display:'flex', alignItems:'center', gap:8,
            padding:'6px 10px',
            background: alertBg(a.kind),
            borderLeft: `4px solid ${alertBorder(a.kind)}`,
            border: '1.5px solid #333', borderRadius: 3
          }}>
            <AlertIcon kind={a.kind}/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <ARawPill raw={a.raw} size={10}/>
                <ALabel size={13} bold color="#222">{a.title}</ALabel>
              </div>
              <ALabel size={11} color="#555" style={{ fontStyle:'italic' }}>{a.note}</ALabel>
            </div>
            <ALabel size={11} color="#888" style={{ fontFamily:'JetBrains Mono, monospace', whiteSpace:'nowrap' }}>{a.date}</ALabel>
            <span style={{ cursor:'pointer', color:'#888', fontSize:12 }}>→</span>
          </div>
        ))}
      </div>
    </APanel>
  );
};

/* ─────────── 9. СРЕЗ-КОНСТРУКТОР ─────────── */
const SLICE_BUILDER_DATA = [
  { supplier:'ИП Генералов', raw:'Огурцы', period:'Июль', kg: 62_000, trips: 3, rub: 3_720_000 },
  { supplier:'ИП Генералов', raw:'Огурцы', period:'Август', kg: 86_000, trips: 4, rub: 5_160_000 },
  { supplier:'КФХ Зорин',    raw:'Огурцы', period:'Июль', kg: 180_000, trips: 9, rub: 10_800_000 },
  { supplier:'КФХ Зорин',    raw:'Огурцы', period:'Август', kg: 200_000, trips: 10, rub: 12_000_000 },
  { supplier:'Агро-М',       raw:'Томаты', period:'Август', kg: 120_000, trips: 7, rub: 6_000_000 },
  { supplier:'Агро-М',       raw:'Томаты', period:'Сент.',  kg: 100_000, trips: 6, rub: 5_000_000 },
  { supplier:'Агро-М',       raw:'Черри',  period:'Август', kg: 88_000,  trips: 9, rub: 7_920_000 },
  { supplier:'Агро-М',       raw:'Черри',  period:'Сент.',  kg: 68_000,  trips: 7, rub: 6_120_000 },
];

const SliceBuilder = () => {
  const [rows, setRows] = useStateAn(['Поставщик','Сырьё']);
  const [cols, setCols] = useStateAn(['Месяц']);
  const [vals, setVals] = useStateAn(['Кг','Рейсы']);
  const [chip, setChip] = useStateAn(null);

  const ChipBox = ({ items, slot }) => (
    <div style={{
      flex:1, minHeight: 36, padding:'4px 6px',
      background:'#fffdf2', border:'1.5px dashed #888', borderRadius:3,
      display:'flex', flexWrap:'wrap', gap:4, alignItems:'flex-start'
    }}>
      {items.map((it, i) => (
        <APill key={i} color="#fff" size={11}>{it} <span style={{ marginLeft:4, color:'#888', cursor:'pointer' }}>×</span></APill>
      ))}
      <div style={{ padding:'1px 6px', border:'1.5px dashed #888', borderRadius:20, fontFamily:'Caveat', fontSize:11, color:'#888', cursor:'pointer' }}>+ добавить</div>
    </div>
  );

  const totalKg = SLICE_BUILDER_DATA.reduce((s,r) => s + r.kg, 0);
  const totalTrips = SLICE_BUILDER_DATA.reduce((s,r) => s + r.trips, 0);

  return (
    <APanel
      title="Срез-конструктор"
      subtitle="поставщик × сырьё × период"
      right={
        <div style={{ display:'flex', gap:5 }}>
          <ABtn>💾 Сохранить</ABtn>
          <ABtn>↓ Excel</ABtn>
        </div>
      }
    >
      {/* dropzones */}
      <div style={{ display:'flex', gap:8, marginBottom:10 }}>
        <div style={{ flex:1 }}>
          <ALabel size={11} color="#888" style={{ textTransform:'uppercase', letterSpacing:1 }}>Строки</ALabel>
          <ChipBox items={rows}/>
        </div>
        <div style={{ flex:1 }}>
          <ALabel size={11} color="#888" style={{ textTransform:'uppercase', letterSpacing:1 }}>Столбцы</ALabel>
          <ChipBox items={cols}/>
        </div>
        <div style={{ flex:1 }}>
          <ALabel size={11} color="#888" style={{ textTransform:'uppercase', letterSpacing:1 }}>Значения</ALabel>
          <ChipBox items={vals}/>
        </div>
        <div style={{ width: 220 }}>
          <ALabel size={11} color="#888" style={{ textTransform:'uppercase', letterSpacing:1 }}>Доступные поля</ALabel>
          <div style={{ minHeight:36, padding:'4px 6px', background:'#f7f5ef', border:'1px solid #ddd', borderRadius:3, display:'flex', flexWrap:'wrap', gap:4 }}>
            {['ТК','Водитель','Тара','Контракт','Неделя','Дата','Тонны','Σ ₽'].map(x => (
              <APill key={x} color="#fff" size={11}>{x} <span style={{ marginLeft:3, color:'#888' }}>+</span></APill>
            ))}
          </div>
        </div>
      </div>

      {/* preview table */}
      <div style={{ border:'2px solid #333', borderRadius:3, overflow:'hidden' }}>
        <div style={{ display:'flex', background:'#2a2a2a', color:'#fff' }}>
          <div style={{ width:170, padding:'4px 8px', borderRight:'1px solid #555' }}>
            <ALabel size={11} bold color="#fff">Поставщик</ALabel>
          </div>
          <div style={{ width:110, padding:'4px 8px', borderRight:'1px solid #555' }}>
            <ALabel size={11} bold color="#fff">Сырьё</ALabel>
          </div>
          <div style={{ width:90, padding:'4px 8px', textAlign:'center', borderRight:'1px solid #555' }}>
            <ALabel size={11} bold color="#fff">Период</ALabel>
          </div>
          <div style={{ width:100, padding:'4px 8px', textAlign:'right', borderRight:'1px solid #555' }}>
            <ALabel size={11} bold color="#fff">Кг</ALabel>
          </div>
          <div style={{ width:80, padding:'4px 8px', textAlign:'right', borderRight:'1px solid #555' }}>
            <ALabel size={11} bold color="#fff">Рейсы</ALabel>
          </div>
          <div style={{ flex:1, padding:'4px 8px', textAlign:'right' }}>
            <ALabel size={11} bold color="#fff">Σ ₽</ALabel>
          </div>
        </div>
        {SLICE_BUILDER_DATA.map((r, i) => (
          <div key={i} style={{ display:'flex', padding:'2px 0', minHeight:24, alignItems:'center', borderBottom:'1px solid #eee', background: i % 2 === 0 ? '#fafaf6' : '#fff' }}>
            <div style={{ width:170, padding:'0 8px' }}>
              <ALabel size={12} bold>{r.supplier}</ALabel>
            </div>
            <div style={{ width:110, padding:'0 8px' }}>
              <ARawPill raw={r.raw} size={10}/>
            </div>
            <div style={{ width:90, padding:'0 8px', textAlign:'center' }}>
              <ALabel size={12}>{r.period}</ALabel>
            </div>
            <div style={{ width:100, padding:'0 8px', textAlign:'right' }}>
              <ALabel size={12} bold style={{ fontFamily:'JetBrains Mono, monospace' }}>{aFmtKg(r.kg)}</ALabel>
            </div>
            <div style={{ width:80, padding:'0 8px', textAlign:'right' }}>
              <ALabel size={12} style={{ fontFamily:'JetBrains Mono, monospace' }}>{r.trips}</ALabel>
            </div>
            <div style={{ flex:1, padding:'0 8px', textAlign:'right' }}>
              <ALabel size={12} style={{ fontFamily:'JetBrains Mono, monospace' }}>{aFmtRub(r.rub)}</ALabel>
            </div>
          </div>
        ))}
        {/* footer total */}
        <div style={{ display:'flex', padding:'4px 0', minHeight:26, alignItems:'center', background:'#f0f0c8', borderTop:'2px dashed #bbb' }}>
          <div style={{ width:170, padding:'0 8px' }}>
            <ALabel size={13} bold>Итого</ALabel>
          </div>
          <div style={{ width:110, padding:'0 8px' }}/>
          <div style={{ width:90, padding:'0 8px' }}/>
          <div style={{ width:100, padding:'0 8px', textAlign:'right' }}>
            <ALabel size={12} bold style={{ fontFamily:'JetBrains Mono, monospace' }}>{aFmtKg(totalKg)}</ALabel>
          </div>
          <div style={{ width:80, padding:'0 8px', textAlign:'right' }}>
            <ALabel size={12} bold style={{ fontFamily:'JetBrains Mono, monospace' }}>{totalTrips}</ALabel>
          </div>
          <div style={{ flex:1, padding:'0 8px', textAlign:'right' }}>
            <ALabel size={12} bold style={{ fontFamily:'JetBrains Mono, monospace' }}>
              {aFmtRub(SLICE_BUILDER_DATA.reduce((s,r)=>s+r.rub,0))}
            </ALabel>
          </div>
        </div>
      </div>
    </APanel>
  );
};

/* ─────────── 10. % БРАКА И НЕСТАНДАРТА ПО ПОСТАВЩИКАМ ─────────── */
/* Сегменты: к оплате (зелёный) / нестандарт (жёлтый) / брак (красный) */
const DEFECTS_DATA = [
  { supplier:'ИП Самойлов',   raw:'Баклажан',  paid: 78, nonstd: 13, defect: 9.0, total: 44_000 },
  { supplier:'ООО «Южгаз»',   raw:'Перец',     paid: 82, nonstd: 11, defect: 7.0, total: 88_000 },
  { supplier:'СПК «Восход»',  raw:'Патиссоны', paid: 85, nonstd: 9,  defect: 6.0, total: 62_000 },
  { supplier:'Агро-Дон',      raw:'Перец',     paid: 86, nonstd: 9,  defect: 5.0, total: 62_000 },
  { supplier:'ИП Овчаренко',  raw:'Томаты',    paid: 88, nonstd: 8,  defect: 4.0, total: 142_000 },
  { supplier:'ИП Генералов',  raw:'Огурцы',    paid: 90, nonstd: 7,  defect: 3.0, total: 148_000 },
  { supplier:'Агро-М',        raw:'Томаты',    paid: 92, nonstd: 6,  defect: 2.0, total: 220_000 },
  { supplier:'КФХ Дубровин',  raw:'Огурцы',    paid: 95, nonstd: 4,  defect: 1.0, total: 410_000 },
];

const DefectsBySuppliers = () => {
  const sorted = [...DEFECTS_DATA].sort((a, b) => b.defect - a.defect);
  return (
    <APanel
      title="% брака и нестандарта по поставщикам"
      subtitle="к оплате · нестандарт · брак"
      right={<ABtn>↓ Excel</ABtn>}
    >
      {sorted.map((d, i) => {
        const paidW = d.paid;
        const nonW  = d.nonstd;
        const defW  = d.defect;
        return (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom: 6 }}>
            <div style={{ width:18, textAlign:'right' }}>
              <ALabel size={12} color="#888" bold style={{ fontFamily:'JetBrains Mono, monospace' }}>{i+1}</ALabel>
            </div>
            <div style={{ width:150, minWidth:150, overflow:'hidden' }}>
              <ALabel size={13} bold color="#222" style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{d.supplier}</ALabel>
            </div>
            <div style={{ width:90, minWidth:90 }}>
              <ARawPill raw={d.raw} size={10}/>
            </div>
            <div style={{ flex:1, height:18, display:'flex', border:'1.5px solid #333', borderRadius:2, background:'#f5f3ed', overflow:'hidden', minWidth: 200 }}>
              <div style={{ width:`${paidW}%`, background:'#3a8a2a', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {paidW > 10 && <ALabel size={10} bold color="#fff" style={{ fontFamily:'JetBrains Mono, monospace' }}>{paidW}%</ALabel>}
              </div>
              <div style={{ width:`${nonW}%`, background:'#e8c44a', display:'flex', alignItems:'center', justifyContent:'center', borderLeft:'1px solid #333', borderRight:'1px solid #333' }}>
                {nonW > 6 && <ALabel size={10} bold color="#5a4400" style={{ fontFamily:'JetBrains Mono, monospace' }}>{nonW}%</ALabel>}
              </div>
              <div style={{ width:`${defW}%`, background:'#c83a3a', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {defW > 4 && <ALabel size={10} bold color="#fff" style={{ fontFamily:'JetBrains Mono, monospace' }}>{defW}%</ALabel>}
              </div>
            </div>
            <div style={{ width:90, textAlign:'right' }}>
              <ALabel size={12} bold color={d.defect >= 5 ? '#c83a3a' : '#222'} style={{ fontFamily:'JetBrains Mono, monospace' }}>
                брак {d.defect.toString().replace('.', ',')}%
              </ALabel>
            </div>
            <div style={{ width:80, textAlign:'right' }}>
              <ALabel size={11} color="#888" style={{ fontFamily:'JetBrains Mono, monospace' }}>
                {aFmtKg(d.total)} кг
              </ALabel>
            </div>
          </div>
        );
      })}
      <div style={{ display:'flex', alignItems:'center', gap:14, marginTop:8, paddingTop:6, borderTop:'1px dashed #bbb', flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:14, height:10, background:'#3a8a2a', border:'1px solid #333' }}/>
          <ALabel size={11} color="#666">к оплате</ALabel>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:14, height:10, background:'#e8c44a', border:'1px solid #333' }}/>
          <ALabel size={11} color="#666">нестандарт</ALabel>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:14, height:10, background:'#c83a3a', border:'1px solid #333' }}/>
          <ALabel size={11} color="#666">брак</ALabel>
        </div>
        <div style={{ flex:1 }}/>
        <ALabel size={11} color="#888" style={{ fontStyle:'italic' }}>
          сортировка: по % брака ↓
        </ALabel>
      </div>
    </APanel>
  );
};

/* ─────────── 11. РАСПРЕДЕЛЕНИЕ ПО КАЛИБРАМ (ОГУРЦЫ) ─────────── */
/* Показывается только если фильтр сырья = «Огурцы» или «Все виды сырья» */
const CALIBER_DATA = [
  { supplier:'КФХ Дубровин',  c69: 28, c912: 56, c12: 16, total: 410_000 },
  { supplier:'КФХ Зорин',     c69: 42, c912: 48, c12: 10, total: 380_000 },
  { supplier:'СПК «Восход»',  c69: 35, c912: 52, c12: 13, total: 280_000 },
  { supplier:'ИП Генералов',  c69: 22, c912: 58, c12: 20, total: 148_000 },
  { supplier:'Агро-Юг',       c69: 48, c912: 44, c12: 8,  total: 96_000  },
  { supplier:'КФХ Степной',   c69: 18, c912: 54, c12: 28, total: 72_000  },
];

const CalibersDistribution = ({ rawFilter = 'Все' }) => {
  /* виджет показывается только при «Все» или «Огурцы» */
  const visible = rawFilter === 'Все' || rawFilter === 'Огурцы';
  const cucum = A_RAW['Огурцы'] || { dot:'#2a8a2a', bg:'#dcecdc' };
  if (!visible) {
    return (
      <APanel title="Распределение по калибрам (огурцы)" subtitle="скрыт фильтром">
        <ALabel size={12} color="#888" style={{ fontStyle:'italic' }}>
          Виджет доступен, когда в общем фильтре аналитики выбрано «Огурцы» или «Все виды сырья».
        </ALabel>
      </APanel>
    );
  }
  return (
    <APanel
      title="Распределение по калибрам"
      subtitle={<span><ARawPill raw="Огурцы" size={11}/> 6–9 см · 9–12 см · 12+ см</span>}
      right={<ABtn>↓ Excel</ABtn>}
    >
      {CALIBER_DATA.map((d, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom: 7 }}>
          <div style={{ width:150, minWidth:150, overflow:'hidden' }}>
            <ALabel size={13} bold color="#222" style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{d.supplier}</ALabel>
          </div>
          <div style={{ flex:1, height:20, display:'flex', border:'1.5px solid #333', borderRadius:2, background:'#f5f3ed', overflow:'hidden', minWidth: 220 }}>
            <div style={{ width:`${d.c69}%`, background:'#a8d8a0', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {d.c69 > 8 && <ALabel size={10} bold color="#1a4a1a" style={{ fontFamily:'JetBrains Mono, monospace' }}>{d.c69}%</ALabel>}
            </div>
            <div style={{ width:`${d.c912}%`, background:cucum.dot, display:'flex', alignItems:'center', justifyContent:'center', borderLeft:'1px solid #333', borderRight:'1px solid #333' }}>
              {d.c912 > 8 && <ALabel size={10} bold color="#fff" style={{ fontFamily:'JetBrains Mono, monospace' }}>{d.c912}%</ALabel>}
            </div>
            <div style={{ width:`${d.c12}%`, background:'#1a5a2a', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {d.c12 > 6 && <ALabel size={10} bold color="#fff" style={{ fontFamily:'JetBrains Mono, monospace' }}>{d.c12}%</ALabel>}
            </div>
          </div>
          <div style={{ width:90, textAlign:'right' }}>
            <ALabel size={11} color="#888" style={{ fontFamily:'JetBrains Mono, monospace' }}>
              {aFmtKg(d.total)} кг
            </ALabel>
          </div>
        </div>
      ))}
      <div style={{ display:'flex', alignItems:'center', gap:14, marginTop:8, paddingTop:6, borderTop:'1px dashed #bbb', flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:14, height:10, background:'#a8d8a0', border:'1px solid #333' }}/>
          <ALabel size={11} color="#666">6–9 см</ALabel>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:14, height:10, background:cucum.dot, border:'1px solid #333' }}/>
          <ALabel size={11} color="#666">9–12 см</ALabel>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:14, height:10, background:'#1a5a2a', border:'1px solid #333' }}/>
          <ALabel size={11} color="#666">12+ см</ALabel>
        </div>
        <div style={{ flex:1 }}/>
        <ALabel size={11} color="#888" style={{ fontStyle:'italic' }}>
          доступен при срезе «Огурцы» или «Все виды сырья»
        </ALabel>
      </div>
    </APanel>
  );
};

/* ─────────── 12. РАСХОЖДЕНИЕ: ОТГРУЖЕНО vs ПРИНЯТО ─────────── */
const DISCREPANCY_DATA = [
  { date:'12.10', supplier:'ИП Самойлов',  raw:'Баклажан',  ship: 6_800, recv: 6_120 },
  { date:'08.10', supplier:'ООО «Южгаз»',  raw:'Перец',     ship: 12_400, recv: 11_280 },
  { date:'11.10', supplier:'СПК «Восход»', raw:'Патиссоны', ship: 8_200, recv: 7_540 },
  { date:'09.10', supplier:'Агро-Дон',     raw:'Перец',     ship: 11_600, recv: 10_750 },
  { date:'13.10', supplier:'ИП Овчаренко', raw:'Томаты',    ship: 15_900, recv: 14_820 },
  { date:'10.10', supplier:'ИП Генералов', raw:'Огурцы',    ship: 19_500, recv: 18_410 },
  { date:'14.10', supplier:'Агро-М',       raw:'Черри',     ship: 9_400, recv: 8_960 },
  { date:'07.10', supplier:'Огород-Юг',    raw:'Халапеньо', ship: 4_800, recv: 4_600 },
  { date:'12.10', supplier:'Агро-М',       raw:'Томаты',    ship: 16_800, recv: 16_140 },
  { date:'11.10', supplier:'КФХ Зорин',    raw:'Огурцы',    ship: 18_800, recv: 18_320 },
];

const DiscrepancyTable = () => {
  /* топ-10 по абсолютному расхождению % */
  const rows = DISCREPANCY_DATA.map(r => {
    const diffKg = r.ship - r.recv;
    const diffPct = (diffKg / r.ship) * 100;
    return { ...r, diffKg, diffPct };
  }).sort((a, b) => Math.abs(b.diffPct) - Math.abs(a.diffPct)).slice(0, 10);

  return (
    <APanel
      title="Расхождение: отгружено vs принято"
      subtitle="топ-10 позиций"
      right={
        <div style={{ display:'flex', gap:5 }}>
          <ABtn>по %</ABtn>
          <ABtn>по кг</ABtn>
          <ABtn>↓ Excel</ABtn>
        </div>
      }
    >
      <div style={{ overflowX:'auto' }} className="wsm-scroll">
        <div style={{ minWidth: 780 }}>
          {/* header */}
          <div style={{ display:'flex', background:'#2a2a2a', color:'#fff', padding:'5px 0', borderRadius:'2px 2px 0 0' }}>
            {[
              {t:'Дата',         w: 60},
              {t:'Поставщик',    w:170},
              {t:'Сырьё',        w:110},
              {t:'Отгружено, кг',w:110, align:'right'},
              {t:'Принято, кг',  w:110, align:'right'},
              {t:'Расх., кг',    w:100, align:'right'},
              {t:'Расх., %',     w:100, align:'right'},
            ].map((c, i) => (
              <div key={i} style={{ width:c.w, padding:'0 8px', textAlign: c.align || 'left' }}>
                <ALabel size={11} bold color="#fff" style={{ textTransform:'uppercase', letterSpacing:0.5 }}>{c.t}</ALabel>
              </div>
            ))}
          </div>
          {rows.map((r, i) => {
            const isBad = Math.abs(r.diffPct) > 5;
            const stripe = (i % 2 === 0);
            const bg = isBad
              ? 'repeating-linear-gradient(-45deg,#fde0d8,#fde0d8 6px,#fcd0c4 6px,#fcd0c4 12px)'
              : (stripe ? '#fafaf6' : '#fff');
            return (
              <div key={i} style={{
                display:'flex', alignItems:'center',
                padding:'3px 0', minHeight: 28,
                background: bg,
                borderBottom: isBad ? '1px solid #c83a3a' : '1px solid #eee'
              }}>
                <div style={{ width:60, padding:'0 8px' }}>
                  <ALabel size={12} color="#222" style={{ fontFamily:'JetBrains Mono, monospace' }}>{r.date}</ALabel>
                </div>
                <div style={{ width:170, padding:'0 8px' }}>
                  <ALabel size={12} bold color="#222">{r.supplier}</ALabel>
                </div>
                <div style={{ width:110, padding:'0 8px' }}>
                  <ARawPill raw={r.raw} size={10}/>
                </div>
                <div style={{ width:110, padding:'0 8px', textAlign:'right' }}>
                  <ALabel size={12} color="#222" style={{ fontFamily:'JetBrains Mono, monospace' }}>{aFmtKg(r.ship)}</ALabel>
                </div>
                <div style={{ width:110, padding:'0 8px', textAlign:'right' }}>
                  <ALabel size={12} color="#222" style={{ fontFamily:'JetBrains Mono, monospace' }}>{aFmtKg(r.recv)}</ALabel>
                </div>
                <div style={{ width:100, padding:'0 8px', textAlign:'right' }}>
                  <ALabel size={12} bold color={isBad ? '#c83a3a' : '#a06000'} style={{ fontFamily:'JetBrains Mono, monospace' }}>
                    −{aFmtKg(r.diffKg)}
                  </ALabel>
                </div>
                <div style={{ width:100, padding:'0 8px', textAlign:'right' }}>
                  {isBad ? (
                    <APill color="#c83a3a" textColor="#fff" size={11}>
                      −{r.diffPct.toFixed(1).replace('.', ',')}%
                    </APill>
                  ) : (
                    <ALabel size={12} bold color="#a06000" style={{ fontFamily:'JetBrains Mono, monospace' }}>
                      −{r.diffPct.toFixed(1).replace('.', ',')}%
                    </ALabel>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:8, paddingTop:6, borderTop:'1px dashed #bbb', flexWrap:'wrap' }}>
        <div style={{
          display:'inline-block', width:18, height:10,
          background:'repeating-linear-gradient(-45deg,#fde0d8,#fde0d8 4px,#fcd0c4 4px,#fcd0c4 8px)',
          border:'1px solid #c83a3a'
        }}/>
        <ALabel size={11} color="#666">подсветка: расхождение &gt; 5%</ALabel>
        <div style={{ flex:1 }}/>
        <ALabel size={11} color="#888" style={{ fontStyle:'italic' }}>
          расхождение = отгружено − принято (вес-нетто)
        </ALabel>
      </div>
    </APanel>
  );
};

/* ─────────── 13. ПЛАН vs ФАКТ ─────────── */
/* Данные по периодам — каждая запись содержит флаг datePassed (плановая дата отгрузки уже прошла) */
const PLAN_FACT_DATA = {
  'Текущая неделя': [
    { supplier:'КФХ Дубровин', raw:'Огурцы',    planAuto: 8, factAuto: 8, planKg: 160_000, factKg: 158_400, datePassed: true  },
    { supplier:'КФХ Зорин',    raw:'Огурцы',    planAuto: 6, factAuto: 6, planKg: 120_000, factKg: 124_000, datePassed: true  },
    { supplier:'ИП Овчаренко', raw:'Томаты',    planAuto: 4, factAuto: 4, planKg:  64_000, factKg:  62_400, datePassed: true  },
    { supplier:'Агро-М',       raw:'Черри',     planAuto: 5, factAuto: 3, planKg:  46_000, factKg:  28_200, datePassed: false },
    { supplier:'ООО «Южгаз»',  raw:'Перец',     planAuto: 4, factAuto: 1, planKg:  48_000, factKg:  17_600, datePassed: true  },
    { supplier:'Огород-Юг',    raw:'Халапеньо', planAuto: 2, factAuto: 3, planKg:  10_000, factKg:  11_700, datePassed: true  },
  ],
  'Прошлая неделя': [
    { supplier:'КФХ Дубровин', raw:'Огурцы',    planAuto:10, factAuto:10, planKg: 200_000, factKg: 204_000, datePassed: true },
    { supplier:'КФХ Зорин',    raw:'Огурцы',    planAuto: 8, factAuto: 8, planKg: 160_000, factKg: 152_800, datePassed: true },
    { supplier:'Агро-М',       raw:'Томаты',    planAuto: 6, factAuto: 6, planKg:  96_000, factKg:  94_500, datePassed: true },
    { supplier:'СПК «Восход»', raw:'Патиссоны', planAuto: 4, factAuto: 2, planKg:  40_000, factKg:  18_400, datePassed: true },
    { supplier:'Агро-Дон',     raw:'Перец',     planAuto: 3, factAuto: 4, planKg:  36_000, factKg:  41_200, datePassed: true },
    { supplier:'ИП Самойлов',  raw:'Баклажан',  planAuto: 3, factAuto: 2, planKg:  21_000, factKg:  19_200, datePassed: false },
  ],
  'Текущий месяц': [
    { supplier:'КФХ Дубровин', raw:'Огурцы',    planAuto:32, factAuto:30, planKg: 640_000, factKg: 614_000, datePassed: false },
    { supplier:'КФХ Зорин',    raw:'Огурцы',    planAuto:24, factAuto:24, planKg: 480_000, factKg: 478_500, datePassed: false },
    { supplier:'Агро-М',       raw:'Томаты',    planAuto:18, factAuto:11, planKg: 288_000, factKg: 178_000, datePassed: false },
    { supplier:'ООО «Южгаз»',  raw:'Перец',     planAuto:14, factAuto: 5, planKg: 168_000, factKg:  62_000, datePassed: true  },
    { supplier:'Огород-Юг',    raw:'Халапеньо', planAuto: 8, factAuto:10, planKg:  40_000, factKg:  43_400, datePassed: false },
    { supplier:'ИП Овчаренко', raw:'Томаты',    planAuto:12, factAuto:12, planKg: 192_000, factKg: 188_000, datePassed: false },
  ],
  'Прошлый месяц': [
    { supplier:'КФХ Дубровин', raw:'Огурцы',    planAuto:42, factAuto:42, planKg: 840_000, factKg: 826_000, datePassed: true },
    { supplier:'КФХ Зорин',    raw:'Огурцы',    planAuto:30, factAuto:31, planKg: 600_000, factKg: 612_000, datePassed: true },
    { supplier:'Агро-М',       raw:'Томаты',    planAuto:24, factAuto:16, planKg: 384_000, factKg: 240_000, datePassed: true },
    { supplier:'СПК «Восход»', raw:'Патиссоны', planAuto:10, factAuto:11, planKg: 100_000, factKg: 108_000, datePassed: true },
    { supplier:'ИП Самойлов',  raw:'Баклажан',  planAuto: 8, factAuto: 4, planKg:  56_000, factKg:  24_000, datePassed: true },
    { supplier:'Агро-Дон',     raw:'Перец',     planAuto:10, factAuto:10, planKg: 120_000, factKg: 118_000, datePassed: true },
  ],
};

/* Резолвер статуса */
const resolveStatus = (pct, datePassed) => {
  if (pct > 105) return 'over';
  if (pct >= 95 && pct <= 105) return 'done';
  if (pct < 90 && datePassed)  return 'failed';
  return 'progress';
};

const STATUS_META = {
  /* — новые статусы виджета «План vs Факт» (задача 8.3б) — */
  done:     { label:'Выполнено',      bg:'#c8e8c8', text:'#1a6b3a', icon:'✓' },
  progress: { label:'В процессе',     bg:'#fff0c8', text:'#a06000', icon:'⏳' },
  failed:   { label:'Срыв',           bg:'#c83a3a', text:'#fff',    icon:'✕' },
  over:     { label:'Перевыполнение', bg:'#ffd9a8', text:'#8a4a00', icon:'↑' },
  /* — исходные статусы главной (восстановлены) — */
  'Запланировано': { label:'Заплан.', bg:'#fff0c8', text:'#a06000', icon:'◷' },
  'Отправлено':    { label:'Отпр.',   bg:'#c8e8c8', text:'#1a6b3a', icon:'✓' },
};

/* Нейтральный fallback — чтобы StatusChip никогда не падал на неизвестном статусе */
const STATUS_FALLBACK = { label:'—', bg:'#eee', text:'#666', icon:'•' };

const StatusChip = ({ status }) => {
  const m = STATUS_META[status] || STATUS_FALLBACK;
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap:4,
      padding:'2px 9px',
      background: m.bg, border:'1.5px solid #333', borderRadius:20,
      fontFamily:'Caveat', fontSize:13, fontWeight:700,
      color: m.text, whiteSpace:'nowrap',
      boxShadow:'1px 1px 0 rgba(0,0,0,0.06)'
    }}>
      <span style={{ fontSize:11 }}>{m.icon}</span>
      <span>{m.label}</span>
    </div>
  );
};

const PlanVsFact = () => {
  const periods = ['Текущая неделя', 'Прошлая неделя', 'Текущий месяц', 'Прошлый месяц'];
  const [period, setPeriod] = useStateAn('Текущая неделя');
  const rows = PLAN_FACT_DATA[period];

  /* итоги */
  const sumPlanAuto = rows.reduce((s, r) => s + r.planAuto, 0);
  const sumFactAuto = rows.reduce((s, r) => s + r.factAuto, 0);
  const sumPlanKg   = rows.reduce((s, r) => s + r.planKg,   0);
  const sumFactKg   = rows.reduce((s, r) => s + r.factKg,   0);
  const pctList     = rows.map(r => (r.factKg / r.planKg) * 100);
  const avgPct      = pctList.reduce((s, x) => s + x, 0) / pctList.length;

  return (
    <APanel
      title="План vs Факт"
      subtitle="по поставщикам — машины и вес"
      right={<ABtn>↓ Excel</ABtn>}
    >
      {/* Переключатель периода */}
      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:10 }}>
        <ALabel size={12} color="#888" style={{ textTransform:'uppercase', letterSpacing:1 }}>Период</ALabel>
        <div style={{ display:'flex', gap:5 }}>
          {periods.map(p => (
            <ABtn key={p} active={period === p} onClick={() => setPeriod(p)}>{p}</ABtn>
          ))}
        </div>
        <div style={{ flex:1 }}/>
        <ALabel size={11} color="#888" style={{ fontStyle:'italic' }}>
          % выполнения считается по килограммам
        </ALabel>
      </div>

      {/* Таблица */}
      <div style={{ overflowX:'auto' }} className="wsm-scroll">
        <div style={{ minWidth: 1020 }}>
          {/* header */}
          <div style={{ display:'flex', background:'#2a2a2a', color:'#fff', padding:'5px 0', borderRadius:'2px 2px 0 0' }}>
            {[
              { t:'Поставщик',          w: 180 },
              { t:'Сырьё',              w: 110 },
              { t:'Ожид. машин',        w:  90, align:'right' },
              { t:'Привезено',          w:  90, align:'right' },
              { t:'Ожидалось, кг',      w: 110, align:'right' },
              { t:'Привезено, кг',      w: 110, align:'right' },
              { t:'% по кг',            w:  90, align:'right' },
              { t:'Статус',             w: 170, align:'left'  },
            ].map((c, i) => (
              <div key={i} style={{ width:c.w, padding:'0 8px', textAlign: c.align || 'left' }}>
                <ALabel size={11} bold color="#fff" style={{ textTransform:'uppercase', letterSpacing:0.5 }}>{c.t}</ALabel>
              </div>
            ))}
          </div>

          {rows.map((r, i) => {
            const pct = (r.factKg / r.planKg) * 100;
            const pctRounded = Math.round(pct);
            const status = resolveStatus(pct, r.datePassed);
            const pctColor =
              status === 'done'     ? '#1a6b3a' :
              status === 'over'     ? '#8a4a00' :
              status === 'failed'   ? '#c83a3a' : '#a06000';

            /* фон строки: «Срыв» — полосатая штриховка (как «Запланировано»);
               иначе чередование */
            const stripe = (i % 2 === 0);
            const bg = status === 'failed'
              ? 'repeating-linear-gradient(-45deg,#fde0d8,#fde0d8 6px,#fcd0c4 6px,#fcd0c4 12px)'
              : (stripe ? '#fafaf6' : '#fff');
            const border = status === 'failed' ? '1px solid #c83a3a' : '1px solid #eee';

            const autoDelta = r.factAuto - r.planAuto;
            const autoColor =
              r.factAuto === r.planAuto ? '#1a6b3a' :
              r.factAuto >  r.planAuto  ? '#8a4a00' : '#a23';

            return (
              <div key={i} style={{
                display:'flex', alignItems:'center',
                padding:'4px 0', minHeight: 32,
                background: bg, borderBottom: border
              }}>
                <div style={{ width:180, padding:'0 8px' }}>
                  <ALabel size={13} bold color="#222">{r.supplier}</ALabel>
                </div>
                <div style={{ width:110, padding:'0 8px' }}>
                  <ARawPill raw={r.raw} size={11}/>
                </div>
                <div style={{ width:90, padding:'0 8px', textAlign:'right' }}>
                  <ALabel size={13} color="#222" style={{ fontFamily:'JetBrains Mono, monospace' }}>{r.planAuto}</ALabel>
                </div>
                <div style={{ width:90, padding:'0 8px', textAlign:'right' }}>
                  <div style={{ display:'inline-flex', alignItems:'baseline', gap:4 }}>
                    <ALabel size={13} bold color={autoColor} style={{ fontFamily:'JetBrains Mono, monospace' }}>{r.factAuto}</ALabel>
                    {autoDelta !== 0 && (
                      <ALabel size={10} color={autoColor} style={{ fontFamily:'JetBrains Mono, monospace' }}>
                        ({autoDelta > 0 ? '+' : ''}{autoDelta})
                      </ALabel>
                    )}
                  </div>
                </div>
                <div style={{ width:110, padding:'0 8px', textAlign:'right' }}>
                  <ALabel size={12} color="#222" style={{ fontFamily:'JetBrains Mono, monospace' }}>{aFmtKg(r.planKg)}</ALabel>
                </div>
                <div style={{ width:110, padding:'0 8px', textAlign:'right' }}>
                  <ALabel size={12} bold color="#222" style={{ fontFamily:'JetBrains Mono, monospace' }}>{aFmtKg(r.factKg)}</ALabel>
                </div>
                <div style={{ width:90, padding:'0 8px', textAlign:'right' }}>
                  <ALabel size={14} bold color={pctColor} style={{ fontFamily:'JetBrains Mono, monospace' }}>
                    {pctRounded}%
                  </ALabel>
                </div>
                <div style={{ width:170, padding:'0 8px' }}>
                  <StatusChip status={status}/>
                </div>
              </div>
            );
          })}

          {/* итог */}
          <div style={{ display:'flex', alignItems:'center', padding:'5px 0', minHeight:30, background:'#f0f0c8', borderTop:'2px dashed #bbb' }}>
            <div style={{ width:180, padding:'0 8px' }}>
              <ALabel size={14} bold color="#222">Итого</ALabel>
            </div>
            <div style={{ width:110, padding:'0 8px' }}>
              <ALabel size={11} color="#888" style={{ fontStyle:'italic' }}>{rows.length} поставщ.</ALabel>
            </div>
            <div style={{ width:90, padding:'0 8px', textAlign:'right' }}>
              <ALabel size={13} bold color="#222" style={{ fontFamily:'JetBrains Mono, monospace' }}>{sumPlanAuto}</ALabel>
            </div>
            <div style={{ width:90, padding:'0 8px', textAlign:'right' }}>
              <ALabel size={13} bold color="#222" style={{ fontFamily:'JetBrains Mono, monospace' }}>{sumFactAuto}</ALabel>
            </div>
            <div style={{ width:110, padding:'0 8px', textAlign:'right' }}>
              <ALabel size={12} bold color="#222" style={{ fontFamily:'JetBrains Mono, monospace' }}>{aFmtKg(sumPlanKg)}</ALabel>
            </div>
            <div style={{ width:110, padding:'0 8px', textAlign:'right' }}>
              <ALabel size={12} bold color="#222" style={{ fontFamily:'JetBrains Mono, monospace' }}>{aFmtKg(sumFactKg)}</ALabel>
            </div>
            <div style={{ width:90, padding:'0 8px', textAlign:'right' }}>
              <div style={{ display:'inline-flex', alignItems:'baseline', gap:3 }}>
                <ALabel size={10} color="#888" style={{ textTransform:'uppercase', letterSpacing:0.5 }}>ср.</ALabel>
                <ALabel size={14} bold color="#222" style={{ fontFamily:'JetBrains Mono, monospace' }}>
                  {Math.round(avgPct)}%
                </ALabel>
              </div>
            </div>
            <div style={{ width:170, padding:'0 8px' }}/>
          </div>
        </div>
      </div>

      {/* легенда */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginTop:10, paddingTop:6, borderTop:'1px dashed #bbb', alignItems:'center' }}>
        <ALabel size={11} color="#888" style={{ textTransform:'uppercase', letterSpacing:0.5 }}>Статусы:</ALabel>
        <StatusChip status="done"/>
        <ALabel size={11} color="#666">95–105%</ALabel>
        <span style={{ color:'#ccc' }}>·</span>
        <StatusChip status="progress"/>
        <ALabel size={11} color="#666">&lt;95%, дата не прошла</ALabel>
        <span style={{ color:'#ccc' }}>·</span>
        <StatusChip status="failed"/>
        <ALabel size={11} color="#666">&lt;90%, дата прошла</ALabel>
        <span style={{ color:'#ccc' }}>·</span>
        <StatusChip status="over"/>
        <ALabel size={11} color="#666">&gt;105%</ALabel>
        <div style={{ flex:1 }}/>
        <div style={{
          display:'inline-block', width:18, height:10,
          background:'repeating-linear-gradient(-45deg,#fde0d8,#fde0d8 4px,#fcd0c4 4px,#fcd0c4 8px)',
          border:'1px solid #c83a3a'
        }}/>
        <ALabel size={11} color="#666">строка «Срыв»</ALabel>
      </div>
    </APanel>
  );
};

/* ─────────── ГЛАВНЫЙ ЭКРАН АНАЛИТИКИ ─────────── */
const Analytics = () => {
  return (
    <div style={{ background:'#f0ede8', padding: 14, fontFamily:'Caveat', minHeight: '100%' }}>
      {/* admin badge */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <APill color="#2a2a2a" textColor="#fff" size={12}>👑 Только Админ</APill>
        <ALabel size={12} color="#888" style={{ fontStyle:'italic' }}>
          раздел «Аналитика» · сезон 2025 · все данные мок
        </ALabel>
      </div>

      {/* 1. Шапка фильтров */}
      <FiltersHeader/>
      <div style={{ height:12 }}/>

      {/* 2. KPI-плитки */}
      <div style={{ marginBottom:10 }}>
        <ALabel size={12} color="#888" style={{ textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>KPI · по сырью</ALabel>
        <KpiTilesRow/>
      </div>

      {/* 3. Контракты + радиал — две колонки */}
      <div style={{ display:'flex', gap:12, marginBottom:12 }}>
        <div style={{ flex: 2, minWidth:0 }}>
          <ContractsExecution/>
        </div>
        <div style={{ flex: 1, minWidth:0 }}>
          <RadialPlans/>
        </div>
      </div>

      {/* 4. График поставок */}
      <div style={{ marginBottom: 12 }}>
        <WeeklyChart/>
      </div>

      {/* 5. Топ-поставщики + Алерты */}
      <div style={{ display:'flex', gap:12, marginBottom:12 }}>
        <div style={{ flex: 2, minWidth:0 }}>
          <TopSuppliers/>
        </div>
        <div style={{ flex: 1, minWidth:0 }}>
          <AlertsFeed/>
        </div>
      </div>

      {/* 6. Heatmap */}
      <div style={{ marginBottom: 12 }}>
        <Heatmap/>
      </div>

      {/* 7. Рейсы по ТК */}
      <div style={{ marginBottom: 12 }}>
        <TKCarriers/>
      </div>

      {/* 8. Машин осталось */}
      <div style={{ marginBottom: 12 }}>
        <TrucksLeft/>
      </div>

      {/* 9. Срез-конструктор */}
      <div style={{ marginBottom: 12 }}>
        <SliceBuilder/>
      </div>

      {/* 10. % брака и нестандарта по поставщикам */}
      <div style={{ marginBottom: 12 }}>
        <DefectsBySuppliers/>
      </div>

      {/* 11. Распределение по калибрам (огурцы) — виден только при срезе «Огурцы» или «Все» */}
      <div style={{ marginBottom: 12 }}>
        <CalibersDistribution rawFilter="Все"/>
      </div>

      {/* 12. Расхождение: отгружено vs принято */}
      <div style={{ marginBottom: 12 }}>
        <DiscrepancyTable/>
      </div>

      {/* 13. План vs Факт */}
      <div style={{ marginBottom: 12 }}>
        <PlanVsFact/>
      </div>
    </div>
  );
};

window.Analytics = Analytics;
