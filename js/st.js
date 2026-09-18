addLayer("st", {
name: "sticks", // This is optional, only used in a few places, If absent it just uses the layer id.
symbol: "ST", // This appears on the layer's node. Default is the id with the first letter capitalized
position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
startData() { return {
unlocked: true,
points: new Decimal(0),
best: new Decimal(0),
total: new Decimal(0),
}},
color: "#8a2c06",
requires: new Decimal(10), // Can be a function that takes requirement increases into account
resource: "sticks", // Name of prestige currency
baseResource: "points", // Name of resource prestige is based on
baseAmount() {return player.points}, // Get the current amount of baseResource
type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
exponent: 0.5, // Prestige currency exponent
gainMult() { // Calculate the multiplier for main currency from bonuses
mult = new Decimal(1)
if (hasUpgrade("st", 14)) mult = mult.times(2.75)
if (hasUpgrade("st", 21)) mult = mult.times(upgradeEffect('st', 21))
if (hasUpgrade("st", 23)) mult = mult.times(1.65)
if (hasUpgrade("st", 25)) mult = mult.times(3.15)
if (hasUpgrade("st", 33)) mult = mult.times(upgradeEffect('st', 33))
if (hasUpgrade("st", 34)) mult = mult.times(2.45)
if (hasUpgrade("m", 11)) mult = mult.times(2.25)

if (hasMilestone("m", 2)) mult = mult.times(3.5)

  
return mult
},
gainExp() { // Calculate the exponent on main currency from bonuses
exp = new Decimal(1)
return exp
},
row: 1, // Row the layer is in on the tree (0 is the first row)
hotkeys: [
{key: "s", description: "S: Reset for sticks", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
],
layerShown(){return true},
upgrades: {

11: {
title: "Stick Upgrade 11",
description: "X2.5 points.",
cost: new Decimal(1),
unlocked() { return player[this.layer].unlocked }, // The upgrade is only visible when this is true
},

12: {
title: "Stick Upgrade 12",
description: "Sticks boost points.",
cost: new Decimal(3),
unlocked() { return hasUpgrade('st', 11) }, // The upgrade is only visible when this is true
effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
let ret = player.st.points.add(1).ln().add(1).pow(0.85)
if (ret.gte("1e60")) ret = ret.sqrt().times("1e30")
return ret;
},
effectDisplay() { return format(this.effect())+"x" },
tooltip: "formula: <br> ln(sticks + 1) +1 ^ 0.85"
},

13: {
title: "Stick Upgrade 13",
description: "X1.2 points per stick upgrade.",
cost: new Decimal(10),
unlocked() { return hasUpgrade('st', 12) }, // The upgrade is only visible when this is true
effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
let ret = new Decimal.pow(1.2, player.st.upgrades.length)
return ret;
},
effectDisplay() { return format(this.effect())+"x" },
tooltip: "formula: <br> 1.2 ^ stick upgrades"
},

14: {
title: "Stick Upgrade 14",
description: "X2.75 sticks.",
cost: new Decimal(25),
unlocked() { return hasUpgrade('st', 13) }, // The upgrade is only visible when this is true

},
15: {
title: "Stick Upgrade 15",
description: "X3.45 points.",
cost: new Decimal(60),
unlocked() { return hasUpgrade('st', 14) }, // The upgrade is only visible when this is true

},
21: {
title: "Stick Upgrade 21",
description: "X1.13 sticks per stick upgrade.",
cost: new Decimal(250),
unlocked() { return hasUpgrade('st', 15) }, // The upgrade is only visible when this is true
effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
let ret = new Decimal.pow(1.13, player.st.upgrades.length)
return ret;
},
effectDisplay() { return format(this.effect())+"x" },
tooltip: "formula: <br> 1.13 ^ stick upgrades"

},
22: {
title: "Stick Upgrade 22",
description: "X1.4 points per stick upgrade - 3.",
cost: new Decimal(850),
unlocked() { return hasUpgrade('st', 21) }, // The upgrade is only visible when this is true
effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
let ret = new Decimal.pow(1.4, player.st.upgrades.length - 3)
return ret;
},
effectDisplay() { return format(this.effect())+"x" },
tooltip: "formula: <br> 1.4 ^ stick upgrades - 3"

},
23: {
title: "Stick Upgrade 23",
description: "X1.65 sticks.",
cost: new Decimal(2500),
unlocked() { return hasUpgrade('st', 22) }, // The upgrade is only visible when this is true


},
24: {
title: "Stick Upgrade 24",
description: "X2.25 points.",
cost: new Decimal(6000),
unlocked() { return hasUpgrade('st', 23) }, // The upgrade is only visible when this is true


},
25: {
title: "Stick Upgrade 25",
description: "X3.15 sticks.",
cost: new Decimal(15000),
unlocked() { return hasUpgrade('st', 24) }, // The upgrade is only visible when this is true


},
31: {
title: "Stick Upgrade 31",
description: "Sticks boost points.",
cost: new Decimal(250000),
unlocked() { return hasUpgrade('st', 25) && hasMilestone('m', 1)}, // The upgrade is only visible when this is true
effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
let ret = player.st.points.add(1).log(13)
return ret;
},
effectDisplay() { return format(this.effect())+"x" },
tooltip: "formula: <br> log13(sticks+1)"

},
32: {
title: "Stick Upgrade 32",
description: "Boost points.",
cost: new Decimal(600000),
unlocked() { return hasUpgrade('st', 31) && hasMilestone('m', 1)}, // The upgrade is only visible when this is true
effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
let ret = new Decimal.pow(2, player.st.upgrades.length /(6))
return ret;
},
effectDisplay() { return format(this.effect())+"x" },
tooltip: "formula: <br> 2 ^ stick upgrades/6"

},
33: {
title: "Stick Upgrade 33",
description: "Stick upgrades boost sticks.",
cost: new Decimal(1.6e6),
unlocked() { return hasUpgrade('st', 32) && hasMilestone('m', 1)}, // The upgrade is only visible when this is true
effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
let ret = new Decimal.pow(3.2, player.st.upgrades.length).tetrate(0.65).cbrt().log(2.55)
return ret;
},
effectDisplay() { return format(this.effect())+"x" },
tooltip: "formula: <br> log2.55, cbrt(3.2 ^ stick upgrades ^^ 0.65)"

},
34: {
title: "Stick Upgrade 34",
description: "X2.45 sticks.",
cost: new Decimal(7e6),
unlocked() { return hasUpgrade('st', 33) && hasMilestone('m', 1)}, // The upgrade is only visible when this is true


},
35: {
title: "Stick Upgrade 35",
description: "X3.35 points.",
cost: new Decimal(30e6),
unlocked() { return hasUpgrade('st', 34) && hasMilestone('m', 1)}, // The upgrade is only visible when this is true


},
},
})
