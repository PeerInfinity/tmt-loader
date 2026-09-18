addLayer("o", {
    name: "oxygen", // This is optional, only used in a few places. If absent, it just uses the layer id.
    symbol: "O", // This appears on the layer's node. Default is the id with the first letter capitalized.
    position: 1, // Horizontal position within a row. By default, it uses the layer id and sorts in alphabetical order.
    startData() { 
        return {
            unlocked: true,
            points: new Decimal(0),
        }
    },
    color: "#F17F3D",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account.
    resource: "oxygen", // Name of prestige currency.
    baseResource: "vapor", // Name of resource prestige is based on.
    baseAmount() { return player.points }, // Get the current amount of baseResource.
    type: "normal", // 'normal': cost to gain currency depends on amount gained. 'static': cost depends on how much you already have.
    exponent: 0.5, // Prestige currency exponent.
    gainMult() { // Calculate the multiplier for main currency from bonuses.
        let mult = new Decimal(1)
        if (hasUpgrade("c",12)) {
            mult = mult.mul(upgradeEffect("c",12))
        }
        if (hasUpgrade("o",21)) {
            mult = mult.pow(upgradeEffect("o",21))
        }
        if (hasUpgrade("nh",11)) {
            mult = mult.pow(upgradeEffect("o",21))
        }
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses.
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row).
    hotkeys: [
        { key: "o", description: "O: Reset for oxygen", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    doReset(resettingLayer){
        let keep=[]
        if(hasMilestone("w",2)){
            keep.push("points")}
        if(hasMilestone("w",1)){
            keep.push("upgrades")}
        if(hasMilestone("n",0)){
            keep.push("upgrades")}
        if(layers[resettingLayer].row>this.row) layerDataReset(this.layer,keep)
    },
    upgrades: {
        11: {
            title: "Nuclear Fission",
            description: "Oxygen boosts hydrogen gain",
            cost: new Decimal(2),
            effect() {
                return player.o.points.add(1).pow(0.45).add(9).log10().sqrt()
            },
            effectDisplay() { 
                return "^" + format(upgradeEffect(this.layer, this.id))
            },
        },
         12: {
            title: "Vaporization",
            description: "Oxygen boosts vapor gain",
            cost: new Decimal(5),
            effect() {
                return player.o.points.add(1).pow(0.25).add(9).log10().sqrt()
            },
            effectDisplay() { 
                return "^" + format(upgradeEffect(this.layer, this.id))
            },
         },
         21: {
            title: "Oxygen Generation",
            description: "Oxygen boosts Oxygen gain",
            cost: new Decimal(30),
            effect() {
                return player.o.points.add(2).pow(0.3).add(9).log10().sqrt()
            },
            effectDisplay() { 
                return "^" + format(upgradeEffect(this.layer, this.id))
            },
        },
        22: {
            title: "Carbonic Oxygen?!",
            description: "Oxygen boosts Carbon gain",
            cost: new Decimal(270),
            effect() {
                return player.o.points.add(1).pow(0.15).add(9).log10().sqrt().times(4)
            },
            effectDisplay() { 
                return "^" + format(upgradeEffect(this.layer, this.id))
            },
            unlocked() {
                if (layerShown("c")) {
                    return true
                } else {
                    return false
                }
            },
        },
    },
    layerShown() {
        if (hasUpgrade("d",13) || hasAchievement("a",13)) { return true } else { return false}
    }
})
