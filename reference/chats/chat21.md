# Система учёта отгрузок овощей

_Started 2026-05-25 19:07 UTC_

---

## User

КОНТЕКСТ ПРОЕКТА

Система учёта отгрузок овощного сырья от поставщиков на переработку.
Текущее состояние — в файле Wireframes.html в проекте.

ВИЗУАЛЬНЫЙ ЯЗЫК (сохранять во всех новых экранах):

Палитра сырья: огурцы — зелёный, черри — красно-розовый,
томаты — оранжевый, патиссоны — жёлтый, халапеньо — тёмно-зелёный,
перец — красно-зелёный градиент, баклажан — фиолетовый.

Чипы статуса: «Запланировано» — жёлтый + полосатая штриховка строки,
«Отправлено» — зелёный.

Пилюли сырья, оверлейный скроллбар, типографика — как в существующих
экранах.

Tailwind через CDN, иконки lucide или эмодзи.

РОЛИ:

Пользователь: главная (просмотр, поиск, фильтры, колонки,
toggle Таблица/Heatmap, Excel, печать), справочник «Водители»
(просмотр + поиск + фильтр по ТК), модалка карточки водителя,
мобильный просмотр.

Админ: всё вышеперечисленное + создание/редактирование везде,
тара, ингредиенты, контракты, аналитика, остальные справочники.

ПРАВИЛА РАБОТЫ:

Не переписывай существующие экраны, если в задаче явно не сказано
обратное.

Новые экраны добавляй в конец файла, в логических разделах.

Никакой реальной логики — статичные wireframes с моковыми данными.

## Assistant

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: update_todos]_

Let me make the changes. I'll start with `plan-view.jsx` (color rules + compact widths + working "Раскрыть"), then update `Wireframes.html` (planned shipments in main table + filter + heatmap demo data).

_[tool: str_replace_edit]_

Now let me update `plan-view.jsx`:

_[tool: str_replace_edit]_

Now compact the PlanCell to fit ~98px day-column:Now update column widths and the legend in PlanView:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now add the "Раскрыть в полную отгрузку" stub modal. Add it before `window.PlanView = PlanView;`:

_[tool: str_replace_edit]_

Now wire the expand modal to ShipmentsList and PlanView state:Now pass the expand handlers through and render the modal:

_[tool: str_replace_edit]_

Now update ShipmentsList to call onExpand:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now update Wireframes.html — add visual treatment for "План" status in Shipment, add demo planned items, filter bar updates, and heatmap mock with planned data.

_[tool: str_replace_edit]_

Add filter state, "Скрыть плановые" checkbox, and План-status demo shipments to Day 21 / Day 22:Now update filter bar to show "Скрыть плановые" toggle, and add План to status filter:

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: run_script]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now update the heatmap mock to include planned tonnage and add a legend note:

_[tool: str_replace_edit]_

_[tool: update_todos]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Готово. Краткая сводка изменений по 8.3а-2:

**Часть 1 — ширина** · `plan-view.jsx`: VEG=148 / DAY=98 / TOTAL=116. `PlanCell` сжата до 58 px высоты — план/факт в одну строку, тонкий прогресс-бар (2 px), крупный %, счётчик отгрузок как кружок-бейдж. Клик по всей ячейке открывает детализацию.

**Часть 2 — цвет ячеек** · правило зафиксировано: добавлен новый стейт `emptyOver` (план=0, факт>0 → оранжевый); пороги выровнены до 80/100/120 % (было 90/100/110). Серый остаётся только когда план=0 и факт=0. Легенда отражает все 6 состояний.

**Часть 3 — План в режиме «Таблица»** · `Wireframes.html`: в `Shipment` добавлен `planLook` для статуса «План» — мягкий фон, фиолетовая полоса слева, opacity 0.92, плейсхолдер «🕒 водитель ещё не назначен». В мок Day 21 / Day 22 добавлены 3 «План»-записи. В фильтр-панель добавлен чекбокс **«Скрыть плановые»** (по умолчанию ВЫКЛ) и фильтр статуса теперь циклирует значения: все · План · Запланировано · Отправлено · Прибыло — рендер обёрнут в локальный `<Ship>`-фильтр.

**Часть 4 — Heatmap** · `pivot-summary.jsx`: данные обновлены, плановые тоннажи добавлены в ячейки наравне с фактом (без отдельного переключателя), легенда P2 обновлена.

**Часть 5 — «Раскрыть в полную отгрузку»** · добавлен `ExpandModal`: показывает предзаполненный блок (фермер · овощ · дата · тоннаж план), пустые поля для дозаполнения (водитель, машина, дата отправки, тара, документы, переработка) и инфо-блок о смене статуса «План → Запланировано» без дубликата. По «✓ Сохранить и перевести» в `PlanView` применяется `statusOverride` — запись остаётся одной сущностью, факт-набрано не сдвигается.

**Части 6 / 7** — уже работали в 8.3а-1; «факт» считается как сумма всех отгрузок (любого статуса), удаление доступно только для «План» — оставлено.

