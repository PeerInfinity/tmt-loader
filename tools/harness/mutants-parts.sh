#!/usr/bin/env bash
# The parts-1 mutants — each breaks one promise of the Parts subtab and the player's switches (docs/automation.md,
# "Switched off by you"; docs/queues.md, "The Parts subtab") and REQUIRES the gates-parts row that can see it to go red.
#
#   tools/harness/mutants-parts.sh <out-dir> [name-filter]
#
# ⛔ It restores from COPIES taken at the start (never `git checkout`), and it refuses a dirty tree anyway: a mutant
# round must never be able to take uncommitted work with it.
set -uo pipefail
cd "$(dirname "$0")/../.."
OUT="${1:?usage: mutants-parts.sh <out-dir> [name-filter]}"
ONLY="${2:-}"
mkdir -p "$OUT"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then echo "REFUSING: the tree is dirty. Commit first."; exit 1; fi
FILES="loader/tmt-auto.js loader/tmt-queue.js loader/tmt-qedit.js"
for f in $FILES; do cp "$f" "$OUT/$(basename "$f").orig"; done
restore() { for f in $FILES; do cp "$OUT/$(basename "$f").orig" "$f"; done; }
trap restore EXIT
KILLED=0; SURVIVED=0

# mutant <name> <python> <part:legs> <the row that must be red (its gate prefix)>
mutant() {
  local name="$1" mut="$2" where="$3" want="$4"
  if [ -n "$ONLY" ] && [[ "$name" != *"$ONLY"* ]]; then return 0; fi
  restore
  python3 -c "$mut" || { echo "SURVIVED $name — THE MUTATION DID NOT APPLY"; SURVIVED=$((SURVIVED+1)); return; }
  local out red part="${where%%:*}" legs="${where#*:}"
  if [ "$part" = grep ]; then out="$(node tools/harness/gates-parts.mjs --part grep --no-summary --no-write 2>&1)"
  else out="$(node tools/harness/gates-parts.mjs --part page --only "$legs" --no-summary --no-write 2>&1)"; fi
  red="$(grep -a "^RED   $want" <<<"$out" | head -1)"
  restore
  printf '%s\n' "$out" > "$OUT/$name.txt"
  if [ -n "$red" ]; then echo "KILLED   $name — $(cut -c1-260 <<<"$red")"; KILLED=$((KILLED+1))
  else echo "SURVIVED $name — required a red [$want]; got: $(grep -aE '^(RED|GREEN)' <<<"$out" | head -3 | cut -c1-200 | tr '\n' '|')"; SURVIVED=$((SURVIVED+1)); fi
}
rep() { printf "p='%s';s=open(p).read();o=%s;assert o in s,'mutation site gone';s=s.replace(o,%s,1);open(p,'w').write(s)" "$1" "$2" "$3"; }

# A — the player's switch written into `player` (a key there changes every save's full hash): P4's "nowhere in player"
mutant A-override-in-player "$(rep loader/tmt-auto.js "'  function partsWrite() {\n    partsWrites++;'" "'  function partsWrite() {\n    partsWrites++;\n    try { player.tmtParts = JSON.stringify(partsRead()); } catch (e) { /* */ }'")" page:queue-off 'P4 queue-off'
# B — a switched-off stage STILL IN FORCE (the switch is shown, the stage is evaluated anyway)
mutant B-stage-still-in-force "$(rep loader/tmt-auto.js "'      if (stageOffByYou(S.id)) continue;\n'" "''")" page:stage-off 'P5 stage-off'
# C — a switched-off shipped queue STILL RUNNING (the switch is stored, the runner is not told)
mutant C-queue-still-running "$(rep loader/tmt-queue.js "'      if (off && at >= 0) {'" "'      if (false && off && at >= 0) {'")" page:queue-off 'P4 queue-off'
# D — a RAW FEATURE ID in the player view: what a stage sets is listed by id, not by title
mutant D-raw-feature-id "$(rep loader/tmt-qedit.js "'sets.push({ id: f, title: featureWithLayer(f),'" "'sets.push({ id: f, title: f,'")" page:listed 'P2 listed'
# E — a NOWRAP row (the V5 defect): every row of the Parts subtab on one line — the phone leg sees it
mutant E-nowrap-row "$(rep loader/tmt-qedit.js "\"  var ROW = 'display:flex;flex-wrap:wrap;\"" "\"  var ROW = 'display:flex;flex-wrap:nowrap;white-space:nowrap;\"")" page:phone 'P8 phone'
# F — a game id in the generic code
mutant F-game-id "$(rep loader/tmt-queue.js "\"  var REARMS = ['once', 'each'];\"" "\"  var REARMS = ['once', 'each'];\n  var HOME = 'ptr';\"")" grep: 'X1 no game'

echo "parts-1 mutants: $KILLED killed, $SURVIVED survived"
[ "$SURVIVED" -eq 0 ]
