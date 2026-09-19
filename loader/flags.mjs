// The loader's three OPT-INS, and the one place that decides whether each is on (docs/options.md).
//
// Each of `mobile`, `navbar` and `automation` is reachable two ways: the URL parameter it always had, and a stored
// preference the Options section writes (loader/options.js). This file is the resolution between them, split out of
// loader/page.js for one reason — it is the part that can be wrong in a way no page shows, so it is the part that
// gets unit tests (loader/flags.test.mjs) rather than a browser.
//
// ⛔ THE URL WINS, IN BOTH DIRECTIONS. `?mobile=1` turns the layout on over a stored `false`; `?mobile=0` turns it
// off over a stored `true`. The rule is PRESENCE, not truth: a parameter that is there answers for its flag and the
// store is not consulted. That is what keeps every gate able to ask for an inert page by URL alone, whatever this
// browser happens to remember — the harness never has to clear a preference it did not set.
//
// ⛔ AND THE DEFAULT IS OFF. Nothing here may make a flag true without either the URL or the store saying so: a page
// with neither is the page the loader has always served (gate M1's inertness leg).
export const FLAGS = ['mobile', 'navbar', 'automation'];

// ⚠ ONE KEY, FOR EVERY GAME, and deliberately NOT under `tmt-loader:<id>:` (docs/options.md, "Where it lives"):
// these say what kind of DEVICE and session the person wants, not anything about a game, and the per-game namespace
// is what the picker's "clear this game's save" deletes. It cannot collide with a game's prefix by construction —
// a prefix is `tmt-loader:<id>:` and ends in a colon, and this key has no second colon.
export const PREF_KEY = 'tmt-loader:ui.flags';

/** The stored preferences as a plain object. Anything we did not write reads as nothing stored. */
export function parsePrefs(raw) {
  const out = {};
  let v = null;
  try { v = raw ? JSON.parse(raw) : null; } catch { return out; }
  if (!v || typeof v !== 'object' || Array.isArray(v)) return out;
  for (const f of FLAGS) if (typeof v[f] === 'boolean') out[f] = v[f];
  return out;
}

/** What to store for `prefs`: the flags that are ON, and `null` when that is none of them.
 *  ⚠ A stored `false` and an absent key resolve identically (both are "off"), so `false` is never written — which
 *  keeps "nothing remembered" and "everything off" the same state, and keeps an empty key out of the store. */
export function serializePrefs(prefs) {
  const on = {};
  for (const f of FLAGS) if (prefs && prefs[f] === true) on[f] = true;
  return Object.keys(on).length ? JSON.stringify(on) : null;
}

/**
 * Resolve the three flags. `params` is a URLSearchParams (anything with `has`/`get`), `prefs` a parsePrefs result.
 * Returns `{mobile, navbar, automation, source: {…}}`, where source is `url` | `stored` | `implied` | `default`.
 *
 * `?mobile=1` IMPLIES the bar, as it always has — so a `navbar` answer, from either place, cannot turn the bar off
 * under the mobile layout. The Options section renders that button locked and says why, rather than offering a
 * press that would do nothing.
 */
export function resolveFlags(params, prefs = {}) {
  const answer = (name) => {
    if (params && params.has(name)) return { on: params.get(name) === '1', source: 'url' };
    if (prefs && typeof prefs[name] === 'boolean') return { on: prefs[name], source: 'stored' };
    return { on: false, source: 'default' };
  };
  const mobile = answer('mobile');
  const navbarOwn = answer('navbar');
  const automation = answer('automation');
  const navbar = mobile.on && !navbarOwn.on ? { on: true, source: 'implied' } : navbarOwn;
  return {
    mobile: mobile.on, navbar: navbar.on, automation: automation.on,
    source: { mobile: mobile.source, navbar: navbar.source, automation: automation.source },
  };
}
