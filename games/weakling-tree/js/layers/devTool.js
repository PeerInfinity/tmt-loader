addLayer("d", {
    name: "Dev Zone", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
    //row: "side", // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    position: 3,
    color: "#ffffffff",
    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("Dev Options")
    },
    tabFormat: {
        DevSpeed:{
            content: [["display-text", "Welcome to the Dev Center! In here, you can fiddle with some settings regarding the game!"],
            "blank",
            "clickables"
        ]},
        Autobuyers: {
            content: [["display-text", "<h3 style='text-shadow:0px 0px 10px;'>Here are some parameters for automating buyables.</h3>"],
            "blank",
            ["display-text", function() {
                return "<b style='text-shadow:0px 0px 10px;'>Mentality Strengthen</b> Count: "+getBuyableAmount("w",11)+
                "<br><b style='text-shadow:0px 0px 10px;'>Weakling Strengthen</b> Count: "+getBuyableAmount("w",12)+
                "<br><br>Current Mentality: "+format(player.w.MSStatus.points)+
                "<br>Which is enough to buy "+format(player.w.MSStatus.buyCount.sub(player.w.MSStatus.bought))+" <b style='text-shadow:0px 0px 10px;'>Mentality Strengthen</b> at once."+
                "<br>along with the total cost of "+format(tmp.w.MSCostDifference)+"."+
                "<br><br>Current Weakling Dust: "+format(player.w.WSStatus.points)+
                "<br>Which is enough to buy "+format(player.w.WSStatus.buyCount.sub(player.w.WSStatus.bought))+" <b style='text-shadow:0px 0px 10px;'>Weakling Strengthen</b> at once."+
                "<br>along with the total cost of "+format(tmp.w.WSCostDifference)+"."
                //"Projected chance for <b style=\"color: #d937faff;\">Evil Crystal</b>: "+format(one.sub(nonEvil))+"%.<br>"+
                //"Projected chance for Non-Evil Crystal: "+format(nonEvil)+"%."
            }],
            "blank",
            ["display-text",function() {
                let g = Decimal.pow(10,100/1.5)
                let f = new Decimal(60)
                let s = new Decimal(1e52)
                return "Currently, the test value is:"+
                "<br><h1 style=\"color: rgb(62, 194, 211);\">"+format(player.a.inChTime)+"</h1>"
            }],
            "blank",
            "milestones"
            ]
        },
        Upgrades:{
            content: ["upgrades"],
            buttonStyle: {'background':'rgba(206, 5, 5, 0.75)'}
        }
    },
    startData() {return {
        unlocked: true,
        counter: 0,
        countWhole: 0
    }
    },
    update(diff) {
        player.devSpeed = tmp.d.speedCalc
        if (getClickableState("d",31)==1) player.d.counter = player.d.counter + diff
        if (getClickableState("d",31)==0) player.d.countWhole = 0
        if(player.d.counter >= 0.2) {
            player.d.counter = 0
            player.d.countWhole++
        }
    },

    speedCalc() {
        let speed = new Decimal(1)
        if(getClickableState("d",11)) speed = new Decimal(0)
        if(getClickableState("d",12)) speed = new Decimal(10)
        if(getClickableState("d",13)) speed = new Decimal(100)
        if(getClickableState("d",22)) speed = new Decimal(0.1)
        if(getClickableState("d",23)) speed = new Decimal(0.01)
        return speed
    },
    clickables: {
        11: {
            title: "Pause",
            display: "Pause the game. Click it again to resume.",
            onClick() {
                if(getClickableState("d",11)==1) setClickableState("d",11,0)
                else setClickableState("d",11,1)
            },
            canClick() {
                if (getClickableState("d",12)==1 || getClickableState("d",13)==1) return false
                else return true
            },
            unlocked: true
        },
        12: {
            title: "10x speed",
            display: "Gives 10x Dev Speed.",
            onClick() {
                if(getClickableState("d",12)==1) setClickableState("d",12,0)
                else {
                    setClickableState("d",12,1)
                }
            },
            canClick() {
                if (getClickableState("d",11)==1 || getClickableState("d",13)==1) return false
                else return true
            },
            unlocked: true
        },
        13: {
            title: "100x speed",
            display: "Gives 100x Dev Speed.",
            onClick() {
                if(getClickableState("d",13)==1) setClickableState("d",13,0)
                else setClickableState("d",13,1)
            },
            canClick() {
                if (getClickableState("d",11)==1 || getClickableState("d",12)==1) return false
                else return true
            },
            unlocked: true
        },
        21: {
            title: "Magic Button",
            display: "It can fulfill a random rish...",
            onClick() {
                player.w.upgrades = [41,42,43,44,45]
            },
            canClick: true,
            unlocked: true
        },
        22: {
            title: "0.1x speed",
            display: "Gives 0.1x Dev Speed.",
            onClick() {
                if(getClickableState("d",22)==1) setClickableState("d",22,0)
                else setClickableState("d",22,1)
            },
            canClick() {
                if (getClickableState("d",11)==1 || getClickableState("d",12)==1) return false
                else return true
            },
            unlocked: true
        },
        23: {
            title: "0.01x speed",
            display: "Gives 0.01x Dev Speed.",
            onClick() {
                if(getClickableState("d",23)==1) setClickableState("d",23,0)
                else setClickableState("d",23,1)
            },
            canClick() {
                if (getClickableState("d",11)==1 || getClickableState("d",12)==1) return false
                else return true
            },
            unlocked: true
        },
        31: {
            title: "Start Counter",
            onClick() {
                setClickableState("d",31,1)
                player.d.counter = 0
            },
            canClick() {
                if (getClickableState("d",31)==1) return false
                else return true
            },
            unlocked: true
        },
        32: {
            title: "Stop Counter",
            onClick() {
                setClickableState("d",31,0)
            },
            canClick() {
                if (getClickableState("d",31)==0) return false
                else return true
            },
            unlocked: true
        },
    },
    milestones: {
        0: {
            requirementDescription: "30+ Crystal Shards",
            effectDescription: "Unlocks automation for <b>Mentality Strengthen</b> and <b>Weakling Strengthen</b>.",
            toggles:[["d","autoStrengthen"]],
            done() {return false}
        }
    },
    upgrades: {
        11: {
            title: "The Infinite Yearning",
            description: "+200% of kill count every time you defeat a person in the mines.",
            currencyDisplayName: "Evil Crystals",
            currencyInternalName: "ec",
            currencyLayer: "c",
            cost: new Decimal("9e99999"),
            effect() {
                let eff = Decimal.pow(3,1325)
                return eff
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {"background"() {
                return upgradeButtonStyle("c","d",11)
            }},
            unlocked: true
        }
    }
}) // Secret Option :)
// Now we have seperate files!