/* ==========================================================================
   Plan — the apartment, and what is in it.

   Every device in section 03 is written twice in the markup: a point on the
   photograph, and a card in the rail underneath. This pairs the two by
   data-device and keeps one of them open at a time.

   The two layouts are the stylesheet's, not this file's. Over the breakpoint
   the rail is laid over the photo and a card opens at its own point; under it
   the cards stay a rail and the point belonging to the centred card lights
   up. Which layout is running is read back off the DOM rather than repeated
   as a width here, so the breakpoint stays written in exactly one place.

   The section only becomes interactive once this runs — data-plan="live" is
   set here and never in the markup, so with no script the cards are simply a
   readable rail under the photo.
   ========================================================================== */

(function (window, document) {
  "use strict";

  var section = document.querySelector(".plan");
  if (!section) return;

  var rail = section.querySelector("[data-plan-rail]");
  var pins = section.querySelectorAll(".plan__pin[data-device]");
  if (!rail || !pins.length) return;

  /* How long the pointer may spend crossing the gap between a point and its
     card before the card gives up and closes. */
  var GRACE = 140;

  var devices = [];
  var open = null; /* the device showing its card, above the breakpoint */
  var held = false; /* opened by a click rather than by the pointer */
  var closing = null;

  for (var i = 0; i < pins.length; i++) {
    var pin = pins[i];
    var name = pin.getAttribute("data-device");
    var slot = rail.querySelector('.plan__slot[data-device="' + name + '"]');
    if (!slot) continue;

    /* The place on the photograph is written on the pin only; the card is
       given a copy of it, so the markup never says it twice. */
    slot.style.setProperty("--x", pin.style.getPropertyValue("--x"));
    slot.style.setProperty("--y", pin.style.getPropertyValue("--y"));
    slot.setAttribute("data-place", pin.getAttribute("data-place") || "above");
    slot.setAttribute("data-align", pin.getAttribute("data-align") || "center");

    devices.push({
      pin: pin,
      slot: slot,
      dot: pin.querySelector(".plan__dot")
    });
  }
  if (!devices.length) return;

  /* Above the breakpoint the stylesheet lifts the rail out of the flow. That
     is the one difference worth asking about, so it is the test. */
  function pinned() {
    return window.getComputedStyle(rail).position === "absolute";
  }

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
    device.dot.setAttribute("aria-expanded", on ? "true" : "false");
  }

  /* ---- Under the breakpoint: the centred card owns its point ------------ */

  var frame = 0;

  function scan() {
    frame = 0;
    if (pinned()) return;

    var box = rail.getBoundingClientRect();
    var middle = box.left + box.width / 2;
    var nearest = null;
    var shortest = Infinity;

    for (var i = 0; i < devices.length; i++) {
      var card = devices[i].slot.getBoundingClientRect();
      var away = Math.abs(card.left + card.width / 2 - middle);
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

  /* One scan per frame, and the pending one is always replaced rather than
     skipped — a frame that never arrives can then never wedge it shut. */
  function rescan() {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(scan);
  }

  /* ---- Wiring ------------------------------------------------------------ */

  for (var k = 0; k < devices.length; k++) {
    (function (device) {
      device.pin.addEventListener("mouseenter", function () {
        if (pinned() && !held) show(device);
      });
      device.pin.addEventListener("mouseleave", function () {
        if (pinned() && !held) hide();
      });
      /* Hovering the card itself has to hold it open, or it closes the
         moment the pointer crosses onto the thing it went to read. */
      device.slot.addEventListener("mouseenter", function () {
        if (pinned() && !held) show(device);
      });
      device.slot.addEventListener("mouseleave", function () {
        if (pinned() && !held) hide();
      });

      /* The keyboard gets the same card, without the grace period. */
      device.dot.addEventListener("focus", function () {
        if (pinned()) show(device);
      });
      device.dot.addEventListener("blur", function () {
        if (pinned() && !held) hide(true);
      });

      device.dot.addEventListener("click", function () {
        if (!pinned()) {
          /* On the rail the point is a shortcut to the card, not a tooltip
             of its own — bring the card to the centre. The rail is scrolled
             by hand rather than with scrollIntoView, which would also drag
             the page down to it and take the photograph off the screen. */
          var box = rail.getBoundingClientRect();
          var card = device.slot.getBoundingClientRect();
          rail.scrollBy({
            left: card.left + card.width / 2 - (box.left + box.width / 2),
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
  window.addEventListener("resize", function () {
    if (pinned()) {
      hide(true);
      for (var i = 0; i < devices.length; i++) {
        devices[i].slot.classList.remove("is-active");
        devices[i].pin.classList.remove("is-active");
      }
    } else {
      rescan();
    }
  });

  section.setAttribute("data-plan", "live");
  rescan();
})(window, document);
