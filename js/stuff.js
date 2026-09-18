// basically for functions that make stuff easier

// get the total amount of upgrades
function getUps() {
	return Object.keys(layers).map(layer => player[layer].upgrades.length).reduce((a,b) => a+b, 0);
}

// get the total amount of achievements
function getAchs() {
	return Object.keys(layers).map(layer => player[layer].achievements.length).reduce((a,b) => a+b, 0);
}

// the default tab format
function defaultTab(layer) {
	return [
		'main-display',
		'prestige-button',
		'resource-display',
		'milestones',
		'upgrades',
		'achievements',
	];
}