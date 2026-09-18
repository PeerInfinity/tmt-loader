// (although it can mess with this at times) - you can use the lambda format (() => returnValue) instead of the function format (function() { return returnValue }) in your display stuff
addLayer("m", {
    name: "Makers",
    symbol: "M",
    position: 0,
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#fff",
    requires: new Decimal(25),
    resource: "Makers",
    baseResource: "Planck Lengths",
    baseAmount() {return player.points},
    type: "normal",
    exponent: 0.05,
    softcap: new Decimal(1e3),
    softcapPower: new Decimal(0.25),
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('m', 22)) mult = mult.mul(upgradeEffect('m', 22))
        if (hasUpgrade('m', 33)) mult = mult.mul(upgradeEffect('m', 33))
        if (hasUpgrade('d', 11)) mult = mult.mul(upgradeEffect('d', 11))
        if (hasUpgrade('d', 33)) mult = mult.pow(upgradeEffect('d', 33))
        return mult
    },
    gainExp() {
        let exp = new Decimal(1)
        if (hasChallenge('m',32)) exp = exp.add(0.25)
        return exp
    },
    row: 0,
    hotkeys: [{key: "m", description: "M - Makes a maker", onPress(){if (canReset(this.layer)) doReset(this.layer)}}], 
    layerShown(){return true},
    passiveGeneration() {if(hasUpgrade('m',32)) return new Decimal(10)},

    automate() {
        if(hasMilestone('m',2)) {buyBuyable('m',11)}
        if(hasMilestone('m',3)) {buyBuyable('m',12)}
    },

    doReset(resettingLayer) {
        if(resettingLayer = 'd' && layers[resettingLayer].row>this.row) {
            let keepArr = []
            if(hasMilestone('d',1)) {keepArr.push("milestones")}
            layerDataReset(this.layer,keepArr)
        }
    },

    microtabs: {
        stuff: {
            "Buyables": { content: ["buyables"], unlocked() {return hasUpgrade('m',32) && !inChallenge('d',11)} },
            "Challenges": { content: ["challenges"], unlocked() {return hasUpgrade('m',31)} },
            "Milestones": { content: ["milestones"], unlocked() {return hasUpgrade('m',32) || hasMilestone('d',1)} },
            "Upgrades": { content: ["upgrades"] },
        }
    },
    
    tabFormat: {
        "Main": {
            content: ["main-display","prestige-button","blank",
            ["display-text", function() {return "You have <h3>"+format(player.points)+"</h3> PL."}],["microtabs","stuff"]]
        },
        "Effects": {
            content: ["main-display","prestige-button","blank",
            ["display-text", function() {return "You have <h3>"+format(player.points)+"</h3> PL."}],"blank",
            ["infobox","bm"],["infobox","cm"],["infobox","mm"],["infobox","um"]]
        }
    },
    
    upgrades: {
        11: {
            description: "m11: Maker?<br>Make makers useful.<br>PL gain is affected by Makers",
            cost: new Decimal(1),
            effect() {
                let a = new Decimal(0.5)
                if(hasUpgrade('m',12)) a = a.add(upgradeEffect('m',12))
                if(hasChallenge('m',11)) a = a.add(0.15)
                if(hasUpgrade('m',14)) a = a.add(upgradeEffect('m',14))
                // -----------------------------------------------------
                let b = new Decimal(1)
                if(hasUpgrade('m',41)) b = b.mul(2)
                // -----------------------------------------------------
                if(inChallenge('d',11)) return new Decimal(0)
                return player[this.layer].points.add(2).pow(a).mul(b)
            },
            effectDisplay() {
                let a = new Decimal(0.5)
                if(hasUpgrade('m',12)) a = a.add(upgradeEffect('m',12))
                if(hasChallenge('m',11)) a = a.add(0.15)
                if(hasUpgrade('m',14)) a = a.add(upgradeEffect('m',14))
                return "+"+format(upgradeEffect(this.layer,this.id))+"<br>(Exponent: "+format(a)+")"
            }
        },
        12: {
            description: "m12: 2SLOW4U<br>Increase m11's effect exponent by 0.25",
            cost: new Decimal(2),
            effect() {
                let x = new Decimal(0.25)
                if(hasUpgrade('m',13)) x = x.add(upgradeEffect('m',13))
                if(hasChallenge('m',11)) x = x.add(0.05)
                if(hasUpgrade('m',14)) x = x.add(upgradeEffect('m',14))
                return x
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer,this.id))},
            unlocked() {return hasUpgrade('m',11)}
        },
        13: {
            description: "m13: Another!<br>Increase m12's effect by 0.15",
            cost: new Decimal(5),
            effect() {
                let x = new Decimal(0.15)
                if(hasChallenge('m',11)) x = x.add(0.05)
                if(hasUpgrade('m',14)) x = x.add(upgradeEffect('m',14))
                return x
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer,this.id))},
            unlocked() {return hasUpgrade('m',12)}
        },
        14: {
            description: "m14: The fabled meta<br>Increase all previous buyables' effects/effect exponents by 0.1",
            cost: new Decimal(2e7),
            effect() {
                let x = new Decimal(0.1)
                if(hasUpgrade('d',42) && player.d.copies.pow(0.005).sub(1).gte(0)) x = x.add(player.d.copies.pow(0.005).sub(1))
                if(inChallenge('d',12)) x = new Decimal(0)
                if(hasChallenge('d',12)) x = x.mul(challengeEffect('d',12))
                return x
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer,this.id))},
            unlocked() {return hasUpgrade('d',22)}
        },
        21: {
            description: "m21: Finally<br>PL gain is multiplied",
            cost: new Decimal(10),
            effect() {
                let x = new Decimal(3)
                if(inChallenge('m',12)) x = new Decimal(1)
                if(hasChallenge('m',12)) x = x.pow(1.5)
                if(hasUpgrade('m',23)) x = x.mul(upgradeEffect('m',23))
                if(hasChallenge('m',31)) x = x.mul(4)
                if(hasUpgrade('m',24)) x = x.pow(upgradeEffect('m',24))
                return x
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer,this.id))},
            unlocked() {return hasUpgrade('m',12)}
        },
        22: {
            description: "m22: Annoying...<br>Makers upon reset are multiplied",
            cost: new Decimal(10),
            effect() {
                let x = new Decimal(3)
                if(inChallenge('m',12)) x = new Decimal(1)
                if(hasChallenge('m',12)) x = x.pow(1.5)
                if(hasUpgrade('m',23)) x = x.mul(upgradeEffect('m',23))
                if(hasChallenge('m',31)) x = x.mul(4)
                if(hasUpgrade('m',24)) x = x.pow(upgradeEffect('m',24))
                return x
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer,this.id))},
            unlocked() {return hasUpgrade('m',12)}
        },
        23: {
            description: "m23: Well...<br>Multiply m21 and m22's effects",
            cost: new Decimal(33),
            effect() {
                let x = new Decimal(2)
                if(inChallenge('m',12)) x = new Decimal(1)
                if(hasChallenge('m',12)) x = x.pow(1.5)
                if(inChallenge('m',12)) x = new Decimal(1)
                if(hasUpgrade('m',41)) x = x.mul(upgradeEffect('m',41))
                if(hasChallenge('m',31)) x = x.mul(4)
                if(hasUpgrade('m',24)) x = x.pow(upgradeEffect('m',24))
                return x
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer,this.id))},
            unlocked() {return hasUpgrade('m',22) && hasUpgrade('m',21)}
        },
        24: {
            description: "m24: We just need more<br>Raise m21-m23's effects to 1.75",
            cost: new Decimal(4e7),
            effect() {
                let x = new Decimal(1.75)
                if(inChallenge('d',12)) x = new Decimal(1)
                if(hasChallenge('d',12)) x = x.mul(challengeEffect('d',12))
                return x
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer,this.id))},
            unlocked() {return hasUpgrade('m',14)}
        },
        31: {
            description: "m31: Yeesh!<br>Unlock a challenge",
            cost: new Decimal(200),
            unlocked() {return hasUpgrade('m',23)}
        },
        32: {
            description: "m32: Why?<br>Unlock a buyable and a milestone, and passively generate Makers",
            cost: new Decimal(3333),
            unlocked() {return hasChallenge('m',12)}
        },
        33: {
            description: "m33: Finally!<br>Multiply Maker gain by m-buyables bought",
            cost: new Decimal(5e3),
            effect() {
                let a = getBuyableAmount('m',11).add(getBuyableAmount('m',12)).add(getBuyableAmount('m',13)).add(getBuyableAmount('m',21)).add(1)
                let b = getBuyableAmount('m',11).add(getBuyableAmount('m',12).mul(2)).add(getBuyableAmount('m',13).mul(5)).add(getBuyableAmount('m',21).mul(10)).mul(5).add(1)
                if(hasUpgrade('m',34)) a = a.pow(upgradeEffect('m',34)), b = b.pow(upgradeEffect('m',34))
                return (hasUpgrade('m',43) ? b : a)
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer,this.id))},
            unlocked() {return hasMilestone('m',1)}
        },
        34: {
            description: "m34: Copycat<br>Raise m33's effects to 1.75",
            cost: new Decimal(6e7),
            effect() {
                let x = new Decimal(1.75)
                if(inChallenge('d',12)) x = new Decimal(1)
                if(hasChallenge('d',12)) x = x.mul(challengeEffect('d',12))
                return x
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer,this.id))},
            unlocked() {return hasUpgrade('m',24)}
        },
        41: {
            description: "m41: Four?<br>m11 and m21-m23's effects are multiplied",
            cost: new Decimal(1.5e4),
            effect() {
                let x = new Decimal(2)
                return x
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer,this.id))},
            unlocked() {return hasUpgrade('m',33)}
        },
        42: {
            description: "m42: Not four.<br>Unlock two more challenges",
            cost: new Decimal(1e5),
            unlocked() {return hasUpgrade('m',41)}
        },
        43: {
            description: "m43: Finally!!<br>m33's effect is better, make the next layer visible, and unlock another challenge",
            cost: new Decimal(2500420),
            unlocked() {return hasUpgrade('m',42)},
            onPurchase() {player.d.unlocked = true}
        },
        44: {
            description: "m44: Powerful, isn't it<br>Raise m41's effects to 3",
            cost: new Decimal(77777777),
            effect() {
                let x = new Decimal(3)
                if(inChallenge('d',12)) x = new Decimal(0)
                if(hasChallenge('d',12)) x = x.mul(challengeEffect('d',12))
                return x
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer,this.id))},
            unlocked() {return hasUpgrade('m',34)}
        },
    },

    challenges: {
        11: {
            name: "Challenge m11: first!",
            challengeDescription() {return "<i>UPON ENTERING, YOUR MAKERS WILL RESET</i><br>PL gain is raised to the power of 0.5"},
            unlocked() {return hasUpgrade('m',31)},
            goalDescription: "100 PL",
            canComplete() {return player.points.gte(100)},
            rewardEffect() {new Decimal(0.05)},
            rewardDescription: "m11-m13 upgrades' effects increase by 0.05 each, and unlock a new challenge",
            onEnter() {
                player.points = new Decimal(0)
                player[this.layer].points = new Decimal(0)
            },
            onExit() {player.points = new Decimal(0)}
        },
        12: {
            name: "Challenge m12: disaster",
            challengeDescription() {return "Challenge m11's effect + m11-m13 does nothing"},
            unlocked() {return hasChallenge('m',11)},
            goalDescription: "2,500 PL",
            canComplete() {return player.points.gte(2.5e3)},
            rewardEffect() {new Decimal(1.5)},
            rewardDescription: "m11-m13 upgrades' effects are raised to 1.5, and unlock a new upgrade",
            countsAs: [11],
            onEnter() {player.points = new Decimal(0)},
            onExit() {player.points = new Decimal(0)}
        },
        21: {
            name: "Challenge m21: again",
            challengeDescription() {return "Challenge m12 + m11's exponent is halved"},
            unlocked() {return hasUpgrade('m',42)},
            goalDescription: "1,000,000,000 PL",
            canComplete() {return player.points.gte(1e9)},
            rewardEffect() {new Decimal(0.1)},
            rewardDescription: "m12's effect increases by 0.1",
            countsAs: [12],
            onEnter() {player.points = new Decimal(0)},
            onExit() {player.points = new Decimal(0)}
        },
        22: {
            name: "Challenge m22: binary?",
            challengeDescription() {return "Challenge m12, but point gain is raised to 0.33"},
            unlocked() {return hasUpgrade('m',42)},
            goalDescription: "11,111 PL",
            canComplete() {return player.points.gte(11111)},
            rewardEffect() {new Decimal(1.11)},
            rewardDescription: "PL gain is raised to 1.11",
            countsAs: [12],
            onEnter() {player.points = new Decimal(0)},
            onExit() {player.points = new Decimal(0)}
        },
        31: {
            name: "Challenge m31: finals?",
            challengeDescription() {return "Challenge m21, but point gain is square-rooted after the effect"},
            unlocked() {return hasChallenge('m',21) && hasChallenge('m',22)},
            goalDescription: "15,000 PL",
            canComplete() {return player.points.gte(1.5e4)},
            rewardEffect() {new Decimal(4)},
            rewardDescription: "Buyable m11 and m21-m23's upgrade effects are quadrupled, and Buyable m11 is cheapened",
            countsAs: [21],
            onEnter() {player.points = new Decimal(0)},
            onExit() {player.points = new Decimal(0)}
        },
        32: {
            name: "Challenge m32: truly",
            challengeDescription() {return "Challenge m22 AND Challenge m31's effects are combined"},
            unlocked() {return hasUpgrade('m',43)},
            goalDescription: "1,000 PL",
            canComplete() {return player.points.gte(1e3)},
            rewardEffect() {new Decimal(1.25)},
            rewardDescription: "Maker gain is raised to 1.25",
            countsAs: [22,31],
            onEnter() {player.points = new Decimal(0)},
            onExit() {player.points = new Decimal(0)}
        }
    },
    
    buyables: {
        11: {
            title: "Buyable m11: very humble beginnings",
            cost() {
                let x = new Decimal(3).pow(getBuyableAmount(this.layer,this.id)).mul(50).div(buyableEffect('m',12))
                if(hasChallenge('m',31)) x = x.div(3)
                if(inChallenge('d',11)) x = new Decimal("1e69420")
                return x
            },
            purchaseLimit() {return new Decimal(3).add(getBuyableAmount('m',12))},
            display() {
                let a = this.cost()
                let b = getBuyableAmount(this.layer,this.id)
                let c = this.effect()
                let d = this.base()
                let e = this.purchaseLimit()
                return "Your very first buyable!<br>x"+format(d)+" to PL gain<br>Cost: "+format(a)+"<br>Amount: "+format(b)+" out of "+format(e)+"<br>Effect: "+format(c)+""
            },
            canAfford() {return player[this.layer].points.gte(this.cost())},
            buy() {
                if(hasMilestone('m',2)) {setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1))}
                else player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1))
            },
            effect() {
                let x = this.base().pow(getBuyableAmount(this.layer,this.id))
                if(hasChallenge('m',31)) x = x.mul(4)
                if(hasChallenge('d',11)) x = x.pow(1.5)
                return x
            },
            base() {return new Decimal(1.23).add(buyableEffect('m',13))},
            unlocked() {return hasUpgrade('m',32)}
        },
        12: {
            title: "Buyable m12: Cheaper is Better",
            cost() {
                let x = new Decimal(3).add(getBuyableAmount(this.layer,this.id))
                return x
            },
            display() {
                let a = this.base()
                let b = this.cost()
                let c = getBuyableAmount(this.layer,this.id)
                let d = this.effect()
                let e = this.bbf()
                if(getBuyableAmount('m',21).gte(1)) return "Another buyable that cheapens the cost of the previous buyable by "+format(a)+"<br>Cost: "+format(b)+"<br>Amount: "+format(c)+" + "+format(e)+"<br>Effect: "+format(d)+""
                else return "Another buyable that cheapens the cost of the previous buyable by "+format(a)+"<br>Cost: "+format(b)+"<br>Amount: "+format(c)+"<br>Effect: "+format(d)+""
            },
            canAfford() {return getBuyableAmount('m',11).gte(this.cost())},
            buy() {
                if(hasMilestone('m',3)) setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1))
                else setBuyableAmount('m',11,getBuyableAmount('m',11).sub(this.cost()))
                setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1))
            },
            effect() {return this.base().pow(this.power())},
            base() {return new Decimal(1.11).add(buyableEffect('m',13))},
            power() {
                let x = getBuyableAmount(this.layer,this.id)
                if(getBuyableAmount('m',21).gte(0)) x = x.add(buyableEffect('m',21))
                return x
            },
            bbf() {
                let x = buyableEffect('m',21)
                return x
            },
            unlocked() {return hasMilestone('m',0)}
        },
        13: {
            title: "Buyable m13: This Again",
            cost() {
                let x = new Decimal(3).add(getBuyableAmount(this.layer,this.id).mul(2))
                return x
            },
            purchaseLimit() {return new Decimal(5).add(buyableEffect('m',21))},
            display() {
                let a = this.base()
                let b = this.cost()
                let c = getBuyableAmount(this.layer,this.id)
                let d = this.effect()
                let e = this.purchaseLimit()
                return "Increase the base of the previous buyables by "+format(a)+"<br>Cost: "+format(b)+"<br>Amount: "+format(c)+" out of "+format(e)+"<br>Effect: "+format(d)+""
            },
            canAfford() {return getBuyableAmount('m',12).gte(this.cost())},
            buy() {
                setBuyableAmount('m',12,getBuyableAmount('m',12).sub(this.cost()))
                setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1))
            },
            effect() {return this.base().mul(getBuyableAmount(this.layer,this.id))},
            base() {return new Decimal(0.02)},
            unlocked() {return hasMilestone('m',1)}
        },
        21: {
            title: "Buyable m21: a new era",
            cost() {
                let x = new Decimal(5).add(getBuyableAmount(this.layer,this.id))
                return x
            },
            purchaseLimit() {return new Decimal(2)},
            display() {
                let a = this.base()
                let b = this.cost()
                let c = getBuyableAmount(this.layer,this.id)
                let d = this.effect()
                let e = this.purchaseLimit()
                return "Get free Buyable m12s and increase the purchase limit of the previous buyable by +"+format(a)+"<br>Requirement: "+format(b)+"<br>Amount: "+format(c)+" out of "+format(e)+"<br>Effect: +"+format(d)+""
            },
            canAfford() {return getBuyableAmount('m',13).gte(this.cost())},
            buy() {
                setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1))
            },
            effect() {return this.base().mul(getBuyableAmount(this.layer,this.id))},
            base() {return new Decimal(1).floor()},
            unlocked() {return hasMilestone('m',2)}
        }
    },
    
    milestones: {
        0: {
            requirementDescription: "Milestone m0 - 3 Buyable m11",
            effectDescription: "Unlock another buyable",
            done() {return getBuyableAmount('m',11).gte(3)},
            unlocked() {return hasUpgrade('m',32)}
        },
        1: {
            requirementDescription: "Milestone m1 - 3 Buyable m12",
            effectDescription: "Unlock another buyable and more upgrades",
            done() {return getBuyableAmount('m',12).gte(3)},
            unlocked() {return hasMilestone('m',0)}
        },
        2: {
            requirementDescription: "Milestone m2 - 3 Buyable m13 + Challenge m31",
            effectDescription: "Unlock a buyable, automate Buyable m11, and it doesn't cost anything",
            done() {return getBuyableAmount('m',13).gte(3) && hasChallenge('m',31)},
            unlocked() {return hasChallenge('m',31)}
        },
        3: {
            requirementDescription: "Milestone m3 - 2 Buyable m21",
            effectDescription: "Automation also applies to Buyable m12, and it doesn't cost anything",
            done() {return getBuyableAmount('m',21).gte(2)},
            unlocked() {return hasMilestone('m',2)}
        }
    },

    infoboxes: {
        bm: {
            title: "Buyable Effects",
            body() {
                let a = (hasUpgrade('m',32) ? "buyable m11 is multiplying PL gain by <h3>"+format(buyableEffect('m',11))+"</h3><br>" : "")
                let b = (hasMilestone('m',0) ? "buyable m12 is cheapening the previous buyable by <h3>"+format(buyableEffect('m',12))+"</h3><br>" : "")
                let c = (hasMilestone('m',1) ? "buyable m13 is adding <h3>"+format(buyableEffect('m',13))+"</h3> to the previous buyables' bases<br>" : "")
                let d = (hasMilestone('m',2) ? "<br>buyable 21 is making free buyable m12s and increasing the purchase limit of buyable m13 by <h3>"+format(buyableEffect('m',21))+"</h3>" : "")
                return `${a}${b}${c}${d}`
            },
            unlocked() {return hasUpgrade('m',32)}
        },
        cm: {
            title: "Challenge Effects",
            body() {
                let a = (hasChallenge('m',11) ? "challenge m11 is increasing m11-m13's upgrades' effects by <h3>0.05</h3><br>" : "")
                let b = (hasChallenge('m',12) ? "challenge m12 is raising m21-m23's upgrades' effects by <h3>1.5</h3><br>" : "")
                let c = (hasChallenge('m',21) ? "<br>challenge m21 is increasing m12's effect by <h3>0.1</h3><br>" : "")
                let d = (hasChallenge('m',22) ? "challenge m22 is raising PL gain to <h3>1.11</h3><br>" : "")
                let e = (hasChallenge('m',31) ? "<br>challenge m31 is multiplying buyable m11 and m21-m23's effects, and cheapening buyable m11 by <h3>4</h3><br>" : "")
                let f = (hasChallenge('m',32) ? " challenge m32 is raising maker gain to <h3>1.25</h3><br>" : "")
                return `${a}${b}${c}${d}${e}${f}`
            },
            unlocked() {return hasUpgrade('m',31)}
        },
        mm: {
            title: "Milestone Effects",
            body() {
                let a = (hasMilestone('m',0) ? "milestone m0 unlocks a buyable<br>" : "")
                let b = (hasMilestone('m',1) ? "milestone m1 unlocks a buyable and some upgrades<br>" : "")
                let c = (hasMilestone('m',2) ? "milestone m2 unlocks a buyable, automates buyable m11, and makes its cost a requirement<br>" : "")
                let d = (hasMilestone('m',3) ? "milestone m3 makes buyable m12 automated and makes its cost a requirement<br>" : "")
                return `${a}${b}${c}${d}`
            },
            unlocked() {return hasUpgrade('m',32)}
        },
        um: {
            title: "Upgrade Effects",
            body() {
                let a = (hasUpgrade('m',11) ? "m11 adds <h3>"+format(upgradeEffect('m',11))+"</h3> to base PL gain<br>" : "nothing here yet, stop peeking and buy something")
                let b = (hasUpgrade('m',12) ? "m12 adds <h3>"+format(upgradeEffect('m',12))+"</h3> to m11's exponent<br>" : "")
                let c = (hasUpgrade('m',13) ? "m13 adds <h3>"+format(upgradeEffect('m',13))+"</h3> to m12 effect<br>" : "")
                let d = (hasUpgrade('m',14) ? "m14 adds <h3>"+format(upgradeEffect('m',14))+"</h3> to m11-m13 effects/effect exponent<br>" : "")
                let e = (hasUpgrade('m',21) ? "<br>m21 multiplies pl gain by <h3>"+format(upgradeEffect('m',21))+"</h3><br>" : "" )
                let f = (hasUpgrade('m',22) ? "m22 multiplies maker gain by <h3>"+format(upgradeEffect('m',22))+"</h3><br>" : "" )
                let g = (hasUpgrade('m',23) ? "m23 multiplies m21 and m22's effects by <h3>"+format(upgradeEffect('m',23))+"</h3><br>" : "" )
                let h = (hasUpgrade('m',24) ? "m24 raises m21-m23's effects by <h3>"+format(upgradeEffect('m',24))+"</h3><br>" : "" )
                let i = (hasUpgrade('m',32) ? "<br>m32 unlocks the ability to passively generate makers<br>" : "" )
                let j = (hasUpgrade('m',33) ? "m33 multiplies maker gain by <h3>"+format(upgradeEffect('m',33))+"</h3><br>" : "" )
                let k = (hasUpgrade('m',34) ? "m34 raises m33's effect by <h3>"+format(upgradeEffect('m',34))+"</h3><br>" : "" )
                let l = (hasUpgrade('m',41) ? "<br>m41 multiplies m11 and m21-m23's effects by <h3>"+format(upgradeEffect('m',41))+"</h3><br>" : "" )
                let m = (hasUpgrade('m',43) ? "m43 makes m33's effect better<br>" : "" )
                let n = (hasUpgrade('m',44) ? "m44 raises m41's effect by <h3>"+format(upgradeEffect('m',44))+"<br></h3>" : "" )
                return `${a}${b}${c}${d}${e}${f}${g}${h}${i}${j}${k}${l}${m}${n}`
            }
        }
    }
}),

addLayer("d", {
    name: "d",
    symbol: "D",
    position: 0,
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        copies: new Decimal(0),
        clicks: new Decimal(0),
        cpc: new Decimal(1),
        cm: new Decimal(0)
    }},
    layerShown() {return player.d.unlocked},
    color: "#1337af",
    requires: new Decimal(1e14),
    canBuyMax() {return true},
    resource: "Duplicators",
    baseResource: "Planck Lengths",
    baseAmount() {return player.points},
    type: "static",
    exponent: 5,
    base: 5,
    gainMult() {
        let mult = new Decimal(1)
        return mult
    },
    gainExp() {
        let exp = new Decimal(1)
        if(hasUpgrade('d',13)) exp = exp.mul(upgradeEffect('d',13))
        if(hasMilestone('d',2)) exp = exp.mul(2)
        return exp
    },
    effect() {
        let x = player[this.layer].points.mul(3)
        if(hasUpgrade('d',21)) x = x.pow(upgradeEffect('d',21))
        if(hasUpgrade('d',31)) x = x.mul(upgradeEffect('d',31))
        if(hasMilestone('d',100)) x = x.mul(clickableEffect('d',11).div(2))
        return x
    },
    update(diff) {
        player[this.layer].copies = player[this.layer].copies.add(this.effect().div(20))
        // player[this.layer].cm = clickableEffect('d',12)
        player[this.layer].cpc = clickableEffect('d',11).mul(player[this.layer].cm.add(1))
    },
    effectDescription() {return `which produce <h3>${format(this.effect())}</h3> copies every second.`},
    row: 1,
    hotkeys: [{key: "D", description: "D - Makes a duplicator", onPress(){if (canReset(this.layer)) doReset(this.layer)}}],
    branches: ["m"],
    microtabs: {
        stuff: {
            "Challenges": {content: ["challenges"], unlocked() {return hasUpgrade('d',42)}},
            "Clickables": {content: [["display-text", function() {return "Hold clickables and/or the Enter key to click them very fast!"}],"clickables"], unlocked() {return hasUpgrade('d',41)}},
            "Milestones": {content: ["milestones"]},
            "Upgrades": {content: ["upgrades"]}
        }
    },
    tabFormat: {
        "Main": {
            content: ["main-display","prestige-button","blank",
            ["display-text", function() {
                if(hasUpgrade('d',12)) return "You have <h3>"+format(player[this.layer].copies)+"</h3> copies. Look at the effects in the Effects subtab."
                if(hasUpgrade('d',11)) return "You have <h3>"+format(player[this.layer].copies)+"</h3> copies, which multiply Maker gain by "+format(upgradeEffect('d',11))+"."
                else return "You have <h3>"+format(player[this.layer].copies)+"</h3> copies."
            }],["microtabs","stuff"]]
        },
        "Effects": {
            content: ["main-display","prestige-button","blank",
            ["display-text", function() {
                if(hasUpgrade('d',12)) return "You have <h3>"+format(player[this.layer].copies)+"</h3> copies."
                if(hasUpgrade('d',11)) return "You have <h3>"+format(player[this.layer].copies)+"</h3> copies, which multiply Maker gain by "+format(upgradeEffect('d',11))+"."
                else return "You have <h3>"+format(player[this.layer].copies)+"</h3> copies."
            }],
            ["infobox","cd"],["infobox","cld"],["infobox","cpd"],["infobox","md"],["infobox","ud"]]
        }
    },
    upgrades: {
        11: {
            fullDisplay() {return "d11: Test reference<br>Make copies do something<br><br>Requirement: 50 copies<br>Effect: "+format(this.effect())},
            canAfford() {return player[this.layer].copies.gte(50)},
            pay() {return player[this.layer].copies.sub(50)},
            effect() {
                let x = player[this.layer].copies.add(1).log10().mul(5)
                if(hasUpgrade('d',23)) x = x.pow(upgradeEffect('d',23))
                return x
            }
        },
        12: {
            fullDisplay() {return "d12: Ah yes, repetitiveness<br>Give copies another effect<br><br>Requirement: 250 copies<br>Effect: "+format(this.effect())},
            canAfford() {return player[this.layer].copies.gte(250)},
            pay() {return player[this.layer].copies.sub(250)},
            effect() {
                let x = player[this.layer].copies.add(1).log10().mul(5).pow(2)
                if(hasUpgrade('d',22)) x = x.mul(upgradeEffect('d',22))
                if(hasUpgrade('d',23)) x = x.pow(upgradeEffect('d',23))
                return x
            },
            unlocked() {return hasUpgrade('d',11)}
        },
        13: {
            fullDisplay() {return "d13: Just one more...<br>Copies do something else<br><br>Requirement: 500 copies<br>Effect: "+format(this.effect())},
            canAfford() {return player[this.layer].copies.gte(500)},
            pay() {return player[this.layer].copies.sub(500)},
            effect() {
                let x = player[this.layer].copies.add(1).log10().add(1).log10().add(2)
                return x
            },
            unlocked() {return hasUpgrade('d',12)}
        },
        21: {
            fullDisplay() {return "d21: No effects for days!<br>Duplicators produce even more copies<br><br>Requirement: 1,000 copies<br>Effect: "+format(this.effect())},
            canAfford() {return player[this.layer].copies.gte(1e3)},
            pay() {return player[this.layer].copies.sub(1e3)},
            effect() {
                let x = new Decimal(2)
                return x
            },
            unlocked() {return hasUpgrade('d',13)}
        },
        22: {
            fullDisplay() {return "d22: Do something!<br>d12's effect is tripled, and there are more m-upgrades<br><br>Requirement: 3,333 copies<br>Effect: "+format(this.effect())},
            canAfford() {return player[this.layer].copies.gte(3333)},
            pay() {return player[this.layer].copies.sub(3333)},
            effect() {
                let x = new Decimal(3)
                return x
            },
            unlocked() {return hasUpgrade('d',21)}
        },
        23: {
            fullDisplay() {return "d23: Definitely lazy<br>The first and second Copy Effects are raised to 1.25<br><br>Requirement: 7,777 copies<br>Effect: "+format(this.effect())},
            canAfford() {return player[this.layer].copies.gte(7777)},
            pay() {return player[this.layer].copies.sub(7777)},
            effect() {
                let x = new Decimal(1.25)
                return x
            },
            unlocked() {return hasUpgrade('d',22)}
        },
        31: {
            fullDisplay() {return "d31: Finally!!!<br>Copy has another effect<br><br>Requirement: 16,000 copies<br>Effect: "+format(this.effect())},
            canAfford() {return player[this.layer].copies.gte(16e3)},
            pay() {return player[this.layer].copies.sub(16e3)},
            effect() {
                let x = player[this.layer].copies.pow(0.2)
                return x
            },
            unlocked() {return hasMilestone('d',1)}
        },
        32: {
            fullDisplay() {return "d32: Is it just<br>Points gain is raised to something based on itself<br><br>Requirement: 100,000 copies<br>Effect: "+format(this.effect())},
            canAfford() {return player[this.layer].copies.gte(1e5)},
            pay() {return player[this.layer].copies.sub(1e5)},
            effect() {
                let x = player.points.add(1).log10().pow(0.015)
                if(hasUpgrade('d',33)) x = x.pow(2)
                return x
            },
            unlocked() {return hasUpgrade('d',31)}
        },
        33: {
            fullDisplay() {return "d33: so annoying<br>Maker gain is raised to something based on itself, and square d32's effect<br><br>Requirement: 175,000 copies<br>Effect: "+format(this.effect())},
            canAfford() {return player[this.layer].copies.gte(175e3)},
            pay() {return player[this.layer].copies.sub(175e3)},
            effect() {
                let x = player.m.points.add(1).log10().pow(0.015).pow(2)
                return x
            },
            unlocked() {return hasUpgrade('d',32)}
        },
        41: {
            fullDisplay() {return "d41: boring<br>Click me to make a clickable!<br><br>Requirement: 333,333 copies"},
            canAfford() {return player[this.layer].copies.gte(333333)},
            pay() {return player[this.layer].copies.sub(333333)},
            unlocked() {return hasUpgrade('d',33)}
        },
        42: {
            fullDisplay() {return "d42: funni<br>Click me to make a challenge! ...and to give an effect to clicks and copies<br><br>Requirement: 11,111,111 copies"},
            canAfford() {return player[this.layer].copies.gte(11111111)},
            pay() {return player[this.layer].copies.sub(11111111)},
            unlocked() {return hasMilestone('d',100)}
        },
        43: {
            fullDisplay() {return "d43: name<br>PL boosts Maker gain, and unlock a new layer<br><br>Requirement: 101,010,101 copies<br>Effect: "+format(this.effect())},
            canAfford() {return player[this.layer].copies.gte(101010101)},
            pay() {return player[this.layer].copies.sub(101010101)},
            unlocked() {return hasUpgrade('d',42) && hasChallenge('d',12)},
            effect() {return player.points.pow(0.0101)},
            onPurchase() {player.r.unlocked = true}
        }
    },
    milestones: {
        0: {
            requirementDescription: "Milestone d0a - 1 Duplicator",
            effectDescription: "Duplicators produce copies",
            done() {return player[this.layer].points.gte(1)}
        },
        1: {
            requirementDescription: "Milestone d1a - 3 Duplicators",
            effectDescription: "Keep m-milestones on duplicator reset, unlock new duplicator upgrades",
            done() {return player[this.layer].points.gte(3)}
        },
        2: {
            requirementDescription: "Milestone d2a - Challenge d12x1 + d43",
            effectDescription: "Duplicator requirement exponent is halved and unlock another clickable",
            done() {return hasChallenge('d',12) && hasUpgrade('d',43)},
            unlocked() {return hasChallenge('d',12)}
        },
        100: {
            requirementDescription: "Milestone d0b - 9,999 Clicks",
            effectDescription: "Give clicks some effects, and unlock anoter duplicator upgrade",
            done() {return player[this.layer].clicks.gte(9999)},
            unlocked() {return hasUpgrade('d',41)}
        }
    },
    clickables: {
        11: {
            display() {return "Clickable d11 - generic<br>Clicks: "+format(player[this.layer].clicks)+" (+"+format(player[this.layer].cpc)+")<br> Effect: "+format(this.effect())},
            onHold() {this.onClick()},
            onClick() {return player[this.layer].clicks = player[this.layer].clicks.add(player[this.layer].cpc)},
            effect() {
                let x = player[this.layer].clicks.add(1).pow(0.5).div(2).add(1)
                return x
            },
            canClick() {return true},
            unlocked() {return hasMilestone('d',1)}
        },
        12: {
            display() {return "Clickable d12 - multiplier<br>Clicks gain multiplier: "+format(player[this.layer].cm.add(1))},
            onHold() {this.onClick()},
            onClick() {return player[this.layer].cm = player[this.layer].cm.add(1).pow(0.9)},
            effect() {
                let x = player[this.layer].cm.pow(0.1).add(1)
                return x
            },
            canClick() {return true},
            unlocked() {return hasMilestone('d',2)}
        }
    },
    challenges: {
        11: {
            name: "Challenge d11: first-ed",
            challengeDescription() {return "Buyable m11 and m11 do nothing"},
            unlocked() {return hasUpgrade('d',42)},
            goalDescription: "1,111,111,111 PL",
            canComplete() {return player.points.gte(1111111111)},
            rewardEffect() {new Decimal(0.05)},
            rewardDescription: "Buyable m11's effect is raised to 1.5",
            onEnter() {
                player.points = new Decimal(0)
                player.m.points = new Decimal(0)
                setBuyableAmount('m',11,new Decimal(0))
            },
            onExit() {
                player.points = new Decimal(0)
                player.m.points = new Decimal(0)
                setBuyableAmount('m',11,new Decimal(0))
            }
        },
        12: {
            name: "Challenge d12: column",
            completionLimit: new Decimal(2),
            challengeDescription() {return "Challenge d11, m-column 4 (1-4) doesn't exist, and point gain is raised to " +
                (new Decimal(challengeCompletions('d',12)).eq(1) ? "0.25" : "0.5") +
                "<br>You have completed this "+challengeCompletions('d',12)+" out of "+this.completionLimit+" times"},
            unlocked() {return hasChallenge('d',11)},
            goalDescription() {return (new Decimal(challengeCompletions('d',12)).eq(1) ? "12,345" : "1e6") + " PL"},
            canComplete() {
                if(new Decimal(challengeCompletions('d',12)).eq(0)) return player.points.gte(1e6)
                if(new Decimal(challengeCompletions('d',12)).eq(1)) return player.points.gte(12345)
                else return player.points.gte("(e^69420)1337")
            },
            rewardEffect() {
                let x = new Decimal(0)
                if(new Decimal(challengeCompletions('d',12)).eq(1)) x = player.points.pow(0.0004)
                if(new Decimal(challengeCompletions('d',12)).eq(2)) x = player.points.pow(0.0008)
                return x
            },
            rewardDescription() {return "m-column 4 (1-4) upgrade effects are increased based on points" +
                (hasChallenge(this.layer,this.id) ? `<br>Effect: ${format(this.rewardEffect())}` : "")},
            onEnter() {
                player.points = new Decimal(0)
                player.m.points = new Decimal(0)
                setBuyableAmount('m',11,new Decimal(0))
            },
            onExit() {
                player.points = new Decimal(0)
                player.m.points = new Decimal(0)
                setBuyableAmount('m',11,new Decimal(0))
            },
            countsAs: [11]
        }
    },
    infoboxes: {
        md: {
            title: "Milestone Effects",
            body() {
                let a = (hasMilestone('d',0) ? `milestone d0a makes duplicators produce copies` : "")
                let b = (hasMilestone('d',1) ? `<br>milestone d1a unlocks more duplicator upgrades and keeps maker milestones on reset` : "")
                let c = (hasMilestone('d',2) ? `<br>milestone d2a halves duplicator requirement exponent and unlocks a new clickable` : "")
                let aac = (hasMilestone('d',100) ? `<br>milestone d0b unlocks a duplicator upgrade and gives clicks an effect<br>` : "")
                return `${a}${b}${c}${aac}`
            }
        },
        cd: {
            title: "Challenge Effects",
            body() {
                let a = (hasChallenge('d',11) ? `challenge d11 raises buyable m11's effect by <h3>1.5</h3>` : "")
                let b = (hasChallenge('d',12) ? `<br>challenge d12 multiplies m-column 4 (1-4)'s effects by <h3>${format(new Decimal(challengeEffect('d',12)).sub(1).mul(100))}%</h3>` : "")
                return `${a}${b}`
            },
            unlocked() {return hasChallenge('d',11)}
        },
        cld: {
            title: "Click Effects",
            body() {
                let a = (hasUpgrade('d',41) ? `clicks multiply its gain by <h3>${format(clickableEffect('d',11))}</h3>` : "")
                let b = (hasMilestone('d',100) ? `,<br> multiplies copy gain by <h3>${format(clickableEffect('d',11).div(2))}</h3>` : "")
                let c = (hasUpgrade('d',42) ? `,<br> raises pl gain to <h3>${format(clickableEffect('d',11).pow(0.033))}</h3>` : "")
                return `${a}${b}${c}`
            },
            unlocked() {return hasUpgrade('d',41)}
        },
        cpd: {
            title: "Copy Effects",
            body() {
                let a = (hasUpgrade('d',11) ? `copies multiply maker gain by <h3>${(format(upgradeEffect('d',11)))}</h3>` : "")
                let b = (hasUpgrade('d',12) ? `,<br> multiply pl gain by <h3>${(format(upgradeEffect('d',12)))}</h3>` : "" )
                let c = (hasUpgrade('d',13) ? `,<br> divide Duplicator's cost exponent by <h3>${(format(upgradeEffect('d',13)))}</h3>` : "" )
                let d = (hasUpgrade('d',31) ? `,<br> multiplies copy gain by <h3>${format(upgradeEffect('d',31))}</h3>` : "" )
                let e = (hasUpgrade('d',42) ? `,<br> adds <h3>${format(player[this.layer].copies.pow(0.005).sub(1))}</h3> to m14's effect` : "" )
                return `${a}${b}${c}${d}${e}`
            },
            unlocked() {return hasUpgrade('d',11)}
        },
        ud: {
            title: "Upgrade Effects",
            body() {
                let a = (hasUpgrade('d',21) ? `d21 raises copy gain to <h3>${format(upgradeEffect('d',21))}</h3>` : "" )
                let b = (hasUpgrade('d',22) ? `<br>d22 unlocks m-column 4 and multiplies the second copy effect by <h3>${format(upgradeEffect('d',22))}</h3>` : "" )
                let c = (hasUpgrade('d',23) ? `<br>d23 raises the first and second copy effect to <h3>${format(upgradeEffect('d',23))}</h3>` : "" )
                let d = (hasUpgrade('d',32) ? `<br><br>d32 raises pl gain to <h3>${format(upgradeEffect('d',32))}</h3>` : "" )
                let e = (hasUpgrade('d',33) ? `<br>d33 raises maker gain to <h3>${format(upgradeEffect('d',33))}</h3>` : "" )
                let f = (hasUpgrade('d',43) ? `<br><br>d43 multiplies maker gain by <h3>${format(upgradeEffect('d',43))}</h3>` : "")
                return `${a}${b}${c}${d}${e}${f}`
            },
            unlocked() {return hasUpgrade('d',21)}
        }
    }
}),

addLayer("r", {
    name: "r",
    symbol: "R",
    position: 1,
    row: 1,
    startData() { return {
        unlocked: false,
        points: new Decimal(0)
    }},
    branches: ['m'],
    layerShown() {return player.r.unlocked},
    color: "#f48",
    requires: new Decimal("(e^123)123"),
    canBuyMax() {return false},
    resource: "Replicantis",
    baseResource: "Makers",
    baseAmount() {return player.m.points},
    type: "static",
    exponent: 123,
    base: 123,
    gainMult() {
        let mult = new Decimal(1)
        return mult
    },
    gainExp() {
        let exp = new Decimal(1)
        return exp
    },
    hotkeys: [{key: "R", description: "R - Make a replicator", onPress(){if(canReset(this.layer)) doReset(this.layer)}}]
})