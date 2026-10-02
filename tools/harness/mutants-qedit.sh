#!/usr/bin/env bash
# The qedit-1 mutants — each breaks one promise of the queue editor (docs/queues.md, "The editor") and REQUIRES the
# gates-qedit row that can see it to go red.
#
#   tools/harness/mutants-qedit.sh <out-dir> [name-filter]
#
# ⛔ It restores from COPIES taken at the start (never `git checkout`), and it refuses a dirty tree anyway: a mutant
# round must never be able to take uncommitted work with it.
set -uo pipefail
cd "$(dirname "$0")/../.."
OUT="${1:?usage: mutants-qedit.sh <out-dir> [name-filter]}"
ONLY="${2:-}"
mkdir -p "$OUT"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then echo "REFUSING: the tree is dirty. Commit first."; exit 1; fi
FILES="loader/tmt-qedit.js"
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
  if [ "$part" = grep ]; then out="$(node tools/harness/gates-qedit.mjs --part grep --no-summary --no-write 2>&1)"
  else out="$(node tools/harness/gates-qedit.mjs --part page --only "$legs" --no-summary --no-write 2>&1)"; fi
  red="$(grep -a "^RED   $want" <<<"$out" | head -1)"
  restore
  printf '%s\n' "$out" > "$OUT/$name.txt"
  if [ -n "$red" ]; then echo "KILLED   $name — $(cut -c1-260 <<<"$red")"; KILLED=$((KILLED+1))
  else echo "SURVIVED $name — required a red [$want]; got: $(grep -aE '^(RED|GREEN)' <<<"$out" | head -3 | cut -c1-200 | tr '\n' '|')"; SURVIVED=$((SURVIVED+1)); fi
}
rep() { printf "p='%s';s=open(p).read();o=%s;assert o in s,'mutation site gone';s=s.replace(o,%s,1);open(p,'w').write(s)" "$1" "$2" "$3"; }

# A — the store written into `player` (a key there changes every save's full hash): Q2's "not in player"
mutant A-store-in-player "$(rep loader/tmt-qedit.js "'  function writeStore() {\n    writes++;'" "'  function writeStore() {\n    writes++;\n    try { player.tmtQueues = JSON.stringify(readStore()); } catch (e) { /* */ }'")" page:persist 'Q2 persist'
# B — a hold NOT released on delete: the deleted queue is dropped from the list but left loaded in the runner
mutant B-delete-keeps-hold "$(rep loader/tmt-qedit.js "'      var u = unloadIfLoaded(id);'" "'      var u = null;'")" page:release 'Q9 release'
# C — a hold NOT released on switching Off (unload skipped)
mutant C-off-keeps-hold "$(rep loader/tmt-qedit.js "'      unloadIfLoaded(id);\n      e.enabled = false;'" "'      e.enabled = false;'")" page:release 'Q9 release'
# D — the import ACCEPTING an invalid queue (its validation skipped)
mutant D-import-accepts-invalid "$(rep loader/tmt-qedit.js "'    var errs = validate(q);\n    if (!errs.length && find(q.id))'" "'    var errs = [];\n    if (!errs.length && find(q.id))'")" page:refuse 'Q5 refuse'
# E — a recorder with a SECOND wrapper of its own round an engine function: each press is counted twice
mutant E-second-wrapper "$(rep loader/tmt-qedit.js "'      rec.untap = T.stateLog.tap(onTap);'" "'      rec.untap = T.stateLog.tap(onTap);\n      var ob = G.buyBuyable; G.buyBuyable = function () { var r = ob.apply(this, arguments); onTap({ source: \"player\", call: \"buyBuyable\", args: [].slice.call(arguments), did: true }); return r; };'")" page:record 'Q11 record'
# F — a NOWRAP row: every editor row on one line (the V5 defect) — the phone leg sees controls past the edge
mutant F-nowrap-row "$(rep loader/tmt-qedit.js "\"  var ROW = 'display:flex;flex-wrap:wrap;\"" "\"  var ROW = 'display:flex;flex-wrap:nowrap;white-space:nowrap;\"")" page:phone 'Q13 phone'
# G — a game id in the editor's code
mutant G-game-id "$(rep loader/tmt-qedit.js "\"  var KEY = 'queues';\"" "\"  var KEY = 'queues';\n  var HOME = 'ptr';\"")" grep: 'G1 no game'

echo "qedit-1 mutants: $KILLED killed, $SURVIVED survived"
[ "$SURVIVED" -eq 0 ]
