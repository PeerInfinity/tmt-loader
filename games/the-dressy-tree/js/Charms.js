addLayer("C", {
    position: 4, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    row: "side",
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        currentcharm: 'none',
        unlockedcharms: ["none"],
        charms: ["super", "hyper", "money", "point", "flipside"],
        charmeffects: {
            super: "which is increasing your super gain by 5x",
            hyper: "which is increasing your hyper gain by 2.5x",
            money: "which is increasing your money gain by 1e6x AND shopping buyables increase money gain",
            point: "which is increasing your point gain by 10x",
            flipside: "which is letting you see things you shouldn't see"
        },
        charmlevels: {
        
        },
        charmexp: {

        },
        charmexpformula: function() {
            if (player.C.charmlevels[player.C.currentcharm] != undefined && player.C.charmlevels[player.C.currentcharm].layer != undefined) {
                let level = player.C.charmlevels[player.C.currentcharm]
                return level.add(1).times(10)
            }
            else {
                return new Decimal(player.C.charmexp[player.C.currentcharm]).add(1)
            }
        },
        reset: function() {
            this.charmexp = {}
            this.charmlevels = {}
        }
    }},
    layerShown(){
        let visible = false
        if (player.L.levelprestige.gte(7)) visible = true
        return visible
    },
    name: "Charms", // This is optional, only used in a few places, If absent it just uses the layer id.
    resource: "Charm Points", // Name of prestige currency
    color: "rgb(255, 0, 0)",
    //requires: new Decimal(1), // Can be a function that takes requirement increases into account
    //baseResource: "", // Name of resource prestige is based on
    //baseAmount() {return player.points}, // Get the current amount of baseResource
    //type: "normal", // normal: cost to gain currency depends on amount ganed. static: cost depends on how much you already have
    //exponent: 1.72, // Prestige currency exponent
    //passiveGeneration() {
        //return 1
    //},
    gainMult() {
        return new Decimal(0)
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    tabFormat: {
        "Charms": {
            content: [
                "main-display",
                ["clickables",[1]],
                "blank",
                ["display-text",
                    function(){
                        if (player.C.currentcharm == "none") {
                            let txt = "<h4>You have no charm equipped "
                            return txt
                        }
                        else if (player.C.unlockedcharms.includes(player.C.currentcharm)) {
                            let txt = '<h4>You currently have <b style="color: '+tmp.C.color+';">'+player.C.currentcharm+'</b> equipped '+player.C.charmeffects[player.C.currentcharm]
                            return txt
                        }
                        else {
                            let txt = "<h4>You do not have "+player.C.currentcharm+" meaning it is not giving you any effect"
                            return txt
                        }    
                    }
                ],
                "blank",
                ["raw-html",
                    `<select id="charm">
                        <option value="none" selected>None</option>
                        <option value="point">Point</option>
                        <option value="super">Super</option>
                        <option value="hyper">Hyper</option>
                        <option value="money">Capitalism</option>
                        <option value="flipside">Flipside</option>
                        
                    </select>`],
                "blank",
                ["bar", "exp"],
                "blank",    
                ["upgrades", [1,2]]
            ],
        },
    },
    upd() {
        if (typeof player.C.charmexp[player.C.currentcharm] == "string") {
            player.C.charmexp[player.C.currentcharm] = new Decimal(player.C.charmexp[player.C.currentcharm])
        }
        if (typeof player.C.charmlevels[player.C.currentcharm] == "string") {
            player.C.charmlevels[player.C.currentcharm] = new Decimal(player.C.charmlevels[player.C.currentcharm])
        }
        if (player.C.charmexp[player.C.currentcharm] == undefined) {
            player.C.charmexp[player.C.currentcharm] = new Decimal(0)
        }
        if (player.C.charmlevels[player.C.currentcharm] == undefined) {
            player.C.charmlevels[player.C.currentcharm] = new Decimal(0)
        }
        else if (player.C.currentcharm == 'none') {
            player.C.charmlevels[player.C.currentcharm] = new Decimal(0)
        }
    },

    levelupd() {
        if (player.C.charmexp[player.C.currentcharm].gte(player.C.charmexpformula(player.C.charmlevels[player.C.currentcharm]))) {
            player.C.charmexp[player.C.currentcharm] = new Decimal(0)
            player.C.charmlevels[player.C.currentcharm] = player.C.charmlevels[player.C.currentcharm].add(1)
        }
    },

    flipside() {
        if (player.C.currentcharm == "flipside") {
            player.layerview = 1
        }
        else {
            player.layerview = 0
        }
    },
    bars: {
        exp: {
            direction: RIGHT,
            width: 600,
            height: 60,
            fillStyle: { 'background-color': "red" },
            borderStyle() { return { "border-color": "white" } },
            progress() {
                let prog = player.C.charmexp[player.C.currentcharm]/player.C.charmexpformula()
                return prog
            },
            display() {
                return "Level: "+player.C.charmlevels[player.C.currentcharm]+" /////  Exp: "+player.C.charmexp[player.C.currentcharm]+"/"+player.C.charmexpformula(player.C.charmexp[player.C.currentcharm])+""
            }
        },
    },
    buyables: {
        11: {
            title: "<br>Minigame booster<br>",
            cost(x) { return new Decimal(x).pow(2) },
            display() { return "Boosts minigame point gain<br>" + "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + "<br>Currently: " + format(buyableEffect("Mi",11))+"x" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {

                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() {return new Decimal(2).pow(getBuyableAmount("Mi",11).add(1).times(player.Mi.buyableboost).log(2))},
        },
    },
    clickables: {
        11: {
            display() {
                if (document.getElementById("charm")) {
                    return "<h2>Equip "+document.getElementById("charm").value +"</h2>"
                }
                else {
                    return "<h2>Equip "+"please wait..."+"</h2>"
                }
            },
            canClick() {return true},
            onClick() {
                if (player.C.unlockedcharms.includes(document.getElementById("charm").value)) {
                    player.C.currentcharm = document.getElementById("charm").value
                }},

            style() {return {
                
            }},
        },

    },
    upgrades: { 
        11: {
            currencyname: "Air",
            required: new Decimal(0),
            fullDisplay() {
                return `<h3>Leveling Charm</h3>\n
                 <br>
                
                \n<p>Unlock the Leveling Charm</p>
                <p>Costs `+format(this.required)+` `+this.currencyname+`</p>`
            },
            canAfford() {
                return true
            },
            onPurchase() {
                player.C.unlockedcharms.push("leveling")
            },
        },
        12: {
            currencyname: "Super",
            required: new Decimal(1e40),
            fullDisplay() {
                return `<h3>Super Charm</h3>\n
                 <br>
                
                \n<p>Unlock the Super Charm</p>
                <p>Costs `+format(this.required)+` `+this.currencyname+`</p>`
            },
            canAfford() {
                return player.S.points.gte(this.required)
            },
            onPurchase() {
                player.S.points = player.S.points.sub(this.required)
                player.C.unlockedcharms.push("super")
            },
        },
        13: {
            currencyname: "Hyper",
            required: new Decimal(1e8),
            fullDisplay() {
                return `<h3>Hyper Charm</h3>\n
                 <br>
                
                \n<p>Unlock the Hyper Charm</p>
                <p>Costs `+format(this.required)+` `+this.currencyname+`</p>`
            },
            canAfford() {
                return player.H.points.gte(this.required)
            },
            onPurchase() {
                player.H.points = player.H.points.sub(this.required)
                player.C.unlockedcharms.push("hyper")
            },
        },
        14: {
            currencyname: "Money",
            required: new Decimal(1e17),
            fullDisplay() {
                return `<h3>Capitalism Charm</h3>\n
                 <br>
                
                \n<p>Unlock the Capitalism Charm</p>
                <p>Costs `+format(this.required)+` `+this.currencyname+`</p>`
            },
            canAfford() {
                return player.M.points.gte(this.required)
            },
            onPurchase() {
                player.M.points = player.M.points.sub(this.required)
                player.C.unlockedcharms.push("money")
            },
        },
        15: {
            currencyname: "Point",
            required: new Decimal(1e120),
            fullDisplay() {
                return `<h3>Point Charm</h3>\n
                 <br>
                
                \n<p>Unlock the Point Charm</p>
                <p>Costs `+format(this.required)+` `+this.currencyname+`</p>`
            },
            canAfford() {
                return player.points.gte(this.required)
            },
            onPurchase() {
                player.points = player.points.sub(this.required)
                player.C.unlockedcharms.push("point")
            },
        },
        21: {
            currencyname: "Layer points",
            required: new Decimal(15),
            fullDisplay() {
                return `<h3>Flipside Charm</h3>\n
                 <br>
                
                \n<p>Unlock the Flipside Charm</p>
                <p>Costs `+format(this.required)+` `+this.currencyname+`</p>`
            },
            canAfford() {
                return player.points.gte(this.required)
            },
            onPurchase() {
                player.L.points = player.L.points.sub(this.required)
                player.C.unlockedcharms.push("flipside")
            },
            unlocked() {
                return hasUpgrade("C",11) && hasUpgrade("C",12) && hasUpgrade("C",13) && hasUpgrade("C",14) && hasUpgrade("C",15)
            }
        },
    },
})