/* Design system sheet — small interactions only. */

(function () {
  "use strict";

  /* ---- Toast ----------------------------------------------------------- */
  const toast = document.getElementById("toast");
  const toastText = document.getElementById("toast-text");
  let toastTimer;

  function showToast(message) {
    toastText.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 1600);
  }

  /* ---- Copy a swatch --------------------------------------------------- */
  document.querySelectorAll(".swatch").forEach((swatch) => {
    swatch.addEventListener("click", () => {
      const hex = swatch.dataset.hex;
      navigator.clipboard
        .writeText(hex)
        .then(() => showToast(hex + " copied"))
        .catch(() => showToast(hex));
    });
  });

  /* ---- Copy any mono token on click ------------------------------------ */
  document.querySelectorAll(".mono").forEach((el) => {
    el.style.cursor = "copy";
    el.addEventListener("click", () => {
      const value = el.textContent.trim();
      navigator.clipboard
        .writeText(value)
        .then(() => showToast(value + " copied"))
        .catch(() => {});
    });
  });

  /* ---- Blueprint grid toggle ------------------------------------------- */
  const gridToggle = document.getElementById("grid-toggle");
  if (gridToggle) {
    gridToggle.addEventListener("change", () => {
      document.body.classList.toggle("grid-on", gridToggle.checked);
    });
  }

  /* ---- Ranges: paint the track fill, mirror the value ------------------- */
  function paintRange(input) {
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const pct = ((Number(input.value) - min) / (max - min)) * 100;
    input.style.setProperty("--fill", pct + "%");

    const key = input.dataset.range;
    const out = key && document.querySelector('[data-range-out="' + key + '"]');
    if (out) out.textContent = input.value + (input.dataset.suffix || "");
  }

  document.querySelectorAll(".range").forEach((input) => {
    paintRange(input);
    input.addEventListener("input", () => paintRange(input));
  });

  /* ---- Dial: slider drives the sweep and the reading -------------------- */
  const dial = document.getElementById("demo-dial");
  const dialInput = document.querySelector("[data-dial-input]");
  const dialValue = document.querySelector("[data-dial-value]");

  if (dial && dialInput && dialValue) {
    const paintDial = () => {
      const min = Number(dialInput.min);
      const max = Number(dialInput.max);
      const pct = ((Number(dialInput.value) - min) / (max - min)) * 100;
      dial.style.setProperty("--dial", pct + "%");
      dialValue.textContent = Number(dialInput.value).toFixed(1) + "°";
    };
    paintDial();
    dialInput.addEventListener("input", paintDial);
  }

  /* ---- Soft tiles ------------------------------------------------------- */
  document.querySelectorAll(".tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      const on = tile.getAttribute("aria-pressed") === "true";
      tile.setAttribute("aria-pressed", String(!on));
    });
  });

  /* ---- Tabs ------------------------------------------------------------ */
  const panel = document.querySelector("[data-tab-panel]");
  const copy = {
    Overview: "Overview — fourteen devices across five zones, all reporting.",
    Devices: "Devices — 14 online, 1 offline. Two firmware updates pending.",
    Automations: "Automations — 9 routines. Sleep mode runs nightly at 22:30.",
    Energy: "Energy — 6.4 kWh today, 31% below the same week last year.",
  };

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      tab.parentElement
        .querySelectorAll(".tab")
        .forEach((t) => t.setAttribute("aria-selected", "false"));
      tab.setAttribute("aria-selected", "true");
      if (panel) panel.textContent = copy[tab.textContent.trim()] || "";
    });
  });

  /* ---- Navbar: the mobile toggle --------------------------------------- */
  document.querySelectorAll(".navbar__toggle").forEach((toggle) => {
    const bar = toggle.closest(".navbar");
    if (!bar) return;
    const icon = toggle.querySelector("[data-toggle-icon] use");

    function setOpen(open) {
      bar.dataset.open = String(open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (icon) icon.setAttribute("href", open ? "#i-x" : "#i-menu");
    }

    setOpen(false);

    toggle.addEventListener("click", () => {
      setOpen(bar.dataset.open !== "true");
    });

    /* Outside click and Escape close it, the way a real nav does. */
    document.addEventListener("click", (event) => {
      if (bar.dataset.open === "true" && !bar.contains(event.target)) {
        setOpen(false);
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && bar.dataset.open === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
  });

  /* ---- Loading buttons: let them actually spin for a moment ------------- */
  document.querySelectorAll(".btn:not(.is-loading)").forEach((btn) => {
    if (btn.disabled || btn.hasAttribute("data-force-hover")) return;
    btn.addEventListener("click", () => {
      if (!btn.closest(".matrix")) return;
      btn.classList.add("is-loading");
      setTimeout(() => btn.classList.remove("is-loading"), 1200);
    });
  });

  /* ---- Jump menu: the index again, once the rail has scrolled away ------ */
  const jump = document.getElementById("jump");
  const jumpPanel = document.getElementById("jump-panel");
  const railList = document.getElementById("rail-list");
  const rail = document.querySelector(".rail");

  if (jump && jumpPanel && railList) {
    const jumpToggle = jump.querySelector(".jump__toggle");
    const jumpIcon = jumpToggle.querySelector("use");

    /* One source of truth for the section order: copy the rail's list. */
    const indexCopy = railList.cloneNode(true);
    indexCopy.removeAttribute("id");
    indexCopy
      .querySelectorAll("a")
      .forEach((a) => a.classList.remove("is-active"));
    jumpPanel.appendChild(indexCopy);

    function setJumpOpen(open) {
      jump.dataset.open = String(open);
      jumpToggle.setAttribute("aria-expanded", String(open));
      jumpToggle.setAttribute(
        "aria-label",
        open ? "Close section index" : "Jump to section"
      );
      if (jumpIcon) jumpIcon.setAttribute("href", open ? "#i-x" : "#i-menu");
    }

    setJumpOpen(false);

    jumpToggle.addEventListener("click", () => {
      setJumpOpen(jump.dataset.open !== "true");
    });

    /* Picking a section is the whole point — close on the way out. */
    jumpPanel.addEventListener("click", (event) => {
      if (event.target.closest("a")) setJumpOpen(false);
    });
    document.addEventListener("click", (event) => {
      if (jump.dataset.open === "true" && !jump.contains(event.target)) {
        setJumpOpen(false);
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && jump.dataset.open === "true") {
        setJumpOpen(false);
        jumpToggle.focus();
      }
    });

    /* It only earns its place once the rail itself is out of view. */
    if (rail && "IntersectionObserver" in window) {
      const railWatcher = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            jump.classList.toggle("is-visible", !entry.isIntersecting);
            if (entry.isIntersecting) setJumpOpen(false);
          });
        },
        { threshold: 0 }
      );
      railWatcher.observe(rail);
    }
  }

  /* ---- Rail scroll spy -------------------------------------------------- */
  /* Both copies of the index follow the scroll, so the pinned one stays in step. */
  const links = Array.from(document.querySelectorAll(".rail__list a"));
  const sections = Array.from(document.querySelectorAll("#rail-list a"))
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((l) => l.classList.remove("is-active"));
          links
            .filter((l) => l.getAttribute("href") === "#" + entry.target.id)
            .forEach((l) => l.classList.add("is-active"));
        });
      },
      { rootMargin: "-10% 0px -80% 0px", threshold: 0 }
    );
    sections.forEach((section) => observer.observe(section));
  }
})();
