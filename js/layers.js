addLayer("mem", {
    name: "memory", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#c939db",
    requires: new Decimal(15), // Can be a function that takes requirement increases into account
    resource: "Memories", // Name of prestige currency
    baseResource: "Fragments", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.45, // Prestige currency exponent
    softcap() {
        let sc = new Decimal("1e10");
        if (hasMilestone('dark', 1)) sc = sc.times(tmp.dark.effect)
        if (hasUpgrade('dark', 21)) sc = sc.times(50)
        if (hasUpgrade('dark', 32)) sc = sc.times(upgradeEffect('dark', 32));
        if (hasAchievement('a', 24)) sc = sc.times(player.points.plus(1).log10().plus(1));
        if (hasMilestone('lethe', 1)) sc = sc.times(upgradeEffect('mem', 34));
        if (hasUpgrade('kou', 11)) sc = sc.times(buyableEffect('kou', 11));
        if (hasUpgrade('lethe', 22)) sc = sc.times(upgradeEffect('lethe', 22));
        if (challengeCompletions('saya', 22) /*&& !layers['saya'].deactivated()*/) sc = sc.times(challengeEffect('saya', 22));
        return sc;
    },
    softcapPower() {
        let scp = 0.25
        if (hasUpgrade('light', 21)) scp = 0.33
        if (hasUpgrade('light', 32)) scp = 0.40
        if (hasMilestone('light', 1)) scp = scp + 0.02
        if (hasUpgrade('lethe', 33)) scp = scp + 0.08
        return scp
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('mem', 12)) mult = mult.times(upgradeEffect('mem', 12))
        if (player.dark.unlocked) mult = mult.times(tmp.dark.effect);
        if (hasUpgrade('light', 11) && !canReset('light')) mult = mult.times(3)
        if (hasUpgrade('light', 12)) mult = mult.times(upgradeEffect('light', 12));
        if (hasUpgrade('mem', 31)) mult = mult.times(upgradeEffect('mem', 31));
        if (player.lethe.unlocked) mult = mult.times(tmp.lethe.effect);
        if (player.kou.buyables[11].unlocked) mult = mult.times(buyableEffect('kou',11));
        if (hasUpgrade('lethe', 44)) mult = mult.times(upgradeEffect('lethe', 44));
        if (hasUpgrade('lethe', 32) || hasUpgrade('lethe', 43)) mult = mult.times(tmp.lethe.effect);
        if (hasUpgrade('lethe', 23)) mult = mult.times(upgradeEffect('lethe', 23));
        if (hasUpgrade('lethe', 34)) mult = mult.times(upgradeEffect('lethe', 34));
        if (hasMilestone('lab', 2)) mult = mult.times(player.lab.power.div(10).max(1));
        if (hasUpgrade('storylayer', 12)) mult = mult.times(tmp["zero"].challenges[11].effecttoFragMem);

        if (inChallenge('zero', 11)) mult = mult.pow(0.5);
        if (player.world.restrictChallenge && !hasUpgrade('storylayer', 14)) mult = mult.pow(0.9);

        
        if (inChallenge('saya', 22) || tmp['saya'].grid.ChallengeDepth[4]>-1) mult = mult.tetrate(layers.saya.challenges[22].debuff())

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        if (hasUpgrade('mem', 13)) exp = exp.times(upgradeEffect('mem', 13));
        if (hasUpgrade('lab', 74)) exp = exp.plus(buyableEffect('lab', 13).eff1());
        return exp
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Reset for memories", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    passiveGeneration() {
        let pg = 0;
        if (hasMilestone('light', 3)) pg = pg + 0.1;
        if (hasMilestone('dark', 3)) pg = pg + 0.1;
        if (hasAchievement('a', 35)) pg = pg + 0.3;
        if (inChallenge('world', 11)) pg = -0.005;
        return pg;
    },
    update(diff) {
        if (player.points.lt(1)) player.points = new Decimal(1);
        if (player.mem.points.lt(1)) player.mem.points = new Decimal(1);
    },
    tabFormat:
    ["main-display",
        "prestige-button",
        "resource-display",
        ["display-text",
            function () { if (player.lab.unlocked) return "Currently, Memory softcap is:" + format(tmp["mem"].softcap) },
            {}],
        "blank",
        "upgrades",
    ],
    doReset(resettingLayer) {
        let keep = [];
        if (layers[resettingLayer].row > this.row) {
            layerDataReset("mem", keep);
            if (hasAchievement("a", 14)) player[this.layer].upgrades = player[this.layer].upgrades.concat([24]);
            if (hasAchievement("a", 24)) player[this.layer].upgrades = player[this.layer].upgrades.concat([41]);
            if (hasAchievement("a", 45)) player[this.layer].upgrades = player[this.layer].upgrades.concat([42]);
            if (hasMilestone('light', 0)) player[this.layer].upgrades = player[this.layer].upgrades.concat([11, 12, 13, 14]);
            if (hasMilestone('dark', 0)) player[this.layer].upgrades = player[this.layer].upgrades.concat([21, 22, 23]);
            if (hasMilestone('light', 2)) player[this.layer].upgrades = player[this.layer].upgrades.concat([31, 32]);
            if (hasMilestone('dark', 2)) player[this.layer].upgrades = player[this.layer].upgrades.concat([33, 34]);
            if (hasAchievement("a", 13) && (resettingLayer != 'mem')) player[this.layer].points = new Decimal(5);
            if (hasAchievement("a", 41) && (resettingLayer != 'mem')) player[this.layer].points = new Decimal(100);
        }
    },
    upgrades: {
        11: {
            title: "Beginning of the Creation",
            description: "Speed up collecting fragments.",
            cost() { return new Decimal(1) },
            effect() {
                let eff = new Decimal(1.5);
                if (hasUpgrade('mem', 21)) eff = eff.pow(upgradeEffect('mem', 21));
                return eff;
            },
            effectDisplay() {
                if (hasUpgrade('lab', 174)) return "<br>Currently: " + format(upgradeEffect('mem', 11)) + "x"
            },
        },
        12: {
            title: "Memory Extraction",
            description: "Memory gain is boosted by Memories.",
            cost() { return new Decimal(3) },
            unlocked() { return hasUpgrade("mem", 11) || hasMilestone("light", 0) },
            effect() {
                let eff = player[this.layer].points.plus(1).pow(0.25);
                if (hasUpgrade('mem', 33)) eff = eff.pow(1.25);
                return eff;
            },
            effectDisplay() {
                if (hasUpgrade('lab', 174)) return "<br>Currently: " + format(upgradeEffect('mem', 12)) + "x"
            },
        },
        13: {
            title: "Algorithm Managing",
            description: "Lower further Memory's Fragment requirement.",
            cost() { return new Decimal(10) },
            unlocked() { return hasUpgrade("mem", 12) || hasMilestone("light", 0) },
            effect() {
                let eff = new Decimal(1.25);
                if (hasUpgrade('mem', 23)) eff = eff.pow(upgradeEffect('mem', 23));
                return eff;
            },
            effectDisplay() {
                if (hasUpgrade('lab', 174)) return "<br>Currently: " + format(upgradeEffect('mem', 13)) + "x"
            },
        },
        14: {
            title: "Fragment Duplication",
            description: "Fragment generation is boosted by Fragments.",
            cost() { return new Decimal(20) },
            unlocked() { return hasUpgrade("mem", 13) || hasMilestone("light", 0) },
            effect() {
                return player.points.plus(1).log10().pow(0.75).plus(1).max(1);
            },
            effectDisplay() {
                if (hasUpgrade('lab', 174)) return "<br>Currently: " + format(upgradeEffect('mem', 14)) + "x"
            },
        },
        21: {
            title: "Thought Combination",
            description: "Beginning of the Creation is much faster.",
            cost() { return new Decimal(30) },
            unlocked() { return hasUpgrade("mem", 14) || hasMilestone("dark", 0) },
            effect() {
                let eff = new Decimal(2);
                if (hasUpgrade('mem', 32)) eff = eff.pow(upgradeEffect('mem', 32));
                return eff
            },
            effectDisplay() {
                if (hasUpgrade('lab', 174)) return "<br>Currently: " + format(upgradeEffect('mem', 21)) + "x"
            },
        },
        22: {
            title: "Fragment Prediction",
            description: "Fragment generation is boosted by Memories.",
            cost() { return new Decimal(50) },
            unlocked() { return hasUpgrade("mem", 21) || hasMilestone("dark", 0) },
            effect() {
                return player[this.layer].points.plus(1).pow(0.5).max(1)
            },
            effectDisplay() {
                if (hasUpgrade('lab', 174)) return "<br>Currently: " + format(upgradeEffect('mem', 22)) + "x"
            },
        },
        23: {
            title: "Time Boosting",
            description: "Algorithm Managing is effected by Fragments.",
            cost() { return new Decimal(100) },
            unlocked() { return hasUpgrade("mem", 22) || hasMilestone("dark", 0) },
            effect() {
                return player.points.plus(1).times(1.5).log10().max(1).log(2).pow(0.01).plus(1).max(1);
            },
            effectDisplay() {
                if (hasUpgrade('lab', 174)) return "<br>Currently: " + format(upgradeEffect('mem', 23)) + "x"
            },
        },
        24: {
            title: "A New Story",
            description: "Unlock two new layers.",
            cost() { return new Decimal(1000) },
            unlocked() { return hasUpgrade("mem", 23) || hasAchievement("a", 14)},
        },
        31: {
            title: "Directly Drown",
            description: "Memories gain is boosted by Fragments.",
            cost() { return new Decimal(1e11) },
            unlocked() { return (hasUpgrade("mem", 23) && hasAchievement("a", 15)) || hasMilestone("light", 2) },
            effect() {
                return player.points.plus(1).pow(0.05).plus(1).log10().plus(2).log(5).plus(1).max(1);
            },
            effectDisplay() {
                if (hasUpgrade('lab', 174)) return "<br>Currently: " + format(upgradeEffect('mem', 31)) + "x"
            },
        },
        32: {
            title: "Thought Growth",
            description: "Thought Combination is boosted by Memories.",
            cost() { return new Decimal(1e12) },
            unlocked() { return hasUpgrade("mem", 31) || hasMilestone("light", 2) },
            effect() {
                return player[this.layer].points.plus(1).log10().pow(0.5).log(2).max(1);
            },
            effectDisplay() {
                if (hasUpgrade('lab', 174)) return "<br>Currently: " + format(upgradeEffect('mem', 32)) + "x"
            },
        },
        33: {
            title: "Memory Inflation",
            description: "Memory Extraction is much faster.",
            cost() { return new Decimal(5e12) },
            unlocked() { return hasUpgrade("mem", 32) || hasMilestone("dark", 2) },
        },
        34: {
            title: "The Thread of Two Sides",
            description() {
                return "Light Talcyons and Dark Matters boost each other's gain slightly based on their " + (hasMilestone('kou', 1) ? "sum." : "average.")
            },
            cost() { return new Decimal(1e13) },
            unlocked() { return hasUpgrade("mem", 33) || hasMilestone("dark", 2) },
            effect() {
                let eff = player.light.points.plus(player.dark.points).plus(2)
                if (!hasMilestone("kou", 1)) eff = eff.div(2)
                if (hasUpgrade('light', 33)) eff = eff.sqrt().max(1)
                else eff = eff.log10().max(1)
                if (hasUpgrade('light', 23)) eff = eff.times(upgradeEffect('light', 23))
                if (hasUpgrade('dark', 23)) eff = eff.times(upgradeEffect('dark', 23))
                return eff
            },
            effectDisplay() {
                if (hasUpgrade('lab', 174)) return "<br>Currently: " + format(upgradeEffect('mem', 34)) + "x"
            },
        },
        41: {
            title: "Eternal Core",
            fullDisplay() {
                let str = "<b>Eternal Core</b><br>"
                if (hasAchievement('a', 24)) str = str + "A core built of masses of Memories, with a few Lightness and bits of Darkness. It contains nearly endless energy."
                else {
                    str = str + "Build up a core which symbolizes your current progress and unlock two layers."
                    str = str + "<br>Cost: 1e23 Memories<br>Req:62 Light Tachyons<br>62 Dark Matters";
                }
                return str
            },
            cost() { return new Decimal(1e23) },
            canAfford() { return player[this.layer].points.gte(1e23) && player.dark.points.gte(62) && player.light.points.gte(62) },
            unlocked() { return hasUpgrade("light", 34) && hasUpgrade("dark", 34) || hasAchievement('a', 24) },
            style() { return { 'height': '200px', 'width': '200px' } },
            onPurchase() { doReset('kou', true); showTab('none'); player[this.layer].upgrades = [41]; },
        },
        42: {
            title: "Set Up The Lab.",
            fullDisplay() {
                if (hasAchievement('a', 45)) return "<b>The Lab</b></br>The Lab has been set up. Now go for more professional researches."
                return "<b>Set Up The Lab.</b></br>With the experiences and the resources you have, you are now going to set up a lab to research all these things.</br></br>Cost: 1e203 Fragments</br>92 Red Dolls</br>1e145 Forgotten Drops"
            },
            canAfford() { return player.points.gte(1e201) && player.kou.points.gte(92) && player.lethe.points.gte(1e145) },
            pay() {
                player.points = player.points.sub(1e201);
                player.kou.points = player.kou.points.sub(92);
                player.lethe.points = player.lethe.points.sub(1e145);
            },
            unlocked() { return player.lethe.upgrades.length >= 25 && hasUpgrade('kou', 25) },
            style() { return { 'height': '200px', 'width': '200px' } },
            onPurchase() { showTab('none'); player.lab.unlocked = true; player.lab.points = new Decimal(1); player[this.layer].upgrades.concat([42]);},
        },
    },
})

addLayer("ab", {
    startData() { return { unlocked: true } },
    color: "yellow",
    symbol: "AB",
    row: "side",
    layerShown() { return hasAchievement('a', 24) },
    tooltip: "Autobuyers",
    clickables: {
        //rows: 6,
        cols: 4,
        11: {
            title: "Light Tachyons",
            display() {
                if (hasUpgrade('lab', 164)) {
                    //if (player['awaken'].current == 'light') return "Force off";
                    //else if (player['awaken'].current != 'dark') return "Force on";
                    return "Force On";
                }
                return hasAchievement('a', 34) ? (player.light.auto ? "On" : "Off") : "Locked"
            },
            unlocked() { return tmp["light"].layerShown && hasAchievement('a', 34) },
            canClick() { return (hasAchievement('a', 34) && !hasUpgrade('lab', 164)) /*|| (player['awaken'].current == 'dark' && player['awaken'].awakened.includes('light'))*/ },
            onClick() { player.light.auto = !player.light.auto },
            style: { "background-color"() { return player.light.auto ? "#ededed" : "#666666" } },
        },
        12: {
            title: "Dark Matters",
            display() {
                if (hasUpgrade('lab', 164)) {
                    //if (player['awaken'].current == 'dark') return "Force off";
                    //else if (player['awaken'].current != 'light') return "Force on";
                    return "Force On";
                }
                return hasAchievement('a', 34) ? (player.dark.auto ? "On" : "Off") : "Locked"
            },
            unlocked() { return tmp["dark"].layerShown && hasAchievement('a', 34) },
            canClick() { return (hasAchievement('a', 34) && !hasUpgrade('lab', 164)) /*|| (player['awaken'].current == 'light' && player['awaken'].awakened.includes('dark'))*/ },
            onClick() { player.dark.auto = !player.dark.auto },
            style: { "background-color"() { return player.dark.auto ? "#383838" : "#666666" } },
        },
        13: {
            title: "Red Dolls",
            display() {
                if (hasUpgrade('lab', 164)) {
                    //if (player['awaken'].current == 'kou') return "Force off";
                    //else if (player['awaken'].current != 'lethe') return "Force on";
                    return "Force On";
                }
                return (hasUpgrade('lab', 71)) ? (player.kou.auto ? "On" : "Off") : "Locked"
            },
            unlocked() { return tmp["kou"].layerShown && hasUpgrade('lab', 63) && hasUpgrade('lab', 64) },
            canClick() { return hasUpgrade('lab', 71) && !hasUpgrade('lab', 164) },
            onClick() { player.kou.auto = !player.kou.auto },
            style: { "background-color"() { return player.kou.auto ? "#ffa0be" : "#666666" } },
        },
        14: {
            title: "Research Generator & Tech Transformer",
            display() {
                return (hasUpgrade('lab', 122)) ? (player.lab.generatorauto ? "On" : "Off") : "Locked"
            },
            unlocked() { return hasChallenge('world', 11) },
            canClick() { return hasUpgrade('lab', 122) },
            onClick() { player.lab.generatorauto = !player.lab.generatorauto },
            style: { "background-color"() { return player.lab.generatorauto ? "#00bdf9" : "#666666" } },
        },
        21: {
            title: "Luminous Churches",
            display() {
                return (hasMilestone('etoluna', 3)) ? (player.zero.auto ? "On" : "Off") : "Locked"
            },
            unlocked() { return tmp["zero"].layerShown && player.etoluna.unlocked },
            canClick() { return hasMilestone('etoluna', 3) },
            onClick() { player.zero.auto = !player.zero.auto },
            style: { "background-color"() { return player.zero.auto ? "#ffe6f6" : "#666666" } },
        },
        22: {
            title: "Flourish Labyrinths",
            display() {
                return (hasMilestone('saya', 3)) ? (player.axium.auto ? "On" : "Off") : "Locked"
            },
            unlocked() { return tmp["axium"].layerShown && player.saya.unlocked },
            canClick() { return hasMilestone('saya', 3) },
            onClick() { player.axium.auto = !player.axium.auto },
            style: { "background-color"() { return player.axium.auto ? "#716f5e" : "#666666" } },
        },
        23: {
            title: "Everflashing Knives",
            display() {
                return (hasMilestone('lib', 4)) ? (player.saya.auto ? "On" : "Off") : "Locked"
            },
            unlocked() { return tmp["saya"].layerShown && player.lib.unlocked },
            canClick() { return hasMilestone('lib', 4) },
            onClick() { player.saya.auto = !player.saya.auto },
            style: { "background-color"() { return player.saya.auto ? "#16a951" : "#666666" } },
        },
    },
})