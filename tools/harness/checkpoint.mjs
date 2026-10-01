// A state-log CHECKPOINT as a resumable SNAPSHOT (tpl1): a checkpoint carries the whole `player` and the automation's
// memory outside it (docs/log.md), which is exactly what `run.mjs --from-snapshot` boots from.
//   node tools/harness/checkpoint.mjs <log.jsonl> --list                       every checkpoint: tick, why, hash, summary keys
//   node tools/harness/checkpoint.mjs <log.jsonl> (--tick N | --last) --out <snapshot.json>
//   node tools/harness/checkpoint.mjs <log.jsonl> --last-without <summaryKey>=<member> --out <snapshot.json>
//        the LAST checkpoint whose summary list <summaryKey> (e.g. `q.upg`) does not hold <member> (e.g. `22`)
// ⛔ Every flag is declared; an unknown one exits 2. The snapshot names the log and the tick it came from.
import fs from 'node:fs';
import path from 'node:path';
import { REPO, headCommit } from './lib.mjs';

const FLAGS = { list: 0, tick: 1, last: 0, 'last-without': 1, out: 1 };
const argv = process.argv.slice(2), a = { _: [] };
for (let i = 0; i < argv.length; i++) {
  const x = argv[i];
  if (!x.startsWith('--')) { a._.push(x); continue; }
  const k = x.slice(2);
  if (!(k in FLAGS)) { console.error(`checkpoint: unknown flag --${k} (known: ${Object.keys(FLAGS).map((f) => '--' + f).join(' ')})`); process.exit(2); }
  a[k] = FLAGS[k] ? argv[++i] : true;
}
const file = a._[0];
if (!file) { console.error('usage: node tools/harness/checkpoint.mjs <log.jsonl> --list | (--tick N | --last | --last-without key=member) --out snap.json'); process.exit(2); }
const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
const header = JSON.parse(lines[0]);
if (header.type !== 'header' || header.format !== 'tmt-state-log/1') { console.error('checkpoint: not a tmt-state-log/1 file'); process.exit(2); }
const cks = lines.filter((l) => l.startsWith('{"type":"checkpoint"')).map((l) => JSON.parse(l));
if (a.list) {
  for (const c of cks) console.log(`${c.tick}\t${c.gs}\t${c.why}${c.mark ? ' ' + c.mark : ''}\t${c.hash}`);
  process.exit(0);
}
let pick = null;
if (a.tick != null) pick = cks.find((c) => c.tick === Number(a.tick));
else if (a.last) pick = cks[cks.length - 1];
else if (a['last-without']) {
  const [key, member] = String(a['last-without']).split('=');
  for (const c of cks) if (!String(c.summary[key] || '').split(',').includes(member)) pick = c;
}
if (!pick) { console.error('checkpoint: no checkpoint matches'); process.exit(1); }
if (!a.out) { console.error('checkpoint: --out <snapshot.json> is required'); process.exit(2); }
const snap = { mark: `CK${pick.tick}`, commit: headCommit(), dirty: null, ticks: pick.tick, gameSeconds: pick.gs, diff: header.config.diff,
  hash: null, hashGame: pick.hash, config: { profile: header.config.profile, 'auto-opt': header.config.autoOpt, from: `log ${path.relative(REPO, path.resolve(file))} @ tick ${pick.tick} (${pick.why})` },
  player: pick.player, runtime: { auto: pick.runtime, monitor: null } };
fs.writeFileSync(path.resolve(a.out), JSON.stringify(snap, null, 1) + '\n');
console.log(JSON.stringify({ out: a.out, tick: pick.tick, gs: pick.gs, why: pick.why, hashGame: pick.hash }));
