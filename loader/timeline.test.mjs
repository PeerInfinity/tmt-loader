// whole-1 — THE RUN TIMELINE (docs/automation.md, "The run timeline"), driven over the stub engine.
//
// The page legs (`tools/harness/gates-whole.mjs --part timeline`) drive it in the real game; these rows pin what they
// cannot construct cheaply: a stage switching on and off and the words for it, a stage that is already in force after a
// carried-over timeline (not recorded twice), the marks (and the "already past" ones), the bound, and that the timeline
// is NOT in `runtimeState()` (every snapshot and pinned record unchanged).
// ⚠ Every row names the mutant it is against.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bootStub, tick, Decimal } from './stub-engine.mjs';

const PROV = { gate: 'timeline-test', commit: 'abcdef0', note: 'a constructed stage' };
function game() {
  return {
    a: {
      name: 'alpha', row: 1, type: 'normal', layerShown: () => true,
      startData: () => ({ unlocked: true, points: new Decimal(0) }),
      tmtStubTemp(tmp, player) {
        const t = tmp.a || (tmp.a = {});
        t.type = 'normal'; t.baseAmount = new Decimal(player.points); t.requires = new Decimal(1); t.nextAt = new Decimal(1);
        t.canReset = true; t.autoPrestige = false; t.resetGain = new Decimal(1);
      },
    },
  };
}
const table = () => ({ policies: { 'reset:a': 'always' }, provenance: { 'reset:a': PROV },
  stages: [{ id: 's1', name: 'Hold alpha', note: 'n', when: 'flag', policies: { 'reset:a': 'gain>=5' }, provenance: PROV }] });
function boot() {
  const ctx = bootStub(game(), { autoTable: table() });
  ctx.flag = false;
  ctx.tmtLoader.profile('all');
  return ctx;
}
const T = (ctx) => ctx.tmtLoader;

test('a stage switching on and off is recorded, in the player\'s words (MUTANT: the stage kind dropped)', () => {
  const ctx = boot();
  tick(ctx, 2);
  ctx.flag = true; tick(ctx, 2);
  ctx.flag = false; tick(ctx, 2);
  const tl = T(ctx).timeline();
  const st = tl.events.filter((e) => e.kind === 'stage');
  assert.equal(st.length, 2);
  assert.equal(st[1].text, 'The stage “Hold alpha” switched on');
  assert.equal(st[0].text, 'The stage “Hold alpha” switched off');
  assert.equal(tl.counts.stage, 2);
});

test('carried over (the reload memory): a stage already in force is not recorded again; the marks go on (MUTANT: not restored)', () => {
  const ctx = boot();
  ctx.tmtLoader.ladder = { marks: [{ id: 'X1', name: 'first', predicate: 'flag' }, { id: 'X2', name: '**second**', predicate: 'flag2 === true' }] };
  ctx.flag = true; tick(ctx, 2);
  const mem = T(ctx).timeline.memory();
  assert.ok(mem && mem.events.length >= 2);
  // a NEW page on the same save: the timeline restored, the stage's first evaluation finds it in force
  const ctx2 = boot();
  ctx2.flag = true;
  ctx2.tmtLoader.ladder = ctx.tmtLoader.ladder;
  assert.equal(T(ctx2).timeline.restore(mem), true);
  tick(ctx2, 2);
  ctx2.flag2 = true; tick(ctx2, 1);
  const tl = T(ctx2).timeline();
  assert.equal(tl.events.filter((e) => e.kind === 'stage').length, 1, 'the stage in force was recorded once, before the reload');
  assert.deepEqual(Object.keys(tl.marks).sort(), ['X1', 'X2']);
  assert.equal(tl.events[0].text, 'Reached “second”', 'a mark name loses its emphasis marks');
});

test('a mark already held when the marks are first read, late in a game, says so — never an invented time', () => {
  const ctx = boot();
  ctx.flag = true;
  ctx.player.timePlayed = 500;
  ctx.tmtLoader.ladder = { marks: [{ id: 'X1', name: 'first', predicate: 'flag' }] };
  tick(ctx, 1);
  const e = T(ctx).timeline().events.find((x) => x.kind === 'mark');
  assert.equal(e.late, true);
  assert.match(e.text, /^Already past “first”/);
});

test('bounded: the newest cap kept, the rest counted (MUTANT: unbounded)', () => {
  const ctx = boot();
  const cap = T(ctx).timeline().cap;
  for (let i = 0; i < cap + 7; i++) T(ctx).timeline.note('ff', { why: 'reached', label: '1 s of game time', gs: 0.05, ticks: 1, mode: 'faithful', step: 0.05, startGs: i });
  const tl = T(ctx).timeline();
  assert.equal(tl.events.length, cap);
  assert.equal(tl.dropped, 7);
  assert.equal(tl.total, cap + 7);
  assert.equal(tl.events[0].at, cap + 6, 'newest first');
});

test('NOT in runtimeState(): every snapshot and pinned record is what it was', () => {
  const ctx = boot();
  ctx.flag = true; tick(ctx, 3);
  assert.ok(T(ctx).timeline().events.length > 0);
  const rt = T(ctx).runtimeState();
  assert.equal(JSON.stringify(rt).includes('timeline'), false);
  assert.equal(JSON.stringify(rt).includes('Hold alpha'), false);
});

// ---- (climb-1) the polish: the "already past" fold, a fast-forward's condition in words, strict game-time order ----
test('TL6: the marks already past when first read fold into ONE row, its marks listed under it (MUTANT: the fold removed)', () => {
  const ctx = boot();
  ctx.flag = true; ctx.flag2 = true;
  ctx.player.timePlayed = 500;
  ctx.tmtLoader.ladder = { marks: [{ id: 'X1', name: 'first', predicate: 'flag' }, { id: 'X2', name: 'second', predicate: 'flag2 === true' }, { id: 'X3', name: 'third', predicate: 'flag' }] };
  tick(ctx, 1);
  const tl = T(ctx).timeline();
  assert.equal(tl.events.filter((e) => e.kind === 'mark' && e.late).length, 3, 'the events stay whole');
  const late = tl.rows.filter((r) => r.kind === 'late');
  assert.equal(late.length, 1);
  assert.equal(late[0].text, 'Already past 3 marks when the marks were first read');
  assert.equal(late[0].marks.map((m) => m.name).join('|'), 'first|second|third');
  assert.equal(tl.rows.filter((r) => r.kind === 'mark').length, 0);
});

test('TL7: a fast-forward never prints a raw condition — words where every clause reads, else "a condition" (MUTANT: the raw label)', () => {
  const ctx = boot();
  const note = (o) => T(ctx).timeline.note('ff', Object.assign({ why: 'reached', gs: 10, ticks: 200, mode: 'faithful', step: 0.05, startGs: 1 }, o));
  note({ label: 'the condition player.a.points.gte(1e10) && Math.random() < 2', target: 'until', src: 'player.a.points.gte(1e10) && Math.random() < 2' });
  note({ label: 'the condition player.a.unlocked', target: 'until', src: 'player.a.unlocked', startGs: 2 });
  note({ label: 'the condition player.points.gte(5)', startGs: 3 });   // recorded before climb-1: only the label
  note({ label: 'the mark X9 (**ninth**)', target: 'mark', src: 'flag', name: 'ninth', startGs: 4, why: 'cap' });
  const ev = T(ctx).timeline().events;
  for (const e of ev) assert.ok(!/player\.|Math\.|\.gte\(/.test(e.text), `no code in "${e.text}"`);
  assert.equal(ev[3].text, 'Fast-forwarded 10s of game time (faithful ticks) and reached a condition');
  assert.equal(ev[3].code, 'player.a.points.gte(1e10) && Math.random() < 2', 'the code is kept for the developer details');
  assert.equal(ev[2].text, 'Fast-forwarded 10s of game time (faithful ticks) and reached the point where alpha is unlocked');
  assert.equal(ev[1].text, 'Fast-forwarded 10s of game time (faithful ticks) and reached a condition');
  assert.equal(ev[1].code, 'player.points.gte(5)');
  assert.equal(ev[0].text, 'Fast-forwarded 10s of game time (faithful ticks) and stopped at the limit before reaching “ninth”');
  assert.ok(!ev[0].code, 'a mark has no code line');
});

test('TL8: newest first strictly by game time; events at the same game time keep their recorded order (MUTANT: recorded order)', () => {
  const ctx = boot();
  ctx.player.timePlayed = 100;
  ctx.flag = true; tick(ctx, 1);   // the stage switches on at ~100
  // a fast-forward that STARTED at 50 is recorded after it
  T(ctx).timeline.note('ff', { why: 'reached', label: '1m 00s of game time', target: 'gs', gs: 60, ticks: 1200, mode: 'faithful', step: 0.05, startGs: 50 });
  // two at the same game time, recorded in this order
  T(ctx).timeline.note('ff', { why: 'reached', label: 'A', target: 'gs', gs: 1, ticks: 20, mode: 'faithful', step: 0.05, startGs: 20 });
  T(ctx).timeline.note('ff', { why: 'stopped', label: 'B', target: 'gs', gs: 2, ticks: 40, mode: 'faithful', step: 0.05, startGs: 20 });
  const ev = T(ctx).timeline().events;
  const at = ev.map((e) => e.at);
  for (let i = 1; i < at.length; i++) assert.ok(at[i - 1] >= at[i], `ordered by game time: ${at.join(', ')}`);
  assert.equal(ev[0].kind, 'stage');
  assert.equal(ev[1].at, 50);
  assert.equal(ev[2].why, 'reached', 'the tie keeps its recorded order');
  assert.equal(ev[3].why, 'stopped');
});
