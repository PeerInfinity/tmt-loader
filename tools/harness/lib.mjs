// Shared harness helpers: args, the static server (by PID), sha256, the repo root.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';

export const REPO = path.resolve(new URL('../..', import.meta.url).pathname);
export const GAMES = () => JSON.parse(fs.readFileSync(path.join(REPO, 'manifests/index.json'), 'utf8')).map((g) => g.id);
export const readManifest = (id, root = REPO) => JSON.parse(fs.readFileSync(path.join(root, `manifests/${id}.json`), 'utf8'));
export const sha256hex = (s) => crypto.createHash('sha256').update(s).digest('hex');
export const hash16 = (s) => sha256hex(s).slice(0, 16);
export const headCommit = (root = REPO) => { try { return execFileSync('git', ['-C', root, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim(); } catch { return null; } };
export const treeDirty = (root = REPO) => { try { return execFileSync('git', ['-C', root, 'status', '--porcelain'], { encoding: 'utf8' }).trim().length > 0; } catch { return null; } };

/** --key value / --flag parsing; positionals in `_`. Numbers stay strings (callers convert). */
export function parseArgs(argv, flags = []) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { o._.push(a); continue; }
    const eq = a.indexOf('=');
    if (eq > 0) { o[a.slice(2, eq)] = a.slice(eq + 1); continue; }
    const k = a.slice(2);
    if (flags.includes(k)) o[k] = true; else o[k] = argv[++i];
  }
  return o;
}

export function freePort() {
  // `ss` is how we avoid a port that is already listening. It is not guaranteed to exist everywhere the harness
  // runs — a CI container without iproute2 would otherwise throw here and take the whole run down for a reason
  // that has nothing to do with the gate. Without it, fall back to an unfiltered draw: the range is 1,800 wide,
  // and `startServer` fails loudly within 10 s if the draw collides, which is a far better failure than this one.
  let used = new Set();
  try { used = new Set(execFileSync('ss', ['-ltnH'], { encoding: 'utf8' }).split('\n').map((l) => (l.match(/:(\d+)\s/) || [])[1]).filter(Boolean).map(Number)); }
  catch { /* no `ss` here; draw blind */ }
  for (let tries = 0; tries < 200; tries++) {
    const p = 8100 + Math.floor(Math.random() * 1800);
    if (!used.has(p)) return p;
  }
  throw new Error('no free port found in 8100-9899');
}

/**
 * python3 -m http.server on `dir`, bound to 127.0.0.1, on a free port. Returns {url, pid, stop()}.
 * stop() kills that literal PID. Callers MUST call stop() in finally.
 */
export async function startServer(dir, { port = freePort(), subpath = '' } = {}) {
  const child = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: dir, stdio: ['ignore', 'ignore', 'ignore'] });
  const pid = child.pid;
  let exited = false;
  child.on('exit', () => { exited = true; });
  const stop = () => { if (!exited) { try { process.kill(pid, 'SIGTERM'); } catch {} } };
  const url = `http://127.0.0.1:${port}/${subpath}`;
  const t0 = Date.now();
  for (;;) {
    if (exited) throw new Error(`http.server on ${port} exited early`);
    try { const r = await fetch(`http://127.0.0.1:${port}/`); if (r.ok || r.status === 404) break; } catch {}
    if (Date.now() - t0 > 10000) { stop(); throw new Error(`http.server on ${port} not listening after 10 s`); }
    await new Promise((r) => setTimeout(r, 100));
  }
  return { url, port, pid, stop };
}

export function writeJSON(file, obj) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n'); }

/** Index of the first differing char of two strings and ±120 chars of context each side. */
export function firstDivergence(a, b, ctx = 120) {
  if (a === b) return null;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  // the innermost JSON key before the divergence
  const before = a.slice(0, i);
  const keys = [...before.matchAll(/"([^"\\]+)":/g)];
  return { index: i, key: keys.length ? keys[keys.length - 1][1] : null, a: a.slice(Math.max(0, i - ctx), i + ctx), b: b.slice(Math.max(0, i - ctx), i + ctx) };
}

/** JSON with object keys sorted at every depth (arrays keep their order) — equality up to key ORDER only. */
export function canonicalJSON(text) {
  const sort = (v) => Array.isArray(v) ? v.map(sort) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sort(v[k])])) : v;
  return JSON.stringify(sort(JSON.parse(text)));
}
/** Top-level key order of a JSON object text. */
export const topKeys = (text) => Object.keys(JSON.parse(text));

/** A ladder file (docs/harness.md): header keys + `marks` [{id, name, predicate, wall, source, diff, …}]. */
export const readLadder = (file) => JSON.parse(fs.readFileSync(path.resolve(REPO, file), 'utf8'));
/** Writes a ladder in its checked-in shape: one header key per line, one mark per line. */
export function writeLadder(file, L) {
  const head = Object.entries(L).filter(([k]) => k !== 'marks').map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
  const marks = L.marks.map((m, i) => `    ${JSON.stringify(m)}${i < L.marks.length - 1 ? ',' : ''}`);
  fs.writeFileSync(path.resolve(REPO, file), ['{', ...head, '  "marks": [', ...marks, '  ]', '}'].join('\n') + '\n');
}
/** player JSON text with the state mask applied (`time`, `offTime` at every depth) — for divergence reports. */
export function maskedPlayer(text, mask = ['time', 'offTime']) {
  return JSON.stringify(JSON.parse(text), function (k, v) { return mask.includes(k) ? undefined : v; });
}

/**
 * Refuse to be imported. A `gates-*.mjs` file is a BATTERY, not a library: its body runs at top level, spawning
 * boot children and — for gates-h1 and gates-p1a — REWRITING committed snapshots. Importing one to read a constant
 * once started a second battery alongside the first: 12 boot children on 8 cores and 4 orphaned processes when the
 * importer was killed. Nothing imports these today, so refusing turns a silent, expensive mistake into an immediate
 * one that says what to do instead.
 *
 * `gates-r1.mjs` solves the same problem by wrapping its body in `if (ENTRY)`; these nine run top-level, where a
 * wrap would mean re-indenting hundreds of lines, so they bail at the top instead.
 */
export function entryOnly(metaUrl) {
  const self = path.resolve(fileURLToPath(metaUrl));
  const argv = process.argv[1] ? path.resolve(process.argv[1]) : null;
  if (argv !== self) {
    throw new Error(`${path.basename(self)} is a battery, not a library — importing it RUNS it (boot children, and for some gates a rewrite of committed snapshots). Execute it as the entry point instead.`);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// SHARDING — splitting the roster across parallel runners.
//
// The full `--gate mobile` sweep is ~50 s/game over 171 games (U2b, 2026-09-18), which is over an hour holding one
// machine. Sharded, each runner takes a slice and CI merges the results. ⛔ The hazard that shapes everything here:
// a shard that dies before running anything is INDISTINGUISHABLE from a shard that passed, and a sharding bug that
// drops games makes the whole run faster AND greener. So every shard records the roster it was ASSIGNED alongside
// the rows it produced, and `merge-shards.mjs` refuses a run whose shards do not reconstruct the full roster.
// ---------------------------------------------------------------------------------------------------------------

/**
 * The deepest committed snapshot for a game (the one with the most ticks), or null when the game has none.
 * Lives here rather than in page.mjs because the shard cost model reads it and the shard unit test runs under
 * `node --test` with no playwright installed.
 */
export function deepestSnapshot(id, root = REPO) {
  const dir = path.join(root, 'tools/harness/snapshots', id);
  const files = ['frontier', 'all', 'pinned'].flatMap((sub) => {
    const d = path.join(dir, sub);
    return fs.existsSync(d) ? fs.readdirSync(d).filter((f) => f.endsWith('.json')).map((f) => path.join(d, f)) : [];
  });
  if (!files.length) return null;
  const best = files.map((f) => ({ f, d: JSON.parse(fs.readFileSync(f, 'utf8')) })).sort((a, b) => (a.d.ticks || 0) - (b.d.ticks || 0)).pop();
  return { file: path.relative(root, best.f), player: best.d.player, ticks: best.d.ticks };
}

/** #info, #optionWheel, #help — the tabs gateMobile opens beyond the layers, when the engine offers them. */
const SYSTEM_TABS = 3;

/**
 * Per-game wall clock from a real sharded run, if one has been recorded. Regenerate with
 * `node tools/harness/merge-shards.mjs <shards> --write-costs tools/harness/shard-costs.json` after a green sweep.
 * A balance HINT and nothing more: an id missing from it falls back to the estimate below, an id in it that has left
 * the roster is ignored, and coverage never depends on either.
 */
const COSTS_FILE = path.join(REPO, 'tools/harness/shard-costs.json');
let COSTS = undefined;
function measuredCost(id) {
  if (COSTS === undefined) { try { COSTS = JSON.parse(fs.readFileSync(COSTS_FILE, 'utf8')).ms || {}; } catch { COSTS = {}; } }
  return typeof COSTS[id] === 'number' ? COSTS[id] : null;
}

/**
 * What one game costs the M1 sweep, in MILLISECONDS, well enough to balance shards with.
 *
 * ⚠ TWO MODELS HAVE BEEN WRONG HERE, and the second one is the interesting one.
 *
 * The first was cost ∝ views: `ptr` opens 20 views against everyone else's 1, so it must be ~20× the work. It is
 * not — most of a game's cost is FIXED (three boots for the state leg and its control, the navbar-only leg's paired
 * control, the layers legs) at ~0.94 s per extra view. That model left one shard holding a single game.
 *
 * The second was BASE + per-view, which is what replaced it. The first green CI run (171 games, 2026-09-18,
 * `a665c24`) measured what that model could not see: the dominant term is neither views nor anything else the repo
 * declares — it is how expensive the GAME ITSELF is to boot and tick.
 *
 *     the-gaming-tree  53.4 s      the-point-tree  47.2 s      plague-tree-…  41.1 s   <- all ONE-view games
 *     ptr              14.6 s      something       10.2 s                              <- the "heavyweights"
 *     median 3.3 s, mean 4.8 s, fastest 1.6 s
 *
 * So `ptr` is not even in the top three, and the real spread is 30× between the median game and the slowest. A
 * view-derived estimate cannot know that, and "it averages out over the ~17 games a shard holds" — which is what
 * this comment used to claim — was measured false: the shards came out 47 s to 157 s, a ×3.33 spread.
 *
 * Hence: use a MEASURED table when there is one (×1.02 on the same run's numbers), and fall back to the estimate for
 * a game nobody has timed yet — a new game is exactly the case with no measurement, and the estimate at least knows
 * whether it has a snapshot. ⚠ NOTHING about coverage depends on any of this. `assignShards` partitions the roster
 * exactly once whatever the costs are, asserted over every N in `loader/shard.test.mjs`. A bad cost model makes CI
 * slower; it cannot make it wrong.
 */
const BASE_MS = 12000, VIEW_MS = 1000;
export function shardCost(id, root = REPO) {
  const measured = measuredCost(id);
  if (measured != null) return measured;
  const snap = deepestSnapshot(id, root);
  if (!snap) return BASE_MS;
  let player;
  try { player = JSON.parse(snap.player); } catch { return BASE_MS; }
  // every tab that save can open: `none`, each unlocked layer, and the system tabs — one probe each, beyond the
  // fresh tree every game already pays for
  const layers = Object.keys(player).filter((k) => player[k] && typeof player[k] === 'object' && player[k].unlocked === true).length;
  return BASE_MS + VIEW_MS * (1 + layers + SYSTEM_TABS);
}

/**
 * Partition `ids` into `n` shards. Longest-processing-time-first: heaviest game to the lightest shard so far, ties
 * to the lowest shard index. When every cost is equal — which is the case for 169 of the 171 games — that degenerates
 * to plain round-robin over the id-sorted roster, so interleaving is the floor and the cost model only improves on it.
 *
 * Deterministic: the same roster and the same N give the same partition on every machine, which is what lets a CI
 * shard and a local `--shard i/N` be talking about the same set of games.
 */
export function assignShards(ids, n, root = REPO) {
  if (!Number.isInteger(n) || n < 1) throw new Error(`shard count must be an integer >= 1, got ${JSON.stringify(n)}`);
  const shards = Array.from({ length: n }, () => []);
  const load = new Array(n).fill(0);
  const order = ids.map((id) => ({ id, cost: shardCost(id, root) }))
    .sort((a, b) => b.cost - a.cost || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  for (const { id, cost } of order) {
    let k = 0;
    for (let j = 1; j < n; j++) if (load[j] < load[k]) k = j;
    shards[k].push(id);
    load[k] += cost;
  }
  // Each shard replays the roster's own order, so a shard's log reads like a slice of the full sweep's.
  const rank = new Map(ids.map((id, i) => [id, i]));
  for (const s of shards) s.sort((a, b) => rank.get(a) - rank.get(b));
  return shards;
}

/** `--shard i/N`, ONE-BASED like Playwright's own `--shard=1/10`: 1/10 is the first of ten. */
export function parseShard(spec) {
  const m = /^\s*(\d+)\s*\/\s*(\d+)\s*$/.exec(String(spec));
  if (!m) throw new Error(`--shard wants i/N (1-based, like Playwright's), got ${JSON.stringify(spec)}`);
  const i = Number(m[1]), n = Number(m[2]);
  if (n < 1) throw new Error(`--shard N must be >= 1, got ${n}`);
  if (i < 1 || i > n) throw new Error(`--shard i must be in 1..${n}, got ${i}`);
  return { i, n };
}

// ---------------------------------------------------------------------------------------------------------------
// COVERAGE — the same accusation `merge-shards.mjs` makes, for a gate that does not shard.
//
// ⛔ Same inversion as everywhere else in this repo: a battery that ran fewer games finishes faster and shows
// fewer reds. `gates-a1.mjs` enumerates its own roster and, until V1, exited 0 whatever its rows said — so a run
// that booted one game, threw inside the second and printed `1/12 green` was a GREEN step in CI. Two independent
// things have to be asserted and neither implies the other: that every game the run was GIVEN produced rows, and
// that the rows are green.
//
// The per-game row COUNT is the third, and it is the one that catches a battery dying mid-way through a game:
// every game of a `gates-a1` part runs the identical sequence of checks, so unequal counts mean one of them
// stopped early — which otherwise reads as a game with fewer (and therefore fewer failing) rows.
// ---------------------------------------------------------------------------------------------------------------

/**
 * Judge a non-sharded battery's rows against the roster it was told to cover. Pure, so the unit test can feed it
 * rows that never booted a game. `rows` = [{gate, id, ok}], `roster` = the ids the run was given.
 * Returns {ok, problems: [string], games, expected, rows, red, perGame}.
 */
export function gateCoverage(rows, roster, { label = 'gate' } = {}) {
  const problems = [];
  const say = (m) => problems.push(m);
  const want = [...new Set(roster)];
  const seen = [];
  const perGame = {};
  for (const r of rows) {
    const id = r && r.id;
    if (id === undefined || id === null) { say(`${label}: a row carries no game id (${JSON.stringify(r).slice(0, 120)}), so it cannot be placed in the run`); continue; }
    if (!seen.includes(id)) seen.push(id);
    perGame[id] = (perGame[id] || 0) + 1;
  }
  if (!rows.length) say(`${label}: the run produced NO ROWS AT ALL — a battery that died before its first check leaves exactly this, and it is not a pass`);
  const missing = want.filter((id) => !seen.includes(id));
  if (missing.length) say(`${label}: GAME(S) MISSING from the rows: ${missing.join(', ')} — the run was given ${want.length} (${want.join(', ')}) and produced rows for ${seen.length}`);
  const extra = seen.filter((id) => !want.includes(id));
  if (extra.length) say(`${label}: rows for ${extra.join(', ')}, which the run was not given — the roster and the rows disagree about what was measured`);
  const counts = [...new Set(want.filter((id) => perGame[id]).map((id) => perGame[id]))];
  if (counts.length > 1) {
    say(`${label}: the games did not run the same battery — ${want.filter((id) => perGame[id]).map((id) => `${id} ${perGame[id]} row(s)`).join(', ')}. Every game runs the identical sequence, so an unequal count is a game that stopped part-way, and its missing rows cannot be red`);
  }
  const red = rows.filter((r) => !r.ok);
  if (red.length) say(`${label}: ${red.length} RED row(s): ${red.map((r) => `${r.gate} [${r.id}]`).join(' · ')}`);
  return { ok: problems.length === 0, problems, games: seen.length, expected: want.length, rows: rows.length, red: red.length, perGame };
}

/** The one line a CI step's log is read for. */
export function coverageLine(c, label = 'gate') {
  return `${label} VERDICT: games ${c.games}/${c.expected}; rows ${c.rows - c.red}/${c.rows}; ${c.red} RED`;
}

// ---- R3c Part 0: Something Tree has NO automation table --------------------------------------------------------------
// ⚖ User, 2026-09-21: "We can discard the Something Tree data" — asked, and the reading chosen was "delete its automation
// table". Something Tree now runs on the DERIVED defaults like the other 169 games and stays the arc's generality
// control: the control for the DERIVATION rather than for a tuned table. Two consumers used to find it as "a game with
// an automation table" and now find it by this ROLE instead — the a1 CI job's game set (`ls games-auto/*.json` ∪ this)
// and M1's `both` leg (`page.mjs`). ⚠ The control must have NO table: `loader/census.test.mjs` asserts it.
export const TABLELESS_CONTROL = 'something';
// The deleted table, NAMED as a configuration (plan §14d.2 item 14: a pin is a measurement of a CONFIGURATION). Every
// Something Tree number pinned before R3c was measured under it, and `--auto-opt` with this string reproduces the old
// leg byte for byte — full hash included (measured at R3c: diff 1, 3000 ticks → S05 at 579, `hashGame`
// `524822d719ceea18`, full hash `916b30e1b0c9830e`, the same three the table gave). A pin that compares against a
// BASELINE COMMIT — whose table said exactly this — names it; a leg that is a control for the derivation does not.
// ⚖ F1 (plan §48): a reset YIELDS to the game's own passive generation by default since F1, and that changes behaviour under
// EVERY configuration — including every pin recorded before it. A pin is a measurement of a CONFIGURATION (§14d.2 item
// 14), so the historical gates (`gates-s1`, `gates-h1`, `gates-p1a`, `gates-p1b`) NAME the one they measured: this
// option, appended to every leg they run at HEAD by `withPreF1`. Their old bytes are reproduced by it, not re-recorded.
export const PRE_F1 = 'passiveYield=off';
/** `o` (run.mjs flags) with PRE_F1 appended to its `--auto-opt`, unless the leg runs no automation at all. */
export function withPreF1(o) {
  if (o['no-automation'] || o.automation === false || o.automation === '0') return o;
  const cur = o['auto-opt'] ? String(o['auto-opt']) : '';
  if (cur.split(';').includes(PRE_F1)) return o;
  return { ...o, 'auto-opt': cur ? `${cur};${PRE_F1}` : PRE_F1 };
}
export const SOMETHING_OLD_TABLE = [
  'kindOrder=toggles,reset,upgrades,buyables,challenges,clickables',
  'policy:reset:unlock=always',
  'policy:reset:fundamental=interval>=5',
  'policy:reset:primitive=interval>=90',
  'policy:buyables:fundamental=buyMax',
  PRE_F1,   // F1: the table was deleted before the yield existed, so the configuration it names has none
].join(';');
