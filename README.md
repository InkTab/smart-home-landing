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
index.html                  the landing page — scaffold: navbar + hero
css/
  tokens/
    palette.css             raw values — colour ramps and the two light colours
    semantic.css            roles + scales: surfaces, text, lines, type, space,
                            radius, shadow, motion, layout
  base.css                  reset, typography, the paper, drafting primitives
  components.css            buttons, forms, cards, badges, frames, tables, nav,
                            and the soft/neumorphic layer
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
