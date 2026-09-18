// Two properties of the CI workflows that no run of them would tell you about in time.
//
// ⚖ User ruling, 2026-09-18: the Pages deploy stops happening on every push. That ruling lives in one place — the
// absence of a `push:` trigger in .github/workflows/pages.yml — and the way it gets undone is not malice but
// convenience: someone wants the site current after a merge and adds four lines. By the time anyone notices, the
// ruling has been silently reversed for weeks. So it is asserted here instead of remembered.
//
// The second property is the same hazard wearing the other hat: the sweep runs on every push, so if IT ever grew a
// deploy step, push-deploys-the-site would be back with a different file name on it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const REPO = path.resolve(new URL('..', import.meta.url).pathname);
const wf = (n) => fs.readFileSync(path.join(REPO, '.github/workflows', n), 'utf8');

/** The keys of the top-level `on:` block, by indentation. No YAML dependency, and this file has no reason to be exotic. */
function triggers(text) {
  const lines = text.split('\n');
  const i = lines.findIndex((l) => /^on:\s*$/.test(l) || /^on:\s*\S/.test(l));
  assert.ok(i >= 0, 'the workflow has no `on:` block at all');
  const inline = /^on:\s*(\S.*)$/.exec(lines[i]);
  if (inline) return inline[1].replace(/[[\],]/g, ' ').split(/\s+/).filter(Boolean);
  const out = [];
  for (const l of lines.slice(i + 1)) {
    if (/^\S/.test(l)) break;                       // back to column 0: the block ended
    const m = /^ {2}(\w[\w-]*):/.exec(l);           // exactly one level in
    if (m) out.push(m[1]);
  }
  return out;
}

test('pages.yml deploys ONLY on workflow_dispatch — never on a push', () => {
  const t = triggers(wf('pages.yml'));
  assert.deepEqual(t, ['workflow_dispatch'],
    `the Pages deploy is manual by ⚖ user ruling (2026-09-18); this workflow now triggers on ${t.join(', ')}`);
});

test('the sweep does not publish', () => {
  const s = wf('sweep.yml');
  for (const forbidden of ['deploy-pages', 'upload-pages-artifact', 'configure-pages']) {
    // a mention inside a comment is how this file explains itself; a `uses:` is the thing that would deploy
    const uses = s.split('\n').filter((l) => /^\s*-?\s*uses:/.test(l) && l.includes(forbidden));
    assert.deepEqual(uses, [], `sweep.yml runs ${forbidden} — that puts the deploy back on every push`);
  }
});

test('the sweep runs on push and on dispatch', () => {
  assert.deepEqual(triggers(wf('sweep.yml')).sort(), ['push', 'workflow_dispatch']);
});

test('the shard matrix and the SHARDS the runner is told about are the same number', () => {
  // They are two literals in one file, and a mismatch would not surface until a run: `--shard 11/10` throws, and
  // `--expect 10` against 12 shards refuses. Both are correct refusals and both cost a full CI run to discover.
  const s = wf('sweep.yml');
  const n = Number(/^\s*SHARDS:\s*'(\d+)'/m.exec(s)[1]);
  const matrix = /^\s*shard: \[([^\]]+)\]/m.exec(s)[1].split(',').map((x) => Number(x.trim()));
  assert.deepEqual(matrix, Array.from({ length: n }, (_, i) => i + 1),
    `SHARDS is ${n} but the matrix is [${matrix.join(', ')}]`);
});

test('the merge job cannot be skipped by a failing shard', () => {
  // `needs: shard` without `if: always()` means one red shard silently skips the roster assertion — the exact
  // shape of "a dead shard reads as green" this whole arrangement exists to prevent.
  const s = wf('sweep.yml');
  const merge = s.slice(s.indexOf('\n  merge:'));
  assert.match(merge, /needs: shard/);
  assert.match(merge, /^\s{4}if: always\(\)/m, 'the merge job must run even when a shard failed');
  assert.doesNotMatch(merge, /continue-on-error:\s*true/, 'the merge is the verdict; it may not be advisory');
});
