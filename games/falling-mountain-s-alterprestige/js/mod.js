let modInfo = {
	name: "Falling Mountain's AlterPrestige",
	id: "alterPrestige",
	author: "Falling Mountain, original Prestige by Makiki99",
	pointsName: "points",
	modFiles: ["nano.js", "tree.js", "micro.js", "mini.js", "small.js", "partial.js", "achievements.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.4.0c Beta",
	name: "Fleshed Out",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>Ping @Falling Mountain#4706 on discord to report bugs!</h3><br><br>
	<h3>v0.4.0c</h3><br>
		- Loading into this update while having progress past 1 Partialprestige resets you to the beginning of Partialprestige, with only achievements and unlockers intact.<br>
		- Fixed bug where upgrade availability notifications would not show unless on the same page as the upgrade <br>
		- Microblock has a changed debuff & requirement <br>
		- Fixed bug stopping purchase of Nanogains when Nanobuff was at cap <br>
		- Changed the second Microprestige milestone <br>
		- Microfinale now costs Infinity <br>
		- Upgrades gained from expansions will cost Infinity until the respective expansion is bought.<br>
		- Changed effect of Microeconomics to increasing Microprestige power. <br>
		- Removed three Miniprestige achievements. <br>
	<br><h3>v0.4.0b</h3><br>
		- Fixed bug where Microprestige buyables would make you pay twice the cost <br><br>
	<h3>v0.4.0a</h3><br>
		- Fixed save migration issues. <br><br>
	<h2>v0.4.0</h2><br>
		<h3>Active Enlargement</h3><br>
		- 5 new Nanoprestige upgrades<br>
		- 5 new Microprestige upgrades<br>
		- <strike>5</strike> 4 new Miniprestige upgrades<br>
		- 5 new Smallprestige upgrades<br>
		- 5 new Cascading Micro upgrades<br>
		- Additional buyables and milestones <br>
		- Enlargement upgrade tree, with more to come! <br>
		- Added row 2 Cascade autobuyer<br>
		- Clickable added to give some extra progress for those who want to be more active during parts of CASCADE.<br>
		- You can now switch between "pages" of 5x5 upgrades. In the next update, this will have more gameplay effects. <br>
		- New Smallprestige minigame, Small Force!<br>
		- Player agency! More of that will happen in future updates as well.<br>
		- Filled out the normal Achievement page <br>
		- Added two new Partial achievements, for buying Enlargement upgrades <br>
		- Added a third new Partial achievement for point gain <br>
		- Added six new Unlockers <br>
		- Fixed bug where Nanomuscle would remain active in Nano challenge 12<br>
		- Fixed bug where [S] Cascade would show as unlocked after Partialprestiging for the first time <br>
		- The ability to buy max Nanoprestiges has been moved to Nano upgrade 13 rather than 23. <br>
		- There are some upgrades that are unpurchasable at the moment (Micro 55 and EXPANSION) - these have no programmed effect yet.<br>
		- probably a bunch of other stuff I forgot <br><br>
	<h3>v0.3.4</h3><br>
		Introduction to the Cascade<br>
		- Added 2 new layers, Cascade & Enlargement <br>
		- Inspired by merging things <br>
		- Warning: more idle than normal! <br>
		- Added 5 more Microprestige upgrades <br>
		- Added 2 more Miniprestige upgrade and 1 Miniprestige buyable <br>
		- Oh yeah you can also Partialprestige now <br>
		- 2 new achievements on the Partialprestige layer <br>
		- Endgame moved to 10 Smallprestiges <br>
		- Boost Constant changed to Break Constant<br>
		- Broken Nano and its sublayers are now colored differently. <br>
		- The tree is now mostly blue. Have fun! <br><br>
	<h3>v0.3.3</h3><br>
		Great Rebalance, part 3<br>
		- Added a new layer, Communals<br>
		- Extended endgame to 5 Smallprestiges<br>
		- New upgrades in most layers<br>
		- Fixed bug causing Microprestige upgrades and Miniprestige upgrades to hide when you have 0 Miniprestiges<br>
		- Fixed bug hiding Buyable and Challenge menus when you didn't have specific upgrades<br>
		- When starting a new game, all nodes except Nano and Mini are locked<br>
		- Added achievement images (woohoo)<br>
		- other stuff probably<br><br>
	<h3>v0.3.2a</h3><br>
		- Clickables are now still hidden, you'll unlock them later<br>
		- Buyables now display costs at Infinity when you reach the cap (5000)<br>
		- Buyable cap decreased 5001 -> 5000<br>
		- Miniprestige achievement "Put in the effort" now actually gives the point bonus<br>
		- Fixed description for Microprestige upgrade 44<br><br>
	<h3>v0.3.2</h3><br>
		Great Rebalance, part 2 (Small prestige #1)<br>
		- Even more upgrades have changed<br>
		- Rebalanced challenges, now all of them have better requirements and rewards<br>
		- Broken Nanoprestige has also changed, and is now a buyable-based system<br>
		- Achievements have changed as well.<br>
		- Endgame at 16 Miniprestiges<br><br>
	<h3>v0.3.1</h3><br>
		Great Rebalance, part 1<br>
		- Upgrades have changed:<br>
		- Most have reduced costs, and changed effects.<br>
		- Buyables now have much different cost scalings.<br>
		- 2nd (Nano) buyable now increases in power every time you gain an upgrade.<br>
		- 3rd buyable buffed.<br>
		- 4th buyable increases the power of the 3rd buyable.<br>
		- Challenges can now be completed multiple times for extra rewards.<br>
		- 5th buyable increases the power of the 1st buyable.<br><br>
	<h3>v0.3b</h3><br>
		- Fixed upgrade problems from last hotfix.<br><br>
	<h3>v0.3a</h3><br>
		- Colors of Microprestige and Smallprestige changed to remove confusion with unpurchasable things<br>
		- Broken Microprestige starts with subtab of "preparation" open.<br>
		- Next update will deal with other complaints<br><br>
	<h2>v0.3</h2><br>
		- New Partial Prestige and Broken Microprestige layers.<br>
		- Current endgame at 1 Partial Prestige.<br>
		- New achievements<br>
		- New upgrades<br>
		- Fixed a bug where the bar showing progress to Broken Nanoprestige could only reach 99%<br>
		- Inflation... sorta?<br><br>
	<h3>v0.2.1 (Indev)</h3><br>
		- New layer added, Broken Nanoprestige.<br>
		- Current endgame at 2 Small Prestiges.<br>
		- 5 Small achievements<br>
		- 5 new Nano upgrades<br>
		- 2 new Nano buyables<br>
		- 7 new Micro upgrades<br>
		- 3 new Mini upgrades<br>
		- You can get a ton more Nanoprestiges now.<br><br>
	<h3>v0.2 (Indev)</h3><br>
		- Added new prestige layer, Small Prestiges.<br>
		- Current endgame at 1 Small Prestige.<br>
		- 4 normal achievements<br>
		- 16 Mini achievements<br>
		- 5 new Nano upgrades<br>
		- 1 new Nano buyable<br>
		- 3 new Micro upgrades<br>
		- 1 new Mini upgrade<br><br>
	<h3>v0.1 (Indev)</h3><br>
		- Added first 3 prestige layers.<br>
		- Current endgame at 3 Miniprestiges.`

let winText = `You've done enough prestiging for now. Why not take a break?`

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
	if(!canGenPoints()) return new Decimal(0)

	let gain = new Decimal(1)
	gain = gain.times(tmp.Nanoprestige.effect)
	if (hasUpgrade("Nanoprestige", 11)) gain = gain.times(7)
	if (hasUpgrade("Nanoprestige", 12)) gain = gain.times(7)
	if (hasUpgrade("Nanoprestige", 21)) gain = gain.times(7)
	if (hasUpgrade("Nanoprestige", 22)) gain = gain.times(7)
	if (hasUpgrade("Nanoprestige", 13)  && !inChallenge("Nanoprestige", 12)) gain = gain.times(buyableEffect("Nanoprestige", 11))
	if (hasUpgrade("Nanoprestige", 33)  && !inChallenge("Nanoprestige", 12)) gain = gain.times(buyableEffect("Nanoprestige", 12))
	if (hasUpgrade("Nanoprestige", 31)) gain = gain.times(7)
	if (hasUpgrade("Nanoprestige", 32)) gain = gain.times(7)
	if (hasUpgrade("Nanoprestige", 24)) gain = gain.times(7)
	if (hasUpgrade("Nanoprestige", 45)) gain = gain.times(7)
	gain = gain.times(tmp.Microprestige.effect)
	if (hasUpgrade("Microprestige", 11)) gain = gain.times(7)
	if (hasUpgrade("Microprestige", 22)) gain = gain.times(upgradeEffect("Microprestige", 22))
	if (hasUpgrade("Microprestige", 23)) gain = gain.times(upgradeEffect("Microprestige", 23))
	if (hasUpgrade("Microprestige", 31)) gain = gain.times(7)
	if (hasUpgrade("Microprestige", 32)) gain = gain.times(2401)
	if (hasUpgrade("Microprestige", 33)) gain = gain.times(upgradeEffect("Microprestige", 33))
	if (hasUpgrade("Microprestige", 14)) gain = gain.times(buyableEffect("Microprestige", 11))
	gain = gain.times(tmp.Miniprestige.effect)
	if (hasAchievement("Miniprestige", 31)) gain = gain.times(49)
	if (hasAchievement("Smallprestige", 11)) gain = gain.times(Decimal.pow("1e25", player.Smallprestige.points.plus(1)))
	gain = gain.times(tmp.Partialprestige.effect)
	if (hasChallenge("Nanoprestige", 11)) gain = gain.pow(1.1)
	if (hasUpgrade("Nanoprestige", 75)) gain = gain.pow(1.15)
	if (hasAchievement("Unlockers", 54)) {
		gain = gain.log10()
		gain = gain.pow(buyableEffect("Nanoprestige", 33))
		gain = Decimal.pow(10, gain)
	}
	if (inChallenge("Nanoprestige", 11)) gain = gain.pow(0.1)
if (hasUpgrade("Nanoprestige", 94)) gain = gain.pow(upgradeEffect("Nanoprestige", 94))
	if (inChallenge("Microprestige", 11)) gain = gain.pow(0.05)
	if (player.points.log10().gte(gain.log10().pow(1.5)) && player.Partialprestige.points.gte(1)) player.points = gain
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	"Current endgame at 25 Smallprestiges!", "If things feel slow, check your challenges!"
]

// Determines when the game "ends"
function isEndgame() {
	return player.Smallprestige.points.gte(new Decimal(25))
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
	if (oldVersion == "0.3.4 Beta" || oldVersion == "0.4.0 Beta" || oldVersion == "0.4.0a Beta" || oldVersion == "0.4.0b Beta") {
		if (player.Partialprestige.points.gte(1)) {
			player.points = new Decimal(0)
			player.Nanoprestige.points = new Decimal(0)
			player.Nanoprestige.upgrades = []
			player.Nanoprestige.milestones = []
			player.Nanoprestige.challenges[11] = 0
			player.Nanoprestige.challenges[12] = 0
			player.Nanoprestige.challenges[21] = 0
			player.Nanoprestige.challenges[22] = 0
			player.Nanoprestige.buyables[11] = new Decimal(0)
			player.Nanoprestige.buyables[12] = new Decimal(0)
			player.Nanoprestige.buyables[13] = new Decimal(0)
			player.Nanoprestige.buyables[21] = new Decimal(0)
			player.Nanoprestige.buyables[22] = new Decimal(0)
			player.Nanoprestige.buyables[23] = new Decimal(0)
			player.Nanoprestige.buyables[31] = new Decimal(0)
			player.Nanoprestige.buyables[32] = new Decimal(0)
			player.Nanoprestige.buyables[33] = new Decimal(0)
			player.BrokenNano.points = new Decimal(0)
			player.BrokenNano.milestones = []
			player.BrokenNano.upgrades = []
			player.BrokenNano.buyables[11] = new Decimal(0)
			player.BrokenNano.buyables[12] = new Decimal(0)
			player.BrokenNano.buyables[13] = new Decimal(0)
			player.BrokenNano.buyables[21] = new Decimal(0)
			player.BrokenNano.buyables[22] = new Decimal(0)
			player.BrokenNano.buyables[23] = new Decimal(0)
			player.BrokenNano.buyables[31] = new Decimal(0)
			player.BNCapital.points = new Decimal(0)
			player.BNCapital.milestones = []
			player.BNCommunal.points = new Decimal(0)
			player.BNCommunal.milestones = []
			player.Microprestige.points = new Decimal(0)
			player.Microprestige.upgrades = []
			player.Microprestige.milestones = []
			player.Microprestige.challenges[11] = 0
			player.Microprestige.buyables[11] = new Decimal(0)
			player.Microprestige.buyables[12] = new Decimal(0)
			player.Microprestige.buyables[13] = new Decimal(0)
			player.Microprestige.buyables[21] = new Decimal(0)
			player.BrokenMicro.points = new Decimal(0)
			player.BrokenMicro.buyables[11] = new Decimal(0)
			player.BrokenMicro.buyables[21] = new Decimal(0)
			player.BrokenMicro.buyables[22] = new Decimal(0)
			player.BrokenMicro.unlocked = false
			player.CMEnlarge.points = new Decimal(0)
			player.CMEnlarge.upgrades = []
			player.CMEnlarge.upgradeOrder = []
			player.CMEnlarge.milestones = []
			player.Miniprestige.points = new Decimal(0)
			player.Miniprestige.upgrades = []
			player.Miniprestige.buyables[11] = new Decimal(0)
			player.Smallprestige.points = new Decimal(0)
			player.Smallprestige.upgrades = []
			player.Smallprestige.milestones = []
			player.Smallprestige.buyables[11] = new Decimal(0)
			player.Smallprestige.buyables[12] = new Decimal(0)
			player.Smallprestige.buyables[13] = new Decimal(0)
			player.Smallprestige.smallForce = new Decimal(0)


		}
	}
}