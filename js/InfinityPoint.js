addLayer("IP", {
    name: "Infinity point", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "IP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: -10, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#80ffff",
    requires(){ 
        if(inChallenge('E',11)&&(!player.E.IPpower.gte(1))) return new Decimal(1e400)
        else return  new Decimal("1.8e308")
}, // Can be a function that takes requirement increases into account
    resource(){return "Infinity point"
    }, 
    baseResource: "Negative numbers", // Name of resource prestige is based on
    baseAmount() {if(hasChallenge('NN',32)||inChallenge('NN',32))return player.N.points
else return player.NN.points}, // Get the current amount of baseResource
    type(){
     return  "normal"}, // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent(){
        if(inChallenge('NN',32)||hasChallenge('NN',32)) return 0.0001
        if(hasUpgrade('IP',13))return 0.005
else return 0.01
    },
 
    prestigeButtonText() { 
        return "Reset for <b>" + formatWhole(tmp[this.layer].resetGain) + "</b> Infinity points" +
         (Decimal.gte(tmp[this.layer].resetGain, 1000) ? "" : "<br/>Next at " + formatWhole(tmp[this.layer].nextAt) + " Negative numbers")
    },      
    branches:["NN","I"],
     // Prestige currency exponent
     hotkeys: [
        {key: "I", description: "Shift + I: Reset for Infinity point", onPress(){if (canReset(this.layer)) doReset(this.layer)},
        onPress() { if (player.IP.unlocked) doReset("IP") },
        unlocked() {return hasMilestone('IP', 1)} // Determines if you can use the hotkey, optional
    },
    ],
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if(hasUpgrade('F',46)) mult = mult.times(1e15)
if(hasUpgrade('F',46)) mult = mult.times(100)
if(hasAchievement('A',51)) mult = mult.times(1e40)
if (hasUpgrade('MS',13)&&!hasUpgrade('MS',42))mult = mult.times(player.MS.x.pow(100))
        return mult 
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let mult=new Decimal(1) 
        if (hasUpgrade('F',51)) mult = mult.times(2)
        if (hasUpgrade('E',13)) mult = mult.times(5)
        if (hasUpgrade('IP',54)) mult = mult.times(1.1)
        if (hasUpgrade('IP',55)) mult = mult.times(1.05)
        if (hasAchievement('A',51)) mult = mult.times(1.05)
        if (hasMilestone('MS',2)) mult = mult.times(1.1)
        if (hasMilestone('MS',40)) mult = mult.times(1.1)
        if((inChallenge('E',11)&&(!player.E.IPpower.gte(1)))||hasUpgrade('E',22)) mult = mult.times(0)
        if(inChallenge('E',31))mult = mult.times(0)
        if (inChallenge('I',51)&&hasMilestone('O',104)) mult = mult.times(1.2)
        if (inChallenge('I',52)&&hasMilestone('O',104)) mult = mult.times(1.4)
        if (inChallenge('I',61)&&hasMilestone('O',104)) mult = mult.times(1.8)
        if (inChallenge('I',62)&&hasMilestone('O',104)) mult = mult.times(3)
        
        return mult
    },
    softcap(){
        if(player.IP.points.gte("1e6000000"))  return new Decimal("1e6000000")
        else return new Decimal("1e1000000")},
    softcapPower(){
        if(player.IP.points.gte("1e6000000")) return new Decimal("0.002")
        else if(hasUpgrade('MS',31)) return new Decimal("0.2")
        else return new Decimal("0.00000001")},
    milestones: {
        1: {
            requirementDescription: "1 Infinity points",
            effectDescription: "Keep '0' and Factor challenge on reset.",
            done() { return player.IP.points.gte(1) }
        },
        2: {
            requirementDescription: "2 Infinity points",
            effectDescription: "Keep Negative numbers upgrades and milestone on reset.",
            done() { return player.IP.points.gte(2) }
        },
        4: {
            requirementDescription: "3 Infinity points",
            effectDescription: "Keep factor upgrades and milestone on reset.",
            done() { return player.IP.points.gte(3) }
        },
        6: {
            requirementDescription: "4 Infinity points",
            effectDescription: "gain 100% of Negative numbers on reset per second and keep upgrade factor milestone on reset.",
            done() { return player.IP.points.gte(4)||hasMilestone("MS", 2) }
        },
        26: {
            requirementDescription: "1e26 Infinity points",
            effectDescription: "Factor are cheaper.",
            done() { return player.IP.points.gte(1e26) }
        },
        10000: {
            requirementDescription: "1e10000 Infinity points",
            effectDescription: "NN gain ^1.05",
            done() { return player.IP.points.gte("1e10000") }
        },
        17000: {
            requirementDescription: "1e17000 Infinity points",
            effectDescription: "Unlock Exponentiation.",
            done() { return player.IP.points.gte("1e17000") }
        },
        20000: {
            requirementDescription: "1e20000 Infinity points",
            effectDescription: "Unlock Exponentiation prestige.",
            done() { return player.IP.points.gte("1e20000") }
        },
        38500: {
            requirementDescription: "1e38500 Infinity points",
            effectDescription: "Unlock Negative numbers Challenge.",
            done() { return player.IP.points.gte("1e38500") }
        },
        1000000: {
            requirementDescription: "1e1000000 Infinity points",
            effectDescription: "Remove the hardcap of Exponentiation point and prestige point gain.",
            done() { return player.IP.points.gte("1e1000000") }
        },
        6000000: {
            requirementDescription: "1e6000000 Infinity points",
            effectDescription: "IP upgrade 43 has no effect but Number gain ^3.",
            done() { return player.IP.points.gte("1e6000000") }
        },
        30000000: {
            requirementDescription: "1e30000000 Infinity points",
            effectDescription: "gain 100% of Infinity point on reset per second",
            done() { return player.IP.points.gte("1e30000000") }
        },
        4.4e12: {
            requirementDescription: "e4.444e12 Infinity points",
            effectDescription: "Boost '9'",
            done() { return player.IP.points.gte("e4.444e12") }
        },
    },
    doReset(resettingLayer) {
        let keep = [];
    
        if (resettingLayer=="E") keep.push("milestones")
        if (resettingLayer=="O"&&hasMilestone('O',9)) keep.push("milestones")
        if (resettingLayer=="E"&&hasMilestone('E',3)) keep.push("upgrades")
        if (resettingLayer=="E"&&hasMilestone('E',5)) keep.push("challenges")
        if (resettingLayer=="O"&&hasMilestone('O',2)) keep.push("upgrades")
        if (resettingLayer=="M"&&hasMilestone('M',2)) keep.push("upgrades")
        if (resettingLayer=="M"&&hasMilestone('M',2)) keep.push("milestones")
        if (resettingLayer=="S"&&hasMilestone('S',2)) keep.push("milestones")
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    passiveGeneration(){return hasMilestone('IP',30000000)? 1 : 0},
    upgrades:{
        11: {
            title: "UltraLuigi (Easter Egg 1, 2, 3 and 4)",
            description: "Unlock 1 Negative numbers buyable.",
            cost: new Decimal(5),
            unlocked(){
                return true
            },
        

    },
    12: {
        title: "TrueDiego ΔΔΔ (Easter Egg 1 and 4)",
        description: "Unlock 1 Infinity point Challenge",
        cost: new Decimal(10),
        unlocked(){
            return hasUpgrade('IP',11)
        },
},
21: {
    title: "JashinFanatic (Easter Egg 1 and 3)",
    description: "Auto buy Negative numbers buyable and Infinity point boost Negative numbers gain.",
    cost: new Decimal(10),
    unlocked(){
        return hasUpgrade('IP',11)
    },
},
22: {
    title: "_lx5=nitro (Easter Egg 1 and 5)",
    description: "Remove the hardcap of -2 but nerf it.",
    cost: new Decimal(100),
    unlocked(){
        return hasUpgrade('IP',12)&&hasUpgrade('IP',21)
    },
},
13: {
    title: "Elund (Easter Egg 1, 2 and 3)",
    description: "Remove the hardcap of -4 but nerf it and nerf IP gain.",
    cost: new Decimal(3000),
    unlocked(){
        return hasUpgrade('IP',12)
    },
},
23: {
    title: "garnet420 (Easter Egg 1 and 3)",
    description: "Unlock 2 Infinity point challenge.",
    cost: new Decimal(200000),
    unlocked(){
        return hasUpgrade('IP',13)&&hasUpgrade('IP',22)
    },
},
31: {
    title: "♾InFiIipity♾ (Easter Egg 1)",
    description: "Unlock 1 Infinity point challenge.",
    cost: new Decimal(1e9),
    unlocked(){
        return hasUpgrade('IP',21)
    },
},
32: {
    title: "luenix (Easter Egg 1 and 2)",
    description: "Boost '-4'",
    cost: new Decimal(1e14),
    unlocked(){ 
        return hasUpgrade('IP',31)&&hasUpgrade('IP',22)
    },
},
33: {
    title: "Eternity308 (Easter Egg 1)",
    description: "Unlock 2 Infinity point Challenge.",
    cost: new Decimal(1e15),
    unlocked(){
        return hasUpgrade('IP',32)&&hasUpgrade('IP',23)
    },
},
44: {
    title: "Rabbit (Easter Egg 3)",
    description: "Negative numbers x 1e80000 but '^' and '-+' have no effect",
    cost: new Decimal("1e4100"),
    unlocked(){
        return hasUpgrade('IP',33)
    },
},
45: {
    title: "Mike95358 (Easter Egg 3)",
    description: "Unlock 2 Infinity challenge  ",
    cost: new Decimal("1e5500"),
    unlocked(){
        return hasUpgrade('IP',44)
    },
},
46: {
    title: "Elliott (Easter Egg 3 and 4)",
    description: "Boost Number gain base on Infinity.",
    cost: new Decimal("1e6400"),
    unlocked(){
        return hasUpgrade('IP',45)
    },
},
54: {
    title: "Crabble (Easter Egg 3)",
    description: "IP gain ^1.1",
    cost: new Decimal("1e7900"),
    unlocked(){
        return hasUpgrade('IP',45)
    },
},
55: {
    title: "foxes1338 (Easter Egg 3)",
    description: "IP gain ^1.05",
    cost: new Decimal("1e9300"),
    unlocked(){
        return hasUpgrade('IP',54)
    },
},
56: {
    title: "beatable (Easter Egg 3)",
    description: "'Factor Lambda' has no effect but Number gain ^1.75",
    cost: new Decimal("1e10700"),
    unlocked(){
        return hasUpgrade('IP',55)
    },
},
64: {
    title: "starkirby (Easter Egg 3)",
    description: "Unlock 1 Infinity challenge",
    cost: new Decimal("1e228888"),
    unlocked(){
        return hasUpgrade('IP',56)
    },
},
65: {
    title: "Antimatter Dimensions player777 (Easter Egg 3)",
    description: "Unlock 1 Infinity challenge.",
    cost: new Decimal("1e777777"),
    unlocked(){
        return hasUpgrade('IP',64)
    },
},
66: {
    title: "bananenkeks (Easter Egg 4)",
    description: "Unlock 1 NN challenge.",
    cost: new Decimal("1e1161161"),
    unlocked(){
        return hasUpgrade('IP',65)
    },
},
    },
    
    challenges:{
        11: {
            name: "Infinity 1",
            challengeDescription: "Number gain ^0.9 . ",
            canComplete(){if(hasChallenge('IP',12)) return player.NN.points.gte("1e1000")
            else return player.NN.points.gte("1.8e308")},
            goalDescription: "1.80e308 Negative numbers (1e1000 Negative numbers after complete Infinity 2)",
            rewardDescription(){return "Negative numbers ^1.1."},
          unlocked(){return hasUpgrade('IP',12)},
        },
          12: {
            name: "Infinity 2",
            challengeDescription: "'-4' is no effect. ",
            canComplete(){ if(hasChallenge('IP',11)) return player.NN.points.gte("1e1000")
            else return player.NN.points.gte("1.8e308")},
            goalDescription: "1.80e308 Negative numbers (1e1000 Negative numbers after complete Infinity 1)",
            rewardDescription(){return "Negative numbers ^1.15."},
          unlocked(){return hasUpgrade('IP',31)},
        },
        21: {
            name: "Eternity 1",
            challengeDescription: "Number gain ^0.5 . ",
            canComplete(){
                if(hasChallenge('IP',22)) return player.NN.points.gte("1e1000")
                else return player.NN.points.gte("1.8e308")},
            goalDescription: "1.80e308 Negative numbers (1e1000 Negative numbers after complete Eternity 2)",
            rewardDescription(){return "Negative numbers ^1.2."},
          unlocked(){return hasUpgrade('IP',23)},

        },
        22: {
            name: "Eternity 2",
            challengeDescription: "'-2' is no effect' . ",
            canComplete(){
                if(hasChallenge('IP',21)) return player.NN.points.gte("1e1000")
                else return player.NN.points.gte("1.8e308")},
            goalDescription: "1.80e308 Negative numbers (1e1000 Negative numbers after complete Eternity 1)",
            rewardDescription(){return "Negative numbers ^1.25."},
          unlocked(){return hasUpgrade('IP',23)},
        },
        31: {
            name: "Reality 1",
            challengeDescription: "Number gain ^0.15 .",
            canComplete(){
                if(hasChallenge('IP',32)) return player.NN.points.gte("1e1000")
                else return player.NN.points.gte("1.8e308")},
            goalDescription: "1.80e308 Negative numbers (1e1000 Negative numbers after complete Reality 2)",
            rewardDescription(){return "Numbers ^1.3."},
          unlocked(){return hasUpgrade('IP',33)},
        },
        32: {
            name: "Reality 2",
            challengeDescription: "'-2', '-3' and '-4' is no effect.",
            canComplete(){
                if(hasChallenge('IP',31)) return player.NN.points.gte("1e1000")
                else return player.NN.points.gte("1.8e308")},
            goalDescription: "1.80e308 Negative numbers (1e1000 Negative numbers after complete Reality 1)",
            rewardDescription(){return "Numbers ^1.35."},
          unlocked(){return hasUpgrade('IP',33)},
        },
    },
    clickables: {
        11:{
            display() {return "Reset Infinity challenge"},
            canClick(){return !(hasChallenge('IP',11)&&hasChallenge('IP',12))},
            onClick(){player.IP.challenges[11] = 0
                player.IP.challenges[12] = 0 }
            },
        12:{
        display() {return "Reset Eternity challenge"},
        canClick(){return !(hasChallenge('IP',21)&&hasChallenge('IP',22))},
        onClick(){player.IP.challenges[21] = 0
            player.IP.challenges[22] = 0 }
        },
        13:{
            display() {return "Reset Reality challenge"},
            canClick(){return !(hasChallenge('IP',31)&&hasChallenge('IP',32))},
            onClick(){player.IP.challenges[31] = 0
                player.IP.challenges[32] = 0 
               }
            },
     
    },
    autoUpgrade(){
        if  (hasMilestone('S',1)) return true
        else return false
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return (hasMilestone('NN',1.79e308)||hasMilestone('IP',1)||hasMilestone('MS',400))&&!hasUpgrade('E',22)},
    tabFormat: {
        "Milestones":{
          content:[
        "main-display",
          "blank",
        ["prestige-button",function(){return ""}],
        "blank",
        "resource-display",
        "blank",
        "blank",
        "milestones",
          ]},
          "Upgrades":{
            content:[
              "main-display",
              "blank",
            ["prestige-button",function(){return ""}],
              "blank",
              "blank",
              "upgrades",
            ]
        },
      
      "Challenges":{
        unlocked(){return hasUpgrade('IP',12)&&!hasMilestone('MS',500)},
        content:[
          "main-display",
          "blank",
        ["prestige-button",function(){return ""}],
          "blank",
          "blank",
          "challenges",
          "clickables",

        ]
    },

    
      },
})