let modInfo = {
	name: "The Cultree",
	id: "cult1337",
	author: "Neutral",
	pointsName: "Faith",
	modFiles: ["tree.js","layers/a.js","layers/c.js","layers/g.js","layers/k.js","layers/m.js","layers/spooky.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (1), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.0.6.9",
	name: "Perfectly balanced, as all things should be",
}

let changelog = `<h1>Changelog:</h1><br>
	<br><h3>v0.0.6.9</h3><br>
		- Technical: Moved layers into separate files.<br>
		- This whole update is balance changes.<br>
		- Added 'm' which is just a win the game button.<br>
		- Endgame: Updated.<br>
		- Goals:<br>
		- Conviction upgrades less unimportant.<br>
		- Gold takes longer but scales better.<br>
		- Chi unlocked earlier so it can help build the cult.<br>
		- Chi upgrades, buyables, etc. spaced out.<br>
	<br><h3>v0.0.6</h3><br>
		- All Stats Implemented.<br>
		- CON replaced by LCK.<br>
		- Balancing needed, mostly for upgrades and stuff.<br>
		- Releasing this as the layer is feature complete.<br>
		- Not balance complete, feature.<br>
		- Added: Nice.<br>
		- To-Do: More Upgrades/Better Ones.<br>
		- To-Do: More Belts -> Degrees -> Red Belt.<br>
	<br><h3>v0.0.5</h3><br>
		- "Well Ackchyually, US Census Bureau Estimates 7.942e9" ~My Brother<br>
		- Lots and lots and lots and lots of tweaking to fix the early game softlock achievements unbalancing things.<br>
		- The goal is to get K working.<br>
		- Not balanced, working.<br>
		- Moved /s to INSIDE the (), cause it was unanimously decided upon. Thanks voters.<br>
		- It's half working now so I'm releasing this for feedback on CONCEPT.<br>
		- None Balance Exists.<br>
		- None Effect Exists.<br>
	<br><h3>v0.0.4</h3><br>
		- Changed world pop to (8.009e9), Thanks Bagel.<br>
		- Changed from using bad upgrades as cost increase markers to using an infobox, Thanks jakub.<br>
	<br><h3>v0.0.3</h3><br>
		- Mostly cosmetic changes.<br>
		- Added an ending.<br>
		- Kinda sorta balanced gold maybe ish.<br>
		- I intend for K to also boost Conviction so Gold is a _bit_ slow.<br>
		- I'm actually probably going to have to slow it even more once that's implemented.<br>
		- Now to start working on K. Just, later. It's 3am and I work tomorrow.<br>
	<br><h3>v0.0.2</h3><br>
		- Now 11 upgrades work as intended.<br>
		- Automation of first layer exists.<br>
		- Second layer implemented (badly).<br>
		- Game is sort of psuedo balanced for about 10 minutes.<br>
		- Probably going to break that when I get the third layer working.<br>
		- To-Do: Figure out mechanics that are interesting for more layers.<br>
		- To-Do: Space! Magic! Necromancy?<br>
		- To-Do: Vampires and were-wolves and other things could be cool...<br>
		- To-Do: Infobox for church explaining how the members work.<br>
		- Removed hiding layers because wiggles are bad.<br>
	<br><h3>v0.0.1</h3><br>
		- 4 upgrades that work.<br>
		- If you use "best: true," you can spend an hour trying to figure out why in the world it doesn't work on reset.<br>
		- Boring Achievements.<br>
		- A secret achievement for people bad at math.<br>
		- Cost scaling on upgrades.<br>
		- Static layer progression.<br>
		- Fight me. I know both of these are not always good.<br>
		- I did this on purpose to make the choice of upgrade order matter.<br>
		- I probably failed at that though... Maybe don't fight me.<br>
		- Now to break some more things.<br>
	<br><h3>v0.0</h3><br>
		- Added things.<br>
		- Broke things.<br>
		- Tried to make one layer work.<br>
		- I don't know any coding so this is just a logic puzzle.<br>
		- Do you know how long it took to find out how to raise gain to a power?<br>
		- It was too long. Way too long. I google'd it, I tried everything I could think of.<br>
		- Then, then after a week, I had the bright idea to look at someone else's mod.<br>
		- Why didn't I do that earlier? Cause I'm stupid.<br>
		- This logic puzzle is going to be hard.<br><br><br><br>`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints() {
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints() {
	return false
}

// To be used to get the base points/sec
function getPointBase() {
	let base = new Decimal(0.5)
	if (hasUpgrade("c",31)) base = base.add(0.5)
	return base
}

// To be used to get the multiplier of base points/sec
function getPointMult() {
	let mult = new Decimal(1)
	mult = mult.mul(tmp.a.effect)
	if (hasUpgrade("c",11)) mult = mult.add(1)
	if (hasUpgrade("c",13)) mult = mult.mul(upgradeEffect("c",13))
	return mult
}

// To be used to get the exponent of base points/sec
function getPointExp() {
	let exp = new Decimal(1)
	if (hasUpgrade("c",12)) exp = exp.add(0.5)
	if (hasUpgrade("c",22)) exp = exp.add(0.75)
	if (hasUpgrade("c",32)) exp = exp.add(1)
	return exp
}

// Calculate points/sec! I made this (base*mult)^exp for my sanity. No other good reason to mess with it.
function getPointGen() {
	let gain = getPointBase()
	gain = gain.mul(getPointMult())
	gain = gain.pow(getPointExp())
	return gain
}

// Determines the percent of total player.points lost per second. Doesn't work very well with higher numbers, never seems to cap.
function getDegen() {
	let degen = new Decimal(0.20)
	if (hasUpgrade("c",21)) degen = degen.div(2)
	return degen
}

// Actually does the subtracting.
function update(diff) {
	player.points = player.points.minus(player.points.mul(getDegen()).mul(diff))
}

// Determines the population you can recruit. I intend to add the ability to find planets. Good luck to me!
function populationLimit() {
	let pop = new Decimal(7.942e9)
	return pop
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	function() {
		let dis = getPointGen()
		dis = dis.minus(player.points.mul(getDegen()))
		dis = "("+format(dis)+") Net F/s<br>You lose " + getDegen().mul(100) + "% of your total Faith per second<br>Endgame: first M upgrade"
		return "(" + format(getPointGen()) + ")" + " Gross F/s<br>"+dis
	}
]

// Determines when the game "ends"
function isEndgame() {
	return hasUpgrade('m',11)
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

