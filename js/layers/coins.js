addLayer("co", {
    name: "coin", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "co", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    doReset(resettingLayer) {
    },
    color: "#E5EB34",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Coins", // Name of prestige currency
    baseAmount() {return player[this.layer].points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    passiveGeneration() {
        return 1
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        return new Decimal(1)
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
	update(diff) {
		updateBuyableCoin(this.layer, 11, diff, 2);
		updateBuyableCoin(this.layer, 12, diff, 10);
	},

	buyables: {
	    11: {
	        display() {return "Do some shitty job"},
			buy() {
				player[this.layer].buyables[this.id] = new Decimal(3);
				player.ac.points = player.ac.points.sub(this.cost())
			},
			unlocked() { return hasUpgrade(this.layer, 11) },
			cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                return new Decimal(5);
            },
			canAfford() { return player.ac.points.gte(this.cost()) &&  player[this.layer].buyables[11].lte(0) },
			id: new Decimal(0),
			style() {
                if(!this.canAfford) return {'background-color': buyableLockedColour}
                buyablePct = player[this.layer].buyables[this.id].div(3).mul(100)
                if(buyablePct.eq(0)) buyablePct = new Decimal(100)
                if (player[this.layer].undressed && !player[this.layer].decontaminated) return {'background-color': buyableProgressColour};
                if(!this.canAfford() && player[this.layer].buyables[this.id].eq(0)) return {
                    'background-color': buyableLockedColour
                }
                 return {
                    'background': 'linear-gradient(to bottom, ' + buyableAvailableColour + ' ' + buyablePct + '%, ' + buyableProgressColour + ' ' + buyablePct + '%)'
                }
			}
    	},
	    12: {
	        display() {return "Learn something from teacher"},
			buy() {
				player[this.layer].buyables[this.id] = new Decimal(10);
				player[this.layer].points = player[this.layer].points.sub(this.cost())
			},
			unlocked() { return false },
			cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                return new Decimal(10);
            },
			canAfford() { return player[this.layer].points.gte(this.cost()) &&  player[this.layer].buyables[12].lte(0) },
			id: new Decimal(0),
			style() {
                if(!this.canAfford) return {'background-color': buyableLockedColour}
                buyablePct = player[this.layer].buyables[this.id].div(10).mul(100)
                if(buyablePct.eq(0)) buyablePct = new Decimal(100)
                if (player[this.layer].undressed && !player[this.layer].decontaminated) return {'background-color': buyableProgressColour};
                if(!this.canAfford() && player[this.layer].buyables[this.id].eq(0)) return {
                    'background-color': buyableLockedColour
                }
                 return {
                    'background': 'linear-gradient(to bottom, ' + buyableAvailableColour + ' ' + buyablePct + '%, ' + buyableProgressColour + ' ' + buyablePct + '%)'
                }
			}
    	}
	},
	upgrades: {
		11: {
			title: "Get a Job",
			cost: new Decimal(10),
			currencyDisplayName: "experience",
			currencyInternalName: "points",
			currencyLocation() { return player }
		}
	},
	tabFormat: [
    "main-display",
	"blank",
	"buyables",
	"blank",
    "upgrades"
	],
    layerShown(){return true}
})

/*const buyableAvailableColour = '#AAAB6D'
const buyableProgressColour = '#E5EB34'
const buyableLockedColour = '#8A8A8A'
*/
function updateBuyableCoin (layerId, identifier, diff, coins) {
	let value = player[layerId].buyables[identifier];
	if(value.gt(0)) {
		value = value.minus(diff).max(0);
		player[layerId].buyables[identifier] = value;
		if (value.lte(0)) {
			player[layerId].points = player[layerId].points.add(coins);
		}
	}
}