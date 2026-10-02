#!/usr/bin/env bash
# The shipq mutants — each breaks one promise of the slice (a template's start condition carries no number read off the
# state; `each` cannot loop on a flickering condition; a shipped queue is never written into the player's own store; every
# run of a re-armed queue releases its holds; no game id in the generic code) and REQUIRES the gate row that can see it to
# go red (gates-shipq.mjs).
#
#   tools/harness/mutants-shipq.sh <out-dir> [name-filter]
#
# ⛔ It restores from COPIES taken at the start (never `git checkout`), and it refuses a dirty tree anyway: a mutant
# round must never be able to take uncommitted work with it.
set -uo pipefail
cd "$(dirname "$0")/../.."
OUT="${1:?usage: mutants-shipq.sh <out-dir> [name-filter]}"
ONLY="${2:-}"
mkdir -p "$OUT"
OUT="$(cd "$OUT" && pwd)"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then echo "REFUSING: the tree is dirty. Commit first."; exit 1; fi
FILES="loader/tmt-templates.js loader/tmt-queue.js loader/tmt-auto.js games-auto/ptr.json"
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
# mutant <name> <python> <part> <the red row's gate text>
mutant() {
  local name="$1" mut="$2" part="$3" want="$4"
  if [ -n "$ONLY" ] && [[ "$name" != *"$ONLY"* ]]; then return 0; fi
  restore
  python3 -c "$mut" || { echo "SURVIVED $name — THE MUTATION DID NOT APPLY"; SURVIVED=$((SURVIVED+1)); return; }
  local out
  out="$(node tools/harness/gates-shipq.mjs --part "$part" --no-write 2>&1)"
  restore
  if verdictOf "$name" "$out" "$want"; then KILLED=$((KILLED+1)); else SURVIVED=$((SURVIVED+1)); fi
}

# A — the template's `when` carries a number read off the state it was written at (the game clock there)
mutant A-when-baked-literal "$(rep loader/tmt-templates.js "\"    return conditional(q, when, b.hold);\"" "\"    return conditional(q, when + ' && player.timePlayed >= ' + Math.floor(Number(player.timePlayed)), b.hold);\"")" tpl 'T2 every template-written queue'
# B — \`each\` with no cool-off: a run may start the moment the condition turns true again
mutant B-each-no-cooloff "$(rep loader/tmt-queue.js "'      if (Q.coolUntil !== null && t < Q.coolUntil) continue;      // the cool-off since the last run ended'" "''")" rearm 'R2 `each`'
# C — a shipped queue written into the player's own store (the editor's key) when it is loaded
mutant C-shipped-into-store "$(rep loader/tmt-queue.js "'      loaded.push(Q);\n      setLast(Q, \\'shipped with the game'" "'      loaded.push(Q);\n      try { T.storage.raw.setItem.call(localStorage, T.storage.prefix + \\'queues\\', JSON.stringify({ format: \\'tmt-queue-store/1\\', queues: [{ enabled: true, queue: Q.q }] })); } catch (e) { /* */ }\n      setLast(Q, \\'shipped with the game'")" page 'PG the au tab'
# D — a hold NOT released when a re-armed queue's run ends (it would be carried into the next run)
mutant D-hold-kept-on-rearm "$(rep loader/tmt-queue.js "'  function finish(Q, state, why) {\n    var n = releaseAll(Q);'" "'  function finish(Q, state, why) {\n    var n = Q.rearm === \\'each\\' ? 0 : releaseAll(Q);'")$(printf ';')$(rep loader/tmt-queue.js "'    Q.holds = {};\n    Q.state = \\'armed\\'; Q.pc = 0;'" "'    Q.state = \\'armed\\'; Q.pc = 0;'")" rearm 'R2 `each`'
# E — a game id in the generic code
mutant E-game-id-in-runner "$(rep loader/tmt-queue.js "'  function loopStart() {'" "'  function loopStart() {\n    var FAVOURITE = \\'ptr\\';'")" grep 'X1 no game'

echo "shipq mutants: $KILLED killed, $SURVIVED survived"
[ "$SURVIVED" -eq 0 ]
