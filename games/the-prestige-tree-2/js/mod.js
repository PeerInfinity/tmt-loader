let modInfo = {
  name: "The Prestige Tree 2",
  id: "767756845683579465",
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
  num: "1.0.0",
  name: "The Start Of Everything",
};

let changelog = `<h1>Changelog:</h1><br>
<h2><br><br>Updates are formated like this:</h2><br>
		<h3>A.B.C</h3><br>
		<h4>A is major updates, B is regular content updates, and C is bugfixes, very small updates, or patches.</h4>

<h3><br><br>v1.0.0 - The Start Of Everything - 4/12/2026</h3><br>
		- Added prestige, boosters, generators, and enhance.<br>
    - Added a sub-currency, generator power.<br>
  	- Added 21 upgrades.<br>
		- Added 3 milestones.<br>
		- Added 11 achievements.<br>
		- Added a bar to show how many achievements you have.<br>


	<h3><br><br>v0.0.0</h3><br>
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

  base = new Decimal(1);
  multi = new Decimal(1);
  exp = new Decimal(1);

  if (hasUpgrade("p", 12)) base = base.add(1);
  if (hasUpgrade("p", 14)) base = base.add(1);

  if (hasUpgrade("p", 11)) multi = multi.times(2);
  if (hasUpgrade("p", 21)) multi = multi.times(2);
  if (hasUpgrade("p", 13)) multi = multi.times(upgradeEffect("p", 13));
  if (hasUpgrade("p", 22)) multi = multi.times(upgradeEffect("p", 22));
  if (hasAchievement("ach", 13)) multi = multi.times(1.25);
  if (player.b.unlocked) multi = multi.times(tmp.b.effect);
  if (hasUpgrade("b", 11)) multi = multi.times(upgradeEffect("b", 11));
  if (player.g.unlocked) multi = multi.times(tmp.g.powerEff);

  return base.times(multi).pow(exp);
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() {
  return {};
}

// Display extra things at the top of the page
var displayThings = [];

// Determines when the game "ends"
function isEndgame() {
  return new Decimal(player.ach.achievements.length).gte(new Decimal("11"));
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
