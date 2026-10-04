#!/usr/bin/env bash
# The whole-1 mutants — each breaks one promise of the run timeline or the templates' words (docs/automation.md, "The
# run timeline"; docs/templates.md) and REQUIRES the gates-whole row that can see it to go red.
#
#   tools/harness/mutants-whole.sh <out-dir> [name-filter]
#
# ⛔ It restores from COPIES taken at the start (never `git checkout`), and it refuses a dirty tree anyway: a mutant
# round must never be able to take uncommitted work with it.
set -uo pipefail
cd "$(dirname "$0")/../.."
OUT="${1:?usage: mutants-whole.sh <out-dir> [name-filter]}"
ONLY="${2:-}"
mkdir -p "$OUT"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then echo "REFUSING: the tree is dirty. Commit first."; exit 1; fi
FILES="loader/tmt-auto.js loader/tmt-templates.js games-auto/ptr.json"
for f in $FILES; do cp "$f" "$OUT/$(basename "$f").orig"; done
restore() { for f in $FILES; do cp "$OUT/$(basename "$f").orig" "$f"; done; }
trap restore EXIT
KILLED=0; SURVIVED=0

# mutant <name> <python> <part[:only]> <the row that must be red (its gate prefix)>
mutant() {
  local name="$1" mut="$2" where="$3" want="$4"
  if [ -n "$ONLY" ] && [[ "$name" != *"$ONLY"* ]]; then return 0; fi
  restore
  python3 -c "$mut" || { echo "SURVIVED $name — THE MUTATION DID NOT APPLY"; SURVIVED=$((SURVIVED+1)); return; }
  local out red part="${where%%:*}" only="${where#*:}"
  if [ "$only" = "$where" ] || [ -z "$only" ]; then out="$(node tools/harness/gates-whole.mjs --part "$part" --no-summary --no-write 2>&1)"
  else out="$(node tools/harness/gates-whole.mjs --part "$part" --only "$only" --no-summary --no-write 2>&1)"; fi
  red="$(grep -a "^RED   $want" <<<"$out" | head -1)"
  restore
  printf '%s\n' "$out" > "$OUT/$name.txt"
  if [ -n "$red" ]; then echo "KILLED   $name — $(cut -c1-260 <<<"$red")"; KILLED=$((KILLED+1))
  else echo "SURVIVED $name — required a red [$want]; got: $(grep -aE '^(RED|GREEN)' <<<"$out" | head -3 | cut -c1-200 | tr '\n' '|')"; SURVIVED=$((SURVIVED+1)); fi
}
rep() { printf "p='%s';s=open(p).read();o=%s;assert o in s,'mutation site gone';s=s.replace(o,%s,1);open(p,'w').write(s)" "$1" "$2" "$3"; }

# A — a timeline event kind dropped: the stages' switches are never recorded
mutant A-kind-dropped "$(rep loader/tmt-auto.js "'      tlStage(rec, stagesNow[j]);'" "'      void rec;'")" timeline:kinds 'TL1 the timeline records'
# B — the timeline not restored after a reload (the record carries it; the load ignores it)
mutant B-not-restored "$(rep loader/tmt-auto.js "'    if (rec.timeline) T.timeline.restore(rec.timeline);'" "'    void rec.timeline;'")" timeline:kinds,reload 'TL2 the timeline survives'
# C — a template comment with a raw fact id in the player view (the shipped queue's first step speaks in ids again)
mutant C-fact-id-comment "$(rep games-auto/ptr.json "'\"comment\": \"hold what would end an attempt at'" "'\"comment\": \"exits-challenge:h:22:h — hold what would end an attempt at'")" tpl 'A1 the template-written'
# D — a game id in the generic code (the timeline)
mutant D-game-id "$(rep loader/tmt-auto.js "\"  var TL_CAP = 200, \"" "\"  var TL_HOME = 'ptr'; var TL_CAP = 200, \"")" grep 'X1 no game'
# E — the timeline unbounded
mutant E-unbounded "$(rep loader/tmt-auto.js "'    while (tl.events.length > TL_CAP) { tl.events.shift(); tl.dropped++; }'" "'    void TL_CAP;'")" timeline:kinds,bounded 'TL3 the timeline is bounded'

echo "whole mutants: $KILLED killed, $SURVIVED survived"
[ "$SURVIVED" -eq 0 ]
