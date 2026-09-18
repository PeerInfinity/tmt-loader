addLayer("qiocean", {
    name: "Ocean",
    symbol: "🐠",
    position: 0,
    startData() {
        return {
            unlocked: false,
            unlockOrder: 0,
            points: new Decimal(0),
            exploredTotal: new Decimal(0),
            explored: new Decimal(0),
            exploredGain: new Decimal(0),
        }
    },
    color: "#00bfff",
    requires() {
        let req = new Decimal("1e13")
        if (player.qiocean.unlockOrder && player.qiocean.unlockOrder >= 1) req = req.times(55000)
        if (player.qiocean.unlockOrder && player.qiocean.unlockOrder >= 2) req = req.times(70000)
        return req
    },
    layerShown() { return hasUpgrade("c", 11) || player.a.achievements.includes("25") },
    resource: "Ocean Qi",
    baseResource: "droplets of mana",
    baseAmount() { return player.d.points },
    type: "normal",
    exponent: 0.5,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)

        return mult
    },
    row: 2,
    branches: ["c"],
    increaseUnlockOrder: ["qisky", "qiearth"],
    doReset(resettingLayer) { // What happens when you reset this layer)
        if (layers[resettingLayer].row > this.row) {
            this.exploredTotal = new Decimal(0)
            this.explored = new Decimal(0)
            this.exploredGain = new Decimal(0)
        }
        if (layers[resettingLayer].row <= this.row) return

        doLayerReset(this.layer, resettingLayer)
    },
    effectDescription() {
        return "and you've explored " + format(player.qiocean.explored) + " fathoms (" + format(player.qiocean.exploredGain) + " explore power per second) which increases the core effect by " + format(tmp.qiocean.effect) + "x"
    },
    effect() {
        let effect = new Decimal(1.0)
        if (player[this.layer].explored.gt(0)) {
            let effectBase = new Decimal(1.02576)
            effect = effectBase.pow(player[this.layer].explored).add(1.75)
        }
        return softcap(softcap(effect, new Decimal(5.0), 0.1), new Decimal(10), 0.1)
    },
    update(diff) { // Called every tick, to update the layer
        let gain = new Decimal(player[this.layer].points).times(0.74).sqrt()
        gain = gain.add(buyableEffect("qiocean", 11))
        if (hasUpgrade("qiocean", 22)) gain = gain.pow(upgradeEffect("qiocean", 22))

        player[this.layer].exploredTotal = player[this.layer].exploredTotal.add(gain.times(diff))
        player[this.layer].exploredGain = gain
        player[this.layer].explored = softcap(player[this.layer].exploredTotal.pow(0.67), new Decimal(1000), 0.1)
    },
    buyables: {
        11: {
            title: "Delve Deeper",
            cost(x) {
                let base = new Decimal(1.74)

                return base.pow(x).floor()
            },
            effect(x) {
                if (!x || x.lte(0.0)) return new Decimal(0)
                let effect = x.pow(3).add(1)
                return effect
            },
            display() {
                const data = tmp[this.layer].buyables[this.id]
                return "Explore the depths of your Qi Ocean.\n\
                Cost: " + format(data.cost, 0) + " Ocean Qi\n\
                Amount: " + player[this.layer].buyables[this.id] + " of " + format(this.purchaseLimit) + "\n\
                Currently: +" + format(data.effect) + " explore power.\n"
            },
            canAfford() { return player[this.layer].points.gte(this.cost(player[this.layer].buyables[this.id])) },
            buy() {
                const layer = player[this.layer]
                layer.points = layer.points.sub(this.cost(layer.buyables[this.id]))
                layer.buyables[this.id] = layer.buyables[this.id].add(1)
            },
            unlocked() { return true },
            style: { 'height': '222px' },
            purchaseLimit: new Decimal(20),
        },
    },
    upgrades: {
        11: {
            title: "Sea Star",
            description: "Increase life force gain by fathoms explored",
            cost: new Decimal(2),
            unlocked() { return true },
            effect() {
                return softcap(player.qiocean.explored.add(1).ln().times("1.3e10"), new Decimal(1e9), 0.5)
            },
            effectDisplay() {
                return format(this.effect()) + "x"
            },
        },
        21: {
            title: "Sun Fish",
            description: "Increase droplet gain by fathoms explored",
            cost: new Decimal(4),
            unlocked() { return true },
            effect() {
                return softcap(player.qiocean.explored.add(1).log10().times(136.5).add(16.49), new Decimal(250), 0.5)
            },
            effectDisplay() {
                return format(this.effect()) + "x"
            },
        },
        31: {
            title: "Cachalot",
            description: "Increase droplet gain by Ocean Qi",
            cost: new Decimal(30),
            unlocked() { return true },
            effect() {
                return softcap(player.qiocean.points.add(1).log10().times(1.348).add(9.00), new Decimal(15.0), 0.5)
            },
            effectDisplay() {
                return format(this.effect()) + "x"
            },
        },
        12: {
            title: "Ripples",
            description: "Increase droplet gain per second by +15%",
            cost: new Decimal(250),
            unlocked() { return player.a.achievements.includes("26") },
        },
        22: {
            title: "Bubbles",
            description: "Sky's wind speed boosts explore power",
            cost: new Decimal(1500),
            unlocked() { return player.a.achievements.includes("26") },
            effect() {
                let effect = new Decimal(1.0)
                if (player.qisky.speed.gt(0)) {
                    effect = player.qisky.speed.ln().times(0.058).add(1)
                }
                return softcap(effect, new Decimal(1.05), 0.5)
            },
            effectDisplay() {
                return "^" + format(this.effect())
            },
        },
        32: {
            title: "Tsunami",
            description: "Effective body ★'s for other upgrades is increased by +100%.",
            cost: new Decimal(5000),
            unlocked() { return player.a.achievements.includes("26") },
            effect() {
                let effect = new Decimal(1.0)
                return effect
            },
        },
    },
})