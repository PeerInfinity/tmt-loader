#!/usr/bin/env node
// qedit-1 — THE GENERATED-QUEUE CATALOG the page's queue editor lists (`games-queues/index.json`, docs/queues.md,
// "The editor"). The strategy templates are harness-only (they need the planner's rolled-back copy and the game's
// facts), so the page cannot generate a queue; it plays the ones the templates wrote and this repository commits.
//
//   node tools/queues-catalog.mjs --check     exit 1 unless the committed index equals what this writes
//   node tools/queues-catalog.mjs --write     (re)write it
//
// THE SOURCES are declared below — which game each committed generated queue belongs to and the state it was written
// for (a queue file names no game: the template writes ids, not the game's). The check REFUSES, by name:
//   · a declared file that is missing, is not a valid-looking `tmt-queue/1`, or was not written by a template;
//   · a committed queue under tools/harness/queues/ written by a template (`source.template`) that no entry declares —
//     a new generated queue must be catalogued or this goes red.
// The title and the comment are READ from the queue file (the template's own auto-written comment), never typed here.
import fs from 'node:fs';
import path from 'node:path';
import { REPO, parseArgs, entryOnly } from './harness/lib.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), ['check', 'write']);
for (const k of Object.keys(a)) if (!['_', 'check', 'write'].includes(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
if (!!a.check === !!a.write) { console.error('REFUSED: exactly one of --check | --write'); process.exit(2); }

export const INDEX = 'games-queues/index.json';
const QDIR = 'tools/harness/queues';
// ⚖ the declared sources: game, file, and the harness state the queue was measured on
export const SOURCES = [
  { game: 'ptr', file: `${QDIR}/m28/q23-from-Q308K.json`, state: 'ptr qrate1/Q308K (the q23 purchase, m28)' },
  { game: 'ptr', file: `${QDIR}/h22/ch-h-22-from-QL6.json`, state: 'ptr h22/QL6 (the H22 attempt)' },
  { game: 'ptr', file: `${QDIR}/m30/rr-reset-sg-from-W226931.json`, state: 'ptr m30/W226931 (the sg reset, m30)' },
  { game: 'ptr', file: `${QDIR}/m31/rr-reset-sg-from-R95400.json`, state: 'ptr m31/R95400 (the sg reset, m31)' },
];

function walk(d) { return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.json') ? [path.join(d, e.name)] : []); }

export function build() {
  const errs = [], games = {};
  const declared = new Set(SOURCES.map((s) => s.file));
  for (const f of walk(path.join(REPO, QDIR))) {
    const rel = path.relative(REPO, f).split(path.sep).join('/');
    let q = null; try { q = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { continue; }
    if (q && q.source && q.source.template && !declared.has(rel)) errs.push(`${rel}: written by the template ${q.source.template} and not declared in tools/queues-catalog.mjs SOURCES`);
  }
  for (const s of SOURCES) {
    const f = path.join(REPO, s.file);
    if (!fs.existsSync(f)) { errs.push(`${s.file}: missing`); continue; }
    let q; try { q = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { errs.push(`${s.file}: not JSON (${e.message})`); continue; }
    if (q.format !== 'tmt-queue/1' || typeof q.id !== 'string' || !Array.isArray(q.steps) || !q.steps.length) { errs.push(`${s.file}: not a tmt-queue/1`); continue; }
    if (!q.source || !q.source.template) { errs.push(`${s.file}: not written by a template (source ${JSON.stringify(q.source)})`); continue; }
    (games[s.game] = games[s.game] || []).push({ file: s.file, id: q.id, title: `${q.source.template} → ${q.source.goal}`, template: q.source.template, goal: q.source.goal,
      state: s.state, steps: q.steps.length, comment: q.comment || '' });
  }
  return { errs, index: { format: 'tmt-queue-catalog/1', note: 'written by tools/queues-catalog.mjs --write; the queues the strategy templates wrote, per game, for the page\'s queue editor (docs/queues.md)', games } };
}

const { errs, index } = build();
if (errs.length) { for (const e of errs) console.error(`RED ${e}`); process.exit(1); }
const text = JSON.stringify(index, null, 1) + '\n';
const out = path.join(REPO, INDEX);
if (a.write) { fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, text); console.log(`wrote ${INDEX}: ${Object.entries(index.games).map(([g, l]) => `${g} ${l.length}`).join(', ')}`); process.exit(0); }
const have = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : null;
if (have !== text) { console.error(`RED ${INDEX} is ${have === null ? 'missing' : 'stale'} — run: node tools/queues-catalog.mjs --write`); process.exit(1); }
console.log(`GREEN ${INDEX}: ${Object.entries(index.games).map(([g, l]) => `${g} ${l.length}`).join(', ')}; every template-written queue under ${QDIR} is catalogued`);
