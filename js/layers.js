addLayer("d", {
    branches: ["c"],
    name: "dots", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FFFFFF",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "dots", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        mult = mult.times( Math.pow(2,player.l.points))
        if (hasUpgrade("l", 11)) mult = mult.times( Math.pow(2,player.l.points))
        if (hasUpgrade("l", 12)) mult = mult.times( upgradeEffect("l", 12) )
        if (hasUpgrade("l", 13)) mult = mult.times( upgradeEffect("l", 13) )
        if (player.p.unlocked) { mult = mult.times(clickableEffect("p",52)) }
        if (hasUpgrade("c", 12)) mult = mult.times( 100000 )
        if (hasUpgrade("l", 14)) mult = mult.times( 10 )
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "d", description: "D: Reset for dots", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgradespecialstuff() {

     if (hasUpgrade("d",51)) {player.points = player.points.times(1000)}
     if (hasUpgrade("d",52)) {player.points = player.points.times(10000)}
     if (hasUpgrade("d",53)) {player.points = player.points.times(1000000)}

},
    upgrades: {
        11: {
            description: "Point gain increased based on dots.",
            title: "0 dimensional recursion",
            cost: new Decimal(1),
            effect(){ 
                get = new Decimal(Math.log10(player.d.points + 1)).divide(2).add(1)
                if (hasUpgrade("d", 12)) get = (get * upgradeEffect("d", 12) )
                if (clickableEffect("c",12) > 1) get = (get * clickableEffect("c",12))
                if (buyableEffect("v",13) > 1) get = (get * buyableEffect("v",13))
                if (get > 1e6) {get = 1000000 + (Math.pow(get-1000000,0.5))}
                if (get > 1e9) {get = new Decimal(1e9)}
                if (format(get) == "NaN") { get = new Decimal(1e9) }
                return get
            },
            effectDisplay() { return format(this.effect())+"x" }

            
        },
        12: {
            description: "The previous upgrade's effect is doubled.",
            title: "Dual core",
            cost: new Decimal(4),
            effect(){
            get = new Decimal(2)
            if (get > 2) {get = 2}
            if (get = "Infinity") {get = 2}
            if (get = "NaN") {get = 2}
            return get
            },
            effectDisplay() { return "x" + format(this.effect()) },
            unlocked() {return hasUpgrade("d", 11)}
        },
        13: {
            description: "Points increase point gain.",
            title: "Virus",
            cost: new Decimal(6),
            effect(){
                get = Math.log10(player.points + 10)+1
                if (hasUpgrade("d", 15)) get = Math.pow(get,2)
                if (get > 50) {get = 50}
            //    if (get = "Infinity") {get = 50}
            //    if (get = "NaN") {get = 50}
                return get
            },
            effectDisplay() { return "x" + format(this.effect()) },
            unlocked() {return hasUpgrade("d", 12)}
        },
        14: {
            description: "Squares the effect of Learn to zoom in",
            title: "Dual dual core",
            cost: new Decimal(25000),
            effect(){return new Decimal(2)},
            effectDisplay() { return "^" + format(this.effect()) },
            unlocked() {return hasUpgrade("d", 13)}
        },
        15: {
            description: "Virus^2",
            title: "Infectivity increase",
            cost: new Decimal(1000000),
            effect(){return new Decimal(2)},
            effectDisplay() { return "^" + format(this.effect()) },
            unlocked() {return hasUpgrade("d", 14)}
        },
        16: {
            description: "Point gain x 666",
            title: "The 6th",
            cost: new Decimal(6e6),
            effect(){return new Decimal(666)},
            effectDisplay() { return "x" + format(this.effect()) },
            unlocked() {return hasUpgrade("d", 15)}
        },
        17: {
            description: "line price scaling / 2 and unlock a new layer",
            title: "Repurpose some of the line",
            cost: new Decimal(1e9),
            effect(){
                return new Decimal(2)
            },
            effectDisplay() { return "/" + format(this.effect()) },
            unlocked() {return hasUpgrade("d", 16)}
        },
        51: {
            description: "",
            title: "Your first ascension",
            cost: new Decimal(1e15),
            effect(){
                return new Decimal(1)
            },
            effectDisplay() { return "..." },
            unlocked() {if (player.d.points > 1e14) {if (player.a.unlocked) {return false} else {return true}}}
        },
        52: {
            description: "",
            title: "Ascension #2",
            cost: new Decimal(2.5e22),
            effect(){
                return new Decimal(1)
            },
            effectDisplay() { return "..." },
            unlocked() {if (player.d.points > 1e20) {if (hasMilestone("a",1)) {return false} else {return true}}}
        },
        53: {
            description: "",
            title: "Ascension #3",
            cost: new Decimal(5e33),
            effect(){
                return new Decimal(1)
            },
            effectDisplay() { return "..." },
            unlocked() {if (player.d.points > 1e30) {if (hasMilestone("a",2)) {return false} else {return true}}}
        },
    },
    passiveGeneration() {if (hasMilestone("a",1)) { return 0.1 }},
    autoUpgrade() {return hasMilestone("v",0)},
    
})
addLayer("c", {
    branches: [""],
    name: "Dot Centrifuge", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#FFFFFF",
    requires: new Decimal(1e9), // Can be a function that takes requirement increases into account
    resource: "Centrifuge Essence", // Name of prestige currency
    baseResource: "dots", // Name of resource prestige is based on
    baseAmount() {return player.d.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.3, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (clickableEffect("c",14)>1) {mult = mult.times(clickableEffect("c",14))}
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Reset for Centrifuge Essence", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){if (hasUpgrade("d", 17)) {return true} else {return player.a.unlocked}},
    automate() {

        if (hasMilestone("l",0)) {setBuyableAmount("c",11,getBuyableAmount("c",11).add(1))}

    },
    upgrades: {
        11: {
            description: "Unlock A-Matter",
            title: "A fourth state of matter",
            cost: new Decimal(5e6),
            effect(){
                get = new Decimal(1)
                return get
            },
            effectDisplay() { return "idk" },
            unlocked() { return getBuyableAmount("cb",11)>0 }
        },
        12: {
            description: "100000x dot gain for no reason in particular",
            title: "Dot boost",
            cost: new Decimal(1e8),
            effect(){
                get = new Decimal(500)
                return get
            },
            effectDisplay() { return "500x" },
            unlocked() { return player.cb.points > 2 }
        },
    },
    buyables: {
        11: {
            cost(x) { return new Decimal(1).add(getBuyableAmount("c",11)) },
            title() {return "Sacrifice your Centrifugal Essence for matter"},
            display() { return "you have: " + format(getBuyableAmount("c",11))},
            canAfford() { return player[this.layer].points.gte(this.cost(getBuyableAmount("c",11))) },
            buy() {
                if (hasMilestone("l",0)) {  } else {player[this.layer].points = player[this.layer].points.sub(this.cost())}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        21: {
            cost(x) { return new Decimal("1e9999999999") },
            title() {return ""},
            display() { return "red matter"},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
            },
            unlocked() {return false}
        },
        22: {
            cost(x) { return new Decimal("1e9999999999") },
            title() {return ""},
            display() { return "green matter"},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
            },
            unlocked() {return false}
        },
        23: {
            cost(x) { return new Decimal("1e9999999999") },
            title() {return ""},
            display() { return "blue matter"},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
            },
            unlocked() {return false}
        },
        24: {
            cost(x) { return new Decimal("1e9999999999") },
            title() {return ""},
            display() { return "alpha matter"},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
            },
            unlocked() {return false}
        },
    },
    clickables: {
        11: {
            title() {return "R-Matter"},
            display() {return "you have: " + format(getBuyableAmount("c",21)) + ". Current effect: " + format(clickableEffect("c",11)) + "x ???'s effect"},
            effect() {
                get = new Decimal(Math.pow(getBuyableAmount("c",21),0.5)+1)
                if (buyableEffect("v",12) > 1) { get = get.times(buyableEffect("v",12)) }
                if (player.p.unlocked) {get = get.times(clickableEffect("p",54))}
                return get
            },
        },
        12: {
            title() {return "G-Matter"},
            display() {return "you have: " + format(getBuyableAmount("c",22)) + ". Current effect: " + format(clickableEffect("c",12)) + "x 0 dimensional recursion's effect"},
            effect() {
                get = new Decimal(Math.pow(getBuyableAmount("c",22),0.5)+1);
                if (buyableEffect("v",12) > 1) { get = get.times(buyableEffect("v",12)) }
                if (player.p.unlocked) {get = get.times(clickableEffect("p",54))}
                return get
            },
        },
        13: {
            title() {return "B-Matter"},
            display() {return "you have: " + format(getBuyableAmount("c",23)) + ". Current effect: " + format(clickableEffect("c",13)) + "x point gain."},
            effect() {
                get = new Decimal(Math.pow(getBuyableAmount("c",23),0.5)+1)
                if (buyableEffect("v",12) > 1) { get = get.times(buyableEffect("v",12)) }
                if (player.p.unlocked) {get = get.times(clickableEffect("p",54))}
                return get
                },
        },
        14: {
            title() {return "A-Matter"},
            display() {return "you have: " + format(getBuyableAmount("c",24)) + ". Current effect: " + format(clickableEffect("c",14)) + "x Centrifuge Essence gain."},
            effect() {
                get = new Decimal(Math.pow(getBuyableAmount("c",24),0.5)+1)
                if (player.p.unlocked) {get = get.times(50)}
                return get
                },
                unlocked() {return hasUpgrade("c",11)},
        },
    },
    getMatterGen() {

        if (getBuyableAmount("c",11) > 0) {setBuyableAmount("c",21,getBuyableAmount("c",21).add(getBuyableAmount("c",11).divide(getBuyableAmount("c",21).add(1).divide(getBuyableAmount("c",11).times(getBuyableAmount("c",11))))))}
        
        if (getBuyableAmount("c",21) > 0) {setBuyableAmount("c",22,getBuyableAmount("c",22).add(Math.log10(getBuyableAmount("c",21).add(1))/300))}
        if (getBuyableAmount("c",22) > 0) {setBuyableAmount("c",23,getBuyableAmount("c",23).add(Math.log10(getBuyableAmount("c",22).add(1))/300))}
        if (getBuyableAmount("c",23) > 0) {setBuyableAmount("c",21,getBuyableAmount("c",21).add(Math.log10(getBuyableAmount("c",23).add(1))/300))}
        if (hasUpgrade("c",11)) {if (getBuyableAmount("c",23) > 0) {setBuyableAmount("c",24,getBuyableAmount("c",24).add(Math.log10(getBuyableAmount("c",23).add(1))/300))}}
        if (player.p.unlocked) {
        if (getBuyableAmount("c",11) > (5000 * clickableEffect("p",55))-1) {setBuyableAmount("c",11,new Decimal((5000 * clickableEffect("p",55))-1))}
        } else {
        if (getBuyableAmount("c",11) > 4999) {setBuyableAmount("c",11,new Decimal(4999))}
        }
    },
    passiveGeneration() {if (hasMilestone("v",1)) { return 1 }}
},
)
addLayer("l", {
    branches: ["d"],
    name: "lines", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "L", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: -1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FFFFFF",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "lines", // Name of prestige currency
    baseResource: "dots", // Name of resource prestige is based on
    baseAmount() {return player.d.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 2, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        mult = mult.divide(buyableEffect("v",11))
        if (player.p.unlocked) {mult = mult.divide(clickableEffect("p",51))}
        if (getBuyableAmount("cb",21)>0) {mult = mult.divide(Math.log10(Math.pow(player.p.points,4)+10))}
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        if (hasUpgrade("d", 17)) { exp = new Decimal(1.2) } else { exp = new Decimal(1) }
        return exp
    },
    row: 1 + 0,
    hotkeys: [
        {key: "l", description: "L: Reset for lines", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    canBuyMax() { return hasMilestone("a",0)},
    layerShown(){return true},
    upgrades: {
        11: {
            description: "Dot gain is increased based on lines again.",
            title: "1 dimensional recursion",
            cost: new Decimal(2),
            effect(){
                get = new Decimal(Math.pow(2,player.l.points))
                return get
            },
            effectDisplay() { return format(this.effect())+"x" }
        },
        12: {
            description: "There are an infinite number of dots on a line so dot gain x log10(dots).",
            title: "Learn to zoom in",
            cost: new Decimal(3),
            unlocked() {return hasUpgrade("l", 11)},
            effect(){
                get = new Decimal(Math.log10(player.d.points + 1)+1)
                if (hasUpgrade("d", 14)) {get = Math.pow(get,2)}
                if (get > 1000) {get = new Decimal(1000)}
                if (format(get) == "NaN") {get = new Decimal(1000)}
                return get
            },
            effectDisplay() { return format(this.effect())+"x" }
        },
        13: {
            description: "There is a smaller, identical dot in every dot so dot gain x 1000",
            title: "Zoom into a dot",
            cost: new Decimal(7),
            unlocked() {return hasUpgrade("l", 12)},
            effect(){
                get = new Decimal(1000)
                return get
            },
            effectDisplay() { return format(this.effect())+"x" }
        },
        14: {
            description: "10x dots",
            title: "Reminder to use the cosmic branching sometimes",
            cost: new Decimal(13),
            unlocked() {return hasUpgrade("c", 12)},
            effect(){
                get = new Decimal(10)
                return get
            },
            effectDisplay() { return format(this.effect())+"x" }
        },

    },
    milestones: {
        0: {
            requirementDescription: "10 lines",
            effectDescription: "Auto-buy matter which costs nothing.",
            done() { if (player.l.points > 9) {return true} else {return false} },
            unlocked() {return hasMilestone("v",1)},
        },
        1: {
            requirementDescription: "12 lines",
            effectDescription: "Unlock the cosmic branching.",
            done() { if (player.l.points > 11) {return true} else {return false} },
            unlocked() {return hasMilestone("a",1)},
        },
    },
    stuffs() {
        player.l.resetsNothing = hasMilestone("p",0);
    },
    
    autoPrestige() {return hasMilestone("p",0)},

})
addLayer("a", {
    branches: ["p","l","c"],
    name: "ascension", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#FFE400",
    requires: new Decimal(1e100), // Can be a function that takes requirement increases into account
    resource: "tokens", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
    row: 3,
    hotkeys: [
        {key: "a", description: "A: Ascend if possible", onPress(){if (canReset(this.layer)) doReset(this.layer); layerDataReset(this.layer, "points");}},
    ],
    fixstats() {
        if (player.points > 1e100) player.points = new Decimal(1e100)
        if (player.d.points > 1e100) player.d.points = new Decimal(1e100)
        if (player.c.points > 1e100) player.c.points = new Decimal(1e100)
        if (player.l.points > 1e100) player.l.points = new Decimal(1e100)
        if (getBuyableAmount("c",21) > 1e100) setBuyableAmount("c",21,1e100)
        if (getBuyableAmount("c",22) > 1e100) setBuyableAmount("c",22,1e100)
        if (getBuyableAmount("c",23) > 1e100) setBuyableAmount("c",23,1e100)
        player.v.unlocked = true;
    },
    layerShown(){return true},
    upgrades: {
        11: {
            description: "Unlock the village.",
            title: "Village",
            cost: new Decimal(1),
            effect(){
                get = new Decimal(1)
                return get
            },
            effectDisplay() { if (hasUpgrade("a",11)) {return "Active"} else {return "Inactive"} }
        },
        12: {
            description: "Unlock polytopes.",
            title: "Polytopes",
            cost: new Decimal(2),
            effect(){
                get = new Decimal(1)
                return get
            },
            effectDisplay() { if (hasUpgrade("a",12)) {return "Active"} else {return "Inactive"} },
            unlocked() {return hasUpgrade("a",11)}

        },
        13: {
            description: "TBD.",
            title: "TBD",
            cost: new Decimal(3),
            effect(){
                get = new Decimal(1)
                return get
            },
            effectDisplay() { if (hasUpgrade("a",12)) {return "Active"} else {return "Inactive"} },
            unlocked() {return hasUpgrade("a",11)}

        },
    },
    layerShown(){if (player.points > 9e99) {return true} else {if (hasUpgrade("a",11)) {return true} else {return false}}},
    milestones: {
        0: {
            requirementDescription: "1 Ascension",
            effectDescription: "You can buy max lines.",
            done() { return player.a.points > 0 },
            onComplete() { player.l.canMax = true}
        },
        1: {
            requirementDescription: "2 Ascensions",
            effectDescription: "You gain 10% of dot gain every second.",
            done() { return player.a.points > 1 },
        },
        2: {
            requirementDescription: "3 Ascensions",
            effectDescription: "TBD",
            done() { return player.a.points > 2 },
        },
    }
})
addLayer("v", {
    branches: ["p","l","c"],
    name: "village", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "V", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(1),
    }},
    color: "#A25B00",
    requires: new Decimal(50), // Can be a function that takes requirement increases into account
    resource: "villagers", // Name of prestige currency
    baseResource: "Centrifuge Essence", // Name of resource prestige is based on
    baseAmount() {return player.c.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 2, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
    row: 3,
    hotkeys: [
        {key: "v", description: "V: Reset for villagers", onPress(){if (canReset(this.layer)) {doReset(this.layer)}}},
    ],
    layerShown(){return hasUpgrade("a",11)},
    upgrades: {

    },
    resetsNothing: true,
    doReset(resettingLayer) { if (resettingLayer = "a") {return false} else {return true}},
    layerShown(){if (hasUpgrade("a",11)) {return true} else {return false}},
    buyables: {
        11: {
            cost(x) { return new Decimal(1) },
            title() {return "Miners"},
            display() { return "You have " + format(getBuyableAmount("v",11)) + " Miners, And " + format(getBuyableAmount("v",51)) + " minerals." + "<br> Currently: Multipling line gain by " + format(buyableEffect("v",11))},
            canAfford() { return new Decimal(getBuyableAmount("v",11).add(getBuyableAmount("v",12)).add(getBuyableAmount("v",13))) < player.v.points },
            buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() {

                return new Decimal(Math.pow(getBuyableAmount("v",51)+1,0.5))

            }
        },
        51: {
            cost(x) { return new Decimal("1e9999") },
            title() {return "Mineral data holder."},
            display() { return "You are not supposed to see this!"},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {},
            unlocked() {return false}
        },
        12: {
            cost(x) { return new Decimal(1) },
            title() {return "Loggers"},
            display() { return "You have " + format(getBuyableAmount("v",12)) + " Loggers, And " + format(getBuyableAmount("v",52)) + " wood." + "<br> Currently: Multipling all matter's effect by " + format(buyableEffect("v",12))},
            canAfford() { return new Decimal(getBuyableAmount("v",11).add(getBuyableAmount("v",12)).add(getBuyableAmount("v",13))) < player.v.points },
            buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() {

                return new Decimal(Math.pow(getBuyableAmount("v",52)+1,0.5))

            }
        },
        52: {
            cost(x) { return new Decimal("1e9999") },
            title() {return "Wood data holder."},
            display() { return "You are not supposed to see this!"},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {},
            unlocked() {return false}
        },
        13: {
            cost(x) { return new Decimal(1) },
            title() {return "Hunters"},
            display() { return "You have " + format(getBuyableAmount("v",13)) + " Hunters, And " + format(getBuyableAmount("v",53)) + " leather." + "<br> Currently: Multipling 0 dimensional recursion effect by " + format(buyableEffect("v",13))},
            canAfford() { return new Decimal(getBuyableAmount("v",11).add(getBuyableAmount("v",12)).add(getBuyableAmount("v",13))) < player.v.points },
            buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() {

                return new Decimal(Math.pow(getBuyableAmount("v",53)+1,0.7))

            }
        },
        53: {
            cost(x) { return new Decimal("1e9999") },
            title() {return "Leather data holder."},
            display() { return "You are not supposed to see this!"},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {},
            unlocked() {return false}
        },
        
    },
    resourcegen() {
        if (player.p.unlocked) {
        setBuyableAmount("v",51, getBuyableAmount("v",51).add(getBuyableAmount("v",11).divide(30).times(clickableEffect("p",53))))
        setBuyableAmount("v",52, getBuyableAmount("v",52).add(getBuyableAmount("v",12).divide(30).times(clickableEffect("p",53))))
        setBuyableAmount("v",53, getBuyableAmount("v",53).add(getBuyableAmount("v",13).divide(30).times(clickableEffect("p",53))))
        } else {
            setBuyableAmount("v",51, getBuyableAmount("v",51).add(getBuyableAmount("v",11).divide(30)))
            setBuyableAmount("v",52, getBuyableAmount("v",52).add(getBuyableAmount("v",12).divide(30)))
            setBuyableAmount("v",53, getBuyableAmount("v",53).add(getBuyableAmount("v",13).divide(30)))
        }

    },
    milestones: {
        0: {
            requirementDescription: "100 Minerals",
            effectDescription: "Auto-buy dot upgrades.",
            done() { if (getBuyableAmount("v",51) > 100) {return true} else {return false} }
        },
        1: {
            requirementDescription: "3 Villagers",
            effectDescription: "Gain 100% of Centrifuge Essence gain per second.",
            done() { if (player.v.points > 2) {return true} else {return false} }
        },
        2: {
            requirementDescription: "6 Villagers",
            effectDescription: "A-Matter also affects point gain.",
            done() { if (player.v.points > 6) {return true} else {return false} }
        },
    },
    clickables: {
        11: {
            title() {return "Respec villagers"},
            canClick() {return true},
            onClick() {setBuyableAmount("v",11,new Decimal(0));setBuyableAmount("v",12,new Decimal(0));setBuyableAmount("v",13,new Decimal(0)),setBuyableAmount("v",51,new Decimal(0));setBuyableAmount("v",52,new Decimal(0));setBuyableAmount("v",53,new Decimal(0))},
            display() {return "Warning: This will reset Minerals, Wood, and Leather."}
        }
    }
})
addLayer("p", {
    branches: ["d"],
    name: "polytopes", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#7CFF78",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "polytopes", // Name of prestige currency
    baseResource: "lines", // Name of resource prestige is based on
    baseAmount() {return player.l.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 2, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
    row: 2,
    hotkeys: [
        {key: "p", description: "P: Reset for polytopes", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("a",12)},
    upgrades: {
        11: {
            description: "Unlock some new dot stuff.",
            title: "Some new dot stuff",
            cost: new Decimal("1e1e55"),
            effect(){
                get = new Decimal(1)
                return get
            },
            effectDisplay() { return format(this.effect())+"x" },
            unlocked() {return false},
        },
    },
    milestones: {
        0: {
            requirementDescription: "WHY ARE THERE NO UPGRADES HERE!?!? (1 polytope)",
            effectDescription: "Line gain is automatic.",
            done() { if (player.p.points > 0) {return true} else {return false} }
        },
    },
    infoboxes: {
        polyeffect: {
            title: "Polytope effects.",
            body() { return "Line cost / " + format(clickableEffect("p",51)) + "<br> Dot gain x " + format(clickableEffect("p",52)) + "<br> Village material gain x " + format(clickableEffect("p",53)) + "<br> Matter effects x " + format(clickableEffect("p",54)) + "<br> Regular matter cap x " + format(clickableEffect("p",55))},
        },
    },
    getpolyeffects(){

        if (currentpolytope = 1) {}
        
    },
    clickables: {
        11: {
            title() {return "Change polytope."},
            canClick() {return true},
            onClick() {setClickableState("p",11,1 + getClickableState("p",11)); if (getClickableState("p",11) > 5) {setClickableState("p",11,1)}; if (getClickableState("p",11) < 1) {setClickableState("p",11,1)}},
            display() {return "Currently type " + format(getClickableState("p",11))},
            unlocked() {return true},
        },
        51: {
            title() {return "polyeff1"},
            effect() {
                get = new Decimal(1)
                if (getClickableState("p",11) == 1) { get = new Decimal(100) }
                if (getClickableState("p",11) == 2) {get = new Decimal(1) }
                if (getClickableState("p",11) == 3) {get = new Decimal(1) }
                if (getClickableState("p",11) == 4) {get = new Decimal(2) }
                if (getClickableState("p",11) == 5) {get = new Decimal(500) }
                if (getClickableState("p",11) == 0) {get = new Decimal(1) }
                return get
            },
            canClick() {return false},
            unlocked() {return false}
        },
        52: {
            title() {return "polyeff2"},
            effect() {
                get = new Decimal(1)
                if (getClickableState("p",11) == 1) {get = new Decimal(1) }
                if (getClickableState("p",11) == 2) {get = new Decimal(10) }
                if (getClickableState("p",11) == 3) {get = new Decimal(1) }
                if (getClickableState("p",11) == 4) {get = new Decimal(2) }
                if (getClickableState("p",11) == 5) {get = new Decimal(0.5) }
                if (getClickableState("p",11) == 0) {get = new Decimal(1) }
                return get
            },
            canClick() {return false},
            unlocked() {return false}
        },
        53: {
            title() {return "polyeff3"},
            effect() {
                get = new Decimal(1)
                if (getClickableState("p",11) == 1) {get = new Decimal(50) }
                if (getClickableState("p",11) == 2) {get = new Decimal(1) }
                if (getClickableState("p",11) == 3) {get = new Decimal(150) }
                if (getClickableState("p",11) == 4) {get = new Decimal(2) }
                if (getClickableState("p",11) == 5) {get = new Decimal(0.5) }
                if (getClickableState("p",11) == 0) {get = new Decimal(1) }
                return get
            },
            canClick() {return false},
            unlocked() {return false}
        },
        54: {
            title() {return "polyeff4"},
            effect() {
                get = new Decimal(1)
                if (getClickableState("p",11) == 1) {get = new Decimal(1) }
                if (getClickableState("p",11) == 2) {get = new Decimal(100) }
                if (getClickableState("p",11) == 3) {get = new Decimal(100) }
                if (getClickableState("p",11) == 4) {get = new Decimal(2) }
                if (getClickableState("p",11) == 5) {get = new Decimal(0.5) }
                if (getClickableState("p",11) == 0) {get = new Decimal(1) }
                return get
            },
            canClick() {return false},
            unlocked() {return false}
        },
        55: {
            title() {return "polyeff5"},
            effect() {
                get = new Decimal(1)
                if (getClickableState("p",11) == 1) {get = new Decimal(1) }
                if (getClickableState("p",11) == 2) {get = new Decimal(2) }
                if (getClickableState("p",11) == 3) {get = new Decimal(1) }
                if (getClickableState("p",11) == 4) {get = new Decimal(2) }
                if (getClickableState("p",11) == 5) {get = new Decimal(1) }
                if (getClickableState("p",11) == 0) {get = new Decimal(1) }
                return get
            },
            canClick() {return false},
            unlocked() {return false}
        },

    }
})
addLayer("cb", {
    branches: ["p","l","c"],
    name: "Cosmic Branching", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "CB", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#B900FF",
    requires: new Decimal(1e25), // Can be a function that takes requirement increases into account
    resource: "cosmic seeds", // Name of prestige currency
    baseResource: "dots", // Name of resource prestige is based on
    baseAmount() {return player.d.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 3, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
    row: 3,
    hotkeys: [
        {key: "b", description: "B: Embrace the Cosmic Branching", onPress(){if (canReset(this.layer)) doReset(this.layer); layerDataReset(this.layer, "points");}},
    ],
    buyables: {
        11: {
            cost(x) { return new Decimal(2) },
            title() { return "Centrifuge Enhancement" },
            display() { return "Unlock a centrifuge essence upgrade <br> requirement: 2" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            purchaseLimit: 1,
        },
        31: {
            cost(x) { return new Decimal(4) },
            title() { return "3 Dimensional Recursion" },
            display() { return "The third dimension boosts the first (polytopes boost lines). Also 1000x points. <br> requirement: 4" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            purchaseLimit: 1,
            branches: ["11"]
        },
    },
    layerShown(){if (hasMilestone("l",1)) {return true} else {if (player.cb.points > 0) {return true} else { if (getBuyableAmount("cb",11)>0) {return true} else {return false} }}},
})