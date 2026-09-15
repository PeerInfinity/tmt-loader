# Automation tools (`loader/tmt-auto.js`, A1)

The loader can play parts of a game for you: resets, upgrade purchases, buyable purchases. **Every feature is off by
default.** Nothing in a game changes: no formula is edited, and a feature only calls the engine's own functions
(`doReset`, `buyUpgrade`, `buyMaxBuyable` / `buyBuyable`) at the point in the tick where the engine calls each layer's
`automate()`.

To try everything at once: `index.html?mod=<id>&profile=all`.

## The `au` side layer

`tmt-auto.js` adds a side layer **`au` ("Automation Tools", symbol AU)** to every game, shown next to the game's other
side nodes (selector `#app .smallNode.au` on both engines). Its tab has:

- one toggle per registered feature: **On / Off / Locked** (Locked while the feature's `unlocked()` is false), with the
  feature's policy under it;
- a master toggle, *All features*: turns every unlocked feature on, or (when all are on) all off;
- a profile readout: the active profile and how many features are running;
- after the first click on any toggle, the line *"Automation tools are a loader addition (tmt-loader); every toggle is
  off by default."*

The toggles live in `player.au.features` (`{featureId: true|false}`), `player.au.disclosed` records the first click.
`au` is a side layer with no `doReset`, and neither engine resets such a layer (2.2.1 `rowReset("side")` skips
`layerDataReset`; 2.7 guards with `!isNaN(row)`), so the toggles survive every reset and are saved with the game.
`player.au` also carries the engine's own layer fields (`points`, `clickables`, …; 2.7 needs `points` because its
`gameLoop` updates `best` for every side layer).

## Profiles

| Profile | What runs | Selected by |
|---|---|---|
| `off` | nothing — `player.au.features` is ignored | default under `?managed=1` and in the Node harness |
| `all` | every registered feature whose `unlocked()` holds, with its default policy | `?profile=all`, `--profile all` |
| `saved` | the features toggled on in `player.au.features` (and unlocked) | default for a normal page load |

A profile is applied after `load()` and is never written into the save: reload without `?profile=` and the toggles
show what the save says. `tmtLoader.profile(name)` switches at runtime.

## Kinds and policies

| Kind | What it does each tick | Policies |
|---|---|---|
| `reset` | `doReset(layer)` when `tmp[layer].canReset` and the policy agrees | `always` · `gain>=N` (`tmp[layer].resetGain ≥ N`) · `keepsUpgrades` (only while `hasMilestone(keepMilestone.layer, keepMilestone.id)` holds — a post-milestone policy: from a fresh game it never starts the layer on its own) · `interval>=T` (at least T of `player.timePlayed` since this feature's last reset; runtime memory, not saved) |
| `upgrades` | buys unlocked, unowned upgrades the player can afford | `cheapest-first` (sorted by `tmp` cost, ties by id; each affordable one is bought in that order) · `order` (the table's `order[]`) |
| `buyables` | buys each unlocked buyable (id order or `order[]`) | `buyMax` — the engine's `buyMaxBuyable` where the buyable defines `buyMax`, else `buyBuyable` until the amount stops moving |

Upgrades with a `pseudoUnl` (Prestige Tree's pseudo-upgrades) are never bought by `upgrades` features.

A feature can also name `after: ['b']`: it does nothing until each named layer is unlocked (the per-game tables use
it for unlock order).

## Where features run

Each registered feature's layer gets its `automate()` wrapped: the game's original `automate` runs first, then the
layer's active features in registration order. `automate` is the per-layer function both engines call once per
`gameLoop` and never from `updateTemp` (`autoPrestige` is not used: it is a predicate both engines evaluate inside
`updateTemp`). TMT 2.2.1's `gameLoop` skips `automate` for a layer the player has not unlocked; for those, the `au`
layer's own `automate` — called after every tree layer — runs the features of each hooked layer whose slot did not run.
Every hooked layer's features run exactly once per tick (`tmtLoader.hookStats()` counts it; gate A1-1).

## Writing a table (`games-auto/<id>.js`)

A classic script named by the manifest's `auto` field, loaded right after `tmt-auto.js` (page and harness). It only
calls `tmtLoader.registerAutoFeature`:

```js
tmtLoader.registerAutoFeature({
  id: 'reset:p', layer: 'p', kind: 'reset', policy: 'always', title: 'Prestige reset',
  unlocked() { return true },          // optional; the toggle shows Locked while false
  default: false,                      // must be false (default OFF)
  policies: ['always', 'gain>=1'],     // optional: the alternatives tmtLoader.setPolicy(id, p) accepts
  keepMilestone: { layer: 'b', id: 0 },// required by keepsUpgrades
  order: [11, 12, 13],                 // required by policy "order"
  after: ['g'],                        // optional unlock-order gate
});
```

`tmtLoader.options` (page `?autoOpt=k=v;k2=v2`, harness `--auto-opt "k=v;k2=v2"`) passes table options such as
`unlockOrder=g,b`.
