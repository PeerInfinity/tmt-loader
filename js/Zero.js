addLayer("Z", {
    name: "Zero", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Z", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#534202",
    requires(){
      return new Decimal(4e4)} ,
    resource(){return "Zero"}, 
    baseResource: "Infinity", // Name of resource prestige is based on
    baseAmount() {return player.I.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent(){
        return 1.5
    },
    branches:["I"],
     // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let mult=new Decimal(1) 
        return mult
    },
    hotkeys: [
        {key: "Z", description: "Shift + Z: Reset for Zero", onPress(){if (canReset(this.layer)) doReset(this.layer)},
        onPress() { if (player.Z.unlocked) doReset("Z") },
        unlocked() {return hasMilestone('I', 40000)} // Determines if you can use the hotkey, optional
    },
    ],
    row: 3, // Row the layer is in on the tree (0 is the first row)
    milestones: {
        1: {
            requirementDescription: "1 Zeros",
            effectDescription: "Number gain ^1.05, prime factor point gain x10 and keep factor shift and upgrade factor milestone on reset.",
            done() { return player.Z.points.gte(1) }        
        },
        2: {
            requirementDescription: "2 Zeros",
            effectDescription: "Point gain ^1.05, keep infinity milestone on reset.",
            done() { return player.Z.points.gte(2) }        
        },
        3: {
            requirementDescription: "3 Zeros",
            effectDescription: "Keep Negative number upgrade on reset.",
            done() { return player.Z.points.gte(3) }        
        },
        4: {
            requirementDescription: "4 Zeros",
            effectDescription: "Keep Factor milestone on reset.",
            done() { return player.Z.points.gte(4) }        
        },
        5: {
            requirementDescription: "5 Zeros",
            effectDescription: "Auto buy 2, 3 and Infinity. Infinity resets nothing",
            done() { return player.Z.points.gte(5) }        
        },
        6: {
            requirementDescription: "6 Zeros",
            effectDescription: "Auto buy 5 and 7. Unlock trapper (not yet).",
            done() { return player.Z.points.gte(6) }        
        },
        },

    layerShown(){return (hasMilestone("I",40000)&&player.X.points.gte(1))||player.Z.points.gte(1)},
})