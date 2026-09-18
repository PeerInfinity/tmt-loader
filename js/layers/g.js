addLayer("g", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
        unlocked: false,
        rec: new Decimal(0),
        bought1: new Decimal(0),
        bought2: new Decimal(0),
        bought3: new Decimal(0),
        bought4: new Decimal(0),
        bought5: new Decimal(0),
        bought6: new Decimal(0),
        bought7: new Decimal(0),
        bought8: new Decimal(0),
    }},
    color: "#E5C100",                       // The color for this layer, which affects many elements.
    resource: "Gold Coins",                       // The name of this layer's main prestige resource.
    row: 1,                                 // The row this layer is on (0 is the first row).
    position: 0,
    branches: ["c"],
    baseResource: "Conviction",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player['c'].points },  // A function to return the current amount of baseResource.
    requires: new Decimal(1000),               // The amount of the base needed to  gain 1 of the prestige currency. 
                                            // Also the amount required to unlock the layer.
    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 2,                          // "normal" prestige gain is (currency^exponent).
    hotkeys: [
        {key: "g", description: "g: Reset for gold coins", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    tabFormat: [
        "main-display",
        "blank",
        "prestige-button",
        ["infobox", "members"],
        ["bar", "bigBar"],
        "blank",
        "buyables",
    ],
    doReset(resettingLayer){
        if(layers[resettingLayer].row = 2) return
    },
    resetDescription: "<h3>Go on crusade</h3><br><br> resets conviction for <br>",
    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        return new Decimal(1)               // Factor in any bonuses multiplying gain here.
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },
    layerShown() { return true },
    effect() {
        let eff = new Decimal(0)
        eff = eff.add(player.g.rec)
        eff = eff.min(populationLimit())
        eff = eff.div(100)
        eff = eff.add(1)
        eff = eff.pow(0.25)
        return eff
    },
    effectDescription() {
        let dis = "<br>you have recruited "+format(player.g.rec.floor())+" people into your cult,<br>your cult increases Conviction gain by "
        if (player.g.rec.gte( new Decimal(825))) 
            dis = "<br>you have recruited "+format(player.g.rec.floor())+" people into your cult,<br>which is more than the population of Vatican City,<br>your cult increases Conviction gain by "
        if (player.g.rec.gte(new Decimal(56619))) 
            dis = "<br>you have recruited "+format(player.g.rec.floor())+" people into your cult,<br>which is more than the population of Denmark,<br>your cult increases Conviction gain by "
        if (player.g.rec.gte(new Decimal(385230))) 
            dis = "<br>you have recruited "+format(player.g.rec.floor())+" people into your cult,<br>which is more than the population of Iceland,<br>your cult increases Conviction gain by "
        if (player.g.rec.gte(new Decimal(5136679))) 
            dis = "<br>you have recruited "+format(player.g.rec.floor())+" people into your cult,<br>which is more than the population of New Zealand,<br>your cult increases Conviction gain by "   
        if (player.g.rec.gte(new Decimal(84270625))) 
            dis = "<br>you have recruited "+format(player.g.rec.floor())+" people into your cult,<br>which is more than the population of Germany,<br>your cult increases Conviction gain by " 
        if (player.g.rec.gte(new Decimal(1412600000))) 
            dis = "<br>you have recruited "+format(player.g.rec.floor())+" people into your cult,<br>which is more than the population of China,<br>your cult increases Conviction gain by "
        if (player.g.rec.gte(populationLimit())) 
            dis = "<br>you have recruited "+format(player.g.rec.floor())+" people into your cult,<br>which is everyone,<br>your cult increases Conviction gain by "
        return dis+format(this.effect().minus(1).mul(100))+"%"
    },
    
    update(diff) {
            player.g.rec = player.g.rec.add((buyableEffect(this.layer, 11)).mul(diff))
            player.g.buyables[11] = player.g.buyables[11].add(buyableEffect(this.layer, 21).mul(diff))
            player.g.buyables[21] = player.g.buyables[21].add(buyableEffect(this.layer, 31).mul(diff))
            player.g.buyables[31] = player.g.buyables[31].add(buyableEffect(this.layer, 41).mul(diff))
            if (player.g.buyables[11].gte(populationLimit())) player.g.buyables[11] = populationLimit()
            if (player.g.rec.gte(populationLimit())) player.g.rec = populationLimit()
    },
    infoboxes: {
        members: {
            title: "members",
            body() { 
                let dis = "You can recruit members into your cult with all of that gold!<br>"+
                "<br>"+
                "Initiates go out into the world and recruit citizens.<br>"+
                "Disciples recruit more Initiates, etc.<br>"+
                "<br>"+
                "Each member that you personally recruit multiplies the efficiency of that member type by 1.25^amount bought.<br>"+
                "<br>"+
                "<h3>Starting Productivity:</h3><br>"+
                "Initiate: 1 Citizen  per 2 seconds<br>"+
                "Disciple: 1 Initiate per 5 seconds<br>"+
                "Thrall: 1 Disciple per 12 seconds<br>"+
                "Acolyte: 1 Thrall per 30 seconds<br>"+
                "<br>"+
                "<h3>Current Productivity:</h3><br>"+
                "Initiate: "+   format(buyableEffect('g',11).div(getBuyableAmount('g',11)))+    " Citizen per second<br>"+
                "Disciple: "+   format(buyableEffect('g',21).div(getBuyableAmount('g',21)))+    " Initiate per second<br>"+
                "Thrall: "+     format(buyableEffect('g',31).div(getBuyableAmount('g',31)))+    " Disciple per second<br>"+
                "Acolyte: "+    format(buyableEffect('g',41).div(getBuyableAmount('g',41)))+    " Thrall per second<br>"+
                "<br>"+
                "<small><h6><sub>and yes, this is just a poor man's AD.</sub></h6></small>"
                return dis
             },
        },
    },
    bars: {
        bigBar: {
            direction: RIGHT,
            width: 300,
            height: 50,
            fillStyle: {'background-color' : "#2D2600"},
            textStyle: {'color': '#E5C100'},
            progress() { 
                let pro = player.g.rec
                pro = pro.div(populationLimit())
                return pro 
            },
            display() {
                return format(this.progress().mul(100))+"% of Pop Recruited"
            },
            unlocked: true,
        },
    },
    buyables: {
        11: {
            title: "Initiate",
            cost() { return new Decimal(2).pow(player[this.layer].bought1) },
            display() { return "<br>You have "+format(getBuyableAmount(this.layer, this.id))+
                                "<br>They recruit "+format(buyableEffect(this.layer, this.id))+" Citizens/second"+
                                "<br>"+
                                "<br> you have bought "+player[this.layer].bought1+
                                "<br>The next costs "+format((this.cost()))+" gold" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player[this.layer].bought1 = player[this.layer].bought1.add(1)
            },
            effect() {
                let eff = new Decimal(1)
                eff = eff.mul(new Decimal(1.25).pow(player[this.layer].bought1.minus(1)))
                eff = eff.mul(getBuyableAmount(this.layer, this.id))
                eff = eff.div(2)
                return eff
            },
            style() { return {
                'height': '100px',
                'width' : '300px',
            }},
        },
        21: {
            title: "Disciple",
            cost() { return new Decimal(4).pow(player[this.layer].bought2.add(2)) },
            display() { return "<br>You have "+format(getBuyableAmount(this.layer, this.id))+
                                "<br>They recruit "+format(buyableEffect(this.layer, this.id))+" Disciples/second"+
                                "<br>"+
                                "<br> you have bought "+player[this.layer].bought2+
                                "<br>The next costs "+format((this.cost()))+" gold" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player[this.layer].bought2 = player[this.layer].bought2.add(1)
            },
            effect() {
                let eff = new Decimal(1)
                eff = eff.mul(new Decimal(1.25).pow(player[this.layer].bought2.minus(1)))
                eff = eff.mul(getBuyableAmount(this.layer, this.id))
                eff = eff.div(5)
                return eff
            },
            style() { return {
                'height': '100px',
                'width' : '300px',
            }},
        },
        31: {
            title: "Thrall",
            cost() { return new Decimal(8).pow(player[this.layer].bought3.add(3)) },
            display() { return "<br>You have "+format(getBuyableAmount(this.layer, this.id))+
                                "<br>They recruit "+format(buyableEffect(this.layer, this.id))+" Acolytes/second"+
                                "<br>"+
                                "<br> you have bought "+player[this.layer].bought3+
                                "<br>The next costs "+format((this.cost()))+" gold" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player[this.layer].bought3 = player[this.layer].bought3.add(1)
            },
            effect() {
                let eff = new Decimal(1)
                eff = eff.mul(new Decimal(1.25).pow(player[this.layer].bought3.minus(1)))
                eff = eff.mul(getBuyableAmount(this.layer, this.id))
                eff = eff.div(15)
                return eff
            },
            style() { return {
                'height': '100px',
                'width' : '300px',
            }},
        },
        41: {
            title: "Acolyte",
            cost() { return new Decimal(16).pow(player[this.layer].bought4.add(4)) },
            display() { return "<br>You have "+format(getBuyableAmount(this.layer, this.id))+
                                "<br>They recruit "+format(buyableEffect(this.layer, this.id))+" Priests/second"+
                                "<br>"+
                                "<br> you have bought "+player[this.layer].bought4+
                                "<br>The next costs "+format((this.cost()))+" gold" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player[this.layer].bought4 = player[this.layer].bought4.add(1)
            },
            effect() {
                let eff = new Decimal(1)
                eff = eff.mul(new Decimal(1.25).pow(player[this.layer].bought4.minus(1)))
                eff = eff.mul(getBuyableAmount(this.layer, this.id))
                eff = eff.div(30)
                return eff
            },
            style() { return {
                'height': '100px',
                'width' : '300px',
            }},
        },
        },
    }
)