# `?mobile=1` and `?navbar=1` — the mobile layout, and the nav bar on its own

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
its own opt-in, and the layout flag implies it:

| URL | layout | nav bar |
|---|---|---|
| `index.html?mod=ptr` | — | — |
| `index.html?mod=ptr&navbar=1` | — | ✓ |
| `index.html?mod=ptr&mobile=1` | ✓ | ✓ (implied) |
| `index.html?mod=ptr&mobile=1&navbar=1` | ✓ | ✓ (the same page as the line above) |

`tmtLoader.mobile` and `tmtLoader.navbar` are both booleans on the contract, and `?mobile=1` is the only thing that
sets `navbar` without `?navbar=1` being typed.

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

- **A bottom nav bar** — Tree · Info · Help · Options — replacing the corner overlay, which touch handles badly
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

## Explicit only, at every width

There is no viewport or pointer sniffing, for **either** flag. A page without them renders exactly as before; a
page with one renders the same way at every width. That is a deliberate trade — a 900 px tablet is served the phone
layout — and it is what makes the modes gateable: the gate's verdict does not depend on the window it happened to
run in, and the navbar-only leg can therefore assert the bar at a *desktop* width without contradicting anything.

## Not in scope

The mobile layout keeps **the tree**. The obvious alternative, and what the paid Android port of PTR does, is to
drop the tree for a row-grouped list of layers; if that is ever built here it is a *selectable alternate view* of
the tree, not a replacement for it (⚖ user, 2026-09-17).

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
