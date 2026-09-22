let modInfo = {
	name: "The Classic+ Tree",
	id: "classicPlusFull", // <- keep this unique! Change if you fork
	author: "You",
	pointsName: "points",
	modFiles: ["layers.js", "layers/universe.js", "layers/reality.js", "layers/singularity.js", "layers/omniverse.js", "layers/finality.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.9",
	name: "The Universe Switcher",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.9 — The Universe Switcher</h3><br>
		- <b>TRANSPORT IS NOW A REAL TELEPORT.</b> The Multiverse Transport Terminal became a <b>UNIVERSE SWITCHER</b> (new microtab on the Multiverse row) with three view modes: <b>scan</b>, <b>reel</b> and <b>swarm</b>.<br>
		- <b>Hard cut:</b> toggle it and teleporting parks the Classic+ hub entirely (invisible, unclickable — still ticking and still saving) and hands the whole viewport to the other tree, with a ◀ RETURN pill living inside that tree. <i>Esc</i> still works.<br>
		- <b>Σ ALL:</b> the mass-transport action — every sourced tree mounted at once in the swarm grid, behind a cap you can raise (and a confirmation, because 11 engines on one main thread is exactly as heavy as it sounds).<br>
		- <b>Multiverse Convergence (upgrade U-66):</b> the hub now reads each bundled game's <i>own</i> save off this origin and digests it — real progress inside PT: Rewritten, The Pro Tree, the Milestone Tree and the rest boosts the Universe effect by <b>+5%·√log₁₀(progress)</b> per realm, capped at x100 each. Playing the originals is finally optimal, not just sightseeing.<br>
		- The hub stops printing raw save keys: realm names are labelled everywhere, and <i>no file under</i> <b>trees/</b> <i>was modified for this</i> — the bridge reaches into each same-origin frame at runtime.<br>
		- <i>Also: Multiverse Scan (milestone 1) now describes a feature that exists, and</i> <code>test/multiverse_bridge_test.js</code> <i>+ </i><code>test/multiverse_dom_test.js</code> <i>cover the save-decoding formats, the bonus curve, the cap logic and the frame lifecycle.</i><br><br>
	<h3>v0.8 FULL RELEASE — The Omniverse, Finality & The Fifteen Realms</h3><br>
		- <b>NEW ROW 8: FINALITY (F)</b> — the layer beyond the Omniverse! Ascend with 25 Omniverse Energy and reach the <b>TRUE ENDING at 8 Finality</b>.<br>
		- <b>Finality content:</b> 14 upgrades (ending in THE END AND THE BEGINNING), the Eternal Spire (4 buyables: Eternal Spire, Apotheosis Engine, Chronos Terminal, Absolute Core), permanent <b>Sigils of Power</b>, <b>The Final Trigger</b> (30s of 1e10x points), 8 milestones, and <b>4 Final Challenges</b> culminating in THE FINAL CHALLENGE.<br>
		- <b>3 NEW UNIVERSES (15 total!)</b>: <b>The Galaxy Tree</b> (x3.4), <b>Synergism</b> (x3.6), and <b>The Circuit Tree</b> (x3.8) — unlocked by Universe upgrades 61-63, each with its own lore, progress bar, buyables and microtab.<br>
		- <b>Filled the empty universes:</b> TMT Demo, Incrementreeverse, The Basic Tree, and The Milestone Tree finally have their own buyables, bars, lore and microtabs (15 new Universe buyables!).<br>
		- <b>Universe expanded:</b> upgrades 61-65 (unlock deep realms, Universe effect ^1.15, active bonus ^1.5), milestones 6-7 (+0.5 / x2 active bonus), and passive Universe generation (upgrade 13 + milestone 3 now really work!).<br>
		- <b>Singularity expanded:</b> upgrades 51-53 (Eternal Collapse, Multiverse Overlord, Singularity Dominion), the missing <b>Rift Omega+</b> challenge, and previously-displayed-but-fake effects now implemented: Rift Alpha x10, milestone ^1.2/^2/^5 exponents, Infinite Singularity softcap removal, Singulon doubling, and grid ^1.5.<br>
		- <b>Omniverse expanded:</b> upgrades 51-53 (Final Horizon, Transfinite Matrix, Omega Paragon), Omega Reactor & Transfinite Loom buyables, a 5th Omega Challenge (<b>Final Omega</b>), Omniverse Cores /10 cost at milestone 6, and the Infinity Engine exponent now truly applies.<br>
		- <b>Reality expanded:</b> upgrades 41-43 (Hyperstability, Resonant Collapse, Stability Overload with a 1,000 Stability cap); Cosmic Fabric's hidden ^1.25 now applies.<br>
		- <b>Eternity expanded:</b> Singularity upgrade 31 now boosts Eternity gain, and Eternity upgrade 43's milestone boost now applies to Universe gain.<br>
		- <b>14 NEW ACHIEVEMENTS (Rows 25-26)</b>: Finality Dawns, TRUE ENDING, Fifteen Realms, Finality Conqueror, Transfinite, The Final Number, The Whole Tree, and more.<br>
		- <b>New Official Save Bank presets:</b> Finality start, TRUE ENDING, and ABSOLUTE FINALITY (25 F).<br>
		- <b>Mastery & Stats updated</b> to track all 14 core layers and 15 universes.<br>
		- <i>This is the full release of v0.8. Your v0.8 dev preview saves carry over automatically!</i><br><br>
	<h3>v0.8 Dev Preview - The Omniverse & Expanded Multiverse</h3><br>
		- <b>NEW ROW 7: The Omniverse (Ω / O)</b> — the ultimate metaphysical layer above Singularity, transcending all multiverse timelines into pure Omniverse Energy.<br>
		- <b>4x4 Omni-Matrix Grid</b> (16 cosmic synthesis cells) — synthesize Void (🌌) → Particle (⚛️) → Energy (💠) → Singulon (🔮) → Omniverse (👑) for monumental exponential multipliers.<br>
		- <b>4 Omniverse Cores (Buyables)</b>: Cosmic Synthesizer (point & Singularity multiplier), Dimensional Loom (O energy multiplier), Chrono-Nexus (Field speed), and Infinity Engine (overall exponent booster).<br>
		- <b>15 Omniverse Upgrades</b>: Transfinite Awakening, Multiverse Synthesis, Reality-Singularity Bridge, Cosmic Field, Omni-Matrix Unlocked, Core Resonance, Transfinite Rift, Automated Synthesis, Multiverse Transcendence, Omnipresent Horizon, Ultimate Compression, Temporal Transcendence, Cosmological Constant, Omniverse Singularity Loop, The Absolute Omega.<br>
		- <b>4 Omega Challenges</b>: Omega Void (^0.02 power limit), Paradox Matrix (disabled Reality & Singularity), Chrono-Freeze (10% game speed), and Grand Omega Multiverse (all penalties combined).<br>
		- <b>8 Omniverse Milestones</b>: Automated Singularity resets, passive Singularity gain (100%/s), automatic Omni-Grid synthesis, and Transcendent Victory at 50 O.<br>
		- <b>5 NEW COMMUNITY UNIVERSES (12 Total in Multiverse Hub!)</b>:<br>
			• <b>Universe DIM (PT: Dimensions by loader3229)</b> — 10488 lines, Spatial Shards, Dimension 1-2, Dimension Boost, x2.5 active bonus.<br>
			• <b>Universe PART (The Particle Increment Tree by cokecole526)</b> — 614 lines, Electrons, Protons, Neutrons, Quarks, x2.6 active bonus.<br>
			• <b>Universe PRO (The Pro Tree by chuangyou123)</b> — 240,000+ lines (40+ layers), Ants, Grass, Supernova Core, Void Energy, x2.8 active bonus.<br>
			• <b>Universe DICE (The Dice Tree by chuangyou123)</b> — 60649 lines, D6/D12/D20 Rollers, Pip Multipliers, Luck Charm, x3.0 active bonus.<br>
			• <b>Universe NG (PT: Rewritten NG+ by Seder3214)</b> — 12492 lines, NG+ Boosters, Meta-Generators, Hyper-Time Warp, x3.2 active bonus.<br>
			• Alongside Classic 1.0, PT: Rewritten, TMT Demo, Incrementreeverse, The Basic Tree, The Milestone Tree, and Classic+ Hub.<br>
		- <b>Core Layer Expansions</b>: Reality upgrades 33-34 and Omni Dimension buyable; Singularity Singular Horizon buyable and Omnipresent Rift challenge; expanded Mastery side layer tracking all 13 core layers and 12 universes.<br>
		- <b>25+ New Achievements (Rows 22-24)</b>: Omniverse Awakened, Matrix Synthesizer, Grand Omega Conqueror, Master of Twelve Realms, and Transfinite Milestones.<br>
		- <b>Official Save Bank Expanded</b>: Added premade saves for Omniverse Start, Dimensions Tree, Particle Tree, Pro Tree, Dice Tree, NG+ Tree, and 100% Mastery Endgame.<br>
		- <i>Developer Preview — Balance and endgame tuning in progress!</i><br><br>
	<h3>v0.7.5 - Buy Max Everything (below Eternity)</h3><br>
		- <b>Every buyable below Eternity (P, B, G, M, T, W, H, Q) is now buy-maxable</b>: click buys as many levels as you can afford, Shift+click buys a single level.<br>
		- Static layers below Eternity now buy max on prestige: B no longer needs milestone 2, and H + Q get it from the start.<br>
		- B milestone 2 (6 boosters) reworked to "B cost /1.5" since buy max is free now.<br>
		- Eternity and above (E, U, R, S) are unchanged - still one at a time.<br><br>
	<h3>v0.7.4 - Notation & Save Fixes</h3><br>
		- Fixed Eternal Notations factory presets (Simplified Written and Numeric Dominoes).<br>
		- Fixed Warp upgrade 32 auto-reset loop by adding an ON/OFF toggle on Warp milestone 1.<br><br>
	<h3>v0.7 - Singularity & Mastery</h3><br>
		- <b>NEW ROW 6: Singularity (S)</b> — the ultimate endgame layer, merging Universe (U) and Reality (R) branches.<br>
		- Collapse Grid (3x3), Singularity Field, Rift Challenges, Singulon Cores.<br>
		- Mastery side layer (MA) tracking game completion percentage.<br><br>
	<h3>v0.6 - Fractured Reality</h3><br>
		- <b>NEW ROW 5 BRANCH: Reality (R)</b> — Reality Shards, Stability, Dimension buyables.<br><br>
	<h3>v0.5 - Eternal Notations (by MathCookie17)</h3><br>
		- 146 Notation options including Colored Dominoes, Scientific, Infinity, Eternity.<br><br>
	<h3>v0.4 - Multiverse (Universe Layer)</h3><br>
		- Universe travel and ported community trees.<br><br>
	<h3>v0.3 - Way More Content</h3><br>
		- Mana, Warp, Quantum, Eternity layers added.<br><br>
	<h3>v0.1 - The Classic+ Starter</h3><br>
		- Initial 5 layers.<br>`

let winText = `Congratulations! You have reached the <b>TRUE ENDING</b> of the Classic+ Tree v0.8 Full Release!<br><br> You attained 8 Finality — the point beyond the Omniverse where every timeline, every reality, and all fifteen multiverse realms became one. You have achieved <b>Absolute Transcendent Finality</b>.<br><br> The tree continues beyond: 25 Finality (ABSOLUTE FINALITY), all 4 Final Challenges, and 100% Mastery await.`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
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

	let gain = new Decimal(1)
	// P upgrades
	if (hasUpgrade('p', 11)) gain = gain.times(2)
	if (hasUpgrade('p', 12)) gain = gain.times(upgradeEffect('p', 12))
	if (hasUpgrade('p', 13)) gain = gain.times(upgradeEffect('p', 13))
	if (hasUpgrade('p', 32)) gain = gain.times(upgradeEffect('p', 32))
	// Row 1 effects
	if (tmp.g.effect) gain = gain.times(tmp.g.effect)
	if (tmp.b.effect) gain = gain.times(tmp.b.effect)
	if (tmp.m.effect) gain = gain.times(tmp.m.effect)
	// Row 2
	if (tmp.t.effect) gain = gain.times(tmp.t.effect)
	if (tmp.w.effect) gain = gain.times(tmp.w.effect)
	// Row 3
	if (tmp.h.effect) gain = gain.times(tmp.h.effect)
	if (tmp.q.effect) gain = gain.times(tmp.q.effect)
	// Row 4
	if (tmp.e.effect) gain = gain.times(tmp.e.effect)
	// Row 5 branches - Universe and Reality
	if (tmp.u && tmp.u.effect && !(player.r && inChallenge('r', 11)) && !(player.o && inChallenge('o', 12))) gain = gain.times(tmp.u.effect)
	if (tmp.r && tmp.r.effect && !inChallenge('r', 11) && !(player.o && inChallenge('o', 12))) gain = gain.times(tmp.r.effect)
	if (player.r && hasUpgrade('r', 11)) gain = gain.times(upgradeEffect('r', 11))
	if (player.r && hasMilestone('r', 0)) gain = gain.times(2)
	if (player.r && hasUpgrade('r', 34)) gain = gain.times("1e100")
	// Row 6 - Singularity
	if (player.s2 && player.s2.unlocked && !(player.o && inChallenge('o', 12))) {
		if (tmp.s2 && tmp.s2.effect) gain = gain.times(tmp.s2.effect)
		try { if (layers.s2 && typeof layers.s2.getGridEffect === 'function') gain = gain.times(layers.s2.getGridEffect()) } catch(e) {}
		if (hasUpgrade('s2', 13)) gain = gain.times("1e50")
		if (hasUpgrade('s2', 14) && player.s2.field) gain = gain.times(player.s2.field.add(1).pow(0.5))
		if (hasUpgrade('s2', 33)) gain = gain.pow(1.5)
		try { if (typeof buyableEffect === 'function' && tmp.s2 && tmp.s2.buyables && tmp.s2.buyables[12]) gain = gain.times(buyableEffect('s2', 12)) } catch(e) {}
		try { if (typeof buyableEffect === 'function' && tmp.s2 && tmp.s2.buyables && tmp.s2.buyables[13]) gain = gain.times(buyableEffect('s2', 13)) } catch(e) {}
	}
	// Row 7 - The Omniverse (Ω)
	if (player.o && player.o.unlocked && !(player.f && inChallenge('f', 12))) {
		if (tmp.o && tmp.o.effect) gain = gain.times(tmp.o.effect)
		try { if (layers.o && typeof layers.o.getGridEffect === 'function') gain = gain.times(layers.o.getGridEffect()) } catch(e) {}
		if (hasUpgrade('o', 14) && player.o.field) gain = gain.times(player.o.field.add(1).pow(0.5))
		if (hasUpgrade('o', 43)) gain = gain.times("1e500")
		if (hasMilestone('o', 0)) gain = gain.times(10)
		if (hasMilestone('o', 6)) gain = gain.pow(1.2)
		if (hasChallenge('o', 14)) gain = gain.times("1e100")
		try { if (typeof buyableEffect === 'function' && tmp.o && tmp.o.buyables && tmp.o.buyables[11]) gain = gain.times(buyableEffect('o', 11)) } catch(e) {}
	}
	// Row 8 - Finality (F)
	if (player.f && player.f.unlocked) {
		if (tmp.f && tmp.f.effect) gain = gain.times(tmp.f.effect)
		if (hasUpgrade('f', 43)) gain = gain.times("1e1000")
		if (hasMilestone('f', 0)) gain = gain.times("1e10")
		try { if (tmp.f && tmp.f.buyables && tmp.f.buyables[11]) gain = gain.times(buyableEffect('f', 11)) } catch(e) {}
		try { if (tmp.f && tmp.f.buyables && tmp.f.buyables[13]) gain = gain.times(buyableEffect('f', 13)) } catch(e) {}
		if (hasMilestone('f', 7)) gain = gain.pow(1.05)
	}
	// Omniverse cores that act on all point gain (Infinity Engine exponent, Omega Reactor)
	if (player.o && player.o.unlocked && !(player.f && inChallenge('f', 13))) {
		try { if (tmp.o && tmp.o.buyables && tmp.o.buyables[14]) gain = gain.pow(buyableEffect('o', 14)) } catch(e) {}
		try { if (tmp.o && tmp.o.buyables && tmp.o.buyables[15]) gain = gain.times(buyableEffect('o', 15)) } catch(e) {}
	}
	// Buyable point boosts
	let fNoBuyables = player.f && inChallenge('f', 13)
	if (!fNoBuyables && tmp.g.buyables && tmp.g.buyables[12]) gain = gain.times(buyableEffect('g', 12))
	if (!fNoBuyables && tmp.m.buyables && tmp.m.buyables[12]) gain = gain.times(buyableEffect('m', 12))
	if (!fNoBuyables && tmp.u && tmp.u.buyables && tmp.u.buyables[11]) gain = gain.times(buyableEffect('u', 11).pow(0.1))
	if (!fNoBuyables && tmp.r && tmp.r.buyables && tmp.r.buyables[11]) gain = gain.times(buyableEffect('r', 11))
	if (!fNoBuyables && tmp.r && tmp.r.buyables && tmp.r.buyables[13]) gain = gain.times(buyableEffect('r', 13))
	// Achievements
	if (hasAchievement('a', 11)) gain = gain.times(1.5)
	if (hasAchievement('a', 12)) gain = gain.times(1.5)
	if (hasAchievement('a', 13)) gain = gain.times(1.2)
	if (hasAchievement('a', 14)) gain = gain.times(achievementEffect('a', 14))
	if (hasAchievement('a', 15)) gain = gain.times(1.3)
	if (hasAchievement('a', 16)) gain = gain.times(1.3)
	if (hasAchievement('a', 31)) gain = gain.times(1.5)
	if (hasAchievement('a', 32)) gain = gain.times(2)
	if (hasAchievement('a', 91)) gain = gain.times(achievementEffect('a', 91))
	if (hasAchievement('a', 92)) gain = gain.times(achievementEffect('a', 92))
	if (hasAchievement('a', 93)) gain = gain.times(achievementEffect('a', 93))
	if (hasAchievement('a', 96)) gain = gain.times(achievementEffect('a', 96))
	if (hasMilestone('p', 4)) gain = gain.times(2)
	if (hasMilestone('b', 5)) gain = gain.times(3)
	if (hasAchievement('a', 33)) gain = gain.pow(1.05)
	// Challenge debuffs
	if (inChallenge('t', 11)) gain = gain.pow(0.5)
	if (inChallenge('t', 12)) gain = gain.pow(0.7)
	if (inChallenge('t', 21)) gain = gain.pow(0.6)
	if (inChallenge('w', 11)) gain = gain.pow(0.65)
	if (inChallenge('w', 12)) gain = gain.pow(0.55)
	if (inChallenge('q', 11)) gain = gain.pow(0.5)
	if (inChallenge('q', 12)) gain = gain.pow(0.4)
	if (inChallenge('e', 11)) gain = gain.pow(0.3)
	if (inChallenge('u', 11)) gain = gain.pow(0.6)
	if (inChallenge('u', 12)) gain = gain.pow(0.5)
	if (player.r && inChallenge('r', 11)) gain = gain.pow(0.35)
	if (player.r && inChallenge('r', 12)) gain = gain.pow(0.25)
	if (player.s2 && inChallenge('s2', 11)) gain = gain.pow(0.15)
	if (player.s2 && inChallenge('s2', 12)) gain = gain.pow(0.05)
	if (player.s2 && inChallenge('s2', 22)) gain = gain.pow(0.1)
	if (player.o && inChallenge('o', 11)) gain = gain.pow(0.2)
	if (player.o && inChallenge('o', 13)) gain = gain.pow(0.1)
	if (player.o && inChallenge('o', 14)) gain = gain.pow(0.05)
	if (player.o && inChallenge('o', 15)) gain = gain.pow(0.01)
	if (player.f && inChallenge('f', 11)) gain = gain.pow(0.1)
	if (player.f && inChallenge('f', 12)) gain = gain.pow(0.05)
	if (player.f && inChallenge('f', 13)) gain = gain.pow(0.1)
	if (player.f && inChallenge('f', 14)) gain = gain.pow(0.02)
	return gain
}

function addedPlayerData() {
	return {}
}

// Display extra things at the top of the page
var displayThings = [
	function() { 
		if (typeof isUsingFallbackStorage !== "undefined" && isUsingFallbackStorage()) {
			let type = (typeof getFallbackStorageType !== "undefined" ? getFallbackStorageType() : "fallback")
			if (type === "memory") return "<b style='color:#ff4444; background:#330000; padding:2px 6px; border:1px solid #ff0000'>⚠️ MEMORY-ONLY SAVE! Will be LOST on refresh — Export often! (Options → Export)</b>"
			if (type === "sessionStorage") return "<b style='color:#ffcc00; background:#332a00; padding:2px 6px; border:1px solid #ffcc00'>⚠️ Session-Only Save (closes when tab closes) — Please Export!</b>"
			return "<b style='color:orange'>⚠️ Save fallback active ("+type+")</b>"
		}
	},
	function() { if (tmp.p && tmp.p.effect) return "P: "+format(tmp.p.effect)+"x" },
	function() { if (player.g.unlocked || hasMilestone('p', 4)) return "<b style='color:#7fd4ff'>💡 Buyables: click = buy max, Shift+click = buy one (everything below Eternity)</b>" },
	function() { if (player.b.unlocked) return "B: "+format(tmp.b.effect)+"x" },
	function() { if (player.g.unlocked) return "G: "+formatWhole(player.g.points)+" (×"+format(tmp.g.effect)+")" },
	function() { if (player.m.unlocked) return "M: "+format(tmp.m.effect)+"x" },
	function() { if (player.t.unlocked) return "T: "+format(tmp.t.effect)+"x" },
	function() { if (player.w.unlocked) return "W: "+format(tmp.w.effect)+"x" },
	function() { if (player.h.unlocked) return "H: "+format(tmp.h.effect)+"x" },
	function() { if (player.q.unlocked) return "Q: "+format(tmp.q.effect)+"x" },
	function() { if (player.e.unlocked) return "E: "+format(tmp.e.effect)+"x | "+format(player.e.points)+" Eternities" },
	function() { if (player.u && player.u.unlocked) return "U: "+format(tmp.u.effect)+"x ("+player.u.activeUniverse+") | "+formatWhole(player.u.points)+" U" },
	function() { if (player.r && player.r.unlocked) return "R: "+format(tmp.r.effect)+"x | "+formatWhole(player.r.points)+" shards | "+formatWhole(player.r.stability)+" stability" },
	function() { if (player.s2 && player.s2.unlocked) return "S: "+format(tmp.s2.effect)+"x | "+formatWhole(player.s2.points)+" singularities | Field: "+format(player.s2.field) },
	function() { if (player.o && player.o.unlocked) return "Ω: "+format(tmp.o.effect)+"x | "+formatWhole(player.o.points)+" omniverse energy | Field: "+format(player.o.field) },
	function() { if (player.f && player.f.unlocked) return "F: "+format(tmp.f.effect)+"x | "+formatWhole(player.f.points)+" finality | Sigils: "+player.f.sigils },
	function() { if (inChallenge('t', 11) || inChallenge('t', 12) || inChallenge('t', 21) || inChallenge('w', 11) || inChallenge('q', 11) || inChallenge('e', 11) || (player.u && inChallenge('u',11)) || (player.r && (inChallenge('r',11) || inChallenge('r',12))) || (player.s2 && (inChallenge('s2',11) || inChallenge('s2',12) || inChallenge('s2',21) || inChallenge('s2',22))) || (player.o && (inChallenge('o',11) || inChallenge('o',12) || inChallenge('o',13) || inChallenge('o',14)))) return "<b style='color:red; background:#330000; padding:1px 6px'>⚠️ In Challenge!</b>" },
]

// Determines when the game "ends"
function isEndgame() {
	return (player.o && player.o.points.gte(new Decimal(50))) ||
	       (player.s2 && player.s2.points.gte(new Decimal(50))) ||
	       (player.u && player.u.points.gte(new Decimal(100))) ||
	       (player.r && player.r.points.gte(new Decimal(50))) ||
	       player.points.gte(new Decimal("1e1000"))
}

var backgroundStyle = {}

function maxTickLength() {
	return 3600
}

function fixOldSave(oldVersion){
	if (oldVersion < "0.3") {
		if (!player.m) player.m = getStartLayerData("m");
		if (!player.w) player.w = getStartLayerData("w");
		if (!player.q) player.q = getStartLayerData("q");
		if (!player.e) player.e = getStartLayerData("e");
		if (!player.s) player.s = {unlocked: true};
	}
	if (oldVersion < "0.4") {
		if (!player.u) player.u = getStartLayerData("u");
		if (player.u && !player.u.classic) player.u.classic = {points: new Decimal(0), boosters: new Decimal(0), generators: new Decimal(0)};
		if (player.u && !player.u.rewritten) player.u.rewritten = {points: new Decimal(0), boosters: new Decimal(0), time: new Decimal(0)};
		if (player.u && !player.u.demo) player.u.demo = {points: new Decimal(0), candies: new Decimal(0), farm: new Decimal(0)};
		if (player.u && !player.u.incrementverse) player.u.incrementverse = {points: new Decimal(0), incrementy: new Decimal(0), prestige: new Decimal(0)};
	}
	if (oldVersion < "0.6") {
		if (!player.r) player.r = getStartLayerData("r");
		if (player.r && player.r.stability === undefined) player.r.stability = new Decimal(0);
		if (player.r && player.r.auto === undefined) player.r.auto = false;
	}
	if (oldVersion < "0.7") {
		if (!player.s2) player.s2 = getStartLayerData("s2");
		if (player.s2 && player.s2.field === undefined) player.s2.field = new Decimal(0);
		if (player.s2 && player.s2.collapses === undefined) player.s2.collapses = 0;
		if (player.u && !player.u.basic) player.u.basic = { points: new Decimal(0), cheapeners: new Decimal(0), darkness: new Decimal(0), exponents: new Decimal(0), funity: new Decimal(0), games: new Decimal(0) };
		if (player.u && !player.u.miletree) player.u.miletree = { points: new Decimal(0), prestige: new Decimal(0), superPrestige: new Decimal(0), transcend: new Decimal(0), reincarnate: new Decimal(0) };
	}
	if (oldVersion < "0.8") {
		if (!player.o) player.o = getStartLayerData("o");
		if (player.o && player.o.field === undefined) player.o.field = new Decimal(0);
		if (player.o && player.o.syntheses === undefined) player.o.syntheses = 0;
		if (player.o && player.o.pulseTimer === undefined) player.o.pulseTimer = 0;
		if (player.u && !player.u.dimensions) player.u.dimensions = { points: new Decimal(0), dim1: new Decimal(0), dim2: new Decimal(0), dimBoost: new Decimal(0) };
		if (player.u && !player.u.particles) player.u.particles = { points: new Decimal(0), electrons: new Decimal(0), protons: new Decimal(0), neutrons: new Decimal(0), quarks: new Decimal(0) };
		if (player.u && !player.u.pro) player.u.pro = { points: new Decimal(0), ants: new Decimal(0), grass: new Decimal(0), supernova: new Decimal(0), void: new Decimal(0) };
		if (player.u && !player.u.dice) player.u.dice = { points: new Decimal(0), d6: new Decimal(0), d12: new Decimal(0), d20: new Decimal(0), luck: new Decimal(0) };
		if (player.u && !player.u.ng) player.u.ng = { points: new Decimal(0), ngBoosters: new Decimal(0), metaGenerators: new Decimal(0), hyperTime: new Decimal(0) };
	}
	// v0.8 Full Release — Finality and the three deep realms
	if (!player.f) player.f = getStartLayerData("f");
	if (player.f && player.f.sigils === undefined) player.f.sigils = 0;
	if (player.f && player.f.burstTimer === undefined) player.f.burstTimer = 0;
	if (player.u && !player.u.galaxy) player.u.galaxy = { points: new Decimal(0), stars: new Decimal(0) };
	if (player.u && !player.u.synergism) player.u.synergism = { points: new Decimal(0), nodes: new Decimal(0) };
	if (player.u && !player.u.circuit) player.u.circuit = { points: new Decimal(0), volts: new Decimal(0) };
}
