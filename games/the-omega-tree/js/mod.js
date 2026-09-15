let modInfo = {
	name: "The Omega Tree",
	id: "2",
	author: "Omega",
	pointsName: "Points",
	modFiles: ["layers.js", "tree.js", "sp.js", "up.js", "sbp.js", "sbp2.js", "sbp3.js", "hp.js", "achievements.js", "stats.js", "mega.js", "sbp4.js", "sbp5.js", "air.js", "energy.js", "light.js", "sbp6.js", "sac.js", "scp.js", "cell.js", "tp.js", "leaves.js", "st.js", "cp.js", "divine.js", "pa.js", "rp.js", "cp2.js", "se.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 24,  // In hours
}
// Set your version in num and name
let VERSION = {
	num: "2.3.0: Update 13",
	name: "",
}
let changelog = `<h1>Changelog:</h1><br>
<h3>v2.3.0: Update 13 (08/06/2024)</h3><br>
		- The 13th Update is here!<br>
		- Added 1 more save bank.<br>
		- Added many new upgrades.<br>
		- Added more achievements.<br>
		- Added 1 new milestone.<br>
		- Added 1 new sub layer.<br>
		- Endgame: e1,065,000,000 Points.<br><br>
<h3>v2.2.0: Update 12 (29/05/2024)</h3><br>
		- The 12th Update is here!<br>
		- Added 1 more save bank.<br>
		- Added many new upgrades.<br>
		- Added more achievements.<br>
		- Added more milestones.<br>
		- Added more charged milestones.<br>
		- Added 1 new sub layer.<br>
		- Added 2 new buyables.<br>
		- Added 2 new challenges.<br>
		- Some Changes.<br>
		- Endgame: 1.00e340,000,000 Points.<br><br>
<h3>v2.1.2: Update 11.2 (24/05/2024)</h3><br>
		- Small Update 5.<br>
		- Bug Fixes again.<br><br>
<h3>v2.1.1: Update 11.1 (23/05/2024)</h3><br>
		- Small Update 4.<br>
		- Bug Fixes.<br><br>
<h3>v2.1.0: Update 11 (17/05/2024)</h3><br>
		- The 11th Update is here!<br>
		- Added 1 new notation in settings.<br>
		- Added 2 more save banks.<br>
		- Added many new upgrades.<br>
		- Added a new feature.<br>
		- Added more achievements.<br>
		- Added more milestones.<br>
		- Added 1 new layer.<br>
		- Added 3 new buyables.<br>
		- Removed 1 challenge.<br>
		- Endgame: 1.00e74,000,000 Points.<br><br>
<h3>v2.0.1: Rebalance (15/05/2024)</h3><br>
		- Small Update 3.<br>
		- Rebalanced everything.<br>
		- Bug Fixes.<br>
		- Added more QOL's.<br>
		- Made The Omega Tree more easier.<br><br>
<h3>v2.0.0: Update 10 (13/04/2024)</h3><br>
		- The First Big Update is here!<br>
		- You can now change notations in settings.<br>
		- Removed the endgame at the top.<br>
		- Added Save Bank.<br>
		- Made Hyper-Mega Layers a bit easier.<br>
		- Added many new upgrades.<br>
		- Added Upgrade Tree.<br>
		- Added 1 sub-currency.<br>
		- Added many new achievements.<br>
		- Added many new milestones.<br>
		- Added charged milestones.<br>
		- Added 1 new sub layer.<br>
		- Added 1 new major layer.<br>
		- Added 5 new buyables.<br>
		- Added 3 new challenges.<br>
		- Endgame: 1.00e13,000,000 Points.<br><br>
<h3>v1.9.0: Update 9 (08/04/2024)</h3><br>
		- The Ninth Update is here!<br>
		- Added more upgrades.<br>
		- Added more achievements.<br>
		- Added more milestones.<br>
		- Added 1 new sub layer.<br>
		- Added 1 new buyable.<br>
		- Endgame: 1.00e765,000 Points.<br><br>
<h3>v1.8.1: Update 8.1 (06/04/2024)</h3><br>
		- Small Update 2<br>
		- Balanced the 4th layer more.<br>
		- Changed some challenge requirements.<br><br>
<h3>v1.8.0: Update 8 (06/04/2024)</h3><br>
		- The Eighth Update is here!<br>
		- Added many new upgrades.<br>
		- Added more achievements.<br>
		- Added more milestones.<br>
		- Added 1 new major layer.<br>
		- Added 2 new buyables.<br>
		- Added more QOL's.<br>
		- Added more automation.<br>
		- Endgame: 1.00e512,000 Points.<br><br>
<h3>v1.7.0: Update 7 (30/03/2024)</h3><br>
		- The Seventh Update is here!<br>
		- Added many new upgrades.<br>
		- Added more achievements.<br>
		- Added more milestones.<br>
		- Added 1 new sub-layer.<br>
		- Endgame: 1.00e94,000 Points.<br><br>
<h3>v1.6.0: Update 6 (28/03/2024)</h3><br>
		- The Sixth Update is here!<br>
		- Added many new upgrades.<br>
		- Added more achievements.<br>
		- Added more milestones.<br>
		- Added more automation.<br>
		- Added more QOL's.<br>
		- Added 1 new challenge.<br>
		- Added 3 new buyables.<br>
		- Added 1 new sub-layer.<br>
		- Endgame: 1.00e84,000 Points.<br><br>
<h3>v1.5.1: Update 5.1 (27/03/2024)</h3><br>
		- The Small Update.<br>
		- Fixed the 100th achievement giving when completing MC11.<br>
		- Endgame: 1.00e64,100 Points.<br><br>
<h3>v1.5.0: Update 5 (27/03/2024)</h3><br>
		- The Fifth Update is here!<br>
		- Added many new upgrades.<br>
		- Added more achievements.<br>
		- Added more milestones.<br>
		- Added more automation.<br>
		- Added 1 new challenge.<br>
		- Added 1 new sub-layer.<br>
		- Endgame: 1.00e64,000 Points.<br><br>
<h3>v1.4.0: Update 4 (23/03/2024)</h3><br>
		- The Fourth Update is here!<br>
		- Added many new upgrades.<br>
		- Added many new achievements.<br>
		- Added more milestones.<br>
		- Added more automation.<br>
		- Added 1 new layer.<br>
		- Endgame: 1.00e28,000 Points.<br><br>
<h3>v1.3.0: Update 3 (20/03/2024)</h3><br>
		- The Third Update is here!<br>
		- Added many new upgrades.<br>
		- Added many new achievements.<br>
		- Added many new challenges.<br>
		- Added more milestones.<br>
		- Added some layer effects.<br>
		- Added some more sub-layers.<br>
		- Endgame: 1.00e10,500 Points.<br><br>
<h3>v1.2.0: Update 2 (10/03/2024)</h3><br>
		- The Second Update is here!<br>
		- Added many new upgrades.<br>
		- Added many new achievements.<br>
		- Added more challenges.<br>
		- Added more milestones.<br>
		- Added more automation.<br>
		- Added more buyables.<br>
		- Revamped some of the layers on the text.<br>
		- Added 1 new layer.<br>
		- Endgame: 1.00e4,270 Points.<br><br>
<h3>v1.1.0: Update 1 (02/03/2024)</h3><br>
		- The First Update is here!<br>
		- Added many new upgrades.<br>
		- Added many new achievements.<br>
		- Added 1 new mechanic.<br>
		- Added Challenges.<br>
		- Added many new milestones.<br>
		- Added more automation.<br>
		- Added Buyables.<br>
		- Endgame: 1.00e1,500 Points.<br><br>
<h3>v1.0.0: Release (28/02/2024)</h3><br>
		- The Omega Tree is finally out!<br>
		- Endgame: 1.80e308 Points.<br><br>
	<h3>v0.0.0 (23/02/2024)</h3><br>
		- The Omega Tree has been made.<br>
		- It's like The Pro Tree 2.`

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
		return new Decimal(5)

	let gain = new Decimal(5).mul(tmp["e"].effect)
	if (hasMilestone('hp', 22)) gain = gain.times(1.01)
	if (hasUpgrade('p', 12)) gain = gain.times("2")
	if (hasUpgrade('p', 13)) gain = gain.times("3")
	if (hasUpgrade('p', 14)) gain = gain.times(upgradeEffect('p', 14))
	if (hasUpgrade('p', 15)) gain = gain.times("2.2")
	if (hasUpgrade('p', 21)) gain = gain.times("3")
	if (hasUpgrade('p', 22)) gain = gain.times("3.14")
	if (hasUpgrade('p', 23)) gain = gain.times("1.5")
	if (hasUpgrade('p', 24)) gain = gain.times("1.01")
	if (hasUpgrade('p', 25)) gain = gain.times(upgradeEffect('p', 25))
	if (hasAchievement('a', 15)) gain = gain.times("2")
	if (hasUpgrade('p', 31)) gain = gain.times(upgradeEffect('p', 31))
	if (hasUpgrade('sp', 11)) gain = gain.times("6")
	if (hasUpgrade('sp', 12)) gain = gain.times("3")
	if (hasUpgrade('p', 32)) gain = gain.times("5")
	if (hasUpgrade('p', 33)) gain = gain.times("4")
	if (hasUpgrade('p', 34)) gain = gain.times("5")
	if (hasUpgrade('sp', 14)) gain = gain.times(upgradeEffect('sp', 14))
	if (hasUpgrade('sp', 15)) gain = gain.times("10")
	if (hasUpgrade('sp', 22)) gain = gain.times("3")
	if (hasUpgrade('p', 45)) gain = gain.times(upgradeEffect('p', 45))
	if (hasAchievement('a', 25)) gain = gain.times("2")
	if (hasUpgrade('pb', 11)) gain = gain.times(upgradeEffect('pb', 11))
	if (hasUpgrade('pb2', 11)) gain = gain.times(upgradeEffect('pb2', 11))
	if (hasUpgrade('sp', 31)) gain = gain.times("2")
	if (hasUpgrade('sp', 32)) gain = gain.times("5")
	if (hasUpgrade('up', 13)) gain = gain.times("7.5")
	if (hasUpgrade('up', 15)) gain = gain.times(upgradeEffect('up', 15))
	if (hasUpgrade('sp', 33)) gain = gain.times("3")
	if (hasUpgrade('p', 51)) gain = gain.times("4")
	if (hasUpgrade('sp', 34)) gain = gain.times("2")
	if (hasUpgrade('p', 52)) gain = gain.times("7")
	if (hasUpgrade('sp', 35)) gain = gain.times("4")
	if (hasUpgrade('pb3', 11)) gain = gain.times(upgradeEffect('pb3', 11))
	if (hasAchievement('a', 35)) gain = gain.times("2")
	if (hasUpgrade('up', 23)) gain = gain.times("2")
	if (hasUpgrade('p', 53)) gain = gain.times("2")
	if (hasUpgrade('p', 54)) gain = gain.times("10")
	if (hasUpgrade('up', 31)) gain = gain.times("3")
	if (hasUpgrade('sp', 42)) gain = gain.times("2.5")
	if (hasUpgrade('up', 32)) gain = gain.times("3")
	if (hasUpgrade('p', 61)) gain = gain.times("50")
	if (hasUpgrade('hp', 11)) gain = gain.times(upgradeEffect('hp', 11))
	if (hasUpgrade('sp', 44)) gain = gain.times("2")
	if (hasAchievement('a', 45)) gain = gain.times("2")
	if (hasUpgrade('hp', 24)) gain = gain.times(upgradeEffect('hp', 24))
	if (hasUpgrade('hp', 32)) gain = gain.times(upgradeEffect('hp', 32))
	if (hasUpgrade('up', 41)) gain = gain.times("10")
	if (hasUpgrade('hp', 34)) gain = gain.times(upgradeEffect('hp', 34))
	if (hasUpgrade('sp', 51)) gain = gain.times("10")
	if (hasUpgrade('sp', 52)) gain = gain.times(upgradeEffect('sp', 52))
	if (hasAchievement('a', 55)) gain = gain.times("2")
	if (hasUpgrade('up', 43)) gain = gain.times("10")
	if (hasUpgrade('hp', 42)) gain = gain.times(upgradeEffect('hp', 42))
	if (hasUpgrade('p', 62)) gain = gain.times("15")
	if (hasUpgrade('p', 63)) gain = gain.times("10")
	if (hasUpgrade('hp', 43)) gain = gain.times("50000")
	if (hasUpgrade('p', 65)) gain = gain.times("2")
	if (hasUpgrade('up', 44)) gain = gain.times("3")
	if (hasUpgrade('sp', 54)) gain = gain.times("25")
	if (hasUpgrade('sp', 55)) gain = gain.times("10")
	if (hasUpgrade('sp', 61)) gain = gain.times("210")
	if (hasAchievement('a', 65)) gain = gain.times("2")
	if (hasUpgrade('up', 45)) gain = gain.times("150")
	if (hasUpgrade('sp', 62)) gain = gain.times("5")
	if (hasUpgrade('p', 71)) gain = gain.times("25")
	if (hasUpgrade('p', 73)) gain = gain.times("3")
	if (hasUpgrade('up', 51)) gain = gain.times("40")
	if (hasUpgrade('p', 74)) gain = gain.times("10")
	if (hasUpgrade('hp', 52)) gain = gain.times(upgradeEffect('hp', 52))
	if (hasUpgrade('p', 75)) gain = gain.times("100")
	if (inChallenge("hp", 11)) gain = gain.pow(0.75)
	if (hasUpgrade('sp', 71)) gain = gain.times("2")
	if (hasMilestone('hp', 4)) gain = gain.times(milestoneEffect('hp', 4))
	if (hasMilestone('hp', 5)) gain = gain.times("1e3")
	if (hasUpgrade('sp', 72)) gain = gain.times("25")
	if (hasUpgrade('sp', 73)) gain = gain.times(upgradeEffect('sp', 73))
	if (hasUpgrade('up', 52)) gain = gain.times(upgradeEffect('up', 52))
	if (hasUpgrade('p', 82)) gain = gain.times(upgradeEffect('p', 82))
	if (hasUpgrade('p', 83)) gain = gain.times(upgradeEffect('p', 83))
	if (hasMilestone('hp', 9)) gain = gain.pow(1.01)
	if (hasUpgrade('p', 84)) gain = gain.times("450")
	if (hasAchievement('a', 75)) gain = gain.times("2")
	if (hasUpgrade('up', 53)) gain = gain.times("100")
	if (hasUpgrade('up', 54)) gain = gain.times("20")
	if (hasUpgrade('p', 85)) gain = gain.times("20")
	if (hasUpgrade('p', 91)) gain = gain.times("9")
	if (hasUpgrade('p', 94)) gain = gain.times("2")
	if (hasUpgrade('p', 95)) gain = gain.times("3")
	if (hasUpgrade('p', 101)) gain = gain.times("2")
	if (hasUpgrade('p', 102)) gain = gain.times("3.5")
	if (hasUpgrade('p', 103)) gain = gain.times("2")
	if (hasUpgrade('p', 104)) gain = gain.times("1.1")
	if (hasUpgrade('sp', 74)) gain = gain.times("10000")
	if (hasUpgrade('up', 55)) gain = gain.times("10")
	if (hasUpgrade('hp', 54)) gain = gain.times("5e5")
	if (hasMilestone('hp', 10)) gain = gain.pow(1.05)
	if (hasUpgrade('up', 61)) gain = gain.times("10000")
	if (hasMilestone('hp', 11)) gain = gain.pow(1.05)
	if (hasUpgrade('up', 62)) gain = gain.times("10")
	if (hasUpgrade('sp', 81)) gain = gain.div("20")
	if (hasMilestone('hp', 14)) gain = gain.pow(1.25)
	if (hasUpgrade('up', 64)) gain = gain.times(1.2e8)
	if (hasAchievement('a', 85)) gain = gain.times("2")
	if (hasUpgrade('p', 111)) gain = gain.times("3")
	if (hasUpgrade('sp', 82)) gain = gain.times("75000")
	if (hasUpgrade('up', 65)) gain = gain.times("5")
	if (inChallenge("hp", 21)) gain = gain.pow(0.1)
	gain = gain.times(buyableEffect('hp', 11))
	if (hasMilestone('hp', 16)) gain = gain.pow(1.05)
	if (hasUpgrade('hp', 61)) gain = gain.times(upgradeEffect('hp', 61))
	if (hasMilestone('hp', 19)) gain = gain.pow(1.1)
	if (hasUpgrade('sp', 83)) gain = gain.times("400")
	if (hasAchievement('a', 95)) gain = gain.times("2")
	if (hasMilestone('hp', 23)) gain = gain.times(milestoneEffect('hp', 23))
	if (inChallenge("hp", 22)) gain = gain.pow(0.2)
	if (hasUpgrade('up', 71)) gain = gain.times(10)
	if (hasMilestone('hp', 25)) gain = gain.pow(1.05)
	if (hasUpgrade('p', 113)) gain = gain.times("1000")
	if (hasUpgrade('p', 114)) gain = gain.pow(1.05)
	if (hasUpgrade('up', 72)) gain = gain.times("1e18")
	if (hasMilestone('hp', 26)) gain = gain.pow(1.01)
	if (hasUpgrade('hp', 62)) gain = gain.times(upgradeEffect('hp', 62))
	if (hasUpgrade('p', 115)) gain = gain.times("10")
	if (hasAchievement('a', 105)) gain = gain.times("2")
	if (hasUpgrade('p', 16)) gain = gain.times("20")
	if (hasUpgrade('p', 26)) gain = gain.times(upgradeEffect('p', 26))
	if (hasUpgrade('p', 46)) gain = gain.times("1e6")
	if (hasUpgrade('p', 56)) gain = gain.times("1e10")
	gain = gain.times(buyableEffect('hp', 12))
	if (hasUpgrade('up', 74)) gain = gain.times("100000")
	if (hasUpgrade('hp', 63)) gain = gain.times(upgradeEffect('hp', 63))
	if (hasAchievement('a', 115)) gain = gain.times("2")
	if (hasUpgrade('mp', 15)) gain = gain.pow(1.05)
	gain = gain.times(buyableEffect('hp', 13))
	if (hasAchievement('a', 125)) gain = gain.times("2")
	if (hasUpgrade('mp', 22)) gain = gain.times(upgradeEffect('mp', 22))
	if (hasUpgrade('p', 86)) gain = gain.times("1e6")
	if (hasUpgrade('mp', 25)) gain = gain.times("1e33")
	if (hasAchievement('a', 135)) gain = gain.times("2")
	if (hasMilestone('mp', 4)) gain = gain.pow(1.111111111)
	if (hasChallenge('hp', 31)) gain = gain.pow(1.01)
	if (hasChallenge('hp', 32)) gain = gain.pow(1.01)
	if (hasUpgrade('sp', 84)) gain = gain.times("2")
	if (hasUpgrade('p', 106)) gain = gain.times(upgradeEffect('p', 106))
	if (hasUpgrade('mp', 43)) gain = gain.pow(1.02)
	if (hasAchievement('a', 145)) gain = gain.times("2")
	if (inChallenge("hp", 41)) gain = gain.pow(0.01)
	if (hasAchievement('a', 155)) gain = gain.times("2")
	if (inChallenge("hp", 42)) gain = gain.pow(0.55)
	if (hasChallenge('hp', 42)) gain = gain.times(1e5)
	if (hasUpgrade('mp', 52)) gain = gain.times("1e150")
	if (hasChallenge('hp', 51)) gain = gain.times(1000)
	if (hasAchievement('a', 165)) gain = gain.times("2")
	if (hasUpgrade('hp', 73)) gain = gain.times(upgradeEffect('hp', 73))
	if (hasUpgrade('up', 83)) gain = gain.times(upgradeEffect('up', 83))
	if (hasUpgrade('pb6', 11)) gain = gain.div(upgradeEffect('pb6', 11))
	if (hasUpgrade('hp', 82)) gain = gain.times(upgradeEffect('hp', 82))
	if (hasAchievement('a', 175)) gain = gain.times("2")
	if (hasMilestone('sa', 1)) gain = gain.times("50")
	if (hasMilestone('sa', 2)) gain = gain.times("5")
	if (hasMilestone('sa', 3)) gain = gain.times("3")
	if (hasUpgrade('e', 25)) gain = gain.times(upgradeEffect('e',25))
	if (hasMilestone('sa', 7)) gain = gain.times("1e9")
	if (hasMilestone('sa', 8)) gain = gain.times("1e9")
	if (hasMilestone('sa', 9)) gain = gain.times("20")
	if (hasMilestone('sa', 10)) gain = gain.times("7.5")
	if (hasUpgrade('e', 44)) gain = gain.times(upgradeEffect('e',44))
	if (hasAchievement('a', 205)) gain = gain.times("10")
	if (hasUpgrade('e', 65)) gain = gain.times(upgradeEffect('e',65))
	if (hasUpgrade('e', 71)) gain = gain.times(upgradeEffect('e',71))
	if (hasMilestone('sa', 26)) gain = gain.times(milestoneEffect('sa', 26))
	if (hasUpgrade('le', 11)) gain = gain.times(upgradeEffect('le', 11))
	if (hasAchievement('a', 245)) gain = gain.times("10")
		if (hasUpgrade('le', 65)) gain = gain.times(upgradeEffect('le', 65))
		if (hasUpgrade('cp', 33)) gain = gain.times(upgradeEffect('cp', 33))
		if (hasUpgrade('cp', 55)) gain = gain.pow(1.01)
			if (hasUpgrade('rp', 25)) gain = gain.pow(1.2)
				if (hasUpgrade('rp', 35)) gain = gain.times(upgradeEffect('rp', 35))
					if (hasUpgrade('rp', 44)) gain = gain.times(upgradeEffect('rp', 44))
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}
function convertToB16(n){
    let codes = {
            0: "0",
            1: "1",
            2: "2",
            3: "3",
            4: "4",
            5: "5",
            6: "6",
            7: "7",
            8: "8",
            9: "9",
            10: "A",
            11: "B",
            12: "C",
            13: "D",
            14: "E",
            15: "F",
    }
    let x = n % 16
    return codes[(n-x)/16] + codes[x]
}
function getUndulatingColor(period = Math.sqrt(760)){
	let t = new Date().getTime()
	let a = Math.sin(t / 1e3 / period * 2 * Math.PI + 0) 
	let b = Math.sin(t / 1e3 / period * 2 * Math.PI + 2)
	let c = Math.sin(t / 1e3 / period * 2 * Math.PI + 4)
	a = convertToB16(Math.floor(a*128) + 128)
	b = convertToB16(Math.floor(b*128) + 128)
	c = convertToB16(Math.floor(c*128) + 128)
	return "#"+String(a) + String(b) + String(c)
}
var displayThings = [
	function(){
		let d = isEndgame()?makeRed("You are past the endgame,<br>and the game might not be balanced here.<br>"):""
		let e = `────────────────────────────────────`
		return d+e
	},
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("e1.065e9"))
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