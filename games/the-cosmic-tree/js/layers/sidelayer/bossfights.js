addLayer("BF", {
  startData() {
    return {
      unlocked: true,
      points: new Decimal(1),
      mjolnir: new Decimal(0),
      stormbreaker: new Decimal(0),
      infinityCobble: new Decimal(0),
      oCannon: new Decimal(0),

      cooldown: 1000,
      bhp: 0,
      hp: 1,
      bossfightActive: false,
      placeholder: {
        name: "",
        dmg: 0,
        hp: 1e300,
        critdmg: 0,
        critChance: 0,
        reward: "",
        rewardAmount: new Decimal(1),
        cd: 1000,
      },
      bossfightTar: {
        name: "Tar",
        hp: 150,
        dmg: 10,
        critdmg: 0,
        critChance: 0,
        reward: "bdust",
        rewardAmount: new Decimal(1),
        cd: 100,
      },
      bossfightAdSnowman: {
        name: "Adominable Snowman",
        hp: 225,
        dmg: 20,
        critdmg: 45,
        critChance: 20,
        reward: "crystalFlake",
        rewardAmount: new Decimal(1),
        cd: 87,
      },

      multiplier() {
        let mult = new Decimal(1);
        return mult;
      },
      tarUnlocked: false,
      adSnowman: false,
    };
  },
  infoboxes: {
    axioms: {
      title: "Boss Fights",
      body() {
        return `Prepare to fight a boss using weapons you can occasionally find!
             `;
      },
    },
  },
  color: "#201869",

  row: "side",

  requires: new Decimal(10),
  tooltip() {
    return "Come fight some bosses!";
  },
  type: "none",
  exponent: 0.5,
  update() {
    if (getGridData("OS", 403) == 2)
      player[this.layer].oCannon = new Decimal(1);
    if (player.BF.bossfightActive == true) {
      if (player.BF.hp < 0) {
        player.BF.bossfightActive = false;
        player.boss = player.BF.placeholder;
        player.BF.hp = player.hp + player.armor;
        return;
      }
      if (player.BF.cooldown == 0) {
        if (player.boss.critChance > 0) {
          let chance = Math.random() * 100;

          if (chance <= player.boss.critChance) {
            player.BF.hp -= player.boss.critdmg;
          } else {
            player.BF.hp -= player.boss.dmg;
          }
        } else player.BF.hp = player.BF.hp - player.boss.dmg;
      }
      if (player.BF.cooldown < 0) {
        player.BF.cooldown = player.boss.cd;
      }
      player.BF.cooldown--;
      if (player.BF.bhp == 0) {
        player.boss = player.BF.placeholder;
      }
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
  bars: {
    hpbar: {
      direction: LEFT,
      width: 600,
      height: 50,
      fillStyle: { color: "blue", "background-color": "red" },
      textStyle: {
        "font-size": "20px",
        "font-family": "Arial",
        "text-align": "center",

        color: "white",
      },
      borderStyle: { border: "4px solid white", "border-radius": "0px" },
      display() {
        return player.BF.bhp + " Boss HP";
      },
      progress() {
        return player.BF.bhp / player.boss.hp;
      },
    },
    mybar: {
      direction: LEFT,
      width: 600,
      height: 50,
      fillStyle: { color: "blue", "background-color": "green" },
      textStyle: {
        "font-size": "20px",
        "font-family": "Arial",
        "text-align": "center",

        color: "white",
      },
      borderStyle: { border: "4px solid white", "border-radius": "0px" },
      display() {
        return player.BF.hp + "  Your HP";
      },
      progress() {
        return player.BF.hp / player.hp;
      },
    },
  },
  clickables: {
    101: {
      title: "Click me to attack",

      onClick() {
        if (player.BF.bhp > 0) {
          if (player.critChance > 0) {
            let chance = Math.random() * 100;

            if (chance <= player.critChance) {
              player.BF.bhp -= player.critdmg;
            } else {
              player.BF.bhp -= player.dmg;
            }
          } else player.BF.bhp = player.BF.bhp - player.dmg;
        }
        if (player.BF.bhp < 0) {
          player.BF.bossfightActive = false;

          player.ct[player.boss.reward] = player.ct[player.boss.reward].add(
            player.boss.rewardAmount.mul(player.BF.multiplier()),
          );
          player.boss = player.BF.placeholder;
        }
      },
      canClick() {
        return player.BF.bossfightActive;
      },
      style: {
        width: "200px",
        height: "200px",
      },
    },
    11: {
      title: "Fight Tar",
      display() {
        return "Dmg: 10 | HP: 150 | Cd: 100 ticks(for att) | Reward: 1 Black Dust";
      },
      onClick() {
        player.boss = player.BF.bossfightTar;
        player.BF.cooldown = player.boss.cd;
        player.BF.bhp = player.boss.hp;
        player.BF.hp = player.hp + player.armor;
        player.BF.bossfightActive = true;
      },
      canClick() {
        return true;
      },
      unlocked() {
        return player.BF.tarUnlocked;
      },
      style: {
        width: "150px",
        height: "150px",
        "font-size": "12px",
        "font-color": "#a09494",
        "background-image":
          "linear-gradient(90deg, rgb(119, 119, 129) 0%, rgb(149, 185, 167) 50%, rgb(172, 150, 175) 100%)",
      },
    },
    12: {
      title: "Fight Adominable Snowman",
      display() {
        return "Dmg: 20, 45 | crit chance: 20% | HP: 225 | Cd: 87 ticks(for att) | Reward: 1 Crystalized Snowflake";
      },
      onClick() {
        player.boss = player.BF.bossfightAdSnowman;
        player.BF.cooldown = player.boss.cd;
        player.BF.bhp = player.boss.hp;
        player.BF.hp = player.hp + player.armor;
        player.BF.bossfightActive = true;
      },
      canClick() {
        return true;
      },
      unlocked() {
        return player.BF.adSnowman;
      },
      style: {
        width: "150px",
        height: "150px",
        "font-size": "12px",
        "font-color": "#a09494",
        "background-image":
          "linear-gradient(90deg, rgb(119, 119, 129) 0%, rgb(149, 185, 167) 50%, rgb(172, 150, 175) 100%)",
      },
    },
  },
  tabFormat: {
    "Boss Fighting": {
      content: [
        ["infobox", "axioms"],
        ["bar", "mybar"],
        ["bar", "hpbar"],
        [
          "display-text",
          function () {
            return "cooldown: " + player.BF.cooldown + " ticks";
          },
        ],
        "blank",
        "blank",
        ["clickable", 101],
        ["blank", "50px"],
        [
          "row",
          [
            ["clickable", 11],
            ["clickable", 12],
          ],
        ],
      ],
    },
    Weapons: {
      content: [
        [
          "display-text",
          "Weapons will appear and be equippable as you unlock them",
          { "font-size": "20px" },
        ],
        "blank",
        [
          "display-text",
          () =>
            `
          Current stats: Damage: ` +
            player.dmg +
            ` | Crit Chance: ` +
            player.critChance * 100 +
            `% | Crit Damage: ` +
            player.critdmg +
            ` | Armor: ` +
            player.hp +
            ` HP(armor + 100) `,
          { "font-size": "30px" },
        ],
        "blank",
        [
          "display-text",
          () => `Currently equipped: ` + player.equipped,
          { "font-size": "35px" },
        ],
        "blank",
        [
          "row",
          [
            [
              "display-text",
              "Wood-Stick",
              {
                "font-size": "65px",
                "background-image":
                  "linear-gradient(90deg, #665226 0%, rgb(94, 68, 21) 50%, rgb(116, 96, 60) 100%)",
                border: "3px ridge black",
                "background-size": "700px 100px",
              },
            ],
            "blank",
            [
              "raw-html",
              `
              <button id='EquipButton' style='width: 100px; height: 100px;' onclick="weaponsFunction(this)" data-answer="Wood Stick" data-dmg="1" data-critchance="0" data-armor="0" data-critdmg="0">(Un)Equip!</button>`,
            ],
            "blank",
            [
              "display-text",
              "dmg: 1<br>  crit chance: 0%<br> armor: none",
              { "font-size": "20px" },
            ],
          ],
        ],
        function () {
          return player.ct.blackKnife.gte(1)
            ? [
                "row",
                [
                  [
                    "display-text",
                    "Black Knife",
                    {
                      "font-size": "65px",
                      "background-image":
                        "linear-gradient(90deg, #24211d 0%, rgb(44, 36, 22) 50%, rgb(49, 37, 15) 100%)",
                      border: "3px ridge black",
                      "background-size": "700px 100px",
                    },
                  ],
                  "blank",
                  [
                    "raw-html",
                    `
              <button id='EquipButton2' style='width: 100px; height: 100px;' onclick="weaponsFunction(this)" data-answer: "Black Knife">(Un)Equip!</button>`,
                  ],
                  "blank",
                  [
                    "display-text",
                    "dmg: 30<br>  crit chance: 15%<br> crit damage: 100<br> armor: +20HP",
                    { "font-size": "20px" },
                  ],
                ],
              ]
            : null;
        },
        function () {
          return player.BF.oCannon.gte(1)
            ? [
                "row",
                [
                  [
                    "display-text",
                    "Orbital Cannon",
                    {
                      "font-size": "65px",
                      "background-image":
                        "linear-gradient(90deg, #6b6a68 0%, rgb(77, 71, 61) 50%, rgb(80, 77, 70) 100%)",
                      border: "3px ridge black",
                      "background-size": "700px 100px",
                    },
                  ],
                  "blank",
                  [
                    "raw-html",
                    `
              <button id='EquipButton3' style='width: 100px; height: 100px;' onclick="weaponsFunction(this)" data-answer="Orbital Cannon" data-dmg="4" data-critchance="0" data-armor="50" data-critdmg="0">(Un)Equip!</button>`,
                  ],
                  "blank",
                  [
                    "display-text",
                    "dmg: 4<br> crit chance: 0<br> crit damage: N/A<br> armor: +50HP",
                    { "font-size": "20px" },
                  ],
                ],
              ]
            : null;
        },
      ],
    },
    Drops: {
      content: [
        [
          "display-text",
          function () {
            if (player.ct.bdust.gte(1))
              return (
                "You have " +
                format(player.ct.bdust) +
                " Black Dust | Effect: " +
                format(player.ct.bdustEffect1()) +
                "x -  boracite, cosmic dust, heavy multiplier + " +
                format(player.ct.bdustEffect2()) +
                "x - particles"
              );
          },
          { "font-size": "25px" },
        ],
        [
          "display-text",
          function () {
            if (player.ct.crystalFlake.gte(1))
              return (
                "You have " +
                format(player.ct.crystalFlake) +
                " Crystal Flake | Effect: " +
                format(player.ct.flakeEffect1()) +
                "x -  Fragments + " +
                format(player.ct.flakeEffect2()) +
                "x - Multipliers"
              );
          },
          { "font-size": "25px" },
        ],
      ],
    },
  },
});
