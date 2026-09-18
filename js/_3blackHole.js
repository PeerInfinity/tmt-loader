let unlockedBlack = 0;

addLayer("bl", {
    name: "black hole", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "BL", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#E66B00",
    branches: ['i'],
    requires: new Decimal("1e2500"),
    resource: "black hole", // Name of prestige currency
    baseResource: "infinity",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.i.points },  // A function to return the current amount of baseResource.
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 21.4,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return unlockedBlack = 1},

    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button", "blank",
                ["display-text",
                    function() { return 'You have '+format(player.i.points)+" infinity" }
                ], "blank", 
                ["toggle", ["bl", "auto"]],
                ["display-text",
                    function() { return '(Get the 2nd milestone to unlock the auto-buyer toggle above)' }
                ], "blank",
                "milestones", "blank", "upgrades"
            ]
        },
        "Black Holes": {
            content: [
                "main-display",
                ["display-text",
                    function() { return '<b>Black Holes</b>' }, {"font-size": "32px", "color": "#E66B00"}
                ], "blank",
                "challenges", "blank",
            ],
        },
    },

    effectDescription() {
        return "which are unlocking a new challange each after the 1st black hole (Unlocked "+Decimal.min(Decimal.max(player.bl.points.sub(1), 0), 3)+"/3 challenges)"
    },

    update() {
        if (getBuyableAmount('v', 22) > 0) {
            unlockedBlack = 1;
        }

        if (hasUpgrade('si', 12) && !player.bl.points.gte(1000)) player.bl.points = new Decimal(1001)
    },

    doReset(resettingLayer) {
		let keep = [];
        if (hasUpgrade('sf', 53)) keep.push("milestones");
        if (hasMilestone('u', 1)) keep.push("milestones");
        if (hasMilestone('sf', 1) && resettingLayer == 'sf') keep.push("challenges");
        if (hasMilestone('sf', 2) && resettingLayer == 'sf') keep.push("upgrades");
        if (hasMilestone('g', 1)) keep.push("challenges");
        if (hasMilestone('g', 1)) keep.push("upgrades");
		if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep);
	},
    
    hotkeys: [
        {key: "b", description: "B: Reset for black holes", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    milestones: {
        0: {
            requirementDescription: "3 black holes",
            effectDescription: "Keep machine upgrades on all resets.",
            done() { return player.bl.points.gte(3) || hasUpgrade('sf', 42) || hasMilestone('u', 1) }
        },
        1: {
            requirementDescription: "7 black holes",
            effectDescription: "Unlock auto-black hole.",
            done() { return player.bl.points.gte(7) || hasUpgrade('sf', 42) || hasMilestone('u', 1) }
        },
        2: {
            requirementDescription: "8 black holes",
            effectDescription: "Black Hole resets nothing.",
            done() { return (player.bl.points.gte(8) && hasChallenge('bl', 21)) || hasUpgrade('sf', 42) || hasMilestone('u', 1) },
            unlocked() {return hasChallenge('bl', 21)}
        },
    },

    upgrades: {
        11: {
            title: "Time Warping",
            description: "Black Hole boosts Time gain. (Limit ^10)",
            cost: new Decimal(7),
        },
    },

    challenges: {
        11: {
            name: "Stone Age",
            canComplete: function() {return player.i.points.gte(new Decimal("1e2000"))},
            unlocked() {return player.bl.points > 1},
            fullDisplay() {return "Machines Upgrades are useless and 3rd row Infinity Upgrades are locked.<br>Goal: 1.00e2000 infinity<br>Reward: Velocity Buyable 1 scales slower."},
        },
        12: {
            name: "Buff Resistant",
            canComplete: function() {return player.m.points.gte(new Decimal(100))},
            unlocked() {return player.bl.points > 2},
            fullDisplay() {return "Infinity and Machine multiplier always stays at 1, but Time gives Machine a small boost.<br>Goal: 100.00 machines<br>Reward: Access to unlock 3rd Black Hole Challenge."},
        },
        21: {
            name: "Broken Switch",
            canComplete: function() {return player.i.points.gte(new Decimal(1e10))},
            unlocked() {return player.bl.points > 3 && hasChallenge('bl', 12)},
            fullDisplay() {return "You can't turn Infinity Automation off.<br>Goal: 1.00e10 infinity<br>Reward: Unlock Energy 2nd buyable, and ability to unlock Black Hole 3rd milestone."},
        },
    },

    autoPrestige() { return (player.bl.auto && hasMilestone("bl", 1)) },
    resetsNothing() { return hasMilestone("bl", 2) },
    deactivated() {return player.de.ruining && player.de.disabled.gte(3)}
})