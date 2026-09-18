// Hypno Dancefloor - Layer 1
addLayer("h", {
    name: "Hypno Dancefloor", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "HD", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Hypno Power", // Name of prestige currency
    baseResource: "Hypnotic Energy", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "h", description: "H: Reset for Hypno Power", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
	upgrades: {
		11: {
			title: "Start the music!",
			description: "Start generating Hypnotic Energy.",
			cost: new Decimal(1),
        },
	},
})

/*
// Bar - Layer 2
addLayer("b", {
    name: "Bar", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Bartenders", // Name of prestige currency
    baseResource: "Hypno Power", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "b", description: "B: Reset to hire Bartenders", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
	branches: ["h"],
})
*/

/*
// DJ Booth - Layer 2
addLayer("d", {
    name: "DJ Booth", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "DJ", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "DJs", // Name of prestige currency
    baseResource: "Hypno Power", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "d", description: "D: Reset to hire DJs", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
	branches: ["h"],
})
*/

/*
// Cocktail Bar - Layer 3
addLayer("c", {
    name: "Cocktail Bar", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Cocktails", // Name of prestige currency
    baseResource: "Bartenders", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Reset to make new Cocktails", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
	branches: ["b"],
})
*/

/*
// Dance Pets - Layer 3
addLayer("p", {
    name: "Dance Pets", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "DP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Dance Pets", // Name of prestige currency
    baseResource: "Hypno Power", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset to attract Dance Pets", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
	branches: ["b", "d"],
})
*/

/*
// Hypno-Disk Station (originally Soundtracks) - Layer 3
addLayer("s", {
    name: "Hypno-Disk Station", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "H-DS", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Hypno-Disks", // Name of prestige currency
    baseResource: "DJs", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "s", description: "S: Reset to generate Hypno-Disks", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
	branches: ["d"],
})
*/

/*
// Backrooms - Layer 4
addLayer("r", {
    name: "Backrooms", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "BR", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Private Rooms", // Name of prestige currency
    baseResource: "Hypnotic Energy", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "r", description: "R: Reset to build Private Rooms", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
	branches: ["c", "p"],
})
*/

/*
// Backstage - Layer 4
addLayer("k", {
    name: "Backstage", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "BS", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
		best: new Decimal(0),
		total: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Fans", // Name of prestige currency
    baseResource: "Hypnotic Energy", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "f", description: "F: Reset to attract Fans", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
	branches: ["s"],
})
*/

/*
// Mistress Perks - Layer 5
addLayer("m", {
    name: "Mistress Pheromosa's Perks", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "MP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
		total: new Decimal(0),
		extrapoints: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Perk Points", // Name of prestige currency
    baseResource: "Hypnotic Energy", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Reset to convert HE into Perk Points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
	branches: ["r", "k"],
	// getResetGain() {
		// baseline = new Decimal(1) // The base value for the upgrades
		// broughtPerks = new Decimal(0) // Gets how many Perk Points have been brought (not gained through other means)
		// baseCost // Multiply baseline by 10^broughtPerks to get the base cost
		// pointsToGive // Get player.points, and see how many OoM above baseCost it is. If it's below baseCost, this becomes 0, otherwise for each OoM above baseCost it is, add 1 to this (starting with 1)
		// return pointsToGive
	// }
})
*/

// Achievments - Side Layer
addLayer("a", {
	startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    color: "yellow",
    row: "side",
    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("Achievements")
    },
    achievementPopups: true,
    name: "Achievments", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the l
    resource: "Achievement Power", // Name of prestige currency
    layerShown(){return true},
	tooltip() { // Optional, tooltip displays when the layer is locked
        return ("Achievements")
    },
	achievements: {
		11: {
			name: "Start the music, DJ Meowstic!",
			done() {return (hasUpgrade('h', 11))},
			tooltip: "Begin generating Hypnotic Energy\nGratns 100 AP",
			onComplete() {
				player[this.layer].points = player[this.layer].points.add(100)
			},
		},
	},
	milestones: {
		0: {
			requirementDescription: "100 Achievement Power",
			effectDescription: "Hypnotic Energy Generation at 100%",
			done() { return player[this.layer].points.gte(100) }
		},
		1: {
			requirementDescription: "250 Achievement Power",
			effectDescription: "Hypnotic Energy Generation at 400%",
			done() { return player[this.layer].points.gte(250) },
			unlocked() { return hasMilestone("a", 0) }
		},
		2: {
			requirementDescription: "500 Achievement Power",
			effectDescription: "Hypnotic Energy Generation at 3,600%",
			done() { return player[this.layer].points.gte(500) },
			unlocked() { return hasMilestone("a", 1) }
		},
		3: {
			requirementDescription: "750 Achievement Power",
			effectDescription: "Hypnotic Energy Generation at 57,600%",
			done() { return player[this.layer].points.gte(750) },
			unlocked() { return hasMilestone("a", 2) }
		},
		4: {
			requirementDescription: "1000 Achievement Power",
			effectDescription: "Hypnotic Energy Generation at 1,440,000%",
			done() { return player[this.layer].points.gte(1000) },
			unlocked() { return hasMilestone("a", 3) }
		},
		5: {
			requirementDescription: "1500 Achievement Power",
			effectDescription: "Hypnotic Energy Generation at 51,840,000%",
			done() { return player[this.layer].points.gte(1500) },
			unlocked() { return hasMilestone("a", 4) }
		},
		6: {
			requirementDescription: "2000 Achievement Power",
			effectDescription: "Hypnotic Energy Generation at ~2.5e9%",
			done() { return player[this.layer].points.gte(2000) },
			unlocked() { return hasMilestone("a", 5) }
		},
		7: {
			requirementDescription: "2500 Achievement Power",
			effectDescription: "Hypnotic Energy Generation at ~1.6e11%",
			done() { return player[this.layer].points.gte(2500) },
			unlocked() { return hasMilestone("a", 6) }
		},
		8: {
			requirementDescription: "3500 Achievement Power",
			effectDescription: "Hypnotic Energy Generation at ~1.3e13%",
			done() { return player[this.layer].points.gte(3500) },
			unlocked() { return hasMilestone("a", 7) }
		},
		9: {
			requirementDescription: "5000 Achievement Power",
			effectDescription: "Hypnotic Energy Generation at ~1.3e15%",
			done() { return player[this.layer].points.gte(5000) },
			unlocked() { return hasMilestone("a", 8) }
		},
		10: {
			requirementDescription: "10,000 Achievement Power",
			effectDescription: "Hypnotic Energy Generation at ~1.3e18%",
			done() { return player[this.layer].points.gte(10000) },
			unlocked() { return hasMilestone("a", 9) }
		},
	}
})

