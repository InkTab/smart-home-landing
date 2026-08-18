# smart-home-landing

Landing page for a smart home professional. Working name: **Halo**.

Visual direction: warm off-white paper (`#FDFCF8`), steel-blue ink derived from
`#488DB4`, and subtle neumorphism as the default treatment for every surface —
one light source, top-left. Raised means you can act on it, recessed means it
holds something.

The hairline blueprint language is still in the system, but it is now the
exception: device cards, spec panels and annotations (corner ticks, dimension
lines, drafting labels) stay drawn. The background grid is off by default and
can be toggled on from the design system sheet.

Type: **Jura** for display and technical labels, **Inter** for UI and body copy,
**IBM Plex Mono** for values.

## Files

The project root is the website. The design system is a separate folder that
consumes the same stylesheets.

```
index.html                  the landing page — header + section 01 (hero)
css/
  tokens/
    palette.css             raw values — colour ramps and the two light colours
    semantic.css            roles + scales: surfaces, text, lines, type, space,
                            radius, shadow, motion, layout
  base.css                  reset, typography, the paper, drafting primitives
  components.css            buttons, forms, cards, badges, frames, tables, nav,
                            and the soft/neumorphic layer
  sections.css              page composition — entrance choreography, header,
                            and one block per section of the page
js/
  i18n.js                   the EN/RU dictionary, the switch, and the keys
  hero.js                   the hero's door beat
design-system/
  design-system.html        the visual playground — every token and component
  design-system.css         layout for the playground sheet only
  design-system.js          swatch copying, grid toggle, sliders, dial, tiles
```

Load order matters: `palette.css` before `semantic.css` before everything else.
Components reference semantic tokens only — if a component needs a raw
`--steel-*` or `--paper-*` value, that is a missing semantic token.

## Running it

Any static server works — plain HTML and CSS, no build step.

```bash
python3 -m http.server 4173
```

The site is at http://localhost:4173/ and the design system at
http://localhost:4173/design-system/design-system.html

Fonts (Jura, Inter, IBM Plex Mono) load from Google Fonts, so the page needs a
network connection to look right; it falls back to system sans and mono stacks
offline.

## Soft vs drawn

The neumorphic shadows assume one light source at the top-left and the
`--paper-000` ground. They only work on off-white — on pure white the highlight
disappears, so nothing may sit on a tinted background without being re-tuned.

Soft is the default: cards, buttons, inputs, nav, tiles, panels. Buttons are
pills carrying the lifted-and-lit treatment — `--shadow-soft-lift` plus a
translucent `--lit-*` sheen — and they sink to an inset on press. To make
something drawn instead, add `.card--drawn` — it swaps to a hairline border and
4px corners, and reverts any switches, sliders and outline buttons inside it to
the hairline versions so a card never mixes the two languages. Section 14 of the
design system sheet documents the depth scale and the exception.

## Two languages

The page opens in the system language — Russian for any `ru-*` locale, English
for everything else — and the EN/RU switch in the header overrides it. The
choice is remembered in `localStorage` under `halo.lang`.

All copy lives in the dictionary in `js/i18n.js`, never in the markup. The
markup carries keys instead:

```html
<h1 data-i18n="hero.title">A smarter home that fits your life.</h1>
<nav data-i18n-aria-label="nav.label">
```

The English string stays in the HTML as the fallback if the script never runs.
Anything that rewrites a key at runtime calls `Halo.i18n.apply(node)` so the
new text comes out in the current language, and listens for the
`halo:langchange` event if it holds state of its own.

## Motion

Entrance order is declared in the markup, not in the script: `data-anim`
picks the keyframe and `--d` sets the delay, so reading the section top to
bottom tells you what lands when. Both keyframes fill `both`, so nothing is
hidden by CSS that has not loaded yet.

The hero then keeps running, so the longer a visitor watches the more the
house does. The two readings drift on their own slow clocks:

| reading | every | what happens |
| --- | --- | --- |
| climate | 7–11 s | wanders 21.1–21.9 °C, one tenth at a time |
| humidity | 9–14 s | wanders 41–47 %, and the meter follows |

The three events share one script and take turns, so they are never on screen
together — `GAP` is the quiet between one ending and the next starting:

| step | for | what happens |
| --- | --- | --- |
| front door | 2.4 s | the card jumps, reads *Open*, then closes again |
| basement | 4.5 s | the water-leak notification appears |
| hub link | 3.6 s | an amber *Reconnecting* strip drops over the card, turns green on *Connected* after 2 s, then slides back up |

The script starts 5 s after the entrance, leaves 4 s between steps and 6 s
before starting over — a full cycle is about 25 s. Changing the order means
reordering the `script.push` calls, and nothing else.

Nothing runs unless the hero is on screen and the tab is in the foreground; a
leak notification firing at someone reading section 8 is a bug. `data-beats`
on the section says which state it is in. The script also stands down under
`prefers-reduced-motion: reduce`; the readings keep drifting, since a number
changing is not motion.

The leak notification appears in an empty band — under the call to action on
desktop, and above the widget cluster below that. The band is always in the
layout even when the notification is not, so it never moves the page.
