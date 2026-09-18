addLayer("c", {
    name: "carbon", // This is optional, only used in a few places. If absent, it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized.
    position: 0, // Horizontal position within a row. By default, it uses the layer id and sorts in alphabetical order.
    branches: ["h"],
    startData() { 
        return {
            unlocked: true,
            points: new Decimal(0),
        }
    },
    color: "#C9C9C9",
    nodeStyle: {
        "background-image": "radial-gradient(circle, #CFCFCF, #272727)"
    },
    requires: new Decimal(1250), // Can be a function that takes requirement increases into account.
    resource: "carbon", // Name of prestige currency.
    baseResource: "hydrogen", // Name of resource prestige is based on.
    baseAmount() { return player.h.points }, // Get the current amount of baseResource.
    type: "normal", // 'normal': cost to gain currency depends on amount gained. 'static': cost depends on how much you already have.
    exponent: 0.75, // Prestige currency exponent.
    gainMult() { // Calculate the multiplier for main currency from bonuses.
        let mult = new Decimal(1)
        if (hasUpgrade("o",22)) {
            mult = mult.times(upgradeEffect("o",22))
        }
         if (hasUpgrade("c",13)) {
            mult = mult.pow(upgradeEffect("c",13))
        }
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses.
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row).
    hotkeys: [
        { key: "c", description: "C: Reset for carbon", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    doReset(resettingLayer){
        let keep=[]
        if(hasMilestone("co",0)){
            keep.push("upgrades")}
        if(layers[resettingLayer].row>this.row) layerDataReset(this.layer,keep)
    },
    upgrades: {
        11: {
            title: "Carbon Heating",
            description: "Carbon boosts generation of vapor",
            cost: new Decimal(2),
            effect() {
                return player.c.points.add(1).pow(0.01)
            },
            effectDisplay() { 
                return "^" + format(upgradeEffect(this.layer, this.id))
            },
        },
        12: {
            title: "Firey Potential",
            description: "Carbon boosts oxygen gain",
            cost: new Decimal(8),
            effect() {
                return player.c.points.add(1).pow(0.02)
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
        },
        13: {
            title: "Volcanic Generation",
            description: "Carbon boosts it's own gain",
            cost: new Decimal(25),
            effect() {
                return player.c.points.add(1).pow(0.01)
            },
            effectDisplay() { 
                return "^" + format(upgradeEffect(this.layer, this.id))
            },
        },
        21: {
            title: " An Efficient Carbonation",
            description: "Carbon boosts carbon dioxide gain",
            cost: new Decimal(60),
            effect() {
                return player.co.points.add(1).pow(0.01)
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
        },
    },
    layerShown() {
        if (hasUpgrade("d", 14)) {
            return true
        } else {
            return false
        }
    }
})
