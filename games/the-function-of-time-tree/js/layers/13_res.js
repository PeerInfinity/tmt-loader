addLayer("res", {
    tabFormat: {
        "Research": {
            content:[
                "main-display",
                ["display-text", function() { return "You Are Gaining <h2><b style='color:#234F1E;'>" + format(getResetGain("res")) + "</b></h2> Knowledge Per Second" },],
                "blank",
                ["display-text", function() { return "You Have <h2><b style='color:#63C5DA;'>" + format(player["f"].points) + "</b></h2> f(t)" },],
                "blank",
                ["display-text", function() { return "<h3> Research Upgrades </h3>" },],
                ["clickable", 11],
                ["row", [["buyable", 11], ["buyable", 12]]],
                "blank",
                ["display-text", function() { return "<h3> Variable Upgrades </h3>" },],
                ["clickable", 21],
                ["row", [["buyable", 21], ["buyable", 22]]],
                ["row", [["buyable", 31], ["buyable", 32]]],
                ["row", [["buyable", 41], ["buyable", 42]]],
                "blank",
            ],
        },
        "Res-Upgrades": {
            content:[
                "main-display",                
                "blank",
                ["clickable", 31],
                "upgrades",
            ],
            unlocked() {return hasUpgrade("u",21)},
        },
        "Study Tree": {
            content:[
                ["layer-proxy", ["st", [
                    "main-display",
                    ["clickable", 11],
                    ["row", [["buyable", 11], ["buyable", 12], ["buyable", 13]]],
                ]]],
                "blank",
                ["microtabs", "studytree"],
            ],
            buttonStyle() { return {'border-color': '#FFE77B'}},
            unlocked() {return hasMilestone("inf",5)},
        },
    },
    microtabs: {
        studytree: {
            "The Tree": {
                buttonStyle() { return {'border-color': '#FFE77B'} },
                content: [
                    "blank",
                    ["layer-proxy", ["st", [
                        ["clickable", 21],
                        "blank",
                        "upgrades",
                    ]]],           
                    "blank",
                ]
            },
            "Branch Info": {
                buttonStyle() { return {'border-color': '#FFE77B'} },
                content: [
                    "blank",
                    ["display-text", function() { return "<h3 style='color: #FFFFFF'> Normal Branch </h3>" },],
                    ["display-text", function() { return "A normal branch does not affect other branches." },],
                    "blank",
                    ["display-text", function() { return "<h3 style='color: #89CFF0'> Cost Increase Branch </h3>" },],
                    ["display-text", function() { return "Increases the cost of the adjacent branches." },],
                    "blank",
                    ["display-text", function() { return "<h3 style='color: #DC143C'> Requires Multiple Branch </h3>" },],
                    ["display-text", function() { return "Upgrade can only be bought when all of <br> the multiple branches were bought." },],
                    "blank",
                ]
            },
            "Tree Build": {
                buttonStyle() { return {'border-color': '#FFE77B'} },
                content: [
                    ["layer-proxy", ["st", [
                    ]]],           
                    "blank",
                ]
            },
        },
    },
    name: "Research", 
    symbol: "R",
    color: "#234F1E", 
    nodeStyle() {
        var style = {"margin": "15px", "background": "#234F1E", "background-origin": "border-box"}
        if (hasMilestone("inf",5)) style["background"] = "radial-gradient(#FFE77B, #234F1E)";
        if (options.nodeStyle) style["border-radius"] = "15px 15px 15px 15px";
        return style
    },
    componentStyles: {
        "microtabs"() { return {"width": "660px"} }
    },
    resource: "Knowledge",
    baseResource: "f(t)",
    requires: new Decimal(1),
    baseAmount() {return player.points}, 
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    passiveGeneration() { return true },
    type: "normal", 
    clickables: {
        11: {
            display() {return "<h2>Buy Max"},
            canClick() {return true},
            onClick() {
                buyMaxBuyable("res", 12) & buyMaxBuyable("res", 11)
            },
            onHold() {
                buyMaxBuyable("res", 12) & buyMaxBuyable("res", 11)
            },
            style() {
                return {"border-radius": "15px 15px 0px 0px", "width": "600px", "min-height": "40px"}
            },
            unlocked() {return hasAchievement("A", 34)}
        },
        21: {
            display() {return "<h2>Buy Max"},
            canClick() {return true},
            onClick() {
                buyMaxBuyable("res", 22) & buyMaxBuyable("res", 21) & buyMaxBuyable("res", 42) & buyMaxBuyable("res", 41) & buyMaxBuyable("res", 32) & buyMaxBuyable("res", 31)
            },
            onHold() {
                buyMaxBuyable("res", 22) & buyMaxBuyable("res", 21) & buyMaxBuyable("res", 42) & buyMaxBuyable("res", 41) & buyMaxBuyable("res", 32) & buyMaxBuyable("res", 31)
            },
            style() {
                if (tmp["res"].buyables[22].unlocked) return {"border-radius": "15px 15px 0px 0px", "width": "600px", "min-height": "40px"}
                else return {"border-radius": "15px 15px 0px 0px", "width": "300px", "min-height": "40px"}
            },
            unlocked() {return hasAchievement("A", 25)}
        },
        31: {
            display() {return "<h2>Buy All"},
            canClick() {return true},
            onClick() {
                buyUpgrade("res", 11) & buyUpgrade("res", 12) & buyUpgrade("res", 13) & buyUpgrade("res", 14) & buyUpgrade("res", 15)
                buyUpgrade("res", 21) & buyUpgrade("res", 22) & buyUpgrade("res", 23) & buyUpgrade("res", 24) & buyUpgrade("res", 25)
            },
            onHold() {
                buyUpgrade("res", 11) & buyUpgrade("res", 12) & buyUpgrade("res", 13) & buyUpgrade("res", 14) & buyUpgrade("res", 15)
                buyUpgrade("res", 21) & buyUpgrade("res", 22) & buyUpgrade("res", 23) & buyUpgrade("res", 24) & buyUpgrade("res", 25)
            },
            style() {
                return {"border-radius": "15px 15px 0px 0px", "width": "600px", "min-height": "40px"}
            },
            unlocked() {return hasAchievement("A", 35)}
        },
    },
    buyables: {
        11: {
            title() {return "Additive Research Upgrade <br> (+)"},
            cost(x) { return new Decimal(100000000).mul(new Decimal(resbuy11cm()).pow(x))},
            display() { return "Increase the value of knowlege gain additively <b>(+0.01)</b> <br> Currrently: <b>+" + format(tmp.res.buyables[11].effect) + " </b> <br> (bought:" + format(getBuyableAmount("res", 11)) + ")" + "<br> Cost: <b style='color:red;'> f(t) = " + format(this.cost(getBuyableAmount("res", 11)))},
            canAfford() { return player["f"].points.gte(this.cost()) },
            buy() {
                if (!hasChallenge("inf",21)) player["f"].points = player["f"].points.sub(this.cost())
                setBuyableAmount("res", 11, getBuyableAmount("res", 11).add(1))
            },
            buyMax() {
                getMax(player["f"].points.abs(), this.cost(), resbuy11cm())
                subCost(resbuy11cm(), getBuyableAmount("res", 11), 100000000)
                if (!hasChallenge("inf",21)) player["f"].points = player["f"].points.sub(new Decimal(sub))
                setBuyableAmount("res", 11, getBuyableAmount("res", 11).add(new Decimal(max)))
            },
            effect() { 
                eff = new Decimal(0)
                eff = eff.add(new Decimal(0.01).mul(getBuyableAmount("res", 11)))
                if (hasUpgrade("st",22)) eff = eff.pow(upgradeEffect("st",22))
                return eff
            },
            style(){ 
                if (tmp["res"].clickables[11].unlocked) return {"border-radius": "0px 0px 0px 15px", "width": "300px", "height": "120px"}
                else return {"border-radius": "15px 0px 0px 15px", "width": "300px", "height": "120px"}
            },
            unlocked() {
                return true
            }
        },
        12: {
            title() {return "Multiplicative Research Upgrade <br> (x)"},
            cost(x) { return new Decimal(100000000).mul(new Decimal(resbuy12cm()).pow(x))},
            display() {return "Increase the value of knowlege gain multiplicatively <b>(" + format(resbuy12base()) + ")</b> Currrently: <b>x" + format(tmp.res.buyables[12].effect) + " </b> <br> (bought:" + format(getBuyableAmount("res", 12)) + ")" + "<br> Cost: <b style='color:red;'> f(t) = " + format(this.cost(getBuyableAmount("res", 12)))},
            canAfford() { return player["f"].points.gte(this.cost()) },
            buy() {
                if (!hasChallenge("inf",21)) player["f"].points = player["f"].points.sub(this.cost())
                setBuyableAmount("res", 12, getBuyableAmount("res", 12).add(1))
            },
            buyMax() {
                getMax(player["f"].points.abs(), this.cost(), resbuy12cm())
                subCost(resbuy12cm(), getBuyableAmount("res", 12), 100000000)
                if (!hasChallenge("inf",21)) player["f"].points = player["f"].points.sub(new Decimal(sub))
                setBuyableAmount("res", 12, getBuyableAmount("res", 12).add(new Decimal(max)))
            },
            effect() { 
                eff = new Decimal(1)
                eff = eff.mul(new Decimal(resbuy12base()).pow(getBuyableAmount("res", 12)))
                return eff
            },
            style(){ 
                if (tmp["res"].clickables[11].unlocked) return {"border-radius": "0px 0px 15px 0px", "width": "300px", "height": "120px"}
                else return {"border-radius": "0px 15px 15px 0px", "width": "300px", "height": "120px"}
            },
            unlocked() {
                return true
            }
        },
        21: {
            title() {return "'U' Variable Upgrade"},
            cost(x) { return new Decimal(1).mul(new Decimal(10).pow(x))},
            display() { 
                if (hasMilestone("inf",4) && hasUpgrade("res",21)) return "<b>x2.5</b> 'U' variable value <br> Currently: <b> x" + format(tmp.res.buyables[21].effect) + " </b> <br> (bought:" + format(getBuyableAmount("res", 21)) + " + " + format(infMs4()) + ")" + "<br> Cost: <b style='color:red;'>" + format(this.cost(getBuyableAmount("res", 21))) + " Knowledge" 
                else if (hasMilestone("inf",4)) return "<b>x2</b> 'U' variable value <br> Currently: <b> x" + format(tmp.res.buyables[21].effect) + " </b> <br> (bought:" + format(getBuyableAmount("res", 21)) + " + " + format(infMs4()) + ")" + "<br> Cost: <b style='color:red;'>" + format(this.cost(getBuyableAmount("res", 21))) + " Knowledge" 
                else if (hasUpgrade("res",21)) return "<b>x2.5</b> 'U' variable value <br> Currently: <b> x" + format(tmp.res.buyables[21].effect) + " </b> <br> (bought:" + format(getBuyableAmount("res", 21)) + ")" + "<br> Cost: <b style='color:red;'>" + format(this.cost(getBuyableAmount("res", 21))) + " Knowledge" 
                else return "<b>x2</b> 'U' variable value <br> Currently: <b> x" + format(tmp.res.buyables[21].effect) + " </b> <br> (bought:" + format(getBuyableAmount("res", 21)) + ")" + "<br> Cost: <b style='color:red;'>" + format(this.cost(getBuyableAmount("res", 21))) + " Knowledge" 
            },
            canAfford() { return player["res"].points.gte(this.cost()) },
            buy() {
                if (!hasChallenge("inf",22)) player["res"].points = player["res"].points.sub(this.cost())
                setBuyableAmount("res", 21, getBuyableAmount("res", 21).add(1))
            },
            buyMax() {
                getMax(player["res"].points.abs(), this.cost(), 10)
                subCost(10, getBuyableAmount("res", 21), 1)
                if (!hasChallenge("inf",22)) player["res"].points = player["res"].points.sub(new Decimal(sub))
                setBuyableAmount("res", 21, getBuyableAmount("res", 21).add(new Decimal(max)))
            },
            effect() { 
                amount = new Decimal(0)
                amount = amount.add(getBuyableAmount("res", 21))
                if (hasMilestone("inf",4)) amount = amount.add(infMs4())

                eff = new Decimal(2)
                if (hasUpgrade("res",21)) eff = eff.add(0.5)
                eff = eff.pow(amount)
                return eff
            },
            style(){ 
                if (player["res"].points.gte(this.cost())) {
                    if (tmp["res"].clickables[21].unlocked) return {'background-color': '#FFE338', "border-radius": "0px 0px 0px 0px", "width": "300px", "height": "120px"}
                    else if (tmp["res"].buyables[22].unlocked) return {'background-color': '#FFE338', "border-radius": "15px 0px 0px 0px", "width": "300px", "height": "120px"}
                    else return {'background-color': '#FFE338', "border-radius": "15px 15px 0px 0px", "width": "300px", "height": "120px"}
                }
                else {
                    if (tmp["res"].clickables[21].unlocked) return {"border-radius": "0px 0px 0px 0px", "width": "300px", "height": "120px"}
                    else if (tmp["res"].buyables[22].unlocked) return { "border-radius": "15px 0px 0px 0px", "width": "300px", "height": "120px"}
                    else return {"border-radius": "15px 15px 0px 0px", "width": "300px", "height": "120px"}
                }
            },
            unlocked() {
                return true
            }
        },
        22: {
            title() {return "'pU' Variable Upgrade"},
            cost(x) { return new Decimal(1).mul(new Decimal(1000).pow(x))},
            display() { 
                return "<b>x2</b> 'pU' variable value <br> Currently: <b> x" + format(tmp.res.buyables[22].effect) + " </b> <br> (bought:" + format(getBuyableAmount("res", 22)) + ")" + "<br> Cost: <b style='color:red;'>" + format(this.cost(getBuyableAmount("res", 22))) + " Knowledge" 
            },
            canAfford() { return player["res"].points.gte(this.cost()) },
            buy() {
                if (!hasChallenge("inf",22)) player["res"].points = player["res"].points.sub(this.cost())
                setBuyableAmount("res", 22, getBuyableAmount("res", 22).add(1))
            },
            buyMax() {
                getMax(player["res"].points.abs(), this.cost(), 1000)
                subCost(1000, getBuyableAmount("res", 22), 1)
                if (!hasChallenge("inf",22)) player["res"].points = player["res"].points.sub(new Decimal(sub))
                setBuyableAmount("res", 22, getBuyableAmount("res", 22).add(new Decimal(max)))
            },
            effect() { 
                eff = new Decimal(2)
                eff = eff.pow(getBuyableAmount("res", 22))
                return eff
            },
            style(){ 
                if (player["res"].points.gte(this.cost())) {
                    if (tmp["res"].clickables[21].unlocked) return {'background-color': '#970439', "border-radius": "0px 0px 0px 0px", "width": "300px", "height": "120px"}
                    else return {'background-color': '#970439', "border-radius": "0px 15px 0px 0px", "width": "300px", "height": "120px"}
                }
                else {
                    if (tmp["res"].clickables[21].unlocked) return {"border-radius": "0px 0px 0px 0px", "width": "300px", "height": "120px"}
                    else return {"border-radius": "0px 15px 0px 0px", "width": "300px", "height": "120px"}
                }
            },
            unlocked() {
                return hasUpgrade("pu",23)
            }
        },
        31: {
            title() {return "'a' Variable Upgrade"},
            cost(x) { return new Decimal(1).mul(new Decimal(1.0964).pow(x))},
            display() { 
                if (hasUpgrade("res",22)) return "<b>x1.01</b> 'a' variable value <br> Currrently: <b>x" + format(tmp.res.buyables[31].effect) + " </b> <br> (bought:" + format(getBuyableAmount("res", 31)) + ")" + "<br> Cost: <b style='color:red;'>" + format(this.cost(getBuyableAmount("res", 31))) + " Knowledge"
                else return "<b>+1%</b> 'a' variable value <br> Currrently: <b>x" + format(tmp.res.buyables[31].effect) + " </b> <br> (bought:" + format(getBuyableAmount("res", 31)) + ")" + "<br> Cost: <b style='color:red;'>" + format(this.cost(getBuyableAmount("res", 31))) + " Knowledge"
            },
            canAfford() { return player["res"].points.gte(this.cost()) },
            buy() {
                if (!hasChallenge("inf",22)) player["res"].points = player["res"].points.sub(this.cost())
                setBuyableAmount("res", 31, getBuyableAmount("res", 31).add(1))
            },
            buyMax() {
                getMax(player["res"].points.abs(), this.cost(), 1.0964)
                subCost(1.0964, getBuyableAmount("res", 31), 1)
                if (!hasChallenge("inf",22)) player["res"].points = player["res"].points.sub(new Decimal(sub))
                setBuyableAmount("res", 31, getBuyableAmount("res", 31).add(new Decimal(max)))
            },
            effect() { 
                eff = new Decimal(1)
                if (hasUpgrade("res",22)) eff = eff.mul(new Decimal(1.01).pow(getBuyableAmount("res", 31)))
                else eff = eff.add(new Decimal(0.01).mul(getBuyableAmount("res", 31)))
                return eff
            },
            style(){ 
                if (player["res"].points.gte(this.cost())) {
                    if (tmp["res"].buyables[22].unlocked)  return {'background-color': '#63C5DA',"border-radius": "0px 0px 0px 0px", "width": "300px", "height": "120px"}
                    else return {'background-color': '#63C5DA',"border-radius": "15px 0px 0px 0px", "width": "300px", "height": "120px"}
                }
                else {
                    if (tmp["res"].buyables[22].unlocked)  return {"border-radius": "0px 0px 0px 0px", "width": "300px", "height": "120px"}
                    else return {"border-radius": "15px 0px 0px 0px", "width": "300px", "height": "120px"}
                }
            },
            unlocked() {
                return true
            }
        },
        32: {
            title() {return "'b' Variable Upgrade"},
            cost(x) { return new Decimal(1).mul(new Decimal(1.0964).pow(x))},
            display() { 
                if (hasUpgrade("res",23)) return "<b>x1.01</b> 'b' variable value <br> Currrently: <b>x" + format(tmp.res.buyables[32].effect) + " </b> <br> (bought:" + format(getBuyableAmount("res", 32)) + ")" + "<br> Cost: <b style='color:red;'>" + format(this.cost(getBuyableAmount("res", 32))) + " Knowledge"
                else return "<b>+1%</b> 'b' variable value <br> Currrently: <b>x" + format(tmp.res.buyables[32].effect) + " </b> <br> (bought:" + format(getBuyableAmount("res", 32)) + ")" + "<br> Cost: <b style='color:red;'>" + format(this.cost(getBuyableAmount("res", 32))) + " Knowledge"
            },
            canAfford() { return player["res"].points.gte(this.cost()) },
            buy() {
                if (!hasChallenge("inf",22)) player["res"].points = player["res"].points.sub(this.cost())
                setBuyableAmount("res", 32, getBuyableAmount("res", 32).add(1))
            },
            buyMax() {
                getMax(player["res"].points.abs(), this.cost(), 1.0964)
                subCost(1.0964, getBuyableAmount("res", 32), 1)
                if (!hasChallenge("inf",22)) player["res"].points = player["res"].points.sub(new Decimal(sub))
                setBuyableAmount("res", 32, getBuyableAmount("res", 32).add(new Decimal(max)))
            },
            effect() { 
                eff = new Decimal(1)
                if (hasUpgrade("res",23)) eff = eff.mul(new Decimal(1.01).pow(getBuyableAmount("res", 32)))
                else eff = eff.add(new Decimal(0.01).mul(getBuyableAmount("res", 32)))
                return eff
            },
            style(){ 
                if (player["res"].points.gte(this.cost())) {
                    if (tmp["res"].buyables[22].unlocked)  return {'background-color': '#63C5DA',"border-radius": "0px 0px 0px 0px", "width": "300px", "height": "120px"}
                    else return {'background-color': '#63C5DA',"border-radius": "0px 15px 0px 0px", "width": "300px", "height": "120px"}
                }
                else {
                    if (tmp["res"].buyables[22].unlocked)  return {"border-radius": "0px 0px 0px 0px", "width": "300px", "height": "120px"}
                    else return {"border-radius": "0px 15px 0px 0px", "width": "300px", "height": "120px"}
                }
            },
            unlocked() {
                return true
            }
        },
        41: {
            title() {return "'c' Variable Upgrade"},
            cost(x) { return new Decimal(1).mul(new Decimal(1.0964).pow(x))},
            display() { 
                if (hasUpgrade("res",24)) return "<b>x1.01</b> 'c' variable value <br> Currrently: <b>x" + format(tmp.res.buyables[41].effect) + " </b> <br> (bought:" + format(getBuyableAmount("res", 41)) + ")" + "<br> Cost: <b style='color:red;'>" + format(this.cost(getBuyableAmount("res", 41))) + " Knowledge"
                else return "<b>+1%</b> 'c' variable value <br> Currrently: <b>x" + format(tmp.res.buyables[41].effect) + " </b> <br> (bought:" + format(getBuyableAmount("res", 41)) + ")" + "<br> Cost: <b style='color:red;'>" + format(this.cost(getBuyableAmount("res", 41))) + " Knowledge"
            },
            canAfford() { return player["res"].points.gte(this.cost()) },
            buy() {
                if (!hasChallenge("inf",22)) player["res"].points = player["res"].points.sub(this.cost())
                setBuyableAmount("res", 41, getBuyableAmount("res", 41).add(1))
            },
            buyMax() {
                getMax(player["res"].points.abs(), this.cost(), 1.0964)
                subCost(1.0964, getBuyableAmount("res", 41), 1)
                if (!hasChallenge("inf",22)) player["res"].points = player["res"].points.sub(new Decimal(sub))
                setBuyableAmount("res", 41, getBuyableAmount("res", 41).add(new Decimal(max)))
            },
            effect() { 
                eff = new Decimal(1)
                if (hasUpgrade("res",24)) eff = eff.mul(new Decimal(1.01).pow(getBuyableAmount("res", 41)))
                else eff = eff.add(new Decimal(0.01).mul(getBuyableAmount("res", 41)))
                return eff
            },
            style(){ 
                if (player["res"].points.gte(this.cost())) return {'background-color': '#63C5DA',"border-radius": "0px 0px 0px 15px", "width": "300px", "height": "120px"}
                else return {"border-radius": "0px 0px 0px 15px", "width": "300px", "height": "120px"}
            },
            unlocked() {
                return true
            }
        },
        42: {
            title() {return "'d' Variable Upgrade"},
            cost(x) { return new Decimal(1).mul(new Decimal(1.0964).pow(x))},
            display() { 
                if (hasUpgrade("res",25)) return "<b>x1.01</b> 'd' variable value <br> Currrently: <b>x" + format(tmp.res.buyables[42].effect) + " </b> <br> (bought:" + format(getBuyableAmount("res", 42)) + ")" + "<br> Cost: <b style='color:red;'>" + format(this.cost(getBuyableAmount("res", 42))) + " Knowledge"
                else return "<b>+1%</b> 'd' variable value <br> Currrently: <b>x" + format(tmp.res.buyables[42].effect) + " </b> <br> (bought:" + format(getBuyableAmount("res", 42)) + ")" + "<br> Cost: <b style='color:red;'>" + format(this.cost(getBuyableAmount("res", 42))) + " Knowledge"
            },
            canAfford() { return player["res"].points.gte(this.cost()) },
            buy() {
                if (!hasChallenge("inf",22)) player["res"].points = player["res"].points.sub(this.cost())
                setBuyableAmount("res", 42, getBuyableAmount("res", 42).add(1))
            },
            buyMax() {
                getMax(player["res"].points.abs(), this.cost(), 1.0964)
                subCost(1.0964, getBuyableAmount("res", 32), 1)
                if (!hasChallenge("inf",22)) player["res"].points = player["res"].points.sub(new Decimal(sub))
                setBuyableAmount("res", 42, getBuyableAmount("res", 42).add(new Decimal(max)))
            },
            effect() { 
                eff = new Decimal(1)
                if (hasUpgrade("res",25)) eff = eff.mul(new Decimal(1.01).pow(getBuyableAmount("res", 42)))
                else eff = eff.add(new Decimal(0.01).mul(getBuyableAmount("res", 42)))
                return eff
            },
            style(){ 
                if (player["res"].points.gte(this.cost())) return {'background-color': '#63C5DA',"border-radius": "0px 0px 15px 0px", "width": "300px", "height": "120px"}
                else return {"border-radius": "0px 0px 15px 0px", "width": "300px", "height": "120px"}
            },
            unlocked() {
                return true
            }
        },
    },
    upgrades: {
        11: {
            title: "Res-Upgrade 1.1",
            description: "<b>x3</b> gained Knowledge",
            cost: new Decimal(10),
            currencyDisplayName: "Knowledge",
            currencyInternalName: "points",
            currencyLayer: "res",
            effect() {
                eff = new Decimal(1)
                eff = eff.mul(3)
                return eff
            },
            style(){ 
                if (tmp["res"].clickables[31].unlocked) return {"border-radius": "0px 0px 0px 0px",'width': '120px', 'height': '135px'}
                else if (tmp["res"].upgrades[21].unlocked) return {"border-radius": "15px 0px 0px 0px",'width': '120px', 'height': '135px'}
                else return {"border-radius": "15px 0px 0px 15px", "width": "120px", "height": "135px"}
            },
            unlocked() {return hasUpgrade("u",21)},
        },
        12: {
            title: "Res-Upgrade 1.2",
            description: "<b>x1.5</b> gained Knowledge every Res-Upgrade bought",
            cost: new Decimal(80),
            currencyDisplayName: "Knowledge",
            currencyInternalName: "points",
            currencyLayer: "res",
            effect() {
                eff = new Decimal(1)
                if (hasUpgrade("res",11)) eff = eff.mul(1.5)
                if (hasUpgrade("res",12)) eff = eff.mul(1.5)
                if (hasUpgrade("res",13)) eff = eff.mul(1.5)
                if (hasUpgrade("res",14)) eff = eff.mul(1.5)
                if (hasUpgrade("res",15)) eff = eff.mul(1.5)
                return eff
            },
            effectDisplay() {
                return "<b>x" + format(upgradeEffect("res", 12))
            },
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "120px", "height": "135px"}
            },
            unlocked() {return hasUpgrade("u",21)},
        },
        13: {
            title: "Res-Upgrade 1.3",
            description: "<b>x1.01</b> gained Knowledge every 'a, b, c, & d' Variable bought divided by 2 <br> Max = x32",
            cost: new Decimal(640),
            currencyDisplayName: "Knowledge",
            currencyInternalName: "points",
            currencyLayer: "res",
            effect() {
                eff = new Decimal(1)
                eff = eff.mul(new Decimal(1.01).pow(getBuyableAmount("f",11).add(getBuyableAmount("f",21)).add(getBuyableAmount("f",31)).add(getBuyableAmount("f",41)).div(2)))
                if (eff.gte(32)) eff = new Decimal(32)
                return eff
            },
            effectDisplay() {
                return "<b>x" + format(upgradeEffect("res", 13))
            },
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "120px", "height": "135px"}
            },
            unlocked() {return hasUpgrade("u",21)},
        },
        14: {
            title: "Res-Upgrade 1.4",
            description: "<b>x1.01</b> gained Knowledge every Variable Upgrades bought divided by 2 <br> Max = x32",
            cost: new Decimal(5120),
            currencyDisplayName: "Knowledge",
            currencyInternalName: "points",
            currencyLayer: "res",
            effect() {
                eff = new Decimal(1)
                eff = eff.mul(new Decimal(1.01).pow(getBuyableAmount("res",21).add(getBuyableAmount("res",31)).add(getBuyableAmount("res",32)).add(getBuyableAmount("res",41)).add(getBuyableAmount("res",42)).div(2)))
                if (eff.gte(32)) eff = new Decimal(32)
                return eff
            },
            effectDisplay() {
                return "<b>x" + format(upgradeEffect("res", 14))
            },
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "120px", "height": "135px"}
            },
            unlocked() {return hasUpgrade("u",21)},
        },
        15: {
            title: "Res-Upgrade 1.5",
            description: "<b>Unlock</b> Time Machine",
            cost: new Decimal(40960),
            currencyDisplayName: "Knowledge",
            currencyInternalName: "points",
            currencyLayer: "res",
            style(){ 
                if (tmp["res"].clickables[31].unlocked) return {"border-radius": "0px 0px 0px 0px",'width': '120px', 'height': '135px'}
                else if (tmp["res"].upgrades[25].unlocked) return {"border-radius": "0px 15px 0px 0px",'width': '120px', 'height': '135px'}
                else return {"border-radius": "0px 15px 15px 0px", "width": "120px", "height": "135px"}
            },
            unlocked() {return hasUpgrade("u",21)},
        },
        21: {
            title: "Res-Upgrade 2.1",
            description: "<b>Enhance</b> the base of 'U' Variable Upgrade (x2 -> x2.5)",
            cost: new Decimal(1e14),
            currencyDisplayName: "Knowledge",
            currencyInternalName: "points",
            currencyLayer: "res",
            style(){ 
                return {"border-radius": "0px 0px 0px 15px", "width": "120px", "height": "135px"}
            },
            unlocked() {return hasUpgrade("pu",14)},
        },
        22: {
            title: "Res-Upgrade 2.2",
            description: "<b>Enhance</b> the effect of 'a' Variable Upgrade (+1% -> x1.01)",
            cost: new Decimal(1e15),
            currencyDisplayName: "Knowledge",
            currencyInternalName: "points",
            currencyLayer: "res",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "120px", "height": "135px"}
            },
            unlocked() {return hasUpgrade("pu",14)},
        },
        23: {
            title: "Res-Upgrade 2.3",
            description: "<b>Enhance</b> the effect of 'b' Variable Upgrade (+1% -> x1.01)",
            cost: new Decimal(1e16),
            currencyDisplayName: "Knowledge",
            currencyInternalName: "points",
            currencyLayer: "res",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "120px", "height": "135px"}
            },
            unlocked() {return hasUpgrade("pu",14)},
        },
        24: {
            title: "Res-Upgrade 2.4",
            description: "<b>Enhance</b> the effect of 'c' Variable Upgrade (+1% -> x1.01)",
            cost: new Decimal(1e17),
            currencyDisplayName: "Knowledge",
            currencyInternalName: "points",
            currencyLayer: "res",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "120px", "height": "135px"}
            },
            unlocked() {return hasUpgrade("pu",14)},
        },
        25: {
            title: "Res-Upgrade 2.5",
            description: "<b>Enhance</b> the effect of 'd' Variable Upgrade (+1% -> x1.01)",
            cost: new Decimal(1e18),
            currencyDisplayName: "Knowledge",
            currencyInternalName: "points",
            currencyLayer: "res",
            style(){ 
                return {"border-radius": "0px 0px 15px 0px", "width": "120px", "height": "135px"}
            },
            unlocked() {return hasUpgrade("pu",14)},
        },
    },
    automate() {
        if (getClickableState("auto", 1301) == true) {
            (auto2() && getClickableState("auto", 1311) ? buyMaxBuyable("res", 11) : false),
            (auto2() && getClickableState("auto", 1312) ? buyMaxBuyable("res", 12) : false)
        }
        else if (getClickableState("auto", 1301) == false) {
            (auto2() && getClickableState("auto", 1311) ? buyBuyable("res", 11) : false),
            (auto2() && getClickableState("auto", 1312) ? buyBuyable("res", 12) : false)
        }
        if (getClickableState("auto", 1302) == true) {
            (auto3() && getClickableState("auto", 1321) ? buyMaxBuyable("res", 21) : false),
            (auto3() && getClickableState("auto", 1322) ? buyMaxBuyable("res", 22) : false),
            (auto3() && getClickableState("auto", 1331) ? buyMaxBuyable("res", 31) : false),
            (auto3() && getClickableState("auto", 1332) ? buyMaxBuyable("res", 32) : false),
            (auto3() && getClickableState("auto", 1341) ? buyMaxBuyable("res", 41) : false),
            (auto3() && getClickableState("auto", 1342) ? buyMaxBuyable("res", 42) : false)
        }
        else if (getClickableState("auto", 1302) == false) {
            (auto3() && getClickableState("auto", 1321) ? buyBuyable("res", 21) : false),
            (auto3() && getClickableState("auto", 1322) ? buyBuyable("res", 22) : false),
            (auto3() && getClickableState("auto", 1331) ? buyBuyable("res", 31) : false),
            (auto3() && getClickableState("auto", 1332) ? buyBuyable("res", 32) : false),
            (auto3() && getClickableState("auto", 1341) ? buyBuyable("res", 41) : false),
            (auto3() && getClickableState("auto", 1342) ? buyBuyable("res", 42) : false)
        }
    },
    update(diff) {

    },
    getResetGain() {
        gain = new Decimal(0)
        gain = gain.add(buyableEffect("res",11))
        gain = gain.mul(buyableEffect("res",12))
        gain = gain.mul(tmp.res.gainMult)
        gain = gain.pow(tmp.res.gainExp)
        return gain
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("res", 11)) mult = mult.mul(tmp.res.upgrades[11].effect)
        if (hasUpgrade("res", 12)) mult = mult.mul(tmp.res.upgrades[12].effect)
        if (hasUpgrade("res", 13)) mult = mult.mul(tmp.res.upgrades[13].effect)
        if (hasUpgrade("res", 14)) mult = mult.mul(tmp.res.upgrades[14].effect)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
    exponent: 1, 
    position: 4, 
    row: 0,
    displayRow: 1,
    branches: ["f"],
    layerShown(){return hasUpgrade("u",14) || hasAchievement("A", 31)}, 
    doReset(resettingLayer) {
        let keep=[];
        if (layers[resettingLayer].row > this.row) {layerDataReset("res", keep);
        if (hasUpgrade("fd",13)) player[this.layer].upgrades = player[this.layer].upgrades.concat([11,12,13,14,15]);
        if (hasUpgrade("fd",13)) player[this.layer].upgrades = player[this.layer].upgrades.concat([21,22,23,24,25]);
        if (hasAchievement("A", 31)) player[this.layer].upgrades = player[this.layer].upgrades.concat([15]);
        }
    },
})

function resbuy11cm() {
    cm = new Decimal(1.5)
    if (hasUpgrade("st",32)) cm = new Decimal(1.4)
    return cm
}

function resbuy12cm() {
    cm = new Decimal(1.5)
    if (hasUpgrade("st",32)) cm = new Decimal(1.4)
    return cm
}

function resbuy12base() {
    base = new Decimal(1.05)
    if (hasUpgrade("st",42)) base = base.add(0.01)
    return base
}
