#!/usr/bin/env bash
# The m30 mutants — each breaks one promise of the slice (the hold covers every reset that zeroes the base; the stage
# reads the engine's requirement, never its number; no game id in generic code) and REQUIRES the gate that can see it to
# go red (gates-m30.mjs).
#
#   tools/harness/mutants-m30.sh <out-dir> [name-filter]
#
# Two mutants the brief asked for are not what it expected, measured:
#  · "the hold misses the row-2 siblings" (A0) — on ptr the siblings never cut Generators on this path (gates-m30 SIB:
#    freed, the held leg is unchanged to the tick and hash). Only O1's structural check (the hold covers every zeroer
#    the source names) kills it; the hold that matters behaviourally is the row-3 one (A, killed by the verdict itself).
#  · "the stage in the losing order" — both orders measured EQUAL (gates-m30 M-order, first@1 = last@1 to the hash):
#    the stage names no slot another stage names while both hold. There is no losing order to plant.
#
# ⛔ It restores from COPIES taken at the start (never `git checkout`), and it refuses a dirty tree anyway: a mutant
# round must never be able to take uncommitted work with it.
set -uo pipefail
cd "$(dirname "$0")/../.."
OUT="${1:?usage: mutants-m30.sh <out-dir> [name-filter]}"
ONLY="${2:-}"
mkdir -p "$OUT"
OUT="$(cd "$OUT" && pwd)"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then echo "REFUSING: the tree is dirty. Commit first."; exit 1; fi
FILES="loader/tmt-templates.js games-auto/ptr.json"
for f in $FILES; do cp "$f" "$OUT/$(basename "$f").orig"; done
restore() { for f in $FILES; do cp "$OUT/$(basename "$f").orig" "$f"; done; }
trap restore EXIT
KILLED=0; SURVIVED=0
rep() { printf "p='%s';s=open(p).read();o=%s;assert o in s,'mutation site gone';s=s.replace(o,%s);open(p,'w').write(s)" "$1" "$2" "$3"; }
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
  out="$(node tools/harness/gates-m30.mjs --part "$part" --no-write 2>&1)"
  restore
  if verdictOf "$name" "$out" "$want"; then KILLED=$((KILLED+1)); else SURVIVED=$((SURVIVED+1)); fi
}
# A — the hold misses the ROW-3 zeroers (h, o, q, ss and h's challenges): q and h wipe Generators at 200, the wall
#     itself — the verdict is not reset-at
mutant A-hold-misses-row3 "$(rep loader/tmt-templates.js "'hold: rrHoldSet(zeroers, l),'" "'hold: rrHoldSet(zeroers.filter(function (z) { return !(rrRow(z) > row); }), l),'")" verdict 'O1 reset:sg'
# A0 — the brief's mutant: the hold misses the row SIBLINGS (e, s, sb, t). Only O1's STRUCTURAL check (the hold covers
#      every zeroer the source names) can see it: behaviourally it changes nothing on this path (SIB)
mutant A0-hold-misses-siblings "$(rep loader/tmt-templates.js "'hold: rrHoldSet(zeroers, l),'" "'hold: rrHoldSet(zeroers.filter(function (z) { return rrRow(z) !== row; }), l),'")" verdict 'O1 reset:sg'
# B — a literal 200 in the stage's gate instead of the engine's requirement (it still reaches M30 at 0 Super
#     Generators: only the grep leg can see it)
mutant B-literal-requirement "$(rep games-auto/ptr.json "'\"player.g.points.gte(tmp.sg.nextAt)\"'" "'\"player.g.points.gte(200)\"'")" stage 'S2 q33-sg-unlock'
# C — a game id in the template's generic code
mutant C-game-id-in-template "$(rep loader/tmt-templates.js "'  function rrHoldSet(zeroers, l) {'" "'  function rrHoldSet(zeroers, l) {\n    var FAVOURITE = \\'ptr\\';'")" grep 'X1 no game or layer id'

echo "m30 mutants: $KILLED killed, $SURVIVED survived"
[ "$SURVIVED" -eq 0 ]
