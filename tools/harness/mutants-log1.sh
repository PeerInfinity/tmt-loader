#!/usr/bin/env bash
# The log-1 mutants — each breaks one promise of the state log (docs/log.md) and REQUIRES the gate that can see it to go
# red: the replay (gates-log1 part 2's `replay` row), transparency (its `transparent` row), or the unit suite
# (loader/log.test.mjs, by test name) where only a constructed case can reach the branch.
#
#   tools/harness/mutants-log1.sh <out-dir> [name-filter]
#
# ⛔ It restores from COPIES taken at the start (never `git checkout`), and it refuses a dirty tree anyway: a mutant
# round must never be able to take uncommitted work with it.
set -uo pipefail
cd "$(dirname "$0")/../.."
OUT="${1:?usage: mutants-log1.sh <out-dir> [name-filter]}"
ONLY="${2:-}"
mkdir -p "$OUT"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then echo "REFUSING: the tree is dirty. Commit first."; exit 1; fi
FILES="loader/tmt-log.js loader/tmt-auto.js loader/log-hooks.json"
for f in $FILES; do cp "$f" "$OUT/$(basename "$f").orig"; done
restore() { for f in $FILES; do cp "$OUT/$(basename "$f").orig" "$f"; done; }
trap restore EXIT
KILLED=0; SURVIVED=0

# mutant <name> <python> <gate: replay|transparent|unit> <required: a row id (game) or a unit test's name> [<text the red line must carry>]
mutant() {
  local name="$1" mut="$2" gate="$3" want="$4" carry="${5:-}"
  if [ -n "$ONLY" ] && [[ "$name" != *"$ONLY"* ]]; then return 0; fi
  restore
  python3 -c "$mut" || { echo "SURVIVED $name — THE MUTATION DID NOT APPLY"; SURVIVED=$((SURVIVED+1)); return; }
  local out red
  if [ "$gate" = unit ]; then
    out="$(node --test loader/log.test.mjs 2>&1)"
    red="$(grep -a "^not ok .* - $want" <<<"$out" | head -1)"
  else
    out="$(node tools/harness/gates-log1.mjs --part 2 --leg coe,something --no-summary --no-write 2>&1)"
    red="$(grep -a "^RED   log1-2 $gate $want" <<<"$out" | head -1)"
  fi
  restore
  printf '%s\n' "$out" > "$OUT/$name.txt"
  if [ -n "$red" ] && { [ -z "$carry" ] || grep -aq -- "$carry" <<<"$red"; }; then
    echo "KILLED   $name — $(cut -c1-260 <<<"$red")"; KILLED=$((KILLED+1))
  else
    echo "SURVIVED $name — required a red $gate row for [$want]${carry:+ carrying [$carry]}; got: $(grep -aE '^(RED|not ok)' <<<"$out" | head -3 | cut -c1-200 | tr '\n' '|')"; SURVIVED=$((SURVIVED+1))
  fi
}
rep() { printf "p='%s';s=open(p).read();o=%s;assert o in s,'mutation site gone';s=s.replace(o,%s,1);open(p,'w').write(s)" "$1" "$2" "$3"; }

# A — a hook removed from the DATA: the replay parts from the original, and names the entry point
mutant A-hook-removed "$(rep loader/log-hooks.json "'\"globals\": [\"doReset\", '" "'\"globals\": ['")" replay collection-of-everything 'resets / currencies: doReset'
# B — a wrong `source`: the automation's calls labelled `game`, so the replay never re-applies them
mutant B-wrong-source "$(rep loader/tmt-log.js "\"return auto !== null ? 'auto' : inLoop > 0 ? 'game' : 'player';\"" "\"return inLoop > 0 ? 'game' : auto !== null ? 'auto' : 'player';\"")" replay collection-of-everything
# C — `did` always true: a refused call is written instead of counted (the leg's own count of refused calls says so)
mutant C-did-always-true "$(rep loader/tmt-log.js "'    var did = json !== pre.json;'" "'    var did = true;'")" replay collection-of-everything refused
# D — a wrapper that SWALLOWS the original's throw (only a constructed throw reaches it)
mutant D-swallows-throw "$(rep loader/tmt-log.js "'      try { var r = orig.apply(this, arguments); ok = true; return r; }'" "'      try { var r = orig.apply(this, arguments); ok = true; return r; } catch (e) { return undefined; }'")" unit 'TRANSPARENT'
# E — a recorder that writes into `player`: the game hash with the log ON is no longer the hash with it OFF
mutant E-writes-player "$(rep loader/tmt-log.js "'    var json = gameJSON();\n    var did = json !== pre.json;'" "'    player.tmtLogged = (player.tmtLogged || 0) + 1;\n    var json = gameJSON();\n    var did = json !== pre.json;'")" transparent collection-of-everything hashGame
# F — the `toggles` kind's self-log dropped (its field write is the one automation action that is not a call)
mutant F-toggles-self-log-dropped "$(rep loader/tmt-auto.js "' if (logLink.exec !== null) logLink.exec.set(t.layer, t.field, true);'" "''")" unit 'the toggles kind'
# G — a replay that re-applies nothing (the gate would be vacuous without the calls)
mutant G-replay-applies-nothing "$(rep loader/tmt-log.js "'            ti++; applied++;\n            apply(q);'" "'            ti++; applied++;'")" replay collection-of-everything
# H — the automation core's replay slot never called: the automation's calls have no slot to go in
mutant H-no-replay-slot "$(rep loader/tmt-auto.js "'    if (logLink.replay !== null) logLink.replay(l, via);\n'" "''")" replay collection-of-everything
# I — a record that is not the OUTERMOST call (a nested one written too): the replay re-applies it twice
mutant I-nested-recorded "$(rep loader/tmt-log.js "'      if (!on || depth > 0) return orig.apply(this, arguments);'" "'      if (!on) return orig.apply(this, arguments);'")" unit 'TRANSPARENT'

echo "log-1 mutants: $KILLED killed, $SURVIVED survived"
[ "$SURVIVED" -eq 0 ]
