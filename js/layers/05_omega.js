addedPlayerData("omega", {
  name: "Omega",
  symbol: "O",
  position: 1,
  startData() { return {
    unlocked: true,
    points: new Decimal(0)
  }},
  branches: [],
  color: "#8B8127",
  requires() {
    req = new Decimal(5)
    return req
  },
  resource: "Omega Particles",
  baseResource: "Magic",
  baseAmount() {
    return player.magic.points
  },
  type: "static",
  exponent() {
    exp = new Decimal(0.5)
    return exp
  },
  gainMulti() {
    mult = new Decimal(1)
    return mult
  },
  gainExp() {
    gxp = new Decimal(1)
    return gxp
  },
  row: 4,
  hotkeys: [
    {
      key: "o",
      description: "O: Reset for Omega Particles",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer)
      }
    }
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
    return false
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
    omegaAncientPoints: {
      direction: RIGHT,
      width: 400,
      height: 20,
      progress() {
        return tmp[this.layer].magicLevels.ancient.capProgress
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
    }
  },
  buyables: {
    11: {
      
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
    14: {
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
		}
  },
  magicLevels: {
    ancient: {
      level: new Decimal(0),
      xp: new Decimal(0),
      pts: new Decimal(0),
      name: "Ancient Magic",
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
    // ANCIENT SPELLS
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
        ]
      }
    },
    spellbook: {
      ancient: {
        buttonStyle: {
          background: "#7E4517"
        },
        style: {
          background: "#7E4517"
        },
        content: [
          "blank",
          ["display-text", function() {
            return "<h2>Ancient Spells</h2>"
          }],
          "blank",
          ["display-text", function() {
            return format[this.layer].magicLevels[this.id].display()
          }],
          "blank",
          ["display-text", function() {
            return format[this.layer].omegaAncient + " Ancient Points"
          }],
          "blank",
          ["bar", "omegaAncientPoints"],
          "blank",
          "h-line",
          "blank",
          ["spells", 111],
          ["spells", 112],
          ["spells", 113],
          ["spells", 114],
          ["spells", 115],
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