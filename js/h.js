addLayer("t", {
  name: "Time",
  symbol: "T",
  position: 3,
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
      time: new Decimal(1),
      whar: new Decimal(4),
    };
  },
  color: "",
  tooltip: "",
  confusion() {
    var texts = [
      "times obtained existance",
      "gregregations",
      "whar",
      "spck shenanigans",
    ];
  },
  funnyThing: `yeah`,
  row: "side",
  layerShown: true,
  // Little trolling snippets

  // ACTUAL CODE HERE ONWARDS
  update(delta) {
    player.t.time = player.t.time.add(tmp.t.timeCalculation.mul(delta));

    player.t.whar = player.t.whar.sub(tmp.t.whar.times(delta));
    if (player.t.whar.lte(0)) {
      player.t.whar = new Decimal(4);
      console.log("its time to kick gum and chew ass");
      tmp.t.what;
    }
  },
  timeCalculation() {
    let base = new Decimal(1);
    base = base.mul(buyableEffect("t", "FasterTimeI"));
    base = base.mul(buyableEffect("t", "FasterTimeII"));
    return base;
  },
  whar() {
    return new Decimal(1);
  },
  buyables: {
    FasterTimeI: {
      title() {
        var scale = ``;
        if (player[this.layer].buyables[this.id].gte(15)) {
          scale = `Super-Scaled`;
        }
        if (player[this.layer].buyables[this.id].gte(45)) {
          scale = `Ultra-Scaled`;
        }
        return `<t class='CTextS'>${scale} Time Fowarding</t>`;
      },
      description: `1.25x Time Speed`,
      cost(x) {
        let powI = new Decimal(2);
        let powII = new Decimal(2);
        if (player[this.layer].buyables[this.id].gte(15)) {
          powI = powI.mul(1.25);
          powII = powII.mul(1.25);
        }
        if (player[this.layer].buyables[this.id].gte(45)) {
          powI = powI.mul(1.275);
          powII = powII.mul(1.275);
        }
        return Decimal.pow(powI, x).pow(powII, x);
      },
      effect(x) {
        let pow = new Decimal(2);
        pow = pow.add(buyableEffect(this.layer, "BetterBaseI"));
        return Decimal.pow(pow, x);
      },
      display() {
        var S = tmp[this.layer].buyables[this.id];
        var SV = player[this.layer].buyables[this.id];
        return `<t class='CTextXS'>Times Bought: ${format(SV, 0)}
               ${format(S.effect)}x Time Speed<br>
               Cost: ${formatTime(S.cost)} Time</t>`;
      },
      buy() {
        player[this.layer].time = player[this.layer].time.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      canAfford() {
        return player[this.layer].time.gte(this.cost());
      },
    },
    BetterBaseI: {
      title() {
        var scale = ``;
        if (player[this.layer].buyables[this.id].gte(15)) {
          scale = `Super-Scaled`;
        }
        if (player[this.layer].buyables[this.id].gte(45)) {
          scale = `Ultra-Scaled`;
        }
        return `<t class='CTextS'>${scale} Time Streching</t>`;
      },
      description: ``,
      cost(x) {
        let powI = new Decimal(3);
        let powII = new Decimal(2);
        if (player[this.layer].buyables[this.id].gte(15)) {
          powI = powI.mul(1.25);
          powII = powII.mul(1.25);
        }
        if (player[this.layer].buyables[this.id].gte(45)) {
          powI = powI.mul(1.275);
          powII = powII.mul(1.275);
        }
        return Decimal.pow(powI, x).pow(powII, x).mul(500);
      },
      effect(x) {
        return Decimal.mul(0.15, x);
      },
      display() {
        var S = tmp[this.layer].buyables[this.id];
        var SV = player[this.layer].buyables[this.id];
        return `<t class='CTextXS'>Times Bought: ${format(SV, 0)}
                    +${format(S.effect)} Time Forwarding base<br>
                    Cost: ${formatTime(S.cost)} Time</t>`;
      },
      buy() {
        player[this.layer].time = player[this.layer].time.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      canAfford() {
        return player[this.layer].time.gte(this.cost());
      },
      unlocked() {
        return player[this.layer].buyables["FasterTimeI"].gte(5);
      },
    },
    FasterTimeII: {
      title() {
        var scale = ``;
        if (player[this.layer].buyables[this.id].gte(15)) {
          scale = `Super-Scaled`;
        }
        if (player[this.layer].buyables[this.id].gte(45)) {
          scale = `Ultra-Scaled`;
        }
        return `<t class='CTextS'>${scale} Fast Foward</t>`;
      },
      description: `1.25x Time Speed`,
      cost(x) {
        let powI = new Decimal(2.5);
        let powII = new Decimal(2.5);
        if (player[this.layer].buyables[this.id].gte(15)) {
          powI = powI.mul(1.25);
          powII = powII.mul(1.25);
        }
        if (player[this.layer].buyables[this.id].gte(45)) {
          powI = powI.mul(1.275);
          powII = powII.mul(1.275);
        }
        return Decimal.pow(powI, x).pow(powII, x).mul(1e6);
      },
      effect(x) {
        let pow = new Decimal(3);
        return Decimal.pow(pow, x);
      },
      display() {
        var S = tmp[this.layer].buyables[this.id];
        var SV = player[this.layer].buyables[this.id];
        return `<t class='CTextXS'>Times Bought: ${format(SV, 0)}
               ${format(S.effect)}x Time Speed<br>
               Cost: ${formatTime(S.cost)} Time</t>`;
      },
      buy() {
        player[this.layer].time = player[this.layer].time.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      canAfford() {
        return player[this.layer].time.gte(this.cost());
      },
    },
  },
  achievements: {
    11: {
      name: `Weird stuff`,
      done() {
        return player.t.buyables["FasterTimeI"].gte(1);
      },
      tooltip: `Get a buyable`,
    },
    12: {
      name: `The Hourglass`,
      done() {
        return player.t.time.gte(3600);
      },
      tooltip: `Make time go over 3,600 seconds`,
    },
    13: {
      name: `POV`,
      done() {
        return player.t.buyables["FasterTimeI"].gte(15);
      },
      style() {
        return {
          background: `url('whar/yeah.jpg')`,
          "background-size": "180%",
        };
      },
      tooltip: `you just got super-scaled lmafo`,
    },
  },
  tabFormat: {
    Main: {
      content: [
        [
          "raw-html",
          () => {
            return `<t class="CText">Time is at <t class="W-Highlighter">${formatTime(
              player.t.time,
            )}</t></t>`;
          },
        ],
        [
          "raw-html",
          () => {
            return `<t class="CTextS">Time moves at speed of  <t class="W-Highlighter">${formatTime(
              tmp.t.timeCalculation,
            )}</t> / sec</t>`;
          },
        ],
        "blank",
        "blank",
        [
          "row",
          [
            ["buyable", "FasterTimeI"],
            ["buyable", "BetterBaseI"],
            ["buyable", "FasterTimeII"],
          ],
        ],
      ],
    },
    Scaling: {
      content: [
        [
          "raw-html",
          () => {
            return `Scales exist. You can 'offset' them using Dilation upgrades ( soon<sup>TM</sup> )`;
          },
        ],
        [
          "raw-html",
          () => {
            if (player.t.buyables["FasterTimeI"].gte(15)) {
              return `
          Super Scaled — 1.25x Base Cost power<br>
          Starts after 15 of any buyable bought`;
            }
            return ``;
          },
        ],
        "blank",
        [
          "raw-html",
          () => {
            if (player.t.buyables["FasterTimeI"].gte(45)) {
              return `
         Ultra Scaled — 1.275x Base Cost power<br>
        Starts after 45 of any buyable bought`;
            }
            return ``;
          },
        ],
      ],
    },
    Achievements: {
      content: ["achievements"],
    },
  },
});
