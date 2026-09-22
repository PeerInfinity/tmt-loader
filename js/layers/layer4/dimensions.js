addLayer("d", {
  name: "Dimensions", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      variable: new Decimal(0),
      polymetrics: new Decimal(0),
      polymetricsReceived: new Decimal(0),
      basalt: new Decimal(0),

      polygave: false,
      polygave2: false,
      polygave3: false,
      polygave4: false,
      polygave5: false,
      polygave6: false,
      polygave7: false,
      polygave8: false,

      squareGameCompleted: false,
      cosmicQuizCompleted: false,
      earthNuked: false,

      challengeCompletedFunction() {
        let challengeDocker = 0;
        for (const id of player.d.upgrades) {
          if (hasUpgrade("d", id)) {
            challengeDocker++;
          } else continue;
        }
        if (challengeDocker >= 40) return true;
        else return false;
      },
      code1: "hyperspace",
    };
  },
  infoboxes: {
    socrates: {
      title: "Socrates",
      body() {
        return `An ancient greek philosopher, responsible for inspiring many of the great thinkers. Not much is known about Socrates
             because he didn't write much about himself, instead we refer to the work of his pupils, Plato and Xenophon, who depict Socrates differently.
             Socrates was known to challenge the beleifs of Athens at his time, often exposing the ignorance of politicans and high-ranking officials. People
             disliked Socrates because of his critiques of Athenian society, and so, he was eventually sentenced to death by the democracy of Athens.
             `;
      },
    },
    time: {
      title: "4th Dimension",
      body() {
        return `Time is our 4th dimension, the one we cannot escape. So far, not much can be said about time, because our understanding is very limited, however, 
            it can be irrefutably said that time passes, we cannot escape the foward march of time.
             `;
      },
    },
    newton: {
      title: "Sir Issac Newton",
      body() {
        return `Yes, an apple does fall. Issac Newton is the renound scientist for discovering gravity, by witnessing an apple fall from the tree in his home in London
            during a plague isolation, and connecting that force to the one keeping the Moon in orbit. Newton also 'invented' calculus, however this is highly contested as 
            evidence claims one Gottfried Leibniz also developed calculus and published before Newton. Even still, Newton made the ground breaking discovery of gravity
             `;
      },
    },
    aristotle: {
      title: "Aristotle",
      body() {
        return `Aristotle, the mentor of Alexander the Great, supposed Earth was at the center of the Universe, and so followed a firmly held beleif in a geocentric universe,
            until eventually this was disproven. Aristotle established groundwork for modern science and logic. Although his geocentrism was disproven, it was still massively important in 
            understanding space. Aristotle reasoned 'nature abhors a vacuum' arguing Space is not empty space, this is also wrong, but the same quote is applied to psychology nowadays.
             `;
      },
    },
    euclid: {
      title: "Euclid",
      body() {
        return `The Father of Geometry from Ancient Greece, who established many theorems that dominated the field until the 19th century. Not much is known
            about Euclid, some scholars theorize he even studied at Plato's academy. Anyways, his work remains deeply important to modern day geometry.
             `;
      },
    },
    darwin: {
      title: "Charles Darwin",
      body() {
        return `He traveled to the Galapagos Islands in order to study unique species. Darwin noticed the slight variations in animals across the islands and 
            later created the theory of evolution. Evolution has proven to be largely true, and Darwin's work has paved the way for our modern classification of animal nomenclature
            and the taxonomic ranking.
             `;
      },
    },
    einstein: {
      title: "Albert Einstein",
      body() {
        return `A genius in theoretical physics, now renound for his energy equation 'E = mc^2' Energy equals mass times the speed of light squared. Einstein was born
            to the Kingdom of Württemberg but relinquished his citizenship to move to Switzerland to study mathematics and physics. His work also laid the groundwork for Bose-Einstein
            condensates, a now known state of matter. Einstein warned U.S. President Franklin D. Roosevelt that Germany may be developing atomic bombs, which catalyzed the Manhattan Project
             `;
      },
    },
    opp: {
      title: "J. Robert Oppenheimer",
      body() {
        return `Oppenheimer is another genius in theoretical physics, born in NYC but earned his degree in chemistry from Harvard. In 1942, Oppenheimer
            was recruited to work on the Manhattah Project, and was assigned director of the Los Alamos Laboratory. Oppenheimer continued to lecture and write physics after
            the atomic bombs were dropped on Japan
             `;
      },
    },
    sTheory: {
      title: "String Theory",
      body() {
        return `String Theory is a very difficult to explain theory, but in an nutshell, it unifies ALL of physics, which is a nigh-impossible task. It seeks to combine General Relativity,
            which is gravity and space, planets, essentially a macroscopic scale, and Quantum Mechanics(microscopic physics). String theory proposes that there are up to 11 dimensions, hence why this layer has 11. Further,
            string theory suggests elementary particles like electrons and photons are made up of one-dimensional strings that 'vibrate' in space. String Theory is incredibly complex, but if true, would unify and solve
            many difficult problems regarding physics.
             `;
      },
    },
  },
  polymetricsReceived() {
    let amount = buyableEffect("d", 11);
    if (amount === undefined) amount = new Decimal(0);
    return new Decimal(1).mul(amount);
  },
  basaltMultiplier() {
    let mult = new Decimal(1);

    return mult;
  },
  color: "#4d4a79",
  requires: new Decimal(100), // Can be a function that takes requirement increases into account
  resource: "Dimensional Points", // Name of prestige currency
  baseResource: "Tetras", // Name of resource prestige is based on
  baseAmount() {
    return player.t.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  doReset(reset) {
    let keep = [];

    keep.push("variable");
    if (layers[reset].row > this.row) {
      layerDataReset("d", keep);
    }
  },
  onPrestige() {
    if (getBuyableAmount("d", 11).gte(1))
      player.d.polymetrics = player.d.polymetrics.plus(
        this.polymetricsReceived(),
      );
  },
  update() {
    if (player.d.points >= 1) {
      player.d.variable = new Decimal(1);
    }
  },
  exponent: 0.5, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (hasMilestone("sm", 3)) mult = mult.add(2);
    if (hasMilestone("nm", 4)) mult = mult.add(10);
    mult = mult.times(player.b.megatronicsMultiplier());
    if (hasUpgrade("d", 21)) mult = mult.times(upgradeEffect("d", 21));
    if (getBuyableAmount("d", 12).gte(1))
      mult = mult.times(buyableEffect("d", 12));
    if (getBuyableAmount("ct", 21).gte(1))
      mult = mult.times(buyableEffect("ct", 21));
    if (player.chm.mechanicalBomb.gte(1))
      mult = mult.times(buyableEffect("chm", 24)[0]);
    if (hasUpgrade("d", 36)) mult = mult.times(2);

    if (hasUpgrade("d", 49)) mult = mult.times(2);
    if (hasMilestone("sm", 2)) mult = mult.times(2);
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    return new Decimal(1);
  },
  nodeStyle() {
    if (player.d.unlocked == true || tmp.d.canReset == true)
      return {
        "background-image": "linear-gradient( #2b2e55, #38326b)",
        animation: "hologram 1s linear infinite",
        "text-shadow": "0 0 30px rgb(255, 255, 255)",
        "box-shadow":
          "0 0 20px rgb(255, 255, 255), inset 0 0 20px rgb(255, 255, 255)",
      };
  },

  row: 3, // Row the layer is in on the tree (0 is the first row)
  branches: ["t", "o", "b"],
  hotkeys: [
    {
      key: "d",
      description: "D: Reset for dimensions",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return player.n.unlocked;
  },
  tabFormat: {
    "Requiem for Verses": {
      content: [
        [
          "main-display",
          function () {
            return "main-display";
          },
          { "font-family": "Times New Roman" },
        ],
        [
          "prestige-button",
          function () {
            return "prestige-button";
          },
          { "border-radius": "0px" },
        ],
        [
          "display-text",
          "Dimensions are fun, aren't they? We can only really process the 2nd and 3rd dimension. Limitations aside, you have to push onward. Unlock up to the 11th dimension.",
          { "font-size": "21px" },
        ],
        "blank",
        [
          "display-text",
          function () {
            return (
              "<br>You have " + format(player.d.polymetrics) + " Polymetrics "
            );
          },
          {
            "font-size": "40px",
            display: "inline-block",
            color: "#beb6b6",
            border: "2px ridge #989898",
            "background-size": "cover",
            "background-position": "center",
            "background-origin": "border-box",
            "background-repeat": "no-repeat",
            width: "600px",
            height: "120px",
            background:
              "radial-gradient(circle at 50% 40%, rgb(23, 8, 90) 0%, rgb(23, 12, 90) 40%, rgb(8, 7, 61) 100%)",
          },
        ],
        function () {
          return hasUpgrade("d", 22)
            ? [
                "display-text",
                "<br>You have " + format(player.d.basalt) + " Basalt ",
                {
                  "font-size": "40px",
                  display: "inline-block",
                  color: "#beb6b6",
                  border: "2px ridge #989898",
                  "background-size": "cover",
                  "background-position": "center",
                  "background-origin": "border-box",
                  "background-repeat": "no-repeat",
                  width: "600px",
                  height: "120px",
                  background:
                    "radial-gradient(circle at 50% 40%, rgb(65, 63, 73) 0%, rgb(61, 60, 68) 40%, rgb(8, 7, 61) 100%)",
                },
              ]
            : null;
        },
        "blank",

        ["display-text", "The First Dimension", { "font-size": "30px" }],
        [
          "row",
          [
            ["upgrade", "11"],
            ["upgrade", "12"],
            ["upgrade", "13"],
            ["upgrade", "14"],
            ["challenge", "11"],
            ["buyable", "11"],
          ],
        ],
        ["blank", "30px"],
        function () {
          return hasChallenge("d", 11)
            ? ["display-text", "The Second Dimension", { "font-size": "30px" }]
            : null;
        },
        function () {
          return hasChallenge("d", 11)
            ? [
                "row",
                [
                  ["upgrade", "15"],
                  [
                    "raw-html",
                    `<div><button id="black" onclick="blackSquare()" type="button" style='width: 100px; height: 100px; border: 2px solid white; box-sizing: border-box; background-color: black; position: relative'></button></div>`,
                  ],
                  ["upgrade", "16"],
                  ["upgrade", "17"],
                  ["upgrade", "18"],
                ],
              ]
            : null;
        },
        function () {
          return hasChallenge("d", 11) ? ["challenge", "12"] : null;
        },
        function () {
          return hasChallenge("d", 12)
            ? ["display-text", "The Third Dimension", { "font-size": "30px" }]
            : null;
        },
        function () {
          return hasChallenge("d", 12)
            ? [
                "row",
                [
                  ["upgrade", "19"],
                  ["upgrade", "20"],
                  ["upgrade", "21"],
                  ["upgrade", "22"],
                  ["upgrade", "23"],
                  ["upgrade", "24"],
                  ["challenge", "13"],
                  hasChallenge("d", 12)
                    ? [
                        "raw-html",
                        `<div class='horizontalBox' style='width: 700px; height: 600px; border: 2px solid white; box-sizing: border-box;'><br>
                <br><button id="orange" onclick="orangeSquare()" type="button" style='width: 100px; height: 100px; border: 2px solid white; box-sizing: border-box; background-color: orange;'></button>
                <br><button id="yellow" onclick="yellowSquare()" type="button" style='width: 100px; height: 100px; border: 2px solid white; box-sizing: border-box; background-color: yellow;  left: 225px; top: 2300px'></button>
                <button id="purple" onclick="purpleSquare()" type="button" style='width: 100px; height: 100px; border: 2px solid white; box-sizing: border-box; background-color: purple;  left: 625px; top: 2300px'></button>
                <br><button id="red" onclick="initiateSquareGame()" type="button" style='width: 100px; height: 100px; border: 2px solid white; box-sizing: border-box; background-color: red; ; left: 427px; top: 2400px'>Click to begin!</button>
                <br><button id="green" onclick="greenSquare()" type="button" style='width: 100px; height: 100px; border: 2px solid white; box-sizing: border-box; background-color: green;  left: 225px; top: 2500px'></button>
                <button id="blue" onclick="blueSquare()" type="button" style='width: 100px; height: 100px; border: 2px solid white; box-sizing: border-box; background-color: blue;  left: 625px; top: 2500px'></button>
                <br><button id="cyan" onclick="cyanSquare()"  type="button" style='width: 100px; height: 100px; border: 2px solid white; box-sizing: border-box; background-color: cyan; left: 427px; top: 2635px;'></button>
                </div>`,
                      ]
                    : null,
                ],
              ]
            : null;
        },
      ],
    },
    "Dawn of the Primates": {
      content: [
        function () {
          return hasChallenge("d", 13)
            ? [
                "display-text",
                "The Fourth Dimension | Villa of Philosophy",
                { "font-size": "30px" },
              ]
            : null;
        },
        function () {
          return hasChallenge("d", 13) ? ["infobox", "socrates"] : null;
        },
        function () {
          return hasChallenge("d", 13) ? ["infobox", "time"] : null;
        },
        function () {
          return hasChallenge("d", 13)
            ? [
                "row",
                [
                  ["upgrade", "25"],
                  ["upgrade", "26"],
                  ["upgrade", "27"],
                  ["upgrade", "28"],
                  ["upgrade", "29"],
                ],
              ]
            : null;
        },
        function () {
          return hasChallenge("d", 13)
            ? [
                "row",
                [
                  ["buyable", "12"],
                  ["challenge", "14"],
                  ["buyable", "13"],
                ],
              ]
            : null;
        },
        function () {
          return hasChallenge("d", 14)
            ? [
                "display-text",
                "The Fifth Dimension | Cradle of Gravity",
                { "font-size": "30px" },
              ]
            : null;
        },
        function () {
          return hasChallenge("d", 13) ? ["infobox", "newton"] : null;
        },
        function () {
          return hasChallenge("d", 14)
            ? [
                "row",
                [
                  ["buyable", "14"],
                  ["buyable", "15"],
                  ["buyable", "16"],
                  ["buyable", "17"],
                  ["buyable", "18"],
                  ["buyable", "19"],
                  ["upgrade", "30"],
                ],
              ]
            : null;
        },
        function () {
          return hasUpgrade("d", 30)
            ? [
                "display-text",
                "The Sixth Dimension | Geocentrism",
                { "font-size": "30px" },
              ]
            : null;
        },
        function () {
          return hasUpgrade("d", 30) ? ["infobox", "aristotle"] : null;
        },
        function () {
          return hasUpgrade("d", 30) ? ["row", [["challenge", "15"]]] : null;
        },
        function () {
          return hasUpgrade("d", 30)
            ? [
                "raw-html",
                `<div class='horizontalBox' style='width: 700px; height: 600px; border: 2px solid white; box-sizing: border-box;'>
            <br><div id="quizIntro" style='width: 400px; height: 100px; border: 2px solid white; box-sizing: border-box; font-size: 30px; font-family: Times New Roman;'>Click begin to start the quiz</div>
            <br><button id="startButtonQ" onclick="initiateQuiz()"style='width: 100px; height: 100px; border: 2px solid white; box-sizing: border-box; font-size: 30px; font-family: Times New Roman; background-color: lightblue;'>Begin!</button>
            <br><br><br><br><button id="answerButtonQ1" onclick="processQuiz1()"style='width: 200px; height: 100px; margin-right: 80px; border: 2px solid white; box-sizing: border-box; font-size: 30px; font-family: Times New Roman; background-color: lightblue;'>Placeholder</button>
            <button id="answerButtonQ2" onclick="processQuiz2()"style='width: 200px; height: 100px; border: 2px solid white; box-sizing: border-box; font-size: 30px; font-family: Times New Roman; background-color: lightblue;'>Placeholder</button>
            <br><br><br><br><button id="answerButtonQ3" onclick="processQuiz3()"style='width: 200px; height: 100px; margin-right: 80px; border: 2px solid white; box-sizing: border-box; font-size: 30px; font-family: Times New Roman; background-color: lightblue;'>Placeholder</button>
            <button id="answerButtonQ4" onclick="processQuiz4()"style='width: 200px; height: 100px; border: 2px solid white; box-sizing: border-box; font-size: 30px; font-family: Times New Roman; background-color: lightblue;'>Placeholder</button>
            </div>`,
              ]
            : null;
        },
      ],
    },
    "Father of Geometry": {
      content: [
        function () {
          return hasChallenge("d", 15)
            ? [
                "display-text",
                "The Seventh Dimension | Euclidian Embark",
                { "font-size": "30px" },
              ]
            : null;
        },
        function () {
          return hasChallenge("d", 15) ? ["infobox", "euclid"] : null;
        },
        function () {
          return hasChallenge("d", 15)
            ? [
                "row",
                [
                  ["upgrade", "31"],
                  ["upgrade", "32"],
                  ["upgrade", "33"],
                  ["upgrade", "34"],
                  ["upgrade", "35"],
                ],
              ]
            : null;
        },
        function () {
          return hasChallenge("d", 15) ? ["row", [["challenge", "16"]]] : null;
        },
        function () {
          return hasChallenge("d", 16)
            ? [
                "display-text",
                "The Eighth Dimension | Eden of Evolution",
                { "font-size": "30px" },
              ]
            : null;
        },
        function () {
          return hasChallenge("d", 16) ? ["infobox", "darwin"] : null;
        },
        function () {
          return hasChallenge("d", 16)
            ? [
                "row",
                [
                  ["upgrade", "36"],
                  ["upgrade", "37"],
                  ["upgrade", "38"],
                  ["upgrade", "39"],
                  ["buyable", "20"],
                ],
              ]
            : null;
        },
        function () {
          return hasChallenge("d", 16) ? ["row", [["challenge", "17"]]] : null;
        },
        function () {
          return hasChallenge("d", 17)
            ? [
                "display-text",
                "The Nineth Dimension | The Manhattan Project",
                { "font-size": "30px" },
              ]
            : null;
        },
        function () {
          return hasChallenge("d", 17) ? ["infobox", "einstein"] : null;
        },
        function () {
          return hasChallenge("d", 17) ? ["infobox", "opp"] : null;
        },
        function () {
          return hasChallenge("d", 17) ? ["row", [["challenge", "18"]]] : null;
        },
        function () {
          return inChallenge("d", 18)
            ? [
                "raw-html",
                `<div class='horizontalBox' style='width: 700px; height: 600px; border: 2px solid white; box-sizing: border-box;'>
                <br><br><br><br><br><button  id="Earth" onclick='end()' style="border-radius: 1000px; width: 350px; height: 350px; background-color: green; ">Don't do it... don't click!</button></div>`,
              ]
            : null;
        },
      ],
    },
    "String Theory": {
      content: [
        function () {
          return hasChallenge("d", 18)
            ? [
                "display-text",
                "The Tenth Dimension | Awakenings of Creation",
                { "font-size": "30px" },
              ]
            : null;
        },
        function () {
          return hasChallenge("d", 18) ? ["infobox", "sTheory"] : null;
        },
        function () {
          return hasChallenge("d", 18)
            ? [
                "row",
                [
                  ["upgrade", "40"],
                  ["upgrade", "41"],
                  ["upgrade", "42"],
                  ["upgrade", "43"],
                  ["upgrade", "44"],
                  ["upgrade", "45"],
                  ["upgrade", "46"],
                  ["upgrade", "47"],
                  ["upgrade", "48"],
                  ["upgrade", "49"],
                  ["upgrade", "50"],
                ],
              ]
            : null;
        },
        function () {
          return hasChallenge("d", 18) ? ["row", [["challenge", "19"]]] : null;
        },
        function () {
          return hasChallenge("d", 19)
            ? [
                "display-text",
                "The Eleventh Dimension | The Quest For Life",
                { "font-size": "30px" },
              ]
            : null;
        },
        function () {
          return hasChallenge("d", 19) ? ["row", [["upgrade", "51"]]] : null;
        },
      ],
    },
  },
  upgrades: {
    11: {
      title: "A Whole New World",
      description:
        "Start you journey with a +10 Tetra boost, and 5 polymetrics",
      cost: new Decimal(1),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
      effect() {
        if (hasUpgrade("d", 11)) {
          if (!player.d.polygave) {
            player.d.polymetrics = player.d.polymetrics.plus(5);
            player.d.polygave = true;
          }
        }
      },
    },
    12: {
      title: "The Brink of Continuum",
      description: "+15 polymetrics, +2 tetra boost, x100 Vinyl Boost",
      cost: new Decimal(2),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
      effect() {
        if (hasUpgrade("d", 12)) {
          if (!player.d.polygave2) {
            player.d.polymetrics = player.d.polymetrics.plus(15);
            player.d.polygave2 = true;
          }
        }
      },
    },
    13: {
      title: "Garden of Wilted Thoughts",
      description: "+40 polymetrics",
      cost: new Decimal(4),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
      effect() {
        if (hasUpgrade("d", 12)) {
          if (!player.d.polygave3) {
            player.d.polymetrics = player.d.polymetrics.plus(40);
            player.d.polygave3 = true;
          }
        }
      },
    },
    14: {
      title: "Spacetime Distortion",
      description: "+40 polymetrics, +10 tetra boost",
      cost: new Decimal(7),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
      effect() {
        if (hasUpgrade("d", 12)) {
          if (!player.d.polygave4) {
            player.d.polymetrics = player.d.polymetrics.plus(40);
            player.d.polygave4 = true;
          }
        }
      },
    },
    15: {
      title: "Return to Subordinary",
      description: "+80 polymetrics, x250 Vinyl boost",
      cost: new Decimal(12),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
      effect() {
        if (hasUpgrade("d", 12)) {
          if (!player.d.polygave5) {
            player.d.polymetrics = player.d.polymetrics.plus(80);
            player.d.polygave5 = true;
          }
        }
      },
    },
    16: {
      title: "Cosmic Spectacles",
      description: "x100 million Atom boost, x1e12 Cosmic Dust Boost",
      cost: new Decimal(15),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
    },
    17: {
      title: "Soul in the Idol",
      description: "x1.5 cell boost",
      cost: new Decimal(17),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
    },
    18: {
      title: "Sage of Logic",
      description: "+400 polymetrics",
      cost: new Decimal(18),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
      effect() {
        if (hasUpgrade("d", 12)) {
          if (!player.d.polygave6) {
            player.d.polymetrics = player.d.polymetrics.plus(400);
            player.d.polygave6 = true;
          }
        }
      },
    },
    19: {
      title: "Spirit of Creation",
      description:
        "Clicking a snowflake has a minor chance to give 50 polymetrics, may increase later.",
      cost: new Decimal(20),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
    },
    20: {
      title: "Coat of Elements",
      description: "Unlock Gluons in Alchemy Lab",
      cost: new Decimal(22),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
    },
    21: {
      title: "Bastion of Spatial Boons",
      description: "Double Dimensional Point gain",
      cost: new Decimal(24),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
      effect() {
        return new Decimal(2);
      },
    },
    22: {
      title: "Creation's Hollows",
      description: "Unlock Basalt as a new subcureency here",
      cost: new Decimal(48),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
    },
    23: {
      title: "Earth's Temptations",
      description: "x1.5 cell boost(again)",
      cost: new Decimal(50),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
      effect() {
        return new Decimal(1.5);
      },
    },
    24: {
      title: "Inferno Incarnate",
      description: "Unlock fire as a craftable",
      cost: new Decimal(52),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
    },
    25: {
      title: "Authentic Athens",
      description: "+10 Basalt, + 100 Tetra boost",
      cost: new Decimal(52),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
      onPurchase() {
        player.d.basalt = player.d.basalt.plus(10);
      },
    },
    26: {
      title: "Democratic Rage",
      description: "+15 Basalt",
      cost: new Decimal(70),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
      onPurchase() {
        player.d.basalt = player.d.basalt.plus(15);
      },
    },
    27: {
      title: "Lossy Integrity",
      description: "+20 Basalt, UNLOCK A BOSS FIGHT",
      cost: new Decimal(90),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
      onPurchase() {
        player.d.basalt = player.d.basalt.plus(20);
        player.BF.tarUnlocked = true;
      },
    },
    28: {
      title: "Socrates' Strikes",
      description: "+100 Basalt, +1000 polymetrics, +100 tetra boost",
      cost: new Decimal(111),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
      onPurchase() {
        player.d.basalt = player.d.basalt.plus(100);
        player.d.polymetrics = player.d.polymetrics.plus(1000);
      },
    },
    29: {
      title: "Sentenced to Death",
      description:
        "+150 Basalt, unlock bastion craftable, improve length buyable",
      cost: new Decimal(141),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },

      onPurchase() {
        player.d.basalt = player.d.basalt.plus(150);
      },
    },
    30: {
      title: "Angry Earth",
      description:
        "+1000 Basalt, +1000 polymetrics, +1000 tetra Boost, Unlock the 6th dimension, Geocentrism",
      cost: new Decimal(200),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },

      onPurchase() {
        player.d.basalt = player.d.basalt.plus(150);
      },
    },
    31: {
      title: "Plato's outreach",
      description: "2x Cell, 20x Boracite, +500 Tetra boost",
      cost: new Decimal(200),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
    },
    32: {
      title: "Indescribable Heat",
      description: "Free 5 Units of fire, 5 Bastions, 5000 Polymetrics",
      cost: new Decimal(300),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
      onPurchase() {
        player.ct.fire = player.ct.fire.plus(5);
        player.ct.bastion = player.ct.bastion.plus(5);
        player.d.polymetrics = player.d.polymetrics.plus(5000);
      },
    },
    33: {
      title: "1st Dimension Collapses",
      description: "Not Good... Dimensional Points now boost Particle Gain",
      cost: new Decimal(350),
      effect() {
        return new Decimal(5).mul(player[this.layer].points.mul(15));
      },
      effectDisplay() {
        return "Currently: " + format(this.effect()) + "x";
      },
      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
    },
    34: {
      title: "2nd Dimension Collapses",
      description:
        "Very not good... +1000 Tetra boost, +10K polymetrics, +10 Bastion.",
      cost: new Decimal(10),
      currencyDisplayName: "Units of Fire",
      currencyInternalName: "fire",
      currencyLayer: "ct",

      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
      onPurchase() {
        player.ct.bastion = player.ct.bastion.plus(10);
        player.d.polymetrics = player.d.polymetrics.plus(10000);
      },
    },
    35: {
      title: "The Great War",
      description:
        "A battle across the Cosmos... + 15 Units of Fire, 1.5x Nissionite and MM boost ",
      cost: new Decimal(20000),
      currencyDisplayName: "Polymetrics",
      currencyInternalName: "polymetrics",
      currencyLayer: "d",

      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
      onPurchase() {
        player.ct.fire = player.ct.fire.plus(15);
      },
    },
    36: {
      title: "Fickle Variation",
      description: "Double Dimensional Point gain ",
      cost: new Decimal(4000),
      currencyDisplayName: "Basalt",
      currencyInternalName: "basalt",
      currencyLayer: "d",

      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
    },
    37: {
      title: "Galapagos Paradox",
      description: "Nissionite now boosts Particles ",
      effectDisplay() {
        return "Currently: " + format(this.effect()) + "x";
      },
      cost: new Decimal(400),

      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
      effect() {
        return new Decimal(67).mul(player.n.points.plus(1).mul(67));
      },
    },
    38: {
      title: "Evolutionary Dictum",
      description: "Improve quarks's upgrade 13",

      cost: new Decimal(500),

      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
    },
    39: {
      title: "The Garden of Eden",
      description:
        "1e12 Cosmic Dust boost, unlock a new prokaryote, raise DNA and RNA cap to be based on total Nucleii",

      cost: new Decimal(550),

      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
    },
    40: {
      title: "Omnicide",
      description: "The Earth is gone... 2x Cell boost",

      cost: new Decimal(650),

      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
    },
    41: {
      title: "Ends of the Earth",
      description: "+5000 Tetra boost",
      currencyDisplayName: "Polymetrics",
      currencyInternalName: "polymetrics",
      currencyLayer: "d",
      cost: new Decimal(75000),

      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
    },
    42: {
      title: "3rd Dimension Collapses",
      description: "10x Heavy Multiplier boost",
      currencyDisplayName: "basalt",
      currencyInternalName: "basalt",
      currencyLayer: "d",
      cost: new Decimal(8000),

      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
    },
    43: {
      title: "Spacetime Tearing",
      description: "100x Boracite Gain",

      cost: new Decimal(666),

      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
    },
    44: {
      title: "4th Dimension Collapses",
      description: "1e12x Atom Gain",

      cost: new Decimal(800),

      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
    },
    45: {
      title: "Explosions Galore",
      description: "1e13x Cosmic Dust Gain",

      cost: new Decimal(900),

      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
    },
    46: {
      title: "5th Dimension Collapses",
      description: "10x Vinyl Gain",

      cost: new Decimal(1000),

      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
    },
    47: {
      title: "6th Dimension Collapses",
      description: "2x Mega Multiplier Gain",

      cost: new Decimal(1100),

      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
    },
    48: {
      title: "7th Dimension Collapses",
      description: "2x Nissionite Gain",

      cost: new Decimal(1200),

      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
    },
    49: {
      title: "8th and 9th Dimensions Collapse",
      description: "2x Dimensional Point Gain",

      cost: new Decimal(1400),

      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
    },
    50: {
      title: "Universal Take-over",
      description: "1e9 Particle boost",

      cost: new Decimal(2000),

      style: {
        width: "200px",
        height: "200px",
        "font-size": "17px",
      },
    },
    51: {
      title: "The Quest For Life",
      description: `Here it is... Earth is gone, Humanity is gone...
        But your goal is simple, OUR goal is simple. We start anew, a civilization that can
        further our incremental gains, the path is clear, the journey is simple, 100x cell boost. Get 15k blood cells, and continue`,

      cost: new Decimal(2500),

      style: {
        width: "400px",
        height: "400px",
        "font-size": "18px",
      },
    },
  },
  buyables: {
    11: {
      cost(x) {
        return new Decimal(5).mul(x.plus(1));
      },
      title: "Length",
      display() {
        return (
          "Receive " +
          format(this.effect(getBuyableAmount(this.layer, this.id))) +
          " Polymetrics on reset. " +
          "cost: " +
          format(this.cost()) +
          " polymetrics"
        );
      },
      canAfford() {
        return player[this.layer].polymetrics.gte(this.cost());
      },
      effect(x) {
        if (hasUpgrade("d", 29)) return new Decimal(12).mul(x.plus(10).mul(25));
        else return x.plus(1);
      },

      canBuyMax: true,
      buyMax() {
        let costPerUnit = this.cost();

        let max = new Decimal(1);

        max = player.d.polymetrics.div(costPerUnit).floor();
        if (max.lte(1)) {
          max = new Decimal(1);
        }

        return [max, costPerUnit];
      },
      buy() {
        let [max, costPerUnit] = this.buyMax();
        player.d.polymetrics = player.d.polymetrics.sub(costPerUnit.mul(max));

        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        width: "275px",
        height: "275px",
        "font-size": "22px",
      },
    },
    12: {
      cost(x) {
        return new Decimal(25).mul(x.plus(1));
      },
      title: "Corrupted Youth",
      display() {
        return (
          "Fire now boosts dimensional points | cost: " +
          format(this.cost()) +
          " basalt | Currently: " +
          format(buyableEffect("d", 12)) +
          "x boost"
        );
      },
      canAfford() {
        return player[this.layer].basalt.gte(this.cost());
      },
      effect(x) {
        return new Decimal(1).add(player.ct.fire.times(0.1));
      },

      canBuyMax: true,
      buyMax() {
        let costPerUnit = this.cost();

        let max = new Decimal(1);

        max = player.d.basalt.div(costPerUnit).floor();
        if (max.lte(1)) {
          max = new Decimal(1);
        }

        return [max, costPerUnit];
      },
      buy() {
        let [max, costPerUnit] = this.buyMax();
        player.d.basalt = player.d.basalt.sub(costPerUnit.mul(max));

        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        width: "275px",
        height: "275px",
        "font-size": "22px",
      },
    },
    13: {
      cost(x) {
        return new Decimal(75).mul(x.plus(1));
      },
      title: "Denounced Gods",
      display() {
        return (
          "Boost Tetra with +levels using basalt | cost: " +
          format(this.cost()) +
          " basalt | Currently: " +
          format(buyableEffect("d", 13)) +
          "x boost"
        );
      },
      canAfford() {
        return player[this.layer].basalt.gte(this.cost());
      },
      effect(x) {
        return new Decimal(1).add(player.ct.fire.times(0.5));
      },

      canBuyMax: true,
      buyMax() {
        let costPerUnit = this.cost();

        let max = new Decimal(1);

        max = player.d.basalt.div(costPerUnit).floor();
        if (max.lte(1)) {
          max = new Decimal(1);
        }

        return [max, costPerUnit];
      },
      buy() {
        let [max, costPerUnit] = this.buyMax();
        player.d.basalt = player.d.basalt.sub(costPerUnit.mul(max));

        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        width: "275px",
        height: "275px",
        "font-size": "22px",
      },
    },
    14: {
      cost(x) {
        return new Decimal(50).mul(x.plus(1));
      },
      title: "Forest of Virtue",
      display() {
        return (
          "Boost Mega Multiplier! | cost: " +
          format(this.cost()) +
          " dimensional points | Currently: " +
          format(buyableEffect("d", 14)) +
          "x boost"
        );
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      effect(x) {
        return new Decimal(1).add(x.mul(0.7));
      },

      buyMax() {
        let costPerUnit = this.cost();

        let max = new Decimal(1);

        max = player.d.points.div(costPerUnit).floor();
        if (max.lte(1)) {
          max = new Decimal(1);
        }

        return [max, costPerUnit];
      },
      buy() {
        let [max, costPerUnit] = this.buyMax();
        player.d.points = player.d.points.sub(costPerUnit.mul(max));

        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        width: "275px",
        height: "275px",
        "font-size": "22px",
      },
    },
    15: {
      cost(x) {
        return new Decimal(300).mul(x.plus(1));
      },
      title: "High-English Mathematics",
      display() {
        return (
          "Boost Cells! | cost: " +
          format(this.cost()) +
          " polymetrics | Currently: " +
          format(buyableEffect("d", 15)) +
          "x boost"
        );
      },
      canAfford() {
        return player[this.layer].polymetrics.gte(this.cost());
      },
      effect(x) {
        return new Decimal(1).add(x.mul(0.7));
      },

      buyMax() {
        let costPerUnit = this.cost();

        let max = new Decimal(1);

        max = player.d.polymetrics.div(costPerUnit).floor();
        if (max.lte(1)) {
          max = new Decimal(1);
        }

        return [max, costPerUnit];
      },
      buy() {
        let [max, costPerUnit] = this.buyMax();
        player.d.polymetrics = player.d.polymetrics.sub(costPerUnit.mul(max));

        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        width: "275px",
        height: "275px",
        "font-size": "22px",
      },
    },
    16: {
      cost(x) {
        return new Decimal(222);
      },
      title: "Calculus Battle",
      display() {
        return (
          "Convert Polymetrics to Basalt! | cost: " +
          format(this.cost()) +
          " polymetrics"
        );
      },
      canAfford() {
        return player[this.layer].polymetrics.gte(this.cost());
      },

      buyMax() {
        let costPerUnit = this.cost();

        let max = new Decimal(1);

        max = player.d.polymetrics.div(costPerUnit).floor();
        if (max.lte(1)) {
          max = new Decimal(1);
        }

        return [max, costPerUnit];
      },
      buy() {
        let [max, costPerUnit] = this.buyMax();
        player.d.polymetrics = player.d.polymetrics.sub(costPerUnit.mul(max));
        player.d.basalt = player.d.basalt.add(max.mul(17));

        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        width: "275px",
        height: "275px",
        "font-size": "22px",
      },
    },
    17: {
      cost(x) {
        return new Decimal(20.5).mul(x.plus(1));
      },
      title: "Integrating Pies",
      display() {
        return (
          "Boost Nissionite! | cost: " +
          format(this.cost()) +
          " basalt" +
          " | currently: " +
          format(this.effect()) +
          "x"
        );
      },
      canAfford() {
        return player[this.layer].basalt.gte(this.cost());
      },
      effect(x) {
        return new Decimal(1).add(x.mul(0.5));
      },

      buyMax() {
        let costPerUnit = this.cost();

        let max = new Decimal(1);

        max = player.d.basalt.div(costPerUnit).floor();
        if (max.lte(1)) {
          max = new Decimal(1);
        }

        return [max, costPerUnit];
      },
      buy() {
        let [max, costPerUnit] = this.buyMax();
        player.d.basalt = player.d.basalt.sub(costPerUnit.mul(max));
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        width: "275px",
        height: "275px",
        "font-size": "22px",
      },
    },
    18: {
      cost(x) {
        return new Decimal(66.6).mul(x.plus(1));
      },
      title: "Differential Apples",
      display() {
        return (
          "Boost Particles! | cost: " +
          format(this.cost()) +
          " Dimensional Points" +
          " | currently: " +
          format(this.effect()) +
          "x"
        );
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      effect(x) {
        return new Decimal(1.75).pow(x);
      },

      buyMax() {
        let costPerUnit = this.cost();

        let max = new Decimal(1);

        max = player.d.points.div(costPerUnit).floor();
        if (max.lte(1)) {
          max = new Decimal(1);
        }

        return [max, costPerUnit];
      },
      buy() {
        let [max, costPerUnit] = this.buyMax();
        player.d.points = player.d.points.sub(costPerUnit.mul(max));
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        width: "275px",
        height: "275px",
        "font-size": "22px",
      },
    },
    19: {
      cost(x) {
        return new Decimal(666).mul(x.plus(1));
      },
      title: "THE DEMON'S TAIL",
      display() {
        return (
          "Boost Tetra! | cost: " +
          format(this.cost()) +
          " Polymetrics" +
          " | currently: " +
          format(this.effect()) +
          "x"
        );
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      effect(x) {
        return new Decimal(6.66).mul(x);
      },

      buyMax() {
        let costPerUnit = this.cost();

        let max = new Decimal(1);

        max = player.d.points.div(costPerUnit).floor();
        if (max.lte(1)) {
          max = new Decimal(1);
        }

        return [max, costPerUnit];
      },
      buy() {
        let [max, costPerUnit] = this.buyMax();
        player.d.points = player.d.points.sub(costPerUnit.mul(max));
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        width: "275px",
        height: "275px",
        "font-size": "22px",
        animation: "slice 20s ease infinite",
      },
    },
    20: {
      cost(x) {
        return new Decimal(1500)
          .mul(x.plus(1).plus(2))
          .mul(x.mul(0.05).plus(1));
      },
      title: "Icy Emboldening",
      display() {
        return (
          "Get more polymetrics when clicking snowflakes | cost: " +
          format(this.cost()) +
          " Polymetrics" +
          " | currently: " +
          "50+" +
          format(this.effect())
        );
      },
      canAfford() {
        return player[this.layer].polymetrics.gte(this.cost());
      },
      effect(x) {
        return new Decimal(1000).mul(x);
      },

      buyMax() {
        let costPerUnit = this.cost();

        let max = new Decimal(1);

        max = player.d.polymetrics.div(costPerUnit).floor();
        if (max.lte(1)) {
          max = new Decimal(1);
        }

        return [max, costPerUnit];
      },
      buy() {
        let [max, costPerUnit] = this.buyMax();
        player.d.polymetrics = player.d.polymetrics.sub(costPerUnit.mul(max));
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        width: "275px",
        height: "275px",
        "font-size": "22px",
      },
    },
  },
  challenges: {
    11: {
      name: "Complex of Sanctity",
      challengeDescription:
        "Apply a softcap to Atoms, the more dimensional points you have, the less harsh the softcap",
      rewardDescription: "Unlocked the 2nd dimension",
      goalDescription: "Get 1e9 Atoms",
      canComplete: function () {
        return player.a.points.gte(1e9);
      },
      style: {
        "border-radius": "0px",
        "font-size": "20px",
      },
    },
    12: {
      name: "Ode to Mother Nature",
      challengeDescription: "Accumulate 100 cells!",
      rewardDescription: "Unlock another prokaryote and the third dimension",
      goalDescription: "Get 100 cells",
      canComplete: function () {
        return player.ce.points.gte(100);
      },
      style: {
        "border-radius": "0px",
        "font-size": "20px",
      },
    },
    13: {
      name: "Jet field Vortex",
      challengeDescription: "Complete the square minigame",
      rewardDescription: "Unlock the 4th, Dawn of the Primates, dimension",
      goalDescription:
        "You need audio to do the minigame, if you do not have audio, go to the guide book for the solution of which squares to click",
      canComplete: function () {
        return player.d.squareGameCompleted;
      },
      style: {
        "border-radius": "0px",
        "font-size": "19px",
      },
    },
    14: {
      name: "Poseidon's Wrath",
      challengeDescription: "Disable Mega Multiplier and Nissionite boosts.",
      rewardDescription: "Unlock the 5th Dimension, The Cradle of Gravity",
      goalDescription: "Obtain 10,000 Heavy Multiplier",
      canComplete: function () {
        return player.hm.points.gte(10000);
      },
      style: {
        "border-radius": "0px",
        "font-size": "19px",
      },
    },
    15: {
      name: "Humanity Terranized",
      challengeDescription: "Complete the Cosmic Quiz",
      rewardDescription:
        "Unlock the 7th Dimension, Euclidian Embark(Father of Geometry)",
      goalDescription: "Click down below to begin",
      canComplete: function () {
        return player.d.cosmicQuizCompleted;
      },
      style: {
        "border-radius": "0px",
        "font-size": "19px",
      },
    },
    16: {
      name: "Biblical Hallows",
      challengeDescription: "Craft One Hyperion Drone!",
      rewardDescription: "Unlock the 8th Dimension, Eden of Evolution",
      goalDescription: "Craft One Hyperion Drone!",
      canComplete: function () {
        return player.chm.hDrone.gte(1);
      },
      style: {
        "border-radius": "0px",
        "font-size": "19px",
      },
    },
    17: {
      name: "The Theory of Evolution",
      challengeDescription: "Evolution must be enacted!",
      rewardDescription: "Unlock the 9th Dimension, The Manhattan Project",
      goalDescription:
        "Obtain one of each prokaryote currently available(so 4)",
      canComplete: function () {
        return (
          player.ce.mSmithii.gte(1) &&
          player.ce.sSolfataricus.gte(1) &&
          player.ce.halobacterium.gte(1) &&
          player.ce.mJannaschii.gte(1)
        );
      },
      style: {
        "border-radius": "0px",
        "font-size": "19px",
      },
    },
    18: {
      name: "The End of Humanity",
      challengeDescription:
        "Craft a nuke, and nuke the Earth! This is a craftable(You must enter the Challenge to complete this one, after making a nuke)",
      rewardDescription:
        "Unlock the 10th Dimension(String Theory) Awakenings of Creation.",
      goalDescription: "NUKE THE EARTH",
      canComplete: function () {
        return player.d.earthNuked;
      },
      onEnter() {
        destruction();
      },
      onExit() {
        challengeExit();
      },
      style: {
        "border-radius": "0px",
        "font-size": "19px",
        height: "320px",
      },
    },
    19: {
      name: "Universe Purification Project",
      challengeDescription: "Zero debuffs",
      rewardDescription: "Unlock the 11th Dimension | The Quest For Life",
      goalDescription: "Have ALL Upgrades for this layer",
      canComplete: function () {
        return player.d.challengeCompletedFunction();
      },
      onEnter() {
        destruction();
      },
      onExit() {
        challengeExit();
      },
      style: {
        "border-radius": "0px",
        "font-size": "19px",
        height: "320px",
      },
    },
  },
});
