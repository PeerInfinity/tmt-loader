addLayer("r", {
    name: "resons", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
		total: new Decimal(0),
		best: new Decimal(0),
		resonance: new Decimal(0)
    }},
    color: "#c734b3",
    requires: new Decimal(1e205), // Can be a function that takes requirement increases into account
    resource: "resons", // Name of prestige currency
    baseResource: "aether", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
	branches: ["n","p"],
    exponent: 7,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
	canBuyMax() {
			let can = false;
			//if (hasMilestone("n",1)) can = true;
			return can;
	},
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
	effect() {
		let eff = player.r.points;
		let base = new Decimal(2);
		let exp = new Decimal(1.6);
		eff = base.pow(eff.pow(exp));
		return player.r.points.gte(1) ? eff : new Decimal(0);
	},
	effectDescription() {
		let desc = "which are producing " + effectText(format(this.effect()), this.color) + " resonance per second.";
		return desc
	},
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "r", description: "R: Reset for resons", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
	doReset(resettingLayer) {
		let keep = [];
        if (layers[resettingLayer].row > this.row) {
			layerDataReset(this.layer, keep);
			//player[this.layer].resonance = new Decimal(0);
		}
	},
	update(diff) {
		let resGain = tmp.r.effect;
		if (resGain.gte(1)) {
			player.r.resonance = player.r.resonance.add(resGain.mul(diff));
		}
	},
	upgrades: {

	},
	buyables: {
		rows: 1,
        cols: 5,
        11: {
			title: "Up Flavour",
			cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                return new Decimal(1)
            },
			effect() { // Effects of owning x of the items, x is a decimal
                let x = getBuyableAmount(this.layer, this.id);
				let exp = 15;
                return x.gte(1) ? x.add(1).log10().add(1).pow(exp) : new Decimal(1);
            },
			display() { // Everything else displayed in the buyable button after the title
                let extra = ""
                if (player.tab != this.layer) return 
                return "Divides proton cost.\n\
				Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + "\n\
                Effect: /" + format(tmp[this.layer].buyables[this.id].effect) + extra
            },
            unlocked() { return true }, 
            canAfford() {
                    return player.r.resonance.gte(tmp[this.layer].buyables[this.id].cost)
			},
            buy() { 
                //cost = tmp[this.layer].buyables[this.id].cost
                if (this.canAfford()) {
					let amt = player.r.resonance.floor();
					player.r.resonance = new Decimal(0);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(amt).max(1)
                }
            }
        },
		12: {
			title: "Down Flavour",
			cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                return new Decimal(1)
            },
			effect() { // Effects of owning x of the items, x is a decimal
                let x = getBuyableAmount(this.layer, this.id);
				let exp = 3;
                return x.gte(1) ? x.add(1).log10().add(1).pow(exp) : new Decimal(1);
            },
			display() { // Everything else displayed in the buyable button after the title
                let extra = ""
                if (player.tab != this.layer) return 
                return "Multiply electron gain.\n\
				Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + "\n\
                Effect: " + format(tmp[this.layer].buyables[this.id].effect)+"x" + extra
            },
            unlocked() { return true }, 
            canAfford() {
                    return player.r.resonance.gte(tmp[this.layer].buyables[this.id].cost)
			},
            buy() { 
                //cost = tmp[this.layer].buyables[this.id].cost
                if (this.canAfford()) {
					let amt = player.r.resonance.floor();
					player.r.resonance = new Decimal(0);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(amt).max(1)
                }
            }
        },
		13: {
			title: "Sideways Flavour",
			cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                return new Decimal(1)
            },
			effect() { // Effects of owning x of the items, x is a decimal
                let x = getBuyableAmount(this.layer, this.id);
				let exp = 9;
                return x.gte(1) ? x.add(1).log10().add(1).pow(exp) : new Decimal(1);
            },
			display() { // Everything else displayed in the buyable button after the title
                let extra = ""
                if (player.tab != this.layer) return 
                return "Divides neutron cost.\n\
				Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + "\n\
                Effect: /" + format(tmp[this.layer].buyables[this.id].effect) + extra
            },
            unlocked() { return true }, 
            canAfford() {
                    return player.r.resonance.gte(tmp[this.layer].buyables[this.id].cost)
			},
            buy() { 
                //cost = tmp[this.layer].buyables[this.id].cost
                if (this.canAfford()) {
					let amt = player.r.resonance.floor();
					player.r.resonance = new Decimal(0);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(amt).max(1)
                }
            }
        },
		14: {
			title: "Peppermint Flavour",
			cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                return new Decimal(1)
            },
			effect() { // Effects of owning x of the items, x is a decimal
                let x = getBuyableAmount(this.layer, this.id);
				let exp = 3;
                return x.gte(1) ? x.add(1).log10().add(1).pow(exp) : new Decimal(1);
            },
			display() { // Everything else displayed in the buyable button after the title
                let extra = ""
                if (player.tab != this.layer) return 
                return "Multiply atom gain.\n\
				Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + "\n\
                Effect: " + format(tmp[this.layer].buyables[this.id].effect)+"x" + extra
            },
            unlocked() { return false }, 
            canAfford() {
                    return player.r.resonance.gte(tmp[this.layer].buyables[this.id].cost)
			},
            buy() { 
                //cost = tmp[this.layer].buyables[this.id].cost
                if (this.canAfford()) {
					let amt = player.r.resonance.floor();
					player.r.resonance = new Decimal(0);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(amt).max(1)
                }
            }
        },
		15: {
			title: "Sex Appeal Flavour",
			cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                return new Decimal(1)
            },
			effect() { // Effects of owning x of the items, x is a decimal
                let x = getBuyableAmount(this.layer, this.id);
				let exp = 3;
                return x.gte(1) ? x.add(1).log10().add(1).pow(exp) : new Decimal(1);
            },
			display() { // Everything else displayed in the buyable button after the title
                let extra = ""
                if (player.tab != this.layer) return 
                return "Multiply energy gain.\n\
				Amount: " + formatWhole(getBuyableAmount(this.layer, this.id)) + "\n\
                Effect: " + format(tmp[this.layer].buyables[this.id].effect)+"x" + extra
            },
            unlocked() { return false }, 
            canAfford() {
                    return player.r.resonance.gte(tmp[this.layer].buyables[this.id].cost)
			},
            buy() { 
                //cost = tmp[this.layer].buyables[this.id].cost
                if (this.canAfford()) {
					let amt = player.r.resonance.floor();
					player.r.resonance = new Decimal(0);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(amt).max(1)
                }
            }
        },
	},
	infoboxes: {
		resonance: {
			title: "Resonance",
			body() {
				return "Your resons will passively produce resonance. Your resonance can then be assigned to one of various flavours. Each flavour provides a different effect. All unassigned resonance will be assigned when choosing a flavour."
			}
		}
	},
	tabFormat: {
		"Milestones": {
			content: [
				"main-display",
				"prestige-button",
				"blank",
				"resource-display",
				"milestones"
			]
		},
		"Resonance": {
			content: [
				"main-display",
				["infobox", "resonance"],
				"prestige-button",
				"blank",
				"resource-display",
				"blank",
				"blank",
				["display-text", 
				function() {
					return "You have " + effectText(player.r.resonance.floor(), tmp.r.color) + " resonance.<br><h5>Remember that when you choose a flavour, all unassigned resonance will be assigned.</h5>"
				}],
				"buyables"
			],
			unlocked() {
				return hasMilestone("r",0);
			}
		}
	},
	milestones: {
        0: {
            requirementDescription: "1 total reson",
            effectDescription: "Keep all previous milestones on reson reset, and unlock the Resonance tab.",
            done() { return player.r.total.gte(1) }
        },
		1: {
            requirementDescription: "3 total resons",
            effectDescription: "Keep all previous upgrades on reson reset.",
            done() { return player.r.total.gte(3) }
        },
        2: {
            requirementDescription: "5 total resons",
            effectDescription: "Protons and neutrons no longer reset anything.",
            done() { return player.r.total.gte(5) }
        },
        3: {
            requirementDescription: "8 total resons",
            effectDescription: "Generate 100% of your pending electron gain per second.",
            done() { return player.r.total.gte(8) }
        }
    },
    layerShown(){return player.a.unlocked}
})