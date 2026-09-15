addLayer("FS", {
    name: "Factor shift", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "FS", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        pfp: new Decimal(0),
        pfpgain: new Decimal(0),
        product:new Decimal(0),
    }},
    color: "#966400",
    requires(){
        if(player.X.points.gte(1))    return new Decimal(11161)
       else return new Decimal(100000000)} ,
    resource(){return "Factor shift"}, 
    baseResource: "Factors", // Name of resource prestige is based on
    baseAmount() {return player.F.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    base(){
        if(player.X.points.gte(1))    return new Decimal(1.353)
        if(inChallenge('E',31)||hasUpgrade('E',22))return new Decimal("eeeeeeeeee10")
       else return 1000},
    exponent(){
        if(player.FS.points>=4&&!player.X.points.gte(1)) return 2.5
        else if(player.FS.points>=3&&!player.X.points.gte(1)) return 1.5
        else return 1
    },
    branches:["F"],
     // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let mult=new Decimal(1) 
        if (hasUpgrade('F',51)) mult = mult.times(2)
        return mult
    },
    resetsNothing(){
        if(player.X.points.gte(1))  return hasMilestone('FS',1)  
        return hasMilestone('MS',1);
    },autoPrestige(){
        return hasMilestone('MS',40);
    },
    hotkeys: [
        {key: "F", description: "Shift + F: Reset for Factor shift", onPress(){if (canReset(this.layer)) doReset(this.layer)},
        onPress() { if (player.FS.unlocked) doReset("FS") },
        unlocked() {return hasMilestone('I', 1)} // Determines if you can use the hotkey, optional
    },
    ],
    row: 2, // Row the layer is in on the tree (0 is the first row)
    milestones: {
        1: {
            requirementDescription: "1 Factor shift",
            effectDescription() {
              if(player.X.points.gte(1))    return "Factor shift reset nothing and per factor shift (up to 5) unlock a prime factor."
              else  return "Per factor shift make factor cheaper."},
            done() { return player.FS.points.gte(1) }
        },
        2: {
            requirementDescription: "2 Factor shift",
            effectDescription() {return "Unlock new upgrade challenge."},
            done() { return player.FS.points.gte(2)&&player.X.points.gte(1)},
            unlocked() { return player.X.points.gte(1)}
        },
        3: {
          requirementDescription: "6 Factor shift",
          effectDescription() {return "Unlock new Infinity challenge."},
          done() { return player.FS.points.gte(6)&&player.X.points.gte(1)},
          unlocked() { return player.X.points.gte(1)}
      },
      4: {
        requirementDescription: "9 Factor shift",
        effectDescription() {return "Unlock a new prime factor, keep challenge point and upgrade point on reset."},
        done() { return player.FS.points.gte(9)&&player.X.points.gte(1)},
        unlocked() { return player.X.points.gte(1)}
    },
    5: {
      requirementDescription: "1e105 prime factor point",
      effectDescription() {return "Number gain ^1.14. However, remove upgrade factor layer (You can't get UF, but their challenge and upgrade won't reset.)"},
      done() { return player.FS.pfp.gte(1e105)&&player.X.points.gte(1)},
      unlocked() { return player.X.points.gte(1)},
      onComplete(){
        player.UF.points=new Decimal(0)
        player.UF.FP=new Decimal(0)
        player.UF.CP=new Decimal(0)
        player.UF.activechallenge=null
        doReset("I",true)
      }
  },
    },
    layerShown(){return ((hasMilestone('NN',1e50)||hasMilestone('IP',1)||hasMilestone('FS',1))&&!hasUpgrade('E',22))||(player.F.points.gte(11161)&&player.X.points.gte(1))},
    buyables: {
        rows: 2,
        cols: 3,
        11: {
            title: "2",
            display() {
               return "Give " + format(tmp.FS.buyables[11].effect) + " two factor <br>Cost : " + format(tmp.FS.buyables[11].cost) + " Factors"
            },
            unlocked() { return player.X.points.gte(1)&&player.FS.points.gte(1) },
            canAfford() { 
              return player.F.points.gte(tmp.FS.buyables[11].cost) 
            },
            cost(){
            return  new Decimal("1e4").times(getBuyableAmount((this.layer), (this.id)).pow(getBuyableAmount((this.layer), (this.id)).times(0.1)))
            },
            buy() { 
                {
                   player.F.points = player.F.points.minus(tmp.FS.buyables[11].cost)
                }
                setBuyableAmount("FS", 11, getBuyableAmount("FS", 11).add(1))
            },
            effect() { 

              return new Decimal(2).pow(getBuyableAmount("FS", 11))
                
               
                
            }
        },
        12: {
            title: "3",
            display() {
               return "Give " + format(tmp.FS.buyables[12].effect) + " three factor <br>Cost : " + format(tmp.FS.buyables[12].cost) + " Factors"
            },
            unlocked() { return player.X.points.gte(1)&&player.FS.points.gte(2) },
            canAfford() { 
              return player.F.points.gte(tmp.FS.buyables[12].cost) 
            },
            cost(){
            return  new Decimal("1.5e4").times(getBuyableAmount((this.layer), (this.id)).pow(getBuyableAmount((this.layer), (this.id)).times(0.125)))
            },
            buy() { 
                {
                   player.F.points = player.F.points.minus(tmp.FS.buyables[12].cost)
                }
                setBuyableAmount("FS", 12, getBuyableAmount("FS", 12).add(1))
            },
            effect() { 

              return new Decimal(3).pow(getBuyableAmount("FS", 12))
                
               
                
            }
        },
        13: {
            title: "5",
            display() {
               return "Give " + format(tmp.FS.buyables[13].effect) + " five factor <br>Cost : " + format(tmp.FS.buyables[13].cost) + " Factors"
            },
            unlocked() { return player.X.points.gte(1)&&player.FS.points.gte(3) },
            canAfford() { 
              return player.F.points.gte(tmp.FS.buyables[13].cost) 
            },
            cost(){
            return  new Decimal("2e4").times(getBuyableAmount((this.layer), (this.id)).pow(getBuyableAmount((this.layer), (this.id)).times(0.125)))
            },
            buy() { 
                {
                   player.F.points = player.F.points.minus(tmp.FS.buyables[13].cost)
                }
                setBuyableAmount("FS", 13, getBuyableAmount("FS", 13).add(1))
            },
            effect() { 

              return new Decimal(5).pow(getBuyableAmount("FS", 13))
                
               
                
            }
        },
        21: {
            title: "7",
            display() {
               return "Give " + format(tmp.FS.buyables[21].effect) + " seven factor <br>Cost : " + format(tmp.FS.buyables[21].cost) + " Factors"
            },
            unlocked() { return player.X.points.gte(1)&&player.FS.points.gte(4) },
            canAfford() { 
              return player.F.points.gte(tmp.FS.buyables[21].cost) 
            },
            cost(){
            return  new Decimal("2.5e4").times(getBuyableAmount((this.layer), (this.id)).pow(getBuyableAmount((this.layer), (this.id)).times(0.14)))
            },
            buy() { 
                {
                   player.F.points = player.F.points.minus(tmp.FS.buyables[21].cost)
                }
                setBuyableAmount("FS", 21, getBuyableAmount("FS", 21).add(1))
            },
            effect() { 

              return new Decimal(7).pow(getBuyableAmount("FS", 21))
                
               
                
            }
        },
        22: {
          title: "11",
          display() {
             return "Give " + format(tmp.FS.buyables[22].effect) + " eleven factor <br>Cost : " + format(tmp.FS.buyables[22].cost) + " Factors"
          },
          unlocked() { return player.X.points.gte(1)&&player.FS.points.gte(5) },
          canAfford() { 
            return player.F.points.gte(tmp.FS.buyables[22].cost) 
          },
          cost(){
          return  new Decimal("3.75e4").times(getBuyableAmount((this.layer), (this.id)).pow(getBuyableAmount((this.layer), (this.id)).times(0.175)))
          },
          buy() { 
              {
                 player.F.points = player.F.points.minus(tmp.FS.buyables[22].cost)
              }
              setBuyableAmount("FS", 22, getBuyableAmount("FS", 22).add(1))
          },
          effect() { 

            return new Decimal(11).pow(getBuyableAmount("FS", 22))
              
             
              
          }
      },
      23: {
        title: "13",
        display() {
           return "Give " + format(tmp.FS.buyables[23].effect) + " thirteen factor <br>Cost : " + format(tmp.FS.buyables[23].cost) + " Factors"
        },
        unlocked() { return player.X.points.gte(1)&&player.FS.points.gte(9) },
        canAfford() { 
          return player.F.points.gte(tmp.FS.buyables[23].cost) 
        },
        cost(){
        return  new Decimal("1e5").times(getBuyableAmount((this.layer), (this.id)).pow(getBuyableAmount((this.layer), (this.id)).times(0.225)))
        },
        buy() { 
            {
               player.F.points = player.F.points.minus(tmp.FS.buyables[23].cost)
            }
            setBuyableAmount("FS", 23, getBuyableAmount("FS", 23).add(1))
        },
        effect() { 

          return new Decimal(13).pow(getBuyableAmount("FS", 23))
            
           
            
        }
    },
    },
    update(diff){
        let pro=new Decimal(1)
        pro=pro.times(tmp.FS.buyables[11].effect)
        pro=pro.times(tmp.FS.buyables[12].effect)
        pro=pro.times(tmp.FS.buyables[13].effect)
        pro=pro.times(tmp.FS.buyables[21].effect)
       pro=pro.times(tmp.FS.buyables[22].effect)
       pro=pro.times(tmp.FS.buyables[23].effect)
        let mult=new Decimal(1)
       mult=mult.times(new Decimal(1).add(challengeCompletions("I",71)).tetrate(2))
       mult=mult.times(new Decimal(1).add(challengeCompletions("I",72)).tetrate(2.25))
       mult=mult.times(new Decimal(1).add(challengeCompletions("I",81)).tetrate(2.15))
       mult=mult.times(new Decimal(1).add(challengeCompletions("I",82)).tetrate(1.75))
       if(hasMilestone("Z",1))mult=mult.times(10)
        player.FS.product=pro
        player.FS.pfpgain=pro.times(mult)
    if(player.FS.points.gte(1)&&player.X.points.gte(1))   player.FS.pfp= player.FS.pfp.add(pro.times(mult).times(diff)).min(1e120)

    },
    tabFormat:[
      "main-display",
        "blank",
      ["prestige-button",function(){return ""}],
      "blank",
      "resource-display",
      "blank",
      "milestones",
      "blank",
      "buyables",
      ["display-text",function(){
    
        let s = ""
if(player.X.points.gte(1)) s+= "Your prime factor product is "+format(player.FS.product)+", which make you gain "+format(player.FS.pfpgain)+" prime factor point per second.<br>"
if(player.X.points.gte(1)) s+= "Your have "+format(player.FS.pfp)+" prime factor point, which boost factor and number exp by "+format(player.FS.pfp.add(10).log(10).add(9).log(10))+"."
        return s
      }],
    
    ],
    doReset(resettingLayer) {
      let keep = [];
      keep.push("milestones")
      if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
  },
  automateStuff(){
    if(hasMilestone("Z",5)){
        if(layers.FS.buyables[11].canAfford())setBuyableAmount("FS",11,getBuyableAmount("FS",11).add(1))   
      if(layers.FS.buyables[12].canAfford())setBuyableAmount("FS",12,getBuyableAmount("FS",12).add(1)) 
    }
    if(hasMilestone("Z",6)){
      if(layers.FS.buyables[13].canAfford())setBuyableAmount("FS",13,getBuyableAmount("FS",13).add(1))   
    if(layers.FS.buyables[21].canAfford())setBuyableAmount("FS",21,getBuyableAmount("FS",21).add(1)) 
  }
},
})