addLayer("donate", {
	startData() { return {unlocked: true}},
	color: "#ff8888",
	symbol: "D",
	row: "side",
	position: -1,
	layerShown() { return true },
	tooltip: "Donate",
	tabFormat: [
		"blank", "blank", "blank",
		["raw-html", "<h1><a href=https://afdian.net/@loader3229/plan target=_blank>Afdian.net Donation (For Chinese Users)</a></h1>"],
		["raw-html", "<h1><a href=https://ko-fi.com/loader3229 target=_blank>Buy me a coffee on Ko-Fi.com (For Non-Chinese Users)</a></h1>"],
	],
})
