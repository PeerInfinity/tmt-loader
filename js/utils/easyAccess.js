function hasUpgrade(layer, id) {
	return (
		(player[layer].upgrades.includes(toNumber(id)) || player[layer].upgrades.includes(id.toString())) &&
		!tmp[layer].deactivated
	);
}
const hu = hasUpgrade;

function hasMilestone(layer, id) {
	return (
		(player[layer].milestones.includes(toNumber(id)) || player[layer].milestones.includes(id.toString())) &&
		!tmp[layer].deactivated
	);
}
const hm = hasMilestone;

function hasAchievement(layer, id) {
	return (
		(player[layer].achievements.includes(toNumber(id)) || player[layer].achievements.includes(id.toString())) &&
		!tmp[layer].deactivated
	);
}
const ha = hasAchievement;

function hasChallenge(layer, id) {
	return player[layer].challenges[id] && !tmp[layer].deactivated;
}
const hc = hasChallenge;

function maxedChallenge(layer, id) {
	return player[layer].challenges[id] >= tmp[layer].challenges[id].completionLimit && !tmp[layer].deactivated;
}
const mc = maxedChallenge;

function challengeCompletions(layer, id) {
	return player[layer].challenges[id];
}
const ccs = challengeCompletions;

function canEnterChallenge(layer, id) {
	return tmp[layer].challenges[id].canEnter ?? true;
}
const cec = canEnterChallenge;

function canExitChallenge(layer, id) {
	return tmp[layer].challenges[id].canExit ?? true;
}
const cxc = canExitChallenge;

function getBuyableAmount(layer, id) {
	return player[layer].buyables[id];
}
const ba = getBuyableAmount;

function setBuyableAmount(layer, id, amt) {
	player[layer].buyables[id] = amt;
}
const sba = setBuyableAmount;

function addBuyables(layer, id, amt) {
	player[layer].buyables[id] = player[layer].buyables[id].add(amt);
}
const ab = addBuyables;

function getClickableState(layer, id) {
	return player[layer].clickables[id];
}
const cs = getClickableState;

function setClickableState(layer, id, state) {
	player[layer].clickables[id] = state;
}
const scs = setClickableState;

function getGridData(layer, id) {
	return player[layer].grid[id];
}
const gd = getGridData;

function setGridData(layer, id, data) {
	player[layer].grid[id] = data;
}
const sgd = setGridData;

function upgradeEffect(layer, id) {
	return tmp[layer].upgrades[id].effect;
}
const ue = upgradeEffect;

function milestoneEffect(layer, id) {
	return tmp[layer].milestones[id].effect;
}
const me = milestoneEffect;

function challengeEffect(layer, id) {
	return tmp[layer].challenges[id].rewardEffect;
}
const che = challengeEffect;

function buyableEffect(layer, id) {
	return tmp[layer].buyables[id].effect;
}
const be = buyableEffect;

function clickableEffect(layer, id) {
	return tmp[layer].clickables[id].effect;
}
const cle = clickableEffect;

function achievementEffect(layer, id) {
	return tmp[layer].achievements[id].effect;
}
const ae = achievementEffect;

function layerEffect(layer) {
	return tmp[layer].effect;
}
const le = layerEffect;

function gridEffect(layer, id) {
	return gridRun(layer, "getEffect", player[layer].grid[id], id);
}
const ge = gridEffect;

function hasVisibleUpgrade(layer, row) {
	const cols = tmp[layer].upgrades.cols;
	const upgrades = [];
	for (let i = 1; i <= cols; i++) {
		if (tmp[layer].upgrades[row * 10 + i] !== undefined) {
			upgrades.push(tmp[layer].upgrades[row * 10 + i]);
		}
	}
	for (let i = 0; i < upgrades.length; i++) {
		const upgrade = upgrades[i];
		if (upgrade.unlocked === true || upgrade.unlocked === undefined) {
			return true;
		}
	}
	return false;
}
