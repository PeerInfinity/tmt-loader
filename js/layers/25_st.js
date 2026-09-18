addLayer("st", {
    name: "Study Tree",
    resource: "Study Points",
    baseResource: "Time",
    requires: new Decimal(1),
    baseAmount() {return player.points}, 
    startData() { return {
		points: new Decimal(0),
        unlocked: true,
    }},
    passiveGeneration() { return false },
    color: "#FFE77B", 
    type: "normal", 
    clickables: {
        11: {
            display() {return "<h2>Buy Max"},
            canClick() {return true},
            onClick() {
                buyMaxBuyable("st", 12) & buyMaxBuyable("st", 11)
            },
            onHold() {
                buyMaxBuyable("st", 12) & buyMaxBuyable("st", 11)
            },
            style() {
                return {"border-radius": "15px 15px 0px 0px", "width": "360px", "min-height": "40px"}
            },
            unlocked() {return true}
        },
        21: {
            display() {return "<h2 style='color: red'>Reset Tree"},
            canClick() {return true},
            onClick() {
                let ghostSP1 = getBuyableAmount("st",11)
                let ghostSP2 = getBuyableAmount("st",12)
                let keep=[];
                {layerDataReset("st", keep);}
                setBuyableAmount("st", 11, ghostSP1)
                setBuyableAmount("st", 12, ghostSP2)
                player["st"].points = getBuyableAmount("st",11).add(getBuyableAmount("st",12))
                layer1reset()
            },
            style() {
                return {"border-radius": "15px 15px 15px 15px", "width": "180px", "min-height": "40px"}
            },
            unlocked() {return true}
        },
    },
    challenges: {
       
    },
    buyables: {
        11: {
            title() {return "f(t) Conversion"},
            cost(x) { return new Decimal(10).pow(2000).mul(new Decimal(10).pow(new Decimal(250).mul(x)))},
            display() { return "Convert f(t) into a Study Point <br> You have: <b>f(t) = " + format(player["f"].points) + " </b><br> <br> (bought:" + format(getBuyableAmount("st", 11)) + ")" + "<br> Req: <b style='color:red;'> f(t) = " + format(this.cost(getBuyableAmount("st", 11)))},
            canAfford() { return player["f"].points.gte(this.cost()) },
            buy() {
                player["st"].points = player["st"].points.add(1)
                setBuyableAmount("st", 11, getBuyableAmount("st", 11).add(1))
            },
            buyMax() {
                getMax(player["f"].points.abs(), this.cost(), new Decimal(10).pow(250))
                subCost(new Decimal(10).pow(250), getBuyableAmount("st", 11), new Decimal(10).pow(2000))
                player["st"].points = player["st"].points.add(max)
                setBuyableAmount("st", 11, getBuyableAmount("st", 11).add(new Decimal(max)))
            },
            style(){ 
                return {"border-radius": "0px 0px 0px 15px", "width": "180px", "height": "180px"}
            },
            unlocked() {
                return true
            }
        },
        12: {
            title() {return "Knowledge Conversion"},
            cost(x) { return new Decimal(1).mul(new Decimal(10).pow(new Decimal(100).mul(x)))},
            display() { return "Convert Knowledge into a Study Point <br> You have: <b>" + format(player["res"].points) + " Knowledge </b> <br><br> (bought:" + format(getBuyableAmount("st", 12)) + ")" + "<br> Req: <b style='color:red;'> " + format(this.cost(getBuyableAmount("st", 12))) + " Knowledge"},
            canAfford() { return player["res"].points.gte(this.cost()) },
            buy() {
                player["st"].points = player["st"].points.add(1)
                setBuyableAmount("st", 12, getBuyableAmount("st", 12).add(1))
            },
            buyMax() {
                getMax(player["res"].points.abs(), this.cost(), new Decimal(10).pow(100))
                subCost(new Decimal(10).pow(100), getBuyableAmount("st", 12), new Decimal(1))
                player["st"].points = player["st"].points.add(max)
                setBuyableAmount("st", 12, getBuyableAmount("st", 12).add(new Decimal(max)))
            },
            style(){ 
                return {"border-radius": "0px 0px 15px 0px", "width": "180px", "height": "180px"}
            },
            unlocked() {
                return true
            }
        },
    },
    upgrades: {
        11: {
            title: "Study 1.1 <br> f",
            description: "<b>Reduce</b> 'a, b, c, & d' Variable cost increase (x1.425 -> x1.35)",
            cost: new Decimal(1),
            currencyDisplayName: "Study Points",
            currencyInternalName: "points",
            currencyLayer: "st",
            canAfford() {return player["st"].points.gte(this.cost)},
            style(){ 
                return {"border-radius": "15px 15px 15px 15px", "width": "150px", "height": "150px", "margin": "15px",}
            },
        },
        21: {
            title: "Study 2.1 <br> U",
            description: "<b>Remove</b> the max of 'U' Upgrade 1.3, 1.5, 2.2, and 2.4",
            cost() { 
                cost = new Decimal(2)
                if (hasUpgrade("st",22)) cost = cost.add(1)
                if (hasUpgrade("st",23)) cost = cost.add(1)
                return cost
            },
            currencyDisplayName: "Study Points",
            currencyInternalName: "points",
            currencyLayer: "st",
            canAfford() {return player["st"].points.gte(this.cost) && hasUpgrade("st",11)},
            style(){ 
                return {"border-radius": "15px 15px 15px 15px", "width": "150px", "height": "150px", "margin": "15px",}
            },
            branches: [[11, "#89CFF0"]],
        },
        22: {
            title: "Study 2.2 <br> R",
            description: "<b>Enhance</b> Additive Research Upgrade base on itself",
            cost() { 
                cost = new Decimal(2)
                if (hasUpgrade("st",21)) cost = cost.add(1)
                if (hasUpgrade("st",23)) cost = cost.add(1)
                return cost
            },
            currencyDisplayName: "Study Points",
            currencyInternalName: "points",
            currencyLayer: "st",
            canAfford() {return player["st"].points.gte(this.cost) && hasUpgrade("st",11)},
            effect() {
                eff = new Decimal(0)
                eff = eff.add(getBuyableAmount("res",11).mul(0.01).add(1).pow(0.5))
                return eff
            },
            effectDisplay() {
                return "<b>^" + format(upgradeEffect("st", 22))
            },
            style(){ 
                return {"border-radius": "15px 15px 15px 15px", "width": "150px", "height": "150px", "margin": "15px",}
            },
            branches: [[11, "#89CFF0"]],
        },
        23: {
            title: "Study 2.3 <br> TM",
            description: "<b>Reduce</b> T.F.G.E. and Warp Warp Time's cost increase (+4.33 -> +4)",
            cost() { 
                cost = new Decimal(2)
                if (hasUpgrade("st",21)) cost = cost.add(1)
                if (hasUpgrade("st",22)) cost = cost.add(1)
                return cost
            },
            currencyDisplayName: "Study Points",
            currencyInternalName: "points",
            currencyLayer: "st",
            canAfford() {return player["st"].points.gte(this.cost) && hasUpgrade("st",11)},
            style(){ 
                return {"border-radius": "15px 15px 15px 15px", "width": "150px", "height": "150px", "margin": "15px",}
            },
            branches: [[11, "#89CFF0"]],
        },
        31: {
            title: "Study 3.1 <br> U",
            description: "<b>+ ^0.67</b> 'U' value",
            cost() { 
                cost = new Decimal(2)
                if (hasUpgrade("st",22)) cost = cost.add(1)
                if (hasUpgrade("st",23)) cost = cost.add(1)
                return cost
            },
            currencyDisplayName: "Study Points",
            currencyInternalName: "points",
            currencyLayer: "st",
            canAfford() {return player["st"].points.gte(this.cost) && hasUpgrade("st",21)},
            style(){ 
                return {"border-radius": "15px 15px 15px 15px", "width": "150px", "height": "150px", "margin": "15px",}
            },
            branches: [[21, "#FFFFFF"]],
        },
        32: {
            title: "Study 3.2 <br> R",
            description: "<b>Reduce</b> Additive and Multiplicative Research Upgrade cost increase (x1.5 -> x1.4)",
            cost() { 
                cost = new Decimal(1)
                if (hasUpgrade("st",21)) cost = cost.add(1)
                if (hasUpgrade("st",23)) cost = cost.add(1)
                return cost
            },
            currencyDisplayName: "Study Points",
            currencyInternalName: "points",
            currencyLayer: "st",
            canAfford() {return player["st"].points.gte(this.cost) && hasUpgrade("st",22)},
            style(){ 
                return {"border-radius": "15px 15px 15px 15px", "width": "150px", "height": "150px", "margin": "15px",}
            },
            branches: [[22, "#FFFFFF"]],
        },
        33: {
            title: "Study 3.3 <br> TM",
            description: "<b>Reduce</b> Time Fragment Generator and Warp Time's cost increase (x1.85 -> x1.75)",
            cost() { 
                cost = new Decimal(3)
                if (hasUpgrade("st",21)) cost = cost.add(1)
                if (hasUpgrade("st",22)) cost = cost.add(1)
                return cost
            },
            currencyDisplayName: "Study Points",
            currencyInternalName: "points",
            currencyLayer: "st",
            canAfford() {return player["st"].points.gte(this.cost) && hasUpgrade("st",23)},
            style(){ 
                return {"border-radius": "15px 15px 15px 15px", "width": "150px", "height": "150px", "margin": "15px",}
            },
            branches: [[23, "#FFFFFF"]],
        },
        41: {
            title: "Study 4.1 <br> U",
            description: "<b>+ x998.5</b> to the base of 'U' Upgrade 1.2",
            cost() { 
                cost = new Decimal(2)
                if (hasUpgrade("st",22)) cost = cost.add(1)
                if (hasUpgrade("st",23)) cost = cost.add(1)
                return cost
            },
            currencyDisplayName: "Study Points",
            currencyInternalName: "points",
            currencyLayer: "st",
            canAfford() {return player["st"].points.gte(this.cost) && hasUpgrade("st",31)},
            style(){ 
                return {"border-radius": "15px 15px 15px 15px", "width": "150px", "height": "150px", "margin": "15px",}
            },
            branches: [[31, "#FFFFFF"]],
        },
        42: {
            title: "Study 4.2 <br> R",
            description: "<b>+0.01</b> base of Multiplicative Research Upgrade",
            cost() { 
                cost = new Decimal(3)
                if (hasUpgrade("st",21)) cost = cost.add(1)
                if (hasUpgrade("st",23)) cost = cost.add(1)
                return cost
            },
            currencyDisplayName: "Study Points",
            currencyInternalName: "points",
            currencyLayer: "st",
            canAfford() {return player["st"].points.gte(this.cost) && hasUpgrade("st",32)},
            style(){ 
                return {"border-radius": "15px 15px 15px 15px", "width": "150px", "height": "150px", "margin": "15px",}
            },
            branches: [[32, "#FFFFFF"]],
        },
        43: {
            title: "Study 4.3 <br> TM",
            description: "<b>Enhance</b> T.F.G.E. effect (^0.90 -> ^0.95)",
            cost() { 
                cost = new Decimal(1)
                if (hasUpgrade("st",21)) cost = cost.add(1)
                if (hasUpgrade("st",22)) cost = cost.add(1)
                return cost
            },
            currencyDisplayName: "Study Points",
            currencyInternalName: "points",
            currencyLayer: "st",
            canAfford() {return player["st"].points.gte(this.cost) && hasUpgrade("st",33)},
            style(){ 
                return {"border-radius": "15px 15px 15px 15px", "width": "150px", "height": "150px", "margin": "15px",}
            },
            branches: [[33, "#FFFFFF"]],
        },
        51: {
            title: "Study 5.1 <br> Ab",
            description: "<b>Unlock</b> Abdicate <br> <b style='color: red;'> CURRENT ENDGAME </b>",
            cost: new Decimal(30),
            currencyDisplayName: "Study Points",
            currencyInternalName: "points",
            currencyLayer: "st",
            canAfford() {return player["st"].points.gte(this.cost) && hasUpgrade("st",41) && hasUpgrade("st",42) && hasUpgrade("st",43)},
            style(){ 
                return {"border-radius": "15px 15px 15px 15px", "width": "150px", "height": "150px", "margin": "15px",}
            },
            branches: [[41, "#DC143C"],[42, "#DC143C"],[43, "#DC143C"]],
        },
    },
    automate() {
    },
    update(diff) {

    },
    getResetGain() {
        gain = new Decimal(0)
        return gain
    },
    gainMult() { 
        mult = new Decimal(1)
        return mult
    },
    gainExp() { 
        exp = new Decimal(1)
        return exp
    },
    exponent: 1, 
    position: 0, 
    row: 1,
    displayRow: 0,
    layerShown(){return false},
    doReset(resettingLayer) {
        let keep=[];
        if (layers[resettingLayer].row > this.row) {layerDataReset("st", keep);
        }
    },
})