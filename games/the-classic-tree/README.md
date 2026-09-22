# The Classic+ Tree — The-Modding-Tree

[![Deploy to GitHub Pages](https://github.com/certainjellyfish9204/The-Modding-Tree/actions/workflows/pages.yml/badge.svg)](https://github.com/certainjellyfish9204/The-Modding-Tree/actions/workflows/pages.yml)

An incremental game engine based on The Prestige Tree. This fork is **The Classic+ Multiverse** — a full TMT showcase with **11 main layers** (P/B/G/M/T/W/H/Q/E/U/R) + 2 side layers + **15 universes** and a **Multiverse Transport Terminal** that teleports you into **11 full, playable original trees** bundled in `trees/`, two endgame branches from Eternity (**Universe** and **Reality**), Universe-hopping, **Eternal Notations** (by MathCookie17, **every preset (144+144 HTML, 146 total) incl. Colored Dominoes with CSS+PNG**), and safe-storage fallback.

**Play Now:**
- **GitHub Pages (once enabled):** `https://certainjellyfish9204.github.io/The-Modding-Tree/` 
- **Raw Githack (instant, arena v0.5):** `https://raw.githack.com/certainjellyfish9204/The-Modding-Tree/arena/01a01656-the-modding-tree/index.html?v=0.5`
- **Arena Preview:** Live preview on port 8000 in this workspace
- **Local:** Open `index.html` directly

> **v0.6 Fractured Reality** — **Reality (R)** is a second row-5 branch from Eternity, with Stability, Dimensions, challenges, upgrades, milestones, and an alternate victory at 25 Reality Shards.
>
> **v0.5 Eternal Notations** — **Eternal Notations** by MathCookie17 (144 presets, Infinity/Eternity) — **Options → Notation** switcher (TMT, Scientific, Standard, Infinity, Eternity…) + updated `break_eternity` — see `CREDITS.md`.  
> **v0.4 Multiverse** — Universe (U) row 5: 5 universes incl. Incrementreeverse (from List of Mods) — every layer ported incrementally.  
> **v0.3** — 4 new layers (M/W/Q/E) + Stats (S), 70+ upgrades. **v0.2** — Safe Storage fallback.

[Look here for a tutorial on getting started with modding with TMT](docs/tutorials/getting-started.md)

You can look in the [documentation](docs/!general-info.md) for more information on how it all works, or look at the code in [js/layers.js](js/layers.js) + `js/layers/universe.js` to see what it all looks like.

---

## Multiverse Transport — play the original trees

The Universe (U) layer's **Multiverse Transport Terminal** drops you into the **full,
playable original game** — not a buyable approximation. Your Classic+ run keeps ticking
behind the overlay, and one button (or `Esc`) brings you back.

Eleven real trees are bundled in [`trees/`](trees/README.md):

| Universe | Original game | Author | Mod lines | License |
|---|---|---|---|---|
| Classic 1.0 | [Prestige-Tree-Classic](https://github.com/Jacorb90/Prestige-Tree-Classic) | **Jacorb90** | 5,163 | MIT |
| Rewritten | [Prestige-Tree](https://github.com/Jacorb90/Prestige-Tree) | **Jacorb90** | 13,934 | MIT |
| Rewritten NG+ | [Prestige-Tree-Rewritten-NG](https://github.com/Seder3214/Prestige-Tree-Rewritten-NG) | **Seder3214** | 16,877 | MIT |
| TMT Demo | [The-Modding-Tree](https://github.com/Acamaeda/The-Modding-Tree) | **Acamaeda** | in-repo | MIT |
| Incrementreeverse | [pg132/The-Modding-Tree](https://github.com/pg132/The-Modding-Tree) | **pg132** | 10,903 | MIT |
| The Basic Tree | [gapples2/The-Modding-Tree](https://github.com/gapples2/The-Modding-Tree) | **gapples2** | 3,797 | MIT |
| The Milestone Tree | [loader3229/milestone-tree](https://github.com/loader3229/milestone-tree) | **loader3229** | 16,573 | MIT |
| PT: Dimensions | [Prestige-Tree-Dimensions](https://github.com/loader3229/Prestige-Tree-Dimensions) | **loader3229** | 13,997 | MIT |
| Particle Increment Tree | [The-Particle-Increment-Tree](https://github.com/cokecole526/The-Particle-Increment-Tree) | **cokecole526** | 4,176 | ⚠️ none stated |
| The Pro Tree | [The-pro-tree](https://github.com/chuangyou123/The-pro-tree) | **chuangyou123** | 24,047 | MIT (TMT) |
| The Dice Tree | [The-Dice-Tree-ZH.github.io](https://github.com/chuangyou123/The-Dice-Tree-ZH.github.io) | **chuangyou123** | 5,686 | MIT (TMT) |

The Galaxy Tree, Synergism, and The Circuit Tree are **original to Classic+** — they
have no separate source game and say so in-game. The `U` layer's buyables are
Classic+'s own reinterpretation of each game, balanced as part of this mod; the bundled
copies in `trees/` are the genuine article, unmodified apart from unique save keys.

### v0.9 — the Universe Switcher

The terminal is not just buttons any more. `js/technical/multiverse.js` adds a
**Universe Switcher** microtab to the Multiverse row with three view modes:

| Mode | What runs | Use it for |
|---|---|---|
| **scan** | *nothing* — reads the 11 trees' own `cpt_*` saves off this origin | a live dashboard of every realm's real progress |
| **reel** | one iframe, auto-cycling (`⏮ ▶/⏸ ⏭`, 4–60 s/realm) | touring the multiverse without tab-hopping |
| **swarm** | a grid of live trees, `IntersectionObserver`-gated to a cap (default 4) | several games open at once; **Σ ALL** lifts the cap |

Two more pieces:

- **Hard cut** — teleporting parks the hub (`opacity:0; pointer-events:none`, so
  TMT's `updateWidth()`/`resizeCanvas()` still see a real layout and your run
  keeps ticking and autosaving) and the other tree owns the viewport. Its
  ◀ RETURN pill is *injected into the child document* at runtime: same-origin,
  so nothing under `trees/` needs editing, and `MULTIVERSE.flushChild()` calls
  the child's own global `save()` before a frame is unloaded.
- **Multiverse Convergence (upgrade U-66)** — each bundled tree you actually
  play boosts the Universe effect by `+5·√log₁₀(progress)`, capped at ×100 per
  realm. Foreign saves are parsed defensively (four on-disk formats, including
  `atob` + `unescape(encodeURIComponent())`, PT:R's `allSaves` slot wrapper,
  legacy `{mantissa, exponent}` Decimals and the Particle Tree's pako-packed
  `formatsave`) and a digest is only redone when a save's fingerprint changes,
  so the 20 fps tick never pays for a megabyte of `JSON.parse`.

```bash
node test/multiverse_bridge_test.js   # save formats, bonus curve, drift guards
node test/multiverse_dom_test.js      # modes, caps, frame lifecycle (needs jsdom)
```

See [`trees/README.md`](trees/README.md) for provenance (commit SHAs), measured line
counts, and exactly which changes were made to each copy. Full attribution:
[`CREDITS.md`](CREDITS.md).

**Licenses:** TMT is MIT (Acamaeda); Prestige Tree Classic & Rewritten are MIT
(Jacorb90). Every bundled tree keeps its `LICENSE` / `Prestige-tree-license`. If you
fork, keep `CREDITS.md` and `trees/`.

---

## GitHub Pages — github.io treatment

This repo is **ready for Pages** — `.nojekyll` is already pushed. You just need to enable it once:

**Fastest (no workflow file needed):**
1. Go to `https://github.com/certainjellyfish9204/The-Modding-Tree/settings/pages`
2. Source: **Deploy from a branch** → Branch: `master` (or `arena/01a01656-the-modding-tree`), Folder: `/ (root)` → Save
3. Wait 1 min → `https://certainjellyfish9204.github.io/The-Modding-Tree/` is live!

**Modern (auto-deploy on every push via Actions):**
- Workflow file is blocked by Arena token scope, so add it via GitHub UI: create `.github/workflows/pages.yml` and paste contents from `pages.yml.template` (see `GITHUB_PAGES_SETUP.md` for full snippet), then set Pages Source to **GitHub Actions**.

Full steps, verification, and `gh` CLI commands are in [`GITHUB_PAGES_SETUP.md`](GITHUB_PAGES_SETUP.md) and [`pages.yml.template`](pages.yml.template).

**Forking?** Replace `certainjellyfish9204` with your username in `modInfo.id` and README links.

