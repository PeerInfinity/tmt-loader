// Properties of the CI workflows that no run of them would tell you about in time — or that a run would tell you
// about only by looking GREEN.
//
// ⛔ THE INVERSION THESE TESTS LIVE UNDER. A CI change that runs LESS looks faster and greener. A job whose `needs:`
// is dropped starts spending ten runners on red units; a job that quietly gains an `if:` stops running and reports
// nothing, which renders identically to a pass; a gate moved out of a workflow leaves no trace at all in that
// workflow's output. None of those is visible in a run's own result, so they are asserted here.
//
// ⚖ User ruling, 2026-09-18: the Pages deploy stops happening on every push. That ruling lives in one place — the
// absence of a `push:` trigger in .github/workflows/pages.yml — and the way it gets undone is not malice but
// convenience: someone wants the site current after a merge and adds four lines. By the time anyone notices, the
// ruling has been silently reversed for weeks. So it is asserted here instead of remembered.
//
// The second property is the same hazard wearing the other hat: the sweep runs on every push, so if IT ever grew a
// deploy step, push-deploys-the-site would be back with a different file name on it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const REPO = path.resolve(new URL('..', import.meta.url).pathname);
const wf = (n) => fs.readFileSync(path.join(REPO, '.github/workflows', n), 'utf8');

/** The workflow's jobs as {name: body}, by indentation. No YAML dependency, as above. */
function jobs(text) {
  const lines = text.split('\n');
  const start = lines.findIndex((l) => /^jobs:\s*$/.test(l));
  assert.ok(start >= 0, 'the workflow has no `jobs:` block');
  const out = {};
  let name = null, body = [];
  for (const l of lines.slice(start + 1)) {
    const m = /^ {2}([a-zA-Z_][\w-]*):\s*$/.exec(l);
    if (m) { if (name) out[name] = body.join('\n'); name = m[1]; body = []; continue; }
    if (/^\S/.test(l) && l.trim()) break;
    if (name) body.push(l);
  }
  if (name) out[name] = body.join('\n');
  return out;
}

/** The job names a job lists in `needs:` (scalar or list form). */
function needs(body) {
  const one = /^\s{4}needs:\s*([\w-]+)\s*$/m.exec(body);
  if (one) return [one[1]];
  const inline = /^\s{4}needs:\s*\[([^\]]*)\]/m.exec(body);
  if (inline) return inline[1].split(',').map((x) => x.trim()).filter(Boolean);
  const block = /^\s{4}needs:\s*\n((?:\s{6}-\s*[\w-]+\s*\n)+)/m.exec(body);
  if (block) return [...block[1].matchAll(/-\s*([\w-]+)/g)].map((m) => m[1]);
  return [];
}

/** The keys of the top-level `on:` block, by indentation. No YAML dependency, and this file has no reason to be exotic. */
function triggers(text) {
  const lines = text.split('\n');
  const i = lines.findIndex((l) => /^on:\s*$/.test(l) || /^on:\s*\S/.test(l));
  assert.ok(i >= 0, 'the workflow has no `on:` block at all');
  const inline = /^on:\s*(\S.*)$/.exec(lines[i]);
  if (inline) return inline[1].replace(/[[\],]/g, ' ').split(/\s+/).filter(Boolean);
  const out = [];
  for (const l of lines.slice(i + 1)) {
    if (/^\S/.test(l)) break;                       // back to column 0: the block ended
    const m = /^ {2}(\w[\w-]*):/.exec(l);           // exactly one level in
    if (m) out.push(m[1]);
  }
  return out;
}

test('pages.yml deploys ONLY on workflow_dispatch — never on a push', () => {
  const t = triggers(wf('pages.yml'));
  assert.deepEqual(t, ['workflow_dispatch'],
    `the Pages deploy is manual by ⚖ user ruling (2026-09-18); this workflow now triggers on ${t.join(', ')}`);
});

test('the sweep does not publish', () => {
  const s = wf('sweep.yml');
  for (const forbidden of ['deploy-pages', 'upload-pages-artifact', 'configure-pages']) {
    // a mention inside a comment is how this file explains itself; a `uses:` is the thing that would deploy
    const uses = s.split('\n').filter((l) => /^\s*-?\s*uses:/.test(l) && l.includes(forbidden));
    assert.deepEqual(uses, [], `sweep.yml runs ${forbidden} — that puts the deploy back on every push`);
  }
});

test('the sweep runs on push and on dispatch', () => {
  assert.deepEqual(triggers(wf('sweep.yml')).sort(), ['push', 'workflow_dispatch']);
});

test('the shard matrix and the SHARDS the runner is told about are the same number', () => {
  // They are two literals in one file, and a mismatch would not surface until a run: `--shard 11/10` throws, and
  // `--expect 10` against 12 shards refuses. Both are correct refusals and both cost a full CI run to discover.
  const s = wf('sweep.yml');
  const n = Number(/^\s*SHARDS:\s*'(\d+)'/m.exec(s)[1]);
  const matrix = /^\s*shard: \[([^\]]+)\]/m.exec(s)[1].split(',').map((x) => Number(x.trim()));
  assert.deepEqual(matrix, Array.from({ length: n }, (_, i) => i + 1),
    `SHARDS is ${n} but the matrix is [${matrix.join(', ')}]`);
});

test('the merge job cannot be skipped by a failing shard, and does not fire on a cancelled run', () => {
  // A bare `needs: shard` means one red shard silently skips the roster assertion — the exact shape of "a dead
  // shard reads as green" this whole arrangement exists to prevent. So the job needs a condition.
  //
  // ⚠ But NOT `always()`, which is true even when the RUN WAS CANCELLED. With `cancel-in-progress`, a newer push
  // cancels this run's shards mid-flight; an `always()` merge would then find them missing and report a RED that
  // means nothing, on the one gate whose value is that a red means something. `!cancelled()` gives both.
  const s = wf('sweep.yml');
  const merge = s.slice(s.indexOf('\n  merge:'));
  const cond = /^\s{4}if: (.+)$/m.exec(merge);
  assert.ok(cond, 'the merge job has no `if:` at all — a failing shard would skip the roster assertion');
  assert.match(cond[1], /!cancelled\(\)/, `the merge job's condition is \`${cond[1]}\``);
  assert.doesNotMatch(cond[1], /\balways\(\)/, 'always() fires on a cancelled run and would report a false missing shard');
  assert.match(merge, /needs: shard/);
  assert.doesNotMatch(merge, /continue-on-error:\s*true/, 'the merge is the verdict; it may not be advisory');
});

// ---------------------------------------------------------------------------------------------------------------
// U2g: the rest of the battery moved into CI. What it is easy to undo, asserted.
// ---------------------------------------------------------------------------------------------------------------

test('every expensive job in the sweep is GATED by the fast one', () => {
  // The fast job is the unit tests, the roster doc, the declined list and the figures census: seconds, no browser.
  // Its entire value is that nothing else starts when it is red. A `needs:` dropped for convenience — "my change
  // does not touch the units" — spends ten runners plus three more to discover what three seconds already knew,
  // and nothing about the resulting run would look wrong.
  const j = jobs(wf('sweep.yml'));
  assert.ok(j.fast, 'sweep.yml has no `fast` job at all');
  for (const name of ['shard', 'g1', 'anchors', 'options']) {
    assert.ok(j[name], `sweep.yml has no \`${name}\` job`);
    assert.deepEqual(needs(j[name]), ['fast'], `the ${name} job does not wait for the fast checks`);
  }
  // …and the merge is gated transitively, through the matrix, which is the one correct way for it to be skipped
  assert.deepEqual(needs(j.merge), ['shard']);
});

test('the fast job runs all three cheap checks — as CHECKS, not inside its own summary', () => {
  // ⚠ The first version of this test asserted only that the command appeared in the job, and a mutant walked
  // straight through it: the summary step at the end of the job reruns `census-figures.mjs` to paste its output
  // into $GITHUB_STEP_SUMMARY, swallowing the exit code with `|| true`. Deleting the real step left the text in
  // place and the test green. A command whose status nothing reads is not a check.
  const j = jobs(wf('sweep.yml'));
  const steps = j.fast.split(/^ {6}- /m).slice(1);
  for (const cmd of ['npm run harness:test', 'node tools/games-table.mjs --check', 'node tools/census-figures.mjs']) {
    const real = steps.filter((st) => st.includes(cmd) && !st.includes('GITHUB_STEP_SUMMARY'));
    assert.ok(real.length >= 1, `the fast job no longer runs \`${cmd}\` as a step whose failure fails the job`);
  }
  assert.doesNotMatch(j.fast, /playwright install/, 'the fast job installed a browser — it is then no longer the fast job');
});

test('G1 in CI carries the SAME roster assertion as the sharded sweep', () => {
  // G1 does not shard (measured: 5 min serial for the roster, against ~90 s of fixed setup a matrix would pay ten
  // times). ⛔ Unsharded is not unasserted: it runs as `--shard 1/1` and the same merge-shards refuses it if the
  // rows do not reconstruct the roster. A gate that quietly enumerated 170 games would otherwise pass.
  const j = jobs(wf('sweep.yml'));
  assert.match(j.g1, /--gate load[^\n]*--shard 1\/1/, 'the G1 job does not record the roster it was assigned');
  assert.match(j.g1, /merge-shards\.mjs shards --expect 1/, 'the G1 job does not assert its coverage');
});

test('every gate run that writes a shard JSON is followed by a merge assertion', () => {
  // Stated as a property rather than per job, so a gate added tomorrow inherits it.
  const j = jobs(wf('sweep.yml'));
  // …either in the job itself (G1, one shard) or in a job downstream of it (the M1 matrix, whose merge is its own
  // job because the shards have to upload their artifacts first). Both are the assertion; neither is optional.
  const merges = (name) => /merge-shards\.mjs/.test(j[name]) || Object.entries(j).some(([n, b]) => needs(b).includes(name) && /merge-shards\.mjs/.test(b));
  const produced = Object.keys(j).filter((n) => /--gate \w+[^\n]*--json/.test(j[n]));
  assert.ok(produced.length >= 2, `only ${produced.length} job(s) run a gate at all — did one get dropped?`);
  for (const name of produced) {
    assert.ok(merges(name), `job \`${name}\` runs a gate into a JSON and nothing ever asserts what it covered`);
  }
});

test('⚖ G5 runs on the DEPLOY and nowhere else', () => {
  // User ruling, 2026-09-18. check-pages.mjs hits the published site; on a push it would certify something the push
  // did not change, because pushes no longer deploy. The two halves of that ruling:
  const pages = wf('pages.yml'), sweep = wf('sweep.yml');
  assert.match(pages, /check-pages\.mjs --live/, 'pages.yml no longer verifies the deploy it just made');
  assert.doesNotMatch(sweep, /check-pages\.mjs/, 'the sweep runs G5 again — it is on the push, where it certifies an unchanged site');
  // and it runs AFTER the deploy, not beside it
  const j = jobs(pages);
  assert.ok(j.verify, 'pages.yml has no verify job');
  assert.deepEqual(needs(j.verify), ['deploy'], 'the verification does not wait for the deploy');
  assert.match(j.verify, /--live "\$URL"/, 'the verification does not run against the deployed URL');
});

test('the deploy verification may not be advisory, and may not skip itself', () => {
  // A check that cannot fail the workflow is decoration, and a check with a condition on it is a check that one
  // day quietly stops running. Both read as a green deploy.
  const j = jobs(wf('pages.yml'));
  assert.doesNotMatch(j.verify, /continue-on-error:\s*true/, 'the deploy verification is advisory — then a red deploy is still a green run');
  const cond = /^\s{4}if: (.+)$/m.exec(j.verify);
  assert.equal(cond, null, `the verify job has a condition on it (\`${cond && cond[1]}\`), so it can skip and report nothing`);
  // the steps that produce the verdict are unconditional too; only the reporting steps may carry `if: always()`
  const verdict = j.verify.split('\n').findIndex((l) => l.includes('check-pages.mjs'));
  assert.ok(verdict > 0);
});

test('the live check is in the file that deploys, and the deploy is in no other file', () => {
  // The pair, stated together: if either half moved, push-deploys-the-site would be back under a different name, or
  // the live check would be running against a site nobody had just published.
  assert.deepEqual(triggers(wf('pages.yml')), ['workflow_dispatch']);
  const deployers = ['pages.yml', 'sweep.yml'].filter((f) => wf(f).split('\n').some((l) => /^\s*-?\s*uses:/.test(l) && /deploy-pages/.test(l)));
  assert.deepEqual(deployers, ['pages.yml']);
  const verifiers = ['pages.yml', 'sweep.yml'].filter((f) => /check-pages\.mjs/.test(wf(f)));
  assert.deepEqual(verifiers, ['pages.yml']);
});

test('⛔ every piped step declares `shell: bash` — or the pipe eats the verdict', () => {
  // MEASURED, 2026-09-19, and it had been true since the merge job was written. GitHub's default shell is
  // `bash -e {0}`: a pipeline's exit status is its LAST command, so `merge-shards.mjs … | tee merge.txt` reports
  // `tee`'s 0 and the step SUCCEEDS while the merge is printing "MERGE REFUSED — no shard files were found at all".
  // The one job whose entire purpose is to refuse a matrix that covered nothing could not fail. It surfaced only
  // because the fast gate was driven red: the matrix was skipped, no artifact existed, and the merge went green.
  //
  // `shell: bash` is `bash --noprofile --norc -eo pipefail`, which restores the refusal. The rule is stated for
  // EVERY piped step, including the summary ones that end in `|| true`, so there is no exception to argue about.
  for (const file of ['sweep.yml', 'pages.yml']) {
    const j = jobs(wf(file));
    for (const [name, body] of Object.entries(j)) {
      for (const step of body.split(/^ {6}- /m).slice(1)) {
        // a single `|` followed by a command — NOT `||` (which is a fallback, not a pipeline) and not the YAML
        // block scalar `run: |`
        const piped = step.split('\n').filter((l) => /(^|[^|])\|(?!\|)\s*[a-z]/.test(l) && !/run:\s*\|-?\s*$/.test(l) && !/^\s*#/.test(l));
        if (!piped.length) continue;
        assert.match(step, /^\s*shell: bash\b/m,
          `${file} job \`${name}\`: a step pipes (${piped[0].trim().slice(0, 60)}…) without \`shell: bash\`, so a failure on the left of the pipe reports success`);
      }
    }
  }
});
