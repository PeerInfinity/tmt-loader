addLayer("d", {
    name: "discovery", // This is optional, only used in a few places. If absent, it just uses the layer id.
    symbol: `<img src="resources/icon/sciencebeaker.png" alt="D" class="icon-img-small">`, // This appears on the layer's node. Default is the id with the first letter capitalized.
    position: 1, // Horizontal position within a row. By default, it uses the layer id and sorts in alphabetical order.
    row: "side", // Row the layer is in on the tree (0 is the first row).
    startData() { 
        return {
            unlocked: true,
            points: new Decimal(0),
        }
    },
    color: "#8C62EC",
    resource: "discoveries", // Name of prestige currency.
    type: "none", // 'normal': cost to gain currency depends on amount gained. 'static': cost depends on how much you already have.
    layerShown() { return (hasUpgrade("h", 24) || hasAchievement("a", 11)) },
    bars: {
        progressBar: {
            direction: RIGHT,
            width: 600,
            height: 50,
            textStyle: {
                "color": "#009918"
            },
            baseStyle: {
                "color": "#272727"
            },
            fillStyle: {
                "color": "#B4DCDF"
            },
            progress() { 
                if (!hasUpgrade("d",13)) {
                    return player.h.points.divide(100)
                } else if (hasUpgrade("d",13) && !hasUpgrade("d",14)) {
                    if (player.h.points.gt(300) && player.o.points.gt(300)) {
                        return new Decimal(1)
                    } else if (player.h.points.gt(300) && !player.o.points.gt(300)) {
                        return player.o.points.divide(300).divide(2).add(0.5)
                    } else if (player.o.points.gt(300) && !player.h.points.gt(300)) {
                        return player.h.points.divide(300).divide(2).add(0.5)
                    } else {
                        return player.h.points.divide(300).divide(2).add(player.o.points.divide(300).divide(2))
                    }
                } else if (hasUpgrade("d",14)) {
                    if (player.w.points.gt(50)) {
                        return new Decimal(1)
                    } else {
                        return player.w.points.divide(50)
                    }
                } else {
                    return new Decimal(0)
                }
            },
            display() {
                if (!hasUpgrade("d",13)) {
                    return "Reach 100 Hydrogen to unlock next reward"
                } else if (hasUpgrade("d",13) && !hasUpgrade("d",14)) {
                    return "Reach 300 Hydrogen and Oxygen to unlock next reward"
                } else if (hasUpgrade("d",14)) {
                    return "Reach 50 Water to unlock next reward"
                } else {
                    return "Complete"
                }
            },
            unlocked() {
                return true
            }
        },
    },
    upgrades: {
        11: {
            title: "Triple Alpha Process",
            description: "Fuse three hydrogens to obtain the exotic...He, creating much energy in the process.",
            currencyLayer: "h",
            currencyInternalName: "points",
            currencyDisplayName: "hydrogen",
            cost: new Decimal(150),
            effect() {
                return player.h.points.add(1).pow(0.5).add(9).log10()
            },
            effectDisplay() { 
                return "^" + format(upgradeEffect(this.layer, this.id))
            },
            unlocked() {
                return hasAchievement("a", 12)
            },
        },
        12: {
            title: "Proton-Proton",
            description: "Unlock another way to create energy from pure hydrogen. Boost vapor gain by 3x",
            currencyLayer: "h",
            currencyInternalName: "points",
            currencyDisplayName: "hydrogen",
            cost: new Decimal(255),
            effect() {
                return new Decimal(3)
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
            unlocked() {
                return hasUpgrade("d",11)
            },
        },
        13: {
            title: "Stellar Fusion",
            description: "Using the same process as a supernova this will unlock...",
            currencyLayer: "h",
            currencyInternalName: "points",
            currencyDisplayName: "hydrogen",
            cost: new Decimal(550),
            unlocked() {
                return hasUpgrade("d",12)
            },
        },
        14: {
            title: "CNO Cycle",
            description: "Using the CNO cycle of stars we can find new elements.",
            currencyLayer: "h",
            currencyInternalName: "points",
            currencyDisplayName: "hydrogen",
            cost: new Decimal(2250),
            unlocked() {
                return hasAchievement("a", 21)
            },
        },
    },
    tabFormat: [
    "main-display",
    "bars",
    "blank",
    "upgrades",
    ],
})
