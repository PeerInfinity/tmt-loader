#!/usr/bin/env bash
# The m31 mutants — each breaks one promise of the slice (facts past q33: H31's goal read over its own completion limit,
# H31's budget found behind a short-circuit, `unlocked()` read as the engine does; the reset-requirement REBUILD; no game
# id in generic code) and REQUIRES the gate that can see it to go red (gates-m31.mjs).
#
#   tools/harness/mutants-m31.sh <out-dir> [name-filter]
#
# A facts mutant regenerates only what it touches, into <out-dir>/<name>-facts (ptr at the declared stages/M30 for the
# kinds it names; collection-of-everything whole, it is one state), and the facts part reads that directory (--facts).
# ⛔ It restores from COPIES taken at the start (never `git checkout`), and it refuses a dirty tree anyway: a mutant
# round must never be able to take uncommitted work with it.
set -uo pipefail
cd "$(dirname "$0")/../.."
OUT="${1:?usage: mutants-m31.sh <out-dir> [name-filter]}"
ONLY="${2:-}"
mkdir -p "$OUT"
OUT="$(cd "$OUT" && pwd)"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then echo "REFUSING: the tree is dirty. Commit first."; exit 1; fi
FILES="loader/tmt-planner.js loader/tmt-templates.js"
for f in $FILES; do cp "$f" "$OUT/$(basename "$f").orig"; done
restore() { for f in $FILES; do cp "$OUT/$(basename "$f").orig" "$f"; done; }
trap restore EXIT
KILLED=0; SURVIVED=0
rep() { printf "p='%s';s=open(p).read();o=%s;assert o in s,'mutation site gone';s=s.replace(o,%s);open(p,'w').write(s)" "$1" "$2" "$3"; }
verdictOf() { # <name> <out> <want> — KILLED when a RED row starts with <want>
  local name="$1" out="$2" want="$3" red
  printf '%s\n' "$out" > "$OUT/$name.txt"
  red="$(grep -a "^RED   $want" <<<"$out" | head -1)"
  if [ -n "$red" ]; then echo "KILLED   $name — $(cut -c1-400 <<<"$red")"; return 0; fi
  echo "SURVIVED $name — required a red [$want]; got: $(grep -aE '^(RED|VERDICT)' <<<"$out" | head -3 | cut -c1-200 | tr '\n' '|')"; return 1
}
# mutant <name> <python> <part: facts:<kinds>|verdict|stage|grep> <the red row's gate text>
mutant() {
  local name="$1" mut="$2" part="$3" want="$4"
  if [ -n "$ONLY" ] && [[ "$name" != *"$ONLY"* ]]; then return 0; fi
  restore
  python3 -c "$mut" || { echo "SURVIVED $name — THE MUTATION DID NOT APPLY"; SURVIVED=$((SURVIVED+1)); return; }
  local out
  case "$part" in
    facts:*)
      local kinds="${part#facts:}" d="$OUT/$name-facts"
      rm -rf "$d"
      out="$(node tools/harness/facts.mjs ptr --from tools/harness/snapshots/ptr/stages/M30.json --kinds "$kinds" --out "$d" --jobs 4 2>&1)"
      out="$out"$'\n'"$(node tools/harness/facts.mjs collection-of-everything --out "$d" 2>&1)"
      out="$out"$'\n'"$(node tools/harness/gates-m31.mjs --part facts --facts "$d" --no-write 2>&1)";;
    *) out="$(node tools/harness/gates-m31.mjs --part "$part" --no-write 2>&1)";;
  esac
  restore
  if verdictOf "$name" "$out" "$want"; then KILLED=$((KILLED+1)); else SURVIVED=$((SURVIVED+1)); fi
}
# A — the completions probe UNBOUNDED (the grid runs to 1e6 past H31's completion limit): its softcap at 20 reads irregular
mutant A-completions-unbounded "$(rep loader/tmt-planner.js "'var so = tr.numeric[r] === own && isFinite(lim) ?'" "'var so = false && tr.numeric[r] === own && isFinite(lim) ?'")" facts:price 'D2 (O2)'
# B — `undefined` read as UNLOCKED again (v !== false): H32 is entered where the engine hides it, and collection-of-
#     everything's `if (cond) return true` items are priced at fresh
mutant B-undefined-is-unlocked "$(rep loader/tmt-planner.js "'    if (!threw) return !!v;'" "'    if (!threw) return v !== false;'")" facts:price,challenge-inputs,exits-challenge 'D4 itemUnlocked'
# E — canAfford NOT re-traced once affordable: `price && budget` short-circuits and H31's budget counter is never read
mutant E-budget-not-retraced "$(rep loader/tmt-planner.js "'        var tr2 = traceReads(aff);'" "'        var tr2 = { error: true };'")" facts:purchase-budget 'D3 (O7)'
# D — the rebuild's "the reset happened" reads `unlocked` (true before the reset): the copy calls it done on the first tick
mutant D-rebuild-done-reads-unlocked "$(rep loader/tmt-templates.js "'if (!b.rebuild) return !!p.unlocked;'" "'return !!p.unlocked;'")" verdict 'V4 the REBUILD'
# F — a layer that STARTS unlocked read as a rebuild (no startData check): ptr's p opens at a fresh game
mutant F-starts-unlocked-is-rebuild "$(rep loader/tmt-templates.js "'var rebuild = unl && !startsUnl && ozf.length > 0;'" "'var rebuild = unl && ozf.length > 0;'")" verdict 'V5 the extension'
# C — a game id in the template's generic code
mutant C-game-id-in-template "$(rep loader/tmt-templates.js "'  function rrDoneExpr(b) {'" "'  function rrDoneExpr(b) {\n    var FAVOURITE = \\'ptr\\';'")" grep 'X1 no game or layer id'

echo "m31 mutants: $KILLED killed, $SURVIVED survived"
[ "$SURVIVED" -eq 0 ]
