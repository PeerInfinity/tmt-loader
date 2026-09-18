addLayer("auto", {
    tabFormat: {
        "Auto-Upgrades": {
            content:[
                ["display-text", function() { return "<h3>Do challenges or buy upgrades to unlock automations." },],
                "blank",
                ["microtabs", "upgrades"],
            ]
        },
        "Layer 1": {
            content:[
                ["display-text", function() { return "<h3>Automation for the 1st layer.<br></h3> The 1st layer is the f(t) row" },],
                "blank",
                ["microtabs", "layer1"],
            ]
        },
    },
    microtabs: {
        upgrades: {
            "Layer 1": {
                buttonStyle() { return {'border-color': '#63C5DA'} },
                unlocked() {return player["p"].points.gte(1)},
                content: [
                    "blank",
                    ["buyable", 11],
                    ["row", [["buyable", 12], ["buyable", 13]]],
                    ["row", [["buyable", 14], ["buyable", 15]]],
                    "blank",
                ]
            }
        },
        layer1: {
            "f": {
                buttonStyle() { return {'border-color': '#63C5DA'} },
                unlocked() {return getBuyableAmount("auto", 11).gte(1)},
                content: [
                    "blank",
                    ["clickable", 1101],
                    ["clickable", 1111],
                    ["clickable", 1121],
                    ["clickable", 1131],
                    ["clickable", 1141],
                    "blank",
                ]
            },
            "R": {
                buttonStyle() { return {'border-color': '#234F1E'} },
                unlocked() {return getBuyableAmount("auto", 12).gte(1) || getBuyableAmount("auto", 13).gte(1)},
                content: [
                    "blank",
                    ["display-text", function() { return "<h3> Research Upgrades </h3>" },],
                    ["clickable", 1301],
                    ["row", [["clickable", 1311], ["clickable", 1312]]],
                    "blank",
                    ["display-text", function() { return "<h3> Variable Upgrades </h3>" },],
                    ["clickable", 1302],
                    ["row", [["clickable", 1321], ["clickable", 1322]]],
                    ["row", [["clickable", 1331], ["clickable", 1332]]],
                    ["row", [["clickable", 1341], ["clickable", 1342]]],
                    "blank",
                ]
            },
            "TM": {
                buttonStyle() { return {'border-color': '#D0B49F'} },
                unlocked() {return getBuyableAmount("auto", 14).gte(1) || getBuyableAmount("auto", 15).gte(1)},
                content: [
                    "blank",
                    ["display-text", function() { return "<h3> Light Machines </h3>" },],
                    ["clickable", 1401],
                    ["row", [["clickable", 1411], ["clickable", 1412]]],
                    "blank",
                    ["display-text", function() { return "<h3> Heavy Machines </h3>" },],
                    ["clickable", 1402],
                    ["row", [["clickable", 1421], ["clickable", 1422]]],
                    "blank",
                ]
            },
        }
    },
    startData() { return {
        auto1: new Decimal(0),
        auto2: new Decimal(0),
        auto3: new Decimal(0),
        auto4: new Decimal(0),
        auto5: new Decimal(0),
        unlocked: true,
    }},
    name: "Automation", 
    symbol: "Au",
    color: "#FFFFFF",
    row: "side",
    type: "none", 
    nodeStyle() {
        var style = {}
        if (options.nodeStyle) style["border-radius"] = "15px 15px 15px 15px";
        return style
    },
    componentStyles: {
        "microtabs"() { return {"width": "660px"} }
    },
    layerShown() {return player["p"].points.gte(1) || hasAchievement("A",51)}, 
    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("Automation")
    },
    update(diff) {
        player["auto"].auto1 = player["auto"].auto1.add(new Decimal(1).mul(diff))
        player["auto"].auto2 = player["auto"].auto2.add(new Decimal(1).mul(diff))
        player["auto"].auto3 = player["auto"].auto3.add(new Decimal(1).mul(diff))
        player["auto"].auto4 = player["auto"].auto4.add(new Decimal(1).mul(diff))
        player["auto"].auto5 = player["auto"].auto5.add(new Decimal(1).mul(diff))
    },
    buyables: {
        11: {
            title() {return "Automate Variables"},
            cost() { return new Decimal(1).mul(new Decimal(10).pow(new Decimal(3.66667).mul(getBuyableAmount("auto",11).add(getBuyableAmount("auto",12)).add(getBuyableAmount("auto",13)).add(getBuyableAmount("auto",14)).add(getBuyableAmount("auto",15)))))},
            display() { 
                if (getBuyableAmount("auto",11).gte(1)) return "Faster automation for the f(t) variables <br> Currently: Buys every " + format(new Decimal(buyableEffect("auto",11))) + " second <br> Cost: <b style='color:red;'> " + format(this.cost(getBuyableAmount("auto", 11))) + " PP"
                else return "Unlock Automation for the f(t) variables <br> Cost: <b style='color:red;'> " + format(this.cost(getBuyableAmount("auto", 11))) + " PP"
            },
            canAfford() { return player["p"].points.gte(this.cost()) },
            buy() {
                setBuyableAmount("auto", 11, getBuyableAmount("auto", 11).add(1))
            },
            purchaseLimit: new Decimal(8),
            effect() { 
                eff = new Decimal(1)
                if (getBuyableAmount("auto",11).gte(1)) eff = eff.div(new Decimal(1.5).pow(getBuyableAmount("auto",11).sub(1)))
                return eff
            },
            style(){ 
                return {"border-radius": "15px 15px 0px 0px", "width": "300px", "height": "120px"}
            },
            unlocked() {
                return true
            }
        },
        12: {
            title() {return "Automate Research Upgrades"},
            cost() { return new Decimal(1).mul(new Decimal(10).pow(new Decimal(3.66667).mul(getBuyableAmount("auto",11).add(getBuyableAmount("auto",12)).add(getBuyableAmount("auto",13)).add(getBuyableAmount("auto",14)).add(getBuyableAmount("auto",15)))))},
            display() { 
                if (getBuyableAmount("auto",12).gte(1)) return "Faster automation for the Research Upgrades <br> Currently: Buys every " + format(new Decimal(buyableEffect("auto",12))) + " second <br> Cost: <b style='color:red;'> " + format(this.cost(getBuyableAmount("auto", 12))) + " PP"
                else return "Unlock Automation for the Research Upgrades <br> Cost: <b style='color:red;'> " + format(this.cost(getBuyableAmount("auto", 12))) + " PP"
            },
            canAfford() { return player["p"].points.gte(this.cost()) },
            buy() {
                setBuyableAmount("auto", 12, getBuyableAmount("auto", 12).add(1))
            },
            purchaseLimit: new Decimal(8),
            effect() { 
                eff = new Decimal(1)
                if (getBuyableAmount("auto",12).gte(1)) eff = eff.div(new Decimal(1.5).pow(getBuyableAmount("auto",12).sub(1)))
                return eff
            },
            style(){ 
                return {"border-radius": "15px 0px 0px 0px", "width": "300px", "height": "120px"}
            },
            unlocked() {
                return true
            }
        },
        13: {
            title() {return "Automate Variable Upgrades"},
            cost() { return new Decimal(1).mul(new Decimal(10).pow(new Decimal(3.66667).mul(getBuyableAmount("auto",11).add(getBuyableAmount("auto",12)).add(getBuyableAmount("auto",13)).add(getBuyableAmount("auto",14)).add(getBuyableAmount("auto",15)))))},
            display() { 
                if (getBuyableAmount("auto",13).gte(1)) return "Faster automation for the Variable Upgrades <br> Currently: Buys every " + format(new Decimal(buyableEffect("auto",13))) + " second <br> Cost: <b style='color:red;'> " + format(this.cost(getBuyableAmount("auto", 13))) + " PP"
                else return "Unlock Automation for the Variable Upgrades <br> Cost: <b style='color:red;'> " + format(this.cost(getBuyableAmount("auto", 13))) + " PP"
            },
            canAfford() { return player["p"].points.gte(this.cost()) },
            buy() {
                setBuyableAmount("auto", 13, getBuyableAmount("auto", 13).add(1))
            },
            purchaseLimit: new Decimal(8),
            effect() { 
                eff = new Decimal(1)
                if (getBuyableAmount("auto",13).gte(1)) eff = eff.div(new Decimal(1.5).pow(getBuyableAmount("auto",13).sub(1)))
                return eff
            },
            style(){ 
                return {"border-radius": "0px 15px 0px 0px", "width": "300px", "height": "120px"}
            },
            unlocked() {
                return true
            }
        },
        14: {
            title() {return "Automate Light Machines"},
            cost() { return new Decimal(1).mul(new Decimal(10).pow(new Decimal(3.66667).mul(getBuyableAmount("auto",11).add(getBuyableAmount("auto",12)).add(getBuyableAmount("auto",13)).add(getBuyableAmount("auto",14)).add(getBuyableAmount("auto",15)))))},
            display() { 
                if (getBuyableAmount("auto",14).gte(1)) return "Faster automation for the Light Machines <br> Currently: Buys every " + format(new Decimal(buyableEffect("auto",14))) + " second <br> Cost: <b style='color:red;'> " + format(this.cost(getBuyableAmount("auto", 14))) + " PP"
                else return "Unlock Automation for the Light Machines <br> Cost: <b style='color:red;'> " + format(this.cost(getBuyableAmount("auto", 14))) + " PP"
            },
            canAfford() { return player["p"].points.gte(this.cost()) },
            buy() {
                setBuyableAmount("auto", 14, getBuyableAmount("auto", 14).add(1))
            },
            purchaseLimit: new Decimal(8),
            effect() { 
                eff = new Decimal(1)
                if (getBuyableAmount("auto",14).gte(1)) eff = eff.div(new Decimal(1.5).pow(getBuyableAmount("auto",14).sub(1)))
                return eff
            },
            style(){ 
                return {"border-radius": "0px 0px 0px 15px", "width": "300px", "height": "120px"}
            },
            unlocked() {
                return true
            }
        },
        15: {
            title() {return "Automate Heavy Machines"},
            cost() { return new Decimal(1).mul(new Decimal(10).pow(new Decimal(3.66667).mul(getBuyableAmount("auto",11).add(getBuyableAmount("auto",12)).add(getBuyableAmount("auto",13)).add(getBuyableAmount("auto",14)).add(getBuyableAmount("auto",15)))))},
            display() { 
                if (getBuyableAmount("auto",15).gte(1)) return "Faster automation for the Heavy Machines <br> Currently: Buys every " + format(new Decimal(buyableEffect("auto",15))) + " second <br> Cost: <b style='color:red;'> " + format(this.cost(getBuyableAmount("auto", 15))) + " PP"
                else return "Unlock Automation for the Heavy Machines <br> Cost: <b style='color:red;'> " + format(this.cost(getBuyableAmount("auto", 15))) + " PP"
            },
            canAfford() { return player["p"].points.gte(this.cost()) },
            buy() {
                setBuyableAmount("auto", 15, getBuyableAmount("auto", 15).add(1))
            },
            purchaseLimit: new Decimal(8),
            effect() { 
                eff = new Decimal(1)
                if (getBuyableAmount("auto",15).gte(1)) eff = eff.div(new Decimal(1.5).pow(getBuyableAmount("auto",15).sub(1)))
                return eff
            },
            style(){ 
                return {"border-radius": "0px 0px 15px 0px", "width": "300px", "height": "120px"}
            },
            unlocked() {
                return true
            }
        },
    },
    clickables: {
        1101: {
            display() {return "<h2>Buy Max on Automation"},
            canClick() {return true},
            onClick() {
                if (getClickableState("auto", 1101) == false) {
                    setClickableState("auto", 1101, true)
                }
                else if (getClickableState("auto", 1101) == true) {
                    setClickableState("auto", 1101, false)
                }
            },
            style() {
                if (getClickableState("auto", 1101) == false) return {'background-color': 'red',"border-radius": "15px 15px 0px 0px", "width": "480px", "min-height": "40px"}
                else if (getClickableState("auto", 1101) == true) return {'background-color': '#FFFFFF',"border-radius": "15px 15px 0px 0px", "width": "480px", "min-height": "40px"}
            },
            unlocked() {return hasChallenge("inf", 12)}
        },
        1111: {
            display() {return "<h2>Automate 'a' Variable"},
            canClick() {return true},
            onClick() {
                if (getClickableState("auto", 1111) == false) {
                    setClickableState("auto", 1111, true)
                }
                else if (getClickableState("auto", 1111) == true) {
                    setClickableState("auto", 1111, false)
                }
            },
            style() {
                if (hasChallenge("inf", 12) && (getClickableState("auto", 1111) == false)) return {'background-color': 'red',"border-radius": "0px 0px 0px 0px", "width": "480px", "height": "100px"}
                else if (hasChallenge("inf", 12) && (getClickableState("auto", 1111) == true)) return {'background-color': '#FFFFFF',"border-radius": "0px 0px 0px 0px", "width": "480px", "height": "100px"}
                else if (getClickableState("auto", 1111) == false) return {'background-color': 'red',"border-radius": "15px 15px 0px 0px", "width": "480px", "height": "100px"}
                else if (getClickableState("auto", 1111) == true) return {'background-color': '#FFFFFF',"border-radius": "15px 15px 0px 0px", "width": "480px", "height": "100px"}
            },
            unlocked() {return getBuyableAmount("auto", 11).gte(1)},
        },
        1121: {
            display() {return "<h2>Automate 'b' Variable"},
            canClick() {return true},
            onClick() {
                if (getClickableState("auto", 1121) == false) {
                    setClickableState("auto", 1121, true)
                }
                else if (getClickableState("auto", 1121) == true) {
                    setClickableState("auto", 1121, false)
                }
            },
            style() {
                if (getClickableState("auto", 1121) == false) return {'background-color': 'red',"border-radius": "0px 0px 0px 0px", "width": "480px", "height": "100px"}
                else if (getClickableState("auto", 1121) == true) return {'background-color': '#FFFFFF',"border-radius": "0px 0px 0px 0px", "width": "480px", "height": "100px"}
            },
            unlocked() {return getBuyableAmount("auto", 11).gte(1)},
        },
        1131: {
            display() {return "<h2>Automate 'c' Variable"},
            canClick() {return true},
            onClick() {
                if (getClickableState("auto", 1131) == false) {
                    setClickableState("auto", 1131, true)
                }
                else if (getClickableState("auto", 1131) == true) {
                    setClickableState("auto", 1131, false)
                }
            },
            style() {
                if (getClickableState("auto", 1131) == false) return {'background-color': 'red',"border-radius": "0px 0px 0px 0px", "width": "480px", "height": "100px"}
                else if (getClickableState("auto", 1131) == true) return {'background-color': '#FFFFFF',"border-radius": "0px 0px 0px 0px", "width": "480px", "height": "100px"}
            },
            unlocked() {return getBuyableAmount("auto", 11).gte(1)},
        },
        1141: {
            display() {return "<h2>Automate 'd' Variable"},
            canClick() {return true},
            onClick() {
                if (getClickableState("auto", 1141) == false) {
                    setClickableState("auto", 1141, true)
                }
                else if (getClickableState("auto", 1141) == true) {
                    setClickableState("auto", 1141, false)
                }
            },
            style() {
                if (getClickableState("auto", 1141) == false) return {'background-color': 'red',"border-radius": "0px 0px 15px 15px", "width": "480px", "height": "100px"}
                else if (getClickableState("auto", 1141) == true) return {'background-color': '#FFFFFF',"border-radius": "0px 0px 15px 15px", "width": "480px", "height": "100px"}
            },
            unlocked() {return getBuyableAmount("auto", 11).gte(1)},
        },
        1301: {
            display() {return "<h2>Buy Max on Automation"},
            canClick() {return true},
            onClick() {
                if (getClickableState("auto", 1301) == false) {
                    setClickableState("auto", 1301, true)
                }
                else if (getClickableState("auto", 1301) == true) {
                    setClickableState("auto", 1301, false)
                }
            },
            style() {
                if (getClickableState("auto", 1301) == false) return {'background-color': 'red',"border-radius": "15px 15px 0px 0px", "width": "600px", "min-height": "40px"}
                else if (getClickableState("auto", 1301) == true) return {'background-color': '#FFFFFF',"border-radius": "15px 15px 0px 0px", "width": "600px", "min-height": "40px"}
            },
            unlocked() {return hasChallenge("inf", 21)}
        },
        1311: {
            display() {return "<h2>Automate Additive Research Upgrade"},
            canClick() {return true},
            onClick() {
                if (getClickableState("auto", 1311) == false) {
                    setClickableState("auto", 1311, true)
                }
                else if (getClickableState("auto", 1311) == true) {
                    setClickableState("auto", 1311, false)
                }
            },
            style() {
                if (hasChallenge("inf", 21) && (getClickableState("auto", 1311) == false)) return {'background-color': 'red',"border-radius": "0px 0px 0px 15px", "width": "300px", "height": "120px"}
                else if (hasChallenge("inf", 21) && (getClickableState("auto", 1311) == true)) return {'background-color': '#FFFFFF',"border-radius": "0px 0px 0px 15px", "width": "300px", "height": "120px"}
                else if (getClickableState("auto", 1311) == false) return {'background-color': 'red',"border-radius": "15px 0px 0px 15px", "width": "300px", "height": "120px"}
                else if (getClickableState("auto", 1311) == true) return {'background-color': '#FFFFFF',"border-radius": "15px 0px 0px 15px", "width": "300px", "height": "120px"}
            },
            unlocked() {return getBuyableAmount("auto", 12).gte(1)},
        },
        1312: {
            display() {return "<h2>Automate Multiplicative Research Upgrade"},
            canClick() {return true},
            onClick() {
                if (getClickableState("auto", 1312) == false) {
                    setClickableState("auto", 1312, true)
                }
                else if (getClickableState("auto", 1312) == true) {
                    setClickableState("auto", 1312, false)
                }
            },
            style() {
                if (hasChallenge("inf", 21) && (getClickableState("auto", 1312) == false)) return {'background-color': 'red',"border-radius": "0px 0px 15px 0px", "width": "300px", "height": "120px"}
                else if (hasChallenge("inf", 21) && (getClickableState("auto", 1312) == true)) return {'background-color': '#FFFFFF',"border-radius": "0px 0px 15px 0px", "width": "300px", "height": "120px"}
                else if (getClickableState("auto", 1312) == false) return {'background-color': 'red',"border-radius": "0px 15px 15px 0px", "width": "300px", "height": "120px"}
                else if (getClickableState("auto", 1312) == true) return {'background-color': '#FFFFFF',"border-radius": "0px 15px 15px 0px", "width": "300px", "height": "120px"}
            },
            unlocked() {return getBuyableAmount("auto", 12).gte(1)},
        },
        1302: {
            display() {return "<h2>Buy Max on Automation"},
            canClick() {return true},
            onClick() {
                if (getClickableState("auto", 1302) == false) {
                    setClickableState("auto", 1302, true)
                }
                else if (getClickableState("auto", 1302) == true) {
                    setClickableState("auto", 1302, false)
                }
            },
            style() {
                if (getClickableState("auto", 1302) == false) return {'background-color': 'red',"border-radius": "15px 15px 0px 0px", "width": "600px", "min-height": "40px"}
                else if (getClickableState("auto", 1302) == true) return {'background-color': '#FFFFFF',"border-radius": "15px 15px 0px 0px", "width": "600px", "min-height": "40px"}
            },
            unlocked() {return hasChallenge("inf", 22)}
        },
        1321: {
            display() {return "<h2>Automate 'U' Variable Upgrade"},
            canClick() {return true},
            onClick() {
                if (getClickableState("auto", 1321) == false) {
                    setClickableState("auto", 1321, true)
                }
                else if (getClickableState("auto", 1321) == true) {
                    setClickableState("auto", 1321, false)
                }
            },
            style() {
                if (hasChallenge("inf", 22) && (getClickableState("auto", 1321) == false)) return {'background-color': 'red',"border-radius": "0px 0px 0px 0px", "width": "300px", "height": "120px"}
                else if (hasChallenge("inf", 22) && (getClickableState("auto", 1321) == true)) return {'background-color': '#FFFFFF',"border-radius": "0px 0px 0px 0px", "width": "300px", "height": "120px"}
                else if (getClickableState("auto", 1321) == false) return {'background-color': 'red',"border-radius": "15px 0px 0px 0px", "width": "300px", "height": "120px"}
                else if (getClickableState("auto", 1321) == true) return {'background-color': '#FFFFFF',"border-radius": "15px 0px 0px 0px", "width": "300px", "height": "120px"}
            },
            unlocked() {return getBuyableAmount("auto", 13).gte(1)},
        },
        1322: {
            display() {return "<h2>Automate 'pU' Variable Upgrade"},
            canClick() {return true},
            onClick() {
                if (getClickableState("auto", 1322) == false) {
                    setClickableState("auto", 1322, true)
                }
                else if (getClickableState("auto", 1322) == true) {
                    setClickableState("auto", 1322, false)
                }
            },
            style() {
                if (hasChallenge("inf", 22) && (getClickableState("auto", 1322) == false)) return {'background-color': 'red',"border-radius": "0px 0px 0px 0px", "width": "300px", "height": "120px"}
                else if (hasChallenge("inf", 22) && (getClickableState("auto", 1322) == true)) return {'background-color': '#FFFFFF',"border-radius": "0px 0px 0px 0px", "width": "300px", "height": "120px"}
                else if (getClickableState("auto", 1322) == false) return {'background-color': 'red',"border-radius": "0px 15px 0px 0px", "width": "300px", "height": "120px"}
                else if (getClickableState("auto", 1322) == true) return {'background-color': '#FFFFFF',"border-radius": "0px 15px 0px 0px", "width": "300px", "height": "120px"}
            },
            unlocked() {return getBuyableAmount("auto", 13).gte(1)},
        },
        1331: {
            display() {return "<h2>Automate 'a' Variable Upgrade"},
            canClick() {return true},
            onClick() {
                if (getClickableState("auto", 1331) == false) {
                    setClickableState("auto", 1331, true)
                }
                else if (getClickableState("auto", 1331) == true) {
                    setClickableState("auto", 1331, false)
                }
            },
            style() {
                if (getClickableState("auto", 1331) == false) return {'background-color': 'red',"border-radius": "0px 0px 0px 0px", "width": "300px", "height": "120px"}
                else if (getClickableState("auto", 1331) == true) return {'background-color': '#FFFFFF',"border-radius": "0px 0px 0px 0px", "width": "300px", "height": "120px"}
            },
            unlocked() {return getBuyableAmount("auto", 13).gte(1)},
        },
        1332: {
            display() {return "<h2>Automate 'b' Variable Upgrade"},
            canClick() {return true},
            onClick() {
                if (getClickableState("auto", 1332) == false) {
                    setClickableState("auto", 1332, true)
                }
                else if (getClickableState("auto", 1332) == true) {
                    setClickableState("auto", 1332, false)
                }
            },
            style() {
                if (getClickableState("auto", 1332) == false) return {'background-color': 'red',"border-radius": "0px 0px 0px 0px", "width": "300px", "height": "120px"}
                else if (getClickableState("auto", 1332) == true) return {'background-color': '#FFFFFF',"border-radius": "0px 0px 0px 0px", "width": "300px", "height": "120px"}
            },
            unlocked() {return getBuyableAmount("auto", 13).gte(1)},
        },
        1341: {
            display() {return "<h2>Automate 'c' Variable Upgrade"},
            canClick() {return true},
            onClick() {
                if (getClickableState("auto", 1341) == false) {
                    setClickableState("auto", 1341, true)
                }
                else if (getClickableState("auto", 1341) == true) {
                    setClickableState("auto", 1341, false)
                }
            },
            style() {
                if (getClickableState("auto", 1341) == false) return {'background-color': 'red',"border-radius": "0px 0px 0px 15px", "width": "300px", "height": "120px"}
                else if (getClickableState("auto", 1341) == true) return {'background-color': '#FFFFFF',"border-radius": "0px 0px 0px 15px", "width": "300px", "height": "120px"}
            },
            unlocked() {return getBuyableAmount("auto", 13).gte(1)},
        },
        1342: {
            display() {return "<h2>Automate 'd' Variable Upgrade"},
            canClick() {return true},
            onClick() {
                if (getClickableState("auto", 1342) == false) {
                    setClickableState("auto", 1342, true)
                }
                else if (getClickableState("auto", 1342) == true) {
                    setClickableState("auto", 1342, false)
                }
            },
            style() {
                if (getClickableState("auto", 1342) == false) return {'background-color': 'red',"border-radius": "0px 0px 15px 0px", "width": "300px", "height": "120px"}
                else if (getClickableState("auto", 1342) == true) return {'background-color': '#FFFFFF',"border-radius": "0px 0px 15px 0px", "width": "300px", "height": "120px"}
            },
            unlocked() {return getBuyableAmount("auto", 13).gte(1)},
        },
        1401: {
            display() {return "<h2>Buy Max on Automation"},
            canClick() {return true},
            onClick() {
                if (getClickableState("auto", 1401) == false) {
                    setClickableState("auto", 1401, true)
                }
                else if (getClickableState("auto", 1401) == true) {
                    setClickableState("auto", 1401, false)
                }
            },
            style() {
                if (getClickableState("auto", 1401) == false) return {'background-color': 'red',"border-radius": "15px 15px 0px 0px", "width": "540px", "min-height": "40px"}
                else if (getClickableState("auto", 1401) == true) return {'background-color': '#FFFFFF',"border-radius": "15px 15px 0px 0px", "width": "540px", "min-height": "40px"}
            },
            unlocked() {return hasChallenge("inf", 31)}
        },
        1411: {
            display() {return "<h2>Automate Time Fragments Generator"},
            canClick() {return true},
            onClick() {
                if (getClickableState("auto", 1411) == false) {
                    setClickableState("auto", 1411, true)
                }
                else if (getClickableState("auto", 1411) == true) {
                    setClickableState("auto", 1411, false)
                }
            },
            style() {
                if (hasChallenge("inf", 31) && (getClickableState("auto", 1411) == false)) return {'background-color': 'red',"border-radius": "0px 0px 0px 15px", "width": "270px", "height": "180px"}
                else if (hasChallenge("inf", 31) && (getClickableState("auto", 1411) == true)) return {'background-color': '#FFFFFF',"border-radius": "0px 0px 0px 15px", "width": "270px", "height": "180px"}
                else if (getClickableState("auto", 1411) == false) return {'background-color': 'red',"border-radius": "15px 0px 0px 15px", "width": "270px", "height": "180px"}
                else if (getClickableState("auto", 1411) == true) return {'background-color': '#FFFFFF',"border-radius": "15px 0px 0px 15px", "width": "270px", "height": "180px"}
            },
            unlocked() {return getBuyableAmount("auto", 14).gte(1)},
        },
        1412: {
            display() {return "<h2>Automate Warp Time"},
            canClick() {return true},
            onClick() {
                if (getClickableState("auto", 1412) == false) {
                    setClickableState("auto", 1412, true)
                }
                else if (getClickableState("auto", 1412) == true) {
                    setClickableState("auto", 1412, false)
                }
            },
            style() {
                if (hasChallenge("inf", 31) && (getClickableState("auto", 1412) == false)) return {'background-color': 'red',"border-radius": "0px 0px 15px 0px", "width": "270px", "height": "180px"}
                else if (hasChallenge("inf", 31) && (getClickableState("auto", 1412) == true)) return {'background-color': '#FFFFFF',"border-radius": "0px 0px 15px 0px", "width": "270px", "height": "180px"}
                else if (getClickableState("auto", 1412) == false) return {'background-color': 'red',"border-radius": "0px 15px 15px 0px", "width": "270px", "height": "180px"}
                else if (getClickableState("auto", 1412) == true) return {'background-color': '#FFFFFF',"border-radius": "0px 15px 15px 0px", "width": "270px", "height": "180px"}
            },
            unlocked() {return getBuyableAmount("auto", 14).gte(1)},
        },
        1402: {
            display() {return "<h2>Buy Max on Automation"},
            canClick() {return true},
            onClick() {
                if (getClickableState("auto", 1402) == false) {
                    setClickableState("auto", 1402, true)
                }
                else if (getClickableState("auto", 1402) == true) {
                    setClickableState("auto", 1402, false)
                }
            },
            style() {
                if (getClickableState("auto", 1402) == false) return {'background-color': 'red',"border-radius": "15px 15px 0px 0px", "width": "540px", "min-height": "40px"}
                else if (getClickableState("auto", 1402) == true) return {'background-color': '#FFFFFF',"border-radius": "15px 15px 0px 0px", "width": "540px", "min-height": "40px"}
            },
            unlocked() {return hasChallenge("inf", 32)}
        },
        1421: {
            display() {return "<h2>Automate T.M.G.E."},
            canClick() {return true},
            onClick() {
                if (getClickableState("auto", 1421) == false) {
                    setClickableState("auto", 1421, true)
                }
                else if (getClickableState("auto", 1421) == true) {
                    setClickableState("auto", 1421, false)
                }
            },
            style() {
                if (hasChallenge("inf", 32) && (getClickableState("auto", 1421) == false)) return {'background-color': 'red',"border-radius": "0px 0px 0px 15px", "width": "270px", "height": "180px"}
                else if (hasChallenge("inf", 32) && (getClickableState("auto", 1421) == true)) return {'background-color': '#FFFFFF',"border-radius": "0px 0px 0px 15px", "width": "270px", "height": "180px"}
                else if (getClickableState("auto", 1421) == false) return {'background-color': 'red',"border-radius": "15px 0px 0px 15px", "width": "270px", "height": "180px"}
                else if (getClickableState("auto", 1421) == true) return {'background-color': '#FFFFFF',"border-radius": "15px 0px 0px 15px", "width": "270px", "height": "180px"}
            },
            unlocked() {return getBuyableAmount("auto", 15).gte(1)},
        },
        1422: {
            display() {return "<h2>Automate Warp Warp Time"},
            canClick() {return true},
            onClick() {
                if (getClickableState("auto", 1422) == false) {
                    setClickableState("auto", 1422, true)
                }
                else if (getClickableState("auto", 1422) == true) {
                    setClickableState("auto", 1422, false)
                }
            },
            style() {
                if (hasChallenge("inf", 32) && (getClickableState("auto", 1422) == false)) return {'background-color': 'red',"border-radius": "0px 0px 15px 0px", "width": "270px", "height": "180px"}
                else if (hasChallenge("inf", 32) && (getClickableState("auto", 1422) == true)) return {'background-color': '#FFFFFF',"border-radius": "0px 0px 15px 0px", "width": "270px", "height": "180px"}
                else if (getClickableState("auto", 1422) == false) return {'background-color': 'red',"border-radius": "0px 15px 15px 0px", "width": "270px", "height": "180px"}
                else if (getClickableState("auto", 1422) == true) return {'background-color': '#FFFFFF',"border-radius": "0px 15px 15px 0px", "width": "270px", "height": "180px"}
            },
            unlocked() {return getBuyableAmount("auto", 15).gte(1)},
        },
    },
    getResetGain() {
        gain = new Decimal(0)
        return gain
    },
})

function auto1() {
    tick = new Decimal(0)
    tick = new Decimal(player["auto"].auto1 % buyableEffect("auto",11))

    buy = false
    if (tick.gte(buyableEffect("auto",11).sub(0.05))) buy = true
    return buy 
}

function auto2() {
    tick = new Decimal(0)
    tick = new Decimal(player["auto"].auto2 % buyableEffect("auto",12))

    buy = false
    if (tick.gte(buyableEffect("auto",12).sub(0.05))) buy = true
    return buy 
}

function auto3() {
    tick = new Decimal(0)
    tick = new Decimal(player["auto"].auto3 % buyableEffect("auto",13))

    buy = false
    if (tick.gte(buyableEffect("auto",13).sub(0.05))) buy = true
    return buy 
}

function auto4() {
    tick = new Decimal(0)
    tick = new Decimal(player["auto"].auto4 % buyableEffect("auto",14))

    buy = false
    if (tick.gte(buyableEffect("auto",14).sub(0.05))) buy = true
    return buy 
}

function auto5() {
    tick = new Decimal(0)
    tick = new Decimal(player["auto"].auto5 % buyableEffect("auto",15))

    buy = false
    if (tick.gte(buyableEffect("auto",15).sub(0.05))) buy = true
    return buy 
}