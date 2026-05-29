/* ─────────── PIVOT SUMMARY: сырьё × дни недели + итоги ─────────── */
const { Box, Label, Pill, RAW_COLORS } = window;

/* Демо-данные: kg по дню недели для каждого вида сырья
   ВКЛЮЧАЕТ плановые отгрузки наравне с фактическими (задача 8.3а-2 ч.4):
   heatmap единым потоком показывает план + факт, без отдельного переключателя. */
const PIVOT_DATA = {
  weekLabel: '17 неделя · 21–26 апреля',
  days: ['Пн 21', 'Вт 22', 'Ср 23', 'Чт 24', 'Пт 25', 'Сб 26'],
  rows: [
    { raw: 'Огурцы',    cells: [20000, 14000, 22000, 22000, 14000, 0]    },
    { raw: 'Черри',     cells: [8000,  15000, 8000,  18000, 18100, 17000]},
    { raw: 'Томаты',    cells: [10000, 19350, 16000, 0,     14750, 14000]},
    { raw: 'Патиссоны', cells: [5000,  0,     0,     0,     0,     0]    },
    { raw: 'Халапеньо', cells: [9000,  6000,  0,     0,     0,     0]    },
    { raw: 'Перец',     cells: [17000, 20000, 5000,  11200, 0,     0]    },
    { raw: 'Баклажан',  cells: [0,     0,     6800,  8000,  0,     0]    },
  ],
};

const fmt = (n) => n ? n.toLocaleString('ru-RU') : '';
const sum = (arr) => arr.reduce((a, b) => a + b, 0);
const colSum = (rows, i) => sum(rows.map(r => r.cells[i]));
const rowSum = (cells) => sum(cells);
const grandSum = (rows) => sum(rows.map(r => rowSum(r.cells)));

/* ─────────── VARIANT P1: Чистая таблица-pivot ─────────── */
const PivotV1 = () => {
  const { days, rows, weekLabel } = PIVOT_DATA;
  const total = grandSum(rows);
  return (
    <div style={{ padding: 12, fontFamily: 'Caveat' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
        <Box className="sk-gray" style={{ padding: '4px 10px', background:'#1a6b3a', borderColor:'#0d4020' }}>
          <Label size={13} bold color="#fff">▣ Сводка</Label>
        </Box>
        <Box className="sk-gray" style={{ padding: '4px 10px' }}><Label size={13}>☰ Лента</Label></Box>
        <div style={{ flex: 1 }} />
        <Box className="sk-gray" style={{ padding: '4px 10px' }}><Label size={13}>◀ 17 нед ▶</Label></Box>
        <Box className="sk-gray" style={{ padding: '4px 10px' }}><Label size={13}>↓ Excel</Label></Box>
      </div>

      <div style={{ background:'#1a6b3a', padding:'5px 12px', borderRadius:'3px 3px 0 0' }}>
        <Label size={14} bold color="#fff">{weekLabel}</Label>
      </div>

      <div style={{ border:'2px solid #333', borderTop:'none', borderRadius:'0 0 3px 3px', overflow:'hidden', background:'#fff' }}>
        {/* Header */}
        <div style={{ display:'flex', background:'#2a2a2a' }}>
          <div style={{ width:120, padding:'5px 8px', borderRight:'1px solid #555' }}>
            <Label size={12} bold color="#fff">Сырьё \ День</Label>
          </div>
          {days.map((d, i) => (
            <div key={i} style={{ flex:1, padding:'5px 6px', borderRight:'1px solid #555', textAlign:'center' }}>
              <Label size={12} bold color="#fff" center>{d}</Label>
            </div>
          ))}
          <div style={{ width:80, padding:'5px 8px', background:'#0d4020', textAlign:'center' }}>
            <Label size={12} bold color="#fff" center>Итого</Label>
          </div>
        </div>
        {/* Rows */}
        {rows.map((r, i) => {
          const rs = rowSum(r.cells);
          return (
            <div key={i} style={{ display:'flex', borderBottom:'1px solid #e0e0e0', background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
              <div style={{ width:120, padding:'4px 8px', borderRight:'1px solid #ddd', display:'flex', alignItems:'center', gap:5 }}>
                <div style={{ width:8, height:8, borderRadius:8, background:RAW_COLORS[r.raw]?.dot, flexShrink:0 }} />
                <Label size={13} bold>{r.raw}</Label>
              </div>
              {r.cells.map((v, j) => (
                <div key={j} style={{ flex:1, padding:'4px 6px', borderRight:'1px solid #eee', textAlign:'right' }}>
                  <Label size={12} color={v ? '#222' : '#ccc'} style={{ textAlign:'right', display:'block' }}>{v ? fmt(v) : '·'}</Label>
                </div>
              ))}
              <div style={{ width:80, padding:'4px 8px', background:'#eef6ee', textAlign:'right' }}>
                <Label size={13} bold color="#1a6b3a" style={{ textAlign:'right', display:'block' }}>{fmt(rs)}</Label>
              </div>
            </div>
          );
        })}
        {/* Day totals */}
        <div style={{ display:'flex', background:'#f0f0c8', borderTop:'2px dashed #bbb' }}>
          <div style={{ width:120, padding:'5px 8px', borderRight:'1px solid #ddd' }}>
            <Label size={13} bold color="#555">Итого день</Label>
          </div>
          {days.map((_, i) => {
            const cs = colSum(rows, i);
            return (
              <div key={i} style={{ flex:1, padding:'5px 6px', borderRight:'1px solid #ddd', textAlign:'right' }}>
                <Label size={12} bold color="#555" style={{ textAlign:'right', display:'block' }}>{cs ? fmt(cs) : '—'}</Label>
              </div>
            );
          })}
          <div style={{ width:80, padding:'5px 8px', background:'#1a6b3a', textAlign:'right' }}>
            <Label size={13} bold color="#fff" style={{ textAlign:'right', display:'block' }}>{fmt(total)}</Label>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 10, padding: '6px 10px', background: '#fffbe8', border: '1.5px dashed #e09a20', borderRadius: 4 }}>
        <Label size={12} color="#b06000">P1 · «Pivot»: классическая сводка, плотная, экспорт 1-в-1 в Excel</Label>
      </div>
    </div>
  );
};

/* ─────────── VARIANT P2: Heatmap ─────────── */
const PivotV2 = () => {
  const { days, rows, weekLabel } = PIVOT_DATA;
  const allVals = rows.flatMap(r => r.cells).filter(v => v > 0);
  const maxV = Math.max(...allVals);
  const total = grandSum(rows);

  const heatBg = (raw, v) => {
    if (!v) return '#f8f8f5';
    const c = RAW_COLORS[raw];
    if (!c) return '#eee';
    const intensity = 0.25 + 0.75 * (v / maxV);
    // Convert hex to rgba mix
    const hex = c.bg.replace('#','');
    const r = parseInt(hex.slice(0,2),16);
    const g = parseInt(hex.slice(2,4),16);
    const b = parseInt(hex.slice(4,6),16);
    return `rgba(${r},${g},${b},${intensity.toFixed(2)})`;
  };

  return (
    <div style={{ padding: 12, fontFamily: 'Caveat' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
        <Box className="sk-gray" style={{ padding: '4px 10px', background:'#1a6b3a', borderColor:'#0d4020' }}>
          <Label size={13} bold color="#fff">▣ Сводка</Label>
        </Box>
        <Box className="sk-gray" style={{ padding: '4px 10px' }}><Label size={13}>☰ Лента</Label></Box>
        <div style={{ flex: 1 }} />
        <Box className="sk-gray" style={{ padding: '4px 10px' }}><Label size={13}>◀ 17 нед ▶</Label></Box>
      </div>

      <div style={{ background:'#1a6b3a', padding:'5px 12px', display:'flex', alignItems:'center', gap:10, borderRadius:'3px 3px 0 0' }}>
        <Label size={14} bold color="#fff">{weekLabel}</Label>
        <div style={{ flex:1 }}/>
        <Pill color="#0d4020" textColor="#fff" size={12}>Σ {fmt(total)} кг</Pill>
      </div>

      <div style={{ border:'2px solid #333', borderTop:'none', borderRadius:'0 0 3px 3px', overflow:'hidden', background:'#fff' }}>
        <div style={{ display:'flex', background:'#2a2a2a' }}>
          <div style={{ width:120, padding:'5px 8px', borderRight:'1px solid #555' }}>
            <Label size={12} bold color="#fff">Сырьё</Label>
          </div>
          {days.map((d, i) => (
            <div key={i} style={{ flex:1, padding:'5px 6px', borderRight:'1px solid #555', textAlign:'center' }}>
              <Label size={12} bold color="#fff" center>{d}</Label>
            </div>
          ))}
          <div style={{ width:90, padding:'5px 8px', background:'#0d4020', textAlign:'center' }}>
            <Label size={12} bold color="#fff" center>Итого</Label>
          </div>
        </div>

        {rows.map((r, i) => {
          const rs = rowSum(r.cells);
          const c = RAW_COLORS[r.raw];
          return (
            <div key={i} style={{ display:'flex', borderBottom:'1px solid #e0e0e0' }}>
              <div style={{ width:120, padding:'4px 8px', borderRight:'1px solid #ddd', display:'flex', alignItems:'center', gap:6, background:'#fff' }}>
                <div style={{ width:10, height:10, borderRadius:10, background:c?.dot, flexShrink:0 }} />
                <Label size={13} bold>{r.raw}</Label>
              </div>
              {r.cells.map((v, j) => (
                <div key={j} style={{
                  flex:1, padding:'6px 6px', borderRight:'1px solid #fff',
                  background: heatBg(r.raw, v),
                  textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center'
                }}>
                  <Label size={13} bold={!!v && v > maxV * 0.5} color={v ? '#222' : '#ccc'}>{v ? fmt(v) : '·'}</Label>
                </div>
              ))}
              <div style={{ width:90, padding:'4px 8px', background:'#eef6ee', textAlign:'right' }}>
                <Label size={13} bold color="#1a6b3a" style={{ textAlign:'right', display:'block' }}>{fmt(rs)}</Label>
              </div>
            </div>
          );
        })}

        <div style={{ display:'flex', background:'#1a6b3a' }}>
          <div style={{ width:120, padding:'5px 8px', borderRight:'1px solid #0d4020' }}>
            <Label size={13} bold color="#fff">Σ день</Label>
          </div>
          {days.map((_, i) => {
            const cs = colSum(rows, i);
            return (
              <div key={i} style={{ flex:1, padding:'5px 6px', borderRight:'1px solid #0d4020', textAlign:'center' }}>
                <Label size={13} bold color="#fff" center>{cs ? fmt(cs) : '—'}</Label>
              </div>
            );
          })}
          <div style={{ width:90, padding:'5px 8px', background:'#0d4020', textAlign:'center' }}>
            <Label size={14} bold color="#fff" center>{fmt(total)}</Label>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 10, padding: '6px 10px', background: '#fffbe8', border: '1.5px dashed #e09a20', borderRadius: 4 }}>
        <Label size={12} color="#b06000">P2 · «Heatmap»: насыщенность ячейки = объём, цвет фона = вид сырья. Видно «горячие» дни взглядом · <b>плановые отгрузки включены наравне с фактическими</b> — единый поток (без переключателя «План/Факт»)</Label>
      </div>
    </div>
  );
};

/* ─────────── VARIANT P3: Stacked bars + table ─────────── */
const PivotV3 = () => {
  const { days, rows, weekLabel } = PIVOT_DATA;
  const dayTotals = days.map((_, i) => colSum(rows, i));
  const maxDay = Math.max(...dayTotals);
  const total = grandSum(rows);

  return (
    <div style={{ padding: 12, fontFamily: 'Caveat' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
        <Box className="sk-gray" style={{ padding: '4px 10px', background:'#1a6b3a', borderColor:'#0d4020' }}>
          <Label size={13} bold color="#fff">▣ Сводка</Label>
        </Box>
        <Box className="sk-gray" style={{ padding: '4px 10px' }}><Label size={13}>☰ Лента</Label></Box>
        <div style={{ flex: 1 }} />
        <Box className="sk-gray" style={{ padding: '4px 10px' }}><Label size={13}>◀ 17 нед ▶</Label></Box>
      </div>

      <div style={{ background:'#1a6b3a', padding:'5px 12px', display:'flex', alignItems:'center', gap:10, borderRadius:'3px 3px 0 0' }}>
        <Label size={14} bold color="#fff">{weekLabel}</Label>
        <div style={{ flex:1 }}/>
        <Pill color="#0d4020" textColor="#fff" size={12}>Σ {fmt(total)} кг</Pill>
      </div>

      {/* Stacked bars chart */}
      <div style={{ border:'2px solid #333', borderTop:'none', background:'#fafaf6', padding:'10px 12px 6px' }}>
        <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:140 }}>
          {days.map((d, di) => {
            const dt = dayTotals[di];
            const barH = dt > 0 ? Math.max(8, (dt / maxDay) * 130) : 0;
            return (
              <div key={di} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                <Label size={11} bold color="#1a6b3a">{dt ? fmt(dt) : ''}</Label>
                <div style={{
                  width:'100%', height:barH, display:'flex', flexDirection:'column-reverse',
                  border: dt > 0 ? '1.5px solid #333' : 'none', borderRadius:2, overflow:'hidden',
                  background: dt > 0 ? '#fff' : 'transparent'
                }}>
                  {rows.map((r, ri) => {
                    const v = r.cells[di];
                    if (!v) return null;
                    const segH = (v / dt) * 100;
                    const c = RAW_COLORS[r.raw];
                    return (
                      <div key={ri} title={`${r.raw}: ${fmt(v)} кг`} style={{
                        height:`${segH}%`, background:c?.bg, borderTop:'1px solid #fff'
                      }} />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        {/* Day labels */}
        <div style={{ display:'flex', gap:8, marginTop:4, borderTop:'1px solid #333', paddingTop:4 }}>
          {days.map((d, i) => (
            <div key={i} style={{ flex:1, textAlign:'center' }}>
              <Label size={12} bold color="#555" center>{d}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Mini totals table */}
      <div style={{ border:'2px solid #333', borderTop:'none', borderRadius:'0 0 3px 3px', background:'#fff' }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, padding:'8px 10px', background:'#f5f3ed', borderBottom:'1px solid #ccc' }}>
          <Label size={13} bold color="#555">Итого по сырью:</Label>
          {rows.map((r, i) => {
            const rs = rowSum(r.cells);
            if (!rs) return null;
            const c = RAW_COLORS[r.raw];
            return (
              <Pill key={i} color={c?.bg} size={12}>
                <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
                  <span style={{ width:7, height:7, borderRadius:7, background:c?.dot, display:'inline-block' }}/>
                  {r.raw} · <b>{fmt(rs)}</b>
                </span>
              </Pill>
            );
          })}
        </div>
        <div style={{ padding:'6px 10px', display:'flex', gap:8, alignItems:'center' }}>
          <Label size={13} bold color="#555">Загрузка дней:</Label>
          {dayTotals.map((dt, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:3, flex:1 }}>
              <Label size={11} color="#555">{days[i].split(' ')[0]}</Label>
              <div style={{ flex:1, height:6, background:'#eee', borderRadius:3, overflow:'hidden' }}>
                <div style={{ width:`${(dt/maxDay)*100}%`, height:'100%', background: dt > 0 ? '#1a6b3a' : 'transparent' }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 10, padding: '6px 10px', background: '#fffbe8', border: '1.5px dashed #e09a20', borderRadius: 4 }}>
        <Label size={12} color="#b06000">P3 · «Stacked»: столбики дней с долями сырья + строка-итоги. Хорошо для совещаний / руководителю</Label>
      </div>
    </div>
  );
};

window.PivotV1 = PivotV1;
window.PivotV2 = PivotV2;
window.PivotV3 = PivotV3;
