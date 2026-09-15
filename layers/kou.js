addLayer("kou", {
    name: "Red", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            unlockOrder: 0,
            demile: [],
            decha: [],
            passed71: false,
        }
    },
    color: "#ffa0be",
    requires() { return new Decimal(1e25).times((player.kou.unlockOrder && !player.kou.unlocked) ? 15 : 1) }, // Can be a function that takes requirement increases into account
    resource: "Red Dolls", // Name of prestige currency
    baseResource: "Memories", // Name of resource prestige is based on
    baseAmount() { return player.mem.points }, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    branches: ["light"],
    base: 2,
    exponent() {
        let ex = new Decimal(1.5);
        return ex;
    },  // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);//不要忘了这里是static层
        if (hasMilestone('lethe', 4)) mult = mult.div(tmp.lethe.effect);
        if (hasUpgrade('lethe', 23)) mult = mult.div(upgradeEffect('lethe', 23));
        if (hasAchievement('a', 34)) mult = mult.div(tmp.light.effect);
        if (hasUpgrade('lethe', 24)) mult = mult.div(upgradeEffect('lethe', 24));
        if (hasUpgrade('kou', 16)) mult = mult.div(upgradeEffect('kou', 16));
        if (hasMilestone('lab', 5)) mult = mult.div(player.lab.power.div(10).max(1));
        if (hasUpgrade('lab', 93)) mult = mult.div(buyableEffect('lab', 31));
        if (hasMilestone('zero', 4)) mult = mult.div(tmp["zero"].challenges[11].effecttoRF);
        if (inChallenge('world', 21)) mult = mult.div(buyableEffect('axium', 11));
        if (inChallenge('world', 22) || hasChallenge('world', 22)) mult = mult.div(challengeEffect('world', 22));
        if (hasMilestone('lib', 1)) mult = mult.div(layers.lib.libEffect().ayu());
        if (hasMilestone('lib', 2)) mult = mult.div(layers.lib.libEffect().winter());
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1);
        return exp;
    },
    directMult() {
        let dm = new Decimal(1);
        if (player.saya.unlocked) dm = dm.times(tmp.saya.effect);
        return dm;
    },

    effectBase: 1.5,

    effect() {
        if (player[this.layer].points.lte(0)) return new Decimal(1);
        let eff = new Decimal(player[this.layer].points.times(0.1).plus(1));
        if (hasUpgrade('lethe', 15)) eff = eff.times(upgradeEffect('lethe', 15));
        if (hasUpgrade('lethe', 12)) eff = eff.times(upgradeEffect('lethe', 12));
        if (hasUpgrade('lethe', 45)) eff = eff.times(upgradeEffect('lethe', 45));
        if (challengeCompletions('saya', 31) /*&& !layers['saya'].deactivated()*/) eff = eff.times(challengeEffect('saya', 31));
        if (hasUpgrade('lab', 164)) eff = eff.times(buyableEffect('lab', 31).div(10).max(1));
        
        if (player.world.randomChallenge && !hasUpgrade('storylayer', 13)) eff = eff.pow(Math.random());
        if (inChallenge('saya', 31) || tmp['saya'].grid.ChallengeDepth[1]>-1) eff = eff.pow(layers.saya.challenges[21].debuff());
        return eff;
    },
    effectDescription() {
        return "which are directly boosting Light Tachyons and Dark Matters gain by " + format(tmp.kou.effect) + "x"
    },
    canBuyMax() { return hasUpgrade('lab', 61) },
    autoPrestige() {
        return (hasUpgrade('lab', 71) && player.kou.auto)
    },
    resetsNothing() { return hasUpgrade('lab', 81) },

    row: 2, // Row the layer is in on the tree (0 is the first row)
    displayRow: 2,
    hotkeys: [
        { key: "r", description: "R: Reset for Red dolls", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    layerShown() { return hasAchievement('a', 24) },
    increaseUnlockOrder: ["lethe"],

    update(diff) {
        if (layers.kou.buyables[11].autoed() && player.points.gte(layers.kou.buyables[11].cost().fo)) layers.kou.buyables[11].buy();
    },

    shouldNotify(){
        if (layers.kou.buyables[11].canAfford()) return true
    },

    doReset(resettingLayer) {
        let keep = [];
        //if (hasMilestone('kou', 3)) keep.push("auto");
        if (layers[resettingLayer].row > this.row) {
            layerDataReset('kou', keep);
            if (hasMilestone('zero', 0)) player[this.layer].milestones = player[this.layer].milestones.concat([0, 1, 2, 3, 4, 5]);
            if (hasMilestone('zero', 1)) {
                player[this.layer].milestones = player[this.layer].milestones.concat([6]);
                player[this.layer].upgrades = player[this.layer].upgrades.concat([11, 12, 13, 14, 15, 16]);
            }
            if (hasMilestone('zero', 2)) player[this.layer].upgrades = player[this.layer].upgrades.concat([21, 22, 23, 24, 25]);
        }
    },

    milestones: {
        0: {
            requirementDescription: "1 Red Doll",
            done() { return player.kou.best.gte(1) },
            unlocked() { return player.kou.unlocked },
            effectDescription: "Keep first and third Milestones of Light Tachyon layer when R or F reset.",
        },
        1: {
            requirementDescription: "3 Red Dolls",
            done() { return player.kou.best.gte(3) },
            unlocked() { return player.kou.unlocked },
            effectDescription: "The Thread of Two Sides boost L & D's gain based on their sum instead of their average.",
        },
        2: {
            requirementDescription: "7 Red Dolls",
            done() { return player.kou.best.gte(7) },
            unlocked() { return player.kou.unlocked },
            effectDescription: "Keep Light Tachyons' upgrades when R or F reset.",
        },
        3: {
            requirementDescription: "10 Red Dolls",
            done() { return player.kou.best.gte(10) },
            unlocked() { return player.kou.unlocked },
            effectDescription: "Unlock Light Talcyon's Autobuyer.",
        },
        4: {
            requirementDescription: "12 Red Dolls",
            done() { return player.kou.best.gte(12) },
            unlocked() { return player.kou.unlocked },
            effectDescription: "Keep last two Milestones of Light Tachyon layer when R or F reset, and Red Dolls effect also boosts Forgotten Drops gain.",
        },
        5: {
            requirementDescription: "15 Red Dolls",
            done() { return player.kou.best.gte(15) },
            unlocked() { return player.kou.unlocked },
            effectDescription: "Light Tachyon layer resets nothing.",
        },
        6: {
            requirementDescription: "20 Red Dolls",
            done() { return player.kou.best.gte(20) },
            unlocked() { return hasMilestone("kou", 5) },
            effectDescription: "Unlock a new row of Red upgrades.",
        },
    },
    milestonePopups(){
        return true;
    },

    tabFormat: [
        "main-display",
        "blank",
        "prestige-button",
        "resource-display",
        "blank",
        "milestones",
        "blank", "blank",
        "buyables",
        "blank",
        ["display-text", function () { return 'The max level of the Tower is determined by current unlocked layers, each provides 10.' } ],
        ["display-text", function () { return 'Upgrades in the first row will each add a new effect to the Tower instead of directly affect the game.' } ],
        "blank",
        "upgrades"
    ],

    buyables: {
        11: {
            reachedMax() {
                let maximum = 0;//每加一个层都回来看一遍（做得到吗
                if (player.mem.unlocked) maximum += 10;
                if (player.light.unlocked) maximum += 10;
                if (player.dark.unlocked) maximum += 10;
                if (player.kou.unlocked) maximum += 10;
                if (player.lethe.unlocked) maximum += 10;
                if (player.lab.unlocked) maximum += 10;
                if (player.zero.unlocked) maximum += 10;
                if (player.axium.unlocked) maximum += 10;
                if (player.world.unlocked) maximum += 10;
                if (player.storylayer.unlocked) maximum += 10;
                if (player.etoluna.unlocked) maximum += 10;
                if (player.saya.unlocked) maximum += 10;
                return player.kou.buyables[this.id].gte(maximum)
            },
            title: "The Tower",
            unlocked() { return player.kou.unlocked },
            onPurchase() {
                //player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost);
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id];
                let cost = data.cost;
                let amt = player[this.layer].buyables[this.id];
                let display = formatWhole(player.points) + " / " + formatWhole(cost.fo) + " Fragments" + "<br><br>Level: " + formatWhole(amt);
                if (this.reachedMax()) display = display + " (MAXED)";
                display = display + "<br><br>Reward: Memories gain";
                if (hasUpgrade("kou", 11)) display = display + " and L & D's effect are boosted by " + formatWhole(data.effect) + "x";
                else display = display + " is boosted by " + formatWhole(data.effect) + "x";
                if (hasUpgrade("kou", 13) && !hasUpgrade("kou", 14)) display = display + "<br>Light Tachyons gain is boosted by " + format(upgradeEffect('kou', 13)) + "x";
                if (hasUpgrade("kou", 14) && !hasUpgrade("kou", 13)) display = display + "<br>Dark Matters gain is boosted by " + format(upgradeEffect('kou', 14)) + "x";
                if (hasUpgrade("kou", 13) && hasUpgrade("kou", 14)) display = display + "<br>Light Tachyons and Dark Matters gains are boosted by " + format(upgradeEffect('kou', 13)) + "x";
                if (hasUpgrade("kou", 15)) display = display + "<br>Fragments generation is boosted by " + format(upgradeEffect('kou', 15)) + "x";
                if (hasUpgrade("kou", 16)) display = display + "<br>Red Dolls gain is boosted by " + format(upgradeEffect('kou', 16)) + "x";
                if (hasUpgrade("kou", 12)) display = display + "<br>and Memory softcap starts " + formatWhole(data.effect) + "x later.";
                else display = display + ".";
                if (amt.gte(15)) display = display + "<br>Furthermore, you can buy " + formatWhole(amt.sub(14).max(1).min(8)) + " more Beacons."
                return display;
            },
            effect() {
                let effbase = 3
                if (inChallenge('world', 12)) effbase = 1.1
                return Decimal.pow(effbase, new Decimal(player[this.layer].buyables[this.id])).max(1)
            },
            cost(x = player[this.layer].buyables[this.id]) {
                let y = x.div(10).floor();
                z = y.plus(3).times(x).sub(y.times(y.plus(1)).times(5));
                let cost = new Decimal(0);
                if (inChallenge('world', 12)) cost = new Decimal(1e4).times(Decimal.pow(100, x));
                else if (!hasUpgrade("lab", 91)) cost = new Decimal(1e24).times(Decimal.pow(10, z));
                else cost = new Decimal(1e4).times(Decimal.pow(10, z))
                return { fo: cost, };
            },
            canAfford() {
                if (this.autoed()) return false;
                if (!tmp[this.layer].buyables[this.id].unlocked) return false;
                let cost = layers[this.layer].buyables[this.id].cost();
                return !this.reachedMax() && player[this.layer].unlocked && player.points.gte(cost.fo) /*&& !this.autoed()*/;
            },
            buy() {
                let cost = layers[this.layer].buyables[this.id].cost();
                player.points = player.points.sub(cost.fo);
                player.kou.buyables[this.id] = player.kou.buyables[this.id].plus(1);
            },
            autoed() {
                return !this.reachedMax() && hasUpgrade('lab', 91);
            }
            //style: { 'height': '200px', 'width': '200px' },
        },
    },

    upgrades: {
        11: {
            fullDisplay() {
                let str = "<b>Beside the Coast</b><br>The Tower also improve Light Tachyon & Dark Matter's effect."
                str = str + "<br><br>Cost: " + this.cost() + " Red Dolls"
                return str; 
            },
            unlocked() { return player.kou.unlocked },
            onPurchase() {
                //player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost);
            },
            cost() { return new Decimal(3) },
        },
        12: {
            fullDisplay() {
                let str = "<b>Staring at the Sky</b><br>The Tower also push Memory softcap later."
                str = str + "<br><br>Cost: " + this.cost() + " Red Dolls"
                return str;
            },
            unlocked() { return hasUpgrade("kou", 11) },
            onPurchase() {
                //player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost);
            },
            cost() { return new Decimal(14) },
        },
        13: {
            fullDisplay() {
                let str = "<b>Above the Earth</b><br>The Tower now boosts Light Tachyon gain at a reduced rate."
                str = str + "<br><br>Cost: " + this.cost() + " Red Dolls"
                return str;
            },
            unlocked() { return hasUpgrade("kou", 12) },
            onPurchase() {
                //player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost);
            },
            effect(){
                if (inChallenge('world', 12)) return new Decimal(2).times(player[this.layer].buyables[11]).max(1)
                if (hasUpgrade("lab", 91)) return new Decimal(2).pow(player[this.layer].buyables[11]).max(1)
                return new Decimal(3).times(player[this.layer].buyables[11]).max(1)
            },
            cost() { return new Decimal(25) },
        },
        14: {
            fullDisplay() {
                let str = "<b>Sight to the Sea</b><br>The Tower now boosts Dark Matter gain at a reduced rate."
                str = str + "<br><br>Cost: " + this.cost() + " Red Dolls"
                return str;
            },
            unlocked() { return hasUpgrade("kou", 12) },
            onPurchase() {
                //player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost);
            },
            effect(){
                if (inChallenge('world', 12)) return new Decimal(2).times(player[this.layer].buyables[11]).max(1)
                if (hasUpgrade("lab", 91)) return new Decimal(2).pow(player[this.layer].buyables[11]).max(1)
                return new Decimal(3).times(player[this.layer].buyables[11]).max(1)
            },
            cost() { return new Decimal(25) },
        },
        15: {
            fullDisplay() {
                let str = "<b>Regain the Sand</b><br>The Tower also boosts Fragments generation at a reduced rate."
                str = str + "<br><br>Cost: " + this.cost() + " Red Dolls"
                return str;
            },
            unlocked() { return hasUpgrade("kou", 13) && hasUpgrade("kou", 14) },
            onPurchase() {
                //player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost);
            },
            effect(){
                if (inChallenge('world', 12)) return new Decimal(3).times(player[this.layer].buyables[11]).max(1)
                return new Decimal(2).pow(player[this.layer].buyables[11]).max(1)
            },
            cost() { return new Decimal(44) },
        },
        16: {
            fullDisplay() {
                let str = "<b>In the Bell Tower</b><br>The Tower also boosts Red Dolls' own gain at a reduced rate."
                str = str + "<br><br>Cost: " + this.cost() + " Red Dolls"
                return str;
            },
            unlocked() { return hasUpgrade("kou", 15) },
            onPurchase() {
                //player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost);
            },
            effect(){
                if (inChallenge('world', 12)) return new Decimal(2).times(player[this.layer].buyables[11]).max(1)
                if (hasUpgrade("lab", 91)) return new Decimal(3).pow(player[this.layer].buyables[11]).max(1)
                return new Decimal(1.5).times(player[this.layer].buyables[11]).max(1)
            },
            cost() { return new Decimal(54) },
        },
        21: {
            fullDisplay() {
                let str = "<b>Yearn for the Moon</b><br>Fragments gain is powered by 1.025."
                str = str + "<br><br>Cost: " + this.cost() + " Red Dolls"
                return str;
            },
            unlocked() { return hasMilestone('kou', 6) },
            onPurchase() {
                //player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost);
            },
            cost() { return new Decimal(17) },
        },
        22: {
            fullDisplay() {
                let str = "<b>Head to the Castle</b><br>Broaden the Guiding Beacons."
                str = str + "<br><br>Cost: " + this.cost() + " Red Dolls"
                return str;
            },
            unlocked() { return hasUpgrade("kou", 21) },
            onPurchase() {
                //player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost);
            },
            cost() { return new Decimal(38) },
        },
        23: {
            fullDisplay() {
                let str = "<b>Lost in the Garden</b><br>Your Dark Matter gain is boosted when it fall behind by Light Tachyons."
                str = str + "<br><br>Cost: " + this.cost() + " Red Dolls"
                return str;
            },
            unlocked() { return hasUpgrade("kou", 22) },
            onPurchase() {
                //player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost);
            },
            cost() { return new Decimal(42) },
            effect() {
                let eff = player.light.points.sub(player.dark.points).div(2).max(1)
                return eff
            },
        },
        24: {
            fullDisplay() {
                let str = "<b>Wander in the Town</b><br>Your Light Tachyon gain is boosted when it fall behind by Dark Matter."
                str = str + "<br><br>Cost: " + this.cost() + " Red Dolls"
                return str;
            },
            unlocked() { return hasUpgrade("kou", 22) },
            onPurchase() {
                //player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost);
            },
            cost() { return new Decimal(42) },
            effect() {
                let eff = player.dark.points.sub(player.light.points).div(2).max(1)
                return eff
            },
        },
        25: {
            fullDisplay() {
                let str = "<b>Seek for the Harbour</b><br>You can buy 8 more Beacons."
                str = str + "<br><br>Req: " + this.cost() + " Red Dolls"
                return str;
            },
            unlocked() { return hasUpgrade("kou", 23) && hasUpgrade("kou", 24) },
            onPurchase() {
                player[this.layer].points = player[this.layer].points.plus(tmp[this.layer].upgrades[this.id].cost);
            },
            cost() { return new Decimal(68) },
        },
    },
})
