// DOM smoke test for the v0.9 Multiverse switcher.
// Run: node test/multiverse_dom_test.js
//
// Needs jsdom (dev-only): npm i jsdom. If it is missing the suite skips with a
// pass, so the game itself never depends on it.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let JSDOM;
try {
	({ JSDOM } = require('jsdom'));
} catch (e) {
	try { ({ JSDOM } = require('/tmp/node_modules/jsdom')); }
	catch (e2) {
		console.log("SKIP  jsdom is not installed — run `npm i jsdom` to enable the DOM suite");
		process.exit(0);
	}
}

let failures = 0;
function check(name, cond, extra) {
	if (cond) console.log("  PASS  " + name);
	else { failures++; console.log("  FAIL  " + name + (extra !== undefined ? "  [" + extra + "]" : "")); }
}

const dom = new JSDOM(`<!DOCTYPE html><body><div id="app"><div id="treeTab"></div><div id="treeOverlay"></div><div class="popup-container"></div></div></body>`, {
	url: "http://localhost/",
	runScripts: "outside-only",
	pretendToBeVisual: true,
});
const win = dom.window;
const doc = win.document;

// Minimal engine surface the modules expect
win.eval(fs.readFileSync(path.join(ROOT, 'js/technical/break_eternity.js'), 'utf8'));
win.doPopup = () => {};
win.format = (x) => String(x);
win.formatWhole = (x) => String(x);
win.updateTabFormats = () => {};
win.player = { u: {}, points: new win.Decimal(10) };
win.eval(fs.readFileSync(path.join(ROOT, 'js/technical/transport.js'), 'utf8'));
win.eval(fs.readFileSync(path.join(ROOT, 'js/technical/multiverse.js'), 'utf8'));

const MV = win.MULTIVERSE;
const b64 = (s) => Buffer.from(s, 'binary').toString('base64');

// A couple of fake foreign saves so the scan has something to find
win.localStorage.setItem("cpt_classic", b64(JSON.stringify({ points: "1e100", tab: "tree" })));
win.localStorage.setItem("cpt_miletree", b64(JSON.stringify({ points: "1e1000", p: { points: "1e50" } })));
MV.scan(true);

console.log("== 1. Bridge in a real DOM ==");
const recs = MV.realms;
check("scan finds the classic save", recs.find(r => r.key === 'classic').found);
check("scan ignores realms with no save", !recs.find(r => r.key === 'dice').found);
check("convergence is x1.5 * x11.57 (1e100 & 1e1000)", Math.abs(MV.bonus().mult - (1 + 0.05 * 10) * (1 + 0.05 * Math.sqrt(1000))) < 1e-9, String(MV.bonus().mult));
check("bonusDecimal is a usable Decimal", typeof MV.bonusDecimal().gte === 'function' && MV.bonusDecimal().gte(1));

console.log("== 2. Styles, root and parking ==");
const hub = win.multiverseSwitcherHTML();
check("hub widget renders", typeof hub === 'string' && hub.length > 200);
check("hub widget shows a real-save row", /real save/.test(hub));
check("hub widget is memoized (Vue skips the patch)", win.multiverseSwitcherHTML() === hub);
MV.dirty();
const hub2 = win.multiverseSwitcherHTML();
check("rebuild after dirty() is stable", win.multiverseSwitcherHTML() === hub2);
// a genuinely new save must change the text (data, not just the memo key)
win.localStorage.setItem("cpt_dice", b64(JSON.stringify({ points: "1e3", tab: "tree" })));
MV.scan(true);
const hub3 = win.multiverseSwitcherHTML();
check("a newly appearing real save shows up in the hub", hub3 !== hub2 && /Dice Tree[\s\S]{0,120}real save/.test(hub3));
// mount the widget the way Vue's v-html would (a child of #app, not a rewrite of
// it), so the delegated clicks have targets and the game panels survive
const hubMount = doc.createElement("div");
hubMount.innerHTML = hub3;
doc.getElementById("app").appendChild(hubMount);

check("terminal line renders", /UNIVERSE SWITCHER/.test(win.multiverseTerminalHTML()));
const btn = win.transportButtonHTML('classic');
check("transport button reports the bridge signal", /real save seen/.test(btn), btn.slice(0, 160));
check("transport button for an unsourced realm stays inert", /NO SEPARATE SOURCE/.test(win.transportButtonHTML('galaxy')));

console.log("== 3. Switcher modes ==");
const click = (sel) => {
	const el = doc.querySelector(sel);
	if (!el) throw new Error("no element for " + sel);
	el.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true }));
};
click('[data-mv="open:scan"]');
const root = doc.getElementById('mvRoot');
check("fullscreen switcher mounted", !!root && root.classList.contains('mv-open'));
check("scan grid lists all 11 realms", doc.querySelectorAll('#mvBody .mv-cell').length === 11, String(doc.querySelectorAll('#mvBody .mv-cell').length));
check("scan tiles carry a meter", doc.querySelectorAll('#mvBody .mv-meter>i').length === 11);
check("hub stays visible in scan mode", !MV.isParked());

click('[data-mv="cut"]');
check("hard cut parks the game panels (opacity, not display)", doc.getElementById('treeTab').classList.contains('cpt-parked'));
check("popups stay readable while parked", !doc.querySelector('.popup-container').classList.contains('cpt-parked'));
check("TRANSPORT_OPT.cut follows the toggle", win.TRANSPORT_OPT.cut === true);
click('[data-mv="cut"]');
check("toggling back unparks", !MV.isParked());

click('[data-mv="open:swarm"]');
check("swarm renders a frame per realm", doc.querySelectorAll('.mv-frame').length === 11);
const cell = doc.getElementById('mvCell_classic');
check("swarm cells start as posters", !!cell.querySelector('.mv-poster'));
click('[data-mv="wake:classic"]');
check("wake mounts the frame", MV.frames['classic'] !== undefined);
click('[data-mv="wake:classic"]');
check("wake is idempotent", doc.querySelectorAll('#mvCell_classic iframe').length === 1, String(doc.querySelectorAll('#mvCell_classic iframe').length));
const frame = cell.querySelector('iframe');
check("the frame points at the real bundled file", frame && /trees\/prestige-tree-classic\/index\.html$/.test(frame.getAttribute('src')), frame && frame.getAttribute('src'));
check("poster hidden while mounted", cell.querySelector('.mv-poster').style.display === 'none');

click('[data-mv="wake:dice"]');
click('[data-mv="wake:pro"]');
click('[data-mv="wake:ng"]');
click('[data-mv="wake:basic"]');
check("cap is respected (4 live)", Object.keys(MV.frames).length <= 4, String(Object.keys(MV.frames).length));
click('[data-mv="cap:up"]');
check("cap raise works", MV.maxLive === 5, String(MV.maxLive));
click('[data-mv="halt"]');
setTimeout(() => {
	check("halt unmounts everything", Object.keys(MV.frames).length === 0);

	// --- the regression this whole design turns on: a data refresh must never
	// --- rewrite a container that holds live iframes
	console.log("== 4. Live frames survive a scan ==");
	click('[data-mv="open:reel"]');
	const reelFrame = doc.getElementById('mvReelFrame');
	check("reel frame exists", !!reelFrame);
	const before = reelFrame;
	MV.scan(true);
	MV.dirty();
	win.eval("mvRender()");
	check("reel iframe is the same node after a refresh", doc.getElementById('mvReelFrame') === before);
	check("reel src is the sourced url", /trees\/prestige-tree-classic\/index\.html$/.test(reelFrame.getAttribute('src')), reelFrame.getAttribute('src'));

	click('[data-mv="reel:next"]');
	check("advancing the reel changes the realm", MV.reel.key === 'rewritten' && /prestige-tree-rewritten\/index\.html$/.test(doc.getElementById('mvReelFrame').getAttribute('src')), MV.reel.key);
	click('[data-mv="reel:speed"]');
	check("speed control cycles", MV.reel.ms === 15000, String(MV.reel.ms));
	click('[data-mv="reel:play"]');
	check("auto-cycle can be armed", MV.reel.on === true);
	click('[data-mv="reel:play"]');
	check("and disarmed", MV.reel.on === false);

	console.log("== 5. Sigma ALL ==");
	click('[data-mv="open:swarm"]');
	click('[data-mv="all"]');
	check("first press only arms, does not lift the cap", MV.maxLive === 5 && MV.allArmed === true, String(MV.maxLive));
	click('[data-mv="all"]');
	check("confirming lifts the cap to infinity", MV.maxLive === Infinity);
	check("and mounts every sourced realm", Object.keys(MV.frames).length === 11, String(Object.keys(MV.frames).length));
	check("every realm really has a frame on screen", doc.querySelectorAll('.mv-frame > iframe').length === 11, String(doc.querySelectorAll('.mv-frame > iframe').length));
	MV.dirty(); win.eval("mvRender(true)");
	check("a structural repaint leaves no orphan frame records", Object.keys(MV.frames).length === doc.querySelectorAll('.mv-frame > iframe').length, Object.keys(MV.frames).length + " records vs " + doc.querySelectorAll('.mv-frame > iframe').length + " iframes");
	click('[data-mv="all"]');
	setTimeout(() => {
		check("pressing again restores the cap", MV.maxLive === 4, String(MV.maxLive));

		console.log("== 6. Pill injection (cross-frame dressing) ==");
		const probe = doc.createElement('iframe');
		doc.body.appendChild(probe);
		let returned = false;
		MV.dressFrame(probe, { label: "RETURN TO CLASSIC+", onReturn: () => { returned = true } });
		const pill = probe.contentDocument.getElementById('cptReturnPill');
		check("pill is injected into the child document", !!pill);
		check("pill text is the hub return", pill && /RETURN TO CLASSIC\+/.test(pill.textContent));
		if (pill) pill.dispatchEvent(new probe.contentWindow.MouseEvent('click', { bubbles: true, cancelable: true }));
		check("clicking the pill calls back into the hub", returned === true);
		MV.dressFrame(probe, { label: "again" });
		check("redressing is idempotent", probe.contentDocument.querySelectorAll('#cptReturnPill').length === 1);

		console.log("== 7. Esc + close ==");
		doc.getElementById('treeTab').classList.add('cpt-parked');
		doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: "Escape", bubbles: true }));
		check("Esc closes the switcher", !root.classList.contains('mv-open'));
		check("closing un-parks the hub", !MV.isParked());

		console.log("== 8. Transport integration ==");
		win.openTransport('classic', { cut: true });
		const overlay = doc.getElementById('transportOverlay');
		check("overlay opens", overlay.classList.contains('tp-open'));
		check("hard cut hides the bar", overlay.classList.contains('tp-cut'));
		win.closeTransport();
		check("close removes the cut class", !overlay.classList.contains('tp-cut'));

		console.log("");
		if (failures === 0) { console.log("ALL MULTIVERSE DOM TESTS PASSED!"); process.exit(0); }
		console.log(failures + " TEST(S) FAILED");
		process.exit(1);
	}, 200);
}, 300);
