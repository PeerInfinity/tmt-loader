addLayer("MS", {
    name: "Mathematics Symbol", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "MS", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        x: new Decimal(1),
        y: new Decimal(1),
        z: new Decimal(1),
        a: new Decimal(1),
        xgain: new Decimal(0),
        ygain: new Decimal(0),
        zgain: new Decimal(0),
        again: new Decimal(0),
        Exponentiation: new Decimal(0),
        Prestige: new Decimal(0),
        Prestige2: new Decimal(0),
        Prestige3: new Decimal(0),
        gainb:new Decimal(0),
        xa: new Decimal(1),
        xb: new Decimal(1),
        xbgain: new Decimal(1),
        divcost: new Decimal(1),
        size: new Decimal(1e10),
        addpoint: new Decimal(0),
        cboost: new Decimal(1),
        minuspoint: new Decimal(0),
    }},
    position: 1,  
    color: "#8000ff",
    requires: new Decimal("1e1800"), // Can be a function that takes requirement increases into account
    resource(){return "Mathematics Symbol"}, 
    baseResource: "Infinity point", // Name of resource prestige is based on
    baseAmount() {return player.IP.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    base:new Decimal("1e2700"),
    exponent(){
       
        if(hasChallenge('E',21)) return 17
        if(player.MS.points>=8&&!hasUpgrade('MS',42))  return player.MS.points.pow(player.MS.points.pow(0.7).tetrate(1.45)).tetrate(1.2)
        else if(player.MS.points>=4)  return 20.16
        else return 2
        
    },
    branches:["IP","I","FS"],
    hotkeys: [
        {key: "m", description: "M: Reset for Mathematics Symbol", onPress(){if (canReset(this.layer)) doReset(this.layer)},
        onPress() { if (player.MS.unlocked) doReset("MS") },
        unlocked() {return hasMilestone('MS', 1)} // Determines if you can use the hotkey, optional
    },
    ],
     // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    milestones: {
        1: {
            requirementDescription: "1 Mathematics Symbol",
            effectDescription: "Auto buy Number upgrade and Factor Upgrade and Number, points x1e20, FS reset nothing and Unlock 1 IC.",
            done() { return player.MS.points.gte(1) }
        },
        2: {
            requirementDescription: "2 Mathematics Symbol",
            effectDescription: "Keep IP milestone 4, F milestone 4, 16 and UF milestone 6 and 7 on reset. IP gain ^1.1. Remove the hardcap of NN gain.",
            done() { return player.MS.points.gte(2) }
        },
        3: {
            requirementDescription: "3 Mathematics Symbol",
            effectDescription: "Keep F content and I milestones on reset, IP boost point gain.",
            done() { return player.MS.points.gte(3) }
        },
        4: {
            requirementDescription: "1 prestige point",
            effectDescription: "Boost X and Y gain based on Prestige points and X, Y gain x2.",
            done() { return player.MS.Prestige.gte(1) }
        },
        8: {
            requirementDescription: "8 prestige point",
            effectDescription: "You can't get any prestige point.",
            done() { return player.MS.Prestige.gte(8) }
        },
        40: {
            requirementDescription: "4 Mathematics Symbol",
            effectDescription: "IP ^1.1 and unlock 1 IC. Auto buy FS. Number x10.",
            done() { return player.MS.points.gte(4) }
        },
        41: {
            requirementDescription: "1 Super prestige point.",
            effectDescription: "Super prestige point boost X and Y gain and Y +1.",
            done() { return player.MS.Prestige2.gte(1) }
        },
        42: {
            requirementDescription: "2 Super prestige point.",
            effectDescription: "Get 25 prestige point on reset and unlock 1 upgrade. You can't get any super prestige point",
            done() { return player.MS.Prestige2.gte(2) }
        },
        55: {
            requirementDescription: "5 Super prestige point.",
            effectDescription: "Get 100 prestige point on reset.",
            done() { return player.MS.Prestige2.gte(5) }
        },
        400: {
            requirementDescription: "40 Super prestige point.",
            effectDescription: "You can't get any super prestige point and remove the hardcap of Exponentiation point gain.",
            done() { return player.MS.Prestige2.gte(40) }
        },
        500: {
            requirementDescription: "5 Mathematics Symbol",
            effectDescription: "Remove IP challenge but Number ^25.",
            done() { return player.MS.points.gte(5) }
        },
        600: {
            requirementDescription: "6 Mathematics Symbol",
            effectDescription: "MS reset nothing and Buyable is cheaper, gain 100000% of EP on reset per second ",
            done() { return player.MS.points.gte(6) }
        },
        700: {
            requirementDescription: "7 Mathematics Symbol",
            effectDescription: "Unlock z in Exponentiation. Unlock more Exponentiation and UF Upgrade.",
            done() { return player.MS.points.gte(7) }
        },
        800: {
            requirementDescription: "8 Mathematics Symbol",
            effectDescription: "Unlock Hyper prestige and auto get prestige point.",
            done() { return player.MS.points.gte(8) }
        },
        3000: {
            requirementDescription: "3 Hyper prestige point",
            effectDescription: "Auto get super prestige point.",
            done() { return player.MS.Prestige3.gte(3) }
        },
        4000: {
            requirementDescription: "10 Hyper prestige point",
            effectDescription: "Auto get Challenge point. CP boost super prestige point gain.",
            done() { return player.MS.Prestige3.gte(10) }
        },
        11000: {
            requirementDescription: "11 Mathematics Symbol with F6.1 Upgrade",
            effectDescription: "Boost '9' and '0'",
            done() { return player.MS.points.gte(11)&&hasUpgrade('MS',42) }
        },
        8e29: {
            requirementDescription: "e8e29 IP",
            effectDescription: "Game speed x10",
            done() { return player.IP.points.gte("e8e29") },
            onComplete(){ return       player.devSpeed=10 },
        },
        1.7e30: {
            requirementDescription: "e1.7e30 IP",
            effectDescription: "Boost game speed based on your IP.",
            done() { return player.IP.points.gte("e1.7e30") },
         
        },
        1.83e36: {
            requirementDescription: "e1.83e36 IP",
            effectDescription: "Boost game speed based on your Factor.",
            done() { return player.IP.points.gte("e1.83e36") },
         
        },

    },
    resetsNothing(){
        return hasMilestone('MS',600) ;
    },
    update(diff){
        let xgain = new Decimal(0)

        let ygain = new Decimal(0)

        let zgain = new Decimal(0)
        if(hasUpgrade('MS',42))  player.MS.Exponentiation=new Decimal(1)
        else if(hasUpgrade('MS',35))  player.MS.Exponentiation=(Decimal.tetrate(Decimal.pow(new Decimal(player.MS.x),(new Decimal(player.MS.y).pow(player.MS.z))),player.MS.a))
        else if(hasMilestone('MS',700)) player.MS.Exponentiation=(Decimal.pow(new Decimal(player.MS.x),(new Decimal(player.MS.y).pow(player.MS.z))))
        else if(hasMilestone('MS',400)) player.MS.Exponentiation=(Decimal.pow(player.MS.x,player.MS.y))
        else if(player.MS.Exponentiation.gte("1e6000")) return player.MS.Exponentiation=new Decimal("1e6000")
        else if(hasMilestone('IP',1000000)) player.MS.Exponentiation=(Decimal.pow(player.MS.x,player.MS.y))
        else if(player.MS.Exponentiation.gte("1e2500")&&!hasUpgrade('IP',66)) return player.MS.Exponentiation=new Decimal("1e2500")
        else player.MS.Exponentiation=(Decimal.pow(player.MS.x,player.MS.y))
        if(hasUpgrade("MS",11))xgain=new Decimal(1)
        if(hasUpgrade("MS",12))ygain=new Decimal(0.01)
        if(hasMilestone("MS",700))zgain=new Decimal(0.025)
        if (hasUpgrade('MS',41)) again=new Decimal(1)
        else if(hasUpgrade('MS',35)) again=new Decimal(0.00000001)
        if(hasUpgrade("MS",51))xbgain=new Decimal(0.0005)
       
        if(hasUpgrade('UF',23)) player.MS.y=player.MS.y.plus(ygain.times(diff).times(player.MS.x.add(1).log(10).add(1).log(10).add(1).log(10).add(1)).times(player.MS.Exponentiation.add(1).log(10).add(1).log(10).pow(0.5)).times(18).times(player.MS.Prestige.add(1)).add(1).pow(player.MS.Prestige2.add(1).pow(0.5).times(1.5)))
        else if(hasMilestone('MS',41)) player.MS.y=player.MS.y.plus(ygain.times(diff).times(player.MS.x.add(1).log(10).add(1).log(10).add(1).log(10).add(1)).times(player.MS.Exponentiation.add(1).log(10).add(1).log(10).pow(0.5)).times(18).times(player.MS.Prestige.add(1)).add(1).pow(player.MS.Prestige2.add(1).pow(0.5)))
        else if(hasUpgrade('IP',66)) player.MS.y=player.MS.y.plus(ygain.times(diff).times(player.MS.x.add(1).log(10).add(1).log(10).add(1).log(10).add(1)).times(player.MS.Exponentiation.add(1).log(10).add(1).log(10).pow(0.5)).times(18).times(player.MS.Prestige.add(1)))
        else if(hasMilestone('MS',4))  player.MS.y=player.MS.y.plus(ygain.times(diff).times(player.MS.x.add(1).log(10).add(1).log(10).add(1).log(10).add(1)).times(player.MS.Exponentiation.add(1).log(10).add(1).log(10).pow(0.5)).times(6).times(player.MS.Prestige.add(1)))
        else if (hasUpgrade('MS',25))player.MS.y=player.MS.y.plus(ygain.times(diff).times(player.MS.x.add(1).log(10).add(1).log(10).add(1).log(10).add(1)).times(player.MS.Exponentiation.add(1).log(10).add(1).log(10).pow(0.5)).times(3))
        else if (hasUpgrade('MS',24)) player.MS.y=player.MS.y.plus(ygain.times(diff).times(player.MS.x.add(1).log(10).add(1).log(10).add(1).log(10).add(1)).times(player.MS.Exponentiation.add(1).log(10).add(1).log(10).pow(0.5)).times(2))
        else if (hasUpgrade('MS',22))player.MS.y=player.MS.y.plus(ygain.times(diff).times(player.MS.x.add(1).log(10).add(1).log(10).add(1).log(10).add(1)).times(player.MS.Exponentiation.add(1).log(10).add(1).log(10).pow(0.5)))
        else if (hasUpgrade('MS',14))player.MS.y=player.MS.y.plus(ygain.times(diff).times(player.MS.x.add(1).log(10).add(1).log(10).add(1).log(10).add(1)))
        else player.MS.y=player.MS.y.plus(ygain.times(diff))
        if(hasUpgrade('UF',23)) player.MS.x=player.MS.x.plus(xgain.times(diff).times(player.IP.points.add(1).log(10).add(1).log(10).add(1)).times(player.MS.y.add(1)).times(player.MS.Exponentiation.add(1).log(10).pow(0.5)).pow(1.25).times(15).times(player.MS.Prestige.add(1)).pow(player.MS.Prestige2.add(1).pow(0.5).times(1.5)))
        else if(hasMilestone('MS',41)) player.MS.x=player.MS.x.plus(xgain.times(diff).times(player.IP.points.add(1).log(10).add(1).log(10).add(1)).times(player.MS.y.add(1)).times(player.MS.Exponentiation.add(1).log(10).pow(0.5)).pow(1.25).times(15).times(player.MS.Prestige.add(1)).pow(player.MS.Prestige2.add(1).pow(0.5)))
        else if(hasUpgrade('IP',66)) player.MS.x=player.MS.x.plus(xgain.times(diff).times(player.IP.points.add(1).log(10).add(1).log(10).add(1)).times(player.MS.y.add(1)).times(player.MS.Exponentiation.add(1).log(10).pow(0.5)).pow(1.25).times(15).times(player.MS.Prestige.add(1)))
        else if(hasMilestone('MS',4)) player.MS.x=player.MS.x.plus(xgain.times(diff).times(player.IP.points.add(1).log(10).add(1).log(10).add(1)).times(player.MS.y.add(1)).times(player.MS.Exponentiation.add(1).log(10).pow(0.5)).pow(1.25).times(5).times(player.MS.Prestige.add(1)))
        else if (hasUpgrade('MS',25))  player.MS.x=player.MS.x.plus(xgain.times(diff).times(player.IP.points.add(1).log(10).add(1).log(10).add(1)).times(player.MS.y.add(1)).times(player.MS.Exponentiation.add(1).log(10).pow(0.5)).pow(1.25).times(2.5))
        else if (hasUpgrade('MS',23))  player.MS.x=player.MS.x.plus(xgain.times(diff).times(player.IP.points.add(1).log(10).add(1).log(10).add(1)).times(player.MS.y.add(1)).times(player.MS.Exponentiation.add(1).log(10).pow(0.5)).pow(1.25))
        else if (hasUpgrade('MS',21))  player.MS.x=player.MS.x.plus(xgain.times(diff).times(player.IP.points.add(1).log(10).add(1).log(10).add(1)).times(player.MS.y.add(1)).times(player.MS.Exponentiation.add(1).log(10).pow(0.5)))
        else if (hasUpgrade('MS',15))  player.MS.x=player.MS.x.plus(xgain.times(diff).times(player.IP.points.add(1).log(10).add(1).log(10).add(1)).times(player.MS.y.add(1)))
        else if (hasUpgrade('MS',13)) player.MS.x=player.MS.x.plus(xgain.times(diff).times(player.IP.points.add(1).log(10).add(1).log(10).add(1)))
        else  player.MS.x=player.MS.x.plus(xgain.times(diff))

        if (hasUpgrade('MS',35)) player.MS.z=player.MS.z.plus(zgain.times(diff).times(player.E.CP.add(1).log(10).add(1)).times(player.N.points.add(1).log(10).add(1).log(10).add(1)).times(player.MS.Prestige3.add(1).pow(3)).times(player.I.points.add(1).log(10).add(1).pow(2)))
        else if (hasMilestone('UF',800)) player.MS.z=player.MS.z.plus(zgain.times(diff).times(player.E.CP.add(1).log(10).add(1)).times(player.N.points.add(1).log(10).add(1).log(10).add(1)).times(player.MS.Prestige3.add(1).pow(3)))
        else if (hasUpgrade('UF',34)) player.MS.z=player.MS.z.plus(zgain.times(diff).times(player.E.CP.add(1).log(10).add(1)).times(player.N.points.add(1).log(10).add(1).log(10).add(1)))
        else if (hasUpgrade('MS',32)) player.MS.z=player.MS.z.plus(zgain.times(diff).times(player.E.CP.add(1).log(10).add(1)))
        else if(hasMilestone("MS",700)) player.MS.z=player.MS.z.plus(zgain.times(diff))
   
         player.MS.a=player.MS.a.plus(player.MS.again.times(diff))
        if(hasUpgrade("MS",34))  player.MS.Prestige=player.MS.Prestige.plus(player.MS.Exponentiation.add(1).log(10).add(1).log(10).add(1).log(10).add(1).times(diff).times(player.MS.points.add(1).pow(0.5 )).times(player.MS.Prestige3.add(1).pow(1.5)))
        else if(hasMilestone("MS",800)) player.MS.Prestige=player.MS.Prestige.plus(player.MS.Exponentiation.add(1).log(10).add(1).log(10).add(1).log(10).add(1).times(diff).times(player.MS.points.add(1).pow(0.5 )).times(2.5))
        if(hasMilestone("MS",4000)) player.MS.Prestige2=player.MS.Prestige2.plus(player.MS.Exponentiation.add(1).log(9).add(1).log(9).add(1).log(9).add(1).times(diff).times(player.MS.points.add(1).pow(0.4 )).times(player.E.CP.add(1).log(10).add(1).pow(1.5)).times(2.5))
        else if(hasMilestone("MS",3000)) player.MS.Prestige2=player.MS.Prestige2.plus(player.MS.Exponentiation.add(1).log(10).add(1).log(10).add(1).log(10).add(1).times(diff).times(player.MS.points.add(1).pow(0.3 )).times(2.5))
        if(hasUpgrade('MS',83))   player.devSpeed=new  Decimal("1")
      else  if(player.E.meta.gte(1)) player.devSpeed=new  Decimal("1.8e308")
       else if(challengeCompletions('O',11)>68) player.devSpeed=player.IP.points.add(1).log(10).add(1).log(10).add(1).times(player.M.points.add(1).pow(5)).times(player.F.points.add(1).log(10).add(1).log(10).add(1)).times(player.MS.points.add(1).pow(0.5)).times(buyableEffect('E',11)).pow(1.01)
      else  if(challengeCompletions('UF',21)>4) player.devSpeed=player.IP.points.add(1).log(10).add(1).log(10).add(1).times(player.M.points.add(1).pow(5)).times(player.F.points.add(1).log(10).add(1).log(10).add(1)).times(player.MS.points.add(1).pow(0.5)).times(buyableEffect('E',11))
      else  if(hasUpgrade('UF',43)) player.devSpeed=player.IP.points.add(1).log(10).add(1).log(10).add(1).times(player.M.points.add(1)).times(player.F.points.add(1).log(10).add(1).log(10).add(1)).times(player.MS.points.add(1).pow(0.5)).times(buyableEffect('E',11))
       else if(hasUpgrade('UF',41))player.devSpeed=player.IP.points.add(1).log(10).add(1).log(10).add(1).times(player.M.points.add(1)).times(player.F.points.add(1).log(10).add(1).log(10).add(1)).times(player.MS.points.add(1).pow(0.5))
       else  if(hasMilestone('MS',1.83e36)) player.devSpeed=player.IP.points.add(1).log(10).add(1).log(10).add(1).times(player.M.points.add(1)).times(player.F.points.add(1).log(10).add(1).log(10).add(1))
       else if(hasUpgrade('UF',101)) player.devSpeed=player.IP.points.add(1).log(10).add(1).log(10).add(1).times(player.M.points.add(1))
        else if(hasMilestone('MS',1.7e30)) player.devSpeed=player.IP.points.add(1).log(10).add(1).log(10).add(1)
        player.MS.xa=player.MS.xa.times(player.MS.xb.pow(0.05))
        if(hasUpgrade('MS',54))   player.MS.xb= player.MS.xb.plus(player.MS.xbgain.times(player.M.points.add(1).pow(1.25)).times(player.O.points.add(1).log(10).add(1)).times(player.N.points.add(1).log(10).add(1).log(10).add(1).log(10).add(1))) 
        if(hasUpgrade('MS',53))   player.MS.xb= player.MS.xb.plus(player.MS.xbgain.times(player.M.points.add(1).pow(1.25)).times(player.O.points.add(1).log(10).add(1))) 
        else if(hasUpgrade('MS',52))   player.MS.xb= player.MS.xb.plus(player.MS.xbgain.times(player.M.points.add(1).pow(1.25)))
        else if(hasUpgrade('MS',51)) player.MS.xb= player.MS.xb.plus(player.MS.xbgain)
        if(player.MS.xa<1) player.MS.xa= new Decimal(1)
        if(hasUpgrade('MS',101))  player.MS.size=  player.MS.size.div(buyableEffect('MS',11).times(buyableEffect('MS',21)).pow(player.MS.minuspoint.add(1).pow(0.5)).pow(0.05))
      else  player.MS.size=  player.MS.size.div(buyableEffect('MS',11).times(buyableEffect('MS',21)).pow(0.05))
        if(hasUpgrade('MS',82)&&!player.MS.size.gte(1))player.MS.minuspoint =player.MS.minuspoint.add(1)
        if(hasUpgrade('MS',82)&&!player.MS.size.gte(1))player.MS.size =new Decimal(1e10)
        if(hasUpgrade('MS',102))  player.MS.addpoint=player.MS.addpoint.add(buyableEffect('MS',12).times(new Decimal(1e21).div(player.MS.size).log(10).pow(0.5)).pow(buyableEffect('MS',22)).times(player.MS.minuspoint.add(1)))
    },
    upgrades: {
        11: {
            title: "^",
            description: "x +1 per second",
            cost: new Decimal("1"),
            currencyDisplayName: "Exponentiation points",
            currencyLayer:"MS",
            currencyInternalName:"Exponentiation",
            unlocked(){return hasMilestone('IP',17000) }

        },
        12: {
            title: "^2",
            description: "y +0.01 per second",
            cost: new Decimal("30"),
            currencyDisplayName: "Exponentiation points",
            currencyLayer:"MS",
            currencyInternalName:"Exponentiation"
        },
        13: {
            title: "^3",
            description: "IP boost X gain and X boost IP gain.",
            cost: new Decimal("1000"),
            currencyDisplayName: "Exponentiation points",
            currencyLayer:"MS",
            currencyInternalName:"Exponentiation"
        },
        14: {
            title: "^4",
            description: "X boost Y gain.",
            cost: new Decimal("1000000"),
            currencyDisplayName: "Exponentiation points",
            currencyLayer:"MS",
            currencyInternalName:"Exponentiation"
        },
        15: {
            title: "^5",
            description: "Y boost X gain",
            cost: new Decimal("1e10"),
            currencyDisplayName: "Exponentiation points",
            currencyLayer:"MS",
            currencyInternalName:"Exponentiation"
        },
        21: {
            title: "^6",
            description: "Exponentiation points boost X gain",
            cost: new Decimal("1e20"),
            currencyDisplayName: "Exponentiation points",
            currencyLayer:"MS",
            currencyInternalName:"Exponentiation",
     
        },
        22: {
            title: "^7",
            description: "Exponentiation points boost Y gain",
            cost: new Decimal("1e35"),
            currencyDisplayName: "Exponentiation points",
            currencyLayer:"MS",
            currencyInternalName:"Exponentiation",
     
        },
        23: {
            title: "^8",
            description: "X gain ^1.25",
            cost: new Decimal("1e50"),
            currencyDisplayName: "Exponentiation points",
            currencyLayer:"MS",
            currencyInternalName:"Exponentiation",
     
        },
        24: {
            title: "^9",
            description: "Y gain *2",
            cost: new Decimal("1e70"),
            currencyDisplayName: "Exponentiation points",
            currencyLayer:"MS",
            currencyInternalName:"Exponentiation",
     
        },
        25: {
            title: "^10",
            description: "Boost point gain base on exponentiation point and X gain x2.5, Y gain *1.5.",
            cost: new Decimal("1e90"),
            currencyDisplayName: "Exponentiation points",
            currencyLayer:"MS",
            currencyInternalName:"Exponentiation",
     
        },
        31: {
            title: "^^1",
            description: "point gain ^2 and remove the hardcap of IP gain but nerf IP gain.",
            cost: new Decimal("1e1600000"),
            currencyDisplayName: "points",
            currencyInternalName:"points",
            unlocked(){return player.MS.Prestige2.gte(2)}
     
        },
        32: {
            title: "^^2",
            description: "point gain ^3 and CP boost z gain.",
            cost: new Decimal("ee100"),
            currencyDisplayName: "Exponentiation points",
            currencyLayer:"MS",
            currencyInternalName:"Exponentiation",
            unlocked(){return hasMilestone('MS',700)}
     
        },
        33: {
            title: "^^3",
            description: "point gain ^3 and boost the sixth milestone.",
            cost: new Decimal("ee10000"),
            currencyDisplayName: "Exponentiation points",
            currencyLayer:"MS",
            currencyInternalName:"Exponentiation",
            unlocked(){return hasMilestone('MS',700)}
     
        },
        34: {
            title: "^^4",
            description: "Get more prestige point based on hyper prestige point.",
            cost: new Decimal("ee2e5"),
            currencyDisplayName: "Exponentiation points",
            currencyLayer:"MS",
            currencyInternalName:"Exponentiation",
            unlocked(){return hasMilestone('MS',700)}
     
        },
        35: {
            title: "^^5",
            description: "Get more z based on Infinity. Unlock a.",
            cost: new Decimal("ee5e5"),
            currencyDisplayName: "Exponentiation points",
            currencyLayer:"MS",
            currencyInternalName:"Exponentiation",
            unlocked(){return hasMilestone('MS',700)}
     
        },

        42: {
            title: "F6.1",
            description: "Remove Exponentiation but Number ^25. MS are cheaper. Unlock a UF upgrade. Buy this upgrade will reset your MS and IP.",
            cost(){ return new Decimal("eee10")
         
            },
            currencyDisplayName: "Exponentiation points",
            currencyLayer:"MS",
            currencyInternalName:"Exponentiation",
            unlocked(){return hasMilestone('MS',700)&&hasMilestone('MS',4000)},
            onPurchase(){
                player.IP.points = new Decimal(0)
                 player.MS.points = new Decimal(0)
                }
        },
        51: {
            title: "Start mult",
            description: "+0.01 mult per second.",
            cost(){ return new Decimal("0")
         
            },
            currencyDisplayName: "Multiple points",
            currencyLayer:"MS",
            currencyInternalName:"xa",
            unlocked(){return hasUpgrade('UF',102)},
        
        },
        52: {
            title: "mult M",
            description: "Mathematician boost mult gain.",
            cost(){ return new Decimal("100000")
         
            },
            currencyDisplayName: "Multiple points",
            currencyLayer:"MS",
            currencyInternalName:"xa",
            unlocked(){return hasUpgrade('UF',102)},
        
          
        },
        53: {
            title: "mult O",
            description: "Ordinal boost mult gain.",
            cost(){ return new Decimal("1e25")
         
            },
            currencyDisplayName: "Multiple points",
            currencyLayer:"MS",
            currencyInternalName:"xa",
            unlocked(){return hasUpgrade('UF',102)},
        
        },
        54: {
            title: "mult N",
            description: "Numbers boost mult gain",
            cost(){ return new Decimal("1e60")
         
            },
            currencyDisplayName: "Multiple points",
            currencyLayer:"MS",
            currencyInternalName:"xa",
            unlocked(){return hasUpgrade('UF',102)},
        
        },
        55: {
            title: "True boost",
            description: "Mult boost Number and point gain",
            cost(){ return new Decimal("1e125")
         
            },
            currencyDisplayName: "Multiple points",
            currencyLayer:"MS",
            currencyInternalName:"xa",
            unlocked(){return hasUpgrade('UF',102)},
        
        },
        81: {
            title: "add",
            description: "Divider cost /100",
            cost(){ return new Decimal("2500")},
            currencyDisplayName: "addition point",
            currencyLayer:"MS",
            currencyInternalName:"addpoint",
            unlocked(){return hasUpgrade('E',23)},
      onPurchase(){player.MS.divcost=new Decimal(100)},
        },
        82: {
            title: "again",
            description: "divide point will reset to 1e20 and give 1 Subtraction point if it smaller than 1.",
            cost(){ return new Decimal("10000")},
            currencyDisplayName: "addition point",
            currencyLayer:"MS",
            currencyInternalName:"addpoint",
            unlocked(){return !player.MS.size.gte(1)||hasUpgrade('MS',82)},

        },

        83: {
            title: "True^2 Math",
            description: "Remove E layer but Number ^10. Shape reset nothing.",
            cost(){ return new Decimal("1000000")},
            currencyDisplayName: "addition point",
            currencyLayer:"MS",
            currencyInternalName:"addpoint",
            unlocked(){return hasUpgrade('MS',103)},
            onPurchase(){
                player.points=new Decimal(0)
                player.E.points=new Decimal(0)
                player.O.points=new Decimal(0)
                player.M.points=new Decimal(0)
             
                player.N.points=new Decimal(0)
                player.F.points=new Decimal(0)
                player.I.points=new Decimal(0)
                player.S.points=new Decimal(5)
                player.UF.upgrades=[]
                player.E.upgrades=[22]
           }
          
        },
        101: {
            title: "boost",
            description: "Subtraction point boost Divider and click gain.",
            cost(){ return new Decimal("0")},
            currencyDisplayName: "Subtraction point",
            currencyLayer:"MS",
            currencyInternalName:"minuspoint",
            unlocked(){return player.MS.minuspoint.gte(1)},

        },
        102: {
            title: "Automation",
            description: "Auto click the clickable 20 times per second.",
            cost(){ return new Decimal("2")},
            currencyDisplayName: "Subtraction point",
            currencyLayer:"MS",
            currencyInternalName:"minuspoint",
            unlocked(){return hasUpgrade('MS',101)},

        },
        103: {
            title: "Alpha cheaper",
            description: "Divider is 10x cheaper.",
            cost(){ return new Decimal("4")},
            currencyDisplayName: "Subtraction point",
            currencyLayer:"MS",
            currencyInternalName:"minuspoint",
            unlocked(){return hasUpgrade('MS',102)},
            onPurchase(){player.MS.divcost=new Decimal(1000)}

        },

     
  
    },
    clickables:{
        
            11:{
                display() {return "Reset Your x and y for 1 Prestige point (Req: 1e150 Exponentiation points)."},
                canClick(){return player.MS.Exponentiation.gte("1e150")&&!player.MS.Prestige.gte("100")&&((!hasMilestone('MS',8))||(hasMilestone('IP',1000000)))},
                onClick(){
                    player.MS.Prestige=player.MS.Prestige.plus(1)
                    player.MS.x=new Decimal(1)

                    player.MS.y=new Decimal(1) 
                    player.MS.Exponentiation=new Decimal(1) 
                },
        
    },
    12:{
        display() {return "Reset Your x, y, prestige point and MS milestone for 1 Super Prestige point (Req: 1e4000 Exponentiation points and 25 prestige point.)."},
        canClick(){return player.MS.Exponentiation.gte("1e4000")&&player.MS.Prestige.gte("25")&&(!player.MS.Prestige2.gte("2")||(hasUpgrade('UF',22))&&(!player.MS.Prestige2.gte("40")))},
        onClick(){
         
            player.MS.Prestige2=player.MS.Prestige2.plus(1)
            player.MS.x=new Decimal(1)
            player.MS.milestones = []
            player.MS.y=new Decimal(1) 
            player.MS.Exponentiation=new Decimal(1) 
            if(player.MS.Prestige2.gte(5)) {player.MS.Prestige=new Decimal(100)}
            else if(player.MS.Prestige2.gte(2)) {player.MS.Prestige=new Decimal(25)}
            else {player.MS.Prestige=new Decimal(0)}
        
        },

},
13:{
    display() {return "Reset Your x, y, z prestige point and Super prestige point for 1 Hyper Prestige point (Req: ee10000 Exponentiation points and 1000 prestige point.)."},
    canClick(){return player.MS.Exponentiation.gte("ee10000")&&player.MS.Prestige.gte("1000")},
    onClick(){
     
        player.MS.Prestige=new Decimal(0)
        player.MS.Prestige2=new Decimal(0)
        player.MS.Prestige3= player.MS.Prestige3.add(1)
        player.MS.x=new Decimal(1)
        player.MS.y=new Decimal(1) 
        player.MS.z=new Decimal(1)     
     
      
      
        player.MS.Exponentiation=new Decimal(1) 
     
    
    },
    unlocked(){return hasMilestone('MS',800)}

},
21:{
    display() {
        if(hasUpgrade('MS',101))   return "Get " +format(buyableEffect('MS',12).times(new Decimal(1e21).div(player.MS.size).log(10).pow(0.5)).pow(buyableEffect('MS',22)).times(player.MS.minuspoint.add(1)))+ " addition points."
     else   return "Get " +format(buyableEffect('MS',12).times(new Decimal(1e21).div(player.MS.size).log(10).pow(0.5)).pow(buyableEffect('MS',22)))+ " addition points."},
    canClick(){return true},
    onClick(){
        if(hasUpgrade('MS',101))  player.MS.addpoint= player.MS.addpoint.add(buyableEffect('MS',12).times(new Decimal(1e21).div(player.MS.size).log(10).pow(0.5)).pow(buyableEffect('MS',22)).times(player.MS.minuspoint.add(1)))
      else  player.MS.addpoint= player.MS.addpoint.add(buyableEffect('MS',12).times(new Decimal(1e21).div(player.MS.size).log(10).pow(0.5)).pow(buyableEffect('MS',22)))
     
    
    },
    unlocked(){return hasUpgrade('E',23)}

},

},
buyables: {

    11: {
        title: "Alpha Divider",
        display() {

           return "Cost : " + format(new Decimal("50").pow(getBuyableAmount("MS", 11).add(1).pow(0.9)).div(player.MS.divcost)) + " addition points"
        },
        unlocked() { return hasUpgrade("E", 23)},
        canAfford() { 
            return player.MS.addpoint.gte(new Decimal("50").pow(getBuyableAmount("MS", 11).add(1).pow(0.9)).div(player.MS.divcost)) 
        },
        buy() { 
            {
               player.MS.addpoint = player.MS.addpoint.minus(new Decimal("50").pow(getBuyableAmount("MS", 11).add(1).pow(0.9)).div(player.MS.divcost))
            }
            setBuyableAmount("MS", 11, getBuyableAmount("MS", 11).add(1))
        },
        effect() { 
         
          eff = new Decimal("1.075").pow(getBuyableAmount("MS", 11))
         return eff     
        },
        style: {'height':'100px','width':'200px'},
    },
    12: {
        title: "click booster",
        display() {
           return"Click gain x"+format(buyableEffect('MS',12))+".<br>Cost : " + format(new Decimal("10").pow(getBuyableAmount("MS", 12).add(1).pow(1.25))) + " addition points"
        },
        unlocked() { return hasUpgrade("E", 23)},
        canAfford() { 
            return player.MS.addpoint.gte(new Decimal("10").pow(getBuyableAmount("MS", 12).add(1).pow(1.25))) 
        },
        buy() { 
            {
               player.MS.addpoint = player.MS.addpoint.minus(new Decimal("10").pow(getBuyableAmount("MS", 12).add(1).pow(1.25)))
            }
            setBuyableAmount("MS", 12, getBuyableAmount("MS", 12).add(1))
        },
        effect() { 
         
          eff = new Decimal("2").pow(getBuyableAmount("MS", 12))
         return eff    
        },
        style: {'height':'100px','width':'200px'},
    },
    21: {
        title: "Beta Divider",
        display() {
           return "Cost : " + format(new Decimal("80").pow(getBuyableAmount("MS", 21).add(1).pow(1.1)).div(player.MS.divcost)) + " addition points"
        },
        unlocked() { return hasUpgrade("E", 23)},
        canAfford() { 
            return player.MS.addpoint.gte(new Decimal("80").pow(getBuyableAmount("MS", 21).add(1).pow(1.1)).div(player.MS.divcost)) 
        },
        buy() { 
            {
               player.MS.addpoint = player.MS.addpoint.minus(new Decimal("80").pow(getBuyableAmount("MS", 21).add(1).pow(1.1)).div(player.MS.divcost))
            }
            setBuyableAmount("MS", 21, getBuyableAmount("MS", 21).add(1))
        },
        effect() { 
        
          eff = new Decimal("1.125").pow(getBuyableAmount("MS", 21))
         return eff     
        },
        style: {'height':'100px','width':'200px'},
    },
    22: {
        title: "click super booster",
        display() {
           return"Click gain ^"+format(buyableEffect('MS',22))+".<br>Cost : " + format(new Decimal("1000").pow(getBuyableAmount("MS", 22).add(1).pow(1.2))) + " addition points"
        },
        unlocked() { return hasUpgrade("E", 23)},
        canAfford() { 
            return player.MS.addpoint.gte(new Decimal("1000").pow(getBuyableAmount("MS", 22).add(1).pow(1.2))) 
        },
        buy() { 
            {
               player.MS.addpoint = player.MS.addpoint.minus(new Decimal("1000").pow(getBuyableAmount("MS", 22).add(1).pow(1.2)))
            }
            setBuyableAmount("MS", 22, getBuyableAmount("MS", 22).add(1))
        },
        effect() { 
         
          eff = new Decimal("1.25").pow(getBuyableAmount("MS", 22).add(0.1).pow(1.05))
         return eff    
        },
        style: {'height':'100px','width':'200px'},
    },
    },
    layerShown(){return hasUpgrade('F',46)||hasMilestone('MS',1)},
    canBuyMax(){
        return hasMilestone('E',1e285)
    },
    tabFormat: {
        "Milestones": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "milestones"
            ]
        },
        "Exponentiation": {
            unlocked(){
return (hasMilestone('IP',17000)||hasMilestone('MS',40))&&!hasUpgrade('MS',42)
            },
            content: [
                "main-display",
                "prestige-button",
                "blank",

            ["display-text",function(){
              let s=""
              s+="Your x is "+format(player.MS.x)+"<br>"
              s+="Your y is "+format(player.MS.y)+"<br>"
           if(hasMilestone('MS',700)) s+="Your z is "+format(player.MS.z)+"<br>"
           if(hasUpgrade('MS',35)) s+="Your a is "+format(player.MS.a)+"<br>"
           if(hasUpgrade('MS',35)) s+="(x^y^z)^^a = "+format(Decimal.tetrate(Decimal.pow(new Decimal(player.MS.x),(new Decimal(player.MS.y).pow(player.MS.z))),player.MS.a))+"<br>"
           else if(hasMilestone('MS',700))  s+="x^y^z = "+format(Decimal.pow(player.MS.x,new Decimal(player.MS.y.pow(player.MS.z))))+"<br>"
           else     s+="x^y = "+format(Decimal.pow(player.MS.x,player.MS.y))+"<br>"
              return s
            }],
        "blank",
            ["display-text",function(){
              let s="You have "+format(player.MS.Exponentiation)+" Exponentiation points."
              return s}],
              "blank",
              ["row",[ ["upgrade",11], ["upgrade",12], ["upgrade",13], ["upgrade",14], ["upgrade",15]]],
              ["row",[ ["upgrade",21], ["upgrade",22], ["upgrade",23], ["upgrade",24], ["upgrade",25]]],
              ["row",[ ["upgrade",31], ["upgrade",32], ["upgrade",33], ["upgrade",34], ["upgrade",35]]],
              ["row",[ ["upgrade",42]]],
            ],
        },
        "Prestige": {
            unlocked(){
                return (hasMilestone('IP',20000)||hasMilestone('MS',40))&&!hasUpgrade('MS',42)
                            },
            content: [
                "main-display",
                "prestige-button",
                "blank",
    
            ["display-text",function(){
              let s=""
              s+="Your x is "+format(player.MS.x)+"<br>"
              s+="Your y is "+format(player.MS.y)+"<br>"
              if(hasMilestone('MS',700)) s+="Your z is "+format(player.MS.z)+"<br>"
              if(hasUpgrade('MS',35)) s+="Your a is "+format(player.MS.a)+"<br>"
              if(hasUpgrade('MS',35)) s+="(x^y^z)^^a = "+format(Decimal.tetrate(Decimal.pow(new Decimal(player.MS.x),(new Decimal(player.MS.y).pow(player.MS.z))),player.MS.a))+"<br>"
              else if(hasMilestone('MS',700))  s+="x^y^z = "+format(Decimal.pow(player.MS.x,new Decimal(player.MS.y.pow(player.MS.z))))+"<br>"
             else  s+="x^y = "+format(Decimal.pow(player.MS.x,player.MS.y))+"<br>"
             
              return s
            }],
        "blank",
            ["display-text",function(){
              let s="You have "+format(player.MS.Exponentiation)+" Exponentiation points.<br>"
              s+="Your have  "+format(player.MS.Prestige)+" prestige point<br>"
              s+="Your have  "+format(player.MS.Prestige2)+" super prestige point<br>"
              if(hasMilestone('MS',800))s+="Your have  "+format(player.MS.Prestige3)+" hyper prestige point<br>"
              return s}],
              "blank",
             "clickables",
            ],
        },
        "addition": {
            unlocked(){
return (hasUpgrade('E',23))
            },
            content: [
                "main-display",
                "prestige-button",
                "blank",
                ["clickable",21],
                "blank",
                ["buyable",12],
                "blank",
                ["buyable",22],
                "blank",
            ["display-text",function(){
              let s=""
              s+="Your have "+format(player.MS.addpoint)+" Addition points.<br>"
              return s
            }],
            "blank",
            ["row",[ ["upgrade",81], ["upgrade",82], ["upgrade",83], ["upgrade",84], ["upgrade",85]]],
          
        ],

        
        },
        "Subtraction": {
            unlocked(){
return (hasUpgrade('E',23))
            },
            content: [
                "main-display",
                "prestige-button",
                
                "blank",
            ["display-text",function(){
              let s=""
              s+="Your have "+format(player.MS.minuspoint)+" Subtraction points.<br>"
              return s
            }],
            "blank",
            ["row",[ ["upgrade",101], ["upgrade",102], ["upgrade",103], ["upgrade",104], ["upgrade",105]]],
         
          
        ],

        
        },
      
      
        "multiple": {
            unlocked(){
return (hasUpgrade('UF',102))
            },
            content: [
                "main-display",
                "prestige-button",
                "blank",

            ["display-text",function(){
              let s=""
              s+="Your have "+format(player.MS.xa)+" Multiple points.<br>"

              s+="Multiple points x"+format(player.MS.xb)+" per second.<br>"
             
        
              return s
            }],

        "blank",
       
              "blank",
             ["row",[ ["upgrade",51], ["upgrade",52], ["upgrade",53], ["upgrade",54], ["upgrade",55]]],
            ],
        },
        "Divide": {
            unlocked(){
return (hasUpgrade('E',23))
            },
            content: [
                "main-display",
                "prestige-button",
                "blank",

        
     
            ["buyable",11], 
            "blank",
            ["buyable",21],
            "blank",
            ["display-text",function(){
                let s=""
                s+="Your have "+format(player.MS.size)+" Divide points.<br>"
  if(hasUpgrade('MS',101))  s+="Divide points /"+format(buyableEffect('MS',11).times(buyableEffect('MS',21)).pow(player.MS.minuspoint.add(1).pow(0.5)))+" per second.<br>"
              else  s+="Divide points /"+format(buyableEffect('MS',11).times(buyableEffect('MS',21)))+" per second.<br>"
                s+="Divide points boost click gain.<br>"
          
                return s
              }],
        ],

        
        },
    },
   
    doReset(resettingLayer) {
        let keep = [];
    
        if (resettingLayer=="S"&&hasMilestone('S',3)) keep.push("upgrades")
        if (resettingLayer=="S") keep.push("milestones")
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },

        
})