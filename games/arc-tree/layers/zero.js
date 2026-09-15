addLayer("zero", {
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            roses: new Decimal(0),
            unlockOrder: 0,
            auto: false,
            demile: [],
        }
    },
    name: "Luminous", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "LC",
    color: "#ffe6f6",
    nodeStyle() {
        return {
            background: (player.zero.unlocked || canReset("zero")) ? ("radial-gradient(circle, #ededed 0%, #ffc1de 100%)") : "#bf8f8f",
        }
    },
    resource: "Luminous Churches",
    row: 3,
    //displayRow: 4,
    hotkeys: [
        { key: "L", description: "Shift+L: Reset for Luminous Churches", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    position: 0,
    branches: ["light"],

    baseResource: "Light Tachyons",
    baseAmount() { return player.light.points },

    requires: new Decimal(100000),

    type: "static",
    exponent() {
        //if (player['awaken'].current == 'zero'||player['awaken'].awakened.includes('zero')) return 1.4;
        return 1.5
    },
    roundUpCost: true,

    autoPrestige() {
        return (hasMilestone('etoluna', 3) && player.zero.auto)
    },
    canBuyMax() { return hasMilestone('etoluna', 4) /*|| player['awaken'].current == 'axium' || player['awaken'].current == 'zero' || player['awaken'].current == 'etoluna' || player['awaken'].current == 'saya'*/},
    resetsNothing() { return hasMilestone('etoluna', 5) },

    update(diff) {
        if (inChallenge('zero', 11)) {
            player.points = player.points.sub(player.points.div(10).times(diff)).max(1e-10);
            player.mem.points = player.mem.points.sub(player.mem.points.div(10).times(diff)).max(1e-10);
            player.light.points = player.light.points.sub(player.light.points.div(10).times(diff)).max(1e-10);
            player.dark.points = player.dark.points.sub(player.dark.points.div(10).times(diff)).max(1e-10);
            player.kou.points = player.kou.points.sub(player.kou.points.div(10).times(diff)).max(1e-10);
            player.lethe.points = player.lethe.points.sub(player.lethe.points.div(10).times(diff)).max(1e-10);
        }
        if (inChallenge('zero', 11) || hasMilestone('etoluna', 2)) player.zero.roses = player.zero.roses.plus(layers["zero"].challenges[11].amt().times(diff));
    },

    tabFormat:
    ["main-display",
        "prestige-button",
        "resource-display",
        "milestones",
        "challenges",
    ],

    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone('etoluna', 1) || hasMilestone('saya', 1)) keep.push("milestones");
        if (hasMilestone('etoluna', 3) /*|| (resettingLayer == 'awaken' && player['awaken'].current == null)*/) keep.push("auto");
        if (layers[resettingLayer].row > this.row) {
            layerDataReset('zero', keep);
            let keepmilestone = [];
            if (hasMilestone('saya', 0)) { keepmilestone = keepmilestone.concat([0]); player[this.layer].total = player[this.layer].total.plus(3) }
            if (hasMilestone('etoluna', 0)) keepmilestone = keepmilestone.concat([0, 1, 2, 3])
            for (var i = 0; i < keepmilestone.length; i++) {
                if (!hasMilestone('zero', keepmilestone[i])) player.zero.milestones.push(keepmilestone[i]);
            }
        }
    },

    gainMult() {
        let mult = new Decimal(1);
        if (hasChallenge('world', 12)) mult = mult.div(player.kou.buyables[11].max(1));
        if (hasMilestone('axium', 3)) mult = mult.div(buyableEffect('axium', 11));
        if (hasChallenge('world', 21)) mult = mult.div(challengeEffect('world', 21));
        if (hasAchievement('a', 71)) mult = mult.div(layers.world.fixedReward());
        if (hasUpgrade('lab', 143)) mult = mult.div(upgradeEffect('lab', 143));
        if (hasUpgrade('storylayer', 32)) mult = mult.div(upgradeEffect('storylayer', 32));
        if (hasUpgrade('lab', 163)) mult = mult.div(buyableEffect('lab', 23));
        if (hasMilestone('lib', 1)) mult = mult.div(layers.lib.libEffect().ayu());
        if (hasMilestone('lib', 2)) mult = mult.div(layers.lib.libEffect().summer());
        //if (player['awaken'].current == 'zero'||player['awaken'].awakened.includes('zero')) mult = mult.div(tmp["zero"].challenges[11].effectAWtoLCFL); 
        //if (player['awaken'].current == 'axium'||player['awaken'].awakened.includes('axium')) mult = mult.div(tmp['axium'].AWeffect.SWeffect); 
        //if(player.fracture.unlocked) {
        //    if (layers['fracture'].grid.return_Equiped_Equipment_Num(20)>=1) mult=mult.div(player.fracture.ElementEssence).div(layers['fracture'].grid.return_Equiped_Equipment_Num(20)).div(10);
        //};
        return mult;
    },
    gainExp() {
        return new Decimal(1)
    },
    directMult() {
        let dm = new Decimal(1);
        //if (hasMilestone('ins', 3)) dm = dm.times(layers.ins.insEffect().Egy().Pos());
        return dm;
    },

    layerShown() { return hasAchievement('lab', 21) || player[this.layer].unlocked },

    milestones: {
        0: {
            requirementDescription: "1 total Luminous Church",
            done() { return player.zero.total.gte(1) },
            unlocked() { return player.zero.unlocked },
            effectDescription: "Keep all except last milestones of Red Doll Layer when LC or FL reset.",
        },
        1: {
            requirementDescription: "2 total Luminous Churches",
            done() { return player.zero.total.gte(2) },
            unlocked() { return player.zero.unlocked },
            effectDescription: "Keep last milestones of Red Doll Layer when LC or FL reset and keep first row upgrades of Red Doll layer when LC or FL reset.",
        },
        2: {
            requirementDescription: "5 total Luminous Churches",
            done() { return player.zero.total.gte(5) },
            unlocked() { return player.zero.unlocked },
            effectDescription: "Luminous Churches boosts Research Points gain and keep second row upgrades of Red Doll layer when LC or FL reset.",
        },
        3: {
            requirementDescription: "8 total Luminous Churches",
            done() { return player.zero.total.gte(8) },
            unlocked() { return player.zero.unlocked },
            effectDescription: "Unlock Zero Sky & LC now boosts World Step gain.",
        },
        4: {
            requirementDescription: "6 best Luminous Churches",
            done() { return player.zero.best.gte(6) && hasMilestone('zero', 3) },
            unlocked() { return hasMilestone('zero', 3) },
            effectDescription: "Glowing Roses also boosts Red Dolls and Forgotten Drops gain.",
        },
    },
    milestonePopups(){
        //if (player['awaken'].current == this.layer || player['awaken'].awakened.includes(this.layer)) return false;
     return true;
 },

    challenges: {
        11: {
            name: "Zero sky",
            unlocked() { return hasMilestone('zero', 3) && (hasUpgrade('storylayer', 14) || (!player.world.randomChallenge && !player.world.fixedspeedChallenge && !player.world.restrictChallenge )) },
            canComplete() { return false },
            gainMult() {
                let mult = new Decimal(1);
                if (hasUpgrade('lab', 112)) mult = mult.times(upgradeEffect('lab', 112));
                if (hasMilestone('axium', 3)) mult = mult.times(buyableEffect('axium', 21));
                if (hasChallenge('world', 21)) mult = mult.div(player.world.points.sqrt().div(50).plus(1));
                if (hasUpgrade('lab', 113)) mult = mult.times(upgradeEffect('lab', 113));
                if (hasUpgrade('lab', 141)) mult = mult.times(upgradeEffect('lab', 141));
                if (hasMilestone('etoluna', 2) && !inChallenge('zero', 11)) mult = mult.times(player.zero.roses.plus(1).log(20).div(50).max(0.01).min(0.5));
                if (hasMilestone('lib', 1)) mult = mult.times(layers.lib.libEffect().ayu());
                if (hasAchievement('a', 101)) mult = mult.times(layers['saya'].effect());
                if (hasUpgrade('lab', 181)) mult = mult.times(buyableEffect('lab', 23))
                //if (player['awaken'].current == this.layer||player['awaken'].awakened.includes(this.layer)) mult = mult.times(tmp["zero"].challenges[11].effectAWtoRose);
                
                //if (player.tempest.activeChallenge!=null) mult = mult.pow(tmp.tempest.nerf_in_challenges.toRoseGain());
                return mult;
            },
            amt() {//gain per sec
                let gain = player.points.plus(1).log10().div(50).max(0).sqrt();
                gain = gain.times(this.gainMult().max(1));
                gain = gain.times(challengeEffect('saya', 41).max(1));
                //if (hasUpgrade('light', 43)) gain = gain.times(upgradeEffect('light', 43));
                //gain = gain.times(Decimal.pow(2,layers['fracture'].grid.return_Equiped_Equipment_Num(1)+layers['fracture'].grid.return_Equiped_Equipment_Num(4)));
                //gain = gain.times(Decimal.pow(10,layers['fracture'].grid.return_Equiped_Equipment_Num(12)));
                return gain;
            },
            onEnter() {
                if (!hasAchievement('a', 73)) player.zero.roses = new Decimal(0);
                else player.zero.roses = player.zero.roses.div(2);
                doReset("mem", true);
                doReset("light", true);
                doReset("dark", true);
                doReset("kou", true);
                doReset("lethe", true);
            },
            onExit() {
                if (inChallenge('saya', 41) || tmp.saya.grid.ChallengeDepth[7]!=-1) { player.zero.roses = new Decimal(0); player.saya.bestroses41 = new Decimal(0); }
            },
            fullDisplay() {
                let show = "Fragment generation & Memory gain ^0.5, and losing 10% of your Fragments, Memories, Light Tachyons, Dark Matters, Red Dolls, Forgotten Drops per second.<br>" + "<br><h3>Glowing Roses</h3>: " + format(player.zero.roses) + " (" + ((inChallenge('zero', 11) || hasMilestone('etoluna', 2)) ? formatWhole(tmp["zero"].challenges[11].amt) : 0) + "/s)" + (hasAchievement('a', 63) ? ("<br>Which are boosting The Speed of World steps gain by " + format(achievementEffect('a', 63)) + "x") : "");
                if (hasMilestone('zero', 4)) show = show + "<br>Red Doll & Forgotten Drop gain by " + format(tmp["zero"].challenges[11].effecttoRF) + "x";
                if (hasUpgrade('storylayer', 12)) show += "<br>Fragment generation & Memory gain by " + format(tmp["zero"].challenges[11].effecttoFragMem) + "x";
                if (hasUpgrade('storylayer', 21)) show += "<br>Light Tachyon & Dark Matter gain by " + format(tmp["zero"].challenges[11].effecttoLD) + "x";
                /*if (player['awaken'].current == this.layer||player['awaken'].awakened.includes(this.layer)){
                    show += "<br>Light Tachyon & Dark Matter Effect by " + format(tmp["zero"].challenges[11].effectAWtoLD) + "x"
                    show += "<br>Red Doll & Forgotten Drop Effect by " + format(tmp["zero"].challenges[11].effectAWtoRF) + "x"
                    show += "<br>Gemini Bound & Everflashing Knife gain by " + format(tmp["zero"].challenges[11].effectAWtoGK) + "x"
                    show += "<br>Luminous Church & Flourish Labyrinth gain by " + format(tmp["zero"].challenges[11].effectAWtoLCFL) + "x"
                    show += "<br>Glowing Rose gain by " + format(tmp["zero"].challenges[11].effectAWtoRose) + "x"
                }*/
                return show;
            },
            effecttoRF() {
                //AW
                //if (player['awaken'].selectionActive && player['awaken'].current != null && player['awaken'].current != this.layer && !player['awaken'].awakened.includes(this.layer) || player[this.layer].roses.lte(0)) return new Decimal(1);
                let eff = player.zero.roses.plus(1).log10().times(2).max(1).times(hasAchievement('a', 92) ? tmp.etoluna.starPointeffect : 1).times(challengeEffect('saya', 41));
                if (hasUpgrade('lethe', 63)) eff = eff.times(upgradeEffect('lethe', 63));
                if (hasUpgrade('lethe', 64)) eff = eff.times(upgradeEffect('lethe', 64));
                if (hasUpgrade('lethe', 65)) eff = eff.times(upgradeEffect('lethe', 65));
                if (hasUpgrade('lethe', 75)) eff = eff.times(upgradeEffect('lethe', 75));
                if (hasUpgrade('lethe', 85)) eff = eff.times(upgradeEffect('lethe', 85));
                return eff.max(1);
            },
            effecttoFragMem() {
                //AW
                //if (player['awaken'].selectionActive && player['awaken'].current != null && player['awaken'].current != this.layer && !player['awaken'].awakened.includes(this.layer) || player[this.layer].roses.lte(0)) return new Decimal(1);
                if (!hasUpgrade('storylayer', 12)) return new Decimal(1);
                let eff = upgradeEffect('storylayer', 12);
                if (hasUpgrade('lethe', 63)) eff = eff.times(upgradeEffect('lethe', 63));
                if (hasUpgrade('lethe', 64)) eff = eff.times(upgradeEffect('lethe', 64));
                if (hasUpgrade('lethe', 65)) eff = eff.times(upgradeEffect('lethe', 65));
                if (hasUpgrade('lethe', 75)) eff = eff.times(upgradeEffect('lethe', 75));
                if (hasUpgrade('lethe', 85)) eff = eff.times(upgradeEffect('lethe', 85));
                return eff.max(1);
            },
            effecttoLD() {
                //AW
                //if (player['awaken'].selectionActive && player['awaken'].current != null && player['awaken'].current != this.layer && !player['awaken'].awakened.includes(this.layer) || player[this.layer].roses.lte(0)) return new Decimal(1);
                if (!hasUpgrade('storylayer', 21)) return new Decimal(1);
                let eff = upgradeEffect('storylayer', 21);
                if (hasUpgrade('lethe', 63)) eff = eff.times(upgradeEffect('lethe', 63));
                if (hasUpgrade('lethe', 64)) eff = eff.times(upgradeEffect('lethe', 64));
                if (hasUpgrade('lethe', 65)) eff = eff.times(upgradeEffect('lethe', 65));
                if (hasUpgrade('lethe', 75)) eff = eff.times(upgradeEffect('lethe', 75));
                if (hasUpgrade('lethe', 85)) eff = eff.times(upgradeEffect('lethe', 85));
                return eff.max(1);
            },
            /*effectAWtoLD(){
                if (player['awaken'].selectionActive && player['awaken'].current != null && player['awaken'].current != this.layer && !player['awaken'].awakened.includes(this.layer)) return new Decimal(1);//别的层AW时的反应
                if (!(player['awaken'].current == this.layer||player['awaken'].awakened.includes(this.layer))) return new Decimal (1);//只有AW了才有效
                if (player[this.layer].roses.lte(0)) return new Decimal(1);
                let eff = Decimal.pow(10,player.zero.roses.max(1).log10().div(100).max(0));
                if (hasUpgrade('lethe', 63)) eff = eff.times(upgradeEffect('lethe', 63));
                if (hasUpgrade('lethe', 64)) eff = eff.times(upgradeEffect('lethe', 64));
                if (hasUpgrade('lethe', 65)) eff = eff.times(upgradeEffect('lethe', 65));
                if (hasUpgrade('lethe', 75)) eff = eff.times(upgradeEffect('lethe', 75));
                if (hasUpgrade('lethe', 85)) eff = eff.times(upgradeEffect('lethe', 85));
                return eff.max(1).log(5).max(1);
            },
            effectAWtoRF(){
                if (player['awaken'].selectionActive && player['awaken'].current != null && player['awaken'].current != this.layer && !player['awaken'].awakened.includes(this.layer)) return new Decimal(1);//别的层AW时的反应
                if (!(player['awaken'].current == this.layer||player['awaken'].awakened.includes(this.layer))) return new Decimal (1);//只有AW了才有效
                if (player[this.layer].roses.lte(0)) return new Decimal(1);
                let eff = player.zero.roses.max(1).log(20);
                if (hasUpgrade('lethe', 63)) eff = eff.times(upgradeEffect('lethe', 63));
                if (hasUpgrade('lethe', 64)) eff = eff.times(upgradeEffect('lethe', 64));
                if (hasUpgrade('lethe', 65)) eff = eff.times(upgradeEffect('lethe', 65));
                if (hasUpgrade('lethe', 75)) eff = eff.times(upgradeEffect('lethe', 75));
                if (hasUpgrade('lethe', 85)) eff = eff.times(upgradeEffect('lethe', 85));
                return softcap(eff.max(1).log(8).max(1),new Decimal(1000),1/3);
            },
            effectAWtoGK(){
                if (player['awaken'].selectionActive && player['awaken'].current != null && player['awaken'].current != this.layer && !player['awaken'].awakened.includes(this.layer)) return new Decimal(1);//别的层AW时的反应
                if (!(player['awaken'].current == this.layer||player['awaken'].awakened.includes(this.layer))) return new Decimal (1);//只有AW了才有效
                if (player[this.layer].roses.lte(0)) return new Decimal(1);
                let eff = player.zero.roses.max(1).log10().sqrt().times(1.5);
                if (hasUpgrade('lethe', 63)) eff = eff.times(upgradeEffect('lethe', 63));
                if (hasUpgrade('lethe', 64)) eff = eff.times(upgradeEffect('lethe', 64));
                if (hasUpgrade('lethe', 65)) eff = eff.times(upgradeEffect('lethe', 65));
                if (hasUpgrade('lethe', 75)) eff = eff.times(upgradeEffect('lethe', 75));
                if (hasUpgrade('lethe', 85)) eff = eff.times(upgradeEffect('lethe', 85));
                return eff.max(1).log(5).max(1);
            },
            effectAWtoLCFL(){
                if (player['awaken'].selectionActive && player['awaken'].current != null && player['awaken'].current != this.layer && !player['awaken'].awakened.includes(this.layer)) return new Decimal(1);//别的层AW时的反应
                if (!(player['awaken'].current == this.layer||player['awaken'].awakened.includes(this.layer))) return new Decimal (1);//只有AW了才有效
                if (player[this.layer].roses.lte(0)) return new Decimal(1);
                let eff = player.zero.roses.max(1).log10().pow(1/1.5).div(10);
                if (hasUpgrade('lethe', 63)) eff = eff.times(upgradeEffect('lethe', 63));
                if (hasUpgrade('lethe', 64)) eff = eff.times(upgradeEffect('lethe', 64));
                if (hasUpgrade('lethe', 65)) eff = eff.times(upgradeEffect('lethe', 65));
                if (hasUpgrade('lethe', 75)) eff = eff.times(upgradeEffect('lethe', 75));
                if (hasUpgrade('lethe', 85)) eff = eff.times(upgradeEffect('lethe', 85));
                return eff.max(1);
            },
            effectAWtoRose(){
                if (player['awaken'].selectionActive && player['awaken'].current != null && player['awaken'].current != this.layer && !player['awaken'].awakened.includes(this.layer)) return new Decimal(1);//别的层AW时的反应
                if (!(player['awaken'].current == this.layer||player['awaken'].awakened.includes(this.layer))) return new Decimal (1);//只有AW了才有效
                if (player[this.layer].roses.lte(0)) return new Decimal(1);
                let eff = player.zero.roses.max(1).log(20).div(2.5);
                if (hasUpgrade('lethe', 63)) eff = eff.times(upgradeEffect('lethe', 63));
                if (hasUpgrade('lethe', 64)) eff = eff.times(upgradeEffect('lethe', 64));
                if (hasUpgrade('lethe', 65)) eff = eff.times(upgradeEffect('lethe', 65));
                if (hasUpgrade('lethe', 75)) eff = eff.times(upgradeEffect('lethe', 75));
                if (hasUpgrade('lethe', 85)) eff = eff.times(upgradeEffect('lethe', 85));
                return softcap(eff.max(1),new Decimal(1e10),0.25);
            },*/
            style() {
                return { 'background-color': "#ffe6f6", color: "#383838", 'border-radius': "25px", height: "400px", width: "400px" }
            }
        }
    },
})