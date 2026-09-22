// Test harness for the "buy max below Eternity" feature.
// Loads the real js/layers.js (with its real cost functions) into a Node VM
// with stubbed engine functions, then exercises buyMaxLevels / buyMax wiring.
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const Decimal = require(path.join(__dirname, '..', 'js', 'technical', 'break_eternity.js'));

const sandbox = {
	console,
	Decimal,
	layers: {},
	// engine stubs (only what layers.js touches at load/test time)
	hasUpgrade: () => false,
	hasMilestone: () => false,
	hasChallenge: () => false,
	hasAchievement: () => false,
	inChallenge: () => false,
	upgradeEffect: () => new Decimal(1),
	buyableEffect: () => new Decimal(1),
	milestoneEffect: () => new Decimal(1),
	achievementEffect: () => new Decimal(1),
	format: (x) => x.toString(),
	formatWhole: (x) => x.toString(),
	formatTime: (x) => String(x),
	updateBuyableTemp: () => {},
	canReset: () => false,
	doReset: () => {},
	RIGHT: 0, UP: 1, LEFT: 2, DOWN: 3,
};
vm.createContext(sandbox);

// player + buyable accessors must live INSIDE the context so layers.js sees them
vm.runInContext(`
	var player = {};
	function getBuyableAmount(layer, id) { return player[layer].buyables[id]; }
	function setBuyableAmount(layer, id, amt) { player[layer].buyables[id] = amt; }
	function addLayer(name, data) { layers[name] = data; }
	function addNode(name, data) { layers[name] = data; }
`, sandbox);

vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'layers.js'), 'utf8'), sandbox);

const L = sandbox.layers;
let failures = 0;
function check(name, cond, extra) {
	if (cond) console.log("  PASS  " + name);
	else { failures++; console.log("  FAIL  " + name + (extra !== undefined ? "  [" + extra + "]" : "")); }
}

// (layer, id) -> which object's .points it must spend
const CURRENCY = {
	'p11': 'p', 'p12': 'points', 'p13': 'p',
	'b11': 'b', 'b12': 'p', 'b13': 'points',
	'g11': 'p', 'g12': 'points', 'g13': 'points',
	'm11': 'm', 'm12': 'points',
	't11': 't', 't12': 't',
	'w11': 'w', 'w12': 't', 'w13': 'm',
	'h11': 'h', 'h12': 'h',
	'q11': 'q', 'q12': 'q',
};
// g11's 25 levels cost only ~2.4e7 total - use a budget where that is detectable
// (at 1e60 the spend vanishes below double-precision, by design of break_eternity)
const BUDGET_OVERRIDE = { 'g11': '1e8' };
const LAYER_IDS = { p: [11, 12, 13], b: [11, 12, 13], g: [11, 12, 13], m: [11, 12], t: [11, 12], w: [11, 12, 13], h: [11, 12], q: [11, 12] };

// mimic the engine's automagic .layer/.id assignment on buyables
for (const layer in LAYER_IDS) {
	for (const id of LAYER_IDS[layer]) {
		L[layer].buyables[id].layer = layer;
		L[layer].buyables[id].id = id;
	}
}

console.log("== 1. buyMax coverage (rows 0-3 vs Eternity) ==");
let withMax = 0;
for (const key in CURRENCY) {
	const [layer, id] = [key.slice(0, 1), key.slice(1)];
	if (typeof L[layer].buyables[id].buyMax === 'function') withMax++;
}
check("all 20 rows-0-3 buyables define buyMax", withMax === 20, withMax + "/20");
check("Eternity buyable 11 has NO buyMax", L.e.buyables[11].buyMax === undefined);
check("Eternity buyable 12 has NO buyMax", L.e.buyables[12].buyMax === undefined);
check("B layer canBuyMax is unconditional true", L.b.canBuyMax === true, String(L.b.canBuyMax));
check("H layer canBuyMax is true", L.h.canBuyMax === true, String(L.h.canBuyMax));
check("Q layer canBuyMax is true", L.q.canBuyMax === true, String(L.q.canBuyMax));
check("E layer has no canBuyMax", L.e.canBuyMax === undefined, String(L.e.canBuyMax));
check("B milestone 2 reworked", L.b.milestones[2].effectDescription === "B cost /1.5", L.b.milestones[2].effectDescription);

console.log("== 2. buyMaxLevels invariants (spend-all, exact accounting) ==");

function freshPlayer() {
	const p = { points: new Decimal('1e60') };
	for (const layer of ['p', 'b', 'g', 'm', 't', 'w', 'h', 'q']) {
		p[layer] = { points: new Decimal('1e60'), buyables: { 11: new Decimal(0), 12: new Decimal(0), 13: new Decimal(0) } };
	}
	return p;
}

function runBuyMax(layer, id, currencyKey) {
	sandbox.player = freshPlayer();
	const player = sandbox.player;
	const holder = currencyKey === 'points' ? player : player[currencyKey];
	const key = layer + id;
	if (BUDGET_OVERRIDE[key]) holder.points = new Decimal(BUDGET_OVERRIDE[key]);
	const initial = holder.points;

	const bought = sandbox.buyMaxLevels(layer, id, holder);

	const amt = player[layer].buyables[id];
	// recompute the total cost of levels [0, amt) independently
	let total = new Decimal(0);
	const n = amt.toNumber();
	for (let i = 0; i < amt.toNumber(); i++) total = total.add(L[layer].buyables[id].cost(new Decimal(i)));

	const spent = initial.sub(holder.points);
	const limit = L[layer].buyables[id].purchaseLimit;
	const atLimit = limit !== undefined && amt.gte(limit);
	const next = L[layer].buyables[id].cost(amt);

	check(`${layer}${id}: bought some (n=${n})`, bought === n && n > 0, "bought=" + bought + " amt=" + n);
	check(`${layer}${id}: amount matches return`, amt.eq(bought));
	check(`${layer}${id}: no negative currency`, holder.points.gte(0), holder.points.toString());
	check(`${layer}${id}: exact accounting (spent == sum of costs)`, spent.eq_tolerance(total, total.times(1e-9).max(1e-9)), spent.toString() + " vs " + total.toString());
	if (!atLimit) check(`${layer}${id}: stopped when unaffordable (leftover < next cost)`, holder.points.lt(next), holder.points.toString() + " vs next " + next.toString());
	else check(`${layer}${id}: stopped at purchase limit`, atLimit && amt.eq(limit));
}

for (const key in CURRENCY) {
	const layer = key.slice(0, 1), id = key.slice(1);
	runBuyMax(layer, id, CURRENCY[key]);
}

console.log("== 3. real buyMax() wiring: right layer, right currency ==");

for (const key in CURRENCY) {
	const layer = key.slice(0, 1), id = key.slice(1);
	sandbox.player = freshPlayer();
	const player = sandbox.player;
	const before = {};
	before.points = player.points.toString();
	for (const l of ['p', 'b', 'g', 'm', 't', 'w', 'h', 'q']) before[l] = player[l].points.toString();

	// call the buyable's own buyMax (as the engine would, with this = the buyable)
	if (BUDGET_OVERRIDE[key]) {
		if (CURRENCY[key] === 'points') player.points = new Decimal(BUDGET_OVERRIDE[key]);
		else player[CURRENCY[key]].points = new Decimal(BUDGET_OVERRIDE[key]);
	}
	L[layer].buyables[id].buyMax();

	const amt = player[layer].buyables[id];
	check(`${layer}${id}: buyMax() raised its own layer amount`, amt.gt(0), amt.toString());

	const spentKey = CURRENCY[key];
	const after = {};
	after.points = player.points.toString();
	for (const l of ['p', 'b', 'g', 'm', 't', 'w', 'h', 'q']) after[l] = player[l].points.toString();

	let changed = [];
	if (after.points !== before.points) changed.push('points');
	for (const l of ['p', 'b', 'g', 'm', 't', 'w', 'h', 'q']) if (after[l] !== before[l]) changed.push(l);
	check(`${layer}${id}: spent exactly the right currency (${spentKey})`, changed.length === 1 && changed[0] === spentKey, "changed=" + changed.join(','));
}

console.log("== 4. edge cases ==");

// g11 purchase limit of 25 must be respected no matter how rich you are
sandbox.player = freshPlayer();
sandbox.player.p.points = new Decimal('1e500');
sandbox.buyMaxLevels('g', 11, sandbox.player.p);
check("g11 stops at purchaseLimit 25 with 1e500 prestige", sandbox.player.g.buyables[11].eq(25), sandbox.player.g.buyables[11].toString());

// g11's cost discontinuity at 10 (cost drops from 5^9*10 to ~178) - must buy through it
sandbox.player = freshPlayer();
sandbox.player.p.points = new Decimal('3e7'); // enough for levels 0-9 (cum ~2.4e7) and then the cheap 10+
sandbox.buyMaxLevels('g', 11, sandbox.player.p);
check("g11 buys through the level-10 cost discontinuity", sandbox.player.g.buyables[11].gte(10), sandbox.player.g.buyables[11].toString());
check("g11 leftover is sane", sandbox.player.p.points.gte(0));

// zero budget buys nothing
sandbox.player = freshPlayer();
sandbox.player.q.points = new Decimal(0);
const zeroBought = sandbox.buyMaxLevels('q', 11, sandbox.player.q);
check("q11 buys 0 levels with 0 quantum", zeroBought === 0 && sandbox.player.q.buyables[11].eq(0));

// can't afford even one -> 0
sandbox.player = freshPlayer();
sandbox.player.t.points = new Decimal(5); // t11 costs 10 at level 0
const poorBought = sandbox.buyMaxLevels('t', 11, sandbox.player.t);
check("t11 buys 0 levels when it can't afford one", poorBought === 0 && sandbox.player.t.buyables[11].eq(0));

// huge budget terminates quickly (no 10000-iteration crawl) - q11 with 1e500: 3^x*3
sandbox.player = freshPlayer();
sandbox.player.q.points = new Decimal('1e500');
const t0 = Date.now();
const qBought = sandbox.buyMaxLevels('q', 11, sandbox.player.q);
const dt = Date.now() - t0;
check("q11 with 1e500 finishes fast (<2s)", dt < 2000, dt + "ms");
check("q11 amount is in the expected range (~1047)", qBought > 1000 && qBought < 1100, qBought);

// b11 superexponential cost 10^(x^1.25)
sandbox.player = freshPlayer();
sandbox.player.b.points = new Decimal('1e100');
const bBought = sandbox.buyMaxLevels('b', 11, sandbox.player.b);
check("b11 (10^(x^1.25) cost) buys a sane amount", bBought > 30 && bBought < 60, bBought);

console.log("== 5. B milestone 2 gainMult implementation ==");
sandbox.player = freshPlayer();
const oldMilestone = sandbox.hasMilestone;
sandbox.hasMilestone = (l, id) => (l === 'b' && id == 2);
const mult = L.b.gainMult();
sandbox.hasMilestone = oldMilestone;
check("B gainMult is /1.5 with milestone 2", mult.eq_tolerance(new Decimal(1).div(1.5), 1e-12), mult.toString());

console.log("");
if (failures === 0) {
	console.log("ALL TESTS PASSED");
	process.exit(0);
} else {
	console.log(failures + " TEST(S) FAILED");
	process.exit(1);
}
