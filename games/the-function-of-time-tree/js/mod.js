let modInfo = {
	name: "The Function of Time Tree",
	id: "tfotremake",
	author: "mikosss",
	pointsName: "Time",
	modFiles: [
		"layers/01_ghostlayers.js",
		"layers/02_ach.js",
		"layers/03_functions.js",
		"layers/04_auto.js",
		"layers/11_foft.js",
		"layers/12_upg.js",
		"layers/13_res.js",
		"layers/14_tmach.js",
		"layers/20_pres.js",
		"layers/21_goft.js",
		"layers/22_pupg.js",
		"layers/23_inf.js",
		"layers/24_4d.js",
		"layers/25_st.js",
		"layers/30_abd.js",
		"tree.js"
	],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (1), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "1.5.n+1",
	name: "Study Tree Update",
}

let changelog = `<h1>Changelog:</h1><br><br>
<h3 style="background-image: radial-gradient(#FFE77B, #234F1E);-webkit-background-clip: text;color: transparent;">v1.5.n+1</h3><br>
	- Fixed 5 Study Points hardcap<br><br>
<h3 style="background-image: radial-gradient(#FFE77B, #234F1E);-webkit-background-clip: text;color: transparent;">v1.5.n</h3><br>
	- Added stuffs about the study tree<br>
	- Added more stuffs about study tree and fixed other stuffs <br> (again, too lazy to state them...)<br><br>
<h3 style="background-image: radial-gradient(#FFE77B, #234F1E);-webkit-background-clip: text;color: transparent;">v1.5.0</h3><br>
	- Added Study Tree<br><br>
<h2 style="background-image: radial-gradient(#FFE77B, #234F1E);-webkit-background-clip: text;color: transparent;">Study Tree Update</h2><br><br>
<h3 style="background-image: linear-gradient(60deg, #970439, #FFFFFF, #BF40BF);-webkit-background-clip: text;color: transparent;">v1.4.n</h3><br>
	- Added stuffs about the infinity<br>
	- Added more stuffs about infinity <br> (too lazy to state them...)<br><br>
<h3 style="background-image: linear-gradient(60deg, #970439, #FFFFFF, #BF40BF);-webkit-background-clip: text;color: transparent;">v1.4.0</h3><br>
	- Added (real) Infinity<br><br>
<h2 style="background-image: linear-gradient(60deg, #970439, #FFFFFF, #BF40BF);-webkit-background-clip: text;color: transparent;">Infinity Update</h2><br><br>
<h3 style="background-image: radial-gradient(#FF7F7F, #797EF6);-webkit-background-clip: text;color: transparent;">v1.3.24</h3><br>
	- Automation comes now after Prestige<br><br>
<h3 style="background-image: radial-gradient(#FF7F7F, #797EF6);-webkit-background-clip: text;color: transparent;">v1.3.19</h3><br>
	- Increase time requirement for Challenge 'Break Infinity I' <br> and 'Heavy Machines & Break Infinity II'<br><br>
<h3 style="background-image: radial-gradient(#FF7F7F, #797EF6);-webkit-background-clip: text;color: transparent;">v1.3.17</h3><br>
	- Endgame is currently infinite time<br>
	- Completed 8 achievements<br>
	- Added 4 upgrades<br>
	- Added 4 buyables<br><br>
<h3 style="background-image: radial-gradient(#FF7F7F, #797EF6);-webkit-background-clip: text;color: transparent;">v1.3.0</h3><br>
	- Added 4th Dimension<br><br>
<h2 style="background-image: radial-gradient(#FF7F7F, #797EF6);-webkit-background-clip: text;color: transparent;">4th Dimension Update</h2><br><br>
<h3 style="color: #FFFFFF">v1.2.29</h3><br>
	- Added 8 Automation and Break-infinity Challenges<br>
	- Added 21 Automation options<br><br>
<h3 style="color: #FFFFFF">v1.2.0</h3><br>
	- Added Infinity<br>
	- Added Automation<br><br>
<h2 style="color: #FFFFFF">Automation Update</h2><br><br>
<h3 style="color: #970439">v1.1.49</h3><br>
	- Fixed interface<br><br>
<h3 style="color: #970439">v1.1.48</h3><br>
	- Endgame is currently infinite f(t) <br>
	- Added 2 buyables<br>
	- Added 25 upgrades<br>
	- Added 8 achievements that gives reward<br>
	- Completed 28 achivements out of 48<br><br>
<h3 style="color: #970439">v1.1.0</h3><br>
	- Added 'pU' Upgrades<br><br>
<h2 style="color: #970439">Another Upgrade Update</h2><br><br>
<h3 style="color: #BF40BF">v1.0.15</h3><br>
	- Added 5 Pres-Upgrades<br>
	- Added 4 variable boosts<br>
	- Added 4 variables<br><br>
<h3 style="color: #BF40BF">v1.0.2</h3><br>
	- Endgame is currently achievement 'Prestige'<br>
	- Released<br><br>
<h3 style="color: #BF40BF">v1.0.0</h3><br>
	- Added Prestige Layer<br><br>
<h2 style="color: #BF40BF">Release Update</h2><br><br>
<h3 style="color: #FFE4B5">v0.4.16</h3><br>
	- Completed 16 achievements out of 40<br><br>
<h3 style="color: #FFE4B5">v0.4.0</h3><br>
	- Added Achievements<br><br>
<h2 style="color: #FFE4B5">Achivements Update</h2><br><br>
<h3 style="color: #D0B49F">v0.3.4</h3><br>
	- Added T.F.G.E.<br>
	- Added Warp Warp Time<br>
	- Added Time Fragments Generator<br>
	- Added Wrap Time<br><br>
<h3 style="color: #D0B49F">v0.3.0</h3><br>
	- Added Time Machine<br><br>
<h2 style="color: #D0B49F">Time Machine Update</h2><br><br>
<h3 style="color: #234F1E">v0.2.17</h3><br>
	- Added 5 Res-Upgrades<br>
	- Added 5 'U' Upgrades<br>
	- Added 2 Research Upgrade Buyable<br>
	- Added 5 Variable Upgrade Buyable<br><br>
<h3 style="color: #234F1E">v0.2.0</h3><br>
	- Added Research<br><br>
<h2 style="color: #234F1E">Research Update</h2><br><br>
<h3 style="color: #FFE338">v0.1.5</h3><br>
	- Added 5 'U' Upgades<br><br>
<h3 style="color: #FFE338">v0.1.0</h3><br>
	- Added 'U' Upgrades<br><br>
<h2 style="color: #FFE338">Upgrade Update</h2><br><br>
<h3 style="color: #63C5DA">v0.0.4</h3><br>
	- Added 4 variables<br><br>
<h3 style="color: #63C5DA">v0.0.0</h3><br>
	- Added f(t) Layer<br><br>
<h2 style="color: #63C5DA">Origins</h2><br><br>`

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
	gain = gain.add(buyableEffect("tm",12))
	if (gain.gte(infinityCap())) gain = new Decimal(infinityCap())
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
	return hasUpgrade("st",51)
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