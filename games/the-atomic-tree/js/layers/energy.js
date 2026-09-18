addLayer("e", {
    name: "energy", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
		total: new Decimal(0),
		best: new Decimal(0)
    }},
    color: "#d7de04",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "energy", // Name of prestige currency
    baseResource: "aether", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
		let elecEff = tmp.l.effect[0];
		let neutEff = tmp.n.effect;
		
		//currency effects
		if (elecEff && elecEff.gte(1)) mult = mult.mul(elecEff);
		if (neutEff && neutEff.gte(1)) mult = mult.mul(neutEff);
		
		//upgrade effects
		if (hasEUpg(14)) mult=mult.mul(getEEff(14));
		if (hasEUpg(22)) mult=mult.mul(getEEff(22));
		if (hasEUpg(24)) mult=mult.mul(getEEff(24));
		if (hasPUpg(11)) mult=mult.mul(getPEff(11));
		if (hasEUpg(34)) mult=mult.mul(getEEff(34));
		if (hasPUpg(22)) mult=mult.mul(getPEff(22));
		
		//buyables
		if (getBuyableAmount("l", 22).gte(1)) mult = mult.mul(buyableEffect("l", 22));
		
		//element boosts
		if (getElementCount(101).gte(1)) mult = mult.mul(gridEffect("a",101));
		
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "e", description: "E: Reset for energy", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
	passiveGeneration() {
		let gen = 0;
		if (hasMilestone("p",1)) gen += 0.1;
		if (hasMilestone("l",2)) gen += 1;
		return gen;
	},
	doReset(resettingLayer) {
		let keep = [];
		let upgKeep = hasMilestone("a",1);
		upgKeep = upgKeep || (hasMilestone("p", 0) && resettingLayer=="p");
		upgKeep = upgKeep || (hasMilestone("l", 0) && resettingLayer=="l");
		upgKeep = upgKeep || (hasMilestone("n", 0) && resettingLayer=="n");
		upgKeep = upgKeep || (hasMilestone("r", 1) && resettingLayer=="r");
		upgKeep && keep.push("upgrades");
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
	},
	upgrades: {
		11: {
			title: "Violate Thermodynamics",
			description: "Begin producing aether from nothing!",
			cost: new Decimal(1),
			effect() {
				return true
			}
		},
		12: {
			title: "Energized Gains",
			description: "Multiply aether gain based on current energy",
			cost: new Decimal(2),
			softcaps: [
				[1e15, 0.25]
			],
			effect() {
				let eff = player.e.points.add(2);
				eff = eff.pow(1/3);
				eff = softcapValue(eff, this.softcaps);
				return eff;
			},
			effectDisplay() {
				let eff = getEEff(this.id);
				let dis = format(eff) + "x";
				if (this.softcaps && eff.gte(this.softcaps[0][0])) dis += "\n\
				(softcapped)"
				return dis;
			},
			unlocked() {
				return hasEUpg(11);
			}
		},
		13: {
			title: "Morether",
			description: "Doubles base gain of aether",
			cost: new Decimal(10),
			effect() {
				let eff = 2;
				return eff;
			},
			effectDisplay() {
				let dis = format(getEEff(this.id)) + "x";
				return dis;
			},
			unlocked() {
				return hasEUpg(12);
			}
		},
		14: {
			title: "Energy Breeder",
			description: "Multiply energy gain based on current energy",
			cost: new Decimal(20),
			softcaps: [
				[1e11, 0.2]
			],
			effect() {
				let eff = player.e.points.add(2);
				eff = eff.pow(1/5);
				eff = softcapValue(eff, this.softcaps);
				return eff;
			},
			effectDisplay() {
				let eff = getEEff(this.id);
				let dis = format(eff) + "x";
				if (this.softcaps && eff.gte(this.softcaps[0][0])) dis += "\n\
				(softcapped)"
				return dis;
			},
			unlocked() {
				return hasEUpg(13);
			}
		},
		21: {
			title: "Self Synergizing",
			description: "Multiply aether gain based on current aether",
			cost: new Decimal(75),
			softcaps: [
				[1e15, 0.25]
			],
			effect() {
				let eff = player.points.add(2);
				let e31boost = hasEUpg(31) ? getEEff(31) : new Decimal(1);
				e31boost = e31boost.mul(1.5);
				eff = eff.log10().add(1).pow(e31boost);
				eff = softcapValue(eff, this.softcaps);
				return eff;
			},
			effectDisplay() {
				let eff = getEEff(this.id);
				let dis = format(eff) + "x";
				if (this.softcaps && eff.gte(this.softcaps[0][0])) dis += "\n\
				(softcapped)";
				return dis;
			},
			unlocked() {
				return hasEUpg(14);
			}
		},
		22: {
			title: "Superconductor",
			description: "Double base gain of energy",
			cost: new Decimal(150),
			effect() {
				let eff = 2;
				return eff;
			},
			effectDisplay() {
				let dis = format(getEEff(this.id)) + "x";
				return dis;
			},
			unlocked() {
				return hasEUpg(21);
			}
		},
		23: {
			title: "Batteries",
			description: "Double aether gain for each purchased energy upgrade",
			cost: new Decimal(500),
			effect() {
				let eff = player.e.upgrades.length;
				let base = hasEUpg(34) ? new Decimal(4) : new Decimal(2);
				eff = base.pow(eff);
				return eff;
			},
			effectDisplay() {
				let dis = format(getEEff(this.id)) + "x";
				return dis;
			},
			unlocked() {
				return hasEUpg(22);
			}
		},
		24: {
			title: "Waiting Game",
			description: "Multiply energy gain based on current aether",
			cost: new Decimal(75000),
			effect() {
				let n11boost = hasNUpg(11) ? getNEff(11) : new Decimal(1);
				let eff = player.points.add(2);
				let exp = n11boost.mul(1.15);
				eff = eff.log10().add(1).pow(exp);
				return eff;
			},
			effectDisplay() {
				let dis = format(getEEff(this.id)) + "x";
				return dis;
			},
			unlocked() {
				return hasEUpg(23);
			}
		},
		31: {
			title: "Electrical Boost",
			description: "Increase exponent of <b>'Self Synergizing'</b> effect based on current electrons",
			cost: new Decimal(5e36),
			effect() {
				let eff = player.l.points.add(1);
				eff = eff.log10().add(1).pow(0.45);
				return eff;
			},
			effectDisplay() {
				let dis = format(getEEff(this.id)) + "x";
				return dis;
			},
			unlocked() {
				return getBuyableAmount("l", 12).gte(2) || hasMilestone("a",4);
			}			
		},
		32: {
			title: "Increased Latency",
			description: "Multiplies the exponent of the <b>'Latent Energy'</b> effect.",
			cost: new Decimal(1e44),
			effect() {
				let eff = new Decimal(1.5);
				return eff;
			},
			effectDisplay() {
				let dis = format(getEEff(this.id)) + "x";
				return dis;
			},
			unlocked() {
				return getBuyableAmount("l", 12).gte(2) || hasMilestone("a",4);
			}			
		},
		33: {
			title: "Electrifaether",
			description: "Multiplies aether gain based on current electrons",
			cost: new Decimal(1e50),
			effect() {
				let eff = player.l.points.add(2);
				let n14boost = hasNUpg(14) ? getNEff(14) : new Decimal(1);
				eff = eff.log10().add(1).mul(n14boost).pow(2).mul(2000);
				return eff;
			},
			effectDisplay() {
				let dis = format(getEEff(this.id)) + "x";
				return dis;
			},
			unlocked() {
				return getBuyableAmount("l", 12).gte(2) || hasMilestone("a",4);
			}			
		},
		34: {
			title: "Electron Buffer",
			description: "Doubles the <b>'Batteries'</b> base and applies the effect to energy gain at a reduced rate.",
			cost: new Decimal(5e52),
			effect() {
				let eff = getEEff(23);
				eff = eff.pow(1/5).mul(500);
				return eff;
			},
			effectDisplay() {
				let dis = format(getEEff(this.id)) + "x";
				return dis;
			},
			unlocked() {
				return getBuyableAmount("l", 12).gte(2) || hasMilestone("a",4);
			}			
		}
	},
    layerShown(){return true}
})