// A dimension's RATE over a whole stretch, read from a STATE LOG's checkpoints (docs/log.md) — not from a new sampler.
//   node tools/harness/rate.mjs <log.jsonl> --dim <player path> [--threshold N] [--json out.json]
// Every checkpoint carries the whole `player`, so the dimension's value at each one is exact; the rate per interval is
// Δvalue / Δgame-seconds between consecutive checkpoints, and the stretch rate is (last − first) / (last − first gs).
// With --threshold, the first checkpoint at or above it is named (a checkpoint is at most --log-every game-s late —
// the run's own `--until` gives the exact tick). Engine-generic: the path is data, the numbers are read as Decimal
// strings and compared in log10 (a value past 1e308 still compares).
// qrate1 (2026-09-30). ⛔ EVERY FLAG IS DECLARED.
import fs from 'node:fs';
import { parseArgs, entryOnly } from './lib.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), []);
const KNOWN = new Set(['_', 'dim', 'threshold', 'json']);
for (const k of Object.keys(a)) if (!KNOWN.has(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const file = a._[0];
if (!file || !a.dim) { console.error('usage: rate.mjs <log.jsonl> --dim <player path> [--threshold N] [--json out.json]'); process.exit(2); }
if (!/^player(\.[A-Za-z0-9_$]+)+$/.test(a.dim)) { console.error(`REFUSED: --dim ${a.dim} is not a player.<path>`); process.exit(2); }

/** log10 of a Decimal-ish string ("1.5e5320", "123", "1e+30") — exact enough to order and to difference. */
function log10Of(s) {
  const m = /^(-?\d+(?:\.\d+)?)(?:e\+?(-?\d+))?$/i.exec(String(s).trim());
  if (!m) return NaN;
  const mant = Number(m[1]), ex = m[2] ? Number(m[2]) : 0;
  return mant > 0 ? Math.log10(mant) + ex : (mant === 0 ? -Infinity : NaN);
}
const toNum = (s) => { const l = log10Of(s); return l < 300 ? Math.pow(10, l) : Infinity; };

const path = a.dim.split('.').slice(1);
const pts = [];
for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
  if (!line.startsWith('{"type":"checkpoint"')) continue;
  const r = JSON.parse(line);
  let v = typeof r.player === 'string' ? JSON.parse(r.player) : r.player;
  for (const k of path) v = v == null ? undefined : v[k];
  if (v === undefined || v === null) continue;
  pts.push({ tick: r.tick, gs: r.gs, why: r.why, value: String(v) });
}
if (pts.length < 2) { console.error(`${file}: ${pts.length} checkpoint(s) carry ${a.dim} — a rate needs two`); process.exit(1); }
const intervals = [];
for (let i = 1; i < pts.length; i++) {
  const dt = pts[i].gs - pts[i - 1].gs;
  if (dt <= 0) continue;
  intervals.push({ from: pts[i - 1].gs, to: pts[i].gs, rate: (toNum(pts[i].value) - toNum(pts[i - 1].value)) / dt });
}
const first = pts[0], last = pts[pts.length - 1];
const out = { file, dim: a.dim, checkpoints: pts.length, first, last,
  stretch: { gameSeconds: last.gs - first.gs, rate: (toNum(last.value) - toNum(first.value)) / (last.gs - first.gs) },
  intervals: { n: intervals.length, min: Math.min(...intervals.map((x) => x.rate)), max: Math.max(...intervals.map((x) => x.rate)) },
  series: pts.map((p) => [p.gs, p.value]) };
if (a.threshold !== undefined) {
  const t = log10Of(a.threshold);
  const hit = pts.find((p) => log10Of(p.value) >= t);
  out.threshold = { value: String(a.threshold), firstCheckpointAtOrAbove: hit ? { tick: hit.tick, gs: hit.gs, value: hit.value } : null };
}
if (a.json) fs.writeFileSync(a.json, JSON.stringify(out, null, 1) + '\n');
console.log(`RATE ${a.dim}: ${first.value} at ${first.gs} → ${last.value} at ${last.gs} game-s over ${pts.length} checkpoints: ${out.stretch.rate.toPrecision(4)}/game-s (intervals ${out.intervals.min.toPrecision(3)} … ${out.intervals.max.toPrecision(3)})${out.threshold ? `; ≥ ${out.threshold.value}: ${out.threshold.firstCheckpointAtOrAbove ? `checkpoint at ${out.threshold.firstCheckpointAtOrAbove.gs}` : 'not reached'}` : ''}`);
