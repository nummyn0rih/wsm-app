/* ─────────── MOBILE LIST: 3 варианта (Android frame) ─────────── */
const { Box: MBox, Label: MLabel, Pill: MPill, RAW_COLORS: MRC } = window;

/* Демо-данные */
const MOBILE_DAYS = [
  { date: '21 апреля', day: 'понедельник', total: 68200, kind: 'today', shipments: [
    { id: 1, raws: [{ raw: 'Огурцы', kg: 18500, supplier: 'Байрамов А.' }], driver: 'Вихров П.', tk: 'ИП Фастов', shipDate: '19 апр', status: 'sent' },
    { id: 2, raws: [{ raw: 'Черри', kg: 10000, supplier: 'Цой К.Т.' }, { raw: 'Томаты', kg: 10000, supplier: 'Ким Т.' }], driver: 'Мартыно В.', tk: 'ИП Рябов', shipDate: '20 апр', status: 'sent', comment: 'Догруз по пути' },
    { id: 3, raws: [{ raw: 'Патиссоны', kg: 8536, supplier: 'Генералов' }, { raw: 'Халапеньо', kg: 12440, supplier: 'Генералов' }], driver: 'Кузнецов А.', tk: 'ТК Авто', shipDate: '20 апр', status: 'sent' },
    { id: 4, raws: [{ raw: 'Халапеньо', kg: 8724, supplier: 'Мищенко' }], driver: 'Ахмедов Р.', tk: 'ТК Авто', shipDate: '21 апр', status: 'planned', comment: 'Ожидаем подтв.' },
  ]},
  { date: '22 апреля', day: 'вторник', total: 39350, kind: 'tomorrow', shipments: [
    { id: 5, raws: [{ raw: 'Томаты', kg: 19350, supplier: 'Ким Т.' }], driver: 'Гриненко К.', tk: 'ИП Кузн.', shipDate: '22 апр', status: 'sent' },
    { id: 6, raws: [{ raw: 'Перец', kg: 20000, supplier: 'Генералов' }], driver: 'Шахматов', tk: 'ТК Авто', shipDate: '21 апр', status: 'planned' },
  ]},
  { date: '23 апреля', day: 'среда', total: 0, kind: 'future', shipments: [] },
];

const fmtKg = (n) => n.toLocaleString('ru-RU');

/* ─────────── СВЕРХУ: Android header + offline pill (общий) ─────────── */
const MobileHeader = ({ theme, online, syncing, queued }) => {
  const isDark = theme === 'dark';
  const bg = theme === 'flat' ? '#fff' : theme === 'color' ? '#1a6b3a' : '#1a1a1a';
  const fg = theme === 'flat' ? '#222' : '#fff';
  const sub = theme === 'flat' ? '#666' : 'rgba(255,255,255,0.7)';
  const border = theme === 'flat' ? '1px solid #e0e0e0' : 'none';

  return (
    <div style={{
      background: bg, color: fg, padding: '10px 14px 8px',
      borderBottom: border,
      boxShadow: theme === 'flat' ? 'none' : '0 1px 0 rgba(0,0,0,0.1)',
      position:'sticky', top: 0, zIndex: 5
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <MLabel size={20} bold color={fg}>Отгрузки</MLabel>
        <div style={{ flex:1 }} />
        {/* Offline / sync indicator */}
        {!online ? (
          <div style={{
            display:'inline-flex', alignItems:'center', gap:5,
            background: theme === 'dark' ? '#3a2a1a' : '#fff5e6',
            border: `1px solid ${theme === 'dark' ? '#a06000' : '#e09a20'}`,
            borderRadius:14, padding:'2px 9px'
          }}>
            <span style={{
              width:7, height:7, borderRadius:7,
              background:'#e09a20'
            }}/>
            <MLabel size={12} bold color={isDark ? '#ffd189' : '#a06000'}>офлайн · {queued}</MLabel>
          </div>
        ) : syncing ? (
          <div style={{
            display:'inline-flex', alignItems:'center', gap:5,
            background: theme === 'dark' ? '#1a3a2a' : '#e8f4ed',
            border: `1px solid ${theme === 'dark' ? '#1a6b3a' : '#7ab098'}`,
            borderRadius:14, padding:'2px 9px'
          }}>
            <span style={{
              width:7, height:7, borderRadius:7,
              background:'#1a6b3a',
              boxShadow:'0 0 0 0 rgba(26,107,58,0.6)',
              animation:'pulse 1.4s infinite'
            }}/>
            <MLabel size={12} bold color={isDark ? '#aed6be' : '#1a6b3a'}>синхр…</MLabel>
          </div>
        ) : (
          <div style={{
            display:'inline-flex', alignItems:'center', gap:5,
            opacity: 0.8
          }}>
            <span style={{
              width:7, height:7, borderRadius:7,
              background: theme === 'flat' ? '#1a6b3a' : '#aed6be'
            }}/>
            <MLabel size={11} color={sub}>в сети</MLabel>
          </div>
        )}
        {/* Menu */}
        <div style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <MLabel size={20} bold color={fg}>⋮</MLabel>
        </div>
      </div>
      {/* subline */}
      <div style={{ display:'flex', alignItems:'baseline', gap:8, marginTop:2 }}>
        <MLabel size={13} color={sub}>17 неделя · 21–26 апр</MLabel>
        <div style={{ flex:1 }} />
        <MLabel size={13} bold color={theme === 'color' ? '#aed6be' : (isDark ? '#aed6be' : '#1a6b3a')}>Σ 281 150 кг</MLabel>
      </div>
    </div>
  );
};

/* ─────────── FAB (общая, тематизированная) ─────────── */
const FAB = ({ theme }) => {
  const bg = theme === 'dark' ? '#2ea35a' : '#1a6b3a';
  const shadow = theme === 'flat'
    ? '0 2px 6px rgba(0,0,0,0.18)'
    : '0 4px 10px rgba(0,0,0,0.35)';
  return (
    <div style={{
      position:'absolute', right:16, bottom:16,
      width:56, height:56, borderRadius:28,
      background: bg, color:'#fff',
      display:'flex', alignItems:'center', justifyContent:'center',
      boxShadow: shadow, cursor:'pointer', zIndex: 6
    }}>
      <span style={{ fontSize:28, fontWeight:300, lineHeight:1, marginTop:-2 }}>＋</span>
    </div>
  );
};

/* ─────────── Day section header (общий, тематизированный) ─────────── */
const DayHeader = ({ d, theme }) => {
  const isDark = theme === 'dark';
  const isColor = theme === 'color';
  let bg, fg, accent;
  if (theme === 'flat') {
    bg = d.kind === 'today' ? '#f5f3ed' : '#fafafa';
    fg = '#222'; accent = '#1a6b3a';
  } else if (isColor) {
    bg = d.kind === 'today' ? '#1a6b3a' : '#e8f4ed';
    fg = d.kind === 'today' ? '#fff' : '#1a6b3a';
    accent = d.kind === 'today' ? '#aed6be' : '#1a6b3a';
  } else {
    bg = d.kind === 'today' ? '#1f3a2a' : '#222';
    fg = '#fff'; accent = '#7ed6a0';
  }
  return (
    <div style={{
      background:bg, color:fg, padding:'8px 14px',
      display:'flex', alignItems:'baseline', gap:8,
      borderBottom: theme === 'flat' ? '1px solid #e0e0e0' : 'none',
      borderTop: theme === 'flat' ? '1px solid #e0e0e0' : 'none'
    }}>
      <MLabel size={16} bold color={fg}>{d.date}</MLabel>
      <MLabel size={12} color={fg} style={{ opacity: 0.7 }}>{d.day}</MLabel>
      <div style={{ flex:1 }} />
      {d.total > 0 ? (
        <MLabel size={14} bold color={accent}>{fmtKg(d.total)} кг</MLabel>
      ) : (
        <MLabel size={12} color={fg} style={{ opacity: 0.5 }}>нет поставок</MLabel>
      )}
    </div>
  );
};

/* ─────────── ВАРИАНТ M1: ПЛОСКИЙ (light, минимум цвета) ─────────── */
const MobileV1 = () => (
  <AndroidDevice width={380} height={760}>
    <div style={{ background:'#f5f3ed', minHeight:'100%', position:'relative', fontFamily:'system-ui, -apple-system, Roboto, sans-serif' }}>
      <MobileHeader theme="flat" online={false} queued={2} />

      {/* Tabs / filter chips */}
      <div style={{ display:'flex', gap:6, padding:'8px 12px', background:'#fff', borderBottom:'1px solid #e0e0e0', overflowX:'auto' }}>
        {['Все','План','Факт','Огурцы','Томаты','Черри'].map((t, i) => (
          <div key={i} style={{
            padding:'4px 10px', border:'1px solid '+(i===0?'#1a6b3a':'#ccc'),
            background: i===0?'#1a6b3a':'#fff',
            color: i===0?'#fff':'#555',
            borderRadius:14, fontSize:12, fontWeight: i===0?600:400,
            whiteSpace:'nowrap'
          }}>{t}</div>
        ))}
      </div>

      {MOBILE_DAYS.map((d, di) => (
        <div key={di}>
          <DayHeader d={d} theme="flat" />
          {d.shipments.map((s, si) => {
            const planned = s.status === 'planned';
            return (
              <div key={si} style={{
                background:'#fff', padding:'10px 14px',
                borderBottom:'1px solid #ececec',
                opacity: planned ? 0.95 : 1,
                position:'relative'
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                  <span style={{
                    fontSize:11, fontWeight:600, padding:'1px 6px', borderRadius:3,
                    background: planned ? '#fff5e6' : '#e8f4ed',
                    color: planned ? '#a06000' : '#1a6b3a',
                    border: '1px solid ' + (planned ? '#e09a20' : '#7ab098')
                  }}>{planned ? '◷ план' : '✓ факт'}</span>
                  <span style={{ fontSize:12, color:'#888' }}>{s.shipDate} →</span>
                  <span style={{ fontSize:12, color:'#222', fontWeight:600 }}>{d.date.split(' ')[0]} апр</span>
                  <div style={{ flex:1 }}/>
                  <span style={{ fontSize:11, color:'#999' }}>›</span>
                </div>
                {/* Items */}
                {s.raws.map((r, ri) => (
                  <div key={ri} style={{ display:'flex', alignItems:'baseline', gap:8, marginTop: ri === 0 ? 2 : 1 }}>
                    <span style={{ fontSize:14, fontWeight:600, color:'#222', flex:1 }}>{r.raw}</span>
                    <span style={{ fontSize:11, color:'#777', flex:1.2, textAlign:'right' }}>{r.supplier}</span>
                    <span style={{ fontSize:14, fontWeight:600, color:'#222', minWidth:70, textAlign:'right' }}>{fmtKg(r.kg)}</span>
                  </div>
                ))}
                {/* Footer line */}
                <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:5, paddingTop:5, borderTop:'1px dashed #e8e6e0' }}>
                  <span style={{ fontSize:11, color:'#888' }}>🚚 {s.driver}</span>
                  <span style={{ fontSize:11, color:'#bbb' }}>·</span>
                  <span style={{ fontSize:11, color:'#aaa' }}>{s.tk}</span>
                  {s.comment && (
                    <>
                      <span style={{ fontSize:11, color:'#bbb' }}>·</span>
                      <span style={{ fontSize:11, color:'#a06000', fontStyle:'italic' }}>💬 {s.comment}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div style={{ height: 80 }} />
      <FAB theme="flat" />
    </div>
  </AndroidDevice>
);

/* ─────────── ВАРИАНТ M2: ЦВЕТНОЙ (метки сырья как в десктопе) ─────────── */
const MobileV2 = () => (
  <AndroidDevice width={380} height={760}>
    <div style={{ background:'#f0eee9', minHeight:'100%', position:'relative', fontFamily:'system-ui, -apple-system, Roboto, sans-serif' }}>
      <MobileHeader theme="color" online={true} syncing={true} />

      <div style={{ display:'flex', gap:6, padding:'8px 12px', background:'#fff', borderBottom:'1px solid #e0e0e0', overflowX:'auto' }}>
        {['Все','План','Факт'].map((t, i) => (
          <div key={i} style={{
            padding:'4px 12px', border:'1px solid '+(i===0?'#1a6b3a':'#ccc'),
            background: i===0?'#1a6b3a':'#fff',
            color: i===0?'#fff':'#555',
            borderRadius:14, fontSize:12, fontWeight: i===0?600:400,
            whiteSpace:'nowrap'
          }}>{t}</div>
        ))}
        <div style={{ flex:1 }}/>
        <div style={{ padding:'4px 10px', border:'1px solid #ccc', borderRadius:14, fontSize:12, color:'#555', whiteSpace:'nowrap' }}>⌕ фильтры</div>
      </div>

      {MOBILE_DAYS.map((d, di) => (
        <div key={di}>
          <DayHeader d={d} theme="color" />
          <div style={{ padding:'8px 10px', display:'flex', flexDirection:'column', gap:8 }}>
            {d.shipments.length === 0 && (
              <div style={{ padding:'14px', background:'#fff', borderRadius:8, textAlign:'center', color:'#bbb', fontSize:13 }}>
                нет поставок
              </div>
            )}
            {d.shipments.map((s, si) => {
              const planned = s.status === 'planned';
              return (
                <div key={si} style={{
                  background:'#fff', borderRadius:10,
                  boxShadow:'0 1px 3px rgba(0,0,0,0.06)',
                  overflow:'hidden',
                  border: planned ? '1px dashed #e09a20' : '1px solid #ececec'
                }}>
                  {/* Color stripe at top showing all raw colors */}
                  <div style={{ display:'flex', height:6 }}>
                    {s.raws.map((r, ri) => (
                      <div key={ri} style={{ flex:r.kg, background: MRC[r.raw]?.dot || '#999' }}/>
                    ))}
                  </div>
                  <div style={{ padding:'10px 12px' }}>
                    {/* Status + date */}
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                      <span style={{
                        fontSize:11, fontWeight:600, padding:'2px 7px', borderRadius:10,
                        background: planned ? '#fff5e6' : '#e8f4ed',
                        color: planned ? '#a06000' : '#1a6b3a',
                      }}>{planned ? '◷ план' : '✓ факт'}</span>
                      <span style={{ fontSize:12, color:'#888' }}>{s.shipDate} → <span style={{ color:'#1a6b3a', fontWeight:600 }}>{d.date.split(' ')[0]} апр</span></span>
                      <div style={{ flex:1 }}/>
                      <span style={{ fontSize:14, fontWeight:700, color:'#1a6b3a' }}>
                        {fmtKg(s.raws.reduce((a,r) => a+r.kg, 0))}
                      </span>
                    </div>
                    {/* Items as colored rows */}
                    {s.raws.map((r, ri) => {
                      const c = MRC[r.raw];
                      return (
                        <div key={ri} style={{
                          display:'flex', alignItems:'center', gap:8,
                          padding:'4px 6px', marginTop: ri ? 2 : 0,
                          background: c?.bg + '88',
                          borderRadius:4
                        }}>
                          <div style={{ width:8, height:8, borderRadius:8, background:c?.dot, flexShrink:0 }}/>
                          <span style={{ fontSize:13, fontWeight:600, color:'#222' }}>{r.raw}</span>
                          <span style={{ fontSize:11, color:'#666', flex:1 }}>· {r.supplier}</span>
                          <span style={{ fontSize:13, fontWeight:600, color:'#222' }}>{fmtKg(r.kg)} кг</span>
                        </div>
                      );
                    })}
                    {/* Footer */}
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:8, paddingTop:6, borderTop:'1px dashed #e8e6e0' }}>
                      <span style={{ fontSize:11, color:'#666' }}>🚚 {s.driver}</span>
                      <span style={{ fontSize:11, color:'#bbb' }}>·</span>
                      <span style={{ fontSize:11, color:'#999' }}>{s.tk}</span>
                      {s.comment && <span style={{ marginLeft:'auto', fontSize:11, color:'#a06000', fontStyle:'italic' }}>💬</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div style={{ height: 80 }} />
      <FAB theme="color" />
    </div>
  </AndroidDevice>
);

/* ─────────── ВАРИАНТ M3: ТЁМНЫЙ (high-contrast) ─────────── */
const MobileV3 = () => (
  <AndroidDevice width={380} height={760} dark>
    <div style={{ background:'#0f0f10', minHeight:'100%', position:'relative', color:'#fff', fontFamily:'system-ui, -apple-system, Roboto, sans-serif' }}>
      <MobileHeader theme="dark" online={true} />

      <div style={{ display:'flex', gap:6, padding:'8px 12px', background:'#1a1a1a', borderBottom:'1px solid #2a2a2a', overflowX:'auto' }}>
        {['Все','План','Факт','Огурцы','Томаты'].map((t, i) => (
          <div key={i} style={{
            padding:'4px 12px',
            border:'1px solid '+(i===0?'#2ea35a':'#333'),
            background: i===0?'#1a3a2a':'transparent',
            color: i===0?'#7ed6a0':'#aaa',
            borderRadius:14, fontSize:12, fontWeight: i===0?600:400,
            whiteSpace:'nowrap'
          }}>{t}</div>
        ))}
      </div>

      {MOBILE_DAYS.map((d, di) => (
        <div key={di}>
          <DayHeader d={d} theme="dark" />
          {d.shipments.map((s, si) => {
            const planned = s.status === 'planned';
            return (
              <div key={si} style={{
                background:'#161617',
                borderBottom:'1px solid #1f1f20',
                padding:'10px 14px',
                position:'relative'
              }}>
                {/* Left accent */}
                <div style={{
                  position:'absolute', left:0, top:0, bottom:0,
                  width:3,
                  background: planned ? '#a06000' : MRC[s.raws[0].raw]?.dot || '#1a6b3a'
                }}/>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
                  <span style={{
                    fontSize:11, fontWeight:700, padding:'1px 7px', borderRadius:3,
                    background: planned ? '#3a2a1a' : '#1a3a2a',
                    color: planned ? '#ffd189' : '#7ed6a0',
                  }}>{planned ? '◷ ПЛАН' : '✓ ФАКТ'}</span>
                  <span style={{ fontSize:12, color:'#888' }}>{s.shipDate} → <span style={{ color:'#7ed6a0', fontWeight:600 }}>{d.date.split(' ')[0]} апр</span></span>
                  <div style={{ flex:1 }}/>
                  <span style={{ fontSize:14, fontWeight:700, color:'#fff' }}>
                    {fmtKg(s.raws.reduce((a,r) => a+r.kg, 0))}
                  </span>
                </div>
                {s.raws.map((r, ri) => {
                  const c = MRC[r.raw];
                  return (
                    <div key={ri} style={{ display:'flex', alignItems:'center', gap:8, marginTop: ri ? 3 : 0 }}>
                      <div style={{ width:10, height:10, borderRadius:10, background:c?.dot, flexShrink:0 }}/>
                      <span style={{ fontSize:14, fontWeight:600, color:'#fff' }}>{r.raw}</span>
                      <span style={{ fontSize:11, color:'#888', flex:1 }}>{r.supplier}</span>
                      <span style={{ fontSize:13, color:'#ddd', minWidth:70, textAlign:'right' }}>{fmtKg(r.kg)} кг</span>
                    </div>
                  );
                })}
                <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6, paddingTop:5, borderTop:'1px solid #2a2a2b' }}>
                  <span style={{ fontSize:11, color:'#888' }}>🚚 {s.driver}</span>
                  <span style={{ fontSize:11, color:'#444' }}>·</span>
                  <span style={{ fontSize:11, color:'#666' }}>{s.tk}</span>
                  {s.comment && <span style={{ marginLeft:'auto', fontSize:11, color:'#ffd189', fontStyle:'italic' }}>💬 {s.comment}</span>}
                </div>
              </div>
            );
          })}
          {d.shipments.length === 0 && (
            <div style={{ padding:'18px', textAlign:'center', color:'#555', fontSize:13, background:'#161617', borderBottom:'1px solid #1f1f20' }}>
              нет поставок
            </div>
          )}
        </div>
      ))}
      <div style={{ height: 80 }} />
      <FAB theme="dark" />
    </div>
  </AndroidDevice>
);

window.MobileV1 = MobileV1;
window.MobileV2 = MobileV2;
window.MobileV3 = MobileV3;
window.MOBILE_DAYS = MOBILE_DAYS;
window.fmtKg = fmtKg;
