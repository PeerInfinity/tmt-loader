// games/ is a SUBMODULE — the tmt-loader-games repository (since the repository split, 2026-09-29). The two tools that
// WRITE game files (add-game.mjs, media.mjs) commit their changes THERE, and this module is what they share for it.
//
// The order is the standing gitlink rule, and it has two commits in two repositories:
//   1. a commit INSIDE games/ (this module makes it);
//   2. that commit pushed to tmt-loader-games' default branch (the operator does it — no tool here pushes);
//   3. ONLY THEN the loader commit that moves the `games` gitlink, together with the loader-side files that describe the
//      change (manifests/, games-pristine/, the media skips file, …). A gitlink to a commit the games remote does not
//      have breaks every clone and every CI checkout of the loader.
// So the tools stop after step 1 and print steps 2–3 (`nextSteps`).
//
// ⚠ An UNINITIALISED submodule is an empty directory, and `git -C games …` there walks UP to the loader repository and
// answers for it. Every question below checks the toplevel first.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { REPO } from './harness/lib.mjs';

export const GAMES_PATH = 'games';

const run = (cwd, args) => execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const tryRun = (cwd, args) => { try { return run(cwd, args); } catch { return null; } };

/** Where the games live, and what state that checkout is in. */
export function gamesState({ repo = REPO } = {}) {
  const dir = path.join(repo, GAMES_PATH);
  const top = fs.existsSync(dir) ? tryRun(dir, ['rev-parse', '--show-toplevel']) : null;
  const initialised = !!top && fs.realpathSync(top) === fs.realpathSync(dir);
  const pin = tryRun(repo, ['rev-parse', `HEAD:${GAMES_PATH}`]);
  if (!initialised) return { dir, initialised, pin, head: null, branch: null, dirty: null };
  return {
    dir, initialised, pin,
    head: run(dir, ['rev-parse', 'HEAD']),
    branch: tryRun(dir, ['symbolic-ref', '--short', '-q', 'HEAD']),
    dirty: run(dir, ['status', '--porcelain', '--untracked-files=no']),
  };
}

/**
 * Refuses (throws, naming the fix) unless games/ can take a commit: initialised, on a BRANCH (a commit on a detached
 * HEAD — which is what `git submodule update` leaves — is one checkout away from lost), no tracked changes, and at the
 * pinned commit or ahead of it (an earlier run's unpushed commits).
 */
export function assertGamesWritable({ repo = REPO } = {}) {
  const s = gamesState({ repo });
  if (!s.initialised) throw new Error(`${GAMES_PATH}/ is not an initialised submodule — run: git submodule update --init ${GAMES_PATH}`);
  if (!s.branch) throw new Error(`${GAMES_PATH}/ is on a detached HEAD (${s.head.slice(0, 9)}) — put it on a branch first: git -C ${GAMES_PATH} switch main && git -C ${GAMES_PATH} merge --ff-only ${s.head.slice(0, 9)}`);
  if (s.dirty) throw new Error(`${GAMES_PATH}/ has tracked changes — commit or restore them first:\n${s.dirty}`);
  if (s.pin && s.head !== s.pin && tryRun(s.dir, ['merge-base', '--is-ancestor', s.pin, s.head]) === null) {
    throw new Error(`${GAMES_PATH}/ HEAD ${s.head.slice(0, 9)} is not the commit the loader pins (${s.pin.slice(0, 9)}) nor ahead of it`);
  }
  return s;
}

/**
 * Game files are stored BYTE-EXACT: a game's own .gitattributes (three ship `* text=auto`) would renormalise CRLF
 * blobs on `git add`, and a game's own .gitignore (the-galactic-tree's `.vscode`) would drop a file upstream tracks.
 * `* -text` in the submodule's info/attributes and `add -f` are the two settings that keep a copy upstream's bytes
 * (measured by the split's import gate: without them the tree id differs). Idempotent.
 */
export function ensureByteExact({ repo = REPO } = {}) {
  const dir = path.join(repo, GAMES_PATH);
  const f = path.resolve(dir, run(dir, ['rev-parse', '--git-path', 'info/attributes']));
  const have = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
  if (!/^\* -text$/m.test(have)) { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, have + (have && !have.endsWith('\n') ? '\n' : '') + '* -text\n'); }
}

/** Stages `rels` (paths inside games/, or '.' for everything) byte-exact and commits them in games/. Returns the full sha, or null when nothing changed. */
export function commitGames(rels, message, { repo = REPO } = {}) {
  const dir = path.join(repo, GAMES_PATH);
  ensureByteExact({ repo });
  run(dir, ['add', '-A', '-f', '--', ...rels]);
  if (!run(dir, ['diff', '--cached', '--name-only'])) return null;
  run(dir, ['commit', '-q', '-m', message]);
  return run(dir, ['rev-parse', 'HEAD']);
}

/** The operator's steps 2–3 (see the header), as commands. `loaderPaths` = the loader-side files that go with the gitlink. */
export function nextSteps(loaderPaths = [], { repo = REPO } = {}) {
  const s = gamesState({ repo });
  if (!s.initialised || s.head === s.pin) return [];
  return [
    `git -C ${GAMES_PATH} log --oneline ${s.pin ? s.pin.slice(0, 9) + '..' : ''}HEAD     # the games commit(s) to publish`,
    `git -C ${GAMES_PATH} push origin ${s.branch || 'HEAD'}:main                  # FIRST: the games commit on tmt-loader-games' default branch`,
    `git add ${[GAMES_PATH, ...loaderPaths.filter((p) => fs.existsSync(path.join(repo, p)))].join(' ')} && git commit                # THEN: the gitlink, with the loader files that describe it`,
  ];
}
