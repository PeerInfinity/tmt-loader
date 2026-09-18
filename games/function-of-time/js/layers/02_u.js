addLayer("u", {
    name: "U",
    symbol: "U",
    position: 1,  
    tabFormat: {
        "'U' Variable": {
            content:[
                ["display-text", function() { return "U = <h2><b style='color:#FFE338;text-shadow:0px 0px 10px'>" + format(player["u"].points) + "</b></h2>" },],
                ["display-text", function() { return "f(t) = <h2><b style='color:#63C5DA;text-shadow:0px 0px 10px'>" + format(player["f"].points) + "</b></h2>" },],
                "blank",
                ["display-text", function() {return "<b>U = Πᵢ(Uᵢ+1)</b>"},],
                "blank",
                "upgrades",
                "blank",
            ],
        },
    },
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FFE338", 
    nodeStyle() {
        var style = {"margin": "15px", "background": "#FFE338", "background-origin": "border-box"}
        if (options.nodeStyle) style["border-radius"] = "15px 15px 15px 15px";
        return style
    },
    requires: new Decimal(0),
    resource: "U",
    baseResource: "f(t)",
    baseAmount() {return player["f"].points}, 
    passiveGeneration() { return false },
    type: "normal", 
    exponent: 1, 
    upgrades: {
        11: {
            title: "U₁",
            description: "<b>+2</b> 'U₁' value",
            cost: new Decimal(10000),
            currencyDisplayName: "f(t)",
            currencyInternalName: "points",
            currencyLayer: "f",
            effect() {
                eff = new Decimal(0)
                if (hasUpgrade("u",11)) eff = eff.add(2)
                if (hasUpgrade("u",15)) eff = eff.mul(buyableEffect("res", 101))
                return eff
            },
            effectDisplay() {
                return "<br><b>U₁=" + format(upgradeEffect("u", 11))
            },
            style(){ 
                return {"border-radius": "15px 15px 15px 15px", "width": "120px", "height": "135px"}
            },
        },
        12: {
            title: "U₂",
            description() {return "<b>+" + format(new Decimal(0.5).add(buyableEffect("res", 103))) + "</b> 'U₂' value every 'Uᵢ' bought"},
            cost: new Decimal(100000),
            currencyDisplayName: "f(t)",
            currencyInternalName: "points",
            currencyLayer: "f",
            effect() {
                eff = new Decimal(0)
                if (hasUpgrade("u",11)) eff = eff.add(0.5).add(buyableEffect("res", 103))
                if (hasUpgrade("u",12)) eff = eff.add(0.5).add(buyableEffect("res", 103))
                if (hasUpgrade("u",13)) eff = eff.add(0.5).add(buyableEffect("res", 103))
                if (hasUpgrade("u",14)) eff = eff.add(0.5).add(buyableEffect("res", 103))
                if (hasUpgrade("u",15)) eff = eff.add(0.5).add(buyableEffect("res", 103))
                if (!hasUpgrade("u",12)) eff = new Decimal(0)
                return eff
            },
            effectDisplay() {
                return "<br><b>U₂=" + format(upgradeEffect("u", 12))
            },
            style(){ 
                return {"border-radius": "15px 15px 15px 15px", "width": "120px", "height": "135px"}
            },
        },
        13: {
            title: "U₃",
            description: "<b>+0.25</b> 'U₃' value every magnitude of f(t)",
            cost: new Decimal(1e6),
            currencyDisplayName: "f(t)",
            currencyInternalName: "points",
            currencyLayer: "f",
            effect() {
                eff = new Decimal(0)
                if (hasUpgrade("u",13)) eff=eff.add(0.25).mul(player["f"].points.add(1).log10().floor())
                return eff
            },
            effectDisplay() {
                return "<br><b>U₃=" + format(upgradeEffect("u", 13))
            },
            style(){ 
                return {"border-radius": "15px 15px 15px 15px", "width": "120px", "height": "135px"}
            },
        },
        14: {
            title: "U₄",
            description: "<b>+√ln(t+1)</b> 'U₄' value",
            cost: new Decimal(1e7),
            currencyDisplayName: "f(t)",
            currencyInternalName: "points",
            currencyLayer: "f",
            effect() {
                eff = new Decimal(0)
                if (hasUpgrade("u",14)) eff=eff.add(player.points.add(1).ln().pow(0.5))
                return eff
            },
            effectDisplay() {
                return "<br><b>U₄=" + format(upgradeEffect("u", 14))
            },
            style(){ 
                return {"border-radius": "15px 15px 15px 15px", "width": "120px", "height": "135px"}
            },
        },
        15: {
            title: "U₅",
            description: "<b>+0.25</b> 'U₅' every magnitude of Knowledge (κ)<br>Unlock <b>Research</b>",
            cost: new Decimal(1e8),
            currencyDisplayName: "f(t)",
            currencyInternalName: "points",
            currencyLayer: "f",
            effect() {
                eff = new Decimal(0)
                if (hasUpgrade("u",15)) eff=eff.add(0.25).mul(player["res"].points.add(1).log10().floor())
                return eff
            },
            effectDisplay() {
                return "<br><b>U₅=" + format(upgradeEffect("u", 15))
            },
            style(){ 
                return {"border-radius": "15px 15px 15px 15px", "width": "120px", "height": "135px"}
            },
        },
    },
    update(diff) {
        player["u"].points = new Decimal(1)
        if (hasUpgrade("u", 11)) player["u"].points = player["u"].points.mul(tmp.u.upgrades[11].effect.add(1))
        if (hasUpgrade("u", 12)) player["u"].points = player["u"].points.mul(tmp.u.upgrades[12].effect.add(1))
        if (hasUpgrade("u", 13)) player["u"].points = player["u"].points.mul(tmp.u.upgrades[13].effect.add(1))
        if (hasUpgrade("u", 14)) player["u"].points = player["u"].points.mul(tmp.u.upgrades[14].effect.add(1))
        if (hasUpgrade("u", 15)) player["u"].points = player["u"].points.mul(tmp.u.upgrades[15].effect.add(1))
    },
    getResetGain() {
        gain = new Decimal(0)
        return gain
    },
    gainMult() {
        mult = new Decimal(0)
        return mult
    },
    gainExp() { 
        return new Decimal(1)
    },
    row: 0, 
    layerShown(){
        if (player["f"].best.gte(10000)) return true
        else return false
    },
    branches: ["f"],
})
