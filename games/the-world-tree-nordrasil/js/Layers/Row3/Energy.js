addLayer("Energy", {
    name: "Roof top", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		    points: new Decimal(0),
    }},
    color: "#FFFFFF",
    requires() {
      return new Decimal(1000000)
    }, // Can be a function that takes requirement increases into account
    resource: "Energy", // Name of prestige currency
    baseResource: "Roots", // Name of resource prestige is based on
    baseAmount() {return player["Roots"].points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        mult == player["Energy"].points
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    effect() {
        let rootGainIncrease = new Decimal(1)
        rootGainIncrease = player[this.layer].points.add(1)

        return { // Formulas for any boosts inherent to resources in the layer. Can return a single value instead of an object if there is just one effect
        RootGainIncrease: rootGainIncrease
        }
    },
    effectDescription() { // Optional text to describe the effects
        eff = this.effect();
        return "which is multiplying the amount of Roots you gain by "+format((eff.RootGainIncrease))
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    displayRow: 6,
    hotkeys: [
        {key: "L", description: "L: Reset for Energy", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    milestones: {
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
    layerShown(){
      return false;
      if(player["Roots"].points.gte(new Decimal("1e21")))
        player[this.layer].unlocked = true

      return player[this.layer].unlocked;
    }
})
