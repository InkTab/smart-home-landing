/* Reveal — hold a [data-reveal] section's [data-anim] entrance until it scrolls in. */

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
    /* A sliver is not enough: the entrance would be half over before it is worth seeing. */
    { threshold: 0.15 }
  );

  /* Set here, never in markup: without JS or with reduced motion nothing pauses. */
  for (var i = 0; i < sections.length; i++) {
    sections[i].setAttribute("data-reveal", "out");
    observer.observe(sections[i]);
  }
})(window, document);
