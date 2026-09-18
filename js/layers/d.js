addLayer("d", {
    name: "drops", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "💧", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() {
        return {
            unlocked: false, // Whether the layer is unlocked
            points: new Decimal(0),
        }
    },
    color: "#aec8f2",
    requires() {
        let req = new Decimal(10)
        if (hasUpgrade("d", 12)) req = req.div(upgradeEffect("d", 12))
        if (hasUpgrade("d", 14)) req = req.times(upgradeEffect("d", 14).cost)
        if (hasUpgrade("d", 22)) req = req.div(upgradeEffect("d", 22))
        if (hasUpgrade("d", 24)) req = req.times(upgradeEffect("d", 24).cost)
        return req
    }, // Can be a function that takes requirement increases into account
    resource: "droplets of mana", // Name of prestige currency
    baseResource: "mana", // Name of resource prestige is based on
    baseAmount() { return player.points }, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.75, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if (hasUpgrade("d", 13)) mult = mult.times(upgradeEffect("d", 13))
        if (hasUpgrade("d", 23)) mult = mult.times(upgradeEffect("d", 23))
        if (hasUpgrade("d", 31)) mult = mult.times(upgradeEffect("d", 31))
        if (hasUpgrade("b", 12)) mult = mult.times(upgradeEffect("b", 12))
        if (hasUpgrade("b", 41)) mult = mult.times(upgradeEffect("b", 41))
        if (hasUpgrade("b", 44)) mult = mult.times(upgradeEffect("b", 44).gain)
        if (hasUpgrade("d", 41)) mult = mult.times(upgradeEffect("d", 41))
        mult = mult.times(buyableEffect("m", 13))
        if (hasUpgrade("qiocean", 21)) mult = mult.times(upgradeEffect("qiocean", 21))
        if (hasUpgrade("qiocean", 31)) mult = mult.times(upgradeEffect("qiocean", 31))
        
        if (hasBuyable("qiearth", 11)) mult = mult.times(buyableEffect("qiearth", 11))

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        return exp
    },
    directMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if (hasUpgrade("d", 14)) mult = mult.times(upgradeEffect("d", 14).gain)
        if (hasUpgrade("d", 24)) mult = mult.times(upgradeEffect("d", 24).gain)
        return mult
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        { key: "d", description: "D: Reset for droplets of mana", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    layerShown() { return player.points.gte(5) || player.a.achievements.includes("11") }, // Show the layer if you have at least 5 point
    doReset(resettingLayer) { // What happens when you reset this layer 
        if (layers[resettingLayer].row <= this.row) return;

        const keep = [];
        if (hasMilestone("m", 3)) {
            keep.push("upgrades");
        }
        layerDataReset(this.layer, keep);

        if (!hasMilestone("m", 3) && layers[resettingLayer].row == layers["c"].row && hasMilestone("c", 0)) {
            if (!hasUpgrade("d", 15)) player[this.layer].upgrades.push("15");
            if (!hasUpgrade("d", 25)) player[this.layer].upgrades.push("25");
            if (!hasUpgrade("d", 35)) player[this.layer].upgrades.push("35");
        }
    },
    passiveGeneration() {
        let gen = 0.00 // no passive generation
        if (hasMilestone("m", 0)) gen = gen + 0.10 // 10% of droplets per second
        if (hasUpgrade("qiocean", 12)) gen = gen + 0.15
        return gen
    },
    upgrades: {
        11: {
            title: "Take a deep breath",
            description: "Refine your breathing to increase mana gain.",
            cost: new Decimal(2),
            unlocked() { return true },
            effect() {
                let effect = new Decimal(2.00 + hasUpgrade(this.layer, "12")
                    + hasUpgrade(this.layer, "13")
                    + hasUpgrade(this.layer, "14"))

                if (hasUpgrade("d", 21)) {
                    effect = effect.add(new Decimal(1.00
                        + hasUpgrade(this.layer, "22")
                        + hasUpgrade(this.layer, "23")
                        + hasUpgrade(this.layer, "24")))
                }
                if (hasUpgrade("d", 34)) effect = effect.times(upgradeEffect("d", 34))
                if (hasBuyable("qiearth", 13)) effect = effect.pow(buyableEffect("qiearth", 13))
                return effect
            },
            effectDisplay() { return "+" + format(this.effect()) },
        },
        12: {
            title: "Efficient Breathing I",
            description: "Reduce the mana cost of droplets by 10%.",
            cost: new Decimal(5),
            unlocked() { return true },
            effect() { return new Decimal(1.10) },
        },
        13: {
            title: "Rythmic Breathing I",
            description: "Each droplet you form increases droplet gain by 1%.",
            cost: new Decimal(10),
            unlocked() { return true },
            effect() {
                let effect = new Decimal(0.01).times(player[this.layer].total).add(1)
                return hardcap(softcap(softcap(effect, new Decimal(2.5), 0.3), new Decimal(5.0), 0.1), new Decimal(10.0))
            },
            effectDisplay() { return format(this.effect()) + "x" }
        },
        14: {
            title: "Deep Breathing I",
            description: "Increase droplet cost by 90%, but double gain.",
            cost: new Decimal(15),
            unlocked() { return true },
            effect() { return { cost: new Decimal(1.90), gain: new Decimal(2.0) } },
        },
        15: {
            title: "Look for a better way",
            description: "Unlock Travel.",
            cost: new Decimal(35),
            unlocked() { return hasUpgrade(this.layer, "14") || hasMilestone("c", 0) },
            onPurchased() {
                player.t.unlocked = true
            },
        },
        //unlocked by Wandering Sage I
        21: {
            title: "Take a deeper breath",
            description: "Refine your breathing to increase mana gain.",
            cost: new Decimal(50),
            unlocked() { return hasUpgrade("t", "11") },
            //Boost upgrade 11 effect
        },
        22: {
            title: "Efficient Breathing II",
            description: "Reduce the mana cost of droplets by another 10%.",
            cost: new Decimal(100),
            unlocked() { return hasUpgrade("t", "11") },
            effect() { return new Decimal(1.10) },
        },
        23: {
            title: "Rythmic Breathing II",
            description: "Increases droplet gain based on mana.",
            cost: new Decimal(200),
            unlocked() { return hasUpgrade("t", "11") },
            effect() {
                let effect = new Decimal(player.points).add(1).log10().times(0.13).add(1)
                return softcap(softcap(effect, new Decimal(1.80), new Decimal(0.3)), new Decimal(3.0), 0.3)
            },
            effectDisplay() { return format(this.effect()) + "x" }
        },
        24: {
            title: "Deep Breathing II",
            description: "Increases droplet cost by 90%, but quaduple gain again.",
            cost: new Decimal(400),
            unlocked() { return hasUpgrade("t", "11") },
            effect() { return { cost: new Decimal(1.90), gain: new Decimal(4.0) } },
        },
        25: {
            title: "Breathing isn't enough",
            description: "Unlock new Travel upgrades.",
            cost: new Decimal(800),
            unlocked() { return hasUpgrade("d", "24") || hasMilestone("c", 0) },
        },
        //unlocked by Wandering Sage II
        31: {
            title: "Body of mana",
            description: "Increase droplet gain by droplets.",
            cost: new Decimal(1500),
            unlocked() { return hasUpgrade("t", "21") },
            effect() {
                let base = new Decimal(0.22)
                if (hasUpgrade("b", "32")) base = base.add(upgradeEffect("b", 32))

                let effect = player[this.layer].points.add(1).log10().times(base).add(1)
                return softcap(softcap(effect, new Decimal(5.0), new Decimal(0.2)), new Decimal(6.0), new Decimal(0.2))
            },
            effectDisplay() { return format(this.effect()) + "x" }
        },
        32: {
            title: "Mind of mana",
            description: "Increase base mana gain by droplets.",
            cost: new Decimal(3000),
            unlocked() { return hasUpgrade("t", "21") },
            effect() {
                let base = new Decimal(0.76)
                if (hasUpgrade("b", "33")) base = base.add(upgradeEffect("b", 33))
                let cap = new Decimal(6.0)
                if (hasUpgrade("b", "33")) cap = cap.times(2)

                let effect = player[this.layer].points.add(1).log10().times(base).add(1)
                return softcap(softcap(effect, cap, new Decimal(0.2)), new Decimal(15.0), new Decimal(0.2))
            },
            effectDisplay() { return "+" + format(this.effect()) }
        },
        33: {
            title: "Spirit of mana",
            description: "Increase mana gain by droplets.",
            cost: new Decimal(5000),
            unlocked() { return hasUpgrade("t", "21") },
            effect() {
                let base = new Decimal(0.18)
                if (hasUpgrade("b", "42")) base = base.add(upgradeEffect("b", 42))

                let effect = player[this.layer].points.add(1).log10().times(base).add(1)
                return softcap(effect, new Decimal(5.0), new Decimal(0.2))
            },
            effectDisplay() { return format(this.effect()) + "x" }
        },
        34: {
            title: "Soul of mana",
            description: "Double deep breath effect.",
            cost: new Decimal(8000),
            effect() {
                let effect = new Decimal(2.00)
                if (hasUpgrade("b", "23")) effect = effect.add(upgradeEffect("b", 23))
                return effect
            },
            effectDisplay() { return format(this.effect()) + "x" },
            unlocked() { return hasUpgrade("t", "21") },
        },
        35: {
            title: "Core of mana",
            description: "Unlock your Core",
            cost: new Decimal(10000),
            unlocked() { return hasUpgrade("t", "21") || player.a.achievements.includes("15") },
        },
        //unlocked by 10 Meridians
        41: {
            title: "Mana Compression",
            description: "Increase droplet gain, mana gain and cap by 50%.",
            cost() { return new Decimal("2e10") },
            effect() {
                let effect = new Decimal(1.50)
                if (hasUpgrade("d", 42)) effect = effect.times(upgradeEffect("d", 42))
                if (hasUpgrade("d", 43)) effect = effect.times(upgradeEffect("d", 43))
                if (hasUpgrade("d", 44)) effect = effect.times(upgradeEffect("d", 44))
                if (hasUpgrade("d", 45)) effect = effect.times(upgradeEffect("d", 45))
                return effect
            },
            effectDisplay() { return format(this.effect()) + "x" },
            unlocked() { return hasMilestone("m", 5) },
        },
        42: {
            title: "Squeeze I",
            description: "Increase 'Mana Compression' effect by 50%",
            cost() { return new Decimal("4e10") },
            effect() {
                let effect = new Decimal(1.50)
                return effect
            },
            unlocked() { return hasMilestone("m", 5) && hasUpgrade("d", 41) },
        },
        43: {
            title: "Squeeze II",
            description: "Increase 'Mana Compression' effect by 50%",
            cost() { return new Decimal("6e10") },
            effect() {
                let effect = new Decimal(1.50)
                return effect
            },
            unlocked() { return hasMilestone("m", 5) && hasUpgrade("d", 42) },
        },
        44: {
            title: "Squeeze III",
            description: "Increase 'Mana Compression' effect by 50%",
            cost() { return new Decimal("8e10") },
            effect() {
                let effect = new Decimal(1.50)
                return effect
            },
            unlocked() { return hasMilestone("m", 5) && hasUpgrade("d", 43) },
        },
        45: {
            title: "Squeeze IV",
            description: "Increase 'Mana Compression' effect by 50%",
            cost() { return new Decimal("10e10") },
            effect() {
                let effect = new Decimal(1.50)
                return effect
            },
            unlocked() { return hasMilestone("m", 5) && hasUpgrade("d", 44) },
        },

    }
})