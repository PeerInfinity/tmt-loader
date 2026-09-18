addLayer("n", {
    name: "nitrogen", // This is optional, only used in a few places. If absent, it just uses the layer id.
    symbol: "N", // This appears on the layer's node. Default is the id with the first letter capitalized.
    position: 2, // Horizontal position within a row. By default, it uses the layer id and sorts in alphabetical order.
    branches: ["o"],
    startData() { 
        return {
            unlocked: true,
            points: new Decimal(0),
        }
    },
    color: "#C7F391",
    requires: new Decimal(1), // Can be a function that takes requirement increases into account.
    resource: "nitrogen", // Name of prestige currency.
    baseResource: "100O,V", // Name of resource prestige is based on.
    baseAmount() { if (player.points.lt(player.o.points.mul(100))) return player.points
                 return player.o.points.mul(100) 
    }, // Get the current amount of baseResource.
    type: "normal", // 'normal': cost to gain currency depends on amount gained. 'static': cost depends on how much you already have.
    exponent: 0.2, // Prestige currency exponent.
    gainMult() { // Calculate the multiplier for main currency from bonuses.
        let mult = new Decimal(1)
        if (hasUpgrade("n",21)) { mult = mult.mul(upgradeEffect("n",21))}
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses.
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row).
    hotkeys: [
        { key: "n", description: "N: Reset for nitrogen", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    upgrades: {
        11: {
            title: "Nitro",
            description: "Multiplies Hydrogen gain by 35",
            cost: new Decimal(5),
            effect() {
                return new Decimal(35)
            },
        },
         12: {
            title: "Volatility",
            description: "Raise gain of oxygen and nitrogen ^1.5",
            cost: new Decimal(15),
            effect() {
                return new Decimal(1.5)
            },
        },
          21: {
            title: "Essential Fuel",
            description: "Nirtogen boosts nitrogen gain.",
            cost: new Decimal(25),
            effect() {
                return player.n.points.add(1).pow(0.5)
            },
        },
         22: {
            title: "Put on the Nitro!!!",
            description: "Nirtogen boosts hydrogen gain.",
            cost: new Decimal(50),
            effect() {
                return player.h.points.add(1).pow(0.1)
            },
        },
    },
    milestones: {
        0: {
            requirementDescription: "2 nitrogen",
            effectDescription: "Keep oxygen upgrades on reset",
            done() { return player.n.points.gte(2) }
        },
    },
    doReset(resettingLayer){
        let keep=[]
        if(hasMilestone("nh",0)){
            keep.push("upgrades")}
        if(layers[resettingLayer].row>this.row) layerDataReset(this.layer,keep)
    },
    layerShown() {
        if (hasUpgrade("d",14)) {
            return true
        } else {
            return false
        }
    }
})
