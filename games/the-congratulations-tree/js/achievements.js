
// A side layer with achievements, with no prestige
addLayer("achievements", {
    name: "achievements", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    image: "resources/StarWow.svg",
    startData() {
        return {
            unlocked: true,
            points: decimalZero,
        }
    },
    nodeStyle() {
        return {
            "background-size": "120%",
            "background-repeat": "no-repeat",
            "background-position": "center",
        }
    },
    color: "#dec72d",
    resource: "Achievement Score",
    row: "side",
    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("Achievements")
    },
    achievementPopups: true,
    achievements: {
        11: {
            image: "resources/Moon.svg",
            name: "Self insert",
            done() {
                return hasUpgrade("main", 16)
            },
            onComplete() {
                player[this.layer].points = player[this.layer].points.add(1)
            },
            goalTooltip: "Unlock the Moon Layer<br>Reward: 3.90x Congratulations Buttons", // Shows when achievement is not completed
            doneTooltip: "Unlock the Moon Layer<br>Reward: 3.90x Congratulations Buttons", // Showed when the achievement is completed
            style: {
                "height": "100px",
                "width": "100px",
                "corner-shape": "squircle",
                "background-repeat": "no-repeat",
                "background-position": "center",
            },
        },
        12: {
            image: "resources/Liz.svg",
            name: "I scream you scream",
            done() {
                return hasUpgrade("main", 21)
            },
            onComplete() {
                player[this.layer].points = player[this.layer].points.add(1)
            },
            goalTooltip: "Unlock the Liz Layer<br>Reward: 4.00x Runes", // Shows when achievement is not completed
            doneTooltip: "Unlock the Liz Layer<br>Reward: 4.00x Runes", // Showed when the achievement is completed
            style: {
                "height": "100px",
                "width": "100px",
                "corner-shape": "squircle",
                "background-repeat": "no-repeat",
                "background-position": "center",
            },
        },
        13: {
            image: "resources/Cud.svg",
            name: "Best Buddy",
            done() {
                return hasUpgrade("main", 26)
            },
            onComplete() {
                player[this.layer].points = player[this.layer].points.add(1)
            },
            goalTooltip: "Unlock the Cud Layer<br>Reward: 7.00x Congratulations Buttons and Runes", // Shows when achievement is not completed
            doneTooltip: "Unlock the Cud Layer<br>Reward: 7.00x Congratulations Buttons and Runes", // Showed when the achievement is completed
            style: {
                "height": "100px",
                "width": "100px",
                "corner-shape": "squircle",
                "background-repeat": "no-repeat",
                "background-position": "center",
            },
        },
        14: {
            image: "resources/Lostcat.svg",
            name: "Cat Fishing",
            done() {
                return hasUpgrade("moon", 16)
            },
            onComplete() {
                player[this.layer].points = player[this.layer].points.add(1)
            },
            goalTooltip: "Unlock the Lostcat Layer<br>Reward: 4.00x Congratulations Buttons and 1.30x Planets", // Shows when achievement is not completed
            doneTooltip: "Unlock the Lostcat Layer<br>Reward: 4.00x Congratulations Buttons and 1.30x Planets", // Showed when the achievement is completed
            style: {
                "height": "100px",
                "width": "100px",
                "corner-shape": "squircle",
                "background-repeat": "no-repeat",
                "background-position": "center",
            },
        },
        15: {
            image: "resources/Fizzy.svg",
            name: "Fizared",
            done() {
                return hasUpgrade("liz", 15)
            },
            onComplete() {
                player[this.layer].points = player[this.layer].points.add(1)
            },
            goalTooltip: "Unlock the Fizzy Layer<br>Reward: 7.00x H-E-B Creamy Creations Neapolitan Ice Creams and Amoebas", // Shows when achievement is not completed
            doneTooltip: "Unlock the Fizzy Layer<br>Reward: 7.00x H-E-B Creamy Creations Neapolitan Ice Creams and Amoebas", // Showed when the achievement is completed
            style: {
                "height": "100px",
                "width": "100px",
                "corner-shape": "squircle",
                "background-repeat": "no-repeat",
                "background-position": "center",
            },
        },
    },
},
)