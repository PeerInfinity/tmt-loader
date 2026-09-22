// ============================================================================
//  THE CLASSIC+ TREE v0.8 - THE OMNIVERSE (Developer Preview)
//  Row 7: Omniverse (O / Ω) — The ultimate metaphysical layer above Singularity.
//  Transcends all 12 multiverse timelines and merges them into pure Omniverse Energy.
//  New mechanics: Omni-Grid (4x4 Matrix), Omniverse Cores, Omega Challenges,
//                 Transfinite Resonance, Omniverse Field
// ============================================================================

addLayer("o", {
    name: "omniverse",
    symbol: "Ω",
    position: 0,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            field: new Decimal(0),          // Omniverse Field generated over time
            syntheses: 0,                   // Omni-grid syntheses performed
            pulseTimer: 0,                  // Omni-pulse duration remaining
            auto: false,
            // 4x4 matrix representation stored as key: tier (0=Void, 1=Particle, 2=Energy, 3=Singularity, 4=Omniverse)
            grid: {
                11: 0, 12: 0, 13: 0, 14: 0,
                21: 0, 22: 0, 23: 0, 24: 0,
                31: 0, 32: 0, 33: 0, 34: 0,
                41: 0, 42: 0, 43: 0, 44: 0,
            },
        }
    },
    color: "#00FFAA",
    requires: new Decimal(20), // 20 Singularities
    resource: "omniverse energy",
    baseResource: "singularities",
    baseAmount() { return player.s2 ? player.s2.points : new Decimal(0) },
    type: "static",
    base: 3.5,
    exponent: 1.85,
    row: 7,
    branches: [["s2", "#FF00FF"]],
    layerShown() {
        return (player.s2 && player.s2.unlocked && player.s2.points.gte(15)) ||
               (player.o && player.o.unlocked)
    },
    gainMult() {
        if (!player.o) return new Decimal(1)
        let mult = new Decimal(1)
        if (hasUpgrade('o', 11)) mult = mult.times(upgradeEffect('o', 11))
        if (hasUpgrade('o', 13)) mult = mult.times(2.5)
        if (hasUpgrade('o', 22)) mult = mult.times(buyableEffect('o', 12))
        if (hasUpgrade('o', 51)) mult = mult.times(10)
        if (hasUpgrade('o', 53) && tmp.o && tmp.o.buyables && tmp.o.buyables[16]) mult = mult.times(buyableEffect('o', 16))
        if (hasChallenge('o', 13)) mult = mult.times(3)
        if (player.o.syntheses >= 10) mult = mult.times(2)
        return mult
    },
    gainExp() {
        if (!player.o) return new Decimal(1)
        let exp = new Decimal(1)
        if (hasUpgrade('o', 21)) exp = exp.times(1.1)
        if (hasUpgrade('o', 41)) exp = exp.times(1.15)
        return exp
    },
    effect() {
        if (!player.o || !player.o.unlocked) return new Decimal(1)
        let eff = Decimal.pow(1e25, player.o.points)
        if (hasUpgrade('o', 12)) eff = eff.pow(1.5)
        if (hasUpgrade('o', 22)) eff = eff.times(buyableEffect('o', 11))
        if (hasUpgrade('o', 33)) eff = eff.pow(1.3)
        if (hasUpgrade('o', 53)) eff = eff.pow(1.2)
        if (hasChallenge('o', 11)) eff = eff.times(100)
        if (player.o.pulseTimer > 0) eff = eff.times(10)
        // Softcap at 1e2000
        if (eff.gte("1e2000")) eff = eff.div("1e2000").pow(0.25).times("1e2000")
        return eff
    },
    effectDescription() {
        if (!player.o || !player.o.unlocked) return ""
        let pulseTxt = player.o.pulseTimer > 0 ? " <b style='color:#ffff00'>[OMNI-PULSE ACTIVE: 10x!]</b>" : ""
        return "which transcends all multiverse timelines — boosting ALL point gains by " + format(tmp.o.effect) + "x" + pulseTxt
    },
    prestigeButtonText() {
        if (!player.o) return ""
        let gain = (tmp.o && tmp.o.resetGain instanceof Decimal) ? tmp.o.resetGain : getResetGain(this.layer)
        let at = (tmp.o && tmp.o.nextAt instanceof Decimal) ? tmp.o.nextAt : getNextAt(this.layer)
        if (gain.gte(1)) return "Transcend Reality for <b>" + formatWhole(gain) + "</b> omniverse energy<br>Next at " + formatWhole(at) + " singularities"
        return "Need " + formatWhole(at) + " singularities (" + formatWhole(player.s2 ? player.s2.points : 0) + "/" + formatWhole(at) + ")"
    },
    bars: {
        omniverseBar: {
            direction: RIGHT, width: 550, height: 30,
            progress() { return player.o.points.div(50).min(1).toNumber() },
            display() { return formatWhole(player.o.points) + " / 50 Omniverse Energy — TRANSCENDENT VICTORY" },
            fillStyle: { 'background-color': "#00FFAA", 'background-image': "linear-gradient(90deg, #00FFAA, #00BFFF, #AA00FF)" },
            baseStyle: { 'background-color': "#00221a" },
            textStyle: { 'color': "#000000", 'font-weight': "bold", 'text-shadow': "0px 0px 3px #ffffff" },
        },
        omniFieldBar: {
            direction: RIGHT, width: 450, height: 22,
            progress() { return player.o.field.div(player.o.field.add(500)).toNumber() },
            display() { return "Omniverse Field: " + format(player.o.field) + " (+" + format(tmp.o.fieldRate || 0) + "/s)" },
            fillStyle: { 'background-color': "#00BFFF" },
            baseStyle: { 'background-color': "#001a2e" },
            unlocked() { return hasUpgrade('o', 14) },
        },
        matrixBar: {
            direction: RIGHT, width: 450, height: 22,
            progress() {
                if (!player.o || !player.o.grid) return 0
                let total = 0
                for (let k in player.o.grid) total += (player.o.grid[k] || 0)
                return Math.min(1, total / 64) // 16 cells * max tier 4 = 64
            },
            display() {
                if (!player.o || !player.o.grid) return "Matrix: 0/64"
                let total = 0
                for (let k in player.o.grid) total += (player.o.grid[k] || 0)
                return "Omni-Matrix Synthesis: " + total + " / 64 Power"
            },
            fillStyle: { 'background-color': "#FF00FF" },
            baseStyle: { 'background-color': "#2b002b" },
            unlocked() { return hasUpgrade('o', 21) },
        },
    },
    infoboxes: {
        lore: {
            title: "The Omniverse Horizon",
            body: `
                Beyond the collapse of individual timelines lies the <b>Omniverse (Ω)</b> — the infinite metaphysical continuum encompassing every universe, tree, reality, and singularity that ever existed.<br><br>
                Omniverse Energy transcends standard arithmetic growth, granting supreme multipliers, higher-dimensional matrix synthesis (Omni-Grid), transfinite core buyables, and Omega Challenges.<br><br>
                <b>Endgame Goal:</b> Attain 50 Omniverse Energy, master all 12 universes, or reach 1e1000 points.
            `,
        },
        gridLore: {
            title: "The Omni-Matrix (4x4)",
            body: `
                The Omni-Matrix synthesizes metaphysical energy across 16 cosmic cells:<br>
                🌌 <b>Void (Tier 0)</b> → ⚛️ <b>Particle (Tier 1)</b> → 💠 <b>Energy (Tier 2)</b> → 🔮 <b>Singularity (Tier 3)</b> → 👑 <b>Omniverse (Tier 4)</b><br><br>
                Click individual cells or use <b>Cosmic Synthesis</b> to upgrade tiles. Each tier elevates your point gain and Omniverse field generation exponentially!
            `,
        },
    },
    upgrades: {
        11: {
            title: "Transfinite Awakening",
            description: "Omniverse energy boosts its own gain.",
            cost: new Decimal(1),
            effect() { return player.o.points.add(1).pow(0.75) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        12: {
            title: "Multiverse Synthesis",
            description: "Raise Omniverse effect to the 1.5 power.",
            cost: new Decimal(2),
            unlocked() { return hasUpgrade('o', 11) },
        },
        13: {
            title: "Reality-Singularity Bridge",
            description: "Omniverse gain x2.5 and Singularities multiply Reality Shard effects.",
            cost: new Decimal(3),
            unlocked() { return hasUpgrade('o', 12) },
        },
        14: {
            title: "Cosmic Field",
            description: "Unlock the Omniverse Field, which passively grows over time and multiplies point gain.",
            cost: new Decimal(5),
            unlocked() { return hasUpgrade('o', 13) },
        },
        21: {
            title: "Omni-Matrix Unlocked",
            description: "Unlock the 4x4 Omni-Matrix grid and Omniverse gain exponent ^1.1.",
            cost: new Decimal(8),
            unlocked() { return hasUpgrade('o', 14) },
        },
        22: {
            title: "Core Resonance",
            description: "Unlock Omniverse Cores (buyables 11 & 12).",
            cost: new Decimal(12),
            unlocked() { return hasUpgrade('o', 21) },
        },
        23: {
            title: "Transfinite Rift",
            description: "Unlock Omega Challenges.",
            cost: new Decimal(18),
            unlocked() { return hasUpgrade('o', 22) },
        },
        24: {
            title: "Automated Synthesis",
            description: "Passively synthesizes the lowest Omni-Matrix cell each tick.",
            cost: new Decimal(25),
            unlocked() { return hasUpgrade('o', 23) },
        },
        31: {
            title: "Multiverse Transcendence",
            description: "Unlocks travel to all new community universes in Universe (U).",
            cost: new Decimal(35),
            unlocked() { return hasUpgrade('o', 24) },
        },
        32: {
            title: "Omnipresent Horizon",
            description: "Point gain softcaps pushed 1e500 orders of magnitude further.",
            cost: new Decimal(50),
            unlocked() { return hasUpgrade('o', 31) },
        },
        33: {
            title: "Ultimate Compression",
            description: "Omniverse effect ^1.3 and Omni-Grid effect ^1.5.",
            cost: new Decimal(75),
            unlocked() { return hasUpgrade('o', 32) },
        },
        34: {
            title: "Temporal Transcendence",
            description: "Singularity and Omniverse Fields generate 10x faster.",
            cost: new Decimal(100),
            unlocked() { return hasUpgrade('o', 33) },
        },
        41: {
            title: "Cosmological Constant",
            description: "Omniverse energy exponent +15% and gain x5.",
            cost: new Decimal(150),
            unlocked() { return hasUpgrade('o', 34) },
        },
        42: {
            title: "Omniverse Singularity Loop",
            description: "Gain 100% of Singularity reset gain every second passively.",
            cost: new Decimal(200),
            unlocked() { return hasUpgrade('o', 41) },
        },
        43: {
            title: "The Absolute Omega",
            description: "Multiply point gain by 1e500 and achieve complete Omniversal enlightenment.",
            cost: new Decimal(250),
            unlocked() { return hasUpgrade('o', 42) },
        },
        // Row 5 — The Final Horizon (v0.8 Full)
        51: {
            title: "Final Horizon",
            description: "Omniverse gain x10. The edge of the Omniverse comes into view...",
            cost: new Decimal(400),
            unlocked() { return hasUpgrade('o', 43) },
        },
        52: {
            title: "Transfinite Matrix",
            description: "Omni-Matrix effect ^1.25.",
            cost: new Decimal(700),
            unlocked() { return hasUpgrade('o', 51) },
        },
        53: {
            title: "Omega Paragon",
            description: "Omniverse effect ^1.2, unlock the Omega Reactor & Transfinite Loom, and all active universe bonuses +2.",
            cost: new Decimal(1200),
            unlocked() { return hasUpgrade('o', 52) },
        },
    },
    buyables: {
        11: {
            title: "Cosmic Synthesizer",
            cost(x) {
                let c = Decimal.pow(2, x).times(2)
                if (hasMilestone('o', 6)) c = c.div(10)
                if (player.f && hasUpgrade('f', 42)) c = c.div(10)
                return c
            },
            effect(x) {
                let eff = Decimal.pow(1e10, x)
                if (hasUpgrade('o', 33)) eff = eff.pow(1.5)
                return eff
            },
            display() {
                let d = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(d.cost) + " omniverse energy<br>Amount: " + formatWhole(player.o.buyables[this.id]) +
                    "<br>Effect: " + format(d.effect) + "x to point gain and Singularity effect"
            },
            unlocked() { return hasUpgrade('o', 22) },
            canAfford() { return player.o.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let c = tmp[this.layer].buyables[this.id].cost
                player.o.points = player.o.points.sub(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: { 'height': '130px', 'background-color': "#003322" },
        },
        12: {
            title: "Dimensional Loom",
            cost(x) {
                let c = Decimal.pow(2.5, x).times(3)
                if (hasMilestone('o', 6)) c = c.div(10)
                if (player.f && hasUpgrade('f', 42)) c = c.div(10)
                return c
            },
            effect(x) {
                let eff = Decimal.pow(2, x)
                return eff
            },
            display() {
                let d = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(d.cost) + " omniverse energy<br>Amount: " + formatWhole(player.o.buyables[this.id]) +
                    "<br>Effect: " + format(d.effect) + "x to Omniverse energy gain"
            },
            unlocked() { return hasUpgrade('o', 22) },
            canAfford() { return player.o.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let c = tmp[this.layer].buyables[this.id].cost
                player.o.points = player.o.points.sub(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: { 'height': '130px', 'background-color': "#002233" },
        },
        13: {
            title: "Chrono-Nexus",
            cost(x) {
                let c = Decimal.pow(3, x).times(5)
                if (hasMilestone('o', 6)) c = c.div(10)
                if (player.f && hasUpgrade('f', 42)) c = c.div(10)
                return c
            },
            effect(x) { return Decimal.pow(1.5, x) },
            display() {
                let d = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(d.cost) + " omniverse energy<br>Amount: " + formatWhole(player.o.buyables[this.id]) +
                    "<br>Effect: " + format(d.effect) + "x to Field generation speed"
            },
            unlocked() { return hasMilestone('o', 2) },
            canAfford() { return player.o.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let c = tmp[this.layer].buyables[this.id].cost
                player.o.points = player.o.points.sub(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: { 'height': '130px', 'background-color': "#330033" },
        },
        14: {
            title: "Infinity Engine",
            cost(x) {
                let c = Decimal.pow(4, x).times(10)
                if (hasMilestone('o', 6)) c = c.div(10)
                if (player.f && hasUpgrade('f', 42)) c = c.div(10)
                return c
            },
            effect(x) { return new Decimal(1).add(x.times(0.05)) },
            display() {
                let d = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(d.cost) + " omniverse energy<br>Amount: " + formatWhole(player.o.buyables[this.id]) +
                    "<br>Effect: ^" + format(d.effect) + " to ALL previous layer effects"
            },
            unlocked() { return hasMilestone('o', 2) },
            canAfford() { return player.o.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let c = tmp[this.layer].buyables[this.id].cost
                player.o.points = player.o.points.sub(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: { 'height': '130px', 'background-color': "#332200" },
        },
        15: {
            title: "Omega Reactor",
            cost(x) {
                let c = Decimal.pow(5, x).times(20)
                if (player.f && hasUpgrade('f', 42)) c = c.div(10)
                return c
            },
            effect(x) { return Decimal.pow(1e50, x) },
            display() {
                let d = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(d.cost) + " omniverse energy<br>Amount: " + formatWhole(player.o.buyables[this.id]) +
                    "<br>Effect: " + format(d.effect) + "x to all point gains"
            },
            unlocked() { return hasUpgrade('o', 53) },
            canAfford() { return player.o.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let c = tmp[this.layer].buyables[this.id].cost
                player.o.points = player.o.points.sub(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: { 'height': '130px', 'background-color': "#004433" },
        },
        16: {
            title: "Transfinite Loom",
            cost(x) {
                let c = Decimal.pow(8, x).times(50)
                if (player.f && hasUpgrade('f', 42)) c = c.div(10)
                return c
            },
            effect(x) { return Decimal.pow(3, x) },
            display() {
                let d = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(d.cost) + " omniverse energy<br>Amount: " + formatWhole(player.o.buyables[this.id]) +
                    "<br>Effect: " + format(d.effect) + "x to Omniverse Energy gain"
            },
            unlocked() { return hasUpgrade('o', 53) },
            canAfford() { return player.o.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let c = tmp[this.layer].buyables[this.id].cost
                player.o.points = player.o.points.sub(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: { 'height': '130px', 'background-color': "#112233" },
        },
    },
    clickables: {
        11: {
            title: "Omni-Pulse",
            display() {
                return player.o.pulseTimer > 0 ?
                    "<b>PULSE ACTIVE</b><br>" + format(player.o.pulseTimer, 1) + "s remaining<br>(10x point gain)" :
                    "Activate <b>Omni-Pulse</b><br>Cost: 1 O<br>Duration: 15s (10x points)"
            },
            canClick() { return player.o.points.gte(1) && (player.o.pulseTimer || 0) <= 0 },
            onClick() {
                if (player.o.points.gte(1)) {
                    player.o.points = player.o.points.sub(1)
                    player.o.pulseTimer = 15
                }
            },
            style: { 'height': '100px', 'width': '220px', 'background-color': "#006644" },
            unlocked() { return hasUpgrade('o', 14) },
        },
        12: {
            title: "Cosmic Synthesis",
            display() {
                return "<b>Cosmic Synthesis</b><br>Synthesize all eligible cells in the Omni-Matrix.<br>Cost: 2 O"
            },
            canClick() {
                if (!player.o.points.gte(2) || !hasUpgrade('o', 21) || !player.o.grid) return false
                for (let k in player.o.grid) { if (player.o.grid[k] < 4) return true }
                return false
            },
            onClick() {
                player.o.points = player.o.points.sub(2)
                let upgraded = 0
                for (let k in player.o.grid) {
                    if (player.o.grid[k] < 4) { player.o.grid[k]++; upgraded++ }
                }
                player.o.syntheses += upgraded
            },
            style: { 'height': '100px', 'width': '220px', 'background-color': "#660066" },
            unlocked() { return hasUpgrade('o', 21) },
        },
        13: {
            title: "Overclock Multiverse",
            display() {
                return "<b>Multiverse Overdrive</b><br>Instantly grants 5 seconds of active universe generation.<br>Cooldown: 30s"
            },
            canClick() { return player.o.unlocked && (player.u ? player.u.unlocked : false) },
            onClick() {
                if (player.u) {
                    player.u.points = player.u.points.add(tmp.u.resetGain ? tmp.u.resetGain.times(0.1).max(1) : new Decimal(1))
                    doPopup("none", "Multiverse Overclock triggered! Gained Universe Points.", "Cosmic Burst", 3, "#00FFAA")
                }
            },
            style: { 'height': '100px', 'width': '220px', 'background-color': "#224466" },
            unlocked() { return hasUpgrade('o', 31) },
        },
    },
    challenges: {
        11: {
            name: "Omega Void",
            challengeDescription: "All previous layer effects are powered to ^0.02. Point gain ^0.2.",
            goalDescription: "Reach 1e100 points",
            canComplete() { return player.points.gte("1e100") },
            rewardDescription: "Omniverse effect multiplied by 100x permanently.",
            unlocked() { return hasUpgrade('o', 23) },
        },
        12: {
            name: "Paradox Matrix",
            challengeDescription: "Singularity and Reality effects are completely disabled. Omni-grid synthesis paused.",
            goalDescription: "Reach 1e150 points",
            canComplete() { return player.points.gte("1e150") },
            rewardDescription: "Omniverse Field generation speed tripled.",
            unlocked() { return hasChallenge('o', 11) },
        },
        13: {
            name: "Chrono-Freeze",
            challengeDescription: "Game time moves at 10% speed. Point gain raised to ^0.1.",
            goalDescription: "Reach 1e200 points",
            canComplete() { return player.points.gte("1e200") },
            rewardDescription: "Omniverse Energy gain multiplied by 3x.",
            unlocked() { return hasChallenge('o', 12) },
        },
        14: {
            name: "Grand Omega Multiverse",
            challengeDescription: "Combines Omega Void, Paradox Matrix, and Chrono-Freeze simultaneously!",
            goalDescription: "Reach 1e300 points",
            canComplete() { return player.points.gte("1e300") },
            rewardDescription: "Point gain multiplied by 1e100x and achieve TRANSCENDENT VICTORY.",
            unlocked() { return hasChallenge('o', 13) },
        },
        15: {
            name: "Final Omega",
            challengeDescription: "Everything is powered to ^0.001. Point gain ^0.01. Beyond the Grand Omega lies only this.",
            goalDescription: "Reach 1e500 points",
            canComplete() { return player.points.gte("1e500") },
            rewardDescription: "Finality gain exponent +25%.",
            unlocked() { return hasChallenge('o', 14) },
        },
    },
    milestones: {
        0: {
            requirementDescription: "1 Omniverse Energy",
            effectDescription: "Keep Singularity milestones, point gain multiplied by 10x.",
            done() { return player.o.best.gte(1) },
        },
        1: {
            requirementDescription: "3 Omniverse Energy",
            effectDescription: "Keep Singularity upgrades and automate Singularity prestige.",
            done() { return player.o.best.gte(3) },
            unlocked() { return hasMilestone('o', 0) },
        },
        2: {
            requirementDescription: "7 Omniverse Energy",
            effectDescription: "Unlock Chrono-Nexus and Infinity Engine buyables.",
            done() { return player.o.best.gte(7) },
            unlocked() { return hasMilestone('o', 1) },
        },
        3: {
            requirementDescription: "15 Omniverse Energy",
            effectDescription: "Passively generate 100% of Singularity reset gain per second.",
            done() { return player.o.best.gte(15) },
            unlocked() { return hasMilestone('o', 2) },
        },
        4: {
            requirementDescription: "25 Omniverse Energy",
            effectDescription: "Auto-buy Singularity buyables and Omniverse upgrades.",
            done() { return player.o.best.gte(25) },
            unlocked() { return hasMilestone('o', 3) },
        },
        5: {
            requirementDescription: "50 Omniverse Energy",
            effectDescription: "TRANSCENDENT VICTORY! All universe bonuses raised ^1.5.",
            done() { return player.o.best.gte(50) },
            unlocked() { return hasMilestone('o', 4) },
        },
        6: {
            requirementDescription: "100 Omniverse Energy",
            effectDescription: "Cosmic Master: Point gain ^1.2 and Omniverse Cores cost /10.",
            done() { return player.o.best.gte(100) },
            unlocked() { return hasMilestone('o', 5) },
        },
        7: {
            requirementDescription: "250 Omniverse Energy",
            effectDescription: "Absolute Omnipotence: Reach 100% Mastery automatically.",
            done() { return player.o.best.gte(250) },
            unlocked() { return hasMilestone('o', 6) },
        },
    },
    grid: {
        rows: 4,
        cols: 4,
        getStartData(id) { return 0 },
        getUnlocked(id) { return hasUpgrade('o', 21) },
        getCanClick(data, id) { return player.o.points.gte(1) && data < 4 },
        onClick(data, id) {
            if (player.o.points.gte(1) && data < 4) {
                player.o.points = player.o.points.sub(1)
                player.o.grid[id] = data + 1
                player.o.syntheses++
            }
        },
        getTitle(data, id) {
            const symbols = ["🌌 Void", "⚛️ Particle", "💠 Energy", "🔮 Singulon", "👑 Omniverse"]
            return symbols[data] || "🌌 Void"
        },
        getDisplay(data, id) {
            const boosts = ["1x", "100x", "1e5x", "1e12x", "1e25x"]
            return "Tier " + data + "<br>+" + (boosts[data] || "1x")
        },
        getStyle(data, id) {
            const colors = ["#111122", "#004466", "#0088aa", "#8800aa", "#00ffaa"]
            const textColors = ["#888888", "#ffffff", "#ffffff", "#ffffff", "#000000"]
            return {
                'background-color': colors[data] || "#111122",
                'color': textColors[data] || "#ffffff",
                'font-size': '11px',
                'height': '65px',
                'width': '65px',
                'border-radius': '6px',
                'margin': '3px',
                'font-weight': 'bold',
            }
        },
    },
    getGridEffect() {
        if (!player.o || !player.o.grid) return new Decimal(1)
        let mult = new Decimal(1)
        for (let k in player.o.grid) {
            let tier = player.o.grid[k] || 0
            if (tier === 1) mult = mult.times(100)
            else if (tier === 2) mult = mult.times(1e5)
            else if (tier === 3) mult = mult.times(1e12)
            else if (tier === 4) mult = mult.times(1e25)
        }
        if (hasUpgrade('o', 33)) mult = mult.pow(1.5)
        if (hasUpgrade('o', 52)) mult = mult.pow(1.25)
        return mult
    },
    update(diff) {
        if (!player.o) return

        // Pulse cooldown / timer
        if (player.o.pulseTimer > 0) {
            player.o.pulseTimer = Math.max(0, player.o.pulseTimer - diff)
        }

        // Omniverse Field generation
        if (player.o.unlocked && hasUpgrade('o', 14)) {
            let rate = player.o.points.add(1).pow(0.5)
            if (hasChallenge('o', 12)) rate = rate.times(3)
            if (hasUpgrade('o', 34)) rate = rate.times(10)
            if (hasUpgrade('f', 14)) rate = rate.times(25)   // Finality: Omniverse Nexus
            if (hasUpgrade('o', 22) && tmp.o && tmp.o.buyables && tmp.o.buyables[13]) {
                rate = rate.times(buyableEffect('o', 13))
            }
            if (hasUpgrade('f', 41) && tmp.f && tmp.f.buyables && tmp.f.buyables[13]) {
                try { rate = rate.times(buyableEffect('f', 13)) } catch (e) {}
            }
            tmp.o.fieldRate = rate
            player.o.field = player.o.field.add(rate.times(diff))
        }

        // Automated synthesis upgrade
        if (hasUpgrade('o', 24) && player.o.grid && player.o.points.gte(1)) {
            let lowestKey = null
            let lowestVal = 4
            for (let k in player.o.grid) {
                if (player.o.grid[k] < lowestVal) {
                    lowestVal = player.o.grid[k]
                    lowestKey = k
                }
            }
            if (lowestKey !== null && lowestVal < 4) {
                player.o.points = player.o.points.sub(1)
                player.o.grid[lowestKey]++
                player.o.syntheses++
            }
        }

        // Milestone 3: passive Singularity generation
        if (hasMilestone('o', 3) && player.s2 && player.s2.unlocked) {
            let sGain = tmp.s2 && tmp.s2.resetGain instanceof Decimal ? tmp.s2.resetGain : getResetGain('s2')
            if (sGain.gte(1)) {
                player.s2.points = player.s2.points.add(sGain.times(diff))
                if (player.s2.points.gt(player.s2.best)) player.s2.best = player.s2.points
            }
        }
    },
    tabFormat: {
        "Omniverse": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "resource-display",
                "blank",
                ["infobox", "lore"],
                "blank",
                ["bar", "omniverseBar"],
                "blank",
                ["bar", "omniFieldBar"],
                "blank",
                ["row", [["clickable", 11], ["clickable", 12], ["clickable", 13]]],
                "blank",
                "milestones",
            ],
        },
        "Omni-Matrix": {
            content: [
                "main-display",
                ["infobox", "gridLore"],
                "blank",
                ["bar", "matrixBar"],
                "blank",
                ["display-text", function() {
                    let eff = layers.o.getGridEffect()
                    return "<h3>Omni-Matrix Total Multiplier: " + format(eff) + "x</h3>"
                }],
                "blank",
                "grid",
                "blank",
                ["clickable", 12],
            ],
            unlocked() { return hasUpgrade('o', 21) },
        },
        "Upgrades & Cores": {
            content: [
                "main-display",
                "blank",
                "upgrades",
                "blank",
                "buyables",
            ],
        },
        "Omega Challenges": {
            content: [
                "main-display",
                "blank",
                ["display-text", function() { return "Omega Challenges push metaphysical balance to the absolute limit. Complete all 4 for Transcendent Victory." }],
                "blank",
                "challenges",
            ],
            unlocked() { return hasUpgrade('o', 23) },
        },
        "Cosmic Lore": {
            content: [
                ["display-text", function() {
                    let txt = "<h3>Omniverse Overview</h3><br>"
                    txt += "Omniverse Energy: " + formatWhole(player.o.points) + " (best: " + formatWhole(player.o.best) + ")<br>"
                    txt += "Omniverse Field: " + format(player.o.field) + "<br>"
                    txt += "Total Matrix Syntheses: " + player.o.syntheses + "<br>"
                    txt += "Matrix Multiplier: " + format(layers.o.getGridEffect()) + "x<br>"
                    txt += "Omniverse Total Multiplier: " + format(tmp.o.effect) + "x<br><br>"
                    txt += "<b>The 15 Multiverse Realms:</b><br>"
                    txt += "1. Classic (1.0) | 2. Rewritten (PT:R) | 3. TMT Demo | 4. Incrementreeverse<br>"
                    txt += "5. Classic+ Hub | 6. The Basic Tree | 7. The Milestone Tree | 8. PT: Dimensions<br>"
                    txt += "9. Particle Increment Tree | 10. The Pro Tree | 11. The Dice Tree | 12. PT: Rewritten NG+<br>"
                    txt += "13. The Galaxy Tree | 14. Synergism | 15. The Circuit Tree<br><br>"
                    txt += "<i>Beyond all fifteen: <b>Finality (F)</b> — if you can reach 25 Omniverse Energy...</i>"
                    return txt
                }]
            ]
        }
    },
    hotkeys: [{ key: "o", description: "O: Reset for Omniverse Energy", onPress() { if (canReset(this.layer)) doReset(this.layer) } }],
    doReset(resettingLayer) {
        // Omniverse is top layer
    },
})
