#!/usr/bin/env node
// C1 — the GENERATED per-game currency data: which `player` field each buyable really pays in (docs/automation.md,
// "The currency reader"; docs/manifest.md, "Generated data").
//
//   node tools/currency-data.mjs [--write | --check] [--ids a,b] [--shard i/N] [--jobs N] [--json out.json]
//
// ⛔ A BUYABLE DECLARES NO CURRENCY TO THE ENGINE, and the answer's only ground truth is a ROLLBACK (harness-only), so
// it is precomputed here and shipped as DATA: `games-data/<id>.json`, one per game with buyables, plus
// `games-data/index.json` naming them. The page (automation mode only) and the harness read the same file.
//   --write   regenerate the files (the default).
//   --check   regenerate IN MEMORY and compare with what is committed — the freshness gate, as
//             `tools/games-table.mjs --check` is for the roster doc. Exit 1 on any difference, naming the game.
//             With --shard / --ids it checks only those games' files; the index is checked by `--check-index`.
//   --check-index  no boot: the index names exactly the files in games-data/ (the fast job runs this).
//   --shard i/N  this runner's slice of the roster (tools/harness/lib.mjs assignShards; 1-based).
//   --jobs N     boots in parallel on this machine (default 4).
//   --json f     the per-game verdict rows, for a gate to read.
// ⛔ EVERY FLAG IS DECLARED: an unknown one is a hard error. An undeclared `--assert` was inert for a day in R3b-1.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(REPO, 'games-data');
const SCRIPT = path.join(REPO, 'tools/harness/currency-read.js');
export const GENERATOR_VERSION = 1;
export const FORMAT_VERSION = 1;

const BOOL = new Set(['write', 'check', 'check-index', 'help']);
const VALUED = new Set(['ids', 'shard', 'jobs', 'json']);
export function parseStrict(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) throw new Error(`unexpected argument ${JSON.stringify(a)}`);
    const eq = a.indexOf('=');
    const k = eq > 0 ? a.slice(2, eq) : a.slice(2);
    if (BOOL.has(k)) { if (eq > 0) throw new Error(`--${k} takes no value`); o[k] = true; continue; }
    if (!VALUED.has(k)) throw new Error(`unknown flag --${k} (known: ${[...BOOL, ...VALUED].map((f) => '--' + f).join(' ')})`);
    const v = eq > 0 ? a.slice(eq + 1) : argv[++i];
    if (v === undefined || String(v).startsWith('--')) throw new Error(`--${k} needs a value`);
    o[k] = v;
  }
  if (o.write && o.check) throw new Error('--write and --check are exclusive');
  return o;
}

function roster() { return JSON.parse(fs.readFileSync(path.join(REPO, 'manifests/index.json'), 'utf8')).map((g) => g.id); }
function manifest(id) { return JSON.parse(fs.readFileSync(path.join(REPO, 'manifests', id + '.json'), 'utf8')); }

// The one extra state a game is read in: its deepest committed snapshot, where there is one (ptr, something). The
// fresh boot is always read; a buyable neither state can score ABSTAINS.
function snapshotOf(id) {
  const dir = path.join(REPO, 'tools/harness/snapshots', id, 'all');
  if (!fs.existsSync(dir)) return null;
  const f = fs.readdirSync(dir).filter((x) => /^M\d+\.json$/.test(x)).sort((a, b) => Number(a.slice(1, -5)) - Number(b.slice(1, -5))).pop();
  return f ? { file: path.join(dir, f), name: 'all/' + f.slice(0, -5) } : null;
}

// ⛔ SEEDED, ALWAYS: `Math.random` is replaced by a seeded generator in every boot this tool makes (boot.mjs
// --random-seed), so a game that draws randomness gives the SAME answer on every regeneration and `--check` cannot flake.
// That alone would ship ONE seed's answer as fact, so a game that drew any randomness is read under SEEDS more seeds
// and every entry the seeds disagree on ABSTAINS — measured: The Gaming Tree picks three buyables' paying item at random.
export const SEEDS = [1, 2, 3];
function readOnce(id, snap, seed = SEEDS[0]) {
  return new Promise((resolve) => {
    const out = path.join(os.tmpdir(), `currency-${process.pid}-${id}-${snap ? 'snap' : 'fresh'}-${seed}.json`);
    const args = [path.join(REPO, 'tools/harness/run.mjs'), id, '--ticks', '0', '--planner', '--planner-script', SCRIPT, '--json', out, '--random-seed', String(seed)];
    if (snap) args.push('--from-snapshot', snap.file);
    const ch = spawn(process.execPath, args, { cwd: REPO, stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    ch.stderr.on('data', (d) => { err += d; });
    ch.on('close', () => {
      try {
        const r = JSON.parse(fs.readFileSync(out, 'utf8'));
        fs.rmSync(out, { force: true });
        if (!r.plannerScript || r.plannerScript.error || !Array.isArray(r.plannerScript.rows)) resolve({ ok: false, error: (r.plannerScript && r.plannerScript.error) || r.error || r.failed_at || 'no rows' });
        else resolve({ ok: true, rows: r.plannerScript.rows, randomCalls: Number(r.randomCalls) || 0 });
      } catch (e) { resolve({ ok: false, error: 'no result: ' + String(e.message).slice(0, 120) + ' ' + err.slice(-300) }); }
    });
  });
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
// One entry per buyable: the SCORED answer or an abstention. `pick` is the regex's answer, kept as evidence and never
// promoted — an unscored read ABSTAINS.
function entry(r, from) {
  const e = { pays: r.pays === undefined ? null : r.pays, cost: r.cost || 'unknown', by: r.by || [], scored: !!r.scored };
  if (r.pick !== undefined && r.pick !== null) e.pick = r.pick;
  if (r.score && r.score.how) e.how = r.score.how;
  if (!e.scored && r.why) e.why = r.why;
  if (r.pure === false) e.impure = true;
  e.from = from;
  return e;
}
function merge(a, b, snapName) {
  if (!b) return a;
  if (a.scored && b.scored) {
    if (same(a.pays, b.pays) && a.cost === b.cost) return Object.assign({}, a, { from: ['fresh', snapName] });
    return { pays: null, cost: 'unknown', by: [], scored: false, pick: a.pick, why: `the fresh boot and ${snapName} disagree: ${JSON.stringify(a.pays)} (${a.cost}) vs ${JSON.stringify(b.pays)} (${b.cost})`, from: ['fresh', snapName] };
  }
  if (b.scored) return b;
  return a;
}

export async function readGame(id) {
  const snap = snapshotOf(id);
  const fresh = await readOnce(id, null);
  if (!fresh.ok) return { id, ok: false, error: fresh.error };
  // a game that drew randomness: the other seeds, and an entry they disagree on abstains
  const randomised = {};
  if (fresh.randomCalls) {
    for (const seed of SEEDS.slice(1)) {
      const o = await readOnce(id, null, seed);
      if (!o.ok) return { id, ok: false, error: `seed ${seed}: ${o.error}` };
      const om = new Map(o.rows.map((r) => [r.layer + '/' + r.id, r]));
      for (const r of fresh.rows) {
        const q = om.get(r.layer + '/' + r.id);
        if (!q || !same(q.pays, r.pays) || q.cost !== r.cost) randomised[r.layer + '/' + r.id] = true;
      }
    }
  }
  const deep = snap ? await readOnce(id, snap) : null;
  if (deep && !deep.ok) return { id, ok: false, error: `${snap.name}: ${deep.error}` };
  if (!fresh.rows.length) return { id, ok: true, doc: null };
  const dm = new Map((deep ? deep.rows : []).map((r) => [r.layer + '/' + r.id, r]));
  const buyables = {};
  const sum = { buyables: 0, scored: 0, price: 0, requirement: 0, unknown: 0, own: 0, foreign: 0, several: 0, impure: 0 };
  for (const r of fresh.rows) {
    const d = dm.get(r.layer + '/' + r.id);
    let e = merge(entry(r, ['fresh']), d ? entry(d, [snap.name]) : null, snap && snap.name);
    if (randomised[r.layer + '/' + r.id]) e = { pays: null, cost: 'unknown', by: [], scored: false, pick: e.pick, why: `the game draws randomness, and seeds ${SEEDS.join(', ')} give different answers`, from: e.from };
    if (e.pick === undefined) delete e.pick;
    (buyables[r.layer] || (buyables[r.layer] = {}))[r.id] = e;
    sum.buyables++;
    if (e.scored) sum.scored++;
    sum[e.cost === 'price' ? 'price' : e.cost === 'requirement' ? 'requirement' : 'unknown']++;
    if (e.scored && Array.isArray(e.pays)) sum.several++;
    else if (e.scored && e.pays === `player.${r.layer}.points`) sum.own++;
    else if (e.scored) sum.foreign++;
    if (e.impure) sum.impure++;
  }
  const m = manifest(id);
  const doc = {
    generated: true,
    generator: 'tools/currency-data.mjs',
    generatorVersion: GENERATOR_VERSION,
    formatVersion: FORMAT_VERSION,
    game: id,
    upstream: { repo: m.upstream && m.upstream.repo, commit: m.upstream && m.upstream.commit },
    states: snap ? ['fresh', snap.name] : ['fresh'],
    seeds: fresh.randomCalls ? SEEDS : SEEDS.slice(0, 1),
    summary: sum,
    buyables,
  };
  return { id, ok: true, doc };
}

export const text = (doc) => JSON.stringify(doc, null, 1) + '\n';
export function indexDoc(ids) { return { generated: true, generator: 'tools/currency-data.mjs', formatVersion: FORMAT_VERSION, games: ids.slice().sort() }; }
function filesOnDisk() { return fs.existsSync(DATA) ? fs.readdirSync(DATA).filter((f) => f.endsWith('.json') && f !== 'index.json').map((f) => f.slice(0, -5)).sort() : []; }

async function pool(ids, n, fn) {
  const out = new Array(ids.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(n, ids.length) }, async () => {
    while (next < ids.length) { const i = next++; out[i] = await fn(ids[i]); }
  }));
  return out;
}

async function main() {
  const A = parseStrict(process.argv.slice(2));
  if (A.help) { process.stdout.write(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 21).join('\n') + '\n'); return 0; }
  if (A['check-index']) {
    const want = text(indexDoc(filesOnDisk()));
    const have = fs.existsSync(path.join(DATA, 'index.json')) ? fs.readFileSync(path.join(DATA, 'index.json'), 'utf8') : null;
    const ok = have === want;
    console.log(ok ? `CURRENCY-INDEX OK — games-data/index.json names the ${filesOnDisk().length} files on disk` : 'CURRENCY-INDEX STALE — games-data/index.json does not name exactly the files in games-data/ (run tools/currency-data.mjs --write)');
    return ok ? 0 : 1;
  }
  const all = roster();
  let ids = A.ids ? String(A.ids).split(',').filter(Boolean) : all;
  for (const id of ids) if (!all.includes(id)) throw new Error(`--ids names ${id}, which is not in manifests/index.json`);
  if (A.shard) {
    const { parseShard, assignShards } = await import('./harness/lib.mjs');
    const { i, n } = parseShard(A.shard);
    ids = assignShards(ids, n)[i - 1];
  }
  const jobs = Math.max(1, Number(A.jobs || 4));
  const t0 = Date.now();
  const res = await pool(ids, jobs, readGame);
  const failed = res.filter((r) => !r.ok);
  const rows = [];
  let stale = 0;
  for (const r of res) {
    if (!r.ok) { rows.push({ id: r.id, ok: false, error: r.error }); continue; }
    const f = path.join(DATA, r.id + '.json');
    const want = r.doc ? text(r.doc) : null;
    const have = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
    const fresh = want === have;
    if (!fresh) stale++;
    rows.push({ id: r.id, ok: true, buyables: r.doc ? r.doc.summary.buyables : 0, summary: r.doc && r.doc.summary, fresh });
    if (A.check) { if (!fresh) console.log(`STALE ${r.id}: ${have === null ? 'no file, and the game has buyables' : want === null ? 'a file, and the game has no buyables' : 'the committed file differs from a regeneration'}`); }
    else if (want === null) { if (have !== null) fs.rmSync(f); }
    else { fs.mkdirSync(DATA, { recursive: true }); fs.writeFileSync(f, want); }
  }
  if (!A.check && !A.shard && !A.ids) fs.writeFileSync(path.join(DATA, 'index.json'), text(indexDoc(filesOnDisk())));
  if (A.json) { fs.mkdirSync(path.dirname(path.resolve(A.json)), { recursive: true }); fs.writeFileSync(A.json, JSON.stringify({ ids, rows }, null, 1) + '\n'); }
  const withB = rows.filter((r) => r.ok && r.buyables);
  const tot = withB.reduce((s, r) => { for (const k in r.summary) s[k] = (s[k] || 0) + r.summary[k]; return s; }, {});
  console.log(`CURRENCY-DATA ${A.check ? 'CHECK' : 'WRITE'} — ${ids.length} games given, ${res.length - failed.length} read, ${failed.length} failed, ${withB.length} with buyables, ${A.check ? stale + ' stale' : stale + ' changed'} — ${JSON.stringify(tot)} — ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  for (const f of failed) console.log(`FAILED ${f.id}: ${f.error}`);
  return failed.length || (A.check && stale) ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then((c) => process.exit(c), (e) => { console.error('currency-data: ' + e.message); process.exit(2); });
}
