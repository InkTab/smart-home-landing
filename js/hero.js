/* Hero — drifting readings, plus door, leak and hub events taking turns on one script. */

(function (window, document) {
  "use strict";

  var hero = document.querySelector(".hero");
  if (!hero) return;

  var i18n = (window.Halo && window.Halo.i18n) || null;
  /* Reduced motion drops the events; the readings drift on — a number is not motion. */
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var beats = [];

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  /* One event at a time, each with its own gap. Pushed in the order they play. */
  var script = [];
  var FIRST = 5000; /* after the entrance has finished */
  var GAP = 4000; /* the quiet between one event ending and the next */
  var LOOP = 6000; /* the longer quiet before the script starts over */

  function runner() {
    var timer = null;
    var step = -1;

    function stopAll() {
      for (var i = 0; i < script.length; i++) script[i].hide();
    }

    function wait(ms) {
      window.clearTimeout(timer);
      timer = window.setTimeout(play, ms);
    }

    function play() {
      step = (step + 1) % script.length;
      var current = script[step];
      current.show();
      timer = window.setTimeout(function () {
        current.hide();
        wait(step === script.length - 1 ? LOOP : GAP);
      }, current.hold);
    }

    var api = {
      start: function () {
        wait(FIRST);
      },
      stop: function () {
        window.clearTimeout(timer);
        stopAll();
        step = -1;
      }
    };
    beats.push(api);
    return api;
  }

  /* A beat with nothing to put away — it just ticks. */
  function tick(config) {
    var timer = null;

    function run() {
      if (!document.hidden) config.step();
      timer = window.setTimeout(run, config.period());
    }

    var api = {
      start: function () {
        timer = window.setTimeout(run, config.first);
      },
      stop: function () {
        window.clearTimeout(timer);
      }
    };
    beats.push(api);
    return api;
  }

  /* Swap a reading without it snapping — fade down, change, fade back. */
  function reveal(node, write) {
    var reading = node.closest("[data-reading]");
    if (!reading) {
      write();
      return;
    }
    reading.classList.add("is-changing");
    window.setTimeout(function () {
      write();
      reading.classList.remove("is-changing");
    }, 200);
  }

  /* ---- Climate: a slow wander around the target ------------------------- */

  var tempNode = hero.querySelector("[data-temp]");
  var temp = 21.5;

  function paintTemp() {
    if (!tempNode) return;
    var text = temp.toFixed(1);
    tempNode.textContent =
      i18n && i18n.lang === "ru" ? text.replace(".", ",") : text;
  }

  if (tempNode) {
    /* Markup carries the English form; paint before the first drift or ru shows "21.5". */
    paintTemp();

    tick({
      first: 6000,
      period: function () {
        return rand(7000, 11000);
      },
      step: function () {
        var next = temp + (Math.random() < 0.5 ? -0.1 : 0.1);
        if (next < 21.1 || next > 21.9) next = temp - (next - temp);
        temp = Math.round(next * 10) / 10;
        reveal(tempNode, paintTemp);
      }
    });
  }

  /* ---- Humidity: the same wander, plus the meter ------------------------- */

  var humNode = hero.querySelector("[data-humidity]");
  var humFill = hero.querySelector("[data-humidity-fill]");
  var humidity = 44;

  if (humNode) {
    tick({
      first: 9000,
      period: function () {
        return rand(9000, 14000);
      },
      step: function () {
        var next = humidity + (Math.random() < 0.5 ? -1 : 1);
        if (next < 41 || next > 47) next = humidity - (next - humidity);
        humidity = next;
        reveal(humNode, function () {
          humNode.textContent = String(humidity);
        });
        if (humFill) humFill.style.setProperty("--v", humidity + "%");
      }
    });
  }

  /* ---- Front door: opens, then closes again ------------------------------ */

  var door = hero.querySelector("[data-door]");

  if (door && !reduced.matches) {
    var doorState = door.querySelector(".device__reading--state");
    var doorStatus = door.querySelector("[data-door-status]");
    var doorNote = door.querySelector("[data-door-note]");
    var doorIcon = door.querySelector("[data-door-icon] use");

    var paintDoor = function (open) {
      door.classList.toggle("is-open", open);
      if (doorState) {
        doorState.setAttribute("data-i18n", open ? "w.door.open" : "w.door.closed");
      }
      if (doorNote) {
        doorNote.setAttribute("data-i18n", open ? "w.door.noteOpen" : "w.door.note");
      }
      if (doorStatus) {
        doorStatus.className = "status " + (open ? "status--idle" : "status--online");
      }
      if (doorIcon) doorIcon.setAttribute("href", open ? "#i-door" : "#i-lock");
      if (i18n) i18n.apply(door);
    };

    script.push({
      hold: 2400,
      show: function () {
        paintDoor(true);
      },
      hide: function () {
        paintDoor(false);
      }
    });
  }

  /* ---- Basement: the leak notification ----------------------------------- */

  var leak = hero.querySelector("[data-leak]");

  if (leak && !reduced.matches) {
    script.push({
      hold: 4500,
      show: function () {
        leak.classList.add("is-on");
      },
      hide: function () {
        leak.classList.remove("is-on");
      }
    });
  }

  /* ---- Hub: loses the link, then gets it back ---------------------------- */

  var strip = hero.querySelector("[data-link]");

  if (strip && !reduced.matches) {
    var stripText = strip.querySelector("[data-link-text]");
    var connectedTimer = null;

    var paintLink = function (state) {
      strip.classList.toggle("is-on", state !== "off");
      strip.classList.toggle("is-connected", state === "connected");
      if (stripText) {
        stripText.setAttribute(
          "data-i18n",
          state === "connected" ? "w.link.connected" : "w.link.reconnecting"
        );
        if (i18n) i18n.apply(strip);
      }
    };

    script.push({
      hold: 3600,
      show: function () {
        paintLink("reconnecting");
        /* Amber first, then it comes back green just before it slides away. */
        connectedTimer = window.setTimeout(function () {
          paintLink("connected");
        }, 2000);
      },
      hide: function () {
        window.clearTimeout(connectedTimer);
        strip.classList.remove("is-on");
        /* Hold the green until it is out of sight, then reset the color. */
        window.setTimeout(function () {
          if (!strip.classList.contains("is-on")) paintLink("off");
        }, 400);
      }
    });
  }

  if (script.length) runner();

  /* ---- Clocks ------------------------------------------------------------ */

  /* Beats run only when the hero is properly in view and the tab is in front. */
  var running = null;
  var showing = false; /* is the hero properly in view */

  function sync() {
    var next = !document.hidden && showing;
    if (next === running) return;
    running = next;
    hero.setAttribute("data-beats", next ? "on" : "off");
    for (var i = 0; i < beats.length; i++) {
      if (next) beats[i].start();
      else beats[i].stop();
    }
  }

  /* Showing = over 40% of the hero, or of the screen when the hero is the taller one. */
  function judge(entry) {
    if (!entry.rootBounds) return;
    showing =
      entry.intersectionRect.height >
      Math.min(entry.boundingClientRect.height, entry.rootBounds.height) * 0.4;
    sync();
  }

  document.addEventListener("visibilitychange", sync);

  if ("IntersectionObserver" in window) {
    /* Observer, not scroll math (forced reflow); a ladder tracks the moving threshold. */
    var rungs = [];
    for (var step = 0; step < 1; step += 0.05) rungs.push(step);
    rungs.push(1);

    new window.IntersectionObserver(function (entries) {
      judge(entries[entries.length - 1]);
    }, { threshold: rungs }).observe(hero);
  } else {
    /* No observer: measure by hand, batched into a frame. */
    var queued = false;

    var measure = function () {
      queued = false;
      var box = hero.getBoundingClientRect();
      var seen =
        Math.min(box.bottom, window.innerHeight) - Math.max(box.top, 0);
      showing = seen > Math.min(box.height, window.innerHeight) * 0.4;
      sync();
    };

    var measureSoon = function () {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(measure);
    };

    window.addEventListener("scroll", measureSoon, { passive: true });
    window.addEventListener("resize", measureSoon);
    measure();
  }

  /* Only the temperature needs a manual repaint; everything else is keyed for i18n. */
  document.addEventListener("halo:langchange", paintTemp);

  sync();
})(window, document);
