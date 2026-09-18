addLayer("u", {
    tabFormat: {
        "'U' Upgrades": {
            content:[
                "main-display",
                ["display-text", function() { return "You Have <h2><b style='color:#63C5DA;'>" + format(player["f"].points) + "</b></h2> f(t)" },],
                "blank",
                "clickables",
                "upgrades"
            ],
        },
    },
    name: "'U' Upgrades", 
    symbol: "U",
    color: "#FFE338", 
    nodeStyle() {
        var style = {"margin": "15px", "background": "#FFE338", "background-origin": "border-box"}
        if (options.nodeStyle) style["border-radius"] = "15px 15px 15px 15px";
        return style
    },
    resource: "U",
    baseResource: "f(t)",
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
            display() {return "<h2>Buy All"},
            canClick() {return true},
            onClick() {
                buyUpgrade("u", 11) & buyUpgrade("u", 12) & buyUpgrade("u", 13) & buyUpgrade("u", 14) & buyUpgrade("u", 15)
                buyUpgrade("u", 21) & buyUpgrade("u", 22) & buyUpgrade("u", 23) & buyUpgrade("u", 24) & buyUpgrade("u", 25)
                buyUpgrade("u", 31) & buyUpgrade("u", 32) & buyUpgrade("u", 33) & buyUpgrade("u", 34) & buyUpgrade("u", 35)
            },
            onHold() {
                buyUpgrade("u", 11) & buyUpgrade("u", 12) & buyUpgrade("u", 13) & buyUpgrade("u", 14) & buyUpgrade("u", 15)
                buyUpgrade("u", 21) & buyUpgrade("u", 22) & buyUpgrade("u", 23) & buyUpgrade("u", 24) & buyUpgrade("u", 25)
                buyUpgrade("u", 31) & buyUpgrade("u", 32) & buyUpgrade("u", 33) & buyUpgrade("u", 34) & buyUpgrade("u", 35)
            },
            style() {
                return {"border-radius": "15px 15px 0px 0px", "width": "600px", "min-height": "40px"}
            },
            unlocked() {return hasAchievement("A", 62)}
        },
    },
    upgrades: {
        11: {
            title: "'U' Upgrade 1.1",
            description: "<b>x3</b> 'U' value",
            cost: new Decimal(100000),
            currencyDisplayName: "f(t)",
            currencyInternalName: "points",
            currencyLayer: "f",
            effect() {
                eff = new Decimal(1)
                eff = eff.mul(3)
                return eff
            },
            style(){ 
                if (tmp["u"].clickables[11].unlocked) return {"border-radius": "0px 0px 0px 0px",'width': '120px', 'height': '135px'}
                else return {"border-radius": "15px 0px 0px 0px", "width": "120px", "height": "135px"}
            },
        },
        12: {
            title: "'U' Upgrade 1.2",
            description: "<b>x1.5</b> 'U' value every 'U' Upgrade bought",
            cost: new Decimal(1000000),
            currencyDisplayName: "f(t)",
            currencyInternalName: "points",
            currencyLayer: "f",
            effect() {
                pow = new Decimal(0)
                if (hasUpgrade("u",11)) pow = pow.add(1)
                if (hasUpgrade("u",12)) pow = pow.add(1)
                if (hasUpgrade("u",13)) pow = pow.add(1)
                if (hasUpgrade("u",14)) pow = pow.add(1)
                if (hasUpgrade("u",15)) pow = pow.add(1)
                if (hasUpgrade("u",21)) pow = pow.add(1)
                if (hasUpgrade("u",22)) pow = pow.add(1)
                if (hasUpgrade("u",23)) pow = pow.add(1)
                if (hasUpgrade("u",24)) pow = pow.add(1)
                if (hasUpgrade("u",25)) pow = pow.add(1)
                if (hasUpgrade("u",31)) pow = pow.add(1)
                if (hasUpgrade("u",32)) pow = pow.add(1)
                if (hasUpgrade("u",33)) pow = pow.add(1)
                if (hasUpgrade("u",34)) pow = pow.add(1)
                if (hasUpgrade("u",35)) pow = pow.add(1)

                eff = new Decimal(1.5)
                if (hasUpgrade("st",41)) eff = eff.add(998.5)
                eff = eff.pow(pow)
                return eff
            },
            effectDisplay() {
                return "<b>x" + format(upgradeEffect("u", 12))
            },
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "120px", "height": "135px"}
            },
        },
        13: {
            title: "'U' Upgrade 1.3",
            description() {
                if (hasUpgrade("st",21) && hasUpgrade("u",34)) return "<b>x1.015</b> 'U' value every 'a' Variable bought <br> Cap = x1,048,576"
                else if (hasUpgrade("st",21)) return "<b>x1.01</b> 'U' value every 'a' Variable bought <br> Cap = x1,048,576"
                else if (hasUpgrade("u",34) && hasUpgrade("u",31) && upgradeEffect("u", 13).gte(1048576)) return "<b>x1.015</b> 'U' value every 'a' Variable bought <br> Max = x1,048,576"
                else if (hasUpgrade("u",31) && upgradeEffect("u", 13).gte(1048576)) return "<b>x1.01</b> 'U' value every 'a' Variable bought <br> Max = x1,048,576"
                else if (hasUpgrade("u",34) && hasUpgrade("u",31)) return "<b>x1.015</b> 'U' value every 'a' Variable bought <br> Cap = x32"
                else if (hasUpgrade("u",34)) return "<b>x1.015</b> 'U' value every 'a' Variable bought <br> Max = x32"
                else if (hasUpgrade("u",31)) return "<b>x1.01</b> 'U' value every 'a' Variable bought <br> Cap = x32"
                else return "<b>x1.01</b> 'U' value every 'a' Variable bought <br> Max = x32"
            },
            cost: new Decimal(10000000),
            currencyDisplayName: "f(t)",
            currencyInternalName: "points",
            currencyLayer: "f",
            effect() {
                base = new Decimal(1.01)
                if (hasUpgrade("u",34)) base = new Decimal(1.015)

                eff = new Decimal(1)
                eff = eff.mul(new Decimal(base).pow(getBuyableAmount("f",11)))
                if (eff.gte(32)) {
                    eff = new Decimal(32)
                    if (hasUpgrade("u",31)) eff = eff.mul(new Decimal(base).pow(getBuyableAmount("f",11)).div(32).pow(0.75))
                    if (eff.gte(1048576)) {
                        eff = new Decimal(1048576)
                        if (hasUpgrade("st",21)) eff = eff.mul(new Decimal(base).pow(getBuyableAmount("f",11)).div(32).pow(0.75).div(1048576).pow(0.55))
                    }
                }
                return eff
            },
            effectDisplay() {
                return "<b>x" + format(upgradeEffect("u", 13))
            },
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "120px", "height": "135px"}
            },
        },
        14: {
            title: "'U' Upgrade 1.4",
            description: "<b>Unlock</b> Research",
            cost: new Decimal(100000000),
            currencyDisplayName: "f(t)",
            currencyInternalName: "points",
            currencyLayer: "f",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "120px", "height": "135px"}
            },
        },
        15: {
            title: "'U' Upgrade 1.5",
            description() {
                if (hasUpgrade("st",21) && hasUpgrade("u",34)) return "<b>x1.015</b> 'U' value every 'b' Variable bought <br> Cap = x1,048,576"
                else if (hasUpgrade("st",21)) return "<b>x1.01</b> 'U' value every 'b' Variable bought <br> Cap = x1,048,576"
                else if (hasUpgrade("u",34) && hasUpgrade("u",31) && upgradeEffect("u", 15).gte(1048576)) return "<b>x1.015</b> 'U' value every 'b' Variable bought <br> Max = x1,048,576"
                else if (hasUpgrade("u",31) && upgradeEffect("u", 15).gte(1048576)) return "<b>x1.01</b> 'U' value every 'b' Variable bought <br> Max = x1,048,576"
                else if (hasUpgrade("u",34) && hasUpgrade("u",31)) return "<b>x1.015</b> 'U' value every 'b' Variable bought <br> Cap = x32"
                else if (hasUpgrade("u",34)) return "<b>x1.015</b> 'U' value every 'b' Variable bought <br> Max = x32"
                else if (hasUpgrade("u",31)) return "<b>x1.01</b> 'U' value every 'b' Variable bought <br> Cap = x32"
                else return "<b>x1.01</b> 'U' value every 'b' Variable bought <br> Max = x32"
            },
            cost: new Decimal(1e9),
            currencyDisplayName: "f(t)",
            currencyInternalName: "points",
            currencyLayer: "f",
            effect() {
                base = new Decimal(1.01)
                if (hasUpgrade("u",34)) base = new Decimal(1.015)

                eff = new Decimal(1)
                eff = eff.mul(new Decimal(base).pow(getBuyableAmount("f",21)))
                if (eff.gte(32)) {
                    eff = new Decimal(32)
                    if (hasUpgrade("u",31)) eff = eff.mul(new Decimal(base).pow(getBuyableAmount("f",21)).div(32).pow(0.75))
                    if (eff.gte(1048576)) {
                        eff = new Decimal(1048576)
                        if (hasUpgrade("st",21)) eff = eff.mul(new Decimal(base).pow(getBuyableAmount("f",21)).div(32).pow(0.75).div(1048576).pow(0.55))
                    }
                }
                return eff
            },
            effectDisplay() {
                return "<b>x" + format(upgradeEffect("u", 15))
            },
            style(){ 
                if (tmp["u"].clickables[11].unlocked) return {"border-radius": "0px 0px 0px 0px",'width': '120px', 'height': '135px'}
                else return {"border-radius": "0px 15px 0px 0px", "width": "120px", "height": "135px"}
            },
        },
        21: {
            title: "'U' Upgrade 2.1",
            description: "<b>Unlock</b> Res-Upgrades",
            cost: new Decimal(1e10),
            currencyDisplayName: "f(t)",
            currencyInternalName: "points",
            currencyLayer: "f",
            style(){ 
                if (tmp["u"].upgrades[31].unlocked) return {"border-radius": "0px 0px 0px 0px",'width': '120px', 'height': '135px'}
                else return {"border-radius": "0px 0px 0px 15px", "width": "120px", "height": "135px"}
            },
        },
        22: {
            title: "'U' Upgrade 2.2",
            description() {
                if (hasUpgrade("st",21) && hasUpgrade("u",34)) return "<b>x1.015</b> 'U' value every 'c' Variable bought <br> Cap = x1,048,576"
                else if (hasUpgrade("st",21)) return "<b>x1.01</b> 'U' value every 'c' Variable bought <br> Cap = x1,048,576"
                else if (hasUpgrade("u",34) && hasUpgrade("u",31) && upgradeEffect("u", 22).gte(1048576)) return "<b>x1.015</b> 'U' value every 'c' Variable bought <br> Max = x1,048,576"
                else if (hasUpgrade("u",31) && upgradeEffect("u", 22).gte(1048576)) return "<b>x1.01</b> 'U' value every 'c' Variable bought <br> Max = x1,048,576"
                else if (hasUpgrade("u",34) && hasUpgrade("u",31)) return "<b>x1.015</b> 'U' value every 'c' Variable bought <br> Cap = x32"
                else if (hasUpgrade("u",34)) return "<b>x1.015</b> 'U' value every 'c' Variable bought <br> Max = x32"
                else if (hasUpgrade("u",31)) return "<b>x1.01</b> 'U' value every 'c' Variable bought <br> Cap = x32"
                else return "<b>x1.01</b> 'U' value every 'c' Variable bought <br> Max = x32"
            },
            cost: new Decimal(1e11),
            currencyDisplayName: "f(t)",
            currencyInternalName: "points",
            currencyLayer: "f",
            effect() {
                base = new Decimal(1.01)
                if (hasUpgrade("u",34)) base = new Decimal(1.015)

                eff = new Decimal(1)
                eff = eff.mul(new Decimal(base).pow(getBuyableAmount("f",31)))
                if (eff.gte(32)) {
                    eff = new Decimal(32)
                    if (hasUpgrade("u",31)) eff = eff.mul(new Decimal(base).pow(getBuyableAmount("f",31)).div(32).pow(0.75))
                    if (eff.gte(1048576)) {
                        eff = new Decimal(1048576)
                        if (hasUpgrade("st",21)) eff = eff.mul(new Decimal(base).pow(getBuyableAmount("f",31)).div(32).pow(0.75).div(1048576).pow(0.55))
                    }
                }
                return eff
            },
            effectDisplay() {
                return "<b>x" + format(upgradeEffect("u", 22))
            },
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "120px", "height": "135px"}
            },
        },
        23: {
            title: "'U' Upgrade 2.3",
            description: "<b>x1.5</b> 'U' value every Res-Upgrade bought",
            cost: new Decimal(1e12),
            currencyDisplayName: "f(t)",
            currencyInternalName: "points",
            currencyLayer: "f",
            effect() {
                eff = new Decimal(1)
                if (hasUpgrade("res",11)) eff = eff.mul(1.5)
                if (hasUpgrade("res",12)) eff = eff.mul(1.5)
                if (hasUpgrade("res",13)) eff = eff.mul(1.5)
                if (hasUpgrade("res",14)) eff = eff.mul(1.5)
                if (hasUpgrade("res",15)) eff = eff.mul(1.5)
                if (hasUpgrade("res",21)) eff = eff.mul(1.5)
                if (hasUpgrade("res",22)) eff = eff.mul(1.5)
                if (hasUpgrade("res",23)) eff = eff.mul(1.5)
                if (hasUpgrade("res",24)) eff = eff.mul(1.5)
                if (hasUpgrade("res",25)) eff = eff.mul(1.5)
                return eff
            },
            effectDisplay() {
                return "<b>x" + format(upgradeEffect("u", 23))
            },
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "120px", "height": "135px"}
            },
        },
        24: {
            title: "'U' Upgrade 2.4",
            description() {
                if (hasUpgrade("st",21) && hasUpgrade("u",34)) return "<b>x1.015</b> 'U' value every 'd' Variable bought <br> Cap = x1,048,576"
                else if (hasUpgrade("st",21)) return "<b>x1.01</b> 'U' value every 'd' Variable bought <br> Cap = x1,048,576"
                else if (hasUpgrade("u",34) && hasUpgrade("u",31) && upgradeEffect("u", 24).gte(1048576)) return "<b>x1.015</b> 'U' value every 'd' Variable bought <br> Max = x1,048,576"
                else if (hasUpgrade("u",31) && upgradeEffect("u", 24).gte(1048576)) return "<b>x1.01</b> 'U' value every 'd' Variable bought <br> Max = x1,048,576"
                else if (hasUpgrade("u",34) && hasUpgrade("u",31)) return "<b>x1.015</b> 'U' value every 'd' Variable bought <br> Cap = x32"
                else if (hasUpgrade("u",34)) return "<b>x1.015</b> 'U' value every 'd' Variable bought <br> Max = x32"
                else if (hasUpgrade("u",31)) return "<b>x1.01</b> 'U' value every 'd' Variable bought <br> Cap = x32"
                else return "<b>x1.01</b> 'U' value every 'd' Variable bought <br> Max = x32"
            },
            cost: new Decimal(1e13),
            currencyDisplayName: "f(t)",
            currencyInternalName: "points",
            currencyLayer: "f",
            effect() {
                base = new Decimal(1.01)
                if (hasUpgrade("u",34)) base = new Decimal(1.015)

                eff = new Decimal(1)
                eff = eff.mul(new Decimal(base).pow(getBuyableAmount("f",41)))
                if (eff.gte(32)) {
                    eff = new Decimal(32)
                    if (hasUpgrade("u",31)) eff = eff.mul(new Decimal(base).pow(getBuyableAmount("f",41)).div(32).pow(0.75))
                    if (eff.gte(1048576)) {
                        eff = new Decimal(1048576)
                        if (hasUpgrade("st",21)) eff = eff.mul(new Decimal(base).pow(getBuyableAmount("f",41)).div(32).pow(0.75).div(1048576).pow(0.55))
                    }
                }
                return eff
            },
            effectDisplay() {
                return "<b>x" + format(upgradeEffect("u", 24))
            },
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "120px", "height": "135px"}
            },
        },
        25: {
            title: "'U' Upgrade 2.5",
            description: "<b>+ ^0.05</b> 'U' value",
            cost: new Decimal(1e14),
            currencyDisplayName: "f(t)",
            currencyInternalName: "points",
            currencyLayer: "f",
            effect() {
                eff = new Decimal(0)
                eff = eff.add(0.05)
                return eff
            },
            style(){ 
                if (tmp["u"].upgrades[35].unlocked) return {"border-radius": "0px 0px 0px 0px", 'width': '120px', 'height': '135px'}
                else return {"border-radius": "0px 0px 15px 0px", "width": "120px", "height": "135px"}
            },
        },
        31: {
            title: "'U' Upgrade 3.1",
            description: "<b>Change</b> the max to cap of 'U' Upgrade 1.3, 1.5, 2.2, and 2.4",
            cost: new Decimal(1e75),
            currencyDisplayName: "f(t)",
            currencyInternalName: "points",
            currencyLayer: "f",
            style(){ 
                return {"border-radius": "0px 0px 0px 15px", "width": "120px", "height": "135px"}
            },
            unlocked() {return hasUpgrade("p",15)},
        },
        32: {
            title: "'U' Upgrade 3.2",
            description: "<b>+ ^0.002</b> 'U' value every 'U' Variable Upgrade bought <br> Max = + ^1",
            cost: new Decimal(1e90),
            currencyDisplayName: "f(t)",
            currencyInternalName: "points",
            currencyLayer: "f",
            effect() {
                eff = new Decimal(0)
                eff = eff.add(new Decimal(0.002).mul(getBuyableAmount("res",21)))
                if (eff.gte(1)) eff = new Decimal(1)
                return eff
            },
            effectDisplay() {
                return "<b>+ ^" + format(upgradeEffect("u", 32))
            },
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "120px", "height": "135px"}
            },
            unlocked() {return hasUpgrade("p",15)},
        },
        33: {
            title: "'U' Upgrade 3.3",
            description: "<b>Reduce</b> 'a, b, c, & d' Variable cost increase (x1.5 -> x1.425)",
            cost: new Decimal(1e111),
            currencyDisplayName: "f(t)",
            currencyInternalName: "points",
            currencyLayer: "f",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "120px", "height": "135px"}
            },
            unlocked() {return hasUpgrade("p",15)},
        },
        34: {
            title: "'U' Upgrade 3.4",
            description: "<b>Enhance</b> the base of 'U' Upgrade 1.3, 1.5, 2.2, and 2.4",
            cost: new Decimal(1e138),
            currencyDisplayName: "f(t)",
            currencyInternalName: "points",
            currencyLayer: "f",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "120px", "height": "135px"}
            },
            unlocked() {return hasUpgrade("p",15)},
        },
        35: {
            title: "'U' Upgrade 3.5",
            description: "<b>Unlock</b> 'More PP' in Prestige and second row of Pres-Upgrades",
            cost: new Decimal(1e171),
            currencyDisplayName: "f(t)",
            currencyInternalName: "points",
            currencyLayer: "f",
            style(){ 
                return {"border-radius": "0px 0px 15px 0px", "width": "120px", "height": "135px"}
            },
            unlocked() {return hasUpgrade("p",15)},
        },
    },
    automate() {

    },
    update(diff) {
        pow = new Decimal(1)
        if (inChallenge("inf",12) || inChallenge("inf",32)) pow = new Decimal(0.5)
        if (hasUpgrade("u",25)) pow = pow.add(tmp.u.upgrades[25].effect)
        if (hasUpgrade("u",32)) pow = pow.add(tmp.u.upgrades[32].effect)
        if (hasUpgrade("st",31)) pow = pow.add(2/3)

        player["u"].points = new Decimal(1)
        if (hasUpgrade("u", 11)) player["u"].points = player["u"].points.mul(tmp.u.upgrades[11].effect)
        if (hasUpgrade("u", 12)) player["u"].points = player["u"].points.mul(tmp.u.upgrades[12].effect)
        if (hasUpgrade("u", 13)) player["u"].points = player["u"].points.mul(tmp.u.upgrades[13].effect)
        if (hasUpgrade("u", 15)) player["u"].points = player["u"].points.mul(tmp.u.upgrades[15].effect)
        if (hasUpgrade("u", 22)) player["u"].points = player["u"].points.mul(tmp.u.upgrades[22].effect)
        if (hasUpgrade("u", 23)) player["u"].points = player["u"].points.mul(tmp.u.upgrades[23].effect)
        if (hasUpgrade("u", 24)) player["u"].points = player["u"].points.mul(tmp.u.upgrades[24].effect)
        player["u"].points = player["u"].points.mul(buyableEffect("res", 21))
        player["u"].points = player["u"].points.pow(pow)

    },
    getResetGain() {
        gain = new Decimal(0)
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
    position: 1, 
    row: 0,
    displayRow: 1,
    branches: ["f"],
    layerShown(){return player["f"].best.gte(10000) || hasAchievement("A", 21)},
    doReset(resettingLayer) {
        let keep=[];
        if (layers[resettingLayer].row > this.row) {layerDataReset("u", keep);
        if (hasUpgrade("fd",13)) player[this.layer].upgrades = player[this.layer].upgrades.concat([11,12,13,14,15]);
        if (hasUpgrade("fd",13)) player[this.layer].upgrades = player[this.layer].upgrades.concat([21,22,23,24,25]);
        if (hasUpgrade("fd",13)) player[this.layer].upgrades = player[this.layer].upgrades.concat([31,32,33,34,35]);
        if (hasAchievement("A", 26)) player[this.layer].upgrades = player[this.layer].upgrades.concat([35]);
        if (hasAchievement("A", 21)) player[this.layer].upgrades = player[this.layer].upgrades.concat([21]);
        if (hasAchievement("A", 21)) player[this.layer].upgrades = player[this.layer].upgrades.concat([14]);
        }
    },
})