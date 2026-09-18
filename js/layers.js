// softcaps a decimal value based on a softcap data array. First item in the array is the threshold, second item is the dampening effect
function softcapValue(value, sc) {
	for (let i = 0; i < sc.length; i++) {
		let cap = sc[i];
		if (value.gte(cap[0])) value = value.div(cap[0]).pow(cap[1]).mul(cap[0]);
	}
	return value;
}

function hasEUpg(id) {
	return hasUpgrade("e",id);
}

function getEEff(id) {
	return upgradeEffect("e",id);
}

function hasPUpg(id) {
	return hasUpgrade("p",id);
}

function getNEff(id) {
	return upgradeEffect("n",id);
}

function hasNUpg(id) {
	return hasUpgrade("n",id);
}

function getPEff(id) {
	return upgradeEffect("p",id);
}

function effectText(text, color) {
		let ret = "<h2 style='color:" + color + "; text-shadow:" + color + " 0px 0px 10px'>" + text + "</h2>";
		return ret;
}