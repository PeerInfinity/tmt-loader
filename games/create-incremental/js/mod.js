let modInfo = {
	name: "Create Incremental",
	author: "BanaCubed, with ideas from galaxy, and assets by adoplayzz",
	pointsName: "Cash",
	modFiles: [
		"layers.js",
		"tree.js",
		"layers/cash.js",
		"layers/rebirth.js",
		"layers/rebirth2.js",
		"layers/rebirth3.js",
		"layers/matter.js",
	],

	discordName: "Create Incremental Server",
	discordLink: "https://discord.gg/wt5XyPRtte",
	initialStartPoints: new Decimal(0), // Used for hard resets and new players
	offlineLimit: 24, // In hours
};

// Set your version in num and name
let VERSION = {
	num: "0.4",
	name: 'A "small" bugfix update',
};

let changelog = `<h1>Changelog</h1><br><br>
	<span style="text-align: left; display: inline-block; padding: 5px;">
		<img width="50" height="50" style="position: relative; top: 15px; margin-right: 5px;" src="./resources/icons/hypothetical.png" /><h2>v0.4 - One Big Bugfix</h2><br>
		- Added no new content<br>
		- Fixed most bugs<br>
		- Added icons<br>
		- Added changelog<br>
		<img width="50" height="50" style="position: relative; top: 15px; left: 10px; margin-right: 5px; scale: 0.6;" src="./resources/icons/matter.png" /><h2>v0.3.1 - Matter</h2><br>
		- Added Matter, Antimatter, Dark Matter, & Exotic Matter<br>
		- Also added Black Hole, Unstable Matter, Hypothetical Particles, & UMFs<br>
		- Added a respec button for Hyper Paths<br>
		- Added a buy max button for Power Pylons<br>
		<img width="50" height="50" style="position: relative; top: 15px; left: 10px; margin-right: 5px; scale: 0.6;" src="./resources/icons/hyper_rebirth.png" /><h2>v0.3 - Hyper Rebirth</h2><br>
		- Added Hyper Rebirth<br>
		- Added Hyper Paths<br>
		- Added Hyper Cash<br>
		<img width="50" height="50" style="position: relative; top: 15px; left: 15px; margin-right: 5px; scale: 0.6;" src="./resources/icons/power.png" /><h2>v0.2.1 - Power</h2><br>
		- Added Power<br>
		- Added Power Pylons<br>
		- Extended Super Rebirth Challenges<br>
		<img width="50" height="50" style="position: relative; top: 15px; left: 10px; margin-right: 5px; scale: 0.6;" src="./resources/icons/super_rebirth.png" /><h2>v0.2 - Super Rebirth</h2><br>
		- Added Super Rebirth<br>
		- Added Milestone<br>
		- Added Challenges<br>
		<img width="50" height="50" style="position: relative; top: 15px; left: 10px; margin-right: 5px; scale: 0.6;" src="./resources/icons/rebirth.png" /><h2>v0.1 - Rebirth</h2><br>
		- Added Rebirth<br>
		- Added Achievements<br>
		- Added The Machine<br>
		<img width="50" height="50" style="position: relative; top: 15px; left: 12px; margin-right: 5px; scale: 0.6;" src="./resources/icons/cash.png" /><h2>v0.0 - Cash</h2><br>
		- Added Cash<br>
	<br><br><br></span>
`;

let winText = `You are win! Congratulations on wasting your time!`;

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"];

function getStartPoints() {
	return new Decimal(modInfo.initialStartPoints);
}

// Determines if it should show points/sec
function canGenPoints() {
	return true;
}

// Calculate points/sec!
function getPointGen(softcaps = true) {
	if (!canGenPoints()) return new Decimal(0);

	let gain = new Decimal(0);
	if (player.points === null || player.points === undefined) player.points = new Decimal(0);

	// #region Cash Boosts
	if (hu("U", 11) || inChallenge("SR", 22)) gain = gain.add(ue("U", 11));
	for (let index = 0; index < [12, 13, 14, 22, 24, 31, 41].length; index++) {
		const element = [12, 13, 14, 22, 24, 31, 41][index];
		if (hu("U", element)) gain = gain.times(ue("U", element));
	}
	if (hu("U", 43)) gain = gain.mul(ue("U", 43)[1]);

	if (hasUpgrade("U", 51)) gain = gain.times(player.P.points.add(1));

	// #region Machine Boosts
	if (!inChallenge("SR", 22)) {
		if (getClickableState("U", 11)) gain = gain.times(4);
		if (getClickableState("U", 12)) gain = gain.times(3);
		if (getClickableState("U", 13)) gain = gain.times(2);

		gain = gain.times(machineBonuses());
	}

	if (hasUpgrade("U", 21)) gain = gain.pow(ue("U", 21));

	// #region Rebirth Boosts
	gain = gain.times(tmp.R.effect);
	if (hasUpgrade("R", 11)) gain = gain.times(5);
	if (hasUpgrade("R", 14)) gain = gain.times(2);

	// #region SR Boosts
	gain = gain.times(tmp.SR.effect[0]);
	if (hasMilestone("SR", 9)) gain = gain.times(tmp.SR.milestones[9].effect);
	if (hasMilestone("SR", 4)) gain = gain.pow(1.1);
	if (inChallenge("SR", 12)) gain = gain.pow(0.5);
	if (inChallenge("SR", 31)) gain = gain.div(player.SR.tax);

	// #region HR Boosts
	gain = gain.times(tmp.HC.effect[0]);
	if (hasUpgrade("HC", 11)) gain = gain.times(10000);
	if (hasUpgrade("HC", 14)) gain = gain.times(100);
	if (hasUpgrade("HC", 24)) gain = gain.times(200);

	// #region Matter Boosts
	gain = gain.times(tmp.UMF.effect2);

	gain = gain.pow(tmp.C.effect[0]);

	if (softcaps !== false) {
		if (gain.gte("1e5000000"))
			gain = new Decimal(10).pow(gain.max(1).log(10).div(5000000).pow(0.25).times(5000000));
	}

	return gain;
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() {
	return {
		SA14: false,
		SA15: false,
		MILK: false,
	};
}

// Display extra things at the top of the page
var displayThings = [
	function () {
		if (inChallenge("SR", 31)) {
			return "You have " + format(player.SR.tax) + " tax";
		}
	},
	function () {
		if (getPointGen().gte("1e5000000")) {
			return "Inflation is dividing your income by " + format(tmp.U.softcapPower);
		}
	},
];

// Determines when the game "ends"
function isEndgame() {
	return player.UMF.points.gte(4);
}

function machineBonuses() {
	let bonus = new Decimal(1);
	if (hasUpgrade("R", 32)) bonus = bonus.times(1.3);
	bonus = bonus.times(tmp.P.effect);
	if (hasUpgrade("U", 34) && hasMilestone("P", 8)) bonus = bonus.pow(1.25);
	return bonus;
}

function findIndex(arr, x) {
	const index = arr.indexOf(x);
	return index !== -1 ? index : arr.length;
}

// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {};

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return 3600; // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion) {}

function achievement33() {
	// Variable setup
	let machinemodes = 0;

	// Total modes selected
	if (getClickableState("U", 11) === true) machinemodes = machinemodes + 1;
	if (getClickableState("U", 12) === true) machinemodes = machinemodes + 1;
	if (getClickableState("U", 13) === true) machinemodes = machinemodes + 1;

	// >= 2 return true
	if (machinemodes >= 2) return true;
	else return false;
}

function timeDisplay(value) {
	formatTime(value);
}
