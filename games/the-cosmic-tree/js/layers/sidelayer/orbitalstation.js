addLayer("OS", {
  startData() {
    return {
      unlocked: false,
      points: new Decimal(1),
      ccells: new Decimal(0),
      fOrgans: new Decimal(0),
      aLifeform: new Decimal(0),
      ccellsUnlocked: false,
      fOrgansUnlocked: false,
      aLifeformunlocked: false,

      sAntenna: new Decimal(0),

      mutatedParticle: new Decimal(0),
      cellAmalgamate: new Decimal(0),
      imperfectTissue: new Decimal(0),
      imperfectOrgan: new Decimal(0),
      humanityPurifyingProject: false,
      perfectEarth: new Decimal(0),
      perfectCrystal: new Decimal(0),
    };
  },

  color: "#868592",
  tooltip() {
    if (!player.OS.unlocked) {
      return "s p a c e";
    } else return "s p a c e";
  },
  row: "side",

  requires: new Decimal(10),
  tooltip() {
    return "You have 1 Orbital Station";
  },
  type: "none",
  exponent: 0.5,
  tabFormat: {
    Headquarters: {
      content: [
        "blank",
        "blank",
        [
          "display-text",
          "Welcome, enjoy the cosmic spectacles",
          { "font-size": "35px", "font-family": "Times New Roman" },
        ],
        [
          "display-text",
          function () {
            return player[this.layer].sAntenna.gte(1)
              ? "You have " +
                  format(player[this.layer].sAntenna) +
                  " Spatial Antennas"
              : null;
          },
          { "font-size": "20px", "font-family": "Times New Roman" },
        ],
        "blank",
        ["buyable", "14"],
      ],
    },
    Astronomy: {
      content: [
        [
          "display-text",
          "Scour through space using telescopes of all levels!",
          { "font-size": "35px", "font-family": "Times New Roman" },
        ],
        "blank",
        "grid",
      ],
    },
    "Orbital Station": {
      content: [
        [
          "display-text",
          "WELCOME TO THE IMPERIAL STATION, OR ORBITAL STATION. STATISTICS: UNKNOWN, GOAL: [redacted], PROCEED WITH CAUTION THROUGHOUT THE UNKNOWN EXPANSE",
          { "font-size": "35px", "font-family": "Times New Roman" },
        ],
        "blank",
        [
          "display-text",
          function () {
            return player[this.layer].ccells.gte(1)
              ? "YOU HAVE " +
                  format(player[this.layer].ccells) +
                  " COSMIC CELLS"
              : null;
          },
          { "font-size": "20px", "font-family": "Times New Roman" },
        ],
        [
          "display-text",
          function () {
            return player[this.layer].fOrgans.gte(1)
              ? "YOU HAVE " +
                  format(player[this.layer].fOrgans) +
                  " FOREIGN ORGANS"
              : null;
          },
          { "font-size": "20px", "font-family": "Times New Roman" },
        ],
        [
          "display-text",
          function () {
            return player[this.layer].aLifeform.gte(1)
              ? "YOU HAVE " +
                  format(player[this.layer].aLifeform) +
                  " ALIEN LIFEFORMS"
              : null;
          },
          { "font-size": "20px", "font-family": "Times New Roman" },
        ],
        ["buyable", "11"],
        ["buyable", "12"],
        ["buyable", "13"],
      ],
    },
  },
  grid: {
    rows: 4, // If these are dynamic make sure to have a max value as well!
    cols: 4,
    getStartData(id) {
      return 0;
    },
    getUnlocked(id) {
      // Default
      return true;
    },
    getCanClick(data, id) {
      if (data == 0) {
        return true;
      }
      if (data == 1) {
        switch (id) {
          case 104:
            return player.c.adt.gte(15) && player.c.t.gte(150);
          case 201:
            return player.c.sat.gte(15);
          case 302:
            return player.c.sat.gte(50) && player.c.t.gte(666);
          case 403:
            return player.c.sat.gte(150) && player.c.adt.gte(1000);
        }
      }
      return false;
    },
    onClick(data, id) {
      if (data == 1) {
        switch (id) {
          case 104:
            player[this.layer].grid[id]++;
            player.c.adt = player.c.adt.sub(15);
            player.c.t = player.c.t.sub(150);
            player.ce.unlocked = true;
            break;
          case 201:
            player[this.layer].grid[id]++;
            player.c.sat = player.c.sat.sub(15);
            break;
          case 302:
            player[this.layer].grid[id]++;
            player.c.sat = player.c.sat.sub(50);
            player.c.t = player.c.t.sub(666);
            break;
          case 403:
            player[this.layer].grid[id]++;
            player.c.sat = player.c.sat.sub(150);
            player.c.adt = player.c.adt.sub(1000);
            break;
        }
      }
      player[this.layer].grid[id]++;
    },
    getDisplay(data, id) {
      if (data == 0) {
        return "click me to discover!";
      }
      if (data == 1) {
        switch (id) {
          case 101:
          case 102:
          case 103:
          case 202:
          case 203:
          case 204:
          case 301:
          case 303:
          case 304:
          case 401:
          case 402:
          case 404:
            return "nothing here";
        }
        switch (id) {
          case 104:
            return "15 Advanced Telescopes and 150 Telescopes to unlock cells";
          case 201:
            return "15 Super Advanced Telescopes for a 5x Cosmic Dust Boost";
          case 302:
            return "50 Super Advanced Telescopes and 666 Telescopes for a 10x Particle Boost";
          case 403:
            return "150 Super Advanced Telescopes and 1000 Advanced Telescopes to unlock the orbital cannon weapon";
        }
      }
    },
    getTooltip(data, id) {},
    getStyle(data, id) {
      let style = {
        width: "100px",
        height: "100px",
      };
      if (data == 1) {
        switch (id) {
          case 101:
          case 102:
          case 103:
          case 202:
          case 203:
          case 204:
          case 301:
          case 303:
          case 304:
          case 401:
          case 402:
          case 404:
            return { ...style, "background-color": "blue" };
        }
        switch (id) {
          case 104:
          case 201:
          case 302:
          case 403:
            return { ...style, "background-color": "yellow" };
        }
      }
      if (data == 2) {
        switch (id) {
          case 104:
            return { ...style, "background-color": "green" };
          case 201:
            return { ...style, "background-color": "green" };
          case 302:
            return { ...style, "background-color": "green" };
          case 403:
            return { ...style, "background-color": "green" };
        }
      }

      return { ...style };
    },
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
  buyables: {
    11: {
      cost(x) {
        return new Decimal(1e20).mul(
          player[this.layer].ccells.plus(1).mul(100),
        );
      },
      display() {
        return (
          "FIRST ASSIGNMENT: DOCUMENT ALIEN LIFE" +
          " | Cell cost: " +
          format(this.cost()) +
          " | Cosmic Dust: " +
          format(this.cost())
        );
      },

      canAfford() {
        return (
          player.ce.points.gte(this.cost()) && player.c.points.gte(this.cost())
        );
      },
      unlocked() {
        return player[this.layer].ccellsUnlocked;
      },
      buy() {
        player.ce.points = player.ce.points.sub(this.cost());
        player.c.points = player.c.points.sub(this.cost());

        player[this.layer].ccells = player[this.layer].ccells.add(1);

        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: {
        "border-radius": "1000px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "16px",
        width: "300px",
        height: "300px",
        animation: "move 7s ease-in-out infinite",
      },
    },
    12: {
      cost(x) {
        return new Decimal(100).add(player[this.layer].fOrgans.plus(1));
      },
      display() {
        return (
          "SECOND ASSIGNMENT: COLLECT ORGANIC SAMPLES" +
          " | Cosmic Cell Cost: " +
          format(this.cost())
        );
      },

      canAfford() {
        return player[this.layer].ccells.gte(this.cost());
      },
      unlocked() {
        return player[this.layer].fOrgansUnlocked;
      },
      buy() {
        player[this.layer].ccells = player[this.layer].ccells.sub(this.cost());

        player[this.layer].fOrgans = player[this.layer].fOrgans.add(1);

        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: {
        "border-radius": "1000px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "16px",
        width: "300px",
        height: "300px",
        animation: "move 5.6s ease-in-out infinite",
      },
    },
    13: {
      cost(x) {
        return new Decimal(100).add(player[this.layer].aLifeform.plus(1));
      },
      display() {
        return (
          "THIRD ASSIGNMENT: STUDY ALIEN LIFEFORMS" +
          " | Foreign Organ Cost: " +
          format(this.cost())
        );
      },

      canAfford() {
        return player[this.layer].fOrgans.gte(this.cost());
      },
      unlocked() {
        return player[this.layer].aLifeformunlocked;
      },
      buy() {
        player[this.layer].fOrgans = player[this.layer].fOrgans.sub(
          this.cost(),
        );

        player[this.layer].aLifeform = player[this.layer].aLifeform.add(1);

        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: {
        "border-radius": "1000px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "16px",
        width: "300px",
        height: "300px",
        animation: "move 7.2s ease-in-out infinite",
      },
    },
    14: {
      cost(x) {
        return new Decimal(100);
      },
      display() {
        return (
          "Convert Super Advanced telescopes into Spatial Antennas" +
          " | SAT cost: " +
          format(this.cost())
        );
      },

      canAfford() {
        return player.c.sat.gte(this.cost());
      },

      buy() {
        player.c.sat = player.c.sat.sub(this.cost());

        player[this.layer].sAntenna = player[this.layer].sAntenna.add(1);

        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "16px",
        width: "200px",
        height: "200px",
      },
    },
  },
});
