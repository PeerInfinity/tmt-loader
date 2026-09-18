addLayer("n", {
    branches: [],
    name: "Nova", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Ψ", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        autonova: false,
        autoUpgrade: false,
    }},
    color: "#42039C",
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "Nova", // Name of prestige currency
    baseResource: "stardust", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("n",11)) mult = mult.mul(new Decimal(Math.log(player.points.add(1))).add(1))
        if (hasUpgrade("n",13)) mult = mult.mul(new Decimal(2))
        if (getBuyableAmount("g",13).gte(1)) mult = mult.mul(buyableEffect("g",13))
        return mult
    },
    doReset(resettingLayer) {
        if (resettingLayer != "n" ) { if (hasChallenge("v",12)) {layerDataReset("n",["autonova","milestones"])} else {if (resettingLayer = "t") {if (hasMilestone("t",8)) {layerDataReset("n",["autonova","milestones"])} else {layerDataReset("n",[])}} else {layerDataReset("n",[])}} }
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "n", description: "N: Collapse your stardust into nova", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        {key: "c", description: "C: Collapse your nova into crystalline", onPress(){if (player.n.points.gte(500)) {
            player.crystalline = player.crystalline.add(player.n.points.sub(499).pow(new Decimal(0.5)))
            player.n.points = new Decimal(0)
            player.points = new Decimal(0)
        }
        }},
    ],
    layerShown(){return true},
    buyables: {
        11: {
            cost(x) { let a = new Decimal(x).pow(3).add(1) 
            if (getBuyableAmount("n",12).gte(1)) a = a.div(buyableEffect("n",12))
            return a
            },
            title() { return "Formation Alpha" },
            display() { return "Boosts stardust gain by " + format(buyableEffect("n",11)) + "x<br>Cost: " + format(this.cost()) + " nova<br>Amount: " + format(getBuyableAmount("n",11))},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) { let a = new Decimal(x).pow(2).add(1) 
            if (hasAchievement("a",12)) a = a.mul(new Decimal(4))
            if (getBuyableAmount("g",11).gte(1)) a = a.mul(buyableEffect("g",11))
            if (inChallenge("v",12)) {a = new Decimal(1)}
            return a
            },
        },
        12: {
            cost(x) { return new Decimal(x).pow(4).add(7) },
            title() { return "Formation Beta" },
            display() { return "Divides formation a cost by " + format(buyableEffect("n",12)) + "x<br>Cost: " + format(this.cost()) + " formation alpha<br>Amount: " + format(getBuyableAmount("n",12))},
            canAfford() { return new Decimal(getBuyableAmount("n",11)).gte(this.cost()) },
            buy() {
                setBuyableAmount("n",11,new Decimal(getBuyableAmount("n",11)).sub(this.cost()))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) { let a = new Decimal(x).pow(2).add(1) 
                if (player.v.voidpower.gte(1)) {if (a.gte(2)) { a = a.mul(player.v.voidpower.add(1).pow(0.5)) }}
                if (getBuyableAmount("g",12).gte(1)) a = a.mul(buyableEffect("g",12))
                if (inChallenge("v",11)) {a = new Decimal(1)}
                if (inChallenge("v",12)) {a = new Decimal(1)}
            return a
            },
        },
        13: {
            cost(x) { return new Decimal(10).pow(new Decimal(x).sub(buyableEffect("n",15))) },
            title() { return "Stardust Galaxy" },
            display() { return "Multiplies stardust by " + format(buyableEffect("n",13)) + "x<br>Cost: " + format(this.cost()) + " stardust<br>Amount: " + format(getBuyableAmount("n",13))},
            canAfford() { return player.points.gte(this.cost()) },
            buy() {
                player.points = player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) { let a = new Decimal(x).pow(1.1)
                if (getBuyableAmount("n",14) > 0) a = a.mul(buyableEffect("n",14))
                if (getBuyableAmount("v",21).gte(1)) a = a.mul(buyableEffect("v",21))
                if (inChallenge("v",12)) {a = a.mul(5)}
                if (getBuyableAmount("g",22).gte(1)) a = a.mul(buyableEffect("g",22))
            return a
            },
        },
        14: {
            cost(x) { return new Decimal(1000000).mul(new Decimal(100).pow(x)) },
            title() { return "Stardust accelerator" },
            display() { return "Multiplies stardust galaxies effectiveness by " + format(buyableEffect("n",14)) + "x<br>Cost: " + format(this.cost()) + " stardust<br>Amount: " + format(getBuyableAmount("n",14))},
            canAfford() { return player.points.gte(this.cost()) },
            buy() {
                player.points = player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) { let a = new Decimal(x).add(1).pow(2)
            return a
            },
            unlocked() {return hasMilestone("n",0)}
        },
        15: {
            cost(x) { return new Decimal(50).mul(new Decimal(1).add(x).pow(x)) },
            title() { return "Crystalline assimilator" },
            display() { return "Lowers the cost of stardust galaxies by " + format(buyableEffect("n",15)) + " cost-steps<br>Cost: " + format(this.cost()) + " crystalline<br>Amount: " + format(getBuyableAmount("n",15))},
            canAfford() { return player.crystalline.gte(this.cost()) },
            buy() {
                player.crystalline = player.crystalline.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) { let a = new Decimal(x)
            return a
            },
            unlocked() {return (getBuyableAmount("n",14) > 0)}
        },
    },
    automate() {
        if (player.v.autogalaxy) { if (player.points.gte(new Decimal(10).pow(new Decimal(getBuyableAmount("n",13)).sub(buyableEffect("n",15))))) {addBuyables("n",13,new Decimal(1))} }
        if (player.v.autoformation) { if (player.n.points.gte(getBuyableAmount("n",11).pow(3).add(1).div(buyableEffect("n",12).add(1)))) {addBuyables("n",11,new Decimal(1))} }
        if (player.v.autoformation) { if (getBuyableAmount("n",11).gte(getBuyableAmount("n",12).pow(4).add(7))) {addBuyables("n",12,new Decimal(1))} }
        if (hasMilestone("v",4)) { if (player.points.gte(new Decimal(1000000).mul(new Decimal(100).pow(getBuyableAmount("n",14))))) {addBuyables("n",14,new Decimal(1))} }
        if (hasMilestone("t",4)) { if (player.n.points.gte(new Decimal(500))) { if (hasMilestone("v",0)) {
            let get = player.n.points.sub(499).pow(new Decimal(0.5))
            if (getBuyableAmount("g",21).gte(1)) get = get.mul(buyableEffect("g",21))
            if (hasMilestone("t",5)) {get = get.mul(2)}
            player.crystalline = player.crystalline.add(get.mul(0.03))
        }}}
        
        

    },

    collapse(){
        if (!hasMilestone("v",0)) {
            if (player.novacap = "true") {
                  if (player.n.points > 499) { player.crystalline = player.crystalline.add(1) }
                  if (player.n.points > 499) { if (!hasUpgrade("n",15)) {setBuyableAmount("n",11,new Decimal(0))} }
                  if (player.n.points > 499) { if (!hasUpgrade("n",14)) {setBuyableAmount("n",12,new Decimal(0))} }
                  if (player.n.points > 499) { player.points = new Decimal(0) }
                  if (player.n.points > 499) { player.n.points = new Decimal(0) }
            }
        }
    },
    bars: {
        bar1: {
            direction: RIGHT,
            width: 500,
            height: 25,
            progress() { return new Decimal(player.n.points).div(new Decimal(500)) },
            unlocked() { if (hasUpgrade("n",11)) {return false} else {return true} },
            display() { return "Progress to collapse" }
        },
    },
    tabFormat: {
        "Nova": {
            content: [
                "main-display",
                ["microtabs",["n"]],
                ["bar",["bar1"]],
                "blank",
                "prestige-button",
                "blank",
                "blank",
                ["buyable",["11"]],
                ["buyable",["12"]],
                
            ],
        },
        "Collapse": {
            content: [
                ["clickable",["21"]],
                ["display-text",
                    function() { return 'You have ' + format(player.crystalline) + ' crystalline' },
                    { "color": "magenta", "font-size": "24px", "font-family": "Comic Sans MS" }],
                "blank",
                "upgrades",
                "blank",
                "milestones",
                ["buyable",["15"]],
            ],
            unlocked() {if (player.n.points > 499) {return true} else {if (hasAchievement("a",13)) {return true} else {return false} }},
        },
        "Stardust Galaxies": {
            content: [
                ["display-text",
                    function() { return 'You have ' + format(getBuyableAmount("n",13)) + ' stardust galaxies' },
                    { "color": "blue", "font-size": "24px", "font-family": "Comic Sans MS" }],
                "blank",
                ["buyable",["13"]],
                ["buyable",["14"]],
                "blank",
                ["display-text",
                    function() { return 'You have ' + format(getBuyableAmount("n",14)) + ' stardust accelerators' },
                    { "color": "blue", "font-size": "24px", "font-family": "Comic Sans MS" }],
            ],
            unlocked() {if (hasUpgrade("n",12)) {return true} else {return hasMilestone("v",2)} },
        },
    },
    
    passiveGeneration() {if (player[this.layer].autonova == true) {return 0.2} else {return 0}},

    autocheck() {

        player.n.autoUpgrade = function() {return format(hasMilestone("t",5))}

    },

    upgrades: {
        11: {
            title: "ͱϘϱϟͳ",
            description: "multiply nova gain based off stardust",
            effectDisplay() { return "" + format(new Decimal(Math.log(player.points.add(1))).add(1)) + "x"},
            cost: new Decimal(1),
            canAfford() { if (player.crystalline >= this.cost) {return true} else {return false}},
            pay() { player.crystalline = player.crystalline.sub(this.cost)},
            currencyDisplayName: "Crystalline",
            currencyInternalName: "crystalline",
        },
        12: {
            title: "ζφͲϸ ϡϼϑ",
            description: "Unlocks stardust galaxies",
            effectDisplay() { return "..."},
            cost: new Decimal(1),
            canAfford() { if (player.crystalline >= this.cost) {return true} else {return false}},
            pay() { player.crystalline = player.crystalline.sub(this.cost)},
            currencyDisplayName: "Crystalline",
            currencyInternalName: "crystalline",
            unlocked() { return hasUpgrade("n",11)}
        },
        13: {
            title: "ξψϗϝϡͲ",
            description: "Doubles nova gain",
            effectDisplay() { return "..."},
            cost: new Decimal(1),
            canAfford() { if (player.crystalline >= this.cost) {return true} else {return false}},
            pay() { player.crystalline = player.crystalline.sub(this.cost)},
            currencyDisplayName: "Crystalline",
            currencyInternalName: "crystalline",
            unlocked() { return hasUpgrade("n",12)}
        },
        14: {
            title: "ϘϻϐϷ",
            description: "You keep formation betas on collapse",
            effectDisplay() { return "..."},
            cost: new Decimal(3),
            canAfford() { return player.crystalline.gte(this.cost) },
            pay() { player.crystalline = player.crystalline.sub(this.cost)},
            currencyDisplayName: "Crystalline",
            currencyInternalName: "crystalline",
            unlocked() { return hasUpgrade("n",13)}
        },
        15: {
            title: "ζγωϔͳ",
            description: "You keep formation alphas on collapse as well",
            effectDisplay() { return "..."},
            cost: new Decimal(5),
            canAfford() { return player.crystalline.gte(this.cost) },
            pay() { player.crystalline = player.crystalline.sub(this.cost)},
            currencyDisplayName: "Crystalline",
            currencyInternalName: "crystalline",
            unlocked() { return hasUpgrade("n",14)}
        },
        16: {
            title: "Ξσͱ϶ ϻϖ",
            description: "Multiplies stardust gain by 100.",
            effectDisplay() { return "100x"},
            cost: new Decimal(20),
            canAfford() { return player.crystalline.gte(this.cost) },
            pay() { player.crystalline = player.crystalline.sub(this.cost)},
            currencyDisplayName: "Crystalline",
            currencyInternalName: "crystalline",
            unlocked() { return hasUpgrade("n",15)}
        },
    },
    milestones: {
        0: {
            requirementDescription: "15 Crystalline",
            effectDescription: "Optionally gain 20% of nova gain per second, Also unlock stardust accelerators",
            done() { return player.crystalline.gte(15) },
            toggles: [["n", "autonova"]]
        }
    },
    clickables: {
        11: {
            display() {return "Obliterate all crystalline (YOU DO NOT GAIN ANYTHING, THIS ACTION IS NOT REVERSABLE)"},
            onClick() {player.crystalline = new Decimal(0)},
            canClick() {return true},
        },
        12: {
            display() {return "Obliterate all stardust accelerators (YOU DO NOT GAIN ANYTHING, THIS ACTION IS NOT REVERSABLE)"},
            onClick() {setBuyableAmount("n",14,0)},
            canClick() {return true},
        },
        21: {
            display() {return "Collapse for " + format(player.n.points.sub(499).pow(new Decimal(0.5))) + " crystalline"},
            onClick() {
                let get = player.n.points.sub(499).pow(new Decimal(0.5))
                if (getBuyableAmount("g",21).gte(1)) get = get.mul(buyableEffect("g",21))
                player.crystalline = player.crystalline.add(get)
                player.n.points = new Decimal(0)
                player.points = new Decimal(0)
            
            },
            canClick() {return (player.n.points.gte(500))},
            unlocked() {return (hasMilestone("v",0))}
        },
    }
}),



addLayer("a", {
    branches: [],
    name: "achievements", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "🏆", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    tooltip: "Achievements",
    color: "#FFEC00",
    requires: new Decimal(Infinity), // Can be a function that takes requirement increases into account
    resource: "achievements", // Name of prestige currency
    baseResource: "stardust", // Name of resource prestige is based on
    baseAmount() {return new Decimal(0)}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
    row: "side", // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},
    tabFormat: {
        "Achievements": {
            content: [
                "achievements"
            ],
        },
    },
    resetsNothing: true,
    doReset() {
        layerDataReset("a",["achievements"])
    },
    achievements: {
        11: {
            name: "Essence of creation",
            done() { return (player.n.points > 0) },
            tooltip: "Get 1 nova",
            unlocked() {return hasAchievement("a",11)},
            image: "data:image/jpeg;base64,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"
        },
        12: {
            name: "Stay in formation",
            done() { return (getBuyableAmount("n",11) > 4) },
            tooltip: "Aquire 5 formation alphas<br>Reward: 4x formation alpha's effect",
            unlocked() {return hasAchievement("a",12)},
            image: "data:image/jpeg;base64,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"
        },
        13: {
            name: "The great collapse",
            done() { return player.crystalline.gte(1) },
            tooltip: "Collapse your nova<br>Reward?: 1/3 stardust gain.",
            unlocked() {return hasAchievement("a",13)},
            image: "data:image/jpeg;base64,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"
        },
        14: {
            name: "Ten is a lot!",
            done() { return (player.crystalline > 9) },
            tooltip: "Get 10 crystalline",
            unlocked() {return hasAchievement("a",14)},
            image: "data:image/jpeg;base64,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"

        },
        15: {
            name: "Speedy",
            done() { return (getBuyableAmount("n",14) > 0) },
            tooltip: "Get a stardust accelerator",
            unlocked() {return hasAchievement("a",15)},
            image: "data:image/jpeg;base64,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"

        },
        21: {
            name: "Assimilation",
            done() { return (player.v.points.gte(1)) },
            tooltip: "Preform a void reset",
            unlocked() {return hasAchievement("a",21)},
            image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOAAAADgCAMAAAAt85rTAAAAA1BMVEUAAACnej3aAAAASElEQVR4nO3BMQEAAADCoPVPbQo/oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICXAcTgAAG6EJuyAAAAAElFTkSuQmCC"

        },
        22: {
            name: "Man figures out how to get more nothing...",
            done() { return (player.v.points.gte(3)) },
            tooltip: "...Doctors hate him!",
            unlocked() {return hasAchievement("a",22)},
            image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOAAAADgCAMAAAAt85rTAAAAA1BMVEUAAACnej3aAAAASElEQVR4nO3BMQEAAADCoPVPbQo/oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICXAcTgAAG6EJuyAAAAAElFTkSuQmCC"
        },
        23: {
            name: "Hey! It's me Goku!",
            done() { return (player.v.voidpower.gte(9001)) },
            tooltip: "Get over 9000 void power",
            unlocked() {return hasAchievement("a",23)},
            image: "data:image/png;base64,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"

        },
        24: {
            name: "I said not to do that!11!11!!",
            done() { return (hasChallenge("v",12)) },
            tooltip: "Break formation",
            unlocked() {return hasAchievement("a",24)},
            image: "data:image/png;base64,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"
        },
        25: {
            name: "Abyssal staredown",
            done() { return hasMilestone("v",4) },
            tooltip: "After all these years...",
            unlocked() {return hasAchievement("a",25)},
            image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOAAAADgCAMAAAAt85rTAAAAA1BMVEUAAACnej3aAAAASElEQVR4nO3BMQEAAADCoPVPbQo/oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICXAcTgAAG6EJuyAAAAAElFTkSuQmCC"
        },
        31: {
            name: "It's okay ig..",
            done() { return hasMilestone("t",3) },
            tooltip: "Aquire the essence of the gods.",
            unlocked() {return hasAchievement("a",31)},
            onComplete() {player.g.points = player.g.points.add(1)},
            image: "data:image/png;base64,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"
        },
        32: {
            name: "Yeah I have time.",
            done() { return player.t.points.gte(10) },
            tooltip: "Aquire 10 time generators<br>Reward: Automate void buyables costing nothing and get another god essence",
            unlocked() {return hasAchievement("a",32)},
            onComplete() {player.g.points = player.g.points.add(1)},
            image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAuASURBVHhe3Z3deuQ4CoaT7Onc/03O0VzAblYfJRSMQYAkV3r3fR7atsSfwHI5le6Zz7/++fj+UHz/q588AAX7fMknjkWGfUSPkeZWhRdjOFGTdG6MofvVj1ec5E5AdWr+P//TThbiwPYDtiy41lJtxoRDbtLYDXkXKF6lMV2P603SxrSUCWyyTSk1z1H2d8jKwlZBrKAx320undITuT/h0+DWkEtcXESJsI6UVQx7akTVp+FnG/YZ+c3EnWyl+w6h58DrdOAl4wXPJOUB27ZblhrBsB2OkY9EDFKRNZnYkFrCp8elIbfAFlBi2SETx2Ap7G7OVq6r/oJ1P/ehHiW7WpwMs0UXCxmqGv4ofCGG5NKQHUfHCe6kbYxCumRysfzxGI8n/Dy3Q36TSjOtQkqqN0b3BzMpYZzOvSEJozQzX5OFbqeQ/dlG6uCcpUOnkzxdDJvRFD46cmvIxXAVGaQImQRFiNySedSUaC4KsgDywjcUdHTk3COLF6EXgsIkIVNkdQByk90pHiu2m/nbDakkAt1IXzfFSHqnbh5uU5LByrVNGEQ/X5kNIb+zpDHHkkXaeLblCsTA5eWLTCvujKr+hNGIdvSa8kUBrUkeZ8GiWHaRfvnwQDMk1JSV3HuOIdX8Hb8/O0QUCNCd1a6H8BgmhV4KL9nm5xtF8uYnVFMAp78J5scPywxrntauuD+yAsdlgmIvNXiHYiwvv1uB2zUKHDVGo5uy9JaFJDOS5slHiYJ3PNl7otHzyNfSA22cG8PNiZok5+8NyVYyCAKyrkgv0xTE7EI24pokQ08KB0+03/HYZmnDQ88Dc01SOwZ6WH+TpR3yCF7ifWGQS9EshC6JgIZcwythnMaYV3FuRPMdjrXXkGSwDJQQ7xKq3kt44Zxwie4DB3ZA50ki3ZFXpBjMy7VdG7Ky6kmwyuIJGLSm8EKn6UC3HOBFZFZxjRypiIu5aM48sg4lEzbhIF7K5nhifeWmQLeJXu8XfdmFR0VXWGbHVpLxI3U24mo3U1eJOGgKvcFZcIAmlxcDxc8OYYOd5qzYVDkcI73UZFwqtNLl4ptNULr2I4uz5OZUqOpb/EbMDMk4oylN3B3j8NOQW+s6cIjGVGg29P7NtsWkXE75WYXXFMAqXklvCJ/2DrGQj7JAcLjAc1ks3ci+4n+HII45Xcgt35AGfRgF4gb3xjPs2D6Bk89Wmt2YGvK29VYefStJGTY0hD8sWcWwDd1l4jWd9A7JPg/DryeqhdjQv5jiwpJVxM2VdpNQLD2yjpApBOb/3SW92ispMyjtvHQ0u1VTj6MNoeQyW8krAsbaHH0etVM6QndWNIwLoc8x6FdQPrKkvsnVBDZnG5JoBgqGoF8ovCx0O3IjNKPIOAphfSmAjtApcPHBMR7kEk/w0xBOwpMD6ILTNQqN5gQxKHno8TkGJ0TzM4btoXVrdG7ymv6SA4rxFUj0GIDKDN0MBmPW+DZRQgEjL/hxfNE879wk0b+rpB2SKcgtOCfarzFPdznPC7xmAEPdJ5Nop6A6LdKY4rWxdDBP6y42RsNxvkqJ4w+VkATz2E3y2+NZMx7HybMK8teioXHEE2vXZP7VcelDPbs+Tu5Xm9F4NLZTjNEYKY1MM6BSf8tKrpISw4mT+FvQhdHSWPm38hlo/SJOlnpDLIpBNZvmU/jGMGWhYFUucRKx0g0hX/C+gpEIhuhx231yviwXuIIFbj48zIAxq6UY8Zy4YUNgw4Uz7PMI45HLbFXcBK1TSWLmXzIS+oGHpuGmk4JZHiqQ2xDMjzs4u7CI5nTE3vHJTmZSpdtZ5ivuCMvZjKb7harjOxmWPv7yYxStqyxBfk82eEYLNtaRZKZb8XMLjDs7Cf0QLqHG4KRaNO3I4h2N6MhQSM2THW7L8ZwWApmPrOjto+D/wqrdMomAvFRSDW4Y0x0PmpN13M+QbFNYjaT9MZOhmID0300ipqmSyTW5nvlbFpxMHCVjDPhrlc+NXzw9SfbnkqXUk0bThtAOTiaZBT4h9PuQ1pgnmjNSLvjlpxU1hV4v6XJKwX1aeb5DGmZT9PUibnM2fEvTkXsAN4Mx16zYSHHK519/331b3++QUh/HYRgZuh5ZVfLt3SpqPFOY6FV7ltdYt1bKBNYg92ALmNP6wxhCOfUjGDm2MRfMSTlB201ll1B0HkO6zhpe98W+H7kGWck8CoN+/YCmvLxeoSHMKeHmSUkTKSNGgZED7LgoPUc+j6CUlG7C7AL5kJ+Z7I+lkW7IjLFgIatQXjsOAii/FoSaIeGisCQpqBK0NNwU4sYY0saONOQomWZUq7CCLBQfDtwokZ8/ryEJaD29UO/Ae1wz2VQyTX39pzUyHLg7IjIJ/wqJnFJlhJ+oIbRFAm/kBzrZ5q1SaQbn83ROBWap0FxifdSPmR41gwVeE69uLhO7bMLMyKeaE9uwBJBKIS+Lio9XQ5rF5a91NmCPSe2HrqEndEvMbBd8Ip8wJ57T8zObRUx3I8mY8RkCff7yz2qEhPzD7uBuufhc8Ev5Shucs8yQep4UkSbjPOmPdohk1gjNkcYoyCdkwe9oyqFcAPlEHkVGGuRAwZND6YdbQwilFGHFPMFoTIWqfgLKoeJ3Vb+J3ZA/jcriniLarb2gaB7dSDxW5MgOIfWntsnTJPOmIremSKEmdRlNENB1sZb/dzskWd81lHNuwjTmsYZUHD1VBeTQZOkZ/odApSnks71DKNZqATw7jOs5PBpW4zDNnp7xTcbff8r6nN100Q2ZjdFY3iGYvqgUgl5gR1IMaM1oSoXmSzYAi4WfUT+OxceHoHhRDMxTjoVkuo1t4k6cI9sU6JkNmGHkz7Zkv7s2w/9AjL92CCtrwW+3WgHo17jtNITtHsT9POHxJqkGTBhNOAjtUryN4S9z4KaCcM6C+DPEMJpS1V+AFtRvlvEa2mKybMV3bLd2CfLqp9Tsdk07mJsiiBsCqokgkBHsJNO7OBGXVFwHNqSufVs+oNOFbhIatKEbSJBqSCnvngAF4sa8oUFVSmuKwLqwbpZ2yRJBOqIuuR0ChJFLT8YFPjJ+MkSrDeKspqELKBuwirQ915CeWMhqJao8GIebstMECT1Ner5nGmIkR+pexnh8vYNZzpucagYYabaTdEPcBIxmpHiwWAPEcOJshz/UEZ1ifocAvYp2vZyXzoSv9bhFJSh88QtF5LfN315GPDset+YKkLlYz8//YSfjWOq08+2bZBbbG1+F/XGRJX3OXI+0s2wB60hJQGoq6HWHRA7F/KwZZJ7tlheLETFTZHTb/PggxXk7ZNNN+QeBnjftP7IMC0q8jcnFbJOuRAPxPP1iPrSOdsdXwhNskI3l6NGwETz+DJEOrewxn03Oompr6WfHTpONofTo0rkT8h/q0a2EKKtFqNhKvZ2YpyjGj1KuvWUliP5i8pQoWyardxpvXdmc+TCpT64hhQKTKheMpYplJ/3hbed/DEpdr0mB2h3fIQCOpVyKGSR1oevTB3A7vfnM0v1ooZeTU0hfIsZFGhRTvD5f1tSIG8KaWQx9HbTCis1AFMIlu9syiWTiNagWTc+6Ic7ukETSpJJIGszcHbu7T/lZAbFV/Ph36pk7o8hoym4xdu0blMtvfiapOrwaws80NVmi2Lih7sRLueu2MnWWCuO5znXo5/zr4TH+FD1p5EH/mViSPnBJbgb0tBTh2Kv2wDMruWtJXOrQzxm6lo2RkoDUpEMDnjY/QzihS3NkEhRB4Y0nGLl2+yD3NKmUKsHYoZaDhB/ql+ZEwTcSvMQ5jOuy0gyPjTVblN6yKP8o+OEEZ6Ty6dzSOtEMxsiB440pQ0fCPzTOG2Ik/ZamFGyrdSXXq82Y2fWcp0tPrOvszyGSaWYHeUeMDC2P6KsRItDxGzK5G1K7BECHJUtFt5HKpc3T2xOkD1UppjXHcfb9/fHxX55RdLMw2oT8AAAAAElFTkSuQmCC"
        },
    },
}),



addLayer("v", {
    branches: ["n","t"],
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0), 
        voidpower: new Decimal(0),
        decaypoints: new Decimal(0),
        autoformation: false,
        autogalaxy: false,
    }},

    symbol: "ϰ",
    color: "#FFFFFF",                       // The color for this layer, which affects many elements.
    resource: "void",            // The name of this layer's main prestige resource.
    row: 1,                                 // The row this layer is on (0 is the first row).

    baseResource: "crystalline",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.crystalline },  // A function to return the current amount of baseResource.

    requires: new Decimal(200),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.
    type: "static",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.5,                          // "normal" prestige gain is (currency^exponent).

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        return new Decimal(1)               // Factor in any bonuses multiplying gain here.
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },

    hotkeys: [
        {key: "v", description: "V: Collapse your crystalline into void", onPress(){if (canReset(this.layer)) {
            doReset(this.layer)
                
        }}},
    ],
    doReset(resettingLayer) {
        player.crystalline = new Decimal(0)
        if (resettingLayer != "v") {if (hasMilestone("t",5)) {if (resettingLayer = "t") {if (hasMilestone("t",8)) {layerDataReset("v",["upgrades","milestones","autoformation","autogalaxy"])} else {layerDataReset("v",[])}} else {layerDataReset("v",["milestones","autoformation","autogalaxy"])}} else {layerDataReset("v",[])}}
    },
    layerShown(){return true},


    upgrades: {
        11: {
            title: "λξζ",
            description: "Triples void power gain.",
            effectDisplay() { if (hasUpgrade("v",12)) {return "6x"} else {return "3x"}},
            cost: new Decimal(1),
            canAfford() { if (player[this.layer].points.gte(this.cost) ) {return true} else {return false}},
            pay() { player[this.layer].points = player[this.layer].points.sub(this.cost)},
            unlocked() {return getBuyableAmount("v",11).gte(1)}
        },
        12: {
            title: "ζφϗ",
            description: "Doubles the previous upgrade's effect.",
            effectDisplay() { return "2x"},
            cost: new Decimal(1),
            canAfford() { if (player[this.layer].points.gte(this.cost) ) {return true} else {return false}},
            pay() { player[this.layer].points = player[this.layer].points.sub(this.cost)},
            unlocked() {return hasUpgrade("v",11)}
        },
        13: {
            title: "δΨϟ",
            description: "Unlock decay.",
            effectDisplay() { return "..."},
            cost: new Decimal(2),
            canAfford() { if (player[this.layer].points.gte(this.cost) ) {return true} else {return false}},
            pay() { player[this.layer].points = player[this.layer].points.sub(this.cost)},
            unlocked() {return hasUpgrade("v",11)}
        },
    },
    clickables: {
        11: {
            display() {return "Obliterate all void (YOU DO NOT GAIN ANYTHING, THIS ACTION IS NOT REVERSABLE)"},
            onClick() {player.v.points = new Decimal(0)},
            canClick() {return true},
        },
        12: {
            display() {return "gain 1 void"},
            onClick() {player.v.points = player.v.points.add(1)},
            canClick() {return true},
        },
        13: {
            display() {return "obliterate void generators"},
            onClick() {setBuyableAmount("v",11,new Decimal(0))},
            canClick() {return true},
        },
    },
    autocheck() {

        player.v.autoUpgrade = function() {return format(hasMilestone("t",8))}

    },
    tabFormat: {
        "Void": {
            content: [
                "main-display",
                ["display-text",
                    function() { return 'You have ' + format(player.v.voidpower) + ' void power, dissipating at a rate of 2%/frame, which is boosting the effect of formation betas by ' + format(player.v.voidpower.add(1).pow(0.5)) + "x" },
                    { "color": "white", "font-size": "12px", "font-family": "Comic Sans MS" }],
                "blank",
                "prestige-button",
                "blank",
                "milestones",
                "blank",
                ["buyables",["1"]],
                ["buyables",["2"]],
                ["upgrades",["1"]],
                ["clickable",["13"]],
                
            ],
        },
        "Decay": {
            content: [
                ["display-text",
                    function() { return 'You have ' + format(player.v.decaypoints) + ' decay, dissipating at a rate of 10%/frame, which is boosting void power gain by ' + format(player.v.decaypoints.add(1).pow(0.5)) + "x" },
                    { "color": "white", "font-size": "12px", "font-family": "Comic Sans MS" }],
                    ["challenge",["11"]],
                    ["challenge",["12"]],
            ],
            unlocked() {return hasUpgrade("v",13)},
        },
    },
    voidpowerstuff() {
        let get = new Decimal(buyableEffect("v",11))
        if (getBuyableAmount("v",22).gte(1)) {get = get.add(buyableEffect("v",22))}
        if (hasUpgrade("v",11)) {get = get.mul(3)}
        if (hasUpgrade("v",12)) {get = get.mul(2)}
        if (hasMilestone("v",2)) {get = get.mul(2)}
        if (hasUpgrade("v",13)) {get = get.mul(player.v.decaypoints.add(1).pow(0.5))}
        if (getBuyableAmount("g",23).gte(1)) get = get.mul(buyableEffect("g",23))
        if (getBuyableAmount("v",11).gte(1)) {player.v.voidpower = player.v.voidpower.add(get.mul(player.timespeed))}
        player.v.voidpower = player.v.voidpower.mul(0.98)

        if (hasUpgrade("v",13)) {
        let get = new Decimal(1)
        
        
        if (getBuyableAmount("g",31).gte(1)) get = get.mul(buyableEffect("g",31))
        player.v.decaypoints = player.v.decaypoints.add(get.mul(player.timespeed))
        player.v.decaypoints = player.v.decaypoints.mul(0.9)
        }
    },
    automate() {
        if (hasMilestone("t",7)) {
            if (hasUpgrade("v",13)) {player[this.layer].challenges[11] = new Decimal(1)}
            if (hasChallenge("v",11)) {player[this.layer].challenges[12] = new Decimal(1)}

        }
        if (hasAchievement("a",32)) { if (player.v.voidpower.gte(getBuyableAmount("v",21).add(1).pow(5).add(499))) {addBuyables("v",21,new Decimal(1))} }
        if (hasAchievement("a",32)) { if (player.v.voidpower.gte(getBuyableAmount("v",22).add(1).pow(10).add(499).mul(0.1))) {addBuyables("v",22,new Decimal(1))} }
        if (hasAchievement("a",32)) { if (player.v.points.gte(getBuyableAmount("v",11).add(1).pow(2).mul(0.5))) {addBuyables("v",11,new Decimal(1))} }


    },
    milestones: {
        0: {
            requirementDescription: "1 Void",
            effectDescription: "3x Stardust gain, Also removes the cap on nova.",
            done() { return player.v.points.gte(1) }
        },
        1: {
            requirementDescription: "2500 Void power",
            effectDescription: "0.5x Void engine cost, 0.1x Void enhancer cost.",
            done() { return player.v.voidpower.gte(2500) },
            unlocked() { return hasMilestone("v",0) }
        },
        2: {
            requirementDescription: "8893 Void power",
            effectDescription: "Double void power gain. Also unlock stardust galaxies by default and you are able to autobuy them, costing nothing.",
            done() { return player.v.voidpower.gte(8893) },
            unlocked() { return hasMilestone("v",1) },
            toggles: [["v", "autogalaxy"]]
        },
        3: {
            requirementDescription: "1000000 Void power",
            effectDescription: "You can autobuy formation alpha and betas, costing nothing.",
            done() { return player.v.voidpower.gte(1000000) },
            unlocked() { return hasMilestone("v",2) },
            toggles: [["v", "autoformation"]]
        },
        4: {
            requirementDescription: "4500000 Void power",
            effectDescription: "Autobuy stardust accelerators costing nothing and unlock Time.",
            done() { return player.v.voidpower.gte(1000000) },
            unlocked() { return hasMilestone("v",3) },
        },
    },
    buyables: {
        11: {
            cost(x) { let a =  new Decimal(x).add(1).pow(2) 
            if (hasMilestone("v",1)) {a = a.mul(0.5)}
            return a
            },
            title() { return "Void engine" },
            display() { return "Generates " + format(buyableEffect("v",11)) + " void power<br>Cost: " + format(this.cost()) + " void"},
            canAfford() { return player.v.points.gte(this.cost()) },
            buy() {
                player.v.points = player.v.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) { let a = new Decimal(x).add(1).pow(4).div(4)
                if (getBuyableAmount("g",32).gte(1)) a = a.mul(buyableEffect("g",32))
            return a
            },
        },
        21: {
            cost(x) { return new Decimal(x).add(1).pow(5).add(499) },
            title() { return "Void booster" },
            display() { return "Multiplies the effect of stardust galaxies by " + format(buyableEffect("v",21)) + "x<br>Cost: " + format(this.cost()) + " void power"},
            canAfford() { return player.v.voidpower.gte(this.cost()) },
            buy() {
                player.v.voidpower = player.v.voidpower.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) { let a = new Decimal(x).add(1).pow(2)
            return a
            },
        },
        22: {
            cost(x) { let a = new Decimal(x).add(1).pow(10).add(499)
            if (hasMilestone("v",1)) {a = a.mul(0.1)}
            return a
            },
            title() { return "Void enhancer" },
            display() { return "Before any multipliers, adds " + format(buyableEffect("v",22)) + " to void power gain.<br>Cost: " + format(this.cost()) + " void power"},
            canAfford() { return player.v.voidpower.gte(this.cost()) },
            buy() {
                player.v.voidpower = player.v.voidpower.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) { let a = new Decimal(x).pow(2).add(1)
            return a
            },
        },
    },
    challenges: {
        11: {
            name: "Time dialation",
            challengeDescription: "0.005x time speed",
            canComplete: function() {return player.crystalline.gte(1000)},
            goalDescription: "1000 crystalline",
            rewardDescription: "2x time speed",
        },
        12: {
            name: "Break formation",
            challengeDescription: "Stardust galaxies are boosted but formation alpha and beta do nothing and 0.01x time speed",
            canComplete: function() {return player.crystalline.gte(10)},
            goalDescription: "10 crystalline",
            rewardDescription: "1.3x time speed, and keep nova milestones on reset.",
            unlocked() {return (hasChallenge("v",11))}
        },
    },
}),

addLayer("t", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
        best: new Decimal(0),
        time: new Decimal(0),
    }},

    gettimespeed() {
        player.timespeed = new Decimal(1)
        if (hasChallenge("v",11)) {player.timespeed = player.timespeed.mul(2)}
        if (hasChallenge("v",12)) {player.timespeed = player.timespeed.mul(1.3)}
        if (inChallenge("v",11)) {player.timespeed = player.timespeed.mul(0.005)}
        if (inChallenge("v",12)) {player.timespeed = player.timespeed.mul(0.01)}
        if (getBuyableAmount("g",33).gte(1)) player.timespeed = player.timespeed.mul(buyableEffect("g",33))
        if (player.t.time.gte(1)) {player.timespeed = player.timespeed.mul(player.t.time.add(1).log(10).add(1).pow(2))}
    },

    symbol: "Ͳ",
    color: "#4BDC13",                       // The color for this layer, which affects many elements.
    resource: "time generators",            // The name of this layer's main prestige resource.
    row: 2,                                 // The row this layer is on (0 is the first row).

    baseResource: "void",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.v.points },  // A function to return the current amount of baseResource.

    requires: new Decimal(25),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.5,                          // "normal" prestige gain is (currency^exponent).

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        return new Decimal(1)               // Factor in any bonuses multiplying gain here.
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },

    hotkeys: [
        {key: "t", description: "T: Trade your void for time generators", onPress(){if (canReset(this.layer)) {
            doReset(this.layer)
                
        }}},
    ],

    tabFormat: {
        "Time": {
            content: [
                "main-display",
                ["display-text",
                    function() { return 'You have ' + format(player.t.time) + ' time, dissipating at a rate of 0.1%/frame, which is boosting time speed by ' + format(player.t.time.add(1).log(10).add(1).pow(2)) + "x" },
                    { "color": "lime", "font-size": "12px", "font-family": "Comic Sans MS" }],
                "blank",
                "prestige-button",
                "blank",
                "milestones",
                
            ],
        },
    },

    layerShown() { if (hasMilestone("v",4)) {return true} else {if (player.t.best.gte(1)) {return true} else {return false}} },          // Returns a bool for if this layer's node should be visible in the tree.
    timestuff() {
        let gain = player.t.points
        if (hasMilestone("t",2)) {gain = gain.mul(2)}

        player.t.time = player.t.time.add(gain)
        player.t.time = player.t.time.mul(0.999)

    },
    clickables: {
        11: {
            display() {return "Obliterate all time generators (YOU DO NOT GAIN ANYTHING, THIS ACTION IS NOT REVERSABLE)"},
            onClick() {player.t.points = new Decimal(0)},
            canClick() {return true},
        },
        12: {
            display() {return "gain 1 time generator"},
            onClick() {player.t.points = player.t.points.add(1)},
            canClick() {return true},
        },
    },
    milestones: {
        0: {
            requirementDescription: "1 Time generator",
            effectDescription: "2x Stardust gain.",
            done() { return player.t.points.gte(1) }
        },
        1: {
            requirementDescription: "2 Time generators",
            effectDescription: "2x Stardust gain",
            done() { return player.t.points.gte(2) },
            unlocked() {return hasMilestone("t",0)}
        },
        2: {
            requirementDescription: "3 Time generators",
            effectDescription: "2x Time generation",
            done() { return player.t.points.gte(3) },
            unlocked() {return hasMilestone("t",1)}
        },
        3: {
            requirementDescription: "4 Time generators",
            effectDescription: "Unlock god essence",
            done() { return player.t.points.gte(4) },
            unlocked() {return hasMilestone("t",2)}
        },
        4: {
            requirementDescription: "5 Time generators",
            effectDescription: "Gain 100% of crystalline gain on reset per second",
            done() { return player.t.points.gte(5) },
            unlocked() {return hasMilestone("t",3)}
        },
        5: {
            requirementDescription: "6 Time generators",
            effectDescription: "Autobuy nova upgrades and double auto crystalline gain.",
            done() { return player.t.points.gte(6) },
            unlocked() {return hasMilestone("t",4)}
        },
        6: {
            requirementDescription: "7 Time generators",
            effectDescription: "Keep void milestones on reset.",
            done() { return player.t.points.gte(7) },
            unlocked() {return hasMilestone("t",5)}
        },
        7: {
            requirementDescription: "9 Time generators",
            effectDescription: "You complete void challenges upon unlocking them.",
            done() { return player.t.points.gte(9) },
            unlocked() {return hasMilestone("t",6)}
        },
        8: {
            requirementDescription: "12 Time generators",
            effectDescription: "Keep nova milestones and void upgrades on time generator resets.",
            done() { return player.t.points.gte(12) },
            unlocked() {return hasMilestone("t",7)}
        },
    },
    upgrades: {
        // Look in the upgrades docs to see what goes here!
    },
}),



addLayer("g", {
    branches: [],
    name: "god essence", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "☀", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    tooltip: "God essence",
    color: "#fc7f03",
    requires: new Decimal(Infinity), // Can be a function that takes requirement increases into account
    resource: "god essence", // Name of prestige currency
    baseResource: "stardust", // Name of resource prestige is based on
    baseAmount() {return new Decimal(0)}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
    row: "side", // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},
    tabFormat: {
        "God perks": {
            content: [
                "main-display",
                ["buyables",[1]],
                ["buyables",[2]],
                ["buyables",[3]],
            ],
        },
    },
    buyables: {
        11: {
            cost() { return new Decimal(1) },
            display() { return "Alpha enrichment<br>Increases formation alpha's effect by " + format(this.effect(x)) + "x<br>Amount: " + format(getBuyableAmount(this.layer, this.id)) },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() { return new Decimal(1).add(getBuyableAmount(this.layer, this.id)).pow(getBuyableAmount(this.layer, this.id).add(1)) },
            sellOne() {
                if (getBuyableAmount(this.layer, this.id).gte(1)) {
                player.g.points = player.g.points.add(1)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(-1))
            }
            }
        },
        12: {
            cost() { return new Decimal(1) },
            display() { return "Beta enrichment<br>Increases formation beta's effect by " + format(this.effect(x)) + "x<br>Amount: " + format(getBuyableAmount(this.layer, this.id)) },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() { return new Decimal(1).add(getBuyableAmount(this.layer, this.id)).pow(getBuyableAmount(this.layer, this.id).add(1)) },
            sellOne() {
                if (getBuyableAmount(this.layer, this.id).gte(1)) {
                player.g.points = player.g.points.add(1)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(-1))
            }
            }
        },
        13: {
            cost() { return new Decimal(1) },
            display() { return "Nova drive<br>Increases nova gain by " + format(this.effect(x)) + "x<br>Amount: " + format(getBuyableAmount(this.layer, this.id)) },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() { return new Decimal(1).add(getBuyableAmount(this.layer, this.id)).pow(getBuyableAmount(this.layer, this.id).add(1)) },
            sellOne() {
                if (getBuyableAmount(this.layer, this.id).gte(1)) {
                player.g.points = player.g.points.add(1)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(-1))
            }
            }
        },
        21: {
            cost() { return new Decimal(1) },
            display() { return "Crystalline replicator<br>Increases crystalline gain by " + format(this.effect(x)) + "x<br>Amount: " + format(getBuyableAmount(this.layer, this.id)) },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() { return new Decimal(1).add(getBuyableAmount(this.layer, this.id)) },
            sellOne() {
                if (getBuyableAmount(this.layer, this.id).gte(1)) {
                player.g.points = player.g.points.add(1)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(-1))
            }
            }
        },
        22: {
            cost() { return new Decimal(1) },
            display() { return "Universal collapse<br>Increases the effect of stardust galaxies by " + format(this.effect(x)) + "x<br>Amount: " + format(getBuyableAmount(this.layer, this.id)) },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() { return new Decimal(1).add(getBuyableAmount(this.layer, this.id)).pow(getBuyableAmount(this.layer, this.id).add(1)) },
            sellOne() {
                if (getBuyableAmount(this.layer, this.id).gte(1)) {
                player.g.points = player.g.points.add(1)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(-1))
            }
            }
        },
        23: {
            cost() { return new Decimal(1) },
            display() { return "Void warper<br>Increases void power gain by " + format(this.effect(x)) + "x<br>Amount: " + format(getBuyableAmount(this.layer, this.id)) },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() { return new Decimal(1).add(getBuyableAmount(this.layer, this.id)) },
            sellOne() {
                if (getBuyableAmount(this.layer, this.id).gte(1)) {
                player.g.points = player.g.points.add(1)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(-1))
            }
            }
        },
        31: {
            cost() { return new Decimal(1) },
            display() { return "Oblivion<br>Increases decay gain by " + format(this.effect(x)) + "x<br>Amount: " + format(getBuyableAmount(this.layer, this.id)) },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() { return new Decimal(1).add(getBuyableAmount(this.layer, this.id)) },
            sellOne() {
                if (getBuyableAmount(this.layer, this.id).gte(1)) {
                player.g.points = player.g.points.add(1)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(-1))
            }
            }
        },
        32: {
            cost() { return new Decimal(1) },
            display() { return "Leaded gasoline<br>Increases the effect of void generators by " + format(this.effect(x)) + "x<br>Amount: " + format(getBuyableAmount(this.layer, this.id)) },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() { return new Decimal(1).add(getBuyableAmount(this.layer, this.id)) },
            sellOne() {
                if (getBuyableAmount(this.layer, this.id).gte(1)) {
                player.g.points = player.g.points.add(1)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(-1))
            }
            }
        },
        33: {
            cost() { return new Decimal(1) },
            display() { return "Time warper<br>Increases time speed by " + format(this.effect(x)) + "x<br>Amount: " + format(getBuyableAmount(this.layer, this.id)) },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() { return new Decimal(1).add(getBuyableAmount(this.layer, this.id).mul(0.1)) },
            sellOne() {
                if (getBuyableAmount(this.layer, this.id).gte(1)) {
                player.g.points = player.g.points.add(1)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(-1))
            }
            }
        },
    },
    resetsNothing: true,
    layerShown() {return hasAchievement("a",31)}
})