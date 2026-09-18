addLayer("Stream", {
    name: "Stream", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
        branches: ["Roots","Energy"],
    color: "#2C3B9D",
    requires() {
      return new Decimal("100000000")
    }, // Can be a function that takes requirement increases into account
    resource: "Flowing Water", // Name of prestige currency
    baseResource: "Water", // Name of resource prestige is based on
    baseAmount() {return player["River"].points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.25, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        mult == player["River"].points
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    effect() {
        let waterGainIncrease = new Decimal(1)
        waterGainIncrease = player[this.layer].points.pow(.4).add(1)

        return { // Formulas for any boosts inherent to resources in the layer. Can return a single value instead of an object if there is just one effect
        waterGainIncrease: waterGainIncrease
        }
    },
    effectDescription() { // Optional text to describe the effects
        eff = this.effect();
        return "which are multiplying the amount of Water you gain by "+format((eff.waterGainIncrease))
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    displayRow: 9,
    hotkeys: [
        {key: "f", description: "F: Reset for Flowing Water", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
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
      if(player["River"].points.gte("10000000"))
        player[this.layer].unlocked = true

      return player[this.layer].unlocked
    }
  }
)
