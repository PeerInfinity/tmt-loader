addLayer("p", {
    name: "particle", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#777799",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "particles", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if(hasUpgrade('i',11)) mult = mult.mul(layerEffect('i'))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Create particles", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    resetDescription:'Create ',
    layerShown(){return true},
    effect(){
        if (!hasUpgrade('p',12)) return decimalOne
        if (hasUpgrade('p',25)){
            mult = player.p.best.add(1)
            exp = 0.4
            if(hasUpgrade('s',22)) exp = 0.5
            mult = mult.pow(exp)
        }else{
            mult = player.p.best.add(1).log2().add(1)
            if(hasUpgrade('p',13)) mult = mult.pow(upgradeEffect('p',13))
        }
        return mult
    },
    effectDescription(){
        if (!hasUpgrade('p',12)) return "which has no effect."
        let dis = "which boosts points gain by "+layerText("h2", "p", format(tmp.p.effect))
        return dis
    },
    passiveGeneration(){
        if (hasUpgrade('t',11)) return layerEffect('t')
        else return decimalZero
    },
    doReset(resettingLayer) {
        let keep = []
        if (hasMilestone('i', 1) && resettingLayer=='i' || hasMilestone('t', 0)) keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    upgrades: {
        rows:2,
        cols:5,
        11:{
            title: "P11:The start",
            description: "Start generating points.",
            cost: new Decimal(0),
            effect(){return true},
        },
        12:{
            title: "P12:Particle power",
            description: "Best particles boost points gain.",
            cost: new Decimal(1),
            effect(){return true},
            unlocked(){
                return hasUpgrade('p',11)
            }
        },
        13:{
            title: "P13:More particle power",
            description: "Square particle effect.",
            cost: new Decimal(5),
            effect(){
                if(hasUpgrade('p',25)) return decimalOne
                let exp = new Decimal(2)
                if(hasUpgrade('p',21)) exp = exp.add(2)
                if(hasUpgrade('p',23)) exp = exp.add(3)
                if(hasUpgrade('p',24)) exp = exp.add(5)
                return exp
            },
            effectDisplay(){
                if(hasUpgrade('p',25)) return "Disabled"
                return "^" + format(upgradeEffect('p',13))
            },
            unlocked(){
                return hasUpgrade('p',12)
            }
        },
        14:{
            title: "P14:Point synergy",
            description: "Points boost points gain.",
            cost: new Decimal(50),
            effect(){
                if(hasUpgrade('p',22)){
                    mult = player.points.add(1)
                    exp = 0.46
                    if(hasUpgrade('s',23)) exp = 0.5
                }else{
                    mult = player.points.max(10).div(10).add(1).log2()
                    exp = 2
                    if(hasUpgrade('i',12) && hasUpgrade('p',15)) exp *= 2
                }
                return mult.pow(exp)
            },
            effectDisplay(){
                return format(upgradeEffect('p',14)) + "x"
            },
            unlocked(){
                return hasUpgrade('p',13)
            }
        },
        15:{
            title: "P15:Interactions",
            description(){
                dis = "Unlock the next layer"
                if(hasUpgrade('i',12) && !hasUpgrade('p',22)) dis = dis + ", and squares P14 effect."
                else dis = dis + "."
                return dis
            },
            cost: new Decimal(200),
            effect(){
                return hasUpgrade('i',12)? decimalOne : decimalZero
            },
            unlocked(){
                return hasUpgrade('p',14)
            }
        },
        21:{
            title: "P21:Contained particle power",
            description: "P13 effect exponent +2",
            cost(){return (player.s.unlockOrder)?(new Decimal(1e22)):(new Decimal(1e6))},
            effect(){
                return new Decimal(2)
            },
            effectDisplay(){
                return "+" + format(upgradeEffect('p',21))
            },
            unlocked(){
                return hasUpgrade('s',12) || hasUpgrade('p',21)
            }
        },
        22:{
            title: "P22:Shaped point synergy",
            description: "Improves point synergy formula.",
            cost(){return (player.s.unlockOrder)?(new Decimal(1e26)):(new Decimal(1e12))},
            effect(){return true},
            unlocked(){
                return (hasUpgrade('s',12) && hasUpgrade('p',21)) || hasUpgrade('p',22)
            }
        },
        23:{
            title: "P23:Contained particle power II",
            description: "P13 effect exponent +3.",
            cost(){return (player.s.unlockOrder)?(new Decimal(1e33)):(new Decimal(2e13))},
            effect(){
                return new Decimal(3)
            },
            effectDisplay(){
                return "+" + format(upgradeEffect('p',23))
            },
            unlocked(){
                return (hasUpgrade('s',12) && hasUpgrade('p',22)) || hasUpgrade('p',23)
            }
        },
        24:{
            title: "P24:Contained particle power III",
            description: "P13 effect exponent +5.",
            cost: new Decimal(1e62),
            effect(){
                return new Decimal(5)
            },
            effectDisplay(){
                return "+" + format(upgradeEffect('p',24))
            },
            unlocked(){
                return (hasUpgrade('s',12) && hasUpgrade('p',23)) || hasUpgrade('p',24)
            }
        },
        25:{
            title: "P25:Shaped particle power",
            description: "Improves particle effect formula. Disables P13.",
            cost: new Decimal(1e100),
            effect(){return true},
            unlocked(){
                return (hasUpgrade('s',12) && hasUpgrade('p',24)) || hasUpgrade('p',25)
            }
        },
    }
})

addLayer("i", {
    name: "Interaction",
    symbol: "I",
    position: 1,
    startData(){ return {
                unlocked: false,
        		points: decimalZero,
                best: decimalZero,
                total: decimalZero,
        }},
    color: "#EEEEEE",
    requires: new Decimal(500),
    resource: "interactions",
    baseResource: "particles",
    baseAmount() {return player.p.points},
    type: "normal",
    exponent: 0.25,
    gainMult() {
        mult = new Decimal(1)
        if (hasUpgrade('s',11)) mult = mult.mul(layerEffect('s'))
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 1,
    branches: ["p"],
    hotkeys: [
        {key: "i", description: "I: Reset for interactions", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    resetDescription:"Entangle particles for ",
    layerShown(){
        return hasUpgrade('p',15) || player.i.unlocked
    },
    effect(){
        if (!hasUpgrade('i',11)) return decimalOne
        if (hasUpgrade('i',23)){
            mult = player.i.best.add(1)
            exp = 0.4
            if(hasUpgrade('s',21)) exp = exp + 0.1
            if(hasUpgrade('s',25)) exp = exp + 0.05
            mult = mult.pow(exp)
        }else{
        mult = player.i.best.add(1).log2().mul(2).add(1)
        if (hasUpgrade('i',13)) mult = mult.pow(upgradeEffect('i',13))
        }
        return mult
    },
    effectDescription(){
        if (!hasUpgrade('i',11)) return "which has no effect."
        let dis = "which boosts particles"
        if (hasUpgrade('i',14)) dis = dis + " and points"
        dis = dis + " gain by x"+layerText("h2", "i", format(tmp.i.effect))
        return dis
    },
    passiveGeneration(){
        if (hasUpgrade('t',12)) return layerEffect('t')
        else return decimalZero
    },
    doReset(resettingLayer) {
        let keep = []
        if (hasMilestone('t',0)) keep.push('milestones')
        if (hasMilestone('t',1) && resettingLayer == 't') keep.push('upgrades')
        if (hasMilestone('s',0) && resettingLayer == 's') keep.push('upgrades')
        //T and S layer also reset this layer
        if (layers[resettingLayer].row > this.row || resettingLayer == 't' || resettingLayer == 's') layerDataReset(this.layer, keep)
    },
    milestones: {
        0:{
            requirementDescription: "(I0)3 total interactions",
            done() { return player.i.total.gte(3) },
            effectDescription: "Start with 10 points on reset of this layer or higher."
        },
        1:{
            requirementDescription: "(I1)20 total interactions",
            done() { return player.i.total.gte(20) },
            unlocked() { return hasMilestone('i',0) || hasMilestone('i',1)},
            effectDescription: "Keep particle upgrades on interaction reset."
        }
    },
    upgrades: {
        rows: 2,
        cols: 5,
        11:{
            title: "I11:Particle interactions",
            description: "Best interactions boost particles gain.",
            cost: new Decimal(1),
            effect(){return true},
        },
        12:{
            title: "I12:Interactive particles",
            description: "Gives P15 an effect.",
            cost: new Decimal(4),
            effect(){return true},
            unlocked(){
                return hasUpgrade('i',11)
            }
        },
        13:{
            title: "I13:Powerful interactions",
            description: "Square interactions effect.",
            cost: new Decimal(30),
            effect(){
                if (hasUpgrade('i',23)) return decimalOne
                let exp = new Decimal(2)
                if (hasUpgrade('i',21)) exp = exp.add(upgradeEffect('i',21))
                return exp
            },
            effectDisplay(){
                if(hasUpgrade('i',23)) return "Disabled."
                return '^' + format(upgradeEffect('i',13))
            },
            unlocked(){
                return hasUpgrade('i',12)
            }
        },
        14:{
            title: "I14:Point interactions",
            description: "Interactions also boost points gain.",
            cost: new Decimal(100),
            effect(){return true},
            unlocked(){
                return hasUpgrade('i',13)
            }
        },
        15:{
            title: "I15:Spacetime",
            description: "Unlock 2 layers.",
            cost: new Decimal(100),
            effect(){return true},
            unlocked(){
                return hasUpgrade('i',14)
            }
        },
        21:{
            title: "I21:Contained interactions",
            description: "I13 effect exponent +2",
            cost(){return (player.s.unlockOrder)?(new Decimal(1e25)):(new Decimal(1e10))},
            effect(){
                return new Decimal(2)
            },
            effectDisplay(){
                return "+" + format(upgradeEffect('i',21))
            },
            unlocked(){
                return hasUpgrade('s',14) || hasUpgrade('i',21)
            }
        },
        22:{
            title: "I22:Interactive organization",
            description: "S13 effect exponent +1",
            cost(){return (player.s.unlockOrder)?(new Decimal(1e31)):(new Decimal(1e25))},
            effect(){
                return new Decimal(1)
            },
            effectDisplay(){
                return "+" + format(upgradeEffect('i',22))
            },
            unlocked(){
                return hasUpgrade('s',14) && hasUpgrade('i',21) || hasUpgrade('i',22)
            }
        },
        23:{
            title: "I23:Shaped interactions",
            description: "Improve interaction effect formula. Disables I13.",
            cost:new Decimal(3e41),
            effect(){return true},
            unlocked(){
                return hasUpgrade('s',14) && hasUpgrade('i',22) || hasUpgrade('i',23)
            }
        },
        24:{
            title: "I24:Spacetime manifold",
            description: "Both space and time layers behaves as if unlocked first.",
            cost: new Decimal(1e30),
            effect(){return true},
            onPurchase(){
                player.s.unlockOrder=0
                player.t.unlockOrder=0
                return null
            },
            unlocked(){
                return hasUpgrade('s',15) && hasUpgrade('t',15)
            }
        },
        25:{
            title: "I25:Manifold shaping",
            description: "Unlock 5 space upgrades (S21-S25).",
            cost: new Decimal(1e50),
            effect(){return true},
            unlocked(){
                return hasUpgrade('i',24)
            }
        },
    },
    
})

addLayer("t", {
    name: "time",
    symbol: "T",
    position: 2,
    startData(){ return {
                unlocked: false,
        		points: decimalZero,
                best: decimalZero,
                total: decimalZero,
                unlockOrder:0
        }},
    color: "#E145E4", //this color doesn't look right, 114514, heng, heng, aaaaaaaa
    requires(){return (player.t.unlockOrder)?(new Decimal(2e12)):(new Decimal(200))},
    resource: "time power", 
    baseResource: "interactions", 
    baseAmount() {return player.i.points}, 
    type: "static", 
    exponent(){return (player.t.unlockOrder)?(1.5):(1.4)}, 
    base: 2,
    gainMult() { return new Decimal(1)},
    gainExp() { return new Decimal(1)},
    row: 1, 
    branches: ["i"],
    hotkeys: [
        {key: "t", description: "T: Reset for time power", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    resetDescription:'Formulate ',
    layerShown(){
        return hasUpgrade('i',15) || player.t.unlocked
    },
    increaseUnlockOrder:["s"],
    effect(){
        //affects non-autobuyer process
        mult = player.t.best.add(1)

        if(hasUpgrade('t',13)) mult = mult.mul(buyableEffect('t',11))
        return mult
    },
    effectDescription(){
        return "which boosts time speed by x" + layerText("h2", "t", format(tmp.t.effect))
    },
    milestones: {
        0:{
            requirementDescription: "(T0)1 time power",
            done() { return player.t.points.gte(1) },
            effectDescription: "Keep particle upgrades and interaction milestones on reset."
        },
        1:{
            requirementDescription: "(T1)3 time power",
            done() { return player.t.points.gte(3) },
            effectDescription: "Keep interaction upgrades on time reset."
        },
        2:{
            requirementDescription: "(T2)12 time power",
            done() { return player.t.points.gte(12) },
            effectDescription: "Time buyable doesn't subtract from time power.",
            unlocked(){
                return hasUpgrade('t',13) || hasMilestone('t',2)
            }
        },
        3:{
            requirementDescription: "(T3)50 time power",
            done() { return player.t.points.gte(50) },
            effectDescription: "Time power resets nothing.",
            unlocked(){
                return hasUpgrade('i',24) || hasMilestone('t',3)
            }
        }
    },
    resetsNothing(){ return hasMilestone('t',3)},
    doReset(resettingLayer) {
        let keep = []
        //This layer is not reset until much later
        if (layers[resettingLayer].row >= 5) layerDataReset(this.layer, keep)
    },
    upgrades: {
        rows: 1,
        cols: 5,
        11:{
            title: "T11:Particle flow",
            description: "Generate particles automatically.",
            cost: new Decimal(1),
            effect(){return true},
        },
        12:{
            title: "T12:Interaction flow",
            description: "Generate interactions automatically.",
            cost: new Decimal(2),
            effect(){return true},
            unlocked(){
                return hasUpgrade('t',11)
            }
        },
        13:{
            title: "T13:Time enhancement",
            description: "Unlock a buyable to boost time speed.",
            cost: new Decimal(5),
            effect(){return true},
            unlocked(){
                return hasUpgrade('t',12)
            }
        },
        14:{
            title: "T14:Boosted enhancement",
            description: "Unlock another buyable to the previous buyable.",
            cost: new Decimal(9),
            effect(){return true},
            unlocked(){
                return hasUpgrade('t',13)
            }
        },
        15:{
            title: "T15:Time Manifold",
            description: "Part of the Spacetime manifold.",
            cost: new Decimal(17),
            effect(){return true},
            unlocked(){
                return hasUpgrade('t',14)
            }
        },
    },
    buyables: {
        rows: 1,
        cols: 3,
        11:{
			title: "Time enhancer",
			cost(x=player.t.buyables[11]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let cost = Decimal.pow(1.4,x).ceil().add(2)
                return cost
            },
            base() { 
                let base = new Decimal(2)
                if(hasUpgrade('t',14)) base = base.add(tmp.t.buyables[12].effect)
                return base
            },
			effect() { // Effects of owning x of the items, x is a decimal
                if(!hasUpgrade('t',12)) return decimalOne
                let x = getBuyableAmount('t',11)
                let base = tmp.t.buyables[11].base
                return Decimal.pow(base, x);
            },
			display() { // Everything else displayed in the buyable button after the title
                if (player.tab != "t") return 
                return "Multiply time speed by "+format(this.base())+".\n\
                Cost: " + format(tmp.t.buyables[11].cost)+" time power\n\
                Effect: " + format(tmp.t.buyables[11].effect)+"x\n\
                Amount: " + formatWhole(getBuyableAmount("t", 11)) 
            },
            unlocked() { return hasUpgrade('t',13) }, 
            canAfford() { return player.t.points.gte(tmp.t.buyables[11].cost)},
            buy() { 
                cost = tmp.t.buyables[11].cost
                if (tmp.t.buyables[11].canAfford) {
                    if(!hasMilestone('t',2)) player.t.points = player.t.points.sub(cost).max(0)
                    player.t.buyables[11] = player.t.buyables[11].add(1).max(1)
                }
            },
            /*buyMax(max) {
                let s = player.s.severity
                let target = Decimal.log10(s.div(1e15)).div(Decimal.log10(2.5)).pow(10/13)
                target = target.ceil()
                let cost = Decimal.pow(2.5, target.sub(1).pow(1.3)).mul(1e15)
                let diff = target.sub(player.s.buyables[11])
                if (tmp.s.buyables[11].canAfford) {
                    if (!hasMilestone("d", 4)) player.s.severity = player.s.severity.sub(cost).max(0)
                    if (diff.gt(max)) diff = max
                    player.s.buyables[11] = player.s.buyables[11].add(diff)
                }
            },*/
        },
        12:{
			title: "Enhancer booster",
			cost(x=player.t.buyables[12]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let cost = Decimal.pow(1.6,x).mul(4).ceil().add(4)
                return cost
            },
            base() { 
                let base = new Decimal(1)
                return base
            },
			effect() { // Effects of owning x of the items, x is a decimal
                if(!hasUpgrade('t',14)) return decimalZero
                let x = getBuyableAmount('t',12)
                let base = tmp.t.buyables[12].base
                return base.mul(x);
            },
			display() { // Everything else displayed in the buyable button after the title
                if (player.tab != "t") return 
                return "Add "+format(this.base())+" to previous buyable base.\n\
                Cost: " + format(tmp.t.buyables[12].cost)+" time power\n\
                Effect: +" + format(tmp.t.buyables[12].effect)+"\n\
                Amount: " + formatWhole(getBuyableAmount("t", 12)) 
            },
            unlocked() { return hasUpgrade('t',14) }, 
            canAfford() { return player.t.points.gte(tmp.t.buyables[12].cost)},
            buy() { 
                cost = tmp.t.buyables[12].cost
                if (tmp.t.buyables[12].canAfford) {
                    if(!hasMilestone('t',2)) player.t.points = player.t.points.sub(cost).max(0)
                    player.t.buyables[12] = player.t.buyables[12].add(1).max(1)
                }
            },
        },
    }
})

addLayer("s", {
    name: "space",
    symbol: "S",
    position: 0,
    startData(){ return {
                unlocked: false,
        		points: decimalZero,
                best: decimalZero,
                total: decimalZero,
                unlockOrder:0
        }},
    color: "#334477",
    requires(){return (player.s.unlockOrder)?(new Decimal(2e12)):(new Decimal(200))},
    resource: "space", 
    baseResource: "interactions", 
    baseAmount() {return player.i.points}, 
    type: "normal", 
    exponent: 0.2, 
    gainMult() { 
        mult = new Decimal(1)
        return mult
    },
    gainExp() { 
        return new Decimal(1)
    },
    softcap(){
        //energy and stars boost this
        let cap = new Decimal(1e30)
        return cap
    },
    softcapPower(){
        //Dimension boost this, which is unlocked much later
        let dim = new Decimal(3)
        return decimalOne.div(dim)
    },
    row: 1, 
    branches: ["i"],
    hotkeys: [
        {key: "s", description: "S: Reset for space", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    resetDescription:'Construct ',
    layerShown(){
        return hasUpgrade('i',15) || player.s.unlocked
    },
    increaseUnlockOrder:["t"],
    effect(){
        if(!hasUpgrade('s',11)) return decimalOne
        if(hasUpgrade('s',24)){
            mult = player.s.best.add(1)
            exp = new Decimal(0.9)
        }else{
            mult = player.s.best.add(1).log2().mul(2).add(1)
            exp = new Decimal(2)
            if(hasUpgrade('s',13)) exp = exp.add(upgradeEffect('s',13))
        }
        return mult.pow(exp)
    },
    effectDescription(){
        if(!hasUpgrade('s',11)) return "which has no effect."
        return "which boosts interactions and points gain by x" + layerText("h2", "s", format(tmp.s.effect))
    },
    milestones: {
        0:{
            requirementDescription: "(S0)100 total space",
            done() { return player.s.total.gte(100) },
            effectDescription: "Keep interaction upgrades on space reset."
        }
    },
    doReset(resettingLayer) {
        let keep = []
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    upgrades: {
        rows: 2,
        cols: 5,
        11:{
            title: "S11:Space management",
            description: "Best space boost points and interactions",
            cost: new Decimal(1),
            effect(){return true},
        },
        12:{
            title: "S12:Particle container",
            description: "Unlock 5 more particle upgrades (P21-P25)",
            cost: new Decimal(5),
            effect(){return true},
            unlocked(){
                return hasUpgrade('s',11)
            }
        },
        13:{
            title: "S13:Space organization",
            description: "Organize space to improve space effect by ^2",
            cost: new Decimal(15),
            effect(){
                if(hasUpgrade('s',24)) return decimalOne
                exp = new Decimal(2)
                if(hasUpgrade('i',22)) exp = exp.add(upgradeEffect('i',22))
                return exp
            },
            effectDisplay(){
                if(hasUpgrade('s',24)) return "Disabled."
                return '^' + format(upgradeEffect('s',13))
            },
            unlocked(){
                return hasUpgrade('s',12)
            }
        },
        14:{
            title: "S14:Interactive background",
            description: "Unlock 3 more interaction upgrades (I21-I23)",
            cost: new Decimal(100),
            effect(){return true},
            unlocked(){
                return hasUpgrade('s',13)
            }
        },
        15:{
            title: "S15:Space Manifold",
            description: "Part of the Spacetime manifold.",
            cost: new Decimal(20000),
            effect(){return true},
            unlocked(){
                return hasUpgrade('s',14)
            }
        },
        21:{
            title: "S21:Interaction fine shaping",
            description: "Improves I23 further.",
            cost: new Decimal(1e10),
            effect(){return true},
            unlocked(){
                return hasUpgrade('i',25) || hasUpgrade('s',21)
            }
        },
        22:{
            title: "S22:Particle fine shaping",
            description: "Improves P22 further.",
            cost: new Decimal(1e11),
            effect(){return true},
            unlocked(){
                return hasUpgrade('i',25) && hasUpgrade('s',21) || hasUpgrade('s',22)
            }
        },
        23:{
            title: "S23:Point fine shaping",
            description: "Improves P25 further.",
            cost: new Decimal(1e14),
            effect(){return true},
            unlocked(){
                return hasUpgrade('i',25) && hasUpgrade('s',22) || hasUpgrade('s',23)
            }
        },
        24:{
            title: "S24:Space shaping",
            description: "Improves S11 formula. Disables S13.",
            cost: new Decimal(1e17),
            effect(){return true},
            unlocked(){
                return hasUpgrade('i',25) && hasUpgrade('s',23) || hasUpgrade('s',24)
            }
        },
        25:{
            title: "S25:Interactions precise shaping",
            description: "Improves I23 even further.",
            cost: new Decimal(1e23),
            effect(){return true},
            unlocked(){
                return hasUpgrade('i',25) && hasUpgrade('s',24) || hasUpgrade('s',25)
            }
        },
    },
})


addLayer("m", {
    name: "mass",
    symbol: "M",
    position: 0,
    startData(){ return {
                unlocked: false,
        		points: decimalZero,
                best: decimalZero,
                total: decimalZero
        }},
    color: "#554422",
    requires: new Decimal(1e32),
    resource: "mass", 
    baseResource: "space", 
    baseAmount() {return player.s.points}, 
    type: "normal", 
    exponent: 0.05, 
    gainMult() { 
        mult = new Decimal(1)
        return mult
    },
    gainExp() { 
        return new Decimal(1)
    },
    row: 2, 
    branches: ["i","s"],
    hotkeys: [
        //{key: "m", description: "M: Reset for mass", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    resetDescription:'Condense ',
    layerShown(){
        return player.s.points.gte(1e30) || player.m.unlocked
    },
    increaseUnlockOrder:["t"],
    effect(){
        if(!hasUpgrade('m',11)) return decimalOne
        mult = player.m.best.add(1).pow(5)
        return mult
    },
    effectDescription(){
        if(!hasUpgrade('m',11)) return "which has no effect."
        return "which boosts ??? gain by x" + layerText("h2", "m", format(tmp.s.effect))
    },
    milestones: {
        0:{
            requirementDescription: "(M0)114514 total mass",
            done() { return false },
            effectDescription: "Keep 1919810."
        }
    },
    doReset(resettingLayer) {
        let keep = []
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    upgrades: {
        rows: 2,
        cols: 5,
        11:{
            title: "S11:Massive influence",
            description: "Best mass boosts ???",
            cost: new Decimal(1),
            effect(){return true},
        },
    },
})