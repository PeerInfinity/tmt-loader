// Verifies the modified buyBuyable() routing in js/utils.js:
// plain click -> buyMax (when defined), Shift+click -> single buy,
// buyables without buyMax (Eternity and above) always single-buy.
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'utils.js'), 'utf8');
const match = src.match(/function buyBuyable\(layer, id\) \{[\s\S]*?\n\}/);
if (!match) { console.log("FAIL: could not extract buyBuyable from utils.js"); process.exit(1); }

let failures = 0;
function check(name, cond, extra) {
	if (cond) console.log("  PASS  " + name);
	else { failures++; console.log("  FAIL  " + name + (extra !== undefined ? "  [" + extra + "]" : "")); }
}

function makeCtx(hasBuyMax, shiftDown) {
	const calls = { buy: 0, buyMax: 0 };
	const buyable = { buy: () => calls.buy++ };
	if (hasBuyMax) buyable.buyMax = () => calls.buyMax++;
	const ctx = {
		player: { t: { unlocked: true } },
		tmp: { t: { buyables: { 11: { unlocked: true, canBuy: true } } } },
		layers: { t: { buyables: { 11: buyable } } },
		shiftDown: shiftDown,
		run: (fn, target) => fn.call(target),
		updateBuyableTemp: () => {},
		calls,
	};
	vm.createContext(ctx);
	vm.runInContext(match[0] + "; buyBuyable('t', 11);", ctx);
	return calls;
}

console.log("== buyBuyable routing ==");
let c = makeCtx(true, false);
check("plain click with buyMax -> buys max", c.buyMax === 1 && c.buy === 0, JSON.stringify(c));
c = makeCtx(true, true);
check("Shift+click with buyMax -> buys one", c.buy === 1 && c.buyMax === 0, JSON.stringify(c));
c = makeCtx(false, false);
check("plain click without buyMax (E+) -> buys one", c.buy === 1 && c.buyMax === 0, JSON.stringify(c));
c = makeCtx(false, true);
check("Shift+click without buyMax (E+) -> buys one", c.buy === 1 && c.buyMax === 0, JSON.stringify(c));

// canBuy false -> nothing happens
const calls = { buy: 0, buyMax: 0 };
const ctx = {
	player: { t: { unlocked: true } },
	tmp: { t: { buyables: { 11: { unlocked: true, canBuy: false } } } },
	layers: { t: { buyables: { 11: { buy: () => calls.buy++, buyMax: () => calls.buyMax++ } } } },
	shiftDown: false,
	run: (fn, target) => fn.call(target),
	updateBuyableTemp: () => {},
	calls,
};
vm.createContext(ctx);
vm.runInContext(match[0] + "; buyBuyable('t', 11);", ctx);
check("can't afford -> no purchase", calls.buy === 0 && calls.buyMax === 0, JSON.stringify(calls));

console.log("");
if (failures === 0) { console.log("ALL ROUTING TESTS PASSED"); process.exit(0); }
console.log(failures + " TEST(S) FAILED"); process.exit(1);
