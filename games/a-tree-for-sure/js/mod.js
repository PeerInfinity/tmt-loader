let modInfo = {
	name: "A Tree For Sure",
	id: "thismodsurewaswrittenbymsliaghtlyd",
	author: "MsliAghtlyD",
	pointsName: "questions",
	modFiles: ["clumys.js", "tree.js", "achievements.js", "globalc.js", "ffgang.js", "theodesp.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.04999d",
	name: "A beginning",
}

let changelog = `<h1>Changelog:</h1><br><br>
	<h3>v0.0</h3><br>
		- Added things.<br>
		- Added stuff.<br><br>
	<h3>v0.01</h3><br>
		- A day has passed.<br>
		- Added first challenge.<br>
		- Cookie breaks loose<br>
		- Added Achievements<br>
		- Added first Changelog entry<br>
		- Corrected a few bug<br>
		- Created a lot more<br><br>
	<h3>v0.02</h3><br>
		- A day has passed<br>
		- Added two more challenge<br>
		- Tried to implement keeping clue upgrades<br>
		- Made milestones to automate clue gain<br>
		- Clue upgrade cannot be kept, Cookie time is too powerful<br>
		- Made another changelog entry<br>
		- Made first secret Achievement<br>
		- Corrected a few bug<br>
		- Created a lot more<br><br>
	<h3>v0.03</h3><br>
		- A day has passed<br>
		- Succesfully implemented keeping clue upgrades<br>
		- Created Despair to contain Cookie<br>
		- Added fourth mystery challenge<br>
		- Added new Changelog entry<br>
		- Corrected a few bug<br>
		- Created a lot more<br><br>
	<h3>v0.035</h3><br>
		- Four days have passed<br>
		- Made Theory though still completely empty<br>
		- Made some corrections on the descriptions all around<br>
		- Third mystery upgrade finally has an effect<br>
		- Found out game version was still "0.01"<br>
		- Made second secret achievement <br>
		- Corrected a few bugs<br>
		- Created a lot more<br><br>
	<h3>v0.0351</h3><br>
		- Almost two full years have passed<br>
		- Changed a lot of things that felt wrong<br>
		- Added an "effect" to first secret upgrade<br>
		- Added some theory upgrades and changed their use<br>
		- Created a galaxy account to try to finally get feedback<br>
		- Endgame has not moved, but Theory started to get a bit more fleshed out<br>
		- Corrected a few bugs<br>
		- Created a lot more<br><br>
	<h3>v0.0352</h3><br>
		- Achievement layer's effect is fixed<br>
		- Basically I figured out how to make layer effect, so mystery and theory don't have to use convoluted formulas anymore<br>
		- Theory got a buyable and two upgrades, but is still the current endgame<br>
		- Thank you galaxy for all the warm comments<br>
		- Corrected a few bugs<br>
		- Created a lot more<br><br>
	<h3>v0.04</h3><br>
		- Theory layer is not the endgame anymore<br>
		- Asked around in the tmt for some help and made changes around thanks to the kind souls over there<br>
		- Added a theory buyable and challenge, and two new, completely empty layers<br>
		- Hopefully my next update will not be in two full years<br>
		- Added a third secret achievement that gives a nice boost <br>
		- Corrected a few bugs<br>
		- Created a lot more<br><br>
	<h3>v0.0425</h3><br>
		- Being able to 3rd layer reset is not the endgame anymore<br>
		- Started filling the forum layer<br>
		- Friends layer is now mostly empty so you cannot reset it first (for now)<br>
		- Found out how to hide a layer until a specific upgrade is bought (definitely did'nt take me more than five days)<br>
		- Put some achievements here and there and did the groundwork for friend layer<br>
		- Corrected a few typso<br>
		- Corrected a few bugs<br>
		- Created a lot more<br><br>
	<h3>v0.04251</h3><br>
		- Rebalanced end of theory layer<br>
		- Added two new upgrades<br><br>
	<h3>v0.045</h3><br>
		- You can now choose to start with the friends path<br>
		- Started filling the friends layer<br>
		- Added some upgrades, a new buyable, here and there<br>
		- You cannot continue playing after unlocking the other choice though<br>
		- Corrected a few typso<br>
		- Corrected a few bugs<br>
		- Created a lot more<br><br>
	<h3>v0.0475</h3><br>
		- Friend layer has been continued until Forum acts as chosen first (though forum acting this way has not been coded yet)<br>
		- Added a challenge, some upgrades and no achievements<br>
		- Theory upgrades and achievements are automatically resetted to avoid cheating (for the next two or three updates, so beware)<br>
		- Learned how to edit the display of layers<br>
		- Learned how to use pop ups<br>
		- Next time (except if I have to do a patch soon) I'm focusing on the forum layer, and putting the finishing touches on these two layers<br>
		- Corrected a few typso<br>
		- Corrected a few bugs<br>
		- Created a lot more<br><br>
	<h3>v0.0499</h3><br>
		- Forum layer has been continued until Friends acts as chosen first<br>
		- Added some upgrades and achievements<br>
		- Theory upgrades and achievements are automatically resetted to avoid cheating (for the next one or two updates, so beware)<br>
		- Friends and Forum can now act as if chosen first, even if they were not<br>
		- Had the idea of not being v0.05 because I'm sure I'll need to patch things up<br>
		- Finishing touches have been made on the Forum / friends layer, I'll code what comes next this week or the next<br>
		- I had to Lock down Forum and Friends layers since v0.0475 because I changes some prices and order of upgrades and was scared I'd have to reset the progress. So now it's not hidden anymore<br>
		- Corrected a few typso<br>
		- Corrected a few bugs<br>
		- Created a lot more<br><br>
	<h3>v0.04995</h3><br>
		- You can now enter mystery challenges again<br><br>
	<h3>v0.04997</h3><br>
		- Well it's been more like almost a year actually<br>
		- The code has been somewhat optimised, or at least, I think so<br>
		- Added a few upgrades and achievements<br>
		- No more resetting theory upgrades or related achievements but secret achievements have been rolled back<br>
		- The endgame has been pushed back a very little bit<br>
		- The next layer has been added<br>
		- Added some achievements features<br>
		- Corrected a few typso<br>
		- Corrected a few bugs<br>
		- Created a lot more<br><br>
	<h3>v0.049971</h3><br>
		- Passive generation cannot be negative anymore<br>
		- The Theory upgrade that doubles friend capacity is now kept on friend reset again but does not infinitely replicate anymore<br><br>
	<h3>v0.049971a</h3><br>
		- Forum upgrades now clearly state that they require, but don't cost anything<br>
		- Version is not gonna be changed for such a small change (also due to still having the secrets achievements being rolled back for a while)<br><br>
	<h3>v0.049975</h3><br>
		- Started adding content on the Global Conspiracy layer<br>
		- Restrained Cookie<br>
		- Worked on the content for the GC layer's next update<br>
		- Releasing it fast because GC is made by tweaking the game so I'm sure I made it very wonky-ly and want/need some testers firsts<br>
		- Corrected a few typso<br>
		- Corrected a few bugs<br>
		- Created a lot more<br><br>
	<h3>v0.04999</h3><br>
		- Global Conspiracy layer is fully created<br>
		- Added a few upgrades, milestones, challenges, achievements, but no buyable, truly an update<br>
		- The endgame has been pushed back quite a lot<br>
		- Mainly a content upgrade<br>
		- Split the layers in different files for readability<br>
		- Corrected a few typso<br>
		- Corrected a few bugs<br>
		- Created a lot more<br><br>
	<h3>v0.04999a</h3><br>
		- Added a new locked tooltip for the friends and forum layers so people would be sure it was not just a bug<br>
		- Theory upgrades are now spliced correctly again<br>
		- Added a cap to clue upgrades and theory layer effect to prevent infinite exponention<br>
		- Fixed the whole secret achievements clue again<br>
		- Fixed a bug where you could tame cookie but never get the related achievement<br>
		- Added more precision on where the cured [thing] was<br>
		- Corrected a few typso<br><br>
	<h3>v0.04999b</h3><br>
		- Corrected the whole secret achievement count again<br><br>
	<h3>v0.04999c</h3><br>
		- Fixed a bug where you could lose your cures and a buyable<br><br>
	<h3>v0.04999d</h3><br>
		- Started working on the next upgrade, should be the last fix<br>
		- Fixed a bug where you could lose your cures and a buyable (yes again)<br><br>
		`
	

	

let winText = `Congratulations! You have reached the end and beaten this game, now wait for a game breaking upgrade that requires you to reset everything !`

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
	if (hasUpgrade('c', 11)) gain = new Decimal(1)
	if (hasUpgrade('c', 12)) gain = gain.times(3)
	if (hasUpgrade('c', 13)) gain = gain.times(upgradeEffect('c', 13))
	if (hasUpgrade('c', 21)) gain = gain.times(upgradeEffect('c', 21))
	if (hasUpgrade('m', 12)) gain = gain.times(upgradeEffect('m', 12))
	if (hasUpgrade('c', 22)) gain = gain.pow(upgradeEffect('c', 22))
	if (player.t.unlocked) gain = gain.times(tmp["t"].effect)
	if (hasMilestone('fo', 1)) gain = gain.pow(1.2)
	if (hasMilestone('fo', 2)) gain = gain.pow(1.25)
	if (hasUpgrade('t', 23)) gain = gain.times(100)
	if (hasUpgrade('t', 51)) gain = gain.times(100)
	if (player.g.unlocked) gain = gain.times(tmp["g"].effect)

	if (inChallenge('d', 11)) gain = gain.pow(0.1)
	if (inChallenge('m',11)) gain = gain.pow(0.8)
	if (inChallenge('m',13)) gain = gain.pow(0.5)
	if (inChallenge('m', 14)) if (hasUpgrade('c', 22)) gain = gain.pow(8)
	
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	function(){return"Current endgame: 74 forums"},
]

// Determines when the game "ends"
function isEndgame() {
	return(player.fo.points.gte(74))
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
	player.a.seam = new Decimal(0)
	if(player.a.achievements.includes("16")) player.a.seam = player.a.seam.add(1)
	if(player.a.achievements.includes("23")) player.a.seam = player.a.seam.add(1)
	if(player.a.achievements.includes("25")) player.a.seam = player.a.seam.add(1)
	if(player.a.achievements.includes("37")) player.a.seam = player.a.seam.add(1)
	if(player.a.achievements.includes("53")) player.a.seam = player.a.seam.add(1)
	player.a.sea = new Decimal(0)
	if(player.a.achievements.includes("19")) player.a.sea = player.a.sea.add(1)
	if(player.a.achievements.includes("29")) player.a.sea = player.a.sea.add(1)
	if(player.a.achievements.includes("39")) player.a.sea = player.a.sea.add(1)
	if(player.a.achievements.includes("41")) player.a.sea = player.a.sea.add(1)
	if(player.a.achievements.includes("42")) player.a.sea = player.a.sea.add(1)
	if(new Decimal(getBuyableAmount('g', 12)).gte(2)) setBuyableAmount('g', 12, new Decimal(getBuyableAmount('g', 12)).mul(0).add(1))
	if(new Decimal(getBuyableAmount('g', 11)).gte(1)) player.g.buyon = true
	if(new Decimal(getBuyableAmount('g', 12)).gte(1)) player.g.buyto = true
	if(new Decimal(getBuyableAmount('g', 21)).gte(1)) player.g.buytre = true
}
