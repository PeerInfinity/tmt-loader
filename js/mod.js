let modInfo = {
  name: "A Tree About Layers",
  id: "mymod",
  author: "liam",
  pointsName: "points",
  modFiles: ["layers.js", "tree.js"],

  discordName: "",
  discordLink: "https://discord.gg/GrMEPW7JZT",
  initialStartPoints: new Decimal(0), // Used for hard resets and new players
  offlineLimit: 0, // In hours
};

// Set your version in num and name
let VERSION = {
  num: "1.0",
  name: "Literally nothing",
};

let changelog = `<h1>Changelog:</h1><br>
	<h3>v1.0</h3><br>
		- Added 5 layers, 29 upgrades, and 5 achievements.<br>



		 <br><br><br><br>`;

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

  let gain = new Decimal(1);

  base = new Decimal(1);
  exp = new Decimal(1);

  if (hasUpgrade("p", 11)) base = base.add(1);
  if (hasUpgrade("p", 12)) base = base.add(1);
  if (hasUpgrade("p", 13)) base = base.add(1);
  if (hasUpgrade("p", 14)) base = base.add(1);
  if (hasUpgrade("sp", 11)) base = base.add(2);
  if (hasUpgrade("sp", 12)) base = base.add(2);
  if (hasUpgrade("sp", 13)) base = base.add(2);
  if (hasUpgrade("sp", 14)) base = base.add(2);

  if (hasUpgrade("bp", 21)) gain = gain.times(1.25);
  if (hasUpgrade("bp", 22)) gain = gain.times(1.25);
  if (hasUpgrade("bp", 23)) gain = gain.times(1.25);
  if (hasUpgrade("bp", 24)) gain = gain.times(1.25);

  if (hasUpgrade("sp", 21)) gain = gain.times(1.5);
  if (hasUpgrade("sp", 22)) gain = gain.times(1.5);
  if (hasUpgrade("sp", 23)) gain = gain.times(1.5);
  if (hasUpgrade("sp", 24)) gain = gain.times(1.5);
  if (hasUpgrade("sp", 31)) gain = gain.times(1.4);
  if (hasUpgrade("sp", 32)) gain = gain.times(1.4);
  if (hasUpgrade("sp", 33)) gain = gain.times(1.4);
  if (hasUpgrade("sp", 34)) gain = gain.times(1.4);
  if (hasUpgrade("r", 11)) gain = gain.times(3);
  if (hasUpgrade("r", 12)) gain = gain.times(3);
  if (hasUpgrade("r", 13)) gain = gain.times(10);
  if (hasUpgrade("m", 11)) gain = gain.times(upgradeEffect("m", 11));

  return gain.times(base).pow(exp);
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() {
  return {};
}

// Display extra things at the top of the page
var displayThings = [
  function () {
    if (!player.points.eq(-69))
      return "Note: This game gets WAY better at the 4th layer, I promise<br> Endgame: 3 multipliers and 50 rebirth points";
  },
];

// Determines when the game "ends"
function isEndgame() {
  return player.r.points.gte(new Decimal("50")) && player.m.points.gte(3);
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
