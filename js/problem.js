/* ==========================================================================
   Problem — turning a cell over.

   Each cell in the board carries two faces: how it is now, and how it is once
   somebody has installed it. Clicking anywhere on the cell turns it; the
   toggle in the corner is the real control, so the same thing happens from
   the keyboard, and aria-pressed is what says which side is up.

   The hidden face is hidden from CSS only, which a screen reader does not
   see — so the aria-hidden pair is kept in step here.
   ========================================================================== */

(function (window, document) {
  "use strict";

  var section = document.querySelector(".problem");
  if (!section) return;

  var cells = section.querySelectorAll("[data-flip]");
  if (!cells.length) return;

  function paint(cell, on) {
    cell.classList.toggle("is-flipped", on);

    var toggle = cell.querySelector("[data-flip-toggle]");
    if (toggle) toggle.setAttribute("aria-pressed", on ? "true" : "false");

    var front = cell.querySelector(".problem__face--front");
    var back = cell.querySelector(".problem__face--back");
    if (front) front.setAttribute("aria-hidden", on ? "true" : "false");
    if (back) back.setAttribute("aria-hidden", on ? "false" : "true");
  }

  /* Selecting a line of the quote should not also turn the card over. */
  function selecting() {
    var selection = window.getSelection();
    return !!selection && String(selection).length > 0;
  }

  for (var i = 0; i < cells.length; i++) {
    paint(cells[i], false);

    /* One listener per cell. The toggle's own click bubbles up to here, so
       the button and the card cannot disagree about the state. */
    cells[i].addEventListener("click", function (event) {
      if (selecting()) return;
      var cell = event.currentTarget;
      paint(cell, !cell.classList.contains("is-flipped"));
    });
  }
})(window, document);
