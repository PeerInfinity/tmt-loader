addLayer("etoluna", {
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            starPoint: new Decimal(0),
            moonPoint: new Decimal(0),
            starbump: 0,
            moonbump: 0,
            allotted: 0.5,
            unlockOrder: 0,
            demile: [],
            deupg: [],
        }
    },

    name: "Gemini",
    symbol: "G",
    color() {return GlowingColor("#d7a9f4",10,"#bddfff")},
    resource: "Gemini Bounds",
    row: 4,
    //displayRow: 1,
    position: 1,
    hotkeys: [
        { key: "g", description: "G: Reset for Gemini Bounds", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    branches: ["kou"],

    baseResource: "World Steps",
    baseAmount() { return player.world.points },

    requires: new Decimal(5000),


    type: "normal",
    exponent: 0.5,

    gainMult() {
        let mult=new Decimal(1);
        if (hasMilestone('lib', 1)) mult = mult.times(layers.lib.libEffect().ayu());
        //if (player.lethe.buyables[21].unlocked) mult = mult.times(buyableEffect('lethe', 21));
        if(hasUpgrade('lethe',94)) mult = mult.times(upgradeEffect('lethe',94));
        if (hasMilestone('lib', 2)) mult = mult.times(layers.lib.libEffect().winter());
        //if (player['awaken'].current == 'zero'||player['awaken'].awakened.includes('zero')) mult = mult.times(tmp["zero"].challenges[11].effectAWtoGK); 
        return mult;
    },
    gainExp() {
        return new Decimal(1)
    },
    directMult() {
        let dm = new Decimal(1);
        if (inChallenge('kou', 61) || hasChallenge('kou', 61)) dm = dm.times(layers['saya'].effect());
        return dm;
    },

    effect() {
        let eff = player[this.layer].points.div(2).plus(1);
        if (hasAchievement('a', 102)) eff = player[this.layer].points.div(1.5).plus(1);
        if (hasChallenge('kou', 61)) eff = eff.times(layers['saya'].effect());
        if (hasUpgrade('lethe', 95)) eff = eff.times(upgradeEffect('lethe', 95));
        if (hasUpgrade('lethe', 104)) eff = eff.times(upgradeEffect('lethe', 104));
        if (hasUpgrade('lethe', 105)) eff = eff.times(upgradeEffect('lethe', 105));
        if (hasChallenge('kou', 91)) eff = eff.times(challengeEffect('kou', 91));

        //if (player.awaken.awakened.includes(this.layer)||player['awaken'].current==this.layer) eff = eff.pow(tmp[this.layer].BumpEffect)
        return eff;
    },
    effectDescription() {
        return "which are giving you the base speed of gaining Star Points/Moon Points of " + format(layers['etoluna'].effect()) + "/s"
    },

    layerShown() { return hasUpgrade('storylayer', 23) },
    passiveGeneration() {
        //if (layers['etoluna'].deactivated()) return 0;
        let pg = 0;
        if (hasMilestone('lib', 2)) pg += 0.1;
        return pg;
    },

    //AW通用相关
    /*deactivated() {
        let bol = false;
        bol = (player['awaken'].selectionActive && player['awaken'].current != null && player['awaken'].current != this.layer && !player['awaken'].awakened.includes(this.layer))
        if (bol) {
            if (player[this.layer].demile.length == 0) player[this.layer].demile = player[this.layer].milestones;
            if (player[this.layer].deupg.length == 0) player[this.layer].deupg = player[this.layer].upgrades;
        }
        else {
            if (player[this.layer].demile.length != 0) { player[this.layer].milestones = player[this.layer].demile; player[this.layer].demile = [] };
            if (player[this.layer].deupg.length != 0) { player[this.layer].upgrades = player[this.layer].deupg; player[this.layer].deupg = [] };
        }
        return bol;
    },
    marked() {
        if (player.awaken.awakened.includes(this.layer)) return true;
        else return false;
    },*/

    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone('lib', 0)) keep.push('milestones');
        if (hasMilestone('lib', 1)) keep.push('upgrades');
        if (hasMilestone('lib', 4)) { keep.push('starPoint'); keep.push('moonPoint'); }
        if (layers[resettingLayer].row > this.row) layerDataReset('etoluna', keep);
    },

    //Tower related
    gainstarPoints() {
        let gain = layers['etoluna'].effect().times(Decimal.pow(10, (player.etoluna.allotted * 2 - 1)));
        if (player.etoluna.allotted <= 0) {
            gain = layers['etoluna'].effect().times(0.1);
        }//break_eternity.js issue, can be solved by updating
        if (hasMilestone('lib', 6)) gain = layers['etoluna'].effect().times(Decimal.pow(10, 1));
        if (hasUpgrade('storylayer', 25)) gain = gain.times(player.etoluna.moonPoint.div(player.etoluna.starPoint.max(1)).max(1));
        //if (hasChallenge('kou', 81)) gain = gain.times(10);

        //AW
        //if (player['awaken'].selectionActive && player['awaken'].current != null && player['awaken'].current != this.layer && !player['awaken'].awakened.includes(this.layer)) return new Decimal(0);

        return gain;
    },

    starPointeffect() {//tmp
        let eff = player.etoluna.starPoint.plus(1).log(7.5).max(1);
        //if (player.ins.inslevel.Arg.gt(0)) eff = player.etoluna.starPoint.plus(player.etoluna.moonPoint.pow(layers.ins.insEffect().Arg())).plus(1).log(7.5).max(1);
        if (hasUpgrade('etoluna', 23)) eff = eff.pow(1.25);
        //if (player['awaken'].current == 'axium'||player['awaken'].awakened.includes('axium')) eff = eff.times(tmp['axium'].AWeffect.NWeffect);

        //AW
        //if (player['awaken'].selectionActive && player['awaken'].current != null && player['awaken'].current != this.layer && !player['awaken'].awakened.includes(this.layer)) return new Decimal(1);

        return eff;
    },

    gainmoonPoints() {
        let gain = layers['etoluna'].effect().times(Decimal.pow(10, ((1 - player.etoluna.allotted) * 2 - 1)));
        if ((1 - player.etoluna.allotted) <= 0) {
            gain = layers['etoluna'].effect().times(0.1);
            if (inChallenge('kou', 81)) gain = gain.times(2).times(0.5 - player.etoluna.allotted);
        }//break_eternity.js issue, can be solved by updating
        if (hasMilestone('lib', 6)) gain = layers['etoluna'].effect().times(Decimal.pow(10, 1));
        if (hasUpgrade('storylayer', 25)) gain = gain.times(player.etoluna.starPoint.div(player.etoluna.moonPoint.max(1)).max(1));
        //if (hasChallenge('kou', 81)) gain = gain.times(10);

        //AW
        //if (player['awaken'].selectionActive && player['awaken'].current != null && player['awaken'].current != this.layer && !player['awaken'].awakened.includes(this.layer)) return new Decimal(0);

        return gain;
    },

    moonPointeffect() {//tmp
        let eff = player.etoluna.moonPoint.plus(1).log(5).max(0).div(50).plus(1);
        if (hasUpgrade('etoluna', 24)) eff = player.etoluna.moonPoint.pow(1 / 3).times(1.5).div(50).max(0).plus(1);
        //if (player.ins.inslevel.Arg.gt(0)) eff = player.etoluna.moonPoint.plus(player.etoluna.starPoint.pow(layers.ins.insEffect().Arg())).pow(1 / 3).times(1.5).div(50).max(0).plus(1);
        //if (player['awaken'].current == 'axium'||player['awaken'].awakened.includes('axium')) eff = eff.times(tmp['axium'].AWeffect.NWeffect);

        //AW
        //if (player['awaken'].selectionActive && player['awaken'].current != null && player['awaken'].current != this.layer && !player['awaken'].awakened.includes(this.layer)) return new Decimal(1);

        return eff;
    },

    //bump releated
    BumpDecrease(){//tmp
        let stardecrease = Math.max(player.etoluna.starbump/10,0.05);
        let moondecrease = Math.max(player.etoluna.moonbump/10,0.05);
        //TODO: 修正值
        //if (player['tempest'].grid[302].activated){
        //    stardecrease = stardecrease*gridEffect('tempest',302)
        //    moondecrease = moondecrease*gridEffect('tempest',302)
        //}
        if (hasUpgrade('storylayer',53)){
            stardecrease = stardecrease*(upgradeEffect('storylayer',53).EffectToSD)
            moondecrease = moondecrease*(upgradeEffect('storylayer',53).EffectToSD)
        }
        return {star:stardecrease,moon:moondecrease}
    },

    BumpEffect(){
        let powerplus = (0.2-Math.abs(player.etoluna.starbump-player.etoluna.moonbump))*(player.etoluna.starbump+player.etoluna.moonbump)/2
        let eff = new Decimal(1).plus(powerplus);
        return eff.max(1);
    },

    update(diff) {
        if (player.etoluna.unlocked) {
            player.etoluna.moonPoint = player.etoluna.moonPoint.plus(tmp["etoluna"].gainmoonPoints.times(diff));
            player.etoluna.starPoint = player.etoluna.starPoint.plus(tmp["etoluna"].gainstarPoints.times(diff));
            if (player.etoluna.moonPoint.lt(0)) player.etoluna.moonPoint = new Decimal(0);
            if (player.etoluna.starPoint.lt(0)) player.etoluna.starPoint = new Decimal(0);
        }
        /*if (player['awaken'].awakened.includes(this.layer)|| player['awaken'].current == this.layer){
            player.etoluna.starbump -= tmp.etoluna.BumpDecrease.star*diff
            player.etoluna.moonbump -= tmp.etoluna.BumpDecrease.moon*diff
            player.etoluna.starbump = Math.max(player.etoluna.starbump,0)
            player.etoluna.moonbump = Math.max(player.etoluna.moonbump,0)
        }*/
        //if (!(player['awaken'].awakened.includes(this.layer)|| player['awaken'].current == this.layer)&&player.subtabs.etoluna == 'Stellar Dome') player.subtabs.etoluna == 'Milestones'
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
        "Gemini Tower": {
            unlocked() { return player.etoluna.unlocked },
            content: [
                "main-display",
                "blank",
                "prestige-button",
                "resource-display",
                "blank",
                ["row", [
                    ["bar", "etoBar"],
                    ["column", [
                        ["blank", "400px"],
                        ["clickable", 22],
                        ["clickable", 12],
                    ]],
                    ["blank", ["50px", "50px"]],
                    ["clickable", 31],
                    ["blank", ["50px", "50px"]],
                    ["column", [
                        ["blank", "400px"],
                        ["clickable", 21],
                        ["clickable", 11],
                    ]],
                    ["bar", "lunaBar"],
                ]],
                "blank",
                ["row", [
                    ["column", [
                        ["display-text", function () { return "You have <h3 style='color: #bddfff;'>" + formatWhole(player.etoluna.starPoint) + "</h3> Star Points." }, {}],
                        "blank",
                        ["display-text", function () { return hasAchievement('a', 92) ? ("Which boosts All Glowing Roses effect by <h3>" + format(tmp.etoluna.starPointeffect) + "</h3>x") : "" }, {}],
                        "blank",
                    ]],
                    ["blank", ["50px", "50px"]],
                    ["column", [
                        ["display-text", function () { return "You have <h3 style='color: #d7a9f4;'>" + formatWhole(player.etoluna.moonPoint) + "</h3> Moon Points." }, {}],
                        "blank",
                        ["display-text", function () { return hasAchievement('a', 92) ? ("Which ÷<h3>" + format(tmp.etoluna.moonPointeffect) + "</h3> World Step Height.") : "" }, {}],
                        "blank",
                    ]],]
                    , {}],
                "blank",
                ["row", [["upgrade", "11"], ["upgrade", "13"], ["blank", ["50px", "50px"]], ["upgrade", "14"], ["upgrade", "12"]]],
                ["row", [["upgrade", "21"], ["upgrade", "23"], ["blank", ["50px", "50px"]], ["upgrade", "24"], ["upgrade", "22"]]],
            ]
        },
        /*"Stellar Dome":{
            unlocked() { return player['awaken'].awakened.includes('etoluna')|| player['awaken'].current == 'etoluna'},
            buttonStyle() { return { 'background-color': `${GlowingColor("#d7a9f4",10,"#bddfff")}40` } },
            content:[
                "main-display",
                "blank",
                "prestige-button",
                "resource-display",
                "blank",
                ["display-text", function () { return "Two different power synergize each other, and boosts ^"+format(tmp['etoluna'].BumpEffect)+" to Star & Moon Points gain." }, {}],
                ["bar", "etoPump"],
                "blank",
                ["row",[
                    ["clickable", 41],
                    "blank",
                    ["clickable", 42],
                ]],
                "blank",
                ["bar", "lunaPump"],
        ]
        },*/
    },

    milestones: {
        0: {
            requirementDescription: "1 Gemini Bound",
            done() { return player.etoluna.best.gte(1) },
            unlocked() { return player.etoluna.unlocked },
            effectDescription: "Keep All but last milestones of LC layer & 1st milestone of FL layer.<br>And you are considered have made a total of 3 Flourish Labyrinths.",
        },
        1: {
            requirementDescription: "2 Gemini Bounds",
            done() { return player.etoluna.best.gte(2) },
            unlocked() { return player.etoluna.unlocked },
            effectDescription: "Keep the rest of LC & FL milestones.",
        },
        2: {
            requirementDescription: "3 Gemini Bounds",
            done() { return player.etoluna.best.gte(3) },
            unlocked() { return player.etoluna.unlocked },
            effectDescription: "You can gain Glowing Roses outside Zero Sky at a much reduced rate.",
        },
        3: {
            requirementDescription: "5 Gemini Bounds",
            done() { return player.etoluna.best.gte(5) },
            unlocked() { return player.etoluna.unlocked },
            effectDescription: "Unlock Luminous Churches Autobuyer.",
        },
        4: {
            requirementDescription: "10 Gemini Bounds",
            done() { return player.etoluna.best.gte(10) },
            unlocked() { return player.etoluna.unlocked },
            effectDescription: "You can buy max Luminous Churches.",
        },
        5: {
            requirementDescription: "15 Gemini Bounds",
            done() { return player.etoluna.best.gte(15) },
            unlocked() { return player.etoluna.unlocked },
            effectDescription: "Luminous Church layer resets nothing.",
        },
        6: {
            requirementDescription: "25 Gemini Bounds",
            done() { return player.etoluna.best.gte(25) },
            unlocked() { return player.etoluna.unlocked },
            effectDescription: "You still could gain World Steps as fast as tick goes, but overflowing World Height progress will transfer into more World Steps.",
        },
        7: {
            requirementDescription: "30 Gemini Bounds",
            done() { return player.etoluna.best.gte(30) },
            unlocked() { return hasMilestone('etoluna', 6) },
            effectDescription: "Unlock Gemini upgrades.",
        },
    },
    milestonePopups(){
        //if (player['awaken'].current == this.layer || player['awaken'].awakened.includes(this.layer)) return false;
        return true;
    },

    bars: {
        etoBar: {
            direction: UP,
            width: 25,
            height: 500,
            progress() { return Math.min(player.etoluna.allotted, 0.99999) },
            barcolor() {
                return "#bddfff"
            },
            fillStyle() { return { 'background-color': "#bddfff" } },
        },
        lunaBar: {
            direction: UP,
            width: 25,
            height: 500,
            progress() { return Math.min(1 - layers.etoluna.bars.etoBar.progress(), 0.99999) },
            barcolor() {
                return "#d7a9f4"
            },
            fillStyle() { return { 'background-color': "#d7a9f4" } },
        },
        etoPump: {
            direction: RIGHT,
            width: 500,
            height: 25,
            progress() { return player.etoluna.starbump },
            barcolor() {
                return "#bddfff"
            },
            fillStyle() { return { 'background-color': "#bddfff" } },
        },
        lunaPump: {
            direction: LEFT,
            width: 500,
            height: 25,
            progress() { return player.etoluna.moonbump },
            barcolor() {
                return "#d7a9f4"
            },
            fillStyle() { return { 'background-color': "#d7a9f4" } },
        },
    },

    clickables: {
        rows: 3,
        cols: 2,
        11: {
            title: "L+",
            unlocked() { return player.etoluna.unlocked },
            canClick() { return player.etoluna.allotted > 0 },
            onClick() { player.etoluna.allotted = Math.max(player.etoluna.allotted - 0.05, 0) },
            style: { "height": "50px", "width": "50px", "min-height": "50px", "background-color": "#d7a9f4" },
        },
        12: {
            title: "E+",
            unlocked() { return player.etoluna.unlocked },
            canClick() { return player.etoluna.allotted < 1 },
            onClick() { player.etoluna.allotted = Math.min(player.etoluna.allotted + 0.05, 1) },
            style: { "height": "50px", "width": "50px", "min-height": "50px", "background-color": "#bddfff" },
        },
        21: {
            title: "Lm",
            unlocked() { return player.etoluna.unlocked },
            canClick() { return player.etoluna.allotted > 0 },
            onClick() { player.etoluna.allotted = 0; },
            style: { "height": "50px", "width": "50px", "min-height": "50px", "background-color": "#d7a9f4" },
        },
        22: {
            title: "Em",
            unlocked() { return player.etoluna.unlocked },
            canClick() { return player.etoluna.allotted < 1 },
            onClick() { player.etoluna.allotted = 1; },
            style: { "height": "50px", "width": "50px", "min-height": "50px", "background-color": "#bddfff" },
        },
        31: {
            title: "C",
            unlocked() { return player.etoluna.unlocked },
            canClick() { return player.etoluna.allotted != .5 },
            onClick() { player.etoluna.allotted = .5 },
            style: { "height": "50px", "width": "50px", "min-height": "50px", "background-color": "yellow" },
        },
        /*41:{
            title: "Enhance star power",
            unlocked(){return player['awaken'].awakened.includes(this.layer)|| player['awaken'].current == this.layer},
            canClick() { return player.etoluna.starbump<1 && player.etoluna.moonbump<1 },
            onClick() {
                player.etoluna.starbump = Math.min(player.etoluna.starbump+0.05,1)
                player.etoluna.moonbump = Math.min(player.etoluna.moonbump+0.01,1)
            },
            style:{"background-color": "#bddfff"},
        },
        42:{
            title: "Enhance moon power",
            unlocked(){return player['awaken'].awakened.includes(this.layer)|| player['awaken'].current == this.layer},//for now
            canClick() { return player.etoluna.moonbump<1 && player.etoluna.starbump<1},
            onClick() {
                player.etoluna.moonbump = Math.min(player.etoluna.moonbump+0.05,1)
                player.etoluna.starbump = Math.min(player.etoluna.starbump+0.01,1)
            },
            style:{"background-color": "#d7a9f4"},
        },*/
    },

    upgrades: {
        11: {
            title: "Among Stars",
            description: "The speed of World Steps gain is boosted by current progress of World Step gain.",
            fullDisplay: "<b>Among Stars</b><br>The speed of World Steps gain is boosted by current progress of World Step gain.<br>Cost: 25,000 Star Points",
            unlocked() { return hasMilestone('etoluna', 7) },
            canAfford() {
                return player[this.layer].starPoint.gte(25000);
            },
            pay() {
                player[this.layer].starPoint = player[this.layer].starPoint.sub(25000);
            },
            effect() {
                let eff = player.world.Worldtimer.plus(1).log(10).div(10).plus(1);
                return eff;
            },
            style: { "background-color"() { if (!hasUpgrade("etoluna", 11)) return canAffordUpgrade("etoluna", 11) ? "#bddfff" : "rgb(191,143,143)"; else return "rgb(119,191,95)" } },
        },
        12: {
            title: "Under The Moon",
            description: "Moon Points also boosts World Step Height softcap starts later.",
            fullDisplay: "<b>Under The Moon</b><br>Moon Points also boosts World Step Height softcap starts later.<br>Cost: 25,000 Moon Points",
            unlocked() { return hasMilestone('etoluna', 7) },
            canAfford() {
                return player[this.layer].moonPoint.gte(25000);
            },
            pay() {
                player[this.layer].moonPoint = player[this.layer].moonPoint.sub(25000);
            },
            style: { "background-color"() { if (!hasUpgrade("etoluna", 12)) return canAffordUpgrade("etoluna", 12) ? "#d7a9f4" : "rgb(191,143,143)"; else return "rgb(119,191,95)" } },
        },
        13: {
            title: "Sticky Steps",
            description: "Star Point effect also makes fixed World Step softcap starts later at a reduced rate.",
            fullDisplay: "<b>Sticky Steps</b><br>Star Point effect also makes fixed World Step softcap starts later at a reduced rate.<br>Cost: 50,000 Star Points",
            unlocked() { return hasUpgrade('etoluna', 11) },
            canAfford() {
                return player[this.layer].starPoint.gte(50000);
            },
            pay() {
                player[this.layer].starPoint = player[this.layer].starPoint.sub(50000);
            },
            effect() {
                let eff = tmp["etoluna"].starPointeffect.sqrt();
                return eff;
            },
            style: { "background-color"() { if (!hasUpgrade("etoluna", 13)) return canAffordUpgrade("etoluna", 13) ? "#bddfff" : "rgb(191,143,143)"; else return "rgb(119,191,95)" } },
        },
        14: {
            title: "Outside The Sky",
            description: "Moon Points also enlarges restricted World Step effect's hardcap.",
            fullDisplay: "<b>Outside The Sky</b><br>Moon Points also enlarges restricted World Step effect's hardcap.<br>Cost: 50,000 Moon Points",
            unlocked() { return hasUpgrade('etoluna', 12) },
            canAfford() {
                return player[this.layer].moonPoint.gte(50000);
            },
            pay() {
                player[this.layer].moonPoint = player[this.layer].moonPoint.sub(50000);
            },
            style: { "background-color"() { if (!hasUpgrade("etoluna", 14)) return canAffordUpgrade("etoluna", 14) ? "#d7a9f4" : "rgb(191,143,143)"; else return "rgb(119,191,95)" } },
        },
        21: {
            title: "Desire for Victory",
            description: "Star Point effect also enlarges restricted World Step effect's hardcap.",
            fullDisplay: "<b>Desire for Victory</b><br>Star Point effect also enlarges restricted World Step effect's hardcap.<br>Cost: 900,000 Star Points",
            unlocked() { return hasUpgrade('etoluna', 13) },
            canAfford() {
                return player[this.layer].starPoint.gte(900000);
            },
            pay() {
                player[this.layer].starPoint = player[this.layer].starPoint.sub(900000);
            },
            effect() {
                let eff = tmp["etoluna"].starPointeffect.sqrt().div(1.5).max(1);
                return eff;
            },
            style: { "background-color"() { if (!hasUpgrade("etoluna", 21)) return canAffordUpgrade("etoluna", 21) ? "#bddfff" : "rgb(191,143,143)"; else return "rgb(119,191,95)" } },
        },
        22: {
            title: "Mind Flow",
            description: "Moon Points also enlarges fixed World Step effect's exponent.",
            fullDisplay: "<b>Mind Flow</b><br>Moon Points also enlarges fixed World Step effect's softcap exponent.<br>Cost: 900,000 Moon Points",
            unlocked() { return hasUpgrade('etoluna', 14) },
            canAfford() {
                return player[this.layer].moonPoint.gte(900000);
            },
            pay() {
                player[this.layer].moonPoint = player[this.layer].moonPoint.sub(900000);
            },
            style: { "background-color"() { if (!hasUpgrade("etoluna", 22)) return canAffordUpgrade("etoluna", 22) ? "#d7a9f4" : "rgb(191,143,143)"; else return "rgb(119,191,95)" } },
        },
        23: {
            title: "Memory of rhythm",
            description: "Star Point effect formula becomes better.",
            fullDisplay: "<b>Memory of rhythm</b><br>Star Point effect formula becomes better.<br>Cost: 1,200,000 Star Points",
            unlocked() { return hasUpgrade('etoluna', 21) },
            canAfford() {
                return player[this.layer].starPoint.gte(1200000);
            },
            pay() {
                player[this.layer].starPoint = player[this.layer].starPoint.sub(1200000);
            },
            style: { "background-color"() { if (!hasUpgrade("etoluna", 23)) return canAffordUpgrade("etoluna", 23) ? "#bddfff" : "rgb(191,143,143)"; else return "rgb(119,191,95)" } },
        },
        24: {
            title: "Memory of roles",
            description: "Moon Points effect formula becomes better.",
            fullDisplay: "<b>Memory of roles</b><br>Moon Points effect formula becomes better.<br>Cost: 1,200,000 Moon Points",
            unlocked() { return hasUpgrade('etoluna', 22) },
            canAfford() {
                return player[this.layer].moonPoint.gte(1200000);
            },
            pay() {
                player[this.layer].moonPoint = player[this.layer].moonPoint.sub(1200000);
            },
            style: { "background-color"() { if (!hasUpgrade("etoluna", 24)) return canAffordUpgrade("etoluna", 24) ? "#d7a9f4" : "rgb(191,143,143)"; else return "rgb(119,191,95)" } },
        },
    },

})