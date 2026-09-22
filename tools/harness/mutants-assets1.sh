#!/usr/bin/env bash
# assets-1 mutants — each must turn its gate RED. Runs in a THROWAWAY worktree at HEAD (mutants there may commit),
# so the tree you run it from is never touched; the worktree is removed at the end.
#   tools/harness/mutants-assets1.sh            (needs the repo's .venv with Pillow for M1, Playwright for M3)
# M1 the encoder DOWNSCALES              → media.mjs --write refuses (DIMENSIONS CHANGED), originals restored
# M2 a `git subtree pull` restores an image and an audio original (committed) → media.mjs RED, check-manifest RED
# M3 an audio stub is a 404 instead      → G1 (page.mjs --gate load) RED
# M4 a CODE file / a LICENCE is edited   → check-manifest `games pristine` RED (the exception is media only)
# M5 the CI media step is deleted        → loader/workflows.test.mjs RED
set -u
REPO=$(cd "$(dirname "$0")/../.." && pwd)
WT=$(mktemp -d "${TMPDIR:-/tmp}/assets1-mutants-XXXXXX")
git -C "$REPO" worktree add --detach -q "$WT" HEAD
ln -s "$REPO/node_modules" "$WT/node_modules"
export TMT_PYTHON="$REPO/.venv/bin/python3"
cd "$WT"
git config user.name "assets1 mutants"; git config user.email "mutants@localhost"
pass=0; fail=0
verdict() { if [ "$2" = red ]; then echo "KILLED  $1"; pass=$((pass+1)); else echo "SURVIVED $1 — $3"; fail=$((fail+1)); fi; }
original() { # <id> <rel> → the upstream bytes, from the subtree squash commit
  local sq; sq=$(git log --format=%H --grep="^Squashed 'games/$1/' content from commit" -n 1)
  git show "$sq:$2" > "games/$1/$2"
}

# M1 — downscale
for f in discord.png options_wheel.png remove.png resources/genericParticle.png; do original the-danus-tree "$f"; done
out=$(TMT_MEDIA_MUTANT=downscale node tools/media.mjs --write --jobs 1 the-danus-tree 2>&1); st=$?
restored=$(git status --porcelain games/the-danus-tree | wc -l)
if [ $st -ne 0 ] && grep -q "DIMENSIONS CHANGED" <<<"$out" && [ "$restored" = 4 ]; then verdict "M1 downscale (exit $st, 4 originals left in place, not a halved WebP)" red; else verdict M1 green "exit $st, $restored files differ: $out"; fi
git checkout -q HEAD -- games/the-danus-tree

# M2 — a subtree pull restores originals (COMMITTED, as a pull would)
original ptr images/achs/11.png; original the-jax-tree resources/song/layer1.ogg
git commit -qam "mutant: a pull restored two originals"
node tools/media.mjs ptr the-jax-tree > m2.txt 2>&1; st=$?
cm=$(node tools/harness/check-manifest.mjs ptr 2>&1 | tail -1)
if [ $st -ne 0 ] && grep -q "ptr/images/achs/11.png" m2.txt && grep -q "the-jax-tree/resources/song/layer1.ogg" m2.txt; then verdict "M2a media check names both restored originals (exit $st)" red; else verdict M2a green "$(tail -3 m2.txt)"; fi
if grep -q "ptr=RED" <<<"$cm" && node tools/harness/check-manifest.mjs ptr 2>/dev/null | grep -q '"games pristine (media)"'; then verdict "M2b check-manifest ptr RED on games pristine (media)" red; else verdict M2b green "$cm"; fi
git reset -q --hard HEAD~1

# M3 — a stub that is a 404 (sorbet requests its only sound at load: `let sounds = [new Audio("Sounds/TouchGoop.ogg")]`)
git rm -q games/sorbet-s-convolution-mainframe/Sounds/TouchGoop.ogg
node tools/harness/page.mjs sorbet-s-convolution-mainframe --gate load > m3.txt 2>&1; st=$?
if [ $st -ne 0 ] && grep -qi "TouchGoop" m3.txt; then verdict "M3 G1 RED on the 404 (exit $st)" red; else verdict M3 green "exit $st: $(tail -3 m3.txt)"; fi
git reset -q --hard HEAD

# M4 — the exception is MEDIA ONLY: a code edit and a licence edit are each `games pristine`
echo "// mutant" >> games/ptr/js/mod.js; git commit -qam "mutant: a code edit"
if node tools/harness/check-manifest.mjs ptr 2>/dev/null | grep -q '"notMedia":\[{"status":"M","rel":"js/mod.js"}'; then verdict "M4a code edit → games pristine (notMedia js/mod.js)" red; else verdict M4a green "$(node tools/harness/check-manifest.mjs ptr 2>&1 | tail -2)"; fi
git reset -q --hard HEAD~1
echo "mutant" >> games/ptr/LICENSE; git commit -qam "mutant: a licence edit"
if node tools/harness/check-manifest.mjs ptr 2>/dev/null | grep -q '"rel":"LICENSE"'; then verdict "M4b licence edit → games pristine (notMedia LICENSE)" red; else verdict M4b green "$(node tools/harness/check-manifest.mjs ptr 2>&1 | tail -2)"; fi
git reset -q --hard HEAD~1

# M5 — the CI step deleted
python3 - <<'EOF'
p='.github/workflows/sweep.yml'; s=open(p).read()
i=s.index('      - name: Media — every image WebP'); j=s.index('\n\n', i)
open(p,'w').write(s[:i]+s[j+2:])
EOF
if ! node --test loader/workflows.test.mjs > m5.txt 2>&1 && grep -q "node tools/media.mjs" m5.txt; then verdict "M5 CI media step deleted → workflows.test RED" red; else verdict M5 green "$(grep -E '^# (pass|fail)' m5.txt)"; fi
git checkout -q HEAD -- .github

cd "$REPO"
git worktree remove --force "$WT"
echo "mutants-assets1: $pass killed, $fail survived"
[ $fail -eq 0 ]
