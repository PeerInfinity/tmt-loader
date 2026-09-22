// The media exception's AUDIO witness: the silent stubs inside the real games that play sound, through each game's
// OWN code path (its music player, its playSound), in a real engine. Every media element the page creates is
// instrumented from before the game's first script: loadedmetadata / error / ended / loop restarts / play() rejections,
// plus page errors. A stub is right when every element loads, none errors, no `play()` is rejected for a decode
// reason, nothing throws, and nothing cycles: `ended` fires at most once per one-shot element (a looping element
// restarts silently, once per STUB_SECONDS, which is the only cadence a stub can have).
//   node tools/harness/media-audio.mjs [--root <tree>] [--browser chromium|firefox|webkit] [--seconds 6] [--json <out>]
// ⚠ A measurement for the record (docs/add-a-game.md), not a CI gate.
import path from 'node:path';
import { REPO, parseArgs, startServer, writeJSON } from './lib.mjs';
import { openContext, openGame } from './page.mjs';

// Each game's own path to its audio — the calls a player's click would make, made directly.
const DRIVES = {
  'the-rainbow-void-tree': `options.musicOn = true; changeSong();
    for (const k of songList.slice(0, 3)) { options.currentSong = k; changeSong(); }
    options.soundOn = true; playSound('EquationChange'); playSound('Upgrade', 'ogg', 0.7); playSound('GambleReset', 'wav');`,
  'the-jax-tree': `options.music = true; setupMusic(); toggleMusic();
    for (const k of [2, 3, 4, 1]) { player.musicTrack = k; updateMusicSource(); }`,
  'the-danus-tree': `new Audio("tp.wav").play(); new Audio("DanusUnlock.ogg").play();`,
  'sorbet-s-convolution-mainframe': `playSound(0);`,
  'the-congratulations-tree': `new Audio("resources/HeyGuys.mp3").play();`,
  'the-dressy-tree': `new Audio("js/sound.mp3").play();`,
};

const INSTRUMENT = () => {
  const log = (window.__audio = []);
  const watch = (el) => {
    if (el.__w) return;
    const r = { src: '', loop: false, events: {}, restarts: 0, lastT: 0, rejects: [] };
    el.__w = r; log.push(r);
    for (const e of ['loadedmetadata', 'error', 'ended', 'playing', 'pause']) el.addEventListener(e, () => { r.src = (el.currentSrc || el.src || '').replace(location.origin, ''); r.events[e] = (r.events[e] || 0) + 1; if (e === 'error') r.error = el.error && el.error.code; });
    el.addEventListener('timeupdate', () => { if (el.currentTime + 0.05 < r.lastT) r.restarts++; r.lastT = el.currentTime; });
  };
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    watch(this);
    const p = play.call(this);
    const r = this.__w;
    if (p && p.catch) p.catch((e) => r.rejects.push(String(e && e.name)));
    return p;
  };
  const load = HTMLMediaElement.prototype.load;
  HTMLMediaElement.prototype.load = function () { watch(this); return load.call(this); };
  const A = window.Audio;
  window.Audio = function (src) { const el = new A(src); watch(el); return el; };
  window.Audio.prototype = A.prototype;
};

const a = parseArgs(process.argv.slice(2));
const which = a.browser || 'chromium';
const seconds = Number(a.seconds || 6);
const pw = await import('playwright');
const launch = which === 'chromium' ? { args: ['--autoplay-policy=no-user-gesture-required'] } : which === 'firefox' ? { firefoxUserPrefs: { 'media.autoplay.default': 0, 'media.autoplay.blocking_policy': 0 } } : {};
const browser = await pw[which].launch(launch);
const root = path.resolve(a.root || REPO);
const server = await startServer(root);
const out = {};
try {
  for (const [id, drive] of Object.entries(DRIVES)) {
    const { context, stats } = await openContext(browser);
    await context.addInitScript(INSTRUMENT);
    const page = await context.newPage();
    const o = await openGame(page, server.url, id, { managed: true, automation: false });
    let driveError = null;
    try { await page.evaluate(drive); } catch (e) { driveError = String(e.message).slice(0, 300); }
    await page.waitForTimeout(seconds * 1000);
    const els = await page.evaluate(() => window.__audio);
    const srcs = els.length;
    const oneShotCycling = els.filter((e) => (e.events.ended || 0) > 1);
    const errors = els.filter((e) => e.events.error);
    const unloaded = els.filter((e) => !e.events.loadedmetadata && !e.events.error);
    const ok = o.ready && !driveError && !errors.length && !unloaded.length && !oneShotCycling.length && stats.pageErrors.length === 0 && els.length > 0;
    out[id] = { ok, ready: o.ready, driveError, elements: srcs, loaded: els.filter((e) => e.events.loadedmetadata).length, errors: errors.length, ended: els.reduce((s, e) => s + (e.events.ended || 0), 0), restarts: els.reduce((s, e) => s + e.restarts, 0), rejects: [...new Set(els.flatMap((e) => e.rejects))], pageErrors: stats.pageErrors.length, failed: stats.failed.length, errorSrcs: errors.map((e) => `${e.src} (MediaError ${e.error})`), failedRequests: stats.failed.slice(0, 5) };
    console.log(`${which} ${id}: ${ok ? 'OK' : 'RED'} ${JSON.stringify(out[id])}`);
    await context.close();
  }
} finally { await browser.close(); server.stop(); }
const red = Object.values(out).filter((r) => !r.ok).length;
console.log(`media-audio: ${which} over ${root}, ${seconds} s per game, ${Object.keys(out).length} games — ${red ? `${red} RED` : 'GREEN'}`);
if (a.json) writeJSON(a.json, { browser: which, root, seconds, games: out });
process.exit(red ? 1 : 0);
