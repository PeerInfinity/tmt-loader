#!/usr/bin/env bash
# The qrate1 mutants — each breaks one promise of the sub-goal seam or the round's scorer (docs/templates.md,
# docs/planner.md) and REQUIRES the gate that can see it to go red (gates-qrate1.mjs): the sub-goal legs or the grep.
#
#   tools/harness/mutants-qrate1.sh <out-dir> [name-filter]
#
# ⛔ It restores from COPIES taken at the start (never `git checkout`), and it refuses a dirty tree anyway: a mutant
# round must never be able to take uncommitted work with it.
set -uo pipefail
cd "$(dirname "$0")/../.."
OUT="${1:?usage: mutants-qrate1.sh <out-dir> [name-filter]}"
ONLY="${2:-}"
mkdir -p "$OUT"
OUT="$(cd "$OUT" && pwd)"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then echo "REFUSING: the tree is dirty. Commit first."; exit 1; fi
FILES="loader/tmt-planner.js"
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
  out="$(node tools/harness/gates-qrate1.mjs --part "$part" --no-write 2>&1)"
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

# A — the sub-goal path DROPS the threshold: setSubgoal keeps the dimension and takes what is held now as the
#     threshold, so the planner targets the wrong value (and calls it reached at once)
mutant A-subgoal-drops-threshold "$(rep loader/tmt-planner.js "'    var thr = g.threshold === null || g.threshold === undefined ? null : dstr(D(g.threshold));'" "'    var thr = dstr(D(getPath(g.dimension) == null ? 1 : getPath(g.dimension)));'")" subgoal 'S1 the template'
# B — the scorer reads the window's END (a net rate: end − start) instead of its MAX (P1a 12a.5's trap)
mutant B-scorer-net-not-max "$(rep loader/tmt-planner.js "'    terms.progress = O(\\'wProgress\\') * logProgress(c.startLog10, c.maxLog10, target.threshold);'" "'    terms.progress = O(\\'wProgress\\') * logProgress(c.startLog10, c.endLog10, target.threshold);'")" subgoal 'S3 the scorer'
# C — a game id in the planner's new generic code
mutant C-game-id-in-planner "$(rep loader/tmt-planner.js "'  P.setSubgoal = function (g) {'" "'  P.setSubgoal = function (g) {\n    var FAVOURITE = \\'ptr\\';'")" grep 'X1 no game or layer id'

echo "qrate1 mutants: $KILLED killed, $SURVIVED survived"
[ "$SURVIVED" -eq 0 ]
