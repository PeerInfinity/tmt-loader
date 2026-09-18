addLayer("inf", {
    tabFormat: {
        "Infinity": {
            unlocked() {return hasAchievement("A",74)},
            content:[
                "main-display",
                ["display-text", function() { return "You Have <h2><b style='color:#FFFFFF;'>" + format(player.points) + "</b></h2> Time" },],
                "blank",
                "prestige-button",
                "blank",
                ["display-text", function() { return "Your infinity is at <b style='color:#FFFFFF;'><h3>" + format(infinityCap()) + " Time </h3></b><br>since You Have <b style='color:#FFFFFF;'>" + format(player["inf"].points) + " ∞</b>" },],
                "blank",
                ["microtabs", "infinity"],
            ],
        },
        "Challenges": {
            content:[
                ["microtabs", "challenges"],
                "blank", 
            ],
        },
    },
    microtabs: {
        infinity: {
            "Milestones": {
                buttonStyle() { return {'border-color': '#FFFFFF'} },
                content: [
                    "blank",
                    "milestones",     
                    "blank"
                ]
            }
        },
        challenges: {
            "Layer 1": {
                buttonStyle() { return {'border-color': '#63C5DA'} },
                content: [
                    "blank", 
                    ["display-text", function() { return "<h2> Here is infinity stuffs" }], 
                    "blank", "blank",
                    "challenges",
                    "blank", 
                ]
            }
        },
    },
    componentStyles: {
        "microtabs"() { return {"width": "660px"} },
        "prestige-button"() { return {"border-radius": "15px 15px 15px 15px"} }
    },
    prestigeButtonText() { return "Reset for <b> +1 ∞ </b><br><br> at " + format(infinityCap()) + " Time" },
    name: "Infinity",
    symbol: "∞",
    row: "side",
    displayRow: 0,
    position: 2,
    color: "#FFFFFF",
    nodeStyle() {
        var style = {"margin": "15px", "background": "linear-gradient(60deg, #970439, #FFFFFF, #BF40BF)", "background-origin": "border-box"}
        if (options.nodeStyle) style["border-radius"] = "15px 15px 15px 15px";
        return style
    },
    tooltip() { 
        if (hasAchievement("A",74)) return (format(player["inf"].points) + " ∞")
        else return ("Infinity")
    },
    startData() { return {
        points: new Decimal(0),
        ms1amt: new Decimal(0),
        ms3amt: new Decimal(0),
        unlocked: true,
    }},
    requires() {return infinityCap()}, // Can be a function that takes requirement increases into account
    resource: "∞", // Name of prestige currency
    baseResource: "Time", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    exponent: 0.01, // Prestige currency exponent
    type: "normal",
    milestones: {
        1: {
            requirementDescription: "1 ∞",
            effectDescription() {
                if (player["inf"].ms1amt.gte(infMs1().mul(900))) return "+0.03125 free Warp Time every second that doubles each infinity greater than 1 <br> You have +" + format(player["inf"].ms1amt) + " free Warp Time <b style='color: red;'> Maxed </b> <br> Currently: +" + format(infMs1()) + " free Warp Time / second"
                else return "+0.03125 free Warp Time every second that doubles each infinity greater than 1 <br> You have +" + format(player["inf"].ms1amt) + " free Warp Time <br> Currently: +" + format(infMs1()) + " free Warp Time / second"
            },
            done() { return player["inf"].points.gte(1) },
            style() { 
                if (hasMilestone("inf",1)) return {"background-color": "#FFFFFF", "border-radius": "15px 15px 0px 0px", "width": "600px", "height": "100px"}
                else return {"border-radius": "15px 15px 0px 0px", "width": "600px", "height": "100px"}
            }
        },
        2: {
            requirementDescription: "2 ∞",
            effectDescription() {return "Passively gain PP <br> Increase the softcap limit of 4th Dimension Machine by x256 every 2 infinity <br> Currently: x" + format(infMs2())},
            done() { return player["inf"].points.gte(2) },
            style() { 
                if (hasMilestone("inf",2)) return {"background-color": "#FFFFFF", "border-radius": "0px 0px 0px 0px", "width": "600px", "height": "100px"}
                else return {"border-radius": "0px 0px 0px 0px", "width": "600px", "height": "100px"}
            }
        },
        3: {
            requirementDescription: "3 ∞",
            effectDescription() {
                if (player["inf"].ms3amt.gte(infMs3().mul(900))) return "Gain free Time Fragments Generator based on Additive Research Upgrade <br> You have +" + format(player["inf"].ms3amt) + " free Time Fragment Generator <b style='color: red;'> Maxed </b> <br> Currently: +" + format(infMs3()) + " free Time Fragment Generator / second"
                else return "Gain free Time Fragments Generator based on Additive Research Upgrade <br> You have +" + format(player["inf"].ms3amt) + " free Time Fragment Generator <br> Currently: +" + format(infMs3()) + " free Time Fragment Generator / second"
            },
            done() { return player["inf"].points.gte(3) },
            style() { 
                if (hasMilestone("inf",3)) return {"background-color": "#FFFFFF", "border-radius": "0px 0px 0px 0px", "width": "600px", "height": "100px"}
                else return {"border-radius": "0px 0px 0px 0px", "width": "600px", "height": "100px"}
            }
        },
        4: {
            requirementDescription: "4 ∞",
            effectDescription() {return "+0.5 free 'U' Variable Upgrade every 'pU' Variable Upgrade <br> Currently: +" + format(infMs4()) + " free 'U' Variable Upgrade"},
            done() { return player["inf"].points.gte(4) },
            style() { 
                if (hasMilestone("inf",4)) return {"background-color": "#FFFFFF", "border-radius": "0px 0px 0px 0px", "width": "600px", "height": "100px"}
                else return {"border-radius": "0px 0px 0px 0px", "width": "600px", "height": "100px"}
            }
        },
        5: {
            requirementDescription: "5 ∞",
            effectDescription() {return "Buy All button for Upgrades in Layer 2 <br> Increase infinity cap<br>Unlock Study Tree"},
            done() { return player["inf"].points.gte(5) },
            style() { 
                if (hasMilestone("inf",5)) return {"background-color": "#FFFFFF", "border-radius": "0px 0px 15px 15px", "width": "600px", "height": "100px"}
                else return {"border-radius": "0px 0px 15px 15px", "width": "600px", "height": "100px"}
            }
        },
    },
    challenges: {
        11: {
            name: "Break Infinity I",
            challengeDescription() {return "Just reach infinity, in 32 seconds <br> <span style='color: red;'> Must have all of the other challenges except for 'Heavy Machines & Break Infinity II' </span> <br> Time: " + formatTime(player["f"].realtime)},
            goalDescription: "Reach f(t) = 1.79e308",
            canComplete: function() {return player["f"].points.gte(new Decimal(2).pow(1024)) && player["f"].realtime.lte(32) && hasChallenge("inf",12) && hasChallenge("inf",21) && hasChallenge("inf",22) && hasChallenge("inf",31) },
            rewardDescription: "Your f(t) value will go past f(t) = 1.79e308",
            completionLimit: 1,
            onEnter() { layer1reset() },
            style: {"border-radius": "15px 0px 0px 0px", "width": "270px", "height": "270px"}
        },
        12: {
            name: "Variables",
            challengeDescription() {return "'U' Variable is weak"},
            goalDescription: "Reach f(t) = 1.79e308",
            canComplete: function() {return player["f"].points.gte(new Decimal(2).pow(1024))},
            rewardDescription: "Unlock 'a, b, c, & d' Variables max autobuyer and turn their cost into requirement.",
            completionLimit: 1,
            onEnter() { layer1reset() },
            style: {"border-radius": "0px 15px 0px 0px", "width": "270px", "height": "270px"}
        },
        21: {
            name: "Research Upgrades",
            challengeDescription() {return "Variables inflation is high (x16 Variables cost mult)"},
            goalDescription: "Reach f(t) = 1.79e308",
            canComplete: function() {return player["f"].points.gte(new Decimal(2).pow(1024))},
            rewardDescription: "Unlock Additive and Multiplicative Research Upgrade max autobuyer and turn their cost into requirement.",
            completionLimit: 1,
            onEnter() { layer1reset() },
            style: {"border-radius": "0px 0px 0px 0px", "width": "270px", "height": "270px"}
        },
        22: {
            name: "Variable Upgrades",
            challengeDescription() {return "Only 'a & b' Variable exist"},
            goalDescription: "Reach f(t) = 1.79e308",
            canComplete: function() {return player["f"].points.gte(new Decimal(2).pow(1024))},
            rewardDescription: "Unlock 'a, b, c, & d' Variable Upgrade max autobuyer and turn their cost into requirement.",
            completionLimit: 1,
            onEnter() { layer1reset() },
            style: {"border-radius": "0px 0px 0px 0px", "width": "270px", "height": "270px"}
        },
        31: {
            name: "Light Machines",
            challengeDescription() {return "Warp Warp Time is much weaker"},
            goalDescription: "Reach f(t) = 1.79e308",
            canComplete: function() {return player["f"].points.gte(new Decimal(2).pow(1024))},
            rewardDescription: "Unlock Time Fragments Generator and Time Warp max autobuyer and turn their cost into requirement.",
            completionLimit: 1,
            onEnter() { layer1reset() },
            style: {"border-radius": "0px 0px 0px 15px", "width": "270px", "height": "270px"}
        },
        32: {
            name: "Heavy Machines & Break Infinity II",
            challengeDescription() {return "Combination of all of the challenges in this tab <br>  Time: " + formatTime(player["f"].realtime)},
            goalDescription: "Reach f(t) = 1.79e308",
            canComplete: function() {return player["f"].points.gte(new Decimal(2).pow(1024)) && player["f"].realtime.lte(32)},
            rewardDescription: "Unlock T.M.G.E. and Warp Warp Time max autobuyer & your g(t) value will go past g(t) = 1.79e308.",
            completionLimit: 1,
            onEnter() { layer1reset() },
            style: {"border-radius": "0px 0px 15px 0px", "width": "270px", "height": "270px"}
        },
    },
    getResetGain() {
        gain = new Decimal(1)
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
    passiveGeneration() { 
        return false
    },
    update(diff) {
        if (player.points.gte(infinityCap())) player.points = infinityCap()
        
        player["inf"].ms1amt = player["inf"].ms1amt.add(infMs1().mul(diff))
        if (player["inf"].ms1amt.gte(infMs1().mul(900))) player["inf"].ms1amt = infMs1().mul(900)
        player["inf"].ms3amt = player["inf"].ms3amt.add(infMs3().mul(diff))
        if (player["inf"].ms3amt.gte(infMs3().mul(900))) player["inf"].ms3amt = infMs3().mul(900)
    },
    layerShown(){return player["f"].points.gte(new Decimal(2).pow(1024)) || hasAchievement("A",71)}, 
    branches: ["f"],
    doReset(resettingLayer) {
        let keep=[];
        if (layers[resettingLayer].row > this.row) {layerDataReset("inf", keep);
        }
    },
    onPrestige(gain) {
        layer2reset()
        player["inf"].ms1amt = player["inf"].ms1amt.mul(0)
        player["inf"].ms3amt = player["inf"].ms3amt.mul(0)
    },
})

function infinityCap() {
    pow = new Decimal(32)
    if (hasMilestone("inf",5)) pow = new Decimal(1024)

    cap = new Decimal(2).pow(1024)
    cap = cap.mul(new Decimal(2).pow(new Decimal(pow).mul(player["inf"].points.pow(2).add(player["inf"].points).div(2))))
    return cap
}

function infMs1() {
    eff = new Decimal(0.03125)
    eff = eff.mul(new Decimal(2).pow(player["inf"].points.sub(1)))
    return eff
}

function infMs2() {
    pow = new Decimal(0)
    pow = pow.add(player["inf"].points.div(2))
    pow = Decimal.floor(pow)

    eff = new Decimal(1)
    if (hasMilestone("inf",2)) eff = new Decimal(256)
    eff = eff.pow(pow)
    return eff
}

function infMs3() {
    eff = new Decimal(1)
    eff = eff.mul(getBuyableAmount("res",11).mul(0.01))
    eff = eff.add(1).pow(0.2).sub(1)
    return eff
}

function infMs4() {
    eff = new Decimal(0)
    eff = eff.add(new Decimal(getBuyableAmount("res",22)).mul(0.5))
    return eff
}