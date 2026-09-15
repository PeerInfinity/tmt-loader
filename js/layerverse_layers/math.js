addLayer("Ma", {
    name: "Math", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Ma", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        Ma_effectpow: new Decimal(1)
    }},
    layerShown(){
        let visible = false
        if (inChallenge("L",12)) visible = true
        if (!inChallenge("L",12)) visible = false
       return visible
     },
    color: "#123456",
    requires: function() {return new Decimal(10).sub(upgradeEffect("Ma",12)).div(upgradeEffect("Ma", 14)).pow(new Decimal(1).div(upgradeEffect("Ma",16)))}, // Can be a function that takes requirement increases into account
    resource: "Math", // Name of prestige currency
    baseResource: "Points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: new Decimal(0.5), // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("Ma",21)) mult = mult.times(upgradeEffect("Ma",21))
        if (hasUpgrade("Ma",25)) mult = mult.times(upgradeEffect("Ma",25))
        if (hasUpgrade("Ma",26)) mult = mult.times(upgradeEffect("Ma",26))
        if (hasUpgrade("Ma",31)) mult = mult.times(upgradeEffect("Ma",31))
        if (hasUpgrade("Ma",32)) mult = mult.times(upgradeEffect("Ma",32))
        if (hasUpgrade("Ma",33)) mult = mult.times(upgradeEffect("Ma",33))
        if (hasUpgrade("Ma",34)) mult = mult.times(upgradeEffect("Ma",34))        
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "t", description: "t: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ], milestones: {
        1: {
            requirementDescription: "1 Mathematician",
            effectDescription: "what",
            done() { return player.Ma.points.gte(10**308) },
        },
    }, 
    upgrades: {
    11: {
        title: "Plus",
        description: "Increase point gain by math",
        cost: new Decimal(1),
        effect() {
            if (hasUpgrade("Ma",11)) {
                return new Decimal(player[this.layer].points.add(1)).pow(0.3).div(new Decimal(2)).times(upgradeEffect("Ma", 13))
            }
            else {
                return new Decimal(0)
            }
        },
        effectDisplay() { return "+"+format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
    },
    12: {
        title: "Minus",
        description: "Math subtracts the requirement, capped at 9",
        cost: new Decimal(3),
        effect() {
            if (hasUpgrade("Ma",12)) {
                if (upgradeEffect(this.layer, this.id).lt(9)) {
                return new Decimal(player[this.layer].points).pow(0.25).times(upgradeEffect("Ma", 13))
                }
                else {
                    return new Decimal(9)
                }
            }
            else {
                return new Decimal(0)
            }
        },
        effectDisplay() { return "-"+format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        unlocked() {return hasUpgrade("Ma",11)}
    },
    13: {
        title: "Multiply",
        description: "Multiply Add and Minus effects by 1.2x",
        cost: new Decimal(5),
        effect() {
            if (hasUpgrade("Ma",13)) {
                 return new Decimal(1.2)
            }
            else {
                return new Decimal(1)
            }
        },
        unlocked() {return hasUpgrade("Ma",12)}
    },
    14: {
        title: "Division",
        description: "Divide the requirement by /1.1",
        cost: new Decimal(5),
        effect() {
            if (hasUpgrade("Ma",14)) {
                return new Decimal(1.1)
            }
            else {
                return new Decimal(1)
            }
        },
        unlocked() {return hasUpgrade("Ma",13)}
    },
    15: {
        title: "Exponent",
        description: "Increase points gain by math, capped at 1.05",
        cost: new Decimal(7),
        effect() {
            if (hasUpgrade("Ma",15)) {
                if (upgradeEffect("Ma", 15).lt(1.05)) {
                    return new Decimal(player[this.layer].points.add(1)).pow(0.01)
                }
                else {
                    return new Decimal(1.05)
                }
            }
            else {
                return new Decimal(1)
            }
        },
        effectDisplay() { return "^"+format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        unlocked() {return hasUpgrade("Ma",14)}
    },
    16: {
        title: "Roots",
        description: "Decrease the requirement to the root of 1.05",
        cost: new Decimal(15),
        effect() {
            if (hasUpgrade("Ma",16)) {
                return new Decimal(1.05)
            }
            else {
                return new Decimal(1)
            }
        },
        unlocked() {return hasUpgrade("Ma",15)}
    },
    21: {
        title: "Logarithm",
        description: "Boost math gain by math",
        cost: new Decimal(30),
        effect() {
            if (hasUpgrade("Ma",21)) {
                return new Decimal(player[this.layer].points).add(1).log(10).add(1)
            }
            else {
                return new Decimal(1)
            }
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        unlocked() {return hasUpgrade("Ma",16)}
    },
    22: {
        title: "Natural logarithm",
        description: "Boost point gain by points",
        cost: new Decimal(60),
        effect() {
            if (hasUpgrade("Ma",22)) {
                return new Decimal(player.points).add(1).log(Math.E).add(1)
            }
            else {
                return new Decimal(1)
            }
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        unlocked() {return hasUpgrade("Ma",21)}
    },
    23: {
        title: "Sine",
        description: "Boost point gain by a sine movement or whatever (how else was i supposed to put this in)",
        cost: new Decimal(100),
        effect() {
            if (hasUpgrade("Ma",23)) {
                return new Decimal(player.points).sin().abs().add(1)
            }
            else {
                return new Decimal(1)
            }
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        unlocked() {return hasUpgrade("Ma",22)}
    },
    24: {
        title: "Cosine",
        description: "Ditto",
        cost: new Decimal(250),
        effect() {
            if (hasUpgrade("Ma",24)) {
                return new Decimal(player.points).cos().abs().add(1)
            }
            else {
                return new Decimal(1)
            }
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        unlocked() {return hasUpgrade("Ma",23)}
    },
    25: {
        title: "Constants",
        description: "Boost math gain by 2x",
        cost: new Decimal(500),
        effect() {
            if (hasUpgrade("Ma",25)) {
                return new Decimal(2)
            }
            else {
                return new Decimal(1)
            }
        },
        unlocked() {return hasUpgrade("Ma",24)}
    },
    26: {
        title: "Variables",
        description: "Boost math gain by total math",
        cost: new Decimal(1000),
        effect() {
            if (hasUpgrade("Ma",26)) {
                return new Decimal(player.Ma.total).slog()
            }
            else {
                return new Decimal(1)
            }
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        unlocked() {return hasUpgrade("Ma",25)}
    },
    31: {
        title: "Pi",
        description: "3.14159265358979...",
        cost: new Decimal(3141),
        effect() {
            if (hasUpgrade("Ma",31)) {
                return new Decimal(Math.PI)
            }
            else {
                return new Decimal(1)
            }
        },
        unlocked() {return hasUpgrade("Ma",26)}
    },
    32: {
        title: "e",
        description: "2.718281828459045...",
        cost: new Decimal(27182),
        effect() {
            if (hasUpgrade("Ma",32)) {
                return new Decimal(Math.E)
            }
            else {
                return new Decimal(1)
            }
        },
        unlocked() {return hasUpgrade("Ma",31)}
    },
    33: {
        title: "Golden ratio",
        description: "1.61803398874989...",
        cost: new Decimal(161803),
        effect() {
            if (hasUpgrade("Ma",33)) {
                return new Decimal(1.61803398874989)
            }
            else {
                return new Decimal(1)
            }
        },
        unlocked() {return hasUpgrade("Ma",32)}
    },
    34: {
        title: "Square root of 2",
        description: "1.41421356237309...",
        cost: new Decimal(1414213),
        effect() {
            if (hasUpgrade("Ma",34)) {
                return new Decimal(1.41421356237309)
            }
            else {
                return new Decimal(1)
            }
        },
        unlocked() {return hasUpgrade("Ma",33)}
    },
    },
})