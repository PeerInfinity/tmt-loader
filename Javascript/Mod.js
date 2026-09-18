let modInfo = {
	name: "Sorbet's Convolution: Mainframe",
	author: "SorbetShark",
	pointsName: "Points",
	modFiles: [
		"Layers/Universe.js",
		"Layers/Money.js",
		"Layers/Achievements.js",
		"Layers/LayerPrestige.js",
		"Layers/Boosters.js",
		"Layers/Sorbet.js",
		"Layers/EventHorizon.js",
		"Layers/LayerArtifacts.js",
		"Layers/Lore.js",
		"Layers/ResourcePanel.js",
		"Layers/Colin.js",
		"Layers/Unknown.js",


		"Tree.js"
	],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0),
	offlineLimit: 1,
}

let VERSION = {
	num: "1.2.0",
	name: "Sapient Fatalis",
	pre: null
}

function changelog() {return `
<h1><goop>Changelog</goop></h1>
<br>
<small style="color:gray">Ew why is it gooey pls don't touch it.</small>
<button onClick="{{player.secrets[0] = true; playSound(0)}}" class="tile can" style="height: 20px; width: auto; border-radius: 3px">Touch it anyways?</button>
<br> <br>
<hr style="width:600px">
<br> <br>
<h2> Version 1.2.0 (Sapient Fatalis) </h2>
<br> <br> <small> <gray>
Added 2 nodes (Neither aren't finished)
<br>
Balanced Sorbet Colors
<br>
Added Challenges
<br>
Nonexistant Endgame: Universe 95
</small> </gray>

`}

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

function canGenPoints(){
	return true
}

function getPointGen() {
	if(!canGenPoints()) {
		return new Decimal(0)
	} else {
		let gainMult = new Decimal(1)
		if (hasUpgrade("money", 11)) gainMult = gainMult.times(upgradeEffect("money", 11))
		if (hasUpgrade("money", 12)) gainMult = gainMult.times(2)
		if (hasMilestone("universe", 11)) gainMult = gainMult.div(1.5)
		if (hasUpgrade("money", 34)) gainMult = gainMult.times(12.11)
		if (hasUpgrade("money", 44)) gainMult = gainMult.times(12.11)
		if (hasUpgrade("universe", 11)) gainMult = gainMult.times(upgradeEffect("universe", 11))
		if (hasMilestone("universe", 16)) gainMult = gainMult.times(buyableEffect("money", 12))
		if (hasMilestone("universe", 19)) gainMult = gainMult.times(player.booster.effects[0])
		if (hasUpgrade("sorbet", 11)) gainMult = gainMult.times(2000000)
		if (hasUpgrade("sorbet", 11)) gainMult = gainMult.times(upgradeEffect("sorbet", 11))
		if (hasMilestone("universe", 29)) gainMult = gainMult.times(player.sorbet.colors.pureEffect())
		if (hasMilestone("colin", 13)) gainMult = gainMult.times("e9999")
		if (hasMilestone("colin", 19)) gainMult = gainMult.times("e10000")
		if (hasUpgrade("colin", 22)) gainMult = gainMult.times(upgradeEffect("colin", 22))
		if (hasMilestone("colin", 21) && player.colin.speed.gte(299792458)) gainMult = gainMult.times("e100000")
		if (player.colin.distance.gte(1000000)) gainMult = gainMult.times(player.colin.distanceMilestones[1])

		let gainExpo = new Decimal(1)
		if (player.universe.points.gte(35) && player.points.gte("e5500")) gainExpo = gainExpo.sub(0.005)
		if (hasUpgrade("eh", 611)) gainExpo = gainExpo.times(upgradeEffect("eh", 611))

		if (player.points.gte(getNextAt("universe", false, "static"))) {
			return gainMult.pow(gainExpo).pow(new Decimal(1).div(3)).pow(new Decimal(1).div(3)).pow(new Decimal(1).div(3))
		} else {
			return gainMult.pow(gainExpo)
		}
	}
}

function addedPlayerData() { return {
	dialoguesTriggered: new Decimal(0),
	challengeName: ``,
	prestigeAmount: [new Decimal(0), new Decimal(0), new Decimal(0)],
	secrets: [false, false],
	sillyStats: {
		prestigeTimes: new Decimal(0)
	},
	timeDilationScale: new Decimal(1),
	artifacts: [],
	tickerText: ''
}}

function getDilation() {
	let base = new Decimal(1)

	if (hasUpgrade("eh", 611) && upgradeEffect("eh", 611).lt(1)) {
		if (hasUpgrade("eh", 621)) {
			return new Decimal(0.8)
		} else {
			return new Decimal(1)
		}
	}

	return base
}



var displayThings = [
	function() {if (player.challengeName == ``) {return `<rubik>You are currently not in a challenge...</rubik>`} else {return `<rubik>You are in challenge: ${player.challengeName}...</rubik>`}},
	function() {if (player.points.gte(getNextAt("universe", false, "static"))) {return `<rubik>Production currently cuberooted 3 times over due to having enough for a destroyed universe...</rubik>`}},
	function() {return `<br>${player.tickerText}`}
]

function isEndgame() {
	return false
}

var backgroundStyle = {
	"background-size": "fit"
}

function maxTickLength() {
	return(3600)
}

function fixOldSave(oldVersion) {
}

let sounds = [
	new Audio("Sounds/TouchGoop.ogg")
]

function playSound(id) {
	sounds[id].currentTime = 0
	sounds[id].play()
}

let CParticles = {
	
}