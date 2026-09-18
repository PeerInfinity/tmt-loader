let modInfo = {
	name: "Weakling Tree",
	author: "HankG",
	pointsName: "Mentality",
	modFiles: ["layers/crystals.js","layers/weakling.js",
		"layers/angelic.js","layers/demonic.js",
		"layers/achievements.js","layers/devTool.js",
		"tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 3,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.8.10",
	name: "No More Jokes",
}

let changelog = `<h1>Changelog:</h1><br><br>
	<h3>v0.8.10 - 2026/4/5</h3><br>
		<b>No More Jokes</b><br>
		Removed April Fools layer taLiTY<br>
		Fixed some typos on the upgrades of the final Angelic Challenge<br>
		Balanced some parts of the final Angelic Challenge to make it less timewally<br><br>
		<div style='color:rgb(44, 186, 241)'>Current Endgame: Reach 1e130 VC and EC and have both VC<sup>4</sup> and EC<sup>4</sup>!</div><br>
	<h3>v0.8.9APRILFOOLS - 2026/4/1</h3><br>
		This one is without explanation...<br>
		Corrected some of the challenge effects from <b>Ascension to Heaven</b><br>
		(v0.8.9.1) Change the minigame layer to the side so it doesn't get reset by row 2<br>
		(v0.8.9.2) Nerfed the final goal for beating April Fools layer (5e243 → 5e240)<br>
		(v0.8.9.3) Made the taLiTY consistent throughout the infobox<br>
		(v0.8.9.4) Fixed the wrong challenge condition for Demonic Challenge <b>Escape from Hell</b><br>
		(v0.8.9.5) Same with v0.8.9.4 but it actually fixed it when completing<br><b>Ascension to Heaven</b> first<br>
		(v0.8.9.5) Changed the changelog so that it contains the change of smaller updates<br><br>
		<div style='color:rgb(44, 186, 241)'>Current Endgame: Have all 120 <b>taLiTY Strengthen</b> purchases, good luck!</div><br>
	<h3>v0.8.8 - 2026/3/31</h3><br>
		<b>The Super Challenges</b><br>
		Finally, the final Angelic & Demonic challenge are completed!<br>
		They are categorized as Super Challenges since they would<br>take a lot more time to finish than a regular challenge!<br>
		<i style='color:gray'>(though I had to cut most of the contents down, as if I don't do so otherwise,<br>you'll be facing them with each lasting over half a day lmao)</i><br>
		Added 3 achievements<br>
		Most of the buttons won't zoom in when you double tap on mobile<br>
		Fixed a progression spike caused by the Weakling Dust and Unstable Dust<br>
		<i style='color:gray'>(there's also a message indicating that<br>right below the Mentality gain display!)</i><br>
		(v0.8.8.1) Fixed the visual bug where 1e500 Unstable Dust milestone will show up<br><i style='color:gray'>(it is supposed to be working on background!)</i><br>
		(v0.8.8.2) Now the double tap zoom is also disabled for the<br>ENTIRE Milestone tab under Crystals layer :)<br>
		<i style='color:gray'>(I was gonna do it just on the prestige button<br>but that is fairly complicated to change sooo...)</i><br><br>
		<div style='color:rgb(44, 186, 241)'>Current Endgame: Reach 1e130 VC and EC and have both VC<sup>4</sup> and EC<sup>4</sup>!</div><br>
	<h3>v0.8.7 - 2026/3/21</h3><br>
		<b>layers.js Separation</b><br>
		Added one more achievement<br>
		Separated layers.js and make it into 6 smaller layer files<br>
		Increased the offline time to 3 hours (from 1 hour)<br>
		(v0.8.7.1) Changed the version info, to make it aligned with the changelog<br>
		(v0.8.7.2) fixed the total achievements count being incorrect<br>
		(v0.8.7.3) Hid a tab that's not supposed to appear outside of the challenge<br>
		<i style='color:gray'>The final Angelic and Demonic challenges are still WIP,<br>it is taking much longer than I thought...</i><br><br>
		<div style='color:rgb(44, 186, 241)'>Current Endgame: Reach 1e432 Unstable Dust!</div><br>
	<h3>v0.8.6 - 2026/3/14</h3><br>
		<b style='color:yellow'>✦ Achievements ✦</b><br>
		Decreased the price for Crystal Upgrade <b>Distillation</b><br>
		Added 3rd Angelic Challenge and Demonic Challenge<br>
		More Purified Crystal tier and more fun!<br>
		(v0.8.6.1) Fixed the Achievement <b>Mass Produce</b> in which it refers to the wrong upgrade<br>
		(v0.8.6.2) Checked every single one of the achievements and ensured that they have the right unlock condition<br>
		(v0.8.6.3) Fixed Demonic Challenge <b>Chains & Constraints</b> being unlocked incorrectly<br>
		<div style='color:yellow'>✦ Added the brand new achievement system ✦</div><br>
		<div style='color:rgb(44, 186, 241)'>Current endgame: Have the final achievement <b>Eruption</b>!</div><br>
	<h3>v0.8.5 - 2026/3/11</h3><br>
		<b>Crystals Purification</b><br>
		Implemented the Purification Tab (it's fancy and <i>AD-like</i>)<br>
		Fixed the issue with unexpected progression spike<br>
		(v0.8.5.2) the cost text on Mentality Strengthen is fixed<br>
		(v0.8.5.3) Decrease the price for upgrade <b>Distillation</b><br><br>
		<div style='color:rgb(44, 186, 241)'>Current Endgame: Reach 1e240 Unstable Dust!</div><br>
	<h3>v0.8.2 - 2026/3/7</h3><br>
		<b>Challenges Era</b><br>
		Added Angelic & Demonic layer as well as their own unique challenges!<br>
		Swapped the order of some Crystal Shards milestones (smoother gameplay experience!)<br><br>
	<h3>v0.8.1 - 2026/3/6</h3><br>
		<b>A Small Hotfix</b><br>
		Fixed the state of button on Crystal Shards<br>
		Fixed the requirement for row 3 weakling upgrades<br><br>
	<h3>v0.8 - 2026/3/5</h3><br>
		<b style='color: rgb(209, 31, 31)'>A Completed Crystal</b><br>
		Finished the making of Crystal layer! (I am very proud)<br>
		Enjoy the process of being a slow bum and then soaring at the very end!<br><br>
	<h3>v0.7.6 - 2026/3/4</h3><br>
		<b>The Crystal Upgrades!</b><br>
		3/8 VC, 3/8 EC, and 2/10 Crystal Shards Upgrades had implemented!<br>
		added the UI in Crystal Upgrades (it has the similar structure to Crystals tab)<br><br>
	<h3>v0.7.5 - 2026/2/28</h3><br>
		<b>The Crystal Update Continuation</b><br>
		Implemented some of the features on both Virtuous and Evil Crystals!<br>
		(up to 50 Crystals of both type because why not)<br><br>
		Some bug fixes along the way<br>
		(finally got the automation on live!)<br><br>
	<h3>v0.7.1 - 2026/2/26</h3><br>
		<b style='color: rgb(44, 186, 241)'>Colorful Update</b><br>
		Implemented the UI for Crystals tab,<br>
		more updates coming soon...<br>
		Changed the version name from "0.07" to "0.7" to include sub versions<br><br>
	<h3>v0.07 - 2026/2/24</h3><br>
		Finished the implementation of automation on Weakling buyables <i>(this took me quite a while)</i><br>
		Adding Crystal Shards milestones until next stage (Crystal merging)<br><br>
	<h3>v0.06 - 2026/2/19</h3><br>
		Re-added Unstable Dust and Crystal Milestones<br>
		Added a secret option ;)<br><br>
	<h3>v0.05 - 2026/1/26</h3><br>
		Fixed the Weakling Dust generation when having less than 1 Point (no more decay mess horray)<br>
		A Crystal Rework is coming soon...<br><br>
	<h3>v0.03 - 2025/10/15</h3><br>
		Adds a "decay" function which allows you to progress the game faster<br>
		<i>(this took a while)</i><br>
		Adds "Crystals" and "Unstable Dust"<br><br>
	<h3>v0.02 - 2025/10/14</h3><br>
		Adds more upgrades on Weakling layer<br>
		Adds a new layer: "Crystals" <i>(not implemented yet)</i><br>
		Enables dev speed :)<br><br>
	<h3>v0.01 - 2025/10/13</h3><br>
		add the layer "Weaklings"<br>
		where it produces weakling points...<br><br>`

let winText = `Congratulations! You have endured the mental challenge the game had thrown at you and become the immortal!<br>(or perhaps you're a masochist?)`

// Display extra things at the top of the page
var displayThings = [
	function() {
		//return "Current endgame: Have the final achievement!"
		if(hasMilestone("c",27)&&player.w.slowGain) return "Recovering Weakling Dust slowly...<br><div style='color:gray'>(This is to prevent progression spike)</div)"
		if(inChallenge("a",22)) {
			let aeText = "<br>You have "+colorText("h3",tmp.a.color,formatWhole(player.ae))+" Angelic Essence. (+"+format(aeGain())+"/s)"
			let deText = "<br>You have "+colorText("h3",tmp.dm.color,formatWhole(player.de))+" Demonic Essence, which are dividing the gain<br>"+
			"of Angelic Essence by "+colorText("h3",tmp.dm.color,format(deDivAE()))+". (+"+format(deGain())+"/s)"
			return aeText+deText
		}
		if(inChallenge("dm",22)) {
			let deText = "You have "+colorText("h3",tmp.dm.color,formatWhole(player.de))+" Demonic Essence. (+"+format(deGain())+"/s)"
			let aeText = "<br>You have "+colorText("h3",tmp.a.color,formatWhole(player.ae))+" Angelic Essence, which are dividing the gain<br>"+
			"of Demonic Essence by "+colorText("h3",tmp.a.color,format(aeDivDE()))+". (+"+format(aeGain())+"/s)"
			if(hasMilestone("c",52)) aeText = "<br>You have "+colorText("h3",tmp.a.color,formatWhole(player.ae))+" Angelic Essence, which are dividing the gain<br>"+
			"of Demonic Essence by "+colorText("h3",tmp.a.color,format(aeDivDE()))+" and Weakling Dust gain<br>by "+colorText("h3",tmp.a.color,format(aeDivWD()))+
			". (+"+format(aeGain())+"/s)"
			return "<b style='color:red'>The Mentality gain is disabled in this challenge!</b><br><br>"+deText+aeText
		}
	}
]

// Determines when the game "ends"
function isEndgame() {
	//return player.points.gte(new Decimal("ee280000000"))
	return (hasAchievement("ach",95))
}


// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return !inChallenge("dm",22)
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let initialGain = new Decimal(0.05)
	if(inChallenge("dm",11)) initialGain = new Decimal(1)
	let gain = initialGain
	gain = gain.mul(buyableEffect("w",11))
	if(player.w.unlocked&&!inChallenge("a",21)&&!inChallenge("a",22)) gain = gain.div(tmp.w.effect)
	if(hasMilestone("c",22) & player.c.ud.gte(1e6)) gain = gain.div(tmp.c.udEffect2)
	if(hasUpgrade("w",14)) gain = gain.mul(5)
	if(hasUpgrade("w",15)) gain = gain.mul(upgradeEffect("w",15))
	if(hasUpgrade("w",23)) gain = gain.mul(upgradeEffect("w",23))
	if(hasMilestone("c",1)) gain = gain.mul(4)
	if(hasMilestone("c",3)) gain = gain.mul(3)
	if(hasMilestone("c",4)) gain = gain.mul(tmp.c.crystalsToMentality)
	if(hasMilestone("c",6)) gain = gain.mul(tmp.c.wmConvert)
	if(hasMilestone("c",43)) gain = gain.mul(tmp.c.vcToMentality)
	if(hasChallenge("a",11)) gain = gain.pow(challengeEffect("a",11))
	if((hasMilestone("a",1)&&(inChallenge("a",11)||inChallenge("a",12)||inChallenge("a",21)||inChallenge("a",22)))||(hasMilestone("a",3)&&!inAnyChallenge())) gain = gain.mul(1e10)
	if(inChallenge("a",21)||inChallenge("a",22)) gain = gain.mul(tmp.a.vppEffect.add(1)).mul(tmp.dm.eppEffect.add(1)).mul(tmp.w.effect)
	if((inChallenge("a",21)||inChallenge("a",22))&&player.a.inChTime < 0.5) gain = new Decimal(0)
	
	// AC4 exclusive
	if(inChallenge("a",22)) {
		if(hasUpgrade("w",43)) gain = gain.mul(upg43WEffect()[0])
		if(hasMilestone("off",2)) gain = gain.mul(tmp.off.offAEToMentality)
	}
	gain = (player.points.gte(1)?gain:Decimal.max(gain,initialGain))
	if(hasMilestone("c",27)&&player.w.slowGain||player.a.outChTime < 0.5&&!inAnyChallenge()) gain = gain.min("1e100") // fix the progression spike caused by UD when exiting challenges
	return gain
}

// Custom function that will be used here
function totalCostFormula(base, constant, x, factor, offset) { // the original formula for clarity
    return base.mul(factor).mul(factor.pow(x.sub(offset)).sub(1)).div(factor.sub(1)).add(constant)
}

function totalCostFormulaLARGE(base, x, factor, offset, accel) { // this is used for the larger scaling
	let totalFactor = new Decimal(1)
	for (let i = 0; i < x.sub(offset); i++) {
		factor = factor.mul(accel)
		totalFactor = totalFactor.mul(factor)
	}
	return base.mul(totalFactor)
}

function totalCost(buyableStatus) { // function that puts the variables into a single object
	let base = buyableStatus.base
	let constant = buyableStatus.constant
	let x = buyableStatus.buyCount
	let factor = buyableStatus.factor
	let offset = buyableStatus.offset
	let accel = buyableStatus.accel
	let sumCost = totalCostFormula(base, constant, x, factor, offset)
	if(buyableStatus.large) sumCost = totalCostFormulaLARGE(base, x, factor, offset, accel)
	return sumCost
}

function totalBuysFormula(points, base, constant, factor, offset) { // the original formula for clarity
    let finalBuys = Decimal.log10((points.sub(constant)).mul(factor.sub(1)).div(base).div(factor).add(1)).div(Decimal.log10(factor)).add(offset)
	if (finalBuys.lt(0)) return finalBuys.ceil()
	return finalBuys.floor()
}

function totalBuysFormulaLARGE(points, base, factor, offset, accel) { // this is used for the larger scaling
    let finalBuys = offset
	let totalFactor = new Decimal(1)
	while(points.div(base).div(totalFactor).gte(1)) {
		factor = factor.mul(accel)
		totalFactor = totalFactor.mul(factor)
		finalBuys = finalBuys.add(1)
	}
	return finalBuys.sub(1)
}

function totalBuys(buyableStatus) { // function that puts the variables into a single object
	let points = buyableStatus.points.add(buyableStatus.boughtCost)
	let base = buyableStatus.base
	let constant = buyableStatus.constant
	let factor = buyableStatus.factor
	let offset = buyableStatus.offset
	let accel = buyableStatus.accel
    if(buyableStatus.large) buyableStatus.buyCount = totalBuysFormulaLARGE(points, base, factor, offset, accel)
    else buyableStatus.buyCount = totalBuysFormula(points, base, constant, factor, offset)
	return
}

function totalBuysWithScaling(buyableStatus) { // 3rd layer of function that accounts for scaling, returns object for updating
	let injectedBuyCount = buyableStatus.buyCount
	if (!buyableStatus.injected) totalBuys(buyableStatus) 
	for (let scaleIndex = new Decimal(0); scaleIndex.lt(buyableStatus.scaleStart.length); scaleIndex = scaleIndex.add(1)) {
		if (buyableStatus.buyCount.gte(buyableStatus.scaleStart[scaleIndex])) {
			buyableStatus.buyCount = buyableStatus.scaleStart[scaleIndex].sub(1)
			buyableStatus.constant = totalCost(buyableStatus)
			buyableStatus.base = buyableStatus.base.mul(buyableStatus.factor.pow(buyableStatus.scaleStart[scaleIndex].sub(scaleIndex.lt(1)?1:buyableStatus.scaleStart[scaleIndex.sub(1)])))
			buyableStatus.factor = buyableStatus.scaledFactor[scaleIndex]
			buyableStatus.offset = buyableStatus.scaleStart[scaleIndex].sub(1)
			buyableStatus.large = buyableStatus.largeScale[scaleIndex]
			if(!buyableStatus.injected) totalBuys(buyableStatus)
			else buyableStatus.buyCount = injectedBuyCount
		}
    }
	return buyableStatus
}

function aeGain() {
	let gain = new Decimal(1)
	if(inChallenge("a",22)) {
		let mtlPow = 1.6, wdPow = 2.4, udPow = 2.5
		if(hasUpgrade("w",53)) wdPow = 2.6
		if(hasUpgrade("w",54)) mtlPow = 1.75
		gain = player.points.max(1).log10().pow(mtlPow).mul(player.w.points.max(1).log10().pow(wdPow))
		if(hasUpgrade("w",55)) gain = gain.mul(upgradeEffect("w",55))
		if(hasUpgrade("w",45)) gain = gain.mul(upgradeEffect("w",45))
		if(player.off.ol.gte(1)) gain = gain.mul(tmp.off.offAEToAE)
		if(deGain().gte(0)) gain = gain.div(deDivAE())
	}
	if(inChallenge("dm",22)) {
		gain = new Decimal(0)
		if(player.de.gte(1e6)||player.ae.gt(0)) gain = player.de.max(1).div(1e6).pow(0.4).div(3)
		if(hasMilestone("c",51)) gain = gain.pow(1.25)
		if(hasMilestone("c",53)) gain = gain.mul(tmp.c.vcToAEBase)
	}
	return gain
}

function deDivAE() {
	let eff = new Decimal(1)
	let harsh1 = new Decimal(1000)
	let effectiveDE = player.de
	if(player.de.gte(harsh1)) effectiveDE = effectiveDE.div(harsh1).pow(1.75).mul(harsh1)
	if(player.ae.gt(0)) eff = effectiveDE.add(1).pow(0.075).max(1)
	return eff
}

function deGain() {
	let gain = new Decimal(1)
	if(inChallenge("a",22)) {
		gain = new Decimal(0)
		if(player.ae.gte(1e9)||player.de.gt(0)) gain = player.ae.max(1).div(1e9).pow(0.4)
	}
	if(inChallenge("dm",22)) {	
		if(tmp.w.buyables[14].unlocked) gain = gain.mul(buyableEffect("w",14))
		if(hasUpgrade("w",63)) gain = gain.mul(upgradeEffect("w",63))
		if(hasUpgrade("w",64)) gain = gain.mul(upgradeEffect("w",64))
		if(hasUpgrade("w",66)) gain = gain.mul(upgradeEffect("w",66))
		if(hasMilestone("c",0)) gain = gain.mul(5)
		if(hasMilestone("c",3)) gain = gain.mul(tmp.c.resetsToDE)
		if(hasMilestone("c",4)) gain = gain.mul(tmp.c.crystalsToDE)
		if(hasMilestone("c",83)) gain = gain.mul(tmp.c.ecToDE)
		if(aeGain().gte(0)) gain = gain.div(aeDivDE())
	}
	return gain
}

function aeDivDE() {
	let eff = new Decimal(1)
	let harsh1 = new Decimal(1000) // the effect of ae will increase after 1k ae
	let effectiveAE = player.ae
	if(player.ae.gte(harsh1)) effectiveAE = effectiveAE.div(harsh1).pow(1.5).mul(harsh1)
	if(player.ae.gt(0)) eff = effectiveAE.add(1).pow(0.05).max(1)
	if(hasMilestone("c",57)) eff = eff.mul(tmp.c.vcToAEEffect)
	return eff
}

function aeDivWD() {
	let eff = aeDivDE()
	eff = eff.mul(10).pow(7)
	return eff
}

function colorPalette(type) {
	switch(type) {
		case "c": // Crystal Shards
			return ["rgb(209, 31, 31)","rgb(191, 143, 143)"]
		case "vc":
			return ["rgb(18, 187, 41)","rgb(109, 189, 120)"]
		case "ec":
			return ["rgb(217, 55, 250)","rgb(225, 151, 240)"]
		case "ac22": case "a":
			return ["rgb(252, 244, 132)","rgb(179, 175, 130)"]
		case "dc22": 
			return ["rgb(168, 26, 69)","rgb(135, 133, 238)"]
		case "dm":
			return ["rgb(168, 26, 69)","rgb(224, 147, 147)"]
	}
}

function getCurrency(type) {
	switch(type) {
		case "c": // Crystal Shards
			return player.c.points
		case "vc":
			return player.c.vc
		case "ec":
			return player.c.ec
		case "ac22":
			return player.ae
		case "dc22":
			return player.de
		case "a":
			return player.a.points
		case "dm":
			return player.dm.points
	}
}

function upgradeButtonStyle(type,layer,id,multi=false) { // multi: for upgrades with multiple currencies required
	let colors = colorPalette(type)
	let currency = getCurrency(type)
	let color = colors[1]
	if(hasUpgrade(layer,id)) color = colors[0]
	if(currency.gte(tmp[layer].upgrades[id].cost)&&!hasUpgrade(layer,id)&&!multi) {
		color = "linear-gradient("+colors[1]+","+colors[0]+")"
	}
	if(tmp[layer].upgrades[id].canAfford&&!hasUpgrade(layer,id)&&multi) {
		color = "linear-gradient("+colors[1]+","+colors[0]+")"
	}
	return color
}

function getUpgCount(layer, start, end) {
	let upgs = 0
	for(let i = start; i <= end; i++) {
		if(hasUpgrade(layer,i)) upgs++
	}
	return upgs
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	ae: new Decimal(0), // Angelic Essence 
	de: new Decimal(0) // Demonic Essence
}}

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
