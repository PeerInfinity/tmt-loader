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
import { check, measure, sourcesOf, tooltipsByKind, hasHardResetOptButton } from '../tools/census-figures.mjs';

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
  // ⚠ U2e: the figure that matters is the CHIPPED one, not "does this game mention `tooltip`" (171 of 171, and
  // worthless). The digit moved here is the games count, which is what decides whether the field path is worth
  // preferring at all.
  ['the tooltip census', '**140 games declare one on a chipped category**', '**141 games declare one on a chipped category**'],
  // ⚠ U5: the two figures the chip colours and the Back memory rest on. The first decides whether the layer list
  // can resolve a colour off an element that is NOT inside the game's own markup; the second, whether it can find
  // the back control by class alone.
  ['a bare `.bought`', 'a bare `.locked` rule (171 and 171)**, and **4**', 'a bare `.locked` rule (171 and 170)**, and **4**'],
  ['the back control', '(171), and 166 of', '(171), and 162 of'],
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

test('the tooltip census separates the chipped declarations from the achievements', () => {
  // ⛔ The brief this slice was given quoted ~165 of 171 for "components that declare a `tooltip`", which is the
  // ACHIEVEMENT figure: an achievement gets no chip, so those declarations can never reach the layer list's tooltip.
  // The two numbers must not be interchangeable, and the scan must attribute a declaration to its own category.
  assert.equal(sub.tooltipAny, GAMES().length, 'every game mentions `tooltip` — the engines define the component');
  assert.ok(sub.tooltipAchievement > sub.tooltipChipped * 5,
    `achievements should dominate: ${sub.tooltipAchievement} vs ${sub.tooltipChipped} chipped`);
  assert.ok(sub.tooltipChippedGames > 0 && sub.tooltipChippedGames < GAMES().length,
    `a census that said all or none would not be telling the two apart: ${sub.tooltipChippedGames}`);
  // and the scanner itself, on text whose braces it has to follow rather than grep past
  const by = tooltipsByKind('{ tooltip: "layer", upgrades: { 11: { tooltip: "u" } }, achievements: { 11: { tooltip: "a" }, 12: { tooltip: "a2" } } }');
  assert.deepEqual([by.layer, by.upgrades, by.achievements, by.milestones], [1, 1, 2, 0]);
});

test('U5 — the off-palette games are checked by NAME, not just counted', () => {
  // ⛔ The four are the reason the chip colours are asked of the stylesheet instead of hardcoded, so naming the
  // wrong four is the failure that matters: a count of 4 is right for any four ids.
  const text = read(MOBILE);
  const r = judge({ [MOBILE]: text.replace('`the-congratulations-tree` (`hsl()`)', '`ptr` (`hsl()`)') });
  assert.equal(row(r, 'a bare `.bought`').ok, false, '`ptr` uses the family palette — naming it should fail');
});

test('U5 — the bare-rule scan is not fooled by a comment above the rule', () => {
  // MEASURED on `something`, and it cost 148 of the 171 games: `general-style.css` writes
  // `/* … versions with .c.locked, for example */` on the line above the bare `.locked {`, the comment lands in
  // the selector capture, and splitting it on its comma yields neither `.locked` nor anything like it. A scan that
  // reported 23 of 171 would have read like a finding about the roster rather than like a bug in the scan.
  assert.equal(sub.boughtBare, GAMES().length, 'every game declares a bare `.bought` rule');
  assert.equal(sub.lockedBare, GAMES().length, 'every game declares a bare `.locked` rule');
  assert.equal(sub.backClass, GAMES().length, 'every game draws a back control by class');
  assert.ok(sub.backGoBack > 0 && sub.backGoBack < GAMES().length,
    `a figure that said all or none would not be telling the two wirings apart: ${sub.backGoBack}`);
});

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

// ---------------------------------------------------------------------------------------------------------------
// U3 — the OPTIONS SECTION's two anchors (docs/options.md). The reason these are censused at all: loader/options.js
// finds the game's options tab by the game's own `hardReset()` option button and by `#optionWheel`, and a game that
// carried neither would simply never show the section. Nothing that DRIVES games would report that — a panel that is
// never built throws nothing — so the claim has to be a static one, and a static claim has to be driven.
const OPTIONS_DOC = 'docs/options.md';

test('the Options anchors hold over the whole roster, in the scope the loader actually runs', () => {
  assert.deepEqual(load.noOptionsAnchor, [], 'a game the Options section could not anchor in');
  assert.equal(load.hardResetOpt, GAMES().length);
  assert.equal(load.optionWheel, GAMES().length);
  assert.equal(load.problems.length, 0, load.problems.join('\n'));
});

test('a wrong anchor figure in the prose is caught, and nothing else moves', () => {
  const text = read(OPTIONS_DOC);
  // ⚠ the sentence WRAPS in the file; the gate flattens whitespace before matching, this mutant must not assume it
  const from = '**all 171 of the 171 games carry both the';
  assert.ok(text.includes(from), 'the doc no longer contains the anchored sentence — re-point this mutant');
  const r = judge({ [OPTIONS_DOC]: text.replace(from, '**all 170 of the 171 games carry both the') });
  assert.equal(r.ok, false, 'the doctored document passed');
  const red = r.rows.filter((x) => !x.ok).map((x) => x.name);
  assert.deepEqual(red, [row(r, 'the Options section').name], `other claims went red too: ${red.join(', ')}`);
});

test('a reworded anchor claim FAILS rather than silently ceasing to be checked', () => {
  const text = read(OPTIONS_DOC);
  const r = judge({ [OPTIONS_DOC]: text.replace(/\*\*all 171 of the 171 games carry[^*]*\*\*/, 'every game carries both') });
  assert.equal(r.ok, false);
  assert.match(row(r, 'the Options section').why, /no longer states this claim/);
});

test('the anchor reader wants ONE button that is both, not two buttons that are each one', () => {
  // the discriminator for the scan itself: `class="opt"` somewhere and `hardReset()` somewhere is not the anchor
  // loader/options.js looks for, and a reader that accepted it would certify a game the section cannot anchor in.
  assert.equal(hasHardResetOptButton('<button class="opt" onclick="hardReset()">HARD RESET</button>'), true);
  assert.equal(hasHardResetOptButton('<button onclick="hardReset()" class="opt">HARD RESET</button>'), true, 'attribute order');
  assert.equal(hasHardResetOptButton('<button class="opt">Save</button><button onclick="hardReset()">reset</button>'), false);
  assert.equal(hasHardResetOptButton('<button class="options" onclick="hardReset()">x</button>'), false, '`options` is not `opt`');
  assert.equal(hasHardResetOptButton('<button class="opt" onclick="save()">Save</button>'), false);
});
