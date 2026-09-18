addLayer("co", {
    name: "carbon dioxide", // This is optional, only used in a few places. If absent, it just uses the layer id.
    symbol: `<img src="resources/icon/co2.png" alt="CO" class="icon-img">`, // This appears on the layer's node. Default is the id with the first letter capitalized.
    position: 2, // Horizontal position within a row. By default, it uses the layer id and sorts in alphabetical order.
    branches: ["c","o"],
    startData() { 
        return {
            unlocked: true,
            points: new Decimal(0),
        }
    },
    color: "#EA8751",
    nodeStyle: {
        "background-image": "radial-gradient(circle, #EA8751, #A5E557)"
    },
    requires: new Decimal(25), // Can be a function that takes requirement increases into account.
    resource: "carbon dioxide", // Name of prestige currency.
    baseResource: "O,2C", // Name of resource prestige is based on.
    baseAmount() { if (player.o.points.lt(player.c.points.multiply(2))) return player.o.points
                 return player.c.points.multiply(2) 
    },
    type: "normal", // 'normal': cost to gain currency depends on amount gained. 'static': cost depends on how much you already have.
    exponent: 0.75, // Prestige currency exponent.
    gainMult() { // Calculate the multiplier for main currency from bonuses.
        let mult = new Decimal(1)
        if (hasUpgrade("co",12)) {
            mult = mult.pow(upgradeEffect("co",12))
        }
        if (hasUpgrade("c",21)) {
            mult = mult.mul(upgradeEffect("c",21))
        }
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses.
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row).
    hotkeys: [
        { key: "co", description: "Shift+C: Reset for CO2", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    upgrades: {
        11: {
            title: "Greenhouse gas",
            description: "Carbon Dioxide boosts vapor and oxygen generation",
            cost: new Decimal(2),
            effect() {
                return player.co.points.times(1.02).add(1).pow(0.2)
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
        },
        12: {
            title: "Fossil fuels",
            description: "Carbon dioxide generation is increased by carbon",
            cost: new Decimal(250),
            effect() {
                return player.c.points.times(1).add(1).pow(1.02)
            },
            effectDisplay() { 
                return "^" + format(upgradeEffect(this.layer, this.id)) 
            },
        },
    },
    milestones: {
        0: {
            requirementDescription: "8 carbon dioxide",
            effectDescription: "keep carbon upgrades on reset",
            done() { return player.co.points.gte(8) }
        },
    },
    layerShown() { 
        if (hasAchievement("a",22)) {
            return true
        } else {
            return false
        }
    }
})

