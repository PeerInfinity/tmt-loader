addLayer("mana", {
  name: "Mana", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() { return {
    unlocked: true,
    points: new Decimal(0),
  }},
  branches: ['magic'],
  color: "#41A9EE",
  requires() {
    req = new Decimal(0.1)
    if (hasMilestone('mana', 0)) req = req.div(2)
    if (hasUpgrade('mana', 25)) req = req.div(2)
    if (hasUpgrade('mana', 35)) req = req.times(upgradeEffect('mana', 35))
    if (hasMilestone('magic', 0)) req = req.times(milestoneEffect('magic', 0))
    return req
  },
  resource: "Mana", // Name of prestige currency
  baseResource: "Essence", // Name of resource prestige is based on
  baseAmount() {
    return player.points
  }, // Get the current amount of baseResource
  type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent() {
      exp = new Decimal(0.125)
      if (hasMilestone('mana', 10)) exp = exp.times(milestoneEffect('mana', 10))
      return exp.add(1)
  }, // Prestige currency exponent
  gainMult() { // Calculate the multiplier for main currency from bonuses
      mult = new Decimal(1)
      if (hasUpgrade('mana', 31)) mult = mult.divide(2)
      if (getBuyableAmount('mana', 23) > 0) {
        mult = mult.divide(buyableEffect('mana', 23))
      }
      if (getBuyableAmount('magic', 12) > 0) {
        mult = mult.divide(buyableEffect('magic', 12))
      }
      return mult
  },
  gainExp() { // Calculate the exponent on main currency from bonuses
    gxp = new Decimal(1)
    if (hasUpgrade('mana', 32)) gxp = gxp.add(0.2)
    return gxp
  },
  row: 0, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
      {key: "m", description: "M: Reset for Mana", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
  ],
  layerShown() {
    return true
  },
  canBuyMax() {
    return hasMilestone('mana', 1)
  },
  doReset(layer) {
    if(layers[layer].row <= layers[this.layer].row || layers[layer].row == "side")return;

    if (hasMilestone('magic', 4)) {
      layerDataReset(this.layer, ["milestones", "upgrades", "buyables"], 999)
    } else if (hasMilestone('magic', 3)) {
      layerDataReset(this.layer, ["milestones", "upgrades", "buyables"], 50)
    } else if (hasMilestone('magic', 2)) {
      layerDataReset(this.layer, ["milestones", "upgrades", "buyables"], 20)
    } else if (hasMilestone('magic', 1)) {
      layerDataReset(this.layer, ["milestones", "upgrades", "buyables"], 5)
    } else {
      layerDataReset(this.layer, ["milestones", "upgrades"])
    }
  },
  passiveGeneration() {
    let gen = new Decimal(0)
    if (hasMilestone('mana', 11)) gen = gen.add(milestoneEffect('mana', 11))
    if (hasMilestone('mana', 12)) gen = gen.add(milestoneEffect('mana', 12))
    if (hasMilestone('mana', 13)) gen = gen.add(milestoneEffect('mana', 13))
    if (hasMilestone('mana', 14)) gen = gen.add(milestoneEffect('mana', 14))
    if (hasMilestone('mana', 15)) gen = gen.add(milestoneEffect('mana', 15))
    return gen.times(getResetGain('mana'))
  },
  automate() {
    
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
    }
  },
	infoboxes: {
    11: {
      title: "[1-1] Strange Energy",
      body() {
        return "You discover a strange energy in a cave. Unsure of what it is, \
        you intend to come back with some quipment to study it further."
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    12: {
      title: "[1-2] Further Research Required",
      body() {
        return "You bring your equipment back to the cave and being studying \
        the unique properties of the energy. In some of the films the air itself \
        seems to glow around the cave."
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    13: {
      title: "[1-3] Found More Strange Energy",
      body() {
        return "You stumble upon reports online of someone who seems to have \
        discovered another cave of this strange energy. You start to work with \
        them to compare the properties of the energy."
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    14: {
      title: "[1-4] Discovered how to Synethesize Mana",
      body() {
        return "After many sleepless nights and hundreds of hours of research, \
        you discover a way to synthesize the energy using a ton of very rare \
        materials. It's slow and expensive, but you begin making more of it."
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    15: {
      title: "[1-5] Energy Usefullness",
      body() {
        return "Finally, you've figured out a way to utilize the amazing \
        properties of the energy as a power source for your research machines. \
        Strangely, the energy seems to make them extremely efficient at no extra \
        cost of power or heat."
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    21: {
      title: "[2-1] Weird Stuff is Happening",
      body() {
        return "The machines are beginning to act strangely. You disconnected a \
        few computers from the wall outlets and yet they still seem to be working. \
        It's like the energy itself is powerful the entire machine, and is still \
        making it run faster than ever before."
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    22: {
      title: "[2-2] Massive Source Found",
      body() {
        return "Your cohort across the world calls you up, beaming with good \
        news. A third source for this energy has been found, deep underground \
        in another cave. The source, your friend says, is tenfold more massive \
        than either of the sources you've found so far. You immediately get off \
        the phone and book a plane ticket."
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    23: {
      title: "[2-3] New Properties Discovered",
      body() {
        return "This new source of the strange energy is unlike either of others. \
        Inside this cave, the walls seem to hum and their is a faint glow in the \
        air that follows you wherever you go, growing brighter as you get to the \
        source at the center. If you could figure out what makes it glow, you \
        could revolutionize lighting throughout the world."
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    24: {
      title: "[2-4] Energy Mitosis",
      body() {
        return "Not only is this new source of energy enormous, it's also \
        growing, almost as if it were alive. Each time you harvest some from \
        the source, almost the exact same amount is produced to replace it. You \
        can't help but wonder what mechanism is driving this strange behavior."
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    25: {
      title: "[2-5] The Future is Now!",
      body() {
        return "After much research, you're cohort has made a massive discovery. \
        Not only can this amazing resource be used to power machines and provide \
        limitless light to an area, it can also be used to transmute elements into \
        other elements, if given enough of them of course. You can already see the \
        Nobel Prize speech you're both going to give about this."
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    31: {
      title: "[3-1] Further Energy Manipulation",
      body() {
        return "Your cohort has begun to call this new form of the energy, which \
        allows for the transmutation of other materials \"mana\". And the craziest \
        part is that not only can it multiply other materials, it can also \
        multiply the gathering of itself, making it incredibly easy to gather more."
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    32: {
      title: "[3-2] Scientific Advancements",
      body() {
        return "By manipulating some of the formulas you were using in the mana \
        transmutations, you've figured out a way to automate the trasnmutation of \
        several materials. You feel that soon you will be able to transmute just \
        about any material the world could possibly need using mana."
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    33: {
      title: "[3-3] Cash Infusion",
      body() {
        return "You receive a massive influx of cash to your project from quite \
        a few world governments and a few anonymous sources. Due to the massive \
        discovery, it seems that word has gotten around the world fast and a few \
        such governments have volunteered to provide security (using their \
        militaries of course)."
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    34: {
      title: "[3-4] Mana Assembly Line",
      body() {
        return "With the massive inflix of cash you've received, you've been able \
        to have a series of factories built around the Source (which is what you've \
        started calling it now). You've automated the process of gathering the Mana, \
        refining it, and transmuting it into various materials."
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    35: {
      title: "[3-5] Ancient History",
      body() {
        return "During the excavation of a further part of the cavern where the \
        Source is located, a team discovers a strange stone room with incredibly \
        old scrolls and even some cave paintings on the walls. It seems that you \
        and your partner were not the first people to truly discover Mana and \
        study its properties. You take all the scrolls back to your lab to study."
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    41: {
      title: "[4-1] Ancient Techniques",
      body() {
        return "By studying the ancient scrolls that were found by the excavation \
        team, you've discovered a new way to enhance the way you've been gathering \
        Mana from the Source. It strikes you as amazing that these ancient people \
        could've found something so powerful. You wonder why you've never heard \
        of them before."
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    42: {
      title: "[4-2] Ancient Technologies",
      body() {
        return "Upon further studying of the scrolls, you discover that the \
        ancient people actually had developed some type of technology that gave \
        them the ability to use the properties of Mana at will. They embedded \
        the tecnology in a type of orb that was placed onto a staff. You decide \
        to make one of these for yourself (with newer tech than a just a plain \
        old stick of course)."
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    43: {
      title: "[4-3] Ancient Catalyst",
      body() {
        return "With your new \"technostaff\", you've been able to study the \
        effects of Mana more up close and you've been reading more of the ancient \
        scrolls and have been particularly studying some strange poem-like phrases \
        that seem to be found throughout the scrolls. Upon reading one such poem \
        out loud while holding the staff, a spark flew from the tip of it out \
        into a nearby computer, unfortunately frying the motherboard on it."
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    44: {
      title: "[4-4] Ancient-Future Fusion",
      body() {
        return "By some clever techno-wizardry (pun intended), you've built a \
        \"spellbook\" computer into the staff, allowing you to press a button to \
        summon the spark from the orb at the top instead of having to vocally say \
        the words from the scroll. You suspect that there are many more of these \
        incantations hidden within the other scrolls and have made sure to create \
        a way to easily update your \"spellbook\" as you find them."
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    45: {
      title: "[4-5] Dangerous Mana Uses",
      body() {
        return "So, you may have stumbled onto some destructive \"spells\", even \
        more so than the original one that ended up frying your favorite laptop. \
        You read one of the incantations from a scroll that was kind of damaged, \
        and you accidentally turned one of the excavator machines into a giant \
        bowling ball. Thankfully it didn't crush anyone, but it was a hell of a \
        thing to explain to the workers. You should be more careful."
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    51: {
      title: "[5-1] Empire Ending",
      body() {
        return "You finally finish deciphering all the scrolls that were found. \
        In the last few you discover the truth about why you've never heard of \
        the ancient people who discovered the Source. It turns out that the \
        discovery of the Source led to the creation of a sect of \"magi\" who \
        controlled the flow of Mana from the Source to the various parts of the \
        empire. It was the Magi who led to the destruction of the once great \
        civilization. A group sealed the Magic inside with the Source and buried \
        them and the Source forever, or at least, until you found it."
      },
      unlocked() {
        return hasUpgrade(this.layer, this.id)
      }
    },
    100: {
      title: "[7 M]",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    },
    101: {
      title: "[9 M]",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    },
    102: {
      title: "[11 M]",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    },
    103: {
      title: "[15 M]",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    },
    104: {
      title: "[20 M]",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    },
    105: {
      title: "[25 M]",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    },
    106: {
      title: "[30 M]",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    },
    107: {
      title: "[35 M]",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    },
    108: {
      title: "[40 M]",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    },
    109: {
      title: "[50 M]",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    },
    110: {
      title: "[75 M]",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    },
    111: {
      title: "[100 M]",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    },
    112: {
      title: "[200 M]",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    },
    113: {
      title: "[500 M]",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    },
    114: {
      title: "[1000 M]",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    },
    115: {
      title: "[5000 M]",
      body() {
        return ""
      },
      unlocked() {
        return hasMilestone(this.layer, this.id - 100)
      }
    }
	},
  upgrades: {
    11: {
      title: "Discover Essence",
      description: "Begin generating Essence per second",
      cost: new Decimal(0),
      effect() {
        let eff = new Decimal(0.01)
        if (hasUpgrade('mana', 45)) eff = eff.times(upgradeEffect('mana', 45))
        return eff
      },
      effectDisplay() {
        return format(this.effect())+"/sec"
      }
    },
    12: {
      title: "Study Essence",
      description: "Increases Essence Generation",
      cost: new Decimal(1),
      effect() {
        let eff = new Decimal(2.5)
        if (hasUpgrade('mana', 45)) eff = eff.times(upgradeEffect('mana', 45))
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
      title: "Locate More Essence",
      description() {
        let cap = new Decimal(25)
        if (getBuyableAmount('mana', 21) > 0) {
          let data = tmp[this.layer].buyables[21]
          cap = data.effect.second
        }

        return "Essence Generation Increases Based on Reset Time, caps at " + cap + "x"
      },
      cost: new Decimal(2),
      effect() {
        let cap = new Decimal(25)
        let eff = new Decimal(2)
        let rTime = player[this.layer].resetTime

        if (rTime <= 40) {
          eff = eff.add(player[this.layer].resetTime / 10)
        }
        else if (rTime <= 140) {
          eff = eff.add(4)
          eff = eff.add(player[this.layer].resetTime / 20)
        }
        else if (rTime <= 340) {
          eff = eff.add(9)
          eff = eff.add(player[this.layer].resetTime / 40)
        }
        else if (rTime <= 1340) {
          eff = eff.add(14)
          eff = eff.add(player[this.layer].resetTime / 80)
        }
        else {
          eff = eff.add(24)
          eff = eff.add(player[this.layer].resetTime / 160)
        }

        if (getBuyableAmount('mana', 21) > 0) {
          let data = tmp[this.layer].buyables[21]
          eff = eff.times(data.effect.first)
          cap = data.effect.second
        }

        if (hasUpgrade('mana', 45)) eff = eff.times(upgradeEffect('mana', 45))

        if (eff.gte(cap)) {
          return cap
        }
        else {
          return eff
        }
      },
      effectDisplay() {
        return format(this.effect())+"x"
      },
      unlocked() {
        return hasUpgrade(this.layer, 12)
      }
    },
    14: {
      title: "Divine More Essence",
      description: "Essence Generation Increases Based on Essence Found",
      cost: new Decimal(3),
      effect() {
        let eff = new Decimal(1)
        eff = eff.add(player[this.layer].points.pow(0.75) / 2)
        if (hasUpgrade('mana', 45)) eff = eff.times(upgradeEffect('mana', 45))
        return eff
      },
      effectDisplay() {
        return format(this.effect())+"x"
      },
      unlocked() {
        return hasUpgrade(this.layer, 12)
      }
    },
    15: {
      title: "Find a Use for Essence",
      description: "Base Essence Generation is now 0.1/sec",
      cost: new Decimal(4),
      effect() {
        let eff = new Decimal(0.1)
        if (hasUpgrade('mana', 45)) eff = eff.times(upgradeEffect('mana', 45))
        return eff
      },
      effectDisplay() {
        return format(this.effect())+"/sec"
      },
      unlocked() {
        return hasUpgrade(this.layer, 12)
      }
    },
    21: {
      title: "Study the Effects of Mana",
      description: "Unlock Mana Milestones",
      cost: new Decimal(5),
      unlocked() {
        return hasUpgrade(this.layer, 15)
      }
    },
    22: {
      title: "Discover a Strange Anomaly",
      description: "Increases Essence Production",
      cost: new Decimal(6),
      effect() {

      },
      unlocked() {
        return hasUpgrade(this.layer, 21)
      }
    },
    23: {
      title: "Siphon Essence from the Anomaly",
      description: "Base Essence Generation is now 0.5/sec",
      cost: new Decimal(8),
      unlocked() {
        return hasUpgrade(this.layer, 22)
      }
    },
    24: {
      title: "Alchemize Essence into More Mana",
      description: "Base Essence Generation is now 1/sec",
      cost: new Decimal(10),
      unlocked() {
        return hasUpgrade(this.layer, 23)
      }
    },
    25: {
      title: "Transmute Essence into Matter",
      description: "Decrease Mana's base Essence cost by 50%",
      cost: new Decimal(12),
      unlocked() {
        return hasUpgrade(this.layer, 24)
      }
    },
    31: {
      title: "Enhance Mana with Essence",
      description: "Essence converts into more Mana",
      cost: new Decimal(15),
      unlocked() {
        return hasUpgrade(this.layer, 25)
      }
    },
    32: {
      title: "Essence Quantification Methodologies",
      description: "Increase the amount of Mana you get from Essence",
      cost: new Decimal(20),
      unlocked() {
        return hasUpgrade(this.layer, 25)
      }
    },
    33: {
      title: "Mana Infusion",
      description: "Essence Production is increased based on Mana Upgrades bought",
      cost: new Decimal(30),
      effect() {
        let uCount = new Decimal(player[this.layer].upgrades.length)
        if (getBuyableAmount('mana', 22) > 0) {
          uCount = uCount.times(getBuyableAmount('mana', 22).add(1))
        }
        return uCount
      },
      effectDisplay() {
        return format(this.effect())+"x"
      },
      unlocked() {
        return hasUpgrade(this.layer, 31) && hasUpgrade(this.layer, 32)
      }
    },
    34: {
      title: "Mana Diffusion",
      description: "Essence Production is increased based on Mana Buyables bought",
      cost: new Decimal(35),
      effect() {
        let bCount = getFullBuyablesCount(this.layer)
        return bCount
      },
      effectDisplay() {
        return format(this.effect())+"x"
      },
      unlocked() {
        return hasUpgrade(this.layer, 31) && hasUpgrade(this.layer, 32)
      }
    },
    35: {
      title: "Learn the secrets of Mana",
      description: "Lowers Essence cost per Mana based on Mana amount",
      cost: new Decimal(40),
      effect() {
        if (player[this.layer].points < 5) return new Decimal(0.95)
        else if (player[this.layer].points < 10) return new Decimal(0.90)
        else if (player[this.layer].points < 15) return new Decimal(0.85)
        else if (player[this.layer].points < 20) return new Decimal(0.80)
        else if (player[this.layer].points < 25) return new Decimal(0.75)
        else if (player[this.layer].points < 30) return new Decimal(0.7)
        else if (player[this.layer].points < 35) return new Decimal(0.65)
        else if (player[this.layer].points < 40) return new Decimal(0.6)
        else if (player[this.layer].points < 45) return new Decimal(0.55)
        else if (player[this.layer].points < 50) return new Decimal(0.5)
        else return new Decimal(0.4)
      },
      effectDisplay() {
        return format(this.effect())+"x"
      },
      unlocked() {
        return hasUpgrade(this.layer, 33) && hasUpgrade(this.layer, 34)
      }
    },
    41: {
      title: "Advanced Mana-Crafting",
      description: "Increase Essence Generation based on the lowest level of Row 1 Buyable you have",
      cost: new Decimal(50),
      effect() {
        let lowest = getLowestBuyableAmount(this.layer, [11, 12, 13])
        let eff = new Decimal(10).times(lowest).pow(2)

        if (eff < 1) return new Decimal(0)
        else return eff
      },
      effectDisplay() {
        return format(this.effect())+"x"
      },
      unlocked() {
        return hasUpgrade(this.layer, 35)
      }
    },
    42: {
      title: "Advanced Mana-Divining",
      description: "Increase Essence Generation based on the lowest level of Row 2 Buyable you have",
      cost: new Decimal(60),
      effect() {
        let lowest = getLowestBuyableAmount(this.layer, [21, 22, 23])
        let eff = new Decimal(5).times(lowest).pow(2.5)

        if (eff < 1) return new Decimal(0)
        else return eff
      },
      effectDisplay() {
        return format(this.effect())+"x"
      },
      unlocked() {
        return hasUpgrade(this.layer, 41)
      }
    },
    43: {
      title: "Advanced Mana-Infusion",
      description: "Increase the effects of Row 1 Buyables",
      cost: new Decimal(70),
      effect() {
        let eff = new Decimal(1.5)
        return eff
      },
      effectDisplay() {
        return format(this.effect())+"x"
      },
      unlocked() {
        return hasUpgrade(this.layer, 41)
      }
    },
    44: {
      title: "Meta Mana Magic",
      description: "Increase the effects of Row 2 Buyables",
      cost: new Decimal(80),
      effect() {
        let eff = new Decimal(1.5)
        return eff
      },
      effectDisplay() {
        return format(this.effect())+"x"
      },
      unlocked() {
        return hasUpgrade(this.layer, 42) && hasUpgrade(this.layer, 43)
      }
    },
    45: {
      title: "Mana Explosions",
      description: "Increases all Row 1 Mana Upgrades based on your Mana",
      cost: new Decimal(90),
      effect() {
        let eff = new Decimal(1)
        eff = player[this.layer].points.pow(0.1)
        return eff
      },
      effectDisplay() {
        return format(this.effect())+"x"
      },
      unlocked() {
        return hasUpgrade(this.layer, 44)
      }
    },
    51: {
      title: "Ultimate Mana Cataclysm",
      description: "Doubles the effect of all Mana Buyables",
      cost: new Decimal(100),
      effect() {
        let eff = new Decimal(2)
        return eff
      },
      effectDisplay() {
        return format(this.effect())+"x"
      },
      unlocked() {
        return hasUpgrade(this.layer, 45) && hasMilestone('magic', 5)
      }
    },
    52: {
      title: "Explosive Mana Charges",
      description: "Increases the power of all spells by 50%",
      cost: new Decimal(500),
      effect() {
        let eff = new Decimal(1.5)
        return eff
      },
      effectDisplay() {
        return format(this.effect())+"x"
      },
      unlocked() {
        return hasUpgrade(this.layer, 51) && hasMilestone('magic', 5)
      }
    },
    53: {
      title: "Substantial Mastery of Mana",
      description: "Triples Base Essence Production",
      cost: new Decimal(1000),
      effect() {
        let eff = new Decimal(3)
        return eff
      },
      effectDisplay() {
        return format(this.effect())+"x"
      },
      unlocked() {
        return hasUpgrade(this.layer, 52) && hasMilestone('magic', 5)
      }
    },
    54: {
      title: "Grandmaster of Mana Production",
      description: "Reduces base essence cost per mana based on magic amount",
      cost: new Decimal(5000),
      effect() {
        if (player.magic.points.lt(10)) {
          return 0.95
        } else if (player.magic.points.lt(20)) {
          return 0.9
        } else if (player.magic.points.lt(50)) {
          return 0.85
        } else if (player.magic.points.lt(100)) {
          return 0.80
        } else {
          return 1
        }
      },
      effectDisplay() {
        return format(this.effect())+"x"
      },
      unlocked() {
        return hasUpgrade(this.layer, 53) && hasMilestone('magic', 5)
      }
    },
    55: {
      title: "Strange Mana Disturbances",
      description: "Elemental Spells are 50% stronger",
      cost: new Decimal(1e4),
      effect() {
        let eff = new Decimal(1.5)
        return eff
      },
      effectDisplay() {
        return format(this.effect())+"x"
      },
      unlocked() {
        return hasUpgrade(this.layer, 54) && hasMilestone('magic', 5)
      }
    },
    61: {
      title: "Epic Mana Mastery I",
      description: "Automatically Buy Tier 1 Mana Buyables",
      cost: new Decimal(1e5),
      effectDisplay() {
        if (hasUpgrade(this.layer, this.id)) {
          return "Active"
        } else {
          return "Inactive"
        }
      },
      unlocked() {
        return hasUpgrade(this.layer, 55)
      }
    },
    62: {
      title: "Epic Mana Mastery II",
      description: "Automatically Buy Tier 2 Mana Buyables",
      cost: new Decimal(1e6),
      effectDisplay() {
        if (hasUpgrade(this.layer, this.id)) {
          return "Active"
        } else {
          return "Inactive"
        }
      },
      unlocked() {
        return hasUpgrade(this.layer, 61)
      }
    },
    63: {
      title: "Epic Mana Mastery III",
      description: "Automatically Buy Tier 3 Mana Buyables",
      cost: new Decimal(1e7),
      effectDisplay() {
        if (hasUpgrade(this.layer, this.id)) {
          return "Active"
        } else {
          return "Inactive"
        }
      },
      unlocked() {
        return hasUpgrade(this.layer, 62)
      }
    }
  },
	buyables: {
    11: {
      title: "Mana Siphon",
      cost(x) {
        let bCost = new Decimal(2).times(x).add(2)
        return bCost
      },
      effect(x) {
        let def = new Decimal(1)
        let eff = new Decimal(0.1).times(x)
        let power = new Decimal(0.5).times(x)
        let final = baseBuyableEffect(x, def, def.add(eff).pow(power).add(x))
        if (getBuyableAmount('mana', 13) > 0) final = final.times(buyableEffect('mana', 13))
        if (hasUpgrade('mana', 43)) final = final.pow(upgradeEffect('mana', 43))
        if (hasUpgrade('mana', 51)) final = final.times(upgradeEffect('mana', 51))
        return final
      },
      display() {
        return baseBuyableText(this.layer, this.id, this.purchaseLimit(), 
          "Increases Essence Generation")
      },
      unlocked() {
        return hasMilestone('mana', 2)
      },
      canAfford() {
        return baseBuyableAfford(this.layer, this.id)
      },
      buy() {
        baseBuyablePurchase(this.layer, this.id)
      },
      purchaseLimit() {
        let limit = new Decimal(20)
        limit = limit.times(getBuyableAmount('mana', 31)).add(20)
        return limit
      }
    },
    12: {
      title: "Mana Generator",
      cost(x) {
        let bCost = new Decimal(3).times(x).add(3)
        return bCost
      },
      effect(x) {
        let eff = new Decimal(0)
        eff = baseBuyableEffect(x, eff, eff.add(x).times(x))
        if (hasUpgrade('mana', 43)) eff = eff.pow(upgradeEffect('mana', 43))
        if (hasUpgrade('mana', 51)) eff = eff.times(upgradeEffect('mana', 51))
        return eff
      },
      display() {
        return baseBuyableText(this.layer, this.id, this.purchaseLimit(), 
          "Increases Base Essence Rate")
      },
      unlocked() {
        return hasMilestone('mana', 3)
      },
      canAfford() {
        return baseBuyableAfford(this.layer, this.id)
      },
      buy() {
        baseBuyablePurchase(this.layer, this.id)
      },
      purchaseLimit() {
        let limit = new Decimal(10)
        limit = limit.times(getBuyableAmount('mana', 31)).add(10)
        return limit
      }
    },
    13: {
      title: "Mana Vacuum",
      cost(x) {
        let bCost = new Decimal(4).times(x).add(4)
        return bCost
      },
      effect(x) {
        let eff = new Decimal(1)
        if (hasUpgrade('mana', 43)) eff = eff.pow(upgradeEffect('mana', 43))
        eff = baseBuyableEffect(x, eff, eff.add(0.6).pow(x))
        if (hasUpgrade('mana', 51)) eff = eff.times(upgradeEffect('mana', 51))
        return eff
      },
      display() {
        return baseBuyableText(this.layer, this.id, this.purchaseLimit(), 
          "Increases effect of Mana Siphons")
      },
      unlocked() {
        return hasMilestone('mana', 4)
      },
      canAfford() {
        return baseBuyableAfford(this.layer, this.id)
      },
      buy() {
        baseBuyablePurchase(this.layer, this.id)
      },
      purchaseLimit() {
        let limit = new Decimal(10)
        limit = limit.times(getBuyableAmount('mana', 31)).add(10)
        return limit
      }
    },
    21: {
      title: "Mana Portal",
      cost(x) {
        let bCost = new Decimal(5).times(x).add(5)
        return bCost
      },
      effect(x) {
        let eff = {}
        eff.first = new Decimal(1)
        eff.second = new Decimal(0)
        eff.first = baseBuyableEffect(x, eff.first, eff.first.add(0.4).pow(x))
        eff.second = baseBuyableEffect(x, eff.second, eff.second.add(25).times(x).add(25))
        if (hasUpgrade('mana', 44)) eff.first = eff.first.pow(upgradeEffect('mana', 44))
        if (hasUpgrade('mana', 44)) eff.second = eff.second.pow(upgradeEffect('mana', 44))
        if (hasUpgrade('mana', 51)) eff.first = eff.first.times(upgradeEffect('mana', 51))
        if (hasUpgrade('mana', 51)) eff.second = eff.second.times(upgradeEffect('mana', 51))
        return eff
      },
      display() {
        return baseBuyableTextTwoEffects(this.layer, this.id, this.purchaseLimit(), 
          "Increases Effect of 'Locate More Essence'",
          "Increases Cap of 'Locate More Essence'")
      },
      unlocked() {
        return hasMilestone('mana', 5)
      },
      canAfford() {
        return baseBuyableAfford(this.layer, this.id)
      },
      buy() {
        baseBuyablePurchase(this.layer, this.id)
      },
      purchaseLimit() {
        let limit = new Decimal(10)
        limit = limit.times(getBuyableAmount('mana', 31)).add(10)
        return limit
      }
    },
    22: {
      title: "Mana Infuser",
      cost(x) {
        let bCost = new Decimal(6).times(x).add(6)
        return bCost
      },
      effect(x) {
        let eff = new Decimal(1)
        if (hasUpgrade('mana', 44)) eff = eff.pow(upgradeEffect('mana', 44))
        eff = baseBuyableEffect(x, eff, eff.add(4).times(x))
        if (hasUpgrade('mana', 51)) eff = eff.times(upgradeEffect('mana', 51))
        return eff
      },
      display() {
        return baseBuyableText(this.layer, this.id, this.purchaseLimit(), 
          "Increases the Effects of Mana Infusion")
      },
      unlocked() {
        return hasMilestone('mana', 6)
      },
      canAfford() {
        return baseBuyableAfford(this.layer, this.id)
      },
      buy() {
        baseBuyablePurchase(this.layer, this.id)
      },
      purchaseLimit() {
        let limit = new Decimal(10)
        limit = limit.times(getBuyableAmount('mana', 31)).add(10)
        return limit
      }
    },
    23: {
      title: "Mana Dimensions",
      cost(x) {
        let bCost = new Decimal(7).times(x).add(7)
        return bCost
      },
      effect(x) {
        let eff = new Decimal(1)
        if (hasUpgrade('mana', 44)) eff = eff.pow(upgradeEffect('mana', 44))
        eff = baseBuyableEffect(x, eff, eff.times(x).div(2).pow(x).add(1))
        if (hasUpgrade('mana', 51)) eff = eff.times(upgradeEffect('mana', 51))
        return eff
      },
      display() {
        return baseBuyableText(this.layer, this.id, this.purchaseLimit(), 
          "Increases Mana Multiplier")
      },
      unlocked() {
        return hasMilestone('mana', 7)
      },
      canAfford() {
        return baseBuyableAfford(this.layer, this.id)
      },
      buy() {
        baseBuyablePurchase(this.layer, this.id)
      },
      purchaseLimit() {
        let limit = new Decimal(10)
        limit = limit.times(getBuyableAmount('mana', 31)).add(10)
        return limit
      }
    },
    31: {
      title: "Mana Singularity",
      cost(x) {
        let bCost = new Decimal(8).times(x).add(8)
        return bCost
      },
      effect(x) {
        let eff = new Decimal(1)
        eff = baseBuyableEffect(x, 1, eff.times(x).add(1))
        if (hasUpgrade('mana', 51)) eff = eff.times(upgradeEffect('mana', 51))
        return eff
      },
      display() {
        return baseBuyableText(this.layer, this.id, this.purchaseLimit,
          "Increase Max Amount for all other Mana Buyables")
      },
      unlocked() {
        return hasMilestone('mana', 8)
      },
      canAfford() {
        return baseBuyableAfford(this.layer, this.id)
      },
      buy() {
        baseBuyablePurchase(this.layer, this.id)
      },
      purchaseLimit: new Decimal(9)
    }
	},
  milestones: {
    0: {
      requirementDescription: "7 Mana",
      effectDescription: "Base Essence Cost per Mana is halved",
      effect() {
        let eff = new Decimal(0.5)
        return eff
      },
      effectDisplay() {

      },
      done() {
        return player[this.layer].points.gte(7)
      }
    },
    1: {
      requirementDescription: "9 Mana",
      effectDescription: "Can Purchase Max Mana",
      done() {
        return player[this.layer].points.gte(9)
      }
    },
    2: {
      requirementDescription: "11 Mana",
      effectDescription: "Unlock Mana Siphons",
      done() {
        return player[this.layer].points.gte(11)
      }
    },
    3: {
      requirementDescription: "15 Mana",
      effectDescription: "Unlock Mana Generators",
      done() {
        return player[this.layer].points.gte(15)
      }
    },
    4: {
      requirementDescription: "20 Mana",
      effectDescription: "Unlock Mana Vacuums",
      done() {
        return player[this.layer].points.gte(20)
      }
    },
    5: {
      requirementDescription: "25 Mana",
      effectDescription: "Unlock Mana Portals",
      effectDisplay() {

      },
      done() {
        return player[this.layer].points.gte(25)
      }
    },
    6: {
      requirementDescription: "30 Mana",
      effectDescription: "Unlock Mana Infusers",
      effectDisplay() {

      },
      done() {
        return player[this.layer].points.gte(30)
      }
    },
    7: {
      requirementDescription: "35 Mana",
      effectDescription: "Unlocks Mana Dimensions",
      effectDisplay() {

      },
      done() {
        return player[this.layer].points.gte(35)
      }
    },
    8: {
      requirementDescription: "40 Mana",
      effectDescription: "Unlocks Mana Singularities",
      effectDisplay() {

      },
      done() {
        return player[this.layer].points.gte(40)
      }
    },
    9: {
      requirementDescription: "50 Mana",
      effectDescription: "Unlocks Simple Magic",
      effectDisplay() {

      },
      done() {
        return player[this.layer].points.gte(50)
      }
    },
    10: {
      requirementDescription: "75 Mana",
      effectDescription: "Mana costs rise slower",
      effect() {
        let eff = new Decimal(0.5)
        return eff
      },
      effectDisplay() {

      },
      done() {
        return player[this.layer].points.gte(75)
      }
    },
    11: {
      requirementDescription: "100 Mana",
      effectDescription: "Passively Generate 1% of Mana Reset per second",
      effect() {
        let eff = new Decimal(0.01)
        return eff
      },
      effectDisplay() {

      },
      done() {
        return player[this.layer].points.gte(100)
      }
    },
    12: {
      requirementDescription: "200 Mana",
      effectDescription: "Passively Generate 5% of Mana Reset per second",
      effect() {
        let eff = new Decimal(0.04)
        return eff
      },
      effectDisplay() {

      },
      done() {
        return player[this.layer].points.gte(200)
      }
    },
    13: {
      requirementDescription: "500 Mana",
      effectDescription: "Passively Generate 20% of Mana Reset per second",
      effect() {
        let eff = new Decimal(0.15)
        return eff
      },
      effectDisplay() {

      },
      done() {
        return player[this.layer].points.gte(500)
      }
    },
    14: {
      requirementDescription: "1000 Mana",
      effectDescription: "Passively Generate 50% of Mana Reset per second",
      effect() {
        let eff = new Decimal(0.30)
        return eff
      },
      effectDisplay() {

      },
      done() {
        return player[this.layer].points.gte(1000)
      }
    },
    15: {
      requirementDescription: "5000 Mana",
      effectDescription: "Passively Generate 100% of Mana Reset per second",
      effect() {
        let eff = new Decimal(0.50)
        return eff
      },
      effectDisplay() {

      },
      done() {
        return player[this.layer].points.gte(5000)
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
          "blank",
          "h-line",
          "blank",
          ["display-text", function() {
            return "<h3>Row 4 Upgrades</h3>"
          }],
          "blank",
          ["infobox", 41],
          ["infobox", 42],
          ["infobox", 43],
          ["infobox", 44],
          ["infobox", 45],
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
          ["infobox", 110],
          ["infobox", 111],
          ["infobox", 112],
          ["infobox", 113],
          ["infobox", 114],
          ["infobox", 115]
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
        return hasUpgrade('mana', 21)
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
        return hasMilestone('mana', 2)
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
        return hasUpgrade('mana', 11)
      }
    }
  }
})