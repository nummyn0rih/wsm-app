/* ────────────────────────────────────────────────────────────────────
   SUPPLIER CARD — содержимое 6 вкладок
   ────────────────────────────────────────────────────────────────────
   Используется из references-extras.jsx → SuppliersWithAvg
   Вкладка «Средний вес рейса по сырью» остаётся в references-extras.jsx
   и здесь НЕ дублируется.
   ──────────────────────────────────────────────────────────────────── */

const { useState: useSt } = React;
const _Box   = window.Box;
const _Label = window.Label;
const _Pill  = window.Pill;
const _HR    = window.HR;
const _RAW   = window.RAW_COLORS;

/* ===== shared field atoms ===== */

const FLabel = ({ children, hint }) => (
  <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:2 }}>
    <_Label size={11} bold color="#555" style={{ textTransform:'uppercase', letterSpacing:0.5 }}>{children}</_Label>
    {hint && <_Label size={10} color="#999" style={{ fontStyle:'italic' }}>{hint}</_Label>}
  </div>
);

const FText = ({ value, multiline, h, mono, placeholder }) => (
  <div style={{
    border:'1.5px solid #999', borderRadius:3,
    padding: multiline ? '5px 8px' : '4px 8px',
    background:'#fff',
    minHeight: multiline ? (h || 70) : 24,
    whiteSpace:'pre-wrap',
    fontFamily: mono ? 'JetBrains Mono, monospace' : 'Caveat, cursive',
    fontSize: mono ? 12 : 13,
    color: value ? '#222' : '#bbb', lineHeight:1.35,
  }}>
    {value || placeholder || '—'}
  </div>
);

const FSelect = ({ value }) => (
  <div style={{
    border:'1.5px solid #999', borderRadius:3, padding:'4px 8px',
    background:'#fff', minHeight:24, display:'flex', alignItems:'center'
  }}>
    <_Label size={13} bold>{value}</_Label>
    <div style={{ flex:1 }}/>
    <_Label size={11} color="#999">▾</_Label>
  </div>
);

const SectionTitle = ({ children, hint }) => (
  <div style={{
    display:'flex', alignItems:'baseline', gap:8,
    marginBottom:8, paddingBottom:4, borderBottom:'1.5px dashed #ccc'
  }}>
    <_Label size={14} bold color="#333">{children}</_Label>
    {hint && <_Label size={11} color="#888" style={{ fontStyle:'italic' }}>{hint}</_Label>}
  </div>
);

/* ===========================================================
   1) ОСНОВНЫЕ ДАННЫЕ
   =========================================================== */

const TabMain = ({ admin }) => {
  const [status, setStatus] = useSt('active');
  const tags = [
    { name:'приоритетный', on:true,  color:'#fff0c8', tx:'#a06000' },
    { name:'новый',        on:false, color:'#e0ebf6', tx:'#1a4a8a' },
    { name:'проблемный',   on:false, color:'#fde0e0', tx:'#a02020' },
  ];
  return (
    <div style={{ padding:14 }}>
      <SectionTitle hint="реквизиты и атрибуты поставщика">Основные данные</SectionTitle>

      {/* row 1 — name + INN + form */}
      <div style={{ display:'flex', gap:10, marginBottom:8 }}>
        <div style={{ flex:2 }}>
          <FLabel>Название</FLabel>
          <FText value="Генералов А.В." />
        </div>
        <div style={{ flex:1 }}>
          <FLabel hint="10 или 12 цифр">ИНН</FLabel>
          <FText value="6122003487" mono />
        </div>
        <div style={{ flex:1 }}>
          <FLabel>Юр. форма</FLabel>
          <FSelect value="ИП (КФХ)" />
        </div>
      </div>

      {/* row 2 — addresses */}
      <div style={{ display:'flex', gap:10, marginBottom:8 }}>
        <div style={{ flex:1 }}>
          <FLabel hint="по выписке ЕГРИП">Юридический адрес</FLabel>
          <FText value="346800, Ростовская обл., Неклиновский р-н, с. Покровское, ул. Ленина 47" multiline h={48} />
        </div>
        <div style={{ flex:1 }}>
          <FLabel hint="откуда отгрузка">Фактический адрес</FLabel>
          <FText value="346806, Ростовская обл., Неклиновский р-н, х. Гаевка, поле №3-А · въезд через КПП у элеватора" multiline h={48} />
        </div>
      </div>

      {/* row 3 — status + date + button */}
      <div style={{ display:'flex', gap:10, marginBottom:8, alignItems:'flex-start' }}>
        <div style={{ flex:'0 0 200px' }}>
          <FLabel>Статус</FLabel>
          <div style={{ display:'inline-flex', border:'2px solid #333', borderRadius:3, overflow:'hidden' }}>
            <div onClick={admin ? () => setStatus('active') : undefined}
              style={{
                padding:'4px 12px', cursor: admin ? 'pointer' : 'default',
                background: status === 'active' ? '#1a6b3a' : '#f5f3ed',
                borderRight:'2px solid #333'
              }}>
              <_Label size={12} bold color={status === 'active' ? '#fff' : '#555'}>● Активный</_Label>
            </div>
            <div onClick={admin ? () => setStatus('archive') : undefined}
              style={{
                padding:'4px 12px', cursor: admin ? 'pointer' : 'default',
                background: status === 'archive' ? '#888' : '#f5f3ed',
              }}>
              <_Label size={12} bold color={status === 'archive' ? '#fff' : '#555'}>◌ Архив</_Label>
            </div>
          </div>
        </div>
        <div style={{ flex:'0 0 200px' }}>
          <FLabel hint="когда подписан первый контракт">Начало сотрудничества</FLabel>
          <FText value="14 мар 2019" mono />
        </div>
        <div style={{ flex:1 }}/>
      </div>

      {/* row 4 — tags */}
      <div style={{ marginBottom:8 }}>
        <FLabel hint="мульти-выбор">Теги</FLabel>
        <div style={{
          border:'1.5px solid #999', borderRadius:3, padding:'5px 8px',
          background:'#fff', minHeight:30, display:'flex', alignItems:'center', gap:6, flexWrap:'wrap'
        }}>
          {tags.map((t,i) => (
            <span key={i} style={{
              display:'inline-flex', alignItems:'center', gap:4,
              padding:'1px 8px',
              background: t.on ? t.color : '#f5f3ed',
              border: t.on ? `1.5px solid ${t.tx}` : '1.5px dashed #bbb',
              borderRadius:20,
              fontFamily:'Caveat', fontSize:12,
              color: t.on ? t.tx : '#999',
              opacity: t.on ? 1 : 0.65,
              cursor: admin ? 'pointer' : 'default',
            }}>
              {t.on && '✓ '}{t.name}
            </span>
          ))}
          <div style={{ flex:1 }}/>
          {admin && <_Label size={11} color="#888">+ ещё</_Label>}
        </div>
      </div>

      {/* row 5 — note */}
      <div style={{ marginBottom:10 }}>
        <FLabel hint="внутренняя заметка по поставщику">Заметка</FLabel>
        <FText
          multiline h={72}
          value={"Большое хозяйство, 4 поля — огурцы, томаты, перец, баклажан. С 2022 г. поставляет\nкалиброванные огурцы по нашему ТЗ. Расчёты — еженедельно по средам.\nКонтакт по форс-мажорам — Сергей (сын, +7 928 777-12-34)."}
        />
      </div>

      {/* footer action */}
      <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', padding:'8px 10px',
        background:'#f5f3ed', border:'1.5px dashed #bbb', borderRadius:3 }}>
        <_Label size={12} color="#555">Действия:</_Label>
        <_Box className="sk-gray" style={{ padding:'4px 12px', cursor: admin ? 'pointer' : 'not-allowed', opacity: admin ? 1 : 0.5, display:'flex', alignItems:'center', gap:5, background:'#fffbe8', borderColor:'#d4b878' }}>
          <_Label size={12} bold>📦 Скорректировать остаток тары</_Label>
        </_Box>
        <_Label size={10} color="#999" style={{ fontStyle:'italic' }}>откроет форму инвентаризации с предзаполненным поставщиком</_Label>
      </div>
    </div>
  );
};

/* ===========================================================
   2) КОНТАКТЫ
   =========================================================== */

const CONTACTS = [
  { fio:'Генералов Александр Викторович', role:'Владелец / директор',  phone:'+7 928 234-56-71', email:'generalov@mail.ru',    primary:true,  note:'все ключевые решения — через него' },
  { fio:'Генералов Сергей Александрович',  role:'Сын · сменный логист',  phone:'+7 928 777-12-34', email:'s.generalov@mail.ru', primary:false, note:'отвечает за догрузы и форс-мажор' },
  { fio:'Зимина Ольга Павловна',           role:'Бухгалтер',             phone:'+7 950 412-87-09', email:'buh.generalov@yandex.ru', primary:false },
  { fio:'Татьяна (диспетчер поля)',        role:'Диспетчер поля №3-А',   phone:'+7 928 105-44-22', email:null, primary:false, note:'передаёт остатки по WhatsApp, утром' },
];

const ContactCard = ({ c, admin }) => (
  <div style={{
    border: c.primary ? '2px solid #1a6b3a' : '1.5px solid #999',
    borderRadius:4, background:'#fff', padding:'8px 10px',
    display:'flex', gap:10, alignItems:'flex-start', position:'relative'
  }}>
    {/* avatar */}
    <div style={{
      width:36, height:36, borderRadius:'50%',
      background: c.primary ? '#1a6b3a' : '#bbb',
      color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
      flexShrink:0, fontFamily:'Caveat', fontSize:18, fontWeight:700
    }}>
      {c.fio.split(' ').slice(0,2).map(x => x[0]).join('')}
    </div>
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ display:'flex', alignItems:'baseline', gap:6, flexWrap:'wrap' }}>
        <_Label size={14} bold>{c.fio}</_Label>
        {c.primary && <_Pill color="#d4ead9" textColor="#1a6b3a" size={10}>★ основной</_Pill>}
      </div>
      <_Label size={11} color="#777" style={{ marginBottom:4 }}>{c.role}</_Label>
      <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
        <a href={`tel:${c.phone.replace(/[^+0-9]/g,'')}`}
          style={{ display:'inline-flex', alignItems:'center', gap:4,
            fontFamily:'JetBrains Mono, monospace', fontSize:12,
            color:'#1a4a8a', textDecoration:'underline', textDecorationStyle:'dotted' }}>
          📞 {c.phone}
        </a>
        {c.email && (
          <a href={`mailto:${c.email}`}
            style={{ display:'inline-flex', alignItems:'center', gap:4,
              fontFamily:'JetBrains Mono, monospace', fontSize:11,
              color:'#1a4a8a', textDecoration:'underline', textDecorationStyle:'dotted' }}>
            ✉ {c.email}
          </a>
        )}
      </div>
      {c.note && (
        <div style={{ marginTop:4, padding:'3px 6px', background:'#fffbe8', border:'1px dashed #d4b878', borderRadius:2 }}>
          <_Label size={11} color="#a06000" style={{ fontStyle:'italic' }}>💬 {c.note}</_Label>
        </div>
      )}
    </div>
    {admin && (
      <div style={{ display:'flex', gap:6, flexShrink:0 }}>
        <_Label size={13} color="#555" style={{ cursor:'pointer' }}>✎</_Label>
        <_Label size={13} color="#a02020" style={{ cursor:'pointer' }}>🗑</_Label>
      </div>
    )}
  </div>
);

const TabContacts = ({ admin }) => (
  <div style={{ padding:14 }}>
    <SectionTitle hint={`${CONTACTS.length} контакта · 1 основной`}>Контакты поставщика</SectionTitle>

    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
      {CONTACTS.map((c,i) => <ContactCard key={i} c={c} admin={admin}/>)}
    </div>

    {admin && (
      <div style={{ marginBottom:12 }}>
        <_Box className="sk-gray" style={{
          padding:'8px 12px', cursor:'pointer',
          background:'#f0f0c8', borderStyle:'dashed', display:'flex', alignItems:'center', gap:6,
          justifyContent:'center'
        }}>
          <_Label size={13} bold color="#1a6b3a">＋ Добавить контакт</_Label>
        </_Box>
      </div>
    )}

    <SectionTitle hint="журнал договорённостей по телефону / в мессенджерах">Общие заметки по коммуникации</SectionTitle>
    <FText
      multiline h={120}
      value={
"21.04 · договорились о догрузе халапеньо во вторник (через Сергея)\n" +
"18.04 · АВ просит перевести оплату 17 недели до пятницы — обещали\n" +
"12.04 · Татьяна сообщила: началась уборка патиссонов, ожидаем рост объёма\n" +
"05.04 · Ольга прислала акт сверки за март — подписан и возвращён\n" +
"28.03 · Обсудили цену на черри (новый сезон): +6% к прошлому году"
      }
    />
  </div>
);

/* ===========================================================
   3) КОНТРАКТЫ
   =========================================================== */

const CONTRACTS_BY_SEASON = [
  {
    season: 'Сезон 2025',
    range: 'апр 2025 – окт 2025',
    current: true,
    contracts: [
      { id:'K-2025-014', raws:['Огурцы'],            plan:420_000, done:178_400, status:'Активен',   start:'14 апр 2025', end:'31 окт 2025' },
      { id:'K-2025-017', raws:['Томаты','Черри'],     plan:380_000, done: 92_150, status:'Активен',   start:'01 май 2025', end:'15 окт 2025' },
      { id:'K-2025-021', raws:['Халапеньо','Перец'],  plan:180_000, done:      0, status:'Подписан', start:'10 июн 2025', end:'30 сен 2025' },
    ]
  },
  {
    season: 'Сезон 2024',
    range: 'апр 2024 – окт 2024',
    current: false,
    contracts: [
      { id:'K-2024-009', raws:['Огурцы'],            plan:380_000, done:392_540, status:'Закрыт', start:'15 апр 2024', end:'28 окт 2024' },
      { id:'K-2024-012', raws:['Томаты'],             plan:340_000, done:318_700, status:'Закрыт', start:'05 май 2024', end:'10 окт 2024' },
      { id:'K-2024-018', raws:['Патиссоны'],          plan: 80_000, done: 78_200, status:'Закрыт', start:'01 июл 2024', end:'15 сен 2024' },
    ]
  },
];

const ContractRow = ({ c, admin }) => {
  const pct = Math.min(100, Math.round(c.done / c.plan * 100));
  const overflow = c.done > c.plan;
  const stCol = c.status === 'Активен' ? { bg:'#d4ead9', tx:'#1a6b3a' }
              : c.status === 'Подписан' ? { bg:'#fff0c8', tx:'#a06000' }
              : { bg:'#e0e0e0', tx:'#555' };
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:10,
      padding:'8px 10px', borderBottom:'1px dashed #ccc', background:'#fff',
      cursor:'pointer'
    }} title="Перейти на страницу контракта">
      <_Label size={13} bold color="#1a4a8a" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:12, width:96 }}>
        {c.id}
      </_Label>
      {/* raws */}
      <div style={{ display:'flex', gap:4, flexWrap:'wrap', width:200 }}>
        {c.raws.map((r,i) => {
          const col = _RAW[r] || { bg:'#eee', dot:'#999' };
          return (
            <span key={i} style={{
              display:'inline-flex', alignItems:'center', gap:4,
              padding:'1px 7px', background:col.bg, border:'1.5px solid #333',
              borderRadius:20, fontFamily:'Caveat', fontSize:11
            }}>
              <span style={{ width:7, height:7, borderRadius:7, background:col.dot, display:'inline-block' }}/>
              {r}
            </span>
          );
        })}
      </div>
      {/* dates */}
      <_Label size={11} color="#666" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10, width:140 }}>
        {c.start} → {c.end}
      </_Label>
      {/* progress */}
      <div style={{ flex:1, minWidth:160 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
          <_Label size={11} color="#555" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10 }}>
            {c.done.toLocaleString('ru-RU')} / {c.plan.toLocaleString('ru-RU')} кг
          </_Label>
          <_Label size={11} bold color={overflow ? '#a06000' : '#1a6b3a'} style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10 }}>
            {pct}%{overflow && ' (перевыполнен)'}
          </_Label>
        </div>
        <div style={{ height:8, background:'#eee', border:'1px solid #aaa', borderRadius:2, overflow:'hidden', position:'relative' }}>
          <div style={{
            width: `${pct}%`, height:'100%',
            background: overflow ? '#c87020' : (c.status === 'Подписан' ? '#d4b878' : '#1a6b3a'),
          }}/>
        </div>
      </div>
      <_Pill color={stCol.bg} textColor={stCol.tx} size={10}>{c.status}</_Pill>
      <_Label size={13} color="#888">→</_Label>
    </div>
  );
};

const TabContracts = ({ admin }) => {
  const [open, setOpen] = useSt({ 0:true, 1:false });
  return (
    <div style={{ padding:14 }}>
      <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:8, paddingBottom:4, borderBottom:'1.5px dashed #ccc' }}>
        <_Label size={14} bold>Контракты поставщика</_Label>
        <_Label size={11} color="#888" style={{ fontStyle:'italic' }}>группировка по сезонам</_Label>
        <div style={{ flex:1 }}/>
        {admin && (
          <_Box className="sk-gray" style={{ padding:'4px 10px', cursor:'pointer', background:'#1a6b3a', borderColor:'#0d4020' }}>
            <_Label size={12} bold color="#fff">＋ Создать контракт для этого поставщика</_Label>
          </_Box>
        )}
      </div>

      {CONTRACTS_BY_SEASON.map((s, si) => {
        const isOpen = !!open[si];
        const totalPlan = s.contracts.reduce((a,c) => a + c.plan, 0);
        const totalDone = s.contracts.reduce((a,c) => a + c.done, 0);
        return (
          <div key={si} style={{ marginBottom:10, border:'2px solid #333', borderRadius:3, overflow:'hidden' }}>
            <div onClick={() => setOpen({ ...open, [si]: !isOpen })}
              style={{
                display:'flex', alignItems:'center', gap:8, padding:'6px 10px', cursor:'pointer',
                background: s.current ? '#1a6b3a' : '#555', color:'#fff'
              }}>
              <span style={{ fontSize:16 }}>{isOpen ? '▾' : '▸'}</span>
              <_Label size={15} bold color="#fff">{s.season}</_Label>
              <_Label size={12} color="#cfe6d6">· {s.range}</_Label>
              {s.current && <_Pill color="#12532c" textColor="#cff" size={11}>текущий</_Pill>}
              <div style={{ flex:1 }}/>
              <_Pill color="#3a3a3a" textColor="#ffd" size={11}>{s.contracts.length} контр.</_Pill>
              <_Pill color="#3a3a3a" textColor="#ffd" size={11}>
                {totalDone.toLocaleString('ru-RU')} / {totalPlan.toLocaleString('ru-RU')} кг
              </_Pill>
            </div>
            {isOpen && (
              <div>
                {s.contracts.map((c,i) => <ContractRow key={i} c={c} admin={admin}/>)}
              </div>
            )}
          </div>
        );
      })}

      <div style={{ padding:'6px 10px', background:'#fffbe8', border:'1.5px dashed #d4b878', borderRadius:3 }}>
        <_Label size={11} color="#a06000" style={{ fontStyle:'italic' }}>
          ✦ Клик по карточке контракта → переход на страницу контракта (раздел «Контракты»)
        </_Label>
      </div>
    </div>
  );
};

/* ===========================================================
   4) ИСТОРИЯ ОТГРУЗОК
   =========================================================== */

const QIcon = ({ q }) => {
  /* q: 'ok' | 'warn' | 'bad' | 'none' */
  const map = {
    ok:   { bg:'#e4f1e0', br:'#1a6b3a', tx:'#1a6b3a', em:'✓', lbl:'норма' },
    warn: { bg:'#fff0c8', br:'#a06000', tx:'#a06000', em:'!', lbl:'нестандарт' },
    bad:  { bg:'#fde0e0', br:'#a02020', tx:'#a02020', em:'✕', lbl:'брак' },
    none: { bg:'#ececec', br:'#999',    tx:'#777',    em:'…', lbl:'нет данных' },
  }[q];
  return (
    <span title={map.lbl} style={{
      display:'inline-flex', alignItems:'center', gap:3,
      padding:'0 5px', height:16,
      background:map.bg, border:`1.2px solid ${map.br}`, borderRadius:9,
    }}>
      <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10, fontWeight:700, color:map.tx }}>📊{map.em}</span>
    </span>
  );
};

const HISTORY = [
  { date:'21 апр 2025', raw:'Огурцы',     truck:'Volvo FH · К 245 ОР 77', driver:'Вихров П.',   kg:18500, q:'ok'   },
  { date:'21 апр 2025', raw:'Патиссоны',  truck:'Scania R450 · Е 712 ВК', driver:'Кузнецов А.', kg: 8536, q:'warn' },
  { date:'21 апр 2025', raw:'Халапеньо',  truck:'Scania R450 · Е 712 ВК', driver:'Кузнецов А.', kg:12440, q:'ok'   },
  { date:'19 апр 2025', raw:'Огурцы',     truck:'Volvo FH · К 245 ОР 77', driver:'Вихров П.',   kg:17800, q:'ok'   },
  { date:'17 апр 2025', raw:'Огурцы',     truck:'Volvo FH · К 245 ОР 77', driver:'Вихров П.',   kg:18120, q:'ok'   },
  { date:'15 апр 2025', raw:'Томаты',     truck:'Renault T · А 318 СН',   driver:'Гриненко К.', kg:19200, q:'ok'   },
  { date:'14 апр 2025', raw:'Огурцы',     truck:'Volvo FH · К 245 ОР 77', driver:'Вихров П.',   kg:16400, q:'warn' },
  { date:'12 апр 2025', raw:'Перец',      truck:'Iveco Stralis · Х 902', driver:'Шахматов',    kg:15600, q:'bad'  },
  { date:'10 апр 2025', raw:'Огурцы',     truck:'Volvo FH · К 245 ОР 77', driver:'Вихров П.',   kg:18900, q:'ok'   },
  { date:'08 апр 2025', raw:'Томаты',     truck:'Renault T · А 318 СН',   driver:'Гриненко К.', kg:18750, q:'ok'   },
  { date:'05 апр 2025', raw:'Баклажан',   truck:'MAN TGX · О 891 РТ',    driver:'Мартыно В.',  kg: 9800, q:'ok'   },
  { date:'03 апр 2025', raw:'Огурцы',     truck:'Volvo FH · К 245 ОР 77', driver:'Вихров П.',   kg:17200, q:'warn' },
];

const TabHistory = ({ admin }) => {
  const total = HISTORY.reduce((a,r) => a + r.kg, 0);
  const byRaw = {};
  HISTORY.forEach(r => { byRaw[r.raw] = (byRaw[r.raw]||0) + r.kg; });
  return (
    <div style={{ padding:14 }}>
      <SectionTitle hint={`${HISTORY.length} строк · с начала сезона 2025`}>История отгрузок</SectionTitle>

      {/* Filters */}
      <div style={{
        display:'flex', gap:6, alignItems:'center', flexWrap:'wrap',
        padding:'6px 8px', background:'#f5f3ed', border:'1.5px solid #ccc', borderRadius:3, marginBottom:8
      }}>
        <_Label size={12} bold color="#555">Фильтры:</_Label>
        <div style={{ display:'flex', alignItems:'center', gap:3 }}>
          <_Label size={11} color="#777">от</_Label>
          <_Box className="sk-gray" style={{ padding:'2px 8px', minHeight:22 }}><_Label size={11} style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10 }}>01.04.2025</_Label></_Box>
          <_Label size={11} color="#777">до</_Label>
          <_Box className="sk-gray" style={{ padding:'2px 8px', minHeight:22 }}><_Label size={11} style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10 }}>21.04.2025</_Label></_Box>
        </div>
        <_Box className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer' }}>
          <_Label size={12}>🥒 Сырьё: все ▾</_Label>
        </_Box>
        <_Box className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer' }}>
          <_Label size={12}>📊 Качество: все ▾</_Label>
        </_Box>
        <div style={{ flex:1 }}/>
        <_Box className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer' }}><_Label size={12}>↓ Excel</_Label></_Box>
        <_Box className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer' }}><_Label size={12}>🖨 Печать</_Label></_Box>
      </div>

      {/* Table */}
      <div style={{ border:'2px solid #333', borderRadius:3, overflow:'hidden' }}>
        <div style={{ display:'flex', background:'#2a2a2a', color:'#fff' }}>
          {[
            { t:'Дата ↓',          w:100 },
            { t:'Сырьё',           w:130 },
            { t:'Машина / водитель', w:300 },
            { t:'Вес, кг',         w:90 },
            { t:'Качество',        w:110 },
          ].map((h,i) => (
            <div key={i} style={{ width:h.w, padding:'5px 8px', borderRight:'1px solid #555' }}>
              <_Label size={12} bold color="#fff">{h.t}</_Label>
            </div>
          ))}
        </div>
        {HISTORY.map((r,i) => {
          const c = _RAW[r.raw] || { bg:'#eee', dot:'#999' };
          return (
            <div key={i} style={{
              display:'flex', background: i%2===0 ? '#fafafa' : '#fff',
              borderBottom:'1px solid #eee', alignItems:'center'
            }}>
              <div style={{ width:100, padding:'4px 8px', fontFamily:'JetBrains Mono, monospace' }}>
                <_Label size={11} color="#555" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>{r.date}</_Label>
              </div>
              <div style={{ width:130, padding:'4px 8px' }}>
                <span style={{
                  display:'inline-flex', alignItems:'center', gap:4,
                  padding:'1px 7px', background:c.bg, border:'1.5px solid #333',
                  borderRadius:20, fontFamily:'Caveat', fontSize:11
                }}>
                  <span style={{ width:7, height:7, borderRadius:7, background:c.dot }}/>
                  {r.raw}
                </span>
              </div>
              <div style={{ width:300, padding:'4px 8px', display:'flex', alignItems:'center', gap:6 }}>
                <_Label size={12} color="#444" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10 }}>{r.truck}</_Label>
                <_Label size={11} color="#888">·</_Label>
                <_Label size={12} color="#1a4a8a" style={{ textDecoration:'underline', textDecorationStyle:'dotted' }}>{r.driver}</_Label>
              </div>
              <div style={{ width:90, padding:'4px 8px' }}>
                <_Label size={13} bold style={{ fontFamily:'JetBrains Mono, monospace', fontSize:12 }}>{r.kg.toLocaleString('ru-RU')}</_Label>
              </div>
              <div style={{ width:110, padding:'4px 8px' }}>
                <QIcon q={r.q}/>
              </div>
            </div>
          );
        })}
        {/* Subtotal */}
        <div style={{
          display:'flex', alignItems:'center', gap:10, flexWrap:'wrap',
          padding:'6px 10px', background:'#f0f0c8', borderTop:'2px dashed #bbb'
        }}>
          <_Label size={13} bold color="#555">Итого:</_Label>
          <_Pill color="#e8e8a0" size={12}>Σ {total.toLocaleString('ru-RU')} кг</_Pill>
          {Object.entries(byRaw).map(([raw, kg]) => {
            const c = _RAW[raw] || { bg:'#eee' };
            return (
              <_Pill key={raw} color={c.bg} size={11}>
                {raw} {kg.toLocaleString('ru-RU')}
              </_Pill>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ===========================================================
   5) ТАРА
   =========================================================== */

const TARA_MOVES = [
  { date:'21 апр 2025', op:'Приём с поставщика', kind:'ящик пласт. 20кг', qty:+420, balPlant:1280, balSup: 580, doc:'Поставка 17-04', user:'кладовщик' },
  { date:'18 апр 2025', op:'Отправка поставщику', kind:'ящик пласт. 20кг', qty:-300, balPlant: 860, balSup:1000, doc:'Отправка 18.04', user:'кладовщик' },
  { date:'15 апр 2025', op:'Приём с поставщика', kind:'бочка 200л',        qty:+ 14, balPlant: 142, balSup:  20, doc:'Поставка 15-02', user:'кладовщик' },
  { date:'12 апр 2025', op:'Списание в лом',     kind:'ящик пласт. 20кг', qty:- 18, balPlant: 860, balSup: 700, doc:'Акт лом № 4',    user:'нач. смены' },
  { date:'10 апр 2025', op:'Отправка поставщику', kind:'бочка 200л',       qty:- 20, balPlant: 128, balSup:  20, doc:'Отправка 10.04', user:'кладовщик' },
  { date:'05 апр 2025', op:'Корректировка остатка', kind:'IBC 1000л',     qty:+  2, balPlant:  18, balSup:   4, doc:'Инвентар. 1-кв', user:'админ' },
  { date:'02 апр 2025', op:'Приём с поставщика',  kind:'ящик пласт. 20кг', qty:+220, balPlant: 660, balSup: 480, doc:'Поставка 02-04', user:'кладовщик' },
];

const TaraStat = ({ label, val, sub, color, big }) => (
  <div style={{
    flex:1, border:'2px solid #333', borderRadius:4, background: color || '#fff', padding:'8px 12px'
  }}>
    <_Label size={11} color="#555" style={{ textTransform:'uppercase', letterSpacing:0.5 }}>{label}</_Label>
    <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
      <_Label size={big || 22} bold style={{ fontFamily:'JetBrains Mono, monospace', fontSize: big || 20 }}>{val}</_Label>
      {sub && <_Label size={11} color="#888">{sub}</_Label>}
    </div>
  </div>
);

const TabTara = ({ admin }) => (
  <div style={{ padding:14 }}>
    <SectionTitle hint="по этому поставщику · все виды тары">Тара</SectionTitle>

    {/* Summary plates */}
    <div style={{ display:'flex', gap:8, marginBottom:10 }}>
      <TaraStat label="На заводе" val="1 280" sub="ящ. · 142 боч. · 18 IBC" color="#e8f0e4"/>
      <TaraStat label="У поставщика" val="580" sub="ящ. · 20 боч. · 4 IBC" color="#fff0c8"/>
      <TaraStat label="Лом / списано" val="42" sub="ящ. с начала сезона" color="#fde0e0"/>
      <TaraStat label="Δ оборот" val="+120" sub="за апрель" color="#e0ebf6"/>
    </div>

    {/* Toolbar */}
    <div style={{
      display:'flex', gap:6, alignItems:'center', flexWrap:'wrap',
      padding:'6px 8px', background:'#f5f3ed', border:'1.5px solid #ccc', borderRadius:3, marginBottom:8
    }}>
      <_Label size={12} bold color="#555">Журнал движений</_Label>
      <_Label size={11} color="#888" style={{ fontStyle:'italic' }}>отфильтровано: поставщик = Генералов А.В.</_Label>
      <div style={{ flex:1 }}/>
      <_Box className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer' }}><_Label size={12}>Тип: все ▾</_Label></_Box>
      <_Box className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer' }}><_Label size={12}>Период: апр ▾</_Label></_Box>
      {admin && (
        <_Box className="sk-gray" style={{ padding:'3px 10px', cursor:'pointer', background:'#1a6b3a', borderColor:'#0d4020' }}>
          <_Label size={12} bold color="#fff">＋ Зафиксировать движение</_Label>
        </_Box>
      )}
    </div>

    {/* Table */}
    <div style={{ border:'2px solid #333', borderRadius:3, overflow:'hidden' }}>
      <div style={{ display:'flex', background:'#2a2a2a', color:'#fff' }}>
        {[
          { t:'Дата',          w:100 },
          { t:'Операция',      w:170 },
          { t:'Вид тары',      w:170 },
          { t:'Кол-во',        w:90 },
          { t:'Завод',         w:80 },
          { t:'У поставщика',  w:110 },
          { t:'Документ',      w:130 },
          { t:'Кто',           w:100 },
        ].map((h,i) => (
          <div key={i} style={{ width:h.w, padding:'5px 8px', borderRight:'1px solid #555' }}>
            <_Label size={12} bold color="#fff">{h.t}</_Label>
          </div>
        ))}
      </div>
      {TARA_MOVES.map((m,i) => {
        const sign = m.qty >= 0 ? '+' : '−';
        const qcol = m.op === 'Списание в лом' ? '#a02020'
                   : m.qty >= 0 ? '#1a6b3a' : '#a06000';
        const opIcon = {
          'Приём с поставщика':   '📥',
          'Отправка поставщику':  '📤',
          'Списание в лом':       '🗑',
          'Корректировка остатка':'⚙'
        }[m.op] || '·';
        return (
          <div key={i} style={{
            display:'flex', background: i%2===0 ? '#fafafa' : '#fff',
            borderBottom:'1px solid #eee', alignItems:'center'
          }}>
            <div style={{ width:100, padding:'4px 8px' }}>
              <_Label size={11} color="#555" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>{m.date}</_Label>
            </div>
            <div style={{ width:170, padding:'4px 8px', display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ fontSize:14 }}>{opIcon}</span>
              <_Label size={12}>{m.op}</_Label>
            </div>
            <div style={{ width:170, padding:'4px 8px' }}>
              <_Pill color="#fff" size={11}>{m.kind}</_Pill>
            </div>
            <div style={{ width:90, padding:'4px 8px' }}>
              <_Label size={13} bold color={qcol} style={{ fontFamily:'JetBrains Mono, monospace', fontSize:12 }}>
                {sign}{Math.abs(m.qty).toLocaleString('ru-RU')}
              </_Label>
            </div>
            <div style={{ width:80, padding:'4px 8px' }}>
              <_Label size={12} color="#444" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>{m.balPlant.toLocaleString('ru-RU')}</_Label>
            </div>
            <div style={{ width:110, padding:'4px 8px' }}>
              <_Label size={12} color="#444" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>{m.balSup.toLocaleString('ru-RU')}</_Label>
            </div>
            <div style={{ width:130, padding:'4px 8px' }}>
              <_Label size={11} color="#1a4a8a" style={{ textDecoration:'underline', textDecorationStyle:'dotted' }}>{m.doc}</_Label>
            </div>
            <div style={{ width:100, padding:'4px 8px' }}>
              <_Label size={11} color="#666" style={{ fontStyle:'italic' }}>{m.user}</_Label>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

/* ===========================================================
   6) КАЧЕСТВО
   =========================================================== */

const Q_BY_RAW = [
  { raw:'Огурцы',    reject: 2.1, nonStd: 6.4, payable: 91.5 },
  { raw:'Томаты',    reject: 3.6, nonStd: 8.2, payable: 88.2 },
  { raw:'Черри',     reject: 1.4, nonStd: 4.0, payable: 94.6 },
  { raw:'Патиссоны', reject: 4.0, nonStd: 9.1, payable: 86.9 },
  { raw:'Халапеньо', reject: 2.8, nonStd: 5.5, payable: 91.7 },
  { raw:'Перец',     reject: 5.1, nonStd:11.3, payable: 83.6 },
  { raw:'Баклажан',  reject: 2.0, nonStd: 6.2, payable: 91.8 },
];

const Q_MONTHS = [
  { m:'апр', v:2.1 },
  { m:'май', v:1.8 },
  { m:'июн', v:2.6 },
  { m:'июл', v:3.4 },
  { m:'авг', v:4.2 },
  { m:'сен', v:3.1 },
  { m:'окт', v:2.4 },
];

const KalibBar = ({ data }) => {
  /* data: { m, S, M, L, XL } – percentages, sum=100 */
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:1, height:80 }}>
      {['S','M','L','XL'].map((k, ki) => {
        const colors = { S:'#a8d68a', M:'#7abf5c', L:'#4a8f2a', XL:'#2a6020' };
        return (
          <div key={ki} style={{
            width:'100%',
            height:`${data[k]}%`,
            background: colors[k],
            display:'flex', alignItems:'center', justifyContent:'center'
          }} title={`${k}: ${data[k]}%`}>
            {data[k] >= 14 && (
              <_Label size={10} bold color="#fff" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:9 }}>
                {data[k]}
              </_Label>
            )}
          </div>
        );
      })}
    </div>
  );
};

const KALIB_BY_MONTH = [
  { m:'апр', S:18, M:42, L:28, XL:12 },
  { m:'май', S:14, M:46, L:30, XL:10 },
  { m:'июн', S:10, M:38, L:36, XL:16 },
  { m:'июл', S: 8, M:32, L:40, XL:20 },
  { m:'авг', S:12, M:34, L:38, XL:16 },
  { m:'сен', S:16, M:40, L:32, XL:12 },
  { m:'окт', S:22, M:44, L:24, XL:10 },
];

const TabQuality = ({ admin }) => {
  const max = Math.max(...Q_MONTHS.map(p => p.v));
  const W = 560, H = 140, PAD = 28;
  const xStep = (W - PAD*2) / (Q_MONTHS.length - 1);
  const yFor = v => H - PAD - (v / 6) * (H - PAD*2);
  const points = Q_MONTHS.map((p,i) => `${PAD + i*xStep},${yFor(p.v)}`);

  return (
    <div style={{ padding:14 }}>
      <SectionTitle hint="по сезону 2025 · средние значения">Качество приёмки</SectionTitle>

      {/* KPI plates */}
      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        <div style={{ flex:1, border:'2px solid #333', borderRadius:4, background:'#fde0e0', padding:'10px 12px' }}>
          <_Label size={11} color="#555" style={{ textTransform:'uppercase', letterSpacing:0.5 }}>Средний % брака</_Label>
          <_Label size={28} bold style={{ fontFamily:'JetBrains Mono, monospace', fontSize:24, color:'#a02020' }}>
            2,8<span style={{ fontSize:14, color:'#a02020', opacity:0.7 }}>%</span>
          </_Label>
          <_Label size={11} color="#888">по 12 актам · ↓ 0,4 п.п. vs прошл. сез.</_Label>
        </div>
        <div style={{ flex:1, border:'2px solid #333', borderRadius:4, background:'#fff0c8', padding:'10px 12px' }}>
          <_Label size={11} color="#555" style={{ textTransform:'uppercase', letterSpacing:0.5 }}>Средний % нестандарта</_Label>
          <_Label size={28} bold style={{ fontFamily:'JetBrains Mono, monospace', fontSize:24, color:'#a06000' }}>
            6,9<span style={{ fontSize:14, color:'#a06000', opacity:0.7 }}>%</span>
          </_Label>
          <_Label size={11} color="#888">из них оплачено 65%</_Label>
        </div>
        <div style={{ flex:1, border:'2px solid #333', borderRadius:4, background:'#e8f0e4', padding:'10px 12px' }}>
          <_Label size={11} color="#555" style={{ textTransform:'uppercase', letterSpacing:0.5 }}>Средний % к оплате</_Label>
          <_Label size={28} bold style={{ fontFamily:'JetBrains Mono, monospace', fontSize:24, color:'#1a6b3a' }}>
            90,3<span style={{ fontSize:14, color:'#1a6b3a', opacity:0.7 }}>%</span>
          </_Label>
          <_Label size={11} color="#888">от факт. веса</_Label>
        </div>
      </div>

      {/* Line chart */}
      <div style={{ border:'2px solid #333', borderRadius:3, background:'#fff', padding:'10px 12px', marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:6 }}>
          <_Label size={13} bold>% брака по месяцам</_Label>
          <_Label size={11} color="#888" style={{ fontStyle:'italic' }}>сезон 2025 · апр – окт</_Label>
          <div style={{ flex:1 }}/>
          <_Label size={11} color="#888">пиковый месяц — авг (4,2%)</_Label>
        </div>
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ overflow:'visible' }}>
          {/* grid */}
          {[0, 2, 4, 6].map((v, i) => (
            <g key={i}>
              <line x1={PAD} y1={yFor(v)} x2={W-PAD} y2={yFor(v)} stroke="#e0e0e0" strokeDasharray="2 3"/>
              <text x={6} y={yFor(v)+4} fontSize="10" fill="#888" fontFamily="JetBrains Mono, monospace">{v}%</text>
            </g>
          ))}
          {/* polyline */}
          <polyline points={points.join(' ')} fill="none" stroke="#a02020" strokeWidth="2"/>
          {/* points + labels */}
          {Q_MONTHS.map((p,i) => {
            const x = PAD + i*xStep;
            const y = yFor(p.v);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="4" fill="#a02020"/>
                <text x={x} y={y - 8} fontSize="10" fontWeight="700" fill="#a02020" textAnchor="middle" fontFamily="JetBrains Mono, monospace">
                  {p.v.toString().replace('.', ',')}%
                </text>
                <text x={x} y={H-8} fontSize="11" fill="#555" textAnchor="middle" fontFamily="Caveat, cursive">
                  {p.m}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* By-raw table */}
      <div style={{ marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:6 }}>
          <_Label size={13} bold>Разбивка по сырью</_Label>
          <_Label size={11} color="#888" style={{ fontStyle:'italic' }}>среднее по сезону</_Label>
        </div>
        <div style={{ border:'2px solid #333', borderRadius:3, overflow:'hidden' }}>
          <div style={{ display:'flex', background:'#2a2a2a', color:'#fff' }}>
            <div style={{ flex:'0 0 180px', padding:'5px 10px', borderRight:'1px solid #555' }}>
              <_Label size={12} bold color="#fff">Сырьё</_Label>
            </div>
            <div style={{ flex:1, padding:'5px 10px', borderRight:'1px solid #555' }}>
              <_Label size={12} bold color="#fff">% брака</_Label>
            </div>
            <div style={{ flex:1, padding:'5px 10px', borderRight:'1px solid #555' }}>
              <_Label size={12} bold color="#fff">% нестандарта</_Label>
            </div>
            <div style={{ flex:1, padding:'5px 10px' }}>
              <_Label size={12} bold color="#fff">% к оплате</_Label>
            </div>
          </div>
          {Q_BY_RAW.map((r,i) => {
            const c = _RAW[r.raw] || { bg:'#eee', dot:'#999' };
            const bar = (v, color, max=12) => (
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <_Label size={12} bold style={{ fontFamily:'JetBrains Mono, monospace', fontSize:12, color, width:42 }}>
                  {v.toString().replace('.', ',')}%
                </_Label>
                <div style={{ flex:1, height:6, background:'#eee', borderRadius:2, overflow:'hidden' }}>
                  <div style={{ width:`${Math.min(100, v/max*100)}%`, height:'100%', background:color }}/>
                </div>
              </div>
            );
            return (
              <div key={i} style={{
                display:'flex', alignItems:'center',
                background: i%2===0 ? '#fafafa' : '#fff',
                borderBottom:'1px solid #eee', minHeight:32
              }}>
                <div style={{ width:4, background:c.dot, alignSelf:'stretch' }}/>
                <div style={{ flex:'0 0 176px', padding:'4px 10px', display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:10, height:10, borderRadius:10, background:c.dot }}/>
                  <_Label size={13} bold>{r.raw}</_Label>
                </div>
                <div style={{ flex:1, padding:'4px 10px' }}>{bar(r.reject, '#a02020', 6)}</div>
                <div style={{ flex:1, padding:'4px 10px' }}>{bar(r.nonStd, '#a06000', 12)}</div>
                <div style={{ flex:1, padding:'4px 10px' }}>{bar(r.payable, '#1a6b3a', 100)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calibers — only for cucumbers */}
      <div style={{ border:'2px solid #333', borderRadius:3, background:'#fff', padding:'10px 12px' }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:8 }}>
          <span style={{ width:10, height:10, borderRadius:10, background:_RAW['Огурцы'].dot, display:'inline-block', marginRight:2 }}/>
          <_Label size={13} bold>Распределение огурцов по калибрам</_Label>
          <_Label size={11} color="#888" style={{ fontStyle:'italic' }}>стек-бар по месяцам · S → M → L → XL (мм)</_Label>
          <div style={{ flex:1 }}/>
          {/* Legend */}
          {[['S','#a8d68a','60–70'],['M','#7abf5c','70–90'],['L','#4a8f2a','90–110'],['XL','#2a6020','110+']].map(([k,c,s],i) => (
            <div key={i} style={{ display:'inline-flex', alignItems:'center', gap:4, marginRight:6 }}>
              <span style={{ width:10, height:10, background:c, border:'1px solid #333', display:'inline-block' }}/>
              <_Label size={11} color="#555" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10 }}>{k} ({s})</_Label>
            </div>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:6 }}>
          {KALIB_BY_MONTH.map((row,i) => (
            <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
              <div style={{ width:'100%', height:90, border:'1px solid #ccc', background:'#f5f3ed', display:'flex', flexDirection:'column-reverse' }}>
                <KalibBar data={row}/>
              </div>
              <_Label size={11} color="#555">{row.m}</_Label>
            </div>
          ))}
        </div>
        <_Label size={11} color="#888" style={{ fontStyle:'italic', marginTop:6, display:'block' }}>
          ✦ Видно сдвиг к крупным калибрам (L/XL) в июле–августе — основной товарный пик
        </_Label>
      </div>
    </div>
  );
};

/* ===== Expose ===== */

Object.assign(window, {
  TabMain, TabContacts, TabContracts, TabHistory, TabTara, TabQuality,
});
