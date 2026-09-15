addLayer("surge", {
    name: "Surge",
    symbol: "Srg",
    position: 0,
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            resetTime: 0,
            timeBonus: new Decimal(0),

            firstBooster: new Decimal(0),
            secondBooster: new Decimal(0),
            thirdBooster: new Decimal(0),
            fourthBooster: new Decimal(0),
        }
    },
    tooltip() {
        return ("Surge")
    },
    color: "#FFFF00",
    resource: "surge",
    baseResource: "energy",
    baseAmount() { return player.points },
    type: "custom",
    require() { return getNextAt },
    row: 1,
    hotkeys: [
        { key: "s", description: "S: Perform a Surge reset", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    layerShown() { return hasUpgrade("energy", 15) || hasMilestone(this.layer, 0) },
    doReset(resettingLayer) {
        player.surge.firstBooster = new Decimal(0)
        player.surge.secondBooster = new Decimal(0)
        player.surge.thirdBooster = new Decimal(0)
        player.surge.fourthBooster = new Decimal(0)
    },
    getResetGain() {
        return new Decimal(1)
    },
    getNextAt(canMax) {
        var energyReq = new Decimal(1e20).pow(new Decimal(getEffectiveSurgeResets())).mul(1e20)

        return energyReq
    },
    prestigeButtonText() {
        if (new Decimal(getEffectiveSurgeResets()).gte(5)) {
            return "The surge has reach its limit..."
        }

        var energyReq = new Decimal(1e20).pow(new Decimal(getEffectiveSurgeResets())).mul(1e20)
        //var upgradeReq = player.surge.points.add(1).mul(10).add(5).sub(player.surge.points).min(51)
        var upgradeReq = 15
        if (hasMilestone(this.layer, 0)) {
            upgradeReq = 24
        }
        if (hasMilestone(this.layer, 1)) {
            upgradeReq = 31
        }
        if (hasMilestone(this.layer, 2)) {
            upgradeReq = 32
        }
        if (hasMilestone(this.layer, 3)) {
            upgradeReq = 33
        }

        if (player.points.lt(energyReq) || !hasUpgrade("energy", upgradeReq)) {
            var reqText = "The surge requires more..."
            if (player.points.lt(energyReq)) {
                reqText += "<br>" + format(player.points) + " / " + format(energyReq) + " Energy."
            }
            if (!hasUpgrade("energy", upgradeReq)) {
                reqText += "<br>Energy Upgrade " + upgradeReq + "."
            }

            return reqText
        }

        return "It's time to surge..."
    },
    canReset() {
        if (new Decimal(getEffectiveSurgeResets()).gte(5)) {
            return false
        }

        var energyReq = new Decimal(1e20).pow(player.surge.points).mul(1e20)
        //var upgradeReq = player.surge.points.add(1).mul(10).add(5).sub(player.surge.points).min(51)
        var upgradeReq = 15
        if (hasMilestone(this.layer, 0)) {
            upgradeReq = 24
        }
        if (hasMilestone(this.layer, 1)) {
            upgradeReq = 31
        }
        if (hasMilestone(this.layer, 2)) {
            upgradeReq = 32
        }
        if (hasMilestone(this.layer, 3)) {
            upgradeReq = 33
        }

        return (player.points.gte(energyReq) && hasUpgrade("energy", upgradeReq))
    },
    branches: ["energy"],

    tabFormat: {
        "Milestones": {
            content: [
                ["display-text",
                    function () {
                        if (hasMilestone("surge", 6)) {
                            return "Time since last row 2 reset: " + formatTime(player.surge.resetTime)
                        }
                        return "Time since last surge reset: " + formatTime(player.surge.resetTime)
                    },
                ],
                "blank",
                "prestige-button",
                "blank",
                ["display-text",
                    function () {
                        return "Your energy has been surged " + format(getEffectiveSurgeResets()) + " times."
                    },
                ],
                "blank",
                "milestones"
            ],
        },
        "Challenges": {
            content: [
                ["display-text",
                    function () {
                        if (hasMilestone("surge", 6)) {
                            return "Time since last row 2 reset: " + formatTime(player.surge.resetTime)
                        }
                        return "Time since last surge reset: " + formatTime(player.surge.resetTime)
                    },
                ],
                "blank",
                ["display-text",
                    function () {
                        return "Surge challenges can be completed a maximum of 5 times."
                    },
                ],
                "blank",
                "challenges"
            ],
            unlocked() {
                return hasMilestone("surge", 4)
            }
        },
        "Upgrades": {
            content: [
                ["display-text",
                    function () {
                        if (hasMilestone("surge", 6)) {
                            return "Time since last row 2 reset: " + formatTime(player.surge.resetTime)
                        }
                        return "Time since last surge reset: " + formatTime(player.surge.resetTime)
                    },
                ],
                "blank",
                ["display-text",
                    function () {
                        var upgradesUnlocked = player.energybank.points.mul(2).max(0).min(12).floor()

                        if (upgradesUnlocked.gte(12)) {
                            return ""
                        }

                        return "Surge upgrades are unlocked twice per energy bank, up to 6 energy banks.<br>" + upgradesUnlocked + " / 12 Surge upgrades unlocked."
                    },
                ],
                "blank",
                "upgrades"
            ],
            unlocked() {
                return hasMilestone("energybank", 1)
            }
        },
        "Boosters": {
            content: [
                ["display-text",
                    function () {
                        if (hasMilestone("surge", 6)) {
                            return "Time since last row 2 reset: " + formatTime(player.surge.resetTime)
                        }
                        return "Time since last surge reset: " + formatTime(player.surge.resetTime)
                    },
                ],
                "blank",
                ["display-text",
                    function () {
                        if (new Decimal(energyCap()).gt(new Decimal(10).pow(1000))) {
                            return ""
                        }

                        var remainingBoosters = ""
                        if (player.energybank.points.lt(3)) {
                            remainingBoosters += "<br>Second Booster: 3 Energy Banks."
                        }
                        if (challengeCompletions("surge", 31) < 5 && hasMilestone("surge", 7)) {
                            remainingBoosters += "<br>Third Booster: Fully complete Surge Challenge #5."
                        }
                        if (player.points.lte(new Decimal(1e10).pow(100)) && hasMilestone("surge", 8)) {
                            //remainingBoosters += "<br>Fourth Booster: Fully complete Surge Challenge #6."
                        }
                        if (remainingBoosters != "") {
                            return "Surge Boosters are unlocked based on various points or progression.<br>Remaining Boosters:" + remainingBoosters
                        }

                        return ""
                    },
                ],
                "buyables"
            ],
            unlocked() {
                return hasMilestone("surge", 7)
            }
        }
    },
    componentStyles: {
        "buyable"() { return { "height": "125px", "width": "225px" } }
    },

    milestones: {
        0: {
            requirementDescription() {
                return "1 Surge Reset"
            },
            effectDescription() {
                return "Increase Energy cap to 1e40, Energy Generator #1 production doubled, unlock Energy Generator #4, and unlock 4 more upgrades."
            },
            done() {
                return new Decimal(getEffectiveSurgeResets()).gte(1)
            },
        },
        1: {
            requirementDescription() {
                return "2 Surge Resets"
            },
            effectDescription() {
                return "Increase Energy cap to 1e60, Energy Generators #2 production doubled, unlock Energy Generator #5, and unlock 2 more upgrades."
            },
            unlocked() {
                return new Decimal(getEffectiveSurgeResets()).gte(1)
            },
            done() {
                return new Decimal(getEffectiveSurgeResets()).gte(2)
            },
        },
        2: {
            requirementDescription() {
                return "3 Surge Resets"
            },
            effectDescription() {
                return "Increase Energy cap to 1e80, Energy Generators #3 production doubled, unlock Energy Generator #6, and unlock another upgrade."
            },
            unlocked() {
                return new Decimal(getEffectiveSurgeResets()).gte(2)
            },
            done() {
                return new Decimal(getEffectiveSurgeResets()).gte(3)
            },
        },
        3: {
            requirementDescription() {
                return "4 Surge Resets"
            },
            effectDescription() {
                return "Increase Energy cap to 1e100, unlock an autobuyer for Energy Generator #1, and unlock another upgrade."
            },
            unlocked() {
                return new Decimal(getEffectiveSurgeResets()).gte(3)
            },
            done() {
                return new Decimal(getEffectiveSurgeResets()).gte(4)
            },
        },
        4: {
            requirementDescription() {
                return "5 Surge Resets"
            },
            effectDescription() {
                return "Unlock an autobuyer for Energy Generators #2 and #3 and unlock Surge Challenges."
            },
            unlocked() {
                return new Decimal(getEffectiveSurgeResets()).gte(4)
            },
            done() {
                return new Decimal(getEffectiveSurgeResets()).gte(5)
            },
        },
        5: {
            requirementDescription() {
                return "10 Surge Challenge Completions"
            },
            effectDescription() {
                var completions = new Decimal(challengeCompletions("surge", 11)).add(challengeCompletions("surge", 12))
                completions = completions.add(challengeCompletions("surge", 21)).add(challengeCompletions("surge", 22))
                completions = completions.add(challengeCompletions("surge", 31)).add(challengeCompletions("surge", 32))

                completions = completions.sub(7).max(0).min(13)

                if (completions.lt(1) || completions.gt(1)) {
                    return "Outside of challenges, keep an Energy upgrade per challenge completion past the first seven.<br>Currently: " + completions + " upgrades kept"
                }
                return "Outside of challenges, keep an Energy upgrade per challenge completion past the first seven.<br>Currently: " + completions + " upgrade kept"
            },
            unlocked() {
                var completions = new Decimal(challengeCompletions("surge", 11)).add(challengeCompletions("surge", 12))
                completions = completions.add(challengeCompletions("surge", 21)).add(challengeCompletions("surge", 22))
                completions = completions.add(challengeCompletions("surge", 31)).add(challengeCompletions("surge", 32))

                return completions.gte(5)
            },
            done() {
                var completions = new Decimal(challengeCompletions("surge", 11)).add(challengeCompletions("surge", 12))
                completions = completions.add(challengeCompletions("surge", 21)).add(challengeCompletions("surge", 22))
                completions = completions.add(challengeCompletions("surge", 31)).add(challengeCompletions("surge", 32))

                return completions.gte(10)
            },
        },
        6: {
            requirementDescription() {
                return "20 Surge Challenge Completions"
            },
            effectDescription() {
                return "Increase the energy cap to 1e1000 and unlock Energy Banks."
            },
            unlocked() {
                var completions = new Decimal(challengeCompletions("surge", 11)).add(challengeCompletions("surge", 12))
                completions = completions.add(challengeCompletions("surge", 21)).add(challengeCompletions("surge", 22))
                completions = completions.add(challengeCompletions("surge", 31)).add(challengeCompletions("surge", 32))

                return completions.gte(10)
            },
            done() {
                var completions = new Decimal(challengeCompletions("surge", 11)).add(challengeCompletions("surge", 12))
                completions = completions.add(challengeCompletions("surge", 21)).add(challengeCompletions("surge", 22))
                completions = completions.add(challengeCompletions("surge", 31)).add(challengeCompletions("surge", 32))

                return completions.gte(20)
            },
        },
        7: {
            requirementDescription() {
                return "10 Surge Resets"
            },
            effectDescription() {
                return "Unlock the 5th Surge Challenge and Surge Boosters."
            },
            unlocked() {
                return hasUpgrade("surge", 13)
            },
            done() {
                return new Decimal(getEffectiveSurgeResets()).gte(10)
            },
        },
        8: {
            requirementDescription() {
                return "1e9 Surge Boost"
            },
            effectDescription() {
                return "Unlock the 6th Surge Challenge."
            },
            unlocked() {
                return hasMilestone("energybank", 3)
            },
            done() {
                return new Decimal(player.surge.firstBooster).gte(1e9)
            },
        },
        9: {
            requirementDescription() {
                return "2.5e11 Surge Boost"
            },
            effectDescription() {
                return "Energy Banks improve the Energy Charger per-purchase multiplier."
            },
            unlocked() {
                return hasMilestone("energybank", 3)
            },
            done() {
                return new Decimal(player.surge.firstBooster).gte(2.5e11)
            },
        },
    },
    challenges: {
        11: {
            name() {
                return "Surge Challenge #1"
            },
            challengeDescription() {
                var completions = new Decimal(challengeCompletions(this.layer, this.id)).add(1).min(5)

                var lowerBoost = new Decimal(0.04).mul(completions)
                var higherBoost = new Decimal(0.02).mul(completions)

                return "Energy Generator per-purchase boost reduced by " + format(lowerBoost.mul(100)) + "%"

                lowerBoost = new Decimal(2).sub(lowerBoost)
                higherBoost = new Decimal(1.5).sub(higherBoost)

                return "Lower Energy Generator per-purchase boost reduced to " + format(lowerBoost) + "x and higher Energy Generator per-purchase boost reduced to " + format(higherBoost) + "x"
            },
            canComplete() {
                return (player.points.gte(new Decimal(1e100)) && hasUpgrade("energy", 33))
            },
            goalDescription() {
                return "1e100 Energy + Energy Upgrade 33"
            },
            rewardDescription() {
                return "Energy Generator per-purchase boost increased slightly."
            },
            rewardEffect() {
                var boost = new Decimal(1).mul(challengeCompletions(this.layer, this.id)).div(100).add(1)

                return boost
            },
            rewardDisplay() {
                var boost = new Decimal(challengeCompletions(this.layer, this.id)).add(1).min(5).div(100).add(1)
                var rewardText = format(challengeEffect(this.layer, this.id)) + "x"

                if (new Decimal(challengeCompletions(this.layer, this.id)).lt(5)) {
                    rewardText += "<br>Next: " + format(boost) + "x"
                }

                return rewardText + "<br><br>Completions: " + challengeCompletions(this.layer, this.id) + "/5"
            },
            completionLimit() {
                return 5
            },
        },
        12: {
            name() {
                return "Surge Challenge #2"
            },
            challengeDescription() {
                var completions = new Decimal(challengeCompletions(this.layer, this.id)).add(1).min(5)

                var boost = new Decimal(20)
                if (completions.gte(2)) {
                    boost = new Decimal(18)
                }
                if (completions.gte(3)) {
                    boost = new Decimal(15)
                }
                if (completions.gte(4)) {
                    boost = new Decimal(12)
                }
                if (completions.gte(5)) {
                    boost = new Decimal(8)
                }

                return "Energy Generator effects no longer increase over time, instead set to " + boost + "x the production."
            },
            canComplete() {
                return (player.points.gte(new Decimal(1e100)) && hasUpgrade("energy", 33))
            },
            goalDescription() {
                return "1e100 Energy + Energy Upgrade 33"
            },
            rewardDescription() {
                return "Energy Generator effects are boosted to an amount based on production if below it."
            },
            rewardEffect() {
                var completions = new Decimal(challengeCompletions(this.layer, this.id)).min(5)

                var boost = new Decimal(0)
                if (completions.gte(1)) {
                    boost = new Decimal(0.5)
                }
                if (completions.gte(2)) {
                    boost = new Decimal(1.5)
                }
                if (completions.gte(3)) {
                    boost = new Decimal(3)
                }
                if (completions.gte(4)) {
                    boost = new Decimal(6)
                }
                if (completions.gte(5)) {
                    boost = new Decimal(10)
                }

                return boost
            },
            rewardDisplay() {
                var completions = new Decimal(challengeCompletions(this.layer, this.id)).add(1).min(5)

                var boost = new Decimal(0.5)
                if (completions.gte(2)) {
                    boost = new Decimal(1.5)
                }
                if (completions.gte(3)) {
                    boost = new Decimal(3)
                }
                if (completions.gte(4)) {
                    boost = new Decimal(6)
                }
                if (completions.gte(5)) {
                    boost = new Decimal(10)
                }

                var rewardText = format(challengeEffect(this.layer, this.id)) + "x"

                if (new Decimal(challengeCompletions(this.layer, this.id)).lt(5)) {
                    rewardText += "<br>Next: " + format(boost) + "x"
                }

                return rewardText + "<br><br>Completions: " + challengeCompletions(this.layer, this.id) + "/5"
            },
            completionLimit() {
                return 5
            },
        },
        21: {
            name() {
                return "Surge Challenge #3"
            },
            challengeDescription() {
                var completions = new Decimal(challengeCompletions(this.layer, this.id)).add(1).min(5)

                var timeMod = new Decimal(5).sub(completions).mul(2.5).add(15)

                return "Energy and Energy Generator production slowly drops to 0% over the next " + format(timeMod) + " minutes."
            },
            canComplete() {
                return (player.points.gte(new Decimal(1e100)) && hasUpgrade("energy", 33))
            },
            goalDescription() {
                return "1e100 Energy + Energy Upgrade 33"
            },
            rewardDescription() {
                if (challengeCompletions("surge", 22) > 2) {
                    return "Reduces the log on the 'Slight Time Bonus' upgrade."
                }
                return "Reduces the logs on the 'Slight Time Bonus' upgrade."
            },
            rewardEffect() {
                if (challengeCompletions("surge", 22) > 2) {
                    var boost = new Decimal(challengeCompletions(this.layer, this.id)).mul(2)
                    boost = new Decimal(20).sub(boost)

                    return boost
                }
                var boost = new Decimal(challengeCompletions(this.layer, this.id))
                boost = new Decimal(10).sub(boost)

                return boost
            },
            rewardDisplay() {
                if (challengeCompletions("surge", 22) > 2) {
                    var boost = new Decimal(challengeCompletions(this.layer, this.id)).add(1).min(5).mul(2)
                    boost = new Decimal(20).sub(boost)
                    var rewardText = "20 -> " + format(challengeEffect(this.layer, this.id))

                    if (new Decimal(challengeCompletions(this.layer, this.id)).lt(5)) {
                        rewardText += "<br>Next: 20 -> " + format(boost)
                    }

                    return rewardText + "<br><br>Completions: " + challengeCompletions(this.layer, this.id) + "/5"
                }

                var boost = new Decimal(challengeCompletions(this.layer, this.id)).add(1).min(5)
                boost = new Decimal(10).sub(boost)
                var rewardText = "10 -> " + format(challengeEffect(this.layer, this.id))

                if (new Decimal(challengeCompletions(this.layer, this.id)).lt(5)) {
                    rewardText += "<br>Next: 10 -> " + format(boost)
                }

                return rewardText + "<br><br>Completions: " + challengeCompletions(this.layer, this.id) + "/5"
            },
            completionLimit() {
                return 5
            },
        },
        22: {
            name() {
                return "Surge Challenge #4"
            },
            challengeDescription() {
                return "Various Energy upgrades are either hardcapped or weakened."
            },
            canComplete() {
                return (player.points.gte(new Decimal(1e100)) && hasUpgrade("energy", 33))
            },
            goalDescription() {
                return "1e100 Energy + Energy Upgrade 33"
            },
            rewardDescription() {
                return "Improve various Energy upgrades"
            },
            rewardDisplay() {
                var boost = new Decimal(challengeCompletions(this.layer, this.id)).add(1).min(5)
                var rewardText = challengeCompletions(this.layer, this.id) + " Energy upgrade"

                if (new Decimal(challengeCompletions(this.layer, this.id)).lt(1) || new Decimal(challengeCompletions(this.layer, this.id)).gt(1)) {
                    rewardText += "s"
                }

                if (new Decimal(challengeCompletions(this.layer, this.id)).lt(5)) {
                    rewardText += "<br>Next: " + boost + " Energy upgrade"
                    if (boost.gt(1)) {
                        rewardText += "s"
                    }
                }

                return rewardText + "<br><br>Completions: " + challengeCompletions(this.layer, this.id) + "/5"
            },
            completionLimit() {
                return 5
            },
        },
        31: {
            name() {
                return "Surge Challenge #5"
            },
            challengeDescription() {
                return "All 4 Surge challenges are active at once."
            },
            canComplete() {
                var completions = new Decimal(challengeCompletions(this.layer, this.id)).add(1).min(5)

                return (player.points.gte(new Decimal(1e100).pow(completions)) && hasUpgrade("energy", 33))
            },
            goalDescription() {
                var completions = new Decimal(challengeCompletions(this.layer, this.id)).add(1).min(5)

                return format(new Decimal(1e100).pow(completions)) + " Energy + Energy Upgrade 33"
            },
            rewardDescription() {
                return "Gain more Energy Bank effects.<br>See Energy Bank 'Effects' tab for current effects.<br><br>Completions: " + challengeCompletions(this.layer, this.id) + "/5"
            },
            completionLimit() {
                return 5
            },
            unlocked() {
                return hasMilestone("surge", 7)
            },
            countsAs: [11, 12, 21, 22]
        },
        32: {
            name() {
                return "Surge Challenge #6"
            },
            challengeDescription() {
                return "Energy upgrades and higher Energy Generators are disabled."
            },
            canComplete() {
                var completions = new Decimal(challengeCompletions(this.layer, this.id)).add(1).min(5)

                return (player.points.gte(new Decimal(1e100).pow(completions)) && hasUpgrade("energy", 33))
            },
            goalDescription() {
                var completions = new Decimal(challengeCompletions(this.layer, this.id)).add(1).min(5)

                return format(new Decimal(1e100).pow(completions)) + " Energy + Energy Upgrade 33"
            },
            rewardDescription() {
                return "'Upgrade Boost' upgrade and higher Energy Generator base increased."

                return "Gain more Energy Bank effects.<br>See Energy Bank 'Effects' tab for current effects.<br><br>Completions: " + challengeCompletions(this.layer, this.id) + "/5"
            },
            rewardEffect() {
                var boost = new Decimal(challengeCompletions(this.layer, this.id)).min(5)
                boost = boost.div(50)

                return boost
            },
            rewardDisplay() {
                var boost = new Decimal(challengeCompletions(this.layer, this.id)).add(1).min(5).div(50).add(1.5)
                var rewardText = "1.5 -> " + format(new Decimal(challengeCompletions(this.layer, this.id)).min(5).div(50).add(1.5))

                if (new Decimal(challengeCompletions(this.layer, this.id)).lt(5)) {
                    rewardText += "<br>Next: 1.5 -> " + format(boost)
                }

                return rewardText + "<br><br>Completions: " + challengeCompletions(this.layer, this.id) + "/5"
            },
            completionLimit() {
                return 5
            },
            unlocked() {
                return hasMilestone("surge", 8)
            },
        },
    },



    upgrades: {
        11: {
            title() {
                return "Banked Energy"
            },
            cost() {
                var price = new Decimal(10).pow(145)

                return price
            },
            effect() {
                var boost = player.energybank.points.max(0).mul(0.9).add(1)

                return boost
            },
            description() {
                return "Energy Banks raise effective energy by 90% of their amount."
            },
            currencyDisplayName: "energy",
            currencyInternalName: "points",
            unlocked() {
                return player.energybank.points.gte(0.5)
            },
        },
        12: {
            title() {
                return "Second Row Bonus"
            },
            cost() {
                var price = new Decimal(10).pow(190)

                return price
            },
            effect() {
                var timeBonus = new Decimal(2)
                if (hasAchievement("ach", 32)) {
                    timeBonus = timeBonus.mul(player.energybank.points.max(1))
                }

                var boost = new Decimal(player.surge.resetTime).div(60).mul(timeBonus).add(1)

                return boost
            },
            description() {
                return "Energy Generators gain a multiplier based on time in a row 2 reset.<br>Currently: " + format(this.effect()) + "x"
            },
            currencyDisplayName: "energy",
            currencyInternalName: "points",
            unlocked() {
                return player.energybank.points.gte(1)
            },
            tooltip() {
                var timeBonus = new Decimal(2)
                if (hasAchievement("ach", 32)) {
                    timeBonus = timeBonus.mul(player.energybank.points.max(1))
                }

                return "Minutes * " + format(timeBonus)
            },
        },
        13: {
            title() {
                return "Surge Contribution"
            },
            cost() {
                var price = new Decimal(10).pow(235)

                return price
            },
            description() {
                return "Energy Banks multiply surge resets and surge resets multiply Energy Generator production."
            },
            currencyDisplayName: "energy",
            currencyInternalName: "points",
            unlocked() {
                return player.energybank.points.gte(1.5)
            },
        },
        14: {
            title() {
                return "Effective Energy Translation"
            },
            cost() {
                var price = new Decimal(10).pow(280)

                return price
            },
            effect() {
                var boost = getEffectiveEnergy().div(player.points.max(1)).log(10)

                return boost
            },
            description() {
                return "Energy gain is boosted slightly by effective energy. Currently: " + format(this.effect()) + "x"
            },
            currencyDisplayName: "energy",
            currencyInternalName: "points",
            unlocked() {
                return player.energybank.points.gte(2)
            },
            tooltip() {
                return "log10(Eff Energy / Energy)"
            },
        },
        15: {
            title() {
                return "Cheapened Charger"
            },
            cost() {
                var price = new Decimal(10).pow(325)

                return price
            },
            effect() {
                var boost = new Decimal(10).pow(new Decimal(3).mul(getEffectiveSurgeResets()))

                return boost
            },
            description() {
                return "Energy Charger base price is reduced based on surge resets. Currently: /" + format(this.effect())
            },
            currencyDisplayName: "energy",
            currencyInternalName: "points",
            unlocked() {
                return player.energybank.points.gte(2.5)
            },
            tooltip() {
                return "10 ^ (3 * resets)"
            },
        },
        16: {
            title() {
                return "Self Benefit Multiplier"
            },
            cost() {
                var price = new Decimal(10).pow(370)

                return price
            },
            effect() {
                var boosters = new Decimal(getBuyableAmount(this.layer, 11)).add(getBuyableAmount(this.layer, 12))

                return new Decimal(1.05).pow(boosters)
            },
            description() {
                return "Purchased Surge Boosters boost the 'Self Benefit' Energy upgrade. Currently: " + format(upgradeEffect(this.layer, this.id)) + "x"
            },
            currencyDisplayName: "energy",
            currencyInternalName: "points",
            unlocked() {
                return player.energybank.points.gte(3)
            },
            tooltip() {
                return "1.05 ^ Boosters"
            },
        },
        21: {
            title() {
                return "Set Multiplier"
            },
            cost() {
                var price = new Decimal(10).pow(415)

                return price
            },
            description() {
                return "'Set Bonus' effect applies for Surge Boosters and is multiplicative for Energy Generators."
            },
            currencyDisplayName: "energy",
            currencyInternalName: "points",
            unlocked() {
                return player.energybank.points.gte(3.5)
            },
        },
        22: {
            title() {
                return "Upgrade Inclusion"
            },
            cost() {
                var price = new Decimal(10).pow(460)

                return price
            },
            description() {
                return "'Upgrade Boost' effect accounts for Surge upgrades."
            },
            currencyDisplayName: "energy",
            currencyInternalName: "points",
            unlocked() {
                return player.energybank.points.gte(4)
            },
        },
        23: {
            title() {
                return "Booster to Generator"
            },
            cost() {
                var price = new Decimal(10).pow(505)

                return price
            },
            effect() {
                var boosters = new Decimal(getBuyableAmount(this.layer, 11)).add(getBuyableAmount(this.layer, 12))

                return new Decimal(boosters)
            },
            description() {
                return "Total Surge Booster count multiplies Energy Generator production.<br>Currently: " + format(this.effect()) + "x"
            },
            currencyDisplayName: "energy",
            currencyInternalName: "points",
            unlocked() {
                return player.energybank.points.gte(4.5)
            },
        },
        24: {
            title() {
                return "Charged Boosters"
            },
            cost() {
                var price = new Decimal(10).pow(550)

                return price
            },
            effect() {
                var productionLog = new Decimal(10)
                var productionPow = new Decimal(0.2)
                if (hasUpgrade("surge", 26)) {
                    productionPow = productionPow.add(0.05)
                }
                var energyCount = getEffectiveEnergy()
                if (challengeCompletions("surge", 31) > 2) {
                    productionLog = productionLog.sub(player.energybank.points.max(0).min(10).div(2))
                }

                return new Decimal(1).add(energyCount).log(productionLog).pow(productionPow).add(1)
            },
            description() {
                return "'Charged Boost' upgrade applies to Surge Boosters at a weaker scale.<br>Currently: " + format(upgradeEffect(this.layer, this.id)) + "x"
            },
            currencyDisplayName: "energy",
            currencyInternalName: "points",
            unlocked() {
                return player.energybank.points.gte(5)
            },
            tooltip() {
                var productionLog = new Decimal(10)
                var productionPow = new Decimal(0.2)
                if (hasUpgrade("surge", 26)) {
                    productionPow = productionPow.add(0.05)
                }
                if (challengeCompletions("surge", 31) > 2) {
                    productionLog = productionLog.sub(player.energybank.points.max(0).min(10).div(2))
                }

                return "1 + log" + format(productionLog) + "(Energy + 1)^" + format(productionPow)
            },
        },
        25: {
            title() {
                return "Slight Time Amplifier"
            },
            cost() {
                var price = new Decimal(10).pow(595)

                return price
            },
            effect() {
                return upgradeEffect("energy", 21).pow(0.5)
            },
            description() {
                return "'Slight Time Boost' upgrade applies to Surge Boosters and square the effect on Energy Generators.<br>Currently: " + format(upgradeEffect(this.layer, this.id)) + "x"
            },
            currencyDisplayName: "energy",
            currencyInternalName: "points",
            unlocked() {
                return player.energybank.points.gte(5.5)
            },
        },
        26: {
            title() {
                return "Charged Amplifier"
            },
            cost() {
                var price = new Decimal(10).pow(640)

                return price
            },
            description() {
                return "'Charged Boost' and 'Charged Generators' exponent raised to 0.4 and 'Charged Boosters' exponent raised to 0.25."
            },
            currencyDisplayName: "energy",
            currencyInternalName: "points",
            unlocked() {
                return player.energybank.points.gte(6)
            },
        },
    },
    buyables: {
        11: {
            title() { return "Surge Booster #1" },
            cost() {
                var basePrice = new Decimal(10).pow(280)
                var baseScaling = new Decimal(1e10)

                return getSurgeBoosterCostScaling(11, basePrice, baseScaling)
            },
            effect() {
                var generation = new Decimal(2)

                generation = getSurgeBoosterMults(this.id, generation)
                generation = generation.mul(player.surge.secondBooster.add(new Decimal(1)))

                if (getBuyableAmount(this.layer, this.id) < 1) return new Decimal(0);
                return generation
            },
            display() {
                return getSurgeBoosterDescription(11, player.surge.firstBooster, this.purchaseLimit(), this.cost())
            },
            canAfford() {
                return player.points.gte(this.cost()) && energyCap().gt(this.cost())
            },
            buy() {
                if (this.canAfford()) {
                    player.points = player.points.sub(this.cost())
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }
            },
            purchaseLimit() {
                return new Decimal(1000)
            },
            tooltip() {
                var generation = new Decimal(2)
                var baseMultiplier = new Decimal(1)

                if (baseMultiplier.gt(1) || baseMultiplier.lt(1)) {
                    return "(" + format(generation) + " ^ Purchase) * " + format(baseMultiplier)
                }
                return format(generation) + " ^ Purchase"
            },
        },
        12: {
            title() { return "Surge Booster #2" },
            cost() {
                var basePrice = new Decimal(10).pow(350)
                var baseScaling = new Decimal(1e12)

                return getSurgeBoosterCostScaling(12, basePrice, baseScaling)
            },
            effect() {
                var generation = new Decimal(2)

                generation = getSurgeBoosterMults(this.id, generation)
                generation = generation.mul(player.surge.thirdBooster.add(new Decimal(1)))

                if (getBuyableAmount(this.layer, this.id) < 1) return new Decimal(0);
                return generation
            },
            display() {
                return getSurgeBoosterDescription(12, player.surge.secondBooster, this.purchaseLimit(), this.cost())
            },
            canAfford() {
                return player.points.gte(this.cost()) && energyCap().gt(this.cost())
            },
            buy() {
                if (this.canAfford()) {
                    player.points = player.points.sub(this.cost())
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }
            },
            purchaseLimit() {
                return new Decimal(1000)
            },
            tooltip() {
                var generation = new Decimal(2)
                var baseMultiplier = new Decimal(1)

                if (baseMultiplier.gt(1) || baseMultiplier.lt(1)) {
                    return "(" + format(generation) + " ^ Purchase) * " + format(baseMultiplier)
                }
                return format(generation) + " ^ Purchase"
            },
            unlocked() {
                return hasMilestone("energybank", 3)
            },
        },
        21: {
            title() { return "Surge Booster #3" },
            cost() {
                var basePrice = new Decimal(10).pow(500)
                var baseScaling = new Decimal(1e15)

                return getSurgeBoosterCostScaling(21, basePrice, baseScaling)
            },
            effect() {
                var generation = new Decimal(2)

                generation = getSurgeBoosterMults(this.id, generation)
                generation = generation.mul(player.surge.fourthBooster.add(new Decimal(1)))

                if (getBuyableAmount(this.layer, this.id) < 1) return new Decimal(0);
                return generation
            },
            display() {
                return getSurgeBoosterDescription(21, player.surge.thirdBooster, this.purchaseLimit(), this.cost())
            },
            canAfford() {
                return player.points.gte(this.cost()) && energyCap().gt(this.cost())
            },
            buy() {
                if (this.canAfford()) {
                    player.points = player.points.sub(this.cost())
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }
            },
            purchaseLimit() {
                return new Decimal(1000)
            },
            tooltip() {
                var generation = new Decimal(2)
                var baseMultiplier = new Decimal(1)

                if (baseMultiplier.gt(1) || baseMultiplier.lt(1)) {
                    return "(" + format(generation) + " ^ Purchase) * " + format(baseMultiplier)
                }
                return format(generation) + " ^ Purchase"
            },
            unlocked() {
                return challengeCompletions("surge", 31) > 4
            },
        },
        22: {
            title() { return "Surge Booster #4" },
            cost() {
                var basePrice = new Decimal(10).pow(1000)
                var baseScaling = new Decimal(1e20)

                return getSurgeBoosterCostScaling(22, basePrice, baseScaling)
            },
            effect() {
                var generation = new Decimal(2)

                generation = getSurgeBoosterMults(this.id, generation)

                if (getBuyableAmount(this.layer, this.id) < 1) return new Decimal(0);
                return generation
            },
            display() {
                return getSurgeBoosterDescription(22, player.surge.fourthBooster, this.purchaseLimit(), this.cost())
            },
            canAfford() {
                return player.points.gte(this.cost()) && energyCap().gt(this.cost())
            },
            buy() {
                if (this.canAfford()) {
                    player.points = player.points.sub(this.cost())
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                }
            },
            purchaseLimit() {
                return new Decimal(1000)
            },
            tooltip() {
                var generation = new Decimal(2)
                var baseMultiplier = new Decimal(1)

                if (baseMultiplier.gt(1) || baseMultiplier.lt(1)) {
                    return "(" + format(generation) + " ^ Purchase) * " + format(baseMultiplier)
                }
                return format(generation) + " ^ Purchase"
            },
            unlocked() {
                return false

                //return challengeCompletions("surge", 32) > 4
            },
        },
    },
    passiveGeneration() {

    },
    update(diff) {
        var firstBoostProd = new Decimal(diff).mul(buyableEffect("surge", 11))
        var secondBoostProd = new Decimal(diff).mul(buyableEffect("surge", 12))
        var thirdBoostProd = new Decimal(diff).mul(buyableEffect("surge", 21))
        var fourthBoostProd = new Decimal(diff).mul(buyableEffect("surge", 22))

        player.surge.firstBooster = player.surge.firstBooster.add(firstBoostProd)
        player.surge.secondBooster = player.surge.secondBooster.add(secondBoostProd)
        player.surge.thirdBooster = player.surge.thirdBooster.add(thirdBoostProd)
        player.surge.fourthBooster = player.surge.fourthBooster.add(fourthBoostProd)
    },
})

function getEffectiveSurgeResets() {
    var surgeResets = player.surge.points.max(0)
    if (hasUpgrade("surge", 13)) {
        surgeResets = surgeResets.mul(player.energybank.points.max(1))
    }

    return surgeResets
}

function getSurgeBoosterMults(boostID, generation) {
    var generation = new Decimal(2)

    generation = generation.pow(getBuyableAmount("surge", boostID) - 1)

    if (hasUpgrade("energy", 14) && hasUpgrade("surge", 21)) {
        var purchaseMult = new Decimal(0.2).mul(getBuyableAmount("surge", boostID)).floor().mul(0.1).add(1)

        generation = generation.mul(purchaseMult)
    }
    if (hasMilestone("energybank", 4)) {
        generation = generation.mul(player.energybank.points.max(1))
    }
    if (hasUpgrade("surge", 24)) {
        generation = generation.mul(upgradeEffect("surge", 24))
    }
    
    return generation
}

function getSurgeBoosterCostScaling(boostID, basePrice, baseScaling) {
    var softcapScaling = new Decimal(10)

    var softcap = 100

    var totalPrice = basePrice.mul(baseScaling.pow(getBuyableAmount("surge", boostID)))

    if (getBuyableAmount("surge", boostID).gte(softcap)) {
        var softcapSum = getBuyableAmount("surge", boostID).sub(softcap - 2).max(0)
        var softcapCost = softcap1Sum.pow(2)

        softcapSum = softcapScaling.pow(softcapSum)
        softcapCost = softcapScaling.pow(softcapCost)

        var softcapModifier = softcapCost.div(softcapSum).pow(0.5)

        totalPrice = totalPrice.mul(softcapModifier)
    }

    return totalPrice
}

function getSurgeBoosterDescription(boostID, boostCount, purchaseLimit, cost) {
    var count = getBuyableAmount("surge", boostID)

    var generationText = "Generates a slowly increasing production multiplier for Surge Booster #3."

    generationText += "<br>Amount: " + format(count)
    generationText += "<br>Production: " + format(buyableEffect("surge", boostID)) + "/s"
    generationText += "<br>Effect: " + format(boostCount.add(1)) + "x"
    if (new Decimal(getBuyableAmount("surge", boostID)).gte(purchaseLimit)) {
        generationText += "<br>Maxed due to Generator limit."
    }
    else if (new Decimal(energyCap()).gt(cost)) {
        generationText += "<br>Cost: " + format(cost) + " Energy"
    }
    else {
        generationText += "<br>Maxed due to Energy limit."
    }

    return generationText
}