addLayer("w", {
    name: "wall", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "W", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#A9A9A9",
    requires: new Decimal(100), // Can be a function that takes requirement increases into account
    resource: "墙", // Name of prestige currency
    baseResource: "时间", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if(hasChallenge('w',12)) mult=mult.times(4)
        if(inChallenge('w',12)||inChallenge('w',13)) mult=mult.div(5)
        if(hasUpgrade('w',22)) mult=mult.times(upgradeEffect('w',22))
        if(hasUpgrade('w',31)) mult=mult.times(upgradeEffect('w',31))
        if(hasMilestone('d',2)) mult=mult.times(player.d.points.times(2).add(1))
        if(hasMilestone('d',4)) mult=mult.times(buyableEffect('w',11))
        if(hasUpgrade('dc',32)) mult=mult.times(upgradeEffect('dc',32))
        if(hasUpgrade('sw',11)) mult=mult.times(upgradeEffect('sw',11))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp=new Decimal(1)
        if(hasChallenge('w',13)) exp=exp.times(1.05)
        if(hasChallenge('w',14)) exp=exp.times(challengeEffect('w',14))
        if(inChallenge('w',14)) exp=exp.times(0.6)
        return exp
    },
    passiveGeneration(){
        if(hasMilestone('d',3)) return 1
        if(hasUpgrade('w',23)) return 0.1
        if(hasUpgrade('w',11)) return 0.01
    },
    Speedup(){
        dev=new Decimal(1)
        if(hasUpgrade('w',33)) dev=dev.times(2)
        if(hasUpgrade('dc',44)) dev=dev.times(upgradeEffect('dc',44))
        if(inChallenge('w',15)) dev=dev.div(100)
        dev=dev.times(new Decimal(1).sub(player.sw.resetTimes.div(100)))
        player.devSpeed=dev
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    upgrades:{
        11:{
            name:"wu1",
            title(){
                return "自动被墙"
            },
            description(){
                return "每秒获取重置时获取的墙的%1"
            },
            cost:new Decimal(1),
        },
        12:{
            name:"wu2",
            title:"哪来的挑战？",
            description:"根据已完成挑战数加成时间获取",
            effect(){return player.d.cha},
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked(){return hasUpgrade('w',11)},
            cost:new Decimal(1)
        },
        13:{
            name:"unlwc1",
            title:"挑战来了",
            description:"解锁墙挑战1",
            unlocked(){return hasUpgrade('w',12)},
            cost:new Decimal(5)
        },
        14:{
            name:"unlwc2",
            title:"比上个还墙",
            description:"解锁墙挑战2",
            unlocked(){return hasUpgrade('w',13)},
            cost:new Decimal(10)
        },
        15:{
            name:"unlwc3",
            title:"我不想被墙了",
            description:"解锁墙挑战3",
            unlocked(){return hasUpgrade('w',14)},
            cost:new Decimal(20)
        },
        21:{
            name:"wu3",
            title:"没一个够墙的",
            description:"获取时间速度*3",
            cost:new Decimal(30),
            unlocked(){return hasChallenge('w',13)}
        },
        22:{
            name:"wu4",
            title:"这游戏越来越简单了",
            description:"基于时间数加成墙获取",
            cost:new Decimal(100),
            effect(){return player.points.add(1).pow(0.02)},
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked(){return hasChallenge('w',13)&&hasUpgrade('w',21)}
        },
        23:{
            name:"wu5",
            title:"这款游戏是给婴儿玩的吗",
            description:"wu1效果%1 -> %10",
            cost:new Decimal(150),
            unlocked(){return hasChallenge('w',13)&&hasUpgrade('w',22)}
        },
        24:{
            name:"unlwc4",
            title:"再不上强度我都要退游了",
            description:"解锁墙挑战4",
            cost:new Decimal(300),
            unlocked(){return hasChallenge('w',13)&&hasUpgrade('w',23)}
        },
        31:{
            name:"wu6",
            title:"从未墙过",
            description:"基于墙数量加成墙获取",
            effect(){return player.points.add(1).pow(0.1)},
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            cost:new Decimal(1e3),
            unlocked(){return hasChallenge('w',14)}
        },
        32:{
            name:"wu7",
            title:"无用的升级",
            description:"时间获取速度x5",
            effect(){return 5},
            effectDisplay() { return "5x" },
            cost:new Decimal(2e3),
            unlocked(){return hasChallenge('w',14)&&hasUpgrade('w',31)}
        },
        33:{
            name:"wu8",
            title:"tt2协议",
            description:"将游戏速度x2",
            cost:new Decimal(1e4),
            unlocked(){return hasChallenge('w',14)&&hasUpgrade('w',32)}
        },
        41:{
            name:"wu9",
            title:"这是什么？",
            description:"解锁一个可购买",
            cost:new Decimal(1e5),
            unlocked(){return hasUpgrade('w',33)}
        },
        42:{
            name:"wu9",
            title:"拜谢之力",
            description:"拜谢的效果 *10",
            cost:new Decimal(1e6),
            unlocked(){return hasUpgrade('w',41)}
        },
        51:{
            name:"unlwc5",
            title:"最后的时间墙",
            description:"解锁wc5",
            cost:new Decimal(1e7),
            unlocked(){return hasUpgrade('w',42)}
        },
    },
    challenges: {
        11: {
            name: "wc1",
            challengeDescription: "时间获取速度/10<br><p style=\"color:rgb(255, 0, 0);\">不要点击重置，会退出挑战</p>",
            goalDescription:"拥有1墙",
            canComplete: function() {return player[this.layer].points.gte(1)},
            onEnter(){
                player.points=new Decimal(0)
                player.w.points=new Decimal(0)
            },
            onExit(){
                player.points=new Decimal(0)
                player.w.points=new Decimal(0)
            },
            onComplete(){
                player.d.cha=player.d.cha.add(1)
            },
            rewardDescription:"时间获取速度*9",
            unlocked(){return hasUpgrade('w',13)}
        },
        12: {
            name: "wc2",
            challengeDescription: "墙获取/5<br><p style=\"color:rgb(255, 0, 0);\">不要点击重置，会退出挑战</p>",
            goalDescription:"拥有5墙",
            canComplete: function() {return player[this.layer].points.gte(5)},
            onEnter(){
                player.points=new Decimal(0)
                player.w.points=new Decimal(0)
            },
            onExit(){
                player.points=new Decimal(0)
                player.w.points=new Decimal(0)
            },
            onComplete(){
                player.d.cha=player.d.cha.add(1)
            },
            rewardDescription:"墙获取*4",
            unlocked(){return hasUpgrade('w',14)}
        },
        13: {
            name: "wc3",
            challengeDescription: "时间获取速度/10,墙获取/5<br><p style=\"color:rgb(255, 0, 0);\">不要点击重置，会退出挑战</p>",
            goalDescription:"拥有10墙",
            canComplete: function() {return player[this.layer].points.gte(10)},
            onEnter(){
                player.points=new Decimal(0)
                player.w.points=new Decimal(0)
            },
            onExit(){
                player.points=new Decimal(0)
                player.w.points=new Decimal(0)
            },
            onComplete(){
                player.d.cha=player.d.cha.add(1)
            },
            rewardDescription:"时间获取速度和墙获取^1.05,解锁一些新升级",
            unlocked(){return hasUpgrade('w',15)}
        },
        14: {
            name: "wc4",
            challengeDescription: "时间获取速度^0.1,墙获取^0.6<br><p style=\"color:rgb(255, 0, 0);\">不要点击重置，会退出挑战</p>",
            goalDescription:"拥有10墙",
            canComplete: function() {return player[this.layer].points.gte(10)},
            onEnter(){
                player.points=new Decimal(0)
                player.w.points=new Decimal(0)
            },
            onExit(){
                player.points=new Decimal(0)
                player.w.points=new Decimal(0)
            },
            onComplete(){
                player.d.cha=player.d.cha.add(1)
            },
            rewardDescription:"墙获取基于当前时间数获得一个加成,解锁一些新升级",
            rewardEffect(){return player.points.add(1).pow(0.001)},
            rewardDisplay(){return "^"+format(challengeEffect(this.layer, this.id))},
            unlocked(){return hasUpgrade('w',24)}
        },
        15: {
            name: "wc5",
            challengeDescription: "游戏速度/100<br><p style=\"color:rgb(255, 0, 0);\">不要点击重置，会退出挑战</p>",
            goalDescription:"拥有100墙",
            canComplete: function() {return player[this.layer].points.gte(100)},
            onEnter(){
                player.points=new Decimal(0)
                player.w.points=new Decimal(0)
            },
            onExit(){
                player.points=new Decimal(0)
                player.w.points=new Decimal(0)
            },
            onComplete(){
                player.d.cha=player.d.cha.add(1)
            },
            rewardDescription:"解锁下一层级,根据墙数量加成拜谢效果",
            rewardEffect(){
                if(hasChallenge('w',15)) return player.w.points.add(1).log(10).add(1)
                else return new Decimal(1)
            },
            rewardDisplay(){return "x"+format(challengeEffect(this.layer, this.id))},
            unlocked(){return hasUpgrade('w',51)}
        },
    },
    buyables: {
        11: {
            cost(x) { return new Decimal(10).pow(x).div(10) },
            display() { return "拜谢<img src=\"s297.gif\" width=\"25\" height=\"25\"><br>你有"+getBuyableAmount(this.layer, this.id)+"个<img src=\"s297.gif\" width=\"25\" height=\"25\"><br>基于当前<img src=\"s297.gif\" width=\"25\" height=\"25\">数量加成时间获取<br>Currently: "+format(this.effect())+"x"+"<br>cost:"+format(this.cost(getBuyableAmount(this.layer, this.id)))},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            title(){return "<img src=\"s297.gif\" width=\"50\" height=\"50\">"},
            effect(){
                x=getBuyableAmount(this.layer, this.id)
                mult=new Decimal(1)
                if(hasUpgrade('w',41)) mult=mult.times(5)
                if(hasUpgrade('w',42)) mult=mult.times(10)
                if(hasChallenge('w',15)) mult=mult.times(challengeEffect('w',15))  
                if(hasUpgrade('d',12)) mult=mult.times(upgradeEffect('d',12))
                return x.times(mult).add(1)
            },
            unlocked(){return hasUpgrade('w',41)}
        },
    },
    automate()
    {
           if(hasMilestone('d',4)&&layers.w.buyables[11].canAfford()) buyBuyable('w',11)
    },
    autoUpgrade(){return hasMilestone('d',5)||hasUpgrade('sw',31)},
    tabFormat: {
        "upgrade":{
            content:[
                "main-display",
                "prestige-button",
                "resource-display",
               ["display-text",
                  function() {
                      return "墙的乘数："+format(tmp.w.gainMult.pow(tmp.w.gainExp))
                   },
                { "color": "#FFFFFF", "font-size": "20px"}],
              "upgrades",
              "buyables",
            ]   
        },
        "challenge":{
            content:[
                "main-display",
                "prestige-button",
                "challenges"
            ]  
        }
    },
    resetsNothing(){return false},
    doReset(resettingLayer){
        let kept=[]
        if(tmp[resettingLayer].row>tmp.w.row)
        {
            if(hasMilestone('d',6)) kept.push("challenges")
            if(hasUpgrade('c',23)&&resettingLayer=='c') kept.push("upgrades","buyables","challenges")
            if(hasUpgrade('sw',21)&&resettingLayer=='sw') kept.push("challenges")
            layerDataReset('w',kept)
        }
    },
    layerShown(){return true}
})
addLayer("d", {
    startData() { return {                   
        unlocked(){return false},                     
        points: new Decimal(0),              
        cha:new Decimal(1)
    }},
    name:"delation wall",
    color: "#8E2323",                  
    symbol:"DW",     
    resource: "膨胀墙",             
    row: 1,                                  
    baseResource: "墙",                  
    baseAmount() { return player.w.points },   
    requires: new Decimal(1e7),              
    type: "normal",                         
    exponent: 0.3,                
    branches:['w'],          
    position:0,
    canClick(){return player[this.layer].unlocked()},
    canReset(){return hasChallenge('w',15)&&player.w.points.gte(player.d.requires)},
    gainMult() {               
        mult= new Decimal(1)
        if(hasUpgrade('d',22)) mult=mult.times(upgradeEffect('d',22))
        if(hasUpgrade('d',23)) mult=mult.times(upgradeEffect('d',23))
        if(hasUpgrade('dc',33)) mult=mult.times(upgradeEffect('dc',33))
        if(hasUpgrade('dc',41)) mult=mult.times(buyableEffect('w',11))
        if(hasUpgrade('sw',11)) mult=mult.times(upgradeEffect('sw',11))
        return mult                
    },
    gainExp() { 
        exp= new Decimal(1)                            
        if(hasUpgrade('d',13)) exp=exp.times(1.01)
        return exp
    },
    upgrades:{
        11:{
            name:"dwu1",
            title:"这是真的吗",
            description:"每秒获得重置可获得的膨胀墙的%10",
            unlocked(){return hasMilestone('d',7)},
            cost:new Decimal(100)
        },
        12:{
            name:"dwu2",
            title:"别太膨胀",
            description:"给予拜谢效果基于膨胀墙的加成",
            unlocked(){return hasMilestone('d',7)&&hasUpgrade('d',11)},
            effect(){return player.d.points.add(1).log(10).div(3).add(1)},
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            cost:new Decimal(5000)
        },
        13:{
            name:"dwu3",
            title:"其实这是占位用的",
            description:"膨胀墙获取^1.01",
            unlocked(){return hasMilestone('d',7)&&hasUpgrade('d',12)},
            cost:new Decimal(1e4)
        },
        21:{
            name:"dwu4",
            title:"时间也该膨胀了",
            description:"基于膨胀墙加成时间获取",
            effect(){return player.d.points.add(1).log(10).add(1)},
            unlocked(){return hasMilestone('d',7)&&hasUpgrade('d',13)},
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            cost:new Decimal(5e4)
        },
        22:{
            name:"dwu5",
            title:"二重膨胀墙",
            description:"基于膨胀墙加成膨胀墙获取",
            effect(){return player.d.points.add(1).log(100).add(1)},
            unlocked(){return hasMilestone('d',7)&&hasUpgrade('d',21)},
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            cost:new Decimal(1e5)
        },
        23:{
            name:"dwu6",
            title:"还有新内容吗?",
            description:"基于时间加成膨胀墙获取",
            effect(){return player.points.add(1).log(100).div(3).add(1)},
            unlocked(){return hasMilestone('d',7)&&hasUpgrade('d',22)},
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            cost:new Decimal(5e5)
        },
    },
    milestones:{
        0:{
            requirementDescription: "1 膨胀墙",
            effectDescription: "这个层级永久解锁",
            done() { return player.d.points.gte(1) }
        },
        1:{
            requirementDescription: "2 膨胀墙",
            effectDescription(){
                return hasUpgrade('dc',43)?"时间获取速度*"+format(new Decimal(100).pow(upgradeEffect('dc',43))):"时间获取速度*"+format(new Decimal(100))
            },
            done() { return player.d.points.gte(2) }
        },
        2:{
            requirementDescription: "3 膨胀墙",
            effectDescription(){return "基于膨胀墙加成墙获取<br>Currently:x"+format(player.d.points.times(2).add(1))},
            done() { return player.d.points.gte(3) }
        },
        3:{
            requirementDescription: "5 膨胀墙",
            effectDescription: "wu1效果 1% -> 100%",
            done() { return player.d.points.gte(5) }
        },
        4:{
            requirementDescription: "500 膨胀墙",
            effectDescription: "自动购买拜谢<br>拜谢效果现在也可以加成墙获取",
            done() { return player.d.points.gte(500) }
        },
        5:{
            requirementDescription: "600 膨胀墙",
            effectDescription: "自动购买升级",
            done() { return player.d.points.gte(600) }
        },
        6:{
            requirementDescription: "700 膨胀墙",
            effectDescription: "膨胀墙重置时保留挑战完成",
            done() { return player.d.points.gte(700) }
        },
        7:{
            requirementDescription: "1000 膨胀墙",
            effectDescription: "解锁膨胀墙升级",
            done() { return player.d.points.gte(1000) }
        },
        8:{
            requirementDescription: "1e8 膨胀墙",
            effectDescription: "解锁点击墙层级",
            done() { return player.d.points.gte(1e8) }
        },
    },
    layerShown() { return hasChallenge('w',15)||hasMilestone('d',0)||player.sw.unlocked()},
    passiveGeneration(){
        hello=0
        if(hasUpgrade('d',11)) hello=0.1
        return hello
    },
    tabFormat: {
        "milestone":{
            content:[
                "main-display",
                "prestige-button",
                "resource-display",
                "milestones"
            ]   
        },
        "upgrade":{
            content:[
                "main-display",
                "prestige-button",
                "resource-display",
                "upgrades"
            ]   
        },
    },
    autoUpgrade(){return hasUpgrade('sw',32)},
    doReset(resettingLayer){
        let kept=[]
        let upgrade=[11]
        if(tmp[resettingLayer].row>tmp.d.row)
        {
            if(hasUpgrade('sw',22)&&resettingLayer=='sw') kept.push("milestones")
            layerDataReset('d',kept)
            if(hasUpgrade('sw',22)&&resettingLayer=='sw') player.d.upgrades=upgrade
        }
    },
})
addLayer("c", {
    startData() { return {
        unlocked(){return hasMilestone('d',8)},
        points: new Decimal(0),
        clk: new Decimal(0),
        clkmult: new Decimal(1),
        per: new Decimal(0)
    }},
    name:"click wall",          
    symbol:"CW",     
    color: "#FF9954",
    resource: "点击墙",
    branches:["w","d"],
    row: 1,
    position: 1,
    baseResource: "点击",
    baseAmount() { return player.c.clk },
    requires: new Decimal(10),
    type: "normal",
    exponent: 0.5,
    canClick(){return player[this.layer].unlocked()},
    gainMult() {         
        mult=new Decimal(1)  
        if(hasUpgrade('c',15)) mult=mult.times(5)           
        if(hasUpgrade('c',31)) mult=mult.times(upgradeEffect('c',31))   
        if(hasUpgrade('c',32)) mult=mult.times(upgradeEffect('c',32)) 
        if(hasUpgrade('dc',35)) mult=mult.times(upgradeEffect('dc',35)) 
        if(hasUpgrade('dc',41)) mult=mult.times(buyableEffect('w',11))
        if(hasUpgrade('sw',11)) mult=mult.times(upgradeEffect('sw',11))
        return mult             
    },
    gainExp() {
        exp=new Decimal(1)                   
        return exp        
    },
    clickMult(){
        mult=new Decimal(1)                     
        if(hasUpgrade('c',11)) mult=mult.times(2)
        if(hasUpgrade('c',12)) mult=mult.times(3)
        if(hasUpgrade('c',13)) mult=mult.times(4)
        if(hasUpgrade('c',14)) mult=mult.times(5)
        if(hasUpgrade('c',21)) mult=mult.times(upgradeEffect('c',21))
        if(hasUpgrade('c',22)) mult=mult.times(upgradeEffect('c',22))
        if(hasUpgrade('c',24)) mult=mult.times(upgradeEffect('c',24))
        if(hasUpgrade('dc',34)) mult=mult.times(upgradeEffect('dc',34))
        if(hasUpgrade('dc',41)) mult=mult.times(buyableEffect('w',11))
        if(hasUpgrade('sw',11)) mult=mult.times(upgradeEffect('sw',11))
        player.c.clkmult=mult
    },
    perc()
    {
        p=new Decimal(0)
        if(hasUpgrade('c',33)) p=new Decimal(0.01)
        if(hasUpgrade('c',34)) p=new Decimal(0.1)
        if(hasUpgrade('c',35)) p=new Decimal(1)
        player.c.per=p
    },
    layerShown() { return hasMilestone('d',8)||player.sw.unlocked()},
    upgrades: {
        11: {
            title:"点击挑战！",
            description: "获得的点击*2",
            unlocked(){return true},
            cost: new Decimal(10),
            currencyDisplayName:"点击",
            currencyInternalName:"clk",
            currencyLayer:"c",
        },
        12: {
            title:"点击挑战2！",
            description: "获得的点击*3",
            unlocked(){return hasUpgrade('c',11)},
            cost: new Decimal(50),
            currencyDisplayName:"点击",
            currencyInternalName:"clk",
            currencyLayer:"c",
        },
        13: {
            title:"点击挑战3！",
            description: "获得的点击*4",
            unlocked(){return hasUpgrade('c',12)},
            cost: new Decimal(300),
            currencyDisplayName:"点击",
            currencyInternalName:"clk",
            currencyLayer:"c",
        },
        14: {
            title:"点击挑战4！",
            description: "获得的点击*5",
            unlocked(){return hasUpgrade('c',13)},
            cost: new Decimal(1000),
            currencyDisplayName:"点击",
            currencyInternalName:"clk",
            currencyLayer:"c",
        },
        15: {
            title:"点击墙有何用？",
            description: "获得的点击墙*5",
            unlocked(){return hasUpgrade('c',14)},
            cost: new Decimal(1e4),
            currencyDisplayName:"点击",
            currencyInternalName:"clk",
            currencyLayer:"c",
        },
        21: {
            title:"用时间来点击",
            description: "时间加成点击获取",
            unlocked(){return hasUpgrade('c',15)},
            effect(){return player.points.add(1).log(10).div(2).add(1)},
            effectDisplay(){return format(upgradeEffect(this.layer,this.id))+"x"},
            cost: new Decimal(1e3),
        },
        22: {
            title:"点击这个墙",
            description: "点击墙加成点击获取",
            unlocked(){return hasUpgrade('c',21)},
            effect(){return player.c.points.add(1).pow(0.2)},
            effectDisplay(){return format(upgradeEffect(this.layer,this.id))+"x"},
            cost: new Decimal(2e3),
        },
        23: {
            title:"维持墙",
            description: "进行点击墙重置不再会重置墙层级",
            unlocked(){return hasUpgrade('c',22)},
            cost: new Decimal(5e3),
        },
        24: {
            title:"点击那个膨胀墙",
            description: "膨胀墙加成点击获取",
            unlocked(){return hasUpgrade('c',23)},
            effect(){return player.d.points.add(1).log(2).add(1)},
            effectDisplay(){return format(upgradeEffect(this.layer,this.id))+"x"},
            cost: new Decimal(1e4),
        },
        25: {
            title:"自动化？",
            description: "每游戏帧自动点击获得点击的可点击",
            unlocked(){return hasUpgrade('c',24)},
            cost: new Decimal(3e4),
        },
        31: {
            title:"更墙的点击墙",
            description: "根据墙加成点击墙获取",
            unlocked(){return hasUpgrade('c',25)},
            effect(){return player.w.points.add(1).log(10).add(1)},
            effectDisplay(){return format(upgradeEffect(this.layer,this.id))+"x"},
            cost: new Decimal(1e5),
        },
        32: {
            title:"双重点击墙",
            description: "根据点击墙加成点击墙获取",
            unlocked(){return hasUpgrade('c',31)},
            effect(){return player.c.points.add(1).log(3).add(1)},
            effectDisplay(){return format(upgradeEffect(this.layer,this.id))+"x"},
            cost: new Decimal(5e6),
        },
        33: {
            title:"新的可点击！",
            description: "解锁一个新可点击",
            unlocked(){return hasUpgrade('c',32)||hasUpgrade('sw',23)},
            cost: new Decimal(6e7),
        },
        34: {
            title:"更强的新可点击",
            description: "加强新的可点击",
            unlocked(){return hasUpgrade('c',33)||hasUpgrade('sw',23)},
            cost: new Decimal(1e8),
        },
        35: {
            title:"特强的新可点击",
            description: "再次加强新的可点击",
            unlocked(){return hasUpgrade('c',34)||hasUpgrade('sw',23)},
            cost: new Decimal(1e9),
        },
        41: {
            title:"超级膨胀",
            description: "解锁膨点墙层级",
            unlocked(){return hasUpgrade('c',35)},
            cost: new Decimal(1e10),
        },
    },
    clickables: {
        11: {
            title:"点我试试",
            display(){return this.canClick()?"获得"+format(player.c.clkmult)+"个点击":"完成膨胀里程碑以解锁"},
            canClick(){return hasMilestone('d',8)||hasUpgrade('sw',23)},
            onClick(){
                player.c.clk=player.c.clk.add(player.c.clkmult)
            },
            onHold(){
                player.c.clk=player.c.clk.add(player.c.clkmult.times(0.2))
            }
        },
        12: {
            title:"点我试试",
            display(){
                return "获得当前重置可获得的点击墙的"+player.c.per.times(100)+"%("+format(getResetGain('c',useType="normal").times(player.c.per))+")"
            },
            canClick(){return true},
            unlocked(){return hasUpgrade('c',33)},
            onClick(){
                player.c.points=player.c.points.add(getResetGain('c',useType="normal").times(player.c.per))
            },
            onHold(){
                player.c.points=player.c.points.add(getResetGain('c',useType="normal").times(player.c.per).times(0.2))
            }
        }
    },
    update(diff)
    {
        if(hasUpgrade('c',25)) clickClickable('c',11)
        if(hasUpgrade('dc',11)) clickClickable('c',12)
    },
    tabFormat: {
        "click":{
            content:[
                "main-display",
                "prestige-button",
                "resource-display",
                "clickables",
                "upgrades"
            ]   
        },
    },
    autoUpgrade(){return hasUpgrade('sw',33)},
    doReset(resettingLayer){
        let kept=["upgrades"]
        let upgrade=[25,33,34,35]
        if(resettingLayer=='c') kept.push("points")
        layerDataReset('c',kept)
        if(hasUpgrade('sw',23)&&resettingLayer=='sw') player.c.upgrades=upgrade
    },
})
addLayer("dc", {
    startData() { return {
        unlocked(){return hasUpgrade('c',41)},
        points: new Decimal(0),
        dcmult: new Decimal(1),
        auto(){return hasUpgrade('dc',42)}
    }},
    symbol:"DCW",
    color: "#98B695",
    resource: "膨点墙",
    row: 1,
    position: 2,

    branches:["c","w","d"],
    baseResource: "点击墙",
    baseAmount() { return player.c.points },  
    requires: new Decimal(10),              
    type: "none",
    canClick(){return !player[this.layer].unlocked()},
    gainMult() {
        mult=new Decimal(1)
        if(hasUpgrade('dc',26)) mult=mult.times(upgradeEffect('dc',26))
        if(hasUpgrade('dc',41)) mult=mult.times(buyableEffect('w',11))
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    layerShown() { return hasUpgrade('c',41)||player.sw.unlocked()},
    dclkMult()
    {
        mult=new Decimal(1)
        if(hasUpgrade('dc',21)) mult=mult.times(upgradeEffect('dc',21))
        if(hasUpgrade('dc',22)) mult=mult.times(upgradeEffect('dc',22))
        if(hasUpgrade('dc',23)) mult=mult.times(upgradeEffect('dc',23))
        if(hasUpgrade('dc',24)) mult=mult.times(upgradeEffect('dc',24))
        if(hasUpgrade('dc',25)) mult=mult.times(upgradeEffect('dc',25))
        if(hasUpgrade('dc',26)) mult=mult.times(upgradeEffect('dc',26))
        if(hasUpgrade('dc',41)) mult=mult.times(buyableEffect('w',11))
        if(hasUpgrade('sw',11)) mult=mult.times(upgradeEffect('sw',11))
        player.dc.dcmult=mult
    },
    upgrades:{
        11:{
            title:"自动化2",
            description:"每游戏帧自动点击获取点击墙的可点击",
            unlocked(){return true},
            cost:new Decimal(1000),
        },
        21:{
            title:"一切加成1",
            description:"根据时间加成膨点墙获取",
            unlocked(){return hasUpgrade('dc',11)},
            effect(){return player.points.add(1).log(10).add(1)},
            effectDisplay(){return format(upgradeEffect(this.layer,this.id))+"x"},
            cost:new Decimal(5000),
        },
        22:{
            title:"一切加成2",
            description:"根据墙加成膨点墙获取",
            unlocked(){return hasUpgrade('dc',11)},
            effect(){return player.w.points.add(1).log(10).add(1)},
            effectDisplay(){return format(upgradeEffect(this.layer,this.id))+"x"},
            cost:new Decimal(5000),
        },
        23:{
            title:"一切加成3",
            description:"根据膨胀墙加成膨点墙获取",
            unlocked(){return hasUpgrade('dc',11)},
            effect(){return player.d.points.add(1).log(10).add(1)},
            effectDisplay(){return format(upgradeEffect(this.layer,this.id))+"x"},
            cost:new Decimal(5000),
        },
        24:{
            title:"一切加成4",
            description:"根据点击加成膨点墙获取",
            unlocked(){return hasUpgrade('dc',11)},
            effect(){return player.c.clk.add(1).log(10).add(1)},
            effectDisplay(){return format(upgradeEffect(this.layer,this.id))+"x"},
            cost:new Decimal(5000),
        },
        25:{
            title:"一切加成5",
            description:"根据点击墙加成膨点墙获取",
            unlocked(){return hasUpgrade('dc',11)},
            effect(){return player.c.points.add(1).log(10).add(1)},
            effectDisplay(){return format(upgradeEffect(this.layer,this.id))+"x"},
            cost:new Decimal(5000),
        },
        26:{
            title:"一切加成6",
            description:"根据膨点墙加成膨点墙获取",
            unlocked(){return hasUpgrade('dc',11)},
            effect(){return player.dc.points.add(1).log(10).add(1)},
            effectDisplay(){return format(upgradeEffect(this.layer,this.id))+"x"},
            cost:new Decimal(5000),
        },
        31:{
            title:"新一切加成1",
            description:"根据膨点墙加成时间获取",
            unlocked(){return hasUpgrade('dc',26)},
            effect(){return player.dc.points.pow(0.3).times(3).add(1)},
            effectDisplay(){return format(upgradeEffect(this.layer,this.id))+"x"},
            cost:new Decimal(1e8),
        },
        32:{
            title:"新一切加成2",
            description:"根据膨点墙加成墙获取",
            unlocked(){return hasUpgrade('dc',26)},
            effect(){return player.dc.points.pow(0.3).times(3).add(1)},
            effectDisplay(){return format(upgradeEffect(this.layer,this.id))+"x"},
            cost:new Decimal(1e8),
        },
        33:{
            title:"新一切加成3",
            description:"根据膨点墙加成膨胀墙获取",
            unlocked(){return hasUpgrade('dc',26)},
            effect(){return player.dc.points.pow(0.3).times(3).add(1)},
            effectDisplay(){return format(upgradeEffect(this.layer,this.id))+"x"},
            cost:new Decimal(1e8),
        },
        34:{
            title:"新一切加成4",
            description:"根据膨点墙加成点击获取",
            unlocked(){return hasUpgrade('dc',26)},
            effect(){return player.dc.points.pow(0.3).times(3).add(1)},
            effectDisplay(){return format(upgradeEffect(this.layer,this.id))+"x"},
            cost:new Decimal(1e8),
        },
        35:{
            title:"新一切加成5",
            description:"根据膨点墙加成点击墙获取",
            unlocked(){return hasUpgrade('dc',26)},
            effect(){return player.dc.points.pow(0.3).times(3).add(1)},
            effectDisplay(){return format(upgradeEffect(this.layer,this.id))+"x"},
            cost:new Decimal(1e8),
        },
        41:{
            title:"拜谢！",
            description:"拜谢加成任何点数获取",
            unlocked(){return hasUpgrade('dc',35)},
            cost:new Decimal(1e11),
        },
        42:{
            title:"自动化3！？",
            description:"解锁一个自动化开关",
            unlocked(){return hasUpgrade('dc',41)},
            cost:new Decimal(5e18),
        },
        43:{
            title:"快点，快点，再快点",
            description:"根据膨点墙加成膨胀墙里程碑2的效果",
            unlocked(){return hasUpgrade('dc',42)},
            effect(){return player.dc.points.add(1).log(10).times(3).add(1)},
            effectDisplay(){return "^"+format(upgradeEffect(this.layer,this.id))},
            cost:new Decimal(1e20),
        },
        44:{
            title:"天堂制造",
            description:"将游戏速度基于膨胀墙加速",
            unlocked(){return hasUpgrade('dc',43)},
            effect(){return player.dc.points.pow(0.2).add(1)},
            effectDisplay(){return format(upgradeEffect(this.layer,this.id))+"x"},
            cost:new Decimal(1e23),
        },
        45:{
            title:"哇",
            description:"获得膨胀墙不再需要失去点击墙",
            unlocked(){return hasUpgrade('dc',44)},
            cost:new Decimal(1e23),
        },
        51: {
            title:"超级无敌炫酷墙",
            description: "解锁超级墙",
            unlocked(){return hasUpgrade('dc',45)},
            cost: new Decimal(1e100),
            currencyDisplayName:"时间",
            currencyInternalName:"points",
        },
    },
    clickables: {
        11: {
            title:"点我试试",
            display(){
                if(!hasUpgrade('dc',45)) return this.canClick()?"失去点击墙的%10，获得"+format(player.c.points.add(1).log(10).times(player.dc.dcmult))+"膨点墙":"购买最后一个点击墙升级以解锁"
                return "获得"+format(player.c.points.add(1).log(10).times(player.dc.dcmult))+"膨点墙"
            },
            canClick(){return hasUpgrade('c',41)||hasUpgrade('sw',24)},
            onClick(){
                player.dc.points=player.dc.points.add(player.c.points.add(1).log(10).times(player.dc.dcmult))
                if(!hasUpgrade('dc',45)) player.c.points=player.c.points.times(0.9)
            },
            onHold(){
                player.dc.points=player.dc.points.add(player.c.points.add(1).log(10).times(player.dc.dcmult).times(0.2))
                if(!hasUpgrade('dc',45)) player.c.points=player.c.points.times(0.98)
            },
        },
        12: {
			title: "自动开关",
			display(){
				return hasUpgrade('dc', 42)?(player.dc.auto?"开":"关"):"禁用"
			},
			unlocked() { return hasUpgrade('dc',42) },
			canClick() { return hasUpgrade('dc',42) },
			onClick() { player.dc.auto = !player.dc.auto },
			style: {"background-color"() { return player.dc.auto?"#98B695":"#666666" }},
		},
    },
    update(diff)
    {
        if(player.dc.auto&&hasUpgrade('dc',42)) clickClickable('dc',11)
    },
    tabFormat: {
        "click":{
            content:[
                "main-display",
                "resource-display",
                "clickables",
                "upgrades"
            ]   
        },
    },
    autoUpgrade(){return hasUpgrade('sw',34)},
    doReset(resettingLayer){
        let kept=[]
        let upgrade=[11,42]
        if(tmp[resettingLayer].row>tmp.d.row)
        {
            layerDataReset('dc',kept)
            if(hasUpgrade('sw',24)&&resettingLayer=='sw') player.dc.upgrades=upgrade
        }
    },
})
addLayer('sw',{
    startData(){ return{
            unlocked(){return hasUpgrade('dc',51)||player.sw.points.gte(1)},
            points: new Decimal(0),
            resetTimes: new Decimal(0),
            pt:new Decimal(0)
        }
    },
    color: "#1D63B2",
    resource:"超级墙",
    row:2,
    symbol:"SW",
    position:0,
    baseResource:"膨点墙",
    baseAmount(){return player.dc.points},
    branches:['c','d','dc'],
    requires:new Decimal(1e24),
    type:"normal",
    exponent:0.5,
    gainMult(){
        mult=new Decimal(1)
        if(hasUpgrade('sw',11)) mult=mult.times(upgradeEffect('sw',11))
        return mult
    },
    gainExp(){
        exp=new Decimal(1)
        return exp
    },
    onPrestige(){
        player.sw.resetTimes=player.sw.resetTimes.add(1)
        player.sw.pt=player.sw.pt.add(1)
    },
    nodeStyle: {
        background: "linear-gradient(90deg,#FF7D00, #FFFF00,#00FF00, #00FFFF,#0000FF,#FF00FF)",
        "background-origin": "border-box",
    },
    upgrades:{
        11:{
            title:"超级开始",
            description:"基于超级墙加成所有点数获取",
            unlocked(){return true},
            effect(){return player.sw.points.add(1).pow(0.5).add(2)},
            effectDisplay(){return format(upgradeEffect(this.layer,this.id))+"x"},
            cost:new Decimal(1),
            currencyDisplayName:"超级点数",
            currencyInternalName:"pt",
            currencyLayer:"sw",
        },
        21:{
            title:"修复墙",
            description:"超级墙层级重置时不会重置墙挑战",
            unlocked(){return hasUpgrade('sw',11)},
            cost:new Decimal(1),
            currencyDisplayName:"超级点数",
            currencyInternalName:"pt",
            currencyLayer:"sw",
            branches:[11]
        },
        22:{
            title:"修复膨胀墙",
            description:"超级墙层级重置时不会重置膨胀墙里程碑",
            unlocked(){return hasUpgrade('sw',11)},
            cost:new Decimal(1),
            currencyDisplayName:"超级点数",
            currencyInternalName:"pt",
            currencyLayer:"sw",
            branches:[11]
        },
        23:{
            title:"修复点击墙",
            description:"超级墙层级重置时不会重置可点击与自动点击",
            unlocked(){return hasUpgrade('sw',11)},
            cost:new Decimal(1),
            currencyDisplayName:"超级点数",
            currencyInternalName:"pt",
            currencyLayer:"sw",
            branches:[11]
        },
        24:{
            title:"修复膨点墙",
            description:"超级墙层级重置时不会重置膨点墙可点击与自动点击",
            unlocked(){return hasUpgrade('sw',11)},
            cost:new Decimal(1),
            currencyDisplayName:"超级点数",
            currencyInternalName:"pt",
            currencyLayer:"sw",
            branches:[11]
        },
        31:{
            title:"自动墙",
            description:"自动购买墙升级",
            unlocked(){return hasUpgrade('sw',21)},
            cost:new Decimal(1),
            currencyDisplayName:"超级点数",
            currencyInternalName:"pt",
            currencyLayer:"sw",
            branches:[21]
        },
        32:{
            title:"自动膨胀墙",
            description:"自动购买膨胀墙升级",
            unlocked(){return hasUpgrade('sw',22)},
            cost:new Decimal(1),
            currencyDisplayName:"超级点数",
            currencyInternalName:"pt",
            currencyLayer:"sw",
            branches:[22]
        },
        33:{
            title:"自动点击墙",
            description:"自动购买点击墙升级",
            unlocked(){return hasUpgrade('sw',23)},
            cost:new Decimal(1),
            currencyDisplayName:"超级点数",
            currencyInternalName:"pt",
            currencyLayer:"sw",
            branches:[23]
        },
        34:{
            title:"自动膨点墙",
            description:"自动购买膨点墙升级",
            unlocked(){return hasUpgrade('sw',24)},
            cost:new Decimal(1),
            currencyDisplayName:"超级点数",
            currencyInternalName:"pt",
            currencyLayer:"sw",
            branches:[24]
        },
        41:{
            title:"迎接终局",
            description:"自动超级墙重置",
            unlocked(){return hasUpgrade('sw',31)&&hasUpgrade('sw',32)&&hasUpgrade('sw',33)&&hasUpgrade('sw',34)},
            cost:new Decimal(1),
            currencyDisplayName:"超级点数",
            currencyInternalName:"pt",
            currencyLayer:"sw",
            branches:[31,32,33,34]
        },
        51:{
            title:"终局",
            description:"终局",
            unlocked(){return player.devSpeed==0},
            cost:new Decimal(0),
            currencyDisplayName:"时间",
            currencyInternalName:"points",
            branches:[41]
        },
    },
    autoPrestige(){return hasUpgrade('sw',41)},
    layerShown(){return hasUpgrade('dc',51)||player.sw.unlocked()},
    tabFormat: {
        "upgrades-tree":{
            content:[
                "main-display",
                "resource-display",
                ["display-text",
                  function() {
                      return "你超级了"+format(player.sw.resetTimes)+"次,"+"使游戏速度*"+format(new Decimal(1).sub(player.sw.resetTimes.div(100)))
                   },
                { "color": "#FFFFFF", "font-size": "20px"}],
                ["display-text",
                  function() {
                      return "你有"+format(player.sw.pt)+"超级点数"
                   },
                { "color": "#FFFFFF", "font-size": "20px"}],
                "prestige-button",
                ['row',[['upgrade',11]]],"blank",
                ['row',[['upgrade',21],['upgrade',22],['upgrade',23],['upgrade',24]]],"blank",
                ['row',[['upgrade',31],['upgrade',32],['upgrade',33],['upgrade',34]]],"blank",
                ['row',[['upgrade',41]]],"blank",
                ['row',[['upgrade',51]]],"blank",
            ]   
        },
    },
})