addLayer("a", {
    startData() {
        return {
            unlocked: true,
        }
    },
    color: "yellow",
    row: "side",
    layerShown() { return true },
    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("Achievements")
    },
    achievements: {
        11: {
            name: "An Essence of the Broken World",
            done() { return player.mem.points.gte(100) },
            tooltip: "Gain 100 Memories.<br>Rewards:Fragments generation is a little faster.",
            unlocked() { return true },
        },
        12: {
            name: "A Stack",
            done() { return player.points.gte(9999) },
            tooltip: "Gain 9999 Fragments.",
            unlocked() { return true },
        },
        13: {
            name: "A Step to the Unknown",
            done() { return hasUpgrade('mem', 24) },
            tooltip: "Start exploring the world.",
            unlocked() { return true },
        },
        14: {
            name: "Get Ready",
            done() { return player.mem.points.gte(9999) },
            tooltip: "Gain 9999 Memories.<br>Rewards:You start at 5 Memories when reset.",
            unlocked() { return true },
        },
        15: {
            name: "Define Aspects",
            done() { return player.light.unlocked && player.dark.unlocked },
            tooltip: "Unlock Both Light And Dark Layers.<br>Rewards:They behave as they are unlocked first and there's a new row of Mmeory upgrade.",
        },
        21: {
            name: "Define Aspects™",
            done() { return hasMilestone('light', 0) && hasMilestone('dark', 0) },
            tooltip: "Reach L&D's 1st milestone.",
            unlocked() { return true },
        },
        22: {
            name: "No longer useless",
            done() { return hasUpgrade('dark', 33) },
            tooltip: "Make your Achievements useful for something.",
            unlocked() { return true },
        },
        23: {
            name: "Stacks^Stacks",
            done() { return player.points.gte(999e16) },
            tooltip: "Gain 9.99e18 Fragments.<br>Rewards:Fragments now make Memory softcap starts later.",
            unlocked() { return true },
        },
        24: {
            name: "Eternal Core",
            done() { return hasUpgrade('mem', 41) },
            tooltip: "Build up the Core.<br>Rewards:Keep the Core on all resets and add one milestone each for L&D.",
            unlocked() { return true },
        },
        25: {
            name: "Core-Automating",
            done() { return (hasMilestone('light', 3) || hasMilestone('dark', 3)) && hasUpgrade('mem', 41) },
            tooltip: "Start generating your Memories after you have the core.<br>Rewards:L&D's upgrades will give back half of their cost.",
            unlocked() { return true },
        },
        31: {
            name: "New Branches",
            done() { return player.kou.unlocked && player.lethe.unlocked },
            tooltip: "Unlock both Red and Forgotten layers.<br>Rewards:They behave as they are unlocked first.",
            unlocked() { return true },
        },
        32: {
            name: "Plenty of them",
            done() { return player.light.points.plus(player.dark.points).gte(380) },
            tooltip: "Have more than 380 Light Tachyons or Dark Matters.<br>Rewards:Their effects increase based on their own reset time.",
            unlocked() { return true },
        },
        33: {
            name: "Higher than the Clouds!",
            done() { return player.kou.buyables[11].gte(10) },
            tooltip: "Make the Tower have at least 10 levels.",
            unlocked() { return true },
        },
        34: {
            name: "Plenty*3.95 of them",
            done() { return player.light.points.plus(player.dark.points).gte(1500) },
            tooltip: "Have more than 1500 Light Tachyons or Dark Matters.<br>Rewards:L's effect boosts R's gain, D's effect boosts F's gain.",
            unlocked() { return true },
        },
        35: {
            name: "Scepter of The Soul Guide",
            done() { return hasUpgrade("lethe", 33) },
            tooltip: "Buy your first Guiding Beacon.<br>Rewards: Always gain 30% of Memory gain every second.",
            unlocked() { return true },
        },
        41: {
            name: "e(An Essence) of the Broken World",
            done() { return player.mem.points.gte(1e100) },
            tooltip: "Gain 1e100 Memories.<br>Rewards:Starts at 100 Memories when reset.",
        },
        42: {
            name: "Stacks e(Stacks)",
            done() { return player.points.gte(9.99e99) },
            tooltip: "Gain 9.99e99 Fragments.",
        },
        43: {
            name: "Preparation has been made.",
            done() { return hasUpgrade("kou", 16) },
            tooltip: "Buy all Tower upgrades.<br>Rewards: You can buy 4 more Beacons.",
        },
        44: {
            name: "Beacons Beside Lethe",
            done() { return player.lethe.upgrades.length >= 25 },
            tooltip: "Have 25 Guiding Beacons.",
        },
        45: {
            name: "The Lab.",
            done() { return hasUpgrade('mem', 42) },
            tooltip: "Set up the Lab.<br>Unlock Lab Layer and gain 1 Research Point.",
        },
        51: {
            name: "\"A Professional lab in its……field.\"",
            done() { return hasMilestone('lab', 7) },
            tooltip: "Build up your reputation among scientists.",
        },
        52: {
            name: "A Working Lab",
            done() { return player.lab.points.gte(1000) },
            tooltip: "Gain 1000 Research Points.",
        },
        53: {
            name: "Dollhouse",
            done() { return player.kou.points.gte(100) },
            tooltip: "Have more than 100 Red Dolls.<br>Rewards:Guiding Beacons will give back their Red Dolls cost.",
        },
        54: {
            name: "Founding Relics",
            done() { return player.zero.unlocked && player.axium.unlocked },
            tooltip: "Unlocked both Anonymous Layers<br>Rewards:Research Point gain x1.5.",
        },
        55: {
            name: "Sea of Drops",
            done() { return player.lethe.points.gte(1e200) },
            tooltip: "Have more than 1e200 Forgotten Drops.",
        },
        61: {
            name: "The World",
            done() { return player.world.unlocked },
            tooltip: "Unlocked World Layer.",
        },
        62: {
            name: "The First Map",
            done() { return hasChallenge('world', 11) },
            tooltip: "Finish the first challenge in the world layer.<br>Rewards:The speed of World Steps gain is doubled.",
        },
        63: {
            name: "The True Presbyter of The World",
            done() { return player.zero.roses.gte(100) },
            tooltip: "Gain 100 Glowing Roses.<br>Rewards:Glowing Roses now boosts The Speed of World Steps gain.",
            effect() {
                if (player['zero'].roses.lte(0)) return new Decimal(1);
                let eff = player.zero.roses.plus(1).log10().plus(1);
                if (hasAchievement('a', 75)) eff = player.zero.roses.plus(1).log(7.5).plus(1);
                if (hasAchievement('a', 92)) eff = eff.times(tmp.etoluna.starPointeffect);
                //if (hasUpgrade('lethe', 63)) eff = eff.times(upgradeEffect('lethe', 63));
                //if (hasUpgrade('lethe', 64)) eff = eff.times(upgradeEffect('lethe', 64));
                //if (hasUpgrade('lethe', 65)) eff = eff.times(upgradeEffect('lethe', 65));
                //if (hasUpgrade('lethe', 75)) eff = eff.times(upgradeEffect('lethe', 75));
                //if (hasUpgrade('lethe', 85)) eff = eff.times(upgradeEffect('lethe', 85));
                return eff;
            },
        },
        64: {
            name: "Dire Straits",
            done() { return player.axium.timesmoved.gte(10) },
            tooltip: "Move more than 10 times in the Maze<br>Rewards:Gain more 5 moves in the Maze.",
        },
        65: {
            name: "Triangulation",
            done() { return hasMilestone('zero', 4) && hasMilestone('axium', 4) },
            tooltip: "Reach LC & FL's 5th milestone.<br>Rewards:The speed of World Steps gain x1.5.",
        },
        71: {
            name: "Direct Synergy",
            done() { return hasChallenge('world', 21) && hasUpgrade('lab', 113) && hasUpgrade('lab', 114) },
            tooltip: "Make all row4 source boost each other's gain.(For now)<br>Rewards: Unlock more types of World Steps in the World Layer.",
        },
        72: {
            name: "Nothing Can Stop Us",
            done() { return player.world.restrictionnum.gte(10) && player.world.fixednum.gte(10) },
            tooltip: "Go through more than 10 Restriction Steps and Fixed Speed Steps.<br>Rewards:You can choose among two directions in Maze.",
        },
        73: {
            name: "Anthemy",
            done() { return player.zero.roses.gte(1000) },
            tooltip: "Gain 1000 Glowing Roses.<br>Rewards:Entering Zero Sky halves your GR instead of resetting them.",
        },
        74: {
            name: "There's no Limit!",
            done() { return player.points.gte(1.79e308) },
            tooltip: "Reach 1.79e308 Fragments.",
        },
        75: {
            name: "Fully Upgraded",
            done() { return hasUpgrade('lab',131) && hasUpgrade('lab',132) && hasUpgrade('lab',133) && hasUpgrade('lab',134) },
            tooltip: "Improve the Maze formulas.<br>Rewards:Glowing Roses boost The Speed of World Steps gain better.",
        },
        81: {
            name: "\"Currently, nothing here.\"",
            done() { return player.storylayer.unlocked },
            tooltip: "Begin Your stories.",
        },
        82: {
            name: "Higher and Higher",
            done() { return player.world.points.gte(1000) },
            tooltip: "Gain 1000 World Steps.<br>Rewards:You can choose among three directions in Maze.",
        },
        83: {
            name: "Irregular Florescence",
            done() { return inChallenge('zero', 11) && player.world.randomChallenge },
            tooltip: "Entering Zero Sky when going on random steps.",
        },
        84: {
            name: "Lossy Move",
            done() { return player.axium.timesmoved.gte(100) },
            tooltip: "Move more than 100 times in the Maze.<br>Rewards:You can choose all four directions in Maze.",
        },
        85: {
            name: "Building Group",
            done() { return player.zero.points.gte(10) && player.axium.points.gte(10) },
            tooltip: "Gain both 10 Luminous Churches & Flourish Labyrinths.<br>Rewards:Stories you have gone through boost Fragments generation.",
            effect() {
                return player.storylayer.points.plus(1);
            },
        },
        91: {
            name: "World Edge",
            done() { return player.etoluna.unlocked || player.saya.unlocked },
            tooltip: "Perform a row 5 reset.<br>Rewards:Your going on different world steps is now automated.",
        },
        92: {
            name: "\"Oh, No. Another BA.\"",
            done() { return player.etoluna.starPoint.gte(250) && player.etoluna.moonPoint.gte(250) },
            tooltip: "Gain both 250 Star Points & Moon Points.<br>Rewards:Unlock their buffs.",
            //style:{'background-position':'center'}
        },
        93: {
            name: "Being others",
            done() { return challengeCompletions('saya', 11) >= 1 },
            tooltip: "Complete Memory Adjustment Challenge once.<br>Rewards:Keep World Maps when reset, and you gain moves in maze 2x.",
        },
        94: {
            name: "Suspicious Spots",
            done() { return player.saya.unlocked && player.etoluna.unlocked },
            tooltip: "Unlock both Gemini & Knives Layers.<br>Rewards:You keep your World Atlas when reset.",
        },
        95: {
            name: "Not Too Much",
            done() { return layers.world.restrictReward().gte(150) },
            tooltip: "Reach the Restriction Steps Rewards' hardcap.",
        },
        101: {
            name: "\"I told you it's useless\"",
            done() { return (inChallenge('saya', 41) /*|| (player.saya.CurrentPairChallenge!=null && tmp.saya.grid.ChallengeDepth[7]!=-1)*/) && inChallenge('zero', 11) },
            tooltip: "Enter Zero Sky while in Otherside of Godess Challenge.<br>Rewards:Everflashing Knives also effect Glowing roses Gain.",
        },
        102: {
            name: "Hypersense",
            done() { return player.etoluna.points.gte(1000) },
            tooltip: "Gain 1000 Gemini Bounds.<br>Rewards:Gemini Bounds give more speed on Star/Moon Points gaining.",
        },
        103: {
            name: "Seriously?",
            done() { return player.axium.timesmoved.gte(1000000) },
            tooltip: "Have more than 1,000,000 times moved in Maze.",
        },
        104: {
            name: "Fully Mastery",
            done() { return hasUpgrade('etoluna', 23) && hasUpgrade('etoluna', 24) && challengeCompletions('saya', 42) >= 5 },
            tooltip: "Buy all Gemini Upgrades and Finish the last Memory Adjustment.<br>Rewards: Unlock a new World Map, but you still need to push world step to take the challenge.",
        },
        105: {
            name: "\"Did I just see an NaN?\"",
            done() { return (challengeCompletions('saya', 42) >= 5) && (inChallenge('saya', 42)||(player.saya.CurrentPairChallenge!=null && tmp.saya.grid.ChallengeDepth[8]>=5)) && player.tab == 'light' },
            tooltip: "See an NaN which won't break the game.",
        },
        111: {
            name: "Fragmental Industry",
            done() { return player.lib.unlocked },
            tooltip: "Perform a row 6 reset.<br>Rewards:You lose Research Power and overflowing Research Point 0.1% per second instead of 1%, and keep 10 Light Tachyons & Dark Matters when reset.",
        },
    },
    tabFormat: [
        "blank",
        ["display-text", function () { return "When boosts say sth about achievements, usually it relates to the amount of achievements you have." }],
        ["display-text", function () { return "Achievements: " + player.a.achievements.length + "/" + (Object.keys(tmp.a.achievements).length - 2) }],
        "blank", "blank",
        "achievements",
    ],
},
) 