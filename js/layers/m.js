addLayer("m", {
    name: "merdians", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "🌊", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 4, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() {
        return {
            unlocked: false, // Whether the layer is unlocked
            points: new Decimal(0),
        }
    },
    color: "#023b96",
    requires() {
        let req = new Decimal(20000000)
        return req
    }, // Can be a function that takes requirement increases into account
    resource: "meridian ★", // Name of prestige currency
    baseResource: "droplets of mana", // Name of resource prestige is based on
    baseAmount() { return player.d.points }, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.10, // Prestige currency exponent
    base: 0.6,
    row: 1, // Row the layer is in on the tree (0 is the first row)
    branches: ["d", "c"],
    layerShown() { return hasMilestone("c", 2) || player.a.achievements.includes("20") },
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
            requirementDescription: "1★ meridian",
            effectDescription: "Gain 10% of droplets per second.",
            done() { return player[this.layer].points.gte(1) },
            unlocked() { return true },
        },
        1: {
            requirementDescription: "2★ meridian",
            effectDescription: "Unlock 2 Meridian Buyables",
            done() { return player[this.layer].points.gte(2) },
            unlocked() { return true },
        },
        2: {
            requirementDescription: "3★ meridian",
            effectDescription: "Unlock additional body upgrades.",
            done() { return player[this.layer].points.gte(3) },
            unlocked() { return true },
        },
        3: {
            requirementDescription: "5★ meridian",
            effectDescription: "Keep droplet upgrades on reset.",
            done() { return player[this.layer].points.gte(5) },
            unlocked() { return true },
        },
        4: {
            requirementDescription: "7★ meridian",
            effectDescription: "Unlock an additional Meridian Buyable.",
            done() { return player[this.layer].points.gte(7) },
            unlocked() { return true },
        },
        5: {
            requirementDescription: "10★ meridian",
            effectDescription: "Unlock new droplet upgrades.",
            done() { return player[this.layer].points.gte(10) },
            unlocked() { return true },
        },
    },
    buyables: {
        11: {
            title: "Crystalize Mana",
            cost(x) {
                let base = new Decimal(2.432)
                let mult = new Decimal("1e5")

                return base.pow(x).mul(mult).floor()
            },
            effect(x) {
                if (!x || x.lte(0.0)) return new Decimal(0)
                let effect = x.add(1).pow(2).add(player.m.points)
                if (hasUpgrade("b", 53)) effect = effect.times(upgradeEffect("b", 53))
                if (hasUpgrade("qisky", 13)) effect = effect.times(upgradeEffect("qisky", 13))
                return effect
            },
            display() {
                const data = tmp[this.layer].buyables[this.id]
                return "Begin crystalizaing mana around your core increases base mana gain and cap.\n\
                Cost: " + format(data.cost) + " droplets of mana\n\
                Amount: " + player[this.layer].buyables[this.id] + " of " + format(this.purchaseLimit) + "\n\
                Currently: +" + format(data.effect) + " base mana gain and cap.\n"
            },
            canAfford() { return player.d.points.gte(this.cost(player[this.layer].buyables[this.id])) },
            buy() {
                const droplets = player.d
                const layer = player[this.layer]
                droplets.points = droplets.points.sub(this.cost(layer.buyables[this.id]))
                layer.buyables[this.id] = layer.buyables[this.id].add(1)
            },
            unlocked() { return hasMilestone("m", 1) },
            style: { 'height': '222px' },
            purchaseLimit: new Decimal(20),
        },
        12: {
            title: "Carve Mana Channel",
            cost(x) {
                let base = new Decimal(1.43429)
                let mult = new Decimal("1e5")

                return base.pow(x).mul(mult).floor()
            },
            effect(x) {
                if (!x || x.lte(0.0)) return new Decimal(0)
                let effect = x.times(10000).times(player.m.points.div(100.0).add(1))
                if (hasUpgrade("b", 54)) effect = effect.times(upgradeEffect("b", 54))
                
                return effect
            },
            display() {
                const data = tmp[this.layer].buyables[this.id]
                return "Mana Channels improve final mana cap.\n\
                Cost: " + format(data.cost) + " droplets of mana\n\
                Amount: " + player[this.layer].buyables[this.id] + " of " + format(this.purchaseLimit) + "\n\
                Currently: +" + format(data.effect) + " mana cap.\n"
            },
            canAfford() { return player.d.points.gte(this.cost(player[this.layer].buyables[this.id])) },
            buy() {
                const droplets = player.d
                const layer = player[this.layer]
                droplets.points = droplets.points.sub(this.cost(layer.buyables[this.id]))
                layer.buyables[this.id] = layer.buyables[this.id].add(1)
            },
            unlocked() { return hasMilestone("m", 1) },
            style: { 'height': '222px' },
            purchaseLimit: new Decimal(20),
        },
        13: {
            title: "Mana Velocity",
            cost(x) {
                let base = new Decimal(2.05523)
                let mult = new Decimal("1e8")

                return base.pow(x).mul(mult).floor()
            },
            effect(x) {
                if (!x || x.lte(0.0)) return new Decimal(1.0)
                let effect = player.m.points.div(100.0).add(1).pow(x)
                if (hasUpgrade("qisky", 12)) effect = effect.times(upgradeEffect("qisky", 12))
                return effect
            },
            display() {
                const data = tmp[this.layer].buyables[this.id]
                return "Mana Velocity improves droplet gain.\n\
                Cost: " + format(data.cost) + " droplets of mana\n\
                Amount: " + player[this.layer].buyables[this.id] + " of " + format(this.purchaseLimit) + "\n\
                Currently: " + format(data.effect) + "x droplet gain.\n"
            },
            canAfford() { return player.d.points.gte(this.cost(player[this.layer].buyables[this.id])) },
            buy() {
                const droplets = player.d
                const layer = player[this.layer]
                droplets.points = droplets.points.sub(this.cost(layer.buyables[this.id]))
                layer.buyables[this.id] = layer.buyables[this.id].add(1)
            },
            unlocked() { return hasMilestone("m", 4) },
            style: { 'height': '222px' },
            purchaseLimit: new Decimal(20),
        },
    },
})