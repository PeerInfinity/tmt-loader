addLayer("c", {
    name: "core", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "🔥", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() {
        return {
            unlocked: false, // Whether the layer is unlocked
            points: new Decimal(0),
        }
    },
    color: "#ed07e5",
    requires() {
        let req = new Decimal(20000)
        return req
    }, // Can be a function that takes requirement increases into account
    effect() {
        let effect = new Decimal(1.75).pow(player[this.layer].points).add(2.0)
        if (player.b.points.gte(1)) {
            effect = effect.add(tmp.b.effect.coreEffect)
        }
        if (hasUpgrade("b", 55)) effect = effect.add(upgradeEffect("b", 55))
        
        if (player.qiocean.unlocked) effect = effect.times(tmp.qiocean.effect)

        if (hasBuyable("qiearth", 12)) effect = effect.pow(buyableEffect("qiearth", 12))

        return effect
    },
    effectDescription() { return "which multiplies mana gain and cap by " + format(this.effect()) },
    resource: "core ★", // Name of prestige currency
    baseResource: "droplets of mana", // Name of resource prestige is based on
    baseAmount() { return player.d.points }, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.5, // Prestige currency exponent
    base: 0.5,
    row: 1, // Row the layer is in on the tree (0 is the first row)
    branches: ["d"], // This layer is a branch of the drops layer
    layerShown() { return hasUpgrade("d", 35) || player.a.achievements.includes("15") }, // Show the layer if you have at least 5 point
    doReset(resettingLayer) { // What happens when you reset this layer)
        if (layers[resettingLayer].row <= this.row) return
        if (layers[resettingLayer].row <= 2) return //qi

        doLayerReset(this.layer, resettingLayer)
    },
    canReset() {
        if (player[this.layer].points.lt(10)) {
            return tmp[this.layer].baseAmount.gte(tmp[this.layer].nextAt)
        }
        return false;
    },
    getResetGain() {
        if (player[this.layer].points.lt(10)) return getResetGain(this.layer, useType = "static")
        return new Decimal(0);
    },
    getNextAt(canMax) {
        if (player[this.layer].points.lt(10)) return getNextAt(this.layer, canMax, useType = "static")
        return new Decimal(Number.POSITIVE_INFINITY);
    },
    milestones: {
        0: {
            requirementDescription: "1★ core",
            effectDescription: "Keep all travel upgrades on reset.",
            done() { return player[this.layer].points.gte(1) },
            unlocked() { return true },
        },
        1: {
            requirementDescription: "2★ core",
            effectDescription: "Unlock Body Tempering.",
            done() { return player[this.layer].points.gte(2) },
            unlocked() { return true },
        },
        2: {
            requirementDescription: "5★ core",
            effectDescription: "Unlock Mana Meridians",
            done() { return player[this.layer].points.gte(5) },
            unlocked() { return true },
        },
        3: {
            requirementDescription: "10★ core",
            effectDescription: "Unlock a core upgrade.",
            done() { return player[this.layer].points.gte(10) },
            unlocked() { return true },
        },
    },
    upgrades: {
        11: {
            title: "Qi Condensation",
            description: "Unlock your Qi",
            cost: new Decimal("3e12"),
            currencyDisplayName: "droplets of mana",
            currencyInternalName: "points",
            currencyLayer: "d",
            unlocked() { return hasMilestone("c", 3) || player.a.achievements.includes("24") },
        },
    },
})