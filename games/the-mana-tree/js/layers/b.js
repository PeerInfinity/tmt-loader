addLayer("b", {
    name: "body", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "💪", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() {
        return {
            unlocked: false, // Whether the layer is unlocked
            points: new Decimal(0),
            lifeForce: new Decimal(0),
        }
    },
    color: "#f2f2ae",
    requires() { return new Decimal(50000) }, // Can be a function that takes requirement increases into account
    effect() {
        if (player[this.layer].points.lt(1)) return { lifeForceGain: new Decimal(0), coreEffect: new Decimal(0) }
        let lfGain = new Decimal(2).pow(player[this.layer].points.sub(1))
        if (hasUpgrade("b", 15)) lfGain = lfGain.add(upgradeEffect("b", 15))

        if (hasUpgrade("b", 11)) lfGain = lfGain.times(upgradeEffect("b", 11))
        if (hasUpgrade("b", 12)) lfGain = lfGain.times(upgradeEffect("b", 12))
        if (hasUpgrade("b", 13)) lfGain = lfGain.times(upgradeEffect("b", 13))
        if (hasUpgrade("b", 14)) lfGain = lfGain.times(upgradeEffect("b", 14))
        if (hasUpgrade("b", 32)) lfGain = lfGain.pow(upgradeEffect("b", 32))
        if (hasUpgrade("b", 25)) lfGain = lfGain.times(upgradeEffect("b", 25))
        if (hasUpgrade("b", 35)) lfGain = lfGain.times(upgradeEffect("b", 35))
        if (hasUpgrade("qiocean", 11)) lfGain = lfGain.times(upgradeEffect("qiocean", 11))

        let cBase = player.b.points
        let cEffectMult = new Decimal(0.006)
        if (hasUpgrade("b", 34)) cEffectMult = cEffectMult.times(upgradeEffect("b", 34))
        if (hasUpgrade("b", 55)) cBase = cBase.add(player.m.points)
        let cEffect = player.b.lifeForce.add(1).log10().times(cEffectMult)

        return { lifeForceGain: lfGain, coreEffect: cBase.add(cEffect) }
    },
    effectDescription() {
        return "and " + format(player.b.lifeForce) + " total life force (+" + format(this.effect().lifeForceGain) + " per second) which increases the core effect by +" + format(this.effect().coreEffect)
    },
    update(diff) { // Called every tick, to update the layer
        if (player[this.layer].points.gte(1)) {
            let gain = this.effect().lifeForceGain

            player[this.layer].lifeForce = player[this.layer].lifeForce.add(gain.times(diff))
        }
    },
    resource: "body ★", // Name of prestige currency
    baseResource: "droplets of mana", // Name of resource prestige is based on
    baseAmount() { return player.d.points }, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.85, // Prestige currency exponent
    base: 0.5, // Base for the cost calculation
    row: 1, // Row the layer is in on the tree (0 is the first row)
    branches: ["d", "c"], // This layer is a branch of the core layer
    layerShown() { return hasMilestone("c", 1) || player.a.achievements.includes("16") }, // Show the layer if you have at least 5 point
    doReset(resettingLayer) { // What happens when you reset this layer)
        if (layers[resettingLayer].row >= this.row) this.lifeForce = new Decimal(0)
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
            requirementDescription: "1★ body",
            effectDescription: "Unlock new Travel upgrades.",
            done() { return player[this.layer].points.gte(1) },
            unlocked() { return true },
        },
    },
    upgrades: {
        11: {
            title: "Push-ups",
            description: "Increase life force gain by mana",
            cost() { return new Decimal(20) },
            currencyDisplayName: "life force",
            currencyInternalName: "lifeForce",
            currencyLayer: "b",
            effect() {
                let effect = player.points.add(1).log10().times(0.06).add(1)
                return softcap(effect, new Decimal(2.0), 0.3)
            },
            effectDisplay() { return format(this.effect()) + "x life force" },
            unlocked() { return true },
        },
        12: {
            title: "Weight Training",
            description: "Increase life force gain by body ★s.",
            cost() { return new Decimal(50) },
            currencyDisplayName: "life force",
            currencyInternalName: "lifeForce",
            currencyLayer: "b",
            effect() {
                let effectivepoints = player[this.layer].points
                let effectiveMult = new Decimal(1.00)
                if (hasUpgrade("b", 51)) effectiveMult = effectiveMult.add(upgradeEffect("b", 51))
                if (hasUpgrade("qiocean", 32)) effectiveMult = effectiveMult.add(upgradeEffect("qiocean", 32))
                effectivepoints = effectivepoints.times(effectiveMult)

                let effect = player.c.points.add(effectivepoints).add(player.m.points)
                return effect
            },
            effectDisplay() { return format(this.effect()) + "x life force gain" },
            unlocked() { return true },
        },
        13: {
            title: "Sparring",
            description: "Increase life force gain by droplets",
            cost() { return new Decimal(100) },
            currencyDisplayName: "life force",
            currencyInternalName: "lifeForce",
            currencyLayer: "b",
            effect() {
                let effect = player.points.add(1).log10().times(0.07).add(1)
                return softcap(effect, new Decimal(5.0), 0.3)
            },
            effectDisplay() { return format(this.effect()) + "x life force" },
            unlocked() { return true },
        },
        14: {
            title: "Tai-bo",
            description: "Increase life force gain by life force",
            cost() { return new Decimal(150) },
            currencyDisplayName: "life force",
            currencyInternalName: "lifeForce",
            currencyLayer: "b",
            effect() {
                let effect = player.b.lifeForce.add(1).log10().times(0.03839).add(1)
                return softcap(effect, new Decimal(5.0), 0.3)
            },
            effectDisplay() { return format(this.effect()) + "x life force" },
            unlocked() { return true },
        },
        //Five Fiery Demon Hounds method
        21: {
            title: "Bed of hot coals",
            description: "Increase mana gain by 3% per body ★.",
            cost() { return new Decimal(500) },
            currencyDisplayName: "life force",
            currencyInternalName: "lifeForce",
            currencyLayer: "b",
            effect() {
                let effectivepoints = player[this.layer].points
                let effectiveMult = new Decimal(1.00)
                if (hasUpgrade("b", 51)) effectiveMult = effectiveMult.add(upgradeEffect("b", 51))
                if (hasUpgrade("qiocean", 32)) effectiveMult = effectiveMult.add(upgradeEffect("qiocean", 32))
                effectivepoints = effectivepoints.times(effectiveMult)

                let effect = new Decimal(0.03).times(effectivepoints).add(1)
                return softcap(effect, new Decimal(2.5), 0.3)
            },
            effectDisplay() { return format(this.effect()) + "x mana gain" },
            unlocked() { return hasUpgrade("t", 31) },
        },
        22: {
            title: "Consume Salamander Blood",
            description: "Increase 'Body of Mana' base effect by +0.02.",
            cost() { return new Decimal(5000) },
            currencyDisplayName: "life force",
            currencyInternalName: "lifeForce",
            currencyLayer: "b",
            effect() {
                return new Decimal(0.02)
            },
            unlocked() { return hasUpgrade("t", 31) },
        },
        23: {
            title: "Demon Hound Dance",
            description: "Increase 'Soul of Mana' effect by +0.20.",
            cost() { return new Decimal(50000) },
            currencyDisplayName: "life force",
            currencyInternalName: "lifeForce",
            currencyLayer: "b",
            effect() {
                return new Decimal(0.20)
            },
            unlocked() { return hasUpgrade("t", 31) },
        },
        //Placid Lake, Sun and Moon Reflected method
        31: {
            title: "Mediate in a freezing lake",
            description: "Increase mana cap by 1% per body ★.",
            cost() { return new Decimal(600) },
            currencyDisplayName: "life force",
            currencyInternalName: "lifeForce",
            currencyLayer: "b",
            effect() {
                let effectivepoints = player[this.layer].points
                let effectiveMult = new Decimal(1.00)
                if (hasUpgrade("b", 51)) effectiveMult = effectiveMult.add(upgradeEffect("b", 51))
                if (hasUpgrade("qiocean", 32)) effectiveMult = effectiveMult.add(upgradeEffect("qiocean", 32))
                effectivepoints = effectivepoints.times(effectiveMult)

                let effect = new Decimal(0.01).times(effectivepoints).add(1)
                return softcap(effect, new Decimal(2.5), 0.3)
            },
            effectDisplay() { return format(this.effect()) + "x mana cap" },
            unlocked() { return hasUpgrade("t", 32) },
        },
        32: {
            title: "Let the Light in",
            description: "Raise life force gain by ^1.05.",
            cost() { return new Decimal(6000) },
            currencyDisplayName: "life force",
            currencyInternalName: "lifeForce",
            currencyLayer: "b",
            effect() {
                return new Decimal(1.05)
            },
            unlocked() { return hasUpgrade("t", 32) },
        },
        33: {
            title: "Drown in the Moon",
            description: "Raise 'Mind of Mana' effect by +0.56 and increase the soft cap.",
            cost() { return new Decimal(60000) },
            currencyDisplayName: "life force",
            currencyInternalName: "lifeForce",
            currencyLayer: "b",
            effect() {
                return new Decimal(0.15)
            },
            unlocked() { return hasUpgrade("t", 32) },
        },
        //Jin Rou, the Farmer
        41: {
            title: "Planting the brush",
            description: "Increase droplet gain by 3% per body ★.",
            cost() { return new Decimal(700) },
            currencyDisplayName: "life force",
            currencyInternalName: "lifeForce",
            currencyLayer: "b",
            effect() {
                let effectivepoints = player[this.layer].points
                let effectiveMult = new Decimal(1.00)
                if (hasUpgrade("b", 51)) effectiveMult = effectiveMult.add(upgradeEffect("b", 51))
                if (hasUpgrade("qiocean", 32)) effectiveMult = effectiveMult.add(upgradeEffect("qiocean", 32))
                effectivepoints = effectivepoints.times(effectiveMult)

                let effect = new Decimal(0.03).times(effectivepoints).add(1)
                return softcap(effect, new Decimal(2.5), 0.3)
            },
            effectDisplay() { return format(this.effect()) + "x droplet gain" },
            unlocked() { return hasUpgrade("t", 33) },
        },
        42: {
            title: "Cultivate the canvas",
            description: "Increase 'Spirit of Mana' effect by +0.13.",
            cost() { return new Decimal(7000) },
            currencyDisplayName: "life force",
            currencyInternalName: "lifeForce",
            currencyLayer: "b",
            effect() {
                return new Decimal(0.13)
            },
            unlocked() { return hasUpgrade("t", 33) },
        },
        43: {
            title: "Harvest the portrait",
            description: "Increase droplet gain by life force.",
            cost() { return new Decimal(70000) },
            currencyDisplayName: "life force",
            currencyInternalName: "lifeForce",
            currencyLayer: "b",
            effect() {
                let effect = player.b.lifeForce.add(1).log10().times(0.05).add(1)
                return softcap(effect, new Decimal(5.0), 0.3)
            },
            effectDisplay() { return format(this.effect()) + "x droplet gain" },
            unlocked() { return hasUpgrade("t", 33) },
        },
        51: {
            title: "Synthesis",
            description: "Effective body ★'s for other upgrades is increased by +100%.",
            cost() { return new Decimal(500000) },
            currencyDisplayName: "life force",
            currencyInternalName: "lifeForce",
            currencyLayer: "b",
            effect() {
                let effect = new Decimal(1.0)
                return effect
            },
            unlocked() { return hasUpgrade("b", 23) && hasUpgrade("b", 33) && hasUpgrade("b", 43) },
        },
        52: {
            title: "Innovate",
            description: "Increase mana gain by life force.",
            cost() { return new Decimal(500000) },
            currencyDisplayName: "life force",
            currencyInternalName: "lifeForce",
            currencyLayer: "b",
            effect() {
                let effect = player.b.lifeForce.add(1).log10().times(0.045).add(1)
                return softcap(effect, new Decimal(5.0), 0.3)
            },
            effectDisplay() { return format(this.effect()) + "x mana gain" },
            unlocked() { return hasUpgrade("b", 23) && hasUpgrade("b", 33) && hasUpgrade("b", 43) },
        },
        //unlocked by 3 star meridians
        //15,24,34,44,53
        15: {
            title: "Superhuman Exercise",
            description: "'Crystalize Mana' also increases base life force gain.",
            cost() { return new Decimal("15e6") },
            currencyDisplayName: "life force",
            currencyInternalName: "lifeForce",
            currencyLayer: "b",
            effect() {
                return buyableEffect("m", 11)
            },
            effectDisplay() { return "+" + format(this.effect()) + " life force" },
            unlocked() { return hasMilestone("m", 2) },
        },
        24: {
            title: "Demon Hound Breath",
            description: "'Deep breath' effect also increases base mana cap.",
            cost() { return new Decimal("16e6") },
            currencyDisplayName: "life force",
            currencyInternalName: "lifeForce",
            currencyLayer: "b",
            effect() {
                return upgradeEffect("d", 11)
            },
            effectDisplay() { return "+" + format(this.effect()) + " mana cap" },
            unlocked() { return hasMilestone("m", 2) },
        },
        25: {
            title: "Five Fiery Demon Hounds",
            description: "Core effect increases life force gain at a reduced rate.",
            cost() { return new Decimal("20e6") },
            currencyDisplayName: "life force",
            currencyInternalName: "lifeForce",
            currencyLayer: "b",
            effect() {
                return tmp["c"].effect.ln()
            },
            effectDisplay() { return "" + format(this.effect()) + "x life force gain" },
            unlocked() { return hasMilestone("m", 2) },
        },
        34: {
            title: "Wings of the Sun",
            description: "Life force's core effect base is increased by 100x",
            cost() { return new Decimal("40e6") },
            currencyDisplayName: "life force",
            currencyInternalName: "lifeForce",
            currencyLayer: "b",
            effect() {
                return new Decimal(100)
            },
            effectDisplay() { return format(this.effect()) + "x" },
            unlocked() { return hasMilestone("m", 2) },
        },
        35: {
            title: "Placid Lake, Sun and Moon Reflected",
            description: "Increase life force gain by 100x",
            cost() { return new Decimal("50e6") },
            currencyDisplayName: "life force",
            currencyInternalName: "lifeForce",
            currencyLayer: "b",
            effect() {
                return new Decimal(100)
            },
            effectDisplay() { return format(this.effect()) + "x" },
            unlocked() { return hasMilestone("m", 2) },
        },
        44: {
            title: "Reap the Remains",
            description: "Droplet gain reduced by 15%, but mana cap is tripled.",
            cost() { return new Decimal("2e9") },
            currencyDisplayName: "life force",
            currencyInternalName: "lifeForce",
            currencyLayer: "b",
            effect() {
                return { gain: new Decimal(0.85), cap: new Decimal(3.0) }
            },
            unlocked() { return hasMilestone("m", 2) },
        },
        45: {
            title: "The Farmer",
            description: "Mana dropoff is increased, but mana cap is tripled.",
            cost() { return new Decimal("4e9") },
            currencyDisplayName: "life force",
            currencyInternalName: "lifeForce",
            currencyLayer: "b",
            effect() {
                return { reductionPow: new Decimal(3.0), cap: new Decimal(3.0) }
            },
            unlocked() { return hasMilestone("m", 2) },
        },
        53: {
            title: "Integrate Meridians",
            description: "'Crystalize Mana' effect is increased by body ★s.",
            cost() { return new Decimal("8e9") },
            currencyDisplayName: "life force",
            currencyInternalName: "lifeForce",
            currencyLayer: "b",
            effect() {
                let effectivepoints = player[this.layer].points
                let effectiveMult = new Decimal(1.00)
                if (hasUpgrade("b", 51)) effectiveMult = effectiveMult.add(upgradeEffect("b", 51))
                if (hasUpgrade("qiocean", 32)) effectiveMult = effectiveMult.add(upgradeEffect("qiocean", 32))
                effectivepoints = effectivepoints.times(effectiveMult)

                return effectivepoints.div(2)
            },
            effectDisplay() { return format(this.effect()) + "x" },
            unlocked() { return hasMilestone("m", 2) },
        },
        54: {
            title: "Integrate Mana Channels",
            description: "'Carve Mana Channel' effect is increased by body ★s.",
            cost() { return new Decimal("16e9") },
            currencyDisplayName: "life force",
            currencyInternalName: "lifeForce",
            currencyLayer: "b",
            effect() {
                let effectivepoints = player[this.layer].points
                let effectiveMult = new Decimal(1.00)
                if (hasUpgrade("b", 51)) effectiveMult = effectiveMult.add(upgradeEffect("b", 51))
                if (hasUpgrade("qiocean", 32)) effectiveMult = effectiveMult.add(upgradeEffect("qiocean", 32))
                effectivepoints = effectivepoints.times(effectiveMult)

                return effectivepoints.div(2)
            },
            effectDisplay() { return format(this.effect()) + "x" },
            unlocked() { return hasMilestone("m", 2) },
        },
        55: {
            title: "Bodily Perfection",
            description: "Meridian ★s increase core effect.",
            cost() { return new Decimal("25e9") },
            currencyDisplayName: "life force",
            currencyInternalName: "lifeForce",
            currencyLayer: "b",
            effect() {
                return player.m.points
            },
            effectDisplay() { return "+" + format(this.effect()) },
            unlocked() { return hasMilestone("m", 2) },
        },

    }
})