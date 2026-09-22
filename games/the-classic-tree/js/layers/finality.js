// ============================================================================
//  THE CLASSIC+ TREE v0.8 FULL - FINALITY (F)
//  Row 8: The layer beyond the Omniverse. Finality is what remains when every
//  timeline, every reality, and every multiverse has been transcended — the
//  absolute endpoint of the tree... and its new beginning.
//  New mechanics: Eternal Spire buyables, Sigils of Power, The Final Trigger,
//                 4 Final Challenges, TRUE ENDING at 8 Finality.
// ============================================================================

addLayer("f", {
    name: "finality",
    symbol: "F",
    position: 0,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            sigils: 0,          // permanent Sigils of Power from Absolute Resets
            burstTimer: 0,      // Final Trigger duration remaining
            auto: false,
        }
    },
    color: "#FFD700",
    requires: new Decimal(25), // 25 Omniverse Energy
    resource: "finality",
    baseResource: "omniverse energy",
    baseAmount() { return player.o ? player.o.points : new Decimal(0) },
    type: "static",
    base: 4,
    exponent: 2.2,
    row: 8,
    branches: [["o", "#FFD700"]],
    layerShown() {
        return (player.o && player.o.unlocked && player.o.points.gte(20)) ||
               (player.f && player.f.unlocked)
    },
    gainMult() {
        if (!player.f) return new Decimal(1)
        let mult = new Decimal(1)
        if (hasUpgrade('f', 11)) mult = mult.times(upgradeEffect('f', 11))
        if (hasUpgrade('f', 13)) mult = mult.times(3)
        if (hasUpgrade('f', 22)) mult = mult.times(buyableEffect('f', 12))
        if (hasUpgrade('f', 41)) mult = mult.times(25)
        if (hasMilestone('f', 3)) mult = mult.times(2)
        if (hasChallenge('f', 11)) mult = mult.times(5)
        if (hasMilestone('o', 7)) mult = mult.times(2)
        if (player.f.sigils > 0) {
            let per = hasUpgrade('f', 24) ? 1.75 : 1.5
            if (hasChallenge('f', 13)) per = per * 2
            mult = mult.times(Decimal.pow(per, player.f.sigils))
        }
        return mult
    },
    gainExp() {
        if (!player.f) return new Decimal(1)
        let exp = new Decimal(1)
        if (hasUpgrade('f', 21)) exp = exp.times(1.1)
        if (hasChallenge('o', 15)) exp = exp.times(1.25)
        return exp
    },
    effect() {
        if (!player.f || !player.f.unlocked) return new Decimal(1)
        let eff = Decimal.pow(1e40, player.f.points)
        if (hasUpgrade('f', 12)) eff = eff.pow(1.4)
        if (hasUpgrade('f', 23)) eff = eff.times(buyableEffect('f', 11))
        if (hasChallenge('f', 12)) eff = eff.times("1e30")
        if (player.f.burstTimer > 0) eff = eff.times(1e10)
        if (hasUpgrade('f', 33)) eff = eff.pow(1.3)
        if (hasChallenge('f', 14)) eff = eff.pow(1.5)
        if (hasMilestone('f', 4)) eff = eff.pow(1.5)
        if (hasMilestone('f', 6)) eff = eff.pow(1.25)
        if (hasMilestone('f', 7)) eff = eff.pow(2)
        // Softcap at 1e6000
        if (eff.gte("1e6000")) eff = eff.div("1e6000").pow(0.3).times("1e6000")
        return eff
    },
    effectDescription() {
        if (!player.f || !player.f.unlocked) return ""
        let burstTxt = player.f.burstTimer > 0 ? " <b style='color:#ffff00'>[FINAL TRIGGER ACTIVE: 1e10x!]</b>" : ""
        return "which collapses the Omniverse itself — boosting ALL point gains by " + format(tmp.f.effect) + "x" + burstTxt
    },
    prestigeButtonText() {
        if (!player.f) return ""
        let gain = (tmp.f && tmp.f.resetGain instanceof Decimal) ? tmp.f.resetGain : getResetGain(this.layer)
        let at = (tmp.f && tmp.f.nextAt instanceof Decimal) ? tmp.f.nextAt : getNextAt(this.layer)
        if (gain.gte(1)) return "Ascend beyond everything for <b>" + formatWhole(gain) + "</b> finality<br>Next at " + formatWhole(at) + " omniverse energy"
        return "Need " + formatWhole(at) + " omniverse energy (" + formatWhole(player.o ? player.o.points : 0) + "/" + formatWhole(at) + ")"
    },
    infoboxes: {
        lore: {
            title: "What Remains",
            body: `
                Every universe visited. Every timeline collapsed. Every reality transcended. At the end of the Omniverse there is only <b>Finality</b> — the quiet point where the tree completes itself.<br><br>
                Finality does not reset the Omniverse. Instead, each ascension weaves everything you have ever built into a single eternal form. Spend it on the <b>Eternal Spire</b>, etch permanent <b>Sigils of Power</b>, and survive the four <b>Final Challenges</b>.<br><br>
                <b>TRUE ENDING:</b> Attain <b>8 Finality</b>. Beyond that lies the Absolute.
            `,
        },
    },
    bars: {
        finalityBar: {
            direction: RIGHT, width: 550, height: 30,
            progress() { return player.f.points.div(25).min(1).toNumber() },
            display() { return formatWhole(player.f.points) + " / 25 Finality — THE ABSOLUTE END" },
            fillStyle: { 'background-color': "#FFD700", 'background-image': "linear-gradient(90deg, #FFD700, #FF8800, #FF00FF)" },
            baseStyle: { 'background-color': "#332200" },
            textStyle: { 'color': "#fff", 'font-weight': "bold", 'text-shadow': "1px 1px 3px black" },
        },
        burstBar: {
            direction: RIGHT, width: 450, height: 22,
            progress() { return (player.f.burstTimer / 30).toNumber ? (player.f.burstTimer / 30) : 0 },
            display() { return player.f.burstTimer > 0 ? "FINAL TRIGGER: " + format(player.f.burstTimer, 1) + "s remaining (1e10x all points)" : "Final Trigger inactive" },
            fillStyle: { 'background-color': "#ffaa00" },
            baseStyle: { 'background-color': "#332200" },
        },
    },
    upgrades: {
        11: {
            title: "First Light",
            description: "Finality boosts its own gain.",
            cost: new Decimal(1),
            effect() { return player.f.points.add(1).pow(0.6) },
            effectDisplay() { return format(this.effect()) + "x" },
        },
        12: {
            title: "Eternal Amplifier",
            description: "Finality effect ^1.4.",
            cost: new Decimal(2),
            unlocked() { return hasUpgrade('f', 11) },
        },
        13: {
            title: "Trinity Engine",
            description: "Finality gain x3.",
            cost: new Decimal(4),
            unlocked() { return hasUpgrade('f', 12) },
        },
        14: {
            title: "Omniverse Nexus",
            description: "Omniverse Field and Singularity Field grow 25x faster.",
            cost: new Decimal(6),
            unlocked() { return hasUpgrade('f', 13) },
        },
        21: {
            title: "Ascended Exponent",
            description: "Finality gain exponent +10%.",
            cost: new Decimal(10),
            unlocked() { return hasUpgrade('f', 14) },
        },
        22: {
            title: "Spire Resonance",
            description: "Unlock the Apotheosis Engine buyable; its effect boosts Finality gain.",
            cost: new Decimal(15),
            unlocked() { return hasUpgrade('f', 21) },
        },
        23: {
            title: "Absolute Core",
            description: "Unlock the Absolute Core buyable; the Eternal Spire boosts the Finality effect.",
            cost: new Decimal(25),
            unlocked() { return hasUpgrade('f', 22) },
        },
        24: {
            title: "Sigil Attunement",
            description: "Sigils of Power are stronger (x1.5 → x1.75 each).",
            cost: new Decimal(40),
            unlocked() { return hasUpgrade('f', 23) },
        },
        31: {
            title: "Eternal Recursion",
            description: "The Eternal Spire's effect is squared.",
            cost: new Decimal(60),
            unlocked() { return hasUpgrade('f', 24) },
        },
        32: {
            title: "Omniscience",
            description: "All Finality buyables are 50% cheaper.",
            cost: new Decimal(100),
            unlocked() { return hasUpgrade('f', 31) },
        },
        33: {
            title: "Ultimate Compression",
            description: "Finality effect ^1.3.",
            cost: new Decimal(200),
            unlocked() { return hasUpgrade('f', 32) },
        },
        41: {
            title: "Beyond Infinity",
            description: "Finality gain x25. Unlock the Chronos Terminal buyable.",
            cost: new Decimal(500),
            unlocked() { return hasUpgrade('f', 33) },
        },
        42: {
            title: "The Final Theorem",
            description: "All Omniverse Cores are 90% cheaper.",
            cost: new Decimal(1000),
            unlocked() { return hasUpgrade('f', 41) },
        },
        43: {
            title: "THE END AND THE BEGINNING",
            description: "Multiply point gain by 1e1000. There is nothing beyond this... probably.",
            cost: new Decimal(2500),
            unlocked() { return hasUpgrade('f', 42) },
        },
    },
    buyables: {
        11: {
            title: "Eternal Spire",
            cost(x) {
                let c = Decimal.pow(2, x).times(3)
                if (hasUpgrade('f', 32)) c = c.div(2)
                return c
            },
            effect(x) {
                let eff = Decimal.pow(1e15, x)
                if (hasUpgrade('f', 31)) eff = eff.pow(2)
                return eff
            },
            display() {
                let d = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(d.cost) + " finality<br>Amount: " + formatWhole(player.f.buyables[this.id]) +
                    "<br>Effect: " + format(d.effect) + "x to point gain" + (hasUpgrade('f', 23) ? " and Finality effect" : "")
            },
            unlocked() { return hasMilestone('f', 1) },
            canAfford() { return player.f.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let c = tmp[this.layer].buyables[this.id].cost
                player.f.points = player.f.points.sub(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: { 'height': '130px', 'background-color': "#664400" },
        },
        12: {
            title: "Apotheosis Engine",
            cost(x) {
                let c = Decimal.pow(3, x).times(5)
                if (hasUpgrade('f', 32)) c = c.div(2)
                return c
            },
            effect(x) { return Decimal.pow(2, x) },
            display() {
                let d = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(d.cost) + " finality<br>Amount: " + formatWhole(player.f.buyables[this.id]) +
                    "<br>Effect: " + format(d.effect) + "x to Finality gain"
            },
            unlocked() { return hasUpgrade('f', 22) },
            canAfford() { return player.f.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let c = tmp[this.layer].buyables[this.id].cost
                player.f.points = player.f.points.sub(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: { 'height': '130px', 'background-color': "#553300" },
        },
        13: {
            title: "Chronos Terminal",
            cost(x) {
                let c = Decimal.pow(5, x).times(10)
                if (hasUpgrade('f', 32)) c = c.div(2)
                return c
            },
            effect(x) { return Decimal.pow(1.5, x) },
            display() {
                let d = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(d.cost) + " finality<br>Amount: " + formatWhole(player.f.buyables[this.id]) +
                    "<br>Effect: " + format(d.effect) + "x to all Field & passive generation"
            },
            unlocked() { return hasUpgrade('f', 41) },
            canAfford() { return player.f.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let c = tmp[this.layer].buyables[this.id].cost
                player.f.points = player.f.points.sub(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: { 'height': '130px', 'background-color': "#444411" },
        },
        14: {
            title: "Absolute Core",
            cost(x) {
                let c = Decimal.pow(10, x).times(25)
                if (hasUpgrade('f', 32)) c = c.div(2)
                return c
            },
            effect(x) { return new Decimal(1).add(x.times(0.02)) },
            display() {
                let d = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(d.cost) + " finality<br>Amount: " + formatWhole(player.f.buyables[this.id]) +
                    "<br>Effect: point gain ^" + format(d.effect)
            },
            unlocked() { return hasUpgrade('f', 23) },
            canAfford() { return player.f.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                let c = tmp[this.layer].buyables[this.id].cost
                player.f.points = player.f.points.sub(c)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: { 'height': '130px', 'background-color': "#552244" },
        },
    },
    clickables: {
        11: {
            title: "The Final Trigger",
            display() {
                return player.f.burstTimer > 0 ?
                    "<b>TRIGGER ACTIVE</b><br>" + format(player.f.burstTimer, 1) + "s remaining<br>(1e10x all points)" :
                    "Activate <b>The Final Trigger</b><br>Cost: 5 F<br>Duration: 30s (1e10x all points)"
            },
            canClick() { return player.f.points.gte(5) && (player.f.burstTimer || 0) <= 0 },
            onClick() {
                if (player.f.points.gte(5)) {
                    player.f.points = player.f.points.sub(5)
                    player.f.burstTimer = 30
                    doPopup("none", "THE FINAL TRIGGER! 1e10x all points for 30s!", "Finality", 3, "#FFD700")
                }
            },
            style: { 'height': '100px', 'width': '220px', 'background-color': "#664400" },
            unlocked() { return player.f.unlocked },
        },
        12: {
            title: "Absolute Reset",
            display() {
                let per = hasUpgrade('f', 24) ? 1.75 : 1.5
                if (hasChallenge('f', 13)) per = per * 2
                return "Etch a permanent <b>Sigil of Power</b>.<br>Cost: 10 F<br>Each Sigil: Finality gain x" + format(per) + " (permanent, never resets)<br>Sigils: " + player.f.sigils
            },
            canClick() { return player.f.points.gte(10) },
            onClick() {
                if (player.f.points.gte(10)) {
                    player.f.points = player.f.points.sub(10)
                    player.f.sigils++
                    doPopup("none", "Sigil of Power etched! (" + player.f.sigils + " total)", "Finality", 3, "#FFD700")
                }
            },
            style: { 'height': '100px', 'width': '220px', 'background-color': "#442266" },
            unlocked() { return hasMilestone('f', 2) },
        },
    },
    challenges: {
        11: {
            name: "Final Void",
            challengeDescription: "All layer effects are powered to ^0.05. Point gain ^0.1. The void stares back.",
            goalDescription: "Reach 1e400 points",
            canComplete() { return player.points.gte("1e400") },
            rewardDescription: "Finality gain x5.",
            unlocked() { return hasMilestone('f', 3) },
        },
        12: {
            name: "Eternal Recursion",
            challengeDescription: "Universe, Reality, Singularity AND Omniverse effects are completely disabled. Point gain ^0.05.",
            goalDescription: "Reach 1e500 points",
            canComplete() { return player.points.gte("1e500") },
            rewardDescription: "Finality effect x1e30.",
            unlocked() { return hasChallenge('f', 11) },
        },
        13: {
            name: "Sigil Storm",
            challengeDescription: "All buyables and clickables are disabled. Point gain ^0.1.",
            goalDescription: "Reach 1e600 points",
            canComplete() { return player.points.gte("1e600") },
            rewardDescription: "Sigils of Power are twice as strong.",
            unlocked() { return hasChallenge('f', 12) },
        },
        14: {
            name: "THE FINAL CHALLENGE",
            challengeDescription: "Final Void + Eternal Recursion + Sigil Storm, all at once. Point gain ^0.02. This is the end.",
            goalDescription: "Reach 1e800 points",
            canComplete() { return player.points.gte("1e800") },
            rewardDescription: "Finality effect ^1.5. Truly the end.",
            unlocked() { return hasChallenge('f', 13) },
        },
    },
    milestones: {
        0: {
            requirementDescription: "1 finality",
            effectDescription: "Keep ALL Omniverse, Singularity, and Reality progress on Finality resets. Point gain x1e10.",
            done() { return player.f.best.gte(1) },
        },
        1: {
            requirementDescription: "2 finality",
            effectDescription: "Unlock the Eternal Spire buyables.",
            done() { return player.f.best.gte(2) },
            unlocked() { return hasMilestone('f', 0) },
        },
        2: {
            requirementDescription: "3 finality",
            effectDescription: "Gain 100% of Omniverse Energy passively. Unlock the Absolute Reset clickable.",
            done() { return player.f.best.gte(3) },
            unlocked() { return hasMilestone('f', 1) },
        },
        3: {
            requirementDescription: "5 finality",
            effectDescription: "Finality gain x2. Unlock the Final Challenges.",
            done() { return player.f.best.gte(5) },
            unlocked() { return hasMilestone('f', 2) },
        },
        4: {
            requirementDescription: "8 finality",
            effectDescription: "TRUE ENDING! Finality effect ^1.5.",
            done() { return player.f.best.gte(8) },
            unlocked() { return hasMilestone('f', 3) },
        },
        5: {
            requirementDescription: "10 finality",
            effectDescription: "Auto-buy Omniverse & Singularity buyables. All active universe bonuses +1.",
            done() { return player.f.best.gte(10) },
            unlocked() { return hasMilestone('f', 4) },
        },
        6: {
            requirementDescription: "15 finality",
            effectDescription: "Finality effect ^1.25 and all layer effects ^1.1.",
            done() { return player.f.best.gte(15) },
            unlocked() { return hasMilestone('f', 5) },
        },
        7: {
            requirementDescription: "25 finality",
            effectDescription: "ABSOLUTE FINALITY: Finality effect ^2 and all point gain ^1.05.",
            done() { return player.f.best.gte(25) },
            unlocked() { return hasMilestone('f', 6) },
        },
    },
    update(diff) {
        if (!player.f) return

        // Final Trigger timer
        if (player.f.burstTimer > 0) {
            player.f.burstTimer = Math.max(0, player.f.burstTimer - diff)
        }

        // Milestone 2: passive Omniverse Energy
        if (hasMilestone('f', 2) && player.o && player.o.unlocked) {
            let oGain = tmp.o && tmp.o.resetGain instanceof Decimal ? tmp.o.resetGain : new Decimal(0)
            if (oGain.gte(1)) {
                player.o.points = player.o.points.add(oGain.times(diff))
                if (player.o.points.gt(player.o.best)) player.o.best = player.o.points
            }
        }

        // Milestone 5: auto-buy Omniverse & Singularity buyables
        if (hasMilestone('f', 5)) {
            try {
                if (player.o && player.o.unlocked) {
                    for (const id of [11, 12, 13, 14]) {
                        if (tmp.o && tmp.o.buyables && tmp.o.buyables[id] && tmp.o.buyables[id].unlocked && tmp.o.buyables[id].canBuy &&
                            layers.o.buyables[id].buy) layers.o.buyables[id].buy()
                    }
                }
                if (player.s2 && player.s2.unlocked) {
                    for (const id of [11, 12, 13]) {
                        if (tmp.s2 && tmp.s2.buyables && tmp.s2.buyables[id] && tmp.s2.buyables[id].unlocked && tmp.s2.buyables[id].canBuy &&
                            layers.s2.buyables[id].buy) layers.s2.buyables[id].buy()
                    }
                }
            } catch (e) { /* never break the game loop */ }
        }
    },
    tabFormat: {
        "Finality": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "resource-display",
                "blank",
                ["infobox", "lore"],
                "blank",
                ["bar", "finalityBar"],
                "blank",
                ["bar", "burstBar"],
                "blank",
                ["row", [["clickable", 11], ["clickable", 12]]],
                "blank",
                "milestones",
            ],
        },
        "Eternal Spire": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "buyables",
                "blank",
                ["display-text", function() { return "The Eternal Spire grows with every finality you spend. Its topmost stones are still being written." }],
            ],
            unlocked() { return hasMilestone('f', 1) },
        },
        "Final Challenges": {
            content: [
                "main-display",
                "blank",
                ["display-text", function() { return "<b>The Final Challenges.</b> Four trials at the end of everything. Complete all four for the absolute reward." }],
                "blank",
                "challenges",
            ],
            unlocked() { return hasMilestone('f', 3) },
        },
        "Beyond": {
            content: [
                ["display-text", function() {
                    let txt = "<h3>Finality Records</h3><br>"
                    txt += "Finality: " + formatWhole(player.f.points) + " (best: " + formatWhole(player.f.best) + ", total: " + formatWhole(player.f.total) + ")<br>"
                    txt += "Finality Effect: " + format(tmp.f.effect) + "x<br>"
                    txt += "Sigils of Power: " + player.f.sigils + " (x" + format(Decimal.pow(hasUpgrade('f', 24) ? 1.75 : 1.5, player.f.sigils)) + " Finality gain)<br>"
                    txt += "Eternal Spire: " + formatWhole(getBuyableAmount('f', 11)) + "<br>"
                    txt += "Apotheosis Engine: " + formatWhole(getBuyableAmount('f', 12)) + "<br><br>"
                    txt += "<b>The 15 Multiverse Realms:</b><br>"
                    txt += "1. Classic 1.0 | 2. PT: Rewritten | 3. TMT Demo | 4. Incrementreeverse | 5. The Basic Tree<br>"
                    txt += "6. The Milestone Tree | 7. PT: Dimensions | 8. Particle Increment Tree | 9. The Pro Tree<br>"
                    txt += "10. The Dice Tree | 11. PT: Rewritten NG+ | 12. Classic+ Hub | 13. The Galaxy Tree<br>"
                    txt += "14. Synergism | 15. The Circuit Tree<br><br>"
                    txt += "<i>And when all fifteen realms are one... Finality remains.</i>"
                    return txt
                }],
            ],
        },
    },
    hotkeys: [{ key: "f", description: "F: Reset for finality", onPress() { if (canReset(this.layer)) doReset(this.layer) } }],
    doReset(resettingLayer) {
        // Finality is the top layer — nothing resets it
    },
})
