let modInfo = {
	name: "Yet another Challenge Tree: Adventure",
	id: "chalmod",
	author: "new42ur3jeans",
	pointsName: "Challenge Power",
	modFiles: ["layers.js", "tree.js"],

	discordName: "42UR3ified_Ecolo#4052",
	discordLink: "https://discord.gg/ACfnuRpVSC",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "2.2.3.3",
	name: "MATH IS INFINITE",
}

let changelog = `<h1>Changelog:</h1><br>	
	<br>
	<h3>v2.2.3.3: MATH IS INFINITE </h3><br>
	- Math Addict challenge in Tier 4 is scaled better for players who picked Proton.<br>
	- Added a reminder of Strength Hunter (Tier 4) resetting a, b and c's values in Tier 3.<br>
	<br>
	<h3>v2.2.3.2: FIGHTING A HELL BUG </h3><br>
	- Once again attempted to fix the issue where clicking + on tier 3 occasionally makes the variable add in unintentional ways (hopefully, PLEASE).<br>
	<br>
	<h3>v2.2.3.1: I'm too careless </h3><br>
	- Accidentally forgot to uncomment the part responsible for the autocompletion of tier 4 challenges last release.<br>
	<br>
	<h3>v2.2.3: Can v2.2 be stable now please </h3><br>
	- <strike>ACTUALLY Fixed the issue where clicking + on tier 3 occasionally makes the variable add in the manner of strings (hopefully, PLEASE).</strike><b>WHY IS IT STILL ALIVE</b><br>
	- Scaled tier 4 dilemma challenges a BIT better I guess? <br>
	<br>
	<br>
	<h3>v2.2.2: TWO HOTFIXES IN A ROW</h3><br>
	- Modified the gain formulae for positive and negative points after 5th dilemma challenge completion to avoid logarithm by 0 NaN.<br>
	<br>
	<h3>v2.2.1: Decimals and Numbers</h3><br>
	- Adjusted some of the mathematical statements in tier 3 because it was reported people stopped getting points when clicking tier 3 buttons. <br>
	<br>
	<h3>v2.2: No longer a RobTop reference</h3><br>
	- Added the remaining 3 Dilemma Challenges to Tier 4. <br>
	- <strike>Fixed an issue where clicking + multiple times on tier 3 when starting at 0 would make the variable add in the manner of strings.</strike><b>TURNS OUT I DIDN'T WAUGHHHHHH</b><br>
	- Speaking of Tier 3, the leftmost buttons for Tier 3 are replaced with 1 because any value returning 0 halts production.<br>	
	<br>
	<h3>v2.(1 1/2): Fit-tertainment and QoL</h3><br>
	- Repeatable Challenges are now autocompleted as long as the player is inside the challenge. <br>
	- Added a mobile QoL button for mobile players to reset for tier 1 power in layer 2. <br>
	<br>
	<h3>v2.1: Balance Matters</h3><br>
	- Positive and Negative Point Nerfs are now exponented to ^0.5 so their reward would not be stuck at x10 without Dilemma Challenges.<br>
	- Effect of Positive and Negative Points now update based on Dilemma Challenge Effects.<br>
	<br>
	<h3>v2: Balance and Dilemma</h3><br>
	- TIER FOUR HYPEEEEEEEEE <br>
	- Added 2 Dilemma challenges to Tier 4 (5 planned).<br>
	<br>
	<h3>v1.2.2: A little visual improvement, I guess</h3><br>
		- Added a forgotten line break in the change log. <br>
		- The second clickable is now wide enough to contain the word 'HALF'.<br>
    <br>
	<h3>v1.2.1: I should really be more careful</h3><br>
		- forgot to change version number on the top right hand corner lol, fixed that <br>
	<br>
    <h3>v1.2: Only a little better than v1.1, but still more than a hotfix</h3><br>
		- Multiple Measures Prevents b from being 0 in 'As Medium As Division' (because division by 0 error). <br>
		- Reverted formula variable visualization back to bars due to mobile users' requests.<br>
		- Added more buttons around the variable bars for better QoL.<br>
		- The Changelog is more pleasing in the eyes.<br>
	<br>
    <h3>v1.1.2: Hotfix?</h3><br>
        - changed the line displaying at the top of the page because the NaN bug is dead lol.<br>
	<br>
	<h3>v1.1.1: Hotfix</h3><br>
		- Put back a forgotten line break on one of the challenges.<br>
		- Corrected the Author's Discord username.<br>
	<br>
    <h3>v1.1: IMPROVEMENT</h3><br>
		- DEFEATED THE NAN BUG<br>
		- Formatted the challenge goals of Tier 2.<br>
		- Kind of added some balance to Tier 3?<br>
		- Milestones of each layer are moved to the bottom of the tab.<br>
		- Tier 3 now uses sliders, no more clicking too many times!<br>
	<br>
	<h3>v1.0</h3><br>
		- Started Production.`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return hasChallenge("I", 11)
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
	if(hasChallenge("I",12)&&!inChallenge("II",12)&&!inChallenge("II",13)&&!inChallenge("II",14)&&!inChallenge("II",15)&&!inChallenge("IV",21))
	    gain = gain.times(player.I.points.times(0.1).plus(1))	
	if(inChallenge("I", 13)||inChallenge("II",15))
		gain = gain.times(0.1)
	if(hasChallenge("I",13)&&!inChallenge("IV",21))
		gain = gain.times(10)
	if(hasChallenge("I",14)&&!inChallenge("IV",21))
		gain = gain.pow(2)
	if(inChallenge("I",14)||inChallenge("II",15))
		gain = gain.pow(1/2)
	if(inChallenge("II", 13))
		gain = gain.pow(0.500 - challengeCompletions("II", 13) * 0.004)	
	gain = gain.times(player.II.points.times(tmp.II.effect).plus(1))
	if(inChallenge("II", 14))
		gain = gain.times(new Decimal.pow(0.001, challengeCompletions("II", 14) + 1))
	if(inChallenge("II",15)) {
		gain = gain.pow(0.500 - challengeCompletions("II", 15) * 0.004)	
		gain = gain.times(new Decimal.pow(0.001, challengeCompletions("II", 15) + 1))
	}
	if(!inChallenge("IV",22)) {
		gain = gain.times(new Decimal.pow(1000, challengeCompletions("II", 15)).plus(1))
	}
	gain = gain.times(new Decimal.pow(2,challengeCompletions("III",11))).times(new Decimal(player.III.formpts).add(1))	
	return gain
	
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	"Endgame: Complete either one of the last pair of Dilemma Challenge"
]

// Determines when the game "ends"
function isEndgame() {
	return (hasChallenge("IV",51)||hasChallenge("IV",52))
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