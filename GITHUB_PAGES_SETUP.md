# GitHub Pages — github.io Treatment — Complete Guide

This repo is **ready for github.io**. You have two instant ways to share, and one proper Pages way.

---

## Option A: Instant Share (no setup, works NOW)

**Raw Githack** — works on any branch, no Pages needed:
```
https://raw.githack.com/certainjellyfish9204/The-Modding-Tree/arena/01a01656-the-modding-tree/index.html
https://raw.githack.com/certainjellyfish9204/The-Modding-Tree/master/index.html
```
Just replace `certainjellyfish9204` with your username, and `arena/...` or `master` with your branch. This is what the official TMT tutorial suggests.

**Local Preview in Arena:**
- Port 8000 is running (`python3 -m http.server 8000`). Open the Live Preview pane.

---

## Option B: Proper github.io (recommended, one-time setup)

Your game will be at **`https://certainjellyfish9204.github.io/The-Modding-Tree/`** — clean, fast, no `raw.githack` wrapper.

### What’s done already
- ✅ `.nojekyll` at repo root — tells GitHub Pages to skip Jekyll and serve `js/`, `css/` as-is. Without it, files starting with `_` or `js/` can be hidden.
- ✅ `index.html` uses **relative paths** (`js/...`, `css/...`) so it works under `/The-Modding-Tree/` subpath (no `<base>` needed).
- ✅ `README.md` badge and links updated.

### What to do (30 seconds, one time)

#### 1. Enable Pages — Pick ONE method:

**Method 1 — GitHub.com UI (easiest, no CLI):**
1. Go to `https://github.com/certainjellyfish9204/The-Modding-Tree/settings/pages`
2. Under **Build and deployment → Source**, choose **Deploy from a branch**
3. Branch: `master` (or `arena/01a01656-the-modding-tree` if you want this branch live), Folder: `/ (root)`, Save.
4. Wait ~1 minute. Your site appears at `https://certainjellyfish9204.github.io/The-Modding-Tree/`.

**Method 2 — GitHub CLI (if you have `gh` auth with `repo` scope):**
```bash
# Classic branch deploy (no Actions needed):
gh api repos/certainjellyfish9204/The-Modding-Tree/pages -X POST -f source.branch=master -f source.path=/

# — or if branch is arena:
gh api repos/certainjellyfish9204/The-Modding-Tree/pages -X POST -f source.branch=arena/01a01656-the-modding-tree -f source.path=/
```

**Method 3 — GitHub Actions (modern, auto-deploy on every push):**
> Due to Arena’s token lacking `workflows` scope, the workflow file couldn’t be pushed automatically. Do this via the GitHub UI:

1. On GitHub.com, go to your repo → **Add file → Create new file**
2. Path: `.github/workflows/pages.yml`
3. Paste this:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["master", "arena/01a01656-the-modding-tree"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Pages
        uses: actions/configure-pages@v5
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

4. Commit directly to `master` (or `arena`).
5. Then go to **Settings → Pages → Build and deployment → Source: GitHub Actions**, Save.
6. Push any commit — watch **Actions** tab for green check.

> After this, every `git push origin master` (or to `arena`) auto-deploys in ~45s. No need to touch settings again.

---

### Why `.nojekyll` matters
Without it, GitHub Pages runs Jekyll which ignores files/folders starting with `_` and can mangle `css/`, `js/technical`. `.nojekyll` guarantees your `break_eternity.js`, `save.js`, etc are served verbatim.

### Verifying deploy
- **Actions tab:** `https://github.com/certainjellyfish9204/The-Modding-Tree/actions` — look for “Deploy to GitHub Pages” run.
- **Pages URL:** `https://certainjellyfish9204.github.io/The-Modding-Tree/`
- **Branch mode:** Check **Settings → Pages** shows green banner “Your site is live”.
- **404 fix:** If you see 404, wait 2 minutes, hard-refresh (Ctrl+Shift+R), check that `index.html` is at repo root (not in `docs/`).

### Merging this branch to master (so Pages shows your Classic+ Tree)

You’re on `arena/01a01656-the-modding-tree` ahead of `master`. To publish:

```bash
git checkout master
git merge arena/01a01656-the-modding-tree
git push origin master
# — or open a PR:
gh pr create --title "Publish Classic+ Tree + Safe Storage" --body "v0.2" --base master
gh pr merge --merge
```

In Arena, you can’t push to `master` directly (branch locked to `arena/...`), so open a PR via `gh`:

```bash
gh pr create --title "feat: github.io ready + Classic+ + safe storage" --body "Adds .nojekyll, README links, Classic+ layers, fallback storage" --base master --head arena/01a01656-the-modding-tree
```

Then merge it on GitHub.com → your Pages site updates.

---

### Workflow badge (already in README)
```md
[![Deploy](https://github.com/certainjellyfish9204/The-Modding-Tree/actions/workflows/pages.yml/badge.svg)](https://github.com/certainjellyfish9204/The-Modding-Tree/actions/workflows/pages.yml)
```

---

### TL;DR for Arena

- ✅ `.nojekyll` committed + pushed to `arena`
- ⏳ Pages not yet enabled (needs one click in Settings or `gh api` with admin)
- 📄 Workflow template saved here — create `.github/workflows/pages.yml` via GitHub UI to unlock Actions deploy
- 🔗 Share NOW via `raw.githack.com/.../arena/01a01656-the-modding-tree/index.html`
- 🚀 After you enable Pages (branch or Actions), share via `https://certainjellyfish9204.github.io/The-Modding-Tree/`

Need me to open the PR or enable Pages via CLI? Say the word and I’ll run the `gh pr create` + `gh api` for you (requires your GitHub reconnect if token lacks scope).
