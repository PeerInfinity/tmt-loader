// The planner-script `gates-c1c.mjs --part 1` runs in each game's global scope (boot.mjs --planner-script): the C1c
// CAPABILITY MATRIX — what the planner's number helper resolved to on this game, whether that type has every method
// each planner operation calls (`tmtLoader.planner.numbers()`), and a small numeric BATTERY over exactly the
// operations the planner performs, so a library that HAS a method but rounds differently shows up as a different
// answer, not as a pass. No library is named: the type is the one `player.points` is an instance of. Returns JSON.
var P = tmtLoader.planner, C = player.points && player.points.constructor, N = function (x) { return new C(x); };
var s = function (x) { try { return String(x); } catch (e) { return 'threw: ' + (e && e.message || e); } };
var run = function (f) { try { return s(f()); } catch (e) { return 'threw: ' + String(e && e.message || e).slice(0, 80); } };
var globals = {};
// which GLOBAL names alias the type — recorded (evidence for the-classic-tree's minified constructor), never used
['Decimal', 'ExpantaNum', 'OmegaNum'].forEach(function (n) {
  var g; try { g = (0, eval)('typeof ' + n + ' !== "undefined" ? ' + n + ' : undefined'); } catch (e) { g = undefined; }
  globals[n] = g === undefined ? 'absent' : g === C ? 'is the type' : g && g.prototype === C.prototype ? 'same prototype' : 'another type';
});
var battery = {
  'gt': run(function () { return N(1e300).gt(N(9.99e299)); }),
  'lte(0)': run(function () { return N(0).lte(0); }),
  'cmp': run(function () { return N(2).cmp(N(3)); }),
  'sub': run(function () { return N('1e20').sub(N('1e19')); }),
  'sub big': run(function () { return N('1e400').sub(N('9e399')); }),
  'abs': run(function () { return N(-7.5).abs(); }),
  'times 1e-9': run(function () { return N(12345).times(1e-9); }),
  'plus': run(function () { return N(0.1).plus(N(0.2)); }),
  'div': run(function () { return N(1e10).div(N(3)); }),
  'max': run(function () { return N(-2).max(0); }),
  'log10': run(function () { return Number(N(1000).log10()); }),
  'log10 big': run(function () { return Number(N('1e400').log10()); }),
  'log10(0)': run(function () { return Number(N(0).log10()); }),
  'pow 1e6': run(function () { return N(10).pow(1e6); }),
  'pow 0.5': run(function () { return N(10).pow(0.5); }),
  'pow 308.5': run(function () { return N(10).pow(308.5); }),
  'Number(8.000000001)': run(function () { return Number(N(8.000000001)); }),
  'String(1e400)': run(function () { return N('1e400'); }),
  'String(0.3)': run(function () { return N(0.3); }),
};
return { type: C ? (C.name || '(anonymous)') : null, numbers: P.numbers(), globals: globals, battery: battery };
