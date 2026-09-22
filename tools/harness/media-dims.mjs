// The media exception's BROWSER witness: every in-scope image of every game, loaded by a real engine from the
// harness's own http.server (which, like GitHub Pages, serves `.gif` as image/gif and `.png` as image/png whatever the
// bytes are), and its naturalWidth/naturalHeight read. Run it on the tree before and after `media.mjs --write` and
// compare: the ruling allows bytes to change, never the picture's intrinsic size.
//   node tools/harness/media-dims.mjs [--root <tree>] [--browser chromium|firefox|webkit] [--only <id>,...] --json <out>
//   node tools/harness/media-dims.mjs --compare <before.json> <after.json>
// ⚠ Not a CI gate (a browser per engine over ~1,460 images): a measurement for the record. tools/media.mjs asserts the
// same property from the headers on every write, and loader/media.test.mjs drives that assertion.
import fs from 'node:fs';
import path from 'node:path';
import { REPO, GAMES, parseArgs, startServer, writeJSON } from './lib.mjs';
import { classify, walk } from '../media-lib.mjs';

const a = parseArgs(process.argv.slice(2));
if (a.compare) {
  const [x, y] = [JSON.parse(fs.readFileSync(a.compare, 'utf8')), JSON.parse(fs.readFileSync(a._[0], 'utf8'))];
  const keys = Object.keys(x.images);
  const diff = keys.filter((k) => JSON.stringify(x.images[k]) !== JSON.stringify(y.images[k]));
  const missing = keys.filter((k) => !(k in y.images));
  const broken = Object.entries(y.images).filter(([, v]) => !v.ok).map(([k]) => k);
  for (const k of diff.slice(0, 30)) console.log(`DIFF ${k}: ${JSON.stringify(x.images[k])} -> ${JSON.stringify(y.images[k])}`);
  console.log(`media-dims: ${keys.length} images (${x.browser} before, ${y.browser} after); ${keys.length - diff.length} identical naturalWidth x naturalHeight; ${diff.length} differ; ${missing.length} missing; ${broken.length} failed to decode after — ${diff.length || missing.length || broken.length ? 'RED' : 'GREEN'}`);
  process.exit(diff.length || missing.length || broken.length ? 1 : 0);
}
const root = path.resolve(a.root || REPO);
const which = a.browser || 'chromium';
const ids = a.only ? a.only.split(',') : GAMES();
const pw = await import('playwright');
const files = ids.flatMap((id) => walk(path.join(root, 'games', id)).filter((r) => classify(r) === 'image').map((r) => `games/${id}/${r}`));
const server = await startServer(root);
const browser = await pw[which].launch();
const images = {};
try {
  const page = await browser.newPage();
  await page.goto(`${server.url}manifests/index.json`);
  for (let i = 0; i < files.length; i += 50) {
    const batch = files.slice(i, i + 50);
    const got = await page.evaluate(async (urls) => Promise.all(urls.map((u) => new Promise((res) => {
      const im = new Image();
      im.onload = () => res({ ok: true, w: im.naturalWidth, h: im.naturalHeight });
      im.onerror = () => res({ ok: false });
      im.src = '/' + u.split('/').map(encodeURIComponent).join('/');
    }))), batch);
    batch.forEach((f, j) => { images[f] = got[j]; });
  }
} finally { await browser.close(); server.stop(); }
const bad = Object.values(images).filter((v) => !v.ok).length;
console.log(`media-dims: ${which} over ${root}: ${files.length} images, ${bad} failed to decode`);
if (a.json) writeJSON(a.json, { browser: which, root, images });
