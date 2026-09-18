addLayer("fd", {
    tabFormat: {
        "4th Dimension": {
            content:[
                "main-display",
                ["display-text", function() { 
                    if (getResetGain("fd").gte(new Decimal(2).pow(32).mul(infMs2()))) return "You Are Gaining <h2><b style='color:#797EF6;'>" + format(getResetGain("fd")) + "</b></h2> Distortion Per Second" 
                    else return "You Are Gaining <h2><b style='color:#FF7F7F;'>" + format(getResetGain("fd")) + "</b></h2> Distortion Per Second" 
                },],
                () => (hasUpgrade("p",25) ? "blank" :  ""),
                ["display-text", function() { if (hasUpgrade("p",25)) return "<h2><b style='color:#D0B49F;'>x" + format(fdboost()) + "</b></h2> Time Fragments gained after 4th Dimension effect" },],
                "blank",
                () => (player["fd"].unlocked ? "" :  "prestige-button"),
                "challenges",
                "blank",
                ["display-text", function() { return "<h3> Duplicate Machines </h3>" },],
                ["row", [["buyable", 11], ["buyable", 12]]],
                "blank",
                "blank",
                ["display-text", function() { return "<h3> Replicator Machines </h3>" },],
                ["row", [["buyable", 21], ["buyable", 22]]],
                "blank",
            ],
        },
        "4D-Upgrades": {
            content:[
                "main-display",
                "blank",
                "clickables",
                "upgrades",
            ],
        },
    },
    name: "4th Dimension", 
    symbol: "4",
    color() { 
        if (getResetGain("fd").gte(new Decimal(2).pow(32).mul(infMs2()))) return "#797EF6"
        else return "#FF7F7F"
    },
    nodeStyle() {
        var style = {"margin": "15px", "background": "radial-gradient(#BEBEBE, #696969)", "background-origin": "border-box"}
        if (player.points.gte(new Decimal(10).pow(100)) || player["fd"].unlocked) style["background"] = "radial-gradient(#FF7F7F, #797EF6)";
        if (options.nodeStyle) style["border-radius"] = "15px 15px 15px 15px";
        return style
    },
    resource: "Distortion",
    baseResource: "Time",
    requires: new Decimal(10).pow(100),
    baseAmount() {return player.points}, 
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    passiveGeneration() { return true },
    type: "normal", 
    prestigeButtonText() {return "Unlock 4th Dimension"},
    clickables: {
        11: {
            display() {return "<h2>Buy All"},
            canClick() {return true},
            onClick() {
                buyUpgrade("fd", 11) & buyUpgrade("fd", 12) & buyUpgrade("fd", 13) & buyUpgrade("fd", 14) & buyUpgrade("fd", 15)
            },
            onHold() {
                buyUpgrade("fd", 11) & buyUpgrade("fd", 12) & buyUpgrade("fd", 13) & buyUpgrade("fd", 14) & buyUpgrade("fd", 15)
            },
            style() {
                return {"border-radius": "15px 15px 0px 0px", "width": "600px", "min-height": "40px"}
            },
            unlocked() {return hasMilestone("inf",5)}
        },
    },
    challenges: {
        11: {
            name: "4th Dimension Machine",
            challengeDescription() {
                if (getResetGain("fd").gte(new Decimal(2).pow(32).mul(infMs2()))) return "Your production of <b> Time Fragments </b> and <b> functions </b> is raised to 1/4 when in 4th Dimension. You can only gain Distorion when in 4th Dimension and is based on Time Speed.<br><b>The machine cannot handle this much Distortion, it's production is decreased..."
                else return "Your production of <b> Time Fragments </b> and <b> functions </b> is raised to 1/4 when in 4th Dimension. You can only gain Distorion when in 4th Dimension and is based on Time Speed."
            },
            goalDescription: "> 1 Time Speed",
            canComplete: function() {return false},
            rewardDescription: "Gain Distortion.",
            completionLimit: 1,
            onEnter() { layer1reset() },
            onExit() { layer1reset() }, 
            style() {
                if (inChallenge("fd",11) && getResetGain("fd").gte(new Decimal(2).pow(32).mul(infMs2()))) return {"background": "radial-gradient(#FF7F7F, #797EF6)", "border-radius": "15px 15px 15px 15px", "width": "540px", "height": "240px", "padding": "15px"}
                else if (inChallenge("fd",11)) return {"background": "radial-gradient(#FF7F7F, #FF7F7F, #797EF6)", "border-radius": "15px 15px 15px 15px", "width": "540px", "height": "240px", "padding": "15px"}
                else return {"background": "#FF7F7F", "border-radius": "15px 15px 15px 15px", "width": "540px", "height": "240px", "padding": "15px"}
            },
            unlocked() {
                if (player["fd"].unlocked) return true
                else return false
            }
        },
    },
    buyables: {
        11: {
            title() {return "T.F.G.E.R."},
            cost(x) { return new Decimal(0.25).mul(new Decimal(8).pow(x))},
            display() { 
                return "<b>+" + format(buyableEffect("fd",21)) + " free T.M.G.E.</b>, therefore you gain more Time Fragments <br> Currently: <b>+" + format(tmp.fd.buyables[11].effect) + " T.M.G.E. </b> <br> (bought:" + format(getBuyableAmount("fd", 11)) + ")" + "<br> Cost: <b style='color:red;'> " + format(this.cost(getBuyableAmount("fd", 11))) + " Distortion"
            },
            canAfford() { return player["fd"].points.gte(this.cost()) },
            buy() {
                player["fd"].points = player["fd"].points.sub(this.cost())
                setBuyableAmount("fd", 11, getBuyableAmount("fd", 11).add(1))
            },
            effect() { 
                eff = new Decimal(0)
                eff = eff.add(getBuyableAmount("fd",11))
                eff = eff.mul(buyableEffect("fd",21))
                return eff
            },
            style(){ 
                return {"border-radius": "15px 0px 0px 15px", "width": "270px", "height": "180px"}
            },
            unlocked() {
                if (player["fd"].unlocked) return true
                else return false
            }
        },
        12: {
            title() {return "Distort Warp Time"},
            cost(x) { return new Decimal(1).mul(new Decimal(128).pow(x))},
            display() { 
                return "<b>+" + format(buyableEffect("fd",22)) + " free Warp Warp Time</b>, so you gain more time <br> Currently: <b>+" + format(tmp.fd.buyables[12].effect) + " Warp Warp Time </b> <br> (bought:" + format(getBuyableAmount("fd", 12)) + ")" + "<br> Cost: <b style='color:red;'> " + format(this.cost(getBuyableAmount("fd", 12))) + " Distortion"
            },
            canAfford() { return player["fd"].points.gte(this.cost()) },
            buy() {
                player["fd"].points = player["fd"].points.sub(this.cost())
                setBuyableAmount("fd", 12, getBuyableAmount("fd", 12).add(1))
            },
            effect() { 
                eff = new Decimal(0)
                eff = eff.add(getBuyableAmount("fd", 12))
                eff = eff.mul(buyableEffect("fd",22))
                return eff
            },
            style(){ 
                return {"border-radius": "0px 15px 15px 0px", "width": "270px", "height": "180px"}
            },
            unlocked() {
                if (player["fd"].unlocked) return true
                else return false
            }
        },
        21: {
            title() {return "T.F.G.E.R.G."},
            cost(x) { return new Decimal(5).add(new Decimal(5).mul(x))},
            display() { 
                return "<b>Increase</b> the power of T.F.G.E.R., you gain additional +1 free T.M.G.E. for every T.F.G.E.R. <br> Currently: <b>+" + format(tmp.fd.buyables[21].effect) + " T.M.G.E. / T.M.G.E.R. </b> <br> (bought:" + format(getBuyableAmount("fd", 21)) + ")" + "<br><b>Warning: Resets entire Layer 1, Distortion, T.M.G.E.R., and Distort Warp Time</b><br> Cost: <b style='color:red;'> " + format(this.cost(getBuyableAmount("fd", 21))) + " T.M.G.E.R."
            },
            canAfford() { return getBuyableAmount("fd", 11).gte(this.cost()) },
            buy() {
                layer1reset()
                player["fd"].points = player["fd"].points.mul(0)
                setBuyableAmount("fd", 11, getBuyableAmount("fd", 11).mul(0))
                setBuyableAmount("fd", 12, getBuyableAmount("fd", 12).mul(0))
                setBuyableAmount("fd", 21, getBuyableAmount("fd", 21).add(1))
            },
            effect() { 
                eff = new Decimal(1)
                eff = eff.add(getBuyableAmount("fd", 21))
                return eff
            },
            style(){ 
                return {"border-radius": "15px 0px 0px 15px", "width": "270px", "height": "180px"}
            },
            unlocked() {
                if (player["fd"].unlocked) return true
                else return false
            }
        },
        22: {
            title() {return "Warp Distort Time"},
            cost(x) { return new Decimal(5).add(new Decimal(5).mul(x))},
            display() { 
                return "<b>Increase</b> the power of Distort Warp Time, you gain additional +0.25 free Warp Warp Time for every Distort Warp Time <br> Currently: <b>+" + format(tmp.fd.buyables[22].effect) + " Warp Warp Time / Distort Warp Time </b> <br> (bought:" + format(getBuyableAmount("fd", 22)) + ")" + "<br><b>Warning: Resets entire Layer 1, Distortion, T.M.G.E.R., and Distort Warp Time</b><br> Cost: <b style='color:red;'> " + format(this.cost(getBuyableAmount("fd", 22))) + " Distort Warp Time"
            },
            canAfford() { return getBuyableAmount("fd", 12).gte(this.cost()) },
            buy() {
                layer1reset()
                player["fd"].points = player["fd"].points.mul(0)
                setBuyableAmount("fd", 11, getBuyableAmount("fd", 11).mul(0))
                setBuyableAmount("fd", 12, getBuyableAmount("fd", 12).mul(0))
                setBuyableAmount("fd", 22, getBuyableAmount("fd", 22).add(1))
            },
            effect() { 
                eff = new Decimal(1)
                eff = eff.add(getBuyableAmount("fd", 22).mul(0.25))
                return eff
            },
            style(){ 
                return {"border-radius": "0px 15px 15px 0px", "width": "270px", "height": "180px"}
            },
            unlocked() {
                if (player["fd"].unlocked) return true
                else return false
            }
        },
    },
    upgrades: {
        11: {
            title: "4D-Upgrade 1.1",
            description: "<b>Enhance</b> the softcap of Warp Warp Time (^0.75 -> ^0.83)",
            cost: new Decimal(16),
            currencyDisplayName: "Distortion",
            currencyInternalName: "points",
            currencyLayer: "fd",
            style(){ 
                if (tmp["fd"].clickables[11].unlocked) return {"border-radius": "0px 0px 0px 15px",'width': '120px', 'height': '135px'}
                else return {"border-radius": "15px 0px 0px 15px", "width": "120px", "height": "135px"}
            },
        },
        12: {
            title: "4D-Upgrade 1.2",
            description: "<b>Enhance</b> T.F.G.E. effect (^0.88 -> ^0.90)",
            cost: new Decimal(256),
            currencyDisplayName: "Distortion",
            currencyInternalName: "points",
            currencyLayer: "fd",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "120px", "height": "135px"}
            },
        },
        13: {
            title: "4D-Upgrade 1.3",
            description: "<b>Keep</b> all currently unlocked 'U' and Res-Upgrades",
            cost: new Decimal(65536),
            currencyDisplayName: "Distortion",
            currencyInternalName: "points",
            currencyLayer: "fd",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "120px", "height": "135px"}
            },
        },
        14: {
            title: "4D-Upgrade 1.4",
            description: "<b>+0.2</b> to the base of Distortion's effect to Time Fragments production",
            cost: new Decimal(2).pow(32),
            currencyDisplayName: "Distortion",
            currencyInternalName: "points",
            currencyLayer: "fd",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "120px", "height": "135px"}
            },
        },
        15: {
            title: "4D-Upgrade 1.5",
            description: "<b>---</b>",
            cost: new Decimal(2).pow(96),
            currencyDisplayName: "Distortion",
            currencyInternalName: "points",
            currencyLayer: "fd",
            effect() {
                eff = new Decimal(1)
                return eff
            },
            effectDisplay() {
                return "<b>x" + format(upgradeEffect("fd", 15))
            },
            style(){ 
                if (tmp["fd"].clickables[11].unlocked) return {"border-radius": "0px 0px 15px 0px",'width': '120px', 'height': '135px'}
                else return {"border-radius": "0px 15px 15px 0px", "width": "120px", "height": "135px"}
            },
        },
    },
    automate() {
    },
    update(diff) {

    },
    getResetGain() {
        gain = new Decimal(0)
        if (inChallenge("fd",11)) gain = gain.add(getPointGen().sub(1).pow(0.5).div(100))
        if (gain.gte(new Decimal(2).pow(32).mul(infMs2()))) {
            gain = new Decimal(2).pow(32).mul(infMs2())
            gain = gain.mul(getPointGen().sub(1).pow(0.5).div(100).div(new Decimal(2).pow(32).mul(infMs2())).add(2).log10().div(new Decimal(2).log10()))
        }
        return gain
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
    exponent: 1, 
    position: 5, 
    row: 1,
    displayRow: 2,
    branches: ["tm"],
    layerShown(){return hasChallenge("inf",32)},
    doReset(resettingLayer) {
        let keep=[];
        if (layers[resettingLayer].row > this.row) {layerDataReset("fd", keep);
        if (hasAchievement("A",75)) player[this.layer].upgrades = player[this.layer].upgrades.concat([13]);
        }
    },
})

function fdboost() {
    boost = new Decimal(2)
    if (hasUpgrade("fd",14)) boost = boost.add(0.2)
    boost = boost.pow(player["fd"].points.add(10).log10().sub(1))
    return boost
}