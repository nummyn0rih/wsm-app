/* ─────────── 8.1 NOTIFICATIONS PAGE ─────────── */
const { useState: useStateNotif } = React;

const NotifPage = () => {
  const Box = window.Box, Label = window.Label, Pill = window.Pill;

  const [tab, setTab]                = useStateNotif('action');     // action | info
  const [typeFilter, setTypeFilter]  = useStateNotif('all');
  const [onlyUnread, setOnlyUnread]  = useStateNotif(false);
  const [search, setSearch]          = useStateNotif('');
  const [selected, setSelected]      = useStateNotif({});            // id -> bool

  /* ── data ───────────────────────────────────────────── */
  const ACTION = [
    {
      id:'a1', type:'tara', icon:'📦',
      title:'Подтвердить доставку тары поставщику',
      desc:'Генералов А.С. · Бочка 200 л · 60 шт · ТТН №ТР-0418',
      meta:'Отправлено 3 дня назад · ожидает подтверждения',
      link:{ kind:'Поставщик', text:'Генералов А.С.' },
      action:'Подтвердить',
      severity:'warn',
      unread:true, time:'3 дня назад',
    },
    {
      id:'a2', type:'truck', icon:'🚛',
      title:'Привязать машину к запланированной отгрузке',
      desc:'Завтра · Цой К.Т. · Огурцы · 18 т план',
      meta:'Водитель и ТК ещё не назначены',
      link:{ kind:'Отгрузка', text:'План #2026-04-19/Цой' },
      action:'Привязать машину',
      severity:'warn',
      unread:true, time:'сегодня · 09:14',
    },
    {
      id:'a3', type:'contract', icon:'📑',
      title:'Согласовать акт переработки № 148',
      desc:'Сезон 2026 · смена 14.04 · 12 поставщиков · 142 т',
      meta:'Ждёт подписи технолога и админа',
      link:{ kind:'Акт', text:'№ 148 от 14.04.2026' },
      action:'Открыть акт',
      severity:'info',
      unread:true, time:'вчера · 18:02',
    },
    {
      id:'a4', type:'quality', icon:'📊',
      title:'Внести данные качества для отгрузки',
      desc:'Отгрузка № 412 · Ким Т. · Томаты · 16 420 кг',
      meta:'Машина приехала 2 дня назад, PDF акта прикреплён',
      link:{ kind:'Отгрузка', text:'№ 412 · 12.04.2026' },
      action:'Внести данные',
      severity:'warn',
      unread:false, time:'2 дня назад',
    },
    {
      id:'a5', type:'contract', icon:'📑',
      title:'Контракт приближается к выполнению',
      desc:'Иванов И.И. · Огурцы · сезон 2026 · 92% (276 / 300 т)',
      meta:'Прогноз перевыполнения — через 5 дней',
      link:{ kind:'Контракт', text:'К-2026/Иванов' },
      action:'Открыть',
      severity:'info',
      unread:false, time:'сегодня · 07:30',
    },
    {
      id:'a6', type:'alert', icon:'⚠',
      title:'Превышение брака по поставщику',
      desc:'Цой К.Т. · Черри · акт А-0421/02 — брак 4,3% (норма 2%)',
      meta:'Третий раз за неделю · требуется разбор',
      link:{ kind:'Поставщик', text:'Цой К.Т.' },
      action:'Открыть',
      severity:'crit',
      unread:true, time:'15 мин назад',
    },
  ];

  const INFO = [
    {
      id:'i1', type:'contract', icon:'📑',
      title:'Контракт выполнен на 90%',
      desc:'Петров В.Г. · Патиссоны · сезон 2026 · 90 / 100 т',
      link:{ kind:'Контракт', text:'К-2026/Петров' },
      unread:true, time:'сегодня · 11:08',
    },
    {
      id:'i2', type:'alert', icon:'⏳',
      title:'Нет поставок более 7 дней',
      desc:'Сидоров П.К. · последняя отгрузка 11.04 · контракт активен',
      link:{ kind:'Поставщик', text:'Сидоров П.К.' },
      unread:true, time:'вчера · 14:22',
    },
    {
      id:'i3', type:'contract', icon:'📑',
      title:'Перевыполнение контракта на 15%',
      desc:'Кузнецов Е.А. · Перец · сезон 2026 · 115 / 100 т',
      link:{ kind:'Контракт', text:'К-2026/Кузнецов' },
      unread:false, time:'2 дня назад',
    },
    {
      id:'i4', type:'quality', icon:'📊',
      title:'Высокий процент брака за неделю',
      desc:'Морозов Д.И. · в среднем 12% брака · 4 отгрузки',
      link:{ kind:'Поставщик', text:'Морозов Д.И.' },
      unread:false, time:'3 дня назад',
    },
    {
      id:'i5', type:'truck', icon:'🚛',
      title:'Машина прибыла на завод',
      desc:'Вихров П. · 18 500 кг огурцов · Байрамов · 06:42',
      link:{ kind:'Отгрузка', text:'№ 418 · сегодня' },
      unread:true, time:'30 мин назад',
    },
  ];

  const data = tab === 'action' ? ACTION : INFO;

  /* ── counters ───────────────────────────────────────── */
  const unreadAction = ACTION.filter(n => n.unread).length;
  const unreadInfo   = INFO.filter(n => n.unread).length;
  const totalUnread  = unreadAction + unreadInfo;

  /* ── filter chip definitions ────────────────────────── */
  const CHIPS = [
    { id:'all',      icon:'',   label:'Все' },
    { id:'tara',     icon:'📦', label:'Тара' },
    { id:'truck',    icon:'🚛', label:'Машины' },
    { id:'quality',  icon:'📊', label:'Качество' },
    { id:'contract', icon:'📑', label:'Контракты' },
    { id:'alert',    icon:'⚠',  label:'Алерты' },
  ];

  /* ── filter logic ───────────────────────────────────── */
  const filtered = data.filter(n => {
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    if (onlyUnread && !n.unread) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!(n.title + ' ' + n.desc).toLowerCase().includes(q)) return false;
    }
    return true;
  });

  /* ── per-type token (bg + border + icon-fg) ─────────── */
  const TYPE_TOKEN = {
    alert:    { bg:'#ffd6c2', border:'#c24a28' },
    tara:     { bg:'#d4eac2', border:'#4a8f2a' },
    truck:    { bg:'#c2d4e8', border:'#1a4a8a' },
    quality:  { bg:'#fff4a8', border:'#c49a00' },
    contract: { bg:'#e8d4c2', border:'#a06030' },
  };

  /* ── action-button color per severity ───────────────── */
  const SEV_BTN = {
    crit: { bg:'#c24a28', fg:'#fff' },
    warn: { bg:'#1a6b3a', fg:'#fff' },
    info: { bg:'#1a4a8a', fg:'#fff' },
  };

  /* ── select helpers ─────────────────────────────────── */
  const someSelected = Object.values(selected).some(Boolean);
  const allSelected  = filtered.length > 0 && filtered.every(n => selected[n.id]);
  const toggleAll = () => {
    const next = {};
    if (!allSelected) filtered.forEach(n => { next[n.id] = true; });
    setSelected(next);
  };

  return (
    <div style={{ padding:18, fontFamily:'Caveat' }}>
      {/* ── 1. HEADER ─────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'baseline', gap:12, marginBottom:14 }}>
        <Label size={28} bold color="#222">🔔 Уведомления</Label>
        <Pill color="#d33030" textColor="#fff" size={13}>{totalUnread} непрочитанных</Pill>
        <div style={{ flex:1 }} />
        <Label size={12} color="#888" style={{ fontStyle:'italic' }}>
          обновлено · только что
        </Label>
      </div>

      {/* ── 2. TOOLBAR ────────────────────────────────── */}
      <div style={{
        background:'#fff', border:'2px solid #333', borderRadius:4,
        padding:'10px 12px', marginBottom:14,
        boxShadow:'3px 3px 0 rgba(0,0,0,0.08)'
      }}>
        {/* row 1 — tabs + bulk actions */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <Tab
            active={tab === 'action'}
            color="#d33030"
            label="Требуют действия"
            count={unreadAction}
            onClick={() => { setTab('action'); setSelected({}); }}
          />
          <Tab
            active={tab === 'info'}
            color="#1a4a8a"
            label="Информационные"
            count={unreadInfo}
            onClick={() => { setTab('info'); setSelected({}); }}
          />

          <div style={{ flex:1 }} />

          {someSelected && (
            <>
              <Pill color="#fff4a8" textColor="#7a5a00" size={12}>
                выбрано: {Object.values(selected).filter(Boolean).length}
              </Pill>
              <ToolBtn label="✓ Прочитать" />
              <ToolBtn label="📥 Архив" />
              <div style={{ width:1, height:22, background:'#ddd', margin:'0 4px' }} />
            </>
          )}

          <ToolBtn label="✓✓ Отметить все прочитанными" />
          <ToolBtn label="📥 Архивировать прочитанные" />
        </div>

        {/* row 2 — filter chips */}
        <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom:10 }}>
          <Label size={12} color="#888" style={{ marginRight:2 }}>Тип:</Label>
          {CHIPS.map(c => (
            <FilterChip
              key={c.id}
              icon={c.icon}
              label={c.label}
              active={typeFilter === c.id}
              token={c.id === 'all' ? null : TYPE_TOKEN[c.id]}
              onClick={() => setTypeFilter(c.id)}
            />
          ))}
        </div>

        {/* row 3 — toggle + search */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <SegToggle
            left="Все"
            right="Только непрочит."
            active={onlyUnread ? 'right' : 'left'}
            onChange={(v) => setOnlyUnread(v === 'right')}
          />

          <div style={{
            flex:1, display:'flex', alignItems:'center', gap:6,
            border:'1.5px solid #888', borderRadius:3, padding:'3px 8px',
            background:'#fffdf2', maxWidth:380
          }}>
            <Label size={13} color="#888">🔍</Label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по тексту уведомления…"
              style={{
                flex:1, border:'none', outline:'none', background:'transparent',
                fontFamily:'Caveat, cursive', fontSize:14, color:'#222'
              }}
            />
            {search && (
              <span onClick={() => setSearch('')} style={{ cursor:'pointer', color:'#888' }}>✕</span>
            )}
          </div>

          <div style={{ flex:1 }} />

          <Label size={11} color="#888" style={{ fontStyle:'italic' }}>
            показано: {filtered.length} из {data.length}
          </Label>
        </div>
      </div>

      {/* ── 3. LIST ───────────────────────────────────── */}
      <div style={{
        background:'#fff', border:'2px solid #333', borderRadius:4,
        boxShadow:'3px 3px 0 rgba(0,0,0,0.08)', overflow:'hidden'
      }}>
        {/* list header — select-all */}
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          padding:'6px 14px', borderBottom:'1.5px solid #ccc',
          background:'#f5f3ed'
        }}>
          <Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} onClick={toggleAll} />
          <Label size={12} color="#666">
            {someSelected ? 'Выбрано для массового действия' : 'Выбрать всё видимое'}
          </Label>
          <div style={{ flex:1 }} />
          <Label size={11} color="#888" style={{ fontStyle:'italic' }}>
            Сортировка: новые сверху ▾
          </Label>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding:'40px 20px', textAlign:'center' }}>
            <Label size={16} color="#888">⬚ Ничего не найдено</Label>
            <Label size={12} color="#888" style={{ marginTop:6, fontStyle:'italic' }}>
              Сбросьте фильтры или измените запрос
            </Label>
          </div>
        )}

        {filtered.map(n => (
          <NotifCard
            key={n.id}
            n={n}
            tab={tab}
            token={TYPE_TOKEN[n.type]}
            sevBtn={SEV_BTN[n.severity || 'info']}
            checked={!!selected[n.id]}
            onCheck={() => setSelected({ ...selected, [n.id]: !selected[n.id] })}
          />
        ))}
      </div>
    </div>
  );
};

/* ────── small parts ────── */

const Tab = ({ active, color, label, count, onClick }) => (
  <div
    onClick={onClick}
    style={{
      display:'flex', alignItems:'center', gap:6,
      padding:'5px 12px', cursor:'pointer',
      borderRadius:3,
      border: active ? `2px solid ${color}` : '2px solid transparent',
      background: active ? '#fff' : 'transparent',
      boxShadow: active ? '2px 2px 0 rgba(0,0,0,0.08)' : 'none',
    }}
  >
    <window.Label size={14} bold color={active ? color : '#666'}>{label}</window.Label>
    <window.Pill
      color={active ? color : '#bbb'}
      textColor="#fff" size={11}
    >{count}</window.Pill>
  </div>
);

const ToolBtn = ({ label, onClick }) => (
  <div
    onClick={onClick}
    style={{
      padding:'4px 10px', cursor:'pointer',
      background:'#f5f3ed', border:'1.5px solid #888', borderRadius:3,
    }}
  >
    <window.Label size={12} bold color="#444">{label}</window.Label>
  </div>
);

const FilterChip = ({ icon, label, active, token, onClick }) => (
  <div
    onClick={onClick}
    style={{
      display:'inline-flex', alignItems:'center', gap:4,
      padding:'2px 10px', cursor:'pointer',
      background: active
        ? (token ? token.bg : '#222')
        : '#fff',
      border: `1.5px solid ${active ? (token ? token.border : '#222') : '#aaa'}`,
      borderRadius: 20,
      fontFamily:'Caveat', fontSize:13,
      color: active ? (token ? '#222' : '#fff') : '#555',
      fontWeight: active ? 700 : 400,
    }}
  >
    {icon && <span>{icon}</span>}
    <span>{label}</span>
  </div>
);

const SegToggle = ({ left, right, active, onChange }) => (
  <div style={{
    display:'inline-flex', border:'1.5px solid #888', borderRadius:3,
    overflow:'hidden', background:'#fff'
  }}>
    <div
      onClick={() => onChange('left')}
      style={{
        padding:'4px 10px', cursor:'pointer',
        background: active === 'left' ? '#1f1f1f' : 'transparent',
      }}
    >
      <window.Label size={12} bold color={active === 'left' ? '#fff' : '#444'}>{left}</window.Label>
    </div>
    <div
      onClick={() => onChange('right')}
      style={{
        padding:'4px 10px', cursor:'pointer',
        background: active === 'right' ? '#1f1f1f' : 'transparent',
        borderLeft:'1.5px solid #888',
      }}
    >
      <window.Label size={12} bold color={active === 'right' ? '#fff' : '#444'}>{right}</window.Label>
    </div>
  </div>
);

const Checkbox = ({ checked, indeterminate, onClick }) => (
  <div
    onClick={onClick}
    style={{
      width:16, height:16, border:'1.5px solid #555', borderRadius:2,
      background: checked || indeterminate ? '#1a6b3a' : '#fff',
      display:'flex', alignItems:'center', justifyContent:'center',
      cursor:'pointer', flexShrink:0
    }}
  >
    {checked && <span style={{ color:'#fff', fontSize:11, lineHeight:1, fontWeight:900 }}>✓</span>}
    {indeterminate && !checked && (
      <div style={{ width:8, height:2, background:'#fff' }} />
    )}
  </div>
);

/* ────── notification card ────── */

const NotifCard = ({ n, tab, token, sevBtn, checked, onCheck }) => {
  const rowBg = n.unread ? '#fffbe8' : '#fff';
  // "warn" rows in action tab get the planned-row striped background like in main table
  const stripe = (tab === 'action' && (n.severity === 'warn'))
    ? 'repeating-linear-gradient(-45deg,#fffbe8,#fffbe8 6px,#fff4cc 6px,#fff4cc 12px)'
    : null;

  return (
    <div style={{
      display:'flex', alignItems:'stretch',
      background: stripe || rowBg,
      borderBottom:'1px dashed #ddd',
      position:'relative',
    }}>
      {/* unread red dot */}
      <div style={{
        width: 14, flexShrink:0,
        display:'flex', alignItems:'flex-start', justifyContent:'center',
        paddingTop:18,
      }}>
        {n.unread && (
          <div style={{
            width:8, height:8, borderRadius:8,
            background:'#d33030', border:'1.5px solid #8a1010'
          }} />
        )}
      </div>

      {/* checkbox */}
      <div style={{ padding:'14px 8px 8px 0', flexShrink:0 }}>
        <Checkbox checked={checked} onClick={onCheck} />
      </div>

      {/* type icon */}
      <div style={{ padding:'10px 10px 8px 0', flexShrink:0 }}>
        <div style={{
          width:38, height:38, borderRadius:'50%',
          background: token.bg, border:`2px solid ${token.border}`,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <span style={{ fontSize:18, lineHeight:1 }}>{n.icon}</span>
        </div>
      </div>

      {/* body */}
      <div style={{ flex:1, minWidth:0, padding:'10px 14px 10px 0' }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
          <window.Label size={16} bold color="#222" style={{ lineHeight:1.2 }}>
            {n.title}
          </window.Label>
          {n.severity === 'crit' && (
            <window.Pill color="#c24a28" textColor="#fff" size={10}>критично</window.Pill>
          )}
        </div>

        <window.Label size={14} color="#444" style={{ marginTop:2, lineHeight:1.25 }}>
          {n.desc}
        </window.Label>

        {n.meta && (
          <window.Label size={12} color="#888" style={{ marginTop:3, fontStyle:'italic' }}>
            {n.meta}
          </window.Label>
        )}

        {/* link to related object */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:6, flexWrap:'wrap' }}>
          <window.Label size={11} color="#888">связано:</window.Label>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:5,
            padding:'1px 8px', background:'#f5f3ed',
            border:'1px dashed #888', borderRadius:3,
            cursor:'pointer'
          }}>
            <window.Label size={11} color="#888">{n.link.kind}:</window.Label>
            <window.Label size={12} bold color="#1a4a8a" style={{ textDecoration:'underline', textDecorationStyle:'dotted' }}>
              {n.link.text}
            </window.Label>
            <window.Label size={11} color="#1a4a8a">↗</window.Label>
          </div>
          <window.Label size={11} color="#aaa">·</window.Label>
          <window.Label size={11} color="#888" style={{ fontStyle:'italic' }}>{n.time}</window.Label>
        </div>
      </div>

      {/* right rail — action button or quick actions */}
      <div style={{
        display:'flex', flexDirection:'column', alignItems:'flex-end',
        gap:6, padding:'12px 14px 10px 0', flexShrink:0, minWidth:170
      }}>
        {tab === 'action' && n.action && (
          <div style={{
            padding:'6px 14px', cursor:'pointer',
            background: sevBtn.bg, color: sevBtn.fg,
            border:'2px solid #222', borderRadius:3,
            boxShadow:'2px 2px 0 rgba(0,0,0,0.18)'
          }}>
            <window.Label size={13} bold color={sevBtn.fg}>{n.action} →</window.Label>
          </div>
        )}
        {tab === 'info' && (
          <div style={{
            padding:'5px 12px', cursor:'pointer',
            background:'#fff', border:'1.5px solid #888', borderRadius:3,
          }}>
            <window.Label size={12} bold color="#444">Открыть →</window.Label>
          </div>
        )}
        <div style={{ display:'flex', gap:4 }}>
          <IconBtn title={n.unread ? 'Отметить прочитанным' : 'Отметить непрочитанным'}>
            {n.unread ? '○' : '●'}
          </IconBtn>
          <IconBtn title="Архивировать">📥</IconBtn>
          <IconBtn title="Отложить">⏱</IconBtn>
        </div>
      </div>
    </div>
  );
};

const IconBtn = ({ children, title }) => (
  <div
    title={title}
    style={{
      width:24, height:24, borderRadius:3, cursor:'pointer',
      border:'1px solid #bbb', background:'#fff',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:12, color:'#666'
    }}
  >{children}</div>
);

/* ────── MOBILE 8.2 ────── */

const NotifMobile = () => {
  const Box = window.Box, Label = window.Label, Pill = window.Pill;
  const [tab, setTab]     = useStateNotif('action');
  const [filterOpen, setFilterOpen] = useStateNotif(false);
  const [typeFilter, setTypeFilter] = useStateNotif('all');
  const [onlyUnread, setOnlyUnread] = useStateNotif(false);

  const ACTION = [
    { id:'a1', type:'tara',     icon:'📦', title:'Подтвердить доставку тары', desc:'Генералов · Бочка 200 л · 60 шт', action:'Подтвердить',   sev:'warn', unread:true,  time:'3 дн' },
    { id:'a2', type:'truck',    icon:'🚛', title:'Привязать машину',          desc:'Завтра · Цой · Огурцы 18 т',       action:'Привязать',      sev:'warn', unread:true,  time:'09:14' },
    { id:'a3', type:'contract', icon:'📑', title:'Согласовать акт № 148',     desc:'Сезон 2026 · 14.04 · 142 т',       action:'Открыть',        sev:'info', unread:true,  time:'вчера' },
    { id:'a4', type:'quality',  icon:'📊', title:'Внести данные качества',     desc:'№ 412 · Ким · Томаты 16 420 кг',   action:'Внести данные',  sev:'warn', unread:false, time:'2 дн'  },
    { id:'a5', type:'contract', icon:'📑', title:'Контракт 92% выполнения',   desc:'Иванов · Огурцы · 276/300 т',      action:'Открыть',        sev:'info', unread:false, time:'07:30' },
  ];
  const INFO = [
    { id:'i1', type:'contract', icon:'📑', title:'Контракт выполнен на 90%',  desc:'Петров · Патиссоны · 90/100 т',    unread:true,  time:'11:08' },
    { id:'i2', type:'alert',    icon:'⏳', title:'Нет поставок > 7 дней',     desc:'Сидоров · последняя 11.04',         unread:true,  time:'вчера' },
    { id:'i3', type:'contract', icon:'📑', title:'Перевыполнение на 15%',    desc:'Кузнецов · Перец · 115/100 т',     unread:false, time:'2 дн'  },
    { id:'i4', type:'quality',  icon:'📊', title:'Высокий % брака',           desc:'Морозов · 12% · 4 отгрузки',        unread:false, time:'3 дн'  },
  ];
  const data = tab === 'action' ? ACTION : INFO;
  const filtered = data.filter(n => {
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    if (onlyUnread && !n.unread) return false;
    return true;
  });

  const TYPE_TOKEN = {
    alert:    { bg:'#ffd6c2', border:'#c24a28' },
    tara:     { bg:'#d4eac2', border:'#4a8f2a' },
    truck:    { bg:'#c2d4e8', border:'#1a4a8a' },
    quality:  { bg:'#fff4a8', border:'#c49a00' },
    contract: { bg:'#e8d4c2', border:'#a06030' },
  };
  const SEV_BTN = {
    warn: { bg:'#1a6b3a', fg:'#fff' },
    info: { bg:'#1a4a8a', fg:'#fff' },
    crit: { bg:'#c24a28', fg:'#fff' },
  };

  const unreadAction = ACTION.filter(n => n.unread).length;
  const unreadInfo   = INFO.filter(n => n.unread).length;

  const CHIPS = [
    { id:'all',      label:'Все',       icon:'' },
    { id:'tara',     label:'Тара',      icon:'📦' },
    { id:'truck',    label:'Машины',    icon:'🚛' },
    { id:'quality',  label:'Качество',  icon:'📊' },
    { id:'contract', label:'Контракты', icon:'📑' },
    { id:'alert',    label:'Алерты',    icon:'⚠' },
  ];

  return (
    <window.AndroidDevice width={380} height={760}>
      <div style={{ background:'#f0ede8', minHeight:'100%', fontFamily:'Caveat' }}>
        {/* Header */}
        <div style={{ padding:'10px 12px 8px', background:'#1f1f1f', color:'#fff' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Label size={20} bold color="#fff">🔔 Уведомления</Label>
            <Pill color="#d33030" textColor="#fff" size={11}>{unreadAction + unreadInfo}</Pill>
            <div style={{ flex:1 }} />
            <div
              onClick={() => setFilterOpen(!filterOpen)}
              style={{
                width:32, height:32, borderRadius:3,
                border:`1.5px solid ${filterOpen ? '#7fd99c' : '#555'}`,
                background: filterOpen ? '#1a6b3a' : '#2a2a2a',
                display:'flex', alignItems:'center', justifyContent:'center'
              }}
            >
              <span style={{ fontSize:14 }}>⚙</span>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:6, marginTop:10 }}>
            <div
              onClick={() => setTab('action')}
              style={{
                flex:1, padding:'6px 8px', textAlign:'center',
                background: tab === 'action' ? '#d33030' : '#2a2a2a',
                border:`1.5px solid ${tab === 'action' ? '#ff8866' : '#555'}`,
                borderRadius:3, display:'flex', alignItems:'center', justifyContent:'center', gap:6
              }}
            >
              <Label size={13} bold color="#fff">Требуют действия</Label>
              <Pill color={tab === 'action' ? '#fff' : '#bbb'} textColor={tab === 'action' ? '#d33030' : '#fff'} size={10}>{unreadAction}</Pill>
            </div>
            <div
              onClick={() => setTab('info')}
              style={{
                flex:1, padding:'6px 8px', textAlign:'center',
                background: tab === 'info' ? '#1a4a8a' : '#2a2a2a',
                border:`1.5px solid ${tab === 'info' ? '#7fb0ff' : '#555'}`,
                borderRadius:3, display:'flex', alignItems:'center', justifyContent:'center', gap:6
              }}
            >
              <Label size={13} bold color="#fff">Информация</Label>
              <Pill color={tab === 'info' ? '#fff' : '#bbb'} textColor={tab === 'info' ? '#1a4a8a' : '#fff'} size={10}>{unreadInfo}</Pill>
            </div>
          </div>
        </div>

        {/* Collapsible filter sheet */}
        {filterOpen && (
          <div style={{
            background:'#fff', borderBottom:'2px solid #333',
            padding:'10px 12px'
          }}>
            <Label size={12} color="#888" style={{ marginBottom:6 }}>Тип:</Label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
              {CHIPS.map(c => (
                <FilterChip
                  key={c.id}
                  icon={c.icon}
                  label={c.label}
                  active={typeFilter === c.id}
                  token={c.id === 'all' ? null : TYPE_TOKEN[c.id]}
                  onClick={() => setTypeFilter(c.id)}
                />
              ))}
            </div>
            <SegToggle
              left="Все"
              right="Только непрочит."
              active={onlyUnread ? 'right' : 'left'}
              onChange={(v) => setOnlyUnread(v === 'right')}
            />
            <div style={{ display:'flex', gap:6, marginTop:10 }}>
              <ToolBtn label="✓✓ Прочитать всё" />
              <ToolBtn label="📥 Архив прочит." />
            </div>
          </div>
        )}

        {/* List */}
        <div style={{ padding:'8px' }}>
          {filtered.map(n => (
            <div
              key={n.id}
              style={{
                background: n.unread ? '#fffbe8' : '#fff',
                border:'1.5px solid #333', borderRadius:4,
                padding:'8px 10px', marginBottom:8,
                boxShadow:'2px 2px 0 rgba(0,0,0,0.08)',
                position:'relative',
                ...(tab === 'action' && n.sev === 'warn' && {
                  background: 'repeating-linear-gradient(-45deg,#fffbe8,#fffbe8 6px,#fff4cc 6px,#fff4cc 12px)'
                })
              }}
            >
              {n.unread && (
                <div style={{
                  position:'absolute', top:8, left:-4,
                  width:8, height:8, borderRadius:8,
                  background:'#d33030', border:'1.5px solid #8a1010'
                }} />
              )}
              <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                <div style={{
                  width:30, height:30, borderRadius:'50%',
                  background: TYPE_TOKEN[n.type].bg,
                  border:`1.5px solid ${TYPE_TOKEN[n.type].border}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  flexShrink:0
                }}>
                  <span style={{ fontSize:14 }}>{n.icon}</span>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <Label size={14} bold color="#222" style={{ lineHeight:1.2 }}>{n.title}</Label>
                  <Label size={12} color="#555" style={{ marginTop:2, lineHeight:1.2 }}>{n.desc}</Label>
                  <Label size={10} color="#999" style={{ marginTop:3, fontStyle:'italic' }}>{n.time}</Label>
                </div>
              </div>
              {tab === 'action' && n.action && (
                <div style={{
                  marginTop:8, padding:'6px 0', textAlign:'center',
                  background: SEV_BTN[n.sev].bg, color: SEV_BTN[n.sev].fg,
                  border:'1.5px solid #222', borderRadius:3,
                }}>
                  <Label size={13} bold color={SEV_BTN[n.sev].fg}>{n.action} →</Label>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </window.AndroidDevice>
  );
};

window.NotifPage   = NotifPage;
window.NotifMobile = NotifMobile;
