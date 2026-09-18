addLayer("c", {
    name: "Clicker", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "cl", // This appears on the layer's node. Default is the id with the first letter capitalized/
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "green",
    requires() {
        let requ=new Decimal(5).add(player.c.points.pow(2).div(player.c.points.gte(1)?2:1))
        return requ.times(new Decimal(1).sub(player.p.buyables[12].times(0.01)))
    }, // Can be a function that takes requirement increases into account
    resource: "levels", // Name of prestige currency
    baseResource: "clicks", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    //exponent: , // Prestige currency exponent
    //base: 0,
    canBuyMax() {return hasUpgrade("sp",11)},
    getNextThing(){
        let cost = new Decimal(10).add(player.c.points.pow(2)).times(new Decimal(1).sub(player.p.buyables[12].times(0.01)))
        let uhhhh = new Decimal(0)
        for(let i=1;player.points.gt(cost);i++){
            cost = cost.add(new Decimal(10).add(player.c.points.add(i).pow(2)).times(new Decimal(1).sub(player.p.buyables[12].times(0.01))))
            uhhhh = uhhhh.add(1)
        }
        return tmp.c.canBuyMax?cost:new Decimal(10).add(player.c.points.pow(2)).times(new Decimal(1).sub(player.p.buyables[12].times(0.01)))
    },
    prestigeButtonText(){
        if(!tmp.c.canBuyMax) return "Reset for "+formatWhole(tmp.c.getResetGain)+"+ "+tmp.c.resource+"<br><br>Req: "+formatWhole(player.points)+" / "+formatWhole(tmp.c.getNextThing)+" "+tmp.c.baseResource
        else return "Reset for "+formatWhole(tmp.c.getResetGain)+"+ "+tmp.c.resource+"<br><br>Next at "+formatWhole(tmp.c.getNextThing)+" "+tmp.c.baseResource
    },
    canReset(){return (player.points.gte(new Decimal(10).add(player.c.points.pow(2)).times(new Decimal(1).sub(player.p.buyables[12].times(0.01))))&&player.c.points.lt(240))/*||(hasUpgrade("apoth",))*/},
    getResetGain(){
        let cost = new Decimal(10).add(player.c.points.pow(2)).times(new Decimal(1).sub(player.p.buyables[12].times(0.01)))
        let uhhhh = new Decimal(0)
        for(let i=1;player.points.gt(cost);i++){
            cost = cost.add(new Decimal(10).add(player.c.points.add(i).pow(2)).times(new Decimal(1).sub(player.p.buyables[12].times(0.01))))
            uhhhh = uhhhh.add(1)
        }
        return tmp.c.canBuyMax?uhhhh:new Decimal(1)
    },
    branches:["p"],
    //canReset(){return player.c.points.lt(240)},
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Reset for levels", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    clickables: {
        11: {
            display() {return "CLICK"},
            canClick() {return "True"},
            onClick() {
                //return player.points=player.points.times(player[this.layer].points)
                //cli=1000000
                //cli=cli.add(player[this.layer].points)
                //cli.add(getBuyableAmount("p",11))
                //cli=player.points.times(cli)
                return player.points=player.points.add(getBuyableAmount("p",11).times(3)).add(player[this.layer].points).add(10000000)
            }
        }
    }
})

//unction clicker() {
    
//}