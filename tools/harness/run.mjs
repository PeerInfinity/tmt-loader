// The Node CLI (plan §4). Spawns boot.mjs — ONE game per child process — and re-spawns with a pre-stub on a
// ReferenceError in load() (≤ 12, the census's scripts/3-boot.mjs loop). EVERY state claim carries ticks + gameSeconds.
//   node run.mjs <id> [--ticks N] [--diff d] [--leg idle|policy] [--until "<js>"] [--profile off|all|saved] [--json out]
//                     [--exclude au] [--auto-opt "k=v;k2=v2"] [--no-auto]
//                     [--storage in.json] [--load-from player.json] [--save --save-storage out.json]
//                     [--state-out f] [--player-out f] [--ids-out f]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { REPO, parseArgs, writeJSON } from './lib.mjs';

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

/** Run one game in Node. Returns the boot result plus the orchestration record. */
export function runNode(id, o = {}) {
  const ticks = Number(o.ticks ?? 200), diff = Number(o.diff ?? 0.05);
  const args = ['--ticks', String(ticks), '--diff', String(diff), '--leg', o.leg || 'idle'];
  if (o.profile) args.push('--profile', String(o.profile));
  if (o.exclude) args.push('--exclude', String(o.exclude));
  if (o['auto-opt']) args.push('--auto-opt', String(o['auto-opt']));
  if (o['no-auto']) args.push('--no-auto');
  if (o.marks) args.push('--marks', path.resolve(String(o.marks)));
  if (o['marks-continue']) args.push('--marks-continue');
  if (o.stall) args.push('--stall', String(o.stall));
  if (o['wall-ms']) args.push('--wall-ms', String(o['wall-ms']));
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
    const imp = bootChild(id, ['--import', path.resolve(o['load-from']), '--save-storage', st]);
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
  const a = parseArgs(process.argv.slice(2), ['save', 'no-auto', 'marks-continue']);
  const id = a._[0];
  if (!id) { console.error('usage: node run.mjs <id> [--ticks N] [--diff d] [--until "<js>"] [--json out] …'); process.exit(2); }
  const res = runNode(id, a);
  const line = { id, ok: res.ok, profile: res.profile, ticks: res.ticks, gameSeconds: res.gameSeconds, diff: res.diff, hash: res.hash, summary: res.summary };
  if (res.exclude) { line.exclude = res.exclude; line.hashFull = res.hashFull; }
  if (res.hook && res.hook.hooked.length) line.hook = res.hook;
  if (res.marks) line.marks = res.marks;
  if (res.stall) line.stall = res.stall;
  if (res.ticks_ms != null) line.ticks_ms = res.ticks_ms;
  if (res.until) line.until = res.until;
  if (!res.ok) Object.assign(line, { failed_at: res.failed_at, error: res.error });
  if (res.steps) line.steps = res.steps;
  console.log(JSON.stringify(line));
  if (a.json) writeJSON(a.json, res);
  process.exit(res.ok ? 0 : 1);
}
if (import.meta.url === `file://${process.argv[1]}`) main();
