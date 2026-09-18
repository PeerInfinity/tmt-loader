addLayer("A", {
    name: "Ascension", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    color: "#fc3535",
    requires(){ 
        let requirement = new Decimal(150)
        let nerf = (player.A.points).pow(0.8)
        if (player.A.points.gte(100)) nerf = (player.A.points.times(player.A.power).times(player.A.passive).times(player.A.boost)).pow(0.9)
        if (player.A.points.gte(150)) nerf = (player.A.points.times(player.A.power).times(player.A.passive).times(player.A.boost).times(tmp.A.powerEff).times(tmp.A.passiveEff).times(tmp.A.boostEff).times(1e25)).pow(0.95)
        if (player.A.points.gte(200)) nerf = (player.A.points.times(player.A.power).times(player.A.passive).times(player.A.boost).times(tmp.A.powerEff).times(tmp.A.passiveEff).times(tmp.A.boostEff).times(1e50)).pow(1.2)
        if (player.A.points.gte(250)) nerf = (player.A.points.times(player.A.power).times(player.A.passive).times(player.A.boost).times(tmp.A.powerEff).times(tmp.A.passiveEff).times(tmp.A.boostEff).times(1e100)).pow(1.6)
        if (player.A.points.gte(350)) nerf = nerf.pow(player.points.log10().pow(0.1))
        if (player.A.points.gte(200)) requirement = requirement.times(nerf.times(nerf))
        if (player.A.points.gte(300)) requirement = requirement.pow(player.A.points.log10().div(1.6))

        if (player.A.points.gte(50)) requirement = requirement.times(nerf)
        if (hasChallenge('Ab', 11)) requirement = requirement.pow(0.65)
        if (hasChallenge('Ab', 12)) requirement = requirement.pow(0.37)
        if (hasChallenge('Ab', 21)) requirement = requirement.pow(0.8)
        return requirement
    },
    resource: "Ascension points", // Name of prestige currency
    baseResource: "juggling prestige points", // Name of resource prestige is based on
    baseAmount() {return player.jP.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.005, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    effectDescription() {
        dis = "which are generating " + format(tmp.A.effect) + " Ascension Power/sec"
        return dis
    },
    passiveGeneration(){
        let passive = new Decimal(0)
        return passive
    },
    branches: ['Ab','kP'],
    row: 10, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "A", description: "Shift + a: Reset for Ascension", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('jP', 21) || player.A.unlocked},

    effect() {
        if (!player.A.unlocked)
            return new Decimal(0)
        let eff = Decimal.pow(this.effBase(), player.A.points).sub(1).max(0);
        return eff;
    },
    effBase() {
        let base = new Decimal(1.2);
        if (hasMilestone('kP', 13)) base = base.add(0.1);
        return base;
    },
    update(diff) {
        if (player.A.unlocked)
            player.A.power = player.A.power.plus(tmp.A.effect.times(diff));
        if (player.A.unlocked)
            player.A.passive = player.A.passive.plus(tmp.A.effect.times(diff).times(5));
        if (player.A.unlocked)
            player.A.boost = player.A.boost.plus(tmp.A.effect.times(diff).div(1.3));
    },
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            power: new Decimal(0),
            passive: new Decimal(0),
            boost: new Decimal(0),
        }
    },
    automate() {},
    autoPrestige() {return hasMilestone('kP', 11)},
    resetsNothing() {return hasMilestone('kP', 12)},
    powerExp() {
        let exp = new Decimal(1 / 4);
        if (hasUpgrade('A', 11)) exp = new Decimal(1 / 3);
        if (hasUpgrade('A', 21)) exp = new Decimal(2 / 3);
        if (hasUpgrade('A', 31)) exp = new Decimal(3 / 4);
        if (hasUpgrade('A', 41)) exp = exp.add(0.25);
        if (hasUpgrade('Ab', 11)) exp = exp.add(0.4);
        if (inChallenge('Ab', 11) || inChallenge('Ab', 12) || inChallenge('Ab', 21)) exp = exp.minus(1.1)
        return exp;
    },
    passiveExp() {
        let exp = new Decimal(1 / 3);
        if (hasUpgrade('A', 12)) exp = new Decimal(1 / 2);
        if (hasUpgrade('A', 22)) exp = new Decimal(6 / 10);
        if (hasUpgrade('A', 32)) exp = new Decimal(7 / 10);
        if (hasUpgrade('A', 42)) exp = new Decimal(15 / 13);
        return exp;
    },
    boostExp() {
        let exp = new Decimal(1 / 4);
        if (hasUpgrade('A', 13)) exp = new Decimal(1 / 3);
        if (hasUpgrade('A', 23)) exp = new Decimal(4 / 7);
        if (hasUpgrade('A', 33)) exp = new Decimal(4 / 5);
        if (hasUpgrade('A', 43)) exp = new Decimal(15.5 / 16);
        return exp;
    },
    powerEff() {
        if (!player.A.unlocked)
            return new Decimal(1);
        return player.A.power.plus(1).pow(this.powerExp());
    },
    passiveEff() {
        if (!player.A.unlocked)
            return new Decimal(1);
        return player.A.passive.plus(1).pow(this.passiveExp());
    },
    boostEff() {
        if (!player.A.unlocked)
            return new Decimal(1);
        return player.A.boost.plus(1).pow(this.boostExp());
    },
    tabFormat: ["main-display", "prestige-button",["display-text", function() {
        let func = ""
        if (player.A.points.gte(50)) func = 'Ascension Requirement is nerfed by ' + format(tmp.A.requires.div(150)) + 'x'
        if (player.A.points.gte(100)) func = 'Ascension Requirement is nerfed by ' + format(tmp.A.requires.div(150)) + 'x ((a*AP*MP*BP*)^0.9)<br> Your own Generation is against you...'
        if (player.A.points.gte(150)) func = 'Ascension Requirement is nerfed by ' + format(tmp.A.requires.div(150)) + 'x ((a*(AP*MP*BP)*(APE*MPE*BPE)*1e25)^0.95)<br> Your own Generation is truly against you...'
        if (player.A.points.gte(200)) func = 'Ascension Requirement is nerfed by ' + format(tmp.A.requires.div(150)) + 'x (((a*(AP*MP*BP)*(APE*MPE*BPE)*1e50)^1.2))^2<br> Your own Generation is truly against you...'
        if (player.A.points.gte(250)) func = 'Ascension Requirement is nerfed by ' + format(tmp.A.requires.div(150)) + 'x<br> (((a*(AP*MP*BP)*(APE*MPE*BPE)*1e100)^1.6))^2<br>'
        if (player.A.points.gte(300)) func = 'Ascension Requirement is nerfed by ' + format(tmp.A.requires.div(150)) + 'x<br> (((a*(AP*MP*BP)*(APE*MPE*BPE)*1e100)^1.6)^2)^log(a/1.6)<br>'
        if (player.A.points.gte(350)) func = 'Ascension Requirement is nerfed by ' + format(tmp.A.requires.div(150)) + 'x<br> ((log(points^0.1)^(a*(AP*MP*BP)*(APE*MPE*BPE)*1e100)^1.6)^2)^log(a/1.6)^(AbC_Effects)<br>Will this ever end?<br>'
        return func
    }
    , {}], "blank", ["display-text", function() {
        return 'You have ' + format(player.A.power) + ' Ascension Power, which boosts Buffed Prestige Point generation by ' + format(tmp.A.powerEff) + 'x'
    }
    , {}],["display-text", function() {
        let passive = 'You have ' + format(player.A.passive) + ' Meta Power, which boosts Passive Generation on all previous layers by +%' + format(tmp.A.passiveEff);
        if (inChallenge('Ab', 11) || inChallenge('Ab', 12) || inChallenge('Ab', 21)) passive = 'You have ' + format(player.A.passive) + ' Meta Power, which boosts Passive Generation on all previous layers by +%0.00';
        return passive
    }
    , {}],["display-text", function() {
        let boost = 'You have ' + format(player.A.boost) + ' Boost Power, which boosts all previous layers (Except Boosters & Generators) by ' + format(tmp.A.boostEff) + 'x'
        if (inChallenge('Ab', 11) || inChallenge('Ab', 12) || inChallenge('Ab', 21)) boost = 'You have ' + format(player.A.boost) + ' Boost Power, which boosts all previous layers (Except Boosters & Generators) by 1.00x'
        return boost
    }
    , {}], "blank", ["display-text", function() {
        return 'Your best Ascension Points is ' + formatWhole(player.A.best) + '<br>You have made a total of ' + formatWhole(player.A.total) + " Ascension Points."
    }
    , {}], "blank", "upgrades"],

    upgrades:{  
        11: {
            title: "Ascension Power Boost I",
            description: "AP Effect is better",
            cost: new Decimal(250),
            currencyDisplayName: "Ascension Power",
            currencyInternalName: "power",
            currencyLayer: "A",
        },
        12: {
            title: "Meta Power Boost I",
            description: "MP Effect is better",
            cost: new Decimal(1000),
            currencyDisplayName: "Meta Power",
            currencyInternalName: "passive",
            currencyLayer: "A",
        },
        13: {
            title: "Boost Power Boost I",
            description: "BP Effect is better",
            cost: new Decimal(2500),
            currencyDisplayName: "Boost Power",
            currencyInternalName: "boost",
            currencyLayer: "A",
        },
        21: {
            title: "Ascension Power Boost II",
            description: "AP Effect is better",
            cost: new Decimal(450000),
            currencyDisplayName: "Ascension Power",
            currencyInternalName: "power",
            currencyLayer: "A",
            unlocked() {return hasUpgrade('A', 11)},
        },
        22: {
            title: "Meta Power Boost II",
            description: "MP Effect is better",
            cost: new Decimal(3500000),
            currencyDisplayName: "Meta Power",
            currencyInternalName: "passive",
            currencyLayer: "A",
            unlocked() {return hasUpgrade('A', 12)},
        },
        23: {
            title: "Boost Power Boost II",
            description: "BP Effect is better",
            cost: new Decimal(150000),
            currencyDisplayName: "Boost Power",
            currencyInternalName: "boost",
            currencyLayer: "A",
            unlocked() {return hasUpgrade('A', 13)},
        },
        31: {
            title: "Ascension Power Boost III",
            description: "AP Effect is better",
            cost: new Decimal(5e13),
            currencyDisplayName: "Ascension Power",
            currencyInternalName: "power",
            currencyLayer: "A",
            unlocked() {return hasUpgrade('A', 21)},
        },
        32: {
            title: "Meta Power Boost III",
            description: "MP Effect is better",
            cost: new Decimal(2e14),
            currencyDisplayName: "Meta Power",
            currencyInternalName: "passive",
            currencyLayer: "A",
            unlocked() {return hasUpgrade('A', 22)},
        },
        33: {
            title: "Boost Power Boost III",
            description: "BP Effect is better",
            cost: new Decimal(1.2e13),
            currencyDisplayName: "Boost Power",
            currencyInternalName: "boost",
            currencyLayer: "A",
            unlocked() {return hasUpgrade('A', 23)},
        },
        41: {
            title: "Ascension Power Boost IV",
            description: "AP Effect is better also automate Generators",
            cost: new Decimal(1e22),
            currencyDisplayName: "Ascension Power",
            currencyInternalName: "power",
            currencyLayer: "A",
            unlocked() {return (hasUpgrade('A', 31) && player.A.points.gte(250)) || hasUpgrade('A', 41)},
        },
        42: {
            title: "Meta Power Boost IV",
            description: "MP Effect is better also automate CBoosters",
            cost: new Decimal(2e22),
            currencyDisplayName: "Meta Power",
            currencyInternalName: "passive",
            currencyLayer: "A",
            unlocked() {return (hasUpgrade('A', 32) && player.A.points.gte(250)) || hasUpgrade('A', 42)},
        },
        43: {
            title: "Boost Power Boost IV",
            description: "BP Effect is better also automate DBoosters",
            cost: new Decimal(7.5e21),
            currencyDisplayName: "Boost Power",
            currencyInternalName: "boost",
            currencyLayer: "A",
            unlocked() {return (hasUpgrade('A', 33) && player.A.points.gte(250)) || hasUpgrade('A', 43)},
        },
        51: {
            title: "Generative Buff",
            description: "1e30x Juggling Prestige Points",
            cost: new Decimal(145),
            currencyDisplayName: "Generators",
            currencyInternalName: "points",
            currencyLayer: "g",
            unlocked() {return (hasUpgrade('A', 41) && hasUpgrade('A', 42) && hasUpgrade('A', 43))},
        },
        61: {
            title: "Let's Continue",
            description: "Unlock the next layer",
            cost: new Decimal("1e450"),
            currencyDisplayName: "Juggling Prestige Points",
            currencyInternalName: "points",
            currencyLayer: "jP",
            unlocked() {return player.A.points.gte(350)},
        },
        },
})