addLayer("Grass", {
    name: "Grass", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: -1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
        branches: ["Roots","Energy"],
    color: "#175621",
    requires() {
      return new Decimal("100000000")
    }, // Can be a function that takes requirement increases into account
    resource: "Grass", // Name of prestige currency
    baseResource: "Dirt", // Name of resource prestige is based on
    baseAmount() {return player["Ground"].points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.25, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        mult == player["Ground"].points
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    effect() {
        let dirtGainIncrease = new Decimal(1)
        dirtGainIncrease = player[this.layer].points.pow(.65).add(1)

        return { // Formulas for any boosts inherent to resources in the layer. Can return a single value instead of an object if there is just one effect
        dirtGainIncrease: dirtGainIncrease
        }
    },
    effectDescription() { // Optional text to describe the effects
        eff = this.effect();
        return "which are multiplying the amount of Dirt you gain by "+format((eff.dirtGainIncrease))
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    displayRow: 9,
    hotkeys: [
        {key: "g", description: "G: Reset for Grass", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    milestones: {
      1: {
        requirementDescription: "10 Grass",
        effectDescription: "Unlocks Autobuy for Dirt Upgrades",
        done() { return player[this.layer].points.gte(10) },
        style() {
          return milestoneBorderRadius(this.layer, this.id, 24)
        }
      }
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
      "Milestones": {
        content: [
          "main-display",
          "milestones"
        ]
      }
    },
    layerShown(){
      if(player["Ground"].points.gte("10000000"))
        player[this.layer].unlocked = true

      return player[this.layer].unlocked
    }
})
