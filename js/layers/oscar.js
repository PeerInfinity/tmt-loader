addLayer("o", {
    name: "Oscar",
    symbol: "o",
    position: 0,
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        setBuyableAmount: new Decimal(0)
    }},
    layerShown() { return player[this.layer].unlocked || new Decimal(player.w.points).gte(1e33) },
    color: "#D3D3D3",
    requires: new Decimal(1e37),
    row: "3",
    resource: "motivation points",
    baseResource: "minutes",
    autoPrestige() { return false },
    doReset(resettingLayer) {
        if(layers[resettingLayer].row <= this.row) return;
            let keep = []

            if (hasMilestone("y", 5)) keep.push("upgrades")
            if (hasMilestone("y", 5)) keep.push("milestones")

            layerDataReset(this.layer, keep) 
    },
    resetsNothing() { return false },
    baseAmount() {return player.w.points},
    type: "normal",
    exponent() {
        exponent = new Decimal(0.5)
        if (hasUpgrade("y", 23)) exponent = exponent.mul(1.1)
        return exponent
    },
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    directMult() {
        mult = new Decimal(1)
        mult = mult.times(buyableEffect("w", 13))
        if (hasUpgrade("y", 11)) mult = mult.times(100)
        if (hasUpgrade("r", 21)) mult = mult.times(upgradeEffect("r", 21))
        return mult
    },
    softcap() {
        return new Decimal(1e10)
    },
    passiveGeneration() {
        if (hasMilestone("r", 0)) return milestoneEffect("r", 0)
    },
    softcapPower() {
        let data = player["m"]
        let sc = new Decimal(0.05).plus(new Decimal(data.mafiaBarLevel).div(10000))
        if (hasUpgrade("o", 22)) sc = sc.div(10)
        return new Decimal(sc)
    },
    canBuyMax() { return false },
    upgrades: {
        11: {
            unlocked() {return true},
            title: "Start Oscar",
            description: "x10 to all currencies below oscar except IQ(buff to IQ only 3x)",
            cost: new Decimal(1),
        },
        12: {
            unlocked() {return hasUpgrade("o", 11)},
            title: "prestige prestiging",
            description: "All prestige pgrades with effects now more powerful",
            cost: new Decimal(1000),
        },
        13: {
            unlocked() {return hasUpgrade("o", 12)},
            title: "Bar, Bitch!",
            description: "bar complictaion 700 -> 400",
            cost: new Decimal(1e15),
        },
        14: {
            unlocked() {return hasUpgrade("o", 13)},
            title: "Mafia reflection",
            description: "Mafia level reduce softcap of oscar currency",
            cost: new Decimal(1e16),
        },
        15: {
            unlocked() {return hasUpgrade("o", 14)},
            title: "IQ test",
            description: "x5 to IQ and autobuys all buyables below dimitron",
            cost: new Decimal(1e22),
        },
        21: {
            unlocked() {return hasUpgrade("o", 15)},
            title: "Waiting Oscar",
            description: "Dimitron waits Oscar to play Dota 2",
            cost: new Decimal(1e22),
        },
        22: {
            unlocked() {return hasUpgrade("o", 15)},
            title: "Roblox power",
            description: "Roblox now harder to get but gives better boost and BOSS now also gives max levels to roblox",
            tooltip: "Вы реальный задр роблокса, и вы показываете как надо...",
            cost: new Decimal(1e23),
        },
        23: {
            unlocked() {return hasUpgrade("o", 15)},
            title: "Bar",
            description: "Bar complictaion 400 -> 100",
            cost: new Decimal(1e35),
        },
        24: {
            unlocked() {return hasUpgrade("o", 15)},
            title: "Bulk",
            description: "autobuys all buyables below Oscar and bulk it",
            cost: new Decimal(1e45),
        },
        25: {
            unlocked() {return hasUpgrade("o", 15)},
            title: "Prestige points?",
            description: "x1e5000000 to PP",
            cost: new Decimal(1e48),
        },
        31: {
            unlocked() {
                if (player.z.unlocked) return false
                else return hasUpgrade("o", 25)
            },
            title: "Dota 2",
            description: "Unlocks Dota 2",
            cost: new Decimal(1e88),
        },
        41: {
            unlocked() {
                if (player.r.unlocked) return true
            },
            title: "unrage",
            description: "motivation points boosts rage",
            effect() {      
                return new Decimal(player[this.layer].points).add(1).log(2)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, 41))+"x" },
            cost: new Decimal(1e140),
        },
    },
    milestones: {
        0: {
            unlocked() {return hasUpgrade("o", 13)},
            requirementDescription: "1e15 motivation points",
            effectDescription: "Gives 50% of seconds you will get on reset every second",
            done() { return player.o.points.gte(1e15) },
        },
        1: {
            unlocked() {return hasUpgrade("o", 22)},
            requirementDescription: "1e33 motivation points",
            effectDescription: "Gives 50% of minutes you will get on reset every second",
            done() { return player.o.points.gte(1e33) },
        },
    },
})