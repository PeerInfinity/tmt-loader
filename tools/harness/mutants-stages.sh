#!/usr/bin/env bash
# The stages mutants — each breaks one promise of the slice (a stage carries its provenance; a `when` that throws is
# FALSE; the player's edit beats a stage; the shipped stage ORDER is the measured one; no game id in the loader) and
# REQUIRES the gate that can see it to go red (gates-stages.mjs). A–C are also red in loader/stages.test.mjs.
#
#   tools/harness/mutants-stages.sh <out-dir> [name-filter]
#
# ⛔ It restores from COPIES taken at the start (never `git checkout`), and it refuses a dirty tree anyway: a mutant
# round must never be able to take uncommitted work with it.
set -uo pipefail
cd "$(dirname "$0")/../.."
OUT="${1:?usage: mutants-stages.sh <out-dir> [name-filter]}"
ONLY="${2:-}"
mkdir -p "$OUT"
OUT="$(cd "$OUT" && pwd)"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then echo "REFUSING: the tree is dirty. Commit first."; exit 1; fi
FILES="loader/tmt-auto.js games-auto/ptr.json"
for f in $FILES; do cp "$f" "$OUT/$(basename "$f").orig"; done
restore() { for f in $FILES; do cp "$OUT/$(basename "$f").orig" "$f"; done; }
trap restore EXIT
KILLED=0; SURVIVED=0
rep() { printf "p='%s';s=open(p).read();o=%s;assert o in s,'mutation site gone';s=s.replace(o,%s,1);open(p,'w').write(s)" "$1" "$2" "$3"; }
verdictOf() { # <name> <out> <want> — KILLED when a RED row starts with <want>
  local name="$1" out="$2" want="$3" red
  printf '%s\n' "$out" > "$OUT/$name.txt"
  red="$(grep -a "^RED   $want" <<<"$out" | head -1)"
  if [ -n "$red" ]; then echo "KILLED   $name — $(cut -c1-400 <<<"$red")"; return 0; fi
  echo "SURVIVED $name — required a red [$want]; got: $(grep -aE '^(RED|VERDICT)' <<<"$out" | head -3 | cut -c1-200 | tr '\n' '|')"; return 1
}
# mutant <name> <python> <part> <the red row's gate text>
mutant() {
  local name="$1" mut="$2" part="$3" want="$4"
  if [ -n "$ONLY" ] && [[ "$name" != *"$ONLY"* ]]; then return 0; fi
  restore
  python3 -c "$mut" || { echo "SURVIVED $name — THE MUTATION DID NOT APPLY"; SURVIVED=$((SURVIVED+1)); return; }
  local out
  out="$(node tools/harness/gates-stages.mjs --part "$part" --no-write 2>&1)"
  restore
  if verdictOf "$name" "$out" "$want"; then KILLED=$((KILLED+1)); else SURVIVED=$((SURVIVED+1)); fi
}
# A — a stage with NO provenance passes validation (the schema stops requiring it)
mutant A-no-provenance-passes "$(rep loader/tmt-auto.js "\"required: ['id', 'when', 'provenance']\"" "\"required: ['id', 'when']\"")" vocab 'V1 the stages schema'
# B — a stage whose `when` THROWS reads as TRUE
mutant B-throw-reads-true "$(rep loader/tmt-auto.js "'catch (e) { v = false; err[S.id] = '" "'catch (e) { v = true; err[S.id] = '")" vocab 'V2 a stage whose'
# C — stage precedence ABOVE the player's saved edit
mutant C-stage-above-edit "$(rep loader/tmt-auto.js "'function basePolicy(f) { return savedPolicyOf(f) || (f.policyOpt !== null ? f.policy0 : (stagePolicyOf(f) || f.policy0)); }'" "'function basePolicy(f) { return f.policyOpt !== null ? f.policy0 : (stagePolicyOf(f) || savedPolicyOf(f) || f.policy0); }'")" switch 'S4 a PLAYER'
# D — the two QL6 stages in the LOSING order (q31/q32 first, then H22): the shipped table no longer reaches the M29 pin
mutant D-losing-order "$(printf "import json;p='games-auto/ptr.json';t=json.load(open(p));ids=[s['id'] for s in t['stages']];i2=ids.index('ql6-hold-for-q32');i3=ids.index('ql6-h22-attempt');assert i3<i2;s=t['stages'];s[i2],s[i3]=s[i3],s[i2];open(p,'w').write(json.dumps(t,indent=2,ensure_ascii=False)+'\\\\n')")" fixture 'F1 stages/M29 = all/M26'
# E — a game id in the loader
mutant E-game-id-in-loader "$(rep loader/tmt-auto.js "'  function stageTick() {'" "'  function stageTick() {\n    var FAVOURITE = \\'ptr\\';'")" grep 'X1 no game id'

echo "stages mutants: $KILLED killed, $SURVIVED survived"
[ "$SURVIVED" -eq 0 ]
