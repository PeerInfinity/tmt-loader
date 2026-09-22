addLayer("cheese", {
  name: "cheese",
  symbol: "C",
  position: 1,
  startData() {
    return {
      unlocked: true,
      points: Decimal.dZero,
      goodCheese: Decimal.dZero,
      cycle: Decimal.dZero,
      activity: Decimal.dZero,
      bruh: Decimal.dZero,
      bruh2: Decimal.dZero,
      hunger: new Decimal(5),
      unlocked2: false,
      blessings: Decimal.dZero,
      goodBlessings: Decimal.dZero,
      currentState: 0,
      laeceaSacrifice: Decimal.dZero,
      laeceaPoints: Decimal.dZero,
    };
  },
  state: [
    ["Neutral", "(No buffs or nerfs are applied)"],
    ["Intrigued", "(x1.1 🧀 gain)"],
    ["Entertained", "(^1.1 🧀 gain)"],
    ["Hunger", "(x0.25 🧀 gain)"],
    ["Satisfaction", "(x1.75 🧀 gain and ???)"],
    ["Boredom", "(x0.8 🧀 gain)"],
    ["Annoyance", "(x0.5 point and 🧀 gain)"],
    ["metal pipe", "(x0 🧀 gain)"],
    [
      "Entertained...?",
      "(^0.85 🧀 gain and you can't sacrifice for one minute)",
    ],
  ],
  color: "rgb(255,217,131)",
  requires: Decimal.dTen,
  resource: "🧀",
  type: "none",
  bars: {
    feedMe: {
      direction: RIGHT,
      width: 375,
      height: 100,
      progress() {
        return player.cheese.hunger.div(Decimal.dTen);
      },
      display() {
        return `<h2>Hunger Meter:
                <br>${formatWhole(player.cheese.hunger)} / 5<h2/>`;
      },
      fillStyle: {
        backgroundColor: "brown",
      },
    },
  },
  upgrades: {
    a0: {
      fullDisplay: `<h3>Downfall</h3>
                    <br><span>x4 🧀 gain
                    <br><br>Cost: 1 blessing`,
      tooltip:
        "It's best if you do not buy this upgrade, god who knows what might happen next.",
      cost: Decimal.dOne,
      currencyInternalName: "blessings",
      currencyDisplayName: "blessing",
      currencyLayer: "cheese",
    },
    b0: {
      fullDisplay() {
        return `<h3>Self-Irony</h3>
                <br><span>Blessings boost 🧀 gain by x${format(this.effect())}
                <br><br>Cost: ${formatWhole(this.cost())} blessings`;
      },
      tooltip:
        "I told you to not buy this!... Oh well, might as well go full-on zaburple mode",
      effect() {
        return player.cheese.blessings
          .add(Decimal.dOne)
          .log(777)
          .add(Decimal.dOne);
      },
      cost() {
        return new Decimal(hasUpgrade("cheese", "b1") ? 30 : 10);
      },
      currencyInternalName: "blessings",
      currencyDisplayName: "blessing",
      currencyLayer: "cheese",
      unlocked() {
        return hasUpgrade("cheese", "a0");
      },
      branches: [["a0", "rgb(255,217,131)"]],
    },
    b1: {
      fullDisplay() {
        return `<h3>Permabooster</h3>
                <br><span>You can sacrifice your blessings for additional 🧀 gain boost
                <br><br>Cost: ${formatWhole(this.cost())} blessings`;
      },
      tooltip: "I heard your sacrifices are pretty strong. Let me fight them.",
      cost() {
        return new Decimal(hasUpgrade("cheese", "b0") ? 30 : 10);
      },
      canAfford() {
        return player.cheese.blessings.gte(this.cost());
      },
      currencyInternalName: "blessings",
      currencyDisplayName: "blessing",
      currencyLayer: "cheese",
      onPurchase() {
        player.cheese.upgrades.push("b1");
      },
      unlocked() {
        return hasUpgrade("cheese", "a0");
      },
      branches: [["a0", "rgb(255,217,131)"]],
    },
    b2: {
      fullDisplay() {
        return `<h3>The Cursed Seed</h3>
                <br><span>Unlocks... something
                <br>and x4 🧀 gain
                <br><br>Cost: 20.23 Qi 🧀`;
      },
      tooltip: `<span style='color: #006080;'>Hewwo!! Did you really think I'd leave you alone with this party pooper? UwU
                <br>(i was obligated to say this please kill me)`,
      cost: new Decimal("2.023e19"),
      unlocked() {
        return hasUpgrade("cheese", "c1");
      },
      branches: [["c1", "#006080"]],
      style() {
        return {
          "background-color": hasUpgrade("cheese", this.id)
            ? "#006080"
            : canAffordUpgrade("cheese", this.id)
            ? "cyan"
            : "",
          color: "black",
          "border-color": "rgba(0,0,0,0.125)",
        };
      },
    },
    c0: {
      fullDisplay() {
        return `<h3>God Forsaken Feedback</h3>
                <br><span>🧀 boost blessing gain by x${format(
                  this.effect(),
                )}<br><br>Cost: ${formatWhole(this.cost())} blessings`;
      },
      tooltip: "why would you do this to me bruh",
      effect() {
        return player.cheese.points.root(10).add(1).log(10).add(1);
      },
      cost() {
        return new Decimal(hasUpgrade("cheese", "c2") ? 100 : 60);
      },
      currencyInternalName: "blessings",
      currencyDisplayName: "blessing",
      currencyLayer: "cheese",
      unlocked() {
        return hasUpgrade("cheese", "b0");
      },
      branches: [["b0", "rgb(255,217,131)"]],
    },
    c1: {
      fullDisplay() {
        return `<h3>Triangular Systematics</h3>
                <br><span>Unlocks 2 🧀 buyables
                <h5>(Cheesy Synchronization doesn't affect these buyables)</h5>
                <br>Cost: 2,020 blessings`;
      },
      tooltip:
        "Shouldn't inflate above 1e20... or 10 Qi... or whatever cursed notation you're using.",
      effect() {
        return player.cheese.blessings.add(1).log(777).add(1);
      },
      cost() {
        return new Decimal(2020);
      },
      currencyInternalName: "blessings",
      currencyDisplayName: "blessing",
      currencyLayer: "cheese",
      unlocked() {
        return hasUpgrade("cheese", "c0") && hasUpgrade("cheese", "c2");
      },
      branches: [
        ["c0", "rgb(255,217,131)"],
        ["c2", "rgb(255,217,131)"],
      ],
    },
    c2: {
      fullDisplay() {
        return `<h3>Cheesy Synchronization</h3>
                <br><span>Sacrificed blessings affect 🧀 buildings as well
                <br><br>Cost: ${formatWhole(this.cost())} blessings`;
      },
      tooltip: "An approriate name for such silly upgrade.",
      effect() {
        return player.cheese.blessings.add(1).log(777).add(1);
      },
      cost() {
        return new Decimal(hasUpgrade("cheese", "c0") ? 100 : 60);
      },
      currencyInternalName: "blessings",
      currencyDisplayName: "blessing",
      currencyLayer: "cheese",
      onPurchase() {
        player.cheese.upgrades.push("c2");
      },
      unlocked() {
        return hasUpgrade("cheese", "b1");
      },
      branches: [["b1", "rgb(255,217,131)"]],
    },
    ab00: {
      fullDisplay: `<h3>Breakdown</h3>
                    <br><span>Sacrifices are x4 stronger and you sacrifice x4 more
                    <br><br>Cost: 1,000,000 blessing`,
      tooltip: `<span style='color: #006080;'>Personally, I prefer CHASE. It just has so much impact and raw atmosphere compared to other OPs. It also sounds pretty good in my opinion.`,
      cost: new Decimal(1000000),
      unlocked() {
        return hasUpgrade("cheese", "b2");
      },
      currencyInternalName: "blessings",
      currencyDisplayName: "blessing",
      currencyLayer: "cheese",
      style() {
        return {
          "background-color": hasUpgrade("cheese", this.id)
            ? "#006080"
            : canAffordUpgrade("cheese", this.id)
            ? "cyan"
            : "",
          color: "black",
          "border-color": "rgba(0,0,0,0.125)",
        };
      },
    },
    ab10: {
      fullDisplay: `<h3>Short-Lived Reproduction</h3>
                    <br>🐀🐀🐀
                    <br>=
                    <br>🐀🐀🐀
                    <br>🐀🐀
                    <br>🐀
                    <br><br>Cost: 25,000,000 blessing`,
      tooltip: `<h5 style='color: #006080; font-size: 6px;'>Here I come, rougher than the rest of them<br>The best of them, tougher than leather<br>You can call me Knuckles, unlike Sonic I don't chuckle<br>I'd rather flex my muscles<br>I'm hard as nails, it ain't hard to tell<br>I break 'em down whether they solid or frail<br>Unlike the rest I'm independent since my first breath, first test<br>Feel the right then the worst's left<br>Born on an island in the heavens<br>The blood of my ancestors flows inside me<br>My duty is to save the flower from evil deterioration<br>I will be the one to set your heart free true<br>Cleanse yourself of them evil spirits that's in you<br>Streaking lights, loud sounds, and instinct<br>Are the elements that keep me going<br>I am fighting my own mission<br>Nothing's gonna stand in my way<br>I will be the one to set your heart free true<br>Cleanse yourself of them evil spirits that's in you<br>Won't be frightened, I'll stand up to all the pain and turmoil<br>Just believe in myself, won't rely on others<br>Get this power to wipe out the havoc and anarchy<br>This is my planet, gonna fight for my destiny<br>Here I come, rougher than the rest of them<br>The best of them, tougher than leather<br>You can call me Knuckles, unlike Sonic I don't chuckle<br>I'd rather flex my muscles<br>I'm hard as nails, it ain't hard to tell<br>I break 'em down whether they solid or frail<br>Unlike the rest I'm independent since my first breath, first test<br>Feel the right then the worst's left<br>I have no such things as weak spots<br>Don't approve of him, but got to trust him<br>This alliance has a purpose<br>This partnership is only temporary<br>I will be the one to set your heart free true<br>Cleanse yourself of evil spirits that got in you<br>Won't be frightened, I'll stand up to all the pain and turmoil<br>Just believe in myself, won't rely on others<br>Freedom will be waiting when serenity is restored<br>This is my planet, I shall not surrender<br>Won't be frightened, I'll stand up to all the pain and turmoil<br>Just believe in myself, won't rely on others<br>Get this power to wipe out the havoc and anarchy<br>This is my planet, gonna fight (aah, oh)<br>Won't be frightened, I'll stand up to all the pain and turmoil<br>Just believe in myself, won't rely on others<br>Freedom will be waiting when serenity is restored<br>This is my planet, I shall not surrender<br>The new porcupine on the block with the puffed chest<br>Out the wilderness with the ruggedness<br>Knock, knock, it's Knuckles, the blow thrower<br>Independent flower, magical Emerald holder<br>Give you the coldest shoulder<br>My spike goes through boulders<br>That's why I stay a loner<br>I was born by myself<br>I don't need a posse, I get it on by myself<br>Adversaries get shelved`,
      cost: new Decimal(25000000),
      unlocked() {
        return hasUpgrade("cheese", "ab00");
      },
      currencyInternalName: "blessings",
      currencyDisplayName: "blessing",
      currencyLayer: "cheese",
      branches: [["ab00", "#006080"]],
      style() {
        return {
          "background-color": hasUpgrade("cheese", this.id)
            ? "#006080"
            : canAffordUpgrade("cheese", this.id)
            ? "cyan"
            : "",
          color: "black",
          "border-color": "rgba(0,0,0,0.125)",
        };
      },
    },
    ab20: {
      fullDisplay: `<h3>??? (wip)</h3>
                    <br><span>???<br><br>Cost: ??? blessing`,
      tooltip: `<span style='color: #006080;'> good luck reading previous upgrade's tooltip`,
      cost: new Decimal(625000000),
      canAfford() {
        return false;
      },
      unlocked() {
        return hasUpgrade("cheese", "ab10");
      },
      currencyInternalName: "blessings",
      currencyDisplayName: "blessing",
      currencyLayer: "cheese",
      branches: [["ab10", "#006080"]],
      style() {
        return {
          "background-color": hasUpgrade("cheese", this.id)
            ? "#006080"
            : canAffordUpgrade("cheese", this.id)
            ? "cyan"
            : "",
          color: "black",
          "border-color": "rgba(0,0,0,0.125)",
        };
      },
    },
  },
  update(diff) {
    player.cheese.points = player.cheese.points.add(
      tmp.cheese.cheeseGain.mul(diff),
    );
    player.cheese.laeceaPoints = player.cheese.laeceaPoints.add(
      tmp.cheese.laeceaGain.mul(diff),
    );
    if (player.offTime == undefined)
      player.cheese.cycle = player.cheese.cycle.add(diff);
    if (player.cheese.cycle.gte(60)) {
      player.cheese.cycle = Decimal.dZero;
      player.cheese.hunger = player.cheese.hunger.sub(1).max(0);
      player.cheese.currentState =
        Math.ceil(Math.random() * 60) == 21
          ? 7
          : (player.cheese.activity.gte(30) &&
              player.cheese.currentState == 1) ||
            (player.cheese.currentState == 2 && player.cheese.bruh2.gte(10))
          ? 8
          : player.cheese.bruh.gte(6)
          ? 6
          : player.cheese.hunger.gte(6)
          ? 4
          : player.cheese.hunger.lte(0)
          ? 3
          : player.cheese.activity.gte(30) &&
            (player.cheese.currentState == 1 ||
              player.cheese.currentState == 2 ||
              player.cheese.currentState == 4)
          ? 2
          : player.cheese.activity.gte(10) || player.cheese.currentState == 2
          ? 1
          : player.cheese.activity.eq(0) ||
            player.cheese.bruh.gte(player.cheese.activity.div(3))
          ? 5
          : 0;
      player.cheese.activity = Decimal.dZero;
      player.cheese.bruh = Decimal.dZero;
      player.cheese.bruh2 = Decimal.dZero;
      if (new Decimal(Math.random() * 60).ceil().eq(21))
        player.cheese.currentState = 7;
    }
  },
  cheeseGain() {
    return player.cheese.currentState == 7
      ? Decimal.dZero
      : tmp.cheese.buyables[11].effect
          .mul(tmp.cheese.laeceaEffect)
          .mul(tmp.cheese.buyables[12].effect)
          .mul(tmp.cheese.buyables[13].effect)
          .mul(tmp.cheese.buyables[14].effect)
          .mul(tmp.cheese.buyables[21].effect)
          .mul(tmp.cheese.buyables[22].effect)
          .mul(
            player.cheese.currentState == 6
              ? 0.5
              : player.cheese.currentState == 5
              ? 0.8
              : player.cheese.currentState == 4
              ? 1.75
              : player.cheese.currentState == 3
              ? 0.25
              : player.cheese.currentState == 1
              ? 1.1
              : 1,
          )
          .mul(hasUpgrade("cheese", "a0") ? 4 : 1)
          .mul(hasUpgrade("cheese", "b2") ? 4 : 1)
          .mul(
            hasUpgrade("cheese", "b0") ? tmp.cheese.upgrades["b0"].effect : 1,
          )
          .pow(
            player.cheese.currentState == 8
              ? 0.85
              : player.cheese.currentState == 2
              ? 1.1
              : 1,
          );
  },
  laeceaGain() {
    return !hasUpgrade("cheese", "b2")
      ? Decimal.dZero
      : player.cheese.points
          .max(0)
          .add(1)
          .log(10)
          .div(20)
          .pow(1.69)
          .mul(
            Decimal.pow(
              4,
              player.cheese.buyables["ab11"]
                .add(player.cheese.buyables["ab12"])
                .add(player.cheese.buyables["ab13"]),
            ),
          )
          .mul(
            Decimal.pow(
              tmp.cheese.laeceaEffect.min(4),
              player.cheese.buyables["ab12"].add(
                player.cheese.buyables["ab13"],
              ),
            ),
          )
          .mul(
            Decimal.mul(
              0.05,
              hasAchievement("cheese", 23)
                ? hasUpgrade("cheese", "ab10")
                  ? new Decimal(player.cheese.achievements.length).mul(
                      Decimal.add(
                        1,
                        (player.cheese.achievements.length - 1) / 2,
                      ),
                    )
                  : player.cheese.achievements.length
                : 0,
            ).add(1),
          )
          .pow(tmp.cheese.buyables["ab13"].effect);
  },
  laeceaEffect() {
    return player.cheese.laeceaPoints.add(1).root(20);
  },
  buyables: {
    feed: {
      title: "Feed la creatura",
      cost() {
        let cost = player.cheese.buyables["feed"].add(1).mul(1000);
        if (tmp.cheese.cheeseGain.gte(cost))
          cost = cost.mul(tmp.cheese.cheeseGain.div(cost).pow(1.6));
        return cost;
      },
      canAfford() {
        return (
          player.cheese.points.gte(this.cost()) && player.cheese.hunger.lt(10)
        );
      },
      buy() {
        player.cheese.points = player.cheese.points.sub(this.cost());
        player.cheese.buyables["feed"] = player.cheese.buyables["feed"].add(1);
        player.cheese.hunger = player.cheese.hunger.add(1);
        player.cheese.activity = player.cheese.activity.add(1);
      },
      display() {
        return `Requirement: ${format(this.cost())} 🧀`;
      },
      style() {
        return {
          height: "80px",
          "border-color": "rgba(0,0,0,0.125)",
          "background-color": this.canAfford() ? "#006080" : "",
        };
      },
    },
    prestige: {
      title: "<h3>Ascend",
      canAfford() {
        return player.cheese.points.gte(1000000);
      },
      gain() {
        return player.cheese.points
          .div(1000000)
          .root(2.95305888531)
          .mul(
            hasUpgrade("cheese", "c0") ? tmp.cheese.upgrades["c0"].effect : 1,
          )
          .mul(tmp.cheese.laeceaEffect)
          .floor();
      },
      getNextAt() {
        return this.gain()
          .add(1)
          .div(tmp.cheese.laeceaEffect)
          .div(
            hasUpgrade("cheese", "c0") ? tmp.cheese.upgrades["c0"].effect : 1,
          )
          .pow(2.95305888531)
          .mul(1000000)
          .max(1000000);
      },
      buy() {
        let gain = player.cheese.blessings.add(this.gain());
        let keep = [
          player.cheese.cycle,
          player.cheese.activity.add(1),
          player.cheese.bruh,
          player.cheese.hunger,
          player.cheese.currentState,
          player.cheese.buyables["feed"],
          player.cheese.upgrades,
          player.cheese.buyables[22],
          player.cheese.goodBlessings,
          player.cheese.bruh2.add(1),
          player.cheese.laeceaPoints,
          player.cheese.buyables["ab11"],
          player.cheese.buyables["ab12"],
          player.cheese.buyables["ab13"],
          player.cheese.achievements,
        ];
        layerDataReset("cheese");
        player.cheese.cycle = keep[0];
        player.cheese.activity = keep[1];
        player.cheese.bruh = keep[2];
        player.cheese.hunger = keep[3];
        player.cheese.currentState = keep[4];
        player.cheese.buyables["feed"] = keep[5];
        player.cheese.upgrades = keep[6];
        player.cheese.buyables[22] = keep[7];
        player.cheese.goodBlessings = keep[8];
        player.cheese.bruh2 = keep[9];
        player.cheese.laeceaPoints = keep[10];
        player.cheese.buyables["ab11"] = keep[11];
        player.cheese.buyables["ab12"] = keep[12];
        player.cheese.buyables["ab13"] = keep[13];
        player.cheese.achievements = keep[14];
        player.cheese.blessings = gain;
        player.cheese.unlocked2 = true;
      },
      display() {
        return `<h3>Abandon all of your progress and be blessed by Cheese Overlord in return, gaining +${formatWhole(
          this.gain(),
        )} blessings<br><br>You may be blessed further once you have ${formatWhole(
          this.getNextAt(),
        )} 🧀`;
      },
      style() {
        return {
          height: "150px",
          width: "350px",
          border: "5px solid",
          "border-radius": "300px",
          "border-color": this.canAfford() ? "rgb(255,172,51)" : "",
          color: this.canAfford() ? "rgb(244,144,12)" : "",
        };
      },
    },
    11: {
      title: "<h3>Cheese Generator",
      cost() {
        return player.cheese.buyables[11]
          .mul(player.cheese.buyables[11].add(1))
          .pow(1.15)
          .pow(
            player.cheese.buyables[11].gte(100)
              ? player.cheese.buyables[11].sub(100).mul(0.015).add(1)
              : 1,
          )
          .pow(
            player.cheese.buyables[11].gte(255)
              ? player.cheese.buyables[11].sub(255).mul(0.15).add(1)
              : 1,
          );
      },
      canAfford() {
        return player.cheese.points.gte(this.cost());
      },
      effect() {
        return player.cheese.buyables[11].mul(
          hasUpgrade("cheese", "c2") ? tmp.cheese.buyables[22].effect : 1,
        );
      },
      buy() {
        player.cheese.points = player.cheese.points.sub(this.cost());
        player.cheese.buyables[11] = player.cheese.buyables[11].add(1);
        player.cheese.activity = player.cheese.activity.add(1);
      },
      display() {
        return `<h3>You currently gain ${format(
          this.effect(),
        )} 🧀/sec<br>Amount: ${formatWhole(
          player.cheese.buyables[this.id],
        )}<br>Cost: ${format(this.cost())} 🧀`;
      },
      style() {
        return {
          height: "112px",
          width: "192px",
          border: "5px solid",
          "border-radius": "112px",
          "border-color": this.canAfford() ? "rgb(255,172,51)" : "",
          color: this.canAfford() ? "rgb(244,144,12)" : "",
        };
      },
    },
    12: {
      title: "<h3>Cheddar Generalizer",
      cost() {
        return new Decimal(400)
          .mul(Decimal.pow(1.15, player.cheese.buyables[12].pow(1.3)))
          .pow(
            player.cheese.buyables[12].gte(100)
              ? player.cheese.buyables[12].sub(100).mul(0.03).add(1)
              : 1,
          )
          .pow(
            player.cheese.buyables[12].gte(255)
              ? player.cheese.buyables[12].sub(255).mul(0.3).add(1)
              : 1,
          );
      },
      canAfford() {
        return player.cheese.points.gte(this.cost());
      },
      effect() {
        return Decimal.pow(
          new Decimal(1.15).add(tmp.cheese.buyables[15].effect),
          player.cheese.buyables[12],
        ).mul(hasUpgrade("cheese", "c2") ? tmp.cheese.buyables[22].effect : 1);
      },
      buy() {
        player.cheese.points = player.cheese.points.sub(this.cost());
        player.cheese.buyables[12] = player.cheese.buyables[12].add(1);
        player.cheese.activity = player.cheese.activity.add(1);
      },
      display() {
        return `<h3>Multiplies 🧀 gain by x${format(
          this.effect(),
        )}<br>Amount: ${formatWhole(
          player.cheese.buyables[this.id],
        )}<br>Cost: ${format(this.cost())} 🧀`;
      },
      style() {
        return {
          height: "112px",
          width: "192px",
          border: "5px solid",
          "border-radius": "112px",
          "border-color": this.canAfford() ? "rgb(255,172,51)" : "",
          color: this.canAfford() ? "rgb(244,144,12)" : "",
        };
      },
    },
    13: {
      title: "<h3>Chevre Graduator",
      cost() {
        return new Decimal(8000)
          .mul(Decimal.pow(4, player.cheese.buyables[13].pow(1.45)))
          .pow(
            player.cheese.buyables[13].gte(100)
              ? player.cheese.buyables[13].sub(100).mul(0.045).add(1)
              : 1,
          )
          .pow(
            player.cheese.buyables[13].gte(255)
              ? player.cheese.buyables[13].sub(255).mul(0.45).add(1)
              : 1,
          );
      },
      canAfford() {
        return player.cheese.points.gte(this.cost());
      },
      effect() {
        return Decimal.pow(
          new Decimal(2).root(
            new Decimal(10).root(player.cheese.points.max(1).root(10)),
          ),
          player.cheese.buyables[13],
        ).mul(hasUpgrade("cheese", "c2") ? tmp.cheese.buyables[22].effect : 1);
      },
      buy() {
        player.cheese.points = player.cheese.points.sub(this.cost());
        player.cheese.buyables[13] = player.cheese.buyables[13].add(1);
        player.cheese.activity = player.cheese.activity.add(1);
      },
      display() {
        return `<h3>Multiplies 🧀 gain by x${format(
          this.effect(),
        )} based on 🧀<br>Amount: ${formatWhole(
          player.cheese.buyables[this.id],
        )}<br>Cost: ${format(this.cost())} 🧀`;
      },
      style() {
        return {
          height: "112px",
          width: "192px",
          border: "5px solid",
          "border-radius": "112px",
          "border-color": this.canAfford() ? "rgb(255,172,51)" : "",
          color: this.canAfford() ? "rgb(244,144,12)" : "",
        };
      },
    },
    14: {
      title: "<h3>Classy Gargantuan-or",
      cost() {
        return new Decimal("1.6e12")
          .mul(Decimal.pow(1612, player.cheese.buyables[14].pow(1.6)))
          .pow(
            player.cheese.buyables[14].gte(100)
              ? player.cheese.buyables[14].sub(100).mul(0.06).add(1)
              : 1,
          )
          .pow(
            player.cheese.buyables[14].gte(255)
              ? player.cheese.buyables[14].sub(255).mul(0.6).add(1)
              : 1,
          );
      },
      canAfford() {
        return player.cheese.points.gte(this.cost());
      },
      effect() {
        return Decimal.pow(4, player.cheese.buyables[14]);
      },
      buy() {
        player.cheese.points = player.cheese.points.sub(this.cost());
        player.cheese.buyables[14] = player.cheese.buyables[14].add(1);
        player.cheese.activity = player.cheese.activity.add(1);
      },
      display() {
        return `<h3>Multiplies 🧀 gain by x${format(
          this.effect(),
        )}<br>Amount: ${formatWhole(
          player.cheese.buyables[this.id],
        )}<br>Cost: ${format(this.cost())} 🧀`;
      },
      style() {
        return {
          height: "112px",
          width: "192px",
          border: "5px solid",
          "border-radius": "112px",
          "border-color": this.canAfford() ? "rgb(255,172,51)" : "",
          color: this.canAfford() ? "rgb(244,144,12)" : "",
        };
      },
      unlocked() {
        return hasUpgrade("cheese", "c1");
      },
    },
    15: {
      title: "<h3>ciao gator",
      cost() {
        return new Decimal("3.2e15")
          .mul(Decimal.pow(3215, player.cheese.buyables[15].pow(1.75)))
          .pow(
            player.cheese.buyables[15].gte(100)
              ? player.cheese.buyables[15].sub(100).mul(0.075).add(1)
              : 1,
          )
          .pow(
            player.cheese.buyables[15].gte(255)
              ? player.cheese.buyables[15].sub(255).mul(0.75).add(1)
              : 1,
          );
      },
      canAfford() {
        return player.cheese.points.gte(this.cost());
      },
      effect() {
        return player.cheese.buyables[15].pow(1.15).mul(0.015);
      },
      buy() {
        player.cheese.points = player.cheese.points.sub(this.cost());
        player.cheese.buyables[15] = player.cheese.buyables[15].add(1);
        player.cheese.activity = player.cheese.activity.add(1);
      },
      display() {
        return `<h3>Increases Cheddar Generalizer's base by +${format(
          this.effect(),
        )}<br>Amount: ${formatWhole(
          player.cheese.buyables[this.id],
        )}<br>Cost: ${format(this.cost())} 🧀`;
      },
      style() {
        return {
          height: "112px",
          width: "192px",
          border: "5px solid",
          "border-radius": "112px",
          "border-color": this.canAfford() ? "rgb(255,172,51)" : "",
          color: this.canAfford() ? "rgb(244,154,12)" : "",
        };
      },
      unlocked() {
        return hasUpgrade("cheese", "c1");
      },
    },
    21: {
      title: "<h3>Sacrifice all of your 🧀 to Cheese Overlord",
      canAfford() {
        return player.cheese.points.gt(0) && !(tmp.cheese.state == 8);
      },
      effect() {
        return player.cheese.goodCheese
          .mul(hasUpgrade("cheese", "ab00") ? 4 : 1)
          .add(1)
          .log(7)
          .add(1)
          .max(1);
      },
      buy() {
        player.cheese.goodCheese = player.cheese.goodCheese.add(
          player.cheese.points.mul(hasUpgrade("cheese", "ab00") ? 4 : 1),
        );
        player.cheese.points = Decimal.dZero;
        player.cheese.activity = player.cheese.activity.add(1);
        player.cheese.bruh2 = player.cheese.bruh2.add(1);
      },
      display() {
        return `<h3>Multiplies 🧀 gain by x${format(
          this.effect(),
        )}<br>You'll gain +x${format(
          player.cheese.points
            .mul(hasUpgrade("cheese", "ab00") ? 16 : 1)
            .add(
              player.cheese.goodCheese.mul(
                hasUpgrade("cheese", "ab00") ? 4 : 1,
              ),
            )
            .add(1)
            .log(7)
            .add(1)
            .sub(this.effect())
            .max(0),
        )} upon sacrifice<br>You sacrificed ${format(
          player.cheese.goodCheese,
        )} 🧀`;
      },
      style() {
        return {
          height: "150px",
          width: "300px",
          border: "5px solid",
          "border-radius": "150px",
          "border-color": this.canAfford() ? "rgb(255,172,51)" : "",
          color: this.canAfford() ? "rgb(244,144,12)" : "",
        };
      },
    },
    22: {
      title: "<h3>Sacrifice all of your blessings to Cheese Overlord",
      canAfford() {
        return (
          player.cheese.blessings.gt(Decimal.dZero) && tmp.cheese.state !== 8
        );
      },
      effect() {
        return player.cheese.goodBlessings
          .mul(hasUpgrade("cheese", "ab00") ? 4 : 1)
          .add(Decimal.dOne)
          .log(77)
          .add(Decimal.dOne)
          .max(Decimal.dOne);
      },
      buy() {
        player.cheese.goodBlessings = player.cheese.goodBlessings.add(
          player.cheese.blessings.mul(hasUpgrade("cheese", "ab00") ? 4 : 1),
        );
        player.cheese.blessings = Decimal.dZero;
        player.cheese.activity = player.cheese.activity.add(Decimal.dOne);
        player.cheese.bruh2 = player.cheese.bruh2.add(Decimal.dOne);
      },
      display() {
        return `<h3>Permanently multiplies 🧀 gain by x${format(
          this.effect(),
        )}<br>You'll gain +x${format(
          player.cheese.blessings
            .mul(hasUpgrade("cheese", "ab00") ? 16 : 1)
            .add(
              player.cheese.goodBlessings.mul(
                hasUpgrade("cheese", "ab00") ? 4 : 1,
              ),
            )
            .add(Decimal.dOne)
            .log(77)
            .add(Decimal.dOne)
            .sub(this.effect())
            .max(Decimal.dZero),
        )} upon sacrifice<br>You sacrificed ${format(
          player.cheese.goodBlessings,
        )} blessings`;
      },
      style() {
        return {
          height: "150px",
          width: "300px",
          border: "5px solid",
          borderRadius: "150px",
          borderColor: this.canAfford() ? "rgb(255,172,51)" : "",
          color: this.canAfford() ? "rgb(244,144,12)" : "",
        };
      },
      unlocked() {
        return hasUpgrade("cheese", "b1");
      },
    },
    ab11: {
      title: "<h1>G</h1>",
      display() {
        return (
          `<h3>
          Boosts special point gain by x4 per purchase
          <br>Amount: ${formatWhole(player.cheese.buyables["ab11"])}` +
          (player.cheese.buyables["ab12"].gte(1) ||
          player.cheese.buyables["ab13"].gte(1)
            ? ` (+${formatWhole(
                player.cheese.buyables["ab12"].add(
                  player.cheese.buyables["ab13"],
                ),
              )})`
            : ``) +
          `<br>Cost: ${format(this.cost())} special points</h3>`
        );
      },
      tooltip:
        "<span style='color: #006080;'>G is the 7th letter in english alphabet, number of which represents all kinds of godlike, religious related things with immeasurable importance or power...<br>also GIF is pronounced with G, not J.",
      cost() {
        return Decimal.pow(60, player.cheese.buyables["ab11"].add(1).pow(1.15));
      },
      canAfford() {
        return player.cheese.laeceaPoints.gte(this.cost());
      },
      buy() {
        player.cheese.buyables["ab11"] = player.cheese.buyables["ab11"].add(1);
        player.cheese.activity = player.cheese.activity.add(1);
      },
      style() {
        return {
          height: "192px",
          width: "192px",
          "border-color": "rgba(0,0,0,0.125)",
          "background-color": this.canAfford() ? "#006080" : "",
        };
      },
    },
    ab12: {
      title: "<h1>O</h1>",
      display() {
        return (
          `<h3>
          Boosts special point gain by it's own effect (hardcaps at 4x) and gives 1 free "G" per purchase
          <br>Amount: ${formatWhole(player.cheese.buyables["ab12"])}` +
          (player.cheese.buyables["ab13"].gte(1)
            ? ` (+${formatWhole(player.cheese.buyables["ab13"])})`
            : ``) +
          `<br>Cost: ${format(this.cost())} special points</h3>`
        );
      },
      tooltip:
        "<span style='color: #006080;'>O... That's the first letter of my arch-nemesis. Sorta, kinda... O, as in Ouroboros, represents rebirth and afterlife. O can also be easily mistaken with 0, which is the amount of [Strength Type] I'm going to give about this layer's balancing within the next 10 minutes.",
      cost() {
        return Decimal.pow(
          1440,
          player.cheese.buyables["ab12"].add(1).pow(1.3),
        );
      },
      canAfford() {
        return player.cheese.laeceaPoints.gte(this.cost());
      },
      buy() {
        player.cheese.buyables["ab12"] = player.cheese.buyables["ab12"].add(1);
        player.cheese.activity = player.cheese.activity.add(1);
      },
      style() {
        return {
          height: "192px",
          width: "192px",
          "border-color": "rgba(0,0,0,0.125)",
          "background-color": this.canAfford() ? "#006080" : "",
        };
      },
    },
    ab13: {
      title: "<h1>D</h1>",
      display() {
        return `<h3>
          Boosts special points gain to the power of this buyable's effect and gives 1 free "G" and "O" per purchase
          <br>Effect: ^${format(this.effect())}
          <br>Amount: ${formatWhole(player.cheese.buyables["ab13"])}
          Cost: ${format(this.cost())} special points</h3>`;
      },
      effect() {
        let base = new Decimal(0.23456789);
        let eff = Decimal.dOne;
        for (i = 0; new Decimal(i).lt(player.cheese.buyables["ab13"]); i++) {
          eff = eff.add(base.div(i + 1));
        }
        return eff;
      },
      tooltip: `<span style='color: #006080;'>dawg i have no idea what i'm supposed to make out of D... perhaps DIGMA... balls? No, no... Delusional ho- NO! Look, I'm sorry! There's no "funni religion joke!11" punchline that I can make with this stupid letter without [JACORB'D] around and-<br><h3>large devil</h3>`,
      cost() {
        return Decimal.pow(
          40320,
          player.cheese.buyables["ab13"].add(1).pow(1.45),
        );
      },
      canAfford() {
        return player.cheese.laeceaPoints.gte(this.cost());
      },
      buy() {
        player.cheese.buyables["ab13"] = player.cheese.buyables["ab13"].add(1);
        player.cheese.activity = player.cheese.activity.add(1);
      },
      style() {
        return {
          height: "192px",
          width: "192px",
          "border-color": "rgba(0,0,0,0.125)",
          "background-color": this.canAfford() ? "#006080" : "",
        };
      },
    },
  },
  achievements: {
    11: {
      name: "Now here's the 🐀",
      done() {
        return player.cheese.points.gte(1);
      },
      tooltip: "Get your first 🧀",
    },
    12: {
      name: "Fullstack Machinery",
      done() {
        return player.cheese.buyables[13].gte(1);
      },
      tooltip: "Buy a 3rd 🧀 buyable",
    },
    13: {
      name: "get softcapped idiot",
      done() {
        return (
          player.cheese.buyables[11].gte(100) ||
          player.cheese.buyables[12].gte(100) ||
          player.cheese.buyables[13].gte(100) ||
          player.cheese.buyables[14].gte(100) ||
          player.cheese.buyables[15].gte(100)
        );
      },
      tooltip: "Get softcapped",
    },
    14: {
      name: "UNLIMITED POWER!!!!",
      done() {
        return player.cheese.unlocked2;
      },
      tooltip: "Ascend once",
    },
    15: {
      name: "Trillionarism is an old propaganda",
      done() {
        return player.cheese.points.gte("1e15");
      },
      tooltip: "Reach 1 Qa 🧀",
    },
    16: {
      name: "Do not.",
      done() {
        return hasUpgrade("cheese", "b2");
      },
      tooltip: "Disappoint me. Alot.",
    },
    21: {
      name: "get super softcapped stupid bozo",
      done() {
        return (
          player.cheese.buyables[11].gte(256) ||
          player.cheese.buyables[12].gte(256) ||
          player.cheese.buyables[13].gte(256) ||
          player.cheese.buyables[14].gte(256) ||
          player.cheese.buyables[15].gte(256)
        );
      },
      tooltip: "Get softcapped yet again",
    },
    22: {
      name: "Powerhouse",
      done() {
        return tmp.cheese.buyables[21].effect.gte(30);
      },
      tooltip: "Reach x30 🧀 sacrifice effect",
    },
    23: {
      name: "man screw that blue rat, all my homies hate him",
      done() {
        return (
          player.cheese.buyables["ab11"].gte(1) ||
          player.cheese.buyables["ab12"].gte(1) ||
          player.cheese.buyables["ab13"].gte(1)
        );
      },
      tooltip: `Spell out "GOD"<br>Reward: +5% special point gain per 🐀`,
    },
    24: {
      name: "funni number with funni syntax",
      done() {
        return tmp.cheese.cheeseGain.gte("6.9e22");
      },
      tooltip: `enough said`,
    },
  },
  microtabs: {
    AB: {
      Laecea: {
        content: [
          "blank",
          [
            "display-text",
            () => `
                      <h2>AB's Current State:<br> 
                      <h3> ${
                        tmp.cheese.state[player.cheese.currentState][0]
                      }<br>
                      <h4>${
                        tmp.cheese.state[player.cheese.currentState][1]
                      }<br>Next cycle in ${formatWhole(
                        new Decimal(60).sub(player.cheese.cycle).ceil(),
                      )} seconds`,
          ],
          "blank",
          "blank",
          ["tree", [["ab"]]],
          ["bar", "feedMe"],
          "blank",
          ["buyable", "feed"],
        ],
        buttonStyle: {
          color: "rgb(0,48,64)",
          borderRadius: "50px",
          borderColor: "rgb(0,84,112)",
          backgroundColor: "#006080",
        },
        unlocked() {
          return hasUpgrade("cheese", "b2");
        },
      },
      "I AM": {
        content: [
          "blank",
          [
            "display-text",
            () =>
              `
                    <h2>You have<h2/>
                    <h2 style='color: #006080; text-shadow: #006080 0 0 5px;'>${formatWhole(
                      player.cheese.laeceaPoints,
                    )}<h2/>
                    <h2>special points, boosting your 🧀 and blessing gain by x${format(
                      tmp.cheese.laeceaEffect,
                    )}</h2><br>(And to further confirm the superiority of special points, you can't waste them no matter what)` +
              (tmp.cheese.laeceaGain.gt(Decimal.dZero)
                ? `<h4>(${format(
                    tmp.cheese.laeceaGain,
                  )} SP/sec [(log(🧀 + 1) / 20) ^ 1.69])`
                : ``),
          ],
          "blank",
          [
            "row",
            [
              ["buyable", "ab11"],
              "blank",
              ["buyable", "ab12"],
              "blank",
              ["buyable", "ab13"],
            ],
          ],
        ],
        buttonStyle: {
          color: "rgb(0,48,64)",
          borderRadius: "50px",
          borderColor: "rgb(0,84,112)",
          backgroundColor: "#006080",
        },
        unlocked() {
          return hasUpgrade("cheese", "b2");
        },
      },
    },
  },
  tabFormat: {
    "La Creatura": {
      content: [
        [
          "display-text",
          () =>
            `
                    <h2>You have 
                    <h2 style='color: ${tmp.cheese.color}; text-shadow: ${
                      tmp.cheese.color
                    } 0 0 5px;'>${formatWhole(player.cheese.points)} 
                    <h2 style='transform: scale(2, 2)'>🧀` +
            (player.cheese.unlocked2
              ? `<h2> and 
                    <h2 style='color: lightyellow; text-shadow: lightyellow 0 0 5px;'>${formatWhole(
                      player.cheese.blessings,
                    )}
                    <h2> blessings`
              : ``) +
            (tmp.cheese.cheeseGain.gt(Decimal.dZero)
              ? `<h4>You gain ${format(tmp.cheese.cheeseGain)} 🧀/sec`
              : ``),
        ],
        ["microtabs", "AB", { "border-color": "rgba(0,0,0,0)" }],
      ],
      buttonStyle: {
        color: "rgb(0,48,64)",
        borderRadius: "50px",
        borderColor: "rgb(0,84,112)",
        backgroundColor: "#006080",
      },
    },
    Cheese: {
      content: [
        [
          "display-text",
          () =>
            `
                    <h2>You have 
                    <h2 style='color: ${tmp.cheese.color}; text-shadow: ${
                      tmp.cheese.color
                    } 0 0 5px;'>${formatWhole(player.cheese.points)} 
                    <h2 style='transform: scale(2, 2)'>🧀` +
            (player.cheese.unlocked2
              ? `<h2> and 
                    <h2 style='color: lightyellow; text-shadow: lightyellow 0 0 5px;'>${formatWhole(
                      player.cheese.blessings,
                    )}
                    <h2> blessings`
              : ``) +
            (tmp.cheese.cheeseGain.gt(Decimal.dZero)
              ? `<h4>You gain ${format(tmp.cheese.cheeseGain)} 🧀/sec`
              : ``),
        ],
        "blank",
        [
          "row",
          [
            ["buyable", [11]],
            "blank",
            ["buyable", [12]],
            "blank",
            ["buyable", [13]],
          ],
        ],
        "blank",
        ["row", [["buyable", [14]], "blank", ["buyable", [15]]]],
        "blank",
        ["buyable", [21]],
      ],
      buttonStyle: {
        color: "rgb(244,144,12)",
        borderRadius: "50px",
      },
    },
    "Cheese Overlord's Heaven": {
      content: [
        [
          "display-text",
          () =>
            `
                    <h2>You have 
                    <h2 style='color: ${tmp.cheese.color}; text-shadow: ${
                      tmp.cheese.color
                    } 0 0 5px;'>${formatWhole(player.cheese.points)} 
                    <h2 style='transform: scale(2, 2)'>🧀` +
            (player.cheese.unlocked2
              ? `<h2> and 
                    <h2 style='color: lightyellow; text-shadow: lightyellow 0 0 5px;'>${formatWhole(
                      player.cheese.blessings,
                    )}
                    <h2> blessings`
              : ``) +
            (tmp.cheese.cheeseGain.gt(Decimal.dZero)
              ? `<h4>You gain ${format(tmp.cheese.cheeseGain)} 🧀/sec`
              : ``),
        ],
        "blank",
        ["buyable", "prestige"],
        "blank",
        ["buyable", [22]],
        "blank",
        [
          "row",
          [
            [
              "blank",
              function () {
                return [hasUpgrade("cheese", "b2") ? "136px" : "0px", "0px"];
              },
            ],
            ["upgrade", "a0"],
            [
              "blank",
              function () {
                return [hasUpgrade("cheese", "b2") ? "152px" : "0px", "0px"];
              },
            ],
            ["upgrade", "ab00"],
          ],
        ],
        "blank",
        "blank",
        [
          "row",
          [
            ["upgrade", "b0"],
            ["blank", ["16px", "0px"]],
            ["upgrade", "b2"],
            [
              "blank",
              function () {
                return [hasUpgrade("cheese", "c1") ? "16px" : "0px", "0px"];
              },
            ],
            ["upgrade", "b1"],
            [
              "blank",
              function () {
                return [
                  hasUpgrade("cheese", "ab00")
                    ? "16px"
                    : hasUpgrade("cheese", "b2")
                    ? "136px"
                    : "0px",
                  "0px",
                ];
              },
            ],
            ["upgrade", "ab10"],
          ],
        ],
        "blank",
        "blank",
        [
          "row",
          [
            ["upgrade", "c0"],
            ["blank", ["16px", "0px"]],
            ["upgrade", "c1"],
            [
              "blank",
              function () {
                return [
                  hasUpgrade("cheese", "c0") && hasUpgrade("cheese", "c2")
                    ? "16px"
                    : "0px",
                  "0px",
                ];
              },
            ],
            ["upgrade", "c2"],
            [
              "blank",
              function () {
                return [
                  hasUpgrade("cheese", "ab10")
                    ? "16px"
                    : hasUpgrade("cheese", "b2")
                    ? "136px"
                    : "0px",
                  "0px",
                ];
              },
            ],
            ["upgrade", "ab20"],
          ],
        ],
      ],
      buttonStyle: {
        color: "rgb(244,144,12)",
        borderRadius: "50px",
      },
      unlocked() {
        return player.cheese.points.gte(1000000) || player.cheese.unlocked2;
      },
    },
    Achievements: {
      content: [
        [
          "display-text",
          function () {
            if (!hasUpgrade("cheese", "ab10"))
              return "🐀".repeat(player.cheese.achievements.length);
            let ratTriangle = "";
            for (i = 0; i < player.cheese.achievements.length; i++) {
              ratTriangle =
                ratTriangle +
                "🐀".repeat(player.cheese.achievements.length - i) +
                "<br>";
            }
            return ratTriangle;
          },
        ],
        "blank",
        "achievements",
      ],
      buttonStyle: {
        color: "rgb(244,144,12)",
        borderRadius: "50px",
      },
    },
  },
  row: "side",
  nodeStyle: {
    color: "rgb(244,144,12)",
    borderColor: "rgb(255,172,51)",
  },
  layerShown: true,
});

addNode("ab", {
  symbol: "AB",
  color: "#006080",
  layerShown: true,
  canClick: true,
  onClick() {
    player.cheese.bruh = player.cheese.bruh.add(1);
  },
  tooltip() {
    return (
      "<span style='color: #006080;'>" +
      (player.cheese.currentState == 8
        ? "Thought you were slick, huh?"
        : player.cheese.currentState == 7
        ? "shut up bozo<br>https://tenor.com/view/metal-pipe-gif-27050590<br>metal pipe"
        : player.cheese.currentState == 6
        ? "bruh i ain't big cookie bro"
        : player.cheese.currentState == 5
        ? ". . ."
        : player.cheese.currentState == 4
        ? "Hell yeah, dude! Here is your reward, as promised"
        : player.cheese.currentState == 3
        ? "YOU.<br>🧀.<br>ME.<br>NOW."
        : player.cheese.currentState == 2
        ? "You're doing some pretty good progress, not gonna lie."
        : player.cheese.currentState == 1
        ? "Not bad..."
        : "Oh, hey there.<br>I'm not quite sure how did I get here, but you don't have to worry about me...<br>Speaking of which. Could you get some 🧀 for me please?")
    );
  },
  nodeStyle: { borderRadius: "50%" },
});
