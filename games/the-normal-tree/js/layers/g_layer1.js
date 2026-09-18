addLayer("g", {
    name: "generators",
    symbol: "G",
    position: 0,
    color: "#a3d9a5",
    requires() {
        return new Decimal(1500000)
    },
    resource: "generators",
    baseResource: "delta prestige points",
    baseAmount() {
        return player.dP.points
    },
    type: "static",
    exponent() {
        let expo = new Decimal(1.1)
        if (player.g.points.gte(50)) expo = expo.add(player.g.points.div(550))
        return expo
    },
    base() {
        let base = new Decimal(2.5)
        if (hasChallenge('Ab', 12)) base = base.pow(1.2)
        return base
    },
    gainMult() {
        let mult = new Decimal(1);
        return mult;
    },
    canBuyMax() {
        return hasMilestone("g", 2)
    },
    row: 6,
    hotkeys: [{
        key: "G",
        description: "Shift + G: Reset for Generators",
        onPress() {
            if (canReset(this.layer))
                doReset(this.layer)
        }
    }, ],
    layerShown() {return hasUpgrade('fP', 13) || player.cB.unlocked || player.gP.unlocked},  
    automate() {},
    effBase() {
        let base = new Decimal(2);
        return base;
    },
    effect() {
        if (!player.g.unlocked)
            return new Decimal(0)
        let eff = Decimal.pow(this.effBase(), player.g.points).sub(1).max(0);
        if (hasMilestone('gP', 14)) eff = eff.times(100)
        if (hasMilestone('iP', 14)) eff = eff.times(1500)
        if (hasMilestone('jP', 14)) eff = eff.times(7500)
        return eff;
    },
    effectDescription() {
        return "which are generating " + format(tmp.g.effect) + " Generator Power/sec"
    },
    update(diff) {
        if (player.g.unlocked)
            player.g.power = player.g.power.plus(tmp.g.effect.times(diff));
    },
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            power: new Decimal(0),
        }
    },
    powerExp() {
        let exp = new Decimal(1 / 3);
        if (hasUpgrade('g', 11)) exp = new Decimal (7 / 16);
        if (hasUpgrade('g', 12)) exp = new Decimal (1 / 2);
        if (hasUpgrade('g', 13)) exp = new Decimal (3 / 4);
        if (hasUpgrade('Ab', 12)) exp = exp.add(0.47)
        return exp;
    },
    powerEff() {
        if (!player.g.unlocked)
            return new Decimal(1);
        return player.g.power.plus(1).pow(this.powerExp());
    },
    resetsNothing() { return player.g.unlocked },
    autoPrestige() { return hasUpgrade('A', 41)},
    tabFormat: ["main-display", "prestige-button", "blank", ["display-text", function() {
        return 'You have ' + format(player.g.power) + ' Generator Power, which boosts Prestige Point generation by ' + format(tmp.g.powerEff) + 'x'
    }
    , {}],["display-text", function() {
        if (player.g.points.gte(50)) return 'Generator Cost is now scaled by ^'+ format(tmp.g.exponent)
    }
    , {}], "blank", ["display-text", function() {
        return 'Your best Generators is ' + formatWhole(player.g.best) + '<br>You have made a total of ' + formatWhole(player.g.total) + " Generators."
    }
    , {}], "blank", "upgrades"],

upgrades:{  
    11: {
        title: "Normal Generator I",
        description: "Generator Power Effect is better",
        cost: new Decimal(1e7),
        currencyDisplayName: "Generator Power",
        currencyInternalName: "power",
        currencyLayer: "g",
    },
    12: {
        title: "Normal Generator II",
        description: "Generator Power Effect is better",
        cost: new Decimal(1e20),
        currencyDisplayName: "Generator Power",
        currencyInternalName: "power",
        currencyLayer: "g",
        unlocked(){ return hasUpgrade('g', 11) },
    },
    13: {
        title: "Normal Generator III",
        description: "Generator Power Effect is better",
        cost: new Decimal(1e50),
        currencyDisplayName: "Generator Power",
        currencyInternalName: "power",
        currencyLayer: "g",
        unlocked(){ return hasUpgrade('g', 12) },
    },
    },
})