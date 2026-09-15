// WIP
addLayer("a", {
    achievements: {
        11: {
            name: "Training",
            tooltip: "Begin your training by earning grams.",
            done() { return player.w.points.gte(1) }
        },
        12: {
            name: "Human",
            tooltip: "Weigh 50kG.",
            done() { return player.points.gte(5e4) }
        },
        13: {
            name: "Elephant",
            tooltip: "Weigh 1 Tonne.",
            done() { return player.points.gte(1e6) }
        },
        14: {
            name: "Fr**, i overloaded!",
            tooltip: "Overweight.",
            done() { return player.o.points.gte(1) }
        },
        15: {
            name: "200% weight-safety",
            tooltip: "Buy a upgrade that gets you some boost by overweights.",
            done() { return hasUpgrade("o", 12) }
        },
        21: {
            name: "Extension",
            tooltip: "Buy a upgrade that gets you more upgrades, and milestones to your weight layer.",
            image: "https://cdn.discordapp.com/attachments/762072248697749544/934423637174419466/extension.png",
            done() { return hasUpgrade("o", 13) }
        },
        22: {
            name: "Humanity Human Humos",
            tooltip: "Weigh 50kG, cubed.",
            done() { return player.points.gte(1.25e17) }
        },
        23: {
            name: "Mountain Everest",
            tooltip: "Be as Mountain Everest.",
            image: "https://cdn.discordapp.com/attachments/762071767346839573/933773793791459419/The.jpg",
            done() { return player.points.gte(1.619e20) }
        },
        24: {
            name: "Compare?",
            tooltip: "Compare with yourself.",
            done() { return player.c.points.gte(1) },
        },
        25: {
            name: "Earth",
            tooltip: "You know what to do, right?",
            image: "https://cdn.discordapp.com/attachments/762071767346839573/933773794126999693/Earth.jpg",
            done() { return player.points.gte(5.972e27) }
        },
        31: {
            name: "Compressed",
            tooltip: "Get 1e18 Weights.",
            done() { return player.w.points.gte(1e18) }
        },
        32: {
            name: "Hollow Mountain",
            tooltip: "Beat Mountaintop Challenge.",
            done() { return (hasChallenge('c', 11)) },
        },
        33: {
            name: "Triangle",
            tooltip: "Beat Mountain Evertop Challenge.",
            done() { return (hasChallenge('c', 12)) },
        },
        34: {
            name: "Kirby, NO!!!",
            tooltip: "Get 1 Tonne worth of grams in the Shattered Challenge.",
            done() { return player.points.gte(1e6) && inChallenge('c', 41) }
        },
        35: {
            name: "The Universe.",
            tooltip: "X91MC W31GH UNI5.",
            done() { return player.points.gte(1.5e56) }
        },
        41: {
            name: "The TRUE Universe.",
            tooltip: "Reset universally..",
            done() { return player.u.points.gte(1) }
        },
        42: {
            name: "The Answer to Life and Universe",
            tooltip: "Get the 1st Universal Milestone",
            image: "https://cdn.discordapp.com/attachments/762072132296769586/934394100340359248/answer42.png",
            done() { return (hasMilestone('u', 1)) }
        },
        43: {
            name: "The Answer to Everything",
            tooltip: "Get 4.2e42 Comparisons.",
            image: "https://cdn.discordapp.com/attachments/762072132296769586/934394485427798016/question42.png",
            done() { return player.c.points.gte(4.2e42) }
        },
        44: {
            name: "Centillion",
            tooltip: "Get to 100-illion number.",
            image: "https://cdn.discordapp.com/attachments/762072132296769586/934414192465838080/Centillion.png",
            done() { return player.points.gte("e303") }
        },
        45: {
            name: "Iron Stars",
            tooltip: "Get to 500-illion number..",
            image: "https://cdn.discordapp.com/attachments/762072132296769586/934472135957696602/ironstar.png",
            done() { return player.points.gte("e1500") }
        },
        51: {
            name: "Dozenal Singularity",
            tooltip: "Get 12 Singularity.",
            image: "https://cdn.discordapp.com/attachments/762036407719428099/934723150485262377/Blackholedozenal.png",
            done() { return player.s.points.gte(12) }
        },
        52: {
            name: "Addex Upgradies",
            tooltip: "Get Universe Upgrade 13.",
            image: "https://cdn.discordapp.com/attachments/762036407719428099/934723150485262377/Blackholedozenal.png",
            done() { return hasUpgrade("u", 13) }
        },
        53: {
            name: "The Backrooms",
            tooltip: "Time Travel.",
            image: "https://cdn.discordapp.com/attachments/762036407719428099/935193681013665872/Backrooms.png",
            done() { return player.tt.points.gte(1) }
        },
        54: {
            name: "The Short Break",
            tooltip: "Get 300 seconds, worth a short break.",
            image: "",
            done() { return player.t.points.gte(300) }
        },
        55: {
            name: "No...",
            tooltip: "Get 3600 seconds, worth 1 cycle of school.",
            image: "",
            done() { return player.t.points.gte(3600) }
        },
        61: {
            name: "6 AM FNAF Luck",
            tooltip: "Get 5 days.",
            image: "",
            done() { return player.t.points.gte(432000) }
        },
        62: {
            name: "The Earth's Ring",
            tooltip: "Get 1 year.",
            image: "",
            done() { return player.t.points.gte(31536000) }
        },
        63: {
            name: "Year 3000",
            tooltip: "Get 1 millenium.",
            image: "",
            done() { return player.t.points.gte(31536000000) }
        },
        64: {
            name: "Extinction",
            tooltip: "Get 1 megannum.",
            image: "",
            done() { return player.t.points.gte(3.1536e13) }
        },
        65: {
            name: "Epoch",
            tooltip: "Get 650 megannum.",
            image: "",
            done() { return player.t.points.gte(1.75e16) }
        },
        71: {
            name: "Space-Time",
            tooltip: "Get a space.",
            image: "",
            done() { return player.sa.points.gte(1) }
        },
        72: {
            name: "FNAF Pizzeria",
            tooltip: "Get amount of space same as the FNAF 1 pizzeria.",
            image: "https://cdn.discordapp.com/attachments/896797214981095525/938016739701190686/fnaf.jpg",
            done() { return player.sa.points.gte(34000) }
        },
        73: {
            name: "Anarchac- teria",
            tooltip: "Get e37,446 grams",
            image: "",
            done() { return player.points.gte("e37446") }
        },
        74: {
            name: "Myrillion",
            tooltip: "Get e30,003 weights",
            image: "",
            done() { return player.w.points.gte("e30003") }
        },
        75: {
            name: "Obese",
            tooltip: "Get obesed.",
            image: "",
            done() { return player.ob.points.gte(1) }
        },
    },
    name: "achievement", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(2),
    }},
    color: "#BB44DD",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "achievement", // Name of prestige currency
    baseResource: "grams as you had!", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: "side", // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true}
})