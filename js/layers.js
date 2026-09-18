addLayer("px", {
    name: "pixels", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { 
        console.log("startData called for px");
        return {
            unlocked: true,
            points: new Decimal(0),
        }
    },
    color: "#4BDC13",
    requires: new Decimal(24), // Can be a function that takes requirement increases into account
    resource: "pixel points", // Name of prestige currency
    baseResource: "bits", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("px", 12)) mult = mult.times(2)
        if (hasUpgrade("px", 14)) mult = mult.times(2)
        if (hasUpgrade("px", 22)) mult = mult.times(2)
        if (hasUpgrade("px", 24)) mult = mult.times(2)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for pixel points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        if (hasUpgrade("mpx", 55)) return false;
        return true;
    },
    upgrades: {
        11: {
            title: "Bit Bang Theory",
            description: "Doubles your bit gain.",
            cost: new Decimal(2)
        },
        12: {
            title: "Pixel Potion",
            description: "Double your pixel point gain.",
            cost: new Decimal(3)
        },
        13: {
            title: "Bitstorm",
            description: "Doubles your bit gain.",
            cost: new Decimal(4)
        },
        14: {
            title: "8-Bit Energizer",
            description: "Double your pixel point gain.",
            cost: new Decimal(9)
        },
        21: {
            title: "Bit Buffet",
            description: "Doubles your bit gain.",
            cost: new Decimal(16)
        },
        22: {
            title: "Bitfinity and Beyond",
            description: "Double your pixel point gain.",
            cost: new Decimal(27)
        },
        23: {
            title: "Pixel Power-Up",
            description: "Doubles your bit gain.",
            cost: new Decimal(32)
        },
        24: {
            title: "Bit Booster Deluxe",
            description: "Double your pixel point gain.",
            cost: new Decimal(81)
        },
        15: {
            title: "Pixelator 9000",
            description: "Double your point gain.",
            cost: new Decimal(8)
        },
        25: {
            title: "Bitzilla",
            description: "Double your point gain.",
            cost: new Decimal(64)
        }
    },
})

addLayer("kpx", {
    name: "kilo pixels",
    symbol: "KPX",
    position: 0,
    startData() { 
        console.log("startData called for kpx");
        return {
            unlocked: false,
            points: new Decimal(0),
        }
    },
    color: "#FFD700",
    requires: new Decimal(1000),
    resource: "kilopixel points",
    baseResource: "pixel points",
    baseAmount() { return player.px.points },
    type: "normal",
    exponent: 0.5,
    
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("kpx", 12)) mult = mult.times(2)
        if (hasUpgrade("kpx", 14)) mult = mult.times(2)
        if (hasUpgrade("kpx", 22)) mult = mult.times(2)
        if (hasUpgrade("kpx", 24)) mult = mult.times(2)
        if (hasUpgrade("kpx", 31)) mult = mult.times(10)
        return mult
    },
    row: 1,
    branches: ["px"],
    layerShown() { 
        if (hasUpgrade("mpx", 55)) return false;
        if (!player.px.unlocked) return false;
        let upgrades = [11,12,13,14,15,21,22,23,24,25];
        for (let id of upgrades) {
            if (!hasUpgrade("px", id)) return false;
        }
        return true;
    },
    upgrades: {
        11: {
            title: "Double bit gain",
            description: "Doubles your bit gain.",
            cost: new Decimal(2)
        },
        12: {
            title: "Double kilo pixel point gain",
            description: "Doubles your pixel point gain.",
            cost: new Decimal(3)
        },
        13: {
            title: "Double bit gain",
            description: "Doubles your bit gain.",
            cost: new Decimal(4)
        },
        14: {
            title: "Double kilo pixel point gain",
            description: "Doubles your pixel point gain.",
            cost: new Decimal(9)
        },
        15: {
            title: "Double bit gain",
            description: "Doubles your bit gain.",
            cost: new Decimal(8)
        },
        21: {
            title: "Double bit gain",
            description: "Doubles your bit gain.",
            cost: new Decimal(16)
        },
        22: {
            title: "Double kilo pixel point gain",
            description: "Doubles your kilo pixel point gain.",
            cost: new Decimal(27)
        },
        23: {
            title: "Double bit gain",
            description: "Doubles your bit gain.",
            cost: new Decimal(32)
        },
        24: {
            title: "Double kilo pixel point gain",
            description: "Doubles your kilo pixel point gain.",
            cost: new Decimal(81)
        },
        25: {
            title: "Double bit gain",
            description: "Doubles your bit gain.",
            cost: new Decimal(64)
        },
        31: {
            title: "Boost",
            description: "Boost kilo pixel point gain",
            cost: new Decimal(250)
        }
    },
})

addLayer("mpx", {
    name: "mega pixels",
    symbol: "MPX",
    position: 0,
    startData() { 
        console.log("startData called for mpx");
        return {
            unlocked: false,
            points: new Decimal(0),
        }
    },
    color: "#FF4500",
    requires: new Decimal(1000),
    resource: "megapixel points",
    branches: ["kpx"],
    baseResource: "kilopixel points",
    baseAmount() { return player.kpx.points },
    type: "normal",
    exponent: 0.5,
    row: 2,
    layerShown() {
        if (hasUpgrade("mpx", 55)) return false;
        if (!player.kpx.unlocked) return false;
        let upgrades = [11,12,13,14,15,21,22,23,24,25,31];
        for (let id of upgrades) {
            if (!hasUpgrade("kpx", id)) return false;
        }
        return true;
    },
    upgrades: {
        55: {
            title: "SCREENS",
            description: "unlock something new",
            cost: new Decimal(2)
        }
    },
})

addLayer("Screen", {
    name: "Screen",
    symbol: "B",
    position: 0,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
    }},
    requires: new Decimal(8),
    color: "#FF4500",
    resource: "bytes",
    baseResource: "bits",
    baseAmount() { return player.points },
    type: "normal",
    exponent: 0.5,
    row: 0,
    gainMult() {
        let mult = new Decimal(1);
        mult = mult.times(buyableEffect("Screen", 11));
        if (hasUpgrade("Screen", 21)) mult = mult.times(2);
        if (hasUpgrade("Screen", 22)) mult = mult.times(2);
        if (hasUpgrade("kib", 12)) mult = mult.times(3);
        if (hasUpgrade("kb", 12)) mult = mult.times(3);
        return mult;
    },
    layerShown() {
        if (!player.mpx.unlocked) return false;
        let upgrades = [55];
        for (let id of upgrades) {
            if (!hasUpgrade("mpx", id)) return false;
        }
        return true;
    },
    milestones: {
        0: {
            requirementDescription: "Paper tape",
            effectDescription: "Screen layer is not reset(16384 bytes).",
            done() { return player.Screen.points.gte(16384) },
        },
        1: {
            requirementDescription: "IBM 305",
            effectDescription: "KiB and KB layers are not reset (5000000 bytes).",
            done() { return player.Screen.points.gte(5000000) },
        },
        2: {
            requirementDescription: "An old USB",
            effectDescription: "MB and MiB layers are not reset (5120000000 bytes).",
            done() { return player.Screen.points.gte(5120000000) },
        },
        3: {
            requirementDescription: "A modern Hard Drive",
            effectDescription: "GB, GiB, TB and TiB layers are not reset (1000000000000 bytes).",
            done() { return player.Screen.points.gte(1000000000000) },
        },
    },
    doReset(resettingLayer) {
        if (resettingLayer === this.layer) return; // Do not reset if resetting self
        if (hasMilestone("Screen", 0)) {
            player[this.layer].points = new Decimal(0);
            player.points = new Decimal(0);
        } else if (hasMilestone("Screen", 2) && (resettingLayer === "mb" || resettingLayer === "mib")) {
            return;
        } else if (hasMilestone("Screen", 3) && (resettingLayer === "gb" || resettingLayer === "gib" || resettingLayer === "tb" || resettingLayer === "tib")) {
            return;
        } else {
            layerDataReset(this.layer, []);
        }
    },
    upgrades: {
        11: {
            title: "Divide",
            description: "A new journey begins",
            cost: new Decimal(1)
        },
        12: {
            title: "Overclocked Bits",
            description: "Doubles your bit gain speed.",
            cost: new Decimal(8)
        },
        13: {
            title: "Turbo Bits v2.0",
            description: "Doubles your bit gain speed.",
            cost: new Decimal(64)
        },
        14: {
            title: "Bit Accelerator",
            description: "Doubles your bit gain speed.",
            cost: new Decimal(512)
        },
        21: {
            title: "MegaByte Madness",
            description: "Doubles your byte gain.",
            cost: new Decimal(16)
        },
        22: {
            title: "Byte Burst",
            description: "Doubles your byte gain.",
            cost: new Decimal(32)
        }
    },
    buyables: {
        11: {
cost(x) {
    if (!x) x = getBuyableAmount(this.layer, this.id);
    return new Decimal(4).pow(x).times(2);
},
            display() {
                let amount = getBuyableAmount(this.layer, this.id);
                let effect = this.effect();
                return "Double byte gain<br>Amount: " + amount + "<br>Cost: " + format(this.cost()) + " bytes<br>Effect: x" + format(effect);
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost());
            },
            buy() {
                if (this.canAfford()) {
                    player[this.layer].points = player[this.layer].points.sub(this.cost());
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
                }
            },
            effect(x) {
                if (!x) x = getBuyableAmount(this.layer, this.id);
                return Decimal.pow(2, x);
            },
            unlocked() {
                return true;
            },
        },
    },
})

// New kibibyte layer
addLayer("kib", {
    name: "kibibytes",
    symbol: "KiB",
    position: 0,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
        }
    },
    color: "#00CED1",
    requires: new Decimal(1024),
    resource: "kibibyte points",
    baseResource: "bytes",
    baseAmount() { return player.Screen.points },
    type: "normal",
    exponent: 0.5,
    row: 1,
    branches: ["Screen"],
    layerShown() {
        return hasUpgrade("Screen", 11);
    },
    gainMult() {
        let mult = new Decimal(1);
        if (hasUpgrade("kb", 11)) mult = mult.times(2);
        return mult;
    },
    doReset(resettingLayer) {
        if (resettingLayer === this.layer) return; // Do not reset if resetting self
        if (hasMilestone("Screen", 1)) {
            // Only reset points and player bits
            player[this.layer].points = new Decimal(0);
            player.points = new Decimal(0);
        } else {
            // Full reset of the layer
            layerDataReset(this.layer, []);
        }
    },
    upgrades: {
        11: {
            title: "Double kilobyte gain",
            description: "Doubles your kilobyte point gain.",
            cost: new Decimal(10)
        },
        12: {
            title: "Triple byte gain",
            description: "Triples your byte gain.",
            cost: new Decimal(20)
        },
        21: {
            title: "Quadruple bit gain speed",
            description: "Quadruples your bit gain speed.",
            cost: new Decimal(80)
        }
    },
})

// New kilobyte layer
addLayer("kb", {
    name: "kilobytes",
    symbol: "KB",
    position: 1,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
        }
    },
    color: "#1E90FF",
    requires: new Decimal(1000),
    resource: "kilobyte points",
    baseResource: "bytes",
    baseAmount() { return player.Screen.points },
    type: "normal",
    exponent: 0.5,
    row: 1,
    branches: ["Screen"],
    layerShown() {
        return hasUpgrade("Screen", 11);
    },
    gainMult() {
        let mult = new Decimal(1);
        if (hasUpgrade("kib", 11)) mult = mult.times(2);
        return mult;
    },
    doReset(resettingLayer) {
        if (resettingLayer === this.layer) return; // Do not reset if resetting self
        if (hasMilestone("Screen", 1)) {
            // Only reset points and player bits
            player[this.layer].points = new Decimal(0);
            player.points = new Decimal(0);
        } else {
            // Full reset of the layer
            layerDataReset(this.layer, []);
        }
    },
    upgrades: {
        11: {
            title: "Double kibibyte gain",
            description: "Doubles your kibibyte point gain.",
            cost: new Decimal(10)
        },
        12: {
            title: "Triples byte gain",
            description: "Triples your byte gain.",
            cost: new Decimal(20)
        },
        21: {
            title: "Quadruple bit gain speed",
            description: "Quadruples your bit gain speed.",
            cost: new Decimal(80)
        }
    },
})

// New mebibyte layer
addLayer("mib", {
    name: "mebibytes",
    symbol: "MiB",
    position: 0,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
        }
    },
    color: "#20B2AA",
    requires: new Decimal(1024), // 2^20 bytes
    resource: "mebibyte points",
    baseResource: "kibibyte points",
    baseAmount() { return player.kib.points },
    type: "normal",
    exponent: 0.5,
    row: 2,
    branches: ["kib"],
    layerShown() {
        return hasUpgrade("Screen", 11);
    },
    upgrades: {
        11: {
            title: "Double megabyte gain",
            description: "Doubles your megabyte point gain.",
            cost: new Decimal(10)
        },
        12: {
            title: "Double bit gain speed",
            description: "Doubles your bit gain speed.",
            cost: new Decimal(20)
        },
        21: {
            title: "Quadruple bit gain speed",
            description: "Quadruples your bit gain speed.",
            cost: new Decimal(40)
        }
    },
})

addLayer("mb", {
    name: "megabytes",
    symbol: "MB",
    position: 1,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
        }
    },
    color: "#4169E1",
    requires: new Decimal(1000), // 10^6 bytes
    resource: "megabyte points",
    baseResource: "kilobyte points",
    baseAmount() { return player.kb.points },
    type: "normal",
    exponent: 0.5,
    row: 2,
    branches: ["kb"],
    layerShown() {
        return hasUpgrade("Screen", 11);
    },
    gainMult() {
        let mult = new Decimal(1);
        if (hasUpgrade("mib", 11)) mult = mult.times(2);
        return mult;
    },
    upgrades: {
        11: {
            title: "Double mebibyte gain",
            description: "Doubles your mebibyte point gain.",
            cost: new Decimal(10)
        },
        12: {
            title: "Double bit gain speed",
            description: "Doubles your bit gain speed.",
            cost: new Decimal(20)
        },
        21: {
            title: "Triple mebibyte gain",
            description: "Triples your mebibyte point gain.",
            cost: new Decimal(40)
        }
    },
})

// New gibibyte layer
addLayer("gib", {
    name: "gibibytes",
    symbol: "GiB",
    position: 0,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
        }
    },
    color: "#008080",
    requires: new Decimal(1024), // 2^30 bytes
    resource: "gibibyte points",
    baseResource: "mebibyte points",
    baseAmount() { return player.mib.points },
    type: "normal",
    exponent: 0.5,
    row: 3,
    branches: ["mib"],
    layerShown() {
        return hasUpgrade("Screen", 11);
    },
    upgrades: {
    },
})

addLayer("gb", {
    name: "gigabytes",
    symbol: "GB",
    position: 1,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
        }
    },
    color: "#00008B",
    requires: new Decimal(1000), // 10^9 bytes
    resource: "gigabyte points",
    baseResource: "megabyte points",
    baseAmount() { return player.mb.points },
    type: "normal",
    exponent: 0.5,
    row: 3,
    branches: ["mb"],
    layerShown() {
        return hasUpgrade("Screen", 11);
    },
    upgrades: {
    },
})

// New terabyte layer
addLayer("tb", {
    name: "terabytes",
    symbol: "TB",
    position: 1,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
        }
    },
    color: "#4B0082",
    requires: new Decimal(1000), // 10^12 bytes
    resource: "terabyte points",
    baseResource: "gigabyte points",
    baseAmount() { return player.gb.points },
    type: "normal",
    exponent: 0.5,
    row: 4,
    branches: ["gb"],
    layerShown() {
        return hasUpgrade("Screen", 11);
    },
    upgrades: {
        11: {
            title: "Upgrade 11",
            description: "An upgrade for terabytes.",
            cost: new Decimal(1)
        }
    },
})

// New tebibyte layer
addLayer("tib", {
    name: "tebibytes",
    symbol: "TiB",
    position: 0,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
        }
    },
    color: "#483D8B",
    requires: new Decimal(1024), // 2^40 bytes
    resource: "tebibyte points",
    baseResource: "gibibyte points",
    baseAmount() { return player.gib.points },
    type: "normal",
    exponent: 0.5,
    row: 4,
    branches: ["gib"],
    layerShown() {
        return hasUpgrade("Screen", 11);
    },
    upgrades: {
        11: {
            title: "Upgrade 11",
            description: "An upgrade for tebibytes.",
            cost: new Decimal(1)
        }
    },
})

addLayer("computingPower", {
    name: "Computing Power",
    symbol: "CP",
    position: 0,
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
        }
    },
    color: "#800080",
    requires: new Decimal(1000),
    resource: "bytes",
    baseResource: "bytes",
    baseAmount() { return player.Screen.points },
    type: "normal",
    exponent: 0.5,
    row: 5,
    branches: ["tb", "tib"],
    layerShown() {
        return player.tb.unlocked && player.tib.unlocked;
    },
    upgrades: {
        11: {
            title: "Computing Upgrade",
            description: "An upgrade for computing power.",
            cost: new Decimal(1)
        }
    }
})
