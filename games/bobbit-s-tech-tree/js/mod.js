

function addedPlayerData() { return {
	col: "red",
	showAlchemy: false,
	showPS: false,
	showHub: false,
	hintMode: false,
	makeBlue: [],
	huCol: "orange",
	unlockedIds : [101],
	unlockedElems: ["Core"],
	unlocks: {"L": false,"PS": false,"N": false,"Dna": false,"PC": false,'Nu': false,'Nu': false,'Nu': false,'Nu': false,'Nu': false,'Nu': false,'Nu': false,'EC': false,'O': false,'T': false,'Cy': false,'M': false,'T': false,'T': false,'Cy': false,'M': false,'BFS': false,'FF': false,'S': false,'Co': false,'BC': false,'Tx': false,'Jf': false,'Sw': false,'F': false,'Air': false,'Lu': false,'Am': false,'Ogn': false,'Bl': false,'OS': false,'CS': false,'Mu': false,'R': false,'NS': false,'Br': false,'Mlk': false,'MG': false,'Ma': false,'P': false,'W': false,'Ms': false,'Gr': false,'VP': false,'Tr': false,'Pr': false,'Arm': false,'Ha': false,'Hu': false
	},
	counting: false,
	humanUnlock: false,
	lifeShow: true,
	hubWorld: false,
	showHumanity: false,
	lifeRow: 1,
	showCore: true,
	countdown: 5,
	discoveries: 0,
	lockDiscoveries: false,
	upgrade: false,
	upgrade2: false,
	upgrade3: false,
	upgrade4: false,
	upgrade5: false,
	upgrade6: false,
	upgrade7: false,
	bronze: false,

	display() {
		
		if (player.showHumanity == true) {
			
			return (format(player.countdown) + "s until next discovery!") 
			
		}
		else {
			return ""
		}
	}
}}
var timer=
    	setInterval(function(){
        if (player.showHumanity==true&&player.lockDiscoveries==false){
        if (player.countdown >0.01) {
            player.countdown-=0.01
			}
		else {
			if (player.lockDiscoveries == false)
			player.countdown = 5
			player.discoveries+=1
			
		}
        
        
    }}, 10)
let modInfo = {
	name: "Bobbit's Tech Tree",
	id: "btt",
	author: "Bobbitibob",
	pointsName: "",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 0,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.2",
	name: "Human to feudalism",
}

let changelog = `<h1>Changelog:</h1><br>

	<h3>v0.2</h3><br>
		- Added content up to feudalism<br>
		- Added hub world, a crucial feature in future updates<br>
		- Various improvements to the life to human phase<br>
		- Moved some nodes about to make the tree look slightly nicer<br><br>
	<h3>v0.1.1</h3><br>
	    - did the mod id thingy<br>
		- Added content up to humans.<br>
		`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    
}

// Determines if it should show points/sec
function canGenPoints(){
	return false
}

// Calculate points/sec!



// You can add non-layer related variables that should to into "player" and be saved here, along with default values
var time = 3

setInterval(function(){
	if (time>=1)
	time-=1
	
}, 100)

// Display extra things at the top of the page
function displayThings() {
	return [time]
}


// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("e280000000"))
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
	return gain
}
// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}

