addLayer("s", {
name: "stone", // This is optional, only used in a few places, If absent it just uses the layer id.
symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
startData() { return {
unlocked: false,
points: new Decimal(0),
best: new Decimal(0),
total: new Decimal(0),
}},
color: "#635d5a",
requires: new Decimal(2.5e9), // Can be a function that takes requirement increases into account
resource: "stone", // Name of prestige currency
baseResource: "points", // Name of resource prestige is based on
baseAmount() {return player.points}, // Get the current amount of baseResource
type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
exponent: 0.5, // Prestige currency exponent
gainMult() { // Calculate the multiplier for main currency from bonuses
mult = new Decimal(1)


  
return mult
},
gainExp() { // Calculate the exponent on main currency from bonuses
exp = new Decimal(1)
return exp
},
row: 2, // Row the layer is in on the tree (0 is the first row)
hotkeys: [
{key: "S", description: "SHIFT + S: Reset for stone", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
],
layerShown(){return hasMilestone('m', 2)},
upgrades: {

11: {
title: "Stone Upgrade 11",
description: "X1.75 points and x2.25 sticks.",
cost: new Decimal(1),
unlocked() { return player[this.layer].unlocked }, // The upgrade is only visible when this is true
},
12: {
title: "Stone Upgrade 12",
description: "Best stone boosts points.",
cost: new Decimal(3),
unlocked() { return hasUpgrade('s', 11) }, // The upgrade is only visible when this is true
effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
let ret = player.s.best.log(2.6).add(1.5).pow(0.88)
if (ret.gte("1e20")) ret = ret.sqrt().times("1e10")
return ret;
},
effectDisplay() { return format(this.effect())+"x" },
tooltip: "formula: <br> log2.6(best stone) + 1.5 ^ 0.88"
},


},
})
