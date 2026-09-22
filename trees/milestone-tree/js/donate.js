localStorage.supporterCode = localStorage.supporterCode || "";

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
		["raw-html", "<h1><a href=https://afdian.com/@loader3229/plan target=_blank>Afdian.com Donation</a></h1>"],
		["raw-html", "<h1><a href=https://ko-fi.com/loader3229 target=_blank>Buy me a coffee in Ko-Fi.com</a></h1>"],
		["raw-html", "<h1><a href=https://patreon.com/user?u=56328626 target=_blank>Patreon Donation</a></h1>"],
		["raw-html", "<a href=/b.html target=_blank>Input Supporter Code To Gain Bonuses!</a>"],
	],
});