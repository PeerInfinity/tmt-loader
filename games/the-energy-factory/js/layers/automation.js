
// A side layer with achievements, with no prestige
addLayer("auto", {
    symbol: "Atm",
    startData() {
        return {
            unlocked: true,
            autoEnGen1: false,
            autoEnGen2: false,
            autoEnGen3: false,
            autoEnGen4: false,
            autoEnGen5: false,
            autoEnGen6: false,

            autoEnChar1: false,
        }
    },
    color: "#C8C8C8",
    row: "side",
    layerShown() { return hasMilestone("surge", 3) || hasAchievement("ach", 24) },
    tooltip() {
        return ("Automation")
    },

    tabFormat: [
        "buyables",
    ],
    componentStyles: {
        "buyable"() { return { "height": "100px", "width": "100px" } }
    },
    buyables: {
        11: {
            title() { return "Auto Energy Generator #1" },
            display() {
                if (player.auto.autoEnGen1) {
                    return "Active"
                }
                return "Inactive"
            },
            canAfford() {
                return true
            },
            buy() {
                player.auto.autoEnGen1 = !player.auto.autoEnGen1
            },
            unlocked() {
                return hasMilestone("surge", 3)
            },
            style() {
                return player.auto.autoEnGen1 ? { "background-color": "#00C800" } : { "background-color": "#C80000" }
            },
        },
        12: {
            title() { return "Auto Energy Generator #2" },
            display() {
                if (player.auto.autoEnGen2) {
                    return "Active"
                }
                return "Inactive"
            },
            canAfford() {
                return true
            },
            buy() {
                player.auto.autoEnGen2 = !player.auto.autoEnGen2
            },
            unlocked() {
                return hasMilestone("surge", 4)
            },
            style() {
                return player.auto.autoEnGen2 ? { "background-color": "#00C800" } : { "background-color": "#C80000" }
            },
        },
        13: {
            title() { return "Auto Energy Generator #3" },
            display() {
                if (player.auto.autoEnGen3) {
                    return "Active"
                }
                return "Inactive"
            },
            canAfford() {
                return true
            },
            buy() {
                player.auto.autoEnGen3 = !player.auto.autoEnGen3
            },
            unlocked() {
                return hasMilestone("surge", 4)
            },
            style() {
                return player.auto.autoEnGen3 ? { "background-color": "#00C800" } : { "background-color": "#C80000" }
            },
        },
        14: {
            title() { return "Auto Energy Generator #4" },
            display() {
                if (player.auto.autoEnGen4) {
                    return "Active"
                }
                return "Inactive"
            },
            canAfford() {
                return true
            },
            buy() {
                player.auto.autoEnGen4 = !player.auto.autoEnGen4
            },
            unlocked() {
                return hasAchievement("ach", 24)
            },
            style() {
                return player.auto.autoEnGen4 ? { "background-color": "#00C800" } : { "background-color": "#C80000" }
            },
        },
        15: {
            title() { return "Auto Energy Generator #5" },
            display() {
                if (player.auto.autoEnGen5) {
                    return "Active"
                }
                return "Inactive"
            },
            canAfford() {
                return true
            },
            buy() {
                player.auto.autoEnGen5 = !player.auto.autoEnGen5
            },
            unlocked() {
                return hasAchievement("ach", 25)
            },
            style() {
                return player.auto.autoEnGen5 ? { "background-color": "#00C800" } : { "background-color": "#C80000" }
            },
        },
        16: {
            title() { return "Auto Energy Generator #6" },
            display() {
                if (player.auto.autoEnGen6) {
                    return "Active"
                }
                return "Inactive"
            },
            canAfford() {
                return true
            },
            buy() {
                player.auto.autoEnGen6 = !player.auto.autoEnGen6
            },
            unlocked() {
                return hasAchievement("ach", 25)
            },
            style() {
                return player.auto.autoEnGen6 ? { "background-color": "#00C800" } : { "background-color": "#C80000" }
            },
        },
        24: {
            title() { return "Auto Energy Charger" },
            display() {
                if (player.auto.autoEnChar1) {
                    return "Active"
                }
                return "Inactive"
            },
            canAfford() {
                return true
            },
            buy() {
                player.auto.autoEnChar1 = !player.auto.autoEnChar1
            },
            unlocked() {
                return hasAchievement("ach", 36)
            },
            style() {
                return player.auto.autoEnChar1 ? { "background-color": "#00C800" } : { "background-color": "#C80000" }
            },
        },
    },
})