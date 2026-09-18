addLayer("ab", {
    startData() { return {
        unlocked: true,
    }},
    color: "#C0C0C0",
    symbol: "⚙",
    row: "side",
    position: 0,
    name:"Autobuyers",
    tooltip: "Automation",
    layerShown() {return hasMilestone('one', 1) || hasAchievement('ach', 71)},
    tabFormat: [["display-text",
    function() { return '<h2>Automation</h2>' }], "clickables"],
    clickables: {
        11: {
            title: "Point Buyable",
            display(){
                let text = "Locked"
                if ((hasMilestone('one', 1)) && (!(player.zero.auto11))) text = "Off"
                if (hasMilestone('one', 1) && !(hasUpgrade('zero', 23))) text = "Unlock Point Buyable first!"
                if (hasMilestone('one', 1) && player.zero.auto11) text = "On"
                return text
            },
            unlocked() {return true},
            canClick() {return hasMilestone('one', 1) && hasUpgrade('zero', 23)},
            onClick() { player.zero.auto11 = !player.zero.auto11 },
            style: {"background-color"(){
                let color = "#666666"
                if (player.zero.auto11) color = "#808080"
                return color
            }},
        },
        12: {
            title: "Zero Buyable",
            display(){
                let text = "Locked"
                if ((hasMilestone('one', 3)) && (!(player.zero.auto12))) text = "Off"
                if (hasMilestone('one', 3) && !(hasUpgrade('zero', 42))) text = "Unlock Zero Buyable first!"
                if (hasMilestone('one', 3) && player.zero.auto12) text = "On"
                return text
            },
            unlocked() {return hasMilestone('one', 1)},
            canClick() {return hasMilestone('one', 3) && hasUpgrade('zero', 42)},
            onClick() { player.zero.auto12 = !player.zero.auto12 },
            style: {"background-color"(){
                let color = "#666666"
                if (player.zero.auto12) color = "#808080"
                return color
            }},
        },
        13: {
            title: "Zero Upgrades",
            display(){
                let text = "Locked"
                if ((hasMilestone('one', 5)) && (!(player.zero.autobuyupgrades))) text = "Off"
                if (hasMilestone('one', 5) && player.zero.autobuyupgrades) text = "On"
                return text
            },
            unlocked() {return hasMilestone('one', 3)},
            canClick() {return hasMilestone('one', 5)},
            onClick() { player.zero.autobuyupgrades = !player.zero.autobuyupgrades },
            style: {"background-color"(){
                let color = "#666666"
                if (player.zero.autobuyupgrades) color = "#808080"
                return color
            }},
        },
        14: {
            title: "One Upgrades",
            display(){
                let text = "Locked"
                if ((hasMilestone('two', 4)) && (!(player.one.autoupgrades))) text = "Off"
                if (hasMilestone('two', 4) && player.one.autoupgrades) text = "On"
                return text
            },
            unlocked() {return hasMilestone('one', 5)},
            canClick() {return hasMilestone('two', 4)},
            onClick() { player.one.autoupgrades = !player.one.autoupgrades },
            style: {"background-color"(){
                let color = "#666666"
                if (player.one.autoupgrades) color = "#8c8173"
                return color
            }},
        },
    },
})
addLayer("vo", {
    startData() { return {
        unlocked: true,
    }},
    color: "#008080",
    symbol: "💾",
    row: "side",
    position: 1,
    name:"Volatility",
    tooltip: "Volatility",
    layerShown() {return (hasUpgrade('one', 33) || hasAchievement('ach', 71)) || (player.vo.upgrades.length >= 1)},
    tabFormat: [["display-text",
    function() { return '<h2>Volatility Upgrades</h2>' }], "blank", "upgrades", ["display-text", () => "Non-Volatiling a layer will keep their content except resources and will passively gain their prestige reward."],],
    upgrades: {
        11: {
            title: "Volatility Upgrade A1",
            description: "Non-Volatile the first layer.",
            cost: new Decimal(1e10),
            currencyDisplayName: "ones",
            currencyInternalName: "points",
            currencyLayer: "one",
            effect() {
                return hasUpgrade(this.layer, this.id) ? "Non-Volatiled" : "Volatiled"
            },
            effectDisplay() {
                return upgradeEffect(this.layer, this.id)
            }
        },
    },
})
addLayer("ach", {
    name:"achievements",
    symbol: "★",
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    color: "#ADFF2F",
    resource: "Achievements",
    row: "side",
    position: 2,
    tabFormat: [["display-text",
    function() { return '<h2>Achievements</h2>' }], "main-display", "achievements"],
    achievements: {
        11: {
            name: "Start game",
            done() {return player.zero.points.gte("1")},
            goalTooltip: "Gain 1 zero.",
            doneTooltip: "Gain 1 zero. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        12: {
            name: "1 Row Done.",
            done() {return new Decimal (player.zero.upgrades.length).gte("5")},
            goalTooltip: "Buy 5 upgrades in the first layer. Reward: Unlock a new Row of upgrades.",
            doneTooltip: "Buy 5 upgrades in the first layer. Reward: Unlock a new Row of upgrades. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        13: {
            name: "Nice...",
            done() {return new Decimal (player.points).gte("69420")},
            goalTooltip: "Reach 69,420 Points.",
            doneTooltip: "Reach 69,420 Points. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        14: {
            name: "Buyable!",
            done() {return new Decimal (getBuyableAmount('zero', 11)).gte("5")},
            goalTooltip: "Buy 5 Point buyable with 8 zero upgrades. Reward: Unlock a new upgrade.",
            doneTooltip: "Buy 5 Point buyable with 8 zero upgrades. Reward: Unlock a new upgrade. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        15: {
            name: "2 Rows Done..",
            done() {return new Decimal (player.zero.upgrades.length).gte("10")},
            goalTooltip: "Buy 10 upgrades in the first layer.",
            doneTooltip: "Buy 10 upgrades in the first layer.(Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        21: {
            name: "Bored with the Buyable now?",
            done() {return (new Decimal (player.zero.upgrades.length).gte("10") && getBuyableAmount('zero', 11) >= 10)},
            goalTooltip: "Buy 10 Point Buyables with 10 zero upgrades. Reward: Unlock a new Row of upgrades.",
            doneTooltip: "Buy 10 Point Buyables with 10 zero upgrades. Reward: Unlock a new Row of upgrades. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        22: {
            name: "Nice^2",
            done() {return new Decimal (player.points).gte("4819136400")},
            effect() {
                let base = new Decimal(12.5)
                let basemult = new Decimal (1)
                let baseexpo = new Decimal (1)
                let eff = (Decimal.pow(base.mul(basemult), baseexpo))
                return eff
            },
            goalTooltip: "Reach 69,420^2 or about 4.82e9 points. Reward: Gain 12.5% more zeros",
            doneTooltip: "Reach 69,420^2 or about 4.82e9 points. Reward: Gain 12.5% more zeros (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        23: {
            name: "Too Much Buyable",
            done() {return (new Decimal (player.zero.upgrades.length).gte("13") && getBuyableAmount('zero', 11) >= 15)},
            goalTooltip: "Buy 15 Point Buyables with 13 zero upgrades. Reward: Unlock a upgrade.",
            doneTooltip: "Buy 15 Point Buyables with 13 zero upgrades. Reward: Unlock a upgrade. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        24: {
            name: "1e10 zeros is a lot",
            done() {return new Decimal (player.zero.total).gte("1e10")},
            goalTooltip: "Gain a total 1e10 zeros. Reward: Gain 20% More Zeros.",
            doneTooltip: "Gain a total 1e10 zeros. Reward: Gain 20% More Zeros. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        25: {
            name: "3 Rows Done...",
            done() {return new Decimal (player.zero.upgrades.length).gte("15")},
            goalTooltip: "Buy 15 upgrades in the first layer.",
            doneTooltip: "Buy 15 upgrades in the first layer. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        31: {
            name: "Finally a new Layer!",
            unlocked() {return player.one.total.gte("1") || hasAchievement(this.layer, this.id)},
            done() {return new Decimal (player.one.points).gte("1")},
            goalTooltip: "Gain 1 one. Reward: Gain 80% More Points.",
            doneTooltip: "Gain 1 one. Reward: Gain 80% More Points. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        32: {
            name: "Bad QoL lol",
            unlocked() {return player.one.total.gte("1") || hasAchievement(this.layer, this.id)},
            done() {return hasMilestone('one', 0)},
            goalTooltip: "Gain 1 ones milestone.",
            doneTooltip: "Gain 1 ones milestone. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        33: {
            name: "Explorer",
            unlocked() {return player.one.total.gte("1") || hasAchievement(this.layer, this.id)},
            done() {return new Decimal (player.one.upgrades.length).gte("4")},
            goalTooltip: "Buy 4 upgrades in the second layer.",
            doneTooltip: "Buy 4 upgrades in the second layer. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        34: {
            name: "4 Rows Done....",
            unlocked() {return player.one.total.gte("1") || hasAchievement(this.layer, this.id)},
            done() {return new Decimal (player.one.upgrades.length).gte("5")},
            goalTooltip: "Buy 5 upgrades in the second layer. Reward: Self Boost now based on best amount and multiply its effect by 1.25",
            doneTooltip: "Buy 5 upgrades in the second layer. Reward: Self Boost now based on best amount and multiply its effect by 1.25 (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        35: {
            name: "5 Rows Done.....",
            unlocked() {return player.one.total.gte("1") || hasAchievement(this.layer, this.id)},
            done() {return new Decimal (player.zero.upgrades.length).gte("20")},
            goalTooltip: "Buy 20 upgrades in the first layer. Reward: Base Increaser Increaser now based on best amount and multiply its effect by 1.125",
            doneTooltip: "Buy 20 upgrades in the first layer. Reward: Base Increaser Increaser now based on best amount and multiply its effect by 1.125 (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        41: {
            name: "Automation!",
            unlocked() {return player.one.total.gte("1") || hasAchievement(this.layer, this.id)},
            done() {return hasMilestone('one', 1)},
            goalTooltip: "Unlock Automation.",
            doneTooltip: "Unlock Automation. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        42: {
            name: "Cool QoL",
            unlocked() {return player.one.total.gte("1") || hasAchievement(this.layer, this.id)},
            done() {return hasMilestone('one', 2)},
            goalTooltip: "Gain 3 one milestone.",
            doneTooltip: "Gain 3 one milestone. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        43: {
            name: "New Generation",
            unlocked() {return player.one.total.gte("1") || hasAchievement(this.layer, this.id)},
            done() {return hasUpgrade('one', 21)},
            goalTooltip: "Unlock Generators.",
            doneTooltip: "Unlock Generators. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        44: {
            name: "Start the Generator",
            unlocked() {return (player.one.total.gte("1") && hasAchievement(this.layer, 43)) || hasAchievement(this.layer, this.id)},
            done() {return new Decimal (getBuyableAmount('one', 11)).gte(1)},
            goalTooltip: "Buy a Power Generator 1.",
            doneTooltip: "Buy a Power Generator 1. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        45: {
            name: "Powered Up",
            unlocked() {return (player.one.total.gte("1") && hasAchievement(this.layer, 43)) || hasAchievement(this.layer, this.id)},
            done() {return new Decimal (player.one.genpow).gte(1)},
            goalTooltip: "Generate 1 GP<sub>1</sub>.",
            doneTooltip: "Generate 1 GP<sub>1</sub>. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        51: {
            name: "Inflation?",
            unlocked() {return (player.one.total.gte("1") && hasAchievement(this.layer, 43)) || hasAchievement(this.layer, this.id)},
            done() {return upgradeEffect('zero', 12).gte(1e10)},
            goalTooltip: "<b>Zero Boost?</b>'s Effect goes to 1e10x.",
            doneTooltip: "<b>Zero Boost?</b>'s Effect goes to 1e10x. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        52: {
            name: "100 ones is a lot - JeehanMoment",
            unlocked() {return (player.one.total.gte("1") && hasAchievement(this.layer, 43)) || hasAchievement(this.layer, this.id)},
            done() {return new Decimal (getBuyableAmount('one', 12)).gte(1)},
            goalTooltip: "Buy a Power Generator 2.",
            doneTooltip: "Buy a Power Generator 2. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        53: {
            name: "Accelerate.",
            unlocked() {return (player.one.total.gte("1") && hasAchievement(this.layer, 43)) || hasAchievement(this.layer, this.id)},
            done() {return new Decimal (getBuyableAmount('one', 31)).gte(1)},
            goalTooltip: "Buy an Accelerator.",
            doneTooltip: "Buy an Accelerator. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        54: {
            name: "Illuminati Confirmed!",
            unlocked() {return (player.one.total.gte("1") && hasAchievement(this.layer, 43)) || hasAchievement(this.layer, this.id)},
            done() {return new Decimal (getBuyableAmount('one', 13)).gte(1)},
            goalTooltip: "Buy a Power Generator 3.",
            doneTooltip: "Buy a Power Generator 3. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        55: {
            name: "6 Rows Done......",
            unlocked() {return (player.one.total.gte("1") && hasAchievement(this.layer, 43)) || hasAchievement(this.layer, this.id)},
            done() {return new Decimal (player.one.upgrades.length).gte("10")},
            goalTooltip: "Buy 10 upgrades in the second layer.",
            doneTooltip: "Buy 10 upgrades in the second layer. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        61: {
            name: "POWERRR",
            unlocked() {return (player.one.total.gte("1e10") && hasAchievement(this.layer, 43)) || hasAchievement(this.layer, this.id)},
            done() {return new Decimal (player.one.genpow).gte(1e10)},
            goalTooltip: "Generate 1e10 GP<sub>1</sub>.",
            doneTooltip: "Generate 1e10 GP<sub>1</sub>. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        62: {
            name: "Squared Power!",
            unlocked() {return (player.one.total.gte("1") && hasAchievement(this.layer, 43)) || hasAchievement(this.layer, this.id)},
            done() {return new Decimal (getBuyableAmount('one', 14)).gte(1)},
            goalTooltip: "Buy a Power Generator 4.",
            doneTooltip: "Buy a Power Generator 4. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        63: {
            name: "Penta Genetaion",
            unlocked() {return (player.one.total.gte("1") && hasAchievement(this.layer, 43)) || hasAchievement(this.layer, this.id)},
            done() {return new Decimal (getBuyableAmount('one', 15)).gte(1)},
            goalTooltip: "Buy a Power Generator 5.",
            doneTooltip: "Buy a Power Generator 5. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        64: {
            name: "Googol zeros = Googolplex???",
            unlocked() {return (player.one.total.gte("1") && hasAchievement(this.layer, 43)) || hasAchievement(this.layer, this.id)},
            done() {return new Decimal (player.zero.total).gte("1e100")},
            goalTooltip: "Gain a total 1e100 zeros.",
            doneTooltip: "Gain a total 1e100 zeros. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        65: {
            name: "Cool Feature",
            unlocked() {return (player.one.total.gte("1") && hasAchievement(this.layer, 43)) || hasAchievement(this.layer, this.id)},
            done() {return hasUpgrade('vo', 11)},
            goalTooltip: "Volatile the first layer.",
            doneTooltip: "Volatile the first layer. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        71: {
            name: "Another New Layer?",
            unlocked() {return (player.two.total.gte("1") && hasAchievement(this.layer, 71)) || hasAchievement(this.layer, this.id)},
            done() {return player.two.total.gte("1")},
            goalTooltip: "Gain 1 two.",
            doneTooltip: "Gain 1 two. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        72: {
            name: "7 Rows Done?",
            unlocked() {return (player.two.total.gte("1") && hasAchievement(this.layer, 71)) || hasAchievement(this.layer, this.id)},
            done() {return new Decimal(player.two.upgrades.length).gte("5")},
            goalTooltip: "Buy 5 two upgrades.",
            doneTooltip: "Buy 5 two upgrades. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        73: {
            name: "Exploded",
            unlocked() {return (player.two.total.gte("1") && hasMilestone('two', 1) && hasAchievement(this.layer, 71)) || hasAchievement(this.layer, this.id)},
            done() {return new Decimal(player.two.bombsandbricks.bombused).gte("1")},
            goalTooltip: "Use a bomb.",
            doneTooltip: "Use a bomb. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        74: {
            name: "BRICC",
            unlocked() {return (player.two.total.gte("1") && hasMilestone('two', 1) && hasAchievement(this.layer, 71)) || hasAchievement(this.layer, this.id)},
            done() {return new Decimal(player.two.bombsandbricks.points).gte("1")},
            goalTooltip: "Collect a brick.",
            doneTooltip: "Collect a brick. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        75: {
            name: "To the Infinity Zeros?",
            unlocked() {return (player.two.total.gte("1") && hasMilestone('two', 1) && hasAchievement(this.layer, 71)) || hasAchievement(this.layer, this.id)},
            done() {return new Decimal(player.zero.points).gte("1.8e308")},
            goalTooltip: "Gain ~1.8e308 zeros.",
            doneTooltip: "Gain ~1.8e308 zeros. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        81: {
            name: "Discovery",
            unlocked() {return (player.two.total.gte("1") && hasMilestone('two', 1) && hasAchievement(this.layer, 71)) || hasAchievement(this.layer, this.id)},
            done() {return new Decimal(getBuyableAmount('one', 32)).gte("1")},
            goalTooltip: "Discover a new Generator.",
            doneTooltip: "Discover a new Generator. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        82: {
            name: "Demonic Six",
            unlocked() {return (player.two.total.gte("1") && hasMilestone('two', 1) && hasAchievement(this.layer, 71)) || hasAchievement(this.layer, this.id)},
            done() {return new Decimal(getBuyableAmount('one', 21)).gte("1")},
            goalTooltip: "Buy a Power Generator 6.",
            doneTooltip: "Buy a Power Generator 6. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        83: {
            name: "Heavenly Seven",
            unlocked() {return (player.two.total.gte("1") && hasMilestone('two', 1) && hasAchievement(this.layer, 71)) || hasAchievement(this.layer, this.id)},
            done() {return new Decimal(getBuyableAmount('one', 22)).gte("1")},
            goalTooltip: "Buy a Power Generator 7.",
            doneTooltip: "Buy a Power Generator 7. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        84: {
            name: "Octacore",
            unlocked() {return (player.two.total.gte("1") && hasMilestone('two', 1) && hasAchievement(this.layer, 71)) || hasAchievement(this.layer, this.id)},
            done() {return new Decimal(getBuyableAmount('one', 23)).gte("1")},
            goalTooltip: "Buy a Power Generator 8.",
            doneTooltip: "Buy a Power Generator 8. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        85: {
            name: "8 Rows Done?",
            unlocked() {return (player.two.total.gte("1") && hasMilestone('two', 1) && hasAchievement(this.layer, 71)) || hasAchievement(this.layer, this.id)},
            done() {return new Decimal(player.two.upgrades.length).gte("10")},
            goalTooltip: "Buy 10 two upgrades.",
            doneTooltip: "Buy 10 two upgrades. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        91: {
            name: "Nine Circles",
            unlocked() {return (player.two.total.gte("1") && hasMilestone('two', 1) && hasAchievement(this.layer, 71)) || hasAchievement(this.layer, this.id)},
            done() {return new Decimal(getBuyableAmount('one', 24)).gte("1")},
            goalTooltip: "Buy a Power Generator 9.",
            doneTooltip: "Buy a Power Generator 9. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        92: {
            name: "A lot of Bricks",
            unlocked() {return (player.two.total.gte("1") && hasMilestone('two', 1) && hasAchievement(this.layer, 71)) || hasAchievement(this.layer, this.id)},
            done() {return new Decimal(player.two.bombsandbricks.points).gte("1e10")},
            goalTooltip: "Gain 1e10 bricks.",
            doneTooltip: "Gain 1e10 bricks. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        93: {
            name: "That's Overpower",
            unlocked() {return (player.two.total.gte("1") && hasMilestone('two', 1) && hasAchievement(this.layer, 71)) || hasAchievement(this.layer, this.id)},
            done() {return new Decimal(player.one.Generators.genpow).gte("1e100")},
            goalTooltip: "Buy 1e100 GP<sub>1</sub>.",
            doneTooltip: "Buy 1e100 GP<sub>1</sub>. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        94: {
            name: "The last one of kind",
            unlocked() {return (player.two.total.gte("1") && hasMilestone('two', 1) && hasAchievement(this.layer, 71)) || hasAchievement(this.layer, this.id)},
            done() {return new Decimal(getBuyableAmount('one', 25)).gte("1")},
            goalTooltip: "Buy a Power Generator 10.",
            doneTooltip: "Buy a Power Generator 10. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        95: {
            name: "Endgame of V.1.2.1",
            unlocked() {return (player.two.total.gte("1") && hasMilestone('two', 1) && hasAchievement(this.layer, 71)) || hasAchievement(this.layer, this.id)},
            done() {return new Decimal(player.two.points).gte("1e5")},
            goalTooltip: "Gain 1e5 twos.",
            doneTooltip: "Gain 1e5 twos. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
    }
})
addLayer("sa", {
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    color: "#800080",
    resource: "Secret Achievements", 
    symbol: "☆",
    row: "side",
    position: 3,
    layerShown(){return player[this.layer].best.gt(0)},
    tabFormat: [["display-text",
    function() { return '<h2>Secret Achievements</h2>' }], "main-display", "achievements"],
    achievements: {
        11: {
            name: "Unlock Secret Achievents!",
            done() {return player[this.layer].points.gte("1")},
            goalTooltip: "??? Reward: ???",
            doneTooltip: "Complete 1 Secret Achievements. Reward: Unlock Secret Achievements.",
        },
        21: {
            name: "Not a New One :/",
            unlocked() {return hasAchievement(this.layer, this.id)},
            done() {return (player.zero.points.gte(1e10) && player.one.best.gte(1)) && !hasUpgrade('zero', 35)},
            goalTooltip: "???",
            doneTooltip: "Be able to do a ones reset without "+'"Base 2"'+" Upgrade. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        22: {
            name: "Idling is useless anyways.",
            unlocked() {return hasAchievement(this.layer, this.id)},
            done() {return (!(hasUpgrade('zero', 13)) && !(hasUpgrade('zero', 14)) && !(hasUpgrade('zero', 22)) && (player.zero.points.gte(1e10) && player.one.best.gte(1)))},
            goalTooltip: "???",
            doneTooltip: "Be able to do a ones reset without "+'"Pointed Generation", "Reversed Boost", "Time Boost"'+" Upgrades. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        23: {
            name: "Buyables are useless anyways.",
            unlocked() {return hasAchievement(this.layer, this.id)},
            done() {return (getBuyableAmount('zero', 11).eq(0) && getBuyableAmount('zero', 12).eq(0)) && (player.zero.points.gte(1e10) && player.one.best.gte(1))},
            goalTooltip: "???",
            doneTooltip: "Be able to do a ones reset without any buyables. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
        24: {
            name: "Forever Haha",
            unlocked() {return hasAchievement(this.layer, this.id)},
            done() {return player.one.Generators.timespent.gte(3600)},
            goalTooltip: "???",
            doneTooltip: "Let your Generator minigame time exceed 1 hours. (Completed)",
            onComplete() {player[this.layer].points = player[this.layer].points.add(1)}
        },
    },
},
)
addLayer("zero", {
    name: "zero", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "0", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        auto11: false,
        auto12: false,
        autobuyupgrades: false,
		points: new Decimal (0),
    }},
    color: "#808080",
    requires: new Decimal (10), // Can be a function that takes requirement increases into account
    resource: "zeros", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    doReset(layer) {

        if (!(layers[layer].row > this.row)) return
        
        let keep = ["auto11", "auto12", "autobuyupgrades"]
        if (hasUpgrade('vo', 11)) keep.push("upgrades", "buyables")
        
        layerDataReset(this.layer, keep)
        
        },
    hotkeys: [
            {
                key: "0", // What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" for holding down ctrl.
                description: "0: reset your points for zeros", // The description of the hotkey that is displayed in the game's How To Play tab
                onPress() { if (player.zero.unlocked) doReset("zero") },
                unlocked() {return true} // Determines if you can use the hotkey, optional
            },
        ],
    tabFormat: {
        "Upgrades": {
            unlocked(){return true},
            content:[
                "main-display",
                "blank",
                ["prestige-button",function(){return ""}],
                "blank",
                "resource-display",
                "blank",
                "blank",
                "upgrades"
            ]
        },
        "Buyables": {
            unlocked(){return (hasUpgrade('zero', 23) || hasUpgrade('zero', 42))},
            content:[
                "main-display",
                "blank",
                ["prestige-button",function(){return ""}],
                "blank",
                "resource-display",
                "blank",
                "blank",
                "clickables",
                "buyables"
            ]
        },
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        // Zero Layer Boosts
        if(hasUpgrade('zero', 14)) mult = mult.times(upgradeEffect('zero', 14))
        if(hasUpgrade('zero', 21)) mult = mult.times(upgradeEffect('zero', 21))
        if(hasUpgrade('zero', 25)) mult = mult.times(upgradeEffect('zero', 25))
        if(hasUpgrade('zero', 31)) mult = mult.times(upgradeEffect('zero', 31))
        if(hasUpgrade('zero', 35)) mult = mult.times(upgradeEffect('zero', 35))
        if(hasUpgrade('zero', 44)) mult = mult.times(upgradeEffect('zero', 44))
        mult = mult.times(buyableEffect('zero', 12))
        // One Layer Boosts
        if(hasUpgrade('one', 14)) mult = mult.times(upgradeEffect('one', 14))
        if(hasUpgrade('one', 15)) mult = mult.times(upgradeEffect('one', 15).z)
        if(hasUpgrade('one', 23)) mult = mult.times(upgradeEffect('one', 23))
        if(hasUpgrade('one', 31)) mult = mult.times(upgradeEffect('one', 31))
        if(hasUpgrade('one', 32)) mult = mult.times(upgradeEffect('one', 32))
        if (hasAchievement('ach', 21)) mult = mult.times(new Decimal (112.5).div(100))
        if (hasAchievement('ach', 24)) mult = mult.times(new Decimal (120).div(100))
        mult = mult.times(tmp.one.GetGenPowEff)
        if (hasMilestone('one', 0)) mult = mult.times(tmp.one.GetBoostIEff)
        // Two Layer Boosts
        mult = mult.times(tmp.two.GetBricksEff)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},
    automate(){
        // UPGRADES
        if (player.zero.autobuyupgrades && hasMilestone('one', 5)) {
            buyUpgrade(this.layer, 11)
            buyUpgrade(this.layer, 12)
            buyUpgrade(this.layer, 13)
            buyUpgrade(this.layer, 14)
            buyUpgrade(this.layer, 15)
            buyUpgrade(this.layer, 21)
            buyUpgrade(this.layer, 22)
            buyUpgrade(this.layer, 23)
            buyUpgrade(this.layer, 24)
            buyUpgrade(this.layer, 25)
            buyUpgrade(this.layer, 31)
            buyUpgrade(this.layer, 32)
            buyUpgrade(this.layer, 33)
            buyUpgrade(this.layer, 34)
            buyUpgrade(this.layer, 35)
            buyUpgrade(this.layer, 41)
            buyUpgrade(this.layer, 42)
            buyUpgrade(this.layer, 43)
            buyUpgrade(this.layer, 44)
            buyUpgrade(this.layer, 45)
        }

        // BUYABLES
        if (player.zero.auto11 && hasUpgrade('zero', 23)) {buyBuyable(this.layer, 11)}
        if (player.zero.auto12 && hasUpgrade('zero', 42)) {buyBuyable(this.layer, 12)}
    },
    passiveGeneration() {
        let passivebase = 0
        if (hasUpgrade('vo', 11)) passivebase = 1
        return passivebase
    },
    upgrades: {
        11: {
            title: "Double Fun",
            description: "Double your point gain.",
            cost: new Decimal (1),
            unlocked() {
                return (player.zero.total.gte(1) || hasMilestone('one', 0))
            },
            effect() {
                let base = new Decimal (2)
                if(hasUpgrade('zero', 34)) base = base.add(upgradeEffect('zero', 34))
                let expo = new Decimal (1)
                let eff = base.pow(expo)
                if (hasUpgrade('two', 12)) eff = eff.pow(upgradeEffect('two', 12))
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x"
            }
        },
        12: {
            title: "Zero Boost?",
            description: "Boost point gain based on zeros.",
            cost: new Decimal (2),
            unlocked() {
                return (hasUpgrade('zero', 11) || hasMilestone('one', 0))
            },
            effect() {
                let base = player.zero.points.add(2)
                if (hasUpgrade('zero', 45)) base = player.zero.best.add(2)
                let expo = new Decimal (0.4)
                let eff = base.pow(expo)
                if(hasUpgrade('zero', 32)) eff = eff.times(upgradeEffect('zero', 32))
                if(hasUpgrade('zero', 45)) eff = eff.times(upgradeEffect('zero', 45))
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x"
            }
        },
        13: {
            title: "Pointed Generation",
            description: "Boost point gain based on points.",
            cost: new Decimal (5),
            unlocked() {
                return (hasUpgrade('zero', 12) || hasMilestone('one', 0))
            },
            effect() {
                let base = player.points.add(1)
                let log = new Decimal(10)
                if (hasUpgrade('zero', 41)) log = new Decimal (9.5)
                let expo = new Decimal (0.6)
                if (hasUpgrade('zero', 41)) expo = new Decimal (0.64)
                let eff = base.log(log).add(1).pow(expo)
                if (hasUpgrade('zero', 41)) eff = eff.mul(2)
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x"
            }
        },
        14: {
            title: "Reversed Boost",
            description: "Boost zeros gain based on points.",
            cost: new Decimal (20),
            unlocked() {
                return (hasUpgrade('zero', 13) || hasMilestone('one', 0))
            },
            effect() {
                let base = player.points.add(1)
                let log = new Decimal(10)
                if (hasUpgrade('zero', 43)) log = new Decimal (9.5)
                let expo = new Decimal (0.45)
                if (hasUpgrade('zero', 43)) expo = new Decimal (0.5)
                let eff = base.log(log).add(1).pow(expo)
                if (hasUpgrade('zero', 43)) eff = eff.mul(1.25)
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x"
            }
        },
        15: {
            title: "Upgrader",
            description: "Boost point gain based on bought zero upgrades.",
            cost: new Decimal (75),
            unlocked() {
                return (hasUpgrade('zero', 14) || hasMilestone('one', 0))
            },
            effect() {
                let base = new Decimal (player.zero.upgrades.length).add(2)
                let expo = new Decimal (1.25)
                let eff = base.pow(expo)
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x"
            }
        },
        21: {
            title: "Self Boost",
            description: "Boost zeros gain based on zeros.",
            cost: new Decimal (250),
            unlocked() {
                return (hasUpgrade('zero', 15) || hasMilestone('one', 0))
            },
            effect() {
                let base = player.zero.points.add(2)
                if (hasAchievement('ach', 34)) base = player.zero.best.add(2)
                let expo = new Decimal (0.24)
                let eff = base.pow(expo)
                if (hasAchievement('ach', 34)) eff = eff.mul(1.25)
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x"
            }
        },
        22: {
            title: "Time Boost",
            description: "Boost point gain based on time played.",
            cost: new Decimal (1250),
            unlocked() {
                return (hasUpgrade('zero', 21) || hasMilestone('one', 0))
            },
            effect() {
                let base = new Decimal (player.timePlayed).div(300).add(1)
                let expo = new Decimal (0.25)
                let eff = base.pow(expo)
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x"
            }
        },
        23: {
            title: "Buyable",
            description: "Unlock a buyable.",
            cost: new Decimal (5e3),
            unlocked() {
                return (hasUpgrade('zero', 22) || hasMilestone('one', 0))
            },
        },
        24: {
            title: "Base Increaser",
            description: "Increase point gain base by 1.5",
            cost: new Decimal (5e4),
            unlocked() {
                return ((hasUpgrade('zero', 23) && hasAchievement('ach', 14)) || hasMilestone('one', 0))
            },
            effect() {
                let base = new Decimal (1.5)
                if(hasUpgrade('zero', 33)) base = base.add(upgradeEffect('zero', 33))
                let expo = new Decimal (1)
                let eff = base.pow(expo)
                return eff
            },
            effectDisplay() {
                return "+" + format(upgradeEffect(this.layer, this.id))
            }
        },
        25: {
            title: "More!",
            description: "Gain 10% more zeros.",
            cost: new Decimal (2.5e5),
            unlocked() {
                return (hasUpgrade('zero', 24) || hasMilestone('one', 0))
            },
            effect() {
                let base = new Decimal (0.1)
                let expo = new Decimal (1)
                let eff = base.pow(expo).add(1)
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x"
            }
        },
        31: {
            title: "Achievement Boost!",
            description: "Gain more zeros based on completed achievements.",
            cost: new Decimal (1e7),
            unlocked() {
                return ((hasUpgrade('zero', 25) && hasAchievement('ach', 21)) || hasMilestone('one', 0))
            },
            effect() {
                let base = player.ach.points.add(2)
                let expo = new Decimal (0.6)
                let eff = base.pow(expo)
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x"
            }
        },
        32: {
            title: "Self Zero Boost",
            description: "<b>Zero Boost?</b> effect is boosted based on itself.",
            cost: new Decimal (2.56e7),
            unlocked() {
                return (hasUpgrade('zero', 31) || hasMilestone('one', 0))
            },
            effect() {
                let base = new Decimal(upgradeEffect(this.layer, 12))
                let log = new Decimal(10)
                let expo = new Decimal (0.125)
                let eff = base.log(log).add(1).pow(expo)
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x"
            }
        },
        33: {
            title: "Base Increaser Increaser",
            description: "<b>Base Increaser</b> Base is boosted based on logarithm of zero.",
            cost: new Decimal (1.25e8),
            unlocked() {
                return (hasUpgrade('zero', 32) || hasMilestone('one', 0))
            },
            effect() {
                let base = player[this.layer].points.add(1).log(10).add(1)
                if (hasAchievement('ach', 35)) base = player[this.layer].best.add(1).log(10).add(1)
                let expo = new Decimal (0.32)
                let eff = base.pow(expo)
                if (hasAchievement('ach', 35)) eff = eff.mul(1.125)
                return eff
            },
            effectDisplay() {
                return "+" + format(upgradeEffect(this.layer, this.id))
            }
        },
        34: {
            title: "Upgrader II",
            description: "<b>Double Fun</b> base is boosted based on bought zero upgrades.",
            cost: new Decimal (1e9),
            unlocked() {
                return ((hasUpgrade('zero', 33) && hasAchievement('ach', 23)) || hasMilestone('one', 0))
            },
            effect() {
                let base = new Decimal (player.zero.upgrades.length).add(2)
                let expo = new Decimal (0.32)
                let eff = base.pow(expo)
                return eff
            },
            effectDisplay() {
                return "+" + format(upgradeEffect(this.layer, this.id))
            }
        },
        35: {
            title: "Base 2",
            description: "Gain 69% more zeros and unlock a new layer.",
            cost: new Decimal (6e9),
            unlocked() {
                return (hasUpgrade('zero', 34) || hasMilestone('one', 0))
            },
            effect() {
                let base = new Decimal (69)
                let expo = new Decimal (1)
                let eff = base.pow(expo).add(100).div(100)
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x"
            }
        },
        41: {
            title: "Enhanced",
            description: "<b>Point Generation</b> uses a better formula. (log<sub>10</sub>(x+1)+1)<sup>0.6</sup> -> (log<sub>9.5</sub>(x+1)+1)<sup>0.64</sup>*2",
            cost: new Decimal (2.5e11),
            unlocked() {
                return ((hasUpgrade('zero', 35) && hasUpgrade('one', 14)) || (hasMilestone('one', 1) && hasMilestone('one', 6)))
            },
        },
        42: {
            title: "Buyable II",
            description: "Unlock a new Buyable.",
            cost: new Decimal (1.96e12),
            unlocked() {
                return ((hasUpgrade('zero', 41) && hasUpgrade('one', 14)) || (hasMilestone('one', 1) && hasMilestone('one', 6)))
            },
        },
        43: {
            title: "Enhanced II",
            description: "<b>Reversed Boost</b> uses a better formula. (log<sub>10</sub>(x+1)+1)<sup>0.45</sup> -> (log<sub>9.5</sub>(x+1)+1)<sup>0.5</sup>*1.25",
            cost: new Decimal (1e15),
            unlocked() {
                return ((hasUpgrade('zero', 42) && hasUpgrade('one', 14)) || (hasMilestone('one', 1) && hasMilestone('one', 6)))
            },
        },
        44: {
            title: "Another Time Boost",
            description: "<b>Time Boost</b> also boost zero gain at a reduced rate.",
            cost: new Decimal (3.6e19),
            unlocked() {
                return ((hasUpgrade('zero', 43) && hasUpgrade('one', 14)) || (hasMilestone('one', 1) && hasMilestone('one', 6)))
            },
            effect() {
                let base = upgradeEffect('zero', 22)
                let expo = new Decimal (0.6)
                let eff = base.pow(expo).mul(1.2)
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x"
            }
        },
        45: {
            title: "Less Risky",
            description: "<b>Zero Boost?</b> now Based on Best zeros and multiply its effect by 1.1",
            cost: new Decimal (2.22e22),
            unlocked() {
                return ((hasUpgrade('zero', 44) && hasUpgrade('one', 14)) || (hasMilestone('one', 1) && hasMilestone('one', 6)))
            },
            effect() {
                let base = new Decimal (1.1)
                let expo = new Decimal (1)
                let eff = base.pow(expo)
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x"
            }
        },
    },
    buyables: {
        11: {
            title: "Point Buyable",
            unlocked() {
                return hasUpgrade('zero', 23)
            },
            cost(x) {
                return new Decimal(1e3).mul(Decimal.pow(2, x)).mul(Decimal.pow(1.25, Decimal.pow(x, 1.1))).floor()
            },
            display() {
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " zeros" + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Boost point gain by x" + format(buyableEffect(this.layer, this.id))
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                if (hasMilestone('one', 2)) cost = new Decimal (0)
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let base1 = new Decimal(2.5)
                let base2 = x
                if(hasUpgrade('one', 13)) base2 = base2.mul(upgradeEffect('one', 13))
                let expo = new Decimal(0.6)
                let eff = base1.pow(Decimal.pow(base2, expo))
                return eff
            },
        },
        12: {
            title: "Zero Buyable",
            unlocked() {
                return hasUpgrade('zero', 42)
            },
            cost(x) {
                return new Decimal(1e10).mul(Decimal.pow(4, x)).mul(Decimal.pow(1.25, Decimal.pow(x, 1.1))).floor()
            },
            display() {
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " zeros" + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Boost zero gain by x" + format(buyableEffect(this.layer, this.id))
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                if (hasMilestone('one', 4)) cost = new Decimal (0)
                player[this.layer].points = player[this.layer].points.sub((this.cost()).mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let base1 = new Decimal(2)
                let base2 = x
                if(hasUpgrade('one', 24)) base2 = base2.mul(upgradeEffect('one', 24))
                let base3 = x.add(1)
                if(hasUpgrade('one', 24)) base3 = base3.mul(upgradeEffect('one', 24))
                let expo = new Decimal(0.6)
                let eff = base1.pow(Decimal.pow(base2, expo)).mul(base3)
                return eff
            },
        },
    },
})
addLayer("one", {
    name: "one",
    symbol: "1",
    position: 0,
    startData() { return {
        unlocked: false,
        autoupgrades: false,
        genpow: new Decimal(0),
        gen1: new Decimal(0),
        gen2: new Decimal(0),
        gen3: new Decimal(0),
        gen4: new Decimal(0),
        gen5: new Decimal(0),
        Generators: {
            timespent: new Decimal(0),
            genpow: new Decimal(0),
            gen1: new Decimal(0),
            gen2: new Decimal(0),
            gen3: new Decimal(0),
            gen4: new Decimal(0),
            gen5: new Decimal(0),
            gen6: new Decimal(0),
            gen7: new Decimal(0),
            gen8: new Decimal(0),
            gen9: new Decimal(0),
            gen10: new Decimal(0),
        },
		points: new Decimal(0),
    }},
    color: "#8c8173",
    requires: new Decimal(1e10),
    resource: "ones",
    baseResource: "zeros",
    baseAmount() {return player.zero.points},
    type: "normal",
    exponent: 1/(new Decimal(1e10).log(10)), // 1/10
    gainMult() {
        let mult = new Decimal (1)
        if (hasUpgrade('one', 25)) mult = mult.times(upgradeEffect('one', 25))
        if (hasMilestone('two', 0)) mult = mult.times(tmp.two.GetBoostIIEff)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    branches: ['zero'],
    row: 1,
    layerShown(){return (hasUpgrade('zero', 35) || hasAchievement('ach', 31))},
    update(diff) {
        if (hasUpgrade('one', 21)) player.one.Generators.timespent = player.one.Generators.timespent.add((diff))
        player.one.Generators.genpow = new Decimal (player.one.Generators.genpow).add(new Decimal(buyableEffect("one", 11).Generate).mul(diff))
        player.one.Generators.gen1 = new Decimal (player.one.Generators.gen1).add(new Decimal(buyableEffect("one", 12).Generate).mul(diff))
        player.one.Generators.gen2 = new Decimal (player.one.Generators.gen2).add(new Decimal(buyableEffect("one", 13).Generate).mul(diff))
        player.one.Generators.gen3 = new Decimal (player.one.Generators.gen3).add(new Decimal(buyableEffect("one", 14).Generate).mul(diff))
        player.one.Generators.gen4 = new Decimal (player.one.Generators.gen4).add(new Decimal(buyableEffect("one", 15).Generate).mul(diff))
        player.one.Generators.gen5 = new Decimal (player.one.Generators.gen5).add(new Decimal(buyableEffect("one", 21).Generate).mul(diff))
        player.one.Generators.gen6 = new Decimal (player.one.Generators.gen6).add(new Decimal(buyableEffect("one", 22).Generate).mul(diff))
        player.one.Generators.gen7 = new Decimal (player.one.Generators.gen7).add(new Decimal(buyableEffect("one", 23).Generate).mul(diff))
        player.one.Generators.gen8 = new Decimal (player.one.Generators.gen8).add(new Decimal(buyableEffect("one", 24).Generate).mul(diff))
        player.one.Generators.gen9 = new Decimal (player.one.Generators.gen9).add(new Decimal(buyableEffect("one", 25).Generate).mul(diff))
    },
    GetGenPowEff() {
        let base = new Decimal (player.one.Generators.genpow).add(1)
        let expo = new Decimal (0.75)
        let eff = Decimal.pow(base, expo)
        return eff
    },
    GetBoostIEff() {
        let base = Decimal.add(player.one.milestones.length, 2)
        let expo = new Decimal (0.5)
        let eff = Decimal.pow(base, expo)
        return eff
    },
    automate() {
        if (player.one.autoupgrades && hasMilestone('two', 4)) {
            buyUpgrade(this.layer, 11)
            buyUpgrade(this.layer, 12)
            buyUpgrade(this.layer, 13)
            buyUpgrade(this.layer, 14)
            buyUpgrade(this.layer, 15)
            buyUpgrade(this.layer, 21)
            buyUpgrade(this.layer, 22)
            buyUpgrade(this.layer, 23)
            buyUpgrade(this.layer, 24)
            buyUpgrade(this.layer, 25)
            buyUpgrade(this.layer, 31)
            buyUpgrade(this.layer, 32)
            buyUpgrade(this.layer, 33)
        }
    },
    doReset(layer) {

        if (!(layers[layer].row > this.row)) return
        
        let keep = ["autoupgrades"]
        
        layerDataReset(this.layer, keep)
        
        },
    hotkeys: [
        {
            key: "1", // What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" for holding down ctrl.
            description: "1: reset your zeros for ones", // The description of the hotkey that is displayed in the game's How To Play tab
            onPress() { if (player.one.unlocked) doReset("one") },
            unlocked() {return hasAchievement('ach', 21)} // Determines if you can use the hotkey, optional
        }
    ],
    tabFormat:{
        "Milestones": {
            unlocked(){return true},
            content:[
                "main-display",
                "blank",
                ["prestige-button",function(){return ""}],
                "blank",
                "resource-display",
                "blank",
                "blank",
                "milestones"
            ]
        },
        "Upgrades": {
            unlocked(){return true},
            content:[
                "main-display",
                "blank",
                ["prestige-button",function(){return ""}],
                "blank",
                "resource-display",
                "blank",
                "blank",
                "upgrades"
            ]
        },
        "Generators": {
            unlocked(){return (hasUpgrade('one', 21))},
            content:[
                "main-display",
                "blank",
                ["prestige-button",function(){return ""}],
                "blank",
                "resource-display",
                ["display-text",
                function() {
                    return "You have " + format(player.one.Generators.genpow) + " Generator Power<sub>1</sub>, Translated to a x" + format(tmp.one.GetGenPowEff) + " boost to zeros gain."
                }],
                ["display-text",
                function() {
                    return "You have spent " + formatTime(player.one.Generators.timespent) + " in this Generator Minigame."
                }],
                "blank",
                "blank",
                ["row", [["buyable", 11], ["buyable", 12], ["buyable", 13], ["buyable", 14], ["buyable", 15]]],
                ["row", [["buyable", 21], ["buyable", 22], ["buyable", 23], ["buyable", 24], ["buyable", 25]]],
                ["row", [["buyable", 31], ["buyable", 32]]],
                ["row", [["clickable", 11]]],
            ]
        },
    },
    clickables: {
        11: {
            title: "Fix your Generators stuff",
            display(){
                let text = "For someone who reached Generators in older versions than V.1.2.1"
                return text
            },
            unlocked() {return true},
            canClick() {return true},
            onClick() {
                player.one.Generators.genpow = player.one.genpow
                player.one.Generators.gen1 = player.one.gen1
                player.one.Generators.gen2 = player.one.gen2
                player.one.Generators.gen3 = player.one.gen3
                player.one.Generators.gen4 = player.one.gen4
                player.one.Generators.gen5 = player.one.gen5
            },
            style: {"background-color"(){
                let color = "#8c8173"
                return color
            }},
        }
    },
    upgrades: {
        11: {
            title: "Triple Gains",
            description: "Triple your point gain.",
            cost: new Decimal (1),
            unlocked() {
                return player.one.total.gte(1) || hasMilestone('two', 4)
            },
            effect() {
                let base = new Decimal (3)
                let expo = new Decimal (1)
                let eff = base.pow(expo)
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x"
            }
        },
        12: {
            title: "A Boost",
            description: "Get it? Point gain is boosted based on ones.",
            cost: new Decimal (1),
            unlocked() {
                return hasUpgrade('one', 11) || hasMilestone('two', 4)
            },
            effect() {
                let base = player.one.points.add(2)
                if (hasMilestone('two', 1)) base = player.one.best.add(2)
                let expo = new Decimal (0.6)
                let eff = base.pow(expo)
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x"
            }
        },
        13: {
            title: "Buyable Booster",
            description: "The first Zero Buyable is 1% more effective.",
            cost: new Decimal (2),
            unlocked() {
                return hasUpgrade('one', 12) || hasMilestone('two', 4)
            },
            effect() {
                let base = new Decimal(0.01)
                if (hasMilestone('two', 5)) base = base.add(tmp.two.GetBoostIIIEff)
                let basemult = new Decimal (1)
                let eff = base.mul(basemult).add(1)
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x"
            }
        },
        14: {
            title: "Unlocker",
            description: "Gain 5% more zeros, and Unlock another row of zero upgrades.",
            cost: new Decimal (5),
            unlocked() {
                return hasUpgrade('one', 13) || hasMilestone('two', 4)
            },
            effect() {
                let base = new Decimal(0.05)
                let basemult = new Decimal (1)
                let eff = base.mul(basemult).add(1)
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x"
            }
        },
        15: {
            title: "Multiply",
            description: "Gain 3 times more zeros and 4 times more points.",
            cost: new Decimal (12),
            unlocked() {
                return hasUpgrade('one', 14) || hasMilestone('two', 4)
            },
            effect() {
                let base1 = new Decimal (3)
                let eff1 = base1
                let base2 = new Decimal (4)
                let eff2 = base2
                return {
                    z: eff1,
                    p: eff2,
                };
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id).z)+"x, "+format(upgradeEffect(this.layer, this.id).p)+"x"
            }
        },
        21: {
            title: "Something New?",
            description: "Unlock a new tab.",
            cost: new Decimal (125),
            unlocked() {
                return hasUpgrade('one', 15) || hasMilestone('two', 4)
            },
        },
        22: {
            title: "Generation boost",
            description: "Generate more GP based on logarithm of GP.",
            cost: new Decimal (333),
            unlocked() {
                return hasUpgrade('one', 21) || hasMilestone('two', 4)
            },
            effect() {
                let base = player.one.Generators.genpow.add(1).log(10).add(1)
                let expo = new Decimal (0.256)
                let eff = base.pow(expo)
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x"
            }
        },
        23: {
            title: "Another Boost",
            description: "<b>A Boost</b> also boosts zeros gain at a reduced rate.",
            cost: new Decimal (2.5e3),
            unlocked() {
                return hasUpgrade('one', 22) || hasMilestone('two', 4)
            },
            effect() {
                let base = new Decimal (upgradeEffect('one', 12))
                let expo = new Decimal (0.4)
                let eff = base.pow(expo)
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x"
            }
        },
        24: {
            title: "Buyable Booster II",
            description: "<b>Buyable Booster</b> also boost Zero Buyable.",
            cost: new Decimal (1.25e4),
            unlocked() {
                return hasUpgrade('one', 23) || hasMilestone('two', 4)
            },
            effect() {
                let base = new Decimal (upgradeEffect('one', 13))
                let expo = new Decimal (1)
                let eff = base.pow(expo)
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x"
            }
        },
        25: {
            title: "Generator Boost",
            description: "Gain more ones based on Total Generator Levels.",
            cost: new Decimal (6.942e4),
            unlocked() {
                return hasUpgrade('one', 24) || hasMilestone('two', 4)
            },
            effect() {
                let base = new Decimal(2).add(getBuyableAmount(this.layer, 11)).add(getBuyableAmount(this.layer, 12)).add(getBuyableAmount(this.layer, 13)).add(getBuyableAmount(this.layer, 14)).add(getBuyableAmount(this.layer, 15))
                let expo = new Decimal (0.6942)
                let eff = base.pow(expo)
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x"
            }
        },
        31: {
            title: "Upgrader III",
            description: "Gain more zeros based on bought one upgrades and accelerators.",
            cost: new Decimal (1e8),
            unlocked() {
                return hasUpgrade('one', 25) || hasMilestone('two', 4)
            },
            effect() {
                let base = Decimal.add(player.one.upgrades.length , 2).mul(Decimal.add(getBuyableAmount(this.layer, 31), 2))
                let expo = new Decimal (3)
                let eff = base.pow(expo)
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x"
            }
        },
        32: {
            title: "Buyables Boost",
            description: "Gain more zeros based on Total zero buyable levels.",
            cost: new Decimal (1e9),
            unlocked() {
                return hasUpgrade('one', 31) || hasMilestone('two', 4)
            },
            effect() {
                let base = Decimal.add(2, getBuyableAmount('zero', 11), getBuyableAmount('zero', 12))
                let expo = new Decimal (1.1)
                let eff = base.pow(expo)
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x"
            }
        },
        33: {
            title: "Base 3",
            description: "Unlock a new Layer.",
            cost: new Decimal (1e10),
            unlocked() {
                return hasUpgrade('one', 32) || hasMilestone('two', 4)
            },
        },
    },
    buyables: {
        11: {
            title: "Power Generator 1",
            unlocked() {
                return hasUpgrade('one', 21)
            },
            cost(x) {
                let cost = (Decimal.pow(2 , x)).mul(10).mul((Decimal.pow(1.25 , x.pow(1.25))))
                return cost.floor()
            },
            display() {
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " ones"+ "<br>Multiplier: x"+format(buyableEffect(this.layer, this.id).Mult) +"<br>Amount: " +format(player.one.Generators.gen1) + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Generating " + format(buyableEffect(this.layer, this.id).Generate)+" GP<sub>1</sub>/s"
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = 1
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player.one.Generators.gen1 = player.one.Generators.gen1.add(1)
            },
            effect(x) {
                let base = new Decimal (player.one.Generators.gen1)
                let multbase = new Decimal (2)
                let expo = x.sub(1)
                let Mult = Decimal.pow(multbase, expo)
                if (hasUpgrade('one', 22)) Mult = Mult.times(upgradeEffect('one', 22))
                if (hasUpgrade('two', 13)) Mult = Mult.times(upgradeEffect('two', 13))
                if (hasUpgrade('two', 14)) Mult = Mult.times(upgradeEffect('two', 14))
                if (hasUpgrade('two', 15)) Mult = Mult.times(upgradeEffect('two', 15).GP)
                if (hasUpgrade('two', 22)) Mult = Mult.times(upgradeEffect('two', 22).G)
                if (hasUpgrade('two', 24)) Mult = Mult.times(upgradeEffect('two', 24))
                Mult = Mult.times(Decimal.pow(buyableEffect('one', 32), getBuyableAmount('one', 32).sub(0).max(0)))
                let Generate = base.mul(Mult)
                Generate = Generate.mul(buyableEffect(this.layer, 31).Eff)
                return {
                    Mult: Mult,
                    Generate: Generate
                }
            },
        },
        12: {
            title: "Power Generator 2",
            unlocked() {
                return hasUpgrade('one', 21)
            },
            cost(x) {
                let cost = (Decimal.pow(Decimal.pow(2, 2) , x)).mul(100).mul((Decimal.pow(1.25 , x.pow(1.25))))
                return cost.floor()
            },
            display() {
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " ones"+ "<br>Multiplier: x"+format(buyableEffect(this.layer, this.id).Mult) +"<br>Amount: " +format(player.one.Generators.gen2) + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Generating " + format(buyableEffect(this.layer, this.id).Generate)+" PG 1/s"
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = 1
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player.one.Generators.gen2 = player.one.Generators.gen2.add(1)
            },
            effect(x) {
                let base = new Decimal (player.one.Generators.gen2)
                let multbase = new Decimal (2)
                let expo = x.sub(1)
                let Mult = Decimal.pow(multbase, expo)
                Mult = Mult.times(Decimal.pow(buyableEffect('one', 32), getBuyableAmount('one', 32).sub(1).max(0)))
                let Generate = base.mul(Mult)
                Generate = Generate.mul(buyableEffect(this.layer, 31).Eff)
                return {
                    Mult: Mult,
                    Generate: Generate
                }
            },
        },
        13: {
            title: "Power Generator 3",
            unlocked() {
                return hasUpgrade('one', 21)
            },
            cost(x) {
                let cost = (Decimal.pow(Decimal.pow(2, 4) , x)).mul(1e4).mul((Decimal.pow(1.25 , x.pow(1.25))))
                return cost.floor()
            },
            display() {
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " ones"+ "<br>Multiplier: x"+format(buyableEffect(this.layer, this.id).Mult) +"<br>Amount: " +format(player.one.Generators.gen3) + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Generating " + format(buyableEffect(this.layer, this.id).Generate)+" PG 2/s"
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = 1
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player.one.Generators.gen3 = player.one.Generators.gen3.add(1)
            },
            effect(x) {
                let base = new Decimal (player.one.Generators.gen3)
                let multbase = new Decimal (2)
                let expo = x.sub(1)
                let Mult = Decimal.pow(multbase, expo)
                Mult = Mult.times(Decimal.pow(buyableEffect('one', 32), getBuyableAmount('one', 32).sub(2).max(0)))
                let Generate = base.mul(Mult)
                Generate = Generate.mul(buyableEffect(this.layer, 31).Eff)
                return {
                    Mult: Mult,
                    Generate: Generate
                }
            }, 
        },
        14: {
            title: "Power Generator 4",
            unlocked() {
                return hasUpgrade('one', 21)
            },
            cost(x) {
                let cost = (Decimal.pow(Decimal.pow(2, 7) , x)).mul(1e6).mul((Decimal.pow(1.25 , x.pow(1.25))))
                return cost.floor()
            },
            display() {
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " ones"+ "<br>Multiplier: x"+format(buyableEffect(this.layer, this.id).Mult) +"<br>Amount: " +format(player.one.Generators.gen4) + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Generating " + format(buyableEffect(this.layer, this.id).Generate)+" PG 3/s"
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = 1
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player.one.Generators.gen4 = player.one.Generators.gen4.add(1)
            },
            effect(x) {
                let base = new Decimal (player.one.Generators.gen4)
                let multbase = new Decimal (2)
                let expo = x.sub(1)
                let Mult = Decimal.pow(multbase, expo)
                Mult = Mult.times(Decimal.pow(buyableEffect('one', 32), getBuyableAmount('one', 32).sub(3).max(0)))
                let Generate = base.mul(Mult)
                Generate = Generate.mul(buyableEffect(this.layer, 31).Eff)
                return {
                    Mult: Mult,
                    Generate: Generate
                }
            }, 
        },
        15: {
            title: "Power Generator 5",
            unlocked() {
                return hasUpgrade('one', 21)
            },
            cost(x) {
                let cost = (Decimal.pow(Decimal.pow(2, 11) , x)).mul(1e9).mul((Decimal.pow(1.25 , x.pow(1.25))))
                return cost.floor()
            },
            display() {
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " ones"+ "<br>Multiplier: x"+format(buyableEffect(this.layer, this.id).Mult) +"<br>Amount: " +format(player.one.Generators.gen5) + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Generating " + format(buyableEffect(this.layer, this.id).Generate)+" PG 4/s"
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = 1
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player.one.Generators.gen5 = player.one.Generators.gen5.add(1)
            },
            effect(x) {
                let base = new Decimal (player.one.Generators.gen5)
                let multbase = new Decimal (2)
                let expo = x.sub(1)
                let Mult = Decimal.pow(multbase, expo)
                Mult = Mult.times(Decimal.pow(buyableEffect('one', 32), getBuyableAmount('one', 32).sub(4).max(0)))
                let Generate = base.mul(Mult)
                Generate = Generate.mul(buyableEffect(this.layer, 31).Eff)
                return {
                    Mult: Mult,
                    Generate: Generate
                }
            }, 
        },
        21: {
            title: "Power Generator 6",
            unlocked() {
                return getBuyableAmount('one', 32).gte(1)
            },
            cost(x) {
                let cost = (Decimal.pow(Decimal.pow(2, 16) , x)).mul(1e13).mul((Decimal.pow(1.25 , x.pow(1.25))))
                return cost.floor()
            },
            display() {
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " ones"+ "<br>Multiplier: x"+format(buyableEffect(this.layer, this.id).Mult) +"<br>Amount: " +format(player.one.Generators.gen6) + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Generating " + format(buyableEffect(this.layer, this.id).Generate)+" PG 5/s"
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = 1
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player.one.Generators.gen6 = player.one.Generators.gen6.add(1)
            },
            effect(x) {
                let base = new Decimal (player.one.Generators.gen6)
                let multbase = new Decimal (2)
                let expo = x.sub(1)
                let Mult = Decimal.pow(multbase, expo)
                Mult = Mult.times(Decimal.pow(buyableEffect('one', 32), getBuyableAmount('one', 32).sub(5).max(0)))
                let Generate = base.mul(Mult)
                Generate = Generate.mul(buyableEffect(this.layer, 31).Eff)
                return {
                    Mult: Mult,
                    Generate: Generate
                }
            }, 
        },
        22: {
            title: "Power Generator 7",
            unlocked() {
                return getBuyableAmount('one', 32).gte(2)
            },
            cost(x) {
                let cost = (Decimal.pow(Decimal.pow(2, 22) , x)).mul(1e18).mul((Decimal.pow(1.25 , x.pow(1.25))))
                return cost.floor()
            },
            display() {
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " ones"+ "<br>Multiplier: x"+format(buyableEffect(this.layer, this.id).Mult) +"<br>Amount: " +format(player.one.Generators.gen7) + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Generating " + format(buyableEffect(this.layer, this.id).Generate)+" PG 6/s"
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = 1
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player.one.Generators.gen7 = player.one.Generators.gen7.add(1)
            },
            effect(x) {
                let base = new Decimal (player.one.Generators.gen7)
                let multbase = new Decimal (2)
                let expo = x.sub(1)
                let Mult = Decimal.pow(multbase, expo)
                Mult = Mult.times(Decimal.pow(buyableEffect('one', 32), getBuyableAmount('one', 32).sub(6).max(0)))
                let Generate = base.mul(Mult)
                Generate = Generate.mul(buyableEffect(this.layer, 31).Eff)
                return {
                    Mult: Mult,
                    Generate: Generate
                }
            }, 
        },
        23: {
            title: "Power Generator 8",
            unlocked() {
                return getBuyableAmount('one', 32).gte(3)
            },
            cost(x) {
                let cost = (Decimal.pow(Decimal.pow(2, 29) , x)).mul(1e24).mul((Decimal.pow(1.25 , x.pow(1.25))))
                return cost.floor()
            },
            display() {
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " ones"+ "<br>Multiplier: x"+format(buyableEffect(this.layer, this.id).Mult) +"<br>Amount: " +format(player.one.Generators.gen8) + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Generating " + format(buyableEffect(this.layer, this.id).Generate)+" PG 7/s"
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = 1
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player.one.Generators.gen8 = player.one.Generators.gen8.add(1)
            },
            effect(x) {
                let base = new Decimal (player.one.Generators.gen8)
                let multbase = new Decimal (2)
                let expo = x.sub(1)
                let Mult = Decimal.pow(multbase, expo)
                Mult = Mult.times(Decimal.pow(buyableEffect('one', 32), getBuyableAmount('one', 32).sub(7).max(0)))
                let Generate = base.mul(Mult)
                Generate = Generate.mul(buyableEffect(this.layer, 31).Eff)
                return {
                    Mult: Mult,
                    Generate: Generate
                }
            }, 
        },
        24: {
            title: "Power Generator 9",
            unlocked() {
                return getBuyableAmount('one', 32).gte(4)
            },
            cost(x) {
                let cost = (Decimal.pow(Decimal.pow(2, 37) , x)).mul(1e31).mul((Decimal.pow(1.25 , x.pow(1.25))))
                return cost.floor()
            },
            display() {
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " ones"+ "<br>Multiplier: x"+format(buyableEffect(this.layer, this.id).Mult) +"<br>Amount: " +format(player.one.Generators.gen9) + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Generating " + format(buyableEffect(this.layer, this.id).Generate)+" PG 8/s"
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = 1
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player.one.Generators.gen9 = player.one.Generators.gen9.add(1)
            },
            effect(x) {
                let base = new Decimal (player.one.Generators.gen9)
                let multbase = new Decimal (2)
                let expo = x.sub(1)
                let Mult = Decimal.pow(multbase, expo)
                Mult = Mult.times(Decimal.pow(buyableEffect('one', 32), getBuyableAmount('one', 32).sub(8).max(0)))
                let Generate = base.mul(Mult)
                Generate = Generate.mul(buyableEffect(this.layer, 31).Eff)
                return {
                    Mult: Mult,
                    Generate: Generate
                }
            }, 
        },
        25: {
            title: "Power Generator 10",
            unlocked() {
                return getBuyableAmount('one', 32).gte(5)
            },
            cost(x) {
                let cost = (Decimal.pow(Decimal.pow(2, 46) , x)).mul(1e39).mul((Decimal.pow(1.25 , x.pow(1.25))))
                return cost.floor()
            },
            display() {
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " ones"+ "<br>Multiplier: x"+format(buyableEffect(this.layer, this.id).Mult) +"<br>Amount: " +format(player.one.Generators.gen10) + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Generating " + format(buyableEffect(this.layer, this.id).Generate)+" PG 9/s"
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = 1
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player.one.Generators.gen10 = player.one.Generators.gen10.add(1)
            },
            effect(x) {
                let base = new Decimal (player.one.Generators.gen10)
                let multbase = new Decimal (2)
                let expo = x.sub(1)
                let Mult = Decimal.pow(multbase, expo)
                Mult = Mult.times(Decimal.pow(buyableEffect('one', 32), getBuyableAmount('one', 32).sub(9).max(0)))
                let Generate = base.mul(Mult)
                Generate = Generate.mul(buyableEffect(this.layer, 31).Eff)
                return {
                    Mult: Mult,
                    Generate: Generate
                }
            }, 
        },
        31: {
            title: "Accelerators",
            unlocked() {
                return hasUpgrade('one', 21)
            },
            cost(x) {
                let scale = new Decimal (1)
                let cost = new Decimal (1e3).mul(Decimal.pow(10, x.mul(scale)))
                return cost.floor()
            },
            display() {
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " ones"+ "<br>Boost all power generators speed by x" + format(buyableEffect(this.layer, this.id).Mult) + " per level." + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Boost all power generators speed by x" + format(buyableEffect(this.layer, this.id).Eff)
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = 1
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            effect(x) {
                let base = x
                let multbase = new Decimal (1.1245)
                let Mult = multbase
                let Eff = Decimal.pow(multbase, base)
                return {
                    Mult: Mult,
                    Eff: Eff
                }
            },
        },
        32: {
            title() {
                let text = "Discover new Generators"
                if (getBuyableAmount(this.layer, this.id).gte(5)) text = "Upgrading Generators"
                return text
            },
            unlocked() {
                return hasUpgrade('two', 21)
            },
            cost(x) {
                let scale = new Decimal (1)
                let scale1 = getBuyableAmount(this.layer, this.id).sub(5).max(0).times(0.5)
                let cost = new Decimal (4).mul(scale)
                return cost.floor()
            },
            display() {
                let cost = ["PG 5", "PG 6", "PG 7", "PG 8", "PG 9", "PG 10"][getBuyableAmount(this.layer, this.id).min(5)]
                let info = "Unlock a new generator and boost PG 1"
                if (getBuyableAmount(this.layer, this.id).gte(5)) info = "Boost PG 1"
                if (getBuyableAmount(this.layer, this.id).gte(1)) info = info + "-" + getBuyableAmount(this.layer, this.id).add(1).min(10).toString()
                info = "Reset Everything in Generators Minigame, " + info
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " " + cost +"<br>"+info+ " by x" + format(buyableEffect(this.layer, this.id)) + "<br>Bought: " + getBuyableAmount(this.layer, this.id)
            },
            canAfford() {
                if (getBuyableAmount(this.layer, this.id).eq(0)) return getBuyableAmount(this.layer, 15).gte(this.cost())
                if (getBuyableAmount(this.layer, this.id).eq(1)) return getBuyableAmount(this.layer, 21).gte(this.cost())
                if (getBuyableAmount(this.layer, this.id).eq(2)) return getBuyableAmount(this.layer, 22).gte(this.cost())
                if (getBuyableAmount(this.layer, this.id).eq(3)) return getBuyableAmount(this.layer, 23).gte(this.cost())
                if (getBuyableAmount(this.layer, this.id).eq(4)) return getBuyableAmount(this.layer, 24).gte(this.cost())
                return getBuyableAmount(this.layer, 25).gte(this.cost())
            },
            buy() {
                player[this.layer].Generators.genpow = new Decimal (0)
                player[this.layer].Generators.gen1 = new Decimal (0)
                player[this.layer].Generators.gen2 = new Decimal (0)
                player[this.layer].Generators.gen3 = new Decimal (0)
                player[this.layer].Generators.gen4 = new Decimal (0)
                player[this.layer].Generators.gen5 = new Decimal (0)
                player[this.layer].Generators.gen6 = new Decimal (0)
                player[this.layer].Generators.gen7 = new Decimal (0)
                player[this.layer].Generators.gen8 = new Decimal (0)
                player[this.layer].Generators.gen9 = new Decimal (0)
                player[this.layer].Generators.gen10 = new Decimal (0)
                player[this.layer].buyables[11] = new Decimal (0)
                player[this.layer].buyables[12] = new Decimal (0)
                player[this.layer].buyables[13] = new Decimal (0)
                player[this.layer].buyables[14] = new Decimal (0)
                player[this.layer].buyables[15] = new Decimal (0)
                player[this.layer].buyables[21] = new Decimal (0)
                player[this.layer].buyables[22] = new Decimal (0)
                player[this.layer].buyables[23] = new Decimal (0)
                player[this.layer].buyables[24] = new Decimal (0)
                player[this.layer].buyables[25] = new Decimal (0)
                player[this.layer].buyables[31] = new Decimal (0)
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            effect(x) {
                let multbase = new Decimal (2)
                let Mult = multbase
                return Mult
            },
        },
    },
    milestones: {
        0: {
            requirementDescription: "5 total ones (QoL I & Boost I)",
            effectDescription: function() {return "You can buy first 15 zero upgrades in any order & Boost your zero gain based on one milestones. Currently: x"+format(tmp.one.GetBoostIEff)},
            unlocked() {return player.one.total.gte(1)},
            done() { return player.one.total.gte(5) },
        },
        1: {
            requirementDescription: "69 total ones (Auto I)",
            effectDescription: "Unlock an Autobuyer for Point Buyable.",
            unlocked() {return player.one.total.gte(5)},
            done() { return player.one.total.gte(69) },
        },
        2: {
            requirementDescription: "333 total ones (QoL II)",
            effectDescription: "Buying Point Buyable costs nothing.",
            unlocked() {return player.one.total.gte(69)},
            done() { return player.one.total.gte(333) },
        },
        3: {
            requirementDescription: "1,000 total ones (Auto II)",
            effectDescription: "Unlock an Autobuyer for Zero Buyable.",
            unlocked() {return player.one.total.gte(333)},
            done() { return player.one.total.gte(1e3) },
        },
        4: {
            requirementDescription: "4,444 total ones (QoL III)",
            effectDescription: "Buying Zero Buyable costs nothing.",
            unlocked() {return player.one.total.gte(1e3)},
            done() { return player.one.total.gte(4444) },
        },
        5: {
            requirementDescription: "12,500 total ones (Auto III)",
            effectDescription: "Unlock an Autobuyer for all zero upgrades.",
            unlocked() {return player.one.total.gte(4444)},
            done() { return player.one.total.gte(12500) },
        },
        6: {
            requirementDescription: "69,420 total ones (QoL IV)",
            effectDescription: '"QoL I"'+" now can buy first 20 zero upgrades in any order.",
            unlocked() {return player.one.total.gte(12500)},
            done() { return player.one.total.gte(69420) },
        },
    },
})
addLayer('two', {
    name: "two",
    symbol: "2",
    position: 0,
    startData() { return {
        unlocked: false,
        bombsandbricks: {
            timespent: new Decimal (0),
            points: new Decimal (0),
            total: new Decimal (0),
            best: new Decimal (0),
            bricksinbp: new Decimal (0),
            bpcap: new Decimal (0),
            bombcooldown: new Decimal (0),
            bombused: new Decimal (0),
        },
		points: new Decimal(0),
    }},
    color: "#949966",
    requires: new Decimal(1e10),
    resource: "twos",
    baseResource: "ones",
    baseAmount() {return player.one.points},
    type: "normal",
    exponent: 1/(new Decimal(1e10).log(10)), // 1/10
    gainMult() {
        let mult = new Decimal (1)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    branches: ['one'],
    row: 2,
    layerShown(){return (hasUpgrade('one', 33) || player.two.total.gte(1))},
    GetBoostIIEff() {
        let base = Decimal.add(player.two.milestones.length, 2)
        let expo = new Decimal (0.6)
        let eff = Decimal.pow(base, expo)
        return eff
    },
    GetBoostIIIEff() {
        let base = new Decimal (0.01)
        base = base.times(player.two.milestones.length)
        return base
    },
    GetBoostIVEff() {
        let base = new Decimal (0.9)
        base = base.pow(player.two.milestones.length)
        return base
    },
    GetBombCoolDown() {
        let base = new Decimal (10)
        base = base.times(buyableEffect(this.layer , 12).C)
        let eff = base
        return eff
    },
    GetBombSpeed() {
        let base = new Decimal (1)
        base = base.times(buyableEffect(this.layer , 11))
        let eff = base
        return eff
    },
    GetBricksGain() {
        let base = new Decimal (10)
        if (hasUpgrade('two', 21)) base = base.times(upgradeEffect('two', 21))
        if (hasUpgrade('two', 22)) base = base.times(upgradeEffect('two', 22).B)
        base = base.times(buyableEffect(this.layer , 12).B)
        let eff = base.times(Math.random()).times(100).floor().div(100)
        return eff
    },
    GetBricksEff() {
        let base = player.two.bombsandbricks.points.add(1)
        let expo = new Decimal (6)
        let eff = base.pow(expo)
        return eff
    },
    GetBackpackCapacity() {
        let base = new Decimal (100)
        if (hasUpgrade('two', 23)) base = base.times(upgradeEffect('two', 23))
        if (hasUpgrade('two', 25)) base = base.times(upgradeEffect('two', 25))
        base = base.times(buyableEffect(this.layer, 13))
        let eff = base
        return eff
    },
    GetBombsUsed() {
        let base = new Decimal (1)
        let eff = base
        return eff
    },
    update(diff) {
        if (hasMilestone('two', 1)) player.two.bombsandbricks.timespent = player.two.bombsandbricks.timespent.add(diff)
        player.two.bombsandbricks.bpcap = tmp.two.GetBackpackCapacity
        if (player.two.bombsandbricks.best.lt(player.two.bombsandbricks.points)) player.two.bombsandbricks.best = player.two.bombsandbricks.points
        if (player.two.bombsandbricks.bricksinbp.gte(player.two.bombsandbricks.bpcap)) player.two.bombsandbricks.bricksinbp = player.two.bombsandbricks.bpcap
        if (player.two.bombsandbricks.bombcooldown.lte(0)) player.two.bombsandbricks.bombcooldown = new Decimal (0)
        if (player.two.bombsandbricks.bombcooldown.gt(0)) player.two.bombsandbricks.bombcooldown = player.two.bombsandbricks.bombcooldown.sub(tmp.two.GetBombSpeed.times(diff))
    },
    hotkeys: [
        {
            key: "2", // What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" for holding down ctrl.
            description: "2: reset your ones for twos", // The description of the hotkey that is displayed in the game's How To Play tab
            onPress() { if (player.two.unlocked) doReset("two") },
            unlocked() {return hasAchievement('ach', 71)} // Determines if you can use the hotkey, optional
        }
    ],
    tabFormat: {
        "Milestones": {
            unlocked(){return true},
            content:[
                "main-display",
                "blank",
                ["prestige-button",function(){return ""}],
                "blank",
                "resource-display",
                "blank",
                "blank",
                "milestones"
            ]
        },
        "Upgrades": {
            unlocked(){return true},
            content:[
                "main-display",
                "blank",
                ["prestige-button",function(){return ""}],
                "blank",
                "resource-display",
                "blank",
                "blank",
                "upgrades"
            ]
        },
        "B&B": {
            unlocked(){return hasMilestone('two', 1)},
            content:[
                "main-display",
                "blank",
                ["prestige-button",function(){return ""}],
                "blank",
                "blank",
                ["display-text",
                function() {
                    return "You have " + format(player.two.bombsandbricks.points) + " Bricks, Translated to a x" + format(tmp.two.GetBricksEff) + " boost to zeros gain."
                }],
                ["display-text", function() {
                    return "You can use the bomb to explodes a brick wall. after the brick wall is destroyed you put some bricks in your backpack."
                }],
                ["display-text", function() {
                    return "You have spent " + formatTime(player.two.bombsandbricks.timespent) + " in this B&B Minigame"
                }],
                "blank",
                "resource-display",
                "blank",
                ["display-text",
                function() {
                    return "You have used " + format(player.two.bombsandbricks.bombused) + " Bombs."
                }],
                "blank",
                ["row", [["clickable", 11], ["clickable", 12]]],
                "blank",
                "blank",
                ["row", [["buyable", 11], ["buyable", 12], ["buyable", 13]]],
            ]
        },
    },
    clickables: {
        11: {
            title: "Bomb",
            display(){
                let text = "Ready"
                if (!player.two.bombsandbricks.bombcooldown.eq(0)) text = "Next in " + format(player.two.bombsandbricks.bombcooldown) + "s"
                return text
            },
            unlocked() {return true},
            canClick() {return player.two.bombsandbricks.bombcooldown.eq(0)},
            onClick() {
                player.two.bombsandbricks.bombused = player.two.bombsandbricks.bombused.add(tmp.two.GetBombsUsed)
                player.two.bombsandbricks.bricksinbp = player.two.bombsandbricks.bricksinbp.add(tmp.two.GetBricksGain)
                player.two.bombsandbricks.bombcooldown = tmp.two.GetBombCoolDown
            },
            style: {"background-color"(){
                let color = "#949966"
                return color
            }},
        },
        12: {
            title: "Backpack",
            display(){
                let text = format(player.two.bombsandbricks.bricksinbp).toString() + "/" + format(player.two.bombsandbricks.bpcap).toString() + " Bricks"
                if (player.two.bombsandbricks.bricksinbp.eq(player.two.bombsandbricks.bpcap)) text = text + "<br>Full"
                return text
            },
            unlocked() {return true},
            canClick() {return !player.two.bombsandbricks.bricksinbp.eq(0)},
            onClick() {
                player.two.bombsandbricks.points = player.two.bombsandbricks.points.add(player.two.bombsandbricks.bricksinbp)
                player.two.bombsandbricks.total = player.two.bombsandbricks.total.add(player.two.bombsandbricks.bricksinbp)
                player.two.bombsandbricks.bricksinbp = new Decimal (0)
            },
            style: {"background-color"(){
                let color = "#949966"
                return color
            }},
        },
    },
    upgrades: {
        11: {
            title: "Two Boost",
            description: "Boost point gain based on twos.",
            cost: new Decimal (1),
            unlocked() {
                return (player.two.total.gte(1))
            },
            effect() {
                let base = new Decimal (player.two.points).add(2)
                let expo = new Decimal (4)
                let eff = base.pow(expo)
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x"
            }
        },
        12: {
            title: "Upgrader IV",
            description: "<b>Double Fun</b> effect is stronger based on bought two upgrades.",
            cost: new Decimal (1),
            unlocked() {
                return (hasUpgrade('two', 11))
            },
            effect() {
                let base = new Decimal (player.two.upgrades.length).add(2)
                let expo = new Decimal (0.5)
                let eff = base.pow(expo)
                return eff
            },
            effectDisplay() {
                return "^"+format(upgradeEffect(this.layer, this.id))
            }
        },
        13: {
            title: "Another Generator Boost",
            description: "<b>A Boost</b> also boost GP<sub>1</sub> gain at a reduced rate.",
            cost: new Decimal (2),
            unlocked() {
                return (hasUpgrade('two', 12))
            },
            effect() {
                let base = new Decimal (upgradeEffect('one', 12))
                let expo = new Decimal (0.2)
                let eff = base.pow(expo)
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x"
            }
        },
        14: {
            title: "Quadruple Powered Points",
            description: "Quadruple your GP<sub>1</sub> and points gain",
            cost: new Decimal (5),
            unlocked() {
                return (hasUpgrade('two', 13))
            },
            effect() {
                let base = new Decimal (4)
                let expo = new Decimal (1)
                let eff = base.pow(expo)
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x"
            }
        },
        15: {
            title: "Power↔Points",
            description: "GP<sub>1</sub> and points boost eachother gains.",
            cost: new Decimal (5),
            unlocked() {
                return (hasUpgrade('two', 14))
            },
            effect() {
                let base1 = player.one.Generators.genpow.add(1).ln().add(1)
                let base2 = player.points.add(1).log(10).add(1)
                let expo1 = new Decimal (0.6)
                let expo2 = new Decimal (0.45)
                let eff1 = base1.pow(expo1)
                let eff2 = base2.pow(expo2)
                return {
                    GP: eff2,
                    P: eff1,
                }
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id).GP)+"x to GP<sub>1</sub>, " + format(upgradeEffect(this.layer, this.id).P)+"x to points"
            }
        },
        21: {
            title: "More Bricks and Generator",
            description: "Gain 10x to bricks but the boost is nerfed based on How full your Backpack is and Unlock more contents for Generators.",
            cost: new Decimal (25),
            unlocked() {
                return (hasUpgrade('two', 15))
            },
            effect() {
                let full = new Decimal (5)
                let base1 = new Decimal (10)
                let expo1 = new Decimal (1)
                let BPeff = player.two.bombsandbricks.bricksinbp.max(1).log(tmp.two.GetBackpackCapacity)
                let expofinal = expo1.sub(BPeff)
                let eff = base1.div(full).pow(expofinal).times(full)
                if (hasUpgrade('two', 22)) eff = eff.pow(upgradeEffect('two', 12))
                return eff
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x"
            }
        },
        22: {
            title: "Bricks and GP",
            description: "Gain 5x more Bricks and GP<sub>1</sub> and <b>Upgrader IV</b> also applied to <b>More Bricks and Generator</b> effect.",
            cost: new Decimal (100),
            unlocked() {
                return (hasUpgrade('two', 21))
            },
            effect() {
                let base1 = new Decimal (5)
                let base2 = new Decimal (5)
                let expo1 = new Decimal (1)
                let expo2 = new Decimal (1)
                let eff1 = base1.pow(expo1)
                let eff2 = base2.pow(expo2)
                return {
                    B: eff1,
                    G: eff2,
                }
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id).B)+"x, " + format(upgradeEffect(this.layer, this.id).G)+"x"
            }
        },
        23: {
            title: "Brick Backpack",
            description: "Bricks boost Backpack Capacity.",
            cost: new Decimal (3.2e6),
            unlocked() {
                return (hasUpgrade('two', 22))
            },
            currencyLocation:() => player.two.bombsandbricks,
            currencyDisplayName: "bricks",
            currencyInternalName: "points",
            currencyLayer:"two",
            effect() {
                let base1 = player.two.bombsandbricks.points.add(1).ln().add(1)
                let expo1 = new Decimal (0.8)
                let eff1 = base1.pow(expo1)
                return eff1
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x"
            }
        },
        24: {
            title: "Bricks Generation",
            description: "Bricks boost Generator Power and Square root <b>Better Bomb</b>'s Second Effect.",
            cost: new Decimal (2.16e8),
            unlocked() {
                return (hasUpgrade('two', 23))
            },
            currencyLocation:() => player.two.bombsandbricks,
            currencyDisplayName: "bricks",
            currencyInternalName: "points",
            currencyLayer:"two",
            effect() {
                let base1 = player.two.bombsandbricks.points.add(1).ln().add(1)
                let expo1 = new Decimal (0.75)
                let eff1 = base1.pow(expo1)
                return eff1
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x"
            }
        },
        25: {
            title: "Exploding Backpack",
            description: "The Amount of Bombs you have used boost Backpack Capacity and Raise <b>Better Bomb</b>'s Second Effect to the 0.8th power.",
            cost: new Decimal (6e9),
            unlocked() {
                return (hasUpgrade('two', 24))
            },
            currencyLocation:() => player.two.bombsandbricks,
            currencyDisplayName: "bricks",
            currencyInternalName: "points",
            currencyLayer:"two",
            effect() {
                let base1 = player.two.bombsandbricks.bombused.add(2)
                let expo1 = new Decimal (0.8)
                let eff1 = base1.pow(expo1)
                return eff1
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x"
            }
        },
    },
    buyables: {
        11: {
            title: "Faster Reload",
            unlocked() {
                return true
            },
            cost(x) {
                return new Decimal(100).mul(Decimal.pow(2, x)).mul(Decimal.pow(1.25, Decimal.pow(x, 1.25))).floor()
            },
            display() {
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " bricks" + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Boost bomb cooldown speed by x" + format(buyableEffect(this.layer, this.id))
            },
            canAfford() {
                return player[this.layer].bombsandbricks.points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                player[this.layer].bombsandbricks.points = player[this.layer].bombsandbricks.points.sub(this.cost().mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let base1 = new Decimal(2)
                let base2 = x
                let expo = new Decimal(0.4)
                let eff = base1.pow(Decimal.pow(base2, expo))
                return eff
            },
        },
        12: {
            title: "Better Bomb",
            unlocked() {
                return true
            },
            cost(x) {
                return new Decimal(100).mul(Decimal.pow(2, x)).mul(Decimal.pow(1.25, Decimal.pow(x, 1.5))).floor()
            },
            display() {
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " bricks" + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Boost bricks gain by x" + format(buyableEffect(this.layer, this.id).B) + "<br>But Bomb cooldown is x" + format(buyableEffect(this.layer, this.id).C) + " longer"
            },
            canAfford() {
                return player[this.layer].bombsandbricks.points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                player[this.layer].bombsandbricks.points = player[this.layer].bombsandbricks.points.sub(this.cost().mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let base1 = new Decimal(4)
                let basea = new Decimal(1.5)
                let base2 = x
                let baseb = x
                let expo1 = new Decimal(0.75)
                let expo2 = new Decimal(0.6)
                let eff1 = base1.pow(Decimal.pow(base2, expo1))
                let eff2 = basea.pow(Decimal.pow(baseb, expo2))
                if (hasUpgrade('two', 24)) eff2 = eff2.pow(0.5)
                if (hasUpgrade('two', 25)) eff2 = eff2.pow(0.8)
                if (hasMilestone('two', 5)) eff2 = eff2.pow(tmp.two.GetBoostIVEff)
                return {
                    B: eff1,
                    C: eff2
                }
            },
        },
        13: {
            title: "Bigger Backpack",
            unlocked() {
                return true
            },
            cost(x) {
                return new Decimal(100).mul(Decimal.pow(2, x)).mul(Decimal.pow(1.25, Decimal.pow(x, 1.6))).floor()
            },
            display() {
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " bricks" + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Boost backpack capacity by x" + format(buyableEffect(this.layer, this.id))
            },
            canAfford() {
                return player[this.layer].bombsandbricks.points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                player[this.layer].bombsandbricks.points = player[this.layer].bombsandbricks.points.sub(this.cost().mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let base1 = new Decimal(5)
                let base2 = x
                let expo1 = new Decimal(0.8)
                let eff1 = base1.pow(Decimal.pow(base2, expo1))
                return eff1
            },
        },
    },
    milestones: {
        0: {
            requirementDescription: "5 total twos (Boost II)",
            effectDescription: function() {return "Gain more ones based on completed two milestones. Currently: x"+format(tmp.two.GetBoostIIEff)},
            unlocked() {return player.two.total.gte(1)},
            done() { return player.two.total.gte(5) },
        },
        1: {
            requirementDescription: "15 total twos (QoL V and Unlock I)",
            effectDescription: function() {return "<b>A Boost</b> is now based on best amount and unlock a new tab."},
            unlocked() {return hasMilestone(this.layer, 0)},
            done() { return player.two.total.gte(15) },
        },
        2: {
            requirementDescription: "1 total brick (Boost III)",
            effectDescription: function() {return "<b>Buyable Boost</b> base is increased by 1% for each completed two milestones. Currently: +"+format(tmp.two.GetBoostIIIEff)},
            unlocked() {return hasMilestone(this.layer, 1)},
            done() { return player.two.bombsandbricks.total.gte(1) },
        },
        3: {
            requirementDescription: "1,000 total two (QoL VI)",
            effectDescription: function() {return "You can buy first 13 one upgrades in any order."},
            unlocked() {return hasMilestone(this.layer, 2)},
            done() { return player.two.total.gte(1e3) },
        },
        4: {
            requirementDescription: "1e10 total bricks (Auto IV)",
            effectDescription: function() {return "Unlock an Autobuyer for one upgrades."},
            unlocked() {return hasMilestone(this.layer, 3)},
            done() { return player.two.bombsandbricks.total.gte(1e10) },
        },
        5: {
            requirementDescription: "10,000 total twos (Boost IV)",
            effectDescription: function() {return "<b>Better Bomb</b>'s second effect is raised by 0.9 for each completed two milestones. Currently: ^"+format(tmp.two.GetBoostIVEff)},
            unlocked() {return hasMilestone(this.layer, 4)},
            done() { return player.two.points.gte(1e4) },
        },
    },
})
