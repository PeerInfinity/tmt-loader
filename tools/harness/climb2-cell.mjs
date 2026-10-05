#!/usr/bin/env node
// climb-2 — ONE ROBUSTNESS CELL: a candidate table, run in ONE process from a leg fixture to a fixed game-second, at the
// page's tick (cloud-reports/tmt-climb-2.md; docs/harness.md, "The whole-game run").
//
//   node tools/harness/climb2-cell.mjs <id> --layer <layer> --table <table.json> --from <fixture.json> --horizon <game-s>
//        --watch <states.json> --out <cell.json> [--log <file.jsonl>] [--stop-snapshot <dir> --stop-snapshot-name <name>]
//
// `--layer` names the layer whose resets the probe watches and whose totals the cell records (its points, total, energy
// and first buyable where the layer has them).
//
// The cell records the watched states it reached (ticks, game-seconds, hashGame), the stop's tick and hashGame, and the
// quirk totals at the stop. Two runs of one cell must end on the same tick and hashGame (the rows' "twice").
// ⚠ A load is not neutral, so a cell is compared only with cells resumed from the SAME fixture.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { REPO, parseArgs, entryOnly } from './lib.mjs';
import { runNode } from './run.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), []);
const KNOWN = new Set(['_', 'layer', 'table', 'from', 'horizon', 'out', 'watch', 'log', 'stop-snapshot', 'stop-snapshot-name', 'diff']);
for (const k of Object.keys(a)) if (!KNOWN.has(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const id = a._[0];
if (!id || !a.layer || !a.table || !a.from || !a.horizon || !a.watch || !a.out) { console.error('usage: climb2-cell.mjs <id> --layer <layer> --table t.json --from fixture.json --horizon <game-s> --watch states.json --out cell.json'); process.exit(2); }
const LAYER = JSON.stringify(String(a.layer));
const from = path.resolve(String(a.from));
const snap = JSON.parse(fs.readFileSync(from, 'utf8'));
const diff = Number(a.diff ?? snap.diff ?? 0.05);
const horizon = Number(a.horizon);
const ticks = Math.round((horizon - snap.gameSeconds) / diff);
if (!(ticks > 0)) { console.error(`REFUSED: the fixture is at ${snap.gameSeconds} game-s, past the horizon ${horizon}`); process.exit(2); }
const watch = JSON.parse(fs.readFileSync(path.resolve(String(a.watch)), 'utf8'));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'climb2-cell-'));
// the fixture's own name heads the ladder (so the slice starts after it), and a mark that never holds ends it (so the run
// goes to the horizon whatever it reaches)
const ladder = path.join(tmp, 'ladder.json');
fs.writeFileSync(ladder, JSON.stringify({ marks: [{ id: snap.mark, name: 'the fixture', predicate: 'false' }, ...watch, { id: 'HORIZON', name: 'the horizon', predicate: 'false' }] }));
// (the chaos probe) a READ-ONLY look at every tick: when the quirk run's clock goes back (a q reset, or a reset above it),
// note the tick and what the run held the tick before — quirk energy, quirks — and how long the run was. It only reads.
const PROBE = `(function () { var g = globalThis, q = player[${LAYER}];
  if (g.__c2rt !== undefined && q.resetTime < g.__c2rt) g.__c2r.push([tmtLoader.ticks, String(g.__c2en), String(g.__c2qq), String(q.points), Math.round(g.__c2rt * 100) / 100]);
  if (g.__c2r === undefined) g.__c2r = [];
  g.__c2rt = q.resetTime; g.__c2en = q.energy; g.__c2qq = q.points; return false; })()`;
const EVAL = `(function (q) { return { resets: globalThis.__c2r || [], total: String(q.total), quirks: String(q.points), energy: String(q.energy),
  layers: q.buyables ? String(q.buyables[Object.keys(q.buyables)[0]]) : null, upgrades: (q.upgrades || []).slice(), points: String(player.points),
  inForce: tmtLoader.stages ? tmtLoader.stages().filter(function (s) { return s.active; }).map(function (s) { return s.id; }) : null }; })(player[${LAYER}])`;
const o = { profile: 'all', diff, ticks, ladder, stall: 1e9, 'from-snapshot': from, 'auto-table': path.resolve(String(a.table)), eval: EVAL, until: PROBE, 'wall-ms': 12 * 3600e3 };
if (a.log) o.log = path.resolve(String(a.log));
if (a['stop-snapshot']) { o['stop-snapshot'] = path.resolve(String(a['stop-snapshot'])); o['stop-snapshot-name'] = String(a['stop-snapshot-name'] || 'STOP'); }
const t0 = Date.now();
const r = runNode(id, o);
const out = { format: 'tmt-climb2-cell/1', table: path.relative(REPO, path.resolve(String(a.table))), from: path.relative(REPO, from), fromGs: snap.gameSeconds, fromHash: snap.hashGame,
  horizon, diff, ok: !!r.ok, error: r.ok ? undefined : String(r.error).slice(0, 600), wallMs: Date.now() - t0,
  marks: r.ladder ? r.ladder.reached.filter((m) => m.id !== 'HORIZON').map((m) => ({ id: m.id, ticks: m.ticks, gameSeconds: m.gameSeconds, hashGame: m.hashGame })) : [],
  stop: { ticks: r.ticks, gameSeconds: r.gameSeconds, hashGame: r.hashGame, ...(r.eval || {}) } };
// the probe's rows: [tick, energy the tick before, quirks the tick before, quirks after, the run's length in game-s]
out.resets = out.stop.resets || []; delete out.stop.resets;
fs.mkdirSync(path.dirname(path.resolve(String(a.out))), { recursive: true });
fs.writeFileSync(path.resolve(String(a.out)), JSON.stringify(out, null, 1) + '\n');
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`${out.ok ? 'ok' : 'FAILED'} ${out.table} from ${out.from} → ${r.gameSeconds} (${r.hashGame}) · ${out.marks.map((m) => `${m.id}@${m.gameSeconds}`).join(' ')} · total ${out.stop.total} · ${Math.round(out.wallMs / 1000)} s`);
process.exit(out.ok ? 0 : 1);
