#!/usr/bin/env bash
# The shipq-2 mutants — each reverts one of the three fixes the sweep's reds asked for, and REQUIRES the gate that saw
# the red to see it again:
#   A  the kinds-skip removed (no `autoOutOfKinds`)          → S1 part 1 (a `kinds=` anchor leg cannot load ptr)
#   B  raw feature ids in the player view's queue readout    → A1 part 2, the PLAYER-view row
#   C  E1's declaration of the runner reverted               → E1 (vii requests: an undeclared loader/tmt-queue.js)
#
#   tools/harness/mutants-shipq2.sh <out-dir> [name-filter]
#
# ⛔ It restores from COPIES taken at the start (never `git checkout`), and it refuses a dirty tree anyway: a mutant
# round must never be able to take uncommitted work with it.
set -uo pipefail
cd "$(dirname "$0")/../.."
OUT="${1:?usage: mutants-shipq2.sh <out-dir> [name-filter]}"
ONLY="${2:-}"
mkdir -p "$OUT"
OUT="$(cd "$OUT" && pwd)"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then echo "REFUSING: the tree is dirty. Commit first."; exit 1; fi
FILES="loader/tmt-auto.js loader/tmt-queue.js tools/harness/embedverdict.mjs"
for f in $FILES; do cp "$f" "$OUT/$(basename "$f").orig"; done
restore() { for f in $FILES; do cp "$OUT/$(basename "$f").orig" "$f"; done; }
trap restore EXIT
KILLED=0; SURVIVED=0
rep() { printf "p='%s';s=open(p).read();o=%s;assert o in s,'mutation site gone';s=s.replace(o,%s,1);open(p,'w').write(s)" "$1" "$2" "$3"; }
# mutant <name> <python> <command> <a regex the RED line must match>
mutant() {
  local name="$1" mut="$2" cmd="$3" want="$4"
  if [ -n "$ONLY" ] && [[ "$name" != *"$ONLY"* ]]; then return 0; fi
  restore
  python3 -c "$mut" || { echo "SURVIVED $name — THE MUTATION DID NOT APPLY"; SURVIVED=$((SURVIVED+1)); return; }
  local out red
  out="$(bash -c "$cmd" 2>&1)"
  restore
  printf '%s\n' "$out" > "$OUT/$name.txt"
  red="$(grep -aE "$want" <<<"$out" | head -1)"
  if [ -n "$red" ]; then echo "KILLED   $name — $(cut -c1-400 <<<"$red")"; KILLED=$((KILLED+1))
  else echo "SURVIVED $name — required a red [$want]; got: $(grep -aE '^(RED|E1 |VERDICT|gates-s1|a1-part2)' <<<"$out" | head -3 | cut -c1-200 | tr '\n' '|')"; SURVIVED=$((SURVIVED+1)); fi
}

# A — a `kinds=` restriction no longer recorded: the held feature reads as unknown, and the load refuses the queue
mutant A-kinds-skip-removed "$(rep loader/tmt-auto.js "'T.autoOutOfKinds[id] = c.kind; '" "''")" \
  'node tools/harness/gates-s1.mjs --part 1 --no-summary --pool 4' '^RED   S1-1 pinned A[12]-3 ptr'
# B — the player view draws the runner's raw words (feature ids) instead of the titled ones
mutant B-raw-ids-in-player-view "$(rep loader/tmt-auto.js "'return T.devDetails() ? st : queueWords(st);'" "'return st;'")" \
  'node tools/harness/gates-a1.mjs --part 2 ptr --no-summary' '^RED   A1-2 the Advanced subtab — PLAYER view'
# C — E1 no longer declares the runner the table in force asks for
mutant C-embed-declaration-reverted "$(rep tools/harness/embedverdict.mjs "'    if (queues) want.add(\\'loader/tmt-queue.js\\');\n'" "''")" \
  'node tools/harness/embed.mjs ptr' '^E1 ptr: RED .*vii-requests=RED'

echo "shipq-2 mutants: $KILLED killed, $SURVIVED survived"
[ "$SURVIVED" -eq 0 ]
