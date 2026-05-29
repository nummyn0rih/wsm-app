# Справочники овощного сырья

_Started 2026-04-29 05:19 UTC_

---

## User

КОНТЕКСТ ПРОЕКТА

Система учёта отгрузок овощного сырья от поставщиков на переработку.
Текущее состояние — в файле Wireframes.html в проекте.

ВИЗУАЛЬНЫЙ ЯЗЫК (сохранять во всех новых экранах):
- Палитра сырья: огурцы — зелёный, черри — красно-розовый,
  томаты — оранжевый, патиссоны — жёлтый, халапеньо — тёмно-зелёный,
  перец — красно-зелёный градиент, баклажан — фиолетовый.
- Чипы статуса: «Запланировано» — жёлтый + полосатая штриховка строки,
  «Отправлено» — зелёный.
- Пилюли сырья, оверлейный скроллбар, типографика — как в существующих
  экранах.
- Tailwind через CDN, иконки lucide или эмодзи.

РОЛИ:
- Пользователь: главная (просмотр, поиск, фильтры, колонки,
  toggle Таблица/Heatmap, Excel, печать), справочник «Водители»
  (просмотр + поиск + фильтр по ТК), модалка карточки водителя,
  мобильный просмотр.
- Админ: всё вышеперечисленное + создание/редактирование везде,
  тара, ингредиенты, контракты, аналитика, остальные справочники.

ПРАВИЛА РАБОТЫ:
- Не переписывай существующие экраны, если в задаче явно не сказано
  обратное.
- Новые экраны добавляй в конец файла, в логических разделах.
- Никакой реальной логики — статичные wireframes с моковыми данными.

[ПРЕАМБУЛА]

ЗАДАЧА: дополнить раздел «Справочники» новыми сущностями и полями.

3.1. СПРАВОЧНИК «ВОДИТЕЛИ» (правки существующего)
   - Поля: ФИО, Телефон, ТК (select из справочника ТК), Инфо (textarea
     — произвольный текст).
   - Быстрый поиск (по ФИО и телефону) и фильтр по ТК.
   - Доступен на просмотр всем пользователям, редактирование —
     только админ.
   - Пример моковой записи:
     ФИО: Кобец Сергей Васильевич
     Телефон: +7 927 119 61 51
     ТК: АвтоЛогист
     Инфо: "DAF, В383НЕ_164, АН6222_64
            серия: 63 05 ј804684, выдан 30.03.2006 ОВД Екатериновского
            р-на Саратовской области"

3.2. НОВЫЙ СПРАВОЧНИК «СЕЗОНЫ»
   - Поля: Название (например, «Сезон 2025/2026»), флаг «Текущий».
   - Все сезоны идут с июня по май следующего года, точные даты
     не нужны — название самодостаточно.
   - Моковые записи: «Сезон 2024/2025», «Сезон 2025/2026» (текущий),
     «Сезон 2026/2027».

3.3. НОВЫЙ СПРАВОЧНИК «ВИДЫ ТАРЫ»
   - Поля: Название, Тип (ящик / бочка железо / бочка пластик).

3.4. НОВЫЙ СПРАВОЧНИК «ИНГРЕДИЕНТЫ»
   - Поля: Название, Единица измерения (литры / тонны / кг),
     Количество (текущий остаток на Заводе).
   - Моковые: уксус (литры), соль (тонны), аскорбиновая кислота (кг),
     пиросульфит (кг).

3.5. СПРАВОЧНИК «ПОСТАВЩИКИ» (правки существующего)
   - Добавить вкладку/секцию «Средний вес рейса по сырью»:
     таблица «Сырьё → Авто из истории (кг) → Ручное (кг) →
     ✓ использовать ручное».

Все формы редактирования — только для админа.

## Assistant

I'll start by reading the existing Wireframes.html to understand the visual language, then ask a couple of clarifying questions before building.

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

I have a clear picture of the existing visual language and structure. Now I'll build the new wireframes for section 3 (Справочники updates + new dictionaries) and append them to the file in a new section.

Plan:
- Update existing "Справочник Водители" with full fields (ФИО, Телефон, ТК select, Инфо textarea), search + ТК filter, edit modal (admin only), Кобец Сергей Васильевич mock record.
- New «Сезоны» dictionary with «Текущий» flag.
- New «Виды тары» dictionary (Название, Тип).
- New «Ингредиенты» dictionary (Название, ЕИ, Количество).
- Поставщики: вкладка «Средний вес рейса по сырью».
- Wrap each in DCArtboards inside a new DCSection «Справочники · детальные экраны (3.x)».

_[tool: str_replace_edit]_

## Assistant

I have a clear picture of the existing visual language. I'll add new artboards for the references work without rewriting existing code.

Plan:
1. Add a new file `references-extras.jsx` with: improved Drivers reference (with TK filter, search, fields ФИО/Телефон/ТК/Инфо), driver edit modal, Seasons reference, Tara types reference, Ingredients reference, Suppliers + "Средний вес рейса по сырью" tab.
2. Wire it into Wireframes.html as a new DCSection at the end.

_[tool: snip]_

Now I'll create the new references file and wire it into the wireframes.

_[tool: write_file]_

Now wire the new components into Wireframes.html — add the script tag and a new DCSection with all five new artboards.

_[tool: str_replace_edit]_

_[tool: snip]_

Now I'll add the new section to the App component with all five new artboards.

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: done]_

_[tool: snip]_

_[tool: fork_verifier_agent]_

Готово. Раздел «Справочники · доработки и новые сущности» добавлен в конец Wireframes.html, новые экраны:

- **3.1 Водители** — расширенный (поля ФИО/Телефон/ТК/Инфо), поиск + фильтр по ТК, отдельный экран для пользователя (только просмотр) и админа; отдельные артборды формы создания и редактирования.
- **3.2 Сезоны** — три записи, флаг «Текущий».
- **3.3 Виды тары** — группировка по типу (ящик / бочка железо / бочка пластик).
- **3.4 Ингредиенты** — уксус, соль, аскорбинка, пиросульфит (+ ещё пара) с остатком и индикатором уровня; пиросульфит подсвечен полосатой штриховкой как «ниже порога».
- **3.5 Поставщики · «Средний вес рейса по сырью»** — таблица сырьё → авто из истории → ручное → ✓ использовать ручное.

Существующие экраны не тронуты.

## User

Verifier agent check completed

## Assistant

_[tool: snip]_

Verifier passed. The references section is complete and added to Wireframes.html.

