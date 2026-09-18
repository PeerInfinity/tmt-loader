addLayer("res", {
    name: "Research",
    symbol: "R",
    position: 4,  
    tabFormat: {
        "Research": {
            content:[
                ["display-text", function() { return "κ = <h2><b style='color:#234F1E;text-shadow:0px 0px 10px'>" + format(player["res"].points) + "</b></h2>" },],
                ["display-text", function() { return "Δκ / Second = <h2><b style='color:#234F1E;text-shadow:0px 0px 10px'>" + format(getResetGain("res")) + "</b></h2>" },],
                ["display-text", function() { return "f(t) = <h2><b style='color:#63C5DA;text-shadow:0px 0px 10px'>" + format(player["f"].points) + "</b></h2>" },],
                "blank",
                ["display-text", function() {
                    return "<b>Δκ = κ₁κ₂</b>"
                },],
                "blank",
                ["buyable", 11],
                ["buyable", 21],
                "blank",
                ["row", [["buyable", 101], ["buyable", 102], ["buyable", 103], ["buyable", 104], ["upgrade", 105]]],
            ],
        },
        "Library": {
        },
    },
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#234F1E", 
    nodeStyle() {
        var style = {"margin": "15px", "background": "#234F1E", "background-origin": "border-box"}
        if (options.nodeStyle) style["border-radius"] = "15px 15px 15px 15px";
        return style
    },
    requires: new Decimal(0),
    resource: "κ",
    baseResource: "f(t)",
    baseAmount() {return player["f"].points}, 
    passiveGeneration() { return true },
    type: "normal", 
    exponent: 1, 
    buyables: {
        11: {
            title() {return "'κ₁' Variable"},
            cost(x) {
                return new Decimal(1e8).mul(new Decimal(1.5).pow(x))
            },
            display() { return "Increase the value of 'κ₁' Variable <br> <b>x2</b> every 10 bought <br> <b> κ₁ = " + format(tmp.res.buyables[11].effect) + " </b> <br> (bought:" + format(getBuyableAmount("res", 11)) + ")" + "<br> Cost: <b style='color:red;'> f(t) = " + format(this.cost(getBuyableAmount("res", 11)))},
            canAfford() { return player["f"].points.gte(this.cost()) },
            buy() {
                player["f"].points = player["f"].points.sub(this.cost())
                setBuyableAmount("res", 11, getBuyableAmount("res", 11).add(1))
            },
            effect() { 
                eff = new Decimal(0)
                eff = eff.add(getBuyableAmount("res", 11))
                eff = eff.mul(new Decimal(2).pow(getBuyableAmount("res", 11).div(10).floor()))
                return eff
            },
            style(){ 
                return {"border-radius": "15px 15px 15px 15px", "width": "480px", "height": "100px"}
            },
            unlocked() {
                return true
            }
        },
        21: {
            title() {return "'κ₂' Variable"},
            cost(x) {
                return new Decimal(1e8).mul(new Decimal(2).pow(x))
            },
            display() { return "<b>x1.1</b> the value of 'κ₂' Variable <br> <b> κ₂ = " + format(tmp.res.buyables[21].effect) + " </b> <br> (bought:" + format(getBuyableAmount("res", 21)) + ")" + "<br> Cost: <b style='color:red;'> f(t) = " + format(this.cost(getBuyableAmount("res", 21)))},
            canAfford() { return player["f"].points.gte(this.cost()) },
            buy() {
                player["f"].points = player["f"].points.sub(this.cost())
                setBuyableAmount("res", 21, getBuyableAmount("res", 21).add(1))
            },
            effect() { 
                eff = new Decimal(1)
                eff = eff.mul(new Decimal(1.1).pow(getBuyableAmount("res", 21)))
                return eff
            },
            style(){ 
                return {"border-radius": "15px 15px 15px 15px", "width": "480px", "height": "100px"}
            },
            unlocked() {
                return true
            }
        },
        101: {
            title() {return "Enhance 'U₁'"},
            cost(x) {
                return new Decimal(10).mul(new Decimal(10).pow(x))
            },
            display() { return "<b>x2</b> 'U₁' value <br> <b> x" + format(tmp.res.buyables[101].effect) + " U₁</b> <br> (bought:" + format(getBuyableAmount("res", 101)) + ")" + "<br> Cost: <br><b style='color:red;'> κ = " + format(this.cost(getBuyableAmount("res", 101)))},
            canAfford() { return player["res"].points.gte(this.cost()) },
            buy() {
                player["res"].points = player["res"].points.sub(this.cost())
                setBuyableAmount("res", 101, getBuyableAmount("res", 101).add(1))
            },
            effect() { 
                eff = new Decimal(1)
                eff = eff.mul(2).pow(getBuyableAmount("res", 101))
                return eff
            },
            style(){ 
                return {"border-radius": "15px 15px 15px 15px", "width": "120px", "height": "135px"}
            },
            unlocked() {
                return true
            }
        },
        102: {
            title() {return "Cheaper 'a'"},
            cost(x) {
                return new Decimal(256).mul(new Decimal(4).pow(x))
            },
            display() { return "<b>/3</b> cost of 'a' <br> <b> /" + format(tmp.res.buyables[102].effect) + " cost of 'a'</b> <br> (bought:" + format(getBuyableAmount("res", 102)) + ")" + "<br> Cost: <br><b style='color:red;'> κ = " + format(this.cost(getBuyableAmount("res", 102)))},
            canAfford() { return player["res"].points.gte(this.cost()) },
            buy() {
                player["res"].points = player["res"].points.sub(this.cost())
                setBuyableAmount("res", 102, getBuyableAmount("res", 102).add(1))
            },
            effect() { 
                eff = new Decimal(1)
                eff = eff.mul(3).pow(getBuyableAmount("res", 102))
                return eff
            },
            style(){ 
                return {"border-radius": "15px 15px 15px 15px", "width": "120px", "height": "135px"}
            },
            unlocked() {
                return true
            }
        },
        103: {
            title() {return "'U₂' Base"},
            cost(x) {
                return new Decimal(512).mul(new Decimal(8).pow(x))
            },
            display() { return "<b>+0.25</b> to 'U₂' base <br> <b> +" + format(tmp.res.buyables[103].effect) + " 'U₂' base</b> <br> (bought:" + format(getBuyableAmount("res", 103)) + ")" + "<br> Cost: <br><b style='color:red;'> κ = " + format(this.cost(getBuyableAmount("res", 103)))},
            canAfford() { return player["res"].points.gte(this.cost()) },
            buy() {
                player["res"].points = player["res"].points.sub(this.cost())
                setBuyableAmount("res", 103, getBuyableAmount("res", 103).add(1))
            },
            effect() { 
                eff = new Decimal(0)
                eff = eff.add(0.25).mul(getBuyableAmount("res", 103))
                return eff
            },
            style(){ 
                return {"border-radius": "15px 15px 15px 15px", "width": "120px", "height": "135px"}
            },
            unlocked() {
                return true
            }
        },
        104: {
            title() {return "'b' Base"},
            cost(x) {
                if (getBuyableAmount("res", 104).lte(0)) return new Decimal(10000)
                else return new Decimal(10000).mul(new Decimal(100).pow(new Decimal(x).pow(x)))
            },
            display() { return "<b>+0.2</b> to 'b' base <br> <b> +" + format(tmp.res.buyables[104].effect) + " 'b' base</b> <br> (bought:" + format(getBuyableAmount("res", 104)) + ")" + "<br> Cost: <br><b style='color:red;'> κ = " + format(this.cost(getBuyableAmount("res", 104)))},
            canAfford() { return player["res"].points.gte(this.cost()) },
            buy() {
                player["res"].points = player["res"].points.sub(this.cost())
                setBuyableAmount("res", 104, getBuyableAmount("res", 104).add(1))
            },
            effect() { 
                eff = new Decimal(0)
                eff = eff.add(0.2).mul(getBuyableAmount("res", 104))
                return eff
            },
            style(){ 
                return {"border-radius": "15px 15px 15px 15px", "width": "120px", "height": "135px"}
            },
            unlocked() {
                return true
            }
        },
    },
    upgrades: {
        105: {
            fullDisplay() {return "<h2>???</h2><br>Unlock <b>WIP: Current Endgame</b> <br> Cost: <br><b style='color:red;'> κ = " + format(new Decimal(33554432))},
            cost: new Decimal(33554432),
            currencyInternalName: "points",
            currencyLayer: "res",
            style(){ 
                return {"border-radius": "15px 15px 15px 15px", "width": "120px", "height": "135px"}
            },
        },
    },
    getResetGain() {
        gain = new Decimal(0)
        gain = gain.add(buyableEffect("res",11))
        gain = gain.mul(buyableEffect("res",21))
        gain = gain.mul(tmp.res.gainMult)
        gain = gain.pow(tmp.res.gainExp)
        return gain
    },
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() { 
        return new Decimal(1)
    },
    row: 0, 
    layerShown(){
        if (hasUpgrade("u",15)) return true
        else return false
    },
    branches: ["f"],
})
