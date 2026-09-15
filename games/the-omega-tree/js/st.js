addLayer("st", {
    name: "Super Tier", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "ST", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    tabFormat: [
        "main-display",
        "prestige-button",
        ["microtabs", "stuff"],
        ["blank", "25px"],
    ],
    tooltip(){
        return "<h3>Super Tier</h3><br>" + "Super Tier " + format(player.st.points)
      },
      microtabs: {
        stuff: {
                "Milestones": {
                    content: [
                        ["blank", "15px"],
                        "milestones"
                    ]
                },
        },
    },
            milestones: {
                1: {
                    requirementDescription() {
                        dis = "[1] Super Tier 1"
                        if (hasUpgrade('cp', 41)) dis = dis + " (Charged)"  
                        return dis},
                    effectDescription() {
                        dis = "10x Leaf Points, 250x everything else (Except PP)"
                        if (hasUpgrade('cp', 41)) dis = dis + "<br>Charge effect: Energy boosts Charge Power & Leaf Points.<br>Currently: " + format(upgradeEffect('cp', 41)) + "x"
                        return dis},
                    done() { return player.st.points.gte(1) },
                    style(){if (hasUpgrade('cp', 41)) return{'background-color':'#ffad00'}}
                },
                2: {
                    requirementDescription(){des = "[2] Super Tier 2"
                        if (hasUpgrade('cp', 53)) des = des + " (Charged)"
                        return des},
                    effectDescription() {des = "10x Leaf Points and 100,000,000,000x Time Power, Cells, Sacrifice Points, Energy, Light, Mega-Points and always have the first leaf upgrade."
                    if (hasUpgrade('cp', 53)) des = des + "<br> Charge effect: ^1.1 Time Power and ^1.05 Leaf Points."
                    return des},
                    done() { return player.st.points.gte(2) },
                    style(){if (hasUpgrade('cp', 53)) return{'background-color':'#ffad00'}}
                },
                3: {
                    requirementDescription() {
                        dis = "[3] Super Tier 3"
                        if (hasUpgrade('cp', 64)) dis = dis + " (Charged)"  
                        return dis},
                    effectDescription() {
                        dis = "5x Leaf Points and keep Sacrifice Milestones & Challenges."                        
                        if (hasUpgrade('cp', 64)) dis = dis + "<br>Charge effect: Light boosts Charge Power & Leaf Points.<br>Currently: " + format(upgradeEffect('cp', 64)) + "x"
                        return dis},
                    done() { return player.st.points.gte(3) },
                    style(){if (hasUpgrade('cp', 64)) return{'background-color':'#ffad00'}}
                },
                4: {
                    requirementDescription(){des = "[4] Super Tier 4"
                        if (hasUpgrade('cp', 73)) des = des + " (Charged)"
                        return des},
                    effectDescription() {des = "100x Leaf Points, Time Power, Cells and Mega-Points."
                    if (hasUpgrade('cp', 73)) des = des + "<br> Charge effect: Light effect softcap is even weaker."
                    return des},
                    done() { return player.st.points.gte(4) },
                    style(){if (hasUpgrade('cp', 73)) return{'background-color':'#ffad00'}}
                },
                5: {
                    requirementDescription(){des = "[5] Super Tier 5"
                        if (hasUpgrade('cp', 82)) des = des + " (Charged)"
                        return des},
                    effectDescription() {des = "5x Leaf Points."
                    if (hasUpgrade('cp', 82)) des = des + "<br> Charge effect: ^1.2 Cells."
                    return des},
                    done() { return player.st.points.gte(5) },
                    style(){if (hasUpgrade('cp', 82)) return{'background-color':'#ffad00'}}
                },
                6: {
                    requirementDescription(){des = "[6] Super Tier 6"
                        if (hasUpgrade('cp', 91)) des = des + " (Charged)"
                        return des},
                    effectDescription() {des = "3x Leaf Points and unlock a new layer."
                    if (hasUpgrade('cp', 91)) des = des + "<br> Charge effect: ^1.3 Divine Points."
                    return des},
                    done() { return player.st.points.gte(6) },
                    style(){if (hasUpgrade('cp', 91)) return{'background-color':'#ffad00'}}
                },
                7: {
                    requirementDescription(){des = "[7] Super Tier 8"
                        if (hasUpgrade('dp', 43)) des = des + " (Charged)"
                        return des},
                    effectDescription() {des = "1,000,000,000x Charge Power."
                    if (hasUpgrade('dp', 43)) des = des + "<br> Charge effect: ^1.25 Leaf Points."
                    return des},
                    done() { return player.st.points.gte(8) },
                    style(){if (hasUpgrade('dp', 43)) return{'background-color':'#ffad00'}}
                },
                8: {
                    requirementDescription() {
                        dis = "[8] Super Tier 10"
                        if (hasUpgrade('cp', 95)) dis = dis + " (Charged)"  
                        return dis},
                    effectDescription() {
                        dis = "Keep Leaf Milestones on reset."                        
                        if (hasUpgrade('cp', 95)) dis = dis + "<br>Charge effect: Mega Points boosts Super Charge Power.<br>Currently: " + format(upgradeEffect('cp', 95)) + "x"
                        return dis},
                    done() { return player.st.points.gte(10) },
                    style(){if (hasUpgrade('cp', 95)) return{'background-color':'#ffad00'}}
                },
                9: {
                    requirementDescription() {
                        dis = "[9] Super Tier 18"
                        if (hasUpgrade('cp', 102)) dis = dis + " (Charged)"  
                        return dis},
                    effectDescription() {
                        dis = "LB21 adds free levels to LB13."                        
                        if (hasUpgrade('cp', 102)) dis = dis + "<br>Charge effect: Hyper Points boosts Super Charge Power.<br>Currently: " + format(upgradeEffect('cp', 102)) + "x"
                        return dis},
                    done() { return player.st.points.gte(18) },
                    style(){if (hasUpgrade('cp', 102)) return{'background-color':'#ffad00'}}
                },
                10: {
                    requirementDescription() {
                        dis = "[10] Super Tier 21"
                        if (hasUpgrade('cp', 104)) dis = dis + " (Charged)"  
                        return dis},
                    effectDescription() {
                        dis = "^1.05 Energy & Light, Cells and Charge Power."
                        if (hasUpgrade('cp', 104)) dis = dis + "<br>Charge effect: Super Charge Power boosts Rebirth Points.<br>Currently: " + format(upgradeEffect('cp', 104)) + "x"
                        return dis},
                    done() { return player.st.points.gte(21) },
                    style(){if (hasUpgrade('cp', 104)) return{'background-color':'#ffad00'}}
                },
    },
    autoPrestige() {
        return hasAchievement("a", 273)
    },
    canBuyMax() { return hasMilestone("rp", 7) },
    resetsNothing() {return hasAchievement("a", 273)},
    doReset(dp) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[dp].row <= this.row) return;
    
        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 21, Milestones
        let keptUpgrades = [];
    
        // Stage 3, track which main features you want to keep - milestones
        let keep = [];
        if (hasMilestone('dp', 2)) keep.push("milestones");
        if (hasAchievement('a', 293)) keep.push("milestones");
        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);
    
        // Stage 5, add back in the specific subfeatures you saved earlier
        player[this.layer].upgrades.push(...keptUpgrades);
    },
    color: "#8b0000",
    requires: new Decimal("e13"), // Can be a function that takes requirement increases into account
    resource: "Super Tier", // Name of prestige currency
    baseResource: "Leaf Points", // Name of resource prestige is based on
    baseAmount() {return player.le.points}, // Get the current amount of baseResource
    branches: ["le"],
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {if (hasUpgrade("rp", 33)) return new Decimal(2)
        else if (hasUpgrade("le", 72)) return new Decimal("2.25")
    else if (hasUpgrade("le", 55)) return new Decimal("2.85")
    else return new Decimal(3)},    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('le', 52)) mult = mult.div(upgradeEffect('le', 52))
            if (inChallenge('rp', 11)) mult = mult.times(Infinity)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 7, // Row the layer is in on the tree (0 is the first row)
    displayRow: 6, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return (hasMilestone("le", 8) || player[this.layer].unlocked)},
})
