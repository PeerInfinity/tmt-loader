addLayer("p", {
    name: "protons", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
		total: new Decimal(0),
		best: new Decimal(0),
		autoEnabled: true
    }},
    color: "#5676f5",
    requires: new Decimal(1e7), // Can be a function that takes requirement increases into account
    resource: "protons", // Name of prestige currency
    baseResource: "energy", // Name of resource prestige is based on
    baseAmount() {return player.e.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
	branches: ["e"],
	canBuyMax() {
			let can = false;
			if (hasMilestone("p",2)) can = true;
			return can;
	},
    exponent() {
		let exp = new Decimal(1.65);
		//if (hasPUpg(14)) exp = exp.minus(getPEff(14)).max(1);
		return exp;
	},
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
		let l21boost = buyableEffect("l", 21);
		let r11boost = buyableEffect("r", 11);
		if (hasPUpg(14)) mult = mult.div(getPEff(14));
		if (l21boost.gt(1)) mult = mult.div(l21boost);
		if (r11boost.gt(1)) mult = mult.div(r11boost);
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
	effect() {
		let eff = player.p.points.add(1);
		let exp = new Decimal(2);
		if (hasPUpg(12)) exp = exp.add(getPEff(12));
		eff = eff.pow(exp);
		return eff;
	},
	effectDescription() {
		let desc = "which are boosting aether gain by " + effectText(format(this.effect()), this.color) + "x";
		/*
		let desc = "which are boosting aether gain by <h2 style='color:" + this.color + "; text-shadow:" + this.color + " 0px 0px 10px'>" + format(this.effect()) + "x</h2>";
		*/
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
        {key: "p", description: "P: Reset for protons", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
	update(diff) {
		//if (hasMilestone("p",1) generatePoints("p",diff);
	},
	upgrades: {
		11: {
			title: "Latent Energy",
			description: "Muliply energy gain based on highest number of protons reached",
			cost: new Decimal(2),
			effect() {
				let eff = player.p.best;
				let exp = hasEUpg(32) ? getEEff(32) : new Decimal(1);
				exp = exp.mul(1.8);
				eff = eff.add(1).pow(exp).add(1);
				return eff;
			},
			effectDisplay() {
				let dis = format(getPEff(this.id)) + "x";
				return dis;
			},
			unlocked() {
				return player.p.best.gt(0);
			}
		},
		12: {
			title: "Proton Power",
			description: "Increase proton effect exponent based on current energy",
			cost: new Decimal(4),
			softcaps: [
				[11, 0.25]
			],
			effect() {
				let eff = player.e.points;
				let p21boost = hasPUpg(21) ? getPEff(21) : 1;
				eff = eff.add(1).log10().add(1).pow(0.5).div(3).mul(p21boost);
				eff = softcapValue(eff, this.softcaps);
				return eff;
			},
			effectDisplay() {
				let eff = getPEff(this.id);
				let dis = "+" + format(eff);
				if (this.softcaps && eff.gte(this.softcaps[0][0])) dis += "\n\
				(softcapped)"
				return dis;
			},
			unlocked() {
				return hasPUpg(11) || hasMilestone("a",4);
			}
		},
		13: {
			title: "Back to Basics",
			description: "Multiply aether gain based on highest number of protons reached",
			cost: new Decimal(6),
			effect() {
				let eff = player.p.best;
				let n13boost = hasNUpg(13) ? getNEff(13) : new Decimal(1);
				eff=eff.add(1).mul(5).pow(3).mul(n13boost);
				return eff;
			},
			effectDisplay() {
				let dis = format(getPEff(this.id)) + "x";
				return dis;
			},
			unlocked() {
				return hasPUpg(12) || hasMilestone("a",4);
			}
		},
		14: {
			title: "The Cheapening",
			description: "Proton cost scales better based on current aether",
			cost: new Decimal(8),
			effect() {
				let eff = player.points;
				eff = eff.add(1).log10().add(1).pow(2.8);
				return eff;
			},
			unlocked() {
				return hasPUpg(13) || hasMilestone("a",4);
			}
		},
		21: {
			title: "Upgrade Power",
			description: "The effect of <b>'Proton Power'</b> is boosted based on <b>Upgrayedd</b>'s level.",
			cost: new Decimal(54),
			effect() {
				let eff = getBuyableAmount("l", 12);
				eff = eff.add(1).pow(0.3).mul(1.5);
				return eff;
			},
			effectDisplay() {
				let dis = format(getPEff(this.id)) + "x";
				return dis;
			},
			unlocked() {
				return getBuyableAmount("l", 12).gte(3) || hasMilestone("a",4);
			}
		},
		22: {
			title: "Protenergy",
			description: "Proton effect boosts energy gain at a reduced rate",
			cost: new Decimal(57),
			effect() {
				let eff = tmp.p.effect;
				eff = eff.pow(0.3)
				return eff;
			},
			effectDisplay() {
				let dis = format(getPEff(this.id)) + "x";
				return dis;
			},
			unlocked() {
				return getBuyableAmount("l", 12).gte(3) || hasMilestone("a",4);
			}
		},
		23: {
			title: "Protonicallback",
			description: "Boosts the base of <b>Protonical</b> based on power of first electron effect.",
			cost: new Decimal(61),
			effect() {
				let eff = player.l.points;
				eff = eff.add(1).log10().add(1).pow(0.9).mul(20);
				return eff;
			},
			effectDisplay() {
				let dis = format(getPEff(this.id)) + "x";
				return dis;
			},
			unlocked() {
				return getBuyableAmount("l", 12).gte(3) || hasMilestone("a",4);
			}
		},
		24: {
			title: "Proton Infusion",
			description: "First electron effect is boosted based on <b>Upgrayedd</b>'s level.",
			cost: new Decimal(68),
			effect() {
				let eff = getBuyableAmount("l", 12);
				eff = eff.add(1).pow(1.5).mul(300);
				return eff;
			},
			effectDisplay() {
				let dis = format(getPEff(this.id)) + "x";
				return dis;
			},
			unlocked() {
				return getBuyableAmount("l", 12).gte(3) || hasMilestone("a",4);
			}
		}
	},
	milestones: {
        0: {
            requirementDescription: "3 protons",
            effectDescription: "Keep energy upgrades on proton reset.",
            done() { return player.p.points.gte(3) }
        },
		1: {
			requirementDescription: "5 protons",
            effectDescription: "Generate 10% of your pending energy gain per second.",
            done() { return player.p.points.gte(5) }
		},
		2: {
			requirementDescription: "8 protons",
            effectDescription: "You can buy max protons.",
            done() { return player.p.points.gte(8) }
		}
    },
    layerShown(){return player.e.unlocked}
})