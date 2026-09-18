let modInfo = {
	name: "The Universal Shifting Tree",
	author: "Elitheli",
	pointsName: "Quarks",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 0,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.20.1.2",
	name: "post-scaling III",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.20.1.2: post-scaling III</h3><br>
	<h4>3/25/26</h4>
		- Balanced the game AGAIN<br>
		- Dimensions now start at 1e9 Quarks<br>
		- Changed an upgrade to a milestone<br><br>
	<h3>v0.20.1.1: locked in in mathcounts state</h3><br>
	<h4>3/21/26</h4>
		- Balanced the game, because a good amount of people said to balance it, ty for your finds!<br>
		- Added 2 EDUCATIONAL infoboxes: Quarks and Subatomic Particles (will finish in v0.20.2)<br>
		- Added 1 info infobox: READ ME 2, for people to know what Universal Shift does<br>
		- ima split into 2 parts so I can work on it in school as well<br>
		- Was on my little Spring Break hiatus, and i got 89th out of 220 kids in mathcounts state! yay for me<br>
		- btw i got 60 places higher than my friend so take that reedthereed get better at math (inside joke you wouldn't get it)<br><br>
	<h2>v0.2: MOLECULE BY MOLECULE</h2><br>
	<h4>3/16/26</h4>
		- Added AND Implemented Molecules (new main layer) AND Big Bangs (automation)<br>
		- Added Universal Shift #11<br>
		- Added the thing where when you buy a milestone the next one appears<br>
		- Added 5 more Dimension upgrades<br>
		- Added 5 more Subatomic Particle upgrades<br>
		- Added some periods<br>
		- Fixed the NaN bug in the Dimensions layer<br>
		- ENDGAME: 1e1300 Quarks<br>
		- only reason why this took so long is because i hate balancing but i had to<br><br>
	<h3>v0.13: locked in in 1st period</h3><br>
	<h4>3/13/26</h4>
		- Added Universal Shifts #4 - #10.<br>
		- Added the thing where when you buy an upgrade the next one appears<br>
		- Dimensions cost has changed, and added 2 more Dimension upgrades<br>
		- Added 3 more Atoms upgrades, so atoms is finally worth getting<br>
		- ENDGAME: 1e140 Quarks<br><br>
	<h3>v0.12: Dimensional Boost???</h3><br>
	<h4>3/12/26</h4>
		- Added Dimensions, unlocked at Universal Shift #3<br>
		- Added 2 Universal Shift Milestones<br>
		- Universal Shift scaling is faster<br><br>
	<h3>v0.11: Universe is shifting...</h3><br>
	<h4>3/11/26</h4>
		- Added 3 SA upgrades, and 3 A upgrades<br>
		- Universal Shift is now 1 Million Quarks, sorry for the inconvience :(<br><br>
	<h3>v0.10.1: Post-Scaling I</h3><br>
	<h4>3/10/26</h4>
		- Atoms are now unacessible until Universe Shift #1<br>
		- There's still nothing yet in atoms tho (THE POWER OF YET)<br><br>
	<h2>v0.1: UNIVERSAL COLLAPSE</h3><br>
	<h4>3/10/26</h4>
		- Implemented Universal Shift<br>
		- Locked atoms until 100 Subatomic Particles (sowwy)<br>
		- Reversed the changelog so the most recent updates are shown at the top<br>
		- OH MY GOSH THIS WAS SO HARD TO IMPLEMENT<br><br>
	<h3>v0.02: nvm the quarks align</h3><br>
	<h4>3/7/26</h4>
		- Changed Subatomic Particles to Quarks (i'll add explanations later)<br>
		- Changed Atoms to Subatomic Particles (reasonable)<br><br>
	<h3>v0.01.1: Atoms</h3><br>
	<h4>3/7/26</h4>
		- Added Atoms<br><br>
	<h3>v0.01: The atoms align.</h3><br>
	<h4>3/6/26</h4>
		- Added Subatomic Particles<br>
		- MY BRAIN IS ALREADY DEAD`

let winText = `this game is shirt sowwy :( Anyways, try out the Leaf Growth Prestige Tree!<br>
i sometimes update in school or home`

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
	if (!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(0)
	if (hasUpgrade('SA', 11)) gain = gain.add(1)
	if (hasUpgrade('SA', 12)) gain = gain.times(3)
	if (hasUpgrade('SA', 13)) gain = gain.times(upgradeEffect('SA', 13))
	if (hasUpgrade('SA', 14)) gain = gain.times(upgradeEffect('SA', 14))
	if (hasUpgrade('SA', 21)) gain = gain.pow(1.1)
	if (hasUpgrade('SA', 22)) gain = gain.times(3)
	if (hasUpgrade('SA', 24)) gain = gain.times(7)
	if (hasUpgrade('SA', 25)) gain = gain.times(upgradeEffect('SA', 25))
	if (hasUpgrade('SA', 31)) gain = gain.times(upgradeEffect('SA', 31))
	if (hasUpgrade('SA', 33)) gain = gain.times(upgradeEffect('SA', 33))
	if (hasUpgrade('SA', 34)) gain = gain.times(upgradeEffect('SA', 34))

	if (hasUpgrade('A', 11)) gain = gain.times(5)
	if (hasUpgrade('A', 12)) gain = gain.times(3)
	if (hasUpgrade('A', 13)) gain = gain.times(upgradeEffect('A', 13))
	if (hasUpgrade('A', 21)) gain = gain.times(upgradeEffect('A', 21))
	if (hasUpgrade('A', 22)) gain = gain.times(10)

	if (hasUpgrade('D', 11)) gain = gain.times(upgradeEffect('D', 11))

	if (hasUpgrade('M', 11)) gain = gain.times(upgradeEffect('M', 11))
	if (hasUpgrade('M', 12)) gain = gain.times(upgradeEffect('M', 12))

	if (hasMilestone('US', 0)) gain = gain.times(2.5)
	if (hasMilestone('US', 1)) gain = gain.times(3)
	if (hasMilestone('US', 2)) gain = gain.times(2)
	if (hasMilestone('US', 3)) gain = gain.times(2.70)
	if (hasMilestone('US', 5)) gain = gain.times(1.01)
	if (hasMilestone('US', 8)) gain = gain.times(10)
	if (hasMilestone('US', 9)) gain = gain.times(10)
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("1e1300"))
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