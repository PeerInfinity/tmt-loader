# Adding tmt-loader's extras to your own game page

If you made a game with The Modding Tree, you can give your players tmt-loader's optional extras on **your own
page**, without the loader hosting a copy of your game. Your players keep playing on your site, with their saves
where they have always been.

There are three extras. Each one is a button in your game's own options tab, and each is **off until a player turns
it on** (or until you choose to turn it on by default):

| extra | what the player gets |
|---|---|
| **Mobile layout** | one column with large buttons, for a phone. It always comes with the nav bar. |
| **Nav bar** | a bar along the bottom, with a Layers view that lists every layer. Useful on a desktop too. |
| **Automation tools** | an AU tab that can reset and buy things for you, each feature off until the player turns it on. |

Nothing about your game changes unless somebody turns one of these on — you, by choosing a default, or a player,
with the button. A page with the tag and nothing turned on is your page as it was, plus the buttons in the options
tab.

## The one line

Add this to your `index.html`, **after your game's own `<script>` tags** (the end of `<head>` is fine):

```html
<script src="https://peerinfinity.github.io/tmt-loader/v1/embed.js"></script>
```

That is all. With nothing else, your players get all three buttons, all off.

### Choosing what is offered and what is on

Two optional attributes, each a list of extras (`mobile`, `navbar`, `automation`, separated by spaces):

| attribute | what it means | if you leave it out |
|---|---|---|
| `data-load` | which extras are **offered**. An extra you leave out has no button and cannot be turned on at all, not even with a link. | all three are offered |
| `data-on` | which of the offered extras are **on when the page loads**, for a player who has not chosen yet | none are on |

So every extra has its own two settings — offered or not, and on by default or not — for six in all. For example:

```html
<!-- offer only the mobile layout and the nav bar, and turn the nav bar on by default -->
<script src="https://peerinfinity.github.io/tmt-loader/v1/embed.js"
        data-load="mobile navbar" data-on="navbar"></script>
```

- The mobile layout always shows the nav bar. If you offer the mobile layout but not the nav bar, a player who turns
  the mobile layout on still gets the bar with it; there is just no separate Nav bar button.
- Listing something in `data-on` that you did not offer does nothing (the console says so).

Two more, both optional:

- `data-game="<id>"` — if your game is also on the loader's site, its id there (the part after `?mod=` in the link,
  e.g. `ptr`). The automation tools then use the loader's tuned settings for your game, if it has any, and the nav
  bar's Layers view can show which currency each buyable costs. Without it, the automation tools work out their
  settings from your game itself.
- `data-settings` — also read a settings file, `tmt-loader.json`, from the same folder as your `index.html` (below).

## The settings file, `tmt-loader.json` (optional)

Everything the attributes say can also go in a file next to your `index.html`, plus one thing the attributes cannot
hold: your own automation settings. The loader reads it only when the tag has `data-settings`:

```html
<script src="https://peerinfinity.github.io/tmt-loader/v1/embed.js" data-settings></script>
```

```json
{
  "load": ["mobile", "navbar", "automation"],
  "on": ["navbar"],
  "game": "ptr",
  "autoTable": { "formatVersion": 1, "unlockOrder": [["g", "b"]] }
}
```

| field | same as | notes |
|---|---|---|
| `load` | `data-load` | a list |
| `on` | `data-on` | a list |
| `game` | `data-game` | `null` means "no id", even if the tag has one |
| `autoTable` | — | your automation settings, in the same format as the loader's own tables ([automation.md](automation.md)). **It replaces the loader's table for your game.** `id` may be left out. |

Every field is optional. **When the file and the tag both say something about the same field, the file wins** — for
that field only; a field the file leaves out keeps the tag's value. So the tag can carry your usual settings and the
file can change one of them.

The file is read once per browser tab: after you change it, open the game in a new tab to see the change. If the file
is missing or is not valid JSON, the tag's settings apply and the console says why. If your `autoTable` has a mistake
the automation tools say what it is in the console and are not added — your game still runs normally.

## What your players see

- In your game's **options tab**, under your own options, a small *tmt-loader* section with one button per extra you
  offer, saying `ON` or `OFF`. Pressing one turns it on or off and reloads the page.
- A player's choice is **remembered in their browser** and wins over your default: if you turn the nav bar on by
  default and a player turns it off, it stays off for them. The choice is stored under a `tmt-loader:` key, never in
  your game's save, and it applies to every game on your site that uses the tag.
- A link can also turn an extra on or off for one visit, e.g. `your-game/?mobile=1` or `?navbar=0`. A link wins over
  both the player's remembered choice and your default. It does nothing for an extra you did not offer.
- The extras keep their own small bits of state (which cards in the Layers view are open, and so on) under
  `tmt-loader:@<your page's folder>:` keys. Your game's own save keys are never read, changed or removed.

## How it loads, and what if the loader is down

The tag waits until your page has finished loading its own scripts, adds the extras, and then lets your game's
`onload` run — so the automation tools are in place before your game starts, exactly as on the loader's own site.
If the loader's site cannot be reached, or keeps your game waiting more than 20 seconds, your game starts without
the extras. The tag never stops your game from starting.

The extras come from the loader's site, `peerinfinity.github.io`. Nothing is sent anywhere else, and the loader does
not see your players' saves.

## Versions

The `v1` in the address is a promise: **anything that would break a page using `v1` will be `v2`, at a new
address**, and `v1` keeps working. The address above always gives you the latest version 1.

If you would rather nothing changed at all without you choosing it, use an exact version from jsDelivr instead:

```html
<script src="https://cdn.jsdelivr.net/gh/PeerInfinity/tmt-loader@v1.0.0/v1/embed.js"></script>
```

That copy never changes. The versions are listed on the loader's
[releases/tags page](https://github.com/PeerInfinity/tmt-loader/tags).

## Problems, questions, requests

Please [open an issue](https://github.com/PeerInfinity/tmt-loader/issues) on the loader's repository. It helps to
include your game's link and what the browser console says (lines starting with `tmt-loader:`).

---

*For the loader's developers:* the tag is `v1/embed.js`, which imports `loader/embed.mjs`; the extras themselves are
`loader/attach.mjs`, the same code the hosted page uses (`loader/page.js` = boot + attach). The rules for which
extras are on are in `loader/flags.mjs` (`readSettings`, `resolveEmbedFlags`) and its tests in
`loader/embed.test.mjs`; the browser gate is `tools/harness/embed.mjs` (E1, [harness.md](harness.md)).
