addLayer("f", {
    name: "f",
    symbol: "f",
    position: 2,  
    tabFormat: {
        "Function 'f'": {
            content:[
                ["display-text", function() { return "f(t) = <h2><b style='color:#63C5DA;text-shadow:0px 0px 10px'>" + format(player["f"].points) + "</b></h2>" },],
                ["display-text", function() { return "Δf / Second = <h2><b style='color:#63C5DA;text-shadow:0px 0px 10px'>" + format(getResetGain("f")) + "</b></h2>" },],
                "blank",
                ["display-text", function() {
                    if (player["f"].best.gte(10000)) return "<b>f(t+"+ getPointGen() + ") = f(t) + ab·U</b>"
                    else return "<b>f(t+"+ getPointGen() + ") = f(t) + ab</b>"
                },],
                "blank",
                ["display-text", function() {
                    if (player["f"].best.gte(10000)) return "Modify Function II | Req: ∅"
                    else return "Modify Function I | Req: <b style='color:#63C5DA'>f(t) = 10,000</b>"
                },],
                "blank",
                "buyables",
                "blank",
            ],
        },
    },
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#63C5DA", 
    nodeStyle() {
        var style = {"margin": "15px", "background": "#63C5DA", "background-origin": "border-box"}
        if (options.nodeStyle) style["border-radius"] = "15px 15px 15px 15px";
        return style
    },
    requires: new Decimal(0),
    resource: "f(t)",
    baseResource: "time",
    baseAmount() {return player.points}, 
    passiveGeneration() { return true },
    type: "normal", 
    exponent: 1, 
        buyables: {
        11: {
            title() {return "'a' Variable"},
            cost(x) {
                if (getBuyableAmount("f", 11).lte(0)) return new Decimal(0)
                else return new Decimal(10).mul(new Decimal(1.5).pow(x-1)).div(buyableEffect("res", 102))
            },
            display() { return "Increase the value of 'a' Variable <br> <b>x2</b> every 10 bought <br> <b> a = " + format(tmp.f.buyables[11].effect) + " </b> <br> (bought:" + format(getBuyableAmount("f", 11)) + ")" + "<br> Cost: <b style='color:red;'> f(t) = " + format(this.cost(getBuyableAmount("f", 11)))},
            canAfford() { return player["f"].points.gte(this.cost()) },
            buy() {
                player["f"].points = player["f"].points.sub(this.cost())
                setBuyableAmount("f", 11, getBuyableAmount("f", 11).add(1))
            },
            effect() { 
                eff = new Decimal(0)
                eff = eff.add(getBuyableAmount("f", 11))
                eff = eff.mul(new Decimal(2).pow(getBuyableAmount("f", 11).div(10).floor()))
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
            title() {return "'b' Variable"},
            cost(x) {
                return new Decimal(100).mul(new Decimal(10).pow(x))
            },
            display() { return "<b>x" + format(new Decimal(2).add(buyableEffect("res",104))) + "</b> the value of 'b' Variable <br> <b> b = " + format(tmp.f.buyables[21].effect) + " </b> <br> (bought:" + format(getBuyableAmount("f", 21)) + ")" + "<br> Cost: <b style='color:red;'> f(t) = " + format(this.cost(getBuyableAmount("f", 21)))},
            canAfford() { return player["f"].points.gte(this.cost()) },
            buy() {
                player["f"].points = player["f"].points.sub(this.cost())
                setBuyableAmount("f", 21, getBuyableAmount("f", 21).add(1))
            },
            effect() { 
                eff = new Decimal(1)
                eff = eff.mul(new Decimal(2).add(buyableEffect("res", 104)).pow(getBuyableAmount("f", 21)))
                return eff
            },
            style(){ 
                return {"border-radius": "15px 15px 15px 15px", "width": "480px", "height": "100px"}
            },
            unlocked() {
                return true
            }
        },
    },
    getResetGain() {
        gain = new Decimal(0)
        gain = gain.add(buyableEffect("f",11))
        gain = gain.mul(buyableEffect("f",21))
        gain = gain.mul(player["u"].points)
        gain = gain.mul(tmp.f.gainMult)
        gain = gain.pow(tmp.f.gainExp)
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
    layerShown(){return true}
})
