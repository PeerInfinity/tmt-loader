#!/usr/bin/env bash
# The tpl1 mutants — each breaks one promise of the queue runner or the time-priced-purchase template (docs/queues.md,
# docs/templates.md) and REQUIRES the gate that can see it to go red (gates-tpl1.mjs): the runner legs, the replay,
# an oracle row, or the grep.
#
#   tools/harness/mutants-tpl1.sh <out-dir> [name-filter]
#
# ⛔ It restores from COPIES taken at the start (never `git checkout`), and it refuses a dirty tree anyway: a mutant
# round must never be able to take uncommitted work with it.
set -uo pipefail
cd "$(dirname "$0")/../.."
OUT="${1:?usage: mutants-tpl1.sh <out-dir> [name-filter]}"
ONLY="${2:-}"
mkdir -p "$OUT"
OUT="$(cd "$OUT" && pwd)"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then echo "REFUSING: the tree is dirty. Commit first."; exit 1; fi
FILES="loader/tmt-queue.js loader/tmt-log.js loader/tmt-templates.js"
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
  out="$(node tools/harness/gates-tpl1.mjs --part "$part" --no-summary --no-write 2>&1)"
  restore
  printf '%s\n' "$out" > "$OUT/$name.txt"
  red="$(grep -a "^RED   $want" <<<"$out" | head -1)"
  if [ -n "$red" ]; then
    echo "KILLED   $name — $(cut -c1-300 <<<"$red")"; KILLED=$((KILLED+1))
  else
    echo "SURVIVED $name — required a red [$want]; got: $(grep -aE '^(RED|VERDICT)' <<<"$out" | head -3 | cut -c1-200 | tr '\n' '|')"; SURVIVED=$((SURVIVED+1))
  fi
}
rep() { printf "p='%s';s=open(p).read();o=%s;assert o in s,'mutation site gone';s=s.replace(o,%s,1);open(p,'w').write(s)" "$1" "$2" "$3"; }

# A — a hold LEAKS past its queue's end: finish() forgets to release, so the reflex stays held after the queue is done
mutant A-hold-leaks "$(rep loader/tmt-queue.js "'  function finish(Q, state, why) {\n    var n = releaseAll(Q);'" "'  function finish(Q, state, why) {\n    var n = 0;'")" runner 'R1 hold'
# B — a queue call replayed BETWEEN ticks: the replay's between() no longer leaves queue records to the queue's slot
mutant B-queue-call-between-ticks "$(rep loader/tmt-log.js "\"if (r.source === 'auto' || r.source === 'queue' || r.tick !== tick) return;\"" "\"if (r.source === 'auto' || r.tick !== tick) return;\"")" runner 'R5 replay'
# C — check SKIPS the rollback: it trusts the static formula's moment and does not play the plan on the copy, so its
#     "buy" queue waits for the field to reach the formula's peak and buys there, whatever the purse says
mutant C-no-confirmation "$(rep loader/tmt-templates.js "'      var c = playOnCopy(b, q, run.firstAffordable.k + 20);'" "'      if (stat.formulaPeakT !== null) { q.steps[1] = { \"do\": \"wait\", until: \"Number(\" + b.field + \") >= \" + stat.formulaPeakT, timeout: { gs: Math.ceil(stat.formulaPeakT) + 10 }, onTimeout: \"abort\" }; }\n      var c = { played: true, bought: true, at: { tick: run.firstAffordable.tick, field: run.firstAffordable.field } };'")" oracle 'O2 upg:q:22'
# D — check IGNORES the multiplier chain: a peak below 1 is planned as a long hold-and-buy anyway, so O1 emits a queue
mutant D-ignores-multiplier "$(rep loader/tmt-templates.js "\"      out.verdict = 'waiting-cannot-help';\"" "\"      out.verdict = 'buy-at'; out.tStar = { tick: run.peak.tick, field: run.peak.field, afterTicks: horizon }; out.queue = TPP.plan(b, out); return out;\"")" oracle 'O1 upg:q:23'
# E — a game id hardcoded in a template
mutant E-game-id-in-template "$(rep loader/tmt-templates.js "\"  var TPP = { id: 'time-priced-purchase'\"" "\"  var FAVOURITE = 'ptr';\n  var TPP = { id: 'time-priced-purchase'\"")" grep 'X1 no game or layer id'

echo "tpl1 mutants: $KILLED killed, $SURVIVED survived"
[ "$SURVIVED" -eq 0 ]
