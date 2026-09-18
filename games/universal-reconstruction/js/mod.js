let modInfo = {
	name: "Universal Reconstruction",
	id: "universal-reconstruction",
	author: "Escapee",
	pointsName: "??",
	modFiles: [
		"tree.js",
		"layers/help.js",
		"layers/root/abyss.js",
		"layers/root/skyrmion.js",
		"layers/root/fome.js",
		"layers/root/acceleron.js",
		"layers/root/timecube.js",
		"layers/root/inflaton.js",
		"layers/root/entangledStrings.js",
		"layers/standard/bosons.js",
		"layers/standard/gluons.js",
		"layers/standard/gravitons.js",
		"layers/standard/photons.js",
	],

	discordName: "Escapee",
	discordLink: ""
}

// Set your version in num and name
let VERSION = {
	num: "0.8.2",
	name: "Fragmentation",
}

let changelog = `
	<h1>Changelog:</h1>
	<br><br>
    <h3>v0.8.2</h3>
    <br>- BIG TIMELINE REBALANCE
    <br>- Top score now scales similarly to the other resources - this is a buff at low amounts, but a nerf later
    <br>- Level 1 Top timeline nerfed from /1e6 -> /1e3
    <br>- 'Tower' timecube upgrade reworked, now provides Foam retainment to Skyrmion resources
    <br>- Base timeline score divisor reduced from /1e6 -> /1e4
    <br>- Fourth row timecube upgrades reduced in price
    <br>- Entanglement requirements reduced to compensate for reduced scores
    <br>- Several other small changes and bug fixes
    <br><br>
    <h3>v0.8.1</h3>
    <br>- Fix a few more bugs
    <br>- Acceleron upgrades are now always visible after entangling
    <br><br>
    <h3>v0.8.0 - Fragmentation</h3>
    <br>- Graphical changes to many features
    <br>- A few more bugfixes
    <br>- Timecube layer expanded to a full layer's worth of content after purchasing the relevant Inflaton upgrade
    <br>- Subspatial Construction now takes priority over other repeatables, if it is the cheapest available
    <br>- Added three slots for entropic enhancement presets
    <br><br>
	<h3>v0.7.1</h3>
	<br>- Lots of little bugfixes
	<br>- Enter the Abyss challenge is now moved into its own row-3 layer, for proper reset handling (it's still living in Skyrmions though)
	<br>- Added initialization checks to save loading to get the extra abyss layer data read correctly
    <br><br>
	<h3>v0.7.0 - Prioritization</h3>
	<br>- Update to TMT 2.6.5.1
	<br>- Tons of backend changes, improvements, and future systems
	<br>- Added five new content-selector upgrades (only one implemented so far)
	<br>- Four more repeatable Pion and Spinor upgrades each
	<br>- An optional challenge to beat to unlock their automation
	<br>- Official support for pausing the game (if you feel like it)
	<br><br>
	<h3>v0.6.0 - Amplification</h3>
	<br>- Updated to TMT 2.5.11.1
	<br>- Filled out the Inflaton layer
	<br>- Initial balance pass for both Acceleron- and Inflaton-first playthroughs
	<br>- Added a help tab, with information on each major layer
	<br>- Various improvements to background systems
	<br>- Added the initial framework for the final phase 1 layer
	<br><br>
	<h3>v0.5.0 - Dilation</h3>
	<br>- Finished Acceleron layer up to Inflaton unlock
	<br>- Nerfed higher resource Acceleron and Quantum Foam effects (while likely drop those nerfs by a lot later)
	<br>- Re-enabled Inflaton layer, but with nothing in there yet
	<br><br>
	<h3>v0.4.0 - Crystallization</h3>
	<br>- Updated to TMT 2.4
	<br>- Rebalanced everything from Foam unlock through Time Cubes
	<br>- Replaced Entropic Enhancement selectors with more defined upgrade selections
	<br>- Fixed some typos and clarity issues
	<br><br>
	<h3>v0.3.3</h3>
	<br>- Merge first two Acceleron milestones
	<br><br>
	<h3>v0.3.2</h3>
	<br>- Fixed Skyrmion and Acceleron upgrades being buyable without enough points
	<br>- Added Buy All buttons and hotkeys for Skyrmion and Foam layers, and shifted around milestones to unlock them
	<br><br>
	<h3>v0.3.1</h3>
	<br>- Fixed Skyrmions and Foam not generating without Entropic Loop 2
	<br><br>
	<h3>v0.3.0 - Acceleration</h3>
	<br>- Started work on Inflatons
	<br>- Implemented first half of Accelerons
	<br>- Deflated higher Skyrmion and Foam amounts
	<br>- Minor rebalance to shift end-of-Foam to intended route
	<br><br>
	<h3>v0.2.0 - Formation</h3>
	<br>- Added Infinitesimal through Quantum Foam boosts and buyables
	<br>- Added Foam milestones
	<br>- Rebalanced Foam formation levels
	<br>- Rebalanced Pion and Spinor α and γ buyables
	<br>- Added 6 more Pion and Spinor buyables each
	<br>- Added Pion and Spinor autobuyer upgrades
	<br>- Barebones third row added - no content yet
	<br><br>
	<h3>v0.1.0 - Creation</h3>
	<br>- Added two layers, Skyrmion and Foam
	<br>- Pre-foam Skyrmion complete
	<br>- Protoversal Foam sub-layer and Skyrmion buyables complete
	<br>- Added framework for Infinitesimal through Quantum Foam sub-layers
`

let winText = `Congratulations! You have reached the end and beaten this game, for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ['displayBoost', 'buyBuyable', 'getTotalBoost', 'buyableAmount', 'createBuyable', 'progressEffect', 'intervalEffect', 'finishEffect', 'hoverDisplay']

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	universeTab: "none"
}}

// Display extra things at the top of the page
var displayThings = [
	() => player.paused ? "Paused (press P to resume)<br><br>" : "",
	() => player.points.gt(0)
		? player.points.gt(1)
			? `You have completed <h2 class="overlayThing" id="points">${formatWhole(player.points)}</h2> Universes`
			: `You have completed <h2 class="overlayThing" id="points">${formatWhole(player.points)}</h2> Universe`
		: `You have <h2 class="overlayThing" id="points">0</h2> ??`,
	"Current Endgame: 4 Entangled Strings"
]

// Determines when the game "ends"
function isEndgame() {
	return player.entangled.points.gte(4)
}

// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(1) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
	delete player.skyrmion.clickables[0]
	delete player.skyrmion.clickables[1]
}