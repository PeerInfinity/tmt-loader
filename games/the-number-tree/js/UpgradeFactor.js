addLayer("UF", {
    name(){if(hasUpgrade('UF',32))return  "Feature Factor"
else return  "Upgrade Factor"}, // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "UF", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        mp: new Decimal(0),
       mpgain: new Decimal(0),
       cost1:new Decimal("ee20"),
       base1:new Decimal(2),
       canup2: new Decimal(0),
       canup3: new Decimal(0),
       canup4: new Decimal(0),
       canup5: new Decimal(0),
       canup6: new Decimal(0),
       canupa: new Decimal(0),
       canupb: new Decimal(0),
       canupg: false,
       canupd: false,
       canupe: false,
       canupm: false,
       canupm1: false,
       page: new Decimal(1),   
     CP: new Decimal(0),
     CPgain: new Decimal(0),
     UP: new Decimal(0),
    UPgain: new Decimal(0),

    }},
    color: "#FF0000",
    requires() {
        if(hasMilestone("FS",5))  return new Decimal("10^^10")
        if(player.X.points.gte(1))  return new Decimal(1e50)
     else   return new Decimal(1e30)},
    resource(){
        if(hasUpgrade('UF',32))return  "Feature Factor"
        else return  "Upgrade Factor"
}, // Can be a function that takes requirement increases into account
    baseResource: "Numbers", // Name of resource prestige is based on
    baseAmount() {return player.N.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    base(){
        if(inChallenge('E',31)||hasUpgrade('E',22))return new Decimal("eeeeeeeeee10")
      else  return 1e10},
    exponent(){
   
      if(inChallenge('NN',22)||hasChallenge('NN',22))return 1
        if(hasUpgrade('F',44))return 0.5
        if(hasUpgrade('F',41))return 0.6
        if(hasUpgrade('N',43))return 0.9
        else return 1.25
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
        {key: "u", description: "U: Reset for Upgrade Factor", onPress(){if (canReset(this.layer)) doReset(this.layer)},
        onPress() { if (player.UF.unlocked) doReset("UF") },
        unlocked() {return hasChallenge('F', 22)} // Determines if you can use the hotkey, optional
    },
    ],
    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone("I", 2) && resettingLayer=="I") keep.push("milestones")
        if (resettingLayer=="Z") keep.push("milestones")
        if (hasMilestone("IP", 6) && resettingLayer=="IP") keep.push("milestones")
        if (hasMilestone("UF", 5100) && resettingLayer=="IP") keep.push("milestones")
        if (hasMilestone("UF", 5100) && resettingLayer=="I") keep.push("milestones")
        if (hasMilestone("UF", 5100) && resettingLayer=="FS") keep.push("milestones")
        if (hasMilestone("UF", 5100) && resettingLayer=="MS") keep.push("milestones")
        if (hasMilestone("UF", 5100) && resettingLayer=="E") keep.push("milestones")
        if (hasMilestone("UF", 5100) && resettingLayer=="O") keep.push("milestones")
        if (hasMilestone("UF", 5100) && resettingLayer=="M") keep.push("milestones")
        if (hasUpgrade("UF", 11) && resettingLayer=="I") keep.push("upgrades")
        if (hasUpgrade("UF", 11) && resettingLayer=="IP") keep.push("upgrades")
        if (hasUpgrade("UF", 11) && resettingLayer=="FS") keep.push("upgrades")
        if (hasUpgrade("UF", 11) && resettingLayer=="MS") keep.push("upgrades")
        if (hasMilestone("E", 8) && resettingLayer=="E") keep.push("upgrades")
        if (hasMilestone("O", 6) && resettingLayer=="O") keep.push("upgrades")
        if (resettingLayer=="M") keep.push("upgrades")
        if (resettingLayer=="E") keep.push("milestones")
        if (player.X.points.gte(1)) keep.push("upgrades")
        if (hasMilestone("E", 8) && resettingLayer=="I") keep.push("buyables")
        if (hasMilestone("E", 8) && resettingLayer=="FS") keep.push("buyables")
        if (hasMilestone("E", 8) && resettingLayer=="IP") keep.push("buyables")
        if (hasMilestone("E", 8) && resettingLayer=="MS") keep.push("buyables")
        if (hasMilestone("E", 8) && resettingLayer=="E") keep.push("buyables")
        if (hasMilestone("M", 4) && resettingLayer=="M") keep.push("buyables")
        if (hasMilestone("M", 4) && resettingLayer=="O") keep.push("buyables")
        if ((hasMilestone('I',2)||player.Z.points.gte(1))&&player.X.points.gte(1)) keep.push("challenges")
        if (challengeCompletions("UF",21)>0 && resettingLayer=="IP") keep.push("challenges")
        if (challengeCompletions("UF",21)>0 && resettingLayer=="I") keep.push("challenges")
        if (challengeCompletions("UF",21)>0 && resettingLayer=="M") keep.push("challenges")
        if (challengeCompletions("UF",21)>0 && resettingLayer=="O") keep.push("challenges")
        if (challengeCompletions("UF",21)>0 && resettingLayer=="E") keep.push("challenges")
        if (resettingLayer=="S"&&hasMilestone('S',2)) keep.push("milestones")
        if (resettingLayer=="S"&&hasMilestone('S',3)) keep.push("upgrades")
       
        if (hasMilestone('I',2)&&player.X.points.gte(1)) keep.push("canup2")
        if (hasMilestone('I',2)&&player.X.points.gte(1)) keep.push("canup3")
        if (hasMilestone('I',2)&&player.X.points.gte(1)) keep.push("canup4")
        if (hasMilestone('I',2)&&player.X.points.gte(1)) keep.push("canup5")
        if (hasMilestone('I',2)&&player.X.points.gte(1)) keep.push("canup6")
        if (hasMilestone('I',2)&&player.X.points.gte(1)) keep.push("canupa")
        if (hasMilestone('I',2)&&player.X.points.gte(1)) keep.push("canupb")
        if (hasMilestone('I',2)&&player.X.points.gte(1)) keep.push("canupg")
        if (hasMilestone('I',2)&&player.X.points.gte(1)) keep.push("canupd")
        if (hasMilestone('I',2)&&player.X.points.gte(1)) keep.push("canupe")
        if (hasMilestone('I',2)&&player.X.points.gte(1)) keep.push("canupm")
        if (hasMilestone('I',2)&&player.X.points.gte(1)) keep.push("canupm1")
        if (hasMilestone('FS',4)&&player.X.points.gte(1)) keep.push("CP")
        if (hasMilestone('FS',4)&&player.X.points.gte(1)) keep.push("UP")
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    milestones: {
        1: {
            requirementDescription: "1 Upgrade Factor",
            effectDescription: "First four Upgrade Factor Unlock 1 upgrade and point x2, keep upgrade on reset",
            done() { return player.UF.points.gte(1) }
            ,unlocked(){ return (!hasUpgrade('UF',32))}
        },
        6: {
            requirementDescription: "6 Upgrade Factor",
            effectDescription: "Unlock 1 upgrade.",
            done() { return player.UF.points.gte(6) }
            ,unlocked(){ return (!hasUpgrade('UF',32))}
        },
        8: {
            requirementDescription: "8 Upgrade Factor",
            effectDescription: "Unlock 1 upgrade.",
            done() { return player.UF.points.gte(8)&&!player.X.points.gte(1) },
            unlocked(){ return (!hasUpgrade('UF',32)&&!player.X.points.gte(1))}
        },
        10: {
            requirementDescription: "10 Upgrade Factor",
            effectDescription: "Unlock 1 challenge (not upgrade) and point x10000.",
            done() { return player.UF.points.gte(10) }
            ,unlocked(){ return (!hasUpgrade('UF',32))}
        },
        11: {
            requirementDescription: "11 Upgrade Factor",
            effectDescription: "Unlock 1 buyable (not upgrade).",
            done() { return player.UF.points.gte(11) }
            ,unlocked(){ return (!hasUpgrade('UF',32))}
        },
        14: {
            requirementDescription: "14 Upgrade Factor",
            effectDescription: "Unlock 1 upgrade.",
            done() { return player.UF.points.gte(14)&&player.X.points.gte(1) }
            ,unlocked(){ return (!hasUpgrade('UF',32)&&player.X.points.gte(1))}
        },
        16: {
            requirementDescription: "16 Upgrade Factor",
            effectDescription(){
                if(player.X.points.gte(1))  return "Auto buy Upgrade Factor."
              else  return "Auto buy Upgrade Factor, unlock 1 challenge and 5 upgrade."},
          
            done() { return player.UF.points.gte(16)||hasMilestone("MS", 2) }
            ,unlocked(){ return (!hasUpgrade('UF',32))}
        },
        18: {
            requirementDescription: "18 Upgrade Factor",

            effectDescription: "Upgrade factor reset nothing.",
            done() { return player.UF.points.gte(18)||hasMilestone("MS", 2) }
            ,unlocked(){ return (!hasUpgrade('UF',32))}
        },
        35: {
            requirementDescription: "35 Upgrade Factor",
            effectDescription: "Boost '11' and '11' also boost point gain. Upgrade factor boost factor point gain.",
            done() { return player.UF.points.gte(35)&&player.X.points.gte(1) }
            ,unlocked(){ return (!hasUpgrade('UF',32)&&player.X.points.gte(1))}
        },
        52: {
            requirementDescription: "52 Upgrade Factor",
            effectDescription: "Upgrade Factor boost point and Numbers gain.",
            done() { return player.UF.points.gte(52) }
            ,unlocked(){ return (!hasUpgrade('UF',32))}
        },
        128: {
            requirementDescription: "128 Upgrade Factor",
            effectDescription(){
                if(player.X.points.gte(1)) return"Boost the eighth milestone."
                return"Unlock 2 Number upgrades and boost the eighth milestone."},
            
            done() { return player.UF.points.gte(128) }
            ,unlocked(){ return (!hasUpgrade('UF',32))}
        },
        5100: {
            requirementDescription: "100 Milestone point",
            effectDescription: "Boost The sixth milestone in E layer but '2' and '4' in E layer will nerf your EP gain.",
            done() { return player.UF.mp.gte(100) }
            ,unlocked(){ return (hasUpgrade('UF',32))}
        },
        5500: {
            requirementDescription: "500 Milestone point",
            effectDescription: "Boost the UF buyable.",
            done() { return player.UF.mp.gte(500) }
            ,unlocked(){ return (hasUpgrade('UF',32))}
        },
        56000: {
            requirementDescription: "6000 Milestone point",
            effectDescription: "Get 5x milestone point but the milestone point cap /5.",
            done() { return player.UF.mp.gte(6000) }
            ,unlocked(){ return (hasUpgrade('UF',32))}
        },
        522000: {
            requirementDescription: "22000 Milestone point",
            effectDescription: "milestone point boost Number gain.",
            done() { return player.UF.mp.gte(22000) }
            ,unlocked(){ return (hasUpgrade('UF',32))}
        },
        585555: {
            requirementDescription: "85555 Milestone point",
            effectDescription: "EP boost milestone point gain and make buyable cheaper. Boost the fourth milestone.",
            done() { return player.UF.mp.gte(85555) }
            ,unlocked(){ return (hasUpgrade('UF',32))}
        },

       1e25 : {
            requirementDescription: "1e25 Milestone point",
            effectDescription: "Boost The sixth milestone in E layer and remove the second effect in the first milestone.",
            done() { return player.UF.mp.gte(1e25) }
            ,unlocked(){ return (hasUpgrade('UF',32))}
        },
        1e26 : {
            requirementDescription: "ee16 Milestone point",
            effectDescription: "Unlock Mastery",
            done() { return player.UF.mp.gte("ee16") }
            ,unlocked(){ return (hasUpgrade('UF',32))}
        },


        
        

    },
    autoPrestige(){
        return hasMilestone('UF',16);
    },resetsNothing(){
        return hasMilestone('UF',18) ;
    },
    
    challenges: {
        11: {
           
            completionLimit(){
                let limit=4;
                return limit;
            },
            name: "Buyable upgrader",

            challengeDescription(){
                if(player.X.points.gte(1))   return  "'-' have no effect and nerf '+'"+"<br>You have completed this challenge "+ challengeCompletions("UF",11)+"/4 times." 
              else  return  "'+' and '-' have no effect"+"<br>You have completed this challenge "+ challengeCompletions("UF",11)+"/4 times." },
            goal: function(){
                if(hasMilestone('UF',35))   return [new Decimal("1e50"),new Decimal("1e75"),new Decimal("1e100"),new Decimal("1e240"),new Decimal(Infinity)][player.UF.challenges[11]];
                if(player.X.points.gte(1))  return [new Decimal("1e50"),new Decimal("1e75"),new Decimal("1e100"),new Decimal("1e300"),new Decimal(Infinity)][player.UF.challenges[11]];
               else return [new Decimal("1e30"),new Decimal("1e45"),new Decimal("1e52"),new Decimal("1e65"),new Decimal(Infinity)][player.UF.challenges[11]];
        },
            rewardDescription(){return "'+' is better' (1-3) and Remove 1 hardcap of '-'  (4)."},
          unlocked(){return (hasUpgrade('F', 22)||hasMilestone("I", 1)||hasUpgrade('N',23))&&!hasMilestone('UF',1e26)},
          onEnter(){
            player.N.points=new  Decimal(0)
            player.points=new  Decimal(0)
            setBuyableAmount('N',11,new Decimal(0))
            setBuyableAmount('N',12,new Decimal(0)) 
            setBuyableAmount('N',21,new Decimal(0))
          },
    },
    12: {
           
      
        name: "Upgrade Upgrader",
        challengeDescription: "'x' and '/' cost is higher",
        canComplete(){return player.points.gte("1.79e308")},
            goalDescription: "1.79e308 point",
    rewardDescription(){return "Unlock 1 Number Upgrade."},
      unlocked(){return hasMilestone('UF', 16)&&!hasMilestone('UF',1e26)&&!player.X.points.gte(1)},

},
21: {
           
    completionLimit(){
        let limit=5;
        return limit;
    },
    name: "Master",
    challengeDescription(){return   "You can't buy UF upgrade. Entering this challenge resets your UF upgrade and layer resoruce on Row 1 - 3."+"<br>You have completed this challenge "+ challengeCompletions("UF",21)+"/5 times." },
    goal: function(){
     
        return [new Decimal("e5.4e14"),new Decimal("e1.377e15"),new Decimal("e2.95e15"),new Decimal("e3.16e15"),new Decimal("e1.61e26"),new Decimal("eeeeeeeee10")][player.UF.challenges[21]];
},
    rewardDescription(){return "upgrade are better."},
  unlocked(){return hasMilestone('UF',1e26)},
  onEnter(){
     
    player.UF.upgrades=[]
    
      player.N.points=new Decimal(0)
      player.points=new Decimal(0)
      player.F.points=new Decimal(0)
      player.UF.points=new Decimal(0)
      player.IP.points=new Decimal(0)
      player.FS.points=new Decimal(0)
      player.I.points=new Decimal(0)
     
  },
  onExit(){ player.UF.upgrades=[11,12,13,14,15,21,22,23,24,25,31,32,33,34,35,71,72,73,74,75,81,91,92,93,94,95]}

},
101: {
           
      
    name: "Upgrader 1",
    challengeDescription: "point gain ^(1/4) and '1' has no effect",
    canComplete(){return player.N.points.gte("1e135")},
        goalDescription: "1e135 Numbers",
rewardDescription(){return "Boost '1'"},
  unlocked(){return hasMilestone('UF', 16)&&player.X.points.gte(1)&&player.UF.page==1},
  onEnter(){
    player.N.points=new  Decimal(0)
    player.points=new  Decimal(0)
    setBuyableAmount('N',11,new Decimal(0))
    setBuyableAmount('N',12,new Decimal(0)) 
    setBuyableAmount('N',21,new Decimal(0))
  },
},
102: {  
    name: "Upgrader 2",
    challengeDescription: "'2' effect is divide instead of multiple.",
    canComplete(){return player.N.points.gte("1e171")},
        goalDescription: "1e171 Numbers",
rewardDescription(){return "Boost '2'"},
  unlocked(){return player.UF.canup2.gte(1)&&player.UF.page==1},
  onEnter(){
      player.N.points=new  Decimal(0)
      player.points=new  Decimal(0)
      setBuyableAmount('N',11,new Decimal(0))
      setBuyableAmount('N',12,new Decimal(0)) 
      setBuyableAmount('N',21,new Decimal(0))
    },
},
111: {  
    name: "Upgrader 3",
    challengeDescription: "'3' effect is divide instead of multiple.",
    canComplete(){return player.N.points.gte("1e416")},
        goalDescription: "1e416 Numbers",
rewardDescription(){return "Boost '3'"},
  unlocked(){return player.UF.canup3.gte(1)&&player.UF.page==1},
  onEnter(){
      player.N.points=new  Decimal(0)
      player.points=new  Decimal(0)
      setBuyableAmount('N',11,new Decimal(0))
      setBuyableAmount('N',12,new Decimal(0)) 
      setBuyableAmount('N',21,new Decimal(0))
    },
},
112: {  
    name: "Upgrader 4",
    challengeDescription: "'4' effect is divide instead of multiple.",
    canComplete(){return player.N.points.gte("1e155")},
        goalDescription: "1e155 Numbers",
rewardDescription(){return "Boost '4'"},
  unlocked(){return player.UF.canup4.gte(1)&&player.UF.page==1},
  onEnter(){
      player.N.points=new  Decimal(0)
      player.points=new  Decimal(0)
      setBuyableAmount('N',11,new Decimal(0))
      setBuyableAmount('N',12,new Decimal(0)) 
      setBuyableAmount('N',21,new Decimal(0))
    },
},
121: {  
    name: "Upgrader 5",
    challengeDescription: "'5' effect is divide instead of multiple.",
    canComplete(){return player.N.points.gte("1e337")},
        goalDescription: "1e337 Numbers",
rewardDescription(){return "Boost '5'"},
  unlocked(){return player.UF.canup5.gte(1)&&player.UF.page==1},
  onEnter(){
      player.N.points=new  Decimal(0)
      player.points=new  Decimal(0)
      setBuyableAmount('N',11,new Decimal(0))
      setBuyableAmount('N',12,new Decimal(0)) 
      setBuyableAmount('N',21,new Decimal(0))
    },
},
122: {  
    name: "meta upgrader",
    challengeDescription: "Number ^0.1",
    canComplete(){return player.N.points.gte("1e12")},
        goalDescription: "1e12 Numbers",
rewardDescription(){return "'2' - '5' effect is always best."},
  unlocked(){return player.UF.canup6.gte(1)&&player.UF.page==1},
  onEnter(){
      player.N.points=new  Decimal(0)
      player.points=new  Decimal(0)
      setBuyableAmount('N',11,new Decimal(0))
      setBuyableAmount('N',12,new Decimal(0)) 
      setBuyableAmount('N',21,new Decimal(0))
    },
},
201: {  
    name: "Upgrader alpha",
    challengeDescription: "Point gain is always 1.",
    canComplete(){return player.N.points.gte(new Decimal("1e777").pow(new Decimal(1).div(player.UF.CP.add(5).log(5).pow(0.15))))},
        goalDescription(){return format(new Decimal("1e777").pow(new Decimal(1).div(player.UF.CP.add(5).log(5).pow(0.15))))+ " Numbers"},
rewardDescription(){return "Factor alpha is greater."},
  unlocked(){return player.UF.canupa.gte(1)&&player.UF.page==2},
  onEnter(){
      player.N.points=new  Decimal(0)
      player.points=new  Decimal(0)
      setBuyableAmount('N',11,new Decimal(0))
      setBuyableAmount('N',12,new Decimal(0)) 
      setBuyableAmount('N',21,new Decimal(0))
    },
},
202: {  
    name: "Upgrader beta",
    challengeDescription: "Factor beta effect is divide instead of multiple.",
    canComplete(){return player.N.points.gte(new Decimal("1e715").pow(new Decimal(1).div(player.UF.CP.add(5).log(5).pow(0.15))))},
        goalDescription(){return format(new Decimal("1e715").pow(new Decimal(1).div(player.UF.CP.add(5).log(5).pow(0.15))))+ " Numbers"},
rewardDescription(){return "Factor beta is greater."},
  unlocked(){return player.UF.canupb.gte(1)&&player.UF.page==2},
  onEnter(){
      player.N.points=new  Decimal(0)
      player.points=new  Decimal(0)
      setBuyableAmount('N',11,new Decimal(0))
      setBuyableAmount('N',12,new Decimal(0)) 
      setBuyableAmount('N',21,new Decimal(0))
    },
},
211: {  
    name: "Upgrader gamma",
    challengeDescription: "All upgrade that multiple and exponentiated Number gain are disabled.",
    canComplete(){return player.N.points.gte(new Decimal("1e309").pow(new Decimal(1).div(player.UF.CP.add(5).log(5).pow(0.15))))},
        goalDescription(){return format(new Decimal("1e309").pow(new Decimal(1).div(player.UF.CP.add(5).log(5).pow(0.15))))+ " Numbers"},
rewardDescription(){return "Unlock a Factor Challenge."},
  unlocked(){return player.UF.canupg&&player.UF.page==2},
  onEnter(){
      player.N.points=new  Decimal(0)
      player.points=new  Decimal(0)
      setBuyableAmount('N',11,new Decimal(0))
      setBuyableAmount('N',12,new Decimal(0)) 
      setBuyableAmount('N',21,new Decimal(0))
    },
},
212: {  
    name: "Upgrader delta",
    challengeDescription: "All upgrade that exponentiated Number gain are reversed.",
    canComplete(){return player.N.points.gte(new Decimal("1e720").pow(new Decimal(1).div(player.UF.CP.add(5).log(5).pow(0.15))))},
        goalDescription(){return format(new Decimal("1e720").pow(new Decimal(1).div(player.UF.CP.add(5).log(5).pow(0.15))))+ " Numbers"},
rewardDescription(){return "Unlock master upgrade (In Number layer)."},
  unlocked(){return player.UF.canupd&&player.UF.page==2},
  onEnter(){
      player.N.points=new  Decimal(0)
      player.points=new  Decimal(0)
      setBuyableAmount('N',11,new Decimal(0))
      setBuyableAmount('N',12,new Decimal(0)) 
      setBuyableAmount('N',21,new Decimal(0))
    },
},
221: {  
    name: "Upgrader epsilon",
    challengeDescription: "All non mastered Number upgrades have no effect.",
    canComplete(){return player.N.points.gte(new Decimal("1e2750").pow(new Decimal(1).div(player.UF.CP.add(5).log(5).pow(0.15))))},
        goalDescription(){return format(new Decimal("1e2750").pow(new Decimal(1).div(player.UF.CP.add(5).log(5).pow(0.15))))+ " Numbers"},
rewardDescription(){return "You can mastered 1 more upgrade."},
  unlocked(){return player.UF.canupe&&player.UF.page==2},
  onEnter(){
      player.N.points=new  Decimal(0)
      player.points=new  Decimal(0)
      setBuyableAmount('N',11,new Decimal(0))
      setBuyableAmount('N',12,new Decimal(0)) 
      setBuyableAmount('N',21,new Decimal(0))
    },
},
222: {  
    name: "meta upgrader+",
    challengeDescription: "Number ^0.01",
    canComplete(){return player.N.points.gte(new Decimal("1e42").pow(new Decimal(1).div(player.UF.CP.add(5).log(5).pow(0.15))))},
        goalDescription(){return format(new Decimal("1e42").pow(new Decimal(1).div(player.UF.CP.add(5).log(5).pow(0.15))))+ " Numbers"},
rewardDescription(){return "Unlock upgrade point and you can mastered 1 more upgrade."},
  unlocked(){return player.UF.canupm&&player.UF.page==2},
  onEnter(){
      player.N.points=new  Decimal(0)
      player.points=new  Decimal(0)
      setBuyableAmount('N',11,new Decimal(0))
      setBuyableAmount('N',12,new Decimal(0)) 
      setBuyableAmount('N',21,new Decimal(0))
    },
},
301: {  
    name: "upgrader -1",
    challengeDescription: "You trapped in Reverse and upgrader delta",
    canComplete(){return player.N.points.gte(new Decimal("4.20e400"))},
        goalDescription(){return format(new Decimal("4.20e400"))+ " Numbers"},
rewardDescription(){return "Factor gain x1.13"},
  unlocked(){return player.UF.canupm1&&player.UF.page==3},
  onEnter(){
      player.N.points=new  Decimal(0)
      player.points=new  Decimal(0)
      setBuyableAmount('N',11,new Decimal(0))
      setBuyableAmount('N',12,new Decimal(0)) 
      setBuyableAmount('N',21,new Decimal(0))
    },
},
302: {  
    name: "upgrader -2",
    challengeDescription: "Number gain ^0.0001",
    canComplete(){return player.N.points.gte(new Decimal("500"))},
        goalDescription(){return format(new Decimal("500"))+ " Numbers"},
rewardDescription(){return "Factor gain x1.06"},
  unlocked(){return player.UF.canupm2&&player.UF.page==3},
  onEnter(){
      player.N.points=new  Decimal(0)
      player.points=new  Decimal(0)
      setBuyableAmount('N',11,new Decimal(0))
      setBuyableAmount('N',12,new Decimal(0)) 
      setBuyableAmount('N',21,new Decimal(0))
    },
},
},
buyables: {

    11: {
        title: "generators",
        display() {
           return "generate " + format(tmp.UF.buyables[11].effect) + " milestone point per second.<br>Cost : " + format(new Decimal(player.UF.cost1).pow(getBuyableAmount("UF", 11).add(1))) + " Numbers"
        },
        unlocked() { return hasUpgrade("UF", 32) },
        canAfford() { 
            return player.N.points.gte(new Decimal(player.UF.cost1).pow(getBuyableAmount("UF", 11).add(1))) 
        },
        buy() { 
            {
               player.N.points = player.N.points.minus(new Decimal(player.UF.cost1).pow(getBuyableAmount("UF", 11).add(1)))
            }
            setBuyableAmount("UF", 11, getBuyableAmount("UF", 11).add(1))
        },
        effect() { 

            if(hasMilestone('UF',56000))  eff = new Decimal(player.UF.base1).pow(getBuyableAmount("UF", 11)).times(10)
            else if(hasMilestone('E',2e7)) eff = new Decimal(player.UF.base1).pow(getBuyableAmount("UF", 11))
  else eff = new Decimal("1").times(getBuyableAmount("UF", 11))
          
            return  eff
       
            
           
            
        }
    },
    21: {
        title: "generators cheaper",
        display() {
            if(getBuyableAmount("UF", 21).gte(30)) return "generators cost base^" + format(tmp.UF.buyables[21].effect) + ".<br>Cost : Infinity"+ " Numbers"
           else return "generators cost base^" + format(tmp.UF.buyables[21].effect) + ".<br>Cost : " + format(new Decimal(player.UF.cost2).pow(getBuyableAmount("UF", 21).add(1))) + " Numbers"
        },
        unlocked() { return hasUpgrade("UF", 33) },
        canAfford() { 
            if(getBuyableAmount("UF", 21).gte(30)) return player.N.points.gte(new Decimal("eeeeeeeee10")) 
            else return player.N.points.gte(new Decimal(player.UF.cost2).pow(getBuyableAmount("UF", 21).add(1))) 
        },
        buy() { 
            {
               player.N.points = player.N.points.minus(new Decimal(player.UF.cost2).pow(getBuyableAmount("UF", 21).add(1)))
            }
            setBuyableAmount("UF", 21, getBuyableAmount("UF", 21).add(1))
        },
        effect() { 

         eff = new Decimal(player.UF.base2).pow(getBuyableAmount("UF", 21))
 
          
            return  eff
       
            
           
            
        }
    },
    31: {
        title: "generators booster",
        display() {
            if(getBuyableAmount("UF", 31).gte(30)) return "generators effect base^" + format(tmp.UF.buyables[31].effect) + ".<br>Cost : Infinity" + " Numbers"
           else return "generators effect base^" + format(tmp.UF.buyables[31].effect) + ".<br>Cost : " + format(new Decimal(player.UF.cost3).pow(getBuyableAmount("UF", 31).add(1))) + " Numbers"
        },
        unlocked() { return hasUpgrade("UF", 33) },
        canAfford() { 
            if(getBuyableAmount("UF", 31).gte(30))   return player.N.points.gte(new Decimal("eeeeeeeee10"))
           else  return player.N.points.gte(new Decimal(player.UF.cost3).pow(getBuyableAmount("UF", 31).add(1))) 
        },
        buy() { 
            {
               player.N.points = player.N.points.minus(new Decimal(player.UF.cost3).pow(getBuyableAmount("UF", 31).add(1)))
            }
            setBuyableAmount("UF", 31, getBuyableAmount("UF", 31).add(1))
        },
        effect() { 

         eff = new Decimal(player.UF.base3).pow(getBuyableAmount("UF", 31))
 
          
            return  eff
       
            
           
            
        }
    },
    
},
automateStuff(){
    if(hasMilestone("O",6)){
      if(layers.UF.buyables[11].canAfford())setBuyableAmount("UF",11,player.N.points.log(player.UF.cost1).floor())
      
    }
},

upgrades: {
  
        11: {
            title: "1",
            description(){
                if(challengeCompletions('UF',21)>=1)  return  "1 effect is much better"
                else return  "1 effect is better"
        },
            cost: new Decimal("e5.7e9"),
            currencyDisplayName: "Numbers",
            currencyInternalName:"points",
            currencyLayer:"N",
            canAfford(){
                if(inChallenge('UF',21)) return new Decimal(10).lt(0)
                 },
          
        },
        12: {
            title: "2",
            description(){return"Number boost point gain."},
            cost: new Decimal("e6.823e11"),
            currencyDisplayName: "Numbers",
            currencyInternalName:"points",
            currencyLayer:"N",
            unlocked(){
                return hasChallenge("NN", 31)
            },
            effect(){
           if(hasUpgrade('UF',15)) return new Decimal("e3.5e9")
                else if(player.N.points.gte("e3.5e14")) return new Decimal("e3.5e9")
                else return player.N.points.pow(0.00001).add(1)},
            unlocked(){
                return hasUpgrade("UF", 73)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            canAfford(){
                if(inChallenge('UF',21)) return new Decimal(10).lt(0)
                 },
    
        },
        13: {
            title: "3",
            description: "Point boost point gain.",
            cost: new Decimal("e1.018e12"),
            currencyDisplayName: "Numbers",
            currencyInternalName:"points",
            currencyLayer:"N",
            effect(){ 
                if(inChallenge('E',11)&&(!player.E.no234.gte(1)))return new Decimal("1")
                 else if(hasUpgrade('UF',15)) return new Decimal("e2e9")
            else if(player.points.gte("e50000000000")) return new Decimal("e2e9")
                else if(hasUpgrade('UF',74))  return player.points.pow(0.04).add(1)
                else  return player.points.pow(0.02).add(1)},
            unlocked(){
                return hasUpgrade("UF", 73)
            },
            canAfford(){
                if(inChallenge('UF',21)) return new Decimal(10).lt(0)
                 },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        14: {
            title: "4",
            description: "Point boost number gain.",
            cost: new Decimal("e1.31951e12"),
            currencyDisplayName: "Numbers",
            currencyInternalName:"points",
            currencyLayer:"N",
            effect(){
                if(inChallenge('E',11)&&(!player.E.no234.gte(1)))return new Decimal("1")
                else if(hasUpgrade('UF',15)) return new Decimal("e9e9")
            else if(player.points.gte("e4.5e10")) return new Decimal("e9e9")
                else return player.points.pow(0.2).add(1)},
            unlocked(){
                return hasUpgrade("UF", 73)
            }, canAfford(){
                if(inChallenge('UF',21)) return new Decimal(10).lt(0)
                 },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        15: {
            title: "5",
            description: "Boost '2', '3', '4'.",
            cost: new Decimal("e3.3e14"),
            currencyDisplayName: "Numbers",
            currencyInternalName:"points",
            currencyLayer:"N",
          
            unlocked(){
                return hasUpgrade("UF", 75)
            }, canAfford(){
                if(inChallenge('UF',21)) return new Decimal(10).lt(0)
                 },
        },
        21: {
            title: "6",
            description: "Negative numbers Boost Number gain.",
            cost: new Decimal("e3.6386e14"),
            currencyDisplayName: "Numbers",
            currencyInternalName:"points",
            currencyLayer:"N",
          
            effect(){return player.NN.points.pow(0.0005).add(1)}, 
            canAfford(){
                if(inChallenge('UF',21)) return new Decimal(10).lt(0)
                 },
        unlocked(){
            return hasUpgrade("UF", 15)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        22: {
            title: "7",
            description: "You can get more then 2 Super prestige point.",
            cost: new Decimal("e4.1036e14"),
            currencyDisplayName: "Numbers",
            currencyInternalName:"points",
            currencyLayer:"N",
            canAfford(){
                if(inChallenge('UF',21)) return new Decimal(10).lt(0)
                 },
        unlocked(){
            return hasUpgrade("UF", 21)
        },
    },
    23: {
        title: "8",
        description: "You can finish Boost or nerf after get e9e15 Number.",
        cost: new Decimal("e5e16"),
        currencyDisplayName: "Numbers",
        currencyInternalName:"points",
        currencyLayer:"N",
        canAfford(){
            if(inChallenge('UF',21)) return new Decimal(10).lt(0)
             },
    unlocked(){
        return hasUpgrade("UF", 22)
    },
   
},
24: {
    title: "9",
    description: "Number boost themselves.",
    cost: new Decimal("e7.2466e16"),
    currencyDisplayName: "Numbers",
    currencyInternalName:"points",
    currencyLayer:"N",
    effectDisplay() { return "^ "+format(upgradeEffect(this.layer, this.id)) },
    effect() { 
        if(hasMilestone('MS',11000))   return player.N.points.add(1).log(4).add(1).log(4).add(1).log(4).add(1).log(4).add(1).times(1.15).pow(3.1)
       else  if(hasMilestone('E',1e52))  return player.N.points.add(1).log(5).add(1).log(5).add(1).log(5).add(1).log(5).add(1).times(1.15).pow(3)
      else   if(hasMilestone('E',1e24)) return player.N.points.add(1).log(10).add(1).log(10).add(1).log(10).add(1).log(10).add(1).times(1.15).pow(3)
       else  if(hasUpgrade('E',13)) return player.N.points.add(1).log(10).add(1).log(10).add(1).log(10).add(1).log(10).add(1).times(1.15).pow(2)
       else  if(hasMilestone('IP',4.4e12)) return player.N.points.add(1).log(10).add(1).log(10).add(1).log(10).add(1).log(10).add(1).times(1.15)
        else return player.N.points.add(1).log(10).add(1).log(10).add(1).log(10).add(1).log(10).add(1).log(10).add(1)},
        canAfford(){
            if(inChallenge('UF',21)) return new Decimal(10).lt(0)
             },
unlocked(){
    return hasUpgrade("UF", 23)
},
},
25: {
    title: "0",
    description: "Point boost themselves.",
    cost: new Decimal("e8.448e16"),
    currencyDisplayName: "Numbers",
    currencyInternalName:"points",
    currencyLayer:"N",
    effectDisplay() { return "^ "+format(upgradeEffect(this.layer, this.id)) },
    effect() { 
        if(hasMilestone('MS',11000))  return player.points.add(1).log(4).add(1).log(4).add(1).log(4).add(1).log(4).add(1).pow(3.1)
        else if(hasMilestone('E',1e52))  return player.points.add(1).log(5).add(1).log(5).add(1).log(5).add(1).log(5).add(1).pow(3)
        else if(hasMilestone('E',1e24)) return player.points.add(1).log(10).add(1).log(10).add(1).log(10).add(1).log(10).add(1).pow(3)
       else  if(hasUpgrade('E',13)) return player.points.add(1).log(10).add(1).log(10).add(1).log(10).add(1).log(10).add(1).pow(2)
        else return player.points.add(1).log(10).add(1).log(10).add(1).log(10).add(1).log(10).add(1)},
        canAfford(){
            if(inChallenge('UF',21)) return new Decimal(10).lt(0)
             },
unlocked(){
    return hasUpgrade("UF", 23)
},
},
31: {
    title: "+",
    description: "Unlock more challenge selector.",
    cost: new Decimal("e1.35e19"),
    currencyDisplayName: "Numbers",
    currencyInternalName:"points",
    currencyLayer:"N",
    
    canAfford(){
        if(inChallenge('UF',21)) return new Decimal(10).lt(0)
         },
unlocked(){
    return hasChallenge("NN", 32)
},
},
32: {
    title: "-",
    description: "Unlock milestone and buyable, rename this layer to Feature factor.",
    cost: new Decimal("e3.36e20"),
    currencyDisplayName: "Numbers",
    currencyInternalName:"points",
    currencyLayer:"N",
    canAfford(){
        if(inChallenge('UF',21)) return new Decimal(10).lt(0)
         },
 
    unlocked(){
        return hasMilestone("E",1000000 )
    },
},
33: {
    title: "x",
    description: "Unlock generators cheaper and generators booster ",
    cost: new Decimal("e7.117e24"),
    currencyDisplayName: "Numbers",
    currencyInternalName:"points",
    currencyLayer:"N",
    canAfford(){
        if(inChallenge('UF',21)) return new Decimal(10).lt(0)
         },
 
    unlocked(){
        return hasMilestone("E",1e52 )
    },
},
34: {
    title: "/",
    description: "Number boost z gain. ",
    cost: new Decimal("e5.555e25"),
    currencyDisplayName: "Numbers",
    currencyInternalName:"points",
    currencyLayer:"N",
    
    canAfford(){
        if(inChallenge('UF',21)) return new Decimal(10).lt(0)
         },
    unlocked(){
        return hasMilestone("MS",700 )
    },
},
35: {
    title: "^",
    description: "Ordinal boost point gain.",
    cost: new Decimal("e2e28"),
    currencyDisplayName: "Numbers",
    currencyInternalName:"points",
    currencyLayer :"N",
    canAfford(){
        if(inChallenge('UF',21)) return new Decimal(10).lt(0)
         },
 
    unlocked(){
        return hasUpgrade("MS",42 )
    },
},
41: {
    title: "-1",
    description: "Dev speed boost Number gain and MS boost game speed.",
    cost: new Decimal("e4.20e42"),
    currencyDisplayName: "Numbers",
    currencyInternalName:"points",
    currencyLayer :"N",
    canAfford(){
        if(inChallenge('UF',21)) return new Decimal(10).lt(0)
         },
 
    unlocked(){
        return challengeCompletions("UF",21)>3
    },
},
42: {
    title: "-2",
    description: "Dev speed boost Point gain.",
    cost: new Decimal("e2.4e43"),
    currencyDisplayName: "Numbers",
    currencyInternalName:"points",
    currencyLayer :"N",
   
    canAfford(){
        if(inChallenge('UF',21)) return new Decimal(10).lt(0)
         },
    unlocked(){
        return challengeCompletions("UF",21)>3
    },
},
43: {
    title: "-3",
    description: "Unlock tickspeed (In E layer)",
    cost: new Decimal("e3.1415926e44"),
    currencyDisplayName: "Numbers",
    currencyInternalName:"points",
    currencyLayer :"N",
   
    canAfford(){
        if(inChallenge('UF',21)) return new Decimal(10).lt(0)
         },
    unlocked(){
        return challengeCompletions("UF",21)>3
    },
},
        71: {
            title: "Factor alpha",
            description: "Factor alpha effect is better",
            cost: new Decimal("1.15e11"),
            currencyDisplayName: "Factors",
            currencyInternalName:"points",
            currencyLayer:"F",
            unlocked(){
                return hasChallenge("NN", 31)
            },
            canAfford(){
                if(inChallenge('UF',21)) return new Decimal(10).lt(0)
                 },
        },
        72: {
            title: "Factor beta",
            description: "Factor beta effect is better",
            cost: new Decimal("3.7e11"),
            currencyDisplayName: "Factors",
            currencyInternalName:"points",
            currencyLayer:"F",
            unlocked(){
                return hasChallenge("NN", 31)
            },
            canAfford(){
                if(inChallenge('UF',21)) return new Decimal(10).lt(0)
                 },
        },
        73: {
            title: "Factor Gamma",
            description: "Factor Gamma effect is better",
            cost: new Decimal("4e11"),
            currencyDisplayName: "Factors",
            currencyInternalName:"points",
            currencyLayer:"F",
            unlocked(){
                return hasChallenge("NN", 31)
            },
            canAfford(){
                if(inChallenge('UF',21)) return new Decimal(10).lt(0)
                 },

        },
        74: {
            title: "Factor Delta",
            description: "Boost '3'",
            cost: new Decimal("1.446e12"),
            currencyDisplayName: "Factors",
            currencyInternalName:"points",
            currencyLayer:"F",
            unlocked(){
                return hasUpgrade("UF", 14)
            },
            canAfford(){
                if(inChallenge('UF',21)) return new Decimal(10).lt(0)
                 },
        },
        75: {
            title: "Factor Epsilon",
            description: "Factor Epsilon effect is better",
            cost: new Decimal("2.55e12"),
            currencyDisplayName: "Factors",
            currencyInternalName:"points",
            currencyLayer:"F",
            unlocked(){
                return hasUpgrade("UF", 14)
            },
            canAfford(){
                if(inChallenge('UF',21)) return new Decimal(10).lt(0)
                 },
        },
        81: {
            title: "Factor Omega",
            description: "Factor are cheaper.",
            cost: new Decimal("1e20"),
            currencyDisplayName: "Factors",
            currencyInternalName:"points",
            currencyLayer:"F",
            unlocked(){
                return hasMilestone("E",1000000 )
            },
            canAfford(){
                if(inChallenge('UF',21)) return new Decimal(10).lt(0)
                 },
        },
        91: {
            title: "Easter egg 1",
            description: "EP boost CP gain.",
            cost: new Decimal("e2.82e15"),
            currencyDisplayName: "Infinity points",
            currencyInternalName:"points",
            currencyLayer:"IP",
            unlocked(){
                return hasMilestone("M",1)
            },
            canAfford(){
                if(inChallenge('UF',21)) return new Decimal(10).lt(0)
                 },
        },
        92: {
            title: "Easter egg 2",
            description: "The first challenge selector is easier. ",
            cost: new Decimal("e3.02e15"),
            currencyDisplayName: "Infinity points",
            currencyInternalName:"points",
            currencyLayer:"IP",
            unlocked(){
                return hasMilestone("M",1)
            },
            canAfford(){
                if(inChallenge('UF',21)) return new Decimal(10).lt(0)
                 },
        },
        93: {
            title: "Easter egg 3",
            description: "CP boost Number gain. ",
            cost: new Decimal("e3.82e15"),
            currencyDisplayName: "Infinity points",
            currencyInternalName:"points",
            currencyLayer:"IP",
            unlocked(){
                return hasMilestone("M",1)
            },
            canAfford(){
                if(inChallenge('UF',21)) return new Decimal(10).lt(0)
                 },
        },
        94: {
            title: "Easter egg 4",
            description: "Unlock a ordinal challenge. ",
            cost: new Decimal("e1.5e23"),
            currencyDisplayName: "Infinity points",
            currencyInternalName:"points",
            currencyLayer:"IP",
            unlocked(){
                return hasMilestone("M",1)
            },
            canAfford(){
                if(inChallenge('UF',21)) return new Decimal(10).lt(0)
                 },
        },
        95: {
            title: "Easter egg 5",
            description: "Boost Ordinal effect. Ordinal boost CP gain.",
            cost: new Decimal("ee24"),
            currencyDisplayName: "Infinity points",
            currencyInternalName:"points",
            currencyLayer:"IP",
            unlocked(){
                return hasMilestone("M",1)
            },
            canAfford(){
                if(inChallenge('UF',21)) return new Decimal(10).lt(0)
                 },
        },
        101: {
            title: "Easter egg 6",
            description: "Boost Ordinal gain based on Mathematician. Mathematician boost game speed. ",
            cost: new Decimal("e3e30"),
            currencyDisplayName: "Infinity points",
            currencyInternalName:"points",
            currencyLayer:"IP",
            unlocked(){
                return hasMilestone("M",1)
            },
            canAfford(){
                if(inChallenge('UF',21)) return new Decimal(10).lt(0)
                 },
        },
        102: {
            title: "Easter egg 7",
            description: "Unlock multiple in MS layer.",
            cost: new Decimal("e7.5e32"),
            currencyDisplayName: "Infinity points",
            currencyInternalName:"points",
            currencyLayer:"IP",
            unlocked(){
                return hasMilestone("M",1)
            },
            canAfford(){
                if(inChallenge('UF',21)) return new Decimal(10).lt(0)
                 },
        },
        103: {
            title: "Easter egg 8",
            description: "Factor are cheaper.",
            cost: new Decimal("e1.8e38"),
            currencyDisplayName: "Infinity points",
            currencyInternalName:"points",
            currencyLayer:"IP",
           
            canAfford(){
                if(inChallenge('UF',21)) return new Decimal(10).lt(0)
                 },
            unlocked(){
                return challengeCompletions("UF",21)>3
            },
        },
        1001: {
            title: "Upgraded upgrade",
            description: "Mastered '2', '3' and '4' used a greater effect.",
            cost: new Decimal("100"),
            currencyDisplayName: "Upgrade points",
            currencyInternalName:"UP",
            currencyLayer:"UF",
            unlocked(){
                return hasChallenge("UF",222)
            },
        }, 
        1002: {
            title: "Lots of master",
            description: "Unlock more master upgrade and you can mastered 1 more upgrade.",
            cost: new Decimal("314"),
            currencyDisplayName: "Upgrade points",
            currencyInternalName:"UP",
            currencyLayer:"UF",
            unlocked(){
                return hasUpgrade("UF",1001)
            },
        }, 
        1003: {
            title: "Automation",
            description: "Gain 100% of Negative Number on reset per second and Negative Number boost Number gain.",
            cost: new Decimal("800"),
            currencyDisplayName: "Upgrade points",
            currencyInternalName:"UP",
            currencyLayer:"UF",
            unlocked(){
                return hasUpgrade("UF",1002)
            },
        }, 
        1004: {
            title: "Useful",
            description: "Upgrade point boost Number gain.",
            cost: new Decimal("2400"),
            currencyDisplayName: "Upgrade points",
            currencyInternalName:"UP",
            currencyLayer:"UF",
            unlocked(){
                return hasUpgrade("UF",1003)
            },
        }, 
},

update(diff){
    if(hasMilestone('Z',1))player.UF.milestones=[1,6,10,11,14,16,35,52,128]
    let mp = new Decimal(0)
    let mpgain = new Decimal(buyableEffect('UF',11))
    let cost1  = new Decimal("ee20")
    let base1  = new Decimal("2")
    let CPgain= new Decimal("0")
    let CPgainstart = new Decimal("1e46")
    let CPgainbase = new Decimal("10")
    let UPgain= new Decimal("0")
    let UPgainstart = new Decimal("1e33")
    let UPgainbase = new Decimal("10")
    let bestN= new Decimal("0")
    let bestN2= new Decimal("0")
   player.UF.mp=player.UF.mp.plus(mpgain.times(diff))

   if(inChallenge('UF',222)&&player.N.points.gte(bestN2)) bestN2=player.N.points
   if(bestN2.gte(UPgainstart)) UPgain=bestN2.div(UPgainstart).times(10).log(UPgainbase)
player.UF.UP=player.UF.UP.add(UPgain.times(diff))
player.UF.UPgain=UPgain

if(inChallenge('UF',122)&&player.N.points.gte(bestN)) bestN=player.N.points
if(bestN.gte(CPgainstart)) CPgain=bestN.div(CPgainstart).times(10).log(CPgainbase)
player.UF.CP=player.UF.CP.add(CPgain.times(diff))
player.UF.CPgain=CPgain

   if(hasUpgrade('UF',33))  player.UF.cost1 = new Decimal("ee20").pow(new Decimal(1).div(player.E.points.add(1).log(10).add(1).log(10).add(1).times(2).pow(1.25)).pow(new Decimal(1).div(buyableEffect('UF',21))))
   else if(hasMilestone('MS',600))  player.UF.cost1 = new Decimal("ee20").pow(new Decimal(1).div(player.E.points.add(1).log(10).add(1).log(10).add(1).times(2).pow(1.25)))
   else if(hasMilestone('UF',585555)) player.UF.cost1 = new Decimal("ee20").pow(new Decimal(1).div(player.E.points.add(1).log(10).add(1).log(10).add(1)))
   else if( hasMilestone('E',2e7)) player.UF.cost1 = new Decimal("ee20").pow(new Decimal(1).div(player.E.points.add(1).log(10).add(1).log(10).add(1).log(10).add(1)))
   if(hasUpgrade('UF',33)) player.UF.base1= new Decimal("2").times((player.E.points.add(1).log(5).add(1).log(5).add(1))).pow(buyableEffect('UF',31))
  else  if(hasMilestone('UF',585555)) player.UF.base1= new Decimal("2").times((player.E.points.add(1).log(5).add(1).log(5).add(1)))
   else if(hasMilestone('UF',5500)) player.UF.base1= new Decimal("2").times((player.E.points.add(1).log(10).add(1).log(10).add(1)))
   if ((hasMilestone('UF',56000))&&player.UF.mp.gte((buyableEffect('UF',11).times(10)))) player.UF.mp =(buyableEffect('UF',11)).times(10)
   if(player.UF.mp.gte((buyableEffect('UF',11).times(50)))) player.UF.mp =(buyableEffect('UF',11)).times(50)
   player.UF.cost2 = new Decimal("e8e23")
   player.UF.base2= new Decimal("0.95")
   player.UF.cost3 = new Decimal("e8e23")
   player.UF.base3= new Decimal("1.05")

},
clickables:{
    102:{
        display() {return "Explore A New Challenge.<br>Req: Reach 1e330 Numbers in No upgrade factor."},
        canClick(){return player.N.points.gte("1e330")&&inChallenge('F',12)},
        onClick(){
         
            player.UF.canup2=new Decimal(1) 
        },
        unlocked(){return hasUpgrade('N',34)&&!player.UF.canup2.gte(1)&&player.UF.page==1},
        style() { return {
            "font-size": "15px",
            "height": "300px",
            "width": "300px"
            }
        
        }
    },
    111:{
        display() {return "Explore A New Challenge.<br>Req: Reach 1e40 Numbers in root factor."},
        canClick(){return player.N.points.gte("1e40")&&inChallenge('F',43)},
        onClick(){
         
            player.UF.canup3=new Decimal(1) 
        },
        unlocked(){return hasUpgrade('N',34)&&!player.UF.canup3.gte(1)&&player.UF.page==1},
        style() { return {
            "font-size": "15px",
            "height": "300px",
            "width": "300px"
            }
        
        }
    },
    112:{
        display() {return "Explore A New Challenge.<br>Req: Reach 1e314 Numbers in No factor factor."},
        canClick(){return  player.N.points.gte("1e314")&&inChallenge('F',22)},
        onClick(){
         
            player.UF.canup4=new Decimal(1) 
        },
        unlocked(){return hasUpgrade('N',34)&&!player.UF.canup4.gte(1)&&player.UF.page==1},
        style() { return {
            "font-size": "15px",
            "height": "300px",
            "width": "300px"
            }
        
        }
    },
    121:{
        display() {return "Explore A New Challenge.<br>Req: 500 Factors."},
        canClick(){return player.F.points.gte(500)&&player.UF.page==1},
        onClick(){
         
            player.UF.canup5=new Decimal(1) 
        },
        unlocked(){return hasUpgrade('N',34)&&!player.UF.canup5.gte(1)},
        style() { return {
            "font-size": "15px",
            "height": "300px",
            "width": "300px"
            }
        
        }
    },

    122:{
        display() {return "Explore A New Challenge.<br>Req: Complete 5 upgrader."},
        canClick(){return hasChallenge('UF',101)&&hasChallenge('UF',102)&&hasChallenge('UF',102)&&hasChallenge('UF',111)&&hasChallenge('UF',112)&&hasChallenge('UF',121)&&player.UF.page==1},
        onClick(){
         
            player.UF.canup6=new Decimal(1) 
        },
        unlocked(){return hasUpgrade('N',34)&&!player.UF.canup6.gte(1)},
        style() { return {
            "font-size": "15px",
            "height": "300px",
            "width": "300px"
            }
        
        }
    },   
    201:{
        display() {return "Explore A New Challenge.<br>Req: Gain 1.5 chllenge point per second."},
        canClick(){return player.N.points.gte("3.16e46")&&inChallenge('UF',122)},
        onClick(){
         
            player.UF.canupa=new Decimal(1) 
        },
        unlocked(){return hasMilestone('I',3)&&!player.UF.canupa.gte(1)&&player.UF.page==2},
        style() { return {
            "font-size": "15px",
            "height": "300px",
            "width": "300px"
            }
        
        }
    },
    202:{
        display() {return "Explore A New Challenge.<br>Req: Gain 1e730 Number in no factor factor."},
        canClick(){return player.N.points.gte("1e730")&&inChallenge('F',22)},
        onClick(){
         
            player.UF.canupb=new Decimal(1) 
        },
        unlocked(){return hasMilestone('I',3)&&!player.UF.canupb.gte(1)&&player.UF.page==2},
        style() { return {
            "font-size": "15px",
            "height": "300px",
            "width": "300px"
            }
        
        }
    },
    211:{
        display() {return "Explore A New Challenge.<br>Req: 1e10 Negative Number."},
        canClick(){return player.NN.points.gte("1e10")},
        onClick(){
         
            player.UF.canupg=true
        },
        unlocked(){return hasMilestone('I',5)&&!player.UF.canupg&&player.UF.page==2},
        style() { return {
            "font-size": "15px",
            "height": "300px",
            "width": "300px"
            }
        
        }
    },
    212:{
        display() {return "Explore A New Challenge.<br>Req: Gain 1e1290 Number in Upgrader 1."},
        canClick(){return player.N.points.gte("1e1290")&&inChallenge('UF',101)},
        onClick(){
         
            player.UF.canupd=true
        },
        unlocked(){return hasMilestone('I',5)&&!player.UF.canupd&&player.UF.page==2},
        style() { return {
            "font-size": "15px",
            "height": "300px",
            "width": "300px"
            }
        
        }
    },
    221:{
        display() {return "Explore A New Challenge.<br>Req: Gain 1e160 Number in meta upgrader."},
        canClick(){return player.N.points.gte("1e160")&&inChallenge('UF',122)},
        onClick(){
         
            player.UF.canupe=true
        },
        unlocked(){return hasMilestone('I',5)&&!player.UF.canupe&&player.UF.page==2},
        style() { return {
            "font-size": "15px",
            "height": "300px",
            "width": "300px"
            }
        
        }
    },  
    222:{
        display() {return "Explore A New Challenge.<br>Req: Gain 1.8e308 Number in meta upgrader."},
        canClick(){return player.N.points.gte("1.8e308")&&inChallenge('UF',122)},
        onClick(){
         
            player.UF.canupm=true
        },
        unlocked(){return hasMilestone('I',5)&&!player.UF.canupm&&player.UF.page==2},
        style() { return {
            "font-size": "15px",
            "height": "300px",
            "width": "300px"
            }
        
        }
    },
    301:{
        display() {return "Explore A New Challenge.<br>Req: 20000 factor point."},
        canClick(){return player.FS.pfp.gte("20000")},
        onClick(){
         
            player.UF.canupm1=true
        },
        unlocked(){return hasMilestone('FS',2)&&!player.UF.canupm1&&player.UF.page==3},
        style() { return {
            "font-size": "15px",
            "height": "300px",
            "width": "300px"
            }
        
        }
    },
    302:{
        display() {return "Explore A New Challenge.<br>Req: 6e7 factor point."},
        canClick(){return player.FS.pfp.gte("6e7")},
        onClick(){
         
            player.UF.canupm2=true
        },
        unlocked(){return hasMilestone('FS',2)&&!player.UF.canupm2&&player.UF.page==3},
        style() { return {
            "font-size": "15px",
            "height": "300px",
            "width": "300px"
            }
        
        }
    },
    10001:{
        display() {return "<"},
        canClick(){return player.UF.page.gte(2)},
        onClick(){
            player.UF.page= player.UF.page.minus(1)
        },
        unlocked(){return hasMilestone('I',3)},     
    },
    10002:{
        display() {return ">"},
        canClick(){
            if(hasMilestone("FS",2)) return !player.UF.page.gte(3)
            return !player.UF.page.gte(2)
        },
        onClick(){
            player.UF.page= player.UF.page.add(1)
        },
        unlocked(){return hasMilestone('I',3)},     
    },
    
},
tabFormat: {
    "Milestones":{
        unlocked(){return !hasChallenge('NN',31)},
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
  "Challenges":{
    unlocked(){return hasUpgrade('F',22)&&(!inChallenge("NN", 12)&&!hasChallenge("NN", 12))&&!player.X.points.gte(1)},
    content:[
      "main-display",
      "blank",
    ["prestige-button",function(){return ""}],
      "blank",
      "blank",
      "challenges",
    ]
  },
  "challenges":{
    unlocked(){return (hasUpgrade('N',23)&&player.X.points.gte(1))},
    content:[
      "main-display",
      "blank",
    ["prestige-button",function(){return ""}],
      "blank",
      "blank",
      ["microtabs", "B"]
    ]
  },
  "Upgrade power":{
    unlocked(){return hasChallenge("NN",31)},
    content:[
      "main-display",
      "blank",
    ["prestige-button",function(){return ""}],
      "blank",
      "blank",
      ["microtabs", "A"]
    ],
},
    "Buyables":{
        unlocked(){return hasUpgrade("UF",32)},
        content:[
          "main-display",
          "blank",
        ["prestige-button",function(){return ""}],
          "blank",
          "blank",
          "buyables",
        ]
  },
  "milestones":{
    unlocked(){return hasUpgrade("UF",32)},
  content:[
"main-display",
  "blank",
["prestige-button",function(){return ""}],
"blank",
"resource-display",
"blank",
"blank",
["display-text",function(){
    let s=""
 
   if(hasUpgrade('UF',32)) return  s+="You have "+format(player.UF.mp)+" Milestone point.<br>You are gaining "+format(buyableEffect('UF',11))+" Milestone point per second.<br>"


    return s
  }],
"milestones",
  ]},
  "Mastery":{
    unlocked(){return hasMilestone('UF',1e26)},
    content:[
      "main-display",
      "blank",
    ["prestige-button",function(){return ""}],
      "blank",
      "blank",
      "challenges",
    ]
  },
  "Feature point":{
    unlocked(){return hasMilestone('I',3)&&player.X.points.gte(1)},
    content:[
  "main-display",
    "blank",
  ["prestige-button",function(){return ""}],
  "blank",
  "resource-display",
  "blank",
  ["display-text",function(){

    let s = ""
    s+="You are gaining " + format(player.UF.CPgain) + " Challenge point per second (based on current Number in Meta upgrader.)<br>" 
    s+="You have " + format(player.UF.CP) + " Challenge point, which make second page challenge req ^" + format(new Decimal(1).div(player.UF.CP.add(5).log(5).pow(0.15)))+"<br><br><br>" 
    if(hasChallenge("UF",222)){
    s+="You are gaining " + format(player.UF.UPgain) + " Upgrade point per second (based on current Number in Meta upgrader+.)<br>" 
    s+="You have " + format(player.UF.UP) + " Upgrade point.<br>" 
    }
    return s
  }],
  ["row", [ ["upgrade",1001], ["upgrade",1002], ["upgrade",1003], ["upgrade",1004], ["upgrade",1005]]],
  "blank",

    ]},

},
microtabs: {
    "A": {
            "Number": {
                    content: [
                           ["row",[ ["upgrade",11], ["upgrade",12], ["upgrade",13], ["upgrade",14], ["upgrade",15]]],
                           ["row",[ ["upgrade",21], ["upgrade",22], ["upgrade",23], ["upgrade",24], ["upgrade",25]]],
                           ["row",[ ["upgrade",31], ["upgrade",32], ["upgrade",33], ["upgrade",34], ["upgrade",35]]],
                           ["row",[ ["upgrade",41], ["upgrade",42], ["upgrade",43], ["upgrade",44], ["upgrade",45]]]
                        ],
                    unlocked(){
                            return true
                    },
            },
            "Factor": {
                content: [
                    ["row", [ ["upgrade",71], ["upgrade",72], ["upgrade",73], ["upgrade",74], ["upgrade",75]]],
                    ["row", [ ["upgrade",81]]]
                ],
                unlocked(){
                        return true
                },
        },
        "Infinity point": {
            content: [
                ["row", [ ["upgrade",91], ["upgrade",92], ["upgrade",93], ["upgrade",94], ["upgrade",95]]],
                ["row", [ ["upgrade",101], ["upgrade",102], ["upgrade",103], ["upgrade",104], ["upgrade",105]]],
               
            ],
            unlocked(){
                    return hasMilestone('M',1)
            },
    },
          
    },
    "B": {
        "Normal challenge": {
                content: [
                       ["row",[ ["challenge",11], ["challenge",12],]],
                    
                    ],
                unlocked(){
                        return player.X.points.gte(1)
                },
        },
        "Upgrade challenge": {
            content: [
                ["row",[["challenge",101], ["clickable",102],["challenge",102],]],
                ["row",[["challenge",111], ["clickable",111],["challenge",112],["clickable",112],]],
                ["row",[["challenge",121], ["clickable",121],["challenge",122], ["clickable",122],]],
                ["row",[["challenge",201], ["clickable",201],["challenge",202], ["clickable",202],]],
                ["row",[["challenge",211], ["clickable",211],["challenge",212], ["clickable",212],]],
                ["row",[["challenge",221], ["clickable",221],["challenge",222], ["clickable",222],]],
                ["row",[["challenge",301], ["clickable",301],["challenge",302], ["clickable",302],]],
                ["row",[["clickable",10001],"blank",["clickable",10002]]],

            ],
            unlocked(){
                    return player.X.points.gte(1)
            },
    },
  
      
},
},
  canBuyMax(){
    return hasUpgrade('F',41) 
  },
  layerShown(){return ((hasChallenge('F',22)||hasMilestone('IP',1)||hasMilestone('FS',1)||hasMilestone('UF',1)||hasMilestone('I',1))&&!inChallenge('NN',31))&&!hasUpgrade('E',22)&&!hasMilestone("FS",5)},
})