// The browser side of the loader (plan §3c). Reads ?mod=<id>; without it shows the short home page.
import { interpret, executionOrder, modFilePaths } from './interpret.mjs';
import { installSavePrefix } from './shims/save-prefix.js';
import { installTimers } from './shims/timers.js';
import { FLAGS, PREF_KEY, parsePrefs, serializePrefs, resolveFlags } from './flags.mjs';
// (S4) the loader's extras live in attach.mjs, shared with an author's own page (loader/embed.mjs, docs/embed.md);
// this file is BOOT — it builds the page from the game's index.html — and calls attach where it always did.
import { makeInsertScript, attachStyles, attachScripts } from './attach.mjs';
// (S5) LINK MODE — ?repo=<owner>/<name>[@<commit>]: the same boot, with the game's files from its author's repository
// (docs/link.md). link.mjs decides the source and the manifest; this file builds the page from them as it always has.
// ⚠ IMPORTED ONLY IN LINK MODE (bootLink): a hosted page, and the home page, request exactly the files they did before.
let LINK = null;

// 1. absolute URLs captured before any <base> exists (Pages serves under /tmt-loader/, so nothing is /-rooted)
const SELF = new URL('.', location.href);
const params = new URLSearchParams(location.search);
const MOD = params.get('mod');
const REPO_LINK = MOD ? null : params.get('repo');
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
// (S5) A LINK-MODE SOURCE moves it: the author's Pages site or jsDelivr at a commit (link.mjs `linkBase`); no source —
// the hosted page, and link mode's "hosted" source — is the loader's own copy.
const gameBase = (id, source = null) => (source ? LINK.linkBase(source) : abs(`games/${id}/`));

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

const step = (name) => { T.step = name; };

async function boot(id) {
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
  await build({ id, manifest, gameHref, plan, table: manifest.auto ? { url: abs(manifest.auto), name: manifest.auto } : null });
}

// (S5) LINK MODE: link.mjs tries the sources in order and hands back what boot() would have had — the game's id (its
// manifest id for a game the loader lists, so its saves are the same saves), the manifest (listed, or derived from the
// page), the base its files resolve against, and the plan. From there the page is built exactly as a hosted one.
async function bootLink() {
  step('link');
  const status = linkStatus();
  let r;
  try {
    LINK = await import('./link.mjs');
    const { resolveLink, sessionCache } = LINK;
    r = await resolveLink({ params, fetch: (u, o) => fetch(u, o), cache: sessionCache(sessionStorageOrNull()), abs, gameBase,
      interpret, executionOrder, status: (text) => { T.linkStatus = text; status.say(text); } });
  } catch (e) {
    status.remove();
    T.link = e.link || T.link || null;
    throw e;
  }
  T.link = r.link;
  T.id = r.id;
  T.manifest = r.manifest;
  status.remove();
  // ⚖ R2 / D8: the author's own automation table replaces the loader's
  const table = r.table || (r.manifest.auto ? { url: abs(r.manifest.auto), name: r.manifest.auto } : null);
  T.tableFrom = r.table ? 'author' : table ? 'loader' : 'derived';
  await build({ id: r.id, manifest: r.manifest, gameHref: r.gameHref, plan: r.plan, table });
  linkNotice(r.link);
}
function sessionStorageOrNull() { try { return RAW.getItem && sessionStorage ? { getItem: (k) => RAW.getItem.call(sessionStorage, k), setItem: (k, v) => RAW.setItem.call(sessionStorage, k, v) } : null; } catch { return null; } }

// What the page says while link mode works, in plain words. It hangs off <html>, not <body>: boot replaces the body
// with the game's markup, and the words must survive that until the game is up.
function linkStatus() {
  const d = document.createElement('div');
  d.id = 'tmt-loader-link-status';
  d.setAttribute('style', 'position:fixed;inset:0 0 auto 0;z-index:2147483646;background:#123;color:#def;font:14px/1.4 system-ui,sans-serif;padding:8px 14px;border-bottom:1px solid #468');
  document.documentElement.appendChild(d);
  return { say: (t) => { d.textContent = t; }, remove: () => d.remove() };
}
// After the game is up: where it came from, and anything the player should know (a declined game's reason, no licence,
// a source that did not work). Small, at the top, closable; the warnings are always shown, the rest behind "details".
function linkNotice(link) {
  const d = document.createElement('div');
  d.id = 'tmt-loader-link';
  const warn = link.warnings.length > 0;
  d.setAttribute('style', `position:fixed;inset:0 0 auto 0;z-index:2147483646;background:${warn ? '#3a2a00' : '#132'};color:${warn ? '#fe9' : '#cfe'};font:13px/1.4 system-ui,sans-serif;padding:6px 36px 6px 12px;border-bottom:1px solid ${warn ? '#a80' : '#364'}`);
  const head = document.createElement('div');
  head.textContent = `Playing ${link.repo} from ${LINK.SOURCE_NAMES[link.source]}${link.commit ? `, version ${link.commit.slice(0, 7)}` : ''}. ` +
    'A game opened by its repository is not tested the way the loader\'s own games are.';
  d.appendChild(head);
  for (const w of link.warnings) { const p = document.createElement('div'); p.className = 'tmt-loader-link-warning'; p.textContent = `⚠ ${w}`; d.appendChild(p); }
  if (link.notices.length) {
    const det = document.createElement('details');
    const sum = document.createElement('summary'); sum.textContent = 'details'; sum.style.cursor = 'pointer';
    det.appendChild(sum);
    for (const n of link.notices) { const p = document.createElement('div'); p.textContent = n; det.appendChild(p); }
    d.appendChild(det);
  }
  const x = document.createElement('button');
  x.textContent = '✕'; x.title = 'Close'; x.setAttribute('aria-label', 'Close');
  x.setAttribute('style', 'position:absolute;top:4px;right:6px;background:none;border:0;color:inherit;font-size:16px;cursor:pointer');
  x.addEventListener('click', () => d.remove());
  d.appendChild(x);
  document.documentElement.appendChild(d);
  // nothing to warn about: it steps out of the way on its own (it sits over the top of the game)
  if (!warn) setTimeout(() => d.remove(), 8000);
}

async function build({ id, manifest, gameHref, plan, table }) {
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
  await attachScripts({ T, id, abs, fetchText, insertScript, contract: true, table });

  // body attributes (onmousemove, …) once the functions they name exist; onload is run explicitly below
  for (const [k, v] of Object.entries(plan.body.attrs)) document.body.setAttribute(k, v);

  // 7. onload, then managed mode's pause, then ready
  step(`onload ${plan.onload}`);
  if (plan.onload) new Function(plan.onload).call(window);
  step(`profile ${PROFILE}`);
  T.profile(PROFILE);
  // (speed-1) THE AUTOMATION'S MEMORY, restored onto the save that just loaded — only when the record's fingerprint is
  // that save's (docs/automation.md, "Memory across a reload"). Before the first tick: the game's interval is running
  // from here on, so a record that needs the queue runner pauses every timer while the runner is fetched, and nothing
  // ticks between the load and the restore. A page with no record does nothing here.
  if (T.autoMemory) {
    step('automation memory');
    let m = T.autoMemory.atLoad();
    if (m.state === 'waiting' && typeof T.fetchQueueRunner === 'function') {
      T.pause();
      try { await T.fetchQueueRunner(); } catch (e) { console.warn('tmt-loader: the queue runner did not load for the automation memory', e); }
      m = T.autoMemory.atLoad(true);
      T.resume();
    }
  }
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

(MOD ? boot(MOD) : REPO_LINK !== null ? bootLink() : home()).catch((e) => {
  T.error = { step: T.step, message: String((e && e.message) || e) };
  overlay(T.step === 'link' ? 'this game could not be opened' : `failed at step "${T.step}"`, T.error.message);
  console.error('tmt-loader', T.error, e);
});
