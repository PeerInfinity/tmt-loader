addLayer("y", {
    name: "Yuldash",
    symbol: "y",
    position: 0,
    startData() { return{
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0), 
        setBuyableAmount: new Decimal(0)
    }},
    layerShown() { return player[this.layer].unlocked || hasUpgrade("z", 25) },
    color: "#F5FFFA",
    requires: new Decimal(200),
    row: "4",
    resource: "Yul points",
    baseResource: "MMR",
    autoPrestige() { return false },
    doReset(resettingLayer) {
        if(layers[resettingLayer].row <= this.row) return;
            let keep = []

            layerDataReset(this.layer, keep) 
    },
    resetsNothing() { return false },
    baseAmount() {return player["z"].MMR},
    type: "normal",
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        "total",
        "blank",
        "upgrades",
        "blank",
        "buyables",
        "blank",
        "milestones",
        "blank",
    ],
    exponent() {
        exponent = 0.5
        return exponent
    },
    gainMult() {
        mult = new Decimal(1)
        if (hasUpgrade("r", 23)) mult = mult.mul(upgradeEffect("r", 23))
        return mult
    },
    directMult() {
        mult = new Decimal(1)
        return mult
    },
    canBuyMax() { return false },
    upgrades: {
        11: {
            unlocked() { return true },
            title: "Start Yuldash",
            description: "x100 to points, prestige points, money, seconds, minutes, motivation points, x5 to IQ, x2 to energy, x1.5 to play dota 2 speed and x1.2 to win chance",
            cost: new Decimal(1),
        },
        12: {
            unlocked() {
                if (hasUpgrade("y", 11)) return true
                else return false
            },
            title: "Harder games v4",
            description: "x4 to MMR Gain and x10 to needed energy for game",
            cost: new Decimal(1),
        },
        13: {
            unlocked() {
                if (hasUpgrade("y", 12)) return true
                else return false
            },
            title: "Harder games v5",
            description: "x4 to MMR Gain and x5 to needed energy for game",
            cost: new Decimal(2),
        },
        14: {
            unlocked() {
                if (hasUpgrade("y", 13)) return true
                else return false
            },
            title: "Harder games v6",
            description: "Harder games v3 is better",
            cost: new Decimal(5),
        },
        15: {
            unlocked() {
                if (hasUpgrade("y", 14)) return true
                else return false
            },
            title: "MMR Master",
            description: "+2 to base MMR",
            cost: new Decimal(7),
        },
        21: {
            unlocked() {
                if (hasUpgrade("y", 15)) return true
                else return false
            },
            title: "Energy booster",
            description: "boosts energy based on the difference of needed energy and current energy",
            effect() {
                let data = player["z"]
                let req = data.req
                if (hasUpgrade("z", 13)) req = new Decimal(req).times(5)
                if (hasUpgrade("z", 15)) req = new Decimal(req).times(5)
                if (hasUpgrade("z", 24)) req = new Decimal(req).times(5)
                if (hasUpgrade("y", 12)) req = new Decimal(req).times(10)
                if (hasUpgrade("y", 13)) req = new Decimal(req).times(10)
                if (hasUpgrade("y", 14) && hasUpgrade("z", 24)) req = new Decimal(req).times(50)
                eff = (req).div((data.energy).add(1)).pow(3).times(2).add(1)
                if (eff.lte(10)) return eff
                else return new Decimal(10)
            },
            effectDisplay() {
                return "x" + upgradeEffect("y", 21)+ " energy"
            },
            cost: new Decimal(10),
        },
        22: {
            unlocked() {
                if (hasUpgrade("y", 21)) return true
                else return false
            },
            title: "Mafia plays dota 2",
            description: "boosts MMR based on mafia level",
            cost: new Decimal(15),
            effect() {
                let data = player["m"]
                return new Decimal(data.mafiaLevel).pow_base(new Decimal(5000)).add(1)
            },
            effectDisplay() {
                return "x" + upgradeEffect("y", 22)+ " MMR"
            },
        },
        23: {
            unlocked() {
                if (hasUpgrade("y", 22)) return true
                else return false
            },
            title: "Legend of Dota",
            description: "x2 play speed, x1.1 win Chance, ^1.1 Motivation points",
            cost: new Decimal(30),
        },
        24: {
            unlocked() {
                if (hasUpgrade("y", 23)) return true
                else return false
            },
            title: "Megamind play",
            description: "MMR boosts IQ",
            effect() {
                let data = player["z"]
                eff = new Decimal((new Decimal(data.MMR).add(1)).pow(new Decimal(1).div(100000)).add(1))
                if (eff.lte(5)) return eff
                else return 5
            },
            effectDisplay() {
                return "x" + upgradeEffect("y", 24)+ " IQ"
            },
            cost: new Decimal(30),
        },
        25: {
            unlocked() {
                if (hasUpgrade("y", 24)) return true
                else return false
            },
            title: "Skill issue, bro :>",
            description: "x20 MMR",
            cost: new Decimal(30),
        },
        31: {
            unlocked() {
                if (hasUpgrade(this.layer, 31)) return false
                if (player.r.unlocked) return false
                else return hasUpgrade(this.layer, 25)
            },
            title: "Rage>",
            description: "unlocks rage",
            cost: new Decimal(100),
            onPurchase() {
                player.r.unlocked = "True"
                layerDataReset("y")
                layerDataReset("w")
                layerDataReset("d")
                layerDataReset("o")
                layerDataReset("z")
                layerDataReset("p")
                layerDataReset("m")
                layerDataReset("k")
                player.points = new Decimal(10)
            },
        },
        32: {
            unlocked() {
                if (hasUpgrade("r", 23)) return true
                else return false
            },
            title: "Yourself rage?",
            description: "Yul points boosts rage",
            tooltip: "Рейджить на себя странно в конце концов.",
            effect() {
                return player["y"].points.pow(2)
            },
            effectDisplay() {
                return "x" + upgradeEffect("y", 32)+ " rage"
            },
            cost: new Decimal(6000),
        },
        33: {
            unlocked() {
                if (hasUpgrade("z", 35) || player.y.points.gte(1e8) ) return true
                else return false
            },
            title: "Flash",
            description: "x1e6 energy",
            cost: new Decimal(200000000),
        },
        34: {
            unlocked() {
                if (hasUpgrade("y", 33) || player.y.points.gte(1e9) ) return true
                else return false
            },
            title: "Cybersport",
            description: "Skill boost MMR",
            cost: new Decimal(1e9),
            effect() {
                return new Decimal(2).pow(player.z.micro.add(player.z.macro))
            },
            effectDisplay() {
                return format(this.effect())+"x MMR"
            },
        },
        35: {
            unlocked() {
                if (player.z.micro.gte(18)) return true
                else return false
            },
            title: "Genius",
            description: "base MMR power x1.2",
            cost: new Decimal(1e12),
        },
        36: {
            unlocked() {
                if (hasUpgrade("y", 35) || player.y.points.gte(1e13) ) return true
                else return false
            },
            title: "Time being",
            description: "Your senses are heightened, time for you is value now",
            cost: new Decimal(5e12),
        },
    },
    milestones: {
        0: {
            unlocked() {return true },
            requirementDescription: "1 total yul points",
            effectDescription: "Keep prestige layer on yuldash",
            done() { return player.y.total.gte(1) },
        },
        1: {
            unlocked() {return true },
            requirementDescription: "2 total yul points",
            effectDescription: "Keep kirill layer on yuldash",
            done() { return player.y.total.gte(2) },
        },
        2: {
            unlocked() {
                if (hasMilestone("y", 1)) return true
                else return false
             },
            requirementDescription: "4 total yul points",
            effectDescription: "Keep money layer on yuldash",
            done() { return player.y.total.gte(4) },
        },
        3: {
            unlocked() {
                if (hasMilestone("y", 2)) return true
                else return false
             },
            requirementDescription: "9 total yul points",
            effectDescription: "Keep ddimitron layer on yuldash",
            done() { return player.y.total.gte(9) },
        },
        4: {
            unlocked() {
                if (hasMilestone("y", 3)) return true
                else return false
             },
            requirementDescription: "16 total yul points",
            effectDescription: "Keep waiting layer on yuldash",
            done() { return player.y.total.gte(16) },
        },
        5: {
            unlocked() {
                if (hasMilestone("y", 4)) return true
                else return false
             },
            requirementDescription: "40 total yul points",
            effectDescription: "Keep oscar layer on yuldash",
            done() { return player.y.total.gte(40) },
        },
        6: {
            unlocked() {
                if (hasMilestone("y", 5)) return true
                else return false
             },
            requirementDescription: "Signature hero(100 total yul points)",
            effectDescription: "Auto picking hero with 100% power",
            done() { return player.y.total.gte(100) },
        },
    },
})