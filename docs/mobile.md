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
- **Master-detail.** The engine gives an element the classes `col left` while `player.tab` is **not the name that
  engine gives its tree tab**, and `fullWidth` while it is — so `.col.left { display: none }` *is* "the tree until
  you open a layer, then the layer gets the screen". The engine's own `.back` button is already the way back. No
  JS and no per-game knowledge are involved. ⚠ *"exactly while a layer tab is open"* is what this bullet used to
  say, and the difference is not pedantry: it is the premise that blanked five games (U10, below).
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

⚠ **Tree is the one button with no corner control to forward to**, so it calls `showTab` itself — and since U10
it asks the ENGINE which tab that is rather than assuming `'none'` (`navbarUI.treeTab()`; see "Pressing **Tree**
really shows the tree"). Still no tab id and no game id in this file: the name is derived, once, per game.

### The tree canvas follows the page (U9)

⚖ user, 2026-09-20: *"The tree branches display incorrectly when scrolling down in mobile view. Is there anything
we can do about that?"*

⛔ **It is a COORDINATE-SPACE MISMATCH, and it is OURS.** `.canvas { top: 0; left: 0; position: absolute;
z-index: -999 }` is the rule in **all 171 games** (measured at `3346da419` over every `.css` under `games/`), so
the tree canvas is pinned to the top of the **document**; `drawTreeBranch` takes both endpoints from
`getBoundingClientRect()`, which is relative to the **viewport**. On the game's own page the two spaces coincide,
because the engine sets `body { overflow: hidden }` and scrolls INSIDE the columns — nothing ever scrolls the
document. §1 of `loader/mobile.css` moves the scroller to the page, which is what pulls them apart: scroll by S and
the canvas travels up with the document while the coordinates recompute against the viewport, so every branch is
drawn S px away from the nodes it joins. Without `?mobile=1` none of this happens, so ⚖ **LOADER FIRST** is
satisfied by fixing it in our layer — `html.tmt-mobile canvas.canvas { position: fixed; }`, one rule, no engine
patch.

⚠ **Two hypotheses were wrong before the measurement, and both are recorded so they are not tried again.**

⛔ **`+ document.body.scrollTop` is a RED HERRING.** Every engine adds a scroll offset to the viewport rect —
`+ document.body.scrollTop` ×162, `+ (document.getElementById("treeTab").scrollTop || document.body.scrollTop)` ×6,
`+ tab.scrollTop` where `tab = document.body` ×3 (censused at `3346da419`; `the-shenanigans-tree-rewritten`
carries both shapes). **It is always 0.** The scroller under our layout is `document.documentElement`, not
`document.body`. There is no double count to fix, and "fixing" that term would change nothing.

⚠ **And the 6 games whose offset reads `#treeTab.scrollTop` are unaffected**, because under our layout nothing
inside `#app` scrolls at all — `mobile.css` §1 gives the columns `overflow: visible`. The gate measures that per
game rather than assuming it (`innerScrollers` in its own row; 0 across the roster).

**The measurement, and it is the one a gate at scroll 0 cannot make.** For every node the tree joins and that is
on screen, the distance from the node's centre to the nearest pixel the canvas **actually painted** (read out of
`getImageData`, never recomputed from `drawTreeBranch` — a probe that recomputed the endpoints would agree with the
engine by construction). `ptr` at `tools/harness/snapshots/ptr/all/M22.json` **at 29,204 ticks** (⚠ `deepestSnapshot()` selects by TICKS
and that fixture MOVES — the table below is measured against that tick count, and a re-measurement is owed
whenever it changes), 390×844, document 1241 px tall:

| | at the top of the page | scrolled to the bottom (S = 397) |
|---|---|---|
| `position: absolute` (before) | 7 nodes at **1.4 px** | 2 at 1.4, 4 at 147–243, 2 at **397 px** ⛔ |
| `position: fixed` (after) | 7 nodes at **1.4 px** | 8 nodes at **1.0 px** ✅ |

⚠ **The at-top reading is GREEN either way — that is the point.** The two spaces agree at scroll 0, which is
exactly why the tree looks right until you scroll, and why the U9 mutant must redden the SCROLLED half and leave
the other alone.

✅ **It also fixes a second defect the displacement was hiding.** `resizeCanvas()` sizes the bitmap to
`innerHeight` (844) while the mobile document is 1241 tall, so at the bottom **2 of the 8 judged nodes sat outside
the canvas altogether** and their branches were clipped rather than merely displaced. A viewport-sized canvas that
covers the viewport has nothing outside it to draw: `offCanvas` goes 2 → 0.

⚠ **`z-index: -999` is KEPT, and that a NEGATIVE-z FIXED canvas is still painted was measured, not assumed** — a
branch layer that is correct and invisible would be worse than one that is visible and wrong. The oracle is a
10×10 screenshot at a branch's midpoint with the canvas shown and hidden, plus a control patch the canvas paints
nothing on (byte-identical either way). It is visible.
⛔ **The oracle has to hide the canvas with `display: none`, NOT `visibility: hidden`.** Measured on ptr in both
modes: hiding it with `visibility` leaves the screenshot **byte-identical**, so a probe built on that property
reports "invisible" about a canvas that is plainly painted. That is a probe trap, not a finding about the fix.

#### Pressing **Tree** really shows the tree (U10)

⚖ user, 2026-09-20: *"I confirmed the mobile view tree problem for these games. The tree shows when the page
first loads, but clicking on the Tree button on the bottom bar shows a blank screen."*

⛔ **THE BAR'S OWN PREMISE WAS FALSE.** `loader/navbar.js` said, as a fact, that *"'none' is the tree in every
engine the loader hosts"*. Censused at `934dc41dc` by reading each game's own `showTab` in the page — every
engine states the mapping in one line, `var toTreeTab = name == <the tree's name>`, and **all 171 have it**:

| what the engine calls its tree tab | games |
|---|---|
| `none` | **166** |
| `tree` | **5** — `the-modding-tree`, `the-burning-tree`, `distance-incremental`, `the-stardust-tree`, `the-incrementreeverse` |

On those five, `showTab('none')` selects a name that is neither the tree nor any tab. The engine's own class
binding is `fullWidth: player.tab == 'tree'`, `col left` otherwise, so `#treeTab` took the "a tab is open"
classes while the engine rendered **nothing** in the column beside it — and `mobile.css` §2, which hides
`.col.left`, then hid the last thing on the screen. Under `?navbar=1` alone the same press leaves a half-width
tree with dead space beside it. Measured, phone context 390×844, a real click on the navbar's `☷Tree`:

| game | at load | after pressing Tree (before) | after (now) |
|---|---|---|---|
| `the-modding-tree` | `tab=tree` · `fullWidth` · 1/5 nodes visible | `tab=none` · **`col left`** · `display:none` · **0/5** | `tab=tree` · `fullWidth` · **1/5** |
| `the-burning-tree` | `tab=tree` · fullWidth · 1/3 | `tab=none` · col left · none · **0/3** | fullWidth · **1/3** |
| `distance-incremental` | `tab=tree` · fullWidth · 2/5 | `tab=none` · col left · none · **0/5** | fullWidth · **2/5** |
| `the-stardust-tree` | `tab=tree` · fullWidth · 3/6 | `tab=none` · col left · none · **0/6** | fullWidth · **3/6** |
| `the-incrementreeverse` | `tab=tree` · fullWidth · 1/6 | `tab=none` · col left · none · **0/6** | fullWidth · **1/6** |
| `ptr` (control) | `tab=none` · fullWidth · 1/8 | `tab=none` · fullWidth · **1/8** | unchanged |

**THE FIX IS THE CALL, NOT THE RULE.** ⚖ LOADER FIRST, and the loader's fault was that it named the tab itself:
the Tree button now asks the ENGINE which tab is the tree (`navbarUI.treeTab()`, derived once from `showTab`'s
own source, memoised, defaulting to `'none'` where the line cannot be read), and the bar's **active state** reads
the same derivation — on those five games the bar used to mark no button at all while the player was looking at
their tree. ⚖ MINIMIZE HARDCODING: no game id appears anywhere in the fix.

⛔ **THE RULE IN §2 WAS NOT CHANGED, AND THE OBVIOUS REWRITE IS MEASURABLY WORSE.** The brief for this slice asked
for §2 to be fixed; measurement says otherwise and the reasoning is recorded in `mobile.css` beside the rule.
What the class actually says is `player.tab != <this engine's tree>` — which is exactly what the master-detail
view wants, for every state a game's own UI can reach. The defensive rewrite "hide `.col.left` only while a
detail pane exists" (`#app:has(.col.right) .col.left`) reads well and is **false**: censused over all 171 with
one tab opened in each, `.col.right` is the open tab everywhere (171/171) and no game shows a tree node while a
tab is open (0/171) — **but `the-basic-tree` keeps a rendered `col right fast tab` box in the DOM on the tree as
well**, so that rule would blank *that* game exactly the way the bug blanked the other five. The comment was the
thing that was wrong, and it has been rewritten.

⚠ **U9'S ACCOUNT OF THIS IS CORRECTED HERE, and the correction is the lesson.** U9 recorded it as present *"at a
fresh save"* over "all 171 games at a fresh save with `player.tab === 'none'`". It is not: **all five default to
`player.tab === 'tree'`** and are green at a fresh load — which is precisely what the user saw and reported.
U9's reading was taken **after its own tree-canvas leg had called `showTab('none')`**, i.e. in the same forced
state the Tree button was creating. It is a **TRANSITION** defect, and a gate that loads a page and looks can
never see one. The roster says the same thing twice over: exactly 5 games load on `tree`, exactly those 5
blanked, and **5 MORE** (`the-energy-factory`, `the-periodic-table-tree`, `coffee-shop`, `the-leveling-tree`,
`the-history-tree`) load on a LAYER tab with no `#treeTab` at all, so for them the Tree press is the only way to
reach the tree. (2 games — `bobbit-s-tech-tree`, `layer-tree` — draw no visible tree node at a fresh save in
either reading, and the gate abstains on them by name.)


#### Nothing in any engine redraws the tree on a scroll

Censused over all **171** `canvas.js` files at `3346da419`: **0** listen on `scroll`; **3** listen on `wheel`,
which a touch device never fires. The only cadence is `setInterval(function(){ needCanvasUpdate = true }, 500)`
plus the game loop's `if (needCanvasUpdate) resizeCanvas()`. So even with the canvas in the right space, the
branches stand where the last redraw left them for up to half a second after a flick — which is very likely part of
what the report was about. `loader/navbar.js` therefore adds a **passive, rAF-coalesced `scroll` listener**, mobile
mode only, which calls the game's own redraw.

**Measured, 8 jittered rounds per leg** (a fixed wait between scrolls phase-locks to the engine's own 500 ms
cadence and would measure the phase rather than the lag), on an unmanaged page at each game's deepest snapshot.
The two legs differ in exactly one line — the listener's registration, stripped by a route interceptor:

| game | scroll → redraw, WITHOUT the listener | with it | redrawn by us |
|---|---|---|---|
| `ptr` | min 1.4 ms, median **107.3**, max **265.8** | min 0.8, median **32.0**, max **46.6** | 8 / 8 |
| `something` | min 76.0, median **213.5**, max **302.2** | min 1.3, median **6.6**, max **47.8** | 8 / 8 |

⚠ The "without" maxima are a sample of a 0–500 ms window, not its bound: the cadence's own bound is 500 ms and 8
rounds will not reach it. `byUs` is 0 in every "without" round and 1 in every "with" one, which is what says the
loader's listener — and not a lucky cadence tick — is what moved.

⚠ **`resizeCanvas()`, not the cheaper-looking `drawTree()`**, and all three reasons were measured:
the canvas carries the engine's `v-if`, so switching to a tab and back hands the tree a **brand-new element at the
HTML default of 300×150** (measured on ptr under `?managed=1`, where the cadence is stopped: `drawTree()` alone
painted the whole tree into that bitmap and 7 of 7 judged nodes fell outside it); how big the bitmap should be is
the GAME's answer, not ours (164 games size it to `innerWidth × innerHeight`, 6 to `#treeTab.scrollWidth/Height`,
1 to `document.body`'s); and `universal-reconstruction`'s `resizeCanvas` also calls `drawResearchBranches()`, so
`drawTree` alone would leave half of that game's tree behind.

## The layer list

The **Layers** button is the first button in the bar, immediately left of Tree, and it opens a scrollable list of
the game's layers grouped by tree row — the shape the paid Android port of Prestige Tree Rewritten uses. It is a
**selectable alternate view of the tree, never a replacement for it** (⚖ user, 2026-09-17): Tree is still one tap
away, and closing the list puts you back exactly where you were.

**The card acts, it does not only navigate** (⚖ user, 2026-09-18). Each card carries the layer's symbol on its own
colour as a badge, the resource name and the current amount, a **working** reset button showing the game's own
prestige text, and — since U2d — **two rows**: a counter per category the layer draws, and below it a button per
component you can act on. The expander in its head opens the card into U2b's full **chip** row. Tapping the badge
or the name opens that layer's tab; pressing the reset button really resets; pressing a chip or a button really
buys.

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
- **How many chips, and which win.** Six, then a `+N` button that expands the card.
  ⚠ **SUPERSEDED TWICE.** U2d retired the "six" half: the collapsed card is a counter row over a button row and
  shows no chips at all, the expander is a chevron in the card's head, and how many BUTTONS a row holds is
  measured at render rather than fixed ("The collapsed card", below).
  ⚠ The ORDER half of this answer was **superseded by U2b** ("The chips mirror the normal view", below): the
  chips are no longer ordered by state at all. What survives is the reason it was not affordability — those move
  every tick, and chips that reorder under a finger are worse than chips in a stale order — and U2b keeps it, by
  making state a chip's appearance rather than its position.
- **What a chip does on tap.** It **acts**: `buyUpgrade` / `buyBuyable` / `startChallenge`, the engine's own
  function with the engine's own guards, which is the more useful and the more dangerous of the two choices the
  brief named. Three things make it defensible: a chip acts only in the `open` state (a `done` chip opens the tab
  instead, which is the useful thing to do with it); the call is the same single click the game's own button
  makes, so the list adds no capability the game does not have; and an action the engine will not take today is a
  no-op here exactly as it is there. It adds no affordability rule of its own.
  ⚠ U2b added two cases: a **milestone** chip is passive and always opens the tab, and a **pseudo-unlocked**
  upgrade chip calls `unlockUpg` — which is what the engine's own second button on that upgrade calls — rather
  than `buyUpgrade`. There is no `locked` chip any more: a component the tab does not draw gets no chip at all.
  ⚠ **U2d found that the upgrade press had never worked on two games.** `buyUpgrade` is an ALIAS the TMT engines
  grew later: **169 of the 171 games define it, all 171 define `buyUpg`, and `the-modding-tree` (2.0.5.1) and
  `the-burning-tree` define ONLY `buyUpg`** — so on those two a chip press called a function that does not exist
  and bought nothing, silently, for two slices. It went unseen because the gate had never DRIVEN a chip: it pressed
  the reset button and nothing else. U2d's counter press is the first leg that buys, and it caught it on the first
  CI sweep after the push (`the-modding-tree`: `counter=NOT MOVED`, `0/1 → 0/1`). The list now calls whichever name
  the engine has.

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

Sources: each layer's **`upgrades` and `buyables` by `title`**, its **`challenges` by `name`**, and — since U2b —
its **`milestones` by `requirementDescription`**. They are no longer taken "in order": the order is the tab
layout's (next section).

- `title` is a SHORT NAME and is the field wanted. `display()` is prose and is not — PTR's `ab` clickables all
  render the bare text `"1"`, which is why clickables are not a source at all, and neither are achievements.
- **Milestones came in with U2b** (⚖ user, 2026-09-18), reversing U2's exclusion — see below for the reasons the
  user was given and overrode.
- A component with no usable name gets **no chip** rather than a meaningless one, and a name's HTML is stripped
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

### The chips mirror the normal view

⚖ **A chip should look, and sit, like the thing it stands for in the game's own tab** (user, 2026-09-18). Four
requests arrived separately — chips only for what the normal view shows, chips in the same order as the normal
view, dividers between the categories, and milestones given chips of their own — and they are one request: the
list must stop inventing an arrangement and read the layer's own tab layout instead. One walker answers all four.

⚠ **This replaced U2's state ordering** (`open → done → locked`). State is a chip's **appearance** now, never its
position: a chip that moves when you finish something is a chip that moves under your finger.

#### Where the order comes from

**Within a category: ascending numeric id.** The engines render `v-for row` then `v-for col` at `row*10+col`
(`games/ptr/js/components.js:147`, `games/something/js/components.js:162`), so the numeric id *is* the row and
column position and sorting by it reproduces reading order. Milestones are the exception and are simpler: both
engines render `v-for id in Object.keys(tmp[layer].milestones)`, so declaration order is the order.

**Between categories: the layer's `tabFormat`, and the engine's default when it declares none.** The default is
written out in `layer-tab` in `js/technical/systemComponents.js`, and both reference engines (2.2.1 and 2.7) write
the same family:

```
infoboxes → main-display → prestige-button → resource-display → MILESTONES → midsection
          → CLICKABLES → BUYABLES → UPGRADES → CHALLENGES → achievements
```

Note what that says: **milestones come FIRST and upgrades FOURTH** — nearly the reverse of the source order U2
used (every upgrade, then every buyable, then every challenge). A chip sequence that still looks like U2's is
evidence the source order is being read, not the tab layout.

#### `tabFormat` has two shapes, and both are common

- **Array form** — the component list, in display order. An item is a bare component name (`"upgrades"`), a pair
  (`["display-text", "…"]`) or a triple with a style (`["upgrades", [1, 3], {…}]`); the engines' own `column`
  renders **nothing** for anything else, which is why a game's own `(cond ? [...] : [])` costs nothing here.
  Nesting happens through `["column", [...]]` and `["row", [...]]`, not through a bare nested array.
- **Object form** — subtabs. Only `tmp[layer].tabFormat[player.subtabs[layer].mainTabs].content` is on screen;
  the components in the other subtabs are genuinely hidden, which is the whole of visibility rule 3 below.
  `microtabs` is the same thing one level down, and `embedLayer` hands the tab over to another layer entirely.

The walker also follows `["layer-proxy", [otherLayer, content]]`, which draws **another layer's** components on
this tab — so a chip carries its own layer rather than the card's, and acts on that one.

Measured over the roster at the gate's own states, counting the layers that get a card: **420 array-form, 271
object/subtab-form and 283 declaring no `tabFormat` at all**.

⚠ **A static declaration count is a different quantity, and the one previously recorded here was WRONG.** The
brief carried 1069 / 621 "in 170 of 171 games" and this section corroborated it. Re-measured 2026-09-19: the true
static counts are **1211 array-form and 641 object-form, in 171 of 171 games**. Both the original figure and the
"corroboration" swept `games/*/js/**`, and `sorbet-s-convolution-mainframe` keeps its engine under `Javascript/`
— so the same bound produced the same undercount twice, and agreement between two sessions who share a blind spot
is not corroboration. The "170 of 171" was never a real finding about one holdout game; it was the bound.

(Same root cause as the `buyUpg` miscount recorded below. Two numbers in this document came from a glob that
silently excluded one game; if you add a third census, do not bound it to `js/`. Since U2g you do not have to
remember: `node tools/census-figures.mjs` regenerates every figure in this section and fails when the prose and
the tree disagree, and CI runs it on every push.)

⚠ **That count is a census of the SUBTREE, and the subtree holds code the loader never loads** — `Old Code/`,
`demo.html`, a game's own `js/Demo/`. Counted over only the files the loader actually loads (each manifest's
`load.scripts` + `modFiles`, which is what `games/<id>/` contributes to a page), the same declarations are
**935 array-form and 455 object-form, in 170 of 171 games** — `distance-incremental`'s only `tabFormat`
declaration is in `Old Code/gametest.js` and in its `js/Demo/`, neither of which the loader loads. Both numbers
are true of what they count; a figure without its scope is not a figure, which is the third way the counts in this
section have gone wrong.

⚠ **Read `tabFormat` from `tmp`, never from `layers`.** A layer may declare `tabFormat()` as a function (PTR has
one); the engine's own `updateTemp` evaluates it into `tmp`, and that result is what the tab renders.

⚠ **A plural component can carry a restriction, and the two engines disagree about what it means.** TMT 2.7's
`upgrades` / `buyables` / `challenges` render `v-for row in (data === undefined ? tmp[l][kind].rows : data)` — a
row restriction — and its `milestones` takes a list of ids. TMT 2.2.1's `upgrades` and `challenges` take no `data`
prop at all, and its `buyables` reads `data` as a **px size** (`"100px"`). So the signal is that the data is an
**array**, which a size never is.

#### Visibility — three rules, not one

A chip exists when the engine's own render condition would draw the component:

1. **`tmp[l][kind][id].unlocked`** — confirmed in both engines
   (2.7 `v-if="… && tmp[layer].upgrades[data].unlocked"`, 2.2.1 the same through its `upgrades` grid).
2. **…or `pseudoUnl(l, id)`.** ⚠ `unlocked === false` does **not** mean hidden: PTR renders a *second* button for
   a pseudo-unlocked upgrade — `v-if="pseudoUnl(layer, data) && !(tmp[layer].upgrades[data].unlocked)"` — a
   visible teaser you press to unlock it. Four games define the global (`ptr`, `prestige-tree-ng`,
   `prestige-tree-rewritten-unsoftcapped4`, `the-extended-tree`); a fifth, `arctree`, declares `pseudoUnl` on
   components but has no such global and therefore no such button. The game's own function is called in a
   try/catch, and a throw means "not pseudo". Such a chip acts through **`unlockUpg`**, which is what that second
   button calls — not through `buyUpgrade`.
3. **Its category is reachable in the current tab layout** — it appears in the array form, or in the *active*
   subtab of the object form. This rule is not a test at all: it is the walker, which never emits what the layout
   does not reach.

Two conditions the brief did not name, both measured in the engines' own templates and both honoured:

- **The grid is bounded by `rows` / `cols`.** TMT 2.7 derives them to cover every numeric id (`setRowCol` in
  `js/technical/layerSupport.js`), so there the bound is vacuous — but **2.2.1 does not derive them**, so an id
  outside a declared grid is simply never drawn. Not a theoretical rule: the mutant that removes it is RED on
  `ptr`, where the `s` layer at the desktop state gains a chip for a buyable its own grid does not reach.
- **Milestones have more than `unlocked`.** The brief said they have none; both engines in fact test
  `tmp[l].milestones[id].unlocked` **and** `milestoneShown(layer, id)`, which reads the player's own `msDisplay`
  setting — so "never" hides every milestone and "incomplete" hides the finished ones, on the tab and therefore
  here too. And a finished **challenge** is hidden behind the player's "hide completed" option (2.2.1 puts the
  flag on `player`, 2.7 on `options`), which is a fourth render condition and also the player's.

A layer whose chips all vanish still gets a **card**: the card is the layer, and on a layer that is shown but not
yet unlocked its reset button *is* the unlock.

#### Milestones, and why they are back

⚖ Requests (4) reverses U2's deliberate exclusion. The user was given the reasons — a milestone's text is a
requirement string (`requirementDescription`, "2 Time Capsules"), milestones are passive, and they roughly double
the chip count — and chose to include them anyway. They are abbreviated by exactly the same rule as every other
chip, and one that yields no tokens gets no chip, which is the rule a titleless upgrade already had.

They are drawn with **square corners** where every other category is round — the one thing that tells a passive
milestone chip from an upgrade you can press, at a glance and without colour — and pressing one **opens the tab**,
because there is nothing for the engine to do.

⚠ A wart, left as it is and named rather than fixed: the rule is faithful to the game's own text, and some games
put an INDEX in that text. `something`'s `primitive` milestone 2 is written `"2: 100,000 Numbers"`, which
abbreviates to `2100000` — unique, correct by the rule, and unreadable. Changing it would change every other chip
on the roster too, so it is a decision for whoever revisits the abbreviation, not a side effect of this one.

#### Dividers

⚖ A **divider** sits at every category change and at neither end. It is emitted before the chip whose category it
introduces and takes that chip's visibility, which is what keeps it off both ends by construction: there is none
before the first chip, and the `+N` cut can never leave one trailing.

The gate measures the rendered sequence in **both** states — collapsed and expanded — reading each element's
computed `display` rather than the classes the list wrote. That also closes the gap U2 named: "the leg never
presses the `+N` button, so the expanded chip row is not measured". It toggles the card's own class rather than
clicking, because a click is not a neutral probe and the `+N` handler does nothing else.

#### The collapsed card: counters, then what you can act on (U2d)

⚖ **Two rows, not one flowing block** (user, 2026-09-18). U2's flat "the first six chips, then `+N`" is gone, and
so is the question it raised — the tab layout puts **milestones first**, so the first six could be nothing but the
passive category, and **8 of the roster's 47 multi-category cards hid a whole category behind the `+N`** (`ptr`'s
`t` and `s` their upgrades, `ptr`'s `q` its only buyable, `the-unbalanced-tree`'s `inf`/`e`/`r` and
`a-game-about-rocks`'s `s` their challenges, `the-melge-tree`'s `i` its milestones). Every category the tab draws
now has a counter, whether or not it has a chip, so the question is retired rather than answered. **The chips are
the expanded view**, unchanged from U2b.

**Row one — the counters.** One per category the layer draws, in the same tab-layout order the chips use, and only
for a category that is non-empty after the three visibility rules.

| category | reads | corners |
|---|---|---|
| milestones | `x/y`, earned over drawn | **square** |
| upgrades, challenges, achievements | `x/y`, earned over drawn | rounded |
| buyables, clickables | **the total owned** — one number | rounded |

⚖ The two shapes are the user's decision (2026-09-18), taken over an `x/y` of "how many you own at least one of":
a buyable holds an **amount** and is never "done", so that ratio would have a denominator meaning nothing. It
scans differently from its neighbours and that is the honest reading.

`y` is what the tab **draws**, not what the layer declares — so a player who sets `msDisplay` to `incomplete` sees
the milestones they have left rather than a total that counts what the tab is hiding. The card reads the same tab
the chips do. A component with no usable short name still **counts**, although it gets no chip and no button: a
counter needs no name to count something.

⚠ **Clickables and achievements are walked for their counters and never chipped.** That is not new policy — a
clickable's `display()` is prose and an achievement is not something you press — but it is why `visibleSeq` now
yields two more categories than `chipsOf` does.

**Which clickables get no counter, and why the obvious rule is wrong.** ⚠ **The two engines disagree about a
clickable's starting value**: TMT 2.2.1 gives every clickable `new Decimal(0)` (`getStartClickables`,
`games/ptr/js/utils.js:194`) and TMT 2.7 gives it `""` (`games/something/js/utils/save.js:102`). So "is the state
a number?" separates *holds an amount* from *holds nothing* on 2.7 and **not** on 2.2.1, where every clickable
would earn a box reading `0` — exactly the meaningless zero the user ruled out. The rule that works on both is the
**value**: a clickable counts only while it holds a number above zero, so a category that will never hold one
never gets a box. A **buyable** keeps its box at zero, because a buyable always has an amount (both engines define
`getBuyableAmount`). The asymmetry is the engines', not ours. Measured: **no clickable on the roster holds a
positive amount at any recorded state**, so the gate constructs the condition instead (see the layers leg).

**Row two — what you can act on.** ⚖ **Unlocked and not yet bought, in tab-layout order** (user, 2026-09-18), and
**not** "affordable right now": affordability decides only whether a button is **lit or greyed**, never whether it
is present and never where it sits. It is the same principle U2 applied to the chips — a control that moves out
from under a finger is worse than one that sits still looking unavailable — and since the user chose it over the
alternative, it is the property the gate asserts rather than merely implies.

Three readings that phrase leaves open, decided here:

- a **milestone** has no action at all, so it never gets a button; its counter is how the collapsed card carries it;
- a **pseudo-unlocked** upgrade is *not unlocked*. It is a real control on the tab (the teaser you press to unlock
  rather than to buy), but the rule says unlocked, so it stays in the expanded chip row. Named rather than hidden:
  it is the one reading where "what you can act on" and "unlocked and not yet bought" genuinely disagree;
- a **buyable** is bought repeatedly, so "not yet bought" cannot mean for it what it means for an upgrade. It
  qualifies while it can still be bought **at all** — below its `purchaseLimit` where one is declared, and never on
  affordability. Where the engine has no such field the test is vacuous and a buyable always qualifies, which is
  what that engine's own button does anyway.
  ⚠ **This slice first wrote "only TMT 2.7 declares that field; 2.2.1 has no such concept", and that is FALSE.**
  It generalised from a two-file grep — `ptr` versus `something` — to a claim about engine versions. Re-censused
  unbounded: **155 of the 171 games carry `purchaseLimit`, 154 of them defaulting it in their own layer support**
  (`games/something/js/technical/layerSupport.js:127` is one of those 154). The **16** that do not happen to
  include `ptr`, `the-modding-tree` and `the-burning-tree`, which is why two reference games looked like two
  engine generations. The CODE was never affected — it reads the field where it exists and treats its absence as
  unlimited, which is correct for all 171 — but the explanation beside it was a sample of two.

A **challenge** qualifies while it is not completed, active or not: `startChallenge` is what its own button calls
in both states.

**How many buttons: as many as the row holds**, ⚖ measured at render against the row's own width (user,
2026-09-18), never a constant. Every candidate is in the DOM; the ones the browser wrapped onto a second line are
hidden, in **one** batched pass after the cards are in the document — `getBoundingClientRect()` forces layout, and
a per-card read during construction would force one per card. Hiding a trailing flex item cannot move the items
before it, so one pass is enough. A `resize` listener re-measures; it registers no timer and writes nothing.

⚠ **The two rows fit independently of each other**, which overturns a number the brief carried. The user's reason
for considering four buttons rather than six was that "the x/y entries take up space" — on their own row they no
longer do, so the button row gets the whole card width back. Measured on `something`'s `fundamental`: **7 buttons
at 390 px and 8 at 1280 px**, of 13 offered.

⚠ **THE GRID HAD TO CHANGE FOR "more on a desktop" TO BE TRUE AT ALL, and this is a defect U2 shipped.** The card
grid was `repeat(auto-fill, minmax(280px, 1fr))`, which at 1280 px gives **four columns of 308 px** against a
phone's single **366 px** card — a desktop card *narrower* than a phone card, so no fit rule measured on the row
could have held more buttons there. It is now `minmax(min(100%, 380px), 1fr)`: the `min()` is what keeps a 366 px
phone on one column instead of overflowing a 380 px track, and the desktop takes **three columns of 413 px**. Every
viewport above the phone's now holds a card at least as wide as the phone's.

**The counters do not move the layout.** They carry `font-variant-numeric: tabular-nums` and a reserved width in
`ch`, computed from the widest value each counter can reach (`y/y` for a ratio) and **only ever grown**, never
given back — a width that shrank back would move the row the moment a number did. Without the tabular figures a
proportional face makes a `1` narrower than a `7`, so the row would shuffle sideways on a number that did not even
change width. ⚠ U2c **verified** that rather than inheriting it: the digits leg below writes a shorter value, and
one the same length in wider glyphs, into every counter and asserts the box did not move.

**The counters are throttled, at 250 ms (4 Hz).** ⚖ The user agreed a throttle was fine (2026-09-18); the rate is
this slice's. A counter is a number you read, not an animation, and 250 ms is below the delay at which a readout
starts to feel stale — while the refresh it rides on is driven by the game's own re-renders, coalesced per
animation frame, so up to 60 Hz. It is the card's heaviest per-refresh work (one pass per category per card), so
this is roughly a 15× cut. ⚠ **Only the observer path is throttled.** An explicit `refresh()` — the API, a press,
opening the panel — is a caller asking for a fresh read and always does the whole thing; a throttle that swallowed
those would make the list lie immediately after the press that changed it. Measured by the gate rather than
declared: twelve `#app` mutations one per animation frame produce **12 refreshes and 1 sync**.

**The expander moved into the card's head, and lost its digit.** It has to be pressable in *both* states — the
expanded card hides the counters and the buttons — so it can live in neither of the two rows it toggles between;
in the head it also costs no vertical space of its own. It is a chevron, not U2's `+N`: the counter row now states
every total that `+N` stood for, and a second, shakier answer to the same question would be one more number to
hold still.

#### The cards you opened come back (U2c)

⚖ **The expander may not reset on every load** (user, 2026-09-18), **per layer and per game**. One key holds the
ids of the cards that are open; a card the key does not name is closed, which is also what an absent key says.

**The store is the loader's own namespace, and no second one was invented.** `tmtLoader.storage`
(`loader/page.js`) is already keyed `tmt-loader:<id>:`, so the key is `tmt-loader:<id>:ui.layerlist.expanded` and
two games on the same origin cannot read each other's. It is written through `storage.raw` rather than through
`localStorage`: the prefix shim would namespace it just the same, but the raw methods state *which* namespace this
key is in, and they keep the list independent of a game that re-patches `Storage.prototype` after the shim. ⚠ It
is emphatically **not** `player` — the list still assigns nothing there, which is what keeps it invisible to the
automation ladder (`gates-s1.mjs --part 1`, 52/52).

⚠ **Storage can throw and can come back empty** — a private window, blocked site data, a quota. Every read and
every write is wrapped, and a list with nothing stored renders exactly as it did before this existed. Nothing
open is nothing to remember, so closing the last card **removes** the key rather than storing an empty list.

**Does "clear this game's save" drop these preferences?** **Yes** — and the launching session's view was *no*, on
the reasoning that a collapsed card is not progress. What overturned it is not a judgement about what a preference
deserves but a mechanical fact: *namespaced per game* and *cleared per game* are the **same namespace**. `clear()`
removes every key under `tmt-loader:<id>:`, the picker's own button counts those keys and promises to "Delete
every saved key of <game> in this browser", and the only way to survive that is a key **outside** the prefix —
which is the second store the brief ruled out, and a key nothing in the UI could ever remove again. The
consequence is benign and worth stating: a cleared game comes back with every card closed, which is exactly what a
first load does.

⚠ **A SECOND key now lives in that namespace, under the same rules** — `tmt-loader:<id>:ui.au.collapsed`, which
blocks of the automation tab's `Advanced` view the player has folded (V3, `docs/automation.md`). It is the same
pattern deliberately: the same store, `storage.raw`, every read and write wrapped, nothing in `player`, and the
same consequence — a cleared game comes back with today's defaults.

⚠ **It found a defect of its own, and the defect is the persistence's, not U2d's.** A card **built open** hides its
whole action row, and a `display: none` row has no layout — `getBoundingClientRect()` reports every button at the
same zero top, so the build-time fit pass cannot see where the browser wrapped them and marks none. MEASURED on
`the-unbalanced-tree`'s `i` before the fix: reopened from the store and then closed, it showed **all 10 of its
buttons on two lines, 261 px tall**, against the 7 on one line and 211 px it had before the reload. So `fitCards`
now **skips an open card** — a row it cannot measure is a row it must not judge — and closing one pays the
measurement that was skipped. The gate closes the restored card and re-reads the fit for exactly this.

#### The layout does not move as the digits do (U2c)

A TMT number grows by thousands of orders of magnitude over one save, and `.tmt-layerlist-amount` had **no width
reservation**: the readout was sized by its own string. It now carries `width: 12ch; max-width: 100%`, the whole
overlay carries `font-variant-numeric: tabular-nums` (plus `font-feature-settings: "tnum"` for the older engines'
fonts), and the card carries `contain: layout`.

⚠ **The brief's premise did not survive the measurement, and the correction matters for what the gate asserts.**
The **card's** box does not move and never did: the grid is `repeat(auto-fill, minmax(min(100%, 380px), 1fr))`, so
a card's width comes from the track and not from its contents, and the readout is `white-space: nowrap`, so it
cannot change the card's height either. What moves is the **meta column inside** the card — the resource **name**
sits directly above the amount and shares that column, so the column is as wide as the number currently is, and
the name's box (and its ellipsis) is resized by every growth in the number. Measured at 390 px on the deep
snapshot, moving nothing but the readout's string from `0` to `1.111e3,284`: **10 of ptr's 11 cards** moved
(`q` 46.97 → 112.59 px, `b` 62.63 → 112.59, `a` 10.25 → 112.59) and **8 of `something`'s 8** (`primitive`
54.8 → 112.59). With the reservation: none of them, at either width, in either state.

- **`12ch`** because with tabular figures a `ch` is exactly one digit and TMT's `format()` caps the string near
  10–12 characters even at e3284 — the widest string this slice could construct is `1.111e3,284`, 11 characters —
  and the existing ellipsis takes anything past it. `max-width: 100%` is what leaves the ellipsis room on a card
  too narrow to hold 12.
- **`tabular-nums` is a measured NO-OP on both reference engines' fonts.** `111` and `777` are both 30.72 px in the
  amount readout with it and without it, because those fonts already default to tabular figures. It is declared
  for the games that ship a font that does not, and because a reservation in `ch` is only a fixed number of
  columns if a column is a fixed width. Said out loud because a rule that changes nothing measurable here is a
  rule a later reader will delete.
- **`contain: layout` is `layout`, not `size`.** A card's own height still answers to its content, so a card that
  really grows still moves the cards below it; nothing in CSS prevents that short of fixing the height. It states
  that a re-layout inside one card cannot reach the grid, and it moved no box on either reference game.
- **The prestige button was checked too and did not move.** It is the card's other number-bearing readout and it
  is the game's own prose, wrapping rather than clipping — but at the magnitudes `format()` reaches it stays
  within the same wrap on a 366 px card (measured on `ptr`: `+111` through `+1.111e3,284 prestige points`, every
  card's height unchanged). It gets the tabular figures with everything else and no reservation, because a
  reservation for prose would be a guess.

#### The tooltip: what a chip costs and does (U2e)

⚖ **A chip reading `RPB` should say what the upgrade costs and does**, not only that it is called "Reverse Prestige
Boost" (user, 2026-09-18).

⚠ **A tooltip already existed, and that is the whole difficulty of this slice.** U2d put a `title` on every chip,
counter and action button, so on a desktop a hover already opened the *browser's* tooltip with the short name. So
"a tooltip appeared" is a claim that passes on the build before this one. Three things a native `title` cannot do
are what U2e is:

1. it is only the short **name** — never the cost, never the effect;
2. it does **nothing on touch**, and the phone is the case the layer list was built for;
3. it cannot be styled or positioned, so it cannot be kept on a 390 px screen, and it opens on the browser's delay.

**The `title` attributes stay.** They are the accessible name and the no-JS fallback. ⚠ And the overlay's **first
line is the element's own `title`, read off the attribute** rather than recomposed — so "if the tooltip and the
`title` disagree, the tooltip is wrong" is not a rule anybody has to remember: there is one string. On a pointer the
native tooltip may still appear beside ours after its own delay, saying the name where ours says the cost; they are
not duplicates, and dropping the attribute to prevent it would cost the accessible name.

**The second line, per CATEGORY and never per game.** `DETAIL` in `loader/layerlist.js` names exactly the fields
that category's own engine component renders, in the order it renders them — measured in both reference engines'
`components.js`:

| category | what the overlay composes | why |
|---|---|---|
| upgrades | `description`, then `Currently:` `effectDisplay` (else the formatted `effect`), then `Cost:` `cost` + currency | 2.2.1 and 2.7 render the same four in the button |
| buyables | `display` alone | it already carries the cost — `ptr`'s `t/11` reads "Cost: 138 Boosters / Amount: 21 + 7", so a composed cost line would say the same number twice |
| challenges | `challengeDescription`, `Goal:`, `Reward:` `rewardDescription`, `Currently:` | the engines' own order and their own labels |
| milestones | `effectDescription` | the `requirementDescription` is already the chip's name, and therefore its `title` |
| counters | nothing — the name alone | a category total has no cost and no effect; what the counter closes is gap 2, not gap 1 |

A cost is formatted the way the engine's own button formats it (`formatWhole`, then `currencyDisplayName` or the
layer's `resource`), including **`multiRes`**, the multi-currency cost four games declare and where `cost` itself is
undefined. A `goal` uses `format`, as its component does.

⚠ **A declared `tooltip` field is ADDITIVE, not a substitute — and the brief's rule and its census were both
wrong.** The brief said "prefer `tooltip` where the component declares one, otherwise compose", on a census of
*165 of 171 games*. Measured instead:

- **all 171 of the 171 games** mention `tooltip` (the engines define the component, so the word is in every tree —
  that census answers nothing), while **140 games declare one on a chipped category**, 406 declarations against
  3,133 on achievements — and an achievement gets **no chip**, so the overwhelming majority of the roster's
  `tooltip` declarations can never reach this overlay at all. The "165" is the achievement figure.
- **Neither reference game DRAWS one.** At its deepest snapshot `ptr` has 80 `tooltip`-bearing achievements and
  `something` 42, and **zero** chipped components with the field on either. So the field path is not the common
  case, and preferring it *exclusively* would have been untestable on both reference games.
- In the engines the `<tooltip>` component sits **beside** the button's own description block, so the field is extra
  text rather than a replacement. An exclusive rule would drop the cost and the effect — which is the one thing this
  slice exists to add. The declared tooltip is therefore the overlay's first detail line and the composition follows
  it. Measured naturally on `1-clicker` (10 of its drawn controls) and `create-incremental` (6), which is where the
  gate exercises that path without constructing anything.

**⚖ Hover on a pointer, tap on touch** — U1's rule (`loader/navbar.js`), with its constraints kept: nothing calls
`preventDefault`, so the control's own click still buys, and opening one tooltip closes any other (there is **one**
overlay for the whole list, so that is the shape of the thing rather than a rule it has to keep).

Two places where it is not a copy of U1, both for measured reasons:

- **the guard is the DEVICE, not `tmtLoader.mobile`.** U1's game-element tooltips are mobile-only because on a
  desktop the game's own CSS `:hover` already opens them. Ours key the tap path on `(hover: none)`, because the
  layer list is wanted at a desktop width under `?navbar=1` too — where `mobile` is false and there would otherwise
  be no way to open a tooltip on a phone-sized touch screen. Measured in the gate's own two contexts: the phone one
  reports `(hover: none)`, `(pointer: coarse)` and `maxTouchPoints: 1`; the desktop one reports `(hover: hover)`,
  `(pointer: fine)` and `0` — and the phone context keeps `(hover: none)` when the gate resizes it to 1280 px,
  which is right, because it is the device and not the width.
- **the click listener is on the CAPTURE phase.** U1's is a bubble delegate on the document, which is right for the
  game's elements. Ours sits on the panel over controls that **re-render when pressed**: buying an upgrade moves the
  action row's membership, `drawActions` replaces every button in it, and a bubble listener would then be handed a
  **detached** `event.target` with no path back to the panel — so a tap that bought something would open no tooltip
  while a tap on an unaffordable one would. On the way down the element is still live.

**Cost and effect move every tick, so an open tooltip is re-read** — on the *same* throttled path as the counters
(`syncCards`, 250 ms) and in full on every explicit `refresh()`. One recompute per animation frame would undo U2d's
throttle; never recomputing would leave a stale number under the finger. It also **re-anchors by component key**
rather than by element, because the button it points at can be replaced by a rebuild; a control that has gone — or
whose card has collapsed out of sight — closes it.

⚠ **A tooltip is refused on a control with no layout**, and the gate is what found it: a collapsed card hides its
whole chip row, and an element with no box has nothing to place a tooltip against, so the overlay landed in the
corner pointing at nothing and the next sync closed it again. Refusing it up front is what makes `showTip` and
`syncTip` agree.

**The overlay is a child of the PANEL and never of a card.** `.tmt-layerlist-card` carries `contain: layout`
(U2c), which makes the card a containing block for a `position: fixed` descendant — inside one, the tooltip could
not be positioned against the screen at all. It is clamped inside the panel's own box, which already sits above the
nav bar, so one clamp keeps it on screen *and* off the bar. It is `pointer-events: none`: a readout, so a tap that
lands on it reaches the control underneath, and a mouse crossing it cannot fire `pointerout` on the anchor it is
describing.

**The fields are HTML** (`v-html` in every engine), so tags come out with the regex first and the entities are
decoded afterwards through a `textarea` — whose content model is text, so nothing is ever parsed as markup. That
order matters: decoding first could turn `&lt;b&gt;` into a tag. Newlines survive (`white-space: pre-line`, as the
engines render a buyable's `display`), everything else collapses. And `format()` is the reason the whole composition
sits inside `withoutRaisingNaN`: see below.

#### What the list costs per frame, measured (U2f)

The three slices above each added per-frame work, and none of them measured any. This one measures it and changes
nothing, because the numbers say there is nothing to change. The instrument is `tools/harness/cost-layerlist.mjs`
(`--census` costs every game on the roster; `--flat` is the paired delay comparison); every cost below is taken
through the list's own `tmtLoader.layerListUI` surface, at the phone viewport, with `?automation=1` OFF.

⛔ **THE HYPOTHESIS THIS SLICE WAS BRIEFED WITH DOES NOT HOLD**, and it fails on three separate legs. It was that
`signature()` walks every layer's `visibleSeq` **on every frame** purely to detect a rebuild — an event that
happens perhaps once a minute — so it should be throttled and the value updates left alone.

**1. It does not run on every frame. It runs at the GAME's tick rate.** With the engine's own loop running and the
panel open, the observer path fired **20 times a second** on every game measured — `ptr`, `something`,
`the-alphabetree`, `the-yes-tree`, `the-dream-tree`, `the-infinity-tree`, at a fresh save and at the deepest
recorded snapshot. That is TMT's own 50 ms game loop, not the 60 Hz animation frame: the `requestAnimationFrame`
coalesce is **not** the binding constraint, the game's tick is. Driven artificially at one `#app` mutation per
frame — the most the coalescer can ever be asked for — it tops out at **30–40/s**, still never 60. And at a fresh
`ptr` save it fired **0 times in 4 seconds**, because nothing `ptr` draws moves until the first upgrade.

**2. It is not the expensive half.** Over **173 game-states** (the 171 games at a fresh save, plus the two recorded
snapshots), `signature()` costs a median of **0.083 ms** and a maximum, anywhere, of **0.463 ms**. Its *share* of
the pass has a median of 34% — but that share is **anti-correlated with the cost** (r = −0.25): it is the majority
only on the pages where the whole pass is already free, and on the two most expensive pages on the roster it is
**8%** and **13%**.

**3. The cost scales with something else entirely.** Across those 173 states the observer pass correlates with the
number of **cards** at **r = 0.923**, with the number of chips at 0.649, and with the number of drawn components —
which is exactly what `signature()` walks — at only **0.390**. Throttling `signature()` would throttle the term
that is not the cost.

⚠ What the hypothesis got RIGHT is its premise: the event really is rare. **`rebuilds` was 0 in every rate window
measured**, on every game, at both states. `signature()` does its job and detects nothing, for minutes at a time.
That half is true and it leads nowhere, because detecting nothing costs 0.08 ms.

**What one pass costs.** The panel CLOSED costs **0.002 ms** — the `!open` guard, still the most valuable
optimisation in the file. Open, over the 173 states: observer pass **median 0.245 ms, p90 0.495 ms, max 3.393 ms**.
Only **4** states exceed 1 ms and only **2** exceed 2 ms.

| game (state) | cards | drawn | chips | observer pass | explicit pass | `signature()` | share |
|---|---|---|---|---|---|---|---|
| `the-alphabetree` (fresh) | 49 | 31 | 31 | **3.39–4.13 ms** | 3.97–4.11 ms | 0.263–0.286 ms | **8%** |
| `the-yes-tree` (fresh) | 25 | 87 | 86 | 2.05–2.33 ms | 2.74–3.44 ms | 0.259–0.285 ms | **13%** |
| `ptr` (snapshot, 24179 ticks) | 11 | 192 | 89 | 1.10–1.47 ms | 2.27–2.65 ms | 0.450–0.463 ms | 32–41% |
| `the-infinity-tree` (fresh) | 18 | 30 | 29 | 0.91–1.00 ms | 1.37–1.62 ms | 0.203–0.210 ms | 21% |
| `the-dream-tree` (fresh) | 10 | 30 | 30 | 0.80–1.29 ms | 1.13–1.40 ms | 0.092–0.103 ms | 11% |
| `something` (snapshot, 579 ticks) | 8 | 81 | 30 | 0.58–0.67 ms | 1.37 ms | 0.247–0.275 ms | 41–43% |
| `ptr` (fresh) | 2 | 81 | 1 | 0.24–0.30 ms | 0.47 ms | 0.162–0.220 ms | 66–73% |

⚠ **The two games the U2f brief named as the busiest cards were a stale figure, and this instrument is what caught
it.** `the-tearonq-i-have-no-creative-names` was recorded at **111 chips** — at commit `5f3c04403`, *before* U2b
made the chips mirror the game's own tab. At this head it draws **zero**, and its pass is the cheapest measured
(0.092 ms). The census is why the table above names `the-alphabetree` and `the-yes-tree` instead: the worst case
is a measurement, not a name.

**The tooltip's cost lands only on the EXPLICIT path**, which is exactly what U2e's design predicts and nobody had
measured. With one open, the observer pass is unchanged to within noise (`the-alphabetree` 3.50 → 3.60 ms, `ptr` at
its snapshot 1.10 → 1.10) because the re-read rides `syncCards`' 250 ms throttle — `tipSyncs` equalled `syncs`,
about **4/s**, in every window. The explicit pass, which a press takes, roughly **doubles to triples**: `ptr` at its
snapshot 2.27 → 4.52 ms, `the-alphabetree` 4.11 → **10.25 ms**. That is `placeTip`'s two `getBoundingClientRect`
calls forcing a synchronous layout of the panel, and it is paid at the rate a finger presses things.

**The `pointerover` listeners** are the one cost whose rate a reader controls directly, and they are not throttled
at all: entering a control that is not already the anchor costs **0.30–0.46 ms** (it composes and places an
overlay), and re-entering the one that is costs **0.008–0.014 ms** (the `t !== tipAnchorEl` early return). A hand
sweeping across a card crosses controls at some tens per second at most.

**Does any of it show as main-thread delay?** ⚖ This is the question that decides whether any of the rest matters,
because a poll that does not get scheduled is reported as STARVED and then blamed on whoever holds the slice.
**Yes — in the tail, and by a few milliseconds.** Measured as the lateness of a **jittered 40 ms poll** (the shape
Playwright's own `waitForFunction` uses), over five interleaved cycles of closed → open → tooltip-open on one page:

| game | observer pass | p90 lateness, CLOSED | p90, OPEN | delta | cycles open > closed |
|---|---|---|---|---|---|
| `the-alphabetree` | 4.13 ms | 1.27 ms | 6.36 ms | **+5.09** | **5/5** |
| `the-yes-tree` | 2.16 ms | 0.91 ms | 7.13 ms | **+6.22** | **5/5** |
| `the-infinity-tree` | 0.93 ms | 3.02 ms | 5.58 ms | **+2.56** | **5/5** |
| `the-dream-tree` | 0.82 ms | 0.48 ms | 2.66 ms | **+2.18** | **5/5** |
| `ptr` (snapshot) | 1.11 ms | 7.70 ms | 6.94 ms | −0.76 | 3/5 |
| `ptr` (fresh) | 0.25 ms | 7.74 ms | 6.55 ms | −1.19 | 2/5 |

**And it is far too small to starve anything.** Over all 90 paired windows the **median** lateness was **0.07 ms**
(worst window 2.55 ms), the frame rate never left **59.5–60.4 fps**, and the browser reported **zero** long tasks.
An open tooltip adds nothing beyond the open panel. A poll loses a few milliseconds off its tail and keeps its
whole budget.

⚠ **`ptr` cannot see it, and that is about `ptr`.** Its own closed-panel floor is **7.7 ms** at p90 — the game's own
render is the noisy part there — so the list's couple of milliseconds are not separable from it. A battery run on
the reference games alone would have concluded "no effect at all". Fifth time in this arc that the reference games
were the wrong witnesses.

⚠ **The delay is bigger than the JS the timer can see.** `the-dream-tree`'s pass is 0.82 ms of JavaScript and
produces +2.18 ms of p90 lateness. The difference is the style and layout pass the DOM writes buy, which an
in-page `performance.now()` around `refresh()` cannot measure. The lateness is the honest observable; the JS time
is a lower bound.

**So: nothing changed.** Even a perfect version of the briefed optimisation — `signature()` throttled to nothing —
removes **8–13%** of the pass on the pages where the pass costs anything, against a measured effect of a few
milliseconds in the tail with the frame rate untouched. What the numbers do point at, for whoever wants it, is the
**per-card loop**: 49 cards cost 4 ms and 2 cards cost 0.25 ms, and the correlation with the card count is 0.92.

**Two things the measurement itself got wrong first**, both worth more than the result:

- ⛔ **A poll at a FIXED interval phase-locks to the animation frame.** At 40 ms it does not, but the first version
  polled at **50 ms — exactly three 16.7 ms frames** — so whether a sample waited for the frame's work was decided
  by the window's starting phase and not by the load. It read burn ×4 at p50 **15.9 ms** and burn ×16 at **0.1 ms**,
  which is the opposite of the truth. The poll is jittered now and the sweep is monotone.
- ⛔ **An UNPAIRED closed-versus-open comparison could not see this effect.** The first battery compared conditions
  across separate runs and found nothing, because the floor itself moved between them (a closed-panel p90 of 6.3 ms
  in one run and 0.9 ms in another). The same conditions **cycled inside one page** separate in **5/5** cycles on
  four games. A difference of five milliseconds needs a control that shares its noise.

⚠ And the instrument was only worth trusting because it was shown **reporting a delay**: a burn sweep drives ×1,
×4, ×16, ×32 and ×64 copies of the list's own pass per frame, and the frame rate falls (60 → 55 → 43 → 33 fps on
`ptr` at its snapshot, 60 → 21 → 12 → 6.6 on `the-yes-tree`) with p50 lateness rising to tens of milliseconds. A
probe that had only ever printed "no delay" would have said nothing at all.

#### The list stops drifting down while you read it (U4)

⚖ user, 2026-09-19: *"the Layers view drifts down on a reset."* It did, and the fix is **one CSS line** —
`overflow-anchor: none` on `.tmt-layerlist-body`.

**The mechanism is the browser's, not this file's.** `refresh()` rewrites a card's live text 20×/s: the prestige
button's string, the amount readout, a counter's digits. Those strings change length, a card's content height moves by
a few pixels, and the browser's **scroll anchoring** then adjusts `scrollTop` to keep the anchor element it picked
visually still. That adjustment *is* the drift. MEASURED on `the-yes-tree` at 390 px, through the card's own reset
button:

| | before | after |
|---|---|---|
| `scrollTop` | 2275 | 2272 |
| `scrollHeight` | 5287 | 5283 |

The list got **4 px shorter** and the offset followed it down. On `ptr` at its deep snapshot the same press measures
`scrollTop` −3 with `scrollHeight` −3 under `overflow-anchor: auto`, and **0 with −3** with the fix: the height still
moves, the offset no longer does.

⛔ **It is NOT `rebuildInner`'s `body.textContent = ''`.** That is real code with nothing preserving `scrollTop`
across it, and it was the first hypothesis — but a reset does not change MEMBERSHIP, so `signature()` matches and no
rebuild runs; and a *forced* membership change measures **Δ 0**, because the wipe and the refill happen inside one
task with no layout between them. Reducing the height churn would have been a second, weaker option; disabling
anchoring on the one scroller we own is exact.

**Who can witness it, and it depends on the STATE.** A game can only witness this where its list SCROLLS, and how
much it has to show grows as the save does:

| measured at | witnesses | cannot (list not scrollable at 390×844) |
|---|---|---|
| a bare probe: fresh save, deep snapshot where one exists (`d7cd5c185`) | 44 | 127 |
| gate M1's own state — 3,000 ticks, a reset press and a purchase past that (CI at `ccb0ed08a`) | **49** | 122 |

⚠ So the roster figure is not a property of the roster; **five more games cross the threshold between those two
states**, and a number quoted without its state is not reproducible. ⚠ `ptr` is a witness in both — but only once
its deep snapshot is loaded. At a fresh save its list fits the viewport *exactly* (737 px of content in 737 px),
which is why a first look said it could not witness this at all.

**The gate** (`--gate mobile`, two halves, in the layers leg):

- the **real** one rides the existing reset press: the scroller is put at a mid-list offset, the card's own prestige
  button is clicked, and both numbers are read either side;
- a **constructed** one, so the claim is judged wherever the list scrolls at all: a 40 px spacer inserted as the
  body's first child.

⛔ **The discriminator is not "scrollTop did not move."** A build whose cards stopped changing height would pass that
while proving nothing about anchoring, so **each half judges only where Δ height ≠ 0** and abstains otherwise, naming
which it was.

⚠ **And the constructed half had to be built the right way round.** The first version grew the first card's
`marginTop`. A computed-style change to `margin` / `padding` / `height` on the anchor node **or any of its ancestors
up to the scroller** is a *suppression trigger* in the scroll-anchoring spec: the browser declines to adjust at all.
MEASURED on `something`, whose rows hold one card each so the first card *is* an ancestor of the anchor: `marginTop`
+40 gave `dTop` **0** with `dHeight` 40 — a clean pass, with anchoring fully on and the defect fully present — while a
spacer at the top of the same body gave **40 / 40**. A probe built the first way would have certified the fix before
anything was fixed.

#### The chips wear the game's own colours (U5)

⚖ **"purchased, affordable, unaffordable — the game's own three-way reading"** (user, 2026-09-19). Until U5 a chip
carried no affordability at all: `data-state="done"` was `opacity: .45` and that was the whole scheme.

⛔ **THE VOCABULARY TRAP.** The engines' `.locked` class means **cannot afford**. It does *not* mean "not unlocked"
— which is what `locked` meant *in this file* until U2b removed that state. Red is for **unaffordable**, never for
absent, and since U2b there is no "absent" state left to confuse it with: a component the tab does not draw gets no
chip at all.

**There is nothing to choose about the three colours**, which is the whole point — they are the game's:

| the chip is | it wears | because the engine's own control does |
|---|---|---|
| purchased | `.bought` (`.milestoneDone`, `.hChallenge.done`) | the upgrade button's own `bought` class |
| affordable | **the LAYER's own `tmp[l].color`** | `v-bind:style="[canAfford ? {'background-color': tmp[layer].color} : {}]"` — `.can` declares no background in any engine on the roster |
| unaffordable | `.locked` (a milestone: the bare `.milestone`) | the upgrade and buyable buttons' own `locked` class |

A milestone is **passive**: there is nothing to afford, so it is never `can`. Earned it is the engine's
`.milestoneDone` green, unearned the bare `.milestone`, which in every engine on the roster is the same red as
`.locked`. A **challenge** is the other way round: the control you press is its *start button*, `{longUpg, can,
[layer]}` with the layer's colour inline in every state, because starting one costs nothing — only "completed" has
a colour of its own.

⚠ **THE COLOUR IS ASKED OF THE GAME'S STYLESHEET, never carried as a table of hex values.**
**every one of the 171 games declares a bare `.bought` rule and a bare `.locked` rule (171 and 171)**, and **4** of
them — `the-congratulations-tree` (`hsl()`), `the-rainbow-void-tree` (its own pair), `the-factoree` (8-digit hex,
so the chips come out `rgba()` with real alpha) and `the-prestige-tree` (`var(--boughtcolor)`, which its own
`game.js` re-points at the current tab's layer colour on every tab change) — paint one of the two something other
than the family's `#77bf5f` / `#bf8f8f`. A hardcoded pair would be wrong on those four and would go stale on the
rest. `tools/census-figures.mjs` checks both numbers against this sentence.

⚠ **The classes are NOT put on the chip.** They carry geometry as well as colour — `.upg` is 120×120 in PTR,
`.milestone` is `width: 100%; height: 75px`, `.hChallenge` is 300×300 — and a chip wearing them would blow up the
44 px tap target and the measured action-row fit. Only the colour is taken, off an off-screen probe, and written
inline; `data-skin` on the chip records which of the engine's words it is.

⚠ **Where the probe sits, and why it is not inside the mechanism it measures** (U4's rule, applied to a new
instrument):

- **`document.body`, not `#app`.** The engines set their theme custom properties *on `document.body`*
  (`document.body.style.setProperty('--boughtcolor', …)`), so the variables resolve — while `#app` is what both of
  the loader's MutationObservers watch *and* what the gate's own geometry probe reads through `#app .upg`. A probe
  parked in `#app` would have been measured by our own gate as an undersized tap target.
- **`visibility: hidden` and off-screen, never `display: none`.** A display-none element has no used value, and any
  rule keyed on rendering would drop silently out of the answer.
- **Inserted and removed inside one synchronous block**, so no frame and no geometry probe can see it.

⚠ **The palette is read when the list OPENS**, and cached until it opens again. It cannot go stale under the
player: a theme is changed on the game's own Options tab, and reaching that tab closes the overlay. Reading it per
refresh would insert an element into the document four times a second for a value that does not move.

⚠ **Repainting rides the counters' throttle**, not the frame: `affordable()` is game code, called once per chip.
⚖ U2's ruling still binds and is now gateable — affordability may decide **appearance** and never order or
membership. The gate asserts the chip row is byte-identical across a window in which the colours flip.

**MEASURED, and it is why the gate's discriminator is constructed.** At `ptr`'s deepest snapshot plus 6,000 ticks
**not one card shows all three states at once**: everything unbought there is also unaffordable (70 `bought`, 13
`locked`, no `can`), and a fresh save draws one chip in total. A two-state check would pass on the build that has
no red at all.

#### Back returns to the view you came from (U5)

⚖ **"open a layer from the Layers list and Back should return you to the LIST, not the tree"** (user, 2026-09-19).

**SESSION-ONLY, and that is a decision rather than an omission.** The memory is one variable in `layerlist.js`'s
closure: nothing in `player`, and — unlike the expander's preference — nothing in storage either. A remembered view
that outlived a reload would open the overlay over a layer tab nobody remembers choosing, and the engines already
keep their own per-layer `prevTab` *in the save*; a second, longer-lived memory of ours beside it is the one that
would disagree with it.

⚠ **It is NOT an intercept, and that is measured rather than tidy-mindedness.** `goBack` is not "hardcoded to the
tree": **every one of the 171 games draws its back control with the class `back` or `other-back` (171), and 166 of
them route it through `goBack`**, but what `goBack` then does differs — 154 are called as
`goBack(player.navTab == 'none' ? player.tab : player.navTab)` and read a per-layer `player[layer].prevTab` this
loader knows nothing about; 8 are the arg-less two-branch form
(`player.navTab !== 'none' ? showTab('none') : showTab(player.lastSafeTab)`, PTR's shape); and the rest go straight
to `showTab('tree')` or `showTab('none')`. Swallowing the click would replace every one of those answers with ours.
So the engine's own handler runs untouched and the **list is opened over whatever it navigated to** — which is what
the overlay is: a view over a tab, never a tab of its own. Nothing calls `preventDefault` or `stopPropagation`
(U1's rule, and U2e's measurement that a `stopPropagation` in a capture handler is exactly what swallows a
control's own click).

⚠ **The memory is only about the tab on screen.** It is set when the list opens a tab, read in the **capture**
phase (where the tab the press is leaving is still the tab on screen) and used on the next **frame** — after the
whole dispatch, which a microtask would not be, and a frame rather than a timeout because this file registers no
timer. Any click that moved the tab drops it. That last clause is the half a build with an unconditional memory
fails: a layer opened from the list, left by the nav bar, and reached again **from the tree** must come back to the
tree.

⚠ Three games also put `class="back"` on the HELP tab's own back button, which sets `tmp.helpTab = NaN` rather
than navigating. It cannot match here, because that tab is not the layer the list opened.

#### The collapsed card wears the colours too (U6)

⚖ **"an action button stands for the same component as a chip, so it should wear the same skin"** (user,
2026-09-19). U5 skinned the chips and stopped there, and the cause was scoping rather than logic: `chipSkin()` was
applied where the CHIPS are built, while the action row only ever got `data-afford`. So the expanded view showed
the game's red and the collapsed one did not — MEASURED on `ptr`, same card, 390×844:

| control | `data-skin` | `data-afford` | computed background |
|---|---|---|---|
| collapsed action button | *none* | `no` | `rgba(0, 0, 0, 0)` |
| expanded chip | `locked` | — | `rgb(191, 143, 143)` |

⚠ **`data-afford` STAYS.** The two attributes answer different questions — U2d's lit/grey is "can I press this
right now", the skin is "what IS this" — and the collapsed card wants both. An action button can only ever be
`can` or `locked`, because the row's membership is "unlocked and not yet bought": a button is never `bought`.

#### The counters wear colours too (U6)

⚖ **"match what the main view already says"** (user, 2026-09-19), who settled every case:

| counter | GREEN | RED | the layer's own colour |
|---|---|---|---|
| milestones | all earned | **any not yet earned** | never |
| achievements | all earned | **any not yet earned** | never |
| upgrades | all bought | none of the unbought is affordable | otherwise |
| challenges | all completed | any not completed | never |
| buyables | **never** | nothing in the category is buyable right now | otherwise |
| clickables | **never** | nothing is clickable right now | otherwise |

⚖ **Milestones and achievements are RED whenever one is unearned** — user, verbatim: *"Unearned milestones and
achievements are displayed in red in the main view and earned ones are displayed in green. And so we should use
green and red, not layer colors."* ⚠ That **overturned** the recommendation this slice was briefed with (the layer
colour, on the reasoning that red implies something actionable). The rule is the main view's rule, and the main
view wins. ⚖ A **buyable is never green**: it holds an amount and is never "done", so "all earned" has no referent
— the same 2026-09-18 ruling that made its counter a total rather than an `x/y`.

⚠ **Challenges and clickables were NOT named by the user.** Those two rows apply the same principle by analogy —
a challenge is an earned/total category like a milestone, a clickable an owned one like a buyable — and they are
recorded here as an **inference, not a ruling**, so they are cheap to correct.

⚠ **The colours are the game's, resolved the same way the chips' are**: the category's own class first, so a
counter matches the boxes it counts, and the family's bare `.bought` / `.locked` as the fallback — all 171 declare
those bare (measured, U5), so a fork that styles no `.milestoneDone` still gets a green rather than no colour at
all. The layer colour is `tmp[l].color`, straight off the CARD's layer, which is also what its badge reads.

| counter | its green | its red |
|---|---|---|
| upgrades | `<layer> upg bought` | `<layer> upg locked` |
| achievements | `<layer> achievement bought` | `<layer> achievement locked` |
| milestones | `milestoneDone` | `milestone` |
| challenges | `hChallenge done` | the bare `locked` |
| buyables | — | `buyable locked` |
| clickables | — | `upg locked` (what the engines' own clickable wears) |

⚠ **A challenge counter and a challenge chip may legitimately differ**, and that is not a bug to fix: the engines
paint a challenge on their own scale (`.hChallenge.canComplete` is amber `#ffbf00`, not the `.bought`/`.locked`
pair), so the chip wears the engine's own control colour while the counter answers the user's green/red question.

⚠ **"Is there anything to DO in this category" is asked per component, on the engine's own terms** —
`canAffordUpgrade` for an upgrade, `tmp[l].buyables[id].canAfford` plus the `purchaseLimit` test for a buyable,
`tmp[l].clickables[id].canClick` for a clickable, which is the **only** place a clickable's own predicate is read
(it has no chip and no button). A **pseudo-unlocked** upgrade is not "available": it is the teaser you press to
unlock rather than to buy. The walk stops asking at the first yes, and it rides the counters' own 250 ms throttle.

#### Pressing an inaccessible layer does nothing (U6)

⚖ **"it should do nothing"** (user, 2026-09-19).

**Nothing was broken in the engine.** Every `showTab` begins `if (LAYERS.includes(name) && !layerunlocked(name))
return` — a silent no-op. The list hid itself **first** and found out afterwards (`hide(); cameFrom = l; showTab(l)`),
so the overlay closed, the tab did not change, and the player was left looking at whatever tab happened to be open.
MEASURED on `ptr` at `all/M05`, pressing `t`: the overlay went open → closed, `player.tab` stayed `none`, and U5's
remembered view moved to `t` — a tab that never opened.

So accessibility is tested **before** anything happens, and a refusal does nothing at all: no `hide()`, no
`showTab`, and no `cameFrom` write.

⚠ **The ENGINE's own predicate decides, where it has one.** `layerunlocked(name)` is what the engine's `showTab`
consults; the card's greyed class reads `player[l].unlocked`, which is **not the same question** — ptr's
`layerunlocked` also lets a layer you can reset into through. The one that decides whether the tab opens is the
engine's, so that is the one asked, wrapped; a game without it falls back to the card's own reading.

⚠ The card press and the card's open **button** are both paths into `openTab`, so the test is in the function.

#### The reset line is always two lines (U7)

⚖ user, 2026-09-19: *"As the number of digits in the amount of the resources changes, the 'Reset for +1 boosters'
text can take up either one line or two, causing the layout to flicker. Is there a way to make it always two lines,
splitting it between 'Reset for +1 boosters' and 'x / y points'? Most of the layers have that same issue, and need
that same fix."*

**The cause was one line of ours**, and its comment had weighed two options and missed the third. The engines carry
`<br><br>` in the middle of their prestige string to break a tall tab button in two; on a card that was collapsed to
a space, because dropping the break in CSS jams the two halves together. The third option is to keep the break as a
**structural** split into two rows, each with its own line box — which is what `resetLines()` does now.

**The two prestige types fail differently, and both had to be fixed.** Out of the engines' own
`prestigeButtonText(layer)`:

| type | the string | how it breaks |
|---|---|---|
| `static` | `Reset for +N <res>` + `<br><br>` + `[Req:\|Next:] <have> / <need> <base>` | the second line always exists; only the WRAP moves |
| `normal` | `Reset for +N <res>` + `<br><br>Next at <nextAt> <base>`, the **whole** second part conditional on `resetGain.lt(100) && points.lt(1e3)` | the card goes from two lines to ONE **as the game progresses** — a permanent height change |

⚠ **And the brief's premise that `static` is unconditional holds for 170 of the 171 and not for all of them.**
MEASURED:
`the-factoree` wraps its static second half in `player[layer].points.lt(1e7) ? … : (!canReset(layer) ? … : "")`, so
its static layers collapse to one line exactly as `normal` does. Reserving two line boxes **unconditionally** is
what fixes every one of these; a height that collapsed when the second half is absent would re-introduce the
`normal` case, which is why the reservation lives in `layerlist.css` and is not keyed on the second row's content.

⚠ **The reservation is derived, not a pixel count.** `--tmt-reset-lh` is the button's own line-height and each row
reserves exactly one of them (`min-height: calc(var(--tmt-reset-lh) * 1em)`); change the line-height and the
reservation follows. A half that is genuinely longer than the card is wide still wraps — the promise is one line
box per half, never that prose cannot wrap.

⚠ **The split is on the FIRST run of `<br>`s and only the first.** The engines' `else` branch hands a layer whose
`type` is none of normal/static/none to its own `layers[layer].prestigeButtonText()`, and **39 of the 171 games
declare 106 such per-layer overrides, whose break counts are 0 ×36, 1 ×22, 2 ×35, 3 ×5, 4 ×4, 5 ×1, 6 ×2 and
8 ×1** — static, brace-matched, over the loaded scope (`tools/census-figures.mjs`). All 171 globals keep the
family's three-branch shape, 170 with four breaks and `the-factoree` with six. So whatever follows the first run
keeps the old space collapse, and a string with no break at all leaves the second row empty — still occupying its
line box. `resetText()`'s bare-word `Reset` fallback, which a layer whose text throws or returns `''` gets, is one
line too, and it occupies two.

**Over the roster** (CI run `35478485680`, 171/171, 0 RED): **373 prestige buttons** — 144 `normal`, 49 `static`,
**7 with a `type` that is none of the three** (the engines' `else` branch, whose text is the layer's own: five on
`the-infinity-tree`, one on `the-incrementreeverse`) — and 9 games with no prestige button at all. **16 cards
render an EMPTY second line right now**, across 9 games: `ptr`'s `p` and `e`, all three of `something`'s, five of
`the-infinity-tree`'s, and ⚠ `the-dingus-tree`'s `f`, which is **`static`** — the runtime witness for the
`the-factoree` shape above, on a different game. Those 16 are the cards a reservation keyed on the second row's
content would break.

#### A layer's other resources (U7)

⚖ user, 2026-09-19: *"Some layers have more than one resource whose quantity is only reported in that layer's
panel. For example, the generators layer has 'generators' and 'generator power'. Is there a way we can detect what
resources are on each layer and display them all in the Layers view?"*

**It is a broad feature, not a one-game curiosity.** A static census over every tracked `games/**/*.js`, parsing each
`startData() { … }` body for `<key>: new Decimal(` outside the engine's own key set, finds **463 of the 2,260
startData blocks carrying at least one extra Decimal key — 1,753 (layer, key) pairs across 93 of the 171 games**
(`tools/census-figures.mjs`, subtree scope, brace-matched).

⚠ **Re-measured, and three of those four numbers moved.** The brief this slice was written from quoted 450 / 1,713
/ 91 against the same 2,260 blocks. The block count agrees exactly; the rest is the ENGINE KEY SET and the exact
spacing the pattern allows, and the census here states both so the figure is reproducible rather than remembered.

⛔ **Detection is easy; CLASSIFICATION is the whole problem.** Those keys split into genuine resources (`power` ×92,
`energy` ×22, `souls`, `thoughts`, `hexes`, the dusts) and pure bookkeeping (`unlockOrder`, `setBuyableAmount`,
`autoTime`, `prevH`, `target`, `cost`, `spent`, `buildLim`). Two discriminators were measured:

| discriminator | matches | verdict |
|---|---|---|
| used as a `currencyInternalName` somewhere | 136 / 1,713 | ⛔ **rejected** — misses ~92% of the real ones, `power` included |
| the layer SHOWS it to the player | — | ✅ the signal, and the user's own phrasing |

⚠ **The static form of the second one over-counts and is not what shipped.** `format(….key)` anywhere in a file
matches every layer's `power` in that file. The list asks it at RUNTIME instead: it evaluates the layer's own
display text and keeps a candidate only when THIS value is stated in it.

⚠ **The text comes from the DECLARATION, not from `tmp`.** `updateTempData` skips every key whose name carries
"display", "description" or "tabformat" unless that layer's tab is the open one, so a closed layer's
`tmp[l].tabFormat` still holds `setupTemp`'s `new Decimal(1)` placeholder wherever its display data was a function.
The declaration is the only place those functions survive, so `collectText` walks it — a second, smaller walk than
`layoutOf`, answering a different question.

⛔ **AN OCCURRENCE BUDGET, not a bare "is this number in the text".** MEASURED on `the-infinity-tree` at a fresh
save, where every amount on every layer is `0.00`: the bare membership test reported **23 resources over 9 cards, 21
of them sharing a value**, and what it admitted was `resetting`, `buyableSpent`, `timeSpent`, `lastElectron`,
`electronGain` — the whole of the bookkeeping the discriminator exists to exclude. One `0.00` in "You have 0.00
energy" cannot be evidence for six keys. So each statement of a number is **consumed** by whoever claims it, the
engine's own `points` / `best` / `total` / `spentOnBuyables` claim first (a layer's text routinely states them
itself — "Your best Generators is 0"), and candidates take what is left in `player[l]`'s key order.

| game / state | candidates | shown, bare test | shown, budget |
|---|---|---|---|
| `ptr` at `all/M16` | 5 | 4 (`g.power`, `t.energy`, `q.energy`, `q.time`) | **2** (`t.energy` 6.29e28, `q.energy` 2,011) |
| `the-infinity-tree` fresh | 32 | 23 over 9 cards, 21 colliding | **0** |

✅ **What the budget buys**: `q.time` is a bookkeeping Decimal that happens to hold exactly `q.energy`'s 2,011, and
the bare test both admitted it and gave it `energy`'s own prose label.
⚠ **What it costs, stated rather than buried**: a layer whose readouts are ALL the same number can attribute none
of them. `ptr`'s `g` at M16 has `points`, `best`, `total` and `power` all at `0`, so **Generator Power — the user's
own example — is not reported at that state**. It is at every state where the numbers differ. That is an abstention
the text genuinely cannot resolve, not a rule that can be tightened out of it.

⚖ **THE LABEL IS THE PLAYER KEY — SETTLED (user, 2026-09-19: *"Yes, let's use the player key."*).** `power` is
certain and terse; "generator power" lives only in the words around the number. The gate lifts those words and
REPORTS them without rendering them — that reporting is what put a sample in front of the decision, and it STAYS as
the evidence for the ruling rather than as a pending question. On `ptr` at M16 the lift reads
`t.energy → Time Energy` and `q.energy → Quirk Energy` — both right; **under the bare test it also produced
`q.time → Quirk Energy`, which is wrong**, and on `the-infinity-tree` it produced `i.time → number`,
`v.resetting → time` and `d.relativity → velocity`, which are the words of the NEXT sentence. ⛔ No per-game name
table either way: ⚖ MINIMIZE HARDCODING.

⚠ **Two resources can still print the same number** where the layer states it twice; both are kept (the card is
reporting quantities and both are right) and the attribution between them is by key order alone. The gate counts it.

**Over the roster, RE-MEASURED at `1c9a6a0e5`** (CI run 35517664193, 171/171, 0 RED, `ptr` at `all/M22` = **30,618** ticks): **276 candidate Decimals, 15 DETECTED rows on 9 cards across 9 games**, 8 of them sharing a value
with a sibling. ⚠ **THIS FIGURE MOVES WITH THE FIXTURES AND NOTHING PINS IT.** It was `16 shown on 10 cards` when
U7 measured it, at a tree where `ptr`'s deepest recorded snapshot was `all/M16` (16,048 ticks). R2 re-cut the
defaults and added M17–M20 and M22, and `deepestSnapshot()` selects by TICKS, so the sweep now reads `ptr` at
`all/M22` (29,204) — where `t.energy` no longer attributes and `ptr` contributes ONE row instead of two. Re-measured
from CI's own merged artifact at `7aa5ef5e4` (run 35498862194, 171/171, 0 RED). `resCandidates` and `resCollide`
did not move. ⚠ **The yield is low BY CONSTRUCTION**: 169 of the 171 games are swept at a FRESH save, where
every amount on every layer is zero and the text cannot attribute any of them — `the-infinity-tree` alone
contributes 32 candidates and shows none. The two games with recorded deep snapshots are where the feature has
anything to report.

⚠ **AND THE THIRD RE-MEASUREMENT FOUND IT HAD NOT MOVED.** `all/M22` was regenerated again by V4b (29,204 → **30,618** ticks, `player.h.unlocked` now true). The DETECTED figure is **15 rows on 9 cards across 9 games at both** — unchanged. Only `resCandidates` moved, 274 → 276. That is a result worth keeping: the sentence was re-measured because the selector had moved, not because the number had, and finding it unmoved is the only way to know which. ⛔ The figure that DID change is a different one — the roster total `resShown` is now **167**, because U9's DECLARED rows are counted as resources too. Quote the split, never the total:

| | rows | cards | games |
|---|---|---|---|
| DETECTED (U7/U8, the occurrence budget) | **15** | 9 | 9 |
| DECLARED (U9, the global currency) | **152** | 152 | 143 |

⚠ A declared row is **one per card by construction** (one per layer), so 0 cards carry two. The `all vs one` question the user has open is about a GAME showing several such CARDS: **6 games do at these states**, against 28 that could by the static census.

⚖ **And the roster is what the label question WAS decided on.** The gate lifts the adjacent words and
reports them; over all 171 games the lift produced **2 right out of 13**: `ptr t.energy → Time Energy` and
`ptr q.energy → Quirk Energy` are exactly right, `the-cultree`'s **six** stat keys (`sta`, `str`, `spd`, `int`,
`wis`, `lck`) all lift the SAME wrong word `STR`, `the-element-tree`'s multipliers and `the-prestige-tree`'s
`exponent` lift `x`, and `the-dressy-tree`'s `clicky` lifts `per click`.

#### A resource row, once shown, STAYS shown (U8)

⚖ user, 2026-09-19: *"In Layers view, I want to change it so that after the first time the UI row for a secondary
currency for a layer is displayed, it doesn't get hidden after a reset. That change would reduce layout shifting
during resets."* — the same complaint U2c's digit reservation answers, with a different cause.

**The cause is STRUCTURAL, not a matcher bug.** A row exists only while the occurrence budget above still has an
unclaimed statement of the value, and the engine's own `points` / `best` / `total` claim FIRST. At a reset all of
them and the candidate are zero, the engine's zeros consume every `0` the layer prints, every candidate comes back
unattributed and the row disappears. REPRODUCED on `ptr` at M16: `doReset('q', true)` — `q`'s row is above `t`'s,
so it is the call that resets `t` — takes `t.energy` 6.29e28 → 0, and the card's resource row vanishes; the layer's
text then reads *"You have 0 Time Energy … Your best Time Capsules is 0"*, whose two zeros both go to engine
readouts.

✅ **Remembering it is sound, and it claims nothing about the value.** The VALUE never depended on the text: the
candidate keys come straight off `player[layer]` and are readable at every state — only DETECTION consults prose.
So what is remembered is *this key is a resource on this layer*, a fact about the LAYER rather than about the
moment, and a remembered row renders the CURRENT number. Nothing is extrapolated and no stale string is shown; the
gate asserts exactly that (leg O below).

**Three decisions, with what each one measured.**

| decision | what shipped | measured |
|---|---|---|
| the string's SOURCE | **our own `format` for EVERY row**, attributed or remembered | over the roster's 16 resource rows, `format` changes **3** strings (`the-dressy-tree Mi.clicky`, `the-danus-tree p.progress`, `the-rainbow-void-tree p.clickingMult`, all `1` → `1.00`); `formatWhole` would change **10** |
| what gets remembered | only a key shown with **`collide === false`** | **8** of the 16 rows share a value with a sibling — `the-cultree`'s six stat keys and `the-element-tree`'s two multipliers — and none of them is remembered |
| where it is kept | `storage.raw`, key **`tmt-loader:<id>:ui.layerlist.resources`** | the write moves no game state; a cleared save forgets the set, which is correct |

⚠ **Why the string had to change source at all.** Until U8 a row printed the OCCURRENCE IT CLAIMED — the GAME's
own rendering, lifted out of the prose. A remembered row has claimed nothing and must format the value itself, and
the two formatters disagree for a non-zero value under 1,000 (`format` → `12.00`, `formatWhole` → `12`). A row that
printed the claimed string while attributed and ours while not would change its own string **at the instant of the
reset** — the layout shift this item exists to remove, reintroduced at the only moment that matters. So one
formatter for both, and `format` rather than `formatWhole` because a resource is an arbitrary Decimal and
`formatWhole` ROUNDS a fractional one (12.5 → `13`), which is a wrong number rather than a differently-spelled one.

⛔ **An ambiguous attribution is never made permanent.** `collide` says two keys claimed the same printed number,
and which of them got the prose is decided by `player[layer]` key order ALONE. A collided row still renders — both
quantities are right — but it is NOT written to the store, because freezing one coin-flip forever is worse than the
flicker this fixes. On `the-cultree` the filter withholds all six of `k.sta`, `k.str`, `k.spd`, `k.int`, `k.wis`,
`k.lck`, which are the same six the U7 label census found lifting the same wrong word.

⚠ **The store is the loader's namespace, never `player`.** A per-layer key set inside `player` would move every
pinned `hashGame` and put a UI preference into the save. It follows `ui.layerlist.expanded`'s pattern exactly,
every read and write wrapped (storage throws, and comes back empty in a private window), and it is inside what
"clear this game's save" clears — a cleared game comes back having forgotten which rows it had shown, which is
what a first load does too.

⚠ **What the roster sees is almost nothing, and that is the point.** At the states the sweep drives, **0** rows
are standing on the memory: every game boots with an empty store and the same render that shows a row is the one
that records it. The feature only shows after a RESET, which is why the gate has to drive one (leg O).

#### The global currency on a first-row card (U9)

⚖ user, 2026-09-20: *"Points should be displayed as a secondary currency in the first layer, at least in ptr. Is
there a clean rule that would do that?"*

**Yes, and the ENGINE declares it.** U7's `resourcesOf` enumerates `player[layer]` keys only, so the GLOBAL
`player.points` can never be one of them — that is the whole reason it was missing, and why this needs a rule and
not a wider filter. A layer's `baseAmount` is the thing it resets **for**; where its source reads the global
`player.points`, the global currency IS that layer's base currency.

⛔ **READ AS SOURCE, NEVER AS A VALUE.** Comparing `tmp[layer].baseAmount` with `player.points` for equality
reported **6 layers on `ptr` and ZERO on `something` and `the-point-tree`** — an artefact of a fresh save where
the numbers happen to coincide or happen not to, and backwards on two of the three. The source read is
value-independent and says the same thing at every state. (It is U7's everything-is-zero-at-a-fresh-save trap
wearing a different hat.)

⛔ **COMMENTS OUT FIRST, and that is MEASURED.** `gooby-cat-tree`'s `p` and `Fr` both carry a commented-out
`//return player.points` under the line that actually runs (`player[this.layer].buyables[11]`), and a raw source
test admits both — 488 layers instead of 486, and one game credited with a currency it does not use. The stripper
replaces a comment with a SPACE, so it can only remove a match and never splice one together. ⚠ It is a stripper,
not a tokenizer: a `//` inside a string literal would be cut too, and the failure mode of that is a row that does
not appear, never a row that appears with the wrong number.

⚠ **`player[...]` IS NOT THE GLOBAL.** `player[this.layer].points` and `player.p.points` are a LAYER's currency;
the boundary before `player` is what also keeps `xplayer.points` and `foo.player.points` out.

**Measured over all 171 games**, at `3346da419`, by `node tools/census-basecurrency.mjs` — which boots each game
and reads `layers[l].baseAmount.toString()` off the live object, applying the SAME two rules the list applies.
⚠ A RUNTIME census on purpose: a layer's declaration reaches `layers[l]` through `addLayer(...)` and through
whatever the mod does to it at load, so the live object is the only place to see what the list will see.

| | |
|---|---|
| layers | **2,513** |
| declaring the GLOBAL `player.points` as their base | **486** (488 before the comment strip) |
| — of those, on a NUMERIC row 0 | **192**, across **146 of 171 games** |
| games with exactly ONE such row-0 layer | **118** |
| with 2 / 3 / 4 / 5 / 8 | 18 / 7 / 1 / 1 / 1 |
| with none | **25** |
| row-0 declarers already `layerShown` at a fresh save | **152** |

⚠ **Restricted to a NUMERIC row 0**: TMT also has `side` layers and `row` is not always a number — 23 of the 486
declarers sit on a non-numeric row (`side` ×18) or on a row that is not 0 (`-10` ×2, `11`, `1`, one `undefined`).
The row is read through `rowOf()`, the same reader `groups()` places the cards with, so the row a card SITS in and
the row this rule asks about cannot drift apart.

⚖ **ROW 0 ONLY, and ON EVERY ROW-0 LAYER THAT DECLARES IT — the second half is open for the user.** Row 0 is what
makes this "the first layer", and it gives exactly one card on 118 games — `ptr`'s `p`, `something`'s `unlock`,
`the-point-tree`'s `basic`, `the-modding-tree`'s `p`. But **28 games have 2–8 row-0 layers sharing the global
currency** (`the-dressy-tree` 8, `the-chronicle-tree` 5, `the-function-of-time-tree` 4), and the same number then
appears on several cards at once. Showing it on all of them is TRUE on each; showing it on one would be tidier and
arbitrary. **All of them is what ships**, the count is reported here, and the user rules.

⚖ **THE LABEL IS `baseResource`, AND THAT DOES NOT REOPEN U7's RULING.** U7 ships the player KEY as a row's label
*because a name lifted out of the surrounding prose was right 2 times in 13*. `baseResource` is not lifted: it is
a field the game's author wrote to name this very quantity. Authored, so it is used — and authored, so it is used
VERBATIM. Over the 486 declarers the labels are `points` 205, `Points` 44, `Knowledge` 10, `spacetime` 9, **`TBD`
7**, `Fragments` 6, `corpses` 6, `fabric` 6. ⚠ **`TBD` is `the-snake-tree`'s own placeholder** (2 of its 7 are on
row 0). We render it as it stands, which is honest and looks like a bug; ⚖ MINIMIZE HARDCODING rules out a name
table, and this is reported rather than special-cased.

**It is not a second code path.** The row is produced by `resourcesOf` itself, ships in the same list, and is drawn
and synced by the same `drawResources` / `syncResources`; it carries `collide` and `sticky` like every other row,
and the U7/U8 rules apply to it unchanged:

- it **claims its occurrence BEFORE any candidate**, exactly as the engine's own `points` / `best` / `total` do —
  otherwise a `player[layer]` key holding the same number would take the global's own statement out of the prose
  and the card would print the global's value under a bookkeeping key's name;
- `collide` still records when two rows claimed the same printed number;
- `sticky` is always **false** and the key is **not** written to the remembered set. U8's memory exists to keep a
  row that would otherwise VANISH, and a DECLARED row cannot: the declaration does not depend on what the layer's
  prose states this tick. The flag is carried so that every row in the list answers the same questions.

Its key is `@points`, `@`-prefixed the way `currencyKey`'s own globals are, so no `player[layer]` key can collide
with it; `data-global="yes"` marks it in the DOM. ⚠ **Reported, never styled** — the `sticky` flag's own rule: a
row the player reads must not change appearance because of where the list learned about it.

#### A buyable chip says how many you own (U10)

⚖ user, 2026-09-20: *"In both expanded view and collapsed view, the Layers view should show the number purchased
in each chip for the buyables."*

**ONE STRING, TWO VIEWS.** Since U6 one chip object backs two controls — the expanded view's chip and the
collapsed card's action button — and both now take their text from the same call (`drawChipText`). That is not
tidiness: U8 had to make the reset text one source for the same reason, because a control that reads one way
expanded and another collapsed changes at the instant of the transition, which is the moment a finger is on it.

**WHAT IT RENDERS.** The short name stays its own box (`.tmt-layerlist-chip-name`) and the amount is a second
one (`.tmt-layerlist-chip-n`), with the `×` supplied by CSS. ⚠ **They cannot be one run of text**: the short name
can itself END IN A DIGIT — `nameChips` answers a collision with one, and `falling-mountain-s-alterprestige`
really produces `N28` — so `N28` + `3` concatenated would be genuinely ambiguous. The control also carries the
formatted number on `data-count` (the machine-readable value, and the memo that stops the DOM being written when
the number has not moved) and on its `title`, which keeps U2e's rule — *the tooltip's first line IS the element's
own `title`* — true rather than merely intended.

**THE READER IS THE COUNTERS' OWN**, `ownedAmount('buyables', …)` → the engine's `getBuyableAmount`.
⛔ **That is not the same as `player[layer].buyables[id]`**, and the census is why it matters — over the 171 at
`934dc41dc`: **165** define the accessor as exactly that read, **3** return `unl(layer) ? player[layer].buyables[id] : 0`
(`ptr`, `prestige-tree-ng`, `the-extended-tree`) and **1** wraps it in `new Decimal`
(`universal-reconstruction`). The accessor is what the engine's own buttons read, so it is what the chip reads.
⚠ **A buyable at zero keeps its `×0`** — `ownedAmount` deliberately keeps a buyable's box at zero where a
clickable only counts above zero, and that asymmetry is the engines' (2.2.1 starts a clickable at `Decimal(0)`,
2.7 at `""`). Hiding the number at zero would be the one reading that is not honest: the chip is there either
way. The formatting is the engine's `formatWhole`, and every path that reaches it is already inside
`withoutRaisingNaN`, so a NaN cannot leave `player.hasNaN` raised. The list still writes **nothing** to `player`.

**THE WIDTH IS RESERVED — ⚖ U2c, and this is a width change.** The amount box carries `min-width` in `ch`
(a fixed digit column, because the panel is `tabular-nums`), written per CARD by `layerlist.js` and **only ever
grown**, which is the rule `syncCounters` has kept for an accumulating total since U2d.

⚠ **THE SIGN IS OUTSIDE THE RESERVED BOX, and the first build got this wrong.** `ch` is a DIGIT column and the
`×` is not a digit — measured at 13 px, a digit is 7.83 px and the `×` is 8.5 — so a `2ch` reservation written
across the whole `×36` reserved 15.7 px for a 24.1 px string and the chip grew with the number anyway
(`ptr`/`s`: 61.67 px at `×0` against 69.5 at `×36`). The sign is constant, so it is the container's `::before`
on an inline-flex box and only the digits are reserved. Measured after: the count box is **24.11 px at `×0` and
24.13 at `×36`**, and the chip 69.48 against 69.50.

**THE DISTRIBUTION, AND THE WORST CASE.** Measured over all 171 games at the states the sweep drives (each
game's deepest recorded snapshot where it has one, a fresh save otherwise), ⚠ **at `934dc41dc` — and
`deepestSnapshot()` selects by TICKS, so another arc adding a snapshot re-points these figures**:

| | |
|---|---|
| games drawing any buyable chip | **17 of 171** — the other 154 abstain |
| buyable chips in total | **56** |
| rendered width | **1 character ×53, 2 characters ×3** (all three on `ptr`/`s` at `M22`) |
| the two readers disagreeing | **0 of 56** |

So the floor is **2 digit columns**: nothing on the roster can widen a chip at all. ⛔ **It is a floor and not a
cap, deliberately.** A buyable amount has no bound and `formatWhole` reaches **eleven** characters at the
magnitudes a TMT save really reaches (`1.111e3,284`, the widest this arc has measured) — reserving eleven
columns on a 44 px chip would cost every game the density of its chip row for a width almost no card will ever
want. Past the floor the box grows once per order of magnitude and never gives the width back, which is exactly
the guarantee the user already accepted for the counter that holds the **buyables total** — a strictly larger and
faster-moving number on the same card. The gate measures the box over every reserved column and REPORTS the
first magnitude past it rather than asserting anything about it.

⚠ **AND THE MUTANT FOR THE READER IS VACUOUS WITHOUT A CONSTRUCTION.** 0 of 56 chips disagree, so swapping
`getBuyableAmount` for `player[layer].buyables[id]` reddens nothing on a roster pass. The gate therefore
CONSTRUCTS the disagreement on the three games whose accessor is not the direct read — it sets
`player[layer].unlocked = false`, which makes `unl(layer)` false — and abstains, naming the game, on the other
168. Measured on `ptr`/`s` buyable 11: the accessor goes to `0` while `player.s.buyables[11]` still says `36`,
the chip follows the accessor, and the construction restores.


#### Per-category progress in the expanded card (U7)

⚖ user, 2026-09-19: *"In Layers view, when a layer is in expanded view, can we add a row to display the progress
towards the next unearned item from each category … Is there a way to detect what the cheapest unearned item from
each category is? If not, then we can just pick the one whose chip is currently listed first."*

**"Cheapest" is well defined for some categories and has no referent in others.** What the engines declare:

| category | numeric target | |
|---|---|---|
| upgrades | `tmp[l].upgrades[id].cost` | ✅ comparable while the currency matches |
| buyables | `tmp[l].buyables[id].cost` | ✅ `tmp` holds it ALREADY EVALUATED at the current amount |
| challenges | `goal` | a goal, not a cost — comparable within one currency |
| milestones | — | `requirementDescription` is PROSE. No number exists. |
| achievements | — | the same |
| clickables | — | no cost concept |

⛔ **So a category with no number gets NO ROW.** "Progress" without a denominator is not a weaker row, it is a
different thing. The rule is **cheapest where a cost exists and the currencies agree, first-listed otherwise** —
which is the user's own stated fallback, so no ruling was needed to ship it. "The currencies agree" is asked on the
engine's own identity for a currency, because two costs in different currencies do not compare at all and the
numerically smaller of them would be an accident of scale. A `currencyLocation` is an object, so it is identified by
REFERENCE rather than by its key name.

⚠ **"Unearned" is not one predicate**, and it is `actionable()`'s rule read one level down (that one works on
CHIPS, which exist only for a component with a usable short name; a progress row does not need one). Upgrades: drawn
and not bought — and a PSEUDO teaser is not a thing you buy. Buyables: never "earned" at all, so the row means
"progress to the NEXT one", and one at its `purchaseLimit` is skipped rather than shown at 100%. Challenges: not
completed, active or not.

**The denominator and its currency are the TOOLTIP's**, not a second reader: the same `DETAIL` part, `numFieldOf`
and `currencyOf` the overlay composes its cost line out of. A buyable is the one category `DETAIL` carries no cost
part for — its own `display` already states the cost, so the overlay composes none — and the part declared for it
is in exactly the shape the other two use.

⚠ **`currencyAmount` is `canAffordPurchase` AND `canCompleteChallenge`, because the two engine functions
disagree.** The brief named only the first. An upgrade's and a buyable's fallback currency is `player[layer].points`;
a CHALLENGE's is the **global** `player.points` — which is what its own completion test reads, and a single reader
with one fallback would be wrong on every challenge whose layer has points of its own.

⚠ **`multiRes`** — a cost in several currencies at once, where `cost` itself is `undefined`, declared by `ptr`,
`prestige-tree-ng`, `prestige-tree-rewritten-unsoftcapped4` and `the-extended-tree`. A `x / y` row has no meaning
for one, so it is skipped and counted, never rendered as `undefined / undefined`.

⛔ **A limitation the brief did not anticipate, and half of it is undetectable.** `ptr`'s `s` buildings hand-roll
`canAfford()` and `buy()` against `player.g.power` and declare neither `currencyInternalName` nor
`currencyDisplayName`, so the engines' own generic reader — which is what this row uses — gives a numerator in
space energy against a cost in generator power. In every engine-GENERIC path affordability implies amount ≥ cost,
so "the engine says it CAN be bought and our amount is short" can only mean the wrong currency: **that row is
dropped and counted**. The converse is not a signal (a game's `canAfford` routinely ANDs a second condition), and
the case where the game simply cannot afford the item today is **not detectable at all** — `ptr`'s `s/13` ships as
`17 / 6.28e350 space energy` at the M16 snapshot and the number on the left is not the one the game spends. Whether
to keep those rows, or to drop every category whose components declare no currency at all, is the user's call.

⚠ **The rows sit UNDER the reset button and are styled to match its second half**, which is the per-LAYER progress
display; these are the per-category ones. Only categories the card DRAWS get one — `visibleSeq`, the same three
visibility rules the chips and counters are under — so a row cannot leak what those rules hide.

**Over the roster**: **248 progress rows on 243 cards** — 225 upgrades, 22 buyables, **and not one challenge**
at any state the sweep drives. ⚠ Same caveat as the resource figure above: this was `247 on 242` at U7's tree and
moved by one when `ptr`'s deepest snapshot became `all/M22`. Re-measured at `7aa5ef5e4`. The rule that chose them: `only` 123 (one candidate, where the two rules cannot
differ), `cheapest` 119 and **`first` 5** — the currencies-disagree fallback really fires, on `the-cultree`,
`the-dingus-tree`, `the-orchard-tree` and `collection-of-everything`. ⚖ The categories where cheapest and
first-listed pick **different** components number **8, on 6 games**; the wrong-currency guard fired **once**
(`the-energy-factory`'s `energy/buyables`). And the constraint item 2 puts at risk — the list writes nothing to
`player` — **held on all 171**, across five explicit full renders with the panel open.

**What it costs.** Both new readers ride the counters' own 250 ms throttle, so the FRAME path is unmoved
(`tools/harness/cost-layerlist.mjs`, 300 reps): the observer pass is 1.09 → 1.13 ms on `ptr`'s snapshot,
2.04 → 2.16 ms on `the-yes-tree` and 0.95 → 1.00 ms on `the-infinity-tree`. The full pass rises
2.13 → 4.64 ms (`ptr` snapshot, 11 cards), 3.43 → 6.01 ms (`the-yes-tree`, 25 cards) and 1.41 → 5.41 ms
(`the-infinity-tree`, 18 cards and 32 candidate keys): **+0.10 to +0.23 ms per card per sync, four times a second**.
The worst of them is item 2's, which calls the game's own display functions once per card per sync.

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

Since U3 each flag is ALSO reachable as a remembered preference, set from buttons in the game's own options tab
(docs/options.md). That changes nothing here: there is still no sniffing, the URL still answers first whenever it
says anything about a flag — `?mobile=0` over a remembered *on* as much as `?mobile=1` over a remembered *off* —
and a page with neither a parameter nor a preference is still inert. The gate's inertness leg below is re-asked,
against a stored preference as well as a parameter, by gate O1.

## Not in scope

The tooltip does not replace the browser's own: the `title` attributes stay, the overlay sits on top of them, and on
a pointer both can be on screen at once — one saying the name, the other the cost (U2e).

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
- **(U2b) the chip sequence equals the order the layer's tab layout implies** — rebuilt inside the probe out of
  `tmp[l].tabFormat`, with the same three visibility rules, and never asked of the list: a list compared against
  its own `chipsOf` would assert nothing;
- **(U2b) a divider at every category change and at neither end**, measured on what the browser RENDERS in BOTH
  states — collapsed and expanded — by reading each element's `getClientRects()` rather than the classes the list
  wrote. The card's expanded class is toggled directly rather than clicked, because a click is not a neutral probe
  and the expander's handler does nothing else. ⚠ U2d changed that test from computed `display`: see below;
- **(U2b, hardened by U2d) a milestone chip's computed `border-radius` is `0` and an upgrade chip's is not**,
  where the page has both (abstained where it has only one kind);
- **(U2d) the collapsed card's two rows** — the counters, the buttons, the fit, and that the two states differ.
  The whole of it is in "What U2d added to the leg", below;
- **(U2e) the tooltip is strictly richer than the element's own `title`** — cost or effect text the `title` does
  not state, with the witnesses read out of the engine in the probe; plus the tap path, the hover path, one overlay
  at a time, a constructed NaN cost and a constructed cost move under an open tooltip. "What U2e added to the leg";
- **(U2c) the boxes do not answer to the digits, and the cards you left open come back** — the readout's own
  string written in at each magnitude with nothing in the game touched, and a card CHANGED before a read-back on a
  second page with a second card left closed as the control. Both at both widths; "What U2c added to the leg";
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

⚠ **The two discriminators (U2b).** A visibility filter that removes nothing and a sort that changes nothing both
sail through an assertion built the same way as the thing it tests, so the leg also holds the two reference games
to a RECORDED baseline (`U2_CHIPS` in `page.mjs`):

- the chip count must have **fallen** against U2's — `ptr` 120 → **83**, `something` 70 → **30** — and it falls
  even though U2b *adds* the milestones (24 of `ptr`'s 83 and 5 of `something`'s 30 are milestone chips), which is
  the stronger statement;
- at least one card's sequence must **differ from source order** — 6 of `ptr`'s 7 chip-bearing cards do, and 1 of
  `something`'s 3.

Both are measured on the phone page, over the deepest recorded snapshot. Across the whole roster the leg also
reports the `tabFormat` shape split, the milestone and divider counts, and how many cards are off source order.

U2's named gap — "the leg never presses a card's `+N` button, so the EXPANDED chip row is not measured" — is
**closed**: both states are now rendered and read.

⚠ **One rule the leg cannot exercise, said out loud: visibility rule 2.** No game on the roster has a
pseudo-unlocked upgrade *drawn* at any recorded snapshot state — four games define the global (`ptr`,
`prestige-tree-ng`, `prestige-tree-rewritten-unsoftcapped4`, `the-extended-tree`) and every one of their
`pseudoUnl` conditions needs progress no snapshot reaches (`ptr`'s want `hasUpgrade("hn", 11)` or
`player.i.buyables[12].gte(1)`). So the sweep prints the count of pseudo chips it saw — **0 over 171 games** — and
says the rule is unexercised, rather than passing in silence.

So the leg **constructs** both conditions instead, on the phone page, after the reset press, and re-runs the
probe's own expectation under each: `msDisplay` set to `'never'` (on `player` AND on `options`), and the engine's
`pseudoUnl` replaced with one that always says yes. Measured over the roster: the milestones vanished on the **55**
games that have a milestone chip and the leg abstained on the other 116; pseudo chips appeared on exactly the **4**
games whose engine defines the global, and the leg abstained on 167. Every game restored its own state.

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

**Eight more mutants for U2b**, each RED, each restored, with the control GREEN either side:

| # | the mutant | seen on | how it reds |
|---|---|---|---|
| A | the engine default used even where a `tabFormat` exists | `the-elemental-tree`, `the-point-tree` | chip sequence ≠ the derived order |
| B | the object form's inactive subtabs treated as visible | `the-point-tree` | a milestone from an inactive subtab appears (`a/milestones/1` against an empty expectation) |
| C | `pseudoUnl` ignored | `ptr` | the constructed rule probe: `SEQUENCE DISAGREES` |
| D | milestones given round corners | `ptr` | `radiusOk` false — `6px` both |
| E | a divider at each end as well | `ptr` | `dividerOk` false, in both rendered states |
| F | the `rows`/`cols` grid bound removed | `ptr` | a chip for a buyable outside `s`'s own grid, at the desktop state |
| G | the engines' `unlocked` render condition ignored | `ptr` | 145 chips against U2's 120 — the count **did not fall** — plus sequence and both rules |
| H | `milestoneShown` ignored | `ptr` | the constructed rule probe: `SEQUENCE DISAGREES` |

⚠ **A is GREEN on `ptr`, on `something`, on `the-algebra-tree` and on `the-game-tree`.** The reference games'
`tabFormat`s happen to name their categories in the engine default's own order, and `the-algebra-tree` reorders
them but draws no milestone at its snapshot state — so on all four, "use the default" and "read the tabFormat"
produce the same chips. Finding a game that could see it took a roster scan, not a guess.

⚠ **One mutant hid itself before it was fixed.** C's first version of the rule probe asserted "the chips moved
when `pseudoUnl` was forced true"; the mutant that removes the rule made the chips not move, which the probe read
as an **abstention** and passed. The probe now re-runs the independent expectation under the constructed
condition, so a list that stops asking the engine does not merely stop changing — it DISAGREES.


#### What U2d added to the leg

Six more assertions at **both** widths, every expectation rebuilt inside the probe out of `tmp` / `player` and
none of it asked of the list:

- **the counters are the engine's own answer** — one per category the tab draws, in the tab layout's order, `x/y`
  for the ones you finish and the total owned for the ones you accumulate;
- **the button set is unlocked-and-not-yet-bought**, rebuilt the same way. ⚠ This is the check that catches a
  build selecting on affordability, and it catches it without waiting for anything to move;
- **the two rows are genuinely two**: no counter shares a line with a button. Measured on the **elements**, not on
  the two container boxes — a build that dropped the buttons into the counters' own row would leave an empty
  `.tmt-layerlist-actions` behind and a container test would abstain on it rather than fail. ⚠ Judged only where
  the card has something in both rows, and the cards that would look *wrong* under a single-row build (**two or
  more counters and two or more buttons**) are named at every run: `ptr/s`, `something/primitive`,
  `the-unbalanced-tree/inf`, `/e`, `/r`, `a-game-about-rocks/s`, `the-melge-tree/i` — which are, not by accident,
  the same cards U2b measured hiding a whole category behind the `+N`;
- **what fits is measured**: the visible buttons are a prefix of the offer, they are all on one line, and nothing
  — counter or button — sticks out past the card;
- **the collapsed card and the expanded one render differently**. ⚠ The visibility test for this and for the
  dividers is now `getClientRects()`, not computed `display`: the collapsed card hides the whole chip **row**, and
  a child of a `display: none` parent still reports its own computed display — so the old test said the collapsed
  card was rendering every chip it was in fact hiding;
- **the milestone counter's corners are square and the rest round.** ⚠ Not "they differ" — the same hardening was
  applied to U2b's chip check, because a build that **swapped** the two differs just as well. U2b's mutant D made
  them the same, which is why the weaker test held up then.

And four legs that have to drive something:

| leg | what it does | what it says when it cannot |
|---|---|---|
| fit at two widths | resizes **this** page 390 → 1280 → 390 and compares the per-card button counts | abstains, naming the game, when no card offers more buttons than the phone row already holds (`ptr`) |
| the set against affordability | ticks in rounds of 250 until the lit/grey vector moves, then demands the **set** did not — per card, and skipping a card whose independent expectation moved for a real reason | abstains when affordability did not move in 1000 ticks |
| the throttle | mutates `#app` once per animation frame, twelve times, and counts the syncs the list actually did | abstains if the observer fired fewer than three times |
| a counter's `x` moves | presses a lit upgrade **button on the card** and reads the counter's `x` back, parsed — never the string | abstains, naming the game, when nothing is affordable (`ptr`) |

⚠ The two-width leg resizes one page rather than comparing the phone page against the desktop one from leg 5.
Those are two browsing contexts at two different game states — MEASURED on `ptr`, 83 chips on the phone against 89
on the desktop page — so a button count taken from each would be comparing states as much as widths. It is also
the resize the requirement is actually about.

⚠ **Two more constructed conditions join `msDisplay` and `pseudoUnl`.**

- **A clickable that holds an amount.** Every clickable on the roster sits at its engine's own starting value, so
  the rule that decides which clickables get a counter is exercised by no recorded state. The leg gives one drawn
  clickable a positive amount, looks for the box, and puts the value back — and checks there was **no** box at the
  engine's own zero, which is the half the user's ruling is about.
- **A buyable holding 1e400.** ⚠ This one exists because it caught a real defect *after* the whole bounded set was
  green. "Is this value an amount?" was first asked as `isFinite(v.toNumber())`, which is **false for any Decimal
  past 1.8e308** — and a TMT save reaches there routinely (`ptr`'s own points read 6.7e3284 at the gate's own
  snapshot). No recorded state has a *buyable* up there, so every game on the roster would have stayed green while
  a real buyable was dropped out of its own total, silently, on exactly the saves where the number matters most.
  The question is about the **type**, not the magnitude, in both implementations now; the leg gives one drawn
  buyable 1e400 and the box has to survive.

**Nine mutants for U2d** (eight constructed, one the roster's own), each RED, each restored, with the control
GREEN either side — and deliberately not all
on the reference game, because `ptr` abstains on two of the four driving legs:

| # | the mutant | seen on | how it reds |
|---|---|---|---|
| A | affordability used for SELECTION, not just styling | `something` | the button set disagrees with the expectation (every row empty), **and** the set moves as the ticks make things affordable |
| B | the fit taken from a constant 6 instead of the row's width | `the-unbalanced-tree` | `NO CARD HELD MORE AT 1280` — 6 buttons at both widths on four cards offering 10, 15, 22 and 10 |
| C | the counters' square and round corners swapped | `ptr` | milestone counter radius `6px`, the rest `0px` |
| C2 | the **chips'** corners swapped (U2b's own check, hardened here) | `ptr` | milestone chip radius `6px`, the rest `0px` — GREEN under the old "they differ" test |
| D | the counters left unthrottled | `ptr` | `NOT THROTTLED`: 12 syncs over 12 refreshes where the cap is 2 |
| E | a buyable counter rendered as `x/y` | `ptr` | the counters disagree with the expectation on `t`, `e`, `s` and `q` |
| F | the two rows collapsed into one | `the-unbalanced-tree` | no card passes "no counter shares a line with a button", on the two discriminating cards `inf` and `r` |
| G | "is it an amount?" asked as `isFinite(toNumber())` again | `ptr` | `THE BOX VANISHED AT 1e400` — the defect above, which nothing on the roster could see |
| H | `buyUpgrade` called unconditionally, as U2 wrote it | `the-modding-tree` | `counter=NOT MOVED`, `0/1 → 0/1` — and this one was not a constructed mutant at all: it is the state the first CI sweep of this slice measured, on the one game of the 171 that both lacks the alias and has something affordable |

⚠ **Mutant A's first version was caught by ONE of the two checks, not both.** The temporal leg read GREEN, because
a build that selects on affordability starts with an empty row — so its lit/grey vector never moves, and the leg
abstained on exactly the defect it exists for. It skipped any card that had no buttons *before* the ticks; it now
skips only a card that has nothing to say either side, and the mutant reds on both checks. It is the
change-detector abstention, and it took a mutant to find.

⚠ **Mutant F's first version was RED for the wrong reason** and would have been recorded as a pass. Moving the
actions box inside the counters box at build time put it there *before* `drawCounters` cleared that box, so the
buttons ended up detached and the card rendered none at all — a red on the set check, not on the two-row one. The
mutant now moves the box after both rows are drawn, and reds on `two rows in 0/1` as it should.

One property the leg does NOT discriminate, said out loud: **phase 1 of the chip rule**. Removing the token
extension leaves phase 2 to number the collisions (`INM`, `INM2`, `INM3` instead of `INM`, `INMI`, `INMII`), which
is uglier but still unique — so the gate stays green. Phase 1 is a quality property, not a correctness one.

#### What U2c added to the leg

Two more legs, both at **both** widths, both run on the phone page after the constructed conditions have been put
back — they are the last things done there, because one of them loads a second page and the other writes into the
list's own DOM.

**The digits leg.** The probe writes each magnitude into `.tmt-layerlist-amount` **itself** and measures the card,
the meta column, the name and the amount; then it does the same to U2d's counters with a *shorter* value and with
one the same length in wider glyphs. Nothing in the game is touched, which is the point: the layer set, the
counters, the buttons and the chips are held exactly still while the only thing that moves is the string. Every
readout is put back and `restored` is what says it was.

⚠ **Why not "compare the fresh load against the deep one", which is the obvious reading of the requirement.**
MEASURED: `ptr`'s fresh save has **2 cards** against the deep save's **11**, and of the two only `p` carries an
amount at all (`0` → `3.93e541`) — whose meta column is sized by the resource NAME, 117.41 px, wider than either
number. So that comparison **does not move even on the unfixed build**, while the two loads differ in card count,
counter rows and button rows for reasons that have nothing to do with digits. It would have been a green that
proved nothing. The magnitudes the probe injects *are* the two loads' own — `0` is the fresh save's and
`9.88e3284` the deep snapshot's order of magnitude — applied to every card instead of to the one that happens to
exist at both.

**The persistence leg.** ⚠ **The discriminator is the control card.** A card is **changed** before the read-back
and a *second* card is left closed: asserting that a default-closed card is still closed passes with no
persistence at all. The state is set through `layerListUI.expand`, the chevron's own path, because a click is not
a neutral probe. The read-back is a **second page in the same context** rather than a reload of this one — same
origin, same `localStorage`, same save — so this page's own request record, which the load verdict judges, is left
as the leg found it. It asserts, at each width:

- the **first load was clean**: no key, and no card open, before anything is written;
- every key the write ADDED is inside `tmt-loader:<id>:`. ⚠ This is the mechanical form of "two games cannot share
  it": `localStorage` is per **origin** and every game is served from the same one, so the prefix is the only
  thing keeping them apart, and a key outside it is a key both games read;
- the **changed** card comes back open, with its chevron saying so, and the **control** card comes back closed;
- closing the restored card leaves its action row **measured** — a prefix of the offer, on one line. This is the
  defect persistence introduced (above), and it needs a card whose row the phone had to CUT, so the leg picks one
  where the game has one (`ptr` has none and that half is vacuous there; `something` and `the-unbalanced-tree`
  have one);
- and closing the last card **removes** the key rather than leaving an empty list behind.

⚠ **The read-back page boots on the SAVE, not on the page that wrote the preference — and the bounded local set
was structurally blind to it.** This page is 3,000 ticks, a reset press and a purchase past the save in
`localStorage`, because `?managed=1` pauses the autosave; so on a game with **no recorded snapshot** the second
page booted a *fresh* save and simply did not have the card. `ptr` and `something` are the two games that HAVE a
snapshot, whose `loadFrom` had already written it, so both were green locally while the first CI sweep of this leg
was **RED on 7 games**: `layer-tree`, `the-numbruh-tree`, `the-hyperdimensions-tree`,
`the-tearonq-i-have-no-creative-names`, `the-burning-tree`, `the-loop-tree`, `the-mana-tree` — every one of them
`present: false`, or a card drawn with nothing to expand. The leg now writes the game's own `save()` first, and
all seven are green.

⚠ **Where the leg runs is a measured choice, not the order it was written in.** It needs a card with an expander
to change, and a card only has one once its layer draws something — so run BEFORE the ticks and the reset press it
abstains on **five of the ten games this slice drove locally** and judges all ten after them. The cost of running late is that
the save it writes is a **mid-game** one, and one game cannot read its own: `the-broken-tree`'s `load()` dies with
`points is not defined` in its own `js/mod.js` from that state, although it boots the save it writes three ticks
in. That is the game's, not the mode's, so a read-back page whose **loader** reports an error abstains naming the
message. Two more abstentions guard the same edge: a card the read-back page does not draw, and a probe that
cannot reach the page at all.

⚠ **A probe on the read-back page may not throw the whole ROW.** When `the-broken-tree`'s page never reached
ready, one evaluate died on an undefined `layerListUI`, the row went to the catch as an exception, and it lost
`geometryOk`, `navOk` and its **load verdict** — results it had already earned, to a leg that runs after all of
them. Every read-back probe is wrapped now, and a failure is a verdict about the probe with the page's own
diagnosis attached (`ready`, `step`, `error`, the last `pageErrors`), never an erasure.

⚠ **A summary row that lied, found while driving these mutants.** A leg that THREW leaves its row absent, and the
first version of both new SUMMARY lines counted `rows.length` minus the reds it could SEE — so a build with no
`layerListUI.expand`, where the probe throws and the row goes to the catch as an exception, printed
`1/1 restored`. A row with no leg is now named as **never having run**. It is the same shape as the dead shard a
green checkmark hides, one level down.

**Six mutants**, each driven on `the-unbalanced-tree` — which has both a card whose action row the phone has to
cut and a resource name short enough for the readout to outgrow it — with the control GREEN either side:

| # | the mutant | how it reds |
|---|---|---|
| A | the amount's reserved width removed (the build this slice inherited) | digits: `i.meta[w] 62.63→71.66` at `1.11e10`, with `i.name`, `i.amount` and `info-tab.meta` beside it, at the phone width in the collapsed state |
| B | `tabular-nums` removed | ⚠ **GREEN** |
| C | `contain: layout` removed | ⚠ **GREEN** |
| D | the store written but never read back | persistence: `NOT RESTORED AFTER THE RELOAD` |
| E | the key built without the game's prefix | persistence: `THE KEY IS NOT THIS GAME'S` |
| F | no re-fit when a card built OPEN is closed | persistence: `THE REOPENED CARD'S ACTION ROW WAS NEVER MEASURED` — 10 buttons on two lines where 7 fit on one |

⚠ **Two of the six are GREEN, and they are recorded rather than quietly dropped.** B and C are real declarations
that this gate — and, as far as this slice could measure, any gate on this roster — cannot see: the engines' fonts
already default to tabular figures, so removing the request changes no width, and `contain: layout` changes no box
because nothing inside a card was escaping it. They are kept for the reasons in "The layout does not move as the
digits do" above, and the honest statement is that **the reservation is what the gate is holding**, not the other
two rules. A later slice that deletes either will see no red — which is exactly why the measurement is written
down here instead of being inferred from a green run.

**Over the roster** (the sweep at `ca3401b60`, 171/171 covered, 0 red): the digits leg reads *unchanged over
every magnitude, at both widths, in both states* on every game, over **995 amount readouts and 452 counters**; the
persistence leg restores on **157** and abstains on **14** — thirteen because no card on that game has an
expander at all, and `the-broken-tree` for the reason above. **17** games take a card whose action row the phone
had to cut, so the re-fit half is exercised on seventeen of them rather than inferred.

⚠ **The two persistence failures are named apart.** A card that came back closed and a card that came back open
with an unmeasured action row are different defects — the first is the persistence, the second is the fit pass the
persistence broke — and the first version of the verdict called both `NOT RESTORED`, which would have sent the
next reader to the wrong file. Driving F is what showed it.

#### What U2e added to the leg

⛔ **The obvious assertion is vacuous, and that is the design constraint.** U2d's `title` attributes mean a hover
already opened a tooltip on the build before this one, so "a tooltip appeared" would pass unchanged. Every claim
below is therefore about the overlay being **strictly richer** than the `title` it sits on, or about a path a
native `title` does not have at all.

Measured at **both** widths, over every control on every card — the counters and the action buttons on the
collapsed card, the chips on the expanded one, with the class toggled directly rather than clicked:

- **strictly richer than the element's own `title`.** The witnesses are read in the probe out of `tmp` / `layers` —
  the category's prose field and its number — and a witness the `title` **already contains** is dropped, because
  it could not tell this build from the native tooltip either way. `judged` is how many controls carry a witness
  the title omits, and `richer` how many of those the overlay states; a game where `judged` is 0 **abstains**.
  ⚠ Not a length comparison: `something`'s `primitive/milestones/1` reads "1: 10 Numbers" as its title and
  "x50 Points." as its detail — shorter, and a different fact. The substring test is what discriminates.
- **the first line IS the element's `title`**, character for character.
- **a declared `tooltip` field is shown wherever one is drawn** — and the cost and the effect are still there,
  which is what says the field is additive.
- **one overlay at a time**, and the previous anchor loses its `aria-describedby`. A build that appended one
  overlay per control would pass "a tooltip is open" and fail this.
- **nothing escapes the viewport.**

And three things a probe cannot fake, driven:

- **a real TAP on the phone page** opens the tooltip **and** still reaches the engine. The second half is observed
  by wrapping the engine's own `buyUpg` / `buyUpgrade` / `buyBuyable` / `startChallenge` in counters, not by looking
  for a purchase: affordability must not decide whether the leg can run, and an unaffordable buy is a no-op in the
  engine while the CALL is exactly what U1's no-`preventDefault` rule is about. ⚠ Whether a `window` assignment is
  even visible to the list — which reads those names as bare identifiers — is measured per game, and the leg says so
  rather than reading a `let`-declared engine as "the tap did not reach it".
- **a real HOVER on the desktop page**, which has no touch, so the tap path is off there: a pointer user who could
  not open a tooltip at all would be the regression. An action button by preference, a counter only if there is
  none — a counter's tooltip is its name and nothing more, so hovering one cannot show that the pointer path carries
  the richer text.
- **the tooltip is re-read while open**: the underlying `tmp` cost is moved and an explicit `refresh()` asked for,
  and the body must show the new number. Constructed, because nothing on a paused page moves on its own.

⚠ **And the NaN rule is CONSTRUCTED, because the roster does not reach it.** Measured across all **171 games**:
1,238 numbers formatted out of drawn chipped components (`cost`, `effect`, `goal`, `rewardEffect`), and **zero**
raise `player.hasNaN`. So `withoutRaisingNaN` around the composition would have been untested on every game on the
roster. The leg sets one drawn upgrade's `tmp` cost to a NaN `Decimal` — never `player` — with a **control** that
formatting it really does raise the flag on that engine, asserts the tooltip leaves the flag where it was, then sets
the flag itself and asserts the tooltip does **not** lower it. Ten games already carry `hasNaN === true` at their
load state, which is where that second half matters in the wild.

⚠ **A tooltip is refused on a control with no layout, and the gate found it.** The first version of the re-read
check grabbed a chip off a **collapsed** card: the chip row is `display: none` there, so the element had no box, the
overlay landed in the corner and the next sync closed it — `THE REFRESH CLOSED THE TOOLTIP`. `showTip` now refuses
such an element, and the constructed checks take a **rendered** anchor (the action button, else the chip with the
card expanded) and require the open to have succeeded — otherwise a pass would mean the probe had missed rather than
that the list had behaved.

⚠ **Two of the three RED rounds were the PROBE's own**, and both are the same family — reading a field the way the
engine does not:

- **named HTML entities.** `create-incremental`'s upgrade 24 declares `&times;`; the page shows `×`. The probe
  decoded only the numeric `&#NNN;` form and reported that game red for a difference entirely its own. It now
  decodes with the browser's own decoder (tags out with the regex first, then a `textarea`, whose content model is
  text so nothing is parsed as markup).
- **a `tmp` entry that is still the FUNCTION.** The engines evaluate a declaration into `tmp` only where it takes no
  argument; `1-clicker`'s buyable `display()` stays a function there and the engine calls it at render time with
  `this` set to the declaration. The probe took the `tmp` value as it found it and used the function's **source
  text** as its witness. (The implementation had the same hazard in its number reader and was hardened with it.)

⚠ **Ten mutants, each RED on the game that can see it**, with the control GREEN either side and the tree checked
clean after every restore. Each reds through exactly **one** of the new checks and leaves the other legs alone:

| # | the mutant | seen on | how it reds |
|---|---|---|---|
| A | the declared `tooltip` field IGNORED (composition only) | `1-clicker`, `create-incremental` | `A DECLARED tooltip FIELD IS NOT IN THE OVERLAY` — 0 of 10 and 0 of 6. ⚠ **GREEN on `ptr`**, which draws none |
| B | tags left UNSTRIPPED | `create-incremental`, `ptr` | `THE OVERLAY HOLDS THE GAME'S OWN MARKUP` — 3 overlays of 6 and of 13 markup-bearing controls |
| C | the NaN wrapper removed from the composition | `ptr` | the constructed NaN cost: `THE TOOLTIP RAISED player.hasNaN` |
| D1 | **`preventDefault()` added to the tap handler** | `ptr` | ⚠ **GREEN.** See below |
| D2 | `stopPropagation()` added to the tap handler | `ptr` | `THE TAP DID NOT REACH THE ENGINE` — the tooltip still opens, `buyBuyable` is never called |
| E | the tooltip re-read moved OFF the throttled path (once per frame) | `ptr` | `THE TOOLTIP IS NOT THROTTLED` — `tipSyncs` 6 against a cap of 2, while `syncs` stayed 0. ⚠ It reds the **throttle** leg and nothing else, which is why `tipSyncs` had to be added: the counters' own numbers do not move |
| F | an open tooltip never re-reads its text | `ptr` | `THE OPEN TOOLTIP DID NOT RE-READ THE COST` |
| G | the first line RECOMPOSED instead of read off the element's `title` | `ptr` | `THE FIRST LINE IS NOT THE ELEMENT'S OWN title` — a milestone chip's name is its `requirementDescription`, and there is no `title` field to recompose it from |
| H | the viewport clamp removed | `ptr` | `A TOOLTIP ESCAPED THE VIEWPORT` at 390 px, on 3 controls |
| I | `aria-describedby` left on the previous anchor | `ptr` | `THE FIRST IS STILL DESCRIBED` |

⚠ **D1 is the brief's own named mutant and it cannot discriminate — measured, not argued.** `preventDefault()` in
this handler is GREEN: it suppresses a default **action**, and a chip's buy is a click **listener**, which runs
regardless. What can swallow the control's click from a capture-phase handler is `stopPropagation()`, and D2 reds on
it. The leg's verdict says so rather than naming `preventDefault`, because the next reader would otherwise test the
wrong thing.

⚠ **A is GREEN on `ptr`, and `ptr` is the game the brief named for the composition path.** A battery run only on the
reference games would have called the `tooltip`-field half proven while it was blind to it — the fourth time in this
arc that a bounded set could not see a defect the roster can (U2d `buyUpgrade`, U2g `Decimal` and the picker, U2c the
persistence read-back).

⚠ **And a process defect, worth more than any single mutant.** The first attempt ran **two mutant harnesses on one
tree at once**: a background battery that had not died, plus a second started in the foreground. The contaminated
round printed an entirely plausible RED — the *tags* mutant reading `THE TOOLTIP RAISED player.hasNaN`, which it has
no path to — and both rounds had to be thrown away and the battery re-run serially. It is the same family as U2c's
`git checkout` accident and the tell was the same: **a mutant reddening a check it cannot reach.** What caught it
was the harness's own refusal to start on a dirty tree, firing when the *other* battery had a mutant applied. A
mutant harness needs a lock, or a single process; "I started it in the background" is not a guarantee that it ended.

#### What U4 added to the leg

Two verdicts per game, both in the layers leg and both summarised on one `M1 layers drift` line:

| verdict | what it means |
|---|---|
| `held while the height moved` | Δ `scrollTop` was 0 while Δ `scrollHeight` was not — the claim, judged |
| `THE LIST DRIFTED` | the offset followed the height; this is the defect |
| `abstains (the list is not scrollable at this width: N px of room)` | 127 of the 171 games; the number is printed so it is not mistaken for a pass |
| `abstains (the press did not move the content height)` | the real half only: the reset moved nothing to anchor against |

⚠ **The abstentions are the majority and the line says so**, because the whole risk here is a green that means
"nothing was measured". Over the roster (CI at `ccb0ed08a`) the constructed half judges **49** games and the real
press judges **3** — `ptr` (0 / −3), `the-alphabetree` (0 / −3) and `the-earth-tree` (0 / **+241**, a card that grows
by a quarter of a screen on its own reset, and the worst drift on the roster had this not been fixed).

And, beside them on the `?mobile=1&automation=1` page, the **default half of the arming setting** (`docs/automation.md`):
it is off, its control is in the `au` tab, every locked feature's toggle still refuses — and
`clickables === features + 1`, which is what says the setting stayed **out** of the clickable grid whose flatten the
same leg measures two lines above. The arming flow itself is `gates-a1.mjs --part 2`, which CI **now does run** (the
`a1` job, over the games with an `auto` table, derived from `games-auto/`); this is the half that protects every
existing row, on the two games that have an automation table.

⚠ **V1 moved one of those assertions, and it is worth knowing why that is not a weakening.** The setting used to be
judged "off AND absent from the save" (`player.au.armLocked === undefined`). ⚖ The user granted seeding it into the
`au` layer's `startData` (plan §15d.2), so the default is now `false` and PRESENT, and this leg asserts `=== false`.
⛔ Finding that out is why the seed is not a one-line change: left alone, the old assertion would have turned this
gate RED on **all 171 games** in CI, for a key whose value is the default it always had.

#### The `au` tab is object-form now, and the list reads it the same way

V1 gave the `au` tab two subtabs (`Simple`, `Advanced`). The layer list's `layoutOf` already handles both `tabFormat`
shapes: for an object it walks `tmp[l].tabFormat[player.subtabs[l].mainTabs].content`, which is `Simple` unless the
player switched — so the list draws exactly what it drew before, and the grid flatten above is untouched
(**measured: `ptr` 20 of 20 rows flattened, `something` 10 of 10**). The `Advanced` subtab contributes nothing to a
card either way: it is a single `display-text`, and `emitComp` draws no chip, counter or action button for one.

**The mutant round** (`bf0804821`, serially, one process, each restored from git afterwards — the work was committed
first so a restore could not eat it):

| mutant | result |
|---|---|
| `overflow-anchor: auto` | **RED on all three** games of the bounded set, in BOTH halves: constructed 0/3 held, real press 0/2 (`ptr` −3/−3, `the-alphabetree` −3/−3) |
| the constructed half grows the first card's `marginTop` **and** anchoring back on | ⚠ **`something` reads GREEN** — the suppressed probe certifies a build with the defect fully present. `ptr` and `the-alphabetree` still red because their REAL press catches it, so on a game where only the constructed half can judge, this probe is a false green. This is the mutant that justifies the spacer |

⚠ **Nothing else went red in either round**, which is the tell for a clean mutant run (a mutant reddening a check it
cannot reach means the tree was contaminated).

✅ **CI at `ccb0ed08a` (run `35445364610`): all 15 jobs green, `rows: 171/171 game(s); 0 RED`, the ten shards
covering all 171 games each exactly once.** The drift leg: `overflow-anchor` reads `none` on every game, the
constructed half **49 judged / 49 held / 122 abstained**, the real press **3 judged / 3 held / 168 abstained**; the
`au` arming default green on both games with a table (56 locked toggles refusing on `ptr`, 31 on `something`).

✅ **Bounded local set at `fcd0ce459`: M1 3/3 GREEN** (`ptr`, `something`, `the-alphabetree`), 68 cards / 144 chips,
the drift leg **3/3 judged on the constructed half and 2/2 on the real press** (1 abstained: `something`'s reset does
not move the height), and the `au` arming default green on both games with a table. `gates-a1 --part 2`: **24/24
green**. `npm run harness:test` **60**; `census-figures` **9/9**.

⚠ **No S1 anchor moved, and it was measured rather than assumed**: `player.au` is byte-identical before and after,
so the FULL state hash is too. Measured in a throwaway worktree at `d7cd5c185` against this tree — `ptr` 0 ticks
`6062b457fdb56dd6`, 200 ticks `714a8562c80f38ce`; `something` 0 / 200 / 1000 ticks `87a27eed58b62fee` /
`a716a598351c179c` / `0c459f705233fbf2` — every one equal on both sides. That is the whole reason the arming flag is
not in the layer's `startData`.

#### What U5 added to the leg

**Three things, and one of them had to be constructed.**

**1. Every chip's computed background, against an expectation the probe rebuilds itself.** A fourth independent
rebuild beside the sequence, the counters and the button set: `skinExpect` reads `player` / `tmp` and resolves the
game's own stylesheet through a probe element of its own, so a colour compared against the list's `chipSkin` would
assert nothing. It carries the same two rules the list's probe does — `visibility: hidden` rather than
`display: none` (a display-none element has no used value), and inserted and removed inside one synchronous block.
`data-skin` is checked beside the colour, so a build that painted the right pixel under the wrong word still reds.

**2. The DISCRIMINATOR, constructed: all three states on one card.** One card's three upgrade chips are forced
bought / affordable / unaffordable — `player[l].upgrades` for the first and the engine's own `canAffordUpgrade`
replaced with one that says yes to exactly one id, the same shape as the `pseudoUnl` and `msDisplay` constructions.
Everything is restored and the restoration is asserted.

⚠ It abstains, naming why, on three separable grounds, and each is a real case on the roster:
- the game keeps `canAffordUpgrade` off `window`, so the replacement never reaches the list (it is read as a bare
  identifier — the caveat the tooltip tap leg measured);
- no card draws three unlocked upgrade chips at this state;
- **the game does not paint the three states three colours.** MEASURED on `the-prestige-tree`, whose `.bought` and
  `.locked` are *both* `var(--boughtcolor)`: `rgb(255, 136, 136)` / `rgb(255, 153, 153)` / `rgb(255, 136, 136)`. A
  game that paints bought and unaffordable the same cannot judge a build that does.

✅ Green on four palettes that are not PTR's: `the-rainbow-void-tree` `rgb(107,207,77)` / `rgb(0,107,247)` /
`rgb(207,137,137)`; `the-congratulations-tree` (`hsl()`) `rgb(64,191,64)` / `rgb(221,46,68)` / `rgb(191,64,64)`;
`the-factoree`, whose 8-digit hex comes through as **`rgba(0,255,0,0.267)`** and **`rgba(255,51,51,0.4)`** with
real alpha; and `something`'s `rgb(128,0,255)` for the affordable one.

**3. ⚖ The no-hop ruling, now gateable.** U2d's stability leg opened its window on the action row's lit/grey
vector alone; it now opens on **either** that or the chips' `data-skin` vector, and asserts the chip row's own
`layer/kind/id` sequence is **byte-identical** across it — position and membership in one string. ⚠ A colour change
only counts where the row's own **independent** expectation held: MEASURED on `ptr`, two cards gained a chip over
250 ticks (`b` and `g`, 10 → 11) with no affordability having flipped, which is a legitimate membership change and
the same abstention the button row's `want` already gets. `something` is where it judges: six chips went
`locked` → `can` (`lllllllllbllll` → `cccccclllbllll`) with the order unchanged.

**4. Back, in three steps, on real clicks.** Open the layer from the LIST and press the game's own back control →
the list must be showing. Open it from the list again and leave by the nav bar's **Tree** button → the memory must
be gone. Open the **same** layer from the tree and press back → the list must **not** be showing. The second and
third steps are the half a build with an unconditional memory fails; the first two run on real clicks because the
claim is about what a press does, and the tree route clicks the node where the engine gives it an id and falls back
to `showTab` — the same call the node makes — naming which route it took, because a layer's `onClick` is the
game's and need not open a tab. It runs **last**, after the persistence leg: it navigates away from the list, and
every leg above reads the card the list draws.

#### What U6 added to the leg

**Three assertions over the roster, two constructions, and one leg whose discriminator is not the obvious one.**

**1. Every ACTION BUTTON's computed background, against the SAME rebuild the chips are judged by.** That is the
whole claim of the fix — the two controls stand for one component and must say the same thing about it — and it
costs the probe nothing beyond running `skinExpect` over the action row as well. `data-afford` keeps its own,
separate assertion.

**2. Every COUNTER's computed background, against a THIRD independent rebuild** (`ctrSkinExpect`), which re-derives
the user's table out of `player` / `tmp` and the game's stylesheet rather than asking the list. A counter compared
against the list's own `counterSkin` would assert nothing at all.

**3. The counter's three states, CONSTRUCTED on one card** — the same lesson U5 paid for. No state of any game on
the roster shows an upgrades counter green, red and layer-coloured at once, so a check that only asked "does the
counter have a colour" would pass a build that painted every counter the layer colour. The leg forces all three
with the two levers leg I already uses — every declared upgrade bought (green), none bought and
`canAffordUpgrade` saying no to everything (red), none bought and exactly one affordable (the layer's colour) —
and in the third configuration it also reads the ACTION ROW, where the affordable button must be lit and wear the
layer's colour while another is grey and wears the game's `locked` red. It abstains, naming why, where the engine
keeps `canAffordUpgrade` off `window`, where no card draws an upgrades counter over two or more unlocked upgrade
chips, or where the game does not paint the three states three colours.

**4. A MILESTONE counter red and green, constructed.** ⚖ The user's rule is the RED one, so both halves are
driven: the engine's own `hasMilestone` is replaced with one that says yes to everything (the counter must be the
game's `.milestoneDone`) and then no to everything (it must be `.milestone`). A build that painted a milestone
counter the layer colour would be green on any check that only looked at the all-earned case.

**5. The inaccessible press — and ⛔ the discriminator is the OVERLAY, not the tab.** `showTab` already refuses a
locked layer on every engine, so "`player.tab` did not move" is green on the *unfixed* build and asserts nothing.
The leg presses a shown-but-inaccessible layer's open button for real and asserts the overlay is **still open**,
that `player.tab` did not move, and that `cameFrom` did not move — plus a CONTROL on the same page through the
same button: a reachable layer must still open, or a build whose open button did nothing at all would pass. It
abstains where no shown layer is inaccessible at this state — and, since the two games with deep snapshots are
swept AT them, where nothing is inaccessible, it CONSTRUCTS one there by replacing the engine's own
`layerunlocked` for a single layer. It runs after leg J, which is the leg that leaves the page on the tree with the
memory clear.

⚠ **The press is bounded to 5 s and a failed press is an abstention that names why.** MEASURED on
`the-shenanigans-tree-rewritten`, whose own "Achievement Gotten!" toast sits over the overlay and intercepts
pointer events: an unbounded `page.click` spent 30 s and threw, and the row lost every leg after this one. A leg
that could not press anything must not pass either, so it says so.

#### What U7 added to the leg

**Three roster-wide assertions inside `LAYERLIST_PROBE`, and two legs of their own.**

**1. The reset line, per card (`resetOk`).** The probe reads the engine's prestige string ITSELF, splits it on its
own first run of `<br>`s, and requires the button to hold exactly **two** `.tmt-layerlist-resetline` elements whose
contents are that split — and, separately, that **each of them is at least one line box tall**, which is the
reservation and is what a build that collapsed the empty second row breaks. `resetEmptyL2` names the cards whose
second half the engine is NOT emitting right now (`ptr` at M16: `p` and `e`, both `normal` past `resetGain` 100).

**2. The other resources, in BOTH directions (`resOk`).** A fourth independent rebuild: the probe re-derives the
candidate keys out of `player[l]` and the engine's own key set, re-implements the **occurrence budget** over the
text the list reports, and compares the whole expected list — keys and printed strings, in order — against what
the card rendered. Neither a filter that admits everything nor one that admits nothing can pass, and neither can one
that keeps a candidate whose occurrence an engine readout or an earlier key had already claimed. ⚠ What the probe
does **not** re-implement is the layer's display TEXT: that is one walk of the game's own declarations with one
right answer, and it is taken from the list. The classification over it is written out twice.

**3. The progress rows (`progOk`)**, against the same rebuild carried one step further: the unearned set, the
currency identity, the cheapest-or-first pick, the numerator from both engine defaults, and the wrong-currency
guard. The rendered rows are compared to it by component, by `how` and by the `have / need` prefix.
⚠ `cheapestWitnesses` counts the categories where cheapest and first-listed pick **different** components —
`ptr` 1, `the-yes-tree` 2, `the-quantum-tree` 2, `the-infinity-tree` 1. **0 is an abstention on that half, never a
pass**: the mutant that replaces one rule with the other can only redden a sample that has such a case.

**4. Leg L — the reset block's height, against the game's OWN string.** Leg E cannot see this: it writes the amount
readout and holds every other string still, and the prestige text is a different readout on a different row. For
each card leg L takes the engine's current string and derives two more from it — **GROWN** (every number replaced
by `1.111e3,284`, the widest `format()` reaches, which is leg E's own vocabulary and not an arbitrary literal) and
**FLIPPED** (the other shape entirely: a second half where the engine emitted none, none where it did) — writes
each through `tmp[l].prestigeButtonText`, refreshes, and measures. It writes `tmp`, never `player`, restores it, and
judges the restore against the card as it was BEFORE anything was written.

**What it asserts is two things, and only one of them abstains.**
- **The RESERVATION, on every card in all three states, never abstaining**: both line elements exist and each is at
  least one line box tall. That is item 1's actual claim, and it is what a build that collapsed an empty second row
  breaks — in the BASE state on a card whose second half the engine did not emit, and in the FLIPPED state on every
  card.
- **The two HEIGHT comparisons** (grown against base, flipped against base), ⚠ **only while each half is a SINGLE
  line box**. MEASURED, and it cost a CI round: `the-cultree`'s `g` and `sorbet-s-convolution-mainframe`'s
  `universe` reddened the first version of this leg, and neither was the bug. A half that ALREADY WRAPS is not a
  fixed number of pixels tall — the engines' prestige strings carry `<b>`, and the line box holding it is taller
  than the others — so re-wrapping the same words moves the total (66.5 → 63.75 px) with the line COUNT unchanged,
  and removing a two-line half removes two lines where the flipped variant's one-line replacement puts back one
  (66.5 → 49.25). Those cards keep the reservation check and abstain from the comparisons, and the row says how
  many did. The grown half abstains again, separately, where the grown string really outgrows the card.

**5. Leg M — a full render still writes nothing.** The list's standing claim is most at risk in U7, because item 2
CALLS the layers' own display functions and item 3 reads their costs. `layersInert` measures the hash across
OPENING the panel; leg M measures it across five explicit `refresh()` calls with the panel already open, which is
the pass those two readers ride. Same abstention rule: a page that will not repeat its own hash cannot judge.

**6. Leg N — a cost in several currencies, CONSTRUCTED.** ⛔ It has to be constructed. `ptr` declares its own
`multiRes` on the `hn` layer, which is reachable in **no** recorded snapshot state on the roster, so a leg that
waited for a real one would abstain on every game and the "render it instead of skipping it" mutant would stay
green everywhere. The leg puts one on the component the card has ALREADY CHOSEN — which is what makes the effect
visible: the row must either name a different component (there were others) or disappear (there were not) — and
asserts the API's `dropped` records it, that the rendered row no longer names it, and that the restore brings it
back. ⚠ **Both sides of the declaration**, and the first version of this leg missed it: the list reads `cost`
through `numFieldOf`, which falls back to the DECLARATION when `tmp` holds nothing, and a declared `cost()` is a
function — clearing `tmp` alone left the real cost in place and the construction did nothing at all.

#### What U8 added to the leg

**One roster-wide assertion inside `LAYERLIST_PROBE`, and two legs of their own.**

**1. The two ways onto a card, and the value (`resOk`, extended).** The probe's rebuild now reads the remembered
set out of `localStorage` ITSELF — not from the list — and expects a row for every candidate that is either
attributed right now or remembered from a state where it was, in `player[l]` key order, each printing what
`player[l][key]` holds NOW. ⚠ The VALUE check is the one a remembered row needs: it is attributed to nothing in the
prose, so "is this string in the text" cannot judge it, and a build that froze the last attributed STRING would
pass every other check here. `resMemKey` asserts the key's namespace and `resRestated` names the rows whose own
formatting differs from the occurrence they claimed — decision 1's cost, counted on every run.

**2. Leg O — a row survives a DRIVEN reset.** ⛔ This is the leg that goes vacuous by construction if it reads a
boot state: 169 of the 171 games are swept at a fresh save where nothing attributes, and there is no row to keep.
So it finds a card with an unambiguously attributed row, DRIVES A RESET, and asserts the row is still there.
⚠ The reset is the engine's own, and `doReset(l)` is NOT the call that clears `l`'s own data — `rowReset` resets a
layer only for a resetting layer on a HIGHER row, so the leg resets through the layer above (`ptr`: `doReset('sb',
true)`, which takes `g.power` 1.96e555 → 0) and falls back to `layerDataReset(l)` where the tree has none. `how`
says which path ran. ⚠ And the SECOND vacuity: if the value still attributes after the reset, the row would be
there on the unfixed build too — the leg rebuilds the budget itself afterwards and ABSTAINS by name when it would
have (`the-dressy-tree`: *"Mi.clicky still attributes after the reset"*). The two halves are reported apart,
`beforeOk` and `afterOk`, because the mutant that removes the stickiness must redden the AFTER row and leave the
BEFORE one green.

**3. Leg P — what gets remembered, and where the write lands.** Both claims are about the MOMENT OF WRITING, which
no state-reading leg can reach, so the leg FORGETS the set (`forgetResources()`, which deliberately does not
re-render) and watches the very next render fill it:
- ⛔ **no ambiguous attribution is remembered**, and the withheld keys are NAMED (`the-cultree`: 6). ⚠ A leg that
  only read the store could not see this — the probe's own expectation reads the SAME store, so a build that
  remembered a collided key would move the expectation with it and stay green.
- ⛔ **the write goes to storage, not to `player`**, asserted TWO ways: the state hash across exactly the render
  that writes, and the BYTES under the storage key compared against the remembered set. ⚠ Leg M cannot see this at
  all — it measures a full render with the set already written, where a first-sight write does not happen.
  ⛔ **And the hash alone could not see it either**, which the mutant round MEASURED rather than argued: the
  "write it into `player`" mutant was GREEN on two of the three games, because its write had already happened at an
  earlier render and re-writing the SAME value moves no hash. Only `ptr`, whose set grows between the first render
  and the leg, reddened. The byte comparison needs no change to be visible. ⚠ `the-cultree` still cannot witness
  that mutant — it remembers nothing (all six of its rows collide) so it stores nothing either, and the two agree
  at empty; the row says `0 remembered` out loud rather than passing in silence.

#### What U9 added to the leg

**1. Leg 3b — the tree canvas, at BOTH ends of the page.** ⛔ A leg that measured at scroll 0 could not see the
defect AT ALL: the branch offset IS zero there. It runs on the phone page with the deepest save open and the tree
showing, and reads the same probe three times — at the top, scrolled and **not redrawn by us**, and scrolled with a
redraw FORCED. The three readings separate the two halves of the fix:

| reading | what it is the claim for |
|---|---|
| `topOk` | nothing regressed where the two coordinate spaces already agreed — **green under both mutants** |
| `bottomOk` (a redraw forced) | `position: fixed` on its own; the listener cannot help here |
| `redrawOk` (`treeRedraws()` moved) | the loader's scroll listener on its own — under `?managed=1` the engine's 500 ms cadence is stopped, so nothing else could have redrawn |
| `liveOk` | the two together: the branches are on their nodes without anyone forcing anything |

The distance is measured against the pixels the canvas **actually painted** (`getImageData`, sampled on a 2 px
grid, so a perfect hit reads up to √2 rather than 0) and only over nodes **on screen** — a node scrolled out of the
viewport has no visible branch end, and judging it would measure the viewport rather than the canvas. Tolerance
`BRANCH_TOL = 4` px against a measured worst of 1.0 (`ptr`) and 2.2 (`something`) on a correct build.

⛔ **The ENDPOINTS are the ones the engine ACTUALLY DREW**, recorded by wrapping the game's own `drawTreeBranch`
for the length of one redraw — not re-derived from `tmp[l].branches`. ⚠ **The first version did re-derive them and
the roster sweep caught it on two games.** The engines' own condition is `tmp[layer].layerShown == true`, and `==`
is not truthiness: `the-testy-tree`'s `b`, `c` and `d` are shown as **`"ghost"`** (TMT's own occupies-space-but-
invisible mode), so the engine draws none of their four branches while a truthiness test claimed all four
endpoints — and the leg reported a defect on a game that is perfectly fine. 4 of the 171 engines write the truthy
form themselves, so no single re-derivation is right for the roster either. Recording the calls also picks up
**component branches** (`drawComponentBranches`, the `upgrade-`/`buyable-`/`clickable-` prefixes), which a
`tmp[l].branches` walk misses entirely. A SELF-branch is dropped — `moveTo(p); lineTo(p)` with butt caps paints no
pixel, and `the-dressy-tree`'s `D` declares one — as is a pair either of whose elements is absent, which is
`drawTreeBranch`'s own precondition.

⚠ **AN ABSTENTION IS NOT A PASS, and it is named.** A game whose page does not scroll, or whose engine draws no
branch (`the-testy-tree`'s ghost layers, `the-universal-tree-voidcons0le-is-dumb`'s `layerShown: false` ones),
cannot see this. 169 of the 171 games are swept at a FRESH save, one layer deep, where the document is
exactly the viewport — so the leg first tries shrinking the viewport to **390×400** (a short phone is a real
phone, and it is the same claim) and only abstains when even that does not scroll. The summary prints how many
were judged, how many were judged at the short viewport, and how many abstained with the reason.

⚠ The leg also reports `innerScrollers` — anything inside `#app` that still scrolls under our layout — because the
6 games whose branch offset reads `#treeTab.scrollTop` would need a different answer if one did. It is 0.

⚠ **And U8's leg P had to learn about it too.** The declared row CAN claim an occurrence out of the layer's prose
and be unambiguous about it, so before this slice it looked exactly like a key the store must remember; the roster
sweep reddened `the-universal-tree-voidcons0le-is-dumb` on `p.@points` saying so. Leg P now judges candidates only
— a declared row is never remembered, because U8's memory keeps a row that would otherwise vanish and a
declaration cannot.

**2. Leg 6 — the DECLARED global-currency row.** It joins the other-resources assertion rather than sitting beside
it, and it is judged in BOTH directions, which is what a build that simply never emits the row would fail:
- a rendered `@points` row must print the GLOBAL `player.points`, carry the author's own `baseResource` as its
  label, be marked `global`, and be neither `sticky` nor present in the remembered set;
- a layer that DECLARES one (numeric row 0, `baseAmount` source reads `player.points` with comments stripped) must
  HAVE the row;
- and every `player[layer]` row must still be labelled with its KEY, so U7's ruling is asserted rather than assumed.

The probe rebuilds the declaration test itself — a fifth independent rebuild, for the reason the other four carry —
and the summary names the declaring cards with their labels, so the `TBD` ones are visible rather than buried.

#### What U10 added to the leg

**1. Leg 3a — THE TREE BUTTON IS PRESSED.** On the FRESH page, before the snapshot load, because a fresh load is
the state the user reported and because the five games this repairs default to it.
⛔ **A LEG THAT ONLY LOOKS AT LOAD IS VACUOUS, and that is the whole lesson of this item**: all five are green
at load, which is exactly why a roster sweep never caught the defect and why the user could. The leg presses the
real button — the same event a finger produces — and looks again. Four things are judged and each can fail
alone:

| check | the claim | abstains when |
|---|---|---|
| `shows` | `player.tab` is the name THIS engine gives its tree (`navbarUI.treeTab()`) and `#treeTab` is displayed | never |
| `nodes` | a visible `.treeNode` after the press | the game draws none in either reading (2 of 171, named) |
| `detail` | with a layer tab open, **no** tree node is visible — master-detail still holds | the game draws no node |
| `back` | pressing Tree from that open tab brings the tree back — the user's own journey | no tab could be opened |

…and the bar's own **active state**: on its own tree, `Tree` is the one button marked active. That is the half
`shows` cannot see, because the page can be right while the highlight is wrong.
⚠ `detail` is what stops the lazy repair. A "fix" that simply stopped hiding `.col.left` would pass `shows` and
`nodes` and leave `mobile.css` §2 dead; the leg asserts BOTH directions on every game.

**2. Leg 6 — the buyable counts, both views, against the engine's own accessor.** Per card: every
`.tmt-layerlist-chip[data-kind="buyables"]` and every `.tmt-layerlist-act[data-kind="buyables"]` must carry
`data-count` and a rendered `.tmt-layerlist-chip-n` equal to `formatWhole(getBuyableAmount(layer, id))` —
rebuilt in the probe, never asked of the list — its short name must still be its own box, its `title` must end
in the same ` ×<count>`, the two views must say the same thing about the same component, and **nothing that is
not a buyable may carry a count at all**. `countChips` is what says whether a game could judge it: 154 of the
171 draw no buyable chip at the state the sweep reaches, and the sweep line prints how many really witnessed it.

**3. The CONSTRUCTED reader witness** (`rules.countReader`), because the roster pass cannot tell the two readers
apart — 0 of 56 chips disagree. It locks a layer that has a buyable above zero, which makes
`unl(layer) ? … : 0` answer differently from the raw save, and the chip must follow the accessor. It abstains,
naming the game, wherever the construction does NOT pull the two apart — 168 of the 171 — and that abstention is
counted separately from a pass.

**4. U2c's digits leg now writes the count's own box**, over every digit column the reservation covers, plus the
two halves of U2d's rule (a shorter value gives no width back; the same length in different glyphs does not move
it), in both states and at both widths. The first magnitude PAST the reservation is measured and REPORTED rather
than asserted — a buyable has no bound, and a growth there is the documented behaviour, not a defect.


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
