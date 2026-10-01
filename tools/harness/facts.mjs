#!/usr/bin/env node
// facts-1 — the GENERATED per-game FACTS: what each item costs and what that cost reads, what each reset zeroes, what
// moves over time, what each getter reads, what a challenge changes, what a purchase budget allows (docs/facts.md).
//
//   node tools/harness/facts.mjs <game> [--from <state>]… [--write | --check] [--jobs N] [--out dir] [--json f] [--kinds a,b]
//   node tools/harness/facts.mjs --check [--jobs N]          every game games-facts/index.json names
//   node tools/harness/facts.mjs --check-index               no boot: the index names exactly the files on disk
//
// ⛔ A FACT IS A PROPERTY OF THE GAME'S CODE, READ OFF THE ENGINE ON A ROLLED-BACK COPY (harness-only), so it is
// precomputed here and committed as DATA: `games-facts/<id>.json` (format `tmt-facts/1`), one per game we extract, plus
// `games-facts/index.json`. GENERATED facts only — authored facts (engine traps, guide schedules) get their own home.
//   states     fresh, then every committed `tools/harness/snapshots/<id>/all/*.json` in mark order, then the states
//              DECLARED in `tools/harness/snapshots/<id>/facts-states.json` (m28; a missing one is an error). `--from` replaces
//              the list (repeatable; `fresh` is the fresh boot; a path is a snapshot file).
//   --write    regenerate (the default). --check: regenerate IN MEMORY and compare with the committed file; exit 1 on
//              any difference, naming the game. --out: write somewhere else (a scratch dir) instead of games-facts/.
//   --kinds    only these kinds (a,b) — for a probe; a committed file always carries every kind.
// ⛔ EVERY FLAG IS DECLARED: an unknown one is a hard error (exit 2).
// ⛔ NEUTRAL OR NOTHING: every state's extraction must leave the live game's hash equal and every kind's probes
// neutral (`stateNeutral`, `neutral`); a state that is not is a hard error and nothing is written.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DATA = path.join(REPO, 'games-facts');
const SCRIPT = path.join(REPO, 'tools/harness/facts-read.js');
export const GENERATOR_VERSION = 1;
export const FORMAT = 'tmt-facts/1';
export const KINDS = ['price', 'zeroed-by', 'production', 'multiplier-reads', 'challenge-inputs', 'purchase-budget'];

const BOOL = new Set(['write', 'check', 'check-index', 'help']);
const VALUED = new Set(['from', 'jobs', 'out', 'json', 'kinds']);
export function parseStrict(argv) {
  const o = { _: [], from: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { o._.push(a); continue; }
    const eq = a.indexOf('=');
    const k = eq > 0 ? a.slice(2, eq) : a.slice(2);
    if (BOOL.has(k)) { if (eq > 0) throw new Error(`--${k} takes no value`); o[k] = true; continue; }
    if (!VALUED.has(k)) throw new Error(`unknown flag --${k} (known: ${[...BOOL, ...VALUED].map((f) => '--' + f).join(' ')})`);
    const v = eq > 0 ? a.slice(eq + 1) : argv[++i];
    if (v === undefined || String(v).startsWith('--')) throw new Error(`--${k} needs a value`);
    if (k === 'from') o.from.push(v); else o[k] = v;
  }
  if (o.write && o.check) throw new Error('--write and --check are exclusive');
  if (o._.length > 1) throw new Error('one game at a time (or none with --check)');
  return o;
}

function roster() { return JSON.parse(fs.readFileSync(path.join(REPO, 'manifests/index.json'), 'utf8')).map((g) => g.id); }
function manifest(id) { return JSON.parse(fs.readFileSync(path.join(REPO, 'manifests', id + '.json'), 'utf8')); }

// The states a game is read in: the fresh boot, then its committed `all/` snapshots in MARK order (the number in the
// name — M2 before M10). The order is the order a fact's ranges are written in.
export function statesOf(id, from) {
  if (from && from.length) {
    return from.map((f) => (f === 'fresh' ? { name: 'fresh', file: null } : { name: path.relative(path.join(REPO, 'tools/harness/snapshots', id), path.resolve(REPO, f)).replace(/\.json$/, '').split(path.sep).join('/'), file: path.resolve(REPO, f) }));
  }
  const out = [{ name: 'fresh', file: null }];
  const dir = path.join(REPO, 'tools/harness/snapshots', id, 'all');
  if (fs.existsSync(dir)) {
    const fs2 = fs.readdirSync(dir).filter((x) => /^[A-Za-z]+\d+\.json$/.test(x));
    fs2.sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]) || (a < b ? -1 : a > b ? 1 : 0));
    for (const f of fs2) out.push({ name: 'all/' + f.slice(0, -5), file: path.join(dir, f) });
  }
  for (const d of declaredStates(id)) out.push(d);
  return out;
}

// (m28) States BEYOND the ladder's marks are DECLARED, never discovered: `tools/harness/snapshots/<id>/facts-states.json`
// (`tmt-facts-states/1`) lists snapshot files (relative to the game's snapshot directory), read after the `all/` marks
// in the declared order — each one is a state LATER than every mark. A declared file that is missing, outside the
// game's directory, named twice or shadowing a mark is a HARD ERROR: a declared state is never skipped silently (a
// skipped state reads exactly like a locked item — its facts would ABSTAIN as "unreachable").
export const DECLARED = 'facts-states.json';
export function declaredStates(id, base = path.join(REPO, 'tools/harness/snapshots', id)) {
  const f = path.join(base, DECLARED);
  if (!fs.existsSync(f)) return [];
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  if (d.format !== 'tmt-facts-states/1' || !Array.isArray(d.states)) throw new Error(`${path.relative(REPO, f)}: not a tmt-facts-states/1 file (format, states[])`);
  const out = [], seen = new Set();
  for (const e of d.states) {
    const rel = e && typeof e.file === 'string' ? e.file : null;
    if (!rel || !e.why) throw new Error(`${path.relative(REPO, f)}: every declared state needs {file, why}`);
    const file = path.resolve(base, rel);
    if (path.relative(base, file).startsWith('..')) throw new Error(`${path.relative(REPO, f)}: ${rel} is outside ${path.relative(REPO, base)}`);
    if (!fs.existsSync(file)) throw new Error(`${path.relative(REPO, f)}: the declared state ${rel} does not exist`);
    const name = path.relative(base, file).replace(/\.json$/, '').split(path.sep).join('/');
    if (name.startsWith('all/')) throw new Error(`${path.relative(REPO, f)}: ${rel} is a mark (all/ is read anyway)`);
    if (seen.has(name)) throw new Error(`${path.relative(REPO, f)}: ${rel} is declared twice`);
    seen.add(name);
    out.push({ name, file, declared: true });
  }
  return out;
}

function readState(id, st, opts, seed = 1) {
  return new Promise((resolve) => {
    const tag = `${process.pid}-${id}-${st.name.replace(/\W/g, '_')}-${seed}`;
    const out = path.join(os.tmpdir(), `facts-${tag}.json`);
    const script = path.join(os.tmpdir(), `facts-${tag}.js`);
    fs.writeFileSync(script, `var FACTS_OPTS = ${JSON.stringify(opts)};\n` + fs.readFileSync(SCRIPT, 'utf8'));
    const args = [path.join(REPO, 'tools/harness/run.mjs'), id, '--ticks', '0', '--profile', 'off', '--planner', '--planner-script', script, '--json', out, '--random-seed', String(seed)];
    if (st.file) args.push('--from-snapshot', st.file);
    const ch = spawn(process.execPath, args, { cwd: REPO, stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    ch.stderr.on('data', (d) => { err += d; });
    ch.on('close', () => {
      try {
        const r = JSON.parse(fs.readFileSync(out, 'utf8'));
        fs.rmSync(out, { force: true }); fs.rmSync(script, { force: true });
        const ps = r.plannerScript;
        if (!ps || ps.error || !ps.kinds) resolve({ ok: false, error: (ps && ps.error) || r.error || r.failed_at || 'no facts' });
        else resolve({ ok: true, res: ps, randomCalls: Number(r.randomCalls) || 0 });
      } catch (e) { fs.rmSync(script, { force: true }); resolve({ ok: false, error: 'no result: ' + String(e.message).slice(0, 120) + ' ' + err.slice(-300) }); }
    });
  });
}

const canon = (v) => JSON.stringify(v);
// A run of consecutive states as [first, last] (one name when they are equal) — the compact, exact form of "seen in".
export function ranges(names, order) {
  const idx = names.map((n) => order.indexOf(n)).sort((a, b) => a - b);
  const out = [];
  for (const i of idx) {
    const last = out[out.length - 1];
    if (last && last.end === i - 1) last.end = i; else out.push({ start: i, end: i });
  }
  return out.map((r) => (r.start === r.end ? order[r.start] : [order[r.start], order[r.end]]));
}

/**
 * MERGE the per-state facts. A fact id seen with ONE value in every state it was measured in is written once, with
 * `from.state` = the earliest state and `from.seen` = the ranges. A fact whose value DIFFERS between states is written
 * with every value as a `variant`, each with its own ranges — never one silently overwriting another.
 */
export function mergeStates(perState, order) {
  const byId = new Map();
  for (const { state, facts } of perState) {
    for (const f of facts) {
      const { from, ...value } = f;
      let e = byId.get(f.id);
      if (!e) { e = { id: f.id, kind: f.kind, how: from && from.how, probeStates: new Set(), values: new Map() }; byId.set(f.id, e); }
      if (from && from.probeState) e.probeStates.add(from.probeState);
      const key = canon(value);
      let v = e.values.get(key);
      if (!v) { v = { value, states: [] }; e.values.set(key, v); }
      v.states.push(state);
    }
  }
  const ids = [...byId.keys()].sort((a, b) => (KINDS.indexOf(byId.get(a).kind) - KINDS.indexOf(byId.get(b).kind)) || (a < b ? -1 : a > b ? 1 : 0));
  const out = [];
  for (const id of ids) {
    const e = byId.get(id);
    const vals = [...e.values.values()].sort((a, b) => order.indexOf(a.states[0]) - order.indexOf(b.states[0]));
    const all = vals.flatMap((v) => v.states);
    const first = order[Math.min(...all.map((s) => order.indexOf(s)))];
    const from = { how: e.how, state: first, seen: ranges(all, order), loader: `facts.mjs v${GENERATOR_VERSION}` };
    // every probe-only state a reading needed, in any state it was read in (a seeded field, an injected requirement, a
    // challenge entered on the copy) — labelled, never folded away
    if (e.probeStates.size) from.probeState = [...e.probeStates].sort().join(' | ');
    if (vals.length === 1) { out.push({ ...vals[0].value, from }); continue; }
    out.push({ id, kind: e.kind, variants: vals.map((v) => { const { id: _i, kind: _k, ...rest } = v.value; return { ...rest, seen: ranges(v.states, order) }; }), from });
  }
  return out;
}

export async function extractGame(id, { from = [], jobs = 4, kinds = null } = {}) {
  const states = statesOf(id, from);
  const opts = kinds ? { kinds } : {};
  const res = await pool(states, jobs, async (st) => {
    const r = await readState(id, st, opts, 1);
    if (!r.ok) return { st, ok: false, error: r.error };
    // a game that drew randomness: the same state under seeds 2 and 3, and every fact they disagree on ABSTAINS
    if (r.randomCalls) {
      const others = [];
      for (const seed of [2, 3]) { const o = await readState(id, st, opts, seed); if (!o.ok) return { st, ok: false, error: `seed ${seed}: ${o.error}` }; others.push(o.res); }
      for (const k of Object.keys(r.res.kinds)) {
        r.res.kinds[k] = r.res.kinds[k].map((f) => {
          const same = others.every((o) => (o.kinds[k] || []).some((g) => canon(g) === canon(f)));
          return same ? f : { id: f.id, kind: f.kind, abstain: 'the game draws randomness, and seeds 1, 2, 3 give different readings', from: f.from };
        });
      }
    }
    return { st, ok: true, res: r.res, randomCalls: r.randomCalls };
  });
  const failed = res.filter((r) => !r.ok);
  if (failed.length) return { id, ok: false, error: failed.map((f) => `${f.st.name}: ${f.error}`).join('; ') };
  const notNeutral = res.filter((r) => !r.res.stateNeutral || Object.values(r.res.neutral).some((v) => !v));
  if (notNeutral.length) return { id, ok: false, error: 'NOT NEUTRAL — ' + notNeutral.map((r) => `${r.st.name}: stateNeutral ${r.res.stateNeutral}, kinds ${Object.entries(r.res.neutral).filter(([, v]) => !v).map(([k]) => k).join(',') || 'all neutral'}`).join('; ') };
  const order = states.map((s) => s.name);
  const per = res.map((r) => ({ state: r.st.name, facts: [].concat(...(kinds || KINDS).map((k) => r.res.kinds[k] || [])) }));
  const facts = mergeStates(per, order);
  const thrown = res.flatMap((r) => r.res.errors.map((e) => ({ state: r.st.name, kind: e.kind, error: e.error })));
  const summary = {};
  for (const k of kinds || KINDS) {
    const fk = facts.filter((f) => f.kind === k);
    summary[k] = { facts: fk.length, abstained: fk.filter((f) => f.abstain).length, variants: fk.filter((f) => f.variants).length };
  }
  const m = manifest(id);
  const doc = {
    generated: true,
    generator: 'tools/harness/facts.mjs',
    generatorVersion: GENERATOR_VERSION,
    format: FORMAT,
    game: id,
    base: null,
    engine: m.engine && m.engine.tmtNum || null,
    upstream: { repo: m.upstream && m.upstream.repo, commit: m.upstream && m.upstream.commit },
    states: order,
    seeds: res.some((r) => r.randomCalls) ? [1, 2, 3] : [1],
    summary,
    thrown,
    facts,
  };
  return { id, ok: true, doc, ms: res.map((r) => ({ state: r.st.name, ms: r.res.ms })) };
}

export const text = (doc) => JSON.stringify(doc, null, 1) + '\n';
export function indexDoc(ids) { return { generated: true, generator: 'tools/harness/facts.mjs', format: FORMAT, games: ids.slice().sort() }; }
function filesOnDisk(dir = DATA) { return fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'index.json').map((f) => f.slice(0, -5)).sort() : []; }

async function pool(items, n, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (next < items.length) { const i = next++; out[i] = await fn(items[i]); }
  }));
  return out;
}

async function main() {
  const A = parseStrict(process.argv.slice(2));
  if (A.help) { process.stdout.write(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 20).join('\n') + '\n'); return 0; }
  if (A['check-index']) {
    const want = text(indexDoc(filesOnDisk()));
    const have = fs.existsSync(path.join(DATA, 'index.json')) ? fs.readFileSync(path.join(DATA, 'index.json'), 'utf8') : null;
    const ok = have === want;
    console.log(ok ? `FACTS-INDEX OK — games-facts/index.json names the ${filesOnDisk().length} files on disk` : 'FACTS-INDEX STALE — games-facts/index.json does not name exactly the files in games-facts/ (run tools/harness/facts.mjs <game>)');
    return ok ? 0 : 1;
  }
  const all = roster();
  let ids;
  if (A._.length) ids = A._;
  else if (A.check) ids = JSON.parse(fs.readFileSync(path.join(DATA, 'index.json'), 'utf8')).games;
  else throw new Error('name a game (or use --check for every game in games-facts/index.json)');
  for (const id of ids) if (!all.includes(id)) throw new Error(`${id} is not in manifests/index.json`);
  if (A.from.length && ids.length !== 1) throw new Error('--from needs exactly one game');
  const kinds = A.kinds ? String(A.kinds).split(',') : null;
  if (kinds) for (const k of kinds) if (!KINDS.includes(k)) throw new Error(`--kinds names ${k}, not one of ${KINDS.join(', ')}`);
  if ((kinds || A.from.length) && !A.out && !A.check) throw new Error('--kinds / --from write a PARTIAL file: give --out <dir> (games-facts/ holds only full extractions)');
  const jobs = Math.max(1, Number(A.jobs || 4));
  const outDir = A.out ? path.resolve(A.out) : DATA;
  const t0 = Date.now();
  const rows = [];
  let bad = 0;
  for (const id of ids) {
    const r = await extractGame(id, { from: A.from, jobs, kinds });
    if (!r.ok) { bad++; console.log(`FAILED ${id}: ${r.error}`); rows.push({ id, ok: false, error: r.error }); continue; }
    const f = path.join(outDir, id + '.json');
    const want = text(r.doc);
    const have = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
    const fresh = want === have;
    if (A.check) { if (!fresh) { bad++; console.log(`STALE ${id}: ${have === null ? 'no committed file' : 'the committed file differs from a regeneration'}`); } }
    else { fs.mkdirSync(outDir, { recursive: true }); fs.writeFileSync(f, want); }
    rows.push({ id, ok: true, fresh, summary: r.doc.summary, states: r.doc.states.length, thrown: r.doc.thrown.length, bytes: want.length, ms: r.ms });
    console.log(`FACTS ${A.check ? (fresh ? 'FRESH' : 'STALE') : 'WROTE'} ${id} — ${r.doc.states.length} state(s), ${want.length} bytes — ${Object.entries(r.doc.summary).map(([k, v]) => `${k} ${v.facts}${v.abstained ? ` (${v.abstained} abstain)` : ''}${v.variants ? ` [${v.variants} varying]` : ''}`).join(' · ')}${r.doc.thrown.length ? ` — ${r.doc.thrown.length} kind(s) THREW: ` + r.doc.thrown.map((t) => `${t.state}/${t.kind}`).join(', ') : ''}`);
  }
  if (!A.check && outDir === DATA) fs.writeFileSync(path.join(DATA, 'index.json'), text(indexDoc(filesOnDisk())));
  if (A.json) { fs.mkdirSync(path.dirname(path.resolve(A.json)), { recursive: true }); fs.writeFileSync(A.json, JSON.stringify({ ids, rows }, null, 1) + '\n'); }
  console.log(`FACTS ${A.check ? 'CHECK' : 'WRITE'} — ${ids.length} game(s), ${bad} ${A.check ? 'stale or failed' : 'failed'} — ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  return bad ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then((c) => process.exit(c), (e) => { console.error('facts: ' + e.message); process.exit(2); });
}
