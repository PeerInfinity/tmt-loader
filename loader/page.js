// The browser side of the loader (plan §3c). Reads ?mod=<id>; without it shows the picker.
import { interpret, executionOrder, modFilePaths } from './interpret.mjs';
import { installSavePrefix, captureRaw, rawKeys, prefixFor } from './shims/save-prefix.js';
import { installTimers } from './shims/timers.js';
import { FLAGS, PREF_KEY, parsePrefs, serializePrefs, resolveFlags } from './flags.mjs';

// 1. absolute URLs captured before any <base> exists (Pages serves under /tmt-loader/, so nothing is /-rooted)
const SELF = new URL('.', location.href);
const params = new URLSearchParams(location.search);
const MOD = params.get('mod');
const MANAGED = params.get('managed') === '1';
// ?automation=1 opts in to the automation tools (the registry, the `au` side layer, games-auto/<id>.js). Without it the
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
// `window` and are recorded in tmtLoader.pageErrors, but do not fail the load.
function insertScript(attrs, file, { skippable = false } = {}) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.async = false; // the IDL property: insertion order is execution order
    let execError = null;
    let own = null; // the URL the script's own errors carry in ev.filename
    const onErr = (ev) => { if (!execError && own != null && ev.filename === own) execError = ev.error || new Error(ev.message); };
    window.addEventListener('error', onErr);
    const done = (err) => { window.removeEventListener('error', onErr); err ? reject(err) : resolve(); };
    const fail = () => execError && Object.assign(new Error(`${file}: ${execError.message}`), { cause: execError });
    if (attrs.inline != null) {
      own = location.href;
      s.text = attrs.inline;
      document.head.appendChild(s); // inline scripts execute synchronously on insertion
      done(fail());
      return;
    }
    s.addEventListener('load', () => done(fail()));
    s.addEventListener('error', () => {
      if (!skippable) return done(new Error(`${file}: failed to load ${s.src}`));
      T.skipped.push(file);
      console.warn(`tmt-loader: skipped ${file} (failed to load ${s.src}), as a browser skips a failed <script src>`);
      done();
    });
    s.src = attrs.src;
    own = s.src; // resolved against <base>
    document.head.appendChild(s);
  });
}

async function boot(id) {
  const step = (name) => { T.step = name; };
  step('fetch manifest');
  const manifest = JSON.parse(await fetchText(abs(`manifests/${id}.json`), 'manifest'));
  T.manifest = manifest;
  const gameBase = abs(`games/${id}/`);
  step('fetch index.html');
  const html = await fetchText(new URL(manifest.entry || 'index.html', gameBase).href, 'index.html');

  step('interpret');
  let plan = interpret(html, manifest);
  const slot0 = executionOrder(plan).slot;
  if (slot0) plan = interpret(html, manifest, { loaderSource: await fetchText(new URL(slot0.loader, gameBase).href, 'loader.js') });
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
  base.href = gameBase;
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
  // both after the fork's own sheets: equal specificity is broken by source order
  const sheet = (elId, file) => { const st = document.createElement('link'); st.rel = 'stylesheet'; st.id = elId; st.href = abs(file); document.head.appendChild(st); };
  if (MOBILE) sheet('tmt-loader-mobile-css', 'loader/mobile.css');
  if (NAVBAR) { sheet('tmt-loader-navbar-css', 'loader/navbar.css'); sheet('tmt-loader-layerlist-css', 'loader/layerlist.css'); }
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
  if (AUTOMATION && manifest.auto) {
    // the per-game automation table (games-auto/<id>.js): DATA (tmtLoader.autoTable), inserted BEFORE tmt-auto.js, which
    // reads it when it derives the features — before onload, so load() picks up the hooks and the au layer
    step(`script ${manifest.auto}`);
    await insertScript({ src: abs(manifest.auto) }, manifest.auto);
    T.loaded.push(manifest.auto);
  }
  if (AUTOMATION) {
    // ---- the LADDER, where this game has one (V3) ------------------------------------------------------------------
    // ⚠ TWO OF THE 171 GAMES HAVE A LADDER (`tools/harness/ladder/<id>.json`, ptr and something), and the Progress
    // timeline uses its mark NAMES as labels on the events that satisfy them. ⛔ `loader/tmt-auto.js` fetches nothing
    // itself — it never touches the DOM or the network, which is what `docs/contract.md` says — so the HOST hands it
    // the file, exactly as the host hands it the manifest and the options.
    //
    // ⛔⛔ AND IT IS LAZY, AND IT ASKS AN INDEX FIRST — BOTH MEASURED, by CI, on the first cut that did neither.
    // The first cut fetched `tools/harness/ladder/<id>.json` on every automation boot and pushed a note to
    // `T.skipped` on a 404. `G1 load — automation page` judges EVERY request a page makes: a failed request the
    // manifest does not declare is a RED, and `tmtLoader.skipped` must equal the manifest's declared list exactly.
    // Result: **169 of 171 games RED**, for a file 169 of them were never going to have. So the ladder is asked for
    // only when something actually wants it (the `Progress` subtab, or a progress event with the tracker armed),
    // and the INDEX says which games have one, so there is never a 404 to judge.
    T.fetchLadder = (function () {
      let asked = null;
      return function () {
        if (asked) return asked;
        asked = (async () => {
          const r = await fetch(abs('tools/harness/ladder/index.json'), { cache: 'no-cache' });
          if (!r.ok) return null;
          const index = JSON.parse(await r.text());
          if (!index || !Array.isArray(index.games) || index.games.indexOf(id) < 0) { T.ladder = null; return null; }
          const g = await fetch(abs(`tools/harness/ladder/${id}.json`), { cache: 'no-cache' });
          if (!g.ok) return null;
          const L = JSON.parse(await g.text());
          if (L && Array.isArray(L.marks)) { T.ladder = L; return L; }
          return null;
        })().catch(() => null);
        return asked;
      };
    })();
  }
  step('script loader/tmt-auto.js');
  await insertScript({ src: abs('loader/tmt-auto.js') }, 'loader/tmt-auto.js');
  T.loaded.push('loader/tmt-auto.js');
  // the OPTIONS SECTION (docs/options.md) — the only file here with no flag in front of it, and it has to be:
  // it is how a page that carries none of the flags offers them. It adds nothing to <head>, nothing to `player`
  // and no timer; its one element lives inside the game's own options tab, while that tab is open.
  step('script loader/options.js');
  await insertScript({ src: abs('loader/options.js') }, 'loader/options.js');
  T.loaded.push('loader/options.js');
  if (NAVBAR) {
    step('script loader/navbar.js');
    await insertScript({ src: abs('loader/navbar.js') }, 'loader/navbar.js');
    T.loaded.push('loader/navbar.js');
    document.documentElement.classList.add('tmt-navbar'); // the bar is installed; navbar.css hides the corner controls
    // the LAYER LIST (docs/mobile.md) — the bar's Layers button opens it. After navbar.js, which owns the button:
    // the entry stays hidden until `tmtLoader.layerListUI` exists, so a bar without this file is still a whole bar.
    step('script loader/layerlist.js');
    await insertScript({ src: abs('loader/layerlist.js') }, 'loader/layerlist.js');
    T.loaded.push('loader/layerlist.js');
  }

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

async function picker() {
  const raw = captureRaw(Storage.prototype);
  document.title = 'tmt-loader';
  const root = document.getElementById('picker');
  root.hidden = false;
  const list = root.querySelector('ul');
  const roster = JSON.parse(await fetchText(abs('manifests/index.json'), 'manifests/index.json'));
  for (const entry of roster) {
    const m = JSON.parse(await fetchText(abs(`manifests/${entry.id}.json`), `manifests/${entry.id}.json`));
    const li = document.createElement('li');
    li.className = 'game';
    li.dataset.id = m.id;
    const a = document.createElement('a');
    a.href = `?mod=${encodeURIComponent(m.id)}`;
    // ⚠ A FIELD A GAME DOES NOT HAVE IS NOT THE STRING "null". Two games (`the-modding-tree`, `the-burning-tree`)
    // carry no `author` at all — their TMT 2.0.x `modInfo` predates the field — and this line used to render them
    // as `vnull by null`, on the published site, for as long as they have been hosted. An absent part is dropped;
    // the parts that are present still read the same.
    a.textContent = m.name || m.id;
    const meta = document.createElement('div');
    meta.className = 'meta';
    const up = m.upstream || {};
    const byline = [m.version ? `v${m.version}` : null, m.author ? `by ${m.author}` : null].filter(Boolean).join(' ');
    meta.textContent = [byline || null,
      up.repo ? `${up.repo} @ ${(up.commit || '').slice(0, 7)}` : null,
      m.engine && m.engine.tmtNum ? `TMT ${m.engine.tmtNum}` : null,
      m.license && m.license.verdict ? `license ${m.license.verdict}` : null].filter(Boolean).join(' · ');
    const count = () => rawKeys(raw, localStorage, prefixFor(m.id)).length;
    const btn = document.createElement('button');
    const label = () => { btn.textContent = `clear this game's save (${count()} keys)`; };
    btn.addEventListener('click', () => {
      if (!confirm(`Delete every saved key of ${m.name || m.id} in this browser?`)) return;
      for (const k of rawKeys(raw, localStorage, prefixFor(m.id))) raw.removeItem.call(localStorage, k);
      label();
    });
    label();
    li.append(a, meta, btn);
    list.appendChild(li);
  }
  T.ready = true;
  window.dispatchEvent(new CustomEvent('tmt-loader:ready', { detail: { id: null } }));
}

(MOD ? boot(MOD) : picker()).catch((e) => {
  T.error = { step: T.step, message: String((e && e.message) || e) };
  overlay(`failed at step "${T.step}"`, T.error.message);
  console.error('tmt-loader', T.error, e);
});
