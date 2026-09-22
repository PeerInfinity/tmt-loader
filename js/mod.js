let modInfo = {
  name: "The Cosmic Tree",
  author: "Anthony",
  pointsName: "particles",
  modFiles: [
    "layers/layer1/layers.js",
    "tree.js",
    "layers/layer1/quarks.js",
    "layers/layer2/hypermultiplier.js",
    "layers/sidelayer/craftingtable.js",
    "layers/sidelayer/bossfights.js",
    "layers/sidelayer/orbitalstation.js",
    "layers/sidelayer/acheivments.js",
    "layers/layer2/vinylmultiplier.js",
    "layers/layer2/atoms.js",
    "layers/layer2/cosmicdust.js",
    "layers/sidelayer/alchemylab.js",
    "layers/layer3/cells.js",
    "layers/layer3/heavymultiplier.js",
    "layers/layer3/tetra.js",
    "layers/layer3/boracite.js",
    "layers/layer4/dimensions.js",
    "layers/layer3/mechanicalmultiplier.js",
    "layers/sidelayer/artifacts.js",
    "layers/layer4/megamultiplier.js",
    "layers/layer4/organs.js",
    "layers/layer4/nissionite.js",
    "layers/layer5/evolution.js",
    "layers/layer5/nuclearmultiplier.js",
    "layers/layer5/axioms.js",
    "layers/layer6/volts.js",
    "layers/layer5/stargazedmetal.js",
    "layers/layer7/civilization.js",
    "layers/layer7/computers.js",
    "layers/layer7/entropy.js",
    "layers/layer8/pendulums.js",
    "layers/layer8/supermultiplier.js",
    "layers/layer8/supercomputers.js",
    "layers/layer9/quantummultiplier.js",
    "layers/layer9/prisms.js",
    "layers/layer9/quantumcomputers.js",
    "layers/layer10/ai.js",
    "layers/layer10/physics.js",
    "layers/layer10/virtualengine.js",
    "layers/layer11/matrix.js",
    "layers/layer11/singularity.js",
    "layers/layerFinal/encapsulatedsingularity.js",
  ],

  discordName:
    "citations: https://www.energy.gov/science/doe-explainsquarks-and-gluons , https://en.wikipedia.org/wiki/Quark",
  discordLink: "",
  initialStartPoints: new Decimal(10), // Used for hard resets and new players
  offlineLimit: 1, // In hours
};

/* Issues that need to be solved
A) Mechanical has no tooltip
B) UI redo
C) Vinyl returns infinity - error
D) Frost arz may not be unlocked properly - remember to fix this especially

*/

// Set your version in num and name
let VERSION = {
  num: "0.1.1",
  name: "Sine-Cosine Duality",
};

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.1.1</h3><br>
		- Sine-Cosine duality.<br>
		- Waves.;
    - Bossfights
    - Subcurrency reworks + new Volt buyable.`;

let winText = `Congratulations! You have reached the end and beaten this game, for now...`;

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
function calculateEvolution() {
  // evolution.js related
  player.e.orgoCount = player.e.orgoCount.sub(1);
  if (player.e.orgoCount.eq(new Decimal(0))) {
    player.e.orgoCount = player.e.orgoNumber.add(player.e.organism);
    player.e.orgoNumber = player.e.orgoCount;
    player.e.evolutionCount = player.e.evolutionCount + 1;
  }
}
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
  if (inChallenge("sm", 12)) {
    let mult = new Decimal(1);
    if (player.sm.starglass.gte(1))
      mult = mult.times(player.sm.starglassFunction());
    return mult;
  }
  if (getGridData("art", 302) == 2) mult = mult.times(10);
  if (hasUpgrade("m", 11)) gain = gain.times(2);
  if (player.b.Panenite.gte(1))
    gain = gain.times(player.b.paneniteMultiplier());
  if (hasUpgrade("m", 12)) gain = gain.times(1.75);

  if (hasUpgrade("m", 13)) gain = gain.times(upgradeEffect("m", 13));
  if (hasUpgrade("q", 15)) gain = gain.times(upgradeEffect("q", 15));
  if (hasUpgrade("q", 11)) gain = gain.times(2);
  if (hasUpgrade("mm", 31)) gain = gain.times(20);
  if (inChallenge("a", 12)) gain = gain.times(0.25);
  if (inChallenge("a", 21)) gain = gain.times(0.1666);
  if (hasUpgrade("m", 21)) gain = gain.times(2);
  if (getBuyableAmount("ce", 104).gte(1))
    gain = gain.times(buyableEffect("ce", 104));
  if (hasUpgrade("m", 24)) gain = gain.times(1.1);

  if (player.ce.points.gte(1))
    gain = gain.times(new Decimal(4).mul(player.ce.points));
  if (hasUpgrade("m", 17)) gain = gain.times(1.5);
  if (hasUpgrade("q", 16)) gain = gain.times(1.5);
  if (hasUpgrade("q", 13)) gain = gain.times(upgradeEffect("q", 13));

  if (hasMilestone("hm", 1)) gain = gain.times(10);
  if (hasUpgrade("m", 31)) gain = gain.times(2);
  if (hasUpgrade("m", 33)) gain = gain.times(3);
  if (hasUpgrade("m", 35)) gain = gain.times(1.5);
  if (getBuyableAmount("ce", 18).gte(1))
    gain = gain.times(buyableEffect("ce", 18));
  if (getBuyableAmount("ce", 17).gte(1))
    gain = gain.times(buyableEffect("ce", 17));
  if (hasUpgrade("hm", 34)) gain = gain.times(upgradeEffect("hm", 34));
  if (hasUpgrade("q", 21)) gain = gain.times(2);
  if (hasUpgrade("q", 24)) gain = gain.times(2);
  if (hasUpgrade("ce", 21)) gain = gain.times(upgradeEffect("ce", 21));
  if (getBuyableAmount("t", 15).gte(1))
    gain = gain.times(buyableEffect("t", 15));
  if (getBuyableAmount("t", 35).gte(1))
    gain = gain.times(buyableEffect("t", 35));
  if (getBuyableAmount("t", 44).gte(1))
    gain = gain.times(buyableEffect("t", 44));
  if (getBuyableAmount("t", 42).gte(1))
    gain = gain.times(buyableEffect("t", 42));
  if (getBuyableAmount("t", 51).gte(1))
    gain = gain.times(buyableEffect("t", 51));

  let formula1 = buyableEffect("t", 53)[0];
  let formula2 = buyableEffect("t", 53)[1];
  let formula3 = buyableEffect("t", 53)[2];

  if (getBuyableAmount("t", 53).gte(1))
    gain = gain.times(formula1).times(formula2).times(formula3);

  if (inChallenge("t", 21)) {
    gain = gain.times(1);
  } else {
    if (hasUpgrade("a", 21)) gain = gain.times(2);

    if (hasUpgrade("v", 11)) gain = gain.times(upgradeEffect("v", 11));
    if (hasMilestone("h", 1)) gain = gain.times(4);
    if (hasMilestone("h", 10)) gain = gain.times(2);
    if (hasMilestone("h", 11))
      gain = gain.times(player.h.points.plus(1).pow(0.5));
    if (hasUpgrade("a", 11)) gain = gain.times(2);
    if (hasUpgrade("a", 13)) gain = gain.times(3);
    if (hasUpgrade("c", 21)) gain = gain.times(10);
    if (hasUpgrade("c", 22)) gain = gain.times(10);
    if (hasUpgrade("c", 15)) gain = gain.times(upgradeEffect("c", 15));
    if (hasChallenge("a", 22)) gain = gain.times(challengeEffect("a", 22));
  }
  if (player.ct.bdust.gte(1)) gain = gain.times(player.ct.bdustEffect2());
  if (player.ct.crystalFlake.gte(1))
    gain = gain.times(player.ct.flakeEffect2());
  if (inChallenge("d", 14)) {
    gain = gain.times(1);
  } else {
    if (hasUpgrade("mm", 12)) gain = gain.times(30);
    if (hasUpgrade("mm", 31)) gain = gain.times(20);
  }
  if (getBuyableAmount("d", 18)) gain = gain.times(buyableEffect("d", 18));
  if (inChallenge("a", 22)) gain = gain.times(0.00000000000000000001);
  if (hasUpgrade("d", 33)) gain = gain.times(upgradeEffect("d", 33));
  if (hasUpgrade("d", 37)) gain = gain.times(upgradeEffect("d", 37));
  if (hasUpgrade("d", 50)) gain = gain.times(1e9);
  if (hasUpgrade("ax", 11)) gain = gain.times(1e9);
  if (hasUpgrade("ax", 13)) gain = gain.times(1e10);
  if (hasUpgrade("ax", 14)) gain = gain.times(upgradeEffect("ax", 14));
  if (hasUpgrade("ax", 15)) gain = gain.times(upgradeEffect("ax", 15));
  if (player.ax.mathGamePoints.gte(1))
    gain = gain.times(player.ax.mathGameBoost());
  if (player.sm.starglass.gte(1))
    gain = gain.times(player.sm.starglassFunction());
  if (player.nm.uWaste.gte(1e9)) gain = gain.times(new Decimal(-1));
  if (player.nm.pWaste.gte(1e8)) gain = gain.times(new Decimal(-1));
  return gain;
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() {
  return {
    equipped: "",
    dmg: 0,
    hp: 100,
    critdmg: 0,
    critChance: 0.01,
    armor: 0,
    boss: {
      name: "",
      dmg: 0,
      hp: 1e300,
      critdmg: 0,
      critChance: 0,
      reward: "",
      rewardAmount: new Decimal(1),
      cd: 1000,
    },
  };
}

// Display extra things at the top of the page
var displayThings = ["Current endgame: 100K Volts"];

// Determines when the game "ends"
function isEndgame() {
  return player.vo.points.gte(new Decimal(100000));
}

function showText(text) {
  let element = document.getElementById("tabContent");
  element.innerHTML = text;
}

// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {
  "background-image": "url('resources/cosmos.jpg')",
  width: "100%",
  height: "100%",
  "background-size": "cover",
};

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
  return 3600; // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion) {}
