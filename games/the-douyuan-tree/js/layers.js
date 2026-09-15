addLayer("p", {
    name: "WP", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "W", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
      unlocked: true,
		  points: new Decimal("0"),
    }},
    color: "#4BDC13",
    requires: new Decimal("1"), // Can be a function that takes requirement increases into account
    resource: "WP", // Name of prestige currency
    baseResource: "点数", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
      mult = new Decimal("2")
      if(hasUpgrade('P', 21)) mult = mult.times(player["P"].points.add(1).pow(30))
      else mult = mult.times(player["P"].points.add(1).pow(3))
      if(hasUpgrade('p', 21)) mult = mult.times(upgradeEffect('p', 21))
      if(hasUpgrade('p', 22)) mult = mult.times(upgradeEffect('p', 22))
      if(hasUpgrade('p', 23)) mult = mult.times(upgradeEffect('p', 23))
      if(hasUpgrade('P', 11)) mult = mult.times(4)
      
      if(mult.gte(new Decimal("1e10000"))) {
        mult = new Decimal("1e10000").times(mult.div(new Decimal("1e10000")).pow(0.4))
      }
      return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
      return new Decimal("1")
    },
    passiveGeneration() {
      if(hasMilestone("P", 1)) {return new Decimal("1")}
      return new Decimal("0")
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
      {key: "w", description: "W: 重置以获得 WP", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    doReset(resettingLayer) {
      let keep = [];
      if(layers[resettingLayer].row > this.row) {
        layerDataReset(this.layer, keep)
        if(layers[resettingLayer].id == 'P' && hasMilestone('P', 0)) {
          player.p.upgrades = [11, 12, 13, 21, 22, 23, 31, 32, 33]
        }
      }
    },
    upgrades: {
      11: {
        name: "《自 然 风 光》",
        title: "《自 然 风 光》",
        description: "使点数乘以 2",
        cost: new Decimal("1"),
        effect() {
          return new Decimal("2")
        },
        effectDisplay() {return format(upgradeEffect(this.layer, this.id)) + "x"},
      },
      12: {
        name: "《h o m o》",
        title: "人类，启动！",
        description: "基于 WP 加成点数",
        cost: new Decimal("5"),
        effect() {
          eff = new Decimal("1")
          if(hasUpgrade("P", 13)) {eff = player[this.layer].points.add(1).pow(0.75).times(Decimal.log2(Decimal.log2(player[this.layer].points.add(2)).add(2)))}
          else {eff = player[this.layer].points.add(1).pow(0.7)}
          if(eff.gte(new Decimal("1e100"))) {
            eff = new Decimal("1e100").times(eff.div(new Decimal("1e100")).pow(0.6))
          }
          return eff
        },
        effectDisplay() {return format(upgradeEffect(this.layer, this.id)) + "x"},
      },
      13: {
        name: "《环 境 改 造》",
        title: "《环 境 改 造》",
        description: "基于点数加成点数",
        cost: new Decimal("20"),
        effect() {
          eff = new Decimal("1")
          if(hasUpgrade("P", 12)) {eff = Decimal.log2(player.points.add(10)).pow(10)}
          else {eff = Decimal.log10(player.points.add(10)).pow(2)}
          if(eff.gte(new Decimal("1e100"))) {
            eff = new Decimal("1e100").times(eff.div(new Decimal("1e100")).pow(0.6))
          }
          return eff
        },
        effectDisplay() {return format(upgradeEffect(this.layer, this.id)) + "x"},
      },
      21: {
        name: "友好的环境",
        title: "环境：我感觉行了",
        description: "基于点数加成 WP",
        cost: new Decimal("111"),
        effect() {
          eff = new Decimal("1")
          if(hasUpgrade("P", 12)) {eff = player.points.add(1).pow(0.2).times(Decimal.log2(player.points.add(10)).pow(3))}
          else {eff = player.points.add(1).pow(0.15)}
          if(eff.gte(new Decimal("1e100"))) {
            eff = new Decimal("1e100").times(eff.div(new Decimal("1e100")).pow(0.6))
          }
          return eff
        },
        effectDisplay() {return format(upgradeEffect(this.layer, this.id)) + "x"},
      },
      22: {
        name: "定居",
        title: "定居",
        description: "基于 WP 加成 WP",
        cost: new Decimal("2222"),
        effect() {
          eff = new Decimal("1")
          if(hasUpgrade("P", 13)) {eff = player[this.layer].points.add(1).pow(0.15)}
          else {eff = player[this.layer].points.add(1).pow(0.1)}
          if(eff.gte(new Decimal("1e100"))) {
            eff = new Decimal("1e100").times(eff.div(new Decimal("1e100")).pow(0.1))
          }
          return eff
        },
        effectDisplay() {return format(upgradeEffect(this.layer, this.id)) + "x"},
      },
      23: {
        name: "房子",
        title: "房子",
        description: "对于每一个 WU，使点数和 WP 乘以 2",
        cost: new Decimal("40000"),
        effect() {
          mult = new Decimal("1")
          multBase = new Decimal("2")
          multMult = new Decimal("1")

          if(hasUpgrade('p', 32)) {
            if(hasUpgrade('p', 33)) multBase = multBase.times(upgradeEffect('p', 32))
            else multBase = multBase.add(upgradeEffect('p', 32))
          }
          if(hasUpgrade('p', 31)) multMult = multMult.times(upgradeEffect('p', 31))

          if(hasUpgrade('p', 11)) mult = mult.times(multBase)
          if(hasUpgrade('p', 12)) mult = mult.times(multBase)
          if(hasUpgrade('p', 13)) mult = mult.times(multBase)
          if(hasUpgrade('p', 21)) mult = mult.times(multBase)
          if(hasUpgrade('p', 22)) mult = mult.times(multBase)
          if(hasUpgrade('p', 23)) mult = mult.times(multBase)
          if(hasUpgrade('p', 31)) mult = mult.times(multBase)
          if(hasUpgrade('p', 32)) mult = mult.times(multBase)
          if(hasUpgrade('p', 33)) mult = mult.times(multBase)
          if(hasUpgrade("P", 24)) {
            if(hasUpgrade("P", 11)) mult = mult.times(multBase.pow(5)), multMult = multMult.pow(1.15)
            if(hasUpgrade("P", 12)) mult = mult.times(multBase.pow(5)), multMult = multMult.pow(1.15)
            if(hasUpgrade("P", 13)) mult = mult.times(multBase.pow(5)), multMult = multMult.pow(1.15)
            if(hasUpgrade("P", 14)) mult = mult.times(multBase.pow(5)), multMult = multMult.pow(1.15)
            if(hasUpgrade("P", 21)) mult = mult.times(multBase.pow(5)), multMult = multMult.pow(1.15)
            if(hasUpgrade("P", 22)) mult = mult.times(multBase.pow(5)), multMult = multMult.pow(1.15)
            if(hasUpgrade("P", 23)) mult = mult.times(multBase.pow(5)), multMult = multMult.pow(1.15)
            if(hasUpgrade("P", 24)) mult = mult.times(multBase.pow(5)), multMult = multMult.pow(1.15)
          }else {
            if(hasUpgrade("P", 11)) mult = mult.times(multBase.pow(5)), multMult = multMult.pow(1.1)
            if(hasUpgrade("P", 12)) mult = mult.times(multBase.pow(5)), multMult = multMult.pow(1.1)
            if(hasUpgrade("P", 13)) mult = mult.times(multBase.pow(5)), multMult = multMult.pow(1.1)
            if(hasUpgrade("P", 14)) mult = mult.times(multBase.pow(5)), multMult = multMult.pow(1.1)
            if(hasUpgrade("P", 21)) mult = mult.times(multBase.pow(5)), multMult = multMult.pow(1.1)
            if(hasUpgrade("P", 22)) mult = mult.times(multBase.pow(5)), multMult = multMult.pow(1.1)
            if(hasUpgrade("P", 23)) mult = mult.times(multBase.pow(5)), multMult = multMult.pow(1.1)
            if(hasUpgrade("P", 24)) mult = mult.times(multBase.pow(5)), multMult = multMult.pow(1.1)
          }
          mult = Decimal.pow(mult, multMult)
          if(mult.gte("1e50")) {mult = new Decimal("1e50").times(mult.div(new Decimal("1e50")).pow(0.3))}
          return mult
        },
        effectDisplay() {return format(upgradeEffect(this.layer, this.id)) + "x"},
      },
      31: {
        name: "村子",
        title: "村子使房子的数量增加",
        description: "使 WU23 的起效数量基于 WU 数量倍增",
        cost: new Decimal("1e12"),
        effect() {
          count = new Decimal("0")
          if(hasUpgrade('p', 11)) count = count.add(1)
          if(hasUpgrade('p', 12)) count = count.add(1)
          if(hasUpgrade('p', 13)) count = count.add(1)
          if(hasUpgrade('p', 21)) count = count.add(1)
          if(hasUpgrade('p', 22)) count = count.add(1)
          if(hasUpgrade('p', 23)) count = count.add(1)
          if(hasUpgrade('p', 31)) count = count.add(1)
          if(hasUpgrade('p', 32)) count = count.add(1)
          if(hasUpgrade('p', 33)) count = count.add(1)
          return Decimal.log2(count + 2)
        },
        effectDisplay() {return "^" + format(upgradeEffect(this.layer, this.id))},
      },
      32: {
        name: "扩张",
        title: "村子吸了人之后变大变高",
        description: "使 WU23 的基础基于 WP 加成",
        cost: new Decimal("1e54"),
        effect() {
          return Decimal.log10(Decimal.log10(player[this.layer].points + 10) + 10)
        },
        effectDisplay() {return "+" + format(upgradeEffect(this.layer, this.id))},
      },
      33: {
        name: "开放",
        title: "村子开放了！",
        description: "解锁飞机票（PT），WU32 效果变为乘法",
        cost: new Decimal("1e154"),
      },
    },
})

addLayer("P", {
  name: "飞机票", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: -50, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() { return {
    unlocked: false,
    points: new Decimal("0"),
  }},
  color: "#FFFFFF",
  requires: new Decimal("1e183"), // Can be a function that takes requirement increases into account
  resource: "飞机票", // Name of prestige currency
  baseResource: "WP", // Name of resource prestige is based on
  baseAmount() {return player['p'].points}, // Get the current amount of baseResource
  type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  canBuyMax() {
    return hasMilestone("P", 2)
  },
  exponent() {
    if(hasUpgrade("P", 14)) {return 2}
    if(hasUpgrade("P", 13)) {return 3}
    return 4
  }, // Prestige currency exponent
  base: 50,
  gainMult() { // Calculate the multiplier for main currency from bonuses
    mult = new Decimal("1")
    if(hasUpgrade("P", 22)) mult = mult.div(upgradeEffect("P", 22))
    if(hasUpgrade('T', 11)) mult = mult.div(new Decimal("2"))
    if(hasUpgrade("T", 13)) mult = mult.div(Decimal.log10(Decimal.log10(player['T'].points.add(10)).add(10)));
    return mult
  },
  gainExp() { // Calculate the exponent on main currency from bonuses
    return new Decimal("1")
  },
  row: 1, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {key: "p", description: "P: 重置以获得飞机票", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
  ],
  layerShown(){return hasUpgrade("p", 33) || hasUpgrade("P", 11) || player["P"].points.gte(1)},
  branches: ['p'],
  effectDescription() {
    if(hasUpgrade("P", 21)) return "加成 WP 获取 " + format(player["P"].points.add(1).pow(30)) + "x"
    return "加成 WP 获取 " + format(player["P"].points.add(1).pow(3)) + "x"
  },
  doReset(resettingLayer) {
    let keep = []
    if(layers[resettingLayer].row > this.row || layers[resettingLayer].id == 'T') {
      layerDatareset(this.layer, keep)
    }
  },
  upgrades: {
    11: {
      name: "如何获得飞机票，要先获得飞机票",
      title: "如何获得飞机票，要先获得飞机票",
      description: "PT 效果同时也在点数上生效，WP 乘以 4",
      cost: new Decimal(2),
      effectDisplay() {
        if(hasUpgrade("P", 21)) return format(player["P"].points.add(1).pow(30)) + "x"
        return format(player["P"].points.add(1).pow(3)) + "x"
      }
    },
    12: {
      name: "点数 压倒 点数",
      title: "点数 压倒 点数",
      description: "使 WU13 和 WU21 变得更好（这是一个彩蛋。作者曾经玩过数字树，里面有一个挑战叫“点数 压倒 点数”，该升级因此得名）",
      cost: new Decimal(3)
    },
    13: {
      name: "为什么这里会有飞机场？",
      title: "为什么这里会有飞机场？",
      description: "使 WU12 和 WU22 变得更好（《四 世 同 堂》），并增幅 PT 获取",
      cost: new Decimal(4)
    },
    14: {
      name: "《航 站 楼 住 宿》",
      title: "《航 站 楼 住 宿》",
      description: "使 PU 也参与 WU23 的计算，且效果更强，并增幅 PT 获取",
      cost: new Decimal(6)
    },
    21: {
      name: "高 航站楼 制作群",
      title: "高 航站楼 制作群",
      description: "使 PT 效果提升至 10 次方",
      cost: new Decimal(17)
    },
    22: {
      name: "更多航班",
      title: "更多航班",
      description: "航班变多了，使点数增幅 PT 获取",
      cost: new Decimal(21),
      effect() {
        return Decimal.log10(Decimal.log10(Decimal.log10(player.points.add(10)).add(10)).add(10))
      },
      effectDisplay() {
        return format(upgradeEffect(this.layer, this.id)) + 'x'
      }
    },
    23: {
      name: "大型飞机",
      title: "大型飞机",
      description: "飞机变大变高了，使 PT 增幅 WU23",
      cost: new Decimal(25)
    },
    24: {
      name: "更多的交通方式",
      title: "出现了更多的交通方式", 
      description: "解锁个人（I)、火车票（TT），PU23 变得更强",
      cost: new Decimal(30)
    }
  },
  milestones: {
    0: {
      requirementDescription: "获得 3 个飞机票（PM1）",
      effectDescription: "获得飞机票时不重置 WU",
      done() {return player[this.layer].points.gte(3)}
    },
    1: {
      requirementDescription: "获得 5 个飞机票（PM2）",
      effectDescription: "每秒获得 100% 重置时获得的 WP",
      done() {return player[this.layer].points.gte(5)}
    },
    2: {
      requirementDescription: "获得 25 个飞机票（PM3）",
      effectDescription: "可以购买最大 PT",
      done() {return player[this.layer].points.gte(25)}
    }
  }
})
addLayer('T', {
  name: "火车票",
  symbol: 'T',
  position: 50,
  startData() {return {
    unlocked: false,
    points: new Decimal("0")
  }},
  color: "#CCFCCF",
  requires: new Decimal("1e11202"),
  resource: "火车票",
  baseResource: "WP",
  baseAmount() {return player['p'].points},
  type: "normal",
  exponent: 0.1,
  gainMult() {
    mult = new Decimal("1")
    if(hasUpgrade('I', 12)) mult = mult.times("2")
    if(hasUpgrade('T', 11)) mult = mult.times("2")
    if(hasUpgrade('T', 12)) mult = mult.times(Decimal.log10(player['T'].points.add(10)))
    return mult
  },
  gainExp() {
    exp = new Decimal("1")
    return exp
  },
  row: 1,
  hotkeys: [
    {key: "t", description: "T: 重置以获得火车票", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
  ],
  layerShown(){return hasUpgrade("P", 24)},
  branches: ['p', 'P'],
  upgrades: {
    11: {
      name: "风景",
      title: "风景",
      description: "使 TT 乘以 2，使 PT 乘以 2，使 TT 加成 I 获取，使 IU12 的效果在点数 SC1 之后再次生效",
      cost() {
        return new Decimal(20).times(new Decimal(1 + hasUpgrade('T', 12) + hasUpgrade('T', 13) + hasUpgrade('T', 14)))
      },
      effectDisplay() {return format(player['T'].points.add(1).pow(0.5)) + 'x'}
    },
    12: {
      name: "便宜的票价",
      title: "便宜的票价",
      description: "使 TT 增幅 TT 获取",
      cost() {
        return new Decimal(20).times(new Decimal(1 + hasUpgrade('T', 11) + hasUpgrade('T', 13) + hasUpgrade('T', 14)))
      },
      effectDisplay() {return format(Decimal.log10(player['T'].points.add(10))) + 'x'}
    },
    13: {
      name: "稳定",
      title: "稳定",
      description: "使 TT 增幅 PT 获取（注意是 PT）",
      cost() {
        return new Decimal(20).times(new Decimal(1 + hasUpgrade('T', 11) + hasUpgrade('T', 12) + hasUpgrade('T', 14)))
      },
      effectDisplay() {return format(Decimal.log10(Decimal.log10(player['T'].points.add(10)).add(10)))}
    }
  }
})
addLayer('I', {
  name: "个人游客",
  symbol: 'I',
  position: -150,
  startData() {return {
    unlocked: false,
    points: new Decimal("0")
  }},
  color: "#EC1112",
  requires: new Decimal("81"),
  resource: "个人游客",
  baseResource: "PT",
  baseAmount() {return player['P'].points},
  type: "normal",
  exponent: 1,
  gainMult() {
    mult = new Decimal("1")
    if(hasUpgrade('T', 11)) mult = mult.times(player['T'].points.add(1).pow(0.5))
    if(hasUpgrade('I', 13)) mult = mult.times(Decimal.log10(player['p'].points.add(10)).pow(0.5));
    return mult
  },
  gainExp() {
    exp = new Decimal("1")
    return exp
  },
  passiveGeneration() {
    if(hasUpgrade("I", 11)) {return new Decimal("1000")}
    return new Decimal("0")
  },
  row: 1,
  hotkeys: [
    {key: "i", description: "I: 重置以获得个人游客", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
  ],
  layerShown(){return hasUpgrade("P", 24)},
  branches: ['P'],
  upgrades: {
    11: {
      name: "《天 津 中 考 树》",
      title: "《天 津 中 考 树》",
      description: "在天津中考树中，可以手动学习到 1000 语文知识。所以每秒获得 1000 倍重置获得的 I",
      cost: new Decimal("1000")
    },
    12: {
      name: "建造铁轨！",
      title: "建造铁轨！",
      description: "铁轨出现了，使 TT 获取量乘以 2 并使 I 增幅点数获取",
      cost: new Decimal("10000"),
      effect() {
        return player[this.layer].points.add(1).pow(0.8)
      },
      effectDisplay() {
        return format(upgradeEffect(this.layer, this.id)) + 'x'
      }
    },
    13: {
      name: "受众广泛化",
      title: "受众广泛化",
      description: "广泛的受众使 WP 提升 I",
      cost: new Decimal("2200000"),
      effectDisplay() {
        return format(Decimal.log10(player['p'].points.add(10)).pow(0.5)) + 'x'
      }
    },
  }
})