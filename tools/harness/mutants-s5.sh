#!/usr/bin/env bash
# The S5 mutants — one per leg of gate L1 (tools/harness/link.mjs, docs/harness.md "Gate L1"). Each breaks one thing
# link mode promises, runs L1, and REQUIRES the leg that exists for it to go red. Other legs a mutant reddens are
# printed, not required (leg R judges every page, so a mutant that asks for a wrong URL is often seen twice).
#
#   tools/harness/mutants-s5.sh <out-dir> [name-filter]
#
# ⛔ It restores from COPIES taken at the start (never `git checkout`), and it refuses a dirty tree anyway: a mutant
# round must never be able to take uncommitted work with it.
set -uo pipefail
cd "$(dirname "$0")/../.."
OUT="${1:?usage: mutants-s5.sh <out-dir> [name-filter]}"
ONLY="${2:-}"
mkdir -p "$OUT"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then echo "REFUSING: the tree is dirty. Commit first."; exit 1; fi
FILES="loader/link.mjs loader/page.js"
for f in $FILES; do cp "$f" "$OUT/$(basename "$f").orig"; done
restore() { for f in $FILES; do cp "$OUT/$(basename "$f").orig" "$f"; done; }
trap restore EXIT
KILLED=0; SURVIVED=0

mutant() {  # mutant <name> <python> <required red legs…>
  local name="$1" mut="$2"; shift 2
  if [ -n "$ONLY" ] && [[ "$name" != *"$ONLY"* ]]; then return 0; fi
  restore
  python3 -c "$mut" || { echo "SURVIVED $name — THE MUTATION DID NOT APPLY"; SURVIVED=$((SURVIVED+1)); return; }
  local out; out="$(node tools/harness/link.mjs --json "$OUT/$name.json" 2>&1)"
  restore
  local red; red="$(grep -a '^L1 .*: RED$' <<<"$out" | sed -E 's/^L1 (.*): RED$/\1/' | tr '\n' ' ')"
  # a leg that THREW is not a kill: the legs fail by name (link.mjs `guard`), so an exception means the gate itself broke
  if grep -aq '"exception"' <<<"$out" || ! grep -aq '^L1 link: ' <<<"$out"; then
    echo "THREW    $name — $(grep -a -m1 'exception' <<<"$out" | head -c 300)"; SURVIVED=$((SURVIVED+1)); return; fi
  local miss=() want
  for want in "$@"; do [[ " $red " == *" $want "* ]] || miss+=("$want"); done
  if [ ${#miss[@]} -eq 0 ]; then echo "KILLED   $name — red: [${red% }] (required: $*)"; KILLED=$((KILLED+1))
  else echo "SURVIVED $name — red: [${red:-none}], required [$*]"; SURVIVED=$((SURVIVED+1)); fi
}
rep() { printf "p='%s';s=open(p).read();o=%s;assert o in s,'mutation site gone';s=s.replace(o,%s);open(p,'w').write(s)" "$1" "$2" "$3"; }

mutant A-pages-base-drops-the-repo "$(rep loader/link.mjs "'\`https://\${host}/\${name}/\`'" "'\`https://\${host}/\`'")" S-pages
mutant B-cdn-at-a-branch "$(rep loader/link.mjs "'\`\${CDN}\${owner}/\${name}@\${commit}/\`'" "'\`\${CDN}\${owner}/\${name}@main/\`'")" S-cdn
mutant C-source-not-forced "$(rep loader/link.mjs "'  if (force) return [force];\n'" "''")" S-hosted
mutant D-cdn-before-pages-unpinned "$(rep loader/link.mjs "\"pinned ? ['cdn', 'hosted', 'pages'] : ['pages', 'cdn', 'hosted']\"" "\"pinned ? ['cdn', 'hosted', 'pages'] : ['cdn', 'pages', 'hosted']\"")" F-order
mutant E-oversize-ignored "$(rep loader/link.mjs "'          if (rest.includes(\\'hosted\\')) throw new LinkError(what);\n'" "''")" F-oversize
mutant F-latest-not-cached "$(rep loader/link.mjs "'  if (c && COMMIT.test(c)) return { commit: c, cached: true };\n'" "''")" A-api
mutant G-listed-id-not-kept "$(rep loader/link.mjs "'  if (k) return { id: k.id'" "'  if (false) return { id: k.id'")" K-save
mutant H-vendor-not-swapped "$(rep loader/link.mjs "'    const v = vendorFor(u, vendorIndex);'" "'    const v = null;'")" U-unknown
mutant I-declined-not-shown "$(rep loader/link.mjs "'  if (d) {\n'" "'  if (false) {\n'")" D-declined
mutant J-author-table-ignored "$(rep loader/link.mjs "\"  if (!file || typeof file !== 'object' || file.autoTable === undefined) return null;\"" "'  return null;'")" J-settings
mutant K-link-page-drops-the-bar "$(rep loader/page.js "\"  T.tableFrom = r.table ? 'author' : table ? 'loader' : 'derived';\n\"" "\"  T.tableFrom = r.table ? 'author' : table ? 'loader' : 'derived';\n  T.navbar = false;\n\"")" X-attach
mutant L-no-plain-words-on-failure "$(rep loader/page.js "\"T.step === 'link' ? 'this game could not be opened' :\"" "\"T.step === 'link' ? 'error' :\"")" E-errors
mutant M-settings-read-outside-the-source "$(rep loader/link.mjs "\"  const url = new URL('tmt-loader.json', base).href;\"" "\"  const url = new URL('../tmt-loader.json', base).href;\"")" R-requests

echo "S5 mutants: $KILLED killed, $SURVIVED survived"
[ "$SURVIVED" -eq 0 ]
