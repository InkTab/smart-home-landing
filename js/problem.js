/* Problem — click a cell to flip its two faces; the corner toggle is the real control. */

(function (window, document) {
  "use strict";

  var section = document.querySelector(".problem");
  if (!section) return;

  var cells = section.querySelectorAll("[data-flip]");
  if (!cells.length) return;

  /* CSS hides the far face visually only, so the aria pair is kept in step here. */
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

    /* One listener per cell; the toggle's click bubbles here, so the two cannot disagree. */
    cells[i].addEventListener("click", function (event) {
      if (selecting()) return;
      var cell = event.currentTarget;
      paint(cell, !cell.classList.contains("is-flipped"));
    });
  }
})(window, document);
