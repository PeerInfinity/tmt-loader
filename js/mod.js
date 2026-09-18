let modInfo = {
  name: "The Ultimate Tree Rewritten",
  id: "TUTR",
  author: "liam",
  pointsName: "points",
  modFiles: ["layers1.js", "tree.js"],

  discordName: "",
  discordLink: "https://discord.gg/GrMEPW7JZT",
  initialStartPoints: new Decimal(0), // Used for hard resets and new players
  offlineLimit: 0, // In hours
};

// Set your version in num and name
let VERSION = {
  num: "1.00",
  name: "OMG IT'S FINNALY OUT THIS IS THE BEST DAY EVER",
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

  base = new Decimal(1);
  mult = new Decimal(1);
  exp = new Decimal(1);

  if (hasUpgrade("p", 11)) mult = mult.times(2);
  if (hasUpgrade("p", 12)) mult = mult.times(upgradeEffect("p", 12));
  if (hasUpgrade("p", 13)) base = base.plus(2);
  if (hasUpgrade("p", 14)) base = base.plus(1);
  if (hasUpgrade("p", 14)) mult = mult.times(2);
  if (hasAchievement("a", 13)) mult = mult.times(1.2);
  if (hasUpgrade("sp", 11)) mult = mult.times(24);
  if (hasUpgrade("sp", 12)) mult = mult.times(2);
  if (hasUpgrade("sp", 13)) mult = mult.times(upgradeEffect("sp", 13));
  if (hasUpgrade("h", 11)) mult = mult.times(25);
  if (hasUpgrade("h", 12)) mult = mult.times(3);
  if (hasUpgrade("h", 13)) base = base.plus(1000);
  if (hasUpgrade("sp", 22)) mult = mult.times(30);
  if (hasUpgrade("sp", 23)) mult = mult.times(new Decimal.pow(1.2, 20));
  if (hasUpgrade("sp", 24)) mult = mult.times(15);
  if (hasUpgrade("h", 15)) mult = mult.times(upgradeEffect("h", 15));
  if (hasUpgrade("h", 21)) mult = mult.times(upgradeEffect("h", 21));
  if (hasUpgrade("h", 22)) mult = mult.times(5);
  if (hasUpgrade("h", 24)) mult = mult.times(8);
  if (hasUpgrade("mp", 11)) mult = mult.times(30);
  if (hasUpgrade("mp", 12)) mult = mult.times(10);
  if (inChallenge("mp", 11)) mult = mult.div(100);
  if (hasChallenge("mp", 11)) mult = mult.times(100);
  if (hasChallenge("mp", 12)) base = base.plus(50000);
  if (hasUpgrade("sp", 31)) mult = mult.times(69);

  if (inChallenge("mp", 12)) base = new Decimal(1);

  return base.times(mult).pow(exp);
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() {
  return {
    clicks: new Decimal(0),
    clickgain: new Decimal(1),
  };
}

// Display extra things at the top of the page
var displayThings = [
  function () {
    if (hasAchievement("a", 25))
      return (
        "Infinity Progress: " +
        format(player.points.add(1).log("1.78e308").times(100)) +
        "%"
      );
  },
];

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
