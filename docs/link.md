# Playing a game straight from its repository (link mode)

The loader can open a game from **its author's own GitHub repository**, without a copy of it in the loader. The
address names the repository:

```
https://peerinfinity.github.io/tmt-loader/?repo=<owner>/<name>
https://peerinfinity.github.io/tmt-loader/?repo=<owner>/<name>@<commit>
```

For example `?repo=Jacorb90/Prestige-Tree`. The page is built the same way as for a game the loader hosts: the
game's own `index.html` is read, the libraries the loader keeps a copy of (Vue) are swapped in, the game's save is
kept separately from every other game's, and the options you can turn on (the mobile layout, the nav bar, the
automation tools) work exactly as on a hosted game — including `&mobile=1`, `&navbar=1` and `&automation=1`.

⚠ **A game opened this way is not tested the way the loader's own games are.** The loader's hosted games each passed
its gates at one pinned commit; a repository opened by link is whatever its author has there now (or at the commit
you name). The page says so at the top, with where the game came from.

## For authors: try your game in the loader

If your game is on GitHub, you do not need to do anything: `?repo=<you>/<your-repo>` opens it. If you want the
loader's extras on **your own page** instead, that is [embed mode](embed.md).

If your repository has a `tmt-loader.json` beside its `index.html` (the same file embed mode reads — see
[embed.md](embed.md#the-settings-file-tmt-loaderjson-optional)), link mode reads it too, and its **`autoTable`**
replaces the loader's own automation table for your game. Its other fields (`load`, `on`, `game`) are for your own
page and are not used here: on the loader's page, what is on is the player's choice, as on every hosted game.

## Where the files come from

There are three places the loader can read a game from:

| source | what it is | `&source=` |
|---|---|---|
| **the author's own site** | the repository's GitHub Pages site, `https://<owner>.github.io/<name>/` — what the author publishes | `pages` |
| **jsDelivr** | a free CDN that serves any public GitHub repository **at one exact commit** | `cdn` |
| **the loader's own copy** | the copy the loader hosts — only for a game the loader lists | `hosted` |

The loader tries them in order and uses the first that works, and while it works the page says, in plain words,
which one it is trying and why it moved on. The order depends on whether the link names a commit:

- **No commit** (`?repo=owner/name`, "the latest"): the author's site → jsDelivr at the latest commit → the loader's copy.
- **A commit** (`?repo=owner/name@<commit>`): jsDelivr at that commit → the loader's copy → the author's site **last**.
  An author's site serves whatever they last published and cannot be asked for an older commit, so when it is used
  for a link that names one, the page says it may not be that commit. (The loader's copy is at the commit the loader
  tested; if the link names another, the page says that too.)

`&source=pages`, `&source=cdn` or `&source=hosted` makes the loader use that one source and no other.

Links from the [TMT fork census](https://peerinfinity.github.io/tmt-fork-census/) to games opened this way name the
commit the census tested, so they keep opening the version that was tested.

### Limits worth knowing

- **GitHub allows 60 questions an hour** from one address without an account. The loader asks GitHub only when a link
  has **no** commit **and** it has to use jsDelivr (it must learn which commit is the latest first) — one question,
  remembered until the browser tab is closed. A link with `@<commit>` never asks GitHub anything. When the hour's
  questions are used up, the loader moves on to its own copy (for a game it lists) and says why.
- **jsDelivr serves files up to 20 MB each.** Two of the games the loader lists have files over that (The Wall Tree's
  `discord.png` and `remove.png`, The Periodic Table Tree's `resources/Nitrogen.gif`; the loader's own copies are
  compressed). For those, and for any repository whose jsDelivr listing shows a file over 20 MB, the loader skips
  jsDelivr and uses its own copy when it has one; otherwise it loads from jsDelivr and says which files will not load.
  The list for the loader's games is `link/cdn-over-limit.json`; for any other commit the loader asks jsDelivr's
  listing (`data.jsdelivr.com`), which answers for repositories up to 50 MB.
- **An author's site on its own domain** cannot be read through GitHub Pages: GitHub answers the `github.io` address
  with a redirect that browsers will not let another site follow (it carries no CORS header). The loader then moves
  on to jsDelivr, and says so. (Prestige Tree Rewritten is one: `jacorb90.github.io` redirects to `jacorb90.me`.)
- **Files from other sites.** Like the hosted games, a game opened by link never loads code from another website: the
  Vue library is replaced with the loader's copy (the same minor version, 2.6 or 2.7), and anything else a game's
  page names from another site (web fonts, analytics, other libraries) is left out — the page's *details* list says
  which. A game that needs such a library will not work here.

## Saves

A game the loader lists keeps **the same save** as on its hosted page (`?mod=<id>`): opening it by link continues
where you were. Any other repository gets its own save, named after the repository (`gh--<owner>--<name>`). As on
every loader page, saves stay in your browser.

## Games the loader does not list

A repository the loader looked at and declined still opens by link. The page shows the reason the loader recorded
(for example "crashes at load"), so you know what to expect. Everything else about it is the same as for any
repository the loader does not list: its manifest is worked out from its `index.html` when the page loads.

## For developers

`loader/link.mjs` resolves a link into what the page builds from (the id, the manifest, the source); `loader/page.js`
builds it (`bootLink` → the same `build` the hosted page uses, and the R8 seam's `gameBase(id, source)`). The record of
what happened is `window.tmtLoader.link` (`source`, `commit`, `tried`, `warnings`, `notices`, `api`). The gate is L1,
`tools/harness/link.mjs` — see [harness.md](harness.md#gate-l1--link-mode-the-games-own-repository-with-the-network-faked-s5-2026-09-29).
