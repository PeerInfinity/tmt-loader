addLayer("I", {
    name: "Tier 1", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "I", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "tier 1 power", // Name of prestige currency
    baseResource: "Challenge Power", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent

    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    softcap: function() {
        capstart = new Decimal (100)
        if (!inChallenge("IV",22)) {
            capstart = capstart.times(new Decimal.pow(10, challengeCompletions("II",11)))
        }
        capstart = capstart.times(new Decimal.pow(2,challengeCompletions("III",12))).times(new Decimal(player.III.formpts).add(1))
        return capstart
    },
    softcapPower: function() {return new Decimal (0.25)},
    effectDescription: function() {return "also note that tier 1 power gain is softcapped by ^0.25 after " + new Decimal.pow(10, challengeCompletions("II",11)).times(100).times(new Decimal.pow(2,challengeCompletions("III",12))).times(player.III.formpts.add(1)) + " tier 1 power."},
    passiveGeneration() {
        if (!hasChallenge("II",13)||inChallenge("IV",22))
            return new Decimal(0)
        return new Decimal.pow(10, challengeCompletions("II", 13) - 1).times(0.01)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "1", description: "1: Reset for Tier 1 Power", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    infoboxes: {
        lore: {
            title: "Tier 1 Lore",
            body: `<img src="SceneI.png" width="500"><br>
            You:<q>Huh? What is this place?</q><br>
            ???:<q>Oh great, you finally woke up. I thought I have to clean up another corpse again.</q><br>
            You:<q>What's all this corpse cleaning and me being teleported to another world about?</q><br>
            ???:<q>So you did not belong to this world?</q><br>
            You:<q>I was at my home having some sleep after grinding an incremental game and next thing I know, I am here.</q><br>
            ???:<q>I see... Having numbers go up is what we do here as well!</q><br>
            You:<q>Really?</q><br>
            ???:<q>Yes! My name is Chal, and I'm have to do basically every chore in this place...</q><br>
            You:<q>Oh, I'm sorry to hear.</q><br>
            Chal:<q>I can try helping you go back to your world, but before that you need to accumulate a lot of Challenge Power first. Try getting some by clearing these challenges first!`,
        },
    },
    challenges: {
        11: {
            name: "You Gotta Start Somewhere",
            challengeDescription: "This challenge is free to complete; complete it to start generating Challenge Power!",
            canComplete: function() {return true},
            goalDescription: "0 Challenge Power",
            rewardDescription: "Start Generating Challenge Power."
        },
        12: {
            name: "The Second One's Not So Free",
            challengeDescription: "You have to wait until 20 Challenge Power to complete this challenge. Go read the lore to kill some time while you wait!",
            canComplete: function() {return player.points.gte(20)},
            unlocked() {return hasMilestone(this.layer,1)},
            goalDescription: "20 Challenge Power",
            rewardDescription: "Tier 1 power boosts Challenge Power gain.",
            rewardDisplay() {return "x" + format(player.I.points.times(0.1).plus(1)) +" to Challenge Power gain."}
            
        },
        13: {
            name: "Things actually get challenging now",
            challengeDescription: "Production is divided by 10 in this challenge.",
            canComplete: function() {return player.points.gte(1)},
            unlocked() {return hasMilestone(this.layer,2)},
            goalDescription: "1 Challenge Power",
            rewardDescription: "Challenge Power Gain is Multiplied by 10.", 
        },
        14: {
            name: "Square Roots",
            challengeDescription: "Production is square rooted in this challenge.",
            canComplete: function() {return player.points.gte(50)},
            unlocked() {return hasMilestone(this.layer,3)},
            goalDescription: "50 Challenge Power",
            rewardDescription: "Challenge Power Gain is squared, and unlocks Tier 2."
        }
    },
    milestones: {
        1: {
            requirementDescription: "1 Tier 1 Power",
            effectDescription: "Unlock the second Tier 1 Challenge.",
            done() { return player.I.points.gte(1) }
        },
        2: {
            requirementDescription: "5 Tier 1 Power",
            effectDescription: "Unlock the third Tier 1 Challenge.",
            done() { return player.I.points.gte(5) }
        },
        3: {
            requirementDescription: "20 Tier 1 Power",
            effectDescription: "Unlock the fourth and final Tier 1 Challenge.",
            done() { return player.I.points.gte(20) }
        }
    },
    tabFormat: [
        "blank",
        ["infobox", "lore"],
        "main-display",
        "prestige-button",
        "blank",
        "challenges",
        "blank",
        "milestones",
    ],
    doReset(I) {
        if(layers[I].row <= layers[this.layer].row || layers[I].row == "side")return;
        let keep = []
        if(hasMilestone("II",1))keep.push("challenges")
        if(hasMilestone("II",1))keep.push("milestones")
        layerDataReset("I", keep);
      },
    layerShown(){return true}
})
addLayer("II", {
    name: "Tier 2", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "II", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#FF7F00",
    requires: new Decimal(100), // Can be a function that takes requirement increases into account
    resource: "tier 2 power", // Name of prestige currency
    baseResource: "tier 1 Power", // Name of resource prestige is based on
    baseAmount() {return player.I.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    effect() {
        cpmult = new Decimal (0.5)
        if(!inChallenge("IV",22)){
            cpmult = cpmult.plus(new Decimal.pow(10, challengeCompletions("II", 14)))
        }
        return cpmult
    },
    effectDescription: function() {return "which boosts Challenge Power Gain by " + player.II.points.times(this.effect()).plus(1) + "x"},
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (!inChallenge("IV",22)){ 
            mult = mult.plus(new Decimal.pow(challengeCompletions("II", 12),2))
        }
        mult = mult.plus(new Decimal.pow(2,challengeCompletions("III",13)).sub(1)).times(new Decimal(player.III.formpts).add(1))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    passiveGeneration() {
        return new Decimal(new Decimal(player.III.points).times(0.01).times(new Decimal.pow(2,challengeCompletions("III",14))).times(new Decimal(player.III.formpts).plus(1)))
    },
    update(diff) {
        const activeChallenge = player[this.layer].activeChallenge;
        if (activeChallenge && canCompleteChallenge(this.layer, activeChallenge)) {
          startChallenge(this.layer, activeChallenge);
          if (!maxedChallenge(this.layer, activeChallenge)) {
            startChallenge(this.layer, activeChallenge);
          }
        }
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    branches: ["I"],
    hotkeys: [
        {key: "2", description: "2: Reset for Tier 2 Power", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    infoboxes: {
        lore: {
            title: "Tier 2 Lore",
            body: `Chal: <q>Excellent Job! This is the only challenges I can give you, but you got a number of Challenge Power from them.</q><br>
            You: <q>Hey, this feels really like an incremental game! It's a little challenge heavy, but numbers still go up.</q><br>
            Chal: <q>OK, follow me to another challenge maker, and you might get enough power to go back home!</q><br>
            ...<br>
            <img src="SceneII.png" width="500"><br>
            Rep: <q>Oi Chal. Never saw that person next to you before.</q><br>
            Chal: <q>Well this person came from another dimension. That would explain...</q><br>
            Rep: <q>Dimensional warp? Are you just making up bullcrap again? The kingdom punishes you to do all the heavy work for a reason...</q><br>
            You: <q>...the first thing I think of when hearing the word 'dimensions' is this incremental game called Antimatter Dimensions...</q><br>
            Rep: <q>...Antimatter Dimensions? We don't have this game here! Now I believe you are from another world. My name's Rep. Been building my body ever since I got to utilize Challenge Power.</q><br>
            You: <q>Lemme guess. You have challenges that I can do to gain challenge power too, am I right?</q><br>
            Rep: <q>Unlike Chal's challenges, mine are repeatable. Think of it as lifting dumbbells! Exercising with these challenges should give you lots of Challenge Power.</q><br>
            Chal: <q>Woah there. I would prefer my friend's experience here to be more fun, working out sounds boring. How about I cast a spell to make them automatically motivated and complete another workout just as they finish doing one in the same set?</q><br>
            Rep: <q>People still gain strength with that spell, so fine.</q><br>
            (Chal gave you the power of autoCompleting repeatable challenges.)`,
        },
    },
    clickables: {
        11: {
            title: "Hold to gain tier 1 power",
            display: "(Mobile QoL)",
            onClick() {if(canReset("I")) doReset("I")},
            onHold() {if(canReset("I")) doReset("I")},
            canClick() {return true},
        },
    },
    challenges: {
        11: {
            name: "Warm Up!",
            completionLimit: 100,
            challengeDescription: function() {return "No nerfs, just finish the challenge! (Hint: make use of Tier 1 Power)<br>"+challengeCompletions(this.layer, this.id)
            + "/" + this.completionLimit + " completions"},
            canComplete: function() {return player.points.gte(new Decimal.pow(1000, challengeCompletions("II", 11) + 1)) },//always does 1 at a time, check if points > req},
            goalDescription: function() {return format(new Decimal.pow(1000, challengeCompletions("II", 11) + 1))+" Challenge Power"},
            rewardDescription: function() {return "Softcap to tier 1 power gain is delayed by " + format(new Decimal.pow(10, challengeCompletions("II",11))) +"x."},
            unlocked() {return hasMilestone(this.layer,1)}
        },
        12: {
            name: "The first exercise",
            completionLimit: 100,
            challengeDescription: function() {return "Reward of 'The Second One's Not So Free' is disabled.<br>"+challengeCompletions(this.layer, this.id)
            + "/" + this.completionLimit + " completions"},
            canComplete: function() {return player.points.gte(new Decimal.pow(1000, challengeCompletions("II", 12) + 1)) },//always does 1 at a time, check if points > req},
            goalDescription: function() {return format(new Decimal.pow(1000, challengeCompletions("II", 12) + 1))+" Challenge Power"},
            rewardDescription: function() {return "x" + format(new Decimal.pow(challengeCompletions("II", 12),2).plus(1)) +" to Tier 2 Power gain."},
            unlocked() {return hasMilestone(this.layer,2)}
        },
        13: {
            name: "Why are we still doing math tests...",
            completionLimit: 100,
            challengeDescription: function() {return "'The first exercise', and production is raised by ^" + format(0.500 - challengeCompletions("II", 13) * 0.004) + "<br>" +challengeCompletions(this.layer, this.id)
            + "/" + this.completionLimit + " completions"},
            canComplete: function() {return player.points.gte(new Decimal.pow(1000, challengeCompletions("II", 13) + 2)) },//always does 1 at a time, check if points > req},
            goalDescription: function() {return format(new Decimal.pow(1000, challengeCompletions("II", 13) + 2))+" Challenge Power"},
            rewardDescription: function() {return "Gain " + format(new Decimal.pow(10, challengeCompletions("II", 13) - 1)) +"% of Tier 1 power per second."},
            unlocked() {return hasMilestone(this.layer,3)}
        },
        14: {
            name: "Maybe Tier 2 Power isn't strong enough",
            completionLimit: 100,
            challengeDescription: function() {return "'The first exercise', and production is divided by " + format(new Decimal.pow(1000, challengeCompletions("II", 14) + 1)) + "<br>" +challengeCompletions(this.layer, this.id)
            + "/" + this.completionLimit + " completions"},
            canComplete: function() {return player.points.gte(new Decimal.pow(1000, challengeCompletions("II", 14) + 1)) },//always does 1 at a time, check if points > req},
            goalDescription: function() {return format(new Decimal.pow(1000, challengeCompletions("II", 14) + 1))+" Challenge Power"},
            rewardDescription: function() {return "Tier 2 power is boosted by " + format(new Decimal.pow(10, challengeCompletions("II", 14))) +"x."},
            unlocked() {return hasMilestone(this.layer,4)}
        },
        15: {
            name: "You're almost there",
            completionLimit: 100,
            challengeDescription: function() {return "You are stuck in T1C3-4 AND T2C2-4. (difficulty for Tier 2 challenges you are stuck in is based on this challenge's completions)<br>Complete this challenge 5 times for something cool..." + "<br>" +challengeCompletions(this.layer, this.id)
            + "/" + this.completionLimit + " completions"},
            canComplete: function() {return player.points.gte(new Decimal.pow(1000, challengeCompletions("II", 15) + 1)) },//always does 1 at a time, check if points > req},
            goalDescription: function() {return format(new Decimal.pow(1000, challengeCompletions("II", 15) + 1))+" Challenge Power"},
            rewardDescription: function() {return "Multiply  'The Second One's Not So Free''s effect by " + format(new Decimal.pow(challengeCompletions("II", 15), 2).plus(1)) +"x."},
            unlocked() {return hasMilestone(this.layer,5)}
        },
    },
    milestones: {
        1: {
            requirementDescription: "5 Tier 2 Power",
            effectDescription: "Keep Tier 1 challenge completions and milestones, and unlock the first Tier 2 Challenge.",
            done() { return player.II.points.gte(5) }
        },
        2: {
            requirementDescription: "5 'Warm Up!' Completions",
            effectDescription: "Unlock the Second Tier 2 Challenge.",
            done() {return challengeCompletions("II", 11) >= 5}
        },
        3: {
            requirementDescription: "5 'The first exercise' Completions",
            effectDescription: "Unlock the Third Tier 2 Challenge.",
            done() {return challengeCompletions("II", 12) >= 5}
        },       
        4: {
            requirementDescription: "5 'Why are we still doing math tests...' Completions",
            effectDescription: "Unlock the Fourth Tier 2 Challenge.",
            done() {return challengeCompletions("II", 13) >= 5}
        },
        5: {
            requirementDescription: "5 'Maybe Tier 2 Power isn't strong enough' Completions",
            effectDescription: "Unlock the Fifth and final Tier 2 Challenge.",
            done() {return challengeCompletions("II", 14) >= 5}
        },
        
    },
    tabFormat: [
        "blank",
        ["infobox", "lore"],
        "main-display",
        ["row", ["prestige-button", ["clickable", 11]]],
        "blank",
        "challenges",
        "blank",
        "milestones",
    ],
    doReset(II) {
        if(layers[II].row <= layers[this.layer].row || layers[II].row == "side")return;
        layerDataReset("II", ["challenges","milestones"]);
      },
    layerShown(){return hasChallenge("I",14)}
})

addLayer("III", {
    name: "Tier 3", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "III", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        formpts: new Decimal(0),
        formA: new Decimal(0),
        formB: new Decimal(0),
        formC: new Decimal(0),
    }},
    color: "#0099FF",
    requires: new Decimal.pow(10, 30), // Can be a function that takes requirement increases into account
    resource: "tier 3 power", // Name of prestige currency
    baseResource: "tier 2 power", // Name of resource prestige is based on
    baseAmount() {return player.II.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 2, // Prestige currency exponent
    effectDescription: function() {return "which increases the caps of your equation's variables by " + format(player.III.points) + " (hardcapped at 500) and gives " + format(player.III.points) + "% of tier 2 power on prestige per sec."},
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    update(diff) {
        let gain = new Decimal(0)
        if (player[this.layer].formA.gte(1) && player[this.layer].formB.gte(1) &&player[this.layer].formC.gte(1)) {
            gain = new Decimal.pow(new Decimal(player[this.layer].formB).times(player[this.layer].formC), new Decimal(player[this.layer].formA).div(new Decimal (5))) // put how much you gain per second here
        }
        if (inChallenge("III",12)&&((new Decimal(player[this.layer].formA).sub(player[this.layer].formB).sub(player[this.layer].formC)).lt(0))) {
            gain = new Decimal(0)
        }
        if (inChallenge("III",13)&&((new Decimal(player[this.layer].formA).div(player[this.layer].formB).sub(player[this.layer].formC)).lt(0))) {
            gain = new Decimal(0)
        }
        if (inChallenge("III",14)&&((new Decimal.pow(player[this.layer].formB,2).sub(new Decimal(player[this.layer].formA).times(player[this.layer].formC).times(4)).lt(0)))) {
            gain = new Decimal(0)
        }
        if (challengeCompletions("IV","POS") >= 1){
            gain = gain.times(tmp.IV.posBuff.plus(1))
        }
        if (challengeCompletions("IV","NEG") >= 1){
            gain = gain.div(tmp.IV.negNerf.plus(1))
        }
        if (challengeCompletions("IV",32) >= 1){
            gain = gain.times(tmp.IV.negBuff.plus(1))
        }
        if (inChallenge("IV",11)){
            gain = new Decimal(0)
        }
        if (hasChallenge("IV",41)) {
            gain = gain.times(new Decimal.pow(10,500))
        }
        player[this.layer].formpts = player[this.layer].formpts.add(gain.times(diff));   
        const activeChallenge = player[this.layer].activeChallenge;
        if (activeChallenge && canCompleteChallenge(this.layer, activeChallenge)) {
          startChallenge(this.layer, activeChallenge);
          if (!maxedChallenge(this.layer, activeChallenge)) {
            startChallenge(this.layer, activeChallenge);
          }
        }
      },
      maxFormulaValue() {
        if (inChallenge("IV", 42)) {
          return new Decimal(5);
        } else {
          return [11, 12, 13, 14].map(id => challengeCompletions('III', id)).reduce((a,b) => a.plus(b), player.III.points.min(500));
        }
      },

    row: 2, // Row the layer is in on the tree (0 is the first row)
    branches: ["II"],
    hotkeys: [
        {key: "3", description: "3: Reset for Tier 3 Power", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    infoboxes: {
        lore: {
            title: "Tier 3 Lore",
            body: `Rep: <q>This should be enough training. I think you can see the next challenge maker for more help! If you're stuck there, feel free to come back and train again!</q><br>
            ...<br>
            <img src="SceneIII.png" width="500"><br>
            You: <q>So... who are we seeing next?</q><br>
            Chal: <q>A mathematician!</q><br>
            You: <q>M-M-MATH!?</q><br>
            Chal: <q>Come on! Math is just a game! I thought people who watch numbers go up always feel this way.</q><br>
            ...<br>
            Form: <q>You're lucky you visited just after my last math tutorial for today... Anyways, what do you want me for?</q><br>
            Chal: <q>Well this person here would like some challenges. Can you give him some?</q><br>
            Form: <q>Hm... not a lot of people ask me for challenges recently. It would be fun to remember how that feels like again...</q><br>
            You: <q>I really, REALLY don't like where this is going.</q><br>
            Form: <q>Don't worry, I won't make this boring! Come on, let me show you the kind of challenges I do!</q><br>`,
        },
    },

    challenges: {
        11: {
            name: "The first one is the easiest again",
            completionLimit: 100,
            challengeDescription: function() {return "Only resets f(t) value, without affecting f(t) production. <br>"+challengeCompletions(this.layer, this.id)
            + "/" + this.completionLimit + " completions"},
            canComplete: function() {return player[this.layer].formpts.gte(new Decimal.pow(1000, challengeCompletions("III", 11) + 1)) },//always does 1 at a time, check if points > req},
            goalDescription: function() {return "f(t) >= " +  format(new Decimal.pow(1000, challengeCompletions("III", 11) + 1))},
            rewardDescription: function() {return "Adds 1 to the a, b and c limit per completion, AND f(t) boosts Challenge Power gain by " + format((new Decimal.pow(2,challengeCompletions("III",11)).sub(1)).times(player[this.layer].formpts.add(1))) +"x."},
            onEnter() {player[this.layer].formpts = new Decimal(0)},
            unlocked() {return true}
        },
        12: {
            name: "As simple as Subtraction",
            completionLimit: 100,
            challengeDescription: function() {return "Resets f(t) value, and f(t) only increases when (a-b-c)>=0. <br>"+challengeCompletions(this.layer, this.id)
            + "/" + this.completionLimit + " completions"},
            canComplete: function() {return player[this.layer].formpts.gte(new Decimal.pow(1000, challengeCompletions("III", 12) + 1)) },//always does 1 at a time, check if points > req},
            goalDescription: function() {return "f(t) >= " +  format(new Decimal.pow(1000, challengeCompletions("III", 12) + 1))},
            rewardDescription: function() {return "Adds 1 to the a, b and c limit per completion, AND f(t) delays Tier 1 Power softcap by " + format((new Decimal.pow(2,challengeCompletions("III",12)).sub(1)).times(player[this.layer].formpts.plus(1))) +"x."},
            onEnter() {player[this.layer].formpts = new Decimal(0)},
            unlocked() {return hasMilestone(this.layer,1)}
        },
        13: {
            name: "As medium as Division",
            completionLimit: 100,
            challengeDescription: function() {return "Resets f(t) value, and f(t) only increases when (a/b-c)>=0. <br>"+challengeCompletions(this.layer, this.id)
            + "/" + this.completionLimit + " completions"},
            canComplete: function() {return player[this.layer].formpts.gte(new Decimal.pow(1000, challengeCompletions("III", 13) + 1)) },//always does 1 at a time, check if points > req},
            goalDescription: function() {return "f(t) >= " +  format(new Decimal.pow(1000, challengeCompletions("III", 13) + 1))},
            rewardDescription: function() {return "Adds 1 to the a, b and c limit per completion, AND f(t) multiplies Tier 2 Power gain by " + format((new Decimal.pow(2,challengeCompletions("III",13)).sub(1)).times(player[this.layer].formpts.plus(1))) +"x."},
            onEnter() {
                player[this.layer].formpts = new Decimal(0)
                if (player[this.layer].formB.eq(0)){
                    player[this.layer].formB = 1
                }
            },
            unlocked() {return hasMilestone(this.layer,2)}
        },
        14: {
            name: "The Awaited Quadratic Reference",
            completionLimit: 100,
            challengeDescription: function() {return "Resets f(t) value, and f(t) only increases when (b<sup>2</sup>-4ac)>=0. <br>"+challengeCompletions(this.layer, this.id)
            + "/" + this.completionLimit + " completions"},
            canComplete: function() {return player[this.layer].formpts.gte(new Decimal.pow(1000, challengeCompletions("III", 14) + 1)) },//always does 1 at a time, check if points > req},
            goalDescription: function() {return "f(t) >= " +  format(new Decimal.pow(1000, challengeCompletions("III", 14) + 1))},
            rewardDescription: function() {return "Adds 1 to the a, b and c limit per completion, AND f(t) gives an extra " + format((new Decimal.pow(2,challengeCompletions("III",14)).sub(1)).times(player[this.layer].formpts.plus(1))) +"% of tier 2 power gain per sec."},
            onEnter() {player[this.layer].formpts = new Decimal(0)},
            unlocked() {return hasMilestone(this.layer,3)}
        },
    },

    milestones: {
        1: {
            requirementDescription: "A 'The first one is the easiest again' Completion",
            effectDescription: "Unlock the Second Tier 3 Challenge.",
            done() {return challengeCompletions("III", 11) >= 1}
        },
        2: {
            requirementDescription: "An 'As simple as Subtraction' Completion",
            effectDescription: "Unlock the Third Tier 3 Challenge.",
            done() {return challengeCompletions("III", 12) >= 1}
        },       
        3: {
            requirementDescription: "An 'As medium as Division' Completion",
            effectDescription: "Unlock the Fourth and final(?) Tier 3 Challenge.",
            done() {return challengeCompletions("III", 13) >= 1}
        },      
    },

    bars: {
        a: {
            direction: RIGHT,
            width: 300,
            height: 50,
            progress() {
                return new Decimal(player[this.layer].formA).div(tmp.III.maxFormulaValue)
            },
            display() {
                return "a: " +  format(new Decimal(player[this.layer].formA)) + "/" + format(tmp.III.maxFormulaValue);
            },
            baseStyle: {
                "background-color": "#777777"
            },
            fillStyle: {
                "background-color": "#FF0000"
            },
            textStyle: {
                "color": "#000000"
            }
        },
        b: {
            direction: RIGHT,
            width: 300,
            height: 50,
            progress() {
                return new Decimal(player[this.layer].formB).div(tmp.III.maxFormulaValue)
            },
            display() {
                return "b: " + format(player[this.layer].formB) + "/" + format(tmp.III.maxFormulaValue)
            },
            baseStyle: {
                "background-color": "#777777"
            },
            fillStyle: {
                "background-color": "#00FF00"
            },
            textStyle: {
                "color": "#000000"
            }
        },
        c: {
            direction: RIGHT,
            width: 300,
            height: 50,
            progress() {
                return new Decimal(player[this.layer].formC).div(tmp.III.maxFormulaValue)
            },
            display() {
                return "c: " + format(player[this.layer].formC) + "/" + format(tmp.III.maxFormulaValue)
            },
            baseStyle: {
                "background-color": "#777777"
            },
            fillStyle: {
                "background-color": "#00FFFF"
            },
            textStyle: {
                "color": "#000000"
            }
        }
    },
    clickables: {
        rows: 3,
        cols: 5,
        11: {
            display() {
                return "<h1><b>1</b></h1>"
            },
            canClick() {
                return new Decimal(player[this.layer].formA).gt(1)
            },
            onClick(){
                player[this.layer].formA = new Decimal (1)
            },
            style: {
                "width": "50px",
                "height": "5px"
            }
        },
        12: {
            display() {
                return "<h1><b>HALF</b></h1>"
            },
            canClick() {
                return new Decimal(player[this.layer].formA).gt(1)
            },
            onClick(){
                player[this.layer].formA = new Decimal.ceil(new Decimal(player[this.layer].formA).div(2))
            },
            style: {
                "width": "70px",
                "height": "5px"
            }
        },
        13: {
            display() {
                return "<h1><b>-</b></h1>"
            },
            canClick() {
                return new Decimal(player[this.layer].formA).gt(0)
            },
            onClick(){
                player[this.layer].formA = new Decimal(player[this.layer].formA).sub(1)
            },
            style: {
                "width": "50px",
                "height": "5px"
            }
        },
        14: {
            display() {
                return "<h1><b>+</b></h1>"
            },
            canClick() {
                return new Decimal(player[this.layer].formA).lt(tmp.III.maxFormulaValue)
            },
            onClick(){
                player[this.layer].formA = new Decimal(new Decimal(player[this.layer].formA).add(1)).min(new Decimal(tmp.III.maxFormulaValue))
            },
            style: {
                "width": "50px",
                "height": "5px"
            }
        },
        15: {
            display() {
                return "<h1><b>MAX</b></h1>"
            },
            canClick() {
                return new Decimal(player[this.layer].formA).lt(tmp.III.maxFormulaValue)
            },
            onClick(){
                player[this.layer].formA = new Decimal(tmp.III.maxFormulaValue)
            },
            style: {
                "width": "50px",
                "height": "5px"
            }
        },
        21: {
            display() {
                return "<h1><b>1</b></h1>"
            },
            canClick() {
                return new Decimal(player[this.layer].formB).gt(1)
            },
            onClick(){
                player[this.layer].formB = new Decimal (1)
            },
            style: {
                "width": "50px",
                "height": "5px"
            }
        },
        22: {
            display() {
                return "<h1><b>HALF</b></h1>"
            },
            canClick() {
                return new Decimal(player[this.layer].formB).gt(1)
            },
            onClick(){
                player[this.layer].formB = new Decimal.ceil(new Decimal(player[this.layer].formB).div(2))
            },
            style: {
                "width": "70px",
                "height": "5px"
            }
        },
        23: {
            display() {
                return "<h1><b>-</b></h1>"
            },
            canClick() {
                return new Decimal(player[this.layer].formB).gt(0)
            },
            onClick(){
                if (inChallenge("III",13) &&(player[this.layer].formB.eq(1))) {
                    player[this.layer].formB = new Decimal(1)
                } else {
                    player[this.layer].formB = new Decimal(player[this.layer].formB).sub(1)
                }
            },
            style: {
                "width": "50px",
                "height": "5px"
            }
        },
        24: {
            display() {
                return "<h1><b>+</b></h1>"
            },
            canClick() {
                return new Decimal(player[this.layer].formB).lt(tmp.III.maxFormulaValue)
            },
            onClick(){
                player[this.layer].formB = new Decimal(new Decimal(player[this.layer].formB).add(1)).min(new Decimal(tmp.III.maxFormulaValue))
            },
            style: {
                "width": "50px",
                "height": "5px"
            }
        },
        25: {
            display() {
                return "<h1><b>MAX</b></h1>"
            },
            canClick() {
                return new Decimal(player[this.layer].formB).lt(tmp.III.maxFormulaValue)
            },
            onClick(){
                player[this.layer].formB = new Decimal(tmp.III.maxFormulaValue)
            },
            style: {
                "width": "50px",
                "height": "5px"
            }
        },
        31: {
            display() {
                return "<h1><b>1</b></h1>"
            },
            canClick() {
                return new Decimal(player[this.layer].formC).gt(1)
            },
            onClick(){
                player[this.layer].formC = new Decimal (1)
            },
            style: {
                "width": "50px",
                "height": "5px"
            }
        },
        32: {
            display() {
                return "<h1><b>HALF</b></h1>"
            },
            canClick() {
                return new Decimal(player[this.layer].formC).gt(1)
            },
            onClick(){
                player[this.layer].formC = new Decimal.ceil(new Decimal(player[this.layer].formC).div(2))
            },
            style: {
                "width": "70px",
                "height": "5px"
            }
        },
        33: {
            display() {
                return "<h1><b>-</b></h1>"
            },
            canClick() {
                return new Decimal(player[this.layer].formC).gt(0)
            },
            onClick(){
                    player[this.layer].formC = new Decimal(player[this.layer].formC).sub(1)
            },
            style: {
                "width": "50px",
                "height": "5px"
            }
        },
        34: {
            display() {
                return "<h1><b>+</b></h1>"
            },
            canClick() {
                return new Decimal(player[this.layer].formC).lt(tmp.III.maxFormulaValue)
            },
            onClick(){
                player[this.layer].formC = new Decimal(new Decimal(player[this.layer].formC).add(1)).min(new Decimal(tmp.III.maxFormulaValue))
            },
            style: {
                "width": "50px",
                "height": "5px"
            }
        },
        35: {
            display() {
                return "<h1><b>MAX</b></h1>"
            },
            canClick() {
                return new Decimal(player[this.layer].formC).lt(tmp.III.maxFormulaValue)
            },
            onClick(){
                player[this.layer].formC = new Decimal(tmp.III.maxFormulaValue)
            },
            style: {
                "width": "50px",
                "height": "5px"
            }
        },
    },

    tabFormat: [
        "blank",
        ["infobox", "lore"],
        "main-display",
        "prestige-button",
        "blank",
        ["display-text",
            function() { return 'This part is brought to you by Algebraic Progression by randomtuba <br> f(t+1) = f(t) + (bc)^(a/5) <br> NOTE: a, b and c must ALL be 1 or above for f(t) to increment. <br>Current variable cap: ' + tmp.III.maxFormulaValue},
            { "color": "white", "font-size": "16px" }],
        "blank",
        ["row", [["clickable", 11], "blank", ["clickable", 12], "blank", ["clickable", 13], "blank", ["bar", "a"], "blank", ["clickable", 14], "blank", ["clickable", 15]]],
        "blank",
        ["row", [["clickable", 21], "blank", ["clickable", 22], "blank", ["clickable", 23], "blank", ["bar", "b"], "blank",["clickable", 24], "blank", ["clickable", 25]]],
        "blank",
        ["row", [["clickable", 31], "blank", ["clickable", 32], "blank", ["clickable", 33], "blank", ["bar", "c"], "blank", ["clickable", 34], "blank", ["clickable", 35]]],
        "blank",
        ["display-text",
            function() { return 'Your current f(t) = ' + format(player.III.formpts) + "<br>Base f(t) gain per sec: " + format(new Decimal.pow(new Decimal(player[this.layer].formB).times(player[this.layer].formC), new Decimal(player[this.layer].formA).div(new Decimal (5))))},
            { "color": "white", "font-size": "16px" }],
        "blank",
        ["display-text",
        function() { 
        if(inChallenge("III",12)) {
            return "The challenge's formula sums to " + format(new Decimal(player[this.layer].formA).sub(player[this.layer].formB).sub(player[this.layer].formC))
        }
        if(inChallenge("III",13)) {
            return "The challenge's formula sums to " + format(new Decimal(player[this.layer].formA).div(player[this.layer].formB).sub(player[this.layer].formC))
        }
        if(inChallenge("III",14)) {
            return "The challenge's formula sums to " + format(new Decimal.pow(player[this.layer].formB,2).sub(new Decimal(player[this.layer].formA).times(player[this.layer].formC).times(4)))
        }
        },
        { "color": "white", "font-size": "16px" }],
        "blank",
        "challenges",
        "blank",
        "milestones",
    ],
    layerShown(){return challengeCompletions("II",15) >= 5}
})
addLayer("IV", {
    name: "Tier 4", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "IV", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        posPoints: new Decimal(0),
        negPoints: new Decimal(0),
    }},
    color: "#FFC0CB",
    requires: new Decimal.pow(10,1000), // Can be a function that takes requirement increases into account
    resource: "tier 4 power", // Name of prestige currency
    baseResource: "tier 2 power", // Name of resource prestige is based on
    baseAmount() {return player.II.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: function() {
        if (inChallenge("IV",41)){
            return new Decimal (0.005)
        }
        if (hasChallenge("IV",42)){
            return new Decimal (0.15)
        }
        return new Decimal(0.1)}, // Prestige currency exponent

    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (challengeCompletions("IV","NEG") >= 1){
            mult = mult.times(tmp.IV.negBuff.plus(1))
        }
        if (challengeCompletions("IV","POS") >= 1){
            mult = mult.div(tmp.IV.posNerf.plus(1))
        } 
        if (challengeCompletions("IV",31) >= 1){
            mult = mult.times(tmp.IV.posBuff.plus(1))
        }
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    passiveGeneration() {
        if (hasMilestone("IV", 1)) {
            return new Decimal(1)
        } else {
            return new Decimal(0)
        }
    },
    update(diff) {
        let posGain = new Decimal (0)
        let negGain = new Decimal (0)
        if (challengeCompletions("IV", "POS") >= 1) {
            posGain = new Decimal.pow(3, challengeCompletions("IV", "POS"))
            if (inChallenge("IV", 31)) {
                posGain = posGain.div(posGain.log(5))
            }
        }
        if (challengeCompletions("IV", "NEG") >= 1) {
            negGain = new Decimal.pow(3, challengeCompletions("IV", "NEG"))
            if (inChallenge("IV", 32)) {
                negGain = negGain.div(negGain.log(5))
            }
        }
        if (hasChallenge("IV", 51)){
            player[this.layer].posPoints = posGain.times(diff).times((player[this.layer].posPoints.plus(10)).log10()).plus(player[this.layer].posPoints)
        } else {
            player[this.layer].posPoints = player[this.layer].posPoints.add(posGain.times(diff)).min(tmp.IV.buyables[11].effect);
        }
        if (hasChallenge("IV", 52)){
            player[this.layer].negPoints = negGain.times(diff).times((player[this.layer].negPoints.plus(10)).log10()).plus(player[this.layer].negPoints)
        } else {
            player[this.layer].negPoints = player[this.layer].negPoints.add(negGain.times(diff)).min(tmp.IV.buyables[11].effect);
        }
        const activeChallenge = player[this.layer].activeChallenge;
        if (activeChallenge && canCompleteChallenge(this.layer, activeChallenge)) {
          startChallenge(this.layer, activeChallenge);
          if (!maxedChallenge(this.layer, activeChallenge)) {
            startChallenge(this.layer, activeChallenge);
          }
        }
      },
    posBuff() {
        let buff = new Decimal(player[this.layer].posPoints)
        if (hasChallenge("IV",11)){
            buff = buff.times(new Decimal.pow(10,30))
        }
        if (hasChallenge("IV",21)){
            buff = buff.times(new Decimal.pow(10,50))
        }
        if (inChallenge("IV",51)){
            buff = new Decimal (0)
        }
        return buff
    },
    negBuff() {
        let buff = new Decimal(player[this.layer].negPoints)
        if (hasChallenge("IV",11)){
            buff = buff.times(new Decimal.pow(10,30))
        }
        if (hasChallenge("IV",22)){
            buff = buff.times(new Decimal.pow(10,50))
        }
        if (inChallenge("IV",51)){
            buff = new Decimal (0)
        }
        return buff
    },
    posNerf() {
        let nerf = new Decimal(player[this.layer].posPoints)
        if (hasChallenge("IV",12)){
            nerf = nerf.div(new Decimal.pow(10,30))
        }
        if (hasChallenge("IV",21)){
            nerf = nerf.div(new Decimal.pow(10,50))
        }
        nerf = (nerf.div(10)).pow(0.5)
        return nerf
    },
    negNerf() {
        let nerf = new Decimal(player[this.layer].negPoints)
        if (hasChallenge("IV",12)){
            nerf = nerf.div(new Decimal.pow(10,30))
        }
        if (hasChallenge("IV",22)){
            nerf = nerf.div(new Decimal.pow(10,50))
        }
        nerf = (nerf.div(10)).pow(0.5)
        return nerf
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    branches: ["II"],
    hotkeys: [
        {key: "4", description: "4: Reset for Tier 4 Power", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    infoboxes: {
        lore: {
            title: "Tier 4 Lore",
            body: `Form:<q>It's fun being able to do this with you. Come back here if you wanna make the solution of your formula much bigger!</q><br>
            ...<br>
            You:<q>Why are we going back to the gym?</q><br>
            Chal:<qNot back to the gym, exactly... we are taking a detour to a merchant's!</q><br>
            You:<q>A merchant's? Are we finally able to buy upgrades?</q><br>
            Chal:<q>On the contrary, the stuff this merchant sells won't help you much with incrementing your Challenge Power. She owns a balance though, so she has a few challenges based on balancing and dilemma!</q><br>
            ...<br>
            <img src="SceneIV.png" width="500"><br>
            Horn:<q>Hello, both of you. What brings you to this shop of mine?</q><br>
            Chal:<q>I heard you have some challenges, would you mind giving this feller next to mine some?</q><br>
            Horn:<q>Normally I would charge people 100 cookies for that, but you have bought a lot of my stuff before, so I can give them to you free of charge.</q><br>
            Chal:<q>Amazing! Let's do this!</q><br>
            Horn:<q>Just don't disturb my business, OK?</q>`,
        },
    },
    buyables: {
        showRespec: true,
        respec() {
            for (const id of [11, 12, 21, 22, 31, 32, 41, 42, 51, 52]) {
              player.IV.challenges[id] = 0;
            }
            setBuyableAmount(this.layer, 11, new Decimal(0));
          },
        respecText: "Respec Limit Break",
        respecMessage: "Unlike other Prestige Tree Mods that does a layer reset, Respeccing Limit Break only resets Dilemma Challenge Completions besides of buyable amount. If you felt stuck with your current challenges' rewards, respec away!",
        11: {
            title: "Limit Break",
            display() { return "Multiple the caps of positive points and negative points by 100 and unlocks " + new Decimal(Math.floor(getBuyableAmount(this.layer, this.id)/3)).min(5) + " challenges (unlocks every 3 purchases, this effect caps at 5). <br>Both of them needs to reach their cap to use this buyable. <br>Current: " + getBuyableAmount(this.layer, this.id) },
            canAfford() { return (player[this.layer].posPoints.gte(tmp.IV.buyables[11].effect)) && (player[this.layer].negPoints.gte(tmp.IV.buyables[11].effect)) },
            effect() { let metCap = new Decimal(100)
            metCap = metCap.times(new Decimal.pow(100, new Decimal(getBuyableAmount(this.layer, this.id)).add(1)))
            return metCap 
            },
            buy() {
                player[this.layer].posPoints = new Decimal(0)
                player[this.layer].negPoints = new Decimal(0)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
    bars: {
        "POS": {
            direction: UP,
            width: 50,
            height: 300,
            progress() {
                return new Decimal(player[this.layer].posPoints).div(tmp.IV.buyables[11].effect)
            },
            display() {
                return  format(new Decimal(player[this.layer].posPoints).div(tmp.IV.buyables[11].effect).times(100)) + "%" ;
            },
            baseStyle: {
                "background-color": "#777777"
            },
            fillStyle: {
                "background-color": "#FFFF00"
            },
            textStyle: {
                "color": "#000000"
            }
        },
        "NEG": {
            direction: UP,
            width: 50,
            height: 300,
            progress() {
                return new Decimal(player[this.layer].negPoints).div(tmp.IV.buyables[11].effect)
            },
            display() {
                return format(new Decimal(player[this.layer].negPoints).div(tmp.IV.buyables[11].effect).times(100)) + "%" ;
            },
            baseStyle: {
                "background-color": "#777777"
            },
            fillStyle: {
                "background-color": "#00FFFF"
            },
            textStyle: {
                "color": "#000000"
            }
        },
    },
    challenges: {
        "POS": {
            name: "Positive",
            completionLimit: 100,
            challengeDescription: function() {return "Complete this challenge to start gaining Positive Points. <br>"+challengeCompletions(this.layer, this.id)
            + "/" + this.completionLimit + " completions"},
            canComplete: function() {return player[this.layer].points.gte(new Decimal.pow(10000, challengeCompletions("IV", "POS") + 1)) },//always does 1 at a time, check if points > req},
            goalDescription: function() {return format(new Decimal.pow(10000, challengeCompletions("IV", "POS") + 1))+" Tier 4 Power"},
            rewardDescription: function() {return format(new Decimal.pow(3, challengeCompletions("IV", "POS"))) +" Positive Points per second."},
            unlocked() {return true}
        },
        "NEG": {
            name: "Negative",
            completionLimit: 100,
            challengeDescription: function() {return "Complete this challenge to start gaining Negative Points. <br>"+challengeCompletions(this.layer, this.id)
            + "/" + this.completionLimit + " completions"},
            canComplete: function() {return player[this.layer].points.gte(new Decimal.pow(10000, challengeCompletions("IV", "NEG") + 1)) },//always does 1 at a time, check if points > req},
            goalDescription: function() {return format(new Decimal.pow(10000, challengeCompletions("IV", "NEG") + 1))+" Tier 4 Power"},
            rewardDescription: function() {return format(new Decimal.pow(3, challengeCompletions("IV", "NEG"))) +" Negative Points per second."},
            unlocked() {return true}
        },
        11:{
            name: "Buff Boost",
            challengeDescription: "You can't gain f(t). ",
            canComplete: function() {return player.II.points.gte(new Decimal.pow(10, 230)) },//always does 1 at a time, check if points > req},
            goalDescription: function() {return "1e230 Tier 2 Power"},
            rewardDescription: function() {return "Both Buffs are boosted by 1e30x."},
            onEnter(){ 
                player.IV.points = new Decimal (0)
                player.III.formpts = new Decimal (0)
            },            
            unlocked() {return (new Decimal(getBuyableAmount(this.layer, 11)).gte(3)) && !hasChallenge(this.layer,12)}
        },
        12:{
            name: "Nerf Decrease",
            challengeDescription: "Tier 4 Power gain is divided by 1e20.",
            canComplete: function() {return player[this.layer].points.gte(new Decimal.pow(10, 60)) },//always does 1 at a time, check if points > req},
            goalDescription: function() {return format(new Decimal.pow(10, 60))+" Tier 4 Power"},
            rewardDescription: function() {return "Both nerfs are divided by 1e30x."},
            onEnter(){ 
                player.IV.points = new Decimal (0)
            },     
            unlocked() {return (new Decimal(getBuyableAmount(this.layer, 11)).gte(3))&& !hasChallenge(this.layer,11)}
        },
        21:{
            name: "Starlight",
            challengeDescription: "All rewards of Tier 1 challenges (except You Gotta Start Somewhere for obvious reasons) are disabled. ",
            canComplete: function() {return player[this.layer].points.gte(new Decimal.pow(10, 60)) },//always does 1 at a time, check if points > req},
            goalDescription: function() {return format(new Decimal.pow(10, 60))+" Tier 4 Power"},
            rewardDescription: function() {return "Boost Positive buff and weaken its nerf, both by 1e50x."},
            onEnter(){ 
                player.IV.points = new Decimal (0)
            },     
            unlocked() {return (new Decimal(getBuyableAmount(this.layer, 11)).gte(6)) && !hasChallenge(this.layer,22)}
        },
        22:{
            name: "Black Hole",
            challengeDescription: "All rewards of Tier 2 challenges are disabled.",
            canComplete: function() {return player[this.layer].points.gte(new Decimal.pow(10, 60)) },//always does 1 at a time, check if points > req},
            goalDescription: function() {return format(new Decimal.pow(10, 60))+" Tier 4 Power"},
            rewardDescription: function() {return "Boost Negative buff and weaken its nerf, both by 1e50x."},
            onEnter(){ 
                player.IV.points = new Decimal (0)
            }, 
            unlocked() {return (new Decimal(getBuyableAmount(this.layer, 11)).gte(6))&& !hasChallenge(this.layer,21)}
        },
        31:{
            name: "Proton",
            challengeDescription: "Resets Positive and Negative points, and Positivity nerfs its own gain. ",
            canComplete: function() {return player[this.layer].posPoints.gte(new Decimal.pow(10, 20)) },//always does 1 at a time, check if points > req},
            goalDescription: function() {return format(new Decimal.pow(10, 20))+" Positive Points"},
            rewardDescription: function() {return "Positive points also boost tier 4 power gain (unnerfed)."},
            onEnter(){ 
                player.IV.posPoints = new Decimal (0)
            },     
            unlocked() {return (new Decimal(getBuyableAmount(this.layer, 11)).gte(9)) && !hasChallenge(this.layer,32)}
        },
        32:{
            name: "Electron",
            challengeDescription: "Resets Positive and Negative points, and Negativity nerfs its own gain. ",
            canComplete: function() {return player[this.layer].negPoints.gte(new Decimal.pow(10, 20)) },//always does 1 at a time, check if points > req},
            goalDescription: function() {return format(new Decimal.pow(10, 20))+" Negative Points"},
            rewardDescription: function() {return "Negative points also boost f(t) gain (unnerfed)."},
            onEnter(){ 
                player.IV.negPoints = new Decimal (0)
            }, 
            unlocked() {return (new Decimal(getBuyableAmount(this.layer, 11)).gte(9))&& !hasChallenge(this.layer,31)}
        },
        41:{
            name: "Math Addict",
            challengeDescription: "Cost Scaling of Tier 4 Power is more harsh.",
            canComplete: function() {return player[this.layer].points.gte(new Decimal.pow(10, 57)) },//always does 1 at a time, check if points > req},
            goalDescription: function() {return format(new Decimal.pow(10, 57))+" tier 4 power"},
            rewardDescription: function() {return "f(t) gain is boosted by 1e500x."},
            onEnter(){ 
                player.IV.points = new Decimal (0)
            },     
            unlocked() {return (new Decimal(getBuyableAmount(this.layer, 11)).gte(12)) && !hasChallenge(this.layer,42)}
        },
        42:{
            name: "Strength Hunter",
            challengeDescription: "Resets all variables of the formula in Tier 3, and the cap of a, b and c in Tier 3 are always 5.",
            canComplete: function() {return player.II.points.gte(new Decimal.pow(10, 400)) },//always does 1 at a time, check if points > req},
            goalDescription: function() {return format(new Decimal.pow(10, 400))+" tier 2 power"},
            rewardDescription: function() {return "Cost Scaling of Tier 4 Power is much more lenient."},
            onEnter(){ 
                player.III.formpts = new Decimal (0)
                player.III.formA = new Decimal (0)
                player.III.formB = new Decimal (0)
                player.III.formC = new Decimal (0)
            }, 
            unlocked() {return (new Decimal(getBuyableAmount(this.layer, 11)).gte(12))&& !hasChallenge(this.layer,41)}
        },
        51:{
            name: "Antidepressant",
            challengeDescription: "Positive Buff is disabled.",
            canComplete: function() {return player[this.layer].points.gte(new Decimal.pow(10, 110)) },//always does 1 at a time, check if points > req},
            goalDescription: function() {return format(new Decimal.pow(10, 110))+" tier 4 power"},
            rewardDescription: function() {return "Positive points can generate past the cap, and it boosts its own gain."},
            onEnter(){ 
                player.IV.points = new Decimal (0)
            },     
            unlocked() {return (new Decimal(getBuyableAmount(this.layer, 11)).gte(15)) && !hasChallenge(this.layer,52)}
        },
        52:{
            name: "Hydraulic Press",
            challengeDescription: "Negativity Buff is disabled.",
            canComplete: function() {return player.II.points.gte(new Decimal.pow(10, 1870)) },//always does 1 at a time, check if points > req},
            goalDescription: function() {return format(new Decimal.pow(10, 1870))+" tier 2 power"},
            rewardDescription: function() {return "Negative points can generate past the cap, and it boosts its own gain."},
            onEnter(){ 
                player.III.formpts = new Decimal (0)
            }, 
            unlocked() {return (new Decimal(getBuyableAmount(this.layer, 11)).gte(15))&& !hasChallenge(this.layer,51)}
        },
    },
    milestones: {
        1: {
            requirementDescription: "Unlock this layer",
            effectDescription: "Gain all of your pending tier 4 power per second.",
            done() { return player.IV.points.gte(1) }
        },
    },
    tabFormat: [
        "blank",
        ["infobox", "lore"],
        "main-display",
        "prestige-button",
        "blank",
        ["row", [["bar","POS"], ["challenge", "POS"], ["challenge", "NEG"],  ["bar","NEG"]]],
        "blank",
        ["display-text",
            function() { return 'You have ' + format(player.IV.posPoints) + "/" + format(tmp.IV.buyables[11].effect) + " Positive Points, which boosts f(t) gain by " + format(tmp.IV.posBuff) + " but nerfs Tier 4 power gain by " + format(tmp.IV.posNerf, true) + "."},
            { "color": "white", "font-size": "16px" }],
        "blank",
        ["display-text",
        function() { return 'You have ' + format(player.IV.negPoints) + "/" + format(tmp.IV.buyables[11].effect) + " Negative Points, which boosts Tier 4 power gain by " + format(tmp.IV.negBuff) + "  but nerfs f(t) gain by " + format(tmp.IV.negNerf, true) + "."},
        { "color": "white", "font-size": "16px" }],
        "blank",
        "buyables",
        "blank",
        ["row", [["challenge", 11], ["challenge", 12]]],
        "blank",
        ["row", [["challenge", 21], ["challenge", 22]]],
        "blank",
        ["row", [["challenge", 31], ["challenge", 32]]],
        "blank",
        ["row", [["challenge", 41], ["challenge", 42]]],
        "blank",
        ["row", [["challenge", 51], ["challenge", 52]]],
        "blank",        
        "milestones",
    ],
    layerShown(){return challengeCompletions("III",14) >= 10}
})