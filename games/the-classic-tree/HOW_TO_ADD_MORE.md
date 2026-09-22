# How This Starter Was Built — And How YOU Add More

You wanted a **Classic Prestige Tree, Full Showcase, Teach Step-by-Step**. Done!
Your game is now at `js/layers.js` (5 main layers + achievements). Preview it here:

> Your live preview is running at port 8000 (open the preview pane for this workspace). If you don't see it, go to `https://8000-<your-sandbox>.e2b.app/` or just open `index.html` locally.

---

## 1. The 3 Files You Actually Touch

| File | What it does |
|------|--------------|
| **`js/mod.js`** | Your game's title, version, how fast points generate (`getPointGen()`), win condition (`isEndgame()`), top-of-screen displays |
| **`js/layers.js`** | **EVERYTHING ELSE.** Each `addLayer("id", { ... })` is a layer (a prestige, a shop, a challenge world) |
| **`js/tree.js`** | Where nodes sit on the tree. Leave blank (`treeLayout: ""`) to auto-layout by `row` |

**You rarely touch anything else.**

## 2. What a Layer *Is* (The Pattern)

Every layer in this starter follows the same skeleton. Copy-paste it to make a new one:

```js
addLayer("x", { // x = id, 1-3 letters, lowercase
    name: "example",
    symbol: "X",      // shown on tree node
    color: "#FF00FF", // node + theme color
    row: 2,           // 0=top row, 1,2,3... or "side" for achievements
    branches: ["p"],  // draw line from p to this layer

    startData() { return {
        unlocked: false,          // locked until you set it true
        points: new Decimal(0),   // the layer's currency
        best: new Decimal(0),
    }},

    // --- PRESTIGE FORMULA (only if it's a prestige layer) ---
    requires: new Decimal(100),           // how much baseResource you need
    resource: "example points",           // name of THIS currency
    baseResource: "points",               // what it costs
    baseAmount() { return player.points },// where to look for baseResource
    type: "normal", // "normal" = (base/req)^exp * mult  | "static" = need exponentially more each time
    exponent: 0.5,

    gainMult() { return new Decimal(1) }, // multiply gain here (upgrades/milestones)
    gainExp()  { return new Decimal(1) },

    layerShown() { return true }, // when to show node. Use hasUpgrade('p',11) to lock behind progress

    effect() { return player.x.points.add(1).pow(0.5) }, // passive boost from holding this currency
    effectDescription() { return "boosting points by "+format(tmp.x.effect)+"x" },

    // then: upgrades, milestones, buyables, challenges, etc
})
```

That's it. The engine handles resets, saving, canvas, prestige button automatically.

## 3. The 7 Features Showcased (in order you should learn them)

### a) **Upgrades** (`p` layer) - Simplest power-ups
```js
upgrades: {
  11: { description: "Double points", cost: new Decimal(1) },
  12: {
    description: "P points boost points",
    cost: new Decimal(2),
    unlocked() { return hasUpgrade('p',11) }, // chain!
    effect() { return player.p.points.add(1).pow(0.4) },
    effectDisplay() { return format(this.effect())+"x" },
  }
}
```
*You write the description, but YOU must apply the effect in `getPointGen()` or `gainMult()` elsewhere.*

### b) **Milestones** (`p`, `b`, `g`) - Rewards for reaching totals, never lost on prestige
```js
milestones: {
  0: {
    requirementDescription: "5 prestige",
    effectDescription: "Keep upgrades on reset + autobuy",
    done() { return player.p.best.gte(5) },
    toggles: [["p","auto"]] // creates an ON/OFF button!
  }
}
```
Check with `hasMilestone('p',0)`.

### c) **Buyables** (`b` + `g`) - Rebuyable scaling purchases
The `g` layer's `Generator Mk I` is the cleanest example. Key parts:
- `cost(x)` where x = amount you already have (Decimal) -> returns next cost
- `effect(x)` -> what owning x gives you
- `display()` -> what the button shows
- `canAfford()` + `buy()` -> you spend currency and `setBuyableAmount`
Use `buyableEffect('g',11)` elsewhere.

### d) **Clickables** (`g` layer, "Overclock!") - One-off buttons with state
Like buyables but store a string/number state, not Decimal amount. Great for actives, cooldowns, mini-games.
```js
clickables: {
  11: {
    display() { return "Gain 10% of G gain!" },
    canClick() { return player.g.clickables[11] <= 0 },
    onClick() { player.g.points = player.g.points.add(tmp.g.resetGain.times(0.1)) }
  }
}
```

### e) **Bars** (`g` + `t` layers) - Visual progress
```js
bars: {
  power: {
    direction: RIGHT, width: 300, height: 20,
    progress() { return player.g.points.div(20).toNumber() }, // 0 to 1
    display() { return format(player.g.points)+"/20" },
  }
}
```

### f) **Challenges** (`t` layer) - Enter a harder mode, reach a goal
Most complex but powerful. You define:
- `challengeDescription` (what's harder)
- `canComplete()` (goal check)
- `rewardEffect()` + `rewardDescription`
Apply the debuff in `getPointGen()` with `if (inChallenge('t',11)) gain = gain.pow(0.5)`
Apply the reward with `if (hasChallenge('t',11)) gain = gain.times(challengeEffect('t',11))`
Use `countsAs` to stack challenges.

### g) **Achievements** (`a` side layer) - Side-row layer
`row: "side"` makes it float on the side. Never resets. Use `hasAchievement('a',11)` for permanent boosts.

## 4. How Your Starter Tree Flows

```
Row 0:  [P] prestige points (from points)  -> boosts points
           ↓                ↓
Row 1:  [B] boosters (static, from P)   [G] generators (normal, from P)
           \                /          → boosters give x2.5^amount, generators give x2^amount
            \              /           → G has 2 buyables + a clickable + 2 bars
             \            /
Row 2:        [T] time shards (from P, but needs B & G milestones)
               → Has 3 challenges, infobox lore, bar, upgrades
               |
Row 3:        [H] hyper points (static, from T) → x100^amount, win at 5

Side:  [A] Achievements (8 total) → permanent x1.2-x1.5 boosts
```

**Prestige Types:**
- **normal** (P, G, T): cost to *gain* depends on amount gained: `gain = (base/req)^exp * mult`. Feels smooth, good for currencies you get many of.
- **static** (B, H): cost to *have* depends on amount you have: `cost = base^(amount*exp) * req`. Feels like levels, good for "levels" you buy one at a time.

Row resets: Row 2 resets Row 0+1, Row 3 resets Row 2, etc. `doReset` in each layer decides what to KEEP (see `hasMilestone` keeps).

## 5. Your Turn: Add Layer 6 in 5 Minutes

1. **Copy the `h` layer** at bottom of `js/layers.js`, paste below it
2. Change `id` to `"s"`, `symbol` to `"S"`, `name` to `"stars"`, `color` to `"#FFD700"`, `row` to `4`
3. Set `requires: new Decimal(5)`, `baseResource: "hyper points"`, `baseAmount() {return player.h.points}`
4. Set `type: "normal"`, `exponent: 0.3`, `branches: ["h"]`
5. Make `layerShown() { return hasUpgrade('h',13) || player.s.unlocked }`
6. Add 2 upgrades, 2 milestones (copy from `p`)
7. Add to `isEndgame()` in `mod.js`: `return player.s.points.gte(10)` or keep H as win
8. **Save** and reload `index.html` — your new node appears!

## 6. 20 Ideas to Steal (Pick One and Tell Me!)

**Classic Expansions:**
1. Second side layer: `row: "otherside"` for stats/shop
2. A 6th row that *only* unlocks if you completed all T challenges
3. Buyable tree inside a layer (like B's Booster Engine but with branches between buyables)
4. Upgrade tree with `branches: [12]` on upgrades (visual lines between upgrades)
5. Softcap on points after 1e12, with an upgrade that weakens it

**Themed Reskins (same code, new story):**
6. **Space:** P=Ore, B=Rockets, G=Colonies, T=Time Warp, H=Black Hole
7. **Factory:** P=Gears, B=Conveyors, G=Assemblers, T=Automation, H=Singularity
8. **Magic:** P=Mana, B=Runes, G=Minions, T=Chrono Magic, H=Ascension
9. **Nature:** P=Seeds, B=Saplings, G=Forest, T=Seasons, H=Ecosystem
10. **Computer:** P=Bytes, B=Cores, G=Threads, T=Overclock, H=Quantum

**Unique Mechanics:**
11. A layer with `type: "none"` that's just a shop (no prestige button) — use buyables only
12. Grid layer (map/inventory) — see `js/Demo/layers/a.js` grid example
13. Particle golden cookie: see `c.js` particle example, make a clickable particle that gives boost
14. Story subtabs: use `tabFormat: { "Story": {content: [["infobox","lore"]]}, "Shop": {content: ["upgrades"]}}`
15. Alternate win: first to 1e100 points *or* 5 hyper points, player chooses path

**Quality of Life:**
16. Add `hotkeys` to every layer (`b`, `g`, etc)
17. Add `automation` milestones: `passiveGeneration() {return hasMilestone(...) ? 1 : 0}`
18. Add `changelog` entries as you go (keeps players excited)
19. Add `displayThings` at top: show current best hyper gain
20. Add `branches` colors: `[["b","#FF8800"]]` for orange lines

## 6b. Adding a Universe: the Bridge Checklist

A new realm in `js/technical/transport.js` is only half the job. If the tree is
vendored (a real game under `trees/`), also register it in `MULTIVERSE.REALMS`
in `js/technical/multiverse.js`:

```js
{ key: "mytree", label: "My Tree", save: "cpt_mytree", probe: ["points", "p.points"] },
```

- `save` **must** equal the vendored copy's `modInfo.id` (or the literal it passes to
  `localStorage.setItem`). `test/multiverse_bridge_test.js` fails the build if it drifts,
  which is the difference between "x1.0 boost" and a silently dead button.
- `probe` is optional: with no paths the digest sweeps any `{ <layer>: { points } }`
  object anyway, which covers most TMT forks.
- Set `packed: true` only if the tree gzips its save (`formatsave`) — the bridge then
  decodes it asynchronously and shows "no signal" on browsers without
  `DecompressionStream`.
- Give the copy its own `cpt_*` id, or it will clobber another tree's save on this
  origin. See `trees/README.md`.

## 7. How to Test & Share

- **Local:** Just open `index.html` in Chrome/Firefox. Hit F12 if something breaks — console tells you line.
- **Save:** Game autosaves. Test resets with Export/Import in Options (wheel icon).
- **Break your save?** Options → Hard Reset. Or change `modInfo.id` to start fresh.
- **Share:** Push to GitHub, then use https://raw.githack.com/YOURNAME/The-Modding-Tree/master/index.html

## 8. What I Built For You Right Now

- ✅ `js/mod.js` → Renamed to "Classic+ Tree", new point formula using all layers, win at 5 Hyper
- ✅ `js/layers.js` → 6 layers total:
  - P (8 upgrades, 3 milestones, auto-buyer, passive)
  - B (4 upgrades, 1 buyable, 4 milestones, static, auto-prestige)
  - G (4 upgrades, 2 buyables, 1 clickable with 5s cooldown, 2 bars, 4 milestones, 2 subtabs)
  - T (3 upgrades, 3 milestones, 3 challenges with countsAs, infobox, bar)
  - H (3 upgrades, 2 milestones, custom prestige text, softcap)
  - A (8 achievements, side row)
- ✅ Balanced numbers so you can beat it in ~15-30 minutes but feel progression every minute

**Next step:** Open the preview, play for 2 minutes, then tell me:
- What theme do you want to reskin it to?
- Do you want Layer 6 to be a *third* Row-1 branch, or a Row-4 finale?
- Or should we add a **story / lore** tab with infoboxes?

I can do the reskin + new layer for you in one edit. Just say the word!
