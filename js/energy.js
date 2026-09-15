
addLayer("e", {
    name: "e", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    passiveGeneration() {
        if (hasMilestone("mp", 6)) return (hasMilestone("mp", 6)?1:0)
        },
    effect(){

    },
    effect(){
        return Decimal.pow(10, player[this.layer].total)
        /*
          you should use this.layer instead of <layerID>
          Decimal.pow(num1, num2) is an easier way to do
          num1.pow(num2)
        */
      },
      effect(){
        let e = player[this.layer].total.max("1").pow("3")
        if(e.gt("e1e4")){
            if(hasUpgrade("cp",45))e=e.pow(5).min("e1e60")
            if(hasAchievement("a",231))e=e.log10().pow(2500).min("e1e6")
        }
        return e
      },
      effectDescription(){

},
effectDescription(){
    let s =  "boosting point gain by x" + format(tmp[this.layer].effect) 
    if(this.effect().gt("e1e6")){s=s+" (hardcapped)"}
    else if(this.effect().gt("e1e4")){s=s+" (softcapped)"}
    return s
    /*
      use format(num) whenever displaying a number
    */
   
  },
    tooltip(){
        return "<h3>Energy</h3><br>" + format(player.e.points) + " Energy"
      },
      upgrades: {
        11: {
            title: "Energy Upgrades? (EU11)",
            description: "3x Light",
            cost: new Decimal(1e12),
                },
                12: {
                    title: "Energy Boost (EU12)",
                    description: "10x Energy",
                    cost: new Decimal(1e14),
                    unlocked() {
                        return hasUpgrade("e", 11)
                    
                    }
                        },
                        13: {
                            title: "Energy Boost II (EU13)",
                            description: "5x Light",
                            cost: new Decimal(1.25e18),
                            unlocked() {
                                return hasUpgrade("e", 12)
                            
                            }
                                },
                                14: { title: "Light Energetic (EU14)",
        description: "Energy boosts Light",
        cost: new Decimal(1e23),
        effect() {
            return player[this.layer].points.add(1).pow("0.1")
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        unlocked() {
            return hasUpgrade("e", 13)
        }
        },
        15: {
            title: "Air Fire (EU15)",
            description: "Air cost is divided by 10.",
            cost: new Decimal(1e27),
            unlocked() {
                return hasUpgrade("e", 14)
            
            }
                },
                21: {
                    title: "Air Divisor (EU21)",
                    description: "Air cost is divided based on Light.",
                    cost: new Decimal(1e36),
                    effect() {
                        return player.l.points.add(1).pow("0.1")
                    },
                    effectDisplay() { return  "/" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
                    unlocked() {
                        return hasUpgrade("e", 15)
                    
                    }
                        },
                        22: {
                            title: "Air Divisor II (EU22)",
                            description: "Air cost is divided based on Energy.",
                            cost: new Decimal(1e41),
                            effect() {
                                return player.e.points.add(1).pow("0.04")
                            },
                            effectDisplay() { return  "/" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
                            unlocked() {
                                return hasUpgrade("e", 21)
                            
                            }
                                },
                                23: { title: "Energetic Plus (EU23)",
        description: "Energy boosts Hyper-Points",
        cost: new Decimal(1e66),
        effect() {
            return player[this.layer].points.add(1).pow("0.2")
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        unlocked() {
            return hasUpgrade("e", 22)
        }
        },
        24: { title: "Energetic Plus II (EU24)",
        description: "Energy boosts Mega-Points at a very reduced rate.",
        cost: new Decimal(1e69),
        effect() {
            return player[this.layer].points.add(1).pow("0.01")
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        unlocked() {
            return hasUpgrade("e", 23)
        }
        },
        25: { title: "Light Points (EU25)",
        description: "Light boosts Points, Super-Points and Ultra-Points by even more.",
        cost: new Decimal(1e71),
        effect() {
            return player.l.points.add(1).pow("1")
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        unlocked() {
            return hasUpgrade("e", 24)
        }
        },
        31: { title: "Light Points II (EU31)",
        description: "Light boosts Hyper-Points",
        cost: new Decimal(1e73),
        effect() {
            return player.l.points.add(1).pow("0.25")
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        unlocked() {
            return hasUpgrade("e", 25)
        }
        },
        32: { title: "Light Points III (EU32)",
        description: "Light boosts Mega-Points at a very reduced rate.",
        cost: new Decimal(1e74),
        effect() {
            return player.l.points.add(1).pow("0.02")
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        unlocked() {
            return hasUpgrade("e", 31)
        }
        },
        33: {
            title: "Sacrifice to Previous Layers (EU33)",
            description: "Every Sacrifice Tier you have boosts energy gain by 2x",
            cost: new Decimal(1e202),
            effect() {
                let effect = Decimal.pow(2, player.sa.points).min("1e213")
                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() {
                return hasMilestone("sa", 12)
            }       
        },
        34: {
            title: "Sacrifice to Previous Layers II (EU34)",
            description: "Every Sacrifice Tier you have boosts light gain by 2x",
            cost: new Decimal(1e207),
            effect() {
                let effect = Decimal.pow(2, player.sa.points).min("1e213")
                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() {
                return hasUpgrade("e", 33)
            }       
        },
        35: {
            title: "Sacrifice to Previous Layers III (EU35)",
            description: "Every Sacrifice Tier you have boosts mega-point gain by 1.25x",
            cost: new Decimal(1e212),
            effect() {
                let effect = Decimal.pow(1.25, player.sa.points).min("1e213")
                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() {
                return hasUpgrade("e", 34)
            }       
        },
        41: {
            title: "Sacrifice to Previous Layers IV (EU41)",
            description: "Every Sacrifice Tier you have boosts hyper-point gain by 10x",
            cost: new Decimal(1e215),
            effect() {
                let effect = Decimal.pow(10, player.sa.points).min("1e221312323113")
                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() {
                return hasUpgrade("e", 35)
            }       
        },
        42: {
          title: "Sacrifice to Previous Layers V (EU42)",
            description: "Every Sacrifice Tier you have boosts ultra-point gain by 1,000x",
            cost: new Decimal(1e216),
            effect() {
                let effect = Decimal.pow(1000, player.sa.points).min("1e2213232113")
                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() {
                return hasUpgrade("e", 41)
            }       
        },
        43: {
            title: "Sacrifice to Previous Layers VI (EU43)",
              description: "Every Sacrifice Tier you have boosts super-point gain by 100,000x",
              cost: new Decimal(1e217),
              effect() {
                  let effect = Decimal.pow(100000, player.sa.points).min("1e2213232113")
                  return effect
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
              unlocked() {
                  return hasUpgrade("e", 42)
              }       
          },
          44: {
            title: "Sacrifice to Previous Layers VII (EU44)",
              description: "Every Sacrifice Tier you have boosts point gain by 10,000,000,000x",
              cost: new Decimal(1e218),
              effect() {
                  let effect = Decimal.pow(1e10, player.sa.points).min("1e2213232113")
                  return effect
              },
              effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
              unlocked() {
                  return hasUpgrade("e", 43)
              }       
          },
          45: {
            title: "Sacrifice Tier Cheapener (EU45)",
              description: "Sacrifice Points makes Sacrifice Tier cheaper.",
              cost: new Decimal(1e219),
              effect() {
                return player.scp.points.add(1).pow("1")
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
              unlocked() {
                  return hasUpgrade("e", 44)
              }       
          },
          51: {
            title: "Energy Boost IV (EU51)",
            description: "2,300x Energy & Light.",
            cost: new Decimal("1e388"),
            unlocked() {
                return hasUpgrade("e", 45)
            
            }
                },
                52: {
                    title: "Energy Megalizer (EU52)",
                    description: "25x Mega-Points.",
                    cost: new Decimal("1e398"),
                    unlocked() {
                        return hasUpgrade("e", 51)
                    
                    }
                        },
                        53: {
                            title: "Energy Buyablizer (EU53)",
                            description: "Unlock a new cell buyable.",
                            cost: new Decimal("1e420"),
                            unlocked() {
                                return hasUpgrade("e", 52)
                            
                            }
                                },
                                54: {
                                    title: "Energy Sacrifition (EU54)",
                                    description: "3,125,000x Sacrifice Points.",
                                    cost: new Decimal("1e422"),
                                    unlocked() {
                                        return hasUpgrade("e", 53)
                                    
                                    }
                                        },
                                        55: {
                                            title: "Energy Buyablizer Booster (EU55)",
                                              description: "Every Cell Buyable 11 you bought also boosts hyper-point gain by 2x",
                                              cost: new Decimal("1e422"),
                                              effect() {
                                                  let effect = Decimal.pow(2, player.c.buyables[11]).min("1e2213232113")
                                                  return effect
                                              },
                                              effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                              unlocked() {
                                                  return hasUpgrade("e", 54)
                                              }       
                                          },
                                          61: {
                                            title: "Energy Sacrifition II (EU61)",
                                            description: "^1.02 Sacrifice Points.",
                                            cost: new Decimal("1e426"),
                                            unlocked() {
                                                return hasUpgrade("e", 55)
                                            
                                            }
                                                },
                                                62: {
                                                    title: "Energy Lab (EU62)",
                                                    description: "^1.05 Cells.",
                                                    cost: new Decimal("1e426"),
                                                    unlocked() {
                                                        return hasUpgrade("e", 61)
                                                    
                                                    }
                                                        },
                                                        63: {
                                                            title: "Energy Powerlize (EU63)",
                                                            description: "^1.05 Energy & Light.",
                                                            cost: new Decimal("1e427"),
                                                            unlocked() {
                                                                return hasUpgrade("e", 62)
                                                            
                                                            }
                                                                },
                                                                64: {
                                                                    title: "Energy Powerlize (EU64)",
                                                                    description: "^1.05 Ultra-Points",
                                                                    cost: new Decimal("1e496"),
                                                                    unlocked() {
                                                                        return hasUpgrade("e", 63)
                                                                    
                                                                    }
                                                                        },
                                                                        65: {
                                                                            title: "Time Pointing (EU65)",
                                                                              description: "Time Points boosts Points.",
                                                                              cost: new Decimal("e552"),
                                                                              effect() {
                                                                                return player.tp.points.add(1).pow("1")
                                                                            },
                                                                            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                              unlocked() {
                                                                                  return hasUpgrade("e", 64)
                                                                              }       
                                                                          },
                                                                          71: {
                                                                            title: "Cells Takeover (EU71)",
                                                                              description: "Cells boosts Points.",
                                                                              cost: new Decimal("e555"),
                                                                              effect() {
                                                                                return player.c.points.add(1).pow("1")
                                                                            },
                                                                            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                              unlocked() {
                                                                                  return hasUpgrade("e", 65)
                                                                              }       
                                                                          },
                                                                          72: {
                                                                            title: "Energy Sacrifition III (EU72)",
                                                                            description: "1,000,000x Sacrifice Points",
                                                                            cost: new Decimal("e590"),
                                                                            unlocked() {
                                                                                return hasUpgrade("e", 71)
                                                                            
                                                                            }
                                                                                },
                                                                                73: {
                                                                                    title: "Leaf Point Non-stop (EU73)",
                                                                                      description: "Leaf Points boosts itself.",
                                                                                      cost: new Decimal("e3160"),
                                                                                      effect() {
                                                                                        return player.le.points.add(1).pow("0.25")
                                                                                    },
                                                                                    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
                                                                                      unlocked() {
                                                                                          return hasUpgrade("e", 72)
                                                                                      }       
                                                                                  },
  },
  tabFormat: [
    "main-display",
    "prestige-button",
    ["microtabs", "stuff"],
    ["blank", "25px"],
],
microtabs: {
    stuff: {
                    "Upgrades": {
                        unlocked() {return (hasAchievement("a", 11))},
                content: [
                    ["blank", "15px"],
                    ["raw-html", () => `<h4 style="opacity:.5">The Energy Layer will give a boost to Points.<br> Softcap effect starts at 1e10,000x</h4>`],
                    ["upgrades", [1,2,3,4,5,6,7,8,9,10,11]]
                ],
            },
        },
    },
    color: "yellow",
    requires() {if (inChallenge("sa", 11)) return new Decimal("1e49")
    else return new Decimal("1e4000")},      
    resource: "Energy", // Name of prestige currency
    baseResource: "Points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    branches: ["ai"],
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1e-308,    
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(2)
        mult = mult.times(tmp.l.effect)
        if (hasUpgrade('ai', 11)) mult = mult.times(upgradeEffect('ai', 11))
        if (hasUpgrade('mp', 64)) mult = mult.times(upgradeEffect('mp', 64))
        if (hasUpgrade('mp', 72)) mult = mult.times(upgradeEffect('mp', 72))
        if (hasUpgrade('e', 12)) mult = mult.times(10)
        if (hasUpgrade('sp', 91)) mult = mult.times(5)
        if (hasMilestone('sa', 1)) mult = mult.times("5")
        if (hasMilestone('sa', 2)) mult = mult.times("3")
        if (hasMilestone('sa', 3)) mult = mult.times("2")
        if (hasUpgrade('hp', 83)) mult = mult.times(upgradeEffect('hp',83))
        if (hasUpgrade('hp', 84)) mult = mult.times(upgradeEffect('hp',84))
        if (hasUpgrade('up', 84)) mult = mult.times(upgradeEffect('up',84))
        if (hasMilestone('sa', 4)) mult = mult.times("5")
        if (hasUpgrade('up', 85)) mult = mult.times(upgradeEffect('up',85))
        if (hasMilestone('sa', 5)) mult = mult.times("4")
        if (hasMilestone('sa', 6)) mult = mult.times("25")
        if (hasMilestone('sa', 7)) mult = mult.times("1.5")
        if (hasUpgrade('sp', 93)) mult = mult.times(upgradeEffect('sp',93))
        if (hasUpgrade('up', 92)) mult = mult.times(upgradeEffect('up',92))
        if (hasMilestone('sa', 9)) mult = mult.times("20")
        if (hasUpgrade('up', 93)) mult = mult.times(200)
        if (hasUpgrade('mp', 85)) mult = mult.pow(1.02)
        if (hasMilestone('sa', 10)) mult = mult.times("7.5")
        if (hasUpgrade('scp', 11)) mult = mult.times(2.5)
        if (hasUpgrade('scp', 12)) mult = mult.times(3)
        if (hasUpgrade('scp', 13)) mult = mult.times(3)
        if (hasUpgrade('scp', 14)) mult = mult.times(1.7)
        if (hasUpgrade('scp', 15)) mult = mult.times(1.5)
        if (hasUpgrade('scp', 21)) mult = mult.times(3)
        if (hasUpgrade('scp', 23)) mult = mult.times(3)
        if (hasUpgrade('scp', 24)) mult = mult.times(3)
        if (hasUpgrade('scp', 25)) mult = mult.times(2)
        if (hasUpgrade('scp', 33)) mult = mult.times(1.7)
        if (hasUpgrade('scp', 35)) mult = mult.times(1.5)
        if (hasUpgrade('scp', 41)) mult = mult.times(2)
        if (hasUpgrade('scp', 42)) mult = mult.times(2)
        if (hasUpgrade('e', 33)) mult = mult.times(upgradeEffect('e',33))
        if (hasMilestone('sa', 13)) mult = mult.times("30")
        if (hasUpgrade('scp', 43)) mult = mult.times(2.5)
        if (hasUpgrade('scp', 44)) mult = mult.times(4)
        if (hasUpgrade('scp', 45)) mult = mult.times(1.5)
        if (hasUpgrade('scp', 51)) mult = mult.times(2)
        if (hasUpgrade('scp', 52)) mult = mult.times(1.8)
        if (hasUpgrade('scp', 53)) mult = mult.times(2)
        if (hasUpgrade('scp', 55)) mult = mult.times(30)
        if (hasUpgrade('scp', 62)) mult = mult.times(2.25)
        if (hasUpgrade('scp', 63)) mult = mult.times(10)
        if (hasUpgrade('scp', 64)) mult = mult.times(4)
        if (hasUpgrade('scp', 71)) mult = mult.times(10)
        if (hasUpgrade('scp', 72)) mult = mult.times(50)
        if (hasMilestone('sa', 16)) mult = mult.times("1e9")
        if (hasUpgrade('scp', 81)) mult = mult.times(10)
        if (hasUpgrade('scp', 83)) mult = mult.times(10)
        if (hasUpgrade('scp', 84)) mult = mult.times(10)
        if (hasMilestone('sa', 18)) mult = mult.times("10")
        if (hasUpgrade('scp', 92)) mult = mult.times(3)
        if (hasUpgrade('scp', 93)) mult = mult.times(10)
        if (hasUpgrade('scp', 94)) mult = mult.times(10)
        if (hasUpgrade('e', 51)) mult = mult.times(2300)
        if (hasUpgrade('e', 63)) mult = mult.pow(1.05)
        if (inChallenge("sa", 12)) mult = mult.div("10^^308")
        if (hasChallenge('sa', 12)) mult = mult.times("5")
        if (hasAchievement('a', 225)) mult = mult.times("1e6")
        if (hasUpgrade('le', 13)) mult = mult.pow(1.25)
        mult = mult.times(buyableEffect('le', 12))
        if (hasAchievement('a', 245)) mult = mult.times("10")
        if (hasMilestone('st', 1)) mult = mult.times(250)
        if (hasMilestone('st', 2)) mult = mult.times(1e11)
        if (hasMilestone('st', 10)) mult = mult.pow(1.05)
        if (hasUpgrade('dp', 12)) mult = mult.pow(1.25)
        if (hasUpgrade('le', 73)) mult = mult.times(upgradeEffect('le',73))
        if (hasUpgrade('cp', 72)) mult = mult.pow(1.05)
        if (hasUpgrade('cp', 85)) mult = mult.pow(1.2)
            if (hasUpgrade('rp', 11)) mult = mult.pow(3)
                if (hasUpgrade('rp', 84)) mult = mult.pow(1.2)
                    if (hasUpgrade('rp', 95)) mult = mult.pow(1.5)
                mult = mult.times(tmp.se.effect)
        return mult
    
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    autoUpgrade() { if (hasAchievement("a" , 204)) return true},

    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "E", description: "E: Reset for Energy", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return (hasUpgrade("mp", 61) || player[this.layer].unlocked)},
})
