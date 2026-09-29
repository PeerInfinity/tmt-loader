// The media exception's check (tools/media-lib.mjs, tools/media.mjs --check): what is in scope, what counts as
// processed, the stubs' bytes, the dimension assertion — and the committed roster, which must be all processed.
// ⚠ `node:` builtins and relative files only — CI's `fast` job runs this with no `npm ci`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { classify, imageSize, isWebP, wavStub, mp3Stub, stubFor, STUB_SECONDS, SKIPS_FILE } from '../tools/media-lib.mjs';
import { checkMedia, assertSameSize } from '../tools/media.mjs';
import { GAMES } from '../tools/harness/lib.mjs';

// minimal headers — enough for imageSize, which never decodes pixels
const png = (w, h) => { const b = Buffer.alloc(33); b.writeUInt32BE(0x89504e47, 0); b.writeUInt32BE(0x0d0a1a0a, 4); b.writeUInt32BE(13, 8); b.write('IHDR', 12, 'latin1'); b.writeUInt32BE(w, 16); b.writeUInt32BE(h, 20); return b; };
const gif = (w, h) => { const b = Buffer.alloc(13); b.write('GIF89a', 0, 'latin1'); b.writeUInt16LE(w, 6); b.writeUInt16LE(h, 8); return b; };
const jpeg = (w, h) => Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x11, 0x08, h >> 8, h & 255, w >> 8, w & 255, 0x03, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
const riff = (chunk, body) => { const b = Buffer.alloc(12 + 8 + body.length); b.write('RIFF', 0, 'latin1'); b.writeUInt32LE(b.length - 8, 4); b.write('WEBP', 8, 'latin1'); b.write(chunk, 12, 'latin1'); b.writeUInt32LE(body.length, 16); body.copy(b, 20); return b; };
const webpX = (w, h) => { const body = Buffer.alloc(10); body.writeUIntLE(w - 1, 4, 3); body.writeUIntLE(h - 1, 7, 3); return riff('VP8X', body); };
const webpL = (w, h) => { const body = Buffer.alloc(10); body[0] = 0x2f; body.writeUInt32LE(((w - 1) & 0x3fff) | (((h - 1) & 0x3fff) << 14), 1); return riff('VP8L', body); };
const webpLossy = (w, h) => { const body = Buffer.alloc(10); body.set([0x9d, 0x01, 0x2a], 3); body.writeUInt16LE(w, 6); body.writeUInt16LE(h, 8); return riff('VP8 ', body); };

test('scope: images and audio by extension; never code, markup, vector, WebP or a licence', () => {
  for (const f of ['a.png', 'x/B.GIF', 'c.jpg', 'd.jpeg']) assert.equal(classify(f), 'image', f);
  for (const f of ['a.mp3', 'x/b.OGG', 'c.wav']) assert.equal(classify(f), 'audio', f);
  for (const f of ['layers.js', 'style.css', 'index.html', 'a.json', 'logo.svg', 'already.webp', 'favicon.ico', 'LICENSE', 'LICENSE.png', 'licence/badge.png', 'Prestige-tree-license', 'COPYING.gif']) assert.equal(classify(f), null, f);
});

test('imageSize reads every format the tool meets, from the header alone', () => {
  assert.deepEqual(imageSize(png(476, 482)), { format: 'png', width: 476, height: 482 });
  assert.deepEqual(imageSize(gif(1280, 602)), { format: 'gif', width: 1280, height: 602 });
  assert.deepEqual(imageSize(jpeg(640, 360)), { format: 'jpeg', width: 640, height: 360 });
  assert.deepEqual(imageSize(webpX(1280, 602)), { format: 'webp', width: 1280, height: 602 });
  assert.deepEqual(imageSize(webpL(90, 88)), { format: 'webp', width: 90, height: 88 });
  assert.deepEqual(imageSize(webpLossy(512, 512)), { format: 'webp', width: 512, height: 512 });
  // the smallest real one met: a blank 100×100 PNG → 28 bytes of lossless WebP (excavation-tree/resources/none.png)
  assert.deepEqual(imageSize(Buffer.from('UklGRhQAAABXRUJQVlA4TAgAAAAvY8AYEIiICA==', 'base64')), { format: 'webp', width: 100, height: 100 });
  assert.equal(isWebP(webpX(1, 1)), true);
  assert.equal(isWebP(png(1, 1)), false);
  assert.equal(imageSize(Buffer.from('not an image at all')), null);
});

test('the dimension assertion refuses a downscale and passes the same size across formats', () => {
  assert.doesNotThrow(() => assertSameSize('x.gif', imageSize(gif(1280, 602)), imageSize(webpX(1280, 602))));
  assert.throws(() => assertSameSize('x.gif', imageSize(gif(1280, 602)), imageSize(webpX(640, 301))), /DIMENSIONS CHANGED 1280x602 -> 640x301/);
  assert.throws(() => assertSameSize('x.png', imageSize(png(10, 10)), null), /unreadable/);
});

test('the stubs: a silent 8 kHz mono 8-bit WAV and silent MPEG-1 Layer III frames, both STUB_SECONDS long', () => {
  const w = wavStub();
  assert.equal(w.toString('latin1', 0, 4), 'RIFF');
  assert.equal(w.toString('latin1', 8, 12), 'WAVE');
  assert.equal(w.readUInt32LE(4), w.length - 8);
  assert.equal(w.readUInt16LE(20), 1); // PCM
  assert.equal(w.readUInt32LE(24), 8000);
  assert.equal(w.readUInt32LE(40), 8000 * STUB_SECONDS);
  assert.ok(w.subarray(44).every((x) => x === 0x80), 'every sample on the zero line');
  const m = mp3Stub();
  assert.equal(m.length % 144, 0);
  const frames = m.length / 144;
  assert.ok((frames * 1152) / 32000 >= STUB_SECONDS, `${frames} frames cover ${STUB_SECONDS} s`);
  for (let f = 0; f < frames; f++) assert.deepEqual([...m.subarray(f * 144, f * 144 + 4)], [0xff, 0xfb, 0x18, 0xc0]);
  assert.ok(m.subarray(4, 144).every((x) => x === 0), 'side info and main data all zero');
  assert.ok(stubFor('a.mp3').equals(m) && stubFor('a.ogg').equals(w) && stubFor('a.wav').equals(w));
});

test('the check: raw reds, processed greens, a declared skip greens only with the same bytes, a stale skip reds', () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'media-test-'));
  try {
    const g = path.join(repo, 'games/g');
    fs.mkdirSync(path.join(g, 'img'), { recursive: true });
    fs.writeFileSync(path.join(g, 'img/a.png'), webpX(4, 4));
    fs.writeFileSync(path.join(g, 'b.gif'), webpX(8, 8));
    fs.writeFileSync(path.join(g, 's.mp3'), mp3Stub());
    fs.writeFileSync(path.join(g, 'm.ogg'), wavStub());
    fs.writeFileSync(path.join(g, 'layers.js'), 'RAW BYTES THAT ARE NOT OURS');
    fs.writeFileSync(path.join(g, 'LICENSE.png'), png(1, 1));
    assert.equal(checkMedia(['g'], { repo }).ok, true);
    // a `git subtree pull` that restores an original image
    fs.writeFileSync(path.join(g, 'img/a.png'), png(4, 4));
    let c = checkMedia(['g'], { repo });
    assert.deepEqual(c.problems.map((p) => p.rel), ['img/a.png']);
    // …and an original audio file
    fs.writeFileSync(path.join(g, 'm.ogg'), Buffer.from('OggS original vorbis'));
    c = checkMedia(['g'], { repo });
    assert.deepEqual(c.problems.map((p) => p.rel).sort(), ['img/a.png', 'm.ogg']);
    fs.writeFileSync(path.join(g, 'm.ogg'), wavStub());
    // a declared skip with these bytes is green; the same declaration after the bytes move is red
    fs.mkdirSync(path.join(repo, path.dirname(SKIPS_FILE)), { recursive: true });
    const sha = crypto.createHash('sha256').update(png(4, 4)).digest('hex');
    fs.writeFileSync(path.join(repo, SKIPS_FILE), JSON.stringify({ 'g/img/a.png': { sha256: sha, why: 'test' } }));
    assert.equal(checkMedia(['g'], { repo }).ok, true);
    fs.writeFileSync(path.join(g, 'img/a.png'), png(4, 5));
    assert.equal(checkMedia(['g'], { repo }).ok, false);
    fs.writeFileSync(path.join(g, 'img/a.png'), webpX(4, 4));
    c = checkMedia(['g'], { repo });
    assert.equal(c.ok, false, 'a skip the tree no longer has is stale');
    assert.match(c.problems[0].why, /declares a skip the tree no longer has/);
    // a game that is not there is a refusal, never a zero
    fs.rmSync(path.join(repo, SKIPS_FILE));
    assert.match(checkMedia(['g', 'missing'], { repo }).problems[0].why, /does not exist/);
  } finally { fs.rmSync(repo, { recursive: true, force: true }); }
});

test('the committed roster: every in-scope image is WebP and every audio file is the stub', () => {
  const c = checkMedia();
  assert.deepEqual(c.problems, [], `${c.problems.length} unprocessed — run \`node tools/media.mjs --write\` (docs/add-a-game.md)`);
  assert.equal(c.rows.length, GAMES().length, 'one row per roster game');
  assert.ok(c.rows.every((r) => r.images > 0), 'every game ships at least one image (measured: all do)');
});
