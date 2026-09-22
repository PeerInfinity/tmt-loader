addLayer("a", {
  name: "Atoms", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      protons: new Decimal(0),
      neutrons: new Decimal(0),
      electrons: new Decimal(0),

      variable: new Decimal(0),

      stored: {
        a: new Decimal(0),
        c: new Decimal(0),
        h: new Decimal(0),
        v: new Decimal(0),
      },

      hardMode() {
        return inChallenge("a", 21);
      },
    };
  },
  autoUpgrade() {
    return hasUpgrade("ce", 24);
  },
  color: "#470707",
  nodeStyle() {
    if (tmp.a.canReset || player.a.unlocked) {
      return {
        "background-image":
          "linear-gradient(90deg,rgb(46, 6, 6) 0%, rgb(50, 4, 4) 50%, rgb(97, 1, 1) 100%)",
        "background-size": "150px 600%",
        "background-position": "40% 50%",
      };
    }
  },
  requires: new Decimal(100), // Can be a function that takes requirement increases into account
  resource: "Atoms", // Name of prestige currency
  baseResource: "Quarks", // Name of resource prestige is based on
  baseAmount() {
    return player.q.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  softcap() {
    if (inChallenge("d", 11)) return new Decimal(10).mul(player.d.points);
    else return new Decimal(10000);
  },
  softcapPower() {
    let mult = new Decimal(0.4);
    if (inChallenge("d", 11))
      mult = new Decimal(0.01).add(player.d.points.mul(0.01));
    if (mult.gte(1)) mult = new Decimal(1);
    return mult;
  },
  exponent: 0.5, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (player.hm.atomicm.gte(0.001))
      mult = mult.times(player.hm.atomicmMultiplier());
    if (player.ce.points.gte(1)) mult = mult.times(upgradeEffect("ce", 24));
    if (hasUpgrade("mm", 23)) mult = mult.times(5);
    if (hasUpgrade("q", 22)) mult = mult.times(2);
    mult = mult.times(buyableEffect("ce", 11));
    if (hasUpgrade("ce", 11)) mult = mult.times(2);
    if (inChallenge("a", 21)) mult = mult.times(0.5);
    if (getBuyableAmount("ce", 18).gte(1))
      mult = mult.times(buyableEffect("ce", 18));
    if (player.ce.mito.gte(1)) mult = mult.times(buyableEffect("ce", 11));
    if (getBuyableAmount("ce", 101).gte(1))
      mult = mult.times(buyableEffect("ce", 101));
    if (getBuyableAmount("ce", 108).gte(1))
      mult = mult.times(buyableEffect("ce", 108));
    if (player.ce.points.gte(1))
      mult = mult.times(new Decimal(4).mul(player.ce.points));

    if (inChallenge("t", 11)) {
      mult = mult.times(1);
    } else {
      if (hasChallenge("a", 21)) mult = mult.times(challengeEffect("a", 21));
      if (hasUpgrade("a", 25)) mult = mult.times(upgradeEffect("a", 26));
      if (hasMilestone("h", 9))
        mult = mult.times(player.v.points.plus(1).pow(0.5));
      if (hasUpgrade("c", 23)) mult = mult.times(10);
    }
    if (player.b.Realgar.gte(1))
      mult = mult.times(player.b.realgarMultiplier());

    mult = mult.times(player.b.kessiumMultiplier());
    if (inChallenge("d", 14)) {
      return mult;
    } else {
      if (hasUpgrade("n", 12)) mult = mult.times(3);
    }
    if (hasUpgrade("d", 44)) mult = mult.times(1e12);
    if (player.ct.sdust.gte(1)) mult = mult.times(player.c.sMult());
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    return new Decimal(1);
  },
  passiveGeneration() {
    if (getBuyableAmount("t", 32).gte(1))
      return new Decimal(0.02).mul(getBuyableAmount("t", 32));
    if (hasMilestone("o", 0)) return new Decimal(1);
  },
  doReset(reset) {
    let keep = [];
    if (!player.ax.canReset1) {
      return null;
    }
    keep.push("protons");
    keep.push("neutrons");
    keep.push("electrons");
    keep.push("variable");
    if (hasChallenge("a", 22)) keep.push("challenges");
    if (layers[reset].row > this.row) {
      layerDataReset("a", keep);
    }
  },
  update() {
    if (
      player.q.points.gte(50) ||
      player.a.points >= 1 ||
      player.hm.points >= 1
    ) {
      player.a.variable = new Decimal(1);
    }
  },
  row: 1, // Row the layer is in on the tree (0 is the first row)
  branches: ["q"],
  hotkeys: [
    {
      key: "a",
      description: "A: Reset for atoms",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return player.h.unlocked;
  },

  upgrades: {
    11: {
      title: "Howdron quaint",
      description: "2x Particle gain",
      cost: new Decimal(1),
    },
    12: {
      title: "Atomizer",
      description: "Atoms now boost Quarks",
      cost: new Decimal(3),
      effect() {
        if (inChallenge("a", 21)) return new Decimal(1);
        else if (inChallenge("a", 11)) {
          return new Decimal(1);
        } else {
          if (hasUpgrade("a", 12))
            return player[this.layer].points.plus(1).pow(0.5);
        }
      },
      effectDisplay() {
        return format(upgradeEffect(this.layer, this.id)) + "x";
      }, // Add formatting to the effect
    },
    13: {
      title: "Subatomic",
      description: "Particle gain boost",
      cost: new Decimal(5),
    },
    14: {
      title: "Gyser",
      description: "Unlock more Multiplier Upgrades",
      cost: new Decimal(7),
    },
    15: {
      title: "Atman",
      description: "Autobuy row 1 Quark Upgrades",
      cost: new Decimal(15),
      effect() {
        if (hasUpgrade("a", 15)) {
          buyUpgrade("q", 11);
          buyUpgrade("q", 12);
          buyUpgrade("q", 13);
          buyUpgrade("q", 14);
          buyUpgrade("q", 15);
          buyUpgrade("q", 16);
          buyUpgrade("q", 21);
          buyUpgrade("q", 22);
        }
      },
    },
    16: {
      title: "True man",
      description: "Unlock the atomizer challenge. ",
      cost: new Decimal(20),
    },
    21: {
      title: "Quintuple",
      description: "2x Particle gain(Yes that is counterintuitive)",
      cost: new Decimal(450000),
      unlocked() {
        return hasChallenge("a", 21);
      },
    },
    22: {
      title: "Braniac",
      description: "Neural capacity now gives multipler a 3x boost!",
      cost: new Decimal(700000),
      unlocked() {
        return hasChallenge("a", 21);
      },
    },
    23: {
      title: "Asymtomatic",
      description: "2x Vinyl Multiplier gain",
      cost: new Decimal(1100000),
      unlocked() {
        return hasChallenge("a", 21);
      },
    },
    24: {
      title: "Wrath",
      description:
        "Walk the plank, Proteins boost is increased from 1.2x to 1.7x",
      cost: new Decimal(1300000),
      unlocked() {
        return hasChallenge("a", 21);
      },
    },
    25: {
      title: "Black Atom",
      description: "Improve multipler's upgrade 13 effect",
      cost: new Decimal(2000000),
      unlocked() {
        return hasChallenge("a", 21);
      },
    },
    26: {
      title: "True man Show",
      description: "Hyper Multiplier now boosts Atoms ",
      cost: new Decimal(3500000),
      effect() {
        return player.h.points.plus(1).pow(0.5);
      },
      effectDisplay() {
        return format(upgradeEffect(this.layer, this.id)) + "x";
      }, // Add formatting to the effect
      unlocked() {
        return hasChallenge("a", 21);
      },
    },
  },
  tabFormat: {
    "Upgrades and Prestige": {
      content: [
        [
          "main-display",
          function () {
            return "main-display";
          },
          { "font-family": "Times New Roman" },
        ],
        "blank",
        [
          "prestige-button",
          function () {
            return "prestige-button";
          },
          { "border-radius": "0px" },
        ],
        "blank",
        "blank",

        [
          "display-text",
          function () {
            return "You have " + format(player.q.points) + " quarks.";
          },
        ],
        "blank",
        "upgrades",
        "challenges",
      ],
    },
    "Atomic Particles": {
      content: [
        ["infobox", "lore1"],
        "blank",
        ["infobox", "lore2"],
        "blank",
        "blank",
        [
          "display-text",
          function () {
            return "You have " + format(player.a.protons) + " protons";
          },
          {
            "font-size": "24px",
            color: "#000000",
            border: "4px solid #00ff00",
            padding: "17px",
            "background-image":
              "linear-gradient(90deg,rgb(21, 255, 0) 0%, rgb(0, 172, 14) 50%, rgb(1, 100, 6) 100%)",
          },
        ],
        "blank",
        "blank",
        "blank",
        [
          "display-text",
          function () {
            return "You have " + format(player.a.neutrons) + " neutrons";
          },
          {
            "font-size": "24px",
            color: "#000000",
            border: "4px solid #353535",
            padding: "17px",
            "background-image":
              "linear-gradient(90deg,rgb(107, 107, 107) 0%, rgb(126, 126, 126) 50%, rgb(121, 121, 121) 100%)",
          },
        ],
        "blank",
        "blank",
        "blank",
        [
          "display-text",
          function () {
            return "You have " + format(player.a.electrons) + " electrons";
          },
          {
            "font-size": "24px",
            color: "#000000",
            border: "4px solid #4e0000",
            padding: "17px",
            "background-image":
              "linear-gradient(90deg,rgb(155, 0, 0) 0%, rgb(156, 0, 0) 50%, rgb(99, 0, 0) 100%)",
          },
        ],
        "blank",
        "blank",
      ],
    },
  },
  infoboxes: {
    lore1: {
      title: "Hadrons explained",
      body() {
        return `Hadrons are particles made up of Quarks. In everday life, we only encounter protons and neutrons, as they are the most stable. Protons and neutrons dominate daily chemistry, with a proton being positive, lighter and more stable, and neutrons being neutral and less stable. If not binded to a proton, a free-flowing neutron would decay in roughly 15 minutes. A proton is made up of 2 up quarks and 1 down quark. A neutron is made up of 2 down quarks and 1 up quark`;
      },
    },
    lore2: {
      title: "Electrons explained",
      body() {
        return `Electrons are elementary subatomic particles(They are not made up of anything smaller), with a negative charge. Electrons are responsible for everyday chemistry, as most reactions involve the transfer of electrons. Electrons are very weird, while they do orbit protons and neutrons(the nucleus), because of quantum mechanics, they act as both waves and points, meaning you will not know where an electron is until you measure it, as it will collapse into one state.`;
      },
    },
  },
  challenges: {
    11: {
      name: "The Atomizer",
      challengeDescription:
        "Self-Sustainability is disabled. Atoms no longer boost Quarks. ",
      goalDescription: "Obtain 1,000,000 Quarks",
      canComplete: function () {
        return player.q.points.gte(1000000);
      },

      unlocked() {
        return hasUpgrade("a", 16);
      },
      completionLimit: 1,
      rewardDisplay() {
        return "Unlock advanced telescopes and radar technology in Cosmic Dust";
      },
    },
    12: {
      name: "The Atominator",
      challengeDescription:
        "Hyper-Multiplier and Vinyl Multiplier's effects no longer work. ",
      goalDescription: "Obtain 1e9 points",
      canComplete: function () {
        return player.points.gte(1e9);
      },
      unlocked() {
        return player.a.points.gte(100000);
      },
      completionLimit: 1,
      rewardDescription: "Atoms now boost multiplier",
      rewardEffect() {
        if (inChallenge("a", 21)) return new Decimal(1);
        else return player[this.layer].points.plus(1).pow(0.5);
      },
      rewardDisplay() {
        return format(challengeEffect(this.layer, this.id)) + "x";
      },
    },
    21: {
      name: "Deduction of life",
      challengeDescription:
        "Atom boosts, Cosmic Dust boosts, and any cell boosts no longer work. You are also given zero of all row 1 stats ",
      goalDescription: "Obtain 1e9 Multiplier",
      canComplete: function () {
        return player.m.points.gte(1e9);
      },
      unlocked() {
        if (inChallenge("a", 21) || hasChallenge("a", 21)) return true;
        else return player.a.points.gte(300000);
      },
      completionLimit: 1,
      rewardDescription:
        "Cosmic Dust now boosts Atoms and unlocked row two upgrades in Atoms",

      onEnter() {
        player.a.stored.a = player.a.points;
        player.a.stored.c = player.c.points;
        player.a.stored.h = player.h.points;
        player.a.stored.v = player.v.points;

        ((player.c.points = new Decimal(0)),
          (player.a.points = new Decimal(0)),
          (player.v.points = new Decimal(0)),
          (player.h.points = new Decimal(0)));
      },
      onExit() {
        player.a.points = player.a.stored.a;
        player.c.points = player.a.stored.c;
        player.h.points = player.a.stored.h;
        player.v.points = player.a.stored.v;
      },
      rewardEffect() {
        return player.c.points.plus(1).pow(0.3);
      },
      rewardDisplay() {
        return format(challengeEffect(this.layer, this.id)) + "x";
      },
    },
    22: {
      name: "The Colossus Invasion",
      challengeDescription:
        "Combine challenge 12 and 21's effects(Deduction of life + Atominator) AND, a massive negative boost is applied to particle gain ",
      goalDescription: "Obtain 2e9 Quarks",
      canComplete: function () {
        return player.q.points.gte(2e9);
      },
      unlocked() {
        return hasUpgrade("hm", 36);
      },
      completionLimit: 1,
      rewardDescription:
        "Keep all atom challenges on further resets plus, Tetra boosts particle gain.",
      countsAs: [["12"], ["21"]],
      onEnter() {
        player.a.stored.a = player.a.points;
        player.a.stored.c = player.c.points;
        player.a.stored.h = player.h.points;
        player.a.stored.v = player.v.points;

        ((player.c.points = new Decimal(0)),
          (player.a.points = new Decimal(0)),
          (player.v.points = new Decimal(0)),
          (player.h.points = new Decimal(0)));
      },
      onExit() {
        player.a.points = player.a.stored.a;
        player.c.points = player.a.stored.c;
        player.h.points = player.a.stored.h;
        player.v.points = player.a.stored.v;
      },
      rewardEffect() {
        return player.t.points.plus(1).pow(0.75);
      },
      rewardDisplay() {
        return format(challengeEffect(this.layer, this.id)) + "x";
      },
    },
  },
});
