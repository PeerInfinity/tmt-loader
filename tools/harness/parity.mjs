// Node ≡ page: runs run.mjs (Node child) and page.mjs (headless Chromium) at identical args and diffs stateJSON().
// Exit 1 on any difference, printing the first divergent key with 120 chars of context each side.
//   node parity.mjs <id> [--ticks N] [--diff d] [--leg idle|policy] [--base URL] [--json out]
//                        [--profile off|all|saved] [--exclude au] [--auto-opt "k=v;k2=v2"] [--no-automation]
//   --mutant: the page adds 1 point before ticking — a control that MUST diverge (proves the diff can fail)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';
import { REPO, parseArgs, startServer, firstDivergence, hash16, writeJSON } from './lib.mjs';
import { runNode } from './run.mjs';
import { runPage } from './page.mjs';

export async function parity(id, { ticks, diff, leg = 'idle', base, browser, mutant = false, profile = null, exclude = [], autoOpt = null, automation = true }) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-parity-'));
  const stateFile = path.join(tmp, 'node.json');
  const node = runNode(id, { ticks, diff, leg, 'state-out': stateFile, profile, exclude: exclude.length ? exclude.join(',') : undefined, 'auto-opt': autoOpt || undefined, automation });
  if (!node.ok) return { id, ok: false, error: `node: ${node.failed_at} ${node.error}` };
  const nodeJson = fs.readFileSync(stateFile, 'utf8');
  const page = await runPage(browser, base, id, { ticks, diff, leg, mutant, profile, exclude, autoOpt, automation });
  const div = firstDivergence(nodeJson, page.json);
  return {
    id, ok: !div && node.ticks === page.ticks && node.gameSeconds === page.gameSeconds && page.blocked === 0 && page.failed === 0 && page.pageErrors.length === 0,
    ticks: node.ticks, gameSeconds: node.gameSeconds, diff, leg, automation, profile: profile || 'off',
    node: { ticks: node.ticks, gameSeconds: node.gameSeconds, hash: node.hash, jsonHash: hash16(nodeJson), hook: node.hook },
    page: { ticks: page.ticks, gameSeconds: page.gameSeconds, hash: page.hash, hook: page.hook, ms: page.ms, blocked: page.blocked, failed: page.failed, pageErrors: page.pageErrors },
    divergence: div,
  };
}

async function main() {
  const a = parseArgs(process.argv.slice(2), ['mutant', 'no-automation']);
  const id = a._[0];
  if (!id) { console.error('usage: node parity.mjs <id> [--ticks N] [--diff d]'); process.exit(2); }
  const browser = await chromium.launch();
  const server = a.base ? null : await startServer(REPO);
  let r;
  try { r = await parity(id, { ticks: Number(a.ticks ?? 1000), diff: Number(a.diff ?? 0.05), leg: a.leg || 'idle', mutant: !!a.mutant, base: a.base || server.url, browser, profile: a.profile || null, exclude: a.exclude ? a.exclude.split(',') : [], autoOpt: a['auto-opt'] || null, automation: !a['no-automation'] }); }
  finally { await browser.close(); if (server) server.stop(); }
  if (r.divergence) {
    console.log(`DIVERGED at char ${r.divergence.index}, key "${r.divergence.key}" (ticks ${r.ticks}, gameSeconds ${r.gameSeconds})`);
    console.log(`  node: …${r.divergence.a}…`);
    console.log(`  page: …${r.divergence.b}…`);
  }
  console.log(JSON.stringify({ ...r, divergence: r.divergence ? { index: r.divergence.index, key: r.divergence.key } : null }));
  if (a.json) writeJSON(a.json, r);
  process.exit(r.ok ? 0 : 1);
}
if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e); process.exit(2); });
