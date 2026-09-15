addLayer("Numbers", {
  symbol: "N",
  position: 0,
  branches: ["Groups"],
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
    };
  },
  color: "#00FF00",
  requires: new Decimal(10),
  resource: "{}",
  baseResource: "Bres",
  baseAmount() {
    return player.points;
  },
  type: "static",
  exponent() {
    return getBuyableAmount("Groups", 2).gte(1)
      ? tmp["Groups"].buyables[22].effect
      : 1;
  },
  base: 10,
  gainMult() {
    mult = new Decimal(1);

    return mult;
  },
  gainExp() {
    return new Decimal(1);
  },
  resetsNothing() {
    return hasUpgrade(this.layer, 17);
  },
  row: 0,
  hotkeys: [
    {
      key: "n",
      description: "n: Reset for {}",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  upgrades: {
    11: {
      title: "Bregeneration",
      description: "Start generating Bres",
      effect() {
        return new Decimal(1);
      },
      fullDisplay() {
        return (
          "<h3>" +
          this.title +
          "</h3><br>" +
          this.description +
          "<br>Currently: +" +
          this.effect() +
          "<br><br>Cost: " +
          this.cost +
          " <b>0</b>"
        );
      },
      cost: new Decimal(1),
      currencyInternalName() {
        return "11";
      },
      currencyLocation() {
        return player[this.layer].buyables;
      },
      unlocked() {
        return (
          getBuyableAmount(this.layer, 11).gte(1) || hasUpgrade(this.layer, 11)
        );
      },
    },
    12: {
      title: "Bregeneration II",
      description: "Bre gain is tripled",
      effect() {
        return new Decimal(3);
      },
      fullDisplay() {
        return (
          "<h3>" +
          this.title +
          "</h3><br>" +
          this.description +
          "<br>Currently: x" +
          this.effect() +
          "<br><br>Cost: " +
          this.cost +
          " <b>2</b>"
        );
      },
      cost: new Decimal(1),
      currencyInternalName() {
        return "13";
      },
      currencyLocation() {
        return player[this.layer].buyables;
      },
      unlocked() {
        return (
          getBuyableAmount(this.layer, 13).gte(1) || hasUpgrade(this.layer, 12)
        );
      },
    },
    13: {
      title: "Frieseckes Blessing",
      description: "Point gain is boosted, based on itself",
      effect() {
        return player.points.add(2).ln();
      },
      fullDisplay() {
        return (
          "<h3>" +
          this.title +
          "</h3><br>" +
          this.description +
          "<br>Currently: x" +
          format(this.effect()) +
          "<br><br>Cost: " +
          this.cost +
          " <b>3</b>"
        );
      },
      cost: new Decimal(1),
      currencyInternalName() {
        return "14";
      },
      currencyLocation() {
        return player[this.layer].buyables;
      },
      unlocked() {
        return (
          getBuyableAmount(this.layer, 14).gte(1) || hasUpgrade(this.layer, 13)
        );
      },
    },
    14: {
      title: "Powerset",
      description: "Costs of <b>1</b> and <b>2</b> reduced",
      fullDisplay() {
        return (
          "<h3>" +
          this.title +
          "</h3><br>" +
          this.description +
          "<br><br>Cost: " +
          this.cost +
          " <b>4</b>"
        );
      },
      cost: new Decimal(1),
      currencyInternalName() {
        return "15";
      },
      currencyLocation() {
        return player[this.layer].buyables;
      },
      unlocked() {
        return (
          getBuyableAmount(this.layer, 15).gte(1) || hasUpgrade(this.layer, 14)
        );
      },
    },
    15: {
      title: "Binary Operations",
      description: "Unlock Groups",
      fullDisplay() {
        return (
          "<h3>" +
          this.title +
          "</h3><br>" +
          this.description +
          "<br><br>Cost: " +
          this.cost +
          " <b>5</b>"
        );
      },
      cost: new Decimal(1),
      currencyInternalName() {
        return "16";
      },
      currencyLocation() {
        return player[this.layer].buyables;
      },
      unlocked() {
        return (
          getBuyableAmount(this.layer, 16).gte(1) || hasUpgrade(this.layer, 15)
        );
      },
    },
    16: {
      title: "AUTOMATION BABY",
      description: "Automatically buys numbers <b>0</b> to <b>5</b>",
      fullDisplay() {
        return (
          "<h3>" +
          this.title +
          "</h3><br>" +
          this.description +
          "<br><br>Cost: " +
          format(this.cost) +
          " Bres"
        );
      },
      cost: new Decimal(20000),
      currencyInternalName() {
        return "points";
      },
      unlocked() {
        return hasUpgrade(this.layer, 15);
      },
    },
    17: {
      title: "NO RESET BABY",
      description: "{}s no longer reset Bres",
      fullDisplay() {
        return (
          "<h3>" +
          this.title +
          "</h3><br>" +
          this.description +
          "<br><br>Cost: " +
          format(this.cost) +
          " Bres"
        );
      },
      cost: new Decimal(1e9),
      currencyInternalName() {
        return "points";
      },
      unlocked() {
        return hasUpgrade(this.layer, 16);
      },
    },
    18: {
      title: "NO RESET BABY II",
      description: "Numbers no longer cost anything",
      fullDisplay() {
        return (
          "<h3>" +
          this.title +
          "</h3><br>" +
          this.description +
          "<br><br>Cost: " +
          format(this.cost) +
          " {}"
        );
      },
      cost: new Decimal(30),
      unlocked() {
        return hasUpgrade(this.layer, 17);
      },
    },
  },
  buyables: {
    11: {
      title: "0",
      cost(x) {
        return new Decimal(x).add(1).mul(x.pow(0.25).add(2).ln()).round();
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " ∅\nCost: " +
          this.cost() +
          " {}"
        );
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      buy() {
        let previousCost = this.cost();
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
        if (hasUpgrade(this.layer, 18)) return;
        player[this.layer].points = player[this.layer].points.sub(previousCost);
      },
    },
    12: {
      title: "1",
      cost(x) {
        return new Decimal(x).add(1).mul(x.pow(0.25).add(2).ln()).round();
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " {∅}\nCost: " +
          this.cost() +
          (hasUpgrade(this.layer, 14) ? " <b>0</b>" : " <b>0</b> and {}")
        );
      },
      canAfford() {
        return (
          (player[this.layer].points.gte(this.cost()) ||
            hasUpgrade(this.layer, 14)) &&
          getBuyableAmount(this.layer, 11).gte(this.cost())
        );
      },
      buy() {
        let previousCost = this.cost();
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
        if (hasUpgrade(this.layer, 18)) return;
        if (!hasUpgrade(this.layer, 14))
          player[this.layer].points =
            player[this.layer].points.sub(previousCost);
        setBuyableAmount(
          this.layer,
          11,
          getBuyableAmount(this.layer, 11).sub(previousCost)
        );
      },
      unlocked() {
        return (
          getBuyableAmount(this.layer, 11).gte(this.cost()) ||
          getBuyableAmount(this.layer, this.id).gte(1) ||
          getBuyableAmount(this.layer, 13).gte(1) ||
          getBuyableAmount(this.layer, 14).gte(1) ||
          getBuyableAmount(this.layer, 15).gte(1) ||
          getBuyableAmount(this.layer, 16).gte(1) ||
          hasUpgrade(this.layer, 16)
        );
      },
    },
    13: {
      title: "2",
      cost(x) {
        return new Decimal(x).add(1).mul(x.pow(0.25).add(2).ln()).round();
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " {∅, {∅}}\nCost: " +
          this.cost() +
          (hasUpgrade(this.layer, 14)
            ? " <b>1</b>"
            : " <b>0</b>, <b>1</b> and {}")
        );
      },
      canAfford() {
        return (
          (player[this.layer].points.gte(this.cost()) ||
            hasUpgrade(this.layer, 14)) &&
          (getBuyableAmount(this.layer, 11).gte(this.cost()) ||
            hasUpgrade(this.layer, 14)) &&
          getBuyableAmount(this.layer, 12).gte(this.cost())
        );
      },
      buy() {
        let previousCost = this.cost();
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
        if (hasUpgrade(this.layer, 18)) return;
        if (!hasUpgrade(this.layer, 14)) {
          player[this.layer].points =
            player[this.layer].points.sub(previousCost);
          setBuyableAmount(
            this.layer,
            11,
            getBuyableAmount(this.layer, 11).sub(previousCost)
          );
        }
        setBuyableAmount(
          this.layer,
          12,
          getBuyableAmount(this.layer, 12).sub(previousCost)
        );
      },
      unlocked() {
        return (
          getBuyableAmount(this.layer, 12).gte(this.cost()) ||
          getBuyableAmount(this.layer, this.id).gte(1) ||
          getBuyableAmount(this.layer, 14).gte(1) ||
          getBuyableAmount(this.layer, 15).gte(1) ||
          getBuyableAmount(this.layer, 16).gte(1) ||
          hasUpgrade(this.layer, 16)
        );
      },
    },
    14: {
      title: "3",
      cost(x) {
        return new Decimal(x).add(1).mul(x.pow(0.25).add(2).ln()).round();
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " {∅, {∅}, {∅, {∅}}}\nCost: " +
          this.cost() +
          " <b>0</b>, <b>1</b>, <b>2</b> and {}"
        );
      },
      canAfford() {
        return (
          player[this.layer].points.gte(this.cost()) &&
          getBuyableAmount(this.layer, 11).gte(this.cost()) &&
          getBuyableAmount(this.layer, 12).gte(this.cost()) &&
          getBuyableAmount(this.layer, 13).gte(this.cost())
        );
      },
      buy() {
        let previousCost = this.cost();
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
        if (hasUpgrade(this.layer, 18)) return;
        player[this.layer].points = player[this.layer].points.sub(previousCost);
        setBuyableAmount(
          this.layer,
          11,
          getBuyableAmount(this.layer, 11).sub(previousCost)
        );
        setBuyableAmount(
          this.layer,
          12,
          getBuyableAmount(this.layer, 12).sub(previousCost)
        );
        setBuyableAmount(
          this.layer,
          13,
          getBuyableAmount(this.layer, 13).sub(previousCost)
        );
      },
      unlocked() {
        return (
          getBuyableAmount(this.layer, 13).gte(this.cost()) ||
          getBuyableAmount(this.layer, this.id).gte(1) ||
          getBuyableAmount(this.layer, 15).gte(1) ||
          getBuyableAmount(this.layer, 16).gte(1) ||
          hasUpgrade(this.layer, 16)
        );
      },
    },
    15: {
      title: "4",
      cost(x) {
        return new Decimal(x).add(1).mul(x.pow(0.25).add(2).ln()).round();
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " {∅, {∅}, {∅, {∅}}, {∅, {∅}, {∅, {∅}}}}\nCost: " +
          this.cost() +
          " <b>0</b>, <b>1</b>, <b>2</b>, <b>3</b> and {}"
        );
      },
      canAfford() {
        return (
          player[this.layer].points.gte(this.cost()) &&
          getBuyableAmount(this.layer, 11).gte(this.cost()) &&
          getBuyableAmount(this.layer, 12).gte(this.cost()) &&
          getBuyableAmount(this.layer, 13).gte(this.cost()) &&
          getBuyableAmount(this.layer, 14).gte(this.cost())
        );
      },
      buy() {
        let previousCost = this.cost();
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
        if (hasUpgrade(this.layer, 18)) return;
        player[this.layer].points = player[this.layer].points.sub(previousCost);
        setBuyableAmount(
          this.layer,
          11,
          getBuyableAmount(this.layer, 11).sub(previousCost)
        );
        setBuyableAmount(
          this.layer,
          12,
          getBuyableAmount(this.layer, 12).sub(previousCost)
        );
        setBuyableAmount(
          this.layer,
          13,
          getBuyableAmount(this.layer, 13).sub(previousCost)
        );
        setBuyableAmount(
          this.layer,
          14,
          getBuyableAmount(this.layer, 14).sub(previousCost)
        );
      },
      unlocked() {
        return (
          getBuyableAmount(this.layer, 14).gte(this.cost()) ||
          getBuyableAmount(this.layer, this.id).gte(1) ||
          getBuyableAmount(this.layer, 16).gte(1) ||
          hasUpgrade(this.layer, 16)
        );
      },
    },
    16: {
      title: "5",
      cost(x) {
        return new Decimal(x).add(1).mul(x.pow(0.25).add(2).ln()).round();
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " {∅, {∅}, {∅, {∅}}, {∅, {∅}, {∅, {∅}}}, {∅, {∅}, {∅, {∅}}, {∅, {∅}, {∅, {∅}}}}}\nCost: " +
          this.cost() +
          " <b>0</b>, <b>1</b>, <b>2</b>, <b>3</b>, <b>4</b> and {}"
        );
      },
      canAfford() {
        return (
          player[this.layer].points.gte(this.cost()) &&
          getBuyableAmount(this.layer, 11).gte(this.cost()) &&
          getBuyableAmount(this.layer, 12).gte(this.cost()) &&
          getBuyableAmount(this.layer, 13).gte(this.cost()) &&
          getBuyableAmount(this.layer, 14).gte(this.cost()) &&
          getBuyableAmount(this.layer, 15).gte(this.cost())
        );
      },
      buy() {
        let previousCost = this.cost();
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
        if (hasUpgrade(this.layer, 18)) return;
        player[this.layer].points = player[this.layer].points.sub(previousCost);
        setBuyableAmount(
          this.layer,
          11,
          getBuyableAmount(this.layer, 11).sub(previousCost)
        );
        setBuyableAmount(
          this.layer,
          12,
          getBuyableAmount(this.layer, 12).sub(previousCost)
        );
        setBuyableAmount(
          this.layer,
          13,
          getBuyableAmount(this.layer, 13).sub(previousCost)
        );
        setBuyableAmount(
          this.layer,
          14,
          getBuyableAmount(this.layer, 14).sub(previousCost)
        );
        setBuyableAmount(
          this.layer,
          15,
          getBuyableAmount(this.layer, 15).sub(previousCost)
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      unlocked() {
        return (
          getBuyableAmount(this.layer, 15).gte(this.cost()) ||
          getBuyableAmount(this.layer, this.id).gte(1) ||
          hasUpgrade(this.layer, 16)
        );
      },
    },
    17: {
      title: "6",
      cost(x) {
        return new Decimal(x).add(2).mul(x.pow(0.25).add(2.2).ln()).round();
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " <b>5</b> ∪ {<b>5</b>}\nCost: " +
          this.cost() +
          " <b>5</b>"
        );
      },
      canAfford() {
        return getBuyableAmount(this.layer, 16).gte(this.cost());
      },
      buy() {
        let previousCost = this.cost();
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
        if (hasUpgrade(this.layer, 18)) return;
        setBuyableAmount(
          this.layer,
          16,
          getBuyableAmount(this.layer, 16).sub(previousCost)
        );
      },
      unlocked() {
        return getBuyableAmount("Groups", 21).gte(1);
      },
    },
    18: {
      title: "7",
      cost(x) {
        return new Decimal(x).add(2).mul(x.pow(0.25).add(2.2).ln()).round();
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " <b>6</b> ∪ {<b>6</b>}\nCost: " +
          this.cost() +
          " <b>6</b>"
        );
      },
      canAfford() {
        return getBuyableAmount(this.layer, 17).gte(this.cost());
      },
      buy() {
        let previousCost = this.cost();
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
        if (hasUpgrade(this.layer, 18)) return;
        setBuyableAmount(
          this.layer,
          17,
          getBuyableAmount(this.layer, 17).sub(previousCost)
        );
      },
      unlocked() {
        return getBuyableAmount("Groups", 21).gte(2);
      },
    },
    19: {
      title: "8",
      cost(x) {
        return new Decimal(x).add(2).mul(x.pow(0.25).add(2.2).ln()).round();
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " <b>7</b> ∪ {<b>7</b>}\nCost: " +
          this.cost() +
          " <b>7</b>"
        );
      },
      canAfford() {
        return getBuyableAmount(this.layer, 18).gte(this.cost());
      },
      buy() {
        let previousCost = this.cost();
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
        if (hasUpgrade(this.layer, 18)) return;
        setBuyableAmount(
          this.layer,
          18,
          getBuyableAmount(this.layer, 18).sub(previousCost)
        );
      },
      unlocked() {
        return getBuyableAmount("Groups", 21).gte(3);
      },
    },
    21: {
      title: "9",
      cost(x) {
        return new Decimal(x).add(2).mul(x.pow(0.25).add(2.2).ln()).round();
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " <b>8</b> ∪ {<b>8</b>}\nCost: " +
          this.cost() +
          " <b>8</b>"
        );
      },
      canAfford() {
        return getBuyableAmount(this.layer, 19).gte(this.cost());
      },
      buy() {
        let previousCost = this.cost();
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
        if (hasUpgrade(this.layer, 18)) return;
        setBuyableAmount(
          this.layer,
          19,
          getBuyableAmount(this.layer, 19).sub(previousCost)
        );
      },
      unlocked() {
        return getBuyableAmount("Groups", 21).gte(4);
      },
    },
    22: {
      title: "10",
      cost(x) {
        return new Decimal(x).add(2).mul(x.pow(0.25).add(2.2).ln()).round();
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " <b>9</b> ∪ {<b>9</b>}\nCost: " +
          this.cost() +
          " <b>9</b>"
        );
      },
      canAfford() {
        return getBuyableAmount(this.layer, 21).gte(this.cost());
      },
      buy() {
        let previousCost = this.cost();
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
        if (hasUpgrade(this.layer, 18)) return;
        setBuyableAmount(
          this.layer,
          21,
          getBuyableAmount(this.layer, 21).sub(previousCost)
        );
      },
      unlocked() {
        return getBuyableAmount("Groups", 21).gte(5);
      },
    },
    23: {
      title: "11",
      cost(x) {
        return new Decimal(x).add(2).mul(x.pow(0.25).add(2.2).ln()).round();
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " <b>10</b> ∪ {<b>10</b>}\nCost: " +
          this.cost() +
          " <b>10</b>"
        );
      },
      canAfford() {
        return getBuyableAmount(this.layer, 22).gte(this.cost());
      },
      buy() {
        let previousCost = this.cost();
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
        if (hasUpgrade(this.layer, 18)) return;
        setBuyableAmount(
          this.layer,
          22,
          getBuyableAmount(this.layer, 22).sub(previousCost)
        );
      },
      unlocked() {
        return getBuyableAmount("Groups", 21).gte(6);
      },
    },
    24: {
      title: "12",
      cost(x) {
        return new Decimal(x).add(2).mul(x.pow(0.25).add(2.2).ln()).round();
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " <b>11</b> ∪ {<b>11</b>}\nCost: " +
          this.cost() +
          " <b>11</b>"
        );
      },
      canAfford() {
        return getBuyableAmount(this.layer, 23).gte(this.cost());
      },
      buy() {
        let previousCost = this.cost();
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
        if (hasUpgrade(this.layer, 18)) return;
        setBuyableAmount(
          this.layer,
          23,
          getBuyableAmount(this.layer, 23).sub(previousCost)
        );
      },
      unlocked() {
        return getBuyableAmount("Groups", 21).gte(7);
      },
    },
    25: {
      title: "13",
      cost(x) {
        return new Decimal(x).add(2).mul(x.pow(0.25).add(2.2).ln()).round();
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " <b>12</b> ∪ {<b>12</b>}\nCost: " +
          this.cost() +
          " <b>12</b>"
        );
      },
      canAfford() {
        return getBuyableAmount(this.layer, 24).gte(this.cost());
      },
      buy() {
        let previousCost = this.cost();
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
        if (hasUpgrade(this.layer, 18)) return;
        setBuyableAmount(
          this.layer,
          24,
          getBuyableAmount(this.layer, 24).sub(previousCost)
        );
      },
      unlocked() {
        return getBuyableAmount("Groups", 21).gte(8);
      },
    },
    26: {
      title: "14",
      cost(x) {
        return new Decimal(x).add(2).mul(x.pow(0.25).add(2.2).ln()).round();
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " <b>13</b> ∪ {<b>13</b>}\nCost: " +
          this.cost() +
          " <b>13</b>"
        );
      },
      canAfford() {
        return getBuyableAmount(this.layer, 25).gte(this.cost());
      },
      buy() {
        let previousCost = this.cost();
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
        if (hasUpgrade(this.layer, 18)) return;
        setBuyableAmount(
          this.layer,
          25,
          getBuyableAmount(this.layer, 25).sub(previousCost)
        );
      },
      unlocked() {
        return getBuyableAmount("Groups", 21).gte(9);
      },
    },
    27: {
      title: "15",
      cost(x) {
        return new Decimal(x).add(2).mul(x.pow(0.25).add(2.2).ln()).round();
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " <b>14</b> ∪ {<b>14</b>}\nCost: " +
          this.cost() +
          " <b>14</b>"
        );
      },
      canAfford() {
        return getBuyableAmount(this.layer, 26).gte(this.cost());
      },
      buy() {
        let previousCost = this.cost();
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
        if (hasUpgrade(this.layer, 18)) return;
        setBuyableAmount(
          this.layer,
          26,
          getBuyableAmount(this.layer, 26).sub(previousCost)
        );
      },
      unlocked() {
        return getBuyableAmount("Groups", 21).gte(10);
      },
    },
  },
  clickables: {
    11: {
      title() {
        return "Number Autobuyer";
      },
      display() {
        return getClickableState(this.layer, this.id);
      },
      canClick: true,
      onClick() {
        setClickableState(
          this.layer,
          this.id,
          getClickableState(this.layer, this.id) == "Off" ? "On" : "Off"
        );
      },
      unlocked() {
        return hasUpgrade(this.layer, 16);
      },
    },
    12: {
      title() {
        return "Cyclic Group Autobuyer";
      },
      display() {
        return getClickableState(this.layer, this.id);
      },
      canClick: true,
      onClick() {
        setClickableState(
          this.layer,
          this.id,
          getClickableState(this.layer, this.id) == "Off" ? "On" : "Off"
        );
      },
      unlocked() {
        return hasUpgrade("Groups", 13);
      },
    },
  },
  layerShown() {
    return true;
  },
  tabFormat: {
    "Main tab": {
      content: [
        "main-display",
        "prestige-button",
        "blank",
        "clickables",
        "blank",
        [
          "row",
          [
            ["buyable", 11],
            ["buyable", 12],
            ["buyable", 13],
            ["buyable", 14],
            ["buyable", 15],
            ["buyable", 16],
            ["buyable", 17],
            ["buyable", 18],
            ["buyable", 19],
            ["buyable", 21],
            ["buyable", 22],
            ["buyable", 23],
            ["buyable", 24],
            ["buyable", 25],
            ["buyable", 26],
            ["buyable", 27],
          ],
        ],
        "blank",
        "upgrades",
      ],
    },
  },
  automate() {
    if (
      hasUpgrade(this.layer, 16) &&
      !(getClickableState(this.layer, 11) == "Off")
    )
      for (let i = 11; i <= 16; i++) buyBuyable(this.layer, i);
  },
});

addLayer("Groups", {
  symbol: "G",
  position: 0,
  row: 1,
  startData() {
    return {
      unlocked: true,
    };
  },
  color: "#FF00FF",
  type: "none",
  upgrades: {
    11: {
      title: "Direct Product",
      description: "Unlock more Groups by combining existing",
      fullDisplay() {
        return (
          "<h3>" +
          this.title +
          "</h3><br>" +
          this.description +
          "<br><br>Cost: " +
          this.cost +
          " {}"
        );
      },
      cost: new Decimal(3),
      currencyInternalName() {
        return "points";
      },
      currencyLayer() {
        return "Numbers";
      },
      unlocked() {
        return (
          getBuyableAmount(this.layer, 15).gte(1) || hasUpgrade(this.layer, 11)
        );
      },
    },
    12: {
      title: "Semidirect Product",
      description: "Like the direct product, just more complicated",
      fullDisplay() {
        return (
          "<h3>" +
          this.title +
          "</h3><br>" +
          this.description +
          "<br><br>Cost: " +
          this.cost +
          " <b>7</b>"
        );
      },
      cost: new Decimal(1),
      currencyInternalName() {
        return "18";
      },
      currencyLocation() {
        return player["Numbers"].buyables;
      },
      unlocked() {
        return hasUpgrade(this.layer, 11);
      },
    },
    13: {
      title: "Cyclic Group Autobuyer",
      description: "The Cyclic Group Autobuyer autobuys cyclic groups",
      fullDisplay() {
        return (
          "<h3>" +
          this.title +
          "</h3><br>" +
          this.description +
          "<br><br>Cost: " +
          this.cost +
          " <b>{}</b>"
        );
      },
      cost: new Decimal(250),
      currencyInternalName() {
        return "points";
      },
      currencyLayer() {
        return "Numbers";
      },
      unlocked() {
        return hasUpgrade(this.layer, 12);
      },
    },
  },
  buyables: {
    11: {
      title: "{e}",
      cost(x) {
        return new Decimal(x).add(1).mul(x.pow(0.25).add(2).ln()).round();
      },
      effect() {
        return getBuyableAmount(this.layer, this.id);
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " Trivial Groups\nCost: " +
          this.cost() +
          " <b>1</b><br><br>Currently: +" +
          this.effect() +
          " base Bre gain"
        );
      },
      canAfford() {
        return getBuyableAmount("Numbers", 12).gte(this.cost());
      },
      buy() {
        setBuyableAmount(
          "Numbers",
          12,
          getBuyableAmount("Numbers", 12).sub(this.cost())
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
    },
    12: {
      title: "Z<sub>2</sub> = S<sub>2</sub> = D<sub>2</sub>",
      cost(x) {
        return new Decimal(x).add(1).mul(x.pow(0.25).add(2).ln()).round();
      },
      effect() {
        return getBuyableAmount(this.layer, this.id).add(1).pow(0.05);
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " Cyclic Groups of Order 2\nCost: " +
          this.cost() +
          " <b>2</b><br><br>Currently: ^" +
          format(this.effect()) +
          " Bre gain"
        );
      },
      canAfford() {
        return getBuyableAmount("Numbers", 13).gte(this.cost());
      },
      buy() {
        setBuyableAmount(
          "Numbers",
          13,
          getBuyableAmount("Numbers", 13).sub(this.cost())
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      unlocked() {
        return (
          getBuyableAmount(this.layer, 11).gte(1) ||
          getBuyableAmount(this.layer, this.id).gte(1) ||
          getBuyableAmount(this.layer, 16).gte(1) ||
          getBuyableAmount(this.layer, 17).gte(1)
        );
      },
    },
    13: {
      title: "Z<sub>3</sub> = A<sub>3</sub>",
      cost(x) {
        return new Decimal(x).add(1).mul(x.pow(0.25).add(2).ln()).round();
      },
      effect() {
        return getBuyableAmount(this.layer, this.id).add(1).pow(0.066);
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " Cyclic Groups of Order 3\nCost: " +
          this.cost() +
          " <b>3</b><br><br>Currently: ^" +
          format(this.effect()) +
          " Bre gain"
        );
      },
      canAfford() {
        return getBuyableAmount("Numbers", 14).gte(this.cost());
      },
      buy() {
        setBuyableAmount(
          "Numbers",
          14,
          getBuyableAmount("Numbers", 14).sub(this.cost())
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      unlocked() {
        return (
          getBuyableAmount(this.layer, 12).gte(1) ||
          getBuyableAmount(this.layer, this.id).gte(1) ||
          getBuyableAmount(this.layer, 16).gte(1) ||
          getBuyableAmount(this.layer, 18).gte(1) ||
          getBuyableAmount(this.layer, 19).gte(1)
        );
      },
    },
    14: {
      title: "Z<sub>4</sub> = Dic<sub>1</sub>",
      cost(x) {
        return new Decimal(x).add(1).mul(x.pow(0.25).add(2).ln()).round();
      },
      effect() {
        return getBuyableAmount(this.layer, this.id).add(1).pow(0.075);
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " Cyclic Groups of Order 4\nCost: " +
          this.cost() +
          " <b>4</b><br><br>Currently: ^" +
          format(this.effect()) +
          " Bre gain"
        );
      },
      canAfford() {
        return getBuyableAmount("Numbers", 15).gte(this.cost());
      },
      buy() {
        setBuyableAmount(
          "Numbers",
          15,
          getBuyableAmount("Numbers", 15).sub(this.cost())
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      unlocked() {
        return (
          getBuyableAmount(this.layer, 13).gte(1) ||
          getBuyableAmount(this.layer, this.id).gte(1) ||
          getBuyableAmount(this.layer, 18).gte(1) ||
          getBuyableAmount(this.layer, 20).gte(1)
        );
      },
    },
    15: {
      title: "Z<sub>5</sub>",
      cost(x) {
        return new Decimal(x).add(1).mul(x.pow(0.25).add(2).ln()).round();
      },
      effect() {
        return getBuyableAmount(this.layer, this.id).add(1).pow(0.08);
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " Cyclic Groups of Order 5\nCost: " +
          this.cost() +
          " <b>5</b><br><br>Currently: ^" +
          format(this.effect()) +
          " Bre gain"
        );
      },
      canAfford() {
        return getBuyableAmount("Numbers", 16).gte(this.cost());
      },
      buy() {
        setBuyableAmount(
          "Numbers",
          16,
          getBuyableAmount("Numbers", 16).sub(this.cost())
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      unlocked() {
        return (
          getBuyableAmount(this.layer, 14).gte(1) ||
          getBuyableAmount(this.layer, this.id).gte(1) ||
          getBuyableAmount(this.layer, 17).gte(1) ||
          getBuyableAmount(this.layer, 19).gte(1) ||
          getBuyableAmount(this.layer, 20).gte(1)
        );
      },
    },
    16: {
      title: "Z<sub>6</sub> = Z<sub>2</sub> × Z<sub>3</sub>",
      cost(x) {
        return new Decimal(x).add(1).mul(x.pow(0.25).add(2).ln()).round();
      },
      effect() {
        return getBuyableAmount(this.layer, this.id).add(1).pow(0.083);
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " Cyclic Groups of Order 6\nCost: " +
          this.cost() +
          " <b>Z<sub>2</sub></b> and <b>Z<sub>3</sub></b><br><br>Currently: ^" +
          format(this.effect()) +
          " Bre gain"
        );
      },
      canAfford() {
        return (
          getBuyableAmount(this.layer, 12).gte(this.cost()) &&
          getBuyableAmount(this.layer, 13).gte(this.cost())
        );
      },
      buy() {
        setBuyableAmount(
          this.layer,
          12,
          getBuyableAmount(this.layer, 12).sub(this.cost())
        );
        setBuyableAmount(
          this.layer,
          13,
          getBuyableAmount(this.layer, 13).sub(this.cost())
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      unlocked() {
        return hasUpgrade(this.layer, 11);
      },
    },
    17: {
      title: "Z<sub>10</sub> = Z<sub>2</sub> × Z<sub>5</sub>",
      cost(x) {
        return new Decimal(x).add(1).mul(x.pow(0.25).add(2).ln()).round();
      },
      effect() {
        return getBuyableAmount(this.layer, this.id).add(1).pow(0.09);
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " Cyclic Groups of Order 10\nCost: " +
          this.cost() +
          " <b>Z<sub>2</sub></b> and <b>Z<sub>5</sub></b><br><br>Currently: ^" +
          format(this.effect()) +
          " Bre gain"
        );
      },
      canAfford() {
        return (
          getBuyableAmount(this.layer, 12).gte(this.cost()) &&
          getBuyableAmount(this.layer, 15).gte(this.cost())
        );
      },
      buy() {
        setBuyableAmount(
          this.layer,
          12,
          getBuyableAmount(this.layer, 12).sub(this.cost())
        );
        setBuyableAmount(
          this.layer,
          15,
          getBuyableAmount(this.layer, 15).sub(this.cost())
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      unlocked() {
        return hasUpgrade(this.layer, 11);
      },
    },
    18: {
      title: "Z<sub>12</sub> = Z<sub>3</sub> × Z<sub>4</sub>",
      cost(x) {
        return new Decimal(x).add(1).mul(x.pow(0.25).add(2).ln()).round();
      },
      effect() {
        return getBuyableAmount(this.layer, this.id).add(1).pow(0.092);
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " Cyclic Groups of Order 12\nCost: " +
          this.cost() +
          " <b>Z<sub>3</sub></b> and <b>Z<sub>4</sub></b><br><br>Currently: ^" +
          format(this.effect()) +
          " Bre gain"
        );
      },
      canAfford() {
        return (
          getBuyableAmount(this.layer, 13).gte(this.cost()) &&
          getBuyableAmount(this.layer, 14).gte(this.cost())
        );
      },
      buy() {
        setBuyableAmount(
          this.layer,
          13,
          getBuyableAmount(this.layer, 13).sub(this.cost())
        );
        setBuyableAmount(
          this.layer,
          14,
          getBuyableAmount(this.layer, 14).sub(this.cost())
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      unlocked() {
        return hasUpgrade(this.layer, 11);
      },
    },
    19: {
      title: "Z<sub>15</sub> = Z<sub>3</sub> × Z<sub>5</sub>",
      cost(x) {
        return new Decimal(x).add(1).mul(x.pow(0.25).add(2).ln()).round();
      },
      effect() {
        return getBuyableAmount(this.layer, this.id).add(1).pow(0.093);
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " Cyclic Groups of Order 15\nCost: " +
          this.cost() +
          " <b>Z<sub>3</sub></b> and <b>Z<sub>5</sub></b><br><br>Currently: ^" +
          format(this.effect()) +
          " Bre gain"
        );
      },
      canAfford() {
        return (
          getBuyableAmount(this.layer, 13).gte(this.cost()) &&
          getBuyableAmount(this.layer, 15).gte(this.cost())
        );
      },
      buy() {
        setBuyableAmount(
          this.layer,
          13,
          getBuyableAmount(this.layer, 13).sub(this.cost())
        );
        setBuyableAmount(
          this.layer,
          15,
          getBuyableAmount(this.layer, 15).sub(this.cost())
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      unlocked() {
        return hasUpgrade(this.layer, 11);
      },
    },
    20: {
      title: "Z<sub>20</sub> = Z<sub>4</sub> × Z<sub>5</sub>",
      cost(x) {
        return new Decimal(x).add(1).mul(x.pow(0.25).add(2).ln()).round();
      },
      effect() {
        return getBuyableAmount(this.layer, this.id).add(1).pow(0.095);
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " Cyclic Groups of Order 20\nCost: " +
          this.cost() +
          " <b>Z<sub>4</sub></b> and <b>Z<sub>5</sub></b><br><br>Currently: ^" +
          format(this.effect()) +
          " Bre gain"
        );
      },
      canAfford() {
        return (
          getBuyableAmount(this.layer, 14).gte(this.cost()) &&
          getBuyableAmount(this.layer, 15).gte(this.cost())
        );
      },
      buy() {
        setBuyableAmount(
          this.layer,
          14,
          getBuyableAmount(this.layer, 14).sub(this.cost())
        );
        setBuyableAmount(
          this.layer,
          15,
          getBuyableAmount(this.layer, 15).sub(this.cost())
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      unlocked() {
        return hasUpgrade(this.layer, 11);
      },
    },
    21: {
      title: "K<sub>4</sub> = D<sub>4</sub> = Z<sub>2</sub><sup>2</sup>",
      cost(x) {
        return new Decimal(x).add(2).mul(x.add(2).ln()).round();
      },
      effect() {
        return getBuyableAmount(this.layer, this.id);
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " Klein Groups\nCost: " +
          this.cost() +
          " <b>Z<sub>2</sub></b><br><br>Currently: +" +
          this.effect() +
          " more numbers unlocked"
        );
      },
      canAfford() {
        return getBuyableAmount(this.layer, 12).gte(this.cost());
      },
      buy() {
        setBuyableAmount(
          this.layer,
          12,
          getBuyableAmount(this.layer, 12).sub(this.cost())
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      unlocked() {
        return hasUpgrade(this.layer, 11);
      },
    },
    22: {
      title: "S<sub>3</sub> = D<sub>6</sub> = Z<sub>3</sub> ⋊ <sub>Z2</sub>",
      cost(x) {
        return new Decimal(x).add(1).mul(x.pow(0.25).add(2).ln()).round();
      },
      effect() {
        return getBuyableAmount(this.layer, this.id).gte(1)
          ? new Decimal(0.9).div(
              getBuyableAmount(this.layer, this.id).pow(0.25)
            )
          : 1;
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " Symmetric Groups\nCost: " +
          this.cost() +
          " <b>Z<sub>2</sub></b>, <b>Z<sub>3</sub></b> and <b>6</b><br><br>Currently: exponent in {} formula raised to the power of " +
          format(this.effect()) +
          ", but Bre gain tetrated to the same number"
        );
      },
      canAfford() {
        return (
          getBuyableAmount("Numbers", 17).gte(this.cost()) &&
          getBuyableAmount(this.layer, 12).gte(this.cost()) &&
          getBuyableAmount(this.layer, 13).gte(this.cost())
        );
      },
      buy() {
        setBuyableAmount(
          "Numbers",
          17,
          getBuyableAmount("Numbers", 17).sub(this.cost())
        );
        setBuyableAmount(
          this.layer,
          12,
          getBuyableAmount(this.layer, 12).sub(this.cost())
        );
        setBuyableAmount(
          this.layer,
          13,
          getBuyableAmount(this.layer, 13).sub(this.cost())
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
        player.points = new Decimal(0);
      },
      unlocked() {
        return hasUpgrade(this.layer, 12);
      },
    },
    23: {
      title: "Z<sub>7</sub>",
      cost(x) {
        return new Decimal(x).add(1).mul(x.pow(0.25).add(2).ln()).round();
      },
      effect() {
        return getBuyableAmount(this.layer, this.id).add(1).pow(0.086);
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " Cyclic Groups of Order 7\nCost: " +
          this.cost() +
          " <b>7</b><br><br>Currently: ^" +
          format(this.effect()) +
          " Bre gain"
        );
      },
      canAfford() {
        return getBuyableAmount("Numbers", 18).gte(this.cost());
      },
      buy() {
        setBuyableAmount(
          "Numbers",
          18,
          getBuyableAmount("Numbers", 18).sub(this.cost())
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      unlocked() {
        return getBuyableAmount(this.layer, 21).gte(2);
      },
    },
    24: {
      title: "Z<sub>8</sub>",
      cost(x) {
        return new Decimal(x).add(1).mul(x.pow(0.25).add(2).ln()).round();
      },
      effect() {
        return getBuyableAmount(this.layer, this.id).add(1).pow(0.088);
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " Cyclic Groups of Order 8\nCost: " +
          this.cost() +
          " <b>8</b><br><br>Currently: ^" +
          format(this.effect()) +
          " Bre gain"
        );
      },
      canAfford() {
        return getBuyableAmount("Numbers", 19).gte(this.cost());
      },
      buy() {
        setBuyableAmount(
          "Numbers",
          19,
          getBuyableAmount("Numbers", 19).sub(this.cost())
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      unlocked() {
        return getBuyableAmount(this.layer, 21).gte(3);
      },
    },
    25: {
      title: "Z<sub>9</sub>",
      cost(x) {
        return new Decimal(x).add(1).mul(x.pow(0.25).add(2).ln()).round();
      },
      effect() {
        return getBuyableAmount(this.layer, this.id).add(1).pow(0.089);
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " Cyclic Groups of Order 8\nCost: " +
          this.cost() +
          " <b>8</b><br><br>Currently: ^" +
          format(this.effect()) +
          " Bre gain"
        );
      },
      canAfford() {
        return getBuyableAmount("Numbers", 21).gte(this.cost());
      },
      buy() {
        setBuyableAmount(
          "Numbers",
          21,
          getBuyableAmount("Numbers", 21).sub(this.cost())
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      unlocked() {
        return getBuyableAmount(this.layer, 21).gte(4);
      },
    },
    26: {
      title: "Z<sub>11</sub>",
      cost(x) {
        return new Decimal(x).add(1).mul(x.pow(0.25).add(2).ln()).round();
      },
      effect() {
        return getBuyableAmount(this.layer, this.id).add(1).pow(0.091);
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " Cyclic Groups of Order 11\nCost: " +
          this.cost() +
          " <b>11</b><br><br>Currently: ^" +
          format(this.effect()) +
          " Bre gain"
        );
      },
      canAfford() {
        return getBuyableAmount("Numbers", 23).gte(this.cost());
      },
      buy() {
        setBuyableAmount(
          "Numbers",
          23,
          getBuyableAmount("Numbers", 23).sub(this.cost())
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      unlocked() {
        return getBuyableAmount(this.layer, 21).gte(6);
      },
    },
    27: {
      title: "Z<sub>13</sub>",
      cost(x) {
        return new Decimal(x).add(1).mul(x.pow(0.25).add(2).ln()).round();
      },
      effect() {
        return getBuyableAmount(this.layer, this.id).add(1).pow(0.092);
      },
      display() {
        return (
          "You have " +
          getBuyableAmount(this.layer, this.id) +
          " Cyclic Groups of Order 13\nCost: " +
          this.cost() +
          " <b>13</b><br><br>Currently: ^" +
          format(this.effect()) +
          " Bre gain"
        );
      },
      canAfford() {
        return getBuyableAmount("Numbers", 25).gte(this.cost());
      },
      buy() {
        setBuyableAmount(
          "Numbers",
          25,
          getBuyableAmount("Numbers", 25).sub(this.cost())
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      unlocked() {
        return getBuyableAmount(this.layer, 21).gte(8);
      },
    },
  },
  layerShown() {
    return hasUpgrade("Numbers", 15);
  },
  tabFormat: {
    "Main tab": {
      content: [
        [
          "row",
          [
            ["buyable", 11],
            ["buyable", 21],
          ],
        ],
        "blank",
        "upgrades",
      ],
    },
    "Cyclic Groups": {
      content: [
        [
          "row",
          [
            ["buyable", 12],
            ["buyable", 13],
            ["buyable", 14],
            ["buyable", 15],
            ["buyable", 16],
            ["buyable", 23],
            ["buyable", 24],
            ["buyable", 25],
            ["buyable", 26],
            ["buyable", 27],
            ["buyable", 17],
            ["buyable", 18],
            ["buyable", 19],
            ["buyable", 20],
          ],
        ],
        "blank",
        [
          "display-text",
          function () {
            return "Current total boost: ^" + format(cyclicEffect());
          },
        ],
      ],
    },
    "Symmetric Groups": {
      content: [["row", [["buyable", 22]]]],
    },
  },
  automate() {
    if (
      hasUpgrade(this.layer, 13) &&
      !(getClickableState("Numbers", 12) == "Off")
    ) {
      for (let i = 12; i <= 20; i++) buyBuyable(this.layer, i);
      for (let i = 23; i <= 27; i++) buyBuyable(this.layer, i);
    }
  },
});

addLayer("achievements", {
  symbol: "O",
  startData() {
    return {
      unlocked: true,
    };
  },
  row: "side",
  tooltip() {
    return "Achievements";
  },
  achievements: {},
});
