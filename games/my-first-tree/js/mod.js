let modInfo = {
	name: "MY FIRST Tree",
	author: "nobody",
	pointsName: "points",
	modFiles: ["/layers/achievements.js", "/layers/aMilestone.js", "/layers/bMilestone.js", "/layers/cMilestone.js", "/layers/dMilestone.js", "/layers/eMilestone.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 5,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.0.4",
	name: "Literally nothing",

}

let changelog = `<h1 style="font-size: 32px; color: #ffffff; font-weight: bold; font-style: italic; text-decoration: underline;">Changelog:</h1><br><br>

<h3 style="font-size: 20px; color: #00ff88; font-weight: bold; font-style: italic; text-decoration: underline;">v0.0.4</h3><br>
<span style="font-size: 24px; color: #dfdfdf; font-weight: bold; font-style: italic; text-decoration: underline;">
    - added C, D and E layers<br>
    - added +5 A milestone, +2 B milestone.<br>
    - added 10 Cmilestone, 10 D milestone and 1 E milestone.<br>
</span><br>

<h3 style="font-size: 20px; color: #00ff88; font-weight: bold; font-style: italic; text-decoration: underline;">v0.0.3</h3><br>
<span style="font-size: 24px; color: #dfdfdf; font-weight: bold; font-style: italic; text-decoration: underline;">
    - added B layer<br>
    - added 10 B milestone.<br>
</span><br>

<h3 style="font-size: 20px; color: #00ff88; font-weight: bold; font-style: italic; text-decoration: underline;">v0.0.2</h3><br>
<span style="font-size: 24px; color: #dfdfdf; font-weight: bold; font-style: italic; text-decoration: underline;">
    - added 5 A milestone.<br>
</span><br>

<h3 style="font-size: 20px; color: #00ff88; font-weight: bold; font-style: italic; text-decoration: underline;">v0.0.1</h3><br>
<span style="font-size: 24px; color: #dfdfdf; font-weight: bold; font-style: italic; text-decoration: underline;">
    - added 5 A milestone.<br>
</span>`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
	//a upgrades
	if (hasUpgrade("a", 11)) gain = gain.times(2)
	if (hasUpgrade("a", 12)) gain = gain.times(3)
	if (hasUpgrade("a", 21)) gain = gain.times(upgradeEffect("a", 21))
	//a upgrades
	//a layer boosts
	if (hasMilestone("a", 1)) gain = gain.times(1.2)
	if (hasMilestone("a", 2)) gain = gain.times(1.4)
	if (hasMilestone("a", 3)) gain = gain.times(1.6)
	if (hasMilestone("a", 4)) gain = gain.times(1.8)
	if (hasMilestone("a", 5)) gain = gain.times(2)
	if (hasMilestone("a", 6)) gain = gain.times(2.2)
	if (hasMilestone("a", 7)) gain = gain.times(2.4)
	if (hasMilestone("a", 8)) gain = gain.times(2.6)
	if (hasMilestone("a", 9)) gain = gain.times(3)
	if (hasMilestone("a", 10)) gain = gain.times(4)
	if (hasMilestone("a", 11)) gain = gain.times(7)
	if (hasMilestone("a", 12)) gain = gain.times(10)
	if (hasMilestone("a", 13)) gain = gain.times(13)
	//a layer boosts
	//b layer boosts
	if (hasMilestone("b", 1)) gain = gain.times(1.2)
	if (hasMilestone("b", 2)) gain = gain.times(1.3)
	if (hasMilestone("b", 3)) gain = gain.times(1.4)
	if (hasMilestone("b", 4)) gain = gain.times(1.5)
	if (hasMilestone("b", 5)) gain = gain.times(1.6)
	if (hasMilestone("b", 6)) gain = gain.times(1.8)
	if (hasMilestone("b", 7)) gain = gain.times(2)
	if (hasMilestone("b", 8)) gain = gain.times(2.4)
	if (hasMilestone("b", 9)) gain = gain.times(2.8)
	if (hasMilestone("b", 10)) gain = gain.times(3.2)
	if (hasMilestone("b", 11)) gain = gain.times(3.6)
	if (hasMilestone("b", 12)) gain = gain.times(4)
	//b layer boosts
	//c layer boosts
	if (hasMilestone("c", 1)) gain = gain.times(1.1)
	if (hasMilestone("c", 2)) gain = gain.times(1.1)
	if (hasMilestone("c", 3)) gain = gain.times(1.1)
	if (hasMilestone("c", 4)) gain = gain.times(1.1)
	if (hasMilestone("c", 5)) gain = gain.times(1.1)
	if (hasMilestone("c", 6)) gain = gain.times(1.1)
	if (hasMilestone("c", 7)) gain = gain.times(1.1)
	if (hasMilestone("c", 8)) gain = gain.times(1.1)
	if (hasMilestone("c", 9)) gain = gain.times(1.1)
	if (hasMilestone("c", 10)) gain = gain.times(2)
	//c layer boosts
	//d layer boosts
	if (hasMilestone("d", 4)) gain = gain.times(2)
	if (hasMilestone("d", 5)) gain = gain.times(2.5)
	if (hasMilestone("d", 6)) gain = gain.times(3)
	if (hasMilestone("d", 7)) gain = gain.times(4)
	if (hasMilestone("d", 8)) gain = gain.times(5)
	if (hasMilestone("d", 9)) gain = gain.times(6)
	if (hasMilestone("d", 10)) gain = gain.times(10)
	//d layer boosts
	//e layer boosts
	if (hasMilestone("e", 1)) gain = gain.times(5)
	/*if (hasMilestone("e", 5)) gain = gain.times(2.5)
	if (hasMilestone("e", 6)) gain = gain.times(3)
	if (hasMilestone("e", 7)) gain = gain.times(4)
	if (hasMilestone("e", 8)) gain = gain.times(5)
	if (hasMilestone("e", 9)) gain = gain.times(6)
	if (hasMilestone("e", 10)) gain = gain.times(10)*/
	//e layer boosts


	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
    // 1. Sukaupto laiko rodymas
    function() {
        if (player.offlinetime > 0) {
            return "Sukauptas laikas neprisijungus: " + formatTime(player.offlinetime)
        }
        return ""
    },

    // 2. Žaidimo pabaigos (Endgame) rodymas
    function() {
        // Čia nurodykite savo galutinį tikslą. Pavyzdžiui, jei žaidimo pabaiga yra 1,000,000 C taškų:
        return "Current Endgame: 2 E points"
    }
]

// Determines when the game "ends"
function isEndgame() {
	return player.e.points.gte(new Decimal(2))
	//return player.points.gte(new Decimal("e14"))
	//return player.points.gte(new Decimal("e280000000"))
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