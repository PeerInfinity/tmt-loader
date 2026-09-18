
addLayer("US", {
    name: "Universal Shifts", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "US", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        points: new Decimal(0)
    }},
    color: "#AA66AA",
    requires: new Decimal(1000), // Can be a function that takes requirement increases into account
    resource: "Universal Shifts", // Name of prestige currency
    baseResource: "Quarks", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    canReset() {
    let x = player[this.layer].points;
    let cost = Decimal.eq(x, 0) ? new Decimal(1e6) : Decimal.mul(1000, Decimal.pow(10, Decimal.mul(3, Decimal.pow(1.35, Decimal.pow(1.35, Decimal.sub(x, 1))))));
    return player.points.gte(cost)
    },
    
    getResetGain() {
    if (!this.canReset()) return new Decimal(0);
    return new Decimal(1);
    },

    getNextAt() {
    let x = player[this.layer].points;
    return Decimal.eq(x, 0) ? new Decimal(1e6) : Decimal.mul(1000, Decimal.pow(10, Decimal.mul(3, Decimal.pow(1.35, Decimal.pow(1.35, Decimal.sub(x, 1))))));
    },

    prestigeButtonText() {
    return "Reset everything for 1 UNIVERSAL SHIFT<br>Next at:<br> " + format(this.getNextAt()) + " Quarks.";
    },

    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "u", description: "U: Reset for Universal Shift", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    onPrestige(gain) {
    if (player.SA) layerDataReset("SA");
    if (player.A) layerDataReset("A");
    if (player.D) layerDataReset("D");
    if (player.D) layerDataReset("M");
    if (player.D) layerDataReset("BB");
    
    setTimeout(() => {
        player.points = new Decimal(10);
    }, 0)
    },
    doReset(resettingLayer) {
    let keep = ["points", "upgrades", "milestones", "buyables"];
    if (layers[resettingLayer].row > this.row) {
        layerDataReset(this.layer, keep);
    }
    },
    layerShown(){return true
    },
    milestones: {
        0: {
            requirementDescription: "Universal Shift #1",
            effectDescription: "*2.5 Quarks.",
            done() {
                return player.US.points.gte(1) // The condition to earn it
            },
        },
        1: {
            requirementDescription: "Universal Shift #2",
            effectDescription: "*3 Quarks, and *2 Subatomic Particles",
            done() {
                return player.US.points.gte(2) // The condition to earn it
            },
            unlocked() {return hasMilestone('US', 0)}
        },
        2: {
            requirementDescription: "Universal Shift #3",
            effectDescription: "You can easily beat this, *2 Quarks.",
            done() {
                return player.US.points.gte(3) // The condition to earn it
            },
            unlocked() {return hasMilestone('US', 1)}
        },
        3: {
            requirementDescription: "Universal Shift #4",
            effectDescription: "*1.01 ^ 100 Quarks (*2.70).",
            done() {
                return player.US.points.gte(4) // The condition to earn it
            },
            unlocked() {return hasMilestone('US', 2)}
        },
        4: {
            requirementDescription: "Universal Shift #5",
            effectDescription: "Unlock Dimensions, an exponentially growing layer.",
            done() {
                return player.US.points.gte(5) // The condition to earn it
            },
            unlocked() {return hasMilestone('US', 3)}
        },
        5: {
            requirementDescription: "Universal Shift #6",
            effectDescription: "Fun Fact: the price will tetrationally grow!<br>Anyways, *1.01 Quarks (lol).",
            done() {
                return player.US.points.gte(6) // The condition to earn it
            },
            unlocked() {return hasMilestone('US', 4)}
        },
        6: {
            requirementDescription: "Universal Shift #7",
            effectDescription: "post-scaling III really brought this down :(<br>Anyways, *2 Subatomic Particles.",
            done() {
                return player.US.points.gte(7) // The condition to earn it
            },
            unlocked() {return hasMilestone('US', 5)}
        },
        7: {
            requirementDescription: "Universal Shift #8",
            effectDescription: "Unlock another Dimensions upgrade, and *2 Subatomic Particles.",
            done() {
                return player.US.points.gte(8) // The condition to earn it
            },
            unlocked() {return hasMilestone('US', 6)}
        },
        8: {
            requirementDescription: "Universal Shift #9",
            effectDescription: "You can't easily beat this, Unlock Atoms, and *10 Quarks.",
            done() {
                return player.US.points.gte(9) // The condition to earn it
            },
            unlocked() {return hasMilestone('US', 7)}
        },
        9: {
            requirementDescription: "Universal Shift #10",
            effectDescription: "Unlock Big Bang, and *10 Quarks -> Subatomic Particles.",
            done() {
                return player.US.points.gte(10) // The condition to earn it
            },
            unlocked() {return hasMilestone('US', 8)}
        },
        10: {
            requirementDescription: "Universal Shift #11",
            effectDescription: "Unlock Molecules (but in my science class it's compounds).",
            done() {
                return player.US.points.gte(11) // The condition to earn it
            },
            unlocked() {return hasMilestone('US', 9)}
        },
        11: {
            requirementDescription: "Universal Shift #12",
            effectDescription: "Unlock Challenges in Atoms and Molecules.",
            done() {
                return player.US.points.gte(12) // The condition to earn it
            },
            unlocked() {return hasMilestone('US', 9)}
        },
    },
    microtabs: {
    tabs: { // 'stuff' is the ID for this microtab group
        "Milestones": {
            content: ["milestones"]
        },
        "Info": {
            content: [
                ["column", [
            ["infobox", "quarks"]
        ]]]
        },
    }},
    infoboxes: {
        shift_start: {
            title: "READ ME 2",
            body() { return "hello! if you haven't read reed me, go do it in the SA node. Otherwise, resetting for a Universal Shift will reset EVERYTHING, but will give a bonus shown on the milestone related to the Universal Shift number. Some bonuses are stronger, others weaker, but it all depends on scaling if the majority of people want it stronger or weaker." },
        },
        quarks: {
            title: "Quarks",
            body() { return "Quarks are possibly (might be preons but those are hypothetical) the smallest thing. There are 6 types: Up Quarks, Down Quarks, Charm Quarks, Strange Quarks, Top Quarks, and Bottom Quarks. Up Quarks and Down Quarks are most important, because they make protons and neutrons." },
        },
    },
    tabFormat: [
    ["infobox", "shift_start"],
    "main-display",
    "prestige-button",
    "resource-display",
    "blank",
    ["microtabs", "tabs", { "border": "none" }], // This displays the 'stuff' group defined above
    ],

})

addLayer("SA", {
    name: "Subatomic Particles", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SA", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    branches: ["US"],
    color: "#8F0000",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Subatomic Particles", // Name of prestige currency
    baseResource: "Quarks", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    passiveGeneration() {
        let passive = new Decimal(0);
        if (hasMilestone('US', 4)) passive = passive.add(0.01);
        if (hasUpgrade('BB', 11)) passive = passive.add(0.09);
        if (hasUpgrade('BB', 12)) passive = passive.add(0.9);
        if (hasUpgrade('BB', 13)) passive = passive.add(9);
        return passive;
    },
    doReset(resettingLayer) {
        let keep = [];
    
        if (layers[resettingLayer].row > this.row) {
            if (hasMilestone("BB", 1)) {
                keep.push("upgrades");
                keep.push("milestones");
                keep.push("points");
        }
        
        layerDataReset(this.layer, keep);
    }
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('SA', 15)) mult = mult.times(2)
        if (hasUpgrade('SA', 23)) mult = mult.times(2)
        if (hasUpgrade('SA', 32)) mult = mult.times(upgradeEffect('SA', 32))

        if (hasUpgrade('A', 12)) mult = mult.times(3)
        if (hasUpgrade('A', 21)) mult = mult.times(upgradeEffect('A', 21))
        if (hasUpgrade('A', 22)) mult = mult.times(5)

        if (hasUpgrade('D', 21)) mult = mult.times(upgradeEffect('D', 21))

        if (hasMilestone('US', 1)) mult = mult.times(2)
        if (hasMilestone('US', 6)) mult = mult.times(2)
        if (hasMilestone('US', 9)) mult = mult.times(10)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        if (hasUpgrade('A', 23)) exp = exp.add(0.1)
        return exp
    },
    onPrestige(gain) {
    setTimeout(() => {
        player.points = new Decimal(0);
    }, 0);
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "s", description: "S: Reset for Subatomic Particles", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true

    },
    upgrades: {
        11: {
            title: "I don't think subatomic particles can dissapear...",
            description: "Start gaining Quarks.",
            cost: new Decimal(1),
        },
        12: {
            title: "If this was real it would have exploded.",
            description: "Triple your Quarks gain.",
            cost: new Decimal(2),
            unlocked() { return hasUpgrade('SA', 11) }, 
        },
        13: {
            title: "Subatomic Particles can't split sooooo ye.",
            description: "Subatomic Particles boost Quarks.",
            cost: new Decimal(5),
            effect() {
                return player[this.layer].points.add(1).pow(0.35)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() { return hasUpgrade('SA', 12) }, 
        },
        14: {
            title: "Antimatter dimensions but matter?",
            description: "Quarks boost themselves (somehow???).",
            cost: new Decimal(15),
            effect() {
                return player.points.add(1).pow(0.25)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() { return hasUpgrade('SA', 13) }, 
        },
        15: {
            title: "Might collapse the universe soon...",
            description: "Double your Subatomic Particle gain.",
            cost: new Decimal(30),
            unlocked() { return hasUpgrade('SA', 14) }, 
        },
        21: {
            title: "nvm it's still far away (post-scaling)",
        description: "Raise Quarks to the power of 1.1.",
            cost: new Decimal(100),
            unlocked() { return hasUpgrade('SA', 15) }, 
        },
        22: {
            title: "Protons, Neutrons, and Electrons",
            description: "Triple Quarks Gain.",
            cost: new Decimal(250),
            unlocked() { return hasUpgrade('SA', 21) }, 
        },
        23: {
            title: "nvm it's closer (post scaling II)",
            description: "Double Subatomic Particle Gain.",
            cost: new Decimal(350),
            unlocked() { return hasUpgrade('SA', 22) }, 
        },
        24: {
            title: "Up Quarks and Down Quarks and the 5 other types",
            description: "*7 Quarks Gain.",
            cost: new Decimal(1000),
            unlocked() { return hasUpgrade('SA', 23) }, 
        },
        25: {
            title: "i honestly don't know what to put here",
            description: "Quarks boost Quarks.",
            cost: new Decimal(10000),
            effect() {
                return player.points.add(1).pow(0.1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() { return hasUpgrade('SA', 24) }, 
        },
        31: {
            title: "We haven't been here in a while...",
            description: "Subatomic Particles boost Quarks, but in a different way?",
            cost: new Decimal("1e235"),
            effect() {
                return new Decimal(1.25).pow(player.SA.points.log(10))
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() { return hasUpgrade('SA', 25) && hasMilestone('BB', 2)}, 
        },
        32: {
            title: "mom im about to destroy the 12th universe",
            description: "Quarks boost Subatomic Particles.",
            cost: new Decimal("1e450"),
            effect() {
                return new Decimal(player.points).log(10).pow(10)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() { return hasUpgrade('SA', 31) && hasMilestone('BB', 2)}, 
        },
        33: {
            title: "[INSERT BIG ATOMIC BOMB COMING YOUR WAY HERE]",
            description: "Atoms boost Quarks.",
            cost: new Decimal("1e550"),
            effect() {
                return new Decimal(player.A.points).pow(1/10)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() { return hasUpgrade('SA', 32) && hasMilestone('BB', 2)}, 
        },
        34: {
            title: "this inflation is really doin its thing",
            description: "Molecules boost Quarks.",
            cost: new Decimal("1e700"),
            effect() {
                return new Decimal(player.M.points).log(1.1).pow(10)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() { return hasUpgrade('SA', 33) && hasMilestone('BB', 2)}, 
        },
    },
    microtabs: {
    tabs2: { // 'stuff' is the ID for this microtab group
        "Upgrades": {
            content: ["upgrades"]
        },
        "Info": {
            content: [
                ["column", [
            ["infobox", "subatomic_particles"],
            ["infobox", "leptons"]
        ]]
    ]
        }
    }
    },
    tabFormat: [
    ["infobox", "start"],
    "main-display",
    "prestige-button",
    "resource-display",
    "blank",
    ["microtabs", "tabs2", { "border": "none" }], // This displays the 'stuff' group defined above
    ],
    infoboxes: {
        start: {
            title: "REED ME",
            body() { return "Hi! This is my upgrade tree that i'm finally making, the only reason is because i'm a nerd and want to play and make things. Anyways, i beat the Prestige Tree today, and in science, the unit is Atoms and other things, so yea." },
        },
        subatomic_particles: {
            title: "Subatomic Particles",
            body() { return "Subatomic Particles are made up from quarks (except electrons), so the quarks combine to make more subatomic particles. There are 3 types: Protons, Neutrons, and Electrons. Protons are made from 2 Up Quarks and 1 Down Quark, and Neutrons are made from 1 Up Quark and 2 Down Quarks. Electrons aren't made of any Quarks; they are Leptons, which are Elementary Particles (can not be divided into smaller particles).<br><br>The charges of each Subatomic Particle is shown below:<br>- Protons; Positively charged<br>- Neutrons; No charge<br>- Electrons; Negatively charged<br><br>There are actually a lot more Subatomic Particles, but the information will be unlocked later in this incremental game. Also, please note that I am not a total nerd in science so expect some mistakes; I just learned these information." },
        },
        leptons: {
            title: "Leptons",
            body() { return "Leptons are the other type of Elementary Particles. There are 6 types: Electrons, Muons, Taus, and their negative versions. As you can see, Electrons are not made of quarks, but is a Lepton.<br><br>Now, what are Leptons used for?" },
        },
    }
})

addLayer("D", {
    name: "Dimensions", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    branches: ["US"],
    color: "#FFFFFF",
    requires: new Decimal(1e9), // Can be a function that takes requirement increases into account
    resource: "Dimensions", // Name of prestige currency
    baseResource: "Quarks", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    doReset(resettingLayer) {
        let keep = [];
    
        if (layers[resettingLayer].row > this.row) {
            if (hasMilestone("BB", 1)) {
                keep.push("upgrades");
                keep.push("milestones");
                keep.push("points");
        }
        
        layerDataReset(this.layer, keep);
    }
    },
    canReset() {
    return player.points.gte(this.getNextAt());
    },
    
    getResetGain() {
    if (!this.canReset()) return new Decimal(0);
    return new Decimal(1);
    },

    getNextAt() {
    // This shows the requirement for the next prestige level in the UI
    let x = player["D"].points;
    let cost = Decimal.mul(1e6, Decimal.pow(1000, Decimal.pow(1.7, x)))

    // Apply the divisor here (e.g., divide by 2)
    let reduct = new Decimal(1)

    if (hasUpgrade('M', 11)) reduct = reduct.mul(upgradeEffect('M', 11))
    if (hasUpgrade('M', 13)) reduct = reduct.mul(upgradeEffect('M', 13))

    return cost.div(reduct)
    },

    prestigeButtonText() {
    return "Reset for a dimension<br>Next at:<br> " + format(this.getNextAt()) + " Quarks.";
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('M', 11)) mult = mult.div(upgradeEffect('M', 11))
        if (hasUpgrade('M', 13)) mult = mult.div(upgradeEffect('M', 13))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "d", description: "D: Reset for Dimensions", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
        return hasMilestone("US", 4)
    },
    upgrades: {
        11: {
        title: "Dimneal sacifce",
        description: "Dimensions boosts Quarks.",
        cost: new Decimal(1),
        effect() {
        let base = new Decimal(2)
        if (hasUpgrade("D", 12)) base = base.times(upgradeEffect("D", 12))
        if (hasUpgrade("D", 13)) base = base.times(upgradeEffect("D", 13))
        if (hasUpgrade("D", 14)) base = base.times(upgradeEffect("D", 14))
        return base.pow(player[this.layer].points)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect 
        },
        12: {
        title: "<- was literally just a booster",
        description: "Quarks boost Dimneal sacifce.",
        cost: new Decimal(2),
        effect() {
            return player.points.max(1).log(10).div(2).add(1)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect 
        unlocked() {return hasMilestone('US', 4) && hasUpgrade('D', 11)}
        },
        13: {
        title: "Is this really the gimmick?",
        description: "Subatomic Particles boost Dimneal sacifce.",
        cost: new Decimal(4),
        effect() {
            return player.SA.points.max(1).log(10).div(2).add(1)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect 
        unlocked() {return hasMilestone('US', 7) && hasUpgrade('D', 12)},
        },
        14: {
        title: "yes it is",
        description: "Dimensions boost Dimneal sacifce.",
        cost: new Decimal(7),
        effect() {
            return new Decimal(1.35).pow(1.2).pow(player.D.points)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect 
        unlocked() {return hasMilestone('BB', 0) && hasUpgrade('D', 13)},
        },
        21: {
        title: "Dimneal bos",
        description: "Dimensions boosts Subatomic Particles.",
        cost: new Decimal(5),
        effect() {
        let base = new Decimal(1.5)
        if (hasUpgrade("D", 22)) base = base.times(upgradeEffect("D", 22))
        if (hasUpgrade("D", 23)) base = base.times(upgradeEffect("D", 23))
        if (hasUpgrade("D", 24)) base = base.times(upgradeEffect("D", 24))
        return base.pow(player[this.layer].points)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect 
        unlocked() {return hasMilestone('BB', 0) && hasUpgrade('D', 13)},
        },
        22: {
        title: "i love matter dimensions",
        description: "Subatomic Particles boosts Dimneal bos.",
        cost: new Decimal(6),
        effect() {
            return player.SA.points.max(1).log(100).pow(0.65).add(1)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect 
        unlocked() {return hasMilestone('BB', 0) && hasUpgrade('D', 21)},
        },
        23: {
        title: "SEASONAL SHIFT FROM TPOT???",
        description: "Atoms boosts Dimneal bos.",
        cost: new Decimal(7),
        effect() {
            return player.A.points.max(1).log(50).pow(0.65).add(1)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect 
        unlocked() {return hasMilestone('BB', 0) && hasUpgrade('D', 22)},
        },
        24: {
        title: "no",
        description: "Dimneal sacifce boosts Dimneal bos.",
        cost: new Decimal(8),
        effect() {
            return upgradeEffect('D', 11).max(1).pow(0.05).log(1.5).add(1)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect 
        unlocked() {return hasMilestone('BB', 0) && hasUpgrade('D', 23)},
        },
    }
})

addLayer("A", {
    name: "Atoms", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    branches: ["SA"],
    color: "#FF0000",
    requires: new Decimal(1e27), // Can be a function that takes requirement increases into account
    resource: "Atoms", // Name of prestige currency
    baseResource: "Subatomic Particles", // Name of resource prestige is based on
    baseAmount() {return player.SA.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.33, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "a", description: "A: Reset for Atoms", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    upgrades: {
    11: {
    title: "YIPPE ATOMIC ATOMS",
    description: "*5 Quarks, and *1 Subatomic Particles.",
    cost: new Decimal(1),
    },
    12: {
    title: "Atoms can't split, it causes a bomb!",
    description: "*3 Quarks and Subatomic Particles.",
    cost: new Decimal(2),
    unlocked() {return hasUpgrade('A', 11)},
    },
    13: {
    title: "these upgrades are so weak",
    description: "Quarks boost Quarks.",
    cost: new Decimal(4),
    effect() {
        return player.points.add(1).pow(0.1)
    },
    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
    unlocked() {return hasUpgrade('A', 12)},
    },
    21: {
    title: "Who's here after Universal Shift #9?",
    description: "Atoms boost Quarks and Subatomic Particles.",
    cost: new Decimal(20000),
    effect() {
        return player.A.points.add(1).pow(0.2)
    },
    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
    unlocked() {return hasMilestone('US', 7) && hasUpgrade('A', 13)},
    },
    22: {
    title: "Who's here after Universal Shift #10?",
    description: "*10 Quarks and *5 Subatomic Particles.",
    cost: new Decimal(20000000),
    unlocked() {return hasMilestone('US', 7) && hasUpgrade('A', 21)},
    },
    23: {
    title: "Who's here after Universal Shif wait i used this already",
    description: "Raise Subatomic Particle gain by 0.1.",
    cost: new Decimal(1e11),
    unlocked() {return hasMilestone('US', 7) && hasUpgrade('A', 22)},
    },
},
    layerShown(){
        return hasMilestone("US", 8);
    },
})

addLayer("BB", {
    name: "Big Bang", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "BB", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    branches: ["SA", "D"],
    color: "#A9A9A9",
    requires: new Decimal(1e130), // Can be a function that takes requirement increases into account
    resource: "Big Bangs", // Name of prestige currency
    baseResource: "Quarks", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have

    getResetGain() {
    if (player.points.lt("1e130")) return new Decimal(0);
    let gain = Decimal.log(player.points.log10().minus(119.2).div(6), 1.8).plus(0.0000000001).floor();

    if (gain.lte(player[this.layer].points)) return new Decimal(0);
    return gain.sub(player[this.layer].points);
    },

    getNextAt(canMax) {
    let x = player[this.layer].points.add(tmp[this.layer].getResetGain).add(1);
    return Decimal.pow(10, Decimal.pow(1.8, x).mul(6).add(119.2));
    },

    canReset() {
    return tmp[this.layer].getResetGain.gte(1);
    },


    prestigeButtonText() {
    let gain = tmp[this.layer].getResetGain;
    let next = tmp[this.layer].getNextAt;

    if (!canReset(this.layer)) {
        return "Next at: " + format(next) + " Quarks.";
    }
    
    return "Reset for " + formatWhole(gain) + " Big Bangs<br>Next at: " + format(next) + " Quarks.";
    },

    canBuyMax() {return hasMilestone('BB', 1)},

    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "b", description: "B: Reset for Big Bang", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
        return hasMilestone("US", 9)
    },
    milestones: {
        0: {
            requirementDescription: "1 Big Bang",
            effectDescription: "Unlocks 5 more Dimension upgrades. You can automatically buy max this layer btw",
            done() {
                return player.BB.points.gte(1) // The condition to earn it
            },
        },
        1: {
            requirementDescription: "3 Big Bangs",
            effectDescription: "Subatomic Particles and Dimensions no longer reset Quarks.",
            done() {
                return player.BB.points.gte(3) // The condition to earn it
            },
        },
        2: {
            requirementDescription: "5 Big Bangs",
            effectDescription: "Unlocks 4 more Subatomic Particle upgrades.",
            done() {
                return player.BB.points.gte(5) // The condition to earn it
            },
            unlocked() {return hasMilestone('BB', 0)}
        },
    },
    upgrades: {
        11: {
            title: "kaboom",
            description: "+9% to your Subatomic Particle gain per second.",
            cost: new Decimal(1)
        },
        12: {
            title: "it is what is is",
            description: "+90% to your Subatomic Particle gain per second.",
            cost: new Decimal(2),
            unlocked() {return hasUpgrade('BB', 11)}
        },
        13: {
            title: "i guess this is a repeatable upgrade?",
            description: "+900% to your Subatomic Particle gain per second.",
            cost: new Decimal(3),
            unlocked() {return hasUpgrade('BB', 12)}
        },
    },
    microtabs: {
    tabs: { // 'stuff' is the ID for this microtab group
        "Milestones": {
            content: ["milestones"]
        },
        "Upgrades": {
            content: ["upgrades"]
        },
    }
    },
    tabFormat: [
    "main-display",
    "prestige-button",
    "resource-display",
    "blank",
    ["microtabs", "tabs", { "border": "none" }], // This displays the 'stuff' group defined above
    ],
})

addLayer("M", {
    name: "Molecules", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    branches: ["A"],
    color: "#FF8888",
    requires: new Decimal(1e65), // Can be a function that takes requirement increases into account
    resource: "Molecules", // Name of prestige currency
    baseResource: "Atoms", // Name of resource prestige is based on
    baseAmount() {return player.A.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.25, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Reset for Molecules", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    upgrades: {
        11: {
        title: "we're only at molecules?",
        description: "Dimensions are cheaper and Quarks get boosted based on your Big Bangs.",
        cost: new Decimal(1),
        effect() {
            return new Decimal(12.5).pow(3).pow(player.BB.points)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect 
        },
        12: {
        title: "guess it's not that bad",
        description: "Molecules boost Quarks.",
        cost: new Decimal(100),
        effect() {
            return new Decimal(1.5).pow(player.M.points.max(10).log(10).pow(10)).log(10).max(1)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect 
        unlocked() {return hasUpgrade('M', 11)}
        },
        13: {
        title: "HOLY INFLATION???",
        description: "Dimensions are cheaper based on your molecules.",
        cost: new Decimal(1e30),
        effect() {
            return new Decimal(player.M.points.max(1)).log(10).pow(100).log(2).pow(50).max(1)
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect 
        unlocked() {return hasUpgrade('M', 12)}
        },
    },
    layerShown() {return hasMilestone('US', 10)}
})

