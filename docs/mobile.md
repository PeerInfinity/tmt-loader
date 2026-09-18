# `?mobile=1` and `?navbar=1` — the mobile layout, and the nav bar (with the layer list) on its own

The loader hosts each game on the engine it shipped with, and **not one of those engines has a single `@media`
query** (measured over every game in `games/`). They all lay a tab out as two absolutely-positioned columns of
`49.5%` each. On a 390 px phone that is 193 px a side: at a mid-game save of Prestige Tree Rewritten, seven
interactive elements — the reset button, five milestone rows, a buyable — sat wholly or partly outside the
viewport, and `body { overflow: hidden }` meant they were clipped rather than scrollable, so there was no way to
reach them at all.

`?mobile=1` is an **opt-in layout** for that. Like `?automation=1` it is explicit and inert by default: without the
flag the loader fetches neither file, sets no class, and the page is what it was before the mode existed.

**Two flags, because the two halves are wanted separately.** The bottom nav bar is as useful on a desktop as on a
phone — it is where the Layers view and the automation panel go — while the single column is not. So the bar has
its own opt-in, and the layout flag implies it. The **layer list** below rides with the bar, for the same reason:

| URL | layout | nav bar |
|---|---|---|
| `index.html?mod=ptr` | — | — |
| `index.html?mod=ptr&navbar=1` | — | ✓ |
| `index.html?mod=ptr&mobile=1` | ✓ | ✓ (implied) |
| `index.html?mod=ptr&mobile=1&navbar=1` | ✓ | ✓ (the same page as the line above) |

`tmtLoader.mobile` and `tmtLoader.navbar` are both booleans on the contract, and `?mobile=1` is the only thing that
sets `navbar` without `?navbar=1` being typed. `?navbar=1` brings four files: `loader/navbar.css` + `loader/navbar.js`
(the bar) and `loader/layerlist.css` + `loader/layerlist.js` (the list the bar's first button opens).

## What it does

**The layout — `loader/mobile.css`** (`?mobile=1`; every rule scoped `html.tmt-mobile`)

- **One column.** `#app` drops to `column-count: 1`; `.col` stops being a 49.5 % absolute box and becomes a
  full-width one; the `.vl` divider goes.
- **Master-detail.** The engine gives an element the classes `col left` exactly while a layer tab is open, and
  `fullWidth` while it is not — so `.col.left { display: none }` *is* "the tree until you open a layer, then the
  layer gets the screen". The engine's own `.back` button (`showTab('none')`) is already the way back. No JS and
  no per-game knowledge are involved.
- **The tree's furniture joins the flow.** `.treeOverlay` floats the points readout, the corner buttons and the
  side-layer nodes over the tree at fixed offsets; at 390 px they land on top of the nodes. They become ordinary
  flow content above the tree, and the spacers the engines use to clear them (`#treeTab`'s leading `<br>`s, the
  hidden `#fakeHead` copy of the header) are dropped so the space is not counted twice.
- **Tap targets.** 44 px minimum on buttons, `.back`, and the classes the engines size below it (`.smallUpg`
  40×40, `.remove` 24×24).
- **Nothing wider than the screen.** The engines' own `row wrap` is correct once a column is full width; what
  broke was that the wrappers between the tab and the tiles had no definite width to wrap against. They are
  clamped instead of restacked, so three 90 px achievements or three 120 px upgrades still share a row.

**The nav bar — `loader/navbar.css` + `loader/navbar.js`** (`?navbar=1`, which `?mobile=1` implies; the script is a
classic script, inserted after `tmt-auto.js`, and it puts `tmt-navbar` on `<html>` once the bar is installed)

- **A bottom nav bar** — Layers · Tree · Info · Help · Options — replacing the corner overlay, which touch handles badly
  (the Discord fly-out is parked at `left: -244px` and opens on hover). The corner controls stay in the DOM, where
  the bar forwards clicks to them, but `navbar.css` takes them out of the layout.
- **The room it takes.** The bar is `position: fixed` over the bottom, and the engines scroll inside a box of
  `height: 100%`, so without the flag's layout the last ~57 px of a fully scrolled tab would sit under it with
  nothing left to scroll. `navbar.css` shortens `.col` / `.fullWidth` by the bar's measured height — *only* when
  the layout is off, because the layout handles it its own way (the page scrolls, and the column is padded).
  Measured on `ptr` at 1280×800: the lowest control's bottom goes from 796 px, under a bar whose top is at 743, to
  739 px — with the column's width unchanged at 634 px, which is the thing the gate compares.
- **`--tmt-navbar-h`** is written by `navbar.js` on every refresh and read by both — the layout pads the bottom of
  a column with it, the bar's own rule above shortens one with it. `min-height: 0` goes with it everywhere: the
  engines declare `min-height: 100%` beside every `height: 100%`, and measured on `ptr` the min-height wins alone.

**Tooltips on tap** — both engine shapes, 2.2.1's `[tooltip]` with `:hover:before/:after` and 2.6/2.7's
`.tooltipBox > .tooltip`, opened by one class of ours — are part of the **layout**, not the bar: a pointer that
hovers already opens them, and pinning one open on every click is not what a desktop reader asked for. So is the
automation tab's grid flatten, which fixes a ragged wrap that only happens in the narrow single column (3+1 at
412–536 px; four per row at 540 px and up is what the registry asked for). `navbar.js` implements both and guards
them on `tmtLoader.mobile`, because
it is the one script the page loads in either mode; their CSS lives in `mobile.css`, compounded with `tmt-mobile`
so a navbar-only page could not match them even if that guard were lost.

The bar is pure UI: it never writes `player`, registers no timer and no animation frame (it refreshes off a
`MutationObserver` on the game's own re-renders), and calls nothing in the game loop. Either file stands alone
without the other.

### The file names

`loader/mobile.js` became **`loader/navbar.js`** in this slice, and its half of `mobile.css` became
**`loader/navbar.css`**, because a file called `mobile` that runs on a 1280 px desktop is a misnomer that the next
reader pays for. The DOM vocabulary moved with it: `#tmt-navbar`, `html.tmt-navbar`, `.tmt-navbar-btn` /
`-glyph` / `-label`, `--tmt-navbar-h`, and `tmtLoader.navbarUI` (was `mobileUI`). What kept its `mobile` name is
exactly what stayed with the layout: `mobile.css`, `html.tmt-mobile`, `tmt-mobile-tip`, `tmt-mobile-au`.

The deciding argument was not tidiness. The bar's class used to be `tmt-mobile-nav`, so a navbar-only page would
have carried a class matching `/tmt-mobile/` — which is the inertness leg's own regex — and every later reader
would have had to know that this one `tmt-mobile*` class is not the layout.

### It knows no tab ids

The system tab ids differ between engines — 2.2.1 uses `info` / `options` / `help`, 2.7 uses `info-tab` /
`options-tab`. So the nav bar does not name them. Each button **forwards a click to the game's own corner control**
(`#info`, `#optionWheel`, `#help`), whose `onclick` already carries the right id for that engine. The same
indirection gives the active state for free: those controls carry `v-if="player.tab != '<their tab>'"`, so a
control that has been seen and is now absent means its tab is the open one. A button whose control has never
appeared stays hidden — which is why Help shows on the two games that define `help_data` and nowhere else.

## The layer list

The **Layers** button is the first button in the bar, immediately left of Tree, and it opens a scrollable list of
the game's layers grouped by tree row — the shape the paid Android port of Prestige Tree Rewritten uses. It is a
**selectable alternate view of the tree, never a replacement for it** (⚖ user, 2026-09-17): Tree is still one tap
away, and closing the list puts you back exactly where you were.

**The card acts, it does not only navigate** (⚖ user, 2026-09-18). Each card carries the layer's symbol on its own
colour as a badge, the resource name and the current amount, a **working** reset button showing the game's own
prestige text, and **chips** for the layer's notable features. Tapping the badge or the name opens that layer's
tab; pressing the reset button really resets; pressing a chip really buys.

`loader/layerlist.js` + `loader/layerlist.css`, appended to `<body>` like the bar. It reads `tmp` / `player` /
`LAYERS` and calls the engine's own `showTab`, `doReset`, `buyUpgrade`, `buyBuyable` and `startChallenge`. It
**writes nothing to `player`** itself and adds no clickable id, so it cannot move an automation anchor — measured
both ways, not assumed: the M1 layers leg hashes the page before and after the list is opened, and `gates-s1.mjs
--part 1` is still 52/52.

### The data, all generic

| card element | source |
|---|---|
| row grouping | `tmp[l].row` — can be `'side'` / `'otherside'`, not only a number |
| order within a row | `layers[l].position`, then the layer id — the sort `updateLayers()` itself uses |
| badge | `tmp[l].symbol` (as HTML, which is how the engines render it), `tmp[l].color` |
| name / amount | `tmp[l].resource` (else `tmp[l].name`, else the id) and `formatWhole(player[l].points)` |
| reset button | `tmp[l].prestigeButtonText` where the engine keeps one, else the global `prestigeButtonText(l)` |
| does it reset | `tmp[l].canReset` |
| has a reset button at all | `tmp[l].type !== 'none'` — the engines' own `v-if` on the prestige button |
| shown at all | `tmp[l].layerShown`, truthy and not `'ghost'` |
| greyed | `player[l].unlocked` is false |

⚠ **Never call the global `canReset(layer)`.** It ends in `else return layers[layer].canReset()`, so a layer whose
`type` matches none of normal / static / none reaches a method it does not have — that is what killed The Stardust
Tree's automation boot. `tmp[l].canReset` is the same value, computed by the engine's own `updateTemp`. Everything
here that evaluates game code is wrapped: a throw costs one card, never the list.

### Three things the brief left open, and what was decided

- **Which layers are on the list.** `tmp[l].layerShown`, truthy and not `'ghost'` — the tree's own rule, since the
  list is a view of the tree. `player[l].unlocked` is *not* part of it, although it is the obvious second half:
  every engine gives its SYSTEM pseudo-layers (`info-tab`, `options-tab`, `tree-tab`) a `player` entry with
  `unlocked: true`, so including unlocked layers would put three cards in the list that the tree does not draw.
  It decides the **greyed** state instead. A layer that is shown but not unlocked keeps its reset button, because
  on such a layer *that button is the unlock* (PTR's `p` reads `canReset` on a fresh save).
  A consequence worth knowing: TMT 2.7's system tabs DO declare a row and a `layerShown`, so on `something` the
  list carries `info-tab`, `options-tab`, `changelog-tab`, `achievements` and `savebank` cards — exactly the side
  and otherside nodes its tree draws. By the same rule the loader's own `au` layer gets a card under
  `?automation=1` (measured on ptr: cards `p`, `a`, `au`, no chips on it, no page error) — it is a side node on the
  tree, so the view of the tree shows it. The M1 combined leg does not yet assert that; it was measured by hand.
- **How many chips, and which win.** Six, then a `+N` button that expands the card. The order is by STATE — what
  you can act on, then what is done, then what is locked — with the source order (upgrades, buyables, challenges)
  and the numeric id breaking ties. Deliberately **not** by affordability or by cost: those move every tick, and
  chips that reorder under a finger are worse than chips in a stale order. Within one refresh the order never
  changes at all; only the states do.
- **What a chip does on tap.** It **acts**: `buyUpgrade` / `buyBuyable` / `startChallenge`, the engine's own
  function with the engine's own guards, which is the more useful and the more dangerous of the two choices the
  brief named. Three things make it defensible: a chip acts only in the `open` state (a `done` or `locked` chip
  opens the tab instead, which is the useful thing to do with it); the call is the same single click the game's
  own button makes, so the list adds no capability the game does not have; and an action the engine will not take
  today is a no-op here exactly as it is there. It adds no affordability rule of its own.

### The chips — the rule

**The first letter of each alphabetic word, numeric tokens kept WHOLE, about three tokens**, then a disambiguation
pass over whatever still collides **on the same card**, in two phases, in this order because one more TOKEN says
something about the component where a digit says only "not that one":

1. while a collision can be answered by one more token, answer it that way — the first member of a group keeps the
   short chip, so `I Need More!` stays `INM` and its sequels grow;
2. whatever still collides takes **the smallest digit that is free against every chip already assigned**.

So a card never shows the same chip twice — which the gate asserts.

⚠ **Phase 2 must check the whole set, never increment a counter.** A base can itself end in a digit, so `"N"` + 28
and `"N2"` + 8 are the same string. MEASURED on `falling-mountain-s-alterprestige`, whose `Nanoprestige` layer has
58 components and a crowd of one-token "Nano…" titles: a blind counter put `Nanoagain` and `Nanofinale 2` both on
`N28`, and no number of further passes separated them, because each pass recomputed the same string.

Sources, in order: each layer's **`upgrades` and `buyables` by `title`**, and its **`challenges` by `name`**.

- `title` is a SHORT NAME and is the field wanted. `display()` is prose and is not — PTR's `ab` clickables all
  render the bare text `"1"`, which is why clickables are not a source at all.
- **Milestones stay out**: their text is a requirement string (`requirementDescription`, "2 Time Capsules"), they
  are passive, and they inflate the chip count.
- A component with no usable `title` gets **no chip** rather than a meaningless one, and a title's HTML is stripped
  before it is tokenised (a tag name is not a word).

PTR's Points layer comes out `B` ← Begin, `PB` ← Prestige Boost, `SS` ← Self-Synergy, `PI` ← Prestigious
Intensity — no collisions, and `PB` is the same chip the Android app shows on that card. The Generators layer is
where the disambiguation earns its place: `I Need More!` / `I Need More II` / `I Need More III` / `I Need More IV`
all start at `INM`, and `Boost the Boost` / `Boost the Boost Again` / `Boost the Boost Again^2` all start at `BTB`.

⚠ **The numeric half of the rule cannot be measured on PTR.** The brief carried a measurement — 14/39 chips in a
collision under "first letter of every word" against 7/39 with numbers kept whole, at `snapshots/ptr/all/M16.json`
— and **it does not reproduce**, on any population this slice could construct (all components of the shown layers:
120 chips, 20 in a collision; the unlocked ones: 64 and 12; per card or across the game; truncated at 2, 3, 4
tokens or not at all). The reason is structural, not a counting difference: **numbers kept whole and first-letters
differ only for a MULTI-DIGIT token**, and PTR has none inside the first three tokens of any component title
(`Row 2 Synergy`, `Gen Z^2`, `Four Square` are all single digits, where `2` and `2` are the same chip either way).
The brief's own example of the difference — "10 Generators" and "15 Generators" both beginning with `1` — is not a
PTR title. The rule is implemented as stated, because it is right for the games that DO carry such a title; what
should not be repeated is the 7/39 as a PTR measurement.

### Reading a card can make the ENGINE write `player`

The list assigns nothing to `player`. That is not the same as the state not moving, and two measured cases say why:

- **`format()` raises `player.hasNaN`.** Every TMT engine's number formatter opens with
  `if (isNaN(decimal.sign) || isNaN(decimal.layer) || isNaN(decimal.mag)) { player.hasNaN = true; return "NaN" }`,
  and a game's own prestige text can format a NaN — MEASURED on `the-quantum-tree`, whose `Qc` layer says
  "Next at NaN Qt" at a fresh save. The engine would raise the flag itself the moment that tab renders; the list
  renders every layer's button at once, so it raised it EARLY, put it in the save and moved the state hash. The
  list therefore **puts the flag back if it was the one that raised it**, and never lowers a flag the game had
  already raised — that one is the player's game and not ours to hide.
- **`updateTemp()` is not read-only.** MEASURED on `the-periodic-table-tree`: one call moves `player.He.Inflate`
  3 → 4 and `player.He.BalDiv` 2 → 3, which is also why that game never repeats its own hash. An early version
  called it when the list opened, so the readouts would be fresh on a paused page; it does not any more. A UI does
  not drive the engine's tick. In play the loop recomputes `tmp` 20×/s, so a card is at most one tick stale, and
  under `?managed=1` it holds still, which is what a paused page is for.

Both are asserted, per game, by the layers leg's inertness check — and both were found by it.

### Two engine facts the list had to be taught

- **A game's universal CSS rule reaches into the overlay.** PTR's `style.css` opens with
  `* { margin: auto; text-align: center; transition-duration: 0.5s }`, and a universal selector is not scoped to
  the game's own markup. `margin: auto` on a flex item in a column flex box shrink-wraps it: MEASURED, the list
  body came out 447 px inside a 1280 px panel and the card grid collapsed to one column on a desktop.
  `layerlist.css` therefore states its own `margin` / `text-align` / `box-sizing` for `#tmt-layerlist *` (1-0-0
  against the universal selector's 0-0-0) and re-centres only what should be centred.
- **`canReset` does not mean a reset yields anything.** TMT 2.2.1's is `baseAmount >= requires AND getResetGain()
  > 0`; TMT 2.7's drops the second half. So a layer can be resettable for +0 — MEASURED on `the-chronicle-tree`,
  whose `g` reads `canReset` at a fresh save and whose button says "重置得到 +0 投入时间". The gate's reset press
  therefore picks a layer with a `resetGain` above 0, not merely one that `canReset`.

And one about the gate rather than the engines: **a click is not a neutral probe.** Some games count every click on
the document — MEASURED on `the-dressy-tree`, whose `player.clicks` goes 0 → 1 when anything on the page is pressed,
the nav bar's own buttons included. The inertness check therefore opens the list through `tmtLoader.layerListUI`
rather than through the button, and exercises the button immediately afterwards for everything else.

And one of our own, found by the gate's own press: **an id is a number, not the object key's string.** The engines
push whatever `buyUpgrade` is handed straight into `player[l].upgrades`, and `hasUpgrade` tests it with
`.includes(11)` — so a `"11"` in the save is an upgrade that is bought, paid for and does nothing. The first
version of the chips wrote `["11"]` where the game's own button writes `[11]`.

## Explicit only, at every width

There is no viewport or pointer sniffing, for **either** flag. A page without them renders exactly as before; a
page with one renders the same way at every width. That is a deliberate trade — a 900 px tablet is served the phone
layout — and it is what makes the modes gateable: the gate's verdict does not depend on the window it happened to
run in, and the navbar-only leg can therefore assert the bar at a *desktop* width without contradicting anything.

## Not in scope

The mobile layout keeps **the tree**, and so does the layer list above: it is a second way to look at the same
layers, reached from a button and closed again, not a replacement for the tree (⚖ user, 2026-09-17).

## The gate

```
node tools/harness/page.mjs --gate mobile              # every game
node tools/harness/page.mjs ptr something --gate mobile
```

Gate **M1**, per game, in a context emulating a 390×844 phone **with touch** — plus one leg in a second
context at a desktop size, for the flag that is not about phones:

| leg | what it asserts |
|---|---|
| inertness | without either flag: no `tmt-mobile` and no `tmt-navbar` class, neither stylesheet, no nav, `tmtLoader.mobile === false` **and** `tmtLoader.navbar === false`, no `mobileUI`, no `navbarUI`, nothing matching `mobile` or `navbar` in `tmtLoader.loaded` |
| state | 200 ticks at `diff 0.05` from a fresh save, with the flag and without: the same `tmtLoader.hash()` and the same tick count. The mode is a layout, so it may not move the game by one bit — measured, not asserted. For the two games with recorded anchors the hash it lands on *is* the census idle hash (`d9c5ace6665833d0` ptr, `46bb8c5b1a96f03a` something). Run **twice plain plus once mobile**: see the control below |
| geometry | no interactive element's box leaves the viewport sideways; none is under 44 px; `documentElement.scrollWidth` does not exceed the viewport |
| nav bar | the bar exists with at least the Tree button, has a measured height, and both stylesheets are linked |
| layers | the LAYER LIST, at both widths — see below |
| combined | `?mobile=1&automation=1`: the `au` side node and its tab survive the layout, and the registry's clickable rows are flattened |
| navbar-only | **at 1280×800 with no touch** — see below |
| load | the mobile page is judged against the **same** `manifest.load.known` allowances as G1 — the mode may not introduce a failed request, a blocked host or a page error |

The legs run in that order for a reason: the geometry leg's `loadFrom` writes the deep snapshot into the context's
`localStorage`, so a fresh-save leg after it would boot on that save instead of a new game.

The geometry leg runs over the **fresh tree and then every tab the deepest recorded snapshot can open**
(`tools/harness/snapshots/<id>/`, deepest by ticks). This matters: a fresh save of most games shows one tree node
and no open tab, so a gate that only looked at a fresh page could not see the split column, the milestone rows or
the achievement grid — the whole thing the mode exists to fix. Games with no snapshot are measured at the tree
only, and the two that have one (`ptr`, `something`, one per engine family) carry the tab coverage.

### The navbar-only leg

`?navbar=1` alone, in a second context at **1280×800 with no touch**, beside the **plain desktop page** — the same
views, run twice, so every claim is a comparison rather than a number this gate believes about the engines:

- the bar is there (`#tmt-navbar`, the Tree button, a measured `--tmt-navbar-h`, `navbar.css` linked, `tmt-navbar`
  on `<html>`), and `tmtLoader.mobile === false` with `tmtLoader.navbar === true`;
- the **layout is not**: no `tmt-mobile` class, no `mobile.css` — and, measured against the plain page's own view,
  the same `#treeOverlay` position, the same `#app` `column-count` and the same `.col` widths, each of which the
  layout would change. On top of that the brief's own reading: a `.col` is *about half* the viewport (between 35 %
  and 65 % of it), not the whole of it;
- nothing escapes sideways that the plain page does not escape by, and `documentElement.scrollWidth` does not
  exceed the plain page's;
- and the plain desktop page is **inert** — which is the inertness leg over again at a second viewport, free.

Where a snapshot exists the leg opens one layer tab as a second view, because `.col` exists only while a tab is
open: on a fresh tree there is nothing half-width to measure, and the width is the assertion that catches a layout
rule leaking into the bar's scope.

Three mutants were run against it at `ptr` (each red, each restored): `mobile.css` linked under `?navbar=1`
(caught by the stylesheet check alone — the rules are scoped, so nothing moved), `tmt-mobile` **and** the sheet
under `?navbar=1` (caught by geometry: `.col` 634 → 1280, `#treeOverlay` `absolute` → `relative`/`static`, and one
control escaping where the control page had none), and `navbar.js` guarded on `mobile` again (no bar, `navH` 0).

### The layers leg

Run at **both** widths — on the phone page, over the deep snapshot the geometry leg has already walked, and on the
`?navbar=1` desktop page from the navbar-only leg. It asserts, at each:

- the **Layers button exists and is immediately left of Tree** — in the bar's DOM order and by measured `left`;
- **one card per shown layer**, as a SET against the engine's own answer (`tmp[l].layerShown`, truthy and not
  `'ghost'`, for a layer with a row), computed in the probe and not asked of the list — a list that agreed with
  itself would assert nothing;
- **grouped by row**: every card sits in the section its layer's `tmp[l].row` names;
- **distinct chips on each card** — the disambiguation pass is what makes a three-letter chip mean one thing;
- **nothing escapes the viewport**, on each width's own terms: the phone demands zero escaping controls, zero under
  44 px and no document wider than the screen; the desktop is judged against the **plain desktop page in the same
  state** (its last view), because at 1280 px the plain page is the layout the game's author shipped. MEASURED: the
  engines' own `.back` button is 38×50 there, on the plain page too — demanding `tooSmall === 0` at that width
  would fail every game for something the mobile LAYOUT is what fixes, and the 44 px minimum is a promise about
  TOUCH;
- and the **tap minimum does not inflate a control the game sized itself** — a layer's `nodeStyle()` lands in the
  style attribute, and The Galactic Tree hides a deliberate 1×1 node that way. That exemption is the geometry
  probe's and predates this leg; the list's own controls carry no game-sized inline style, so it never applies to
  them.

And **the list writes nothing**: the state hash across OPENING it — which reads every layer and renders every
card — is the one it had before, measured per game. The state leg above proves the FILE is inert; this proves the
PANEL is, which is the claim that lets the list sit beside the automation anchors. It takes its own CONTROL first
(two hashes back to back) and **abstains** where the page will not repeat its own hash, rather than blaming the
list; and it opens the list programmatically, because a click is not neutral (see "Two engine facts" below).

Then **the press**: the reset button on a card really moves `player[l].points`. Judged by the value moving, which
is the one claim a rendering test cannot fake. Most games cannot reset anything at the state a snapshot (or a fresh
save) leaves them in, so the leg ticks up to 2000 × 0.05 looking for a layer that both `canReset` and has a
`resetGain` above 0, and **abstains** — naming the game in the summary — rather than passing vacuously. It runs
LAST of everything on that page, because it is the one leg that moves the game.

One gap, named rather than left implicit: the leg never presses a card's **`+N`** button, so the EXPANDED chip row
is not measured. The overflow chips carry the same class and the same 44 px minimum as the six that are measured,
and they wrap in a flex row rather than overflowing it, so the risk is low — but it is not asserted.

**Seven mutants** were run against this leg (each RED, each restored, with the control GREEN before and after), on
the game that can see each one: the Layers button moved to the right of Tree (`buttonLeftOfTree` false, `ptr`); the
card set taken from `player[l].unlocked` as well as `layerShown` (13 cards against the engine's 11 — `info-tab` and
`options-tab`, `ptr`); the chips' digit phase removed, leaving the token extension alone (duplicate chips,
`the-mechanic-tree` **and** `falling-mountain-s-alterprestige`); the reset button wired to nothing (`resetVerdict`
NOT MOVED, `ptr`); the chips dropped to a 30 px minimum (`tooSmall` on the phone side, `ptr`); the engine's NaN flag
left raised (`layersInert` MOVED, `the-quantum-tree`); and `updateTemp()` driven from the list again (`layersInert`
MOVED, `the-periodic-table-tree`).

⚠ **Four of the seven are GREEN on `ptr`** and need a specific game to see at all. A battery run only on the
reference game would have called this leg proven while it was blind to every defect it in fact found.

One property the leg does NOT discriminate, said out loud: **phase 1 of the chip rule**. Removing the token
extension leaves phase 2 to number the collisions (`INM`, `INM2`, `INM3` instead of `INM`, `INMI`, `INMII`), which
is uglier but still unique — so the gate stays green. Phase 1 is a quality property, not a correctness one.

### The state leg needs a control

A hash that differs between the plain and the mobile page only means the mode moved the game **if the game reaches
the same hash twice on its own**. Some do not: `the-periodic-table-tree` produced three different hashes over three
plain runs from a fresh save. Its plain-vs-mobile difference was the first sweep's only red, and it said nothing
about the mode. Nothing in the manifests declares determinism, so the gate measures it per run — two plain legs,
then the mobile one — and where the control differs the state leg **abstains** rather than passing: the row can
still be green on the other legs, and the summary names every game that abstained.

### Two more things the gate taught us

- **Emulate touch, not just a narrow window.** Without `hasTouch`/`isMobile` the page reports `hover: hover`, the
  engines' `:hover` transforms apply, and Playwright parks the mouse at (0, 0) — exactly where `.back` sits. It
  measured 47 px wide at x = −2 (its 44 px box under `scale(1.1)`) and was reported as escaping the viewport: a
  hover state no phone can produce. `PHONE_CONTEXT` in `page.mjs` is the fix.
- **`scrollWidth` is not the overflow check.** The engines set `body { overflow: hidden }`, so an element past the
  right edge is *clipped*, not scrollable: the document's `scrollWidth` stays exactly the viewport width while
  controls sit outside it, unreachable. Measured on the mutant run (the layout rules removed): 11 of 18 views red
  on escaping controls and tap size, `docScrollWidth` 390 throughout. The escaping-element check is what carries
  this gate; the `scrollWidth` assertion is a cheap second opinion.
