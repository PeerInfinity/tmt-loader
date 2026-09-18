let modInfo = {
	name: "small layers tree",
	id: "Very Small Tree",
	author: "not pog",
	pointsName: "planck lengths",
	discordName: "this doesn't exist",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	
	offlineLimit: 8,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.2b",
	name: "color full",
}

let changelog = `<h1>changelog</h1><br>
	<h2>v0.0</h2><br>
		made this mod <br>
	<h3>v0.1a</h3><br>
		content was added to the m layer.<br>
		subtabs were made to organize stuff<br>
		<b>=== known insects ===</b><br>
		automation doesn't work<br>
		Buyable m21's second effect doesn't work<br>
	<h3>v0.1b</h3><br>
		organized it into microtabs and made a new subtab<br>
		changed the changelog and the version appropiately<br>
		<b>=== known insects ===</b><br>
		automation still doesn't work<br>
		Buyable m21's second effect still doesn't work either<br>
		infoboxes don't show up in effects subtab, just the other text and buttons<br>
	<h3>v0.1c</h3><br>
		redid the changelog again<br>
		a bit of content<br>
		changed some display and fixed all known bugs from before<br>
		new layer when<br>
	<h3>v0.2a</h3><br>
		mm yes new layer<br>
		added some stuff<br>
		<b>=== known insects ===</b><br>
		reloading after getting a certain upgrade gives a random boost to pl<br>
		if you have m43 and don't see another layer, put <i>player.d.unlocked = true</i> in console<br>
		d resetting m doesnt work<br>
	<h3>v0.2b</h3><br>
		some suggestions and bug fixes in tmt dc were taken`

let winText = `ez amirite... well good job for completing version ${VERSION.num} - ${VERSION.name} of this bad game`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){return true}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)
	let gain = new Decimal(1).mul(buyableEffect('m',11))
	if(hasUpgrade('m',11)) gain = gain.add(upgradeEffect('m',11))
	if(hasUpgrade('m',21)) gain = gain.mul(upgradeEffect('m',21))
	if(inChallenge('m',11)) gain = gain.pow(0.5)
	if(inChallenge('m',22)) gain = gain.pow(0.33)
	if(hasChallenge('m',22)) gain = gain.pow(1.11)
	if(inChallenge('m',31)) gain = gain.pow(0.5).pow(0.5)
	if(hasUpgrade('d',12)) gain = gain.mul(upgradeEffect('d',12))
	if(hasUpgrade('d',32)) gain = gain.pow(upgradeEffect('d',32))
	if(hasUpgrade('d',42)) gain = gain.pow(clickableEffect('d',11).pow(0.033))
	if(inChallenge('d',12) && new Decimal(challengeCompletions('d',12)).eq(0)) gain = gain.pow(0.5)
	if(inChallenge('d',12) && new Decimal(challengeCompletions('d',12)).eq(1)) gain = gain.pow(0.25)
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	function() {
		return "Endgame: Challenge d12x2<br>Note: There are <i>a lot</i> of ~100s (200s?) mini-timewalls" +
		"<br>5m and no progress = Something is missing (or you're at endgame)" +
		(player.d.unlocked ? "<br>Resource-generated resources get generated when the game is active" : "")
	}
]

// Determines when the game "ends"
function isEndgame() {
	return new Decimal(challengeCompletions('d',12)).eq(2)
}



// Less important things beyond this point!

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}