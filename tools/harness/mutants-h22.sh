#!/usr/bin/env bash
# The h22 mutants — each breaks one promise of the slice (the exits-challenge facts see rowReset's same-row case; the
# hold covers every exit; a lever the attempt rebuilds from zero is never the sub-goal; no game id) and REQUIRES the gate
# that can see it to go red (gates-h22.mjs; A also gates-facts1.mjs O8).
#
#   tools/harness/mutants-h22.sh <out-dir> [name-filter]
#
# ⛔ It restores from COPIES taken at the start (never `git checkout`), and it refuses a dirty tree anyway: a mutant
# round must never be able to take uncommitted work with it.
set -uo pipefail
cd "$(dirname "$0")/../.."
OUT="${1:?usage: mutants-h22.sh <out-dir> [name-filter]}"
ONLY="${2:-}"
mkdir -p "$OUT"
OUT="$(cd "$OUT" && pwd)"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then echo "REFUSING: the tree is dirty. Commit first."; exit 1; fi
FILES="loader/tmt-planner.js loader/tmt-templates.js"
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

# A — the exits-challenge probe MISSES rowReset's same-row case (only the challenge's own layer and higher rows "exit"):
#     the facts are regenerated with the mutant (that kind only) into a COPY of the committed file, and the template run
#     on them holds reset:h alone — a q reset cuts the attempt again (O1), and facts-1's O8 sees the set ≠ the source.
if [ -z "$ONLY" ] || [[ "A-exits-miss-same-row" == *"$ONLY"* ]]; then
  restore
  if python3 -c "$(rep loader/tmt-planner.js "'        if (!R.exits) continue;'" "'        if (!R.exits || (layers[r].row === layers[l].row && r !== l)) continue;'")"; then
    rm -rf "$OUT/A-facts"; mkdir -p "$OUT/A-facts"
    node tools/harness/facts.mjs ptr --kinds exits-challenge --out "$OUT/A-facts" --jobs 6 > "$OUT/A-facts.txt" 2>&1
    restore
    node -e '
      const fs = require("fs"); const [committed, mut, out] = process.argv.slice(1);
      const C = JSON.parse(fs.readFileSync(committed, "utf8")), M = JSON.parse(fs.readFileSync(mut, "utf8"));
      C.facts = C.facts.filter((f) => f.kind !== "exits-challenge").concat(M.facts.filter((f) => f.kind === "exits-challenge"));
      fs.writeFileSync(out, JSON.stringify(C));' games-facts/ptr.json "$OUT/A-facts/ptr.json" "$OUT/A-merged.json"
    o1="$(node tools/harness/gates-h22.mjs --part verdict --facts "$OUT/A-merged.json" --no-write 2>&1)"
    o8="$(node tools/harness/gates-facts1.mjs --part oracle --kinds exits-challenge --facts "$OUT/A-facts" --no-summary --no-write 2>&1)"
    if verdictOf A-exits-miss-same-row "$o1" 'O1 ch:h:22' && verdictOf A-exits-miss-same-row-O8 "$o8" 'O8 exits-challenge'; then KILLED=$((KILLED+1)); else SURVIVED=$((SURVIVED+1)); fi
  else echo "SURVIVED A-exits-miss-same-row — THE MUTATION DID NOT APPLY"; SURVIVED=$((SURVIVED+1)); fi
fi

# mutant <name> <python> <part> <the red row's gate text>
mutant() {
  local name="$1" mut="$2" part="$3" want="$4"
  if [ -n "$ONLY" ] && [[ "$name" != *"$ONLY"* ]]; then return 0; fi
  restore
  python3 -c "$mut" || { echo "SURVIVED $name — THE MUTATION DID NOT APPLY"; SURVIVED=$((SURVIVED+1)); return; }
  local out
  out="$(node tools/harness/gates-h22.mjs --part "$part" --no-write 2>&1)"
  restore
  if verdictOf "$name" "$out" "$want"; then KILLED=$((KILLED+1)); else SURVIVED=$((SURVIVED+1)); fi
}
# B — the hold covers only the challenge's OWN layer, not a sibling of the same row (q, o, ss): the attempt is cut
mutant B-hold-misses-a-sibling "$(rep loader/tmt-templates.js "'      var hold = caHoldSet(g.exits);'" "'      var hold = caHoldSet([cc.layer]);'")" verdict 'O1 ch:h:22'
# C — the spent-by-entry rule dropped: an input the ENTRY zeroes (the attempt rebuilds it from 0) is no longer flagged,
#     so it ranks by distance and becomes the sub-goal (g.points, 10^0.05). ⚠ The rule is enforced twice (the ranking puts
#     flagged levers last, the pick skips them), so dropping only the pick's filter is NOT a mutant of it — measured: it
#     survived. The rule is the flag.
mutant C-spent-lever-emitted "$(rep loader/tmt-templates.js "'        if (z && (z.effect || (lastVariant(z) || {}).effect) === '" "'        if (false && z && (z.effect || (lastVariant(z) || {}).effect) === '")" verdict 'O1s ch:h:22'
# D — a game id in the template's new generic code
mutant D-game-id-in-template "$(rep loader/tmt-templates.js "'  function caHoldSet(exits) {'" "'  function caHoldSet(exits) {\n    var FAVOURITE = \\'ptr\\';'")" grep 'X1 no game or layer id'

echo "h22 mutants: $KILLED killed, $SURVIVED survived"
[ "$SURVIVED" -eq 0 ]
