// REPLAY a state log (log-1, docs/log.md) — the log's acceptance gate: a log that replays to the same hash at every
// record captured every action that mattered.
//   node tools/harness/replay.mjs <log.jsonl> [--wall-ms <ms>] [--json <out>] [--quiet]
// Boots the header's start (a fresh game, or the same snapshot through the same `--from-snapshot` route), with the
// automation core loaded under the SAME options but profile OFF — so the same `automate` slots exist and nothing
// decides — ticks at the header's diff, and re-applies every `player` / `auto` / `queue` call: a player's between ticks
// at its tick, the automation's inside the tick in the same `runLayer` slot it was made in. Never a `game` call: the
// engine re-does those. The recorder runs again with a COMPARING sink, so every action and checkpoint must come out
// equal to the original, in order — tick, source, feature, call, arguments, `did`, and the game hash.
// Prints one JSON line; exit 0 when every record is equal, 1 on the first mismatch (with the record, the summary keys
// that differ and the entry points they implicate), 2 on a usage error.
// ⚠ A PAGE log replays only APPROXIMATELY (⚖ user 2026-09-30): the page's ticks are the browser's, and their lengths
// are not recorded. This tool refuses one by name rather than report a meaningless mismatch.
import fs from 'node:fs';
import path from 'node:path';
import { REPO, parseArgs, writeJSON } from './lib.mjs';
import { runNode } from './run.mjs';

const a = parseArgs(process.argv.slice(2), ['quiet']);
const KNOWN = new Set(['_', 'wall-ms', 'json', 'quiet']);
for (const k of Object.keys(a)) if (!KNOWN.has(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const file = a._[0];
if (!file) { console.error('usage: node tools/harness/replay.mjs <log.jsonl> [--wall-ms ms] [--json out]'); process.exit(2); }
const first = fs.readFileSync(file, 'utf8').split('\n', 1)[0];
let header;
try { header = JSON.parse(first); } catch { console.error(`${file}: the first line is not JSON`); process.exit(2); }
if (header.type !== 'header' || header.format !== 'tmt-state-log/1') { console.error(`${file}: not a tmt-state-log/1 log`); process.exit(2); }
if (header.origin !== 'harness') { console.error(`${file}: a ${header.origin} log — only a harness log replays exactly (the page's tick lengths are not recorded); see docs/log.md`); process.exit(2); }
const C = header.config || {};
const o = {
  profile: 'off', diff: C.diff, replay: path.resolve(file), ticks: 0,
  ...(C.autoOpt ? { 'auto-opt': C.autoOpt } : {}), ...(C.noCurrency ? { 'no-currency': true } : {}), ...(C.noAuto ? { 'no-auto': true } : {}),
  ...(header.start.snapshot ? { 'from-snapshot': path.join(REPO, header.start.snapshot) } : {}),
  ...(C.ladder ? { 'ladder-labels': path.join(REPO, C.ladder) } : {}),
  ...(a['wall-ms'] ? { 'wall-ms': a['wall-ms'] } : {}),
};
const t0 = Date.now();
const res = runNode(header.game, o);
const R = res.replay || null;
const line = { log: path.relative(process.cwd(), path.resolve(file)), game: header.game, ok: res.ok, wallMs: Date.now() - t0 };
if (!res.ok) Object.assign(line, { failed_at: res.failed_at, error: res.error });
if (R) {
  Object.assign(line, { equal: R.equal, compared: R.compared, expected: R.expected, applied: R.applied, unapplied: R.unapplied, endTick: R.endTick, stoppedAt: R.stoppedAt });
  if (R.why) line.why = R.why;
  if (R.mismatch) { line.mismatch = R.mismatch; line.implicates = implicate(R.mismatch); }
}
if (header.loader && res.ok) line.loader = header.loader;
console.log(JSON.stringify(line));
if (a.json) writeJSON(a.json, { line, result: res });
process.exit(res.ok && R && R.equal ? 0 : 1);

/**
 * Which entry points a mismatch points at. A record whose CALL differs names it outright; otherwise the summary keys
 * that differ between the original and the replay say what changed that the log did not carry — a buyable's amount
 * points at the buyable entry points, an upgrade list at the upgrade ones, and so on. A difference outside the summary
 * (a toggle, a clickable's state) is named as such.
 */
function implicate(m) {
  const out = new Set();
  if (m.field === 'call' && m.expected && m.got) { out.add(`expected ${m.expected.call}, the replay made ${m.got.call}`); }
  for (const k of Object.keys(m.stateDiff || {})) {
    if (/\.b\.[^.]+$/.test(k)) out.add('buyables: buyBuyable / buyMaxBuyable / sellOne / sellAll / respecBuyables');
    else if (/\.upg$/.test(k)) out.add('upgrades: buyUpg / buyUpgrade');
    else if (/\.(c\.[^.]+|ac)$/.test(k)) out.add('challenges: startChallenge / completeChallenge');
    else if (/\.ms$/.test(k)) out.add('milestones (follow from what was bought or reset)');
    else if (/\.ach$/.test(k)) out.add('achievements (follow from the state)');
    else if (/\.(p|u)$/.test(k) || k === 'points') out.add('resets / currencies: doReset (or a purchase that spent)');
  }
  if (!out.size && m.field === 'hash') out.add('a field outside the summary: a toggle (toggleAuto / the automation\'s set), a clickable (clickClickable / masterButtonPress), or a family entry point missing from loader/log-hooks.json');
  if (m.field === 'missing') out.add(`the replay ended before the original's record #${m.at} (${m.expected && m.expected.call || m.expected && m.expected.why})`);
  return [...out];
}
