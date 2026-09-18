addLayer("l", {
    name: "lines", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "l", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    branches: "p",
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "lines", // Name of prestige currency
    baseResource: "dots", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    base: 2,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        mult = mult.times(player.l.points.add(1).pow(1.05).times(0.75));
        mult = mult.times(tmp.p.effect);
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    upgrades: {
        11: {
            title: "faster dot production",
            description: "double dot gain",
            cost: new Decimal(1),
        },
        12: {
            title: "dot synergy",
            description: "increases dot gain based on dots",
            cost: new Decimal(2),
            effect() {
                return player.points.add(1).pow(0.25)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        }
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "l", description: "L: Reset for lines", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true}
})

addLayer("p", {
    name: "polygons", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "p", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    branches: ["t", "h"],
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#aa20fa",
    requires: new Decimal(3), // Can be a function that takes requirement increases into account
    resource: "polygons", // Name of prestige currency
    baseResource: "lines", // Name of resource prestige is based on
    baseAmount() {return player.l.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    canBuyMax(){return false},
    exponent: 0.36, // Prestige currency exponent
    roundUpCost(){return true},
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    effect() {
        let ret = player.p.points.add(1).pow(2)
        if (player.p.points < 1) {
            ret = 1;
        }
        if (hasUpgrade('t', 11)) ret = ret.times(.75)
        return ret
    },
    effectDescription() { // Optional text to describe the effects
        let eff = this.effect();
        return "which are multiplying line cost by "+format(eff)+"x"
    },
    milestones: {
        0: {
            requirementDescription: "1 polygon",
            effectDescription: "unlock the triangle layer",
            done() { return player.p.points.gte(1) }
        },
        1: {
            requirementDescription: "2 polygon",
            effectDescription: "unlock the hexagon layer",
            done() { return player.p.points.gte(2) }
        }
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for polygons", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return (player.l.points >= 3) || hasMilestone('p', 0)}
})

addLayer("t", {
    name: "triangles", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "t", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FC7677",
    requires: new Decimal(3), // Can be a function that takes requirement increases into account
    resource: "triangles", // Name of prestige currency
    baseResource: "dots", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    canBuyMax(){return false},
    exponent: 1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "t", description: "T: Reset for triangles", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    upgrades: {
        11: {
            title: "ouch",
            description: "reduce the nerf from polygons by 25% and buff dot gain based on triangles",
            cost: new Decimal(50),
            effect() {
                return player[this.layer].points.add(1).pow(0.25)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        }
    },
    layerShown() {return hasMilestone('p', 0)}
})

addLayer("h", {
    name: "hexagons", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "h", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#72eacf",
    requires: new Decimal(6), // Can be a function that takes requirement increases into account
    resource: "hexagons", // Name of prestige currency
    baseResource: "triangles", // Name of resource prestige is based on
    baseAmount() {return player.t.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    canBuyMax(){return false},
    exponent: 1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "h", description: "H: Reset for hexagons", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    milestones: {
        0: {
            requirementDescription: "10 hexagons",
            effectDescription: "passively generate triangles (does not work atm)",
            done() { return player.h.points.gte(10) }
        }
    },
    layerShown() {return hasMilestone('p', 1)}
})