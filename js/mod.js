let modInfo = {
    name: "Equilibrium",
    id: "eq.siro.dev",
    author: "Koko Ayame",
    pointsName: "Posibility",
    modFiles: ["layers.js", "tree.js"],

    discordName: "",
    discordLink: "",
    initialStartPoints: new Decimal (2), // Used for hard resets and new players
    offlineLimit: 48,  // In hours
}

// Set your version in num and name
let VERSION = {
    num: "0.0",
    name: "Equilibrium",
}

let changelog = `<h1>Changelog:</h1><br>
    <h3>v0.0</h3><br>
        - Added Positive & Negative`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
    return true;
}

const pointGenList = [
    ["+", 11],
    ["-", 11],
    ["-", 13]
];
// Calculate points/sec!
function getPointGen() {
    if(!canGenPoints())
        return new Decimal(0)

    let gain = new Decimal(0);
    let mult = new Decimal(1);
    gain = gain.add(layers["+"].pointGen());
    gain = gain.add(layers["-"].pointGen());

    for (const u of pointGenList) {
        if (!hasUpgrade(...u)) continue;
        const eff = upgradeEffect(...u).point;
        gain = gain.add(eff.gen);
    }

    return gain.mul(getPointFinalMult())
}

const finalMultList = [
    ["+", 11],
    ["-", 11]
];

function getPointFinalMult() {
    mult = new Decimal(1)
    for (const u of finalMultList) {
        if (hasUpgrade(...u)) mult = mult.mul(upgradeEffect(...u).point.final);
    }
    return mult;
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
    return player.points.gte(new Decimal("e280000000"))
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
    return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}