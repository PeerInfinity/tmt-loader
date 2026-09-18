let PRESTIGE_LAYER_ID = "p";
addLayer(PRESTIGE_LAYER_ID, {
        layer: PRESTIGE_LAYER_ID, // This is assigned automatically, both to the layer and all upgrades, etc. Shown here so you know about it
        name: "Prestige points", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: true,
			points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            upgrade11Power: new Decimal(0),
            buyables: {}, // You don't actually have to initialize this one
        }},
        color: "cornflowerblue",
        requires: new Decimal(10), // Can be a function that takes requirement increases into account
        resource: "prestige points", // Name of prestige currency
        baseResource: "points", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: 0.5, // Prestige currency exponent
        base: 5, // Only needed for static layers, base of the formula (b^(x^exp))
        roundUpCost: false, // True if the cost needs to be rounded up (use when baseResource is static?)
        canBuyMax() {}, // Only needed for static layers with buy max
        gainMult() { // Calculate the multiplier for main currency from bonuses
            let mult = new Decimal(1);
            if (hasUpgrade(this.layer, 21)) mult = mult.times(upgradeEffect(this.layer, 21))
            if (hasUpgrade(this.layer, 22)) mult = mult.times(upgradeEffect(this.layer, 22))
            if (hasUpgrade(this.layer, 23)) mult = mult.times(upgradeEffect(this.layer, 23))
            if (hasUpgrade(this.layer, 24)) mult = mult.times(upgradeEffect(this.layer, 24))
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1);
        },
        doReset(resettingLayer) {
            if (resettingLayer === "p" || !resettingLayer) {
                return;
            }
            
            let shouldKeepUpgrades = {
                11: hasMilestone("c", 8), 
                12: hasMilestone("c", 9), 
                21: hasMilestone("c", 10), 
                31: hasMilestone("c", 11),
                22: hasMilestone("c", 15),
                13: hasMilestone("c", 16)
            };
            let upgradesToKeep = [];
            for (let upgrade of player[this.layer].upgrades) {
                if (shouldKeepUpgrades[upgrade]) {
                    upgradesToKeep.push(upgrade);
                }
            }
            layerDataReset("p");
            player[this.layer].upgrades = upgradesToKeep;
        },
        row: 0, // Row the layer is in on the tree (0 is the first row)
        effect() {
            return { // Formulas for any boosts inherent to resources in the layer. Can return a single value instead of an object if there is just one effect
                
            }
        },
        // effectDescription() { // Optional text to describe the effects
        //     let eff = this.effect();
            
        //     return "which are boosting waffles by "+format(eff.waffleBoost)+" and increasing the Ice Cream cap by "+format(eff.icecreamCap)
        // },
        // milestones: {
        //     0: {requirementDescription: "3 Lollipops",
        //         done() {return player[this.layer].best.gte(3)}, // Used to determine when to give the milestone
        //         effectDescription: "Unlock the next milestone",
        //     },
        //     1: {requirementDescription: "4 Lollipops",
        //         unlocked() {return hasMilestone(this.layer, 0)},
        //         done() {return player[this.layer].best.gte(4)},
        //         effectDescription: "You can toggle beep and boop (which do nothing)",
        //         toggles: [
        //             ["c", "beep"], // Each toggle is defined by a layer and the data toggled for that layer
        //             ["f", "boop"]],
        //         style() {                     
        //             if(hasMilestone(this.layer, this.id)) return {
        //                 'background-color': '#1111DD' 
        //         }},
        
        //         },
        // },
        // challenges: {
        //     rows: 2,
    	// 	cols: 12,
		//     11: {
        //         name: "Fun",
        //         completionLimit: 3,
		// 	    challengeDescription() {return "Makes the game 0% harder<br>"+challengeCompletions(this.layer, this.id) + "/" + this.completionLimit + " completions"},
		// 	    unlocked() { return player[this.layer].best.gt(0) },
        //         goal: new Decimal("20"),
        //         currencyDisplayName: "lollipops", // Use if using a nonstandard currency
        //         currencyInternalName: "points", // Use if using a nonstandard currency
        //         currencyLayer: this.layer, // Leave empty if not in a layer
        //         rewardEffect() {
        //             let ret = player[this.layer].points.add(1).tetrate(0.02)
        //             return ret;
        //         },
        //         rewardDisplay() { return format(this.rewardEffect())+"x" },
        //         countsAs: [12, 21], // Use this for if a challenge includes the effects of other challenges. Being in this challenge "counts as" being in these.
        //         rewardDescription: "Says hi",
        //         onComplete() {console.log("hiii")} // Called when you complete the challenge
        //     },
        // }, 
        update(diff) {
            if (hasUpgrade(this.layer, 11)) {
                player[this.layer].upgrade11Power = player[this.layer].upgrade11Power.add(diff);
            }
            if (hasMilestone("c", 12)) {
                addPoints("p", getResetGain("p").mul(0.01).mul(diff));
            }
        },
        upgrades: {
            rows: 3,
            cols: 4,
            11: {
                title: "1,1: Point Gain Gain",
                description: "Gain 1 point every second, every second.",
                cost: new Decimal(1),
                effect() {
                    let ret = player[this.layer].upgrade11Power;
                    return ret;
                },
                effectDisplay() {
                    return format(this.effect())+"/s";
                },
                unlocked() { return player[this.layer].unlocked }, // The upgrade is only visible when this is true
            },
            12: {
                title: "1,2: Point Gain",
                description: "Gain 4 points every second.",
                cost: new Decimal(3),
                unlocked() { return hasUpgrade(this.layer, 11) || hasUpgrade("c", 11) }, // The upgrade is only visible when this is true
            },
            13: {
                title: "1,3: Point Gain",
                description: "Gain 8 points every second.",
                cost: new Decimal(9),
                unlocked() { return hasUpgrade(this.layer, 12) || hasUpgrade("c", 11) }, // The upgrade is only visible when this is true
            },
            14: {
                title: "1,4: Point Gain",
                description: "Gain 16 points every second.",
                cost: new Decimal(27),
                unlocked() { return hasMilestone("c", 6) && (hasUpgrade(this.layer, 13) || hasUpgrade("c", 11))  }, // The upgrade is only visible when this is true
            },
            21: {
                title: "2,1: Boost Prestige Point Gain",
                description: "Prestige points on reset are boosted by point generation.",
                cost: new Decimal(5),
                unlocked() { 
                    return (hasUpgrade("c", 11) || hasUpgrade(this.layer, 11))
                        && hasMilestone("c", 0);
                },
                effect() {
                    let ret = getPointGen().add(1).root(10);
                    return ret;
                },
                effectDisplay() {
                    return format(this.effect())+"x";
                }
            },
            22: {
                title: "2,2: Boost Prestige Point Gain",
                description: "Prestige points on reset are boosted by total prestige points.",
                cost: new Decimal(20),
                unlocked() { 
                    return (hasUpgrade("c", 11) || (hasUpgrade(this.layer, 21) && hasUpgrade(this.layer, 12)))
                        && hasMilestone("c", 1);
                },
                effect() {
                    let ret = player[this.layer].total.add(1).root(10);
                    return ret;
                },
                effectDisplay() {
                    return format(this.effect())+"x";
                }
            },
            23: {
                title: "2,3: Boost Prestige Point Gain",
                description: "Prestige points on reset are boosted by best prestige points.",
                cost: new Decimal(100),
                unlocked() { 
                    return (hasUpgrade("c", 11) || (hasUpgrade(this.layer, 22) && hasUpgrade(this.layer, 13)))
                        && hasMilestone("c", 5);
                },
                effect() {
                    let ret = player[this.layer].best.add(1).root(10);
                    return ret;
                },
                effectDisplay() {
                    return format(this.effect())+"x";
                }
            },
            24: {
                title: "2,4: Boost Prestige Point Gain",
                description: "Prestige points on reset are boosted by unspent prestige points.",
                cost: new Decimal(500),
                unlocked() { 
                    return (hasUpgrade("c", 11) || (hasUpgrade(this.layer, 23) && hasUpgrade(this.layer, 14)))
                        && hasMilestone("c", 7);
                },
                effect() {
                    let ret = player[this.layer].points.add(1).root(10);
                    return ret;
                },
                effectDisplay() {
                    return format(this.effect())+"x";
                }
            },
            31: {
                title: "3,1: Boost Point Gain",
                description: "Point generation is boosted by your unspent Prestige Points.",
                cost: new Decimal(8),
                unlocked() { 
                    return (hasUpgrade("c", 11) || hasUpgrade(this.layer, 21))
                        && hasMilestone("c", 1);
                },
                effect() {
                    let ret = player[this.layer].points.add(1).root(10);
                    return ret;
                },
                effectDisplay() {
                    return format(this.effect())+"x";
                }
            },
            32: {
                title: "3,2: Boost Point Gain",
                description: "Point generation is boosted by your best Prestige Points.",
                cost: new Decimal(64),
                unlocked() { 
                    return (hasUpgrade("c", 11) || (hasUpgrade(this.layer, 31) && hasUpgrade(this.layer, 22)))
                        && hasMilestone("c", 13);
                },
                effect() {
                    let ret = player[this.layer].best.add(1).root(10);
                    return ret;
                },
                effectDisplay() {
                    return format(this.effect())+"x";
                }
            },
            33: {
                title: "3,3: Boost Point Gain",
                description: "Point generation is boosted by prestige points on reset.",
                cost: new Decimal(256),
                unlocked() { 
                    return (hasUpgrade("c", 11) || (hasUpgrade(this.layer, 32) && hasUpgrade(this.layer, 23)))
                        && hasMilestone("c", 14);
                },
                effect() {
                    let ret = getResetGain("p").add(1).root(10);
                    return ret;
                },
                effectDisplay() {
                    return format(this.effect())+"x";
                }
            },
            34: {
                title: "3,4: Boost Point Gain",
                description: "Point generation is boosted by total prestige points.",
                cost: new Decimal(2048),
                unlocked() { 
                    return (hasUpgrade("c", 11) || (hasUpgrade(this.layer, 33) && hasUpgrade(this.layer, 24)))
                        && hasMilestone("c", 17);
                },
                effect() {
                    let ret = player[this.layer].total.add(1).root(10);
                    return ret;
                },
                effectDisplay() {
                    return format(this.effect())+"x";
                }
            },
            // 12: {
            //     title: "1,2: Point Gain",
            //     description: "Candy generation is faster based on your unspent Lollipops.",
            //     cost: new Decimal(1),
            //     unlocked() { return (hasUpgrade(this.layer, 11))},
            //     effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
            //         let ret = player[this.layer].points.add(1).pow(player[this.layer].upgrades.includes(24)?1.1:(player[this.layer].upgrades.includes(14)?0.75:0.5)) 
            //         if (ret.gte("1e20000000")) ret = ret.sqrt().times("1e10000000")
            //         return ret;
            //     },
            //     effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
            // },
            // 13: {
            //     description: "Unlock a <b>secret subtab</b> and make this layer act if you unlocked it first.",
            //     cost: new Decimal(69),
            //     currencyDisplayName: "candies", // Use if using a nonstandard currency
            //     currencyInternalName: "points", // Use if using a nonstandard currency
            //     currencyLocation: "", // The object in player data that the currency is contained in
            //     unlocked() { return (hasUpgrade(this.layer, 12))},
            //     onPurchase() { // This function triggers when the upgrade is purchased
            //         player[this.layer].unlockOrder = 0
            //     },
            //     style() {
            //         if (hasUpgrade(this.layer, this.id)) return {
            //         'background-color': '#1111dd' 
            //         }
            //         else if (!canAffordUpgrade(this.layer, this.id)) {
            //             return {
            //                 'background-color': '#dd1111' 
            //             }
            //         } // Otherwise use the default
            //     },
            // },
            // 22: {
            //     title: "This upgrade doesn't exist",
            //     description: "Or does it?.",
            //     currencyLocation() {return player[this.layer].buyables}, // The object in player data that the currency is contained in
            //     currencyDisplayName: "exhancers", // Use if using a nonstandard currency
            //     currencyInternalName: 11, // Use if using a nonstandard currency

            //     cost: new Decimal(3),
            //     unlocked() { return player[this.layer].unlocked }, // The upgrade is only visible when this is true
            // },
        },
        // buyables: {
        //     rows: 1,
        //     cols: 12,
        //     showRespec: true,
        //     respec() { // Optional, reset things and give back your currency. Having this function makes a respec button appear
        //         player[this.layer].points = player[this.layer].points.add(player[this.layer].spentOnBuyables) // A built-in thing to keep track of this but only keeps a single value
        //         resetBuyables(this.layer)
        //         doReset(this.layer, true) // Force a reset
        //     },
        //     respecText: "Respec Thingies", // Text on Respec button, optional
        //     11: {
        //         title: "Exhancers", // Optional, displayed at the top in a larger font
        //         cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
        //             if (x.gte(25)) x = x.pow(2).div(25)
        //             let cost = Decimal.pow(2, x.pow(1.5))
        //             return cost.floor()
        //         },
        //         effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
        //             let eff = {}
        //             if (x.gte(0)) eff.first = Decimal.pow(25, x.pow(1.1))
        //             else eff.first = Decimal.pow(1/25, x.times(-1).pow(1.1))
                
        //             if (x.gte(0)) eff.second = x.pow(0.8)
        //             else eff.second = x.times(-1).pow(0.8).times(-1)
        //             return eff;
        //         },
        //         display() { // Everything else displayed in the buyable button after the title
        //             let data = tmp[this.layer].buyables[this.id]
        //             return "Cost: " + format(data.cost) + " lollipops\n\
        //             Amount: " + player[this.layer].buyables[this.id] + "\n\
        //             Adds + " + format(data.effect.first) + " things and multiplies stuff by " + format(data.effect.second)
        //         },
        //         unlocked() { return player[this.layer].unlocked }, 
        //         canAfford() {
        //             return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
        //         buy() { 
        //             cost = tmp[this.layer].buyables[this.id].cost
        //             player[this.layer].points = player[this.layer].points.sub(cost)	
        //             player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
        //             player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
        //         },
        //         buyMax() {}, // You'll have to handle this yourself if you want
        //         style: {'height':'222px'}
        //     },
        // },
        // doReset(resettingLayer){ // Triggers when this layer is being reset, along with the layer doing the resetting. Not triggered by lower layers resetting, but is by layers on the same row.
        //     if(layers[resettingLayer].row > this.row) layerDataReset(this.layer, ["upgrades", "challenges"]) // This is actually the default behavior
        // },
        layerShown() {return true}, // Condition for when layer appears on the tree
        hotkeys: [
            {key: "p", description: "P: reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        increaseUnlockOrder: [], // Array of layer names to have their order increased when this one is first unlocked

        // microtabs: {
        //     stuff: {
        //         first: {
        //             content: ["upgrades", ["display-text", function() {return "confirmed"}]]
        //         },
        //         second: {
        //             content: [["upgrade", 11],
        //                     ["row", [["upgrade", 11], "blank", "blank", ["upgrade", 11],]],
                        
        //                 ["display-text", function() {return "double confirmed"}]]
        //         },
        //     },
        //     otherStuff: {
        //         // There could be another set of microtabs here
        //     }
        // },

        // bars: {
        //     longBoi: {
        //         fillStyle: {'background-color' : "#FFFFFF"},
        //         baseStyle: {'background-color' : "#696969"},
        //         textStyle: {'color': '#04e050'},

        //         borderStyle() {return {}},
        //         direction: RIGHT,
        //         width: 300,
        //         height: 30,
        //         progress() {
        //             return (player.points.log(10).div(10)).toNumber()
        //         },
        //         display() {
        //             return format(player.points) + " / 1e10 points"
        //         },
        //         unlocked: true,

        //     },
        //     tallBoi: {
        //         fillStyle: {'background-color' : "#4BEC13"},
        //         baseStyle: {'background-color' : "#000000"},
        //         textStyle: {'text-shadow': '0px 0px 2px #000000'},

        //         borderStyle() {return {'border-width': "7px"}},
        //         direction: UP,
        //         width: 50,
        //         height: 200,
        //         progress() {
        //             return player.points.div(100)
        //         },
        //         display() {
        //             return formatWhole((player.points.div(1)).min(100)) + "%"
        //         },
        //         unlocked: true,

        //     },
        //     flatBoi: {
        //         fillStyle: {'background-color' : "#FE0102"},
        //         baseStyle: {'background-color' : "#222222"},
        //         textStyle: {'text-shadow': '0px 0px 2px #000000'},

        //         borderStyle() {return {}},
        //         direction: UP,
        //         width: 100,
        //         height: 30,
        //         progress() {
        //             return player.c.points.div(50)
        //         },
        //         unlocked: true,

        //     },
        // },

        // Optional, lets you format the tab yourself by listing components. You can create your own components in v.js.
        // tabFormat: {
        //     "main tab": {
        //         buttonStyle() {return  {'color': 'orange'}},
        //         content:
        //             ["main-display",
        //             "prestige-button",
        //             ["blank", "5px"], // Height
        //             ["raw-html", function() {return "<button onclick='console.log(`yeet`)'>'HI'</button>"}],
        //             ["display-text",
        //                 function() {return 'I have ' + format(player.points) + ' pointy points!'},
        //                 {"color": "red", "font-size": "32px", "font-family": "Comic Sans MS"}],
        //             "h-line", "milestones", "blank", "upgrades", "challenges"],
        //     },
        //     thingies: {
        //         style() {return  {'background-color': '#222222'}},
        //         buttonStyle() {return {'border-color': 'orange'}},
        //         content:[ 
        //             ["buyables", ""], "blank",
        //             ["row", [
        //                 ["toggle", ["c", "beep"]], ["blank", ["30px", "10px"]], // Width, height
        //                 ["display-text", function() {return "Beep"}], "blank", ["v-line", "200px"],
        //                 ["column", [
        //                     ["prestige-button", "", {'width': '150px', 'height': '80px'}],
        //                     ["prestige-button", "", {'width': '100px', 'height': '150px'}],
        //                 ]], 
        //             ], {'width': '600px', 'height': '350px', 'background-color': 'green', 'border-style': 'solid'}],
        //             "blank",
        //             ["display-image", "discord.png"],],
        //     },
        //     jail: {
        //         content: [
        //             ["bar", "longBoi"], "blank",
        //             ["row", [
        //                 ["column", [
        //                     ["display-text", "Sugar level:", {'color': 'teal'}],  "blank", ["bar", "tallBoi"]],
        //                 {'background-color': '#555555', 'padding': '15px'}],
        //                 "blank",
        //                 ["column", [
        //                 ["display-text", "idk"],
        //                 ["blank", ['0', '50px']], ["bar", "flatBoi"]
        //                 ]],
        //             ]],
        //             "blank", ["display-text", "It's jail because \"bars\"! So funny! Ha ha!"],
        //         ],
        //     },
        //     illuminati: {
        //         unlocked() {return (hasUpgrade("c", 13))},
        //         content:[
        //             ["raw-html", function() {return "<h1> C O N F I R M E D </h1>"}], "blank",
        //             ["microtabs", "stuff", {'width': '600px', 'height': '350px', 'background-color': 'brown', 'border-style': 'solid'}]
        //         ]
        //     }

        // },
        // style() {return {
        //    //'background-color': '#3325CC' 
        // }},
        // nodeStyle() {return { // Style on the layer node
        //     'color': '#3325CC',
        //     'text-decoration': 'underline' 
        // }},
        // componentStyles: {
        //     "challenge"() {return {'height': '200px'}},
        //     "prestige-button"() {return {'color': '#AA66AA'}},
        // },
        // tooltip() { // Optional, tooltip displays when the layer is unlocked
        //     let tooltip = formatWhole(player[this.layer].points) + " " + this.resource
        //     if (player[this.layer].buyables[11].gt(0)) tooltip += "\n" + formatWhole(player[this.layer].buyables[11]) + " Exhancers"
        //     return tooltip
        // },
        // shouldNotify() { // Optional, layer will be highlighted on the tree if true.
        //                  // Layer will automatically highlight if an upgrade is purchasable.
        //     return (player.c.buyables[11] == 1)
        // },
        resetDescription: "Reset your points for ",
})

let adjustForFutureSight = function(req) {
    req = new Decimal(req);
    if (hasUpgrade("c", 11)) {
        req = req.sub(1);
    }
    return req.max(0);
}
addLayer("c", {
        layer: "c", // This is assigned automatically, both to the layer and all upgrades, etc. Shown here so you know about it
        name: "Content Unlocks", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            buyables: {}, // You don't actually have to initialize this one
        }},
        color: "gold",
        requires: new Decimal(12), // Can be a function that takes requirement increases into account
        resource: "Content Unlocks", // Name of prestige currency
        baseResource: "prestige points", // Name of resource prestige is based on
        baseAmount() {return player.p.points}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: 0.5, // Prestige currency exponent
        base: 7, // Only needed for static layers, base of the formula (b^(x^exp))
        roundUpCost: true, // True if the cost needs to be rounded up (use when baseResource is static?)
        canBuyMax() {}, // Only needed for static layers with buy max
        gainMult() { // Calculate the multiplier for main currency from bonuses
            let mult = new Decimal(1);
            //if (hasUpgrade(this.layer, 166)) mult = mult.times(2) // These upgrades don't exist
			//if (hasUpgrade(this.layer, 120)) mult = mult.times(upgradeEffect(this.layer, 120))
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1);
        },
        row: 4, // Row the layer is in on the tree (0 is the first row)
        effect() {
            return { // Formulas for any boosts inherent to resources in the layer. Can return a single value instead of an object if there is just one effect
                
            }
        },
        milestones: {
            0: {
                requirementDescription: "1 Content Unlock",
                done() {return player[this.layer].best.gte(1)}, // Used to determine when to give the milestone
                effectDescription() {
                    return hasMilestone(this.layer, 0) ? "Unlock Prestige Upgrade 2,1" : "Unlock a prestige upgrade to speed early game up a bit";
                }
            },
            1: {
                requirementDescription: "2 Content Unlocks",
                unlocked() {return hasMilestone(this.layer, 0)},
                done() {return player[this.layer].best.gte(2)},
                effectDescription() {
                    return hasMilestone(this.layer, 1) ? "Unlock Prestige Upgrades 2,2 and 3,1" : "Unlock some more prestige upgrades";
                },
            },
            2: {
                requirementDescription: "3 Content Unlocks",
                unlocked() {return hasMilestone(this.layer, 1)},
                done() {return player[this.layer].best.gte(3)},
                effectDescription() {
                    return hasMilestone(this.layer, 2) ? "Unlocks the Future Sight Upgrade" : "Unlock an upgrade to see the future";
                },
            },
            3: {
                requirementDescription: "4 Content Unlocks",
                unlocked() {return hasMilestone(this.layer, adjustForFutureSight(2))},
                done() {return player[this.layer].best.gte(4)},
                effectDescription() {
                    return hasMilestone(this.layer, 3) ? "Unlocks the Kickstarter layer" : "Unlock a layer to help you with the early game";
                },
            },
            4: {
                requirementDescription: "5 Content Unlocks",
                unlocked() {return hasMilestone(this.layer, adjustForFutureSight(3))},
                done() {return player[this.layer].best.gte(5)},
                effectDescription() {
                    return hasMilestone(this.layer, 4) ? "Content Unlocks no longer reset the Kickstarter Layer.<br/> Unlocks the first Kickstarter Upgrade." :
                    hasMilestone(this.layer, 3) ? "Add an upgrade to the Kickstarter layer" : "Add an upgrade to the layer that helps you with the early game";
                },
            },
            5: {
                requirementDescription: "6 Content Unlocks",
                unlocked() {return hasMilestone(this.layer, adjustForFutureSight(4))},
                done() {return player[this.layer].best.gte(6)},
                effectDescription() {
                    return hasMilestone(this.layer, 5) ? "Unlock Prestige Upgrade 2,3." : "Unlock more prestige upgrades!";
                },
            },
            6: {
                requirementDescription: "7 Content Unlocks",
                unlocked() {return hasMilestone(this.layer, adjustForFutureSight(5))},
                done() {return player[this.layer].best.gte(7)},
                effectDescription() {
                    return hasMilestone(this.layer, 6) ? "Unlock Prestige Upgrade 1,4." : "Unlock more prestige upgrades!";
                },
            },
            7: {
                requirementDescription: "8 Content Unlocks",
                unlocked() {return hasMilestone(this.layer, adjustForFutureSight(6))},
                done() {return player[this.layer].best.gte(8)},
                effectDescription() {
                    return hasMilestone(this.layer, 7) ? "Unlock Prestige Upgrade 2,4." : "Unlock more prestige upgrades!";
                },
            },
            8: {
                requirementDescription: "9 Content Unlocks",
                unlocked() {return hasMilestone(this.layer, adjustForFutureSight(7))},
                done() {return player[this.layer].best.gte(9)},
                effectDescription() {
                    return hasMilestone(this.layer, 8) ? "You keep Prestige Upgrade 1,1 on all resets." : "Keep some prestige upgrades on resets!";
                },
            },
            9: {
                requirementDescription: "10 Content Unlocks",
                unlocked() {return hasMilestone(this.layer, adjustForFutureSight(8))},
                done() {return player[this.layer].best.gte(10)},
                effectDescription() {
                    return hasMilestone(this.layer, 9) ? "You keep Prestige Upgrade 1,2 on all resets." : "Keep another prestige upgrade on resets!";
                },
            },
            10: {
                requirementDescription: "11 Content Unlocks",
                unlocked() {return hasMilestone(this.layer, adjustForFutureSight(9))},
                done() {return player[this.layer].best.gte(11)},
                effectDescription() {
                    return hasMilestone(this.layer, 10) ? "You keep Prestige Upgrade 2,1 on all resets." : "Keep another prestige upgrade on resets!";
                },
            },
            11: {
                requirementDescription: "12 Content Unlocks",
                unlocked() {return hasMilestone(this.layer, adjustForFutureSight(10))},
                done() {return player[this.layer].best.gte(12)},
                effectDescription() {
                    return hasMilestone(this.layer, 11) ? "You keep Prestige Upgrade 3,1 on all resets." : "Keep another prestige upgrade on resets!";
                },
            },
            12: {
                requirementDescription: "13 Content Unlocks",
                unlocked() {return hasMilestone(this.layer, adjustForFutureSight(11))},
                done() {return player[this.layer].best.gte(13)},
                effectDescription() {
                    return hasMilestone(this.layer, 12) ? "You gain 1% of your prestige point gain on reset per second." : "A taste of automation?";
                },
            },
            13: {
                requirementDescription: "14 Content Unlocks",
                unlocked() {return hasMilestone(this.layer, adjustForFutureSight(12))},
                done() {return player[this.layer].best.gte(14)},
                effectDescription() {
                    return hasMilestone(this.layer, 13) ? "Unlock Prestige Upgrade 3,2." : "Unlock more prestige upgrades!";
                },
            },
            14: {
                requirementDescription: "15 Content Unlocks",
                unlocked() {return hasMilestone(this.layer, adjustForFutureSight(13))},
                done() {return player[this.layer].best.gte(15)},
                effectDescription() {
                    return hasMilestone(this.layer, 14) ? "Unlock Prestige Upgrade 3,3." : "Unlock more prestige upgrades!";
                },
            },
            15: {
                requirementDescription: "16 Content Unlocks",
                unlocked() {return hasMilestone(this.layer, adjustForFutureSight(14))},
                done() {return player[this.layer].best.gte(16)},
                effectDescription() {
                    return hasMilestone(this.layer, 15) ? "You keep Prestige Upgrade 2,2 on all resets." : "Keep another prestige upgrade on resets!";
                },
            },
            16: {
                requirementDescription: "17 Content Unlocks",
                unlocked() {return hasMilestone(this.layer, adjustForFutureSight(15))},
                done() {return player[this.layer].best.gte(17)},
                effectDescription() {
                    return hasMilestone(this.layer, 16) ? "You keep Prestige Upgrade 1,3 on all resets." : "Keep another prestige upgrade on resets!";
                },
            },
            17: {
                requirementDescription: "18 Content Unlocks",
                unlocked() {return hasMilestone(this.layer, adjustForFutureSight(16))},
                done() {return player[this.layer].best.gte(18)},
                effectDescription() {
                    return hasMilestone(this.layer, 17) ? "Unlock Prestige Upgrade 3,4." : "Unlock more prestige upgrades!";
                },
            },
            18: {
                requirementDescription: "Dunno Content Unlocks",
                unlocked() {return hasMilestone(this.layer, adjustForFutureSight(17))},
                done() {return false},
                effectDescription() {
                    return hasMilestone(this.layer, 18) ? "hacker" : "No more content =/";
                },
            },
        },
        upgrades: {
            rows: 1,
            cols: 1,
            11: {
                title: "Future Sight",
                description: "Upgrades don't need to be purchased in a specific order anymore. You can see future milestones in Content Unlocks earlier.",
                cost: new Decimal(1),
                unlocked() { return hasMilestone(this.layer, 2) }, // The upgrade is only visible when this is true
            },
        },
        layerShown() {
            return player[this.layer].unlocked || player.p.points.gte(5);
        },
        branches() {
            return ["p"];
        },
        resetDescription: "Toss away all your hard earned prestige points for ",
})

addLayer("k", {
    layer: "k", // This is assigned automatically, both to the layer and all upgrades, etc. Shown here so you know about it
    name: "Kickstarter", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "K", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        buyables: {}, // You don't actually have to initialize this one
    }},
    color: "springgreen",
    requires: new Decimal(50), // Can be a function that takes requirement increases into account
    resource: "kickstarters", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    base: 25, // Only needed for static layers, base of the formula (b^(x^exp))
    roundUpCost: true, // True if the cost needs to be rounded up (use when baseResource is static?)
    canBuyMax() {}, // Only needed for static layers with buy max
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1);
        //if (hasUpgrade(this.layer, 166)) mult = mult.times(2) // These upgrades don't exist
        //if (hasUpgrade(this.layer, 120)) mult = mult.times(upgradeEffect(this.layer, 120))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1);
    },
    doReset(resettingLayer) {
        if (resettingLayer === "k") {
            return;
        }
        if (resettingLayer === "c" && !hasMilestone("c", 4)) {
            layerDataReset(this.layer);
        }
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    effect() {
        let softCap = player.c.points.sqrt().floor();
        let bonusUptoSoftcap = new Decimal(2).pow(player[this.layer].points.min(softCap));
        let result = bonusUptoSoftcap;
        if (player[this.layer].points.gt(softCap)) {
            result = result.mul(player[this.layer].points.sub(softCap).add(1));
        }
        return { // Formulas for any boosts inherent to resources in the layer. Can return a single value instead of an object if there is just one effect
            pointGainBaseIncrease: result
        }
    },
    effectDescription() {
        let eff = this.effect();
        return "which multiply the effect of Point Gain prestige upgrades by " + format(eff.pointGainBaseIncrease) + ". (Kickstarters past " + formatWhole(player.c.points.sqrt().floor()) + " have reduced effects.)";
    },
    upgrades: {
        rows: 1,
        cols: 1,
        11: {
            title: "Bootstrapping",
            description: "Vastly increases the points you start with after a Content Unlock reset",
            cost: new Decimal(1),
            effect() {
                let softCap = player.c.points.sqrt().floor();
                let bonusUptoSoftcap = new Decimal(7).pow(player[this.layer].points.min(softCap));
                let result = bonusUptoSoftcap;
                if (player[this.layer].points.gt(softCap)) {
                    result = result.mul(player[this.layer].points.sub(softCap).add(1));
                }
                result = result.add(1);
                return result;
            },
            effectDisplay() {
                return format(this.effect()) + "x";
            },
            unlocked() { return hasMilestone("c", 4) }, // The upgrade is only visible when this is true
        },
    },
    layerShown() {
        return player[this.layer].unlocked || hasMilestone("c", 3)
    },
    branches() {
        return ["p"];
    },
    resetDescription: "Shred up your prestige points for ",
})

// This layer is mostly minimal but it uses a custom prestige type and a clickable
// addLayer("f", {
//     startData() { return {
//         unlocked: false,
//         points: new Decimal(0),
//         boop: false,
//         clickables: {[11]: "Start"} // Optional default Clickable state
//     }},
//     color: "#FE0102",
//     requires() {return new Decimal(10)}, 
//     resource: "farm points", 
//     baseResource: "candies", 
//     baseAmount() {return player.points},
//     type: "custom", // A "Custom" type which is effectively static
//     exponent: 0.5,
//     base: 3,
//     roundUpCost: true,
//     canBuyMax() {return hasAchievement('a', 13)},
//     gainMult() {
//         return new Decimal(1)
//     },
//     gainExp() {
//         return new Decimal(1)
//     },
//     row: 1,
//     layerShown() {return true}, 
//     branches: ["c"], // When this layer appears, a branch will appear from this layer to any layers here. Each entry can be a pair consisting of a layer id and a color.

//     tooltipLocked() { // Optional, tooltip displays when the layer is locked
//         return ("This weird farmer dinosaur will only see you if you have at least " + this.requires() + " candies. You only have " + formatWhole(player.points))
//     },

//     midsection: [
//         "blank", ['display-image', 'https://images.beano.com/store/24ab3094eb95e5373bca1ccd6f330d4406db8d1f517fc4170b32e146f80d?auto=compress%2Cformat&dpr=1&w=390'],
//         ["display-text", "Bork bork!"]
//     ],

//     // The following are only currently used for "custom" Prestige type:
//     prestigeButtonText() { //Is secretly HTML
//         if (!this.canBuyMax()) return "Hi! I'm a <u>weird dinosaur</u> and I'll give you a Farm Point in exchange for all of your candies and lollipops! (At least " + formatWhole(tmp[this.layer].nextAt) + " candies)"
//         if (this.canBuyMax()) return "Hi! I'm a <u>weird dinosaur</u> and I'll give you <b>" + formatWhole(tmp[this.layer].resetGain) + "</b> Farm Points in exchange for all of your candies and lollipops! (You'll get another one at " + formatWhole(tmp[layer].nextAtDisp) + " candies)"
//     },
//     getResetGain() {
//         return getResetGain(this.layer, useType = "static")
//     },
//     getNextAt(canMax=false) { //  
//         return getNextAt(this.layer, canMax, useType = "static")
//     },
//     canReset() {
//         return tmp[this.layer].baseAmount.gte(tmp[this.layer].nextAt)
//     },
//     // This is also non minimal, a Clickable!
//     clickables: {
//         rows: 1,
//         cols: 1,
//         masterButtonPress() { // Optional, reset things and give back your currency. Having this function makes a respec button appear
//             if (getClickableState(this.layer, 11) == "Borkened...")
//                 player[this.layer].clickables[11] = "Start"
//         },
//         masterButtonText() {return (getClickableState(this.layer, 11) == "Borkened...") ? "Fix the clickable!" : "Does nothing"}, // Text on Respec button, optional
//         11: {
//             title: "Clicky clicky!", // Optional, displayed at the top in a larger font
//             display() { // Everything else displayed in the buyable button after the title
//                 let data = getClickableState(this.layer, this.id)
//                 return "Current state:<br>" + data
//             },
//             unlocked() { return player[this.layer].unlocked }, 
//             canClick() {
//                 return getClickableState(this.layer, this.id) !== "Borkened..."},
//             onClick() { 
//                 switch(getClickableState(this.layer, this.id)){
//                     case "Start":
//                         player[this.layer].clickables[this.id] = "A new state!"
//                         break;
//                     case "A new state!":
//                         player[this.layer].clickables[this.id] = "Keep going!"
//                         break;
//                     case "Keep going!":
//                         player[this.layer].clickables[this.id] = "Maybe that's a bit too far..."
//                         break;                        
//                     case "Maybe that's a bit too far...":
//                         player[this.layer].clickables[this.id] = "Borkened..."
//                         break;
//                     default:
//                         player[this.layer].clickables[this.id] = "Start"
//                         break;

//                 }
//             },
//             style() {
//                 switch(getClickableState(this.layer, this.id)){
//                     case "Start":
//                         return {'background-color': 'green'}
//                         break;
//                     case "A new state!":
//                         return {'background-color': 'yellow'}
//                         break;
//                     case "Keep going!":
//                         return {'background-color': 'orange'}
//                         break;                        
//                     case "Maybe that's a bit too far...":
//                         return {'background-color': 'red'}
//                         break;
//                     default:
//                         return {}
//                         break;
//             }},
//         },
//     },

// }, 
// )

// // This layer is mostly minimal but it uses a custom prestige type and a clickable
// addLayer("a", {
//         startData() { return {
//             unlocked: true,
// 			points: new Decimal(0),
//         }},
//         color: "yellow",
//         resource: "achievement power", 
//         type: "none",
//         row: "side",
//         layerShown() {return true}, 
//         tooltip() { // Optional, tooltip displays when the layer is locked
//             return ("Achievements")
//         },
//         achievements: {
//             rows: 2,
//             cols: 3,
//             11: {
//                 name: "Get me!",
//                 done() {return true}, // This one is a freebie
//                 goalTooltip: "How did this happen?", // Shows when achievement is not completed
//                 doneTooltip: "You did it!", // Showed when the achievement is completed
//             },
//             12: {
//                 name: "Impossible!",
//                 done() {return false},
//                 goalTooltip: "Mwahahaha!", // Shows when achievement is not completed
//                 doneTooltip: "HOW????", // Showed when the achievement is completed
//             },
//             13: {
//                 name: "EIEIO",
//                 done() {return player.f.points.gte(1)},
//                 tooltip: "Get a farm point.\n\nReward: The dinosaur is now your friend (you can max Farm Points).", // Showed when the achievement is completed
//                 onComplete() {console.log("Bork bork bork!")}
//             },
//         },
//         midsection: [
//             "achievements",
//         ]
//     }, 
// )


// This layer is mostly minimal but it uses a custom prestige type and a clickable
addLayer("spook", {
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    color: "yellow",
    resource: "achievement power", 
    type: "none",
    row: 1,
    position: 1,
    layerShown: "ghost",
}, 
)

