// The media exception, end to end: images re-encoded as WebP and audio replaced by a silent stub, under the SAME
// filenames, at import (tools/add-game.mjs) and retroactively (this CLI) — and the check that keeps it that way.
//
//   node tools/media.mjs [<id>...]                  CHECK (the gate; `node:` builtins only, no Python): every in-scope
//                                                   file of every game is processed; exit 1 naming each one that is not
//   node tools/media.mjs --write [<id>...]          PROCESS: encode the raw images, stub the raw audio, assert each
//                                                   image's pixel size unchanged; then the check
//        [--jobs N] [--python <path>]               N games at once (default: cores - 2)
//        [--json <out>] [--verbose]                 per game and per type, bytes before and after; every RAW file
//
// ⚖ THE RULED EXCEPTION (user, 2026-09-22) to "never edit games/<id>/" — media only; docs/add-a-game.md, "Media: the
// one exception to pristine". What is in scope, what counts as processed and the stubs are tools/media-lib.mjs.
//
// ⚠ RE-RUN AFTER EVERY `git subtree pull`: a pull restores the original of every file upstream touched. The check is
// what notices (CI `fast` job, and check-manifest's pristine rule, which accepts a media-only difference from the
// squash only when the file is processed) — an original that comes back is a RED, not a quietly bigger download.
//
// ⚠ Encoding needs Pillow >= 12.3.0 in the repo's .venv (tools/media-requirements.txt); the CHECK needs nothing.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import os from 'node:os';
import { REPO, GAMES, parseArgs, writeJSON } from './harness/lib.mjs';
import { classify, imageSize, isWebP, stubFor, walk, scanGame, readSkips, webpAnimation, SKIPS_FILE } from './media-lib.mjs';

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

/** Refuses an encode that changed the picture's pixel size — the ruling allows bytes to change, never layout. */
export function assertSameSize(rel, before, after) {
  if (!before || !after) throw new Error(`${rel}: size unreadable (before ${JSON.stringify(before)}, after ${JSON.stringify(after)})`);
  if (before.width !== after.width || before.height !== after.height) throw new Error(`${rel}: DIMENSIONS CHANGED ${before.width}x${before.height} -> ${after.width}x${after.height} — the ruling forbids downscaling (an <img> with no width renders at its intrinsic size)`);
}

/** Refuses an animation whose total duration or loop count moved (the frame COUNT may fall: merged duplicates). */
export function assertSameTiming(rel, source, anim) {
  if (!anim) throw new Error(`${rel}: the source had ${source.frames} frames and the WebP is not animated`);
  if (anim.totalMs !== source.durationMs || anim.loop !== source.loop) throw new Error(`${rel}: ANIMATION CHANGED — ${source.durationMs} ms, loop ${source.loop} -> ${anim.totalMs} ms, loop ${anim.loop} (${source.frames} -> ${anim.frames} frames)`);
}

/** The check over `ids`: one row per game, and every problem named. Reads only the working tree. */
export function checkMedia(ids = GAMES(), { repo = REPO } = {}) {
  const skips = readSkips(repo);
  const rows = [];
  const problems = [];
  const seen = new Set();
  for (const id of ids) {
    const dir = path.join(repo, 'games', id);
    // a game whose directory cannot be found is a REFUSAL, never a zero — a zero is how a dropped game hides
    if (!fs.existsSync(dir)) { problems.push({ id, why: `games/${id} does not exist` }); continue; }
    const files = scanGame(dir, id, { skips: Object.fromEntries(Object.entries(skips).map(([k, v]) => [k, v.sha256])), sha256 });
    const r = { id, images: 0, webp: 0, skipped: 0, audio: 0, stub: 0, raw: [] };
    for (const f of files) {
      if (f.kind === 'image') { r.images++; if (f.state === 'webp') r.webp++; else if (f.state === 'skipped') { r.skipped++; seen.add(`${id}/${f.rel}`); } }
      else { r.audio++; if (f.state === 'stub') r.stub++; }
      if (f.state === 'raw') { r.raw.push(f.rel); problems.push({ id, rel: f.rel, why: f.kind === 'image' ? 'image not WebP-encoded (and not a declared skip with these bytes)' : 'audio is not the silent stub' }); }
    }
    rows.push(r);
  }
  // a declared skip that no longer applies is stale — the thing that rots (G7's argument)
  const checked = new Set(ids);
  for (const k of Object.keys(skips)) if (checked.has(k.split('/')[0]) && !seen.has(k)) problems.push({ id: k.split('/')[0], rel: k.slice(k.indexOf('/') + 1), why: `${SKIPS_FILE} declares a skip the tree no longer has (processed, gone, or changed bytes)` });
  return { ok: problems.length === 0, rows, problems };
}

/** spawn with stdin, collecting stdout/stderr — async, so `--jobs` games encode at once. */
function run(cmd, args, input) {
  return new Promise((resolve) => {
    const c = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'], env: process.env });
    let stdout = '', stderr = '';
    c.stdout.on('data', (d) => { stdout += d; });
    c.stderr.on('data', (d) => { stderr += d; });
    c.on('error', (e) => resolve({ status: -1, stdout, stderr: String(e) }));
    c.on('close', (status) => resolve({ status, stdout, stderr }));
    c.stdin.end(input);
  });
}

function pythonPath(repo, explicit) {
  if (explicit) return explicit;
  if (process.env.TMT_PYTHON) return process.env.TMT_PYTHON;
  const venv = path.join(repo, '.venv/bin/python3');
  return fs.existsSync(venv) ? venv : 'python3';
}

/**
 * Processes one game in place. Returns bytes before/after per type. Throws — after restoring the original bytes — on
 * an image whose pixel size moved, so a bad encoder can never leave a changed layout behind.
 */
export async function processGame(id, { repo = REPO, python } = {}) {
  const dir = path.join(repo, 'games', id);
  if (!fs.existsSync(dir)) throw new Error(`games/${id} does not exist`);
  const out = { id, image: { files: 0, encoded: 0, skipped: 0, before: 0, after: 0, lossless: 0 }, audio: { files: 0, stubbed: 0, before: 0, after: 0 }, byExt: {}, skips: {} };
  const ext = (rel) => path.extname(rel).toLowerCase();
  const bump = (rel, before, after) => { const e = (out.byExt[ext(rel)] ??= { files: 0, before: 0, after: 0 }); e.files++; e.before += before; e.after += after; };
  const pending = [];
  for (const rel of walk(dir)) {
    const kind = classify(rel);
    if (!kind) continue;
    const p = path.join(dir, rel);
    const b = fs.readFileSync(p);
    if (kind === 'audio') {
      const stub = stubFor(rel);
      out.audio.files++; out.audio.before += b.length; out.audio.after += stub.length;
      if (!b.equals(stub)) { fs.writeFileSync(p, stub); out.audio.stubbed++; }
      bump(rel, b.length, stub.length);
      continue;
    }
    out.image.files++; out.image.before += b.length;
    if (isWebP(b)) { out.image.after += b.length; bump(rel, b.length, b.length); continue; }
    pending.push({ rel, p, orig: b, size: imageSize(b) });
  }
  if (pending.length) {
    const py = pythonPath(repo, python);
    const r = await run(py, [path.join(repo, 'tools/media-encode.py')], JSON.stringify(pending.map((x) => x.p)));
    // ⚠ Anything that goes wrong puts EVERY pending original back. Processed is decided by content, so a WebP the
    // encoder wrote but this function never measured would pass every later run unmeasured.
    const restoreAll = () => { for (const x of pending) fs.writeFileSync(x.p, x.orig); };
    if (r.status !== 0) { restoreAll(); throw new Error(`${id}: media-encode.py (${py}) exited ${r.status}; every original restored: ${(r.stderr || '').slice(-1500)}`); }
    const results = new Map(r.stdout.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)).map((x) => [x.path, x]));
    const failures = [];
    for (const x of pending) {
      const res = results.get(x.p);
      const now = fs.readFileSync(x.p);
      try {
        if (!res) throw new Error(`${id}/${x.rel}: no result from the encoder`);
        if (res.action === 'encoded') {
          if (!isWebP(now)) throw new Error(`${id}/${x.rel}: the encoder reported success and the file is not WebP`);
          assertSameSize(`${id}/${x.rel}`, x.size, imageSize(now));
          if (res.frames > 1) assertSameTiming(`${id}/${x.rel}`, res, webpAnimation(now));
        } else if (!now.equals(x.orig)) throw new Error(`${id}/${x.rel}: the encoder skipped the file and changed it anyway`);
      } catch (e) { failures.push(e.message); continue; }
      if (res.action === 'encoded') {
        out.image.encoded++; if (res.mode === 'lossless') out.image.lossless++;
        out.image.after += now.length; bump(x.rel, x.orig.length, now.length);
      } else {
        out.image.skipped++; out.image.after += now.length; bump(x.rel, now.length, now.length);
        out.skips[`${id}/${x.rel}`] = { sha256: sha256(now), why: res.why || res.action };
      }
    }
    if (failures.length) { restoreAll(); throw new Error(`${failures.length} file(s) refused; every original of ${id} restored:\n${failures.join('\n')}`); }
  }
  return out;
}

/** Rewrites `ids`' entries in the skips file from this run's result (other games' entries kept). */
export function writeSkips(ids, results, { repo = REPO } = {}) {
  const all = readSkips(repo);
  for (const k of Object.keys(all)) if (ids.includes(k.split('/')[0])) delete all[k];
  for (const r of results) Object.assign(all, r.skips);
  const f = path.join(repo, SKIPS_FILE);
  const keys = Object.keys(all).sort();
  if (!keys.length) { if (fs.existsSync(f)) fs.rmSync(f); return; }
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(Object.fromEntries(keys.map((k) => [k, all[k]])), null, 2) + '\n');
}

const mb = (n) => (n / 1e6).toFixed(2);

async function main() {
  const a = parseArgs(process.argv.slice(2), ['write', 'verbose']);
  const ids = a._.length ? a._ : GAMES();
  let report = null;
  if (a.write) {
    const results = [];
    const failed = [];
    const queue = [...ids];
    const jobs = Math.max(1, Number(a.jobs) || Math.max(1, os.cpus().length - 2));
    await Promise.all(Array.from({ length: jobs }, async () => { for (let id; (id = queue.shift()) !== undefined;) {
      // a failing game is recorded, not thrown: a throw here would exit while the other workers' encoders are still
      // writing, and a file written after the exit is a file nobody measured
      let r;
      try { r = await processGame(id, { python: a.python }); } catch (e) { failed.push({ id, error: e.message }); console.log(`${id}: FAILED — ${e.message}`); continue; }
      results.push(r);
      console.log(`${id}: images ${r.image.encoded}/${r.image.files} encoded (${r.image.lossless} lossless, ${r.image.skipped} skipped) ${mb(r.image.before)} -> ${mb(r.image.after)} MB; audio ${r.audio.stubbed}/${r.audio.files} stubbed ${mb(r.audio.before)} -> ${mb(r.audio.after)} MB`);
    } }));
    results.sort((x, y) => ids.indexOf(x.id) - ids.indexOf(y.id));
    writeSkips(results.map((r) => r.id), results);
    const byExt = {};
    for (const r of results) for (const [e, v] of Object.entries(r.byExt)) { const t = (byExt[e] ??= { files: 0, games: 0, before: 0, after: 0 }); t.files += v.files; t.games++; t.before += v.before; t.after += v.after; }
    for (const [e, v] of Object.entries(byExt).sort()) console.log(`  ${e.padEnd(6)} ${String(v.files).padStart(5)} files in ${String(v.games).padStart(3)} games: ${mb(v.before)} -> ${mb(v.after)} MB`);
    report = { results, byExt, failed };
    if (failed.length) { console.log(`media --write: ${failed.length} game(s) FAILED and were restored: ${failed.map((f) => f.id).join(', ')}`); if (a.json) writeJSON(a.json, report); process.exit(1); }
  }
  const c = checkMedia(ids);
  const t = c.rows.reduce((s, r) => ({ images: s.images + r.images, webp: s.webp + r.webp, skipped: s.skipped + r.skipped, audio: s.audio + r.audio, stub: s.stub + r.stub }), { images: 0, webp: 0, skipped: 0, audio: 0, stub: 0 });
  const shown = a.verbose ? c.problems : c.problems.slice(0, 20);
  for (const p of shown) console.log(`RAW ${p.id}${p.rel ? '/' + p.rel : ''}: ${p.why}`);
  if (shown.length < c.problems.length) console.log(`… and ${c.problems.length - shown.length} more (--verbose lists them all; per game: ${c.rows.filter((r) => r.raw.length).map((r) => `${r.id} ${r.raw.length}`).join(', ')})`);
  console.log(`media: ${c.rows.length}/${ids.length} games; images ${t.webp} webp + ${t.skipped} declared skips of ${t.images}; audio ${t.stub} stubs of ${t.audio}; ${c.problems.length} problem(s) — ${c.ok ? 'GREEN' : 'RED'}`);
  if (a.json) writeJSON(a.json, { check: c, ...(report || {}) });
  process.exit(c.ok ? 0 : 1);
}
if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e.message || e); process.exit(2); });
