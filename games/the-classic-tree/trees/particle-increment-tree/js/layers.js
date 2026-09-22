addLayer("q", {
    name: "quark",
    symbol: "Q",
    position: 0,
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        antiquarks: new Decimal(0)
    }},
    color: "#cc66ff",
    requires: new Decimal(10),
    resource: "夸克",
    baseResource: "能量",
    baseAmount() {return player.points},
    type: "normal",
    gainMult() {
        let mult = new Decimal(1)
        if(hasUpgrade("q",15))
            mult = mult.mul(upgradeEffect("q",15))
        if(hasUpgrade("q",32))
            mult = mult.mul(upgradeEffect("q",32))
        if(hasUpgrade("q",36))
            mult = mult.mul(buyableEffect("q",11))
        return mult
    },
    gainExp() {
        let exp = new Decimal(1)
        if(hasUpgrade("q",13)){
            exp = new Decimal(1).div(2.4)
        }else{
            exp = new Decimal(1).div(3)
        }
        return exp
    },
    row: 0,
    resetDescription:" 进行一次夸克凝聚并获得",
    passiveGeneration(){
        if(hasUpgrade("q",44)){
            return new Decimal(1)
        }else if(hasUpgrade("q",43)){
            return new Decimal(0.1)
        }else if(hasUpgrade("q",42)){
            return new Decimal(0.01)
        }else{
            return new Decimal(0)
        }
    },
    hotkeys: [
        {key: "q", description: "Q: 进行夸克凝聚", onPress(){if (canReset(this.layer)) doReset(this.layer)}}
    ],
    layerShown(){return true},
    getResetGain(){
        return player.points.mul(0.1).pow(this.gainExp()).mul(this.gainMult()).floor()
    },
    getNextAt(){
        return this.getResetGain().add(1).div(this.gainMult()).pow(new Decimal(1).div(this.gainExp())).mul(10)
    },
    tabFormat: {
        "夸克": {
            content:[
                ["display-text",
                    function() { return "你有 <h2 style='color:#cc66ff;font-size:30px;font-family:Comic Sans MS'>" + format(player.q.points) + "</h2> 夸克" },
                    { "color": "white", "font-size": "24px", "font-family": "Comic Sans MS" }
                ],
                ["display-text",
                    function() { 
                        if(hasUpgrade("q",44)){
                            return "你每秒获得 <h2 style='color:#cc66ff;font-size:20px;font-family:Comic Sans MS'>" + format(getResetGain("q")) + "</h2> 夸克" 
                        }else if(hasUpgrade("q",43)){
                            return "你每秒获得 <h2 style='color:#cc66ff;font-size:20px;font-family:Comic Sans MS'>" + format(getResetGain("q").mul(0.1)) + "</h2> 夸克" 
                        }else if(hasUpgrade("q",42)){
                            return "你每秒获得 <h2 style='color:#cc66ff;font-size:20px;font-family:Comic Sans MS'>" + format(getResetGain("q").mul(0.01)) + "</h2> 夸克" 
                        }else{
                            return " "
                        }
                    },
                    { "color": "white", "font-size": "16px", "font-family": "Comic Sans MS" }
                ],
                "blank",
                "prestige-button",
                "blank",
                ["display-text",
                    function() { return "你有 <h2 style='color:#ffff00;font-size:20px;font-family:Comic Sans MS'>" + format(player.points) + "</h2> 能量" },
                    { "color": "white", "font-size": "20px", "font-family": "Comic Sans MS" }
                ],
                "blank",
                ["row",[["upgrades",[1]]]],
                ["row",[["upgrades",[3]]]]
            ]
        },
        "反夸克": {
            content:[
                ["display-text",
                    function() { return "你有 <h2 style='color:#cc66ff;font-size:30px;font-family:Comic Sans MS'>" + format(player.q.points) + "</h2> 夸克" },
                    { "color": "white", "font-size": "24px", "font-family": "Comic Sans MS" }
                ],
                "blank",
                ["display-text",
                    function() { return "你有 <h2 style='color:#44aa00;font-size:25px;font-family:Comic Sans MS'>" + format(player.q.antiquarks) + "</h2> 反夸克" },
                    { "color": "white", "font-size": "20px", "font-family": "Comic Sans MS" }
                ],
                ["display-text",
                    function() { 
                        if(hasUpgrade("q",45)){
                            return "你每秒获得 <h2 style='color:#44aa00;font-size:20px;font-family:Comic Sans MS'>" + format(aqRealGainCal().add(aqGainCal())) + "</h2> 反夸克" 
                        }else if(hasUpgrade("q",26)){
                            return "你每秒获得 <h2 style='color:#44aa00;font-size:20px;font-family:Comic Sans MS'>" + format(aqRealGainCal().add(aqGainCal().div(10))) + "</h2> 反夸克" 
                        }else{
                            return "你每秒获得 <h2 style='color:#44aa00;font-size:20px;font-family:Comic Sans MS'>" + format(aqRealGainCal()) + "</h2> 反夸克" 
                        }
                    },
                    { "color": "white", "font-size": "16px", "font-family": "Comic Sans MS" }
                ],
                ["display-text",
                    function() { return "你每秒消耗 <h2 style='color:#ffff00;font-size:20px;font-family:Comic Sans MS'>" + format(aqRealGainCal().mul(aqConsumeCal())) + "</h2> 能量以凝聚反夸克" },
                    { "color": "white", "font-size": "16px", "font-family": "Comic Sans MS" }
                ],
                ["display-text",
                    function() { return "每生产一个反夸克,需要 <h2 style='color:#ffff00;font-size:20px;font-family:Comic Sans MS'>" + format(aqConsumeCal()) + "</h2> 能量" },
                    { "color": "white", "font-size": "16px", "font-family": "Comic Sans MS" }
                ],
                "blank",
                ["display-text",
                    function() { 
                        if(hasUpgrade("q",35)){
                            return "<h2 style='color:#ffff88;font-size:16px;font-family:Comic Sans MS'>你的反夸克数量无法超过夸克数量!</h2>"
                        }else{
                            return "<h2 style='color:#ff8888;font-size:16px;font-family:Comic Sans MS'>当你的反夸克数量超过夸克的时候，反夸克将会湮灭(归零)!</h2>"
                        }
                    },
                    { "color": "white", "font-size": "16px", "font-family": "Comic Sans MS" }
                ],
                "blank",
                ["row",[["clickable",11]]],
                "blank",
                ["row",[["upgrades",[2]]]],
                ["row",[["upgrades",[4]]]]
            ],
            unlocked(){return hasUpgrade("q",16)}
        },
        "色荷":{
            content:[
                ["display-text",
                    function() { return "你有 <h2 style='color:#cc66ff;font-size:30px;font-family:Comic Sans MS'>" + format(player.q.points) + "</h2> 夸克" },
                    { "color": "white", "font-size": "24px", "font-family": "Comic Sans MS" }
                ],
                ["display-text",
                    function() { return "你有 <h2 style='color:#44aa00;font-size:25px;font-family:Comic Sans MS'>" + format(player.q.antiquarks) + "</h2> 反夸克" },
                    { "color": "white", "font-size": "20px", "font-family": "Comic Sans MS" }
                ],
                ["display-text",
                    function() { return "你有 <h2 style='color:#ffff00;font-size:25px;font-family:Comic Sans MS'>" + format(player.points) + "</h2> 能量" },
                    { "color": "white", "font-size": "20px", "font-family": "Comic Sans MS" }
                ],
                "blank",
                ["row",[["buyables",[1]]]],
            ],
            unlocked(){return hasUpgrade("q",36)}
        },
        "Dev":{
            content:[
                ["row",[["clickable",114514]]]
            ]
        }
    },
    upgrades:{
        11:{
            title:"上夸克",
            description:"能量获取速度×2",
            cost:new Decimal(3),
            effectDisplay(){return "×2"},
            unlocked(){return player.q.unlocked},
        },
        12:{
            title:"下夸克",
            description:"能量获取速度基于夸克数量加成",
            cost:new Decimal(5),
            effect(){
                let exp = new Decimal(1).div(2)
                if(hasUpgrade("q",14)){
                    exp = new Decimal(3).div(4)
                }
                effect = player.q.points.add(1).pow(exp)
                if(player.q.points>=250){
                    effect = new Decimal(251).pow(exp).mul(player.q.points.sub(250).log10())
                }
                return effect
            },
            effectDisplay(){
                if(player.q.points<250){
                    return "×"+format(this.effect())
                }
                else{
                    return "×"+format(this.effect())+"(已达软上限:250夸克)"
                }
            },
            unlocked(){return (hasUpgrade("q",11))},
        },
        13:{
            title:"奇夸克",
            description:"每下一个夸克获取的阈值更小",
            cost:new Decimal(20),
            effectDisplay(){return "^0.8"},
            unlocked(){return (hasUpgrade("q",12))},
        },
        14:{
            title:"粲夸克",
            description:"下夸克的效果更好",
            cost:new Decimal(40),
            effectDisplay(){return "1+x^0.5 -> 1+x^0.75"},
            unlocked(){return (hasUpgrade("q",13))},
        },
        15:{
            title:"顶夸克",
            description:"夸克获取基于夸克加成",
            cost:new Decimal(78),
            effect(){
                let effect = player.q.points.add(1).pow(new Decimal(1).div(4))
                if(player.q.points>=1000){
                    effect = new Decimal(1001).pow(new Decimal(1).div(4)).mul(player.q.points.sub(1000).log10())
                }
                return effect
            },
            effectDisplay(){
                if(player.q.points<1000){
                    return "×"+format(this.effect())
                }
                else{
                    return "×"+format(this.effect())+"(已达软上限:1000夸克)"
                }
            },
            unlocked(){return (hasUpgrade("q",14))},
        },
        16:{
            title:"底夸克",
            description:"解锁反夸克",
            cost:new Decimal(222),
            unlocked(){return (hasUpgrade("q",15))},
        },
        21:{
            title:"反上夸克",
            description:"反夸克生产速度×2",
            cost:new Decimal(10),
            currencyDisplayName:"反夸克",
            currencyInternalName:"antiquarks",
            currencyLayer:"q",
            effectDisplay(){return "×2"},
            unlocked(){return (hasUpgrade("q",16))},
        },
        22:{
            title:"反下夸克",
            description:"反夸克生产速度基于能量加成",
            cost:new Decimal(30),
            currencyDisplayName:"反夸克",
            currencyInternalName:"antiquarks",
            currencyLayer:"q",
            effect(){
                return player.points.add(1).pow(1/10)
            },
            effectDisplay(){return "×"+format(this.effect())},
            unlocked(){return (hasUpgrade("q",21))},
        },
        23:{
            title:"反奇夸克",
            description:"反夸克消耗能量除以10",
            cost:new Decimal(50),
            currencyDisplayName:"反夸克",
            currencyInternalName:"antiquarks",
            currencyLayer:"q",
            effectDisplay(){return "/10"},
            unlocked(){return (hasUpgrade("q",22))},
        },
        24:{
            title:"反粲夸克",
            description:"反夸克获取速度基于反夸克加成",
            cost:new Decimal(150),
            currencyDisplayName:"反夸克",
            currencyInternalName:"antiquarks",
            currencyLayer:"q",
            effect(){
                return player.q.antiquarks.add(10).log10()
            },
            effectDisplay(){return "×"+format(this.effect())},
            unlocked(){return (hasUpgrade("q",23))},
        },
        25:{
            title:"反顶夸克",
            description:"反夸克消耗能量基于反夸克降低",
            cost:new Decimal(300),
            currencyDisplayName:"反夸克",
            currencyInternalName:"antiquarks",
            currencyLayer:"q",
            effect(){
                return player.q.antiquarks.add(10).log10()
            },
            effectDisplay(){return "/"+format(this.effect())},
            unlocked(){return (hasUpgrade("q",24))},
        },
        26:{
            title:"反底夸克",
            description:"每秒以10%的速度无消耗自动获得反夸克，解锁新的夸克升级",
            cost:new Decimal(500),
            currencyDisplayName:"反夸克",
            currencyInternalName:"antiquarks",
            currencyLayer:"q",
            unlocked(){return (hasUpgrade("q",25))},
        },
        31:{
            title:"正对反加成",
            description:"夸克加成反夸克获取速度",
            cost:new Decimal(1111),
            effect(){
                return player.q.points.add(2).log10()
            },
            effectDisplay(){return "×"+format(this.effect())},
            unlocked(){return (hasUpgrade("q",26))},
        },
        32:{
            title:"反对正加成",
            description:"反夸克加成夸克获取速度",
            cost:new Decimal(2222),
            effect(){
                return player.q.antiquarks.add(10).log10().mul(2)
            },
            effectDisplay(){return "×"+format(this.effect())},
            unlocked(){return (hasUpgrade("q",31))},
        },
        33:{
            title:"反夸克能量",
            description:"反夸克加成能量获取速度",
            cost:new Decimal(10000),
            effect(){
                return player.q.antiquarks.add(10).log10().mul(1.5)
            },
            effectDisplay(){return "×"+format(this.effect())},
            unlocked(){return (hasUpgrade("q",32))},
        },
        34:{
            title:"差距加成",
            description:"反夸克和夸克数量的差值加成反夸克获取速度(仅当夸克数量大于反夸克时有效)",
            cost:new Decimal(50000),
            effect(){
                if(player.q.antiquarks.lt(player.q.points)){
                    return player.q.points.sub(player.q.antiquarks).add(10).log10().mul(2)
                }else{
                    return new Decimal(1)
                }
            },
            effectDisplay(){return "×"+format(this.effect())},
            unlocked(){return (hasUpgrade("q",33))},
        },
        35:{
            title:"避免湮灭",
            description:"反夸克数量超过夸克后不再湮灭，只是无法超过夸克数量",
            cost:new Decimal(80000),
            unlocked(){return (hasUpgrade("q",34))},
        },
        36:{
            title:"红蓝绿",
            description:"解锁色荷(三个购买项)和新的反夸克升级",
            cost:new Decimal(222222),
            unlocked(){return (hasUpgrade("q",35))},
        },
        41:{
            title:"高效能量",
            description:"降低反夸克消耗能量(小于一时效果正常)",
            cost:new Decimal(314159),
            effect(){
                return new Decimal(0.3)
            },
            effectDisplay(){return "^"+format(this.effect())},
            currencyDisplayName:"反夸克",
            currencyInternalName:"antiquarks",
            currencyLayer:"q",
            unlocked(){return (hasUpgrade("q",36))},
        },
        42:{
            title:"能量凝聚器MK1",
            description:"每秒自动获取重置时能获得的夸克的1%",
            cost:new Decimal(7777777),
            currencyDisplayName:"反夸克",
            currencyInternalName:"antiquarks",
            currencyLayer:"q",
            unlocked(){return (hasUpgrade("q",41))},
        },
        43:{
            title:"能量凝聚器MK2",
            description:"每秒自动获取重置时能获得的夸克的10%",
            cost:new Decimal(5e7),
            currencyDisplayName:"反夸克",
            currencyInternalName:"antiquarks",
            currencyLayer:"q",
            unlocked(){return (hasUpgrade("q",42))},
        },
        44:{
            title:"能量凝聚器MK3",
            description:"每秒自动获取重置时能获得的夸克的100%",
            cost:new Decimal(197280000),
            currencyDisplayName:"反夸克",
            currencyInternalName:"antiquarks",
            currencyLayer:"q",
            unlocked(){return (hasUpgrade("q",43))},
        },
        45:{
            title:"反能量凝聚器",
            description:"每秒自动获取重置时能获得的反夸克的100%(对反底夸克的加强)",
            cost:new Decimal(3e8),
            currencyDisplayName:"反夸克",
            currencyInternalName:"antiquarks",
            currencyLayer:"q",
            unlocked(){return (hasUpgrade("q",44))},
        },
        46:{
            title:"新的粒子",
            description:"解锁轻子",
            cost:new Decimal(1e10),
            currencyDisplayName:"反夸克",
            currencyInternalName:"antiquarks",
            currencyLayer:"q",
            unlocked(){return (hasUpgrade("q",45))},
        }
    },
    clickables:{
        11:{
            title:function(){
                if(getClickableState("q",11)==0){
                    return "开始凝聚反夸克"
                }else if(getClickableState("q",11)==1){
                    return "正在凝聚反夸克(点击以停止)"
                }
            },
            canClick(){return true},
            onClick(){
                if(getClickableState("q",11)==0){
                    setClickableState("q",11,1)
                }else if(getClickableState("q",11)==1){
                    setClickableState("q",11,0)
                }
            }
        },
        114514:{
            title:function(){
                if(getClickableState("q",114514)==0){
                    return "点击以暂停游戏"
                }else if(getClickableState("q",114514)==1){
                    return "游戏暂停中，点击以恢复"
                }
            },
            canClick(){return true},
            onClick(){
                if(getClickableState("q",114514)==0){
                    setClickableState("q",114514,1)
                    player.devSpeed = new Decimal(0)
                }else if(getClickableState("q",114514)==1){
                    setClickableState("q",114514,0)
                    player.devSpeed = new Decimal(1)
                }
            }
        }
    },
    buyables: {
        11: {
            title:"红色色荷",
            cost(x) { 
                if(x<=100){
                    return new Decimal(2).pow(x).mul(10000) 
                }else{
                    return new Decimal(2).pow(new Decimal(100).add(x.sub(10).pow(1.5))).mul(10000)
                }
            },
            effect(){ return new Decimal(1.5).pow(getBuyableAmount("q",11)) },
            display() {
                return "数量:"+format(getBuyableAmount("q",11))+
                "\n效果:夸克获取乘以"+format(this.effect())+"(1.5^x)"+
                "\n价格:"+format(this.cost(getBuyableAmount("q",11)))+"夸克(2^x)"
            },
            style(){
                return{"background-color":this.canAfford() ? "#ff0000" : "#663333"}
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            }
        },
        12: {
            title:"蓝色色荷",
            cost(x) { 
                if(x<=100){
                    return new Decimal(3).pow(x).mul(10000) 
                }else{
                    return new Decimal(3).pow(new Decimal(100).add(x.sub(10).pow(1.5))).mul(10000)
                }
            },
            effect(){ return new Decimal(2).pow(getBuyableAmount("q",12)) },
            display() {
                return "数量:"+format(getBuyableAmount("q",12))+
                "\n效果:能量获取乘以"+format(this.effect())+"(2^x)"+
                "\n价格:"+format(this.cost(getBuyableAmount("q",12)))+"能量(3^x)"
            },
            style(){
                return{"background-color":this.canAfford() ? "#0000ff" : "#333366"}
            },
            canAfford() { return player.points.gte(this.cost()) },
            buy() {
                player.points = player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            }
        },
        13: {
            title:"绿色色荷",
            cost(x) { 
                if(x<=100){
                    return new Decimal(5).pow(x).mul(10000) 
                }else{
                    return new Decimal(5).pow(new Decimal(100).add(x.sub(10).pow(1.5))).mul(10000)
                }
            },
            effect(){ return new Decimal(3.2).pow(getBuyableAmount("q",13)) },
            display() {
                return "数量:"+format(getBuyableAmount("q",13))+
                "\n效果:反夸克获取乘以"+format(this.effect())+"(3.2^x)"+
                "\n价格:"+format(this.cost(getBuyableAmount("q",13)))+"反夸克(5^x)"
            },
            style(){
                return{"background-color":this.canAfford() ? "#00ff00" : "#336633"}
            },
            canAfford() { return player[this.layer].antiquarks.gte(this.cost()) },
            buy() {
                player[this.layer].antiquarks = player[this.layer].antiquarks.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            }
        }
    },
    update(diff){
        player.q.antiquarks = player.q.antiquarks.add(aqRealGainCal().mul(diff))
        if(hasUpgrade("q",45)){
            player.q.antiquarks = player.q.antiquarks.add(aqGainCal().mul(diff))
        }else if(hasUpgrade("q",26)){
            player.q.antiquarks = player.q.antiquarks.add(aqGainCal().mul(diff).div(10))
        }
        if(player.q.antiquarks.gte(player.q.points)){
            if(hasUpgrade("q",35)){
                player.q.antiquarks = player.q.points
            }else{
                player.q.antiquarks = new Decimal(0)
            }
        }
    }
}),                                                                     
addLayer("l",{
    name: "lepton",
    symbol: "L",
    position: 1,
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#00ffff",
    requires: new Decimal(3e9),
    resource: "轻子",
    baseResource: "能量",
    baseAmount() {return player.points},
    type: "normal",
    gainMult() {
        return new Decimal(1)
    },
    gainExp() {
        return new Decimal(1).div(4)
    },
    row: 0,
    resetDescription:" 进行一次轻子聚合并获得",
    hotkeys: [
        {key: "e", description: "E: 进行轻子聚合", onPress(){if (canReset(this.layer)) doReset(this.layer)}}
    ],
    getResetGain(){
        return player.points.div(3e9).pow(this.gainExp()).mul(this.gainMult()).floor()
    },
    getNextAt(){
        return this.getResetGain().add(1).div(this.gainMult()).pow(new Decimal(1).div(this.gainExp())).mul(3e9)
    },
    layerShown(){return hasUpgrade("q",46)},
    tabFormat:{
        "轻子":{
            content:[
                ["display-text",
                    function() { return "你有 <h2 style='color:#00ffff;font-size:30px;font-family:Comic Sans MS'>" + format(player.l.points) + "</h2> 轻子" },
                    { "color": "white", "font-size": "24px", "font-family": "Comic Sans MS" }
                ],
                "blank",
                "prestige-button",
                "blank",
                ["row",[["upgrades",[1]]]]
            ]
        }
    },
    upgrades:{
        11:{
            title:"电子",
            description:"轻子加成能量获取",
            cost:new Decimal(3),
            effect(){
                let effect = new Decimal(1)
                if(player.l.points<=100){
                    effect = player.l.points.add(1).pow(1.5)
                }else{
                    effect = new Decimal(101).pow(1.5).mul(player.l.points.sub(91).log10())
                }
                return effect
            },
            effectDisplay(){return "x"+format(this.effect())},
            unlocked(){return player.l.unlocked},
        }
    }
})