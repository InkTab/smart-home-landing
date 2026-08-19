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
index.html                  the landing page — header, section 01 (hero),
                            section 02 (the problem), section 03 (the plan)
                            and section 04 (starting small)
assets/
  appartment.webp           the apartment section 03 marks the hardware on
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
  reveal.js                 holds a section's entrance until it is on screen
  hero.js                   the hero's door beat
  problem.js                turning a cell of section 02 over
  plan.js                   pairing a point of section 03 with its card
                            (section 04 has no script — it is choreography)
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

The hero is already on screen when the page loads, but everything below it
would play its entrance to an empty room. A section marked `data-reveal` holds
every `data-anim` inside it until it scrolls in, and then runs the order as
written. `js/reveal.js` owns the attribute's value — the markup only ever
carries the bare `data-reveal`, so with no script, no `IntersectionObserver`,
or under `prefers-reduced-motion` nothing is ever paused and the page behaves
exactly as it did before.

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

## Section 02 — the problem

Two anxieties, one per row, and the rows are mirrors of each other:

| row | order | anxiety |
| --- | --- | --- |
| 1 | photo · quote · stat | the switches you already own |
| 2 | stat · photo · quote | the setup you have not started |

The photo is six of twelve columns and the two cards are three each, so
moving the wide column from first to second is the whole mirror. The photo
also sets the row's height and the cards stretch to meet it, which is what
makes a row read as one board rather than three neighbours.

Three treatments, three jobs, all of them from the design system:

| piece | treatment | why |
| --- | --- | --- |
| photo | `.frame`, recessed and hatched | an image sits *in* the paper |
| stat | `.card` + `.stat` + `.icon-plate`, raised | a number you can act on |
| quote | `.card--ink`, a whisper of an icon | an overheard thought is not the page's own voice, so it must not be set like the page's own copy |

The plate on a stat is `i-sliders` for the wall of switches and `i-grid` for
the wall of tabs, both at 38px rather than the sheet's 48 — a full plate beside
a 48px numeral makes the card read as two headlines instead of one number.

The frames are still placeholders: each carries the shot brief in its
`.frame__note`, the anxiety's name in the figcaption, and the delivery size in
mono next to it. Dropping the photograph in means replacing the `.frame` div
and nothing else.

The crop is 25:9, which is what sizes the section: the photo sets the row's
height, so the ratio is the row's height. It is wider than any of the fixed
ratios on the sheet and lives in `sections.css` rather than in the frame's own
set, because nothing else on the page wants this crop.

The layout drops in two steps. Under 1024px the photo takes its whole row and
the two cards pair off underneath — the mirror survives, because the photo
caps row 1 and floors row 2. Under 640px it is one column in source order,
which keeps all of row 1 above any of row 2, and the gap between the two rows
widens so the two anxieties do not read as one list.

### Turning a cell over

Every cell carries two faces: how it is now, and how it is once somebody has
installed it. Clicking anywhere on a cell turns it, and each cell turns on its
own — the section still opens on the problem, and the answer is something the
visitor asks for rather than something the page insists on.

The toggle in the corner is the real control, so the same thing happens from
the keyboard, and `aria-pressed` is what says which side is up. Its own click
bubbles to the cell, so there is one listener per cell and the button and the
card cannot disagree.

It is an arrow, not a word. Naming the answer on the front of six cards spends
the section's tension before the reader has felt it, and says the brand six
times over — the card's own copy is what should be read there. The arrow turns
back on itself once the far side is showing, and hovering anywhere on the cell
lights the corner up, so a bare glyph on a bare card is not a guess. The full
sentence survives as the button's `aria-label`, one per cell: six buttons all
called the same thing is no use in a list of buttons.

The front face stays in flow and the back is absolutely positioned over it.
That order matters: the front face is what gives the photo cell a height, and
the photo cell is what gives the row one. `backface-visibility` hides a face
from the eye but not from a screen reader, so `js/problem.js` keeps the pair
of `aria-hidden` attributes in step. Under `prefers-reduced-motion` there is
no turn at all — the two faces simply trade places.

One thing gives way on a phone: the 25:9 frame is only about 118px tall there,
and a corner button and a two-line shot note cannot both live inside it —
whichever corner the button takes, it lands on the note. So on the photo cells
the toggle drops out of the frame and sits at the end of the caption line
instead, which a 34px square still leaves room for.

## Section 03 — the plan

The answer to section 02, and the only photograph on the page that is a
photograph rather than a frame: one apartment, with the hardware marked on it.
Eight devices, each written once in the markup as a point on the photo and a
card of the same live readings the hero shows.

| device | where | reads |
| --- | --- | --- |
| TV & sound | living room | Standby |
| hub | hallway | Online |
| climate | living room | 21.8 °C |
| ceiling lights | living room | 40 % |
| smart lock | entry | Locked |
| presence sensor | hallway | Clear |
| leak sensor | kitchen | Dry |
| shades | dining area | 70 % |

The points are placed in per cent of the photo, on the pin and nowhere else —
`js/plan.js` copies `--x` and `--y` across to the card, so a device's place is
written once. `data-place` and `data-align` say which way its card hangs off
the point: centred and above unless the point is too near an edge for that,
which is why the leftmost and rightmost cards hang off their point instead.
Every card is inside the photo at every width from 900px up.

### Two layouts, one breakpoint

Only `css/sections.css` says where 900px is. The script reads the layout back
off the DOM — above the breakpoint the stylesheet lifts the rail out of the
flow, so `position: absolute` on the rail *is* the question "are we in tooltip
mode" — and never repeats the width itself.

| | the cards | the points |
| --- | --- | --- |
| under 900px | a rail under the photo, one card centred, snapping | the centred card's point is lit |
| over 900px | tooltips that open at their own point | the open card's point is lit |

Under the breakpoint a point is a shortcut rather than a tooltip: tapping one
brings its card to the centre of the rail. The rail is scrolled by hand rather
than with `scrollIntoView`, which would drag the page down to it and take the
photograph off the screen.

Over it, hovering a point opens its card and hovering the card holds it open —
there is a 140ms grace period, because the pointer has to cross the gap between
the two. A click pins a card open until something else is clicked or Escape is
pressed, which is what a touch device on a wide screen gets. The keyboard gets
the same card on focus, without the grace period, and `aria-expanded` on the
point is what says whether it is showing.

The rail is also the layout the page has with no JavaScript: eight cards under
the photo, in source order, nothing hidden. `data-plan="live"` is set by the
script and never by the markup, and the tooltip half of the stylesheet hangs
off it — so a hover that cannot happen can never hide anything.

One thing gives way to the photograph. The neumorphic shadows need the paper
ground under them and a point or a card sitting on a photo has not got it, so
those two use the cast-shadow scale instead — the exception section 14 of the
design system sheet documents. On the rail, where the cards are back on paper,
they go back to the soft shadow.

## Section 04 — start small

The reassurance section 03 owes: nobody has to do the whole house at once.
Four drawn device cards and one empty one, laid out as a plan rather than a
row, and the section makes its point twice — first the chain draws itself one
device at a time, then it closes up into a single object with the empty card
left out on the end of a line.

| card | reads | arrives |
| --- | --- | --- |
| hub, hallway | Online | 400 ms |
| ceiling lights, living room | 40 % | 700 ms |
| climate, living room | 21.8 °C | 1000 ms |
| smart lock, entry | Locked | 1300 ms |
| the empty one | — | 1600 ms |

The readings are section 03's, unchanged. What is different is how much of the
house is in them: the hub says *one room · four devices* where section 03's
says *12 devices · 4 rooms*, and the annotation in the corner dimensions the
distance between the two — `4 ———— 12`.

These are the one place on the page where `.card--drawn` is the whole set
rather than the exception: a chain of hardware on a plan is exactly what the
hairline language is for, and it also keeps the section from reading as a
fourth row of the same soft cards.

### A place and the thing standing on it

Every device is two elements. `.grow__node` is the place on the plan — it owns
the link that reaches it and it is what moves when the chain closes up.
`.grow__card` is the hardware standing there, and it owns the arrival. They
are split because an element can only be playing one animation of a property
at a time, and these two beats are minutes apart in the section's story: the
same reason the hero's jump lives on the card and the entrance on the wrapper.

### The links

A link lives on the node it arrives at, absolutely positioned into the gap on
the side it comes from, so its length **is** the gap — `--gap-x` and `--gap-y`
are declared once on the chain and used by both. A device and the link that
reaches it are written together in the markup, and the hub, which nothing has
to reach, simply has none.

They are dashed because nothing here is wired: a device pairs itself to the
hub over the air, which is also why the chain can be added to in any order.
Each one is drawn out of its own length rather than scaled into place — a
scaled dash stretches, and these are dashes.

### Closing up — written, and held back

**This beat is switched off at the moment.** One block at the foot of section
04 in `sections.css` holds it back; deleting that block is what turns it back
on, and nothing else has to change. What runs today is the chain drawing
itself and then staying drawn, links and all. The rest of this section
describes what comes back when it does.

Five seconds after the last device has landed — `--gather: 7200ms`, declared
once on the chain in the markup — the four devices come together into one
object. Everything moves to the hub, so the hub is the one card that does not
move at all, and the drafting kit's corner ticks on it are what say so once
the entrance is over.

| | before | after |
| --- | --- | --- |
| between devices | `--gap-x` / `--gap-y` | `--gap-tight` |
| the links between them | drawn | faded out |
| the empty card | one gap off the chain | one gap off the chain |

The three links between devices are drawn and then taken away again, which is
two beats on one element, so those wires are the only place the `[data-anim]`
shorthand is written out in full: the draw runs on the link's own `--d`, the
fade on the chain's `--gather`.

The empty card travels with the card in front of it rather than closing up on
it. That is the whole trick of the last beat — every other link goes, its link
stays, and what is left on the page is one system and somewhere for the next
device to go.

Where a node ends up is a pair of custom properties on the node, `--gx` and
`--gy`, so one keyframe serves both layouts and the markup only has to say
when. A node is one column wide even when the card standing on it is not,
which is what lets a move be written as "one column left" — `-100%` of the
node — instead of a measurement.

There is still no script. Both beats are the entrance choreography in
`sections.css`, held by `data-reveal` until the section is on screen.

Two things have to be called off together, which is why the switch is one
block rather than one line: the move, and the fade that takes the links away.
Calling off the move on its own would strip the links at 7200 ms from cards
that never moved. And when the beat comes back, so does the exception it needs
under `prefers-reduced-motion` — the global rule in `base.css` only flattens
durations, so the delay still fires and would land the move as a jump, which
is the one thing that preference is asking not to see.

### Two layouts, one breakpoint

The same 900px section 03 uses.

| | the chain | the links | the empty card |
| --- | --- | --- | --- |
| under 900px | one column, top to bottom | all vertical | narrower than a device, centred |
| over 900px | four columns, two rows | horizontal, except the drop | at the head of the fourth column |

Over the breakpoint the chain steps right, down and right again, and closes up
into a 2 × 2 block in the corner it started from; the annotation takes the
corner the stagger leaves empty. It is last in the markup and placed into that
corner by `grid-area`, because in one column it belongs after the chain rather
than in the middle of it — and it stays where it is when the chain closes,
being an annotation on the chain rather than a step in it.

The cards stretch to their row, so every horizontal link meets its neighbour
at the same height without anything being measured. The empty card is the one
exception — it is centred rather than stretched, which keeps it smaller than a
device and, because the row's centre is also the other cards' centre, keeps
its link level with the rest.

Nothing in the section is interactive. The empty card is a place, not a
control: there is nothing to press, only somewhere for the next device to go.
