let modInfo = {
	name: "The Extended Tree",
	id: "tet",
	author: "Thien",
	pointsName: "points",
	discordName: "None. Don't ask about it.",
	discordLink: "https://example.com",
	changelogLink: "https://github.com/Thien-Hubbing/Extended-Tree/blob/master/changelog.md",
    offlineLimit: 3,  // In hours
    initialStartPoints: new Decimal(100), // Used for hard resets and new players
	endgame: new Decimal("e6.8e56"),
	specialEndgameText: "v1.4 Endgame: Get e6.80e56 Points and all the layers + upgrades.",
}

// Set your version in num and name
let VERSION = {
	num: "1.4.1",
	patch: 0,
	name: "The N/A Update",
}

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["doReset", "buy", "buyMax", "onPurchase", "blowUpEverything", "castAllSpells", "completeInBulk", "startMastery", "completeMastery"]

var alwaysKeepTheseVariables = ["primeMiles", "auto", "autoExt", "autoBld", "autoW", "autoGhost", "autoSE", "autoNN", "autoCore", "autoEvol", "autoNet", "keepPosNeg", "distrAll", "spellInput", "pseudoUpgs", "maxToggle"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return hasUpgrade("p", 11);
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new basePointGain()
	if (hasUpgrade("p", 12)) gain = gain.times(upgradeEffect("p", 12));
	if (hasUpgrade("p", 13)) gain = gain.times(upgradeEffect("p", 13));
	if (hasUpgrade("p", 22)) gain = gain.times(upgradeEffect("p", 22));
	if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) gain = gain.times(upgradeEffect("b", 11))
	if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("e"):false) && hasUpgrade("e", 12)) gain = gain.times(upgradeEffect("e", 12))
	if (hasAchievement("a", 21)) gain = gain.times(1.1);
	if (hasAchievement("a", 31)) gain = gain.times(1.5);
	if (inChallenge("h", 22)) return gain.times(player.s.unlocked?buyableEffect("s", 11):1).root(inChallenge("h", 31)?tmp.h.pointRoot31:1);
	
	if (player.b.unlocked) gain = gain.times(tmp.b.effect);
	if (player.g.unlocked) gain = gain.times(tmp.g.powerEff);
	if (player.t.unlocked) gain = gain.times(tmp.t.enEff);
	if (player.s.unlocked) gain = gain.times(buyableEffect("s", 11));
	if (player.h.unlocked) gain = gain.times(tmp.h.effect);
	if (player.q.unlocked) gain = gain.times(tmp.q.enEff);
	
	if (inChallenge("h", 31)) gain = gain.root(tmp.h.pointRoot31);
	if (hasUpgrade("ss", 43)) gain = gain.pow(gain.lt(tmp.ss.upgrades[43].endpoint)?1.1:1.01);
	if (hasUpgrade("hn", 31)) gain = gain.pow(1.05);
	//if (hasUpgrade("hp", 11)) gain = gain.pow(upgradeEffect("hp", 11));
	return gain
}

function getRow1to6Speed() {
	let speed = new Decimal(1);
	if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("t"):false) speed = speed.times(tmp.t.effect2)
	if (hasUpgrade("in", 22)) speed = speed.times(upgradeEffect("in", 22))
	if (hasUpgrade("fn", 24)) speed = speed.times(tmp.fn.enEff2)
	if (player.hd.unlocked) speed = speed.times(buyableEffect("hd", 11))
	return speed;
}

function basePointGain() {
	let base = new Decimal(1);
	return base;
}

function debugFastPace() {
	console.log("Unlocking everything...")
	player.b.unlocked = true
	player.g.unlocked = true
	player.t.unlocked = true
	player.s.unlocked = true
	player.e.unlocked = true
	player.sb.unlocked = true
	player.sg.unlocked = true
	player.q.unlocked = true
	player.h.unlocked = true
	player.ss.unlocked = true
	player.o.unlocked = true
	player.ba.unlocked = true
	player.m.unlocked = true
	player.ps.unlocked = true
	player.hn.unlocked = true
	player.hs.unlocked = true
	player.n.unlocked = true
	player.i.unlocked = true
	player.ma.unlocked = true
	player.ge.unlocked = true
	player.mc.unlocked = true
	player.r.unlocked = true
	player.en.unlocked = true
	player.ne.unlocked = true
	player.id.unlocked = true
	player.ai.unlocked = true
	player.c.unlocked = true
	player.hp.unlocked = true
	player.in.unlocked = true
	player.fn.unlocked = true
	console.log("Powering point gain...")
	player.b.points = new Decimal("25000")
	player.g.points = new Decimal("32000")
	player.t.points = new Decimal("1500")
	player.s.points = new Decimal("1550")
	player.e.points = new Decimal("1e5e10")
	player.sb.points = new Decimal("300")
	player.sg.points = new Decimal("50")
	player.q.points = new Decimal("e6.53e9")
	player.h.points = new Decimal("e1.65e10")
	player.ss.points = new Decimal("32")
	player.o.points = new Decimal("e65000")
	player.ba.points = new Decimal("e4.32e7")
	player.m.points = new Decimal("e7.84e8")
	player.ps.points = new Decimal("2100")
	player.hn.points = new Decimal("e3.83e6")
	player.hs.points = new Decimal("e1e9")
	player.n.points = new Decimal("e50640")
	player.i.points = new Decimal("200")
	player.ma.points = new Decimal("26")
	player.ge.points = new Decimal("e472823")
	player.mc.points = new Decimal("e27402")
	player.en.points = new Decimal("1.87e47")
	player.r.points = new Decimal("1.87e47")
	player.ne.points = new Decimal("20")
	player.id.points = new Decimal("16")
	player.ai.points = new Decimal("4.874e37")
	player.c.points = new Decimal("15")
	player.in.points = new Decimal("55")
	player.hp.points = new Decimal("1e4e11")
	player.fn.points = new Decimal("15")
	console.log("Mastering Milestones...")
	player.b.best = new Decimal("25000")
	player.g.best = new Decimal("32000")
	player.t.best = new Decimal("1500")
	player.s.best = new Decimal("1550")
	player.e.best = new Decimal("1e5e10")
	player.sb.best = new Decimal("300")
	player.sg.best = new Decimal("50")
	player.q.best = new Decimal("e6.53e9")
	player.h.best = new Decimal("e1.65e10")
	player.ss.best = new Decimal("32")
	player.o.best = new Decimal("e65000")
	player.ba.best = new Decimal("e4.32e7")
	player.ba.total = new Decimal("e4.32e7")
	player.m.best = new Decimal("e7.84e8")
	player.m.total = new Decimal("e7.84e8")
	player.ps.best = new Decimal("2100")
	player.hn.best = new Decimal("e3.83e6")
	player.hn.total = new Decimal("e3.83e6")
	player.hs.best = new Decimal("e1e9")
	player.n.best = new Decimal("e50640")
	player.i.best = new Decimal("200")
	player.ma.best = new Decimal("26")
	player.ge.best = new Decimal("e472823")
	player.mc.best = new Decimal("e27402")
	player.en.best = new Decimal("1.87e47")
	player.r.best = new Decimal("1.87e47")
	player.r.total = new Decimal("1.87e47")
	player.ne.best = new Decimal("20")
	player.id.best = new Decimal("16")
	player.ai.best = new Decimal("4.874e37")
	player.c.best = new Decimal("15")
	player.in.best = new Decimal("55")
	player.hp.total = new Decimal("1e4e11")
	player.fn.best = new Decimal("15")
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	if (modInfo.endgame.eq(1/0)) return false;
	else return player.points.gte(modInfo.endgame)
}



// Less important things beyond this point!

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return("3.6e10") // Default is 1 hour which is just arbitrarily large
}

// Variables that must be defined to display notifications
var activeNotifications = [];
var notificationID = 0;

// Function to show notifications
function addNotification(type="none",text="This is a test notification.",title="",timer=3) {
	switch(type) {
		case "achievement":
			notificationTitle = "Achievement Unlocked!";
			notificationType = "achievement-notification"
			break;
		case "milestone":
			notificationTitle = "Milestone Gotten!";
			notificationType = "milestone-notification"
			break;
		case "challenge":
			notificationTitle = "Challenge Complete";
			notificationType = "challenge-notification"
			break;
		default:
			notificationTitle = "Something Happened?";
			notificationType = "default-notification"
			break;
	}
	if(title != "") notificationTitle = title;
	notificationMessage = text;
	notificationTimer = timer; 

	activeNotifications.push({"time":notificationTimer,"type":notificationType,"title":notificationTitle,"message":(notificationMessage+"\n"),"id":notificationID})
	notificationID++;
}


//Function to reduce time on active notifications
function adjustNotificationTime(diff) {
	for(notification in activeNotifications) {
		activeNotifications[notification].time -= diff;
		if(activeNotifications[notification]["time"] < 0) {
			activeNotifications.splice(notification,1); // Remove notification when time hits 0
		}
	}
}