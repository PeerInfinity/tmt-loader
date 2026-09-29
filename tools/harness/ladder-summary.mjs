// The ladder as reached: one row per mark — predicate, calibrated diff, and where a committed snapshot holds it
// (ticks / game-seconds / hashGame / commit). Prints markdown; --append adds it to results/SUMMARY.md.
//   node ladder-summary.mjs [--ladder tools/harness/ladder/ptr.json] [--snapshots tools/harness/snapshots/ptr] [--append]
// Every snapshot set under --snapshots (a directory of <mark>.json, e.g. pinned/ and all/) is one column group.
import fs from 'node:fs';
import path from 'node:path';
import { REPO, parseArgs, readLadder, headCommit, treeDirty } from './lib.mjs';
import { SUMMARY } from './summary.mjs';

const a = parseArgs(process.argv.slice(2), ['append']);
const ladderFile = a.ladder || 'tools/harness/ladder/ptr.json';
const L = readLadder(ladderFile);
const root = path.resolve(REPO, a.snapshots || `tools/harness/snapshots/${L.game}`);
const sets = fs.existsSync(root) ? fs.readdirSync(root).filter((d) => fs.statSync(path.join(root, d)).isDirectory()).sort() : [];
const snaps = {};
for (const s of sets) for (const f of fs.readdirSync(path.join(root, s))) {
  if (!f.endsWith('.json')) continue;
  const j = JSON.parse(fs.readFileSync(path.join(root, s, f), 'utf8'));
  (snaps[s] ||= {})[j.mark] = j;
}
const cell = (v) => (v === null || v === undefined ? '—' : String(v).replace(/\|/g, '\\|'));
const cfg = (s) => { const any = Object.values(snaps[s] || {})[0]; return any ? `${any.config?.profile}${any.config?.['auto-opt'] ? ', ' + any.config['auto-opt'] : ', every kind'}` : ''; };
let md = `| mark | name | predicate | diff |${sets.map((s) => ` ${s} (${cfg(s)}): ticks / game-s / hashGame @ commit |`).join('')}\n|---|---|---|---|${sets.map(() => '---|').join('')}\n`;
for (const m of L.marks) {
  md += `| ${m.id} | ${cell(m.name)} | \`${cell(m.predicate)}\` | ${cell(m.diff)} |`;
  for (const s of sets) { const j = snaps[s]?.[m.id]; md += ` ${j ? `${j.ticks} / ${j.gameSeconds} / \`${j.hashGame}\` @ ${j.commit}${j.dirty ? ' (dirty)' : ''} ×${j.diff}` : '—'} |`; }
  md += '\n';
}
const reached = sets.map((s) => `${s} ${Object.keys(snaps[s] || {}).length}`).join(', ');
if (a.append) {
  const date = new Date().toISOString().slice(0, 19) + 'Z';
  fs.appendFileSync(SUMMARY, `\n## ${date} — the ladder as reached (\`node tools/harness/ladder-summary.mjs --ladder ${ladderFile}\`) — commit \`${headCommit()}\`${treeDirty() ? ' (tree DIRTY)' : ''} — ${L.marks.length} marks, snapshots: ${reached}\n\nReading this section: \`diff\` = the coarsest calibrated diff within 2 % of diff 1's game-seconds (null = not calibrated yet); a snapshot column is the committed fixture at the first tick the mark held in that configuration (${path.relative(REPO, root)}/<set>/<mark>.json).\n\n${md}`);
}
console.log(md);
