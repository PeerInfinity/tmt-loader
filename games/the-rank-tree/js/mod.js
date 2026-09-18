let modInfo = {
  name: "The Rank Tree",
  id: "mymod",
  author: "liam",
  pointsName: "rank power",
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

  let gain = new Decimal(1);
  if (hasMilestone("r", 1)) gain = gain.times(2);
  if (hasMilestone("r", 2)) gain = gain.times(player.r.points.add(1));
  if (hasMilestone("r", 3)) gain = gain.times(10);
  if (hasMilestone("r", 4)) gain = gain.times(40);
  if (hasMilestone("r", 6)) gain = gain.times(75);
  if (hasMilestone("r", 7)) gain = gain.times(1e6);
  if (hasMilestone("r", 9)) gain = gain.times(player.p.points.add(1).pow(4));
  if (hasMilestone("r", 10)) gain = gain.times(1e9);
  if (hasMilestone("r", 11)) gain = gain.times(1000);
  if (hasMilestone("r", 12)) gain = gain.times(1e7);

  if (hasMilestone("t", 1)) gain = gain.times(4);
  if (hasMilestone("t", 2) && player.t.points.gte(1))
    gain = gain.times(player.t.points.pow(3));
  if (hasMilestone("t", 3)) gain = gain.times(player.points.add(1).pow(0.4));
  if (hasMilestone("t", 4)) gain = gain.times(100);
  if (hasMilestone("tr", 1)) gain = gain.times(8);
  if (hasMilestone("t", 3)) gain = gain.times(player.tr.points.add(1).pow(2.6));
  if (hasMilestone("tr", 4)) gain = gain.times(1000);
  if (hasMilestone("p", 1)) gain = gain.times(25000);
  if (hasMilestone("t", 5)) gain = gain.times(123456);
  if (hasMilestone("h", 1)) gain = gain.times(1000000);

  if (hasMilestone("p", 2)) gain = gain.pow(1.12);
  if (hasMilestone("tr", 8)) gain = gain.pow(1.075);

  return gain;
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() {
  return {};
}

// Display extra things at the top of the page
var displayThings = [];

// Determines when the game "ends"
function isEndgame() {
  return player.points.gte(new Decimal("e280000000"));
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
