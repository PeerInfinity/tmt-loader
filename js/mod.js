let modInfo = {
    name: "The Mana Tree",
    author: "MSpekkio",
    pointsName: "mana",
    modFiles: ["layers/qiearth.js", "layers/qisky.js", "layers/qiocean.js", "layers/m.js", "layers/t.js", "layers/d.js", "layers/c.js", "layers/b.js", "layers/achievements.js", "tree.js"],

    discordName: "",
    discordLink: "",
    initialStartPoints: new Decimal(0), // Used for hard resets and new players
    offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
    num: "0.4",
    name: "Don't Qi me when I'm down",
}
// If you change anything in the game, make sure to keep it up to date
let changelog = `<h1>Changelog:</h1><br>
    <h3>v0.4</h3> - Don't Qi me when I'm down<br>
        - Added 3 new Layer, 4 upgrades and 3 achievements.<br>
        - Added various softcaps to upgrades and effects.<br>
        - Spelling errors fixed.<br>
    <h3>v0.3</h3> - Mo' Mana, Mo' Problems<br>
        - Core can now be advanced past 5 stars.<br>
		- Added Mana Meridians layer.<br>
        - Unlock exciting droplet automation.<br>
        - 15 new upgrades to discover.<br>
        <br>
    <h3>v0.2</h3> - Oh God, it's all so broken<br>
		- Bug fixes, no new gameplay.<br>
        <br>
	<h3>v0.1</h3> - The bare minimum<br>
		- 4 layers.<br>
		- 38 upgrades.<br>
		- 9 achievements.<br>
		- 4 milestones.<br>
		- self-doubt.<br>
	<h3>v0.0</h3><br>
		- We all start life at zero.<br>`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = []

function getStartPoints() {
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints() {
    return true
}

// Calculate points/sec!
function getPointGen() {
    if (!canGenPoints())
        return new Decimal(0)

    let gain = new Decimal(1)
    //add
    if (hasUpgrade("d", 11)) gain = gain.add(upgradeEffect("d", 11))
    if (hasUpgrade("d", 32)) gain = gain.add(upgradeEffect("d", 32))
    gain = gain.add(buyableEffect("m", 11))

    //mult
    gain = gain.times(tmp.t.effect) //location mana gain
    if (hasUpgrade("t", 13)) gain = gain.times(upgradeEffect("t", 13))
    if (hasUpgrade("d", 33)) gain = gain.times(upgradeEffect("d", 33))
    if (player.c.points.gte(1)) gain = gain.times(tmp.c.effect)
    if (hasUpgrade("b", 21)) gain = gain.times(upgradeEffect("b", 21))
    if (hasUpgrade("d", 41)) gain = gain.times(upgradeEffect("d", 41))
    if (hasUpgrade("qisky", 11)) gain = gain.times(upgradeEffect("qisky", 11))

    player.baseGain = gain

    let cap = new Decimal(100)
    cap = cap.add(buyableEffect("m", 11)) // base cap
    if (hasUpgrade("b", 24) && hasUpgrade("d", 11)) cap = cap.add(upgradeEffect("b", 24))

    if (hasUpgrade("t", 11)) cap = cap.times(upgradeEffect("t", 11))
    if (hasUpgrade("t", 21)) cap = cap.times(upgradeEffect("t", 21))
    if (hasUpgrade("b", 31)) cap = cap.times(upgradeEffect("b", 31))
    if (player.c.points.gte(1)) cap = cap.times(tmp.c.effect)
    if (hasUpgrade("b", 44)) cap = cap.times(upgradeEffect("b", 44).cap)
    if (hasUpgrade("b", 45)) cap = cap.times(upgradeEffect("b", 45).cap)

    cap = cap.add(buyableEffect("m", 12)) //final cap

    if (hasUpgrade("d", 41)) cap = cap.times(upgradeEffect("d", 41))
    cap = cap.times(tmp.qisky.effect) //qisky mana cap

    player.manaCap = cap

    if (player.points.gte(cap)) {
        //1 / (x / 100)^3
        let reductionPow = new Decimal(3)
        if (hasUpgrade("b", 45)) reductionPow = reductionPow.add(upgradeEffect("b", 45).reductionPow)

        let reduction = player.points.div(cap).pow(reductionPow)
        if (reduction.lte(1)) reduction = new Decimal(1)
        gain = gain.div(reduction)
        if (gain.lte(1.0)) gain = new Decimal(0)
    }

    return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() {
    return {
        baseGain: new Decimal(1),
        manaCap: new Decimal(100), // Default mana cap
    }
}

// Display extra things at the top of the page
var displayThings = [
    () => `Your Mana gain of ${format(player.baseGain)} is reduced above ${format(player.manaCap)} total mana`
]

// Determines when the game "ends"
function isEndgame() {
    return false
}

// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
    return (3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion) {
    console.log(oldVersion)

    if (oldVersion === "0.1") {
        if (player.b.points.gte(10)) player.b.points = new Decimal(10)
        if (player.c.points.gte(5)) player.c.points = new Decimal(5)
    }
}