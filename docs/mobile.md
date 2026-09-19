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
it is off, it is not in the save, its control is in the `au` tab, every locked feature's toggle still refuses — and
`clickables === features + 1`, which is what says the setting stayed **out** of the clickable grid whose flatten the
same leg measures two lines above. The arming flow itself is `gates-a1.mjs --part 2`, which CI does not run; this is
the half that protects every existing row, on the two games that have an automation table.

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
