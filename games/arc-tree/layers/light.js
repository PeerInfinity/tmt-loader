addLayer("light", {
    name: "Light",
    symbol: "L",
    position: 0,
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
    color: "#ededed",
    requires() { return new Decimal(5e5).times((player.light.unlockOrder && !player.light.unlocked) ? 10 : 1) }, // Can be a function that takes requirement increases into account
    resource: "Light Tachyons", // Name of prestige currency
    baseResource: "Memories", // Name of resource prestige is based on
    baseAmount() { return player.mem.points }, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    branches: ["mem"],
    exponent() {
        let ex = new Decimal(1.25);
        if (hasUpgrade('light', 22)) ex = ex.plus(-0.15);
        if (hasUpgrade('light', 34)) ex = ex.plus(-0.05);
        return ex;
    }, // Prestige currency exponent
    base: 1.75,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
        if (hasUpgrade("mem", 34)) mult = mult.div(upgradeEffect('mem', 34).times(1.6).max(1));
        if (hasUpgrade("light", 13)) mult = mult.div(upgradeEffect('light', 13));
        if (hasUpgrade("light", 14)) mult = mult.div(upgradeEffect('light', 14));
        if (hasUpgrade("dark", 24)) mult = mult.div(upgradeEffect('dark', 24));
        if (hasUpgrade("dark", 33)) mult = mult.div(upgradeEffect('dark', 33));
        if (hasUpgrade('dark', 34)) mult = mult.div(upgradeEffect('dark', 34));
        if (hasUpgrade('kou', 13)) mult = mult.div(upgradeEffect('kou', 13));
        if (hasUpgrade('kou', 24)) mult = mult.div(upgradeEffect('kou', 24));
        if (hasUpgrade('lethe', 11)) mult = mult.div(upgradeEffect('lethe', 11));
        if (hasUpgrade('lethe', 23)) mult = mult.div(upgradeEffect('lethe', 23));
        if (hasUpgrade('lethe', 32)) mult = mult.div(upgradeEffect('lethe', 32));
        if (hasMilestone('lab', 3)) mult = mult.div(player.lab.power.div(10).max(1));
        if (hasUpgrade('lab', 83)) mult = mult.div(buyableEffect('lab', 21));
        if (hasUpgrade('storylayer', 21)) mult = mult.div(tmp["zero"].challenges[11].effecttoLD);
        if (hasUpgrade('storylayer', 22)) mult = mult.div(player.zero.points.div(2).max(1));
        if (inChallenge('saya', 42) || tmp['saya'].grid.ChallengeDepth[8]>-1) mult = mult.times(tmp["dark"].effect.log(layers.saya.challenges[42].debuff()));
        if (hasMilestone('lib', 1)) mult = mult.div(layers.lib.libEffect().ayu());
        return mult;
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1);

        return exp
    },

    update(diff) {
        //player.light.auto = true;
    },

    directMult() {
        let dm = new Decimal(1);
        if (player.kou.unlocked) dm = dm.times(tmp.kou.effect);
        if (inChallenge('world', 12) || hasChallenge('world', 12)) dm = dm.times(5);
        if (inChallenge('world', 12)) dm = dm.times(2);
        if (inChallenge('saya', 42) || tmp['saya'].grid.ChallengeDepth[8]>-1) dm = dm.div(tmp["dark"].effect.log(layers.saya.challenges[42].debuff()));
        
        return dm;
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    // displayRow: 3,
    hotkeys: [
        { key: "l", description: "L: Reset for Light Tachyons", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    layerShown() { return hasUpgrade("mem", 24) },
    autoPrestige() {
        return (hasMilestone('kou', 3) && player.light.auto)
    },
    increaseUnlockOrder: ["dark"],

    milestonePopups(){
        return true;
    },
    milestones: {
        0: {
            requirementDescription: "3 Light Tachyons",
            done() { return player.light.best.gte(3) },
            unlocked() { return player[this.layer].unlocked },
            effectDescription() {
                let str = "Keep all your row1 Memory upgrades when L or D reset.";
                return str;
            },
        },
        1: {
            requirementDescription: "15 Light Tachyons",
            done() { return player.light.best.gte(15) },
            unlocked() { return player[this.layer].unlocked },
            effectDescription() {
                let str = "Make Memories gain After softcap's exponent +0.02.";
                return str;
            },
        },
        2: {
            requirementDescription: "20 Light Tachyons",
            done() { return player.light.best.gte(20) },
            unlocked() { return player[this.layer].unlocked },
            effectDescription() {
                let str = "You can buy max Light Tachyons & keep your first two Memory upgrades on row3 when L or D reset.";
                return str;
            },
        },
        3: {
            requirementDescription: "30 Light Tachyons",
            done() { return player.light.best.gte(30) && hasUpgrade("mem", 41) },
            unlocked() { return hasAchievement("a", 24) },
            effectDescription() {
                let str = "Gain 10% of Memories gain every second.";
                return str;
            },
        },
    },

    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone('kou', 3)) keep.push("auto");
        if (layers[resettingLayer].row > this.row) {
            layerDataReset('light', keep);
            if (hasMilestone('kou', 0)) player[this.layer].milestones = player[this.layer].milestones.concat([0, 2]);
            if (hasMilestone('kou', 2)) player[this.layer].upgrades = player[this.layer].upgrades.concat([11, 12, 13, 14, 21, 22, 23, 24, 31, 32, 33, 34]);
            if (hasMilestone('kou', 4)) player[this.layer].milestones = player[this.layer].milestones.concat([1, 3]);
            if (hasAchievement("a", 111) && (resettingLayer != 'light')) player[this.layer].points = new Decimal(10);
            //if (hasMilestone('kou', 2) && (player['awaken'].current == 'kou' || player['awaken'].awakened.includes('kou'))) player[this.layer].upgrades = player[this.layer].upgrades.concat([41, 42, 43, 44]);
        }

    },
    canBuyMax() { return hasMilestone('light', 2) },
    resetsNothing() { return hasMilestone('kou', 5) },

    effectBase() {
        let base = new Decimal(1.5);
        // if (player['awaken'].current == this.layer || player['awaken'].awakened.includes(this.layer)) base = new Decimal(2);
        return base;
    },
    effect() {
        if (player[this.layer].points.lte(0)) return new Decimal(1);
        let eff = Decimal.times(tmp.light.effectBase, player.light.points.plus(1));
        if (hasUpgrade('light', 31)) eff = eff.times(player[this.layer].points.sqrt());
        if (hasAchievement('a', 32)) eff = eff.times(Decimal.log10(player[this.layer].resetTime + 1).plus(1));
        if (hasUpgrade('kou', 11)) eff = eff.times(buyableEffect('kou',11));
        if (hasUpgrade('lethe', 13)) eff = eff.times(upgradeEffect('lethe', 13));
        if (hasUpgrade('lethe', 14)) eff = eff.times(upgradeEffect('lethe', 14));
        if (hasUpgrade('lethe', 31)) eff = eff.times(upgradeEffect('lethe', 31));
        if (hasUpgrade('lethe', 41)) eff = eff.times(upgradeEffect('lethe', 41));
        if (challengeCompletions('saya', 11) /*&& !layers['saya'].deactivated()*/) eff = eff.times(challengeEffect('saya', 11));
        if (hasUpgrade('lab', 164)) eff = eff.times(buyableEffect('lab', 21).div(10).max(1));
        
        if (player.world.randomChallenge && !hasUpgrade('storylayer', 13)) eff = eff.pow(Math.random())
        if (inChallenge('saya', 11) || tmp['saya'].grid.ChallengeDepth[1]>-1) eff = eff.pow(layers.saya.challenges[11].debuff());
        if (eff.lt(1)) return new Decimal(1);
        return eff;
    },
    effectDescription() {
        return "which are boosting Fragments generation by " + format(tmp.light.effect) + "x"
    },

    upgrades: {
        11: { /*title: "Optimistic Thoughts",
        description() {
            let str=""
            else str=str+"Your Memories gain is tripled before you can afford a Light Tachyon."
            return str;
        },*/
            fullDisplay() {
                let str = "<b>Optimistic Thoughts</b><br>Your Memories gain is tripled before you can afford a Light Tachyon."
                str = str + "<br><br>Cost: " + this.cost() + " Light Tachyons"
                return str; 
            },
            unlocked() { return player.light.unlocked },
            onPurchase() {
                if (hasAchievement("a", 25)) player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost.div(2).floor());
            },
            cost() { return new Decimal(8) },
        },
        12: { /*title: "Wandering for Beauty",
        description() {
            let str=""
            else str=str+"Light Tachyons also effect Memories gain at a reduced rate."
            return str;
        },*/
            fullDisplay() {
                let str = "<b>Wandering for Beauty</b><br>Light Tachyons also effect Memories gain at a reduced rate."
                str = str + "<br><br>Cost: " + this.cost() + " Light Tachyons"
                return str; 
            },
            unlocked() { return hasUpgrade("light", 11) },
            onPurchase() {
                if (hasAchievement("a", 25)) player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost.div(2).floor());
            },
            effect() {
                let eff = 1;
                eff = tmp["light"].effect.div(2).max(1)
                return eff;
            },
            cost() { return new Decimal(14) },
        },
        13: { /*title: "Glow of Happiness",
        description() {
            let str=""
            else str=str+"Light Tachyons also effect its own gain at a reduced rate."
            return str;
        },*/
            fullDisplay() {
                let str = "<b>Glow of Happiness</b><br>Light Tachyons also effect its own gain at a reduced rate."
                str = str + "<br><br>Cost: " + this.cost() + " Light Tachyons"
                return str; 
            },
            unlocked() { return hasUpgrade("light", 12) },
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
        14: { /*title: "After that Butterfly",
        description() {
            let str=""
            else str=str+"Light Tachyons itself boosts its own gain."
            return str;
        },*/
            fullDisplay() {
                let str = "<b>After that Butterfly</b><br>Light Tachyons itself boosts its own gain."
                str = str + "<br><br>Cost: " + this.cost() + " Light Tachyons"
                return str; 
            },
            unlocked() { return hasUpgrade("light", 13) },
            onPurchase() {
                if (hasAchievement("a", 25)) player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost.div(2).floor());
            },
            effect() {
                let eff = 1;
                eff = player[this.layer].points.plus(1).log10().plus(1).pow(0.5);
                return eff;
            },
            cost() { return new Decimal(21) },
        },
        21: { /*title: "Seeking Delight",
        description() {
            let str=""
            else str=str+"Gain ^0.33 of Memories instead of ^0.25 after Memories softcap."
            return str;
        },*/
            fullDisplay() {
                let str = "<b>Seeking Delight</b><br>Gain ^0.33 of Memories instead of ^0.25 after Memories softcap."
                str = str + "<br><br>Cost: " + this.cost() + " Light Tachyons"
                return str; 
            },
            unlocked() { return hasUpgrade("light", 14) },
            onPurchase() {
                if (hasAchievement("a", 25)) player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost.div(2).floor());
            },
            cost() { return new Decimal(23) },
        },
        22: { //title: "More Brightness",
            //description: "Lower Memories requirement for further Light Tachyons.",
            fullDisplay() {
                let str = "<b>More Brightness</b><br>Lower Memories requirement for further Light Tachyons."
                
                str = str + "<br><br>Cost: " + this.cost() + " Light Tachyons"
                return str;
            },
            unlocked() { return hasUpgrade("light", 21) },
            onPurchase() {
                if (hasAchievement("a", 25)) player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost.div(2).floor());
            },
            cost() { return new Decimal(23) },
        },
        23: { //title: "Power of Light",
            //description: "Light Tachyons' affection also effects The Thread of Two sides.",
            fullDisplay() {
                let str = "<b>Power of Light</b><br>Light Tachyons effect also effects The Thread of Two sides at a reduced rate.";
                
                str = str + "<br><br>Cost: " + this.cost() + " Light Tachyons"
                return str;
            },
            unlocked() { return hasUpgrade("light", 22) },
            onPurchase() {
                if (hasAchievement("a", 25)) player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost.div(2).floor());
            },
            effect() {
                let eff = new Decimal(1)
                eff = eff.times(tmp.light.effect).log(6).max(1)
                return eff;
            },
            cost() { return new Decimal(30) },
        },
        24: { //title: "Sadness Overjoy",
            //description: "Light Tachyons also effects Dark Matters gain.",
            fullDisplay() {
                let str = "<b>Sadness Overjoy</b><br>Light Tachyons also effects Dark Matters gain."
                
                str = str + "<br><br>Cost: " + this.cost() + " Light Tachyons"
                return str;
            },
            unlocked() { return hasUpgrade("light", 23) },
            onPurchase() {
                if (hasAchievement("a", 25)) player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost.div(2).floor());
            },
            effect() { return layers["light"].effect() },
            cost() { return new Decimal(33) },
        },
        31: { //title: "Pleasant Landscape",
            //description: "Light Tachyons effect formula now much better.",
            fullDisplay() {
                let str = "<b>Pleasant Landscape</b><br>Light Tachyons effect formula now much better."
                
                str = str + "<br><br>Cost: " + this.cost() + " Light Tachyons"
                return str;
            },
            unlocked() { return hasUpgrade("light", 24) },
            onPurchase() {
                if (hasAchievement("a", 25)) player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost.div(2).floor());
            },
            cost() { return new Decimal(35) },
        },
        32: { //title: "Moments of Lives",
            //description: "Gain ^0.40 of Memories instead of ^0.33 after Memories softcap.",
            fullDisplay() {
                let str = "<b>Moments of Lives</b><br>Gain ^0.40 of Memories instead of ^0.33 after Memories softcap."
                
                str = str + "<br><br>Cost: " + this.cost() + " Light Tachyons"
                return str;
            },
            unlocked() { return hasUpgrade("light", 31) },
            onPurchase() {
                if (hasAchievement("a", 25)) player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost.div(2).floor());
            },
            cost() { return new Decimal(44) },
        },
        33: { //title: "Prepare To Travel",
            //description: "Light Tachyons itself now makes Directly Transfer boosts more Memories gain.",
            fullDisplay() {
                let str = "<b>Prepare To Travel</b><br>The Thread of Two Sides use a better formula."
                str = str + "<br><br>Cost: " + this.cost() + " Light Tachyons"
                return str;
            },
            unlocked() { return hasUpgrade("light", 32) },
            onPurchase() {
                if (hasAchievement("a", 25)) player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost.div(2).floor());
            },
            cost() { return new Decimal(50) },
        },
        34: { //title: "The Light",
            //description: "Lower Memories requirement for further Light Tachyons, and Light Tachyons itself now boosts Dark Matters gain.",
            fullDisplay() {
                let str = "<b>The Light</b><br>Lower Memories requirement for further Light Tachyons, and Light Tachyons itself now boosts Dark Matters gain."
                str = str + "<br><br>Cost: " + this.cost() + " Light Tachyons"
                return str;
            },
            unlocked() { return hasUpgrade("light", 33) },
            onPurchase() {
                if (hasAchievement("a", 25)) player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost.div(2).floor());
            },
            effect() {
                let eff = player[this.layer].points.plus(1).div(3.2);
                if (eff.lte(1.25)) return new Decimal(1.25);
                return eff
            },
            cost() { return new Decimal(54) },
        },

    }
})