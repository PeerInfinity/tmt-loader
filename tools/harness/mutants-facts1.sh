#!/usr/bin/env bash
# The facts-1 mutants — each breaks one promise of the facts extractor (docs/facts.md) and REQUIRES the gate that can
# see it to go red (gates-facts1.mjs): the oracle (a §7 row, against facts regenerated WITH the mutant), neutrality,
# or the grep.
#
#   tools/harness/mutants-facts1.sh <out-dir> [name-filter]
#
# ⛔ It restores from COPIES taken at the start (never `git checkout`), and it refuses a dirty tree anyway: a mutant
# round must never be able to take uncommitted work with it.
set -uo pipefail
cd "$(dirname "$0")/../.."
OUT="${1:?usage: mutants-facts1.sh <out-dir> [name-filter]}"
ONLY="${2:-}"
mkdir -p "$OUT"
OUT="$(cd "$OUT" && pwd)"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then echo "REFUSING: the tree is dirty. Commit first."; exit 1; fi
FILES="loader/tmt-planner.js tools/harness/facts.mjs"
for f in $FILES; do cp "$f" "$OUT/$(basename "$f").orig"; done
restore() { for f in $FILES; do cp "$OUT/$(basename "$f").orig" "$f"; done; }
trap restore EXIT
KILLED=0; SURVIVED=0

# mutant <name> <python> <part: oracle:<kind>|neutral|grep> <the red row's gate text>
mutant() {
  local name="$1" mut="$2" part="$3" want="$4"
  if [ -n "$ONLY" ] && [[ "$name" != *"$ONLY"* ]]; then return 0; fi
  restore
  python3 -c "$mut" || { echo "SURVIVED $name — THE MUTATION DID NOT APPLY"; SURVIVED=$((SURVIVED+1)); return; }
  local out red
  case "$part" in
    oracle:*)
      local kind="${part#oracle:}"
      rm -rf "$OUT/$name-facts"
      out="$(node tools/harness/facts.mjs ptr --kinds "$kind" --out "$OUT/$name-facts" --jobs 8 2>&1)"
      out="$out"$'\n'"$(node tools/harness/gates-facts1.mjs --part oracle --kinds "$kind" --facts "$OUT/$name-facts" --no-summary --no-write 2>&1)";;
    *) out="$(node tools/harness/gates-facts1.mjs --part "$part" --no-summary --no-write 2>&1)";;
  esac
  restore
  printf '%s\n' "$out" > "$OUT/$name.txt"
  red="$(grep -a "^RED   $want" <<<"$out" | head -1)"
  if [ -n "$red" ]; then
    echo "KILLED   $name — $(cut -c1-260 <<<"$red")"; KILLED=$((KILLED+1))
  else
    echo "SURVIVED $name — required a red [$want]; got: $(grep -aE '^(RED|FAILED|VERDICT)' <<<"$out" | head -3 | cut -c1-200 | tr '\n' '|')"; SURVIVED=$((SURVIVED+1))
  fi
}
rep() { printf "p='%s';s=open(p).read();o=%s;assert o in s,'mutation site gone';s=s.replace(o,%s,1);open(p,'w').write(s)" "$1" "$2" "$3"; }

# A — the exponent probe returns a CONSTANT: every price reads the same shape, so q23's 5.4 is gone
mutant A-exponent-constant "$(rep loader/tmt-planner.js "'    var s = fitShape(pts);\n    if (errors)'" "\"    var s = { type: 'power', exponent: 1, offset: 0, coef: '1e0' };\n    if (errors)\"")" oracle:price 'O1 price q23'
# B — zeroed-by ignores rowReset's cascade: only the resetting layer's OWN doReset runs, so ss (whose doReset never
#     touches q) drops out of q.time's resets
mutant B-no-rowreset-cascade "$(rep loader/tmt-planner.js "'        need(\'doReset\')(l, prep.force);\n      } catch'" "'        if (typeof layers[l].doReset === \'function\') layers[l].doReset(l);\n      } catch'")" oracle:zeroed-by 'O3 zeroed-by player.q.time'
# C — the sensitivity probe never ENTERS the challenge, and claims it did: the inside readings are the outside ones
mutant C-never-enters "$(rep loader/tmt-planner.js "'      need(\'startChallenge\')(l, id);\n      need(\'updateTemp\')();\n      var entered = String(player[l].activeChallenge) === String(id);'" "'      need(\'updateTemp\')();\n      var entered = true;'")" oracle:challenge-inputs 'O6 challenge-inputs H22'
# D — a probe that LEAKS state: the exponent probe leaves the perturbed field at the grid's last value
mutant D-leaks-state "$(rep loader/tmt-planner.js "'    } finally { setPath(path, saved); if (opts.settle)'" "'    } finally { if (opts.settle)'")" neutral 'N1 live state untouched'
# E — a game id hardcoded in the tool
mutant E-game-id-in-tool "$(rep tools/harness/facts.mjs "'export const GENERATOR_VERSION = 1;'" "\"export const GENERATOR_VERSION = 1;\nconst FAVOURITE = 'ptr';\"")" grep 'X1 no game or layer id'

echo "facts-1 mutants: $KILLED killed, $SURVIVED survived"
[ "$SURVIVED" -eq 0 ]
