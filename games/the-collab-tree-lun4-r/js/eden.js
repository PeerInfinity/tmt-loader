addLayer("e", {
  name: "Lycoris",
  symbol: "L",
  startData() {
    return {
      unlocked: false,
      points: Decimal.dZero,
      tre: Decimal.dZero,
      bpm: Decimal.dZero,
    };
  },
  color: "#E0E1CC",
  resource: "Lycoris Flowers",
  row: 2,
  branches: ["tdr"],

  baseResource: "Dice Roll Points",
  base: 3.5,
  canReset() {
    return hasChallenge("tdr", 11);
  },
  baseAmount() {
    return player.tdr.totalroll;
  },
  requires: new Decimal(222),
  type: "static",
  exponent: 0.5,
  gainMult: Decimal.dOne,
  gainExp: Decimal.dOne,
  layerShown() {
    return player.tdr.points.gte(15) || player.e.unlocked;
  },
  tabFormat: {
    "Milestones of Amnehilesie": {
      unlocked: true,
      content: [
        [
          "display-text",
          () =>
            "You have planted " +
            colored("e", format(player.e.points)) +
            " Lycoris Flowers, in the Amnehilesie of Eden.",
        ],
        "prestige-button",
        "blank",
        "milestones",
      ],
    },
    "Challenges of Lycoris": {
      unlocked() {
        return hasMilestone("e", 4);
      },
      content: [
        [
          "display-text",
          () =>
            "You have planted " +
            colored("e", format(player.e.points)) +
            " Lycoris Flowers, in the Amnehilesie of Eden.",
        ],
        "prestige-button",
        "blank",
        "challenges",
      ],
    },
  },
  milestones: {
    0: {
      requirementDescription:
        "Welcome to the Amnehilesie of Eden, Esteemed Guests. (1 total Lycoris Flower Planted)",
      effectDescription:
        "Oh, You only started planting these flowers? Don't worry, our butlers will give you a 5x boost to point gain to help you plant these faster.",
      done() {
        return player.e.total.gte(1);
      },
    },
    1: {
      requirementDescription:
        "These flowers aren't going to plant themselves... (2 Total Lycoris Flowers planted)",
      effectDescription:
        "Maybe you'll need some more help. Don't worry, we will support you with upgrades and passive gain to your previous endenavors, although, passive gain will have to be at a minimum since this is still experimental for us. Only 1%!",
      done() {
        return player.e.total.gte(2);
      },
    },
    2: {
      requirementDescription:
        "You're starting to get the hang of it, congrats. (5 Total Lycoris Flowers planted)",
      effectDescription:
        "I think you will need another boost from our butlers. The Gambles you make in total are now boosted by 2x.",
      done() {
        return player.e.total.gte(5);
      },
    },
    3: {
      requirementDescription:
        "You planted a potful of Lycoris Flowers. (10 Total Lycoris Flowers planted)",
      effectDescription:
        "You are really helping us out, however, we are starting to run out of things to give you... Boost Tuber and COVID gain by 3x.",
      done() {
        return player.e.total.gte(10);
      },
    },
    4: {
      requirementDescription:
        "I think you planted a lot for our Amnehilesie... (25 Total Lycoris Flowers planted)",
      effectDescription: "I think you deserve a challenge for this reward.",
      done() {
        return player.e.total.gte(25);
      },
    },
  },
  challenges: {
    11: {
      name: "TremENDouS",
      challengeDescription:
        "TremENDouS Power watches over you like leaves in a cherry blossom.",
      goalDescription() {
        return `I want you to reach ${format(
          tmp["e"].challenges[11].goal,
        )} points while nerfed by the songs current BPM.`;
      },
      goal() {
        return new Decimal(1e50);
      },
      canComplete: function () {
        return player.points.gte(1e50);
      },
      rewardDescription:
        "Base Cost is reduced by .25 and gain is slightly boosted by ^1.02.",
      onEnter() {
        player.e.bpm = new Decimal(150);
        player.e.tre = new Decimal(0);
      },
      onExit() {
        player.e.bpm = new Decimal(0);
        player.e.tre = new Decimal(0);
      },
    },
    12: {
      name: "Kowloon",
      challengeDescription:
        "The Famous Walled City of Kowloon. Sounds like a nightmare to live in right?",
      goalDescription() {
        return `Well, get to ${format(
          tmp["e"].challenges[12].goal,
        )} points while trapped in this Labyrinth of a nerf. (^0.0667185)`;
      },
      goal() {
        return new Decimal(1255000);
      },
      canComplete: function () {
        return player.points.gte(1255000);
      },
      rewardDescription:
        "Roll time is cut in half, and CV and TB gain are boosted by ^1.255.",
    },
  },
  update(diff) {
    let treGain = new Decimal(0);
    if (inChallenge("e", 11)) treGain = new Decimal(1);
    player.e.tre = player.e.tre.add(treGain.times(diff));
    if (player.e.tre.gte(0) && player.e.tre.lt(28.8))
      player.e.bpm = new Decimal(150);
    if (player.e.tre.gte(28.8) && player.e.tre.lt(30.3))
      player.e.bpm = new Decimal(160);
    if (player.e.tre.gte(30.3) && player.e.tre.lt(31.671))
      player.e.bpm = new Decimal(175);
    if (player.e.tre.gte(31.671) && player.e.tre.lt(32.969))
      player.e.bpm = new Decimal(185);
    if (player.e.tre.gte(32.969) && player.e.tre.lt(34.169))
      player.e.bpm = new Decimal(200);
    if (player.e.tre.gte(34.169) && player.e.tre.lt(127.038))
      player.e.bpm = new Decimal(230);
    if (player.e.tre.gte(34.169) && player.e.tre.lt(127.038))
      player.e.bpm = new Decimal(230);
    if (player.e.tre.gte(127.038) && player.e.tre.lt(129.271))
      player.e.bpm = new Decimal(215);
    if (player.e.tre.gte(129.271) && player.e.tre.lt(131.671))
      player.e.bpm = new Decimal(200);
    if (player.e.tre.gte(131.671) && player.e.tre.lt(134.197))
      player.e.bpm = new Decimal(190);
    if (player.e.tre.gte(134.197) && player.e.tre.lt(136.864))
      player.e.bpm = new Decimal(180);
    if (player.e.tre.gte(136.864) && player.e.tre.lt(139.687))
      player.e.bpm = new Decimal(170);
    if (player.e.tre.gte(139.687) && player.e.tre.lt(142.596))
      player.e.bpm = new Decimal(165);
    if (player.e.tre.gte(142.596) && player.e.tre.lt(199.596))
      player.e.bpm = new Decimal(160);
    if (player.e.tre.gte(199.596) && player.e.tre.lt(202.796))
      player.e.bpm = new Decimal(150);
    if (player.e.tre.gte(202.796) && player.e.tre.lt(206.225))
      player.e.bpm = new Decimal(140);
    if (player.e.tre.gte(206.225) && player.e.tre.lt(240.003))
      player.e.bpm = new Decimal(135);
    if (player.e.tre.gte(240.003) && player.e.tre.lt(241.849))
      player.e.bpm = new Decimal(130);
    if (player.e.tre.gte(241.849) && player.e.tre.lt(257.849))
      player.e.bpm = new Decimal(120);
    if (player.e.tre.gte(257.849) && player.e.tre.lt(259.695))
      player.e.bpm = new Decimal(130);
    if (player.e.tre.gte(259.695) && player.e.tre.lt(261.409))
      player.e.bpm = new Decimal(140);
    if (player.e.tre.gte(261.409) && player.e.tre.lt(263.009))
      player.e.bpm = new Decimal(150);
    if (player.e.tre.gte(263.009) && player.e.tre.lt(264.509))
      player.e.bpm = new Decimal(160);
    if (player.e.tre.gte(264.509) && player.e.tre.lt(265.921))
      player.e.bpm = new Decimal(170);
    if (player.e.tre.gte(265.921) && player.e.tre.lt(267.254))
      player.e.bpm = new Decimal(180);
    if (player.e.tre.gte(267.254) && player.e.tre.lt(268.518))
      player.e.bpm = new Decimal(190);
    if (player.e.tre.gte(268.518) && player.e.tre.lt(269.688))
      player.e.bpm = new Decimal(205);
    if (player.e.tre.gte(269.688) && player.e.tre.lt(270.779))
      player.e.bpm = new Decimal(220);
    if (player.e.tre.gte(270.779) && player.e.tre.lt(271.801))
      player.e.bpm = new Decimal(235);
    if (player.e.tre.gte(271.801) && player.e.tre.lt(380.281))
      player.e.bpm = new Decimal(250);
    if (player.e.tre.gte(380.281) && player.e.tre.lt(382.127))
      player.e.bpm = new Decimal(260);
    if (player.e.tre.gte(382.127) && player.e.tre.lt(383.904))
      player.e.bpm = new Decimal(270);
    if (player.e.tre.gte(383.904) && player.e.tre.lt(385.619))
      player.e.bpm = new Decimal(280);
    if (player.e.tre.gte(385.619)) player.e.bpm = new Decimal(285);
    if (inChallenge("e", 11)) {
      if (player.e.tre > 445.433) {
        alert(
          "!23M3ND0U5 P0W32 HA5 C0N5UM3D Y0U F20M W1!H1N. !2Y A6A1N N3X! !1M3.",
        );
        player.e.fail = 1;
        player.e.activeChallenge = null;
        doReset("e", true);
        player.e.tre = 0;
      }
    }
  },
});
