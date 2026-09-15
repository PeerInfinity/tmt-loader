addLayer("F", {
    name: "Factors", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "F", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        FP: new Decimal(0),
        FPgain:new Decimal(0)
    }},
    color: "#FFCD00",
    requires(){
        if(player.X.points.gte(1))    return new Decimal(1e10)
       else return new Decimal(1e5)} , // Can be a function that takes requirement increases into account
    resource(){ return "Factors"
}, 
    baseResource: "Numbers", // Name of resource prestige is based on
    baseAmount() {return player.N.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    base(){ 
        if(player.X.points.gte(1)&&hasUpgrade('F',103))  return new Decimal(500).pow(new Decimal(1).div(player.F.FP.add(10).log(2).pow(0.15)))
      else  if(player.X.points.gte(1)&&hasUpgrade('F',14))return new Decimal(500).pow(new Decimal(1).div(player.F.FP.add(10).log(10).pow(0.1)))
      else  if(inChallenge('E',31))return new Decimal("eeeeeeeeee10")
       else return 50},
    exponent(){
        if(player.X.points.gte(1)&&hasChallenge('F',43))return 1
        if(player.X.points.gte(1))return 1.1
        if(hasUpgrade('UF',103))return 0.036
        if(hasMilestone('E',1e284))return 0.0419
        if(hasMilestone('O',104)) return 0.055
        if(hasMilestone('M',3)) return 0.06
        if(hasMilestone('E',1e11)) return 0.06865
        if(hasUpgrade('UF',81))return 0.07
        if(inChallenge('NN',22)||hasChallenge('NN',22))return 1
        if (player.FS.points.gte(4)) return 0.18
        if (player.IP.points.gte(1e26)) return 0.2
        if (player.FS.points.gte(3)) return 0.25
        if(hasUpgrade('N',62))return 0.271
        if (player.FS.points.gte(2)) return 0.29
        if(hasUpgrade('N',61))return 0.314
        if(hasUpgrade('F',33))return 0.33
        if(hasMilestone('FS',1))return 0.375
        if(hasMilestone('NN',1e50))return 0.395
        if(hasUpgrade('N',42))return 0.48
        if(hasChallenge('F',43))return 0.538
        if(hasChallenge('F',41))return 0.625
        if(hasChallenge('F',23))return 0.69
        else return 0.75

    },
    directMult(){
        let gain=new Decimal(1)
gain=gain.times(player.FS.pfp.add(10).log(10).add(9).log(10))
if(hasChallenge("UF",301))gain=gain.times(1.13)
if(hasChallenge("UF",302))gain=gain.times(1.06)
return gain
    },
    branches:["N"],
     // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
 
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "f", description: "F: Reset for Factors", onPress(){if (canReset(this.layer)) doReset(this.layer)},
        onPress() { if (player.F.unlocked) doReset("F") },
        unlocked() {return hasMilestone('F', 1)} // Determines if you can use the hotkey, optional
    },
    ],
    canBuyMax(){
        return hasUpgrade('F',13) ||hasMilestone('E',603)
    },autoPrestige(){
        return hasMilestone('F',6000);
    },resetsNothing(){
        return hasMilestone('F',6000);
    },
   
    milestones: {
        1: {
            requirementDescription: "1 factor",
            effectDescription: "Unlock a new upgrade and Factors boost number and point gain.",
            done() { return player.F.points.gte(1) }
        },
        2: {
            requirementDescription: "2 factors",
            effectDescription: "Unlock the first Factor challenge",
            done() { return player.F.points.gte(2)}
        },
       3: {
            requirementDescription: "3 factors",
            effectDescription: "Unlock 2 more Number upgrades.",
            done() { return player.F.points.gte(3)&&player.X.points.gte(1)},
            unlocked() { return player.X.points.gte(1)}
        },

        4: {
            requirementDescription: "4 factors",
            effectDescription: "Unlock another Number upgrade.",
            done() { return player.F.points.gte(4)&&!player.X.points.gte(1)},
            unlocked() { return !player.X.points.gte(1)}
        },
        5: {
            requirementDescription: "5 factors",
            effectDescription: "Unlock Factor upgrades and gain 100% of numbers on reset per second",
            done() { return player.F.points.gte(5)||hasMilestone("MS", 2)}
        },
        8: {
            requirementDescription: "8 factors",
            effectDescription: "Unlock another Factor challenge and double number gain.",
            done() { return player.F.points.gte(8)}
        },
        12: {
            requirementDescription: "12 factors",
            effectDescription: "Unlock another Factor challenge",
            done() { return player.F.points.gte(12)}
        },
    
        19: {
            requirementDescription: "19 factors",
            effectDescription: "Unlock another Factor challenge and multiply point gain by 100.",
            done() { return player.F.points.gte(19)&&player.X.points.gte(1)},
            unlocked() { return player.X.points.gte(1)}
        },
        44: {
            requirementDescription: "44 factors",
            effectDescription: "Unlock another Factor challenge",
            done() { return player.F.points.gte(44)&&!player.X.points.gte(1)},
            unlocked() { return !player.X.points.gte(1)}
        },
        56: {
            requirementDescription: "56 factors",
            effectDescription: "Boost 'Factor alpha' and it also affect Factor Point gain.",
            done() { return player.F.points.gte(56)&&player.X.points.gte(1)},
            unlocked() { return player.X.points.gte(1)}
        },
        90: {
            requirementDescription: "90 factors",
            effectDescription: "Unlock another number upgrade",
            done() { return player.F.points.gte(90)}
        },
        108: {
            requirementDescription: "108 factors",
            effectDescription: "Unlock another Factor challenge",
            done() { return player.F.points.gte(108)&&!player.X.points.gte(1)},
            unlocked() { return !player.X.points.gte(1)}
        },
        120: {
            requirementDescription: "120 factors",
            effectDescription: "'Factor Alpha' is better",
            done() { return player.F.points.gte(120)&&!player.X.points.gte(1)},
            unlocked() { return !player.X.points.gte(1)}
        },
        240: {
            requirementDescription: "240 factors",
            effectDescription: "Increase '/' effect base by 0.005 and unlock an upgrade.",
            done() { return player.F.points.gte(240)&&player.X.points.gte(1)},
            unlocked() { return player.X.points.gte(1)}
        },
        888: {
            requirementDescription: "888 factors",
            effectDescription: "'Factor Alpha' is much better.",
            done() { return player.F.points.gte(888)&&!player.X.points.gte(1)},
            unlocked() { return !player.X.points.gte(1)}
        },
    1000: {
            requirementDescription: "1000 factors",
            effectDescription: "'Factor Beta' is better.",
            done() { return player.F.points.gte(1000)&&!player.X.points.gte(1)},
            unlocked() { return !player.X.points.gte(1)}
        },
        1100: {
            requirementDescription: "1100 factors",
            effectDescription: "The first Factor milestone is better.",
            done() { return player.F.points.gte(1100)}
        },  
        1333: {
            requirementDescription: "1333 factors",
            effectDescription: "Unlock another number upgrade.",
            done() { return player.F.points.gte(1333)}
        },     
        1580: {
            requirementDescription: "1580 factors",
            effectDescription() {
                if(player.X.points.gte(1))    return "Unlock a number buyable and auto buy it."
                else  return "Unlock a number buyable."},
            done() { return player.F.points.gte(1580)}
        },  
        6000: {
            requirementDescription() {
                if(player.X.points.gte(1))    return "1700 factors"
                else  return "6000 factors"},       
            effectDescription() {
                if(player.X.points.gte(1))    return "Boost '+', auto buy Factors, and Factors resets nothing"
                else  return "Remove the first hardcap of '+', auto buy Factors, and Factors resets nothing."},       
            done() { return (player.F.points.gte(6000)||(player.F.points.gte(1700)&&player.X.points.gte(1)))||(hasMilestone("I", 1)&&!player.X.points.gte(1))||hasMilestone("MS", 2)}
        },  
        12500: {
            requirementDescription() {
                if(player.X.points.gte(1))    return "90000 factors"
                else  return "12500 factors"},  
                effectDescription() {
                    if(player.X.points.gte(1))    return "Unlock 3 Infinity challenge."
                    else  return  "Remove the second hardcap of '+'."},      
            done() { return player.F.points.gte(12500)||(player.F.points.gte(90000)&&player.X.points.gte(1))},
        },  
        1.25e40: {
            requirementDescription: "1.25e40 factors",
            effectDescription: "Multiply IP gain by 1e15.",
            done() { return player.F.points.gte(1.25e40)}
        },
        1e100: {
            requirementDescription: "1e1000 factors",
            effectDescription: "Raise O gain to 1.5.",
            done() { return player.F.points.gte('1e1000')}
        },

    },
    upgrades: {
        11: {
            title: "Factor Alpha",
            description: "Boost point and number gain based on Factors.",
            effect() {
                if(player.X.points.gte(1)&&hasChallenge('UF',201))  return player.F.points.pow(player.F.points.pow(0.2)).add(1)
              else  if(player.X.points.gte(1)&&hasMilestone('F',56))  return player.F.points.pow(1.5).add(1)
                if(player.F.points.pow(player.F.points.pow(0.02)).add(1).gte("ee18"))return new Decimal("ee18")
                if (hasUpgrade('UF',71)&&challengeCompletions('UF',21)>1) return player.F.points.pow(player.F.points.pow(0.02)).add(1)
                if (hasUpgrade('UF',71))  return player.F.points.pow(1e6).add(1)
                if (inChallenge('F',42)|inChallenge('F',43)) return 1 
                if (inChallenge('F',23)) return 1
                if (inChallenge('F',22)) return 1 
                if (player.F.points>=1108) return 4500
                if (hasMilestone('F',888)) return player.F.points.pow(1.2).add(1)
                if (hasMilestone('F',120)) return player.F.points.pow(0.65).add(1)
                return player.F.points.pow(0.4).add(1)
        
                    },
                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },

            cost: new Decimal(5),
            unlocked() {
                return hasMilestone("F",5)|hasMilestone("I", 1)
            },
        },
        12: {
            title: "Factor Beta",
            description: "Numbers boost itself.",
            effect() {
           
                if (inChallenge('F',22)) return 1 
                if(player.X.points.gte(1)&&player.N.m7) return player.N.points.pow(0.24).add(1)
                if(player.X.points.gte(1)&&hasChallenge('UF',202)) return player.N.points.pow(0.22).add(1)
                if(player.X.points.gte(1)&&hasUpgrade('N',32)) return player.N.points.pow(0.16).add(1)
                if(player.X.points.gte(1)&&hasUpgrade('F',24)) return player.N.points.pow(0.12).add(1)
                if(player.X.points.gte(1)) return player.N.points.pow(0.1).add(1)
                if(inChallenge('E',11)&&(!player.E.no234.gte(1)))return new Decimal("1")
                if (player.N.points.gte("ee14")&&hasUpgrade('UF',72)) return new Decimal("ee9")
                if (hasUpgrade('UF',72))  return player.N.points.pow(0.00001).add(1)
                if (player.N.points.gte("ee9")) return new Decimal("1e50000")
                if (hasChallenge('I',32))  return player.N.points.pow(0.00005).add(1)
                if (hasChallenge('NN',21))  return player.N.points.pow(0.0001).add(1)
                if (hasChallenge('NN',12))  return player.N.points.pow(0.0025).add(1)
                if (hasChallenge('NN',11))  return player.N.points.pow(0.006).add(1)
                if (hasChallenge('I',22))  return player.N.points.pow(0.016).add(1)
                else if (hasMilestone('I',28)) return player.N.points.pow(0.025).add(1)
                if (inChallenge('F',42)|inChallenge('F',43)) return 1 
                if (inChallenge('F',22)) return 1 
                if (player.N.points>=1.078752e+144) return 1e35
                
                if (hasMilestone('F',1000)) return player.N.points.pow(0.243).add(1)
                if (hasUpgrade('F',24)) return player.N.points.pow(0.2).add(1)
             
                return player.N.points.pow(0.15).add(1)
        
                    },
                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
                    cost(){
                        if(player.X.points.gte(1)) return new Decimal(7)
                    else    return new Decimal(9)},
            unlocked(){
                return hasUpgrade("F", 11)|hasMilestone("I", 1)
            },
    },
    13: {
        title: "Factor Gamma",
        description(){
            if(player.X.points.gte(1)) return "Unlock a challenge, you can buy max factor."
          else  if(hasUpgrade('UF',11))  return "Unlock 3 Number upgrades."
        else return "Unlock 2 Number upgrades, 2 Factor challenges and you can buy max factor."},
        cost(){
            if(player.X.points.gte(1)) return new Decimal(9)
        else    return new Decimal(15)},
        unlocked(){
            return hasUpgrade("F", 12)|hasMilestone("I", 1)
        },
},
14: {
    title: "Factor Delta",
    description(){
        if(player.X.points.gte(1)) return "Unlock factor point. multiply number gain by 2.5."
    
    else return "Remove the second hardcap of '3'"},

    cost(){
        if(player.X.points.gte(1)) return new Decimal(15)
    else    return new Decimal(36)},

    unlocked(){
        return hasMilestone("UF", 1)|hasMilestone("I", 1)&&!hasUpgrade("F", 51)
    },
},
15: {
    title: "Factor Epsilon",
    description(){ if(hasUpgrade('UF',11))  return "Number ^2"
    else return "Unlock a number buyable and Number x2"},
    cost: new Decimal(60),
    unlocked(){
        return hasChallenge("F", 23)
    },
},
21: {
    title: "Factor Zeta",
    description: "Unlock 1 factor challenge",
    cost(){
        if(player.X.points.gte(1)) return new Decimal(22)
    else    return new Decimal(125)},
   
    unlocked(){
        return player.UF.best.gte(3) ||hasMilestone("I", 1) ||hasMilestone("MS", 1)
    },
},
22: {
    title: "Factor Eta",
    description: "Unlock the first upgrade factor challenge.",
    cost: new Decimal(135),
    unlocked(){
        return (hasUpgrade('F',21)&&hasChallenge('F',33))||hasMilestone("MS", 1)
    },
},
23: {
    title: "Factor Theta",
    description(){
        if(player.X.points.gte(1)) return "Remove the first hardcap of '2' but nerf it."
    else return "Remove the fourth hardcap of '2'."},
  
    cost(){
        if(player.X.points.gte(1)) return new Decimal(24)
    else    return new Decimal(169)},

    unlocked(){
        return hasMilestone("I", 1)||hasUpgrade('F',22)||hasMilestone("MS", 1)||(hasChallenge('F',32)&&player.X.points.gte(1))
    },
},
24: {
    title: "Factor Iota",
    description: "Boost 'Factor Beta' and unlock 1 more factor upgrade." ,
    cost(){
        if(player.X.points.gte(1)) return new Decimal(50)
    else    return new Decimal(375)},
    unlocked(){
        return hasMilestone("I", 1)||hasMilestone('UF',6)||hasMilestone("MS", 1)
    },
},
25: {
    title: "Factor Kappa",
    description(){
        if(player.X.points.gte(1)) return "'-' work in 'Buyable Upgrader' but nerf it in 'Buyable Upgrader'"
    else return "Unlock 2 factor challenges."} ,
    cost(){
        if(player.X.points.gte(1)) return new Decimal(55)
    else    return new Decimal(460)},

    unlocked(){
        return hasMilestone("I", 1)||hasUpgrade('F',24)||hasMilestone("MS", 1)
    },
},
31: {
    title: "Factor Lambda",
    description: "boost Factor milestone 1. " ,
    cost: new Decimal(271777777),
    unlocked(){
        return hasMilestone("FS", 1)
    },
},
32: {
    title: "Factor Mu",
    description: "Unlock the third Infinity challenge " ,
    cost: new Decimal(555555555),
    unlocked(){
        return hasUpgrade("F", 31)
    },
},
33: {
    title: "Factor Nu",
    description: "Factor is cheaper." ,
    cost: new Decimal(1.11e9),
    unlocked(){
        return hasUpgrade("F", 32)
    },
},
34: {
    title: "Factor Xi",
    description: "Unlock 1 Negative number Upgrade" ,
    cost: new Decimal(2.09e10),
    unlocked(){
        return hasUpgrade("F", 33)
    },
},
35: {
    title: "Factor Omicron",
    description: "Unlock 1 number Upgrade" ,
    cost: new Decimal(2.7e10),
    unlocked(){
        return hasUpgrade("F", 34)
    },
},
41: {
    title: "Factor Pi",
    description: "Upgrade Factors are cheaper and you can buy max it." ,
    cost: new Decimal(9.5e10),
    unlocked(){
        return hasUpgrade("F", 35)
    },
},
42: {
    title: "Factor Rho",
    description: "Factor boost Negative numbers gain and unlock 1 upgrade." ,
    cost: new Decimal(8.55e11),
    unlocked(){
        return hasUpgrade("F", 41)
    },
},
43: {
    title: "Factor Sigma",
    description: "Boost 'Factor Lambda'" ,
    cost: new Decimal(1.25e16),
    unlocked(){
        return hasUpgrade("F", 42)
    },
},
44: {
    title: "Factor Tau",
    description: "Upgrade factors are cheaper." ,
    cost: new Decimal(2.5e27),
    unlocked(){
        return hasUpgrade("F", 43)
    },
},
45: {
    title: "Factor Upsilon",
    description: "Unlock 4 upgrade and Number ^1.1" ,
    cost: new Decimal(2.6e27),
    unlocked(){
        return hasUpgrade("F", 44)
    },
},
16: {
    title: "Factor Phi",
    description: "The '+' effect is always 1.79e308" ,
    cost: new Decimal(7.9e27),
    unlocked(){
        return hasUpgrade("F", 45)
    },
},
26: {
    title: "Factor Chi",
    description: "The 'x' effect is always 1.79e308" ,
    cost: new Decimal(1e28),
    unlocked(){
        return hasUpgrade("F", 45)
    },
},
36: {
    title: "Factor Psi",
    description: "The '/' effect is always 3.08" ,
    cost: new Decimal(1.35e28),
    unlocked(){
        return hasUpgrade("F", 45)
    },
},
46: {
    title: "Factor Omega ",
    description: "Unlock Mathematics Symbol and Infinity point gain x100." ,
    cost: new Decimal(1e31),
    unlocked(){
        return hasUpgrade("F", 45)
    },
},

51: {
    title: "Ω",
    description: "Remove some useless upgrade and IP ^2.",
    cost: new Decimal("0"),
    unlocked(){
        {return hasChallenge('I',42)}
    },
    style: {width: "700px"}
},
101: {
    title: "Factor booster",
    description: "Number boost Factor point gain." ,
    cost: new Decimal(18),
    unlocked(){
        return player.UF.points.gte(2)&&player.X.points.gte(1)
    },
    },
    102: {
        title: "Factor Generator",
        description: "Factor point boost number gain." ,
        cost: new Decimal(60),
        unlocked(){
            return hasMilestone('F',56)&&player.X.points.gte(1)
        },
        },
        103: {
            title: "Factor Enhancer",
            description: "Factor point effect is greater." ,
            cost: new Decimal(175),
            unlocked(){
                return hasMilestone('I',1)&&player.X.points.gte(1)
            },
            },
            104: {
                title: "Number booster",
                description: "Number ^1.0777" ,
                cost: new Decimal(781.25),
                unlocked(){
                    return hasMilestone('I',3)&&player.X.points.gte(1)
                },
                },
},
    challenges: {
        11: {
            name: "/ factor",
            challengeDescription(){
                return  "Numbers and points gain x0.3"},
            goal(){
                if(player.X.points.gte(1)) return new Decimal(300000)
              else  return new Decimal(1000000)},
            rewardDescription(){
                if(player.X.points.gte(1))  return "Numbers and Points x3 and unlock a upgrade."
              else  return "Numbers and Points x3"},
          unlocked(){return hasMilestone('F', 2)},
        },
        12: {
            name: "No upgrade factor",
            challengeDescription: "'2' is useless",
            canComplete(){
                if(player.X.points.gte(1))   return player.N.points.gte("1e16")
               else return player.N.points.gte("100000000")},
            goalDescription(){
                if(player.X.points.gte(1))  return "1e16 Numbers"
               else return "100,000,000 Numbers"} ,
            rewardDescription(){return "Numbers and Points x3"},
          unlocked(){return hasMilestone('F', 8)},
          
        },
        13: {
            name: "2 in 1",
            challengeDescription: "You are trapped in / and No upgrade factor.",
            canComplete(){
                if(player.X.points.gte(1))   return player.N.points.gte("1e23")
               else return player.N.points.gte("3.14e9")},
       
            goalDescription(){
                if(player.X.points.gte(1))  return "1e23 Numbers"
               else return "3.14e9 Numbers"} ,
            rewardDescription(){return "Unlock a number upgrade."},
          unlocked(){return hasMilestone('F', 12)},
          
        },
        21: {
            name: "No cap factor",
            challengeDescription: "'6', '7' and '8' are useless.",
            canComplete(){return player.N.points.gte("3.14e11")},
            goalDescription: "3.14e11 Numbers",
            rewardDescription(){return "Factor will not reset upgrades and numbers x1.5."},
          unlocked(){return hasUpgrade('F', 13)&&!player.X.points.gte(1)},
          
        },
        22: {
            name: "No factor factor",
            challengeDescription: "Factor milestone 4 and upgrades are useless.",
        
            canComplete(){
                if(player.X.points.gte(1))   return player.N.points.gte("1e25")
               else return player.N.points.gte("3.14e18")},
            goalDescription(){
                if(player.X.points.gte(1))  return "1e25 Numbers"
               else return "3.14e18 Numbers"} ,
            rewardDescription(){
                if(player.X.points.gte(1))        return "Points and Numbers x2 and unlock a buyable."
             else   return "Points and Numbers x2"},
          unlocked(){return hasUpgrade('F', 13)},
          
        },
        23: {
            name: "3 in 1",
            challengeDescription: "You are trapped in 2 in 1, No cap and no factor factor.",
            canComplete(){return player.N.points.gte("420420420")},
            goalDescription: "420,420,420 Numbers",
            rewardDescription(){return "Factors are cheaper and unlock a factor upgrade."},
          unlocked(){return hasMilestone('F', 44)},
          
        },
        24: {
            name: "Reverse",
            challengeDescription: "All upgrades which boost Number gain effect is divide instead of multiple. However, upgrades effect ^0.5.",
            canComplete(){return player.N.points.gte("1e96")},
            goalDescription: "1e96 Numbers",
            rewardDescription(){return "^ cost base is 1.79e308 and auto buy it."},
          unlocked(){return hasChallenge("UF",211)&&player.X.points.gte(1)},
          
        },
        31: {
            name: "Super / factor",
            challengeDescription: "Points and Numbers / 1e6",
        
            rewardDescription(){return "unlock a Number buyable."},
            canComplete(){
                if(player.X.points.gte(1))   return player.N.points.gte("4.2e42")
               else return player.N.points.gte("3140")},
            goalDescription(){
                if(player.X.points.gte(1))  return "4.20e42 Numbers"
               else return "3,140 Numbers"} ,
       
          unlocked(){return hasMilestone('F', 108)||hasMilestone('F', 19)},
          
        },
        32: {
            name: "Super No upgrade factor",
            challengeDescription: "'2','3' and '4' ard useless.",

            rewardDescription(){
                if(player.X.points.gte(1))  return "'-' base x2 and unlock a factor upgrade"
              else  return "'-' base x2 and unlock a factor challenge"},
        
            canComplete(){
                if(player.X.points.gte(1))   return player.N.points.gte("3.14e21")
               else return player.N.points.gte("3.14e16")},
            goalDescription(){
                if(player.X.points.gte(1))  return "3.14e21 Numbers"
               else return "3.14e16 Numbers"} ,
          unlocked(){return hasUpgrade('F', 21)},
          
        },
        33: {
            name: "Super 2 in 1",
            challengeDescription: "You are trapped in super / and super No upgrade factor.",
            canComplete(){return player.N.points.gte("314")},
            goalDescription: "314 Numbers",
            rewardDescription(){return "'-' base x2 and unlock a factor upgrade"},
          unlocked(){return (hasUpgrade('F', 21) && (hasChallenge('F',32)&&!player.X.points.gte(1)))},
          
        },
        41: {
            name: "Super no cap factor",
            challengeDescription: "'2', '3' and '4' effects are capped at 10",
            canComplete(){return player.N.points.gte("3.14e38")},
            goalDescription: "3.14e38 Numbers",
            rewardDescription(){return "Factor are cheaper."},
        
          unlocked(){return (hasUpgrade('F', 25))&&!player.X.points.gte(1)},
          
        },
        42: {
            name: "Super no factor factor",
            challengeDescription: "Factor milestone 4 and upgrades are useless.",
            canComplete(){return player.N.points.gte("3.14e45")},
            goalDescription: "3.14e45 Numbers",
            rewardDescription(){return "'-' cost base /1e4."},
          
            rewardDescription(){return "Numbers and Points x3"},
          unlocked(){return (hasUpgrade('F', 25))&&!player.X.points.gte(1)},
          
        },
        43: {
            name(){
                if(player.X.points.gte(1))  return "root factor"
              else  return "Super 3 in 1"},
              challengeDescription(){
               if (player.X.points.gte(1)) return  "Number gain ^0.3"
            else return "You trapped in Super 2 in 1, Super no cap factor and Super no factor factor"},
            canComplete(){
                if(player.X.points.gte(1))   return player.N.points.gte("3.14e13")
               else return player.N.points.gte("1e15")},
            goalDescription(){
                if(player.X.points.gte(1))  return "3.14e13 Numbers"
               else return "1e15 Numbers"} ,
        
            rewardDescription(){return "Factor are cheaper."},
          unlocked(){return hasMilestone('UF', 10)},
        },
    
        },
        buyables:{
            11: {
                title: "Factor a",
                display() {
            return "Boost Number gain by " + format(tmp.F.buyables[11].effect) + "x<br>Cost : " + format(new Decimal("5").pow(getBuyableAmount("F", 11).add(1))) + " Factors"
                },
                unlocked() { return hasUpgrade('N',44) },
                canAfford() { 
                  return player.F.points.gte(new Decimal("5").pow(getBuyableAmount("F", 11).add(1))) 
                },
                buy() { 
                    {
                  player.F.points = player.F.points.minus(new Decimal("5").pow(getBuyableAmount("F", 11).add(1)))
                    }
                    setBuyableAmount("F", 11, getBuyableAmount("F", 11).add(1))
                },
                effect() {
                    if (inChallenge("NN", 21)&&hasChallenge("NN", 21)) eff =  new Decimal(1)
                else eff = new Decimal("30").pow(getBuyableAmount("F", 11))     
                    return  eff = eff   
                      
                },
                
               
            },
            12: {
                title: "Factor b",
                display() {
            return "Boost Point gain by " + format(tmp.F.buyables[12].effect) + "x<br>Cost : " + format(new Decimal("7").pow(getBuyableAmount("F", 12).add(1))) + " Factors"
                },
                unlocked() { return hasUpgrade('N',45) },
                canAfford() { 
                  return player.F.points.gte(new Decimal("7").pow(getBuyableAmount("F", 12).add(1))) 
                },
                buy() { 
                    {
                  player.F.points = player.F.points.minus(new Decimal("7").pow(getBuyableAmount("F", 12).add(1)))
                    }
                    setBuyableAmount("F", 12, getBuyableAmount("F", 12).add(1))
                },
                effect() {
                    if (inChallenge("NN", 21)&&hasChallenge("NN", 21)) eff =  new Decimal(1)
                  else eff = new Decimal("24").pow(getBuyableAmount("F", 12))     
                    return  eff = eff   
                      
                }
            },
            13: {
                title: "Factor c",
                display() {
            return "Boost Number gain by " + format(tmp.F.buyables[13].effect) + "x<br>Cost : " + format(new Decimal("12").pow(getBuyableAmount("F", 13).add(1))) + " Factors"
                },
                unlocked() { return hasMilestone('NN',1e28) },
                canAfford() { 
                  return player.F.points.gte(new Decimal("12").pow(getBuyableAmount("F", 13).add(1))) 
                },
                buy() { 
                    {
                  player.F.points = player.F.points.minus(new Decimal("12").pow(getBuyableAmount("F", 13).add(1)))
                    }
                    setBuyableAmount("F", 13, getBuyableAmount("F", 13).add(1))
                },
                effect() {
                if (inChallenge("NN", 21)&&hasChallenge("NN", 21)) eff =  new Decimal(1)
                else eff =  new Decimal(player.F.points.add(1).log(10).pow(3).add(1)).pow(getBuyableAmount("F", 13))
                    return  eff 
                      
                }
            },

        },
    
        update(diff){
            let gain=new Decimal(0)
            let exp=new Decimal(0.35)
            if(hasUpgrade('F',101)) exp=new Decimal(0.5)
            if(hasUpgrade('N',35)) exp=new Decimal(8)
            if(hasUpgrade('N',35)&&player.N.m8) exp=new Decimal(15)
            if(hasUpgrade('F',14)) gain=gain.add(player.F.points.pow(exp))      
            if(hasUpgrade('F',101)) gain=gain.times(player.N.points.add(10).log(10).pow(2))
            if(hasMilestone('F',56)) gain=gain.times(upgradeEffect('F',11))
            if(hasMilestone('UF',35)) gain=gain.times(player.UF.points.add(1).pow(4))
            if(hasUpgrade("NN",21))gain=gain.times(player.NN.points.add(1).pow(0.15))
            if(inChallenge("I",82))gain=gain.pow(new Decimal(0.2).pow(new Decimal(1).add(challengeCompletions("I",82))))
            player.FPgain=gain
           player.F.FP= player.F.FP.add(player.FPgain.times(diff))

        },
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
        unlocked(){return hasMilestone('F',5)||hasMilestone("I", 1)},
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
        unlocked(){return (hasMilestone('F',2)||hasMilestone("I", 1))&&(!inChallenge("NN", 12)&&!hasChallenge("NN", 12))},
        content:[
          "main-display",
          "blank",
        ["prestige-button",function(){return ""}],
          "blank",
          "blank",
          ["display-text",function(){
            let s = "There are upgrades that require being in a challenge (Number Upgrade)."
            return s
          }],
          "challenges",
        ]
      },
      "Buyables":{
        unlocked(){return hasUpgrade('N',44)&&(!inChallenge("NN", 21)&&!hasChallenge("NN", 21))},
        content:[
      "main-display",
        "blank",
      ["prestige-button",function(){return ""}],
      "blank",
      "resource-display",
      "blank",
      "blank",
      "buyables",
        ]},
        "Factor point":{
            unlocked(){return hasUpgrade('F',14)&&player.X.points.gte(1)},
            content:[
          "main-display",
            "blank",
          ["prestige-button",function(){return ""}],
          "blank",
          "resource-display",
          "blank",
          ["display-text",function(){

            let s = ""
            if(hasUpgrade('F',103))  s+="You have " + format(player.F.FP) + " Factor point, which make factor cost base ^" + format(new Decimal(1).div(player.F.FP.add(10).log(2).pow(0.15)))+"<br>" 
           else s+="You have " + format(player.F.FP) + " Factor point, which make factor cost base ^" + format(new Decimal(1).div(player.F.FP.add(10).log(10).pow(0.1)))+"<br>" 
           s+="You are gaining "+ format(player.FPgain)+" Factor Point per second."
            return s
          }],
          "blank",
        
            ]},
      },

      doReset(resettingLayer) {
        let keep = [];
        if (resettingLayer=="E") keep.push("milestones")
        if (hasMilestone("Z", 4) &&resettingLayer=="Z") keep.push("milestones")
        if (hasMilestone("I", 2) && resettingLayer=="I") keep.push("milestones")
        if (hasMilestone("I", 3) && resettingLayer=="I") keep.push("challenges")
        if (hasMilestone("IP", 1) && resettingLayer=="IP") keep.push("challenges")
        if (hasMilestone("IP", 4) && resettingLayer=="IP") keep.push("upgrades")
        if (hasMilestone("IP", 4) && resettingLayer=="IP") keep.push("milestones")
        if (hasMilestone("I", 4) && resettingLayer=="I") keep.push("upgrades")
        if (hasMilestone("MS", 3) && resettingLayer=="MS") keep.push("upgrades")
        if (hasMilestone("MS", 3) && resettingLayer=="MS") keep.push("milestones")
        if (hasMilestone("MS", 3) && resettingLayer=="MS") keep.push("challenges")
        if (hasMilestone("UF", 5100) && resettingLayer=="O") keep.push("milestones")
        if (hasMilestone("UF", 5100) && resettingLayer=="M") keep.push("milestones")
        if (resettingLayer=="S"&&hasMilestone('S',2)) keep.push("milestones")
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
      },
      automateStuff(){
        if(hasMilestone("I",69)){
          if(layers.F.buyables[11].canAfford())setBuyableAmount("F",11,player.F.points.log(5).floor().add(1))
          if(layers.F.buyables[12].canAfford())setBuyableAmount("F",12,player.F.points.log(7).floor().add(1))
          if(layers.F.buyables[13].canAfford())setBuyableAmount("F",13,player.F.points.log(12).floor().add(1))
        }
    },
    autoUpgrade(){
        if  (hasMilestone('MS',1)) return true
        else return false
    },
      
    


      layerShown(){return hasUpgrade('N',15)||hasMilestone('IP',1)||hasMilestone('FS',1)||hasMilestone('F',1)||hasMilestone('UF',1)||hasMilestone('I',1)},
})