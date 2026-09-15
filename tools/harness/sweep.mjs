// A policy / option sweep: one run.mjs child per value (a pool of ≤ 8), each with the same flags plus one extra
// --auto-opt entry, and one line per value with the game-seconds to each mark.
//   node sweep.mjs <id> --vary "policy:reset:e=interval>=5|interval>=10|always" [--opt "k=v;k2=v2"] [--pool 8]
//                  [--json out] <any run.mjs flags: --diff 1 --ticks N --marks f --marks-continue --stall S --stall-seen --wall-ms W>
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { REPO, parseArgs, writeJSON } from './lib.mjs';

const BOOL = ['marks-continue', 'stall-seen', 'no-auto'];
const a = parseArgs(process.argv.slice(2), BOOL);
const id = a._[0];
if (!id || !a.vary) { console.error('usage: node sweep.mjs <id> --vary "key=v1|v2" [--opt "k=v"] [run.mjs flags]'); process.exit(2); }
const eq = String(a.vary).indexOf('=');
const key = String(a.vary).slice(0, eq), values = String(a.vary).slice(eq + 1).split('|');
const pass = Object.entries(a).filter(([k]) => !['_', 'vary', 'opt', 'pool', 'json'].includes(k));

function run(value) {
  return new Promise((resolve) => {
    const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-sweep-')), 'r.json');
    const opt = [a.opt, `${key}=${value}`].filter(Boolean).join(';');
    const args = [path.join(REPO, 'tools/harness/run.mjs'), id, '--json', out, '--profile', 'all', '--auto-opt', opt];
    for (const [k, v] of pass) { if (v === true) args.push(`--${k}`); else if (k === 'marks') args.push('--marks', path.resolve(String(v))); else args.push(`--${k}`, String(v)); }
    const c = spawn(process.execPath, args, { cwd: REPO, stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    c.stderr.on('data', (d) => { err += d; });
    c.on('exit', () => { try { resolve(JSON.parse(fs.readFileSync(out, 'utf8'))); } catch { resolve({ ok: false, error: err.slice(-400) }); } });
  });
}
const POOL = Number(a.pool || 8);
const results = new Array(values.length);
let next = 0;
await Promise.all(Array.from({ length: Math.min(POOL, values.length) }, async () => {
  while (next < values.length) { const i = next++; results[i] = await run(values[i]); }
}));
const lines = values.map((v, i) => {
  const r = results[i];
  return { value: v, ok: r.ok, ticks: r.ticks, gameSeconds: r.gameSeconds, hash: r.hash, stall: r.stall, marks: Object.fromEntries(Object.entries(r.marks || {}).map(([n, m]) => [n, m ? m.gameSeconds : null])), actions: r.hook?.actions, error: r.error };
});
for (const l of lines) console.log(JSON.stringify(l));
if (a.json) writeJSON(a.json, { id, key, opt: a.opt || null, flags: Object.fromEntries(pass), lines, results });
