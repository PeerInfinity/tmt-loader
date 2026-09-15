
addLayer("l", {
    name: "l", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "L", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    passiveGeneration() {
      if (hasMilestone("mp", 7)) return (hasMilestone("mp", 7)?1:0)
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
        let e = player[this.layer].total.max("1").pow("1")
        if(e.gt("e5000")){
          if(hasUpgrade("cp",73))e=e.log10().pow("e1e10").min("10^^10")
          if(hasUpgrade("cp",51))e=e.log10().pow(5000).min("ee6")
            if(hasAchievement("a",265))e=e.log10().pow(1350).min("ee6")
        }
        return e
      },
      effectDescription(){

},
effectDescription(){
    let s =  "boosting energy gain by x" + format(tmp[this.layer].effect) 
    if(this.effect().gt("9.999e8099")){s=s+" (hardcapped)"}
    else if(this.effect().gt("e5000")){s=s+" (softcapped)"}
    return s
    /*
      use format(num) whenever displaying a number
    */
   
  },
    tooltip(){
        return "<h3>Light</h3><br>" + format(player.l.points) + " Light"
      },
    color: "#DCD9CD",
    requires: new Decimal("1e4000"), // Can be a function that takes requirement increases into account
    resource: "Light", // Name of prestige currency
    baseResource: "Points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    branches: ["e"],
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1e-308,    
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(2)
        if (hasUpgrade('ai', 11)) mult = mult.times(upgradeEffect('ai', 11))
        if (hasUpgrade('e', 11)) mult = mult.times(3)
        if (hasUpgrade('mp', 73)) mult = mult.times(upgradeEffect('mp', 73))
        if (hasUpgrade('mp', 75)) mult = mult.times(upgradeEffect('mp', 75))
        if (hasUpgrade('e', 13)) mult = mult.times(5)
        if (hasUpgrade('e', 14)) mult = mult.times(upgradeEffect('e', 14))
        if (hasUpgrade('sp', 91)) mult = mult.times(5)
        if (hasMilestone('sa', 1)) mult = mult.times("5")
        if (hasMilestone('sa', 2)) mult = mult.times("3")
        if (hasMilestone('sa', 3)) mult = mult.times("2")
        if (hasUpgrade('hp', 83)) mult = mult.times(upgradeEffect('hp',83))
        if (hasUpgrade('hp', 84)) mult = mult.times(upgradeEffect('hp',84))
        if (hasUpgrade('up', 84)) mult = mult.times(upgradeEffect('up',84))
        if (hasMilestone('sa', 4)) mult = mult.times("5")
        if (hasUpgrade('up', 85)) mult = mult.times(upgradeEffect('up',85))
        if (hasMilestone('sa', 5)) mult = mult.times("4")
        if (hasMilestone('sa', 6)) mult = mult.times("25")
        if (hasMilestone('sa', 7)) mult = mult.times("1.5")
        if (hasUpgrade('sp', 94)) mult = mult.times(upgradeEffect('sp',94))
        if (hasUpgrade('up', 92)) mult = mult.times(upgradeEffect('up',92))
        if (hasMilestone('sa', 9)) mult = mult.times("20")
        if (hasUpgrade('up', 93)) mult = mult.times(15)
        if (hasUpgrade('mp', 85)) mult = mult.pow(1.02)
        if (hasMilestone('sa', 10)) mult = mult.times("7.5")
        if (hasUpgrade('scp', 11)) mult = mult.times(2.5)
        if (hasUpgrade('scp', 12)) mult = mult.times(3)
        if (hasUpgrade('scp', 13)) mult = mult.times(3)
        if (hasUpgrade('scp', 14)) mult = mult.times(1.7)
        if (hasUpgrade('scp', 15)) mult = mult.times(1.5)
        if (hasUpgrade('scp', 21)) mult = mult.times(3)
        if (hasUpgrade('scp', 23)) mult = mult.times(3)
        if (hasUpgrade('scp', 24)) mult = mult.times(3)
        if (hasUpgrade('scp', 25)) mult = mult.times(2)
        if (hasUpgrade('scp', 33)) mult = mult.times(1.7)
        if (hasUpgrade('scp', 35)) mult = mult.times(1.5)
        if (hasUpgrade('scp', 41)) mult = mult.times(2)
        if (hasUpgrade('scp', 42)) mult = mult.times(2)
        if (hasUpgrade('e', 34)) mult = mult.times(upgradeEffect('e',34))
        if (hasMilestone('sa', 13)) mult = mult.times("30")
        if (hasUpgrade('scp', 43)) mult = mult.times(2.5)
        if (hasUpgrade('scp', 44)) mult = mult.times(4)
        if (hasUpgrade('scp', 45)) mult = mult.times(1.5)
        if (hasUpgrade('scp', 51)) mult = mult.times(2)
        if (hasUpgrade('scp', 52)) mult = mult.times(1.8)
        if (hasUpgrade('scp', 53)) mult = mult.times(2)
        if (hasUpgrade('scp', 55)) mult = mult.times(30)
        if (hasUpgrade('scp', 62)) mult = mult.times(2.25)
        if (hasUpgrade('scp', 63)) mult = mult.times(10)
        if (hasUpgrade('scp', 64)) mult = mult.times(4)
        if (hasUpgrade('scp', 71)) mult = mult.times(10)
        if (hasUpgrade('scp', 72)) mult = mult.times(50)
        if (hasMilestone('sa', 16)) mult = mult.times("1e9")
        if (hasUpgrade('scp', 81)) mult = mult.times(10)
        if (hasUpgrade('scp', 83)) mult = mult.times(10)
        if (hasUpgrade('scp', 84)) mult = mult.times(10)
        if (hasMilestone('sa', 18)) mult = mult.times("10")
        if (hasUpgrade('scp', 92)) mult = mult.times(3)
        if (hasUpgrade('scp', 93)) mult = mult.times(10)
        if (hasUpgrade('scp', 94)) mult = mult.times(10)
        if (hasUpgrade('e', 51)) mult = mult.times(2300)
        if (inChallenge("sa", 11)) mult = mult.div("10^^308")
        if (hasUpgrade('e', 63)) mult = mult.pow(1.05)
        if (inChallenge("sa", 12)) mult = mult.div("10^^308")
        if (hasChallenge('sa', 12)) mult = mult.times("5")
        if (hasAchievement('a', 225)) mult = mult.times("1e6")
        if (hasUpgrade('le', 13)) mult = mult.pow(1.25)
        mult = mult.times(buyableEffect('le', 12))
        if (hasAchievement('a', 245)) mult = mult.times("10")
        if (hasMilestone('st', 1)) mult = mult.times(250)
        if (hasMilestone('st', 2)) mult = mult.times(1e11)
        if (hasMilestone('st', 10)) mult = mult.pow(1.05)
        if (hasUpgrade('dp', 12)) mult = mult.pow(1.25)
        if (hasUpgrade('le', 73)) mult = mult.times(upgradeEffect('le',73))
        if (hasUpgrade('cp', 72)) mult = mult.pow(1.05)
        if (hasUpgrade('cp', 84)) mult = mult.pow(1.2)
          if (hasUpgrade('rp', 11)) mult = mult.div(Infinity)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    layerShown(){if (hasUpgrade("rp", 11)) return false
    else return (hasUpgrade("mp", 61) || player[this.layer].unlocked)},})
