addLayer("magic", {
  name: "Magic", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() { return {
    unlocked: true,
    points: new Decimal(0)
  }},
  branches: [],
  color: "#9241EE",
  requires() {
    req = new Decimal(50)
    if (hasUpgrade('magic', 13)) {
      req = req.times(upgradeEffect('magic', 13))
    }
    return req
  },
  resource: "Magic", // Name of prestige currency
  baseResource: "Mana", // Name of resource prestige is based on
  baseAmount() {
    return player.mana.points
  }, // Get the current amount of baseResource
  type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent() {
      exp = new Decimal(0.5)
      return exp
  }, // Prestige currency exponent
  gainMult() { // Calculate the multiplier for main currency from bonuses
      mult = new Decimal(1)
      return mult
  },
  gainExp() { // Calculate the exponent on main currency from bonuses
    gxp = new Decimal(1)
    return gxp
  },
  row: 1, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
      {key: "g", description: "G: Reset for Magic", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
  ],
  layerShown() {
    return hasMilestone('mana', 9)
  },
  canBuyMax() {
    return hasUpgrade('magic', 21)
  },
  doReset(layer) {
    if(layers[layer].row <= layers[this.layer].row || layers[layer].row == "side")return;

    layerDataReset(this.layer, ["milestones"])
  },
  automate() {
    
  },
  unlocked() {
    return hasMilestone('mana', 9)
  },
  bars: {
    pointProgress: {
      direction: RIGHT,
      width: 120,
      height: 10,
      progress() {
        return  player.mana.points / getNextAt(this.layer)
      }
    },
    upgradeLoreProgress: {
      direction: RIGHT,
      width: 200,
      height: 20,
      progress() {
        return getPlayerInfoboxCount(this.layer, 11, 99) / getInfoboxCount(this.layer, 11, 99)
      }
    },
    milestoneLoreProgress: {
      direction: RIGHT,
      width: 200,
      height: 20,
      progress() {
        return getPlayerInfoboxCount(this.layer, 100, 199) / getInfoboxCount(this.layer, 100, 199)
      }
    },
    castingProgress: {
      direction: RIGHT,
      width: 400,
      height: 20,
      progress() {
        return 0 // FIX THIS LATER
      }
    },
    magicArcanePoints: {
      direction: RIGHT,
      width: 250,
      height: 20,
      progress() {
        return tmp[this.layer].magicLevels.arcane.capProgress
      }
    },
    magicEnchantPoints: {
      direction: RIGHT,
      width: 250,
      height: 20,
      progress() {
        return tmp[this.layer].magicLevels.enchant.capProgress
      }
    },
    magicAlchemyPoints: {
      direction: RIGHT,
      width: 250,
      height: 20,
      progress() {
        return tmp[this.layer].magicLevels.alchemy.capProgress
      }
    }
  },
	infoboxes: {
    11: {
      title: "[1-1] A Discovery of Wizards",
      body() {
        return ""
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    12: {
      title: "[1-2]",
      body() {
        return ""
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    13: {
      title: "[1-3]",
      body() {
        return ""
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    14: {
      title: "[1-4]",
      body() {
        return ""
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    15: {
      title: "[1-5]",
      body() {
        return ""
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    21: {
      title: "[2-1]",
      body() {
        return ""
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    22: {
      title: "[2-2]",
      body() {
        return ""
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    23: {
      title: "[2-3]",
      body() {
        return ""
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    24: {
      title: "[2-4]",
      body() {
        return ""
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    25: {
      title: "[2-5]",
      body() {
        return ""
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    31: {
      title: "[3-1]",
      body() {
        return ""
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    100: {
      title: "",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    },
    101: {
      title: "",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    },
    102: {
      title: "",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    },
    103: {
      title: "",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    },
    104: {
      title: "",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    },
    105: {
      title: "",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    },
    106: {
      title: "",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    },
    107: {
      title: "",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    },
    108: {
      title: "",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    },
    109: {
      title: "",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    },
    110: {
      title: "",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    },
	},
	buyables: {
    11: {
      title: "Arcane Wisps",
      cost(x) {
        let bCost = new Decimal(1).times(x).add(1)
        return bCost
      },
      effect(x) {
        let eff = new Decimal(1)
        eff = eff.times(x)
        return eff
      },
      display() {
        return baseBuyableText(this.layer, this.id, this.purchaseLimit(), 
          "")
      },
      unlocked() {
        return hasUpgrade('magic', 15)
      },
      canAfford() {
        return baseBuyableAfford(this.layer, this.id)
      },
      buy() {
        baseBuyablePurchase(this.layer, this.id)
      },
      purchaseLimit() {
        let limit = new Decimal(100)
        return limit
      }
    },
    12: {
      title: "Enchanted Wisps",
      cost(x) {
        let bCost = new Decimal(1.1).times(x).add(1)
        return bCost.floor()
      },
      effect(x) {
        let eff = new Decimal(1)
        eff = eff.times(x)
        return eff
      },
      display() {
        return baseBuyableText(this.layer, this.id, this.purchaseLimit(), 
          "")
      },
      unlocked() {
        return hasUpgrade('magic', 15)
      },
      canAfford() {
        return baseBuyableAfford(this.layer, this.id)
      },
      buy() {
        baseBuyablePurchase(this.layer, this.id)
      },
      purchaseLimit() {
        let limit = new Decimal(100)
        return limit
      }
    },
    13: {
      title: "Alchemical Wisps",
      cost(x) {
        let bCost = new Decimal(1.2).times(x).add(1)
        return bCost.floor()
      },
      effect(x) {
        let eff = new Decimal(1)
        eff = eff.times(x)
        return eff
      },
      display() {
        return baseBuyableText(this.layer, this.id, this.purchaseLimit(), 
          "")
      },
      unlocked() {
        return hasUpgrade('magic', 15)
      },
      canAfford() {
        return baseBuyableAfford(this.layer, this.id)
      },
      buy() {
        baseBuyablePurchase(this.layer, this.id)
      },
      purchaseLimit() {
        let limit = new Decimal(100)
        return limit
      }
    },
    21: {
      title: "",
      cost(x) {
        let bCost = new Decimal(1.3).times(x).add(1)
        return bCost.floor()
      },
      effect(x) {
        let eff = new Decimal(1)
        return eff
      },
      display() {
        return baseBuyableText(this.layer, this.id, this.purchaseLimit(), 
          "")
      },
      unlocked() {

      },
      canAfford() {
        return baseBuyableAfford(this.layer, this.id)
      },
      buy() {
        baseBuyablePurchase(this.layer, this.id)
      },
      purchaseLimit() {
        let limit = new Decimal(100)
        return limit
      }
    },
    22: {
      title: "",
      cost(x) {
        let bCost = new Decimal(1.4).times(x).add(1)
        return bCost.floor()
      },
      effect(x) {
        let eff = new Decimal(1)
        return eff
      },
      display() {
        return baseBuyableText(this.layer, this.id, this.purchaseLimit(), 
          "")
      },
      unlocked() {

      },
      canAfford() {
        return baseBuyableAfford(this.layer, this.id)
      },
      buy() {
        baseBuyablePurchase(this.layer, this.id)
      },
      purchaseLimit() {
        let limit = new Decimal(100)
        return limit
      }
    },
    23: {
      title: "",
      cost(x) {
        let bCost = new Decimal(1.5).times(x).add(1)
        return bCost.floor()
      },
      effect(x) {
        let eff = new Decimal(1)
        return eff
      },
      display() {
        return baseBuyableText(this.layer, this.id, this.purchaseLimit(), 
          "")
      },
      unlocked() {

      },
      canAfford() {
        return baseBuyableAfford(this.layer, this.id)
      },
      buy() {
        baseBuyablePurchase(this.layer, this.id)
      },
      purchaseLimit() {
        let limit = new Decimal(100)
        return limit
      }
    }
	},
  upgrades: {
    11: {
      title: "Magic Infusion",
      description: "Increases Essence Production",
      cost: new Decimal(1),
      effect() {
        let eff = new Decimal(2)
        return eff
      },
      effectDisplay() {
        return format(this.effect())+"x"
      }
    },
    12: {
      title: "Magic Training",
      description: "Increases Mana Production",
      cost: new Decimal(2),
      effect() {
        let eff = new Decimal(2)
        return eff
      },
      effectDisplay() {
        return format(this.effect())+"x"
      },
      unlocked() {
        return hasUpgrade(this.layer, 11)
      }
    },
    13: {
      title: "Enhanced Magic",
      description: "Decreases Magic's Base Mana Cost",
      cost: new Decimal(3),
      effect() {
        let eff = new Decimal(0.8)
        return eff
      },
      effectDisplay() {
        return format(this.effect())+"x"
      },
      unlocked() {
        return hasUpgrade(this.layer, 12)
      }
    },
    14: {
      title: "Magic-Infused Essence",
      description: "Increases Base Essence Production Amount",
      cost: new Decimal(4),
      effect() {
        let eff = new Decimal(1)
        return eff
      },
      effectDisplay() {
        return "+"+format(this.effect())
      },
      unlocked() {
        return hasUpgrade(this.layer, 11) && hasUpgrade(this.layer, 12)
      }
    },
    15: {
      title: "Gathering Magical Energies",
      description: "Unlock 3 Magical Wisp Buyables",
      cost: new Decimal(5),
      unlocked() {
        return hasUpgrade(this.layer, 13) && hasUpgrade(this.layer, 14)
      }
    },
    21: {
      title: "Maximum Magic-itude",
      description: "Enables ability to buy Max Magic",
      cost: new Decimal(8),
      unlocked() {
        return hasUpgrade(this.layer, 22) && hasUpgrade(this.layer, 23)
      }
    },
    22: {
      title: "Arcane Spellbook",
      description: "Unlocks the Arcane Spellbook and the first Arcane Spell",
      cost: new Decimal(15),
      unlocked() {
        return hasUpgrade(this.layer, 15)
      }
    },
    23: {
      title: "Enchantment Spellbook",
      description: "Unlocks the Enchantment Spellbook and the first Enchantment Spell",
      cost: new Decimal(15),
      unlocked() {
        return hasUpgrade(this.layer, 21)
      }
    },
    24: {
      title: "Alchemy Spellbook",
      description: "Unlocks the Alchemy Spellbook and the first Alchemy Spell",
      cost: new Decimal(15),
      unlocked() {
        return hasUpgrade(this.layer, 21)
      }
    },
    25: {
      title: "Spellmaster General",
      description: "Increase Spell XP +50%",
      cost: new Decimal(20),
      effect() {
        let eff = new Decimal(1.5)
        return eff
      },
      effectDisplay() {
        return format(this.effect())+"x"
      },
      unlocked() {
        return hasUpgrade(this.layer, 24)
      }
    },
    31: {
      title: "Elemental Wizardry",
      description: "Unlock Elemental Spellcasting",
      cost: new Decimal(50),
      unlocked() {
        return hasUpgrade(this.layer, 25)
      }
    },
    32: {
      title: "Elemental Mysticism",
      description: "Enhances Elemental Spellcasting",
      cost: new Decimal(75),
      unlocked() {
        return hasUpgrade(this.layer, 31)
      }
    },
    33: {
      title: "Maximum Elemental Overdrive",
      description: "Enables combining Elemental Spells",
      cost: new Decimal(100),
      unlocked() {
        return hasUpgrade(this.layer, 32)
      }
    },
    34: {
      cost: new Decimal(150),
      unlocked() {
        return hasUpgrade(this.layer, 33)
      }
    },
    35: {
      cost: new Decimal(250),
      unlocked() {
        return hasUpgrade(this.layer, 34)
      }
    },
    41: {
      cost: new Decimal(500),
      unlocked() {
        return hasUpgrade(this.layer, 35)
      }
    },
    42: {
      cost: new Decimal(1000),
      unlocked() {
        return hasUpgrade(this.layer, 41)
      }
    }
  },
  milestones: {
    0: {
      requirementDescription: "1 Magic",
      effectDescription: "Lower Essence Cost per Mana",
      effect() {
        let eff = new Decimal(0.5)
        return eff
      },
      effectDisplay() {
        return "Base x "+format(this.effect())
      },
      done() {
        return player[this.layer].points.gte(1)
      }
    },
    1: {
      requirementDescription: "2 Magic",
      effectDescription: "Keep 5 of each Mana Buyable on Reset",
      effect() {
        let eff = new Decimal(5)
        return eff
      },
      effectDisplay() {
        return "Keep up to 5 Buyables on Reset"
      },
      done() {
        return player[this.layer].points.gte(2)
      }
    },
    2: {
      requirementDescription: "3 Magic",
      effectDescription: "Keep another 15 of each Mana Buyable on Reset",
      effect() {
        let eff = new Decimal(15)
        return eff
      },
      effectDisplay() {
        return "Keep up to 20 Buyables on Reset"
      },
      done() {
        return player[this.layer].points.gte(3)
      }
    },
    3: {
      requirementDescription: "5 Magic",
      effectDescription: "Keep another 30 of each Mana Buyable on Reset",
      effect() {
        let eff = new Decimal(30)
        return eff
      },
      effectDisplay() {
        return "Keep up to 50 Buyables on Reset"
      },
      done() {
        return player[this.layer].points.gte(5)
      }
    },
    4: {
      requirementDescription: "7 Magic",
      effectDescription: "Keep ALL Mana Buyables on Reset",
      effect() {
        let eff = new Decimal(999)
        return eff
      },
      effectDisplay() {
        return "Keep ALL Buyables on Reset"
      },
      done() {
        return player[this.layer].points.gte(7)
      }
    },
    5: {
      requirementDescription: "10 Magic",
      effectDescription: "Unlock Powerful Mana Upgrades",
      effect() {
        return ""
      },
      effectDisplay() {
        return "UNLOCKED"
      },
      done() {
        return player[this.layer].points.gte(10)
      }
    },
    6: {
      requirementDescription: "20 Magic",
      effectDescription: "Unlock Tier 1 Spells",
      effect() {
        return ""
      },
      effectDisplay() {
        return "UNLOCKED"
      },
      done() {
        return player[this.layer].points.gte(20)
      }
    },
    7: {
      requirementDescription: "50 Magic",
      effectDescription: "Unlock Tier 2 Spells",
      effect() {
        return ""
      },
      effectDisplay() {
        return "UNLOCKED"
      },
      done() {
        return player[this.layer].points.gte(50)
      }
    },
    8: {
      requirementDescription: "100 Magic",
      effectDescription: "Unlock Tier 3 Spells",
      effect() {
        return ""
      },
      effectDisplay() {
        return "UNLOCKED"
      },
      done() {
        return player[this.layer].points.gte(100)
      }
    },
    9: {
      requirementDescription: "200 Magic",
      effectDescription: "Unlock Tier 4 Spells",
      effect() {
        return ""
      },
      effectDisplay() {
        return "UNLOCKED"
      },
      done() {
        return player[this.layer].points.gte(200)
      }
    },
    10: {
      requirementDescription: "500 Magic",
      effectDescription: "Unlock Tier 5 Spells",
      effect() {
        return ""
      },
      effectDisplay() {
        return "UNLOCKED"
      },
      done() {
        return player[this.layer].points.gte(500)
      }
    }
  },
  spells: { 
    // ARCANE SPELLS
    111: {
      spellName: "Basic Arcane Strike",
      isCasting: false,
      cost: new Decimal(1),
      effect() {
        let eff = new Decimal(1)
        if (hasUpgrade('mana', 52)) eff = eff.times(upgradeEffect('mana', 52))
        return eff
      },
      castDuration() {
        let dur = new Decimal(10)
        return dur
      },
      unlocked() {
        return hasUpgrade('magic', 22) && hasMilestone('magic', 6)
      }
    },
    112: {
      spellName: "",
      isCasting: false,
      cost: new Decimal(0),
      effect() {
        let eff = new Decimal(1)
        if (hasUpgrade('mana', 52)) eff = eff.times(upgradeEffect('mana', 52))
        return eff
      },
      castDuration() {
        let dur = new Decimal(0)
        return dur
      },
      unlocked() {
        return hasUpgrade('magic', 22) && hasMilestone('magic', 7)
      }
    },
    113: {
      spellName: "",
      isCasting: false,
      cost: new Decimal(0),
      effect() {
        let eff = new Decimal(1)
        if (hasUpgrade('mana', 52)) eff = eff.times(upgradeEffect('mana', 52))
        return eff
      },
      castDuration() {
        let dur = new Decimal(0)
        return dur
      },
      unlocked() {
        return hasUpgrade('magic', 22) && hasMilestone('magic', 8)
      }
    },
    114: {
      spellName: "",
      isCasting: false,
      cost: new Decimal(0),
      effect() {
        let eff = new Decimal(1)
        if (hasUpgrade('mana', 52)) eff = eff.times(upgradeEffect('mana', 52))
        return eff
      },
      castDuration() {
        let dur = new Decimal(0)
        return dur
      },
      unlocked() {
        
      }
    },
    115: {
      spellName: "",
      isCasting: false,
      cost: new Decimal(0),
      effect() {
        let eff = new Decimal(1)
        if (hasUpgrade('mana', 52)) eff = eff.times(upgradeEffect('mana', 52))
        return eff
      },
      castDuration() {
        let dur = new Decimal(0)
        return dur
      },
      unlocked() {
        
      }
    },

    // ENCHANT SPELLS
    211: {
      spellName: "Basic Small Enchantment",
      isCasting: false,
      cost: new Decimal(1),
      effect() {
        let eff = new Decimal(1)
        if (hasUpgrade('mana', 52)) eff = eff.times(upgradeEffect('mana', 52))
        return eff
      },
      castDuration() {
        let dur = new Decimal(0)
        return dur
      },
      unlocked() {
        return hasUpgrade('magic', 23) && hasMilestone('magic', 6)
      }
    },
    212: {
      spellName: "",
      isCasting: false,
      cost: new Decimal(0),
      effect() {
        let eff = new Decimal(1)
        if (hasUpgrade('mana', 52)) eff = eff.times(upgradeEffect('mana', 52))
        return eff
      },
      castDuration() {
        let dur = new Decimal(0)
        return dur
      },
      unlocked() {
        return hasUpgrade('magic', 23) && hasMilestone('magic', 7)
      }
    },
    213: {
      spellName: "",
      isCasting: false,
      cost: new Decimal(0),
      effect() {
        let eff = new Decimal(1)
        if (hasUpgrade('mana', 52)) eff = eff.times(upgradeEffect('mana', 52))
        return eff
      },
      castDuration() {
        let dur = new Decimal(0)
        return dur
      },
      unlocked() {
        return hasUpgrade('magic', 23) && hasMilestone('magic', 8)
      }
    },
    214: {
      spellName: "",
      isCasting: false,
      cost: new Decimal(0),
      effect() {
        let eff = new Decimal(1)
        if (hasUpgrade('mana', 52)) eff = eff.times(upgradeEffect('mana', 52))
        return eff
      },
      castDuration() {
        let dur = new Decimal(0)
        return dur
      },
      unlocked() {
        
      }
    },
    215: {
      spellName: "",
      isCasting: false,
      cost: new Decimal(0),
      effect() {
        let eff = new Decimal(1)
        if (hasUpgrade('mana', 52)) eff = eff.times(upgradeEffect('mana', 52))
        return eff
      },
      castDuration() {
        let dur = new Decimal(0)
        return dur
      },
      unlocked() {
        
      }
    },

    // ALCHEMY SPELLS
    311: {
      spellName: "Basic Alchemical Stone",
      isCasting: false,
      cost: new Decimal(1),
      effect() {
        let eff = new Decimal(1)
        if (hasUpgrade('mana', 52)) eff = eff.times(upgradeEffect('mana', 52))
        return eff
      },
      castDuration() {
        let dur = new Decimal(0)
        return dur
      },
      unlocked() {
        return hasUpgrade('magic', 24) && hasMilestone('magic', 6)
        
      }
    },
    312: {
      spellName: "",
      isCasting: false,
      cost: new Decimal(0),
      effect() {
        let eff = new Decimal(1)
        if (hasUpgrade('mana', 52)) eff = eff.times(upgradeEffect('mana', 52))
        return eff
      },
      castDuration() {
        return hasUpgrade('magic', 24) && hasMilestone('magic', 7)
      },
      unlocked() {
        
      }
    },
    313: {
      spellName: "",
      isCasting: false,
      cost: new Decimal(0),
      effect() {
        let eff = new Decimal(1)
        if (hasUpgrade('mana', 52)) eff = eff.times(upgradeEffect('mana', 52))
        return eff
      },
      castDuration() {

      },
      unlocked() {
        return hasUpgrade('magic', 24) && hasMilestone('magic', 8)
      }
    },
    314: {
      spellName: "",
      isCasting: false,
      cost: new Decimal(0),
      effect() {
        let eff = new Decimal(1)
        if (hasUpgrade('mana', 52)) eff = eff.times(upgradeEffect('mana', 52))
        return eff
      },
      castDuration() {

      },
      unlocked() {
        
      }
    },
    315: {
      spellName: "",
      isCasting: false,
      cost: new Decimal(0),
      effect() {
        let eff = new Decimal(1)
        if (hasUpgrade('mana', 52)) eff = eff.times(upgradeEffect('mana', 52))
        return eff
      },
      castDuration() {

      },
      unlocked() {
        
      }
    }
  },
  magicLevels: {
    arcane: {
      level: new Decimal(0),
      xp: new Decimal(0),
      pts: new Decimal(0),
      name: "Arcane Magic",
      display() {
        return this.name + " - Tier " + this.romanNumeral
      },
      romanNumeral() {
        return getRomanNumeral(this.level)
      },
      pointsCap() {
        return this.level.times(10)
      },
      capProgress() {
        return this.pts / this.pointsCap
      },
      addXP(x) {
        this.xp = this.xp.add(x)
        checkForMagicLevelUp(this.layer, "arcane")
      }
    },
    enchant: {
      level: new Decimal(0),
      xp: new Decimal(0),
      pts: new Decimal(0),
      name: "Enchantment Magic",
      display() {
        return this.name + " - Tier " + this.romanNumeral
      },
      romanNumeral() {
        return getRomanNumeral(this.level)
      },
      pointsCap() {
        return this.level.times(10)
      },
      capProgress() {
        return this.pts / this.pointsCap
      },
      addXP(x) {
        this.xp = this.xp.add(x)
        checkForMagicLevelUp(this.layer, "enchant")
      }
    },
    alchemy: {
      level: new Decimal(0),
      xp: new Decimal(0),
      pts: new Decimal(0),
      name: "Alchemy Magic",
      display() {
        return this.name + " - Tier " + this.romanNumeral
      },
      romanNumeral() {
        return getRomanNumeral(this.level)
      },
      pointsCap() {
        return this.level.times(10)
      },
      capProgress() {
        return this.pts / this.pointsCap
      },
      addXP(x) {
        this.xp = this.xp.add(x)
        checkForMagicLevelUp(this.layer, "alchemy")
      }
    }
  },
  challenges: {
    11: {
      name() {

      }
    },
    12: {
      name() {
        
      }
    },
    13: {
      name() {
        
      }
    }
  },
  microtabs: {
    lore: {
      upgrades: {
        content: [
          "blank",
          ["display-text", function() {
            return "<h2>Upgrade-Based Lore</h2>"
          }],
          "blank",
          ["bar", "upgradeLoreProgress"],
          "blank",
          "h-line",
          "blank",
          ["display-text", function() {
            return "<h3>Row 1 Upgrades</h3>"
          }],
          "blank",
          ["infobox", 11],
          ["infobox", 12],
          ["infobox", 13],
          ["infobox", 14],
          ["infobox", 15],
          "blank",
          "h-line",
          "blank",
          ["display-text", function() {
            return "<h3>Row 2 Upgrades</h3>"
          }],
          "blank",
          ["infobox", 21],
          ["infobox", 22],
          ["infobox", 23],
          ["infobox", 24],
          ["infobox", 25],
          "blank",
          "h-line",
          "blank",
          ["display-text", function() {
            return "<h3>Row 3 Upgrades</h3>"
          }],
          "blank",
          ["infobox", 31],
          ["infobox", 32],
          ["infobox", 33],
          ["infobox", 34],
          ["infobox", 35],
        ]
      },
      milestones: {
        content: [
          "blank",
          ["display-text", function() {
            return "<h2>Milestone-Based Lore</h2>"
          }],
          "blank",
          ["bar", "milestoneLoreProgress"],
          "blank",
          "h-line",
          "blank",
          ["infobox", 100],
          ["infobox", 101],
          ["infobox", 102],
          ["infobox", 103],
          ["infobox", 104],
          ["infobox", 105],
          ["infobox", 106],
          ["infobox", 107],
          ["infobox", 108],
          ["infobox", 109],
          ["infobox", 110]
        ]
      }
    },
    spellbook: {
      arcane: {
        buttonStyle: {
          background: "#470A5A"
        },
        style: {
          background: "#470A5A"
        },
        content: [
          "blank",
          ["display-text", function() {
            return "<h2>Arcane Spells</h2>"
          }],
          "blank",
          ["display-text", function() {
            return tmp[this.layer].magicLevels[this.id].display()
          }],
          "blank",
          ["display-text", function() {
            return format(tmp[this.layer].magicLevels[this.id].points) + " Arcane Points"
          }],
          "blank",
          ["bar", "magicArcanePoints"],
          "blank",
          "h-line",
          "blank",
          ["spells", 111],
          ["spells", 112],
          ["spells", 113],
          ["spells", 114],
          ["spells", 115]
        ],
        unlocked() {
          return hasUpgrade('magic', 22)
        }
      },
      enchant: {
        buttonStyle: {
          background: "#992793"
        },
        style: {
          background: "#992793"
        },
        content: [
          "blank",
          ["display-text", function() {
            return "<h2>Enchant Spells</h2>"
          }],
          "blank",
          ["display-text", function() {
            return tmp[this.layer].magicLevels[this.id].display()
          }],
          "blank",
          ["display-text", function() {
            return format(tmp[this.layer].magicLevels[this.id].points) + " Enchanting Points"
          }],
          "blank",
          ["bar", "magicEnchantPoints"],
          "blank",
          "h-line",
          "blank",
          ["spells", 211],
          ["spells", 212],
          ["spells", 213],
          ["spells", 214],
          ["spells", 215]
        ],
        unlocked() {
          return hasUpgrade('magic', 23)
        }
      },
      alchemy: {
        buttonStyle: {
          background: "#868131"
        },
        style: {
          background: "#868131"
        },
        content: [
          "blank",
          ["display-text", function() {
            return "<h2>Alchemy Spells</h2>"
          }],
          "blank",
          ["display-text", function() {
            return tmp[this.layer].magicLevels[this.id].display()
          }],
          "blank",
          ["display-text", function() {
            return format(tmp[this.layer].magicLevels[this.id].points) + " Alchemy Points"
          }],
          "blank",
          ["bar", "magicAlchemyPoints"],
          "blank",
          "h-line",
          "blank",
          ["spells", 311],
          ["spells", 312],
          ["spells", 313],
          ["spells", 314],
          ["spells", 315]
        ],
        unlocked() {
          return hasUpgrade('magic', 24)
        }
      }
    }
  },
  tabFormat: {
    "Upgrades": {
        content: [
            ["display-text", function() {
              return 'You have ' + format(player[this.layer].points) + 
              ' ' + tmp[this.layer].resource
            }],
            "blank",
            ["prestige-button-with-progress", "pointProgress"],
            "blank",
            ["display-text", function() {
              return 'You have ' + format(player.points) + 
              ' ' + tmp[this.layer].baseResource
            }],
            "blank",
            "upgrades"
        ]
    },
    "Milestones": {
        content: [
            ["display-text", function() {
              return 'You have ' + format(player[this.layer].points) + 
              ' ' + tmp[this.layer].resource
            }],
            "blank",
            ["prestige-button-with-progress", "pointProgress"],
            "blank",
            ["display-text", function() {
              return 'You have ' + format(player.points) + 
              ' ' + tmp[this.layer].baseResource
            }],
            "blank",
            "milestones"
        ],
        unlocked() {
          return hasUpgrade('magic', 11)
        }
    },
    "Buyables": {
      content: [
        ["display-text", function() {
          return 'You have ' + format(player[this.layer].points) + 
          ' ' + tmp[this.layer].resource
        }],
        "blank",
        ["prestige-button-with-progress", "pointProgress"],
        "blank",
        ["display-text", function() {
          return 'You have ' + format(player.points) + 
          ' ' + tmp[this.layer].baseResource
        }],
        "blank",
        "buyables"
      ],
      unlocked() {
        return hasUpgrade('magic', 15)
      }
    },
    "Lore": {
      content: [
        ["display-text", function() {
          return 'You have ' + format(player[this.layer].points) + 
          ' ' + tmp[this.layer].resource
        }],
        "blank",
        ["prestige-button-with-progress", "pointProgress"],
        "blank",
        ["display-text", function() {
          return 'You have ' + format(player.points) + 
          ' ' + tmp[this.layer].baseResource
        }],
        "blank",
        ["microtabs", "lore"]
      ],
      unlocked() {
        return hasUpgrade('magic', 11)
      }
    },
    "Spells": {
      content: [
        ["display-text", function() {
          return 'You have ' + format(player[this.layer].points) + 
          ' ' + tmp[this.layer].resource
        }],
        "blank",
        ["prestige-button-with-progress", "pointProgress"],
        "blank",
        ["display-text", function() {
          return 'You have ' + format(player.points) + 
          ' ' + tmp[this.layer].baseResource
        }],
        "blank",
        ["microtabs", "spellbook"]
      ],
      unlocked() {
        return hasUpgrade('magic', 22) || hasUpgrade('magic', 23) || hasUpgrade('magic', 24)
      }
    }
  }
})