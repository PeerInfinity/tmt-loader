// The media exception's pure half — what is in scope, what counts as processed, the silent stubs, and the check.
// ⚠ `node:` builtins and relative files ONLY: the CI `fast` job runs this with no `npm ci` (docs/harness.md, "The
// media gate"). The encoder half, which needs Pillow (tools/media-encode.py), is tools/media.mjs.
//
// ⚖ THE RULED EXCEPTION (user, 2026-09-22) to "never edit games/<id>/": MEDIA FILES ONLY — images re-encoded as WebP
// at the same pixel size under the SAME filename, audio replaced by a silent stub under the SAME filename. Never code,
// never markup, never a licence. docs/add-a-game.md, "Media: the one exception to pristine".
//
// ⚠ PROCESSED IS DECIDED BY CONTENT, with no ledger of what was done: an image whose bytes begin `RIFF….WEBP` has been
// encoded, whatever its extension; an audio file byte-identical to its extension's stub has been stubbed. So the tool
// is idempotent (a second run finds nothing to do and never re-encodes lossy-on-lossy), and a `git subtree pull` that
// restores an original is visible to the check as exactly what it is — an unprocessed file.
import fs from 'node:fs';
import path from 'node:path';

export const IMAGE_EXT = ['.png', '.gif', '.jpg', '.jpeg'];
export const AUDIO_EXT = ['.mp3', '.wav', '.ogg'];
// The stub's length. No game in the roster listens for `ended` (measured: zero `onended` / `'ended'` under games/), and
// the two with music set `loop = true`, so the length only sets how often a silent loop restarts; 1 s keeps the WAV at
// 8 KB and the MP3 under 5 KB. Verified in the real games: docs/add-a-game.md.
export const STUB_SECONDS = 1;
// The file that lists the images the encoder could NOT make smaller (tiny PNGs, where WebP's container costs more than
// it saves) — each with the sha256 of the bytes that were left, so a pull that changes one reds the check like any
// other unprocessed file. It is an allowance list, not a record of work done.
export const SKIPS_FILE = 'games-media/skipped.json';

/** A path any of whose segments names a licence. Never in scope, whatever its extension. */
export const isLicense = (rel) => rel.split('/').some((s) => /^(licen[cs]e|copying)/i.test(s));

/** 'image' | 'audio' | null for a path relative to the game's directory. */
export function classify(rel) {
  if (isLicense(rel)) return null;
  const ext = path.extname(rel).toLowerCase();
  if (IMAGE_EXT.includes(ext)) return 'image';
  if (AUDIO_EXT.includes(ext)) return 'audio';
  return null;
}

export const isWebP = (b) => b.length >= 12 && b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP';

/** {format, width, height} from the header alone — PNG, GIF, JPEG, WebP (VP8X canvas, VP8, VP8L). null if unknown. */
export function imageSize(b) {
  if (b.length >= 24 && b.readUInt32BE(0) === 0x89504e47 && b.toString('latin1', 12, 16) === 'IHDR') return { format: 'png', width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  if (b.length >= 10 && /^GIF8[79]a$/.test(b.toString('latin1', 0, 6))) return { format: 'gif', width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
  if (isWebP(b) && b.length >= 16) {
    // each chunk's own minimum: a 100×100 blank PNG encodes to a 28-byte lossless WebP (excavation-tree's none.png)
    const chunk = b.toString('latin1', 12, 16);
    if (chunk === 'VP8X' && b.length >= 30) return { format: 'webp', width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
    if (chunk === 'VP8 ' && b.length >= 30) return { format: 'webp', width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
    if (chunk === 'VP8L' && b.length >= 25) { const v = b.readUInt32LE(21); return { format: 'webp', width: 1 + (v & 0x3fff), height: 1 + ((v >>> 14) & 0x3fff) }; }
    return null;
  }
  if (b.length >= 4 && b[0] === 0xff && b[1] === 0xd8) {
    // walk the segments to the first SOFn (C0–CF except C4 DHT, C8 JPG, CC DAC)
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m === 0xff) { i++; continue; }
      if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { i += 2; continue; }
      const len = b.readUInt16BE(i + 2);
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { format: 'jpeg', width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
      i += 2 + len;
    }
  }
  return null;
}

/**
 * An animated WebP's frames, total duration (ms) and loop count, from its own ANIM / ANMF chunks; null for a still.
 * The encoder may merge identical consecutive frames (summing their durations), so the COUNT can fall — the total
 * duration and the loop count are what must survive.
 */
export function webpAnimation(b) {
  if (!isWebP(b)) return null;
  let i = 12, loop = null, frames = 0, totalMs = 0;
  while (i + 8 <= b.length) {
    const id = b.toString('latin1', i, i + 4), n = b.readUInt32LE(i + 4), d = i + 8;
    if (id === 'ANIM') loop = b.readUInt16LE(d + 4);
    else if (id === 'ANMF') { frames++; totalMs += b.readUIntLE(d + 12, 3); }
    i = d + n + (n & 1);
  }
  return loop === null ? null : { frames, totalMs, loop };
}

/** Silent PCM WAV: 8 kHz, mono, 8-bit (0x80 is the zero line of unsigned 8-bit PCM). */
export function wavStub(seconds = STUB_SECONDS) {
  const rate = 8000, n = Math.round(rate * seconds);
  const b = Buffer.alloc(44 + n, 0x80);
  b.write('RIFF', 0, 'latin1'); b.writeUInt32LE(36 + n, 4); b.write('WAVE', 8, 'latin1');
  b.write('fmt ', 12, 'latin1'); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(rate, 24); b.writeUInt32LE(rate, 28); b.writeUInt16LE(1, 32); b.writeUInt16LE(8, 34);
  b.write('data', 36, 'latin1'); b.writeUInt32LE(n, 40);
  return b;
}

/**
 * Silent MP3: MPEG-1 Layer III frames at 32 kbit/s, 32 kHz, mono, no CRC — each 144 bytes (144 · 32000 / 32000) and
 * 1152 samples long, a 4-byte header followed by all-zero side info and main data, which decodes to silence (every
 * granule's big_values and count1 are zero, global_gain 0).
 */
export function mp3Stub(seconds = STUB_SECONDS) {
  const frames = Math.ceil((seconds * 32000) / 1152);
  const b = Buffer.alloc(144 * frames);
  for (let f = 0; f < frames; f++) b.set([0xff, 0xfb, 0x18, 0xc0], f * 144);
  return b;
}

/** The stub for an audio file's extension: MP3 frames under `.mp3`, a WAV under `.wav` AND `.ogg` (browsers decode
 * by content, and a WAV even plays in WebKit, where Vorbis does not). */
export const stubFor = (rel) => (path.extname(rel).toLowerCase() === '.mp3' ? mp3Stub() : wavStub());

/** Every regular file under `dir` (symlinks skipped — never followed, never rewritten), relative, sorted. */
export function walk(dir, rel = '') {
  const out = [];
  for (const e of fs.readdirSync(path.join(dir, rel), { withFileTypes: true })) {
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.name === '.git') continue;
    if (e.isDirectory()) out.push(...walk(dir, r));
    else if (e.isFile()) out.push(r);
  }
  return out.sort();
}

export function readSkips(repo) {
  const f = path.join(repo, SKIPS_FILE);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
}

/**
 * The state of one game's media: every in-scope file and whether it is processed. `skips` = {<id>/<rel>: sha256}.
 * A file is `webp` / `stub` (processed), `skipped` (raw, listed with the SAME sha256), or `raw` (the check's red).
 */
export function scanGame(gameDir, id, { skips = {}, sha256 } = {}) {
  const files = [];
  for (const rel of walk(gameDir)) {
    const kind = classify(rel);
    if (!kind) continue;
    const b = fs.readFileSync(path.join(gameDir, rel));
    let state;
    if (kind === 'image') {
      if (isWebP(b)) state = 'webp';
      else if (skips[`${id}/${rel}`] && sha256 && skips[`${id}/${rel}`] === sha256(b)) state = 'skipped';
      else state = 'raw';
    } else state = b.equals(stubFor(rel)) ? 'stub' : 'raw';
    files.push({ rel, kind, state, bytes: b.length });
  }
  return files;
}
