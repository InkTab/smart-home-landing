/* ==========================================================================
   i18n — two languages, one dictionary.

   The page starts in the system language and can be switched by hand; the
   choice is remembered. Markup carries the keys:

     data-i18n="key"                 -> textContent
     data-i18n-aria-label="key"      -> aria-label

   Anything the script writes back into the DOM later (the door state) goes
   through Halo.i18n.apply(node) so it stays translated.
   ========================================================================== */

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
      "hero.trust": "Wireless · Modular · Moveable",

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
      "problem.a.shot": "Unlabelled switches · a thermostat nobody trusts",
      "problem.a.quote": "“Which one’s the porch light again?”",
      "problem.a.stat": "14",
      "problem.a.statNote": "switches — 2 you can name",

      "problem.b.label": "Kitchen table, week three",
      "problem.b.shot": "Cables, opened hub boxes, spec sheets, too many tabs",
      "problem.b.quote": "“Do I need the hub, or does the app do it?”",
      "problem.b.stat": "47",
      "problem.b.statNote": "tabs — 0 in the cart",

      /* The other side of every cell: the same wall, the same table, the
         same question — once somebody has installed it. Only the toggle's
         accessible name is copy here; the button itself is an arrow. */
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

      /* Section 03 — the same apartment, finished. Every device is written
         once here and read twice: by the point on the photograph and by the
         card that belongs to it. */
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

      /* Section 04 — the same system, on the day it was four devices. The
         readings match section 03; what changes is how much of the house is
         in it, which is the whole point of the section. */
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
        "Cameras, blinds, plugs, a sensor for the boiler — each one pairs itself to the hub that is already there. Nothing has to be bought twice."
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
        "Камеры, шторы, розетки, датчик у котла — каждое само подключается к уже стоящему хабу. Ничего не придётся покупать дважды."
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

  /* Translate a subtree in place. Called on load, on every switch, and by
     anything that rewrites a key at runtime. */
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

    var labelled = scope.querySelectorAll("[data-i18n-aria-label]");
    for (var j = 0; j < labelled.length; j++) {
      labelled[j].setAttribute(
        "aria-label",
        t(labelled[j].getAttribute("data-i18n-aria-label"))
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
