// load.known.missingAssets — an asset the entry document NAMES and the repository does not ship (docs/manifest.md).
//
// ⛔ THE GUARD THAT MAKES THIS A DECLARATION AND NOT A LOOSENING (⚖ 2026-09-22): the key is DERIVED from the tree,
// held to EQUALITY by check-manifest like `missingScripts`, and over the whole roster exactly the games that declare
// it derive a non-empty set. A new allowance that quietly forgave something in a game nobody was looking at is the
// failure this file exists to catch — so the roster-wide test below compares the derivation with the declarations,
// game by game, rather than counting.
//
// The first version of the scan read two false positives, both now driven here: a `discord.png` inside an HTML
// COMMENT (zavrsni-rad — no browser requests it) and a ROOT-absolute `/favicon.ico` (the-challenge-tree — it names
// the site's root, not the game's directory).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { missingAssetsOf } from '../tools/harness/check-manifest.mjs';
import { judgeLoad } from '../tools/harness/loadverdict.mjs';
import { GAMES, readManifest, REPO } from '../tools/harness/lib.mjs';

function tree(files, html) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'missingassets-'));
  for (const f of files) { fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true }); fs.writeFileSync(path.join(root, f), ''); }
  fs.writeFileSync(path.join(root, 'index.html'), html);
  return root;
}

test('the derivation: a named asset the tree lacks, compared CASE-SENSITIVELY', () => {
  // the-cosmic-tree's case: `resources/mNote.png` named, `resources/mnote.png` shipped — present on a case-insensitive
  // disk, a 404 on a web server. fs.existsSync alone would call it present on Windows or macOS.
  const root = tree(['resources/mnote.png', 'resources/play.webp'],
    '<img src="resources/mNote.png"><img src="resources/play.webp"><img src="./resources/none.gif?v=2">');
  assert.deepEqual(missingAssetsOf(root), ['resources/mNote.png', 'resources/none.gif']);
});

test('not the game’s: a comment, a root-absolute path, a URL, a data: URI, a non-asset link', () => {
  const root = tree([], [
    '<!-- <img src="discord.png"> -->',          // zavrsni-rad
    '<link rel="icon" href="/favicon.ico">',     // the-challenge-tree
    '<img src="https://example.com/x.png"><img src="//cdn.example.com/y.png">',
    '<img src="data:image/png;base64,AAAA"><a href="#top">x</a><a href="changelog.html">log</a>',
  ].join('\n'));
  assert.deepEqual(missingAssetsOf(root), []);
});

test('G1 allows a failed request ONLY for a declared asset path', () => {
  const BASE = 'http://127.0.0.1:9999/';
  const m = { id: 'g', load: { known: { missingAssets: ['resources/mNote.png'] } } };
  const pw = (failed) => ({ failed, blocked: [], pageErrors: [] });
  const loader = { skipped: [], pageErrors: [] };
  const ok = judgeLoad(m, BASE, pw([`${BASE}games/g/resources/mNote.png HTTP 404`]), loader);
  assert.equal(ok.ok, true);
  assert.equal(ok.allowed.missingAssets, 1);
  const other = judgeLoad(m, BASE, pw([`${BASE}games/g/resources/other.png HTTP 404`]), loader);
  assert.equal(other.ok, false, 'an undeclared asset 404 still reds the load');
  // …and an asset declaration never excuses a SCRIPT being skipped: `skipped` is still held to missingScripts
  const skip = judgeLoad(m, BASE, pw([]), { skipped: ['resources/mNote.png'], pageErrors: [] });
  assert.equal(skip.ok, false);
  // and an undeclared manifest is judged exactly as before
  assert.equal(judgeLoad({ id: 'g', load: {} }, BASE, pw([`${BASE}games/g/resources/mNote.png HTTP 404`]), loader).ok, false);
});

test('⛔ over the roster, the derivation EQUALS the declarations, game by game', () => {
  const bad = [];
  let nonEmpty = 0;
  for (const id of GAMES()) {
    const m = readManifest(id);
    const derived = missingAssetsOf(path.join(REPO, 'games', id), m.entry || 'index.html');
    const declared = [...(m.load.known?.missingAssets || [])].sort();
    if (derived.length) nonEmpty++;
    if (JSON.stringify(derived) !== JSON.stringify(declared)) bad.push(`${id}: derived ${JSON.stringify(derived)}, declared ${JSON.stringify(declared)}`);
  }
  assert.deepEqual(bad, []);
  assert.ok(nonEmpty < GAMES().length / 10, `${nonEmpty} games derive a missing asset — a scan that finds one in most games is misreading`);
});
