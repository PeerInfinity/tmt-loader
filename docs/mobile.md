# `?mobile=1` — the mobile layout

The loader hosts each game on the engine it shipped with, and **not one of those engines has a single `@media`
query** (measured over every game in `games/`). They all lay a tab out as two absolutely-positioned columns of
`49.5%` each. On a 390 px phone that is 193 px a side: at a mid-game save of Prestige Tree Rewritten, seven
interactive elements — the reset button, five milestone rows, a buyable — sat wholly or partly outside the
viewport, and `body { overflow: hidden }` meant they were clipped rather than scrollable, so there was no way to
reach them at all.

`?mobile=1` is an **opt-in layout** for that. Like `?automation=1` it is explicit and inert by default: without the
flag the loader fetches neither file, sets no class, and the page is what it was before the mode existed.

```
index.html?mod=ptr&mobile=1
```

## What it does

**Tier 1 — `loader/mobile.css`** (always on with the flag)

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

**Tier 2 — `loader/mobile.js`** (a classic script, inserted after `tmt-auto.js`)

- **A bottom nav bar** — Tree · Info · Help · Options — replacing the corner overlay, which touch handles badly
  (the Discord fly-out is parked at `left: -244px` and opens on hover).
- **Tooltips on tap.** Both engine shapes — 2.2.1's `[tooltip]` with `:hover:before/:after`, and 2.6/2.7's
  `.tooltipBox > .tooltip` — are opened by one class of ours. Tree-node tooltips are where "Reach N to unlock"
  lives, so on a phone they are not decoration.

Tier 2 is pure UI: it never writes `player`, registers no timer and no animation frame (it refreshes off a
`MutationObserver` on the game's own re-renders), and calls nothing in the game loop. Tier 1 stands alone if
`mobile.js` is removed.

### It knows no tab ids

The system tab ids differ between engines — 2.2.1 uses `info` / `options` / `help`, 2.7 uses `info-tab` /
`options-tab`. So the nav bar does not name them. Each button **forwards a click to the game's own corner control**
(`#info`, `#optionWheel`, `#help`), whose `onclick` already carries the right id for that engine. The same
indirection gives the active state for free: those controls carry `v-if="player.tab != '<their tab>'"`, so a
control that has been seen and is now absent means its tab is the open one. A button whose control has never
appeared stays hidden — which is why Help shows on the two games that define `help_data` and nowhere else.

## Explicit only, at every width

There is no viewport or pointer sniffing. A page without the flag renders exactly as before; a page with it
renders the same way at every width. That is a deliberate trade — a 900 px tablet is served the phone layout — and
it is what makes the mode gateable: the gate's verdict does not depend on the window it happened to run in.

## Not in scope

The mobile layout keeps **the tree**. The obvious alternative, and what the paid Android port of PTR does, is to
drop the tree for a row-grouped list of layers; if that is ever built here it is a *selectable alternate view* of
the tree, not a replacement for it (⚖ user, 2026-09-17).

## The gate

```
node tools/harness/page.mjs --gate mobile              # every game
node tools/harness/page.mjs ptr something --gate mobile
```

Gate **M1**, per game, in a context emulating a 390×844 phone **with touch**:

| leg | what it asserts |
|---|---|
| inertness | without `?mobile=1`: no `tmt-mobile` class, no stylesheet, no nav, `tmtLoader.mobile === false`, no `mobileUI`, nothing matching `mobile` in `tmtLoader.loaded` |
| state | 200 ticks at `diff 0.05` from a fresh save, with the flag and without: the same `tmtLoader.hash()` and the same tick count. The mode is a layout, so it may not move the game by one bit — measured, not asserted. For the two games with recorded anchors the hash it lands on *is* the census idle hash (`d9c5ace6665833d0` ptr, `46bb8c5b1a96f03a` something). Run **twice plain plus once mobile**: see the control below |
| geometry | no interactive element's box leaves the viewport sideways; none is under 44 px; `documentElement.scrollWidth` does not exceed the viewport |
| tier 2 | the nav bar exists with at least the Tree button, has a measured height, and `mobile.css` is linked |
| load | the mobile page is judged against the **same** `manifest.load.known` allowances as G1 — the mode may not introduce a failed request, a blocked host or a page error |

The legs run in that order for a reason: the geometry leg's `loadFrom` writes the deep snapshot into the context's
`localStorage`, so a fresh-save leg after it would boot on that save instead of a new game.

The geometry leg runs over the **fresh tree and then every tab the deepest recorded snapshot can open**
(`tools/harness/snapshots/<id>/`, deepest by ticks). This matters: a fresh save of most games shows one tree node
and no open tab, so a gate that only looked at a fresh page could not see the split column, the milestone rows or
the achievement grid — the whole thing the mode exists to fix. Games with no snapshot are measured at the tree
only, and the two that have one (`ptr`, `something`, one per engine family) carry the tab coverage.

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
