/* Calc — three disclosed questions costed into a price range, ending in a mailto:. */

(function (window, document) {
  "use strict";

  var section = document.querySelector(".calc");
  if (!section) return;

  var console_ = section.querySelector("[data-calc]");
  if (!console_) return;

  var i18n = window.Halo && window.Halo.i18n;
  var t = i18n
    ? i18n.t
    : function (key) {
        return key;
      };

  var MAIL = "hello@yoursmarthome.com";
  var STEPS = 3;

  /* ---- The price list ------------------------------------------------------ */

  /* Hardware per device before tax, as [floor, ceiling]; the pairs make it a range. */
  var PRICES = {
    hub: [180, 180], /* one per home, always */
    contact: [30, 30], /* door and window sensor */
    lock: [80, 280],
    camera: [50, 220],
    leak: [22, 22],
    garage: [40, 40],
    thermostat: [250, 250], /* one per home */
    temp: [22, 22], /* room temperature sensor */
    control: [50, 120], /* light switch */
    bulb: [25, 150], /* color bulb or LED strip */
    blind: [50, 50],
    lawn: [50, 50], /* watering controller, one per garden */
    valve: [80, 80] /* one per watering zone */
  };

  /* Fitting, commissioning and handover, on top of the hardware. */
  var WORK = 0.3;
  var ROUND_TO = 10;

  /* ---- What is in a home ---------------------------------------------------- */

  /* What the footprint answers for the visitor. doors/temp/lights seed the sliders. */
  var HOMES = {
    flat: {
      doors: 1, temp: 2, lights: 3,
      windows: 4, cameras: 1, leaks: 2, garages: 0, blinds: 3
    },
    town: {
      doors: 2, temp: 3, lights: 5,
      windows: 7, cameras: 2, leaks: 3, garages: 1, blinds: 5
    },
    house: {
      doors: 3, temp: 5, lights: 8,
      windows: 11, cameras: 4, leaks: 4, garages: 2, blinds: 8,
      zones: 4 /* watering zones, and the only line a flat never has */
    }
  };

  /* The lawn is the one question the footprint asks rather than a goal. */
  var LAWN_HOME = "house";

  /* Markup order, not click order: the same answers must name the package the same. */
  var GOAL_ORDER = ["security", "climate", "light"];

  /* Slider per goal, so a goal nobody picked takes its question off the page. */
  var GOAL_REFINE = {
    security: "doors",
    climate: "temp",
    light: "lights"
  };

  /* ---- The console's pieces ---------------------------------------------- */

  var progress = console_.querySelector("[data-calc-progress]");
  var counter = console_.querySelector("[data-calc-count]");
  var stepOut = console_.querySelector("[data-calc-step]");
  var leftOut = console_.querySelector("[data-calc-left]");
  var ticks = console_.querySelectorAll(".calc__tick[data-tick]");

  var panels = {};
  var found = console_.querySelectorAll("[data-calc-panel]");
  for (var p = 0; p < found.length; p++) {
    panels[found[p].getAttribute("data-calc-panel")] = found[p];
  }

  var nav = console_.querySelector("[data-calc-nav]");
  var back = console_.querySelector("[data-calc-back]");
  var next = console_.querySelector("[data-calc-next]");

  var lowOut = console_.querySelector("[data-calc-low]");
  var highOut = console_.querySelector("[data-calc-high]");
  var toOut = console_.querySelector("[data-calc-to]");
  var spanOut = console_.querySelector("[data-calc-span]");
  var pkgOut = console_.querySelector("[data-calc-pkg]");
  var homeOut = console_.querySelector("[data-calc-home]");
  var billOut = console_.querySelector("[data-calc-bill]");
  var mailOut = console_.querySelector("[data-calc-mail]");
  var restart = console_.querySelector("[data-calc-restart]");

  var goalInputs = console_.querySelectorAll("[data-goal]");
  var homeInputs = console_.querySelectorAll("[data-home]");
  var lawnInput = console_.querySelector("[data-lawn]");
  var sliders = console_.querySelectorAll("[data-refine-in]");

  if (!panels["1"] || !panels["2"] || !panels["3"] || !panels.result) return;

  /* ---- State -------------------------------------------------------------- */

  var view = 1; /* 1, 2, 3 — or "result" */
  var home = null;
  var touched = {}; /* sliders moved by hand; the rest still follow the home */

  function goals() {
    var picked = [];
    for (var i = 0; i < GOAL_ORDER.length; i++) {
      var input = console_.querySelector('[data-goal="' + GOAL_ORDER[i] + '"]');
      if (input && input.checked) picked.push(GOAL_ORDER[i]);
    }
    return picked;
  }

  function chose(goal) {
    return goals().indexOf(goal) !== -1;
  }

  function count(name) {
    var input = console_.querySelector('[data-refine-in="' + name + '"]');
    return input ? Number(input.value) : 0;
  }

  function watering() {
    return home === LAWN_HOME && !!lawnInput && lawnInput.checked;
  }

  /* ---- The bill ------------------------------------------------------------- */

  /* Both figures and the printed lines read this one list, so they cannot disagree. */
  function bill() {
    var plan = HOMES[home] || HOMES.flat;
    var lines = [{ item: "hub", n: 1 }];

    if (chose("security")) {
      var doors = count("doors");
      lines.push({ item: "contact", n: doors + plan.windows });
      lines.push({ item: "lock", n: doors });
      lines.push({ item: "camera", n: plan.cameras });
      lines.push({ item: "leak", n: plan.leaks });
      if (plan.garages) lines.push({ item: "garage", n: plan.garages });
    }

    if (chose("climate")) {
      lines.push({ item: "thermostat", n: 1 });
      lines.push({ item: "temp", n: count("temp") });
    }

    if (chose("light")) {
      var rooms = count("lights");
      lines.push({ item: "control", n: rooms });
      lines.push({ item: "bulb", n: rooms });
      lines.push({ item: "blind", n: plan.blinds });
    }

    if (watering()) {
      lines.push({ item: "lawn", n: 1 });
      lines.push({ item: "valve", n: plan.zones });
    }

    return lines;
  }

  /* Every line at its floor, then at its ceiling, with the same work % on both. */
  function estimate() {
    var lines = bill();
    var low = 0;
    var high = 0;

    for (var i = 0; i < lines.length; i++) {
      var price = PRICES[lines[i].item];
      low += price[0] * lines[i].n;
      high += price[1] * lines[i].n;
    }

    return {
      low: round(low * (1 + WORK)),
      high: round(high * (1 + WORK))
    };
  }

  function round(value) {
    return Math.round(value / ROUND_TO) * ROUND_TO;
  }

  /* Dollars in both languages — the email must read the same whichever wrote it. */
  function money(value) {
    return "$" + String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  /* The range as one string. An all-fixed-price job is one figure, not "$620–$620". */
  function range() {
    var sum = estimate();
    return sum.low === sum.high
      ? money(sum.low)
      : money(sum.low) + "–" + money(sum.high);
  }

  /* ---- What to call it ---------------------------------------------------- */

  function packageName() {
    var picked = goals();
    if (picked.length === GOAL_ORDER.length) return t("calc.pkg.all");

    var names = [];
    for (var i = 0; i < picked.length; i++) names.push(t("calc.pkg." + picked[i]));
    return names.join(t("calc.pkg.join"));
  }

  function homeName() {
    return home ? t("calc.home." + home + ".full") : "";
  }

  /* ---- The letter --------------------------------------------------------- */

  /* Subject and body in a mailto:; nothing is posted, the mail client is the form. */
  function letter() {
    var span = range();

    var subject = fill(t("calc.mail.subject"), { range: span });
    var body = fill(t("calc.mail.body"), {
      package: packageName(),
      home: homeName(),
      range: span
    });

    return (
      "mailto:" +
      MAIL +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body)
    );
  }

  /* Named placeholders, so a translation can reorder them without touching this. */
  function fill(template, values) {
    return String(template).replace(/\{(\w+)\}/g, function (whole, key) {
      return Object.prototype.hasOwnProperty.call(values, key)
        ? values[key]
        : whole;
    });
  }

  /* ---- Painting ----------------------------------------------------------- */

  function paintProgress() {
    var done = view === "result";
    var step = done ? STEPS : view;

    /* On the result the full rail says it; the counter would only repeat the title. */
    if (counter) counter.hidden = done;
    if (stepOut) stepOut.textContent = fill(t("calc.step"), { n: step, of: STEPS });
    if (leftOut) leftOut.textContent = t("calc.left." + (STEPS - step));

    for (var i = 0; i < ticks.length; i++) {
      var n = Number(ticks[i].getAttribute("data-tick"));
      var state = "next";
      if (done || n < step) state = "done";
      else if (n === step) state = "now";
      ticks[i].setAttribute("data-state", state);
    }
  }

  function paintPanels() {
    var keys = ["1", "2", "3", "result"];
    for (var i = 0; i < keys.length; i++) {
      panels[keys[i]].hidden = String(view) !== keys[i];
    }
  }

  /* A question per chosen goal only. The lawn is about the plot, so the home asks it. */
  function paintRefines() {
    for (var i = 0; i < GOAL_ORDER.length; i++) {
      var row = console_.querySelector(
        '[data-refine="' + GOAL_REFINE[GOAL_ORDER[i]] + '"]'
      );
      if (row) row.hidden = !chose(GOAL_ORDER[i]);
    }

    var lawn = console_.querySelector('[data-refine="lawn"]');
    if (lawn) lawn.hidden = home !== LAWN_HOME;
  }

  function paintNav() {
    if (!nav) return;
    nav.hidden = view === "result";
    if (view === "result") return;

    back.hidden = view === 1;
    next.textContent = t(view === STEPS ? "calc.see" : "calc.next");

    var ready = view === 1 ? goals().length > 0 : view === 2 ? !!home : true;
    next.disabled = !ready;
  }

  function paintResult() {
    if (view !== "result") return;

    var sum = estimate();
    var one = sum.low === sum.high;
    if (lowOut) lowOut.textContent = money(sum.low);
    if (highOut) {
      highOut.textContent = money(sum.high);
      highOut.hidden = one;
    }
    if (spanOut) spanOut.hidden = one;
    if (toOut) toOut.hidden = one;
    if (pkgOut) pkgOut.textContent = packageName();
    if (homeOut) homeOut.textContent = homeName();
    if (mailOut) mailOut.setAttribute("href", letter());

    if (billOut) {
      billOut.textContent = "";
      var lines = bill();
      for (var i = 0; i < lines.length; i++) {
        billOut.appendChild(
          billLine(t("calc.item." + lines[i].item), "× " + lines[i].n)
        );
      }
      /* The work is the last bill line, and the one that shows a % rather than a count. */
      var work = billLine(
        t("calc.item.work"),
        "+" + Math.round(WORK * 100) + "%"
      );
      work.className = "calc__bill-work";
      billOut.appendChild(work);
    }
  }

  function billLine(name, value) {
    var item = document.createElement("li");

    var left = document.createElement("span");
    left.className = "calc__bill-name";
    left.textContent = name;

    var right = document.createElement("span");
    right.className = "mono calc__bill-count";
    right.textContent = value;

    item.appendChild(left);
    item.appendChild(right);
    return item;
  }

  function paint() {
    paintProgress();
    paintPanels();
    paintNav();
    paintResult();
  }

  /* ---- Getting about ------------------------------------------------------ */

  function go(to, moved) {
    view = to;
    if (view === 3) paintRefines();
    paint();
    if (moved) focusPanel();
  }

  /* The arriving panel takes focus — but only on a move, or load would jump here. */
  function focusPanel() {
    var panel = panels[String(view)];
    if (!panel) return;
    var title = panel.querySelector(".calc__panel-title");
    if (title) title.focus();
  }

  /* ---- Sliders ------------------------------------------------------------ */

  /* The track's fill is a custom property, the same as the design system's. */
  function paintSlider(input) {
    var min = Number(input.min || 0);
    var max = Number(input.max || 100);
    var pct = ((Number(input.value) - min) / (max - min)) * 100;
    input.style.setProperty("--fill", pct + "%");

    var name = input.getAttribute("data-refine-in");
    var out = console_.querySelector('[data-refine-out="' + name + '"]');
    if (out) {
      out.textContent =
        Number(input.value) === Number(max) ? input.value + "+" : input.value;
    }
  }

  /* Untouched counts follow the home, so the footprint can answer step three. */
  function seedCounts() {
    if (!home) return;
    for (var i = 0; i < sliders.length; i++) {
      var name = sliders[i].getAttribute("data-refine-in");
      if (touched[name]) continue;
      sliders[i].value = HOMES[home][name];
      paintSlider(sliders[i]);
    }
  }

  /* ---- Wiring -------------------------------------------------------------- */

  for (var g = 0; g < goalInputs.length; g++) {
    goalInputs[g].addEventListener("change", function () {
      paintNav();
    });
  }

  for (var h = 0; h < homeInputs.length; h++) {
    homeInputs[h].addEventListener("change", function (event) {
      home = event.target.getAttribute("data-home");
      seedCounts();
      /* A flat is never asked about a lawn, so an earlier answer is not one any more. */
      if (home !== LAWN_HOME && lawnInput) lawnInput.checked = false;
      paintNav();
    });
  }

  for (var s = 0; s < sliders.length; s++) {
    paintSlider(sliders[s]);
    sliders[s].addEventListener("input", function (event) {
      touched[event.target.getAttribute("data-refine-in")] = true;
      paintSlider(event.target);
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      if (next.disabled) return;
      go(view === STEPS ? "result" : view + 1, true);
    });
  }
  if (back) {
    back.addEventListener("click", function () {
      go(view === 1 ? 1 : view - 1, true);
    });
  }
  if (restart) {
    restart.addEventListener("click", function () {
      go(1, true);
    });
  }

  /* The estimate and its mailto: have no i18n key, so they are rebuilt by hand. */
  document.addEventListener("halo:langchange", function () {
    paint();
  });

  /* All the script-only parts come on together; without one it stays a plain form. */
  if (progress) progress.hidden = false;
  if (nav) nav.hidden = false;
  console_.setAttribute("data-calc", "live");
  go(1);
})(window, document);
