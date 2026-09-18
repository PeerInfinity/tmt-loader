addLayer("p", {
    name: "Prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "lime",
    requires: 240, // Can be a function that takes requirement increases into account
    resource: "★", // Name of prestige currency
    baseResource: "levels", // Name of resource prestige is based on
    baseAmount() {return player["c"].points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    //exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for ★", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    buyables: {
        11: {
            cost(x) { return new Decimal(1).mul(x.add(1)) },
            title() {return "Clicker"},
            display() { return "Upgrades the output of your clicker. (+3 per level) "+" Cost: "+format(this.cost())+" ★<br>Amount: "+formatWhole(player.p.buyables[11])+"/475"},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            cost(x) { return new Decimal(1).mul(x.add(1)) },
            title() {return "Prices"},
            display() { 
                return "Upgrading is slightly cheaper (-1% per level) "+"Cost: "+format(this.cost())+" ★<br>Amount: "+formatWhole(player.p.buyables[12])+"/90"
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        13: {
            cost(x) { return new Decimal(1).mul(x.add(1)) },
            title() {return "Wishing"},
            display() { return "You get more ★ per prestige (+2 per level) "+"Cost: "+format(this.cost())+" ★<br>Amount: "+formatWhole(player.p.buyables[13])+"/525" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    }
})
const awnser = 1000000