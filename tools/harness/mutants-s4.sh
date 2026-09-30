#!/usr/bin/env bash
# The S4 mutants — one per leg of gate E1 (tools/harness/embed.mjs, docs/harness.md "Gate E1"). Each breaks one thing
# embed mode promises, runs E1 on one game, and REQUIRES the leg that exists for it to go red. The other legs a mutant
# reddens are printed, not required: several legs share a page (vii judges every page's requests), so a mutant that
# breaks one rule is often seen twice — that is the gate working, not a contaminated run.
#
#   tools/harness/mutants-s4.sh <out-dir> [name-filter]
#
# ⛔ It restores from COPIES taken at the start (never `git checkout`), and it refuses a dirty tree anyway: a mutant
# round must never be able to take uncommitted work with it.
set -uo pipefail
cd "$(dirname "$0")/../.."
OUT="${1:?usage: mutants-s4.sh <out-dir> [name-filter]}"
ONLY="${2:-}"
mkdir -p "$OUT"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then echo "REFUSING: the tree is dirty. Commit first."; exit 1; fi
FILES="loader/flags.mjs loader/embed.mjs loader/attach.mjs loader/options.js"
for f in $FILES; do cp "$f" "$OUT/$(basename "$f").orig"; done
restore() { for f in $FILES; do cp "$OUT/$(basename "$f").orig" "$f"; done; }
trap restore EXIT
LEGS="i-inert ii-author-defaults iii-not-loaded iv-press-remembered v-url-first vi-settings-file M-layout O-options vii-requests"
KILLED=0; SURVIVED=0

mutant() {  # mutant <name> <game> <python> <required red legs…>
  local name="$1" game="$2" mut="$3"; shift 3
  if [ -n "$ONLY" ] && [[ "$name" != *"$ONLY"* ]]; then return 0; fi
  restore
  python3 -c "$mut" || { echo "SURVIVED $name — THE MUTATION DID NOT APPLY"; SURVIVED=$((SURVIVED+1)); return; }
  local line; line="$(node tools/harness/embed.mjs "$game" --json "$OUT/$name.json" 2>&1 | grep -a "^E1 $game:" || true)"
  restore
  local red=() leg
  for leg in $LEGS; do grep -q -- " $leg=ok" <<<"$line" || red+=("$leg"); done
  local miss=() want
  for want in "$@"; do [[ " ${red[*]:-} " == *" $want "* ]] || miss+=("$want"); done
  if [ -z "$line" ] || [[ "$line" == *EXCEPTION* ]]; then red=("(the row threw)"); fi
  if [ ${#miss[@]} -eq 0 ] && [[ "$line" == *RED* ]]; then echo "KILLED   $name — red: [${red[*]}] (required: $*)"; KILLED=$((KILLED+1))
  else echo "SURVIVED $name — red: [${red[*]:-none}], required [$*]"; echo "         $line"; SURVIVED=$((SURVIVED+1)); fi
}
rep() { printf "p='%s';s=open(p).read();o=%s;assert o in s,'mutation site gone';s=s.replace(o,%s);open(p,'w').write(s)" "$1" "$2" "$3"; }

mutant A-not-loaded-ignored ptr "$(rep loader/flags.mjs "\"    if (!S.load[name]) return { on: false, source: 'absent' };\"" "''")" iii-not-loaded
mutant B-author-default-ignored ptr "$(rep loader/flags.mjs "\"    if (S.on[name]) return { on: true, source: 'author' };\"" "''")" ii-author-defaults
mutant C-player-off-not-remembered ptr "$(rep loader/embed.mjs "'serializePrefs(prefs, { keepFalse: true })'" "'serializePrefs(prefs)'")" iv-press-remembered
mutant D-url-ignored-on-embed ptr "$(rep loader/flags.mjs "\"    if (!S.load[name]) return { on: false, source: 'absent' };\n    if (params && params.has(name))\"" "\"    if (!S.load[name]) return { on: false, source: 'absent' };\n    if (false && params && params.has(name))\"")" v-url-first
mutant E-file-does-not-beat-tag ptr "$(rep loader/flags.mjs "'if (file.on !== undefined) {'" "'if (file.on !== undefined && dataset.on === undefined) {'")" vi-settings-file
mutant F-author-table-ignored ptr "$(rep loader/embed.mjs "'if (T.automation && S.table !== undefined) {'" "'if (false) {'")" vi-settings-file
mutant G-bar-css-always ptr "$(rep loader/attach.mjs "'  if (T.navbar) { sheet('" "'  if (true) { sheet('")" i-inert
mutant H-loader-data-without-an-id ptr "$(rep loader/attach.mjs "\"    if (id) {\n      step('currency data games-data/index.json');\"" "\"    if (true) {\n      step('currency data games-data/index.json');\"")" vii-requests
mutant I-every-button-drawn ptr "$(rep loader/options.js "'var ENTRIES = ALL.filter(function (e) { return !T.flagsLoaded || T.flagsLoaded[e.flag]; });'" "'var ENTRIES = ALL.slice();'")" iii-not-loaded
mutant J-home-link-on-author-page ptr "$(rep loader/options.js "'if (EMBED) section.append(head, table, noteEl);'" "'if (false) section.append(head, table, noteEl);'")" O-options
mutant K-no-mobile-class-on-embed ptr "$(rep loader/attach.mjs "\"    document.documentElement.classList.add('tmt-mobile');\n\"" "''")" ii-author-defaults M-layout
# the TIMING: the extras inserted when the tag runs, not when the page's own load fires — on the 2.7 game, whose mod
# files load ASYNC (js/technical/loader.js). Which legs this reddens is measured, not predicted: the row must be RED.
mutant L-attach-before-the-page-loaded something "$(rep loader/embed.mjs "'    await entry.loaded();\n'" "''")"

echo "S4 mutants: $KILLED killed, $SURVIVED survived"
[ "$SURVIVED" -eq 0 ]
