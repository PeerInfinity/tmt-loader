// ************ Themes ************
var themes = ["default", "aqua", "pinkie", "ourple", "greed",]

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
		1: "#bfdfff",
		2: "#8fa7bf",
		3: "#5f6f7f",
		color: "#bfdfff",
		points: "#dfefff",
		locked: "#c4a7b3",
		background: "#001f3f",
		background_tooltip: "rgba(0, 15, 31, 0.75)",
	},
	pinkie: {
		1: "#ffbcf8",
		2: "#ff9bf5",
		3: "#ff7df2",
		color: "#ffa3f6",
		points: "#ff80f2",
		locked: "#ff5cef",
		background: "#5c0b54",
		background_tooltip: "rgba(92, 11, 84, 0.75)",
	},
	ourple: {
		1: "#d6a0ff",
		2: "#cb87ff",
		3: "#c77dff",
		color: "#d6a0ff",
		points: "#cb87ff",
		locked: "#c77dff",
		background: "#44116b",
		background_tooltip: "rgba(68, 17, 107, 0.75)",
	},
	greed: {
		1: "hsl(131, 100%, 81%)",
		2: "hsl(131, 100%, 77%)",
		3: "hsl(131, 100%, 75%)",
		color: "hsl(131, 100%, 81%)",
		points: "hsl(131, 100%, 77%)",
		locked: "hsl(131, 100%, 75%)",
		background: "hsl(131, 53%, 20%)",
		background_tooltip: "hsla(131, 53%, 20%, 0.75)",
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
	return options.theme ? options.theme : "default";
}

function switchTheme() {
	let index = themes.indexOf(options.theme)
	if (options.theme === null || index >= themes.length - 1 || index < 0) {
		options.theme = themes[0];
	}
	else {
		index++;
		options.theme = themes[index];
	}
	changeTheme();
	resizeCanvas();
}
