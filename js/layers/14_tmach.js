addLayer("tm", {
    tabFormat: {
        "Time Machine": {
            content:[
                "main-display",
                ["display-text", function() { return "You Are Gaining <h2><b style='color:#D0B49F;'>" + format(getResetGain("tm")) + "</b></h2> Time Fragments Per Second" },],
                "blank",
                ["display-text", function() { return "You Have <h2><b style='color:#234F1E;'>" + format(player["res"].points) + "</b></h2> Knowledge" },],
                "blank",
                ["display-text", function() { return "<h3> Light Machines </h3>" },],
                ["clickable", 11],
                ["row", [["buyable", 11], ["buyable", 12]]],
                "blank",
                ["display-text", function() { return "<h3> Heavy Machines </h3>" },],
                ["clickable", 21],
                ["row", [["buyable", 21], ["buyable", 22]]],
                "blank",
            ],
        },
    },
    name: "Time Machine", 
    symbol: "TM",
    color: "#D0B49F", 
    nodeStyle() {
        var style = {"margin": "15px", "background": "#D0B49F", "background-origin": "border-box"}
        if (inChallenge("fd",11)) style["background"] = "radial-gradient(#D0B49F, #797EF6)";
        if (options.nodeStyle) style["border-radius"] = "15px 15px 15px 15px";
        return style
    },
    resource: "Time Fragments",
    baseResource: "Knowledge",
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
                buyMaxBuyable("tm", 11) & buyMaxBuyable("tm", 12)
            },
            onHold() {
                buyMaxBuyable("tm", 11) & buyMaxBuyable("tm", 12)
            },
            style() {
                return {"border-radius": "15px 15px 0px 0px", "width": "540px", "min-height": "40px"}
            },
            unlocked() {return hasAchievement("A", 44)}
        },
        21: {
            display() {return "<h2>Buy Max"},
            canClick() {return true},
            onClick() {
                buyMaxBuyable("tm", 21) & buyMaxBuyable("tm", 22)
            },
            onHold() {
                buyMaxBuyable("tm", 21) & buyMaxBuyable("tm", 22)
            },
            style() {
                return {"border-radius": "15px 15px 0px 0px", "width": "540px", "min-height": "40px"}
            },
            unlocked() {return hasUpgrade("p", 23)}
        },
    },
    buyables: {
        11: {
            title() {return "Time Fragments Generator"},
            cost(x) { return new Decimal(40960).mul(new Decimal(tmbuy11cm()).pow(x))},
            display() { 
                if (hasMilestone("inf",3)) return "Increase Time Machine Fragments gained <br> Currently:<b> +" + format(tmp.tm.buyables[11].effect) + " </b> <br> (bought:" + format(getBuyableAmount("tm", 11)) + " + " + format(player["inf"].ms3amt) + ")" + "<br> Cost: <b style='color:red;'>" + format(this.cost(getBuyableAmount("tm", 11))) + " Knowledge"
                else return "Increase Time Machine Fragments gained <br> Currently:<b> +" + format(tmp.tm.buyables[11].effect) + " </b> <br> (bought:" + format(getBuyableAmount("tm", 11)) + ")" + "<br> Cost: <b style='color:red;'>" + format(this.cost(getBuyableAmount("tm", 11))) + " Knowledge"
            },
            canAfford() { return player["res"].points.gte(this.cost()) },
            buy() {
                if (!hasChallenge("inf",31)) player["res"].points = player["res"].points.sub(this.cost())
                setBuyableAmount("tm", 11, getBuyableAmount("tm", 11).add(1))
            },
            buyMax() {
                getMax(player["res"].points.abs(), this.cost(), tmbuy11cm())
                subCost(tmbuy11cm(), getBuyableAmount("tm", 11), 40960)
                if (!hasChallenge("inf",31)) player["res"].points = player["res"].points.sub(new Decimal(sub))
                setBuyableAmount("tm", 11, getBuyableAmount("tm", 11).add(new Decimal(max)))
            },
            effect() { 
                eff = new Decimal(0)
                eff = eff.add(getBuyableAmount("tm",11))
                if (hasMilestone("inf",3)) eff = eff.add(player["inf"].ms3amt)
                eff = eff.pow(new Decimal(2).add(buyableEffect("tm",21)))
                return eff
            },
            style(){ 
                if (tmp["tm"].clickables[11].unlocked) return {"border-radius": "0px 0px 0px 15px", "width": "270px", "height": "180px"}
                else return {"border-radius": "15px 0px 0px 15px", "width": "270px", "height": "180px"}
            },
            unlocked() {
                return true
            }
        },
        12: {
            title() {return "Warp Time"},
            cost(x) { return new Decimal(1).mul(new Decimal(tmbuy12cm()).pow(x))},
            display() { 
                if (hasMilestone("inf",1)) return "Speed up time <br> Currently: <b>+" + format(tmp.tm.buyables[12].effect) + " </b> <br> (bought:" + format(getBuyableAmount("tm", 12)) + " + " + format(player["inf"].ms1amt) + ")" + "<br> Cost: <b style='color:red;'>" + format(this.cost(getBuyableAmount("tm", 12))) + " Time Fragments"
                else return "Speed up time <br> Currently: <b>+" + format(tmp.tm.buyables[12].effect) + " </b> <br> (bought:" + format(getBuyableAmount("tm", 12)) + ")" + "<br> Cost: <b style='color:red;'>" + format(this.cost(getBuyableAmount("tm", 12))) + " Time Fragments"
            },
            canAfford() { return player["tm"].points.gte(this.cost()) },
            buy() {
                if (!hasChallenge("inf",31)) player["tm"].points = player["tm"].points.sub(this.cost())
                setBuyableAmount("tm", 12, getBuyableAmount("tm", 12).add(1))
            },
            buyMax() {
                getMax(player["tm"].points.abs(), this.cost(), tmbuy12cm())
                subCost(tmbuy12cm(), getBuyableAmount("tm", 12), 1)
                if (!hasChallenge("inf",31)) player["tm"].points = player["tm"].points.sub(new Decimal(sub))
                setBuyableAmount("tm", 12, getBuyableAmount("tm", 12).add(new Decimal(max)))
            },
            effect() { 
                eff = new Decimal(0)
                eff = eff.add(getBuyableAmount("tm", 12))
                if (hasMilestone("inf",1)) eff = eff.add(player["inf"].ms1amt)
                eff = eff.pow(new Decimal(1).add(buyableEffect("tm",22)))
                return eff
            },
            style(){ 
                if (tmp["tm"].clickables[11].unlocked) return {"border-radius": "0px 0px 15px 0px", "width": "270px", "height": "180px"}
                else return {"border-radius": "0px 15px 15px 0px", "width": "270px", "height": "180px"}
            },
            unlocked() {
                return true
            }
        },
        21: {
            title() {return "T.F.G.E."},
            cost(x) { return new Decimal(5).add(new Decimal(tmbuy21cm()).mul(x))},
            display() { 
                if (hasUpgrade("p",22) && player["fd"].unlocked && buyableEffect("tm",21).gte(128)) return "Enhance <b>Time Fragments Generator</b> so you gain more Time Fragments <b style='color:red;'>Softcapped</b> <br> Currently: <b>^(2 + " + format(tmp.tm.buyables[21].effect) + ") </b> <br> (bought:" + format(getBuyableAmount("tm", 21)) + " + " + format(buyableEffect("fd", 11)) + ")" + "<br> Req: <b style='color:red;'> " + format(this.cost(getBuyableAmount("tm", 21))) + " Time Fragments Generator"
                else if (player["fd"].unlocked && buyableEffect("tm",21).gte(128)) return "Enhance <b>Time Fragments Generator</b> so you gain more Time Fragments <b style='color:red;'>Softcapped</b> <br> Currently: <b>^(2 + " + format(tmp.tm.buyables[21].effect) + ") </b> <br> (bought:" + format(getBuyableAmount("tm", 21)) + " + " + format(buyableEffect("fd", 11)) + ")" + "<br><b>Warning: Resets f(t), Knowledge, Time Fragments, Time Fragment Generator, and Warp Time</b><br> Req: <b style='color:red;'> " + format(this.cost(getBuyableAmount("tm", 21))) + " Time Fragments Generator"
                else if (hasUpgrade("p",22) && buyableEffect("tm",21).gte(128)) return "Enhance <b>Time Fragments Generator</b> so you gain more Time Fragments <b style='color:red;'>Softcapped</b> <br> Currently: <b>^(2 + " + format(tmp.tm.buyables[21].effect) + ") </b> <br> (bought:" + format(getBuyableAmount("tm", 21)) + ")" + "<br> Req: <b style='color:red;'> " + format(this.cost(getBuyableAmount("tm", 21))) + " Time Fragments Generator"
                else if (buyableEffect("tm",21).gte(128)) return "Enhance <b>Time Fragments Generator</b> so you gain more Time Fragments <b style='color:red;'>Softcapped</b> <br> Currently: <b>^(2 + " + format(tmp.tm.buyables[21].effect) + ") </b> <br> (bought:" + format(getBuyableAmount("tm", 21)) + ")" + "<br><b>Warning: Resets f(t), Knowledge, Time Fragments, Time Fragment Generator, and Warp Time</b><br> Req: <b style='color:red;'> " + format(this.cost(getBuyableAmount("tm", 21))) + " Time Fragments Generator"
                else if (hasUpgrade("p",22) && player["fd"].unlocked) return "Enhance <b>Time Fragments Generator</b> so you gain more Time Fragments <br> Currently: <b>^(2 + " + format(tmp.tm.buyables[21].effect) + ") </b> <br> (bought:" + format(getBuyableAmount("tm", 21)) + " + " + format(buyableEffect("fd", 11)) + ")" + "<br> Req: <b style='color:red;'> " + format(this.cost(getBuyableAmount("tm", 21))) + " Time Fragments Generator"
                else if (player["fd"].unlocked) return "Enhance <b>Time Fragments Generator</b> so you gain more Time Fragments <br> Currently: <b>^(2 + " + format(tmp.tm.buyables[21].effect) + ") </b> <br> (bought:" + format(getBuyableAmount("tm", 21)) + " + " + format(buyableEffect("fd", 11)) + ")" + "<br><b>Warning: Resets f(t), Knowledge, Time Fragments, Time Fragment Generator, and Warp Time</b><br> Req: <b style='color:red;'> " + format(this.cost(getBuyableAmount("tm", 21))) + " Time Fragments Generator"
                else if (hasUpgrade("p",22)) return "Enhance <b>Time Fragments Generator</b> so you gain more Time Fragments <br> Currently: <b>^(2 + " + format(tmp.tm.buyables[21].effect) + ") </b> <br> (bought:" + format(getBuyableAmount("tm", 21)) + ")" + "<br> Req: <b style='color:red;'> " + format(this.cost(getBuyableAmount("tm", 21))) + " Time Fragments Generator"
                else return "Enhance <b>Time Fragments Generator</b> so you gain more Time Fragments <br> Currently: <b>^(2 + " + format(tmp.tm.buyables[21].effect) + ") </b> <br> (bought:" + format(getBuyableAmount("tm", 21)) + ")" + "<br><b>Warning: Resets f(t), Knowledge, Time Fragments, Time Fragment Generator, and Warp Time</b><br> Req: <b style='color:red;'> " + format(this.cost(getBuyableAmount("tm", 21))) + " Time Fragments Generator"
            },
            canAfford() { return getBuyableAmount("tm", 11).gte(this.cost()) },
            buy() {
                setBuyableAmount("tm", 21, getBuyableAmount("tm", 21).add(1))
                if (!hasUpgrade("p",22)) {
                    player["f"].points = player["f"].points.pow(0).add(1)
                    player["res"].points = player["res"].points.mul(0)
                    player["tm"].points = player["tm"].points.mul(0)
                    setBuyableAmount("tm", 11, getBuyableAmount("tm", 11).mul(0))
                    setBuyableAmount("tm", 12, getBuyableAmount("tm", 12).mul(0))
                }
            },
            buyMax() {
                max = new Decimal(0)
                max = max.add((Decimal.floor(getBuyableAmount("tm", 11).sub(this.cost()).div(tmbuy21cm()))).add(1))
                setBuyableAmount("tm", 21, getBuyableAmount("tm", 21).add(max))
                if (!hasUpgrade("p",22)) {
                    player["f"].points = player["f"].points.pow(0).add(1)
                    player["res"].points = player["res"].points.mul(0)
                    player["tm"].points = player["tm"].points.mul(0)
                    setBuyableAmount("tm", 11, getBuyableAmount("tm", 11).mul(0))
                    setBuyableAmount("tm", 12, getBuyableAmount("tm", 12).mul(0))
                }
            },
            effect() { 
                pow = new Decimal(0.85)
                if (hasUpgrade("p",14)) pow = new Decimal(0.88)
                if (hasUpgrade("fd",12)) pow = new Decimal(0.90)
                if (hasUpgrade("st",43)) pow = new Decimal(0.95)
                
                amt = new Decimal(0)
                amt = amt.add(getBuyableAmount("tm", 21))
                amt = amt.add(buyableEffect("fd", 11))

                eff = new Decimal(0)
                eff = eff.add(amt.pow(pow))
                if (eff.gte(128)) {
                    eff = new Decimal(128)
                    eff = eff.add(amt.pow(pow).sub(127).pow(0.85).sub(1))
                }
                return eff
            },
            style(){ 
                if (tmp["tm"].clickables[21].unlocked) return {"border-radius": "0px 0px 0px 15px", "width": "270px", "height": "180px"}
                else return {"border-radius": "15px 0px 0px 15px", "width": "270px", "height": "180px"}
            },
            unlocked() {
                return true
            }
        },
        22: {
            title() {return "Warp Warp Time"},
            cost(x) { return new Decimal(5).add(new Decimal(tmbuy22cm()).mul(x))},
            display() { 
                if (buyableEffect("tm",22).gte(32) && hasUpgrade("p",22) && player["fd"].unlocked) return "Warp the <b>Warp Time</b> so you gain more time <b style='color:red;'>Softcapped</b> <br> Currently: <b>^(1 + " + format(tmp.tm.buyables[22].effect) + ") </b> <br> (bought:" + format(getBuyableAmount("tm", 22)) + " + " + format(buyableEffect("fd", 12)) + ")" + "<br> Req: <b style='color:red;'> " + format(this.cost(getBuyableAmount("tm", 22))) + " Warp Time"
                else if (buyableEffect("tm",22).gte(32) && player["fd"].unlocked) return "Warp the <b>Warp Time</b> so you gain more time <b style='color:red;'>Softcapped</b> <br> Currently: <b>^(1 + " + format(tmp.tm.buyables[22].effect) + ") </b> <br> (bought:" + format(getBuyableAmount("tm", 22)) + " + " + format(buyableEffect("fd", 12)) + ")" + "<br><b>Warning: Resets f(t), Knowledge, Time Fragments, Time Fragment Generator, and Warp Time</b><br> Req: <b style='color:red;'> " + format(this.cost(getBuyableAmount("tm", 22))) + " Warp Time"
                else if (hasUpgrade("p",22) && player["fd"].unlocked) return "Warp the <b>Warp Time</b> so you gain more time <br> Currently: <b>^(1 + " + format(tmp.tm.buyables[22].effect) + ") </b> <br> (bought:" + format(getBuyableAmount("tm", 22)) + " + " + format(buyableEffect("fd", 12)) + ")" + "<br> Req: <b style='color:red;'> " + format(this.cost(getBuyableAmount("tm", 22))) + " Warp Time"
                else if (player["fd"].unlocked) return "Warp the <b>Warp Time</b> so you gain more time <br> Currently: <b>^(1 + " + format(tmp.tm.buyables[22].effect) + ") </b> <br> (bought:" + format(getBuyableAmount("tm", 22)) + " + " + format(buyableEffect("fd", 12)) + ")" + "<br><b>Warning: Resets f(t), Knowledge, Time Fragments, Time Fragment Generator, and Warp Time</b><br> Req: <b style='color:red;'> " + format(this.cost(getBuyableAmount("tm", 22))) + " Warp Time"
                else if (buyableEffect("tm",22).gte(32) && hasUpgrade("p",22)) return "Warp the <b>Warp Time</b> so you gain more time <b style='color:red;'>Softcapped</b> <br> Currently: <b>^(1 + " + format(tmp.tm.buyables[22].effect) + ") </b> <br> (bought:" + format(getBuyableAmount("tm", 22)) + ")" + "<br> Req: <b style='color:red;'> " + format(this.cost(getBuyableAmount("tm", 22))) + " Warp Time"
                else if (buyableEffect("tm",22).gte(32)) return "Warp the <b>Warp Time</b> so you gain more time <b style='color:red;'>Softcapped</b> <br> Currently: <b>^(1 + " + format(tmp.tm.buyables[22].effect) + ") </b> <br> (bought:" + format(getBuyableAmount("tm", 22)) + ")" + "<br><b>Warning: Resets f(t), Knowledge, Time Fragments, Time Fragment Generator, and Warp Time</b><br> Req: <b style='color:red;'> " + format(this.cost(getBuyableAmount("tm", 22))) + " Warp Time"
                else if (hasUpgrade("p",22)) return "Warp the <b>Warp Time</b> so you gain more time <br> Currently: <b>^(1 + " + format(tmp.tm.buyables[22].effect) + ") </b> <br> (bought:" + format(getBuyableAmount("tm", 22)) + ")" + "<br> Req: <b style='color:red;'> " + format(this.cost(getBuyableAmount("tm", 22))) + " Warp Time"
                else return "Warp the <b>Warp Time</b> so you gain more time <br> Currently: <b>^(1 + " + format(tmp.tm.buyables[22].effect) + ") </b> <br> (bought:" + format(getBuyableAmount("tm", 22)) + ")" + "<br><b>Warning: Resets f(t), Knowledge, Time Fragments, Time Fragment Generator, and Warp Time</b><br> Req: <b style='color:red;'> " + format(this.cost(getBuyableAmount("tm", 22))) + " Warp Time"
            },
            canAfford() { return getBuyableAmount("tm", 12).gte(this.cost()) },
            buy() {
                setBuyableAmount("tm", 22, getBuyableAmount("tm", 22).add(1))
                if (!hasUpgrade("p",22)) {
                    player["f"].points = player["f"].points.pow(0).add(1)
                    player["res"].points = player["res"].points.mul(0)
                    player["tm"].points = player["tm"].points.mul(0)
                    setBuyableAmount("tm", 11, getBuyableAmount("tm", 11).mul(0))
                    setBuyableAmount("tm", 12, getBuyableAmount("tm", 12).mul(0))
                }
            },
            buyMax() {
                max = new Decimal(0)
                max = max.add((Decimal.floor(getBuyableAmount("tm", 12).sub(this.cost()).div(tmbuy22cm()))).add(1))
                setBuyableAmount("tm", 22, getBuyableAmount("tm", 22).add(max))
                if (!hasUpgrade("p",22)) {
                    player["f"].points = player["f"].points.pow(0).add(1)
                    player["res"].points = player["res"].points.mul(0)
                    player["tm"].points = player["tm"].points.mul(0)
                    setBuyableAmount("tm", 11, getBuyableAmount("tm", 11).mul(0))
                    setBuyableAmount("tm", 12, getBuyableAmount("tm", 12).mul(0))
                }
            },
            effect() { 
                cap = new Decimal(0.75)
                if (hasUpgrade("fd",11)) cap = new Decimal(0.83)

                amt = new Decimal(0)
                amt = amt.add(getBuyableAmount("tm", 22))
                amt = amt.add(buyableEffect("fd", 12))

                eff = new Decimal(0)
                eff = eff.add(new Decimal(2/3).mul(amt))
                if (eff.gte(32)) {
                    eff = new Decimal(32)
                    eff = eff.add(new Decimal(2/3).mul(amt).sub(31).pow(cap).sub(1))
                }
                if (inChallenge("inf",31) || inChallenge("inf",32)) eff = eff.pow(0.925)
                return eff
            },
            style(){ 
                if (tmp["tm"].clickables[21].unlocked) return {"border-radius": "0px 0px 15px 0px", "width": "270px", "height": "180px"}
                else return {"border-radius": "0px 15px 15px 0px", "width": "270px", "height": "180px"}
            },
            unlocked() {
                return true
            }
        },
    },
    automate() {
        if (getClickableState("auto", 1401) == true) {
            (auto4() && getClickableState("auto", 1411) ? buyMaxBuyable("tm", 11) : false),
            (auto4() && getClickableState("auto", 1412) ? buyMaxBuyable("tm", 12) : false)
        }
        else if (getClickableState("auto", 1401) == false) {
            (auto4() && getClickableState("auto", 1411) ? buyBuyable("tm", 11) : false),
            (auto4() && getClickableState("auto", 1412) ? buyBuyable("tm", 12) : false)
        }
        if (getClickableState("auto", 1402) == true) {
            (auto5() && getClickableState("auto", 1421) ? buyMaxBuyable("tm", 21) : false),
            (auto5() && getClickableState("auto", 1422) ? buyMaxBuyable("tm", 22) : false)
        }
        else if (getClickableState("auto", 1402) == false) {
            (auto5() && getClickableState("auto", 1421) ? buyBuyable("tm", 21) : false),
            (auto5() && getClickableState("auto", 1422) ? buyBuyable("tm", 22) : false)
        }
    },
    update(diff) {

    },
    getResetGain() {
        gain = new Decimal(0)
        gain = gain.add(buyableEffect("tm",11))
        gain = gain.mul(tmp.tm.gainMult)
        gain = gain.pow(tmp.tm.gainExp)
        if (hasUpgrade("p",25)) gain = gain.mul(fdboost())
        return gain
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        if (inChallenge("fd",11)) exp = exp.mul(0.25)
        return exp
    },
    exponent: 1, 
    position: 5, 
    row: 0,
    displayRow: 1,
    branches: ["res"],
    layerShown(){return hasUpgrade("res",15) || hasAchievement("A", 41)},
})

function tmbuy11cm() {
    cm = new Decimal(2)
    if (hasUpgrade("pu",21)) cm = new Decimal(1.85)
    if (hasUpgrade("st",33)) cm = new Decimal(1.75)
    return cm
}

function tmbuy12cm() {
    cm = new Decimal(2)
    if (hasUpgrade("p",21)) cm = new Decimal(1.85)
    if (hasUpgrade("st",33)) cm = new Decimal(1.75)
    return cm
}

function tmbuy21cm() {
    cm = new Decimal(5)
    if (hasUpgrade("p",24)) cm = new Decimal(13/3)
    if (hasUpgrade("st",23)) cm = new Decimal(4)
    return cm
}

function tmbuy22cm() {
    cm = new Decimal(5)
    if (hasUpgrade("p",24)) cm = new Decimal(13/3)
    if (hasUpgrade("st",23)) cm = new Decimal(4)
    return cm
}