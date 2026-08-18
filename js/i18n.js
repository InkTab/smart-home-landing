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
      "w.leak.note": "Basement · water shut off automatically"
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
      "w.leak.note": "Подвал · вода перекрыта автоматически"
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
