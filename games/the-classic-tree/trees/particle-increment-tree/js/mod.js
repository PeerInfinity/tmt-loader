let modInfo = {
	name: "The Particle Increment Tree",
	id: "cpt_particles",
	author: "cokecole",
	pointsName: "能量",
	modFiles: ["layers.js", "tree.js"],

	discordName: "作者的哔哩哔哩主页",
	discordLink: "https://space.bilibili.com/229471312?spm_id_from=333.1007.0.0",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.0",
	name: "Test Build 1",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.0</h3><br>
		- 加入游戏的基本点数————能量。<br>
		- 加入夸克层级及12个夸克升级。<br>
		- 加入反夸克及12个反夸克升级。<br>
		- 加入色荷。<br>
		- 加入轻子层级。`

let winText = `恭喜你，你通关了这个游戏。。。你现在可以去超（划掉）支持一下作者拉。`

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

// 计算点数(能量)生成速度
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = pointMult()
	if(getClickableState("q",11)==1) 
		gain = gain.sub(aqGainCal().mul(aqConsumeCal()))
	return gain
}

function pointMult(){
	let gain = new Decimal(1)
	if(hasUpgrade("q",11))
		gain = gain.mul(2)
    if(hasUpgrade("q",12))
		gain = gain.mul(upgradeEffect("q",12))
	if(hasUpgrade("q",33))
		gain = gain.mul(upgradeEffect("q",33))
	if(hasUpgrade("q",36))
		gain = gain.mul(buyableEffect("q",12))
	if(hasUpgrade("l",11))
		gain = gain.mul(upgradeEffect("l",11))
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	 devSpeed:new Decimal(1)
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal(1e114514))
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

function aqGainCal(){
	let aqGain = new Decimal(1)
	if(hasUpgrade("q",21))
        aqGain = aqGain.mul(2)
	if(hasUpgrade("q",22))
    	aqGain = aqGain.mul(upgradeEffect("q",22))
	if(hasUpgrade("q",24))
		aqGain = aqGain.mul(upgradeEffect("q",24))
	if(hasUpgrade("q",31))
		aqGain = aqGain.mul(upgradeEffect("q",31))
	if(hasUpgrade("q",34))
		aqGain = aqGain.mul(upgradeEffect("q",34))
	if(hasUpgrade("q",36))
		aqGain = aqGain.mul(buyableEffect("q",13))
	return aqGain
}

function aqRealGainCal(){
	if(getClickableState("q",11)==1 && player.points>0){
		return aqGainCal()
	}else{
		return new Decimal(0)
	}
}

function aqConsumeCal(){
	let aqConsume = new Decimal(100)
	if(hasUpgrade("q",23))
		aqConsume = aqConsume.div(10)
	if(hasUpgrade("q",25))
		aqConsume = aqConsume.div(upgradeEffect("q",25))
	if(hasUpgrade("q",41))
		aqConsume = aqConsume.add(1).pow(upgradeEffect("q",41)).sub(1)
	return aqConsume
}

function getPassiveGain(){
	return player.q.mul(player.q.passiveGenaration())
}