addLayer("saya", {
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            Timer41: new Decimal(0),
            bestroses41: new Decimal(0),
            unlockOrder: 0,
            auto: false,
            demile: [],
            decha: [],
            CurrentPairChallenge:null,
            FallbackPair:false,
            MACompletions: 0,
        }
    },

    name: "Knife",
    symbol: "K",
    color: "#16a951",
    resource: "Everflashing Knives",
    row: 4,
    //displayRow: 1,
    position: 5,
    hotkeys: [
        { key: "k", description: "K: Reset for Everflashing Knives", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    branches: ["lethe"],

    baseResource: "Forgotten Drops",
    baseAmount() { return player.lethe.points },

    requires() {
        let cost = new Decimal(1e250);
        return cost
    },

    type: "static",
    exponent: 1.5,
    base: 2,

    gainMult() {//static层
        let mult=new Decimal(1);
        //if (player.lethe.buyables[21].unlocked) mult = mult.div(buyableEffect('lethe', 21));
        if(hasUpgrade('lethe',72)) mult=mult.div(upgradeEffect('lethe',72));
        if (hasMilestone('lib', 1)) mult = mult.div(layers.lib.libEffect().shirabe());
        if (hasMilestone('lib', 2)) mult = mult.div(layers.lib.libEffect().winter());
        //if (player['awaken'].current == 'zero'||player['awaken'].awakened.includes('zero')) mult = mult.div(tmp["zero"].challenges[11].effectAWtoGK);                    
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    canBuyMax() { return hasMilestone('lib', 2) },

    layerShown() { return hasUpgrade('storylayer', 23) },

    effect() {
        let eff = new Decimal(1);
        eff = eff.plus(player[this.layer].points.div(10));
        //if (player['awaken'].awakened.includes(this.layer)||player['awaken'].current == this.layer ) eff = eff.times(1.25);
        if (hasUpgrade('dark', 44)) eff = eff.times(upgradeEffect('dark', 44))
        if (hasUpgrade('lethe', 61)) eff = eff.times(upgradeEffect('lethe', 61))
        if (hasUpgrade('lethe', 62)) eff = eff.times(upgradeEffect('lethe',62))
        if (hasUpgrade('lethe', 71)) eff = eff.times(upgradeEffect('lethe',71))
        //if (player['awaken'].current == 'axium'||player['awaken'].awakened.includes('axium')) eff = eff.times(tmp['axium'].AWeffect.NEeffect); 
        //if (player['awaken'].awakened.includes(this.layer)) eff = eff.times(tmp.saya.grid.ChallengeEffect.toKeff);

        //AW
        //if (player['awaken'].selectionActive && player['awaken'].current != null && player['awaken'].current != this.layer && !player['awaken'].awakened.includes(this.layer)) return new Decimal(1);

        return eff;
    },
    effectDescription() {
        let show = "which are directly boosting ";
        show += "Red Dolls and Forgotten Drops gain by ";
        show += format(layers['saya'].effect()) + "x";
        return show;
    },

    shouldNotify(){
        if (player[this.layer].CurrentPairChallenge !=null)
            if (player.points.gte(tmp.saya.grid.ChallengeTarget.frag)||player.mem.points.gte(tmp.saya.grid.ChallengeTarget.mem))
                return true;
    },

    update(diff) {
        if (inChallenge('saya', 41) || tmp.saya.grid.ChallengeDepth[7]!=-1) {
            if (player.zero.roses.gt(player.saya.bestroses41) && !inChallenge('zero', 11)) player.saya.bestroses41 = player.zero.roses;
            player.saya.Timer41 = player.saya.Timer41.plus(diff);
            if (player.saya.Timer41.gte(layers.saya.challenges[41].debuff())) {
                doReset("saya", true);

                player.saya.Timer41 = new Decimal(0);
            }
        }
        else player.saya.Timer41 = new Decimal(0);

        if (inChallenge('saya', 42) || tmp.saya.grid.ChallengeDepth[8]!=-1) {
            if (!player.light.auto) player.light.auto = true;
            if (!player.dark.auto) player.dark.auto = true;
        }
    },
    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone('lib', 0)) keep.push('milestones');
        if (hasMilestone('lib', 1)) keep.push('challenges');
        if (hasMilestone('lib', 4)) keep.push('auto');
        //if (hasMilestone('tempest', 2)) keep.push('grid');
        if (layers[resettingLayer].row > this.row) layerDataReset('saya', keep);
    },
    autoPrestige() {
        //if (layers["saya"].deactivated()) return false;
        return hasMilestone('lib', 4) && player.saya.auto
    },
    resetsNothing() { return hasMilestone('lib', 5) },

    //AW通用相关
    /*deactivated() {
        let bol = false;
        bol = (player['awaken'].selectionActive && player['awaken'].current != null && player['awaken'].current != this.layer && !player['awaken'].awakened.includes(this.layer))
        if (bol) {
            if (player[this.layer].demile.length == 0) player[this.layer].demile = player[this.layer].milestones;
            if (player[this.layer].decha.length == 0) player[this.layer].decha = player[this.layer].challenges;
        }
        else {
            if (player[this.layer].demile.length != 0) { player[this.layer].milestones = player[this.layer].demile; player[this.layer].demile = [] };
            if (player[this.layer].decha.length != 0) { player[this.layer].challenges = player[this.layer].decha; player[this.layer].decha = [] };
            for (id in player[this.layer].challenges)
                if (player[this.layer].challenges[id]==null) player[this.layer].challenges[id] = 0;
        }
        return bol;
    },
    marked() {
        if (player.awaken.awakened.includes(this.layer)) return true;
        else return false;
    },*/

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
        "Memories Adjustment": {
            unlocked() { return player.saya.unlocked&&player.saya.CurrentPairChallenge==null },
            content: [
                "main-display",
                "blank",
                "prestige-button",
                "blank",
                "resource-display",
                "blank", "challenges"]
        },
        /*"Merge Attachment":{
            unlocked() { return player['awaken'].awakened.includes('saya') },
            buttonStyle() { return { 'background-color': '#0a4d25' } },
            content:[
                "main-display",
                "blank",
                "prestige-button",
                "resource-display",
                "blank",
                ["display-text",function () {
                    let desc = ""
                    if (player.saya.CurrentPairChallenge == null){
                        desc = "Choose a Merge Attachment below."
                        desc += "<br>The number 'ab' means you will endure Memory Adjustment Challenge a 4 times, and b the times you completed this Merge Attachment."
                        desc += "<br>Right now, you have completed <h3>"+formatWhole(tmp.saya.grid.Sum_All_times)+"</h3> Merge Attachment in total."
                        desc += "<br>Which..."
                        desc += ("<br><br>Boosts Everflashing Knives' Effect by x"+format(tmp.saya.grid.ChallengeEffect.toKeff));
                        desc += ("<br>Boosts GE & FO gain by x"+format(tmp.saya.grid.ChallengeEffect.toGEFO));
                        desc += ("<br>Boosts All (Except <b>Searching For Essence</b>) Memory Adjustments' Effect by x"+format(tmp.saya.grid.ChallengeEffect.toKcha));
                    }
                    else{
                        let rowNum = Math.floor(player.saya.CurrentPairChallenge/100)
                        let colNum = player.saya.CurrentPairChallenge % 100;
                        desc = "Now you are Enduring Merge Attachment <h2>" + rowNum + colNum + "</h2>x"+player.saya.grid[player.saya.CurrentPairChallenge]
                        desc += "<br>Which means...<br>"
                        for (index in tmp.saya.grid.ChallengeDepth)
                            if (tmp.saya.grid.ChallengeDepth[index]>-1)
                            switch(index){
                                case '1':desc+=("<br>Light Tachyons effect ^" + format(layers['saya'].challenges[11].debuff())); break;
                                case '2':desc+=("<br>Dark Matters effect ^" + format(layers['saya'].challenges[12].debuff())); break;
                                case '3':desc+=("<br>Fragment generation ^^" + format(layers['saya'].challenges[21].debuff())); break;
                                case '4':desc+=("<br>Memory gain ^^" + format(layers['saya'].challenges[22].debuff())); break;
                                case '5':desc+=("<br>Red Dolls effect ^" + format(layers['saya'].challenges[31].debuff())); break;
                                case '6':desc+=("<br>Remove all your Guilding Beacons, and you can have " + formatWhole(layers['saya'].challenges[32].debuff()) + " Guilding Beacons at most."); break;
                                case '7':desc+=("<br>Force a row5 reset every " + format(layers['saya'].challenges[41].debuff()) + " seconds"); break;
                                case '8':desc+=("<br>Dark Matter effect reduces Light Tachyons gain&direct gain by log" + format(layers['saya'].challenges[42].debuff()) + " and force open L&D's autobuyer."); break;
                                default:desc+="<br>I don't know what's this."
                            }
                        desc +=("<br><br>...Also:<br>^"+format(tmp.saya.grid.ChallengeDebuff.frag)+" on Fragment generation<br>^"+format(tmp.saya.grid.ChallengeDebuff.mem)+" on Memory gain<br>Due to <h3>"+formatWhole(tmp.saya.grid.Sum_All_times)+"</h3> Merge Attachment you completed in total.");
                        desc +=("<br>You need to reach "+format(tmp.saya.grid.ChallengeTarget.frag)+" Fragments or "+format(tmp.saya.grid.ChallengeTarget.mem)+" Memories to complete this Merge Attachment.")

                    }
                    return desc;
                },{}],
                "blank",
                "grid",
                ["clickable",11],
            ]
        },*/
    },

    milestones: {
        0: {
            requirementDescription: "1 Everflashing Knife",
            done() { return player.saya.best.gte(1) },
            unlocked() { return player.saya.unlocked },
            effectDescription: "Keep All but last milestones of FL layer & 1st milestone of LC layer.<br>And you are considered have made a total of 3 Luminous Churches.",
        },
        1: {
            requirementDescription: "2 Everflashing Knives",
            done() { return player.saya.best.gte(2) },
            unlocked() { return player.saya.unlocked },
            effectDescription: "Keep the rest of LC & FL milestones.",
        },
        2: {
            requirementDescription: "3 Everflashing Knives",
            done() { return player.saya.best.gte(3) },
            unlocked() { return player.saya.unlocked },
            effectDescription: "Give 10 more base move times in Maze.",
        },
        3: {
            requirementDescription: "5 Everflashing Knives",
            done() { return player.saya.best.gte(5) },
            unlocked() { return player.saya.unlocked },
            effectDescription: "Unlock Flourish Labyrinths Autobuyer.",
        },
        4: {
            requirementDescription: "10 Everflashing Knives",
            done() { return player.saya.best.gte(10) },
            unlocked() { return player.saya.unlocked },
            effectDescription: "You can buy max Flourish Labyrinths.",
        },
        5: {
            requirementDescription: "15 Everflashing Knives",
            done() { return player.saya.best.gte(15) },
            unlocked() { return player.saya.unlocked },
            effectDescription: "Flourish Labyrinth layer resets nothing.",
        },
        6: {
            requirementDescription: "25 Everflashing Knives",
            done() { return player.saya.best.gte(25) },
            unlocked() { return player.saya.unlocked },
            effectDescription: "Keep half of your World Steps when reset.",
        },
        7: {
            requirementDescription: "30 Everflashing Knives",
            done() { return player.saya.best.gte(30) },
            unlocked() { return hasMilestone('saya', 6) },
            effectDescription: "Everflashing Knives also effects the Speed of World Step gain.",
        },
    },
    milestonePopups(){
        //if (player['awaken'].current == this.layer || player['awaken'].awakened.includes(this.layer)) return false;
        return true;
    },

    challenges: {
        cols: 2,
        11: {
            name: "Enlighting Memories",
            completionLimit: 5,
            challengeDescription() {
                let des = "Light Tachyons effect ^" + format(layers[this.layer].challenges[this.id].debuff());
                des += "<br>Completion times: " + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit
                return des
            },
            debuff() {//layers
                let ChallengeDepth = tmp['saya'].grid.ChallengeDepth[1]>-1?Math.max(tmp[this.layer].grid.ChallengeDepth[1],0):challengeCompletions(this.layer, this.id)
                return 0.5 - (ChallengeDepth * 0.05);
            },
            rewardEffect() {
                let eff = Decimal.pow(2, challengeCompletions(this.layer, this.id));
                //if (player['awaken'].current == this.layer || player['awaken'].awakened.includes(this.layer)) eff = Decimal.pow(4, challengeCompletions(this.layer, this.id)).times(tmp.saya.grid.ChallengeEffect.toKcha);
                return eff
            },
            unlocked() { return player.saya.unlocked },
            //unlocked() { return player.saya.unlocked || hasMilestone('ins', 1) },
            goal() { 
                //if (player['awaken'].current == this.layer) return new Decimal("1e4150").times(Decimal.pow(1e50, challengeCompletions(this.layer, this.id)))
                return new Decimal(1e250).times(Decimal.pow(1e5, challengeCompletions(this.layer, this.id))) 
            },
            onEnter(){
                if (player['awaken'].current == this.layer){
                    player.points = new Decimal(0);
                    player.mem.points = new Decimal(0);
                    player.light.points = new Decimal(0);
                    player.dark.points = new Decimal(0);
                    player.kou.points = new Decimal(0);
                    player.lethe.points = new Decimal(0);
                    player.zero.points = new Decimal(0);
                    player.zero.roses = new Decimal(0);
                    player.axium.points = new Decimal(0);
                }
            },
            currencyDisplayName: "Fragments",
            currencyInternalName: "points",
            rewardDescription() { return "Light Tachyons effect x" + format(challengeEffect(this.layer, this.id)) },
        },
        12: {
            name: "Insane Moment",
            completionLimit: 5,
            challengeDescription() {
                let des = "Dark Matters effect ^" + format(layers[this.layer].challenges[this.id].debuff());
                des += "<br>Completion times: " + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit
                return des
            },
            debuff() {//layers
                let ChallengeDepth = tmp['saya'].grid.ChallengeDepth[2]>-1?Math.max(tmp[this.layer].grid.ChallengeDepth[2],0):challengeCompletions(this.layer, this.id)
                return 0.5 - (ChallengeDepth * 0.05);
            },
            rewardEffect() {
                let eff = Decimal.pow(3, challengeCompletions(this.layer, this.id));
                //if (player['awaken'].current == this.layer || player['awaken'].awakened.includes(this.layer)) eff = Decimal.pow(5, challengeCompletions(this.layer, this.id)).times(tmp.saya.grid.ChallengeEffect.toKcha);
                return eff
            },
            unlocked() { return player[this.layer].best.gte(2) /*|| hasMilestone('ins', 1)*/ },
            goal() { 
                //if (player['awaken'].current == this.layer) return new Decimal("1e4050").times(Decimal.pow(1e50, challengeCompletions(this.layer, this.id)))
                return new Decimal(1e250).times(Decimal.pow(1e5, challengeCompletions(this.layer, this.id))) 
            },
            onEnter(){
                if (player['awaken'].current == this.layer){
                    player.points = new Decimal(0);
                    player.mem.points = new Decimal(0);
                    player.light.points = new Decimal(0);
                    player.dark.points = new Decimal(0);
                    player.kou.points = new Decimal(0);
                    player.lethe.points = new Decimal(0);
                    player.zero.points = new Decimal(0);
                    player.zero.roses = new Decimal(0);
                    player.axium.points = new Decimal(0);
                }
            },
            currencyDisplayName: "Fragments",
            currencyInternalName: "points",
            rewardDescription() { return "Dark Matters effect x" + format(challengeEffect(this.layer, this.id)) },
        },
        21: {
            name: "Searching For Essence",
            completionLimit: 5,
            challengeDescription() {
                let des = "Fragment generation ^^" + format(layers[this.layer].challenges[this.id].debuff());
                des += "<br>Completion times: " + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit
                return des
            },
            debuff() {//layers
                let ChallengeDepth = tmp['saya'].grid.ChallengeDepth[3]>-1?Math.max(tmp[this.layer].grid.ChallengeDepth[3],0):challengeCompletions(this.layer, this.id)
                return 0.9 - (ChallengeDepth * 0.05);
            },
            rewardEffect() {
                let eff = new Decimal(1).plus(0.01 * challengeCompletions(this.layer, this.id));
                //if (player['awaken'].current == this.layer || player['awaken'].awakened.includes(this.layer)) eff = new Decimal(1).plus(0.02 * challengeCompletions(this.layer, this.id));
                return eff
            },
            unlocked() { return player[this.layer].best.gte(5) /*|| hasMilestone('ins', 1)*/ },
            goal() { 
                //if (player['awaken'].current == this.layer) return new Decimal("1e3650").times(Decimal.pow(1e10, challengeCompletions(this.layer, this.id)))
                return new Decimal(1e300).times(Decimal.pow(1e10, challengeCompletions(this.layer, this.id))) 
            },
            onEnter(){
                if (player['awaken'].current == this.layer){
                    player.points = new Decimal(0);
                    player.mem.points = new Decimal(0);
                    player.light.points = new Decimal(0);
                    player.dark.points = new Decimal(0);
                    player.kou.points = new Decimal(0);
                    player.lethe.points = new Decimal(0);
                    player.zero.points = new Decimal(0);
                    player.zero.roses = new Decimal(0);
                    player.axium.points = new Decimal(0);
                }
            },
            currencyDisplayName: "Fragments",
            currencyInternalName: "points",
            rewardDescription() { return "Fragment generation ^" + format(challengeEffect(this.layer, this.id)) },
        },
        22: {
            name: "Rationalism",
            completionLimit: 5,
            challengeDescription() {
                let des = "Memory gain ^^" + format(layers[this.layer].challenges[this.id].debuff());
                des += "<br>Completion times: " + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit
                return des
            },
            debuff() {//layers
                let ChallengeDepth = tmp['saya'].grid.ChallengeDepth[4]>-1?Math.max(tmp[this.layer].grid.ChallengeDepth[4],0):challengeCompletions(this.layer, this.id)
                return 0.9 - (ChallengeDepth * 0.05);
            },
            rewardEffect() {
                let eff = Decimal.pow(10, challengeCompletions(this.layer, this.id));
                //if (player['awaken'].current == this.layer || player['awaken'].awakened.includes(this.layer)) eff = Decimal.pow(15, challengeCompletions(this.layer, this.id)).times(tmp.saya.grid.ChallengeEffect.toKcha);
                return eff
            },
            unlocked() { return player[this.layer].best.gte(10) /*|| hasMilestone('ins', 1)*/ },
            goal() { 
                //if (player['awaken'].current == this.layer) return new Decimal("1e4470").times(Decimal.pow(1e10, challengeCompletions(this.layer, this.id))) 
                return new Decimal.pow(1e10, 38).times(Decimal.pow(1e10, challengeCompletions(this.layer, this.id))) 
            },
            onEnter(){
                if (player['awaken'].current == this.layer){
                    player.points = new Decimal(0);
                    player.mem.points = new Decimal(0);
                    player.light.points = new Decimal(0);
                    player.dark.points = new Decimal(0);
                    player.kou.points = new Decimal(0);
                    player.lethe.points = new Decimal(0);
                    player.zero.points = new Decimal(0);
                    player.zero.roses = new Decimal(0);
                    player.axium.points = new Decimal(0);
                }
            },
            currencyDisplayName: "Memories",
            currencyInternalName: "points",
            currencyLayer: "mem",
            rewardDescription() { return "Memory softcap starts x" + format(challengeEffect(this.layer, this.id)) + " later" },
        },
        31: {
            name: "Endless Festival",
            completionLimit: 5,
            challengeDescription() {
                let des = "Red Dolls effect ^" + format(layers[this.layer].challenges[this.id].debuff());
                des += "<br>Completion times: " + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit
                return des
            },
            debuff() {//layers
                let ChallengeDepth = tmp['saya'].grid.ChallengeDepth[5]>-1?Math.max(tmp[this.layer].grid.ChallengeDepth[5],0):challengeCompletions(this.layer, this.id)
                return 0.5 - (ChallengeDepth * 0.05);
            },
            rewardEffect() {
                let eff = Decimal.pow(1.25, challengeCompletions(this.layer, this.id));
                //if (player['awaken'].current == this.layer || player['awaken'].awakened.includes(this.layer)) eff = Decimal.pow(1.4, challengeCompletions(this.layer, this.id)).times(tmp.saya.grid.ChallengeEffect.toKcha)
                return eff;
            },
            unlocked() { return player[this.layer].best.gte(15) /*|| hasMilestone('ins', 1)*/ },
            goal() { 
                //if (player['awaken'].current == this.layer) return new Decimal(6900000).plus(Decimal.times(100000,challengeCompletions(this.layer, this.id)))
                return new Decimal(610).plus(Decimal.times(50, challengeCompletions(this.layer, this.id) + (Math.max(challengeCompletions(this.layer, this.id) - 1) * 0.25))) 
            },
            onEnter(){
                if (player['awaken'].current == this.layer){
                    player.points = new Decimal(0);
                    player.mem.points = new Decimal(0);
                    player.light.points = new Decimal(0);
                    player.dark.points = new Decimal(0);
                    player.kou.points = new Decimal(0);
                    player.lethe.points = new Decimal(0);
                    player.zero.points = new Decimal(0);
                    player.zero.roses = new Decimal(0);
                    player.axium.points = new Decimal(0);
                }
            },
            currencyDisplayName: "Red Rolls",
            currencyInternalName: "points",
            currencyLayer: "kou",
            rewardDescription() { return "Red Dolls effect x" + format(challengeEffect(this.layer, this.id)) },
        },
        32: {
            name: "Overhandling Rift",
            completionLimit: 5,
            challengeDescription() {
                let des = "Remove all your Guilding Beacons, and you can have " + formatWhole(layers[this.layer].challenges[this.id].debuff()) + " Guilding Beacons at most.";
                des += "<br>Completion times: " + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit
                return des
            },
            debuff() {//layers
                let ChallengeDepth = tmp['saya'].grid.ChallengeDepth[6]>-1?Math.max(tmp[this.layer].grid.ChallengeDepth[6],0):challengeCompletions(this.layer, this.id)
                return 22 - (ChallengeDepth * 3);
            },
            rewardEffect() {
                let eff = Decimal.pow(1.1, challengeCompletions(this.layer, this.id));
                //if (player['awaken'].current == this.layer || player['awaken'].awakened.includes(this.layer)) eff = Decimal.pow(1.25, challengeCompletions(this.layer, this.id)).times(tmp.saya.grid.ChallengeEffect.toKcha);
                return eff
            },
            onEnter() {
                player.lethe.upgrades = [];
                if (player['awaken'].current == this.layer){
                    //if (!confirm("Think carefully before you enter this challenge! Are you sure you are going to take this challenge?")){player[this.layer].activeChallenge=null;return;}
                    player.points = new Decimal(0);
                    player.mem.points = new Decimal(0);
                    player.light.points = new Decimal(0);
                    player.dark.points = new Decimal(0);
                    player.kou.points = new Decimal(0);
                    player.lethe.points = new Decimal(0);
                    player.zero.points = new Decimal(0);
                    player.zero.roses = new Decimal(0);
                    player.axium.points = new Decimal(0);
                };
            },
            unlocked() { return player[this.layer].best.gte(25) /*|| hasMilestone('ins', 1)*/ },
            goal() {
                //if (player['awaken'].current == this.layer) return new Decimal("1e4600").times(Decimal.pow(1e100, challengeCompletions(this.layer, this.id)))
                return new Decimal(1e270).times(Decimal.pow(1e5, challengeCompletions(this.layer, this.id))) 
            },
            currencyDisplayName: "Forgotten Drops",
            currencyInternalName: "points",
            currencyLayer: "lethe",
            rewardDescription() { return "Forgotten Drops effect x" + format(challengeEffect(this.layer, this.id)) },
        },
        41: {
            name: "Otherside of Godess",
            completionLimit: 5,
            challengeDescription() {
                let des = "Force a row5 reset every " + format(layers[this.layer].challenges[this.id].debuff()) + " seconds";
                des += "<br>Completion times: " + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit
                return des
            },
            debuff() {//layers
                let ChallengeDepth = tmp['saya'].grid.ChallengeDepth[7]>-1?Math.max(tmp[this.layer].grid.ChallengeDepth[7],0):challengeCompletions(this.layer, this.id)
                let debuff = 10 - (ChallengeDepth * 2)
                if ((player.saya.CurrentPairChallenge == null&&challengeCompletions('saya',this.id)>=5)||tmp['saya'].grid.ChallengeDepth[7]>=5) debuff = 60
                return Math.max(debuff, 0.5);
            },
            rewardEffect() {
                let eff = Decimal.pow(2, challengeCompletions(this.layer, this.id));
                //if (player['awaken'].current == this.layer || player['awaken'].awakened.includes(this.layer)) eff = Decimal.pow(3, challengeCompletions(this.layer, this.id)).times(tmp.saya.grid.ChallengeEffect.toKcha);
                return eff;
            },
            onExit() {
                player.saya.bestroses41 = new Decimal(0);
            },
            unlocked() { return player[this.layer].best.gte(35) && hasUpgrade('storylayer', 31) /*|| hasMilestone('ins', 1)*/ },
            goal() { 
                //if (player['awaken'].current == this.layer) return new Decimal("1e470").times(Decimal.pow(100, challengeCompletions(this.layer, this.id))) 
                return new Decimal(1500).times(Decimal.pow(2.5, challengeCompletions(this.layer, this.id))) 
            },
            onEnter(){
                if (player['awaken'].current == this.layer){
                    if (!confirm("Think carefully before you enter this challenge! Are you sure you are going to take this challenge?")){player[this.layer].activeChallenge=null;return;}
                    player.points = new Decimal(0);
                    player.mem.points = new Decimal(0);
                    player.light.points = new Decimal(0);
                    player.dark.points = new Decimal(0);
                    player.kou.points = new Decimal(0);
                    player.lethe.points = new Decimal(0);
                    player.zero.points = new Decimal(0);
                    player.zero.roses = new Decimal(0);
                    player.axium.points = new Decimal(0);
                }
            },
            canComplete() {
                let goal = this.goal();
                return player.saya.bestroses41.gte(goal) && !inChallenge('zero', 11);
            },
            goalDescription() { return format(this.goal()) + " Glowing Roses without entering Zero Sky." },
            rewardDescription() { return "Glowing Roses gain&effect x" + format(challengeEffect(this.layer, this.id)) },
        },
        42: {
            name: "Endless Chase",
            completionLimit: 5,
            challengeDescription() {
                let des = "Dark Matter effect reduces Light Tachyons gain&direct gain by log" + format(layers[this.layer].challenges[this.id].debuff()) + " and force open L&D's autobuyer.";
                des += "<br>Completion times: " + challengeCompletions(this.layer, this.id) + "/" + this.completionLimit
                return des
            },
            debuff() {//layers
                let ChallengeDepth = tmp['saya'].grid.ChallengeDepth[8]>-1?Math.max(tmp[this.layer].grid.ChallengeDepth[8],0):challengeCompletions(this.layer, this.id)
                return 10 - (ChallengeDepth * 2);
            },
            rewardEffect() {
                let LaheadD = player.light.points.div(player.dark.points.max(1));
                let eff = Decimal.pow(challengeCompletions(this.layer, this.id) + 1, LaheadD).max(1);
                //if (player['awaken'].current == this.layer || player['awaken'].awakened.includes(this.layer)) eff = Decimal.pow(challengeCompletions(this.layer, this.id) + 1, LaheadD.times(1.5)).max(1).times(tmp.saya.grid.ChallengeEffect.toKcha);
                return eff;
            },
            unlocked() { return player[this.layer].best.gte(40) && hasUpgrade('storylayer', 31) /*|| hasMilestone('ins', 1)*/ },
            goal() { 
                //if (player['awaken'].current == this.layer) return new Decimal(3e21).plus(Decimal.times(1e21, challengeCompletions(this.layer, this.id))) 
                return new Decimal(1.5e7).plus(Decimal.times(1000000, challengeCompletions(this.layer, this.id))) 
            },
            onEnter(){
                if (player['awaken'].current == this.layer){
                    player.points = new Decimal(0);
                    player.mem.points = new Decimal(0);
                    player.light.points = new Decimal(0);
                    player.dark.points = new Decimal(0);
                    player.kou.points = new Decimal(0);
                    player.lethe.points = new Decimal(0);
                    player.zero.points = new Decimal(0);
                    player.zero.roses = new Decimal(0);
                    player.axium.points = new Decimal(0);
                }
            },
            currencyDisplayName: "Light Tachyons",
            currencyInternalName: "points",
            currencyLayer: "light",
            rewardDescription() { return "Dark Matters gain x" + format(challengeEffect(this.layer, this.id)) + ", which are based on how much Light Tachyons are ahead of Dark Matters." },
        },

    },

    grid:{
        rows:8,
        cols:8,
        getStartData(id) {
            return 0//complete time
        },
        getUnlocked(id) {
            let rowNum = Math.floor(id/100)//从1开始
            let colNum = id % 100;

            return true
        },
        Sum_All_times(){
            let t = 0;
            for (index in player[this.layer].grid)
                t += player[this.layer].grid[index]
            return t;
        },
        ChallengeDepth(){
            if (player[this.layer].CurrentPairChallenge == null) return Array(8+1).fill(-1);
            let ChallengePrime = Math.floor(player[this.layer].CurrentPairChallenge/100)//从1开始
            let ChallengeSub = player[this.layer].CurrentPairChallenge % 100;
            let DepthArray = Array(8+1).fill(-1);
            DepthArray[ChallengePrime] = 4;
            DepthArray[ChallengeSub] = player[this.layer].grid[player[this.layer].CurrentPairChallenge];
            return DepthArray;
        },
        ChallengeTarget(){
            let basetarget = {frag:new Decimal("1e5500"),mem:new Decimal("1e7000")};
            if (player[this.layer].CurrentPairChallenge == null) return basetarget;
            basetarget.frag = basetarget.frag.times(Decimal.pow(1e100,this.Sum_All_times()))
            basetarget.mem = basetarget.mem.times(Decimal.pow(1e100,this.Sum_All_times()))
            //TODO:下面添加某些不同挑战参与时的修正值
            if (this.ChallengeDepth()[3]>-1) {basetarget.frag = basetarget.frag.div("1e2000").div(Decimal.pow(1e50,this.Sum_All_times()));basetarget.mem = basetarget.mem.div("1e500");}
            if (this.ChallengeDepth()[4]>-1) {basetarget.mem = basetarget.mem.div("1e2500").div(Decimal.pow(1e50,this.Sum_All_times()));basetarget.frag = basetarget.frag.div("1e500");}

            if (hasAchievement('a',135)) basetarget.frag = basetarget.frag.pow(achievementEffect('a',135));
            if (player['tempest'].grid[301].activated) basetarget.mem = basetarget.mem.pow(gridEffect('tempest',301));
            if (hasUpgrade('storylayer',53)){
                basetarget.frag = basetarget.frag.div(upgradeEffect('storylayer',53).EffectToMA);
                basetarget.mem = basetarget.mem.div(upgradeEffect('storylayer',53).EffectToMA);
            }

            return basetarget;
        },
        ChallengeDebuff(){
            let basedebuff = {frag:new Decimal(1),mem:new Decimal(1)};
            if (player[this.layer].CurrentPairChallenge == null) return basedebuff;
            basedebuff.frag = basedebuff.frag.sub(0.5*Math.sqrt(this.Sum_All_times()/280))
            basedebuff.mem = basedebuff.mem.sub(0.3*Math.sqrt(this.Sum_All_times()/280))

            //修正值
            if (hasMilestone('tempest',2)){
                basedebuff.frag = basedebuff.frag.pow(0.95);
                basedebuff.mem = basedebuff.mem.pow(0.95);
            }
            return basedebuff
        },
        ChallengeEffect(){
            let baseeff = {toKeff:new Decimal(1),toGEFO:new Decimal(1),toKcha:new Decimal(1)};
            //if (!player['awaken'].awakened.includes(this.layer)) return baseeff;
            baseeff.toKeff = Decimal.pow(this.Sum_All_times(),0.5).max(1);
            baseeff.toGEFO = new Decimal(this.Sum_All_times()*1.2+1)
            baseeff.toKcha = Decimal.pow(1.1,this.Sum_All_times());
            return baseeff;
        },
        getCanClick(data, id) {
            let rowNum = Math.floor(id/100)//从1开始
            let colNum = id % 100;
            if (rowNum == colNum) return false
            return true
        },
        onClick(data, id) {
            if (player[this.layer].FallbackPair) {
                if (data>0)
                    {
                        if (!confirm('You are going to fallback this challenge\'s Completed times by 1, are you sure?')) return;
                        player[this.layer].grid[id]--
                    }

            }
            else {
                if (player[this.layer].CurrentPairChallenge != id) {
                    player[this.layer].activeChallenge = null;
                    doReset(this.layer);//走个过场哈哈哈哈哈
                    player[this.layer].CurrentPairChallenge = id;
                    player.points = new Decimal(0);
                    player.mem.points = new Decimal(0);
                    player.light.points = new Decimal(0);
                    player.dark.points = new Decimal(0);
                    player.kou.points = new Decimal(0);
                    player.lethe.points = new Decimal(0);
                    player.zero.points = new Decimal(0);
                    player.zero.roses = new Decimal(0);
                    player.axium.points = new Decimal(0);
                    if (this.ChallengeDepth()[6] >= 0) player.lethe.upgrades = [];
                }
                else {
                    if (player.points.gte(this.ChallengeTarget().frag) || player.mem.points.gte(this.ChallengeTarget().mem))
                        if (player[this.layer].grid[id] < 5)
                            player[this.layer].grid[id]++;
                    doReset(this.layer);
                    player[this.layer].CurrentPairChallenge = null;
                }
            }
        },
        getDisplay(data, id){
            let rowNum = Math.floor(id/100)//从1开始
            let colNum = id % 100;
            if (rowNum==colNum) return "\\"
            let ChallengeDisplay = String(rowNum)+String(colNum);
            return ("<h1>"+ChallengeDisplay+"</h1><br>"+data)
        },
        getStyle(data,id){
            let rowNum = Math.floor(id/100)//从1开始
            let colNum = id % 100;
            const jss = {
                margin: '1px',
                borderRadius: 0,
                color: layers[this.layer].color,
                borderColor: layers[this.layer].color,
                backgroundColor: `${layers[this.layer].color}40`,
                borderWidth: '2px',
                height: '75px',
	            width: '75px',
            };
            let colorArray = RGBStringToArray(HexToRGBString(layers[this.layer].color));
            let baseArray = RGBStringToArray(HexToRGBString("#555555"));
            for (index in colorArray)
                colorArray[index] = Math.round((colorArray[index]-baseArray[index])*(data/5)+baseArray[index])
            let finalcolorHex = RGBToHexString(RGBArrayToString(colorArray));
            jss.color = finalcolorHex;
            jss.borderColor = finalcolorHex;
            jss.backgroundColor = `${finalcolorHex}40`;

            if (id == player[this.layer].CurrentPairChallenge) {
                jss.color = 'red';
                if (player.points.gte(this.ChallengeTarget().frag)||player.mem.points.gte(this.ChallengeTarget().mem))
                    {jss.borderColor = '#FFFF00'
                    jss.backgroundColor = '#FFFF0040'}
            };
            if (rowNum == colNum){
                jss.color = 'red';
                jss.borderColor = 'red';
                jss.backgroundColor = '#FF000040';
            }
            return jss;
        },
    },

    clickables:{
        11: {
            title: "Fallback Progress Mode",
            display() {return player[this.layer].FallbackPair?"ON":"OFF"},
            unlocked() { return player.saya.unlocked },
            canClick() { return !player[this.layer].CurrentPairChallenge},
            onClick() { 
                player[this.layer].FallbackPair = !player[this.layer].FallbackPair
            },
        },},
})