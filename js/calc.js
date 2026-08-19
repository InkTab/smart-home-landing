/* ==========================================================================
   Calc — the cost calculator, and the mailto: it ends in.

   Three questions, disclosed one at a time: what the visitor wants solved,
   how much house there is, and — only for the goals actually chosen — the one
   count per goal that moves the price. Nobody is asked to inventory a window.

   The section only becomes a wizard once this runs. data-calc="live" is set
   here and never in the markup, so with no script the three panels are simply
   a readable form, the progress and the nav buttons stay hidden, and the
   mailto: line under the console is the way out — the same arrangement
   section 03 has with its rail.

   The estimate is a range because the hardware is: a lock is $80 on an
   interior-grade door and $280 on a front door, and a camera is $50 or $220
   depending on where it has to survive. So the two figures are the same bill
   of devices costed twice — everything at its floor, then everything at its
   ceiling — rather than one figure with a margin of error painted around it.

   All copy is the dictionary's. Anything written into the DOM here is built
   out of Halo.i18n.t at the moment it is written, and the whole result is
   rendered again on halo:langchange, because the estimate is the one piece of
   text on the page that i18n.apply cannot reach: it has no key of its own.
   ========================================================================== */

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

  /* ---- The price list ----------------------------------------------------
     Hardware, per device, before tax. A single figure means the device costs
     what it costs; a pair is the floor and the ceiling of the same line, and
     those pairs are the whole reason the answer is a range.

     Watering is two lines rather than one: the controller that runs it, and
     a valve per zone it runs. How many zones a garden has is the one thing
     the footprint guesses at — see `zones` below. */

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

  /* ---- What is in a home -------------------------------------------------
     Everything the footprint can answer on the visitor's behalf, so that step
     three only ever has to ask what the footprint genuinely cannot know.

     `doors`, `temp` and `lights` are the three sliders' starting points and
     move with the home until one is set by hand; the rest are never asked. */

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

  /* Order is the markup's, not the order they were clicked — the package
     name has to read the same way twice for the same three answers. */
  var GOAL_ORDER = ["security", "climate", "light"];

  /* Which slider belongs to which goal, so a goal nobody picked takes its
     question off the page with it. */
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
  /* Which sliders the visitor has moved. Until one is touched it follows the
     home, so picking a house re-answers the counts the way a house would. */
  var touched = {};

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

  /* ---- The bill -----------------------------------------------------------
     One list of devices and how many of each, built out of the three answers.
     The two figures on the page and the four lines under them are the same
     list read twice, so a device can never be in the price without being in
     the list underneath it. */

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

  /* Everything at its floor, then everything at its ceiling, and the work on
     top of both — the same percentage, so the two ends stay in proportion. */
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

  /* One currency in both languages: the figure is in dollars, and the email
     it ends up in has to read the same whichever language wrote it. */
  function money(value) {
    return "$" + String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  /* The range as one string, for the letter. A job with nothing ranged in it
     — a thermostat and a few sensors are all fixed-price — has one figure,
     and "$620–$620" is not a range, it is a number written twice. */
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

  /* The whole answer, written into a mailto: — subject, body and all. Nothing
     is posted anywhere: the visitor's own client is the form, and they get to
     read and edit every word of it before it is sent. */
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

  /* The dictionary holds the sentence; this puts the answers into it. Keeping
     the placeholders in the string is what lets the Russian sentence put them
     in a different order without the script knowing about it. */
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

    /* The counter is a reading of a journey still being made. Once the
       estimate is up there is nowhere left to be, and a full rail says so on
       its own — leaving it would also put "Your estimate" on the console
       twice, once here and once over the number it belongs to. */
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

  /* Only the goals that were picked get a question. A goal nobody chose has
     no critical multiplier — asking anyway is the tedious inventory the whole
     step exists to avoid. The lawn is the exception that proves the rule: it
     is a question about the plot, so it is the footprint that asks it. */
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
      /* The work is the last line of the bill rather than a footnote, and it
         carries the one figure the hardware lines do not: what it adds. */
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

  /* The panel that arrives takes the focus, or a keyboard is left standing on
     a button that has just moved out from under it. Only ever on a step the
     visitor asked for: taking it on the first paint would drag the page down
     to the calculator the moment it loads. */
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

  /* A count nobody has touched follows the home, so choosing a house answers
     the counts the way a house would and the visitor can skip the step. */
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
      /* A lawn answered on a house and then taken back to a flat is not an
         answer any more — the question is not even asked at that footprint. */
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

  /* The estimate is the one piece of copy with no key of its own, so it is
     the one thing i18n.apply cannot translate — it gets rebuilt here instead,
     and so does the mailto: the button is pointing at. */
  document.addEventListener("halo:langchange", function () {
    paint();
  });

  /* Everything the calculator needs a script for comes on together. */
  if (progress) progress.hidden = false;
  if (nav) nav.hidden = false;
  console_.setAttribute("data-calc", "live");
  go(1);
})(window, document);
