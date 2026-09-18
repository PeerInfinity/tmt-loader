addLayer("a", {
    name: "achievements", // This is optional, only used in a few places. If absent, it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized.
    position: 0, // Horizontal position within a row. By default, it uses the layer id and sorts in alphabetical order.
    startData() { 
        return {
            unlocked: true,
            points: new Decimal(0),
        }
    },
    color: "#EFCC04",
    resource: "achievements", // Name of prestige currency.
    type: "none", // 'normal': cost to gain currency depends on amount gained. 'static': cost depends on how much you already have.
    row: "side", // Row the layer is in on the tree (0 is the first row).
    layerShown() { 
        return true
    },
    achievements: {         
        11: {
            name: "Science!",
            done() {
                if (hasUpgrade("h",24)) {
                    return true
                }
                else {
                    return false
                }
            },
            tooltip: "Unlock Scientific Discovery",
            onComplete() {
                player.a.points = player.a.points.add(1)
            },
        },
        12: {
            name: "Stellar Inspiration",
            done() {
                if (hasAchievement("a",11) && (player.h.points.gte(100))) {
                    return true
                }
                else {
                    return false
                }
            },
            tooltip: "Reach 100 hydrogen in scientific discovery.",
            onComplete() {
                player.a.points = player.a.points.add(1)
            },
            unlocked() {
                if (hasAchievement("a",11)) {
                    return true
                } else {
                    return false
                }
            },
        },
        13: {
            name: "Oxygen?",
            done() {
                if (layerShown("o")) {
                    return true
                }
                else {
                    return false
                }
            },
            tooltip: "Unlock Oxygen Layer",
            onComplete() {
                player.a.points = player.a.points.add(1)
            },
            unlocked() {
                if (hasAchievement("a",12)) {
                    return true
                } else {
                    return false
                }
            },
        },
        14: {
            name: "Cleaning fluid",
            done() {
                if (player.h.points.gte(300) && player.o.points.gte(300)) {
                    return true
                }
                else {
                    return false
                }
            },
            tooltip: "Reach 300 hydrogen & 300 oxygen for hydrogen peroxide",
            onComplete() {
                player.a.points = player.a.points.add(1)
            },
            unlocked() {
                if (hasAchievement("a",13)) {
                    return true
                } else {
                    return false
                }
            },
        },
        15: {
            name: "It's H2O",
            done() {
                if (layerShown("w")) {
                    return true
                }
                else {
                    return false
                }
            },
            tooltip: "Unlock Water Layer",
            onComplete() {
                player.a.points = player.a.points.add(1)
            },
            unlocked() {
                if (hasAchievement("a",14)) {
                    return true
                } else {
                    return false
                }
            },
        },
        21: {
            name: "Water Power",
            done() {
                if (player.w.points.gte(50)) {
                    return true
                }
                else {
                    return false
                }
            },
            tooltip: "Get 50 water",
            onComplete() {
                player.a.points = player.a.points.add(1)
            },
            unlocked() {
                if (hasAchievement("a",15)) {
                    return true
                } else {
                    return false
                }
            },
        },
        22: {
            name: "CNO Death Star",
            done() {
                if (hasUpgrade("d",14)) {
                    return true
                }
                else {
                    return false
                }
            },
            tooltip: "Get the hydrogen upgrade 'CNO Cycle' and obtain gases",
            onComplete() {
                player.a.points = player.a.points.add(1)
            },
            unlocked() {
                if (hasAchievement("a",21)) {
                    return true
                } else {
                    return false
                }
            },
        },
    },
})
