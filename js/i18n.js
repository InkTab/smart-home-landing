/* i18n — data-i18n sets textContent, data-i18n-aria-label sets aria-label. */

(function (window, document) {
  "use strict";

  var STORE_KEY = "halo.lang";
  var DEFAULT = "en";

  var DICT = {
    en: {
      "meta.title": "Halo — Smart Home Installation",
      "meta.description":
        "Wireless, modular smart home systems designed around how you actually live. No drilling, no complicated installation, no commitment to one address.",

      "nav.label": "Main",
      "lang.label": "Language",

      "hero.title": "A smarter home that fits your life.",
      "hero.body":
        "From lighting and climate to security and everyday routines, your smart home is designed around how you actually live.",
      "hero.cta": "Build My Smart Home",
      "hero.trust": "Wireless · Modular · Movable",

      "w.climate.room": "Living room",
      "w.climate.name": "Climate",
      "w.climate.note": "Holding 22.0 °C",

      "w.humidity.room": "Bedroom",
      "w.humidity.name": "Humidity",
      "w.humidity.note": "Comfortable range",

      "w.door.room": "Front door",
      "w.door.name": "Door sensor",
      "w.door.closed": "Closed",
      "w.door.open": "Open",
      "w.door.note": "Armed",
      "w.door.noteOpen": "Opened just now",

      "w.lights.room": "Hallway",
      "w.lights.name": "Lights",
      "w.lights.note": "Warm · 2700 K",

      "w.hub.name": "System online",
      "w.hub.note": "12 devices · 4 rooms",

      "w.link.reconnecting": "Reconnecting",
      "w.link.connected": "Connected",

      "w.leak.title": "Water leak detected",
      "w.leak.note": "Basement · water shut off automatically",

      "problem.eyebrow": "Right now",
      "problem.title": "You’re the automation.",
      "problem.lede":
        "Either you’re still flipping switches to find out which is which, or you’re four weekends into research with nothing installed.",

      "problem.a.label": "Wall by the front door",
      "problem.a.shot": "Unlabeled switches · a thermostat nobody trusts",
      "problem.a.quote": "“Which one’s the porch light again?”",
      "problem.a.stat": "14",
      "problem.a.statNote": "switches — 2 you can name",

      "problem.b.label": "Kitchen table, week three",
      "problem.b.shot": "Cables, opened hub boxes, spec sheets, too many tabs",
      "problem.b.quote": "“Do I need the hub, or does the app do it?”",
      "problem.b.stat": "47",
      "problem.b.statNote": "tabs — 0 in the cart",

      /* The far face of each cell. Only the toggle's accessible name is copy. */
      "problem.a.flipPhoto": "The wall by the front door, with Halo",
      "problem.a.flipQuote": "The porch light, with Halo",
      "problem.a.flipStat": "The switches, with Halo",
      "problem.a.shotAfter": "One plate · every room named",
      "problem.a.labelAfter": "Wall by the front door",
      "problem.a.quoteAfter": "“I haven’t touched a switch in a month.”",
      "problem.a.statAfter": "0",
      "problem.a.statNoteAfter": "switches left to guess at",

      "problem.b.flipPhoto": "The kitchen table, with Halo",
      "problem.b.flipQuote": "The hub question, with Halo",
      "problem.b.flipStat": "The tabs, with Halo",
      "problem.b.shotAfter": "One box, one afternoon, nothing left to read",
      "problem.b.labelAfter": "Kitchen table, Thursday",
      "problem.b.quoteAfter": "“I still don’t know what a hub is.”",
      "problem.b.statAfter": "4h",
      "problem.b.statNoteAfter": "one visit, start to handover",

      /* Section 03 — each device is written once and read by its point and its card. */
      "plan.eyebrow": "Once it’s in",
      "plan.title": "The hardware disappears.",
      "plan.lede":
        "No new wall of switches, no tablet by the door. A dozen quiet devices you stop noticing by the second week — and a home that simply behaves.",
      "plan.hint.pointer": "Hover a point to see what is there",
      "plan.hint.touch": "Swipe the cards — the plan follows",
      "plan.photo":
        "Open-plan apartment: living room, kitchen and dining area by a wall of windows",
      "plan.note": "Two-bedroom loft · installed in one visit",

      "plan.media.pin": "Media, living room",
      "plan.media.room": "Living room",
      "plan.media.name": "TV & sound",
      "plan.media.state": "Standby",
      "plan.media.note": "One tap for cinema",

      "plan.hub.pin": "Hub, hallway",
      "plan.hub.room": "Hallway",
      "plan.hub.name": "Hub",
      "plan.hub.state": "Online",
      "plan.hub.note": "12 devices · 4 rooms",

      "plan.climate.pin": "Climate, living room",
      "plan.climate.room": "Living room",
      "plan.climate.name": "Climate",
      "plan.climate.value": "21.8",
      "plan.climate.note": "Holding 22.0 °C",

      "plan.lights.pin": "Ceiling lights, living room",
      "plan.lights.room": "Living room",
      "plan.lights.name": "Ceiling lights",
      "plan.lights.note": "Evening scene · 2700 K",

      "plan.lock.pin": "Smart lock, entry",
      "plan.lock.room": "Entry",
      "plan.lock.name": "Smart lock",
      "plan.lock.state": "Locked",
      "plan.lock.note": "Locks behind you",

      "plan.presence.pin": "Presence sensor, hallway",
      "plan.presence.room": "Hallway",
      "plan.presence.name": "Presence sensor",
      "plan.presence.state": "Clear",
      "plan.presence.note": "The light finds you",

      "plan.leak.pin": "Leak sensor, kitchen",
      "plan.leak.room": "Kitchen",
      "plan.leak.name": "Leak sensor",
      "plan.leak.state": "Dry",
      "plan.leak.note": "The valve closes on its own",

      "plan.shades.pin": "Shades, dining area",
      "plan.shades.room": "Dining area",
      "plan.shades.name": "Shades",
      "plan.shades.note": "Closing at sunset",

      /* Section 04 — the same system at four devices; readings match section 03. */
      "grow.eyebrow": "Start small",
      "grow.title": "Nobody starts with the whole house.",
      "grow.lede":
        "The hub goes in first. Everything after it is a decision you make later — one room at a time, in any order, whenever it suits you.",

      "grow.hub.room": "Hallway",
      "grow.hub.name": "Hub",
      "grow.hub.state": "Online",
      "grow.hub.note": "One room · four devices",

      "grow.lights.room": "Living room",
      "grow.lights.name": "Ceiling lights",
      "grow.lights.note": "Evening scene · 2700 K",

      "grow.climate.room": "Living room",
      "grow.climate.name": "Climate",
      "grow.climate.value": "21.8",
      "grow.climate.note": "Holding 22.0 °C",

      "grow.lock.room": "Entry",
      "grow.lock.name": "Smart lock",
      "grow.lock.state": "Locked",
      "grow.lock.note": "Locks behind you",

      "grow.more": "Whatever comes next",
      "grow.aside.label": "Room to grow",
      "grow.aside.body":
        "Cameras, blinds, plugs, a sensor for the boiler — each one pairs itself to the hub that is already there. Nothing has to be bought twice.",

      /* Section 05 — the calculator. {placeholders} let a translation reorder them. */
      "calc.eyebrow": "What it costs",
      "calc.title": "A number before anyone comes round.",
      "calc.lede":
        "Three questions, and not one of them is an inventory of your windows. What comes back is a range — the same one we would quote you after a survey.",

      "calc.step": "Step {n} of {of}",
      "calc.left.2": "2 steps left",
      "calc.left.1": "1 step left",
      "calc.left.0": "last step",
      "calc.tick.1": "Vision",
      "calc.tick.2": "Scale",
      "calc.tick.3": "Details",

      "calc.s1.title": "What do you want to solve today?",
      "calc.s1.hint": "Pick as many as apply.",
      "calc.goal.security.name": "Feeling secure",
      "calc.goal.security.hint": "Doors, windows, locks, cameras, leaks, garage",
      "calc.goal.climate.name": "Climate that holds itself",
      "calc.goal.climate.hint": "Thermostat and room temperature",
      "calc.goal.light.name": "Light and shade",
      "calc.goal.light.hint": "Switches, color, LED strips, blinds",

      "calc.s2.title": "How much house are we covering?",
      "calc.s2.hint": "The footprint is enough — nobody is counting your windows.",
      "calc.home.flat.name": "Apartment / Condo",
      "calc.home.flat.hint": "1–2 bedrooms",
      "calc.home.town.name": "Townhouse",
      "calc.home.town.hint": "2–3 bedrooms",
      "calc.home.house.name": "Single family home",
      "calc.home.house.hint": "3+ bedrooms",

      "calc.s3.title": "Anything that changes the count?",
      "calc.s3.hint":
        "Optional. The numbers already there are typical for the home you picked.",
      "calc.doors.label": "How many exterior doors do you have?",
      "calc.temp.label": "How many rooms need their own reading?",
      "calc.lights.label": "How many rooms get light control?",
      "calc.lawn.label": "Lawn watering",
      "calc.lawn.hint": "One controller, zoned across the lawn and the beds",

      "calc.back": "Back",
      "calc.next": "Continue",
      "calc.see": "See my estimate",

      "calc.result.label": "Your estimate",
      "calc.result.to": "to",
      "calc.result.pkg": "Package",
      "calc.result.home": "Home",
      "calc.result.tax": "+ tax",
      "calc.result.note":
        "This is an estimate. We create your personalized list before starting a project where you can remove or add items.",

      /* The bill: one line per kind of device, then the work, the one line in %. */
      "calc.item.hub": "Hub",
      "calc.item.contact": "Door and window sensors",
      "calc.item.lock": "Smart locks",
      "calc.item.camera": "Cameras",
      "calc.item.leak": "Leak sensors",
      "calc.item.garage": "Garage door controllers",
      "calc.item.thermostat": "Thermostat",
      "calc.item.temp": "Temperature sensors",
      "calc.item.control": "Light switches",
      "calc.item.bulb": "Color bulbs and LED strips",
      "calc.item.blind": "Blind controllers",
      "calc.item.lawn": "Watering controller",
      "calc.item.valve": "Water valves",
      "calc.item.work": "Installation, setup and handover",
      "calc.cta": "Email the Professional",
      "calc.again": "Adjust answers",

      /* The goals, in the order step one asks them; all three become one name. */
      "calc.pkg.security": "Security",
      "calc.pkg.climate": "Climate",
      "calc.pkg.light": "Light",
      "calc.pkg.join": " & ",
      "calc.pkg.all": "Whole Home",

      "calc.home.flat.full": "1–2 Bedroom Apartment",
      "calc.home.town.full": "2–3 Bedroom Townhouse",
      "calc.home.house.full": "3+ Bedroom Home",

      "calc.mail.subject": "Quote Request: {range} Smart Home",
      "calc.mail.body":
        "Hi team, I just used the calculator on your site. I'm interested in the {package} package for my {home}. The estimated range was {range}. I'd love to get a detailed breakdown and hardware list. Let me know the next steps!",

      "calc.unique": "Have a unique project?",
      "calc.unique.link": "Email us",

      /* Section 06 — the process. "About an hour" is an assumption, unlike the rest. */
      "flow.eyebrow": "How it goes",
      "flow.title": "Three steps, about two weeks.",
      "flow.lede":
        "One conversation to decide what goes in, one payment to order it, one visit to put it up. The only waiting is the shipping.",

      "flow.s1.title": "Consultation",
      "flow.s1.body":
        "We go through the place together and come out with one list of devices that fits the house, the way you live in it and what you want to spend. The range from the calculator becomes a list and a number.",
      "flow.s1.footLabel": "Takes",
      "flow.s1.footValue": "about an hour",

      "flow.s2.title": "Prepayment",
      "flow.s2.body":
        "Nothing sits waiting in a warehouse: every kit is ordered for its own project, so the hardware is paid for up front. That is what puts the order in.",
      "flow.s2.footLabel": "Then",
      "flow.s2.footValue": "ordered the same day",

      "flow.wait.value": "≈ 2 weeks",
      "flow.wait.body":
        "Delivery. Nothing is needed from you in here — we tell you the day it lands and book the install around your week.",

      "flow.s3.title": "Installation",
      "flow.s3.body":
        "One visit. Everything is mounted, paired, named and tested, and then we walk you through it — four hours for an apartment, up to eight for a house.",
      "flow.s3.footLabel": "On site",
      "flow.s3.footValue": "4–8 hours",

      "flow.done.title": "And that is all.",
      "flow.done.body": "A house that works, and nothing left on your list.",

      /* Section 07 — the year of support is the only new claim, and narrow on purpose. */
      "adapt.eyebrow": "After handover",
      "adapt.title": "Nothing here is set in stone.",
      "adapt.lede":
        "You can add to it, you can take it with you — and for the first year we keep it running so you do not have to think about it.",

      "adapt.add.title": "Add whatever comes next",
      "adapt.add.body":
        "A camera, blinds, a sensor for the boiler. Each one pairs itself to the hub that is already there, in any order, whenever it suits you — and nothing already installed has to be bought again.",

      "adapt.move.title": "It unplugs",
      "adapt.move.body":
        "Nothing is chased into a wall and nothing is drilled. The system comes off in an afternoon and goes back up at the next address: the same hub, the same devices, the same routines.",

      "adapt.year.label": "Lifestyle adaptation",
      "adapt.year.badge": "Included · first year",
      "adapt.year.title": "12 months of support included.",
      "adapt.year.body":
        "Not a call center. The person who set your system up, on the other end of it.",

      /* Lead-in and sentence are two keys: the dictionary holds text, not markup. */
      "adapt.year.a.lead": "Anything you add, we set up.",
      "adapt.year.a.body":
        "Buy a device later and we pair it, name it and put it into the routines that already run.",
      "adapt.year.b.lead": "Batteries before they die.",
      "adapt.year.b.body":
        "We watch which sensors are getting low and change them, so you never meet a dead one.",
      "adapt.year.c.lead": "A message, not a ticket.",
      "adapt.year.c.body":
        "If something is behaving oddly we look at the system from here, and usually fix it without coming round.",

      "adapt.dim.from": "Handover",
      "adapt.dim.to": "12 months"
    },

    ru: {
      "meta.title": "Halo — Установка умного дома",
      "meta.description":
        "Беспроводные модульные системы умного дома, собранные под то, как вы действительно живёте. Без сверления, без сложной установки, без привязки к одному адресу.",

      "nav.label": "Основная навигация",
      "lang.label": "Язык",

      "hero.title": "Умный дом, который подстраивается под вашу жизнь.",
      "hero.body":
        "Освещение, климат, безопасность и повседневные сценарии — всё создаётся с учётом того, как вы действительно живёте.",
      "hero.cta": "Собрать мой умный дом",
      "hero.trust": "Беспроводной · Модульный · Переносимый",

      "w.climate.room": "Гостиная",
      "w.climate.name": "Климат",
      "w.climate.note": "Держит 22,0 °C",

      "w.humidity.room": "Спальня",
      "w.humidity.name": "Влажность",
      "w.humidity.note": "Комфортный уровень",

      "w.door.room": "Входная дверь",
      "w.door.name": "Датчик двери",
      "w.door.closed": "Закрыто",
      "w.door.open": "Открыто",
      "w.door.note": "Под охраной",
      "w.door.noteOpen": "Только что открыли",

      "w.lights.room": "Прихожая",
      "w.lights.name": "Свет",
      "w.lights.note": "Тёплый · 2700 K",

      "w.hub.name": "Система на связи",
      "w.hub.note": "12 устройств · 4 зоны",

      "w.link.reconnecting": "Переподключение",
      "w.link.connected": "Подключено",

      "w.leak.title": "Обнаружена протечка",
      "w.leak.note": "Подвал · вода перекрыта автоматически",

      "problem.eyebrow": "Пока что",
      "problem.title": "Автоматика в вашем доме — это вы.",
      "problem.lede":
        "Либо вы до сих пор щёлкаете выключателями наугад, либо четвёртые выходные читаете обзоры — а дома так ничего и не появилось.",

      "problem.a.label": "Стена у входной двери",
      "problem.a.shot": "Выключатели без подписей · термостат, которому не верят",
      "problem.a.quote": "«Какой из них свет на крыльце?»",
      "problem.a.stat": "14",
      "problem.a.statNote": "выключателей — 2 вы можете назвать",

      "problem.b.label": "Кухонный стол, третья неделя",
      "problem.b.shot": "Провода, вскрытые коробки хабов, спецификации, вкладки",
      "problem.b.quote": "«А хаб вообще нужен, или всё через приложение?»",
      "problem.b.stat": "47",
      "problem.b.statNote": "вкладок — 0 в корзине",

      "problem.a.flipPhoto": "Стена у входной двери — с Halo",
      "problem.a.flipQuote": "Свет на крыльце — с Halo",
      "problem.a.flipStat": "Выключатели — с Halo",
      "problem.a.shotAfter": "Одна панель · у каждой комнаты есть имя",
      "problem.a.labelAfter": "Стена у входной двери",
      "problem.a.quoteAfter": "«Уже месяц не подхожу к выключателям.»",
      "problem.a.statAfter": "0",
      "problem.a.statNoteAfter": "выключателей, которые надо угадывать",

      "problem.b.flipPhoto": "Кухонный стол — с Halo",
      "problem.b.flipQuote": "Вопрос про хаб — с Halo",
      "problem.b.flipStat": "Вкладки — с Halo",
      "problem.b.shotAfter": "Одна коробка, один день, читать больше нечего",
      "problem.b.labelAfter": "Кухонный стол, четверг",
      "problem.b.quoteAfter": "«Я до сих пор не знаю, что такое хаб.»",
      "problem.b.statAfter": "4 ч",
      "problem.b.statNoteAfter": "один визит — от начала до сдачи",

      "plan.eyebrow": "Когда всё уже стоит",
      "plan.title": "Оборудование исчезает.",
      "plan.lede":
        "Ни новой стены выключателей, ни планшета у двери. Десяток незаметных устройств, которые перестаёшь замечать на вторую неделю, — и дом, который просто работает.",
      "plan.hint.pointer": "Наведите на точку — увидите устройство",
      "plan.hint.touch": "Листайте карточки — план следует за ними",
      "plan.photo":
        "Квартира со свободной планировкой: гостиная, кухня и столовая у панорамных окон",
      "plan.note": "Двухкомнатный лофт · установка за один визит",

      "plan.media.pin": "Медиа, гостиная",
      "plan.media.room": "Гостиная",
      "plan.media.name": "ТВ и звук",
      "plan.media.state": "Ожидание",
      "plan.media.note": "Кино — одним касанием",

      "plan.hub.pin": "Хаб, прихожая",
      "plan.hub.room": "Прихожая",
      "plan.hub.name": "Хаб",
      "plan.hub.state": "На связи",
      "plan.hub.note": "12 устройств · 4 зоны",

      "plan.climate.pin": "Климат, гостиная",
      "plan.climate.room": "Гостиная",
      "plan.climate.name": "Климат",
      "plan.climate.value": "21,8",
      "plan.climate.note": "Держит 22,0 °C",

      "plan.lights.pin": "Потолочный свет, гостиная",
      "plan.lights.room": "Гостиная",
      "plan.lights.name": "Потолочный свет",
      "plan.lights.note": "Вечерний сценарий · 2700 K",

      "plan.lock.pin": "Умный замок, вход",
      "plan.lock.room": "Вход",
      "plan.lock.name": "Умный замок",
      "plan.lock.state": "Заперто",
      "plan.lock.note": "Закроется за вами",

      "plan.presence.pin": "Датчик присутствия, прихожая",
      "plan.presence.room": "Прихожая",
      "plan.presence.name": "Датчик присутствия",
      "plan.presence.state": "Никого",
      "plan.presence.note": "Свет находит вас сам",

      "plan.leak.pin": "Датчик протечки, кухня",
      "plan.leak.room": "Кухня",
      "plan.leak.name": "Датчик протечки",
      "plan.leak.state": "Сухо",
      "plan.leak.note": "Кран перекроется сам",

      "plan.shades.pin": "Шторы, столовая",
      "plan.shades.room": "Столовая",
      "plan.shades.name": "Шторы",
      "plan.shades.note": "Закроются на закате",

      "grow.eyebrow": "Начните с малого",
      "grow.title": "Никто не начинает со всего дома.",
      "grow.lede":
        "Сначала ставится хаб. Всё остальное — решения, которые можно принять потом: по одной комнате, в любом порядке и тогда, когда вам удобно.",

      "grow.hub.room": "Прихожая",
      "grow.hub.name": "Хаб",
      "grow.hub.state": "На связи",
      "grow.hub.note": "Одна комната · четыре устройства",

      "grow.lights.room": "Гостиная",
      "grow.lights.name": "Потолочный свет",
      "grow.lights.note": "Вечерний сценарий · 2700 K",

      "grow.climate.room": "Гостиная",
      "grow.climate.name": "Климат",
      "grow.climate.value": "21,8",
      "grow.climate.note": "Держит 22,0 °C",

      "grow.lock.room": "Вход",
      "grow.lock.name": "Умный замок",
      "grow.lock.state": "Заперто",
      "grow.lock.note": "Закроется за вами",

      "grow.more": "Что появится потом",
      "grow.aside.label": "Есть куда расти",
      "grow.aside.body":
        "Камеры, шторы, розетки, датчик у котла — каждое само подключается к уже стоящему хабу. Ничего не придётся покупать дважды.",

      "calc.eyebrow": "Сколько это стоит",
      "calc.title": "Цифра до того, как кто-то приедет.",
      "calc.lede":
        "Три вопроса — и ни одного о том, сколько у вас окон. В ответ вы получите вилку: ту же, что мы назвали бы после осмотра.",

      "calc.step": "Шаг {n} из {of}",
      "calc.left.2": "осталось 2 шага",
      "calc.left.1": "остался 1 шаг",
      "calc.left.0": "последний шаг",
      "calc.tick.1": "Цель",
      "calc.tick.2": "Масштаб",
      "calc.tick.3": "Детали",

      "calc.s1.title": "Что вы хотите решить сегодня?",
      "calc.s1.hint": "Выберите всё, что подходит.",
      "calc.goal.security.name": "Спокойствие в доме",
      "calc.goal.security.hint": "Двери, окна, замки, камеры, протечки, гараж",
      "calc.goal.climate.name": "Климат, который держится сам",
      "calc.goal.climate.hint": "Термостат и температура по комнатам",
      "calc.goal.light.name": "Свет и шторы",
      "calc.goal.light.hint": "Выключатели, цвет, LED-ленты, шторы",

      "calc.s2.title": "Какой у вас дом?",
      "calc.s2.hint": "Достаточно общего масштаба — окна никто не считает.",
      "calc.home.flat.name": "Квартира",
      "calc.home.flat.hint": "1–2 спальни",
      "calc.home.town.name": "Таунхаус",
      "calc.home.town.hint": "2–3 спальни",
      "calc.home.house.name": "Отдельный дом",
      "calc.home.house.hint": "от 3 спален",

      "calc.s3.title": "Что-то, что меняет расчёт?",
      "calc.s3.hint":
        "Необязательно. Значения уже выставлены — типичные для выбранного дома.",
      "calc.doors.label": "Сколько у вас наружных дверей?",
      "calc.temp.label": "Скольким комнатам нужен свой датчик?",
      "calc.lights.label": "В скольких комнатах управлять светом?",
      "calc.lawn.label": "Полив газона",
      "calc.lawn.hint": "Один контроллер, по зонам: газон и грядки",

      "calc.back": "Назад",
      "calc.next": "Далее",
      "calc.see": "Показать оценку",

      "calc.result.label": "Ваша оценка",
      "calc.result.to": "до",
      "calc.result.pkg": "Пакет",
      "calc.result.home": "Дом",
      "calc.result.tax": "+ налог",
      "calc.result.note":
        "Это оценка. Перед стартом проекта мы соберём для вас персональный список — из него можно убрать позиции или добавить новые.",

      "calc.item.hub": "Хаб",
      "calc.item.contact": "Датчики дверей и окон",
      "calc.item.lock": "Умные замки",
      "calc.item.camera": "Камеры",
      "calc.item.leak": "Датчики протечки",
      "calc.item.garage": "Приводы гаражных ворот",
      "calc.item.thermostat": "Термостат",
      "calc.item.temp": "Датчики температуры",
      "calc.item.control": "Выключатели света",
      "calc.item.bulb": "Цветные лампы и LED-ленты",
      "calc.item.blind": "Приводы штор",
      "calc.item.lawn": "Контроллер полива",
      "calc.item.valve": "Клапаны полива",
      "calc.item.work": "Монтаж, настройка и сдача",
      "calc.cta": "Написать специалисту",
      "calc.again": "Изменить ответы",

      "calc.pkg.security": "Безопасность",
      "calc.pkg.climate": "Климат",
      "calc.pkg.light": "Свет",
      "calc.pkg.join": " и ",
      "calc.pkg.all": "Весь дом",

      "calc.home.flat.full": "квартира на 1–2 спальни",
      "calc.home.town.full": "таунхаус на 2–3 спальни",
      "calc.home.house.full": "дом от 3 спален",

      "calc.mail.subject": "Запрос сметы: умный дом {range}",
      "calc.mail.body":
        "Здравствуйте! Пользуюсь калькулятором на вашем сайте. Интересует пакет «{package}» для варианта «{home}». Оценка получилась {range}. Хочу получить подробный расчёт и список оборудования. Подскажите, какие дальше шаги!",

      "calc.unique": "Нестандартный проект?",
      "calc.unique.link": "Напишите нам",

      "flow.eyebrow": "Как это проходит",
      "flow.title": "Три шага и примерно две недели.",
      "flow.lede":
        "Один разговор, чтобы решить, что ставим, одна предоплата, чтобы это заказать, и один выезд, чтобы всё смонтировать. Ждать приходится только доставку.",

      "flow.s1.title": "Консультация",
      "flow.s1.body":
        "Проходим по дому вместе и выходим с одним списком устройств, который подходит и дому, и тому, как вы в нём живёте, и тому, сколько вы готовы потратить. Вилка из калькулятора превращается в список и одну сумму.",
      "flow.s1.footLabel": "Занимает",
      "flow.s1.footValue": "около часа",

      "flow.s2.title": "Предоплата",
      "flow.s2.body":
        "Ничего не лежит на складе: каждый комплект заказывается под свой проект, поэтому оборудование оплачивается заранее. Именно предоплата запускает заказ.",
      "flow.s2.footLabel": "Дальше",
      "flow.s2.footValue": "заказ в тот же день",

      "flow.wait.value": "≈ 2 недели",
      "flow.wait.body":
        "Доставка. Здесь от вас ничего не нужно — мы сообщим в день, когда всё придёт, и подберём день монтажа под вашу неделю.",

      "flow.s3.title": "Монтаж",
      "flow.s3.body":
        "Один выезд. Всё ставится, подключается, получает имя и проверяется, а потом мы показываем, как этим пользоваться, — четыре часа на квартиру и до восьми на дом.",
      "flow.s3.footLabel": "На месте",
      "flow.s3.footValue": "4–8 часов",

      "flow.done.title": "И это всё.",
      "flow.done.body":
        "Дом работает, а в вашем списке дел ничего не осталось.",

      "adapt.eyebrow": "После сдачи",
      "adapt.title": "Здесь ничто не сделано навсегда.",
      "adapt.lede":
        "Систему можно дополнить, её можно забрать с собой — а первый год мы сами следим за тем, чтобы она работала, и думать об этом не придётся.",

      "adapt.add.title": "Добавьте то, что появится потом",
      "adapt.add.body":
        "Камера, шторы, датчик у котла. Каждое устройство само подключается к уже стоящему хабу — в любом порядке и тогда, когда вам удобно, — а то, что уже стоит, покупать заново не нужно.",

      "adapt.move.title": "Она снимается",
      "adapt.move.body":
        "Ничего не спрятано в стену и ничего не просверлено. Система снимается за вечер и поднимается на новом адресе: тот же хаб, те же устройства, те же сценарии.",

      "adapt.year.label": "Адаптация под жизнь",
      "adapt.year.badge": "Включено · первый год",
      "adapt.year.title": "12 месяцев поддержки включены.",
      "adapt.year.body":
        "Никакого колл-центра. На связи тот же человек, который собрал вашу систему.",

      "adapt.year.a.lead": "Всё, что вы добавите, настроим мы.",
      "adapt.year.a.body":
        "Купите устройство позже — мы его подключим, назовём и впишем в сценарии, которые уже работают.",
      "adapt.year.b.lead": "Батарейки — до того, как они сядут.",
      "adapt.year.b.body":
        "Мы видим, у каких датчиков заряд на исходе, и меняем батарейки сами: разряженный датчик вам не встретится.",
      "adapt.year.c.lead": "Сообщение, а не заявка.",
      "adapt.year.c.body":
        "Если что-то ведёт себя странно, мы посмотрим систему отсюда и обычно починим, не приезжая.",

      "adapt.dim.from": "Сдача",
      "adapt.dim.to": "12 месяцев"
    }
  };

  function stored() {
    try {
      return window.localStorage.getItem(STORE_KEY);
    } catch (e) {
      return null;
    }
  }

  function remember(lang) {
    try {
      window.localStorage.setItem(STORE_KEY, lang);
    } catch (e) {
      /* private mode — the page still works, it just forgets. */
    }
  }

  function fromSystem() {
    var langs = window.navigator.languages || [window.navigator.language || ""];
    for (var i = 0; i < langs.length; i++) {
      var tag = String(langs[i]).toLowerCase();
      if (tag.indexOf("ru") === 0) return "ru";
      if (tag.indexOf("en") === 0) return "en";
    }
    return DEFAULT;
  }

  var current = DICT[stored()] ? stored() : fromSystem();

  function t(key) {
    var table = DICT[current] || DICT[DEFAULT];
    return Object.prototype.hasOwnProperty.call(table, key) ? table[key] : key;
  }

  /* Translate a subtree in place: on load, on a switch, and after any runtime write. */
  function apply(root) {
    var scope = root || document;

    if (scope === document) {
      document.documentElement.lang = current;
      document.title = t("meta.title");
      var meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", t("meta.description"));
    }

    var nodes = scope.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = t(nodes[i].getAttribute("data-i18n"));
    }
    if (scope.nodeType === 1 && scope.hasAttribute("data-i18n")) {
      scope.textContent = t(scope.getAttribute("data-i18n"));
    }

    var labeled = scope.querySelectorAll("[data-i18n-aria-label]");
    for (var j = 0; j < labeled.length; j++) {
      labeled[j].setAttribute(
        "aria-label",
        t(labeled[j].getAttribute("data-i18n-aria-label"))
      );
    }
  }

  function set(lang) {
    if (!DICT[lang] || lang === current) return;
    current = lang;
    remember(lang);
    apply(document);
    syncSwitch();
    document.dispatchEvent(
      new CustomEvent("halo:langchange", { detail: { lang: current } })
    );
  }

  function syncSwitch() {
    var buttons = document.querySelectorAll(".langswitch [data-lang]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute(
        "aria-pressed",
        buttons[i].getAttribute("data-lang") === current ? "true" : "false"
      );
    }
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest(".langswitch [data-lang]");
    if (button) set(button.getAttribute("data-lang"));
  });

  window.Halo = window.Halo || {};
  window.Halo.i18n = {
    t: t,
    set: set,
    apply: apply,
    get lang() {
      return current;
    }
  };

  apply(document);
  syncSwitch();
})(window, document);
