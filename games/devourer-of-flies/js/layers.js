addLayer("w", {
    name: "wings", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "W", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#b8b8b8",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "wings", // Name of prestige currency
    baseResource: "flies", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('w', 14)) mult = mult.times(upgradeEffect('w', 14))
        if (hasUpgrade('w', 21)) mult = mult.times(2);
        if (hasMilestone('f',2) && !inChallenge('h', 12)) mult = mult.times(3)
        if (hasUpgrade('m',11)) mult = mult.times(5)
        if (hasUpgrade('m', 14)&& !inChallenge('h', 31)) mult = mult.times(upgradeEffect('m', 14));
        if (hasUpgrade('m', 24)&& !inChallenge('h', 31)) mult = mult.times(upgradeEffect('m', 24));
        mult = mult.times(Decimal.pow(6, player.v.points));
        if (hasUpgrade('e', 11)) mult = mult.times(100);
        if (hasUpgrade('f', 23)) mult = mult.times(upgradeEffect('f', 23));
        if (hasUpgrade('e', 31)) mult = mult.times(upgradeEffect('e', 31));
        if (hasUpgrade('u', 23)) mult = mult.times(upgradeEffect('u', 23));
        if (hasUpgrade('vi', 26)) mult = mult.times(upgradeEffect('vi', 26));
        if (hasChallenge('h', 11)) {
            mult = mult.pow(challengeEffect('h', 11))
        }
        if (hasUpgrade('m', 42)) mult = mult.times(upgradeEffect('m', 42));
        if (hasChallenge('h', 22)) {
            mult = mult.pow(challengeEffect('h', 22))
        };
        if (inChallenge('h', 31)) {
            mult = mult.pow(0.5)
        };
        if (inChallenge('h', 42)) {
            mult = mult.pow(0.1)
        };
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    passiveGeneration(){if (hasMilestone('f',4) && !hasMilestone('m',1) && !hasUpgrade('e',11)){
        return 0.01
    } else if(hasMilestone('m',1) || hasUpgrade('e',11)){
        return 1
    }
    return 0},
    row: 0, // Row the layer is in on the tree (0 is the first row)

    autoUpgrade(){
        return hasMilestone('m', 2)
    },

    doReset(resettingLayer) {
        let keep = [];

        if(hasMilestone('p',1)) keep.push("upgrades");
        if(hasUpgrade('e',11)) keep.push("upgrades");

        if(layers[resettingLayer].row > this.row) {
            layerDataReset("w",keep)
        }
    },
    
    upgrades: {
        11: {
            title: "Bit flies!",
            description: "Double your Flies eaten.",
            cost: new Decimal(1),
        },

        12: {
            title: "Salty flies!",
            description: "1.5x flies eaten",
            cost: new Decimal(3),
            unlocked() { return hasUpgrade("w", 11) },
        },

        13: {
            title: "Sweet flies!",
            description: "Wings eaten boost flies eaten",
            cost: new Decimal(5),
            effect() {
                let eff = player[this.layer].points.add(1).pow(0.5);
                eff = softcap(eff,new Decimal(1000),0.4)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            unlocked() { return hasUpgrade("w", 12) },
        },

        14: {
            title: "Spicy flies!",
            description: "flies eaten boost wings eaten",
            cost: new Decimal(10),
            effect() {
                let eff = player.points.add(1).pow(0.15);
                eff = softcap(eff,new Decimal(1000),0.4);
                return eff
            },

            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            unlocked() { return hasUpgrade("w", 13) },
        },

        21: {
            title: "Fried flies!",
            description: "Double your wings eaten.",
            cost: new Decimal(15),
            unlocked() { return hasUpgrade("w", 14) },
        },

        22: {
            title: "Boiled flies!",
            description: "Triple your flies eaten.",
            cost: new Decimal(50),
            unlocked() { return hasUpgrade("w", 21) },
        },

        23: {
            title: "Stewed flies!",
            description: "Wings eaten boost flies eaten, again",
            cost: new Decimal(150),
            effect() {
                let eff = player[this.layer].points.add(1).pow(0.3);
                eff = softcap(eff,new Decimal(1000),0.4);
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            unlocked() { return hasUpgrade("w", 22) },
        },

        24: {
            title: "Roasted flies!",
            description: "Flies eaten boost flies eaten, again",
            cost: new Decimal(1000),
            effect() {
                return player.points.add(1).pow(0.2)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            unlocked() { return hasUpgrade("w", 23) },
        },

        },
    hotkeys: [
        {key: "w", description: "W: Tear flies for wings", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true}
})

addLayer("f", {
    name: "farms", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "F", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#52432eff",
    branches: ["w"],
    requires: new Decimal("1e5"), // Can be a function that takes requirement increases into account
    resource: "farms", // Name of prestige currency
    baseResource: "flies", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 2, // Prestige currency exponent
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("f", 13) && !inChallenge('h', 12)) {
            mult = mult.div(upgradeEffect("f", 13))
        }
        if (hasUpgrade("m", 23)) {
            mult = mult.div(upgradeEffect("m", 23))
        }
        if (hasUpgrade("m", 43)) {
            mult = mult.div(upgradeEffect("m", 43))
        }
        if (hasUpgrade("f", 15)) {
            mult = mult.div(upgradeEffect("f", 15))
        }
        if (hasUpgrade("m", 54)) {
            mult = mult.div(upgradeEffect("m", 54))
        }
        if (hasUpgrade("m", 61)) {
            mult = mult.div(upgradeEffect("m", 61))
        }
        if (hasUpgrade('e', 11)) mult = mult.div(100);
        mult = mult.div(Decimal.pow(6, player.v.points));
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    canBuyMax() {
        return hasMilestone('m', 3)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    autoPrestige(){return hasChallenge('h', 12) || hasUpgrade('e',11)},
    resetsNothing(){return hasChallenge('h', 12) || hasUpgrade('e',11)},

    milestones : {
        1: {
            requirementDescription:"1 Fly Farm",
            effectDescription: "x4 Flies eaten",
            done() {return player.f.points.gte(1)}
        },
        2: {
            requirementDescription:"2 Fly Farm",
            effectDescription: "x3 Wings",
            done() {return player.f.points.gte(2)},
            unlocked() { return hasMilestone("f",1) },
        },
        3: {
            requirementDescription:"4 Fly Farm",
            effectDescription: "Unlock Poop. A good source of food for flies",
            done() {return player.f.points.gte(4)},
            unlocked() { return hasMilestone("f",2) },
        },
        4: {
            requirementDescription:"5 Fly Farm",
            effectDescription: "Generate 1% of wings you would gain on tearing flies",
            done() {return player.f.points.gte(5)},
            unlocked() { return hasMilestone("f",3) },
        },
        5: {
            requirementDescription:"10 Fly Farm",
            effectDescription: "Unlock Metabolism reset",
            done() {return player.f.points.gte(10)},
            unlocked() { return hasUpgrade("f",13) },
        },
    },
    doReset(resettingLayer) {
        let keep = [];

        if(hasMilestone('m',5)) keep.push("upgrades");
        if(hasMilestone('m',5)) keep.push("milestones");
        if(hasUpgrade('e',11)) keep.push("upgrades");
        if(hasUpgrade('e',11)) keep.push("milestones");

        if(layers[resettingLayer].row > this.row) {
            layerDataReset("f",keep)
        }
    },

    upgrades: {
        11:{
            title: "Flies superfood",
            description: "Fly Farms boost flies eaten",
            effect() {
                return player.f.points.add(1).pow(3)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            cost: new Decimal(6),
            unlocked() { return hasMilestone("f",4) },
        },
        12:{
            title: "More nutrious Poop",
            description: "Farms boost Poop",
            effect() {
                return player.f.points.add(1).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            cost: new Decimal(7),
            unlocked() { return hasUpgrade("f",11) },
        },
        13:{
            title: "Flies make it cheap",
            description: "Flies reduce fly farms requirement",
            effect() {
                return player.points.add(1).pow(0.1)
            },
            effectDisplay() { return "/" + format(upgradeEffect(this.layer, this.id))+"x" }, 
            cost: new Decimal(8),
            unlocked() { return hasUpgrade("f",12) },
        },
        14:{
            title: "You missed them",
            description: "Farms Boost Flies",
            effect() {
                return player.f.points.add(1).pow(10)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            cost: new Decimal(39),
            unlocked() { return hasUpgrade("m",51) },
        },
        15:{
            title: "Farming in habitats",
            description: "Habitats reduce requirement of farms",
            effect() {
                return player.h.points.add(1).pow(35)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            cost: new Decimal(42),
            unlocked() { return hasUpgrade("f",14) },
        },
        21:{
            title: "Breeding Flies",
            description: "Flies boost itself",
            effect() {
                return player.points.add(1).pow(0.03)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            cost: new Decimal(44),
            unlocked() { return hasUpgrade("f",15) },
        },
        22:{
            title: "Fly selection",
            description: "Flies boost poop",
            effect() {
                return player.points.add(1).pow(0.02)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            cost: new Decimal(47),
            unlocked() { return hasUpgrade("f",21) },
        },
        23:{
            title: "Hybrid flies",
            description: "Flies boost wings further",
            effect() {
                return player.points.add(1).pow(0.03)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            cost: new Decimal(66),
            unlocked() { return hasUpgrade("f",22) },
        },
        24:{
            title: "Overcrowded flies",
            description: "Flies boost itself further",
            effect() {
                return player.points.add(1).pow(0.027)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            cost: new Decimal(71),
            unlocked() { return hasUpgrade("f",23) },
        },
        25:{
            title: "Fat flies",
            description: "Habitats Boost Poop",
            effect() {
                return player.h.points.add(1).pow(30)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            cost: new Decimal(74),
            unlocked() { return hasUpgrade("f",24) },
        },
    },
    hotkeys: [
        {key: "f", description: "f: Make a fly farm", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.w.unlocked},
})

addLayer("p", {
    name: "poop", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#613901",
    requires: new Decimal("1e4"), // Can be a function that takes requirement increases into account
    resource: "poop", // Name of prestige currency
    baseResource: "wings", // Name of resource prestige is based on
    baseAmount() {return player.w.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.3, // Prestige currency exponent
    branches: ["w"],
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
        if (hasUpgrade('f', 12) && !inChallenge('h', 12)) mult = mult.times(upgradeEffect("f",12));
        if (hasUpgrade('m', 13)&& !inChallenge('h', 31)) mult = mult.times(upgradeEffect("m",13));
        if (hasUpgrade('m', 11)) mult = mult.times(2);
        if (hasUpgrade('m', 22)) mult = mult.times(5);
        if (hasUpgrade('m', 24)) mult = mult.times(upgradeEffect("m",24));
        if (hasChallenge('h', 21)) mult = mult.pow(1.02);
        if (hasUpgrade('f', 22)) mult = mult.times(upgradeEffect("f",22));
        mult = mult.times(Decimal.pow(6, player.v.points));
        if (hasUpgrade('m', 52)) mult = mult.times(upgradeEffect("m",52));
        if (hasUpgrade('m', 53)) mult = mult.times(upgradeEffect("m",53));
        if(hasMilestone('v',3)) mult = mult.times(milestoneEffect("v",3));
        if (hasUpgrade('m', 62)) mult = mult.times(upgradeEffect("m",62));
        if (hasUpgrade('f', 25)) mult = mult.times(upgradeEffect("f",25));
        if (hasUpgrade('m', 71)) mult = mult.times(upgradeEffect("m",71));
        if (hasUpgrade('e', 11)) mult = mult.times(100);
        if (hasUpgrade('e', 71)) mult = mult.times(upgradeEffect("e",71));
        if (hasUpgrade('u', 13)) mult = mult.times(upgradeEffect("u",13));
        if (hasUpgrade('e', 91)) mult = mult.times(upgradeEffect("e",91));
        if (hasUpgrade('e', 92)) mult = mult.times(upgradeEffect("e",92));
        if (hasUpgrade('e', 93)) mult = mult.times(upgradeEffect("e",93));
        if (hasUpgrade('e', 94)) mult = mult.times(upgradeEffect("e",94));
        if (hasUpgrade('vi', 13)) mult = mult.times(upgradeEffect("vi",13));
        if (hasUpgrade('vi', 22)) mult = mult.times(upgradeEffect("vi",22));
        if (hasUpgrade('e', 111)) mult = mult.times(upgradeEffect("e",111));
        if (inChallenge('h', 31)) {
            mult = mult.pow(0.5)
        };
        if (inChallenge('h', 42)) {
            mult = mult.pow(0.1)
        };
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    effect() {
        if(!inChallenge('h', 21) && !inChallenge('h',41)){
            let eff = player.p.points.add(1).pow(0.9);
            
            eff = softcap(eff,new Decimal("1e278"),0.4);
            return eff
        }
		
	},
	effectDescription() {
        if(!inChallenge('h', 21) && !inChallenge('h',41)){
            if(player.p.points.gte("1.79e308")){
                return "which are boosting flies eaten by "+format(tmp.p.effect) + "x (softcapped)"
            };
            return "which are boosting flies eaten by "+format(tmp.p.effect) + "x"
        } else {
            if(inChallenge('h', 21)) {
                return "Poop is useless in desert"
            } else if(inChallenge('h', 41)) {
                return "Poop is frozen in pole"
            }
            
        }
		
	},
    passiveGeneration(){return hasChallenge("h",21) || hasUpgrade('e',11)},
    row: 1, // Row the layer is in on the tree (0 is the first row)

    milestones: {
        1: {
            requirementDescription:"200 Poop",
            effectDescription: "Keep Fly upgrades on Farm and Poop Reset",
            done() {return player.p.points.gte(200)},
        },
    },

    buyables: {
    11: {
        title: "Feed Flies",
        cost(x = getBuyableAmount(this.layer, this.id)) {
            return new Decimal(100).mul(Decimal.pow(1.8, x))
        },
        purchaseLimit: 100,
        effect(x = getBuyableAmount(this.layer, this.id)) {
            return Decimal.pow(2, x)
        },
        display() {
            return `Cost: ${format(this.cost())}\nBought: ${getBuyableAmount(this.layer, this.id)}/100\nEffect: ${format(this.effect())}x`
        },
        canAfford() {
            return player.p.points.gte(this.cost()) && getBuyableAmount(this.layer, this.id).lt(this.purchaseLimit)
        },
        buy() {
            player.p.points = player.p.points.sub(this.cost())
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        buyMax() {
            if (!this.canAfford()) return

            let current = getBuyableAmount(this.layer, this.id)
            let base = new Decimal(100)
            let growth = new Decimal(1.8)


            let maxAffordable = player.p.points.div(base).log(growth).add(1).floor()
            let targetLevel = Decimal.min(maxAffordable, this.purchaseLimit)

            if (targetLevel.gt(current)) {
                setBuyableAmount(this.layer, this.id, targetLevel)
            }
        }
}
    },
    update(diff) {
        if (hasMilestone('m', 4)) {
            if (layers.p.buyables[11].canAfford()) {
                layers.p.buyables[11].buyMax()
            }
        }
    },
    doReset(resettingLayer) {
        let keep = [];
        if(hasUpgrade('e',11)) keep.push("milestones");

        if(layers[resettingLayer].row > this.row) {
            layerDataReset("p",keep)
        }
    },
    hotkeys: [
        {key: "p", description: "P: Make compost to feed some flies", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasMilestone("f",3)}
})

addLayer("m", {
    name: "metabolism", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0)
    }},
    color: "#0eac00",
    requires: new Decimal("1e5"), // Can be a function that takes requirement increases into account
    resource: "enzymes", // Name of prestige currency
    baseResource: "poop", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.3, // Prestige currency exponent
    branches: ["f"],
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1);
        if(hasUpgrade("m", 21)) mult = mult.times(2);
        if(hasUpgrade('m', 31)) mult = mult.times(upgradeEffect("m",31));
        if(hasUpgrade('m', 33)) mult = mult.times(upgradeEffect("m",33));
        if(hasUpgrade('m', 34)) mult = mult.times(upgradeEffect("m",34));
        if (hasChallenge('h', 22)) {
            mult = mult.times(10)
        };
        if(hasUpgrade('m', 44)) mult = mult.times(upgradeEffect("m",44));
        if(hasMilestone('v',2)) mult = mult.times(milestoneEffect("v",2));
        mult = mult.times(Decimal.pow(6, player.v.points));
        if(hasUpgrade('m', 64)) mult = mult.times(upgradeEffect("m",64));
        if(hasChallenge('h', 32)) mult = mult.pow(1.01);
        if(hasUpgrade("m", 72)) mult = mult.times(1e7);
        if (hasUpgrade('e', 11)) mult = mult.times(100);
        if (hasUpgrade('e', 22)) mult = mult.times(upgradeEffect("e",22));
        if (hasUpgrade('e', 42)) mult = mult.times(1e10);
        if (hasUpgrade('e', 63)) mult = mult.times(upgradeEffect("e",63));
        if (hasUpgrade('e', 72)) mult = mult.times(upgradeEffect("e",72));
        if (hasUpgrade('e', 14)) mult = mult.times(upgradeEffect("e",14));
        if (hasUpgrade('u', 17)) mult = mult.times(upgradeEffect("u",17));
        if (hasUpgrade('e', 84)) mult = mult.times(upgradeEffect("e",84));
        if (hasUpgrade('e', 95)) mult = mult.times(upgradeEffect("e",95));
        if (hasUpgrade('e', 104)) mult = mult.times(upgradeEffect("e",104));
        return mult
    },
    
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    // effect() {
	// 	return player.p.points.add(1).pow(0.9)
	// },
	// effectDescription() {
	// 	return "which are boosting flies eaten by "+format(tmp.p.effect) + "x"
	// },
    // passiveGeneration(){return hasMilestone("f",1)},
    row: 2, // Row the layer is in on the tree (0 is the first row)
    passiveGeneration(){if (hasChallenge('h',31) && !hasUpgrade('e',51)){
        return 0.0001
    } else if(hasUpgrade('e',51)){
        return 1
    }
    return 0},

    addPoints(gain) {
        player.m.points = player.m.points.add(gain)
        player.m.total = player.m.total.add(gain)
    },

    doReset(resettingLayer) {
        let keep = [];

        if (hasUpgrade("e", 73)) keep.push("upgrades");
            

        if(layers[resettingLayer].row > this.row) {
            layerDataReset("m",keep)
        }
    },

    milestones: {
        1: {
            requirementDescription:"1 Total Enzyme",
            effectDescription: "Gain 100% of wings on reset, You've been waiting for this",
            done() {return player.m.total.gte(1)},
        },
        2: {
            requirementDescription:"3 Total Enzyme",
            effectDescription: "Autobuy Wings upgrades",
            done() {return player.m.total.gte(3)},
            unlocked() { return hasMilestone("m",1) },
        },
        3: {
            requirementDescription:"5 Total Enzyme",
            effectDescription: "Buy Max Fly Farms",
            done() {return player.m.total.gte(5)},
            unlocked() { return hasMilestone("m",2) },
        },
        4: {
            requirementDescription:"25 Total Enzyme",
            effectDescription: "Autobuy Poop buyable, Don't buy it when it's automated",
            done() {return player.m.total.gte(25)},
            unlocked() { return hasMilestone("m",3) },
        },
        5: {
            requirementDescription:"400 Total Enzyme",
            effectDescription: "Keep Farms Milestones and upgrades on reset",
            done() {return player.m.total.gte(400)},
            unlocked() { return hasMilestone("m",4) },
        },
        6: {
            requirementDescription:"5e6 Total Enzyme",
            effectDescription: "You are ready to move on, Unlock habitats",
            done() {return player.m.total.gte(5e6)},
            unlocked() { return hasMilestone("m",5) },
        },
    },

    upgrades:{
        11: {
            title: "Protease",
            description: "10x Flies, 5x wings, 2x Poop",
            cost: new Decimal(1),
        },
        12: {
            title: "Amilase",
            description: "Total enzymes boost flies eaten",
            effect() {
                let eff = player.m.total.add(1)
                eff = softcap(eff,new Decimal(1e100),0.4)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            cost: new Decimal(2),
            unlocked() { return hasUpgrade("m", 11) },
        },
        13: {
            title: "Chitinase",
            description: "Total enzymes boost poop",
            effect() {
                return player.m.total.add(1).pow(0.4)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            cost: new Decimal(4),
            unlocked() { return hasUpgrade("m", 12) },
        },
        14: {
            title: "Lipase",
            description: "Total Enzymes boost wings",
            effect() {
                return player.m.total.add(1).pow(0.6)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            cost: new Decimal(8),
            unlocked() { return hasUpgrade("m", 13) },
        },
        21: {
            title: "Pepsin",
            description: "2x Enzymes",
            cost: new Decimal(20),
            unlocked() { return hasUpgrade("m", 14) },
        },
        22: {
            title: "Lactase",
            description: "5x Poop",
            cost: new Decimal(50),
            unlocked() { return hasUpgrade("m", 21) },
        },
        23: {
            title: "Trypsin",
            description: "Reduce Farm requirements based on enzymes",
            cost: new Decimal(200),
            effect() {
                return player.m.points.add(1).pow(0.4)
            },
            effectDisplay() { return "/" + format(upgradeEffect(this.layer, this.id))+"x" }, 
            unlocked() { return hasUpgrade("m", 22) },
        },
        24: {
            title: "Sucrase",
            description: "Poop boosts wings",
            cost: new Decimal(1000),
            effect() {
                return player.p.points.add(1).pow(0.1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            unlocked() { return hasUpgrade("m", 23) },
        },
        31: {
            title: "Papain",
            description: "Farms Boost enzymes",
            cost: new Decimal("1e4"),
            effect() {
                return player.f.points.add(1).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            unlocked() { return hasUpgrade("m", 24) },
        },
        32: {
            title: "Bromelaine",
            description: "Habitats Boost Flies Greatly",
            cost: new Decimal("1e9"),
            effect() {
                return player.h.points.add(1).pow(20)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            unlocked() { return hasChallenge("h", 12) },
        },
        33: {
            title: "I ran out of Enzymes names",
            description: "Enzymes boost itself",
            cost: new Decimal("1e10"),
            effect() {
                return player.m.points.add(1).pow(0.1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            unlocked() { return hasUpgrade("m", 32) },
        },
        34: {
            title: "Prolactine",
            description: "Flies boost enzyme on a reduced rate",
            cost: new Decimal("3e12"),
            effect() {
                return player.points.add(1).pow(0.01)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            unlocked() { return hasUpgrade("m", 33) },
        },
        41: {
            title: "Testosterone",
            description: "Wings Boost itself on a reduced rate",
            cost: new Decimal("2e15"),
            effect() {
                return player.w.points.add(1).pow(0.05)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            unlocked() { return hasUpgrade("m", 34) },
        },
        42: {
            title: "Cortisol",
            description: "Habitats Boost Wings",
            cost: new Decimal("5e18"),
            effect() {
                return player.h.points.add(1).pow(15)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            unlocked() { return hasUpgrade("m", 41) },
        },
        43: {
            title: "Adrenaline",
            description: "Flies reduce Farm requirement again",
            cost: new Decimal("1e22"),
            effect() {
                return player.points.add(1).pow(0.03)
            },
            effectDisplay() { return "/" + format(upgradeEffect(this.layer, this.id))+"x" }, 
            unlocked() { return hasUpgrade("m", 42) },
        },
        44: {
            title: "Noradrenaline",
            description: "Flies Boost enzymes gain",
            cost: new Decimal("1e30"),
            effect() {
                return player.points.add(1).log10()
            },
            effectDisplay() { return player.points.add(1).log10()+"x" }, 
            unlocked() { return hasUpgrade("m", 43) },
        },
        51: {
            title: "Estrogen",
            description: "Unlock a new set of Farm Upgrades",
            cost: new Decimal("1e40"),
            unlocked() { return hasUpgrade("m", 44) },
        },
        52: {
            title: "Glycogen",
            description: "Farms boost poop further",
            cost: new Decimal("1e93"),
            effect() {
                return player.f.points.add(1).pow(5)
            },
            effectDisplay() { return format(player.f.points.add(1).pow(5))+"x" }, 
            unlocked() { return hasMilestone("v", 1) },
        },
        53: {
            title: "Titin",
            description: "Habitats boost poop",
            cost: new Decimal("1e119"),
            effect() {
                return player.f.points.add(1).pow(7)
            },
            effectDisplay() { return format(player.f.points.add(1).pow(7))+"x" }, 
            unlocked() { return hasUpgrade("m", 52) },
        },
        54: {
            title: "HCl",
            description: "Farm reduce their own requirement",
            cost: new Decimal("4e137"),
            effect() {
                return player.f.points.add(1).pow(29)
            },
            effectDisplay() { return format(this.effect())+"x" }, 
            unlocked() { return hasUpgrade("m", 53) },
        },
        61: {
            title: "Catalase",
            description: "Poop reduces farms requirements",
            cost: new Decimal("1e158"),
            effect() {
                return player.p.points.add(1).pow(0.1)
            },
            effectDisplay() { return format(this.effect())+"x" }, 
            unlocked() { return hasUpgrade("m", 54) },
        },
        62: {
            title: "Antiprotease",
            description: "Farms boost Poop",
            cost: new Decimal("5e158"),
            effect() {
                return player.f.points.add(1).pow(20)
            },
            effectDisplay() { return format(this.effect())+"x" }, 
            unlocked() { return hasUpgrade("m", 61) },
        },
        63: {
            title: "Antilipase",
            description: "Enzymes boost flies",
            cost: new Decimal("1e188"),
            effect() {
                return player.m.points.add(1).pow(0.3)
            },
            effectDisplay() { return format(this.effect())+"x" }, 
            unlocked() { return hasUpgrade("m", 62) },
        },
        64: {
            title: "Antiamilase",
            description: "Enzymes boost itself at a super reduced rate",
            cost: new Decimal("2e195"),
            effect() {
                return player.m.points.add(1).pow(0.05)
            },
            effectDisplay() { return format(this.effect())+"x" }, 
            unlocked() { return hasUpgrade("m", 63) },
        },
        71: {
            title: "Antiachitinase",
            description: "Enzymes boost poop at a reduced rate",
            cost: new Decimal("2e251"),
            effect() {
                return player.m.points.add(1).pow(0.15)
            },
            effectDisplay() { return format(this.effect())+"x" }, 
            unlocked() { return hasUpgrade("m", 64) },
        },
        72: {
            title: "Evolutinaze",
            description: "x1e7 enzymes",
            cost: new Decimal("1e300"),
            unlocked() { return hasUpgrade("m", 71) },
        },
        
    },


    hotkeys: [
        {key: "m", description: "M: Digest your flies for enzymes", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasMilestone('f', 5) || player.m.total.gte(1)},
})

addLayer("h", {
    name: "habitat", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "H", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#8d6c00",
    requires: new Decimal("1e70"), // Can be a function that takes requirement increases into account
    resource: "habitats", // Name of prestige currency
    baseResource: "wings", // Name of resource prestige is based on
    baseAmount() {return player.w.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.5, // Prestige currency exponent
    base:5e15,
    branches: ["f","p"],
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1);
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    // effect() {
	// 	return player.p.points.add(1).pow(0.9)
	// },
	// effectDescription() {
	// 	return "which are boosting flies eaten by "+format(tmp.p.effect) + "x"
	// },
    // passiveGeneration(){return hasMilestone("f",1)},
    row: 2, // Row the layer is in on the tree (0 is the first row)
    canBuyMax() {
        return hasUpgrade('e', 22)
    },



    doReset(resettingLayer) {
        let keep = [];

        if (resettingLayer == "e" && hasUpgrade("e", 52)) {
            keep.push("challenges");
            keep.push("challengeData");
            keep.push("milestones");
        };
        if (resettingLayer == "u" && hasUpgrade("e", 52)) {
            keep.push("challenges");
            keep.push("challengeData");
            keep.push("milestones");
        };
        if (resettingLayer == "vi" && hasUpgrade("e", 52)) {
            keep.push("challenges");
            keep.push("challengeData");
            keep.push("milestones");
        };

        if(layers[resettingLayer].row > this.row) {
            layerDataReset("h",keep)
        }
    },

    autoPrestige(){return hasUpgrade('e',52)},
    resetsNothing(){return hasUpgrade('e',52)},

    milestones: {
        1: {
            requirementDescription:"1 Habitat",
            effectDescription: "Unlock Temperate Forest Challenge",
            done() {return player.h.points.gte(1)},
        },
        2: {
            requirementDescription:"2 Habitats",
            effectDescription: "Unlock Steppe Challenge",
            done() {return player.h.points.gte(2)},
            unlocked() { return player.h.points.gte(1) },
        },
        3: {
            requirementDescription:"3 Habitats",
            effectDescription: "Unlock Desert Challenge",
            done() {return player.h.points.gte(3)},
            unlocked() { return player.h.points.gte(2) },
        },
        4: {
            requirementDescription:"4 Habitats",
            effectDescription: "Unlock Rainforest Challenge",
            done() {return player.h.points.gte(4)},
            unlocked() { return player.h.points.gte(3) },
        },
        5: {
            requirementDescription:"5 Habitats",
            effectDescription: "Unlock Tundra Challenge",
            done() {return player.h.points.gte(5)},
            unlocked() { return player.h.points.gte(4) },
        },
        6: {
            requirementDescription:"6 Habitats",
            effectDescription: "Unlock Death Valley Challenge",
            done() {return player.h.points.gte(6)},
            unlocked() { return player.h.points.gte(5) },
        },
        7: {
            requirementDescription:"7 Habitats",
            effectDescription: "Unlock Pole Challenge, this one will be very hard",
            done() {return player.h.points.gte(7)},
            unlocked() { return player.h.points.gte(6) },
        },
        8: {
            requirementDescription:"17 Habitats",
            effectDescription: "Unlock Volcano Challenge, Last challenge before Evolution",
            done() {return player.h.points.gte(17)},
            unlocked() { return player.h.points.gte(7) },
        },
    },

    challenges: {
        11: {
            name: "Temperate Forest",
            challengeDescription: "The mild climate dampens wing speed. Fly eating is raised to ^0.75.",
            unlocked() { return player.h.points.gte(1) },
            goalDescription: "Reach 1e38 Wings",
            canComplete() { return player.w.points.gte(1e38) },
            rewardDescription: "^1.01 Flies and Wings",
            rewardEffect() { return new Decimal(1.01) },
        },
        12: {
            name: "Steppe",
            challengeDescription: "Strong winds sweep away fly farm productivity. Fly Farms are useless",
            unlocked() { return player.h.points.gte(2) },
            goalDescription: "Reach 1e85 Wings",
            canComplete() { return player.w.points.gte("1e85") },
            rewardDescription: "Unlocks new Metabolism Upgrades and Automate Fly Farms and they reset nothing",
        },
        21: {
            name: "Desert",
            challengeDescription: "Extreme heat depletes resources. Poop is useless",
            unlocked() { return player.h.points.gte(3) },
            goalDescription: "Reach 1e84 Wings",
            canComplete() { return player.w.points.gte("1e84") },
            rewardDescription: "Generate 100% of poop on reset and ^1.02 poop",
        },
        22: {
            name: "Rainforest",
            challengeDescription: "Dense foliage hampers movement. Flies eaten is square rooted",
            unlocked() { return player.h.points.gte(4) },
            goalDescription: "Reach 1e75 Wings",
            canComplete() { return player.w.points.gte(1e75) },
            rewardDescription: "^1.03 Flies,Wings, 10x Enzymes",
            rewardEffect() { return new Decimal(1.03) },
        },
        31: {
            name: "Tundra",
            challengeDescription: "Freezing temperatures slow biological activity. ^0.5 Flies,Poop,Wings Enzyme upgrades 12,13,14,24 Do not work",
            unlocked() { return player.h.points.gte(5) },
            goalDescription: "Reach 1e22 Wings",
            canComplete() { return player.w.points.gte(1e22) },
            rewardDescription: "Passively generates 0.01% of Enzyme per second.",
        },
        32: {
            name: "Death Valley",
            challengeDescription: "Scorching, barren, and unforgiving. Flies ^0.1 and poop buyable is disabled.",
            unlocked() { return player.h.points.gte(6) },
            goalDescription: "Reach 1e17 Flies",
            canComplete() { return player.points.gte(1e17) },
            rewardDescription: "^1.01 Enzymes",
        },
        41: {
            name: "Pole",
            challengeDescription: "Sub-zero blizzard freeze poop and wings making them useless. Poop and Wings are useless also flies are ^0.2",
            unlocked() { return player.h.points.gte(7) },
            goalDescription: "Reach 1e80 Wings",
            canComplete() { return player.w.points.gte(1e80) },
            rewardDescription: "Unlock Varieties of Flies",
        },
        42: {
            name: "Volcano",
            challengeDescription: "Extreme pressure and magma. ^0.05 Flies,  ^0.1 Wings,Poop",
            unlocked() { return player.h.points.gte(17) },
            goalDescription: "Reach 5e33 Wings",
            canComplete() { return player.w.points.gte("5e33") },
            rewardDescription: "Unlock Evolution reset at 1.79e308 Enzymes. ^1.05 Flies",
            rewardEffect() { return new Decimal(1.05) },
        },
    },


    hotkeys: [
        {key: "h", description: "H: Move to another habitat", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasMilestone('m', 6) || player.h.points.gte(1)},
})

addLayer("v", {
    name: "varieties", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "V", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "rgb(196, 183, 7)",
    branches: ["p"],
    requires: new Decimal("50"), // Can be a function that takes requirement increases into account
    resource: "varieties", // Name of prestige currency
    baseResource: "farms", // Name of resource prestige is based on
    baseAmount() {return player.f.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1, // Prestige currency exponent
    base: 1.149,
    gainMult() {
        let mult = new Decimal(1);
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    effect() {
        return Decimal.pow(6, player.v.points)
    },
    effectDescription() {
        return `which are boosting flies,wings,poop,enzymes and divide requirements for farms by ${format(this.effect())}x.`
    },
    // canBuyMax() {
    //     return hasMilestone('m', 3)
    // },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    autoPrestige(){return hasUpgrade('e',53)},
    resetsNothing(){return hasUpgrade('e',53)},
    milestones: {
        1: {
            requirementDescription: "1 Variety: Fruit Fly",
            done() { return player.v.points.gte(1) },
            effectDescription: "Fruit Flies give you new enzyme upgrades",
        },
        2: {
            requirementDescription: "2 Variety: House Fly",
            done() { return player.v.points.gte(2) },
            effect() {return player.points.add(1).log(20)},
            effectDescription() {
                return `Makes flies boost enzymes at super-reduced rate: x${format(this.effect())}x`
            },
            unlocked() { return player.v.points.gte(1) },
        },
        3: {
            requirementDescription: "3 Variety: Botfly",
            done() { return player.v.points.gte(3) },
            effect() {return player.p.points.add(1).pow(0.04)},
            effectDescription() {
                return `Poop boosts itself at a reduced rate ${format(this.effect())}x`
            },
            unlocked() { return player.v.points.gte(2) },
        },
        4: {
            requirementDescription: "4 Variety: Blow fly",
            done() { return player.v.points.gte(4) },
            effect() {return player.m.points.add(1).pow(0.1)},
            effectDescription() {
                return `Enzymes boosts flies at a reduced rate ${format(this.effect())}x`
            },
            unlocked() { return player.v.points.gte(3) },
        },

    },
    hotkeys: [
        {key: "v", description: "v: Diverse flies", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasChallenge("h",41)},
})

addLayer("e", {
    name: "evolution", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0)
    }},
    color: "#b300b3",
    requires: new Decimal("1.79e308"), // Can be a function that takes requirement increases into account
    resource: "DNA", // Name of prestige currency
    baseResource: "enzymes", // Name of resource prestige is based on
    baseAmount() {return player.m.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.01, // Prestige currency exponent
    branches: ["m","h","v"],
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1);
        if (hasUpgrade('e', 32)) mult = mult.times(2);
        if (hasUpgrade('e', 61)) mult = mult.times(upgradeEffect('e',61));
        if (hasUpgrade('e', 74)) mult = mult.times(upgradeEffect('e',74));
        if (hasUpgrade('e', 81)) mult = mult.times(upgradeEffect('e',81));
        if (hasUpgrade('u', 15)) mult = mult.times(upgradeEffect('u',15));
        if (hasUpgrade('u', 22)) mult = mult.times(upgradeEffect('u',22));
        if (hasUpgrade('u', 26)) mult = mult.times(upgradeEffect('u',26));
        if (hasUpgrade('vi', 16)) mult = mult.times(upgradeEffect('vi',16));
        if (hasUpgrade('vi', 21)) mult = mult.times(upgradeEffect('vi',21));
        if (hasUpgrade('vi', 27)) mult = mult.times(upgradeEffect('vi',27));
        return mult
    },
    
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    // effect() {
	// 	return player.p.points.add(1).pow(0.9)
	// },
	// effectDescription() {
	// 	return "which are boosting flies eaten by "+format(tmp.p.effect) + "x"
	// },
    // passiveGeneration(){return hasMilestone("f",1)},
    row: 3, // Row the layer is in on the tree (0 is the first row)
    // tabFormat: [
    //     "main-display",
    //     "prestige-button",
    //     "blank",
    //     ["display-text", function() { return `You have <h3>${format(player.e.points)}</h3> DNA` }],
    //     "blank",
    //         "upgrades", 
    //         [
    //             ["", 11, ""],
    //             ["blank", "20px"],
    //             [21, "", 22], 
    //             ["blank", "20px"],
    //             [31, "", 32] 
    //         ]
    // ],

    milestones: {},

    upgrades:{
        11: {
            title: "The start of Evolution",
            description: "Keep Upgrades and Milestones and generators of Wings,Poop,Farms, 100x Flies,Wings,Poop,Enzymes, ^1.02 Flies",
            cost: new Decimal(1),
            unlocked() {return true},
            style: {
                "margin-bottom": "30px",
            }
        },
        21: {
            title: "Insectoids",
            description: "Total DNA boosts Flies",
            cost: new Decimal(2),
            unlocked() {return hasUpgrade("e", 11)},
            effect() {
                let eff = player.e.total.add(1).pow(4)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            branches: ["11"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        22: {
            title: "Mitosis",
            description: "Total DNA boosts Enzymes, + Buy max Habitats",
            effect() {
                let eff = player.e.total.add(1).pow(1.5)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            cost: new Decimal(1),
            unlocked() {return hasUpgrade("e", 11);},
            branches: ["11"],
            style: {
                "margin-bottom": "30px",
                "margin-right": "30px",
            }
        },
        31: {
            title: "Light wings",
            description: "Enzymes Boost Wings",
            cost: new Decimal(2),
            unlocked() {return hasUpgrade("e", 21)},
            effect() {
                let eff = player.m.total.add(1).pow(0.1)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            branches: ["21"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        32: {
            title: "Meiosis",
            description: "2x DNA",
            cost: new Decimal(2),
            unlocked() {return hasUpgrade("e", 21) && hasUpgrade("e", 22)},
            branches: ["21","22"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        33: {
            title: "Crustaceans",
            description: "Habitats Boost Flies",
            cost: new Decimal(2),
            unlocked() {return hasUpgrade("e", 21) && hasUpgrade("e", 22)},
            effect() {
                let eff = player.h.total.add(1).pow(20)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            branches: ["22"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        41: {
            title: "Compound Eyes",
            description: "1e20x Flies",
            cost: new Decimal(5),
            unlocked() {return hasUpgrade("e", 31) && hasUpgrade("e", 32) && hasUpgrade("e",33)},
            branches: ["31","32","33"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        42: {
            title: "Liver",
            description: "1e10x Enzymes",
            cost: new Decimal(5),
            unlocked() {return hasUpgrade("e", 31) && hasUpgrade("e", 32) && hasUpgrade("e",33)},
            branches: ["31","32","33"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        51: {
            title: "100% Digestion",
            description: "Generate 100% of Enzymes, Basically 1e4x enzymes",
            cost: new Decimal(15),
            unlocked() {return hasUpgrade("e", 41)},
            branches: ["41"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        52: {
            title: "Generational adaptation",
            description: "Keep Habitat Challenges + Auto Habitats and they reset nothing",
            cost: new Decimal(20),
            unlocked() {return hasUpgrade("e", 41) && hasUpgrade("e",42)},
            branches: ["41","42"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        53: {
            title: "Taxonomical classification",
            description: "Auto Varieties + they reset nothing",
            cost: new Decimal(20),
            unlocked() {return hasUpgrade("e",42)},
            branches: ["42"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        61: {
            title: "Mitochondria",
            description: "Flies boost DNA at Hyper reduced Rate",
            cost: new Decimal(35),
            unlocked() {return hasUpgrade("e", 51)},
            effect() {
                let eff = player.points.log("1e600").add(1)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            branches: ["51"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        62: {
            title: "Chloroplast",
            description: "Varieties boost Flies Greatly",
            cost: new Decimal(100),
            unlocked() {return hasUpgrade("e", 52)},
            effect() {
                let eff = Decimal.pow(1e4,player.v.points)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            branches: ["52"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        63: {
            title: "Cuticle",
            description: "Enzymes Boost Itself",
            cost: new Decimal(150),
            unlocked() {return hasUpgrade("e", 52)},
            effect() {
                let eff = player.m.points.add(1).pow(0.06)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            branches: ["52"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        64: {
            title: "Chromosome",
            description: "DNA boosts Flies again",
            cost: new Decimal(500),
            unlocked() {return hasUpgrade("e", 53)},
            effect() {
                let eff = player.e.total.add(1).pow(5)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            branches: ["53"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        71: {
            title: "Zigote",
            description: "DNA boosts Poop",
            cost: new Decimal(750),
            unlocked() {return hasUpgrade("e", 61) && hasUpgrade("e", 62) && hasUpgrade("e", 63) && hasUpgrade("e", 64)},
            effect() {
                let eff = player.e.total.add(1).pow(6)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            branches: ["61","62","63","64"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        72: {
            title: "Blastopore",
            description: "DNA boosts Enzymes",
            cost: new Decimal(1500),
            unlocked() {return hasUpgrade("e", 71)},
            effect() {
                let eff = player.e.total.add(1).pow(4)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            branches: ["71"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        73: {
            title: "Gastrula",
            description: "Finally: Keep enzyme upgrades",
            cost: new Decimal(3000),
            unlocked() {return hasUpgrade("e", 72)},
            branches: ["72"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        74: {
            title: "Neirula",
            description: "DNA boosts itself at a reduced rate",
            cost: new Decimal(10000),
            unlocked() {return hasUpgrade("e", 73)},
            effect() {
                let eff = player.e.total.add(1).pow(0.1)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            branches: ["73"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        75: {
            title: "Embryo",
            description: "Flies Boost itself",
            cost: new Decimal(1e5),
            unlocked() {return hasUpgrade("e", 74)},
            effect() {
                let eff = player.points.add(1).pow(0.01)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            branches: ["74"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        81: {
            title: "Fetus",
            description: "Habitats Boost DNA",
            cost: new Decimal(2e5),
            unlocked() {return hasUpgrade("e", 75)},
            effect() {
                let eff = player.h.points.add(1).pow(0.5)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            branches: ["75"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        82: {
            title: "Mutated Newborn",
            description: "Unlock Mutations",
            cost: new Decimal(1e6),
            unlocked() {return hasUpgrade("e", 81)},
            branches: ["81"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        83: {
            title: "Atavisms",
            description: "Varieties Boost mRNA",
            cost: new Decimal(1e8),
            unlocked() {return hasUpgrade("e", 82)},
            effect() {
                let eff = Decimal.pow(1.5,player.v.points)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            branches: ["82"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        84: {
            title: "Immunity Development 1",
            description: "Wings boost Enzymes at a reduced rate",
            cost: new Decimal(1e10),
            unlocked() {return hasUpgrade("e", 83)},
            effect() {
                let eff = player.w.points.add(1).pow(0.01)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            branches: ["83"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        91: {
            title: "Immunity Development 2",
            description: "Wings boost Poop at a reduced rate",
            cost: new Decimal(1e13),
            unlocked() {return hasUpgrade("e", 84)},
            effect() {
                let eff = player.w.points.add(1).pow(0.015)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            branches: ["81","84"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        92: {
            title: "Immunity Development 3",
            description: "Enzymes Boost Poop at a reduced rate",
            cost: new Decimal(2e14),
            unlocked() {return hasUpgrade("e", 91)},
            effect() {
                let eff = player.m.points.add(1).pow(0.03)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            branches: ["91","82"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        93: {
            title: "Immunity Development 4",
            description: "DNA boosts Poop",
            cost: new Decimal(3e17),
            unlocked() {return hasUpgrade("e", 92)},
            effect() {
                let eff = player.e.points.add(1).pow(1.5)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            branches: ["92","83"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        94: {
            title: "Immunity Development 5",
            description: "mRNA boosts Poop",
            cost: new Decimal(1e21),
            unlocked() {return hasUpgrade("e", 93)},
            effect() {
                let eff = player.u.mrna.add(1).pow(2)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            branches: ["93"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        95: {
            title: "Leukocyte",
            description: "mRNA boosts enzymes",
            cost: new Decimal(5e22),
            unlocked() {return hasUpgrade("e", 94)},
            effect() {
                let eff = player.u.mrna.add(1).pow(1.4)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            branches: ["94"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        101: {
            title: "Diseases",
            description: "Unlock Virus layer",
            cost: new Decimal(2e26),
            unlocked() {return hasUpgrade("u", 31)},
            branches: ["91","92","93","94","95"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },

        102: {
            title: "Infectivity",
            description: "Boost infected flies based on DNA",
            cost: new Decimal(1e28),
            unlocked() {return hasUpgrade("e", 101)},
            branches: ["101"],
            effect() {
                let eff = player.e.points.add(1).log(1e10)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },

        103: {
            title: "Hijacking cells",
            description: "1.2x Virions",
            cost: new Decimal(1e32),
            unlocked() {return hasUpgrade("e", 102)},
            branches: ["102"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        104: {
            title: "Nucleus hacking",
            description: "Infected Flies boost Enzymes",
            cost: new Decimal(1e40),
            unlocked() {return hasUpgrade("e", 103)},
            branches: ["103"],
            effect() {
                let eff = player.vi.infectedFlies.add(1).pow(6)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        105: {
            title: "Sigmavirus",
            description: "Habitats Boost mRNA",
            cost: new Decimal(1e46),
            unlocked() {return hasUpgrade("e", 104)},
            branches: ["104"],
            effect() {
                let eff = player.h.points.add(1).pow(2.5)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        111: {
            title: "Mutated Virus",
            description: "Virions Boost Poop",
            cost: new Decimal(1e60),
            unlocked() {return hasUpgrade("e", 105)},
            branches: ["101"],
            effect() {
                let eff = player.vi.virions.pow(0.07)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, 
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },
        112: {
            title: "Final of Evolution tree, But evolution never ends",
            description: "UNlock Symbiosis reset, ENDGAME!",
            cost: new Decimal(1e88),
            unlocked() {return hasUpgrade("e", 111)},
            branches: ["111"],
            style: {
                "margin-right": "30px",
                "margin-bottom": "30px",
            }
        },

    },
    hotkeys: [
        {key: "e", description: "E: Evolve for DNA", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasChallenge('h', 42) || player.e.total.gte(1)},
})

addLayer("u", {
    name: "mutation", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "U", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            mrna: new Decimal(0), 
            rrna: new Decimal(0),
        }
    },
    color: "#4e00df",
    requires: new Decimal("1e6"), // Can be a function that takes requirement increases into account
    resource: "mutations", // Name of prestige currency
    baseResource: "DNA", // Name of resource prestige is based on
    baseAmount() {return player.e.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.5, // Prestige currency exponent
    branches: ["e"],
    base:10,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1);
        return mult
    },

    mrnaGain() {
        let level = player.u.points;
        if (level.lte(0)) return new Decimal(0);
        
        let rate = Decimal.pow(5, level.sub(1));
        if (hasUpgrade("u", 11)) rate = rate.mul(upgradeEffect("u", 11));
        if (hasUpgrade("u", 12)) rate = rate.mul(3);
        if (hasUpgrade("u", 13)) rate = rate.mul(4);
        if (hasUpgrade("u", 14)) rate = rate.mul(6);
        if (hasUpgrade("u", 15)) rate = rate.mul(3);
        if (hasUpgrade("u", 16)) rate = rate.mul(upgradeEffect("u", 16));
        if (hasUpgrade("u", 21)) rate = rate.mul(upgradeEffect("u", 21));
        if (hasUpgrade("e", 83)) rate = rate.mul(upgradeEffect("e", 83));
        if (hasUpgrade("u", 24)) rate = rate.mul(upgradeEffect("u", 24));
        if (hasUpgrade("u", 25)) rate = rate.mul(upgradeEffect("u", 25));
        if (hasUpgrade("u", 31)) rate = rate.mul(3000);
        if (hasUpgrade("vi", 11)) rate = rate.mul(upgradeEffect("vi", 11));
        if (hasUpgrade("e", 105)) rate = rate.mul(upgradeEffect("e", 105));
        if (hasUpgrade("vi", 23)) rate = rate.mul(upgradeEffect("vi", 23));

        return rate
    },
    
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    // effect() {
	// 	return player.p.points.add(1).pow(0.9)
	// },
	// effectDescription() {
	// 	return "which are boosting flies eaten by "+format(tmp.p.effect) + "x"
	// },
    // passiveGeneration(){return hasMilestone("f",1)},
    row: 3, // Row the layer is in on the tree (0 is the first row)

    update(diff) {
        if (player.u.unlocked) {
            player.u.mrna = player.u.mrna.add(this.mrnaGain().mul(diff))
        }
    },

    tabFormat: [
        "main-display",
        "prestige-button",
        "blank",
        ["display-text", function() {
            return `You have <h2 style='color: #8A2BE2;'>${format(player.u.mrna)}</h2> mRNA 
                    <br><small>(+${format(layers.u.mrnaGain())}/sec based on mutations)</small>`
        }],
        "blank",
        "upgrades",
        "buyables"
    ],
    

    milestones: {},

    upgrades:{
        11: {
            title: "Ribosome Acceleration",
            description: "mRNA generation is multiplied by total DNA.",
            cost: new Decimal(40),
            currencyDisplayName: "mRNA",
            currencyInternalName: "mrna",
            currencyLocation() { return player.u },
            effect() {
                return player.e.points.add(1).log10().add(1)
            },
            effectDisplay() { return `${format(this.effect())}x` }
        },
        12: {
            title: "Protein absorber",
            description: "mRNA boosts flies gain, 3x mRNA",
            cost: new Decimal(500),
            currencyDisplayName: "mRNA",
            currencyInternalName: "mrna",
            currencyLocation() { return player.u },
            effect() {
                return player.u.mrna.add(1).pow(2.5)
            },
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked() { return hasUpgrade("u", 11) },
        },
        13: {
            title: "+1 Eye",
            description: "mRNA boosts poop gain, 4x mRNA ",
            cost: new Decimal("1.5e3"),
            currencyDisplayName: "mRNA",
            currencyInternalName: "mrna",
            currencyLocation() { return player.u },
            effect() {
                return player.u.mrna.add(1).pow(2)
            },
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked() { return hasUpgrade("u", 12) },
        },
        14: {
            title: "Mitochondria inflation",
            description: "mRNA boosts enzymes gain, 6x mRNA ",
            cost: new Decimal("1e4"),
            currencyDisplayName: "mRNA",
            currencyInternalName: "mrna",
            currencyLocation() { return player.u },
            effect() {
                return player.u.mrna.add(1).pow(2.2)
            },
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked() { return hasUpgrade("u", 13) },
        },
        15: {
            title: "Mitochondria inflation",
            description: "mRNA boosts DNA gain, 3x mRNA ",
            cost: new Decimal("5e4"),
            currencyDisplayName: "mRNA",
            currencyInternalName: "mrna",
            currencyLocation() { return player.u },
            effect() {
                return player.u.mrna.add(1).pow(0.08)
            },
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked() { return hasUpgrade("u", 14) },
        },
        16: {
            title: "RNA twist",
            description: "mRNA boosts itself",
            cost: new Decimal("5e5"),
            currencyDisplayName: "mRNA",
            currencyInternalName: "mrna",
            currencyLocation() { return player.u },
            effect() {
                return player.u.mrna.add(1).pow(0.14)
            },
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked() { return hasUpgrade("u", 15) },
        },
        17: {
            title: "Second stomach",
            description: "Enzymes boost itself",
            cost: new Decimal("2e6"),
            currencyDisplayName: "mRNA",
            currencyInternalName: "mrna",
            currencyLocation() { return player.u },
            effect() {
                return player.m.points.add(1).pow(0.05)
            },
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked() { return hasUpgrade("u", 16) },
        },
        21: {
            title: "Endogenesis",
            description: "Flies boost mRNA at a hyper reduced rate",
            cost: new Decimal("1e8"),
            currencyDisplayName: "mRNA",
            currencyInternalName: "mrna",
            currencyLocation() { return player.u },
            effect() {
                return player.points.add(1).log("1.79e308")
            },
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked() { return hasUpgrade("u", 17) },
        },
        22: {
            title: "Thymine",
            description: "Wings Boost DNA at a hyper reduced rate",
            cost: new Decimal("5e9"),
            currencyDisplayName: "mRNA",
            currencyInternalName: "mrna",
            currencyLocation() { return player.u },
            effect() {
                return player.w.points.add(1).log("1e600")
            },
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked() { return hasUpgrade("u", 21) },
        },
        23: {
            title: "Uracil",
            description: "mRNA boosts wings",
            cost: new Decimal("1.5e11"),
            currencyDisplayName: "mRNA",
            currencyInternalName: "mrna",
            currencyLocation() { return player.u },
            effect() {
                return player.u.mrna.add(1).pow(1.6)
            },
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked() { return hasUpgrade("u", 22) },
        },
        24: {
            title: "Cytosine",
            description: "Farms Boost mRNA gain",
            cost: new Decimal("2.5e11"),
            currencyDisplayName: "mRNA",
            currencyInternalName: "mrna",
            currencyLocation() { return player.u },
            effect() {
                return player.f.points.add(1).pow(0.6)
            },
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked() { return hasUpgrade("u", 23) },
        },
        25: {
            title: "Guanine",
            description: "Poop Boost mRNA gain",
            cost: new Decimal("1e13"),
            currencyDisplayName: "mRNA",
            currencyInternalName: "mrna",
            currencyLocation() { return player.u },
            effect() {
                return player.p.points.add(1).log("1.79e308")
            },
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked() { return hasUpgrade("u", 24) },
        },
        26: {
            title: "Phosphate",
            description: "Mutations Boost DNA gain",
            cost: new Decimal("1e15"),
            currencyDisplayName: "mRNA",
            currencyInternalName: "mrna",
            currencyLocation() { return player.u },
            effect() {
                return Decimal.pow(2,player.u.points)
            },
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked() { return hasUpgrade("u", 25) },
        },
        27: {
            title: "Z chromosome",
            description: "Mutations Boost Flies",
            cost: new Decimal("2e16"),
            currencyDisplayName: "mRNA",
            currencyInternalName: "mrna",
            currencyLocation() { return player.u },
            effect() {
                return Decimal.pow(1e8,player.u.points)
            },
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked() { return hasUpgrade("u", 26) },
        },
        31: {
            title: "Mutation leads to creation of Virus",
            description: "1st Upgrade to unlock Virus layer,x3000 mRNA",
            cost: new Decimal("3e17"),
            currencyDisplayName: "mRNA",
            currencyInternalName: "mrna",
            currencyLocation() { return player.u },
            unlocked() { return hasUpgrade("e", 95) },
        },
        32: {
            title: "Mutation Virus",
            description: "Enzymes Boost Infected Flies",
            cost: new Decimal("1e44"),
            currencyDisplayName: "mRNA",
            currencyInternalName: "mrna",
            currencyLocation() { return player.u },
            effect() {
                return player.m.points.log("1e308")
            },
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked() { return hasUpgrade("e", 111) },
        },
    },
    hotkeys: [
        {key: "u", description: "U: Mutate yourself", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('e', 82) || player.u.points.gte(1)},
})
addLayer("vi", {
    name: "Virus",
    symbol: "VI",
    row: 3,
    position: 2,
    color: "#eb1da6",
    type: "static",

    resource: "Virus Strains",
    baseResource: "mRNA",
    baseAmount() { return player.u ? player.u.mrna : new Decimal(0) },
    requires: new Decimal(1e21),
    base: 10000,
    exponent: 1.6,
    branches: ["e"],

    layerShown() {
        return hasUpgrade("e",101)
    },

    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            virions: new Decimal(1),
            infectedFlies: new Decimal(0),
            timer: 0,
        }
    },

    virionMult() {
        let mult = new Decimal(1.05);

        let buyableLevel = getBuyableAmount("vi", 11);
        mult = mult.add(buyableLevel.mul(0.03));

        let flyBonus = player.vi.infectedFlies.add(1).log10().mul(0.1);
        mult = mult.add(flyBonus);

        if (player.vi.points.gte(1)) {
            mult = mult.mul(Decimal.pow(1.17, player.vi.points));
        }
        if (hasUpgrade("vi", 15)) mult = mult.mul(1.15);
        if (hasUpgrade("e", 103)) mult = mult.mul(1.2);
        if (hasUpgrade("vi", 24)) mult = mult.mul(1.3);
        if (hasUpgrade("vi", 25)) mult = mult.mul(1.35);

        mult = softcap(mult, new Decimal(1.5), 0.4, "pow");

        return mult;
    },

    replicationInterval() {
        let baseInterval = 2.0
        let buyableLevel = getBuyableAmount("vi", 12)
        
        let interval = baseInterval / (1 + buyableLevel.toNumber() * 0.25)
        return Math.max(0.1, interval)
    },

    update(diff) {
        if (!player.vi.unlocked) return

        player.vi.timer += diff
        let interval = this.replicationInterval()

        if (player.vi.timer >= interval) {
            let ticks = Math.floor(player.vi.timer / interval)
            player.vi.timer %= interval

            let mult = this.virionMult()

            let current = player.vi.virions

            if (current.gte("1e1000")) {
                mult = mult.pow(0.01)
            }else if (current.gte("1.79e308")) {
                mult = mult.pow(0.1)
            } else if (current.gte("1e100")) {
                mult = mult.pow(0.25)
            } else if (current.gte("1e50")) {
                mult = mult.pow(0.5)
            }

            player.vi.virions = current.mul(mult.pow(ticks))
        }
    },

    clickables: {
        11: {
            title: "Infect Flies",
            display() {
                let gain = player.vi.virions.add(1).pow(0.02)
                if (hasUpgrade('e', 102)) gain = gain.times(upgradeEffect("e",102));
                if (hasUpgrade('u', 32)) gain = gain.times(upgradeEffect("u",32));
                return `Reset Virions and Buyables to harvest <b>${format(gain)}</b> Infected Flies.<br>
                        <small></small>
                        Requires at least 50 virions to reset`
            },
            canClick() {
                if (player.vi.virions.gte(5e1)) {
                    let gain = player.vi.virions.add(1).pow(0.02)
                    if (hasUpgrade('e', 102)) gain = gain.times(upgradeEffect("e",102));
                    if (hasUpgrade('u', 32)) gain = gain.times(upgradeEffect("u",32));
                    return gain.gte(1) && player.vi.infectedFlies
                }

            },
            onClick() {
                let gain = player.vi.virions.add(1).pow(0.02)
                if (hasUpgrade('e', 102)) gain = gain.times(upgradeEffect("e",102));
                if (hasUpgrade('u', 32)) gain = gain.times(upgradeEffect("u",32));
                
                player.vi.infectedFlies = player.vi.infectedFlies.add(gain)

                player.vi.virions = new Decimal(1)
                player.vi.timer = 0
                setBuyableAmount("vi", 11, new Decimal(0))
                setBuyableAmount("vi", 12, new Decimal(0))
            },
            style: { "height": "80px", "width": "220px", "border-radius": "8px", "background-color": "#9900ff" }
        }
    },

    buyables: {
        11: {
            title: "Mutagenic Strain",
            cost(x) { return new Decimal(10).mul(Decimal.pow(10, x)) },
            display() {
                return `Increases Virion replication rate.<br>
                        Current: +${format(getBuyableAmount("vi", 11).mul(3))}%/tick<br>
                        Cost: <b>${format(this.cost())}</b> Virions`
            },
            canAfford() { return player.vi.virions.gte(this.cost()) },
            buy() {
                player.vi.virions = player.vi.virions.sub(this.cost())
                setBuyableAmount("vi", 11, getBuyableAmount("vi", 11).add(1))
            },
            buyMax() {
                if (!this.canAfford()) return
                let v = player.vi.virions
                let targetLevel = v.div(10).log10().floor().add(1)
                
                if (targetLevel.gt(getBuyableAmount("vi", 11))) {
                    setBuyableAmount("vi", 11, targetLevel)
                }
            }
        },
        12: {
            title: "Rapid Incubation",
            cost(x) { return new Decimal(25).mul(Decimal.pow(25, x)) },
            display() {
                return `Reduces replication interval.<br>
                        Current: every <b>${format(layers.vi.replicationInterval(), 2)}s</b><br>
                        Cost: <b>${format(this.cost())}</b> Virions`
            },
            canAfford() { return player.vi.virions.gte(this.cost()) },
            buy() {
                player.vi.virions = player.vi.virions.sub(this.cost())
                setBuyableAmount("vi", 12, getBuyableAmount("vi", 12).add(1))
            },
            buyMax() {
                if (!this.canAfford()) return
                let v = player.vi.virions
                let targetLevel = v.div(25).log(25).floor().add(1)
                
                if (targetLevel.gt(getBuyableAmount("vi", 12))) {
                    setBuyableAmount("vi", 12, targetLevel)
                }
            }
        },
    },

    onPrestige(gain) {
        player.vi.virions = new Decimal(1)
        player.vi.infectedFlies = new Decimal(0)
        player.vi.timer = 0
        setBuyableAmount("vi", 11, new Decimal(0))
        setBuyableAmount("vi", 12, new Decimal(0))
    },

    upgrades: {
        11: {
            title: "mRNA infection",
            description: "Boost mRNA based on virions",
            cost: new Decimal(10),
            currencyDisplayName: "Infected Flies",
            currencyInternalName: "infectedFlies",
            currencyLocation() { return player.vi },
            effect() {
                return player.vi.virions.add(1).log(4).max(1)
            },
            effectDisplay() { return `${format(this.effect())}x` }
        },
        12: {
            title: "Infecting Flies",
            description: "Virions boost flies",
            cost: new Decimal(60),
            currencyDisplayName: "Infected Flies",
            currencyInternalName: "infectedFlies",
            currencyLocation() { return player.vi },
            effect() {
                let eff = player.vi.virions.add(1).pow(0.3).max(1)
                eff = softcap(eff,new Decimal(1e100),0.4)
                return eff
            },
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked() {return hasUpgrade("vi", 11)}
        },
        13: {
            title: "Contaminating Poop",
            description: "Virions boost Poop",
            cost: new Decimal("1e100"),
            currencyDisplayName: "Virions",
            currencyInternalName: "virions",
            currencyLocation() { return player.vi },
            effect() {
                let eff = player.vi.virions.add(1).pow(0.31).max(1)
                eff = softcap(eff,new Decimal(1e100),0.4)
                return eff
                
            },
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked() {return hasUpgrade("vi", 12)}
        },
        14: {
            title: "Infection stimulates eating",
            description: "Infected flies boost flies",
            cost: new Decimal(1000),
            currencyDisplayName: "Infected Flies",
            currencyInternalName: "infectedFlies",
            currencyLocation() { return player.vi },
            effect() {
                return player.vi.infectedFlies.add(1).pow(6).max(1)
            },
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked() {return hasUpgrade("vi", 13)}
        },
        15: {
            title: "Spreading through Birds",
            description: "1.15x Virions",
            cost: new Decimal("2e4"),
            currencyDisplayName: "Infected Flies",
            currencyInternalName: "infectedFlies",
            currencyLocation() { return player.vi },
            unlocked() {return hasUpgrade("vi", 14)}
        },
        16: {
            title: "Bypassing immunity",
            description: "Virions boost DNA",
            cost: new Decimal("1e250"),
            currencyDisplayName: "Virions",
            currencyInternalName: "virions",
            currencyLocation() { return player.vi },
            effect() {
                return player.vi.virions.add(1).log(10000).max(1)
            },
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked() {return hasUpgrade("vi", 15)}
        },
        17: {
            title: "RNA based virus",
            description: "Infected Flies boost mRNA",
            cost: new Decimal("1e340"),
            currencyDisplayName: "Virions",
            currencyInternalName: "virions",
            currencyLocation() { return player.vi },
            effect() {
                return player.vi.infectedFlies.add(1).pow(0.3)
            },
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked() {return hasUpgrade("vi", 16)}
        },
        21: {
            title: "Transmission",
            description: "mRNA boosts DNA",
            cost: new Decimal("1e8"),
            currencyDisplayName: "Infected Flies",
            currencyInternalName: "infectedFlies",
            currencyLocation() { return player.vi },
            effect() {
                return player.u.mrna.add(1).pow(0.1)
            },
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked() {return hasUpgrade("vi", 17)}
        },
        22: {
            title: "Transmission by animals",
            description: "DNA boosts Poop",
            cost: new Decimal("1e11"),
            currencyDisplayName: "Infected Flies",
            currencyInternalName: "infectedFlies",
            currencyLocation() { return player.vi },
            effect() {
                return player.e.points.add(1).pow(0.7)
            },
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked() {return hasUpgrade("vi", 21)}
        },
        23: {
            title: "Transmission by insects",
            description: "Infected Flies Boost mRNA",
            cost: new Decimal("1e730"),
            currencyDisplayName: "Virions",
            currencyInternalName: "virions",
            currencyLocation() { return player.vi },
            effect() {
                return player.vi.infectedFlies.add(1).pow(0.4)
            },
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked() {return hasUpgrade("vi", 22)}
        },
        24: {
            title: "Next layer is close",
            description: "1.3x Vririon Replication",
            cost: new Decimal("4"),
            unlocked() {return hasUpgrade("vi", 23)}
        },
        25: {
            title: "Waiting for viruses is tedious so get a boost",
            description: "1.35x Replication",
            cost: new Decimal("1e450"),
            currencyDisplayName: "Virions",
            currencyInternalName: "virions",
            currencyLocation() { return player.vi },
            unlocked() {return hasUpgrade("vi", 24)}
        },
        26: {
            title: "Virions triad",
            description: "Virions boost Wings",
            cost: new Decimal("1e600"),
            currencyDisplayName: "Virions",
            currencyInternalName: "virions",
            currencyLocation() { return player.vi },
            effect() {
                return player.vi.virions.add(1).pow(0.08)
            },
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked() {return hasUpgrade("vi", 25)}
        },
        27: {
            title: "Virions triad",
            description: "DNA boosts itself",
            cost: new Decimal("1e850"),
            currencyDisplayName: "Virions",
            currencyInternalName: "virions",
            currencyLocation() { return player.vi },
            effect() {
                let eff = player.e.points.add(1).pow(0.1)
                eff = softcap(eff,new Decimal(1e8),0.4)
                return eff
            },
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked() {return hasUpgrade("vi", 25)}
        },
    },

    tabFormat: [
        "main-display",
        "prestige-button",
        "blank",
        ["display-text", function() {
                let mult = layers.vi.virionMult();
                let v = player.vi.virions;
                let softcapText = "";
                let replicasoftcap = "softcapped";
                if (v.gte("1e1000")) {
                    softcapText = " <span style='color: #ff006a; font-size: 12px;'>(Tier 4 Softcap past 1e1000)</span>"
                } else if (v.gte("1.79e308")) {
                    softcapText = " <span style='color: #ff2222; font-size: 12px;'>(Tier 3 Softcap past 1e308)</span>"
                } else if (v.gte("1e100")) {
                    softcapText = " <span style='color: #ff8800; font-size: 12px;'>(Tier 2 Softcap past 1e100)</span>"
                } else if (v.gte("1e50")) {
                    softcapText = " <span style='color: #ffff44; font-size: 12px;'>(Tier 1 Softcap past 1e50)</span>"
                }

                if(mult.gte(1.5)) {
                    replicasoftcap = "softcapped"
                }

                return `You have <h2 style='color: #cd32c0;'>${format(v)}</h2> Virions ${softcapText}
                        <br><small>(Replicates ${format(mult)}x every ${format(layers.vi.replicationInterval(), 2)}s) at 1.5x replication is softcapped</small>`
        }],
        "blank",
        ["display-text", function() {
            return `You have <h3 style='color: #9900ff;'>${format(player.vi.infectedFlies)}</h3> Infected Flies`
        }],
        "blank",
        "clickables",
        "blank",
        "buyables",
        "upgrades"
    ],
    hotkeys: [
        {key: "i", description: "I: Get new virus strain", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
})

// addLayer("s", {
//     name: "symbiosis", // This is optional, only used in a few places, If absent it just uses the layer id.
//     symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
//     position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
//     startData() {
//         return {
//             unlocked: false,
//             points: new Decimal(0),
//             nutrients: new Decimal(0), 
//         }
//     },
//     color: "#51fd93",
//     requires: new Decimal("1e95"), // Can be a function that takes requirement increases into account
//     resource: "symbionts", // Name of prestige currency
//     baseResource: "DNA", // Name of resource prestige is based on
//     baseAmount() {return player.e.points}, // Get the current amount of baseResource
//     type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
//     exponent: 1.4, // Prestige currency exponent
//     branches: ["u","vi"],
//     base:1e20,
//     gainMult() { // Calculate the multiplier for main currency from bonuses
//         let mult = new Decimal(1);
//         return mult
//     },

//     nutGain() {
//         let level = player.s.points;
//         if (level.lte(0)) return new Decimal(0);
        
//         let rate = Decimal.pow(10, level.sub(1));

//         return rate
//     },
    
//     gainExp() { // Calculate the exponent on main currency from bonuses
//         return new Decimal(1)
//     },
//     // effect() {
// 	// 	return player.p.points.add(1).pow(0.9)
// 	// },
// 	// effectDescription() {
// 	// 	return "which are boosting flies eaten by "+format(tmp.p.effect) + "x"
// 	// },
//     // passiveGeneration(){return hasMilestone("f",1)},
//     row: 4, // Row the layer is in on the tree (0 is the first row)

//     update(diff) {
//         if (player.s.unlocked) {
//             player.s.nutrients = player.s.nutrients.add(this.nutGain().mul(diff))
//         }
//     },

//     tabFormat: [
//         "main-display",
//         "prestige-button",
//         "blank",
//         ["display-text", function() {
//             return `You have <h2 style='color: #2be296;'>${format(player.s.nutrients)}</h2> Shared Nutrients
//                     <br><small>(+${format(layers.s.nutGain())}/sec based on Symbionts)</small>`
//         }],
//         "blank",
//         "milestones",
//         "blank",
//         "upgrades",
//     ],
    

//     milestones: {
//         1: {
//             requirementDescription: "First symbiont",
//             done() { return player.s.points.gte(1) },
//             effectDescription: "A symbiont keeps your flies,farms,poop,enzymes automation, Good for start",
//         },
//     },

//     upgrades:{
//     },
//     hotkeys: [
//         {key: "s", description: "S: make a symbiosis with something", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
//     ],
//     layerShown(){return hasUpgrade('e', 112) || player.s.points.gte(1)},
// })