// ============================================================================
//  REALITY LAYER (R) - A second Row 5 branch from Eternity
//
//  Universe explores other trees. Reality instead folds the Classic+ timeline
//  back onto itself, rewarding players for rebuilding the existing tree.
// ============================================================================

addLayer("r", {
    name: "reality",
    symbol: "R",
    position: 1,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        stability: new Decimal(0),
        auto: false,
    }},
    color: "#FF4FD8",
    requires: new Decimal(10),
    resource: "reality shards",
    baseResource: "eternity points",
    baseAmount() { return player.e.points },
    type: "static",
    base: 2.8,
    exponent: 1.55,
    row: 5,
    branches: [["e", "#FF4FD8"]],
    layerShown() { return hasMilestone("e", 2) || player.r.unlocked },

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("r", 13)) mult = mult.div(1.5)
        if (hasUpgrade("r", 23)) mult = mult.div(upgradeEffect("r", 23))
        if (hasMilestone("r", 3)) mult = mult.div(2)
        return mult
    },
    canBuyMax() { return hasMilestone("r", 2) },
    autoPrestige() { return hasUpgrade("r", 32) && player.r.auto },

    effect() {
        let effect = Decimal.pow(4, player.r.points)
        effect = effect.times(player.r.stability.add(1).pow(0.5))
        if (hasUpgrade("r", 12)) effect = effect.pow(1.2)
        if (hasUpgrade("r", 22)) effect = effect.pow(1.15)
        if (hasChallenge("r", 11)) effect = effect.times(3)
        if (hasChallenge("r", 12)) effect = effect.pow(1.1)
        if (effect.gte("1e150")) effect = effect.div("1e150").pow(0.4).times("1e150")
        return effect
    },
    effectDescription() {
        return "which boost point gain by "+format(tmp.r.effect)+"x and Eternity gain by "+format(tmp.r.effect.pow(0.08))+"x"
    },
    prestigeButtonText() {
        let gain = (tmp.r && tmp.r.resetGain instanceof Decimal) ? tmp.r.resetGain : getResetGain(this.layer)
        let at = (tmp.r && tmp.r.nextAt instanceof Decimal) ? tmp.r.nextAt : getNextAt(this.layer)
        if (gain.gte(1)) return "Collapse Eternity for <b>"+formatWhole(gain)+"</b> reality shard"+(gain.eq(1)?"":"s")+"<br>Next at "+formatWhole(at)+" eternity"
        return "Need "+formatWhole(at)+" eternity ("+formatWhole(player.e.points)+"/"+formatWhole(at)+")"
    },

    infoboxes: {
        lore: {
            title: "The Other Path",
            body: "Eternity splits in two. Universe looks outward into other trees; Reality looks inward and compresses everything you built into a stronger timeline.<br><br>Reality Shards provide a permanent global boost. Stabilize reality, create Dimensions, and survive Reality Fracture challenges to make each rebuild faster.",
        },
    },
    bars: {
        realityBar: {
            direction: RIGHT, width: 500, height: 28,
            progress() { return player.r.points.div(25).min(1).toNumber() },
            display() { return formatWhole(player.r.points)+" / 25 Reality Shards — master this branch" },
            fillStyle: {"background-color":"#FF4FD8", "background-image":"linear-gradient(90deg, #7A2CFF, #FF4FD8)"},
            baseStyle: {"background-color":"#260026"},
            textStyle: {"color":"white", "text-shadow":"1px 1px 2px black"},
        },
        stabilityBar: {
            direction: RIGHT, width: 380, height: 20,
            progress() { return player.r.stability.div(100).min(1).toNumber() },
            display() { return "Reality Stability: "+formatWhole(player.r.stability)+" / 100" },
            fillStyle: {"background-color":"#52E8FF"},
            baseStyle: {"background-color":"#08242A"},
        },
    },

    upgrades: {
        11: {
            title: "A New Timeline",
            description: "Reality Shards also boost Prestige, Time, and Warp gain.",
            cost: new Decimal(1),
            effect() { return player.r.points.add(1).pow(0.75) },
            effectDisplay() { return format(this.effect())+"x" },
        },
        12: {
            title: "Recursive World",
            description: "Raise the Reality effect to the 1.2 power.",
            cost: new Decimal(2),
            unlocked() { return hasUpgrade("r", 11) },
        },
        13: {
            title: "Thinner Veil",
            description: "Reality Shards are 1.5x cheaper.",
            cost: new Decimal(3),
            unlocked() { return hasUpgrade("r", 12) },
        },
        14: {
            title: "Stable Foundation",
            description: "Unlock Reality Stability and the Stabilize clickable.",
            cost: new Decimal(5),
            unlocked() { return hasUpgrade("r", 13) },
        },
        21: {
            title: "Pocket Dimensions",
            description: "Unlock Dimension buyables.",
            cost: new Decimal(8),
            unlocked() { return hasUpgrade("r", 14) },
        },
        22: {
            title: "Reality Within Reality",
            description: "Raise the Reality effect to the 1.15 power.",
            cost: new Decimal(12),
            unlocked() { return hasUpgrade("r", 21) },
        },
        23: {
            title: "Eternal Memory",
            description: "Best Eternity makes Reality Shards cheaper.",
            cost: new Decimal(16),
            effect() { return player.e.best.add(1).log10().add(1).pow(0.5).max(1) },
            effectDisplay() { return "/"+format(this.effect())+" cost" },
            unlocked() { return hasUpgrade("r", 22) },
        },
        31: {
            title: "Fracture",
            description: "Unlock Reality challenges.",
            cost: new Decimal(20),
            unlocked() { return hasUpgrade("r", 23) },
        },
        32: {
            title: "Self-Writing Timeline",
            description: "Unlock automatic Reality resets (toggle in milestones).",
            cost: new Decimal(30),
            unlocked() { return hasUpgrade("r", 31) && hasMilestone("r", 4) },
        },
        33: {
            title: "Transfinite Stabilization",
            description: "Reality Stability max cap increased to 500 and boosts Omniverse Energy.",
            cost: new Decimal(50),
            unlocked() { return hasUpgrade("r", 32) },
        },
        34: {
            title: "Cosmic Fabric",
            description: "Multiply point gain by 1e100 and raise Reality effect ^1.25.",
            cost: new Decimal(100),
            unlocked() { return hasUpgrade("r", 33) },
        },
        // Row 4 — Reality Mastery (v0.8 Full)
        41: {
            title: "Hyperstability",
            description: "Reality effect ^1.3.",
            cost: new Decimal(250),
            unlocked() { return hasUpgrade("r", 34) },
        },
        42: {
            title: "Resonant Collapse",
            description: "Reality Shards boost Singularity gain.",
            cost: new Decimal(600),
            effect() { return player.r.points.add(1).pow(0.15) },
            effectDisplay() { return format(this.effect()) + "x S gain" },
            unlocked() { return hasUpgrade("r", 41) },
        },
        43: {
            title: "Stability Overload",
            description: "Stability cap raised to 1,000 and each point of Stability is stronger.",
            cost: new Decimal(1500),
            unlocked() { return hasUpgrade("r", 42) },
        },
    },

    buyables: {
        11: {
            title: "Point Dimension",
            cost(x) { return new Decimal("1e50").times(Decimal.pow("1e25", x)) },
            effect(x) { return Decimal.pow(100, x) },
            display() {
                let data = tmp.r.buyables[this.id]
                return "Condense ordinary points into a pocket dimension.<br>Cost: "+format(data.cost)+" points<br>Amount: "+formatWhole(getBuyableAmount("r", this.id))+"<br>Effect: "+format(data.effect)+"x point gain"
            },
            unlocked() { return hasUpgrade("r", 21) },
            canAfford() { return player.points.gte(tmp.r.buyables[this.id].cost) },
            buy() {
                player.points = player.points.sub(tmp.r.buyables[this.id].cost)
                setBuyableAmount("r", this.id, getBuyableAmount("r", this.id).add(1))
            },
            style: {"height":"130px", "background-color":"#5A1765"},
        },
        12: {
            title: "Eternal Dimension",
            cost(x) { return new Decimal(2).times(Decimal.pow(2, x)) },
            effect(x) { return Decimal.pow(1.75, x) },
            display() {
                let data = tmp.r.buyables[this.id]
                return "Fold Eternity into a self-sustaining dimension.<br>Cost: "+formatWhole(data.cost)+" eternity<br>Amount: "+formatWhole(getBuyableAmount("r", this.id))+"<br>Effect: "+format(data.effect)+"x Eternity gain"
            },
            unlocked() { return hasMilestone("r", 2) },
            canAfford() { return player.e.points.gte(tmp.r.buyables[this.id].cost) },
            buy() {
                player.e.points = player.e.points.sub(tmp.r.buyables[this.id].cost)
                setBuyableAmount("r", this.id, getBuyableAmount("r", this.id).add(1))
            },
            style: {"height":"130px", "background-color":"#35206E"},
        },
        13: {
            title: "Omni Dimension",
            cost(x) { return new Decimal(10).times(Decimal.pow(3, x)) },
            effect(x) { return Decimal.pow(1e5, x) },
            display() {
                let data = tmp.r.buyables[this.id]
                return "Anchor multidimensional reality shards.<br>Cost: "+formatWhole(data.cost)+" reality shards<br>Amount: "+formatWhole(getBuyableAmount("r", this.id))+"<br>Effect: "+format(data.effect)+"x to ALL point gains"
            },
            unlocked() { return hasUpgrade("r", 33) },
            canAfford() { return player.r.points.gte(tmp.r.buyables[this.id].cost) },
            buy() {
                player.r.points = player.r.points.sub(tmp.r.buyables[this.id].cost)
                setBuyableAmount("r", this.id, getBuyableAmount("r", this.id).add(1))
            },
            style: {"height":"130px", "background-color":"#1a4455"},
        },
    },

    clickables: {
        11: {
            title: "Stabilize Reality",
            display() { return "Convert 1 Eternity Point into 1 Stability.<br>Stability: "+formatWhole(player.r.stability)+"<br>Each Stability strengthens the Reality effect." },
            unlocked() { return hasUpgrade("r", 14) },
            canClick() { return player.e.points.gte(1) && player.r.stability.lt(this.maxStab()) },
            maxStab() { return hasUpgrade("r", 43) ? 1000 : (hasUpgrade("r", 33) ? 500 : 100) },
            onClick() {
                player.e.points = player.e.points.sub(1)
                player.r.stability = player.r.stability.add(1).min(100)
            },
            onHold() { if (this.canClick()) this.onClick() },
            style: {"height":"115px", "width":"220px", "background-color":"#176575"},
        },
    },

    challenges: {
        11: {
            name: "Shattered Timeline",
            challengeDescription: "Reality and Universe effects are disabled. Point gain is raised to the 0.35 power.",
            goalDescription: "Reach 1e80 points",
            canComplete() { return player.points.gte("1e80") },
            rewardDescription: "Reality effect is multiplied by 3.",
            unlocked() { return hasUpgrade("r", 31) },
        },
        12: {
            name: "Groundhog Eternity",
            challengeDescription: "All row 1–3 effects are severely weakened and point gain is raised to the 0.25 power.",
            goalDescription: "Reach 1e120 points",
            canComplete() { return player.points.gte("1e120") },
            rewardDescription: "Raise the Reality effect to the 1.1 power.",
            unlocked() { return hasChallenge("r", 11) },
        },
    },

    milestones: {
        0: {
            requirementDescription: "1 reality shard",
            effectDescription: "Keep Eternity milestones and gain 2x points.",
            done() { return player.r.best.gte(1) },
        },
        1: {
            requirementDescription: "3 reality shards",
            effectDescription: "Keep Reality upgrades and Stability on Eternity resets.",
            done() { return player.r.best.gte(3) },
            unlocked() { return hasMilestone("r", 0) },
        },
        2: {
            requirementDescription: "8 reality shards",
            effectDescription: "Buy max Reality Shards and unlock Eternal Dimensions.",
            done() { return player.r.best.gte(8) },
            unlocked() { return hasMilestone("r", 1) },
        },
        3: {
            requirementDescription: "15 reality shards",
            effectDescription: "Reality Shards are 2x cheaper and Stability is retained.",
            done() { return player.r.best.gte(15) },
            unlocked() { return hasMilestone("r", 2) },
        },
        4: {
            requirementDescription: "25 reality shards",
            effectDescription: "Master Reality and unlock its automation toggle.",
            done() { return player.r.best.gte(25) },
            toggles: [["r", "auto"]],
            unlocked() { return hasMilestone("r", 3) },
        },
        5: {
            requirementDescription: "50 reality shards",
            effectDescription: "Reality Stability never resets and passively generates +5/s.",
            done() { return player.r.best.gte(50) },
            unlocked() { return hasMilestone("r", 4) },
        },
    },

    update(diff) {
        if (!player.r) return
        if (hasMilestone("r", 5)) {
            let maxStab = hasUpgrade("r", 33) ? 500 : 100
            player.r.stability = player.r.stability.add(new Decimal(5).times(diff)).min(maxStab)
        }
    },
    tabFormat: {
        "Reality": {
            content: ["main-display", "prestige-button", "blank", "resource-display", "blank", ["infobox", "lore"], "blank", ["bar", "realityBar"], "blank", "milestones", "blank", "upgrades"],
        },
        "Stability": {
            content: ["main-display", ["bar", "stabilityBar"], "blank", "clickables", "blank", "buyables"],
            unlocked() { return hasUpgrade("r", 14) },
        },
        "Fractures": {
            content: ["main-display", "blank", "challenges"],
            unlocked() { return hasUpgrade("r", 31) },
        },
    },

    hotkeys: [{key: "r", description: "R: Reset for Reality Shards", onPress() { if (canReset("r")) doReset("r") }}],
    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let keep = []
            if (hasMilestone("r", 1)) keep.push("upgrades")
            if (hasMilestone("r", 2)) keep.push("milestones", "buyables")
            if (hasMilestone("r", 3)) keep.push("stability")
            // Finality milestone 0: the Reality branch is woven into Finality and survives ascension
            if (hasMilestone("f", 0)) keep.push("upgrades", "milestones", "buyables", "points", "best", "total", "stability")
            layerDataReset("r", keep)
        }
    },
})
