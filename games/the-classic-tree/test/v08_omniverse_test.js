// Test suite for v0.8: The Omniverse & Expanded Multiverse
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const Decimal = require(path.join(__dirname, '..', 'js', 'technical', 'break_eternity.js'));

const sandbox = {
	console,
	Decimal,
	layers: {},
	player: {},
	tmp: {},
	modInfo: { initialStartPoints: new Decimal(10) },
	VERSION: { num: "0.8", name: "The Omniverse" },
	// Engine stubs
	hasUpgrade: (l, id) => sandbox.player[l] && sandbox.player[l].upgrades && sandbox.player[l].upgrades.includes(Number(id)),
	hasMilestone: (l, id) => sandbox.player[l] && sandbox.player[l].milestones && sandbox.player[l].milestones.includes(Number(id)),
	hasChallenge: (l, id) => sandbox.player[l] && sandbox.player[l].challenges && sandbox.player[l].challenges[id] > 0,
	hasAchievement: (l, id) => sandbox.player[l] && sandbox.player[l].achievements && sandbox.player[l].achievements.includes(Number(id)),
	inChallenge: (l, id) => sandbox.player._inChallenge === `${l}_${id}`,
	upgradeEffect: (l, id) => {
		try {
			if (sandbox.layers[l] && sandbox.layers[l].upgrades && sandbox.layers[l].upgrades[id] && sandbox.layers[l].upgrades[id].effect) {
				return sandbox.layers[l].upgrades[id].effect();
			}
		} catch (e) {}
		return new Decimal(1);
	},
	buyableEffect: (l, id) => {
		try {
			if (sandbox.layers[l] && sandbox.layers[l].buyables && sandbox.layers[l].buyables[id] && sandbox.layers[l].buyables[id].effect) {
				let amt = sandbox.player[l] && sandbox.player[l].buyables ? (sandbox.player[l].buyables[id] || new Decimal(0)) : new Decimal(0);
				return sandbox.layers[l].buyables[id].effect(amt);
			}
		} catch (e) {}
		return new Decimal(1);
	},
	achievementEffect: () => new Decimal(1),
	format: (x) => String(x),
	formatWhole: (x) => String(x),
	formatTime: (x) => String(x),
	getBuyableAmount: (l, id) => sandbox.player[l] && sandbox.player[l].buyables ? (sandbox.player[l].buyables[id] || new Decimal(0)) : new Decimal(0),
	setBuyableAmount: (l, id, val) => {
		if (sandbox.player[l] && sandbox.player[l].buyables) sandbox.player[l].buyables[id] = val;
	},
	getResetGain: () => new Decimal(1),
	getNextAt: () => new Decimal(10),
	canReset: () => true,
	doReset: () => {},
	layerDataReset: () => {},
	doPopup: () => {},
	RIGHT: 0, UP: 1, LEFT: 2, DOWN: 3,
};

vm.createContext(sandbox);

vm.runInContext(`
	function addLayer(name, data) { layers[name] = data; }
	function addNode(name, data) { layers[name] = data; }
`, sandbox);

// Load game files into the VM
const filesToLoad = [
	'js/layers.js',
	'js/layers/universe.js',
	'js/layers/reality.js',
	'js/layers/singularity.js',
	'js/layers/omniverse.js',
	'js/utils/officialSaveBank.js',
	'js/mod.js'
];

for (const f of filesToLoad) {
	const code = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
	vm.runInContext(code, sandbox);
}

const L = sandbox.layers;
let failures = 0;

function check(name, cond, extra) {
	if (cond) {
		console.log("  PASS  " + name);
	} else {
		failures++;
		console.log("  FAIL  " + name + (extra !== undefined ? "  [" + extra + "]" : ""));
	}
}

console.log("== 1. Core Layer & Omniverse (Ω) Registration ==");
check("Row 7 Omniverse layer (o) registered", L.o !== undefined);
check("Omniverse layer row is 7", L.o.row === 7, String(L.o.row));
check("Omniverse layer symbol is Ω", L.o.symbol === "Ω", L.o.symbol);
check("Omniverse has 15 upgrades", Object.keys(L.o.upgrades).length >= 15, String(Object.keys(L.o.upgrades).length));
// v0.8 full release added the Omega Reactor + Transfinite Loom buyables and the
// 5th (Final) Omega Challenge, so these are >= checks against the original 4/4.
check("Omniverse has at least 4 buyables (Cores)", Object.keys(L.o.buyables).length >= 4, String(Object.keys(L.o.buyables).length));
check("Omniverse has at least 4 Omega Challenges", Object.keys(L.o.challenges).length >= 4, String(Object.keys(L.o.challenges).length));
check("Omniverse has 8 milestones", Object.keys(L.o.milestones).length === 8, String(Object.keys(L.o.milestones).length));
check("Omniverse has 4x4 Omni-Matrix grid", L.o.grid && L.o.grid.rows === 4 && L.o.grid.cols === 4);

console.log("== 2. Multiverse Hub: 12 Universes Registration ==");
check("Universe layer (u) registered", L.u !== undefined);
const startU = L.u.startData();
const expectedUniverses = ["classic", "rewritten", "demo", "incrementverse", "basic", "miletree", "dimensions", "particles", "pro", "dice", "ng"];
for (const uni of expectedUniverses) {
	check(`Universe '${uni}' present in startData`, startU[uni] !== undefined);
}
check("Travel clickables present for all universes", Object.keys(L.u.clickables).length >= 10, String(Object.keys(L.u.clickables).length));
check("Ported buyables exist across community trees", Object.keys(L.u.buyables).length >= 15, String(Object.keys(L.u.buyables).length));

console.log("== 3. Point Generation Invariants with Omniverse & Multiverse ==");
function createFullPlayer() {
	return {
		points: new Decimal(10),
		timePlayed: 100,
		p: { points: new Decimal(100), best: new Decimal(100), upgrades: [11, 12, 13, 32], milestones: [4], buyables: {} },
		b: { points: new Decimal(50), best: new Decimal(50), upgrades: [], milestones: [5], buyables: {} },
		g: { points: new Decimal(50), best: new Decimal(50), upgrades: [], milestones: [], buyables: { 12: new Decimal(2) }, grid: {} },
		m: { points: new Decimal(20), best: new Decimal(20), upgrades: [], milestones: [], buyables: { 12: new Decimal(1) } },
		t: { points: new Decimal(30), best: new Decimal(30), upgrades: [], milestones: [], buyables: {} },
		w: { points: new Decimal(20), best: new Decimal(20), upgrades: [], milestones: [], buyables: {} },
		h: { points: new Decimal(10), best: new Decimal(10), upgrades: [], milestones: [], buyables: {} },
		q: { points: new Decimal(10), best: new Decimal(10), upgrades: [], milestones: [], buyables: {} },
		e: { points: new Decimal(10), best: new Decimal(10), upgrades: [], milestones: [], buyables: {} },
		u: {
			unlocked: true,
			points: new Decimal(20),
			best: new Decimal(20),
			activeUniverse: "classicPlus",
			upgrades: [11],
			buyables: { 11: new Decimal(3) },
			classic: { points: new Decimal(10) },
			rewritten: { points: new Decimal(10) },
			demo: { points: new Decimal(10) },
			incrementverse: { points: new Decimal(10) },
			basic: { points: new Decimal(10) },
			miletree: { points: new Decimal(10) },
			dimensions: { points: new Decimal(10) },
			particles: { points: new Decimal(10) },
			pro: { points: new Decimal(10) },
			dice: { points: new Decimal(10) },
			ng: { points: new Decimal(10) },
		},
		r: {
			unlocked: true,
			points: new Decimal(15),
			best: new Decimal(15),
			stability: new Decimal(50),
			upgrades: [11, 34],
			milestones: [0],
			buyables: { 11: new Decimal(2), 13: new Decimal(1) }
		},
		s2: {
			unlocked: true,
			points: new Decimal(20),
			best: new Decimal(20),
			field: new Decimal(100),
			collapses: 10,
			upgrades: [13, 14],
			milestones: [0, 1, 2, 3, 4, 5],
			buyables: { 12: new Decimal(2), 13: new Decimal(1) },
			grid: { 11: 2, 12: 2, 13: 2 }
		},
		o: {
			unlocked: true,
			points: new Decimal(5),
			best: new Decimal(5),
			field: new Decimal(200),
			syntheses: 10,
			pulseTimer: 0,
			upgrades: [11, 14],
			milestones: [0],
			buyables: { 11: new Decimal(2) },
			grid: { 11: 3, 12: 3, 13: 2, 14: 1 }
		},
		a: { achievements: [11, 12, 13, 14, 15, 16, 31, 32, 91, 92, 93, 96, 231, 246] }
	};
}

sandbox.player = createFullPlayer();
sandbox.tmp = {
	p: { effect: new Decimal(2) },
	b: { effect: new Decimal(2.5) },
	g: { effect: new Decimal(2), buyables: { 12: new Decimal(2) } },
	m: { effect: new Decimal(1.5), buyables: { 12: new Decimal(1) } },
	t: { effect: new Decimal(2) },
	w: { effect: new Decimal(2) },
	h: { effect: new Decimal(10) },
	q: { effect: new Decimal(5) },
	e: { effect: new Decimal(10) },
	u: { effect: L.u.effect(), buyables: { 11: new Decimal(2) } },
	r: { effect: L.r.effect(), buyables: { 11: new Decimal(100), 13: new Decimal(1e5) } },
	s2: { effect: L.s2.effect(), buyables: { 12: new Decimal(100), 13: new Decimal(1e10) } },
	o: { effect: L.o.effect(), buyables: { 11: new Decimal(1e20) } },
};

const pointGen = sandbox.getPointGen();
check("Point generation computes with all layers", pointGen instanceof Decimal && pointGen.gt(0), pointGen.toString());
check("Point generation reaches high multiverse scales (>1e100)", pointGen.gte("1e100"), pointGen.toString());

console.log("== 4. Official Save Bank v0.8 Presets ==");
const bankList = sandbox.officialSaveBankList();
check("Save Bank has presets", bankList && bankList.length >= 10, String(bankList.length));

const saveIdsToTest = ["omniverse-start", "endgame-08", "uni-dimensions", "uni-particles", "uni-pro", "uni-dice", "uni-ng"];
for (const sId of saveIdsToTest) {
	const entry = sandbox.officialSaveBankById(sId);
	check(`Save Bank contains entry '${sId}'`, entry !== null);
	if (entry) {
		const testP = {
			points: new Decimal(10),
			timePlayed: 0,
			time: Date.now(),
			version: "0.8",
			p: { points: new Decimal(0), upgrades: [], milestones: [], buyables: {} },
			b: { points: new Decimal(0), upgrades: [], milestones: [], buyables: {} },
			g: { points: new Decimal(0), upgrades: [], milestones: [], buyables: {} },
			m: { points: new Decimal(0), upgrades: [], milestones: [], buyables: {} },
			t: { points: new Decimal(0), upgrades: [], milestones: [], buyables: {} },
			w: { points: new Decimal(0), upgrades: [], milestones: [], buyables: {} },
			h: { points: new Decimal(0), upgrades: [], milestones: [], buyables: {} },
			q: { points: new Decimal(0), upgrades: [], milestones: [], buyables: {} },
			e: { points: new Decimal(0), upgrades: [], milestones: [], buyables: {} },
			u: { points: new Decimal(0), upgrades: [], milestones: [], buyables: {} },
			r: { points: new Decimal(0), upgrades: [], milestones: [], buyables: {} },
			s2: { points: new Decimal(0), upgrades: [], milestones: [], buyables: {} },
			o: { points: new Decimal(0), upgrades: [], milestones: [], buyables: {} },
			a: { achievements: [] }
		};
		let appliedCleanly = true;
		try {
			entry.apply(testP);
		} catch (e) {
			appliedCleanly = false;
			console.error("Error applying save " + sId + ":", e);
		}
		check(`Save Bank entry '${sId}' applies cleanly`, appliedCleanly);
	}
}

console.log("");
if (failures === 0) {
	console.log("ALL v0.8 OMNIVERSE TESTS PASSED!");
	process.exit(0);
} else {
	console.log(failures + " TEST(S) FAILED");
	process.exit(1);
}
