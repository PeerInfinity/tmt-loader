addLayer("m", {
name: "materialize", // This is optional, only used in a few places, If absent it just uses the layer id.
symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
branches: ['st'],
startData() { return {
unlocked: false,
points: new Decimal(0),

}},
color: "#979797",
requires: new Decimal(100000), // Can be a function that takes requirement increases into account
resource: "materialization", // Name of prestige currency
baseResource: "sticks", // Name of resource prestige is based on
tooltip() {return  "materialization " + format(player.m.points) },
lockedTooltip: "Reach 100,000 sticks to unlock!",
baseAmount() {return player.st.points}, // Get the current amount of baseResource
type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
base: 1000,
exponent: 1.75, // Prestige currency exponent
gainMult() { // Calculate the multiplier for main currency from bonuses
mult = new Decimal(1)


  
return mult
},
prestigeButtonText() {return "Reset everything and perform a materialization. <br><br> Reach " + format(tmp.m.nextAt) + " sticks to perform"},
gainExp() { // Calculate the exponent on main currency from bonuses
exp = new Decimal(1)
return exp
},
row: 10, // Row the layer is in on the tree (0 is the first row)
hotkeys: [
{key: "m", description: "M: Reset for a material", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
],
layerShown(){return hasUpgrade('st', 25) || player.m.unlocked},
milestones: {
    1: {
        requirementDescription: "materialization 1",
        effectDescription: "Triple points and unlock a new row of stick upgrades.",
        done() { return player.m.points.gte(1) }
    },
     2: {
        requirementDescription: "materialization 2",
        effectDescription: "X3.5 sticks and x2.25 points. Unlock stone.",
        done() { return player.m.points.gte(2) },
        unlocked() {return hasMilestone('m', 1)}
    }
    
}
})
