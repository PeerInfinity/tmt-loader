addLayer("G", {
    name: "Generator", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        genpoints: new Decimal(0),

        geninf: new Decimal(0),
        geninfcost: new Decimal(1000),
        geninfcostscale: new Decimal(1),
        geninfmult: new Decimal(1),
        geninfexpmult: new Decimal(1),
        geninfboost: new Decimal(1),

        gen1: new Decimal(0),
        gen1cost: new Decimal(1000),
        gen1collect: new Decimal(0),
        gen1costscale: new Decimal(1),

        gen2: new Decimal(0),
        gen2cost: new Decimal(100),
        gen2collect: new Decimal(0),
        gen2costscale: new Decimal(0.5),

        gen3: new Decimal(0),
        gen3cost: new Decimal(1e3),
        gen3collect: new Decimal(0),
        gen3costscale: new Decimal(1),

        gen4: new Decimal(0),
        gen4cost: new Decimal(1e4),
        gen4collect: new Decimal(0),
        gen4costscale: new Decimal(1.5),

        gen5: new Decimal(0),
        gen5cost: new Decimal(1e5),
        gen5collect: new Decimal(0),
        gen5costscale: new Decimal(2)
        

    }},
    generate() {
        player.G.geninfmult = player.G.geninfmult.add(player.G.geninf.div(player.G.geninfmult.pow(0.01).add(1)).times(player.G.geninfboost))
        player.G.geninfexpmult = player.G.geninfexpmult.add(player.G.geninf.div(player.G.geninfexpmult)).pow(0.014)
       
        player.G.gen1collect = player.G.gen1collect.add(player.G.gen1.times(player.G.geninf.div(20).floor().add(1)).div(50))
        player.G.gen2collect = player.G.gen2collect.add(player.G.gen2.times(2).times(player.G.geninf.div(20).floor().add(1)).div(40))
        player.G.gen3collect = player.G.gen3collect.add(player.G.gen3.times(3).times(player.G.geninf.div(20).floor().add(1)).div(30))
        player.G.gen4collect = player.G.gen4collect.add(player.G.gen4.times(4).times(player.G.geninf.div(20).floor().add(1)).div(20))
        player.G.gen5collect = player.G.gen5collect.add(player.G.gen5.times(5).times(player.G.geninf.div(20).floor().add(1)).div(10))
   
    },
    autobuygen() {
        if (player.PG.automate == true) {
            if (hasUpgrade("PG",31)) {
                if (player.points.gte(player.G.gen1cost)) {
                    player.G.gen1 = player.G.gen1.add(1)
                    player.points = player.points.sub(player.G.gen1cost)
                    player.G.gen1cost = player.G.gen1cost.times(player.G.gen1costscale.add(1))
                }
                else {

                }
            }
            if (hasUpgrade("PG",32)) {
                if (player.G.genpoints.gte(player.G.gen2cost)) {
                    player.G.gen2 = player.G.gen2.add(1)
                    player.G.genpoints = player.G.genpoints.sub(player.G.gen2cost)
                    player.G.gen2cost = player.G.gen2cost.times(player.G.gen2costscale.add(1))
                }
                else {

                }
            }
            if (hasUpgrade("PG",33)) {
                if (player.G.genpoints.gte(player.G.gen3cost)) {
                        player.G.gen3 = player.G.gen3.add(1)
                        player.G.genpoints = player.G.genpoints.sub(player.G.gen3cost)
                        player.G.gen3cost = player.G.gen3cost.times(player.G.gen3costscale.add(1))
                    }
                    else {

                    }

            }
            if (hasUpgrade("PG",34)) {
                if (player.G.genpoints.gte(player.G.gen4cost)) {
                        player.G.gen4 = player.G.gen4.add(1)
                        player.G.genpoints = player.G.genpoints.sub(player.G.gen4cost)
                        player.G.gen4cost = player.G.gen4cost.times(player.G.gen4costscale.add(1))
                    }
                    else {

                    }

            }
            if (hasUpgrade("PG",35)) {
                if (player.G.points.gte(player.G.gen5cost)) {
                        player.G.gen5 = player.G.gen5.add(1)
                        player.points = player.points.sub(player.G.gen5cost)
                        player.G.gen5cost = player.G.gen5cost.times(player.G.gen5costscale.add(1))
                    }
                    else {

                    }

            }
            if (hasUpgrade("PG",36)) {
                if (player.points.gte(player.G.geninfcost) && player.G.geninf.lte(500)) {
                    player.points = player.points.sub(player.G.geninfcost)
                    player.G.geninf = player.G.geninf.add(1)
                    player.G.geninfcost = player.G.geninfcost.times(player.G.geninfcostscale.add(1))
                }
                else {
                }

            }
    }

    },
    layerShown(){
        let visible = false
        if (inChallenge("L",16)) visible = true
        if (!inChallenge("L",16)) visible = false
        return visible
    },
    color: "#FFFFFF",
    branches: ["G","PG"],
    requires: new Decimal(100),
    resource: "Generator points", // Name of prestige currency
    baseResource: "Points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: new Decimal(5), // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)     
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "t", description: "t: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    clickables: {
        91: {
            display: function() {return "<h2><b>Infinite Generator "+player.G.geninf+"</b></h2><br><h3><br>Costs: "+format(player.G.geninfcost)+" points"},
            canClick() {
                if (player.points.gte(player.G.geninfcost) && player.G.geninf.lte(500)) {
                    return true
                }
                else {
                    return false
                }
            },
            onClick() { 
                if (player.points.gte(player.G.geninfcost) && player.G.geninf.lte(500)) {
                    player.points = player.points.sub(player.G.geninfcost)
                    player.G.geninf = player.G.geninf.add(1)
                    player.G.geninfcost = player.G.geninfcost.times(player.G.geninfcostscale.add(1))
                }
                else {
                    return false
                }
            },
            style() {return {
                'width': '200px',
                'height': '120px',
            }},
        },
        11: {
            display: function() {return "<h2><b>Generator 1</b></h2><br><h3>You have "+player.G.gen1+" Generators of this type<br>Costs: "+format(player.G.gen1cost)+" points"},
            description: function() {return "You have "+player.G.gen1+" Generators"},
            canClick() {
                if (player.points.gte(player.G.gen1cost)) {
                    return true
                }
                else {
                    return false
                }
            },
            onClick() { 
                if (player.points.gte(player.G.gen1cost)) {
                    player.G.gen1 = player.G.gen1.add(1)
                    player.points = player.points.sub(player.G.gen1cost)
                    player.G.gen1cost = player.G.gen1cost.times(player.G.gen1costscale.add(1))
                }
                else {

                }
            },
            style() {return {
                'width': '200px',
                'height': '120px',
            }},
        },
        12: {
            display: function() {return "<h2><b>Collect Gen 1 points</b></h2><br><h3>You will get "+format(player.G.gen1collect.floor())+" Gen points"},
            canClick() {
                if (player.G.gen1collect.floor().gte(1)) {
                    return true
                }
                else {
                    return false
                }
            },
            onClick() {
                if (player.G.gen1collect.floor().gte(1)) {
                    player.G.genpoints = player.G.genpoints.add(player.G.gen1collect)
                    player.G.gen1collect = new Decimal(0)
                }
            },
            style() {return {
                'width': '200px',
                'height': '120px',
            }},
        },

        21: {
            display: function() {return "<h2><b>Generator 2</b></h2><br><h3>You have "+player.G.gen2+" Generators of this type<br>Costs: "+format(player.G.gen2cost)+" Generator points"},
            description: function() {return "You have "+player.G.gen2+" Generators"},
            canClick() {
                if (player.G.genpoints.gte(player.G.gen2cost)) {
                    return true
                }
                else {
                    return false
                }
            },
            onClick() { 
                if (player.G.genpoints.gte(player.G.gen2cost)) {
                    player.G.gen2 = player.G.gen2.add(1)
                    player.G.genpoints = player.G.genpoints.sub(player.G.gen2cost)
                    player.G.gen2cost = player.G.gen2cost.times(player.G.gen2costscale.add(1))
                }
                else {

                }
            },
            style() {return {
                'width': '200px',
                'height': '120px',
            }},
        },
        22: {
            display: function() {return "<h2><b>Collect Gen 2 points</b></h2><br><h3>You will get "+format(player.G.gen2collect.floor())+" Gen points"},
            canClick() {
                if (player.G.gen2collect.floor().gte(1)) {
                    return true
                }
                else {
                    return false
                }
            },
            onClick() {
                if (player.G.gen2collect.floor().gte(1)) {
                    player.G.genpoints = player.G.genpoints.add(player.G.gen2collect)
                    player.G.gen2collect = new Decimal(0)
                }
            },
            style() {return {
                'width': '200px',
                'height': '120px',
            }},
        },
        31: {
            display: function() {return "<h2><b>Generator 3</b></h2><br><h3>You have "+player.G.gen3+" Generators of this type<br>Costs: "+format(player.G.gen3cost)+" Generator points"},
            description: function() {return "You have "+player.G.gen3+" Generators"},
            canClick() {
                if (player.G.genpoints.gte(player.G.gen3cost)) {
                    return true
                }
                else {
                    return false
                }
            },
            onClick() { 
                if (player.G.genpoints.gte(player.G.gen3cost)) {
                    player.G.gen3 = player.G.gen3.add(1)
                    player.G.genpoints = player.G.genpoints.sub(player.G.gen3cost)
                    player.G.gen3cost = player.G.gen3cost.times(player.G.gen3costscale.add(1))
                }
                else {

                }
            },
            style() {return {
                'width': '200px',
                'height': '120px',
            }},
        },
        32: {
            display: function() {return "<h2><b>Collect Gen 3 points</b></h2><br><h3>You will get "+format(player.G.gen3collect.floor())+" Gen points"},
            canClick() {
                if (player.G.gen3collect.floor().gte(1)) {
                    return true
                }
                else {
                    return false
                }
            },
            onClick() {
                if (player.G.gen3collect.floor().gte(1)) {
                    player.G.genpoints = player.G.genpoints.add(player.G.gen3collect)
                    player.G.gen3collect = new Decimal(0)
                }
            },
            style() {return {
                'width': '200px',
                'height': '120px',
            }},
        },
        41: {
            display: function() {return "<h2><b>Generator 4</b></h2><br><h3>You have "+player.G.gen4+" Generators of this type<br>Costs: "+format(player.G.gen4cost)+" Generator points"},
            description: function() {return "You have "+player.G.gen4+" Generators"},
            canClick() {
                if (player.G.genpoints.gte(player.G.gen4cost)) {
                    return true
                }
                else {
                    return false
                }
            },
            onClick() { 
                if (player.G.genpoints.gte(player.G.gen4cost)) {
                    player.G.gen4 = player.G.gen4.add(1)
                    player.G.genpoints = player.G.genpoints.sub(player.G.gen4cost)
                    player.G.gen4cost = player.G.gen4cost.times(player.G.gen4costscale.add(1))
                }
                else {

                }
            },
            style() {return {
                'width': '200px',
                'height': '120px',
            }},
        },
        42: {
            display: function() {return "<h2><b>Collect Gen 4 points</b></h2><br><h3>You will get "+format(player.G.gen4collect.floor())+" Gen points"},
            canClick() {
                if (player.G.gen4collect.floor().gte(1)) {
                    return true
                }
                else {
                    return false
                }
            },
            onClick() {
                if (player.G.gen4collect.floor().gte(1)) {
                    player.G.genpoints = player.G.genpoints.add(player.G.gen4collect)
                    player.G.gen4collect = new Decimal(0)
                }
            },
            style() {return {
                'width': '200px',
                'height': '120px',
            }},
        },
        51: {
            display: function() {return "<h2><b>Generator 5</b></h2><br><h3>You have "+player.G.gen5+" Generators of this type<br>Costs: "+format(player.G.gen5cost)+" Generator points"},
            description: function() {return "You have "+player.G.gen5+" Generators"},
            canClick() {
                if (player.G.genpoints.gte(player.G.gen5cost)) {
                    return true
                }
                else {
                    return false
                }
            },
            onClick() { 
                if (player.points.gte(player.G.gen5cost)) {
                    player.G.gen5 = player.G.gen5.add(1)
                    player.G.points = player.points.sub(player.G.gen5cost)
                    player.G.gen5cost = player.G.gen5cost.times(player.G.gen5costscale.add(1))
                }
                else {

                }
            },
            style() {return {
                'width': '200px',
                'height': '120px',
            }},
        },
        52: {
            display: function() {return "<h2><b>Collect Gen 5 points</b></h2><br><h3>You will get "+format(player.G.gen5collect.floor())+" Gen points"},
            canClick() {
                if (player.G.gen5collect.floor().gte(1)) {
                    return true
                }
                else {
                    return false
                }
            },
            onClick() {
                if (player.G.gen5collect.floor().gte(1)) {
                    player.G.genpoints = player.G.genpoints.add(player.G.gen5collect)
                    player.G.gen5collect = new Decimal(0)
                }
            },
            style() {return {
                'width': '200px',
                'height': '120px',
            }},
        },
    },
    tabFormat: {
        "Generators": {
            content: [
                ["display-text",
                    function(){
                        return "You have <h2><span style='color:rgba(255, 255, 255, 1); text-shadow: 0px 0px 10px rgba(255, 230, 230, 1); font-family: Lucida Console, Courier New, monospace'>"+ player.G.genpoints.floor() +"</span></h2> Generator points"
                    }
                ],
                ["display-text",
                    function(){
                        return "You have "+ format(player.points) +" points "
                    }
                ],
                    "blank",
                    ["clickables",[1,2,3,4,5]],
                    "upgrades",
                    "blank",
                    "blank",
                ],
            },
        "Infinite Generator": {
            content: [
                ["display-text",
                    function(){
                        return "You have <h2><span style='color:rgba(255, 255, 255, 1); text-shadow: 0px 0px 10px rgba(255, 230, 230, 1); font-family: Lucida Console, Courier New, monospace'>"+ player.G.genpoints.floor() +"</span></h2> Generator points"
                    }
                ],
                ["display-text",
                    function(){
                        return "You have "+ format(player.points) +" points "
                    }
                ],
                ["display-text",
                    function(){
                        return "Your infinite generator has provided you with a "+format(player.G.geninfmult)+"x multiplier to your points"
                    }
                ],
                ["display-text",
                    function(){
                        return "Your infinite generator has provided you with a ^"+format(player.G.geninfexpmult)+" boost to your points"
                    }
                ],
                ["display-text",
                    function(){
                        return "For each 20 infinite generators you have, you get a "+format(player.G.geninf.div(20).floor().add(1))+"x boost to all your normal generators"
                    }
                ],
                ["display-text",
                    function() {
                        if (player.G.geninf.gte(500)) {
                            return "ok i lied it wasnt infinite"
                        }
                        else {
                            return ""
                        }
                    }
                ],
                    "blank",
                    ["clickables",[9]],
                    "blank",
                    "blank",
                ],
            },
    },
})