addLayer("Achievements", {
    name: "Achievements", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "AC", // This appears on the layer's node. Default is the id with the first letter capitalized
    row: "side", // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
    }},
    color: "#7fffd4",
    tooltip: "",
    clickables: {
        11: {
            title() {return "Click!"},
            canClick() {return true}
        }
    },
    achievements: {
        11: {
            name: "To begin",
            done() {return player.Nanoprestige.points.gte(1)},
            tooltip: "Nanoprestige for the first time. Makes Nanoprestiges boost production.",
            image() {
                if (hasAchievement("Achievements", 11)) return "js/images/Achievements/ach11.png"
                else return "js/images/unearn.png"
            },
            style: {
                width:"128px",
                height:"128px"
            }
        },
        12: {
            name: "A new layer already?",
            done() {return player.Microprestige.points.gte(1)},
            tooltip: "Microprestige for the first time. Makes Microprestiges boost production.",
            image() {
                if (hasAchievement("Achievements", 12)) return "js/images/Achievements/ach12.png"
                else return "js/images/unearn.png"
            },
            style: {
                width:"128px",
                height:"128px"
            }
        },
        13: {
            name: "Slowdown",
            done() {return player.Miniprestige.points.gte(1)},
            tooltip: "Miniprestige for the first time. Makes Miniprestiges boost production.",
            image() {
                if (hasAchievement("Achievements", 13)) return "js/images/Achievements/ach13.png"
                else return "js/images/unearn.png"
            },
            style: {
                width:"128px",
                height:"128px"
            }
        },
        21: {
            name: "Impossible?",
            done() {return player.Smallprestige.points.gte(1)},
            tooltip: "Small prestige for the first time. Makes Small Prestiges boost production.",
            image() {
                if (hasAchievement("Achievements", 21)) return "js/images/Achievements/ach21.png"
                else return "js/images/unearn.png"
            },
            style: {
                width:"128px",
                height:"128px"
            }
        },
        22: {
            name: "Only grindier from here",
            done() {return player.Partialprestige.points.gte(1)},
            tooltip: "Partial prestige for the first time. Makes Partial Prestiges boost production."
            ,
            image() {
                if (hasAchievement("Achievements", 22)) return "js/images/Achievements/ach22.png"
                else return "js/images/unearn.png"
            },
            style: {
                width:"128px",
                height:"128px"
            }
        },
        23: {
            name: "Haha! I did it! Oh, wait, no, there's still four more layers.",
            done() {return false},
            tooltip: "Full prestige for the first time. Makes Full Prestiges boost production."
            ,
            image() {
                if (hasAchievement("Achievements", 23)) return "js/images/Achievements/ach22.png"
                else return "js/images/unearn.png"
            },
            style: {
                width:"128px",
                height:"128px"
            }
        },
        31: {
            name: "Another layer with M? This is getting out of hand",
            done() {return false},
            tooltip: "Multiprestige for the first time. Makes Multiprestiges boost production."
            ,
            image() {
                if (hasAchievement("Achievements", 31)) return "js/images/Achievements/ach22.png"
                else return "js/images/unearn.png"
            },
            style: {
                width:"128px",
                height:"128px"
            }
        },
        32: {
            name: "Oh, so like ADHD?",
            done() {return false},
            tooltip: "Hyperprestige for the first time. Makes Hyperprestiges boost production."
            ,
            image() {
                if (hasAchievement("Achievements", 32)) return "js/images/Achievements/ach22.png"
                else return "js/images/unearn.png"
            },
            style: {
                width:"128px",
                height:"128px"
            }
        },
        33: {
            name: "Pretend I said something funny here",
            done() {return false},
            tooltip: "Ultraprestige for the first time. Makes Ultraprestiges boost production."
            ,
            image() {
                if (hasAchievement("Achievements", 33)) return "js/images/Achievements/ach22.png"
                else return "js/images/unearn.png"
            },
            style: {
                width:"128px",
                height:"128px"
            }
        },
        41: {
            name: "FINALE",
            done() {return false},
            tooltip: "Final prestige for the first time. Ends the game."
            ,
            image() {
                if (hasAchievement("Achievements", 41)) return "js/images/Achievements/ach22.png"
                else return "js/images/unearn.png"
            },
            style: {
                width:"384px",
                height:"384px"
            }
        },

    },
    tabFormat: {
        "Achievements": {content: ["clickables", "achievements"],}


    },
    layerShown(){return true}
})
addLayer("Unlockers", {
    name: "Unlockers", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "UC", // This appears on the layer's node. Default is the id with the first letter capitalized
    row: "side", // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
    }},
    color: "#6543B3",
    tooltip: "",
    achievementPopups: false,
    clickables: {
        11: {
            title() {return "Click!"},
            canClick() {return true}
        }
    },
    achievements: {
        11: {
            done() {return player.Miniprestige.best.gte(1)},
            tooltip: "1 Miniprestige<br>Unlocks:<br> N upgrades 11, 12, 21, 22<br> μ upgrades 11, 12, 13",
            image() {
                if (hasAchievement("Unlockers", 11)) return "js/images/Unlockers/unl11.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
        12: {
            done() {return player.Microprestige.best.gte(5)},
            tooltip: "5 Microprestiges<br>Unlocks:<br> N upgrades 13, 23",
            image() {
                if (hasAchievement("Unlockers", 12)) return "js/images/Unlockers/unl12.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
        13: {
            done() {return player.Nanoprestige.best.gte(55)},
            tooltip: "55 Nanoprestiges<br>Unlocks:<br> N upgrade 31, 32, 33 μ upgrade 21,",
            image() {
                if (hasAchievement("Unlockers", 13)) return "js/images/Unlockers/unl13.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
        14: {
            done() {return player.Microprestige.best.gte(7)},
            tooltip: "7 Microprestiges<br>Unlocks:<br> N upgrade 14,24,34",
            image() {
                if (hasAchievement("Unlockers", 14)) return "js/images/Unlockers/unl14.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
        15: {
            done() {return player.Miniprestige.best.gte(2)},
            tooltip: "2 Miniprestiges<br>Unlocks:<br> μ upgrades 22,23",
            image() {
                if (hasAchievement("Unlockers", 15)) return "js/images/Unlockers/unl15.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
        16: {
            done() {return player.Microprestige.best.gte(10)},
            tooltip: "10 Microprestiges<br>Unlocks:<br> N upgrades 41,42,43,44",
            image() {
                if (hasAchievement("Unlockers", 16)) return "js/images/Unlockers/unl16.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
        21: {
            done() {return player.Microprestige.best.gte(17)},
            tooltip: "17 Microprestiges<br>Unlocks:<br> N upgrades 15,25,35,45",
            image() {
                if (hasAchievement("Unlockers", 21)) return "js/images/Unlockers/unl21.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
        22: {
            done() {return player.Miniprestige.best.gte(3)},
            tooltip: "3 Miniprestiges<br>Unlocks:<br> μ upgrades 31,32,33",
            image() {
                if (hasAchievement("Unlockers", 22)) return "js/images/Unlockers/unl22.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
        23: {
            done() {return player.Microprestige.best.gte(40)},
            tooltip: "40 Microprestiges<br>Unlocks:<br> N upgrades 51,52,53,54,55",
            image() {
                if (hasAchievement("Unlockers", 23)) return "js/images/Unlockers/unl23.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
        24:{
            done() {return player.Smallprestige.best.gte(1)},
            tooltip: "1 Smallprestige<br>Unlocks:<br> M upgrades 11, 12",
            image() {
                if (hasAchievement("Unlockers", 24)) return "js/images/Unlockers/unl24.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
        25:{
            done() {return player.Microprestige.best.gte(210)},
            tooltip: "210 Microprestige<br>Unlocks:<br> u upgrade 24",
            image() {
                if (hasAchievement("Unlockers", 25)) return "js/images/Unlockers/unl25.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
        26:{
            done() {return player.Miniprestige.best.gte(5)},
            tooltip: "5 miniprestige<br>Unlocks:<br> u upgrade 34",
            image() {
                if (hasAchievement("Unlockers", 26)) return "js/images/Unlockers/unl26.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
        31:{
            done() {return player.Microprestige.best.gte(358)},
            tooltip: "358 Microprestige<br>Unlocks:<br> u upgrade 41",
            image() {
                if (hasAchievement("Unlockers", 31)) return "js/images/Unlockers/unl31.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
        32:{
            done() {return player.Microprestige.best.gte(739)},
            tooltip: "739 Microprestiges<br>Unlocks:<br> u upgrade 42, 43",
            image() {
                if (hasAchievement("Unlockers", 32)) return "js/images/Unlockers/unl32.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
        33:{
            done() {return player.BrokenNano.best.gte(100)},
            tooltip: "100 Nanoprestige Fragments<br>Unlocks:<br> N upgrade 61, 62, 63, 64, 65",
            image() {
                if (hasAchievement("Unlockers", 33)) return "js/images/Unlockers/unl33.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
        34:{
            done() {return hasUpgrade("Miniprestige", 13)},
            tooltip: "Mini upgrade 13. Unlocks BN upgrades 12, 13, 14, 15",
            image() {
                if (hasAchievement("Unlockers", 34)) return "js/images/Unlockers/unl34.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
        35: {
            done() {return player.Smallprestige.best.gte(2)},
            tooltip: "2 Smallprestige. Unlocks:<br> N upgrade 71, 72, 73, 74, 75<br> u upgrade 15, 25, 35, 45 <br> M upgrade 21, 22, 23",
            image() {
                if (hasAchievement("Unlockers", 35)) return "js/images/Unlockers/unl35.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
        36: {
            done() {return player.Smallprestige.best.gte("3")},
            tooltip: "3 Smallprestige. Unlocks:<br> BN upgrade 21, 22, 23, 24, 25",
            image() {
                if (hasAchievement("Unlockers", 36)) return "js/images/Unlockers/unl36.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }

        },
        41: {
            done() {return hasMilestone("BNCommunal", 4)},
            tooltip: "9 Communals. Unlocks:<br> N upgrade 81, 82, 83, 84, 85",
            image() {
                if (hasAchievement("Unlockers", 41)) return "js/images/Unlockers/unl41.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }

        },
        42: {
            done() {return hasUpgrade("Nanoprestige", 13)},
            tooltip: "Nano upgrade 13. Shows Buyable menu on Nanoprestige.",
            image() {
                if (hasAchievement("Unlockers", 42)) return "js/images/Unlockers/unl42.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
        43: {
            done() {return hasUpgrade("Nanoprestige", 44)},
            tooltip: "Nano upgrade 44. Shows Challenge menu on Nanoprestige.",
            image() {
                if (hasAchievement("Unlockers", 43)) return "js/images/Unlockers/unl43.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
        44: {
            done() {return hasUpgrade("Microprestige", 14)},
            tooltip: "Micro upgrade 14. Shows Buyable menu on Microprestige.",
            image() {
                if (hasAchievement("Unlockers", 44)) return "js/images/Unlockers/unl44.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
        45: {
            done() {return player.Partialprestige.points.gte(1)},
            tooltip: "1 Partialprestige. Unlocks a buyable for Miniprestige, and a few upgrades.",
            image() {
                if (hasAchievement("Unlockers", 45)) return "js/images/Unlockers/unl45.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
        46: {
            done() {return hasUpgrade("CMEnlarge", 11)},
            tooltip: "Purchase NANO ENLARGEMENT. Unlocks Nano upgrades 91, 92, 93, 94, and 95.",
            image() {
                if (hasAchievement("Unlockers", 46)) return "js/images/Unlockers/unl46.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
        51: {
            done() {return hasUpgrade("CMEnlarge", 31)},
            tooltip: "Purchase MICRO ENLARGEMENT. Unlocks Micro upgrades 61, 62, 63, 64, and 65.",
            image() {
                if (hasAchievement("Unlockers", 51)) return "js/images/Unlockers/unl51.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
        52: {
            done() {return hasUpgrade("CMEnlarge", 32)},
            tooltip: "Purchase MINI ENLARGEMENT. Unlocks Mini upgrades 31, 32, 33, and 34.",
            image() {
                if (hasAchievement("Unlockers", 52)) return "js/images/Unlockers/unl52.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
        53: {
            done() {return hasUpgrade("CMEnlarge", 33)},
            tooltip: "Purchase SMALL ENLARGEMENT. Unlocks Small upgrades 11, 12, 13, 14, and 15.",
            image() {
                if (hasAchievement("Unlockers", 53)) return "js/images/Unlockers/unl53.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
        54: {
            done() {return hasUpgrade("CMEnlarge", 51)},
            tooltip: "Purchase BUYABLE ENLARGEMENT. Unlocks 1 buyable in Nano, Micro, and Broken Nano, Mini, and Small. Also unlocks Microfinale.",
            image() {
                if (hasAchievement("Unlockers", 54)) return "js/images/Unlockers/unl54.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
        55: {
            done() {return hasUpgrade("Smallprestige", 11)},
            tooltip: "Purchase Smallprestige upgrade 11. Unlocks the Small Force minigame.",
            image() {
                if (hasAchievement("Unlockers", 55)) return "js/images/Unlockers/unl54.png"
                else return "js/images/noUnlock.png"
            },
            style: {
                width:"64px",
                height:"64px"
            }
        },
    },
    tabFormat: {
        "Unlockers": {content: ["resource-display",  "clickables", "achievements",],}


    },

    layerShown(){return hasAchievement("Miniprestige", 11)}
})