addLayer("ach", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},

    color: "#FFFFC8",                       // The color for this layer, which affects many elements.
    resource: "achievement points",            // The name of this layer's main prestige resource.
    symbol: "!",
    row: 'side',
    style() {return  {'background-color': '#373728'}},                                  // The row this layer is on (0 is the first row).

    baseResource: "points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.points },  // A function to return the current amount of baseResource.

    requires: new Decimal(0),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "none",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.5,                          // "normal" prestige gain is (currency^exponent).

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        return new Decimal(1)               // Factor in any bonuses multiplying gain here.
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },

    layerShown() { return true },          // Returns a bool for if this layer's node should be visible in the tree.

    achievements: {
        11: {
            name: "<h4 style='margin-top:5px'>Great, another generic prestige tree mod</h4>",
            done() { return true},
            tooltip: "you don't need to know how to Get this one. it's free!",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 26))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
        },
        12: {
            name: "<h4 style='margin-top:5px'>Just a few resets</h4>",
            done() { return hasMilestone("r", 1)},
            tooltip: "Get reset milestone 2 '100 resets'",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 26))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
        },
        13: {
            name: "<h4 style='margin-top:5px'>Reset-reset time!</h4>",
            done() { return player['a'].points.gte(1)},
            tooltip: "Get 1 ascenion point",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 26))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
        },
        14: {
            name: "<h4 style='margin-top:5px'>Of course you can</h4>",
            done() { return hasUpgrade("a", 14)},
            tooltip: "Get ascenion upgrade 'can i go back to resets?'",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 26))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
        },
        15: {
            name: "<h4 style='margin-top:5px'>Do you really need this many resets?</h4>",
            done() { return hasMilestone("r", 4)},
            tooltip: "Get reset milestone 5 '1000000 resets'",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 26))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
        },
        16: {
            name: "<h4 style='margin-top:5px'>Reset-reset time! ...Again</h4>",
            done() { return player['p'].points.gte(1)},
            tooltip: "Get 1 prestige point",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 26))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
        },
        21: {
            name: "<h4 style='margin-top:5px'>You definitely don't need this many resets</h4>",
            done() { return player['r'].points.gte(100000000)},
            tooltip: "Get 100,000,000 reset points",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 26))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
        },
        22: {
            name: "<h4 style='margin-top:5px'>The start of automation</h4>",
            done() { return hasUpgrade("p", 21)},
            tooltip: "Get prestige upgrade 'too slow to be useful'",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 26))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
        },
        23: {
            name: "<h4 style='margin-top:5px'>How many buttons do you need?</h4>",
            done() { return getBuyableAmount('r', 11) >= 2024},
            tooltip: "max out 'reset button' by buying 2024 of them",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 26))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
        },
        24: {
            name: "<h4 style='margin-top:5px'>Just kidding! You do need those resets</h4>",
            done() { return hasUpgrade('p', 23)},
            tooltip: "Get prestige upgrade '3 per row is too low'",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 26))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
        },
        25: {
            name: "<h4 style='margin-top:5px'>Time for scientific notation</h4>",
            done() { return hasMilestone('r', 7)},
            tooltip: "Get reset milestone 7 '1e10 resets'",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 26))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
        },
        26: {
            name: "<h4 style='margin-top:5px'>Time for reset-reset-resets?</h4>",
            done() { return player['rb'].points.gte(1)},
            tooltip: "Get 1 rebirth point",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 26))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
        },
        31: {
            name:"<h4 style='margin-top:5px'>Finally some new content</h4>",
            done() { return player['rb'].points.gte(3)},
            tooltip: "Get 3 rebirth points",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 46))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
            unlocked() { return hasMilestone('rb', 0)},
        },
        32: {
            name:"<h4 style='margin-top:5px'>Fast enough to be useful</h4>",
            done() { return hasMilestone('rb', 4)},
            tooltip: "Get the 5th rebirth milestone '5th rebirth'",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 46))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
            unlocked() { return hasMilestone('rb', 0)},
        },
        33: {
            name:"<h4 style='margin-top:5px'>Is it just milestones?</h4>",
            done() { return hasMilestone('rb', 6)},
            tooltip: "Get the 6th rebirth milestone '8th rebirth'",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 46))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
            unlocked() { return hasMilestone('rb', 0)},
        },
        34: {
            name:"<h4 style='margin-top:5px'>It was not just milestones</h4>",
            done() { return hasUpgrade('rb', 32)},
            tooltip: "Get the rebirth upgrade 'rebirth power'",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 46))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
            unlocked() { return hasMilestone('rb', 0)},
        },
        35: {
            name:"<h4 style='margin-top:5px'>From reset-reset to ascend-ascend</h4>",
            done() { return player['t'].points.gte(1)},
            tooltip: "Get 1 transcendence point",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 46))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},//second true, first true, no true 
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
            unlocked() { return hasMilestone('rb', 0)},
        },
        36: {
            name:"<h4 style='margin-top:5px'>Second row challenges are cursed</h4>",
            done() { return hasChallenge('a', 11)},
            tooltip: "Finish the challenge 'Can resets be reasonable'.",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 46))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
            unlocked() { return hasAchievement('ach', 26)},
        },
        41: {
            name:"<h4 style='margin-top:5px'>No need to buy a gazilion buyables</h4>",
            done() { return hasMilestone('t', 1)},
            tooltip: "Get transcendence milestone '100 transcendence'.",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 46))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
            unlocked() { return hasAchievement('ach', 26)},
        },
        42: {
            name:"<h4 style='margin-top:5px'>I want them back, that was awful.</h4>",
            done() { return hasChallenge('a', 13)},
            tooltip: "Finish the challenge 'no more prestige'.",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 46))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
            unlocked() { return hasAchievement('ach', 26)},
        },
        43: {
            name:"<h4 style='margin-top:5px'>I'm not reseting for these</h4>",
            done() { return getBuyableAmount('t', 11)>14},
            tooltip: "Get 15 'insert name here'",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 46))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
            unlocked() { return hasAchievement('ach', 26)},
        },
        44: {
            name:"<h4 style='margin-top:5px'>And now i don't need to reset</h4>",
            done() { return hasUpgrade('p', 24)},
            tooltip: "Get prestige upgrade 'maybe it will be useful'.",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 46))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
            unlocked() { return hasAchievement('ach', 26)},
        },
        45: {
            name:"<h4 style='margin-top:5px'>Why are they just called 'insert name here'?</h4>",
            done() { return player['t'].total.gte(2000)},
            tooltip: "Get 2000 total transcendence",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 46))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
            unlocked() { return hasAchievement('ach', 26)},
        },
        46: {
            name:"<h4 style='margin-top:5px'>It's rewind time!</h4>",
            done() { return player['rw'].points.gte(1)},
            tooltip: "Get 1 rewind point",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 46))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
            unlocked() { return hasMilestone('rb', 0)},
        },
        51: {
            name:"<h4 style='margin-top:5px'>Hope you like keeping track of 4 different currencies</h4>",
            done() { return player['rw'].seconds.gte(30)},
            tooltip: "Get 30 seconds in rewind layer",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 66))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
            unlocked() { return hasAchievement('ach', 46)},
        },
        52: {
            name:"<h4 style='margin-top:5px'>sec/sec/sec/sec</h4>",
            done() { return hasUpgrade('rw', 14)},
            tooltip: "Get the rewind upgrade 'you get the idea by now'",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 66))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
            unlocked() { return hasAchievement('ach', 46)},
        },
        53: {
            name:"<h4 style='margin-top:5px'>Time waster</h4>",
            done() { return player.rw.minutes.gte(15)},
            tooltip: "Get 15 minutes in rewind layer",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 66))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
            unlocked() { return hasAchievement('ach', 46)},
        },
        54: {
            name:"<h4 style='margin-top:5px'>This is completely useless</h4>",
            done() { return hasUpgrade('rw', 33)},
            tooltip: "Get the rewind upgrade '60 is just to much'",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 66))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
            unlocked() { return hasAchievement('ach', 46)},
        },
        55: {
            name:"<h4 style='margin-top:5px'>I want more automation</h4>",
            done() { return hasUpgrade('rw', 35)},
            tooltip: "Get the rewind upgrade 'min/min'",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 66))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
            unlocked() { return hasAchievement('ach', 46)},
        },
        56: {
            name:"<h4 style='margin-top:5px'>Why isn't there a 'convert to days'? I wanted a 5th currency to use</h4>",
            done() { return player.rw.hours.gte(24)},
            tooltip: "Get 24 hours in rewind layer.",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 66))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
            unlocked() { return hasAchievement('ach', 46)},
        },
        61: {
            name:"<h4 style='margin-top:5px'>Wait there even more?</h4>",
            done() { return hasUpgrade('rw', 52)},
            tooltip: "Get the rewind upgrade 'why is there more'.",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 66))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
            unlocked() { return hasAchievement('ach', 46)},
        },
        62: {
            name:"<h4 style='margin-top:5px'>If not days, why not weeks?</h4>",
            done() { return player.rw.hours.gte(168)},
            tooltip: "Get 168 hours in the rewind layer.",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 66))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
            unlocked() { return hasAchievement('ach', 46)},
        },
        63: {
            name:"<h4 style='margin-top:5px'>There does not need to be 30 upgrades</h4>",
            done() { return hasUpgrade('rw', 45)},
            tooltip: "Get the rewind upgrade 'i told you it wouldn't'.",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 66))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
            unlocked() { return hasAchievement('ach', 46)},
        },
        64: {
            name:"<h4 style='margin-top:5px'>Very trustworthy upgrade indeed</h4>",
            done() { return hasUpgrade('rw', 65)},
            tooltip: "Get the rewind upgrade 'NOTHING'.",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 66))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
            unlocked() { return hasAchievement('ach', 46)},
        },
        65: {
            name:"<h4 style='margin-top:5px'>What have you done?</h4>",
            done() { return player.rw.seconds.gte(1.79e308)},
            tooltip: "Get 1.79e308 seconds in rewind layer.",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 66))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
            unlocked() { return hasAchievement('ach', 46)},
        },
        66: {
            name:"<h4 style='margin-top:5px'>The only way out</h4>",
            done() { return player.s.points.gte(1)},
            tooltip: "Get 1 singularity.",
            style(){return {"border-radius": "10% / 10%", "width": "100px", "height": "100px", 'background-color': (hasAchievement('ach',this.id)?(hasAchievement('ach', 66))?'#FFDC3D':'#77BF5F':'#BF5F5F' )}},
            onComplete() {player['ach'].points = player['ach'].points.add(1) },
            unlocked() { return hasAchievement('ach', 46)},
        },

    },
    tabFormat: [
        ["display-text", function() { return "<h3> Achievements </h3><br> <h4 style='margin-top:5px'> just a collection of, who could of guessed it, achievements. your 'achievement points' act as a counter for your completed achievements. most of these can be completed by just playing through the game normally. </h4><br> You have <h1 style='color: #FFFFC8'> " + player['ach'].points + "</h1> achievements"}],
        "blank",
        ["display-text", function() { return " Set 1<br> <h1 style='color: #FFFFC8' >The Basics</h1>"}],
        "blank",
        ["row", [["achievement", 11], ["achievement", 12], ["achievement", 13], ["achievement", 14], ["achievement", 15], ["achievement", 16]]],
        ["row", [["achievement", 21], ["achievement", 22], ["achievement", 23], ["achievement", 24], ["achievement", 25], ["achievement", 26]]],
        "blank",
        "blank",
        ["display-text", function() { return " Set 2<br>" + (hasAchievement('ach',26)?" <h1 style='color: #E0E0C8' >Reset^3</h1>": "<h1 style='color: #E0E0C8' >??????</h1>")}],
        "blank",
        ["row", [["achievement", 31], ["achievement", 32], ["achievement", 33], ["achievement", 34], ["achievement", 35], ["achievement", 36]]],
        ["row", [["achievement", 41], ["achievement", 42], ["achievement", 43], ["achievement", 44], ["achievement", 45], ["achievement", 46]]],
        "blank",
        "blank",
        ["display-text", function() { return " Set 3<br>" + (hasAchievement('ach',46)?" <h1 style='color: #E0E0C8' >time is an illusion</h1>": "<h1 style='color: #E0E0C8' >???? ?? ?? ????????</h1>")}],
        "blank",
        ["row", [["achievement", 51], ["achievement", 52], ["achievement", 53], ["achievement", 54], ["achievement", 55], ["achievement", 56]]],
        ["row", [["achievement", 61], ["achievement", 62], ["achievement", 63], ["achievement", 64], ["achievement", 65], ["achievement", 66]]],
    ],
})
