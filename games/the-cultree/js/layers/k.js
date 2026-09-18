addLayer("k", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
        unlocked: false,
        sta: new Decimal(1),
        str: new Decimal(1),
        spd: new Decimal(1),
        int: new Decimal(1),
        wis: new Decimal(1),
        lck: new Decimal(1),
        maths: 0,
        math1: 1,
        math2: 1,
        lckfactor: new Decimal(0.1),
        lckmult: new Decimal(1),
        stamleft: new Decimal(1),
        stammax: new Decimal(1),
        prog: new Decimal(0),
        retry: false,
        saved: 11,
        trainspeed: new Decimal(1),
    }},
    tabFormat: [
        "main-display",
        "blank",
        "prestige-button",
        ["infobox", "training"],
        ["row", 
        [["display-text", function() { return "STA<br>"+format(player.k.sta) },{ "color": "yellow", "font-size": "32px"}],"blank","blank",
         ["display-text", function() { return "STR<br>"+format(player.k.str) },{ "color": "red", "font-size": "32px"}],"blank","blank",
         ["display-text", function() { return "SPD<br>"+format(player.k.spd) },{ "color": "blue", "font-size": "32px"}],
        ]],
        ["row",
        [["display-text", function() { return "INT<br>"+format(player.k.int) },{ "color": "orange", "font-size": "32px"}],"blank","blank",
         ["display-text", function() { return "WIS<br>"+format(player.k.wis) },{ "color": "purple", "font-size": "32px"}],"blank","blank",
         ["display-text", function() { return "LCK<br>"+format(player.k.lck) },{ "color": "green", "font-size": "32px"}],
        ]],
        "blank",
        ["microtabs", "training"],
    ],
    color: "#00cead",                       // The color for this layer, which affects many elements.
    resource: "Chi",                       // The name of this layer's main prestige resource.
    row: 2,                                 // The row this layer is on (0 is the first row).
    displayRow: 1,
    position: 2,
    branches: ["c"],
    baseResource: "Conviction",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.c.points },  // A function to return the current amount of baseResource.
    requires: new Decimal(10000),               // The amount of the base needed to  gain 1 of the prestige currency. 
                                            // Also the amount required to unlock the layer.
    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 1,                          // "normal" prestige gain is (currency^exponent).
    hotkeys: [
        {key: "k", description: "k: Reset for Chi", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        return new Decimal(1)               // Factor in any bonuses multiplying gain here.
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },
    layerShown() { return true },
    effectDescription() {
        return ""
    },
    update(diff) {
        if ([11,21,31,41,51,01].some(id => inChallenge(this.layer,id))) 
            player.k.stamleft = player.k.stamleft.minus(new Decimal(0.05).mul(Decimal.log10(player.k.spd.pow(2).add(9))).div(Decimal.log10(player.k.int.add(9))).mul(player.k.trainspeed))
        if ([12,22,32,42,52,02].some(id => inChallenge(this.layer,id))) 
            player.k.stamleft = player.k.stamleft.minus(new Decimal(0.20).mul(Decimal.log10(player.k.spd.pow(2).add(9))).div(Decimal.log10(player.k.int.add(9))).mul(player.k.trainspeed))
        if ([13,23,33,43,53,03].some(id => inChallenge(this.layer,id))) 
            player.k.stamleft = player.k.stamleft.minus(new Decimal(1.25).mul(Decimal.log10(player.k.spd.pow(2).add(9))).div(Decimal.log10(player.k.int.add(9))).mul(player.k.trainspeed))
        if ([14,24,34,44,54,04,71].some(id => inChallenge(this.layer,id))) 
            player.k.stamleft = player.k.stamleft.minus(new Decimal(7.5).mul(Decimal.log10(player.k.spd.pow(2).add(9))).div(Decimal.log10(player.k.int.add(9))).mul(player.k.trainspeed))
        if ([05,72].some(id => inChallenge(this.layer,id))) 
            player.k.stamleft = player.k.stamleft.minus(new Decimal(50).mul(Decimal.log10(player.k.spd.pow(2).add(9))).div(Decimal.log10(player.k.int.add(9))).mul(player.k.trainspeed))
        if ([06,73].some(id => inChallenge(this.layer,id))) 
            player.k.stamleft = player.k.stamleft.minus(new Decimal(500).mul(Decimal.log10(player.k.spd.pow(2).add(9))).div(Decimal.log10(player.k.int.add(9))).mul(player.k.trainspeed))
        if ([07,74].some(id => inChallenge(this.layer,id))) 
            player.k.stamleft = player.k.stamleft.minus(new Decimal(5000).mul(Decimal.log10(player.k.spd.pow(2).add(9))).div(Decimal.log10(player.k.int.add(9))).mul(player.k.trainspeed))

        if ([11,12,13,14,21,22,23,24,31,32,33,34,41,42,43,44,51,52,53,54,71,72,73,74,01,02,03,04,05,06,07,08,09].some(id => inChallenge(this.layer,id)))  
            player.k.prog = player.k.prog.add(new Decimal(0.005).mul(Decimal.log10(player.k.str.add(9))).mul(Decimal.log10(player.k.wis.add(9))).mul(Decimal.log10(player.k.lck.add(9))).mul(Decimal.log10(player.k.spd.pow(2).add(9))).mul(player.k.trainspeed))
 
        if (player.k.stamleft.lte(0)) {
            player.k.saved = player.k.activeChallenge
            run(tmp.k.challenges[player.k.activeChallenge].onExit)
            Vue.set(player["k"], "activeChallenge", null)
            player.k.resetTime = 0
            if (player.k.retry) player.k.activeChallenge = player.k.saved
            return
        } 
    },
    componentStyles: {
        "challenge"() {return {"height":"200px","font-size":"15px"}},
    },
    microtabs: {
        training: {
            upg: {
                content: [
                    "blank",
                    ["bar", "staBar"],
                    "blank",
                    "buyables",
                    "blank",
                    "upgrades",
                ]
            },
            sta: {
                unlocked() { return hasUpgrade("k",11) },
                content: [
                    "blank",
                    ["bar", "staBar"],
                    ["row",[["toggle",["k", "retry"]],["display-text","<- Auto Repeat Last Training"]]],
                    "h-line",
                    ["display-text", function() { return "STA" },{ "color": "white", "font-size": "30px"}],
                    ["row",[["challenge", 11],["challenge", 12]]],
                    ["row",[["challenge", 13],["challenge", 71]]],
                    ["row",[["challenge", 72],["challenge", 73]]],
                    ["challenge", 74],
                ]
            },
            str: {
                unlocked() { return hasUpgrade("k",13) },
                content: [
                    "blank",
                    ["bar", "staBar"],
                    ["row",[["toggle",["k", "retry"]],["display-text","<- Auto Repeat Last Training"]]],
                    "h-line",
                    ["display-text", function() { return "STR" },{ "color": "white", "font-size": "30px"}],
                    ["row",[["challenge", 21],["challenge", 22]]],
                    ["row",[["challenge", 23],["challenge", 71]]],
                    ["row",[["challenge", 72],["challenge", 73]]],
                    ["challenge", 74],
                ]
            },
            spd: {
                unlocked() { return hasUpgrade("k",13) },
                content: [
                    "blank",
                    ["bar", "staBar"],
                    ["row",[["toggle",["k", "retry"]],["display-text","<- Auto Repeat Last Training"]]],
                    "h-line",
                    ["display-text", function() { return "SPD" },{ "color": "white", "font-size": "30px"}],
                    ["row",[["challenge", 31],["challenge", 32]]],
                    ["row",[["challenge", 33],["challenge", 71]]],
                    ["row",[["challenge", 72],["challenge", 73]]],
                    ["challenge", 74],
                ]
            },
            int: {
                unlocked() { return hasUpgrade("k",14) },
                content: [
                    "blank",
                    ["bar", "staBar"],
                    ["row",[["toggle",["k", "retry"]],["display-text","<- Auto Repeat Last Training"]]],
                    "h-line",
                    ["display-text", function() { return "INT" },{ "color": "white", "font-size": "30px"}],
                    ["display-text", function() { return player.k.math1+"*"+player.k.math2+"=?" },{ "color": "white", "font-size": "30px"}],
                    ["text-input","maths"],
                    ["clickable",21],
                    ["row",[["challenge", 41],["challenge", 42]]],
                    ["row",[["challenge", 43],["challenge", 71]]],
                    ["row",[["challenge", 72],["challenge", 73]]],
                    ["challenge", 74],
                ]
            },
            wis: {
                unlocked() { return hasUpgrade("k",14) },
                content: [
                    "blank",
                    ["bar", "staBar"],
                    ["row",[["toggle",["k", "retry"]],["display-text","<- Auto Repeat Last Training"]]],
                    "h-line",
                    ["display-text", function() { return "WIS" },{ "color": "white", "font-size": "30px"}],
                    ["row",[["challenge", 51],["challenge", 52]]],
                    ["row",[["challenge", 53],["challenge", 71]]],
                    ["row",[["challenge", 72],["challenge", 73]]],
                    ["challenge", 74],
                ]
            },
            lck: {
                unlocked() { return hasUpgrade("k",15) },
                content: [
                    "h-line",
                    ["display-text", function() { return "LCK" },{ "color": "white", "font-size": "30px"}],
                    ["row",[["clickable", 11],["clickable", 12],["clickable", 13]]],
                ]
            },
            compete: {
                unlocked() { return hasUpgrade("k",12) },
                content: [
                    "blank",
                    ["bar", "staBar"],
                    "blank",
                    ["display-text", function() { return "DOJO" },{ "color": "white", "font-size": "32px"}],
                    "milestones",
                    ["challenge", 01],
                    ["challenge", 02],
                    ["challenge", 03],
                    ["challenge", 04],
                    ["challenge", 05],
                    ["challenge", 06],
                    ["challenge", 07],
                    ["challenge", 08],
                    ["challenge", 09],
                    ["display-text", function() { return "TRACK" },{ "color": "white", "font-size": "32px"}],
                    ["display-text", function() { return "GYM" },{ "color": "white", "font-size": "32px"}],
                ],
            },    
        },
    },
    infoboxes: {
        training: {
            title: "Training",
            body() { 
                let dis = "This is for explaining how this shit works: It doesn't.<br>But you spend the time in the thing to increase the things to be able to beat the things."
                dis = dis+"<br><br><br> Psuedo Implemented STATS training. Formulas need work, but you can gain them, and they help complete the belts."
                dis = dis+"<br> ONLY THE BELTS HAVE AN EFFECT OUTSIDE THIS LAYER."
                dis = dis+"<br>"
                dis = dis+"<br>STA: Stamina"
                dis = dis+"<br>STR: Strength"
                dis = dis+"<br>SPD: Speed"
                dis = dis+"<br>INT: Intelligence"
                dis = dis+"<br>WIS: Wisdom"
                dis = dis+"<br>LCK: Luck"
                dis = dis+"<br>"
                dis = dis+"<br>The only one that doesn't work like you think it would is INT, INT makes you work smarter, not harder, and reduces stamina drain."
                dis = dis+"<br>"
                dis = dis+"<br>Some attempt has been made at balancing the upgrades/buyables/etc."
                dis = dis+"<br>"
                dis = dis+"<br>If you have an idea for more interesting ways to gain any of the stats/minigames that wouldn't be a giant pain to code for an idiot, let me know please."
                return dis
             },
        },
    },
    bars: {
        staBar: {
            direction: RIGHT,
            width: 200,
            height: 50,
            fillStyle: {'background-color' : "#002d26"},
            textStyle: {'color': '#00cead'},
            progress() { 
                let pro = player.k.stamleft
                pro = pro.div(player.k.stammax)
                return pro 
            },
            display() {
                return format(player.k.stamleft)+" Stamina Remaining"
            },
            unlocked: true,
        },
    },
    clickables: {
        11: {
            title: "Gamble",
            display() {return "Gamble 4 LCK<br>"+player.k.lckfactor.mul(100)+"% Chance<br><br>Cost: 1 Chi"},
            canClick() {return player.k.points.gte(new Decimal(1).mul(player.k.lckmult))},
            onClick() {
                 player.k.points = player.k.points.add(-1)
                 if (new Decimal(0).add(Math.random()).add(player.k.lckfactor).gte(1)) player.k.lck = player.k.lck.mul(new Decimal(1.01).mul(player.k.lckmult))
            },
        },
        21: {
            title: "Check Math",
            display() {return "Math 4 INT<br><br>Cost: 1 Chi"},
            canClick() {return player.k.points.gte(1)},
            onClick() {
                 player.k.points = player.k.points.add(-1)
                 if (player.k.maths==player.k.math1*player.k.math2) player.k.int = player.k.int.mul(1.1).add(1)
                 if (player.k.maths==69 && player.k.math1*player.k.math2==player.k.maths) {
                    player.k.lck = player.k.lck.mul(6.9)
                    console.log("nice")
                 }
                 player.k.math1 = Math.round((Math.random()+0.1)*5)
                 player.k.math2 = Math.round((Math.random()+0.1)*25)
                 player.k.maths = 0
            },
        },
    },
    buyables: {
        11: {
            title: "Better Shoes",
            cost(x) { return new Decimal(10).pow(x) },
            display() { return "<br>Amount: "+getBuyableAmount(this.layer, this.id)+
                                "<br>Effect: +"+(buyableEffect(this.layer, this.id).sub(1).mul(100).round())+"% STA"+
                                "<br>"+
                                "<br>Cost: "+format((this.cost()))+" Chi" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() {
                let eff = new Decimal(1.1)
                eff = eff.pow(getBuyableAmount(this.layer, this.id))
                return eff
            },
            style() { return {
                'height': '100px',
                'width' : '150px',
            }},
            unlocked() {
                return hasUpgrade('k',11)
            },
        },
        12: {
            title: "Better Weights",
            cost(x) { return new Decimal(10).pow(x) },
            display() { return "<br>Amount: "+getBuyableAmount(this.layer, this.id)+
                                "<br>Effect: +"+(buyableEffect(this.layer, this.id).sub(1).mul(100).round())+"% STR"+
                                "<br>"+
                                "<br>Cost: "+format((this.cost()))+" Chi" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() {
                let eff = new Decimal(1.1)
                eff = eff.pow(getBuyableAmount(this.layer, this.id))
                return eff
            },
            style() { return {
                'height': '100px',
                'width' : '150px',
            }},
            unlocked() {
                return hasUpgrade('k',13)
            },
        },
        13: {
            title: "Better Bands",
            cost(x) { return new Decimal(10).pow(x) },
            display() { return "<br>Amount: "+getBuyableAmount(this.layer, this.id)+
                                "<br>Effect: +"+(buyableEffect(this.layer, this.id).sub(1).mul(100).round())+"% SPD"+
                                "<br>"+
                                "<br>Cost: "+format((this.cost()))+" Chi" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() {
                let eff = new Decimal(1.1)
                eff = eff.pow(getBuyableAmount(this.layer, this.id))
                return eff
            },
            style() { return {
                'height': '100px',
                'width' : '150px',
            }},
            unlocked() {
                return hasUpgrade('k',13)
            },
        },
        21: {
            title: "Better Books",
            cost(x) { return new Decimal(10).pow(x) },
            display() { return "<br>Amount: "+getBuyableAmount(this.layer, this.id)+
                                "<br>Effect: +"+(buyableEffect(this.layer, this.id).sub(1).mul(100).round())+"% INT"+
                                "<br>"+
                                "<br>Cost: "+format((this.cost()))+" Chi" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() {
                let eff = new Decimal(1.1)
                eff = eff.pow(getBuyableAmount(this.layer, this.id))
                return eff
            },
            style() { return {
                'height': '100px',
                'width' : '150px',
            }},
            unlocked() {
                return hasUpgrade('k',14)
            },
        },
        22: {
            title: "Better Glasses",
            cost(x) { return new Decimal(10).pow(x) },
            display() { return "<br>Amount: "+getBuyableAmount(this.layer, this.id)+
                                "<br>Effect: +"+(buyableEffect(this.layer, this.id).sub(1).mul(100).round())+"% WIS"+
                                "<br>"+
                                "<br>Cost: "+format((this.cost()))+" Chi" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() {
                let eff = new Decimal(1.1)
                eff = eff.pow(getBuyableAmount(this.layer, this.id))
                return eff
            },
            style() { return {
                'height': '100px',
                'width' : '150px',
            }},
            unlocked() {
                return hasUpgrade('k',14)
            },
        },
    },
    upgrades: {
        11: {
            description: "Harness The Supreme Force Of Your Vital Energies Into Pure Coalesced Inspiration, Discovering Ways To Increase Your Capabilities",
            cost: new Decimal(1)
        },
        12: {
            description: "Manifest The Universal Energies Of Everything To Get A Dojo Membership<br><h6>and when that fails buy one</h6>",
            cost: new Decimal(100),
            currencyDisplayName: "Gold",
            currencyInternalName: "points",
            currencyLayer: "g",
        },
        13: {
            description: "Manifest a Gym Membership And Unlock Physical Training",
            cost: new Decimal(100),
        },
        14: {
            description: "Manifest A Thought And Unlock Mental Training",
            cost: new Decimal(200),
        },
        15: {
            description: "Conjure The Metaphysical Forces Of Luck",
            cost: new Decimal(1),
        },
        21: {
            description: "Improved Training Techniques",
            cost: new Decimal(400),
        },
        22: {
            description: "Advanced Training Techniques",
            cost: new Decimal(1000),
        },
        23: {
            description: "Omni Training Techniques",
            cost: new Decimal(10000),
        },
        31: {
            description: "Reset Stats, Double Training Speed",
            cost: new Decimal(100),
            onPurchase() {
                player.k.sta = new Decimal(1)
                player.k.str = new Decimal(1)
                player.k.spd = new Decimal(1)
                player.k.wis = new Decimal(1)
                player.k.int = new Decimal(1)
                player.k.trainspeed = player.k.trainspeed.mul(2)
                player.k.prog = new Decimal(0)
            },
        },
        32: {
            description: "Reset Stats, Double Training Speed",
            cost: new Decimal(500),
            onPurchase() {
                player.k.sta = new Decimal(1)
                player.k.str = new Decimal(1)
                player.k.spd = new Decimal(1)
                player.k.wis = new Decimal(1)
                player.k.int = new Decimal(1)
                player.k.trainspeed = player.k.trainspeed.mul(2)
                player.k.prog = new Decimal(0)
            },
        },
        33: {
            description: "Reset Stats, Double Training Speed",
            cost: new Decimal(5000),
            onPurchase() {
                player.k.sta = new Decimal(1)
                player.k.str = new Decimal(1)
                player.k.spd = new Decimal(1)
                player.k.wis = new Decimal(1)
                player.k.int = new Decimal(1)
                player.k.trainspeed = player.k.trainspeed.mul(2)
                player.k.prog = new Decimal(0)
            },
        },
        34: {
            description: "Reset Stats, Double Training Speed",
            cost: new Decimal(10000),
            onPurchase() {
                player.k.sta = new Decimal(1)
                player.k.str = new Decimal(1)
                player.k.spd = new Decimal(1)
                player.k.wis = new Decimal(1)
                player.k.int = new Decimal(1)
                player.k.trainspeed = player.k.trainspeed.mul(2)
                player.k.prog = new Decimal(0)
            },
        },
    },
    challenges: {
        11: {
            name: "Go Walking",
            style() {return {
                "background-color":"#ffffba"
            }},
            fullDisplay() {
                let cost = "drains 1 STA per second<br>"
                let gain = format(Decimal.sqrt(player.k.prog).mul(buyableEffect('k', 11)))+" STA gained on exit<br>"
                let per = "("+format(Decimal.sqrt(player.k.prog).mul(buyableEffect('k', 11)).div(player.k.resetTime))+"/s)"
                return cost+gain+per
            },
            onEnter() { 
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            onExit() {
                player.k.sta = player.k.sta.add(Decimal.sqrt(player.k.prog).mul(buyableEffect('k', 11)))
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            canComplete() {
                return false
            },
        },
        12: {
            name: "Go Jogging",
            style() {return {
                "background-color":"#ffffba"
            }},
            unlocked() {return hasUpgrade('k',21) },
            fullDisplay() {
                let cost = "drains 5 STA per second<br>"
                let gain = format((player.k.prog).mul(buyableEffect('k', 11)))+" STA gained on exit<br>"
                let per = "("+format((player.k.prog).mul(buyableEffect('k', 11)).div(player.k.resetTime))+"/s)"
                return cost+gain+per
            },
            onEnter() { 
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            onExit() {
                player.k.sta = player.k.sta.add(player.k.prog.mul(buyableEffect('k', 11)))
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            canComplete() {
                return false
            },
        },
        13: {
            name: "Go Running",
            style() {return {
                "background-color":"#ffffba"
            }},
            unlocked() {return hasUpgrade('k',22) },
            fullDisplay() {
                let cost = "drains 25 STA per second<br>"
                let gain = format((player.k.prog).pow(1.1).mul(buyableEffect('k', 11)))+" STA gained on exit<br>"
                let per = "("+format((player.k.prog).pow(1.1).mul(buyableEffect('k', 11)).div(player.k.resetTime))+"/s)"
                return cost+gain+per
            },
            onEnter() { 
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            onExit() {
                player.k.sta = player.k.sta.add(player.k.prog.pow(1.1).mul(buyableEffect('k', 11)))
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            canComplete() {
                return false
            },
        },
        21: {
            name: "Do Push-Ups",
            style() {return {
                "background-color":"#ffb3ba"
            }},
            fullDisplay() {
                let cost = "drains 1 STA per second<br>"
                let gain = format(Decimal.sqrt(player.k.prog).mul(buyableEffect('k', 12)))+" STR gained on exit<br>"
                let per = "("+format(Decimal.sqrt(player.k.prog).mul(buyableEffect('k', 12)).div(player.k.resetTime))+"/s)"
                return cost+gain+per
            },
            onEnter() { 
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            onExit() {
                player.k.str = player.k.str.add(Decimal.sqrt(player.k.prog).mul(buyableEffect('k', 12)))
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            canComplete() {
                return false
            },
        },
        22: {
            name: "Do Bench-Press",
            style() {return {
                "background-color":"#ffb3ba"
            }},
            unlocked() {return hasUpgrade('k',21) },
            fullDisplay() {
                let cost = "drains 5 STA per second<br>"
                let gain = format((player.k.prog).mul(buyableEffect('k', 12)))+" STR gained on exit<br>"
                let per = "("+format((player.k.prog).mul(buyableEffect('k', 12)).div(player.k.resetTime))+"/s)"
                return cost+gain+per
            },
            onEnter() { 
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            onExit() {
                player.k.str = player.k.str.add(player.k.prog.mul(buyableEffect('k', 12)))
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            canComplete() {
                return false
            },
        },
        23: {
            name: "Do Leg Day",
            style() {return {
                "background-color":"#ffb3ba"
            }},
            unlocked() {return hasUpgrade('k',22) },
            fullDisplay() {
                let cost = "drains 25 STA per second<br>"
                let gain = format((player.k.prog).pow(1.1).mul(buyableEffect('k', 12)))+" STR gained on exit<br>"
                let per = "("+format((player.k.prog).pow(1.1).mul(buyableEffect('k', 12)).div(player.k.resetTime))+"/s)"
                return cost+gain+per
            },
            onEnter() { 
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            onExit() {
                player.k.str = player.k.str.add((player.k.prog).pow(1.1).mul(buyableEffect('k', 12)))
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            canComplete() {
                return false
            },
        },
        31: {
            name: "Jump Rope",
            style() {return {
                "background-color":"#bae1ff"
            }},
            fullDisplay() {
                let cost = "drains 1 STA per second<br>"
                let gain = format(Decimal.sqrt(player.k.prog).mul(buyableEffect('k', 13)))+" SPD gained on exit<br>"
                let per = "("+format(Decimal.sqrt(player.k.prog).mul(buyableEffect('k', 13)).div(player.k.resetTime))+"/s)"
                return cost+gain+per
            },
            onEnter() { 
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            onExit() {
                player.k.spd = player.k.spd.add(Decimal.sqrt(player.k.prog).mul(buyableEffect('k', 13)))
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            canComplete() {
                return false
            },
        },
        32: {
            name: "Spin Class",
            style() {return {
                "background-color":"#bae1ff"
            }},
            unlocked() {return hasUpgrade('k',21) },
            fullDisplay() {
                let cost = "drains 5 STA per second<br>"
                let gain = format((player.k.prog).mul(buyableEffect('k', 13)))+" SPD gained on exit<br>"
                let per = "("+format((player.k.prog).mul(buyableEffect('k', 13)).div(player.k.resetTime))+"/s)"
                return cost+gain+per
            },
            onEnter() { 
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            onExit() {
                player.k.spd = player.k.spd.add(player.k.prog.mul(buyableEffect('k', 13)))
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            canComplete() {
                return false
            },
        },
        33: {
            name: "Parachute Sprints",
            style() {return {
                "background-color":"#bae1ff"
            }},
            unlocked() {return hasUpgrade('k',22) },
            fullDisplay() {
                let cost = "drains 25 STA per second<br>"
                let gain = format((player.k.prog).pow(1.1).mul(buyableEffect('k', 13)))+" SPD gained on exit<br>"
                let per = "("+format((player.k.prog).pow(1.1).mul(buyableEffect('k', 13)).div(player.k.resetTime))+"/s)"
                return cost+gain+per
            },
            onEnter() { 
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            onExit() {
                player.k.spd = player.k.spd.add(player.k.prog.pow(1.1).mul(buyableEffect('k', 13)))
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            canComplete() {
                return false
            },
        },
        41: {
            name: "Reed A Book",
            style() {return {
                "background-color":"#ffdfba"
            }},
            fullDisplay() {
                let cost = "drains 1 STA per second<br>"
                let gain = format(Decimal.sqrt(player.k.prog).mul(buyableEffect('k', 13)))+" INT gained on exit<br>"
                let per = "("+format(Decimal.sqrt(player.k.prog).mul(buyableEffect('k', 13)).div(player.k.resetTime))+"/s)"
                return cost+gain+per
            },
            onEnter() { 
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            onExit() {
                player.k.int = player.k.int.add(Decimal.sqrt(player.k.prog).mul(buyableEffect('k', 21)))
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            canComplete() {
                return false
            },
        },
        42: {
            name: "Do Arithmetick",
            style() {return {
                "background-color":"#ffdfba"
            }},
            unlocked() {return hasUpgrade('k',21) },
            fullDisplay() {
                let cost = "drains 5 STA per second<br>"
                let gain = format((player.k.prog).mul(buyableEffect('k', 21)))+" INT gained on exit<br>"
                let per = "("+format((player.k.prog).mul(buyableEffect('k', 21)).div(player.k.resetTime))+"/s)"
                return cost+gain+per
            },
            onEnter() { 
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            onExit() {
                player.k.int = player.k.int.add(player.k.prog.mul(buyableEffect('k', 21)))
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            canComplete() {
                return false
            },
        },
        43: {
            name: "Yeah! Sience!",
            style() {return {
                "background-color":"#ffdfba"
            }},
            unlocked() {return hasUpgrade('k',22) },
            fullDisplay() {
                let cost = "drains 25 STA per second<br>"
                let gain = format((player.k.prog).pow(1.1).mul(buyableEffect('k', 21)))+" INT gained on exit<br>"
                let per = "("+format((player.k.prog).pow(1.1).mul(buyableEffect('k', 21)).div(player.k.resetTime))+"/s)"
                return cost+gain+per
            },
            onEnter() { 
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            onExit() {
                player.k.int = player.k.int.add(player.k.prog.pow(1.1).mul(buyableEffect('k', 21)))
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            canComplete() {
                return false
            },
        },
        51: {
            name: "Watch A Documentary",
            style() {return {
                "background-color":"#D8B2D8"
            }},
            fullDisplay() {
                let cost = "drains 1 STA per second<br>"
                let gain = format(Decimal.sqrt(player.k.prog).mul(buyableEffect('k', 22)))+" WIS gained on exit<br>"
                let per = "("+format(Decimal.sqrt(player.k.prog).mul(buyableEffect('k', 22)).div(player.k.resetTime))+"/s)"
                return cost+gain+per
            },
            onEnter() { 
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            onExit() {
                player.k.wis = player.k.wis.add(Decimal.sqrt(player.k.prog).mul(buyableEffect('k', 22)))
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            canComplete() {
                return false
            },
        },
        52: {
            name: "Philosophy Classes",
            style() {return {
                "background-color":"#D8B2D8"
            }},
            unlocked() {return hasUpgrade('k',21) },
            fullDisplay() {
                let cost = "drains 5 STA per second<br>"
                let gain = format((player.k.prog).mul(buyableEffect('k', 22)))+" WIS gained on exit<br>"
                let per = "("+format((player.k.prog).mul(buyableEffect('k', 22)).div(player.k.resetTime))+"/s)"
                return cost+gain+per
            },
            onEnter() { 
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            onExit() {
                player.k.wis = player.k.wis.add(player.k.prog.mul(buyableEffect('k', 22)))
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            canComplete() {
                return false
            },
        },
        53: {
            name: "Touch Grass",
            style() {return {
                "background-color":"#D8B2D8"
            }},
            unlocked() {return hasUpgrade('k',22) },
            fullDisplay() {
                let cost = "drains 25 STA per second<br>"
                let gain = format((player.k.prog).pow(1.1).mul(buyableEffect('k', 22)))+" WIS gained on exit<br>"
                let per = "("+format((player.k.prog).pow(1.1).mul(buyableEffect('k', 22)).div(player.k.resetTime))+"/s)"
                return cost+gain+per
            },
            onEnter() { 
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            onExit() {
                player.k.wis = player.k.wis.add(player.k.prog.pow(1.1).mul(buyableEffect('k', 22)))
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            canComplete() {
                return false
            },
        },
        71: {
            name: "Chess On A Treadmill",
            unlocked() {return hasUpgrade('k',23) },
            fullDisplay() {
                let cost = "drains 150 STA per second<br>"
                let gain = format((player.k.prog).pow(1.25).mul(buyableEffect('k', 22)))+" STATS gained on exit<br>"
                let per = "("+format((player.k.prog).pow(1.25).mul(buyableEffect('k', 22)).div(player.k.resetTime))+"/s)"
                return cost+gain+per
            },
            onEnter() { 
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            onExit() {
                player.k.sta = player.k.sta.add(player.k.prog.pow(1.25).mul(buyableEffect('k', 11)))
                player.k.str = player.k.str.add(player.k.prog.pow(1.25).mul(buyableEffect('k', 12)))
                player.k.spd = player.k.spd.add(player.k.prog.pow(1.25).mul(buyableEffect('k', 13)))
                player.k.int = player.k.int.add(player.k.prog.pow(1.25).mul(buyableEffect('k', 21)))
                player.k.wis = player.k.wis.add(player.k.prog.pow(1.25).mul(buyableEffect('k', 22)))
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            canComplete() {
                return false
            },
        },
        72: {
            name: "Read Aasimov While Skydiving",
            unlocked() {return hasUpgrade('k',23) },
            fullDisplay() {
                let cost = "drains 1000 STA per second<br>"
                let gain = format((player.k.prog).pow(1.5).mul(buyableEffect('k', 22)))+" STATS gained on exit<br>"
                let per = "("+format((player.k.prog).pow(1.5).mul(buyableEffect('k', 22)).div(player.k.resetTime))+"/s)"
                return cost+gain+per
            },
            onEnter() { 
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            onExit() {
                player.k.sta = player.k.sta.add(player.k.prog.pow(1.5).mul(buyableEffect('k', 11)))
                player.k.str = player.k.str.add(player.k.prog.pow(1.5).mul(buyableEffect('k', 12)))
                player.k.spd = player.k.spd.add(player.k.prog.pow(1.5).mul(buyableEffect('k', 13)))
                player.k.int = player.k.int.add(player.k.prog.pow(1.5).mul(buyableEffect('k', 21)))
                player.k.wis = player.k.wis.add(player.k.prog.pow(1.5).mul(buyableEffect('k', 22)))
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            canComplete() {
                return false
            },
        },
        73: {
            name: "Box A Moose<br>Whilst Playing A Trumpet",
            unlocked() {return hasUpgrade('k',23) },
            fullDisplay() {
                let cost = "drains 10k STA per second<br>"
                let gain = format((player.k.prog).pow(1.75).mul(buyableEffect('k', 22)))+" STATS gained on exit<br>"
                let per = "("+format((player.k.prog).pow(1.75).mul(buyableEffect('k', 22)).div(player.k.resetTime))+"/s)"
                return cost+gain+per
            },
            onEnter() { 
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            onExit() {
                player.k.sta = player.k.sta.add(player.k.prog.pow(1.75).mul(buyableEffect('k', 11)))
                player.k.str = player.k.str.add(player.k.prog.pow(1.75).mul(buyableEffect('k', 12)))
                player.k.spd = player.k.spd.add(player.k.prog.pow(1.75).mul(buyableEffect('k', 13)))
                player.k.int = player.k.int.add(player.k.prog.pow(1.75).mul(buyableEffect('k', 21)))
                player.k.wis = player.k.wis.add(player.k.prog.pow(1.75).mul(buyableEffect('k', 22)))
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            canComplete() {
                return false
            },
        },
        74: {
            name: "Violate The First Law<br>Of Ginsberg's Theorem",
            unlocked() {return hasUpgrade('k',23) },
            fullDisplay() {
                let cost = "drains 100k STA per second<br>"
                let gain = format((player.k.prog).pow(2).mul(buyableEffect('k', 22)))+" STATS gained on exit<br>"
                let per = "("+format((player.k.prog).pow(2).mul(buyableEffect('k', 22)).div(player.k.resetTime))+"/s)"
                return cost+gain+per
            },
            onEnter() { 
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            onExit() {
                player.k.sta = player.k.sta.add(player.k.prog.pow(2).mul(buyableEffect('k', 11)))
                player.k.str = player.k.str.add(player.k.prog.pow(2).mul(buyableEffect('k', 12)))
                player.k.spd = player.k.spd.add(player.k.prog.pow(2).mul(buyableEffect('k', 13)))
                player.k.int = player.k.int.add(player.k.prog.pow(2).mul(buyableEffect('k', 21)))
                player.k.wis = player.k.wis.add(player.k.prog.pow(2).mul(buyableEffect('k', 22)))
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            canComplete() {
                return false
            },
        },
        01: {
            name: "White Belt",
            fullDisplay() {
                let req = "Basically A Participation Trophy"
                return req
            },
            onEnter() { 
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            onExit() {
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            canComplete() {
                return player.k.prog.gte(0.5)
            },
            unlocked() { return !hasChallenge('k',01)},
        },
        02: {
            name: "Blue Belt",
            fullDisplay() {
                let req = "Mastery Of The Basics"
                return req
            },
            onEnter() { 
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            onExit() {
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            canComplete() {
                return player.k.prog.gte(5)
            },
            unlocked() { return hasChallenge('k',01)&&!hasChallenge('k',02)},
        },
        03: {
            name: "Purple Belt",
            fullDisplay() {
                let req = "Mastery Of The Intermediate"                
                return req
            },
            onEnter() { 
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            onExit() {
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            canComplete() {
                return player.k.prog.gte(100)
            },
            unlocked() { return hasChallenge('k',02)&&!hasChallenge('k',03)},
        },
        04: {
            name: "Brown Belt",
            fullDisplay() {
                let req = "Proficiency In Advanced Techniques"
                return req
            },
            onEnter() { 
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            onExit() {
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            canComplete() {
                return player.k.prog.gte(400)
            },
            unlocked() { return hasChallenge('k',03)&&!hasChallenge('k',04)},
        },
        05: {
            name: "Black Belt",
            fullDisplay() {
                let req = "Become An Expert"
                return req
            },
            onEnter() { 
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            onExit() {
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            canComplete() {
                return player.k.prog.gte(1250)
            },
            unlocked() { return hasChallenge('k',04)&&!hasChallenge('k',05)},
        },
        06: {
            name: "Coral Belt",
            fullDisplay() {
                let req = "Master The Craft"
                return req
            },
            onEnter() { 
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            onExit() {
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            canComplete() {
                return player.k.prog.gte(2100)
            },
            unlocked() { return hasChallenge('k',05)&&!hasChallenge('k',06)},
        },
        07: {
            name: "Red Belt",
            fullDisplay() {
                let req = "Become A Grandmaster"
                return req
            },
            onEnter() { 
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            onExit() {
                player.k.stammax = player.k.sta
                player.k.stamleft = player.k.stammax
                player.k.prog = new Decimal(0)
            },
            canComplete() {
                return player.k.prog.gte(3400)
            },
            unlocked() { return hasChallenge('k',06)&&!hasChallenge('k',07)},
        },
    },
    milestones: {
        1: {
            requirementDescription: "White Belt",
            effectDescription: "Conviction^1.1",
            done() { return hasChallenge('k',01) },
            unlocked() { return hasChallenge('k',01) },
        },
        2: {
            requirementDescription: "Blue Belt",
            effectDescription: "Conviction^1.3",
            done() { return hasChallenge('k',02) },
            unlocked() { return hasChallenge('k',02) },
        },
        3: {
            requirementDescription: "Purple Belt",
            effectDescription: "Conviction^1.5",
            done() { return hasChallenge('k',03) },
            unlocked() { return hasChallenge('k',03) },
        },
        4: {
            requirementDescription: "Brown Belt",
            effectDescription: "Conviction^1.75",
            done() { return hasChallenge('k',04) },
            unlocked() { return hasChallenge('k',04) },
        },
        5: {
            requirementDescription: "Black Belt",
            effectDescription: "Conviction^2",
            done() { return hasChallenge('k',05) },
            unlocked() { return hasChallenge('k',05) },
        },
        6: {
            requirementDescription: "Coral Belt",
            effectDescription: "Conviction^2.5",
            done() { return hasChallenge('k',06) },
            unlocked() { return hasChallenge('k',06) },
        },
        7: {
            requirementDescription: "Red Belt",
            effectDescription: "Conviction^3",
            done() { return hasChallenge('k',07) },
            unlocked() { return hasChallenge('k',07) },
        },
    },
})