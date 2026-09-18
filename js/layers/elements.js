function isAtomTab() {
	return player.tab === "a" && player.subtabs.a.mainTabs === "Classified Atoms";
}

function resetElementCounts() {
	for (let i = 0; i < player.a.elementCounts.length; i++) {
		player.a.elementCounts[i] = new Decimal(0);
	}
}

function findElement(ename) {
	return Object.values(elementData).find(x => x.name === ename)
}

function findElementSymbol(esym) {
	return Object.values(elementData).find(x => x.symbol === esym)
}

function getElementCount(id) {
	return player.a.elementCounts[elementData[id].position];
}

//check which elements are currently available for selection
function setActiveElements() {
	let act = new Array();
	for (let key in elementData) {
		let elem = elementData[key];
		if (elem.unlocked()) act.push(key);
	}
	player.a.activeElements = act;
}

//update weights for active elements
function setActiveWeights() {
	setActiveElements();
	let act = player.a.activeElements;
	let weightArr = player.a.elementWeights;
	let total = new Decimal(0);
	for (let i = 0; i < act.length; i++) {
		let elem = elementData[act[i]];
		let weight = getElementWeight(elem.position);
		player.a.elementWeights[elem.position] = weight;
		total = total.add(weight);
	}
	player.a.totalElementalWeight = total;
}

//update weights for all elements
function setElementWeights() {
	if (!player) return
	//setActiveElements();
	//let act = player.a.activeElements;
	let weightArr = player.a.elementWeights;
	let scale = player.a.elementalRarityScaling;
	let currentWeight = new Decimal(1);
	let total = new Decimal(0);
	for (let i = 0; i < weightArr.length; i++) {
		player.a.elementWeights[i] = currentWeight;
		total = total.add(currentWeight);
		currentWeight = currentWeight.div(scale);
	}
	player.a.totalElementalWeight = total;
}

//calculate weight for an individual element based on its position
function getElementWeight(id) {
	let base = new Decimal(1);
	let scale = player.a.elementalRarityScaling;
	return base.div(new Decimal(scale).pow(id))
}

//calculate total weight for a specific set of elements
function getGroupWeight(elements) {
	let total = new Decimal(0);
	for (let i = 0; i < elements.length; i++) {
		total = total.add(getElementWeight(elementData[elements[i]].position))
	}
	return total;
}

//caching alias data for faster lookup
function setAliases(elements) {
	//initialize variables
	elements = elements || player.a.activeElements;
	let elementCount = Object.keys(elements).length;
	let smallList = new Array();
	let largeList = new Array();
	let totalWeight = getGroupWeight(elements);
	let adjustedWeights = elements.map(x => getElementWeight(elementData[x].position).mul(elementCount).div(totalWeight));
	player.a.elementAliases = new Array(elementCount);
	player.a.bucketProbabilities = new Array(elementCount);
	//debugger;
	
	//sort elements into two lists based on magnitude of weight
	for (let i = 0; i < adjustedWeights.length; i++) {
		//let selList = adjustedWeights[i].lt(1) ? smallList : largeList;
		//selList.push(i)
		(adjustedWeights[i].lt(1)) ? smallList.push(i) : largeList.push(i);
		//debugger;
	}
	
	//debugger;
	//the fun part!
	while (smallList.length && largeList.length) {
		let sm = smallList.shift();
		let lg = largeList.shift();
		player.a.bucketProbabilities[sm] = adjustedWeights[sm];
		player.a.elementAliases[sm] = lg;
		adjustedWeights[lg] = adjustedWeights[lg].add(adjustedWeights[sm]).sub(1);
		(adjustedWeights[lg].lt(1)) ? smallList.push(lg) : largeList.push(lg);
		//debugger;
	}
	
	while (largeList.length) {
		player.a.bucketProbabilities[largeList.shift()] = new Decimal(1);
	}
	
	while (smallList.length) {
		player.a.bucketProbabilities[smallList.shift()] = new Decimal(1);
	}
	
}

//alias selection algorithm. Should be much better than the linear scan if I didn't botch the implementation.
function randomElement(elements) {
	elements = elements || player.a.activeElements;
	let bucket = Math.floor(Math.random() * elements.length);
	let prob = player.a.bucketProbabilities[bucket];
	let select = prob.gte(Math.random()) ? bucket : player.a.elementAliases[bucket];
	//console.log("Selected: " + select + ", bucket: " + bucket + ", prob: " + prob);
	return elements[select];
	
	console.log ("randomElement failed to choose an element! Returning " + act[0] + " instead.")
	return act[0];
}

//utility for checking that the atoms returned by classifyAtoms add up to the correct amount
function addTotals(data) {
	let total = new Decimal(0);
	for (x in data) {
		total = total.add(data[x]);
	}
	return total;
}

//linear scan algorithm. Works great at first when the probabilities scale quickly but will likely become very suboptimal as the odds flatten out.
/*
function randomElement(setWeights=true, elements, totalWeight) {
	if (setWeights) setActiveWeights();
	
	let act = elements || player.a.activeElements;
	let dist = totalWeight || player.a.totalElementalWeight;
	dist = dist.mul(Math.random());
	
	for (let i = 0; i < act.length; i++) {
			let elem = elementData[act[i]];
			dist = dist.minus(player.a.elementWeights[elem.position]);
			if (dist.lt(0)) return act[i];
	}
	console.log ("randomElement failed to choose an element! Returning " + act[0] + " instead.")
	return act[0];
}
*/


//setting alias data at start is a problem. when elements are removed from the pool to trim it down, it becomes impossible to separate the removed elements from the generated alias data. You can wait until after trimming elements to update alias data, but the alias method needs to know which elements are excluded and the active element list needs to still function properly. 

//store array of active elements for ease of access, two arrays for alias data, two arrays for element weights and counts
//setActiveElements to update the array of available elements
//setWeights method to update all element weights, active elements only being optional
//setAliases to update the two alias arrays


//Possible flows...

//Update active elements and weights to start. Start running total of which elements have been selected to pass through recursion loops. On recursions, initialize the data with the recursion data instead. Ensure the element array is a soft copy. 

//If only 1 element to choose from, assign all atoms to the element (or hydrogen if somehow no elements are available)
//Check if atom count exceeds reasonable iteration count. If so, assign proportionate atoms to highest weighted element then call function recursively with new data.

//If this check is passed and the atoms are ready to be assigned, initialize aliases. Pass specific element set to alias setting method to ensure a closed system.

//UPDATE ACTIVE ELEMENTS AGAIN SO THE EFFECTS DO NOT LINGER

//--------------------------------

//Update active elements and weights to start. Start list of selected elements to return at the end. Make a shallow copy of the active elements for ongoing use.

//Begin while loop, continuing while there are still atoms left to assign. Loop structure:
//1. Check if less than 2 elements remain. If so, assign all atoms and end loop.
//2. Check if there are more than 1000 atoms left to assign. If so, assign proportionate amount of the most common element, then repeat loop
//3. If there are less than 1000(?) atoms left and more than 1 element, proceed to use alias method to choose remaining elements. Aliases do not need to be assigned until this step is reached. 

//Reset active elements if neccesary to undo changes from initializing alias.

function classifyAtoms(amt) {
	amt = amt.floor();
	setActiveWeights();
	let selected = {};
	let elements = [...player.a.activeElements];
	let totalWeight = player.a.totalElementalWeight;
	
	while (amt.gte(2000)) {
		if (elements.length < 2) {
			let elem = elements[0] || elementData[101];
			let base = selected[elem] || new Decimal(0);
			selected[elem] = base.add(amt);
			amt = new Decimal(0);
			return selected;
		}
		
		totalWeight = getGroupWeight(elements)
		let elem = elements.shift();
		let eWeight = getElementWeight(elementData[elem].position)
		let base = selected[elem] || new Decimal(0);
		let tAmt = eWeight.div(totalWeight).mul(amt).floor();
		selected[elem] = base.add(tAmt);
		amt = amt.sub(tAmt);
	}
	amt = amt.floor();
	setAliases(elements);
	while (amt.gt(0)) {
		let elem = randomElement(elements);
		let base = selected[elem] || new Decimal(0);
		selected[elem] = base.add(1);
		amt = amt.sub(1);
	}
	return selected;
}

function assignAtoms(selected) {
	for (elem in selected) {
		let amt = selected[elem];
		let pos = elementData[elem].position;
		player.a.elementCounts[pos] = player.a.elementCounts[pos].add(amt);
		player.a.points = player.a.points.sub(amt).floor().max(0);
	}
	updateAllElementGrids();
}

function updateElementGrid(id) {
	let amt = player.a.grid[id];
	player.a.grid[id] = amt.gte(10) ? amt.sub(10) : amt.add(1);
}

function updateAllElementGrids() {
	for (x in player.a.activeElements) {
			updateElementGrid(player.a.activeElements[x]);
	}
}

/*
//given an amount of atoms, return a distribution of them all based on weight of active elements
function classifyAtoms(amt, recData) {
	//around 1000 atoms can be processed without noticeable slowdown at the moment
	//check if atoms are less than 1000. If not, determine portion of atoms proportionate to element 0's rarity, and re-run function with those atoms assigned
	
	//initializing
	let elements;
	let retData;
	let totalWeight;
	if (!recData) {
		setActiveWeights();
		elements = player.a.activeElements;
		retData = {};
		totalWeight = player.a.totalElementalWeight;
	} else {
		elements = recData.elements;
		retData = recData.prevResults;
		totalWeight = recData.totalWeight;
	}
	elements = [...elements];
	
	// if there are less than 2 elements left to choose from, skip the rest and assign all
	if (elements.length < 2) {
		//debugger;
		let elem = elements[0] || "101";
		if (!retData[elem]) {
			retData[elem] = new Decimal(amt)
		} else {
			retData[elem] = retData[id].add(amt)
		}
		return retData;
	}
	
	
	//checking atom count and calling recursively if necessary
	if (amt.gte(1000)) {
		// assigning 100,000 atoms and element0 has 90% weight - assign 90,000 atoms. (e0weight/totalweight)*atoms
		totalWeight=getGroupWeight(elements);
		let e0weight = getElementWeight(elementData[elements[0]].position);
		let assign = e0weight.div(totalWeight).mul(amt).floor();
		retData[elements[0]] = assign;
		elements.shift();
		totalWeight = totalWeight.sub(e0weight);
		let feedData = {totalWeight:totalWeight,elements:elements,prevResults:retData}
		
		return classifyAtoms(amt.sub(assign), feedData);
	} else {
		//debugger;
	}
	//process remainder if amount is less than 1000
	for (let i = 0; i < amt; i++) {
		totalWeight=getGroupWeight(elements);
		let id = randomElement(false, elements, totalWeight);
		if (!retData[id]) {
			retData[id] = new Decimal(1)
		} else {
			retData[id] = retData[id].add(1)
		}
	}
	return retData;
}
*/

function isNumber(n){
    return !isNaN(n) && ((typeof n == 'number' && isFinite(n))|| Decimal.prototype.isPrototypeOf(n)); 
 }

/*function getClassifyAmount() {
	//make sure is number, check mode, calculate amount, clamp between 0 and current atoms
	player.a.classifyAmount = parseInt(player.a.classifyAmount);
	if (!isNumber(player.a.classifyAmount)) player.a.classifyAmount = 1;
	let atoms = player.a.points.floor();
	let amt = player.a.classifyMode ? player.a.classifyAmount : atoms * player.a.classifyAmount * 0.01;
	amt = Math.min(Math.max(amt,0),atoms);
	return amt;
}*/

function getClassifyAmount() {
	if (!isNumber(player.a.classifyAmount)) player.a.classifyAmount = new Decimal(1);
	let atoms = player.a.points.floor();
	let amt = player.a.classifyMode ? player.a.classifyAmount : player.a.classifyAmount.mul(0.01).mul(atoms);
	return amt.floor().clamp(0,atoms);
}

var elementColors = [
	"#592e2d",
	"#312d59",
	"#2d5948",
	"#4e592d"
]

var elementData = {
	101: {
		position:0,
		name: "Hydrogen",
		symbol: "H", 
		group: 0,
		unlocked() {
			return hasMilestone("a",3);
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			rarity = format(rarity)
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(2.3).mul(6);
			return eff;
		}
	},
	118: {
		position:1,
		name: "Helium",
		symbol: "He",
		group: 0,
		unlocked() {
			return hasMilestone("a",3);
		},
		getTooltip() {
			console.log(this.name)
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts electron gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(0.8).mul(3);
			return eff;
		}
	},
	201: {
		position:2,
		name: "Lithium",
		symbol: "Li",
		group: 0,
		unlocked() {
			return hasMilestone("a",6);
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	202: {
		position:3,
		name: "Beryllium",
		symbol: "Be",
		group: 0,
		unlocked() {
			return hasMilestone("a",6);
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	213: {
		position:4,
		name: "Boron",
		symbol: "B",
		group: 1,
		unlocked() {
			return hasMilestone("a",6);
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	214: {
		position:5,
		name: "Carbon",
		symbol: "C",
		group: 1,
		unlocked() {
			return hasMilestone("a",6);
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	215: {
		position:6,
		name: "Nitrogen",
		symbol: "N",
		group: 1,
		unlocked() {
			return hasMilestone("a",6);
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	216: {
		position:7,
		name: "Oxygen",
		symbol: "O",
		group: 1,
		unlocked() {
			return hasMilestone("a",6);
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	217: {
		position:8,
		name: "Fluorine",
		symbol: "F",
		group: 1,
		unlocked() {
			return hasMilestone("a",6);
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	218: {
		position:9,
		name: "Neon",
		symbol: "Ne",
		group: 1,
		unlocked() {
			return hasMilestone("a",6);
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	301: {
		position:10,
		name: "Sodium",
		symbol: "Na",
		group: 0,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	302: {
		position:11,
		name: "Magnesium",
		symbol: "Mg",
		group: 0,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	313: {
		position:12,
		name: "Aluminium",
		symbol: "Al",
		group: 1,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	314: {
		position:13,
		name: "Silicon",
		symbol: "Si",
		group: 1,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	315: {
		position:14,
		name: "Phosphorous",
		symbol: "P",
		group: 1,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	316: {
		position:15,
		name: "Sulfur",
		symbol: "S",
		group: 1,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	317: {
		position:16,
		name: "Chlorine",
		symbol: "Cl",
		group: 1,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	318: {
		position:17,
		name: "Argon",
		symbol: "Ar",
		group: 1,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	401: {
		position:18,
		name: "Potassium",
		symbol: "K",
		group: 0,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	402: {
		position:19,
		name: "Calcium",
		symbol: "Ca",
		group: 0,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	403: {
		position:20,
		name: "Scandium",
		symbol: "Sc",
		group: 2,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	404: {
		position:21,
		name: "Titanium",
		symbol: "Ti",
		group: 2,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	405: {
		position:22,
		name: "Vanadium",
		symbol: "V",
		group: 2,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	406: {
		position:23,
		name: "Chromium",
		symbol: "Cr",
		group: 2,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	407: {
		position:24,
		name: "Manganese",
		symbol: "Mn",
		group: 2,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	408: {
		position:25,
		name: "Iron",
		symbol: "Fe",
		group: 2,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	409: {
		position:26,
		name: "Cobalt",
		symbol: "Co",
		group: 2,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	410: {
		position:27,
		name: "Nickel",
		symbol: "Ni",
		group: 2,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	411: {
		position:28,
		name: "Copper",
		symbol: "Cu",
		group: 2,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	412: {
		position:29,
		name: "Zinc",
		symbol: "Zn",
		group: 2,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	413: {
		position:30,
		name: "Gallium",
		symbol: "Ga",
		group: 1,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	414: {
		position:31,
		name: "Germanium",
		symbol: "Ge",
		group: 1,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	415: {
		position:32,
		name: "Arsenic",
		symbol: "As",
		group: 1,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	416: {
		position:33,
		name: "Selenium",
		symbol: "Se",
		group: 1,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	417: {
		position:34,
		name: "Bromine",
		symbol: "Br",
		group: 1,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	418: {
		position:35,
		name: "Krypton",
		symbol: "Kr",
		group: 1,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	501: {
		position:36,
		name: "Rubidium",
		symbol: "Rb",
		group: 0,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	502: {
		position:37,
		name: "Strontium",
		symbol: "Sr",
		group: 0,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	503: {
		position:38,
		name: "Yttrium",
		symbol: "Y",
		group: 2,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	504: {
		position:39,
		name: "Zirconium",
		symbol: "Zr",
		group: 2,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	505: {
		position:40,
		name: "Niobium",
		symbol: "Nb",
		group: 2,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	506: {
		position:41,
		name: "Molybdenum",
		symbol: "Mo",
		group: 2,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	507: {
		position:42,
		name: "Technetium",
		symbol: "Tc",
		group: 2,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	508: {
		position:43,
		name: "Ruthenium",
		symbol: "Ru",
		group: 2,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	509: {
		position:44,
		name: "Rhodium",
		symbol: "Rh",
		group: 2,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	510: {
		position:45,
		name: "Palladium",
		symbol: "Pd",
		group: 2,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	511: {
		position:46,
		name: "Silver",
		symbol: "Ag",
		group: 2,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	512: {
		position:47,
		name: "Cadmium",
		symbol: "Cd",
		group: 2,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	513: {
		position:48,
		name: "Indium",
		symbol: "In",
		group: 1,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	514: {
		position:49,
		name: "Tin",
		symbol: "Sn",
		group: 1,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	515: {
		position:50,
		name: "Antimony",
		symbol: "Sb",
		group: 1,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	516: {
		position:51,
		name: "Tellurium",
		symbol: "Te",
		group: 1,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	517: {
		position:52,
		name: "Iodine",
		symbol: "I",
		group: 1,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	},
	518: {
		position:53,
		name: "Xenon",
		symbol: "Xe",
		group: 1,
		unlocked() {
			return false;
		},
		getTooltip() {
			let rarity = getElementWeight(this.position).mul(1000);
			rarity = rarity < (1/1000) ? rarity.toExponential(3) : rarity.toFixed(3);
			return "Rarity: " + rarity + "\n\
			Effect: Boosts energy gain\n\
			Currently: " + this.getEffect().toFixed(3) + "x";
		},
		getEffect() {
			let eff = player.a.elementCounts[this.position].add(1);
			if (eff.eq(1)) return eff;
			eff = eff.log10().add(1).pow(1.1).mul(2);
			return eff;
		}
	}	
}

//var elementCounts = new Array(Object.keys(elementData).length)
//var elementWeights = new Array(Object.keys(elementData).length)