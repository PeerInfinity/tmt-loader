// add-game.mjs's C1 step, held by its SHAPE (docs/add-a-game.md, step 5).
//
// ⚠ Why static: add-game.mjs is a script that acts on import (it reads argv and runs git), so a test cannot import
// it, and the step has never been driven end to end — it was wired in AFTER the games of the slice that added it
// were imported, and re-adding a present game skips by design. What this CAN hold is that the step exists, runs
// after the manifests are written (it boots each game from its manifest), writes rather than checks, and names
// exactly the games the run added — so a refactor that drops or reorders it reds here, not on the next import's C1.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const src = fs.readFileSync(new URL('../tools/add-game.mjs', import.meta.url), 'utf8');

test('add-game runs currency-data --write --ids <the added ids>, after the manifests exist', () => {
  const step = src.indexOf("path.join(REPO, 'tools/currency-data.mjs')");
  assert.ok(step > 0, 'add-game.mjs no longer runs tools/currency-data.mjs');
  const call = src.slice(step, src.indexOf('\n', step));
  assert.match(call, /'--write', '--ids', ids\]/, `the call does not write for the added ids: ${call.trim()}`);
  assert.match(src.slice(src.lastIndexOf('\n', step - 200), step), /const ids = added\.map\(\(r\) => r\.id\)\.join\(','\)/,
    'the ids passed are not the games this run added');
  const manifests = src.indexOf("writeJSON(path.join(manifestsDir, `${r.id}.json`), r.manifest)");
  assert.ok(manifests > 0 && manifests < step, 'the currency step must come after the manifests are written — it boots from them');
  assert.match(src, /gate: `\$\{TAG\} C1 currency data written`/, 'the step records no SUMMARY row');
});
