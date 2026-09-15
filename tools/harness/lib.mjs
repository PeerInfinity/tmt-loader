// Shared harness helpers: args, the static server (by PID), sha256, the repo root.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';

export const REPO = path.resolve(new URL('../..', import.meta.url).pathname);
export const GAMES = () => JSON.parse(fs.readFileSync(path.join(REPO, 'manifests/index.json'), 'utf8')).map((g) => g.id);
export const readManifest = (id, root = REPO) => JSON.parse(fs.readFileSync(path.join(root, `manifests/${id}.json`), 'utf8'));
export const sha256hex = (s) => crypto.createHash('sha256').update(s).digest('hex');
export const hash16 = (s) => sha256hex(s).slice(0, 16);
export const headCommit = (root = REPO) => { try { return execFileSync('git', ['-C', root, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim(); } catch { return null; } };
export const treeDirty = (root = REPO) => { try { return execFileSync('git', ['-C', root, 'status', '--porcelain'], { encoding: 'utf8' }).trim().length > 0; } catch { return null; } };

/** --key value / --flag parsing; positionals in `_`. Numbers stay strings (callers convert). */
export function parseArgs(argv, flags = []) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { o._.push(a); continue; }
    const eq = a.indexOf('=');
    if (eq > 0) { o[a.slice(2, eq)] = a.slice(eq + 1); continue; }
    const k = a.slice(2);
    if (flags.includes(k)) o[k] = true; else o[k] = argv[++i];
  }
  return o;
}

export function freePort() {
  const used = new Set(execFileSync('ss', ['-ltnH'], { encoding: 'utf8' }).split('\n').map((l) => (l.match(/:(\d+)\s/) || [])[1]).filter(Boolean).map(Number));
  for (let tries = 0; tries < 200; tries++) {
    const p = 8100 + Math.floor(Math.random() * 1800);
    if (!used.has(p)) return p;
  }
  throw new Error('no free port found in 8100-9899');
}

/**
 * python3 -m http.server on `dir`, bound to 127.0.0.1, on a free port. Returns {url, pid, stop()}.
 * stop() kills that literal PID. Callers MUST call stop() in finally.
 */
export async function startServer(dir, { port = freePort(), subpath = '' } = {}) {
  const child = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: dir, stdio: ['ignore', 'ignore', 'ignore'] });
  const pid = child.pid;
  let exited = false;
  child.on('exit', () => { exited = true; });
  const stop = () => { if (!exited) { try { process.kill(pid, 'SIGTERM'); } catch {} } };
  const url = `http://127.0.0.1:${port}/${subpath}`;
  const t0 = Date.now();
  for (;;) {
    if (exited) throw new Error(`http.server on ${port} exited early`);
    try { const r = await fetch(`http://127.0.0.1:${port}/`); if (r.ok || r.status === 404) break; } catch {}
    if (Date.now() - t0 > 10000) { stop(); throw new Error(`http.server on ${port} not listening after 10 s`); }
    await new Promise((r) => setTimeout(r, 100));
  }
  return { url, port, pid, stop };
}

export function writeJSON(file, obj) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n'); }

/** Index of the first differing char of two strings and ±120 chars of context each side. */
export function firstDivergence(a, b, ctx = 120) {
  if (a === b) return null;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  // the innermost JSON key before the divergence
  const before = a.slice(0, i);
  const keys = [...before.matchAll(/"([^"\\]+)":/g)];
  return { index: i, key: keys.length ? keys[keys.length - 1][1] : null, a: a.slice(Math.max(0, i - ctx), i + ctx), b: b.slice(Math.max(0, i - ctx), i + ctx) };
}
