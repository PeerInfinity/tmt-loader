let modInfo = {
	name: "Distance Incremental",
	id: "distinct",
	author: "unsoftcapped",
	pointsName: "Distance",
	discordName: "",
	discordLink: "",
	changelogLink: "https://github.com/Acamaeda/The-Modding-Tree/blob/master/changelog.md",
    offlineLimit: 1,  // In hours
    initialStartPoints: new Decimal (0) // Used for hard resets and new players
}

// Set your version in num and name
let VERSION = {
	num: "0.2 Rocket Fuel",
	name: "Rocket fuel",
}

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything","onReset"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}
function getRocketEffect(){
	let rockets = new Decimal(player.ro.points)
	rockets=rockets.plus(player.ro.buyables[11].pow(0.5).div(2))
	let effect = rockets.add(1).log(3)
	effect = effect.times(player.ro.buyables[11].add(1).log(2).add(1).pow(0.05))
	return effect
}
// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)
	let velocity = new Decimal(player.r.time)
	let acceleration = new Decimal(0.1)
	let maxVelocity=new Decimal(1)
	if (player.r.points.gte(2)) maxVelocity=maxVelocity.add(1)
	if (player.r.points.gte(3)) {
		maxVelocity=maxVelocity.times(Decimal.pow(1.1, player.r.points))
		acceleration=acceleration.times(Decimal.pow(1.1, player.r.points))
	}
	if (player.r.points.gte(4)){
		acceleration = acceleration.times(2)
	}
	if (player.r.points.gte(5)) {
		acceleration=acceleration.times(Decimal.pow(3, player.t.points))
		maxVelocity=maxVelocity.times(Decimal.pow(3, player.t.points))
	}
	if (player.r.points.gte(6)) {
		acceleration=acceleration.times(Decimal.pow(1.975, player.r.points))
		maxVelocity=maxVelocity.times(Decimal.pow(1.975, player.r.points))
	}
	if (player.t.points.gte(2) && player.r.points.gte(3)){
		acceleration=acceleration.times(2)
		maxVelocity=maxVelocity.times(5)
		
	}
	if (player.t.points.gte(4)) acceleration=acceleration.times(3)
	if (player.r.points.gte(9)) maxVelocity=maxVelocity.times(Decimal.pow(1.1, player.r.points))
	if (player.r.points.gte(11)) acceleration=acceleration.times(2)
	if (hasAchievement("a",12)) acceleration=acceleration.times(1.1)
	if (hasAchievement("a",21)) maxVelocity=maxVelocity.times(1.1)
	if (hasAchievement("a",22)) acceleration=acceleration.times(1.05)
	if (hasAchievement("a",23)) acceleration=acceleration.times(1.2)
	if (hasAchievement("a",32)) acceleration=acceleration.times(1.8)
	if (hasAchievement("a",14)) {
		acceleration=acceleration.times(1.5)
		maxVelocity=maxVelocity.times(1.5)
	}
	if (hasAchievement("a",24)) maxVelocity=maxVelocity.times(1.25)
	if (hasAchievement("a",41)) maxVelocity=maxVelocity.times(1.5)
	if (player.ro.points.gt(0)) {
		maxVelocity=maxVelocity.times(maxVelocity.add(1).log10().pow(getRocketEffect()).add(1))
		acceleration=acceleration.times(acceleration.add(1).log10().pow(getRocketEffect()).add(1))
	}
	velocity = velocity.times(acceleration).min(maxVelocity)
	return velocity
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("1e12"))
}



// Less important things beyond this point!

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600000) // Default is 1 hour which is just arbitrarily large
}
