addLayer("R", {
    name: "Rooms", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        points: new Decimal(1),
        inlocker: false,
        lockerrooms: [],

        movecooldown: new Decimal(0),
        danger: new Decimal(0),
        dangerroom: new Decimal(-25)


    }},
    passiveGeneration() {
        return 0
    },
    autoUpgrade() {
        return false
    },
    layerShown(){
        let visible = false
        if (inChallenge("L",21)) visible = true
        if (!inChallenge("L",21)) visible = false
        return visible
    },
    roomcooldown() {
        if (!player.R.movecooldown.eq(0)) {
            player.R.movecooldown = player.R.movecooldown.sub(0.3)
            if (player.R.movecooldown.lte(0)) {
                player.R.movecooldown = new Decimal(0)
                return
            }

        }
    },
    danger() {
        if (player.R.danger.lte(1.01) && inChallenge("L", 99991)) {
            player.R.danger = player.R.danger.add(0.001).add(player.R.danger.div(1000).times(player.R.points))
        
        }
        if (player.R.danger.gte(1.01)) {
            player.R.danger = new Decimal(1)
        }
    },
    evil() {
        if (player.R.dangerroom.floor().eq(player.R.points.sub(25))) {
            player.R.dangerroom = player.R.points.sub(25)
        }
        if (player.R.danger.gte(1) && !player.R.dangerroom.gte(player.R.points.add(25)) ) {
            player.R.dangerroom = player.R.dangerroom.add(0.1)
        }
        if (player.R.danger.gte(1) && player.R.dangerroom.gte(player.R.points.add(25)) ) {
            player.R.danger = new Decimal(0)
        }
        if (player.R.dangerroom.floor().eq(player.R.points)  && player.R.inlocker == false && inChallenge("L", 99991)) {
            close()
        }
    },
    color: "#13a3dcff",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Room number", // Name of prestige currency
    baseResource: "why do you see this", // Name of resource prestige is based on
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
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "t", description: "t: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    clickables: {
        11: {
            title: "<-",
            canClick() {return player.R.movecooldown.eq(0) && !player.R.inlocker},
            onClick() {
                player.R.points = player.R.points.sub(1)
                player.R.movecooldown = player.R.movecooldown.add(5)
                if (player.R.dangerroom.eq(player.R.points.sub(10))) {
                    player.R.dangerroom = player.R.points.sub(10)
                }
            },
                
            style() {
                if (player.R.points.lte(1)) {
                    return {"visibility": "hidden"}
                }
                else {
                    return {"visibility": "visible"}
                }
            }
        },
        12: {
            title: "why do you see this",
            canClick() {return true},
            onClick() {return "something"},
            style() {return {
                "visibility": "hidden"
            }}
        },
        13: {
            title: "your not supposed to",
            canClick() {return true},
            onClick() {return "something"},
            style() {return {
                "visibility": "hidden"
            }}
        },
        14: {
            title: "a",
            canClick() {return true},
            onClick() {return "something"},
            style() {return {
                "visibility": "hidden"
            }}
        },
        15: {
            title: "",
            canClick() {return true},
            onClick() {return "something"},
            style() {return {
                "visibility": "hidden"
            }}
        },
        16: {
            title: "->",
            canClick() {return player.R.movecooldown.eq(0) && !player.R.inlocker},
            onClick() {
                player.R.points = player.R.points.add(1)
                player.R.movecooldown = player.R.movecooldown.add(5)
                if (player.R.dangerroom.eq(player.R.points.sub(10))) {
                    player.R.dangerroom = player.R.points.sub(10)
                }
            },
            style() {
                if (player.R.points.eq(1000)) {
                    return {"visibility": "hidden"}
                }
                else {
                    return {"visibility": "visible"}
                }
            }
        },
        21: {
            display() {
                if (player.R.inlocker) {
                    return "<h2>Locker<br> Currently: In</h2>"
                }
                else {
                    return "<h2>Locker<br> Currently: Out</h2>"
                }
            },
            canClick() {return player.R.lockerrooms[player.R.points] == 1},
            onClick() {
                if (player.R.inlocker) {
                    player.R.inlocker = false
                }
                else {
                    player.R.inlocker = true
                }},
            style() {
                if (player.R.points.eq(1000)) {
                    return {"visibility": "hidden"}
                }
                else {
                    return {"visibility": "visible"}
                }
            }
        },
    },
    bars: {
        danger: {
            direction: RIGHT,
            width: 300,
            height: 50,
            progress() {
                let progress = player.R.danger
                return progress
            },
            fillStyle: function() {
                if (player.R.danger.gte(1)) {
                    return {"background-color": "red"}
                }
                else {
                    return {"background-color": "white"}
                }
            }
        },
    },
    tabFormat: {
        "The building": {
            content: [
                "main-display",
                ["display-text", function() {
                    if (player.R.danger.gte(1)) {
                        return "You feel danger coming "+player.R.points.sub(player.R.dangerroom).abs()+" rooms away"+ player.R.dangerroom
                    }
                    else {
                        return ""
                    }
                }],
                "blank",
                "blank",
                "blank",
                "blank",
                "clickables",
                "blank",
                ["bar", "danger"]
            ],
        },
    }
})

