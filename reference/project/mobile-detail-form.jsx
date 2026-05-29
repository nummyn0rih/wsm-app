/* ─────────── MOBILE: Детали отгрузки + Форма-аккордеон ─────────── */
const { Box: DBox, Label: DLabel, Pill: DPill, RAW_COLORS: DRC } = window;

/* ============== ДЕТАЛИ ОТГРУЗКИ ============== */
const MobileDetail = () => {
  const ship = {
    shipDate: '20 апр', arrDate: '21 апр',
    driver: 'Мартыно В.', driverPhone: '+7 901 234-56-78',
    tk: 'ИП Рябов', auto: 'Volvo FH · м324рх 23',
    status: 'sent', comment: 'Догруз по пути, Армавир',
    raws: [
      { raw:'Черри', kg:10000, supplier:'Цой К.Т.', tara:null, processed:true, actNum:'А-2024',
        quality:{ hasData:true, hasPdf:true, payable:9500, pct:95, reject:100, nonStd:400 } },
      { raw:'Томаты', kg:10000, supplier:'Ким Т.', tara:null, processed:false, actNum:null },
    ]
  };
  const total = ship.raws.reduce((a,r)=>a+r.kg, 0);

  return (
    <AndroidDevice width={380} height={760}>
      <div style={{ background:'#f5f3ed', minHeight:'100%', fontFamily:'system-ui, -apple-system, Roboto, sans-serif', position:'relative' }}>
        {/* App bar */}
        <div style={{ background:'#1a6b3a', color:'#fff', padding:'10px 8px 10px 4px', display:'flex', alignItems:'center', gap:6, position:'sticky', top:0, zIndex:5 }}>
          <div style={{ width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <span style={{ fontSize:22, color:'#fff' }}>‹</span>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:600 }}>Отгрузка #1247</div>
            <div style={{ fontSize:12, color:'#aed6be' }}>{ship.shipDate} → {ship.arrDate}</div>
          </div>
          <div style={{ padding:'4px 8px', borderRadius:14, background:'#0d4020', fontSize:11, fontWeight:600 }}>✓ ФАКТ</div>
          <div style={{ width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <span style={{ fontSize:20, color:'#fff' }}>⋮</span>
          </div>
        </div>

        {/* Hero summary card */}
        <div style={{ background:'#fff', margin:'12px', borderRadius:10, padding:'14px', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize:11, color:'#888', textTransform:'uppercase', letterSpacing:0.5 }}>Всего в машине</div>
          <div style={{ fontSize:32, fontWeight:700, color:'#1a6b3a', lineHeight:1, marginTop:4 }}>{total.toLocaleString('ru-RU')} <span style={{ fontSize:16, color:'#666' }}>кг</span></div>
          <div style={{ fontSize:13, color:'#666', marginTop:4 }}>{ship.raws.length} позиции · 2 поставщика</div>
          {/* Progress: processed kg */}
          <div style={{ marginTop:10 }}>
            <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:3 }}>
              <span style={{ fontSize:12, color:'#666' }}>Переработано</span>
              <span style={{ fontSize:12, fontWeight:600, color:'#1a6b3a' }}>10 000 / 20 000 кг</span>
            </div>
            <div style={{ height:6, background:'#eef0e8', borderRadius:3, overflow:'hidden' }}>
              <div style={{ width:'50%', height:'100%', background:'#1a6b3a' }}/>
            </div>
          </div>
        </div>

        {/* Section: Машина */}
        <div style={{ padding:'0 12px 6px' }}>
          <div style={{ fontSize:11, color:'#888', textTransform:'uppercase', letterSpacing:0.5, padding:'4px 4px' }}>Машина</div>
          <div style={{ background:'#fff', borderRadius:10, overflow:'hidden' }}>
            {[
              ['🚚 Водитель', ship.driver, ship.driverPhone, true],
              ['📞 Транспортная компания', ship.tk, null, false],
              ['🚛 Авто', ship.auto, null, false],
            ].map(([k,v,sub,callable], i, arr) => (
              <div key={i} style={{
                padding:'10px 12px',
                borderBottom: i < arr.length-1 ? '1px solid #f0eee8' : 'none',
                display:'flex', alignItems:'center', gap:8
              }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, color:'#888' }}>{k}</div>
                  <div style={{ fontSize:14, fontWeight:600, color:'#222' }}>{v}</div>
                  {sub && <div style={{ fontSize:12, color:'#1a6b3a' }}>{sub}</div>}
                </div>
                {callable && (
                  <div style={{ width:34, height:34, borderRadius:17, background:'#e8f4ed', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ color:'#1a6b3a', fontSize:16 }}>📞</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section: Позиции */}
        <div style={{ padding:'10px 12px 6px' }}>
          <div style={{ display:'flex', alignItems:'baseline', padding:'4px 4px' }}>
            <span style={{ fontSize:11, color:'#888', textTransform:'uppercase', letterSpacing:0.5 }}>Позиции ({ship.raws.length})</span>
            <div style={{ flex:1 }}/>
            <span style={{ fontSize:12, color:'#1a6b3a', fontWeight:600 }}>＋ добавить</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {ship.raws.map((r, i) => {
              const c = DRC[r.raw];
              return (
                <div key={i} style={{ background:'#fff', borderRadius:10, overflow:'hidden', border: r.processed ? '1px solid #c8e8c8' : '1px solid #ececec' }}>
                  <div style={{ height:4, background:c?.dot }}/>
                  <div style={{ padding:'12px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                      <div style={{ width:12, height:12, borderRadius:12, background:c?.dot }}/>
                      <span style={{ fontSize:16, fontWeight:700 }}>{r.raw}</span>
                      <div style={{ flex:1 }}/>
                      <span style={{ fontSize:18, fontWeight:700, color:'#222' }}>{r.kg.toLocaleString('ru-RU')}<span style={{ fontSize:13, color:'#666', marginLeft:3 }}>кг</span></span>
                    </div>
                    <div style={{ fontSize:13, color:'#666', marginBottom:8 }}>от {r.supplier}</div>
                    {/* Processing */}
                    <div style={{
                      background: r.processed ? '#e8f4ed' : '#fafaf6',
                      border: r.processed ? '1px solid #c8e8c8' : '1px dashed #ccc',
                      borderRadius:6, padding:'8px 10px',
                      display:'flex', alignItems:'center', gap:8
                    }}>
                      <div style={{
                        width:20, height:20, borderRadius:4,
                        background: r.processed ? '#1a6b3a' : '#fff',
                        border:'1.5px solid '+(r.processed?'#1a6b3a':'#999'),
                        display:'flex', alignItems:'center', justifyContent:'center',
                        flexShrink:0
                      }}>
                        {r.processed && <span style={{ color:'#fff', fontSize:13, fontWeight:700, lineHeight:1 }}>✓</span>}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:11, color: r.processed ? '#1a6b3a' : '#888' }}>
                          {r.processed ? 'Переработано' : 'Не переработано'}
                        </div>
                        {r.processed ? (
                          <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                            <div style={{ fontSize:13, fontWeight:600, color:'#1a6b3a', fontFamily:'monospace' }}>№ акта {r.actNum}</div>
                            {(() => {
                              const q = r.quality || {};
                              const hasData = !!q.hasData, hasPdf = !!q.hasPdf;
                              const state = (hasData && hasPdf) ? 'both' : hasData ? 'data' : hasPdf ? 'pdf' : 'none';
                              const pal = {
                                none:{bg:'#ececec', bd:'#999',   fg:'#666'},
                                data:{bg:'#e4f1e0', bd:'#1a6b3a', fg:'#1a6b3a'},
                                pdf: {bg:'#e0ebf6', bd:'#1a4a8a', fg:'#1a4a8a'},
                                both:{bg:'#e4f1e0', bd:'#1a6b3a', fg:'#1a6b3a'},
                              }[state];
                              const tip = hasData
                                ? `К оплате: ${q.payable.toLocaleString('ru-RU')} кг (${q.pct}%) · Брак: ${q.reject} кг · Нестандарт: ${q.nonStd} кг${hasPdf?' · PDF':''}`
                                : (hasPdf ? 'Прикреплён PDF · данные качества не внесены'
                                          : 'Данные качества не внесены');
                              return (
                                <span title={tip} style={{
                                  display:'inline-flex', alignItems:'center', gap:1,
                                  padding:'2px 6px', background:pal.bg,
                                  border:`1px solid ${pal.bd}`, borderRadius:10,
                                  cursor:'pointer', height:18, lineHeight:1
                                }}>
                                  {(state !== 'pdf') && <span style={{ fontSize:10 }}>📊</span>}
                                  {(state === 'data' || state === 'both') &&
                                    <span style={{ color:pal.fg, fontWeight:700, fontSize:9, fontFamily:'monospace' }}>✓</span>}
                                  {(state === 'pdf' || state === 'both') &&
                                    <span style={{ fontSize:10, marginLeft: state === 'both' ? 1 : 0 }}>📎</span>}
                                </span>
                              );
                            })()}
                          </div>
                        ) : (
                          <div style={{ fontSize:12, color:'#bbb' }}>номер акта будет здесь</div>
                        )}
                      </div>
                      {!r.processed && (
                        <div style={{ padding:'4px 10px', background:'#1a6b3a', color:'#fff', fontSize:12, fontWeight:600, borderRadius:14 }}>отметить</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comment */}
        {ship.comment && (
          <div style={{ padding:'10px 12px 6px' }}>
            <div style={{ fontSize:11, color:'#888', textTransform:'uppercase', letterSpacing:0.5, padding:'4px 4px' }}>Комментарий</div>
            <div style={{ background:'#fff8e8', border:'1px solid #f0d894', borderRadius:8, padding:'10px 12px', display:'flex', gap:8 }}>
              <span style={{ fontSize:14 }}>💬</span>
              <span style={{ fontSize:13, color:'#a06000', fontStyle:'italic', flex:1 }}>{ship.comment}</span>
            </div>
          </div>
        )}

        <div style={{ height:90 }}/>

        {/* Bottom action bar */}
        <div style={{ position:'sticky', bottom:0, background:'#fff', borderTop:'1px solid #e0e0e0', padding:'10px 12px', display:'flex', gap:8 }}>
          <div style={{ flex:1, padding:'12px', background:'#f0eee8', color:'#222', borderRadius:8, textAlign:'center', fontSize:14, fontWeight:600 }}>✎ редактировать</div>
          <div style={{ flex:1, padding:'12px', background:'#1a6b3a', color:'#fff', borderRadius:8, textAlign:'center', fontSize:14, fontWeight:600 }}>✓ переработка</div>
        </div>
      </div>
    </AndroidDevice>
  );
};

/* ============== ФОРМА-АККОРДЕОН ============== */
const AccSection = ({ idx, title, badge, isOpen, isDone, onClick, children }) => (
  <div style={{ background:'#fff', borderRadius:10, overflow:'hidden', boxShadow:'0 1px 2px rgba(0,0,0,0.04)' }}>
    <div onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:10,
      padding:'12px 14px', cursor:'pointer',
      borderBottom: isOpen ? '1px solid #f0eee8' : 'none',
      background: isOpen ? '#f8f6f0' : '#fff'
    }}>
      <div style={{
        width:26, height:26, borderRadius:13,
        background: isDone ? '#1a6b3a' : (isOpen ? '#1a6b3a' : '#e0ddd5'),
        color: isDone || isOpen ? '#fff' : '#888',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:13, fontWeight:700, flexShrink:0
      }}>{isDone ? '✓' : idx}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:15, fontWeight:600, color:'#222' }}>{title}</div>
        {badge && <div style={{ fontSize:12, color: isDone ? '#1a6b3a' : '#888', marginTop:1 }}>{badge}</div>}
      </div>
      <span style={{ fontSize:14, color:'#888', transform: isOpen ? 'rotate(180deg)' : 'none', transition:'transform 0.15s' }}>▾</span>
    </div>
    {isOpen && <div style={{ padding:'12px 14px 14px' }}>{children}</div>}
  </div>
);

const FormField = ({ label, value, placeholder, hint, focused, suffix }) => (
  <div style={{ marginBottom:10 }}>
    <div style={{ fontSize:12, color: focused ? '#1a6b3a' : '#666', fontWeight:600, marginBottom:4 }}>
      {label}{hint && <span style={{ color:'#999', fontWeight:400, marginLeft:4 }}>({hint})</span>}
    </div>
    <div style={{
      border: '1.5px solid '+(focused?'#1a6b3a':'#ccc'),
      borderRadius:8, padding:'10px 12px',
      background:'#fff',
      display:'flex', alignItems:'center', gap:6,
      minHeight: 44
    }}>
      {value ? (
        <span style={{ fontSize:15, color:'#222', fontWeight:500 }}>{value}</span>
      ) : (
        <span style={{ fontSize:14, color:'#bbb' }}>{placeholder}</span>
      )}
      <div style={{ flex:1 }}/>
      {suffix && <span style={{ fontSize:13, color:'#888' }}>{suffix}</span>}
    </div>
  </div>
);

const MobileForm = () => {
  // Static demo: section 1 done, section 2 open
  return (
    <AndroidDevice width={380} height={760}>
      <div style={{ background:'#f0eee8', minHeight:'100%', fontFamily:'system-ui, -apple-system, Roboto, sans-serif', position:'relative' }}>
        {/* App bar */}
        <div style={{ background:'#1a6b3a', color:'#fff', padding:'10px 8px 10px 4px', display:'flex', alignItems:'center', gap:6, position:'sticky', top:0, zIndex:5 }}>
          <div style={{ width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <span style={{ fontSize:22, color:'#fff' }}>✕</span>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:600 }}>Новая отгрузка</div>
            <div style={{ fontSize:12, color:'#aed6be' }}>черновик · 2/3 шага</div>
          </div>
          <div style={{ padding:'4px 10px', borderRadius:14, background:'#0d4020', fontSize:12, fontWeight:600, color:'#fff' }}>сохранено ✓</div>
        </div>

        {/* Progress */}
        <div style={{ padding:'10px 12px', background:'#fff', borderBottom:'1px solid #e0e0e0' }}>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            {[1,2,3].map((n, i) => (
              <React.Fragment key={n}>
                <div style={{
                  width:24, height:24, borderRadius:12,
                  background: i < 1 ? '#1a6b3a' : (i === 1 ? '#1a6b3a' : '#e0ddd5'),
                  color: i <= 1 ? '#fff' : '#888',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:12, fontWeight:700
                }}>{i < 1 ? '✓' : n}</div>
                {i < 2 && <div style={{ flex:1, height:2, background: i < 1 ? '#1a6b3a' : '#e0ddd5' }}/>}
              </React.Fragment>
            ))}
          </div>
          <div style={{ display:'flex', marginTop:6, gap:6 }}>
            <span style={{ flex:1, fontSize:11, color:'#1a6b3a', fontWeight:600 }}>Машина</span>
            <span style={{ flex:1, fontSize:11, color:'#1a6b3a', fontWeight:600, textAlign:'center' }}>Позиции</span>
            <span style={{ flex:1, fontSize:11, color:'#888', textAlign:'right' }}>Подтвердить</span>
          </div>
        </div>

        {/* Accordion sections */}
        <div style={{ padding:'12px', display:'flex', flexDirection:'column', gap:10 }}>
          {/* Section 1 — collapsed, done */}
          <AccSection
            idx={1}
            title="Машина и даты"
            badge="20 апр → 21 апр · Мартыно В. · ИП Рябов"
            isDone={true}
            isOpen={false}
          >
          </AccSection>

          {/* Section 2 — open, current */}
          <AccSection
            idx={2}
            title="Позиции в машине"
            badge="2 позиции · 20 000 кг"
            isOpen={true}
          >
            {/* Item 1 */}
            <div style={{ background:'#f5fbf5', border:'1px solid #c8e8c8', borderRadius:8, padding:10, marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                <div style={{ width:10, height:10, borderRadius:10, background:DRC['Черри']?.dot }}/>
                <span style={{ fontSize:14, fontWeight:700 }}>Позиция 1 · Черри</span>
                <div style={{ flex:1 }}/>
                <span style={{ fontSize:11, color:'#1a6b3a', fontWeight:600 }}>✎</span>
                <span style={{ fontSize:11, color:'#c33', marginLeft:6 }}>✕</span>
              </div>
              <div style={{ fontSize:13, color:'#666' }}>10 000 кг · от Цой К.Т.</div>
            </div>

            {/* Item 2 — being edited */}
            <FormField label="Сырьё *" value="Томаты" suffix="▾" focused />
            <FormField label="Вес, кг *" value="10 000" />
            <FormField label="Поставщик *" value="Ким Т." suffix="▾" />
            <FormField label="Тара" hint="опц." placeholder="бочка / ящик / —" suffix="▾" />

            <div style={{ display:'flex', gap:8, marginTop:6 }}>
              <div style={{ flex:1, padding:'10px', background:'#f0eee8', borderRadius:8, textAlign:'center', fontSize:13, fontWeight:600, color:'#666' }}>Отмена</div>
              <div style={{ flex:2, padding:'10px', background:'#1a6b3a', color:'#fff', borderRadius:8, textAlign:'center', fontSize:13, fontWeight:600 }}>＋ Добавить позицию</div>
            </div>

            {/* Summary chip */}
            <div style={{ marginTop:10, padding:'8px 10px', background:'#eef6ee', borderRadius:6, display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:12, color:'#1a6b3a', fontWeight:600 }}>Σ в машине:</span>
              <span style={{ fontSize:13, fontWeight:700, color:'#1a6b3a' }}>20 000 кг</span>
              <div style={{ flex:1 }}/>
              <span style={{ fontSize:11, color:'#666' }}>2 поз · 2 пост.</span>
            </div>
          </AccSection>

          {/* Section 3 — collapsed, locked */}
          <AccSection
            idx={3}
            title="Подтвердить и сохранить"
            badge="статус, комментарий"
            isOpen={false}
          >
          </AccSection>
        </div>

        <div style={{ height:90 }}/>

        {/* Bottom action bar */}
        <div style={{ position:'sticky', bottom:0, background:'#fff', borderTop:'1px solid #e0e0e0', padding:'10px 12px', display:'flex', gap:8 }}>
          <div style={{ flex:1, padding:'12px', background:'#f0eee8', color:'#222', borderRadius:8, textAlign:'center', fontSize:14, fontWeight:600 }}>‹ Назад</div>
          <div style={{ flex:1.4, padding:'12px', background:'#1a6b3a', color:'#fff', borderRadius:8, textAlign:'center', fontSize:14, fontWeight:600 }}>Дальше ›</div>
        </div>
      </div>
    </AndroidDevice>
  );
};

window.MobileDetail = MobileDetail;
window.MobileForm = MobileForm;
