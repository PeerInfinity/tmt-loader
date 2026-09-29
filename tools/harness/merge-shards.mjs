// Merges the JSON a sharded gate run produced, and REFUSES a run whose shards do not reconstruct the full roster.
//
//   node tools/harness/merge-shards.mjs <dir|file>... [--expect N] [--roster a,b,c] [--json merged.json]
//                                                     [--write-costs tools/harness/shard-costs.json]
//
// `--write-costs` records this run's per-game wall clock as the shard balance table. Only from a run that covered
// the roster — a partial run would teach the next one to balance against games nobody timed.
//
// ⛔ WHY THIS EXISTS. A shard that dies before running anything — `npm ci` fell over, the checkout timed out, the
// runner was reclaimed — produces no rows and no JSON. Nothing downstream can tell that apart from a shard that
// passed, because both leave the same absence of failures behind. Worse, the incentive runs backwards: a sharding
// bug that drops games makes the run FASTER and GREENER. An exit code is not a verdict here.
//
// So this tool does not summarise; it ACCUSES. It reconstructs the roster from the shards and fails loudly, naming
// the ids, whenever that reconstruction is not exactly the roster the gate was supposed to cover.
//
// What it asserts, each independently able to fail the run:
//   1. every shard index 1..N is present, exactly once, and all shards agree on N
//   2. every shard reports the same `commit` (a shard built from a different tree is not part of this answer)
//   3. each shard's ROWS cover exactly the roster it recorded being ASSIGNED — the check that catches a shard that
//      started, ran four games and died, which is otherwise the most convincing-looking failure of them all
//   4. the union of the rows covers the full roster exactly once: nothing missing, nothing twice
// Only then does it roll the verdicts up.
import fs from 'node:fs';
import path from 'node:path';
import { REPO, GAMES, parseArgs, writeJSON } from './lib.mjs';

/** Every *.json under `p`, or `p` itself when it is a file. Sorted, so the report reads the same on every machine. */
function collect(p) {
  const st = fs.statSync(p);
  if (!st.isDirectory()) return [p];
  return fs.readdirSync(p).sort().flatMap((f) => collect(path.join(p, f))).filter((f) => f.endsWith('.json'));
}

/**
 * The whole judgement, as a pure function so the unit test can feed it shards that never touched a browser.
 * `shards` = [{file, data}]; `roster` = the ids the run was supposed to cover.
 * Returns {ok, problems: [string], ...}. `problems` is the report: empty means the run reconstructs the roster.
 */
export function mergeShards(shards, roster, { expect = null } = {}) {
  const problems = [];
  const say = (m) => problems.push(m);
  if (!shards.length) say('no shard files were found at all — every shard is missing, which is what a broken matrix looks like');

  // --- 1. the shard set itself
  const declared = shards.map((s) => s.data.shard).filter(Boolean);
  if (declared.length !== shards.length) {
    const bad = shards.filter((s) => !s.data.shard).map((s) => s.file);
    say(`${bad.length} file(s) carry no \`shard\` block, so they cannot be placed in the run: ${bad.join(', ')}`);
  }
  const ns = [...new Set(declared.map((d) => d.n))];
  if (ns.length > 1) say(`the shards disagree about how many there are: N = ${ns.join(' and ')}`);
  const n = expect != null ? Number(expect) : (ns.length === 1 ? ns[0] : null);
  if (expect != null && ns.length === 1 && Number(expect) !== ns[0]) say(`expected a run of ${expect} shard(s); the shards say they are ${ns[0]} of ${ns[0]}`);
  if (n != null) {
    const seen = new Map();
    for (const d of declared) seen.set(d.i, (seen.get(d.i) || 0) + 1);
    const missing = []; for (let i = 1; i <= n; i++) if (!seen.has(i)) missing.push(i);
    const twice = [...seen.entries()].filter(([, c]) => c > 1).map(([i, c]) => `${i} (×${c})`);
    if (missing.length) say(`SHARD(S) MISSING: ${missing.join(', ')} of ${n} produced no result at all — a shard that dies before it runs anything leaves exactly this trace, and it is NOT a pass`);
    if (twice.length) say(`shard index reported more than once: ${twice.join(', ')}`);
  }

  // --- 2. one tree
  const commits = [...new Set(shards.map((s) => s.data.commit))];
  if (commits.length > 1) say(`the shards were built from different commits: ${commits.map((c) => String(c)).join(', ')}`);
  const gates = [...new Set(shards.map((s) => s.data.gate).filter(Boolean))];
  if (gates.length > 1) say(`the shards ran different gates: ${gates.join(', ')}`);

  // --- 3. each shard covered what it was ASSIGNED
  const rowsOf = (s) => (s.data.rows || []).map((r) => r.id);
  for (const s of shards) {
    const assigned = (s.data.shard && s.data.shard.roster) || null;
    if (!assigned) { say(`${s.file} does not record the roster it was assigned, so "it ran everything it was given" cannot be checked`); continue; }
    const got = new Set(rowsOf(s));
    const missed = assigned.filter((id) => !got.has(id));
    const extra = [...got].filter((id) => !assigned.includes(id));
    const label = s.data.shard ? `shard ${s.data.shard.i}/${s.data.shard.n}` : s.file;
    if (missed.length) say(`${label} STOPPED SHORT: assigned ${assigned.length} game(s), reported ${got.size}; never reached ${missed.join(', ')}`);
    if (extra.length) say(`${label} reported game(s) it was not assigned: ${extra.join(', ')}`);
  }

  // --- 4. the union IS the roster
  const count = new Map();
  for (const s of shards) for (const id of rowsOf(s)) count.set(id, (count.get(id) || 0) + 1);
  const missing = roster.filter((id) => !count.has(id));
  const twice = [...count.entries()].filter(([, c]) => c > 1).map(([id, c]) => `${id} (×${c})`);
  const alien = [...count.keys()].filter((id) => !roster.includes(id));
  if (missing.length) say(`ROSTER NOT COVERED: ${missing.length} of ${roster.length} game(s) were never run by any shard: ${missing.join(', ')}`);
  if (twice.length) say(`${twice.length} game(s) were run by more than one shard: ${twice.join(', ')}`);
  if (alien.length) say(`${alien.length} game(s) are not on the roster at all: ${alien.join(', ')}`);

  // --- the rollup, reported whether or not the roster reconstructed
  const rows = shards.flatMap((s) => s.data.rows || []);
  const red = rows.filter((r) => !r.ok).map((r) => r.id);
  const abstained = rows.filter((r) => r.state && !r.state.deterministic).map((r) => r.id);
  const perShard = shards.map((s) => ({
    shard: s.data.shard ? `${s.data.shard.i}/${s.data.shard.n}` : s.file,
    games: (s.data.rows || []).length,
    ms: (s.data.rows || []).reduce((t, r) => t + (r.ms || 0), 0),
    red: (s.data.rows || []).filter((r) => !r.ok).length,
  })).sort((a, b) => String(a.shard).localeCompare(String(b.shard), undefined, { numeric: true }));
  return { ok: problems.length === 0 && red.length === 0, coverageOk: problems.length === 0, problems, rows, red, abstained, perShard, commit: commits[0], gate: gates[0], roster };
}

function main() {
  const a = parseArgs(process.argv.slice(2), []);
  const inputs = a._.length ? a._ : ['shards'];
  const files = inputs.flatMap((p) => (fs.existsSync(p) ? collect(p) : []));
  const shards = files.map((f) => { try { return { file: f, data: JSON.parse(fs.readFileSync(f, 'utf8')) }; } catch (e) { return { file: f, data: { parseError: String(e.message) } }; } });
  for (const s of shards) if (s.data.parseError) console.log(`  ! ${s.file}: unreadable — ${s.data.parseError}`);
  const roster = a.roster ? a.roster.split(',').map((x) => x.trim()).filter(Boolean) : GAMES();
  const m = mergeShards(shards.filter((s) => !s.data.parseError), roster, { expect: a.expect ?? null });

  console.log(`merge: ${shards.length} shard file(s) read from ${inputs.join(', ')}; gate ${m.gate || '?'} at commit ${m.commit || '?'}`);
  for (const p of m.perShard) console.log(`  shard ${p.shard}: ${p.games} game(s), ${(p.ms / 1000).toFixed(0)} s${p.red ? `, ${p.red} RED` : ''}`);
  const wall = m.perShard.map((p) => p.ms).filter((x) => x > 0);
  if (wall.length > 1) {
    const lo = Math.min(...wall), hi = Math.max(...wall), sum = wall.reduce((x, y) => x + y, 0);
    console.log(`  spread: fastest ${(lo / 1000).toFixed(0)} s, slowest ${(hi / 1000).toFixed(0)} s (×${(hi / lo).toFixed(2)}); serial total would be ${(sum / 1000 / 60).toFixed(1)} min, sharded wall clock is the slowest at ${(hi / 1000 / 60).toFixed(1)} min`);
  }
  console.log(`  rows: ${m.rows.length}/${m.roster.length} game(s); ${m.red.length} RED${m.red.length ? `: ${m.red.join(', ')}` : ''}; ${m.abstained.length} abstained on the state leg${m.abstained.length ? ` (${m.abstained.join(', ')})` : ''}`);
  if (a['write-costs']) {
    if (!m.coverageOk) { console.log(`  (not writing ${a['write-costs']}: this run did not cover the roster, so its timings are not a roster's timings)`); }
    else {
      const ms = Object.fromEntries(m.rows.filter((r) => r.ms > 0).map((r) => [r.id, r.ms]).sort((x, y) => (x[0] < y[0] ? -1 : 1)));
      writeJSON(a['write-costs'], { note: 'Per-game wall clock from a green sharded run. A BALANCE HINT for assignShards, nothing more: a missing id falls back to the view estimate, an id no longer on the roster is ignored, and coverage never depends on any of it. Regenerate with merge-shards.mjs --write-costs.', gate: m.gate, commit: m.commit, games: Object.keys(ms).length, ms });
      console.log(`  wrote ${a['write-costs']}: ${Object.keys(ms).length} game(s) timed`);
    }
  }
  if (a.json) writeJSON(a.json, { gate: m.gate, commit: m.commit, coverageOk: m.coverageOk, ok: m.ok, perShard: m.perShard, red: m.red, abstained: m.abstained, rows: m.rows });

  if (m.problems.length) {
    console.log('');
    console.log('MERGE REFUSED — the shards do not reconstruct the roster:');
    for (const p of m.problems) console.log(`  ✘ ${p}`);
    console.log('');
    console.log('A missing shard is NOT a pass. Ten green checkmarks with one dead shard look exactly like eleven');
    console.log('green checkmarks, which is the whole reason this step runs.');
    process.exit(1);
  }
  console.log(`  coverage: the ${m.perShard.length} shard(s) cover all ${m.roster.length} game(s), each exactly once`);
  if (m.red.length) process.exit(1);
  process.exit(0);
}
if (import.meta.url === `file://${process.argv[1]}`) main();
