// log-1 — the STATE LOG (`loader/tmt-log.js`, docs/log.md), driven over the stub engine.
//
// What these hold (each names the mutant it is against — `tools/harness/mutants-log1.sh`):
//   · the page's SHA-256 is Node's, byte for byte (the page's `hash` is `hashGame`);
//   · the hook list is DATA with a shape: families resolve, `extends` chains end, members are unique;
//   · with the log OFF the automation core's link slot is empty and the recorder is not loaded at all;
//   · the recorder is TRANSPARENT (this, arguments, return value, a throw), records the OUTERMOST call only, and
//     attributes every record: `auto` with its feature, slot and reason code, `game` inside gameLoop, `player` else;
//   · `did` is "the game state changed"; a refused `game` call is counted, not written;
//   · the `toggles` kind's field write is logged by the automation itself;
//   · a recorded run REPLAYS to equal hashes, and a log with a call removed does not;
//   · the page's memory cap drops the oldest records, never a checkpoint, and says where with a `gap` line.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import crypto from 'node:crypto';
import { bootStub, tick, Decimal } from './stub-engine.mjs';

const REPO = path.resolve(new URL('..', import.meta.url).pathname);
const LOG_SRC = fs.readFileSync(path.join(REPO, 'loader/tmt-log.js'), 'utf8');
const HOOKS = JSON.parse(fs.readFileSync(path.join(REPO, 'loader/log-hooks.json'), 'utf8'));

// ---- a small game: one layer with two upgrades, a buyable, a milestone that grants a toggle ------------------------
function game(o = {}) {
  return {
    p: {
      name: 'prestige', row: 0, type: 'normal', layerShown: () => true,
      startData: () => ({ unlocked: true, points: new Decimal(0), auto: false, milestones: o.milestone ? [0] : [] }),
      upgrades: { 11: {}, 12: {} },
      buyables: { 11: {} },
      milestones: { 0: { toggles: [['p', 'auto']] } },
      // the GAME's own action inside gameLoop: a reset while points are below 6 (so `game` records exist). Read off
      // the context at call time (`this.ctx.doReset`), so the recorder's wrapper is what runs.
      automate() { if (o.gameReset && Number(this.ctx.player.p.points) < 6) this.ctx.doReset('p'); },
      tmtStubTemp(tmp, player) {
        const t = tmp.p || (tmp.p = {});
        t.type = 'normal'; t.canReset = true; t.resetGain = new Decimal(1); t.autoPrestige = false;
        t.baseAmount = new Decimal(1); t.requires = new Decimal(0); t.nextAt = new Decimal(0);
        t.upgrades = { 11: { unlocked: true, cost: new Decimal(2) }, 12: { unlocked: true, cost: new Decimal(50) } };
        t.buyables = { 11: { unlocked: true, cost: new Decimal(3) } };
      },
    },
  };
}
function boot(o = {}) {
  const g = game(o);
  const ctx = bootStub(g, { autoTable: o.table || {} });
  g.p.ctx = ctx;
  ctx.tmtLoader.logHooks = HOOKS;
  if (o.profile !== false) ctx.tmtLoader.profile(o.profile || 'all');
  return ctx;
}
const loadLog = (ctx) => vm.runInContext(LOG_SRC, ctx, { filename: 'loader/tmt-log.js' });
function record(ctx, opts = {}) {
  const lines = [];
  const sink = (line) => lines.push(line);
  ctx.tmtLoader.stateLog.start(Object.assign({ origin: 'harness', every: 10, diff: 1 }, opts), sink);
  return { lines, recs: () => lines.map((l) => JSON.parse(l)) };
}
const actions = (recs) => recs.filter((r) => r.type === 'action');

test('the page SHA-256 is Node\'s, byte for byte (hash = hashGame on both)', () => {
  const ctx = boot();
  loadLog(ctx);
  const js = ctx.tmtLoader.stateLog.sha256hex;
  const node = (s) => crypto.createHash('sha256').update(s).digest('hex');
  const inputs = ['', 'a', 'abc', 'x'.repeat(55), 'x'.repeat(56), 'x'.repeat(63), 'x'.repeat(64), 'x'.repeat(65), 'x'.repeat(1000),
    '{"points":"1.2e3456","é":"ü","emoji":"😀"}', JSON.stringify(ctx.player), '\u0000\u007f\u0080߿ࠀ￿'];
  for (const s of inputs) assert.equal(js(s), node(s), `sha256 of a ${s.length}-char string`);
});

test('the hook list is DATA with a shape: every family resolves, `extends` ends, members unique, the default exists', () => {
  assert.equal(HOOKS.format, 'tmt-log-hooks/1');
  const F = HOOKS.families;
  assert.ok(F[HOOKS.default], 'the default family exists');
  const seen = new Map();
  for (const [name, f] of Object.entries(F)) {
    assert.ok(Array.isArray(f.globals) && Array.isArray(f.layer), `${name}: globals and layer are lists`);
    if (f.extends) assert.ok(F[f.extends], `${name} extends a family that exists`);
    for (const m of f.members || []) { assert.ok(!seen.has(m), `${m} is in one family only (${seen.get(m)}, ${name})`); seen.set(m, name); }
    for (const p of f.layer) assert.match(p, /^[A-Za-z_$*][\w$*]*(\.[\w$*]+)*$/, `${name}: "${p}" is a dotted path`);
  }
  // every member is a game the loader lists
  const ids = new Set(JSON.parse(fs.readFileSync(path.join(REPO, 'manifests/index.json'), 'utf8')).map((g) => g.id));
  for (const m of seen.keys()) assert.ok(ids.has(m), `${m} is on the roster`);
  // ⚖ no game id, layer id or item id in the RECORDER's code — they live in the data
  const code = LOG_SRC.split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
  for (const m of seen.keys()) assert.ok(!code.includes(`'${m}'`) && !code.includes(`"${m}"`), `the recorder does not name ${m}`);
});

test('log OFF: the link slot is empty and the recorder is not loaded (inertness at the unit level)', () => {
  const ctx = boot();
  const L = ctx.tmtLoader.logLink;
  assert.deepEqual({ exec: L.exec, replay: L.replay, progress: L.progress, track: L.track }, { exec: null, replay: null, progress: null, track: false });
  assert.equal(ctx.tmtLoader.stateLog, undefined);
  tick(ctx, 20);
  assert.equal(ctx.tmtLoader.progress().armed, false, 'the tracker stays unarmed');
  assert.equal('progress' in ctx.tmtLoader.runtimeState(), false, 'so runtimeState() carries no tracker block');
});

test('every record is attributed: auto (feature, slot, reason code), game (inside gameLoop), player (else)', () => {
  const ctx = boot({ gameReset: true });
  loadLog(ctx);
  const R = record(ctx);
  tick(ctx, 30);
  ctx.buyUpgrade('p', 12);                                  // a player's press between ticks, refused (cost 50)
  ctx.tmtLoader.stateLog.stop();
  const recs = R.recs();
  assert.equal(recs[0].type, 'header'); assert.equal(recs[0].format, 'tmt-state-log/1');
  assert.equal(recs[1].type, 'checkpoint'); assert.equal(recs[1].why, 'start');
  const A = actions(recs);
  const auto = A.filter((r) => r.source === 'auto');
  assert.ok(auto.length >= 3, `the automation acted (${auto.length})`);
  for (const r of auto) {
    assert.ok(r.by && /^[a-z]+:p$/.test(r.by), `auto record names its feature (${r.by})`);
    assert.ok(Array.isArray(r.at) && r.at[0] === 'p' && /^(slot|fallback)$/.test(r.at[1]), 'and its slot');
    assert.ok(r.why && /^acted:/.test(r.why.code), `and the reason code its decision returned (${r.why && r.why.code})`);
    assert.equal(r.did, true, 'a refused automation call is counted, not written');
  }
  const rs = auto.find((r) => r.why.code === 'acted:reset');
  assert.ok(rs && rs.why.values && rs.why.values.layer === 'p' && typeof rs.why.values.gain === 'string', `a reset carries its decision's values, plain (${JSON.stringify(rs && rs.why)})`);
  assert.ok(A.some((r) => r.source === 'game' && r.call === 'doReset' && r.did === true), 'the game\'s own reset inside gameLoop is a `game` record');
  const pl = A.filter((r) => r.source === 'player');
  assert.equal(pl.length, 1); assert.equal(pl[0].call, 'buyUpgrade'); assert.deepEqual(pl[0].args, ['p', 12]); assert.equal(pl[0].did, false, 'a refused press is written, marked did:false');
  assert.equal(recs[recs.length - 1].type, 'checkpoint'); assert.equal(recs[recs.length - 1].why, 'stop');
  // every action carries the hash of the state after it — hashGame's input
  const last = A[A.length - 1];
  assert.match(last.hash, /^[0-9a-f]{16}$/);
});

test('TRANSPARENT: this, arguments, the return value and a throw pass untouched; only the OUTERMOST call is a record', () => {
  const ctx = boot({ profile: 'off' });
  const seen = [];
  ctx.respecBuyables = function (...a) { seen.push([this, a]); return 'ret-' + a.length; };
  const boom = new Error('the original threw');
  ctx.clickClickable = function () { throw boom; };
  vm.runInContext('buyUpg = function (l, id) { return buyUpgrade(l, id); }', ctx);   // calls another hooked global
  loadLog(ctx);
  const R = record(ctx);
  const self = { me: 1 };
  assert.equal(ctx.respecBuyables.call(self, 'p', undefined, 3), 'ret-3');
  assert.equal(seen[0][0], self); assert.deepEqual(seen[0][1], ['p', undefined, 3]);
  assert.throws(() => ctx.clickClickable('p', 11), (e) => e === boom);
  ctx.player.p.points = new Decimal(10);
  vm.runInContext('buyUpg("p", 11)', ctx);
  const A = actions(R.recs());
  assert.deepEqual(A.map((r) => r.call), ['respecBuyables', 'clickClickable', 'buyUpg'], 'buyUpg\'s own buyUpgrade is not a second record');
  assert.deepEqual(A[0].args, ['p', { $: 'u' }, 3], 'undefined arguments are carried, tagged');
  assert.equal(A[1].threw, true);
  assert.equal(A[2].did, true);
  assert.deepEqual(A[2].state, { 'p.p': '8', 'p.upg': '11' });
});

test('the toggles kind\'s field write is logged by the automation itself, as a `set`', () => {
  const ctx = boot({ milestone: true, table: {} });
  loadLog(ctx);
  const R = record(ctx);
  assert.equal(ctx.player.p.auto, false);
  tick(ctx, 2);
  assert.equal(ctx.player.p.auto, true, 'the toggles feature switched it on');
  const sets = actions(R.recs()).filter((r) => r.call === 'set');
  assert.equal(sets.length, 1);
  assert.deepEqual(sets[0].args, ['p', 'auto', true]);
  assert.equal(sets[0].by, 'toggles:p'); assert.equal(sets[0].why.code, 'acted:toggles');
});

test('a game call that changed nothing is COUNTED, not written', () => {
  const ctx = boot({ profile: 'off' });
  // the game's own buyer, every tick, never affordable
  ctx.layers.p.automate = function () { ctx.buyBuyable('p', 11); };
  loadLog(ctx);
  const R = record(ctx);
  tick(ctx, 5);
  const st = ctx.tmtLoader.stateLog.stop();
  assert.equal(actions(R.recs()).length, 0);
  assert.equal(st.refused.game, 5);
});

test('a recorded run REPLAYS to equal hashes; the same log with one automation call removed does not', () => {
  const run = () => { const ctx = boot({ gameReset: true, milestone: true }); loadLog(ctx); return ctx; };
  const a = run();
  const R = record(a);
  tick(a, 40);
  a.buyUpgrade('p', 12);
  tick(a, 10);
  a.tmtLoader.stateLog.stop();
  const lines = R.lines;
  const nAuto = actions(R.recs()).filter((r) => r.source === 'auto').length;
  assert.ok(nAuto >= 5, `the leg is not vacuous (${nAuto} automation records)`);
  const replay = (ls) => {
    const b = boot({ gameReset: true, milestone: true, profile: 'off' });
    loadLog(b);
    const rp = b.tmtLoader.stateLog.replayer(ls);
    rp.start({});
    return rp.run((d) => tick(b, 1, d), 1, 0);
  };
  const ok = replay(lines);
  assert.equal(ok.equal, true, JSON.stringify(ok.mismatch));
  assert.equal(ok.compared.action, actions(R.recs()).length);
  assert.equal(ok.unapplied, 0);
  // remove the FIRST automation purchase: the replay's state parts from the original's at the next record
  const i = lines.findIndex((l) => { const r = JSON.parse(l); return r.type === 'action' && r.source === 'auto' && r.call === 'buyUpgrade'; });
  assert.ok(i > 0);
  const bad = replay(lines.filter((_, j) => j !== i));
  assert.equal(bad.equal, false);
  assert.ok(bad.mismatch && Object.keys(bad.mismatch.stateDiff || {}).some((k) => /p\.(upg|p)$/.test(k)), JSON.stringify(bad.mismatch && bad.mismatch.stateDiff));
});

test('the page\'s memory cap drops the OLDEST records, never a checkpoint, and marks the hole with a `gap` line', () => {
  const ctx = boot({ gameReset: true });
  ctx.tmtLoader.options.logCap = '3000';
  ctx.tmtLoader.options.logEvery = '10';
  loadLog(ctx);
  ctx.tmtLoader.stateLog.setPage(true);
  tick(ctx, 60);
  const st = ctx.tmtLoader.stateLog.status();
  assert.ok(st.memory.dropped > 0, `records were dropped (${st.memory.dropped})`);
  assert.ok(st.memory.bytes <= 3000);
  const recs = ctx.tmtLoader.stateLog.text().trim().split('\n').map((l) => JSON.parse(l));
  assert.equal(recs[0].type, 'header');
  assert.equal(recs.filter((r) => r.type === 'checkpoint').length, st.records.checkpoint, 'every checkpoint is kept');
  const gaps = recs.filter((r) => r.type === 'gap');
  assert.ok(gaps.length >= 1);
  assert.equal(gaps.reduce((t, g) => t + g.dropped, 0), st.memory.dropped, 'the gap lines add up to what was dropped');
  assert.ok(recs.every((r) => r.type === 'header' || r.type === 'gap' || typeof r.wall === 'number'), 'a page record carries its wall-clock offset');
});
