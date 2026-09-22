// Test suite for v0.9: Multiverse — save bridge, universe switcher, hard cut
// Run: node test/multiverse_bridge_test.js
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const Decimal = require(path.join(ROOT, 'js', 'technical', 'break_eternity.js'));

let failures = 0;
function check(name, cond, extra) {
	if (cond) {
		console.log("  PASS  " + name);
	} else {
		failures++;
		console.log("  FAIL  " + name + (extra !== undefined ? "  [" + extra + "]" : ""));
	}
}

// ---------------------------------------------------------------------------
// Sandbox for multiverse.js — deliberately NO document/window, which is the
// same situation as the game running before the DOM is ready. Everything the
// bridge does (decode, digest, bonus) must still work.
// ---------------------------------------------------------------------------
const store = {};
const sandbox = {
	console,
	Decimal,
	format: (x) => String(x),
	localStorage: {
		getItem: (k) => (k in store ? store[k] : null),
		setItem: (k, v) => { store[k] = String(v); },
		removeItem: (k) => { delete store[k]; },
	},
	// strict, like the browser: atob() throws on characters outside the alphabet
	atob: (b64) => {
		const clean = String(b64).replace(/[\s"']/g, '');
		if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean) || clean.length % 4 === 1) throw new Error("InvalidCharacterError");
		return Buffer.from(clean, 'base64').toString('binary');
	},
	encodeURIComponent,
	decodeURIComponent,
	unescape,
	escape,
	TextDecoder: global.TextDecoder,
	Uint8Array: global.Uint8Array,
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/technical/multiverse.js'), 'utf8'), sandbox);

const MV = sandbox.MULTIVERSE;

// ---------------------------------------------------------------------------
console.log("== 1. Foreign number parsing ==");
const cases = [
	["1e1234", 1234],           // break_eternity toJSON, the common case
	["1500", Math.log10(1500)], // small values serialize without an exponent
	["1e100000000000", 1e11],   // "1e1e11"-style double exponent (PT Classic endgame)
	["0", 0],
	["-5", 0],
	["10", 1],
	[1e9, 9],
	[0, 0],
	[Infinity, 1e15],           // must not produce NaN/Infinity
	[null, 0],
	[undefined, 0],
	["", 0],
	["nonsense", 0],
	[{"mantissa": 1.5, "exponent": 20}, 20 + Math.log10(1.5)], // legacy Decimal shape
	[{"sign": 1, "mag": 100, "layer": 1}, 100],                  // modern internal shape
	[{"sign": -1, "mag": 100, "layer": 1}, 0],                    // negative -> no credit
];
for (const [input, want] of cases) {
	const got = MV.log10(input);
	const ok = want === 0 ? got === 0 : Math.abs(got - want) < 1e-9;
	check(`log10(${JSON.stringify(input)}) = ${want}`, ok && isFinite(got), String(got));
}
check("log10 never returns a negative number", cases.every(([input]) => MV.log10(input) >= 0));

// ---------------------------------------------------------------------------
console.log("== 2. Save decoding across the 4 formats in the wild ==");
const b64 = (s) => Buffer.from(s, 'binary').toString('base64');
const playerJSON = JSON.stringify({ tab: "tree", points: "1e500", p: { points: "1e22", upgrades: [11, 12, 13] } });

// (a) plain btoa(JSON.stringify(player)) — basic-tree, incrementreeverse, dimensions, classic
store['cpt_basic'] = b64(playerJSON);
let d = MV.scan(true).find(r => r.key === 'basic');
check("plain base64 save decodes", d.found && Math.abs(d.log - 500) < 1e-6, JSON.stringify(d));

// (b) btoa(unescape(encodeURIComponent(...))) with CJK — the-pro-tree, dice, milestone
const cjk = JSON.stringify({ points: "1e88", name: "专业之树", tab: "tree" });
store['cpt_pro'] = b64(unescape(encodeURIComponent(cjk)));
d = MV.scan(true).find(r => r.key === 'pro');
check("UTF-8 save with CJK decodes", d.found && Math.abs(d.log - 88) < 1e-6, JSON.stringify(d));

// (c) allSaves wrapper {set:"default", default:{...}} — PT: Rewritten and NG+
store['cpt_rewritten'] = b64(JSON.stringify({ set: "default", default: { points: "1e300", tab: "tree" }, old: { points: "1e2" } }));
d = MV.scan(true).find(r => r.key === 'rewritten');
check("allSaves wrapper unwrapped to the active slot", d.found && Math.abs(d.log - 300) < 1e-6, JSON.stringify(d));

// (d) {player: ...} wrapper, plus a raw un-encoded JSON save as a fallback
store['cpt_ng'] = b64(JSON.stringify({ player: { points: "1e40", tab: "tree" } }));
d = MV.scan(true).find(r => r.key === 'ng');
check("{player} wrapper unwrapped", d.found && Math.abs(d.log - 40) < 1e-6, JSON.stringify(d));
store['cpt_demo'] = JSON.stringify({ points: "1e7", tab: "tree" });
d = MV.scan(true).find(r => r.key === 'demo');
check("unencoded JSON save still decodes", d.found && Math.abs(d.log - 7) < 1e-6, JSON.stringify(d));

// (e) hostile input: must never throw into the game loop
for (const junk of ["not base64 at all!!", "@@@@", b64("]]]not json"), b64("[1,2,3]"), b64('"a string"'), b64("null"), ""]
) {
	store['cpt_classic'] = junk;
	let threw = false, rec;
	try { rec = MV.scan(true).find(r => r.key === 'classic'); } catch (e) { threw = true; }
	check(`junk save ${JSON.stringify(junk.slice(0, 14))} degrades to no-signal`, !threw && rec && !rec.found, threw ? "threw" : JSON.stringify(rec));
}
delete store['cpt_classic'];

// prototype pollution / arrays must not be treated as players
store['cpt_dimensions'] = b64(JSON.stringify({ points: "1e9", list: [1, 2, 3], nested: { points: "1e12" } }));
d = MV.scan(true).find(r => r.key === 'dimensions');
check("nested layer objects still found", d.found && Math.abs(d.log - 12) < 1e-6, JSON.stringify(d));

// ---------------------------------------------------------------------------
console.log("== 3. Convergence bonus ==");
MV.REALMS.forEach(r => { delete store[r.save]; });
MV.scan(true);
check("no saves -> multiplier is exactly 1", MV.bonus().mult === 1 && MV.bonus().hit === 0);
check("bonusDecimal returns a Decimal, not undefined", MV.bonusDecimal() instanceof sandbox.Decimal || typeof MV.bonusDecimal().gte === 'function');
check("bonusDecimal >= 1 with nothing to read", MV.bonusDecimal().gte(1));

store['cpt_classic'] = b64(JSON.stringify({ points: "1e100" }));   // 1+0.05*10      = 1.5
store['cpt_rewritten'] = b64(JSON.stringify({ points: "1e400" })); // 1+0.05*20      = 2
MV.scan(true);
let b = MV.bonus();
check("two realms contribute 1.5 * 2 = 3", Math.abs(b.mult - 3) < 1e-9, String(b.mult));
check("hit count is 2", b.hit === 2, String(b.hit));
check("bonusDecimal matches the cached product", Math.abs(MV.bonusDecimal().toNumber() - 3) < 1e-6);

// absurd progress must saturate, not explode
store['cpt_pro'] = b64(JSON.stringify({ points: "1e1e11" }));
MV.scan(true);
check("1e1e11 realm saturates at the x100 cap", Math.abs(MV.realmMult(1e11) - 100) < 1e-9, String(MV.realmMult(1e11)));
check("total bonus stays finite", isFinite(MV.bonus().mult) && MV.bonus().mult > 0, String(MV.bonus().mult));
check("realm with 0 progress contributes nothing", MV.realmMult(0) === 1 && MV.realmMult(-5) === 1);

// ---------------------------------------------------------------------------
console.log("== 3b. Fingerprint cache (must not go stale, must not re-parse) ==");
for (const r of MV.REALMS) delete store[r.save];
store['cpt_classic'] = b64(JSON.stringify({ points: "1e100" }));
MV.scan(true);
const firstRec = MV.record('classic');
check("first digest reads 1e100", firstRec.found && Math.abs(firstRec.log - 100) < 1e-9, JSON.stringify(firstRec));
MV.scan(true);
check("unchanged save is carried over without re-parsing", MV.record('classic') === firstRec);
store['cpt_classic'] = b64(JSON.stringify({ points: "1e200" }));
MV.scan(true);
check("a newer save is picked up immediately", Math.abs(MV.record('classic').log - 200) < 1e-9, String(MV.record('classic').log));
delete store['cpt_classic'];
MV.scan(true);
check("a deleted save degrades back to no-signal", !MV.record('classic').found);
check("same length but different tail still re-parses", (() => {
	const a = b64(JSON.stringify({ points: "1e100" }));
	const b2 = b64(JSON.stringify({ points: "1e100x", tail: "differentending!!" }));
	store['cpt_classic'] = a; MV.scan(true);
	store['cpt_classic'] = b2; MV.scan(true);
	const rec = MV.record('classic');
	delete store['cpt_classic'];
	return rec.found === false || Math.abs(rec.log - 100) > 1e-9 || rec.path === 'points';
})());

// ---------------------------------------------------------------------------
console.log("== 4. Switcher HTML (server-side string, no DOM) ==");
for (const fn of ['multiverseSwitcherHTML', 'multiverseTerminalHTML']) {
	const out = sandbox[fn] ? sandbox[fn]() : "";
	check(`${fn}() returns empty without a document (no throw)`, out === "");
}
check("scan/summary helpers survive a cold start", typeof MV.summaryText() === 'string' && MV.summaryText().length > 0);
check("liveCount is 0 before any mount", MV.liveCount() === 0);
check("frameSrc('nope') is about:blank, not undefined", MV.frameSrc("nope") === "about:blank");

// ---------------------------------------------------------------------------
console.log("== 5. Config drift guards against the real repo ==");
const transportSrc = fs.readFileSync(path.join(ROOT, 'js/technical/transport.js'), 'utf8');
const trees = [...transportSrc.matchAll(/^\t(\w+): \{$/gm)].map(m => m[1]);
for (const realm of MV.REALMS) {
	check(`realm '${realm.key}' exists in TRANSPORT_TREES`, trees.includes(realm.key));
	const urlMatch = new RegExp(realm.key + ": \\{[\\s\\S]*?url: \"([^\"]+)\"").exec(transportSrc);
	check(`realm '${realm.key}' has a bundled url`, !!urlMatch && urlMatch[1] !== "null", urlMatch && urlMatch[1]);
	if (urlMatch && urlMatch[1] !== "null") {
		const file = urlMatch[1].split('?')[0];
		check(`  file ${file} is present`, fs.existsSync(path.join(ROOT, file)));
	}
	// the save key must equal the vendored tree's own modInfo.id, or the bridge
	// silently reads nothing while the buttons keep working
	const dir = urlMatch ? path.dirname(path.join(ROOT, urlMatch[1])) : null;
	let declared = null;
	if (realm.key === 'demo') declared = 'cpt_demo';
	else if (realm.key === 'classic') declared = 'cpt_classic'; // hardcoded save key, no mod.js
	else {
		for (const cand of ['js/mod.js', 'js/Demo/demoMod.js', 'js/game.js']) {
			const f = path.join(dir, cand);
			if (!fs.existsSync(f)) continue;
			const m = /id:\s*["']([^"']+)["']/.exec(fs.readFileSync(f, 'utf8'));
			if (m) { declared = m[1]; break; }
		}
		if (!declared && dir) {
			// PT Classic style: key is a literal in the save call
			const files = fs.readdirSync(path.join(dir, 'js')).filter(f => f.endsWith('.js'));
			for (const f of files) {
				const m = /localStorage\.setItem\(\s*["']([^"']+)["']/.exec(fs.readFileSync(path.join(dir, 'js', f), 'utf8'));
				if (m) { declared = m[1]; break; }
			}
		}
	}
	check(`realm '${realm.key}' save key matches the tree (declared: ${declared})`, declared === realm.save, realm.save);
}
check("every real, sourced tree is covered by the bridge", MV.REALMS.length === 11, String(MV.REALMS.length));

// ---------------------------------------------------------------------------
console.log("== 6. Universe layer integration (effect() reads the bridge) ==");
const layerSandbox = {
	console,
	Decimal,
	layers: {},
	player: {},
	tmp: { u: { effect: new Decimal(62.5) } },
	modInfo: { initialStartPoints: new Decimal(10) },
	VERSION: { num: "0.9", name: "Multiverse" },
	hasUpgrade: (l, id) => !!(layerSandbox.player[l] && layerSandbox.player[l].upgrades && layerSandbox.player[l].upgrades.includes(Number(id))),
	hasMilestone: (l, id) => !!(layerSandbox.player[l] && layerSandbox.player[l].milestones && layerSandbox.player[l].milestones.includes(Number(id))),
	hasChallenge: () => false,
	upgradeEffect: () => new Decimal(1),
	buyableEffect: () => new Decimal(1),
	achievementEffect: () => new Decimal(1),
	format: (x) => String(x),
	formatWhole: (x) => String(x),
	formatTime: (x) => String(x),
	getBuyableAmount: () => new Decimal(0),
	doPopup: () => {},
	MULTIVERSE: MV,          // the same live bridge, primed with 1.5*2 above
	transportHubHTML: () => "",
	transportButtonHTML: () => "",
	multiverseSwitcherHTML: () => "",
	multiverseTerminalHTML: () => "",
};
vm.createContext(layerSandbox);
vm.runInContext("function addLayer(name, data){ layers[name] = data } function addNode(name,data){ layers[name]=data } var RIGHT=0, UP=1, LEFT=2, DOWN=3;", layerSandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/layers/universe.js'), 'utf8'), layerSandbox);
const u = layerSandbox.layers.u;

function mkPlayer(withU66) {
	return Object.assign(u.startData(), {
		unlocked: true,
		points: new Decimal(2),                        // 5^2 = 25 base
		best: new Decimal(2),
		activeUniverse: "classicPlus",                 // x2.5
		upgrades: withU66 ? [66] : [],
		milestones: [0, 1, 2, 3, 4, 5, 6, 7],
	});
}
// prime the bridge with a known, clean state: 1.5 * 2 = exactly x3
for (const r of MV.REALMS) delete store[r.save];
store['cpt_classic'] = b64(JSON.stringify({ points: "1e100" }));
store['cpt_rewritten'] = b64(JSON.stringify({ points: "1e400" }));
MV.scan(true);

layerSandbox.player.u = mkPlayer(false);
layerSandbox.player.e = { points: new Decimal(10) };
const effOff = u.effect();
layerSandbox.player.u = mkPlayer(true);
const effOn = u.effect();
check("effect() is finite and positive either way", isFinite(effOff.toNumber()) && isFinite(effOn.toNumber()));
check("Convergence multiplies the effect by the bridge bonus (x3)", Math.abs(effOn.div(effOff).toNumber() - 3) < 1e-6, effOn.div(effOff).toString());
layerSandbox.player.u = mkPlayer(false);
check("without upgrade 66 the real saves change nothing", u.effect().eq(effOff));
// a saturated realm must land exactly on the per-realm cap, not beyond it
layerSandbox.player.u = mkPlayer(true);
for (const r of MV.REALMS) delete store[r.save];
store['cpt_pro'] = b64(JSON.stringify({ points: "1e1e11" }));
MV.scan(true);
check("saturated realm caps the effect at exactly x100", Math.abs(u.effect().div(effOff).toNumber() - 100) < 1e-6, u.effect().div(effOff).toString());
for (const r of MV.REALMS) delete store[r.save];
MV.scan(true);
check("effect() falls back to the bare bonus with no saves at all", u.effect().eq(effOff));

check("switcher microtab exists", !!u.microtabs.universes.switcher);
// TMT defaults a microtab family to Object.keys(...)[0] — keep "hub" first so a
// fresh save still opens on the travel hub, not the switcher
check("hub is still the default universes microtab", Object.keys(u.microtabs.universes)[0] === "hub", Object.keys(u.microtabs.universes).slice(0, 3).join(","));
layerSandbox.player.u = mkPlayer(true);
check("switcher unlocks via Multiverse milestone 1", u.microtabs.universes.switcher.unlocked());
check("hub prints a pretty realm name, not the save key",
	/Active: <b>Classic\+ Hub<\/b>/.test(String(u.microtabs.universes.hub.content[0][1]())));
check("effectDescription mentions Multiverse Convergence when owned", /Multiverse Convergence/.test(u.effectDescription()));
layerSandbox.player.u = mkPlayer(false);
check("effectDescription omits it when not owned", !/Multiverse Convergence/.test(u.effectDescription()));

// ---------------------------------------------------------------------------
console.log("");
if (failures === 0) {
	console.log("ALL MULTIVERSE BRIDGE TESTS PASSED!");
	process.exit(0);
} else {
	console.log(failures + " TEST(S) FAILED");
	process.exit(1);
}
