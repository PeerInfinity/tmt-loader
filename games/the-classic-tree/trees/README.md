# `trees/` — Bundled Multiverse Sources

These are **verbatim copies of real, open-source prestige trees**, vendored so the
Universe (U) layer can transport you into the full, playable game instead of only
abstracting it into a few buyables.

Everything here is third-party code. It is **not** part of the Classic+ Tree's own
source, and it is not maintained here — it is a snapshot. Upstream is the source of
truth; these are pinned copies so the transport buttons never break.

Attribution lives in two places: [`../CREDITS.md`](../CREDITS.md) and the
`transportMeta` line shown in the transport overlay's top bar while you play.

---

## What's included

| Folder | Game | Author | Upstream | Commit | Upstream date |
|---|---|---|---|---|---|
| `prestige-tree-classic/` | Prestige Tree Classic 1.0 | Jacorb90 | [repo](https://github.com/Jacorb90/Prestige-Tree-Classic) | `4dd41d6` | 2021-01-19 |
| `prestige-tree-rewritten/` | Prestige Tree Rewritten | Jacorb90 | [repo](https://github.com/Jacorb90/Prestige-Tree) | `cec9198` | 2021-05-25 |
| `prestige-tree-rewritten-ng/` | PT: Rewritten NG+ | Seder3214 | [repo](https://github.com/Seder3214/Prestige-Tree-Rewritten-NG) | `930f946` | 2026-02-10 |
| `incrementreeverse/` | The Incrementreeverse | pg132 | [repo](https://github.com/pg132/The-Modding-Tree) | `7bae0ce` | 2023-09-12 |
| `basic-tree/` | The Basic Tree | gapples2 & thepaperpilot | [repo](https://github.com/gapples2/The-Modding-Tree) | `49cf191` | 2020-11-13 |
| `milestone-tree/` | The Milestone Tree | loader3229 (qq1010903229) | [repo](https://github.com/loader3229/milestone-tree) | `1c6c98d` | 2025-09-05 |
| `prestige-tree-dimensions/` | PT: Dimensions | loader3229 | [repo](https://github.com/loader3229/Prestige-Tree-Dimensions) | `6ff9289` | 2023-06-28 |
| `particle-increment-tree/` | The Particle Increment Tree | cokecole526 | [repo](https://github.com/cokecole526/The-Particle-Increment-Tree) | `b6705d7` | 2026-05-23 |
| `the-pro-tree/` | The Pro Tree (专业之树) | chuangyou123 | [repo](https://github.com/chuangyou123/The-pro-tree) | `f211e55` | 2026-08-13 |
| `the-dice-tree/` | The Dice Tree (骰子树) | chuangyou123 | [repo](https://github.com/chuangyou123/The-Dice-Tree-ZH.github.io) | `792f9ed` | 2026-08-13 |

The eleventh transport target, **TMT Demo**, ships in this repo already at
[`../demo.html`](../demo.html) + `../js/Demo/` — it is Acamaeda's official example mod
from [Acamaeda/The-Modding-Tree](https://github.com/Acamaeda/The-Modding-Tree).

### Size (measured, not estimated)

"Mod lines" excludes bundled libraries (`vue.js`, `pako.js`, `break_eternity.js`),
which each tree vendors its own copy of.

| Folder | Mod lines | Mod files | Tree size |
|---|---|---|---|
| `prestige-tree-classic/` | 5,163 | 15 | 400K |
| `prestige-tree-rewritten/` | 13,934 | 15 | 2.8M |
| `prestige-tree-rewritten-ng/` | 16,877 | 15 | 2.9M |
| `incrementreeverse/` | 10,903 | 10 | 664K |
| `basic-tree/` | 3,797 | 13 | 312K |
| `milestone-tree/` | 16,573 | 48 | 1.2M |
| `prestige-tree-dimensions/` | 13,997 | 19 | 820K |
| `particle-increment-tree/` | 4,176 | 18 | 492K |
| `the-pro-tree/` | 24,047 | 63 | 1.5M |
| `the-dice-tree/` | 5,686 | 23 | 492K |

---

## Changes made to the copies

Everything else is untouched. Each modification is deliberate and necessary for the
copies to coexist on one origin.

> **v0.9 note:** the Universe Switcher (hard cut, swarm grid, save bridge) added **no
> further edits**. The hub talks to each tree *from outside* — every copy is same-origin,
> so `js/technical/multiverse.js` injects the ◀ RETURN pill into the child document and
> calls the child's own global `save()` when it unloads a frame. There is deliberately no
> `cpt-return.js` include in these `index.html` files: upstream stays byte-for-byte clean
> apart from the two items below, so re-vendoring a newer commit stays a one-file diff.

### 1. Unique save keys (important)

`localStorage` is scoped **per origin**, not per path. So every bundled tree shares
one save namespace with the Classic+ Tree and with each other. Two of them shipped
the same `modInfo.id`:

- `prestige-tree-rewritten` and `prestige-tree-rewritten-ng` — both `ptr`

On one origin that means one silently overwrites the other's save. Every id was
therefore rewritten to a unique `cpt_*` key:

| Tree | Original id | Now |
|---|---|---|
| Basic Tree | `gapples2` | `cpt_basic` |
| Incrementreeverse | `incrementy` | `cpt_incrementreeverse` |
| Milestone Tree | `c2nv4in9eusojg59bmo` | `cpt_miletree` |
| Particle Increment Tree | `PIT` | `cpt_particles` |
| PT: Dimensions | `ptdim` | `cpt_dimensions` |
| PT: Rewritten | `ptr` | `cpt_rewritten` |
| PT: Rewritten NG+ | `ptr` | **`cpt_ng`** |
| The Dice Tree | `diceyay` | `cpt_dice` |
| The Pro Tree | `1` | `cpt_pro` |
| Classic 1.0 | `"prestige-tree"` (hardcoded in `js/game.js`) | `cpt_classic` |

The TMT Demo in `../js/Demo/demoMod.js` was likewise changed `modbase` → `cpt_demo`.

**Do not "restore" these ids.** They look wrong compared to upstream, but reverting
them reintroduces save clobbering. It also means bundled saves never collide with a
save you already have from playing the original game on its own site.

### 2. `milestone-tree/index.html` — dead root-absolute script removed

The page had `<script src="/supporter_code_check.js">`. That file **does not exist in
the upstream repo**, so it already 404'd on the author's own site; and because the path
is root-absolute it would have resolved outside the `/trees/` mount point here. The tag
was replaced with a comment.

### 3. Files dropped to keep the bundle lean

`docs/`, `Old Code/`, `Old Things/`, `demo.html`, and `*.md` were excluded. No runtime
files were removed. `LICENSE` and `Prestige-tree-license` were **kept in every tree**.

---

## Licensing

- **The Modding Tree** — MIT, Acamaeda. Every modern tree here is a TMT mod and
  carries `LICENSE` + `Prestige-tree-license`.
- **Prestige Tree Classic / Rewritten** — MIT, Jacorb90.
- **The Milestone Tree, PT: Dimensions** — MIT (TMT) + `Prestige-tree-license`.
- **The Particle Increment Tree** — ⚠️ **no license file in the upstream repo.** It is
  bundled for completeness because the hub already featured it, and the author
  (cokecole526) is credited in-game and here. There is no explicit redistribution
  grant, so if cokecole526 objects, delete `particle-increment-tree/` and its
  `TRANSPORT_TREES.particles` entry in `../js/technical/transport.js`. It is the only
  entry below with unresolved licensing.

Third-party mods in this folder remain the property of their authors. They are
included to celebrate them, not to claim them.

---

## Adding another tree

1. Clone upstream into `trees/<slug>/`, strip `docs/`, `Old Code/`, `git`.
2. Rewrite `modInfo.id` (or the hardcoded `localStorage` key) to a unique `cpt_*`.
3. Add a `TRANSPORT_TREES.<key>` entry in `../js/technical/transport.js` with `url`,
   `repo`, `author`, `license`, `color`, `real: true`.
4. Done — the hub grid and the per-universe button pick it up automatically.
