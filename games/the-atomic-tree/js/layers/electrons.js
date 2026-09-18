
addLayer("l", {
    name: "electrons", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "L", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
		total: new Decimal(0),
		best: new Decimal(0)
    }},
    color: "#c70e0e",
    requires: new Decimal(1e16), // Can be a function that takes requirement increases into account
    resource: "electrons", // Name of prestige currency
    baseResource: "energy", // Name of resource prestige is based on
    baseAmount() {return player.e.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
	branches: ["e"],
    exponent: 0.2, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
		let r12boost = buyableEffect("r", 12);
		
		//upgrades
		if (hasNUpg(12)) mult=mult.mul(getNEff(12));
		
		//buyables
		if (r12boost.gte(1)) mult=mult.mul(r12boost);
		
		//element boosts
		if (getElementCount(118).gte(1)) mult = mult.mul(gridEffect("a",118));
		
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
	effect() {
		//effect 0: boost energy gain
		//effect 1: greatly boost aether gain
		let eff = [new Decimal(1), new Decimal(1)]
		if (getBuyableAmount("l", 12).gte(1)) {
			eff[0] = eff[0].add(player.l.points);
			let p24boost = hasPUpg(24) ? getPEff(24) : 1;
			eff[0] = eff[0].pow(0.6).mul(p24boost).mul(4).add(1);
		}
		if (getBuyableAmount("l", 12).gte(4)) {
			eff[1] = eff[1].add(player.l.points);
			eff[1] = eff[1].pow(1.1).add(1);
		}
		return eff;
	},
	effectDescription() {
		let desc = "";
		let eff = this.effect();
		if (getBuyableAmount("l", 12).gte(1)) {
			desc += "which are boosting energy gain by " + effectText(format(eff[0]), this.color) + "x";
		} else {
			desc += "which are not currently providing any passive effect."
		}
		if (getBuyableAmount("l", 12).gte(4)) {
			desc += ", and also boosting aether gain by " + effectText(format(eff[1]), this.color) + "x";
		}
		return desc;
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
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "l", description: "L: Reset for electrons", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
	passiveGeneration() {
		let gen = 0;
		if (hasMilestone("n",2)) gen += 0.05;
		if (hasMilestone("a",0)) gen += 0.1;
		if (hasMilestone("r",3)) gen += 1;
		return gen;
	},
	upgrades: {
		
		
	},
	buyables: {
		rows: 2,
        cols: 2,
        11: {
			title: "Aetherize",
			cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let cost = Decimal.pow(6, x.pow(1.2))
                return cost.floor()
            },
			effect() { // Effects of owning x of the items, x is a decimal
                let x = getBuyableAmount("l", 11);
				let exp = 0.95;
                let base = new Decimal(100);
                return Decimal.pow(base, x.pow(exp));
            },
			display() { // Everything else displayed in the buyable button after the title
                let extra = ""
                if (player.tab != this.layer) return 
                return "Multiply aether gain.\n\
				Cost: " + format(tmp[this.layer].buyables[this.id].cost)+" electrons\n\
				Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + "\n\
                Effect: " + format(tmp[this.layer].buyables[this.id].effect)+"x" + extra
            },
            unlocked() { return true }, 
            canAfford() {
                    return player.l.points.gte(tmp[this.layer].buyables[this.id].cost)
			},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                if (this.canAfford()) {
                    player.l.points = player.l.points.sub(cost).max(0)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1).max(1)
                }
            }
        },
		12: {
			title: "Upgrayedd",
			cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
				let base = new Decimal(100);
				let exp = x.add(1);
				let scale = Decimal.pow(10,x.pow(1.7));
				let cost = Decimal.pow(base,exp).mul(scale);
                return cost.floor();
            },
			levelEffects: [
				"Adds a passive effect to electrons.", 
				"Adds a new row of energy upgrades.", 
				"Adds a new row of proton upgrades.",
				"Adds a second passive effect to electrons."
			],
			effect() { // Effects of owning x of the items, x is a decimal
                
            },
			display() { // Everything else displayed in the buyable button after the title
                let extra = "";
				let amt = getBuyableAmount(this.layer, this.id);
				if (amt > 0) {
					var textAmt = Math.min(amt,this.levelEffects.length)
					extra += "\n\n\
					Currently unlocked effects: "
					for(i=0;i<textAmt;i++) {
						extra += "\n\
						" + this.levelEffects[i];
					}
					
				}
				if (amt < this.levelEffects.length) {
					extra += "\n\n\
					Next effect unlocked: \n\
					" + this.levelEffects[amt];
				} else {
					extra += "\n\
					*ALL EFFECTS UNLOCKED*\n\
					\n\
					Some upgrades will still be boosted by this buyable's level."
				}
                if (player.tab != this.layer) return 
                return "Unlocks various bonuses and upgrades.\n\
				Cost: " + format(tmp[this.layer].buyables[this.id].cost)+" electrons\n\
				Amount: " + formatWhole(amt) + extra;
            },
            unlocked() { return hasMilestone("l",1) }, 
            canAfford() {
                    return player.l.points.gte(tmp[this.layer].buyables[this.id].cost)
			},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                if (this.canAfford()) {
                    player.l.points = player.l.points.sub(cost).max(0)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1).max(1)
                }
            }
        },
		21: {
			title: "Protonical",
			cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
				let base = new Decimal(5000);
				let growth = new Decimal(2.5);
				let scale = new Decimal (1.33);
                let cost = base.mul(Decimal.pow(growth, x.pow(scale)))
                return cost.floor()
            },
			effect() { // Effects of owning x of the items, x is a decimal
				let p23boost = hasPUpg(23) ? getPEff(23) : 1;
                let x = getBuyableAmount(this.layer, this.id);
				let exp = 1.05;
                let base = new Decimal(1e15);
                return Decimal.pow(base.mul(p23boost), x.pow(exp));
            },
			display() { // Everything else displayed in the buyable button after the title
                let extra = ""
                if (player.tab != this.layer) return 
                return "Divide proton cost.\n\
				Cost: " + format(tmp[this.layer].buyables[this.id].cost)+" electrons\n\
				Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + "\n\
                Effect: /" + format(tmp[this.layer].buyables[this.id].effect) + extra
            },
            unlocked() { return hasMilestone("l",3) }, 
            canAfford() {
                    return player.l.points.gte(tmp[this.layer].buyables[this.id].cost)
			},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                if (this.canAfford()) {
                    player.l.points = player.l.points.sub(cost).max(0)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1).max(1)
                }
            }
        },
		22: {
			title: "Supercharge",
			cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
				let base = new Decimal(1e25);
				let growth = new Decimal(10);
				let scale = new Decimal (1.5);
                let cost = base.mul(Decimal.pow(growth, x.pow(scale)))
                return cost.floor()
            },
			effect() { // Effects of owning x of the items, x is a decimal
                let x = getBuyableAmount(this.layer, this.id);
				let exp = 1.05;
                let base = new Decimal(100);
                return Decimal.pow(base, x.pow(exp));
            },
			display() { // Everything else displayed in the buyable button after the title
                let extra = ""
                if (player.tab != this.layer) return 
                return "Multiply energy gain.\n\
				Cost: " + format(tmp[this.layer].buyables[this.id].cost)+" electrons\n\
				Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + "\n\
                Effect: " + format(tmp[this.layer].buyables[this.id].effect) + "x" + extra
            },
            unlocked() { return hasMilestone("l",4) }, 
            canAfford() {
                    return player.l.points.gte(tmp[this.layer].buyables[this.id].cost)
			},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                if (this.canAfford()) {
                    player.l.points = player.l.points.sub(cost).max(0)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1).max(1)
                }
            }
        },
	},
	milestones: {
        0: {
            requirementDescription: "15 total electrons",
            effectDescription: "Keep energy upgrades on electron reset.",
            done() { return player.l.total.gte(15) }
        },
		1: {
			requirementDescription: "100 total electrons",
            effectDescription: "Unlock another electron buyable.",
            done() { return player.l.total.gte(100) }
		},
        2: {
            requirementDescription: "1000 total electrons",
            effectDescription: "Generate 100% of your pending energy gain per second.",
            done() { return player.l.total.gte(1e3) }
        },
		3: {
			requirementDescription: "5000 total electrons",
            effectDescription: "Unlock a third electron buyable.",
            done() { return player.l.total.gte(5000) }
		},
		4: {
			requirementDescription: "1e25 total electrons",
            effectDescription: "Unlock yet another electron buyable.",
            done() { return player.l.total.gte(1e25) }
		},
    },
    layerShown(){return player.p.unlocked}
})
