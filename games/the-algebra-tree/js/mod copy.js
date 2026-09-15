let modInfo = {
  name: "Breplicanti",
  id: "anans",
  author: "Alvi Deiectiones",
  pointsName: "Bres",
  modFiles: ["layers.js", "tree.js"],

  discordName: "",
  discordLink: "",
  initialStartPoints: new Decimal(10), // Used for hard resets and new players
  offlineLimit: 0, // In hours
};

// Set your version in num and name
let VERSION = {
  num: "0.0",
  name: "Literally nothing",
};

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.0</h3><br>
		- Added things.<br>
		- Added stuff.`;

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`;

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
function getPointGen() {
  if (!canGenPoints()) return new Decimal(0);

  let gain = new Decimal(0);

  let add = new Decimal(0);
  if (hasUpgrade("Numbers", 11))
    add = add.add(tmp["Numbers"].upgrades[11].effect);
  if (getBuyableAmount("Groups", 11).gte(1))
    add = add.add(tmp["Groups"].buyables[11].effect);

  let mul = new Decimal(1);
  if (hasUpgrade("Numbers", 12))
    mul = mul.mul(tmp["Numbers"].upgrades[12].effect);
  if (hasUpgrade("Numbers", 13))
    mul = mul.mul(tmp["Numbers"].upgrades[13].effect);

  let pow = new Decimal(1);
  pow = pow.mul(cyclicEffect());

  gain = gain.add(add).mul(mul).pow(pow);

  if (getBuyableAmount("Groups", 22).gte(1))
    gain = gain.tetrate(tmp["Groups"].buyables[22].effect);

  return gain;
}

function cyclicEffect() {
  let pow = new Decimal(1);
  for (let i = 12; i <= 20; i++) {
    if (getBuyableAmount("Groups", i).gte(1))
      pow = pow.mul(tmp["Groups"].buyables[i].effect);
  }
  for (let i = 23; i <= 27; i++) {
    if (getBuyableAmount("Groups", i).gte(1))
      pow = pow.mul(tmp["Groups"].buyables[i].effect);
  }

  return pow;
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() {
  return {};
}

// Display extra things at the top of the page
var displayThings = [];

// Determines when the game "ends"
function isEndgame() {
  return false;
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
