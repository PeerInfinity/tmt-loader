addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(2), // Can be a function that takes requirement increases into account
    resource: FIRSTPOINTS, // Name of prestige currency
    baseResource: BASEPOINTS, // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.9, // Prestige currency exponent
    canBuyMax() {return true},
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('p', 13)) mult = mult.times(upgradeEffect('p', 13))
        if (hasUpgrade('p', 21)) mult = mult.times(upgradeEffect('p', 21))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        newExp = new Decimal(1)
        if(inChallenge("d",12)) {newExp = new Decimal(0.5)}
        return newExp
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "p: select " + FIRSTPOINTS + " layer if unlocked", onPress(){if (player.p.unlocked === true) showTab('p')}},
        {key: "P", description: "P: Reset for " + FIRSTPOINTS + " if able", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    infoboxes: {
        lore: {
            title: "WELCOME",
            body: "This first layer is just your average prestige.  Eventually I think I will make the upgrades here cost " + BASEPOINTS + " instead of " + FIRSTPOINTS + "<br/><br/>" +
                  "I may or may not have implemented this yet, but for each layer, pressting the lower case letter ('p') should select the layer, and upper case ('P') should prestige the layer if possible.<br/><br/>" +
                  "Also, if you're familiar with other TPT mods, you should know this one works differently: layers are only reset along branches (or at least that will be my intention but I'm not sure I've figured out how yet)!<br /><br />"
        },
    },
    tabFormat: [
        ["infobox", "lore"],
        "main-display",
        "prestige-button",
        ["blank", "50px"],
        "buyables",
        "upgrades"
    ],
    
    layerShown(){return true},
    doReset(resettingLayer) {
        if(['d','b','c'].includes(resettingLayer)) {
            const testUpgradesToKeep = {
                11: hasMilestone("c",1),
                12: hasMilestone("c",1),
                13: hasMilestone("c",1),
                21: hasUpgrade("b", 11),

            }
            const upgradesToKeep = []
            for (let upgrade of player[this.layer].upgrades) {
                if (testUpgradesToKeep[upgrade]) {
                    upgradesToKeep.push(upgrade)
                }
            }
            layerDataReset(this.layer)
            player[this.layer].upgrades = upgradesToKeep

        }
    },
    resetsNothing() {
        return challengeEffect("d",11)
    },
    passiveGeneration() {
        return hasMilestone('c',0) ? 0.01 : null
    },
    upgrades: {
        11: {
            title: "Doubler",
            description: "Double your " + BASEPOINTS + " gain",
            cost: new Decimal(1),
        },
        12: {
            title: "PP boost",
            description: "Prestige Points boost " + BASEPOINTS + " gain",
            cost: new Decimal(2),
            effect() {
                return inChallenge("d",12) ? 1 : player[this.layer].points.add(1).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        13: {
            title: "third",
            description: BASEPOINTS + " boost Prestige Point gain",
            cost: new Decimal(5),
            effect() {
                return player.points.add(1).pow(0.15)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        21: {
            title: "B",
            description: "B points boost P points",
            cost: new Decimal(50),
            effect() {
                curEffect = new Decimal(1)
                curEffect = player.b.points.add(1).pow(0.15)
                if (hasUpgrade('b', 12)) curEffect = curEffect.times(upgradeEffect('b',12))
                return curEffect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }
        },



    },
/*    buyables: {
        31: {
            cost(x) {return 0},
            display() {return "cheat"},
            canAfford() {return true},
            buy() {
                player[this.layer].points = player[this.layer].points.add(10)
            }
        },
        32: {
            cost(x) {return 0},
            display() {return "UNcheat"},
            canAfford() {return true},
            buy() {
                player[this.layer].points = new Decimal(0)
                player["b"].points = new Decimal(0)
                player["c"].points = new Decimal(0)
                player[this.layer].upgrades = []
                player["b"].upgrades = []
                player["c"].upgrades = []

            }

        }
    },*/
    
})
