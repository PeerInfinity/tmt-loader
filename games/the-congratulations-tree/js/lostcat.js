addLayer("lostcat", {
    name: "lostcat", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    image: "resources/Lostcat.svg",
    startData() {
        return {
            unlocked: true,
            points: decimalZero,
            fish: decimalZero,
            click: true,
        }
    },
    nodeStyle() {
        return {
            "background-size": "110%",
            "background-repeat": "no-repeat",
            "background-position": "center",
        }
    },
    color: "#808080",
    requires: decimalOne, // Can be a function that takes requirement increases into account
    resource: "Cash", // Name of prestige currency
    baseResource: "Fish", // Name of resource prestige is based on
    baseAmount() { return player[this.layer].fish }, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = decimalOne

        if (hasUpgrade("main", 31)) {
            gain = gain.times(2.00)
        }

        if (hasUpgrade("moon", 11)) {
            mult = mult.times(3.90)
        }

        if (hasUpgrade("lostcat", 11)) {
            mult = mult.times(1.50)
        }
        if (hasUpgrade("lostcat", 14)) {
            mult = mult.times(3)
        }

        if (hasUpgrade("fizzy", 11)) {
            mult = mult.times(1.60)
        }

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = decimalOne

        return exp
    },
    onPrestige() {
        player[this.layer].fish = decimalZero
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    displayRow: 2,
    branches: ["moon"],
    hotkeys: [
        { key: "f", description: "F: Fish for Fish", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    layerShown() {
        if (hasUpgrade("moon", 16)) {
            unlocked = true
            return true
        }
    },
    clickables: {
        11: {
            title: "Fish",
            display() { return "Look for fish!" },
            canClick() {
                return player["lostcat"].click
            },
            onClick() {
                mult = decimalOne

                if (hasUpgrade("lostcat", 12)) {
                    mult = mult.times(1.25)
                }

                cooldown = new Decimal(4000)

                if (hasUpgrade("lostcat", 13)) {
                    cooldown = cooldown.times(0.9)
                }

                rng = new Decimal(Math.random()).times(10).round()

                if (rng.gte(10)) {
                    player[this.layer].fish = player[this.layer].fish.add(new Decimal(5).times(mult))
                    makeParticles(Clownfish, 1)
                } else if (rng.gte(8)) {
                    player[this.layer].fish = player[this.layer].fish.add(new Decimal(2).times(mult))
                    makeParticles(Trout, 1)
                } else if (rng.gte(6)) {
                    player[this.layer].fish = player[this.layer].fish.add(new Decimal(1).times(mult))
                    makeParticles(Cod, 1)
                } else {
                    makeParticles(Shoe, 1)
                }

                player["lostcat"].click = false

                setTimeout(function () {
                    player["lostcat"].click = true
                }, cooldown)
            },
            style: {
                "font-size": "15px",
                "background-color": "hsl(230, 50%, 50%)",
                "height": "200px",
                "width": "400px",
                "border-radius": "100px",
                "corner-shape": "squircle"
            },
        }
    },

    upgrades: {
        11: {
            title: "I Like Money!",
            description: "1.50x Cash",
            cost: new Decimal(5),
            fishcost: new Decimal(5),
            fishpersisting: true,

            fullDisplay() {
                return "<h3>" + this.title + "</h3><br>" + this.description + "<br><br>Cost: $" + this.cost + ", " + this.fishcost + " Fish"
            },

            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },

            onPurchase() {
                player[this.layer].fish = player[this.layer].fish.sub(this.fishcost)
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost) && player[this.layer].fish.gte(this.fishcost)
            }
        },
        12: {
            title: "Rod Upgrade I",
            description: "1.25x Fish",
            cost: new Decimal(20),
            fishcost: new Decimal(10),
            fishpersisting: true,

            fullDisplay() {
                return "<h3>" + this.title + "</h3><br>" + this.description + "<br><br>Cost: $" + this.cost + ", " + this.fishcost + " Fish"
            },

            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },

            onPurchase() {
                player[this.layer].fish = player[this.layer].fish.sub(this.fishcost)
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost) && player[this.layer].fish.gte(this.fishcost)
            }
        },
        13: {
            title: "Dexterity I",
            description: "0.9x Cooldown",
            cost: new Decimal(20),
            fishcost: new Decimal(15),
            fishpersisting: true,

            fullDisplay() {
                return "<h3>" + this.title + "</h3><br>" + this.description + "<br><br>Cost: $" + this.cost + ", " + this.fishcost + " Fish"
            },

            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },

            onPurchase() {
                player[this.layer].fish = player[this.layer].fish.sub(this.fishcost)
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost) && player[this.layer].fish.gte(this.fishcost)
            }
        },
        14: {
            title: "Play RGV",
            description: "3.00x Amoebas, Planets, and Cash",
            cost: new Decimal(50),
            fishcost: new Decimal(1),
            fishpersisting: true,

            fullDisplay() {
                return "<h3>" + this.title + "</h3><br>" + this.description + "<br><br>Cost: $" + this.cost + ", " + this.fishcost + " Fish"
            },

            style: {
                "height": "150px",
                "width": "150px",
                "corner-shape": "squircle"
            },

            onPurchase() {
                player[this.layer].fish = player[this.layer].fish.sub(this.fishcost)
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost) && player[this.layer].fish.gte(this.fishcost)
            }
        },
    },


    tabFormat: [
        "main-display",
        "resource-display",
        "prestige-button",
        "blank",

        ['display-image', 'resources/FishingCat.svg'],
        "clickables",
        "milestones",
        "blank",


        "blank",
        ["display-text", function () {
            return "<h3>[ More Upgrades ]</h3>"
        }],
        "blank",
        ["row", [["upgrade", 11], ["upgrade", 12], ["upgrade", 13], ["upgrade", 14],]],
        "blank",
    ],
},)

const Cod = {
    image: "resources/fish/Cod.svg",
    width: 75,
    height: 75,
    spread: 20,
    gravity: 3,
    time: 3,
    rotation(id) {
        return 20 * (id - 1.5) + (Math.random() - 0.5) * 10
    },
    dir() {
        return (Math.random() - 0.5) * 10
    },
    speed() {
        return (Math.random() + 1.2) * 8
    },
    onClick() {
        console.log("yay")
    },
    onMouseOver() {
        console.log("hi")
    },
    onMouseLeave() {
        console.log("bye")
    },
    update() {
        //this.width += 1
        //setDir(this, 135)
    },
    layer: 'lostcat',
}

const Shoe = {
    image: "resources/fish/Shoe.svg",
    width: 75,
    height: 75,
    spread: 20,
    gravity: 5,
    time: 2,
    rotation(id) {
        return 20 * (id - 1.5) + (Math.random() - 0.5) * 10
    },
    dir() {
        return (Math.random() - 0.5) * 10
    },
    speed() {
        return (Math.random() + 1.2) * 8
    },
    onClick() {
        console.log("yay")
    },
    onMouseOver() {
        console.log("hi")
    },
    onMouseLeave() {
        console.log("bye")
    },
    update() {
        //this.width += 1
        //setDir(this, 135)
    },
    layer: 'lostcat',
}

const Trout = {
    image: "resources/fish/Trout.svg",
    width: 75,
    height: 75,
    spread: 20,
    gravity: 2,
    time: 2,
    rotation(id) {
        return 20 * (id - 1.5) + (Math.random() - 0.5) * 10
    },
    dir() {
        return (Math.random() - 0.5) * 10
    },
    speed() {
        return (Math.random() + 1.2) * 8
    },
    onClick() {
        console.log("yay")
    },
    onMouseOver() {
        console.log("hi")
    },
    onMouseLeave() {
        console.log("bye")
    },
    update() {
        //this.width += 1
        //setDir(this, 135)
    },
    layer: 'lostcat',
}

const Clownfish = {
    image: "resources/fish/Clownfish.svg",
    width: 75,
    height: 75,
    spread: 20,
    gravity: 1,
    time: 3,
    rotation(id) {
        return 20 * (id - 1.5) + (Math.random() - 0.5) * 10
    },
    dir() {
        return (Math.random() - 0.5) * 10
    },
    speed() {
        return (Math.random() + 1.2) * 8
    },
    onClick() {
        console.log("yay")
    },
    onMouseOver() {
        console.log("hi")
    },
    onMouseLeave() {
        console.log("bye")
    },
    update() {
        //this.width += 1
        //setDir(this, 135)
    },
    layer: 'lostcat',
}