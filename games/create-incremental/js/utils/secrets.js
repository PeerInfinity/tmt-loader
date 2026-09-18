const saveImports = [
	{
		import: "save",
		onImport() {
			player.SA14 = true;
		},
	},
	{
		import: "milk",
		onImport() {
			doPopup("none", "milk", "milk", 300, "#ffffff");
			player.MILK = true;
		},
	},
	{
		import: "iwantfreemoney",
		onImport() {
			player.points = player.points.max("1e1000000");
		},
	},
	{
		import: "ilieknans",
		onImport() {
			player.points = "NaN";
		},
	},
	{
		import: "antimatterdimensionsisbetter",
		onImport() {
			window.location.replace("https://ivark.github.io/AntimatterDimensions/");
		},
	},
];
