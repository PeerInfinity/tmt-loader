addLayer("g", {
    tabFormat: {
        "Variables": {
            content:[
                "main-display",
                ["display-text", function() { return "You Are Gaining <h2><b style='color:#BF40BF;'>" + format(getResetGain("g")) + "</b></h2> g(t) Per Second" },],
                "blank",
                ["display-text", function() { return "You Have <h2><b style='color:#BF40BF;'>" + format(player["p"].points) + "</b></h2> PP" },],
                "blank",
                ["display-text", function() {
                    if (tmp["tm"].layerShown && tmp["pu"].layerShown && hasUpgrade("p",11) && hasUpgrade("p",12) && inChallenge("fd",11)) return "g(time+TimeSpeed) = g(time) + [wxyz⋅pU⋅(TimeSpeed)]^0.25"
                    else if (tmp["tm"].layerShown && tmp["pu"].layerShown && hasUpgrade("p",12) && inChallenge("fd",11)) return "g(time+TimeSpeed) = g(time) + [wxyz⋅pU⋅(TimeSpeed)⋅0.01]^0.25"
                    else if (tmp["tm"].layerShown && tmp["pu"].layerShown && hasUpgrade("p",11) && inChallenge("fd",11)) return "g(time+TimeSpeed) = g(time) + [wxyz⋅pU⋅(TimeSpeed^0.75)]^0.25"
                    else if (tmp["pu"].layerShown && hasUpgrade("p",11) && inChallenge("fd",11)) return "g(time+1) = g(time) + [wxyz⋅pU]^0.25"
                    else if (tmp["tm"].layerShown && tmp["pu"].layerShown && hasUpgrade("p",11) && hasUpgrade("p",12)) return "g(time+TimeSpeed) = g(time) + wxyz⋅pU⋅(TimeSpeed)"
                    else if (tmp["tm"].layerShown && tmp["pu"].layerShown && hasUpgrade("p",12)) return "g(time+TimeSpeed) = g(time) + wxyz⋅pU⋅(TimeSpeed)⋅0.01"
                    else if (tmp["tm"].layerShown && tmp["pu"].layerShown && hasUpgrade("p",11)) return "g(time+TimeSpeed) = g(time) + wxyz⋅pU⋅(TimeSpeed^0.75)"
                    else if (tmp["pu"].layerShown && hasUpgrade("p",11)) return "g(time+1) = g(time) + wxyz⋅pU"
                    else if (tmp["tm"].layerShown && tmp["pu"].layerShown) return "g(time+TimeSpeed) = g(time) + wxyz⋅pU⋅(TimeSpeed^0.75)⋅0.01"
                    else if (tmp["pu"].layerShown) return "g(time+1) = g(time) + wxyz⋅pU⋅0.01"
                    else if (tmp["tm"].layerShown && hasUpgrade("p",11) && hasUpgrade("p",12)) return "g(time+TimeSpeed) = g(time) + wxyz⋅(TimeSpeed)"
                    else if (tmp["tm"].layerShown && hasUpgrade("p",12)) return "g(time+TimeSpeed) = g(time) + wxyz⋅(TimeSpeed)⋅0.01"
                    else if (tmp["tm"].layerShown && hasUpgrade("p",11)) return "g(time+TimeSpeed) = g(time) + wxyz⋅(TimeSpeed^0.75)"
                    else if (hasUpgrade("p",11)) return "g(time+1) = g(time) + wxyz"
                    else if (tmp["tm"].layerShown) return "g(time+TimeSpeed) = g(time) + wxyz⋅(TimeSpeed^0.75)⋅0.01"
                    else return "g(time+1) = g(time) + wxyz⋅0.01"
                },],
                "blank",
                ["row", [["clickable", 11], ["clickable", 12]]],
                ["row", [["buyable", 11], ["buyable", 12]]],
                ["row", [["buyable", 21], ["buyable", 22]]],
                ["row", [["buyable", 31], ["buyable", 32]]],
                ["row", [["buyable", 41], ["buyable", 42]]],
                "blank"
            ],
        },
    },
    name: "g of t", 
    symbol: "g",
    color: "#BF40BF", 
    nodeStyle() {
        var style = {"margin": "15px", "background": "#BF40BF", "background-origin": "border-box"}
        if (inChallenge("fd",11)) style["background"] = "radial-gradient(#BF40BF, #797EF6)";
        if (options.nodeStyle) style["border-radius"] = "15px 15px 15px 15px";
        return style
    },
    resource: "g(t)",
    baseResource: "PP",
    requires: new Decimal(1),
    baseAmount() {return player.points}, 
    startData() { return {
        unlocked: true,
		points: new Decimal(1),
    }},
    passiveGeneration() { return true },
    type: "normal", 
    clickables: {
        11: {
            display() {return "<h2>Buy Max"},
            canClick() {return true},
            onClick() {
                buyMaxBuyable("g", 41) & buyMaxBuyable("g", 31) & buyMaxBuyable("g", 21) & buyMaxBuyable("g", 11)
            },
            onHold() {
                buyMaxBuyable("g", 41) & buyMaxBuyable("g", 31) & buyMaxBuyable("g", 21) & buyMaxBuyable("g", 11)
            },
            style() {
                if (tmp["g"].clickables[12].unlocked) return {"border-radius": "15px 0px 0px 0px", "width": "280px", "min-height": "40px"}
                else return {"border-radius": "15px 15px 0px 0px", "width": "280px", "min-height": "40px", "margin-right": "200px"}
            },
            unlocked() {return hasAchievement("A", 55)}
        },
        12: {
            display() {return "<h2>Buy Max"},
            canClick() {return true},
            onClick() {
                buyMaxBuyable("g", 42) & buyMaxBuyable("g", 32) & buyMaxBuyable("g", 22) & buyMaxBuyable("g", 12)
            },
            onHold() {
                buyMaxBuyable("g", 42) & buyMaxBuyable("g", 32) & buyMaxBuyable("g", 22) & buyMaxBuyable("g", 12)
            },
            style() {
                if (tmp["g"].clickables[11].unlocked) return {"border-radius": "0px 15px 0px 0px", "width": "200px", "min-height": "40px"}
                else return {"border-radius": "15px 15px 0px 0px", "width": "200px", "min-height": "40px", "margin-left": "280px"}
            },
            unlocked() {return hasAchievement("A", 56)}
        },
    },
    buyables: {
        11: {
            title() {return "'w' Variable"},
            cost(x) { return new Decimal(1).mul(new Decimal(1.5).pow(x))},
            display() { return "Increase the value of 'w' Variable <br> <b> w = " + format(tmp.g.buyables[11].effect) + " </b> <br> (bought:" + format(getBuyableAmount("g", 11)) + ")" + "<br> Cost: <b style='color:red;'> g(t) = " + format(this.cost(getBuyableAmount("g", 11)))},
            canAfford() { return player["g"].points.gte(this.cost()) },
            buy() {
                player["g"].points = player["g"].points.sub(this.cost())
                setBuyableAmount("g", 11, getBuyableAmount("g", 11).add(1))
            },
            buyMax() {
                getMax(player["g"].points, this.cost(), 1.5)
                subCost(1.5, getBuyableAmount("g", 11), 1)
                player["g"].points = player["g"].points.sub(new Decimal(sub))
                setBuyableAmount("g", 11, getBuyableAmount("g", 11).add(new Decimal(max)))
            },
            effect() { 
                eff = new Decimal(0)
                eff = eff.add(getBuyableAmount("g", 11))
                eff = eff.mul(buyableEffect("g",12))
                return eff
            },
            style(){                 
                if (tmp["g"].clickables[11].unlocked) return {"border-radius": "0px 0px 0px 0px", "width": "280px", "height": "100px"}
                else return {"border-radius": "15px 0px 0px 0px", "width": "280px", "height": "100px"}
            },
            unlocked() {
                return true
            }
        },
        12: {
            title() {return "Boost 'w' Variable"},
            cost(x) { return new Decimal(1).mul(new Decimal(10).pow(x))},
            display() { 
                if (getBuyableAmount("g",12).gte(308)) return "<b>x2</b> 'w' variable value<b style='color:red;'> Softcapped </b> <br> Currently:<b> x" + format(tmp.g.buyables[12].effect) + " </b> <br> (bought:" + format(getBuyableAmount("g", 12)) + ")" + "<br> Cost: <b style='color:red;'>" + format(this.cost(getBuyableAmount("g", 12))) + " PP"
                else return "<b>x2</b> 'w' variable value <br> Currently:<b> x" + format(tmp.g.buyables[12].effect) + " </b> <br> (bought:" + format(getBuyableAmount("g", 12)) + ")" + "<br> Cost: <b style='color:red;'>" + format(this.cost(getBuyableAmount("g", 12))) + " PP"
            },
            canAfford() { return player["p"].points.gte(this.cost()) },
            buy() {
                player["p"].points = player["p"].points.sub(this.cost())
                setBuyableAmount("g", 12, getBuyableAmount("g", 12).add(1))
            },
            buyMax() {
                getMax(player["p"].points.abs(), this.cost(), 10)
                subCost(10, getBuyableAmount("g", 12), 1)
                player["p"].points = player["p"].points.sub(new Decimal(sub))
                setBuyableAmount("g", 12, getBuyableAmount("g", 12).add(new Decimal(max)))
            },
            effect() { 
                eff = new Decimal(2)
                eff = eff.pow(getBuyableAmount("g", 12))
                if (getBuyableAmount("g",12).gte(308)) {
                    eff = new Decimal(2).pow(308)
                    eff = eff.mul(new Decimal(2).pow(getBuyableAmount("g",12).sub(308).pow(0.85)))
                }
                return eff
            },
            style(){ 
                if (tmp["g"].clickables[12].unlocked) return {"border-radius": "0px 0px 0px 0px", "width": "200px", "height": "100px"}
                else return {"border-radius": "0px 15px 0px 0px", "width": "200px", "height": "100px"}
            },
            unlocked() {
                return true
            }
        },
        21: {
            title() {return "'x' Variable"},
            cost(x) { return new Decimal(1000).mul(new Decimal(1.5).pow(x))},
            display() { return "Increase the value of 'x' Variable <br> <b> x = " + format(tmp.g.buyables[21].effect) + " </b> <br> (bought:" + format(getBuyableAmount("g", 21)) + ")" + "<br> Cost: <b style='color:red;'> g(t) = " + format(this.cost(getBuyableAmount("g", 21)))},
            canAfford() { return player["g"].points.gte(this.cost()) },
            buy() {
                player["g"].points = player["g"].points.sub(this.cost())
                setBuyableAmount("g", 21, getBuyableAmount("g", 21).add(1))
            },
            buyMax() {
                getMax(player["g"].points.abs(), this.cost(), 1.5)
                subCost(1.5, getBuyableAmount("g", 21), 1000)
                player["g"].points = player["g"].points.sub(new Decimal(sub))
                setBuyableAmount("g", 21, getBuyableAmount("g", 21).add(new Decimal(max)))
            },
            effect() { 
                eff = new Decimal(1)
                eff = eff.add(getBuyableAmount("g", 21))
                eff = eff.mul(buyableEffect("g",22))
                return eff
            },
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "280px", "height": "100px"}
            },
            unlocked() {
                return true
            }
        },
        22: {
            title() {return "Boost 'x' Variable"},
            cost(x) { return new Decimal(1000000).mul(new Decimal(100).pow(x))},
            display() { 
                if (getBuyableAmount("g",22).gte(308)) return "<b>x2</b> 'x' variable value<b style='color:red;'> Softcapped </b> <br> Currently:<b> x" + format(tmp.g.buyables[22].effect) + " </b> <br> (bought:" + format(getBuyableAmount("g", 22)) + ")" + "<br> Cost: <b style='color:red;'>" + format(this.cost(getBuyableAmount("g", 22))) + " PP"
                else return "<b>x2</b> 'x' variable value <br> Currently:<b> x" + format(tmp.g.buyables[22].effect) + " </b> <br> (bought:" + format(getBuyableAmount("g", 22)) + ")" + "<br> Cost: <b style='color:red;'>" + format(this.cost(getBuyableAmount("g", 22))) + " PP"
            },
            canAfford() { return player["p"].points.gte(this.cost()) },
            buy() {
                player["p"].points = player["p"].points.sub(this.cost())
                setBuyableAmount("g", 22, getBuyableAmount("g", 22).add(1))
            },
            buyMax() {
                getMax(player["p"].points.abs(), this.cost(), 100)
                subCost(100, getBuyableAmount("g", 22), 1000000)
                player["p"].points = player["p"].points.sub(new Decimal(sub))
                setBuyableAmount("g", 22, getBuyableAmount("g", 22).add(new Decimal(max)))
            },
            effect() { 
                eff = new Decimal(2)
                eff = eff.pow(getBuyableAmount("g", 22))
                if (getBuyableAmount("g",22).gte(308)) {
                    eff = new Decimal(2).pow(308)
                    eff = eff.mul(new Decimal(2).pow(getBuyableAmount("g",22).sub(308).pow(0.5)))
                }
                return eff
            },
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "200px", "height": "100px"}
            },
            unlocked() {
                return true
            }
        },
        31: {
            title() {return "'y' Variable"},
            cost(x) { return new Decimal(100000000).mul(new Decimal(1.5).pow(x))},
            display() { return "Increase the value of 'y' Variable <br> <b> y = " + format(tmp.g.buyables[31].effect) + " </b> <br> (bought:" + format(getBuyableAmount("g", 31)) + ")" + "<br> Cost: <b style='color:red;'> g(t) = " + format(this.cost(getBuyableAmount("g", 31)))},
            canAfford() { return player["g"].points.gte(this.cost()) },
            buy() {
                player["g"].points = player["g"].points.sub(this.cost())
                setBuyableAmount("g", 31, getBuyableAmount("g", 31).add(1))
            },
            buyMax() {
                getMax(player["g"].points.abs(), this.cost(), 1.5)
                subCost(1.5, getBuyableAmount("g", 31), 100000000)
                player["g"].points = player["g"].points.sub(new Decimal(sub))
                setBuyableAmount("g", 31, getBuyableAmount("g", 31).add(new Decimal(max)))
            },
            effect() { 
                eff = new Decimal(1)
                eff = eff.add(getBuyableAmount("g", 31))
                eff = eff.mul(buyableEffect("g",32))
                return eff
            },
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "280px", "height": "100px"}
            },
            unlocked() {
                return true
            }
        },
        32: {
            title() {return "Boost 'y' Variable"},
            cost(x) { return new Decimal(1e18).mul(new Decimal(1000).pow(x))},
            display() { 
                if (getBuyableAmount("g",32).gte(308)) return "<b>x2</b> 'y' variable value<b style='color:red;'> Softcapped </b> <br> Currently:<b> x" + format(tmp.g.buyables[32].effect) + " </b> <br> (bought:" + format(getBuyableAmount("g", 32)) + ")" + "<br> Cost: <b style='color:red;'>" + format(this.cost(getBuyableAmount("g", 32))) + " PP"
                else return "<b>x2</b> 'y' variable value <br> Currently:<b> x" + format(tmp.g.buyables[32].effect) + " </b> <br> (bought:" + format(getBuyableAmount("g", 32)) + ")" + "<br> Cost: <b style='color:red;'>" + format(this.cost(getBuyableAmount("g", 32))) + " PP"
            },
            canAfford() { return player["p"].points.gte(this.cost()) },
            buy() {
                player["p"].points = player["p"].points.sub(this.cost())
                setBuyableAmount("g", 32, getBuyableAmount("g", 32).add(1))
            },
            buyMax() {
                getMax(player["p"].points.abs(), this.cost(), 1000)
                subCost(1000, getBuyableAmount("g", 32), 1e18)
                player["p"].points = player["p"].points.sub(new Decimal(sub))
                setBuyableAmount("g", 32, getBuyableAmount("g", 32).add(new Decimal(max)))
            },
            effect() { 
                eff = new Decimal(2)
                eff = eff.pow(getBuyableAmount("g", 32))
                if (getBuyableAmount("g",32).gte(308)) {
                    eff = new Decimal(2).pow(308)
                    eff = eff.mul(new Decimal(2).pow(getBuyableAmount("g",32).sub(308).pow(0.5)))
                }
                return eff
            },
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "200px", "height": "100px"}
            },
            unlocked() {
                return true
            }
        },
        41: {
            title() {return "'z' Variable"},
            cost(x) { return new Decimal(1e15).mul(new Decimal(1.5).pow(x))},
            display() { return "Increase the value of 'z' Variable <br> <b> z = " + format(tmp.g.buyables[41].effect) + " </b> <br> (bought:" + format(getBuyableAmount("g", 41)) + ")" + "<br> Cost: <b style='color:red;'> g(t) = " + format(this.cost(getBuyableAmount("g", 41)))},
            canAfford() { return player["g"].points.gte(this.cost()) },
            buy() {
                player["g"].points = player["g"].points.sub(this.cost())
                setBuyableAmount("g", 41, getBuyableAmount("g", 41).add(1))
            },
            buyMax() {
                getMax(player["g"].points.abs(), this.cost(), 1.5)
                subCost(1.5, getBuyableAmount("g", 41), 1e15)
                player["g"].points = player["g"].points.sub(new Decimal(sub))
                setBuyableAmount("g", 41, getBuyableAmount("g", 41).add(new Decimal(max)))
            },
            effect() { 
                eff = new Decimal(1)
                eff = eff.add(getBuyableAmount("g", 41))
                eff = eff.mul(buyableEffect("g",42))
                return eff
            },
            style(){ 
                return {"border-radius": "0px 0px 0px 15px", "width": "280px", "height": "100px"}
            },
            unlocked() {
                return true
            }
        },
        42: {
            title() {return "Boost 'z' Variable"},
            cost(x) { return new Decimal(1e54).mul(new Decimal(10000).pow(x))},
            display() { 
                if (getBuyableAmount("g",42).gte(308)) return "<b>x2</b> 'z' variable value<b style='color:red;'> Softcapped </b> <br> Currently:<b> x" + format(tmp.g.buyables[42].effect) + " </b> <br> (bought:" + format(getBuyableAmount("g", 42)) + ")" + "<br> Cost: <b style='color:red;'>" + format(this.cost(getBuyableAmount("g", 42))) + " PP"
                else return "<b>x2</b> 'z' variable value <br> Currently:<b> x" + format(tmp.g.buyables[42].effect) + " </b> <br> (bought:" + format(getBuyableAmount("g", 42)) + ")" + "<br> Cost: <b style='color:red;'>" + format(this.cost(getBuyableAmount("g", 42))) + " PP"
            },
            canAfford() { return player["p"].points.gte(this.cost()) },
            buy() {
                player["p"].points = player["p"].points.sub(this.cost())
                setBuyableAmount("g", 42, getBuyableAmount("g", 42).add(1))
            },
            buyMax() {
                getMax(player["p"].points.abs(), this.cost(), 10000)
                subCost(10000, getBuyableAmount("g", 42), 1e54)
                player["p"].points = player["p"].points.sub(new Decimal(sub))
                setBuyableAmount("g", 42, getBuyableAmount("g", 42).add(new Decimal(max)))
            },
            effect() { 
                eff = new Decimal(2)
                eff = eff.pow(getBuyableAmount("g", 42))
                if (getBuyableAmount("g",42).gte(308)) {
                    eff = new Decimal(2).pow(308)
                    eff = eff.mul(new Decimal(2).pow(getBuyableAmount("g",42).sub(308).pow(0.5)))
                }
                return eff
            },
            style(){ 
                return {"border-radius": "0px 0px 15px 0px", "width": "200px", "height": "100px"}
            },
            unlocked() {
                return true
            }
        },
    },
    automate() {

    },
    update(diff) {
        if (player["g"].points.gte(new Decimal(2).pow(1024)) && !hasChallenge("inf",32))  player["g"].points = new Decimal(2).pow(1024)

    },
    getResetGain() {
        gain = new Decimal(0)
        gain = gain.add(buyableEffect("g",11).mul(buyableEffect("g",21)).mul(buyableEffect("g",31)).mul(buyableEffect("g",41)))
        gain = gain.mul(tmp.g.gainMult)
        gain = gain.pow(tmp.g.gainExp)
        if (player.points.gte(infinityCap())) gain = new Decimal(0)
        return gain
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (!hasUpgrade("p",11)) mult = mult.mul(0.01)
        if (!hasUpgrade("p",12)) mult = mult.mul(getPointGen().pow(0.75))
        if (hasUpgrade("p",12)) mult = mult.mul(getPointGen())
        mult = mult.mul(player["pu"].points)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        if (inChallenge("fd",11)) exp = exp.mul(0.25)
        return exp
    },
    exponent: 1, 
    position: 2, 
    row: 1,
    displayRow: 2,
    branches: ["p","f"],
    layerShown(){return hasAchievement("A",51)},
    doReset(resettingLayer) {
        let keep=[];
        if (layers[resettingLayer].row > this.row) {layerDataReset("g", keep);
        }
    },
})