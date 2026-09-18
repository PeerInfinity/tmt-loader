addLayer("Roots", {
  name: "Roots", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "Ro", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
    }
  },
  color: "#371806",
  branches: ["Energy"],
  requires() {
    return new Decimal("50000")
  }, // Can be a function that takes requirement increases into account
  resource: "Roots", // Name of prestige currency
  baseResource: "Essence", // Name of resource prestige is based on
  baseAmount() {
    return player["Grass"].points
  }, // Get the current amount of baseResource
  type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent() {
    return new Decimal(.5)
  }, // Prestige currency exponent
  gainMult() { // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1)
    return mult
  },
  gainExp() { // Calculate the exponent on main currency from bonuses
    return new Decimal(1)
  },
  effect() {
    let essenceGainIncrease = new Decimal(1)
    essenceGainIncrease = player[this.layer].points.add(1)

    return { // Formulas for any boosts inherent to resources in the layer. Can return a single value instead of an object if there is just one effect
      EssenceGainIncrease: essenceGainIncrease
    }
  },
  getResetGain() {
    if (player["Stream"].points.lt(this.requires())) return decimalZero
    if (player["Grass"].points.lt(this.requires())) return decimalZero

    // Grass Gain
    let ggain = player.Grass.points.div(tmp[this.layer].requires).pow(tmp[this.layer].exponent).times(tmp[this.layer].gainMult).pow(tmp[this.layer].gainExp)
    //softcap
    if (ggain.gte(tmp[this.layer].softcap)) gain = gain.pow(tmp[this.layer].softcapPower).times(tmp[this.layer].softcap.pow(decimalOne.sub(tmp[this.layer].softcapPower)))
    ggain = ggain.times(tmp[this.layer].directMult)

    // Water Gain
    let wgain = player.Stream.points.div(tmp[this.layer].requires).pow(tmp[this.layer].exponent).times(tmp[this.layer].gainMult).pow(tmp[this.layer].gainExp)
    if (wgain.gte(tmp[this.layer].softcap)) gain = gain.pow(tmp[this.layer].softcapPower).times(tmp[this.layer].softcap.pow(decimalOne.sub(tmp[this.layer].softcapPower)))
    wgain = wgain.times(tmp[this.layer].directMult)

    // Make sure its positive and take the lowest between the 2
    return ggain.floor().max(0).min(wgain.floor().max(0));
  },
  getNextAt() {
    if (this.gainMult().lte(0)) return new Decimal(Infinity)
    if (this.gainExp().lte(0)) return new Decimal(Infinity)
    let next = this.getResetGain()
    next = next.add(1).div(this.directMult)
    // softcap
    // if (next.gte(this.softcap())) next = next.div(this.softcap().pow(decimalOne.sub(this.softcapPower()))).pow(decimalOne.div(this.softcapPower()))
    // deals with calculating next at?
    next = next.root(this.gainExp()).div(this.gainMult()).root(this.exponent()).times(this.requires()).max(this.requires())
    // if cost gets rounded up
    // if (this.roundUpCost()) next = next.ceil()
    return next;
  },
  canReset() {
    return temp.Roots.getResetGain.gte(1)
  },

  prestigeButtonText() {
    if (this.getResetGain().gte(new Decimal(100)))
      return `Gain ${format(this.getResetGain())} Root'(s)`
    return `Gain ${format(this.getResetGain())} Root'(s)` + `<br><br>Next at ` + format(this.getNextAt()) + ` Grass and Flowing Water`
  },
  effectDescription() { // Optional text to describe the effects
    eff = this.effect();
    return "which are multiplying the amount of Flowing Water and Grass you gain by " + format((eff.EssenceGainIncrease))
  },
  row: 2, // Row the layer is in on the tree (0 is the first row)
  displayRow: 8,
  hotkeys: [{
    key: "T",
    description: "T: Reset for Roots",
    onPress() {
      if (canReset(this.layer)) doReset(this.layer)
    }
  }, ],
  milestones: {},
  clickables: {
    11: {
      title: "Prestige",
      display: "Hold to Reset (Mobile QOL)",
      canClick() {
        return tmp[this.layer].canReset
      },
      onHold() {
        doReset(this.layer)
      },
      style() {
        let s = {}
        s["border-radius"] = "0px 24px 24px 0px"
        s["border"] = "4px solid"
        s["border-color"] = "rgba(0, 0, 0, .125)"
        return s
      }
    }
  },
  tabFormat: {
    "Main tab": {
      content: [
        "main-display",
        ["row", ["prestige-button", ["clickable", 11]]],
        "resource-display",
        "upgrades",
      ]
    },
  },
  layerShown() {
    return false;
    if (player["Grass"].points.gte(new Decimal(75000)) && player["Stream"].points.gte(new Decimal(75000)))
      player[this.layer].unlocked = true

    return player[this.layer].unlocked
  }
})
