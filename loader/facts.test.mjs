// facts-1 — the pure parts of the fact probes (loader/tmt-planner.js, `planner.facts`; docs/facts.md).
//
// The EXPONENT probe's fitter is the instrument every price and production fact rests on, so its classes are pinned
// here on readings built from known formulas (each test names the mutant it is against, `mutants-facts1.sh`), and the
// probe's own discipline — the perturbed field comes back as the SAME object — on the stub engine.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { bootStub, Decimal } from './stub-engine.mjs';

const J = (x) => JSON.parse(JSON.stringify(x));
const REPO = path.resolve(new URL('..', import.meta.url).pathname);
const PLANNER = fs.readFileSync(path.join(REPO, 'loader/tmt-planner.js'), 'utf8');

function planner() {
  const ctx = bootStub({
    a: { name: 'alpha', row: 0, type: 'normal', layerShown: () => true, startData: () => ({ unlocked: true, points: new Decimal(0) }),
      tmtStubTemp(tmp) { const t = tmp.a || (tmp.a = {}); t.type = 'normal'; t.baseAmount = new Decimal(0); t.requires = new Decimal(1e9); t.nextAt = new Decimal(1e9); t.canReset = false; t.resetGain = new Decimal(0); } },
  });
  vm.runInContext(PLANNER, ctx, { filename: 'loader/tmt-planner.js' });
  return ctx.tmtLoader.planner;
}
const P = planner();
const F = P.facts;
const pts = (fn) => F.GRID.map((v) => { const y = fn(v); return { v, L: y > 0 && isFinite(y) ? Math.log10(y) : y === 0 ? -Infinity : null }; });

// MUTANT A "the exponent probe returns a constant": every class below would read the same shape.
test('power with an offset: 5e19·(t+1)^5.4 (ptr q23) → exponent 5.4, offset 1, coef 5e19', () => {
  assert.deepEqual(J(F.fitShape(pts((t) => 5e19 * Math.pow(t + 1, 5.4)))), { type: 'power', exponent: 5.4, offset: 1, coef: '5e19' });
});
test('a pure power (no offset): y = 3·t^2 reads offset 0 (y(0) = 0)', () => {
  assert.deepEqual(J(F.fitShape(pts((t) => 3 * t * t)).offset), 0);
  assert.equal(F.fitShape(pts((t) => 3 * t * t)).exponent, 2);
});
test('exponential: 10·2^t → log10Base log10(2)', () => {
  const s = F.fitShape(F.GRID.filter((v) => v <= 100).map((v) => ({ v, L: 1 + v * Math.log10(2) })));
  assert.equal(s.type, 'exponential');
  assert.equal(s.log10Base, Number(Math.log10(2).toPrecision(6)));
});
test('superexponential: 1e50^(c^2.5)·1e5325 (ptr H31\'s goal shape) → exponent 2.5', () => {
  const s = F.fitShape(F.GRID.map((v) => ({ v, L: 50 * Math.pow(v, 2.5) + 5325 })));
  assert.equal(s.type, 'superexponential');
  assert.equal(s.exponent, 2.5);
});
test('a piecewise price (a scaling kicks in at 25) is irregular, never forced into a class', () => {
  const s = F.fitShape(pts((x) => Math.pow((x >= 25 ? x * x / 25 : x) + 1, 1.2) * 10));
  assert.equal(s.type, 'irregular');
  assert.ok(Array.isArray(s.slopes) && s.slopes.length > 0);
});
test('flat (reads the field, does not move with it) and unscored (too few readings) abstain by NAME', () => {
  assert.deepEqual(J(F.fitShape(pts(() => 7))), { type: 'flat' });
  const u = F.fitShape(F.GRID.map((v, i) => ({ v, L: i < 3 ? i : null })));
  assert.equal(u.type, 'unscored');
  assert.match(u.why, /only 3 finite positive reading/);
});
test('a FLOORED power is still a power, marked rounded', () => {
  const s = F.fitShape(pts((t) => Math.floor(10 * Math.pow(t + 1, 1.5))));
  assert.equal(s.type, 'power');
  assert.equal(s.rounded, true);
  assert.equal(s.exponent, 1.5);
});

// MUTANT D "a probe that leaks state": the perturbed field must come back as the SAME object.
test('shapeIn puts the field back — the same object — and measures through the getter', () => {
  const before = vmPlayer().a.points;
  const s = F.shapeIn('player.a.points', () => vmPlayer().a.points.times(vmPlayer().a.points));
  assert.equal(vmPlayer().a.points, before);
  assert.equal(s.type, 'power');
  assert.equal(s.exponent, 2);
});
function vmPlayer() { return P.get('player'); }

// (m31) MUTANT m31-A "the completions probe unbounded": a goal that softcaps past its completion limit must be fitted over
// the DOMAIN the engine allows (0 … completionLimit), and the shape says which domain it was read over. (PTR H31's
// 1e50^(c^2.5)·1e5325, softcapped from 20 under a limit of 10, scaled into the stub's plain numbers: softcap at 6,
// limit 5.)
test('shapeIn with a domain (max): a goal softcapped past its completion limit reads superexponential over 0…limit, irregular unbounded', () => {
  const goal = (c) => { let x = c; if (x >= 6) x = Math.pow(x - 5, 1.95) + 5; return new Decimal(Math.pow(10, 0.01 * Math.pow(x, 2.5) + 3)); };
  vmPlayer().a.points = new Decimal(0);
  const bounded = F.shapeIn('player.a.points', () => goal(vmPlayer().a.points.v), { max: 5, maxWhy: 'the challenge\'s completionLimit' });
  assert.equal(bounded.type, 'superexponential');
  assert.equal(bounded.exponent, 2.5);
  assert.equal(bounded.log10Scale, 0.01);
  assert.deepEqual(J(bounded.domain), { max: 5, why: 'the challenge\'s completionLimit' });
  assert.equal(F.shapeIn('player.a.points', () => goal(vmPlayer().a.points.v)).type, 'irregular');
});
