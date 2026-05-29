/* ─────────── PRINT VIEWS — A4 layouts for «Печатные формы»
   Задача: имитация реальных распечаток. Шрифт sans-serif 10–11pt,
   тонкие серые линейки, чёрный текст на белом, цветные пилюли только
   у видов сырья. Никаких теней, скруглений, фонов вне таблицы.
*/

/* Палитра сырья — те же оттенки, что в основном приложении */
const PRINT_RAW = {
  'Огурцы':    { bg: '#d4eac2', dot: '#4a8f2a' },
  'Черри':     { bg: '#ffd0c0', dot: '#c24a28' },
  'Томаты':    { bg: '#ffe0b8', dot: '#c87020' },
  'Патиссоны': { bg: '#fff4a8', dot: '#c49a00' },
  'Халапеньо': { bg: '#c4dca8', dot: '#1e5020' },
  'Перец':     { bg: '#f0d8c8', dot: 'linear-gradient(135deg,#c03030 0%,#c03030 50%,#3a8a2a 50%,#3a8a2a 100%)' },
  'Баклажан':  { bg: '#d8c0e8', dot: '#6030a0' },
};

const RawPill = ({ name, size = 10 }) => {
  const c = PRINT_RAW[name] || { bg:'#eee', dot:'#999' };
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding:'1px 8px 1px 6px',
      background: c.bg, border:'0.75pt solid #000',
      borderRadius: 10,
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontSize: size,
      color:'#000', whiteSpace:'nowrap',
      lineHeight: 1.3,
    }}>
      <span style={{
        width:7, height:7, borderRadius:7,
        background: c.dot, flexShrink:0, display:'inline-block'
      }} />
      {name}
    </span>
  );
};

/* Шапка листа (общая) */
const PrintHeader = ({ title }) => (
  <div style={{
    borderBottom:'1.5pt solid #000', paddingBottom:10, marginBottom:14,
    display:'flex', alignItems:'flex-start', gap:14,
  }}>
    {/* плейсхолдер логотипа */}
    <div style={{
      width:64, height:64, border:'1pt solid #000',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:'Helvetica, Arial, sans-serif', fontWeight:700,
      fontSize:11, letterSpacing:1, color:'#000', flexShrink:0,
    }}>
      ЛОГО
    </div>

    <div style={{ flex:1, fontFamily:'Helvetica, Arial, sans-serif', color:'#000' }}>
      <div style={{ fontSize:16, fontWeight:700, letterSpacing:0.3, lineHeight:1.1 }}>
        {title}
      </div>
      <div style={{ fontSize:11, marginTop:4 }}>
        Период:&nbsp;<b>01.10.2025 — 07.10.2025</b>
      </div>
      <div style={{ fontSize:10, marginTop:2, color:'#222' }}>
        Применённые фильтры: Сырьё — все · Поставщики — все
      </div>
    </div>

    <div style={{
      fontFamily:'Helvetica, Arial, sans-serif',
      fontSize: 9.5, color:'#333', textAlign:'right',
      lineHeight:1.35, flexShrink:0,
    }}>
      Сформировано:<br/>
      <b style={{ color:'#000' }}>08.10.2025 14:32</b>
    </div>
  </div>
);

const PrintFooter = () => (
  <div style={{
    position:'absolute', left:36, right:36, bottom:18,
    borderTop:'0.5pt solid #888', paddingTop:6,
    fontFamily:'Helvetica, Arial, sans-serif',
    fontSize:9, color:'#555',
    display:'flex', justifyContent:'space-between',
  }}>
    <span>стр. 1 из 1</span>
    <span>сформировано 08.10.2025 14:32</span>
  </div>
);

/* ─────────── ВАРИАНТ 1 · Реестр отгрузок (книжная) ─────────── */
/* A4 portrait at 96dpi ≈ 794×1123 */
const PrintRegistry = () => {
  const data = [
    { date:'01.10.2025, ср', rows: [
      { sup:'Байрамов А.', raw:'Огурцы',    kg: 18500 },
      { sup:'Цой К.Т.',    raw:'Черри',     kg: 10000 },
      { sup:'Ким Т.',      raw:'Томаты',    kg: 10000 },
      { sup:'Генералов',   raw:'Патиссоны', kg:  8536 },
      { sup:'Генералов',   raw:'Халапеньо', kg: 12440 },
      { sup:'Мищенко',     raw:'Халапеньо', kg:  8724 },
    ], subtotal: 68200 },
    { date:'02.10.2025, чт', rows: [
      { sup:'Ким Т.',      raw:'Томаты',    kg: 19350 },
      { sup:'Генералов',   raw:'Перец',     kg: 20000 },
    ], subtotal: 39350 },
    { date:'03.10.2025, пт', rows: [
      { sup:'Байрамов А.', raw:'Огурцы',    kg: 14820 },
      { sup:'Цой К.Т.',    raw:'Черри',     kg: 12300 },
      { sup:'Мищенко',     raw:'Баклажан',  kg:  9650 },
    ], subtotal: 36770 },
    { date:'04.10.2025, сб', rows: [
      { sup:'Ким Т.',      raw:'Томаты',    kg: 16200 },
      { sup:'Генералов',   raw:'Перец',     kg: 11400 },
      { sup:'Цой К.Т.',    raw:'Черри',     kg:  8900 },
    ], subtotal: 36500 },
    { date:'06.10.2025, пн', rows: [
      { sup:'Байрамов А.', raw:'Огурцы',    kg: 17200 },
      { sup:'Генералов',   raw:'Халапеньо', kg: 10250 },
    ], subtotal: 27450 },
    { date:'07.10.2025, вт', rows: [
      { sup:'Ким Т.',      raw:'Томаты',    kg: 21000 },
      { sup:'Мищенко',     raw:'Баклажан',  kg:  7500 },
      { sup:'Цой К.Т.',    raw:'Черри',     kg:  5180 },
    ], subtotal: 33680 },
  ];
  const total = data.reduce((s,d) => s+d.subtotal, 0);
  const fmt = (n) => n.toLocaleString('ru-RU');

  const COLS = [
    { w: 90,  label:'Дата',       align:'left'  },
    { w: 180, label:'Поставщик',  align:'left'  },
    { w: 'auto', label:'Сырьё',   align:'left'  },
    { w: 110, label:'Кол-во, кг', align:'right' },
  ];

  const th = {
    fontFamily:'Helvetica, Arial, sans-serif',
    fontSize: 10, fontWeight:700, color:'#000',
    padding:'5px 6px',
    borderBottom:'1pt solid #000',
    borderTop:'1pt solid #000',
    background:'#fff',
    textAlign:'left',
  };
  const td = {
    fontFamily:'Helvetica, Arial, sans-serif',
    fontSize: 10, color:'#000',
    padding:'4px 6px',
    borderBottom:'0.5pt solid #c8c8c8',
    verticalAlign:'middle',
    background:'#fff',
  };

  return (
    <div style={{
      width: 794, height: 1123, background:'#fff', position:'relative',
      padding:'36px 36px 44px', boxSizing:'border-box',
      color:'#000',
    }}>
      <PrintHeader title="Реестр отгрузок" />

      <table style={{
        width:'100%', borderCollapse:'collapse',
        fontFamily:'Helvetica, Arial, sans-serif',
      }}>
        <colgroup>
          {COLS.map((c,i) => (
            <col key={i} style={{ width: c.w === 'auto' ? undefined : c.w }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {COLS.map((c,i) => (
              <th key={i} style={{ ...th, textAlign: c.align }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((day, di) => {
            const rows = day.rows;
            return (
              <React.Fragment key={di}>
                {rows.map((r, ri) => (
                  <tr key={ri}>
                    <td style={{ ...td, color: ri === 0 ? '#000' : '#888' }}>
                      {ri === 0 ? day.date : '' }
                    </td>
                    <td style={td}>{r.sup}</td>
                    <td style={td}><RawPill name={r.raw} /></td>
                    <td style={{ ...td, textAlign:'right', fontVariantNumeric:'tabular-nums' }}>
                      {fmt(r.kg)}
                    </td>
                  </tr>
                ))}
                {/* подытог по дню */}
                <tr>
                  <td colSpan={3} style={{
                    ...td, fontWeight:700,
                    borderTop:'0.5pt solid #000',
                    borderBottom:'0.5pt solid #000',
                    background:'#f3f3f3',
                  }}>
                    Итого за {day.date.split(',')[0]}
                  </td>
                  <td style={{
                    ...td, fontWeight:700, textAlign:'right',
                    borderTop:'0.5pt solid #000',
                    borderBottom:'0.5pt solid #000',
                    background:'#f3f3f3',
                    fontVariantNumeric:'tabular-nums',
                  }}>
                    {fmt(day.subtotal)}
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
          {/* итог за неделю */}
          <tr>
            <td colSpan={3} style={{
              ...td, fontWeight:700, fontSize:11,
              borderTop:'1.5pt solid #000',
              borderBottom:'1.5pt solid #000',
              background:'#e6e6e6',
            }}>
              ИТОГО ЗА НЕДЕЛЮ
            </td>
            <td style={{
              ...td, fontWeight:700, fontSize:11, textAlign:'right',
              borderTop:'1.5pt solid #000',
              borderBottom:'1.5pt solid #000',
              background:'#e6e6e6',
              fontVariantNumeric:'tabular-nums',
            }}>
              {fmt(total)}
            </td>
          </tr>
        </tbody>
      </table>

      <PrintFooter />
    </div>
  );
};

/* ─────────── ВАРИАНТ 2 · Сводный отчёт (альбомная) ─────────── */
/* A4 landscape ≈ 1123×794 */
const PrintPivot = () => {
  const days = [
    { l:'Пн', d:'01.10' },
    { l:'Вт', d:'02.10' },
    { l:'Ср', d:'03.10' },
    { l:'Чт', d:'04.10' },
    { l:'Пт', d:'05.10' },
    { l:'Сб', d:'06.10' },
    { l:'Вс', d:'07.10' },
  ];
  // matrix [raw][day] in kg, 0 = empty
  const matrix = [
    { raw:'Огурцы',    row:[18500,     0, 14820,     0,     0, 17200,     0] },
    { raw:'Черри',     row:[10000,     0, 12300,  8900,     0,     0,  5180] },
    { raw:'Томаты',    row:[10000, 19350,     0, 16200,     0,     0, 21000] },
    { raw:'Патиссоны', row:[ 8536,     0,     0,     0,     0,     0,     0] },
    { raw:'Халапеньо', row:[21164,     0,     0,     0,     0, 10250,     0] },
    { raw:'Перец',     row:[    0, 20000,     0, 11400,     0,     0,     0] },
    { raw:'Баклажан',  row:[    0,     0,  9650,     0,     0,     0,  7500] },
  ];
  const fmt = (n) => n.toLocaleString('ru-RU');

  const rowTotals = matrix.map(r => r.row.reduce((s,v) => s+v, 0));
  const colTotals = days.map((_, ci) => matrix.reduce((s,r) => s + r.row[ci], 0));
  const grandTotal = rowTotals.reduce((s,v) => s+v, 0);

  // Серая шкала: ячейка тем темнее, чем больше объём
  const maxVal = Math.max(...matrix.flatMap(r => r.row));
  const cellShade = (v) => {
    if (v === 0) return '#fff';
    const t = v / maxVal; // 0..1
    // от очень светлого #f4f4f4 (t≈0) до #b8b8b8 (t≈1)
    const start = 244, end = 184;
    const g = Math.round(start - (start - end) * t);
    return `rgb(${g},${g},${g})`;
  };

  const th = {
    fontFamily:'Helvetica, Arial, sans-serif',
    fontSize:10, fontWeight:700, color:'#000',
    padding:'5px 6px',
    borderTop:'1pt solid #000',
    borderBottom:'1pt solid #000',
    borderLeft:'0.5pt solid #c8c8c8',
    background:'#fff',
    textAlign:'center',
    whiteSpace:'nowrap',
  };
  const tdBase = {
    fontFamily:'Helvetica, Arial, sans-serif',
    fontSize:10, color:'#000',
    padding:'5px 6px',
    borderBottom:'0.5pt solid #c8c8c8',
    borderLeft:'0.5pt solid #c8c8c8',
    fontVariantNumeric:'tabular-nums',
  };

  return (
    <div style={{
      width: 1123, height: 794, background:'#fff', position:'relative',
      padding:'30px 36px 40px', boxSizing:'border-box', color:'#000',
    }}>
      <PrintHeader title="Сводный отчёт по отгрузкам" />

      <table style={{
        width:'100%', borderCollapse:'collapse',
        fontFamily:'Helvetica, Arial, sans-serif',
        tableLayout:'fixed',
      }}>
        <colgroup>
          <col style={{ width: 150 }}/>
          {days.map((_, i) => <col key={i} />)}
          <col style={{ width: 110 }}/>
        </colgroup>
        <thead>
          <tr>
            <th style={{ ...th, textAlign:'left', borderLeft:'none' }}>Сырьё</th>
            {days.map((d, i) => (
              <th key={i} style={th}>
                <div>{d.l}</div>
                <div style={{ fontSize:9, fontWeight:400, color:'#444' }}>{d.d}</div>
              </th>
            ))}
            <th style={{ ...th, background:'#e6e6e6' }}>Итого, кг</th>
          </tr>
        </thead>
        <tbody>
          {matrix.map((r, ri) => (
            <tr key={ri}>
              <td style={{ ...tdBase, borderLeft:'none', padding:'4px 6px' }}>
                <RawPill name={r.raw} size={10} />
              </td>
              {r.row.map((v, ci) => (
                <td key={ci} style={{
                  ...tdBase,
                  background: cellShade(v),
                  textAlign:'right',
                  color: v === 0 ? '#bbb' : '#000',
                }}>
                  {v === 0 ? '—' : fmt(v)}
                </td>
              ))}
              <td style={{
                ...tdBase, fontWeight:700, textAlign:'right',
                background:'#f3f3f3',
              }}>
                {fmt(rowTotals[ri])}
              </td>
            </tr>
          ))}
          {/* итоговая строка по дням */}
          <tr>
            <td style={{
              ...tdBase, fontWeight:700, fontSize:11,
              borderTop:'1.5pt solid #000', borderBottom:'1.5pt solid #000',
              borderLeft:'none',
              background:'#e6e6e6',
            }}>
              ИТОГО, кг
            </td>
            {colTotals.map((v, ci) => (
              <td key={ci} style={{
                ...tdBase, fontWeight:700, textAlign:'right',
                borderTop:'1.5pt solid #000', borderBottom:'1.5pt solid #000',
                background:'#e6e6e6',
              }}>
                {v === 0 ? '—' : fmt(v)}
              </td>
            ))}
            {/* общий итог в правом нижнем углу */}
            <td style={{
              ...tdBase, fontWeight:700, fontSize:12, textAlign:'right',
              borderTop:'1.5pt solid #000', borderBottom:'1.5pt solid #000',
              background:'#d8d8d8',
            }}>
              {fmt(grandTotal)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Легенда заливки */}
      <div style={{
        marginTop:14, display:'flex', alignItems:'center', gap:8,
        fontFamily:'Helvetica, Arial, sans-serif', fontSize:9, color:'#444',
      }}>
        <span>Интенсивность заливки ячейки пропорциональна объёму:</span>
        {[0.05, 0.25, 0.5, 0.75, 1.0].map((t,i) => {
          const start = 244, end = 184;
          const g = Math.round(start - (start - end) * t);
          return (
            <span key={i} style={{
              width:28, height:14, border:'0.5pt solid #999',
              background:`rgb(${g},${g},${g})`, display:'inline-block'
            }}/>
          );
        })}
        <span>малый&nbsp;→&nbsp;большой</span>
      </div>

      <PrintFooter />
    </div>
  );
};

/* Обёртка для design canvas — лист с тенью имитирует "бумагу на столе".
   ВНИМАНИЕ: тень рисуется на ОБЁРТКЕ, не на самом листе. Сам лист — чистый,
   без теней и скруглений, как настоящая распечатка. */
const PaperFrame = ({ width, height, orientation, children }) => (
  <div style={{
    padding: 18, background:'#ece9e3',
    display:'flex', flexDirection:'column', alignItems:'center', gap:6,
  }}>
    <div style={{
      fontFamily:'Caveat, cursive', fontSize:13, color:'#666',
    }}>
      A4 · {orientation === 'landscape' ? 'альбомная' : 'книжная'} · {width}×{height}px
    </div>
    <div style={{
      width, height, background:'#fff',
      boxShadow:'2px 3px 0 rgba(0,0,0,0.08), 0 0 0 1px #c8c4bc',
    }}>
      {children}
    </div>
  </div>
);

const PrintRegistryFramed = () => (
  <PaperFrame width={794} height={1123} orientation="portrait">
    <PrintRegistry />
  </PaperFrame>
);

const PrintPivotFramed = () => (
  <PaperFrame width={1123} height={794} orientation="landscape">
    <PrintPivot />
  </PaperFrame>
);

window.PrintRegistry = PrintRegistry;
window.PrintPivot = PrintPivot;
window.PrintRegistryFramed = PrintRegistryFramed;
window.PrintPivotFramed = PrintPivotFramed;
