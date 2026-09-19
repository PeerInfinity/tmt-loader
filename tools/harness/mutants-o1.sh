#!/usr/bin/env bash
# The O1 mutants (docs/options.md, "The gate"). Each one breaks exactly one of the four things U3's brief named,
# runs gate O1 on one game, and REQUIRES the leg that exists for it to go red — and, where the mutant is narrow,
# requires the other legs to stay green. A mutant that reddens a check it cannot reach is the tell for a
# contaminated run, not a pass.
#
# ⛔ It restores with `git checkout --`, so it REFUSES to start on a dirty tree: that restore would otherwise
# discard work nobody committed.
set -uo pipefail
cd "$(dirname "$0")/../.."
GAME="${GAME:-ptr}"
[ -z "$(git status --porcelain)" ] || { echo "REFUSED: the tree is dirty; this script restores with git checkout"; exit 2; }

run() {  # run <name> <expected-red-legs…>
  local name="$1"; shift
  local out; out="$(node tools/harness/page.mjs "$GAME" --gate options 2>&1 | grep -E "^O1 $GAME:" || true)"
  git checkout -- .
  local red=() ; local leg
  for leg in section inert same override press pressOverUrl; do
    grep -q -- "$leg=true" <<<"$out" || red+=("$leg")
  done
  local got="${red[*]:-}" want="$*"
  if [ "$got" = "$want" ]; then echo "OK   $name — red: [${got:-none}]"
  else echo "FAIL $name — red: [${got:-none}], expected [${want:-none}]"; echo "     $out"; fi
}

echo "control (no mutant):"
run "control" ""

echo "mutant A — the stored preference is ignored at boot:"
python3 - <<'PY'
import re;p='loader/flags.mjs';s=open(p).read()
s=s.replace("    if (prefs && typeof prefs[name] === 'boolean') return { on: prefs[name], source: 'stored' };","    if (false && prefs && typeof prefs[name] === 'boolean') return { on: prefs[name], source: 'stored' };")
open(p,'w').write(s)
PY
run "A the stored preference ignored" same press

echo "mutant B — the URL no longer overrides (truth instead of presence):"
python3 - <<'PY'
p='loader/flags.mjs';s=open(p).read()
s=s.replace("    if (params && params.has(name)) return { on: params.get(name) === '1', source: 'url' };","    if (params && params.get(name) === '1') return { on: true, source: 'url' };")
open(p,'w').write(s)
PY
run "B the URL no longer overrides" override

echo "mutant C — the preference is read but the stylesheet is not linked:"
python3 - <<'PY'
p='loader/page.js';s=open(p).read()
s=s.replace("  if (MOBILE) sheet('tmt-loader-mobile-css', 'loader/mobile.css');","  if (MOBILE && RESOLVED.source.mobile === 'url') sheet('tmt-loader-mobile-css', 'loader/mobile.css');")
open(p,'w').write(s)
PY
run "C the stylesheet is not linked" same press

echo "mutant D — inertness broken by defaulting the preference to on:"
python3 - <<'PY'
p='loader/flags.mjs';s=open(p).read()
s=s.replace("    return { on: false, source: 'default' };","    return { on: name === 'mobile', source: 'default' };")
open(p,'w').write(s)
PY
run "D inertness broken by a default" inert same override press pressOverUrl

echo "mutant E — the press writes the key and reloads, but leaves the parameter:"
python3 - <<'PY'
p='loader/options.js';s=open(p).read()
s=s.replace("    u.searchParams.delete(flag);","    /* mutant: the parameter stays */")
open(p,'w').write(s)
PY
run "E the press leaves the parameter" pressOverUrl
