addLayer("GE", {
  name: "Greater Essence", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "GE", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
    }
  },
  color: "#FFFFFF",
  requires() {
    return new Decimal(1000000)
  }, // Can be a function that takes requirement increases into account
  resource: "Greater Essences", // Name of prestige currency
  baseAmount: decimalZero,
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.5, // Prestige currency exponent
  gainMult() { // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1)
    mult == player["River"].points
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
  effectDescription() { // Optional text to describe the effects
    eff = this.effect();
    return "which are multiplying the amount of Essence you gain by " + format((eff.EssenceGainIncrease))
  },
  row: "side", // Row the layer is in on the tree (0 is the first row)
  hotkeys: [{
    key: "G",
    description: "G: Reset for Greater Essence",
    onPress() {
      if (canReset(this.layer)) doReset(this.layer)
    }
  }, ],
  milestones: {},
  tabFormat: {
    "Main tab": {
      content: [
        "main-display",
        "buyables",
        "milestones",
      ]
    },
  },
  effect() {
    let essenceGainIncrease = new Decimal(1)
    essenceGainIncrease = player[this.layer].points.add(1)

    return { // Formulas for any boosts inherent to resources in the layer. Can return a single value instead of an object if there is just one effect
      EssenceGainIncrease: essenceGainIncrease
    }
  },
  effectDescription() { // Optional text to describe the effects
    eff = this.effect();
    return "which are multiplying the amount of Essence you gain by " + format((eff.EssenceGainIncrease))
  },
  layerShown() {
    if (player[this.layer].points.gte(0.1))
      return true

    return true;
  }
})
