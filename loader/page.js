// The browser side of the loader (plan §3c). Reads ?mod=<id>; without it shows the short home page.
import { interpret, executionOrder, modFilePaths } from './interpret.mjs';
import { installSavePrefix } from './shims/save-prefix.js';
import { installTimers } from './shims/timers.js';
import { FLAGS, PREF_KEY, parsePrefs, serializePrefs, resolveFlags } from './flags.mjs';
// (S4) the loader's extras live in attach.mjs, shared with an author's own page (loader/embed.mjs, docs/embed.md);
// this file is BOOT — it builds the page from the game's index.html — and calls attach where it always did.
import { makeInsertScript, attachStyles, attachScripts } from './attach.mjs';

// 1. absolute URLs captured before any <base> exists (Pages serves under /tmt-loader/, so nothing is /-rooted)
const SELF = new URL('.', location.href);
const params = new URLSearchParams(location.search);
const MOD = params.get('mod');
const MANAGED = params.get('managed') === '1';
// ?automation=1 opts in to the automation tools (the registry, the `au` side layer, games-auto/<id>.json, games-data/<id>.json). Without it the
// page is the game plus the contract (docs/contract.md): no layer, no DOM, nothing in the save.
// ?mobile=1 opts in to the mobile LAYOUT (docs/mobile.md): loader/mobile.css, the single column and master-detail.
// ?navbar=1 opts in to the bottom NAV BAR alone (loader/navbar.css + loader/navbar.js after tmt-auto.js) AND the
// layer list it opens (loader/layerlist.css + loader/layerlist.js), both wanted on a desktop too; ?mobile=1 IMPLIES
// it, so ?mobile=1 alone is what it always was.
// Since U3 each of the three is ALSO reachable as a remembered preference the Options section writes
// (loader/options.js, docs/options.md) — and the URL still answers first, in both directions, whenever it says
// anything at all about that flag. EXPLICIT ONLY remains the rule: no viewport or pointer sniffing anywhere, so a
// page with neither the parameter nor the preference renders exactly as it did before these modes existed, and a
// page with either renders the same way at every width (which is what makes them gateable).
// ⚠ THE RAW `Storage` METHODS, captured before installSavePrefix() patches the prototype (and before a game can):
// the preference key is the loader's own and belongs in no game's namespace, so it is never read or written through
// the prefixing `localStorage`. It is also read HERE, at module top, because MOBILE decides a class that goes on
// <html> before the game's markup — long before the shim exists.
const RAW = { getItem: Storage.prototype.getItem, setItem: Storage.prototype.setItem, removeItem: Storage.prototype.removeItem };
const readPrefs = () => { try { return parsePrefs(RAW.getItem.call(localStorage, PREF_KEY)); } catch { return {}; } };
const writePrefs = (prefs) => {
  try {
    const s = serializePrefs(prefs);
    if (s) RAW.setItem.call(localStorage, PREF_KEY, s); else RAW.removeItem.call(localStorage, PREF_KEY);
  } catch { /* a full, blocked or read-only store costs the preference, never the page */ }
  return readPrefs();
};
const RESOLVED = resolveFlags(params, readPrefs());
const AUTOMATION = RESOLVED.automation;
const MOBILE = RESOLVED.mobile;
const NAVBAR = RESOLVED.navbar;
for (const p of ['profile', 'autoOpt']) if (!AUTOMATION && params.has(p)) console.warn(`tmt-loader: ?${p}= is ignored without ?automation=1`);
// ?profile=off|all|saved (automation profile, applied after onload, never saved); default: off when managed, else saved.
const PROFILE = !AUTOMATION ? 'off' : params.get('profile') || (MANAGED ? 'off' : 'saved');
// ?autoOpt=k=v;k2=v2 — options the automation tables read (tmtLoader.options), e.g. unlockOrder=g,b
const OPTIONS = AUTOMATION ? parseOptions(params.get('autoOpt')) : {};
function parseOptions(s) {
  const o = {};
  for (const part of (s || '').split(';')) { if (!part) continue; const i = part.indexOf('='); if (i < 0) o[part] = '1'; else o[part.slice(0, i)] = part.slice(i + 1); }
  return o;
}
const abs = (p) => new URL(p, SELF).href;
// ⚖ R8 — THE SEAM, page side: the one place a game's URL is built. Its fetches (index.html, the loader slot) resolve
// against it, and it becomes the <base href> every other game file resolves against. The Node twin is
// tools/harness/lib.mjs (`GAMES_PATH`, `gameDir`); loader/seam.test.mjs holds that both name the same directory and
// that nothing else in loader/, tools/ or .github/ spells it.
const gameBase = (id) => abs(`games/${id}/`);

const T = (window.tmtLoader = { id: MOD, manifest: null, ready: false, error: null, managed: MANAGED, automation: AUTOMATION, mobile: MOBILE, navbar: NAVBAR, options: OPTIONS, step: 'init', loaded: [], skipped: [], pageErrors: [] });
// what each opt-in is, and WHO said so — `url` | `stored` | `implied` | `default` (docs/options.md). The Options
// section reads both: the values to label its buttons, the sources to say whether the address is overriding what
// this browser remembers.
T.flags = { mobile: MOBILE, navbar: NAVBAR, automation: AUTOMATION };
T.flagSource = RESOLVED.source;
T.prefs = { key: PREF_KEY, names: FLAGS, read: readPrefs, write: writePrefs };
// the class the layout stylesheet is scoped under, set before the game's markup so there is no unstyled flash
// (the nav bar's own class is added by boot(), once navbar.js has actually installed the bar)
if (MOBILE) document.documentElement.classList.add('tmt-mobile');
// every uncaught error that reaches window, before and after ready (the harness reads it; none of them fails a load)
window.addEventListener('error', (ev) => { T.pageErrors.push({ when: T.ready ? 'after-ready' : 'before-ready', message: String(ev.message), filename: ev.filename || null }); });

function overlay(title, detail) {
  const d = document.createElement('div');
  d.id = 'tmt-loader-error';
  d.setAttribute('style', 'position:fixed;inset:0 0 auto 0;z-index:2147483647;background:#300;color:#fdd;font:14px/1.4 monospace;padding:12px 16px;white-space:pre-wrap;border-bottom:2px solid #f66');
  d.textContent = `tmt-loader: ${title}\n${detail}`;
  (document.body || document.documentElement).appendChild(d);
}

async function fetchText(url, what) {
  const r = await fetch(url, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`${what}: HTTP ${r.status} for ${url}`);
  return r.text();
}

// A browser skips a <script src> that fails to load and keeps going; so does the loader for the game's own scripts
// (`skippable`: static game scripts and modFiles). The loader's own inputs (vendored files, tmt-auto.js, the per-game
// automation table) still fail the load. Only an error raised BY the inserted script (`ev.filename` = its resolved src;
// an inline script: the document URL) is attributed to it; errors from a game's timers, earlier scripts or Vue reach
// `window` and are recorded in tmtLoader.pageErrors, but do not fail the load. (S4: the function is in attach.mjs.)
const insertScript = makeInsertScript(T);

async function boot(id) {
  const step = (name) => { T.step = name; };
  step('fetch manifest');
  const manifest = JSON.parse(await fetchText(abs(`manifests/${id}.json`), 'manifest'));
  T.manifest = manifest;
  const gameHref = gameBase(id);
  step('fetch index.html');
  const html = await fetchText(new URL(manifest.entry || 'index.html', gameHref).href, 'index.html');

  step('interpret');
  let plan = interpret(html, manifest);
  const slot0 = executionOrder(plan).slot;
  if (slot0) plan = interpret(html, manifest, { loaderSource: await fetchText(new URL(slot0.loader, gameHref).href, 'loader.js') });
  T.plan = plan;

  // 4. pre-engine shims, in order: save prefix, timer recorder, then <base>
  step('shims');
  const storage = installSavePrefix(Storage.prototype, id);
  T.storage = { prefix: storage.prefix, raw: storage.raw, list: () => storage.list(localStorage), clear: () => storage.clear(localStorage) };
  const timers = installTimers(window);
  T.timers = timers;
  T.pause = () => timers.pause();
  T.resume = () => timers.resume();
  const base = document.createElement('base');
  base.href = gameHref;
  document.head.appendChild(base);

  // 5. stylesheets, then the fork's markup (so #app exists before Vue)
  step('stylesheets + markup');
  for (const l of plan.links) {
    if (l.css != null) { const st = document.createElement('style'); st.textContent = l.css; document.head.appendChild(st); continue; }
    if (l.verdict === 'drop') continue;
    const link = document.createElement('link');
    for (const [k, v] of Object.entries(l.attrs || {})) link.setAttribute(k, v);
    link.rel = 'stylesheet';
    link.href = l.external ? abs(l.path) : l.href; // local hrefs resolve against <base>
    document.head.appendChild(link);
  }
  // both after the fork's own sheets: equal specificity is broken by source order (attach.mjs)
  attachStyles({ T, abs });
  if (plan.title) document.title = plan.title;
  document.body.removeAttribute('class');
  document.body.innerHTML = plan.body.html;

  // 6. scripts, one by one, awaited, in order; modFiles after the last static script; the automation table, then tmt-auto.js last
  const { static: statics, slot } = executionOrder(plan);
  for (const s of statics) {
    const file = s.vendor ? s.vendor.path : s.inline != null ? s.name : s.src;
    step(`script ${file}`);
    await insertScript(s.vendor ? { src: abs(s.vendor.path) } : s.inline != null ? { inline: s.inline } : { src: s.src }, file, { skippable: !s.vendor });
    if (!T.skipped.includes(file)) T.loaded.push(file);
  }
  if (slot) {
    // `modInfo` may be a global `let` (not a window property): read it through the global lexical scope
    const files = modFilePaths(slot, new Function('return typeof modInfo !== "undefined" && modInfo.modFiles || []')());
    T.modFiles = files;
    for (const f of files) { step(`modFile ${f}`); await insertScript({ src: f }, f, { skippable: true }); if (!T.skipped.includes(f)) T.loaded.push(f); }
  }
  // (S4) ATTACH: the automation table, the currency data, the ladder door, tmt-auto.js, options.js, and — with the bar —
  // navbar.js and layerlist.js. Moved verbatim to attach.mjs; the order is the one this function always used.
  await attachScripts({ T, id, abs, fetchText, insertScript, contract: true,
    table: manifest.auto ? { url: abs(manifest.auto), name: manifest.auto } : null });

  // body attributes (onmousemove, …) once the functions they name exist; onload is run explicitly below
  for (const [k, v] of Object.entries(plan.body.attrs)) document.body.setAttribute(k, v);

  // 7. onload, then managed mode's pause, then ready
  step(`onload ${plan.onload}`);
  if (plan.onload) new Function(plan.onload).call(window);
  step(`profile ${PROFILE}`);
  T.profile(PROFILE);
  if (MANAGED) T.pause();
  T.ready = true;
  step('ready');
  window.dispatchEvent(new CustomEvent('tmt-loader:ready', { detail: { id } }));
}

// ⚖ (U15, user 2026-09-23) THE HOME PAGE IS NOT A LIST. It used to fetch every manifest and draw one card per game;
// the list of games belongs to the census, which ranks and describes them and links each one back here. So without
// `?mod=` the page shows the static text in index.html and FETCHES NOTHING — the markup is already in the document.
async function home() {
  document.title = 'tmt-loader';
  document.getElementById('home').hidden = false;
  T.ready = true;
  window.dispatchEvent(new CustomEvent('tmt-loader:ready', { detail: { id: null } }));
}

(MOD ? boot(MOD) : home()).catch((e) => {
  T.error = { step: T.step, message: String((e && e.message) || e) };
  overlay(`failed at step "${T.step}"`, T.error.message);
  console.error('tmt-loader', T.error, e);
});
