// ************ Themes ************
var themes = ["default", "aqua", "verdant", "pyro", "arcane", "steel"];

var colors = {
	default: {
		1: "#ffffff", //Branch color 1
		2: "#bfbfbf", //Branch color 2
		3: "#7f7f7f", //Branch color 3
		color: "#dfdfdf",
		points: "#157307",
		locked: "#bf8f8f",
		background: "#0f0f0f",
		background_tooltip: "rgba(0, 0, 0, 0.75)",
	},
	steel: {
		1: "#eeeeee", //Branch color 1
		2: "#afafaf", //Branch color 2
		3: "#6f6f6f", //Branch color 3
		color: "#cfcfcf",
		points: "#157307",
		locked: "#af9f9f",
		background: "#2f2f2f",
		background_tooltip: "rgba(32, 32, 32, 0.75)",
	},
	aqua: {
		1: "#bfdfff",
		2: "#8fa7bf",
		3: "#5f6f7f",
		color: "#bfdfff",
		points: "#157307",
		locked: "#c4a7b3",
		background: "#001f3f",
		background_tooltip: "rgba(0, 15, 31, 0.75)",
	},
	auqa: {
		1: "#402000",
		2: "#705840",
		3: "#a09080",
		color: "#402000",
		points: "#157307",
		locked: "#3b584c",
		background: "#ffe0c0",
		background_tooltip: "rgba(255, 240, 224, 0.75)",
	},
	pyro: {
		1: "#ffbfbf",
		2: "#bf8f8f",
		3: "#7f5f5f",
		color: "#ffbfbf",
		points: "#157307",
		locked: "#c4a7a7",
		background: "#3f0000",
		background_tooltip: "rgba(31, 0, 0, 0.75)",
	},
	oryp: {
		1: "#004040",
		2: "#407070",
		3: "#80a0a0",
		color: "#004040",
		points: "#157307",
		locked: "#3b5858",
		background: "#c0ffff",
		background_tooltip: "rgba(224, 255, 255, 0.75)",
	},
	wooden: {
		1: "#ffdfbf",
		2: "#bf9f8f",
		3: "#7f6f5f",
		color: "#ffdfbf",
		points: "#157307",
		locked: "#c4b5a7",
		background: "#3f1700",
		background_tooltip: "rgba(31, 15, 0, 0.75)",
	},
	electro: {
		1: "#ffffbf",
		2: "#bfbf8f",
		3: "#7f7f5f",
		color: "#ffffbf",
		points: "#157307",
		locked: "#c4c4a7",
		background: "#4f3a00",
		background_tooltip: "rgba(31, 31, 0, 0.75)",
	},
	arcane: {
		1: "#dfbfff",
		2: "#a78fbf",
		3: "#6f5f7f",
		color: "#dfbfff",
		points: "#157307",
		locked: "#b3a7c4",
		background: "#1f003f",
		background_tooltip: "rgba(31, 0, 31, 0.75)",
	},
	enacra: {
		1: "#204000",
		2: "#587040",
		3: "#90a080",
		color: "#204000",
		points: "#157307",
		locked: "#4c583b",
		background: "#e0ffc0",
		background_tooltip: "rgba(224, 255, 224, 0.75)",
	},
	verdant: {
		1: "#bfffbf",
		2: "#8fbf8f",
		3: "#5f7f5f",
		color: "#bfffbf",
		points: "#157307",
		locked: "#a7c4a7",
		background: "#003f00",
		background_tooltip: "rgba(0, 31, 0, 0.75)",
	},
	tnadrev: {
		1: "#400040",
		2: "#704070",
		3: "#a080a0",
		color: "#400040",
		points: "#157307",
		locked: "#583b58",
		background: "#ffc0ff",
		background_tooltip: "rgba(255, 224, 255, 0.75)",
	},
	void: {
		1: "#333333",
		2: "#222222",
		3: "#111111",
		color: "#222222",
		points: "#157307",
		locked: "#111111",
		background: "#000000",
		background_tooltip: "rgba(0, 0, 0, 0.75)",
	},
	light: {
		1: "#000000",
		2: "#404040",
		3: "#808080",
		color: "#505050",
		points: "#157307",
		locked: "#a07070",
		background: "#e0e0e0",
		background_tooltip: "rgba(255, 255, 255, 0.75)",
	},
	quality: {
		1: "#00ff00",
		2: "#00ffff",
		3: "#ff00ff",
		color: "#ffffff",
		points: "#157307",
		locked: "#ff0000",
		background: "#ffff00",
		background_tooltip: "rgba(255, 255, 0, 0.75)",
	},
	golden: {
		1: "#fca32d",
		2: "#d6851a",
		3: "#b56b09",
		color: "#ffa640",
		points: "#157307",
		locked: "#f7401b",
		background: "#de8004",
		background_tooltip: "rgba(111, 64, 2, 0.75)",
	},
	milk: {
		1: "#ffffff",
		2: "#ffffff",
		3: "#ffffff",
		color: "#ffffff",
		points: "#157307",
		locked: "#ffffff",
		background: "#ffffff",
		background_tooltip: "rgba(255, 255, 255, 0.75)",
	},
};
function changeTheme() {
	colors_theme = colors[options.theme || "default"];
	document.body.style.setProperty("--background", colors_theme["background"]);
	document.body.style.setProperty("--background_tooltip", colors_theme["background_tooltip"]);
	document.body.style.setProperty("--color", colors_theme["color"]);
	document.body.style.setProperty("--points", colors_theme["points"]);
	document.body.style.setProperty("--locked", colors_theme["locked"]);
}
function getThemeName() {
	return options.theme ? options.theme : "default";
}

function switchTheme() {
	updateSecretThemes();
	let index = themes.indexOf(options.theme);
	if (options.theme === null || index >= themes.length - 1 || index < 0) {
		options.theme = themes[0];
	} else {
		index++;
		options.theme = themes[index];
	}
	changeTheme();
	resizeCanvas();
}

function updateSecretThemes() {
	if (hasAchievement("SA", 11) && themes.indexOf("quality") == -1) {
		themes.push("quality");
	}

	if (hasAchievement("SA", 12) && themes.indexOf("golden") == -1) {
		themes.push("golden");
	}

	if (hasAchievement("SA", 13) && themes.indexOf("void") == -1) {
		themes.push("void");
	}

	if (hasAchievement("SA", 14) && themes.indexOf("light") == -1) {
		themes.push("light");
	}

	if (hasAchievement("SA", 15) && themes.indexOf("auqa") == -1) {
		themes.push("auqa");
	}
	if (hasAchievement("SA", 15) && themes.indexOf("tnadrev") == -1) {
		themes.push("tnadrev");
	}
	if (hasAchievement("SA", 15) && themes.indexOf("oryp") == -1) {
		themes.push("oryp");
	}
	if (hasAchievement("SA", 15) && themes.indexOf("enacra") == -1) {
		themes.push("enacra");
	}

	if (player.MILK === true && themes.indexOf("milk") == -1) {
		themes.push("milk");
	}

	if (
		hasAchievement("SA", 11) &&
		hasAchievement("SA", 12) &&
		hasAchievement("SA", 13) &&
		hasAchievement("SA", 14) &&
		hasAchievement("SA", 15) &&
		themes.indexOf("electro") == -1
	) {
		themes.push("electro");
	}
	if (
		hasAchievement("SA", 11) &&
		hasAchievement("SA", 12) &&
		hasAchievement("SA", 13) &&
		hasAchievement("SA", 14) &&
		hasAchievement("SA", 15) &&
		themes.indexOf("wooden") == -1
	) {
		themes.push("wooden");
	}
}
