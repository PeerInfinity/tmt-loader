addLayer("qisky", {
    name: "Sky",
    symbol: "🦅",
    position: 1,
    startData() {
        return {
            unlocked: false,
            unlockOrder: 0,
            points: new Decimal(0),
            best: new Decimal(0),
            acceleration: new Decimal(0),
            speed: new Decimal(0),
            resistance: new Decimal(0),
        }
    },
    color: "#bfd9d8",
    requires() {
        let req = new Decimal("1e13")
        if (player.qisky.unlockOrder && player.qisky.unlockOrder >= 1) req = req.times(55000)
        if (player.qisky.unlockOrder && player.qisky.unlockOrder >= 2) req = req.times(70000)
        return req
    },
    layerShown() { return hasUpgrade("c", 11) || player.a.achievements.includes("25") },
    resource: "Sky Qi",
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
    increaseUnlockOrder: ["qiocean", "qiearth"],
    doReset(resettingLayer) { // What happens when you reset this layer)
        if (layers[resettingLayer].row > this.row) {
            this.acceleration = new Decimal(0)
            this.speed = new Decimal(0)
            this.resistance = new Decimal(0)
        }
        if (layers[resettingLayer].row <= this.row) return

        doLayerReset(this.layer, resettingLayer)
    },
    effectDescription() {
        return "and your winds are moving at speed of " + format(player.qisky.speed) + " m/s (" + format(player.qisky.acceleration) + " m/s² with " + format(player.qisky.resistance.times(100)) + "% resistance). \n" +
            "This increases your mana cap by " + format(this.effect()) + "x"
    },
    effect() {
        let effect = new Decimal(1.0)
        if (player[this.layer].speed.gt(0)) {
            effect = effect.add(player[this.layer].speed.log(1.3).add(50))
        }

        return softcap(effect, new Decimal(500), 0.1)
    },
    update(diff) { // Called every tick, to update the layer
        let accel = new Decimal(player[this.layer].best).times(9.8876)
        accel = accel.times(buyableEffect(this.layer, 12))

        let resist = new Decimal(0.40)
        resist = resist.times(buyableEffect(this.layer, 11))

        let resistMult = resist.negate().add(1)
        let speed = player[this.layer].speed.add(accel).times(resistMult)
        if (speed.lt(player[this.layer].speed))
            speed = player[this.layer].speed
        player[this.layer].acceleration = accel
        player[this.layer].resistance = resist
        player[this.layer].speed = speed
    },
    buyables: {
        11: {
            title: "Wind Slash",
            cost(x) {
                let base = new Decimal(1.71)

                return base.pow(x).floor()
            },
            effect(x) {
                if (!x || x.lte(0.0)) return new Decimal(1.00)
                let effect = new Decimal(0.905).pow(x)
                return effect
            },
            display() {
                const data = tmp[this.layer].buyables[this.id]
                return "Focus your Sky Qi to become sharper reducing Wind Resistance.\n\
                Cost: " + format(data.cost, 0) + " Sky Qi\n\
                Amount: " + player[this.layer].buyables[this.id] + " of " + format(this.purchaseLimit) + "\n\
                Currently: " + format(data.effect.times(100)) + "%.\n"
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
        12: {
            title: "Rising Sun",
            cost(x) {
                let base = new Decimal(1.71)

                return base.pow(x).floor()
            },
            effect(x) {
                if (!x || x.lte(0.0)) return new Decimal(1.00)
                let effect = new Decimal(1.42).pow(x)
                return effect
            },
            display() {
                const data = tmp[this.layer].buyables[this.id]
                return "Burn your Sky Qi to gain additional acceleration.\n\
                Cost: " + format(data.cost, 0) + " Sky Qi\n\
                Amount: " + player[this.layer].buyables[this.id] + " of " + format(this.purchaseLimit) + "\n\
                Currently: " + format(data.effect) + "x.\n"
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
            title: "➡️➡️➡️",
            description: "Sky effect increases mana gain at a reduced rate",
            cost: new Decimal(2),
            unlocked() { return true },
            effect() {
                return tmp.qisky.effect.add(1).log(1.95)
            },
            effectDisplay() {
                return format(this.effect()) + "x"
            },
        },
        12: {
            title: "➡️↗️⬆️",
            description: "Wind speed increases 'Mana Velocity' effect",
            cost: new Decimal(10),
            unlocked() { return true },
            effect() {
                return player.qisky.speed.add(1).ln().times(1.8995)
            },
            effectDisplay() {
                return format(this.effect()) + "x"
            },
        },
        13: {
            title: "⬆️⬇️↘️➡️",
            description: "'Cyrstalize Mana' effect is increased by Sky Effect",
            cost: new Decimal(25),
            unlocked() { return true },
            effect() {
                return tmp.qisky.effect
            },
            effectDisplay() {
                return "+" + format(this.effect()) + ""
            },
        },
    },
})