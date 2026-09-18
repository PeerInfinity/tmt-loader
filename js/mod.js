let modInfo = {
	name: "The Tree of Existence and Reality",
	id: "ExisReal",
	author: "UH33",
	pointsName: "Existence Shards",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal(0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.4",
	patch: 1,
	name: "A New Headstart",
}

let changelog = `<h1>Changelog:</h1><br><br> 
  <i>Note: the number of layers in every update, where they are adding, it means amount of permanently unlockable layers (example: Black Hole layer)!</i><br><br> 
  <h3>v0.4. Patch 1</h3><br>
  - Some bugfixes.<br>
  - Fixed mistake regarding softcap.<br>
  <br>
  <h2>v0.4 - A New Headstart</h2><br>
  - Implemented some features for Aether, Space and Time layers.<br>
  - Fixed the <h3 style = 'color:#bb00ff; text-shadow: #bb00ff 0px 0px 10px;'>Existenceless</h3> challenge nerf.<br>
  - Added the hardcap to Existence Shards (can be dilated).<br>
  - Added new two rows of achievements. (images to them in development)<br>
  - Added the <h3 style = 'color:#b67f33; text-shadow: #b67f33 0px 0px 10px;'>Infinity</h3> and <h3 style = 'color:#b341e0; text-shadow: #b341e0 0px 0px 10px;'>Eternity</h3> layer, but they are unreachable now... (9 layers in total)<br>
  <br>
  <h3>v0.3.2 - Stats, Challenge and Black Hole!</h3><br>
  - Added new challenge in Space layer.<br>
  - Added <h3 style = 'color:#222222; text-shadow: #222222 0px 0px 10px;'>Black Hole</h3> layer. (7 layers in total)<br>
  - Added Statistics, where you can see resources and challenge completion.<br>
  - Added new number formatting for Black Hole layer.<br>
  <br>
  <h3>v0.3.1 - Achievements</h3><br>
  - Buyables in Time layer replaced with upgrades.<br>
  - Added a first row of achievements.<br>
  - Implemented a requirement increase via "unlockOrder" feature.<br>
  <br>
  <h2>v0.3 - Challable!</h2><br>
  - Added a triplet of challenges in Space layer.<br>
  - Added a triplet of buyables in Time layer.<br>
  - Work on Force and Soul layers will start soon.<br>
  <br>
  <h3>v0.2.2 - Some Balance and Layer</h3><br>
  - Added some milestones.<br>
  - Implemented Force and Soul layer, but they need some improvements. (6 layers in total)<br>
  - Implemented effect for Primordial Essence and added nerfs to "Density Growth" and "Theory of Shards" upgrades.<br>
  <br>
  <h3>v0.2.1 - New Upgrades</h3><br>
  - Added the "Density Growth" and "Singularity Formation" upgrades, which make P.E. gain more easier.<br>
  - Finally implemented the Aether Layer and finalized it's unlocking upgrade.<br>
  <br>
  <h2>v0.2 - Milestones!</h2><br>
  - Added milestones to Space and Time layers.<br>
  - Trying to configurate the unlocking of layers...<br>
  <br>
  <h3>v0.1.0.1 - HEY! E.S. AMOUNT IS WAY TOO LARGE IN 0.1!</h3><br>
  - Fixed the "exponential explosion" which caused by "Space-Time Formation" effect.<br>
  <br>
  <h2>v0.1 - GoodVerse</h2><br>
  - Remaded the "Space-Time Formation" effect.<br>
  - Buffed the row1 upgrades.<br>
  <br>
  <h3>Alpha v0.0.1 - Aether</h3><br>
	- Renamed Existence to Existence Shards.<br>
  - Renamed Compressed Existence to Primordial Essence (first layer in game!).<br>
	- Added Aether layer. (4 layers in total, though it locked anyway)<br>
  <br>
	<h3>Alpha v0.0 - Beginning</h3><br>
	- Renamed points to Existence.<br>
	- Added Compressed Existence, Space and Time layers. (3 layers layers in total)<br>
   - It had a long enough time to let me understand how it works... REALLY!<br> `

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

function getPointCap() {
  let cap = new Decimal(1e10)
  if (!inChallenge("sp",13)) cap = cap.times(tmp.t.getTSPUpgsDil)
  if ((player.a.unlocked)&&(!inChallenge("sp",13))) cap = cap.pow(tmp.a.getShDistEff)
  return cap
}
// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
  if ((player.ee.unlocked)&&((inChallenge("sp",13))||inChallenge("sp",21))) gain = gain.add(player.ee.points.add(1).pow(0.01))
  if ((player.bh.unlocked)&&(hasChallenge("sp",21))) gain = gain.add(player.bh.points.add(1).log10().div(2))
  if ((hasUpgrade('ee',11))&&(inChallenge("sp",13))||inChallenge("sp",21)) gain = gain.times(1000)
  if ((hasUpgrade('ee',12))&&(inChallenge("sp",13))||inChallenge("sp",21)) gain = gain.times(10000)
  if ((hasUpgrade('ee',13))&&(inChallenge("sp",13))||inChallenge("sp",21)) gain = gain.times(100000)
  if ((hasUpgrade('ee',13))&&(inChallenge("sp",13))||inChallenge("sp",21)) gain = gain.pow(1.5)
  if (hasChallenge("sp",13)&&(!inChallenge("sp",21))) gain = gain.add(player.points.add(1).pow(0.05))
  if ((player.p.unlocked)&&((inChallenge("sp",11))&&(player.p.points.gte(5)))) gain = gain.times(player.p.points.add(1).pow(player.p.points.div(2)))
  if (hasUpgrade('p',11)) gain = gain.times(upgradeEffect('p', 11))
  if (hasUpgrade('p',11)||inChallenge("sp",11)) gain = gain.add((player.points.add(1)).log10())
  if (hasChallenge("sp",11)&&(!inChallenge("sp",21))) gain = gain.pow(1.15)
  if (hasUpgrade('p',12)) gain = gain.times(upgradeEffect('p', 12))
  if (hasUpgrade('p',13)) gain = gain.times(upgradeEffect('p', 13).max(1))
  if (hasUpgrade('sp',11)&&(!inChallenge("sp",21))) gain = gain.times(upgradeEffect('sp',11))
  if (inChallenge("sp",11)) gain = gain.pow(0.25)
  if (inChallenge("sp",12)) gain = gain.div(player.points.add(1).pow(1.2))
  if (inChallenge("sp",12)) gain = gain.add(player.points.pow(0.2))
  if (inChallenge("sp",13)) gain = gain.pow(0.125)
  if (inChallenge("sp",13)) gain = gain.add(player.points.pow(0.005))
  if (inChallenge("sp",13)) gain = gain.div(player.points.add(1).pow(0.75))
  if (inChallenge("sp",21)) gain = gain.times(5000).pow(-0.5)
  if ((player.bh.unlocked)&&(inChallenge("sp",21))) gain = gain.add(player.bh.points.add(1).log2().div(1000))
  if (hasChallenge("sp",21)&&(!inChallenge("sp",21))) gain = gain.pow(player.points.add(1).pow(0.005))
  if (gain.gte(1e15)) gain = gain.div(1e15).sqrt().times(1e15)
  if (gain.gte(1e15)&&(hasUpgrade('t',11))) gain = gain.pow(1.15)
  gain = gain.times(tmp.a.getBE2)
  if (gain.gte(1e30)) gain = gain.div(1e30).cbrt().times(1e30)
  if (gain.gte(1e45)) gain = gain.div(1e45).pow(0.25).times(1e45)
  if (gain.lte(1e-10)) gain = gain.times(1e10)
  if (player.points.gte(getPointCap())) gain = gain.times(0)
  return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
  function () {
    return `<i><h5 style="opacity:0.05">Current hardcap is:`+format(getPointCap())+`</h5></i>`}
]

// Determines when the game "ends"
function isEndgame() {
  return (player.f.unlocked&&(player.s.unlocked))
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
