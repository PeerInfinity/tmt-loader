# The Options section — the URL-only flags, as buttons

The loader has three opt-ins, and until U3 the only way to reach any of them was to type it into the address bar:

| flag | what it opts into | doc |
|---|---|---|
| `?mobile=1` | the single-column mobile LAYOUT (`loader/mobile.css`); implies the bar | [mobile.md](mobile.md) |
| `?navbar=1` | the bottom NAV BAR and the layer list it opens | [mobile.md](mobile.md) |
| `?automation=1` | the automation registry, the `au` layer, `games-auto/<id>.js` | [automation.md](automation.md) |

Since U3 each is also a button in the game's own **options tab**, and a choice made there is remembered. Nothing
about the flags themselves changed: the parameters mean what they always meant, and a page that carries neither a
parameter nor a remembered choice is the page the loader has always served.

`?mod=`, `?managed=1`, `?profile=` and `?autoOpt=` are **not** in the section and should not be. They are how the
harness and the runner ask for a particular kind of page — a paused loop, a profile applied after `onload`, options
handed to the automation tables — and none of them is a preference a person would set and keep. `?managed=1` in
particular would make a browser that remembered it look broken: the game would never run.

## Every one of these needs a reload, and the section says so

This is the fact that shapes the whole design, and it is not a limitation that could be engineered away cheaply:

- `mobile` puts `tmt-mobile` on `<html>` at `page.js:37`, deliberately **before the game's markup**, so there is no
  unstyled flash, and links `loader/mobile.css` after the game's own sheets so equal specificity is broken by
  source order;
- `navbar` decides whether `loader/navbar.js` is inserted at all, after `tmt-auto.js`;
- `automation` decides whether the registry is loaded, which is what creates the `au` layer and its `player.au`.

So no button here can switch a mode in place. ⚖ **The decision (U3): a press RELOADS, immediately.** The
alternative — write the preference, tell the person it applies next time — was rejected because the failure it
risks is the one thing a toggle may not do: look pressed and change nothing. A reload is visible, it is what the
person asked for, and the page they get back is exactly the page the URL parameter would have given them. The note
under the buttons says it in the panel, before anything is pressed.

## The press drops the parameter, and that is not the URL losing

⛔ **The URL answers first, always.** A parameter that is PRESENT answers for its flag and the stored preference is
not consulted — `?mobile=1` over a remembered *off*, `?mobile=0` over a remembered *on*. The rule is presence, not
truth, so `?mobile=` and `?mobile=no` are both "off, explicitly". That is what lets every gate ask for the page it
wants by URL alone, on any browser, without first clearing a preference it did not set.

Which leaves one trap, and the gate's leg 6 exists for it: a press made on a page that carries `?mobile=1` would
write a preference the very next load would then ignore, and **the button would appear to do nothing** — the exact
failure the reload was chosen to avoid. So a press removes that flag's parameter from the address on its way out
(`location.replace`, no history entry) and lets the remembered choice apply. A deliberate press is the person
answering for that flag; the address stops answering for it. Nothing else in the URL is touched.

The note in the panel changes accordingly: when the address is answering for a flag right now, it says so and says
that pressing will drop it.

## Where the preference lives

One key, for every game:

```
tmt-loader:ui.flags     {"mobile":true}          // only the flags that are ON; absent key = nothing remembered
```

⚖ **It is deliberately NOT under `tmt-loader:<id>:`**, which is where U2c put the layer list's expanded-card state.
Two reasons, and the second is the one that would bite:

1. these say what kind of DEVICE and session the person wants — a phone layout, the automation tools — not anything
   about a game. Someone reading on a phone wants the phone layout for the next game too, and having to set it once
   per game is the defect, not the feature;
2. the per-game namespace is exactly what the picker's **"clear this game's save"** button deletes: it counts and
   removes every key under that game's prefix. U2c hit this and ruled that the layer list's card state SHOULD go
   with the save, because it is about that game's layers. A layout preference is not, and losing your phone layout
   because you reset one game's progress would be a surprise with no upside.

It cannot collide with a game's namespace by construction: a save prefix is `tmt-loader:<id>:` and ends in a colon,
and this key has no second colon. `loader/flags.test.mjs` asserts that property rather than trusting it.

⚠ It is read and written through the **raw** `Storage` methods, captured in `page.js` before `installSavePrefix()`
patches the prototype — the shim would otherwise namespace the loader's own key into whichever game is open. It is
also read at module top, because `mobile` decides a class that goes on `<html>` long before the shim exists. Every
read and every write is wrapped: a private window, blocked site data or a full quota costs the preference, never
the page.

A stored `false` is never written. "Nothing remembered" and "everything off" resolve identically, so the key holds
only the flags that are on and is removed when that is none of them — which keeps an inert page's store empty.

## Where the section goes, and how it finds the options tab

`loader/options.js` is the one loader file inserted with **no flag in front of it**, and it has to be: a page that
carries none of the flags is exactly the page that needs to offer them. What that costs an untouched page is one
`<div>` inside the game's own options tab, while that tab is open — and nothing anywhere else. No `<head>` entry
(the section's few style rules are added with the section, the first time it is built), nothing in `player`, no
timer, no request.

It knows no tab id, for the same reason the nav bar does not (mobile.md, "It knows no tab ids"): the ids differ
between engines. Two facts carry it instead, and **both** are required before anything is inserted:

- every game's options tab draws `<button class="opt" onclick="hardReset()">` — 2.2.1 writes it into `index.html`,
  2.7 into the `options-tab` component — so a live `button.opt` **is** the options tab, rendered;
- every game has the corner control `#optionWheel`, carrying `v-if="player.tab != '<its options tab>'"`, so the
  wheel being ABSENT is that engine's own statement that the options tab is the open one.

The wheel alone would be satisfied by a game that has no wheel; `.opt` alone by a game that draws an option button
somewhere else. Together they are the options tab and nothing else. The section is then appended to the tab's own
column (`.col` / `.fullWidth`, the layout classes both engines give a tab), so it lands at the bottom of the tab
rather than inside whichever sub-table the anchor was in — and it is REMOVED the moment the options tab is not the
open one, because in 2.7 that column is shared with every other layer tab.

⚠ **Both anchors are properties of the GAMES, so they are censused, not assumed.** `tools/census-figures.mjs`
measures them over the entry document and the loaded sources — **all 171 of the 171 games carry both the
`hardReset()` option button and `#optionWheel`** — and refuses if a game ever arrives without one. That check
exists because nothing that DRIVES games could tell you: a section that is never built throws nothing, reddens
nothing, and simply is not there.

The buttons wear the game's own `opt` class, so they look like the options they sit under in every engine without
this file shipping a theme.

### The bar's Options button, not the wheel

⚠ MEASURED, and it is the one thing the U3 brief did not predict: on a `?mobile=1` or `?navbar=1` page the corner
wheel is still in the DOM but the bar's stylesheet hides it, so a *click* on it waits for visibility forever. There
the affordance is the bar's own **Options** button, which forwards a click to the wheel — which is precisely why
the section is reachable in both modes at all. The gate opens the tab the way a person on that page would.

## The bar under the mobile layout

`?mobile=1` implies the bar, as it always has, so under the mobile layout the Nav bar button is drawn **locked**
and labelled `Nav bar: ON (with the mobile layout)`, with a title saying to turn the layout off to get the button
back. A press on it writes nothing and reloads nothing. That is the one control here that does not act, and it
says why on its face rather than accepting a press and ignoring it.

## What `tmtLoader` gained

`flags`, `flagSource`, `prefs` and `optionsUI` — see [contract.md](contract.md). `flagSource` is the interesting
one: `url` | `stored` | `implied` | `default`, per flag, which is how the panel can say that the address is
overriding what this browser remembers.

## The gate (O1)

```
node tools/harness/page.mjs ptr something the-alphabetree a-tree-about-layers --gate options
```

⛔ **Nothing in it asserts that a key was written.** A toggle that writes a key and reloads is indistinguishable
from one that works, if the page was going to render that way anyway — so every verdict below is the RENDERED
page: the classes on `<html>`, the loader's three stylesheets, the bar and its visible buttons, `au` nodes and
`player.au`, and the loader files that were executed. Where two pages are compared, they are compared against each
other, never against a hand-written expectation.

| leg | what it asserts |
|---|---|
| section | on a plain page nothing exists yet — no section, not even the `<style>`; the game's own corner control (or the bar's Options button) opens the tab; the section is there with three buttons, inside the tab's column, after the game's own option buttons, none locked, the note stating the reload; leaving the tab removes it again |
| inertness | a page with neither a parameter nor a stored preference: `mobile`/`navbar`/`automation` all false, no `tmt-*` class, none of the three stylesheets, no bar, no `navbarUI`/`layerListUI`, 0 `au` nodes, no `player.au`, no mobile/navbar/layerlist file executed — and an empty store. ⛔ This is gate M1's own inertness leg, re-asked here because U3 added a second way to break it |
| stored ≡ URL | for each flag: the page a stored preference produces equals the page `?flag=1` produces, field for field — and that page is NOT the plain page, or "equal" would be vacuous. The sources differ (`url` vs `stored`), which is the only way they may differ |
| URL overrides | for each flag, in BOTH directions: `?flag=1` over a stored `false` gives the flagged page; `?flag=0` over a stored `true` gives the PLAIN page — not merely a false in the loader's object |
| the press | the DISCRIMINATOR. The real button is clicked, on a page rendering the other way: the page that comes back equals the `?flag=1` page for `mobile` and for `automation`, and a second press brings back the plain page exactly. `flagSource` is then `stored`, and the store is empty again after the second press |
| a press over a parameter | starting from `?mobile=1`, a press comes back as the plain page **and** with no `mobile=` left in the address — the leg that catches "wrote a key, reloaded, nothing changed" |

Every page in every leg is drawn in its own browser context, because a stored preference is per browser and a leg
that writes one must not reach the next leg's page. Page errors and blocked requests are collected across all of
them and a non-zero count fails the row.

## What is not in it

- **the picker page.** The preference is global and the picker is where a person chooses a game, so the toggles
  arguably belong there too. They are not there yet: `loader/options.js` is inserted by `boot()`, which the picker
  never runs. Nothing about the storage would have to change.
- **anything per game.** All three toggles are one global preference. If a per-game override is ever wanted, it is
  a second key under `tmt-loader:<id>:` and a resolution order of URL → game → global; nothing here forecloses it.
