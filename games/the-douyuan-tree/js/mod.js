let modInfo = {
	name: "The Douyuan Tree",
	author: "hhc0001",
	pointsName: "点数",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (1), // Used for hard resets and new players
	offlineLimit: 100,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "beta 1.1",
	name: "I T 1",
}

let changelog = `
  <h1>更新日志：</h1><br>
	<h3>vbeta 1.1</h3><br>
	  - 加入了 I、T<br>
	  - 修复了 TU11 导致膨胀的问题<br>
		- 下层预告：B<br>
	<h3>vbeta 1.0</h3><br>
	  - 加入了 DU22、23、31、32、33（DU 感觉膨胀了）<br>
	<h3>vpre-build 0.1</h3><br>
	  - 加入了 DP, DU11、12、13、21<br>
	<br>
	<h3>vpre-build 0.0</h3><br>
		- 初始版本，没有更新`

let winText = `好吧，到此为止了，但是还会有更多......`

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
		return new Decimal("0")

	let gain = new Decimal("1")
	if(hasUpgrade('p', 11)) gain = gain.times(upgradeEffect('p', 11))
	if(hasUpgrade('p', 12)) gain = gain.times(upgradeEffect('p', 12))
	if(hasUpgrade('p', 13)) gain = gain.times(upgradeEffect('p', 13))
	if(hasUpgrade('p', 23)) gain = gain.times(upgradeEffect('p', 23))
	if(hasUpgrade('P', 11)) {
		if(hasUpgrade('P', 21)) gain = gain.times(player["P"].points.add(1).pow(30))
		else gain = gain.times(player["P"].points.add(1).pow(3))
	}
	if(hasUpgrade('I', 12)) gain = gain.times(upgradeEffect('I', 12))
	if(gain.gte(new Decimal("1e9000"))) {
		gain = new Decimal("1e9000").times(gain.div(new Decimal("1e9000")).pow(0.4))
	}
	if(hasUpgrade('I', 12) && hasUpgrade("T", 11)) gain = gain.times(upgradeEffect('I', 12))
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
	return player.points.gte(new Decimal("e1e9"))
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