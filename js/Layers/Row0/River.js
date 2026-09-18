addLayer("River", {
  name: "River", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
      points: new Decimal("0"),
    }
  },
  branches: ["Stream"],
  color: "#569AB8",
  requires() {
    return new Decimal("10")
  }, // Can be a function that takes requirement increases into account
  resource: "Water", // Name of prestige currency
  baseResource: "Essence", // Name of resource prestige is based on
  baseAmount() {
    return player.points
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: .3, // Prestige currency exponent
  gainMult() { // Calculate the multiplier for main currency from bonuses
    eff = this.effect()
    return eff.waterGainMulti
  },
  gainExp() { // Calculate the exponent on main currency from bonuses
    eff = this.effect()
    return eff.waterGainExp
  },
  row: 0, // Row the layer is in on the tree (0 is the first row)
  displayRow: 10,
  hotkeys: [{
    key: "w",
    description: "W: Reset for Water",
    onPress() {
      if (canReset(this.layer)) doReset(this.layer)
    }
  }, ],
  upgrades: {
    33: {
      style() {
        return componentBorderRadius(this.layer, "upgrades", this.id, 24)
      },
      title: "Bucket",
      description: "Double the amount of Water gained on reset.",
      cost: new Decimal("5"),
      unlocked() {
        return player[this.layer].unlocked
      }, // The upgrade is only visible when this is true
      effect() {
        let ret = new Decimal("2")
        return ret;
      }
    },
    32: {
      style() {
        return componentBorderRadius(this.layer, "upgrades", this.id, 24)
      },
      title: "Fresh Water",
      description: "Fresher Water allows for Increased Eseence gain from each water",
      cost: new Decimal("100"),
      unlocked() {
        return hasUpgrade(this.layer, "33")
      },
      effect() {
        let ret = new Decimal("2")
        return ret;
      }
    },
    34: {
      style() {
        return componentBorderRadius(this.layer, "upgrades", this.id, 24)
      },
      title: "Muddy water",
      description: "Multiply the amount of Base Point's dirt gives based on Total Water",
      cost: new Decimal("50000"),
      unlocked() {
        return hasUpgrade(this.layer, "33")
      },
      effect() {
        let ret = new Decimal(2)
        ret = ret.add(player[this.layer].points.sub(new Decimal("3000")).div(new Decimal("20000")).max(0)).min(10)
        return ret;
      },
      effectDisplay() {
        eff = this.effect();
        return format(eff) + "x"
      }
    },
    23: {
      style() {
        return componentBorderRadius(this.layer, "upgrades", this.id, 24)
      },
      title: "Water Multiplication",
      description: "Multiply Water Gain Based On Water",
      cost: new Decimal("2500"),
      unlocked() {
        return hasUpgrade(this.layer, 33)
      },
      effect() {
        let ret = new Decimal(0)

        ret = ret.add(player["River"].points).sub("500").pow(".17").min("20")


        return ret.max(3)
      },
      effectDisplay() {
        eff = this.effect();
        return "" + format(eff) + "x"
      }
    },
    43: {
      style() {
        return componentBorderRadius(this.layer, "upgrades", this.id, 24)
      },
      title: "Water Wheels",
      description: "Multiply Water Gain To The Power of 1.05",
      cost: new Decimal("3e5"),
      unlocked() {
        return hasUpgrade(this.layer, 33)
      },
      effect() {
        let ret = new Decimal(".05")
        return ret
      },
    }
  },
  effect() {
    let pointMult = player[this.layer].points.times(new Decimal(".25"))
    if (hasUpgrade(this.layer, 32)) pointMult = player[this.layer].points.times(upgradeEffect(this.layer, 32))
    if (hasUpgrade("Ground", 34)) pointMulti = pointMult.times(upgradeEffect("Ground", 34))

    let waterGainMulti = new Decimal("1")
    if (hasUpgrade("River", 33)) waterGainMulti = waterGainMulti.times(upgradeEffect("River", 33))
    if (hasUpgrade("River", 23)) waterGainMulti = waterGainMulti.times(upgradeEffect("River", 23))
    if (player.Stream.points.gte(new Decimal("1"))) waterGainMulti = waterGainMulti.times(player.Stream.points.pow(".4").add("1"))

    let waterGainExp = new Decimal("1")
    if (hasUpgrade("River", 43)) waterGainExp = waterGainExp.add(upgradeEffect("River", 43))

    return { // Formulas for any boosts inherent to resources in the layer. Can return a single value instead of an object if there is just one effect
      pointGainMulti: pointMult,
      waterGainMulti: waterGainMulti,
      waterGainExp: waterGainExp
    }
  },
  effectDescription() { // Optional text to describe the effects
    eff = this.effect();
    return "which are multiplying point gain by " + format(eff.pointGainMulti.add(1))
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
  },
})
