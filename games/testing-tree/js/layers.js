addLayer("s", {
    name: "start", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    passiveGeneration(){return hasMilestone("prod",1)?1:0},
    color: "#BEAF3C",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Starting Points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.9876, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('s', 13)) mult = mult.times(upgradeEffect('s', 13))
        if (hasUpgrade('s', 21)) mult = mult.times(upgradeEffect('s', 21))
        if (hasUpgrade('s', 22)) mult = mult.times(upgradeEffect('s', 22))
        return mult
    },

    softcap: new Decimal(1000),
    softcapPower() {
        let softcapPower = 0.1010101
        if (hasMilestone("imp", 0)) softcapPower = 1
    
        return softcapPower
    },

    softcap() {
        let softcap = new Decimal(1e6)
        if (hasUpgrade("n", 21)) softcap = new Decimal(1e9)

        return softcap
    },
    softcapPower() {
        let softcapPower = 0.042069
        if (hasMilestone("imp", 0)) softcapPower = 0.06942
        if (hasUpgrade("n", 13)) softcapPower = new Decimal(0.042069).mul(upgradeEffect("n", 13))
        if (hasUpgrade("n", 13) && hasMilestone("imp", 0)) softcapPower = new Decimal(0.06942).mul(upgradeEffect("n", 13))

        return softcapPower
    },

    /*
softcap(){
    let s=new Decimal("1e500")
    if(hasChallenge("l28",11))s=new Decimal("10^^10")
    return s},
softcapPower(){
    let s=0.02
    //if(hasChallenge("l28",11))s=1
return s

    effect() {
        let eff = Decimal.pow(1.94, player.s.upgrades.length).add(1)
        if (player.s.upgrades.length >= 1) eff = eff.sub(1)                               
        
        return eff;
            },
    */

    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "s", description: "S: Reset for Starter Points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},

    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone("n", 0) && resettingLayer == "prod") keep.push("upgrades")
        if (hasMilestone("n", 0) && resettingLayer == "imp") keep.push("upgrades")
        if (hasMilestone("n", 2) && resettingLayer == "n") keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) layerDataReset("s", keep)
    },

    upgrades: {
        11: {
            title: "Testing Upgrade",
            description: "Multiply your points gain by 5",
            cost: new Decimal(1),
        },

        12: {
            title: "Another Testing",
            description: "Multiply your Quantities gain based on your current Starting Points",
            cost: new Decimal(3),
            effect() {
                return player[this.layer].points.add(1).pow(0.42).pow(hasUpgrade("s",24)?1.6942:1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() { return hasUpgrade("s", 11) }
        },

        13: {
            title: "3rd Testing Upgrade",
            description: "Multiply your Starting Points gain based on your current Quantities",
            cost: new Decimal(10),
            effect() {
                return player.points.add(1).log10().pow(0.94).div(1.69042).add(1).pow(hasUpgrade("s",24)?1.6942:1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() { return hasUpgrade("s", 12) }
        },

        14: {
            title: "Quantities Quantities",
            description: "Multiply your Quantities gain based on themselves",
            cost: new Decimal(25),
            effect() {
                return player.points.add(1).pow(0.111).div(1.543).add(1).pow(hasUpgrade("s",24)?1.6942:1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() { return hasUpgrade("s", 13) }
        },

        
        21: {
            title: "More Upgrades?",
            description: "Producers boost Starter Points gain at a reduced rate (before softcaps)",
            cost: new Decimal(1000),
            effect() {
                let f = player.prod.points.mul(2.49).pow(1.69).tetrate(1.0042).add(1).div(2.69).pow(hasUpgrade("n", 11)?1.69:1).mul(tmp.imp.effect.sqrt())
                if (f <= 1) f = 1

                return f
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() { return hasMilestone("prod", 0) && hasUpgrade("s", 14) }
        },

        22: {
            title: "Upgrading Upgrade",
            description: "Every upgrade in this layer multiplies Starting Points gain (before softcaps)",
            cost: new Decimal(1.5e7),
            effect() {
                let eff = Decimal.pow(1.94, player.s.upgrades.length).add(1)
                if (player.s.upgrades.length >= 1) eff = eff.sub(1)                               
                
                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() { return hasMilestone("prod",0) && hasUpgrade("s", 21) }  
        },

        23: {
            title: "[INSERT TITLE HERE]",
            description: "Producers are cheaper based on your current Starter Points",
            cost: new Decimal(4.2e7),
            effect() {
                return player.s.points.add(1).pow(0.069).mul(6.9).add(1.42)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() { return hasMilestone("prod",0) && hasUpgrade("s", 22) }  
        },

        24: {
            title: "I don't have more title ideas :(",
            description: "2nd, 3rd and 4th upgrades' formulas are better",
            cost: new Decimal(6.9e7),
            unlocked() { return hasMilestone("prod",0) && hasUpgrade("s", 23) } 
        },
        
    }
})

addLayer("prod", {
    name: "producers",
    symbol: "P",
    position: 0,
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},

    branches: ["s"],

    effect(){let f= player.prod.points.mul(2.5).pow(2.01).tetrate(1.011).add(1).pow(hasMilestone("prod", 2)?2.4269:1).mul(tmp.imp.effect)
        return f},
    effectDescription(){
        let effectDescription = "multiplying Quantities gain by "+format(this.effect())+" "
        if (hasUpgrade("s", 21)) effectDescription = effectDescription + "and multiplying Starting Points gain by "+format(upgradeEffect("s", 21))+" (S Upgrade 5 Effect)"

        return effectDescription
    },
    
    
    //{return "multiplying Quantities gain by "+format(this.effect())+ " and multiplying Starting Points gain by "+format(upgradeEffect("s", 21))+" (S Upgrade 5 effect)"},

    color: "#00B36B",

    requires(){let r= new Decimal(250)
        if(hasUpgrade("s", 23))r=r.div(hasUpgrade("s", 23)?(upgradeEffect("s", 23)):1)
        if(hasMilestone("imp", 2))r=r.div(hasMilestone("imp", 2)?player.imp.points.add(1).pow(1.4213).add(1):1)
        if(player.n.points >= 1)r=r.div(tmp.n.effect2)
        if(hasUpgrade("n", 12))r=r.div(upgradeEffect("n", 12))
        //log10(player.n.points.mul(2.12).pow(1.898).tetrate(1.0512).add(1)).add(1)

    return r},

    resource: "Producers",
    baseResource: "Starting Points",
    baseAmount() {return player.s.points},
    type: "static",
    exponent: 1.74,
    gainMult() {
        mult = new Decimal(1)
        
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 1,
    hotkeys: [
        {key: "p", description: "P: Reset for Producers", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("s",14) || player[this.layer].unlocked},
    autoPrestige() {return (hasMilestone("n", 1) && player.prod.auto)},

    milestonePopups(){
        if (player.n.unlocked){
            milestonePopups = false
        }
        else milestonePopups = true
        return milestonePopups
    },

    milestones: {
        0: {
            requirementDescription: "3 Producers",
            effectDescription: "Unlock new S upgrades",
            done() { return player[this.layer].points.gte(3) }
        },

        1: {
            requirementDescription: "5 Producers",
            effectDescription: "Automate Starting Points gain",
            done() { return player[this.layer].points.gte(5) || hasMilestone("n", 2) },
            unlocked() { return hasMilestone("prod", 0) || hasMilestone("n", 0)}
        },

	    2: {
            requirementDescription: "7 Producers",
            effectDescription: "Massively increase Producers' effect and unlock Improvers",
            done() { return player[this.layer].points.gte(7) || hasMilestone("n", 0) },
            unlocked() { return hasMilestone("prod", 1) || hasMilestone("n", 0) }
        },

        3: {
            requirementDescription: "8 Producers",
            effectDescription: "Unlock a new layer",
            done() { return player[this.layer].points.gte(8) || hasMilestone("n", 0) },
            unlocked() { return hasMilestone("prod", 2) || hasMilestone("n", 0) }
        }
    },
    
})

addLayer("imp", {
    name: "improvers",
    symbol: "I",
    position: 1,
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},

    branches: ["s", "prod"],

    effect(){let f= player.imp.points.mul(1.5).pow(1.94).tetrate(1.0011).add(1).pow(hasMilestone("imp", 1)?player.prod.points.pow(0.169042).add(1):1)
        return f},
    effectDescription(){return effectDescription = "multiplying Producers' effect by "+format(this.effect())},

    color: "#6DADF2",

    requires() {let r = new Decimal(1e16)
        if(player.n.points >= 1)r=r.div(tmp.n.effect2)
     
    return r},

    resource: "Improvers",
    baseResource: "Quantities",
    baseAmount() {return player.points},
    type: "static",
    exponent: 1.69,
    gainMult() {
        mult = new Decimal(1)
        
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 1,
    hotkeys: [
        {key: "i", description: "I: Reset for Improvers", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return (hasMilestone("prod", 2)) || player[this.layer].unlocked},
    autoPrestige() {return (hasMilestone("n", 1) && player.imp.auto)},

    milestonePopups(){
        if (player.n.unlocked){
            milestonePopups = false
        }
        else milestonePopups = true
        return milestonePopups
    },

    milestones: {
        0: {
            requirementDescription: "1 Improver",
            effectDescription: "Remove the first Starting Points' softcap and weakens the 2nd one",
            done() { return player[this.layer].points.gte(1) }
        },

        1: {
            requirementDescription: "5 Improvers",
            effectDescription() { return "Improvers' effect is better based on your current Producers. (^"+format(player.prod.points.pow(0.169042).add(1))+")" },
            done() { return player[this.layer].points.gte(5) },
            unlocked() { return hasMilestone("imp", 0) }
        },

        2: {
            requirementDescription: "7 Improvers",
            effectDescription() { return "Producers are cheaper based on your current Improvers. (/"+format(player.imp.points.add(1).pow(1.4213).add(1))+")" },
            done() { return player[this.layer].points.gte(7) },
            unlocked() { return hasMilestone("imp", 1) }
        },

    },
    
})


addLayer("n", {
    name: "neutrons",
    symbol: "N",
    position: 0,
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},

    branches: ["s", "prod", "imp"],

    effect(){let f= player.n.points.mul(2.12).pow(1.8975).tetrate(1.0512).add(1)
        return f},
    effect2(){
        let f2= tmp.n.effect.log10().add(1)
        if (hasUpgrade("n", 22)) f2 = tmp.n.effect.log2().pow(1.69042).add(1)

        return f2},
    effectDescription(){return "dividing Producers and Improvers cost by "+format(this.effect2())+" and multiplying Quantities' gain by "+format(this.effect())},
    

    color: "#8C8C8C",
    requires: new Decimal(1e9),
    resource: "Neutrons",
    baseResource: "Starting Points",
    baseAmount() {return player.s.points},
    type: "normal",
    exponent: 1.2345,
    gainMult() {
        mult = new Decimal(1)
        
        return mult
    },

    softcap() {
        let softcap = new Decimal(10)
        if (hasUpgrade("n", 21)) softcap = new Decimal(50)
        if (hasUpgrade("n", 23)) softcap = new Decimal(1000)

        return softcap
    },
    softcapPower() {
        let softcapPower = 0.010101
        if (hasUpgrade("n", 23)) softcapPower = 0.10101

        return softcapPower
    },

    gainExp() {
        return new Decimal(1)
    },
    row: 2,
    hotkeys: [
        {key: "n", description: "N: Reset for Neutrons", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return (hasMilestone("prod", 3)) || player[this.layer].unlocked},

    milestones: {
        0: {
            requirementDescription: "1 Neutron",
            effectDescription: "Keep S upgrades on Row 2 resets and keep Producers' Milestones 3-4",
            done() { return player[this.layer].points.gte(1) }
        },

        1: {
            requirementDescription: "5 Neutrons",
            effectDescription: "Automate P and I gain",
            done() { return player[this.layer].points.gte(5) },
            unlocked() { return hasMilestone("n", 0) },
            toggles: [["prod", "auto"], ["imp", "auto"]],
        },

        2: {
            requirementDescription: "250 Neutrons",
            effectDescription: "Keep S upgrades on N resets and keep 2nd Producers' Milestone",
            done() { return player[this.layer].points.gte(250) },
            unlocked() { return hasMilestone("n", 1) },
        },

        3: {
            requirementDescription: "250,000 Neutrons",
            effectDescription: "Unlock Protons and Electrons [COMING SOON]",
            done() { return player[this.layer].points.gte(250000) },
            unlocked() { return hasMilestone("n", 2) && hasUpgrade("n", 23)},
        },

    },
    upgrades: {
        11: {
            title: "Finally more upgrades",
            description: "5th S upgrade's effect is better",
            cost: new Decimal(1),
            unlocked() { return hasMilestone("n", 0) }
        },

        12: {
            title: "Producing More",
            description: "Producers are cheaper based on themselves",
            cost: new Decimal(7),
            effect() {
                let eff = player.prod.points.pow(2).sub(player.prod.points).add(1)
                if (player.prod.points >= 2) eff = eff.sub(1)
                
                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() { return hasMilestone("n", 0) && hasUpgrade("n", 11) }
        },

        13: {
            title: "Softcap Weakening",
            description: "2nd S softcap exponent is weaker based on your current Improvers",
            cost: new Decimal(10),
            currencyDisplayName: "Improvers",
            currencyInternalName: "points",
            currencyLayer: "imp",
            effect() {
                let eff = player.imp.points.mul(1.25).sub(player.imp.points.mul(1.15)).add(1)
                if (eff >= 2) eff = eff.mul(2).pow(0.5) // 10 Imps = Effect: 2x
                //if (player.imp.points = 10) eff = player.imp.points.mul(10).sqrt().mul(1.25).sub(player.imp.points.mul(1.15)).add(1)

                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() { return hasMilestone("n", 0) && hasUpgrade("n", 12) }
        },

        21: {
            title: "Later Softcaps",
            description: "S 2nd softcap starts 1000x later (1e9) and N softcap starts 5x later (50)",
            cost: new Decimal(25),
            unlocked() { return hasMilestone("n", 0) && hasUpgrade("n", 13) }
        },

        22: {
            title: "This seems familiar...",
            description: "Neutrons' 2nd effect is better",
            cost: new Decimal(300),
            unlocked() { return hasMilestone("n", 0) && hasUpgrade("n", 21) }
        },

        23: {
            title: "Later softcap... again",
            description: "Neutrons' softcap starts 20x later (1000) and it is weakened",
            cost: new Decimal(550),
            unlocked() { return hasMilestone("n", 0) && hasUpgrade("n", 22) }
        },
    }

})

addLayer("p+", {
    name: "protons",
    symbol: "P+",
    position: -1,
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},

    branches: ["n"],

    /* copy-pasted, will change later
    effect(){let f= player.n.points.mul(2.12).pow(1.8975).tetrate(1.0512).add(1)
        return f},
    effectDescription(){return "dividing Producers and Improvers cost by "+format(this.effect2())+" and multiplying Quantities' gain by "+format(this.effect())},
    */

    color: "#ED4940",
    requires: new Decimal(1e69),
    resource: "Protons",
    baseResource: "Neutrons",
    baseAmount() {return player.n.points},
    type: "static",
    exponent: 1.69,
    gainMult() {
        mult = new Decimal(1)
        
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 2,
    hotkeys: [
        {key: "P", description: "Shift+P: Reset for Protons", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return (hasMilestone("n", 3)) || player[this.layer].unlocked},

})

addLayer("e-", {
    name: "electrons",
    symbol: "E-",
    position: 1,
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},

    branches: ["n"],

    /* copy-pasted, will change later
    effect(){let f= player.n.points.mul(2.12).pow(1.8975).tetrate(1.0512).add(1)
        return f},
    effectDescription(){return "dividing Producers and Improvers cost by "+format(this.effect2())+" and multiplying Quantities' gain by "+format(this.effect())},
    */

    color: "#2CDBAF",
    requires: new Decimal(1e69),
    resource: "Electrons",
    baseResource: "Neutrons",
    baseAmount() {return player.n.points},
    type: "static",
    exponent: 1.69,
    gainMult() {
        mult = new Decimal(1)
        
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 2,
    hotkeys: [
        {key: "e", description: "E: Reset for Electrons", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return (hasMilestone("n", 3)) || player[this.layer].unlocked},

})

/*
    Hello :)
    idk what you are doing here but ok

    Electrons = Negativity
    Protons = Positivity

    autoPrestige(){return hasUpgrade("s",11)},
    resetsNothing(){return hasUpgrade("prod",11)},
    canBuyMax(){return hasUpgrade("imp",11)},
    passiveGeneration(){return hasMilestone(this.layer,1)},
    autoPrestige() {return (hasMilestone("n", 1) && player.prod.auto)},

    currencyDisplayName: "Starting Points",
    currencyInternalName: "points",
    currencyLayer: "s",

    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone("n", 0) && resettingLayer=="s") keep.push("upgrades")
        -    -   -   -   -   -   -   -   -   -   -   -   layerDataReset("s", keep)
    },
*/