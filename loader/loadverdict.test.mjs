// The LOAD verdict's treatment of a cancelled request, with no browser in it.
//
// ⛔ THE DISCRIMINATOR. Playwright reports a request the browser CANCELLED through the same `requestfailed` event
// as one that failed, so both arrive in the same list and `judgeLoad` judged them alike. They are not alike.
// Measured over the G1 artifact of a GREEN roster run: 16 `net::ERR_ABORTED` records, every one of them the
// browser's SECOND record of a real HTTP failure on the SAME URL, and ZERO standing alone. An abort that stands
// alone does not occur in a green run — it occurs when a request is still in flight as a leg tears the page down.
// `the-rainbow-void-tree` reddened a run that way on `audio/elevatorMusic1.mp3`, 3.3 MB and the largest request
// those pages make.
//
// So these tests hold the two apart, and the second one is the point: declassifying the unpaired abort must NOT
// declassify the paired one, because that is a real 404 wearing a second hat.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { judgeLoad } from '../tools/harness/page.mjs';

const BASE = 'http://127.0.0.1:9999/';
const manifest = { id: 'g', load: { known: { missingScripts: [], externalHosts: [], errorsBeforeReady: 0 } } };
const loader = { skipped: [], pageErrors: [] };
const judge = (failed) => judgeLoad(manifest, BASE, { failed, blocked: [], pageErrors: [] }, loader);
const MEDIA = `${BASE}games/g/audio/elevatorMusic1.mp3`;
const SCRIPT = `${BASE}games/g/js/layers.js`;

test('an UNPAIRED abort does not fail the load, and is still reported', () => {
  const v = judge([`${MEDIA} net::ERR_ABORTED`]);
  assert.equal(v.ok, true, 'a cancelled in-flight request is not a load failure');
  assert.deepEqual(v.failedBad, []);
  assert.deepEqual(v.abortedAlone, [`${MEDIA} net::ERR_ABORTED`], 'declassified, never silently dropped');
});

test('a PAIRED abort still fails — it is a real HTTP failure wearing a second hat', () => {
  const v = judge([`${SCRIPT} HTTP 404`, `${SCRIPT} net::ERR_ABORTED`]);
  assert.equal(v.ok, false);
  assert.equal(v.failedBad.length, 2, 'both records of the same failure are kept');
  assert.deepEqual(v.abortedAlone, [], 'a paired abort is not unpaired');
});

test('a plain HTTP failure is untouched', () => {
  const v = judge([`${SCRIPT} HTTP 404`]);
  assert.equal(v.ok, false);
  assert.equal(v.failedBad.length, 1);
});

test('an abort on a DECLARED missing script stays allowed, as before', () => {
  const m = { id: 'g', load: { known: { missingScripts: ['js/layers.js'], externalHosts: [], errorsBeforeReady: 0 } } };
  const v = judgeLoad(m, BASE, { failed: [`${SCRIPT} HTTP 404`, `${SCRIPT} net::ERR_ABORTED`], blocked: [], pageErrors: [] },
    { skipped: ['js/layers.js'], pageErrors: [] });
  assert.equal(v.ok, true);
  assert.deepEqual(v.failedBad, []);
});

test('an unpaired abort does not rescue an unrelated failure', () => {
  const v = judge([`${MEDIA} net::ERR_ABORTED`, `${SCRIPT} HTTP 404`]);
  assert.equal(v.ok, false, 'the 404 still reds the verdict');
  assert.deepEqual(v.failedBad, [`${SCRIPT} HTTP 404`]);
});
