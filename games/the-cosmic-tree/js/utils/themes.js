// ************ Themes ************
var themes = ["default", "aqua", "cosmic"]

var colors = {
	
	default: {
		1: "#ffffff",//Branch color 1
		2: "#bfbfbf",//Branch color 2
		3: "#7f7f7f",//Branch color 3
		color: "#dfdfdf",
		points: "#ffffff",
		locked: "#bf8f8f",
		background: "#0f0f0f",
		background_tooltip: "rgba(0, 0, 0, 0.75)",
	},
	cosmic: {
		1: "#ffbfef",
		2: "#bf8fb8",
		3: "#7f5f7a",
		color: "#c5c5c5",
		points: "#b5b5b5",
		locked: "#a4a4a4",
		background:  "#2e1a50",
		background_tooltip: "rgba(37, 4, 31, 0.75)",
	},
	aqua: {
		1: "#bfdfff",
		2: "#8fa7bf",
		3: "#5f6f7f",
		color: "#bfdfff",
		points: "#dfefff",
		locked: "#c4a7b3",
		background: "#001f3f",
		background_tooltip: "rgba(0, 15, 31, 0.75)",
	},
}
function changeTheme() {

	colors_theme = colors[options.theme || "default"];
	document.body.style.setProperty('--background', colors_theme["background"]);
	document.body.style.setProperty('--background_tooltip', colors_theme["background_tooltip"]);
	document.body.style.setProperty('--color', colors_theme["color"]);
	document.body.style.setProperty('--points', colors_theme["points"]);
	document.body.style.setProperty("--locked", colors_theme["locked"]);
}
function getThemeName() {
	return options.theme? options.theme : "default";
}

function switchTheme() {
	let index = themes.indexOf(options.theme)
	if (options.theme === null || index >= themes.length-1 || index < 0) {
		options.theme = themes[0];
	}
	else if ((options.theme === null || index >= themes.length-1 || index < 1)){
		index ++;
		options.theme = themes[index];
		options.theme = themes[1];
	}
	else {
		index ++;
		options.theme = themes[index];
		options.theme = themes[2];
	}
	changeTheme();
	resizeCanvas();
}
