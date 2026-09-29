// `gateCoverage` — the roster assertion for a battery that does NOT shard (`gates-a1 --part 2` in CI).
//
// ⛔ The failure it exists against looks like success: a battery that ran fewer games produced fewer rows and
// therefore fewer reds. Every case below is a run that a "did any row fail?" check calls green.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gateCoverage, coverageLine } from '../tools/harness/lib.mjs';

const R = (id, gate = 'g', ok = true) => ({ gate, id, ok });
const battery = (id, n, red = 0) => Array.from({ length: n }, (_, i) => R(id, `check ${i}`, i >= red));

test('a run that covers its roster, all green, is accepted', () => {
  const c = gateCoverage([...battery('ptr', 12), ...battery('something', 12)], ['ptr', 'something'], { label: 'a1-part2' });
  assert.equal(c.ok, true, c.problems.join('; '));
  assert.equal(coverageLine(c, 'a1-part2'), 'a1-part2 VERDICT: games 2/2; rows 24/24; 0 RED');
});

test('a game that produced NO rows is refused, by name', () => {
  // The shape: the second game threw before its first check, and the battery kept going.
  const c = gateCoverage(battery('ptr', 12), ['ptr', 'something']);
  assert.equal(c.ok, false);
  assert.match(c.problems.join('\n'), /GAME\(S\) MISSING[^\n]*something/);
});

test('a game that stopped PART-WAY through the battery is refused', () => {
  // ⚠ This is the one a per-game presence check misses: `something` is there, it is green, and it ran four of the
  // twelve. Its eight missing rows cannot be red.
  const c = gateCoverage([...battery('ptr', 12), ...battery('something', 4)], ['ptr', 'something']);
  assert.equal(c.ok, false);
  assert.match(c.problems.join('\n'), /did not run the same battery[\s\S]*something 4 row\(s\)/);
});

test('no rows at all is refused — the case that renders identically to a pass', () => {
  const c = gateCoverage([], ['ptr'], { label: 'a1-part2' });
  assert.equal(c.ok, false);
  assert.match(c.problems.join('\n'), /NO ROWS AT ALL/);
});

test('rows for a game the run was never given are refused', () => {
  const c = gateCoverage([...battery('ptr', 3), ...battery('the-yes-tree', 3)], ['ptr']);
  assert.equal(c.ok, false);
  assert.match(c.problems.join('\n'), /the-yes-tree, which the run was not given/);
});

test('red rows are named with their gate, and counted', () => {
  const c = gateCoverage([...battery('ptr', 12, 2), ...battery('something', 12)], ['ptr', 'something']);
  assert.equal(c.ok, false);
  assert.equal(c.red, 2);
  assert.match(c.problems.join('\n'), /2 RED row\(s\): check 0 \[ptr\] · check 1 \[ptr\]/);
  assert.equal(coverageLine(c, 'a1-part2'), 'a1-part2 VERDICT: games 2/2; rows 22/24; 2 RED');
});

test('a row with no id is refused rather than silently dropped', () => {
  const c = gateCoverage([{ gate: 'g', ok: true }, ...battery('ptr', 1)], ['ptr']);
  assert.equal(c.ok, false);
  assert.match(c.problems.join('\n'), /carries no game id/);
});
