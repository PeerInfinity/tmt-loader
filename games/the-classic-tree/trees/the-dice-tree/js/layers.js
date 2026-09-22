addLayer("d", {
    name: "dice", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "🎲", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        random: new Decimal(0),
        display: new Decimal(0),
        cooldown: new Decimal(0),
        cb: new Decimal(25),
        maxr: new Decimal(7),
        db: new Decimal(1),
        minr: new Decimal(0),
        golddice: new Decimal(0),
        rolled: new Decimal(0),
        goldboost: new Decimal(1),
        req: new Decimal(25),
        ba: new Decimal(0.5),
        cpre: new Decimal(0),
        reqr: new Decimal(25),
        rainbowdice: new Decimal(0),
        rainbowboost: new Decimal(1),
        rolls: new Decimal(0),
        casho: new Decimal(1)
    }},
    color: "#757575",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "", // Name of prestige currency
    baseResource: "cash", // Name of resource prestige is based on
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
    update(diff) {
        if (player.d.rolled.gte(player.d.req)) player.d.rolled = new Decimal(0) , player.d.golddice = player.d.golddice.add(1) , player.d.goldboost = player.d.goldboost.add(player.d.ba)
        if (player.d.golddice.gte(player.d.reqr)) player.d.golddice = player.d.golddice.sub(player.d.reqr) , player.d.rainbowdice = player.d.rainbowdice.add(1) , player.d.rainbowboost = player.d.rainbowboost.add(1)
        player.d.cooldown = player.d.cooldown.add(1)
        if (player.d.cooldown == player.d.cb) player.d.cooldown = new Decimal(player.d.cb)
        if (hasUpgrade("d",61)) clickClickable("d",13)
        if (hasUpgrade("d",61)) clickClickable("d",12)
        if (hasUpgrade("d",61)) clickClickable("d",11)
        if (hasUpgrade("r",65)) player.d.casho = Decimal.floor(player.r.power.log10(player.r.power))
        },
        automate(){return hasUpgrade("d",11)},
    row: "side", // Row the layer is in on the tree (0 is the first row)
    
    layerShown(){return true},
    tabFormat: {
        "掷骰": {
            content: [
                ["display-text",
                    function() {return '你有 ' + format(player.points) + ' 现金'},
                    {"color": "green" , "font-size": "18px"}],
                    ["display-text",
                        function() {return '你已经掷了 ' + format(player.d.rolls) + ' 次骰子'},
                        {"color": "gray" , "font-size": "18px"}],
                    "blank",
                    ["row",[["clickable",11],["clickable",12],["clickable",13]]]
            ],
           
        },
        "骰子升级": {
            content: [
                ["row",[["upgrade",11],["upgrade",12],["upgrade",13],["upgrade",14],["upgrade",15]]],
                ["row",[["upgrade",21],["upgrade",22],["upgrade",23],["upgrade",24],["upgrade",25]]],
                ["row",[["upgrade",31],["upgrade",32],["upgrade",33],["upgrade",34],["upgrade",35]]],
                ["row",[["upgrade",41],["upgrade",42],["upgrade",43],["upgrade",44],["upgrade",45]]],
                ["row",[["upgrade",51],["upgrade",52],["upgrade",53],["upgrade",54],["upgrade",55]]],
                ["row",[["upgrade",61]]],
                ["row",[["upgrade",71],["upgrade",72],["upgrade",73],["upgrade",74],["upgrade",75]]],
                ["row",[["upgrade",81],["upgrade",82],["upgrade",83],["upgrade",84],["upgrade",85]]],
            ]
        },
        "黄金骰子": {
            content: [
                ["display-text",
                    function() {return '每掷 ' + format(player.d.req) + ' 次，你就能获得一个黄金骰子，它会给你带来加成'},
                    {"color": "gold" , "font-size": "23px"}],
             ["display-text",
                   function() {return '你拥有 ' + format(player.d.golddice) + ' 个黄金骰子'},
                        {"color": "gold" , "font-size": "18px"}],
            ["display-text",
                 function() {return '加成：   x' + format(player.d.goldboost)},
                            {"color": "gold" , "font-size": "18px"}],
                            "blank",
                        ["row",[["upgrade",301],["upgrade",302],["upgrade",303],["upgrade",304],["upgrade",305]]]
            ],
            unlocked() {return hasUpgrade('d',25)},
            buttonStyle: {"border-color": "gold"},
        },
        "彩虹骰子": {
            content: [
                ["display-text",
                    function() {return '每掷 ' + format(player.d.reqr) + ' 次，你就能获得一个彩虹骰子，它会给你带来加成'},
                    {"color": "red" , "font-size": "23px"}],
                    ["display-text",
                        function() {return '你拥有 ' + format(player.d.rainbowdice) + ' 个彩虹骰子'},
                             {"color": "orange" , "font-size": "18px"}],
                             ["display-text",
                                function() {return '加成：   x' + format(player.d.rainbowboost)},
                                           {"color": "yellow" , "font-size": "18px"}],
   ["row",[["upgrade",601],["upgrade",602],["upgrade",603],["upgrade",604],["upgrade",605]]],
            ],
            buttonStyle: {
                "border-color": "red"
            },
            unlocked() {return hasUpgrade('d',61)},
        },
        
    },
    upgrades: {
        11: {
            title: "酷",
            description: "冷却时间从 25 秒降至 24 秒",
            cost: new Decimal(50),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.cb = new Decimal(24)
            },
        },
        12: {
            title: "第七个骰子是真的",
            description: "你现在可以掷出 7 了",
            cost: new Decimal(50),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.maxr = new Decimal(8)
            },
        },
        13: {
            title: "更酷",
            description: "冷却时间从 24 秒降至 23 秒",
            cost: new Decimal(75),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.cb = new Decimal(23)
            },
        },
        14: {
            title: "倍率",
            description: "掷骰获得现金时，获得 x1.25 加成",
            cost: new Decimal(100),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.db = new Decimal(1.25)
            },
        },
        15: {
            title: "最酷",
            description: "冷却时间从 23 秒降至 22 秒",
            cost: new Decimal(125),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.cb = new Decimal(22)
            },
        },
        21: {
            title: "酷上加酷",
            description: "冷却时间从 22 秒降至 21 秒",
            cost: new Decimal(150),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.cb = new Decimal(21)
            },
        },
        22: {
            title: "强力",
            description: "掷骰倍率现在为 x1.5",
            cost: new Decimal(180),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.db = new Decimal(1.5)
            },
        },
        23: {
            title: "更棒",
            description: "掷骰倍率现在为 x2",
            cost: new Decimal(300),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.db = new Decimal(2)
            },
        },
        24: {
            title: "八",
            description: "解锁在骰子上掷出 8 的能力",
            cost: new Decimal(300),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.maxr = new Decimal(9)
            },
        },
        25: {
            title: "黄金",
            description: "解锁黄金骰子",
            cost: new Decimal(300),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.maxr = new Decimal(9)
            },
        },
        31: {
            title: "酷上加酷再加酷",
            description: "冷却时间从 21 秒降至 20 秒",
            cost: new Decimal(560),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.cb = new Decimal(20)
            },
            unlocked() {return (hasUpgrade("d", 25))},
        },
        32: {
            title: "多重加成",
            description: "掷骰倍率变为 x2.5",
            cost: new Decimal(560),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.db = new Decimal(2.5)
            },
            unlocked() {return (hasUpgrade("d", 25))},
        },
        33: {
            title: "九",
            description: "你现在可以掷出 9 了",
            cost: new Decimal(750),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.maxr = new Decimal(10)
            },
            unlocked() {return (hasUpgrade("d", 25))},
        },
        34: {
            title: "十！",
            description: "你现在可以掷出 10 了",
            cost: new Decimal(1100),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.maxr = new Decimal(11)
            },
            unlocked() {return (hasUpgrade("d", 25))},
        },
        35: {
            title: "加成翻倍再翻倍",
            description: "骰子倍率现在为 x3",
            cost: new Decimal(1500),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.db = new Decimal(3)
            },
            unlocked() {return (hasUpgrade("d", 25))},
        },
        41: {
            title: "更好的多重倍率",
            description: "骰子倍率现在为 x4",
            cost: new Decimal(8500),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.db = new Decimal(4)
            },
            unlocked() {return (hasUpgrade("d", 35))},
        },
        42: {
            title: "多多益善",
            description: "解锁二阶骰子（额外 x1.25 加成）",
            cost: new Decimal(2.5e4),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            unlocked() {return (hasUpgrade("d", 35))},
        },
        43: {
            title: "十一",
            description: "你现在可以掷出 11 了",
            cost: new Decimal(3e4),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.maxr = new Decimal(12)
            },
            unlocked() {return (hasUpgrade("d", 35))},
        },
        44: {
            title: "十二",
            description: "你现在可以掷出 12 了",
            cost: new Decimal(4e4),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.maxr = new Decimal(13)
            },
            unlocked() {return (hasUpgrade("d", 35))},
        },
        45: {
            title: "更好的更好的倍率",
            description: "骰子倍率现在为 x6",
            cost: new Decimal(5e4),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.db = new Decimal(6)
            },
            unlocked() {return (hasUpgrade("d", 35))},
        },
        51: {
            title: "超级倍率",
            description: "骰子倍率现在为 x10",
            cost: new Decimal(6e4),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.db = new Decimal(10)
            },
            unlocked() {return (hasUpgrade("d", 45))},
        },
        52: {
            title: "十三",
            description: "你现在可以掷出 13 了",
            cost: new Decimal(6.25e4),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.maxr = new Decimal(14)
            },
            unlocked() {return (hasUpgrade("d", 45))},
        },
        53: {
            title: "显著掷骰",
            description: "解锁三阶骰子",
            cost: new Decimal(7e4),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            unlocked() {return (hasUpgrade("d", 45))},
        },
        54: {
            title: "十四",
            description: "你现在可以掷出 14 了",
            cost: new Decimal(1e5),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.maxr = new Decimal(15)
            },
            unlocked() {return (hasUpgrade("d", 45))},
        },
        55: {
            title: "冰封",
            description: "骰子冷却 20 秒降至 19 秒",
            cost: new Decimal(1.1e5),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.cb = new Decimal(19)
            },
            unlocked() {return (hasUpgrade("d", 45))},
        },
        61: {
            title: "大千世界",
            description: "骰子冷却时间变为 15 秒，掷骰加成 x100，自动掷骰，并解锁彩虹骰子",
            cost: new Decimal(5e5),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.cb = new Decimal(15)
                player.d.db = new Decimal(100)
            },
            unlocked() {return (hasUpgrade("d", 55))},
            style: {
                "width": "650px",
                "height": "20px",
                "border-color": "red"
            }
        },
        71: {
            title: "绝对速度 I",
            description: "骰子冷却 19 秒降至 18 秒",
            cost: new Decimal(1e8),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.cb = new Decimal(18)
            },
            unlocked() {return (hasUpgrade("d", 61))},
        },
        72: {
            title: "绝对速度 II",
            description: "骰子冷却 18 秒降至 17 秒",
            cost: new Decimal(2e8),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.cb = new Decimal(17)
            },
            unlocked() {return (hasUpgrade("d", 71))},
        },
        73: {
            title: "绝对速度 III",
            description: "骰子冷却 17 秒降至 16 秒",
            cost: new Decimal(4e8),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.cb = new Decimal(16)
            },
            unlocked() {return (hasUpgrade("d", 72))},
        },
        74: {
            title: "绝对速度 IV",
            description: "骰子冷却 16 秒降至 15 秒",
            cost: new Decimal(6e8),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.cb = new Decimal(15)
            },
            unlocked() {return (hasUpgrade("d", 73))},
        },
        75: {
            title: "绝对速度 V",
            description: "骰子冷却 15 秒降至 14 秒",
            cost: new Decimal(7e8),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.cb = new Decimal(14)
            },
            unlocked() {return (hasUpgrade("d", 74))},
        },
        81: {
            title: "绝对速度 VI",
            description: "骰子冷却 14 秒降至 13 秒",
            cost: new Decimal(1e9),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.cb = new Decimal(13)
            },
            unlocked() {return (hasUpgrade("d", 75))},
        },
        82: {
            title: "十五",
            description: "你现在可以掷出 15 了",
            cost: new Decimal(1.5e9),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.maxr = new Decimal(16)
            },
            unlocked() {return (hasUpgrade("d", 81))},
        },
        83: {
            title: "十六",
            description: "你现在可以掷出 16 了",
            cost: new Decimal(2e9),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.maxr = new Decimal(17)
            },
            unlocked() {return (hasUpgrade("d", 82))},
        },
        84: {
            title: "十七",
            description: "你现在可以掷出 17 了",
            cost: new Decimal(2.5e9),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.maxr = new Decimal(18)
            },
            unlocked() {return (hasUpgrade("d", 83))},
        },
        85: {
            title: "十八",
            description: "你现在可以掷出 18 了",
            cost: new Decimal(4e9),
            currencyInternalName: "points",
            currencyDisplayName: "现金",
            onPurchase() {
                player.d.maxr = new Decimal(19)
            },
            unlocked() {return (hasUpgrade("d", 84))},
        },
        301: {
            title: "闪亮需求",
            description: "获得黄金骰子的需求现在为 24 次",
            cost: new Decimal(5),
            currencyInternalName: "golddice",
            currencyDisplayName: "黄金骰子",
            currencyLayer: "d",
            onPurchase() {
                player.d.req = new Decimal(24)
            },
            style: {
                "border-color": "gold"
            },
        },
        302: {
            title: "闪亮加成",
            description: "现在每获得一个黄金骰子，加成 +x0.55",
            cost: new Decimal(5),
            currencyInternalName: "golddice",
            currencyDisplayName: "黄金骰子",
            currencyLayer: "d",
            onPurchase() {
                player.d.ba = new Decimal(0.55)
            },
            unlocked() {return (hasUpgrade("d", 301))},
            style: {
                "border-color": "gold"
            },
        },
        303: {
            title: "偷懒赚现金",
            description: "解锁 RNG 选项卡",
            cost: new Decimal(10),
            currencyInternalName: "golddice",
            currencyDisplayName: "黄金骰子",
            currencyLayer: "d",
            
            unlocked() {return (hasUpgrade("d", 302))},
            style: {
                "border-color": "gold"
            },
        },
        304: {
            title: "RNG 精华",
            description: "你现在可以生成 RNG 精华了",
            cost: new Decimal(10),
            currencyInternalName: "golddice",
            currencyDisplayName: "黄金骰子",
            currencyLayer: "d",
            onPurchase() {
                player.d.cpre = new Decimal(1)
            },
            unlocked() {return (hasUpgrade("d", 303))},
            style: {
                "border-color": "gold"
            },
        },
        305: {
            title: "多重好礼",
            description: "每个黄金骰子提供 +x0.6，需求现在为 23 次",
            cost: new Decimal(12),
            currencyInternalName: "golddice",
            currencyDisplayName: "黄金骰子",
            currencyLayer: "d",
            onPurchase() {
                player.d.req = new Decimal(23)
                player.d.ba = new Decimal(0.6)
            },
            unlocked() {return (hasUpgrade("d", 304))},
            style: {
                "border-color": "gold"
            },
        },
        601: {
            title: "超棒黄金",
            description: "每个黄金骰子提供 +x0.75，需求现在为 22 次",
            cost: new Decimal(3),
            currencyInternalName: "rainbowdice",
            currencyDisplayName: "彩虹骰子",
            currencyLayer: "d",
            onPurchase() {
                player.d.req = new Decimal(22)
                player.d.ba = new Decimal(0.75)
            },
            unlocked() {return (hasUpgrade("d", 304))},
            style: {"border-color": "red"}
           
                
        },
        602: {
            title: "最佳黄金",
            description: "每个黄金骰子提供 +x0.8，需求现在为 20 次",
            cost: new Decimal(5),
            currencyInternalName: "rainbowdice",
            currencyDisplayName: "彩虹骰子",
            currencyLayer: "d",
            onPurchase() {
                player.d.req = new Decimal(20)
                player.d.ba = new Decimal(0.8)
            },
            unlocked() {return (hasUpgrade("d", 601))},
            style: {"border-color": "orange"}
 
        },
        603: {
            title: "彩虹需求",
            description: "黄金骰子需求现在为 15 次，彩虹骰子需求现在为 20 次",
            cost: new Decimal(5),
            currencyInternalName: "rainbowdice",
            currencyDisplayName: "彩虹骰子",
            currencyLayer: "d",
            onPurchase() {
                player.d.req = new Decimal(15)
                player.d.reqr = new Decimal(20)
            },
            unlocked() {return (hasUpgrade("d", 602))},
            style: {"border-color": "yellow"}
        }
    },
    clickables: {
        11: {
            style: {
                "color": "black" , "font-size": "25px"
            },
            display() {return player.d.random},
            canClick() {if (player.d.cooldown.gte(player.d.cb)) return true},
            onClick() {
                player.d.random = Math.floor(Math.random() * player.d.maxr)
                player.points = player.points.add(player.d.random*player.d.db*player.r.slb*player.d.goldboost*player.d.rainbowboost*player.d.casho)
                player.d.cooldown = new Decimal(0)
                player.d.rolled = player.d.rolled.add(1)
                player.d.rolls = player.d.rolls.add(1)
            },
            unlocked() {return (!hasUpgrade("d", 42))},
        },
        12: {
            style: {
                "color": "green" , "font-size": "25px", "border-color": "green"
            },
            display() {return player.d.random},
            canClick() {if (player.d.cooldown.gte(player.d.cb)) return true},
            onClick() {
                player.d.random = Math.floor(Math.random() * player.d.maxr)
                player.points = player.points.add(player.d.random*player.d.db*player.r.slb*player.d.goldboost*player.d.rainbowboost*player.d.casho*1.25)
                player.d.cooldown = new Decimal(0)
                player.d.rolled = player.d.rolled.add(1)
                player.d.rolls = player.d.rolls.add(1)
            },
            unlocked() {return (hasUpgrade("d", 42) && !hasUpgrade("d",53))},
        },
        13: {
            
            style: {
                "color": "blue" , "font-size": "25px", "border-color": "blue"
            },
            display() {return player.d.random},
            canClick() {if (player.d.cooldown.gte(player.d.cb)) return true},
            onClick() {
                player.d.random = Math.floor(Math.random() * player.d.maxr)
                player.points = player.points.add(player.d.random*player.d.db*player.r.slb*player.d.goldboost*player.d.rainbowboost*player.d.casho*3)
                player.d.cooldown = new Decimal(0)
                player.d.rolled = player.d.rolled.add(1)
                player.d.rolls = player.d.rolls.add(1)
            },
            unlocked() {return (hasUpgrade("d", 53))},
        },
    }
}),
addLayer("r", {
    name: "rng", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "RNG", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        chance: new Decimal(1),
        cooldown2: new Decimal(1),
        poss: new Decimal(1),
        slb: new Decimal(1),
        ess: new Decimal(0),
        eg: new Decimal(0.01),
        be: new Decimal(0),
        wa: new Decimal(30),
        rbb: new Decimal(1),
        power: new Decimal(10),
        ps: new Decimal(0),
        a: new Decimal(0),
        a2: new Decimal(0),
        pd1: new Decimal(1),
        bea: new Decimal(1),
        a3: new Decimal(0)
    }},
    color: "#02E3FF",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "", // Name of prestige currency
    baseResource: "cash", // Name of resource prestige is based on
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
    row: "side", // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasUpgrade("d",303)},
    update(diff) {
        if (hasUpgrade("r",35)) clickClickable("r",11)
        player.r.cooldown2 = player.r.cooldown2.add(1)
        if (player.r.cooldown2 == player.r.wa) player.r.cooldown2 = new Decimal(player.r.wa)
        if (hasUpgrade("d",304) && player.d.cpre.gte(1)) player.r.ess = player.r.ess.add(player.r.eg)
        if (hasUpgrade("r",33)) player.r.rbb = player.d.rainbowdice
        player.r.power = player.r.power.add(player.r.ps)
        if (player.r.a == 1) buyBuyable2(this.layer, 11)
        if (player.r.a2 == 1) buyBuyable2(this.layer, 21)
        if (player.r.a3 == 1) buyBuyable2(this.layer, 31)
        },
    tabFormat: {
        "RNG": {
            content: [
                ["display-text",
                    function() {return '1/' + format(player.r.chance)},
                    {"color": "cyan" , "font-size": "30px"}],
                ["display-text",
                        function() {return '加成：  x' + format(player.r.slb)},
                        {"color": "cyan" , "font-size": "30px"}],
                    "blank",
                    ["row",[["clickable",11]]]
            ],
            buttonStyle: {"border-color": "cyan"},
        },
        "精华": {
            content: [
                ["display-text",
                    function() {return '你拥有：' + format(player.r.ess) + ' RNG 精华'},
                    {"color": "blue" , "font-size": "22px"}],
                    "blank",
                    ["row",[["upgrade",11],["upgrade",12],["upgrade",13],["upgrade",14],["upgrade",15]]],
                    ["row",[["upgrade",21],["upgrade",22],["upgrade",23],["upgrade",24],["upgrade",25]]],
                    ["row",[["upgrade",31],["upgrade",32],["upgrade",33],["upgrade",34],["upgrade",35]]],
                    ["row",[["upgrade",41]]],
                    ["row",[["upgrade",51],["upgrade",52],["upgrade",53],["upgrade",54],["upgrade",55]]],

            ],
            buttonStyle: {"border-color": "blue"},
            unlocked() {return (hasUpgrade("d", 304))},
        },
        "维度": {
            content: [
                ["display-text",
                    function() {return '你拥有：' + format(player.r.power) + ' 力量'},
                    {"color": "red" , "font-size": "30px"}],
                    "blank",
                    ["row",[["buyable",11]]],
                    ["row",[["buyable",21]]],
                    ["row",[["buyable",31]]],
                    ["row",[["buyable",41]]],
                    "blank",
                    ["row",[["upgrade",61],["upgrade",62],["upgrade",63],["upgrade",64],["upgrade",65]]],
            ],
            buttonStyle: {"border-color": "red"},
            unlocked() {return (hasUpgrade("r", 54))},
        }
    },
    buyables: {
        11: {
			title: "维度 I",
			cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                return new Decimal(10).mul(x).pow(1.2)
            },
			display() { // Everything else displayed in the buyable button after the title
                return "生成力量 消耗：" + format(tmp.r.buyables[11].cost) + " 力量数量：" + formatWhole(getBuyableAmount("r",11)) + " 效果：" + format(player.r.ps) + " 力量/秒"
            }, 
            canAfford() {
                    return player.r.power.gte(tmp.r.buyables[11].cost)},
            buy() { 
                if (player.r.a == 1) {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1*getBuyableAmount(this.layer, 21)*player.r.bea))
                player.r.ps = player.r.ps.add(0.1*getBuyableAmount(this.layer, 11)*getBuyableAmount(this.layer, 21)*getBuyableAmount(this.layer,31)*player.r.pd1*player.r.bea)
                } else {
                    player[this.layer].power = player[this.layer].power.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.r.ps = player.r.ps.add(0.1)
                }
            },
            style: {
                "width": "600px",
                "height": "50px"
            }
        },
        21: {
			title: "维度 II",
			cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                return new Decimal(10).mul(x).pow(3)
            },
			display() { // Everything else displayed in the buyable button after the title
                return "生成力量 消耗：" + format(tmp.r.buyables[21].cost) + " 力量数量：" + formatWhole(getBuyableAmount("r",21))
            }, 
            canAfford() {
                    return player.r.power.gte(tmp.r.buyables[21].cost)},
            buy() { 
                if (player.r.a2 == 1) {
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1*getBuyableAmount(this.layer, 31)))
                }  else {
                player[this.layer].power = player[this.layer].power.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.r.a = new Decimal(1)
                }
                
            },
            style: {
                "width": "600px",
                "height": "50px"
            }
        },
        31: {
			title: "维度 III",
			cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let y = 1e5
                return new Decimal(y).mul(x).pow(x)
            },
			display() { // Everything else displayed in the buyable button after the title
                return "生成力量 消耗：" + format(tmp.r.buyables[31].cost) + " 力量数量：" + formatWhole(getBuyableAmount("r",31))
            }, 
            canAfford() {
                    return player.r.power.gte(tmp.r.buyables[31].cost)},
                    unlocked() {return player.r.a == 1},
            buy() {
                if (player.r.a3 == 1) {
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1*getBuyableAmount(this.layer, 41)))
                } else {
                player[this.layer].power = player[this.layer].power.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.r.a2 = new Decimal(1)
                }
                
                
            },
            style: {
                "width": "600px",
                "height": "50px"
            }
        },
        41: {
			title: "维度 IV",
			cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let y = 1e15
                return new Decimal(y).mul(x).pow(x)
            },
			display() { // Everything else displayed in the buyable button after the title
                return "生成力量 消耗：" + format(tmp.r.buyables[41].cost) + " 力量数量：" + formatWhole(getBuyableAmount("r",41))
            }, 
            canAfford() {
                    return player.r.power.gte(tmp.r.buyables[41].cost)},
                    unlocked() {return getBuyableAmount(this.layer, 31).gte(5)},
            buy() {
               
                player[this.layer].power = player[this.layer].power.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.r.a3 = new Decimal(1)
                
                
            },
            style: {
                "width": "600px",
                "height": "50px"
            }
        },
    },
    upgrades: {
        11: {
            title: "更好的生产",
            description: "现在每秒获得 0.03 RNG 精华",
            cost: new Decimal(25),
            currencyInternalName: "ess",
            currencyDisplayName: "RNG 精华",
            currencyLayer: "r",
            onPurchase() {
                player.r.eg = new Decimal(0.03)
            },
            unlocked() {return (hasUpgrade("d", 304))},
            style: {
                "border-color": "blue"
            },
        },
        12: {
            title: "超级生产",
            description: "现在每秒获得 0.3 RNG 精华",
            cost: new Decimal(30),
            currencyInternalName: "ess",
            currencyDisplayName: "RNG 精华",
            currencyLayer: "r",
            onPurchase() {
                player.r.eg = new Decimal(0.3)
            },
            unlocked() {return (hasUpgrade("r", 11))},
            style: {
                "border-color": "blue"
            },
        },
        13: {
            title: "超级生产",
            description: "现在每秒获得 1 RNG 精华",
            cost: new Decimal(50),
            currencyInternalName: "ess",
            currencyDisplayName: "RNG 精华",
            currencyLayer: "r",
            onPurchase() {
                player.r.eg = new Decimal(1)
            },
            unlocked() {return (hasUpgrade("r", 12))},
            style: {
                "border-color": "blue"
            },
        },
        14: {
            title: "更好的 RNG",
            description: "你的 RNG 更好了",
            cost: new Decimal(75),
            currencyInternalName: "ess",
            currencyDisplayName: "RNG 精华",
            currencyLayer: "r",
            onPurchase() {
                player.r.be = new Decimal(1)
            },
            unlocked() {return (hasUpgrade("r", 13))},
            style: {
                "border-color": "blue"
            },
        },
        15: {
            title: "RNG 大师",
            description: "你的 RNG 好多了",
            cost: new Decimal(5000),
            currencyInternalName: "ess",
            currencyDisplayName: "RNG 精华",
            currencyLayer: "r",
            onPurchase() {
                player.r.be = new Decimal(5)
            },
            unlocked() {return (hasUpgrade("r", 14))},
            style: {
                "border-color": "blue"
            },
        },
        21: {
            title: "RNG 传奇",
            description: "你的 RNG 好太多了",
            cost: new Decimal(7500),
            currencyInternalName: "ess",
            currencyDisplayName: "RNG 精华",
            currencyLayer: "r",
            onPurchase() {
                player.r.be = new Decimal(10)
            },
            unlocked() {return (hasUpgrade("r", 15))},
            style: {
                "border-color": "blue"
            },
        },
        22: {
            title: "RNG 冠军",
            description: "你的 RNG 好得多得多",
            cost: new Decimal(1.5e4),
            currencyInternalName: "ess",
            currencyDisplayName: "RNG 精华",
            currencyLayer: "r",
            onPurchase() {
                player.r.be = new Decimal(25)
            },
            unlocked() {return (hasUpgrade("r", 21))},
            style: {
                "border-color": "blue"
            },
        },
        23: {
            title: "RNG 冷却 I",
            description: "冷却时间从 30 秒降至 29 秒",
            cost: new Decimal(2e4),
            currencyInternalName: "ess",
            currencyDisplayName: "RNG 精华",
            currencyLayer: "r",
            onPurchase() {
                player.r.wa = new Decimal(29)
            },
            unlocked() {return (hasUpgrade("r", 22))},
            style: {
                "border-color": "blue"
            },
        },
        24: {
            title: "RNG 冷却 II",
            description: "冷却时间从 29 秒降至 28 秒，并且每秒获得 5 精华",
            cost: new Decimal(2.25e4),
            currencyInternalName: "ess",
            currencyDisplayName: "RNG 精华",
            currencyLayer: "r",
            onPurchase() {
                player.r.wa = new Decimal(28)
                player.r.eg = new Decimal(5)
            },
            unlocked() {return (hasUpgrade("r", 23))},
            style: {
                "border-color": "blue"
            },
        },
        25: {
            title: "RNG 冷却 III",
            description: "冷却时间从 28 秒降至 27 秒，并且每秒获得 10 精华",
            cost: new Decimal(3e4),
            currencyInternalName: "ess",
            currencyDisplayName: "RNG 精华",
            currencyLayer: "r",
            onPurchase() {
                player.r.wa = new Decimal(27)
                player.r.eg = new Decimal(10)
            },
            unlocked() {return (hasUpgrade("r", 24))},
            style: {
                "border-color": "blue"
            },
        },
        31: {
            title: "RNG 冷却 IV",
            description: "冷却时间从 27 秒降至 26 秒，并且每秒获得 25 精华",
            cost: new Decimal(4e4),
            currencyInternalName: "ess",
            currencyDisplayName: "RNG 精华",
            currencyLayer: "r",
            onPurchase() {
                player.r.wa = new Decimal(26)
                player.r.eg = new Decimal(25)
                
            },
            unlocked() {return (hasUpgrade("r", 25))},
            style: {
                "border-color": "blue"
            },
        },
        32: {
            title: "RNG 冷却 V",
            description: "冷却时间从 26 秒降至 25 秒，并且每秒获得 50 精华",
            cost: new Decimal(4.5e4),
            currencyInternalName: "ess",
            currencyDisplayName: "RNG 精华",
            currencyLayer: "r",
            onPurchase() {
                player.r.wa = new Decimal(25)
                player.r.eg = new Decimal(50)
            },
            unlocked() {return (hasUpgrade("r", 31))},
            style: {
                "border-color": "blue"
            },
        },
        33: {
            title: "最稀有掷骰",
            description: "RNG 会根据你拥有的彩虹骰子数量而变得更好",
            cost: new Decimal(4.5e4),
            currencyInternalName: "ess",
            currencyDisplayName: "RNG 精华",
            currencyLayer: "r",
            onPurchase() {
    
                
            },
            unlocked() {return (hasUpgrade("r", 32))},
            style: {
                "border-color": "blue"
            },
        },
        34: {
            title: "终极掷骰",
            description: "终极 RNG",
            cost: new Decimal(7e4),
            currencyInternalName: "ess",
            currencyDisplayName: "RNG 精华",
            currencyLayer: "r",
            onPurchase() {
                player.r.be = new Decimal(35)
                
            },
            unlocked() {return (hasUpgrade("r", 33))},
            style: {
                "border-color": "blue"
            },
        },
        35: {
            title: "永恒 RNG",
            description: "自动掷 RNG 并获得更好的 RNG",
            cost: new Decimal(3e5),
            currencyInternalName: "ess",
            currencyDisplayName: "RNG 精华",
            currencyLayer: "r",
            onPurchase() {
                player.r.be = new Decimal(45)
                
            },
            unlocked() {return (hasUpgrade("r", 34))},
            style: {
                "border-color": "blue"
            },
        },
        41: {
            title: "以光速前进",
            description: "掷骰无冷却，并获得更好的 RNG",
            cost: new Decimal(6e5),
            currencyInternalName: "ess",
            currencyDisplayName: "RNG 精华",
            currencyLayer: "r",
            onPurchase() {
                player.r.be = new Decimal(100)
                player.r.wa = new Decimal(0)
                
            },
            unlocked() {return (hasUpgrade("r", 35))},
            style: {
                "border-color": "cyan",
                "width": "500px"
            },
        },
        51: {
            title: "最大 RNG",
            description: "这是最好的吗？",
            cost: new Decimal(1e5),
            currencyInternalName: "ess",
            currencyDisplayName: "RNG 精华",
            currencyLayer: "r",
            onPurchase() {
                player.r.be = new Decimal(60)
            },
            unlocked() {return (hasUpgrade("r", 41))},
            style: {
                "border-color": "blue"
            },
        },
        52: {
            title: "RNG 星系",
            description: "RNG 越来越好",
            cost: new Decimal(1e5),
            currencyInternalName: "ess",
            currencyDisplayName: "RNG 精华",
            currencyLayer: "r",
            onPurchase() {
                player.r.be = new Decimal(199)
            },
            unlocked() {return (hasUpgrade("r", 51))},
            style: {
                "border-color": "blue"
            },
        },
        53: {
            title: "RNG 宇宙",
            description: "RNG 现在达到最大值",
            cost: new Decimal(1e5),
            currencyInternalName: "ess",
            currencyDisplayName: "RNG 精华",
            currencyLayer: "r",
            onPurchase() {
                player.r.be = new Decimal(650)
            },
            unlocked() {return (hasUpgrade("r", 52))},
            style: {
                "border-color": "blue"
            },
        },
        54: {
            title: "RNG 维度",
            description: "致敬？",
            cost: new Decimal(5e5),
            currencyInternalName: "ess",
            currencyDisplayName: "RNG 精华",
            currencyLayer: "r",
            onPurchase() {
                player.r.be = new Decimal(650)
            },
            unlocked() {return (hasUpgrade("r", 53))},
            style: {
                "border-color": "red",
                "width": "250px"
            },
        },
        61: {
            title: "口袋维度",
            description: "从第一维度获得更多力量/秒",
            cost: new Decimal(1e9),
            currencyInternalName: "power",
            currencyDisplayName: "力量",
            currencyLayer: "r",
            onPurchase() {
                player.r.pd1 = new Decimal(1e4)
            },
            unlocked() {return (hasUpgrade("r", 54))},
            style: {
                "border-color": "red",
            },
        },
        62: {
            title: "维度助推器",
            description: "从第一维度获得更多的力量/秒",
            cost: new Decimal(5e12),
            currencyInternalName: "power",
            currencyDisplayName: "力量",
            currencyLayer: "r",
            onPurchase() {
                player.r.pd1 = new Decimal(1e6)
            },
            unlocked() {return (hasUpgrade("r", 61))},
            style: {
                "border-color": "red",
            },
        },
        63: {
            title: "强化维度助推器",
            description: "更多力量",
            cost: new Decimal(3e15),
            currencyInternalName: "power",
            currencyDisplayName: "力量",
            currencyLayer: "r",
            onPurchase() {
                player.r.pd1 = new Decimal(1e9)
            },
            unlocked() {return (hasUpgrade("r", 62))},
            style: {
                "border-color": "red",
            },
        },
        64: {
            title: "第二个第一维度",
            description: "获得更多第一维度",
            cost: new Decimal(1e19),
            currencyInternalName: "power",
            currencyDisplayName: "力量",
            currencyLayer: "r",
            onPurchase() {
                player.r.pd1 = new Decimal(1e12)
                player.r.bea = new Decimal(10)
            },
            unlocked() {return (hasUpgrade("r", 63))},
            style: {
                "border-color": "red",
            },
        },
        65: {
            title: "维度掷骰",
            description: "力量每增加一个数量级，现金加成提升",
            cost: new Decimal(3e40),
            currencyInternalName: "power",
            currencyDisplayName: "力量",
            currencyLayer: "r",
            onPurchase() {
                player.r.pd1 = new Decimal(1e15)
                player.r.bea = new Decimal(25)
            },
            unlocked() {return (hasUpgrade("r", 64))},
            style: {
                "border-color": "red",
            },
        },
    },
    clickables: {
        11: {
        style: {
            "color": "cyan" , "font-size": "15px"
        },
        display() {return ' 1/' + format(player.r.chance)},
        canClick() {if (player.r.cooldown2.gte(player.r.wa)) return true},
        onClick() {
            player.r.poss = Math.floor(Math.random() * 2-player.r.be-player.r.rbb)
            if (player.r.poss == 1) {
                player.r.chance = new Decimal(1)
            } else {
                player.r.poss = Math.floor(Math.random() * 5-player.r.be-player.r.rbb)
                if (player.r.poss == 1) {
                    player.r.chance = new Decimal(5)
                    player.r.slb = player.r.slb.add(0.0000000000001)
                } else {
                    player.r.poss = Math.floor(Math.random() * 16-player.r.be-player.r.rbb)
                    if (player.r.poss == 1) {
                        player.r.chance = new Decimal(15)
                        player.r.slb = player.r.slb.add(0.000000000001)
                    } else {
                        player.r.poss = Math.floor(Math.random() * 51-player.r.be-player.r.rbb)
                        if (player.r.poss == 1) {
                            player.r.chance = new Decimal(50)
                            player.r.slb = player.r.slb.add(0.00000000001)
                        } else {
                            player.r.poss = Math.floor(Math.random() * 151-player.r.be-player.r.rbb)
                            if (player.r.poss == 1) {
                                player.r.chance = new Decimal(150)
                                player.r.slb = player.r.slb.add(0.0000000001)
                            } else {
                                player.r.poss = Math.floor(Math.random() * 301-player.r.be-player.r.rbb)
                                if (player.r.poss == 1) {
                                    player.r.chance = new Decimal(300)
                                    player.r.slb = player.r.slb.add(0.000000001)
                                } else {
                                    player.r.poss = Math.floor(Math.random() * 751-player.r.be-player.r.rbb)
                                    if (player.r.poss == 1) {
                                        player.r.chance = new Decimal(750)
                                    player.r.slb = player.r.slb.add(0.00000001)
                                    } else {
                                        player.r.poss = Math.floor(Math.random() * 1501-player.r.be-player.r.rbb)
                                        if (player.r.poss == 1) {
                                            player.r.chance = new Decimal(1500)
                                            player.r.slb = player.r.slb.add(0.0000001)
                                        } else {
                                            player.r.poss = Math.floor(Math.random() * 3333-player.r.be-player.r.rbb)
                                            if (player.r.poss == 1) {
                                                player.r.chance = new Decimal(3333)
                                            player.r.slb = player.r.slb.add(0.000001)
                                            } else {
                                                player.r.poss = Math.floor(Math.random() * 5750-player.r.be-player.r.rbb)
                                                if (player.r.poss == 1) {
                                                    player.r.chance = new Decimal(5750)
                                                    player.r.slb = player.r.slb.add(0.00001)
                                                } else {
                                                    player.r.poss = Math.floor(Math.random() * 10000-player.r.be-player.r.rbb)
                                                    if (player.r.poss == 1) {
                                                        player.r.chance = new Decimal(10000)
                                                        player.r.slb = player.r.slb.add(0.0001)
                                                    } else {
                                                        player.r.poss = Math.floor(Math.random() * 25000-player.r.be-player.r.rbb)
                                                        if (player.r.poss == 1) {
                                                            player.r.chance = new Decimal(25000)
                                                            player.r.slb = player.r.slb.add(0.001)
                                                        } else {
                                                            player.r.poss = Math.floor(Math.random() * 44444-player.r.be-player.r.rbb)
                                                            if (player.r.poss == 1) {
                                                                player.r.chance = new Decimal(44444)
                                                                player.r.slb = player.r.slb.add(0.01)
                                                            } else {
                                                                player.r.poss = Math.floor(Math.random() * 1e4-player.r.be-player.r.rbb)
                                                                if (player.r.poss == 1) {
                                                                    player.r.chance = new Decimal(1e4)
                                                                    player.r.slb = player.r.slb.add(0.1)
                                                                } else {
                                                                    player.r.poss = Math.floor(Math.random() * 2.5e5-player.r.be-player.r.rbb)
                                                                    if (player.r.poss == 1) {
                                                                        player.r.chance = new Decimal(2.5e5)
                                                                        player.r.slb = player.r.slb.add(1)
                                                                    } else {
                                                                        player.r.poss = Math.floor(Math.random() * 9.9e6-player.r.be-player.r.rbb)
                                                                        if (player.r.poss == 1) {
                                                                            player.r.chance = new Decimal(9.9e6)
                                                                        player.r.slb = player.r.slb.add(10)
                                                                        }
                                                                    }
                                                                }
                                                            
                                                                
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                
                    
                }
            }
            player.r.cooldown2 = new Decimal(0)
        },
        },
    }
}),
addLayer("a", {
    name: "achievement", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "🏆 ", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#F9E800",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "ap", // Name of prestige currency
    baseResource: "cash", // Name of resource prestige is based on
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
     update(diff) {
        player.a.points = new Decimal(player.a.achievements.length)
        },
    row: "side", // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},
    tabFormat: {
        "成就": {
             content: [
                ["display-text",
                    function() {return '你拥有 ' + format(player.a.points) + ' 成就点数'},
                    {"color": "gold" , "font-size": "30px"}],
                    "blank",
                    ["row",[["achievement",11],["achievement",12],["achievement",13],["achievement",14],["achievement",15],["achievement",16]]],
                    ["row",[["achievement",21],["achievement",22],["achievement",23],["achievement",24],["achievement",25],["achievement",26]]]
            ],
            buttonStyle: {"border-color": "gold"},
        },
        "隐藏": {
            content: [
                  ["row",[["achievement",301],["achievement",302],["achievement",303],["achievement",304],["achievement",305],["achievement",306]]],
            ]
        }
    },
    achievements: {
        11: {
            name: "掷骰",
            tooltip: "继续掷吧，继续掷吧",
            doneTooltip: "获得 50 现金",
            done(){return player.points.gte(50)},
            style: {
                "border-color": "gold"
            }
        },
        12: {
            name: "7？？",
            tooltip: "你现在能掷出 7 了？这不正常",
            doneTooltip: "能够掷出 7",
            done(){return player.d.maxr.gte(8)},
            style: {
                "border-color": "gold"
            }
        },
        13: {
            name: "闪亮",
            tooltip: "哦哦哦",
            doneTooltip: "获得 5 个黄金骰子",
            done(){return player.d.golddice.gte(5)},
            style: {
                "border-color": "gold"
            }
        },
        14: {
            name: "RNG",
            tooltip: "好家伙",
            doneTooltip: "解锁 RNG",
            done(){return hasUpgrade("d",303)},
            style: {
                "border-color": "gold"
            }
        },
        15: {
            name: "核心 RNG",
            tooltip: "RNG 的精华，现在你能获得更好的概率",
            doneTooltip: "获得 100 RNG 精华",
            done(){return player.r.ess.gte(100)},
            style: {
                "border-color": "gold"
            }
        },
        16: {
            name: "彩虹之上",
            tooltip: "想知道那边有什么。",
            doneTooltip: "获得你的第一个彩虹骰子",
            done(){return player.d.rainbowdice.gte(1)},
            style: {
                "border-color": "gold"
            }
        },
        21: {
            name: "RNG 大师",
            tooltip: "怎么做到的？？？",
            doneTooltip: "掷出比 2500 更好的结果",
            done(){return player.r.chance.gte(2500)},
            style: {
                "border-color": "gold"
            }
        },
        22: {
            name: "这是个致敬吗？",
            tooltip: "也许吧",
            doneTooltip: "拥有 1e5 力量",
            done(){return player.r.power.gte(1e5)},
            style: {
                "border-color": "gold"
            }
        },
        301: {
            name: "你根本永远得不到这个",
            tooltip: "哈哈",
            doneTooltip: "没错，永远不会",
            done(){return player.d.rainbowdice.gte(1e100)},
            style: {
                "border-color": "red"
            }
        }
    }
})
