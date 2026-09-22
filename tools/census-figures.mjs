// The ROSTER FIGURES the docs cite, regenerated from the tree and ASSERTED against the prose that quotes them.
//
//   node tools/census-figures.mjs                 measure, print, and check the docs; exit 1 on drift
//   node tools/census-figures.mjs --json out.json also write the measurement
//   node tools/census-figures.mjs --bound js      ⛔ THE DISCRIMINATOR — the bound this gate exists to catch
//
// ⛔ WHY THIS EXISTS. Three wrong roster figures shipped in this arc, by two different authors, and no gate could
// have caught any of them: the sweep DRIVES games, and a number quoted in prose has nothing behind it.
//
//   | claim                  | shipped as                    | actually                                  |
//   | `buyUpg` definitions   | 170 of 171                    | 171                                       |
//   | `tabFormat` statics    | 1069 / 621, "170 of 171"      | 1211 / 641, 171 of 171                    |
//   | `purchaseLimit`        | "only TMT 2.7 declares it"    | 155 of 171 carry it; `ptr` is not one     |
//
// Every one has the same shape: `sorbet-s-convolution-mainframe` keeps its engine under `Javascript/`, not `js/`,
// so a glob bounded to `js/` silently drops one game — and a count that is too low by exactly one game looks like a
// finding about a holdout rather than like a bug in the sweep. The tabFormat figure even survived a DISAGREEMENT
// between two sessions: each explained the mismatch instead of re-running the census unbounded. The explanation was
// true and it still hid the error.
//
// ⚠ SO THIS FILE MAY NEVER ENUMERATE GAMES FROM A DIRECTORY GLOB. The roster is `manifests/index.json` (GAMES()),
// and a game whose sources cannot be found is a REFUSAL, never a zero — a zero is how one dropped game hides.
// `--bound js` reinstates the original bug on purpose so the gate can be shown FAILING on the game it exists to
// catch; `loader/census.test.mjs` drives exactly that. A census gate that inherits the bound it exists to catch is
// worse than no gate at all, because it certifies the error.
//
// ⚠ A FIGURE WITHOUT A SCOPE IS NOT A FIGURE. Two different scopes answer two different questions and the docs cite
// both, so each claim names its own:
//   · `subtree` — every `*.js` under `games/<id>/`. What the published static counts mean. It sees dead code the
//     loader never loads (`Old Code/`, `demo.html`, `js/Demo/`), which is a property of the quantity, not a bug.
//   · `loaded`  — only the files `manifests/<id>.json` says the loader loads. What the engine actually runs.
//   · `js`      — the historical bug. Present only so it can be driven.
import fs from 'node:fs';
import path from 'node:path';
import { REPO, GAMES, readManifest, parseArgs, writeJSON } from './harness/lib.mjs';

export const BOUNDS = ['subtree', 'loaded', 'js'];

/** Every `*.js` under `dir`, recursively. Used INSIDE one game, never to decide WHICH games exist. */
const walkJS = (dir) => (fs.existsSync(dir)
  ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walkJS(path.join(dir, e.name)) : e.isFile() && /\.js$/i.test(e.name) ? [path.join(dir, e.name)] : []))
  : []);

// ⚠ U5 — THE TWO FIGURES BELOW ARE NOT ABOUT `*.js`, so they do not take the `bound`. The chip colours live in
// each game's STYLESHEET and the back control in its MARKUP, and neither has ever had a `js/`-shaped bug to
// reproduce. They keep the other half of the rule that matters: a game whose files cannot be found is a REFUSAL,
// never a zero.
const walkExt = (dir, re) => (fs.existsSync(dir)
  ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walkExt(path.join(dir, e.name), re) : e.isFile() && re.test(e.name) ? [path.join(dir, e.name)] : []))
  : []);
/** Every stylesheet in one game's subtree. */
export function stylesOf(id, root = REPO) {
  const dir = path.join(root, 'games', id);
  if (!fs.existsSync(dir)) return { files: [], missing: `games/${id}/ does not exist` };
  const files = walkExt(dir, /\.css$/i);
  return { files, missing: files.length ? null : `games/${id}/ holds no .css file at all` };
}
/** Every document and script in one game's subtree — the back control is written in both. */
export function markupOf(id, root = REPO) {
  const dir = path.join(root, 'games', id);
  if (!fs.existsSync(dir)) return { files: [], missing: `games/${id}/ does not exist` };
  const files = walkExt(dir, /\.(html?|js)$/i);
  return { files, missing: files.length ? null : `games/${id}/ holds no .html or .js file at all` };
}

/**
 * One game's source files under `bound`, plus the reason they could not be found.
 * ⛔ `missing` is what keeps a dropped game from reading as a zero.
 */
export function sourcesOf(id, bound = 'subtree', root = REPO) {
  const dir = path.join(root, 'games', id);
  if (!fs.existsSync(dir)) return { files: [], missing: `games/${id}/ does not exist` };
  if (bound === 'js') {
    const files = walkJS(path.join(dir, 'js'));
    return { files, missing: files.length ? null : `games/${id}/js/ holds no .js file — this game does not keep its engine under js/` };
  }
  if (bound === 'subtree') {
    const files = walkJS(dir);
    return { files, missing: files.length ? null : `games/${id}/ holds no .js file at all` };
  }
  // `loaded`: the manifest's own list — the loader's inputs, in the loader's order.
  const m = readManifest(id, root);
  const pre = m.load.modFilesPrefix || '';
  const named = [...(m.load.scripts || []), ...(m.load.modFiles || []).map((f) => pre + f)];
  const declaredMissing = new Set(m.load.known?.missingScripts || []);
  const files = [], absent = [];
  for (const f of [...new Set(named)]) {
    // the loader's own slot, a vendored URL and an inline <script> are not files of this game's
    if (/(^|\/)loader\.js$/.test(f) || /^https?:|^\/\//.test(f) || /^inline#/.test(f)) continue;
    const p = path.join(dir, f);
    if (fs.existsSync(p)) files.push(p);
    else if (!declaredMissing.has(f)) absent.push(f);
  }
  if (absent.length) return { files, missing: `the manifest names ${absent.length} script(s) that are not in the tree and not in load.known.missingScripts: ${absent.join(', ')}` };
  return { files, missing: files.length ? null : `manifests/${id}.json names no local script at all` };
}

// ⚠ U2e — THE TOOLTIP CENSUS, and the reason it is a scan and not a grep. "Does this game declare a `tooltip`?" is
// 171 of 171 and WORTHLESS: every engine defines the component, so the word is in every tree. What decides whether
// the layer list's tooltip can prefer a declared field is whether a CHIPPED category declares one — an upgrade, a
// buyable, a challenge or a milestone — and an ACHIEVEMENT's `tooltip`, which is where the great majority of them
// are, never reaches a chip at all (docs/mobile.md: achievements and clickables are counted, never chipped).
// So each `tooltip:` is attributed to the innermost enclosing `<kind>: {` by BRACE DEPTH. ⚠ That is a text scan and
// not a parse: a brace inside a string or a comment can move an attribution, which is why the figure is reported per
// category with a `layer` bucket for everything that is in none of them, rather than as one number.
const KIND_KEYS = ['upgrades', 'buyables', 'challenges', 'milestones', 'achievements', 'clickables'];
const CHIPPED = ['upgrades', 'buyables', 'challenges', 'milestones'];
const KIND_OPEN = new RegExp('\\b(' + KIND_KEYS.join('|') + ')\\s*:\\s*\\{', 'g');
export function tooltipsByKind(text) {
  const out = { layer: 0 };
  for (const k of KIND_KEYS) out[k] = 0;
  const opens = new Map();
  for (const m of text.matchAll(KIND_OPEN)) opens.set(m.index + m[0].length - 1, m[1]);  // the index of the `{`
  const tips = new Set([...text.matchAll(/\btooltip\s*:/g)].map((m) => m.index));
  const stack = [];
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    if (tips.has(i)) out[stack.length ? stack[stack.length - 1][0] : 'layer']++;
    const c = text[i];
    if (c === '{') { depth++; if (opens.has(i)) stack.push([opens.get(i), depth]); }
    else if (c === '}') { if (stack.length && stack[stack.length - 1][1] === depth) stack.pop(); depth--; }
  }
  return out;
}

// ⚠ U3 — THE OPTIONS SECTION'S TWO ANCHORS (docs/options.md). `loader/options.js` knows no tab id, exactly as the
// nav bar knows none: it finds the options tab by the game's OWN `hardReset()` option button, and reads the corner
// wheel's absence as that engine saying the options tab is the open one. Both are properties of the GAME, so the
// day a game arrives without one the section would simply never appear on it — and no gate that DRIVES games would
// say so, because a panel that is never built throws nothing and reddens nothing. Hence a static census, over the
// ENTRY DOCUMENT as well as the sources: 2.2.1 writes its options tab into index.html, 2.7 into a component file.
const BUTTON_TAG = /<button\b[^>]*>/gi;
const CLASS_OPT = /\bclass\s*=\s*["'][^"']*\bopt\b[^"']*["']/i;
const ONCLICK_HARD_RESET = /\bonclick\s*=\s*["'][^"']*hardReset\s*\(/i;
/** Does this text carry a `<button class="opt" onclick="hardReset()">`, in either attribute order? */
export function hasHardResetOptButton(text) {
  for (const m of String(text).match(BUTTON_TAG) || []) if (CLASS_OPT.test(m) && ONCLICK_HARD_RESET.test(m)) return true;
  return false;
}
// ⚠ U5 — A BARE RULE, not "the word appears". `.bought` is in every tree (`.achievement.bought`,
// `.hn.grad:not(.bought)`), and only a BARE `.bought { … }` is reachable from an element that is not inside the
// game's own markup — which is exactly what the layer list's off-screen colour probe is. The selector may be part
// of a group (`.bought, .x {`), so the scan is over comma-separated selectors, not over whole rules.
// ⚠ `[^{}]+` for BOTH halves, and no anchor on the left: a selector cannot contain a brace, so this walks the
// rules of a flat stylesheet and of the ones nested in an `@media` block alike — and an anchor on the preceding
// `}` would match only every OTHER rule, because `matchAll` resumes after the brace the last match consumed.
// MEASURED: with the anchor this reported 16 of 171 games as declaring `.bought`, against 171 without it.
const bareRule = (raw, cls) => {
  // ⚠ COMMENTS OUT FIRST. MEASURED on `something`, whose `general-style.css` writes
  // `/* … versions with .c.locked, for example */` immediately above the bare `.locked {` rule: the comment lands
  // inside the selector capture, splitting on its comma gives `… .c.locked` and `for example */ .locked`, and
  // neither is `.locked`. That one comment cost 148 of the 171 games — reported as 23 declaring the rule, which
  // would have read like a finding about the roster rather than like a bug in the scan.
  const text = String(raw).replace(/\/\*[\s\S]*?\*\//g, ' ');
  for (const m of text.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const sels = m[1].split(',').map((x) => x.trim()).map((x) => x.slice(x.lastIndexOf('}') + 1).trim());
    if (!sels.some((x) => x === '.' + cls)) continue;
    const bg = /background(?:-color)?\s*:\s*([^;}]+)/i.exec(m[2]);
    return { bare: true, value: bg ? bg[1].replace(/!important/i, '').trim().toLowerCase() : null };
  }
  return { bare: false, value: null };
};
// the family's own two, which 167 and 164 of the roster use unchanged — measured, never assumed (see `claims`)
const FAMILY = { bought: '#77bf5f', locked: '#bf8f8f' };
// ⚠ The back control is `class="back"` / `class="other-back"` in the markup and
// `v-bind:class="back == 'big' ? 'other-back' : 'back'"` in the engines' own `layer-tab` component. Both forms, and
// nothing else: a word `back` anywhere in a file is not a control.
const RE_BACK_CLASS = /<button[^>]{0,400}?class="[^"]{0,120}?\bother-back\b[^"]{0,120}?"|<button[^>]{0,400}?class="[^"]{0,120}?\bback\b[^"]{0,120}?"|back\s*==\s*'big'\s*\?\s*'other-back'\s*:\s*'back'/;
const RE_BACK_GOBACK = /goBack\s*\(/;

// ⚠ U6 — THE ARMING TOGGLE'S CLICK PATH (docs/automation.md). `loader/tmt-auto.js` replaces the global
// `toggleAuto` for exactly `['au','armLocked']`, and whether that replacement is REACHABLE is the games' business:
// a top-level `function toggleAuto` is a property of the global object (a Vue template compiles to `with(this)` and
// falls through to it), while a game that put `toggleAuto` in its Vue instance's `data` would shadow it and keep
// today's behaviour instead. Both are static properties of each tree, and no gate that DRIVES games would notice
// the day one changed — a wrapper that is never reached throws nothing.
// ⚠ The BODY test is what splits the roster into the games that write the field through `Vue.set` and the ones
// that assign plainly — the plain ones are where the defect is visible at all, because Vue 2 cannot observe a key
// added after creation. ⛔ IT IS BRACE-MATCHED, not a bounded regex. A `[\s\S]{0,800}?\n\}` window was measured
// misclassifying TWO games whose body is longer than the window: it ran past the closing brace and found a
// `Vue.set` further down the file, reporting 149/22 where the truth is 147/24.
// ⛔ AND THE SCOPE IS `loaded`, NOT `subtree`, with the LAST declaration winning. Measured: TWO games declare
// `toggleAuto` in more than one file and the copies DISAGREE — `the-yes-tree` (`js/mod.js` plain,
// `js/utils/options.js` through `Vue.set`) and `the-tree-emipiplu` (three copies under `2/`, `3/` and `js/`). Which
// one the click reaches is decided by LOAD ORDER, so the question is only answerable over the manifest's own list,
// in the manifest's own order, taking the last.
// ⚠ U7 — THE PRESTIGE STRING'S OWN BREAKS (docs/mobile.md). The layer list splits the engines' prestige text on
// its FIRST run of `<br>`s, so "how many breaks are there, and who writes them" is a property of the ROSTER that
// decides whether that split rule is right — and no gate that DRIVES games could answer it, because the layer
// whose override has eight breaks is one nobody's recorded snapshot reaches.
//
// Two different declarations, counted apart:
//  · the GLOBAL `function prestigeButtonText(layer)` — the engines' own, with its `normal` / `static` / `none`
//    branches and an `else return layers[layer].prestigeButtonText()`. Brace-matched, LAST declaration winning,
//    over the `loaded` scope, for the reason `toggleAuto` is: which one the page reaches is decided by load order.
//  · the per-LAYER `prestigeButtonText() { … }` a layer declares to serve that `else` branch — free HTML, and the
//    thing the split rule has to survive.
// ⚠ The per-layer form is told from the global by the word before it: `function prestigeButtonText` is the global
// wherever it appears, and everything else is a member. A bounded regex would mis-split a long body, so both are
// brace-matched (the `toggleAuto` census records what a `[\s\S]{0,800}?` window cost).
// ⚠ U7 — A LAYER'S OWN DECIMALS (docs/mobile.md). The layer list reports the resources a layer states only inside
// its own panel, and the size of that question is a property of the ROSTER: how many `startData()` blocks carry a
// Decimal the ENGINE did not put there. Static, over the whole subtree, and brace-matched for the reason every
// other body census here is — a bounded window runs past the closing brace on a long one.
// ⚠ IT IS A TEXT SCAN AND NOT A PARSE, so a `new Decimal(` inside a string or a comment can be miscounted. It is
// reported as three numbers that move together (blocks, pairs, games) rather than as one, and the RUNTIME detector
// the list actually ships is a different and stricter thing — this figure sizes the question, never the feature.
const RE_START_DATA = /\bstartData\s*(?:\([^)]*\))?\s*\{/g;
// what both engines put in `player[layer]` themselves (`getStartPlayer` / `getStartLayerData`)
const ENGINE_LAYER_KEYS = new Set(['points', 'best', 'total', 'unlocked', 'resetTime', 'forceTooltip',
  'noRespecConfirm', 'buyables', 'clickables', 'spentOnBuyables', 'upgrades', 'milestones', 'lastMilestone',
  'primeMiles', 'achievements', 'challenges', 'grid', 'prevTab', 'activeChallenge', 'subtabs', 'infoboxes']);
/** The layer-own Decimal keys declared in one `startData` body, deduplicated. */
export function startDataExtras(body) {
  const out = new Set();
  for (const m of body.matchAll(/([A-Za-z_$][\w$]*)\s*:\s*new\s+Decimal\s*\(/g)) {
    if (!ENGINE_LAYER_KEYS.has(m[1])) out.add(m[1]);
  }
  return [...out];
}

const RE_PRESTIGE_GLOBAL = /^\s*function\s+prestigeButtonText\s*\([^)]*\)\s*\{/gm;
const RE_PRESTIGE_MEMBER = /(?<!function\s{1,4})\bprestigeButtonText\s*(?:\([^)]*\))?\s*\{/g;
/** Every body matching `re` in `text`, brace-matched, in source order. */
export function bracedBodies(text, re) {
  const out = [];
  for (const m of String(text).matchAll(re)) {
    let depth = 0, end = -1;
    for (let i = m.index + m[0].length - 1; i < text.length; i++) {
      const c = text[i];
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) { end = i; break; } }
    }
    out.push(text.slice(m.index, end < 0 ? text.length : end + 1));
  }
  return out;
}
const countBr = (body) => (body.match(/<br\s*\/?>/gi) || []).length;

const RE_TOGGLE_DECL = /^function\s+toggleAuto\s*\(/m;
/** Every top-level `function toggleAuto(...) {...}` in one file, brace-matched, in source order. */
export function toggleAutoBodies(text) {
  const out = [];
  for (const m of String(text).matchAll(/^function\s+toggleAuto\s*\([^)]*\)\s*\{/gm)) {
    let depth = 0, end = -1;
    for (let i = m.index + m[0].length - 1; i < text.length; i++) {
      const c = text[i];
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) { end = i; break; } }
    }
    out.push(text.slice(m.index, end < 0 ? text.length : end + 1));
  }
  return out;
}
// `data: { … toggleAuto … }` in a `new Vue({...})` block — the shadowing case, measured rather than assumed
const RE_TOGGLE_IN_DATA = /data:\s*\{[\s\S]{0,2000}?\btoggleAuto\b[\s\S]{0,2000}?\}/;

const RE = {
  optButton: /<button\b[^>]*\bclass\s*=\s*["'][^"']*\bopt\b/i,
  optionWheel: /\bid\s*=\s*["']optionWheel["']/i,
  buyUpg: /function\s+buyUpg\s*\(/,
  // ⚠ an ALIAS defines it too: `the-collab-tree-lun4-r` has `const buyUpgrade = buyUpg;` (js/utils.js:89), which the
  // loader's `typeof buyUpgrade === 'function'` sees and calls. Matching only `function buyUpgrade(` counted that game
  // as ONLY-buyUpg on the day it was added (2026-09-22) — the same shape of miss as the `js/` bound, one declaration form
  // instead of one directory.
  buyUpgrade: /function\s+buyUpgrade\s*\(|\b(?:const|let|var)\s+buyUpgrade\s*=/,
  pseudoUnlGlobal: /function\s+pseudoUnl\s*\(/,
  pseudoUnlComponent: /pseudoUnl\s*[:(]/,
  purchaseLimit: /purchaseLimit/,
  layerSupportFile: /layersupport/i,
  // V1 (T2): the component the ENGINE draws a subtab bar with. The `au` tab took subtabs, so the loader now asks
  // every game for a component it has never asked for. ⚠ Quote-agnostic — the games use all three kinds.
  tabButtons: /Vue\.component\s*\(\s*["'`]tab-buttons["'`]/,
  // V2: the mechanism the LOADER's own editors ride on, and the three engine inputs it deliberately does NOT use.
  // ⛔ `column` is the load-bearing premise: both engines render a `tabFormat` entry by NAME through it
  // (`v-bind:is="item[0]"`), which is the only reason a component the loader registers can appear in the au tab at
  // all. The day a game stops registering it, the editors have nothing to draw them and nothing static would say so.
  colComponent: /Vue\.component\s*\(\s*["'`]column["'`]/,
  textInput: /Vue\.component\s*\(\s*["'`]text-input["'`]/,
  sliderComponent: /Vue\.component\s*\(\s*["'`]slider["'`]/,
  dropDown: /Vue\.component\s*\(\s*["'`]drop-down["'`]/,
};

/**
 * The measurement. `problems` is non-empty when any game's sources could not be found — the run then REFUSES rather
 * than reporting numbers computed over a roster it did not read.
 */
export function measure({ bound = 'subtree', root = REPO } = {}) {
  const ids = GAMES();
  const problems = [];
  const per = {};
  for (const id of ids) {
    const { files, missing } = sourcesOf(id, bound, root);
    if (missing) problems.push(`${id}: ${missing}`);
    const g = { files: files.length, optButton: false, hardResetOpt: false, optionWheel: false, buyUpg: false, buyUpgrade: false, tabArray: 0, tabObject: 0, purchaseLimit: false, purchaseLimitInLayerSupport: false, tabButtons: false, colComponent: false, textInput: false, sliderComponent: false, dropDown: false, pseudoUnlGlobal: false, pseudoUnlComponent: false, tooltipAny: false, tooltipChipped: 0, tooltipAchievement: 0, boughtBare: false, lockedBare: false, boughtValue: null, lockedValue: null, backClass: false, backGoBack: false, toggleAutoDecl: false, toggleAutoVueSet: false, toggleAutoInData: false, prestigeGlobal: false, prestigeGlobalBr: null, prestigeGlobalShape: null, prestigeLayerBr: [], startBlocks: 0, startWithExtra: 0, startPairs: 0 };
    // the ENTRY DOCUMENT, which no `bound` covers: it is not a `.js` file and it is where 2.2.1 keeps both anchors.
    // ⛔ A game whose entry cannot be read is a PROBLEM, never a false — the same rule the bounds are under.
    const entry = path.join(root, 'games', id, (readManifest(id, root).entry) || 'index.html');
    if (!fs.existsSync(entry)) problems.push(`${id}: the manifest's entry document is not in the tree (${path.relative(root, entry)})`);
    for (const f of [...files, ...(fs.existsSync(entry) ? [entry] : [])]) {
      // latin1: these are third-party trees and some are not valid UTF-8; every pattern here is ASCII.
      const text = fs.readFileSync(f, 'latin1');
      if (RE.optButton.test(text)) g.optButton = true;
      if (RE.optionWheel.test(text)) g.optionWheel = true;
      if (hasHardResetOptButton(text)) g.hardResetOpt = true;
      if (RE.buyUpg.test(text)) g.buyUpg = true;
      if (RE.buyUpgrade.test(text)) g.buyUpgrade = true;
      if (RE.pseudoUnlGlobal.test(text)) g.pseudoUnlGlobal = true;
      // ⚠ `.js` only (the entry document is walked with the sources here, and it is not a script of the game's
      // own load order), and the LAST declaration wins — over the loaded files, in the loader's order.
      if (/\.js$/i.test(f) && RE_TOGGLE_DECL.test(text)) {
        const bodies = toggleAutoBodies(text);
        if (bodies.length) { g.toggleAutoDecl = true; g.toggleAutoVueSet = /Vue\.set/.test(bodies[bodies.length - 1]); }
      }
      if (!g.toggleAutoInData && RE_TOGGLE_IN_DATA.test(text)) g.toggleAutoInData = true;
      // U7: the prestige string's breaks — `.js` only, the LAST global declaration winning, and every per-layer
      // override collected (a game can declare several, in several files).
      if (/\.js$/i.test(f)) {
        const gs = bracedBodies(text, new RegExp(RE_PRESTIGE_GLOBAL.source, 'gm'));
        if (gs.length) {
          const body = gs[gs.length - 1];
          g.prestigeGlobal = true;
          g.prestigeGlobalBr = countBr(body);
          g.prestigeGlobalShape = `${/type\s*==?\s*["']normal["']/.test(body) ? 'n' : '-'}${/type\s*==?\s*["']static["']/.test(body) ? 's' : '-'}${/layers\[layer\]\.prestigeButtonText\s*\(/.test(body) ? 'e' : '-'}`;
        }
        for (const b of bracedBodies(text, new RegExp(RE_PRESTIGE_MEMBER.source, 'g'))) {
          if (/^\s*function\s/.test(b)) continue;   // the global, matched from its own name
          g.prestigeLayerBr.push(countBr(b));
        }
        // U7: how many `startData()` blocks carry a Decimal the engine did not put there
        for (const b of bracedBodies(text, new RegExp(RE_START_DATA.source, 'g'))) {
          g.startBlocks++;
          const x = startDataExtras(b);
          if (x.length) { g.startWithExtra++; g.startPairs += x.length; }
        }
      }
      if (RE.pseudoUnlComponent.test(text)) g.pseudoUnlComponent = true;
      if (RE.tabButtons.test(text)) g.tabButtons = true;
      if (RE.colComponent.test(text)) g.colComponent = true;
      if (RE.textInput.test(text)) g.textInput = true;
      if (RE.sliderComponent.test(text)) g.sliderComponent = true;
      if (RE.dropDown.test(text)) g.dropDown = true;
      if (RE.purchaseLimit.test(text)) {
        g.purchaseLimit = true;
        if (RE.layerSupportFile.test(path.basename(f))) g.purchaseLimitInLayerSupport = true;
      }
      if (text.indexOf('tooltip') >= 0) {
        g.tooltipAny = true;
        const by = tooltipsByKind(text);
        for (const k of CHIPPED) g.tooltipChipped += by[k];
        g.tooltipAchievement += by.achievements;
      }
      // a declaration is classified by the first character of its VALUE: `[` array form, `{` object/subtab form.
      // A `tabFormat()` function (PTR has one) is neither, and is counted separately rather than silently dropped.
      for (const m of text.matchAll(/tabFormat\s*:\s*/g)) {
        const c = text[m.index + m[0].length];
        if (c === '[') g.tabArray++; else if (c === '{') g.tabObject++;
      }
    }
    // ---- U5: the chip colours (stylesheets) and the back control (markup), both over the whole subtree --------
    const st = stylesOf(id, root);
    if (st.missing) problems.push(`${id}: ${st.missing}`);
    for (const f of st.files) {
      const text = fs.readFileSync(f, 'latin1');
      if (!g.boughtBare) { const r = bareRule(text, 'bought'); if (r.bare) { g.boughtBare = true; g.boughtValue = r.value; } }
      if (!g.lockedBare) { const r = bareRule(text, 'locked'); if (r.bare) { g.lockedBare = true; g.lockedValue = r.value; } }
    }
    const mk = markupOf(id, root);
    if (mk.missing) problems.push(`${id}: ${mk.missing}`);
    for (const f of mk.files) {
      if (g.backClass && g.backGoBack) break;
      const text = fs.readFileSync(f, 'latin1');
      if (!g.backClass && RE_BACK_CLASS.test(text)) g.backClass = true;
      if (!g.backGoBack && RE_BACK_GOBACK.test(text)) g.backGoBack = true;
    }
    per[id] = g;
  }
  const where = (f) => ids.filter((id) => per[id][f]);
  const sum = (f) => ids.reduce((n, id) => n + per[id][f], 0);
  return {
    bound,
    roster: ids.length,
    files: sum('files'),
    problems,
    per,
    optButton: where('optButton').length,
    hardResetOpt: where('hardResetOpt').length,
    optionWheel: where('optionWheel').length,
    noOptionsAnchor: ids.filter((id) => !(per[id].hardResetOpt && per[id].optionWheel)),
    buyUpg: where('buyUpg').length,
    buyUpgrade: where('buyUpgrade').length,
    onlyBuyUpg: ids.filter((id) => per[id].buyUpg && !per[id].buyUpgrade),
    tabArray: sum('tabArray'),
    tabObject: sum('tabObject'),
    tabGames: ids.filter((id) => per[id].tabArray + per[id].tabObject > 0).length,
    purchaseLimit: where('purchaseLimit').length,
    purchaseLimitInLayerSupport: where('purchaseLimitInLayerSupport').length,
    noPurchaseLimit: ids.filter((id) => !per[id].purchaseLimit),
    pseudoUnlGlobal: where('pseudoUnlGlobal'),
    pseudoUnlComponentOnly: ids.filter((id) => per[id].pseudoUnlComponent && !per[id].pseudoUnlGlobal),
    tooltipAny: where('tooltipAny').length,
    tooltipChippedGames: ids.filter((id) => per[id].tooltipChipped > 0).length,
    tooltipChipped: sum('tooltipChipped'),
    tooltipAchievement: sum('tooltipAchievement'),
    // --- U5 (subtree, and NOT subject to `bound`: these are .css / .html, not .js) ---
    boughtBare: where('boughtBare').length,
    lockedBare: where('lockedBare').length,
    // the games that paint either state something other than the family's own pair — the reason the layer list
    // asks the stylesheet instead of carrying a table of hex values
    offPalette: ids.filter((id) => (per[id].boughtValue && per[id].boughtValue !== FAMILY.bought)
      || (per[id].lockedValue && per[id].lockedValue !== FAMILY.locked)),
    backClass: where('backClass').length,
    backGoBack: where('backGoBack').length,
    // --- U6: the arming toggle's click path ---
    toggleAutoDecl: where('toggleAutoDecl').length,
    toggleAutoVueSet: where('toggleAutoVueSet').length,
    toggleAutoPlain: ids.filter((id) => per[id].toggleAutoDecl && !per[id].toggleAutoVueSet).length,
    toggleAutoInData: where('toggleAutoInData').length,
    // --- U7: the prestige string's breaks (loaded) ---
    prestigeGlobal: where('prestigeGlobal').length,
    noPrestigeGlobal: ids.filter((id) => !per[id].prestigeGlobal),
    // the games whose global is NOT the family's three-branch shape, and the ones whose break count is not 4
    prestigeOffShape: ids.filter((id) => per[id].prestigeGlobal && per[id].prestigeGlobalShape !== 'nse'),
    prestigeGlobalBr: ids.reduce((o, id) => { const n = per[id].prestigeGlobalBr; if (n !== null) o[n] = (o[n] || 0) + 1; return o; }, {}),
    prestigeGlobalBrOdd: ids.filter((id) => per[id].prestigeGlobalBr !== null && per[id].prestigeGlobalBr !== 4),
    prestigeLayerGames: ids.filter((id) => per[id].prestigeLayerBr.length).length,
    prestigeLayerOverrides: ids.reduce((n, id) => n + per[id].prestigeLayerBr.length, 0),
    prestigeLayerBr: ids.reduce((o, id) => { per[id].prestigeLayerBr.forEach((n) => { o[n] = (o[n] || 0) + 1; }); return o; }, {}),
    // --- U7: how big the other-resources question is (subtree) ---
    startBlocks: sum('startBlocks'),
    startWithExtra: sum('startWithExtra'),
    startPairs: sum('startPairs'),
    startGames: ids.filter((id) => per[id].startWithExtra > 0).length,
    // --- V1: the subtab bar ---
    tabButtons: where('tabButtons').length,
    noTabButtons: ids.filter((id) => !per[id].tabButtons),
    colComponent: where('colComponent').length,
    noColComponent: ids.filter((id) => !per[id].colComponent),
    textInput: where('textInput').length,
    sliderComponent: where('sliderComponent').length,
    dropDown: where('dropDown').length,
    noEngineInput: ids.filter((id) => !per[id].textInput && !per[id].sliderComponent && !per[id].dropDown),
  };
}

const num = (s) => Number(String(s).replace(/[,\s]/g, ''));
const ids = (s) => [...String(s).matchAll(/`([a-z0-9-]+)`/g)].map((m) => m[1]);
const setEq = (a, b) => a.length === b.length && [...a].sort().join() === [...b].sort().join();

/**
 * The claims, each anchored on the sentence in the doc that states it. A claim whose anchor no longer matches is a
 * FAILURE, not a skip: a reworded sentence must not silently disarm the check that certifies its numbers.
 *
 * `sub` (subtree) and `load` (loaded) are two measurements of the same tree under two scopes, because the docs cite
 * both and conflating them is how the first three figures went wrong.
 */
export function claims(sub, load) {
  const N = sub.roster;
  return [
    {
      name: 'roster size',
      doc: 'docs/games.md',
      re: /(\d+) games, in the order they were added/,
      expect: (m) => [num(m[1]) === N, `docs/games.md says ${m[1]} games; manifests/index.json holds ${N}`],
      measured: `${N} games`,
    },
    {
      name: 'the roster size every "N of 171" figure is quoted against',
      doc: 'docs/mobile.md',
      // ⚠ Every figure below is "x of 171". The day the roster grows, ALL of them are stale — so the denominator is
      // itself a claim, checked wherever mobile.md writes one.
      // ⚖ 2026-09-22 (tmt-forks-1, the first roster growth after this gate): a figure that is a RECORD of an earlier
      // tree — a CI run, a census at a named commit, a retracted number quoted as it shipped — is not a claim about
      // today's roster, and re-deriving it would mean re-running history. It opts out EXPLICITLY, in the prose, with
      // "games then hosted"; everything else is still held to the roster. The anchors of the checked claims below
      // spell their own wording, so none of them can take the escape.
      re: /of (?:the )?(\d+) games(?! then hosted)/g,
      all: true,
      expect: (ms) => {
        const bad = ms.filter((m) => num(m[1]) !== N).map((m) => m[0]);
        return [bad.length === 0, `docs/mobile.md quotes a denominator that is not the roster: ${bad.join(' / ')}`];
      },
      measured: `${N}`,
    },
    {
      // U3: the two anchors loader/options.js finds the options tab by. Measured under `loaded` PLUS the entry
      // document — the scope of "what the loader actually runs on this page" — because a section that is never
      // built throws nothing, and no gate that drives games would ever say the anchor was missing.
      name: 'the Options section\u2019s two anchors (U3, loaded + the entry document)',
      doc: 'docs/options.md',
      re: /\*\*all (\d+) of the (\d+) games carry both the `hardReset\(\)` option button and `#optionWheel`\*\*/,
      expect: (m) => [num(m[1]) === load.hardResetOpt && num(m[1]) === load.optionWheel && num(m[2]) === N
        && load.noOptionsAnchor.length === 0,
        `${m[1]} of ${m[2]}`],
      measured: `${load.hardResetOpt} with the option button and ${load.optionWheel} with the wheel, of ${N}${load.noOptionsAnchor.length ? ` \u2014 WITHOUT one: ${load.noOptionsAnchor.join(', ')}` : ''}`,
    },
    {
      name: 'buyUpg / buyUpgrade definitions (subtree)',
      doc: 'docs/mobile.md',
      // ⚠ the ONLY-buyUpg games are a LIST (two until 2026-09-22, three since `the-collab-tree-lun4-r`), each name
      // optionally followed by its engine version in parentheses; the set is compared, not the count
      re: /\*\*(\d+) of the (\d+) games define it, all (\d+) define `buyUpg`, and ((?:`[a-z0-9-]+`(?: \([\d.]+\))?(?:, and |, | and | ))+)define ONLY `buyUpg`\*\*/,
      expect: (m) => {
        const want = { upgrade: num(m[1]), roster: num(m[2]), upg: num(m[3]), only: ids(m[4]) };
        const ok = want.upgrade === sub.buyUpgrade && want.roster === N && want.upg === sub.buyUpg && setEq(want.only, sub.onlyBuyUpg);
        return [ok, `doc: ${want.upgrade}/${want.roster} define buyUpgrade, ${want.upg} define buyUpg, only-buyUpg ${want.only.join(' + ')}`];
      },
      measured: `${sub.buyUpgrade}/${N} define buyUpgrade, ${sub.buyUpg} define buyUpg, only-buyUpg ${sub.onlyBuyUpg.join(' + ') || '—'}`,
    },
    {
      name: 'tabFormat static declarations (subtree)',
      doc: 'docs/mobile.md',
      re: /static counts are \*\*([\d,]+) array-form and ([\d,]+) object-form, in (\d+) of (\d+) games\*\*/,
      expect: (m) => {
        const ok = num(m[1]) === sub.tabArray && num(m[2]) === sub.tabObject && num(m[3]) === sub.tabGames && num(m[4]) === N;
        return [ok, `doc: ${m[1]} array / ${m[2]} object in ${m[3]} of ${m[4]}`];
      },
      measured: `${sub.tabArray} array / ${sub.tabObject} object in ${sub.tabGames} of ${N}`,
    },
    {
      name: 'tabFormat static declarations (LOADED files only)',
      doc: 'docs/mobile.md',
      re: /over only the files the loader actually loads[^*]*\*\*([\d,]+) array-form and ([\d,]+) object-form, in (\d+) of (\d+) games\*\*/,
      expect: (m) => {
        const ok = num(m[1]) === load.tabArray && num(m[2]) === load.tabObject && num(m[3]) === load.tabGames && num(m[4]) === N;
        return [ok, `doc: ${m[1]} array / ${m[2]} object in ${m[3]} of ${m[4]}`];
      },
      measured: `${load.tabArray} array / ${load.tabObject} object in ${load.tabGames} of ${N}`,
    },
    {
      name: 'purchaseLimit (subtree)',
      doc: 'docs/mobile.md',
      re: /\*\*(\d+) of the (\d+) games carry `purchaseLimit`, (\d+) of them defaulting it in their own layer support\*\*/,
      expect: (m) => {
        const ok = num(m[1]) === sub.purchaseLimit && num(m[2]) === N && num(m[3]) === sub.purchaseLimitInLayerSupport;
        return [ok, `doc: ${m[1]} of ${m[2]} carry it, ${m[3]} defaulting it in layer support`];
      },
      measured: `${sub.purchaseLimit} of ${N} carry it, ${sub.purchaseLimitInLayerSupport} defaulting it in layer support`,
    },
    {
      name: 'the games with no purchaseLimit',
      doc: 'docs/mobile.md',
      re: /The \*\*(\d+)\*\* that do not happen to include `([a-z0-9-]+)`, `([a-z0-9-]+)` and `([a-z0-9-]+)`/,
      expect: (m) => {
        const named = [m[2], m[3], m[4]];
        const notIn = named.filter((id) => !sub.noPurchaseLimit.includes(id));
        const ok = num(m[1]) === sub.noPurchaseLimit.length && notIn.length === 0;
        return [ok, `doc: ${m[1]} without it, naming ${named.join(', ')}${notIn.length ? ` — but ${notIn.join(', ')} DOES carry it` : ''}`];
      },
      measured: `${sub.noPurchaseLimit.length} without it: ${sub.noPurchaseLimit.join(', ')}`,
    },
    {
      name: 'the tooltip census — the worthless figure and the useful one (U2e)',
      doc: 'docs/mobile.md',
      re: /\*\*all (\d+) of the (\d+) games\*\* mention `tooltip`[^*]*\*\*(\d+) games declare one on a chipped category\*\*, ([\d,]+) declarations against ([\d,]+) on achievements/,
      expect: (m) => {
        const ok = num(m[1]) === sub.tooltipAny && num(m[2]) === N && num(m[3]) === sub.tooltipChippedGames
          && num(m[4]) === sub.tooltipChipped && num(m[5]) === sub.tooltipAchievement;
        return [ok, `doc: ${m[1]}/${m[2]} mention it, ${m[3]} games declare one on a chipped category, ${m[4]} against ${m[5]} on achievements`];
      },
      measured: `${sub.tooltipAny}/${N} mention it, ${sub.tooltipChippedGames} games declare one on a chipped category, ${sub.tooltipChipped} against ${sub.tooltipAchievement} on achievements`,
    },
    {
      // U5 — the figure the layer list's chip colours rest on. If it ever stops being "every game", the probe that
      // resolves the colour off a `document.body` element stops being reachable for whichever game broke it, and
      // that game's chips go transparent with no gate to say so.
      name: 'a bare `.bought` / `.locked` rule, and the games off the family palette (U5)',
      doc: 'docs/mobile.md',
      re: /\*\*every one of the (\d+) games declares a bare `\.bought` rule and a bare `\.locked` rule \((\d+) and (\d+)\)\*\*, and \*\*(\d+)\*\* of them — ([^—]*) — paint/,
      expect: (m) => {
        const named = ids(m[5]);
        const ok = num(m[1]) === N && num(m[2]) === sub.boughtBare && num(m[3]) === sub.lockedBare
          && num(m[4]) === sub.offPalette.length && setEq(named, sub.offPalette);
        return [ok, `doc: ${m[2]} bare .bought, ${m[3]} bare .locked of ${m[1]}; ${m[4]} off-palette (${named.join(', ')})`];
      },
      measured: `${sub.boughtBare} bare .bought, ${sub.lockedBare} bare .locked of ${N}; ${sub.offPalette.length} off-palette (${sub.offPalette.join(', ')})`,
    },
    {
      // U5 — the figure the Back memory rests on: the list finds the control by CLASS and never by game.
      name: 'the back control, by class and by what it calls (U5)',
      doc: 'docs/mobile.md',
      re: /\*\*every one of the (\d+) games draws its back control with the class `back` or `other-back` \((\d+)\), and (\d+) of them route it through `goBack`\*\*/,
      expect: (m) => {
        const ok = num(m[1]) === N && num(m[2]) === sub.backClass && num(m[3]) === sub.backGoBack;
        return [ok, `doc: ${m[2]} of ${m[1]} draw it by class, ${m[3]} route it through goBack`];
      },
      measured: `${sub.backClass} of ${N} draw it by class, ${sub.backGoBack} route it through goBack`,
    },
    {
      // U6 — the figure the arming toggle's click path rests on. If a game ever stops declaring `toggleAuto` at
      // top level, or starts putting it in its Vue `data`, the wrapper silently stops being reached on that game
      // and its ON/OFF button goes back to being stuck — with nothing driving it to say so.
      name: 'toggleAuto — the arming toggle\'s click path (U6)',
      doc: 'docs/automation.md',
      re: /\*\*of the (\d+) games, (\d+) declare `function toggleAuto` at top level, (\d+) write the field through `Vue\.set` and (\d+) assign plainly, and (\d+) put `toggleAuto` in the Vue instance's `data`\.\*\*/,
      expect: (m) => {
        const ok = num(m[1]) === N && num(m[2]) === load.toggleAutoDecl && num(m[3]) === load.toggleAutoVueSet
          && num(m[4]) === load.toggleAutoPlain && num(m[5]) === load.toggleAutoInData;
        return [ok, `doc: ${m[2]} declare it of ${m[1]}, ${m[3]} Vue.set, ${m[4]} plain, ${m[5]} in Vue data`];
      },
      // ⚠ `load`, not `sub`: the question is which copy the CLICK reaches, and two games ship disagreeing copies
      measured: `${load.toggleAutoDecl} declare it of ${N}, ${load.toggleAutoVueSet} Vue.set, ${load.toggleAutoPlain} plain, ${load.toggleAutoInData} in Vue data (scope: loaded, last declaration wins)`,
    },
    {
      // V2. `column` is the LOAD-BEARING PREMISE of the editors: both engines render a `tabFormat` entry by NAME
      // through it (`v-bind:is="item[0]"`), which is the only reason a component the LOADER registers can appear in
      // the au tab at all. The day a game stops registering it, the editors have nothing to draw them and nothing
      // static would say so. ⚠ A REGISTRATION count, like `tab-buttons`; `gates-v2 --part 6` drives the result.
      name: 'column — the component the loader\'s OWN editors are rendered by (V2)',
      doc: 'docs/automation.md',
      re: /\*\*all (\d+) of the (\d+)\s+games register `Vue\.component\("column"\)`\*\*/,
      expect: (m) => {
        const ok = num(m[1]) === sub.colComponent && num(m[2]) === N;
        return [ok, `doc: ${m[1]} of ${m[2]} register column`];
      },
      measured: `${sub.colComponent} of ${N} register column${sub.noColComponent.length ? ' — MISSING: ' + sub.noColComponent.join(', ') : ''}`,
    },
    {
      // V2. The three inputs the loader deliberately does NOT depend on. ⛔ THE FIGURE THAT DECIDED THE DESIGN: it
      // is not only that some games lack all three, it is that `ptr` — one of the two reference games this whole
      // arc is measured on — is one of them. A clickable-only "baseline" plus an "enhanced" family was the first
      // plan; supplying the loader's own components is ONE family on all 171.
      name: 'text-input / slider / drop-down — the engine inputs the loader does NOT use (V2)',
      doc: 'docs/automation.md',
      re: /only (\d+) \/ (\d+) \/ (\d+) of the (\d+) games\s+register them[\s\S]{0,160}?\*\*(\d+) register none of the three, `ptr` among them\*\*/,
      expect: (m) => {
        const ok = num(m[1]) === sub.textInput && num(m[2]) === sub.sliderComponent && num(m[3]) === sub.dropDown
          && num(m[4]) === N && num(m[5]) === sub.noEngineInput.length && sub.noEngineInput.includes('ptr');
        return [ok, `doc: ${m[1]} / ${m[2]} / ${m[3]} of ${m[4]}, ${m[5]} with none of the three`];
      },
      measured: `${sub.textInput} text-input, ${sub.sliderComponent} slider, ${sub.dropDown} drop-down of ${N}; ${sub.noEngineInput.length} register NONE of the three (ptr among them: ${sub.noEngineInput.includes('ptr')})`,
    },
    {
      // V1 (T2). Giving the `au` tab subtabs makes the loader depend, on EVERY game, on a component it had never
      // asked for: the engine draws the subtab bar with `tab-buttons`. ⚠ THIS IS A REGISTRATION COUNT AND NOT A
      // RENDERING RESULT — a game could register the component and still fail to draw the tab, which is what
      // `gates-v1 --part 6` drives over the roster. What this claim protects is the PREMISE: the day a game stops
      // registering it, the Advanced subtab has no bar to select it with, and nothing static would say so.
      name: 'tab-buttons — the component the au tab\'s subtabs are drawn with (V1)',
      doc: 'docs/automation.md',
      re: /\*\*all (\d+) of the (\d+) games register `Vue\.component\("tab-buttons"\)`\*\*/,
      expect: (m) => {
        const ok = num(m[1]) === sub.tabButtons && num(m[2]) === N;
        return [ok, `doc: ${m[1]} of ${m[2]} register tab-buttons`];
      },
      measured: `${sub.tabButtons} of ${N} register tab-buttons${sub.noTabButtons.length ? ' — MISSING: ' + sub.noTabButtons.join(', ') : ''}`,
    },
    {
      name: 'pseudoUnl — the global, and the game that has only the component',
      doc: 'docs/mobile.md',
      re: /(Four|Five|Six|Three|Two|One) games define the global \(([^)]*)\); a (second|third|fourth|fifth|sixth|seventh), `([a-z0-9-]+)`, declares `pseudoUnl` on components but has no such global/,
      expect: (m) => {
        const words = { One: 1, Two: 2, Three: 3, Four: 4, Five: 5, Six: 6 };
        const nth = { second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7 };
        const named = ids(m[2]);
        const ok = words[m[1]] === sub.pseudoUnlGlobal.length && setEq(named, sub.pseudoUnlGlobal) && nth[m[3]] === words[m[1]] + 1
          && sub.pseudoUnlComponentOnly.length === 1 && sub.pseudoUnlComponentOnly[0] === m[4];
        return [ok, `doc: ${m[1]} (${named.join(', ')}), component-only ${m[4]}`];
      },
      measured: `${sub.pseudoUnlGlobal.length} (${sub.pseudoUnlGlobal.join(', ')}), component-only ${sub.pseudoUnlComponentOnly.join(', ') || '—'}`,
    },
    {
      // U7: the prestige string's own breaks. The layer list splits on the FIRST run of `<br>`s and lets the rest
      // collapse to spaces, and THIS is the figure that says the rule is right — a per-layer override with eight
      // breaks is reachable in no recorded snapshot, so nothing that drives games can certify it.
      name: 'per-layer prestigeButtonText overrides and their break counts (loaded)',
      doc: 'docs/mobile.md',
      re: /\*\*(\d+) of the (\d+) games\s+declare (\d+) such per-layer overrides, whose break counts are ((?:\d+ \u00d7\d+(?:, | and )?)+)\*\*/,
      expect: (m) => {
        const want = Object.fromEntries([...m[4].matchAll(/(\d+) \u00d7(\d+)/g)].map((x) => [x[1], num(x[2])]));
        const got = load.prestigeLayerBr;
        const same = Object.keys({ ...want, ...got }).every((k) => want[k] === got[k]);
        return [num(m[1]) === load.prestigeLayerGames && num(m[2]) === N && num(m[3]) === load.prestigeLayerOverrides && same,
          `doc: ${m[1]} of ${m[2]} games, ${m[3]} overrides, ${JSON.stringify(want)}`];
      },
      measured: `${load.prestigeLayerGames} of ${N} games, ${load.prestigeLayerOverrides} overrides, ${JSON.stringify(load.prestigeLayerBr)}`,
    },
    {
      name: 'the global prestigeButtonText: shape and break count (loaded)',
      doc: 'docs/mobile.md',
      // ⚠ Since 2026-09-22 one global is OFF the family's shape (`the-collab-tree-lun4-r` answers the layer's own
      // override FIRST, through `tmp[layer]`, instead of in the `else` branch), so the sentence names the off-shape
      // games and the gate compares that SET — a count alone would pass on the wrong game.
      re: /(\d+) of the (\d+) globals keep the family's three-branch shape; the others, ((?:`[a-z0-9-]+`(?:, | and )?)+), [^.]*\. (\d+) globals have four breaks and `([a-z0-9-]+)` six\./,
      expect: (m) => {
        const off = ids(m[3]);
        const ok = num(m[2]) === load.prestigeGlobal && num(m[2]) === N && num(m[1]) === N - load.prestigeOffShape.length
          && setEq(off, load.prestigeOffShape)
          && load.prestigeGlobalBr[4] === num(m[4]) && load.prestigeGlobalBr[6] === 1
          && load.prestigeGlobalBrOdd.length === 1 && load.prestigeGlobalBrOdd[0] === m[5];
        return [ok, `doc: ${m[1]} of ${m[2]} globals on the shape (off: ${off.join(', ')}), ${m[4]} with four breaks, ${m[5]} with six`];
      },
      measured: `${load.prestigeGlobal} globals (${load.prestigeOffShape.length} off-shape), break counts ${JSON.stringify(load.prestigeGlobalBr)}, not four: ${load.prestigeGlobalBrOdd.join(', ') || '\u2014'}`,
    },
    {
      // U7: how big the other-resources question is. ⚠ The brief this slice was written from quoted 450 / 1,713 /
      // 91 against the same 2,260 blocks; the block count agreed and the rest did not, which is why the sentence
      // states the method and this claim pins it.
      name: 'startData blocks carrying a layer-own Decimal (subtree)',
      doc: 'docs/mobile.md',
      re: /\*\*([\d,]+) of the ([\d,]+)\s+startData blocks carrying at least one extra Decimal key \u2014 ([\d,]+) \(layer, key\) pairs across (\d+) of the (\d+) games\*\*/,
      expect: (m) => {
        const ok = num(m[1]) === sub.startWithExtra && num(m[2]) === sub.startBlocks && num(m[3]) === sub.startPairs
          && num(m[4]) === sub.startGames && num(m[5]) === N;
        return [ok, `doc: ${m[1]} of ${m[2]} blocks, ${m[3]} pairs, ${m[4]} of ${m[5]} games`];
      },
      measured: `${sub.startWithExtra} of ${sub.startBlocks} blocks, ${sub.startPairs} pairs, ${sub.startGames} of ${N} games`,
    },
  ];
}

/**
 * Measure, then judge each claim against the doc that states it.
 * `readDoc` is injectable so `loader/census.test.mjs` can feed a doctored document and prove the comparison is not
 * vacuous — a check that has never been shown failing has not been shown to check anything.
 */
export function check({ bound = 'subtree', root = REPO, readDoc = (f) => fs.readFileSync(path.join(root, f), 'utf8'), figures = null } = {}) {
  // ⚠ Every anchor below is matched against the doc with its whitespace COLLAPSED. A sentence that reflows across a
  // line when someone rewraps a paragraph is the same sentence, and an anchor that a rewrap can break would fail
  // for a reason that has nothing to do with the figure it certifies — which is how a real check gets deleted.
  const flat = (f) => readDoc(f).replace(/\s+/g, ' ');
  // `figures` lets a caller that already measured (the unit test, which judges several doctored documents against
  // one reading of the tree) skip the ~1 s of file reading. Nothing else about the judgement changes.
  const sub = (figures && figures.sub) || measure({ bound, root });
  // the loaded-file figures are a second scope, not a second bound: `--bound js` is about the SUBTREE census.
  const load = (figures && figures.load) || (bound === 'js' ? sub : measure({ bound: 'loaded', root }));
  const rows = [];
  for (const c of claims(sub, load)) {
    let text;
    try { text = flat(c.doc); } catch (e) { rows.push({ ...c, ok: false, why: `${c.doc} could not be read: ${e.message}` }); continue; }
    if (c.all) {
      const ms = [...text.matchAll(c.re)];
      if (!ms.length) { rows.push({ ...c, ok: false, why: `no "N of the M games" figure is left in ${c.doc} — the anchor this claim is checked through is gone` }); continue; }
      const [ok, doc] = c.expect(ms);
      rows.push({ ...c, ok, doc: `${ms.length} denominator(s)`, why: ok ? null : doc });
      continue;
    }
    const m = c.re.exec(text);
    if (!m) { rows.push({ ...c, ok: false, why: `${c.doc} no longer states this claim in the form the gate reads (${c.re}) — a reworded sentence does not get to disarm the check that certifies its numbers` }); continue; }
    const [ok, doc] = c.expect(m);
    rows.push({ ...c, ok, doc, why: ok ? null : `doc says ${doc}; measured ${c.measured}` });
  }
  return { bound, sub, load, rows, ok: sub.problems.length === 0 && rows.every((r) => r.ok) };
}

function main() {
  const a = parseArgs(process.argv.slice(2), []);
  const bound = a.bound || 'subtree';
  if (!BOUNDS.includes(bound)) { console.error(`--bound must be one of ${BOUNDS.join(', ')}`); process.exit(2); }
  const r = check({ bound });
  console.log(`census-figures: ${r.sub.roster} game(s) from manifests/index.json, ${r.sub.files} source file(s) under bound \`${bound}\`` +
    (bound === 'subtree' ? ` (+ ${r.load.files} under \`loaded\`)` : ''));
  if (bound === 'js') console.log('  ⛔ --bound js is the HISTORICAL BUG, kept so this gate can be shown failing. It is never a verdict.');
  for (const p of r.sub.problems) console.log(`  ✘ SOURCES NOT FOUND — ${p}`);
  for (const row of r.rows) console.log(`  ${row.ok ? 'OK  ' : 'DRIFT'} ${row.name} — measured ${row.measured}${row.ok ? '' : `\n        ${row.why}`}`);
  if (a.json) writeJSON(a.json, { bound, roster: r.sub.roster, ok: r.ok, problems: r.sub.problems, figures: { subtree: { ...r.sub, per: undefined }, loaded: { ...r.load, per: undefined } }, rows: r.rows.map(({ re, expect, ...x }) => x) });
  if (r.sub.problems.length) {
    console.log('');
    console.log('REFUSED — a game whose sources were not found is not a game that counts zero. Every figure above was');
    console.log('computed over a roster this run could not fully read, so none of them is a measurement.');
    process.exit(1);
  }
  if (!r.ok) {
    console.log('');
    console.log('DRIFT — the docs quote a figure this tree does not produce. Re-measure and fix the prose (or the');
    console.log('code): a number nobody regenerates is a number nobody checks, which is how three of them shipped wrong.');
    process.exit(1);
  }
  console.log(`  all ${r.rows.length} documented figure(s) match the tree`);
  process.exit(0);
}
if (import.meta.url === `file://${process.argv[1]}`) main();
