let modInfo = {
	name: "The Milestone Tree",
	id: "cpt_miletree",
	author: "loader3229",
	pointsName: "points",
	modFiles: [
	"layers/milestone.js",
	"layers/prestige.js",
	"layers/super-prestige.js",
	"layers/meta-milestone.js",
	"layers/prestige-boost.js",
	"layers/hyper-prestige.js",
	"layers/atomic-prestige.js",
	"layers/transcend.js",
	"layers/hyper-boost.js",
	"layers/prestige-energy.js",
	"layers/super-energy.js",
	"layers/extra-milestone.js",
	"layers/hyper-energy.js",
	"layers/upgraded-milestone.js",
	"layers/atoms.js",
	"layers/reincarnate.js",
	
	"layers/extend/prestige-power.js",
	"layers/extend/exotic-prestige.js",
	"layers/extend/multiverse-prestige.js",
	"layers/extend/corruptions.js",
	
	"checkdomain.js",
	
	"tree.js"],

	discordName: "loader3229's Discord Server",
	discordLink: "https://discord.gg/jztUReQ2vT",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 24,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "1.275",
	name: "The Parallel Multiverse"
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v1.275 - 2025/8/31</h3><br>
		- Added 12 milestones<br>
	<h3>v1.263 - 2024/6/8</h3><br>
		- Added 18 milestones<br>
		- Added a Reincarnation Challenge<br>
		- Added a Multiverse Prestige Challenge<br>
	<h3>v1.245: The Parallel Multiverse - 2024/6/5</h3><br>
		- Added 18 milestones<br>
		- Ported Exotic Prestige from Seder's NG+<br>
		- Ported Multiverse Prestige from Seder's NG+<br>
	<h3>v1.227: The Parallel Universe - 2024/6/4</h3><br>
		- Added 7 milestones<br>
		- Added an atomic-prestige buyable<br>
		- Added a transcend buyable<br>
		- Ported Prestige Power from Seder's NG+<br>
	<h3>v1.220 - 2024/6/3</h3><br>
		- Added 9 milestones<br>
		- Added 2 hyper boost upgrades<br>
	<h3>v1.211 - 2024/6/2</h3><br>
		- Added 1 milestone<br>
		- Added 1 reincarnate buyable<br>
		- Rebalanced Early Game<br>
	<h3>v1.210 - 2024/5/28</h3><br>
		- Added 5 milestones<br>
		- Added 1 extra-milestone<br>
		- Added 1 atom upgrade<br>
	<h3>v1.205 - 2024/5/28</h3><br>
		- Added 5 milestones<br>
		- Added 1 extra-milestone<br>
		- Added 2 atom upgrades<br>
		- Added 3 reincarnate buyables<br>
	<h3>v1.200   The Big Reset - 2024/5/27</h3><br>
		- Added 10 milestones<br>
		- Added reincarnate...<br>
		- The Tree is becoming unstable so cannot read the full changelog.<br>
	<h3>v1.190   The Unstable Update - 2024/5/25</h3><br>
		- Added 10 milestones<br>
		- Added 1 meta-milestone<br>
		- Added 1 extra-milestone...<br>
		- The Tree is becoming unstable so cannot read the full changelog.<br>
	<h3>v1.180 - 2024/5/21</h3><br>
		- Added 10 milestones<br>
		- Added 1 meta-milestone<br>
		- Added 1 extra-milestone<br>
		- Added 2 hyper-energy upgrades<br>
		- Added 1 transcend challenge<br>
		- Added atoms<br>
	<h3>v1.170 - 2024/5/20</h3><br>
		- Added 5 milestones<br>
		- Added 1 meta-milestone<br>
		- Added 1 extra-milestone<br>
		- Added 1 hyper-prestige upgrade<br>
		- Added 1 transcend upgrade<br>
	<h3>v1.165 - 2024/5/20</h3><br>
		- Added 5 milestones<br>
		- Added 1 extra-milestone<br>
		- Added 1 hyper-prestige upgrade<br>
		- Added 1 super-energy upgrade<br>
		- Added 1 transcend upgrade<br>
	<h3>v1.160 - 2024/2/2</h3><br>
		- Added 5 milestones<br>
		- Added 1 meta-milestone<br>
		- Added 1 prestige buyable<br>
		- Added 1 hyper-prestige upgrade<br>
		- Added 2 super-energy upgrades<br>
		- Added 2 hyper-energy upgrades<br>
		- Added 1 transcend upgrade<br>
		- Added 1 transcend challenge<br>
	<h3>v1.155 - 2024/2/1</h3><br>
		- Added 5 milestones<br>
		- Added 1 meta-milestone<br>
		- Added 1 extra-milestone<br>
		- Added 1 super-energy upgrade<br>
		- Added a new layer with 1 upgrade<br>
	<h3>v1.150.1 - 2024/1/29</h3><br>
		- Ported The Milestone Tree to The Modding Tree 2.6.6.2<br>`;

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

function getPointGen() {
	var b=getPointGenBeforeSoftcap();var sc=getPointSoftcapStart().log10();
	if(b.gte(getPointSoftcapStart())){
		if(player.t.activeChallenge==22||player.t.activeChallenge==32||player.t.activeChallenge==42){
			return getPointSoftcapStart();
		}
		while(b.log10().gte(sc)){
			let potency=0.4;
			if(hasUpgrade("t",53))potency=potency*0.9;
			b=Decimal.pow(10,b.log10().div(sc).pow(1-potency).mul(sc));
			sc=sc.mul(20);
		}
	}
	b=b.min(getPointHardcapStart());
	if(sha512_256(localStorage.supporterCode).slice(0,2) == 'b4' && window.supporterCodeInput){return b.mul(10)}
	return b
}



function getPointGenBeforeSoftcap() {
	var b=new Decimal(0)
	if(player.m.effective.gte(1))b=b.add(1);
	if(player.m.effective.gte(2))b=b.mul(3);
	if(player.m.effective.gte(3))b=b.mul(tmp.m.milestone3Effect);
	if(hasUpgrade("p",11))b=b.mul(upgradeEffect("p",11));
	if(hasUpgrade("p",12))b=b.mul(upgradeEffect("p",12));
	if(hasUpgrade("sp",11))b=b.mul(upgradeEffect("sp",11));
	if(hasUpgrade("sp",12))b=b.mul(upgradeEffect("sp",12));
	if(hasUpgrade("hp",11))b=b.mul(upgradeEffect("hp",11));
	if(hasUpgrade("hp",12))b=b.mul(upgradeEffect("hp",12));
	if(hasUpgrade("ap",11))b=b.mul(upgradeEffect("ap",11));
	if(player.um.points.gte(2))b=b.pow(1.01);
	b=b.pow(tmp.cp.nBoostEffect);
	if(player.t.activeChallenge==11||player.t.activeChallenge==21||player.t.activeChallenge==31||player.t.activeChallenge==41)b=b.pow(layers.t.dilationEffect());
	if(player.cp.activeChallenge==201)b=b.pow(layers.cp.challenges[201].nerfEffect());
	if(player.ap.activeChallenge==22||player.r.activeChallenge==11)b=b.add(1).log10().pow(player.m.effective.gte(122)?player.m.points:100);
	return b
}

function getPointGenString(){
	return "("+format(getPointGen())+"/sec)";
}

function getPointSoftcapStart(){
	var sc=new Decimal("ee9");
	if(player.r.stage>=1)sc=new Decimal("ee11");
	if(player.r.stage>=2)sc=new Decimal("ee8");
	if(player.m.effective.gte(105))sc=sc.pow(tmp.m.milestone105Effect);
	if(player.t.activeChallenge==12||player.t.activeChallenge==22||player.t.activeChallenge==32||player.t.activeChallenge==42)sc=sc.pow(0.0001);
	sc=sc.pow(tmp.t.challenges[12].rewardEffect);
	sc=sc.pow(tmp.t.challenges[22].rewardEffect);
	sc=sc.pow(tmp.t.challenges[32].rewardEffect);
	sc=sc.pow(tmp.t.challenges[42].rewardEffect);
	if(hasUpgrade("ap",32))sc=sc.pow(upgradeEffect("ap",32));
	if(hasUpgrade("hb",11))sc=sc.pow(upgradeEffect("hb",11));
	if(hasUpgrade("pb",31))sc=sc.pow(upgradeEffect("pb",31));
	if(hasUpgrade("t",54))sc=sc.pow(upgradeEffect("t",54));
	sc=sc.pow(tmp.p.buyables[11].effect);
	if(hasUpgrade("pe",11))sc=sc.pow(upgradeEffect("pe",11));
	sc=sc.pow(tmp.sp.buyables[12].effect);
	sc=sc.pow(layers.t.getSpecialEffect(12));
	if(hasUpgrade("t",73))sc=sc.pow(upgradeEffect("t",73));
	if(hasUpgrade("se",11))sc=sc.pow(upgradeEffect("se",11));
	sc=sc.pow(layers.t.getSpecialEffect(22));
	if(hasUpgrade("he",11))sc=sc.pow(upgradeEffect("he",11));
	if(player.m.effective.gte(181) && player.um.points.gte(16)){
		sc=sc.pow(player.um.points.mul(0.0165).add(1));
	} else {
		if(player.um.points.gte(1))sc=sc.pow(Decimal.add(1.1,player.m.effective.gte(165)?player.um.points.mul(0.01):0));
	}
	sc=sc.pow(layers.t.getSpecialEffect(32));
	sc=sc.pow(layers.t.getSpecialEffect(42));
	if(hasUpgrade("a",11))sc=sc.pow(upgradeEffect("a",11));
	if(player.r.stage==0){
		if(player.m.effective.gte(199))sc=sc.pow(1+Math.random()*8);
		else if(player.m.effective.gte(198))sc=sc.pow(1+Math.random()*6);
		else if(player.m.effective.gte(197))sc=sc.pow(1+Math.random()*4);
		else if(player.m.effective.gte(196))sc=sc.pow(1+Math.random()*2);
		else if(player.m.effective.gte(195))sc=sc.pow(1+Math.random());
		else if(player.m.effective.gte(194))sc=sc.pow(1+Math.random()/2);
		else if(player.m.effective.gte(193))sc=sc.pow(1+Math.random()/3);
		else if(player.m.effective.gte(192))sc=sc.pow(1+Math.random()/4);
		else if(player.m.effective.gte(191))sc=sc.pow(1+Math.random()/6);
		else if(player.m.effective.gte(190))sc=sc.pow(1+Math.random()/8);
		else if(player.m.effective.gte(189))sc=sc.pow(1+Math.random()/10);
		else if(player.m.effective.gte(188))sc=sc.pow(1+Math.random()/20);
		else if(player.m.effective.gte(187))sc=sc.pow(1+Math.random()/30);
		else if(player.m.effective.gte(186))sc=sc.pow(1+Math.random()/40);
		else if(player.m.effective.gte(185))sc=sc.pow(1+Math.random()/60);
		else if(player.m.effective.gte(184))sc=sc.pow(1+Math.random()/80);
	}else sc=sc.pow(tmp.r.buyables[12].effect);
	sc=sc.pow(tmp.hp.buyables[21].effect);
	sc=sc.pow(tmp.ap.buyables[11].effect);
	sc=sc.pow(tmp.t.buyables[11].effect);
	if(hasUpgrade("pp",11))sc=sc.pow(upgradeEffect("pp",11));
	return sc.min(getPointHardcapStart());
}

function getPointHardcapStart(){
	return new Decimal("ee100");
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	function(){
		if(getPointGen().gte(getPointSoftcapStart().sqrt())){
			return "1st milestone's effect ^"+format(getPointGen().log(getPointGenBeforeSoftcap()),4)+" because of softcap.<br>1st milestone's softcap starts at "+format(getPointSoftcapStart());
		}
		return "";
	},
	function(){
		if(player.m.effective.gte(190)&&player.r.stage==0){
			return "The Milestone Tree is unstable now. Fixing The Milestone Tree... Milestone Requirement is increased.";
		}
		return "";
	}
]

// Determines when the game "ends"
function isEndgame() {
	return player.m.points.gte(MILESTONES.length);
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