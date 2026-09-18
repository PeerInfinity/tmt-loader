var tickPerSec = new Decimal(25);
addLayer("w", {
    name: "water", // This is optional, only used in a few places. If absent, it just uses the layer id.
    symbol: "W", // This appears on the layer's node. Default is the id with the first letter capitalized.
    position: 1, // Horizontal position within a row. By default, it uses the layer id and sorts in alphabetical order.
    branches: ["h", "o"],
    effect() {
        return player[this.layer].points.sqrt().add(1);
    },
    effectDescription() {
        return "which is generating water vapor at " + String(player.w.vgain.round()) + "/sec";
    },
    startData() { 
        return {
            unlocked: false,
            points: new Decimal(0),
            v: new Decimal(0),
            vgain: new Decimal(0),
            dew: new Decimal(0),
            dgain: new Decimal(0),
        };
    },
    color: "#88BBFF",
    requires: new Decimal(1000), // Can be a function that takes requirement increases into account.
    resource: "water", // Name of prestige currency.
    baseResource: "H,2O", // Name of resource prestige is based on.
    baseAmount() { 
        if (player.h.points.lt(player.o.points.multiply(2))) return player.h.points;
        return player.o.points.multiply(2);
    }, // Get the current amount of baseResource.
    type: "static", // 'normal': cost to gain currency depends on amount gained. 'static': cost depends on how much you already have.
    exponent: 0.3, // Prestige currency exponent.
    canBuyMax() {
        if (hasMilestone("w", 2)) {
            return true
        }
        else {
            return false
        }
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses.
        let mult = new Decimal(1);
        if (hasUpgrade("nh", 12)) {
            mult = mult.times(upgradeEffect("nh", 12))
        }
        return mult;
    },
    gainExp() { // Calculate the exponent on main currency from bonuses.
        return new Decimal(1);
    },
    row: 1, // Row the layer is in on the tree (0 is the first row).
    doReset(resettingLayer){
        let keep=[];
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep);
        if (layers[resettingLayer].row > this.row){player.w.v=new Decimal(0);}
        if (layers[resettingLayer].row > this.row){player.w.dew=new Decimal(0);}
    },
    update(diff) {
        if(!player.w.unlocked) return;
        let vbasegain = player.w.points.mul(0.1);
        let dbasegain = new Decimal(0)
        if (vbasegain == 0) {
            vbasegain = new Decimal(1)
        }
        let vmult = new Decimal(1);
        let dmult = new Decimal(1);
        if (getBuyableAmount("w",11) !== 0) {
            vbasegain = vbasegain.add(buyableEffect("w", 11))
        }
        if (getBuyableAmount("w",12) !== 0) {
            dbasegain = dbasegain.add(buyableEffect("w", 12))
        }
        let tempvgain = new Decimal(0).plus(vbasegain).mul(vmult).times(diff)
        let tempdgain = new Decimal(0).plus(dbasegain).mul(dmult).times(diff)
        if (tempvgain >= player.w.vgain) {
            player.w.vgain = tempvgain
        }
        if (tempdgain >= player.w.dgain) {
            player.w.dgain = tempdgain
        }
        player.w.dew = player.w.dew.plus(player.w.dgain);
        player.w.v = player.w.v.plus(player.w.vgain);
    },
    buyables: {
        11: {
            title: "Evaporation",
            cost(x) { return new Decimal(1).mul(x.add(1)).pow(1.3).round(); },
            display() { return "Evaporate water and boost generatation of water vapor. \nCost: " + String(this.cost()) + "\nCurrently: +" + String(buyableEffect("w", 11)) + " water vapor / sec"; },
            canAfford() { return player[this.layer].points.gte(this.cost()); },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost());
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
            },
            effect(x) { return new Decimal(1).mul(getBuyableAmount(this.layer, this.id)).mul(2); },
        },
        12: {
            title: "Condensation",
            cost(x) { return new Decimal(1.2).mul(x.add(1)).pow(1.3).round(); },
            display() { return "Condense water and generate dew. \nCost: " + String(this.cost()) + "\nCurrently: +" + String(buyableEffect("w", 12)) + " dew / sec"; },
            canAfford() { return player[this.layer].points.gte(this.cost()); },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost());
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
            },
            effect(x) { return new Decimal(1).mul(getBuyableAmount(this.layer, this.id)).pow(1.3); },
        },
    },
    milestones: {
        0: {
            requirementDescription: "3 water",
            effectDescription: "keep hydrogen upgrades on reset",
            done() { return player.w.points.gte(3); },
        },
        1: {
            requirementDescription: "8 water",
            effectDescription: "keep oxygen upgrades on reset",
            done() { return player.w.points.gte(8); },
        },
        2: {
            requirementDescription: "10 water",
            effectDescription: "you now buy max water",
            done() { return player.w.points.gte(10); },
        },
    },
    tabFormat: {
        "Water": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                ["display-text",
                    function() { return 'You are generating ' + format(player.w.vgain.mul(tickPerSec)) + ' water vapor every second'},
                    { "font-size": "12px" },
                ],
                ["display-text",
                    function() { return 'You are generating ' + format(player.w.dgain.mul(tickPerSec)) + ' dew every second'},
                    { "font-size": "12px" },
                ],
                "blank",
                "milestones",
                "blank",
            ],
        },
        "Water Cycle": {
            unlocked() {
                return true;
            },
            content: [
                "main-display",
                "blank",
                ["display-text",
                    function() { return 'You have ' + format(player.w.v) + ' water vapor, boosting vapor generation by ' + format(player.w.v.pow(0.15)); },
                    { "font-size": "12px" },
                ],
                ["display-text",
                    function() { return 'You have ' + format(player.w.dew) + ' dew, boosting hydrogen generation by ' + format(player.w.dew.plus(1).sqrt()); },
                    { "font-size": "12px" },
                ],
                ["display-text",
                    function() { return 'You are generating ' + format(player.w.vgain.mul(tickPerSec)) + ' water vapor every second'},
                    { "font-size": "12px" },
                ],
                ["display-text",
                    function() { return 'You are generating ' + format(player.w.dgain.mul(tickPerSec)) + ' dew every second'},
                    { "font-size": "12px" },
                ],
                "blank",
                "blank",
                "buyables",
                "blank",
            ],
        },
    },
    hotkeys: [
        { key: "w", description: "W: Reset for water", onPress() { if (canReset(this.layer)) doReset(this.layer); } },
    ],
    layerShown() { 
        return hasUpgrade("o", 31) || hasAchievement("a", 14);
    },
});
