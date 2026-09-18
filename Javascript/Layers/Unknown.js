addLayer("lam", {
    startData() {return {
        unlocked() {return hasMilestone("ach", 11)},
        inputText: ``,
        inputs: [
            false,
            false,
            false,
        ],
        inputCount() {
            let amt = 0
            for (let i = 0; i < player.lam.inputs.length; i++) {
                const element = player.lam.inputs[i]

                if (element == true) amt++
            }
            return amt
        }
    }},
    update() {
    },
    type: "none",
    image: "",
    row: "side",
    layerShown() {return player.lam.unlocked},
    nodeStyle() {return {
        "background-size":"50%",
        "background-repeat":"no-repeat",
        "background-position":"center"
    }},
    color: "#000",
    tooltip: "???",
    tabFormat: [
        ["display-text", function() {return `<h2><nerfRed>${formatWhole(player.lam.inputCount())} ???</nerfRed></h2>`}],
        "blank", "blank", "blank",
        ["drop-down", ["a", [" ", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]]],
        "blank",
        "clickables",
        "blank",
        ["display-text", function() {return `<nerfRed><h2>${player.lam.inputText}</h2></nerfRed>`}]
    ],
    componentStyles: {
        "clickable"() {return {"color":"white"}},
    },
    clickables: {
        11: {
            display() {return `Enter Character`},
            unlocked() {return player.lam.unlocked},
            canClick() {return true},
            onClick() {insertCharText(player["lam"].a)}
        },

        12: {
            display() {return `Enter Uppercase Character`},
            unlocked() {return player.lam.unlocked},
            canClick() {return true},
            onClick() {insertCharText(player["lam"].a, true)}
        },

        13: {
            display() {return `Clear Field`},
            unlocked() {return player.lam.unlocked},
            canClick() {return true},
            onClick() {insertCharText("CLEAR")}
        },

        14: {
            display() {return `Enter Field`},
            unlocked() {return player.lam.unlocked},
            canClick() {return true},
            onClick() {insertCharText("ENTER")}
        }
    }
})