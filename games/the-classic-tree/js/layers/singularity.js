// ============================================================================
//  THE CLASSIC+ TREE v0.7 - SINGULARITY (Developer Preview)
//  New Row 6: Singularity (S) — merges Universe (U) + Reality (R) branches
//  Singularities collapse all multiverse timelines into a single point.
//  New mechanics: Singularity Fields, Rift Challenges, Collapse Grid
// ============================================================================

addLayer("s2", {
    name: "singularity",
    symbol: "S",
    position: 0,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            field: new Decimal(0),       // Singularity Field — generated passively
            collapses: 0,                // Collapse count for grid
            auto: false,
            // grid is managed by TMT's grid system — do NOT predefine it here
        }
    },
    color: "#FF00FF",
    requires: new Decimal(10),
    resource: "singularities",
    baseResource: "eternity points",
    baseAmount() { return player.e.points },
    type: "static",
    base: 5,
    exponent: 1.8,
    row: 6,
    branches: [["u", "#AA00FF"], ["r", "#00ccff"]],
    layerShown() {
        return (player.u && player.u.unlocked && player.u.points.gte(10)) ||
               (player.r && player.r.unlocked && player.r.points.gte(10)) ||
               (player.s2 && player.s2.unlocked)
    },
    gainMult() {
        if (!player.s2) return new Decimal(1)
        let mult = new Decimal(1)
        if (hasUpgrade('s2', 11)) mult = mult.times(upgradeEffect('s2', 11))
        if (hasUpgrade('s2', 13)) mult = mult.times(2)
        if (player.s2.collapses >= 3) mult = mult.times(1.5)
        return mult
    },
    gainExp() {
        if (!player.s2) return new Decimal(1)
        let exp = new Decimal(1)
        if (hasUpgrade('s2', 21)) exp = exp.times(1.1)
        return exp
    },
    effect() {
        if (!player.s2 || !player.s2.unlocked) return new Decimal(1)
        let eff = Decimal.pow(1e10, player.s2.points)
        if (hasUpgrade('s2', 12)) eff = eff.pow(1.5)
        if (hasUpgrade('s2', 22)) eff = eff.times(buyableEffect('s2', 11))
        // Softcap at 1e500
        if (eff.gte("1e500")) eff = eff.div("1e500").pow(0.2).times("1e500")
        return eff
    },
    effectDescription() {
        if (!player.s2 || !player.s2.unlocked) return ""
        return "which collapse all timelines — boosting EVERYTHING by " + format(tmp.s2.effect) + "x"
    },
    prestigeButtonText() {
        if (!player.s2) return ""
        let gain = (tmp.s2 && tmp.s2.resetGain instanceof Decimal) ? tmp.s2.resetGain : getResetGain(this.layer)
        let at = (tmp.s2 && tmp.s2.nextAt instanceof Decimal) ? tmp.s2.nextAt : getNextAt(this.layer)
        if (gain.gte(1))
            return "Collapse the multiverse for <b>" + formatWhole(gain) + "</b> singularities<br>Next at " + formatWhole(at) + " eternity points"
        return "Need " + formatWhole(at) + " eternity (" + formatWhole(player.e.points) + "/" + formatWhole(at) + ")"
    },
    hotkeys: [{ key: "s", description: "S: Reset for singularities", onPress() { if (canReset(this.layer)) doReset(this.layer) } }],
    infoboxes: {
        lore: {
            title: "The Singularity",
            body: "Beyond both Universe and Reality lies the Singularity — the point where all timelines collapse into one. " +
                  "Singularities are the ultimate currency, earned by merging everything you've built across all branches. " +
                  "The Collapse Grid rewards strategic play: compressing tiles amplifies your power exponentially.<br><br>" +
                  "v0.7 Developer Preview — This layer is experimental. Balance may change!",
            unlocked() { return true },
        },
    },
    bars: {
        singularityBar: {
            direction: RIGHT, width: 500, height: 30,
            progress() { return player.s2.points.div(20).toNumber() },
            display() { return formatWhole(player.s2.points) + " / 20 Singularities — ULTIMATE VICTORY" },
            fillStyle: { 'background-color': "#FF00FF", 'background-image': "linear-gradient(90deg, #FF00FF, #8800FF, #00FFFF)" },
            baseStyle: { 'background-color': "#220022" },
            textStyle: { 'color': "#fff", 'text-shadow': "1px 1px 3px black" },
        },
        fieldBar: {
            direction: RIGHT, width: 300, height: 18,
            progress() { return player.s2.field.div(player.s2.field.add(100)).toNumber() },
            display() { return "Singularity Field: " + format(player.s2.field) },
            fillStyle: { 'background-color': "#cc44ff" },
            unlocked() { return hasUpgrade('s2', 14) },
        },
        gridBar: {
            direction: RIGHT, width: 250, height: 18,
            progress() {
                let count = 0; if (player.s2.grid) for (let k in player.s2.grid) if (player.s2.grid[k] === 2) count++
                return count / 9
            },
            display() {
                let count = 0; if (player.s2.grid) for (let k in player.s2.grid) if (player.s2.grid[k] === 2) count++
                return "Singulons: " + count + "/9"
            },
            fillStyle: { 'background-color': "#00ffcc" },
            unlocked() { return hasUpgrade('s2', 21) },
        },
    },
    upgrades: {
        // Row 1 — Foundation
        11: {
            title: "Timeline Collapse",
            description: "U and R effects boost Singularity gain.",
            cost: new Decimal(1),
            effect() {
                let u = (tmp.u && tmp.u.effect) ? tmp.u.effect.max(1) : new Decimal(1)
                let r = (tmp.r && tmp.r.effect) ? tmp.r.effect.max(1) : new Decimal(1)
                return u.times(r).pow(0.05)
            },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        12: {
            title: "Dimensional Crunch",
            description: "Singularity effect ^1.5",
            cost: new Decimal(2),
            unlocked() { return hasUpgrade('s2', 11) },
        },
        13: {
            title: "Multiverse Merge",
            description: "Double Singularity gain. Points x1e50.",
            cost: new Decimal(3),
            unlocked() { return hasUpgrade('s2', 12) },
        },
        14: {
            title: "Singularity Field",
            description: "Unlock the Singularity Field — a passive multiplier that grows over time.",
            cost: new Decimal(5),
            unlocked() { return hasUpgrade('s2', 13) },
        },
        // Row 2 — Advanced
        21: {
            title: "Collapse Grid",
            description: "Unlock the Collapse Grid. Singularity gain ^1.1.",
            cost: new Decimal(8),
            unlocked() { return hasUpgrade('s2', 14) },
        },
        22: {
            title: "Singulon Amplifier",
            description: "Singulon Core buyable boosts the Singularity effect.",
            cost: new Decimal(12),
            unlocked() { return hasUpgrade('s2', 21) },
        },
        23: {
            title: "Rift Breaker",
            description: "Unlock Singularity Rift challenges. Keep all U/R upgrades on S reset.",
            cost: new Decimal(15),
            unlocked() { return hasUpgrade('s2', 22) },
        },
        // Row 3 — Mastery
        31: {
            title: "Eternal Singularity",
            description: "Singularity effect boosts Eternity gain massively.",
            cost: new Decimal(25),
            effect() { return tmp.s2 ? tmp.s2.effect.pow(0.01).max(1) : new Decimal(1) },
            effectDisplay() { return format(this.effect()) + "x" },
            unlocked() { return hasUpgrade('s2', 23) },
        },
        32: {
            title: "Grid Mastery",
            description: "All Collapse Grid tiles give 3x bonus. Auto-compress tiles.",
            cost: new Decimal(35),
            unlocked() { return hasUpgrade('s2', 31) },
        },
        33: {
            title: "Absolute Singularity",
            description: "All layer effects ^1.5. Win condition reached!",
            cost: new Decimal(50),
            unlocked() { return hasUpgrade('s2', 32) },
        },
        // Row 4 — Post-game Singularity
        41: {
            title: "Singularity Expansion",
            description: "Expand the Collapse Grid to 4x4. Singulons give double bonus.",
            cost: new Decimal(75),
            unlocked() { return hasUpgrade('s2', 33) },
        },
        42: {
            title: "Field Amplifier",
            description: "Singularity Field grows 5x faster. Field effect is squared.",
            cost: new Decimal(100),
            unlocked() { return hasUpgrade('s2', 41) },
        },
        43: {
            title: "Rift Mastery",
            description: "All Rift challenge rewards are tripled. Unlock Rift Omega+.",
            cost: new Decimal(150),
            unlocked() { return hasUpgrade('s2', 42) },
        },
        44: {
            title: "Infinite Singularity",
            description: "Singularity effect softcap removed. S effect ^3.",
            cost: new Decimal(200),
            unlocked() { return hasUpgrade('s2', 43) },
        },
        // Row 5 — The Deep End (v0.8 Full)
        51: {
            title: "Eternal Collapse",
            description: "Singularity effect ^1.5.",
            cost: new Decimal(300),
            unlocked() { return hasUpgrade('s2', 44) },
        },
        52: {
            title: "Multiverse Overlord",
            description: "Universe and Reality effects x25 each.",
            cost: new Decimal(500),
            unlocked() { return hasUpgrade('s2', 51) },
        },
        53: {
            title: "Singularity Dominion",
            description: "Singularity gain x10 and Collapse Grid effect ^1.5.",
            cost: new Decimal(1000),
            unlocked() { return hasUpgrade('s2', 52) },
        },
    },
    buyables: {
        11: {
            title: "Singulon Core",
            cost(x) { return new Decimal(3).pow(x.pow(1.3)).times(2) },
            effect(x) {
                let eff = Decimal.pow(1e5, x)
                if (hasUpgrade('s2', 32)) eff = eff.pow(3)
                return eff
            },
            display() {
                let d = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(d.cost) + " singularities<br>Amount: " + formatWhole(player.s2.buyables[this.id]) +
                       "<br>Effect: " + format(d.effect) + "x to Singularity effect"
            },
            unlocked() { return hasUpgrade('s2', 22) },
            canAfford() { return player.s2.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let c = tmp[this.layer].buyables[this.id].cost
                player.s2.points = player.s2.points.sub(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: { 'height': '120px' },
        },
        12: {
            title: "Timeline Compressor",
            cost(x) { return new Decimal(10).pow(x.pow(1.4)).times(5) },
            effect(x) {
                let eff = Decimal.pow(100, x)
                return eff
            },
            display() {
                let d = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(d.cost) + " singularities<br>Amount: " + formatWhole(player.s2.buyables[this.id]) +
                       "<br>Effect: " + format(d.effect) + "x to all point gain"
            },
            unlocked() { return hasMilestone('s2', 2) },
            canAfford() { return player.s2.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let c = tmp[this.layer].buyables[this.id].cost
                player.s2.points = player.s2.points.sub(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: { 'height': '120px' },
        },
        13: {
            title: "Singular Horizon",
            cost(x) { return new Decimal(25).pow(x.pow(1.3)).times(10) },
            effect(x) { return Decimal.pow(1e10, x) },
            display() {
                let d = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(d.cost) + " singularities<br>Amount: " + formatWhole(player.s2.buyables[this.id]) +
                       "<br>Effect: " + format(d.effect) + "x to point gain and Omniverse Energy"
            },
            unlocked() { return hasMilestone('s2', 5) },
            canAfford() { return player.s2.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let c = tmp[this.layer].buyables[this.id].cost
                player.s2.points = player.s2.points.sub(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: { 'height': '120px', 'background-color': "#330033" },
        },
    },
    challenges: {
        11: {
            name: "Singularity Rift Alpha",
            challengeDescription: "ALL layer effects are ^0.1. Point gain ^0.15. The ultimate challenge.",
            goalDescription: "Reach 1e80 points inside",
            canComplete() { return player.points.gte("1e80") },
            rewardDescription: "Singularity effect x10, U effect x3",
            rewardEffect() { return new Decimal(10) },
            rewardDisplay() { return format(this.rewardEffect()) + "x" },
            unlocked() { return hasUpgrade('s2', 23) },
        },
        12: {
            name: "Singularity Rift Omega",
            challengeDescription: "ALL effects disabled. Pure base generation only. Points x^0.05.",
            goalDescription: "Reach 1e50 points inside",
            canComplete() { return player.points.gte("1e50") },
            rewardDescription: "R effect x5, Singularity Field grows 3x faster",
            unlocked() { return hasChallenge('s2', 11) },
        },
        21: {
            name: "Collapsed Timeline",
            challengeDescription: "Can't gain Singularities. All previous resets happen every 10 seconds automatically.",
            goalDescription: "Reach 1e120 points",
            canComplete() { return player.points.gte("1e120") },
            rewardDescription: "Keep ALL upgrades across all resets. Ultimate persistence.",
            unlocked() { return hasChallenge('s2', 12) },
        },
        22: {
            name: "Rift Omega+",
            challengeDescription: "ALL effects ^0.001. Point gain ^0.01. The rift beyond the rift.",
            goalDescription: "Reach 1e250 points",
            canComplete() { return player.points.gte("1e250") },
            rewardDescription: "Singularity effect ^1.5, permanently.",
            unlocked() { return hasChallenge('s2', 21) },
        },
    },
    milestones: {
        0: {
            requirementDescription: "1 singularity",
            effectDescription: "Keep U and R milestones. Auto-buy U/R upgrades.",
            done() { return player.s2.best.gte(1) },
        },
        1: {
            requirementDescription: "3 singularities",
            effectDescription: "U and R effects x5. Gain 10% U and R passively.",
            done() { return player.s2.best.gte(3) },
            unlocked() { return hasMilestone('s2', 0) },
        },
        2: {
            requirementDescription: "8 singularities",
            effectDescription: "Unlock Timeline Compressor buyable. Keep S buyables on reset.",
            done() { return player.s2.best.gte(8) },
            unlocked() { return hasMilestone('s2', 1) },
        },
        3: {
            requirementDescription: "15 singularities",
            effectDescription: "Gain 25% singularities passively. All layer effects ^1.2.",
            done() { return player.s2.best.gte(15) },
            unlocked() { return hasMilestone('s2', 2) },
        },
        4: {
            requirementDescription: "20 singularities",
            effectDescription: "ULTIMATE VICTORY! All costs halved. Infinite power.",
            done() { return player.s2.best.gte(20) },
            unlocked() { return hasMilestone('s2', 3) },
        },
        5: {
            requirementDescription: "50 singularities",
            effectDescription: "S effect ^2. Grid auto-fills. Field grows 10x faster.",
            done() { return player.s2.best.gte(50) },
            unlocked() { return hasMilestone('s2', 4) },
        },
        6: {
            requirementDescription: "100 singularities",
            effectDescription: "S effect ^5. ALL layer costs /100. True mastery.",
            done() { return player.s2.best.gte(100) },
            unlocked() { return hasMilestone('s2', 5) },
        },
    },
    clickables: {
        11: {
            title: "Compress Tile",
            display() {
                return "Click to compress a random Collapse Grid tile<br>Cost: 2 Singularities"
            },
            canClick() {
                if (!player.s2.points.gte(2) || !hasUpgrade('s2', 21) || !player.s2.grid) return false
                for (let k in player.s2.grid) { if (player.s2.grid[k] < 2) return true }
                return false
            },
            onClick() {
                player.s2.points = player.s2.points.sub(2)
                for (let k in player.s2.grid) {
                    if (player.s2.grid[k] < 2) { player.s2.grid[k]++; break }
                }
                player.s2.collapses++
            },
            style: { 'height': '90px', 'background-color': '#660066' },
            unlocked() { return hasUpgrade('s2', 21) },
        },
        12: {
            title: "Grid Overload",
            display() { return "Spend 5 Singularities to +1 ALL grid tiles" },
            canClick() {
                if (!player.s2.points.gte(5) || !hasUpgrade('s2', 21) || !player.s2.grid) return false
                for (let k in player.s2.grid) { if (player.s2.grid[k] < 2) return true }
                return false
            },
            onClick() {
                player.s2.points = player.s2.points.sub(5)
                for (let k in player.s2.grid) {
                    if (player.s2.grid[k] < 2) player.s2.grid[k]++
                }
                player.s2.collapses += 3
            },
            style: { 'height': '90px', 'background-color': '#006666' },
            unlocked() { return hasUpgrade('s2', 32) },
        },
    },
    grid: {
        rows: 3, cols: 3, maxRows: 3, maxCols: 3,
        getStartData(id) { return 0 },
        getUnlocked(id) { return hasUpgrade('s2', 21) },
        getCanClick(data, id) { return player.s2.points.gte(1) && data < 2 },
        getStyle(data, id) {
            if (data === 0) return { 'background-color': '#1a001a', 'border': '1px solid #440044' }
            if (data === 1) return { 'background-color': '#6600cc', 'border': '1px solid #aa44ff' }
            return { 'background-color': '#ff00ff', 'border': '1px solid #ffffff', 'box-shadow': '0 0 10px #ff00ff' }
        },
        getTitle(data, id) { return data === 0 ? "Void" : data === 1 ? "Compressed" : "Singulon" },
        getDisplay(data, id) {
            if (data === 0) return "⬛"
            if (data === 1) return "🔮"
            return "✦"
        },
        getTooltip(data, id) {
            if (data === 0) return "Cost: 1 Singularity — Compress this void"
            if (data === 1) return "Cost: 1 Singularity — Upgrade to Singulon"
            return "Fully upgraded! Gives x10 boost per singulon"
        },
        onClick(data, id) {
            if (player.s2.points.gte(1) && data < 2) {
                player.s2.points = player.s2.points.sub(1)
                player.s2.grid[id] = data + 1
                player.s2.collapses++
            }
        },
    },
    getGridEffect() {
        if (!player.s2 || !player.s2.grid) return new Decimal(1)
        let grid = player.s2.grid
        let compressed = 0, singulons = 0
        // TMT grid may be object with numeric keys
        for (let k in grid) { if (grid[k] === 1) compressed++; if (grid[k] === 2) singulons++ }
        let mult = new Decimal(1)
        mult = mult.times(Decimal.pow(2, compressed))
        let perSingulon = hasUpgrade('s2', 32) ? 30 : 10
        if (hasUpgrade('s2', 41)) perSingulon = perSingulon * 2   // Singularity Expansion: Singulons give double bonus
        mult = mult.times(Decimal.pow(perSingulon, singulons))
        if (hasUpgrade('s2', 53)) mult = mult.pow(1.5)            // Singularity Dominion: grid effect ^1.5
        return mult
    },
    passiveGeneration() {
        if (hasMilestone('s2', 3)) return 0.25
        if (hasMilestone('s2', 1)) return 0.1
        return 0
    },
    doReset(resettingLayer) {
        // Singularity is top row — only resets on itself (which shouldn't happen)
        if (layers[resettingLayer].row > this.row) {
            let keep = []
            if (hasMilestone('s2', 0)) keep.push("milestones")
            if (hasMilestone('s2', 2)) keep.push("buyables")
            if (hasChallenge('s2', 21)) keep.push("upgrades")
            // Finality milestone 0: keep all Singularity progress on Finality resets
            if (hasMilestone('f', 0)) keep.push("milestones", "upgrades", "buyables", "points", "best", "total", "field", "collapses")
            layerDataReset(this.layer, keep)
        }
    },
    update(diff) {
        if (!player.s2) return
        // Singularity Field grows over time
        if (player.s2.unlocked && hasUpgrade('s2', 14)) {
            let rate = new Decimal(1)
            if (hasChallenge('s2', 12)) rate = rate.times(3)
            if (hasMilestone('s2', 3)) rate = rate.times(2)
            player.s2.field = player.s2.field.add(rate.times(diff))
        }
        // Auto-compress with Grid Mastery upgrade
        if (hasUpgrade('s2', 32) && player.s2.grid && player.s2.points.gte(1)) {
            let target = -1
            for (let k in player.s2.grid) { if (player.s2.grid[k] < 2) { target = k; break } }
            if (target >= 0 && Math.random() < diff) {
                player.s2.points = player.s2.points.sub(1)
                player.s2.grid[target]++
                player.s2.collapses++
            }
        }
    },
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "resource-display",
                "blank",
                ["infobox", "lore"],
                "blank",
                ["bar", "singularityBar"],
                "blank",
                ["bar", "fieldBar"],
                "blank",
                "milestones",
                "blank",
                "upgrades",
            ]
        },
        "Grid": {
            content: [
                "main-display",
                ["display-text", function() {
                    return "Collapse Grid: Click tiles to compress them. Singulons (✦) give massive bonuses!"
                }],
                "blank",
                "grid",
                "blank",
                ["bar", "gridBar"],
                "blank",
                ["display-text", function() {
                    let eff = layers.s2.getGridEffect()
                    return "Grid Effect: " + format(eff) + "x to all gains"
                }],
                "blank",
                "clickables",
            ],
            unlocked() { return hasUpgrade('s2', 21) },
        },
        "Buyables": {
            content: [
                "main-display",
                "blank",
                "buyables",
                "blank",
                ["display-text", function() {
                    return "Singulon Cores amplify Singularity effect. Timeline Compressors boost everything."
                }],
            ],
            unlocked() { return hasUpgrade('s2', 22) },
        },
        "Rifts": {
            content: [
                "main-display",
                "blank",
                ["display-text", function() {
                    return "<b>Singularity Rifts</b> — extreme challenges that test the limits of your multiverse mastery."
                }],
                "blank",
                "challenges",
            ],
            unlocked() { return hasUpgrade('s2', 23) },
        },
        "Stats": {
            content: [
                "main-display",
                ["display-text", function() {
                    let txt = "<b>Singularity Stats (v0.7 Dev)</b><br><br>"
                    txt += "Singularities: " + formatWhole(player.s2.points) + " (best: " + formatWhole(player.s2.best) + ")<br>"
                    txt += "Singularity Field: " + format(player.s2.field) + "<br>"
                    txt += "Collapses: " + player.s2.collapses + "<br>"
                    let gridIcons = ""
                    if (player.s2.grid) { for (let k in player.s2.grid) gridIcons += player.s2.grid[k] === 0 ? "⬛" : player.s2.grid[k] === 1 ? "🔮" : "✦" }
                    txt += "Grid: " + gridIcons + "<br>"
                    txt += "Grid Effect: " + format(layers.s2.getGridEffect()) + "x<br>"
                    txt += "Singularity Effect: " + format(tmp.s2.effect) + "x<br><br>"
                    txt += "<i>v0.7 Developer Preview — Balance in progress!</i>"
                    return txt
                }],
            ],
        },
    },
})
