#!/usr/bin/env bash
# The speed-1 mutants — each breaks one promise of the speed controls or the automation's memory across a reload
# (docs/speed.md; docs/automation.md, "Memory across a reload") and REQUIRES the gates-speed row that can see it to go red.
#
#   tools/harness/mutants-speed.sh <out-dir> [name-filter]
#
# ⛔ It restores from COPIES taken at the start (never `git checkout`), and it refuses a dirty tree anyway: a mutant
# round must never be able to take uncommitted work with it.
set -uo pipefail
cd "$(dirname "$0")/../.."
OUT="${1:?usage: mutants-speed.sh <out-dir> [name-filter]}"
ONLY="${2:-}"
mkdir -p "$OUT"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then echo "REFUSING: the tree is dirty. Commit first."; exit 1; fi
FILES="loader/tmt-speed.js loader/tmt-auto.js"
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
  if [ "$part" = grep ]; then out="$(node tools/harness/gates-speed.mjs --part grep --no-summary --no-write 2>&1)"
  else out="$(node tools/harness/gates-speed.mjs --part page --only "$legs" --no-summary --no-write 2>&1)"; fi
  red="$(grep -a "^RED   $want" <<<"$out" | head -1)"
  restore
  printf '%s\n' "$out" > "$OUT/$name.txt"
  if [ -n "$red" ]; then echo "KILLED   $name — $(cut -c1-260 <<<"$red")"; KILLED=$((KILLED+1))
  else echo "SURVIVED $name — required a red [$want]; got: $(grep -aE '^(RED|GREEN)' <<<"$out" | head -3 | cut -c1-200 | tr '\n' '|')"; SURVIVED=$((SURVIVED+1)); fi
}
rep() { printf "p='%s';s=open(p).read();o=%s;assert o in s,'mutation site gone';s=s.replace(o,%s,1);open(p,'w').write(s)" "$1" "$2" "$3"; }

# A — the faithful mode steps 0.1 instead of the page's 0.05 (twice the game time per tick): S1's hash equality
mutant A-faithful-0.1 "$(rep loader/tmt-speed.js "'  var FAITHFUL = 0.05; '" "'  var FAITHFUL = 0.1; '")" page:faithful 'S1 faithful'
# B — the memory restored onto a DIFFERENT save: the fingerprint check skipped
mutant B-memory-any-save "$(rep loader/tmt-auto.js "\"    if (rec.fp !== fp) return memDiscard('other', { stored: rec.fp, loaded: fp });\"" "\"    if (false) return memDiscard('other', { stored: rec.fp, loaded: fp });\"")" page:memory 'S6 memory'
# C — `player.time` not reset on the way back to ×1 (and not kept while held): the phantom offline gap
mutant C-no-time-reset "$(rep loader/tmt-speed.js "\"  function setTime() { try { if (typeof player !== 'undefined' && player) player.time = Date.now(); } catch (e) { /* */ } }\"" "'  function setTime() { }'")" page:no-gap 'S5 no phantom gap'
# D — the speed saved into `player` (it would ride in the save, and a reload would come back fast)
mutant D-speed-in-player "$(rep loader/tmt-speed.js "'    else speed = x;\n'" "'    else speed = x;\n    try { player.tmtSpeed = x; } catch (e) { /* */ }\n'")" page:inert 'S8 inert'
# E — a NOWRAP row: every row of the panel on one line — the phone leg sees it
mutant E-nowrap-row "$(rep loader/tmt-speed.js "\"' .tmts-row{display:flex;flex-wrap:wrap;\"" "\"' .tmts-row{display:flex;flex-wrap:nowrap;white-space:nowrap;\"")" page:phone 'S7 phone'
# F — a game id in the generic code
mutant F-game-id "$(rep loader/tmt-speed.js "\"  var PREF = 'ui.speed';\"" "\"  var PREF = 'ui.speed'; var HOME = 'ptr';\"")" grep: 'X1 no game'

echo "speed-1 mutants: $KILLED killed, $SURVIVED survived"
[ "$SURVIVED" -eq 0 ]
