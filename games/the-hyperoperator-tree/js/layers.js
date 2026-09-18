addLayer("c", {
    name: "Constants",
    symbol: "C",
    position: 0,
    startData(){ return {
        unlocked: true,
        points: new ExpantaNum(0)
    }},
    update(){
        amt = new ExpantaNum(0)

        amt = applyEffect("upgrades", amt, "s", [13], "add")
        amt = applyEffect("upgrades", amt, "a", [14, 15, 25, "d-25"], "add")
        amt = applyEffect("upgrades", amt, "m", ["r-24"], "add")
        amt = applyEffect("upgrades", amt, "e", [34], "add")

        amt = applyEffect("upgrades", amt, "m", [21], "mul", 0)
        amt = applyEffect("upgrades", amt, "m", ["p-15", "r-15"], "mul", 1)
        amt = applyEffect("upgrades", amt, "m", [25, "p-25", "r-25"], "mul")
        amt = applyEffect("upgrades", amt, "e", [25, 35], "mul")
        amt = applyEffect("upgrades", amt, "e", ["l-15", "l-35"], "mul", 1)

        amt = applyEffect("upgrades", amt, "e", [15, "l-34"], "pow", 1)
        amt = applyEffect("upgrades", amt, "e", ["l-25"], "pow")

        if(player.e.logarithm.inLogarithm)amt = amt.max(1).log10()
        player.c.points = amt

        getPointsPerClick()
    },
    color: "#dddddd",
    resource: "Constant Points",
    type: "none",
    row: "side",
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Unlock I",
            description: "Unlock the first layer.",
            cost: new ExpantaNum(0),
            canAfford(){return player.c.points.gte(this.cost)}
        },
        12: {
            title: "Unlock II",
            description: "Unlock the second layer.",
            cost: new ExpantaNum(1),
            canAfford(){return player.c.points.gte(this.cost)},
            unlocked(){return hasUpgrade("c", 11)}
        },
        13: {
            title: "Unlock III",
            description: "Unlock Addition Dimensions.",
            cost: new ExpantaNum(2.71828),
            canAfford(){return player.c.points.gte(this.cost)},
            unlocked(){return hasUpgrade("c", 12)}
        },
        14: {
            title: "Unlock IV",
            description: "Unlock the third layer.",
            cost: new ExpantaNum(3.44949),
            canAfford(){return player.c.points.gte(this.cost)},
            unlocked(){return hasUpgrade("c", 13)}
        },
        15: {
            title: "Unlock V",
            description: "Unlock Replication (In the M layer)",
            cost: new ExpantaNum(4.89897),
            unlocked(){return hasUpgrade("c", 14)}
        },
        16: {
            title: "Unlock VI",
            description: "Unlock the fourth layer. Unlock a new tab.",
            cost: new ExpantaNum(12.56637),
            unlocked(){return hasUpgrade("c", 15)}
        },
        21: {
            title: "Unlock VII",
            description: "Unlock Logarithm (In the E layer).",
            cost: new ExpantaNum(42),
            unlocked(){return hasUpgrade("c", 16)}
        },
        /*22: {
            title: "Unlock VIII",
            description: "Unlock the fifth layer (Next Update).",
            cost: new ExpantaNum(120),
        },*/
    },
    milestones: {
        0: {
            requirementDescription: "13 Constant Points",
            effectDescription: "Always keep your Successor and Addition upgrades.",
            done(){return player.c.points.gte(13)},
        },
        1: {
            requirementDescription: "25 Constant Points",
            effectDescription: "Always keep all Addition milestones",
            done(){return player.c.points.gte(25)}
        }
    },
    tabFormat: {
        "Main": {
            content: [
                ["display-text", () => `You have ${colorText("c", {precision:5})} Constant Points.`],
                "blank",
                ["display-text", "Note that some unlocks also requires you to have the final upgrade in the layer's Main tab."],
                "upgrades"
            ]
        },
        "QoL": {
            unlocked(){return hasUpgrade("c", 16)},
            content: [
                ["display-text", () => `You have ${colorText("c", {precision:5})} Constant Points.`],
                "blank",
                "milestones"
            ]
        }
    }
})
addLayer("st", {
    symbol: "ST",
    color: "#444444",
    layerShown(){return true},
    row: "side",
    name: "statistics",
    startData(){ return {
        unlocked: true,
        bestVal: {
            "Points": new ExpantaNum(0),
            "Constant Points": new ExpantaNum(0),
            "Successors": new ExpantaNum(0),
            "Addition Points": new ExpantaNum(0),
            "Addition Power": new ExpantaNum(0),
            "Multiplication Points": new ExpantaNum(0),
            "Multiplication Power": new ExpantaNum(0),
            "Replication Points": new ExpantaNum(0),
            "Exponents": new ExpantaNum(0),
            "Exponential Points": new ExpantaNum(0),
            "Exponential Score": new ExpantaNum(0),
            "Logarithmic Score": new ExpantaNum(0),
            "Logarithmic Points": new ExpantaNum(0),
        }
    }},
    getBestResources(){
        const best = player.st.bestVal
        const amounts = [
            ["Points", player.points],
            ["Constant Points",player.c.points],
            ["Successors",player.s.successors],
            ["Addition Points",player.a.points],
            ['Addition Power',player.a.power],
            ["Multiplication Points",player.m.points],
            ["Multiplication Power",player.m.power],
            ["Replication Points",player.m.replicators],
            ["Exponents",player.e.exponents],
            ["Exponential Points",player.e.points],
            ["Exponential Score",player.e.score],
            ["Logarithmic Score",player.e.logarithm.score],
            ["Logarithmic Points",player.e.logarithm.points]
        ]
        for(const [name, val] of amounts){
            if(!(name in best)){
                throw new Error(`Invalid name ${name} found!`)
            }
            best[name] = best[name].max(val)
        }
    },
    tooltip(){return "Statistics"},
    tabFormat(){
        let best = player.st.bestVal
        let dim = player.a.dimensions
        let rep = player.m.replication
        let effective = player.e.effExp
        let currAmnt = [ // Determines what gets displayed in strings.current
            {val:player.efficiency.points, name:"Point efficiency", type:"nonZero"}, 
            {val:player.s.power, name:"Successor power", type:"neq", unlocked:new ExpantaNum(1)}, {val:player.s.effectiveness, name:"Successor effectiveness", type:"always"}, {val:player.s.amount, name:"Successor amount", type:"always"}, {val:player.efficiency.successor, name:"Successor efficiency", type:"nonZero"}, 
            {val:player.efficiency.addition, name:"Addition efficiency", type:"nonZero"}, {val:player.a.upgEffectiveness, name:"Addition Upgrade Effectiveness", type:"neq", unlocked:new ExpantaNum(100)},
            {val:dim.multiplierPerBuy, name:"Base Multiplier Per Buy", type:"itemUnlock", unlocked:hasUpgrade("c", 13)},
            {val:player.efficiency.multiplication, name:"Multiplication efficiency", type:"nonZero"},
            {val:rep.multiplier, name: "Replication Multiplier", type:"itemUnlock", unlocked:hasUpgrade("c", 15)}, {val:rep.interval, name:"Replication Interval", type:"itemUnlock", unlocked:hasUpgrade("c", 15), formatter:formatTime}, {val:rep.amount, name:"Replication Amount", type:"itemUnlock", unlocked:hasUpgrade("c", 15), formatter:formatWhole},
            {val:effective.upgrades, name: "Exponents to upgrades", string: "effective", type: "neq", unlocked:player.e.exponents, formatter:formatWhole}, {val:effective.score, name: "Exponents to score", string: "effective", type: "neq", unlocked:player.e.exponents, formatter:formatWhole},
            {val:player.e.logarithm.highest, name: "Highest Points in Logarithm", type: "nonZero"}
            

            //val: stores the value
            //name: stores the resource name
            //formatter: Determines the format. (Default: format())
            //unlocked: stores a number or boolean to determine the display (Read type for more information)
            /*string: Determines what string is used
                * effective: Effective [name] is [val]
                * default: Your [name] is [val]    
            */
            /*type: Determines the unlock requirement
                * nonZero: Display the value when it's not 0
                * always: Always display the value
                * neq: Display the value when it is not equal to the value stored in unlocked (Requires unlocked to be an ExpantaNum)
                * itemUnlock: Display the value when unlocked is true (Requires unlocked to be a boolean)
            */
        ]
        let strings = {
            best: {

            },
            current: {},
            passive: {},
        }
        for(let item in best){ // Displays best values
            if(best[item].gt(0)){
                strings.best[item] = `Your highest ${item} ever was ${formatWhole(best[item])}.`

                if(item === "Constant Points" || item === "Logarithmic Score" || item === "Replication Points"){
                    strings.best[item] = `Your highest ${item} ever was ${format(best[item])}.`
                }
            }
            if(item === "Replication Points"){
                if(best[item].lte(1)){
                    strings.best[item] = ``
                }
            }
        }
        let percentages = ["Point efficiency", 'Successor efficiency', "Addition efficiency", "Addition Upgrade Effectiveness", "Multiplication efficiency"]
        for(let i = 0; i < currAmnt.length; i++){ // Displays current values
            strings.current[currAmnt[i].name] = ``
            let objItem = ""
            let obj = currAmnt[i]
            let formatter = obj.formatter || format
            let defaultString = ``
            switch(obj.string){
                case "effective":
                    defaultString = `There's ${formatter(obj.val)} effective ${obj.name}`
                    break;

                default:
                    defaultString = `Your ${obj.name} is ${formatter(obj.val)}`
                    break;
            }
            if(percentages.includes(obj.name)){
                defaultString = defaultString + `%`
            }
            switch(obj.type){
                case "itemUnlock":
                    if(obj.unlocked){
                        objItem = defaultString
                    }
                    break;
                
                case "nonZero":
                    if(obj.val.gt(0)){
                        objItem = defaultString
                    }
                    break;

                case "neq":
                    if(!obj.val.eq(obj.unlocked)){
                        objItem = defaultString
                    }
                    break;

                case "always":
                    objItem = defaultString
                    break;
                
                
                default:
                    throw new Error(`Invalid object type at index ${i} for ${obj.name}`)
                    break;
            }
            strings.current[currAmnt[i].name] = objItem
        }
        let resourceNames = ["Points", "Successors", "Additions", "Multiplications"] // Stores resource names
        let funcs = { // Stores passive gains
            "Points": tmp.s.getPassivePoints,
            "Successors": tmp.s.getPassiveSuccessors,
            "Additions": tmp.a.getPassiveAdditions,
            "Multiplications":tmp.m.getPassiveMultiplications
        }
        for(let i = 0; i < resourceNames.length; i++){ // Displays passive resources
            let r = resourceNames[i]
            if(funcs[r].gt(0)){
                strings.passive[r] = `You are gaining ${format(funcs[r])} ${r} per second.`
            }
        }
        let layerFormat = []
        for(let item in strings){ // Generates TabFormat (DO NOT CHANGE)
            for(let str in strings[item]){
                let s = strings[item][str]
                if(s){
                    layerFormat.push(["display-text", s])
                }
            }
            layerFormat.push("blank")
            layerFormat.push("blank")
        }
        return layerFormat
    }
})
addLayer("s", {
    name: "Successor",
    symbol: "S",
    position: 0,
    row: 0,
    resource: "Points",
    startData(){ return {
        unlocked: true,
        points: new ExpantaNum(0),
        successors: new ExpantaNum(0),
        effectiveness: new ExpantaNum(1),
        amount: new ExpantaNum(1),
        power: new ExpantaNum(0)
    }},
    update(diff){
        player.s.points = player.points
        if(!player.resetting){
            player.points = player.points.add(layers.s.getPassivePoints().mul(diff))
            player.s.successors = player.s.successors.add(layers.s.getPassiveSuccessors().mul(diff))
        }
    },
    color: "#ffffff",
    layerShown(){ return hasUpgrade("c", 11)},
    tabFormat(){ return [
        ["display-text", `You have ${colorText("s", false, false)} Points`],
        ["display-text", `You have successed ${format(player.s.successors)} times.`],
        "blank",
        ["display-text", `Your Successor effectiveness is ${format(player.s.effectiveness)}, which increases Points per succession.`],
        ["display-text", `Your Successor amount is ${format(player.s.amount)}, which increases successions per click.`],
        "clickables",
        "blank",
        "upgrades"
    ]},
    getSuccessorPower(){
        let p = new ExpantaNum(1)

        p = applyEffect("upgrades", p, "m", [11, 15, 23, "p-13"], "mul")
        p = applyEffect("upgrades", p, 'm', ["p-22", "p-23"], "mul", 1)
        p = p.mul(tmp.e.getScoreEffect)

        if(player.e.logarithm.inLogarithm)p = p.max(1).logBase(player.e.logarithm.base)

        player.s.power = p
    },
    getSuccessorEffectiveness(){
        let e = new ExpantaNum(1)

        e = applyEffect("upgrades", e, "s", [11], "add")
        e = applyEffect("upgrades", e, "a", [11, 13, 21, "d-11"], "add")
        e = applyEffect("upgrades", e, "a", [23, "d-24"], "add", 0)
        e = e.mul(player.s.power)
        e = e.mul(tmp.e.getScoreEffect)

        if(player.e.logarithm.inLogarithm)e = e.max(1).logBase(player.e.logarithm.base)
        e = applyEffect('buyables', e, "e", [23], "mul")
        e = applyEffect("upgrades", e, "e", ["l-32"], "mul", 1)

        player.s.effectiveness = e
    },
    getSuccessorAmount(){
        let a = new ExpantaNum(1)

        a = applyEffect("upgrades", a, "s", [12], "add")
        a = applyEffect("upgrades", a, "a", [12, 13, 21, "d-12"], "add")
        a = applyEffect("upgrades", a, "a", [23, "d-24"], "add", 1)
        a = a.mul(player.s.power)
        a = applyEffect("upgrades", a, "m", [12], "mul")
        a = a.mul(tmp.e.getScoreEffect)

        if(player.e.logarithm.inLogarithm)a = a.max(1).logBase(player.e.logarithm.base)

        player.s.amount = a
    },
    getPassiveSuccessors(){
        let gain = new ExpantaNum(0)
        if(hasMilestone("a", 1))gain = new ExpantaNum(100)
        gain = applyEffect("upgrades", gain, "a", [22, "d-22"], "add")
        gain = applyEffect("upgrades", gain, "a", [24, "d-24"], "add", 1)
        gain = applyEffect("upgrades", gain, "m", [22], "mul")
        gain = applyEffect("upgrades", gain, "e", [24, 31], "mul")
        gain = applyEffect("upgrades", gain, "e", [13], "pow", 1)

        if(player.e.logarithm.inLogarithm)gain = gain.max(1).logBase(player.e.logarithm.base)


        player.efficiency.successor = gain

        return player.s.amount.mul(player.efficiency.successor).div(100)
    },
    getPassivePoints(){
        gain = new ExpantaNum(0)
        if(hasMilestone("a", 0))gain = new ExpantaNum(100)
        gain = applyEffect("upgrades", gain, "a", [22, "d-21"], "add")
        gain = applyEffect("upgrades", gain, "a", [24, "d-24"], "add", 0)
        gain = applyEffect("upgrades", gain, "m", [22], "mul")
        gain = applyEffect("upgrades", gain, "e", [24, 31], "mul")
        gain = applyEffect("upgrades", gain, "e", [13], "pow", 1)

        if(player.e.logarithm.inLogarithm)gain = gain.max(1).logBase(player.e.logarithm.base)

        player.efficiency.points = gain

        return player.perClick.mul(player.efficiency.points).div(100)
    },
    clickables: {
        11: {
            title: `Gain points`,
            onClick(){
                player.points = player.points.add(player.perClick)
                player.s.successors = player.s.successors.add(player.s.amount)
            },
            canClick(){return !player.e.logarithm.inLogarithm}
        }
    },
    upgrades: {
        11: {
            title: "Successor I",
            description: "Successor effectiveness is increased by +1.",
            cost: new ExpantaNum(10),
            canAfford(){ return player.points.gte(this.cost)},
            onPurchase(){ player.points = player.points.sub(this.cost)},
            effect(){
                let eff = new ExpantaNum(1)

                return eff
            },
            effectDisplay(){ return `+${this.effect()} to Successor effectiveness.`},
        },
        12: {
            title: "Successor II",
            description: "Successor amount is increased by +1.",
            cost: new ExpantaNum(30),
            canAfford(){ return player.points.gte(this.cost)},
            onPurchase(){ player.points = player.points.sub(this.cost)},
            effect(){
                let eff = new ExpantaNum(1)

                return eff
            },
            effectDisplay(){ return `+${this.effect()} to Successor amount.`},
        },
        13: {
            title: "Constant I",
            description: "Add 1 to you Constant Points amount.",
            cost: new ExpantaNum(100),
            canAfford(){ return player.points.gte(this.cost)},
            onPurchase(){ player.points = player.points.sub(this.cost)},
            effect(){
                let eff = new ExpantaNum(1)

                return eff
            },
            effectDisplay(){ return `+${this.effect()} Constant Points.`},
        },
    },
    doReset(resettingLayer){
        if(layers[resettingLayer].row > layers.s.row){
            keeps = []
            if((hasMilestone("a", 1) && resettingLayer === "a") || (hasMilestone("m", 1) && resettingLayer === "m") || hasMilestone("c", 0))keeps.push("upgrades")
            layerDataReset("s", keeps)
            
            if(player.points.gt(0))player.points = new ExpantaNum(0)
        }
    }
})
addLayer("a", {
    name: "Addition",
    symbol: "A",
    row: 1,
    position: 0,
    color: "#00FF00",
    branches: ["s"],
    layerShown(){return hasUpgrade("c", 12)},
    startData(){ return {
        unlocked: false,
        points: new ExpantaNum(0),
        power: new ExpantaNum(0),
        dimensions: {
            "dim1": {
                "purchased": new ExpantaNum(0),
                "produced": new ExpantaNum(0),
                "total": new ExpantaNum(0),
                "multiplier": new ExpantaNum(1),
                "multOnBuy": new ExpantaNum(1)
            },
            "dim2": {
                "purchased": new ExpantaNum(0),
                "produced": new ExpantaNum(0),
                "total": new ExpantaNum(0),
                "multiplier": new ExpantaNum(1),
                "multOnBuy": new ExpantaNum(1)
            },
            "dim3": {
                "purchased": new ExpantaNum(0),
                "produced": new ExpantaNum(0),
                "total": new ExpantaNum(0),
                "multiplier": new ExpantaNum(1),
                "multOnBuy": new ExpantaNum(1)
            },
            "dim4": {
                "purchased": new ExpantaNum(0),
                "produced": new ExpantaNum(0),
                "total": new ExpantaNum(0),
                "multiplier": new ExpantaNum(1),
                "multOnBuy": new ExpantaNum(1)
            },
            "dim5": {
                "purchased": new ExpantaNum(0),
                "produced": new ExpantaNum(0),
                "total": new ExpantaNum(0),
                "multiplier": new ExpantaNum(1),
                "multOnBuy": new ExpantaNum(1)
            },
            "dim6": {
                "purchased": new ExpantaNum(0),
                "produced": new ExpantaNum(0),
                "total": new ExpantaNum(0),
                "multiplier": new ExpantaNum(1),
                "multOnBuy": new ExpantaNum(1)
            },
            "dim7": {
                "purchased": new ExpantaNum(0),
                "produced": new ExpantaNum(0),
                "total": new ExpantaNum(0),
                "multiplier": new ExpantaNum(1),
                "multOnBuy": new ExpantaNum(1)
            },
            "dim8": {
                "purchased": new ExpantaNum(0),
                "produced": new ExpantaNum(0),
                "total": new ExpantaNum(0),
                "multiplier": new ExpantaNum(1),
                "multOnBuy": new ExpantaNum(1)
            },
            multiplierPerBuy: new ExpantaNum(1),
            amount: 8,
            unlocked: 1,
        },
        upgEffectiveness: new ExpantaNum(100),
    }},
    update(diff){
        //console.log(player.subtabs.a)
        if(player.subtabs.a.mainTabs === undefined){player.subtabs["a"].mainTabs = "Main"}
        if(!player.resetting){
            player.a.points = player.a.points.add(layers.a.getPassiveAdditions().mul(diff))
            player.a.total = player.a.total.add(layers.a.getPassiveAdditions().mul(diff))
        }
    },
    getResetGain(){
        let gain = layers.a.baseAmount().div(layers.a.requires).pow(layers.a.exponent)
        gain = applyEffect("upgrades", gain, "a", ["d-14"], "add")
        
        return gain.mul(layers.a.gainMult()).floor()
    },
    getNextAt(){
        let next = layers.a.getResetGain().add(1)
        if(hasUpgrade("a", "d-14"))next = next.sub(upgradeEffect("a", "d-14"))
        next = next.div(layers.a.gainMult()).pow(2).mul(layers.a.requires)
        if(next.lt(layers.a.requires))next = layers.a.requires

        return next
    },
    gainMult(){
        let mul = new ExpantaNum(1)

        mul = applyEffect("upgrades", mul, "m", [11, 15, "p-12"], "mul")
        //console.log(mul.toString())
        mul = mul.mul(tmp.e.getScoreEffect)
        mul = applyEffect("upgrades", mul, "e", [11], "mul")

        return mul
    },
    type: "normal",
    baseResource: "Successors",
    baseAmount(){return player.s.successors},
    requires: new ExpantaNum(100),
    exponent: new ExpantaNum(0.5),
    resource: "Addition Points",
    getPassiveAdditions(){
        let gain = new ExpantaNum(0)
        if(hasMilestone("m", 1))gain = new ExpantaNum(25)
        gain = applyEffect("upgrades", gain, "m", [23], "mul")
        gain = applyEffect("upgrades", gain, "m", ["p-22"], "mul", 0)
        gain = applyEffect("upgrades", gain, "e", [24, 31], "mul")

        if(player.e.logarithm.inLogarithm)gain = gain.max(1).logBase(player.e.logarithm.base)

        player.efficiency.addition = gain
        return layers.a.getResetGain().mul(player.efficiency.addition.div(100))
    },
    getMultiplierPerBuy(){
        let dim = player.a.dimensions
        let mult = new ExpantaNum(1)
        mult = applyEffect("upgrades", mult, "a", ["d-13", "d-15", "d-23"], "add")
        mult = applyEffect("upgrades", mult, "m", [13], "mul")
        mult = applyEffect("upgrades", mult, "e", [21], "mul", 0)
        mult = mult.mul(tmp.e.getScoreEffect)

        if(player.e.logarithm.inLogarithm)mult = mult.max(1).logBase(player.e.logarithm.base)
        dim.multiplierPerBuy = mult
    },
    getDimMultOnBuy(){
        let dim = player.a.dimensions
        for(let i = 1; i <= dim.amount; i++){
            let d = dim[`dim${i}`]
            d.multOnBuy = dim.multiplierPerBuy
            if(hasUpgrade("m", "p-21"))dim[`dim${i}`].multOnBuy = dim[`dim${i}`].multOnBuy.mul(upgradeEffect("m", "p-21").mul(i).add(1))
        }
    },
    autobuyDims(){
        let dim = player.a.dimensions
        let buyb = layers.a.buyables
        let automated = {
            "dim1": hasMilestone("m", 2),
            "dim2": hasMilestone("m", 2),
            "dim3": hasMilestone("m", 2),
            "dim4": hasMilestone("m", 2),
            "dim5": hasMilestone("m", 3),
            "dim6": hasMilestone("m", 3),
            "dim7": hasMilestone("m", 3),
            "dim8": hasMilestone("m", 3),
        }
        for(let i = 1; i <= dim.amount; i++){
            if(automated[`dim${i}`]){
                if(buyb[`Dim${i}`].canAfford()){
                    dim[`dim${i}`].purchased = dim[`dim${i}`].purchased.add(1)
                }
            }
        }
    },
    getDimensionMultipliers(){
        let dim = player.a.dimensions
        for(let i = 1; i <= dim.amount; i++){
            dim[`dim${i}`].multiplier = dim[`dim${i}`].multOnBuy.mul(dim[`dim${i}`].purchased).add(1)

        }
        //player.a.dimensions.dim1.multiplier = player.a.dimensions.multiplierPerBuy.mul(player.a.dimensions.dim1.purchased).add(1)
    },
    generateFromDimensions(diff){
        let dim = player.a.dimensions
        if(!player.resetting){
            player.a.power = player.a.power.add(player.a.dimensions.dim1.total.mul(player.a.dimensions.dim1.multiplier).div(20))
            for(let i = 2; i <= dim.amount; i++){
                dim[`dim${i-1}`].produced = dim[`dim${i-1}`].produced.add(dim[`dim${i}`].total.mul(dim[`dim${i}`].multiplier).mul(diff))
            }
        }
    },
    getDimensionTotal(){
        let dim = player.a.dimensions
        for(let i = 1; i <= dim.amount; i++){
            //console.log(dim, i, dim[`dim${i}`])
            dim[`dim${i}`].total = dim[`dim${i}`].purchased.add(dim[`dim${i}`].produced)
        }
        //dim.dim1.total = dim.dim1.purchased.add(dim.dim1.produced)
    },
    getUnlockedDimensions(){
        let dim = player.a.dimensions
        dim.unlocked = 1
        for(let i = 1; i < dim.amount; i++){
            if(dim[`dim${i}`].purchased.gte(1)){
                dim.unlocked += 1
            }
        }
    },
    getUpgradeEffectiveness(){
        let e = new ExpantaNum(100)

        e = applyEffect("upgrades", e, "m", [24], "mul")

        player.a.upgEffectiveness = e
    },
    milestones: {
        0: {
            requirementDescription: "5 total Addition Points",
            effectDescription: "Passively generate 100% of Points per second",
            done(){ return player.a.total.gte(5)}
        },
        1: {
            requirementDescription: "15 total Addition Points",
            effectDescription: "Passively generate 100% of Successors per second. Keep all S upgrades.",
            done(){ return player.a.total.gte(15)},
            unlocked(){return hasMilestone("a", 0)}
        },
        2: {
            requirementDescription: `30 total Addition points`,
            effectDescription: `You can now success in the Addition layer.`,
            done(){return player.a.total.gte(30)},
            unlocked(){return hasMilestone("a", 1)}
        }
    },
    clickables: {
        11: {
            title: `Gain points`,
            onClick(){
                player.points = player.points.add(player.perClick)
                player.s.successors = player.s.successors.add(player.s.amount)
            },
            canClick(){return !player.e.logarithm.inLogarithm},
            style(){if(this.canClick())return {"background-color":"#ffffff"}},
            unlocked(){return hasMilestone("a", 2)}
        }
    },
    upgrades: {
        11: {
            title: "Addition I",
            description: "Addition upgrades bought add to Successor effectiveness.",
            cost: new ExpantaNum(1),
            effect(){
                let eff = new ExpantaNum(player.a.upgrades.length)
                eff = applyEffect("upgrades", eff, "m", [14], "mul")

                eff = eff.mul(player.a.upgEffectiveness.div(100))
                return eff
            },
            effectDisplay(){ return `+${format(this.effect())} to Successor effectiveness.`}
        },
        12: {
            title: "Addition II",
            description: "Addition upgrades bought add to Successor amount.",
            cost: new ExpantaNum(2),
            effect(){
                let eff = new ExpantaNum(player.a.upgrades.length)
                eff = applyEffect("upgrades", eff, "m", [14], "mul")

                eff = eff.mul(player.a.upgEffectiveness.div(100))
                return eff
            },
            effectDisplay(){ return `+${format(this.effect())} to Successor amount.`},
            unlocked(){return hasUpgrade("a", 11)}
        },
        13: {
            title: "Addition III",
            description: "Constant Points add to Successor effectiveness and Successor amount.",
            cost: new ExpantaNum(3),
            effect(){
                let eff = player.c.points

                eff = applyEffect("upgrades", eff, "m", [21], "mul", 1)

                eff = eff.mul(player.a.upgEffectiveness.div(100))
                return eff
            },
            effectDisplay(){ return `+${format(this.effect())} to Successor effectiveness and amount.`},
            unlocked(){return hasUpgrade("a", 12)}
        },
        14: {
            title: "Constant II",
            description(){return `Points add to Constant Points, up to a maximum of ${format(this.limit())}.`},
            cost: new ExpantaNum(5),
            limit(){
                let limit = new ExpantaNum(1)
                limit = applyEffect("upgrades", limit, "e", [15], "add", 0)

                return limit
            },
            effect(){
                let eff = player.points.max(1).log10().max(1).log10().min(this.limit())

                return eff
            },
            effectDisplay(){ return `+${format(this.effect())} Constant Points.`},
            unlocked(){return hasUpgrade("a", 13)}
        },
        15: {
            title: "Constant III",
            description(){return `Successors add to Constant Points, up to a maximum of ${format(this.limit())}.`},
            cost: new ExpantaNum(10),
            limit(){
                let limit = new ExpantaNum(1)
                limit = applyEffect("upgrades", limit, "e", [15], "add", 0)

                return limit
            },
            effect(){
                let eff = player.s.successors.max(1).log10().max(1).log10().min(this.limit())

                return eff
            },
            effectDisplay(){ return `+${format(this.effect())} to Constant Points.`},
            unlocked(){return hasUpgrade("a", 14)}
        },
        21: {
            title: "Addition IV",
            description: `Addition Points increase Successor amount and effectiveness.`,
            cost: new ExpantaNum(15),
            effect(){
                let eff = player.a.points.pow(0.33)
                if(eff.gte(1.00e10))eff = eff.log10().pow(10)

                eff = eff.mul(player.a.upgEffectiveness.div(100))
                return eff
            },
            effectDisplay(){return `+${format(this.effect())} to Successor amount and effectiveness.`},
            unlocked(){return hasUpgrade("a", 15)}
        },
        22: {
            title: `Addition V`,
            description: `Add 50% to Point and Successor gain efficiency.`,
            cost: new ExpantaNum(20),
            effect(){
                let eff = new ExpantaNum(50)

                eff = eff.mul(player.a.upgEffectiveness.div(100))
                return eff
            },
            effectDisplay(){return `+${format(this.effect())}% to Point and Successor gain efficiency.`},
            unlocked(){return hasUpgrade("a", 21)}
        },
        23: {
            title: "Addition VI",
            description: "Points and Successions add to Successor effectiveness and amount respectively.",
            cost: new ExpantaNum(25),
            effect(){
                let eff1 = player.points.max(1).log10()
                let eff2 = player.s.successors.max(1).log10()

                eff1 = eff1.mul(player.a.upgEffectiveness.div(100))
                eff2 = eff2.mul(player.a.upgEffectiveness.div(100))
                return [eff1, eff2]
            },
            effectDisplay(){return `+${format(this.effect()[0])} to Successor effectiveness, +${format(this.effect()[1])} to Successor amount.`},
            unlocked(){return hasUpgrade("a", 22)}
        },
        24: {
            title: "Addition VII",
            description: "The previous upgrade applies to generation effeciciency at an increased rate.",
            cost: new ExpantaNum(30),
            effect(){
                if(Array.isArray(upgradeEffect("a", 23))){
                    let eff1 = upgradeEffect("a", 23)[0].mul(1.2)
                    let eff2 = upgradeEffect("a", 23)[1].mul(1.5)
                    eff1 = eff1.pow(2.5).mul(2)
                    eff2 = eff2.pow(2.5).mul(2)
                    if(eff1.gte(100))eff1 = eff1.div(100).pow(0.5).mul(100)
                    if(eff2.gte(100))eff2 = eff2.div(100).pow(0.5).mul(100)

                    eff1 = eff1.mul(player.a.upgEffectiveness.div(100))
                    eff2 = eff2.mul(player.a.upgEffectiveness.div(100))
                    return [eff1, eff2]
                } else {
                    return [1, 1]
                }
            },
            effectDisplay(){return `+${format(this.effect()[0])}% to Point generation efficiency, +${format(this.effect()[1])}% to Successor generation efficiency.`},
            unlocked(){return hasUpgrade("a", 23)}
        },
        25: {
            title: "Constant IV",
            description: `Add 0.65 to Constant Points.`,
            cost: new ExpantaNum(40),
            effect(){
                let eff = new ExpantaNum(0.65)

                return eff
            },
            effectDisplay(){return `+${format(this.effect())} to Constant Points`},
            unlocked(){return hasUpgrade("a", 24)}
        },
        "d-11": {
            title: "AD I",
            description: `Addition Power adds to Successor effectiveness.`,
            cost: new ExpantaNum(100),
            currencyLayer: "a",
            currencyInternalName: "power",
            currencyDisplayName: "Addition Power",
            effect(){
                let eff = player.a.power.max(1).log10().pow(2)

                eff = eff.mul(player.a.upgEffectiveness.div(100))
                return eff
            },
            effectDisplay(){return `+${format(this.effect())} to Successor effectiveness.`},
            unlocked(){return hasUpgrade("c", 13) && hasUpgrade("a", 25)}
        },
        "d-12": {
            title: "AD II",
            description: `Addition Power adds to Successor amount.`,
            cost: new ExpantaNum(200),
            currencyLayer: "a",
            currencyInternalName: "power",
            currencyDisplayName: "Addition Power",
            effect(){
                let eff = player.a.power.max(1).log10().pow(2)

                eff = eff.mul(player.a.upgEffectiveness.div(100))
                return eff
            },
            effectDisplay(){return `+${format(this.effect())} to Successor amount.`},
            unlocked(){return hasUpgrade("a", "d-11")}
        },
        "d-13": {
            title: "AD III",
            description: "Increase Multiplier Per Buy by +1",
            cost: new ExpantaNum(5000),
            currencyLayer: "a",
            currencyInternalName: "power",
            currencyDisplayName: "Addition Power",
            effect(){
                let eff = new ExpantaNum(1)

                eff = eff.mul(player.a.upgEffectiveness.div(100))
                return eff
            },
            effectDisplay(){return `+${format(this.effect())} to Multiplier Per Buy.`},
            unlocked(){return hasUpgrade("a", "d-12")}
        },
        "d-14": {
            title: "AD IV",
            description: "Increase Addition Point gain based on Addition Power",
            cost: new ExpantaNum(1e6),
            currencyLayer: "a",
            currencyInternalName: "power",
            currencyDisplayName: "Addition Power",
            effect(){
                let eff = player.a.power.max(1).log10().pow(0.5)

                eff = eff.mul(player.a.upgEffectiveness.div(100))
                return eff
            },
            effectDisplay(){return `+${format(this.effect())} to Addition Points gained.`},
            unlocked(){return hasUpgrade("a", "d-13")}
        },
        "d-15": {
            title: "AD V",
            description: "Increase Multiplier Per Buy based on Addition Power",
            cost: new ExpantaNum(2e7),
            currencyLayer: "a",
            currencyInternalName: "power",
            currencyDisplayName: "Addition Power",
            effect(){
                let eff = player.a.power.max(1).log10().div(10)

                eff = eff.mul(player.a.upgEffectiveness.div(100))
                return eff
            },
            effectDisplay(){return `+${format(this.effect())} to Multiplier Per Buy.`},
            unlocked(){return hasUpgrade("a", "d-14")}
        },
        "d-21": {
            title: "AD VI",
            description: "Increase Point gain efficiency based on Addition Power",
            cost: new ExpantaNum(2.00001e10),
            currencyLayer: "a",
            currencyInternalName: "power",
            currencyDisplayName: "Addition Power",
            effect(){
                let eff = player.a.power.max(1).log10().pow(2)

                eff = eff.mul(player.a.upgEffectiveness.div(100))
                return eff
            },
            effectDisplay(){return `+${format(this.effect())}% to Point gain efficiency.`},
            unlocked(){return hasUpgrade("a", "d-15")}
        },
        "d-22": {
            title: "AD VII",
            description: "Increase Sucessor gain efficiency based on Addition Power",
            cost: new ExpantaNum(5.00001e13),
            currencyLayer: "a",
            currencyInternalName: "power",
            currencyDisplayName: "Addition Power",
            effect(){
                let eff = player.a.power.max(1).log10().pow(2)

                eff = eff.mul(player.a.upgEffectiveness.div(100))
                return eff
            },
            effectDisplay(){return `+${format(this.effect())}% to Successor gain efficiency.`},
            unlocked(){return hasUpgrade("a", "d-21")}
        },
        "d-23": {
            title: "AD VIII",
            description: "Increase Multiplier Per Buy based on Addition Points",
            cost: new ExpantaNum(5.00001e15),
            currencyLayer: "a",
            currencyInternalName: "power",
            currencyDisplayName: "Addition Power",
            effect(){
                let eff = player.a.points.max(1).log10()

                eff = eff.mul(player.a.upgEffectiveness.div(100))
                return eff
            },
            effectDisplay(){return `+${format(this.effect())} to Multiplier Per Buy.`},
            unlocked(){return hasUpgrade("a", "d-22")}
        },
        "d-24": {
            title: "AD IX",
            description: "Add 200 to Successor effectiveness and 100 to Successor amount.",
            cost: new ExpantaNum(1.00001e18),
            currencyLayer: "a",
            currencyInternalName: "power",
            currencyDisplayName: "Addition Power",
            effect(){
                let eff1 = new ExpantaNum(200)
                let eff2 = new ExpantaNum(100)

                eff1 = eff1.mul(player.a.upgEffectiveness.div(100))
                eff2 = eff2.mul(player.a.upgEffectiveness.div(100))
                return [eff1, eff2]
            },
            effectDisplay(){return `+${format(this.effect()[0])} to Successor efficiency, +${format(this.effect()[1])} to Successor amount.`},
            unlocked(){return hasUpgrade("a", "d-23")}
        },
        "d-25": {
            title: "Constant V",
            description: "Add 0.15 Constant Points.",
            cost: new ExpantaNum(2.00001e20),
            currencyLayer: "a",
            currencyInternalName: "power",
            currencyDisplayName: "Addition Power",
            effect(){
                let eff = new ExpantaNum(0.15)

                return eff
            },
            effectDisplay(){return `+${format(this.effect())} Constant Points`},
            unlocked(){return hasUpgrade("a", "d-24")}
        },
    },
    buyables: {
        "Dim1": {
            style(){ return {"max-height":"40px", "max-width":"100px"}},
            display(){return `Cost: ${format(this.cost())} Addition Points`},
            buy(){
                player.a.points = player.a.points.sub(this.cost())
                player.a.dimensions.dim1.purchased = player.a.dimensions.dim1.purchased.add(1)
            },
            cost(){
                let costScale = new ExpantaNum(1.5)
                let costExp = new ExpantaNum(1.2)
                let baseCost = new ExpantaNum(10)

                return baseCost.mul(costScale.pow(player.a.dimensions.dim1.purchased).pow(costExp))
            },
            canAfford(){return player.a.points.gte(this.cost())}
        },
        "Dim2": {
            style(){ return {"max-height":"40px", "max-width":"100px"}},
            display(){return `Cost: ${format(this.cost())} Addition Points`},
            buy(){
                player.a.points = player.a.points.sub(this.cost())
                player.a.dimensions.dim2.purchased = player.a.dimensions.dim2.purchased.add(1)
            },
            cost(){
                let costScale = new ExpantaNum(1.7)
                let costExp = new ExpantaNum(1.2)
                let baseCost = new ExpantaNum(20)

                return baseCost.mul(costScale.pow(player.a.dimensions.dim2.purchased).pow(costExp))
            },
            canAfford(){return player.a.points.gte(this.cost())}
        },
        "Dim3": {
            style(){ return {"max-height":"40px", "max-width":"100px"}},
            display(){return `Cost: ${format(this.cost())} Addition Points`},
            buy(){
                player.a.points = player.a.points.sub(this.cost())
                player.a.dimensions.dim3.purchased = player.a.dimensions.dim3.purchased.add(1)
            },
            cost(){
                let costScale = new ExpantaNum(1.8)
                let costExp = new ExpantaNum(1.2)
                let baseCost = new ExpantaNum(40)

                return baseCost.mul(costScale.pow(player.a.dimensions.dim3.purchased).pow(costExp))
            },
            canAfford(){return player.a.points.gte(this.cost())}
        },
        "Dim4": {
            style(){ return {"max-height":"40px", "max-width":"100px"}},
            display(){return `Cost: ${format(this.cost())} Addition Points`},
            buy(){
                player.a.points = player.a.points.sub(this.cost())
                player.a.dimensions.dim4.purchased = player.a.dimensions.dim4.purchased.add(1)
            },
            cost(){
                let costScale = new ExpantaNum(2)
                let costExp = new ExpantaNum(1.2)
                let baseCost = new ExpantaNum(100)

                return baseCost.mul(costScale.pow(player.a.dimensions.dim4.purchased).pow(costExp))
            },
            canAfford(){return player.a.points.gte(this.cost())}
        },
        "Dim5": {
            style(){ return {"max-height":"40px", "max-width":"100px"}},
            display(){return `Cost: ${format(this.cost())} Addition Points`},
            buy(){
                player.a.points = player.a.points.sub(this.cost())
                player.a.dimensions.dim5.purchased = player.a.dimensions.dim5.purchased.add(1)
            },
            cost(){
                let costScale = new ExpantaNum(2.1)
                let costExp = new ExpantaNum(1.2)
                let baseCost = new ExpantaNum(150)

                return baseCost.mul(costScale.pow(player.a.dimensions.dim5.purchased).pow(costExp))
            },
            canAfford(){return player.a.points.gte(this.cost())}
        },
        "Dim6": {
            style(){ return {"max-height":"40px", "max-width":"100px"}},
            display(){return `Cost: ${format(this.cost())} Addition Points`},
            buy(){
                player.a.points = player.a.points.sub(this.cost())
                player.a.dimensions.dim6.purchased = player.a.dimensions.dim6.purchased.add(1)
            },
            cost(){
                let costScale = new ExpantaNum(2.2)
                let costExp = new ExpantaNum(1.2)
                let baseCost = new ExpantaNum(200)

                return baseCost.mul(costScale.pow(player.a.dimensions.dim6.purchased).pow(costExp))
            },
            canAfford(){return player.a.points.gte(this.cost())}
        },
        "Dim7": {
            style(){ return {"max-height":"40px", "max-width":"100px"}},
            display(){return `Cost: ${format(this.cost())} Addition Points`},
            buy(){
                player.a.points = player.a.points.sub(this.cost())
                player.a.dimensions.dim7.purchased = player.a.dimensions.dim7.purchased.add(1)
            },
            cost(){
                let costScale = new ExpantaNum(2.4)
                let costExp = new ExpantaNum(1.2)
                let baseCost = new ExpantaNum(300)

                return baseCost.mul(costScale.pow(player.a.dimensions.dim7.purchased).pow(costExp))
            },
            canAfford(){return player.a.points.gte(this.cost())}
        },
        "Dim8": {
            style(){ return {"max-height":"40px", "max-width":"100px"}},
            display(){return `Cost: ${format(this.cost())} Addition Points`},
            buy(){
                player.a.points = player.a.points.sub(this.cost())
                player.a.dimensions.dim8.purchased = player.a.dimensions.dim8.purchased.add(1)
            },
            cost(){
                let costScale = new ExpantaNum(2.6)
                let costExp = new ExpantaNum(1.2)
                let baseCost = new ExpantaNum(500)

                return baseCost.mul(costScale.pow(player.a.dimensions.dim8.purchased).pow(costExp))
            },
            canAfford(){return player.a.points.gte(this.cost())}
        },
    },
    tabFormat(){
        let dim = player.a.dimensions
        return {
            "Main": {
                content: [
                    ["display-text", `You have ${colorText("a", {"whole": true})} Addition Points`],
                    "prestige-button",
                    ["display-text", `You have ${format(player.s.successors)} Successors.`],
                    ["display-text", `You have made a total of ${format(player.a.total)} Addition points.`],
                    "blank",
                    ["clickable", 11],
                    "blank",
                    renderString(`You are gaining points at ${format(player.efficiency.points)}% efficiency (+${format(layers.s.getPassivePoints())}/s)`, player.efficiency.points.gt(0)),
                    renderString(`You are gaining successors at ${format(player.efficiency.successor)}% efficiency (+${format(layers.s.getPassiveSuccessors())}/s)`, player.efficiency.successor.gt(0)),
                    "milestones",
                    "blank",
                    //"upgrades",
                    ...generateComponent("upgrades", 2)
                ]
            },
            "Dimensions": {
                unlocked: hasUpgrade("c", 13) && hasUpgrade("a", 25),
                content: [
                    ["display-text", `You have ${colorText("a", {"whole": true})} Addition Points`],
                    "prestige-button",
                    ["display-text", `You have ${format(player.s.successors)} Successors.`],
                    ["display-text", `You have made a total of ${format(player.a.total)} Addition points.`],
                    "blank",
                    ["clickable", 11],
                    "blank",
                    ["display-text", `You have ${colorText("a", {"name": "power"})} Addition Power.`],
                    ...generateComponent("dimensions", dim.unlocked, {"layer":"a"}),
                    "blank",
                    ...generateComponent("upgrades", 2, {"prefix":"d-"})
                ]
            }
        }
    },
    hotkeys: [{key: "a", description: "a: Reset for Addition", onPress(){if(player.a.unlocked){doReset("a")}}, unlocked(){return player.a.unlocked}}],
    doReset(resettingLayer){
        if(layers[resettingLayer].row > this.row){
            let keepa = []
            let keptUpg = []
            if((resettingLayer === "m" && hasMilestone("m", 0)) || hasMilestone("c", 1))keepa.push("milestones")
            if((resettingLayer === "m" && hasMilestone("m", 2)))keptUpg = player.a.upgrades.slice(0, player.m.resets.min(player.a.upgrades.length).toNumber())
            lastPow = player.a.power
            if(hasMilestone("c", 0))keepa.push("upgrades")

            layerDataReset("a", keepa)

            if(!hasMilestone("c", 0))player.a.upgrades = keptUpg
            if(hasMilestone("m", 4))player.a.power = lastPow.min(new ExpantaNum(2.0000001e20))
        }
    }
})
addLayer("m", {
    name: "Multiplication",
    symbol: "M",
    row: 2,
    position: 0,
    color: "#FF0000",
    branches: ["a"],
    layerShown(){return hasUpgrade("c", 14)},
    startData(){ return {
        unlocked: false,
        points: new ExpantaNum(0),
        resets: new ExpantaNum(0),
        power: new ExpantaNum(0),
        replication: {
            "multiplier": new ExpantaNum(1),
            "interval": new ExpantaNum(10),
            "time": new ExpantaNum(0),
            "amount": new ExpantaNum(0),
            "softcap": {
                "cap1": {
                    "start": new ExpantaNum(1000),
                    "effect": new ExpantaNum(1),
                    "divisor": new ExpantaNum(1),
                },
                "cap2": {
                    "start": new ExpantaNum(1e50),
                    "effect": new ExpantaNum(1),
                    "divisor": new ExpantaNum(1)
                }
            }
        },
        replicators: new ExpantaNum(1),
        highestReplicators: new ExpantaNum(1),
        best: new ExpantaNum(0),
        bonus: {
            "r-11": new ExpantaNum(0),
            "r-12": new ExpantaNum(0),
            "r-13": new ExpantaNum(0),
            "r-21": new ExpantaNum(0),
            "r-22": new ExpantaNum(0),
            "r-23": new ExpantaNum(0),
        }
    }},
    type: "normal",
    baseResource: "Successors",
    baseAmount(){return player.s.successors},
    requires: new ExpantaNum(5e5),
    exponent: new ExpantaNum(0.1),
    resource: "Multiplication Points",
    gainMult(){
        let mult = new ExpantaNum(1)
        mult = applyEffect("upgrades", mult, "m", ["r-23"], "mul", 1)
        mult = mult.mul(tmp.e.getScoreEffect)
        mult = applyEffect("upgrades", mult, "e", [11], "mul")

        return mult
    },
    getResetGain(){
        let gain = player.s.successors.div(tmp.m.requires)
        gain = gain.pow(tmp.m.exponent)
        gain = gain.mul(tmp.m.gainMult)

        return gain.floor()
    },
    getPassiveMultiplications(){
        let gain = new ExpantaNum(0)
        if(hasMilestone("e", 2))gain = new ExpantaNum(10)

        player.efficiency.multiplication = gain
        return tmp.m.getResetGain.mul(player.efficiency.multiplication.div(100))
    },
    onPrestige(){
        player.points = new ExpantaNum(0)
        player.s.successors = new ExpantaNum(0)
        player.a.points = new ExpantaNum(0)
        if(!hasMilestone("m", 4))player.a.power = new ExpantaNum(0)
        player.m.resets = player.m.resets.add(1)
    },
    update(diff){
        if(player.subtabs.m.mainTabs === undefined)player.subtabs.m.mainTabs = "Main"
        if(player.m.replication.time.isNaN())player.m.replication.time = new ExpantaNum(0)
        if(player.m.points.gte(player.m.best))player.m.best = player.m.points
        if(!hasUpgrade("c", 15) || !hasUpgrade("m", 25)){
            player.m.replicators = new ExpantaNum(1)
            player.m.power = new ExpantaNum(0)
        }
        if(player.m.replicators.gte(player.m.highestReplicators))player.m.highestReplicators = player.m.replicators
        player.m.points = player.m.points.add(tmp.m.getPassiveMultiplications.mul(diff))
        player.m.total = player.m.total.add(tmp.m.getPassiveMultiplications.mul(diff))
    },
    getExtraBuyables(){
        let bonus = player.m.bonus
        let rows = [["r-11", "r-12", "r-13"], ["r-21", "r-22", "r-23"]]
        let columns = [["r-11", "r-21"], ["r-12", "r-22"], ["r-13", "r-23"]]
        for(let id in bonus){
            bonus[id] = new ExpantaNum(0)
        }

        for(let i = 0; i < rows[0].length; i++){
            let id = rows[0][i]
            bonus[id] = applyEffect("buyables", bonus[id], "e", [11], "add", 1)
            bonus[id] = bonus[id].add(getBuyableAmount("m", columns[i][1]).add(bonus[columns[i][1]]))
        }
    },
    getCap2Divisor(){
        let divisor = new ExpantaNum(1)

        divisor = applyEffect("buyables", divisor, "m", ["r-22"], "mul")

        player.m.replication.softcap.cap2.divisor = divisor
    },
    getSoftcaps(){
        let cap = player.m.replication.softcap
        if(player.m.replicators.gte(cap.cap1.start)){
            cap.cap1.effect = player.m.replicators.div(cap.cap1.start).mul(10).log10().pow(0.5).div(cap.cap1.divisor).max(1)
        } else{
            cap.cap1.effect = new ExpantaNum(1)
        }
        if(player.m.replicators.gte(cap.cap2.start)){
            cap.cap2.effect = player.m.replicators.div(cap.cap2.start).mul(10).log10().pow(0.8).div(cap.cap2.divisor).max(1)
        } else{
            cap.cap2.effect = new ExpantaNum(1)
        }
    },
    getReplicantInterval(){
        let i = new ExpantaNum(10)
        i = applyEffect("upgrades", i, "m", ["r-12"], "sub")
        i = applyEffect("upgrades", i, "m", ["r-23"], "sub", 0)
        i = applyEffect("upgrades", i, "m", ["r-14"], 'mul')
        i = applyEffect("buyables", i, "m", ["r-12"], "div")
        i = applyEffect("upgrades", i, "e", [13], "mul", 0)

        let cap = player.m.replication.softcap
        i = i.mul(cap.cap1.effect)
        

        let treshold = new ExpantaNum(5)
        if(i.lt(treshold))i = applyEffect("milestones", i, "e", [6], "div")
        player.m.replication.interval = i
        //console.log(player.m.replication.interval.toString())
    },
    getTimeSinceReplicant(diff){
        if(!(player.m.replication.interval.gte(15) || player.m.replication.multiplier.eq(1)))player.m.replication.time = player.m.replication.time.add(diff)
    },
    getReplicantMult(){
        let m = new ExpantaNum(1)

        m = applyEffect("upgrades", m, "m", ["p-11", "p-14", "r-11", "r-22"], "add")
        m = applyEffect("upgrades", m, "m", ["p-15"], "add", 0)
        m = applyEffect("buyables", m, "m", ["r-11"], "add")
        m = applyEffect("upgrades", m, "e", [14], "pow")

        let cap = player.m.replication.softcap
        m = m.root(cap.cap2.effect)

        if(player.e.logarithm.inLogarithm)m = m.max(1).logBase(player.e.logarithm.base)

        player.m.replication.multiplier = m
    },
    getReplicantAmount(){
        let a = new ExpantaNum(1)

        if(hasUpgrade("m", "r-21")){a = new ExpantaNum(2)}
        a = applyEffect("upgrades", a, "e", [12], "add")
        a = applyEffect("buyables", a, "m", ["r-21"], "add")

        player.m.replication.amount = a.floor()
    },
    getNetMultiplier(){
        let rep = player.m.replication
        let mul =
        player.e.logarithm.inLogarithm 
        ? rep.multiplier.mul(rep.amount).div(rep.interval)
        : rep.multiplier.pow(rep.amount.div(rep.interval))
        return mul
    },
    replicate(diff){
        let rep = player.m.replication
        if(rep.interval.lt(15)){
            if(rep.time.gte(rep.interval)){
                rep.time = rep.time.sub(rep.interval)
                player.e.logarithm.inLogarithm ?
                player.m.replicators = player.m.replicators.add(rep.multiplier.mul(rep.amount)) : 
                player.m.replicators = player.m.replicators.mul(rep.multiplier.pow(rep.amount))
            }
        } else {
            player.e.logarithm.inLogarithm ?
            player.m.replicators = player.m.replicators.add(layers.m.getNetMultiplier().mul(diff)) :
            player.m.replicators = player.m.replicators.mul(layers.m.getNetMultiplier().pow(diff))
        }
    },
    getMultPowerGain(){
        let gain = player.m.highestReplicators.log10()

        gain = applyEffect("upgrades", gain, "e", ["l-31"], "mul", 0)
        gain = applyEffect("upgrades", gain, "e", ["l-31"], "pow", 1)

        gain = applyEffect("upgrades", gain, "m", ["r-15", "p-23"], "mul", 0)
        gain = applyEffect("buyables", gain, "m", ["r-13"], "mul")
        gain = applyEffect("upgrades", gain, "e", [21], "mul", 1)
        gain = gain.mul(tmp.e.getScoreEffect)

        return gain
    },
    gainMultPower(diff){
        player.m.power = player.m.power.add(layers.m.getMultPowerGain().mul(diff))
    },
    automateBuyables(){
        let buyb = layers.m.buyables
        let auto = {
            "r-11": hasMilestone("e", 6),
            "r-12": hasMilestone("e", 6),
            "r-13": hasMilestone("e", 6),
        }
        const exclude = ["cols", "layer", "rows"]
        for(id in buyb){
            if(!(exclude.includes(id)) && buyb[id].canAfford() && auto[id]){
                addBuyables("m", id, buyb[id].buyMax())
            }
        }
    },
    upgrades: {
        11: {
            title: "Multiplication I",
            description: "Multiply Successor power and Addition points by 2",
            cost: new ExpantaNum(0),
            effect(){
                let eff = new ExpantaNum(2)

                return eff
            },
            effectDisplay(){return `${this.effect()}x to Successor power and Addition points.`}
        },
        12: {
            title: "Multiplication II",
            description: "Best Multiplication Points boost Successor amount.",
            cost: new ExpantaNum(1),
            effect(){
                let eff = player.m.best.pow(0.3).add(1)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Successor amount.`},
            unlocked(){return hasUpgrade("m", 11)}
        },
        13: {
            title: "Multiplication III",
            description: "Multiply Multiplier Per Buy by 1.5.",
            cost: new ExpantaNum(1),
            effect(){
                let eff = new ExpantaNum(1.5)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Multiplier Per Buy.`},
            unlocked(){return hasUpgrade("m", 12)}
        },
        14: {
            title: "Multiplication IV",
            description: "Triple the effects of Addition I and Addition II",
            cost: new ExpantaNum(2),
            effect(){
                let eff = new ExpantaNum(3)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Addition I and II.`},
            unlocked(){return hasUpgrade("m", 13)}
        },
        15: {
            title: "Multiplication V",
            description: `Boost Successor power and Addition Points based on Constant Points.`,
            cost: new ExpantaNum(2),
            effect(){
                let eff = player.c.points.max(1).pow(0.5)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Successor power and Addition points.`},
            unlocked(){return hasUpgrade("m", 14)}
        },
        21: {
            title: `Constant VI`,
            description: `Multiply Constant Points by 1.2. Triple <h3>Addition III</h3>'s effect.`,
            cost: new ExpantaNum(3),
            effect(){
                let eff1 = new ExpantaNum(1.2)
                let eff2 = new ExpantaNum(3)

                return [eff1, eff2]
            },
            effectDisplay(){return `${this.effect()[0]}x to Constant Points, ${this.effect()[1]}x to <h3>Addition III</h3>.`},
            unlocked(){return hasUpgrade("m", 15)}
        },
        22: {
            title: "Multiplication VI",
            description: "Boost Successor and Point gain efficiency by 2.",
            cost: new ExpantaNum(5),
            effect(){
                let eff = new ExpantaNum(2)

                return eff
            },
            effectDisplay(){return `${this.effect()}x to Successor and Point gain efficiencies.`},
            unlocked(){return hasUpgrade("m", 21)}
        },
        23: {
            title: "Multiplication VII",
            description: "Constant Points boost Successor Power again, and boosts Addition Efficiency.",
            cost: new ExpantaNum(10),
            effect(){
                let eff = player.c.points.max(1).pow(0.5)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Successor Power and Addition Efficiency.`},
            unlocked(){return hasUpgrade("m", 22)}
        },
        24: {
            title: "Multiplication VIII",
            description: `Boost Addition Upgrade Effectiveness by 2.`,
            cost: new ExpantaNum(20),
            effect(){
                let eff = new ExpantaNum(2)

                return eff
            },
            effectDisplay(){return `${this.effect()}x to Addition Upgrade Effectiveness.`},
            unlocked(){return hasUpgrade("m", 23)}
        },
        25: {
            title: "Constant VII",
            description: "Multiply Constant Points by 1.1.",
            cost: new ExpantaNum(50),
            effect(){
                let eff = new ExpantaNum(1.1)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Constant Points.`},
            unlocked(){return hasUpgrade("m", 24)}
        },
        "p-11": {
            title: "MP I",
            description: "Add 0.01 to the Replication multiplier.",
            cost: new ExpantaNum(0),
            currencyLayer: "m",
            currencyInternalName: "power",
            currencyDisplayName: "Multiplication Power",
            effect(){
                let eff = new ExpantaNum(0.01)

                return eff
            },
            effectDisplay(){return `+${format(this.effect())} to the Replication multiplier.`},
            unlocked(){return hasUpgrade("c", 15) && hasUpgrade("m", 25)},
        },
        "p-12": {
            title: "MP II",
            description: "Gain more Addition points based on Multiplication power.",
            cost: new ExpantaNum(1),
            currencyLayer: "m",
            currencyInternalName: "power",
            currencyDisplayName: "Multiplication Power",
            effect(){
                let eff = player.m.power.add(1).log10().add(1)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Addition Points.`},
            unlocked(){return hasUpgrade("m", "p-11")}
        },
        "p-13": {
            title: "MP III",
            description: "Successor Power is boosted by 1.5.",
            cost: new ExpantaNum(1.5),
            currencyLayer: "m",
            currencyInternalName: "power",
            currencyDisplayName: "Multiplication Power",
            effect(){
                let eff = new ExpantaNum(1.5)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Successor Power.`},
            unlocked(){return hasUpgrade("m", "p-12")}
        },
        "p-14": {
            title: "MP IV",
            description: "Multiplication Points increase Replication Multiplier.",
            cost: new ExpantaNum(2),
            currencyLayer: "m",
            currencyInternalName: "power",
            currencyDisplayName: "Multiplication Power",
            effect(){
                let eff = player.m.points.max(1).log10().mul(0.005)

                return eff
            },
            effectDisplay(){return `+${format(this.effect(), 3)} to Replication Multiplier`},
            unlocked(){return hasUpgrade("m", "p-13")}
        },
        "p-15": {
            title: "Constant VIII",
            description: "Constant Points increase Replication multiplier. Multiply CP by 1.1.",
            cost: new ExpantaNum(4),
            currencyLayer: "m",
            currencyInternalName: "power",
            currencyDisplayName: "Multiplication Power",
            effect(){
                let eff1 = player.c.points.mul(0.001)
                let eff2 = new ExpantaNum(1.1)

                return [eff1, eff2]
            },
            effectDisplay(){return `+${format(this.effect()[0], 3)} to Replication Multiplier, ${format(this.effect()[1])}x to CP.`},
            unlocked(){return hasUpgrade("m", "p-14")}
        },
        "p-21": {
            title: "MP V",
            description: "Each Addition Dimension boosts it's own multiplier by a base that increases with Multiplier Power.",
            cost: new ExpantaNum(50),
            currencyLayer: "m",
            currencyInternalName: "power",
            currencyDisplayName: "Multiplication Power",
            effect(num){
                let eff = player.m.power.max(1).log10().div(10)

                return eff
            },
            effectDisplay(){return `Addition Dimensions boost their own multiplier by 1 + ${format(this.effect(), 2, true)} * id`},
            unlocked(){return hasUpgrade("m", "p-15") && hasUpgrade('m', "r-15")}
        },
        "p-22": {
            title: "MP VI",
            description: "Addition Efficiency is boosted by 1.5. MP boosts Successor Power.",
            cost: new ExpantaNum(150),
            currencyLayer: "m",
            currencyInternalName: "power",
            currencyDisplayName: "Multiplication Power",
            effect(){
                let eff1 = new ExpantaNum(1.5)
                let eff2 = player.m.power.add(1).log10().div(5).add(1)

                return [eff1, eff2]
            },
            effectDisplay(){return `${format(this.effect()[0])}x to Addition Efficiency, ${format(this.effect()[1])}x to Successor Power.`},
            unlocked(){return hasUpgrade("m", "p-21")}
        },
        "p-23": {
            title: "MP VII",
            description: "Multiplication Power boosts itself. The net Multiplier boosts Successor Power.",
            cost: new ExpantaNum(500),
            currencyLayer: "m",
            currencyInternalName: "power",
            currencyDisplayName: "Multiplication Power",
            effect(){
                let eff1 = player.m.power.max(1).log10().add(1)
                let eff2 = layers.m.getNetMultiplier().pow(10).max(0.1)
                if(eff2.gte(10))eff2 = eff2.pow(0.4)

                return [eff1, eff2]
            },
            effectDisplay(){return `${format(this.effect()[0])}x to Multiplication Power, ${format(this.effect()[1])}x to Successor Power.`},
            unlocked(){return hasUpgrade("m", "p-22")}
        },
        "p-24": {
            title: "MP VIII",
            description: "Unlock the third buyable.",
            cost: new ExpantaNum(2000),
            currencyLayer: "m",
            currencyInternalName: "power",
            currencyDisplayName: "Multiplication Power",
            unlocked(){return hasUpgrade("m", "p-23")},
        },
        "p-25": {
            title: "Constant X",
            description: "Multiply Constant Points by 1.1.",
            cost: new ExpantaNum(5000),
            currencyLayer: "m",
            currencyInternalName: "power",
            currencyDisplayName: "Multiplication Power",
            effect(){
                let eff = new ExpantaNum(1.1)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Constant Points.`},
            unlocked(){return hasUpgrade("m", "p-24")}
        },
        "r-11": {
            title: "Replication I",
            description: "Increase Replication multiplier by 0.005",
            cost: new ExpantaNum(1.1),
            currencyLayer: "m",
            currencyInternalName: "replicators",
            currencyDisplayName: "Replicator Points",
            pay(){
                player.m.replicators = player.m.replicators.div(this.cost)
            },
            effect(){
                let eff = new ExpantaNum(0.005)

                return eff
            },
            effectDisplay(){return `+${format(this.effect(), 3)} to Replication multiplier.`},
            unlocked(){return hasUpgrade("c", 15)}
        },
        "r-12": {
            title: "Replication II",
            description: "Decrease the replication interval by 1 second",
            cost: new ExpantaNum(1.15),
            currencyLayer: "m",
            currencyInternalName: "replicators",
            currencyDisplayName: "Replicator Points",
            pay(){
                player.m.replicators = player.m.replicators.div(this.cost)
            },
            effect(){
                let eff = new ExpantaNum(1)

                return eff
            },
            effectDisplay(){return `-${formatTime(this.effect())} to the Replication interval.`},
            unlocked(){return hasUpgrade("m", "r-11")}
        },
        "r-13": {
            title: "Replication III",
            description: "Unlock a buyable.",
            cost: new ExpantaNum(1.25),
            currencyLayer: "m",
            currencyInternalName: "replicators",
            currencyDisplayName: "Replicator Points",
            pay(){
                player.m.replicators = player.m.replicators.div(this.cost)
            },
            unlocked(){return hasUpgrade("m", "r-12")}
        },
        "r-14": {
            title: "Replication IV",
            description: "Multiply the replicant interval by 0.9.",
            cost: new ExpantaNum(2),
            currencyLayer: "m",
            currencyInternalName: "replicators",
            currencyDisplayName: "Replicator Points",
            pay(){
                player.m.replicators = player.m.replicators.div(this.cost)
            },
            effect(){
                let eff = new ExpantaNum(0.9)

                return eff
            },
            effectDescription(){return `${format(this.effect())}x to the Replicant interval.`},
            unlocked(){return hasUpgrade("m", "r-13")}
        },
        "r-15": {
            title: "Constant IX",
            description: "CP boosts Multiplication Power gain. RP boosts CP up to 2x.",
            cost: new ExpantaNum(2.5),
            currencyLayer: "m",
            currencyInternalName: "replicators",
            currencyDisplayName: "Replicator Points",
            pay(){
                player.m.replicators = player.m.replicators.div(this.cost)
            },
            effect(){
                let limit = new ExpantaNum(2)
                let eff1 = player.c.points.pow(0.3).add(1)
                let eff2 = player.m.replicators.mul(10).max(1).log10().max(1).log10().add(1).min(limit)

                return [eff1, eff2]
            },
            effectDisplay(){return `${format(this.effect()[0])}x to Multiplication Power, ${format(this.effect()[1])}x to Constant Points`},
            unlocked(){return hasUpgrade("m", "r-14")}
        },
        "r-21": {
            title: 'Replication V',
            description: "Unlock a second buyable. Replications occur twice.",
            cost: new ExpantaNum(3.5),
            currencyLayer: "m",
            currencyInternalName: "replicators",
            currencyDisplayName: "Replicator Points",
            pay(){
                player.m.replicators = player.m.replicators.div(this.cost)
            },
            unlocked(){return hasUpgrade("m", "p-15") && hasUpgrade('m', "r-15")}
        },
        "r-22": {
            title: 'Replication VI',
            description: "Increase the Replication multiplier based on Replication upgrades bought.",
            cost: new ExpantaNum(5),
            currencyLayer: "m",
            currencyInternalName: "replicators",
            currencyDisplayName: "Replicator Points",
            pay(){
                player.m.replicators = player.m.replicators.div(this.cost)
            },
            effect(){
                let effUpg = Object.keys(layers.m.upgrades).filter(upg => upg.startsWith("r-") && hasUpgrade("m", upg)).length
                let eff = new ExpantaNum(0.002).mul(effUpg)

                return eff
            },
            effectDisplay(){return `+${format(this.effect(), 3)} to Replication multiplier.`},
            unlocked(){return hasUpgrade("m", "r-21")},
        },
        "r-23": {
            title: "Replication VII",
            description: "The base Replication Interval is reduced by 0.5 seconds. Replicator Points boost Multiplication Points gain.",
            cost: new ExpantaNum(15),
            currencyLayer: "m",
            currencyInternalName: "replicators",
            currencyDisplayName: "Replicator Points",
            pay(){
                player.m.replicators = player.m.replicators.div(this.cost)
            },
            effect(){
                let eff1 = new ExpantaNum(0.5)
                let eff2 = player.m.replicators.mul(10).max(1).log10().pow(0.5)

                return [eff1, eff2]
            },
            effectDisplay(){return `-${format(this.effect()[0])} to the base Replication Interval, ${format(this.effect()[1])}x to Multiplication Points gain.`},
            unlocked(){return hasUpgrade("m", "r-22")}
        },
        "r-24": {
            title: "Constant XI",
            description: "Base constant points are increased by 0.3.",
            cost: new ExpantaNum(40),
            currencyLayer: "m",
            currencyInternalName: "replicators",
            currencyDisplayName: "Replicator Points",
            pay(){
                player.m.replicators = player.m.replicators.div(this.cost)
            },
            effect(){
                let eff = new ExpantaNum(0.3)

                return eff
            },
            effectDisplay(){return `+${format(this.effect())} to base Constant Points.`},
            unlocked(){return hasUpgrade("m", "r-23")}
        },
        "r-25": {
            title: "Constant XII",
            description: "Multiplication Power increases Constant Points, up to 2x.",
            cost: new ExpantaNum(100),
            currencyLayer: "m",
            currencyInternalName: "replicators",
            currencyDisplayName: "Replicator Points",
            pay(){
                player.m.replicators = player.m.replicators.div(this.cost)
            },
            effect(){
                let limit = new ExpantaNum(2)
                let eff = player.m.power.max(1).log10().pow(0.5).div(20).add(1).min(limit)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Constant Points.`},
            unlocked(){return hasUpgrade("m", "r-24")}
        }
    },
    buyables: {
        "r-11": {
            title: "Replication Multiplier",
            display(){
                let extraText = ``
                if(player.m.bonus[this.id].gt(0))extraText = `+ ${formatWhole(player.m.bonus[this.id])}`
                return `Increase the Replication Multiplier by +${format(this.base(), 3)}. <br> Cost: ${format(this.cost())} Multiplication Power <br> Currently: +${format(this.effect(), 2, true)} to Replication Multiplier <br> Amount: ${formatWhole(getBuyableAmount("m", "r-11"))} ${extraText}`
            },
            base(){
                let base = new ExpantaNum(0.005)

                base = applyEffect("upgrades", base, "e", [22], "add")

                return base
            },
            costBase(){
                let base = new ExpantaNum(1.4)

                return base
            },
            baseCost(){
                let cost = new ExpantaNum(5)

                return cost
            },
            costExp(){
                let exp = new ExpantaNum(1.2)

                return exp
            },
            cost(x){
                return this.baseCost().mul(this.costBase().pow(x.pow(this.costExp())))
            },
            effect(x){
                let eff = this.base().mul(x.add(player.m.bonus[this.id]))

                return eff
            },
            bulk(){
                let bulk = new ExpantaNum(1)

                if(hasMilestone('e', 8))bulk = new ExpantaNum(5)

                return bulk
            },
            buyMax(){
                canMax = hasMilestone('e', 8)

                if(player.m.power.lt(this.baseCost())){
                    return new ExpantaNum(0)
                }
                if(canMax){
                    return player.m.power.div(this.baseCost()).logBase(this.costBase()).pow(new ExpantaNum(1).div(this.costExp())).sub(getBuyableAmount(this.layer, this.id)).add(1).min(this.bulk()).floor()
                } else{
                    return new ExpantaNum(1)
                }
            },
            buy(){
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(this.buyMax()))
                player.m.power = player.m.power.sub(this.cost(getBuyableAmount(this.layer, this.id).sub(1)))
            },
            unlocked(){return hasUpgrade("m", "r-13") || hasMilestone("e", 3)},
            canAfford(){return player.m.power.gte(this.cost())}
        },
        "r-12": {
            title: "Replication interval",
            display(){
                let extraText = ``
                if(player.m.bonus[this.id].gt(0))extraText = `+ ${formatWhole(player.m.bonus[this.id])}`
                return `Divide the Replication Interval by ${format(this.base(), 3)}. <br> Cost: ${format(this.cost(), 3)} Multiplication power <br> Currently: /${format(this.effect(), 2, true)} to Replication Interval <br> Amount: ${formatWhole(getBuyableAmount("m", "r-12"))} ${extraText}`
            },
            base(){
                let base = new ExpantaNum(1.025)

                base = applyEffect("upgrades", base, "e", ["l-23"], "add")

                return base
            },
            costBase(){
                let base = new ExpantaNum(1.4)

                return base
            },
            baseCost(){
                let cost = new ExpantaNum(50)

                return cost
            },
            costExp(){
                let exp = new ExpantaNum(1.3)

                return exp
            },
            cost(x){
                return this.baseCost().mul(this.costBase().pow(x.pow(this.costExp())))
            },
            effect(x){
                let eff = this.base().pow(x.add(player.m.bonus[this.id]))

                return eff
            },
            bulk(){
                let bulk = new ExpantaNum(1)

                if(hasMilestone('e', 8))bulk = new ExpantaNum(5)

                return bulk
            },
            buyMax(){
                canMax = hasMilestone('e', 8)

                if(player.m.power.lt(this.baseCost())){
                    return new ExpantaNum(0)
                }
                if(canMax){
                    return player.m.power.div(this.baseCost()).logBase(this.costBase()).pow(new ExpantaNum(1).div(this.costExp())).sub(getBuyableAmount(this.layer, this.id)).add(1).min(this.bulk()).floor()
                } else{
                    return new ExpantaNum(1)
                }
            },
            buy(){
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(this.buyMax()))
                player.m.power = player.m.power.sub(this.cost(getBuyableAmount(this.layer, this.id).sub(1)))
            },
            unlocked(){return hasUpgrade("m", "r-21") || hasMilestone("e", 3)},
            canAfford(){return player.m.power.gte(this.cost())}
        },
        "r-13": {
            title: "Power Boost",
            display(){
                let extraText = ``
                if(player.m.bonus[this.id].gt(0))extraText = `+ ${formatWhole(player.m.bonus[this.id])}`
                return `Multiply Multiplication Power gain by ${format(this.base())}. <br> Cost: ${format(this.cost())} Multiplication power <br> Currently: ${format(this.effect())}x to Multiplication Power gain <br> Amount: ${formatWhole(getBuyableAmount("m", "r-13"))} ${extraText}`
            },
            base(){
                let base = new ExpantaNum(1.5)

                return base
            },
            costBase(){
                let base = new ExpantaNum(2)

                return base
            },
            baseCost(){
                let cost = new ExpantaNum(1000)

                return cost
            },
            costExp(){
                let exp = new ExpantaNum(1.5)

                return exp
            },
            cost(x){
                return this.baseCost().mul(this.costBase().pow(x.pow(this.costExp())))
            },
            effect(x){
                let eff = this.base().pow(x.add(player.m.bonus[this.id]))

                return eff
            },
            bulk(){
                let bulk = new ExpantaNum(1)

                if(hasMilestone('e', 8))bulk = new ExpantaNum(5)

                return bulk
            },
            buyMax(){
                canMax = hasMilestone('e', 8)

                if(player.m.power.lt(this.baseCost())){
                    return new ExpantaNum(0)
                }
                if(canMax){
                    return player.m.power.div(this.baseCost()).logBase(this.costBase()).pow(new ExpantaNum(1).div(this.costExp())).sub(getBuyableAmount(this.layer, this.id)).add(1).min(this.bulk()).floor()
                } else{
                    return new ExpantaNum(1)
                }
            },
            buy(){
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(this.buyMax()))
                player.m.power = player.m.power.sub(this.cost(getBuyableAmount(this.layer, this.id).sub(1)))
            },
            unlocked(){return hasUpgrade("m", "p-24") || hasMilestone("e", 3)},
            canAfford(){return player.m.power.gte(this.cost())}
        },
        "r-21": {
            title: "Replication Amount",
            display(){
                let extraText = ``
                if(player.m.bonus[this.id].gt(0))extraText = `+ ${formatWhole(player.m.bonus[this.id])}`
                return `Increase Replication Amount by +${formatWhole(this.base(), 3)}. <br> Cost: ${format(this.cost())} Multiplication Power <br> Currently: +${format(this.effect(), 0)} to Replication Amount <br> Amount: ${formatWhole(getBuyableAmount("m", this.id))} ${extraText}`
            },
            base(){
                let base = new ExpantaNum(1)

                return base.floor()
            },
            costBase(){
                let base = new ExpantaNum(5)

                return base
            },
            baseCost(){
                let cost = new ExpantaNum(1e10)

                return cost
            },
            costExp(){
                let exp = new ExpantaNum(1.5)

                return exp
            },
            cost(x){
                return this.baseCost().mul(this.costBase().pow(x.pow(this.costExp())))
            },
            effect(x){
                let eff = this.base().mul(x.add(player.m.bonus[this.id]))

                return eff
            },
            bulk(){
                let bulk = new ExpantaNum(1)

                return bulk
            },
            buyMax(){
                canMax = false

                if(player.m.power.lt(this.baseCost())){
                    return new ExpantaNum(0)
                }
                if(canMax){
                    return player.m.power.div(this.baseCost()).logBase(this.costBase()).pow(new ExpantaNum(1).div(this.costExp())).sub(getBuyableAmount(this.layer, this.id)).add(1).min(this.bulk()).floor()
                } else{
                    return new ExpantaNum(1)
                }
            },
            buy(){
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(this.buyMax()))
                player.m.power = player.m.power.sub(this.cost(getBuyableAmount(this.layer, this.id).sub(1)))
            },
            unlocked(){return hasUpgrade("e", "l-22")},
            canAfford(){return player.m.power.gte(this.cost())}
        },
        "r-22": {
            title: "Softcap Reducer",
            display(){
                let extraText = ``
                if(player.m.bonus[this.id].gt(0))extraText = `+ ${formatWhole(player.m.bonus[this.id])}`
                return `Divide the second Replication Softcap's effect by ${format(this.base(), 3)}. <br> Cost: ${format(this.cost(), 3)} Multiplication power <br> Currently: /${format(this.effect(), 2, true)} to the second Replication softcap's effect <br> Amount: ${formatWhole(getBuyableAmount("m", this.id))} ${extraText}`
            },
            base(){
                let base = new ExpantaNum(1.075)

                return base
            },
            costBase(){
                let base = new ExpantaNum(1.6)

                return base
            },
            baseCost(){
                let cost = new ExpantaNum(1e12)

                return cost
            },
            costExp(){
                let exp = new ExpantaNum(1.25)

                return exp
            },
            cost(x){
                return this.baseCost().mul(this.costBase().pow(x.pow(this.costExp())))
            },
            effect(x){
                let eff = this.base().pow(x.add(player.m.bonus[this.id]))

                return eff
            },
            bulk(){
                let bulk = new ExpantaNum(1)

                return bulk
            },
            buyMax(){
                canMax = false

                if(player.m.power.lt(this.baseCost())){
                    return new ExpantaNum(0)
                }
                if(canMax){
                    return player.m.power.div(this.baseCost()).logBase(this.costBase()).pow(new ExpantaNum(1).div(this.costExp())).sub(getBuyableAmount(this.layer, this.id)).add(1).min(this.bulk()).floor()
                } else{
                    return new ExpantaNum(1)
                }
            },
            buy(){
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(this.buyMax()))
                player.m.power = player.m.power.sub(this.cost(getBuyableAmount(this.layer, this.id).sub(1)))
            },
            unlocked(){return hasUpgrade("e", "l-22")},
            canAfford(){return player.m.power.gte(this.cost())}
        },
        "r-23": {
            title: "Exponential Boost",
            display(){
                let extraText = ``
                if(player.m.bonus[this.id].gt(0))extraText = `+ ${formatWhole(player.m.bonus[this.id])}`
                return `Multiply Exponentiation Points gain by ${format(this.base())} (Based on Multiplication Power). <br> Cost: ${format(this.cost())} Multiplication power <br> Currently: ${format(this.effect())}x to Exponentiation Points gain <br> Amount: ${formatWhole(getBuyableAmount("m", this.id))} ${extraText}`
            },
            base(){
                let base = player.m.power.div(this.baseCost()).mul(10).max(1).log10().div(5).add(1).pow(0.4)

                if(base.gte(1.10)){
                    base = base.div(1.10).pow(0.2).mul(1.10)
                }

                return base
            },
            costBase(){
                let base = new ExpantaNum(1.5)

                return base
            },
            baseCost(){
                let cost = new ExpantaNum(1e15)

                return cost
            },
            costExp(){
                let exp = new ExpantaNum(1.4)

                return exp
            },
            cost(x){
                return this.baseCost().mul(this.costBase().pow(x.pow(this.costExp())))
            },
            effect(x){
                let eff = this.base().pow(x.add(player.m.bonus[this.id]))

                return eff
            },
            bulk(){
                let bulk = new ExpantaNum(1)

                return bulk
            },
            buyMax(){
                canMax = false

                if(player.m.power.lt(this.baseCost())){
                    return new ExpantaNum(0)
                }
                if(canMax){
                    return player.m.power.div(this.baseCost()).logBase(this.costBase()).pow(new ExpantaNum(1).div(this.costExp())).sub(getBuyableAmount(this.layer, this.id)).add(1).min(this.bulk()).floor()
                } else{
                    return new ExpantaNum(1)
                }
            },
            buy(){
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(this.buyMax()))
                player.m.power = player.m.power.sub(this.cost(getBuyableAmount(this.layer, this.id).sub(1)))
            },
            unlocked(){return hasUpgrade("e", "l-22")},
            canAfford(){return player.m.power.gte(this.cost())}
        },
    },
    milestones: {
        0: {
            requirementDescription: "4 total Multiplication Points",
            effectDescription: "Keep A milestones on M reset.",
            done(){return player.m.total.gte(4)}
        },
        1: {
            requirementDescription: `7 total Multiplication Points`,
            effectDescription: `Gain 25% of Addition points each second. Keep S upgrades on M reset.`,
            done(){return player.m.total.gte(7)},
            unlocked(){return hasMilestone("m", 0)},
        },
        2: {
            requirementDescription: `10 total Multiplier Points`,
            effectDescription: `Keep 1 A upgrade per M reset, automate the first 4 A dimensions. Automated dimensions cost nothing.`,
            done(){return player.m.total.gte(10)},
            unlocked(){return hasMilestone("m", 1)},
        },
        3: {
            requirementDescription: "15 Total Multiplication Points",
            effectDescription: "Autobuy the final 4 Addition Dimensions.",
            done(){return player.m.total.gte(15)},
            unlocked(){return hasMilestone("m", 2)},
        },
        4: {
            requirementDescription: "20 M resets",
            effectDescription: "Keep up to 2.00e20 Addition Power on M reset.",
            done(){return player.m.resets.gte(20)},
            unlocked(){return hasMilestone("m", 3)},
        }
    },
    tabFormat(){
        let rep = player.m.replication
        let cap = rep.softcap
        let stringa = ``
        aDisplay = cap.cap2.effect.pow(-1)
        if(cap.cap2.effect.gte(1000))aDisplay = cap.cap2.effect
        if(player.m.replicators.gte(1e50))stringa = `Beyond ${format(cap.cap2.start)} Replicator Points, the Replication Multiplier is raised ^${format(aDisplay)}`
        if(cap.cap2.effect.gte(1000))stringa = stringa + "⁻¹"

        const inLog = player.e.logarithm.inLogarithm
        //for(item in rep){
        //    console.log(rep[item].toString(), item)
        //}
        return {
            "Main": {
                content: [
                    ["display-text", `You have ${colorText("m", {"whole": true})} Multiplication Points.`],
                    "prestige-button",
                    ["display-text", `You have ${format(player.s.successors)} Successors.`],
                    ["display-text", `You have made a total of ${format(player.m.total)} Multiplication Points.`],
                    ["display-text", `Your best Multiplication Points was ${format(player.m.best)} Multiplication Points.`],
                    ["display-text", `You have done ${format(player.m.resets)} Multiplication Resets.`],
                    "blank",
                    ["display-text", `Your Successor power is ${format(player.s.power)}, which multiplies Successor effectiveness and amount.`],
                    renderString(`You are gaining Addition points at ${format(player.efficiency.addition)}% efficiency. (+${format(layers.a.getPassiveAdditions())}/s)`, player.efficiency.addition.gt(0)),
                    renderString(`Your Addition Upgrade Effectiveness is ${player.a.upgEffectiveness}%. (Doesn't affect <h3>Constant</h3> upgrades)`, !player.a.upgEffectiveness.eq(100)),
                    "blank",
                    "milestones",
                    "blank",
                    ...generateComponent("upgrades", 2),
                ]
            },
            "Replication": {
                unlocked: hasUpgrade("c", 15) && hasUpgrade("m", 25),
                content: [
                    ["display-text", `You have ${colorText("m", {"whole": true})} Multiplication Points.`],
                    "prestige-button",
                    ["display-text", `You have ${format(player.s.successors)} Successors.`],
                    ["display-text", `You have made a total of ${format(player.m.total)} Multiplication Points.`],
                    ["display-text", `Your best Multiplication Points was ${format(player.m.best)} Multiplication Points.`],
                    ["display-text", `You have done ${formatWhole(player.m.resets)} Multiplication Resets.`],
                    "blank",
                    ["display-text", `You have ${colorText("m", {name:"power"})} Multiplication Power. (+${format(layers.m.getMultPowerGain())}/s, based on highest Replication Points.)`],
                    ["display-text", `You have ${colorText("m", {name:"replicators"})} Replicator Points.`],
                    "blank",
                    ["display-text", `Your Replicator Points are getting ${inLog ? "increased" : "multiplied"} by ${format(rep.multiplier, 3)} each replication.`],
                    ["display-text", stringa],
                    ["display-text", `The next replication occurs ${formatWhole(rep.amount)} times.`],
                    ["display-text", `The replication interval is ${formatTime(rep.interval)}`],
                    renderString(`Beyond ${format(cap.cap1.start)} Replicator Points, the Replication Interval gets multiplied by ${format(cap.cap1.effect)}.`, player.m.replicators.gte(1000)),
                    renderString(`Due to the Replication interval being too large, your Replication Points are ${inLog ? "increased" : "multiplied"} by the net ${inLog ? "increase" : "multiplier"} per second.`, rep.interval.gte(15)),
                    renderString(`Time since last replication: ${formatTime(rep.time)}`, rep.interval.lt(15)),
                    ["display-text", `Your net ${inLog ? "increase" : "multiplier"} per second is: ${inLog ? "+" : "x"}${format(layers.m.getNetMultiplier(), 3)}/s`],
                    "blank",
                    renderString(`<h2>Buyables</h2>`, hasUpgrade("m", "r-13")),
                    renderString(`Each buyable gives free levels to the buyable above it.`, tmp.m.buyables["r-21"].unlocked),
                    ...generateComponent("buyables", 2, {"prefix":"r-"}),
                    "blank",
                    ["display-text", "<h2>Power upgrades</h2>"],
                    ...generateComponent("upgrades", 2, {"prefix":"p-"}),
                    "blank",
                    ["display-text", "<h2>Replication upgrades</h2>"],
                    ...generateComponent("upgrades", 2, {"prefix":"r-"})
                ]
            }
        }
    },
    hotkeys: [{key: "m", description: "m: Reset for Multiplication", onPress(){if(player.m.unlocked)doReset("m")}, unlocked(){return player.m.unlocked}}],
    doReset(resettingLayer){
        if(tmp[resettingLayer].row > this.row){
            let keep = []
            let keptResets = new ExpantaNum(0)
            let keptBuyables = {
                "r-11": {
                    amount: getBuyableAmount("m", "r-11"),
                    kept: false
                },
                "r-12": {
                    amount: getBuyableAmount("m", "r-12"),
                    kept: false
                },
                "r-13": {
                    amount: getBuyableAmount("m", "r-13"),
                    kept: false
                },
                "r-21": {
                    amount: getBuyableAmount("m", "r-21"),
                    kept: resettingLayer === "e"
                },
                "r-22": {
                    amount: getBuyableAmount("m", "r-22"),
                    kept: resettingLayer === "e"
                },
                "r-23": {
                    amount: getBuyableAmount("m", "r-23"),
                    kept: resettingLayer === "e"
                },
            }
            if(resettingLayer === "e" && hasMilestone("e", 0))keptResets = player.m.resets.min(20)
            if(resettingLayer === "e" && hasMilestone("e", 1))keep.push("milestones")
            if(resettingLayer === "e" && hasMilestone("e", 5))keep.push("upgrades")
            if(resettingLayer === "e" && player.m.replicators.gte(tmp.e.exponentRequirement))player.e.exponents = player.e.exponents.add(1)

            layerDataReset("m", keep)
            player.m.resets = keptResets
            if(hasMilestone('e', 3) && !hasMilestone("e", 5))player.m.upgrades = [11, 12, 13, 14, 15, 21, 22, 23, 24, 25]
            if(hasMilestone('e', 4) && !hasMilestone("e", 5))player.m.upgrades = [11, 12, 13, 14, 15, 21, 22, 23, 24, 25, "p-11", "p-12", "p-13", "p-14", "p-15", "r-11", "r-12", "r-13", "r-14", "r-15"]
            if(hasMilestone("e", 7))player.m.replicators = new ExpantaNum(1000)
            for(let key in keptBuyables){
                let stat = keptBuyables[key]
                if(stat.kept)setBuyableAmount("m", key, stat.amount)
            }
        }
    }
})
addLayer("e", {
    name: "Exponentiation",
    symbol: "E",
    row: 3,
    position: 0,
    color: "#0088FF",
    branches: ["m"],
    layerShown(){return hasUpgrade("c", 16)},
    startData(){return {
        unlocked: false,
        points: new ExpantaNum(0),
        exponents: new ExpantaNum(0),
        effExp: {
            "upgrades": new ExpantaNum(0),
            "score": new ExpantaNum(0),
        },
        score: new ExpantaNum(0),
        best: new ExpantaNum(0),
        total: new ExpantaNum(0),
        bonus: {
            11: new ExpantaNum(0),
            12: new ExpantaNum(0),
            13: new ExpantaNum(0),
            21: new ExpantaNum(0),
            22: new ExpantaNum(0),
            23: new ExpantaNum(0),
        },
        logarithm: {
            best: new ExpantaNum(0),
            score: new ExpantaNum(0),
            points: new ExpantaNum(0),
            highest: new ExpantaNum(0),
            inLogarithm: false,
            base: new ExpantaNum(0),
        }
    }},
    type: "normal",
    baseResource: "Replicator Points",
    baseAmount(){return player.m.replicators},
    requires: new ExpantaNum(10000),
    resource: "Exponentiation Points",
    update(diff){
        let logarithm = player.e.logarithm
        if(player.e.points.gte(player.e.best))player.e.best = player.e.points
        logarithm.points = logarithm.points.add(tmp.e.getLogarithmicPointGen.mul(diff))
        if(logarithm.inLogarithm){
            logarithm.best = logarithm.best.max(player.points)
            logarithm.points = new ExpantaNum(0)
        }
        logarithm.highest = getHighest(logarithm.highest, logarithm.points)
    },
    getResetGain(){
        let gain = player.m.replicators.log10().pow(0.5).div(2).mul(tmp.e.gainMult).floor()

        return gain
    },
    getNextAt(){
        let next = new ExpantaNum(10).pow(tmp.e.getResetGain.add(1).mul(2).div(tmp.e.gainMult).pow(2))

        if(next.lte(10000))next = new ExpantaNum(10000)
        return next
    },
    gainMult(){
        let mul = new ExpantaNum(1)

        mul = applyEffect("milestones", mul, "e", [1, 5], "mul")
        mul = applyEffect("upgrades", mul, "e", [32, "l-14"], "mul")
        mul = applyEffect("buyables", mul, "e", [22], "mul")
        mul = applyEffect("buyables", mul, "m", ["r-23"], "mul")

        return mul
    },
    exponentRequirement(){
        let req = new ExpantaNum(1000).mul(new ExpantaNum(10).pow(new ExpantaNum(2).pow(player.e.exponents.pow(1.25))))

        return req
    },
    prestigeButtonText(){
        let str = `Reset everything for `
        if(player.m.replicators.gte(tmp.e.exponentRequirement))str = str + `an Exponent and `
        str = str + `<b>+${formatWhole(tmp.e.getResetGain)}</b> Exponentiation Points. <br> Next EP at: ${format(tmp.e.getNextAt)} Replicator Points <br> Next Exponent at: ${format(tmp.e.exponentRequirement)} Replicator Points.`
        return str
    },
    getExponentialScore(){
        let score = player.e.best.pow(player.e.effExp.score)
        score = applyEffect("buyables", score, "e", [11], "mul", 0)
        score = applyEffect("upgrades", score, "e", [33, "l-11"], "mul")
        score = applyEffect("upgrades", score, "e", ["l-21"], "mul", 1)
        score = score.pow(tmp.e.getLogarithmicScoreEffect)
        
        if(player.e.best.lte(0) || player.e.exponents.lte(0))score = new ExpantaNum(0)
        
        player.e.score = score
    },
    getScoreEffect(){
        let eff = player.e.score.mul(10).max(1).log10().mul(2).add(1)

        eff = applyEffect("upgrades", eff, "e", [23], "pow")

        return eff
    },
    getLogarithmicScore(){
        let score = player.e.logarithm.best.max(1).log10().pow(0.5)

        score = applyEffect("upgrades", score, "e", ["l-13"], "add")
        score = applyEffect("upgrades", score, "e", ["l-35"], "add", 0)

        player.e.logarithm.score = score
    },
    getLogarithmicScoreEffect(){
        let eff = player.e.logarithm.score.add(1).log10().add(1).log10().add(1).pow(0.2)

        return eff
    },
    getLogarithmicPointGen(){
        let gain = player.e.logarithm.score.mul(10).max(1).log10().mul(2).max(1).log10()

        gain = applyEffect("upgrades", gain, "e", ["l-24"], "mul", 0)
        gain = applyEffect("upgrades", gain, "e", ["l-24"], "pow", 1)

        gain = applyEffect("upgrades", gain, "e", ["l-12"], "mul")
        gain = applyEffect("upgrades", gain, "e", ["l-15", "l-21"], "mul", 0)
        gain = applyEffect("buyables", gain, "e", [21], "mul")

        return gain
    },
    getLogarithmBase(){
        let base = new ExpantaNum(10)

        base = applyEffect("upgrades", base, "e", ["l-32"], "sub", 0)

        player.e.logarithm.base = base
    },
    getEffectiveToUpgrades(){
        let effective = player.e.exponents

        effective = applyEffect('buyables', effective, "e", [12], "add")
        effective = applyEffect("upgrades", effective, "e", ["l-33"], "add", 0)

        player.e.effExp.upgrades = effective
    },
    getEffectiveToScore(){
        let effective = player.e.exponents

        effective = applyEffect("upgrades", effective, "e", ["l-33"], "add", 1)

        player.e.effExp.score = effective
    },
    upgrades: {
        11: {
            title: "Exponentiation I",
            description: "Boost Addition and Multiplication Points by 2 per Exponent.",
            cost: new ExpantaNum(1),
            effect(){
                let eff = new ExpantaNum(2).pow(player.e.effExp.upgrades)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Addition and Multiplication Points.`}
        },
        12: {
            title: "Exponentiation II",
            description: "Replications occur once more per Exponent",
            cost: new ExpantaNum(2),
            effect(){
                let eff = player.e.effExp.upgrades

                return eff
            },
            effectDisplay(){return `Replications occur ${formatWhole(this.effect())} more times.`},
            unlocked(){return hasUpgrade("e", 11)}
        },
        13: {
            title: "Exponentiation III",
            description: `The Replication Interval is multiplied by 0.95 per Exponent, raise Point and Successor efficiency ^1.1.`,
            cost: new ExpantaNum(3),
            effect(){
                let eff1 = new ExpantaNum(0.95).pow(player.e.effExp.upgrades)
                let eff2 = new ExpantaNum(1.1)

                return [eff1, eff2]
            },
            effectDisplay(){ return `${format(this.effect()[0], 2, true)}x to the Replication Interval, ^${format(this.effect()[1])} to Point and Successor efficiency.`},
            unlocked(){return hasUpgrade("e",12)}
        },
        14: {
            title: "Exponentiation IV",
            description: "Each Exponent raises the Replication Multiplier ^1.1. Unlock an Exponentiation buyable.",
            cost: new ExpantaNum(4),
            effect(){
                let eff = new ExpantaNum(1.1).pow(player.e.effExp.upgrades)

                return eff
            },
            effectDisplay(){return `^${format(this.effect())} to the Replication Multiplier.`},
            unlocked(){return hasUpgrade("e", 13)}
        },
        15: {
            title: "Constant XII",
            description: "Each Exponent increases <b>Constant II</b> and <b>Constant III</b>'s limits by 0.1. Constant Points are boosted by ^1.1.",
            cost: new ExpantaNum(10),
            effect(){
                let eff1 = player.e.effExp.upgrades.mul(0.1)
                let eff2 = new ExpantaNum(1.1)

                return [eff1, eff2]
            },
            effectDisplay(){return `+${format(this.effect()[0])} to <b>Constant II</b> & <b>III</b>'s limits, ^${this.effect()[1]} Constant Points.`},
            unlocked(){return hasUpgrade("e", 14)}
        },
        21: {
            title: "Exponentiation V",
            description: "Multiplication Power and Mult Per Buy is boosted by 1.50x per Exponent.",
            cost: new ExpantaNum(20),
            effect(){
                let eff1 = new ExpantaNum(1.50).pow(player.e.effExp.upgrades)
                let eff2 = new ExpantaNum(1.50).pow(player.e.effExp.upgrades)

                return [eff1, eff2]
            },
            effectDisplay(){return `${format(this.effect()[0])}x to Mult Per Buy, ${format(this.effect()[1])}x to Multiplication Power.`},
            unlocked(){return hasUpgrade("e", 15)}
        },
        22: {
            title: "Exponentiation VI",
            description: "Unlock a second Exponentiation buyable. <b>Replication Multiplier</b>'s base is increased by +0.001 each Exponent.",
            cost: new ExpantaNum(30),
            effect(){
                let eff = new ExpantaNum(0.001).mul(player.e.effExp.upgrades)

                return eff
            },
            effectDisplay(){return `+${this.effect()} to <b>Replication Multiplier</b>'s base.`},
            unlocked(){return hasUpgrade("e", 21)}
        },
        23: {
            title: "Exponentiation VII",
            description(){return `Each Exponent increases Score effect by +^${format(this.base())}.`},
            cost: new ExpantaNum(50),
            base(){
                let base = new ExpantaNum(0.1)

                base = applyEffect("buyables", base, "e", [13], "add")

                return base
            },
            effect(){
                let eff = player.e.effExp.upgrades.mul(this.base()).add(1)

                return eff
            },
            effectDisplay(){return `^${format(this.effect())} to Score effect.`},
            unlocked(){return hasUpgrade("e", 22)}
        },
        24: {
            title: "Exponentiation VIII",
            description: "Each Exponent multiplies Point, Successor and Addition efficiency by 1.75.",
            cost: new ExpantaNum(300),
            effect(){
                let eff = new ExpantaNum(1.75).pow(player.e.effExp.upgrades)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Point, Successor and Addition efficiency.`},
            unlocked(){return hasUpgrade("e", 23)}
        },
        25: {
            title: "Constant XIII",
            description: "Boost Constant Points based on Exponents.",
            cost: new ExpantaNum(500),
            effect(){
                let eff = new ExpantaNum(1.03).pow(player.e.effExp.upgrades)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Constant Points.`},
            unlocked(){return hasUpgrade("e", 24)}
        },
        31: {
            title: "Exponentiation IX",
            description: "Exponential Score boosts Point, Successor and Addition efficiency at a reduced rate.",
            cost: new ExpantaNum(1000),
            effect(){
                let eff = tmp.e.getScoreEffect.pow(0.3).add(1)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Point, Successor and Addition efficiency.`},
            unlocked(){return hasUpgrade("e", 25)}
        },
        32: {
            title: "Exponentiation X",
            description: "Exponential Score boosts Exponentation Points at a reduced rate.",
            cost: new ExpantaNum(1500),
            effect(){
                let eff = tmp.e.getScoreEffect.pow(0.2).add(1)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Exponentiation Points.`},
            unlocked(){return hasUpgrade("e", 31)}
        },
        33: {
            title: "Exponentiation XI",
            description: "Exponential Score boosts itself. Unlock a third buyable.",
            cost: new ExpantaNum(2500),
            effect(){
                let eff = tmp.e.getScoreEffect.pow(0.5).add(1)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Exponential Score.`},
            unlocked(){return hasUpgrade("e", 32)}
        },
        34: {
            title: "Constant XIV",
            description: "Exponential Score adds Constant Points at a reduced rate.",
            cost: new ExpantaNum(3500),
            effect(){
                let eff = tmp.e.getScoreEffect.max(1).log10().pow(0.2).div(2)

                return eff
            },
            effectDisplay(){return `+${format(this.effect())} Constant Points`},
            unlocked(){return hasUpgrade("e", 33)}
        },
        35: {
            title: "Constant XV",
            description: "Multiply Constant Points by 1.1.",
            cost: new ExpantaNum(5000),
            effect(){
                let eff = new ExpantaNum(1.1)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Constant Points.`},
            unlocked(){return hasUpgrade("e", 34)}
        },
        "l-11": {
            title: "Logarithm I",
            description: "Exponential Score gets boosted based on Logarithmic Points.",
            cost: new ExpantaNum(10),
            currencyDisplayName: "Logarithmic Points",
            currencyInternalName: "points",
            currencyLocation(){return player.e.logarithm},
            effect(){
                let eff = player.e.logarithm.points.max(1).pow(0.2)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Exponential Score`},
            unlocked(){return hasUpgrade("e", 35)}
        },
        "l-12": {
            title: "Logarithm II",
            description: "Unlock a new set of buyables. Logarithmic Points boost themselves.",
            cost: new ExpantaNum(20),
            currencyDisplayName: "Logarithmic Points",
            currencyInternalName: "points",
            currencyLocation(){return player.e.logarithm},
            effect(){
                let eff = player.e.logarithm.points.max(1).log10().add(1).pow(1.5)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Logarithmic Points.`},
            unlocked(){return hasUpgrade("e", "l-11")}
        },
        "l-13": {
            title: "Logarithm III",
            description(){return `Logarithmic Score is increased by +${format(this.base())} per Exponent.`},
            cost: new ExpantaNum(200),
            currencyDisplayName: "Logarithmic Points",
            currencyInternalName: "points",
            currencyLocation(){return player.e.logarithm},
            base(){
                let base = new ExpantaNum(0.02)

                return base
            },
            effect(){
                let eff = this.base().mul(player.e.effExp.upgrades)

                return eff
            },
            effectDisplay(){return `+${format(this.effect())} to Logarithmic Score.`},
            unlocked(){return hasUpgrade("e", "l-12")}
        },
        "l-14": {
            title: "Logarithm IV",
            description(){return `Exponentiation Points are multiplied by ${format(this.base())}x per Logarithm upgrade bought.`},
            cost: new ExpantaNum(500),
            currencyDisplayName: "Logarithmic Points",
            currencyInternalName: "points",
            currencyLocation(){return player.e.logarithm},
            base(){
                let base = new ExpantaNum(1.2)

                return base
            },
            effect(){
                let eff = this.base().pow(player.e.upgrades.filter(id => hasUpgrade("e", id) && id.toString()[0] === "l").length)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Exponentiation Points`},
            unlocked(){return hasUpgrade("e", "l-13")}
        },
        "l-15": {
            title: "Constant XVI",
            description: "Logarithmic Points and Constant Points boost each other, with a limit of 2x for Constant Points.",
            cost: new ExpantaNum(1000),
            currencyDisplayName: "Logarithmic Points",
            currencyInternalName: "points",
            currencyLocation(){return player.e.logarithm},
            effect(){
                let limit = new ExpantaNum(2)
                let eff1 = player.c.points.pow(0.2).max(1)
                eff1 = applyEffect("upgrades", eff1, "e", ["l-34"], "pow", 0)
                let eff2 = player.e.logarithm.points.max(1).log10().pow(0.1).min(limit).max(1)

                return [eff1, eff2]
            },
            effectDisplay(){return `${format(this.effect()[0])}x to Logarithmic points, ${format(this.effect()[1])}x to Constant Points.`},
            unlocked(){return hasUpgrade("e", "l-14")}
        },
        "l-21": {
            title: "Logarithm V",
            description: "Best Points in Logarithm directly boost Logarithmic Points. Logarithmic Points boosts Exponential Score.",
            cost: new ExpantaNum(1500),
            currencyDisplayName: "Logarithmic Points",
            currencyInternalName: "points",
            currencyLocation(){return player.e.logarithm},
            effect(){
                let eff1 = player.e.logarithm.best.max(1).log10().max(1)
                let eff2 = player.e.logarithm.points.max(1).log10().pow(3).max(1)

                return [eff1, eff2]
            },
            effectDisplay(){return `${format(this.effect()[0])}x to Logarithmic Points, ${format(this.effect()[1])}x to Exponential Score.`},
            unlocked(){return hasUpgrade("e", "l-15")}
        },
        "l-22": {
            title: "Logarithm VI",
            description: "Unlock a new set of Multiplication buyables.",
            cost: new ExpantaNum(10000),
            currencyDisplayName: "Logarithmic Points",
            currencyInternalName: "points",
            currencyLocation(){return player.e.logarithm},
            unlocked(){return hasUpgrade("e", "l-21")}
        },
        "l-23": {
            title: "Logarithm  VII",
            description: "Each <b>Softcap Reducer</b> bought increases <b>Replication Interval</b>'s base by +0.0005.",
            cost: new ExpantaNum(30000),
            currencyDisplayName: "Logarithmic Points",
            currencyInternalName: "points",
            currencyLocation(){return player.e.logarithm},
            base(){
                let base = new ExpantaNum(0.0005)

                return base
            },
            effect(){
                let eff = this.base().mul(getBuyableAmount("m", "r-22"))

                return eff
            },
            effectDisplay(){return `+${format(this.effect(), 3)} to <b>Replication Interval</b>'s base.`},
            unlocked(){return hasUpgrade("e", "l-22")}
        },
        "l-24": {
            title: "Logarithm VIII",
            description: "Base Logarithmic Point gain is tripled. Each Logarithmic upgrade raises it ^1.05.",
            cost: new ExpantaNum(50000),
            currencyDisplayName: "Logarithmic Points",
            currencyInternalName: "points",
            currencyLocation(){return player.e.logarithm},
            effect(){
                let eff1 = new ExpantaNum(3)
                let eff2 = new ExpantaNum(1.05).pow(player.e.upgrades.filter(id => id.toString()[0] === "l").length)

                return [eff1, eff2]
            },
            effectDisplay(){return `${format(this.effect()[0])}x, ^${format(this.effect()[1])} to base Logarithmic Points.`},
            unlocked(){return hasUpgrade("e", "l-23")}
        },
        "l-25": {
            title: "Constant XVII",
            description: "Logarithmic Score effect affects Constant Points up to a limit of ^1.15.",
            cost: new ExpantaNum(100000),
            currencyDisplayName: "Logarithmic Points",
            currencyInternalName: "points",
            currencyLocation(){return player.e.logarithm},
            effect(){
                let eff = tmp.e.getLogarithmicScoreEffect.min(1.15)

                return eff
            },
            unlocked(){return hasUpgrade("e", "l-24")}
        },
        "l-31": {
            title: "Logarithm IX",
            description: "<b>Logarithm VIII</b> affects base Multiplication Power at a reduced rate.",
            cost: new ExpantaNum(150000),
            currencyDisplayName: "Logarithmic Points",
            currencyInternalName: "points",
            currencyLocation(){return player.e.logarithm},
            effect(){
                let eff1 = new ExpantaNum(2)
                let eff2 = layers.e.upgrades["l-24"].effect()[1].pow(0.7)
                return [eff1, eff2]
            },
            unlocked(){return hasUpgrade("e", "l-25")}
        },
        "l-32": {
            title: "Logarithm X",
            description: "Reduce the logarithm base in Logarithm by -1. Boost Successor Effectiveness after logarithm based on highest Logarithmic Points.",
            cost: new ExpantaNum(300000),
            currencyDisplayName: "Logarithmic Points",
            currencyInternalName: "points",
            currencyLocation(){return player.e.logarithm},
            effect(){
                let eff = player.e.logarithm.highest.max(1).log10()

                return [new ExpantaNum(1), eff]
            },
            effectDisplay(){return `-${format(this.effect()[0])} to Logarithm base, ${format(this.effect()[1])}x to Successor Effectiveness.`},
            unlocked(){return hasUpgrade("e", "l-31")}
        },
        "l-33": {
            title: "Logarithm XI",
            description: "Increase effective exponents to upgrades by 1. Increase effective exponents to Score by 1.",
            cost: new ExpantaNum(500000),
            currencyDisplayName: "Logarithmic Points",
            currencyInternalName: "points",
            currencyLocation(){return player.e.logarithm},
            effect(){
                let eff1 = new ExpantaNum(1)
                let eff2 = new ExpantaNum(1)

                return [eff1, eff2]
            },
            unlocked(){return hasUpgrade("e", "l-32")}
        },
        "l-34": {
            title: "Constant XVIII",
            description: "<b>Constant XVI</b>'s effect to Logarithmic Points is raised ^3. Constant Points get raised ^1.05.",
            cost: new ExpantaNum(750000),
            currencyDisplayName: "Logarithmic Points",
            currencyInternalName: "points",
            currencyLocation(){return player.e.logarithm},
            effect(){
                let eff1 = new ExpantaNum(3)
                let eff2 = new ExpantaNum(1.05)

                return [eff1, eff2]
            },
            effectDisplay(){return `^${format(this.effect()[0])} to <b>Constant XVI</b>, ^${format(this.effect()[1])} to Constant Points.`},
            unlocked(){return hasUpgrade("e", "l-33")}
        },
        "l-35": {
            title: "Constant XIX",
            description: "Constant Points add Logarithmic Score, boost Constant Points by 1.01 per Logarithm upgrade bought.",
            cost: new ExpantaNum(5e6),
            currencyDisplayName: "Logarithmic Points",
            currencyInternalName: "points",
            currencyLocation(){return player.e.logarithm},
            effect(){
                let eff1 = player.c.points.max(1).log10().pow(0.5).div(10)
                let eff2 = new ExpantaNum(1.01).pow(player.e.upgrades.filter(id => id.toString()[0] === "l").length)

                return [eff1, eff2]
            },
            effectDisplay(){return `+${format(this.effect()[0])} to Logarithmic Score, ${format(this.effect()[1])}x to Constant Points.`},
            unlocked(){return hasUpgrade("e", "l-34")}
        },
    },
    buyables: {
        11: {
            title: "Score Boost",
            display(){
                let str = ``
                if(player.e.bonus[11].gt(0))str = `+ ${formatWhole(player.e.bonus[11])}`
                return `Multiply Exponential Score by ${format(this.base())}x and gain +1 free level to the first three Multiplier buyables. <br> Cost: ${formatWhole(this.cost())} Exponentiation Points <br> Effect: ${format(this.effect()[0])}x to Exponential Score, +${format(this.effect()[1])} extra Muliplication Buyable levels. <br> Amount: ${formatWhole(getBuyableAmount(this.layer, this.id))} ${str}`
            },
            costBase(){
                let base = new ExpantaNum(3)

                return base
            },
            costExp(){
                let exp = new ExpantaNum(1.25)

                return exp
            },
            cost(x){
                return this.costBase().pow(x.pow(this.costExp())).floor()
            },
            base(){
                let base = new ExpantaNum(1.50)

                return base
            },
            effect(x){
                let eff1 = this.base().pow(x)
                let eff2 = x

                return [eff1, eff2]
            },
            canAfford(){return player.e.points.gte(this.cost())},
            buyMax(){
                canMax = false

                if(player.e.points.lt(1)){
                    return new ExpantaNum(0)
                }
                if(canMax){
                    return player.e.points.logBase(this.costBase()).pow(new ExpantaNum(1).div(this.costExp())).sub(getBuyableAmount(this.layer, this.id))
                } else{
                    return new ExpantaNum(1)
                }
            },
            buy(){
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(this.buyMax()))
                player.e.points = player.e.points.sub(this.cost(getBuyableAmount(this.layer, this.id).sub(1)))
            }
        },
        12: {
            title: "Extra Exponents",
            display(){
                let str = ``
                if(player.e.bonus[12].gt(0))str = `+ ${formatWhole(player.e.bonus[12])}`
                return `Effective Exponents to Exponent Upgrades are increased by +${formatWhole(this.base())}. <br> Cost: ${formatWhole(this.cost())} Exponentiation Points <br> Effect: +${formatWhole(this.effect())} extra Exponents <br> Amount: ${formatWhole(getBuyableAmount(this.layer, this.id))} ${str}`
            },
            costBase(){
                let base = new ExpantaNum(10)

                return base
            },
            costExp(){
                let exp = new ExpantaNum(1.5)

                return exp
            },
            baseCost(){
                let base = new ExpantaNum(10)

                return base
            },
            cost(x){return this.baseCost().mul(this.costBase().pow(x.pow(this.costExp())))},
            base(){
                let base = new ExpantaNum(1)

                return base.floor()
            },
            effect(x){
                let eff = this.base().mul(x)

                return eff.floor()
            },
            canAfford(){return player.e.points.gte(this.cost())},
            buyMax(){
                canMax = false

                if(player.e.points.lt(this.baseCost())){
                    return new ExpantaNum(0)
                }
                if(canMax){
                    return player.e.points.logBase(this.costBase()).pow(new ExpantaNum(1).div(this.costExp())).sub(getBuyableAmount(this.layer, this.id))
                } else{
                    return new ExpantaNum(1)
                }
            },
            buy(){
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(this.buyMax()))
                player.e.points = player.e.points.sub(this.cost(getBuyableAmount(this.layer, this.id).sub(1)))
            },
            unlocked(){return hasUpgrade("e", 22)}
        },
        13: {
            title: "Base Increase",
            display(){
                let str = ``
                if(player.e.bonus[13].gt(0))str = `+ ${formatWhole(player.e.bonus[13])}`
                return `<b>Exponentiation VII</b>'s base is increased by +${format(this.base(), 3)}. <br> Cost: ${formatWhole(this.cost())} Exponentiation Points <br> Effect: +${format(this.effect(), 3)} to <b>Exponentiation VII</b>'s base. <br> Amount: ${formatWhole(getBuyableAmount(this.layer, this.id))} ${str}`
            },
            costBase(){
                let base = new ExpantaNum(5)

                return base
            },
            costExp(){
                let exp = new ExpantaNum(1.3)

                return exp
            },
            baseCost(){
                let base = new ExpantaNum(1000)

                return base
            },
            cost(x){return this.baseCost().mul(this.costBase().pow(x.pow(this.costExp())))},
            base(){
                let base = new ExpantaNum(0.01)

                return base
            },
            effect(x){
                let eff = this.base().mul(x)

                return eff
            },
            canAfford(){return player.e.points.gte(this.cost())},
            buyMax(){
                canMax = false

                if(player.e.points.lt(this.baseCost())){
                    return new ExpantaNum(0)
                }
                if(canMax){
                    return player.e.points.logBase(this.costBase()).pow(new ExpantaNum(1).div(this.costExp())).sub(getBuyableAmount(this.layer, this.id))
                } else{
                    return new ExpantaNum(1)
                }
            },
            buy(){
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(this.buyMax()))
                player.e.points = player.e.points.sub(this.cost(getBuyableAmount(this.layer, this.id).sub(1)))
            },
            unlocked(){return hasUpgrade("e", 33)}
        },
        21: {
            title: "Logarithmic Points Boost",
            display(){
                let str = ``
                if(player.e.bonus[21].gt(0))str = `+ ${formatWhole(player.e.bonus[21])}`
                return `Logarithmic Points are boosted by ${format(this.base())}x. <br> Cost: ${formatWhole(this.cost())} Exponentiation Points <br> Effect: ${format(this.effect())}x to Logarithmic Points. <br> Amount: ${formatWhole(getBuyableAmount(this.layer, this.id))} ${str}`
            },
            costBase(){
                let base = new ExpantaNum(2)

                return base
            },
            costExp(){
                let exp = new ExpantaNum(1.2)

                return exp
            },
            baseCost(){
                let base = new ExpantaNum(10000)

                return base
            },
            cost(x){return this.baseCost().mul(this.costBase().pow(x.pow(this.costExp())))},
            base(){
                let base = new ExpantaNum(1.5)

                return base
            },
            effect(x){
                let eff = this.base().pow(x)

                return eff
            },
            canAfford(){return player.e.points.gte(this.cost())},
            buyMax(){
                canMax = false

                if(player.e.points.lt(this.baseCost())){
                    return new ExpantaNum(0)
                }
                if(canMax){
                    return player.e.points.logBase(this.costBase()).pow(new ExpantaNum(1).div(this.costExp())).sub(getBuyableAmount(this.layer, this.id))
                } else{
                    return new ExpantaNum(1)
                }
            },
            buy(){
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(this.buyMax()))
                player.e.points = player.e.points.sub(this.cost(getBuyableAmount(this.layer, this.id).sub(1)))
            },
            unlocked(){return hasUpgrade("e", "l-12")}
        },
        22: {
            title: "Exponential Points Boost",
            display(){
                let str = ``
                if(player.e.bonus[this.id].gt(0))str = `+ ${formatWhole(player.e.bonus[this.id])}`
                return `Exponentiation Points are boosted by ${format(this.base())}x. <br> Cost: ${formatWhole(this.cost())} Exponentiation Points <br> Effect: ${format(this.effect())}x to Exponentiation Points. <br> Amount: ${formatWhole(getBuyableAmount(this.layer, this.id))} ${str}`
            },
            costBase(){
                let base = new ExpantaNum(2.5)

                return base
            },
            costExp(){
                let exp = new ExpantaNum(1.25)

                return exp
            },
            baseCost(){
                let base = new ExpantaNum(50000)

                return base
            },
            cost(x){return this.baseCost().mul(this.costBase().pow(x.pow(this.costExp())))},
            base(){
                let base = new ExpantaNum(1.5)

                return base
            },
            effect(x){
                let eff = this.base().pow(x)

                return eff
            },
            canAfford(){return player.e.points.gte(this.cost())},
            buyMax(){
                canMax = false

                if(player.e.points.lt(this.baseCost())){
                    return new ExpantaNum(0)
                }
                if(canMax){
                    return player.e.points.logBase(this.costBase()).pow(new ExpantaNum(1).div(this.costExp())).sub(getBuyableAmount(this.layer, this.id))
                } else{
                    return new ExpantaNum(1)
                }
            },
            buy(){
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(this.buyMax()))
                player.e.points = player.e.points.sub(this.cost(getBuyableAmount(this.layer, this.id).sub(1)))
            },
            unlocked(){return hasUpgrade("e", "l-12")}
        },
        23: {
            title: "Post-Logarithm Points Boost",
            display(){
                let str = ``
                if(player.e.bonus[this.id].gt(0))str = `+ ${formatWhole(player.e.bonus[this.id])}`
                return `Successor effectiveness is boosted by ${format(this.base())}x AFTER logarithm. <br> Cost: ${formatWhole(this.cost())} Exponentiation Points <br> Effect: ${format(this.effect())}x to Successor effectiveness. <br> Amount: ${formatWhole(getBuyableAmount(this.layer, this.id))} ${str}`
            },
            costBase(){
                let base = new ExpantaNum(4)

                return base
            },
            costExp(){
                let exp = new ExpantaNum(1.3)

                return exp
            },
            baseCost(){
                let base = new ExpantaNum(1e6)

                return base
            },
            cost(x){return this.baseCost().mul(this.costBase().pow(x.pow(this.costExp())))},
            base(){
                let base = new ExpantaNum(2)

                return base
            },
            effect(x){
                let eff = this.base().pow(x)

                return eff
            },
            canAfford(){return player.e.points.gte(this.cost())},
            buyMax(){
                canMax = false

                if(player.e.points.lt(this.baseCost())){
                    return new ExpantaNum(0)
                }
                if(canMax){
                    return player.e.points.logBase(this.costBase()).pow(new ExpantaNum(1).div(this.costExp())).sub(getBuyableAmount(this.layer, this.id))
                } else{
                    return new ExpantaNum(1)
                }
            },
            buy(){
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(this.buyMax()))
                player.e.points = player.e.points.sub(this.cost(getBuyableAmount(this.layer, this.id).sub(1)))
            },
            unlocked(){return hasUpgrade("e", "l-12")}
        },
    },
    milestones: {
        0: {
            requirementDescription: "2 Exponents",
            effectDescription: "Keep up to 20 Multiplication Resets on Exponent reset.",
            done(){return player.e.exponents.gte(2)}
        },
        1: {
            requirementDescription: "4 total Exponentiation Points",
            effectDescription: "Multiply EP gain by E milestones completed. Keep M milestones on E reset.",
            done(){return player.e.total.gte(4)},
            effect(){
                let eff = new ExpantaNum(player.e.milestones.length)

                return eff
            },
            unlocked(){return hasMilestone("e", 0)}
        },
        2: {
            requirementDescription: `3 Exponents`,
            effectDescription: `Gain 10% of Multiplication Points on reset each second.`,
            done(){return player.e.exponents.gte(3)},
            unlocked(){return hasMilestone("e", 1)}
        },
        3: {
            requirementDescription: `4 Exponents`,
            effectDescription: `The first three Multiplication Buyables are always unlocked. Keep the first 10 Multiplication upgrades.`,
            done(){return player.e.exponents.gte(4)},
            unlocked(){return hasMilestone("e", 2)}
        },
        4: {
            requirementDescription: "100 total Eponentiation Points",
            effectDescription: "Keep the first row of Replication and Power upgrades.",
            done(){return player.e.total.gte(100)},
            unlocked(){return hasMilestone("e", 3)}
        },
        5: {
            requirementDescription: "200 total Exponentiation Points",
            effectDescription: "Keep ALL M upgrades. Quadruple Exponentiation Points gain.",
            done(){return player.e.total.gte(200)},
            effect(){
                let eff = new ExpantaNum(4)

                return eff
            },
            unlocked(){return hasMilestone("e", 4)}
        },
        6: {
            requirementDescription: "1000 total Exponentiation Points",
            effectDescription: "Automate the first three Multiplication Buyables. They spend nothing. Replication Interval below 5s is now 2x faster.",
            done(){return player.e.total.gte(1000)},
            effect(){
                let eff = new ExpantaNum(2)

                return eff
            },
            unlocked(){return hasMilestone("e", 5)}
        },
        7: {
            requirementDescription: "25,000 total Exponentiation Points",
            effectDescription: "Start with 1000 Replication Points on reset.",
            done(){return player.e.total.gte(25000)},
            unlocked(){return hasMilestone("e", 6)}
        },
        8: {
            requirementDescription: "100,000 total Exponentiatiion Points",
            effectDescription: "Bulk buy 5 of the first three Multiplication buyables.",
            done(){return player.e.total.gte(100000)},
            unlocked(){return hasMilestone("e", 7)}
        },
    },
    clickables: {
        "logarithm": {
            title(){return `${player.e.logarithm.inLogarithm ? "Exit" : "Enter"} Logarithm`},
            display(){return `Entering Logarithm forces an Exponentiation reset, and will apply a logarithm to most prior stats. The Replication Multiplier adds instead of multiplies, and you can't click for Points. <br> Highest Points in Logarithm: ${format(player.e.logarithm.best)}`},
            onClick(){
                enterLogarithm()
            },
            canClick(){return true},
            unlocked(){return hasUpgrade("c", 21) && hasUpgrade("e", 35)},
            style(){return {"width":"500px", "height":"100px", "font-size":"90%"}}
        }
    },
    tabFormat(){
        let effective = player.e.effExp
        return {
            "Main": {
                content: [
                    ["display-text", `You have ${colorText("e", {whole: true, name:"exponents"})} Exponents, and ${colorText("e", {whole: true})} Exponentiation Points.`],
                    "prestige-button",
                    ["display-text", `You have ${format(player.m.replicators)} Replicator Points.`],
                    ["display-text", `You have made a total of ${format(player.e.total)} Exponentiation Points.`],
                    ["display-text", `Your best Exponentiation Points was ${format(player.e.best)}.`],
                    "blank",
                    ["display-text", `Your Exponential Score is ${colorText("e", {name:"score"})}`],
                    ["display-text", `Your Exponential Score boosts various things by ${colorText("e", {val:tmp.e.getScoreEffect})}x`],
                    "blank",
                    renderString(`You're gaining Multiplication Points at ${format(player.efficiency.multiplication)}% efficiency. (+${format(tmp.m.getPassiveMultiplications)}/s)`, player.efficiency.multiplication.gt(0)),
                    renderString(`There's ${formatWhole(effective.upgrades)} effective Exponents for upgrades.`, !(effective.upgrades.eq(player.e.exponents))),
                    renderString(`There's ${formatWhole(effective.score)} effective Exponents for score.`, !(effective.score.eq(player.e.exponents))),
                    "milestones",
                    "blank",
                    ...generateComponent("upgrades", 3),
                ]
            },
            "Buyables": {
                unlocked: hasUpgrade("e", 14),
                content: [
                    ["display-text", `You have ${colorText("e", {whole: true, name:"exponents"})} Exponents, and ${colorText("e", {whole: true})} Exponentiation Points.`],
                    "prestige-button",
                    ["display-text", `You have ${format(player.m.replicators)} Replicator Points.`],
                    ["display-text", `You have made a total of ${format(player.e.total)} Exponentiation Points.`],
                    ["display-text", `Your best Exponentiation Points was ${format(player.e.best)}.`],
                    "blank",
                    "buyables",
                ]
            },
            "Logarithm": {
                unlocked: hasUpgrade("c", 21),
                content: [
                    ["display-text", `You have ${colorText("e", {whole: true, name:"exponents"})} Exponents, and ${colorText("e", {whole: true})} Exponentiation Points.`],
                    "prestige-button",
                    ["display-text", `You have ${format(player.m.replicators)} Replicator Points.`],
                    ["display-text", `You have made a total of ${format(player.e.total)} Exponentiation Points.`],
                    ["display-text", `Your best Exponentiation Points was ${format(player.e.best)}.`],
                    "blank",
                    ["clickable", "logarithm"],
                    ["display-text", ],
                    "blank",
                    ["display-text", `Your Logarithmic Score is ${colorText("e", {depth:["logarithm", "score"]})}.`],
                    ['display-text', `Logarithmic Score boosts Exponential Score by ^${colorText("e", {val:tmp.e.getLogarithmicScoreEffect})}`],
                    ["display-text", `You have ${colorText("e", {depth:["logarithm", "points"]})} Logarithmic Points (+${format(tmp.e.getLogarithmicPointGen)}/s, based on Logarithmic Score)`],
                    "blank",
                    ...generateComponent("upgrades", 3, {prefix:"l-"})
                ]
            },
            "Info": {
                content: [
                    ["display-text", `You have ${colorText("e", {whole: true, name:"exponents"})} Exponents, and ${colorText("e", {whole: true})} Exponentiation Points.`],
                    "prestige-button",
                    ["display-text", `You have ${format(player.m.replicators)} Replicator Points.`],
                    ["display-text", `You have made a total of ${format(player.e.total)} Exponentiation Points.`],
                    ["display-text", `Your best Exponentiation Points was ${format(player.e.best)}.`],
                    "blank",
                    ["display-text", `You aren't required to gain an Exponent on every Exponentiation reset. You can also gain Exponentiation Points without gaining Exponents. <br><br> Exponential Score is equal to [best Exponentiation Points]^[Exponents]. <br> It boosts: Successor effectiveness, Successor amount, Addition Points, Mult Per Buy, Multiplication Points, Successor Power, and Multiplication Power. <br><br> Logarithmic Score is equal to log10([Best Points in Logarithm])^0.5. <br> Logarithmic Points can only be gained outside of Logarithm, and are set to 0 upon entering/exiting Logarithm.`],
                ]
            }
        }
    },
    hotkeys: [
        {key:"e", description:"e: Reset for Exponentiation", onPress(){if(player.e.unlocked)doReset("e")}, unlocked(){return player.e.unlocked}},
        {key:"l", description:"l:Enter Logarithm", onPress(){if(tmp.e.tabFormat.Logarithm.unlocked){enterLogarithm()}}, unlocked(){return layers.e.tabFormat().Logarithm.unlocked}},
    ]
})
