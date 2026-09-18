addLayer("de", {
    name: "deterioration", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "DE", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        setupWorth: new Decimal(0),
        worth: new Decimal(0),
        ruining: false,
        setupGoal: "10",
        goal: new Decimal(10),
        setupDisabled: "1",
        disabled: new Decimal(1),
    }},
    color: "#8A877E",
    nodeStyle() {return {
        "background": (player.de.unlocked || player.si.eternity.gte(1000) && player.dm.points.add(player.dm.buyableSpent).gte(1.5e6))?"radial-gradient(#8A877E, #8800)":"#bf8f8f" ,
    }},
    branches: ['d', 'u'],
    requires: new Decimal(10),
    resource: "ruins", // Name of prestige currency
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    row: 5, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},

    effectDescription() { 
        return "with the current setup giving "+format(player.de.setupWorth)+" ruins."
    },

    tooltipLocked() {return "Reach 1,500,000 total dark matter to unlock (You have "+format(player.dm.points.add(player.dm.buyableSpent))+" total dark matter"},
    tooltip() {return "Deterioration"},

    doReset(resettingLayer) {
		let keep = [];
		if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep);
	},

    update() {
        if (player.dm.points.add(player.dm.buyableSpent).gte(1.5e6)) player.de.unlocked = true

        if (new Decimal(player.de.setupGoal).gte(16)) {
            reset = 1
            if (player.de.setupReset) reset = 3
            player.de.setupWorth = Decimal.pow(2, new Decimal(player.de.setupGoal).sub(15).times(new Decimal(player.de.setupDisabled)).pow(new Decimal(player.de.setupDisabled).div(4).add(1)).pow(reset))
        } else {
            player.de.setupWorth = decimalZero
        }

        if (player.de.ruining) player.d.dilating = true
    },

    tabFormat: {
        "Main": {
            content: [
                ["display-text",
                    function() { return '<b>Deterioration</b>' }, {"font-size": "32px", "color": "#8A877E"}
                ], "blank",
                "milestones"
            ],
        },
        "Ruins": {
            content: [
                "main-display", "blank",
                "buyables", "blank",
                //Goal
                ["display-text", function() {
                    return "Universe Goal: "+player.de.setupGoal
                }],  ["slider", ["setupGoal", 16, 50]], ["text-input", "setupGoal"], "blank", "blank",
                //Disables
                ["display-text", function() {
                    desc = "Machines"
                    if (new Decimal(player.de.setupDisabled).gte(2)) desc = "Machines and Generator"
                    if (new Decimal(player.de.setupDisabled).gte(3)) desc = "Machines, Generator and Black Hole"
                    if (new Decimal(player.de.setupDisabled).gte(4)) desc = "Machines, Generator, Black Hole and Star Fragment"
                    return "Feature Disabled: "+desc
                } ],  ["slider", ["setupDisabled", 1, 4]], "blank", "blank",
            ],
        },
    },

    milestones: {
        0: {
            requirementDescription: "1,500,000 total dark matter",
            effectDescription: "Anions star fragment nerf is much worse.",
            done() { return player.dm.points.add(player.dm.buyableSpent).gte(1.5e6) },
        },
    },

    buyables: {
        11: {
            cost(x) { 
                return decimalZero
            },
            display() {
                if (!player.de.ruining) title = "<b>RUIN THE UNIVERSE</b>"
                else {
                    if (player.u.points.add(player.u.buyableSpent).gte(player.de.goal)) title = "<b>FIX THE UNIVERSE<br>(Goal Reached)</b>"
                    else title = "<b>FIX THE UNIVERSE<br>(Goal NOT Reached)</b>"
                }

                earn = ""
                if (player.de.ruining) earn = "<br><br>Gaining "+format(player.de.worth)+" ruins after reaching the goal of "+format(player.de.goal)+" universes."

                return title+earn+"<br><br>(Doing so will force ascending to eternity without rewards and enter dilation)"
            },
            canAfford() { return true },
            buy() {
                if (!player.de.ruining) {
                    player.de.worth = player.de.setupWorth
                    player.de.goal = new Decimal(player.de.setupGoal)
                    player.de.disabled = new Decimal(player.de.setupDisabled)
                } else {
                    if (player.u.points.add(player.u.buyableSpent).gte(player.de.goal)) {
                        player.de.points = player.de.points.add(player.de.worth)
                    }

                    player.de.worth = decimalZero
                    player.de.goal = decimalZero
                }

                doReset('si')
                player.si.points = decimalZero
                player.si.layer = decimalZero
                player.si.layerGain = decimalZero

                player.de.ruining = !player.de.ruining
            },
        },
    }
})