// The STRATEGY TEMPLATES' command line (tpl1; docs/templates.md): boot a game at a state, match every template's fact
// pattern against the game's facts, CHECK each match on the planner's rolled-back copy, print the verdicts with their
// reasoning, and write the queue a confirmed verdict carries.
//   node tools/harness/strategize.mjs <game> [--from <snapshot.json>] [--goal <goal id, e.g. upg:q:23>]
//                                     [--facts <games-facts/<game>.json>] [--horizon <game-s>] [--lever-k <game-s>]
//                                     [--out <queue.json>] [--json <verdicts.json>] [--all]
// ⛔ Every flag is declared; an unknown one exits 2. The live game is never touched: every measurement is an excursion,
// and each verdict reports `neutral` (the live hashGame before and after its check). Exit 0 = it ran (whatever the
// verdicts); 1 = a boot or a template threw.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { REPO, entryOnly } from './lib.mjs';
import { runNode } from './run.mjs';
entryOnly(import.meta.url);

const FLAGS = { from: 1, goal: 1, facts: 1, horizon: 1, 'lever-k': 1, out: 1, json: 1, all: 0 };
const argv = process.argv.slice(2), a = { _: [] };
for (let i = 0; i < argv.length; i++) {
  const x = argv[i];
  if (!x.startsWith('--')) { a._.push(x); continue; }
  const k = x.slice(2);
  if (!(k in FLAGS)) { console.error(`strategize: unknown flag --${k} (known: ${Object.keys(FLAGS).map((f) => '--' + f).join(' ')})`); process.exit(2); }
  a[k] = FLAGS[k] ? argv[++i] : true;
}
const game = a._[0];
if (!game) { console.error('usage: node tools/harness/strategize.mjs <game> [--from <snapshot>] [--goal <id>] [--out queue.json] [--json out.json]'); process.exit(2); }
const factsFile = path.resolve(a.facts || path.join(REPO, 'games-facts', `${game}.json`));
if (!fs.existsSync(factsFile)) { console.error(`strategize: no facts file ${path.relative(REPO, factsFile)} — run tools/harness/facts.mjs ${game} first`); process.exit(2); }

const facts = fs.readFileSync(factsFile, 'utf8');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-strategize-'));
const drive = path.join(dir, 'drive.js');
const opts = { goal: a.goal || null, horizon: a.horizon ? Number(a.horizon) : null, leverK: a['lever-k'] ? Number(a['lever-k']) : null, all: !!a.all };
fs.writeFileSync(drive, `var FACTS = ${facts};\nreturn tmtLoader.planner.templates.run(FACTS, ${JSON.stringify(opts)});\n`);
const o = { profile: 'all', diff: 1, ticks: 0, planner: true, templates: true, 'queue-runner': true, 'planner-script': drive };
if (a.from) o['from-snapshot'] = a.from;
const res = runNode(game, o);
if (!res.ok || !res.plannerScript || res.plannerScript.error) {
  console.error(`strategize: ${game} failed at ${res.failed_at || 'planner-script'}: ${res.error || (res.plannerScript && res.plannerScript.error)}`);
  process.exit(1);
}
const R = res.plannerScript;
R.from = a.from ? path.relative(REPO, path.resolve(a.from)) : 'fresh';
R.facts = path.relative(REPO, factsFile);
for (const v of R.results) {
  console.log(`\n${v.template}  ${v.goal}  →  ${String(v.verdict).toUpperCase()}`);
  for (const line of v.reasoning || []) console.log(`  · ${line}`);
  if (v.levers) for (const l of v.levers) console.log(`    lever ${l.input} (${l.kind}${l.getter ? ' via ' + l.getter : ''}): ${l.distanceLog10 === null || l.distanceLog10 === undefined ? (l.why || 'unpriced') : '10^' + l.distanceLog10 + ' away — ' + l.binding}`);
  if (v.subgoal) console.log(`  sub-goal: ${v.subgoal.dimension} ≥ ${v.subgoal.threshold} (${v.subgoal.why})`);
  if (v.neutral === false) console.log('  ⛔ NOT NEUTRAL: the live state moved during this check');
}
const summary = Object.entries(R.counts).map(([t, c]) => `${t}: ${c.matches} match(es), ${c.open} open; ${Object.entries(c.verdicts).map(([k, n]) => `${k} ${n}`).join(', ') || 'no verdict'}` +
  (c.funnel ? ` (funnel: ${c.funnel.prices} price facts → ${c.funnel.shapedInAField} shaped in a non-currency field → ${c.funnel.withProduction} with a production of the currency in it → ${c.funnel.withZeroingReset} with a reset that zeroes it)` : '')).join(' | ');
console.log(`\n${game} at ${R.from} (tick ${R.ticks}): ${summary}`);
const queues = R.results.filter((v) => v.queue);
if (a.out) {
  if (queues.length === 1) { fs.writeFileSync(path.resolve(a.out), JSON.stringify(queues[0].queue, null, 1) + '\n'); console.log(`queue written: ${a.out} (${queues[0].queue.id})`); }
  else console.log(`no queue written: ${queues.length} verdict(s) carry one${queues.length > 1 ? ' — name one with --goal' : ''}`);
}
if (a.json) fs.writeFileSync(path.resolve(a.json), JSON.stringify(R, null, 1) + '\n');
process.exit(R.results.some((v) => v.verdict === 'threw') ? 1 : 0);
