// One SUMMARY.md section writer (the gates-a2 table shape), shared by gates-l2.mjs and tools/add-game.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { REPO, writeJSON } from './lib.mjs';

export const SUMMARY = path.join(REPO, 'tools/harness/results/SUMMARY.md');
const cell = (v) => (v === null || v === undefined ? '—' : String(v).replace(/\|/g, '\\|').replace(/\n/g, ' '));

/** rows: {gate, id, leg?, ticks?, gameSeconds?, diff?, hash?, ok, notes?}. Also writes results/tmp/<slug>-last.json. */
export function appendSection({ title, commit, dirty, rows, reading = '', slug = null }) {
  const date = new Date().toISOString().slice(0, 19) + 'Z';
  let md = `\n## ${date} — ${title} — commit \`${commit}\`${dirty ? ' (tree DIRTY)' : ''} — ${rows.filter((r) => r.ok).length}/${rows.length} green\n\n${reading ? 'Reading this section: ' + reading + '\n\n' : ''}| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |\n|---|---|---|---|---|---|---|---|---|\n`;
  for (const r of rows) md += `| ${cell(r.gate)} | ${r.id} | ${cell(r.leg)} | ${cell(r.ticks)} | ${cell(r.gameSeconds)} | ${cell(r.diff)} | ${r.hash ? '`' + r.hash + '`' : '—'} | ${r.ok ? 'GREEN' : '**RED**'} | ${cell(r.notes)} |\n`;
  fs.appendFileSync(SUMMARY, md);
  if (slug) writeJSON(path.join(REPO, `tools/harness/results/tmp/${slug}-last.json`), { date, commit, dirty, rows });
  return md;
}
