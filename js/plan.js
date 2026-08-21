/* Plan — pairs each photo point with its rail card by data-device, one open at a time. */

(function (window, document) {
  "use strict";

  var section = document.querySelector(".plan");
  if (!section) return;

  var rail = section.querySelector("[data-plan-rail]");
  var pins = section.querySelectorAll(".plan__pin[data-device]");
  if (!rail || !pins.length) return;

  var GRACE = 140; /* ms the pointer may spend crossing from a point to its card */

  var devices = [];
  var open = null; /* the device showing its card, above the breakpoint */
  var held = false; /* opened by a click rather than by the pointer */
  var closing = null;

  for (var i = 0; i < pins.length; i++) {
    var pin = pins[i];
    var name = pin.getAttribute("data-device");
    var slot = rail.querySelector('.plan__slot[data-device="' + name + '"]');
    if (!slot) continue;

    /* The place is written on the pin only; the card gets a copy, never a repeat. */
    slot.style.setProperty("--x", pin.style.getPropertyValue("--x"));
    slot.style.setProperty("--y", pin.style.getPropertyValue("--y"));
    slot.setAttribute("data-place", pin.getAttribute("data-place") || "above");
    slot.setAttribute("data-align", pin.getAttribute("data-align") || "center");

    devices.push({
      pin: pin,
      slot: slot,
      dot: pin.querySelector(".plan__dot"),
      left: 0, /* filled by measure(); rail-content coordinates, not viewport */
      width: 0
    });
  }
  if (!devices.length) return;

  /* Which layout is running. Must stay in step with the .plan__rail breakpoint in
     sections.css — the one place the value is duplicated outside the stylesheet. */
  var PINNED_AT = "(min-width: 900px)";
  var query = window.matchMedia(PINNED_AT);
  var pinned = query.matches;

  /* ---- Above the breakpoint: one card open at its point ----------------- */

  function show(device) {
    window.clearTimeout(closing);
    if (open === device) return;
    if (open) paint(open, false);
    open = device;
    paint(device, true);
  }

  function hide(now) {
    window.clearTimeout(closing);
    if (!open) return;
    if (now) {
      paint(open, false);
      open = null;
      held = false;
      return;
    }
    closing = window.setTimeout(function () {
      if (!held && open) {
        paint(open, false);
        open = null;
      }
    }, GRACE);
  }

  function paint(device, on) {
    device.slot.classList.toggle("is-open", on);
    device.pin.classList.toggle("is-active", on);
    if (pinned) device.dot.setAttribute("aria-expanded", on ? "true" : "false");
  }

  /* ---- Under the breakpoint: the centered card owns its point ------------ */

  var frame = 0;
  var railMid = 0;

  /* The rail scrolls but its cards never move within it, so their places hold until
     the viewport changes. Measured in one batch so scan() can be all reads-then-writes.

     The origin has to be normalised: the entrance animation puts a transform on the
     rail, which makes it the offsetParent, and `rise` ends at transform:none, which
     hands that role back to .plan__stage. Same card, two different offsetLeft values. */
  function measure() {
    railMid = rail.clientWidth / 2;
    /* Constant across the loop — nothing here writes — so read it once, not per card. */
    var railBase = rail.offsetLeft + rail.clientLeft;

    for (var i = 0; i < devices.length; i++) {
      var slot = devices[i].slot;
      var base = slot.offsetParent === rail ? 0 : railBase;
      devices[i].left = slot.offsetLeft - base;
      devices[i].width = slot.offsetWidth;
    }
  }

  /* Where the rail's centre sits in card coordinates, in the cards' own units. */
  function centre() {
    return rail.scrollLeft + railMid;
  }

  function scan() {
    frame = 0;
    if (pinned) return;

    var middle = centre();
    var nearest = null;
    var shortest = Infinity;

    for (var i = 0; i < devices.length; i++) {
      var away = Math.abs(devices[i].left + devices[i].width / 2 - middle);
      if (away < shortest) {
        shortest = away;
        nearest = devices[i];
      }
    }

    for (var j = 0; j < devices.length; j++) {
      var is = devices[j] === nearest;
      devices[j].slot.classList.toggle("is-active", is);
      devices[j].pin.classList.toggle("is-active", is);
    }
  }

  /* One scan per frame; replace the pending one so a frame that never comes cannot stick. */
  function rescan() {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(scan);
  }

  /* ---- Wiring ------------------------------------------------------------ */

  for (var k = 0; k < devices.length; k++) {
    (function (device) {
      device.pin.addEventListener("mouseenter", function () {
        if (pinned && !held) show(device);
      });
      device.pin.addEventListener("mouseleave", function () {
        if (pinned && !held) hide();
      });
      /* Hovering the card holds it open, or it shuts as the pointer reaches it. */
      device.slot.addEventListener("mouseenter", function () {
        if (pinned && !held) show(device);
      });
      device.slot.addEventListener("mouseleave", function () {
        if (pinned && !held) hide();
      });

      /* The keyboard gets the same card, without the grace period. */
      device.dot.addEventListener("focus", function () {
        if (pinned) show(device);
      });
      device.dot.addEventListener("blur", function () {
        if (pinned && !held) hide(true);
      });

      device.dot.addEventListener("click", function () {
        if (!pinned) {
          /* Center the card by hand: scrollIntoView would also drag the photo off screen.
             Off the same cache as scan(), or the snapped card and the lit one can differ. */
          rail.scrollBy({
            left: device.left + device.width / 2 - centre(),
            behavior: "smooth"
          });
          return;
        }
        if (open === device && held) {
          held = false;
          hide(true);
        } else {
          held = false;
          show(device);
          held = true;
        }
      });
    })(devices[k]);
  }

  /* A card held open by a click is dismissed the way anything else is. */
  document.addEventListener("click", function (event) {
    if (!held) return;
    if (event.target.closest(".plan__pin, .plan__slot")) return;
    held = false;
    hide(true);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape" || !open) return;
    var dot = open.dot;
    held = false;
    hide(true);
    dot.focus();
  });

  rail.addEventListener("scroll", rescan, { passive: true });

  /* Above the breakpoint nothing is centered, so the scan's marks would stick. */
  function clear() {
    hide(true);
    for (var i = 0; i < devices.length; i++) {
      devices[i].slot.classList.remove("is-active");
      devices[i].pin.classList.remove("is-active");
    }
  }

  /* The only place pinned is written. Re-read here rather than trusting the change
     event alone, so a missed one cannot strand the layout in the wrong mode;
     query.matches is a cached flag, not a style recalc like getComputedStyle was. */
  function relayout() {
    pinned = query.matches;

    /* Measure first. The aria and class writes below dirty layout, so a measure()
       after them forces a synchronous recalc — the one reflow resize used to cost. */
    if (!pinned) measure();

    /* Under the breakpoint every card is already on the rail, so a point expands
       nothing — it scrolls. Carrying aria-expanded there would say the opposite. */
    for (var i = 0; i < devices.length; i++) {
      if (pinned) devices[i].dot.setAttribute("aria-expanded", "false");
      else devices[i].dot.removeAttribute("aria-expanded");
    }
    if (pinned) {
      clear();
      return;
    }
    rescan();
  }

  /* addListener is the Safari < 14 spelling, and this file still carries ES5. */
  if (query.addEventListener) query.addEventListener("change", relayout);
  else query.addListener(relayout);

  /* A drag fires resize far faster than layout settles; one relayout per frame is
     all the cards can show. The breakpoint change stays synchronous — a frame of
     the wrong mode there would be a frame of the wrong interaction. */
  var pending = 0;
  function relayoutSoon() {
    window.cancelAnimationFrame(pending);
    pending = window.requestAnimationFrame(relayout);
  }

  window.addEventListener("resize", relayoutSoon);

  /* The places now change only here, never mid-scroll. The rail alone is enough: its
     height follows the tallest card, so a root font-size change — which moves the cards
     by shifting the rem gaps, without touching any width — still comes through. */
  if (window.ResizeObserver) {
    var watcher = new window.ResizeObserver(function () {
      if (pinned) return;
      measure();
      rescan();
    });
    watcher.observe(rail);
  }

  /* Set here, never in markup: with no script the cards stay a plain readable rail. */
  section.setAttribute("data-plan", "live");
  relayout();
})(window, document);
