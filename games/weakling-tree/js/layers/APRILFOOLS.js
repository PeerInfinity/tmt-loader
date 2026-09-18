addLayer("apr", {
    name: "tality",
    symbol: "T",
    row: "side",
    position: 2,
    color: "rgb(252, 244, 132)",
    tooltip: "Minigame!",
    startData() { return {
        unlocked: true,
        points: new Decimal(0)
    }},
    infoboxes: {
        introBox: {
            title: "taLiTY",
            body() {
                return `iS taLiTY reAL? is It pOSsiBle wiTH aCCuRaTe hItBoXeS?!?FKW`
            }
        }
    },
    color: "navy",
    resource: "taLiTY",
    tabFormat: [
        ["infobox","introBox"],"main-display",
        ["display-text",function(){return "YoU aRe gAiNIng "+format(tmp.apr.gainMult.mul(tmp.apr.passiveGeneration),0)+" taLiTY pEr sEConD."}],
        "blank","buyables","blank",
        ["display-text",function(){
            if(player.apr.points.gte(5e240)) return "<h2>coNGrEgAtIOns fOr BeAtINg tHe wOrLD's hArDEst gAMe.</h2>"
        }]],
    gainMult() {
        let mult = buyableEffect(this.layer,11)
        return mult
    },
    passiveGeneration() {
        let gain = new Decimal(0)
        if(getBuyableAmount("apr",11).gte(1)) gain = new Decimal(1)
        return gain
    },
    update(diff) {
        player.apr.points = player.apr.points.add(tmp.apr.gainMult.mul(tmp.apr.passiveGeneration).mul(diff))
    },
    buyables: {
        11: {
            title: "taLiTY Strengthen",
            baseCost() {
                let cost = new Decimal(0)
                return cost
            },
            cost(x) {
                let base = this.baseCost()
                if(getBuyableAmount("apr",11).gte(1)) base = new Decimal(1)
                let scale = [new Decimal(106.25)]
                let scaledCost = [
                    base.mul(scale[0].pow(x-1)),
                ]
                let consume = scaledCost[0]
                return consume
            },
            purchaseLimit: 120,
            effect(x) {
                let eff = new Decimal(1)
                let base = new Decimal(100)
                if(x.gte(1)) eff = Decimal.pow(base,x-1)
                return eff
            },
            canAfford() {return player.apr.points.gte(this.cost())},
            buy() {
                player.apr.points = player.apr.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            display() {
                let gainDesc = "×100 the taLiTY gain!\n"
                let effText = "Currently: ×"+format(this.effect(),0)+"<br>"
                let boughtText = "("+formatWhole(getBuyableAmount("apr",11))+"/"+formatWhole(tmp.apr.buyables[11].purchaseLimit)+" purchased)<br><br>"
                let costText = "Cost: "+format(this.cost())+" taLiTY"
                if(getBuyableAmount("apr",11).lt(1)) {gainDesc = "Begin the taLiTY gain!"; effText = "<br>"}
                return gainDesc+effText+boughtText+costText
            },
            style: {'touch-action':'manipulation','color':'white'},
        }
    },
}) // HAPPY APRIL FOOLS