# Credits — The Classic+ Multiverse & Omniverse

This project is a **fan-made Modding Tree mod** that ports and reimagines other prestige-tree games into a unified Multiverse and Omniverse framework. All original games remain property of their creators — this mod exists to celebrate them and to show how TMT can hold *every* tree in one cohesive universe.

---

## Core Engine

| Project | Author | Link | License | What we use |
|---------|--------|------|---------|-------------|
| **The Modding Tree (TMT)** | **Acamaeda** | https://github.com/Acamaeda/The-Modding-Tree | MIT (see `LICENSE`) | Engine, `break_eternity.js`, `layerSupport.js`, Vue components, docs in `/docs` |
| **break_eternity.js** | Patashu | https://github.com/Patashu/break_eternity.js | MIT | Big numbers (`Decimal`) — **updated to Eternal Notations' `break_eternity` (supports `mod`, `slog`, etc.)** |
| **Eternal Notations** | **MathCookie17** | https://github.com/MathCookie17/Eternal-Notations — https://mathcookie17.github.io/Eternal-Notations/ | MIT | **144 presets + 65 notations + 144 HTML presets (288 total)** — powering **Options → Notation** switcher (146 total options). |

---

## Ported Games — the Multiverse (Universe Layer `U`)

There are two layers to this, and they used to be conflated:

1. **In-game universes.** The `U` layer's travel mechanic and its buyables are
   Classic+'s *own reinterpretation* of each source game — a handful of buyables,
   bars and lore, not a real port. They are balanced as part of this mod.
2. **Full playable trees.** Separately, the actual games are bundled unmodified in
   [`trees/`](trees/README.md) and reachable from the **Multiverse Transport Terminal**
   on the `U` hub tab, or from the transport button on any universe's own tab.

Each entry below **has been verified against a live upstream repository**. Line counts
are measured, not estimated ("mod lines" excludes each tree's vendored copy of
`vue.js` / `pako.js` / `break_eternity.js`).

| # | Universe | Original game | Author | Upstream | Mod lines | License |
|---|---|---|---|---|---|---|
| 1 | C — Classic 1.0 | Prestige Tree Classic | **Jacorb90** (Aarex, papyrus) | [Jacorb90/Prestige-Tree-Classic](https://github.com/Jacorb90/Prestige-Tree-Classic) | 5,163 | MIT |
| 2 | R — Rewritten | Prestige Tree Rewritten | **Jacorb90** | [Jacorb90/Prestige-Tree](https://github.com/Jacorb90/Prestige-Tree) | 13,934 | MIT |
| 3 | NG — Rewritten NG+ | PT: Rewritten NG+ | **Seder3214** | [Seder3214/Prestige-Tree-Rewritten-NG](https://github.com/Seder3214/Prestige-Tree-Rewritten-NG) | 16,877 | MIT |
| 4 | D — TMT Demo | The Modding Tree example mod | **Acamaeda** | [Acamaeda/The-Modding-Tree](https://github.com/Acamaeda/The-Modding-Tree) | — (in-repo) | MIT |
| 5 | I — Incrementreeverse | The Incrementreeverse | **pg132** | [pg132/The-Modding-Tree](https://github.com/pg132/The-Modding-Tree) | 10,903 | MIT |
| 6 | B — Basic Tree | The Basic Tree | **gapples2**, thepaperpilot | [gapples2/The-Modding-Tree](https://github.com/gapples2/The-Modding-Tree) | 3,797 | MIT |
| 7 | MT — Milestone Tree | The Milestone Tree | **loader3229** (qq1010903229) | [loader3229/milestone-tree](https://github.com/loader3229/milestone-tree) | 16,573 | MIT |
| 8 | DIM — Dimensions | PT: Dimensions | **loader3229** | [loader3229/Prestige-Tree-Dimensions](https://github.com/loader3229/Prestige-Tree-Dimensions) | 13,997 | MIT |
| 9 | PART — Particle Tree | The Particle Increment Tree | **cokecole526** | [cokecole526/The-Particle-Increment-Tree](https://github.com/cokecole526/The-Particle-Increment-Tree) | 4,176 | ⚠️ none stated |
| 10 | PRO — Pro Tree | The Pro Tree (专业之树) | **chuangyou123** | [chuangyou123/The-pro-tree](https://github.com/chuangyou123/The-pro-tree) | 24,047 | MIT (TMT) |
| 11 | DICE — Dice Tree | The Dice Tree (骰子树) | **chuangyou123** | [chuangyou123/The-Dice-Tree-ZH.github.io](https://github.com/chuangyou123/The-Dice-Tree-ZH.github.io) | 5,686 | MIT (TMT) |
| 12 | ME — Classic+ Hub | This repository | You / contributors | — | — | MIT |

### Corrections to earlier revisions of this file

An earlier version of `CREDITS.md` inflated several line counts by roughly 10x and
credited The Milestone Tree to "community TMT milestone trees" without a repository.
Both are fixed above. For the record:

| Tree | Previously claimed | Actually measured |
|---|---|---|
| The Pro Tree | "240,000+ lines" | 24,047 mod lines (63 files) |
| The Dice Tree | "60,649 lines" | 5,686 mod lines (23 files) |
| The Milestone Tree | *no repo given* | loader3229/milestone-tree, 16,573 mod lines |

The earlier claim that each subtree's buyables were "ported directly from the original
game's code" was also inaccurate — they are inspired-by recreations. The genuine ports
are now the bundled copies in `trees/`.

### Universes with no external source

**The Galaxy Tree**, **Synergism**, and **The Circuit Tree** (added in v0.8) are
original to Classic+ and have **no separate upstream game**. They exist only as in-game
buyables. Their transport buttons say so rather than pretending otherwise.

## Licenses & Attribution

- **The Modding Tree:** MIT License (Acamaeda).
- **Prestige Tree Classic & Rewritten:** MIT License (Jacorb90).
- All community mods remain under their respective creators' open-source licenses. Attribution and links are provided in-game on each universe subtab.
