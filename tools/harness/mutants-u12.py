# The U12 mutations (tools/harness/mutants-u12.sh applies ONE per round, by name). Each asserts the text it replaces
# is there, so a mutation that no longer applies FAILS instead of silently running the control again.
import sys
LL = 'loader/layerlist.js'

# U11's sampler, as it shipped (`glowOnReset` / `resetMark`), for the two mutants that put it back. ⚠ U11 named its
# reading `now`, which U12's `now()` would shadow — `cur` here, and nothing else changed.
SAMPLER = '''
  function resetMarkU11(l) {
    return safe(function () {
      var t = player[l].resetTime;
      if (typeof t === 'number') return { t: t };
      var p = player[l].points;
      return p && typeof p.eq === 'function' ? { z: !!p.eq(0) } : null;
    }, null);
  }
  function glowOnResetU11(rec) {
    var cur = resetMarkU11(rec.layer), was = rec.resetMarkU11;
    rec.resetMarkU11 = cur;
    if (!cur || !was) return false;
    var fired = cur.t !== undefined ? (was.t !== undefined && cur.t < was.t) : (was.z === false && cur.z === true);
    if (fired && SKIP_PRESSED) return false;
    if (fired) glow(rec);
    return fired;
  }
'''
CALL_AT = "      if (fitChipCounts(rec)) refit.push(l);\n"

def sub(s, old, new):
    assert old in s, old
    return s.replace(old, new, 1)

def sampler_back(s, skip_pressed):
    s = sub(s, "  function glow(rec) {", SAMPLER.replace('SKIP_PRESSED', skip_pressed) + "  function glow(rec) {")
    return sub(s, CALL_AT, CALL_AT + "      glowOnResetU11(rec);\n")

def m1(s):   # the doReset hook REMOVED, U11's sampler back — the build the user found dead on ptr
    s = sub(s, "if (typeof window.doReset === 'function' && !window.doReset[HOOK_MARK])", "if (false)")
    s = sub(s, "if (typeof window.rowReset === 'function' && !window.rowReset[HOOK_MARK])", "if (false)")
    return sampler_back(s, 'false')

def m2(s):   # the WIPED-layer glow reinstated: the hook for the pressed layer AND the sampler for every other one
    return sampler_back(s, '(glowAt[rec.layer] !== undefined && now() - glowAt[rec.layer] < 1100)')

def m3(s):   # the restart limit widened to 10 s — it must never SUPPRESS a reset that comes after the glow ran out
    return sub(s, "var GLOW_MS = 1000;", "var GLOW_MS = 10000;")

def m4(s):   # reduced motion's JS guard removed, the CSS rule kept — visually still dark, structurally ON
    return sub(s, "try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }", "return false;")

def m5(s):   # a CALL is taken for a reset: the rowReset "proceeded" mark ignored, so a press that bought nothing glows
    return sub(s, "if (call && call.proceeded) onReset(call.layer);", "if (call) onReset(call.layer);")

def m6(s):   # the wrapper NOT transparent: it drops the second argument (`force`)
    return sub(s, "try { r = orig.apply(this, arguments); done = true; }", "try { r = orig.call(this, layer); done = true; }")

name = sys.argv[1]
f = {'m1': m1, 'm2': m2, 'm3': m3, 'm4': m4, 'm5': m5, 'm6': m6}[name.split('-')[0]]
s = open(LL).read()
open(LL, 'w').write(f(s))
