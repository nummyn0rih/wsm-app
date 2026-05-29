/* ─────────── НАСТРОЙКИ (только Админ) ───────────
   Левое меню разделов + правый контейнер с содержимым.
   Атомы (Box, Label, Pill, RAW_COLORS) — глобальные из основного файла. */

(() => {
  const { useState } = React;
  const Box = window.Box, Label = window.Label, Pill = window.Pill;
  const RAW_COLORS = window.RAW_COLORS;

  /* ────── Утилиты ────── */
  const NumInput = ({ value, suffix, width = 70 }) => (
    <div style={{
      display:'inline-flex', alignItems:'center', gap:6,
      border:'1.5px solid #333', borderRadius:3, background:'#fffdf2',
      padding:'2px 8px', width, justifyContent:'space-between'
    }}>
      <Label size={14} bold color="#222" style={{ fontFamily:'JetBrains Mono, monospace' }}>{value}</Label>
      {suffix && <Label size={11} color="#888">{suffix}</Label>}
    </div>
  );

  const Toggle = ({ on }) => (
    <div style={{
      width: 40, height: 20, borderRadius: 12,
      border:'1.5px solid #333',
      background: on ? '#1a6b3a' : '#e8e5df',
      position:'relative', cursor:'pointer', flexShrink:0
    }}>
      <div style={{
        position:'absolute', top:1,
        left: on ? 20 : 1,
        width:15, height:15, borderRadius:'50%',
        background:'#fff', border:'1.5px solid #333',
        transition:'left 0.15s'
      }} />
    </div>
  );

  const Check = ({ on, sz = 16 }) => (
    <div style={{
      width: sz, height: sz, border:'1.5px solid #333', borderRadius:3,
      background: on ? '#1a6b3a' : '#fff',
      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
    }}>
      {on && <span style={{ color:'#fff', fontSize: sz-6, fontWeight:700, lineHeight:1 }}>✓</span>}
    </div>
  );

  const Select = ({ value, w = 130 }) => (
    <div style={{
      display:'inline-flex', alignItems:'center', gap:6,
      border:'1.5px solid #333', borderRadius:3, background:'#fff',
      padding:'2px 6px 2px 8px', width: w, justifyContent:'space-between',
      cursor:'pointer'
    }}>
      <Label size={13} color="#222">{value}</Label>
      <Label size={11} color="#666">▾</Label>
    </div>
  );

  const Field = ({ label, hint, children }) => (
    <div style={{
      display:'flex', alignItems:'flex-start', gap:14,
      padding:'10px 0', borderBottom:'1px dashed #d8d4c8'
    }}>
      <div style={{ flex:1, minWidth:0 }}>
        <Label size={14} bold color="#222">{label}</Label>
        {hint && <Label size={11} color="#888" style={{ marginTop:1, fontStyle:'italic' }}>{hint}</Label>}
      </div>
      <div style={{ flexShrink:0 }}>{children}</div>
    </div>
  );

  const SectionTitle = ({ icon, children, subtitle }) => (
    <div style={{
      display:'flex', alignItems:'center', gap:10,
      paddingBottom: 10, marginBottom: 6,
      borderBottom: '2px solid #333'
    }}>
      <span style={{ fontSize:22 }}>{icon}</span>
      <div>
        <Label size={22} bold color="#222">{children}</Label>
        {subtitle && <Label size={12} color="#888" style={{ fontStyle:'italic' }}>{subtitle}</Label>}
      </div>
    </div>
  );

  /* ────── 1. Алерты и пороги ────── */
  const PaneAlerts = () => (
    <div>
      <SectionTitle icon="⚠" subtitle="Триггеры предупреждений по контрактам, поставкам и качеству">Алерты и пороги</SectionTitle>
      <Field label="% выполнения контракта для алерта о приближении"
        hint="Когда контракт выбран на N% — показать предупреждение «приближается лимит»">
        <NumInput value="90" suffix="%" />
      </Field>
      <Field label="% перевыполнения для алерта"
        hint="Когда контракт перебран на N% — алерт «перевыполнение, требуется доп. соглашение»">
        <NumInput value="105" suffix="%" />
      </Field>
      <Field label="Дней без поставок для алерта"
        hint="Если поставщик не отгружал более N дней — алерт «поставщик неактивен»">
        <NumInput value="7" suffix="дн." />
      </Field>
      <Field label="% брака за неделю для предупреждения"
        hint="Если средний % брака по поставщику за неделю выше — алерт по качеству">
        <NumInput value="10" suffix="%" />
      </Field>

      <div style={{
        marginTop:14, padding:'8px 12px',
        background:'#fffbe8', border:'1.5px dashed #e09a20', borderRadius:3
      }}>
        <Label size={12} color="#b06000" style={{ fontStyle:'italic' }}>
          ✦ Все пороги используются для уведомлений (см. раздел «Уведомления») и для подсветки строк в Контрактах / Аналитике.
        </Label>
      </div>
    </div>
  );

  /* ────── 2. Тара ────── */
  const PaneTara = () => (
    <div>
      <SectionTitle icon="📦" subtitle="Параметры работы с тарой и автозадачами">Тара</SectionTitle>
      <Field label="Дней до подсказки «пометить тару доставленной»"
        hint="Через сколько дней после отправки тары поставщику предложить отметить её доставленной">
        <NumInput value="2" suffix="дн." />
      </Field>
      <Field label="Порог зависшей тары в днях"
        hint="Тара, не возвращённая дольше этого срока, считается «зависшей» и попадает в алерты">
        <NumInput value="14" suffix="дн." />
      </Field>
      <Field label="Авто-создание задач по таре"
        hint="При срабатывании порогов автоматически создавать задачу в Журнале">
        <Toggle on={true} />
      </Field>
    </div>
  );

  /* ────── 3. Рабочая неделя ────── */
  const PaneWeek = () => {
    const days = [
      { d:'Пн', on:true }, { d:'Вт', on:true }, { d:'Ср', on:true },
      { d:'Чт', on:true }, { d:'Пт', on:true }, { d:'Сб', on:false }, { d:'Вс', on:false },
    ];
    // Ноябрь 2025: 1 ноября = суббота
    const offBase = new Set([1,2,8,9,15,16,22,23,29,30]); // выходные
    const holidays = new Set([4, 7, 24, 28]); // отмеченные нерабочие даты
    // Первая ячейка месяца — позиция (пн=0). Ноябрь 2025 начинается с субботы → 5
    const firstOffset = 5;
    const daysInMonth = 30;

    return (
      <div>
        <SectionTitle icon="📅" subtitle="Рабочие дни недели и нерабочие даты (праздники)">Рабочая неделя</SectionTitle>

        <div style={{ padding:'12px 0', borderBottom:'1px dashed #d8d4c8' }}>
          <Label size={14} bold color="#222">Рабочие дни недели</Label>
          <Label size={11} color="#888" style={{ fontStyle:'italic' }}>Используются для расчёта «дней простоя» и подсветки выходных в графике</Label>
          <div style={{ display:'flex', gap:10, marginTop:10, flexWrap:'wrap' }}>
            {days.map((x, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:6,
                padding:'5px 10px',
                background: x.on ? '#e4f1e0' : '#f5f3ed',
                border:`1.5px solid ${x.on ? '#1a6b3a' : '#bbb'}`,
                borderRadius:3, cursor:'pointer'
              }}>
                <Check on={x.on} sz={14} />
                <Label size={14} bold color={x.on ? '#1a6b3a' : '#888'}>{x.d}</Label>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding:'14px 0' }}>
          <Label size={14} bold color="#222">Нерабочие даты (праздники)</Label>
          <Label size={11} color="#888" style={{ fontStyle:'italic' }}>Клик по дате — отметить/снять</Label>

          <div style={{
            marginTop: 12,
            display:'flex', gap: 18, alignItems:'flex-start'
          }}>
            {/* Mini calendar — ноябрь 2025 */}
            <div style={{
              width: 290, border:'2px solid #333', borderRadius:3,
              background:'#fff', overflow:'hidden'
            }}>
              <div style={{
                display:'flex', alignItems:'center', gap:6,
                padding:'6px 10px', background:'#2a2a2a', color:'#fff'
              }}>
                <Label size={11} color="#aaa" style={{ cursor:'pointer' }}>◂</Label>
                <Label size={14} bold color="#fff" style={{ flex:1, textAlign:'center' }}>Ноябрь 2025</Label>
                <Label size={11} color="#aaa" style={{ cursor:'pointer' }}>▸</Label>
              </div>
              {/* Day headers */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', background:'#f5f3ed', borderBottom:'1px solid #ccc' }}>
                {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map((d, i) => (
                  <div key={i} style={{
                    padding:'4px 0', textAlign:'center',
                    borderRight: i<6 ? '1px solid #e5e2da' : 'none'
                  }}>
                    <Label size={11} bold color={i>=5 ? '#a04040' : '#666'}>{d}</Label>
                  </div>
                ))}
              </div>
              {/* Days grid */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)' }}>
                {Array.from({ length: firstOffset }).map((_, i) => (
                  <div key={'e'+i} style={{ height: 30, borderRight: i<6 ? '1px solid #eee' : 'none', borderBottom:'1px solid #eee', background:'#fafafa' }} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const d = idx + 1;
                  const colPos = (firstOffset + idx) % 7;
                  const isWeekend = offBase.has(d);
                  const isHoliday = holidays.has(d);
                  const off = isWeekend || isHoliday;
                  const isLastCol = colPos === 6;
                  return (
                    <div key={d} style={{
                      height: 30, position:'relative',
                      borderRight: !isLastCol ? '1px solid #eee' : 'none',
                      borderBottom:'1px solid #eee',
                      background: isHoliday ? '#ffe4d0' : (isWeekend ? '#f5f3ed' : '#fff'),
                      display:'flex', alignItems:'center', justifyContent:'center',
                      cursor:'pointer'
                    }}>
                      <Label size={13} bold color={isHoliday ? '#c24a28' : (off ? '#a04040' : '#222')}>
                        {d}
                      </Label>
                      {isHoliday && (
                        <div style={{
                          position:'absolute', top:2, right:3,
                          width:6, height:6, borderRadius:6,
                          background:'#c24a28', border:'1px solid #8a2810'
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend & list */}
            <div style={{ flex:1, minWidth:0 }}>
              <Label size={12} bold color="#666" style={{ textTransform:'uppercase', letterSpacing:1 }}>Легенда</Label>
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:6 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:18, height:18, background:'#fff', border:'1.5px solid #333', borderRadius:3 }} />
                  <Label size={12} color="#333">Рабочий день</Label>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:18, height:18, background:'#f5f3ed', border:'1.5px solid #999', borderRadius:3 }} />
                  <Label size={12} color="#333">Выходной (по расписанию)</Label>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:18, height:18, background:'#ffe4d0', border:'1.5px solid #c24a28', borderRadius:3, position:'relative' }}>
                    <div style={{ position:'absolute', top:1, right:2, width:5, height:5, borderRadius:5, background:'#c24a28' }} />
                  </div>
                  <Label size={12} color="#333">Праздник / нерабочая дата</Label>
                </div>
              </div>

              <Label size={12} bold color="#666" style={{ textTransform:'uppercase', letterSpacing:1, marginTop:14, display:'block' }}>
                Отмечено в ноябре
              </Label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:6 }}>
                <Pill color="#ffe4d0" textColor="#c24a28" size={12}>4 ноя · День нар. единства</Pill>
                <Pill color="#ffe4d0" textColor="#c24a28" size={12}>7 ноя · корпоратив</Pill>
                <Pill color="#ffe4d0" textColor="#c24a28" size={12}>24 ноя · санит. день</Pill>
                <Pill color="#ffe4d0" textColor="#c24a28" size={12}>28 ноя · корпоратив</Pill>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ────── 4. Единицы измерения ────── */
  const PaneUnits = () => {
    const rows = [
      { raw:'Огурцы',    unit:'кг' },
      { raw:'Черри',     unit:'кг' },
      { raw:'Томаты',    unit:'кг' },
      { raw:'Патиссоны', unit:'шт' },
      { raw:'Халапеньо', unit:'кг' },
      { raw:'Перец',     unit:'кг' },
      { raw:'Баклажан',  unit:'кг' },
    ];
    return (
      <div>
        <SectionTitle icon="⚖" subtitle="Единица учёта по умолчанию для каждого вида сырья">Единицы измерения</SectionTitle>
        <div style={{ border:'2px solid #333', borderRadius:3, overflow:'hidden', marginTop: 6 }}>
          <div style={{ display:'flex', background:'#2a2a2a', color:'#fff' }}>
            <div style={{ flex:1, padding:'6px 12px', borderRight:'1px solid #555' }}>
              <Label size={12} bold color="#fff">Сырьё</Label>
            </div>
            <div style={{ width: 200, padding:'6px 12px' }}>
              <Label size={12} bold color="#fff">Единица по умолчанию</Label>
            </div>
          </div>
          {rows.map((r, i) => {
            const c = RAW_COLORS[r.raw] || { bg:'#eee', dot:'#999' };
            return (
              <div key={i} style={{
                display:'flex', background: i%2===0 ? '#fff' : '#fafafa',
                borderBottom: i<rows.length-1 ? '1px solid #eee' : 'none'
              }}>
                <div style={{ flex:1, padding:'6px 12px', borderRight:'1px solid #eee', display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width: 10, height:10, borderRadius:10, background: c.dot, flexShrink:0 }} />
                  <Label size={14} bold color="#222">{r.raw}</Label>
                </div>
                <div style={{ width: 200, padding:'6px 12px', display:'flex', alignItems:'center' }}>
                  <Select value={r.unit} w={100} />
                </div>
              </div>
            );
          })}
        </div>
        <Label size={11} color="#888" style={{ fontStyle:'italic', marginTop:8, display:'block' }}>
          Доступные единицы: кг · т · шт · ящ.
        </Label>
      </div>
    );
  };

  /* ────── 5. Пользователи и роли ────── */
  const ROLE_BG = {
    'админ':       { bg:'#ffd6c2', fg:'#8a2810', dot:'#c24a28' },
    'оператор':    { bg:'#c2d4e8', fg:'#1a4a8a', dot:'#1a4a8a' },
    'руководитель':{ bg:'#fff4a8', fg:'#7a6000', dot:'#c49a00' },
  };
  const PaneUsers = () => {
    const users = [
      { name:'Иванова Е.',   email:'ivanova@wsm.ru',     role:'админ',        active:true,  last:'25.10.2025 14:32' },
      { name:'Петров С.',    email:'petrov@wsm.ru',      role:'админ',        active:true,  last:'25.10.2025 09:05' },
      { name:'Соколова М.',  email:'sokolova@wsm.ru',    role:'оператор',     active:true,  last:'25.10.2025 18:11' },
      { name:'Гордеев И.',   email:'gordeev@wsm.ru',     role:'оператор',     active:true,  last:'24.10.2025 16:48' },
      { name:'Шевцов А.',    email:'shevtsov@wsm.ru',    role:'оператор',     active:false, last:'02.09.2025 10:22' },
      { name:'Бакулин Н.',   email:'bakulin@wsm.ru',     role:'руководитель', active:true,  last:'25.10.2025 11:18' },
    ];
    return (
      <div>
        <SectionTitle icon="👥" subtitle="Учётные записи и права доступа">Пользователи и роли</SectionTitle>

        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom: 10 }}>
          <Box className="sk-gray" style={{
            padding:'5px 14px', cursor:'pointer',
            background:'#1a6b3a', borderColor:'#0d4020',
            display:'flex', alignItems:'center', gap:6
          }}>
            <span style={{ fontSize:14, color:'#fff' }}>＋</span>
            <Label size={13} bold color="#fff">Пригласить пользователя</Label>
          </Box>
          <div style={{ flex:1 }} />
          <Label size={12} color="#888">Всего: {users.length} · активны: {users.filter(u=>u.active).length}</Label>
        </div>

        <div style={{ border:'2px solid #333', borderRadius:3, overflow:'hidden' }}>
          <div style={{ display:'flex', background:'#2a2a2a', color:'#fff' }}>
            <div style={{ width: 170, padding:'6px 10px', borderRight:'1px solid #555' }}><Label size={12} bold color="#fff">Имя</Label></div>
            <div style={{ flex:1, padding:'6px 10px', borderRight:'1px solid #555' }}><Label size={12} bold color="#fff">Email</Label></div>
            <div style={{ width: 140, padding:'6px 10px', borderRight:'1px solid #555' }}><Label size={12} bold color="#fff">Роль</Label></div>
            <div style={{ width: 100, padding:'6px 10px', borderRight:'1px solid #555' }}><Label size={12} bold color="#fff">Статус</Label></div>
            <div style={{ width: 140, padding:'6px 10px', borderRight:'1px solid #555' }}><Label size={12} bold color="#fff">Последний вход</Label></div>
            <div style={{ width: 90, padding:'6px 0', textAlign:'center' }}><Label size={12} bold color="#fff">Действия</Label></div>
          </div>
          {users.map((u, i) => {
            const r = ROLE_BG[u.role];
            return (
              <div key={i} style={{
                display:'flex', alignItems:'stretch',
                background: i%2===0 ? '#fff' : '#fafafa',
                borderBottom: i<users.length-1 ? '1px solid #eee' : 'none',
                opacity: u.active ? 1 : 0.65
              }}>
                <div style={{ width:170, padding:'6px 10px', borderRight:'1px solid #eee', display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{
                    width:22, height:22, borderRadius:'50%', background:'#444',
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
                  }}>
                    <Label size={11} bold color="#fff">{u.name.charAt(0)}</Label>
                  </div>
                  <Label size={13} bold color="#222">{u.name}</Label>
                </div>
                <div style={{ flex:1, padding:'6px 10px', borderRight:'1px solid #eee', display:'flex', alignItems:'center' }}>
                  <Label size={12} color="#444" style={{ fontFamily:'JetBrains Mono, monospace' }}>{u.email}</Label>
                </div>
                <div style={{ width:140, padding:'6px 10px', borderRight:'1px solid #eee', display:'flex', alignItems:'center' }}>
                  <Pill color={r.bg} textColor={r.fg} size={11}>● {u.role}</Pill>
                </div>
                <div style={{ width:100, padding:'6px 10px', borderRight:'1px solid #eee', display:'flex', alignItems:'center' }}>
                  {u.active
                    ? <Pill color="#c8e8c8" textColor="#1a6b3a" size={11}>● активен</Pill>
                    : <Pill color="#ececec" textColor="#888" size={11}>● заблок.</Pill>}
                </div>
                <div style={{ width:140, padding:'6px 10px', borderRight:'1px solid #eee', display:'flex', alignItems:'center' }}>
                  <Label size={12} color="#666" style={{ fontFamily:'JetBrains Mono, monospace' }}>{u.last}</Label>
                </div>
                <div style={{ width:90, padding:'4px 0', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  <span title="Редактировать роль" style={{ cursor:'pointer', fontSize:14 }}>✎</span>
                  <span title={u.active ? 'Заблокировать' : 'Разблокировать'} style={{ cursor:'pointer', fontSize:14 }}>
                    {u.active ? '🔒' : '🔓'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display:'flex', gap:8, marginTop: 12, flexWrap:'wrap' }}>
          <Label size={12} color="#666" bold>Роли:</Label>
          {Object.entries(ROLE_BG).map(([k, v]) => (
            <Pill key={k} color={v.bg} textColor={v.fg} size={11}>● {k}</Pill>
          ))}
          <div style={{ flex:1 }} />
          <Label size={11} color="#888" style={{ fontStyle:'italic' }}>
            «Руководитель» — будущая роль (см. TODO внизу страницы)
          </Label>
        </div>
      </div>
    );
  };

  /* ────── 6. Резервное копирование и экспорт ────── */
  const PaneBackup = () => (
    <div>
      <SectionTitle icon="💾" subtitle="Бэкапы базы данных и выгрузка истории">Резервное копирование и экспорт</SectionTitle>

      <div style={{ padding:'14px 0', borderBottom:'1px dashed #d8d4c8' }}>
        <Label size={14} bold color="#222">Резервная копия базы данных</Label>
        <Label size={11} color="#888" style={{ fontStyle:'italic' }}>Полный дамп БД одним архивом · хранится у администратора</Label>
        <div style={{ display:'flex', gap:10, marginTop: 10, flexWrap:'wrap', alignItems:'center' }}>
          <Box className="sk-gray" style={{
            padding:'6px 14px', cursor:'pointer',
            background:'#1a6b3a', borderColor:'#0d4020',
            display:'flex', alignItems:'center', gap:6
          }}>
            <span style={{ fontSize:14, color:'#fff' }}>↓</span>
            <Label size={13} bold color="#fff">Скачать резервную копию БД</Label>
          </Box>
          <Label size={12} color="#666">
            Последний бэкап: <span style={{ fontFamily:'JetBrains Mono, monospace', fontWeight:700, color:'#1a6b3a' }}>07.10.2025 03:00</span>
          </Label>
        </div>
      </div>

      <Field label="Расписание авто-бэкапов"
        hint="Автоматический бэкап создаётся в 03:00 по выбранному расписанию">
        <Select value="Ежедневно" w={150} />
      </Field>

      <div style={{ padding:'14px 0' }}>
        <Label size={14} bold color="#222">Экспорт истории отгрузок</Label>
        <Label size={11} color="#888" style={{ fontStyle:'italic' }}>Все отгрузки за выбранный период в CSV или Excel</Label>
        <div style={{ display:'flex', gap:8, marginTop: 10, flexWrap:'wrap' }}>
          <Box className="sk-gray" style={{
            padding:'5px 12px', cursor:'pointer',
            display:'flex', alignItems:'center', gap:6
          }}>
            <Label size={13} bold>↓ CSV</Label>
          </Box>
          <Box className="sk-gray" style={{
            padding:'5px 12px', cursor:'pointer',
            display:'flex', alignItems:'center', gap:6
          }}>
            <Label size={13} bold>↓ Excel</Label>
          </Box>
          <Label size={12} color="#666" style={{ alignSelf:'center', marginLeft:6 }}>
            Период: <Pill color="#fff" size={11}>01.01.2025 — 25.10.2025</Pill>
          </Label>
        </div>
      </div>
    </div>
  );

  /* ────── 7. О системе ────── */
  const PaneAbout = () => {
    const changelog = [
      { ver:'v0.8.0', date:'07.10.2025', desc:'Модалка качества приёмки, индикаторы 📊/📎 у № акта, печатные формы.' },
      { ver:'v0.7.3', date:'21.09.2025', desc:'Раздел «Уведомления» с фильтрами и массовыми действиями.' },
      { ver:'v0.7.0', date:'02.09.2025', desc:'Логистика тары: дашборд, отправки, лом, передачи, журнал движений.' },
      { ver:'v0.6.2', date:'14.08.2025', desc:'Контракты: список, форма, карточка со сравнением сезонов.' },
      { ver:'v0.6.0', date:'29.07.2025', desc:'Мобильный режим: тара и аналитика, офлайн-первый ввод.' },
    ];
    return (
      <div>
        <SectionTitle icon="ℹ" subtitle="Версия системы, документация и журнал изменений">О системе</SectionTitle>

        <div style={{
          display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10,
          padding:'12px 0'
        }}>
          <div style={{ border:'1.5px solid #333', borderRadius:3, padding:'8px 12px', background:'#fffdf2' }}>
            <Label size={11} color="#888" style={{ textTransform:'uppercase', letterSpacing:1 }}>Версия</Label>
            <Label size={22} bold color="#1a6b3a" style={{ fontFamily:'JetBrains Mono, monospace' }}>v0.8.0</Label>
          </div>
          <div style={{ border:'1.5px solid #333', borderRadius:3, padding:'8px 12px', background:'#fffdf2' }}>
            <Label size={11} color="#888" style={{ textTransform:'uppercase', letterSpacing:1 }}>Последнее обновление</Label>
            <Label size={22} bold color="#222" style={{ fontFamily:'JetBrains Mono, monospace' }}>07.10.2025</Label>
          </div>
        </div>

        <div style={{ padding:'10px 0', borderBottom:'1px dashed #d8d4c8', display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <Label size={14} bold color="#222">Документация:</Label>
          <Label size={14} color="#1a4a8a" style={{
            textDecoration:'underline', textDecorationStyle:'dotted',
            cursor:'pointer'
          }}>📖 docs.wsm.internal/handbook</Label>
          <Label size={11} color="#888" style={{ fontStyle:'italic' }}>(плейсхолдер · ссылка появится после развёртывания)</Label>
        </div>

        <div style={{ paddingTop: 14 }}>
          <Label size={14} bold color="#222">Журнал изменений</Label>
          <Label size={11} color="#888" style={{ fontStyle:'italic', display:'block', marginBottom:8 }}>
            Последние 5 релизов
          </Label>

          <div style={{ borderLeft:'2px dashed #888', paddingLeft: 14, marginLeft: 6 }}>
            {changelog.map((c, i) => (
              <div key={i} style={{ position:'relative', paddingBottom: 14 }}>
                <div style={{
                  position:'absolute', left:-21, top:4,
                  width:12, height:12, borderRadius:'50%',
                  background: i===0 ? '#1a6b3a' : '#fff',
                  border:'2px solid #333'
                }} />
                <div style={{ display:'flex', alignItems:'baseline', gap:10, flexWrap:'wrap' }}>
                  <Label size={16} bold color={i===0 ? '#1a6b3a' : '#222'} style={{ fontFamily:'JetBrains Mono, monospace' }}>{c.ver}</Label>
                  <Label size={12} color="#888" style={{ fontFamily:'JetBrains Mono, monospace' }}>{c.date}</Label>
                  {i===0 && <Pill color="#c8e8c8" textColor="#1a6b3a" size={10}>текущая</Pill>}
                </div>
                <Label size={13} color="#444" style={{ marginTop:2, lineHeight:1.3 }}>{c.desc}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* ────── Главный компонент ────── */
  const SECTIONS = [
    { id:'alerts', icon:'⚠', label:'Алерты и пороги',         Pane: PaneAlerts },
    { id:'tara',   icon:'📦', label:'Тара',                    Pane: PaneTara },
    { id:'week',   icon:'📅', label:'Рабочая неделя',          Pane: PaneWeek },
    { id:'units',  icon:'⚖', label:'Единицы измерения',       Pane: PaneUnits },
    { id:'users',  icon:'👥', label:'Пользователи и роли',     Pane: PaneUsers },
    { id:'backup', icon:'💾', label:'Резервное копирование',   Pane: PaneBackup },
    { id:'about',  icon:'ℹ', label:'О системе',                Pane: PaneAbout },
  ];

  const SettingsPage = ({ initialSection = 'alerts' } = {}) => {
    const [sec, setSec] = useState(initialSection);
    const Active = SECTIONS.find(s => s.id === sec) || SECTIONS[0];
    return (
      <div style={{
        display:'flex', flexDirection:'column',
        fontFamily:'Caveat', background:'#f0ede8',
        minHeight: '100%'
      }}>
        {/* Заголовок страницы */}
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          padding:'10px 16px', background:'#fff',
          borderBottom:'2px solid #333'
        }}>
          <span style={{ fontSize: 22 }}>⚙</span>
          <Label size={22} bold color="#222">Настройки</Label>
          <Label size={13} color="#888" style={{ fontStyle:'italic' }}>
            Конфигурация системы · доступно только администратору
          </Label>
          <div style={{ flex:1 }} />
          <Pill color="#ffd6c2" textColor="#8a2810" size={11}>● Админ</Pill>
        </div>

        <div style={{ display:'flex', flex:1, minHeight:0 }}>
          {/* Левое меню разделов */}
          <div style={{
            width: 240, flexShrink:0,
            background:'#fff', borderRight:'2px solid #333',
            padding:'8px 0'
          }}>
            {SECTIONS.map(s => {
              const active = s.id === sec;
              return (
                <div key={s.id}
                  onClick={() => setSec(s.id)}
                  style={{
                    display:'flex', alignItems:'center', gap:10,
                    padding:'8px 14px',
                    background: active ? '#1a6b3a' : 'transparent',
                    borderLeft: active ? '3px solid #7fd99c' : '3px solid transparent',
                    cursor:'pointer'
                  }}
                >
                  <span style={{ fontSize:16, width:20, textAlign:'center' }}>{s.icon}</span>
                  <Label size={14} bold color={active ? '#fff' : '#222'} style={{ flex:1 }}>
                    {s.label}
                  </Label>
                  {active && <span style={{ color:'#fff', fontSize:14 }}>▸</span>}
                </div>
              );
            })}

            <div style={{
              marginTop: 14, padding:'8px 14px',
              borderTop:'1px dashed #ccc'
            }}>
              <Label size={11} color="#888" style={{ fontStyle:'italic' }}>
                Изменения сохраняются автоматически
              </Label>
            </div>
          </div>

          {/* Правое содержимое */}
          <div className="wsm-scroll" style={{ flex:1, minWidth:0, overflowY:'auto', padding:'18px 24px' }}>
            <Active.Pane />

            {/* TODO-плашка */}
            <div style={{
              marginTop: 24,
              padding:'10px 14px',
              background:'#fff',
              border:'2px dashed #888', borderRadius:3,
              display:'flex', alignItems:'flex-start', gap:10
            }}>
              <span style={{ fontSize:18, lineHeight:1.2 }}>📝</span>
              <div style={{ flex:1 }}>
                <Label size={13} bold color="#555" style={{ textTransform:'uppercase', letterSpacing:1 }}>
                  TODO · Шаг 9 — Дашборд руководителя
                </Label>
                <Label size={13} color="#555" style={{ marginTop:3, lineHeight:1.3 }}>
                  Отдельная главная для роли «Руководитель» с агрегатами, KPI и мини-графиками.
                  Будет реализован после внедрения роли «Руководитель» в системе ролей
                  (см. раздел «Пользователи и роли»).
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  window.SettingsPage = SettingsPage;
})();
