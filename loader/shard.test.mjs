// The sharding contract, with no browser in it: `--shard i/N` must partition the roster exactly once, and the merge
// must REFUSE a run that does not put the roster back together.
//
// ⛔ The discriminator these tests exist for runs backwards from the usual one. A sharding bug that silently drops
// games makes the CI sweep FASTER and GREENER — ten shards that each skipped half the work finish in half the time
// and report no failures. Speed is not evidence and neither is a green exit code. These two properties are:
//   · assignShards is a PARTITION — no id missing, no id twice, over every N
//   · merge-shards REFUSES a run with a shard missing, and NAMES the games nobody ran
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { GAMES, assignShards, parseShard, shardCost } from '../tools/harness/lib.mjs';

const REPO = path.resolve(new URL('..', import.meta.url).pathname);
const MERGE = path.join(REPO, 'tools/harness/merge-shards.mjs');
const roster = GAMES();

// ---------------------------------------------------------------------------------------------------------------
// `--shard i/N` covers the roster exactly once
// ---------------------------------------------------------------------------------------------------------------

// 1 and 2 are the edges; 10 is what CI runs; the roster size, one either side of it, and 200 are N near or >= the
// roster, where shards legitimately come up empty and an off-by-one would be easiest to hide. (Derived from the
// roster, not written as 170/171: the roster grew to 175 on 2026-09-22 and a literal would have quietly stopped
// testing the edge it was chosen for.)
for (const n of [...new Set([1, 2, 3, 7, 10, 17, roster.length - 1, roster.length, roster.length + 1, 200])]) {
  test(`--shard i/${n} partitions the ${roster.length}-game roster exactly once`, () => {
    const shards = assignShards(roster, n);
    assert.equal(shards.length, n, 'one slice per shard, including the empty ones');
    const seen = shards.flat();
    assert.equal(seen.length, roster.length, `${seen.length} game(s) across the shards, roster has ${roster.length}`);
    assert.deepEqual([...seen].sort(), [...roster].sort(), 'the union of the shards IS the roster');
    assert.equal(new Set(seen).size, seen.length, 'no game is run by two shards');
    for (const s of shards) assert.deepEqual(s, [...new Set(s)], 'no game is run twice inside one shard');
  });
}

test('the partition is deterministic — the same roster and N give the same slices every time', () => {
  assert.deepEqual(assignShards(roster, 10), assignShards(roster, 10));
  // and a shard is a pure function of (roster, N): independent of which shard is asking
  const all = assignShards(roster, 10);
  for (let i = 0; i < 10; i++) assert.deepEqual(assignShards(roster, 10)[i], all[i]);
});

test('with equal costs the assignment degenerates to plain round-robin — interleaving is the floor', () => {
  const ids = Array.from({ length: 23 }, (_, i) => `g${String(i).padStart(2, '0')}`);
  // no snapshots exist for these, so every cost is the base
  assert.equal(new Set(ids.map((id) => shardCost(id))).size, 1, 'the premise of this test is that the costs are equal');
  const shards = assignShards(ids, 5);
  for (let i = 0; i < 5; i++) assert.deepEqual(shards[i], ids.filter((_, k) => k % 5 === i));
});

test('the most expensive games never share a shard, and the predicted load is even', () => {
  // The risk the interleave exists for, stated as the property rather than as two game names. ⚠ Which games are
  // expensive is NOT what anyone would guess: the first green CI run (171 games, 2026-09-18) measured
  // `the-gaming-tree` at 53.4 s, `the-point-tree` at 47.2 s and `plague-tree-…` at 41.1 s — all ONE-view games —
  // against `ptr`'s 14.6 s, which opens twenty views. Boot-and-tick cost dominates view count by 30× at the median.
  const n = 10;
  const shards = assignShards(roster, n);
  const dearest = [...roster].sort((a, b) => shardCost(b) - shardCost(a)).slice(0, n);
  const where = dearest.map((id) => shards.findIndex((s) => s.includes(id)));
  assert.equal(new Set(where).size, n, `the ${n} costliest games landed in ${new Set(where).size} shard(s), not ${n}`);

  // and the whole partition is close to even on its own numbers. This is the model's PREDICTION, not a measurement
  // — the run is what measures — but a model that cannot even predict balance is not worth consulting.
  const load = shards.map((s) => s.reduce((t, id) => t + shardCost(id), 0));
  const spread = Math.max(...load) / Math.min(...load);
  assert.ok(spread < 1.25, `predicted shard load spread is \u00d7${spread.toFixed(2)}: ${load.map((x) => (x / 1000).toFixed(0) + 's').join(' ')}`);
});

test('the measured cost table is a HINT — the partition survives without it', () => {
  // `shard-costs.json` is regenerated from a green run and will go stale; a game added tomorrow is not in it. The
  // fallback must therefore be a working cost model on its own, not a crash and not a zero.
  const unknown = 'a-game-that-has-never-been-timed';
  assert.ok(shardCost(unknown) > 0, 'an untimed game must still cost something, or LPT would pile them all up');
  const mixed = [...roster.slice(0, 20), unknown];
  const shards = assignShards(mixed, 4);
  assert.deepEqual([...shards.flat()].sort(), [...mixed].sort());
});

test('--shard is 1-based, like Playwright’s, and rejects what it cannot mean', () => {
  assert.deepEqual(parseShard('1/10'), { i: 1, n: 10 });
  assert.deepEqual(parseShard('10/10'), { i: 10, n: 10 });
  assert.deepEqual(parseShard(' 3 / 4 '), { i: 3, n: 4 });
  for (const bad of ['0/10', '11/10', '-1/10', '1/0', '1', 'a/b', '', '1/10/2', '1.5/10']) {
    assert.throws(() => parseShard(bad), /--shard/, `parseShard(${JSON.stringify(bad)}) should refuse`);
  }
  assert.throws(() => assignShards(roster, 0), />= 1/);
  assert.throws(() => assignShards(roster, 2.5), /integer/);
});

// ---------------------------------------------------------------------------------------------------------------
// the merge REFUSES a run that lost a shard
// ---------------------------------------------------------------------------------------------------------------

/** Ten shards' worth of plausible gate output for `ids`, written to a fresh temp dir. */
function writeShards(dir, ids, n, { drop = [], truncate = null, commit = 'deadbee' } = {}) {
  fs.mkdirSync(dir, { recursive: true });
  const shards = assignShards(ids, n);
  for (let i = 0; i < n; i++) {
    if (drop.includes(i + 1)) continue;
    let ran = shards[i];
    if (truncate && truncate.shard === i + 1) ran = ran.slice(0, truncate.keep);
    fs.writeFileSync(path.join(dir, `m1-${i + 1}.json`), JSON.stringify({
      commit, gate: 'mobile', base: 'http://127.0.0.1:8123/',
      shard: { i: i + 1, n, roster: shards[i], rosterSize: ids.length },
      rows: ran.map((id) => ({ gate: 'M1', id, ok: true, ms: 50000, state: { deterministic: true } })),
    }));
  }
  return shards;
}

const runMerge = (args) => {
  try {
    const out = execFileSync(process.execPath, [MERGE, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status, out: `${e.stdout || ''}${e.stderr || ''}` };
  }
};

const tmp = (name) => fs.mkdtempSync(path.join(os.tmpdir(), `tmt-shard-${name}-`));

test('ten complete shards merge green and say so', () => {
  const dir = tmp('full');
  writeShards(dir, roster, 10);
  const r = runMerge([dir, '--expect', '10']);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, new RegExp(`cover all ${roster.length} game\\(s\\), each exactly once`));
});

test('NINE shards out of ten: the merge FAILS and names the games nobody ran', () => {
  // The failure this whole step exists for. Shard 4 died before it ran anything — no rows, no file, no complaint.
  // Its nine siblings are green. Without this assertion that is a green run that silently did 90% of the work.
  const dir = tmp('dropped');
  const shards = writeShards(dir, roster, 10, { drop: [4] });
  const r = runMerge([dir, '--expect', '10']);
  assert.equal(r.code, 1, `the merge accepted a run with a dead shard:\n${r.out}`);
  assert.match(r.out, /SHARD\(S\) MISSING: 4 of 10/);
  assert.match(r.out, new RegExp(`ROSTER NOT COVERED: \\d+ of ${roster.length}`));
  for (const id of shards[3]) assert.ok(r.out.includes(id), `the report never names ${id}, which nobody ran`);
});

test('a shard that started, ran part of its slice and died is caught too', () => {
  // Harder than a missing shard: the file exists, the rows are green, and the exit code of that job may well be 0.
  // Only the roster it recorded being ASSIGNED gives it away.
  const dir = tmp('short');
  const shards = writeShards(dir, roster, 10, { truncate: { shard: 7, keep: 3 } });
  const r = runMerge([dir, '--expect', '10']);
  assert.equal(r.code, 1, `the merge accepted a shard that stopped short:\n${r.out}`);
  assert.match(r.out, /shard 7\/10 STOPPED SHORT: assigned \d+ game\(s\), reported 3/);
  for (const id of shards[6].slice(3)) assert.ok(r.out.includes(id), `the report never names ${id}`);
});

test('shards built from different commits are not one answer', () => {
  const dir = tmp('mixed');
  writeShards(dir, roster, 10);
  const one = path.join(dir, 'm1-5.json');
  const d = JSON.parse(fs.readFileSync(one, 'utf8')); d.commit = 'cafef00';
  fs.writeFileSync(one, JSON.stringify(d));
  const r = runMerge([dir, '--expect', '10']);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /different commits/);
});

test('a matrix that produced nothing at all is a refusal, not a pass', () => {
  const dir = tmp('empty');
  fs.mkdirSync(dir, { recursive: true });
  const r = runMerge([dir, '--expect', '10']);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /no shard files were found at all/);
});

test('a run of 10 shards reported as a run of 8 is a refusal', () => {
  const dir = tmp('expect');
  writeShards(dir, roster, 10);
  const r = runMerge([dir, '--expect', '8']);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /expected a run of 8 shard\(s\)/);
});

test('a RED row fails the merge without touching the coverage verdict', () => {
  const dir = tmp('red');
  writeShards(dir, roster, 10);
  const one = path.join(dir, 'm1-2.json');
  const d = JSON.parse(fs.readFileSync(one, 'utf8')); d.rows[0].ok = false;
  fs.writeFileSync(one, JSON.stringify(d));
  const r = runMerge([dir, '--expect', '10']);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, new RegExp(`cover all ${roster.length} game\\(s\\), each exactly once`));  // coverage still passed
  assert.match(r.out, new RegExp(`1 RED: ${d.rows[0].id}`));
});

test('an abstention survives sharding — it stays an abstention, never a verdict', () => {
  // `the-periodic-table-tree` and five others do not repeat their own hash, so the M1 state leg abstains on them.
  // A shard boundary must not turn that into a pass or a failure; the merge just carries it through.
  const dir = tmp('abstain');
  writeShards(dir, roster, 10);
  const f = fs.readdirSync(dir).map((x) => path.join(dir, x))
    .find((x) => JSON.parse(fs.readFileSync(x, 'utf8')).rows.some((r) => r.id === 'the-periodic-table-tree'));
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  const row = d.rows.find((r) => r.id === 'the-periodic-table-tree');
  row.state = { deterministic: false };
  row.stateVerdict = 'nondeterministic (control differs: the leg abstains)';
  fs.writeFileSync(f, JSON.stringify(d));
  const r = runMerge([dir, '--expect', '10']);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /1 abstained on the state leg \(the-periodic-table-tree\)/);
});
