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
                            section 02 (the problem), section 03 (the plan),
                            section 04 (starting small), section 05 (what it
                            costs), section 06 (how it goes), section 07
                            (what happens after), section 08 (the brand and
                            the ecosystems it works with), section 09 (the rest
                            of the questions) and section 10 (the close),
                            then the footer every page carries
privacy.html                the privacy policy — the frame is written, the
                            policy itself is [tbd]
assets/
  appartment.webp           the apartment section 03 marks the hardware on —
                            2000 x 1091, and the top rung of its own srcset
  appartment-{480,800,1144,1600}.webp
                            the smaller rungs, made by ./build.sh --images
css/
  tokens/
    palette.css             raw values — color ramps and the two light colors
    semantic.css            roles + scales: surfaces, text, lines, type, space,
                            radius, shadow, motion, layout
  base.css                  reset, typography, the paper, drafting primitives
  components.css            buttons, forms, cards, badges, frames, tables, nav,
                            and the soft/neumorphic layer
  sections.css              page composition — entrance choreography, header,
                            one block per section of the page, the footer, and
                            the legal page's single measure of prose
  halo.css                  generated — the five above, concatenated by build.sh
js/
  i18n.js                   the EN/RU dictionary, the switch, and the keys
  reveal.js                 holds a section's entrance until it is on screen
  hero.js                   the hero's door beat
  problem.js                turning a cell of section 02 over
  plan.js                   pairing a point of section 03 with its card
                            (section 04 has no script — it is choreography)
  calc.js                   section 05: the three questions, the sum, and the
                            mailto: the answer is written into
                            (sections 06 to 10 have no script — they are
                            choreography, and section 09's disclosure is
                            <details>)
  halo.js                   generated — the six above, concatenated by build.sh
design-system/
  design-system.html        the visual playground — every token and component
  design-system.css         layout for the playground sheet only
  design-system.js          swatch copying, grid toggle, sliders, dial, tiles
build.sh                    builds the two bundles and stamps ?v= on the pages
_headers                    cache rules — inert on GitHub Pages, see Caching
```

Load order matters: `palette.css` before `semantic.css` before everything else.
Components reference semantic tokens only — if a component needs a raw
`--steel-*` or `--paper-*` value, that is a missing semantic token.

## Running it

Any static server works — plain HTML and CSS.

```bash
python3 -m http.server 4173
```

There is one build step, and it is a shell script with no dependencies. The
pages load `css/halo.css` and `js/halo.js`, which `build.sh` concatenates from
the sources. Edit the sources, never the bundles, then:

```bash
./build.sh
```

Both bundles are committed, because GitHub Pages serves the repository as it
is and cannot run the script. `./build.sh --check` exits non-zero when they
have drifted from the sources — worth a pre-commit hook if you forget.

The site is at http://localhost:4173/ and the design system at
http://localhost:4173/design-system/design-system.html

Fonts (Jura, Inter, IBM Plex Mono) load from Google Fonts, so the page needs a
network connection to look right; it falls back to system sans and mono stacks
offline.

## What holds the render

One thing blocks the first paint: `css/halo.css`. It is what the first paint
looks like, so it should. Nothing else in the head does.

It is the five source layers concatenated in load order, and it is one request
instead of five. The layering is an authoring concern, not a delivery one —
the browser sees the same cascade either way.

The fonts do not. `display=swap` means the copy is drawn in the fallback stack
and swapped when the faces arrive, so a font stylesheet that blocks paint buys
nothing at all: it delays the same two-stage render rather than avoiding it.
So it is fetched as a `preload` and promoted to a stylesheet on load, with the
same request repeated inside a `<noscript>` for a browser that cannot do the
promoting. The one caveat is that the promotion is an inline `onload`
handler — a Content-Security-Policy without `unsafe-inline` would leave the
page on its fallback stack.

Swapping is only free if the two stacks occupy the same space. Inter is wider
than any system sans it falls back to, so the hero paragraph used to gain a
line when Inter arrived and push the call to action down 30px — a layout shift
in the first screen, on every first visit. `"Inter Fallback"` in
`css/tokens/semantic.css` is Arial with `size-adjust` and the ascent/descent
overrides set to Inter's metrics, sitting first in `--font-sans`: the swap now
changes the glyphs and not the line breaks. Jura and IBM Plex Mono were each
measured against their fallbacks and move nothing, so neither has one.

The request asks for the weights the stylesheets actually set and no others:

| face | asked for | why |
| --- | --- | --- |
| Jura | 400–600 | 400 on the readings and the brandmark, 500 on the display sizes, 600 on headings and labels |
| Inter | 400, 500, 600 | body, the medium in controls, and the semibold in titles |
| IBM Plex Mono | 400 | nothing anywhere sets mono to any other weight |

The script does not block either. `js/halo.js` is `defer`red and sits in the
head, so it is fetched alongside the stylesheet rather than after the last of
the markup, and runs once the document is parsed. Every source assumes exactly
that: they all read the DOM the moment they run, and `i18n.js` has to have put
`window.Halo` up before the rest go looking for it — which is why `build.sh`
concatenates in a fixed order and `i18n.js` is first.

Merging them is safe because each source is already wrapped in its own
`(function (window, document) { … })(window, document);`. Nothing is declared
at the top level, so nothing can collide, and each ends in a semicolon, so the
next one cannot be parsed as a call on it. Each also returns early when its
section is absent, which is why the same bundle serves `privacy.html` — the
five scripts that page has no use for find nothing and stop.

The bundles are not minified. The pages are served gzipped, which already
collapses the whitespace and repetition a minifier would: the five stylesheets
are 114 kB raw and about 27 kB over the wire. Minifying on top buys a few kB
and risks a hand-rolled pass mangling a selector or an ASI-sensitive line, so
the sources go over verbatim, comments and all.

## Caching

Every static asset here is immutable in practice, and `build.sh` stamps
`?v=<content hash>` on both bundle URLs so a new build is a new URL. That is
everything a year-long `Cache-Control` needs to be safe.

GitHub Pages will not give it one. It serves everything with a fixed
`max-age=600` and ignores `_headers`, `.htaccess` and `vercel.json` alike;
there is no setting for it. So a returning visitor re-fetches the whole page
after ten minutes, and no change in this repository can alter that.

Two things do:

- **Put Cloudflare in front of the custom domain** (free tier). A Cache Rule
  setting Browser TTL and Edge TTL to a year on `/css/*`, `/js/*` and
  `/assets/*` overrides what Pages sends. The origin stays where it is.
- **Move the hosting to Netlify or Cloudflare Pages.** Both read the `_headers`
  file already in the root, which encodes exactly the rules above.

Until one of those happens, treat a caching audit's verdict on this site as a
fact about the host rather than about the page.

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

A page's `<title>` and description are the one pair `apply()` writes by hand
rather than off a key in the markup, so a second page has to be able to name
its own. It does that on `<html>`:

```html
<html lang="en"
      data-meta-title="privacy.meta.title"
      data-meta-desc="privacy.meta.description">
```

The landing page names neither and gets `meta.title` and `meta.description`,
which is what it always used.
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
on the section says which state it is in.

Whether it is on screen is an `IntersectionObserver`'s answer rather than a
measurement taken on every scroll frame. The beats are changing the DOM on
their own timers the whole time, so a `getBoundingClientRect()` on scroll
lands on style that has just been invalidated and forces the layout to be
computed on the spot — 57 ms of it across a page load, which is what
Lighthouse reports as a forced reflow. An observer's rectangles are ones it
measured itself, so reading them is free. The threshold is unchanged: more
than 40% of the hero, or of the screen when the hero is the taller of the
two. A browser without the observer measures the old way, batched into a
frame. The script also stands down under
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
makes a row read as one board rather than three neighbors.

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

The points are placed in percent of the photo, on the pin and nowhere else —
`js/plan.js` copies `--x` and `--y` across to the card, so a device's place is
written once. `data-place` and `data-align` say which way its card hangs off
the point: centered and above unless the point is too near an edge for that,
which is why the leftmost and rightmost cards hang off their point instead.
Every card is inside the photo at every width from 900px up.

### Two layouts, one breakpoint

Only `css/sections.css` says where 900px is. The script reads the layout back
off the DOM — above the breakpoint the stylesheet lifts the rail out of the
flow, so `position: absolute` on the rail *is* the question "are we in tooltip
mode" — and never repeats the width itself.

| | the cards | the points |
| --- | --- | --- |
| under 900px | a rail under the photo, one card centered, snapping | the centered card's point is lit |
| over 900px | tooltips that open at their own point | the open card's point is lit |

Under the breakpoint a point is a shortcut rather than a tooltip: tapping one
brings its card to the center of the rail. The rail is scrolled by hand rather
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
| under 900px | one column, top to bottom | all vertical | narrower than a device, centered |
| over 900px | four columns, two rows | horizontal, except the drop | at the head of the fourth column |

Over the breakpoint the chain steps right, down and right again, and closes up
into a 2 × 2 block in the corner it started from; the annotation takes the
corner the stagger leaves empty. It is last in the markup and placed into that
corner by `grid-area`, because in one column it belongs after the chain rather
than in the middle of it — and it stays where it is when the chain closes,
being an annotation on the chain rather than a step in it.

The cards stretch to their row, so every horizontal link meets its neighbor
at the same height without anything being measured. The empty card is the one
exception — it is centered rather than stretched, which keeps it smaller than a
device and, because the row's center is also the other cards' center, keeps
its link level with the rest.

Nothing in the section is interactive. The empty card is a place, not a
control: there is nothing to press, only somewhere for the next device to go.

## Section 05 — what it costs

The one place on the page that asks the visitor for anything, so it asks for
as little as it can: three questions, disclosed one at a time, and a range
rather than a price. There is no form, no field and no endpoint — the way out
is a `mailto:` with the answers already written into it.

| step | question | answer |
| --- | --- | --- |
| 1 · vision | what do you want to solve today? | any of three goals |
| 2 · scale | how much house are we covering? | one of three footprints |
| 3 · details | one question per goal picked | a slider each, optional |

| goal | what is in it |
| --- | --- |
| security | door and window sensors, locks, cameras, leak sensors, garage doors |
| climate | a thermostat, and a temperature sensor per room |
| light | switches, color bulbs and LED strips, blind controllers |

Step 2 is the whole reason the section is short. Nobody is asked to inventory
their windows: the footprint answers for them, and step 3 then asks the one
critical multiplier per goal and nothing else — **exterior doors** for
security, **rooms with their own reading** for climate, **rooms with light
control** for light. A goal nobody chose has no question, which is why the step
is written with every row in the markup and the script takes away the ones that
were not earned. Chase a single goal and step 3 is one slider.

The lawn is the exception that proves the rule: it is a question about the
plot rather than about a goal, so it is the **footprint** that asks it, and
only of a single family home. It is a switch rather than a slider, because it
is a yes or a no.

### The bill

The estimate is a range because the hardware is: a lock is $80 on one door and
$280 on another. So the two figures are one bill of devices costed twice —
everything at its floor, then everything at its ceiling — rather than one
figure with a margin painted around it. A job made only of fixed-price parts
therefore has no range at all, and the result shows a single figure and drops
the dimension line rather than printing the same number twice.

| line | each | how many |
| --- | --- | --- |
| hub | $180 | one, always |
| door and window sensor | $30 | exterior doors + the footprint's windows |
| smart lock | $80–280 | one per exterior door |
| camera | $50–220 | the footprint |
| leak sensor | $22 | the footprint |
| garage door controller | $40 | the footprint |
| thermostat | $250 | one per home |
| temperature sensor | $22 | rooms asked for |
| light switch | $50–120 | rooms asked for |
| color bulb / LED strip | $25–150 | rooms asked for |
| blind controller | $50 | the footprint |
| watering controller | $50 | one, if the lawn is on |
| water valve | $80 | one per zone |

Then **+30% for the work**, applied to both ends so they stay in proportion,
and the total rounded to the nearest 10. Tax is not in it, and the range says
so: a small `+ tax` rides beside the upper figure.

What the footprint answers on the visitor's behalf, and what the three sliders
start at:

| | flat | town | house |
| --- | --- | --- | --- |
| exterior doors *(slider)* | 1 | 2 | 3 |
| rooms with a reading *(slider)* | 2 | 3 | 5 |
| rooms with light control *(slider)* | 3 | 5 | 8 |
| windows | 4 | 7 | 11 |
| cameras | 1 | 2 | 4 |
| leak sensors | 2 | 3 | 4 |
| garage doors | 0 | 1 | 2 |
| blinds | 3 | 5 | 8 |
| watering zones | — | — | 4 |

A slider that has not been touched follows the home, so picking a house
re-answers step 3 the way a house would and the step can be skipped entirely.
It stops following the moment it is moved by hand.

The result lists the bill under the two figures — one line per kind of device
and the count against it, with the work as the last line. Counts only: what a
lock costs is the survey's business, what belongs on a landing page is the
shape of the job.

### The letter

The estimate is a range, and the whole of it goes into a `mailto:` URL:

```
To       hello@yoursmarthome.com
Subject  Quote Request: $3,820–$7,510 Smart Home
Body     Hi team, I just used the calculator on your site. I'm interested
         in the Whole Home package for my 3+ Bedroom Home. …
```

The package name is the goals in the order step 1 asks them — *Security &
Light* — and all three of them stop being a list and become *Whole Home*. The
subject and the body live in the dictionary with `{placeholders}` in them
rather than being stitched together from fragments, which is what lets the
Russian letter put the same three answers in a different order. Both are run
through `encodeURIComponent`, and nothing is posted anywhere: the visitor's own
mail client is the form, and they read and edit every word before it is sent.

Under the console, and outside it, is the plain `mailto:` with nothing written
into it — *Have a unique project? Email us* — for anyone the three questions do
not fit.

### One object, two steps

Both choice steps are the same thing: a soft tile wrapped around a native
checkbox or radio. The input is the system's own `.visually-hidden`, so it is
still focusable, still checkable from the keyboard, and still what the label is
for — and the stylesheet only has to press the tile in when its input is
checked, which is what a tile on the wall panel already means. Step 3 is the
system's sliders and its switch, unchanged.

### Without a script

`data-calc="live"` is set by `js/calc.js` and never by the markup, the same
arrangement section 03 has with its rail. With no script the progress and the
two nav buttons stay hidden, all three panels are on the page as one readable
form nobody can get stuck inside, and the line underneath is the way out. The
result panel is the only thing hidden in the markup, because it is the only
thing that needs the sum to exist.

The sliders carry their starting `--fill` inline for the same reason: a track
that no script ever reaches should not be drawn half full with its thumb at
one end.

### Where you are

`Step 1 of 3` on the left, `2 steps left` on the right, and a three-segment
track under them: filled steel for the step being answered, a paler fill for
the ones behind it, empty inset track ahead. Once the estimate is up the
counter goes and the rail is simply full — leaving it would put *Your estimate*
on the console twice, once in the corner and once over the number it belongs
to.

The stage keeps a floor under it so stepping between panels does not drag the
nav buttons up the page under the pointer. It is the height of the two choice
steps rather than of the tallest panel: a floor set by the longest step would
leave a hole under the shortest.

### Two layouts, one breakpoint

760px, and it is this section's own — the three tiles are what set it, not the
900px the plan and the chain share.

| | the tiles | the range |
| --- | --- | --- |
| over 760px | three columns, the plate above the name | two figures with a dimension line between them, `+ tax` beside the upper one |
| under it | one column, the plate beside the name | the line turns, and the range is read down the page |

## Section 06 — how it goes

Section 05 puts a number on the page, and the first thing a number wants is
to know what it buys and how long it takes. So this is the plainest section
on the page: what actually happens once somebody says yes, and when. Three
steps, named for what they are, on one rail.

| step | what it is | and when |
| --- | --- | --- |
| 01 | consultation — the two of you settle the device list | about an hour |
| 02 | prepayment — the kit is ordered for this project | ordered the same day |
| — | *the wait* — the hardware is in transit | ≈ 2 weeks |
| 03 | installation — mounted, paired, named, tested | 4–8 hours |
| ◉ | and that is all | — |

Two of those timings are the installer's: a fortnight for delivery, and four
to eight hours on site depending on the size of the home. **About an hour for
the consultation is an assumption**, and it lives in one key — `flow.s1.footValue`
— so changing it is a one-line edit in each language.

### The wait is drawn, not described

The rail is the section's one idea. It is solid wherever somebody is doing
something and dashed through the fortnight the hardware is in transit, and
that stretch is the one place on the rail with no card against it. The shape
of the schedule is therefore legible before a word of it is read: two beats, a
long empty one, a last beat, done. Dashed for the same reason section 04's
links are — nothing is happening along that length — and the note beside it
says the one thing worth saying about a wait, which is that nothing is wanted
from the visitor during it.

The end of the line is the only filled mark on it, lit from the same top-left
source the primary button is. It is not a step, so it is not a card either:
the closing line sits straight on the paper.

### Two layouts, one breakpoint

1000px, and it is this section's own — three steps side by side need more
width across than the plan does at 900px, the same way the calculator's three
tiles needed their own 760px.

| | the rail | the steps | the end of the line |
| --- | --- | --- | --- |
| under 1000px | runs down the page | one per row, beside the rail | on the rail, under the last step |
| over it | runs across | side by side under it | under the whole schedule, centered |

Only the axis changes: the rows, the marks, the segments and the cards are the
same objects either way, and a row of the vertical layout is a column of the
horizontal one. Which way the segments uncover is the layout's business, so
the sideways keyframe is picked up at the breakpoint exactly as section 04
picks the axis of its links.

Two things are the horizontal layout's alone. The columns stretch to the
tallest of them, so three steps with different amounts to say still read as
one row of cards; and the number stands in the middle of its step rather than
at the head of it, so the rail crosses each column and passes behind the
marks on the way. Only the two ends of it stop at a mark — the schedule starts at the first
step and finishes at the last, and there is nothing either side of those to
reach. A mark is lifted over the run it stands on, because a segment is
positioned and would otherwise paint across the disc.

A segment is drawn by uncovering rather than by scaling. The wait's is
dashed, and a scaled dash stretches — the thing section 04's links animate
their own length to avoid — so one keyframe that touches no geometry serves
the solid runs and the dashed one alike.

Nothing here is interactive, and nothing is folded away behind a press: a step
is a title, what happens in it, and how long it takes, which is the whole of
what anybody needs before they can say yes. So there is no script either — the
section is the entrance choreography, held by `data-reveal` until it is on
screen.

## Section 07 — nothing here is set in stone

A price is where the objections start: what if I need more later, what if I
move, and what happens once you have gone. Section 06 has just walked through
the install and left on the last line of it, which is exactly where the third
of those is asked. The first two were already answered — the plan grows in
section 03 and the chain starts at four devices in section 04 — but they were
answered before there was a price to argue with. So they are made again here,
on the far side of it, and the one thing the page has never said is added to
them: every install carries a year of support.

Two soft claim cards and one ink panel:

| piece | what it is | why that treatment |
| --- | --- | --- |
| add whatever comes next | `.card`, `i-plus` | a repeat, so it is compact — the argument was made two sections ago |
| it unplugs | `.card`, `i-plug` | the same, and the plug is the claim: nothing is drilled |
| the year | `.card--ink` | the only new information on the page, and the first of its two dark surfaces — section 10 is the other |

The year is deliberately narrow. It covers what the visitor adds, the
batteries, and a look at the system from wherever we are — and it does **not**
claim to rewrite automations, which is a bigger promise than a landing page
should make on an installer's behalf. Nothing in the copy says what happens
after the twelfth month either: the year is included in the install, and the
sentence that would explain month thirteen is a sentence about a subscription.

The panel reads the year as a dimension line, `Handover ———— 12 months`, for
the same reason the estimate in section 05 is one: two ends and the distance
between them is what the drafting kit is for. It runs across the head of the
panel, above both columns and above the title — the span is what the panel is
about, so it is read before the promise rather than as a footnote to it, and
it is the only rule in there: nothing else is divided off.

### What the ink cost

`--surface-ink` takes the paper ground away, and everything standing on it was
drawn for paper. What the card itself owns went into `components.css` beside
the `.card--ink` rules that were already there:

| | on paper | on ink |
| --- | --- | --- |
| `.list-check` | `--text-muted` | `--steel-200`, ticks at `--steel-400` |
| `.badge` | a raised paper chip | flat, a 10% white tint of the ground — the soft shadow's highlight reads as a *halo* around a chip on a dark card. The solid badge keeps its steel fill and only loses the light. |
| `.card__foot` | a `--paper-300` hairline | white at 16% — not used by this section, but the sheet had been carrying it as an inline `border-color` since it was written, so the gap was filled while it was open |

The line is this section's own composition, so it stayed in `sections.css`:
`.dimension` is `--steel-400` on `--steel-600`, which is right on paper and
nearly invisible on ink, so `.adapt__span` takes the same two steps of the ramp
from the other end — `--steel-500` and `--steel-300`.

Section 08 of the design system sheet has the badges on ink beside the ones on
paper, so the difference is visible rather than only written down here.

### Two layouts, one breakpoint

The 900px sections 03 and 04 share. Over it the claims are two columns and the
panel puts its copy beside what the year covers, 5fr to 6fr — the list is the
longer half, and the copy is the half that must not run to a full measure. The
measurement spans both columns, since it is of the year rather than of either
half. Under the breakpoint everything stacks in source order, so the line is
still read first and the panel's heading still arrives before the list it
heads.

Nothing here is interactive, so there is no script: the section is the
entrance choreography, held by `data-reveal` until it is on screen. The three
covered lines arrive one after another rather than with the panel, which is
what keeps a dark rectangle from landing on the page fully written.

## Section 08 — the brand, and what it works with

The page has argued for a system without ever saying whose. That is fine while
the argument is about how you live, and it stops being fine after the price and
the year of support: by section 07 the visitor has been asked to trust an
installer, and the last unasked question is what is actually going on the wall
and whether it will talk to the phone they already own.

So the section is two statements and nothing else. Aqara, alone and larger than
anything around it, and then a rule that says `Works with` and the platforms on
the other side of it. No cards, no claims, no copy under the marks — a logo row
that explains itself is a logo row that is not confident.

| piece | what it is |
| --- | --- |
| the lockup | the Aqara wordmark at `--steel-700`, full strength, with a mono note under it |
| the rail | a hairline either side of a `.label` — the sheet's way of writing *and* |
| the row | nine marks at `--text-subtle`, `opacity: .62`, lifting to `--steel-700` on hover |

### Why the marks are not all the same height

Equal pixel height is the wrong normal for a logo row. A square glyph at 26px
and a wordmark at 26px do not read as the same size — the wordmark is 26px of
cap height carried across 100px of width, and it shouts. Each mark therefore
sets its own `--logo-h` beside its file in `sections.css`, tuned by eye against
its neighbours, and `.trust__logo` only supplies the fallback:

| | Apple | Google Home | Alexa | SmartThings | Matter | Thread | Zigbee | Home Assistant | IFTTT |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `--logo-h` | 23 | 25 | 31 | 26 | 21 | 16.5 | 26 | 26 | 15 |

Alexa is the tallest because its box carries the swoosh below the word, so the
word itself lands near 22px. IFTTT and Thread are the shortest because both are
set in a heavy face and read larger than they measure.

### Where the icons live

Each of the 33 icons is a file in `assets/icons/`, and no page holds a
hand-written sprite any more. Every page carries an `icons:` list in the comment
above its sprite, and `./build.sh` fills the `<symbol>` block in from that list —
twenty for the landing page, two for the privacy page, all thirty-three for the
design system sheet, which is what makes it the sheet.

The sprite stays *inline*, not a file fetched with `<use href="icons.svg#id">`.
An external sprite would save about a kilobyte gzipped and cost a request that
57 icon boxes would sit empty waiting for — a hole in the same first paint the
blocking stylesheet exists to keep whole.

**The list is the source, not the `<use>` elements.** `hero.js` swaps
`#i-lock` for `#i-door` when the door beat fires, and `design-system.js` swaps
`#i-menu` for `#i-x`; neither id ever appears in a `<use>` in the markup, so a
sprite inferred from the page would drop them and break both swaps with nothing
to show for it. Those ids carry a note in the page that says why they are
listed. What `--check` *can* catch is the opposite mistake — a `<use>` naming an
icon nobody listed — and it does, by name.

### Where the marks live

Each mark is its own file in `assets/logos/`, and the markup for one is an empty
`<span role="img" aria-label="Apple Home">` — 21 kB of path data used to sit in
`index.html`, a fifth of the file.

They are pulled in with `mask-image`, not `<img>`. An `<img>` is a separate
document that the page's stylesheet cannot reach into, so the row could not be
toned down or warmed on hover; a mask is painted with `background`, so
`background: currentColor` puts the whole row back under one `color`. Only the
alpha channel is read, so the fill inside each file is irrelevant. The cost is
that a `<span>` has no viewBox to resolve `width: auto` against, so each mark
carries an `--logo-ar` taken from its file — the one thing the old inline SVG
got for free.

Forced-colors repaints every background, which for a masked mark means erasing
it, so the mode gets the row restated in `CanvasText`. An inline SVG needed no
such handling: a fill is painted as text.

### What the photograph weighs

One shot serves every viewport, so it ships as a `srcset` ladder rather than at
one size. The widths come off the measured layout, not from a round-number
habit: the figure is 92% of the viewport until the 1240px container caps it at
1144px, which is what `sizes` says.

| viewport | figure | at 2x |
| --- | --- | --- |
| 375 | 314px | 800w |
| 768 | 691px | 1600w |
| 1024 | 937px | 2000w |
| 1240 and up | 1144px | 2000w |

`sizes` declares 92vw below the cap, which slightly over-states the narrowest
widths. That is deliberate — over-stating costs a rung, under-stating costs
sharpness, and 480w is the floor anyway.

2000w is the shot itself, and it is short of the 2288 a 2x display wants at the
capped width. Upscaling to meet it would add bytes and no detail, so the ladder
stops at the original.

A phone that used to pull the full 147 kB now pulls 39 kB.

Regenerate after replacing the photograph:

```bash
./build.sh --images
```

### Where the artwork came from

| source | marks |
| --- | --- |
| aqara.com | Aqara |
| simple-icons (CC0) | Apple, Google Home, SmartThings, IFTTT, Zigbee, Home Assistant |
| Wikimedia Commons | Amazon Alexa, Matter, Thread |

Alexa and Amazon were withdrawn from simple-icons at the trademark holder's
request, and Aqara and Matter were never in it, which is why the row is not
sourced from one place. Each file was stripped to its path data — every fill,
style, class and editor attribute removed — so nothing arrives with a colour or
a script attached.

The names are held in `<title>` inside each `<svg>`, not in the dictionary:
brand names do not translate, and section 08 is the only part of the page where
the RU switch changes the frame and leaves the contents alone.

### One layout

The row is a centred `flex` that wraps, so there is no breakpoint. All nine fit
on one line at 900px and fall to 4/3/2 on a phone. The section is the entrance
choreography and nothing else, so there is no script: the marks arrive left to
right, 60ms apart, after the rule they hang from.

The caption under the row is not decoration. The page is claiming compatibility,
not partnership, and the difference is worth one line of `--text-subtle`.

## Section 09 — the rest of the questions

The page has now made every argument it has, and section 08 answered the last
one it could answer with a picture. What is left is the residue: the six
things somebody asks on the phone after reading all of it, none of which is
worth a section and all of which would cost the page its shape if it tried to
work them into one. So they go at the foot of the drawing, where the notes on
a drawing go.

| # | the question | the answer, in one line |
| --- | --- | --- |
| 01 | does it stop working when the internet does? | the hub is in the house, so the house keeps working; the app from outside does not |
| 02 | do I have to use my phone for everything? | every light keeps its switch |
| 03 | is there a monthly fee? | no — hardware and work, once |
| 04 | can you use what I already own? | usually, if it speaks Zigbee, Matter or Thread |
| 05 | who can see the cameras and the sensors? | you; we look only when asked, and that is yours to withdraw |
| 06 | what happens if something breaks? | the manufacturer's warranty, and we make the claim |

Three of them are answered nowhere else on the page: the outage, the wall
switch and the fee. The other three are the page's existing claims turned
around and asked as objections, which is the only form some visitors will
recognise them in.

Two things are said as narrowly as they can be. **The warranty carries no
number** — a length varies by device and by market, and a landing page that
prints one is making a promise on a manufacturer's behalf. And the fee answer
says nothing about the thirteenth month, for the same reason section 07 does
not: the sentence explaining month thirteen is a sentence about a
subscription.

### The register

`<details>` is the disclosure. It brings its own control, its own keyboard and
its own expanded state, so there is no script here and nothing to keep in step
— the one part of the page where the platform already owns the whole
interaction.

Each row opens on its own; they are not an exclusive group. Section 02 turns
its cells one at a time for the same reason, and an answer that vanishes
because you opened the next one is an answer you cannot compare.

A row is a number, a question and a mark, and the number is the point of it. A
question in a list is a question; a numbered note under a rule is a register,
which is what the foot of a drawing sheet carries. The index column is
declared once on the list as `--faq-index` and `--faq-gap`, and both the
question and the answer are placed off it — the answer starts where the
question starts, and the hairline bracketing it to its note runs down the
middle of the column above.

The mark is two hairlines rather than a glyph. It opens by turning a quarter
and losing its upright, which leaves a minus rather than a cross: a cross
means *close this*, and nothing here closes. The row lights the index and the
mark on hover, so a bare pair of lines is never a guess.

Alignment is the fiddly part, and it is one line. The row is baseline-aligned,
so the index sits on the question's first baseline however many lines it runs
to — which matters on a phone, where every question is two. An empty box has
no baseline of its own and takes one from its bottom edge, so a 13px mark
lands its bars level with the index without being told to.

### Opening it

Two beats, and only one of them is guaranteed. The copy fades down from under
the question as a keyframe, because the answer is *created* on open and a
transition has no earlier state to start from. The height is a transition on
`::details-content`, behind `@supports (interpolate-size: allow-keywords)` —
where the browser cannot interpolate `auto` the fold snaps and only the fade
runs, which is the native behaviour and reads fine. `interpolate-size` is
inherited, so it is set on the section rather than on `:root`: nothing else on
the page asked for it.

Neither beat needs an exception under `prefers-reduced-motion` — both are
durations, and the global rule in `base.css` flattens them.

### One breakpoint

560px, the phone block sections 05 and 07 use. The index column and its gap
tighten and the question drops from `--text-lg` to `--text-md`; nothing moves,
because there is only ever one column. The list is capped at 860px rather than
at `--container-narrow`, which the head keeps: a question wants the full line,
an answer does not, and the answer is held to 62ch of its own.

The last line on the page is the way out for the seventh question — the same
`mailto:` section 05 offers under the calculator, which is the only address
the page has.

## Section 10 — the close

Nine sections have argued and the last of them answered the leftovers. What is
missing is the ask. Section 05 is a long way up the page by now, and a visitor
who read to the bottom has just spent several sections being told the price is
knowable without being pointed back at the thing that knows it. So the page
ends where it began: the hero's own call to action, repeated, and pointed at
the calculator.

| | the action | where it goes |
| --- | --- | --- |
| primary | Build My Smart Home | `#calc` — the calculator |
| secondary | Talk to us first | the `mailto:` |

That pair is not new. It is the only pair the page has ever had — three
questions and a range, or a person — and the close does nothing except put
them next to each other for the first time.

**The primary carries the hero's key, `hero.cta`, rather than a copy of its
string.** A repeat that is stored twice is a repeat that drifts, and this one
has to survive both languages.

### The hero's link was broken

The hero pointed at `#calculator`. Nothing on the page has that id — the
section is `id="calc"` — so the page's single call to action had never
scrolled anywhere. It is `#calc` now, in both places. `scroll-padding-top` in
`base.css` is what stops the header sitting on the section's eyebrow when it
lands.

### The second ink panel

Section 07 took the paper away for the one new claim on the page. This takes
it away for the one thing the page wants done, and there is no third: ink is
the page's emphasis, and a page with three emphases has none. Everything on it
comes from the inverse half of the sheet — `.btn--inverse` for the primary,
`.btn--inverse-outline` for the secondary, both already drawn for a dark
ground, which is why neither needed a line of new CSS.

One gap turned up, the same kind section 07 found in the badges. `.mono` is
set `--text-muted` for paper, which is all but black on `--surface-ink`, so
`.card--ink .mono` went into `components.css` beside the other ink resets. It
takes `--steel-300` — 6.9:1 on the ink ground, the same step the label does.
`--steel-400` clears AA at 5.1:1 and was still too faint to read: mono is the
lighter of the two faces and it is being set at annotation sizes, so the
contrast figure is a floor here rather than an answer.

The panel wears the drafting kit's corner ticks. They sit on the bounding box
rather than on the rounded corners, which is what a crosshair on a drawing
does: it marks the extent of the object, and the object here is the last one
on the sheet.

### The spec line

Under the buttons, in mono: `≈ 1 minute · no account · nothing is posted
anywhere`. Every clause of it is an objection to pressing the button, and all
three are true of section 05 as built — three questions, no field, no
endpoint, and a `mailto:` the visitor reads before sending. It is the one
place the page says out loud what the calculator's architecture already
guarantees.

It is set at `--text-sm` rather than the sheet's `--text-xs`, which is the one
place the section overrides `.mono`. The annotation size is right for a value
sitting next to the thing it measures — a delivery size beside a frame, hours
beside a step — and wrong for a sentence standing alone in the middle of a
900px panel. This line is read, not checked.

### One breakpoint

560px, the phone block sections 05, 07 and 09 use. Two pills side by side stop
fitting long before the panel does, so the actions turn into a column and
stretch — a full-width button is the phone's own idiom, and a pill that has
had to shrink its label is worse than one that has not.

Nothing here is interactive beyond the two links, so there is no script: the
panel is the entrance choreography, held by `data-reveal` until it is on
screen, and its contents arrive after it rather than with it.

## The footer

A hairline, the brand, the two links anyone scrolls this far for, and the
legal line. Nothing else. Section 10 is the ask, and a footer with a sitemap
in it takes the ask away from the panel directly above it — so the footer's
job is to be the place the privacy link lives and then stop.

| | |
| --- | --- |
| the brand | back to the top on the landing page, back to the landing page from anywhere else |
| Privacy Policy | `privacy.html`, and the reason the footer exists |
| the address | `hello@yoursmarthome.com`, the same one section 05 and section 10 use |

The address carries no `data-i18n` key. An address is not copy, for the same
reason section 08's brand names are not: there is nothing in it to translate.
**The year in `foot.note` is written out** — no script sets it, so January is
a two-line edit, one per language. It is one key rather than a fragment
stitched into a sentence so that the edit is obvious when it is due.

Over 560px it is one row, brand against links, with the legal line under both.
Under it everything centers in a column: the row is two objects rather than
two ends of a rule, and two objects that have stopped being far apart should
stop pretending to be.

### Keeping it on the fold

A landing page ten sections long never needed this, and a legal page with one
paragraph on it does: without a floor the footer lands halfway up the screen
with blank paper under it. So `body` in `base.css` is a column flexbox with a
`100svh` floor and `main` taking the slack — `svh` because the toolbar-visible
height is the one a footer should sit at on a phone.

It is in `base.css` rather than beside the footer's own rules because it is
the shape of every page rather than a property of the footer, and `100vh`
stays in front of it as the fallback.

## privacy.html

The frame of a legal page with `[tbd]` where the policy goes. Everything
around that placeholder is real: the header and its language switch, the back
link, the footer, the five stylesheets, and both languages of every string on
it.

The way back is written three times, which is deliberate — the header
brandmark, the footer brandmark, and a **back link above the heading**, the one
of the three that says out loud where it goes. It is `.btn--quiet`, the sheet's
tertiary action: leaving a legal page is navigation, not something the page
wants done. It is pulled left by its own `--btn-px` so the arrow, rather than
the pill around it, starts where the heading under it does.

The arrow is `#i-arrow-right` turned 180°. Section 02's flip toggle already
points home that way, and one arrow that can be turned is better than two
drawings that have to be kept in step — the sprite stays what the design
system sheet draws.

Two things are deliberately absent. **`[tbd]` has no dictionary key** — a
placeholder marker is not copy in any language, and giving it one would mean
translating it, which is a strange thing to have to notice later. And **only
`i18n.js` is loaded**: nothing on the page reveals, animates or calculates, so
the other five scripts would be five requests that find nothing. The sprite is
the same — its `icons:` list names the two symbols the page draws rather than
the landing page's twenty.

The page's own block in `sections.css` is ten rules: a measure, a heading, the
back link's offset and turn, and the marker set at `--text-subtle` so an
unwritten policy reads as one. Under
560px the heading steps down from `display-3` to `--text-2xl`, which is about
the Russian: *конфиденциальности* is one eighteen-character word and the
clamp has bottomed out by that width, so at display size it sits flush against
the measure.
