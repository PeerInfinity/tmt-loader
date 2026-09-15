// The browser side of the loader (plan §3c). Reads ?mod=<id>; without it shows the picker.
import { interpret, executionOrder, modFilePaths } from './interpret.mjs';
import { installSavePrefix, captureRaw, rawKeys, prefixFor } from './shims/save-prefix.js';
import { installTimers } from './shims/timers.js';

// 1. absolute URLs captured before any <base> exists (Pages serves under /tmt-loader/, so nothing is /-rooted)
const SELF = new URL('.', location.href);
const params = new URLSearchParams(location.search);
const MOD = params.get('mod');
const MANAGED = params.get('managed') === '1';
// ?profile=off|all|saved (automation profile, applied after onload, never saved); default: off when managed, else saved.
const PROFILE = params.get('profile') || (MANAGED ? 'off' : 'saved');
// ?autoOpt=k=v;k2=v2 — options the automation tables read (tmtLoader.options), e.g. unlockOrder=g,b
const OPTIONS = parseOptions(params.get('autoOpt'));
function parseOptions(s) {
  const o = {};
  for (const part of (s || '').split(';')) { if (!part) continue; const i = part.indexOf('='); if (i < 0) o[part] = '1'; else o[part.slice(0, i)] = part.slice(i + 1); }
  return o;
}
const abs = (p) => new URL(p, SELF).href;

const T = (window.tmtLoader = { id: MOD, manifest: null, ready: false, error: null, managed: MANAGED, options: OPTIONS, step: 'init', loaded: [] });

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

function insertScript(attrs, file) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.async = false; // the IDL property: insertion order is execution order
    let execError = null;
    const onErr = (ev) => { if (!execError) execError = ev.error || new Error(ev.message); };
    window.addEventListener('error', onErr);
    const done = (err) => { window.removeEventListener('error', onErr); err ? reject(err) : resolve(); };
    if (attrs.inline != null) {
      s.text = attrs.inline;
      document.head.appendChild(s); // inline scripts execute synchronously on insertion
      done(execError && Object.assign(new Error(`${file}: ${execError.message}`), { cause: execError }));
      return;
    }
    s.addEventListener('load', () => done(execError && Object.assign(new Error(`${file}: ${execError.message}`), { cause: execError })));
    s.addEventListener('error', () => done(new Error(`${file}: failed to load ${s.src}`)));
    s.src = attrs.src;
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
  if (plan.title) document.title = plan.title;
  document.body.removeAttribute('class');
  document.body.innerHTML = plan.body.html;

  // 6. scripts, one by one, awaited, in order; modFiles after the last static script; tmt-auto.js last
  const { static: statics, slot } = executionOrder(plan);
  for (const s of statics) {
    const file = s.vendor ? s.vendor.path : s.inline != null ? s.name : s.src;
    step(`script ${file}`);
    await insertScript(s.vendor ? { src: abs(s.vendor.path) } : s.inline != null ? { inline: s.inline } : { src: s.src }, file);
    T.loaded.push(file);
  }
  if (slot) {
    // `modInfo` may be a global `let` (not a window property): read it through the global lexical scope
    const files = modFilePaths(slot, new Function('return typeof modInfo !== "undefined" && modInfo.modFiles || []')());
    T.modFiles = files;
    for (const f of files) { step(`modFile ${f}`); await insertScript({ src: f }, f); T.loaded.push(f); }
  }
  step('script loader/tmt-auto.js');
  await insertScript({ src: abs('loader/tmt-auto.js') }, 'loader/tmt-auto.js');
  T.loaded.push('loader/tmt-auto.js');
  if (manifest.auto) {
    // the per-game automation table (games-auto/<id>.js): registerAutoFeature calls only, before onload
    step(`script ${manifest.auto}`);
    await insertScript({ src: abs(manifest.auto) }, manifest.auto);
    T.loaded.push(manifest.auto);
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
    a.textContent = m.name;
    const meta = document.createElement('div');
    meta.className = 'meta';
    const up = m.upstream || {};
    meta.textContent = `v${m.version} by ${m.author} · ${up.repo} @ ${(up.commit || '').slice(0, 7)} · TMT ${m.engine && m.engine.tmtNum} · license ${m.license && m.license.verdict}`;
    const count = () => rawKeys(raw, localStorage, prefixFor(m.id)).length;
    const btn = document.createElement('button');
    const label = () => { btn.textContent = `clear this game's save (${count()} keys)`; };
    btn.addEventListener('click', () => {
      if (!confirm(`Delete every saved key of ${m.name} in this browser?`)) return;
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
