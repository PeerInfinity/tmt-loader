addLayer("nh", {
    name: "ammonia", // This is optional, only used in a few places. If absent, it just uses the layer id.
    symbol: `<img src="resources/icon/nh3.png" alt="NH" class="icon-img">`, // This appears on the layer's node. Default is the id with the first letter capitalized.
    position: 0, // Horizontal position within a row. By default, it uses the layer id and sorts in alphabetical order.
    branches: ["n","h"],
    startData() { 
        return {
            unlocked: true,
            points: new Decimal(0),
        }
    },
    color: "#8622D5",
    nodeStyle: {
        "background-image": "radial-gradient(circle, #E7E995, #9B3EE4)"
    },
    requires: new Decimal(125), // Can be a function that takes requirement increases into account.
    resource: "ammonia", // Name of prestige currency.
    baseResource: "H,3N", // Name of resource prestige is based on.
    baseAmount() { if (player.h.points.lt(player.n.points.multiply(3))) return player.h.points
                 return player.n.points.multiply(3) 
    },
    type: "static", // 'normal': cost to gain currency depends on amount gained. 'static': cost depends on how much you already have.
    exponent: 0.3, // Prestige currency exponent.
    gainMult() { // Calculate the multiplier for main currency from bonuses.
        let mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses.
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row).
    hotkeys: [
        { key: "nh", description: "Shift+N: Reset for Ammonia", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    upgrades: {
        11: {
            title: "Greenhouse gas",
            description: "Vapor boosts vapor and oxygen generation",
            cost: new Decimal(2),
            effect() {
                return player.points.times(1.02).add(1).pow(0.2)
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
        },
         12: {
            title: "Pure Water",
            description: "Ammonia boosts water gain.",
            cost: new Decimal(5),
            effect() {
                return player.h.points.add(1).pow(0.1)
            },
        },
    },
    milestones: {
        0: {
            requirementDescription: "2 ammonia",
            effectDescription: "keep nitrogen upgrades on reset",
            done() { return player.nh.points.gte(2) }
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
