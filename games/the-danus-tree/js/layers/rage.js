addLayer("r", {
    name: "Rage",
    symbol: "r",
    position: 1,
    startData() { return {
        unlocked: false,
		points: new Decimal(1),
        chance: new Decimal(0.1),
        time: new Decimal(10),
        rage: new Decimal(1),
    }},
    layerShown() { return player[this.layer].unlocked},
    color: "#F5FFFA",
    row: "4",
    resource: "rag",
    baseResource: "rag",
    autoPrestige() { return false },
    doReset(resettingLayer) {
        if(layers[resettingLayer].row <= this.row) return;
            let keep = []

            layerDataReset(this.layer, keep) 
    },
    resetsNothing() { return false },
    baseAmount() {return player["r"].points},
    type: "normal",
    tabFormat: [
        ["display-text", 
            function() { return "Rage: "+format(player[this.layer].rage) }
        ],
        "blank",
        ["bar", "11"],
        ["display-text",
            function() { 
                if (player["r"].rage.lte("1e1000")) return "unlock motivation points generation"
                if (player["r"].rage.lte("1e1000000") & player["r"].rage.gte("1e1000")) return "unlock yul points generation"
            }  
        ],
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
        return mult
    },
    directMult() {
        mult = new Decimal(1)
        return mult
    },
    bars: {
        11: {
            unlocked() { return true },
        direction: RIGHT,
        width: 600,
        height: 50,
        progress() {
            let data = player[this.layer]
            let limit = new Decimal("1e1000")
            if (player["r"].rage.gte("1e1000")) limit = new Decimal("1e1000000")
            return new Decimal(data.rage).add(1).log(new Decimal(limit))
        },
        },
    },
    canBuyMax() { return false },
    upgrades: {
        11: {
            unlocked() { return true },
            title: "raging power",
            description: "x2 to dublicate chance",
            cost: new Decimal(2),
            currencyInternalName() { return "rage" },
            currencyLocation() { return player[this.layer] },
            currencyDisplayName() { return "rage" },
        },
        12: {
            unlocked() { return hasUpgrade("r", 11)},
            title: "raging on prestige",
            description: "rage boosts prestige points",
            cost: new Decimal(5),
            effect() {
                return new Decimal(player[this.layer].rage).add(1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, 12))+"x" },
            currencyInternalName() { return "rage" },
            currencyLocation() { return player[this.layer] },
            currencyDisplayName() { return "rage" },
        },
        13: {
            unlocked() { return hasUpgrade("r", 12)},
            title: "boost transfer",
            description: "PP boosts rage",
            cost: new Decimal(10),
            effect() {
                let cap = new Decimal(1000)
                if (hasUpgrade("d", 51)) cap = cap.mul(upgradeEffect("d", 51))
                return new Decimal(player["p"].points).pow(1/10).add(1).min(cap)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, 13))+"x" },
            currencyInternalName() { return "rage" },
            currencyLocation() { return player[this.layer] },
            currencyDisplayName() { return "rage" },
        },
        14: {
            unlocked() { return hasUpgrade("r", 13)},
            title: "raging boss",
            description: "rage boosts mafia level",
            tooltip: "Вы более агрессивны на своих работников, они эффективнее работают",
            cost: new Decimal(50000),
            effect() {
                return new Decimal(player[this.layer].rage).pow(1/20).add(1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, 14))+"x" },
            currencyInternalName() { return "rage" },
            currencyLocation() { return player[this.layer] },
            currencyDisplayName() { return "rage" },
        },
        15: {
            unlocked() { return hasUpgrade("r", 14)},
            title: "raging dimitron",
            description: "rage boosts dimitron points and unlocks dimitron upgrade",
            tooltip: "Дима ограбил банк и его посадили. Вам больше не с кем играть в доту. Вы недовольны.",
            cost: new Decimal(1.5e20),
            effect() {
                return new Decimal(player[this.layer].rage).pow(1/20).add(1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, 15))+"x" },
            currencyInternalName() { return "rage" },
            currencyLocation() { return player[this.layer] },
            currencyDisplayName() { return "rage" },
        },
        21: {
            unlocked() { return hasUpgrade("r", 15)},
            title: "raging oscar",
            description: "rage boosts motivation points",
            tooltip: "Оскар снова сказал, что пойдёт в доту, но закончил своё приключение на унитазе. Вы недовольны.",
            cost: new Decimal(1e32),
            effect() {
                return new Decimal(player[this.layer].rage).add(1).min(1e100)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, 21))+"x" },
            currencyInternalName() { return "rage" },
            currencyLocation() { return player[this.layer] },
            currencyDisplayName() { return "rage" },
        },
        22: {
            unlocked() { return hasUpgrade("r", 21)},
            title: "raging in DOTA",
            description: "rage boosts MMR",
            tooltip: "Ваши тимейты делают хуйню. Вы недовольны",
            cost: new Decimal(1e75),
            effect() {
                return new Decimal((new Decimal(player[this.layer].rage).add(1)).log(1e5))
            },
            effectDisplay() { return format(upgradeEffect(this.layer, 22))+"x" },
            currencyInternalName() { return "rage" },
            currencyLocation() { return player[this.layer] },
            currencyDisplayName() { return "rage" },
        },
        23: {
            unlocked() { return hasUpgrade("r", 22)},
            title: "raging on yourself",
            description: "rage boosts Yuldash",
            tooltip: "Вы рейджите на себя. Бывает.",
            cost: new Decimal("1e305"),
            effect() {
                return player[this.layer].rage.add(1).log(1e305).add(1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, 23))+"x" },
            currencyInternalName() { return "rage" },
            currencyLocation() { return player[this.layer] },
            currencyDisplayName() { return "rage" },
        },
        24: {
            unlocked() { return hasUpgrade("r", 23)},
            title: "raging on raging",
            description: "rage boosts rage",
            tooltip: "Вы рейджите на рейдж. Стоп, что?",
            cost: new Decimal("6.66e666"),
            effect() {
                return player[this.layer].rage.pow(0.00038).min(100)
            },
            effectDisplay() { return "^"+format(upgradeEffect(this.layer, 24)) },
            currencyInternalName() { return "rage" },
            currencyLocation() { return player[this.layer] },
            currencyDisplayName() { return "rage" },
        },
        25: {
            unlocked() { return hasUpgrade("r", 24)},
            title: "rage reslt",
            description: "x10 MMR",
            tooltip: "Ваша ненависть наполняет вас и союзников. Вы выпускаете её во врагов.",
            cost: new Decimal("1e1100"),
            currencyInternalName() { return "rage" },
            currencyLocation() { return player[this.layer] },
            currencyDisplayName() { return "rage" },
        },
        31: {
            unlocked() { 
                if (hasUpgrade("r", 25) & !hasUpgrade("r", 31) & !tmp.z.tabFormat.ImmortalDraft.unlocked) return true
                else false
            },
            title: "Immortal draft",
            description: "Unlocks Immortal draft",
            tooltip: "Вы достигли ранга Титан",
            cost: new Decimal("1e10"),
            currencyInternalName() { return "MMR" },
            currencyLocation() { return player["z"] },
            currencyDisplayName() { return "MMR" },
            onPurchase() {
                let audio = new Audio("tp.wav")
                audio.volume = 0.1
                audio.play()
            },
        },
        32: {
            unlocked() { 
                if (new Decimal(player.z.micro).gte(22)) return true
                else false
            },
            title: "Danus",
            description: "Unlocks Danus(not currently in game)",
            cost: new Decimal("1e56000"),
            currencyInternalName() { return "rage" },
            currencyLocation() { return player[this.layer] },
            currencyDisplayName() { return "rage" },
            onPurchase() {
                let audio = new Audio("DanusUnlock.ogg")
                audio.volume = 0.5
                audio.play()
            },
        },
    },
    milestones: {
        0: {
            unlocked() { 
                if (hasMilestone("r", 0))  return true
                else return false
            },
            requirementDescription: "1e1000 rage",
            effectDescription: "generating motivation points",
            effect() {
                return new Decimal(player["r"].rage).log("1e1000").div(1e34)
            },
            done() { return player.r.rage.gte("1e1000") },
    },
    },
    update(diff) {
        let data = player[this.layer]
        let chance = data.chance
        if (hasUpgrade("r", 11)) chance = chance.mul(2)
        if (hasUpgrade("r", 13)) chance = chance.mul(upgradeEffect("r", 13))
        if (hasUpgrade("o", 41)) chance = chance.mul(upgradeEffect("o", 41))
        if (hasUpgrade("y", 32)) chance = chance.mul(upgradeEffect("y", 32))
        if (hasUpgrade("z", 31)) chance = chance.pow(1.5)
        if (hasUpgrade("r", 24)) chance = chance.pow(upgradeEffect("r", 24))
        let time = data.time
        if (hasUpgrade("z", 31)) time = time.div(upgradeEffect("z", 31))
        let basesoftcap = new Decimal(data.rage).pow(1/10).add(1)
        let add = new Decimal(data.rage).mul(new Decimal(chance).div(time).div(basesoftcap)).mul(diff)
        let softcapcap = new Decimal(3)
        if (hasUpgrade("r", 11)) softcapcap = new Decimal(6)
        if (hasUpgrade("r", 12)) softcapcap = new Decimal(12)
        if (hasUpgrade("r", 13)) softcapcap = new Decimal(20000)
        if (hasUpgrade("r", 14)) softcapcap = new Decimal(1.2e20)
        if (hasUpgrade("r", 15)) softcapcap = new Decimal(1e32)
        if (hasUpgrade("r", 21)) softcapcap = new Decimal(1e75)
        if (hasUpgrade("r", 22)) softcapcap = new Decimal("1e10000")
        if (hasUpgrade("r", 23)) softcapcap = new Decimal("1e10000")
        if (hasUpgrade("r", 24)) softcapcap = new Decimal("1e10000")
        if (hasUpgrade("r", 25)) softcapcap = new Decimal("1e1000000")
        let softcap = new Decimal(data.rage).div(softcapcap).add(1).pow(5)
        if ((new Decimal(data.rage).add(add)).gte(softcapcap)) {
            add = new Decimal(add).div(softcap)
            if (new Decimal(data.rage).lte(softcapcap)) data.rage = new Decimal(softcapcap)
        }
        data.rage = new Decimal(data.rage).add(add)
    },
})