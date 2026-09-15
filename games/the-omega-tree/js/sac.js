addLayer("sa", {
    name: "sa", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Sac", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
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
        return "<h3>Sacrifice</h3><br>" + "Sac Tier " + format(player.sa.points)
      },
      microtabs: {
        stuff: {
                "Milestones": {
                    content: [
                        ["blank", "15px"],
                        ["raw-html", () => `<h4 style="opacity:.5">You reached Sacrifice! There is no upgrades in this layer. It will reset EVERYTHING except Achievements.</h4>`],
                        "milestones"
                    ]
                },
                "Challenges": {
                    unlocked() {return (hasMilestone("sa", 20))},
            content: [
                ["blank", "15px"],
                ["challenges", [1,2]]
                
            ]
        },
            },
    
},
milestones: {
    1: {
        requirementDescription(){des = "[1] Sacrifice Tier 1"
            if (hasUpgrade('cp', 32)) des = des + " (Charged)"
            return des},
        effectDescription() {des = "5x Everything (Except PP) and 50x Points."
        if (hasUpgrade('cp', 32)) des = des + "<br> Charge effect: LP21 also affects Charge Power gain."
        return des},
        done() { return player.sa.points.gte(1) },
        style(){if (hasUpgrade('cp', 32)) return{'background-color':'#ffad00'}}
    },
    2: {
        requirementDescription(){des = "[2] Sacrifice Tier 2"
            if (hasUpgrade('cp', 52)) des = des + " (Charged)"
            return des},
        effectDescription() {des = "3x Energy & Light Gain and 5x everything else (Except PP and MP) + automate Points-4, Points-5 and Points-6."
        if (hasUpgrade('cp', 52)) des = des + "<br> Charge effect: ^1.05 Ultra-Points."
        return des},
        done() { return player.sa.points.gte(2) },
        style(){if (hasUpgrade('cp', 52)) return{'background-color':'#ffad00'}}
    },
    3: {
        requirementDescription() {
            dis = "[3] Sacrifice Tier 3"
            if (hasUpgrade('cp', 62)) dis = dis + " (Charged)"  
            return dis},
        effectDescription() {
            dis = "2x Energy & Light Gain and 3x everything else (Except PP and MP) + Keep Hyper-Point Challenges"
            if (hasUpgrade('cp', 62)) dis = dis + "<br>Charge effect: Cells boosts Charge Power & Leaf Points.<br>Currently: " + format(upgradeEffect('cp', 62)) + "x"
            return dis},
        done() { return player.sa.points.gte(3) },
        style(){if (hasUpgrade('cp', 62)) return{'background-color':'#ffad00'}}
    },
    4: {
        requirementDescription() {
            dis = "[4] Sacrifice Tier 4"
            if (hasUpgrade('cp', 71)) dis = dis + " (Charged)"  
            return dis},
        effectDescription() {
            dis = "5x Energy & Light Gain, 50x Hyper-Points and 2x Mega-Points"
            if (hasUpgrade('cp', 71)) dis = dis + "<br>Charge effect: Time Power boosts Charge Power & Leaf Points.<br>Currently: " + format(upgradeEffect('cp', 71)) + "x"
            return dis},
        done() { return player.sa.points.gte(4) },
        style(){if (hasUpgrade('cp', 71)) return{'background-color':'#ffad00'}}
    },
    5: {
        requirementDescription() {
            dis = "[5] Sacrifice Tier 5"
            if (hasUpgrade('cp', 75)) dis = dis + " (Charged)"  
            return dis},
        effectDescription() {
            dis = "4x Energy & Light Gain and gain 100% of Hyper-Points gain per second."
            if (hasUpgrade('cp', 75)) dis = dis + "<br>Charge effect: Sacrifice Tier boosts Divine Points.<br>Currently: " + format(upgradeEffect('cp', 75)) + "x"
            return dis},
        done() { return player.sa.points.gte(5) },
        style(){if (hasUpgrade('cp', 75)) return{'background-color':'#ffad00'}}
    },
    6: {
        requirementDescription(){des = "[6] Sacrifice Tier 6"
            if (hasUpgrade('cp', 84)) des = des + " (Charged)"
            return des},
        effectDescription() {des = "25x Energy & Light Gain and 4x Mega-Points + Keep Mega-Point challenges."
        if (hasUpgrade('cp', 84)) des = des + "<br> Charge effect: ^1.2 Light and 1,000,000,000x Leaf Points."
        return des},
        done() { return player.sa.points.gte(6) },
        style(){if (hasUpgrade('cp', 84)) return{'background-color':'#ffad00'}}
    },
    7: {
        requirementDescription() {
            dis = "[7] Sacrifice Tier 7"
            if (hasUpgrade('dp', 41)) dis = dis + " (Charged)"  
            return dis},
        effectDescription() {
            dis = "1.5x Energy & Light Gain and 1,000,000,000x Points."
            if (hasUpgrade('dp', 41)) dis = dis + "<br>Charge effect: Divine Perks boosts Sacrifice Points & Mega Points.<br>Currently: " + format(upgradeEffect('dp', 41)) + "x"
            return dis},
        done() { return player.sa.points.gte(7) },
        style(){if (hasUpgrade('dp', 41)) return{'background-color':'#ffad00'}}
    },
    8: {
        requirementDescription() {
            dis = "[8] Sacrifice Tier 8"
            if (hasUpgrade('cp', 93)) dis = dis + " (Charged)"  
            return dis},
        effectDescription() {
            dis = "1,000,000,000x Points again, Super-Points, Ultra-Points and Hyper-Points."
            if (hasUpgrade('cp', 93)) dis = dis + "<br>Charge effect: Leaf Points boosts Super Charge Points.<br>Currently: " + format(upgradeEffect('cp', 93)) + "x"
            return dis},
        done() { return player.sa.points.gte(8) },
        style(){if (hasUpgrade('cp', 93)) return{'background-color':'#ffad00'}}
    },
    9: {
        requirementDescription() {
            dis = "[9] Sacrifice Tier 9"
            if (hasUpgrade('cp', 101)) dis = dis + " (Charged)"  
            return dis},
        effectDescription() {
            dis = "20x Everything below Sac (Except PP)"
            if (hasUpgrade('cp', 101)) dis = dis + "<br>Charge effect: Energy boosts Super Charge Power.<br>Currently: " + format(upgradeEffect('cp', 101)) + "x"
            return dis},
        done() { return player.sa.points.gte(9) },
        style(){if (hasUpgrade('cp', 101)) return{'background-color':'#ffad00'}}
    },
    10: {
        requirementDescription() {
            dis = "[10] Sacrifice Tier 10"
            if (hasUpgrade('cp', 103)) dis = dis + " (Charged)"  
            return dis},
        effectDescription() {
            dis = "Unlock a new sub-layer + 7.5x Everything below Sac (Except PP) and keep Hyper-Point milestones on reset"
            if (hasUpgrade('cp', 103)) dis = dis + "<br>Charge effect: Ultra-Points boosts Super Charge Power.<br>Currently: " + format(upgradeEffect('cp', 103)) + "x"
            return dis},
        done() { return player.sa.points.gte(10) },
        style(){if (hasUpgrade('cp', 103)) return{'background-color':'#ffad00'}}
    },
11: {
    requirementDescription: "[11] Sacrifice Tier 11",
    effect() {
        let eff = player.sa.points.add(1).pow(0.5)
        return eff
    },
    effectDescription() {
        return "Sacrifice Tier boosts Sacrifice Points and keep mega-point milestones on reset.<br>Currently: " + format(milestoneEffect("sa",11))+"x"}
        ,    done() { return player.sa.points.gte("11")}
        
    },
    12: {
        requirementDescription: "[12] Sacrifice Tier 12",
        effectDescription: "Unlock more energy upgrades and Air is automated.",
        done() { return player.sa.points.gte(12) }
    },
    13: {
        requirementDescription: "[13] Sacrifice Tier 13",
        effectDescription: "30x Energy, Light and Mega-Points.",
        done() { return player.sa.points.gte(13) }
    },
    14: {
        requirementDescription: "[14] Sacrifice Tier 14",
        effectDescription: "^1.02 Mega-Points.",
        done() { return player.sa.points.gte(14) }
    },
    15: {
        requirementDescription: "[15] Sacrifice Tier 15",
        effectDescription: "5x MP.",
        done() { return player.sa.points.gte(15) }
    },
    16: {
        requirementDescription: "[16] Sacrifice Tier 16",
        effectDescription: "1,000,000,000x Energy & Light.",
        done() { return player.sa.points.gte(16) }
    },
    17: {
        requirementDescription: "[17] Sacrifice Tier 17",
        effectDescription: "5x SP and MP.",
        done() { return player.sa.points.gte(17) }
    },
    18: {
        requirementDescription: "[18] Sacrifice Tier 18",
        effectDescription: "10x Energy, Light and Mega-Points.",
        done() { return player.sa.points.gte(18) }
    },
    19: {
        requirementDescription: "[19] Sacrifice Tier 19",
        effectDescription: "1e55x Sacrifice Points. (Overpowered)",
        done() { return player.sa.points.gte(19) }
    },
    20: {
        requirementDescription: "[20] Sacrifice Tier 23",
        effectDescription: "Unlock a sacrifice challenge.",
        done() { return player.sa.points.gte(23) }
    },
    21: {
        requirementDescription: "[21] Sacrifice Tier 27",
        effect() {
            let eff = player.sa.points.add(1).pow(1)
            return eff
        },
        effectDescription() {
            return "Sacrifice Tier boosts Cells and Sacrifice Points. + Make Cell Buyables 12 & 13 Cheaper.<br>Currently: " + format(milestoneEffect("sa",21))+"x"}
            ,    done() { return player.sa.points.gte("27")}
            
        },
        22: {
            requirementDescription: "[22] Sacrifice Tier 28",
            effectDescription: "^1.05 Sacrifice Points and ^1.02 Cells.",
            done() { return player.sa.points.gte(28) }
        },
        23: {
            requirementDescription: "[23] Sacrifice Tier 30 ",
            effectDescription: "^1.05 Hyper-Points.",
            done() { return player.sa.points.gte(30) }
        },
        24: {
            requirementDescription: "[24] Sacrifice Tier 35",
            effectDescription: "Unlock another sacrifice challenge.",
            done() { return player.sa.points.gte(35) }
        },
        25: {
            requirementDescription: "[25] Sacrifice Tier 40",
            effectDescription: "1e24x Cells.",
            done() { return player.sa.points.gte(40) }
        },
        26: {
            requirementDescription: "[26] Sacrifice Tier 43",
            effect() {
                let eff = player.scp.points.add(1).pow(1)
                return eff
            },
            effectDescription() {
                return "Sacrifice Points boosts Points + Unlock a new layer<br>Currently: " + format(milestoneEffect("sa",26))+"x"}
                ,    done() { return player.sa.points.gte("43")}
                
            },
},
doReset(le) {
    // Stage 1, almost always needed, makes resetting this layer not delete your progress
    if (layers[le].row <= this.row) return;

    // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 21, Milestones
    let keptUpgrades = [];

    // Stage 3, track which main features you want to keep - milestones
    let keep = [];
    if (hasMilestone('le', 7)) keep.push("challenges");
    if (hasAchievement('a', 293)) keep.push("challenges");
    if (hasMilestone('le', 7)) keep.push("milestones");
    if (hasMilestone('st', 3)) keep.push("challenges");
    if (hasMilestone('st', 3)) keep.push("milestones");
    if (hasAchievement('a', 293)) keep.push("milestones");
    // Stage 4, do the actual data reset
    layerDataReset(this.layer, keep);

    // Stage 5, add back in the specific subfeatures you saved earlier
    player[this.layer].upgrades.push(...keptUpgrades);
},
autoPrestige() {
    return hasAchievement("a", 235)
},
challenges: {
    11: {
            name: "Broken Idea",
            challengeDescription: "You can not gain any Lights, Prestige Points, Super-Points, Ultra-Points and Hyper-Points but Energy's Cost is much cheaper.",
            goalDescription: "1e24 Energy",
            rewardDescription: "Unlock a new sub-layer.",
            canComplete: function() {return player.e.points.gte("1e24")},
            unlocked() { return (hasMilestone('sa', 20)) },
    },
    12: {
        name: "Broken Eletricity",
        challengeDescription: "You can't gain Energy and Lights + Mega-Point gain is raised to ^0.2.",
        goalDescription: "1e12 Mega-Points",
        rewardDescription: "Unlock another sub-layer + 5x Energy, Light and MP.",
        canComplete: function() {return player.mp.points.gte("1e12")},
        unlocked() { return (hasMilestone('sa', 24)) },
},
},
resetsNothing() {return hasAchievement("a", 213)},
canBuyMax() { return hasMilestone("le", 5) },
    color: "purple",
    requires: new Decimal(1e10), // Can be a function that takes requirement increases into account
    resource: "Sacrifice Tier", // Name of prestige currency
    baseResource: "Mega-Points", // Name of resource prestige is based on
    baseAmount() {return player.mp.points}, // Get the current amount of baseResource
    branches: ["mp"],
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {if (hasUpgrade("rp", 12)) return new Decimal(1.5)
        else if (hasUpgrade("cp", 44)) return new Decimal("1.6")
    else if (hasUpgrade("le", 55)) return new Decimal("1.8")
    else return new Decimal(2)},        gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('e', 45)) mult = mult.div(upgradeEffect('e',45))
        if (inChallenge('dp', 11)) mult = mult.times(Infinity)
            if (inChallenge('rp', 11)) mult = mult.times(Infinity)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 5, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "C", description: "C: Reset for Sac", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return (hasChallenge("mp", 12) || player[this.layer].unlocked)},
})
