
addLayer("c", {
    name: "c", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    passiveGeneration() {
      if (hasMilestone("mp", 8)) return (hasMilestone("mp", 8)?1:0)
      },
    effect(){

    },
    effect(){
        return Decimal.pow(10, player[this.layer].total)
        /*
          you should use this.layer instead of <layerID>
          Decimal.pow(num1, num2) is an easier way to do
          num1.pow(num2)
        */
      },
      effect(){
        let e = player[this.layer].total.max("1").pow("2")
        if(e.gt("e5000")){
            if(hasUpgrade("cp",51))e=e.log10().pow(5000).min("ee6")
            if(hasAchievement("a",262))e=e.log10().pow(1360).min("ee6")
        }
        return e
      },
      effectDescription(){

},
effectDescription(){
    let s =  "boosting sacrifice point gain by x" + format(tmp[this.layer].effect) 
    if(this.effect().gt("e1e6")){s=s+" (hardcapped)"}
    else if(this.effect().gt("e5000")){s=s+" (softcapped)"}
    return s
    /*
      use format(num) whenever displaying a number
    */
},
automate() {
    if (hasAchievement('a', 243)) {
        if (layers.c.buyables[11].canAfford()) {
            layers.c.buyables[11].buy();
        };
    };
    if (hasAchievement('a', 243)) {
        if (layers.c.buyables[12].canAfford()) {
            layers.c.buyables[12].buy();
        };
    };
    if (hasAchievement('a', 243)) {
        if (layers.c.buyables[13].canAfford()) {
            layers.c.buyables[13].buy();
        };
    };
},
      buyables: {
        11: {
            title: "Point Buyable 4: The Number",
            unlocked() { return hasUpgrade("scp", 102) },
            cost(x) {
                let exp2 = 1.2
                if (hasUpgrade('scp', 104)) exp2 = 1.125
                if (hasUpgrade('scp', 112)) exp2 = 1.1
                if (hasUpgrade('rp', 12)) exp2 = 1e308
                return new Decimal("1e64000").mul(Decimal.pow(35, x)).mul(Decimal.pow(x , Decimal.pow(exp2 , x))).floor()
            },
            display() {
               if (hasMilestone('le', 4)) return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " Points" + "<br>Bought: " + getBuyableAmount(this.layer, this.id)+'+' + formatWhole(getBuyableAmount(this.layer,12)) + "<br>Effect: Boost Cells by x" + format(buyableEffect(this.layer, this.id))
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " Points" + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Boost Cells by x" + format(buyableEffect(this.layer, this.id))
            },
            canAfford() {
                return player.points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal ("1e64000")
                player.points = player.points.sub(this.cost().div(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let base1 = new Decimal(2)
                let base2 = x
                let expo = new Decimal(1.000)
                let eff = base1.pow(Decimal.pow(base2, expo))
                if (hasMilestone('le',4)){return base1.pow(getBuyableAmount(this.layer,this.id).add(getBuyableAmount(this.layer,12)))}
                else {return base1.pow(getBuyableAmount(this.layer,this.id))}
                return eff
            },
        },
        12: {
          title: "Point Buyable 5: The Sacrificer",
          unlocked() { return hasUpgrade("e", 53) },
          cost(x) {
              let exp2 = 1.1
              if (hasMilestone('sa', 21)) exp2 = 1.05
              if (hasUpgrade('rp', 12)) exp2 = 1e308
              return new Decimal("1e9").mul(Decimal.pow(2, x)).mul(Decimal.pow(x , Decimal.pow(exp2 , x))).floor()
          },
          display() {
            if (hasMilestone('le', 6)) return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " Cells" + "<br>Bought: " + getBuyableAmount(this.layer, this.id)+'+' + formatWhole(getBuyableAmount(this.layer,13)) + "<br>Effect: Boost Sacrifice Points by x" + format(buyableEffect(this.layer, this.id))
             return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " Cells" + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Boost Sacrifice Points by x" + format(buyableEffect(this.layer, this.id))
         },
          canAfford() {
              return player.c.points.gte(this.cost())
          },
          buy() {
              let cost = new Decimal ("1e9")
              player.c.points = player.c.points.sub(this.cost().div(cost))
              setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
          },
          effect(x) {
              let base1 = new Decimal(5)
              let base2 = x
              let expo = new Decimal(1.000)
              let eff = base1.pow(Decimal.pow(base2, expo))
              if (hasMilestone('le',6)){return base1.pow(getBuyableAmount(this.layer,this.id).add(getBuyableAmount(this.layer,13)))}
                else {return base1.pow(getBuyableAmount(this.layer,this.id))}
              return eff
          },
      },
      13: {
        title: "Point Buyable 6: The Sacrificer II",
        unlocked() { return hasUpgrade("scp", 103) },
        cost(x) {
            let exp2 = 1.1
            if (hasMilestone('sa', 21)) exp2 = 1.05
            if (hasUpgrade('le', 53)) exp2 = 1.04
            if (hasUpgrade('rp', 12)) exp2 = 1e308
            return new Decimal("1e12").mul(Decimal.pow(2, x)).mul(Decimal.pow(x , Decimal.pow(exp2 , x))).floor()
        },
        display() {
            return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " Cells" + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Boost Sacrifice Point by x" + format(buyableEffect(this.layer, this.id))
        },
        canAfford() {
            return player.c.points.gte(this.cost())
        },
        buy() {
            let cost = new Decimal ("1e12")
            player.c.points = player.c.points.sub(this.cost().div(cost))
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        effect(x) {
            let base1 = new Decimal(2)
            let base2 = x
            let expo = new Decimal(1.000)
            let eff = base1.pow(Decimal.pow(base2, expo))
            return eff
        },
    },
  },
    tooltip(){
        return "<h3>Cellular</h3><br>" + format(player.c.points) + " Cells"
      },
    color: "green",
    requires: new Decimal("1e100"), // Can be a function that takes requirement increases into account
    resource: "Cells", // Name of prestige currency
    baseResource: "Mega-Points", // Name of resource prestige is based on
    baseAmount() {return player.mp.points}, // Get the current amount of baseResource
    branches: ["e", "scp"],
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1e-308,    
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(2)
        if (hasUpgrade('scp', 95)) mult = mult.times(2)
        if (hasUpgrade('scp', 101)) mult = mult.times(2)
        if (hasUpgrade('scp', 102)) mult = mult.times(3)
        mult = mult.times(buyableEffect('c', 11))
        if (hasUpgrade('scp', 103)) mult = mult.times(6)
        if (hasMilestone('sa', 21)) mult = mult.times(milestoneEffect('sa', 21))
        if (hasMilestone('sa', 22)) mult = mult.pow(1.02)
        if (hasUpgrade('e', 62)) mult = mult.pow(1.05)
        if (hasUpgrade('scp', 105)) mult = mult.times(8)
        if (hasUpgrade('scp', 111)) mult = mult.times(15)
        if (hasUpgrade('scp', 112)) mult = mult.times(10)
        if (hasUpgrade('scp', 113)) mult = mult.times(4)
        if (hasUpgrade('scp', 114)) mult = mult.times(15)
        if (hasUpgrade('tp', 13)) mult = mult.times(50)
if (hasUpgrade('tp', 14)) mult = mult.times(10)
if (hasUpgrade('scp', 115)) mult = mult.times(3)
if (hasUpgrade('scp', 121)) mult = mult.times(4)
if (hasUpgrade('tp', 24)) mult = mult.times(20)
if (hasUpgrade('tp', 25)) mult = mult.times(50)
if (hasUpgrade('tp', 32)) mult = mult.times(20)
if (hasUpgrade('scp', 123)) mult = mult.times(5)
if (hasUpgrade('tp', 34)) mult = mult.times(50)
if (hasUpgrade('scp', 124)) mult = mult.times(2)
if (hasUpgrade('scp', 125)) mult = mult.times(20)
if (hasMilestone('sa', 25)) mult = mult.times(1e24)
if (hasMilestone('le', 1)) mult = mult.times(10)
if (hasUpgrade('le', 12)) mult = mult.times(upgradeEffect('le', 12))
if (hasUpgrade('le', 14)) mult = mult.pow(1.25)
if (hasUpgrade('le', 24)) mult = mult.times(upgradeEffect('le',24))
if (hasUpgrade('le', 25)) mult = mult.times(upgradeEffect('le',25))
if (hasUpgrade('le', 33)) mult = mult.times(upgradeEffect('le',33))
if (hasUpgrade('le', 41)) mult = mult.times(upgradeEffect('le',41))
if (hasUpgrade('le', 43)) mult = mult.times(upgradeEffect('le',43))
if (hasMilestone('st', 1)) mult = mult.times(250)
if (hasMilestone('st', 2)) mult = mult.times(1e11)
if (hasMilestone('st', 4)) mult = mult.times(100)
if (hasMilestone('st', 10)) mult = mult.pow(1.05)
if (hasAchievement('a', 275)) mult = mult.times("1e8")
if (hasUpgrade('le', 73)) mult = mult.times(upgradeEffect('le',73))
if (hasUpgrade('cp', 72)) mult = mult.pow(1.05)
if (hasUpgrade('cp', 82)) mult = mult.pow(1.2)
if (inChallenge('dp', 11)) mult = mult.div(Infinity)
    if (hasUpgrade('rp', 12)) mult = mult.div(Infinity)
return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 5, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "C", description: "C: Reset for Cells", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){if (hasUpgrade("rp", 12)) return false
    else return (hasChallenge("sa", 11) || player[this.layer].unlocked)},})
