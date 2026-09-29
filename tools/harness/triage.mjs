// Triage a batch of games against check-manifest and the load gate, and say what KIND each red is.
//   node tools/harness/triage.mjs <id>... [--json <out>]
//
// It WRITES NOTHING. That is the whole design: `load.known` is hand-kept on purpose (docs/manifest.md), because a
// declaration is a person saying "yes, this game really does hotlink that image / really does name a script it does
// not ship". A tool that wrote them would have to decide, for each drift, whether the game is quirky or WE have a
// bug — and it cannot tell those apart. An earlier writing version of this script got that exactly wrong: it
// declared `missingScripts: ["js/null"]` for `1-clicker`, a path that came from a hole in our own modFiles handling,
// not from the game. Declaring it would have turned our defect into an accepted quirk and hidden it for every game
// with a sparse `modInfo.modFiles`.
//
// So this reports, with the evidence beside each finding, and flags the evidence that looks like OUR bug (below).
// The declaration stays a deliberate act: copy it in yourself once you believe it.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { REPO, GAMES, parseArgs, readManifest, writeJSON, startServer } from './lib.mjs';

const a = parseArgs(process.argv.slice(2), []);
const ids = a._.length ? a._ : GAMES();
const TMP = path.join(REPO, 'tools/harness/results/tmp');
fs.mkdirSync(TMP, { recursive: true });

const run = (args) => { try { return execFileSync(process.execPath, args, { cwd: REPO, encoding: 'utf8', maxBuffer: 256 << 20 }); } catch (e) { return String((e.stdout || '') + (e.stderr || '')); } };
// JSON.stringify(undefined) is undefined, not a string — a problem field carries only the keys it needs
const j = (v, n = 200) => (v === undefined ? '(absent)' : String(JSON.stringify(v)).slice(0, n));
const rows = (f) => { const d = JSON.parse(fs.readFileSync(f, 'utf8')); return Object.fromEntries((d.rows || d).map((r) => [r.id, r])); };

/**
 * Does this path look like something the GAME names, or something WE derived? A script the index really asks for
 * appears in the index, or in `modInfo.modFiles` — literally. One that appears in neither was computed by the
 * loader, and a computed path that exists nowhere is our bug wearing a game's clothes. `js/null` and
 * `js/undefined` are the shapes seen so far, from a sparse-array hole.
 */
function namedByTheGame(id, p) {
  const m = readManifest(id);
  const base = p.replace(/^.*\//, '');
  const inManifest = (m.load.modFiles || []).some((f) => f != null && (String(f) === base || String(f) === p))
    || (m.load.scripts || []).some((s) => s === p);
  if (inManifest) return true;
  const index = path.join(REPO, 'games', id, m.entry || 'index.html');
  try { return fs.readFileSync(index, 'utf8').includes(base); } catch { return false; }
}

const cmFile = path.join(TMP, 'triage-cm.json'), ldFile = path.join(TMP, 'triage-load.json');
process.stderr.write(`[triage] check-manifest × ${ids.length}\n`);
run(['tools/harness/check-manifest.mjs', ...ids, '--json', cmFile]);
process.stderr.write(`[triage] gate load × ${ids.length}\n`);
run(['tools/harness/page.mjs', ...ids, '--gate', 'load', '--json', ldFile]);
const cm = rows(cmFile), ld = rows(ldFile);

// Games red ONLY on before-ready page errors get their errors read out of the page — the filenames are what
// identify the cause, and a reason written without them is a guess. (One was: a hand-written note blamed
// `js/vueFile.js`, which is a vendored copy of Vue; the filenames said `js/news.js`.)
const wantErrors = ids.filter((id) => { const r = ld[id]; return r && !r.ok && r.ready && !r.error && (r.errorsBeforeReady || 0) > 0; });
const pageErrors = {};
if (wantErrors.length) {
  const { chromium } = await import('playwright');
  const srv = await startServer(REPO); const browser = await chromium.launch();
  for (const id of wantErrors) {
    const ctx = await browser.newContext(); const page = await ctx.newPage();
    try {
      await page.goto(`${srv.url}?mod=${encodeURIComponent(id)}&managed=1`, { waitUntil: 'load' });
      await page.waitForFunction(() => window.tmtLoader && (window.tmtLoader.ready || window.tmtLoader.error), null, { timeout: 30000 });
      await page.waitForTimeout(700);
      pageErrors[id] = await page.evaluate(() => window.tmtLoader.pageErrors.map((e) => ({ when: e.when, message: e.message, file: (e.filename || '').replace(/^.*\/games\/[^/]+\//, '') || '(inline)' })));
    } catch (e) { pageErrors[id] = [{ when: 'probe-failed', message: String(e.message || e).slice(0, 200), file: '' }]; }
    await ctx.close();
  }
  await browser.close(); srv.stop();
}

const out = [];
for (const id of ids) {
  const c = cm[id], l = ld[id];
  if (c?.ok && l?.ok) { out.push({ id, ok: true }); continue; }
  const findings = [];
  // A `missing` boot file error is the SAME finding as the missingScripts drift — check-manifest stops reporting it
  // once the file is declared. Folding it in keeps one game's one problem as one line.
  const problems = c?.problems || [];
  const missDrift = new Set((problems.find((x) => x.field === 'load.known.missingScripts')?.inTreeNotDeclared) || []);
  for (const p of problems) {
    if (p.field === 'boot.file_errors' && (p.live || []).every((e) => e.error === 'missing' && missDrift.has(e.file))) continue;
    if (p.field === 'load.known.missingScripts') {
      const suspect = (p.inTreeNotDeclared || []).filter((x) => !namedByTheGame(id, x));
      findings.push({ kind: 'declarable', key: 'missingScripts', suggest: p.inTreeNotDeclared,
        evidence: `the index names these and games/${id}/ does not have them`,
        warn: suspect.length ? `⚠ ${JSON.stringify(suspect)} appears in NEITHER the index nor modFiles — a path WE derived, not one the game asks for. Fix the derivation; do not declare it.` : null });
    } else if (p.field === 'load.known.missingAssets') {
      findings.push({ kind: 'declarable', key: 'missingAssets', suggest: p.inTreeNotDeclared,
        evidence: `the entry document names these assets and games/${id}/ does not have them (case-sensitive)`, warn: null });
    } else if (p.field === 'load.known.externalHosts') {
      findings.push({ kind: 'declarable', key: 'externalHosts', suggest: p.inTreeNotDeclared,
        evidence: `absolute asset URLs in the tree: ${j(p.files || {}, 300)}`, warn: null });
    } else if (p.field === 'boot') {
      findings.push({ kind: 'broken: headless boot', evidence: String(p.error).slice(0, 220), warn: null });
    } else {
      findings.push({ kind: 'drift (not declarable)', key: p.field,
        evidence: `manifest ${j(p.manifest, 120)} vs live ${j(p.live, 120)}`,
        warn: '⚠ the manifest disagrees with the live index on a field that has no declaration — re-emit it, or fix whichever side is wrong.' });
    }
  }
  if (l && !l.ok) {
    if (!l.ready) findings.push({ kind: 'broken: never ready', evidence: j(l.error), warn: null });
    else if ((l.layerNodes ?? 0) < 1) findings.push({ kind: 'broken: 0 tree nodes', evidence: `${l.layerNodes} × ${'#app .treeNode'}`,
      warn: 'check it on the TREE TAB before condemning it — a game that opens on a layer shows 0 at load and is fine (the-leveling-tree).' });
    else if ((l.errorsAfterReady || 0) > 0) findings.push({ kind: 'broken: errors AFTER ready', evidence: j(l.loadVerdict?.errorsAfterReadySample, 220), warn: 'no declaration covers these.' });
    else if ((l.errorsBeforeReady || 0) > 0) {
      const es = (pageErrors[id] || []).filter((e) => e.when === 'before-ready');
      const by = {};
      for (const e of es) { const k = `${e.file}: ${e.message.replace(/^Uncaught /, '')}`; by[k] = (by[k] || 0) + 1; }
      findings.push({ kind: 'declarable', key: 'errorsBeforeReady', suggest: '<a reason you write, after reading the file below>',
        evidence: Object.entries(by).map(([k, n]) => `${k} ×${n}`), warn: 'open the named file and say WHY it throws; the count alone is not a reason.' });
    } else {
      // Name the check that actually failed. gateLoad's row is an AND of many, and printing the load verdict alone
      // can show `ok: true` beside a red row — the failure was one of the others.
      const why = [];
      if (l.optInOk === false) why.push('the plain page showed automation (au node / player.au / games-auto request)');
      if (l.loadVerdict && !l.loadVerdict.ok) why.push(`load verdict ${j(l.loadVerdict, 200)}`);
      if (l.otherLoadVerdict && !l.otherLoadVerdict.ok) why.push(`the OTHER game in the same context failed its own load verdict: ${j(l.otherLoadVerdict, 160)}`);
      if (l.keysInNamespace === false) why.push(`save keys outside this game's prefix: ${j(l.keys, 160)}`);
      if (l.firstUntouched === false) why.push('loading the other game changed this one\'s saved keys');
      if (l.other && l.other.ready === false) why.push(`the other game (${l.other.id}) never became ready`);
      findings.push({ kind: 'G1 load', evidence: why.length ? why : [`no single check named it; row: ${j({ ready: l.ready, layerNodes: l.layerNodes, optInOk: l.optInOk }, 200)}`], warn: null });
    }
  }
  out.push({ id, ok: false, findings });
}

const bad = out.filter((r) => !r.ok);
console.log(`\ntriage: ${out.length - bad.length}/${out.length} green on check-manifest + G1 load\n`);
for (const r of bad) {
  console.log(`${r.id}`);
  for (const f of r.findings) {
    console.log(`   [${f.kind}${f.key ? ' · ' + f.key : ''}]`);
    for (const e of [].concat(f.evidence)) console.log(`      evidence: ${e}`);
    if (f.suggest) console.log(`      would declare: ${JSON.stringify(f.suggest)}`);
    if (f.warn) console.log(`      ${f.warn}`);
  }
  console.log('');
}
console.log('This tool writes nothing. A `load.known` entry is hand-kept: add it yourself once the evidence convinces you.');
if (a.json) writeJSON(a.json, out);
process.exit(bad.length ? 1 : 0);
