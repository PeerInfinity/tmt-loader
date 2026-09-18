addLayer("dark", {
  name: "Dark", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() { return {
    unlocked: true,
    points: new Decimal(0)
  }},
  branches: [],
  color: "#1B1B1B",
  requires() {
    req = new Decimal(5)
    return req
  },
  resource: "Dark", // Name of prestige currency
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
  row: 3, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
      {
        key: "d", 
        description: "D: Reset for Dark", 
        onPress() {
          if (canReset(this.layer)) doReset(this.layer)
        }
      },
  ],
  layerShown() {
    return false
  },
  doReset(layer) {
    if(layers[layer].row <= layers[this.layer].row || layers[layer].row == "side")return;

    layerDataReset(this.layer, ["milestones"])
  },
  automate() {
    
  },
  unlocked() {
    return false // change this later
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
    darkEldritchPoints: {
      direction: RIGHT,
      width: 400,
      height: 20,
      progress() {
        return tmp[this.layer].magicLevels.eldritch.capProgress
      }
    },
    darkHexingPoints: {
      direction: RIGHT,
      width: 400,
      height: 20,
      progress() {
        return tmp[this.layer].magicLevels.hexing.capProgress
      }
    },
    darkShadowPoints: {
      direction: RIGHT,
      width: 400,
      height: 20,
      progress() {
        return tmp[this.layer].magicLevels.shadow.capProgress
      }
    }
  },
	infoboxes: {
    11: {
      title: "",
      body() {
        return ""
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    12: {
      title: "",
      body() {
        return ""
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    13: {
      title: "",
      body() {
        return ""
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    14: {
      title: "",
      body() {
        return ""
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    15: {
      title: "",
      body() {
        return ""
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    21: {
      title: "",
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

      },
      effect(x) {

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
        
      }
    },
    12: {
      title: "",
      cost(x) {

      },
      effect(x) {

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
        
      }
    },
    13: {
      title: "",
      cost(x) {

      },
      effect(x) {

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
        
      }
    },
    21: {
      title: "",
      cost(x) {

      },
      effect(x) {

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
        
      }
    },
    22: {
      title: "",
      cost(x) {

      },
      effect(x) {

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
        
      }
    },
    23: {
      title: "",
      cost(x) {

      },
      effect(x) {

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
        
      }
    },
    31: {
      title: "",
      cost(x) {

      },
      effect(x) {

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
        
      }
    }
	},
  upgrades: {
    11: {
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
    12: {
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
    13: {
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
    14:{
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
    15: {
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
    21: {
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
    22: {
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
    23: {
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
    24: {
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
    25: {
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
		},
  },
  magicLevels: {
    eldritch: {
      level: new Decimal(0),
      xp: new Decimal(0),
      pts: new Decimal(0),
      name: "Eldritch Magic",
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
    hexing: {
      level: new Decimal(0),
      xp: new Decimal(0),
      pts: new Decimal(0),
      name: "Hex Magic",
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
    shadow: {
      level: new Decimal(0),
      xp: new Decimal(0),
      pts: new Decimal(0),
      name: "Shadow Magic",
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
    // ELDRITCH SPELLS
    111: {
      spellName: "",
      isCasting: false,
      effect() {

      },
      castDuration() {

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

    // HEXING SPELLS
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

    // SHADOW SPELLS
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
      eldritch: {
        buttonStyle: {
          background: "#144E42"
        },
        style: {
          background: "#144E42"
        },
        content: [
          "blank",
          ["display-text", function() {
            return "<h2>Eldritch Spells</h2>"
          }],
          "blank",
          ["display-text", function() {
            return format[this.layer].magicLevels[this.id].display()
          }],
          "blank",
          ["display-text", function() {
            return format[this.layer].darkEldritch + " Eldritch Points"
          }],
          "blank",
          ["bar", "darkEldritchPoints"],
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
      hexing: {
        buttonStyle: {
          background: "#491468"
        },
        style: {
          background: "#491468"
        },
        content: [
          "blank",
          ["display-text", function() {
            return "<h2>Hexing Spells</h2>"
          }],
          "blank",
          ["display-text", function() {
            return format[this.layer].magicLevels[this.id].display()
          }],
          "blank",
          ["display-text", function() {
            return format[this.layer].darkHexing + " Hex Points"
          }],
          "blank",
          ["bar", "darkHexingPoints"],
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
      shadow: {
        buttonStyle: {
          background: "#1D1D1D"
        },
        style: {
          background: "#1D1D1D"
        },
        content: [
          "blank",
          ["display-text", function() {
            return "<h2>Shadow Spells</h2>"
          }],
          "blank",
          ["display-text", function() {
            return format[this.layer].magicLevels[this.id].display()
          }],
          "blank",
          ["display-text", function() {
            return format[this.layer].darkShadow + " Hex Points"
          }],
          "blank",
          ["bar", "darkShadowPoints"],
          "blank",
          "h-line",
          "blank",
          ["spells", 311],
          ["spells", 312],
          ["spells", 313],
          ["spells", 314],
          ["spells", 315]
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