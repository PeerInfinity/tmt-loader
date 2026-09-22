addLayer("ach", {
  startData() {
    return {
      unlocked() {
        return true;
      },
      points: new Decimal(0),
      halfway: false,
    };
  },
  symbol: "ACH",
  name: "Achievements",
  color: "#dbdbdb",
  row: "side",
  baseResource: "particles",
  resource: "achievements",
  baseAmount() {
    return player.points;
  },
  requires: new Decimal(10),
  type: "none",
  exponent: 0.5,
  update() {
    if (player.vo.points.gte(1)) {
      player[this.layer].halfway = true;
    }
  },
  gainMult() {
    return new Decimal(1);
  },
  gainExp() {
    return new Decimal(1);
  },
  layerShown() {
    return true;
  },
  tabFormat: {
    achievements: {
      content: [
        "main-display",
        [
          "row",
          [
            ["achievement", 11],
            ["achievement", 12],
            ["achievement", 13],
            ["achievement", 14],
            ["achievement", 15],
            ["achievement", 16],
            ["achievement", 17],
          ],
        ],
        [
          "row",
          [
            ["achievement", 21],
            ["achievement", 22],
            ["achievement", 23],
            ["achievement", 24],
            ["achievement", 25],
            ["achievement", 26],
            ["achievement", 27],
          ],
        ],
        [
          "row",
          [
            ["achievement", 31],
            ["achievement", 32],
            ["achievement", 33],
            ["achievement", 34],
            ["achievement", 35],
            ["achievement", 36],
            ["achievement", 37],
          ],
        ],
        [
          "row",
          [
            ["achievement", 41],
            ["achievement", 42],
            ["achievement", 43],
            ["achievement", 44],
            ["achievement", 45],
            ["achievement", 46],
            ["achievement", 47],
          ],
        ],
        [
          "row",
          [
            ["achievement", 51],
            ["achievement", 52],
            ["achievement", 53],
            ["achievement", 54],
            ["achievement", 55],
            ["achievement", 56],
            ["achievement", 57],
          ],
        ],
        [
          "row",
          [
            ["achievement", 61],
            ["achievement", 62],
            ["achievement", 63],
            ["achievement", 64],
            ["achievement", 65],
            ["achievement", 66],
            ["achievement", 67],
          ],
        ],
        [
          "row",
          [
            ["achievement", 71],
            ["achievement", 72],
            ["achievement", 73],
            ["achievement", 74],
            ["achievement", 75],
            ["achievement", 76],
            ["achievement", 77],
          ],
        ],
        [
          "row",
          [
            ["achievement", 81],
            ["achievement", 82],
            ["achievement", 83],
            ["achievement", 84],
            ["achievement", 85],
            ["achievement", 86],
            ["achievement", 87],
          ],
        ],
        [
          "row",
          [
            ["achievement", 91],
            ["achievement", 92],
            ["achievement", 93],
            ["achievement", 94],
            ["achievement", 95],
            ["achievement", 96],
            ["achievement", 97],
          ],
        ],
        ["h-line", "800px"],
        [
          "row",
          [
            ["achievement", 101],
            ["achievement", 102],
            ["achievement", 103],
            ["achievement", 104],
            ["achievement", 105],
            ["achievement", 106],
            ["achievement", 107],
          ],
        ],
      ],
    },
  },
  achievements: {
    11: {
      name: "Experienced",
      done() {
        return player.points.gte(100);
      },
      tooltip: "obtain 100 particles",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    12: {
      name: "Varied",
      done() {
        return player.m.points.gte(10);
      },
      tooltip: "obtain 10 multipliers",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    13: {
      name: "Secondary engagement",
      done() {
        return player.q.points.gte(1);
      },
      tooltip: "obtain 1 quark",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    14: {
      name: "Subcurrency grind",
      done() {
        return player.q.uq.gte(1);
      },
      tooltip: "obtain 1 up quark",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    15: {
      name: "Downtown",
      done() {
        return player.q.dq.gte(1);
      },
      tooltip: "obtain 1 down quark",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    16: {
      name: "Doctor Strange",
      done() {
        return player.q.sq.gte(1);
      },
      tooltip: "obtain 1 strange quark",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    17: {
      name: "Too Strange",
      done() {
        return player.q.sq.gte(666);
      },
      tooltip: "OKAY this is weird",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    21: {
      name: "Prince Charming",
      done() {
        return player.q.cq.gte(1);
      },
      tooltip: "Self-evident",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    22: {
      name: "Top of the barrel",
      done() {
        return player.q.tq.gte(1);
      },
      tooltip: "The barrel lives and breaths",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    23: {
      name: "Bottom of the barrel",
      done() {
        return player.q.bq.gte(1);
      },
      tooltip: "The barrel sulks and sighs",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    24: {
      name: "Hyper",
      done() {
        return player.h.points.gte(1);
      },
      tooltip: "The hyper bar was scrapped, don't worry",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    25: {
      name: "Womanizer",
      done() {
        return player.a.points.gte(1);
      },
      tooltip: "You're such a womanizer",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    26: {
      name: "Smooth music",
      done() {
        return player.v.points.gte(1);
      },
      tooltip: "How quaint",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    27: {
      name: "The Grinder",
      done() {
        return player.points.gte(1e9);
      },
      tooltip: "Looser",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    31: {
      name: "Periodic",
      done() {
        return player.a.neutrons.gte(1);
      },
      tooltip: "Hydrogen a good time",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },

      unlocked() {
        return true;
      },
    },
    32: {
      name: "True atomizer",
      done() {
        return hasChallenge("a", 11);
      },
      tooltip: "What an atomizer",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    33: {
      name: "Dusty trail",
      done() {
        return player.c.points.gte(1);
      },
      tooltip: "I reckon its time for cosmic exploration",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    34: {
      name: "Exploration",
      done() {
        return player.c.t.gte(1);
      },
      tooltip: "Telescopes away",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    35: {
      name: "Radar technology",
      done() {
        return player.c.adt.gte(1);
      },
      tooltip: "Advancing society",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    36: {
      name: "Deep Space",
      done() {
        return getClickableState("c", 35);
      },
      tooltip: "You shall not traverse",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    37: {
      name: "Dr. Heinz Doofenshmirtz",
      done() {
        return hasChallenge("a", 12);
      },
      tooltip: "Behold the world's tiniest violinator",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    41: {
      name: "Super-radar technology",
      done() {
        return player.c.sat.gte(1);
      },
      tooltip: "Super-advancing society",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    42: {
      name: "HEAVY!!!",
      done() {
        return player.hm.points.gte(1);
      },
      tooltip: "It's so heavy it affects the achievement",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
      style: {
        width: "150px",
        height: "150px",
      },
    },
    43: {
      name: "THE POWERHOUSE",
      done() {
        return player.ce.mito.gte(1);
      },
      tooltip: "Mitochondria",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    44: {
      name: "Deoxyribose",
      done() {
        return player.ce.nucleus.gte(1);
      },
      tooltip: "Nucleus",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    45: {
      name: "Ribosomic",
      done() {
        return player.ce.endr.gte(1);
      },
      tooltip: "Endoplasmic reticulum",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    46: {
      name: "The Vacuum",
      done() {
        return player.ce.vacu.gte(1);
      },
      tooltip: "Vacuole",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    51: {
      name: "Golgarity",
      done() {
        return player.ce.golgi.gte(1);
      },
      tooltip: "Golgi",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    52: {
      name: "Gooey",
      done() {
        return player.ce.cytoplasm.gte(1);
      },
      tooltip: "Cytoplasm",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    53: {
      name: "THE QUEST FOR LIFE",
      done() {
        return player.ce.points.gte(1);
      },
      tooltip: "1 CELL",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    54: {
      name: "Tetrated Prism",
      done() {
        return player.t.points.gte(1);
      },
      tooltip: "1 tetra",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    55: {
      name: "Powerized frequencies",
      done() {
        return player.ct.amult.gte(1);
      },
      tooltip: "1 atomic multiplier",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    56: {
      name: "The Grand Bulwark",
      done() {
        return player.b.points.gte(1);
      },
      tooltip: "1 boracite",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    57: {
      name: "The Junkyard",
      done() {
        return player.chm.points.gte(1);
      },
      tooltip: "1 mechanical multiplier",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    61: {
      name: "Bloody Hell",
      done() {
        return player.ce.bloodcells.gte(1);
      },
      tooltip: "1 blood cell",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    62: {
      name: "Cold Liver",
      done() {
        return player.ce.hepaticcells.gte(1);
      },
      tooltip: "1 liver(hepatic) cell",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    63: {
      name: "Breathables",
      done() {
        return player.ce.lungcells.gte(1);
      },
      tooltip: "1 lung cell",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    64: {
      name: "Kinetic",
      done() {
        return player.ce.bonecells.gte(1);
      },
      tooltip: "1 bone cell",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    65: {
      name: "Energy",
      done() {
        return player.ce.musclecells.gte(1);
      },
      tooltip: "1 muscle cell",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    66: {
      name: "Urine Core",
      done() {
        return player.ce.renalcells.gte(1);
      },
      tooltip: "1 renal(kidney) cell",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    67: {
      name: "Brain Power",
      done() {
        return player.ce.neurons.gte(1);
      },
      tooltip: "1 Neuron",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    71: {
      name: "Industrial Hell",
      done() {
        return player.chm.droneMK1.gte(1);
      },
      tooltip: "1 Drone Mark 1",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    72: {
      name: "Mechanical Monsters",
      done() {
        return player.chm.droneMK2.gte(1);
      },
      tooltip: "1 Drone Mark 2",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    73: {
      name: "Agaentian Paradise",
      done() {
        return player.b.Agate.gte(1);
      },
      tooltip: "1 Agate",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    74: {
      name: "Orpimental Chaos",
      done() {
        return player.b.Orpiment.gte(1);
      },
      tooltip: "1 Orpiment",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    75: {
      name: "Panenital",
      done() {
        return player.b.Panenite.gte(1);
      },
      tooltip: "1 Panenite",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    76: {
      name: "Dawn of the Colossus",
      done() {
        return player.mm.points.gte(1);
      },
      tooltip: "1 Mega Multiplier",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    77: {
      name: "The Ice Kingdom",
      done() {
        return player.n.points.gte(1);
      },
      tooltip: "1 Nissionite",
      effect() {
        player.c.permanetGeneration = true;
      },
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    81: {
      name: "Absolute Zero Paradise",
      done() {
        return hasUpgrade("n", 24);
      },
      tooltip: "The minimum temperature",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    82: {
      name: "Dynasty of the Cosmos",
      done() {
        return player.d.points.gte(1);
      },
      tooltip: "Spacetime itself is tearing at the immense increments you hold",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    83: {
      name: "Retaliation of the Cosmos",
      done() {
        return hasChallenge("d", 13);
      },
      tooltip: "Spacetime strikes back!",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    84: {
      name: "Reign of the Primates",
      done() {
        return hasChallenge("d", 13);
      },
      tooltip: "Sage of logic: Socrates",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    85: {
      name: "The Demon's Tail",
      done() {
        return hasChallenge("d", 15);
      },
      tooltip: "The Demon's Tail begins to tear apart the Cosmos...",
      style() {
        if (this.done()) {
          return {
            "background-color": "black",
            "font-color": "white",
          };
        }
      },
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    86: {
      name: "End of Humanity",
      done() {
        return hasChallenge("d", 18);
      },
      tooltip: "They're gone... but you were never human to begin with",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    87: {
      name: "Dawn of a New Era",
      done() {
        return player.o.points.gte(1);
      },
      tooltip: "A singular Organ!",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    91: {
      name: "Theory of Evolution",
      done() {
        return player.e.points.gte(1);
      },
      tooltip: "An unrelenting enterprise",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    92: {
      name: "Energetic Foundations",
      done() {
        return player.nm.points.gte(1);
      },
      tooltip: "Unlimited Power!",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    93: {
      name: "Unlimited Power!",
      done() {
        return player.nm.energy.gte(1);
      },
      tooltip: "Unlimited Power!",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    94: {
      name: "Conditional Swirling",
      done() {
        return player.sm.points.gte(1);
      },
      tooltip: "A legendary material",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    95: {
      name: "Forewarned Obsidian",
      done() {
        return player.sm.starglass.gte(1);
      },
      tooltip: "Glass",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    96: {
      name: "Massless Construct",
      done() {
        return player.ac.neutrino.gte(1);
      },
      tooltip: "1 Neutrino",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    97: {
      name: "The Axiomic Problem",
      done() {
        return player.ax.points.gte(1);
      },
      tooltip: "1 Axiom",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
    },
    101: {
      name: "THE VOLTAIC SECTOR",
      done() {
        return player.vo.points.gte(1);
      },
      tooltip: "The halfway mark",
      onComplete() {
        player[this.layer].points = player[this.layer].points.add(1);
      },
      style: {
        width: "125px",
        height: "125px",
        animation: "spin 5s linear infinite",
      },
    },
  },
});
