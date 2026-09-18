addLayer("elemental", {
  name: "Elemental", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() { return {
    unlocked: true,
    points: new Decimal(0)
  }},
  branches: [],
  color: "#7249A7",
  requires() {
    req = new Decimal(5)
    return req
  },
  resource: "Elemental", // Name of prestige currency
  baseResource: "Magic", // Name of resource prestige is based on
  baseAmount() {
    return player.magic.points
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
  row: 2, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
      {key: "e", description: "E: Reset for Elemental", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
  ],
  layerShown() {
    return hasUpgrade('magic', 31)
  },
  doReset(layer) {
    if(layers[layer].row <= layers[this.layer].row || layers[layer].row == "side")return;

    layerDataReset(this.layer, ["milestones"])
  },
  automate() {
    
  },
  unlocked() {
    return hasUpgrade('magic', 31)
  },
  bars: {
    pointProgress: {
      direction: RIGHT,
      width: 120,
      height: 10,
      progress() {
        return  player.points / getNextAt(this.layer)
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
    elementalAirPoints: {
      direction: RIGHT,
      width: 400,
      height: 20,
      progress() {
        return tmp[this.layer].magicLevels.air.capProgress
      }
    },
    elementalWaterPoints: {
      direction: RIGHT,
      width: 400,
      height: 20,
      progress() {
        return tmp[this.layer].magicLevels.water.capProgress
      }
    },
    elementalEarthPoints: {
      direction: RIGHT,
      width: 400,
      height: 20,
      progress() {
        return tmp[this.layer].magicLevels.earth.capProgress
      }
    },
    elementalFirePoints: {
      direction: RIGHT,
      width: 400,
      height: 20,
      progress() {
        return tmp[this.layer].magicLevels.fire.capProgress
      }
    }
  },
	infoboxes: {
    11: {
      title: "[1-1]",
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
      title: "",
      cost(x) {
        let bCost = new Decimal(1).times(x).add(1)
        return bCost
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
    12: {
      title: "",
      cost(x) {
        let bCost = new Decimal(1).times(x).add(1)
        return bCost
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
    13: {
      title: "",
      cost(x) {
        let bCost = new Decimal(1).times(x).add(1)
        return bCost
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
    21: {
      title: "",
      cost(x) {
        let bCost = new Decimal(1).times(x).add(1)
        return bCost
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
        let bCost = new Decimal(1).times(x).add(1)
        return bCost
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
        let bCost = new Decimal(1).times(x).add(1)
        return bCost
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
    31: {
      title: "",
      cost(x) {
        let bCost = new Decimal(1).times(x).add(1)
        return bCost
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
      title: "Elemental Creation",
      description: "Unlocks the ability to learn how to use elemental mana for spells",
      cost: new Decimal(1),
      unlocked() {
        return hasUpgrade('magic', 31)
      }
    },
    12: {
      title: "Air Elementalism",
      description: "Unlocks the element of Air for casting",
      cost: new Decimal(2),
      unlocked() {
        return hasUpgrade('elemental', 11)
      }
    },
    13: {
      title: "Water Elementalism",
      description: "Unlocks the element of Water for casting",
      cost: new Decimal(2),
      unlocked() {
        return hasUpgrade('elemental', 11)
      }
    },
    14: {
      title: "Earth Elementalism",
      description: "Unlocks the element of Earth for casting",
      cost: new Decimal(2),
      unlocked() {
        return hasUpgrade('elemental', 11)
      }
    },
    15:{
      title: "Fire Elementalism",
      description: "Unlocks the element of Fire for casting",
      cost: new Decimal(2),
      unlocked() {
        return hasUpgrade('elemental', 11)
      }
    },
    21: {
      title: "",
      description: "",
      cost: new Decimal(5),
      effect() {
        
      },
      effectDisplay() {

      },
      unlocked() {
        
      }
    },
    22: {
      title: "",
      description: "",
      cost: new Decimal(10),
      effect() {
        
      },
      effectDisplay() {

      },
      unlocked() {
        
      }
    },
    23: {
      title: "",
      description: "",
      cost: new Decimal(20),
      effect() {
        
      },
      effectDisplay() {

      },
      unlocked() {
        
      }
    },
    24: {
      title: "",
      description: "",
      cost: new Decimal(35),
      effect() {
        
      },
      effectDisplay() {

      },
      unlocked() {
        
      }
    },
    25: {
      title: "",
      description: "",
      cost: new Decimal(50),
      effect() {
        
      },
      effectDisplay() {

      },
      unlocked() {
        
      }
    },
    31: {
      title: "",
      description: "",
      cost: new Decimal(1),
      effect() {
        
      },
      effectDisplay() {

      },
      unlocked() {
        
      }
    },
    32: {
      title: "",
      description: "",
      effect() {
        
      },
      effectDisplay() {

      },
      unlocked() {
        
      }
    },
    33: {
      title: "",
      description: "",
      effect() {
        
      },
      effectDisplay() {

      },
      unlocked() {
        
      }
    },
    34: {
      title: "",
      description: "",
      effect() {
        
      },
      effectDisplay() {

      },
      unlocked() {
        
      }
    },
    35: {
      title: "",
      description: "",
      effect() {
        
      },
      effectDisplay() {

      },
      unlocked() {
        
      }
    },
    41: {
      title: "",
      description: "",
      effect() {
        
      },
      effectDisplay() {

      },
      unlocked() {
        
      }
    }
  },
  milestones: {
		0: {
      requirementDescription: "",
      effectDescription: "",
      effect() {

      },
      done() {

      }
		},
    1: {
      requirementDescription: "",
      effectDescription: "",
      effect() {

      },
      done() {
        
      }
    },
    2: {
      requirementDescription: "",
      effectDescription: "",
      effect() {

      },
      done() {
        
      }
    },
    3: {
      requirementDescription: "",
      effectDescription: "",
      effect() {

      },
      done() {
        
      }
    },
    4: {
      requirementDescription: "",
      effectDescription: "",
      effect() {

      },
      done() {
        
      }
    },
    5: {
      requirementDescription: "",
      effectDescription: "",
      effect() {

      },
      done() {
        
      }
    },
    6: {
      requirementDescription: "",
      effectDescription: "",
      effect() {

      },
      done() {
        
      }
    },
    7: {
      requirementDescription: "",
      effectDescription: "",
      effect() {

      },
      done() {
        
      }
    },
    8: {
      requirementDescription: "",
      effectDescription: "",
      effect() {

      },
      done() {
        
      }
    },
    9: {
      requirementDescription: "",
      effectDescription: "",
      effect() {

      },
      done() {
        
      }
    },
    10: {
      requirementDescription: "",
      effectDescription: "",
      effect() {

      },
      done() {
        
      }
    }
  },
  magicLevels: {
    air: {
      level: new Decimal(0),
      xp: new Decimal(0),
      pts: new Decimal(0),
      name: "Air Magic",
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
        checkForMagicLevelUp(this.layer, this.id)
      }
    },
    water: {
      level: new Decimal(0),
      xp: new Decimal(0),
      pts: new Decimal(0),
      name: "Water Magic",
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
        checkForMagicLevelUp(this.layer, this.id)
      }
    },
    earth: {
      level: new Decimal(0),
      xp: new Decimal(0),
      pts: new Decimal(0),
      name: "Earth Magic",
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
        checkForMagicLevelUp(this.layer, this.id)
      }
    },
    fire: {
      level: new Decimal(0),
      xp: new Decimal(0),
      pts: new Decimal(0),
      name: "Fire Magic",
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
        checkForMagicLevelUp(this.layer, this.id)
      }
    }
  },
  spells: {
    // AIR SPELLS
    111: {
      spellName: "",
      isCasting: false,
      cost: new Decimal(0),
      effect() {

      },
      castDuration() {
        let dur = new Decimal(0)
        return dur
      },
      unlocked() {
        
      }
    },
    112: {
      spellName: "",
      isCasting: false,
      effect() {

      },
      castDuration() {
        let dur = new Decimal(0)
        return dur
      },
      unlocked() {
        
      }
    },
    113: {
      spellName: "",
      isCasting: false,
      effect() {

      },
      castDuration() {

      },
      unlocked() {
        
      }
    },
    114: {
      spellName: "",
      isCasting: false,
      effect() {

      },
      castDuration() {

      },
      unlocked() {
        
      }
    },
    115: {
      spellName: "",
      isCasting: false,
      effect() {

      },
      castDuration() {

      },
      unlocked() {
        
      }
    },

    // WATER SPELLS
    211: {
      spellName: "",
      isCasting: false,
      effect() {

      },
      castDuration() {

      },
      unlocked() {
        
      }
    },
    212: {
      spellName: "",
      isCasting: false,
      effect() {

      },
      castDuration() {

      },
      unlocked() {
        
      }
    },
    213: {
      spellName: "",
      isCasting: false,
      effect() {

      },
      castDuration() {

      },
      unlocked() {
        
      }
    },
    214: {
      spellName: "",
      isCasting: false,
      effect() {

      },
      castDuration() {

      },
      unlocked() {
        
      }
    },
    215: {
      spellName: "",
      isCasting: false,
      effect() {

      },
      castDuration() {

      },
      unlocked() {
        
      }
    },

    // EARTH SPELLS
    311: {
      spellName: "",
      isCasting: false,
      effect() {

      },
      castDuration() {

      },
      unlocked() {
        
      }
    },
    312: {
      spellName: "",
      isCasting: false,
      effect() {

      },
      castDuration() {

      },
      unlocked() {
        
      }
    },
    313: {
      spellName: "",
      isCasting: false,
      effect() {

      },
      castDuration() {

      },
      unlocked() {
        
      }
    },
    314: {
      spellName: "",
      isCasting: false,
      effect() {

      },
      castDuration() {

      },
      unlocked() {
        
      }
    },
    315: {
      spellName: "",
      isCasting: false,
      effect() {

      },
      castDuration() {

      },
      unlocked() {
        
      }
    },

    // FIRE SPELLS
    411: {
      spellName: "",
      isCasting: false,
      effect() {

      },
      castDuration() {

      },
      unlocked() {
        
      }
    },
    412: {
      spellName: "",
      isCasting: false,
      effect() {

      },
      castDuration() {

      },
      unlocked() {
        
      }
    },
    413: {
      spellName: "",
      isCasting: false,
      effect() {

      },
      castDuration() {

      },
      unlocked() {
        
      }
    },
    414: {
      spellName: "",
      isCasting: false,
      effect() {

      },
      castDuration() {

      },
      unlocked() {
        
      }
    },
    415: {
      spellName: "",
      isCasting: false,
      effect() {

      },
      castDuration() {

      },
      unlocked() {
        
      }
    },
  },
  challenges: {

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
          ["infobox", 31]
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
      air: {
        buttonStyle: {
          background: "#808080"
        },
        style: {
          background: "#808080"
        },
        content: [
          "blank",
          ["display-text", function() {
            return "<h2>Air Spells</h2>"
          }],
          "blank",
          ["display-text", function() {
            return tmp[this.layer].magicLevels[this.id].display()
          }],
          "blank",
          ["display-text", function() {
            return format(tmp[this.layer].magicLevels[this.id].points) + " Air Points"
          }],
          "blank",
          ["bar", "elementalAirPoints"],
          "blank",
          "h-line",
          "blank",
          ["spells", 111],
          ["spells", 112],
          ["spells", 113],
          ["spells", 114],
          ["spells", 115]
        ]
      },
      water: {
        buttonStyle: {
          background: "#222CBD"
        },
        style: {
          background: "#222CBD"
        },
        content: [
          "blank",
          ["display-text", function() {
            return "<h2>Water Spells</h2>"
          }],
          "blank",
          ["display-text", function() {
            return tmp[this.layer].magicLevels[this.id].display()
          }],
          "blank",
          ["display-text", function() {
            return format(tmp[this.layer].magicLevels[this.id].points) + " Water Points"
          }],
          "blank",
          ["bar", "elementalWaterPoints"],
          "blank",
          "h-line",
          "blank",
          ["spells", 211],
          ["spells", 212],
          ["spells", 213],
          ["spells", 214],
          ["spells", 215]
        ]
      },
      earth: {
        buttonStyle: {
          background: "#503E17"
        },
        style: {
          background: "#503E17"
        },
        content: [
          "blank",
          ["display-text", function() {
            return "<h2>Earth Spells</h2>"
          }],
          "blank",
          ["display-text", function() {
            return tmp[this.layer].magicLevels[this.id].display()
          }],
          "blank",
          ["display-text", function() {
            return format(tmp[this.layer].magicLevels[this.id].points) + " Earth Points"
          }],
          "blank",
          ["bar", "elementalEarthPoints"],
          "blank",
          "h-line",
          "blank",
          ["spells", 311],
          ["spells", 312],
          ["spells", 313],
          ["spells", 314],
          ["spells", 315]
        ]
      },
      fire: {
        buttonStyle: {
          background: "#772323"
        },
        style: {
          background: "#772323"
        },
        content: [
          "blank",
          ["display-text", function() {
            return "<h2>Fire Spells</h2>"
          }],
          "blank",
          ["display-text", function() {
            return tmp[this.layer].magicLevels[this.id].display()
          }],
          "blank",
          ["display-text", function() {
            return format(tmp[this.layer].magicLevels[this.id].points) + " Fire Points"
          }],
          "blank",
          ["bar", "elementalFirePoints"],
          "blank",
          "h-line",
          "blank",
          ["spells", 411],
          ["spells", 412],
          ["spells", 413],
          ["spells", 414],
          ["spells", 415]
        ]
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

      }
    }
  }
})