/* ==========================================================================
   Reveal — hold a section's entrance until it is on screen.

   The load-time entrance in sections.css is right for the hero, which is
   already in view. Anything further down the page would play to an empty
   room, so a section marked `data-reveal` keeps every [data-anim] inside it
   paused until it scrolls in, and then lets the order declared in the markup
   run exactly as written.

   The attribute's value is written here and never in the markup: with no
   JavaScript, no IntersectionObserver, or under prefers-reduced-motion,
   nothing is ever paused and the page behaves as it did before.
   ========================================================================== */

(function (window, document) {
  "use strict";

  var sections = document.querySelectorAll("[data-reveal]");
  if (!sections.length) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches || !("IntersectionObserver" in window)) return;

  var observer = new window.IntersectionObserver(
    function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) continue;
        entries[i].target.setAttribute("data-reveal", "in");
        observer.unobserve(entries[i].target);
      }
    },
    /* A sliver is not enough — the section has to be properly on screen, or
       the entrance is half over by the time it is worth watching. */
    { threshold: 0.15 }
  );

  for (var i = 0; i < sections.length; i++) {
    sections[i].setAttribute("data-reveal", "out");
    observer.observe(sections[i]);
  }
})(window, document);
