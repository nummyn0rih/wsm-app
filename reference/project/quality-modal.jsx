/* ============================================================
   3.7  МОДАЛКА «Качество приёмки»
        вызывается по 📊 рядом с № акта в карточке позиции
        отгрузки. Тут — только сама модалка, два варианта рядом
        на демо-экране.
   ============================================================ */

const BoxQ   = window.Box;
const LabelQ = window.Label;
const PillQ  = window.Pill;
const RAWQ   = window.RAW_COLORS;

/* ───── атом: поле ввода с единицей и авто-% ───── */

const NumField = ({ label, value, unit = 'кг', pct, w, hint, readOnly, mono = true, highlight }) => (
  <div style={{ flex: w ? `0 0 ${w}px` : 1, minWidth: 0 }}>
    <div style={{ display:'flex', alignItems:'baseline', gap:5, marginBottom:2 }}>
      <LabelQ size={11} bold color="#555" style={{ textTransform:'uppercase', letterSpacing:0.4 }}>{label}</LabelQ>
      {hint && <LabelQ size={10} color="#999" style={{ fontStyle:'italic' }}>{hint}</LabelQ>}
    </div>
    <div style={{
      display:'flex', alignItems:'stretch',
      border: readOnly ? '1.5px solid #bbb' : '1.5px solid #333',
      borderRadius:3, background: readOnly ? '#f5f3ef' : (highlight || '#fffdf2'),
      minHeight: 26,
    }}>
      <div style={{
        flex:1, padding:'3px 8px', display:'flex', alignItems:'center',
        fontFamily: mono ? 'JetBrains Mono, monospace' : 'Caveat, cursive',
        fontSize: mono ? 13 : 15, fontWeight: 700,
        color: readOnly ? '#444' : '#222',
      }}>
        {value}
      </div>
      <div style={{
        padding:'3px 7px', borderLeft:'1px solid #ccc',
        background:'#eceae4', display:'flex', alignItems:'center',
      }}>
        <LabelQ size={10} color="#777">{unit}</LabelQ>
      </div>
      {pct != null && (
        <div style={{
          padding:'3px 7px', borderLeft:'1px solid #ccc',
          background:'#f0eee8', display:'flex', alignItems:'center', minWidth:46, justifyContent:'flex-end'
        }}>
          <LabelQ size={11} color="#1a4a8a" style={{ fontFamily:'JetBrains Mono, monospace' }}>{pct}</LabelQ>
        </div>
      )}
    </div>
  </div>
);

/* ───── чекбокс ───── */

const CheckRow = ({ checked, children }) => (
  <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6 }}>
    <div style={{
      width:14, height:14, border:'1.5px solid #333', borderRadius:2,
      background: checked ? '#1a6b3a' : '#fff',
      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
    }}>
      {checked && <span style={{ color:'#fff', fontSize:10, lineHeight:1, fontWeight:700 }}>✓</span>}
    </div>
    <LabelQ size={12} color="#333">{children}</LabelQ>
  </div>
);

/* ───── заголовок секции ───── */

const SectionHead = ({ icon, title, sub, accent }) => (
  <div style={{
    display:'flex', alignItems:'baseline', gap:6, marginBottom:6,
    borderBottom:`1.5px dashed ${accent || '#bbb'}`, paddingBottom:3,
  }}>
    <LabelQ size={11} bold color={accent || '#777'} style={{ textTransform:'uppercase', letterSpacing:0.6 }}>
      {icon} {title}
    </LabelQ>
    {sub && <LabelQ size={10} color="#999" style={{ fontStyle:'italic' }}>{sub}</LabelQ>}
  </div>
);

/* ───── строка калибра ───── */

const KaliberRow = ({ name, kg, pct, readOnly, locked, last }) => {
  const c = RAWQ['Огурцы'];
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:8, padding:'5px 8px',
      borderBottom: last ? 'none' : '1px dashed #ddd',
      background: locked ? '#f5f3ef' : '#fff',
    }}>
      <div style={{ width:8, height:8, borderRadius:8, background:c.dot, flexShrink:0 }}/>
      <LabelQ size={12} bold color="#333" style={{ flex:1, minWidth:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
        {name}
      </LabelQ>
      {locked && (
        <span title="= Нестандарт" style={{
          fontSize:11, color:'#a06000', cursor:'help',
          background:'#fff0c8', border:'1px solid #d4b878', borderRadius:10,
          padding:'0 6px', display:'inline-flex', alignItems:'center', gap:3,
        }}>
          🔗 <span style={{ fontFamily:'Caveat', fontSize:11 }}>= Нестандарт</span>
        </span>
      )}
      <div style={{
        flex:'0 0 110px',
        display:'flex', alignItems:'stretch',
        border:`1.5px solid ${readOnly ? '#bbb' : '#333'}`, borderRadius:3,
        background: readOnly ? '#f5f3ef' : '#fffdf2',
      }}>
        <div style={{
          flex:1, padding:'2px 7px', textAlign:'right',
          fontFamily:'JetBrains Mono, monospace', fontSize:12, fontWeight:700,
          color: readOnly ? '#666' : '#222',
        }}>{kg}</div>
        <div style={{ padding:'2px 5px', borderLeft:'1px solid #ccc', background:'#eceae4' }}>
          <LabelQ size={10} color="#777">кг</LabelQ>
        </div>
      </div>
      <div style={{
        flex:'0 0 50px', textAlign:'right',
        fontFamily:'JetBrains Mono, monospace', fontSize:11, color:'#1a4a8a',
      }}>{pct}</div>
    </div>
  );
};

/* ───── зона drag&drop ───── */

const DropZone = ({ file }) => (
  <div style={{
    border:'1.5px dashed #999', borderRadius:3,
    padding:'8px 10px', background:'#fafafa',
    display:'flex', alignItems:'center', gap:8,
  }}>
    <span style={{ fontSize:20 }}>📄</span>
    {file ? (
      <>
        <div style={{ flex:1, minWidth:0 }}>
          <LabelQ size={12} bold color="#1a4a8a" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {file.name}
          </LabelQ>
          <LabelQ size={10} color="#888">{file.size}</LabelQ>
        </div>
        <BoxQ className="sk-gray" style={{ padding:'2px 8px', cursor:'pointer' }}>
          <LabelQ size={11}>↻ Заменить</LabelQ>
        </BoxQ>
        <span style={{ fontSize:13, color:'#c33', cursor:'pointer' }}>🗑</span>
      </>
    ) : (
      <>
        <div style={{ flex:1 }}>
          <LabelQ size={12} color="#666">Перетащите PDF акта сюда</LabelQ>
          <LabelQ size={10} color="#999" style={{ fontStyle:'italic' }}>или нажмите «Выбрать файл»</LabelQ>
        </div>
        <BoxQ className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer' }}>
          <LabelQ size={11} bold>📎 Выбрать файл</LabelQ>
        </BoxQ>
      </>
    )}
  </div>
);

/* ───── собственно модалка ───── */

const QualityModal = ({ data }) => {
  const c = RAWQ[data.raw] || { bg:'#eee', dot:'#999' };
  const fmt = (n) => n.toLocaleString('ru-RU');
  const pct = (n) => (data.fact > 0 ? Math.round((n / data.fact) * 1000) / 10 + '%' : '—');

  // Расчёт веса к оплате
  const payable = data.fact - data.reject - (data.nonStdPaid ? 0 : data.nonStd);

  // Σ калибров (по редактируемым «к оплате»)
  const payableSum = data.kalibers
    ? data.kalibers.filter(k => !k.locked).reduce((s,k) => s + k.kg, 0)
    : 0;
  const sumOk = data.kalibers ? payableSum === payable : true;

  return (
    <div style={{
      width: 440,
      border:'2px solid #333', borderRadius:4, background:'#fff',
      boxShadow:'4px 6px 0 rgba(0,0,0,0.18)',
      overflow:'hidden', fontFamily:'Caveat',
    }}>
      {/* Шапка */}
      <div style={{
        background:'#2a2a2a', color:'#fff',
        padding:'8px 14px', display:'flex', alignItems:'center', gap:8
      }}>
        <span style={{ fontSize:18 }}>📊</span>
        <LabelQ size={15} bold color="#fff">Качество приёмки</LabelQ>
        <PillQ color={c.bg} size={11}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
            <span style={{ width:7, height:7, borderRadius:7, background:c.dot, display:'inline-block' }}/>
            {data.raw}
          </span>
        </PillQ>
        <div style={{ flex:1 }}/>
        <LabelQ size={11} color="#aaa" style={{ fontFamily:'JetBrains Mono, monospace' }}>
          поз. №{data.posId}
        </LabelQ>
        <span style={{ cursor:'pointer', color:'#fff', fontSize:18, lineHeight:1, marginLeft:6 }}>✕</span>
      </div>

      {/* Тонкий подзаголовок: поставщик / водитель / дата */}
      <div style={{
        padding:'5px 14px', background:'#f5f3ef',
        borderBottom:'1px solid #ccc', display:'flex', gap:10, flexWrap:'wrap',
      }}>
        <LabelQ size={11} color="#666">🏭 {data.supplier}</LabelQ>
        <LabelQ size={11} color="#666">🚚 {data.driver}</LabelQ>
        <LabelQ size={11} color="#666">📅 {data.date}</LabelQ>
      </div>

      {/* Тело */}
      <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:12 }}>

        {/* — Базовый расчёт — */}
        <div>
          <SectionHead icon="①" title="Базовый расчёт" accent="#1a6b3a"/>
          <div style={{ display:'flex', gap:8, marginBottom:6 }}>
            <NumField label="Вес факт" value={fmt(data.fact)} highlight="#eef6ee"/>
          </div>
          <div style={{ display:'flex', gap:8, marginBottom:4 }}>
            <NumField label="Брак" value={fmt(data.reject)} pct={pct(data.reject)}/>
            <NumField label="Нестандарт" value={fmt(data.nonStd)} pct={pct(data.nonStd)}/>
          </div>

          {/* Чекбокс «Оплачивается отдельно» */}
          <div style={{
            padding:'5px 8px', background:'#fafafa',
            border:'1px dashed #ddd', borderRadius:3, marginTop:4,
          }}>
            <CheckRow checked={data.nonStdPaid}>
              Нестандарт <b>оплачивается отдельно</b>
            </CheckRow>
            {data.nonStdPaid && (
              <div style={{ marginTop:6, marginLeft:20, display:'flex', gap:8, alignItems:'flex-end' }}>
                <NumField label="Цена нестандарта" value={fmt(data.nonStdPrice)} unit="₽/кг" w={170}/>
                <div style={{ flex:1, padding:'4px 8px', background:'#eef6ee', border:'1px solid #c8dcc4', borderRadius:3, marginBottom:1 }}>
                  <LabelQ size={11} color="#1a6b3a">
                    = <b style={{ fontFamily:'JetBrains Mono, monospace' }}>{fmt(data.nonStd * data.nonStdPrice)} ₽</b>
                  </LabelQ>
                </div>
              </div>
            )}
          </div>

          {/* Формула + результат */}
          <div style={{
            marginTop:8, padding:'6px 8px',
            background:'#eef6ee', border:'1.5px solid #1a6b3a', borderRadius:3,
          }}>
            <LabelQ size={10} color="#1a6b3a" style={{ fontFamily:'JetBrains Mono, monospace', marginBottom:3 }}>
              факт − брак {data.nonStdPaid ? '' : '− нестандарт'} = к оплате
            </LabelQ>
            <div style={{ display:'flex', gap:8 }}>
              <NumField
                label="Вес к оплате"
                value={fmt(payable)}
                pct={pct(payable)}
                readOnly
                hint="авто"
              />
            </div>
          </div>
        </div>

        {/* — Калибры — только если есть параметры качества */}
        {data.kalibers && (
          <div>
            <SectionHead
              icon="②"
              title="Калибры"
              sub={`параметры качества «${data.raw}»`}
              accent="#a06000"
            />
            <div style={{ border:'1.5px solid #333', borderRadius:3, overflow:'hidden', background:'#fff' }}>
              {/* header */}
              <div style={{ display:'flex', gap:8, padding:'4px 8px', background:'#2a2a2a' }}>
                <LabelQ size={10} bold color="#fff" style={{ flex:1, textTransform:'uppercase', letterSpacing:0.4 }}>Калибр</LabelQ>
                <LabelQ size={10} bold color="#fff" style={{ flex:'0 0 110px', textAlign:'right', textTransform:'uppercase', letterSpacing:0.4 }}>Вес, кг</LabelQ>
                <LabelQ size={10} bold color="#fff" style={{ flex:'0 0 50px', textAlign:'right', textTransform:'uppercase', letterSpacing:0.4 }}>%</LabelQ>
              </div>
              {data.kalibers.map((k, i) => (
                <KaliberRow
                  key={i}
                  name={k.name}
                  kg={fmt(k.kg)}
                  pct={pct(k.kg)}
                  readOnly={k.locked}
                  locked={k.locked}
                  last={i === data.kalibers.length - 1}
                />
              ))}
            </div>

            {/* строка валидации */}
            <div style={{
              marginTop:6, padding:'5px 10px', borderRadius:3,
              display:'flex', alignItems:'center', gap:8, flexWrap:'wrap',
              background: sumOk ? '#d4e8c2' : '#ffd6d0',
              border: `1.5px solid ${sumOk ? '#1a6b3a' : '#a83020'}`,
            }}>
              <LabelQ size={11} bold color={sumOk ? '#1a6b3a' : '#a83020'} style={{ fontFamily:'JetBrains Mono, monospace' }}>
                Σ: {fmt(payableSum)} / {fmt(payable)} {sumOk ? '✓' : '✗'}
              </LabelQ>
              {!sumOk && (
                <LabelQ size={11} color="#a83020" bold>
                  расхождение {fmt(Math.abs(payable - payableSum))} кг
                </LabelQ>
              )}
              {sumOk && (
                <LabelQ size={11} color="#1a6b3a">
                  калибры сходятся с весом к оплате
                </LabelQ>
              )}
            </div>
          </div>
        )}

        {/* — Документ — */}
        <div>
          <SectionHead icon="③" title="Документ" accent="#1a4a8a"/>
          <div style={{ display:'flex', gap:8, marginBottom:6 }}>
            <NumField label="№ акта" value={data.actNum} unit="" w={170} mono/>
          </div>
          <div style={{ marginBottom:6 }}>
            <LabelQ size={11} bold color="#555" style={{ textTransform:'uppercase', letterSpacing:0.4, marginBottom:3 }}>
              PDF акта
            </LabelQ>
            <DropZone file={data.pdf}/>
          </div>
          <div>
            <LabelQ size={11} bold color="#555" style={{ textTransform:'uppercase', letterSpacing:0.4, marginBottom:3 }}>
              Комментарий
            </LabelQ>
            <div style={{
              border:'1.5px solid #333', borderRadius:3,
              padding:'6px 8px', background:'#fffdf2', minHeight:48,
            }}>
              {data.comment
                ? <LabelQ size={13} color="#444" style={{ whiteSpace:'pre-wrap' }}>{data.comment}</LabelQ>
                : <LabelQ size={12} color="#bbb" style={{ fontStyle:'italic' }}>добавьте примечание к приёмке…</LabelQ>}
            </div>
          </div>
        </div>
      </div>

      {/* Подвал */}
      <div style={{
        padding:'8px 14px', background:'#f5f3ed',
        borderTop:'1.5px solid #ccc',
        display:'flex', gap:8, alignItems:'center'
      }}>
        <LabelQ size={11} color="#888" style={{ fontStyle:'italic' }}>
          изменения сохраняются по кнопке
        </LabelQ>
        <div style={{ flex:1 }}/>
        <BoxQ className="sk-gray" style={{ padding:'5px 14px', cursor:'pointer' }}>
          <LabelQ size={13}>Отмена</LabelQ>
        </BoxQ>
        <BoxQ className="sk-gray" style={{ padding:'5px 16px', cursor:'pointer', background:'#1a6b3a', borderColor:'#0d4020' }}>
          <LabelQ size={13} bold color="#fff">✓ Сохранить</LabelQ>
        </BoxQ>
      </div>
    </div>
  );
};

/* ───── две демо-карточки ───── */

const VARIANT_A = {
  raw: 'Огурцы',
  supplier: 'Байрамов А.',
  driver: 'Вихров П.',
  date: '21 апр',
  posId: '2104-07',
  fact: 5000,
  reject: 100,
  nonStd: 750,
  nonStdPaid: false,
  nonStdPrice: 0,
  kalibers: [
    { name: 'Калибр 6–9 см',  kg: 1200 },
    { name: 'Калибр 9–12 см', kg: 2950 },
    { name: 'Калибр 12+ см',  kg: 750, locked: true },
  ],
  actNum: 'А-0421/07',
  pdf: { name: 'akt-0421-07.pdf', size: '184 КБ' },
  comment: 'Партия чистая, тара без замечаний.',
};

const VARIANT_B = {
  raw: 'Томаты',
  supplier: 'Ким Т.',
  driver: 'Гриненко К.',
  date: '22 апр',
  posId: '2204-03',
  fact: 5000,
  reject: 100,
  nonStd: 200,
  nonStdPaid: true,
  nonStdPrice: 25,
  kalibers: null,
  actNum: 'А-0422/03',
  pdf: null,
  comment: 'Нестандарт идёт на томатную пасту, отдельная цена.',
};

/* ───── демо-экран: две модалки рядом ───── */

const QualityModalDemo = () => (
  <div style={{ padding:20, fontFamily:'Caveat', background:'#e8e3da', minHeight:'100%' }}>
    {/* Аннотация наверху */}
    <div style={{
      marginBottom:16, padding:'10px 14px',
      background:'#fffbe8', border:'1.5px dashed #e09a20', borderRadius:4,
      maxWidth: 980,
    }}>
      <LabelQ size={14} color="#b06000" bold>
        ✦ Модалка «Качество приёмки» — вызывается по 📊 рядом с № акта в карточке позиции отгрузки
      </LabelQ>
      <div style={{ height:4 }}/>
      <LabelQ size={12} color="#b06000">
        Слева — сырьё с параметрами качества (блок «Калибры» показан) ·
        Справа — сырьё без параметров (блок «Калибры» скрыт, нестандарт оплачивается отдельно)
      </LabelQ>
    </div>

    {/* Два варианта рядом */}
    <div style={{ display:'flex', gap:30, alignItems:'flex-start', flexWrap:'wrap' }}>

      {/* Вариант A */}
      <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-start' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <PillQ color="#d4e8c2" textColor="#1a6b3a" size={12}>ВАРИАНТ A</PillQ>
          <LabelQ size={14} bold>сырьё с параметрами качества</LabelQ>
        </div>
        <QualityModal data={VARIANT_A}/>
        <div style={{
          marginTop:4, padding:'6px 10px', maxWidth:440,
          background:'#fff', border:'1px dashed #1a6b3a', borderRadius:3,
        }}>
          <LabelQ size={11} color="#1a6b3a">
            🥒 факт <b>5 000</b> − брак <b>100</b> − нестандарт <b>750</b> = <b>4 150</b> (83%) ·
            Σ калибров 1 200 + 2 950 = 4 150 ✓ · «12+ см» 🔗 = Нестандарт
          </LabelQ>
        </div>
      </div>

      {/* Вариант B */}
      <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-start' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <PillQ color="#ffe0b8" textColor="#c87020" size={12}>ВАРИАНТ Б</PillQ>
          <LabelQ size={14} bold>сырьё без параметров качества</LabelQ>
        </div>
        <QualityModal data={VARIANT_B}/>
        <div style={{
          marginTop:4, padding:'6px 10px', maxWidth:440,
          background:'#fff', border:'1px dashed #c87020', borderRadius:3,
        }}>
          <LabelQ size={11} color="#c87020">
            🍅 факт <b>5 000</b> − брак <b>100</b> = <b>4 900</b> (98%) ·
            нестандарт <b>200</b> × <b>25 ₽</b> = <b>5 000 ₽</b> отдельно ·
            блок «Калибры» отсутствует
          </LabelQ>
        </div>
      </div>
    </div>
  </div>
);

/* ===== expose ===== */
Object.assign(window, { QualityModal, QualityModalDemo });
