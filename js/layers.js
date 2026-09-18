addLayer("p", {
    name: "planets", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        matterDeposited: new Decimal(0),
    }},
    color: "yellowgreen",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "planets", // Name of prestige currency
    baseResource: "matter", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        mult = mult.mul(player.m.points.add(1))
        mult = mult.mul(tmp.r.effect)
        if (hasMilestone("sd", 0)) mult = mult.mul(100)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    doReset(resettingLayer) {
       if (layers[resettingLayer].row <= this.row) return;
    
       let keep = [];
       if (hasMilestone("s", 2)) keep.push("upgrades");
       layerDataReset(this.layer, keep);
    },
    clickables: {
        11: {
            title: "Add 1 Matter",
            display: "Hotkey: [Z]",
            onClick() {
                player.p.matterDeposited = player.p.matterDeposited.add(1)
                player.points = player.points.sub(1)
                if (player.p.matterDeposited.gte(50)) {
                    instantGain("p", 1)
                    player.p.matterDeposited = new Decimal(0)
                }
            },
            onHold() {
                player.p.matterDeposited = player.p.matterDeposited.add(1)
                player.points = player.points.sub(1)
                if (player.p.matterDeposited.gte(50)) {
                    instantGain("p", 1)
                    player.p.matterDeposited = new Decimal(0)
                }
            },
            canClick() {return player.points.gte(1)},
            style: {
                "border-radius":"15px"
            }
        },
        12: {
            title: "Add 25% Matter",
            display: "Hotkey: [X]",
            onClick() {
                let added = player.points.div(4).floor()
                player.p.matterDeposited = player.p.matterDeposited.add(added)
                player.points = player.points.mul(0.75)
                if (player.p.matterDeposited.gte(50)) {
                    let gains = player.p.matterDeposited.div(50).floor()
                    instantGain("p", gains)
                    player.p.matterDeposited = player.p.matterDeposited.sub(gains.mul(50))
                }
            },
            onHold() {
                let added = player.points.div(4).floor()
                player.p.matterDeposited = player.p.matterDeposited.add(added)
                player.points = player.points.mul(0.75)
                if (player.p.matterDeposited.gte(50)) {
                    let gains = player.p.matterDeposited.div(50).floor()
                    instantGain("p", gains)
                    player.p.matterDeposited = player.p.matterDeposited.sub(gains.mul(50))
                }
            },
            canClick() {return player.points.gte(4)},
            unlocked() {return hasUpgrade('p', 13) || hasMilestone("s", 1) || hasUpgrade("ss", 12)},
            style: {
                "border-radius":"15px"
            }
        },
        13: {
            title: "Add 100% Matter",
            display: "Hotkey: [C]",
            onClick() {
                player.p.matterDeposited = player.p.matterDeposited.add(player.points.floor())
                player.points = new Decimal(0)
                if (player.p.matterDeposited.gte(50)) {
                    let gains = player.p.matterDeposited.div(50).floor()
                    instantGain("p", gains)
                    player.p.matterDeposited = player.p.matterDeposited.sub(gains.mul(50))
                }
            },
            onHold() {
                player.p.matterDeposited = player.p.matterDeposited.add(player.points.floor())
                player.points = new Decimal(0)
                if (player.p.matterDeposited.gte(50)) {
                    let gains = player.p.matterDeposited.div(50).floor()
                    instantGain("p", gains)
                    player.p.matterDeposited = player.p.matterDeposited.sub(gains.mul(50))
                }
            },
            canClick() {return player.points.gte(10)},
            unlocked() {return hasMilestone("s", 3)},
            style: {
                "border-radius":"15px"
            }
        }
    },
    infoboxes: {
        info: {
            title: "Information|Planets",
            body: "This game is not like most other TMT games, because I tried to make something unique with this game. <br>Your first objective is to make a planet, which requires 50 matter. Click the [Grow planet] button to add 1 matter to the planet.<br><i>Tip: If you're on mobile, you can hold the buttons</i>",
        }
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "z", description: "[Z] Add 1 Matter (planets)", onPress(){clickClickable("p", 11)}},
        {key: "x", description: "[X] Add 25% Matter (planets)", onPress(){clickClickable("p", 12)}},
        {key: "c", description: "[C] Add 100% Matter (planets)", onPress(){clickClickable("p", 13)}},
    ],
    upgrades: {
        11: {
            title: "Multiplier",
            description: "Multiply matter gain by 2",
            cost: new Decimal(1)
        },
        12: {
            title: "Tripliplier",
            description: "Multiply matter gain by 3",
            cost: new Decimal(3),
            unlocked() {return hasUpgrade('p', 11)}
        },
        13: {
            title: "New Button",
            description: "Unlock Add 25% Matter button",
            cost: new Decimal(5),
            unlocked() {return hasUpgrade('p', 12)}
        },
        14: {
            title: "Another Layer",
            description: "Unlock star layer",
            cost: new Decimal(5),
            unlocked() {return hasUpgrade('p', 13)}
        },
    },
    layerShown(){return true},
    automate() {
        if (player.points.gte(4) && hasUpgrade("ss", 12) && player.ss.autoPlanet === true) {
            clickClickable("p", 12)
        }
    },
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                ["infobox", "info"],
                ["display-text", "Planet Creations"],
                "blank",
                "h-line",
                "blank",
                ["display-text", function() {return "You have put <span class='planets'><h2>"+ player.p.matterDeposited +" / 50</h2></span> matter"}],
                "blank",
                ["display-text", function() {return "You have <span id='points'><h2>"+ format(player.points) +"</h2></span> unused matter"}],
                "blank",
                "clickables",
                "blank",
                ["display-text", "Planet Upgrades"],
                "blank",
                "h-line",
                "blank",
                "upgrades"
            ]
        }
    }
})

addLayer("s", {
    name: "stars", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "khaki",
    requires: new Decimal(8), // Can be a function that takes requirement increases into account
    resource: "stars", // Name of prestige currency
    baseResource: "planets", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("ss", 11)) mult = mult.mul(10)
        mult = mult.div(Decimal.pow(2, getBuyableAmount("e", 21)))
        mult = mult.mul(Decimal.pow(3, getBuyableAmount("e", 22)))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    doReset(resettingLayer) {
       if (layers[resettingLayer].row <= this.row) return;
    
       let keep = [];
       if (hasUpgrade("ss", 13)) keep.push("milestones");
       layerDataReset(this.layer, keep);
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    branches: ["p"],
    infoboxes: {
        info: {
            title: "Information|Stars",
            body: "You made it to the stars layer! Now the game will not be boring anymore, lol.<br>You can start by getting 8 planets for a star, then the star will trigger 1st milestone, no upgrade needed."
        }
    },
    hotkeys: [
        {key: "s", description: "[S] Reset planets to get stars", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    milestones: {
        0: {
            requirementDescription: "1 star",
            effectDescription: "Your matter gain is multiplied by 2.5, also keep this layer",
            done() {return player.s.points.gte(1)}
        },
        1: {
            requirementDescription: "2 stars",
            effectDescription: "x2 matter gain, Add 25% Matter button always unlocked",
            done() {return player.s.points.gte(2)}
        },
        2: {
            requirementDescription: "4 stars",
            effectDescription: "Keep planet upgrades on row 1 reset",
            done() {return player.s.points.gte(4)}
        },
        3: {
            requirementDescription: "5 stars",
            effectDescription: "Permanently unlock Add 100% Matter button",
            done() {return player.s.points.gte(5)}
        },
        4: {
            requirementDescription: "10 stars",
            effectDescription: "Unlock the Moon layer",
            done() {return player.s.points.gte(10)}
        },
        5: {
            requirementDescription: "20 stars",
            effectDescription: "Keep moon upgrades on row 1 reset",
            done() {return player.s.points.gte(20)}
        },
        6: {
            requirementDescription: "1,000 stars",
            effectDescription: "Unlock Rings.",
            done() {return player.s.points.gte(1000) && hasUpgrade("m", 13)},
            unlocked() {return hasUpgrade("m", 13)}
        },
        7: {
            requirementDescription: "100,000,000 stars",
            effectDescription: "Unlock Stardust.",
            done() {return player.s.points.gte(100e6) && hasUpgrade("r", 14)},
            unlocked() {return hasUpgrade("r", 14)}
        },
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["infobox", "info"],
        ["display-text", "Star Milestones"],
        "blank",
        "h-line",
        "blank",
        "milestones"
    ],
    layerShown(){return hasUpgrade('p', 14) || hasMilestone("s", 0)}
})

addLayer("m", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "darkgray",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "moons", // Name of prestige currency
    baseResource: "matter", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        mult = mult.mul(tmp.r.effect)
        if (hasMilestone("sd", 0)) mult = mult.mul(100)
        mult = mult.mul(Decimal.pow(3, getBuyableAmount("e", 21)))
        mult = mult.div(Decimal.pow(2, getBuyableAmount("e", 22)))
        return mult
    },
    doReset(resettingLayer) {
       if (layers[resettingLayer].row <= this.row) return;
    
       let keep = [];
       if (hasMilestone("s", 5)) keep.push("upgrades");
       layerDataReset(this.layer, keep);
    },
    infoboxes: {
        info: {
            title: "Information|Moons",
            body: "This is the moon layer, this is a side layer for faster progression to row 1+ resets.<br>The buff from moons is simple: Moons+1, which means 3 moons = x4 planets.<br>You can also use planets to upgrade here."
        }
    },
    branches: ["p", "s"],
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "[M] Buy a moon", onPress(){if (canBuyBuyable("m", 11)) buyBuyable("m", 11)}},
    ],
    tabFormat: [
        "main-display",
        "buyables",
        ["infobox", "info"],
        "upgrades",
        "clickables"
    ],
    buyables: {
        11: {
            title: "Buy a moon",
            cost(x) { return new Decimal(500).mul(player.m.points.pow(2)) },
            display() { return `Cost: ${format(this.cost())} matter` },
            canAfford() { return player.points.gte(this.cost()) },
            buy() {
                if (!hasUpgrade("r", 12)) {
                    player.points = player.points.sub(this.cost())
                }
                instantGain("m", 1)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            tooltip: "Cost scaling: 500*(Amount<sup>2</sup>)",
        },
    },
    componentStyles: {
        "buyable"() { return {'height': '100px', 'width': '160px'} },
    },
    automate() {
        if (canBuyBuyable("m", 11) && hasUpgrade("m", 14)) {
            buyBuyable("m", 11)
        }
    },
    effect() {
        let effect = player.m.points.add(1)
        if (hasMilestone("sd", 1)) {
            effect = effect.pow(2)
        }
    },
    effectDescription() {
        let effect = player.m.points.add(1)
        if (hasMilestone("sd", 1)) {
            effect = effect.pow(2)
        }
        return "which multiply planet gain by <h2 style='color: darkgray; text-shadow: darkgray 0px 0px 10px'>"+format(effect)+"x</h2>"
    },
    layerShown(){return hasMilestone("s", 4) || hasAchievement("a", 15)},
    upgrades: {
        11: {
            title: "More upgrades!!!",
            description: "Yay!!!! Stars boost matter.",
            cost: new Decimal(25),
            effect() {return player.s.points.pow(0.6).add(1)},
            effectDisplay() {return 'x'+format(player.s.points.pow(0.6).add(1))},
            currencyDisplayName: "planets",
            currencyInternalName: "points",
            currencyLayer: "p",
            tooltip: "Stars<sup>0.6</sup>+1"
        },
        12: {
            title: "More-er upgrades!!!!",
            description: "Moons boost matter.",
            cost: new Decimal(50),
            effect() {return player.m.points.pow(0.7).add(1)},
            effectDisplay() {return 'x'+format(player.m.points.pow(0.7).add(1))},
            currencyDisplayName: "planets",
            currencyInternalName: "points",
            currencyLayer: "p",
            tooltip: "Moons<sup>0.7</sup>+1"
        },
        13: {
            title: "More-est upgrades!!!!",
            description: "Planets boost matter.",
            cost: new Decimal(5000),
            effect() {return player.p.points.pow(0.25).add(1)},
            effectDisplay() {return 'x'+format(player.p.points.pow(0.25).add(1))},
            currencyDisplayName: "planets",
            currencyInternalName: "points",
            currencyLayer: "p",
            tooltip: "Planets<sup>0.25</sup>+1"
        },
        14: {
            title: "Automation",
            description: "Auto-buy moons.",
            cost: new Decimal(1e9),
            currencyDisplayName: "planets",
            currencyInternalName: "points",
            currencyLayer: "p",
        }
    }
})

addLayer("r", {
    name: "rings", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    doReset(resettingLayer) {
       if (layers[resettingLayer].row <= this.row) return;
    
       let keep = [];
       if (hasMilestone("s", 2)) keep.push("upgrades");
       layerDataReset(this.layer, keep);
    },
    color: "goldenrod",
    requires: new Decimal(50), // Can be a function that takes requirement increases into account
    resource: "rings", // Name of prestige currency
    baseResource: "moons", // Name of resource prestige is based on
    baseAmount() {return player.m.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 2, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    branches: ["p", "m"],
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "r", description: "[R] Reset moons for rings", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    upgrades: {
        11: {
            title: "More planets!",
            description: "Moon upgrades? Wow!!! Rings also boost planets with their effect",
            cost: new Decimal(100),
            currencyDisplayName: "moons",
            currencyInternalName: "points",
            currencyLayer: "m",
        },
        12: {
            title: "Thievery",
            description: "Buying moons no longer takes your matter.",
            cost: new Decimal(500),
            currencyDisplayName: "moons",
            currencyInternalName: "points",
            currencyLayer: "m",
        },
        13: {
            title: "I need the boosts",
            description: "SQUARE the ring effect (you don't get a ton anyway)",
            cost: new Decimal(5000),
            currencyDisplayName: "moons",
            currencyInternalName: "points",
            currencyLayer: "m",
        },
        14: {
            title: "Next layer-ish!",
            description: "Unlock a new Milestone in star layer<br>This is requirement to have 4 rings",
            cost: new Decimal(0),
            canAfford() {return player.r.points.gte(4)},
        }
    },
    layerShown(){return hasMilestone("s", 6) || hasAchievement("a", 21)},
    effect() {
        let effect = player.r.points.add(1)
        if (hasUpgrade("r", 13)) {
            effect = effect.pow(2)
        }
        return effect
    },
    effectDescription() { 
        let effect = player.r.points.add(1)
        if (hasUpgrade("r", 13)) {
            effect = effect.pow(2)
        }
        if (!hasUpgrade("r", 11)) { return "which multiply moon gain by <h2 style='color: goldenrod; text-shadow: goldenrod 0px 0px 10px'>"+format(effect)+"x</h2>"} else {return "which multiply moon and planet gain by <h2 style='color: goldenrod; text-shadow: goldenrod 0px 0px 10px'>"+format(effect)+"x</h2>"}
     },
})

addLayer("sd", {
    name: "stardust", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SD", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#ff629e",
    branches: ["s", "r", "p"],
    requires: new Decimal(500e6), // Can be a function that takes requirement increases into account
    resource: "stardust", // Name of prestige currency
    baseResource: "stars", // Name of resource prestige is based on
    baseAmount() {return player.s.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 4, // Prestige currency exponent
    doReset(resettingLayer) {
       if (layers[resettingLayer].row <= this.row) return;
    
       let keep = [];
       if (hasMilestone("s", 2)) keep.push("milestones");
       layerDataReset(this.layer, keep);
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    milestones: {
        0: {
            requirementDescription: "1 stardust",
            effectDescription: "x100 planets and moons",
            done() {return player.sd.points.gte(1)}
        },
        1: {
            requirementDescription: "3 stardust",
            effectDescription: "SQUARE the moon multiplier on planets, also unlock Solar Systems (ENDGAME)",
            done() {return player.sd.points.gte(3)}
        }
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "d", description: "[D] Dustify(?) your stars for stardust", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasMilestone("s", 7) || hasAchievement("a", 24)}
})

addLayer("ss", {
    name: "solar systems", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SS", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        autoPlanet: false
    }},
    color: "#abff8a",
    requires: new Decimal(1e15), // Can be a function that takes requirement increases into account
    resource: "solar systems", // Name of prestige currency
    baseResource: "stars", // Name of resource prestige is based on
    baseAmount() {return player.s.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.45, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    branches: [
        "sd", "s", "r"
    ],
    clickables: {
        11: {
            title() {return player.ss.autoPlanet ? "Planet Automation: ON" : "Planet Automation: OFF"},
            display: "Hotkey: [P]",
            onClick() {
                if (player.ss.autoPlanet === true) {
                    player.ss.autoPlanet = false
                } else {
                    player.ss.autoPlanet = true
                }
            },
            canClick() {return true},
            unlocked() {return hasUpgrade("ss", 12)},
            style: {
                "height":"100px",
                "width":"200px"
            }
        }
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "[P] Toggle planet automation in solar system layer", onPress(){if (hasUpgrade("ss", 12)) {clickClickable("ss", 11)}}},
    ],
    layerShown(){return hasMilestone("sd", 1) || hasAchievement("a", 31)},
    upgrades: {
        11: {
            title: "Automation²",
            description() {if (hasUpgrade("ss", 1)) { 
                    return "Autobuy moons now buys max, and you only pay for the last level(!!!), Also this one's free cuz I'm such a nice guy" 
                } else {
                    return "Just kidding! That would be unbalanced (lol) Here, take x10 stars instead"
                }
            },
            cost: new Decimal(0)
        },
        12: {
            title: "Full Auto",
            description: 'Autoclicks "Add 25% Matter" button 10 times / second, and it is always unlocked.',
            cost: new Decimal(1)
        },
        13: {
            title: "Persistency",
            description: 'Keep star milestones and ring upgrades on row 2 reset',
            cost: new Decimal(5)
        },
        14: {
            title: "Persistency again",
            description: 'Keep stardust milestones on row 2 reset',
            cost: new Decimal(10)
        },
        15: {
            title: "Interesting",
            description: 'Unlock eclipse layer',
            cost: new Decimal(50)
        },
    },
})

addLayer("e", {
    name: "eclipse", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(1),
    }},
    color: "#67316e",
    resource: "eclipse tokens", // Name of prestige currency
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    branches: [
        "ss", "sd", "s"
    ],
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    buyables: {
        // Buy eclipse tokens
        11: {
            title: "Stars > E$",
            cost: new Decimal(100e15),
            display: "\nCost: "+format(new Decimal(100e15))+" stars\n+1 eclipse token",
            style: {
                "width":"150px",
                "height":"100px"
            },
            canAfford() {
                return player.s.points.gte(100e15) 
            },
            buy() {
                instantGain("e", player.s.points.div(100e15).floor())
                player.s.points = player.s.points.sub(player.s.points.div(100e15).floor().mul(100e15))
            },
        },
        12: {
            title: "Moons > E$",
            cost: new Decimal(5e6),
            display: "\nCost: "+format(new Decimal(5e6))+" moons\n+1 eclipse token",
            style: {
                "width":"150px",
                "height":"100px"
            },
            canAfford() {
                return player.m.points.gte(5e6) 
            },
            buy() {
                player.m.points = player.m.points.sub(5e6)
                instantGain("e", 1)
            },
        },
        13: {
            title: "Tokens > E$",
            cost: new Decimal(1e6),
            display: "\nCost: "+format(new Decimal(1e6))+" plinko tokens\n+1 eclipse token",
            style: {
                "width":"150px",
                "height":"100px"
            },
            canAfford() {
                return player.pl.points.gte(1e6) 
            },
            buy() {
                player.pl.points = player.pl.points.sub(1e6)
                instantGain("e", 1)
            },
            unlocked() {return hasUpgrade("pl", 21)}
        },
        // Eclipse buyables
        21: {
            title: "Solar Eclipse",
            cost(x) {return x.add(1).pow(1.5).floor()},
            display() { 
                return "\n<h3>x3</h3> moon gain\n<h3>/2</h3> star gain\n\nCost: " + formatWhole(this.cost()) + " eclipse tokens\nAmount: " + formatWhole(getBuyableAmount(this.layer, this.id))
            },
            style: {
                "width":"200px",
                "height":"140px"
            },
            canAfford() {
                return player.e.points.gte(this.cost()) 
            },
            buy() {
                player.e.points = player.e.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        22: {
            title: "Lunar Eclipse",
            cost(x) {return x.add(1).pow(1.5).floor()},
            display() { 
                return "\n<h3>x3</h3> star gain\n<h3>/2</h3> moon gain\n\nCost: " + formatWhole(this.cost()) + " eclipse tokens\nAmount: " + formatWhole(getBuyableAmount(this.layer, this.id))
            },
            style: {
                "width":"200px",
                "height":"140px"
            },
            canAfford() {
                return player.e.points.gte(this.cost()) 
            },
            buy() {
                player.e.points = player.e.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        }
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        
    ],
    milestones: {
        0: {
            requirementDescription: "100 eclipse tokens (endgame)",
            effectDescription: "You got the endgame yippee",
            done() {return player.e.points.gte(100)}
        }
    },
    layerShown(){return hasUpgrade("ss", 15)}
})

addLayer("a", {
    name: "Achievements",
    symbol: "A",
    row: "side",
    position: 0,
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    color: "gold",
    resource: "achievements", 
    type: "none", 

    // Updates the layer points automatically every tick
    update() {
        let earned = player[this.layer].achievements.length;
        player[this.layer].points = new Decimal(earned);
    },

    // Displays the standard resource counter and the fraction breakdown
    tabFormat: [
        ["display-text", function() { 
            let earned = player['a'].achievements.length;
            let total = Object.keys(layers['a'].achievements).filter(key => !isNaN(key)).length;
            return `Progress: ${earned} / ${total} achievements completed. (${format((earned/total)*100)}%)`;
        }],
        ["blank", "20px"],
        ["display-text", "Achievements"],
        "blank",
        "h-line",
        "blank",
        "achievements"
    ],

    achievements: {
        11: {
            name: "The first planet",
            done() { return player.p.points.gte(1) },
            tooltip: "Get your 1st planet",
        },
        12: {
            name: "Finally",
            done() { return hasUpgrade('p', 13) },
            tooltip: "Buy planet upgrade 13",
        },
        13: {
            name: "Complete for now",
            done() { return hasUpgrade('p', 14) },
            tooltip: "Buy every planet upgrade",
        },
        14: {
            name: "Time for stars",
            done() { return hasUpgrade('p', 14) && player.p.points.gte(8) },
            tooltip: "Buy every planet upgrade, and have 8 planets (enough for stars)",
        },
        15: {
            name: "Lunar",
            done() { return player.s.points.gte(10) },
            tooltip: "Unlock moon layer",
        },
        16: {
            name: "Full Moon",
            done() { return player.m.points.gte(1000) },
            tooltip: "Have 1,000 Moons",
        },
        21: {
            name: "Ring thing?",
            done() { return player.r.points.gte(1) },
            tooltip: "Have a ring on your planet",
        },
        22: {
            name: "Planet X",
            done() { return player.r.points.gte(2) },
            tooltip: "Have 2 rings on your planet",
        },
        23: {
            name: "Not quite J1407b",
            done() { return player.r.points.gte(4) },
            tooltip: "Have 4 rings on your planet",
        },
        24: {
            name: "Eat my dust",
            done() { return player.sd.points.gte(1) },
            tooltip: "Get your first stardust",
        },
        25: {
            name: "Another one bites the dust",
            done() { return player.sd.points.gte(2) },
            tooltip: "Have 2 stardust",
        },
        26: {
            name: "+ULTRARICODUST",
            done() { return player.sd.points.gte(3) },
            tooltip: "Get 3 stardust",
        },
        31: {
            name: "Unique achievement name here",
            done() { return player.sd.points.gte(3) },
            tooltip: "Get 1 solar system",
        },
        32: {
            name: "Tomfoolery",
            done() { return hasUpgrade("ss", 11) },
            tooltip: "Get trolled by solar system upgrade 11",
        },
    },
})

addLayer("pl", {
    name: "minigame", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "PL", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#444",
    resource: "tokens",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("pl", 11)) mult = mult.mul(3)
        if (hasUpgrade("pl", 12)) mult = mult.mul(3)
        if (hasUpgrade("pl", 13)) mult = mult.mul(3)
        if (hasUpgrade("pl", 14)) mult = mult.mul(upgradeEffect("pl", 14))
        if (hasUpgrade("pl", 15)) mult = mult.mul(upgradeEffect("pl", 15))
        if (hasUpgrade("pl", 22)) mult = mult.mul(3)
        if (hasUpgrade("pl", 23)) mult = mult.mul(3)
        if (hasUpgrade("pl", 24)) mult = mult.mul(5)
        return mult
    },
    infoboxes: {
        info: {
            title: "Plinko Minigame",
            body: "Depending on which color you land on, you will get more or less tokens.<br>Spend tokens on token upgrades for multipliers and stuff<br><br>The multipliers from right to left are:<br><br><h3>x5, x3, x2, x1, x0.5, x0.1, x0.5, x1, x2, x3, x5</h3>"
        },
    },
    tabFormat: {
        "Plinko": {
            content: [
                "main-display",
                "blank",
                ["raw-html", "<iframe src='https://voidcons0le.github.io/plinko/' style='width: 480px; height: 360px; border: none;'></iframe>"],
                ["infobox", "info"],
                "upgrades",
            ]
        },
        "Roblox RNG game ripoff": {
            content: [
                ["display-text", "<span id='points'>Coming in the next update!!!</span>"]
            ],
            unlocked() {return hasUpgrade("pl", 25)}
        }
    },
    upgrades: {
        11: {
            title: "Let's go gambling!",
            description: "Triple your token gain",
            cost: new Decimal(5)
        },
        12: {
            title: "Aw dang it...",
            description: "Triple your token gain again!",
            cost: new Decimal(100)
        },
        13: {
            title: "Infinite content glitch",
            description: "Triple your token gain yet again",
            cost: new Decimal(500)
        },
        14: {
            title: "Enough of that",
            description: "Tokens boost themselves",
            effect() {return player.pl.points.pow(0.15).add(1)},
            effectDisplay() {return "x"+format(player.pl.points.pow(0.15).add(1))},
            tooltip: "Tokens<sup>0.25</sup>+1",
            cost: new Decimal(2000)
        },
        15: {
            title: "Wait a second",
            description: "Achievements boost tokens",
            effect() {return player.a.points.pow(0.4).add(1)},
            effectDisplay() {return "x"+format(player.a.points.pow(0.4).add(1))},
            tooltip: "Achievements<sup>0.4</sup>+1",
            cost: new Decimal(5000)
        },
        21: {
            title: "If this was made",
            description: "Buy eclipse tokens with plinko tokens (if you have eclipse layer)",
            cost: new Decimal(15000)
        },
        22: {
            title: "with Scratch then",
            description: "Triple your token gain once more",
            cost: new Decimal(20000)
        },
        23: {
            title: "how are the tokens working?",
            description: "Triple your token gain for the definitely not last time",
            cost: new Decimal(150000)
        },
        24: {
            title: "Try not to think about it",
            description: "Quintuple your token gain (hmm)",
            cost: new Decimal(500000)
        },
        25: {
            title: "More gambling",
            description: "Another tab to fulfill your gambling quota",
            cost: new Decimal(2000000)
        },
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: "side", // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true}
})