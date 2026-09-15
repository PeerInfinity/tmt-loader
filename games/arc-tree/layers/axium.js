addLayer("axium", {
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            unlockOrder: 0,
            canclickingclickables: [],
            movetimes: new Decimal(0),
            DirectioncanChoose: 1,
            actionpoint: 1,
            timesmoved: new Decimal(0),
            auto: false,
            demile: [],
        }
    },
    name: "Flourish", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "FL",
    color: "#716f5e",
    nodeStyle() {
        return {
            background: (player.axium.unlocked || canReset("axium")) ? ("radial-gradient(circle, #383838 0%,#383838 50%, #5f5911 100%)") : "#bf8f8f",
        }
    },
    resource: "Flourish Labyrinths",
    row: 3,
    //displayRow: 4,
    hotkeys: [
        { key: "F", description: "Shift+F: Reset for Flourish Labyrinths", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    position: 4,
    branches: ["dark"],

    baseResource: "Dark Matters",
    baseAmount() { return player.dark.points },

    requires: new Decimal(90000),

    type: "static",
    exponent() {
        //if (player['awaken'].current == 'axium'||player['awaken'].awakened.includes('axium')) return 1.4;
        return 1.5
    },
    roundUpCost: true,

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
        "Maze": {
            unlocked() { return hasMilestone('axium', 3) },
            content: [
                "main-display",
                "blank",
                "prestige-button",
                "resource-display",
                "blank",
                ["display-text", function () { return "You can move " + formatWhole(tmp.axium.movetimes) + " times at total." }],
                ["display-text", function () { return "You have moved " + formatWhole(player.axium.timesmoved) + " times." }],
                "blank",
                ["row", [["buyable", 11]]],
                ["blank", ["8px", "8px"]],
                ["row", [["buyable", 21], ["blank", ["8px", "8px"]], ["clickable", 11], ["blank", ["8px", "8px"]], ["buyable", 22]]],
                ["blank", ["8px", "8px"]],
                ["row", [["buyable", 31]]],
                "blank",
                //effect display
                ["column", [["display-text", function () { return "You have moved <h3>North</h3> " + formatWhole(player.axium.buyables[11]) + " times" }], "blank", ["display-text", function () { return "Which boosts your Luminous Churches & Flourish Labyrinths gain by " + format(buyableEffect('axium', 11)) + "x" }]], { width: "100%" }],
                "blank",
                "blank",
                ["row", [
                    ["column", [["display-text", function () { return "You have moved <h3>West</h3> " + formatWhole(player.axium.buyables[21]) + " times" }], "blank", ["display-text", function () { return "Which boosts your Glowing Roses gain by " + format(buyableEffect('axium', 21)) + "x" }]], { width: "50%" }],
                    ["column", [["display-text", function () { return "You have moved <h3>East</h3> " + formatWhole(player.axium.buyables[22]) + " times" }], "blank", ["display-text", function () { return "Which boosts other directions' effect by " + format(buyableEffect('axium', 22)) + "x" }]], { width: "50%" }],
                ]],
                "blank",
                "blank",
                ["column", [["display-text", function () { return "You have moved <h3>South</h3> " + formatWhole(player.axium.buyables[31]) + " times" }], "blank", ["display-text", function () { return "Which boosts The Speed of World Steps gain by " + format(buyableEffect('axium', 31)) + "x" }]], { width: "100%" }],
            ]
        },
        /*"Direction Synergy":{
            unlocked() { return player['awaken'].current == 'axium'||player['awaken'].awakened.includes('axium') },
            content:[
                "main-display",
                "blank",
                "prestige-button",
                "resource-display",
                "blank",
                ["display-text","Direction Synergies are based on the time of two Neighboring directions you move."],
                "blank",
                ["row",[
                    ["column",[
                        ["display-text",()=>{return "<h2>NorthWest Synergy</h2><br>Boost Star Point & Moon Point Effect by "+ format(tmp['axium'].AWeffect.NWeffect)+"x"}],
                        "blank",
                        ["display-text",()=>{return "<h2>SouthWest Synergy</h2><br>Boost Luminous Church Gain by "+ format(tmp['axium'].AWeffect.SWeffect)+"x"}],
                    ],{'width':'50%'}],
                    ["column",[
                        ["display-text",()=>{return "<h2>NorthEast Synergy</h2><br>Boost Everflashing Knife Effect by "+ format(tmp['axium'].AWeffect.NEeffect)+"x"}],
                        "blank",
                        ["display-text",()=>{return "<h2>SouthEast Synergy</h2><br>Boost Flourish Labyrinth Gain by "+ format(tmp['axium'].AWeffect.SEeffect)+"x"}],
                    ],{'width':'50%'}],
                ]]
            ],
            buttonStyle:{'backgroundColor':'#716f5e40'}
        },*/
    },


    gainMult() {
        let mult = new Decimal(1);
        if (hasChallenge('world', 12)) mult = mult.div(player.kou.buyables[11].max(1));
        if (hasMilestone('axium', 3)) mult = mult.div(buyableEffect('axium', 11));
        if (hasChallenge('world', 21)) mult = mult.div(challengeEffect('world', 21));
        if (hasAchievement('a', 71)) mult = mult.div(layers.world.fixedReward());
        if (hasUpgrade('lab', 144)) mult = mult.div(upgradeEffect('lab', 144));
        if (hasUpgrade('storylayer', 32)) mult = mult.div(upgradeEffect('storylayer', 32));
        if (hasUpgrade('lab', 163)) mult = mult.div(buyableEffect('lab', 33));
        if (hasMilestone('lib', 1)) mult = mult.div(layers.lib.libEffect().shirabe());
        if (hasMilestone('lib', 2)) mult = mult.div(layers.lib.libEffect().summer());
        //if (player['awaken'].current == 'zero'||player['awaken'].awakened.includes('zero')) mult = mult.div(tmp["zero"].challenges[11].effectAWtoLCFL);
        //if (player['awaken'].current == 'axium'||player['awaken'].awakened.includes('axium')) mult = mult.div(tmp['axium'].AWeffect.SEeffect); 
        //if (player.fracture.unlocked){
        //    if (layers['fracture'].grid.return_Equiped_Equipment_Num(21)>=1) mult=mult.div(player['tempest'].milestonePoints.total).div(layers['fracture'].grid.return_Equiped_Equipment_Num(21)).div(25);
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
    autoPrestige() {
        //if (layers['axium'].deactivated()) return false;
        return (hasMilestone('saya', 3) && player.axium.auto)
    },
    canBuyMax() { return hasMilestone('saya', 4) /*|| player['awaken'].current == 'axium' || player['awaken'].current == 'zero' || player['awaken'].current == 'zero' || player['awaken'].current == 'etoluna' || player['awaken'].current == 'saya'*/ },
    resetsNothing() { return hasMilestone('saya', 5) },

    milestones: {
        0: {
            requirementDescription: "1 total Flourish Labyrinth",
            done() { return player.axium.total.gte(1) },
            unlocked() { return player.axium.unlocked },
            effectDescription: "Keep all except last milestones of Forgotten Drop Layer when LC or FL reset.",
        },
        1: {
            requirementDescription: "2 total Flourish Labyrinths",
            done() { return player.axium.total.gte(2) },
            unlocked() { return player.axium.unlocked },
            effectDescription: "Keep last milestones of Forgotten Drop Layer when LC or FL reset.",
        },
        2: {
            requirementDescription: "5 total Flourish Labyrinths",
            done() { return player.axium.total.gte(5) },
            unlocked() { return player.axium.unlocked },
            effectDescription: "Flourish Labyrinth boosts Research Points gain & Keep central 9 Guiding Beacons when reset.",
        },
        3: {
            requirementDescription: "8 total Flourish Labyrinths",
            done() { return player.axium.total.gte(8) },
            unlocked() { return player.axium.unlocked },
            onComplete() {
                player.axium.canclickingclickables = layers.axium.canclickingclickables(layers.axium.DirectioncanChoose());
            },
            effectDescription: "Unlock Maze & FL now boosts World Step gain.",
        },
        4: {
            requirementDescription: "6 best Flourish Labyrinths",
            done() { return player.axium.best.gte(6) && hasMilestone('axium', 3) },
            unlocked() { return hasMilestone('axium', 3) },
            effectDescription: "Your movetime limit now calculated based on total Flourish Labyrinths you gain instead of best Flourish Labyrinths you have.",
        },
    },
    milestonePopups(){
        //if (player['awaken'].current == this.layer || player['awaken'].awakened.includes(this.layer)) return false;
     return true;
 },

    shouldNotify() {
        let buyableid = [11, 21, 22, 31];
        if (hasUpgrade("storylayer", 15)) return false;
        for (var i = 0; i < buyableid.length; i++) {
            if (tmp.axium.buyables[buyableid[i]].canAfford) {
                return true;
            };
        }
    },

    update(diff) {
        if (player.axium.actionpoint <= 0) {
            player.axium.canclickingclickables = layers.axium.canclickingclickables(layers.axium.DirectioncanChoose());
            player.axium.timesmoved = player.axium.timesmoved.plus(1);
            player.axium.actionpoint = layers.axium.actionpoint();
        };


        let buyableid = [11, 21, 22, 31];

        if (layers.axium.movetimes().gt(tmp.axium.timesmoved) && hasUpgrade('lab', 171)) {
            let buyableid = [11, 21, 22, 31];
            for (var i = 0; i < buyableid.length; i++)player.axium.buyables[buyableid[i]] = layers.axium.movetimes();
            player.axium.timesmoved = layers.axium.movetimes();
        };

        for (var i = 0; i < buyableid.length; i++) {
            if (tmp.axium.buyables[buyableid[i]].autoed && player.axium.canclickingclickables.includes(buyableid[i].toString())&&tmp.axium.movetimes.gt(player.axium.timesmoved)) {
                layers.axium.buyables[buyableid[i]].buy();
            };
        }

    },

    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone('etoluna', 1) || hasMilestone('saya', 1)) keep.push("milestones");
        if (hasMilestone('saya', 3) /*|| (resettingLayer == 'awaken' && player['awaken'].current == null)*/) keep.push("auto");
        if (layers[resettingLayer].row > this.row) {
            layerDataReset('axium', keep);
            let keepmilestone = [];
            if (hasMilestone('etoluna', 0)) { keepmilestone = keepmilestone.concat([0]); player[this.layer].total = player[this.layer].total.plus(3) }
            if (hasMilestone('saya', 0)) keepmilestone = keepmilestone.concat([0, 1, 2, 3])
            for (var i = 0; i < keepmilestone.length; i++) {
                if (!hasMilestone('axium', keepmilestone[i])) player.axium.milestones.push(keepmilestone[i]);
                if (keepmilestone[i] = 3) player.axium.canclickingclickables = layers.axium.canclickingclickables(layers.axium.DirectioncanChoose());
            }
        }
    },


    //maze releated
    canclickingclickables(n) {//use layers
        let buyableid = ['11', '21', '22', '31'];//TMT原来的clickable返回的不是数组，得单独保存其编号。
        let shouldcanclick = [];

        for (var i = 1; i <= n; i++) {
            randindex = Math.floor(Math.random() * (buyableid.length));//0~数组长-1
            shouldcanclick.push(buyableid[randindex]);
            buyableid.splice(randindex, 1);
        };

        return shouldcanclick
    },

    DirectioncanChoose() {
        let num = 1;
        if (hasAchievement('a', 72)) num = 2;
        if (hasAchievement('a', 82)) num = 3;
        if (hasAchievement('a', 84)) num = 4;
        return num;
    },

    movetimes() {//use tmp
        let mt = player[this.layer].best.times(2);
        if (hasMilestone('axium', 4)) mt = player[this.layer].total.times(2);
        if (hasChallenge('world', 21)) mt = mt.plus(player.world.best.div(5).sqrt());
        if (hasAchievement('a', 64)) mt = mt.plus(5);
        if (hasUpgrade('lab', 114)) mt = mt.plus(upgradeEffect('lab', 114));
        if (hasUpgrade('lab', 142)) mt = mt.plus(upgradeEffect('lab', 142));
        if (hasMilestone('saya', 2)) mt = mt.plus(10);
        if (hasUpgrade('lab', 182)) mt = mt.plus(upgradeEffect('lab', 182));

        if (hasAchievement('a', 93)) mt = mt.times(2);
        //if (hasUpgrade('dark', 43)) mt = mt.times(upgradeEffect('dark', 43));
        //if(player.tempest.grid[102].activated) mt = mt.times(gridEffect('tempest',102));

        mt = softcap(mt,new Decimal(3e100),new Decimal(0.25));
        mt = mt.round();

        //AW
        //if (player['awaken'].selectionActive && player['awaken'].current != null && player['awaken'].current != this.layer && !player['awaken'].awakened.includes(this.layer)) return new Decimal(0);

        return mt;
    },

    actionpoint() {//use tmp && !use Decimal && use layers when call
        let ap = 1;
        if (hasUpgrade('storylayer', 15)) ap = 4;
        return ap;
    },

    buyables: {
        rows: 3,
        cols: 2,
        11: {
            title: "",
            display: "↑",
            unlocked() { return hasMilestone('axium', 3) },
            canAfford() {
                if (this.autoed())return false;
                if (tmp.axium.movetimes.lte(player.axium.timesmoved)) return false;
                for (var i = 0; i < player.axium.canclickingclickables.length; i++) {
                    if (this.id == player.axium.canclickingclickables[i]) return true;
                }
                return false;
            },
            buy() {
                player.axium.actionpoint = player.axium.actionpoint - 1;
                player.axium.buyables[this.id] = player.axium.buyables[this.id].plus(1);
                for (var i = 0; i < player.axium.canclickingclickables.length; i++) {
                    if (this.id == player.axium.canclickingclickables[i]) { player.axium.canclickingclickables.splice(i, 1); };
                };
            },
            effect() {
                let eff = player.axium.buyables[this.id].div(2).plus(1);
                if (hasUpgrade('lab', 131)) eff = player.axium.buyables[this.id].div(1.5).plus(1);
                eff = eff.times(buyableEffect('axium', 22));
                if (hasMilestone('lib', 1)) eff = eff.times(layers.lib.libEffect().shirabe());
                //if (hasUpgrade('lethe', 81)) eff = eff.times(upgradeEffect('lethe', 81));
                //if (hasUpgrade('lethe', 91)) eff = eff.times(upgradeEffect('lethe', 91));
                //if (hasUpgrade('lethe', 101)) eff = eff.times(upgradeEffect('lethe', 101));
                //if (hasUpgrade('lethe', 102)) eff = eff.times(upgradeEffect('lethe', 102));
                //if (hasUpgrade('lethe', 103)) eff = eff.times(upgradeEffect('lethe', 103));

                //if (player.tempest.activeChallenge!=null) eff = eff.pow(tmp.tempest.nerf_in_challenges.toMazeEff());

                //AW
                //if (player['awaken'].selectionActive && player['awaken'].current != null && player['awaken'].current != this.layer && !player['awaken'].awakened.includes(this.layer)) return new Decimal(1);

                return eff;
            },
            autoed() { return hasUpgrade('storylayer', 15) },
            style: { width: "100px", height: "100px" },
        },
        21: {
            title: "",
            display: "←",
            unlocked() { return hasMilestone('axium', 3) },
            canAfford() {
                if (this.autoed())return false;
                if (tmp.axium.movetimes.lte(player.axium.timesmoved)) return false;
                for (var i = 0; i < player.axium.canclickingclickables.length; i++) {
                    if (this.id == player.axium.canclickingclickables[i]) return true;
                }
                return false;
            },
            buy() {
                player.axium.actionpoint = player.axium.actionpoint - 1;
                player.axium.buyables[this.id] = player.axium.buyables[this.id].plus(1);
                for (var i = 0; i < player.axium.canclickingclickables.length; i++) {
                    if (this.id == player.axium.canclickingclickables[i]) { player.axium.canclickingclickables.splice(i, 1); };
                };
            },
            effect() {
                let eff = player.axium.buyables[this.id].div(20).plus(1);
                if (hasUpgrade('lab', 133)) eff = player.axium.buyables[this.id].div(10).plus(1);
                eff = eff.times(buyableEffect('axium', 22));
                if (hasMilestone('lib', 1)) eff = eff.times(layers.lib.libEffect().shirabe());
                //if (hasUpgrade('lethe', 81)) eff = eff.times(upgradeEffect('lethe', 81));
                //if (hasUpgrade('lethe', 91)) eff = eff.times(upgradeEffect('lethe', 91));
                //if (hasUpgrade('lethe', 101)) eff = eff.times(upgradeEffect('lethe', 101));
                //if (hasUpgrade('lethe', 102)) eff = eff.times(upgradeEffect('lethe', 102));
                //if (hasUpgrade('lethe', 103)) eff = eff.times(upgradeEffect('lethe', 103));

                //if (player.tempest.activeChallenge!=null) eff = eff.pow(tmp.tempest.nerf_in_challenges.toMazeEff());

                //AW
                //if (player['awaken'].selectionActive && player['awaken'].current != null && player['awaken'].current != this.layer && !player['awaken'].awakened.includes(this.layer)) return new Decimal(1);

                return eff;
            },
            autoed() { return hasUpgrade('storylayer', 15) },
            style: { width: "100px", height: "100px" },
        },
        22: {
            title: "",
            display: "→",
            unlocked() { return hasMilestone('axium', 3) },
            canAfford() {
                if (this.autoed())return false;
                if (tmp.axium.movetimes.lte(player.axium.timesmoved)) return false;
                for (var i = 0; i < player.axium.canclickingclickables.length; i++) {
                    if (this.id == player.axium.canclickingclickables[i]) return true;
                }
                return false;
            },
            buy() {
                player.axium.actionpoint = player.axium.actionpoint - 1;
                player.axium.buyables[this.id] = player.axium.buyables[this.id].plus(1);
                for (var i = 0; i < player.axium.canclickingclickables.length; i++) {
                    if (this.id == player.axium.canclickingclickables[i]) { player.axium.canclickingclickables.splice(i, 1); };
                };
            },
            effect() {
                let eff = player.axium.buyables[this.id].div(50).plus(1);
                if (hasUpgrade('lab', 132)) eff = player.axium.buyables[this.id].div(25).plus(1);
                if (hasMilestone('lib', 1)) eff = eff.times(layers.lib.libEffect().shirabe());
                //if (hasUpgrade('lethe', 81)) eff = eff.times(upgradeEffect('lethe', 81));
                //if (hasUpgrade('lethe', 91)) eff = eff.times(upgradeEffect('lethe', 91));
                //if (hasUpgrade('lethe', 101)) eff = eff.times(upgradeEffect('lethe', 101));
                //if (hasUpgrade('lethe', 102)) eff = eff.times(upgradeEffect('lethe', 102));
                //if (hasUpgrade('lethe', 103)) eff = eff.times(upgradeEffect('lethe', 103));

                //if (player.tempest.activeChallenge!=null) eff = eff.pow(tmp.tempest.nerf_in_challenges.toMazeEff());

                //AW
                //if (player['awaken'].selectionActive && player['awaken'].current != null && player['awaken'].current != this.layer && !player['awaken'].awakened.includes(this.layer)) return new Decimal(1);

                return eff;
            },
            autoed() { return hasUpgrade('storylayer', 15) },
            style: { width: "100px", height: "100px" },
        },
        31: {
            title: "",
            display: "↓",
            unlocked() { return hasMilestone('axium', 3) },
            canAfford() {
                if (this.autoed())return false;
                if (tmp.axium.movetimes.lte(player.axium.timesmoved)) return false;
                for (var i = 0; i < player.axium.canclickingclickables.length; i++) {
                    if (this.id == player.axium.canclickingclickables[i]) return true;
                }
                return false;
            },
            buy() {
                player.axium.actionpoint = player.axium.actionpoint - 1;
                player.axium.buyables[this.id] = player.axium.buyables[this.id].plus(1);
                for (var i = 0; i < player.axium.canclickingclickables.length; i++) {
                    if (this.id == player.axium.canclickingclickables[i]) { player.axium.canclickingclickables.splice(i, 1); };
                };
            },
            effect() {
                let eff = player.axium.buyables[this.id].div(5).plus(1);
                if (hasUpgrade('lab', 134)) eff = player.axium.buyables[this.id].div(4).plus(1);
                eff = eff.times(buyableEffect('axium', 22));
                if (hasMilestone('lib', 1)) eff = eff.times(layers.lib.libEffect().shirabe());
                //if (hasUpgrade('lethe', 81)) eff = eff.times(upgradeEffect('lethe', 81));
                //if (hasUpgrade('lethe', 91)) eff = eff.times(upgradeEffect('lethe', 91));
                //if (hasUpgrade('lethe', 101)) eff = eff.times(upgradeEffect('lethe', 101));
                //if (hasUpgrade('lethe', 102)) eff = eff.times(upgradeEffect('lethe', 102));
                //if (hasUpgrade('lethe', 103)) eff = eff.times(upgradeEffect('lethe', 103));

                //if (player.tempest.activeChallenge!=null) eff = eff.pow(tmp.tempest.nerf_in_challenges.toMazeEff());

                //AW
                //if (player['awaken'].selectionActive && player['awaken'].current != null && player['awaken'].current != this.layer && !player['awaken'].awakened.includes(this.layer)) return new Decimal(1);

                return eff;
            },
            autoed() { return hasUpgrade('storylayer', 15) },
            style: { width: "100px", height: "100px" },
        },
    },
    clickables: {
        11: {
            title: "Mental Breakdown",
            display: "",
            unlocked() { return hasMilestone('axium', 3) },
            canClick() { return player.axium.timesmoved.gt(0) },
            onClick() {
                if (!confirm("It's okay to be mad when you get lost in the Maze……But are you sure there is no other way out?")) return;
                player.axium.timesmoved = new Decimal(0);
                player.axium.actionpoint = layers.axium.actionpoint();
                player.axium.buyables[11] = new Decimal(0);
                player.axium.buyables[21] = new Decimal(0);
                player.axium.buyables[22] = new Decimal(0);
                player.axium.buyables[31] = new Decimal(0);
                player.axium.canclickingclickables = layers.axium.canclickingclickables(layers.axium.DirectioncanChoose());
            },
            style: { width: "150px", height: "150px" },
        },
    },
})