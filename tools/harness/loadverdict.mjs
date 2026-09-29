// The LOAD verdict, alone in its own module and importing NOTHING.
//
// ⛔ WHY IT IS NOT IN `page.mjs`: the CI `units + repo-wide checks` job runs with **no `npm ci`**, on purpose
// (`.github/workflows/sweep.yml`: *"Every file this job runs imports only `node:` builtins and its own relative
// neighbours — the one dependency in package.json is Playwright, which nothing here touches"*). `page.mjs`
// imports Playwright, so a unit test that reached `judgeLoad` through it failed in CI while passing locally,
// where `node_modules` exists. A pure function that a browser-free job must test belongs in a browser-free file.

export function judgeLoad(manifest, base, pw, loader) {
  const known = (manifest.load && manifest.load.known) || null;
  const missing = new Set((known && known.missingScripts) || []);
  // load.known.missingAssets: an image/audio/font the entry document names and the repository does not ship. A
  // browser shows a broken image and carries on, so it may fail its request — and it is never in `skipped`, which
  // is the loader's record of SCRIPTS it skipped.
  const assets = new Set((known && known.missingAssets) || []);
  const hosts = new Set((known && known.externalHosts) || []);
  const gamePath = new URL(`games/${manifest.id}/`, base).pathname;
  const pathOf = (u) => { try { const p = new URL(u.split(' ')[0]).pathname; return p.startsWith(gamePath) ? p.slice(gamePath.length) : null; } catch { return null; } };
  const hostOf = (u) => { try { return new URL(u).hostname; } catch { return null; } };
  // ⛔ AN UNPAIRED `net::ERR_ABORTED` IS A TEARDOWN ARTEFACT, NOT A LOAD FAILURE (2026-09-21).
  // Playwright records a request the browser CANCELLED the same way it records one that failed, so the two arrive
  // in the same list and the gate judged them the same way. They are not the same thing, and the roster says so:
  // over the whole G1 artifact of a GREEN run, all 16 aborts are the browser's SECOND record of a real HTTP
  // failure on the SAME URL (the-pro-tree 10, the-question-tree 2, the-game-tree 2, the-periodic-tree 2), and
  // **zero** are unpaired. An abort that stands ALONE never appears in a green run at all — it appears when a
  // request is still in flight as a leg tears the page down, which is why the-rainbow-void-tree produced one on
  // `audio/elevatorMusic1.mp3`: at 3.3 MB it is the largest request those pages make and so the likeliest to be
  // caught mid-flight. That reddened a run whose page had loaded correctly.
  // So: a PAIRED abort is judged exactly as before (and is already covered wherever the manifest declares the
  // path); an UNPAIRED one is declassified — and COUNTED, never silently dropped, so it stays visible in the row.
  const httpFailedUrls = new Set(pw.failed.filter((f) => !/net::ERR_ABORTED/.test(String(f))).map((f) => String(f).split(' ')[0]));
  const isUnpairedAbort = (f) => /net::ERR_ABORTED/.test(String(f)) && !httpFailedUrls.has(String(f).split(' ')[0]);
  const abortedAlone = pw.failed.filter(isUnpairedAbort);
  const failedBad = pw.failed.filter((f) => !missing.has(pathOf(f)) && !assets.has(pathOf(f)) && !isUnpairedAbort(f));
  const blockedBad = pw.blocked.filter((u) => !hosts.has(hostOf(u)));
  const skipped = [...(loader.skipped || [])].sort();
  const skippedOk = JSON.stringify(skipped) === JSON.stringify([...missing].sort());
  const before = (loader.pageErrors || []).filter((e) => e.when === 'before-ready');
  const after = (loader.pageErrors || []).filter((e) => e.when !== 'before-ready');
  // Playwright's own count cannot exceed the loader's (read later); anything else means an error the loader did not see
  const errorsOk = known && known.errorsBeforeReady ? after.length === 0 && pw.pageErrors.length <= before.length + after.length : pw.pageErrors.length === 0 && after.length === 0 && before.length === 0;
  const ok = failedBad.length === 0 && blockedBad.length === 0 && skippedOk && errorsOk;
  const allowed = known ? { skipped: skipped.filter((f) => missing.has(f)).length, missingAssets: assets.size ? pw.failed.filter((f) => assets.has(pathOf(f)) && !/net::ERR_ABORTED/.test(String(f))).length : undefined, blockedHosts: [...new Set(pw.blocked.filter((u) => hosts.has(hostOf(u))).map(hostOf))].sort(), errorsBeforeReady: known.errorsBeforeReady ? before.length : 0 } : null;
  return { ok, allowed, failedBad, blockedBad, skippedOk, skipped, abortedAlone, errorsBeforeReady: before.length, errorsAfterReady: after.length, errorsAfterReadySample: after.slice(0, 3) };
}
