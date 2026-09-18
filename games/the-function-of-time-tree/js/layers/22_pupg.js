addLayer("pu", {
    tabFormat: {
        "'pU' Upgrades": {
            content:[
                "main-display",
                ["display-text", function() { return "You Have <h2><b style='color:#BF40BF;'>" + format(player["g"].points) + "</b></h2> g(t)" },],
                "blank",
                "clickables",
                "upgrades"
            ],
        },
    },
    name: "'pU' Upgrades", 
    symbol: "pU",
    color: "#970439", 
    nodeStyle() {
        var style = {"margin": "15px", "background": "#970439", "background-origin": "border-box"}
        if (options.nodeStyle) style["border-radius"] = "15px 15px 15px 15px";
        return style
    },
    resource: "pU",
    baseResource: "g(t)",
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
                buyUpgrade("pu", 11) & buyUpgrade("pu", 12) & buyUpgrade("pu", 13) & buyUpgrade("pu", 14) & buyUpgrade("pu", 15)
                buyUpgrade("pu", 21) & buyUpgrade("pu", 22) & buyUpgrade("pu", 23) & buyUpgrade("pu", 24) & buyUpgrade("pu", 25)
            },
            onHold() {
                buyUpgrade("pu", 11) & buyUpgrade("pu", 12) & buyUpgrade("pu", 13) & buyUpgrade("pu", 14) & buyUpgrade("pu", 15)
                buyUpgrade("pu", 21) & buyUpgrade("pu", 22) & buyUpgrade("pu", 23) & buyUpgrade("pu", 24) & buyUpgrade("pu", 25)
            },
            style() {
                return {"border-radius": "15px 15px 0px 0px", "width": "600px", "min-height": "40px"}
            },
            unlocked() {return hasMilestone("inf",5)}
        },
    },
    upgrades: {
        11: {
            title: "'pU' Upgrade 1.1",
            description: "<b>x3</b> 'pU' value",
            cost: new Decimal(1e24),
            currencyDisplayName: "g(t)",
            currencyInternalName: "points",
            currencyLayer: "g",
            effect() {
                eff = new Decimal(1)
                eff = eff.mul(3)
                return eff
            },
            style(){ 
                if (tmp["pu"].clickables[11].unlocked) return {"border-radius": "0px 0px 0px 0px",'width': '120px', 'height': '135px'}
                else return {"border-radius": "15px 0px 0px 0px", "width": "120px", "height": "135px"}
            },
        },
        12: {
            title: "'pU' Upgrade 1.2",
            description: "<b>x1.5</b> 'pU' value every 'pU' Upgrade bought",
            cost: new Decimal(1e27),
            currencyDisplayName: "g(t)",
            currencyInternalName: "points",
            currencyLayer: "g",
            effect() {
                eff = new Decimal(1)
                if (hasUpgrade("pu",11)) eff = eff.mul(1.5)
                if (hasUpgrade("pu",12)) eff = eff.mul(1.5)
                if (hasUpgrade("pu",13)) eff = eff.mul(1.5)
                if (hasUpgrade("pu",14)) eff = eff.mul(1.5)
                if (hasUpgrade("pu",15)) eff = eff.mul(1.5)
                if (hasUpgrade("pu",21)) eff = eff.mul(1.5)
                if (hasUpgrade("pu",22)) eff = eff.mul(1.5)
                if (hasUpgrade("pu",23)) eff = eff.mul(1.5)
                if (hasUpgrade("pu",24)) eff = eff.mul(1.5)
                if (hasUpgrade("pu",25)) eff = eff.mul(1.5)
                return eff
            },
            effectDisplay() {
                return "<b>x" + format(upgradeEffect("pu", 12))
            },
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "120px", "height": "135px"}
            },
        },
        13: {
            title: "'pU' Upgrade 1.3",
            description() {
                if (hasUpgrade("pu",25) && upgradeEffect("pu", 13).gte(1048576)) return "<b>x1.01</b> 'pU' value every 'w' Variable bought <br> Max = x1,048,576"
                else if (hasUpgrade("pu",25)) return "<b>x1.01</b> 'pU' value every 'w' Variable bought <br> Cap = x32"
                else return "<b>x1.01</b> 'pU' value every 'w' Variable bought <br> Max = x32"
            },
            cost: new Decimal(1e30),
            currencyDisplayName: "g(t)",
            currencyInternalName: "points",
            currencyLayer: "g",
            effect() {
                eff = new Decimal(1)
                eff = eff.mul(new Decimal(1.01).pow(getBuyableAmount("g",11)))
                if (eff.gte(32)) {
                    eff = new Decimal(32)
                    if (hasUpgrade("pu",25)) eff = eff.mul(new Decimal(1.01).pow(getBuyableAmount("g",11)).div(32).pow(0.75))
                    if (eff.gte(1048576)) eff = new Decimal(1048576)
                }
                return eff
            },
            effectDisplay() {
                return "<b>x" + format(upgradeEffect("pu", 13))
            },
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "120px", "height": "135px"}
            },
        },
        14: {
            title: "'pU' Upgrade 1.4",
            description: "<b>Unlock</b> second row of Res-Upgrades",
            cost: new Decimal(1e33),
            currencyDisplayName: "g(t)",
            currencyInternalName: "points",
            currencyLayer: "g",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "120px", "height": "135px"}
            },
        },
        15: {
            title: "'pU' Upgrade 1.5",
            description() {
                if (hasUpgrade("pu",25) && upgradeEffect("pu", 15).gte(1048576)) return "<b>x1.01</b> 'pU' value every 'x' Variable bought <br> Max = x1,048,576"
                else if (hasUpgrade("pu",25)) return "<b>x1.01</b> 'pU' value every 'x' Variable bought <br> Cap = x32"
                else return "<b>x1.01</b> 'pU' value every 'x' Variable bought <br> Max = x32"
            },
            cost: new Decimal(1e36),
            currencyDisplayName: "g(t)",
            currencyInternalName: "points",
            currencyLayer: "g",
            effect() {
                eff = new Decimal(1)
                eff = eff.mul(new Decimal(1.01).pow(getBuyableAmount("g",21)))
                if (eff.gte(32)) {
                    eff = new Decimal(32)
                    if (hasUpgrade("pu",25)) eff = eff.mul(new Decimal(1.01).pow(getBuyableAmount("g",21)).div(32).pow(0.75))
                    if (eff.gte(1048576)) eff = new Decimal(1048576)
                }
                return eff
            },
            effectDisplay() {
                return "<b>x" + format(upgradeEffect("pu", 15))
            },
            style(){ 
                if (tmp["pu"].clickables[11].unlocked) return {"border-radius": "0px 0px 0px 0px",'width': '120px', 'height': '135px'}
                else return {"border-radius": "0px 15px 0px 0px", "width": "120px", "height": "135px"}
            },
        },
        21: {
            title: "'pU' Upgrade 2.1",
            description: "<b>Reduce</b> Time Fragment Generator's cost increase (x2 -> x1.85)",
            cost: new Decimal(1e39),
            currencyDisplayName: "g(t)",
            currencyInternalName: "points",
            currencyLayer: "g",
            style(){ 
                return {"border-radius": "0px 0px 0px 15px", "width": "120px", "height": "135px"}
            },
        },
        22: {
            title: "'pU' Upgrade 2.2",
            description() {
                if (hasUpgrade("pu",25) && upgradeEffect("pu", 22).gte(1048576)) return "<b>x1.01</b> 'pU' value every 'y' Variable bought <br> Max = x1,048,576"
                else if (hasUpgrade("pu",25)) return "<b>x1.01</b> 'pU' value every 'y' Variable bought <br> Cap = x32"
                else return "<b>x1.01</b> 'pU' value every 'y' Variable bought <br> Max = x32"
            },
            cost: new Decimal(1e45),
            currencyDisplayName: "g(t)",
            currencyInternalName: "points",
            currencyLayer: "g",
            effect() {
                eff = new Decimal(1)
                eff = eff.mul(new Decimal(1.01).pow(getBuyableAmount("g",31)))
                if (eff.gte(32)) {
                    eff = new Decimal(32)
                    if (hasUpgrade("pu",25)) eff = eff.mul(new Decimal(1.01).pow(getBuyableAmount("g",31)).div(32).pow(0.75))
                    if (eff.gte(1048576)) eff = new Decimal(1048576)
                }
                return eff
            },
            effectDisplay() {
                return "<b>x" + format(upgradeEffect("pu", 22))
            },
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "120px", "height": "135px"}
            },
        },
        23: {
            title: "'pU' Upgrade 2.3",
            description: "<b>Unlock</b> 'pU' Variable Upgrade in Research",
            cost: new Decimal(1e54),
            currencyDisplayName: "g(t)",
            currencyInternalName: "points",
            currencyLayer: "g",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "120px", "height": "135px"}
            },
        },
        24: {
            title: "'pU' Upgrade 2.4",
            description() {
                if (hasUpgrade("pu",25) && upgradeEffect("pu", 24).gte(1048576)) return "<b>x1.01</b> 'pU' value every 'z' Variable bought <br> Max = x1,048,576"
                else if (hasUpgrade("pu",25)) return "<b>x1.01</b> 'pU' value every 'z' Variable bought <br> Cap = x32"
                else return "<b>x1.01</b> 'pU' value every 'z' Variable bought <br> Max = x32"
            },
            cost: new Decimal(1e66),
            currencyDisplayName: "g(t)",
            currencyInternalName: "points",
            currencyLayer: "g",
            effect() {
                eff = new Decimal(1)
                eff = eff.mul(new Decimal(1.01).pow(getBuyableAmount("g",41)))
                if (eff.gte(32)) {
                    eff = new Decimal(32)
                    if (hasUpgrade("pu",25)) eff = eff.mul(new Decimal(1.01).pow(getBuyableAmount("g",41)).div(32).pow(0.75))
                    if (eff.gte(1048576)) eff = new Decimal(1048576)
                }
                return eff
            },
            effectDisplay() {
                return "<b>x" + format(upgradeEffect("pu", 24))
            },
            style(){ 
                return {"border-radius": "0px 0px 0px 0px", "width": "120px", "height": "135px"}
            },
        },
        25: {
            title: "'pU' Upgrade 2.5",
            description: "<b>Change</b> the max to cap of 'pU' Upgrade 1.3, 1.5, 2.2, and 2.4",
            cost: new Decimal(1e81),
            currencyDisplayName: "g(t)",
            currencyInternalName: "points",
            currencyLayer: "g",
            style(){ 
                return {"border-radius": "0px 0px 15px 0px", "width": "120px", "height": "135px"}
            },
        },
    },
    automate() {

    },
    update(diff) {
        pow = new Decimal(1)

        player["pu"].points = new Decimal(1)
        player["pu"].points = player["pu"].points.mul(buyableEffect("res", 22))
        if (hasUpgrade("pu", 11)) player["pu"].points = player["pu"].points.mul(tmp.pu.upgrades[11].effect)
        if (hasUpgrade("pu", 12)) player["pu"].points = player["pu"].points.mul(tmp.pu.upgrades[12].effect)
        if (hasUpgrade("pu", 13)) player["pu"].points = player["pu"].points.mul(tmp.pu.upgrades[13].effect)
        if (hasUpgrade("pu", 15)) player["pu"].points = player["pu"].points.mul(tmp.pu.upgrades[15].effect)
        if (hasUpgrade("pu", 22)) player["pu"].points = player["pu"].points.mul(tmp.pu.upgrades[22].effect)
        if (hasUpgrade("pu", 24)) player["pu"].points = player["pu"].points.mul(tmp.pu.upgrades[24].effect)
        player["pu"].points = player["pu"].points.pow(pow)

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
    row: 1,
    displayRow: 2,
    branches: ["g"],
    layerShown(){return hasUpgrade("p",13) || hasAchievement("A", 61)},
    doReset(resettingLayer) {
        let keep=[];
        if (layers[resettingLayer].row > this.row) {layerDataReset("u", keep);
        if (hasAchievement("A", 61)) player[this.layer].upgrades = player[this.layer].upgrades.concat([23]);
        if (hasAchievement("A", 61)) player[this.layer].upgrades = player[this.layer].upgrades.concat([14]);
        }
    },
})