/**
 * Where most of the basic configuration for the mod is.
 */
let modInfo = {
	/**
	 * The name of your mod.
	 */
	name: 'The Gaming Tree',
	/**
	 * The id for your mod, a unique string that is used to determine savefile location.
	 * Be sure to set it when you start making a mod, and don't change it later because it will erase all saves.
	 */
	id: 'thegamingtreev3',
	/**
	 * The name of the author, displayed in the info tab.
	 */
	author: 'medsal15',
	/**
	 * This changes what is displayed instead of "points" for the main currency.
	 */
	pointsName: 'points',
	/**
	 * An array of file addresses which will be loaded for this mod.
	 * Using smaller files makes it easier to find what you're looking for.
	 */
	modFiles: [
		'tree.js',
		'layers/hotkeys.js', 'layers/star.js',

		'layers/side/achievements.js', 'layers/side/clock.js', 'layers/side/casino.js', 'layers/side/magic.js', 'layers/side/stats.js',
		'layers/0/experience.js', 'layers/0/mining.js', 'layers/0/tree.js',
		'layers/1/level.js', 'layers/1/loot.js', 'layers/1/forge.js',
		'layers/2/boss.js', 'layers/2/shop.js', 'layers/2/alternator.js',

		'alternate/side/successes.js', 'alternate/side/time_cubes.js', 'alternate/side/bingo.js', 'alternate/side/condiments.js',
		'alternate/0/experience.js', 'alternate/0/city.js', 'alternate/0/plants.js',
		'alternate/1/tower.js', 'alternate/1/kitchen.js', 'alternate/1/freezer.js',
	],
	/**
	 * If you have a Discord server or other discussion place, you can add a link to it.
	 *
	 * The text on the link.
	 */
	discordName: '',
	/**
	 * If you have a Discord server or other discussion place, you can add a link to it.
	 *
	 * The url of an invite.
	 * If you're using a Discord invite, please make sure it's set to never expire
	 */
	discordLink: '',
	/**
	 * The maximum amount of offline time that the player can accumulate, in hours.
	 * Any extra time is lost.
	 */
	offlineLimit: 12,  // In hours
	/**
	 * A Decimal for the amount of points a new player should start with.
	 */
	initialStartPoints: new Decimal(0), // Used for hard resets and new players
};

/**
 * Used to describe the current version of your mod
 */
let VERSION = {
	/**
	 * The mod's version number, displayed at the top right of the tree tab.
	 */
	num: 'R0.B.6',
	/**
	 * The version's name, displayed alongside the number in the info tab.
	 */
	name: 'Towering Temperatures',
	beta: false,
};

/**
 * HTML displayed in the changelog tab
 */
let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.B.6</h3><br>
		- Misfortune should no longer break when you alternate a layer during it.<br>
	<h3>v0.B.5</h3><br>
		- Fixed a bug where the Kitchen had control of the Forge's smelting.<br>
	<h3>v0.B.4</h3><br>
		- Fixed a bug with Misfortune breaking with luck disabled.<br>
	<h3>v0.B.3</h3><br>
		- Casino no longer affects the game while deactivated.<br>
	<h3>v0.B.2</h3><br>
		- Fixed a Bingo and Time Cubes not working.<br>
	<h3>v0.B.1</h3><br>
		- Fixed a bug with the Freezer.<br>
	<h3>v0.B</h3><br>
		- Added 5 new layers.<br>
		- QoL: Add quick select buttons for city and plant.<br>
		- Update endgame: Get all 3 new row 1 layers.<br>
	<h3>v0.A</h3><br>
		- Added 4 new layers.<br>
		- Update endgame: Get all 3 new row 0 layers.<br>
	<h3>v0.6</h3><br>
		- Added 3 new layers.<br>
		- Added the 4th boss, miniboss, and relic.<br>
		- QoL: Added automatic upgrades to row 1 layers.<br>
		- Update endgame: Beat the 4th boss.<br>
	<h3>v0.5</h3><br>
		- Added 1 new layer.<br>
		- Added the 3rd boss, miniboss, and relic.<br>
		- QoL: Keep shop upgrades on reset (not the investments though).<br>
		- Update endgame: Beat the 3rd boss.<br>
	<h3>v0.4</h3><br>
		- Added 4 new layers.<br>
		- Added the 2nd boss, 2nd miniboss, and 2nd relic.<br>
		- Rewrote the enemy color algorithm.<br>
		- Added an option to disable luck.<br>
		- Update endgame: Beat the 2nd boss.<br>
	<h3>v0.3</h3><br>
		- Added 2 new layers.<br>
		- Added a boss, miniboss and a relic.<br>
		- Update endgame: Beat the boss.<br>
	<h3>v0.2</h3><br>
		- Added Levels and Loot.<br>
		- Update endgame: 1000 slime kills.<br>
	<h3>v0.1</h3><br>
		- Added XP.<br>
		- Update endgame: 9th XP upgrades.`;

let winText = `Congratulations! You have finished the current content in the game. Look forward for more.`;

/**
 * Very important, if you are adding non-standard functions.
 * TMT calls every function anywhere in "layers" every tick to store the result, unless specifically told not to.
 * Functions that have are used to do an action need to be identified.
 * "Official" functions (those in the documentation) are all fine, but if you make any new ones, add their names to this array.
 *
 * ```js
 * // (The ones here are examples, all official functions are already taken care of)
 * var doNotCallTheseFunctionsEveryTick = ["doReset", "buy", "onPurchase", "blowUpEverything"]
 * ```
 */
var doNotCallTheseFunctionsEveryTick = [];

/**
 * A function that returns any non-layer-related data that you want to be added to the save data and "player" object.
 *
 * ```js
 * function addedPlayerData() { return {
 * 	weather: "Yes",
 * 	happiness: new Decimal(72),
 * }}
 * ```
 */
function addedPlayerData() { }

/**
 * An array of functions used to display extra things at the top of the tree tab.
 * Each function returns a string, which is a line to display (with basic HTML support).
 * If a function returns nothing, nothing is displayed (and it doesn't take up a line).
 *
 * @type {Computable<string>[]}
 */
var displayThings = [
	() => VERSION.beta ? '<span class="warning">Beta version, things might be a bit unstable</span>' : '',
	() => isEndgame() ? '<span style="color:#60C0F0">You are past endgame. Content may not be balanced.</span>' : '',
	() => {
		const id = activeChallenge('b');
		if (!id) return '';
		return `In boss challenge: ${layerColor('b', layers.b.challenges[id].name)}`;
	},
];

/**
 * A function to determine if the player has reached the end of the game, at which point the "you win!" screen appears.
 *
 * @returns {Boolean}
 */
function isEndgame() {
	return [21, 22, 23].every(id => hasUpgrade('a', id));
}



// Less important things beyond this point!

/**
 * A CSS object containing the styling for the background of the full game. Can be a function!
 *
 * @type {Computable<CSSStyleObject>}
 */
var backgroundStyle = {}

// You can change this if you have things that can be messed up by long tick lengths
/**
 * Returns the maximum tick length, in milliseconds.
 * Only really useful if you have something that reduces over time,
 * which long ticks mess up (usually a challenge).
 *
 * @returns {Number}
 */
function maxTickLength() {
	return (3600); // Default is 1 hour which is just arbitrarily large
}

/**
 * Can be used to modify a save file when loading into a new version of the game.
 * Use this to undo inflation, never forcibly hard reset your players.
 *
 * @param {string} oldVersion
 */
function fixOldSave(oldVersion) {
	if (oldVersion <= 'R0.4') {
		player.xp.enemies = Object.fromEntries(
			Object.keys(player.xp.enemies)
				.map(type => [type, {
					health: new Decimal(player.xp.health[type]),
					kills: new Decimal(player.xp.kills[type]),
					last_drops: player.xp.last_drops[type] ?? [],
				}])
		);
		Object.entries(player.t.trees)
			.forEach(([tree, data]) => {
				data.health = (tree == player.t.current || !(tree in layers.t.trees)) ? player.t.health : run(layers.t.trees[tree].health);
				data.last_drops = tree == player.t.current ? player.t.last_drops : [];
			});
	}
	if (oldVersion <= 'R0.5') {
		player.s.upgrades = player.s.upgrades.map(id => {
			if (id > 90) return id;

			if (id > 60) return id - 50;
			else return id + 30;
		});
	}
	if (oldVersion <= 'R0.A') {
		if ('grid' in player.c) player.c.floors = [player.c?.grid];
	}
}
