// EMBED MODE — the loader's extras on an AUTHOR'S OWN game page (S4; docs/embed.md is the author's document).
//
// The author adds ONE line to their own index.html, after their game's scripts:
//   <script src="https://peerinfinity.github.io/tmt-loader/v1/embed.js"></script>
// v1/embed.js (a classic script, so it knows its own URL) holds the page's `load` event and imports this module from
// the same tree it was served from; this module decides which features are on, puts them onto the page with
// attach.mjs — the very code the hosted page uses — and then lets the page's `load` event through, so the game's own
// `onload` runs with the extras already in place, exactly where the hosted page runs it.
//
// ⛔ WHAT IS NOT HERE, ON PURPOSE:
//   · no `gameBase`, no `<base href>`, no interpret, no vendor swap: the author's page built itself;
//   · NO SAVE PREFIX. One game per page, and the author's players keep their saves exactly where the game put them;
//   · no timers shim, so no `?managed=1` — that is the harness's lever on the page the loader builds;
//   · no overlay on failure. If anything here fails, the game still starts, without the extras, and the reason is in
//     the console (and `tmtLoader.error`). An author's page must never be broken by the loader.
import { FLAGS, PREF_KEY, SETTINGS_FILE, parsePrefs, serializePrefs, resolveEmbedFlags, readSettings } from './flags.mjs';
import { attachStyles, attachScripts } from './attach.mjs';

const warn = (m) => console.warn(`tmt-loader: ${m}`);

/**
 * entry = {src, dataset, stop, release} from v1/embed.js:
 *   src      the entry script's absolute URL (the loader's root is the directory above `v1/`)
 *   dataset  the tag's data-* attributes
 *   stop     () => true once the entry has given up waiting (its time limit): insert nothing more
 *   loaded   () => Promise — resolves when the page's own `load` has fired (and is being held): every script the page
 *            asked for has run, including a 2.7 game's async mod files, and its onload has not
 *   release  () => Promise — lets the page's held `load` event through; resolves after the game's onload has run
 */
export async function embed(entry) {
  const ROOT = new URL('../', entry.src);
  const abs = (p) => new URL(p, ROOT).href;
  const params = new URLSearchParams(location.search);
  // the loader's own store, read RAW — the same `tmt-loader:ui.flags` key the hosted page uses (docs/options.md), on
  // THIS origin. There is no prefix shim on an author's page, but a game could still patch Storage; the prototype's
  // methods as they are now are what the loader keeps for itself.
  const RAW = { getItem: Storage.prototype.getItem, setItem: Storage.prototype.setItem, removeItem: Storage.prototype.removeItem,
    key: Storage.prototype.key, length: Object.getOwnPropertyDescriptor(Storage.prototype, 'length').get };
  const readPrefs = () => { try { return parsePrefs(RAW.getItem.call(localStorage, PREF_KEY)); } catch { return {}; } };
  const writePrefs = (prefs) => {
    try {
      const s = serializePrefs(prefs, { keepFalse: true });
      if (s) RAW.setItem.call(localStorage, PREF_KEY, s); else RAW.removeItem.call(localStorage, PREF_KEY);
    } catch { /* a full, blocked or read-only store costs the preference, never the page */ }
    return readPrefs();
  };

  const T = (window.tmtLoader = { id: null, embed: true, manifest: null, ready: false, error: null, managed: false,
    automation: false, mobile: false, navbar: false, options: {}, step: 'init', loaded: [], skipped: [], pageErrors: [] });
  window.addEventListener('error', (ev) => { T.pageErrors.push({ when: T.ready ? 'after-ready' : 'before-ready', message: String(ev.message), filename: ev.filename || null }); });
  const fetchText = async (url, what) => {
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`${what}: HTTP ${r.status} for ${url}`);
    return r.text();
  };

  try {
    // ---- the author's settings: the tag, then (if the tag asks for it) tmt-loader.json beside the page (D8) ----
    T.step = 'settings';
    const file = 'settings' in entry.dataset ? await readSettingsFile(RAW) : null;
    const S = readSettings(entry.dataset, file, warn);
    T.settings = S;
    T.id = S.game;
    const R = resolveEmbedFlags(params, readPrefs(), S);
    for (const f of FLAGS) if (!R.loaded[f] && params.has(f)) warn(`?${f}= is ignored: this page does not load the ${f} feature`);
    Object.assign(T, { automation: R.automation, mobile: R.mobile, navbar: R.navbar });
    T.flags = { mobile: R.mobile, navbar: R.navbar, automation: R.automation };
    T.flagSource = R.source;
    T.flagsLoaded = R.loaded;
    T.prefs = { key: PREF_KEY, names: FLAGS, read: readPrefs, write: writePrefs };
    // the loader's per-page keys (the layer list's open cards, its left-column choice, the au tab's collapsed groups)
    // live under `tmt-loader:@<this page's directory>:` — an origin may host several games (every
    // <user>.github.io/<repo>/ shares one), and a game's own save id is too often the template's default to tell them
    // apart. The namespace is the loader's; the game's own keys are never touched, listed or cleared.
    const prefix = `tmt-loader:@${new URL('.', location.href).pathname}:`;
    T.storage = { prefix, raw: RAW, embed: true,
      list: () => { const o = {}; try { for (let i = 0; i < RAW.length.call(localStorage); i++) { const k = RAW.key.call(localStorage, i); if (k && k.startsWith(prefix)) o[k] = RAW.getItem.call(localStorage, k); } } catch { /* no store */ } return o; } };

    // ---- the automation table (R2): the author's own, else the loader's for a named game, else the derived one ----
    let table = null;
    // (R2) the format is the loader's own (docs/automation.md), whose schema requires an `id`; an author's table may
    // leave it out — it is filled with this page's game id (`game`), or `embed` when there is none. A COPY: the file's
    // own object is not touched.
    if (T.automation && S.table !== undefined) {
      const v = S.table && typeof S.table === 'object' && !Array.isArray(S.table) && S.table.id === undefined ? { id: T.id || 'embed', ...S.table } : S.table;
      table = { value: v, name: `${SETTINGS_FILE}#autoTable` };
    }
    else if (T.automation && T.id) {
      T.step = `manifest manifests/${T.id}.json`;
      T.manifest = JSON.parse(await fetchText(abs(`manifests/${T.id}.json`), `manifests/${T.id}.json`));
      if (T.manifest.auto) table = { url: abs(T.manifest.auto), name: T.manifest.auto };
    }
    T.tableFrom = table ? (table.value !== undefined ? 'author' : 'loader') : 'derived';
    if (T.automation) T.options = {};

    // the stylesheets as early as they are known (the page is still loading; the layout lands before the game draws)
    T.step = 'stylesheets';
    attachStyles({ T, abs });
    // the scripts in the gap between the page's last script and its onload
    T.step = 'wait for the page';
    await entry.loaded();
    if (entry.stop()) throw new Error('gave up waiting (at the page load)');
    await attachScripts({ T, id: T.id, abs, fetchText, table, contract: false, crossOrigin: true, stop: entry.stop });
  } catch (e) {
    T.error = { step: T.step, message: String((e && e.message) || e) };
    console.error('tmt-loader: the extras did not load; the game runs without them.', T.error, e);
  }

  // ---- let the game's onload run, then the automation profile (as the hosted page does after onload), then ready ----
  await entry.release();
  if (!T.error && T.automation && typeof T.profile === 'function') {
    try { T.profile('saved'); } catch (e) { warn(`automation profile: ${e && e.message}`); }
  }
  T.ready = !T.error;
  T.step = T.error ? T.step : 'ready';
  window.dispatchEvent(new CustomEvent('tmt-loader:ready', { detail: { id: T.id, embed: true } }));
}

// The author's tmt-loader.json, beside the page. ⚖ D8: read at LOAD time and CACHED FOR THE SESSION — the first page of a
// browser tab reads it; a reload in that tab (an options press is one) reuses what was read. sessionStorage, raw.
// A file that is absent or not JSON is a console warning and no file — never a failed page.
async function readSettingsFile(RAW) {
  const url = new URL(SETTINGS_FILE, location.href).href;
  const key = `tmt-loader:settings:${url}`;
  try { const c = RAW.getItem.call(sessionStorage, key); if (c) return JSON.parse(c); } catch { /* no cache */ }
  let text;
  try {
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) { warn(`${SETTINGS_FILE}: HTTP ${r.status} — the tag's settings apply`); return null; }
    text = await r.text();
  } catch (e) { warn(`${SETTINGS_FILE}: ${e && e.message} — the tag's settings apply`); return null; }
  let v;
  try { v = JSON.parse(text); } catch (e) { warn(`${SETTINGS_FILE}: not JSON (${e.message}) — the tag's settings apply`); return null; }
  try { RAW.setItem.call(sessionStorage, key, JSON.stringify(v)); } catch { /* no cache: read again next time */ }
  return v;
}
