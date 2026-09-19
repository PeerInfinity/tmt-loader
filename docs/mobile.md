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
change width.

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
