addLayer("ach", {
    name: "Achievements",
    symbol: "Am",
    row: "side",
    position: 0,
    color: "yellow",
    tooltip: "Achievements",
    achievementPopups: true,
    startData() { return {
        unlocked: true,
    }},
    tabFormat: [
        ["display-text", "<h1>Achievements</h1>", {'color':'yellow'}],
        ["display-text", function() {
            return "You have <h2 style='color:rgb(235, 234, 142)'>"+player.ach.achievements.length+"/45</h2> achievements so far. "+
            "They only serve the purpose to track your progress and provide no rewards at all!"
        }],["blank","30px"],"achievements"
    ],
    achievements: {
        11: {
            name: "Withering...",
            tooltip: "Begin the generation of Weakling Dust.",
            done() {return player.w.unlocked}
        },
        12: {
            name: "Speeding Up!",
            tooltip: "Have the upgrade <u><b>Weakling Up II</b></u>.",
            done() {return hasUpgrade("w",12)},
        },
        13: {
            name: "Buyables",
            tooltip: "Have at least a total of 10 purchases for <u><b>Mentality Strengthen</b></u> and <u><b>Weakling Strengthen</b></u>.",
            done() {return (getBuyableAmount("w",11).add(getBuyableAmount("w",12)).gte(10))}
        },
        14: {
            name: "Now They Multiply!",
            tooltip: "Have the upgrade <u><b>Contradiction</b></u>.",
            done() {return hasUpgrade("w",15)}
        },
        15: {
            name: "First Sign of Inflation",
            tooltip: "Have the upgrade <u><b>Powerful Weakling</b></u>.",
            done() {return hasUpgrade("w",24)}
        },
        21: {
            name: "The Mind Complex",
            tooltip: "Have a Crystal Shard.",
            done() {return player.c.points.gte(1)}
        },
        22: {
            name: "Dynamic Multiplier!",
            tooltip: "Have the third Crystal Shard milestone.",
            done() {return hasMilestone("c",2)}
        },
        23: {
            name: "2nd Type of Dust!",
            tooltip: "Have the first Unstable Dust milestone.",
            done() {return hasMilestone("c",20)}
        },
        24: {
            name: "Benefited in Every Run",
            tooltip: "Have the fifth Crystal Shard milestone.",
            done() {return hasMilestone("c",4)}
        },
        25: {
            name: "Yet Another Division?",
            tooltip: "Have the third Unstable Dust milestone.",
            done() {return hasMilestone("c",22)}
        },
        31: {
            name: "The Fusion of Shards!",
            tooltip: "Have a Crystal of any type.",
            done() {return player.c.vc.gte(1)}
        },
        32: {
            name: "The Evil Plan",
            tooltip: "Have 5 Evil Crystals.",
            done() {return player.c.ec.gte(5)}
        },
        33: {
            name: "Virtue of Life",
            tooltip: "Have 5 Virtuous Crystals.",
            done() {return player.c.vc.gte(5)}
        },
        34: {
            name: "Less Efficient",
            tooltip: "Have 25 Evil Crystals.",
            done() {return player.c.ec.gte(25)}
        },
        35: {
            name: "Weakening But on Steroid",
            tooltip: "Have 30 Virtuous Crystals.",
            done() {return player.c.vc.gte(30)}
        },
        41: {
            name: "Magnificent",
            tooltip: "Have either a Virtuous Crystal upgrade or an Evil Crystal upgrade.",
            done() {return hasUpgrade("c",11)||hasUpgrade("c",31)}
        },
        42: {
            name: "Scroll Down for More Content",
            tooltip: "Dive deeper into the Crystals upgrade tab and purchase <u><b>Fogging</b></u>.",
            done() {return hasUpgrade("c",51)}
        },
        43: {
            name: "Mass Produce",
            tooltip: "Have the upgrade <u><b>Rebellion</b></u>.",
            done() {return hasUpgrade("c",32)}
        },
        44: {
            name: "Look'a All Those Shiny Stuffs!",
            tooltip: "Have over 1,000 Crystal Shards.",
            done() {return (player.c.points.gte(1000))}
        },
        45: {
            name: "Now, Where Are My Crystals?",
            tooltip: "Have over 50 times more of Crystal Shards than the cost of condensing it.",
            done() {return (player.c.points.gte(tmp.c.crystalCost.mul(50)))}
        },
        51: {
            name: "Persistent Effect",
            tooltip: "Have the 7th effect of either VC or EC.",
            done() {return hasMilestone("c",46)||hasMilestone("c",76)}
        },
        52: {
            name: "Self-Contain",
            tooltip: "Have the upgrade <u><b>Enchantment</b></u>.",
            done() {return hasUpgrade("c",13)}
        },
        53: {
            name: "Strong Buff",
            tooltip: "Have more than 5,000 Virtuous Crystals.",
            done() {return (player.c.vc.gte(5000))}
        },
        54: {
            name: "Bless or Curse?",
            tooltip: "Have either the upgrade <u><b>Benediction</b></u> or <u><b>Imprecation</b></u>.",
            done() {return hasUpgrade("c",14)||hasUpgrade("c",34)}
        },
        55: {
            name: "Transform",
            tooltip: "Have the upgrade <u><b>Distillation</b></u> and witnessed the change of <u><b>Crystalize</b></u>.",
            done() {return hasUpgrade("c",55)}
        },
        61: {
            name: "Whoa, We Got More Upgrades?",
            tooltip: "Unlock the 3rd row of Weakling upgrades.",
            done() {return hasMilestone("c",25)}
        },
        62: {
            name: "Generational Crystals",
            tooltip: "Begin the generation of Crystals of any type.",
            done() {return hasUpgrade("c",21)||hasUpgrade("c",41)}
        },
        63: {
            name: "Hey There, You Can Stop Spamming Now",
            tooltip: "Begin the generation of Crystal Shards.",
            done() {return hasUpgrade("c",55)}
        },
        64: {
            name: "Progression Surge",
            tooltip: "Have the upgrade <u><b>Duality</b></u>.",
            done() {return hasUpgrade("w",35)}
        },
        65: {
            name: "A Half-Completed Crystal",
            tooltip: "Unlock the 7th Unstable Dust milestone.",
            done() {return hasMilestone("c",26)}
        },
        71: {
            name: "The Real AD Reference",
            tooltip: "Unlocks Crystals Purification of any type.",
            done() {return hasChallenge("a",11)||hasChallenge("dm",11)}
        },
        72: {
            name: "Evil Monarch",
            tooltip: "Have over 1e20 Evil Crystals.",
            done() {return (player.c.ec.gte(1e20))}
        },
        73: {
            name: "It's Time for Another Challenge",
            tooltip: "Have over 1e140 Unstable Dust.",
            done() {return (player.c.ud.gte(1e140))}
        },
        74: {
            name: "Side B",
            tooltip: "Unlock more Crystal upgrades. <i>(they will unlock once you have 5 VC<sup>2</sup> or 5 EC<sup>2</sup>)</i>.",
            done() {return (player.a.vc2.gte(5)||player.dm.ec2.gte(5))}
        },
        75: {
            name: "All The Investments Are Worth It",
            tooltip: "Have both the upgrades <u><b>Purity</b></u> and <u><b>Impurity</b></u>.",
            done() {return hasUpgrade("c",22)&&hasUpgrade("c",42)}
        },
        81: {
            name: "That Was Quite A Wait Huh?",
            tooltip: "Have over 1e240 Unstable Dust.",
            done() {return (player.c.ud.gte(1e240))}
        },
        82: {
            name: "3-Dimensional Tuna",
            tooltip: "Have either a VC<sup>3</sup> or EC<sup>3</sup>.",
            done() {return (player.a.vc3.gte(1)||player.dm.ec3.gte(1))}
        },
        83: {
            name: "The Number We All Know And Love",
            tooltip: "Have more than 1.80e308 Unstable Dust.",
            done() {return (player.c.ud.gte(Decimal.pow(2,1024)))}
        },
        84: {
            name: "The Art of Copy+Paste",
            tooltip: "Have both the upgrades <u><b>Purity<sup>2</sup></b></u> and <u><b>Impurity<sup>2</sup></b></u>.",
            done() {return hasUpgrade("c",23)&&hasUpgrade("c",43)}
        },
        85: {
            name: "Exploitation to the MAX",
            tooltip: "Have more than 1e100 Mentality outside of all challenges and without buying any <u><b>Weakling Strengthen</b></u>.",
            done() {
                let inAnyChallenge = inChallenge("a",11)||inChallenge("a",12)||inChallenge("a",21)||inChallenge("dm",11)||inChallenge("dm",12)||inChallenge("dm",21)
                return player.points.gte(1e100)&&getBuyableAmount("w",12).eq(0)&&!inAnyChallenge
            }
        },
        91: {
            name: "Eruption",
            tooltip: "Have the upgrade <u><b>Dissolution</b></u>.",
            done() {return hasUpgrade("c",62)}
        },
        92: {
            name: "Onto The Final Challenges...",
            tooltip: "Have over 1e432 Unstable Dust.",
            done() {return (player.c.ud.gte("1e432"))}
        },
        93: {
            name: "Acquainted with Angels",
            tooltip: "Have 1 completion on Angelic Challenge <u><b>Ancension to Heaven</b></u>.",
            done() {return challengeCompletions("a",22) == 1}
        },
        94: {
            name: "Walking in The Place of Constraint",
            tooltip: "Have 1 completion on Demonic Challenge <u><b>Escape from Hell</b></u>.",
            done() {return challengeCompletions("dm",22) == 1}
        },
        95: {
            name: "The Final Dimension",
            tooltip: "Have both 1 Purified VC<sup>4</sup> and 1 Purified EC<sup>4</sup>.",
            done() {return player.a.vc4.gte(1)&&player.dm.ec4.gte(1)}
        },
    }
}) // Achievements
