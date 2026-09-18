addLayer("a", {
    name: "atoms", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
		total: new Decimal(0),
		best: new Decimal(0),
		classifyAmount:new Decimal(1),
		classifyMode: true, //true means assign amount, false means assign percentage of current atoms
		elementalRarityScaling:50, //scale of 50 means each element is 50 times less likely to come up than the previous
		totalElementalWeight:new Decimal(1), //Total weight of all elements combined
		elementCounts:new Array(Object.keys(elementData).length).fill(new Decimal(0)), //Individual currency counts for each element
		elementWeights:new Array(Object.keys(elementData).length).fill(new Decimal(0)), //Caching the weight for each element
		activeElements:new Array(), //Caching a list of all elements currently active for selection
		elementAliases:new Array(Object.keys(elementData).length).fill(0), //aliases for each selection bucket
		bucketProbabilities:new Array(Object.keys(elementData).length).fill(new Decimal(0)) //probability for each bucket of choosing alias
    }},
    color: "#20b347",
    requires: new Decimal(1e190), // Can be a function that takes requirement increases into account
    resource: "unclassified atoms", // Name of prestige currency
    baseResource: "energy", // Name of resource prestige is based on
    baseAmount() {return player.e.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
	branches: ["p","n","l"],
    exponent: 0.002, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
	effect() {
		let eff = player.a.points.add(1);
		let exp = new Decimal(4);
		eff = eff.pow(exp);
		return eff;
	},
	effectDescription() {
		let desc = "which are boosting aether gain by " + effectText(format(this.effect()), this.color) + "x";
		return desc
	},
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "a", description: "A: Reset for atoms", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
	doReset(resettingLayer) {
		let keep = [];
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
	},
	update(diff) {
		if (!player.a.elementCounts[0]) resetElementCounts();
		if (!player.a.elementWeights[0] || player.a.elementWeights[0].eq(0)) setElementWeights();
		if (!player.a.activeElements[0]) setActiveElements();
	},
	upgrades: {

	},
	infoboxes: {
		ptable: {
			title: "Periodic Table",
			body() {
				//return "Not yet implemented! Should hopefully be working soon in an upcoming version."
				return "Classify your atoms to determine which element they are. Lower atomic weight elements are far more common than high atomic weight elements. Each element provides a different benefit. Hover over an element to see a tooltip outlining the element's bonus. Be warned that the Hydrogen effect doesn't scale very well so you probably want to leave a few atoms unclassified!<br><br>This tab will force you into single tab mode by default, even if you have it disabled in options. Use the toggle below this infobox to cancel the behavior, but it may cause display issues."
			}
		}
	},
	tabFormat: {
		"Milestones": {
			content: [
				"main-display",
				"prestige-button",
				["display-text",
				function() {
					return "You have " + format(player.e.points) + " energy"
				}],
				"blank",
				"resource-display",
				"milestones"
			]
		},
		"Classified Atoms": {
			content: [
				"main-display",
				["infobox", "ptable"],
				["clickable", 12],
				"blank",
				"blank",
				["display-text", 
				function() {
					return "How many atoms would you like to classify?"
				}],
				"blank",
				["text-input","classifyAmount",{height:"30px",width:"200px",borderRadius:"10px",backgroundColor:"#ffbade",color:"#021700",fontSize:"15px"}],
				["toggle-text-mod", ["a", "classifyMode"],{color:"#4a0027",textShadow:"#4a0027 0px 0px 10px"}],
				"blank",
				["clickable", 11],
				"blank",
				"blank",
				"grid"
			],
			unlocked() {
				return hasMilestone("a",3);
			}
		}
	},
	grid: {
		rows: 5, // If these are dynamic make sure to have a max value as well!
		cols: 18,
		getStartData(id) {
			return new Decimal(0); 
		},
		getUnlocked(id) { 
			if (!elementData[id]) return true;
			if (!elementData[id].unlocked) return true;
			return elementData[id].unlocked()
		},
		getCanClick(data, id) {
			return false
		},
		//onClick(data, id) { 
			//player[this.layer].grid[id] = 0
		//},
		getDisplay(data, id) {
			let elem = elementData[id];
			if (!elem) return "";
			let aWeight = elem.position + 1;
			let symColor = "#62b377";
			return "<h3 style='color: " + symColor + "'>" + aWeight + "</h3>\n\
			<h1 style='color:" + symColor + ";text-shadow:" + symColor + " 0px 0px 8px'>" + elem.symbol + "</h1>\n\
			<h3>" + player.a.elementCounts[elem.position] + "</h3>";
		},
		getStyle(data, id) {
			let elem = elementData[id];
			let bgColor = elem ? elementColors[elem.group] : "black";
			let vis = elem ? "visible" : "hidden";
			return {"visibility":vis,"width":"65px","height":"65px","backgroundColor":bgColor}
		},
		getTooltip(data,id) {
			if (!elementData[id]) return "";
			if (!elementData[id].getTooltip) return "";
			return elementData[id].getTooltip();
		},
		getEffect(data,id) {
			if (!elementData[id]) return new Decimal(0);
			if (!elementData[id].getEffect) return new Decimal(0);
			return elementData[id].getEffect();
		}
	},
	clickables: {
		11: {
            display() {
                return "<h3>Click to classify " + getClassifyAmount() + " atoms.</h3>"
            },
            canClick() {return getClassifyAmount().gt(0)},
            onClick() {
				let amt = getClassifyAmount();
				if (amt.lt(1)) return;
				let atoms = classifyAtoms(getClassifyAmount());
				assignAtoms(atoms);
            },
            style: {'height':'130px', 'width':'130px'},
        },
		12: {
            display() {
				let disp = player.forceSingleAtomTab ? "<h3>Stop forcing this tab into single tab mode!</h3>\n\
				May cause display issues." : "<h3>Bring back the forced single tab mode!</h3>"
                return disp
            },
            canClick() {return true},
            onClick() {
				player.forceSingleAtomTab = !player.forceSingleAtomTab;
            },
            style: {'height':'40px', 'width':'150px', 'backgroundColor':'#5e3904'},
        }
	},
	milestones: {
		0: {
            requirementDescription: "1 atom",
            effectDescription: "Generate 10% of your pending electron gain per second.",
            done() { return player.a.total.gte(1) }
        },
		1: {
			requirementDescription: "2 total atoms",
            effectDescription: "Keep energy upgrades on all resets.",
            done() { return player.a.total.gte(2) }
		},
		2: {
			requirementDescription: "3 total atoms",
            effectDescription: "Keep all previous milestones on atom reset.",
            done() { return player.a.total.gte(3) }
		},
		3: {
			requirementDescription: "5 total atoms",
            effectDescription: "Unlock atom classification.",
            done() { return player.a.total.gte(5) }
		},
		4: {
			requirementDescription: "8 total atoms",
            effectDescription: "Keep all previous upgrades on atom reset.",
            done() { return player.a.total.gte(8) }
		},
		5: {
			requirementDescription: "15 total atoms",
            effectDescription: "Automatically buy protons and neutrons as they become affordable.",
            done() { return player.a.total.gte(15) },
			toggles: [
				["p", "autoEnabled"],
				["n", "autoEnabled"]
			]
		},
		6: {
			requirementDescription: "500 total atoms",
            effectDescription: "Unlock another row of elements (second row currently has no effect.)",
            done() { return player.a.total.gte(500) }
		}
		
    },
    layerShown(){return player.n.unlocked}
})