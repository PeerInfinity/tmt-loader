let modInfo = {
	name: "Collection of Everything",
	id: "XR2003",
	author: "XtremeRusher",
	pointsName: "Knowledge",
	modFiles: ["layers.js", "tree.js", "achieve.js", "layers01.js", "layers02.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 0,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.3",
	name: "Industrial Revolution Update, Part 1",
}

let changelog = `<h4>Changelog:</h4><br>
	<h1>0.3 Beta 1 - Industrial Revolution Update, Part 1</h1><br><br>
	<h3>[Endgame at 1 Copper]</h3><br><br>
	- Stone Layer has been finished, now it contains:<br>
	Lootb... "Mining" Gimmick<br>
	3 Milestones<br>
	4 Challenges<br><br>
	- 5 new Achievements<br><br>
	- Added 2 new Layers:<br>
	Copper, which can give achievement, but it's mostly empty<br>
	"Switch of Scientific Trees", for changing trees<br>
	(there's 3rd layer called "Automatic Production Factory", but it will be locked, until next update)<br><br>
	- New Upgrades and Milestones in Lab, Bamboo and Wood Layers<br><br>
	- Mushrooms gain will be now Softcapped after 1e7 Mushroom Points<br><br><br><br>
	<h2>0.2.1 - Survivalist Guide on Mini-Updates, Vol.1</h2><br><br>
	<h3>[Endgame at 1e15 Knowledge]</h3><br><br>
	- Fixed some minor bugs, including:<br>
	Potato clickable in Storage not disappearing at 0 Potatos<br>
	Tools not consuming Wood<br>
	Changed tooltip of "Fishing Rod"<br><br>
	- Now Layers can glow on different colors!<br><br>
	- Prices of some upgrades (mainly involving Wood) has been decreased<br><br>
	- That Placeholder Layer (Stone) now resets nothing (Temporarily)<br><br><br><br>
	<h1>0.2 - Survival Update</h1><br><br>
	<h3>[Endgame at 5 Pickaxe Power]</h3><br><br>
	- Added 3 New Functional Layers:<br>
	Wood<br>
	Crops<br>
	Meat<br>
	...And placeholder Layer: Stone<br><br>
	- 4 New Tabs for Laboratory:<br>
	Workbench, for making and upgrading tools<br>
	Storage, to store ingridients and Cuisines<br>
	Kitchen, to make said Cuisines<br>
	and Dining Room, to eat mentioned Cuisines for Knowledge Gain<br><br>
	- Added 5 new Achievements, including 1 Challenge Achievement<br><br>
	- Changed Harvest Points into Harvest Gauge<br><br>
	- Harvest Gauge now can overfill, after 900 Harvest Gauge will rot<br><br>
	- Added 6 new Upgrades to Laboratory<br><br>
	- Added new Mini-Mushroom type: Honey Mushroom, which boosts Wood Gain<br><br>
	- and most Importantly, Added Food System, for boosting Knowledge Gain!<br>
	(no one asked, but it taked around 2 days)<br><br>
	- Fixed Critical bug of 2nd Bamboo Milestone<br><br><br><br>
	<h2>0.1.1 - Bugfix Mini-Update</h2><br><br>
	- Some minor changes in code<br><br>
	- Mini-Mushrooms are now displaying amount per sec (x/sec)<br><br>
	- Changed price of "Paper" Upgrade, it now costs 10k Bamboo and effect of this upgrade is now visible<br><br>
	- 4th Bamboo milestone requirement has been nerfed (5000 => 4000)<br><br>
	- Now "Rotting" of the Bamboo Harvest slightly decreases gain until 0 (It used to decrease instantly to 0)<br><br><br><br>
	<h1>0.1 - First Update</h1><br><br>
	<h3>[Endgame at 10.000 Mushrooms]</h3><br><br>
	Added 3 layers:<br>
	- Laboratory<br>
	- Bamboo<br>
	- Mushrooms<br><br>
	Bamboo unique mechanic has been Added "Harvest"<br><br>
	Mini-Mushrooms has been Added in 2 types:<br>
	- Bay Bolete<br>
	- Chanterelle<br>`

let winText = `Congratulations! You beat the game!`
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
		let gain = new Decimal(0)
		if (hasUpgrade('s', 11)) {
			gain = new Decimal(1)
			if (hasUpgrade('s', 12)) gain = gain.times(2)
			if (hasUpgrade('bam', 11)) gain = gain.times(4)
			if (!hasUpgrade('s',31)&hasUpgrade('s',14)) gain = gain.times(10)
			if (hasUpgrade('s',31)) gain = gain.times(100)
			if (hasUpgrade('w',14)) gain = gain.times(4)
			gain = gain.times(tmp.bam.effect)
			if (hasUpgrade('s', 13)) gain = gain.add(upgradeEffect('s', 13))
			if (hasUpgrade('bam',13))gain = gain.times(player.bam.pHarvest.min(900).sqrt().div(4))
			gain = gain.add(player.mush.mushA)
			gain = gain.times(tmp.w.effect)
			gain = gain.times(tmp.s.effect)
			if(player.st.stShard>0)gain = gain.times(tmp.st.effect.st1)
			if (inChallenge('st',22))gain = gain.pow(0.75)
			if(hasAchievement('a', 15)&&!hasAchievement('a',24)) gain = gain.times(1.1)
			if(hasAchievement('a', 24)) gain = gain.times(4)
			if(hasAchievement('a', 33)) gain = gain.pow(1.05)
		}
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [ 
	function(){return "Endgame at 1 Copper"},
	function(){if (inChallenge('st', 11)) return "After exiting Challenge you will gain <h3>"+format(player.points.log(10).sub(8).sub(player.st.chall1Mult).max(0).floor())+"</h3> Challenge Points"
		if (inChallenge('st', 12)) return "After exiting Challenge you will gain <h3>"+format(player.points.log(10).sub(5).sub(player.st.chall2Mult).max(0).floor())+"</h3> Challenge Points"
		if (inChallenge('st', 21)) return "After exiting Challenge you will gain <h3>"+format(player.points.log(10).sub(14).sub(player.st.chall3Mult).max(0).floor())+"</h3> Challenge Points"
	},
]

// Determines when the game "ends"
function isEndgame() {
	return player.met11.points.gte(new Decimal("1"))
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