// The roster-figures census, with no tree-reading in most of it: the measurement is taken ONCE and the judgement is
// re-run against doctored documents.
//
// ⛔ THE DISCRIMINATOR, and it is the reason this file exists. A census gate that inherits the very bound it exists
// to catch is worse than no gate at all, because it CERTIFIES the error. So the bound that produced all three wrong
// figures — `games/<id>/js/**`, which drops `sorbet-s-convolution-mainframe` and its `Javascript/` engine — is
// reinstated on purpose here, and the gate must REFUSE it by name and reproduce the historically shipped numbers.
//
// The second property is the ordinary one and no less necessary: a comparison nobody has seen fail is not known to
// compare anything. Each claim is driven against a document with one digit moved.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { check, measure, sourcesOf } from '../tools/census-figures.mjs';

const REPO = path.resolve(new URL('..', import.meta.url).pathname);
const read = (f) => fs.readFileSync(path.join(REPO, f), 'utf8');

// one reading of the tree for every claim below
const sub = measure({ bound: 'subtree' });
const load = measure({ bound: 'loaded' });
const figures = { sub, load };
const judge = (docs = {}) => check({ figures, readDoc: (f) => (f in docs ? docs[f] : read(f)) });
const row = (r, name) => r.rows.find((x) => x.name.startsWith(name));

test('the committed docs and the tree agree — every documented figure, regenerated', () => {
  const r = judge();
  const bad = r.rows.filter((x) => !x.ok).map((x) => `${x.name}: ${x.why}`);
  assert.deepEqual(bad, [], bad.join('\n'));
  assert.deepEqual(sub.problems, [], 'a game whose sources were not found is never a zero');
  assert.ok(r.ok);
});

test('⛔ bounded to js/ the census REFUSES, naming the game it dropped', () => {
  // The bug, reinstated. It must not merely produce different numbers — it must say which game it could not read,
  // because "155" and "154" look equally plausible and only the named refusal distinguishes them.
  const r = check({ bound: 'js' });
  assert.equal(r.ok, false);
  assert.equal(r.sub.problems.length, 1, JSON.stringify(r.sub.problems));
  assert.match(r.sub.problems[0], /^sorbet-s-convolution-mainframe: /);
  assert.match(r.sub.problems[0], /does not keep its engine under js\//);
});

test('⛔ bounded to js/ the census reproduces the three figures that actually shipped wrong', () => {
  // Not "some smaller number": the SAME numbers this arc published and had to retract. That is what makes this a
  // regression test of the bound rather than a test that two globs differ.
  const js = measure({ bound: 'js' });
  assert.equal(js.tabArray, 1069, 'the tabFormat array count that shipped as a finding');
  assert.equal(js.tabObject, 621, 'the tabFormat object count that shipped as a finding');
  assert.equal(js.tabGames, 170, 'the "170 of 171 games" that was never a holdout game — it was the bound');
  assert.equal(js.buyUpg, 170, 'the buyUpg census that shipped as 170 of 171');
  assert.equal(js.purchaseLimit, 154, 'one game short, and the shortfall is always the same game');
  // …and unbounded, every one of them is exactly one game larger
  assert.deepEqual(
    [sub.tabArray > js.tabArray, sub.tabGames, sub.buyUpg, sub.purchaseLimit],
    [true, 171, 171, 155]);
});

test('sourcesOf refuses a game it cannot read rather than counting it as zero', () => {
  const missing = sourcesOf('a-game-that-was-never-added', 'subtree');
  assert.deepEqual(missing.files, []);
  assert.match(missing.missing, /does not exist/);
  // and the `loaded` scope refuses a manifest that names a script the tree does not hold
  const s = sourcesOf('sorbet-s-convolution-mainframe', 'loaded');
  assert.equal(s.missing, null);
  assert.ok(s.files.length > 0, 'the one game without a js/ directory still has sources under `loaded`');
});

// ---------------------------------------------------------------------------------------------------------------
// the comparison itself: one digit moved in the prose must turn the claim red
// ---------------------------------------------------------------------------------------------------------------

const MOBILE = 'docs/mobile.md';
for (const [claim, from, to] of [
  ['buyUpg', '**169 of the 171 games define it', '**170 of the 171 games define it'],
  ['tabFormat static declarations (subtree)', '**1211 array-form and 641 object-form', '**1069 array-form and 621 object-form'],
  ['tabFormat static declarations (LOADED', '**935 array-form and 455 object-form', '**935 array-form and 641 object-form'],
  ['purchaseLimit (subtree)', '**155 of the 171 games carry', '**154 of the 171 games carry'],
  ['the games with no purchaseLimit', 'The **16** that do not', 'The **17** that do not'],
]) {
  test(`a wrong figure in the prose is caught: ${claim}`, () => {
    const text = read(MOBILE);
    assert.ok(text.includes(from), `the doc no longer contains ${JSON.stringify(from)} — re-point this mutant`);
    const r = judge({ [MOBILE]: text.replace(from, to) });
    assert.equal(r.ok, false, 'the doctored document passed');
    assert.equal(row(r, claim).ok, false, `${claim} did not notice`);
    // and nothing else moved: a mutant that reds every row proves nothing about which check caught it
    const red = r.rows.filter((x) => !x.ok).map((x) => x.name);
    assert.deepEqual(red, [row(r, claim).name], `other claims went red too: ${red.join(', ')}`);
  });
}

test('the named games are checked, not just the counts', () => {
  const text = read(MOBILE);
  const r = judge({ [MOBILE]: text.replace('include `ptr`, `the-modding-tree`', 'include `something`, `the-modding-tree`') });
  assert.equal(row(r, 'the games with no purchaseLimit').ok, false, '`something` DOES carry purchaseLimit — naming it should fail');
});

test('a reworded claim FAILS rather than silently ceasing to be checked', () => {
  // The way this gate would really die: someone rewrites the sentence, the anchor stops matching, and a check that
  // reports nothing looks exactly like a check that passed.
  const text = read(MOBILE);
  const r = judge({ [MOBILE]: text.replace(/\*\*155 of the 171 games carry `purchaseLimit`[^*]*\*\*/, 'most games carry it') });
  assert.equal(r.ok, false);
  const x = row(r, 'purchaseLimit (subtree)');
  assert.equal(x.ok, false);
  assert.match(x.why, /no longer states this claim/);
});

test('the day the roster grows, every "N of 171" in the doc is stale — and the gate says so', () => {
  // The single event that invalidates all of these at once. It must not pass quietly on the claim that happens to
  // still hold: the DENOMINATOR is itself checked, everywhere the doc writes one.
  const text = read(MOBILE);
  const r = judge({ [MOBILE]: text.replaceAll('of the 171 games', 'of the 172 games') });
  assert.equal(r.ok, false);
  assert.equal(row(r, 'the roster size every').ok, false, 'the denominator claim did not notice');
});

test('a missing doc is a failure, not a pass', () => {
  const r = judge({ 'docs/games.md': null });
  assert.equal(r.ok, false);
  assert.match(row(r, 'roster size').why, /could not be read|no longer states/);
});

// ---------------------------------------------------------------------------------------------------------------
// The other figure with no mechanism behind it: a game's NAME.
//
// ⛔ Same family as the `js/` bound above, found by this slice's own new gate running against the published site.
// The census emitter reads `modInfo` out of `mod.js`; the two oldest games on the roster declare it in `js/game.js`,
// so their `name` and `version` were emitted as null — and the live picker rendered `vnull by null` with an empty
// link for as long as they have been hosted. A reader bounded to one file name drops whoever put it elsewhere.
// ---------------------------------------------------------------------------------------------------------------
import { selfDeclared, checkSelfDeclared } from '../tools/games-table.mjs';
import { GAMES, readManifest } from '../tools/harness/lib.mjs';

test('every manifest name, author and version IS the game’s own declaration', () => {
  const r = checkSelfDeclared();
  assert.deepEqual(r.problems, [], r.problems.join('\n'));
  assert.equal(r.checked, GAMES().length);
});

test('the reader is not bounded to mod.js — it finds modInfo wherever the game declares it', () => {
  // `the-modding-tree` (TMT 2.0.5.1) has no mod.js at all. This is the exact case the emitter missed.
  assert.equal(fs.existsSync(path.join(REPO, 'games/the-modding-tree/js/mod.js')), false, 'the premise of this test is that this game has no mod.js');
  assert.deepEqual(selfDeclared('the-modding-tree'), { name: 'The Modding Tree', author: null, version: '2.0.5.1' });
  assert.equal(selfDeclared('the-burning-tree').name, 'The Burning Tree');
  // …and a game that DOES keep it in mod.js still reads the same
  assert.equal(selfDeclared('something').name, readManifest('something').name);
});

test('a name that is not the game’s own is caught, and named', () => {
  const doctored = (id) => (id === 'ptr' ? { ...readManifest(id), name: 'Prestige Tree Rewritten (Deluxe)' } : readManifest(id));
  const r = checkSelfDeclared({ manifest: doctored });
  assert.equal(r.ok, false, 'a hand-written title passed');
  assert.equal(r.problems.length, 2, r.problems.join('\n'));  // the manifest itself, and index.json disagreeing with it
  assert.ok(r.problems.every((p) => p.startsWith('ptr: ')), r.problems.join('\n'));
});

test('a game that declares NO name of its own is reported, not silently accepted', () => {
  // The distinction that matters: "the game says nothing" is a different state from "the manifest disagrees", and
  // only the second is drift. Today every game on the roster declares a name, so the count is 0 — and if it ever is
  // not, the check says how many rather than passing quietly.
  assert.equal(checkSelfDeclared().undeclared, 0);
});
