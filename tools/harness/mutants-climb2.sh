#!/usr/bin/env bash
# The climb-2 mutants — each breaks one promise of the stage shipped switched off (docs/automation.md, "Stages") and
# REQUIRES the gates-climb2 row that can see it to go red.
#
#   tools/harness/mutants-climb2.sh <out-dir> [name-filter]
#
# ⛔ It restores from COPIES taken at the start (never `git checkout`), and it refuses a dirty tree anyway: a mutant
# round must never be able to take uncommitted work with it.
set -uo pipefail
cd "$(dirname "$0")/../.."
OUT="${1:?usage: mutants-climb2.sh <out-dir> [name-filter]}"
ONLY="${2:-}"
mkdir -p "$OUT"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then echo "REFUSING: the tree is dirty. Commit first."; exit 1; fi
FILES="loader/tmt-auto.js loader/tmt-qedit.js games-auto/ptr.json"
for f in $FILES; do cp "$f" "$OUT/$(basename "$f").orig"; done
restore() { for f in $FILES; do cp "$OUT/$(basename "$f").orig" "$f"; done; }
trap restore EXIT
KILLED=0; SURVIVED=0

# mutant <name> <python> <part> <the row that must be red (its gate prefix)>
mutant() {
  local name="$1" mut="$2" part="$3" want="$4"
  if [ -n "$ONLY" ] && [[ "$name" != *"$ONLY"* ]]; then return 0; fi
  restore
  python3 -c "$mut" || { echo "SURVIVED $name — THE MUTATION DID NOT APPLY"; SURVIVED=$((SURVIVED+1)); return; }
  local out red
  out="$(node tools/harness/gates-climb2.mjs --part "$part" --no-summary --no-write 2>&1)"
  red="$(grep -a "^RED   $want" <<<"$out" | head -1)"
  restore
  printf '%s\n' "$out" > "$OUT/$name.txt"
  if [ -n "$red" ]; then echo "KILLED   $name — $(cut -c1-260 <<<"$red")"; KILLED=$((KILLED+1))
  else echo "SURVIVED $name — required a red [$want]; got: $(grep -aE '^(RED|GREEN)' <<<"$out" | head -3 | cut -c1-200 | tr '\n' '|')"; SURVIVED=$((SURVIVED+1)); fi
}
rep() { printf "p='%s';s=open(p).read();o=%s;assert o in s,'mutation site gone';s=s.replace(o,%s,1);open(p,'w').write(s)" "$1" "$2" "$3"; }

# A — a stage the table ships switched off is still in force (the loop no longer skips it)
mutant A-disabled-in-force "$(rep loader/tmt-auto.js "'      if (!S.enabled || stageOffByYou(S.id)) continue;'" "'      if (stageOffByYou(S.id)) continue;'")" off 'OFF1 enabled: false'
# B — the "switched off in this game's table" line missing (the stage reads like any other waiting stage)
mutant B-line-missing "$(rep loader/tmt-qedit.js "\"var state = S.enabled === false ? 'table-off' : \"" "\"var state = \"")" page 'OFF2 the Parts subtab'
# C — a game id in the code this slice added
mutant C-game-id "$(rep loader/tmt-auto.js "'  var SHIPPED_OFF_WHY = '" "'  var SHIPPED_OFF_HOME = \"ptr\"; // (climb-2)\n  var SHIPPED_OFF_WHY = '")" grep 'X1 no game id'
# D — the shipped table switches the stage back on (the user's ruling undone)
mutant D-shipped-on "import json;p='games-auto/ptr.json';t=json.load(open(p));s=[x for x in t['stages'] if x['id']=='q43-longer-quirk-runs'][0];del s['enabled'];open(p,'w').write(json.dumps(t,indent=2,ensure_ascii=False)+'\n')" table 'R0 the tables'

echo "climb2 mutants: $KILLED killed, $SURVIVED survived"
[ "$SURVIVED" -eq 0 ]
