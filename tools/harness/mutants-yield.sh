#!/usr/bin/env bash
# The yield mutants — each breaks one promise of the yield rule (yield in the slot, never in the fallback, say where,
# no game id) and REQUIRES the gate that can see it to go red (gates-yield.mjs).
#
#   tools/harness/mutants-yield.sh <out-dir> [name-filter]
#
# ⛔ It restores from COPIES taken at the start (never `git checkout`), and it refuses a dirty tree anyway: a mutant
# round must never be able to take uncommitted work with it.
set -uo pipefail
cd "$(dirname "$0")/../.."
OUT="${1:?usage: mutants-yield.sh <out-dir> [name-filter]}"
ONLY="${2:-}"
mkdir -p "$OUT"
OUT="$(cd "$OUT" && pwd)"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then echo "REFUSING: the tree is dirty. Commit first."; exit 1; fi
FILES="loader/tmt-auto.js"
for f in $FILES; do cp "$f" "$OUT/$(basename "$f").orig"; done
restore() { for f in $FILES; do cp "$OUT/$(basename "$f").orig" "$f"; done; }
trap restore EXIT
KILLED=0; SURVIVED=0
rep() { printf "p='%s';s=open(p).read();o=%s;assert s.count(o)==1,'mutation site gone';s=s.replace(o,%s);open(p,'w').write(s)" "$1" "$2" "$3"; }
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
  out="$(node tools/harness/gates-yield.mjs --part "$part" --no-write 2>&1)"
  restore
  if verdictOf "$name" "$out" "$want"; then KILLED=$((KILLED+1)); else SURVIVED=$((SURVIVED+1)); fi
}
SITE="'    if (curRun.layer === l) return curRun.via === \\'slot\\';'"
# A — the fix applied in the SLOT too (never yield where the engine has just reset the layer): a DOUBLE RESET where the
#     engine's reset leaves the reset allowed. Measured: NOT on ptr (C2 stays green — b, g, s, t, sb are reset by the
#     engine first and `canReset` is false by the time the slot decides), but on the vanilla legs (my-first-tree's `a`,
#     the-number-tree's `F`: the engine resets, the reset is still allowed, the loader resets again) — C3's one hash
#     breaks, and the stub units (C4) see the extra reset by count
mutant A-fix-in-the-slot-too "$(rep loader/tmt-auto.js "$SITE" "'    if (curRun.layer === l) return false;'")" control 'C3 VANILLA engines'
# B — the fallback still yields (the defect, under the fix's own option): sg never resets from the wall
mutant B-fallback-still-yields "$(rep loader/tmt-auto.js "$SITE" "'    if (curRun.layer === l) return true;'")" fix 'Y1 the FIX'
# C — the reason no longer says where it yielded
mutant C-reason-says-nothing "$(rep loader/tmt-auto.js "\"'yielding:native', values: { layer: l, at: curRun.via } };\n    }\"" "\"'yielding:native', values: { layer: l } };\n    }\"")" defect 'D2 the same with stages=off'
# D — a game id in the rule's generic code
mutant D-game-id-in-the-rule "$(rep loader/tmt-auto.js "'  function nativeAutoHere(l) {'" "'  function nativeAutoHere(l) {\n    var FAVOURITE = \\'ptr\\';'")" grep 'X1 no game id'

echo "yield mutants: $KILLED killed, $SURVIVED survived"
[ "$SURVIVED" -eq 0 ]
