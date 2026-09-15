// The Node CLI (plan §4). Spawns boot.mjs — ONE game per child process — and re-spawns with a pre-stub on a
// ReferenceError in load() (≤ 12, the census's scripts/3-boot.mjs loop). EVERY state claim carries ticks + gameSeconds.
//   node run.mjs <id> [--ticks N] [--diff d] [--leg idle|policy] [--until "<js>"] [--profile off|all|saved] [--json out]
//                     [--exclude au] [--auto-opt "k=v;k2=v2"] [--no-auto] [--no-automation | --automation 0]
//   automation (the page's ?automation=1) is ON by default here; --no-automation boots the plain page's contract-only mode
//                     [--storage in.json] [--load-from player.json] [--save --save-storage out.json]
//                     [--state-out f] [--player-out f] [--ids-out f]
//                     [--ladder ladder.json [--from <mark>] [--to <mark>]] [--snapshots <dir>] [--from-snapshot <file>]
//                     [--predicates list.json] [--eval "<js>"]
//   the ladder (docs/harness.md): marks = the ladder's entries after --from (exclusive) through --to (inclusive, default
//   the last), recorded without stopping (--marks-continue) until --to holds, a stall or the wall; the result gains
//   `ladder: {from, to, reached: [{id, ticks, gameSeconds, hash, hashGame}], stoppedAt}`. --snapshots <dir>: at the first
//   tick each mark holds, <dir>/<id>.json = {mark, commit, dirty, ticks, gameSeconds, diff, hash, hashGame, player, runtime}.
//   --from-snapshot <file>: boot from the snapshot's player via --load-from (importSave → a re-boot on that storage), then
//   restore its runtime; ticks / gameSeconds CONTINUE from the snapshot's counts; --from defaults to the snapshot's mark
//   and --diff to its diff. --no-runtime (a control): restore the counters only, not the memory outside player.
//   --until-all: stop when every mark of the slice holds, not when --to does.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { REPO, parseArgs, writeJSON, headCommit } from './lib.mjs';

const BOOT = path.join(REPO, 'tools/harness/boot.mjs');

/** One boot child with the prestub re-spawn loop. `args` = boot.mjs flags (array). */
export function bootChild(id, args, { timeoutMs = 600e3 } = {}) {
  const prestubs = [];
  for (let attempt = 0; attempt < 12; attempt++) {
    const r = spawnSync(process.execPath, [BOOT, id, ...args, ...(prestubs.length ? ['--prestubs', prestubs.join(',')] : [])], {
      cwd: os.tmpdir(), encoding: 'utf8', timeout: timeoutMs, maxBuffer: 256 << 20, env: { PATH: '/usr/bin:/bin', HOME: os.tmpdir() },
    });
    const line = (r.stdout || '').split('\n').find((l) => l.startsWith('BOOTRESULT '));
    if (!line) return { ok: false, failed_at: r.error?.code === 'ETIMEDOUT' || r.signal ? 'timeout' : 'crash', error: String(r.error || r.signal || (r.stderr || '').slice(-600)), prestubs };
    const res = JSON.parse(line.slice(11));
    if (res.needs_stub) { prestubs.push(res.needs_stub); continue; }
    res.respawn_prestubs = prestubs;
    return res;
  }
  return { ok: false, failed_at: 'load()', error: 'prestub limit (12) reached', prestubs };
}

/** The harness default is automation ON; off by `--no-automation`, `--automation 0`, or `{automation: false}`. */
export const automationOn = (o = {}) => !(o['no-automation'] || o.automation === false || o.automation === '0' || o.automation === 'false');

/** A ladder file: [{id, name, predicate, wall, source, diff}, …]. Returns the entries after `from` through `to`. */
export function ladderSlice(file, from, to) {
  const L = JSON.parse(fs.readFileSync(file, 'utf8'));
  const entries = Array.isArray(L) ? L : L.marks;
  const idx = (m) => { const i = entries.findIndex((e) => e.id === m); if (i < 0) throw new Error(`ladder ${file}: no mark "${m}"`); return i; };
  const a = from ? idx(from) + 1 : 0, b = to ? idx(to) : entries.length - 1;
  if (b < a) throw new Error(`ladder ${file}: --to ${to} is not after --from ${from}`);
  return entries.slice(a, b + 1);
}

/** Run one game in Node. Returns the boot result plus the orchestration record. */
export function runNode(id, o = {}) {
  o = { ...o };
  let snap = null, ladder = null;
  const tmp0 = () => fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-run-'));
  if (o['from-snapshot']) {
    snap = JSON.parse(fs.readFileSync(path.resolve(String(o['from-snapshot'])), 'utf8'));
    const d = tmp0();
    fs.writeFileSync(path.join(d, 'player.json'), snap.player);
    // --no-runtime (a control): only the counters — the registry and the detector start with empty memory
    fs.writeFileSync(path.join(d, 'runtime.json'), JSON.stringify({ ticks: snap.ticks, gameSeconds: snap.gameSeconds, ...(o['no-runtime'] ? {} : snap.runtime) }));
    o['load-from'] = path.join(d, 'player.json');
    o.runtime = path.join(d, 'runtime.json');
    if (o.diff == null) o.diff = snap.diff;
    if (o.ladder && o.from == null) o.from = snap.mark;
  }
  if (o.ladder) {
    const entries = ladderSlice(path.resolve(String(o.ladder)), o.from, o.to);
    const f = path.join(tmp0(), 'marks.json');
    fs.writeFileSync(f, JSON.stringify(entries.map((e) => [e.id, e.predicate])));
    o.marks = f;
    // --until-all: stop when EVERY mark of the slice holds (marks need not hold in ladder order: M10 precedes M09 when
    // the toggles kind runs); default: stop when --to holds
    if (o['until-all']) { delete o['marks-continue']; delete o['stop-mark']; } else { o['marks-continue'] = true; o['stop-mark'] = entries[entries.length - 1].id; }
    ladder = { file: path.relative(REPO, path.resolve(String(o.ladder))), from: o.from || null, to: entries[entries.length - 1].id, ids: entries.map((e) => e.id) };
  }
  const res = runNodeRaw(id, o);
  if (snap) res.fromSnapshot = { file: path.relative(REPO, path.resolve(String(o['from-snapshot']))), mark: snap.mark, commit: snap.commit, ticks: snap.ticks, gameSeconds: snap.gameSeconds, hashGame: snap.hashGame, note: 'ticks / gameSeconds continue from the snapshot' };
  if (ladder && res.marks) {
    const reached = ladder.ids.filter((m) => res.marks[m]).map((m) => ({ id: m, ticks: res.marks[m].ticks, gameSeconds: res.marks[m].gameSeconds, hash: res.marks[m].hash, hashGame: res.marks[m].hashGame }));
    const why = (o['until-all'] ? ladder.ids.every((m) => res.marks[m]) : res.marks[ladder.to]) ? 'to' : res.stall?.stalled ? 'stalled' : res.stall?.walled ? 'walled' : res.ok ? 'ticks' : 'error';
    res.ladder = { file: ladder.file, from: ladder.from, to: ladder.to, reached, stoppedAt: { ticks: res.ticks, gameSeconds: res.gameSeconds, why } };
  }
  if (res.snapshots) {
    const written = [];
    if (o.snapshots) {
      const dir = path.resolve(String(o.snapshots));
      fs.mkdirSync(dir, { recursive: true });
      // dirty = the tree outside the fixtures and records (a run that writes snapshots into the tree does not dirty the next)
      const commit = headCommit(), dirty = snapshotTreeDirty();
      for (const [m, s] of Object.entries(res.snapshots)) {
        const mk = res.marks[m];
        const file = path.join(dir, `${m}.json`);
        const body = { mark: m, commit, dirty, ticks: mk.ticks, gameSeconds: mk.gameSeconds, diff: Number(o.diff ?? 0.05), hash: mk.hash, hashGame: mk.hashGame,
          config: { profile: o.profile || 'off', 'auto-opt': o['auto-opt'] || null, from: snap ? res.fromSnapshot.file : null }, player: s.player, runtime: s.runtime };
        fs.writeFileSync(file, JSON.stringify(body, null, 1) + '\n');
        written.push({ mark: m, file: path.relative(REPO, file), bytes: fs.statSync(file).size, playerBytes: s.player.length });
      }
    }
    delete res.snapshots;
    res.snapshotsWritten = written;
  }
  return res;
}

function snapshotTreeDirty() {
  try { return execFileSync('git', ['-C', REPO, 'status', '--porcelain', '--', '.', ':!tools/harness/snapshots', ':!tools/harness/results'], { encoding: 'utf8' }).trim().length > 0; } catch { return null; }
}

function runNodeRaw(id, o) {
  const ticks = Number(o.ticks ?? 200), diff = Number(o.diff ?? 0.05);
  const args = ['--ticks', String(ticks), '--diff', String(diff), '--leg', o.leg || 'idle'];
  if (o.profile) args.push('--profile', String(o.profile));
  if (o.exclude) args.push('--exclude', String(o.exclude));
  if (o['auto-opt']) args.push('--auto-opt', String(o['auto-opt']));
  if (o['no-auto']) args.push('--no-auto');
  if (!automationOn(o)) args.push('--no-automation');
  if (o.marks) args.push('--marks', path.resolve(String(o.marks)));
  if (o['marks-continue']) args.push('--marks-continue');
  if (o.stall) args.push('--stall', String(o.stall));
  if (o['stall-seen']) args.push('--stall-seen');
  if (o['wall-ms']) args.push('--wall-ms', String(o['wall-ms']));
  if (o['stop-mark']) args.push('--stop-mark', String(o['stop-mark']));
  if (o.snapshots) args.push('--snapshots');
  if (o.runtime) args.push('--runtime', path.resolve(String(o.runtime)));
  if (o.predicates) args.push('--predicates', path.resolve(String(o.predicates)));
  if (o.eval != null) args.push('--eval', String(o.eval));
  if (o.until != null) args.push('--until', String(o.until));
  // the child runs with cwd = os.tmpdir(): every file argument is made absolute here
  for (const k of ['state-out', 'player-out', 'ids-out', 'save-storage']) if (o[k] != null) args.push(`--${k}`, path.resolve(String(o[k])));
  if (o.save) args.push('--save');
  let storage = o.storage;
  const steps = [];
  if (o['load-from']) {
    // tmtLoader.loadFrom(json) = importSave(btoa(json), true), which reloads the page; in Node: one child imports and
    // dumps the storage importSave wrote, a fresh child boots on that storage (what the reloaded page does).
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-import-'));
    const st = path.join(tmp, 'storage.json');
    // the importing child registers the same features as the run (its load() writes player.au.clickables, one key per
    // au button, into the storage the run boots on — H1-2: without these the resumed full hash differs in au only)
    const impArgs = ['--import', path.resolve(o['load-from']), '--save-storage', st];
    if (o['auto-opt']) impArgs.push('--auto-opt', String(o['auto-opt']));
    if (o['no-auto']) impArgs.push('--no-auto');
    if (!automationOn(o)) impArgs.push('--no-automation');
    const imp = bootChild(id, impArgs);
    steps.push({ step: 'import', ok: imp.ok, reload_requested: imp.reload_requested, storage_keys: imp.storage_keys, error: imp.error });
    if (!imp.ok) return { ok: false, failed_at: 'loadFrom', error: imp.error, steps };
    storage = st;
  }
  if (storage) args.push('--storage', path.resolve(storage));
  // the child's own --wall-ms bounds the tick loop; the spawn timeout must outlast it (boot + result write)
  const res = bootChild(id, args, { timeoutMs: Math.max(600e3, Number(o['wall-ms'] || 0) + 120e3) });
  if (steps.length) res.steps = steps;
  return res;
}

async function main() {
  const a = parseArgs(process.argv.slice(2), ['save', 'no-auto', 'no-automation', 'marks-continue', 'stall-seen', 'no-runtime', 'until-all']);
  const id = a._[0];
  if (!id) { console.error('usage: node run.mjs <id> [--ticks N] [--diff d] [--until "<js>"] [--json out] …'); process.exit(2); }
  const res = runNode(id, a);
  const line = { id, ok: res.ok, automation: res.automation, profile: res.profile, ticks: res.ticks, gameSeconds: res.gameSeconds, diff: res.diff, hash: res.hash, summary: res.summary };
  if (res.exclude) { line.exclude = res.exclude; line.hashFull = res.hashFull; }
  if (res.hashGame) line.hashGame = res.hashGame;
  if (res.hook && res.hook.hooked.length) line.hook = res.hook;
  if (res.marks) line.marks = res.marks;
  if (res.stall) line.stall = res.stall;
  if (res.ticks_ms != null) line.ticks_ms = res.ticks_ms;
  if (res.until) line.until = res.until;
  if (res.ladder) line.ladder = res.ladder;
  if (res.fromSnapshot) line.fromSnapshot = res.fromSnapshot;
  if (res.snapshotsWritten) line.snapshotsWritten = res.snapshotsWritten;
  if (res.eval !== undefined) line.eval = res.eval;
  if (!res.ok) Object.assign(line, { failed_at: res.failed_at, error: res.error });
  if (res.steps) line.steps = res.steps;
  console.log(JSON.stringify(line));
  if (a.json) writeJSON(a.json, res);
  process.exit(res.ok ? 0 : 1);
}
if (import.meta.url === `file://${process.argv[1]}`) main();
