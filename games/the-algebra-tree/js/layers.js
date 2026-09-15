addLayer('Set', {
    name: "Set",
    symbol: "Set",
    position: 0,
    startData() { return {
        unlocked: true,
    }},
    color: "#FFFFFF",
    requires: new Decimal(0),
    baseResource: "Sets",
    baseAmount() {return player.points},
    resource: "Sets",
    type: "none",
    row: 0,
    layerShown(){return true},

    tabFormat: [
        "resource-display",
        "blank",
        "buyables",
        "blank",
        "upgrades",
    ],

    upgrades: {
        11: {
            fullDisplay() {
                return "At first, there was nothing.<br><br>Unlocks the Empty Set.<br><br>Cost: 1 Set"
            },
            canAfford() {
                return true
            },
            pay() {
                player.points = player.points.sub(1)
            },
        },
        12: {
            fullDisplay() {
                return "At last, there was conothing.<br><br>Unlocks the Singleton.<br><br>Cost: 50 Sets"
            },
            canAfford() {
                return player.points.gte(50)
            },
            pay() {
                player.points = player.points.sub(50)
            },
            unlocked () {
                return hasUpgrade(this.layer, 11)
            }
        },
        13: {
            fullDisplay() {
                return "Binary Operations?<br><br>Unlocks Magmas.<br><br>Cost: 500 Sets"
            },
            canAfford() {
                return player.points.gte(500)
            },
            pay() {
                player.points = player.points.sub(500)
            },
            unlocked () {
                return hasUpgrade(this.layer, 12) && ! player['Mag'].points.gte(1) && ! hasUpgrade('Mag', 11) && ! hasUpgrade('Mag', 12) && ! hasUpgrade('Mag', 13) && ! hasMilestone('NARg', 0)
            }
        },
        14: {
            fullDisplay() {
                return "Another pointless layer?<br><br>Unlocks Pointed Sets<br><br>Cost: 1e42 Sets"
            },
            canAfford() {
                return player.points.gte(1e42)
            },
            pay() {
                player.points = player.points.sub(1e42)
            },
            unlocked () {
                return player['Grp'].points.gte(7) && ! player['Set<sub>&lowast;</sub>'].points.gte(1) && ! hasMilestone('Grp', 5)
            }
        },
        21: {
            fullDisplay() {
                return "Gregor Kempers blessing<br><br>Sets boost Set gain.<br><br>Currently: " + format(this.effect()) + "x to Set gain<br><br>Cost: 9,001 Sets"
            },
            effect() {
                if (player.points.mul(-1).gte(0))
                    return new Decimal(1)
                return player.points.add(1).ln().add(1).pow((hasUpgrade('Set<sub>&lowast;</sub>', 15) ? 1.2 : 1))
            },
            canAfford() {
                return player.points.gte(9001)
            },
            pay() {
                player.points = player.points.sub(9001)
            },
            unlocked () {
                return hasUpgrade('QGrp', 12) || hasUpgrade('UMag', 21) || hasUpgrade('SGrp', 13)
            }
        },
    },

    buyables: {
        11: {
            title: "&empty;",
            cost(x) { return (x == 0) ? 0 : new Decimal(10).pow(x).mul(buyableEffect('SGrp', 12).mul(tmp['Grp'].effect)) },
            effect(x) {
                return buyableEffect('QGrp', 11).add(1).mul(x.add((hasUpgrade('FlexMag', 12) ? Math.round(getBuyableAmount(this.layer, 11).div(2)) : 0))).pow(tmp['FlexMag'].effect)
            },
            display() {
                if (hasUpgrade('FlexMag', 12))
                    return "You have " + getBuyableAmount(this.layer, this.id) + " + " + Math.round(getBuyableAmount(this.layer, 11).div(2)) + " Empty Sets<br><br>Effect: +" + format(buyableEffect(this.layer, this.id)) + " Set gain<br><br>Cost: " + format(this.cost()) + " Sets"
                return "You have " + getBuyableAmount(this.layer, this.id) + " Empty Sets<br><br>Effect: +" + format(buyableEffect(this.layer, this.id)) + " Set gain<br><br>Cost: " + format(this.cost()) + " Sets"
            },
            canAfford() {
                return player.points.gte(this.cost())
            },
            buy() {
                if (! hasMilestone('Grp', 0))
                    player.points = player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasUpgrade(this.layer, 11)
            }
        },
        12: {
            title: "&lowast;",
            cost(x) { return Math.round(new Decimal(2).pow(x.add(1)).mul(tmp['Grp'].effect).sub(buyableEffect('SGrp', 11)).sub(1)) },
            effect(x) {
                return x.add((hasUpgrade('FlexMag', 12)) ? Math.round(getBuyableAmount(this.layer, 12).div(2)) : 0).add(1).mul(buyableEffect('QGrp', 12)).pow(tmp['AltMag'].effect)
            },
            display() {
                if (hasUpgrade('FlexMag', 12))
                    return "You have " + getBuyableAmount(this.layer, this.id) + " + " + Math.round(getBuyableAmount(this.layer, 12).div(2)) + " Singletons<br><br>Effect: " + format(buyableEffect(this.layer, this.id)) + "x Set and Magma gain<br><br>Cost: " + this.cost() + " Empty Sets"
                if (hasUpgrade('SGrp', 21))
                    return "You have " + getBuyableAmount(this.layer, this.id) + " Singletons<br><br>Effect: " + format(buyableEffect(this.layer, this.id)) + "x Set and Magma gain<br><br>Cost: " + this.cost() + " Empty Sets"
                return "You have " + getBuyableAmount(this.layer, this.id) + " Singletons<br><br>Effect: " + format(buyableEffect(this.layer, this.id)) + "x Set gain<br><br>Cost: " + this.cost() + " Empty Sets"
            },
            canAfford() {
                return getBuyableAmount(this.layer, 11).gte(this.cost())
            },
            buy() {
                if (! hasMilestone('Grp', 0))
                    setBuyableAmount(this.layer, 11, getBuyableAmount(this.layer, 11).sub(Math.max(this.cost(), 0)))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasUpgrade(this.layer, 12)
            }
        },
        15: {
            title: "Devvvvv",
            cost(x) { return new Decimal(0) },
            canAfford() {
                return true
            },
            display() {
                return "+1 Moufang Loop leel"
            },
            buy() {
                player['MLoop'].points = player['MLoop'].points.add(1)
                player['MLoop'].total = player['MLoop'].total.add(1)
            },
            unlocked() {
                return false
            }
        },
        16: {
            title: "Devvvv",
            cost(x) { return new Decimal(0) },
            canAfford() {
                return true
            },
            display() {
                return "+1 Group leel"
            },
            buy() {
                player['Grp'].points = player['Grp'].points.add(1)
                player['Grp'].total = player['Grp'].total.add(1)
            },
            unlocked() {
                return false
            }
        },
        17: {
            title: "Devvv",
            cost(x) { return new Decimal(0) },
            canAfford() {
                return true
            },
            display() {
                return "x10 Sets leel"
            },
            buy() {
                player.points = player.points.mul(10)
            },
            unlocked() {
                return false
            }
        },
        18: {
            title: "Devv",
            cost(x) { return new Decimal(0) },
            canAfford() {
                return true
            },
            display() {
                return "x10 Magma leel"
            },
            buy() {
                player['Mag'].points = player['Mag'].points.mul(10)
            },
            unlocked() {
                return false
            }
        },
        19: {
            title: "Dev",
            cost(x) { return new Decimal(0) },
            canAfford() {
                return true
            },
            display() {
                return "+10 Magma leel"
            },
            buy() {
                player['Mag'].points = player['Mag'].points.add(10)
            },
            unlocked() {
                return false
            }
        },
    },

    automate() {
        if (hasMilestone('Mag', 0))
            buyBuyable(this.layer, 11)
        if (hasMilestone('Mag', 2))
            buyBuyable(this.layer, 12) 
    },

    branches: ['Mag', 'Set<sub>&lowast;</sub>']
})

addLayer('Mag', {
    startData() { return {                  
        unlocked: true,                    
        points: new Decimal(0),             
    }},

    color: "#A0A0A0",                      
    resource: "Magmas",            
    row: 1,
    position: 0,                    

    baseResource: "Sets",                 
    baseAmount() { return player.points }, 

    requires: new Decimal(100),              
                                            
    type: "normal",                        
    exponent: 0.5,                          

    effect() {
        return player[this.layer].points.add(1).ln().add(1).pow((hasUpgrade('UMag', 22)) ? 2 : 1)
    },

    gainMult() {
        mul = new Decimal (1)
        if (hasUpgrade('QGrp', 21))
            mul = mul.mul(upgradeEffect('QGrp', 21))
        mul = mul.mul(buyableEffect('UMag', 11))
        if (hasUpgrade('UMag', 21))
            mul = mul.mul(upgradeEffect('UMag', 21))
        mul = mul.mul(buyableEffect('SGrp', 21))
        if (hasUpgrade('SGrp', 21))
            mul = mul.mul(buyableEffect('Set', 12))
        if (hasUpgrade('Loop', 21))
            mul = mul.mul(buyableEffect('Loop', 11))
        if (hasUpgrade('AssQGrp', 21))
            mul = mul.mul(upgradeEffect('AssQGrp', 21))
        mul = mul.mul(buyableEffect('Grp', 13))
        if (hasUpgrade('Grp', 13))
            mul = mul.mul(upgradeEffect('Grp', 13))
        if (hasUpgrade('FlexMag', 11))
            mul = mul.mul(upgradeEffect('FlexMag', 11))
        if (hasUpgrade('AltMag', 11))
            mul = mul.mul(upgradeEffect('AltMag', 11))
        if (hasUpgrade('Set<sub>&lowast;</sub>', 23))
            mul = mul.mul(upgradeEffect('Set<sub>&lowast;</sub>', 23))

        return mul             
    },
    gainExp() {                             
        return new Decimal(1)
    },

    layerShown() {
        return hasUpgrade('Set', 13) || player[this.layer].points.gte(1) || hasUpgrade(this.layer, 11) || hasUpgrade(this.layer, 12) || hasUpgrade(this.layer, 13) || hasMilestone('FlexMag', 0)
    },
    
    tabFormat: [
        "main-display",
        ["display-text",
            function() { return "which boost Set gain by " + format(tmp[this.layer].effect) },
        ],
        "blank",
        "prestige-button",
        "blank",
        "resource-display",
        ["display-text",
            function() { return "A Magma (M, &middot;) is a Set M together with a binary operation _&middot;_ : M &times; M &rarr; M" },
        ],
        "blank",
        "blank",
        "blank",
        ["display-text",
            function() { return "Choose one carefully." },
            {"font-size": "32px"},
        ],
        "upgrades",
        "blank",
        "milestones",
    ],

    upgrades: {
        11: {
            title: "Divisibility",
            description: "You can divide now.",
            cost: new Decimal(5),
            unlocked() {
                return hasMilestone(this.layer, 4) || (hasMilestone(this.layer, 1) && ! (hasUpgrade(this.layer, 12) && hasUpgrade(this.layer, 13))) || (! hasUpgrade(this.layer, 12) && ! hasUpgrade(this.layer, 13))
            }
        },
        12: {
            title: "Unitality",
            description: "You have a unit now.",
            cost: new Decimal(5),
            unlocked() {
                return hasMilestone(this.layer, 4) || (hasMilestone(this.layer, 1) && ! (hasUpgrade(this.layer, 11) && hasUpgrade(this.layer, 13))) || (! hasUpgrade(this.layer, 11) && ! hasUpgrade(this.layer, 13))
            }
        },
        13: {
            title: "Associativity",
            description: "You are associative now.",
            cost: new Decimal(5),
            unlocked() {
                return hasMilestone(this.layer, 4) || (hasMilestone(this.layer, 1) && ! (hasUpgrade(this.layer, 11) && hasUpgrade(this.layer, 12))) || (! hasUpgrade(this.layer, 11) && ! hasUpgrade(this.layer, 12))
            }
        },
        21: {
            fullDisplay() {
                return "You can have both?<br><br>Unlocks Loops.<br><br>Cost: " + format(new Decimal(5e6).mul((hasUpgrade(this.layer, 22)) ? 100 : 1).mul((hasUpgrade(this.layer, 23)) ? 5000 : 1).div((hasUpgrade(this.layer, 22) && hasUpgrade(this.layer, 23)) ? 25 : 1)) + " Sets"
            },
            canAfford() {
                return player.points.gte(new Decimal(5e6).mul((hasUpgrade(this.layer, 22)) ? 100 : 1).mul((hasUpgrade(this.layer, 23)) ? 5000 : 1).div((hasUpgrade(this.layer, 22) && hasUpgrade(this.layer, 23)) ? 25 : 1))
            },
            pay() {
                player.points = player.points.sub(new Decimal(5e6).mul((hasUpgrade(this.layer, 22)) ? 100 : 1).mul((hasUpgrade(this.layer, 23)) ? 5000 : 1).div((hasUpgrade(this.layer, 22) && hasUpgrade(this.layer, 23)) ? 25 : 1))
            },
            unlocked () {
                return hasUpgrade('Mag', 11) && hasUpgrade('Mag', 12)
            }
        },
        22: {
            fullDisplay() {
                return "Can you have both?<br><br>Unlocks Associative Quasigroups.<br><br>Cost: " + format(new Decimal(5e6).mul((hasUpgrade(this.layer, 21)) ? 1000 : 1).mul((hasUpgrade(this.layer, 23)) ? 5000 : 1).div((hasUpgrade(this.layer, 21) && hasUpgrade(this.layer, 23)) ? 25 : 1)) + " Sets"
            },
            canAfford() {
                return player.points.gte(new Decimal(5e6).mul((hasUpgrade(this.layer, 21)) ? 1000 : 1).mul((hasUpgrade(this.layer, 23)) ? 5000 : 1).div((hasUpgrade(this.layer, 21) && hasUpgrade(this.layer, 23)) ? 25 : 1))
            },
            pay() {
                player.points = player.points.sub(new Decimal(5e6).mul((hasUpgrade(this.layer, 21)) ? 1000 : 1).mul((hasUpgrade(this.layer, 23)) ? 5000 : 1).div((hasUpgrade(this.layer, 21) && hasUpgrade(this.layer, 23)) ? 25 : 1))
            },
            unlocked () {
                return hasUpgrade('Mag', 11) && hasUpgrade('Mag', 13)
            }
        },
        23: {
            fullDisplay() {
                return "Both you can have.<br><br>Unlocks Monoids.<br><br>Cost: " + format(new Decimal(5e6).mul((hasUpgrade(this.layer, 21)) ? 1000 : 1).mul((hasUpgrade(this.layer, 22)) ? 100 : 1).div((hasUpgrade(this.layer, 21) && hasUpgrade(this.layer, 22)) ? 20 : 1)) + " Sets"
            },
            canAfford() {
                return player.points.gte(new Decimal(5e6).mul((hasUpgrade(this.layer, 21)) ? 1000 : 1).mul((hasUpgrade(this.layer, 22)) ? 100 : 1).div((hasUpgrade(this.layer, 21) && hasUpgrade(this.layer, 22)) ? 20 : 1))
            },
            pay() {
                player.points = player.points.sub(new Decimal(5e6).mul((hasUpgrade(this.layer, 21)) ? 1000 : 1).mul((hasUpgrade(this.layer, 22)) ? 100 : 1).div((hasUpgrade(this.layer, 21) && hasUpgrade(this.layer, 22)) ? 20 : 1))
            },
            unlocked () {
                return hasUpgrade('Mag', 12) && hasUpgrade('Mag', 13)
            }
        },
        31: {
            fullDisplay() {
                return "Finally, all three.<br><br>Unlocks Groups.<br><br>Cost: 1e14 Sets"
            },
            canAfford() {
                return player.points.gte(1e14)
            },
            pay() {
                player.points = player.points.sub(1e14)
            },
            unlocked () {
                return hasUpgrade('Mag', 21) && hasUpgrade('Mag', 22) && hasUpgrade('Mag', 23) && ! player['Grp'].total.gte(1)
            }
        },
        32: {
            fullDisplay() {
                return "A Flexibility?<br><br>Unlocks Flexible Magmas<br><br>Cost: 6 Singletons"
            },
            canAfford() {
                return getBuyableAmount('Set', 12).gte(6)
            },
            pay() {
                setBuyableAmount('Set', 12, getBuyableAmount('Set', 12).sub(6))
            },
            unlocked () {
                return hasMilestone('Grp', 0) && ! player['FlexMag'].total.gte(1) && ! player['AltMag'].total.gte(1) && ! hasMilestone('AltMag', 1) && ! hasMilestone('MLoop', 1)
            }
        },
        33: {
            fullDisplay() {
                return "An Alternative?<br><br>Unlocks Alternative Magmas<br><br>Cost: 1e28 Sets"
            },
            canAfford() {
                return player.points.gte(1e28)
            },
            pay() {
                player.points = player.points.sub(1e28)
            },
            unlocked () {
                return player['FlexMag'].total.gte(3) && ! player['AltMag'].total.gte(1)  && ! hasMilestone('MLoop', 1)
            }
        },
        34: {
            fullDisplay() {
                return "A ...? Nevermind.<br><br>Unlocks Moufang Loops<br><br>Cost: 5e52 Sets"
            },
            canAfford() {
                return player.points.gte(5e52)
            },
            pay() {
                player.points = player.points.sub(5e52)
            },
            unlocked () {
                return hasUpgrade('Set<sub>&lowast;</sub>', 15) && ! player['MLoop'].total.gte(1)
            }
        },
    },

    milestones: {
        0: {
            requirementDescription: "100 Magmas",
            effectDescription: "Autobuy Empty Sets",
            done() { return player[this.layer].points.gte(100) || hasMilestone('NARg', 0) }
        },
        1: {
            requirementDescription: "1,000 Magmas",
            effectDescription: "You may choose once more",
            done() { return player[this.layer].points.gte(1000) || hasMilestone('NARg', 0) }
        },
        2: {
            requirementDescription: "1,000,000 Magmas",
            effectDescription: "Autobuy Singletons",
            done() { return player[this.layer].points.gte(1e6) || hasMilestone('NARg', 0) }
        },
        3: {
            requirementDescription: "10,000,000 Magmas",
            effectDescription: "Get 10% of Magma gain per second",
            done() { return player[this.layer].points.gte(1e7) || hasMilestone('NARg', 0) }
        },
        4 : {
            requirementDescription: "100,000,000 Magmas",
            effectDescription: "Your choices did not matter",
            done() { return player[this.layer].points.gte(1e8) || hasMilestone('NARg', 0) }
        },
    },  

    passiveGeneration() {
        if (hasMilestone('FlexMag', 1))
            return new Decimal(10)
        if (hasMilestone('FlexMag', 0))
            return new Decimal(1)
        if (hasMilestone(this.layer, 3))
            return new Decimal(0.1)
        return new Decimal(0)
    },

    branches: ['QGrp', 'UMag', 'SGrp', 'FlexMag']
})

addLayer('Set<sub>&lowast;</sub>', {
    startData() { return {                  
        unlocked: true,                    
        points: new Decimal(0),    
        generatorPoints: new Decimal(0)         
    }},

    color: "#A0A0F0",                      
    resource: "Pointed Sets",            
    row: 1,
    position: 1,                         

    baseResource: "Sets",                 
    baseAmount() { return player.points }, 

    requires: new Decimal(1e42),              
                                            
    type: "normal",                        
    exponent: 0.5,

    effect() {
        return player[this.layer].generatorPoints.add(1).ln().add(1).pow((hasUpgrade(this.layer, 12) ? 1.2 : 1))
    },

    pointGeneration() {
        return player[this.layer].points.mul((hasUpgrade(this.layer, 22)) ? upgradeEffect(this.layer, 22) : 1).mul((hasUpgrade(this.layer, 24)) ? tmp['Mag'].effect : 1).pow((hasUpgrade(this.layer, 11) ? 1.2 : 1))
    },

    update(diff) {
        player[this.layer].generatorPoints = player[this.layer].generatorPoints.add(tmp[this.layer].pointGeneration.mul(diff))
    },

    gainMult() {
        mul = new Decimal (1)

        if (hasUpgrade(this.layer, 13))
            mul = mul.mul(upgradeEffect(this.layer, 13))

        return mul             
    },
    gainExp() {                             
        return new Decimal(1)
    },  

    layerShown() {
        return hasUpgrade('Set', 14) || player[this.layer].points.gte(1)
    },
    
    tabFormat: [
        "main-display",
        ["display-text",
            function() { return "which generate " + format(tmp[this.layer].pointGeneration) + " Points per second" },
        ],
        "blank",
        "prestige-button",
        "blank",
        "resource-display",
        ["display-text",
            function() { return "A Pointed Set (S, p) is a Set S together with a nullary operation p : &lowast; &rarr; S" },
        ],
        "blank",
        ["display-text",
            function() { return "You have " + format(player[this.layer].generatorPoints) + " Points which boost Set gain by " + format(tmp[this.layer].effect) },
        ],
        "blank",
        "buyables",
        "blank",
        "upgrades",
        "blank",
        "milestones",
    ],

    upgrades: {
        11: {
            fullDisplay() {
                return "Ulrich Bauers blessing<br><br>Improves Point generation formula<br><br>Cost: 5,000 Points"
            },
            canAfford() {
                return player[this.layer].generatorPoints.gte(5000)
            },
            pay() {
                player[this.layer].generatorPoints = player[this.layer].generatorPoints.sub(5000)
            },
            unlocked() {
                return hasMilestone('AltMag', 2)
            }
        },
        12: {
            fullDisplay() {
                return "Ulrich Bauers second blessing<br><br>Improves Point effect formula<br><br>Cost: 1,000,000 Points"
            },
            canAfford() {
                return player[this.layer].generatorPoints.gte(1e6)
            },
            pay() {
                player[this.layer].generatorPoints = player[this.layer].generatorPoints.sub(1e6)
            },
            unlocked() {
                return hasMilestone('AltMag', 2)
            }
        },
        13: {
            fullDisplay() {
                return "Ulrich Bauers third blessing<br><br>Points boost Pointed Set gain<br><br>Currently: " + format(this.effect()) + "x to Pointed Set gain<br><br>Cost: 10,000,000 Points"
            },
            effect() {
                return tmp[this.layer].effect.pow(0.5)
            },
            canAfford() {
                return player[this.layer].generatorPoints.gte(1e7)
            },
            pay() {
                player[this.layer].generatorPoints = player[this.layer].generatorPoints.sub(1e7)
            },
            unlocked() {
                return hasMilestone('AltMag', 2)
            }
        },
        14: {
            fullDisplay() {
                return "At fourth or something, whatever.<br><br>Unlocks the Trivial Pointed Set<br><br>Cost: 100,000,000 Points"
            },
            canAfford() {
                return player[this.layer].generatorPoints.gte(1e8)
            },
            pay() {
                player[this.layer].generatorPoints = player[this.layer].generatorPoints.sub(1e8)
            },
            unlocked() {
                return hasMilestone('AltMag', 2)
            }
        },
        15: {
            fullDisplay() {
                return "Gregor Kempers second blessing<br><br>Improves Gregor Kempers blessing formula<br><br>Cost: 1e10 Points"
            },
            canAfford() {
                return player[this.layer].generatorPoints.gte(1e10)
            },
            pay() {
                player[this.layer].generatorPoints = player[this.layer].generatorPoints.sub(1e10)
            },
            unlocked() {
                return hasMilestone('AltMag', 2)
            }
        },
        21: {
            fullDisplay() {
                return "David Mundeliuss blessing<br><br>Points boost Point gain.<br><br>Currently: " + format(this.effect()) + "x to Point gain<br><br>Cost: 1e20 Points"
            },
            effect() {
                return player[this.layer].generatorPoints.add(1).ln().add(1)
            },
            canAfford() {
                return player[this.layer].generatorPoints.gte(1e20)
            },
            pay() {
                player[this.layer].generatorPoints = player[this.layer].generatorPoints.sub(1e20)
            },
            unlocked() {
                return hasMilestone('AltMag', 2)
            }
        },
        22: {
            fullDisplay() {
                return "David Mundeliuss second blessing<br><br>Pointed Sets boost Point gain.<br><br>Currently: " + format(this.effect()) + "x to Point gain<br><br>Cost: 1e24 Points"
            },
            effect() {
                return player[this.layer].points.add(1).ln().add(1)
            },
            canAfford() {
                return player[this.layer].generatorPoints.gte(1e24)
            },
            pay() {
                player[this.layer].generatorPoints = player[this.layer].generatorPoints.sub(1e24)
            },
            unlocked() {
                return hasMilestone('AltMag', 2)
            }
        },
        23: {
            fullDisplay() {
                return "David Mundeliuss third blessing<br><br>Points boost Magma gain.<br><br>Currently: " + format(this.effect()) + "x to Magma gain<br><br>Cost: 1e53 Points"
            },
            effect() {
                return player[this.layer].generatorPoints.add(1).ln().add(1)
            },
            canAfford() {
                return player[this.layer].generatorPoints.gte(1e53)
            },
            pay() {
                player[this.layer].generatorPoints = player[this.layer].generatorPoints.sub(1e53)
            },
            unlocked() {
                return hasMilestone('AltMag', 2)
            }
        },
        24: {
            fullDisplay() {
                return "David Mundeliuss fourth blessing<br><br>Magma layer effect boosts Point gain.<br><br>Cost: 1e57 Points"
            },
            canAfford() {
                return player[this.layer].generatorPoints.gte(1e57)
            },
            pay() {
                player[this.layer].generatorPoints = player[this.layer].generatorPoints.sub(1e57)
            },
            unlocked() {
                return hasMilestone('AltMag', 2)
            }
        },
    },

    buyables: {
        11: {
            title: "&lowast;",
            cost(x) { return new Decimal(5e8).pow(x.add(1)).mul(tmp['Grp'].effect) },
            effect(x) {
                effect = new Decimal(0.05).mul(x).add(1)

                if (! effect.gte(1.2))
                    return effect

                return effect.sub(0.2).pow(0.1).add(0.2)
            },
            display() {
                return "You have " + getBuyableAmount(this.layer, this.id) + " Trivial Pointed Sets<br><br>Effect: ^" + format(buyableEffect(this.layer, this.id)) + " to Set gain<br><br>Cost: " + format(this.cost()) + " Points"
            },
            canAfford() {
                return player[this.layer].generatorPoints.gte(this.cost())
            },
            buy() {
                if (! hasMilestone('Grp', 8))
                    player[this.layer].generatorPoints = player[this.layer].generatorPoints.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasUpgrade(this.layer, 14)
            }
        },
    },

    passiveGeneration() {
        if (hasMilestone('Grp', 5))
            return new Decimal(0.01)
        return new Decimal(0)
    },

    automate() {
        if (hasMilestone('Grp', 8)) {
            buyBuyable(this.layer, 11)
        }
    },

    branches: ['UMag']
})

addLayer('QGrp', {
    startData() { return {                  
        unlocked: true,                    
        points: new Decimal(0),             
    }},

    color: "#FF0000",                      
    resource: "Quasigroups",
    type: "none",          
    row: 2,
    position: 0,                         

    baseResource: "Magmas",                 
    baseAmount() { return player['Mag'].points },                        

    layerShown() {
        return hasUpgrade('Mag', 11)
    },
    
    tabFormat: [
        "resource-display",
        ["display-text",
            function() { return "A Quasigroup (Q, &middot;, /, \\) is a Magma (Q, &middot;) together with binary operations _/_, _\\_ : Q &times; Q &rarr; Q such that the following commute" },
        ],
        "blank",
        ["display-image",
            'https://i.imgur.com/ZIWhJNX.png'
        ],
        "blank",
        "buyables",
        "blank",
        "upgrades",
    ],

    upgrades: {
        11: {
            fullDisplay() {
                return "At first, there was nothing.<br><br>Unlocks the Empty Quasigroup.<br><br>Cost: 1 Magma"
            },
            canAfford() {
                return player['Mag'].points.gte(1)
            },
            pay() {
                player['Mag'].points = player['Mag'].points.sub(1)
            },
        },
        12: {
            fullDisplay() {
                return "At last, there was conothing.<br><br>Unlocks the Trivial Quasigroup.<br><br>Cost: 10 Magmas"
            },
            canAfford() {
                return player['Mag'].points.gte(10)
            },
            pay() {
                player['Mag'].points = player['Mag'].points.sub(10)
            },
            unlocked () {
                return hasUpgrade(this.layer, 11)
            }
        },
        21: {
            fullDisplay() {
                return "Finite Quasigroups are Latin Squares.<br><br>Quasigroup count boosts Magma gain.<br><br>Currently: " + format(this.effect()) + "x to Magma gain<br><br>Cost: 150 Magmas"
            },
            effect () {
                return getBuyableAmount(this.layer, 11).add(getBuyableAmount(this.layer, 12)).mul(2).add(1)
            },
            canAfford() {
                return player['Mag'].points.gte(150)
            },
            pay() {
                player['Mag'].points = player['Mag'].points.sub(150)
            },
            unlocked () {
                return hasUpgrade(this.layer, 12)
            }
        },
    },

    buyables: {
        11: {
            title: "&empty;",
            cost(x) { return Math.round(new Decimal(2.5).pow(x.add(1)).mul(buyableEffect('AssQGrp', 12)).mul(tmp['Grp'].effect)) },
            effect(x) {
                return x.mul(new Decimal(0.5).add(buyableEffect('Grp', 14))).mul((hasUpgrade('Loop', 22)) ? buyableEffect('Loop', 11) : 1).pow(buyableEffect('FlexMag', 11))
            },
            display() {
                return "You have " + getBuyableAmount(this.layer, this.id) + " Empty Quasigroups<br><br>Effect: +" + format(buyableEffect(this.layer, this.id)) + " to Empty Set effect base<br><br>Cost: " + this.cost() + " Empty Sets"
            },
            canAfford() {
                return getBuyableAmount('Set', 11).gte(this.cost())
            },
            buy() {
                if (! hasMilestone('Grp', 2))
                    setBuyableAmount('Set', 11, getBuyableAmount('Set', 11).sub(this.cost()))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasUpgrade(this.layer, 11)
            }
        },
        12: {
            title: "&lowast;",
            cost(x) { return Math.round(new Decimal(1.5).pow(x.add(1)).mul(tmp['Grp'].effect).sub(buyableEffect('AssQGrp', 11))) },
            effect(x) {
                return new Decimal(1.25).mul(buyableEffect('Loop', 11)).pow(x)
            },
            display() {
                return "You have " + getBuyableAmount(this.layer, this.id) + " Trivial Quasigroups<br><br>Effect: " + format(buyableEffect(this.layer, this.id)) + "x to Singleton effect base<br><br>Cost: " + this.cost() + " Singletons"
            },
            canAfford() {
                return getBuyableAmount('Set', 12).gte(this.cost())
            },
            buy() {
                if (! hasMilestone('Grp', 2))
                    setBuyableAmount('Set', 12, getBuyableAmount('Set', 12).sub(Math.max(this.cost(), 0)))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasUpgrade(this.layer, 12)
            }
        },
    },

    automate() {
        if (hasMilestone('Grp', 2)) {
            buyBuyable(this.layer, 11)
            buyBuyable(this.layer, 12)
        }
    },

    branches: ['Loop', 'AssQGrp']
})

addLayer('FlexMag', {
    startData() { return {                  
        unlocked: true,                    
        points: new Decimal(0),
        total: new Decimal(0),          
    }},

    color: "#ADBCA5",                      
    resource: "Flexible Magmas",            
    row: 2,
    position: -1,       

    baseResource: "Magmas",                 
    baseAmount() { return player['Mag'].points }, 

    requires: new Decimal(1e24),
                                            
    type: "static",
    base: new Decimal(10),
    exponent: new Decimal(1.4325),

    effect() {
        effect = new Decimal(0.1).mul(player[this.layer].points).add(1).pow(tmp['MLoop'].effect)

        if (! effect.gte(4))
            return effect

        return effect.sub(3).pow(0.1).add(3)
    },

    gainMult() {
        mul = new Decimal(1)
        
        if (hasUpgrade('Grp', 14))
            mul = mul.mul(upgradeEffect('Grp', 14))

        return mul
    },
    
    gainExp() {
        return new Decimal(1)
    },

    layerShown() {
        return hasUpgrade('Mag', 32) || player[this.layer].total.gte(1) || player['AltMag'].total.gte(1)
    },
    
    tabFormat: [
        "main-display",
        ["display-text",
            function() { return "which raises Empty Set effect to the " + format(tmp[this.layer].effect)},
        ],
        "blank",
        "prestige-button",
        "blank",
        "resource-display",
        "blank",
        ["display-text",
            function() { return "A Flexible Magma (F, &middot;) is a Magma (F, &middot;) such that the following commutes" },
        ],
        "blank",
        ["display-image",
            'https://i.imgur.com/uw9rc5n.png'
        ],
        "blank",
        "buyables",
        "blank",
        "upgrades",
        "blank",
        "milestones",
    ],

    upgrades: {
        11: {
            fullDisplay() {
                return "Most natural Flexible Magmas are non-associative Algebras.<br><br>Flexible Magma count boosts Magma gain.<br><br>Currently: " + format(this.effect()) + "x to Magma gain<br><br>Cost: 3 Sedenions"
            },
            effect() {
                return new Decimal(5).pow(getBuyableAmount(this.layer, 11))
            },
            canAfford() {
                return getBuyableAmount(this.layer, 11).gte(3)
            },
            pay() {
                setBuyableAmount(this.layer, 11, getBuyableAmount(this.layer, 11).sub(3))
            },
            unlocked() {
                return player[this.layer].points.gte(3)
            }
        },
        12: {
            fullDisplay() {
                return "Folkmar Bornemanns blessing<br><br>Get +50% simulated Empty Sets and Singletons.<br><br>Cost: 4 Sedenions"
            },
            canAfford() {
                return getBuyableAmount(this.layer, 11).gte(4)
            },
            pay() {
                setBuyableAmount(this.layer, 11, getBuyableAmount(this.layer, 11).sub(4))
            },
            unlocked() {
                return player[this.layer].points.gte(7) && hasUpgrade('SGrp', 21)
            }
        },
    },

    buyables: {
        11: {
            title: "𝕊",
            cost(x) { return Math.round(new Decimal(1e10).pow(x).mul(tmp['Grp'].effect)) },
            effect(x) {
                return new Decimal(0.05).mul(x).add(1).pow(buyableEffect('AltMag', 11))
            },
            display() {
                return "You have " + getBuyableAmount(this.layer, this.id) + " Sedenions<br><br>Effect: ^" + format(buyableEffect(this.layer, this.id)) + " to Empty Quasigroup effect<br><br>Cost: " + format(this.cost()) + " Magmas"
            },
            canAfford() {
                return player['Mag'].points.gte(this.cost())
            },
            buy() {
                if (! hasMilestone('Grp', 6))
                    player['Mag'].points = player['Mag'].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return player[this.layer].total.gte(2)
            }
        },
    },
    
    milestones: {
        0: {
            requirementDescription: "1 Flexible Magma total",
            effectDescription: "Get 100% of Magma gain per second",
            done() { return player[this.layer].total.gte(1) }
        },
        1: {
            requirementDescription: "9 Flexible Magma total",
            effectDescription: "Get 1000% of Magma gain per second",
            done() { return player[this.layer].total.gte(9) }
        },
    },

    resetsNothing() {
        return hasMilestone('AltMag', 0) || hasMilestone('MLoop', 0)
    },

    autoPrestige() {
        return hasMilestone('AltMag', 1) || hasMilestone('MLoop', 1)
    },

    automate() {
        if (hasMilestone('Grp', 6))
            buyBuyable(this.layer, 11)
    },

    branches: ['AltMag']
})

addLayer('UMag', {
    startData() { return {                  
        unlocked: true,                    
        points: new Decimal(0),             
    }},

    color: "#0000FF",                      
    resource: "Unital Magmas",
    type: "none",          
    row: 2,
    position: 1,                             

    baseResource: "Magmas",                 
    baseAmount() { return player['Mag'].points },                        

    layerShown() {
        return hasUpgrade('Mag', 12)
    },
    
    tabFormat: [
        "resource-display",
        ["display-text",
            function() { return "A Unital Magma (U, &middot;, 1) is a Magma (Q, &middot;) together with a nullary operation 1 : &lowast; &rarr; U such that the following commutes" },
        ],
        "blank",
        ["display-image",
            'https://i.imgur.com/fptVQy5.png'
        ],
        "blank",
        "buyables",
        "blank",
        "upgrades",
    ],

    upgrades: {
        11: {
            fullDisplay() {
                return "Something something first last.<br><br>Unlocks the Trivial Unital Magma<br><br>Cost: 1 Magma"
            },
            canAfford() {
                return player['Mag'].points.gte(1)
            },
            pay() {
                player['Mag'].points = player['Mag'].points.sub(1)
            },
        },
        21: {
            fullDisplay() {
                return "Gero Frieseckes blessing<br><br>Magmas boost Magma gain<br><br>Effect: " + format(this.effect()) + "x Magma gain<br><br>Cost: 2 Trvial Unital Magmas"
            },
            effect() {
                return player['Mag'].points.add(1).ln().add(1)
            },
            canAfford() {
                return getBuyableAmount(this.layer, 11).gte(2)
            },
            pay() {
                setBuyableAmount(this.layer, 11, getBuyableAmount(this.layer, 11).sub(2))
            },
            unlocked() {
                return hasUpgrade(this.layer, 11)
            }
        },
        22: {
            fullDisplay() {
                return "Gero Frieseckes second blessing<br><br>Squares Magmas layer effect<br><br>Cost: 3 Trvial Unital Magmas"
            },
            canAfford() {
                return getBuyableAmount(this.layer, 11).gte(3)
            },
            pay() {
                setBuyableAmount(this.layer, 11, getBuyableAmount(this.layer, 11).sub(3))
            },
            unlocked() {
                return hasUpgrade(this.layer, 21)
            }
        },
    },

    buyables: {
        11: {
            title: "&lowast;",
            cost(x) { return Math.round(new Decimal(10).pow(x).mul(tmp['Grp'].effect)) },
            effect(x) {
                return x.add(1)
            },
            display() {
                return "You have " + getBuyableAmount(this.layer, this.id) + " Trivial Unital Magmas<br><br>Effect: " + format(buyableEffect(this.layer, this.id)) + "x Magma gain<br><br>Cost: " + format(this.cost()) + " Magmas"
            },
            canAfford() {
                return player['Mag'].points.gte(this.cost())
            },
            buy() {
                if (! hasMilestone('Grp', 1))
                    player['Mag'].points = player['Mag'].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasUpgrade(this.layer, 11)
            }
        },
    },

    automate() {
        if (hasMilestone('Grp', 1))
            buyBuyable(this.layer, 11)
    },

    branches: ['Loop', 'Mon']
})

addLayer('SGrp', {
    startData() { return {                  
        unlocked: true,                    
        points: new Decimal(0),             
    }},

    color: "#00FF00",                      
    resource: "Semigroups",
    type: "none",          
    row: 2,
    position: 2,                              

    baseResource: "Magmas",                 
    baseAmount() { return player['Mag'].points },                        

    layerShown() {
        return hasUpgrade('Mag', 13)
    },
    
    tabFormat: [
        "resource-display",
        ["display-text",
            function() { return "A Semigroup (S, &middot;) is a Magma (S, &middot;) such that the following commutes" },
        ],
        "blank",
        ["display-image",
            'https://i.imgur.com/8mTddkP.png'
        ],
        "blank",
        "buyables",
        "blank",
        "upgrades",
    ],

    upgrades: {
        11: {
            fullDisplay() {
                return "At first, there was nothing.<br><br>Unlocks the Empty Semigroup.<br><br>Cost: 1 Magma"
            },
            canAfford() {
                return player['Mag'].points.gte(1)
            },
            pay() {
                player['Mag'].points = player['Mag'].points.sub(1)
            },
        },
        12: {
            fullDisplay() {
                return "At last, there was conothing.<br><br>Unlocks the Trivial Semigroup.<br><br>Cost: 10 Magmas"
            },
            canAfford() {
                return player['Mag'].points.gte(10)
            },
            pay() {
                player['Mag'].points = player['Mag'].points.sub(10)
            },
            unlocked () {
                return hasUpgrade(this.layer, 11)
            }
        },
        13: {
            fullDisplay() {
                return "Set of non-empty words from an alphabet X.<br><br>Unlocks the free Semigroup on one element.<br><br>Cost: 20 Magmas"
            },
            canAfford() {
                return player['Mag'].points.gte(20)
            },
            pay() {
                player['Mag'].points = player['Mag'].points.sub(20)
            },
            unlocked () {
                return hasUpgrade(this.layer, 12)
            }
        },
        21: {
            fullDisplay() {
                return "Andreas Wieses blessing<br><br>Singletons boost Magma gain<br><br>Cost: 3 Semigroups of positive integers"
            },
            canAfford() {
                return getBuyableAmount(this.layer, 21).gte(3)
            },
            pay() {
                setBuyableAmount(this.layer, 21, getBuyableAmount(this.layer, 21).sub(3))
            },
            unlocked () {
                return hasUpgrade(this.layer, 13)
            }
        },
    },
    
    buyables: {
        11: {
            title: "&empty;",
            cost(x) { return Math.round(new Decimal(2).pow(x.add(1)).mul(tmp['Grp'].effect)) },
            effect(x) {
                return x.add((hasUpgrade('Grp', 11) ? buyableEffect('Mon', 11) : 0))
            },
            display() {
                if (hasUpgrade('Grp', 11) && getBuyableAmount('Mon', 11).gte(1))
                    return "You have " + getBuyableAmount(this.layer, this.id) + " + " + buyableEffect('Mon', 11) + " Empty Semigroups<br><br>Effect: -" + buyableEffect(this.layer, this.id) + " to Singleton price<br><br>Cost: " + this.cost() + " Empty Sets"
                return "You have " + getBuyableAmount(this.layer, this.id) + " Empty Semigroups<br><br>Effect: -" + buyableEffect(this.layer, this.id) + " to Singleton price<br><br>Cost: " + this.cost() + " Empty Sets"
            },
            canAfford() {
                return getBuyableAmount('Set', 11).gte(this.cost())
            },
            buy() {
                if (! hasMilestone('Grp', 2))
                    setBuyableAmount('Set', 11, getBuyableAmount('Set', 11).sub(this.cost()))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasUpgrade(this.layer, 11)
            }
        },
        12: {
            title: "&lowast;",
            cost(x) { return Math.round(new Decimal(1.5).pow(x.add(1)).mul(tmp['Grp'].effect)) },
            effect(x) {
                return new Decimal(0.5).pow(x.add(buyableEffect('Mon', 11)))
            },
            display() {
                if (getBuyableAmount('Mon', 11).gte(1))
                    return "You have " + getBuyableAmount(this.layer, this.id) + " + " + buyableEffect('Mon', 11) + " Trivial Semigroups<br><br>Effect: " + formatSmall(buyableEffect(this.layer, this.id)) + "x to Empty Set price<br><br>Cost: " + this.cost() + " Singletons"
                return "You have " + getBuyableAmount(this.layer, this.id) + " Trivial Semigroups<br><br>Effect: " + formatSmall(buyableEffect(this.layer, this.id)) + "x to Empty Set price<br><br>Cost: " + this.cost() + " Singletons"
            },
            canAfford() {
                return getBuyableAmount('Set', 12).gte(this.cost())
            },
            buy() {
                if (! hasMilestone('Grp', 2))
                    setBuyableAmount('Set', 12, getBuyableAmount('Set', 12).sub(this.cost()))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasUpgrade(this.layer, 12)
            }
        },
        21: {
            title: "&#8469;<sup>+</sup>",
            cost(x) { return Math.round(new Decimal(10).pow(x).mul(tmp['Grp'].effect)) },
            effect(x) {
                return player.points.add(1).ln().add(1).ln().mul(x).add(1)
            },
            display() {
                return "You have " + getBuyableAmount(this.layer, this.id) + " Semigroups of positive integers<br><br>Effect: " + format(buyableEffect(this.layer, this.id)) + "x to Magma gain based on Sets<br><br>Cost: " + format(this.cost()) + " Magmas"
            },
            canAfford() {
                return player['Mag'].points.gte(this.cost())
            },
            buy() {
                if (! hasMilestone('Grp', 1))
                    player['Mag'].points = player['Mag'].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasUpgrade(this.layer, 13)
            }
        },
    },

    automate() {
        if (hasMilestone('Grp', 1))
            buyBuyable(this.layer, 21)
        if (hasMilestone('Grp', 2)) {
            buyBuyable(this.layer, 11)
            buyBuyable(this.layer, 12)
        }
    },

    branches: ['AssQGrp', 'Mon']
})

addLayer('AltMag', {
    startData() { return {                  
        unlocked: true,                    
        points: new Decimal(0),
        total: new Decimal(0),          
    }},

    color: "#C4B267",                      
    resource: "Alternative Magmas",            
    row: 3,
    position: -1,       

    baseResource: "Flexible Magmas",                 
    baseAmount() { return player['FlexMag'].points }, 

    requires: new Decimal(6),
                                            
    type: "static",
    base: new Decimal(1.333),
    exponent: new Decimal(0.82),
    roundUpCost: true,

    effect() {
        effect = new Decimal(0.1).mul(player[this.layer].points).add(1).pow(tmp['MLoop'].effect)
        
        if (! effect.gte(2))
            return effect

        return effect.sub(1).pow(0.1).add(1)
    },

    gainMult() {
        return new Decimal(1)
    },
    
    gainExp() {
        return new Decimal(1)
    },

    layerShown() {
        return hasUpgrade('Mag', 33) || player[this.layer].total.gte(1)
    },
    
    tabFormat: [
        "main-display",
        ["display-text",
            function() { return "which raises Singleton effect to the " + format(tmp[this.layer].effect)},
        ],
        "blank",
        "prestige-button",
        "blank",
        "resource-display",
        "blank",
        ["display-text",
            function() { return "An Alternative Magma (A, &middot;) is a Magma (A, &middot;) such that the following commute" },
        ],
        "blank",
        ["display-image",
            'https://i.imgur.com/4Emvp0H.png'
        ],
        "blank",
        "buyables",
        "blank",
        "upgrades",
        "blank",
        "milestones",
    ],

    upgrades: {
        11: {
            fullDisplay() {
                return "Most natural Alternatives Magmas are non-associative Algebras, too.<br><br>Alternative Magma count boosts Magma gain.<br><br>Currently: " + format(this.effect()) + "x to Magma gain<br><br>Cost: 5 Octonions"
            },
            effect() {
                return new Decimal(5).pow(getBuyableAmount(this.layer, 11))
            },
            canAfford() {
                return getBuyableAmount(this.layer, 11).gte(5)
            },
            pay() {
                setBuyableAmount(this.layer, 11, getBuyableAmount(this.layer, 11).sub(5))
            },
            unlocked() {
                return player[this.layer].points.gte(3)
            }
        },
    },

    buyables: {
        11: {
            title: "𝕆",
            cost(x) { return Math.round(new Decimal(1.5).pow(x.add(1)).mul(tmp['Grp'].effect)) },
            effect(x) {
                return new Decimal(0.1).mul(x).add(1)
            },
            display() {
                return "You have " + getBuyableAmount(this.layer, this.id) + " Octonions<br><br>Effect: ^" + format(buyableEffect(this.layer, this.id)) + " to Sedenions effect<br><br>Cost: " + this.cost() + " Sedenions"
            },
            canAfford() {
                return getBuyableAmount('FlexMag', 11).gte(this.cost())
            },
            buy() {
                if (! hasMilestone('Grp', 7))
                    setBuyableAmount('FlexMag', 11, getBuyableAmount('FlexMag', 11).sub(this.cost()))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return player[this.layer].total.gte(2)
            }
        },
    },

    milestones: {
        0: {
            requirementDescription: "1 Alternative Magma total",
            effectDescription: "Flexible Magmas don't reset anything",
            done() { return player[this.layer].total.gte(1) }
        },
        1: {
            requirementDescription: "2 Alternative Magma total",
            effectDescription: "Autoprestige Flexible Magmas",
            done() { return player[this.layer].total.gte(2) }
        },
        2: {
            requirementDescription: "4 Alternative Magma total",
            effectDescription: "Unlocks Pointed Set upgrades",
            done() { return player[this.layer].total.gte(4) }
        },
    },

    resetsNothing() {
        return hasMilestone('MLoop', 0)
    },

    autoPrestige() {
        return hasMilestone('MLoop', 1)
    },

    automate() {
        if (hasMilestone('Grp', 7))
            buyBuyable(this.layer, 11)
    },

    branches: ['MLoop']
})

addLayer('Loop', {
    startData() { return {                  
        unlocked: true,                    
        points: new Decimal(0),             
    }},

    color: "#FF00FF",                      
    resource: "Loops",
    type: "none",          
    row: 3,
    position: 0,                         

    baseResource: "Magmas",                 
    baseAmount() { return player['Mag'].points },                        

    layerShown() {
        return hasUpgrade('Mag', 21)
    },
    
    tabFormat: [
        "resource-display",
        ["display-text",
            function() { return "A Loop (L, &middot;, /, \\, 1) is a Quasigroup (L, &middot;, /, \\) and a Unital Magma (L, &middot;, 1)" }
        ],
        "blank",
        "buyables",
        "blank",
        "upgrades",
    ],

    upgrades: {
        11: {
            fullDisplay() {
                return "Loop de Loop.<br><br>Unlocks the Trivial Loop.<br><br>Cost: 500,000 Magmas"
            },
            canAfford() {
                return player['Mag'].points.gte(5e5)
            },
            pay() {
                player['Mag'].points = player['Mag'].points.sub(5e5)
            },
        },
        21: {
            fullDisplay() {
                return "Johannes Zimmers blessing<br><br>Trivial Loops also boost Magma gain<br><br>Cost: 2 Trivial Loops"
            },
            canAfford() {
                return getBuyableAmount(this.layer, 11).gte(2)
            },
            pay() {
                setBuyableAmount(this.layer, 11, getBuyableAmount(this.layer, 11).sub(2))
            },
            unlocked() {
                return hasUpgrade(this.layer, 11)
            }
        },
        22: {
            fullDisplay() {
                return "Johannes Zimmers second blessing<br><br>Trivial Loops also boost Empty Quasigroup effect base<br><br>Cost: 3 Trivial Loops"
            },
            canAfford() {
                return getBuyableAmount(this.layer, 11).gte(3)
            },
            pay() {
                setBuyableAmount(this.layer, 11, getBuyableAmount(this.layer, 11).sub(3))
            },
            unlocked() {
                return hasUpgrade(this.layer, 21)
            }
        },
    },

    buyables: {
        11: {
            title: "&lowast;",
            cost(x) { return Math.round(new Decimal(2).pow(x.add(1)).mul(tmp['Grp'].effect)) },
            effect(x) {
                return new Decimal(1.25).pow(x.add(buyableEffect('Grp', 11))).pow(buyableEffect('MLoop', 11))
            },
            display() {
                if (hasUpgrade(this.layer, 22)) {
                    if (getBuyableAmount('Grp', 11).gte(1))
                        return "You have " + getBuyableAmount(this.layer, this.id) + " + " + buyableEffect('Grp', 11) + " Trivial Loops<br><br>Effect: " + format(buyableEffect(this.layer, this.id)) + "x to Empty and Trivial Quasigroup effect base and Magma gain<br><br>Cost: " + this.cost() + " Trivial Unital Magmas"
                    return "You have " + getBuyableAmount(this.layer, this.id) + " Trivial Loops<br><br>Effect: " + format(buyableEffect(this.layer, this.id)) + "x to Empty and Trivial Quasigroup effect base and Magma gain<br><br>Cost: " + this.cost() + " Trivial Unital Magmas"
                }
                if (hasUpgrade(this.layer, 21)) {
                    if (getBuyableAmount('Grp', 11).gte(1))
                        return "You have " + getBuyableAmount(this.layer, this.id) + " + " + buyableEffect('Grp', 11) + " Trivial Loops<br><br>Effect: " + format(buyableEffect(this.layer, this.id)) + "x to Trivial Quasigroup effect base and Magma gain<br><br>Cost: " + this.cost() + " Trivial Unital Magmas"
                    return "You have " + getBuyableAmount(this.layer, this.id) + " Trivial Loops<br><br>Effect: " + format(buyableEffect(this.layer, this.id)) + "x to Trivial Quasigroup effect base and Magma gain<br><br>Cost: " + this.cost() + " Trivial Unital Magmas"
                }
                if (getBuyableAmount('Grp', 11).gte(1))
                    return "You have " + getBuyableAmount(this.layer, this.id) + " + " + buyableEffect('Grp', 11) + " Trivial Loops<br><br>Effect: " + format(buyableEffect(this.layer, this.id)) + "x to Trivial Quasigroup effect base<br><br>Cost: " + this.cost() + " Trivial Unital Magmas"
                return "You have " + getBuyableAmount(this.layer, this.id) + " Trivial Loops<br><br>Effect: " + format(buyableEffect(this.layer, this.id)) + "x to Trivial Quasigroup effect base<br><br>Cost: " + this.cost() + " Trivial Unital Magmas"
            },
            canAfford() {
                return getBuyableAmount('UMag', 11).gte(this.cost())
            },
            buy() {
                if (! hasMilestone('Grp', 3))
                    setBuyableAmount('UMag', 11, getBuyableAmount('UMag', 11).sub(this.cost()))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasUpgrade(this.layer, 11)
            }
        },
    },

    automate() {
        if (hasMilestone('Grp', 3))
            buyBuyable(this.layer, 11)
    },

    branches: ['MLoop', 'Grp']
})

addLayer('AssQGrp', {
    startData() { return {                  
        unlocked: true,                    
        points: new Decimal(0),             
    }},

    color: "#FFFF00",                      
    resource: "Associative Quasigroups",
    type: "none",          
    row: 3,
    position: 1,                         

    baseResource: "Magmas",                 
    baseAmount() { return player['Mag'].points },                        

    layerShown() {
        return hasUpgrade('Mag', 22)
    },
    
    tabFormat: [
        "resource-display",
        ["display-text",
            function() { return "An Associative Quasigroup (A, &middot;, /, \\) is a Quasigroup (A, &middot;, /, \\) and a Semigroup (A, &middot;)" }
        ],
        "blank",
        "buyables",
        "blank",
        "upgrades",
    ],

    upgrades: {
        11: {
            fullDisplay() {
                return "At first, there was nothing.<br><br>Unlocks the Empty Associative Quasigroup.<br><br>Cost: 250,000 Magmas"
            },
            canAfford() {
                return player['Mag'].points.gte(25e4)
            },
            pay() {
                player['Mag'].points = player['Mag'].points.sub(25e4)
            },
        },
        12: {
            fullDisplay() {
                return "At last, there was conothing.<br><br>Unlocks the Trivial Associative Quasigroup.<br><br>Cost: 500,000 Magmas"
            },
            canAfford() {
                return player['Mag'].points.gte(5e5)
            },
            pay() {
                player['Mag'].points = player['Mag'].points.sub(5e5)
            },
            unlocked () {
                return hasUpgrade(this.layer, 11)
            }
        },
        21: {
            fullDisplay() {
                return "Non-empty Associatives Quasigroups are Groups<br><br>Associative Quasigroup count boosts Magma gain.<br><br>Currently: " + format(this.effect()) + "x to Magma gain<br><br>Cost: 1,000,000 Magmas"
            },
            effect() {
                return getBuyableAmount(this.layer, 11).add(getBuyableAmount(this.layer, 12)).mul(2).add(1)
            },
            canAfford() {
                return player['Mag'].points.gte(1e6)
            },
            pay() {
                player['Mag'].points = player['Mag'].points.sub(1e6)
            },
            unlocked () {
                return hasUpgrade(this.layer, 12)
            }
        },
    },

    buyables: {
        11: {
            title: "&empty;",
            cost(x) { return Math.round(new Decimal(1.5).pow(x.add(1)).mul(tmp['Grp'].effect)) },
            effect(x) {
                return x
            },
            display() {
                return "You have " + getBuyableAmount(this.layer, this.id) + " Empty Associative Quasigroups<br><br>Effect: -" + buyableEffect(this.layer, this.id) + " to Trivial Quasigroup price<br><br>Cost: " + this.cost() + " Empty Semigroups"
            },
            canAfford() {
                return getBuyableAmount('SGrp', 11).gte(this.cost())
            },
            buy() {
                if (! hasMilestone('Grp', 3))
                    setBuyableAmount('SGrp', 11, getBuyableAmount('SGrp', 11).sub(this.cost()))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasUpgrade(this.layer, 11)
            }
        },
        12: {
            title: "&lowast;",
            cost(x) { return Math.round(new Decimal(1.35).pow(x.add(1)).mul(tmp['Grp'].effect)) },
            effect(x) {
                return new Decimal(0.5).pow(x)
            },
            display() {
                return "You have " + getBuyableAmount(this.layer, this.id) + " Trivial Associative Quasigroups<br><br>Effect: " + format(buyableEffect(this.layer, this.id)) + "x to Empty Quasigroup price<br><br>Cost: " + this.cost() + " Trivial Semigroups"
            },
            canAfford() {
                return getBuyableAmount('SGrp', 12).gte(this.cost())
            },
            buy() {
                if (! hasMilestone('Grp', 3))
                    setBuyableAmount('SGrp', 12, getBuyableAmount('SGrp', 12).sub(this.cost()))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasUpgrade(this.layer, 12)
            }
        },
    },

    automate() {
        if (hasMilestone('Grp', 3)) {
            buyBuyable(this.layer, 11)
            buyBuyable(this.layer, 12)
        }
    },

    branches: ['Grp']
})

addLayer('Mon', {
    startData() { return {                  
        unlocked: true,                    
        points: new Decimal(0),             
    }},

    color: "#00FFFF",                      
    resource: "Monoids",
    type: "none",          
    row: 3,
    position: 2,                         

    baseResource: "Magmas",                 
    baseAmount() { return player['Mag'].points },                        

    layerShown() {
        return hasUpgrade('Mag', 23)
    },
    
    tabFormat: [
        "resource-display",
        ["display-text",
            function() { return "A Monoid (L, &middot;, 1) is a Semigroup (L, &middot;) and a Unital Magma (L, &middot;, 1)" }
        ],
        "blank",
        "buyables",
        "blank",
        "upgrades",
    ],

    upgrades: {
        11: {
            fullDisplay() {
                return "Monoid is love, Monoid is life.<br><br>Unlocks the Trivial Monoid.<br><br>Cost: 1,000,000 Magmas"
            },
            canAfford() {
                return player['Mag'].points.gte(1e6)
            },
            pay() {
                player['Mag'].points = player['Mag'].points.sub(1e6)
            },
        },
        12: {
            fullDisplay() {
                return "Set of words from an alphabet X.<br><br>Unlocks the free Monoid on one element.<br><br>Cost: 2,500,000 Magmas"
            },
            canAfford() {
                return player['Mag'].points.gte(25e5)
            },
            pay() {
                player['Mag'].points = player['Mag'].points.sub(25e5)
            },
        },
    },

    buyables: {
        11: {
            title: "&lowast;",
            cost(x) { return Math.round(new Decimal(2).pow(x.add(1)).mul(tmp['Grp'].effect)) },
            effect(x) {
                return buyableEffect('Grp', 11).add(1).mul(x)
            },
            display() {
                if (hasUpgrade('Grp', 11))
                    return "You have " + getBuyableAmount(this.layer, this.id) + " Trivial Monoids<br><br>Effect: +" + buyableEffect(this.layer, this.id) + " simulated Empty and Trivial Semigroups<br><br>Cost: " + this.cost() + " Trivial Unital Magmas"
                return "You have " + getBuyableAmount(this.layer, this.id) + " Trivial Monoids<br><br>Effect: +" + buyableEffect(this.layer, this.id) + " simulated Trivial Semigroups<br><br>Cost: " + this.cost() + " Trivial Unital Magmas"
            },
            canAfford() {
                return getBuyableAmount('UMag', 11).gte(this.cost())
            },
            buy() {
                if (! hasMilestone('Grp', 3))
                    setBuyableAmount('UMag', 11, getBuyableAmount('UMag', 11).sub(this.cost()))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasUpgrade(this.layer, 11)
            }
        },
        21: {
            title: "&#8469;",
            cost(x) { return Math.round(new Decimal(2).pow(x.add(1)).mul(tmp['Grp'].effect)) },
            effect(x) {
                return player['Mag'].points.add(1).ln().add(1).ln().mul(x).add(1).pow(2)
            },
            display() {
                return "You have " + getBuyableAmount(this.layer, this.id) + " Monoids of naturals<br><br>Effect: " + format(buyableEffect(this.layer, this.id)) + "x to Set gain based on Magmas<br><br>Cost: " + this.cost() + " Semigroups of positive integers"
            },
            canAfford() {
                return getBuyableAmount('SGrp', 21).gte(this.cost())
            },
            buy() {
                if (! hasMilestone('Grp', 3))
                    setBuyableAmount('SGrp', 21, getBuyableAmount('SGrp', 21).sub(this.cost()))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasUpgrade(this.layer, 12)
            }
        },
    },

    automate() {
        if (hasMilestone('Grp', 3)) {
            buyBuyable(this.layer, 11)
            buyBuyable(this.layer, 21)
        }
    },

    branches: ['Grp', 'NARg']
})

addLayer('MLoop', {
    startData() { return {                  
        unlocked: true,                    
        points: new Decimal(0),
        total: new Decimal(0),          
    }},

    color: "#907303",                      
    resource: "Moufang Loops",       
    row: 4,
    position: 0,

    baseResource: "Alternative Magmas",                 
    baseAmount() { return player['AltMag'].points }, 

    requires: new Decimal(5),
                                            
    type: "static",
    base: new Decimal(1.4),
    exponent: new Decimal(1.5),
    roundUpCost: true,

    effect() {
        effect = new Decimal(0.2).mul(player[this.layer].points).add(1)

        if (! effect.gte(1.25))
            return effect

        return effect.sub(0.25).pow(0.1).add(0.25)
    },

    gainMult() {
        return new Decimal(1)
    },
    
    gainExp() {
        return new Decimal(1)
    },

    layerShown() {
        return hasUpgrade('Mag', 34) || player[this.layer].total.gte(1)
    },
    
    tabFormat: [
        "main-display",
        ["display-text",
            function() { return "which raises Flexible and Alternative Magma layer effect to the " + format(tmp[this.layer].effect)},
        ],
        "blank",
        "prestige-button",
        "blank",
        "resource-display",
        "blank",
        ["display-text",
            function() { return "A Moufang Loop (M, &middot;, /, \\, 1) is a Loop (L, &middot;, /, \\, 1) such that the following commutes" },
        ],
        "blank",
        ["display-image",
            'https://i.imgur.com/21XyUwT.png'
        ],
        "blank",
        "buyables",
        "blank",
        "upgrades",
        "blank",
        "milestones",
    ],

    upgrades: {
        11: {
            fullDisplay() {
                return "Extract the Octonions of size 1<br><br>Unlocks the 7-Sphere.<br><br>Cost: 1e100 Sets"
            },
            canAfford() {
                return player.points.gte(1e100)
            },
            pay() {
                player.points = player.points.sub(1e100)
            },
            unlocked () {
                return hasMilestone(this.layer, 1)
            }
        },
    },

    buyables: {
        11: {
            title: "S<sup>7</sup>",
            cost(x) { return Math.round(new Decimal(1.5).pow(x.add(2))) },
            effect(x) {
                return new Decimal(0.02).mul(x).add(1)
            },
            display() {
                return "You have " + getBuyableAmount(this.layer, this.id) + " 7-Spheres<br><br>Effect: ^" + format(buyableEffect(this.layer, this.id)) + " to Trivial Loop effect<br><br>Cost: " + this.cost() + " Octonions"
            },
            canAfford() {
                return getBuyableAmount('AltMag', 11).gte(this.cost())
            },
            buy() {
                setBuyableAmount('AltMag', 11, getBuyableAmount('AltMag', 11).sub(this.cost()))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasUpgrade(this.layer, 11)
            }
        },
    },

    milestones: {
        0: {
            requirementDescription: "1 Moufang Loop total",
            effectDescription: "Flexible and Alternative Magmas don't reset anything",
            done() { return player[this.layer].total.gte(1) || hasMilestone('NARg', 1) }
        },
        1: {
            requirementDescription: "2 Moufang Loops total",
            effectDescription: "Autoprestige Flexible and Alternative Magmas",
            done() { return player[this.layer].total.gte(2) || hasMilestone('NARg', 1) }
        },
        2: {
            requirementDescription: "3 Moufang Loops total",
            effectDescription: "Moufang Loops don't reset anything",
            done() { return player[this.layer].total.gte(3) || hasMilestone('NARg', 1) }
        },
    },

    resetsNothing() {
        return hasMilestone(this.layer, 2)
    },

    branches: ['Grp']
})

addLayer('Grp', {
    startData() { return {                  
        unlocked: true,                    
        points: new Decimal(0),
        total: new Decimal(0),          
    }},

    color: "#505050",                      
    resource: "Groups",            
    row: 4,
    position: 1,

    baseResource: "Magmas",                 
    baseAmount() { return player['Mag'].points }, 

    requires: new Decimal(1e18),
                                            
    type: "static",
    base: new Decimal(100),
    exponent: new Decimal(1.585),

    effect() {
        return new Decimal(0.9).pow(player[this.layer].points)
    },

    gainMult() {
        return new Decimal(1)        
    },
    gainExp() {                             
        return new Decimal(1)
    },

    layerShown() {
        return hasUpgrade('Mag', 31) || player[this.layer].total.gte(1)
    },
    
    tabFormat: [
        "main-display",
        ["display-text",
            function() { return "which multiply all lower layer buyable prices by " + formatSmall(tmp[this.layer].effect)},
        ],
        "blank",
        "prestige-button",
        "blank",
        "resource-display",
        "blank",
        ["display-text",
            function() { return "A Group (G, &middot;, /, \\, 1) is a Quasigroup (G, &middot;, /, \\), a Unital Magma (G, &middot;, 1), and a Semigroup (G, &middot;)<br>Equivalently, a Group (G, &middot;, 1, _<sup>-1</sup>) is a Monoid (G, &middot;, 1) such that the following commutes" },
        ],
        "blank",
        ["display-image",
            'https://i.imgur.com/AkEwtsJ.png'
        ],
        "blank",
        "buyables",
        "blank",
        "upgrades",
        "blank",
        "milestones",
    ],
    
    upgrades: {
        11: {
            fullDisplay() {
                return "Sixth Singleton?<br><br>Trivial Monoid effect now also effects Empty Semigroups.<br><br>Cost: 1e20 Sets"
            },
            canAfford() {
                return player.points.gte(1e20)
            },
            pay() {
                player.points = player.points.sub(1e20)
            },
            unlocked() {
                return hasMilestone(this.layer, 2)
            }
        },
        12: {
            fullDisplay() {
                return "Hans Peter Kruses blessing<br><br>Groups boost Set gain.<br><br>Currently: x" + format(this.effect()) + " to Set gain<br><br>Cost: 1e22 Sets"
            },
            effect() {
                return new Decimal(2).pow(player[this.layer].points)
            },
            canAfford() {
                return player.points.gte(1e22)
            },
            pay() {
                player.points = player.points.sub(1e22)
            },
            unlocked() {
                return hasMilestone(this.layer, 2)
            }
        },
        13: {
            fullDisplay() {
                return "Hans Peter Kruses second blessing<br><br>Groups boost Magma gain.<br><br>Currently: x" + format(this.effect()) + " to Magma gain<br><br>Cost: 1e30 Sets"
            },
            effect() {
                return new Decimal(1.5).pow(player[this.layer].points)
            },
            canAfford() {
                return player.points.gte(1e30)
            },
            pay() {
                player.points = player.points.sub(1e30)
            },
            unlocked() {
                return hasMilestone(this.layer, 3)
            }
        },
        14: {
            fullDisplay() {
                return "Hans Peter Kruses third blessing<br><br>Groups lower Flexible Magma cost<br><br>Currently: x" + formatSmall(this.effect()) + " to Flexible Magma cost<br><br>Cost: 1e34 Sets"
            },
            effect() {
                return new Decimal(0.8).pow(player[this.layer].points)
            },
            canAfford() {
                return player.points.gte(1e34)
            },
            pay() {
                player.points = player.points.sub(1e34)
            },
            unlocked() {
                return hasMilestone(this.layer, 4)
            }
        },
        19: {
            fullDisplay() {
                return "More useless than Magmas<br><br>Unlocks Non-Abelian Rgs<br><br>Cost: 1e34 Sets"
            },
            canAfford() {
                return player.points.gte(1e133)
            },
            pay() {
                player.points = player.points.sub(1e133)
            },
            unlocked() {
                return hasMilestone(this.layer, 8) && ! player['NARg'].points.gte(1)
            }
        },
    },

    buyables: {
        11: {
            title: "&lowast;",
            cost(x) { return Math.round(new Decimal(1.5).pow(x.add(2))) },
            effect(x) {
                return new Decimal(1).add(buyableEffect('NARng', 11)).mul(x)
            },
            display() {
                return "You have " + getBuyableAmount(this.layer, this.id) + " Trivial Groups<br><br>Effect: +" + buyableEffect(this.layer, this.id) + " to Trivial Monoid effect base and simulated Trivial Loops<br><br>Cost: " + this.cost() + " Trivial Associative Quasigroups"
            },
            canAfford() {
                return getBuyableAmount('AssQGrp', 12).gte(this.cost())
            },
            buy() {
                setBuyableAmount('AssQGrp', 12, getBuyableAmount('AssQGrp', 12).sub(this.cost()))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return true
            }
        },
        12: {
            title: "S<sub>n</sub>",
            cost(x) { return Math.round(new Decimal(1.5).pow(x)) },
            effect(x) {
                return Math.round(x.factorial())
            },
            display() {
                return "You have " + getBuyableAmount(this.layer, this.id) + " Symmetric Groups of order n<br><br>Effect: " + format(buyableEffect(this.layer, this.id)) + "x to Set gain<br><br>Cost: " + this.cost() + " Empty Associative Quasigroups"
            },
            canAfford() {
                return getBuyableAmount('AssQGrp', 11).gte(this.cost())
            },
            buy() {
                setBuyableAmount('AssQGrp', 11, getBuyableAmount('AssQGrp', 11).sub(this.cost()))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasMilestone(this.layer, 1)
            }
        },
        13: {
            title: "Z<sub>n</sub>",
            cost(x) { return Math.round(new Decimal(1.4).pow(x)) },
            effect(x) {
                return new Decimal(1).add(buyableEffect(this.layer, 15)).mul(x).add(1)
            },
            display() {
                return "You have " + getBuyableAmount(this.layer, this.id) + " Cyclic Groups of order n<br><br>Effect: " + format(buyableEffect(this.layer, this.id)) + "x to Magma gain<br><br>Cost: " + this.cost() + " Trivial Loops"
            },
            canAfford() {
                return getBuyableAmount('Loop', 11).gte(this.cost())
            },
            buy() {
                setBuyableAmount('Loop', 11, getBuyableAmount('Loop', 11).sub(this.cost()))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasMilestone(this.layer, 3)
            }
        },
        14: {
            title: "F<sub>2</sub>",
            cost(x) { return Math.round(new Decimal(1.6).pow(x)) },
            effect(x) {
                return x.mul(2)
            },
            display() {
                return "You have " + getBuyableAmount(this.layer, this.id) + " Free Groups on two generators<br><br>Effect: +" + format(buyableEffect(this.layer, this.id)) + " to Empty Quasigroup effect base<br><br>Cost: " + this.cost() + " Monoids of naturals"
            },
            canAfford() {
                return getBuyableAmount('Mon', 21).gte(this.cost())
            },
            buy() {
                setBuyableAmount('Mon', 21, getBuyableAmount('Mon', 21).sub(this.cost()))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasMilestone(this.layer, 3)
            }
        },
        15: {
            title: "D<sub>n</sub>",
            cost(x) { return Math.round(new Decimal(1.3).pow(x.add(1))) },
            effect(x) {
                return x.mul(0.75)
            },
            display() {
                return "You have " + getBuyableAmount(this.layer, this.id) + " Dihedral Groups of order n<br><br>Effect: +" + format(buyableEffect(this.layer, this.id)) + " to Cyclic Group effect base<br><br>Cost: " + this.cost() + " Cyclic Groups"
            },
            canAfford() {
                return getBuyableAmount(this.layer, 13).gte(this.cost())
            },
            buy() {
                setBuyableAmount(this.layer, 13, getBuyableAmount(this.layer, 13).sub(this.cost()))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasMilestone(this.layer, 3)
            }
        },
    },

    milestones: {
        0: {
            requirementDescription: "1 Group total",
            effectDescription: "Set buyables don't subtract their cost",
            done() { return player[this.layer].total.gte(1) || hasMilestone('NARg', 1) }
        },
        1: {
            requirementDescription: "2 Groups total",
            effectDescription: "Autobuy Trivial Unital Magmas and Semigroups of positive integers and they don't subtract their cost",
            done() { return player[this.layer].total.gte(2) || hasMilestone('NARg', 1) }
        },
        2: {
            requirementDescription: "3 Groups total",
            effectDescription: "Autobuy Quasigroup and Semigroup buyables and they don't subtract their cost",
            done() { return player[this.layer].total.gte(3) || hasMilestone('NARg', 1) }
        },
        3: {
            requirementDescription: "4 Groups total",
            effectDescription: "Autobuy Loop, Associative Quasigroup, and Monoid buyables and they don't subtract their cost",
            done() { return player[this.layer].total.gte(4) || hasMilestone('NARg', 1) }
        },
        4: {
            requirementDescription: "5 Groups total",
            effectDescription: "Groups don't reset anything",
            done() { return player[this.layer].total.gte(5) || hasMilestone('NARg', 1) }
        },
        5: {
            requirementDescription: "8 Groups total",
            effectDescription: "Gain 1% of Pointed Set gain per second",
            done() { return player[this.layer].total.gte(8) || hasMilestone('NARg', 1) }
        },
        6: {
            requirementDescription: "9 Groups total",
            effectDescription: "Autobuy Sedenions and they don't subtract their cost",
            done() { return player[this.layer].total.gte(9) || hasMilestone('NARg', 1) }
        },
        7: {
            requirementDescription: "11 Groups total",
            effectDescription: "Autobuy Octonions and they don't subtract their cost",
            done() { return player[this.layer].total.gte(11) || hasMilestone('NARg', 1) }
        },
        8: {
            requirementDescription: "13 Groups total",
            effectDescription: "Autobuy Trivial Pointed Sets and they don't subtract their cost",
            done() { return player[this.layer].total.gte(13) || hasMilestone('NARg', 1) }
        },
    },

    resetsNothing() {
        return hasMilestone(this.layer, 4)
    },

    branches: ['NARng']
})

addLayer('NARg', {
    startData() { return {                  
        unlocked: true,                    
        points: new Decimal(0),
        total: new Decimal(0),         
    }},

    color: "#794b8f",                      
    resource: "Non-Abelian Rgs",            
    row: 5,
    displayRow: 4,
    position: 2,

    baseResource: "Groups",                 
    baseAmount() { return player['Grp'].points }, 

    requires: new Decimal(14),              
                                            
    type: "normal",
    exponent: 11,
    roundUpCost : true,

    effect() {
        return player[this.layer].total.add(1).pow(2)
    },

    gainMult() {
        mul = new Decimal (1)

        return mul             
    },

    gainExp() {                             
        return new Decimal(1)
    },

    layerShown() {
        return hasUpgrade('Grp', 19) || player[this.layer].points.gte(1) || hasUpgrade(this.layer, 11) || hasUpgrade(this.layer, 12)
    },
    
    tabFormat: [
        "main-display",
        ["display-text",
            function() { return "your total boosts Set gain by " + format(tmp[this.layer].effect) },
        ],
        "blank",
        "prestige-button",
        "blank",
        "resource-display",
        ["display-text",
            function() { return "A Non-Abelian Rg (R, +, 0, &middot;) is a Monoid (R, +, 0) and a Semigroup (R, &middot;) such that the following commutes" },
        ],
        "blank",
        ["display-image",
            'https://i.imgur.com/nhcMmON.png'
        ],
        "blank",
        "blank",
        "blank",
        ["display-text",
            function() { return "Choose one carefully." },
            {"font-size": "32px"},
        ],
        "upgrades",
        "blank",
        "milestones",
    ],

    upgrades: {
        11: {
            title: "Negativity",
            description: "You have negatives now.",
            cost: new Decimal(1),
            unlocked() {
                return true
            }
        },
        12: {
            title: "Identity",
            description: "You have an identity now.",
            cost: new Decimal(1),
            unlocked() {
                return true
            }
        },
    },

    milestones: {
        0: {
            requirementDescription: "1 Non-Abelian Rg total",
            effectDescription: "Keep your Magma milestones on resets",
            done() { return player[this.layer].total.gte(1) }
        },
        1: {
            requirementDescription: "2000 Non-Abelian Rg total",
            effectDescription: "Keep your Moufang Loop and Group milestones on resets",
            done() { return player[this.layer].total.gte(2000) }
        },
    }, 

    passiveGeneration() {
        return new Decimal(0)
    },

    branches: ['NARng', 'NARig']
})

addLayer('NARng', {
    startData() { return {                  
        unlocked: true,                    
        points: new Decimal(0),             
    }},

    color: "#BC2648",                      
    resource: "Non-Abelian Rngs",
    type: "none",          
    row: 6,
    position: 0,                         

    baseResource: "Non-Abelian Rgs",                 
    baseAmount() { return player['NARg'].points },                        

    layerShown() {
        return false
    },
    
    tabFormat: [
        "resource-display",
        ["display-text",
            function() { return "A Non-Abelian Rng (R, +, 0, -, &middot;) is a Non-Abelian Rg (R, +, 0, &middot;) and a Group (R, +, 0, -)" },
        ],
        "blank",
        "buyables",
        "blank",
        "upgrades",
    ],

    upgrades: {
        11: {
            fullDisplay() {
                return "Should I call this trivial?<br><br>Unlocks the Zero Non-Abelian Rng.<br><br>Cost: 1e19 Magmas"
            },
            canAfford() {
                return player['Mag'].points.gte(1e19)
            },
            pay() {
                player['Mag'].points = player['Mag'].points.sub(1e19)
            },
        },
    },

    buyables: {
        11: {
            title: "0",
            cost(x) { return Math.round(new Decimal(1.6).pow(x.add(1))) },
            effect(x) {
                return new Decimal(0.5).mul(x)
            },
            display() {
                return "You have " + getBuyableAmount(this.layer, this.id) + " Zero Non-Abelian Rngs<br><br>Effect: +" + format(buyableEffect(this.layer, this.id)) + " to Trivial Group effect base<br><br>Cost: " + this.cost() + " Trivial Groups"
            },
            canAfford() {
                return getBuyableAmount('Grp', 11).gte(this.cost())
            },
            buy() {
                setBuyableAmount('Grp', 11, getBuyableAmount('Grp', 11).sub(this.cost()))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasUpgrade(this.layer, 11)
            }
        },
    },
})

addLayer('NARig', {
    startData() { return {                  
        unlocked: true,                    
        points: new Decimal(0),             
    }},

    color: "#3D26C7",                      
    resource: "Non-Abelian Rigs",
    type: "none",          
    row: 6,
    position: 1,                         

    baseResource: "Non-Abelian Rgs",                 
    baseAmount() { return player['NARg'].points },                        

    layerShown() {
        return false
    },
    
    tabFormat: [
        "resource-display",
        ["display-text",
            function() { return "A Non-Abelian Rig (R, +, 0, &middot;, 1) is a Non-Abelian Rg (R, +, 0, &middot;) and a Monoid (R, &middot;, 1)" },
        ],
        "blank",
        "buyables",
        "blank",
        "upgrades",
    ],

    upgrades: {
        11: {
            fullDisplay() {
                return "At first, there was nothing.<br><br>Unlocks the Empty Quasigroup.<br><br>Cost: 1 Magma"
            },
            canAfford() {
                return player['Mag'].points.gte(1)
            },
            pay() {
                player['Mag'].points = player['Mag'].points.sub(1)
            },
        },
        12: {
            fullDisplay() {
                return "At last, there was conothing.<br><br>Unlocks the Trivial Quasigroup.<br><br>Cost: 10 Magmas"
            },
            canAfford() {
                return player['Mag'].points.gte(10)
            },
            pay() {
                player['Mag'].points = player['Mag'].points.sub(10)
            },
            unlocked () {
                return hasUpgrade(this.layer, 11)
            }
        },
        21: {
            fullDisplay() {
                return "Finite Quasigroups are Latin Squares.<br><br>Quasigroup count boosts Magma gain.<br><br>Currently: " + format(this.effect()) + "x to Magma gain<br><br>Cost: 150 Magmas"
            },
            effect () {
                return getBuyableAmount(this.layer, 11).add(getBuyableAmount(this.layer, 12)).mul(2).add(1)
            },
            canAfford() {
                return player['Mag'].points.gte(150)
            },
            pay() {
                player['Mag'].points = player['Mag'].points.sub(150)
            },
            unlocked () {
                return hasUpgrade(this.layer, 12)
            }
        },
    },

    buyables: {
        11: {
            title: "&empty;",
            cost(x) { return Math.round(new Decimal(2.5).pow(x.add(1)).mul(buyableEffect('AssQGrp', 12)).mul(tmp['Grp'].effect)) },
            effect(x) {
                return x.mul(new Decimal(0.5).add(buyableEffect('Grp', 14))).mul((hasUpgrade('Loop', 22)) ? buyableEffect('Loop', 11) : 1).pow(buyableEffect('FlexMag', 11))
            },
            display() {
                return "You have " + getBuyableAmount(this.layer, this.id) + " Empty Quasigroups<br><br>Effect: +" + format(buyableEffect(this.layer, this.id)) + " to Empty Set effect base<br><br>Cost: " + this.cost() + " Empty Sets"
            },
            canAfford() {
                return getBuyableAmount('Set', 11).gte(this.cost())
            },
            buy() {
                if (! hasMilestone('Grp', 2))
                    setBuyableAmount('Set', 11, getBuyableAmount('Set', 11).sub(this.cost()))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {
                return hasUpgrade(this.layer, 11)
            }
        },
    },
})