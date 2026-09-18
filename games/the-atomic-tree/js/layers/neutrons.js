
addLayer("n", {
    name: "neutrons", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "N", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
		total: new Decimal(0),
		best: new Decimal(0),
		autoEnabled: true
    }},
    color: "#7a8a72",
    requires: new Decimal(1e105), // Can be a function that takes requirement increases into account
    resource: "neutrons", // Name of prestige currency
    baseResource: "energy", // Name of resource prestige is based on
    baseAmount() {return player.e.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
	branches: ["e"],
    exponent: 1.4, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
		let r13boost = buyableEffect("r", 13);
		if (r13boost.gt(1)) mult = mult.div(r13boost);
        return mult
    },
	canBuyMax() {
			let can = false;
			if (hasMilestone("n",1)) can = true;
			return can;
	},
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
	effect() {
		let base = new Decimal(2);
		let eff = player.n.points;
		eff = base.pow(eff).mul(3);
		return player.n.points.gte(1) ? eff : new Decimal(1); // weird return structure because the last mul gives you a free boost otherwise
	},
	effectDescription() {
		let desc = "which are boosting energy gain by " + effectText(format(this.effect()), this.color) + "x";
		return desc
	},
	doReset(resettingLayer) {
		let keep = [];
		let mstoneKeep = false;
		let upgKeep = false;
		
		mstoneKeep = mstoneKeep || (hasMilestone("a", 2) && resettingLayer=="a");
		mstoneKeep = mstoneKeep || (hasMilestone("r", 0) && resettingLayer=="r");
		mstoneKeep && keep.push("milestones");
		
		upgKeep = upgKeep || (hasMilestone("a", 4) && resettingLayer=="a");
		upgKeep = upgKeep || (hasMilestone("r", 1) && resettingLayer=="r");
		upgKeep && keep.push("upgrades");
		
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
	},
	autoPrestige() {
		return hasMilestone("a",5) && player[this.layer].autoEnabled;
	},
	resetsNothing() {
		return hasMilestone("r",2);
	},
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "n", description: "N: Reset for neutrons", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
	upgrades: {
		11: {
			title: "Still Waiting Game",
			description: "Multiplies the exponent of the <b>Waiting Game</b> effect based on best neutrons.",
			cost: new Decimal(4),
			effect() {
				let eff = player.n.best.add(1);
				eff = eff.log10().add(1).pow(0.6);
				return eff;
			},
			effectDisplay() {
				let dis = format(getNEff(this.id)) + "x";
				return dis;
			},
			unlocked() {
				return player.n.best.gte(1) || hasMilestone("a",4);
			}
		},
		12: {
			title: "Electroneutral",
			description: "Multiplies electron gain based on best neutrons.",
			cost: new Decimal(7),
			effect() {
				let eff = player.n.best.add(1);
				eff = eff.add(1).pow(0.25).mul(3);
				return eff;
			},
			effectDisplay() {
				let dis = format(getNEff(this.id)) + "x";
				return dis;
			},
			unlocked() {
				return hasNUpg(11) || hasMilestone("a",4);
			}
		},
		13: {
			title: "Better Basic Backing",
			description: "The effect of <b>Back to Basics</b> is multiplied based on current neutrons",
			cost: new Decimal(18),
			effect() {
				let eff = player.n.points.add(1);
				eff = eff.add(1).pow(2.5).mul(50);
				return eff;
			},
			effectDisplay() {
				let dis = format(getNEff(this.id)) + "x";
				return dis;
			},
			unlocked() {
				return hasNUpg(12) || hasMilestone("a",4);
			}
		},
		14: {
			title: "Do I smell softcaps?",
			description: "Mutiply base of <b>Electrifaether</b> based on current neutrons.",
			cost: new Decimal(45),
			effect() {
				let eff = getBuyableAmount("l", 12);
				eff = eff.add(1).pow(1.5).mul(300);
				return eff;
			},
			effectDisplay() {
				let dis = format(getNEff(this.id)) + "x";
				return dis;
			},
			unlocked() {
				return hasNUpg(13) || hasMilestone("a",4);
			}
		}
	},
	milestones: {
        0: {
            requirementDescription: "3 neutrons",
            effectDescription: "Keep energy upgrades on reset.",
            done() { return player.n.best.gte(3) }
        },
		1: {
            requirementDescription: "8 neutrons",
            effectDescription: "You can buy max neutrons.",
            done() { return player.n.best.gte(8) }
        },
        2: {
            requirementDescription: "15 neutrons",
            effectDescription: "Generate 5% of your pending electron gain per second.",
            done() { return player.n.best.gte(15) }
        }
    },
    layerShown(){return player.l.unlocked}
})