// The flag resolution (loader/flags.mjs, docs/options.md): which of the URL and the stored preference answers for
// each opt-in. It is here rather than in the browser gate because it is the part of U3 that can be wrong in a way
// no page shows — a page that renders the mobile layout looks the same whichever of the two asked for it.
//
// ⛔ THE MATRIX IS THE TEST. Every cell of {url on, url off, url absent} × {stored on, stored off, stored absent} is
// asserted for the value AND for who said so, because "the URL wins" is only half a rule if it is checked in one
// direction: the failure this arc is guarding against is a stored `true` that an explicit `?mobile=0` cannot undo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FLAGS, PREF_KEY, parsePrefs, serializePrefs, resolveFlags } from './flags.mjs';

const P = (q) => new URLSearchParams(q);

test('with nothing said anywhere, every flag is off — the page the loader has always served', () => {
  const r = resolveFlags(P(''), {});
  assert.deepEqual([r.mobile, r.navbar, r.automation], [false, false, false]);
  assert.deepEqual(r.source, { mobile: 'default', navbar: 'default', automation: 'default' });
});

test('the URL answers for its flag in BOTH directions, over any stored preference', () => {
  for (const flag of FLAGS) {
    const on = resolveFlags(P(`${flag}=1`), { [flag]: false });
    assert.equal(on[flag], true, `?${flag}=1 over a stored false`);
    assert.equal(on.source[flag], 'url');
    const off = resolveFlags(P(`${flag}=0`), { [flag]: true });
    assert.equal(off[flag], false, `?${flag}=0 over a stored true`);
    assert.equal(off.source[flag], 'url');
  }
});

test('a parameter that is PRESENT answers, whatever it says — presence is the rule, not truth', () => {
  // the harness asks for an inert page by URL alone; `?mobile=` must not fall through to a stored `true`
  for (const q of ['mobile=', 'mobile=0', 'mobile=yes', 'mobile=true']) {
    const r = resolveFlags(P(q), { mobile: true });
    assert.equal(r.mobile, false, q);
    assert.equal(r.source.mobile, 'url');
  }
});

test('the stored preference answers when the URL says nothing about that flag', () => {
  for (const flag of FLAGS) {
    const r = resolveFlags(P('mod=ptr&managed=1'), { [flag]: true });
    assert.equal(r[flag], true);
    assert.equal(r.source[flag], 'stored');
  }
});

test('one flag stored does not move the others', () => {
  const r = resolveFlags(P(''), { automation: true });
  assert.deepEqual([r.mobile, r.navbar, r.automation], [false, false, true]);
  assert.deepEqual(r.source, { mobile: 'default', navbar: 'default', automation: 'stored' });
});

test('the mobile layout still IMPLIES the bar — from the store as from the URL', () => {
  for (const [params, prefs, why] of [[P('mobile=1'), {}, 'url'], [P(''), { mobile: true }, 'stored']]) {
    const r = resolveFlags(params, prefs);
    assert.equal(r.navbar, true, why);
    assert.equal(r.source.navbar, 'implied');
  }
  // and an explicit `?navbar=0` does not take the bar away underneath the layout, exactly as before U3
  const r = resolveFlags(P('mobile=1&navbar=0'), {});
  assert.deepEqual([r.mobile, r.navbar], [true, true]);
});

test('the bar on its own leaves the layout off', () => {
  const r = resolveFlags(P('navbar=1'), {});
  assert.deepEqual([r.mobile, r.navbar], [false, true]);
  assert.equal(r.source.navbar, 'url');
});

test('every cell of the 3 × 3 matrix, for mobile', () => {
  const urls = [['mobile=1', true], ['mobile=0', false], ['', null]];
  const stores = [[{ mobile: true }, true], [{ mobile: false }, false], [{}, null]];
  const got = [];
  for (const [q, u] of urls) for (const [s, v] of stores) {
    const r = resolveFlags(P(q), s);
    got.push([u, v, r.mobile, r.source.mobile]);
  }
  assert.deepEqual(got, [
    [true, true, true, 'url'], [true, false, true, 'url'], [true, null, true, 'url'],
    [false, true, false, 'url'], [false, false, false, 'url'], [false, null, false, 'url'],
    [null, true, true, 'stored'], [null, false, false, 'stored'], [null, null, false, 'default'],
  ]);
});

test('nothing we did not write is a preference', () => {
  for (const raw of [null, '', 'not json', '[]', '"mobile"', '{"mobile":"1"}', '{"mobile":1}', '{"other":true}']) {
    assert.deepEqual(parsePrefs(raw), {}, JSON.stringify(raw));
  }
  assert.deepEqual(parsePrefs('{"mobile":true,"automation":false,"nope":true}'), { mobile: true, automation: false });
});

test('a stored `false` is never written — "nothing remembered" and "all off" are one state', () => {
  assert.equal(serializePrefs({}), null);
  assert.equal(serializePrefs({ mobile: false, navbar: false, automation: false }), null);
  assert.equal(serializePrefs({ mobile: true, navbar: false }), '{"mobile":true}');
  // …and what comes back out of a round trip resolves to what went in
  assert.equal(resolveFlags(P(''), parsePrefs(serializePrefs({ automation: true }))).automation, true);
  assert.equal(resolveFlags(P(''), parsePrefs(serializePrefs({ automation: false }))).automation, false);
});

test('the preference key can never fall inside a game’s save namespace', () => {
  // the save shim namespaces every game key as `tmt-loader:<id>:`, and the picker’s clear-save button deletes
  // everything under one. A key with no second colon cannot be under any of them, for any id, now or later.
  assert.equal(PREF_KEY.startsWith('tmt-loader:'), true);
  assert.equal(PREF_KEY.slice('tmt-loader:'.length).includes(':'), false);
});
