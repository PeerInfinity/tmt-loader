unlockMachine = 0

addLayer("m", {
    name: "machines", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#BBBBBB",
    branches: ['n'],
    requires: new Decimal("1.79e308"),
    resource: "machines", // Name of prestige currency
    baseResource: "number",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.points },  // A function to return the current amount of baseResource.
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 10,
    directMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('i', 32)) mult = mult.times(upgradeEffect('i', 32))
        if (player.v.pointsTest >= 1) mult = mult.times(Decimal.min((Decimal.pow(10, Decimal.pow(1.1, player.v.points))).times(player.v.pointsTest).add(new Decimal(1).sub(player.v.pointsTest)), 1e300))
        if (hasUpgrade('sf', 24)) mult = mult.times(7)
        if (inChallenge('bl', 12)) mult = Decimal.log2(Decimal.log10(player.i.time.add(10)).add(2))
        if (player.d.dilating) mult = decimalOne
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return unlockMachine = 1},

    update() {
        if (player.points >= new Decimal("1e320")) {
            unlockMachine = 1
        }

        if (hasUpgrade('sf', 15) && hasUpgrade('sf', 25) && hasUpgrade('sf', 35) && hasUpgrade('sf', 45) && hasUpgrade('sf', 55)) {
            player.m.points = player.m.points.add(Decimal.log10(player.sf.points.add(10)).div(10))
        }
    },

    doReset(resettingLayer) {
        
		let keep = [];
        if (hasMilestone('v', 1) && resettingLayer == 'v') keep.push("upgrades");
        if (hasMilestone('bl', 0)) keep.push("upgrades");
		if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep);
	},

    hotkeys: [
        {key: "m", description: "M: Reset for machines", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    tabFormat: [
        "main-display",
        "prestige-button", "blank",
        ["display-text",
            function() { return 'You have '+format(player.points)+" number" }
        ], "blank",
        ["toggle", ["m", "auto"]],
        ["display-text",
            function() { return '(Buy the Automated Machines upgrade to unlock the auto-buyer toggle above)' }
        ], "blank",
        "upgrades"
    ],

    upgrades: {
        11: {
            title: "Disintegrated Barrier",
            description: "Each machine increase infinity boost limit by x1.2. (There is a max)",
            cost: new Decimal(4),
            effect() {
                if (hasUpgrade('m', 11)) return Decimal.min(Decimal.pow(1.2, player.m.points), new Decimal(10).times(Decimal.pow(new Decimal(1.5).times(getBuyableAmount('e', 11).div(4).add(1)), getBuyableAmount('v', 21).add(1))))
                else return 1
            },
        },
        12: {
            title: "Unaffected Number",
            description: "Machines reset nothing.",
            cost: new Decimal(1),
        },
        13: {
            title: "Automated Machines",
            description: "Unlock auto-machines.",
            cost: new Decimal(20),
        },
    },

    resetsNothing() { return hasUpgrade("m", 12) },
    autoPrestige() { return (player.m.auto && hasUpgrade("m", 13)) },
    deactivated() {return inChallenge('bl', 11) || player.de.ruining}
})
