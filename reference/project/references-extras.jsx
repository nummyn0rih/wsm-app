/* ─────────── REFERENCES EXTRAS ─────────────────────────────────────
   Новые / расширенные справочники:
   • Водители (расширенный) — поиск ФИО+тел, фильтр по ТК, инфо
   • Сезоны
   • Виды тары
   • Ингредиенты
   • Поставщики · вкладка «Средний вес рейса по сырью»
   • Универсальная модалка редактирования (только для Админа)
   ──────────────────────────────────────────────────────────────────── */

const { useState: useStateRX } = React;
const Box2   = window.Box;
const Label2 = window.Label;
const Pill2  = window.Pill;
const HR2    = window.HR;
const RAW    = window.RAW_COLORS;

/* ===== shared atoms ===== */

const RoleBadge = ({ admin }) => (
  admin
    ? <Pill2 color="#fff0c8" textColor="#a06000" size={11}>👑 Только Админ</Pill2>
    : <Pill2 color="#e8f0e4" textColor="#1a6b3a" size={11}>👁 Просмотр всем</Pill2>
);

const TextField2 = ({ label, value, placeholder, hint, mono, multiline, h, locked }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:2 }}>
      <Label2 size={11} bold color="#555" style={{ textTransform:'uppercase', letterSpacing:0.5 }}>{label}</Label2>
      {hint && <Label2 size={10} color="#999">{hint}</Label2>}
      {locked && <Label2 size={10} color="#a06000">🔒 read-only</Label2>}
    </div>
    <div style={{
      border:'1.5px solid #999', borderRadius:3,
      padding: multiline ? '5px 8px' : '4px 8px',
      background: locked ? '#f5f3ef' : '#fff',
      minHeight: multiline ? (h || 70) : 24,
      whiteSpace:'pre-wrap',
      fontFamily: mono ? 'JetBrains Mono, monospace' : 'Caveat, cursive',
      fontSize: mono ? 11 : 13,
      color: value ? (locked ? '#666' : '#222') : '#bbb',
      lineHeight: 1.35,
    }}>
      {value || placeholder || '—'}
    </div>
  </div>
);

const SelectField2 = ({ label, value, hint }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:2 }}>
      <Label2 size={11} bold color="#555" style={{ textTransform:'uppercase', letterSpacing:0.5 }}>{label}</Label2>
      {hint && <Label2 size={10} color="#999">{hint}</Label2>}
    </div>
    <div style={{
      border:'1.5px solid #999', borderRadius:3,
      padding:'4px 8px', background:'#fff', minHeight:24,
      display:'flex', alignItems:'center'
    }}>
      <Label2 size={13} bold>{value}</Label2>
      <div style={{ flex:1 }}/>
      <Label2 size={11} color="#999">▾</Label2>
    </div>
  </div>
);

/* ===========================================================
   3.1  ВОДИТЕЛИ — расширенный справочник
   =========================================================== */

const DRIVERS_FULL = [
  { fio:'Кобец Сергей Васильевич', phone:'+7 927 119 61 51', tk:'АвтоЛогист',
    info:'DAF, В383НЕ_164, АН6222_64\nсерия: 63 05 №804684, выдан 30.03.2006\nОВД Екатериновского р-на Саратовской обл.' },
  { fio:'Вихров Павел Игоревич',   phone:'+7 900 123-45-67', tk:'ИП Фастов',
    info:'Volvo FH · К 245 ОР 77\nПаспорт 4512 №876342, выдан УФМС г. Москва\nСтаж: 12 лет · рефрижератор, тент' },
  { fio:'Мартыно Виктор Олегович', phone:'+7 901 234-56-78', tk:'ИП Рябов',
    info:'MAN TGX · О 891 РТ 50\nПаспорт 4513 №129084\nЛюбит догрузы, гибкий график' },
  { fio:'Кузнецов Алексей Петрович', phone:'+7 902 345-67-89', tk:'ТК Авто',
    info:'Scania R450 · Е 712 ВК 77\nТягач + полуприцеп 82 м³\nПаспорт 4514 №442910' },
  { fio:'Ахмедов Рустам Шамилевич', phone:'+7 903 456-78-90', tk:'ТК Авто',
    info:'DAF XF · М 045 НА 50\nПаспорт 4515 №776218\nПо предзаказу, бочки/IBC' },
  { fio:'Гриненко Кирилл Андреевич', phone:'+7 904 567-89-01', tk:'ИП Кузн.',
    info:'Renault T · А 318 СН 77\nПаспорт 4516 №334721\nИП Кузн., только томатная группа' },
  { fio:'Шахматов Дмитрий Сергеевич', phone:'+7 905 678-90-12', tk:'ТК Авто',
    info:'Iveco Stralis · Х 902 ЕМ 50\nПаспорт 4517 №118650\nЧасто работает с перцем/баклажанами' },
  { fio:'Петросян Армен Вазгенович', phone:'+7 906 789-01-23', tk:'АвтоЛогист',
    info:'MAN TGS · Т 558 КН 77\nПаспорт 4518 №998112' },
];

const TK_LIST = ['ИП Фастов','ИП Рябов','ТК Авто','ИП Кузн.','АвтоЛогист'];

const DriversReference = ({ admin, openCard, openEdit }) => {
  const [q, setQ] = useStateRX('');
  const [tkFilter, setTkFilter] = useStateRX('Все');
  const list = DRIVERS_FULL.filter(d => {
    const text = (d.fio + ' ' + d.phone).toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (tkFilter !== 'Все' && d.tk !== tkFilter) return false;
    return true;
  });
  return (
    <div style={{ padding:12 }}>
      {/* Header bar */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, flexWrap:'wrap' }}>
        <Label2 size={18} bold>👤 Справочник «Водители»</Label2>
        <RoleBadge admin={admin} />
        <div style={{ flex:1 }}/>
        {admin && (
          <Box2 className="sk-gray"
            style={{ padding:'5px 14px', cursor:'pointer', background:'#1a6b3a', borderColor:'#0d4020', display:'flex', alignItems:'center', gap:5 }}
            onClick={() => openEdit && openEdit(null)}>
            <span style={{ color:'#fff', fontSize:14 }}>＋</span>
            <Label2 size={13} bold color="#fff">Новый водитель</Label2>
          </Box2>
        )}
      </div>

      {/* Search + filter */}
      <div style={{
        display:'flex', gap:8, marginBottom:10, padding:'7px 10px',
        background:'#f5f3ed', border:'1.5px solid #ccc', borderRadius:3,
        alignItems:'center', flexWrap:'wrap'
      }}>
        <div style={{
          display:'flex', alignItems:'center', gap:5, flex:'1 1 280px',
          background:'#fff', border:'1.5px solid #999', borderRadius:3, padding:'3px 8px'
        }}>
          <span style={{ fontSize:13 }}>🔍</span>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Поиск по ФИО или телефону…"
            style={{
              flex:1, border:'none', outline:'none', background:'transparent',
              fontFamily:'Caveat, cursive', fontSize:14, color:'#222'
            }}
          />
          {q && <span onClick={() => setQ('')} style={{ cursor:'pointer', color:'#999', fontSize:13 }}>✕</span>}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <Label2 size={12} bold color="#555">ТК:</Label2>
          {['Все', ...TK_LIST].map(tk => (
            <div key={tk}
              onClick={() => setTkFilter(tk)}
              style={{
                padding:'2px 9px', cursor:'pointer', borderRadius:20,
                border:'1.5px solid #333',
                background: tkFilter === tk ? '#1a6b3a' : '#fff',
              }}>
              <Label2 size={11} bold color={tkFilter === tk ? '#fff' : '#333'}>{tk}</Label2>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ border:'2px solid #333', borderRadius:3, overflow:'hidden', background:'#fff' }}>
        <div style={{ display:'flex', background:'#2a2a2a', color:'#fff', padding:'5px 8px' }}>
          <Label2 size={12} bold color="#fff" style={{ flex:'0 0 230px' }}>ФИО</Label2>
          <Label2 size={12} bold color="#fff" style={{ flex:'0 0 150px' }}>Телефон</Label2>
          <Label2 size={12} bold color="#fff" style={{ flex:'0 0 130px' }}>ТК</Label2>
          <Label2 size={12} bold color="#fff" style={{ flex:1 }}>Инфо (1-я строка)</Label2>
          <Label2 size={12} bold color="#fff" style={{ width:80, textAlign:'right' }}>Действия</Label2>
        </div>
        <div className="wsm-scroll" style={{ maxHeight:440, overflowY:'auto' }}>
          {list.map((d, i) => {
            const firstLine = (d.info || '').split('\n')[0];
            return (
              <div key={i} style={{
                display:'flex', alignItems:'center',
                padding:'5px 8px',
                background: i % 2 === 0 ? '#fafafa' : '#fff',
                borderBottom:'1px solid #eee', minHeight:32
              }}>
                <div style={{ flex:'0 0 230px', display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:22, height:22, borderRadius:'50%', background:'#e0e0d8', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Label2 size={11} bold color="#555">{d.fio.split(' ').map(w=>w[0]).slice(0,2).join('')}</Label2>
                  </div>
                  <Label2 size={13} bold style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.fio}</Label2>
                </div>
                <Label2 size={12} color="#1a4a8a" style={{ flex:'0 0 150px', fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>{d.phone}</Label2>
                <div style={{ flex:'0 0 130px' }}>
                  <Pill2 color="#e8e5df" size={11}>🚛 {d.tk}</Pill2>
                </div>
                <Label2 size={11} color="#777" style={{ flex:1, fontStyle:'italic', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', paddingRight:8 }}>{firstLine}</Label2>
                <div style={{ width:80, display:'flex', justifyContent:'flex-end', gap:6 }}>
                  <span title="Открыть карточку"
                    onClick={() => openCard && openCard(d)}
                    style={{ cursor:'pointer', fontSize:14 }}>👁</span>
                  {admin
                    ? <span title="Редактировать"
                        onClick={() => openEdit && openEdit(d)}
                        style={{ cursor:'pointer', fontSize:14 }}>✎</span>
                    : <span title="Редактирование недоступно" style={{ cursor:'not-allowed', fontSize:14, opacity:0.3 }}>✎</span>}
                </div>
              </div>
            );
          })}
          {list.length === 0 && (
            <div style={{ padding:'20px', textAlign:'center' }}>
              <Label2 size={13} color="#999">Ничего не найдено</Label2>
            </div>
          )}
        </div>
        <div style={{ padding:'5px 10px', background:'#f5f3ed', borderTop:'1px solid #ccc', display:'flex', alignItems:'center', gap:8 }}>
          <Label2 size={11} color="#666">Найдено: <b>{list.length}</b> из {DRIVERS_FULL.length}</Label2>
          <div style={{ flex:1 }}/>
          {!admin && <Label2 size={10} color="#a06000" style={{ fontStyle:'italic' }}>Редактирование заблокировано — нужны права Админа</Label2>}
        </div>
      </div>

      <div style={{ marginTop:10, padding:'8px 12px', background:'#fffbe8', border:'1.5px dashed #e09a20', borderRadius:4 }}>
        <Label2 size={13} color="#b06000">
          ✦ Поля: ФИО · Телефон · ТК (select) · Инфо (textarea — свободный текст: марка авто, госномер, паспорт) · Поиск по ФИО+телефону · Фильтр по ТК
        </Label2>
      </div>
    </div>
  );
};

/* ===== Driver edit modal (admin only) ===== */
const DriverEditForm = ({ driver }) => (
  <div style={{
    border:'2.5px solid #333', borderRadius:6, background:'#fff',
    boxShadow:'4px 4px 0 #33333340', width:520
  }}>
    <div style={{ background:'#1a6b3a', padding:'8px 14px', display:'flex', alignItems:'center', gap:8 }}>
      <Label2 size={16} bold color="#fff">{driver ? '✎ Редактирование водителя' : '＋ Новый водитель'}</Label2>
      <Pill2 color="#fff0c8" textColor="#a06000" size={11}>👑 Только Админ</Pill2>
      <div style={{ flex:1 }}/>
      <Label2 size={18} color="#aed6be" style={{ cursor:'pointer' }}>✕</Label2>
    </div>
    <div style={{ padding:'12px 16px' }}>
      <TextField2
        label="ФИО *"
        value={driver?.fio || ''}
        placeholder="Фамилия Имя Отчество"
      />
      <div style={{ display:'flex', gap:10 }}>
        <div style={{ flex:1 }}>
          <TextField2
            label="Телефон *"
            value={driver?.phone || ''}
            placeholder="+7 ___ ___ __ __"
            mono
          />
        </div>
        <div style={{ flex:1 }}>
          <SelectField2 label="ТК *" value={driver?.tk || 'АвтоЛогист'} hint="из справочника ТК" />
        </div>
      </div>
      <TextField2
        label="Инфо"
        hint="свободный текст: марка авто, госномер, паспорт и т.п."
        value={driver?.info || ''}
        placeholder={'DAF, В383НЕ_164, АН6222_64\nсерия: 63 05 №804684, выдан 30.03.2006\nОВД Екатериновского р-на Саратовской обл.'}
        mono multiline h={110}
      />

      <HR2 my={10} />
      <div style={{ display:'flex', gap:8, justifyContent:'space-between', alignItems:'center' }}>
        {driver
          ? <Box2 className="sk-gray" style={{ padding:'5px 12px', cursor:'pointer', background:'#fff0e8', borderColor:'#c33' }}>
              <Label2 size={12} bold color="#c33">🗑 В архив</Label2>
            </Box2>
          : <div/>}
        <div style={{ display:'flex', gap:8 }}>
          <Box2 className="sk-gray" style={{ padding:'5px 16px', cursor:'pointer' }}>
            <Label2 size={13}>Отмена</Label2>
          </Box2>
          <div style={{
            background:'#1a6b3a', border:'2px solid #333',
            padding:'5px 16px', borderRadius:3, cursor:'pointer'
          }}>
            <Label2 size={13} bold color="#fff">✓ Сохранить</Label2>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ===========================================================
   3.2  СПРАВОЧНИК «СЕЗОНЫ»
   =========================================================== */

const SEASONS = [
  { name:'Сезон 2024/2025', current:false, range:'июн 2024 – май 2025', shipments:412, kg:2_184_500, archived:true },
  { name:'Сезон 2025/2026', current:true,  range:'июн 2025 – май 2026', shipments:298, kg:1_602_200, archived:false },
  { name:'Сезон 2026/2027', current:false, range:'июн 2026 – май 2027', shipments:0,   kg:0,         archived:false },
];

const SeasonsReference = ({ admin }) => (
  <div style={{ padding:12 }}>
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, flexWrap:'wrap' }}>
      <Label2 size={18} bold>📅 Справочник «Сезоны»</Label2>
      <RoleBadge admin={admin} />
      <div style={{ flex:1 }}/>
      {admin && (
        <Box2 className="sk-gray" style={{ padding:'5px 14px', cursor:'pointer', background:'#1a6b3a', borderColor:'#0d4020' }}>
          <Label2 size={13} bold color="#fff">＋ Новый сезон</Label2>
        </Box2>
      )}
    </div>

    <div style={{ border:'2px solid #333', borderRadius:3, background:'#fff', overflow:'hidden' }}>
      <div style={{ display:'flex', background:'#2a2a2a', color:'#fff', padding:'5px 10px' }}>
        <Label2 size={12} bold color="#fff" style={{ flex:'0 0 36px' }}>●</Label2>
        <Label2 size={12} bold color="#fff" style={{ flex:'0 0 220px' }}>Название</Label2>
        <Label2 size={12} bold color="#fff" style={{ flex:'0 0 180px' }}>Период</Label2>
        <Label2 size={12} bold color="#fff" style={{ flex:'0 0 80px', textAlign:'right' }}>Отгрузок</Label2>
        <Label2 size={12} bold color="#fff" style={{ flex:'0 0 110px', textAlign:'right', paddingRight:16 }}>Σ кг</Label2>
        <Label2 size={12} bold color="#fff" style={{ flex:1 }}>Статус</Label2>
        <Label2 size={12} bold color="#fff" style={{ width:60, textAlign:'right' }}>Дейст.</Label2>
      </div>
      {SEASONS.map((s, i) => (
        <div key={i} style={{
          display:'flex', alignItems:'center',
          padding:'7px 10px',
          background: s.current ? '#e8f4ed' : (i % 2 === 0 ? '#fafafa' : '#fff'),
          borderBottom:'1px solid #eee',
          opacity: s.archived ? 0.6 : 1
        }}>
          <div style={{ flex:'0 0 36px' }}>
            <div style={{
              width:18, height:18, borderRadius:'50%',
              border:'2px solid #333',
              background: s.current ? '#1a6b3a' : '#fff',
              display:'flex', alignItems:'center', justifyContent:'center'
            }}>
              {s.current && <span style={{ color:'#fff', fontSize:10, fontWeight:700 }}>●</span>}
            </div>
          </div>
          <Label2 size={14} bold color={s.current ? '#1a6b3a' : '#222'} style={{ flex:'0 0 220px' }}>
            {s.name}
          </Label2>
          <Label2 size={11} color="#888" style={{ flex:'0 0 180px', fontStyle:'italic' }}>{s.range}</Label2>
          <Label2 size={12} color="#555" style={{ flex:'0 0 80px', textAlign:'right' }}>
            {s.shipments > 0 ? s.shipments : '—'}
          </Label2>
          <Label2 size={12} bold color="#1a6b3a" style={{ flex:'0 0 110px', textAlign:'right', paddingRight:16 }}>
            {s.kg > 0 ? s.kg.toLocaleString() : '—'}
          </Label2>
          <div style={{ flex:1 }}>
            {s.current
              ? <Pill2 color="#1a6b3a" textColor="#fff" size={11}>● Текущий</Pill2>
              : s.archived
                ? <Pill2 color="#e0e0d8" textColor="#888" size={11}>архив</Pill2>
                : <Pill2 color="#fff0c8" textColor="#a06000" size={11}>будущий</Pill2>}
          </div>
          <div style={{ width:60, display:'flex', justifyContent:'flex-end', gap:6 }}>
            {admin
              ? <>
                  <span title="Редактировать" style={{ cursor:'pointer', fontSize:14 }}>✎</span>
                  {!s.current && <span title="Сделать текущим" style={{ cursor:'pointer', fontSize:13 }}>★</span>}
                </>
              : <span style={{ fontSize:14, opacity:0.3 }}>✎</span>}
          </div>
        </div>
      ))}
    </div>

    <div style={{ marginTop:10, padding:'8px 12px', background:'#fffbe8', border:'1.5px dashed #e09a20', borderRadius:4 }}>
      <Label2 size={13} color="#b06000">
        ✦ Поля: Название · флаг «Текущий» (только один в любой момент) · все сезоны идут с июня по май, точные даты не нужны — название самодостаточно
      </Label2>
    </div>
  </div>
);

/* ===========================================================
   3.3  СПРАВОЧНИК «ВИДЫ ТАРЫ»
   =========================================================== */

const TARA_TYPES = [
  { name:'Ящик пластиковый L-200',   type:'ящик',          weight:'1.8 кг', usedWith:['Огурцы','Черри','Патиссоны'] },
  { name:'Ящик пластиковый L-300',   type:'ящик',          weight:'2.4 кг', usedWith:['Огурцы','Томаты'] },
  { name:'Ящик деревянный 40×60',     type:'ящик',          weight:'3.5 кг', usedWith:['Патиссоны','Баклажан'] },
  { name:'Бочка металл 200 л',       type:'бочка железо',  weight:'18 кг',  usedWith:['Халапеньо','Перец'] },
  { name:'Бочка металл 60 л',        type:'бочка железо',  weight:'9 кг',   usedWith:['Халапеньо'] },
  { name:'Бочка пластик 220 л',      type:'бочка пластик', weight:'12 кг',  usedWith:['Огурцы','Черри'] },
  { name:'Бочка пластик HDPE 120 л', type:'бочка пластик', weight:'8 кг',   usedWith:['Перец','Халапеньо'] },
];

const TARA_TYPE_STYLE = {
  'ящик':          { icon:'📦', bg:'#e8d4c2', dot:'#a06030' },
  'бочка железо':  { icon:'🛢',  bg:'#d8d8d8', dot:'#555'    },
  'бочка пластик': { icon:'⛟',  bg:'#c2d4e8', dot:'#1a4a8a' },
};

const TaraReference = ({ admin }) => {
  const grouped = ['ящик','бочка железо','бочка пластик'].map(t => ({
    type: t,
    items: TARA_TYPES.filter(x => x.type === t)
  }));
  return (
    <div style={{ padding:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, flexWrap:'wrap' }}>
        <Label2 size={18} bold>📦 Справочник «Виды тары»</Label2>
        <RoleBadge admin={admin} />
        <div style={{ flex:1 }}/>
        {admin && (
          <Box2 className="sk-gray" style={{ padding:'5px 14px', cursor:'pointer', background:'#1a6b3a', borderColor:'#0d4020' }}>
            <Label2 size={13} bold color="#fff">＋ Новый вид тары</Label2>
          </Box2>
        )}
      </div>

      <div style={{ border:'2px solid #333', borderRadius:3, background:'#fff', overflow:'hidden' }}>
        <div style={{ display:'flex', background:'#2a2a2a', color:'#fff', padding:'5px 10px' }}>
          <Label2 size={12} bold color="#fff" style={{ flex:'0 0 40px' }}></Label2>
          <Label2 size={12} bold color="#fff" style={{ flex:1 }}>Название</Label2>
          <Label2 size={12} bold color="#fff" style={{ flex:'0 0 160px' }}>Тип</Label2>
          <Label2 size={12} bold color="#fff" style={{ flex:'0 0 100px' }}>Вес тары</Label2>
          <Label2 size={12} bold color="#fff" style={{ flex:'0 0 220px' }}>Используется с</Label2>
          <Label2 size={12} bold color="#fff" style={{ width:50, textAlign:'right' }}>⚙</Label2>
        </div>

        {grouped.map(g => {
          const st = TARA_TYPE_STYLE[g.type];
          return (
            <div key={g.type}>
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 10px', background:'#555' }}>
                <span style={{ fontSize:14 }}>{st.icon}</span>
                <Label2 size={13} bold color="#fff" style={{ textTransform:'capitalize' }}>{g.type}</Label2>
                <Pill2 color="#3a3a3a" textColor="#ddd" size={10}>{g.items.length}</Pill2>
              </div>
              {g.items.map((it, i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center',
                  padding:'5px 10px',
                  background: i % 2 === 0 ? '#fafafa' : '#fff',
                  borderBottom:'1px solid #eee'
                }}>
                  <div style={{ flex:'0 0 40px' }}>
                    <div style={{ width:8, height:8, borderRadius:8, background:st.dot }}/>
                  </div>
                  <Label2 size={13} bold style={{ flex:1 }}>{it.name}</Label2>
                  <div style={{ flex:'0 0 160px' }}>
                    <Pill2 color={st.bg} size={11}>{st.icon} {it.type}</Pill2>
                  </div>
                  <Label2 size={12} color="#555" style={{ flex:'0 0 100px', fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>
                    {it.weight}
                  </Label2>
                  <div style={{ flex:'0 0 220px', display:'flex', gap:3, flexWrap:'wrap' }}>
                    {it.usedWith.map(r => {
                      const c = RAW[r] || { bg:'#eee' };
                      return <Pill2 key={r} color={c.bg} size={10}>{r}</Pill2>;
                    })}
                  </div>
                  <div style={{ width:50, textAlign:'right' }}>
                    {admin
                      ? <span title="Редактировать" style={{ cursor:'pointer', fontSize:14 }}>✎</span>
                      : <span style={{ fontSize:14, opacity:0.3 }}>✎</span>}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop:10, padding:'8px 12px', background:'#fffbe8', border:'1.5px dashed #e09a20', borderRadius:4 }}>
        <Label2 size={13} color="#b06000">
          ✦ Поля: Название · Тип (ящик / бочка железо / бочка пластик) · группировка по типу · «Используется с» — справочно для UI отгрузок
        </Label2>
      </div>
    </div>
  );
};

/* ===========================================================
   3.4  СПРАВОЧНИК «ИНГРЕДИЕНТЫ»
   =========================================================== */

const INGREDIENTS = [
  { name:'Уксус 9%',              unit:'литры', qty: 4_820,  threshold: 1_000, icon:'🧪' },
  { name:'Соль поваренная',       unit:'тонны', qty: 12.4,   threshold: 3,     icon:'🧂' },
  { name:'Аскорбиновая кислота',  unit:'кг',    qty: 184,    threshold: 50,    icon:'💊' },
  { name:'Пиросульфит натрия',    unit:'кг',    qty: 42,     threshold: 50,    icon:'⚗',  low:true },
  { name:'Сахар-песок',           unit:'тонны', qty: 8.2,    threshold: 2,     icon:'🍬' },
  { name:'Лимонная кислота',      unit:'кг',    qty: 96,     threshold: 30,    icon:'🍋' },
];

const UNIT_PILL = {
  'литры': { bg:'#c2d4e8', label:'л' },
  'тонны': { bg:'#e8d4c2', label:'т' },
  'кг':    { bg:'#d4e8c2', label:'кг' },
};

const IngredientsReference = ({ admin }) => (
  <div style={{ padding:12 }}>
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, flexWrap:'wrap' }}>
      <Label2 size={18} bold>⚗ Справочник «Ингредиенты»</Label2>
      <RoleBadge admin={admin} />
      <Pill2 color="#fffbe8" textColor="#b06000" size={11}>остаток на Заводе</Pill2>
      <div style={{ flex:1 }}/>
      {admin && (
        <Box2 className="sk-gray" style={{ padding:'5px 14px', cursor:'pointer', background:'#1a6b3a', borderColor:'#0d4020' }}>
          <Label2 size={13} bold color="#fff">＋ Новый ингредиент</Label2>
        </Box2>
      )}
    </div>

    <div style={{ border:'2px solid #333', borderRadius:3, background:'#fff', overflow:'hidden' }}>
      <div style={{ display:'flex', background:'#2a2a2a', color:'#fff', padding:'5px 10px' }}>
        <Label2 size={12} bold color="#fff" style={{ flex:'0 0 40px' }}></Label2>
        <Label2 size={12} bold color="#fff" style={{ flex:1 }}>Название</Label2>
        <Label2 size={12} bold color="#fff" style={{ flex:'0 0 100px' }}>Ед. изм.</Label2>
        <Label2 size={12} bold color="#fff" style={{ flex:'0 0 110px', textAlign:'right', paddingRight:18 }}>Остаток</Label2>
        <Label2 size={12} bold color="#fff" style={{ flex:'0 0 200px' }}>Уровень</Label2>
        <Label2 size={12} bold color="#fff" style={{ width:60, textAlign:'right' }}>⚙</Label2>
      </div>
      {INGREDIENTS.map((it, i) => {
        const u = UNIT_PILL[it.unit];
        const ratio = Math.min(1, it.qty / (it.threshold * 4));
        const low = it.low || it.qty <= it.threshold;
        return (
          <div key={i} style={{
            display:'flex', alignItems:'center',
            padding:'7px 10px',
            background: low
              ? 'repeating-linear-gradient(-45deg,#fff5f0,#fff5f0 6px,#ffe0d0 6px,#ffe0d0 8px)'
              : (i % 2 === 0 ? '#fafafa' : '#fff'),
            borderBottom:'1px solid #eee'
          }}>
            <div style={{ flex:'0 0 40px', fontSize:18 }}>{it.icon}</div>
            <div style={{ flex:1 }}>
              <Label2 size={14} bold>{it.name}</Label2>
              {low && <Label2 size={10} color="#c33" bold style={{ fontStyle:'italic' }}>⚠ ниже порога ({it.threshold} {u.label})</Label2>}
            </div>
            <div style={{ flex:'0 0 100px' }}>
              <Pill2 color={u.bg} size={11}>{it.unit}</Pill2>
            </div>
            <Label2 size={16} bold color={low ? '#c33' : '#1a6b3a'} style={{ flex:'0 0 110px', textAlign:'right', paddingRight:18, fontFamily:'JetBrains Mono, monospace', fontSize:13 }}>
              {it.qty.toLocaleString('ru-RU')} <span style={{ fontSize:11, color:'#888' }}>{u.label}</span>
            </Label2>
            <div style={{ flex:'0 0 200px', paddingRight:10 }}>
              <div style={{
                height:8, background:'#e8e5df', borderRadius:4, overflow:'hidden',
                border:'1px solid #ccc'
              }}>
                <div style={{
                  width: `${ratio * 100}%`, height:'100%',
                  background: low ? '#c33' : (ratio > 0.6 ? '#1a6b3a' : '#d4a04a')
                }}/>
              </div>
            </div>
            <div style={{ width:60, display:'flex', justifyContent:'flex-end', gap:6 }}>
              {admin
                ? <>
                    <span title="+приход" style={{ cursor:'pointer', fontSize:13 }}>＋</span>
                    <span title="Редактировать" style={{ cursor:'pointer', fontSize:14 }}>✎</span>
                  </>
                : <span style={{ fontSize:14, opacity:0.3 }}>✎</span>}
            </div>
          </div>
        );
      })}
    </div>

    <div style={{ marginTop:10, padding:'8px 12px', background:'#fffbe8', border:'1.5px dashed #e09a20', borderRadius:4 }}>
      <Label2 size={13} color="#b06000">
        ✦ Поля: Название · Ед. изм. (литры / тонны / кг) · Количество (текущий остаток на Заводе) · полосатая штриховка строки = ниже порога
      </Label2>
    </div>
  </div>
);

/* ===========================================================
   3.5  ПОСТАВЩИКИ — вкладка «Средний вес рейса по сырью»
   =========================================================== */

const SUPPLIER_AVG = {
  supplier: 'Генералов А.В.',
  region:   'Ростовская обл.',
  rows: [
    { raw:'Огурцы',    auto: 18_420, manual: null,   useManual:false, trips: 24 },
    { raw:'Черри',     auto: 15_980, manual: 16_000, useManual:true,  trips: 18 },
    { raw:'Томаты',    auto: 19_150, manual: null,   useManual:false, trips: 31 },
    { raw:'Патиссоны', auto:  8_536, manual:  9_000, useManual:true,  trips:  8 },
    { raw:'Халапеньо', auto: 11_240, manual: null,   useManual:false, trips:  6 },
    { raw:'Перец',     auto: 17_800, manual: 18_500, useManual:true,  trips: 12 },
    { raw:'Баклажан',  auto:    null, manual: 14_000, useManual:true,  trips: 0  },
  ],
};

const SuppliersWithAvg = ({ admin, defaultTab }) => {
  const [tab, setTab] = useStateRX(defaultTab || 'avg');
  return (
    <div style={{ padding:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, flexWrap:'wrap' }}>
        <Label2 size={18} bold>🏭 Поставщик: {SUPPLIER_AVG.supplier}</Label2>
        <Pill2 color="#e8e5df" size={11}>📍 {SUPPLIER_AVG.region}</Pill2>
        <RoleBadge admin={admin} />
        <div style={{ flex:1 }}/>
        {admin && (
          <Box2 className="sk-gray" style={{ padding:'5px 12px', cursor:'pointer' }}>
            <Label2 size={12} bold>✎ Редактировать</Label2>
          </Box2>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:0, borderBottom:'2px solid #333', marginBottom:0, flexWrap:'wrap' }}>
        {[
          { id:'main',     label:'Основные данные' },
          { id:'contacts', label:'Контакты' },
          { id:'contracts',label:'Контракты' },
          { id:'avg',      label:'Средний вес рейса по сырью', highlight:true },
          { id:'history',  label:'История отгрузок' },
          { id:'tara',     label:'Тара' },
          { id:'quality',  label:'Качество' },
        ].map(t => (
          <div key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding:'6px 14px',
              background: tab === t.id ? '#1a6b3a' : (t.highlight ? '#fffbe8' : '#f5f3ed'),
              border:'2px solid #333', borderBottom:'none', borderRight:'none',
              borderRadius: '4px 4px 0 0',
              cursor:'pointer',
              marginRight:-2,
              position:'relative',
              top: tab === t.id ? 0 : 1,
            }}>
            <Label2 size={12} bold color={tab === t.id ? '#fff' : '#333'}>
              {t.highlight && tab !== t.id && '✨ '}{t.label}
            </Label2>
          </div>
        ))}
      </div>

      {/* Tab content: avg trip weight */}
      {tab === 'avg' && (
        <div style={{ border:'2px solid #333', borderTop:'none', background:'#fff', padding:12 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:8, flexWrap:'wrap' }}>
            <Label2 size={15} bold>Средний вес рейса по сырью</Label2>
            <Label2 size={11} color="#888" style={{ fontStyle:'italic' }}>
                используется для прогноза/планирования, когда фактический вес ещё неизвестен
            </Label2>
          </div>

          <div style={{ border:'1.5px solid #333', borderRadius:3, overflow:'hidden' }}>
            <div style={{ display:'flex', background:'#2a2a2a', color:'#fff' }}>
              <Label2 size={12} bold color="#fff" style={{ flex:'0 0 200px', padding:'5px 10px', borderRight:'1px solid #555' }}>Сырьё</Label2>
              <div style={{ flex:'0 0 170px', padding:'5px 10px', borderRight:'1px solid #555' }}>
                <Label2 size={12} bold color="#fff">Авто из истории, кг</Label2>
                <Label2 size={9} color="#aaa" style={{ fontStyle:'italic' }}>средн. по последним рейсам</Label2>
              </div>
              <div style={{ flex:'0 0 170px', padding:'5px 10px', borderRight:'1px solid #555' }}>
                <Label2 size={12} bold color="#fff">Ручное, кг</Label2>
                <Label2 size={9} color="#aaa" style={{ fontStyle:'italic' }}>задаёт админ</Label2>
              </div>
              <div style={{ flex:'0 0 130px', padding:'5px 10px', borderRight:'1px solid #555' }}>
                <Label2 size={12} bold color="#fff">✓ Использовать</Label2>
                <Label2 size={9} color="#aaa" style={{ fontStyle:'italic' }}>ручное вместо авто</Label2>
              </div>
              <div style={{ flex:1, padding:'5px 10px' }}>
                <Label2 size={12} bold color="#fff">Итог (для UI)</Label2>
              </div>
            </div>
            {SUPPLIER_AVG.rows.map((r, i) => {
              const c = RAW[r.raw] || { bg:'#eee', dot:'#999' };
              const used = r.useManual ? r.manual : r.auto;
              return (
                <div key={i} style={{
                  display:'flex', alignItems:'stretch',
                  background: i % 2 === 0 ? '#fafafa' : '#fff',
                  borderBottom:'1px dashed #ccc',
                  minHeight: 32
                }}>
                  <div style={{ width:4, background: c.dot, flexShrink:0 }}/>
                  <div style={{ flex:'0 0 196px', padding:'5px 10px', display:'flex', alignItems:'center', gap:6, borderRight:'1px solid #eee' }}>
                    <div style={{ width:10, height:10, borderRadius:10, background:c.dot, flexShrink:0 }}/>
                    <Label2 size={13} bold>{r.raw}</Label2>
                    <div style={{ flex:1 }}/>
                    <Pill2 color={c.bg} size={10}>{r.trips} рейс.</Pill2>
                  </div>
                  <div style={{ flex:'0 0 170px', padding:'5px 10px', display:'flex', alignItems:'center', borderRight:'1px solid #eee', background:'#f5f3ef' }}>
                    {r.auto != null
                      ? <>
                          <Label2 size={14} bold color="#555" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:12, opacity: r.useManual ? 0.4 : 1, textDecoration: r.useManual ? 'line-through' : 'none' }}>
                            {r.auto.toLocaleString('ru-RU')}
                          </Label2>
                          <div style={{ flex:1 }}/>
                          <Label2 size={9} color="#aaa">авто</Label2>
                        </>
                      : <Label2 size={11} color="#bbb" style={{ fontStyle:'italic' }}>нет истории</Label2>}
                  </div>
                  <div style={{ flex:'0 0 170px', padding:'5px 10px', display:'flex', alignItems:'center', borderRight:'1px solid #eee' }}>
                    <div style={{
                      flex:1, border:'1px dashed #999', borderRadius:2, padding:'2px 6px',
                      background: admin ? '#fffdf2' : '#f5f3ef',
                      display:'flex', alignItems:'center', gap:4, minHeight:22
                    }}>
                      {r.manual != null
                        ? <Label2 size={14} bold color="#1a4a8a" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:12 }}>
                            {r.manual.toLocaleString('ru-RU')}
                          </Label2>
                        : <Label2 size={11} color="#bbb" style={{ fontStyle:'italic' }}>—</Label2>}
                      <div style={{ flex:1 }}/>
                      {admin && <Label2 size={10} color="#bbb">✎</Label2>}
                    </div>
                  </div>
                  <div style={{ flex:'0 0 130px', padding:'5px 10px', display:'flex', alignItems:'center', justifyContent:'center', borderRight:'1px solid #eee' }}>
                    <div style={{
                      width:18, height:18, border:'2px solid #333', borderRadius:3,
                      background: r.useManual ? '#1a6b3a' : '#fff',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      cursor: admin ? 'pointer' : 'not-allowed',
                      opacity: admin ? 1 : 0.5,
                    }}>
                      {r.useManual && <span style={{ color:'#fff', fontSize:12, fontWeight:700, lineHeight:1 }}>✓</span>}
                    </div>
                  </div>
                  <div style={{ flex:1, padding:'5px 10px', display:'flex', alignItems:'center', gap:6 }}>
                    <Label2 size={14} bold color={r.useManual ? '#1a4a8a' : '#1a6b3a'} style={{ fontFamily:'JetBrains Mono, monospace', fontSize:13 }}>
                      {used != null ? used.toLocaleString('ru-RU') : '—'}
                    </Label2>
                    <Pill2
                      color={r.useManual ? '#c2d4e8' : '#d4e8c2'}
                      textColor={r.useManual ? '#1a4a8a' : '#1a6b3a'}
                      size={10}>
                      {r.useManual ? 'ручное' : 'авто'}
                    </Pill2>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop:10, display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <Pill2 color="#e8f0e4" textColor="#1a6b3a" size={11}>3 позиции — ручной вес</Pill2>
            <Pill2 color="#f5f3ef" size={11}>3 позиции — авто из истории</Pill2>
            <Pill2 color="#fff0c8" textColor="#a06000" size={11}>1 позиция — нет истории, нужно ручное</Pill2>
            <div style={{ flex:1 }}/>
            {admin && (
              <Box2 className="sk-gray" style={{ padding:'4px 10px', cursor:'pointer' }}>
                <Label2 size={11}>↻ Пересчитать «Авто из истории»</Label2>
              </Box2>
            )}
          </div>
        </div>
      )}

      {/* Stub for other tabs */}
      {tab !== 'avg' && (
        <div style={{ border:'2px solid #333', borderTop:'none', background:'#fff' }}>
          {tab === 'main'     && window.TabMain      && <window.TabMain      admin={admin}/>}
          {tab === 'contacts' && window.TabContacts  && <window.TabContacts  admin={admin}/>}
          {tab === 'contracts'&& window.TabContracts && <window.TabContracts admin={admin}/>}
          {tab === 'history'  && window.TabHistory   && <window.TabHistory   admin={admin}/>}
          {tab === 'tara'     && window.TabTara      && <window.TabTara      admin={admin}/>}
          {tab === 'quality'  && window.TabQuality   && <window.TabQuality   admin={admin}/>}
        </div>
      )}

      <div style={{ marginTop:10, padding:'8px 12px', background:'#fffbe8', border:'1.5px dashed #e09a20', borderRadius:4 }}>
        <Label2 size={13} color="#b06000">
          ✦ Новая вкладка карточки поставщика: Сырьё → Авто из истории (кг) → Ручное (кг) → ✓ использовать ручное · редактирование только Админу
        </Label2>
      </div>
    </div>
  );
};

/* ===== expose ===== */
Object.assign(window, {
  DriversReference,
  DriverEditForm,
  SeasonsReference,
  TaraReference,
  IngredientsReference,
  SuppliersWithAvg,
});
