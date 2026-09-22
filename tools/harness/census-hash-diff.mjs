// Where OUR idle hash and the CENSUS's disagree, WHICH state fields differ — the check behind a manifest's
// `headless.idleHash.census` block (docs/manifest.md).
//   node tools/harness/census-hash-diff.mjs <id>... [--census <tmt-fork-census checkout>]
// Boots the game twice at 200 × 0.05 on the plain page's Node twin (ours, no automation — as add-game's idle gate) and once with the census's own
// lib/boot.mjs over the same games/<id>/ tree, compares the per-field hashes of `player.<layer>.<key>`, and holds
// the differing set to the manifest: EQUAL to `idleHash.census.differsIn` when the block exists (a second field
// that starts differing is not covered by the annotation), EMPTY when it does not. Exit 1 on any mismatch.
// DEV-TIME only (it needs the census checkout, like tools/add-game.mjs); CI keeps the regression half — G3 holds
// `idleHash.hash`, our own value, whatever the census says.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { REPO, parseArgs, readManifest } from './lib.mjs';
import { runNode } from './run.mjs';

const a = parseArgs(process.argv.slice(2), []);
const CENSUS = path.resolve(a.census || process.env.TMT_CENSUS || path.join(REPO, '..', 'tmt-fork-census'));
if (!fs.existsSync(path.join(CENSUS, 'lib/boot.mjs'))) { console.error(`no tmt-fork-census checkout at ${CENSUS} (--census)`); process.exit(2); }
let bad = 0;
for (const id of a._) {
  const m = readManifest(id);
  const ours = runNode(id, { ticks: 200, diff: 0.05, automation: false });
  const again = runNode(id, { ticks: 200, diff: 0.05, automation: false });
  const out = execFileSync('node', [path.join(CENSUS, 'lib/boot.mjs'), path.join(REPO, 'games', id), '200', '0.05', 'idle'], { cwd: CENSUS, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 << 20 });
  const cen = JSON.parse(out.split('\n').find((l) => l.startsWith('BOOTRESULT ')).slice(11));
  if (!cen.ok) { bad++; console.log(JSON.stringify({ id, ok: false, ours: ours.hash, census: null, error: `the census boot itself failed on this tree (${cen.run2?.error || cen.error || 'no state'}) — nothing to compare, not a field difference` })); continue; }
  const keys = [...new Set([...Object.keys(ours.state_paths || {}), ...Object.keys(cen.state_paths || {})])];
  const differs = keys.filter((k) => (ours.state_paths || {})[k] !== (cen.state_paths || {})[k]).sort();
  const want = [...(m.headless.idleHash.census?.differsIn || [])].sort();
  const ok = ours.ok && ours.hash === again.hash && ours.hash === m.headless.idleHash.hash
    && (m.headless.idleHash.census ? cen.state_hash === m.headless.idleHash.census.hash : cen.state_hash === ours.hash)
    && JSON.stringify(differs) === JSON.stringify(want);
  if (!ok) bad++;
  console.log(JSON.stringify({ id, ok, ours: ours.hash, oursAgain: again.hash, manifest: m.headless.idleHash.hash, census: cen.state_hash, fields: keys.length, differs, declared: want }));
}
process.exit(bad ? 1 : 0);
