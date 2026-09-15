addLayer("N", {
    name(){return "Numbers"
}, // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "N", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        m1:false,
        m2:false,
        m3:false,
        m4:false,
        m5:false,
        m6:false,
        m7:false,
        m8:false,
        m9:false,
        mt:new Decimal(0),
ma:new Decimal(1)
    }},
    color: "#4BDC13",
    requires(){
        return new Decimal(5)
    }, 
    resource(){return "Numbers"}, // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1000.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (inChallenge('I', 11)||inChallenge('I', 12)||inChallenge('I', 31)||inChallenge('I', 32)) mult = mult.times(1e50)
        if (hasAchievement("A", 14)) mult = mult.times(2)
        if (inChallenge('F', 33)|inChallenge('F',43)) mult = mult.times(0.000001)
        if (inChallenge('F', 31)) mult = mult.times(0.000001)
        if (hasMilestone('F',1580)&&(!inChallenge("NN", 21)&&!hasChallenge("NN", 21))) mult = mult.times(buyableEffect('N',13))
        if (hasMilestone('F',8)) mult = mult.times(2)
        if ((hasUpgrade('F',15)&&(!inChallenge("NN", 21)&&!hasChallenge("NN", 21)))||(player.X.points.gte(1)&&hasChallenge('F',22))) mult = mult.times(buyableEffect('N',11))
        if (hasUpgrade('N',44)&&(!inChallenge("NN", 21)&&!hasChallenge("NN", 21))) mult = mult.times(buyableEffect('F',11))
        if (hasMilestone('NN',1e28)&&(!inChallenge("NN", 21)&&!hasChallenge("NN", 21))) mult = mult.times(buyableEffect('F',13))
        if (hasUpgrade('F',15)&& !inChallenge('F',42)) mult = mult.times(2)
        if (inChallenge('F', 23)) mult = mult.times(0.3)
        if (hasChallenge('F', 21)) mult = mult.times(1.5)
        if (hasChallenge('F', 11)) mult = mult.times(3)
        if (hasUpgrade('NN', 11)&&(!inChallenge('NN',32)&&!hasChallenge('NN',32))) mult = mult.times(1e4)
        if (hasUpgrade('UF', 1003)) mult = mult.times(player.NN.points.add(10).log(10).pow(60))
        if (hasChallenge('F', 22)) mult = mult.times(2)
        if (hasAchievement("A", 12)) mult = mult.times(3)
        if (hasAchievement("A", 45)) mult = mult.times(1e5)
        if (hasUpgrade('F',12)) mult = mult.times(upgradeEffect('F', 12))
        if(inChallenge('UF', 202))mult = mult.div(upgradeEffect('F', 12).pow(2))
        if (inChallenge('F', 11)) mult = mult.times(0.3)
        if (inChallenge('F', 13)) mult = mult.times(0.3)
        if (hasChallenge('F', 12)) mult = mult.times(3)
        if (hasAchievement("A", 33)) mult = mult.times(5)
       if (hasUpgrade('N',14)&&!inChallenge('UF',112)&&(!inChallenge("UF",221)||player.N.m4)) mult = mult.times(upgradeEffect('N', 14))
       if(inChallenge('UF',112))mult = mult.div(upgradeEffect('N', 14))
       if (hasUpgrade('UF',14)) mult = mult.times(upgradeEffect('UF', 14))
       if (hasUpgrade('UF',21)) mult = mult.times(upgradeEffect('UF', 21))
       if (hasUpgrade('F',11)) mult = mult.times(upgradeEffect('F', 11))
        if (hasMilestone('F', 1)) mult = mult.times(player.F.points.add(1))
        if (hasMilestone('MS', 1)) mult = mult.times(1e20)
        if (hasMilestone('F', 1100)) mult = mult.times(player.F.points.add(1))
        if (hasMilestone('F', 1100)&&player.X.points.gte(1)) mult = mult.times(player.F.points.pow(1.5).add(1))
        if (hasMilestone('UF', 52)||hasUpgrade('N',31)) mult = mult.times(player.UF.points.pow(3).add(1))
        if (hasUpgrade('N',31)&&player.N.m6) mult = mult.times(player.UF.points.pow(100).add(1))
        if (hasMilestone('UF', 35)) mult = mult.times(player.UF.points.pow(5).add(1))
        if (hasMilestone('UF', 128)) mult = mult.times(player.UF.points.pow(3).add(1))
        if(hasUpgrade('E',22)&&!hasUpgrade('MS',83))mult = mult.tetrate(1.02)
   else if(hasUpgrade('E',21))mult = mult.tetrate(1.01)
   mult = mult.tetrate(new Decimal(1).minus(player.X.points.times(0.05)))
   if(inChallenge('UF',121)) mult = mult.div( player.N.points.tetrate(0.15).add(1))
   if(player.N.m5) mult=mult.times(player.N.points.add(10).log(10).pow(70).max(1e150))
 else  if((player.N.points.gte(1e857)||(hasChallenge('UF',122)))) mult = mult.times(1e150)
  else if(hasChallenge('UF',121))  mult = mult.times( player.N.points.tetrate(0.175).add(1))
else if(hasUpgrade('N',24)&&player.X.points.gte(1)&&!inChallenge('UF',121))mult = mult.times( player.N.points.tetrate(0.15).add(1))
  else if(hasUpgrade('N',15)&&player.X.points.gte(1))  mult = mult.times( player.N.points.tetrate(0.1).add(1))
  if(hasUpgrade('F',14)&&player.X.points.gte(1)) mult = mult.times(2.5)
  if(hasUpgrade('UF',1004)) mult = mult.times(player.UF.UP.add(1).pow(24).min(1e120))
    if(hasUpgrade('F',102))mult = mult.times(player.F.FP.add(1))
    if(inChallenge("UF",211))mult = new Decimal(1)
    if(inChallenge("F",24)||inChallenge("UF",301))mult = new Decimal(1).div(mult.pow(0.5))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let mult=new Decimal(1) 
      if(inChallenge('F',43)&&player.X.points.gte(1)) mult = mult.times(0.3)
        if (hasMilestone('UF',11)&&(!inChallenge("NN", 21)&&!hasChallenge("NN", 21))) mult = mult.times(buyableEffect('N',21))
        if (hasUpgrade('NN',32)&&(!inChallenge('NN',32)&&!hasChallenge('NN',32))&&player.X.points.gte(1)) mult = mult.times(1.3)
        else if (hasUpgrade('NN',32)&&(!inChallenge('NN',32)&&!hasChallenge('NN',32))) mult = mult.times(1.25)

        if (hasUpgrade('UF',24)) mult = mult.times(upgradeEffect('UF',24))
        if(hasMilestone('E',1e287)) mult = mult.times(upgradeEffect('UF',25))
        if (hasMilestone('I',1)) mult = mult.times(1.05)
        if (hasMilestone('Z',1)) mult = mult.times(1.05)
        if (hasMilestone('I',2)) mult = mult.times(1.05)
        if (inChallenge('IP',11)) mult = mult.times(0.9)
        if (inChallenge('IP',21)) mult = mult.times(0.5)
        if (inChallenge('I',51)) mult = mult.times(0.9)
        if (inChallenge('I',52)) mult = mult.times(0.75)
        if (inChallenge('I',61)) mult = mult.times(0.6)
        if (inChallenge('I',62)) mult = mult.times(0.1)
        if (inChallenge('UF',122)) mult = mult.times(0.1)
        if (inChallenge('UF',222)) mult = mult.times(0.01)
        if (inChallenge('NN',11)) mult = mult.times(0.234)
        if (inChallenge('NN',12)) mult = mult.times(0.123)
        if (inChallenge('NN',21)) mult = mult.times(0.012)
        if (inChallenge('NN',22)) mult = mult.times(0.023)
        if (inChallenge('NN',31)) mult = mult.times(0.034)
        if (inChallenge('NN',32)) mult = mult.times(0.0011)
        if (inChallenge('IP',31)) mult = mult.times(0.15)
        if (inChallenge('I',11)) mult = mult.times(0.3)
        if (inChallenge('I',31)) mult = mult.times(0.09)
        if (inChallenge('I',41)) mult = mult.times(0.011)
        if (inChallenge('I',42)) mult = mult.times(0.001)
        if (inChallenge('I',22)) mult = mult.times(0.00003333333333)
        if (inChallenge('I',32)) mult = mult.times(5.26315789e-7)
        if (inChallenge('I',21)) mult = mult.times(0.166666)
        if (inChallenge('O',11)) mult = mult.times(player.O.Goal)
        if (hasChallenge('I',11)) mult = mult.times(1.1)
        if (hasUpgrade('F',45)) mult = mult.times(1.1)
        if (hasChallenge('I',12)) mult = mult.times(1.2)
        if (hasChallenge('I',21)) mult = mult.times(1.3)
        if (hasChallenge('I',31)) mult = mult.times(1.4)
        if (hasChallenge('I',41)) mult = mult.times(1.5)
        if (hasChallenge('I',51)) mult = mult.times(1.1)
        if (hasChallenge('I',52)) mult = mult.times(1.1)
        if (hasChallenge('I',61)) mult = mult.times(1.1)
        if (hasChallenge('I',22)) mult = mult.times(1.6)
        if (hasChallenge('I',32)) mult = mult.times(1.7)
        if (hasChallenge('IP',31)) mult = mult.times(1.3)
        if (hasChallenge('IP',32)) mult = mult.times(1.35)
        if (hasUpgrade('F',31)&&!hasUpgrade('IP',56)) mult = mult.times(player.F.points.add(1).log(10).add(1).log(10).add(1).log(10).add(1))
        if (hasUpgrade('F',43)&&!hasUpgrade('IP',56)) mult = mult.times(player.F.points.add(1).log(10).add(1).log(10).add(1).log(10).add(1).log(10).add(1))
        if (hasUpgrade('IP',46)&&(!hasMilestone('IP',6000000))||hasMilestone('E',1e31)) mult = mult.times(player.I.points.add(1).log(10).add(1).log(10).add(1).log(10).add(1))
        if(hasMilestone('E',1e31))  mult = mult.times(player.I.points.add(1).log(10).add(1).log(10).add(1).log(10).add(1))
        if (hasUpgrade('IP',56)) mult = mult.times(1.75)
        if (hasUpgrade('E',11)) mult = mult.times(2)
        if (hasChallenge('NN',11)) mult = mult.times(2)
        if (hasChallenge('NN',12)) mult = mult.times(2)
        if (hasUpgrade('UF',75)) mult = mult.times(1.5)
        if (hasChallenge('NN',21)) mult = mult.times(8)
        if (hasChallenge('NN',31)) mult = mult.times(1.5)
        if (hasChallenge('NN',32)) mult = mult.times(3)
        if (hasChallenge('NN',22)) mult = mult.times(player.FS.points.add(1).pow(0.5))
        if  (hasMilestone('IP',6000000)) mult = mult.times(3)
        if  (hasMilestone('E',1)) mult = mult.times(1.2)
        if  (hasMilestone('E',1e70)) mult = mult.times(1.05)
        if  (hasMilestone('E',12)) mult = mult.times(player.E.points.add(1).log(10).add(1).log(10).add(1))
        if  (hasMilestone('E',300)) mult = mult.times(player.E.points.add(1).log(10).add(1).log(10).add(1))
        if  (hasMilestone('E',1e71)) mult = mult.times(player.E.points.add(1).log(10).add(1).log(10).add(1))
        if(inChallenge('E',11)) mult = mult.times(player.E.Npower)
        if  (hasMilestone('E',500000)&&(inChallenge('E',11))) mult = mult.times(1.2)
        if  (hasMilestone('E',5e25)&&(!inChallenge('E',11))) mult = mult.times(1.5)
        if  (hasMilestone('MS',500)) mult = mult.times(25)
        if  (hasUpgrade('MS',42)) mult = mult.times(25)
        if  (hasMilestone('E',1000000)) mult = mult.times(player.F.points.add(1).log(10).add(1).log(10).add(1).log(10).add(1).log(10).add(1))
       if(hasMilestone('UF',585555)) mult = mult.times(player.UF.mp.add(1).log(10).add(1).log(10).add(1.1))
        if(hasMilestone('UF',522000)) mult = mult.times(player.UF.mp.add(1).log(10).add(1).log(10).add(1).log(10).add(1.1))
        mult = mult.times(tmp.O.effect)
        if(hasUpgrade('UF',93)) mult = mult.times(player.E.CP.add(1).log(10).add(1))

        if (inChallenge('M',11)) mult = mult.times(0.00002) 
        if(hasMilestone('O',100))mult = mult.times(2)
        mult = mult.times(player.O.reward) 
        if(hasUpgrade('MS',55)) mult = mult.times(player.MS.xb.add(1).log(10).add(1).pow(0.5).add(1))
        if(hasUpgrade('UF',43))mult = mult.times(player.IP.points.add(1).log(10).add(1).log(10).add(1).times(player.M.points.add(1)).times(player.F.points.add(1).log(10).add(1).log(10).add(1)).times(player.MS.points.add(1).pow(0.5)).times(buyableEffect('E',11)))
      else  if(hasUpgrade('UF',41)) mult = mult.times(player.IP.points.add(1).log(10).add(1).log(10).add(1).times(player.M.points.add(1)).times(player.F.points.add(1).log(10).add(1).log(10).add(1)).times(player.MS.points.add(1).pow(0.5)).add(10).log(10))
      if(inChallenge('E',21)) mult = mult.times(new Decimal(1).div(player.N.points.add(1).pow(0.5)))
      if(inChallenge('E',22)) mult = mult.times(1e-50)
      if(hasUpgrade('MS',83))mult = mult.times(10)
      if(hasUpgrade('F',104))mult = mult.times(1.0777)
      mult = mult.times(new Decimal(1).minus(player.X.points.times(0.05)))
      if(hasMilestone('FS',5))mult = mult.times(1.14)
      if(inChallenge("UF",302))mult = mult.times(new Decimal(0.0001))
      if(inChallenge("I",72))mult=mult.times(new Decimal(0.8).pow(new Decimal(1).add(challengeCompletions("I",72))))
      mult=mult.times(player.FS.pfp.add(10).log(10).add(9).log(10))
      if(inChallenge("UF",211))mult = new Decimal(1)
      if(inChallenge("UF",212)||inChallenge("UF",301))mult = new Decimal(1).div(mult)

        return mult

    },
    autoUpgrade(){
        if  (hasMilestone('MS',1)) return true
        else return false
    },


    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "n", description: "N: Reset for Numbers", onPress(){if (canReset(this.layer)) doReset(this.layer)},
        onPress() { if (player.N.unlocked) doReset("N") },
    },
    ],
    

    doReset(resettingLayer) {
        let extraUpgrades = [];
        if (hasMilestone("I",3)&&!player.X.points.gte(1)) extraUpgrades.push(24,25,31,32,33,34,35,41);
        if (hasMilestone("NN",3)&&!player.X.points.gte(1)) extraUpgrades.push(16,26,36,46,12,13,14,44);
        if (hasUpgrade("N",51)&&!player.X.points.gte(1)) extraUpgrades.push(11,42,43,45,51);
        if (hasUpgrade("N",61)&&!player.X.points.gte(1)) extraUpgrades.push(61);
        if (hasUpgrade("N",62)&&!player.X.points.gte(1)) extraUpgrades.push(62);
        let keep = [];
        if (hasChallenge("F", 21)||hasUpgrade("N", 24)||hasMilestone('I',1)&& resettingLayer=="F") keep.push("upgrades")
        if (hasMilestone("UF", 1) && resettingLayer=="UF")  keep.push("upgrades")
        if (hasMilestone("IP", 1) && resettingLayer=="IP")  keep.push("upgrades")
        keep.push("m1")
        keep.push("m2")
        keep.push("m3")
        keep.push("m4")
        keep.push("m5")
        keep.push("m6")
        keep.push("m7")
        keep.push("m8")
        keep.push("m9")
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        for(i in extraUpgrades) {
            if (!player[this.layer].upgrades.includes(extraUpgrades[i])) {
              player[this.layer].upgrades.push(extraUpgrades[i])
            }
          }
    },
    upgrades: {
        11: {
            title: "1",
            description(){ 
                if(player.X.points.gte(1)&&player.N.m1) return "Raise point gain to 1.2."
                if(hasChallenge('UF',101)) return "Raise point gain to 1.14."
                if(hasUpgrade('UF',11)&&challengeCompletions('UF',21)>=1)  return "Raise point gain to 40."
                if(hasUpgrade('UF',11))  return "Raise point gain to 4."
                else return "Quadruple point gain."},
                cost(){
                    if(player.X.points.gte(1)) return new Decimal(1e6)
                else    return new Decimal(2)},
        },
        12: {
            title: "2",
            description:"Gain more points based on numbers.",
            cost(){
                if(player.X.points.gte(1)) return new Decimal(2e6)
            else    return new Decimal(5)},
            effect() {
                if(player.X.points.gte(1)&&player.N.m2&&hasUpgrade("UF",1001)) return player.N.points.add(10).log(10).pow(50).max(1e160)
                if(player.X.points.gte(1)&&player.N.m2) return 1e150
                if(player.X.points.gte(1)&&hasUpgrade("NN",15))  return 1e80
                if(hasChallenge('UF',122)) return new Decimal("1e75")
                if(hasChallenge('UF',102)) return player.N.points.tetrate(0.4).pow(0.5).add(1).min(1e65)
                if (inChallenge("F",32)||inChallenge("F",13)||inChallenge("F",12)) return 1
                if(player.X.points.gte(1)&&hasUpgrade("F",23))  return player.N.points.tetrate(0.4).pow(0.5).add(1).min(1e40)
                if(player.X.points.gte(1)&&hasUpgrade("N",21))  return player.N.points.tetrate(0.7).pow(0.5).add(1).min(1e12)
                if(player.X.points.gte(1)) return player.N.points.tetrate(0.5).pow(0.5).add(1)
                if(inChallenge('NN',11)||hasChallenge('NN',11))return new Decimal("1")
                if(hasUpgrade("NN",15)) return 1e70
                if (inChallenge("F",21)) return 1000
                if (inChallenge("F",12)||inChallenge("F",13)||inChallenge("F",23)||inChallenge("F",32)||inChallenge("F",33)) return 1
                if (inChallenge("F",41)|inChallenge('F',43)) return 10
                if(hasUpgrade("F",23)&&!inChallenge('F',42)&&!inChallenge('F',43)) return player.N.points.pow(0.625).add(1).min(1e35)
                if(hasUpgrade("N",24)) return player.N.points.pow(0.625).add(1).min(1e15)
                if(hasUpgrade("N",22)) return player.N.points.pow(0.65).add(1).min(5e6)
                if(hasUpgrade("N",21)) return player.N.points.pow(0.75).add(1).min(1e5)
                if(hasUpgrade("N",15)) return 1000
                else return player.N.points.pow(0.5).add(1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked(){
                return hasUpgrade("N", 11)|hasMilestone("I", 1)&&!inChallenge('NN',11)&&!hasChallenge('NN',11)
            },
        },
        13: {
            title: "3",
            description: "Points boost itself.",
            cost(){
                if(player.X.points.gte(1)) return new Decimal(8e6)
            else    return new Decimal(20)},
          
            effect() {
                if(player.X.points.gte(1)&&player.N.m3&&hasUpgrade("UF",1001)) return player.points.add(10).log(10).pow(70).max(1e185)
                if(player.X.points.gte(1)&&player.N.m3) return 1e175
                if(player.X.points.gte(1)&&hasUpgrade("NN",15))  return 1e105
                if(hasChallenge('UF',122))return new Decimal("1e100")
                if(hasChallenge('UF',111))  return player.points.tetrate(0.55).add(1).min(1e100)
                if (inChallenge("F",32)) return 1
                if(player.X.points.gte(1)&&hasUpgrade("N",25))  return player.points.tetrate(0.55).add(1).min(1e50)
                if(player.X.points.gte(1)&&hasUpgrade("N",22))  return player.points.tetrate(0.7).pow(0.5).add(1)
                if(player.X.points.gte(1)) return player.points.tetrate(0.5).pow(0.5).add(1)
                if(inChallenge('NN',11)||hasChallenge('NN',11))return new Decimal("1")
                if(hasUpgrade("NN",15)) return 1e70
                if (inChallenge("F",33)||inChallenge("F",32)) return 1
                if (inChallenge("F",21)||inChallenge("F",23)) return 30
                if (inChallenge("F",41)|inChallenge('F',43)) return 10
        if(hasUpgrade("N",35)) return player.points.pow(0.314).add(1).min(1e35)
        if(hasUpgrade("F",14) && !inChallenge('F',42)) return player.points.pow(0.314).add(1).min(1e10)
        if(hasUpgrade("N",23)) return player.points.pow(0.3).add(1).min(5e4)
        else return player.points.pow(0.25).add(1).min(30)

            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked(){
                return hasUpgrade("N", 12)|hasMilestone("I", 1)&&!inChallenge('NN',11)&&!hasChallenge('NN',11)
            },
        },
        14: {
            title: "4",
            description: "Gain more numbers based on points.",
            cost(){
                if(player.X.points.gte(1)) return new Decimal(5e7)
            else    return new Decimal(60)},
            effect() {
                if(player.X.points.gte(1)&&player.N.m4&&hasUpgrade("UF",1001)) return player.points.add(10).log(10).pow(62.5).max(1e120)
                if(player.X.points.gte(1)&&player.N.m4) return 1e110
                if(player.X.points.gte(1)&&hasUpgrade("NN",15))  return 1e80
                if(hasChallenge('UF',122))return new Decimal("1e75")
                if (player.N.points.gte("1e130")&&player.X.points.gte(1)&&hasChallenge('UF',112))return new Decimal("1e65")
                if(hasChallenge('UF',112))  return player.points.tetrate(0.5).add(1)
                if (inChallenge("F",32)) return 1
                if(player.X.points.gte(1)&&hasUpgrade("N",23))  return player.points.tetrate(0.4).add(1).min(1e50)
                if(player.X.points.gte(1)) return player.points.tetrate(0.25).add(1)
                if(inChallenge('NN',11)||hasChallenge('NN',11))return new Decimal("1")
                if(hasUpgrade("NN",15)) return 1e50
                if (inChallenge("F",32)||inChallenge("F",33)) return 1
                if (inChallenge("F",23)||inChallenge("F",21)) return 20
                if (inChallenge("F",41)|inChallenge('F',43)) return 10
                if(hasUpgrade("N",34)) return player.points.pow(0.3).add(1).min(1e25)
                if(hasUpgrade("N",25)) return player.points.pow(0.3).add(1).min(1e8)
                if(hasUpgrade("N",21)) return player.points.pow(0.3).add(1).min(400)
                else return player.points.add(1).pow(0.2).min(20)
              

            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked(){
                return hasUpgrade("N", 13)|hasMilestone("I", 1)&&!inChallenge('NN',11)&&!hasChallenge('NN',11)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        15: {
            title: "5",
            description(){
                if(player.N.m5)  return "Numbers boost itself.<br> Currently: " +format(player.N.points.add(10).log(10).pow(70).max(1e150))+"x"
                if(player.N.points.gte("1e857")||(hasChallenge('UF',122)))   return "Numbers boost itself.<br> Currently: 1.00e150x"
                if(hasChallenge('UF',121))  return "Numbers boost itself.<br> Currently: "+format(player.N.points.tetrate(0.175).add(1))+"x"
                if(hasUpgrade('N',24))    return "Numbers boost itself.<br> Currently: "+format(player.N.points.tetrate(0.15).add(1))+"x"
                if(player.X.points.gte(1))   return "Numbers boost itself.<br> Currently: "+format(player.N.points.tetrate(0.1).add(1))+"x"
              else  return "Boost '2', '3' and '4'."},
              cost(){
                if(player.X.points.gte(1)) return new Decimal(5e8)
            else    return new Decimal(314)},
    
            unlocked(){
                return hasUpgrade("N", 14)||hasMilestone("I", 1)&&!hasUpgrade("N", 51)
            },
            
        },
        21: {
            title: "6",
            description(){
                if(player.X.points.gte(1))   return "Boost '2'."
              else  return "Remove the first hardcap of '2' and '4'."},
     
            cost(){
                if(player.X.points.gte(1)) return new Decimal(5e10)
            else    return new Decimal(111111)},
    
            unlocked(){
                return (hasMilestone('F', 1) && hasUpgrade("N", 15))|hasMilestone("I", 1)&&!hasUpgrade("N", 51)
            },
            
        },
        22: {
            title: "7",
            description(){
                if(player.X.points.gte(1))   return "Boost '3'."
              else  return "Remove the second hardcap of '2' but nerf it."},
        
            cost(){
                if(player.X.points.gte(1)) return new Decimal(2e14)
            else    return new Decimal(420420420)},
    
    
            unlocked(){
                return ((hasMilestone('F', 4) && hasUpgrade("N", 21))||hasMilestone("I", 1)&&!hasUpgrade("N", 51))||(hasChallenge('F',11)&&player.X.points.gte(1))
            },
            
        },
        23: {
            title: "8",
            description(){
                if(player.X.points.gte(1))   return "Boost '4'."
              else  return "Remove the first hardcap of '3'."},
       
            cost: new Decimal(1e15),
    
            unlocked(){
                return ((hasChallenge('F', 13) && hasUpgrade("N", 22))|hasMilestone("I", 1)&&!hasUpgrade("N", 51))||(hasMilestone('F',3)&&player.X.points.gte(1))
            },
            
        },
        24: {
            title: "9",
            description(){
                if(player.X.points.gte(1))   return "Boost '5' and keep all number upgrade on reset. You can buy this upgrade while you are in Factor Challenge 1."
              else  return "Remove the third hardcap of '2'. You can buy this upgrade while you are in Factor Challenge 4."},
         
            cost(){ 
                if(player.F.activeChallenge!=11&&player.X.points.gte(1))return new Decimal(Infinity);
                if(player.F.activeChallenge!=21&&!player.X.points.gte(1))return new Decimal(Infinity);
                return new Decimal(1e12);
            },
            unlocked(){
                return ((hasUpgrade('F', 13) && hasUpgrade("N", 23))|hasMilestone("I", 1)&&!hasUpgrade("N", 51))||(hasMilestone('F',3)&&player.X.points.gte(1))
            
            },
            
        },
        25: {
            title: "10",
            description(){
                if(player.X.points.gte(1))   return "Boost '3'. You can buy this upgrade while you are in Factor Challenge 4."
              else  return "Remove the second hardcap of '4'.You can buy this upgrade while you are in Factor Challenge 5."},
 
            cost(){ 
              
                if(player.F.activeChallenge!=22)return new Decimal(Infinity);
                if(!player.X.points.gte(1)) return new Decimal(3.14e13);
                else return new Decimal(1e37);
            },
            unlocked(){
                return (hasUpgrade('F', 13) && hasUpgrade("N", 24))|hasMilestone("I", 1)&&!hasUpgrade("N", 51)&&(!player.X.points.gte(1)||hasChallenge('F',13))
            },
            
        },
        31: {
            title: "11",
            description(){
                if(player.X.points.gte(1))   return "Upgrade factor boost number gain."
              else  return "'+' base x2. You can buy this upgrade while you are in Factor Challenge 6."},
      
            cost(){ 
                if(player.F.activeChallenge!=23&&!player.X.points.gte(1))return new Decimal(Infinity);
                if(!player.X.points.gte(1))  return new Decimal(3.14e10);
                 return new Decimal(1e300);
             
            },
            unlocked(){
               return ((hasMilestone("I", 1)&&!hasUpgrade("N", 51)||player.UF.best.gte(2)&&!hasUpgrade("N", 51))&&!player.X.points.gte(1))||hasMilestone('UF',14)
            },
            
        },
        32: {
            title: "12",
            description(){
                if(player.X.points.gte(1))   return "Boost factor beta."
              else  return "'+' base x2. You can buy this upgrade while you are in Factor Challenge 3."},
           
            cost(){ 
                if(player.F.activeChallenge!=13&&!player.X.points.gte(1))return new Decimal(Infinity);
                if(!player.X.points.gte(1))  return new Decimal(3.14e16);
                return new Decimal(1e220);
            },
            unlocked(){
                {return hasMilestone('F',90)|hasMilestone("I", 1)&&!hasUpgrade("N", 51)}
            },
            
        },
        33: {
            title: "13",
            description(){
                if(player.X.points.gte(1))   return "Unlock a challenge."
              else  return "'+' work in 'Buyable Upgrader' but nerf it in 'Buyable Upgrader'"},
            
           
            cost(){
                if(player.X.points.gte(1)) return new Decimal(1e120)
            else    return new Decimal(3.14e98)},
            unlocked(){
                {return player.UF.best.gte(4)|hasMilestone("I", 1)&&!hasUpgrade("N", 51)}
            },
            
        },
        34: {
            title: "14",
            description(){
                if(player.X.points.gte(1))   return "You can explore upgrade factor challenge."
              else  return "Remove the third hardcap of '4'. You can buy this upgrade while you are in Factor Challenge 9."},
      
            cost(){ 
                if(player.F.activeChallenge!=33&&!player.X.points.gte(1))return new Decimal(Infinity);
                if(!player.X.points.gte(1))  return new Decimal(1e32);
                return new Decimal("1e450");
            },
            unlocked(){
                {return hasMilestone('UF',8)||hasMilestone('F',240)&&!hasUpgrade("N", 51)}
            },
            
        },
        35: {
            title: "15",
            description(){
                if(player.X.points.gte(1))   return "Boost Factor Point gain formula."  
              else  return "Remove the third hardcap of '3'. You can buy this upgrade while you are in Factor Challenge 11."},
            cost(){ 
                if(player.F.activeChallenge!=42&&!player.X.points.gte(1))return new Decimal(Infinity);
                if(!player.X.points.gte(1))  return new Decimal(1e60);
                return new Decimal("1e1930");
            },
            unlocked(){
                {return hasMilestone('F',1333)&&!hasUpgrade("N", 51)}
            },
            
        },
        41: {
            title: "16",
            description: "'x' is better. You can buy this upgrade while you are in Upgrade Factor Challenge 2.",
            cost(){ 
                if(player.UF.activeChallenge!=12)return new Decimal(Infinity);
                return new Decimal(1e262);
            },
            unlocked(){
                {return (hasMilestone('UF',16)&&!hasUpgrade("N", 51))&&!player.X.points.gte(1)}
            },
        },
        42: {
                title: "17",
                description: "Factors are cheaper.",
                cost: new Decimal("3.14e348"),
                unlocked(){
                    {return hasMilestone('UF',16)&&!hasChallenge('NN',22)&&!inChallenge('NN',22)&&!player.X.points.gte(1)}
                },
        },
        43: {
            title: "18",
            description: "Upgrade factors are cheaper.",
            cost: new Decimal("3.14e378"),
            unlocked(){
                {return hasMilestone('UF',16)&&!hasChallenge('NN',22)&&!inChallenge('NN',22)&&!player.X.points.gte(1)}
            },
    },
        44: {
        title: "19",
        description: " Unlock the first factor buyable",
        cost: new Decimal("1e413"),
        unlocked(){
            {return hasMilestone('UF',16)&&!hasChallenge('NN',21)&&!inChallenge('NN',21)&&!player.X.points.gte(1)}
        },
    },
    45: {
        title: "20",
        description: "Unlock another buyable and a new numbers upgrade",
        cost: new Decimal("1e477"),
        unlocked(){
            {return hasMilestone('UF',16)&&!hasChallenge('NN',21)&&!inChallenge('NN',21)&&!player.X.points.gte(1)}
        },
    },
    16: {
        title: "Master +",
        description: "The '+' effect is always 1e120",
        cost: new Decimal("1e487"),
        unlocked(){
            {return ((hasUpgrade('N',45)||hasMilestone("I", 2))&&!hasUpgrade("F", 16))&&!player.X.points.gte(1)}
        },
    },
    26: {
        title: "Master -",
        description: "The '-' effect is always 1e50",
        cost: new Decimal("1e785"),
        unlocked(){
            {return (hasMilestone('I',2)&&!hasUpgrade("F", 36))&&!player.X.points.gte(1)}
        },
    },
    36: {
        title: "Master x",
        description: "The 'x' effect is always 1e100",
        cost: new Decimal("3.14e845"),
        unlocked(){
            {return (hasMilestone('UF',128)&&!hasUpgrade("F", 36))&&!player.X.points.gte(1)}
        },
    },
    46: {
        title: "Master /",
        description: "The '/' effect is always 2.1 ",
        cost: new Decimal("1e895"),
        unlocked(){
            {return (hasMilestone('UF',128)&&!hasUpgrade("F", 36))&&!player.X.points.gte(1)}
        },
    },
    51: {
        title: "0",
        description: "Remove some useless upgrade and unlock some Negative Number upgrades. Keep all upgrade on ALL reset.",
        cost: new Decimal("1.8e308"),
        unlocked(){
            {return hasChallenge('UF',12)}
        },
        style: {width: "700px"},
    },
    61: {
        title: "π",
        description: "Factor exponent is: 0.314 (Factors are cheaper)",
        cost: new Decimal("1e4720"),
        unlocked(){
            {return hasUpgrade('F',35)&&!hasChallenge('NN',22)&&!inChallenge('NN',22)}
        },
    },
    62: {
        title: "e",
        description: "Factor exponent is: 0.271(Factors are cheaper)",
        cost: new Decimal("1e17500"),
        unlocked(){
            {return hasUpgrade('NN',34)&&!hasChallenge('NN',22)&&!inChallenge('NN',22)}
        },
    },
    72: {
        title: "1.798F308",
        description: "unlock ???.",
        cost: new Decimal("ee100"),
       
        unlocked(){
            {return hasUpgrade('MS',83)}
        },
    },
   

       },
       buyables: {
        rows: 2,
        cols: 3,
        11: {
            title: "+",
            display() {
                if(hasUpgrade('N',16)) return "Boosts Numbers gain by " + format(tmp.N.buyables[11].effect) + "x<br>Cost : " + " Infinity Numbers"
              else return "Boosts Numbers gain by " + format(tmp.N.buyables[11].effect) + "x<br>Cost : " + format(new Decimal("1e4").pow(getBuyableAmount("N", 11).add(1))) + " Numbers"
            },
            unlocked() { return hasUpgrade("F", 15)||(player.X.points.gte(1)&&hasChallenge('F',22)) },
            canAfford() { 
                if(hasUpgrade('N',16)) return player.N.points.gte(new Decimal(1e1000))
                else return player.N.points.gte(new Decimal("1e4").pow(getBuyableAmount("N", 11).add(1))) 
            },
            buy() { 
                {
                   player.N.points = player.N.points.minus(new Decimal("1e4").pow(getBuyableAmount("N", 11).add(1)))
                }
                setBuyableAmount("N", 11, getBuyableAmount("N", 11).add(1))
            },
            effect() { 

                if (inChallenge('I',12)) eff = new Decimal("1")
                if (hasUpgrade('N',31)) eff = new Decimal("6").pow(getBuyableAmount("N", 11))
                else   eff = new Decimal("3").pow(getBuyableAmount("N", 11))
                if (hasUpgrade('N',32)) eff = new Decimal("12").pow(getBuyableAmount("N", 11))
                if (player.X.points.gte(1))  eff = new Decimal("3.2").pow(getBuyableAmount("N", 11))
                if ( player.UF.challenges[11]>=1) eff = new Decimal("24").pow(getBuyableAmount("N", 11))
                if ( player.UF.challenges[11]>=2) eff = new Decimal("36").pow(getBuyableAmount("N", 11))
                if ( player.UF.challenges[11]>=3) eff = new Decimal("50").pow(getBuyableAmount("N", 11))
                if ( player.UF.challenges[11]>=1&&player.X.points.gte(1)) eff = new Decimal("10").pow(getBuyableAmount("N", 11))
                if ( player.UF.challenges[11]>=2&&player.X.points.gte(1)) eff = new Decimal("15").pow(getBuyableAmount("N", 11))
                if ( player.UF.challenges[11]>=3&&player.X.points.gte(1)) eff = new Decimal("25").pow(getBuyableAmount("N", 11))
                if (hasMilestone('I',2)&&player.X.points.gte(1)) eff = new Decimal("200").pow(getBuyableAmount("N", 11))
                if(hasMilestone('NN',3)&&player.X.points.gte(1)) eff = new Decimal("1e50")
                if(hasMilestone('F',6000)&&player.X.points.gte(1)) eff = new Decimal("1e65")
                if (inChallenge('UF',11)) eff = new Decimal("1")
                if (inChallenge('UF',11) && hasUpgrade('N',33)) eff =  new Decimal("3").pow(getBuyableAmount("N", 11))
                if (eff>=1e50 &&(!hasMilestone('F',6000))&&(!hasUpgrade('N',16))&&(!hasMilestone('F',12500))&&!inChallenge('I',12)) return eff = new Decimal("1e50")
             else if (eff>=1e64&&(hasMilestone('F',6000))&&(!hasMilestone('F',12500))&&(!hasUpgrade('N',16))&&!inChallenge('I',12)) return eff = new Decimal("1e64")
                else if (eff>=1e75&&(hasMilestone('F',12500))&&(!hasUpgrade('N',16))&&!inChallenge('I',12)) return eff = new Decimal("1e75")
                else if (hasUpgrade('N',16)&&!inChallenge('I',12)&&!hasUpgrade('F',16)) return eff = new Decimal("1e120")
                else if (hasUpgrade('F',16)) return eff = new Decimal("1.79e308")
                else if (inChallenge('I',12))return eff = new Decimal("1")
             
                else return eff = eff
                
               
                
            }
        },
        12: {
            title: "-",
            display() {
                if(hasUpgrade('N',26))  return "Boosts points gain by " + format(tmp.N.buyables[12].effect) + "x<br>Cost : " + " Infinity Numbers"
               if (hasChallenge('F',42)) return "Boosts points gain by " + format(tmp.N.buyables[12].effect) + "x<br>Cost : " + format(new Decimal("1e6").pow(getBuyableAmount("N", 12).add(1))) + " Numbers"

                else return "Boosts points gain by " + format(tmp.N.buyables[12].effect) + "x<br>Cost : " + format(new Decimal("1e10").pow(getBuyableAmount("N", 12).add(1))) + " Numbers"
            },
            unlocked() { return hasChallenge("F", 31)},
            canAfford() { 
                if(hasUpgrade('N',26)) return player.N.points.gte(new Decimal(1e1000))
                else if (hasChallenge('F',42)) return player.N.points.gte(new Decimal("1e6").pow(getBuyableAmount("N", 12).add(1))) 
                else return player.N.points.gte(new Decimal("1e10").pow(getBuyableAmount("N", 12).add(1))) 
            },
            buy() { 
                {
                   if (hasChallenge('F',42)) player.N.points = player.N.points.minus(new Decimal("1e6").pow(getBuyableAmount("N", 12).add(1)))
                   else  player.N.points = player.N.points.minus(new Decimal("1e10").pow(getBuyableAmount("N", 12).add(1)))
                }
                setBuyableAmount("N", 12, getBuyableAmount("N", 12).add(1))
            },
            effect() { 
    
                 if (hasChallenge('F',32)) eff = new Decimal("4").pow(getBuyableAmount("N", 12))
                else eff = new Decimal("2").pow(getBuyableAmount("N", 12))
                if (hasChallenge('F',33)) eff = new Decimal("8").pow(getBuyableAmount("N", 12))
                 if (inChallenge('UF',11)) eff = new Decimal("1")
                 if (inChallenge('UF',11) && hasUpgrade('F',25)&&player.X.points.gte(1)) eff =  new Decimal("3").pow(getBuyableAmount("N", 12))
                 if(hasMilestone('NN',3)&&player.X.points.gte(1)) eff = new Decimal("1e30")
                 if (eff>=1e20&& ( player.UF.challenges[11]<=3)&&(!hasUpgrade('N',26))&&!inChallenge('I',12)) return eff = new Decimal("1e20")
                 else if (eff>=1e30&& ( player.UF.challenges[11]>=4)&&(!hasUpgrade('N',26))&&!inChallenge('I',12)) return eff = new Decimal("1e30")
                else if (hasUpgrade('N',26)&&!inChallenge('I',12) )return eff = new Decimal("1e50")
                else if (inChallenge('I',12))return eff = new Decimal("1")
         
                else return eff = eff
    
               
              
                
            }
        },
        13: {
            title: "x",
            display() {
                return "Boosts numbers gain by " + format(tmp.N.buyables[13].effect) + "x<br>Cost : " + format(tmp.N.buyables[13].cost) + " Numbers"
            },
            unlocked() { return hasMilestone("F", 1580)},
            cost(){
            if(hasUpgrade('N',36)) return new Decimal(1e1000)
            let base=new Decimal(1e20)
            if (inChallenge('UF',12)) base=new Decimal(1e35)
            if (player.X.points.gte(1)) base=new Decimal(1e250)
            return base.pow(getBuyableAmount("N", 13).add(1))
            },
            canAfford() { 
                return player.N.points.gte(tmp.N.buyables[13].cost) 
            },
            buy() { 
                {
                    player.N.points = player.N.points.minus(tmp.N.buyables[13].cost)
                }
                setBuyableAmount("N", 13, getBuyableAmount("N", 13).add(1))
            },
            effect() { 
       
            let exp=new Decimal(0.5)
        if (hasUpgrade('N',41)) exp=new Decimal(0.65)
        if (player.X.points.gte(1)) exp=new Decimal(0.225)
        eff  = new Decimal(player.N.points.add(1).log(10).pow(exp).add(1)).pow(getBuyableAmount("N", 13)).min(1e85)         
        if(hasUpgrade('N',36)) eff = new Decimal("1e100")   
        if(hasUpgrade('F',26)) eff = new Decimal("1.79e308")
        if (inChallenge('I',12)) eff = new Decimal("1")
        return eff               
            }
        },
        21: {
            title: "/",
            display() {
                if(hasUpgrade('N',46)) return "Numbers gain ^ " + format(tmp.N.buyables[21].effect) + "<br>Cost : " + " Infinity Numbers"
                if (inChallenge('UF',12)) return "Numbers gain ^ " + format(tmp.N.buyables[21].effect) + "<br>Cost : " + format(new Decimal("1e60").pow(getBuyableAmount("N", 21).add(1))) + " Numbers"

                else return "Numbers gain ^" + format(tmp.N.buyables[21].effect) + "<br>Cost : " + format(new Decimal("1e35").pow(getBuyableAmount("N", 21).add(1))) + " Numbers"
            },
            unlocked() { return hasMilestone("UF", 11)},
            canAfford() { 
                if(hasUpgrade('N',46)) return player.N.points.gte(new Decimal(1e1000))
                else if (inChallenge('UF',12))  return player.N.points.gte(new Decimal("1e60").pow(getBuyableAmount("N", 21).add(1))) 
               else return player.N.points.gte(new Decimal("1e35").pow(getBuyableAmount("N", 21).add(1))) 
            },
            buy() { 
                {
                   if (inChallenge('UF',12))  player.N.points = player.N.points.minus(new Decimal("1e60").pow(getBuyableAmount("N", 21).add(1)))
                else  player.N.points = player.N.points.minus(new Decimal("1e35").pow(getBuyableAmount("N", 21).add(1)))
                }
                setBuyableAmount("N", 21, getBuyableAmount("N", 21).add(1))
            },
            effect() { 
        
                if ( (new Decimal("1").add(0.025).pow(getBuyableAmount("N", 21)) ).gte(1.5)  &&player.X.points.gte(1)) return eff = new Decimal("1.5")
              else  if(player.X.points.gte(1)&&hasMilestone('F',240))  eff = new Decimal("1").add(0.025).pow(getBuyableAmount("N", 21))   
           else   if(player.X.points.gte(1))  eff = new Decimal("1").add(0.02).pow(getBuyableAmount("N", 21)) 
             else   eff = new Decimal("1").add(0.04).pow(getBuyableAmount("N", 21)) 
                if (inChallenge('I',12)) eff = new Decimal("1")
                else if (eff>=2&&(!hasUpgrade('N',46))) return eff = new Decimal("2")
                else if(hasUpgrade('N',46)&&!hasUpgrade('F',36)) return eff = new Decimal("2.1") 
                else if(hasUpgrade('F',36)) return eff = new Decimal("3.08") 
                if(hasMilestone('NN',3)&&player.X.points.gte(1)) eff = new Decimal("1.5")
                return eff = eff
                  
            }
        },
        22: {
            title: "^",
            display() {
               return "Boost negative numbers gain by " + format(tmp.N.buyables[22].effect) + "x<br>Cost : " + format(tmp.N.buyables[22].cost) + " Numbers"
            },
            unlocked() { return hasAchievement("A", 41) },
            cost(){
                if(hasChallenge("F",24)) return new Decimal(1.79e308).pow(getBuyableAmount("N", 22).add(1))
            else return new Decimal("1e1000").pow(getBuyableAmount("N", 22).add(1))
            },
            canAfford() { 
              return player.N.points.gte(tmp.N.buyables[22].cost) 
            },
            buy() { 
                {
               player.N.points = player.N.points.minus(tmp.N.buyables[22].cost)
                }
                setBuyableAmount("N", 22, getBuyableAmount("N", 22).add(1))
            },
            effect() { 
                if(hasUpgrade('IP',44))  eff = new Decimal("1")
                else eff = new Decimal("10").pow(getBuyableAmount("N", 22)) 
                return eff = eff
                  
            }
        },
    
        
    
       
    },
    clickables:{
        11:{
            display() {
                return "Master '1'. Currenty: "+player.N.m1},

            canClick(){return player.N.m1||new Decimal(0).add(tmp.N.mt).lt(player.N.ma)},
            onClick(){
                player.N.m1=!player.N.m1
              },
            unlocked(){return hasChallenge("UF",212)},
            },
            12:{
                display() {
                    return "Master '2'. Currenty: "+player.N.m2},
    
                canClick(){return player.N.m2||new Decimal(0).add(tmp.N.mt).lt(player.N.ma)},
                onClick(){
                    player.N.m2=!player.N.m2
                  },
                unlocked(){return hasChallenge("UF",212)},
                },
                13:{
                    display() {
                        return "Master '3'. Currenty: "+player.N.m3},
        
                    canClick(){return player.N.m3||new Decimal(0).add(tmp.N.mt).lt(player.N.ma)},
                    onClick(){
                        player.N.m3=!player.N.m3
                      },
                    unlocked(){return hasChallenge("UF",212)},
                    },
14:{
                        display() {
                            return "Master '4'. Currenty: "+player.N.m4},
            
                        canClick(){return player.N.m4||new Decimal(0).add(tmp.N.mt).lt(player.N.ma)},
                        onClick(){
                            player.N.m4=!player.N.m4
                          },
                        unlocked(){return hasChallenge("UF",212)},
                        },
 15:{display() {return "Master '5'. Currenty: "+player.N.m5},canClick(){return player.N.m5||new Decimal(0).add(tmp.N.mt).lt(player.N.ma)},onClick(){player.N.m5=!player.N.m5},unlocked(){return hasUpgrade("UF",1002)},},
 21:{display() {return "Master '11'. Currenty: "+player.N.m6},canClick(){return player.N.m6||new Decimal(0).add(tmp.N.mt).lt(player.N.ma)},onClick(){player.N.m6=!player.N.m6},unlocked(){return hasUpgrade("UF",1002)},},
 22:{display() {return "Master '12'. Currenty: "+player.N.m7},canClick(){return player.N.m7||new Decimal(0).add(tmp.N.mt).lt(player.N.ma)},onClick(){player.N.m7=!player.N.m7},unlocked(){return hasUpgrade("UF",1002)},},
 23:{display() {return "Master '15'. Currenty: "+player.N.m8},canClick(){return player.N.m8||new Decimal(0).add(tmp.N.mt).lt(player.N.ma)},onClick(){player.N.m8=!player.N.m8},unlocked(){return hasUpgrade("UF",1002)},},
 //24:{display() {return "Master '9'. Currenty: "+player.N.m9},canClick(){return player.N.m9||new Decimal(0).add(tmp.N.mt).lt(player.N.ma)},onClick(){player.N.m9=!player.N.m9},unlocked(){return hasUpgrade("UF",1002)},},
},
        mt(){
            let mt=new Decimal(0)
            if(player.N.m1) mt=mt.add(1)
            if(player.N.m2) mt=mt.add(1)
            if(player.N.m3) mt=mt.add(1)
            if(player.N.m4) mt=mt.add(1)
            if(player.N.m5) mt=mt.add(1)
            if(player.N.m6) mt=mt.add(1)
            if(player.N.m7) mt=mt.add(1)
            if(player.N.m8) mt=mt.add(1)
            if(player.N.m9) mt=mt.add(1)
            let ma=new Decimal(1)
            if(hasChallenge("UF",221)) ma++
            if(hasChallenge("UF",222)) ma++
            if(hasUpgrade("UF",1002)) ma++
player.N.ma=ma
            return mt
  
        },

    tabFormat: {
      
      "Upgrades":{
        unlocked(){return hasMilestone('F',5)|hasMilestone("I", 1)},
        content:[
          "main-display",
          "blank",
        ["prestige-button",function(){return ""}],
        "blank",
        "resource-display",
          "blank",
          "blank",
          "upgrades",
          "clickables",
        ]
      },

      "Buyables":{
        unlocked(){return ((hasUpgrade('F',15)||hasMilestone("I", 1))&&(!inChallenge("NN", 21)&&!hasChallenge("NN", 21)))||(player.X.points.gte(1)&&hasChallenge('F',22))},
        content:[
          "main-display",
          "blank",
        ["prestige-button",function(){return ""}],
          "blank",
          "blank",
          "buyables",
        ]
      },
      },
passiveGeneration(){return hasMilestone('F',5) && (!inChallenge('F',22)) && (!inChallenge('F',23)) && (!inChallenge('F',42)&& (!inChallenge('F',43)||player.X.points.gte(1)))? 1 : 0},
automateStuff(){
    if(hasMilestone("I",69)||hasChallenge("F",24)){
        if(layers.N.buyables[13].canAfford()&&player.X.points.gte(1)&&hasMilestone("F",1580))setBuyableAmount("N",13,player.N.points.log(1e250).floor())   
      if(layers.N.buyables[22].canAfford()&&hasChallenge("F",24))setBuyableAmount("N",22,player.N.points.log(1.79e308).floor())
      else if(layers.N.buyables[22].canAfford())setBuyableAmount("N",22,player.N.points.log("1e1000").floor())
      
    }
},

    layerShown(){return true}
})
