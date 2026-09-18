addLayer("eh", {
    startData() {return {
        unlocked() {return player.universe.points.gte(80)},
        points: new Decimal(0),
        resetTime: 0,
        pointProd() {
            if (player.universe.points.gte(80)) {
                let logBase = new Decimal("ee12")
                let powBase = new Decimal("1.25")
                let divBase = new Decimal("2.35")
                let base = player.points.pow(powBase).log(logBase).div(divBase).times(3600)
                return base
            } else {
                return new Decimal(0)
            }
        },

        canEnterBH() {
            return (
                false

                // Insert requirements here...
            )
        }
    }},
    symbol: "<big><big><big>END?</big></big></big>",
    color: "#FFCC00",
    layerShown() {return player.universe.points.gte(80)},
    type: "none",
    row: 1000,
    nodeStyle() {return {
        "width":"200px",
        "height":"200px",
        "background":"#D98611",
        "background":`radial-gradient(at center, #D98611, #954200 70%)`,
        "box-shadow": `0 0 ${Number(player.universe.points.times(Math.abs(Math.sin(Number(player.timePlayed)))))}px #D9861199`

    }},
    update() {
    },
    componentStyles: {
        "microtabs"() {return {"border-color":"transparent"}},
        "upgrade"() {return {"width":"550px", "height":"100px", "border-radius":"20px"}}
    },
    resource: "Singularities",
    tooltip: "???",
    microtabs: {
        index: {
            "TDN": {
                content: ["blank", ["display-text", "Time Dilation Network"]]
            },

            "PUN": {
                content: ["blank", ["display-text", "Permanent Upgrade Network"], "blank", ["microtabs", "upgradeNetwork"]]
            },

            "...": {
                content: ["blank", ["display-text", "<text style='color: #FC0; text-shadow: 0 0 3px #FC0'>Requirements</text><br><br><small><gray>Complete ALL Achievements (Excluding Secret Achievements and Red Achievements)<br>Complete ALL Challenges (Excluding \"SIN\" Category)<br>Prestige ALL capable layers at least 30 times<br>Unlock and discover ALL layer artifacts<br>Unlock ALL Destroyed Universe Milestones<br>Purchase ALL Modules in this node</gray></small>"], "blank", "blank", ["clickables", 11]]
            }
        },

        upgradeNetwork: {
            "Production": {
                content: ["blank", ["upgrades", [1]]]
            },

            "Permabuffs": {
                content: ["blank", ["upgrades", [21, 22, 23, 24]]]
            },

            "Features": {
                content: ["blank", ["display-text", function() {
                    let txt = ``

                    if (hasUpgrade("eh", 611)) txt += `Total Effect from <text style="color: ${temp.eh.color}; text-shadow: 0 0 3px ${temp.eh.color}">Crude Stabilization Module</text>: x<sup>${format(upgradeEffect("eh", 611))}</sup> Points<br>`

                    return txt
                }], "blank", ["upgrades", [61, 62, 63, 64]]]
            }
        }
    },
    tabFormat: [
        "main-display",
        ["display-text", "<small>Nothing here works yet.</small>"],
        "blank",
        ["microtabs", "index"]
    ],
    effectDescription() {return `gaining ${formatSmall(player.eh.pointProd(), 2)}/sec.`},
    clickables: {
        11: {
            display: "<h2>Enter the Black Hole</h2>",
            unlocked() {return player.eh.unlocked()},
            canClick() {return false},
            style() {return {"width":"200px", "height":"200px"}}
        }
    },
    upgrades: {
        columns: 1,
        11: {
            title: "<h2><novamono>Crude Hawking Capture Module</novamono></h2>",
            description: "Singularity gain is stronger based on God Particles at a heavily nerfed rate. However, God Particle gain and Prestige Essence gain is halved.<br><br>",
            cost: new Decimal(50),
            unlocked() {return false}
        },

        211: {
            title: "<h2><novamono>Greed Module</novamono></h2>",
            description: "Multiply Point and Money gain by 1e30,000. Prestige Essence gain is multiplied by 2.25 and gain 5% more Singularities. However, gain 0.0005 times more Globs and multiply Booster costs by 1.00e250.<br>",
            cost: new Decimal(250),
            unlocked() {return false}
        },

        221: {
            title: "<h2><novamono>Omnicide Module</novamono></h2>",
            description: "Multiply Latex Globs gain by 1.00e7,500 and multiply colored globs gain by 2.5 except True Globs. Multiply True Globs gain by 1.22. However, gain 75% less Prestige Essence and 1% less Singularities.<br>",
            cost: new Decimal(12500),
            unlocked() {return false}
        },

        231: {
            title: "<h2><novamono>Pride Module</novamono></h2>",
            description: "Multiply speed by 1,000 and divide \"Motivation\" costs by 1.00e800. The third distance milestone is significantly more effective and the first distance milestone is slightly stronger. However, divide Money and Point gain by 1e100,000.<br>",
            cost: new Decimal(625000),
            unlocked() {return false}
        },

        241: {
            title: "<h2><novamono>Sloth Module</novamono></h2>",
            description: "The hardcaps of the first two booster effects are 100,000 OoMs later per million at base and the booster effect scales twice as fast. Golden Booster's scaling effect is 5% more effective and Heavy Booster's scaling effect is 7% more effective. However, the effect from prestiging Sorbet's layer is 10% weaker and gain 10% less Prestige Essence.",
            cost: new Decimal(8000000),
            unlocked() {return false}
        },

        611: {
            title: "<h2><novamono>Crude Stabilization Module</novamono></h2>",
            description: "Destroying a universe no longer resets anything but points. Grants an extremely heavy debuff on point production that diminishes over time and time dilation is set to 1.00 while the nerf is active.<br>",
            cost: new Decimal(500),
            unlocked() {return true},
            effect() {                
                let nerfTimeMax = new Decimal(700)
                if (hasUpgrade("eh", 621)) nerfTimeMax = nerfTimeMax.add(500)
                if (hasUpgrade("eh", 631)) nerfTimeMax = nerfTimeMax.add(200)
                if (hasUpgrade("eh", 641)) nerfTimeMax = nerfTimeMax.sub(75)
                
                let time = new Decimal(player.universe.resetTime)

                let base = new Decimal(0).add(new Decimal(1).div(nerfTimeMax).times(time))

                if (base.gte(1)) base = new Decimal(1)

                return base
            }
        },

        621: {
            title: "<h2><novamono>Critical Destruction Module</novamono></h2>",
            description: "Destroying a universe has a chance to grant more than one universe. However, the nerf from <b>Crude Stabilization Module</b> takes much longer to dissipate and the time dilation is reduced to 0.80 while the nerf is active.<br>",
            cost: new Decimal(10000),
            tooltip: "+1 Universe (25%)<br>+2 Universes (5%)<br>+3 Universes(1%)<br>+4 Universes(0.08%)"
        },

        631: {
            title: "<h2><novamono>Pick-Me-Up Module</novamono></h2>",
            description: "Unlock a Prestige Essence buyable that provides an almost negligable boost to the base effects of all other buyables. However, <b>Crude Stabilization Module</b> has a longer nerf time until fully dissipating.<br>",
            cost: new Decimal("e7.77"),
            unlocked() {return false}
        },

        641: {
            title: "<h2><novamono>Endless Torment Module</novamono></h2>",
            description: "Unlock <b>totally</b> optional minigames while you wait for that next buyable level or upgrade or resource reset. <b>Crude Stabilization Module</b> takes ever-so-slightly less time to fully dissipate.<br><br>",
            cost: new Decimal("e8.88"),
            unlocked() {return false}
        }
    }
})