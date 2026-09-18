addLayer("+", {
    name: "adds", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "~", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#5F6F7F",
    requires: new Decimal(15), // Can be a function that takes requirement increases into account
    resource: function() { return options.addictionMode ? "addictions" : "additions"}, // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 2, // Prestige currency exponent
    tabFormat: {
        "Progression": {
            content: [
                "main-display",
                "prestige-button",
                "resource-display",
                ['bar', 'additionReq'],
                ["display-text",
                    function() { return "<br>Features:" },],
                ["display-text",
                    function() { if (player['+'].points.gte(0)) {return "- <span style=\"color: rgb(95, 111, 127); text-shadow: rgb(95, 111, 127) 0px 0px 10px;\">Addition</span> layer"} },],
                ["display-text",
                    function() { if (player['+'].points.gte(1)) {return "- <span style=\"color: rgb(0, 255, 0); text-shadow: rgb(0, 255, 0) 0px 0px 10px;\">Prestige</span> layer, 1 upgrade for it"} },],
                ["display-text",
                    function() { if (player['+'].points.gte(2)) {return "- +2 Upgrades for <span style=\"color: rgb(0, 255, 0); text-shadow: rgb(0, 255, 0) 0px 0px 10px;\">prestige</span> layer"} },],
                ["display-text",
                    function() { if (player['+'].points.gte(3)) {return "- +1 Upgrades for <span style=\"color: rgb(0, 255, 0); text-shadow: rgb(0, 255, 0) 0px 0px 10px;\">prestige</span> layer"} },],
                ["display-text",
                    function() { if (player['+'].points.gte(4)) {return "- +3 Upgrades for <span style=\"color: rgb(0, 255, 0); text-shadow: rgb(0, 255, 0) 0px 0px 10px;\">prestige</span> layer"} },],
                ["display-text",
                    function() { if (player['+'].points.gte(5)) {return "- <span style=\"color: rgb(0, 119, 255); text-shadow: rgb(0, 119, 255) 0px 0px 10px;\">Rebirth</span> layer, 1 upgrade for it, a x2 <span style=\"color: rgb(255, 255, 255); text-shadow: rgb(255, 255, 255) 0px 0px 10px;\">point</span> boost and +2 Upgrades for <span style=\"color: rgb(0, 255, 0); text-shadow: rgb(0, 255, 0) 0px 0px 10px;\">prestige</span> layer"} },],
                ["display-text",
                    function() { if (player['+'].points.gte(6)) {return "- +4 Upgrades for <span style=\"color: rgb(0, 119, 255); text-shadow: rgb(0, 119, 255) 0px 0px 10px;\">rebirth</span> layer"} },],
                ["display-text",
                    function() { if (player['+'].points.gte(7)) {return "- Nerf <span style=\"color: rgb(0, 119, 255); text-shadow: rgb(0, 119, 255) 0px 0px 10px;\">rebirth</span> upgrade 15, and +4 Upgrades for <span style=\"color: rgb(0, 119, 255); text-shadow: rgb(0, 119, 255) 0px 0px 10px;\">rebirth</span> layer"} },],
                ["display-text",
                    function() { if (player['+'].points.gte(8)) {return "- <span style=\"color: rgb(255, 119, 0); text-shadow: rgb(255, 119, 0) 0px 0px 10px;\">Mega</span> layer, 2 upgrades for it"} },],
                ["display-text",
                    function() { if (player['+'].points.gte(9)) {return "- +2 Upgrades for <span style=\"color: rgb(255, 119, 0); text-shadow: rgb(255, 119, 0) 0px 0px 10px;\">mega</span> layer"} },],
                ["display-text",
                    function() { if (player['+'].points.gte(10)) {return "- +3 Upgrades for <span style=\"color: rgb(255, 119, 0); text-shadow: rgb(255, 119, 0) 0px 0px 10px;\">mega</span> layer"} },],
                ["display-text",
                    function() { if (player['+'].points.gte(11)) {return "- <span style=\"color: rgb(255, 0, 255); text-shadow: rgb(255, 0, 255) 0px 0px 10px;\">Ultra</span> layer, 2 Upgrades for it, 1 Milestone for it, x3 <span style=\"color: rgb(255, 255, 255); text-shadow: rgb(255, 255, 255) 0px 0px 10px;\">point</span> gain"} },],
                ["display-text",
                    function() { if (player['+'].points.gte(12)) {return "- <span style=\"color: rgb(255, 0, 255); text-shadow: rgb(255, 0, 255) 0px 0px 10px;\">Ultra</span> Buyable"} },],
                ["display-text",
                    function() { if (player['+'].points.gte(13)) {return "- x1.5 <span style=\"color: rgb(255, 255, 255); text-shadow: rgb(255, 255, 255) 0px 0px 10px;\">point</span> gain"} },],
                ["display-text",
                    function() { if (player['+'].points.gte(14)) {return "- Gain 1% of <span style=\"color: rgb(255, 0, 255); text-shadow: rgb(255, 0, 255) 0px 0px 10px;\">ultra</span> points/s"} },],
                ["display-text",
                    function() { if (player['+'].points.gte(15)) {return "- +1 Upgrade for <span style=\"color: rgb(255, 0, 255); text-shadow: rgb(255, 0, 255) 0px 0px 10px;\">ultra</span> layer"} },],
                ["display-text",
                    function() { if (player['+'].points.gte(16)) {return "- Multiply <span style=\"color: rgb(255, 255, 255); text-shadow: rgb(255, 255, 255) 0px 0px 10px;\">point</span> gain by <span style=\"color: rgb(95, 111, 127); text-shadow: rgb(95, 111, 127) 0px 0px 10px;\">additions</span> (Currently: <h3 style=\"color: rgb(95, 111, 127); text-shadow: rgb(95, 111, 127) 0px 0px 10px;\">x" + format(player['+'].points.pow(1.1)) + "</h3>)"} },],
                ["display-text",
                    function() { if (player['+'].points.gte(17)) {return "- Add a number to the base <span style=\"color: rgb(255, 255, 255); text-shadow: rgb(255, 255, 255) 0px 0px 10px;\">point</span> gain based off of <span style=\"color: rgb(255, 255, 255); text-shadow: rgb(255, 255, 255) 0px 0px 10px;\">points</span> (Currently: <h3 style=\"color: rgb(255,255,255); text-shadow: rgb(255,255,255) 0px 0px 10px;\">+" + format(player.points.pow(0.025)) + "</h3>)"} },],
                ["display-text",
                    function() { if (player['+'].points.gte(18)) {return "- Gain <h3 style=\"color: rgb(0,255,0); text-shadow: rgb(0,255,0) 0px 0px 10px;\">" + format(player['p'].points.add(1).pow(0.0075).log(2)) + "%</h3> <span style=\"color: rgb(255, 0, 255); text-shadow: rgb(255, 0, 255) 0px 0px 10px;\">ultra</span> points per second"} },],
                ["display-text",
                    function() { if (player['+'].points.gte(19)) {return "- <span style=\"color: rgb(119, 119, 119); text-shadow: rgb(119, 119, 119) 0px 0px 10px;\">Infinity</span> layer, 4 upgrades for it"} },],
                ["display-text",
                    function() { if (player['+'].points.gte(20)) {return "- +3 Upgrades for <span style=\"color: rgb(119, 119, 119); text-shadow: rgb(119, 119, 119) 0px 0px 10px;\">infinity</span> layer"} },],
                ["display-text",
                    function() { if (player['+'].points.gte(21)) {return "- ^0.98 <span style=\"color: rgb(255, 255, 255); text-shadow: rgb(255, 255, 255) 0px 0px 10px;\">point</span> gain"} },],
                ["display-text",
                    function() { if (player['+'].points.gte(22)) {return `- Start gaining <span style="color: hsl(${(player.timePlayed * 15) % 360}, 100%, 50%); text-shadow: hsl(${(player.timePlayed * 15) % 360}, 100%, 50%) 0px 0px 10px;">omega</span>, and unlock <span style="color: hsl(${(player.timePlayed * 15) % 360}, 100%, 50%); text-shadow: hsl(${(player.timePlayed * 15) % 360}, 100%, 50%) 0px 0px 10px;">omega</span> upgrades`} },],
                ["display-text",
                    function() { if (player['+'].points.gte(23)) {return `- x2 <span style="color: hsl(${(player.timePlayed * 15) % 360}, 100%, 50%); text-shadow: hsl(${(player.timePlayed * 15) % 360}, 100%, 50%) 0px 0px 10px;">omega</span>`} },],
                ["display-text",
                    function() { if (player['+'].points.gte(24)) {return `- Automate <span style=\"color: rgb(255, 0, 255); text-shadow: rgb(255, 0, 255) 0px 0px 10px;\">ultra</span> upgrades`} },],
                ["display-text",
                    function() { if (player['+'].points.gte(25)) {return `- Unlock <span style=\"color: rgb(255, 0, 0); text-shadow: rgb(255, 0, 0) 0px 0px 10px;\">multiplier</span>`} },],
                ["display-text",
                    "<br><br>Please like this game the colors took so long ;-;<br><br>"
                ],
                ['infobox', 'help'],
                ['infobox', 'cap']
            ],
        },
    },
    infoboxes: {
        help: {
            title: "Help for colors and sizes",
            body() {
                return "<h3>Big text</h3> means that something is dynamic<br><span style=\"color: rgb(255, 255, 255); text-shadow: rgb(255, 255, 255) 0px 0px 10px;\">Colored text with a shadow</span> mean layers/layer points<br>There are currently 9 colors that mean something:<br><span style=\"color: rgb(255, 255, 255); text-shadow: rgb(255, 255, 255) 0px 0px 10px;\">Points</span><br><span style=\"color: rgb(95, 111, 127); text-shadow: rgb(95, 111, 127) 0px 0px 10px;\">Addition layer</span><br><span style=\"color: rgb(0, 255, 0); text-shadow: rgb(0, 255, 0) 0px 0px 10px;\">" + (player['+'].points.gte(1) ? "Prestige" : makeid(8)) + " layer</span><br><span style=\"color: rgb(0, 119, 255); text-shadow: rgb(0, 119, 255) 0px 0px 10px;\">" + (player['+'].points.gte(5) ? "Rebirth" : makeid(7)) + " layer</span><br><span style=\"color: rgb(255, 119, 0); text-shadow: rgb(255, 119, 0) 0px 0px 10px;\">" + (player['+'].points.gte(8) ? "Mega" : makeid(4)) + " layer</span><br><span style=\"color: rgb(255, 0, 255); text-shadow: rgb(255, 0, 255) 0px 0px 10px;\">" + (player['+'].points.gte(11) ? "Ultra" : makeid(5)) + " layer</span><br><span style=\"color: rgb(119, 119, 119); text-shadow: rgb(119, 119, 119) 0px 0px 10px;\">" + (player['+'].points.gte(19) ? "Infinity" : makeid(8)) + ` layer</span><br><span style="color: hsl(${(player.timePlayed * 15) % 360}, 100%, 50%); text-shadow: hsl(${(player.timePlayed * 15) % 360}, 100%, 50%) 0px 0px 10px;">` + (player['+'].points.gte(22) ? "Omega" : makeid(5)) + "</span><br><span style=\"color: rgb(255, 0, 0); text-shadow: rgb(255, 0, 0) 0px 0px 10px;\">" + (player['+'].points.gte(25) ? "Multiplier" : makeid(10)) + " layer</span><br>Colored dynamic text means that it uses a formula based off of the colors above" 
            },
        },
        cap: {
            title: "Addition cap",
            body() {
                return "<span style=\"color: rgb(95, 111, 127); text-shadow: rgb(95, 111, 127) 0px 0px 10px;\">Addition</span> cap is currently " + format(additionCap) 
            }
        }
    },
    bars: {
        additionReq: {
            direction: RIGHT,
            width: 700,
            height: 50,
            progress() { return player.points.div(getNextAt('+')) },
            fillStyle: {'background': "linear-gradient(270deg, rgba(95,111,127,1) 0%, rgba(255,0,0,1) 100%)"},
            display() {
                return `${this.progress().gte(1) ? `<span style=\"color: hsl(${!options.disabledTextColorChange ? this.progress().pow(0.5).times(10).add(120).mod(360) : 120}, 100%, 50%);\">` : ""}${format(player.points) + " / " + format(getNextAt('+')) + " <span style=\"color: rgb(255, 255, 255); text-shadow: rgb(255, 255, 255) 0px 0px 10px;\">points</span> (" + format(this.progress().times(100)) + "%)"}</span>`
            },
        },
    },
    automate() {
        if (player['+'].points.gt(additionCap)) { 
            player['+'].points = new Decimal(additionCap)
            overginded = true
        }
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('p', 21)) mult = mult.div(2)
        if (hasUpgrade('p', 22)) mult = mult.div(1.5)
        if (hasUpgrade('r', 21)) mult = mult.div(5)
        if (hasUpgrade('m', 13)) mult = mult.div(100)
        if (player['+'].points.gte(10)) mult = mult.times(5e20)
        if (player['+'].points.gte(14)) mult = mult.times(5e10)
        if (player['+'].points.gte(15)) mult = mult.times(5e30)
        if (player['+'].points.gte(16)) mult = mult.times(5e10)
        if (player['+'].points.gte(17)) mult = mult.times(5e40)
        if (player['+'].points.gte(18)) mult = mult.times(5e20)
        if (player['+'].points.gte(20)) mult = mult.times(5e120)
        if (player['+'].points.gte(22)) mult = mult.times(5e50)
        if (player['+'].points.gte(24)) mult = mult.times(5e25)
        if (overginded) mult = new Decimal("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee1000000")
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 'side', // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true}
})

addLayer("a", {
    name: "achievements", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FFFF00",
    requires: new Decimal(80085), // Can be a function that takes requirement increases into account
    tooltip: "Achievements",
    resource: "achis", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 2, // Prestige currency exponent
    achievements: {
        11: {
            name: "The first one's always free",
            tooltip: "If you don't have this, you don't exist",
            done() {return true}
        },
        12: {
            name: "Gotta start somewhere",
            tooltip: "Get 1 addition",
            done() {return player['+'].points.gte(1)}
        },
        13: {
            name: "A single upgrade?",
            tooltip: "Get prestige upgrade 11",
            done() {return hasUpgrade('p', 11)}
        },
        14: {
            name: "DYNAMIC!!",
            tooltip: "Get prestige upgrade 14",
            done() {return hasUpgrade('p', 14)}
        },
        15: {
            name: "That is long...",
            tooltip: "Get 5 additions",
            done() {return player['+'].points.gte(5)}
        },
        16: {
            name: "META",
            tooltip: "Get the first meta upgrade",
            done() {return hasUpgrade('p', 21)}
        },
        17: {
            name: "Rebirth!",
            tooltip: "Rebirth for the first time",
            done() {return player['r'].points.gte(1)} // ignore the lazy solution
        },
        18: {
            name: "Automated",
            tooltip: "Get rebirth upgrade 15",
            done() {return hasUpgrade('r', 15)}
        },
        19: {
            name: "What is a prestige reset?",
            tooltip: "Get rebirth upgrade 16",
            done() {return hasUpgrade('r', 16)}
        },
        21: {
            name: "Very mega",
            tooltip: "Mega for the first time",
            done() {return player['m'].points.gte(1)} // ignore the lazy solution
        },
        22: {
            name: "Silent rebirth",
            tooltip: "Get mega upgrade 14",
            done() {return hasUpgrade('m', 14)}
        },
        23: {
            name: "v0.1.x complete",
            tooltip: "Get 10 additions",
            done() {return player['+'].points.gte(10)}
        },
        24: {
            name: "Woah",
            tooltip: "Ultra for the first time",
            done() {return player['u'].points.gte(1)} // ignore the lazy solution
        },
        25: {
            name: "The first milestone",
            tooltip: "Get ultra milestone 0",
            done() {return hasMilestone('u', 0)}
        },
        26: {
            name: "v0.2.x complete",
            tooltip: "Get 13 additions",
            done() {return player['+'].points.gte(13)}
        },
        27: {
            name: "To infinity, and beyond!",
            tooltip: "Get 1 infinity",
            done() {return player['i'].points.gte(1)} // ignore the lazy solution
        },
        28: {
            name: "v0.3.x complete",
            tooltip: "Get infinity upgrade 14",
            done() {return hasUpgrade('i', 14)}
        },
        29: {
            name: "Break Infinity",
            tooltip: "Get 2^1024 points",
            done() {return player.points.gte(new Decimal(2).pow(1024))}
        },
        31: {
            name: "v0.4.x complete",
            tooltip: "Get infinity upgrade 17",
            done() {return hasUpgrade('i', 17)}
        },
        32: {
            name: "You tried ¯\\_(ツ)_/¯",
            tooltip: "Try to overgrind for additions",
            done() {return overginded}
        },
        33: {
            name: "ω",
            tooltip: "Get 1 omega",
            done() {return player['i'].omega.gte(1)}
        },
        34: {
            name: "v0.5.x complete",
            tooltip: "Get 1000 omega",
            done() {return player['i'].omega.gte(1000)}
        },
        35: {
            name: "There's a softcap??",
            tooltip: "Get 5000 omega",
            done() {return player['i'].omega.gte(5000)}
        },
        36: {
            name: function() {return `<h2 style="color: hsl(${(player.timePlayed * 15) % 360}, 100%, 50%); text-shadow: hsl(${(player.timePlayed * 15) % 360}, 100%, 50%) 0px 0px 10px;">OMEGA</h2>`},
            tooltip: "Get 1000000 omega",
            done() {return player['i'].omega.gte(1000000)}
        },
        37: {
            name: "Infinity of infinities",
            tooltip: "Get 2^1024 infinities",
            done() {return player['i'].points.gte(new Decimal(2).pow(1024))}
        },
    },
    tabFormat: {
        "Achievements": {
            content: [
                "achievements"
            ],
        },
    },
    row: 'side', // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true}
})

addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#0F0",
    requires: new Decimal(5), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    upgrades: {
        11: {
            title: "Times",
            description: "x2 point gain",
            cost: new Decimal(1),
            unlocked() {return player['+'].points.gte(1)}
        },
        12: {
            title: "Again",
            description: "x2 point gain again",
            cost: new Decimal(4),
            unlocked() {return player['+'].points.gte(2)}
        },
        13: {
            title: "Base Adder",
            description: "+1 base point gain",
            cost: new Decimal(7),
            unlocked() {return player['+'].points.gte(2)}
        },
        14: {
            title: "Scalar",
            description: "Multiplies points based off of points",
            cost: new Decimal(10),
            effect() {
                return player.points.add(1).pow(0.4)
            },
            effectDisplay() {return 'x' + format(upgradeEffect(this.layer, this.id))},
            tooltip: "(points+1)<sup>0.4</sup>",
            unlocked() {return player['+'].points.gte(3)}
        },
        15: {
            title: "More",
            description: "Multiplies prestige points based off of points",
            cost: new Decimal(20),
            effect() {
                return player.points.add(1).pow(0.1)
            },
            effectDisplay() {return 'x' + format(upgradeEffect(this.layer, this.id))},
            tooltip: "(points+1)<sup>0.1</sup>",
            unlocked() {return player['+'].points.gte(4)}
        },
        16: {
            title: "More but Reversed",
            description: "Multiplies points based off of prestige points",
            cost: new Decimal(40),
            effect() {
                return player.p.points.add(1).pow(0.25)
            },
            effectDisplay() {return 'x' + format(upgradeEffect(this.layer, this.id))},
            tooltip: "(prestigepoints+1)<sup>0.25</sup>",
            unlocked() {return player['+'].points.gte(4)}
        },
        17: {
            title: "More but Small",
            description: "Multiplies points based off of prestige points (reduced effect)",
            cost: new Decimal(500),
            effect() {
                return player.p.points.add(1).pow(0.1)
            },
            effectDisplay() {return 'x' + format(upgradeEffect(this.layer, this.id))},
            tooltip: "(prestigepoints+1)<sup>0.1</sup>",
            unlocked() {return player['+'].points.gte(4)}
        },
        21: {
            title: "META",
            description: "/2 addition req.",
            cost: new Decimal(2000),
            style: function(){
                    if (hasUpgrade(this.layer, this.id)) {
                        return {'background': 'linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(255,253,0,1) 14%, rgba(0,255,25,1) 28%, rgba(0,244,237,1) 47%, rgba(0,1,242,1) 61%, rgba(235,0,246,1) 79%, rgba(255,0,0,1) 100%)'}
                    } else {
                        return
                    }
                },
            unlocked() {return player['+'].points.gte(5)}
        },
        22: {
            title: "Less META",
            description: function(){
                if (hasUpgrade(this.layer, this.id)) {
                    return "/1.5 addition req."
                } else {
                    return "???"
                }
            },
            cost: new Decimal(3000),
            style: function(){
                    if (hasUpgrade(this.layer, this.id)) {
                        return {'background': 'linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(255,253,0,1) 14%, rgba(0,255,25,1) 28%, rgba(0,244,237,1) 47%, rgba(0,1,242,1) 61%, rgba(235,0,246,1) 79%, rgba(255,0,0,1) 100%)'}
                    } else {
                        return
                    }
                },
            unlocked() {return player['+'].points.gte(5)}
        },
    },
    passiveGeneration() {
        if (hasUpgrade('m', 14)) return 1.5
        if (hasUpgrade('r', 15) && player['+'].points.gte(7)) return 0.05
        if (hasUpgrade('r', 15)) return 0.1
	    return 0
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('p', 15)) mult = mult.times(upgradeEffect('p', 15))
        if (hasUpgrade('r', 12)) mult = mult.times(3)
        if (hasUpgrade('r', 13)) mult = mult.times(upgradeEffect('r', 13))
        if (hasUpgrade('r', 14)) mult = mult.times(upgradeEffect('r', 14))
        if (hasUpgrade('r', 17)) mult = mult.pow(1.05)
        if (hasUpgrade('i', 12)) mult = mult.times(10)
        return mult
    },
    automate() {
        if (hasUpgrade('r', 16)) {
            buyUpgrade('p', 11)
            buyUpgrade('p', 12)
            buyUpgrade('p', 13)
            buyUpgrade('p', 14)
            buyUpgrade('p', 15)
            buyUpgrade('p', 16)
            buyUpgrade('p', 17)
            buyUpgrade('p', 21)
            buyUpgrade('p', 22)
        }
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player['+'].points.gte(1)}
})

addLayer("r", {
    name: "rebirth", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    branches: "p",
    color: "#07F",
    requires: new Decimal(3000), // Can be a function that takes requirement increases into account
    resource: "rebirth points", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    upgrades: {
        11: {
            title: "Multiply",
            description: "x2 point gain",
            cost: new Decimal(1),
            unlocked() {return player['+'].points.gte(5)}
        },
        12: {
            title: "Extra",
            description: "x3 prestige point gain",
            cost: new Decimal(2),
            unlocked() {return player['+'].points.gte(6)}
        },
        13: {
            title: "Dynamic",
            description: "Multiply prestige point gain by points",
            effect() {
                return player.points.add(1).pow(0.3)
            },
            effectDisplay() {return 'x' + format(upgradeEffect(this.layer, this.id))},
            tooltip: "(points+1)<sup>0.3</sup>",
            cost: new Decimal(5),
            unlocked() {return player['+'].points.gte(6)}
        },
        14: {
            title: "Double dynamic",
            description: "Multiply prestige point gain by points, but reduced effect",
            effect() {
                return player.points.add(1).pow(0.1)
            },
            effectDisplay() {return 'x' + format(upgradeEffect(this.layer, this.id))},
            tooltip: "(points+1)<sup>0.1</sup>",
            cost: new Decimal(30),
            unlocked() {return player['+'].points.gte(6)}
        },
        15: {
            title: "Volatility",
            description: function() {
                if (player['+'].points.gte(7)) {
                    return "Gain 5% of prestige points per second (nerfed by addition 7)"
                } else {
                    return "Gain 10% of prestige points per second"
                }
            },
            cost: new Decimal(1000),
            unlocked() {return player['+'].points.gte(6)}
        },
        16: {
            title: "Volatility extra",
            description: "Autobuy prestige upgrades",
            cost: new Decimal(20000),
            unlocked() {return player['+'].points.gte(7)}
        },
        17: {
            title: "Powers!",
            description: "^1.05 prestige points",
            cost: new Decimal(30000),
            unlocked() {return player['+'].points.gte(7)}
        },
        21: {
            title: "META II",
            description: "/5 addition req.",
            cost: new Decimal(35000),
            style: function(){
                if (hasUpgrade(this.layer, this.id)) {
                    return {'background': 'linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(255,253,0,1) 14%, rgba(0,255,25,1) 28%, rgba(0,244,237,1) 47%, rgba(0,1,242,1) 61%, rgba(235,0,246,1) 79%, rgba(255,0,0,1) 100%)'}
                } else {
                    return
                }
            },
            unlocked() {return player['+'].points.gte(7)}
        },
        22: {
            title: "MORE!!!",
            description: "x25 point gain",
            cost: new Decimal(40000),
            unlocked() {return player['+'].points.gte(7)}
        },
    },
    passiveGeneration() {
        if (hasUpgrade('m', 14)) return 0.5
	    return 0
    },
    automate() {
        if (hasUpgrade('m', 14)) {
            buyUpgrade('r', 11)
            buyUpgrade('r', 12)
            buyUpgrade('r', 13)
            buyUpgrade('r', 14)
            buyUpgrade('r', 15)
            buyUpgrade('r', 16)
            buyUpgrade('r', 17)
            buyUpgrade('r', 21)
            buyUpgrade('r', 22)
        }
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('m',11)) mult = mult.times(3)
        if (hasUpgrade('m',17)) mult = mult.times(20)
        if (hasUpgrade('i', 12)) mult = mult.times(5)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "r", description: "R: Reset for rebirth points", onPress(){if (canReset(this.layer)) doReset(this.layer)}, unlocked() {return player['+'].points.gte(5)}},
    ],
    layerShown(){return player['+'].points.gte(5)}
})

addLayer("m", {
    name: "mega", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    branches: "r",
    color: "#F70",
    requires: new Decimal(100000), // Can be a function that takes requirement increases into account
    resource: "mega points", // Name of prestige currency
    baseResource: "rebirth points", // Name of resource prestige is based on
    baseAmount() {return player.r.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    upgrades: {
        11: {
            title: "More",
            description: "x3 rebirth and point gain",
            cost: new Decimal(1),
            unlocked() {return player['+'].points.gte(8)}
        },
        12: {
            title: "MORE POWER!!",
            description: "^1.04 point gain",
            cost: new Decimal(2),
            unlocked() {return player['+'].points.gte(8)}
        },
        13: {
            title: "Need to get that 10th addition!",
            description: "/100 addition req., and multiply points by mega points",
            style: function(){
                if (hasUpgrade(this.layer, this.id)) {
                    return {'background': 'linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(255,253,0,1) 14%, rgba(0,255,25,1) 28%, rgba(0,244,237,1) 47%, rgba(0,1,242,1) 61%, rgba(235,0,246,1) 79%, rgba(255,0,0,1) 100%)'}
                } else {
                    return
                }
            },
            effect() {
                return player.m.points.add(1).pow(0.5)
            },
            effectDisplay() {return 'x' + format(upgradeEffect(this.layer, this.id))},
            tooltip: "(megapoints+1)<sup>0.5</sup>",
            cost: new Decimal(25),
            unlocked() {return player['+'].points.gte(9)}
        },
        14: {
            title: "Automation",
            description: "Fully automate rebirth upgrades, gain 50% of rebirth points per second, and gain 150% of prestige points per second",
            cost: new Decimal(30),
            unlocked() {return player['+'].points.gte(9)}
        },
        15: {
            title: "Boom!",
            description: "x15 point gain",
            cost: new Decimal(10000),
            unlocked() {return player['+'].points.gte(10)}
        },
        16: {
            title: "OP, but with a twist...",
            description: "^1.02 point gain, but /15 mega gain",
            cost: new Decimal(50000),
            unlocked() {return player['+'].points.gte(10)}
        },
        17: {
            title: "OH MY GOODNESS",
            description: "x20 rebirth gain",
            cost: new Decimal(1e8),
            unlocked() {return player['+'].points.gte(10)}
        },
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('m', 16)) mult = mult.div(15)
        if (hasUpgrade('i', 12)) mult = mult.times(2)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    automate() {
        if (hasMilestone('u', 0)) {
            buyUpgrade('m', 11)
            buyUpgrade('m', 12)
            buyUpgrade('m', 13)
            buyUpgrade('m', 14)
            buyUpgrade('m', 15)
            buyUpgrade('m', 16)
            buyUpgrade('m', 17)
        }
    },
    passiveGeneration() {
        if (hasUpgrade('i', 12)) return 0.25
        return 0
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Reset for mega points", onPress(){if (canReset(this.layer)) doReset(this.layer)}, unlocked() {return player['+'].points.gte(8)}},
    ],
    layerShown(){return player['+'].points.gte(8)}
})

addLayer("u", {
    name: "ultra", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "U", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    branches: "m",
    color: "#F0F",
    requires: new Decimal(30e9), // Can be a function that takes requirement increases into account
    resource: "ultra points", // Name of prestige currency
    baseResource: "mega points", // Name of resource prestige is based on
    baseAmount() {return player.m.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.2, // Prestige currency exponent
    milestones: {
        0: {
            requirementDescription: "5 ultra points",
            effectDescription: "Automate mega upgrades!",
            done() { return player.u.points.gte(5) }
        }
    },
    upgrades: {
        11: {
            title: "Big boost",
            description: "x20 point gain",
            cost: new Decimal(1),
            unlocked() {return player['+'].points.gte(11)}
        },
        12: {
            title: "Scaling boost",
            description: "Multiply point gain by rebirth points",
            cost: new Decimal(3),
            effect() {
                return player.r.points.add(1).pow(0.06)
            },
            effectDisplay() {return 'x' + format(upgradeEffect(this.layer, this.id))},
            tooltip: "(rebirthpoints+1)<sup>0.06</sup>",
            unlocked() {return player['+'].points.gte(11)}
        },
        13: {
            title: "Oh, already?",
            description: "Autobuy the ultra buyable",
            cost: new Decimal(1e17),
            unlocked() {return player['+'].points.gte(15)}
        },
    },
    buyables: {
        11: {
            cost(x) { return new Decimal(2).mul(x.pow(2)).pow(15).pow(3).add(1) },
            title: "Ultra Buyable!",
            display() { return "Amount: " +  format(getBuyableAmount(this.layer, this.id).floor()) + "\nCost: " + format(this.cost().floor()) + " ultra points\nEffect: x" + format(this.effect()) + " point gain"},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() {
                return new Decimal(1).mul(this.cost().sub(1)).times(50 + (hasUpgrade('i', 16) ? -40 : 0)).pow(0.3).add(0.99).clampMin(1)
            },
            unlocked() {return player['+'].points.gte(12)}
        },
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('i', 13)) mult = mult.times(2)
        if (hasUpgrade('i', 15)) mult = mult.times(2)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    passiveGeneration() {
        if (player['+'].points.gte(18)) return player['p'].points.add(1).pow(0.0075).log(2)
        if (player['+'].points.gte(14)) return 0.01
        return 0
    },
    automate() {
        if (tmp['u'].buyables[11].canAfford && hasUpgrade("u", 13)) {
            addBuyables('u', 11, 1)
        }
        if (player['+'].points.gte(24)) {
            buyUpgrade('u', 11)
            buyUpgrade('u', 12)
            buyUpgrade('u', 13)
        }
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "u", description: "U: Reset for ultra points", onPress(){if (canReset(this.layer)) doReset(this.layer)}, unlocked() {return player['+'].points.gte(11)}},
    ],
    layerShown(){return player['+'].points.gte(11)}
})

addLayer("i", {
    name: "infinity", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "∞", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        omega: new Decimal(0)
    }},
    branches: "u",
    color: "#777",
    requires: new Decimal(50), // Can be a function that takes requirement increases into account
    resource: "infinities", // Name of prestige currency
    baseResource: "ultra points", // Name of resource prestige is based on
    baseAmount() {return player.u.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.1, // Prestige currency exponent
    tabFormat: {
        "Infinity": {
            content: [
                "main-display",
                "prestige-button",
                "resource-display",
                "blank",
                "upgrades"
            ],
        },
        "Omega": {
            content: [
                "main-display",
                "prestige-button",
                "resource-display",
                "blank",
                ["display-text", function() {return `<span>You have </span><h2 style="color: hsl(${(player.timePlayed * 15) % 360}, 100%, 50%); text-shadow: hsl(${(player.timePlayed * 15) % 360}, 100%, 50%) 0px 0px 10px;">${format(player['i'].omega)}</h2> omega</span>` }],
                ["display-text", function() {return `<span>You are gaining ${format(og)} omega per second</span>` }],
                ["display-text", function() {return `<span>You need 22 <span style=\"color: rgb(95, 111, 127); text-shadow: rgb(95, 111, 127) 0px 0px 10px;\">additions</span> to gain omega</span>` }],
                ["display-text", function() {return `<span>Omega gain is softcapped after 5000 omega; Currently x${format(omegaSC)} omega gain` }],
                ["display-text", function() {return `<span>Omega is boosting point gain by x${format(player['i'].omega.pow(0.05))}</span>` }]
            ],
            unlocked: function() {return player['+'].points.gte(22)}
        },
    },
    upgrades: {
        11: {
            title: "The infinity",
            description: "x50 point gain",
            cost: new Decimal(1),
            unlocked() {return player['+'].points.gte(19)}
        },
        12: {
            title: "Multi-boost",
            description: "x20 point gain, x10 prestige point gain, x5 rebirth point gain, x2 mega point gain, and you gain 25% mega points per second",
            cost: new Decimal(3),
            unlocked() {return player['+'].points.gte(19)}
        },
        13: {
            title: ":)",
            description: "x2 point gain",
            cost: new Decimal(5),
            unlocked() {return player['+'].points.gte(19)}
        },
        14: {
            title: "The final upgrade for v0.3",
            description: "Does something?",
            cost: new Decimal(10),
            unlocked() {return player['+'].points.gte(19)}
        },
        15: {
            title: "Exchange",
            description: "/2 infinity gain, x2 ultra gain",
            cost: new Decimal(25),
            unlocked() {return player['+'].points.gte(20)}
        },
        16: {
            title: "Exchange 2",
            description: "Nerf the ultra buyable, but x9 point gain",
            cost: new Decimal(150),
            unlocked() {return player['+'].points.gte(20)}
        },
        17: {
            title: "Nice",
            description: "x69,420 point gain<s>, oh, and win</s>",
            cost: new Decimal(200),
            unlocked() {return player['+'].points.gte(20)}
        },
        1001: {
            pay() {
                player['i'].omega = player['i'].omega.sub(10)
            },
            canAfford() {
                return player['i'].omega.gte(10)
            },
            unlocked() {return player['+'].points.gte(22)},
            fullDisplay() {return `<h3>Omega</h3><br>x2 omega gain<br><br>Cost: ${format(new Decimal(10))} omega` },
        },
        1002: {
            pay() {
                player['i'].omega = player['i'].omega.sub(150)
            },
            canAfford() {
                return player['i'].omega.gte(150)
            },
            unlocked() {return player['+'].points.gte(22)},
            fullDisplay() {return `<h3>Extraordinary</h3><br>x3 omega gain<br><br>Cost: ${format(new Decimal(150))} omega` },
        },
        1003: {
            pay() {
                player['i'].omega = player['i'].omega.sub(250)
            },
            canAfford() {
                return player['i'].omega.gte(250)
            },
            unlocked() {return player['+'].points.gte(22)},
            fullDisplay() {return `<h3>Round</h3><br>+4 omega gain<br><br>Cost: ${format(new Decimal(250))} omega` },
        },
        1004: {
            canAfford() {
                return player['i'].omega.gte(400)
            },
            unlocked() {return player['+'].points.gte(22)},
            fullDisplay() {return `<h3>Require</h3><br>x3 omega gain<br><br>Req: ${format(new Decimal(400))} omega` },
        },
    },
    update(diff) {
        let gain = new Decimal(0)
        if (player['+'].points.gte(22)) gain = new Decimal(1)
        if (hasUpgrade('i', 1001)) gain = gain.times(2)
        if (hasUpgrade('i', 1002)) gain = gain.times(3)
        if (hasUpgrade('i', 1003)) gain = gain.add(4)
        if (hasUpgrade('i', 1004)) gain = gain.times(3)
        if (player['+'].points.gte(23)) gain = gain.times(2)
        omegaSC = softcap(player['i'].omega, new Decimal(5000), 0.001).max(5000).minus(4999).pow(-1)
        gain = gain.times(omegaSC)
        og = gain
        player['i'].omega = player['i'].omega.add(gain.times(diff))
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('i', 15)) mult = mult.times(0.5)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "i", description: "I: Reset for infinities", onPress(){if (canReset(this.layer)) doReset(this.layer)}, unlocked() {return player['+'].points.gte(19)}},
    ],
    layerShown(){return player['+'].points.gte(19)}
})

addLayer("x", {
    name: "multiplier", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "×", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    branches: "r",
    color: "#F00",
    requires: new Decimal(50), // Can be a function that takes requirement increases into account
    resource: "multiplier", // Name of prestige currency
    baseResource: "rebirth points", // Name of resource prestige is based on
    baseAmount() {return player.r.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.1, // Prestige currency exponent
    tabFormat: {
        "Multiplier": {
            content: [
                "main-display",
                ["display-text", function() {return "You are gaining " + format(mg) + " multiplier per second"}],
                "blank",
                "upgrades"
            ],
        },
    },
    upgrades: {
        11: {
            title: "Multiplication",
            description: "x5 point and multiplier gain",
            cost: new Decimal(20),
            unlocked() {return player['+'].points.gte(25)}
        },
        12: {
            title: "Multiplication, but better",
            description: "x10 point and multiplier gain",
            cost: new Decimal(100),
            unlocked() {return player['+'].points.gte(25)}
        },
        13: {
            title: "Scaling Multiplier",
            description: "Multiply multiplier gain by multiplier",
            effect() {
                return player.x.points.add(1).pow(0.05)
            },
            effectDisplay() {return 'x' + format(upgradeEffect(this.layer, this.id))},
            tooltip: "(mult+1)<sup>0.05</sup>",
            cost: new Decimal(500),
            unlocked() {return player['+'].points.gte(25)}
        },
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    update(diff){
        let gain = new Decimal(0)
        if (player['+'].points.gte(25)) gain = gain.add(1)
        if (hasUpgrade('x', 11)) gain = gain.times(5)
        if (hasUpgrade('x', 12)) gain = gain.times(10)
        if (hasUpgrade('x', 13)) gain = gain.times(upgradeEffect('x', 13))
        mg = gain
        player['x'].points = player['x'].points.add(gain.times(diff))
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return player['+'].points.gte(25)}
})