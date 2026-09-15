// ************ Themes ************
var themes = ["default", "aqua", "violet", "light", "darkness"]

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
	aqua: {
		1: "#ffffff",//Branch color 1
		2: "#bfbfbf",//Branch color 2
		3: "#7f7f7f",//Branch color 3
		color: "#bfdfff",
		points: "#dfefff",
		locked: "#c4a7b3",
		background: "#001f3f",
		background_tooltip: "rgba(0, 15, 31, 0.75)",
	},
	violet: {
		1: "#ffffff",//Branch color 1
		2: "#bfbfbf",//Branch color 2
		3: "#7f7f7f",//Branch color 3
		color: "#d0c0ff",
		points: "#efd0ff",
		locked: "#957999",
		background: "#2c0d3d",
		background_tooltip: "rgba(21, 0, 31, 0.75)",
	},
	light: {
		1: "#ffffff",//Branch color 1
		2: "#bfbfbf",//Branch color 2
		3: "#7f7f7f",//Branch color 3
		color: "#5a5a5a",
		points: "#606060",
		locked: "#404040",
		background: "#e0e0e0",
		background_tooltip: "rgba(200, 200, 200, 0.75)",
	},
	darkness: {
		1: "#ffffff",//Branch color 1
		2: "#bfbfbf",//Branch color 2
		3: "#7f7f7f",//Branch color 3
		color: "#1a1a1a",
		points: "#202020",
		locked: "#101010",
		background: "#000000",
		background_tooltip: "rgba(0, 0, 0, 0.75)",
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
	} else if (options.theme === null || index >= themes.length-1 || index < 1) {
		index ++;
		options.theme = themes[index];
		options.theme = themes[1];
	} else if (options.theme === null || index >= themes.length-1 || index < 2) {
		index ++;
		options.theme = themes[index];
		options.theme = themes[2];
	} else if (options.theme === null || index >= themes.length-1 || index < 3) {
		index ++;
		options.theme = themes[index];
		options.theme = themes[3];
	} else if (options.theme === null || index >= themes.length-1 || index < 4) {
		index ++;
		options.theme = themes[index];
		options.theme = themes[4];
	}
	changeTheme();
	resizeCanvas();
}
