// The L2b gates (browser-fidelity loading + load.known). Appends one section to results/SUMMARY.md.
//   node gates-l2b.mjs --part 1        check-manifest for every game; G1 (page.mjs --gate load, plain page) for every game,
//                                      with the allowances each row used; parity node ≡ page 200 × 0.05 (plain page,
//                                      --no-automation) for the games that carry a load.known block
//   node gates-l2b.mjs --part mutants  the four controls, each MUST be RED: (a) the-pro-tree missingScripts emptied →
//                                      check-manifest + G1; (b) bobbit-s-tech-tree errorsBeforeReady removed → G1;
//                                      (c) the-periodic-table-tree externalHosts emptied → G1; (d) the-dressy-tree given
//                                      missingScripts ["js/nope.js"] → check-manifest. The manifest is rewritten for the
//                                      run and restored byte-for-byte in finally (never committed).
// gates.mjs and tools/check-pages.mjs run separately.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';
import { REPO, GAMES, parseArgs, startServer, readManifest, headCommit, treeDirty } from './lib.mjs';
import { checkManifest } from './check-manifest.mjs';
import { parity } from './parity.mjs';
import { appendSection } from './summary.mjs';

const a = parseArgs(process.argv.slice(2));
const PART = String(a.part || '1');
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ${r.hash ?? ''} ${r.notes || ''}`); };

const g1 = (ids, base) => {
  const out = spawnSync(process.execPath, [path.join(REPO, 'tools/harness/page.mjs'), ...ids, '--gate', 'load', ...(base ? ['--base', base] : [])], { cwd: REPO, encoding: 'utf8', timeout: 180e3 * ids.length });
  const lines = (out.stdout || '').split('\n').filter((l) => l.startsWith('{')).map((l) => JSON.parse(l));
  if (lines.length !== ids.length) throw new Error(`page.mjs exit ${out.status}: ${lines.length}/${ids.length} rows; ${(out.stderr || '').slice(-400)}`);
  return lines;
};
const g1Notes = (r) => `ready ${r.ready} ${r.loadMs} ms; ${r.layerNodes} \`#app .treeNode\`; ${r.requests} requests (context), ${r.blocked} blocked, ${r.failed?.length} failed, ${r.pageErrors?.length} page errors; tmtLoader.skipped ${r.skipped?.length}, pageErrors before/after ready ${r.errorsBeforeReady}/${r.errorsAfterReady}; `
  + `${r.known ? `known ${JSON.stringify(r.known).slice(0, 160)}; **allowed: ${JSON.stringify(r.allowed)}**` : 'no load.known — allowed: none'}; other ${r.other?.id} ok ${r.otherLoadVerdict?.ok}`
  + `${r.ok ? '' : `; verdict ${JSON.stringify(r.loadVerdict)}${r.exception ? '; ' + r.exception : ''}`}`;

if (PART === '1') {
  const ids = a._.length ? a._ : GAMES();
  for (const id of ids) {
    const cm = checkManifest(id);
    const k = cm.knownTree;
    row({ gate: 'L2b-1 check-manifest', id, ok: cm.ok, ticks: 0, gameSeconds: 0, notes: cm.ok ? `${cm.scripts} scripts, ${cm.modFiles} modFiles, pristine; load.known ${cm.known ? JSON.stringify(cm.known).slice(0, 200) : 'absent'}; tree: missingScripts ${JSON.stringify(k.missingScripts)}, externalHosts ${JSON.stringify(k.externalHosts)}` : JSON.stringify(cm.problems).slice(0, 600) });
  }
  const browser = await chromium.launch();
  const server = await startServer(REPO);
  try {
    for (const r of g1(ids, server.url)) row({ gate: 'L2b-1 G1 load (plain page)', id: r.id, ok: r.ok, ticks: r.ticks, gameSeconds: r.ticks != null ? Math.round(r.ticks * 0.05 * 1e9) / 1e9 : null, diff: 0.05, notes: g1Notes(r) });
    for (const id of ids.filter((x) => readManifest(x).load.known)) {
      const m = readManifest(id);
      const nondet = m.headless.deterministic === false;
      try {
        const p = await parity(id, { ticks: 200, diff: 0.05, base: server.url, browser, automation: false });
        const equal = !p.divergence && p.node.ticks === p.page.ticks;
        const ok = p.error ? false : (p.ok || (nondet && p.page.loadVerdict.ok));
        row({ gate: 'L2b-1 parity node ≡ page (plain)', id, leg: 'idle', ticks: 200, gameSeconds: 10, diff: 0.05, hash: p.node.hash, ok,
          notes: `node ${p.node.hash} / page ${p.page.hash}; state equal ${equal}; page load vs load.known ${JSON.stringify(p.page.loadVerdict)}; census ${m.headless.idleHash.hash}${nondet ? ' — census marks it NONDETERMINISTIC (§14c.3): recorded, need not match' : ''}${p.divergence ? `; first divergence ${JSON.stringify(p.divergence).slice(0, 200)}` : ''}` });
      } catch (e) { row({ gate: 'L2b-1 parity node ≡ page (plain)', id, ok: false, notes: String(e.message).slice(0, 400) }); }
    }
  } finally { await browser.close(); server.stop(); }
  appendSection({ title: 'L2b-1 (`node tools/harness/gates-l2b.mjs --part 1`)', commit, dirty, rows, slug: 'gates-l2b-1',
    reading: 'check-manifest now also checks `load.known` against the tree (equality). G1 is the plain page; a row with no load.known must have 0 blocked / 0 failed / 0 page errors; a row with one prints what it allowed. Parity runs on the games that carry a load.known block.' });
} else if (PART === 'mutants') {
  const mutate = (id, fn, run) => {
    const f = path.join(REPO, `manifests/${id}.json`);
    const orig = fs.readFileSync(f);
    const m = JSON.parse(orig);
    fn(m);
    fs.writeFileSync(f, JSON.stringify(m, null, 2) + '\n');
    try { return run(); } finally { fs.writeFileSync(f, orig); }
  };
  const server = await startServer(REPO);
  try {
    const cases = [
      { tag: '(a)', id: 'the-pro-tree', what: 'load.known.missingScripts emptied', fn: (m) => { m.load.known.missingScripts = []; }, cm: true, g1: true },
      { tag: '(b)', id: 'bobbit-s-tech-tree', what: 'load.known.errorsBeforeReady removed', fn: (m) => { delete m.load.known.errorsBeforeReady; }, g1: true },
      { tag: '(c)', id: 'the-periodic-table-tree', what: 'load.known.externalHosts emptied', fn: (m) => { m.load.known.externalHosts = []; }, g1: true },
      { tag: '(d)', id: 'the-dressy-tree', what: 'load.known = {missingScripts: ["js/nope.js"]} (a file that is not missing)', fn: (m) => { m.load.known = { missingScripts: ['js/nope.js'] }; }, cm: true },
    ];
    for (const c of cases) {
      mutate(c.id, c.fn, () => {
        if (c.cm) {
          const cm = checkManifest(c.id);
          row({ gate: `L2b mutant ${c.tag} check-manifest must be RED`, id: c.id, ok: !cm.ok, notes: `${c.what} → check-manifest ${cm.ok ? 'GREEN (the gate is not a gate)' : 'RED'}: ${JSON.stringify(cm.problems.map((p) => ({ field: p.field, declaredNotInTree: p.declaredNotInTree, inTreeNotDeclared: p.inTreeNotDeclared })))}`.slice(0, 600) });
        }
        if (c.g1) {
          const [r] = g1([c.id], server.url);
          row({ gate: `L2b mutant ${c.tag} G1 must be RED`, id: c.id, ok: !r.ok, notes: `${c.what} → G1 ${r.ok ? 'GREEN (the gate is not a gate)' : 'RED'}: failedNotDeclared ${r.loadVerdict?.failedNotDeclared?.length}, blockedNotDeclared ${r.loadVerdict?.blockedNotDeclared?.length}, skippedEqualsDeclared ${r.loadVerdict?.skippedEqualsDeclared}, page errors before ready ${r.errorsBeforeReady} (declared ${!!r.known?.errorsBeforeReady})` });
        }
      });
    }
  } finally { server.stop(); }
  appendSection({ title: 'L2b mutant controls (`node tools/harness/gates-l2b.mjs --part mutants`)', commit, dirty, rows, slug: 'gates-l2b-mutants',
    reading: 'GREEN here = the mutated gate went RED as it must. Each manifest was rewritten for the run and restored byte-for-byte; nothing mutated is committed.' });
} else { console.error('gates-l2b.mjs: --part 1 | mutants'); process.exit(2); }
process.exit(rows.every((r) => r.ok) ? 0 : 1);
