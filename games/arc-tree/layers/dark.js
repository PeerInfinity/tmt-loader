addLayer("dark", {
    name: "Dark",
    symbol: "D",
    position: 2,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            unlockOrder: 0,
            auto: false,
            pseudoDone: [],
            demile: [],
            deupg: [],
        }
    },
    unlockOrder() { return (hasUpgrade('mem', 24) ? 0 : player[this.layer].unlockOrder); },
    color: "#383838",
    requires() { return new Decimal(5e5).times((player.dark.unlockOrder && !player.dark.unlocked) ? 3 : 1) }, // Can be a function that takes requirement increases into account
    resource: "Dark Matters", // Name of prestige currency
    baseResource: "Fragments", // Name of resource prestige is based on
    baseAmount() { return player.points }, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    branches: ["mem"],
    exponent() {
        let ex = new Decimal(1.25);
        if (hasUpgrade('dark', 22)) ex = ex.plus(-0.15);
        if (hasUpgrade('dark', 34)) ex = ex.plus(-0.05);
        return ex;
    }, // Prestige currency exponent
    base: 1.75,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
        if (hasUpgrade("mem", 34)) mult = mult.div(upgradeEffect('mem', 34).times(1.3).max(1));
        if (hasUpgrade("dark", 13)) mult = mult.div(upgradeEffect('dark', 13));
        if (hasUpgrade("dark", 14)) mult = mult.div(upgradeEffect('dark', 14));
        if (hasUpgrade("dark", 33)) mult = mult.div(upgradeEffect('dark', 33));
        if (hasUpgrade("light", 24)) mult = mult.div(upgradeEffect('light', 24));
        if (hasUpgrade('light', 34)) mult = mult.div(upgradeEffect('light', 34));
        if (hasUpgrade('kou', 14)) mult = mult.div(upgradeEffect('kou', 14));
        if (hasUpgrade('kou', 23)) mult = mult.div(upgradeEffect('kou', 23));
        if (hasUpgrade('lethe', 43)) mult = mult.div(upgradeEffect('lethe', 43));
        if (hasUpgrade('lethe', 34)) mult = mult.div(upgradeEffect('lethe', 34));
        if (hasMilestone('lab', 4)) mult = mult.div(player.lab.power.div(10).max(1));
        if (hasUpgrade('lab', 84)) mult = mult.div(buyableEffect('lab', 22));
        if (hasUpgrade('storylayer', 21)) mult = mult.div(tmp["zero"].challenges[11].effecttoLD);
        if (hasUpgrade('storylayer', 22)) mult = mult.div(player.axium.points.div(2).max(1));
        if (hasMilestone('lib', 1)) mult = mult.div(layers.lib.libEffect().shirabe());
        return mult;
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1);

        return exp
    },

    update(diff) {
        //player.dark.auto = true;
    },

    directMult() {
        let dm = new Decimal(1);
        if (player.kou.unlocked) dm = dm.times(tmp.kou.effect);
        if (inChallenge('world', 12)) dm = dm.times(10);
        else if (hasChallenge('world', 12)) dm = dm.times(5);

        return dm;
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    // displayRow: 3,
    hotkeys: [
        { key: "d", description: "D: Reset for Dark Matters", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    layerShown() { return hasUpgrade("mem", 24) },
    autoPrestige() {
        return (hasMilestone('lethe', 3) && player.dark.auto)
    },
    increaseUnlockOrder: ["light"],

    milestonePopups(){
        return true;
    },
    milestones: {
        0: {
            requirementDescription: "3 Dark Matters",
            done() { return player.dark.best.gte(3) },
            unlocked() { return player[this.layer].unlocked },
            effectDescription() {
                let str = "Keep all your row2 Memory upgrades when L or D reset.";
                return str;
            },
        },
        1: {
            requirementDescription: "15 Dark Matters",
            done() { return player.dark.best.gte(15) },
            unlocked() { return player[this.layer].unlocked },
            effectDescription() {
                let str = "Dark Matters' affection now also makes Memory softcap starts later.";
                return str;
            },
        },
        2: {
            requirementDescription: "20 Dark Matters",
            done() { return player.dark.best.gte(20) },
            unlocked() { return player[this.layer].unlocked },
            effectDescription() {
                let str = "You can buy max Dark Matters & Keep your last two Memory upgrades on row3 when L or D reset.";
                return str;
            },
        },
        3: {
            requirementDescription: "30 Dark Matters",
            done() { return player.dark.best.gte(30) && hasUpgrade("mem", 41) },
            unlocked() { return hasAchievement("a", 24) },
            effectDescription() {
                let str = "Gain 10% of Memories gain every second.";
                return str;
            },
        },
    },

    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone('lethe', 3)) keep.push("auto");
        if (layers[resettingLayer].row > this.row) {
            layerDataReset('dark', keep);
            if (hasMilestone('lethe', 0)) player[this.layer].milestones = player[this.layer].milestones.concat([0, 2]);
            if (hasMilestone('lethe', 2)) player[this.layer].upgrades = player[this.layer].upgrades.concat([11, 12, 13, 14, 21, 22, 23, 24, 31, 32, 33, 34]);
            if (hasMilestone('lethe', 4)) player[this.layer].milestones = player[this.layer].milestones.concat([1, 3]);
            if (hasAchievement("a", 111) && (resettingLayer != 'dark')) player[this.layer].points = new Decimal(10);
            //if (hasMilestone('kou', 2) && (player['awaken'].current == 'kou' || player['awaken'].awakened.includes('kou'))) player[this.layer].upgrades = player[this.layer].upgrades.concat([41, 42, 43, 44]);
        }
    },
    canBuyMax() { return hasMilestone('dark', 2) },
    resetsNothing() { return hasMilestone('lethe', 5) },

    effectBase() {
        let base = new Decimal(1.5);
        // if (player['awaken'].current == this.layer || player['awaken'].awakened.includes(this.layer)) base = new Decimal(2);
        return base;
    },
    effect() {
        if (player[this.layer].points.lte(0)) return new Decimal(1);
        let eff = Decimal.pow(player[this.layer].points.plus(1).log10().plus(1), tmp.dark.effectBase);
        if (hasUpgrade('dark', 31)) eff = Decimal.pow(player[this.layer].points.plus(1).times(2).sqrt().plus(1), tmp.dark.effectBase);
        if (hasAchievement('a', 32)) eff = eff.times(Decimal.log10(player[this.layer].resetTime + 1).plus(1));
        if (hasUpgrade('kou', 11)) eff = eff.times(buyableEffect('kou',11));
        if (hasUpgrade('lethe', 25)) eff = eff.times(upgradeEffect('lethe', 25));
        if (hasUpgrade('lethe', 35)) eff = eff.times(upgradeEffect('lethe', 35));
        if (hasUpgrade('lethe', 52)) eff = eff.times(upgradeEffect('lethe', 52));
        if (hasUpgrade('lethe', 53)) eff = eff.times(upgradeEffect('lethe', 53));
        if (hasUpgrade('lethe', 55)) eff = eff.times(upgradeEffect('lethe', 55));
        if (challengeCompletions('saya', 12) /*&& !layers['saya'].deactivated()*/) eff = eff.times(challengeEffect('saya', 12));
        if (hasUpgrade('lab', 164)) eff = eff.times(buyableEffect('lab', 22).div(10).max(1));
        if (challengeCompletions('saya', 42) /*&& !layers['saya'].deactivated()*/) mult = mult.div(challengeEffect('saya', 42));
        
        if (player.world.randomChallenge && !hasUpgrade('storylayer', 13)) eff = eff.pow(Math.random())
        if (inChallenge('saya', 12) || tmp['saya'].grid.ChallengeDepth[2]>-1) eff = eff.pow(layers.saya.challenges[12].debuff());

        if (eff.lt(1)) return new Decimal(1);
        return eff;
    },
    effectDescription() {
        return "which are boosting Memories gain by " + format(tmp.dark.effect) + "x"
    },

    upgrades: {
        11: { /*title: "The Ruined Tower",
        description() {
            let str=""
            str=str+"Your Fragments generation is doubled before you can afford a Dark Matter."
            return str;
        },*/
            fullDisplay() {
                let str = "<b>The Ruined Tower</b><br>Your Fragments generation is doubled before you can afford a Dark Matter."
                str = str + "<br><br>Cost: " + this.cost() + " Dark Matters"
                return str; 
            },
            unlocked() { return player.dark.unlocked },
            onPurchase() {
                if (hasAchievement("a", 25)) player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost.div(2).floor());
            },
            cost() { return new Decimal(8) },
        },
        12: { /*title: "Seeking for Other Sides",
        description() {
            let str=""
            str=str+"Dark Matters also effect Fragments generation at a reduced rate."
            return str;
        },*/
            fullDisplay() {
                let str = "<b>Seeking for Other Sides</b><br>Dark Matters also effect Fragments generation at a reduced rate."
                str = str + "<br><br>Cost: " + this.cost() + " Dark Matters"
                return str; 
            },
            unlocked() { return hasUpgrade("dark", 11) },
            onPurchase() {
                if (hasAchievement("a", 25)) player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost.div(2).floor());
            },
            effect() {
                let eff = new Decimal(tmp.dark.effect.pow(0.5));
                
                return eff;
            },
            cost() { return new Decimal(14) },
        },
        13: { /*title: "Crack Everything",
        description() {
            let str=""
            str=str+"Dark Matters also effects its own gain at a reduced rate."
            return str;
        },*/
            fullDisplay() {
                let str = "<b>Crack Everything</b><br>Dark Matters also effects its own gain at a reduced rate."
                str = str + "<br><br>Cost: " + this.cost() + " Dark Matters"
                return str; 
            },
            unlocked() { return hasUpgrade("dark", 12) },
            onPurchase() {
                if (hasAchievement("a", 25)) player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost.div(2).floor());
            },
            effect() {
                let eff = 1;
                eff = tmp.light.effect.pow(0.15)
                return eff;
            },
            cost() { return new Decimal(18) },
        },
        14: { //title: "Wrath In Calm",
            //description: "Dark Matters itself boosts its own gain.",
            fullDisplay() {
                let str = "<b>Wrath In Calm</b><br>Dark Matters itself boosts its own gain."
                
                str = str + "<br><br>Cost: " + this.cost() + " Dark Matters"
                return str;
            },
            unlocked() { return hasUpgrade("dark", 13) },
            onPurchase() {
                if (hasAchievement("a", 25)) player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost.div(2).floor());
            },
            effect() {
                let eff = player[this.layer].points.plus(1).log10().plus(1).pow(0.5);
                
                return eff;
            },
            cost() { return new Decimal(21) },
        },
        21: { //title: "Growing Faith",
            //description: "Dark Matters itself boosts its own gain.",
            fullDisplay() {
                let str = "<b>Growing Faith</b><br>Memories softcap starts 50x later."
                
                str = str + "<br><br>Cost: " + this.cost() + " Dark Matters"
                return str;
            },
            unlocked() { return hasUpgrade("dark", 14) },
            onPurchase() {
                if (hasAchievement("a", 25)) player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost.div(2).floor());
            },
            effect() {
                let eff = new Decimal(50);
                
                return eff;
            },
            cost() { return new Decimal(23) },
        },
        22: { //title: "More Darkness",
            //description: "Lower Fragments requirement for further Dark Matters.",
            fullDisplay() {
                let str = "<b>More Darkness</b><br>Lower Fragments requirement for further Dark Matters."
                
                str = str + "<br><br>Cost: " + this.cost() + " Dark Matters"
                return str;
            },
            unlocked() { return hasUpgrade("dark", 21) },
            onPurchase() {
                if (hasAchievement("a", 25)) player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost.div(2).floor());
            },
            cost() { return new Decimal(24) },
        },
        23: { //title: "Power of Dark",
            //description: "Dark Matters' affection also effects The Thread of Two sides.",
            fullDisplay() {
                let str = "<b>Power of Dark</b><br>Dark Matters effect also effects The Thread of Two sides at a reduced rate.";
                
                str = str + "<br><br>Cost: " + this.cost() + " Dark Matters"
                return str;
            },
            unlocked() { return hasUpgrade("dark", 22) },
            onPurchase() {
                if (hasAchievement("a", 25)) player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost.div(2).floor());
            },
            effect() {
                let eff = new Decimal(1)
                eff = eff.times(tmp.dark.effect).log(2).max(1)
                return eff;
            },
            cost() { return new Decimal(30) },
        },
        24: { //title: "Calm in Wrath",
            //description: "Dark Matters also effects Light Tachyons gain.",
            fullDisplay() {
                let str = "<b>Calm in Wrath</b><br>Dark Matters also effects Light Tachyons gain."
                
                str = str + "<br><br>Cost: " + this.cost() + " Dark Matters"
                return str;
            },
            unlocked() { return hasUpgrade("dark", 23) },
            onPurchase() {
                if (hasAchievement("a", 25)) player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost.div(2).floor());
            },
            effect() { return layers['dark'].effect() },
            cost() { return new Decimal(33) },
        },
        31: { //title: "Terrible Memories",
            //description: "Dark Matters effect formula now much better.",
            fullDisplay() {
                let str = "<b>Terrible Memories</b><br>Dark Matters effect formula now much better."
                
                str = str + "<br><br>Cost: " + this.cost() + " Dark Matters"
                return str;
            },
            unlocked() { return hasUpgrade("dark", 24) },
            onPurchase() {
                if (hasAchievement("a", 25)) player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost.div(2).floor());
            },
            cost() { return new Decimal(35) },
        },
        32: { //title: "Moments of Anger",
            //description: "Dark Matter itself makes Memories softcap start later.",
            fullDisplay() {
                let str = "<b>Moments of Anger</b><br>Dark Matter itself makes Memories softcap start later."
                
                str = str + "<br><br>Cost: " + this.cost() + " Dark Matters"
                return str;
            },
            unlocked() { return hasUpgrade("dark", 31) },
            onPurchase() {
                if (hasAchievement("a", 25)) player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost.div(2).floor());
            },
            effect() {
                let eff = player[this.layer].points.div(2);
                if (eff.lt(1.5)) return new Decimal(1.5);
                return eff;
            },
            cost() { return new Decimal(44) },
        },
        33: { //title: "Prepare To Bleed",
            //description: "Achievements now boost Dark Matters gain.",
            fullDisplay() {
                let str = "<b>Prepare To Bleed</b><br>Achievements now boost L & D gain."
                
                str = str + "<br><br>Cost: " + this.cost() + " Dark Matters"
                return str;
            },
            unlocked() { return hasUpgrade("dark", 32) },
            onPurchase() {
                if (hasAchievement("a", 25)) player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost.div(2).floor());
            },
            effect() {
                let eff = player.a.achievements.length;
                if (eff <= 1) return 1;
                return eff;
            },
            cost() { return new Decimal(50) },
        },
        34: { //title: "The Dark",
            //description: "Lower Fragments requirement for further Dark Matters, and Dark Matters itself now boosts Light Tachyons gain.",
            fullDisplay() {
                let str = "<b>The Dark</b><br>Lower Fragments requirement for further Dark Matters, and Dark Matters itself now boosts Light Tachyons gain."
                
                str = str + "<br><br>Cost: " + this.cost() + " Dark Matters"
                return str;
            },
            unlocked() { return hasUpgrade("dark", 33) },
            onPurchase() {
                if (hasAchievement("a", 25)) player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost.div(2).floor());
            },
            effect() {
                let eff = player[this.layer].points.div(3);
                if (eff.lt(1.25)) return new Decimal(1.25);
                return eff;
            },
            cost() { return new Decimal(54) },
        },

    }
})