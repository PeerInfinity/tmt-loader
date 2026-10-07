#!/usr/bin/env bash
# The climb-1 mutants — each breaks one promise of the new part or the run timeline's polish (docs/automation.md,
# "Stages" and "The run timeline") and REQUIRES the gates-climb row that can see it to go red.
#
#   tools/harness/mutants-climb.sh <out-dir> [name-filter]
#
# ⛔ It restores from COPIES taken at the start (never `git checkout`), and it refuses a dirty tree anyway: a mutant
# round must never be able to take uncommitted work with it.
set -uo pipefail
cd "$(dirname "$0")/../.."
OUT="${1:?usage: mutants-climb.sh <out-dir> [name-filter]}"
ONLY="${2:-}"
mkdir -p "$OUT"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then echo "REFUSING: the tree is dirty. Commit first."; exit 1; fi
# ⚖ climb-2: the rows read climb-1's table from its committed copy (the shipped table carries the stage switched off), so the
# table mutants A and B mutate the copy
COPY=tools/harness/snapshots/ptr/whole-climb1/table-climb1.json
FILES="loader/tmt-auto.js games-auto/ptr.json $COPY"
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
  if [ "$only" = "$where" ] || [ -z "$only" ]; then out="$(node tools/harness/gates-climb.mjs --part "$part" --no-summary --no-write 2>&1)"
  else out="$(node tools/harness/gates-climb.mjs --part "$part" --only "$only" --no-summary --no-write 2>&1)"; fi
  red="$(grep -a "^RED   $want" <<<"$out" | head -1)"
  restore
  printf '%s\n' "$out" > "$OUT/$name.txt"
  if [ -n "$red" ]; then echo "KILLED   $name — $(cut -c1-260 <<<"$red")"; KILLED=$((KILLED+1))
  else echo "SURVIVED $name — required a red [$want]; got: $(grep -aE '^(RED|GREEN)' <<<"$out" | head -3 | cut -c1-200 | tr '\n' '|')"; SURVIVED=$((SURVIVED+1)); fi
}
rep() { printf "p='%s';s=open(p).read();o=%s;assert o in s,'mutation site gone';s=s.replace(o,%s,1);open(p,'w').write(s)" "$1" "$2" "$3"; }
# the new stage moved after sg-keep (the losing order: sg-keep names the same slot and wins it)
LOSING="import json;p='$COPY';t=json.load(open(p));st=t['stages'];s=[x for x in st if x['id']=='q43-longer-quirk-runs'][0];st.remove(s);i=[x['id'] for x in st].index('sg-keep');st.insert(i+1,s);open(p,'w').write(json.dumps(t,indent=2,ensure_ascii=False)+'\n')"
NOPROV="import json;p='$COPY';t=json.load(open(p));s=[x for x in t['stages'] if x['id']=='q43-longer-quirk-runs'][0];s['provenance']=[];open(p,'w').write(json.dumps(t,indent=2,ensure_ascii=False)+'\n')"

# A — the new stage in the losing order
mutant A-losing-order "$LOSING" rows 'climb1 C2 the ORDER'
# B — the new part shipped with no provenance
mutant B-no-provenance "$NOPROV" rows 'climb1 C1 every candidate'
# C — the "Already past" fold removed: every late mark its own row again
mutant C-fold-removed "$(rep loader/tmt-auto.js "'    if (late.length < 2) return ev.map('" "'    if (late.length < 2e9) return ev.map('")" timeline:fold 'TL6 the marks already past'
# D — a raw condition in a player's line
mutant D-raw-condition "$(rep loader/tmt-auto.js "\"return w ? 'the point where ' + w : 'a condition'; }\"" "\"return w ? 'the point where ' + w : 'the condition ' + src; }\"")" timeline:words 'TL7 a fast-forward'
# E — the timeline in recorded order (newest recorded first), not by game time
mutant E-unordered "$(rep loader/tmt-auto.js "'.sort(function (a, b) { return ((Number(b.e.at) || 0) - (Number(a.e.at) || 0)) || (a.i - b.i); })'" "'.sort(function (a, b) { return b.i - a.i; })'")" timeline:order 'TL8 newest first'
# F — a game id in the code this slice added
mutant F-game-id "$(rep loader/tmt-auto.js "'  T.conditionWords = CW;'" "'  T.conditionWords = CW; // (climb-1)\n  var CW_HOME = \"ptr\"; // (climb-1)'")" grep 'X1 no game'

echo "climb mutants: $KILLED killed, $SURVIVED survived"
[ "$SURVIVED" -eq 0 ]
