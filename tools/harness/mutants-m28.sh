#!/usr/bin/env bash
# The m28 mutants — each breaks one promise of the slice (the declared facts state, the charged-price verdict, the
# zeroed-at-peak lever rule, no game id) and REQUIRES the gate that can see it to go red (gates-m28.mjs).
#
#   tools/harness/mutants-m28.sh <out-dir> [name-filter]
#
# ⛔ It restores from COPIES taken at the start (never `git checkout`), and it refuses a dirty tree anyway: a mutant
# round must never be able to take uncommitted work with it.
set -uo pipefail
cd "$(dirname "$0")/../.."
OUT="${1:?usage: mutants-m28.sh <out-dir> [name-filter]}"
ONLY="${2:-}"
mkdir -p "$OUT"
OUT="$(cd "$OUT" && pwd)"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then echo "REFUSING: the tree is dirty. Commit first."; exit 1; fi
FILES="tools/harness/facts.mjs loader/tmt-templates.js"
for f in $FILES; do cp "$f" "$OUT/$(basename "$f").orig"; done
restore() { for f in $FILES; do cp "$OUT/$(basename "$f").orig" "$f"; done; }
trap restore EXIT
KILLED=0; SURVIVED=0

# mutant <name> <python> <part> <the red row's gate text>
mutant() {
  local name="$1" mut="$2" part="$3" want="$4"
  if [ -n "$ONLY" ] && [[ "$name" != *"$ONLY"* ]]; then return 0; fi
  restore
  python3 -c "$mut" || { echo "SURVIVED $name — THE MUTATION DID NOT APPLY"; SURVIVED=$((SURVIVED+1)); return; }
  local out red
  out="$(node tools/harness/gates-m28.mjs --part "$part" --no-write 2>&1)"
  restore
  printf '%s\n' "$out" > "$OUT/$name.txt"
  red="$(grep -a "^RED   $want" <<<"$out" | head -1)"
  if [ -n "$red" ]; then
    echo "KILLED   $name — $(cut -c1-400 <<<"$red")"; KILLED=$((KILLED+1))
  else
    echo "SURVIVED $name — required a red [$want]; got: $(grep -aE '^(RED|VERDICT)' <<<"$out" | head -3 | cut -c1-200 | tr '\n' '|')"; SURVIVED=$((SURVIVED+1))
  fi
}
rep() { printf "p='%s';s=open(p).read();o=%s;assert o in s,'mutation site gone';s=s.replace(o,%s,1);open(p,'w').write(s)" "$1" "$2" "$3"; }

# A — the declared-state mechanism SILENTLY SKIPS its states (the vacuity trap: q31/q32 then read "locked in every
#     state", and facts-1's O1 abstains green) — D2 regenerates through the default state list and must see it
mutant A-declared-state-skipped "$(rep tools/harness/facts.mjs "'  for (const d of declaredStates(id)) out.push(d);'" "'  for (const d of declaredStates(id)) void d;'")" facts 'D2 VACUITY'
# B — the verdict judged against the LIVE price instead of the charged (tick-start tmp) one (§16's correction)
mutant B-verdict-on-live-price "$(rep loader/tmt-templates.js "'        var cur = getPath(b.currency), price = chargedPrice(b.item);'" "'        var cur = getPath(b.currency), price = livePrice(b.item);'")" verdict 'V3 the verdict is judged'
# C — the zeroed-at-peak rule dropped: Super Boosters (0 at q.time 1, zeroed with it) become q31's sub-goal again
mutant C-lever-zeroed-at-peak-emitted "$(rep loader/tmt-templates.js "'    return all && zero ? '" "'    return false && all && zero ? '")" verdict 'V1 q31 at QL6'
# D — a game id in the template's new generic code
mutant D-game-id-in-template "$(rep loader/tmt-templates.js "'  function zeroedAtPeak(facts, b, input, held) {'" "'  function zeroedAtPeak(facts, b, input, held) {\n    var FAVOURITE = \\'ptr\\';'")" grep 'X1 no game or layer id'

echo "m28 mutants: $KILLED killed, $SURVIVED survived"
[ "$SURVIVED" -eq 0 ]
