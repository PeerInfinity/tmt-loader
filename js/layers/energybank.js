addLayer("energybank", {
    name: "Energy Banks",
    symbol: "EBk",
    position: 1,
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            resetTime: 0,
            upcomingBanked: new Decimal(0)
        }
    },
    tooltip() {
        return ("Energy Banks")
    },
    color: "#FFFF00",
    resource: "Energy Bank",
    baseResource: "energy",
    baseAmount() { return player.points },
    type: "custom",
    require() { return getNextAt },
    row: 1,
    hotkeys: [
        { key: "b", description: "B: Perform an Energy Bank reset", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    layerShown() { return hasMilestone("surge", 6) },
    doReset(resettingLayer) {
        player.surge.resetTime = 0

        player.surge.firstBooster = new Decimal(0)
        player.surge.secondBooster = new Decimal(0)
        player.surge.thirdBooster = new Decimal(0)
        player.surge.fourthBooster = new Decimal(0)
    },
    getResetGain() {
        return player.energybank.upcomingBanked
    },
    getNextAt(canMax) {
        return new Decimal(1)
    },
    prestigeButtonText() {
        if (player.energybank.upcomingBanked.gt(new Decimal(0))) {
            return "Reset to fill " + format(player.energybank.upcomingBanked) + " energy banks"
        }

        var requiredEnergy = new Decimal(10).pow(player.energybank.points.add(1).mul(90).add(10))

        if (player.energybank.points.gte(10)) {
            return "All energy banks filled."
        }
        return "Resetting now wouldn't fill any energy banks.<br>Req: " + format(requiredEnergy) + " Energy"
    },
    canReset() {
        if (player.energybank.points.gte(10)) {
            return false
        }
        if (player.energybank.upcomingBanked.gt(new Decimal(0))) {
            return true
        }

        return false
    },
    branches: ["energy"],

    tabFormat: {
        "Milestones": {
            content: [
                ["display-text",
                    function () {
                        return "Time since last row 2 reset: " + formatTime(player.surge.resetTime)
                    },
                ],
                "blank",
                "prestige-button",
                "blank",
                ["display-text",
                    function () {
                        return "Energy Banks require at least 1e100 Energy to be filled.<br>" + format(player.energybank.points) + " energy banks are currently filled."
                    },
                ],
                "blank",
                "milestones"
            ],
        },
        "Effects": {
            content: [
                ["display-text",
                    function () {
                        return "Time since last row 2 reset: " + formatTime(player.surge.resetTime)
                    },
                ],
                "blank",
                ["display-text",
                    function () {
                        var energyBankEffects = ""
                        if (hasUpgrade("surge", 11)) {
                            energyBankEffects += "Effective Energy ^" + format(player.energybank.points.max(0).mul(0.9).add(1)) + "<br>"
                        }
                        if (hasUpgrade("surge", 13)) {
                            energyBankEffects += "Surge Resets x" + format(player.energybank.points.max(1)) + "<br>"
                        }
                        if (hasAchievement("ach", 32)) {
                            energyBankEffects += "Effective Time x" + format(player.energybank.points.max(1)) + "<br>"
                        }
                        if (hasMilestone("surge", 9)) {
                            energyBankEffects += "Energy Charger Base +" + format(player.energybank.points.div(25).max(0)) + "<br>"
                        }
                        if (hasMilestone("energybank", 4)) {
                            energyBankEffects += "Surge Booster Production x" + format(player.energybank.points.max(0)) + "<br>"
                        }

                        if (challengeCompletions("surge", 31) > 0) {
                            energyBankEffects += "<br>Due to Surge Challenge #5:<br>Energy Generator Production x" + format(player.energybank.points.max(1)) + "<br>"
                            if (challengeCompletions("surge", 31) > 1) {
                                energyBankEffects += "Energy Generator Base Multiplier x" + format(player.energybank.points.max(1)) + "<br>"
                            }
                            if (challengeCompletions("surge", 31) > 2) {
                                energyBankEffects += "'Charged Boost', 'Charged Generators', and 'Slight Time Bonus' log 10.00 -> " + format(new Decimal(10).sub(player.energybank.points.max(0).min(10).div(2))) + "<br>"
                            }
                            if (challengeCompletions("surge", 31) > 3) {
                                var delayExp = new Decimal(3).mul(player.energybank.points.max(0))

                                energyBankEffects += "Energy Generator increased scaling delayed 1e308 -> " + format(new Decimal(10).pow(308).mul(new Decimal(10).pow(delayExp))) + "<br>"
                            }
                            if (challengeCompletions("surge", 31) > 4) {
                                energyBankEffects += "Energy Generator increased scaling reduced x10 -> x" + format(new Decimal(10).sub(player.energybank.points.max(0).min(10).div(2))) + "<br>"
                            }
                        }

                        return energyBankEffects
                    },
                ],
            ],
            unlocked() {
                return hasUpgrade("surge", 11) || hasUpgrade("surge", 13) || hasAchievement("ach", 32) || hasMilestone("surge", 9) || hasMilestone("energybank", 4)
            }
        },
    },

    milestones: {
        1: {
            requirementDescription() {
                return "1 Energy Bank"
            },
            effectDescription() {
                return "Unlock Surge Upgrades."
            },
            done() {
                return player.energybank.points.gte(1)
            },
        },
        2: {
            requirementDescription() {
                return "2 Energy Banks"
            },
            effectDescription() {
                return "Energy Generator autobuyers buy max."
            },
            unlocked() {
                return player.energybank.points.gte(1)
            },
            done() {
                return player.energybank.points.gte(2)
            },
        },
        3: {
            requirementDescription() {
                return "3 Energy Banks"
            },
            effectDescription() {
                return "Unlock the 2nd Surge Booster."
            },
            unlocked() {
                return player.energybank.points.gte(2)
            },
            done() {
                return player.energybank.points.gte(3)
            },
        },
        4: {
            requirementDescription() {
                return "4 Energy Banks"
            },
            effectDescription() {
                return "Energy Banks multiply Surge Booster production."
            },
            unlocked() {
                return player.energybank.points.gte(3)
            },
            done() {
                return player.energybank.points.gte(4)
            },
        },
        5: {
            requirementDescription() {
                return "10 Energy Banks + 30 Surge Challenge Completions"
            },
            effectDescription() {
                return "End the game... for now."
            },
            unlocked() {
                return player.energybank.points.gte(7)
            },
            done() {
                var completions = new Decimal(challengeCompletions("surge", 11)).add(challengeCompletions("surge", 12))
                completions = completions.add(challengeCompletions("surge", 21)).add(challengeCompletions("surge", 22))
                completions = completions.add(challengeCompletions("surge", 31)).add(challengeCompletions("surge", 32))

                return player.energybank.points.gte(10) && completions.gte(30)
            },
        },
    },
    challenges: {

    },



    upgrades: {

    },
    passiveGeneration() {

    },
    buyables: {

    },
    update(diff) {
        player.energybank.upcomingBanked = player.points.max(1).log(10).sub(10).div(90).sub(1).min(10).sub(player.energybank.points).max(0)
    },
})