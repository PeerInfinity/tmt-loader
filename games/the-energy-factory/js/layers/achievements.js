
// A side layer with achievements, with no prestige
addLayer("ach", {
    symbol: "Ach",
    startData() {
        return {
            unlocked: true,
            //points: new Decimal(0),
        }
    },
    color: "yellow",
    //resource: "achievement power",
    row: "side",
    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("Achievements")
    },
    achievementPopups: true,

    achievements: {
        11: {
            name: "The Start",
            done() { return getBuyableAmount("energy", 11) > 0 },
            tooltip: "Purchase an Energy Generator #1.",
        },
        12: {
            name: "Stacking Multipliers",
            done() { return getBuyableAmount("energy", 12) > 0 },
            tooltip: "Purchase an Energy Generator #2.",
        },
        13: {
            name: "Third Gen's The Charm",
            done() { return getBuyableAmount("energy", 13) > 0 },
            tooltip: "Purchase an Energy Generator #3.<br>Reward: Unlock Energy Upgrades.",
        },
        14: {
            name: "Power Surge",
            done() { return hasMilestone("surge", 0) },
            tooltip: "Surge for the first time.",
            unlocked() { return hasAchievement(this.layer, 13) },
        },
        15: {
            name: "Feels Familiar...",
            done() { return getBuyableAmount("energy", 21) > 0 },
            tooltip: "Purchase an Energy Generator #4.",
            unlocked() { return hasUpgrade("energy", 15) || hasMilestone("surge", 0) || hasAchievement(this.layer, this.id) },
        },
        16: {
            name: "Multiplying Multiplier",
            done() { return getBuyableAmount("energy", 22) > 0 },
            tooltip: "Purchase an Energy Generator #5.",
            unlocked() { return hasMilestone("surge", 0) || hasAchievement(this.layer, this.id) },
        },
        21: {
            name: "The 6th Generation",
            done() { return getBuyableAmount("energy", 23) > 0 },
            tooltip: "Purchase an Energy Generator #6.",
            unlocked() { return hasMilestone("surge", 1) || hasAchievement(this.layer, this.id) },
        },
        22: {
            name: "Dimensional Surge",
            done() { return hasMilestone("surge", 4) },
            tooltip() {
                return "Reach Surge Milestone #5.<br>Reward: Surge Milestones boost energy gain.\nCurrently: " + format(achievementEffect(this.layer, this.id)) + "x"
            },
            effect() {
                var surgeMult = new Decimal(1)

                if (hasMilestone("surge", 0)) {
                    surgeMult = surgeMult.mul(1.5)
                }
                if (hasMilestone("surge", 1)) {
                    surgeMult = surgeMult.mul(1.5)
                }
                if (hasMilestone("surge", 2)) {
                    surgeMult = surgeMult.mul(1.5)
                }
                if (hasMilestone("surge", 3)) {
                    surgeMult = surgeMult.mul(1.5)
                }
                if (hasMilestone("surge", 4)) {
                    surgeMult = surgeMult.mul(1.5)
                }
                if (hasMilestone("surge", 5)) {
                    surgeMult = surgeMult.mul(1.5)
                }
                if (hasMilestone("surge", 6)) {
                    surgeMult = surgeMult.mul(1.5)
                }
                if (hasMilestone("surge", 7)) {
                    surgeMult = surgeMult.mul(1.5)
                }
                if (hasMilestone("surge", 8)) {
                    surgeMult = surgeMult.mul(1.5)
                }
                if (hasMilestone("surge", 9)) {
                    surgeMult = surgeMult.mul(1.5)
                }

                return surgeMult
            },
            unlocked() { return hasMilestone("surge", 3) || hasAchievement(this.layer, this.id) },
        },
        23: {
            name: "Challenged",
            done() {
                var completions = new Decimal(challengeCompletions("surge", 11)).add(challengeCompletions("surge", 12))
                completions = completions.add(challengeCompletions("surge", 21)).add(challengeCompletions("surge", 22))
                completions = completions.add(challengeCompletions("surge", 31)).add(challengeCompletions("surge", 32))

                return completions.gte(1)
            },
            tooltip() {
                return "Complete a Surge Challenge.<br>Reward: 'Double Generation' energy upgrade effect +5% per surge challenge completion.\nCurrently: " + format(achievementEffect(this.layer, this.id)) + "x"
            },
            effect() {
                var completions = new Decimal(challengeCompletions("surge", 11)).add(challengeCompletions("surge", 12))
                completions = completions.add(challengeCompletions("surge", 21)).add(challengeCompletions("surge", 22))
                completions = completions.add(challengeCompletions("surge", 31)).add(challengeCompletions("surge", 32))

                return new Decimal(1.05).pow(completions)
            },
            unlocked() { return hasMilestone("surge", 4) || hasAchievement(this.layer, this.id) },
        },
        24: {
            name: "The Small Step...",
            done() {
                var completions = new Decimal(challengeCompletions("surge", 11)).add(challengeCompletions("surge", 12))
                completions = completions.add(challengeCompletions("surge", 21)).add(challengeCompletions("surge", 22))
                completions = completions.add(challengeCompletions("surge", 31)).add(challengeCompletions("surge", 32))

                return completions.gte(5)
            },
            tooltip() {
                return "Complete 5 Surge Challenges.<br>Reward: Unlock an autobuyer for Energy Generator #4 and start with 1000 Energy."
            },
            unlocked() { return hasMilestone("surge", 4) || hasAchievement(this.layer, this.id) },
        },
        25: {
            name: "5 Star Review",
            done() {
                return challengeCompletions("surge", 11) >= 5 || challengeCompletions("surge", 12) >= 5 || challengeCompletions("surge", 21) >= 5 || challengeCompletions("surge", 22) >= 5
            },
            tooltip() {
                return "Fully complete a Surge Challenge.<br>Reward: Unlock an autobuyer for Energy Generator #5 and #6."
            },
            unlocked() { return hasMilestone("surge", 4) || hasAchievement(this.layer, this.id) },
        },
        26: {
            name: "Full Course",
            done() {
                var completions = new Decimal(challengeCompletions("surge", 11)).add(challengeCompletions("surge", 12))
                completions = completions.add(challengeCompletions("surge", 21)).add(challengeCompletions("surge", 22))
                completions = completions.add(challengeCompletions("surge", 31)).add(challengeCompletions("surge", 32))

                return completions.gte(20)
            },
            tooltip() {
                return "Fully complete all Surge Challenges."
            },
            unlocked() { return hasMilestone("surge", 4) || hasAchievement(this.layer, this.id) },
        },
        31: {
            name: "Banked Energy",
            done() {
                return player.energybank.points.gte(1)
            },
            tooltip() {
                return "Completely fill an energy bank."
            },
            unlocked() { return hasAchievement(this.layer, 26) },
        },
        32: {
            name: "Plead The Fifth",
            done() {
                return challengeCompletions("surge", 31) > 0
            },
            tooltip() {
                return "Complete Surge Challenge #5 once.<br>Reward: Energy Banks directly multiply time for time related effects."
            },
            unlocked() { return hasMilestone("surge", 7) },
        },
        33: {
            name: "The Second Tier",
            done() {
                return getBuyableAmount("surge", 11) > 0
            },
            tooltip() {
                return "Purchase a Surge Booster."
            },
            unlocked() { return hasMilestone("surge", 7) },
        },
        34: {
            name: "And Beyond!",
            done() {
                return player.points.gte(new Decimal(10).pow(308).mul(1.79))
            },
            tooltip() {
                return "Reach infinity (1.8e308) Energy.<br>Reward: Unlock an Energy Charger."
            },
            unlocked() { return hasAchievement(this.layer, 26) },
        },
        35: {
            name: "5 by 5",
            done() {
                return challengeCompletions("surge", 31) > 4
            },
            tooltip() {
                return "Fully complete Surge Challenge #5."
            },
            unlocked() { return hasMilestone("surge", 7) },
        },
        36: {
            name: "Max Deposit",
            done() {
                return player.energybank.points.gte(10)
            },
            tooltip() {
                return "Fully fill all 10 energy banks.<br>Reward: Unlock an autobuyer for Energy Charger."
            },
            unlocked() { return hasAchievement(this.layer, 26) },
        },
    },
})