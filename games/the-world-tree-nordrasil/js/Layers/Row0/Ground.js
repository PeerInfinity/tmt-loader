addLayer("Ground", {
  name: "Ground", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
    }
  },
  branches: ["Grass"],
  color: "#563617",
  requires() {
    return new Decimal(10)
  }, // Can be a function that takes requirement increases into account
  resource: "Dirt", // Name of prestige currency
  baseResource: "Essence", // Name of resource prestige is based on
  baseAmount() {
    return player.points
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: .3, // Prestige currency exponent
  gainMult() { // Calculate the multiplier for main currency from bonuses
    eff = this.effect()
    return eff.dirtGainMulti
  },
  gainExp() { // Calculate the exponent on main currency from bonuses
    return new Decimal(1)
  },
  row: 0, // Row the layer is in on the tree (0 is the first row)
  displayRow: 10,
  hotkeys: [{
    key: "d",
    description: "D: Reset for Dirt",
    onPress() {
      if (canReset(this.layer)) doReset(this.layer)
    }
  }, ],
  upgrades: {
    32: {
      style() {
        return componentBorderRadius(this.layer, "upgrades", this.id, 24)
      },
      title: "Dirtier Dirt",
      description: "Double the base point gain each dirt gives",
      cost: new Decimal(100),
      unlocked() {
        return hasUpgrade(this.layer, 33)
      },
      effect() {
        let ret = 2
        return ret;
      }
    },
    33: {
      style() {
        return componentBorderRadius(this.layer, "upgrades", this.id, 24)
      },
      title: "Shovel",
      description: "Double the amount of Dirt gained on reset.",
      cost: new Decimal(5),
      unlocked() {
        return player[this.layer].unlocked
      }, // The upgrade is only visible when this is true
      effect() {
        let ret = 2
        return ret;
      }
    },
    34: {
      style() {
        return componentBorderRadius(this.layer, "upgrades", this.id, 24)
      },
      title: "Using Your Back And Brain!",
      description: "Using Dirt make Water Channels to Double Water's Multiplier",
      cost: new Decimal(50000),
      unlocked() {
        return hasUpgrade(this.layer, 33)
      }, // The upgrade is only visible when this is true
      effect() {
        let ret = 2
        return ret;
      }
    },
    23: {
      style() {
        return componentBorderRadius(this.layer, "upgrades", this.id, 24)
      },
      title: "Dirt Duplication",
      description: "Multiply Dirt Gaind Base On Current Dirt",
      cost: new Decimal(2500),
      unlocked() {
        return hasUpgrade(this.layer, 33)
      },
      effect() {
        let ret = new Decimal(0)

        ret = ret.add(player["Ground"].points).sub("500").pow(".17").min("20")


        return ret.max(3)
      },
      effectDisplay() {
        eff = this.effect();
        return "" + format(eff) + "x"
      }
    },
  },
  effect() {
    let baseGainIncrease = player[this.layer].points.times(new Decimal(".25"))
    if (hasUpgrade("Ground", 32)) baseGainIncrease = baseGainIncrease.times(upgradeEffect("Ground", 32))
    if (hasUpgrade("River", 23)) baseGainIncrease = baseGainIncrease.times(upgradeEffect("River", 34))

    // Multi to dirt via upgrades
    let dirtGainMulti = new Decimal(1)
    if (hasUpgrade("Ground", 33)) dirtGainMulti = dirtGainMulti.times(upgradeEffect("Ground", 33))
    if (hasUpgrade("Ground", 23)) dirtGainMulti = dirtGainMulti.times(upgradeEffect("Ground", 23))
    if (player.Grass.points.gte(1)) dirtGainMulti = dirtGainMulti.times((player.Grass.points).pow(.4).add(1))



    return { // Formulas for any boosts inherent to resources in the layer. Can return a single value instead of an object if there is just one effect
      baseGainIncrease: baseGainIncrease,
      dirtGainMulti: dirtGainMulti
    }
  },
  effectDescription() { // Optional text to describe the effects
    eff = this.effect();
    return "which are increasing the base point gain by " + format(eff.baseGainIncrease)
  },
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
  doReset(resettingLayer) { // Triggers when this layer is being reset, along with the layer doing the resetting. Not triggered by lower layers resetting, but is by layers on the same row.
    if (layers[resettingLayer].row > this.row) layerDataReset(this.layer)
  },
  layerShown() {
    return true
  }
})
