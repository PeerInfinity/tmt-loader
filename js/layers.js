addLayer("o", {
    name: "ore", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "O", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        buyables: {11: new Decimal(0)},
    }},
    color: "red",
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "ore", // Name of prestige currency
    baseResource: modInfo.pointsName, // Name of resource prestige is based on
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

    // auto buyer for pickaxes
    update(diff){
        if (player.o.autoBuy){
            const lim = layers.o.buyables[11].purchaseLimit()
            // we make sure we dont go over the limit
            while (tmp.o.buyables[11].canAfford && getBuyableAmount("o", 11).lt(lim)){
                layers.o.buyables[11].buy()
            }
        }
    },

    buyables: {
        11: {
            title: "Pickaxe",
            description: "A sturdy iron pickaxe, makes your points go brrrr",
            cost() {return new Decimal(1)},
            // We can click it to buy only if we have enough dust
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            // This subtracts the pickaxe cost from the total ores that we currently have and increment the 
            // number of pickaxes we have
            buy() {
                if (getBuyableAmount(this.layer, this.id) < this.purchaseLimit && tmp.o.buyables[11].canAfford){
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }else return
            },
            // I'm setting a max number of pickaxes that we can buy
            purchaseLimit(){
                return 30
            },
            // The effect is based on how many pickaxes we have
            effect() {
                return getBuyableAmount(this.layer, this.id)
            },
            display() {
                return `${this.description}<br> Owned: ${format(buyableEffect(this.layer, this.id), 0)}
                <br> Cost: ${this.cost()} ores`
            },
        },
    },  

    upgrades: {
        11: {
            title: "Begin",
            description: "Generate 1 point every second",
            cost: new Decimal(0),

            effect(){
                // We start with 0 pickaxes so we'll start generating 1 point/sec
                if (getBuyableAmount("o", 11) == 0){
                    return new Decimal(1)
                }
                // When we start buying pickaxes, the base generation is an extra point/sec per pickaxe
                else{
                return new Decimal(1).add(getBuyableAmount("o", 11))
                }
            },
        },

        12:{
            title: "Sharpened Blade",
            description: "Makes the pickaxes a little stronger",
            cost: new Decimal(5),

            effect(){
                return new Decimal(1).add(new Decimal(0.2).times(getBuyableAmount("o", 11)))
            },
            effectDisplay(){
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
        },

        13:{
            title: "Master Miner",
            description: "It doubles every Pickaxe's output",
            cost: new Decimal(10),

            effect(){
                return new Decimal(2)
            },

            effectDisplay(){
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
        },

        14:{
            title: "Automatic Pickaxe buyer",
            description: "deploy an auto buyer to purchase Pickaxes",
            cost: new Decimal(50),
            
            onPurchase(){
                player.o.autoBuy = true
            },
        },
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    branches: ["d", "i"],
    hotkeys: [
        {key: "O", description: "O: Reset for ores", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    // This allows us to keep our upgrades and buyables if a specific upgrade was purchased in some other layer
    doReset(resettingLayer){
        let keep = []
        if (hasUpgrade("d", 13) && resettingLayer == "d") keep.push("upgrades"), keep.push("buyables")
        if (hasUpgrade("i", 13) && resettingLayer == "i") keep.push("upgrades"), keep.push("buyables")
        if (layers[resettingLayer].row > this.row) layerDataReset("o", keep)

    },
});

addLayer("d", {
    name: "dust", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "brown",
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "dust", // Name of prestige currency
    baseResource: "ore", // Name of resource prestige is based on
    baseAmount() {return player.o.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("d", 11)) mult = mult.mul(upgradeEffect("d", 11))
        if (hasUpgrade("d", 12)) mult = mult.mul(upgradeEffect("d", 12))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },

    upgrades:{
        11:{
            title: "Begin Crushing",
            description: "Turns ores into dust",
            cost: new Decimal(1),
            unlocked(){return true},
            effect(){
                return new Decimal(1)
            },

            effectDisplay(){
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
        },
        
        12: {
            title: "Super Crusher",
            description: "Doubles your ore to dust conversion",
            cost: new Decimal(2),

            effect(){
                return new Decimal(2).pow(2)
            },

            effectDisplay(){
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },            
        },

        13: {
            title: "Preserve Ore upgrades and buyables",
            description: "When you reset this layer, it'll stop wiping the ore layer upgrades and buyables",
            cost: new Decimal(1),
        },
    },

    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "D", description: "D: Reset for dust", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    // This allows us to keep our upgrades and buyables if a specific upgrade was purchased in some other layer
    doReset(resettingLayer){
        if (resettingLayer!=="i") return
        let keep = []
        if (hasUpgrade("i", 13) && resettingLayer == "i") keep.push("upgrades"), keep.push("buyables")
        if (layers[resettingLayer].row = this.row) layerDataReset("d", keep)
    },

});

addLayer("i", {
    name: "ingot", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "I", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "silver",
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "ingots", // Name of prestige currency
    baseResource: "dust", // Name of resource prestige is based on
    baseAmount() {return player.d.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("i", 11)) mult = mult.mul(upgradeEffect("i", 11))
        if (hasUpgrade("i", 12)) mult = mult.mul(upgradeEffect("i", 12))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },

    upgrades:{
        11:{
            title: "Begin Smelting",
            description: "Turns dust into ingots",
            cost: new Decimal(1),
            unlocked(){return true},
            effect(){
                return new Decimal(1)
            },

            effectDisplay(){
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
        },
        
        12: {
            title: "Dust Booster",
            description: "Each ingot we have increases all Dust gains by +2%",
            cost: new Decimal(2),

            effect(){
                return new Decimal(1).add(player.i.points.mul(0.02))
            },

            effectDisplay(){
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },            
        },

        13: {
            title: "Preserve Dust upgrades and buyables",
            description: "When you reset this layer, it'll stop wiping the Dust layer upgrades and buyables",
            cost: new Decimal(1),
        },
    },

    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "I", description: "I: Reset for ingots", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true}
});