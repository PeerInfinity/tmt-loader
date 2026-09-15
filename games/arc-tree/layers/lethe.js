addLayer("lethe", {
    name: "Forgotten", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "F", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 4, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            unlockOrder: 0,
            nodeSlots: 0,
            demile: [],
            deupg: [],
        }
    },
    color: "#fee85d",
    requires() { return new Decimal(2e20).times((player.lethe.unlockOrder && !player.lethe.unlocked) ? 5e4 : 1) }, // Can be a function that takes requirement increases into account
    resource: "Forgotten Drops", // Name of prestige currency
    baseResource: "Fragments", // Name of resource prestige is based on
    baseAmount() { return player.points }, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    branches: ["dark"],
    exponent() {
        let ex = new Decimal(0.6);
        return ex;
    },  // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
        if (hasMilestone('kou', 4)) mult = mult.times(tmp.kou.effect);
        if (hasAchievement('a', 34)) mult = mult.times(tmp.dark.effect);
        if (hasUpgrade('lethe', 42)) mult = mult.times(upgradeEffect('lethe', 42));
        if (hasMilestone('lab', 6)) mult = mult.times(player.lab.power.div(10).max(1));
        if (hasUpgrade('lab', 94)) mult = mult.times(buyableEffect('lab', 32));
        if (hasMilestone('zero', 4)) mult = mult.times(tmp["zero"].challenges[11].effecttoRF);
        if (inChallenge('world', 21)) mult = mult.times(buyableEffect('axium', 11));
        if (inChallenge('world', 22) || hasChallenge('world', 22)) mult = mult.times(challengeEffect('world', 22));
        if (hasMilestone('lib', 1)) mult = mult.times(layers.lib.libEffect().shirabe());
        if (hasMilestone('lib', 2)) mult = mult.times(layers.lib.libEffect().winter());
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
    row: 2, // Row the layer is in on the tree (0 is the first row)
    displayRow: 2,
    increaseUnlockOrder: ["kou"],

    passiveGeneration() {
        //if (layers['lethe'].deactivated() || player['awaken'].current == this.layer) return 0;
        let pg = 0;
        if (hasUpgrade('lab', 62)) pg = pg + 0.1;
        return pg;
    },

    update(diff) {
        if (isNaN(player.lethe.points.toNumber()) || player.lethe.points.lte(0)) player.lethe.points = new Decimal(0);
        if (!layers.lethe.tabFormat["Beacons"].unlocked() && player.subtabs.lethe.mainTabs == "Beacons") player.subtabs.lethe.mainTabs = "Milestones";
    },

    doReset(resettingLayer) {
        let tempupgrades = player[this.layer].upgrades;
        let keep = [];
        if (layers[resettingLayer].row > this.row) {
            layerDataReset("lethe", keep);
            if (hasMilestone('axium', 0)) player.lethe.milestones = player.lethe.milestones.concat([0, 1, 2, 3, 4, 5]);
            if (hasMilestone('axium', 1)) player.lethe.milestones.push(6);
            //keep upgrades
            if (hasUpgrade('lab', 72)) {
                let auto = [11, 15, 51, 55];
                if (hasUpgrade('lab', 82)) auto = auto.concat([13, 31, 35, 53]);
                if (hasUpgrade('lab', 92)) auto = auto.concat([12, 14, 21, 25, 41, 45, 52, 54]);
                if (hasMilestone('axium', 2)) auto = auto.concat([22, 23, 24, 32, 33, 34, 42, 43, 44]);
                for (var i = 0; i < auto.length; i++) {
                    if (!hasUpgrade('lethe', auto[i])) player.lethe.upgrades.push(auto[i]);
                }
            };
            if (inChallenge('saya', 32)) player[this.layer].upgrades = tempupgrades;
        }
    },

    BeaconLength() {
        let len = 0;
        if (hasUpgrade('lethe', 11)) len = len + 1;
        if (hasUpgrade('lethe', 12)) len = len + 1;
        if (hasUpgrade('lethe', 13)) len = len + 1;
        if (hasUpgrade('lethe', 14)) len = len + 1;
        if (hasUpgrade('lethe', 15)) len = len + 1;
        if (hasUpgrade('lethe', 21)) len = len + 1;
        if (hasUpgrade('lethe', 22)) len = len + 1;
        if (hasUpgrade('lethe', 23)) len = len + 1;
        if (hasUpgrade('lethe', 24)) len = len + 1;
        if (hasUpgrade('lethe', 25)) len = len + 1;
        if (hasUpgrade('lethe', 31)) len = len + 1;
        if (hasUpgrade('lethe', 32)) len = len + 1;
        if (hasUpgrade('lethe', 33)) len = len + 1;
        if (hasUpgrade('lethe', 34)) len = len + 1;
        if (hasUpgrade('lethe', 35)) len = len + 1;
        if (hasUpgrade('lethe', 41)) len = len + 1;
        if (hasUpgrade('lethe', 42)) len = len + 1;
        if (hasUpgrade('lethe', 43)) len = len + 1;
        if (hasUpgrade('lethe', 44)) len = len + 1;
        if (hasUpgrade('lethe', 45)) len = len + 1;
        if (hasUpgrade('lethe', 51)) len = len + 1;
        if (hasUpgrade('lethe', 52)) len = len + 1;
        if (hasUpgrade('lethe', 53)) len = len + 1;
        if (hasUpgrade('lethe', 54)) len = len + 1;
        if (hasUpgrade('lethe', 55)) len = len + 1;

        return len;
    },

    milestones: {
        0: {
            requirementDescription: "1 Forgotten Drop",
            done() { return player.lethe.best.gte(1) },
            unlocked() { return player.lethe.unlocked },
            effectDescription: "Keep first and third Milestones of Dark Matter layer when R or F reset.",
        },
        1: {
            requirementDescription: "35 Forgotten Drops",
            done() { return player.lethe.best.gte(35) },
            unlocked() { return player.lethe.unlocked },
            effectDescription: "The Thread of Two Sides also push Memory softcap later.",
        },
        2: {
            requirementDescription: "1000 Forgotten Drops",
            done() { return player.lethe.best.gte(1000) },
            unlocked() { return player.lethe.unlocked },
            effectDescription: "Keep Dark Matters' upgrades when R or F reset.",
        },
        3: {
            requirementDescription: "100,000 Forgotten Drops",
            done() { return player.lethe.best.gte(1e5) },
            unlocked() { return player.lethe.unlocked },
            effectDescription: "Unlock Dark Matter's Autobuyer.",
        },
        4: {
            requirementDescription: "2,000,000 Forgotten Drops",
            done() { return player.lethe.best.gte(2000000) },
            unlocked() { return player.lethe.unlocked },
            effectDescription: "Keep last two Milestones of Dark Matter layer when R or F reset, and Forgotten Drops effect also boosts Red Dolls gain.",
        },
        5: {
            requirementDescription: "50,000,000 Forgotten Drops",
            done() { return player.lethe.best.gte(50000000) },
            unlocked() { return player.lethe.unlocked },
            effectDescription: "Dark Matter layer resets nothing.",
        },
        6: {
            requirementDescription: "1e14 Forgotten Drops",
            done() { return player.lethe.best.gte(1e14) },
            unlocked() { return hasMilestone('lethe', 5) },
            effectDescription: "Unlock Guiding Beacons & you have 5 beacons initially.",
        },
    },
    milestonePopups(){
        return true;
    },

    clickables: {
        rows: 1,
        cols: 2,
        11: {
            title: "Remove all Guiding Beacons",
            display: "",
            unlocked() { return player.lethe.unlocked && !inChallenge('kou',82) },
            canClick() { return player.lethe.unlocked && layers['lethe'].BeaconLength() > 0 },
            onClick() {
                let del = ["11", "12", "13", "14", "15", "21", "22", "23", "24", "25", "31", "32", "33", "34", "35", "41", "42", "43", "44", "45", "51", "52", "53", "54", "55"];
                if (!confirm("Are you sure you want to remove all Beacons? This will force an Forgotten reset!")) return;
                //player.lethe.upgrades = [];
                let kep = player.lethe.upgrades.filter((x) => !del.some((item) => x == item));
                doReset("lethe", true);
                player.lethe.upgrades = kep;
            },
            style: { width: "150px", height: "50px" },
        },
    },


    tabFormat: {
        "Milestones": {
            content: [
                "main-display",
                "blank",
                "prestige-button",
                "resource-display",
                "blank",
                "milestones",]
        },
        "Beacons": {
            unlocked() { return hasMilestone('lethe', 6) },
            buttonStyle() { return { 'background-color': '#d2ba46', color: "black" } },
            content: [
                "main-display", "blank",
                "prestige-button",
                "resource-display", "blank",
                ["display-text", function () { return "Build the Tower or buy Red upgrades to expand your Beacon limit."}],
                ["display-text", function () { return "You have " + formatWhole(layers['lethe'].BeaconLength()) + " Beacons, and now you can have " + formatWhole(tmp.lethe.nodeSlots) + " Beacons at most."}], "blank",
                "clickables", "blank",
                ["row", [["upgrade", "11"], ["upgrade", "12"], ["upgrade", "13"], ["upgrade", "14"], ["upgrade", "15"],]],
                ["row", [["upgrade", "21"], ["upgrade", "22"], ["upgrade", "23"], ["upgrade", "24"], ["upgrade", "25"],]],
                ["row", [["upgrade", "31"], ["upgrade", "32"], ["upgrade", "33"], ["upgrade", "34"], ["upgrade", "35"],]],
                ["row", [["upgrade", "41"], ["upgrade", "42"], ["upgrade", "43"], ["upgrade", "44"], ["upgrade", "45"],]],
                ["row", [["upgrade", "51"], ["upgrade", "52"], ["upgrade", "53"], ["upgrade", "54"], ["upgrade", "55"],]],
            ]
        },
    },

    hotkeys: [
        { key: "f", description: "F: Reset for Forgotten Drops", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    layerShown() { return hasAchievement('a', 24) },

    effectBase() {
        let base = new Decimal(1.5);
        return base;
    },
    effect() {
        if (player[this.layer].points.lte(0)) return new Decimal(1);
        let eff = player[this.layer].points.plus(1).pow(2).log10().plus(1);
        if (hasUpgrade('lethe', 21)) eff = eff.times(upgradeEffect('lethe', 21));
        if (hasUpgrade('lethe', 51)) eff = eff.times(upgradeEffect('lethe', 51));
        if (hasUpgrade('lethe', 54)) eff = eff.times(upgradeEffect('lethe', 54));
        if (hasUpgrade('lab', 164)) eff = eff.times(buyableEffect('lab', 32).div(10).max(1));
        if (challengeCompletions('saya', 32) /*&& !layers['saya'].deactivated()*/) eff = eff.times(challengeEffect('saya', 32));
        if (hasUpgrade('lab', 164)) eff = eff.times(buyableEffect('lab', 32).div(10).max(1));
        
        if (player.world.randomChallenge && !hasUpgrade('storylayer', 13)) eff = eff.pow(Math.random())
            
        //if (player['awaken'].current == this.layer || player['awaken'].awakened.includes(this.layer)) eff = new Decimal(player[this.layer].points.plus(1).pow(3.25).log10().plus(1));
        //if (hasUpgrade('dark', 42)) eff = eff.times(upgradeEffect('dark', 42));

        //AW
        //if (player['awaken'].selectionActive && player['awaken'].current != null && player['awaken'].current != this.layer && !player['awaken'].awakened.includes(this.layer)) return new Decimal(1);

        return eff;
    },
    effectDescription() {
        return "which are directly boosting Fragments generation and Memories gain by " + format(tmp.lethe.effect) + "x"
    },

    nodeSlots() {
        let node = new Decimal(0);
        if (hasMilestone('lethe', 6)) node = node.plus(5);
        if (hasAchievement('a', 43)) node = node.plus(4);
        if (hasUpgrade('kou', 25)) node = node.plus(8);
        if (player.kou.buyables[11].gte(15)) node = node.plus(player.kou.buyables[11].floor().sub(14).min(8))
        if (inChallenge('world', 21)) node = new Decimal(9);
        if (inChallenge('saya', 32) || tmp['saya'].grid.ChallengeDepth[6]>-1) node = node.min(layers.saya.challenges[32].debuff());
        return node.toNumber()
    },

    upgrades: {
        11: {
            revealed() {
                return hasUpgrade("lethe", 12) || hasUpgrade("lethe", 21) || hasUpgrade("lethe", 22)
            },
            fullDisplay() {
                if (!this.revealed()) return "<b>Unrevealed</b>"
                let str = "<b>White Beacon</b><br>Light Tachyons gain is boosted by Achievements."
                str = str + "<br><br>Cost: 2500 Light Tachyons"
                return str;
            },
            unlocked() { return hasUpgrade("kou", 22) || hasMilestone("axium", 1) },
            style: { height: '130px', width: '130px' },
            canAfford() {
                let a = player.light.points.gte(2500)
                let b = this.revealed()
                return a && b && (layers['lethe'].BeaconLength() < tmp.lethe.nodeSlots)
            },
            pay() {
                player.light.points = player.light.points.sub(2500);
            },
            effect() {
                let eff = player.a.achievements.length / 2;
                if (eff < 1) return 1;
                return eff;
            },
        },
        12: {
            revealed() {
                return hasUpgrade("lethe", 11) || hasUpgrade("lethe", 13) || hasUpgrade("lethe", 21) || hasUpgrade("lethe", 22) || hasUpgrade("lethe", 23)
            },
            fullDisplay() {
                if (!this.revealed()) return "<b>Unrevealed</b>"
                let str = "<b>Delightful-Red Synergy</b><br>Light Tachyons itself boosts Red Dolls effect."
                str = str + "<br><br>Cost: 9000 Light Tachyons<br>Req: 15x Red Dolls effect"
                return str;
            },
            unlocked() { return hasUpgrade("kou", 22) || hasMilestone("axium", 1) },
            style: { height: '130px', width: '130px' },
            canAfford() {
                let a = player.light.points.gte(9000) && tmp['kou'].effect.gte(15)
                let b = this.revealed()
                return a && b && (layers['lethe'].BeaconLength() < tmp.lethe.nodeSlots)
            },
            pay() {
                player.light.points = player.light.points.sub(9000);
            },
            effect() {
                let eff = player.light.points.plus(1).log10().div(2).max(1);
                return eff;
            },
        },
        13: {
            revealed() {
                return hasUpgrade("lethe", 12) || hasUpgrade("lethe", 14) || hasUpgrade("lethe", 22) || hasUpgrade("lethe", 23) || hasUpgrade("lethe", 24)
            },
            fullDisplay() {
                if (!this.revealed()) return "<b>Unrevealed</b>"
                let str = "<b>The Tower of Light</b><br>Red Dolls effects Light Tachyons effect at an increased rate."
                str = str + "<br><br>Cost: 5000 Light Tachyons<br>55 Red Dolls"
                return str;
            },
            unlocked() { return hasUpgrade("kou", 22) || hasMilestone("axium", 1) },
            style: { height: '130px', width: '130px' },
            canAfford() {
                let a = player.light.points.gte(5000) && player.kou.points.gte(55)
                let b = this.revealed()
                return a && b && (layers['lethe'].BeaconLength() < tmp.lethe.nodeSlots)
            },
            pay() {
                player.light.points = player.light.points.sub(5000);
                if (!hasAchievement('a', 53)) player.kou.points = player.kou.points.sub(55);
            },
            effect() {
                let eff = layers['kou'].effect().pow(1.5);
                return eff;
            },
        },
        14: {
            revealed() {
                return hasUpgrade("lethe", 13) || hasUpgrade("lethe", 15) || hasUpgrade("lethe", 23) || hasUpgrade("lethe", 24) || hasUpgrade("lethe", 25)
            },
            fullDisplay() {
                if (!this.revealed()) return "<b>Unrevealed</b>"
                let str = "<b>Joyful-White Synergy</b><br>Red Dolls itself boosts Light Tachyons effect."
                str = str + "<br><br>Cost: 70 Red Dolls<br>Req: 1e25x Light Tachyons effect"
                return str;
            },
            unlocked() { return hasUpgrade("kou", 22) || hasMilestone("axium", 1) },
            style: { height: '130px', width: '130px' },
            canAfford() {
                let a = player.mem.points.gte(1e70) && tmp['light'].effect.gte(1e25)
                let b = this.revealed()
                return a && b && (layers['lethe'].BeaconLength() < tmp.lethe.nodeSlots)
            },
            pay() {
                if (!hasAchievement('a', 53)) player.kou.points = player.kou.points.sub(70);
            },
            effect() {
                let eff = player.kou.points.div(2).max(1);
                return eff;
            },
        },
        15: {
            revealed() {
                return hasUpgrade("lethe", 14) || hasUpgrade("lethe", 24) || hasUpgrade("lethe", 25)
            },
            fullDisplay() {
                if (!this.revealed()) return "<b>Unrevealed</b>"
                let str = "<b>Red Beacon</b><br>Red Dolls effect increases based on its own reset time."
                str = str + "<br><br>Cost: 50 Red Dolls"
                return str;
            },
            unlocked() { return hasUpgrade("kou", 22) || hasMilestone("axium", 1) },
            style: { height: '130px', width: '130px' },
            canAfford() {
                let a = player.kou.points.gte(50)
                let b = this.revealed()
                return a && b && (layers['lethe'].BeaconLength() < tmp.lethe.nodeSlots)
            },
            pay() {
                if (!hasAchievement('a', 53)) player.kou.points = player.kou.points.sub(50);
            },
            effect() {
                let eff = Decimal.log10(player.kou.resetTime + 1).plus(1).sqrt();
                return eff;
            },
        },
        21: {
            revealed() {
                return hasUpgrade("lethe", 11) || hasUpgrade("lethe", 12) || hasUpgrade("lethe", 22) || hasUpgrade("lethe", 31) || hasUpgrade("lethe", 32)
            },
            fullDisplay() {
                if (!this.revealed()) return "<b>Unrevealed</b>"
                let str = "<b>Delightful-Yellow Synergy</b><br>Light Tachyons itself boosts Forgotten Drops effect."
                str = str + "<br><br>Cost: 9000 Light Tachyons<br>Req: 350x Forgotten Drops effect"
                return str;
            },
            unlocked() { return hasUpgrade("kou", 22) || hasMilestone("axium", 1) },
            style: { height: '130px', width: '130px' },
            canAfford() {
                let a = player.light.points.gte(9000) && tmp['lethe'].effect.gte(350)
                let b = this.revealed()
                return a && b && (layers['lethe'].BeaconLength() < tmp.lethe.nodeSlots)
            },
            pay() {
                player.light.points = player.light.points.sub(9000);
            },
            effect() {
                let eff = player.light.points.plus(1).log10().div(2).max(1);
                return eff;
            },
        },
        22: {
            revealed() {
                return hasUpgrade("lethe", 33)
            },
            fullDisplay() {
                if (!this.revealed()) return "<b>Unrevealed</b>"
                let str = "<b>Delightful Memories</b><br>Light Tachyons itself makes Memory softcap starts later."
                str = str + "<br><br>Cost: 1e90 Memories<br>1750 Light Tachyons"
                return str;
            },
            unlocked() { return true },
            style: { height: '130px', width: '130px' },
            canAfford() {
                let a = player.mem.points.gte(1e90) && player.light.points.gte(1750)
                let b = this.revealed()
                return a && b && (layers['lethe'].BeaconLength() < tmp.lethe.nodeSlots)
            },
            pay() {
                player.mem.points = player.mem.points.sub(1e90);
                player.light.points = player.light.points.sub(1750);
            },
            effect() {
                let eff = player.light.points.plus(1).log10().div(2).max(1);
                return eff;
            },
        },
        23: {
            revealed() {
                return hasUpgrade("lethe", 33)
            },
            fullDisplay() {
                if (!this.revealed()) return "<b>Unrevealed</b>"
                let str = "<b>Monument of Light</b><br>Red dolls itself boosts L, M & its own gain."
                str = str + "<br><br>Cost: 5e65 Memories<br>900 Light Tachyons<br>28 Red Dolls"
                return str;
            },
            unlocked() { return true },
            style: { height: '130px', width: '130px' },
            canAfford() {
                let a = player.mem.points.gte(5e65) && player.light.points.gte(900) && player.kou.points.gte(28)
                let b = this.revealed()
                return a && b && (layers['lethe'].BeaconLength() < tmp.lethe.nodeSlots)
            },
            pay() {
                player.mem.points = player.mem.points.sub(5e65);
                player.light.points = player.light.points.sub(900)
                if (!hasAchievement('a', 53)) player.kou.points = player.kou.points.sub(28);
            },
            effect() {
                let eff = player.kou.points.div(1.5).max(1);
                return eff;
            },
        },
        24: {
            revealed() {
                return hasUpgrade("lethe", 33)
            },
            fullDisplay() {
                if (!this.revealed()) return "<b>Unrevealed</b>"
                let str = "<b>Joyful Memories</b><br>Memories boosts Red Dolls gain."
                str = str + "<br><br>Cost: 1e90 Memories<br>42 Red Dolls"
                return str;
            },
            unlocked() { return true },
            style: { height: '130px', width: '130px' },
            canAfford() {
                let a = player.mem.points.gte(1e90) && player.kou.points.gte(42)
                let b = this.revealed()
                return a && b && (layers['lethe'].BeaconLength() < tmp.lethe.nodeSlots)
            },
            pay() {
                player.mem.points = player.mem.points.sub(1e90);
                if (!hasAchievement('a', 53)) player.kou.points = player.kou.points.sub(42)
            },
            effect() {
                let eff = player.points.plus(1).log10().max(1).div(100).plus(1);
                return eff;
            },
        },
        25: {
            revealed() {
                return hasUpgrade("lethe", 14) || hasUpgrade("lethe", 15) || hasUpgrade("lethe", 24) || hasUpgrade("lethe", 34) || hasUpgrade("lethe", 35)
            },
            fullDisplay() {
                if (!this.revealed()) return "<b>Unrevealed</b>"
                let str = "<b>Joyful-Black Synergy</b><br>Red Dolls itself boosts Dark Matters effect."
                str = str + "<br><br>Cost: 70 Red Dolls<br>5e22x Dark Matters effect"
                return str;
            },
            unlocked() { return hasUpgrade("kou", 22) || hasMilestone("axium", 1) },
            style: { height: '130px', width: '130px' },
            canAfford() {
                let a = player.kou.points.gte(70) && tmp['dark'].effect.gte(5e22)
                let b = this.revealed()
                return a && b && (layers['lethe'].BeaconLength() < tmp.lethe.nodeSlots)
            },
            pay() {
                if (!hasAchievement('a', 53)) player.kou.points = player.kou.points.sub(70);
            },
            effect() {
                let eff = player.kou.points.div(2).max(1);
                return eff;
            },
        },
        31: {
            revealed() {
                return hasUpgrade("lethe", 21) || hasUpgrade("lethe", 22) || hasUpgrade("lethe", 32) || hasUpgrade("lethe", 41) || hasUpgrade("lethe", 52)
            },
            fullDisplay() {
                if (!this.revealed()) return "<b>Unrevealed</b>"
                let str = "<b>The Flashing Rift</b><br>Forgotten Drops effects Light Tachyons effect."
                str = str + "<br><br>Cost: 5000 Light Tachyons<br>1e65 Forgotten Drops"
                return str;
            },
            unlocked() { return hasUpgrade("kou", 22) || hasMilestone("axium", 1) },
            style: { height: '130px', width: '130px' },
            canAfford() {
                let a = player.lethe.points.gte(1e65) && player.light.points.gte(5000)
                let b = this.revealed()
                return a && b && (layers['lethe'].BeaconLength() < tmp.lethe.nodeSlots)
            },
            pay() {
                player.light.points = player.light.points.sub(5000);
                player.lethe.points = player.lethe.points.sub(1e65);
            },
            effect() {
                let eff = layers['lethe'].effect();
                return eff;
            },
        },
        32: {
            revealed() {
                return hasUpgrade("lethe", 33)
            },
            fullDisplay() {
                if (!this.revealed()) return "<b>Unrevealed</b>"
                let str = "<b>Remote Light Memories</b><br>Forgotten Drops effects Light Tachyons & Memories gain."
                str = str + "<br><br>Cost: 5e65 Memories<br>900 Light Tachyon<br>5e21 Forgotten Drops"
                return str;
            },
            unlocked() { return true },
            style: { height: '130px', width: '130px' },
            canAfford() {
                let a = player.mem.points.gte(5e65) && player.light.points.gte(900) && player.lethe.points.gte(5e21)
                let b = this.revealed()
                return a && b && (layers['lethe'].BeaconLength() < tmp.lethe.nodeSlots)
            },
            pay() {
                player.mem.points = player.mem.points.sub(5e65);
                player.light.points = player.light.points.sub(900)
                player.lethe.points = player.lethe.points.sub(5e21);
            },
            effect() {
                let eff = layers['lethe'].effect();
                return eff;
            },
        },
        33: {
            fullDisplay() {
                let str = "<b>Memorize</b><br>Make Memories gain After softcap's exponent +0.08."
                str = str + "<br><br>Cost: 1e60 Memories"
                return str;
            },
            unlocked() { return true },
            style: { height: '130px', width: '130px' },
            canAfford() {
                let a = player.mem.points.gte(1e60);
                return a && (layers['lethe'].BeaconLength() < tmp.lethe.nodeSlots)
            },
            pay() {
                player.mem.points = player.mem.points.sub(1e60);
            },
        },
        34: {
            revealed() {
                return hasUpgrade("lethe", 33)
            },
            fullDisplay() {
                if (!this.revealed()) return "<b>Unrevealed</b>"
                let str = "<b>Monument of Dark</b><br>When you have less D than L, Red doll effects M & D gain with an increased rate."
                str = str + "<br><br>Cost: 5e65 Memories<br>800 Dark Matters<br>28 Red Dolls"
                return str;
            },
            unlocked() { return true },
            style: { height: '130px', width: '130px' },
            canAfford() {
                let a = player.mem.points.gte(5e65) && player.dark.points.gte(800) && player.kou.points.gte(28)
                let b = this.revealed()
                return a && b && (layers['lethe'].BeaconLength() < tmp.lethe.nodeSlots)
            },
            pay() {
                player.mem.points = player.mem.points.sub(5e65);
                player.dark.points = player.dark.points.sub(800)
                if (!hasAchievement('a', 53)) player.kou.points = player.kou.points.sub(28);
            },
            effect() {
                if (player.light.points.lte(player.dark.points)) return new Decimal(1);
                return layers['kou'].effect().pow(2.5);
            },
        },
        35: {
            revealed() {
                return hasUpgrade("lethe", 24) || hasUpgrade("lethe", 25) || hasUpgrade("lethe", 34) || hasUpgrade("lethe", 44) || hasUpgrade("lethe", 45)
            },
            fullDisplay() {
                if (!this.revealed()) return "<b>Unrevealed</b>"
                let str = "<b>The Tower of Darkness</b><br>Red Dolls effects Dark Matters effect at an increased rate."
                str = str + "<br><br>Cost: 4500 Dark Matters<br>55 Red Dolls"
                return str;
            },
            unlocked() { return hasUpgrade("kou", 22) || hasMilestone("axium", 1) },
            style: { height: '130px', width: '130px' },
            canAfford() {
                let a = player.dark.points.gte(4500) && player.kou.points.gte(55)
                let b = this.revealed()
                return a && b && (layers['lethe'].BeaconLength() < tmp.lethe.nodeSlots)
            },
            pay() {
                player.dark.points = player.dark.points.sub(4500);
                if (!hasAchievement('a', 53)) player.kou.points = player.kou.points.sub(55);
            },
            effect(){
                return layers['kou'].effect().pow(1.5);
            },
        },
        41: {
            revealed() {
                return hasUpgrade("lethe", 31) || hasUpgrade("lethe", 32) || hasUpgrade("lethe", 42) || hasUpgrade("lethe", 51) || hasUpgrade("lethe", 52)
            },
            fullDisplay() {
                if (!this.revealed()) return "<b>Unrevealed</b>"
                let str = "<b>Forgotten-White Synergy</b><br>Forgotten Drops itself boosts Light Tachyon effect."
                str = str + "<br><br>Cost: 1e97 Forgotten Drops<br>Req: 1e25 Light Tachyons effect"
                return str;
            },
            unlocked() { return hasUpgrade("kou", 22) || hasMilestone("axium", 1) },
            style: { height: '130px', width: '130px' },
            canAfford() {
                let a = player.lethe.points.gte(1e97) && tmp['light'].effect.gte(1e25)
                let b = this.revealed()
                return a && b && (layers['lethe'].BeaconLength() < tmp.lethe.nodeSlots)
            },
            pay() {
                player.lethe.points = player.lethe.points.sub(1e97);
            },
            effect() {
                let eff = player[this.layer].points.plus(1).log10().div(2).max(1);
                return eff;
            },
        },
        42: {
            revealed() {
                return hasUpgrade("lethe", 33)
            },
            fullDisplay() {
                if (!this.revealed()) return "<b>Unrevealed</b>"
                let str = "<b>Forgotten Memories</b><br>Memories boosts Forgotten Drops gain."
                str = str + "<br><br>Cost: 1e90 Memories<br>1e40 Forgotten Drops"
                return str;
            },
            unlocked() { return true },
            style: { height: '130px', width: '130px' },
            canAfford() {
                let a = player.mem.points.gte(1e90) && player.lethe.points.gte(1e40)
                let b = this.revealed()
                return a && b && (layers['lethe'].BeaconLength() < tmp.lethe.nodeSlots)
            },
            pay() {
                player.mem.points = player.mem.points.sub(1e90);
                player.lethe.points = player.lethe.points.sub(1e40);
            },
            effect() {
                let eff = player.mem.points.plus(1).log10().max(1);
                return eff;
            },
        },
        43: {
            revealed() {
                return hasUpgrade("lethe", 33)
            },
            fullDisplay() {
                if (!this.revealed()) return "<b>Unrevealed</b>"
                let str = "<b>Remote Dark Memories</b><br>Forgotten Drops effects D & M gain."
                str = str + "<br><br>Cost: 5e65 Memories<br>800 Dark Matters<br>5e21 Forgotten Drops"
                return str;
            },
            unlocked() { return true },
            style: { height: '130px', width: '130px' },
            canAfford() {
                let a = player.mem.points.gte(5e65) && player.dark.points.gte(800) && player.lethe.points.gte(5e21)
                let b = this.revealed()
                return a && b && (layers['lethe'].BeaconLength() < tmp.lethe.nodeSlots)
            },
            pay() {
                player.mem.points = player.mem.points.sub(5e65);
                player.dark.points = player.dark.points.sub(800)
                player.lethe.points = player.lethe.points.sub(5e21);
            },
            effect() {
                let eff = layers['lethe'].effect();
                return eff;
            },
        },
        44: {
            revealed() {
                return hasUpgrade("lethe", 33)
            },
            fullDisplay() {
                if (!this.revealed()) return "<b>Unrevealed</b>"
                let str = "<b>Dark Memories</b><br>Memories gain is boosted when under e(DM/10)."
                str = str + "<br><br>Cost: 1e90 Memories<br>1500 Dark Matters"
                return str;
            },
            unlocked() { return true },
            style: { height: '130px', width: '130px' },
            canAfford() {
                let a = player.mem.points.gte(1e90) && player.dark.points.gte(1500)
                let b = this.revealed()
                return a && b && (layers['lethe'].BeaconLength() < tmp.lethe.nodeSlots)
            },
            pay() {
                player.mem.points = player.mem.points.sub(1e90);
                player.dark.points = player.dark.points.sub(1500);
            },
            effect() {
                let eff = player.dark.points.div(20).max(1);
                let lmt = player.dark.points.div(10);
                lmt = Decimal.pow(10, lmt);
                if (player.mem.points.gte(lmt)) eff = new Decimal(1);
                return eff;
            },
        },
        45: {
            revealed() {
                return hasUpgrade("lethe", 34) || hasUpgrade("lethe", 35) || hasUpgrade("lethe", 44) || hasUpgrade("lethe", 54) || hasUpgrade("lethe", 55)
            },
            fullDisplay() {
                if (!this.revealed()) return "<b>Unrevealed</b>"
                let str = "<b>Dark-Red Synergy</b><br>Dark Matters itself boosts Red Dolls effect."
                str = str + "<br><br>Cost: 8000 Dark Matters<br>Req: 15x Red Dolls effect"
                return str;
            },
            unlocked() { return hasUpgrade("kou", 22) || hasMilestone("axium", 1) },
            style: { height: '130px', width: '130px' },
            canAfford() {
                let a = player.dark.points.gte(8000) && tmp['kou'].effect.gte(15)
                let b = this.revealed()
                return a && b && (layers['lethe'].BeaconLength() < tmp.lethe.nodeSlots)
            },
            pay() {
                player.dark.points = player.dark.points.sub(8000);
            },
            effect() {
                let eff = player.dark.points.plus(1).log10().div(2).max(1);
                return eff;
            },
        },
        51: {
            revealed() {
                return hasUpgrade("lethe", 41) || hasUpgrade("lethe", 42) || hasUpgrade("lethe", 52)
            },
            fullDisplay() {
                if (!this.revealed()) return "<b>Unrevealed</b>"
                let str = "<b>Yellow Beacon</b><br>Forgotten Drops effect increases based on its reset time."
                str = str + "<br><br>Cost: 5e55 Forgotten Drops"
                return str;
            },
            unlocked() { return hasUpgrade("kou", 22) || hasMilestone("axium", 1) },
            style: { height: '130px', width: '130px' },
            canAfford() {
                let a = player.lethe.points.gte(5e55)
                let b = this.revealed()
                return a && b && (layers['lethe'].BeaconLength() < tmp.lethe.nodeSlots)
            },
            pay() {
                player.lethe.points = player.lethe.points.sub(5e55);
            },
            effect() {
                let eff = Decimal.log10(player[this.layer].resetTime + 1).plus(1).sqrt();
                return eff;
            },
        },
        52: {
            revealed() {
                return hasUpgrade("lethe", 41) || hasUpgrade("lethe", 42) || hasUpgrade("lethe", 43) || hasUpgrade("lethe", 51) || hasUpgrade("lethe", 53)
            },
            fullDisplay() {
                if (!this.revealed()) return "<b>Unrevealed</b>"
                let str = "<b>Forgotten-Black Synergy</b><br>Forgotten Drops itself boosts Dark Matters effect."
                str = str + "<br><br>Cost: 1e97 Forgotten Drops<br>Req: 5e22 Dark Matters effect"
                return str;
            },
            unlocked() { return hasUpgrade("kou", 22) || hasMilestone("axium", 1) },
            style: { height: '130px', width: '130px' },
            canAfford() {
                let a = player.lethe.points.gte(1e97) && tmp['dark'].effect.gte(5e22)
                let b = this.revealed()
                return a && b && (layers['lethe'].BeaconLength() < tmp.lethe.nodeSlots)
            },
            pay() {
                player.lethe.points = player.lethe.points.sub(1e97);
            },
            effect() {
                let eff = player[this.layer].points.plus(1).log10().div(2).max(1);
                return eff;
            },
        },
        53: {
            revealed() {
                return hasUpgrade("lethe", 42) || hasUpgrade("lethe", 43) || hasUpgrade("lethe", 44) || hasUpgrade("lethe", 52) || hasUpgrade("lethe", 54)
            },
            fullDisplay() {
                if (!this.revealed()) return "<b>Unrevealed</b>"
                let str = "<b>The Deep Rift</b><br>Forgotten Drops effects Dark Matters effect."
                str = str + "<br><br>Cost: 4500 Dark Matters<br>1e65 Forgotten Drops"
                return str;
            },
            unlocked() { return hasUpgrade("kou", 22) || hasMilestone("axium", 1) },
            style: { height: '130px', width: '130px' },
            canAfford() {
                let a = player.dark.points.gte(4500) && player.lethe.points.gte(1e65)
                let b = this.revealed()
                return a && b && (layers['lethe'].BeaconLength() < tmp.lethe.nodeSlots)
            },
            pay() {
                player.dark.points = player.dark.points.sub(4500);
                player.lethe.points = player.lethe.points.sub(1e65);
            },
            effect() {
                let eff = layers['lethe'].effect();
                return eff;
            },
        },
        54: {
            revealed() {
                return hasUpgrade("lethe", 43) || hasUpgrade("lethe", 44) || hasUpgrade("lethe", 45) || hasUpgrade("lethe", 53) || hasUpgrade("lethe", 55)
            },
            fullDisplay() {
                if (!this.revealed()) return "<b>Unrevealed</b>"
                let str = "<b>Dark-Yellow Synergy</b><br>Dark Matters itself boosts Forgotten Drops effect."
                str = str + "<br><br>Cost: 8000 Dark Matters<br>Req: 350x Forgotten Drops effect"
                return str;
            },
            unlocked() { return hasUpgrade("kou", 22) || hasMilestone("axium", 1) },
            style: { height: '130px', width: '130px' },
            canAfford() {
                let a = player.dark.points.gte(8000) && tmp['lethe'].effect.gte(350)
                let b = this.revealed()
                return a && b && (layers['lethe'].BeaconLength() < tmp.lethe.nodeSlots)
            },
            pay() {
                player.dark.points = player.dark.points.sub(8000);
            },
            effect() {
                let eff = player.dark.points.plus(1).log10().div(2).max(1);
                return eff;
            },
        },
        55: {
            revealed() {
                return hasUpgrade("lethe", 44) || hasUpgrade("lethe", 45) || hasUpgrade("lethe", 54)
            },
            fullDisplay() {
                if (!this.revealed()) return "<b>Unrevealed</b>"
                let str = "<b>Black Beacon</b><br>Dark Matters effect is boosted by Achievements."
                str = str + "<br><br>Cost: 2250 Dark Matters"
                return str;
            },
            unlocked() { return hasUpgrade("kou", 22) || hasMilestone("axium", 1) },
            style: { height: '130px', width: '130px' },
            canAfford() {
                let a = player.dark.points.gte(2250)
                let b = this.revealed()
                return a && b && (layers['lethe'].BeaconLength() < tmp.lethe.nodeSlots)
            },
            pay() {
                player.dark.points = player.dark.points.sub(2250);
            },
            effect() {
                let eff = player.a.achievements.length / 4;
                if (eff < 1) return 1;
                return eff;
            },
        },
    },
})