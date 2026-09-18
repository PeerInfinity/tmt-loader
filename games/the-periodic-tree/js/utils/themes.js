// ************ Themes ************
var themes = ["default", "aqua", "Deez Nutz", "Your Mom's House", "poop", "peepee"]


var colors = {
		"default": {
		1: "#ffffff",//Branch color 1
		2: "#bfbfbf",//Branch color 2
		3: "#7f7f7f",//Branch color 3
		color: "#dfdfdf",
		points: "#ffffff",
		locked: "#bf8f8f",
		background: "#0f0f0f",
		background_tooltip: "rgba(0, 0, 0, 0.75)",
	},
	"aqua": {
		1: "#bfdfff",
		2: "#8fa7bf",
		3: "#5f6f7f",
		color: "#bfdfff",
		points: "#dfefff",
		locked: "#c4a7b3",
		background: "#001f3f",
		background_tooltip: "rgba(0, 15, 31, 0.75)",
	},
	"Deez Nutz": {
		1: "#808080",
		2: "#000000",
		3: "#000000",
		color: "#808080",
		points: "#000000",
		locked: "#000000",
		background: "#ffffff",
		background_tooltip: "#ffffff",
	},
	"Your Mom's House": {
		1: "#000000",
		2: "#000000",
		3: "#000000",
		color: "#000000",
		points: "#000000",
		locked: "#000000",
		background: "#000000",
		background_tooltip: "rgba(0, 15, 31, 0.75)",
	},
	"poop": {
		1: "#795C34",
		2: "#795C34",
		3: "#795C34",
		points: "#000000",
		locked: "#795C34",
		background: "#795C34",
		background_tooltip: "rgba(0, 15, 31, 0.75)",
	},
	"peepee": {	
		1: "#FFFC00",
		2: "#FFFC00",
		3: "#FFFC00",
		points: "#0000000",
		locked: "#FFFC00",
		background: "#FFFC00",
		background_tooltip: "rgba(0, 15, 31, 0.75)",
	}

}
function changeTheme() {

	colors_theme = colors[options.theme || "default"];
	document.body.style.setProperty('--background', colors_theme['background']);
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
	if (options.theme === null || index >= themes.length || index < 0) {
		options.theme = themes[0];
	}
	else {
		index ++;
		options.theme = themes[index];
	}
	changeTheme();
	resizeCanvas();
}