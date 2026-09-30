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
export function serializePrefs(prefs, { keepFalse = false } = {}) {
  const on = {};
  for (const f of FLAGS) if (prefs && (prefs[f] === true || (keepFalse && prefs[f] === false))) on[f] = prefs[f];
  return Object.keys(on).length ? JSON.stringify(on) : null;
}
// ⚠ (S4) `keepFalse` IS THE AUTHOR'S PAGE ONLY (docs/embed.md). There an author can make a feature ON BY DEFAULT, so
// "off" is no longer the state nothing-remembered resolves to: a player who turns a default-on feature off has to have
// that remembered, or the next load turns it straight back on. So an author's page stores the player's answer
// either way, and the hosted page — where every default is off — still never writes a `false`.

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

// ---------------------------------------------------------------- (S4) an AUTHOR'S OWN PAGE (docs/embed.md)
//
// The same three flags, on a page the loader did not build. Two things are new, both the author's (⚖ R15):
//   · LOADED — whether the feature is offered at all. A feature the author did not load is OFF, has no button, and a
//     URL parameter for it is IGNORED (the author said no; an address cannot overrule that);
//   · ON BY DEFAULT — what a loaded feature does when nobody else has said anything.
// So the order for a LOADED feature is: the URL (presence, as on the hosted page) → the player's remembered choice →
// the author's default → off. `source` gains two values: `author` (the author's default answered) and `absent`
// (not loaded).
//
// ⚖ THE BAR UNDER THE MOBILE LAYOUT is decided here, once, for both pages: the mobile layout always shows the bar
// (it always has — `?mobile=1` implies `?navbar=1`). When the author loaded the mobile layout but NOT the nav bar, the
// layout still brings its bar — the mobile page is the same page it is everywhere — and there is simply no Nav bar
// button: the player cannot have the bar without the layout. Nothing is refused and nothing is warned about.

/** The author's settings, normalised: `{load: {mobile, navbar, automation}, on: {…}}`, every value a boolean. */
export function normaliseSettings(s = {}) {
  const load = {}, on = {};
  for (const f of FLAGS) {
    load[f] = !(s.load && s.load[f] === false);            // loaded unless the author said not
    on[f] = !!(s.on && s.on[f] === true) && load[f];      // on by default only if said, and only if loaded
  }
  return { load, on };
}

/** Resolve the three flags on an author's page. `settings` as normaliseSettings returns. */
export function resolveEmbedFlags(params, prefs = {}, settings = normaliseSettings()) {
  const S = normaliseSettings(settings);
  const answer = (name) => {
    if (!S.load[name]) return { on: false, source: 'absent' };
    if (params && params.has(name)) return { on: params.get(name) === '1', source: 'url' };
    if (prefs && typeof prefs[name] === 'boolean') return { on: prefs[name], source: 'stored' };
    if (S.on[name]) return { on: true, source: 'author' };
    return { on: false, source: 'default' };
  };
  const mobile = answer('mobile');
  const navbarOwn = answer('navbar');
  const automation = answer('automation');
  const navbar = mobile.on && !navbarOwn.on ? { on: true, source: 'implied' } : navbarOwn;
  return {
    mobile: mobile.on, navbar: navbar.on, automation: automation.on,
    source: { mobile: mobile.source, navbar: navbar.source, automation: automation.source },
    loaded: { ...S.load },
  };
}

// ---------------------------------------------------------------- (S4) the v1 SETTINGS — the tag and tmt-loader.json
//
// ⚖ R1: this is the v1 INTERFACE. A name here is a promise; a breaking change is v2, never an edit.
//   the tag:  <script src="…/v1/embed.js" data-load="mobile navbar automation" data-on="navbar" data-game="ptr"
//                     data-settings></script>
//   the file: tmt-loader.json beside the page — {"load": [...], "on": [...], "game": "…", "autoTable": {…}}
// A field the FILE carries replaces the same setting from the TAG (per field); a field neither says anything about
// takes the built-in default: every feature LOADED, none ON, no game id, the derived automation table.
export const SETTINGS_FILE = 'tmt-loader.json';
export const FILE_KEYS = ['load', 'on', 'game', 'autoTable'];
const GAME_ID = /^[a-z0-9][a-z0-9-]*$/;

/** A feature list — "mobile navbar" (tag) or ["mobile", "navbar"] (file) — as {flag: true}; unknown names warned. */
export function parseList(v, where, warn = () => {}) {
  const words = Array.isArray(v) ? v.map(String) : String(v).split(/[\s,]+/);
  const out = {};
  for (const f of FLAGS) out[f] = false;
  for (const w of words) {
    if (!w) continue;
    if (FLAGS.includes(w)) out[w] = true;
    else warn(`${where}: "${w}" is not a feature (known: ${FLAGS.join(', ')}) — ignored`);
  }
  return out;
}

/**
 * The author's settings from the tag's attributes (a dataset-like object) and the parsed file (or null).
 * Returns {load, on, game, table, from: {load, on, game, table}} — `from` says which of `tag` | `file` | `default`
 * answered each, which the page records (tmtLoader.settings) and the gate reads.
 */
export function readSettings(dataset = {}, file = null, warn = () => {}) {
  const from = { load: 'default', on: 'default', game: 'default', table: 'default' };
  let load = null, on = null, game = null, table = undefined;
  if (dataset.load !== undefined) { load = parseList(dataset.load, 'data-load', warn); from.load = 'tag'; }
  if (dataset.on !== undefined) { on = parseList(dataset.on, 'data-on', warn); from.on = 'tag'; }
  if (dataset.game !== undefined && dataset.game !== '') { game = String(dataset.game); from.game = 'tag'; }
  if (file && typeof file === 'object' && !Array.isArray(file)) {
    for (const k of Object.keys(file)) if (!FILE_KEYS.includes(k)) warn(`${SETTINGS_FILE}: unknown key "${k}" (known: ${FILE_KEYS.join(', ')}) — ignored`);
    if (file.load !== undefined) { load = parseList(file.load, `${SETTINGS_FILE} load`, warn); from.load = 'file'; }
    if (file.on !== undefined) { on = parseList(file.on, `${SETTINGS_FILE} on`, warn); from.on = 'file'; }
    if (file.game !== undefined) { game = file.game === null || file.game === '' ? null : String(file.game); from.game = 'file'; }
    if (file.autoTable !== undefined) { table = file.autoTable; from.table = 'file'; }
  } else if (file !== null) warn(`${SETTINGS_FILE}: not a JSON object — ignored`);
  if (game !== null && !GAME_ID.test(game)) { warn(`game id "${game}" is not a loader id — ignored`); game = null; }
  for (const f of FLAGS) if (on && on[f] && load && !load[f]) warn(`"${f}" is on by default but not loaded — it stays off`);
  const S = normaliseSettings({ load: load || undefined, on: on || undefined });
  return { load: S.load, on: S.on, game, table, from };
}
