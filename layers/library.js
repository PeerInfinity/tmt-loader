addLayer("lib", {
    name: "Library", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "LI", // This appears on the layer's node. Default is the id with the first letter capitalized
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            auto: false,
            demile: [],
            liblevel: { // 书架等级
                ilith: new Decimal(0),
                shirabe: new Decimal(0),
                ayu: new Decimal(0),
                summer: new Decimal(0),
                winter: new Decimal(0),
                sia: new Decimal(0),
                mir: new Decimal(0),
                nami: new Decimal(0),
                vita: new Decimal(0),
                amane: new Decimal(0),
                aichan: new Decimal(0),
            },
            libcontrol: { // 只是返回书架是否打开，无其他作用
                ilith: false,
                shirabe: false,
                ayu: false,
                summer: false,
                winter: false,
                sia: false,
                mir: false,
                nami: false,
                vita: false,
                amane: false,
                aichan: false,
            },
        }},
    color: "#72e0fd",
    requires: new Decimal(1e53), // Can be a function that takes requirement increases into account
    resource: "Library Keys", // Name of prestige currency
    baseResource: "Research Power", // Name of resource prestige is based on
    baseAmount() { return player.lab.power }, // Get the current amount of baseResource

    row: 5,
    displayRow: 5,
    position:2, 
    branches: ["lab"],
    hotkeys: [
        { key: "K", description: "Shift+K: Reset for Library Keys", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    layerShown() { return hasUpgrade('storylayer', 35) },


    type: "custom",
    exponent: 0.1,
    base: 2,

    getResetGain() {
        let getmax = player.lab.power.div(layers.lib.gainMult()).log(this.requires).pow(1 / this.exponent);
        //if (hasMilestone('lib',7)) getmax = getmax.times(layers.lib.libEffect().Aus())
        return getmax.sub(player.lib.total).floor().max(0);
    },

    getNextAt(canMax = true) {
        return Decimal.pow(this.requires, (Decimal.pow(player.lab.power.div(layers.lib.gainMult()).log(this.requires).pow(1 / this.exponent).floor().max(0).max(player.lib.total).plus(1), this.exponent))).times(layers.lib.gainMult())
    },
    canReset() {
        return player.lab.power.gte(Decimal.pow(this.requires, (Decimal.pow(player[this.layer].total.plus(1), this.exponent))).times(layers.lib.gainMult()))
    },
    prestigeButtonText() {
        let des = "";
        if (canReset('lib')) des += "Reset for +" + formatWhole(this.getResetGain()) + " Library Keys<br>"
        des += "Next At: " + format(player.lab.power) + "/" + format(getNextAt(this.layer)) + " Research Power";
        return des;
    },
    prestigeNotify() {
        if (!canReset('lib')) return false;
        else return true;
    },

    gainMult() {
        let gm = new Decimal(1);
        //gm = gm.div(layers.lib.libEffect().Nor());
        //if (hasAchievement('a', 112)) gm = gm.div(achievementEffect('a', 112));
        //if (hasAchievement('lab', 33)) gm = gm.div(achievementEffect('lab', 33));
        //if (hasMilestone('lib', 7)) gm = gm.div(layers.lib.libEffect().Aus())
        //if (hasUpgrade('lib',34)) gm = gm.div(upgradeEffect('lib',34));
        //if (player['tempest'].grid[303].activated) gm = gm.div(gridEffect('tempest',303))
        //if (hasUpgrade('lib',46)) gm = gm.div(upgradeEffect('lib',46));
        return gm;
    },
    gainExp() {
        return new Decimal(1)
    },

    milestones: {
        0: {
            requirementDescription: "1 Library Key",
            done() { return player.lib.total.gte(1) },
            unlocked() { return player.lib.unlocked },
            effectDescription: "Keep G & K's milestones and Unlock Ambitious Shelf.",
        },
        1: {
            requirementDescription: "2 Library Keys",
            done() { return player.lib.total.gte(2) },
            unlocked() { return player.lib.unlocked },
            effectDescription: "Keep G's upgrades & K's Memory Adjustments and Unlock Scarlet & Colorful Shelf.",
        },
        2: {
            requirementDescription: "3 Library Keys",
            done() { return player.lib.total.gte(3) },
            unlocked() { return player.lib.unlocked },
            effectDescription: "Gain 10% of G's gain every second & You can buy max K and Unlock Summer & Winter Shelf.",
        },
        3: {
            requirementDescription: "4 Library Keys",
            done() { return player.lib.total.gte(4) },
            unlocked() { return player.lib.unlocked },
            effectDescription: "Unused Institution Funds boosts Frag and Unlock Symmetric Shelf.",
        },
        4: {
            requirementDescription: "5 Library Keys",
            done() { return player.lib.total.gte(5) },
            unlocked() { return player.lib.unlocked },
            effectDescription: "Keep Star & Moon Points and Unlock Obsidian & Astral Shelf.",
        },
        5: {
            requirementDescription: "6 Library Keys",
            done() { return player.lib.total.gte(6) },
            unlocked() { return player.lib.unlocked },
            effectDescription: "K Resets nothing & Unlock Cyber & Rhythm Shelf.",
        },
        6: {
            requirementDescription: "10 Library Keys",
            done() { return player.lib.total.gte(10) },
            unlocked() { return player.lib.unlocked },
            effectDescription: "Star/Moon Point gain at their max speed & Unlock Cycle Shelf.",
        },
        7: {
            requirementDescription: "100 Library Keys",
            done() { return player.lib.total.gte(10) },
            unlocked() { return player.lib.unlocked },
            effectDescription: "Research Transformers' autobuyers can buy in a bulk.",
        },
        
    },
    milestonePopups(){
        return true;
    },

    libEffect() {
        return {
            ilith() {
                if (player.lib.liblevel.ilith.lte(0)) return new Decimal(1);
                let eff = Decimal.pow(4, player.lib.liblevel.ilith);
                return eff;
            },
            ayu() {
                if (player.lib.liblevel.ayu.lte(0)) return new Decimal(1);
                let eff = Decimal.pow(200, player.lib.liblevel.ayu.max(1).log(1.5).plus(1));
                return eff.max(1);
            },
            shirabe() {
                if (player.lib.liblevel.shirabe.lte(0)) return new Decimal(1);
                let eff = Decimal.pow(200, player.lib.liblevel.shirabe.max(1).log(1.5).plus(1));
                return eff.max(1);
            },
            summer() {
                if (player.lib.liblevel.summer.lte(0)) return new Decimal(1);
                let eff = Decimal.pow(100, player.lib.liblevel.summer.max(1).log(1.5).plus(1));
                return eff.max(1);
            },
            winter() {
                if (player.lib.liblevel.winter.lte(0)) return new Decimal(1);
                let eff = Decimal.pow(100, player.lib.liblevel.winter.max(1).log(1.5).plus(1));
                return eff.max(1);
            },
            sia() {
                if (player.lib.liblevel.winter.lte(0)) return new Decimal(1);
                let eff = Decimal.pow(100, player.lib.liblevel.winter.max(1).log(1.5).plus(1));
                return eff.max(1);
            },
        }
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
        "Bookshelves": {
            unlocked() { return player.lib.unlocked },
            content: [
                "main-display",
                "blank",
                "prestige-button",
                "resource-display",
                "blank",
                "clickables"]
        },
    },

    clickables:{
        //第一批 依莉丝
        11:{
            unlocked() { return hasMilestone('lib', 0) },
            title: "<h2>Ambitious Shelf</h2>",
            display() {
                return "<br><h3>Current Level: " + formatWhole(player.lib.liblevel.ilith) + "</h3><br>Level up cost: " + formatWhole(player.lib.liblevel.ilith.plus(1)) + " Library Keys"
            },
            style: {
                "width": "660px",
                "height": "100px",
                "min-height": "70px",
                "color": "rgba(143, 16, 20, 1)",
                "background-color": "rgba(143, 16, 20, 0.1)",
                "border-color": "rgba(143, 16, 20, 1)",
                "border-radius": "0px",
                "border-width": "2px",
                "margin": "1px",
                "margin-top": "10px", },
            onClick() {
                player.lib.libcontrol.ilith = !player.lib.libcontrol.ilith;
            },
            canClick() { return this.unlocked },
        },
        21:{
            unlocked() { return player.lib.libcontrol.ilith },
            title: "Lock on this Level",
            style: {
                "width": "90px",
                "height": "90px",
                "min-height": "70px",
                "background-color"() { return (layers.lib.clickables[21].canClick()?"rgba(114, 224, 253, 0.1)":"rgba(102, 102, 102, 0.1)")},
                "color"() { return (layers.lib.clickables[21].canClick()?"rgba(114, 224, 253, 1)":"rgba(102, 102, 102, 1)")},
                "border-color"() { return (layers.lib.clickables[21].canClick()?"rgba(114, 224, 253, 1)":"rgba(102, 102, 102, 1)")},
                "margin-left": "-6px",
                "margin-right": "-6px",
                "margin-top": "3px",
                "border-radius": "0px",
                "border-width": "2px", },
            onClick() {
                player.lib.liblevel.ilith = player.lib.liblevel.ilith.plus(-1)
                player.lib.points = player.lib.points.plus(player.lib.liblevel.ilith.plus(1))
            },
            canClick() {
                return player.lib.liblevel.ilith.gt(0)
            },
        },
        22:{
            unlocked() { return player.lib.libcontrol.ilith },
            title: "Current Effect",
            display() {
                let str = "<br>"
                str += "Boost Research Point & Power gain by " + format(layers.lib.libEffect().ilith()) + "x"
                return str
            },
            style: {
                "width": "476px",
                "height": "90px",
                "min-height": "70px",
                "margin-left": "-6px",
                "margin-right": "-6px",
                "margin-top": "3px",
                "padding-left": "10px",
                "color": "rgba(114, 224, 253, 1)",
                "background-color": "rgba(114, 224, 253, 0.1)",
                "border-color": "rgba(114, 224, 253, 1)",
                "border-radius": "0px",
                "border-width": "2px",
                "text-align": "left" },
        },
        23:{
            unlocked() { return player.lib.libcontrol.ilith },
            title: "Unlock a New Level",
            style: {
                "width": "90px",
                "height": "90px",
                "min-height": "70px",
                "background-color"() { return (layers.lib.clickables[23].canClick()?"rgba(114, 224, 253, 0.1)":"rgba(102, 102, 102, 0.1)")},
                "color"() { return (layers.lib.clickables[23].canClick()?"rgba(114, 224, 253, 1)":"rgba(102, 102, 102, 1)")},
                "border-color"() { return (layers.lib.clickables[23].canClick()?"rgba(114, 224, 253, 1)":"rgba(102, 102, 102, 1)")},
                "margin-left": "-6px",
                "margin-right": "-6px",
                "margin-top": "3px",
                "border-radius": "0px",
                "border-width": "2px", },
            onClick() {
                player.lib.liblevel.ilith = player.lib.liblevel.ilith.plus(1)
                player.lib.points = player.lib.points.sub(player.lib.liblevel.ilith)
            },
            canClick() {
                return player.lib.liblevel.ilith.lt(10) && player.lib.points.gte(player.lib.liblevel.ilith.plus(1))
            },
        },
        //第二批 调+彩梦
        31:{
            unlocked() { return hasMilestone('lib', 1) },
            title: "<h2>Scarlet Shelf</h2>",
            display() {
                return "<br><h3>Current Level: " + formatWhole(player.lib.liblevel.shirabe) + "</h3><br>Level up cost: " + formatWhole(player.lib.liblevel.shirabe.plus(1)) + " Library Keys"
            },
            style: {
                "width": "660px",
                "height": "100px",
                "min-height": "70px",
                "color": "rgba(255, 129, 133, 1)",
                "background-color": "rgba(255, 129, 133, 0.1)",
                "border-color": "rgba(255, 129, 133, 1)",
                "border-radius": "0px",
                "border-width": "2px",
                "margin": "1px",
                "margin-top": "10px", },
            onClick() {
               player.lib.libcontrol.shirabe = !player.lib.libcontrol.shirabe;
            },
            canClick() { return this.unlocked },
        },
        41:{
            unlocked() { return player.lib.libcontrol.shirabe },
            title: "Lock on this Level",
            style: {
                "width": "90px",
                "height": "90px",
                "min-height": "70px",
                "background-color"() { return (layers.lib.clickables[41].canClick()?"rgba(114, 224, 253, 0.1)":"rgba(102, 102, 102, 0.1)")},
                "color"() { return (layers.lib.clickables[41].canClick()?"rgba(114, 224, 253, 1)":"rgba(102, 102, 102, 1)")},
                "border-color"() { return (layers.lib.clickables[41].canClick()?"rgba(114, 224, 253, 1)":"rgba(102, 102, 102, 1)")},
                "margin-left": "-6px",
                "margin-right": "-6px",
                "margin-top": "3px",
                "border-radius": "0px",
                "border-width": "2px", },
            onClick() {
                player.lib.liblevel.shirabe = player.lib.liblevel.shirabe.plus(-1)
                player.lib.points = player.lib.points.plus(player.lib.liblevel.shirabe.plus(1))
            },
            canClick() {
                return player.lib.liblevel.shirabe.gt(0)
            },
        },
        42:{
            unlocked() { return player.lib.libcontrol.shirabe },
            title: "Current Effect",
            display() {
                let str = "<br>"
                str += "Boost Dark Matters, Forgotten Drops, Flourish Labyrinth, Everflashing Knives gain and Maze Effects by " + format(layers.lib.libEffect().shirabe()) + "x"
                return str
            },
            style: {
                "width": "476px",
                "height": "90px",
                "min-height": "70px",
                "margin-left": "-6px",
                "margin-right": "-6px",
                "margin-top": "3px",
                "padding-left": "10px",
                "color": "rgba(114, 224, 253, 1)",
                "background-color": "rgba(114, 224, 253, 0.1)",
                "border-color": "rgba(114, 224, 253, 1)",
                "border-radius": "0px",
                "border-width": "2px",
                "text-align": "left" },
        },
        43:{
            unlocked() { return player.lib.libcontrol.shirabe },
            title: "Unlock a New Level",
            style: {
                "width": "90px",
                "height": "90px",
                "min-height": "70px",
                "background-color"() { return (layers.lib.clickables[43].canClick()?"rgba(114, 224, 253, 0.1)":"rgba(102, 102, 102, 0.1)")},
                "color"() { return (layers.lib.clickables[43].canClick()?"rgba(114, 224, 253, 1)":"rgba(102, 102, 102, 1)")},
                "border-color"() { return (layers.lib.clickables[43].canClick()?"rgba(114, 224, 253, 1)":"rgba(102, 102, 102, 1)")},
                "margin-left": "-6px",
                "margin-right": "-6px",
                "margin-top": "3px",
                "border-radius": "0px",
                "border-width": "2px", },
            onClick() {
                player.lib.liblevel.shirabe = player.lib.liblevel.shirabe.plus(1)
                player.lib.points = player.lib.points.sub(player.lib.liblevel.shirabe)
            },
            canClick() {
                return player.lib.liblevel.shirabe.lt(10) && player.lib.points.gte(player.lib.liblevel.shirabe.plus(1))
            },
        },
        51:{
            unlocked() { return hasMilestone('lib', 1) },
            title: "<h2>Colorful Shelf</h2>",
            display() {
                return "<br><h3>Current Level: " + formatWhole(player.lib.liblevel.ayu) + "</h3><br>Level up cost: " + formatWhole(player.lib.liblevel.ayu.plus(1)) + " Library Keys"
            },
            style: {
                "width": "660px",
                "height": "100px",
                "min-height": "70px",
                "color": "rgba(99, 225, 187, 1)",
                "background-color": "rgba(99, 225, 187, 0.1)",
                "border-color": "rgba(99, 225, 187, 1)",
                "border-radius": "0px",
                "border-width": "2px",
                "margin": "1px",
                "margin-top": "10px", },
                onClick() {
                    player.lib.libcontrol.ayu = !player.lib.libcontrol.ayu;
                },
                canClick() { return this.unlocked },
        },
        61:{
            unlocked() { return player.lib.libcontrol.ayu },
            title: "Lock on this Level",
            style: {
                "width": "90px",
                "height": "90px",
                "min-height": "70px",
                "background-color"() { return (layers.lib.clickables[61].canClick()?"rgba(114, 224, 253, 0.1)":"rgba(102, 102, 102, 0.1)")},
                "color"() { return (layers.lib.clickables[61].canClick()?"rgba(114, 224, 253, 1)":"rgba(102, 102, 102, 1)")},
                "border-color"() { return (layers.lib.clickables[61].canClick()?"rgba(114, 224, 253, 1)":"rgba(102, 102, 102, 1)")},
                "margin-left": "-6px",
                "margin-right": "-6px",
                "margin-top": "3px",
                "border-radius": "0px",
                "border-width": "2px", },
            onClick() {
                player.lib.liblevel.ayu = player.lib.liblevel.ayu.plus(-1)
                player.lib.points = player.lib.points.plus(player.lib.liblevel.ayu.plus(1))
            },
            canClick() {
                return player.lib.liblevel.ayu.gt(0)
            },
        },
        62:{
            unlocked() { return player.lib.libcontrol.ayu },
            title: "Current Effect",
            display() {
                let str = "<br>"
                str += "Boost Light Tachyons, Red Dolls, Luminous Churches, Glowing Roses, Gemini Bounds gain by " + format(layers.lib.libEffect().ayu()) + "x"
                return str
            },
            style: {
                "width": "476px",
                "height": "90px",
                "min-height": "70px",
                "margin-left": "-6px",
                "margin-right": "-6px",
                "margin-top": "3px",
                "padding-left": "10px",
                "color": "rgba(114, 224, 253, 1)",
                "background-color": "rgba(114, 224, 253, 0.1)",
                "border-color": "rgba(114, 224, 253, 1)",
                "border-radius": "0px",
                "border-width": "2px",
                "text-align": "left" },
        },
        63:{
            unlocked() { return player.lib.libcontrol.ayu },
            title: "Unlock a New Level",
            style: {
                "width": "90px",
                "height": "90px",
                "min-height": "70px",
                "background-color"() { return (layers.lib.clickables[63].canClick()?"rgba(114, 224, 253, 0.1)":"rgba(102, 102, 102, 0.1)")},
                "color"() { return (layers.lib.clickables[63].canClick()?"rgba(114, 224, 253, 1)":"rgba(102, 102, 102, 1)")},
                "border-color"() { return (layers.lib.clickables[63].canClick()?"rgba(114, 224, 253, 1)":"rgba(102, 102, 102, 1)")},
                "margin-left": "-6px",
                "margin-right": "-6px",
                "margin-top": "3px",
                "border-radius": "0px",
                "border-width": "2px", },
            onClick() {
                player.lib.liblevel.ayu = player.lib.liblevel.ayu.plus(1)
                player.lib.points = player.lib.points.sub(player.lib.liblevel.ayu)
            },
            canClick() {
                return player.lib.liblevel.ayu.lt(10) && player.lib.points.gte(player.lib.liblevel.ayu.plus(1))
            },
        },
        //第三批 夏日 + 冬日
        71:{
            unlocked() { return hasMilestone('lib', 2) },
            title: "<h2>Summer Shelf</h2>",
            display() {
                return "<br><h3>Current Level: " + formatWhole(player.lib.liblevel.summer) + "</h3><br>Level up cost: " + formatWhole(player.lib.liblevel.summer.plus(1)) + " Library Keys"
            },
            style: {
                "width": "660px",
                "height": "100px",
                "min-height": "70px",
                "color": "rgba(93, 225, 255, 1)",
                "background": "rgba(93, 225, 255, 0.1)",
                "border-color": "rgba(93, 225, 255, 1)",
                "border-radius": "0px",
                "border-width": "2px",
                "margin": "1px",
                "margin-top": "10px", },
            onClick() {
               player.lib.libcontrol.summer = !player.lib.libcontrol.summer;
            },
            canClick() { return this.unlocked },
        },
        81:{
            unlocked() { return player.lib.libcontrol.summer },
            title: "Lock on this Level",
            style: {
                "width": "90px",
                "height": "90px",
                "min-height": "70px",
                "background-color"() { return (layers.lib.clickables[81].canClick()?"rgba(114, 224, 253, 0.1)":"rgba(102, 102, 102, 0.1)")},
                "color"() { return (layers.lib.clickables[81].canClick()?"rgba(114, 224, 253, 1)":"rgba(102, 102, 102, 1)")},
                "border-color"() { return (layers.lib.clickables[81].canClick()?"rgba(114, 224, 253, 1)":"rgba(102, 102, 102, 1)")},
                "margin-left": "-6px",
                "margin-right": "-6px",
                "margin-top": "3px",
                "border-radius": "0px",
                "border-width": "2px", },
            onClick() {
                player.lib.liblevel.summer = player.lib.liblevel.summer.plus(-1)
                player.lib.points = player.lib.points.plus(player.lib.liblevel.summer.plus(1))
            },
            canClick() {
                return player.lib.liblevel.summer.gt(0)
            },
        },
        82:{
            unlocked() { return player.lib.libcontrol.summer },
            title: "Current Effect",
            display() {
                let str = "<br>"
                str += "Boost Luminous Churches, Flourish Labyrith gain by " + format(layers.lib.libEffect().summer()) + "x"
                return str
            },
            style: {
                "width": "476px",
                "height": "90px",
                "min-height": "70px",
                "margin-left": "-6px",
                "margin-right": "-6px",
                "margin-top": "3px",
                "padding-left": "10px",
                "color": "rgba(114, 224, 253, 1)",
                "background-color": "rgba(114, 224, 253, 0.1)",
                "border-color": "rgba(114, 224, 253, 1)",
                "border-radius": "0px",
                "border-width": "2px",
                "text-align": "left" },
        },
        83:{
            unlocked() { return player.lib.libcontrol.summer },
            title: "Unlock a New Level",
            style: {
                "width": "90px",
                "height": "90px",
                "min-height": "70px",
                "background-color"() { return (layers.lib.clickables[83].canClick()?"rgba(114, 224, 253, 0.1)":"rgba(102, 102, 102, 0.1)")},
                "color"() { return (layers.lib.clickables[83].canClick()?"rgba(114, 224, 253, 1)":"rgba(102, 102, 102, 1)")},
                "border-color"() { return (layers.lib.clickables[83].canClick()?"rgba(114, 224, 253, 1)":"rgba(102, 102, 102, 1)")},
                "margin-left": "-6px",
                "margin-right": "-6px",
                "margin-top": "3px",
                "border-radius": "0px",
                "border-width": "2px", },
            onClick() {
                player.lib.liblevel.summer = player.lib.liblevel.summer.plus(1)
                player.lib.points = player.lib.points.sub(player.lib.liblevel.summer)
            },
            canClick() {
                return player.lib.liblevel.summer.lt(10) && player.lib.points.gte(player.lib.liblevel.summer.plus(1))
            },
        },
        91:{
            unlocked() { return hasMilestone('lib', 2) },
            title: "<h2>Winter Shelf</h2>",
            display() {
                return "<br><h3>Current Level: " + formatWhole(player.lib.liblevel.winter) + "</h3><br>Level up cost: " + formatWhole(player.lib.liblevel.winter.plus(1)) + " Library Keys"
            },
            style: {
                "width": "660px",
                "height": "100px",
                "min-height": "70px",
                "color": "rgba(253, 185, 255, 1)",
                "background-color": "rgba(253, 185, 255, 0.1)",
                "border-color": "rgba(253, 185, 255, 1)",
                "border-radius": "0px",
                "border-width": "2px",
                "margin": "1px",
                "margin-top": "10px", },
                onClick() {
                    player.lib.libcontrol.winter = !player.lib.libcontrol.winter;
                },
                canClick() { return this.unlocked },
        },
        101:{
            unlocked() { return player.lib.libcontrol.winter },
            title: "Lock on this Level",
            style: {
                "width": "90px",
                "height": "90px",
                "min-height": "70px",
                "background-color"() { return (layers.lib.clickables[101].canClick()?"rgba(114, 224, 253, 0.1)":"rgba(102, 102, 102, 0.1)")},
                "color"() { return (layers.lib.clickables[101].canClick()?"rgba(114, 224, 253, 1)":"rgba(102, 102, 102, 1)")},
                "border-color"() { return (layers.lib.clickables[101].canClick()?"rgba(114, 224, 253, 1)":"rgba(102, 102, 102, 1)")},
                "margin-left": "-6px",
                "margin-right": "-6px",
                "margin-top": "3px",
                "border-radius": "0px",
                "border-width": "2px", },
            onClick() {
                player.lib.liblevel.winter = player.lib.liblevel.winter.plus(-1)
                player.lib.points = player.lib.points.plus(player.lib.liblevel.winter.plus(1))
            },
            canClick() {
                return player.lib.liblevel.winter.gt(0)
            },
        },
        102:{
            unlocked() { return player.lib.libcontrol.winter },
            title: "Current Effect",
            display() {
                let str = "<br>"
                str += "Boost Red Dolls, Forgotten Drops, Gemini Bounds, Everflashing Knives gain by " + format(layers.lib.libEffect().winter()) + "x"
                return str
            },
            style: {
                "width": "476px",
                "height": "90px",
                "min-height": "70px",
                "margin-left": "-6px",
                "margin-right": "-6px",
                "margin-top": "3px",
                "padding-left": "10px",
                "color": "rgba(114, 224, 253, 1)",
                "background-color": "rgba(114, 224, 253, 0.1)",
                "border-color": "rgba(114, 224, 253, 1)",
                "border-radius": "0px",
                "border-width": "2px",
                "text-align": "left" },
        },
        103:{
            unlocked() { return player.lib.libcontrol.winter },
            title: "Unlock a New Level",
            style: {
                "width": "90px",
                "height": "90px",
                "min-height": "70px",
                "background-color"() { return (layers.lib.clickables[103].canClick()?"rgba(114, 224, 253, 0.1)":"rgba(102, 102, 102, 0.1)")},
                "color"() { return (layers.lib.clickables[103].canClick()?"rgba(114, 224, 253, 1)":"rgba(102, 102, 102, 1)")},
                "border-color"() { return (layers.lib.clickables[103].canClick()?"rgba(114, 224, 253, 1)":"rgba(102, 102, 102, 1)")},
                "margin-left": "-6px",
                "margin-right": "-6px",
                "margin-top": "3px",
                "border-radius": "0px",
                "border-width": "2px", },
            onClick() {
                player.lib.liblevel.winter = player.lib.liblevel.winter.plus(1)
                player.lib.points = player.lib.points.sub(player.lib.liblevel.winter)
            },
            canClick() {
                return player.lib.liblevel.winter.lt(10) && player.lib.points.gte(player.lib.liblevel.winter.plus(1))
            },
        },
        //第四批 兮娅
        111:{
            unlocked() { return hasMilestone('lib', 3) },
            title: "<h2>Symmetric Shelf</h2>",
            display() {
                return "<br><h3>Current Level: " + formatWhole(player.lib.liblevel.sia) + "</h3><br>Level up cost: " + formatWhole(player.lib.liblevel.sia.plus(1)) + " Library Keys"
            },
            style: {
                "width": "660px",
                "height": "100px",
                "min-height": "70px",
                "color": "rgba(147, 120, 172, 1)",
                "background": "rgba(147, 120, 172, 0.1)",
                "border-color": "rgba(147, 120, 172, 1)",
                "border-radius": "0px",
                "border-width": "2px",
                "margin": "1px",
                "margin-top": "10px", },
            onClick() {
               player.lib.libcontrol.sia = !player.lib.libcontrol.sia;
            },
            canClick() { return this.unlocked },
        },
        121:{
            unlocked() { return player.lib.libcontrol.sia },
            title: "Lock on this Level",
            style: {
                "width": "90px",
                "height": "90px",
                "min-height": "70px",
                "background-color"() { return (layers.lib.clickables[121].canClick()?"rgba(114, 224, 253, 0.1)":"rgba(102, 102, 102, 0.1)")},
                "color"() { return (layers.lib.clickables[121].canClick()?"rgba(114, 224, 253, 1)":"rgba(102, 102, 102, 1)")},
                "border-color"() { return (layers.lib.clickables[121].canClick()?"rgba(114, 224, 253, 1)":"rgba(102, 102, 102, 1)")},
                "margin-left": "-6px",
                "margin-right": "-6px",
                "margin-top": "3px",
                "border-radius": "0px",
                "border-width": "2px", },
            onClick() {
                player.lib.liblevel.sia = player.lib.liblevel.sia.plus(-1)
                player.lib.points = player.lib.points.plus(player.lib.liblevel.sia.plus(1))
            },
            canClick() {
                return player.lib.liblevel.sia.gt(0)
            },
        },
        122:{
            unlocked() { return player.lib.libcontrol.sia },
            title: "Current Effect",
            display() {
                let str = "<br>"
                str += "Boost Luminous Churches, Flourish Labyrith gain by " + format(layers.lib.libEffect().sia()) + "x"
                return str
            },
            style: {
                "width": "476px",
                "height": "90px",
                "min-height": "70px",
                "margin-left": "-6px",
                "margin-right": "-6px",
                "margin-top": "3px",
                "padding-left": "10px",
                "color": "rgba(114, 224, 253, 1)",
                "background-color": "rgba(114, 224, 253, 0.1)",
                "border-color": "rgba(114, 224, 253, 1)",
                "border-radius": "0px",
                "border-width": "2px",
                "text-align": "left" },
        },
        123:{
            unlocked() { return player.lib.libcontrol.sia },
            title: "Unlock a New Level",
            style: {
                "width": "90px",
                "height": "90px",
                "min-height": "70px",
                "background-color"() { return (layers.lib.clickables[123].canClick()?"rgba(114, 224, 253, 0.1)":"rgba(102, 102, 102, 0.1)")},
                "color"() { return (layers.lib.clickables[123].canClick()?"rgba(114, 224, 253, 1)":"rgba(102, 102, 102, 1)")},
                "border-color"() { return (layers.lib.clickables[123].canClick()?"rgba(114, 224, 253, 1)":"rgba(102, 102, 102, 1)")},
                "margin-left": "-6px",
                "margin-right": "-6px",
                "margin-top": "3px",
                "border-radius": "0px",
                "border-width": "2px", },
            onClick() {
                player.lib.liblevel.sia = player.lib.liblevel.sia.plus(1)
                player.lib.points = player.lib.points.sub(player.lib.liblevel.sia)
            },
            canClick() {
                return player.lib.liblevel.sia.lt(10) && player.lib.points.gte(player.lib.liblevel.sia.plus(1))
            },
        },
    },
})