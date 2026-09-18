addLayer("universe", {
    startData() { return {
        unlocked: true,

        points: new Decimal(0),
        resetTime: 0,

        godParticles: new Decimal(0),
        godProduction() {
            if (player.universe.points.lt(10)) {
                return new Decimal(0)
            } else {
                let powBase = 0.15
                let base = player.universe.points.pow(powBase).div(100)
                if (hasUpgrade("universe", 31)) base = base.times(4.5)
                if (hasUpgrade("universe", 31)) base = base.times(buyableEffect("universe", 11))
                return base
            }
        },

        anger: new Decimal(1),

        effectText: ``,

        angerEffect() {
            let amt = player.universe.anger
            let powBase = new Decimal(2)
            if (hasMilestone("universe", 18)) powBase = powBase.add(new Decimal(0.01).times(player.universe.points))
            if (hasMilestone("universe", 22)) powBase = powBase.pow(4.25)
            if (hasMilestone("universe", 28)) powBase = powBase.pow(1.66)
            if (hasMilestone("universe", 36)) powBase = powBase.pow(1.29)
            if (hasMilestone("universe", 37)) powBase = powBase.pow(1.15)
            let base = amt.pow(powBase)
            if (hasMilestone("universe", 22)) base = base.pow(1.8)
            return base
        },

        challengesDone: new Decimal(0)
    }},
    gainMult() {
        let base = new Decimal(1)
        return base
    },
    update() {
        temp.universe.exponent = new Decimal(1.5).pow(player.universe.points.div(50))
        temp.universe.base = new Decimal("e16").times(new Decimal(10).pow(player.universe.points))

        let txt = ``
        if (hasUpgrade("universe", 11)) txt += `Total effect from upgrade <lightGlow->UNI(1-1)</lightglow->: x${format(upgradeEffect("universe", 11))} Points<br>`
        if (hasUpgrade("universe", 21)) txt += `Total effect from upgrade <lightGlow->UNI(2-1)</lightglow->: x${format(upgradeEffect("universe", 21))} Money<br>`
        player.universe.effectText = txt

        if (player.universe.points.gte(14)) {
            let mulBase = new Decimal(0.4)
            if (hasMilestone("universe", 32)) mulBase = mulBase.add(0.1)
            player.universe.anger = (new Decimal(1).add(mulBase)).pow(player.universe.points.sub(13))
        }

        if (inChallenge("universe", 11)) player.challengeName = "Dark Eternity MK1"
        else player.challengeName = ""
    },
    symbol() {return `Universe<br>${formatWhole(player.universe.points.add(1))}`},
    color: "#555",
    layerShown() {return true},
    requires: new Decimal("e14"),
    resource: "Destroyed Universes",
    baseResource: "Points",
    baseAmount() {return player.points},
    type: "static",
    exponent: new Decimal(1.5),
    base: new Decimal("e16"),
    row: 999,
    nodeStyle() {return {
        "width":"400px",
        "background":"linear-gradient(90deg, #333, #444)",
        "border-radius":"25px",
        "background-repeat":"no-repeat",
        "background-position":"center",
        "background-size":"125% 125%",
        "border":"3px solid #222",
    }},
    tooltip: "Multiverse",
    componentStyles: {
        "prestige-button"() {return {"width":"400px", "border-radius":"50px"}},
        "microtabs"() {return {"border-color":"transparent"}},
        "milestone"() {return {"width":"600px"}},
        "upgrade"() {return {"width":"200px"}},
        "clickable"() {return {"margin-bottom":"5px"}},
        "buyable"() {return {"width":"250px"}},
    },
    roundUpCost: true,
    prestigeButtonText() {return `Reset <big>ALL</big> previous progress except those in side layers and itself for a destroyed universe.<br><br>Required Points: <big>${formatWhole(player.points)}/${format(getNextAt("universe"))}</big> Points`},
    microtabs: {
        index: {
            Milestones: {
                content: ["blank", ["display-text", function() {
                    let txt = ``
                    if (hasMilestone("universe", 17)) {
                        txt += (`<br>Total effect from <text style="color: ${temp.universe.color}; text-shadow: 0 0 6px ${temp.universe.color}">(C1S1E7)</text>: x${format(player.universe.angerEffect())} Requirement Costs<br>`)
                    }
                    if (hasMilestone("universe", 38)) {
                        txt += (`Total effect from <text style="color: ${temp.universe.color}; text-shadow: 0 0 6px ${temp.universe.color}"> (C2S1E3)</text>: x<sup>${format(temp["universe"].milestones[38].effect)}</sup> Requirement Costs<br><br>`)
                    }
                    return txt
                }], "milestones"]
            },

            Replays: {
                content: ["blank", "clickables"]
            },

            GPR: {
                content: ["blank", ["display-text", function() {return `${formatSmall(player.universe.godParticles)} <lightGlow>God Particles</lightGlow><br><small>(${format(player.universe.godProduction())}/sec)`}], "blank", ["display-text", function() {if (player.universe.points.lt(10)) {return `Production starts at <big style="color: ${temp.universe.color}; text-shadow: 0 0 5px ${temp.universe.color}">10</big> Destroyed Universes`}}], "blank", ["microtabs", "god"]]
            },

            "Requirement Info": {
                content: ["blank", ["display-text", function() {return `Layer prestige formula: (1.00e14 &times; Base)<sup>Resource Amount<sup>Exponent</sup></sup> &times; Debuffs<br><br>Base formula: 1.00e16 * 10<sup>Resource Amount</sup><br><br>Exponent Formula: 1.5<sup>(Resource Amount / 50)</sup>`}], "blank", "hr", "blank", ["display-text", function() {return `Current Base: <lightglow->${format(temp.universe.base)}</lightglow-><br><br>Current Exponent: <lightglow->${format(temp.universe.exponent)}</lightglow->`}]]
            },

            Challenges: {
                content: ["blank", ["microtabs", "challengeTab"]],
                unlocked() {return player.universe.points.gte(81)}
            }
        },

        god: {
            Upgrades: {
                content: ["blank", ["display-text", function() {if (player.universe.points.lt(10)) return `<lightGlow>God Particle</lightGlow> upgrades unlock once you destroy 10 universes...`}], ["display-text", function() {return player.universe.effectText}], "blank", "upgrades"]
            },

            Buyables: {
                content: ["blank", ["display-text", function() {if ((hasUpgrade("universe", 31) === false)) return `<lightGlow>God Particle</lightGlow> buyables unlock once construct a particle collider...`}], "blank", "buyables"]
            }
        },

        challengeTab: {
            "Sorbet": {
                content: ["blank", "challenges"]
            }, 
        }
    },
    tabFormat: [
        "main-display",
        "blank",
        "prestige-button",
        ["display-text", function() {
            if (getNextAt("universe", false, "static").sub(player.points).div(getPointGen()).lte(0)) {
                return `<br>Estimated Time Until Destruction: <big><angerRed>Now...</angerRed></big>`
            } else {
                return `<br>Estimated Time Until Destruction: ${formatTimeEX(getNextAt("universe", false, "static").sub(player.points).div(getPointGen()), 6)}`
            }
        }],
        ["display-text", function() {if (player.universe.points.gte(13)) {return `<br><angerRed><rubik><big>Anger: ${format(player.universe.anger)}</big></rubik></angerRed>`}}],
        "blank",
        ["display-text", function() {return `Total Requirement Multiplier: x<big>${format(temp.universe.gainMult)}</big>`}],
        "blank",
        ["microtabs", "index"]
    ],
    milestones: {
        11: {
            requirementDescription: "<novamono>1 Destroyed Universe</novamono> (C1S1E1)",
            effectDescription() {return `<nerfRed>Point gain is divided by 1.5.</nerfRed><br><buffGreen>Unlock the 2<sup>nd</sup> row of Money upgrades.</buffGreen>`},
            done() {return player.universe.points.gte(1)}
        },

        12: {
            requirementDescription: "<novamono>2 Destroyed Universes</novamono> (C1S1E2)",
            effectDescription() {return `<nerfRed>Money gain is divided by 1.2.</nerfRed><br><buffGreen>Unlock the 3<sup>rd</sup> row of Money upgrades.</buffgreen>`},
            done() {return player.universe.points.gte(2)},
            unlocked() {return hasMilestone("universe", 11)}
        },

        13: {
            requirementDescription: "<novamono>3 Destroyed Universes</novamono> (C1S1E3)",
            effectDescription() {return `<nerfRed>M(1-1)'s effect scales 1% slower.</nerfRed><br><buffGreen>Unlock the 4<sup>th</sup> row of Money upgrades.</buffGreen>`},
            done() {return player.universe.points.gte(3)},
            unlocked() {return hasMilestone("universe", 12)}
        },

        14: {
            requirementDescription: "<novamono>6 Destroyed Universes</novamono> (C1S1E4)",
            effectDescription() {return `<nerfRed>M(1-3)'s effect is halved but never less than 1.</nerfRed><br><buffGreen>Unlock the last row of Money upgrades.</buffGreen>`},
            done() {return player.universe.points.gte(6)},
            unlocked() {return hasMilestone("universe", 13)}
        },

        15: {
            requirementDescription: "<novamono>13 Destroyed Universes</novamono> (C1S1E5)",
            effectDescription() {return `<nerfRed>Start gaining anger for every destroyed universe past this.</nerfRed><br><buffGreen>Unlock the first buyable in the Money layer.</buffGreen>`},
            done() {return player.universe.points.gte(13)},
            unlocked() {return hasMilestone("universe", 14)}
        },

        16: {
            requirementDescription: "<novamono>14 Destroyed Universes</novamono> (C1S1E6)",
            effectDescription() {return `<nerfRed>All Money upgrade effects scale 1% slower.</nerfRed><br><buffGreen>Unlock the other buyable in the Money layer.</buffGreen>`},
            done() {return player.universe.points.gte(14)},
            unlocked() {return hasMilestone("universe", 15)}
        },

        17: {
            requirementDescription: "<novamono>15 Destroyed Universes</novamono> (C1S1E7)",
            effectDescription() {return `<nerfRed>Anger now increases how many points are required to reset.</nerfRed><br><buffGreen>Unlock a third buyable that improves the previous two.</buffGreen>`},
            done() {return player.universe.points.gte(15)},
            unlocked() {return hasMilestone("universe", 16)}
        },

        18: {
            requirementDescription: "<novamono>16 Destroyed Universes</novamono> (C1S1E8)",
            effectDescription() {return `<nerfRed>Anger's effect gradually scales faster based on universes.</nerfRed><br><buffGreen>Unlock the ability to prestige the Money layer.</buffGreen>`},
            done() {return player.universe.points.gte(16)},
            unlocked() {return hasMilestone("universe", 17)}
        },

        19: {
            requirementDescription: "<novamono>19 Destroyed Universes</novamono> (C1S2E1)",
            effectDescription() {return `<nerfRed>Prestige Essence gain nerfs itself at a harsher rate.</nerfRed><br><buffGreen>Unlock a new layer.</buffGreen>`},
            done() {return player.universe.points.gte(19)},
            unlocked() {return hasMilestone("universe", 18)}
        },

        20: {
            requirementDescription: "<novamono>20 Destroyed Universes</novamono> (C1S2E2)",
            effectDescription() {return `<nerfRed>Prestiging the Money layer gives a weaker bonus.</nerfRed><br><buffGreen>Unlock a row of Booster upgrades.</buffGreen>`},
            done() {return player.universe.points.gte(20)},
            unlocked() {return hasMilestone("universe", 19)}
        },

        21: {
            requirementDescription: "<novamono>24 Destroyed Universes</novamono> (C1S2E3)",
            effectDescription() {return `<nerfRed> Unlock something? </nerfRed><br><buffGreen>Unlock the 2<sup>nd</sup> row of Booster upgrades.</buffGreen>`},
            done() {return player.universe.points.gte(24)},
            unlocked() {return hasMilestone("universe", 20)}
        },

        22: {
            requirementDescription: "<novamono>28 Destroyed Universes</novamono> (C1S2E4)",
            effectDescription() {return `<nerfRed>Anger's effect from (C1S1E7) is stronger.</nerfRed><br><buffGreen>Unlock the 3<sup>rd</sup> row of Booster upgrades.</buffGreen>`},
            done() {return player.universe.points.gte(28)},
            unlocked() {return hasMilestone("universe", 21)}
        },

        23: {
            requirementDescription: "<novamono>32 Destroyed Universes</novamono> (C1S2E5)",
            effectDescription() {return `<nerfRed>The first boost effect's softcap starts 15 OoMs earlier.</nerfRed><br><buffGreen>Unlock the 4<sup>th</sup> row of Booster upgrades.</buffGreen>`},
            done() {return player.universe.points.gte(32)},
            unlocked() {return hasMilestone("universe", 22)}
        },

        24: {
            requirementDescription: "<novamono>35 Destroyed Universes</novamono> (C1S2E6)",
            effectDescription() {return `<nerfRed>Point gain is raised to the power of 0.98 past e5500 Points.</nerfRed><br><buffGreen>Unlock Booster Alterations.</buffGreen>`},
            done() {return player.universe.points.gte(35)},
            unlocked() {return hasMilestone("universe", 23)}
        },

        25: {
            requirementDescription: "<novamono>45 Destroyed Universes</novamono> (C1S3E1)",
            effectDescription() {return `<nerfRed>The third buyable's effecet in M Node is 5% weaker.</nerfRed><br><buffGreen>Unlock Sorbet.</buffGreen>`},
            done() {return player.universe.points.gte(45)},
            unlocked() {return hasMilestone("universe", 24)}
        },

        26: {
            requirementDescription: "<novamono>48 Destroyed Universes</novamono> (C1S3E2)",
            effectDescription() {return `<nerfRed>Golden Booster's effect scaling is 2% weaker.</nerfRed><br><buffGreen>Unlock the second row of Sorbet upgrades.</buffGreen>`},
            done() {return player.universe.points.gte(48)},
            unlocked() {return hasMilestone("universe", 25)}
        },

        27: {
            requirementDescription: "<novamono>51 Destroyed Universes</novamono> (C1S3E3)",
            effectDescription() {return `<nerfRed>Golden Booster's effect scaling is 2% weaker again.</nerfRed><br><buffGreen>Unlock the third row of Sorbet upgrades.</buffGreen>`},
            done() {return player.universe.points.gte(51)},
            unlocked() {return hasMilestone("universe", 26)}
        },

        28: {
            requirementDescription: "<novamono>53 Destroyed Universes</novamono> (C1S3E4)",
            effectDescription() {return `<nerfRed>C1S1E7's effect scales 66% faster.</nerfRed><br><buffGreen>Unlock the fourth row of Sorbet upgrades.</buffGreen>`},
            done() {return player.universe.points.gte(53)},
            unlocked() {return hasMilestone("universe", 27)}
        },

        29: {
            requirementDescription: "<novamono>67 Destroyed Universes</novamono> (C1S3E5)",
            effectDescription() {return `<nerfRed>Money effect from booster's softcap is slightly stronger.</nerfRed><br><buffGreen>Unlock Glob Coloration Assignment and the first two colors.</buffGreen>`},
            done() {return player.universe.points.gte(67)},
            unlocked() {return hasMilestone("universe", 28)}
        },

        30: {
            requirementDescription: "<novamono>69 Destroyed Universes</novamono> (C1S3E6)",
            effectDescription() {return `<nerfRed>Pure and Dark Glob gain is reduced by 15%</nerfRed><br><buffGreen>Unlock the next two colors.</buffGreen>`},
            done() {return player.universe.points.gte(69)},
            unlocked() {return hasMilestone("universe", 29)}
        },

        31: {
            requirementDescription: "<novamono>70 Destroyed Universes</novamono> (C1S3E7)",
            effectDescription() {return `<nerfRed>Green Crystal Glob's effect is 20% weaker.</nerfRed><br><buffGreen>Unlock the third booster effect and two more colors.</buffgreen>`},
            done() {return player.universe.points.gte(70)},
            unlocked() {return hasMilestone("universe", 30)}
        },

        32: {
            requirementDescription: "<novamono>73 Destroyed Universes</novamono> (C1S3E8)",
            effectDescription() {return `<nerfRed>Anger gain scales faster.</nerfGain><br><buffGreen>Unlock the next color.</buffGreen>`},
            done() {return player.universe.points.gte(73)},
            unlocked() {return hasMilestone("universe", 31)}
        },

        33: {
            requirementDescription: "<novamono>75 Destroyed Universes</novamono> (C1S3E9)",
            effectDescription() {return `<nerfRed>Unredact thy silly endeavor...</nerfRed><br><buffGreen>Unlock the last color?</buffGreen>`},
            done() {return player.universe.points.gte(75)},
            unlocked() {return hasMilestone("universe", 32)}
        },

        34: {
            requirementDescription: "<novamono>76 Destroyed Universes</novamono> (C1S3E10)",
            effectDescription() {return `<nerfRed>Prestige Essence gain is divided by 25.</nerfRed><br><buffGreen>Unlock 3 colors. Surely they're the last colors...`},
            done() {return player.universe.points.gte(76)},
            unlocked() {return hasMilestone("universe", 33)}
        },

        35: {
            requirementDescription: "<novamono>80 Destroyed Universes</novamono> (C1S3E11)",
            effectDescription() {return `<nerfRed>Colored Glob Limit is halved if you have Magma Globs.</nerfRed><br><buffGreen>Unlock the ability to Prestige Sorbet's Layer.</buffGreen>`},
            done() {return player.universe.points.gte(80)},
            unlocked() {return hasMilestone("universe", 34)}
        },

        36: {
            requirementDescription: "<novamono>81 Destroyed Universes</novamono> (C2S1E1)",
            effectDescription() {return `<nerfRed>Magma Glob's effect scales and is produced 5% slower.<sup>+1</sup></nerfRed><br><buffGreen>Unlock Colin.</buffGreen>`},
            done() {return player.universe.points.gte(81)},
            unlocked() {return hasMilestone("universe", 35)},
            tooltip: "There is one (1) extra debuff not listed: <br><br> C1S1E7's effect scales 29% faster."
        },

        37: {
            requirementDescription: "<novamono>83 Destroyed Universes</novamono> (C2S1E2)",
            effectDescription() {return `<nerfRed>Dark Glob's negative effect scales 2.5 times faster.<sup>+1</sup></nerfRed><br><buffGreen>Unlock more Colin milestones.<sup>+1</sup></buffGreen>`},
            done() {return player.universe.points.gte(83)},
            unlocked() {return hasMilestone("universe", 36)},
            tooltip: "There is (1) extra buff not listed: <br><br> Produce 10% more True Globs. <br><br> There is one (1) debuff not listed: <br><br> C1S1E7's effect scales 15% faster."
        },

        38: {
            requirementDescription: "<novamono>91 Destroyed Universes</novamono> (C2S1E3)",
            effectDescription() {return `<nerfRed>Requirement costs are higher based on universes linearly.</nerfRed><br><buffGreen>Unlock distancing and distance awards.</buffGreen>`},
            done() {return player.universe.points.gte(91)},
            unlocked() {return hasMilestone("universe", 37)},
            effect() {
                let powBase = new Decimal(0.012)
                let base = new Decimal(1).add(powBase.times(player.universe.points))
                return base
            }
        },

        39: {
            requirementDescription: "<novamono>93 Destroyed Universes</novamono> (C2S1E4)",
            effectDescription() {return `<nerfRed>Divide future speed by 25 past 1000 AU.<sup>+2</sup></nerfRed><br><buffGreen>Unlock more C Node upgrades.</buffGreen>`},
            done() {return player.universe.points.gte(93)},
            unlocekd() {return hasMilestone("universe", 38)},
            tooltip: "There is two (2) debuffs not listed:<br><br>Latex Glob gain is raised to the power of 0.825.<hr>Prestige Essence gain is divided by 20."
        }
    },
    clickables: {
        11: {
            display() {return `<h3>Tutorial</h3>`},
            unlocked() {return true},
            canClick() {return true},
            onClick() {replayContent("tutorial");}
        },

        12: {
            display() {return `<h3>Full Changelog</h3>`},
            unlocked() {return true},
            canClick() {return true},
            onClick() {window.open("Changelogs\\SConvolutionMainframe_Changelog.md")}
        },

        13: {
            display() {return `<h3>The <lightglow><i>Golden</i></lightglow> Hint</h3>`},
            unlocked() {return true},
            canClick() {return true},
            onClick() {replayContent("hint")}
        },

        14: {
            display() {return `<h3>Multiversal Branches Part 1</h3>`},
            unlocked() {return true},
            canClick() {return true},
            onClick() {replayContent("branching")}
        },

        21: {
            display() {return `<h3>Anger?</h3>`},
            unlocked() {return player.universe.points.gte(13)},
            canClick() {return this.unlocked()},
            onClick() {replayContent("anger")}
        },

        22: {
            display() {return `<h3>Layer Prestige</h3>`},
            unlocked() {return player.universe.points.gte(16)},
            canClick() {return this.unlocked()},
            onClick() {replayContent("layer prestige")}
        },

        23: {
            display() {return `<h3>Sorbet</h3>`},
            unlocked() {return hasMilestone("universe", 25)},
            canClick() {return this.unlocked()},
            onClick() {replayContent("sorbetINTRO")}
        },

        24: {
            display() {return `<h3>Multiversal Branches Part 2</h3>`},
            unlocked() {return hasMilestone("universe", 25)},
            canClick() {return this.unlocked()},
            onClick() {replayContent("branching2")}
        },

        31: {
            display() {return `<h3>Colin</h3>`},
            unlocked() {return hasMilestone("universe", 36)},
            canClick() {return this.unlocked()},
            onClick() {replayContent("colin")}
        }
    },
    upgrades: {
        11: {
            fullDisplay() {return `<lightGlow-><big>UNI(1-1)</big></lightGlow-><br><br>Point gain is improved based on current particles.<br><br><br><br>Cost: 10 GP`},
            canAfford() {return player.universe.godParticles.gte(10)},
            pay() {player.universe.godParticles = player.universe.godParticles.sub(10)},
            unlocked() {return player.universe.points.gte(10)},
            effect() {
                let logBase = 2
                if (hasUpgrade("universe", 12)) logBase *= 0.85
                if (hasUpgrade("universe", 13)) logBase *= 0.95
                let base = player.universe.godParticles.add(1).log(logBase).add(1)
                if (hasUpgrade("universe", 12)) base = base.times(2)
                if (hasUpgrade("universe", 13)) base = base.times(3)
                return base
            }
        },

        12: {
            fullDisplay() {return `<lightGlow-><big>UNI(1-2)</big></lightGlow-><br><br>UNI(1-1) scales 15% faster and its effect is doubled.<br><br><br><br>Cost: 300 GP`},
            canAfford() {return player.universe.godParticles.gte(300)},
            pay() {player.universe.godParticles = player.universe.godParticles.sub(300)},
            unlocked() {return hasUpgrade("universe", 11)}
        },

        13: {
            fullDisplay() {return `<lightGlow-><big>UNI(1-3)</big></lightGlow-><br><br>UNI(1-1)'s effect is tripled and scales 5% faster.<br><br><br><br>Cost: 9,000 GP`},
            canAfford() {return player.universe.godParticles.gte(9000)},
            pay() {player.universe.godParticles = player.universe.godParticles.sub(9000)},
            unlocked() {return hasUpgrade("universe", 12)}
        },

        21: {
            fullDisplay() {return `<lightGlow-><big>UNI(2-1)</big></lightGlow-><br><br>Money gain is improved based on current particles.<br><br><br><br>Cost: 250 GP`},
            canAfford() {return player.universe.godParticles.gte(250)},
            pay() {player.universe.godParticles = player.universe.godParticles.sub(250)},
            unlocked() {return hasUpgrade("universe", 11)},
            effect() {
                let logBase = new Decimal(4.5)
                if (hasUpgrade("universe", 22)) logBase = logBase.div(2)
                let base = player.universe.godParticles.add(1).log(logBase).add(1)
                if (hasUpgrade("universe", 22)) base = base.times(2)
                return base
            }
        },

        22: {
            fullDisplay() {return `<lightGlow-><big>UNI(2-2)</big></lightglow-><br><br>UNI(2-1)'s effect scales twice as fast and its effect is doubled.<br><br><br>Cost: 7,500 GP`},
            canAfford() {return player.universe.godParticles.gte(7500)},
            pay() {player.universe.godParticles = player.universe.godParticles.sub(7500)},
            unlocked() {return hasUpgrade("universe", 21)},
        },

        31: {
            fullDisplay() {return `<lightglow-><big>Construct a Particle Collider</big></lightglow-><br><br>Construct a particle collider and unlock buyables to improve its rate of production.<br><br>Cost: 3,500 GP`},
            canAfford() {return player.universe.godParticles.gte(3500)},
            pay() {player.universe.godParticles = player.universe.godParticles.sub(3500)},
            unlocked() {return hasUpgrade("universe", 21) && hasMilestone("universe", 19)},
            style() {return {"width":"450px"}}
        },

        41: {
            fullDisplay() {return `<lightglow-><big>UNI(4-1)</big></lightglow-><br><br>Prestige essence gain is quintipled.<br><br><br><br>Cost: 2,000,000 GP`},
            canAfford() {return player.universe.godParticles.gte(2000000)},
            pay() {player.universe.godParticles = player.universe.godParticles.sub(2000000)},
            unlocked() {return hasUpgrade("universe", 21) && hasUpgrade("universe", 31)},
            style() {return {"width":"450px"}}
        },

        51: {
            fullDisplay() {return `<lightglow-><big>UNI(5-1)</big></lightglow-><br><br>Unlock Layer Artifacts that can be crafted to recieve permanent bonuses.<br><br><br>Cost: 225,000,000 GP`},
            canAfford() {return player.universe.godParticles.gte(225000000)},
            pay() {player.universe.godParticles = player.universe.godParticles.sub(225000000)},
            unlocked() {return hasUpgrade("universe", 41)},
            style() {return {"width":"450px"}}
        }
    },
    buyables: {
        11: {
            title: "<novamono>Colder Electromagnets</novamono>",
            display() {return `Current Level: ${formatWhole(getBuyableAmount("universe", 11))}<br><br>Submerge the particle collider's electromagnets in mystic fluids, making the electromagnets more effective at transporting particles at relativistic speeds. Each upgrade triples GP production, stacking upon each other.<br><br>Cost: ${format(this.cost())} God Particles<br>Effect: x${format(this.effect())} production`},
            effect() {
                let mulBase = new Decimal(3)
                let base = mulBase.pow(getBuyableAmount("universe", 11))
                return base
            },
            cost() {
                let initial = new Decimal(1000)
                if (getBuyableAmount("universe", 11).gte(10)) initial = initial.pow(2)
                let scale = new Decimal(1000).times(getBuyableAmount("universe", 11).pow(2)).tetrate(1.042)
                let base =  initial.add(scale)
                return base
            },
            canAfford() {return player.universe.godParticles.gte(this.cost())},
            buy() {
                player.universe.godParticles = player.universe.godParticles.sub(this.cost())
                setBuyableAmount("universe", 11, getBuyableAmount("universe", 11).add(1))
            },
            unlocked() {return hasUpgrade("universe", 31)}
        }
    },
    branches: [["money", 3]],
    gainMult() {
        let base = new Decimal(1)
        if (hasMilestone("universe", 17)) base = base.times(player.universe.angerEffect())
        if (hasMilestone("universe", 38)) base = base.pow(temp.universe.milestones[38].effect)
        return base
    },
    onPrestige() {
        player.sillyStats.prestigeTimes = player.sillyStats.prestigeTimes.add(1)
        if (hasUpgrade("eh", 621)) {
            let x = new Decimal(Math.random() * 10000)

            if (x.lte(8)) {
                player.universe.points = player.universe.points.add(4)
                notify("+4 Universes! (1/1,250)", "Game Notification", 5, "#FC0")
            } else {
                if (x.lte(100)) {
                    player.universe.points = player.universe.points.add(3)
                    notify("+3 Universes! (1/100)", "Game Notification", 5, "#FC0")
                } else {
                    if (x.lte(500)) {
                        player.universe.points = player.universe.points.add(2)
                        notify("+2 Universes! (1/20)", "Game Notification", 5, "#FC0")
                    } else {
                        if (x.lte(2500)) {
                            player.universe.points = player.universe.points.add(3)
                            notify("+1 Universe! (1/4)", "Game Notification", 5, "#FC0")
                        }
                    }
                }
            }


        }
    },
    challenges: {
        11: {
            name: "<jersey25>Dark Eternity MK1</jersey25>",
            fullDisplay: "<jersey25><small><jersey25>x<sup><jersey25>0.8</jersey25></sup> to all colored glob gain except Dark Globs. Dark Glob's negative effect scales 3 times faster.</jersey25></small><br><br><br>Goal: 1e500,000 Points<br>Reward: True Glob's effect scales faster and gain 20% more of them.",
            unlocked() {return player.universe.points.gte(81)},
            canComplete() {return player.points.gte("e500000")},
            onComplete() {player.universe.challengesDone = player.universe.challengesDone.add(1)}
        }  
    }
})