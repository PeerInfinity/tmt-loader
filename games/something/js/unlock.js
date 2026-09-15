addLayer("unlock", {
    name: "unlock", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "UNL", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        nextLayerProgress: new Decimal(0)
    }},
    color: "#8000FF",
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "Unlock Points", // Name of prestige currency
    baseResource: "Points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        //add
        //mul
        if (hasUpgrade("fundamental", 24)) mult = mult.mul(100)
        if (hasUpgrade("fundamental", 34)) mult = mult.mul(500)
        if (hasUpgrade("fundamental", 37)) mult = mult.mul(1e10)
        if (hasUpgrade("polygon", 12)) mult = mult.mul("1e40")
        if (hasUpgrade("multiplication", 73)) mult = mult.mul("1e100")
        if (hasChallenge("arithmetic", 23)) mult = mult.mul("e100000")
        //exp
        //other hypers
        return mult
    },
    doReset(resettingLayer) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[resettingLayer].row <= this.row) return;

        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
        let keptUpgrades = []

        let keptBuyables = []

        // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
        let keep = ["points", "upgrades"];

        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);

        // Stage 5, add back in the specific subfeatures you saved earlier in Stage 2
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        return exp
    },
    softcapPower() {return new Decimal(1)},
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "U", description: "SHIFT+U: Reset for Unlock Points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Fundamental layer",
            description: "Unlock the Fundamental layer: the beginning of JC97's Something Tree.",
            cost: new Decimal(1),
        },

        12: {
            title: "Primitive layer",
            description: "Unlock the Primitive layer: the first major reset layer.",
            cost: new Decimal("1e5"),
        },

        13: {
            title: "Arithmetic layer",
            description: "Unlock the Arithmetic layer: the second major reset layer.",
            cost: new Decimal("1e20"),
        },

        14: {
            title: "Dimension layer",
            description: "Unlock the Dimension layer: a sub-layer.",
            cost: new Decimal("1e50"),
        },

        15: {
            title: "Polygon layer",
            description: "Unlock the Polygon layer: the third major reset layer.",
            cost: new Decimal("1e400"),
        },

        16: {
            title: "Number Core layer",
            description: "Unlock the Number Core layer: a sub-layer related to the Primitive layer.",
            cost: new Decimal("1e925"),
        },

        17: {
            title: "Core Booster layer",
            description: "Unlock the Core Booster layer: another sub-layer related to the Primitive layer.",
            cost: new Decimal("1e1550"),
        },



        21: {
            title: "Planetary Fragment layer",
            description: "Unlock the Planetary Fragment layer: the fourth major reset layer.",
            cost: new Decimal("e6000000"),
            unlocked() {return player.unlock.points.gte("e6e6")}
        },

        22: {
            title: "Planetary Booster layer",
            description: "Unlock the Planetary Booster layer: a sub-layer related to the Planetary layer.",
            cost: new Decimal("e1275e4"),
            unlocked() {return hasUpgrade("unlock", 21)}
        },
    },
    branches: [
        ["fundamental", "#FFC800", 10], 
        ["primitive", "#00C8FF", 10], 
        ["arithmetic", "#FF0080", 10], 
        ["polygon", "#2050FF", 10],
        ["planetary", "#80E0FF", 10],
    
        ["dimension", "#A0FFA0", 10], 
        ["numbercore", "#00e0c0", 10], 
        ["corebooster", "#80e040", 10], 
    ],
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                ["display-text", "This bar is logarithmic base 10. Do not complain!"], "blank",
                ["bar", "nextAt"],
                "blank",
                "upgrades"
            ],
        },
        "Lore (Chapter 1)": {
            content: [
                ["display-text", function() {
                    return "<h1>Chapter 1: The Void</h1>"
                }],
                "blank",
                ["infobox", "d1"],
                ["infobox", "d2"],
                ["infobox", "d3"],
                ["infobox", "d4"],
                ["infobox", "d5"],
                ["infobox", "d6"],
            ],
        },
        "Lore (Chapter 2)": {
            content: [
                ["display-text", function() {
                    return "<h1>Chapter 2: The Discoveries</h1>"
                }],
                "blank",
                ["infobox", "d7"],
                ["infobox", "d8"],
                ["infobox", "d9"],
                ["infobox", "d10"],
                ["infobox", "d11"],
                ["infobox", "d12"],
                ["infobox", "d13"],
            ],
            unlocked() { return player.polygon.points.gte(1) || player.planetary.unlocked}
        },
        "Lore (Chapter 3)": {
            content: [
                ["display-text", function() {
                    return "<h1>Chapter 3: The Test</h1>"
                }],
                "blank",
                ["infobox", "d14"],
                ["infobox", "d15"],
            ],
            unlocked() { return player.planetary.points.gte(1) || getBuyableAmount("planetary", 11).gte(1)}
        },
    },
    bars: {
        nextAt: {
            direction: RIGHT,
            width: 400,
            height: 75,
            display() {
                let text = "Your next layer is at "
                if (!hasUpgrade("unlock", 11)) text += "1 Unlock Point, unlocking the Fundamental layer. <br> Progress: " + player.unlock.points.div(1).mul(100).toFixed(2) + "%"
                else if (!hasUpgrade("unlock", 12)) text += "100,000 Unlock Points, unlocking the Primitive layer. <br> Progress: " + player.unlock.points.add(1).log10().div("5").mul(100).toFixed(2) + "%"
                else if (!hasUpgrade("unlock", 13)) text += "1e20 Unlock Points, unlocking the Arithmetic layer. <br> Progress: " + player.unlock.points.add(1).log10().div("20").mul(100).toFixed(2) + "%"
                else if (!hasUpgrade("unlock", 14)) text += "1e50 Unlock Points, unlocking the Dimension sub-layer. <br> Progress: " + player.unlock.points.add(1).log10().div("50").mul(100).toFixed(2) + "%"
                else if (!hasUpgrade("unlock", 15)) text += "1e400 Unlock Points, unlocking the Polygon layer. <br> Progress: " + player.unlock.points.add(1).log10().div("400").mul(100).toFixed(2) + "%"
                else if (!hasUpgrade("unlock", 16)) text += "1e925 Unlock Points, unlocking the Number Core sub-layer. <br> Progress: " + player.unlock.points.add(1).log10().div("925").mul(100).toFixed(2) + "%"
                else if (!hasUpgrade("unlock", 17)) text += "1e1550 Unlock Points, unlocking the Core Booster sub-layer. <br> Progress: " + player.unlock.points.add(1).log10().div("1550").mul(100).toFixed(2) + "%"
                else if (!hasUpgrade("unlock", 21)) {
                    if (player.unlock.points.gte("e6e6")) text += "e6,000,000 Unlock Points, unlocking the Planetary Fragment layer. <br> Progress: " + player.unlock.points.add(1).log10().div("6e6").mul(100).toFixed(2) + "%"
                    else text += "e6,000,000 Unlock Points, unlocking the ??? layer. <br> Progress: " + player.unlock.points.add(1).log10().div("6e6").mul(100).toFixed(2) + "%"
                }
                else if (!hasUpgrade("unlock", 22)) {
                    if (player.unlock.points.gte("e1275e4")) text += "e12,750,000 Unlock Points, unlocking the Planetary Booster layer. <br> Progress: " + player.unlock.points.add(1).log10().div("6e6").mul(100).toFixed(2) + "%"
                    else text += "e12,750,000 Unlock Points, unlocking the ??? layer. <br> Progress: " + player.unlock.points.add(1).log10().div("1275e4").mul(100).toFixed(2) + "%"
                }
                else text = "You have unlocked all layers! Congratulations! (For now...)"
                return text
            },
            progress() {
                let prog = new Decimal(0)
                if (!hasUpgrade("unlock", 11)) prog = player.unlock.points.div(1)
                else if (!hasUpgrade("unlock", 12)) prog = player.unlock.points.add(1).log10().div("5")
                else if (!hasUpgrade("unlock", 13)) prog = player.unlock.points.add(1).log10().div("20")
                else if (!hasUpgrade("unlock", 14)) prog = player.unlock.points.add(1).log10().div("50")
                else if (!hasUpgrade("unlock", 15)) prog = player.unlock.points.add(1).log10().div("400")
                else if (!hasUpgrade("unlock", 16)) prog = player.unlock.points.add(1).log10().div("925")
                else if (!hasUpgrade("unlock", 17)) prog = player.unlock.points.add(1).log10().div("1550")  
                else if (!hasUpgrade("unlock", 21)) prog = player.unlock.points.add(1).log10().div("6e6") 
                else if (!hasUpgrade("unlock", 22)) prog = player.unlock.points.add(1).log10().div("1275e4") 
                else prog = new Decimal(1)

                player.unlock.nextLayerProgress = prog
                return prog
            },
            baseStyle() { return {"background-color": "#200050",} },
            fillStyle() { return {"background-color": "#6000E0",} },
        },
    },
    infoboxes: {
        d1: {
            title: "Document 1: The Beginning",
            body() { return "Well... this is awkward. Hello, player, I guess. You may not know who I am. " +
                "I'm Justcubing97, some random person stuck in The Void. I also made this game. " +
                "Welcome to JC97's Something Tree, or JST. My room isn't very interesting nor large, " +
                "about as spacious as a normal kitchen, albeit with all the human necessities crammed into this space. " +
                "It's getting late; I probably should rest. See you in the morning, player." },
        },
        d2: {
            title: "Document 2: The Morning",
            body() { return "It's been a great 8 hours since I've seen you. If you're reading this, you actually sort of play JST! " +
                "Because to read this message, you need to have \"The Second REAL Upgrade\" purchased. " +
                "Anyway, let me tell you more about The Void. It's basically a giant triangle plane, where the Centroid is at the... " +
                "well... centroid of the giant triangle. It's the command center of The Void. Hold on, " +
                "they're coming to let me out for morning activities. See you in a bit. Or 2,147,483,647 bits." },
            unlocked() {return hasUpgrade("fundamental", 12) || player.primitive.unlocked},
        },
        d3: {
            title: "Document 3: Normalcy",
            body() { return "Alright, I'm back from my morning activities. They're nothing special, it's just like... " +
                "getting ready for the day, taking a shower, eating breakfast, which is, by the way, kinda amazing. " +
                "Like, when does bacon and eggs taste THIS GOOD? Anyway, you must like playing JST, because to read this, " +
                "you need to have 1e14 Numbers. Not that I haven't made astronomically larger numbers, because of another thing " +
                "called JOS, or Justcubing97's Omeganization System. It's a number system that's intended to be super easy to understand. " +
                "Alright... I guess it's time to spend all my time in my room, reading some dumb AP textbooks in the super convenient " + 
                "bookshelf in the corner. See you in a bit. Or... [O]{10 & 100} bits. (Yes, that was from JOS.)"
            },
            unlocked() {return hasMilestone("primitive", 3) || player.arithmetic.unlocked}
        },
        d4: {
            title: "Document 4: AP World History",
            body() { return "Now I'm not a fan of AP World History. But, learn something instead of nothing, right? " +
                "Reading this requires having the Arithmetic layer unlocked. So if you're reading this, good job! " +
                "You did what most players couldn't do and reached the \"pink level\" in those annoying mobile game ads. " +
                "Moving onto AP World History for real this time, the Mongol Empire seemed pretty cool. But, " +
                "I kinda like the Ottoman Empire more. They utilized gunpowder weapons early on, and lasted for quite a while. " +
                "Sad they became the dead man of Europe later, but at that time, Japan and the Meiji Restoration made " +
                "Japan my new favorite empire. And then the United States appeared after WWII. I love science, and the US making " +
                "atomic bombs first is pretty darn cool. Okay, time to move onto AP Calculus. See ya."
            },
            unlocked() {return player.arithmetic.unlocked},
        },
        d5: {
            title: "Document 5: The Area Surrounding",
            body() { return "Decided to not document AP Calculus. I already know almost all of the material. " + 
                "Instead, I left my little dorm room which I described in Document 1 and started exploring. " +
                "As I've told you in Document 2, The Void is a giant triangle. Some say it's equilateral, some say it's isosceles, " +
                "but I want to find out for myself, as the Centroid would be... in an interesting place... and I have plans. " +
                "Outside, you can't really tell where you are besides the maps postered every so often on the walls, " +
                "and there are a few landmarks. 1, the Centroid, of course. 2, the Labryinth, and only THREE people have made it out. " +
                "3, the Reset Field, which has the ONLY OTHER COLOR IN THE VOID: green. And 4, the Transit. " +
                "It's the only place where you can enter and exit. Well, see ya. Have fun with Arithmetic Challenges."
            },
            unlocked() {return hasUpgrade("arithmetic", 17) || player.dimension.unlocked},
        },
        d6: {
            title: "Document 6: The Transit",
            body() { return "It's a long walk, but I managed to get to the Transit. There's always four guards stationed there, " +
                "and there are four groups of four guards in four different 6-hour shifts. WHY DO THE NUMBERS NOT LINE UP??? " +
                "Apparently, you can only enter. That just makes things a centillion times harder, because how would you leave now? " +
                "I tried communicating with them, negotiating, bribing, even physical force, but nothing worked. " +
                "The only way, they said, to leave is to have Dark Matter in your possession. I don't even know how to get that? " +
                "I guess I'll try my luck in the Labryinth. And I'm bringing a flashlight. See you in a few hours. " +
                "Nice job getting 1e120 Numbers and reached the 3rd Dimension in JST. Proud of you."
            },
            unlocked() {return player.dimension.points.gte(3) || player.polygon.unlocked},
        },

        d7: {
            title: "Document 7: The Three-Hour+ Journey Inside the Labyrinth",
            body() { return "So, how do I traverse such a space? Easy. I get a marker, and I mark the walls, but ONLY ON THE RIGHT SIDE. " +
                "This is so I don't get lost like the dozens of others that had seemingly disappeared in here. I also have a flashlight, " +
                "which on second thought, doesn't make sense because everything is pitch black. The red marker shows up unexpectedly bright though. " +
                "<i><b>[Document 7 content transmission idle.]</b></i> Hold on. HOLD ON. Why is there a girl following me??? She's your average pretty girl, " +
                "although I'm not looking forward to any romance because I just want to get out of here. I learned her name is Ashley, though, " +
                "and I give her my nickname. If you don't remember, it's Justcubing97. I never tell people my real name. " +
                "Anyway, good job on unlocking the Polygon layer. It's been 3 hours and 8 minutes already, and she... hasn't ate breakfast. Darn, Ashley. "
            },
            unlocked() {return player.polygon.points.gte(1) || player.planetary.unlocked},
        },

        d8: {
            title: "Document 8: Her Secret Stash",
            body() { return "I got Ashley some food and we just... ate together in the Labyrinth. Good job on unlocking Division, by the way. " +
                "I almost feel bad for you, because I made Division a painful layer. Expect some rapid Point inflation, too. " +
                "She told me about some collection she has built in the furthest corner of the triangle. Apparently, the triangle is isosceles. " +
                "I actually measured the angles, and it's 36, 72, and 72 degrees. Going back to her collection, she has a portal gun. " +
                "Not a fake clickbait portal gun, but an actual Aperture Science-level portal gun. Now, me, being a Portal and Portal 2 player myself, " +
                "wanted to try out this portal gun. I also found a random working gaming computer, three monitors (they're all broken), " +
                "a random pair of scissors with obsidian blades, a working printer if you find a power source, a mini statue of Hatsune Miku, " +
                "a pizza box filled with pineapple slices, and a bunch of other weird stuff in Ashley's stash."
            },
            unlocked() {return player.division.unlocked || player.planetary.unlocked},
        },

        d9: {
            title: "Document 9: Not an Expectation",
            body() { return "Welcome to Number Cores. Or what I like to call, buyable mania. If you're in version 0.4.6, there's only a placeholder upgrade. " +
                "Anyway, I was playing around with Ashley's portal gun in the Labyrinth, navigating with ease using portal peeking. However... " +
                "when she tried to play around and create the classic \"endless fall,\" she <i>might have</i> suffered a fall with <i>only a bit of speed</i>. " +
                "(And by this... she got injured quite severely.) I had to take her to the Centroid, where underneath The Void (the triangle) is a hospital. " +
                "I had quite a time carrying Ashley all the way there, as the Labyrinth was some distance away from the Centroid. I kinda liked it. " +
                "She managed to get into a vacant treatment room, and now I'm sitting outside waiting for eternity. I also brought the Hatsune Miku statue from " +
                "her stash. Well, have fun in buyable mania while I wait for forever for Ashley to get healed."
            },
            unlocked() {return player.numbercore.unlocked || player.planetary.unlocked},
        },

        d10: {
            title: "Document 10: Bad Ending",
            body() { return "OH MY GOD NO NO NO NO- <i><b>[Document 10 content temporarily removed for Justcubing97's current state of distress. Will return to normal shortly. " +
                "Note: \"I love you (not romantically) for reaching the 4th Dimension. You also unlocked the Constructor... maybe that can help transfer Dark Matter?\" " +
                "Emotional levels have stabilized. Document 10 content will be readded.]</b></i> Whoa. Sorry about that... I just realized that Ashley's injury cannot be fully " +
                "restored. She has to live with an amputated arm. I can't do anything about it, but, like, she was basically the Companion Cube to me. (Yes, I am a Portal player.) " +
                "Not in a romantic way, just... you get the idea. Anyway... I got her out of the hospital, got the portal gun from inside the labyrinth (red marker), " +
                "and kept exploring. We did find a rope ladder in one of the dead ends, about 20 feet (6 meters) long. Now I could use it perfectly, but Ashley would have to get creative. " +
                "Or I would have to help her. I don't know. Anyway, keep improving your compass and straightedge in the Constructor, and get more Division. Long Division will get easier " +
                "to deal with. Have fun being a hyperdimensional being!"
            },
            unlocked() {return player.dimension.points.gte(4) || player.planetary.unlocked},
        },

        d11: {
            title: "Document 11: The Unusual Book",
            body() { return "I decided to take Ashley back to my little prison cell for the night. After all, I did have a bookshelf, and she enjoyed reading. " +
                "It was normal for half an hour! I found a few dystopian novels, which I enjoy, and read away with her. It all changed when she picked up a totally black book, " +
                "except with one word on the cover: \"GUIDE.\" It was very thin and small, not much larger than A5 paper. Inside? Weird diagrams and grids and bars and numbers and letters. " +
                "There was a purple dot at the very top, above a golden-yellow dot, three dots below it from blue to green, then below that four pink dots, below that a singular red-pink dot, " +
                "then a deep blue dot next to a light green one. There was an arrow pointing to the purple dot all the way at the top. " +
                "\"Dark Matter\" was written next to it... no idea what it means. And by the way, your fresh Core Boosters can help you! I bet they indirectly influence your Constructor."
            },
            unlocked() {return player.corebooster.points.gte(1) || player.planetary.unlocked},
        },

        d12: {
            title: "Document 12: What is Universal Essence?",
            body() { return "We found out that \"Dark Matter\" requires Portals and a ton a math. It doesn't mention anything about the Constructor or Core Boosters... I guess I was wrong. " +
                "Anyway, Portals require \"Universal Essence,\" which I have no idea how to get. Ashley looks equally perplexed. We decided to travel to the Centroid for lunch. " +
                "After getting the mini Miku statue I accidentally left in the hospital floor, I sat down in a very peculiar pentagon-based chair (I love pentagons). " +
                "Oh, right. In the Centroid is the expansive cafeteria, which looks no different than a prison cafeteria. The concrete walls are a break from the eternal black, though. " +
                "Ashley sat down with her friends that she made before I was mysteriously teleported here. I tried talking to people about Dark Matter and Universal Essence, " +
                "but everyone called me crazy. As I said, the Constructor doesn't really do anything. So go sacrifice it! We don't need it! [INFLATION IMMINENT]"
            },
            unlocked() {return hasUpgrade("arithmetic", 35) || player.planetary.unlocked},
        },

        d13: {
            title: "Document 13: Polygons & Flags",
            body() { return "After returning to my little prison cell thing with Ashley, who still had the \"GUIDE.\" with her. " +
                "All was well before an event was called at the Centroid, flagged as RED. <i>(The Void's event flagging system goes GREEN, YELLOW, ORANGE, RED, and BLACK. " +
                "GREEN means it's usually an achievement or milestone, YELLOW indicates a slight disadvantage or obstacle, " +
                "ORANGE events usually warn everyone about a potentially dangerous incident, RED suggests that a definitely threatening incident has appeared, " +
                "and BLACK... you probably don't want to be exposed in The Void. Last time that happened, some girl got mercilessly incinerated by a death beam.)</i> " +
                "Once everyone gathered in the auditorium, Ashley sitting next to me because she \"feels safe and comfy\" with me, the Void Masters (basically rulers) " +
                "presented the sudden surge of \"Sacrificed Polygons\" dispersed around The void, and there were a LOT of them from their photos. Triangles, Squares, Pentagons, Hexagons. " +
                "(Man, I really hope this isn't a side effect from sacrificing your Constructor...) And Ashley clung to my arm like a scared puppy with one arm. " +
                "Yeah, expect more rapid inflation. Anyway, if you touch one of these Sacrificed Polygons, it would become sentient and start flying toward you. " +
                "It's possible to outrun it, but none have so far. The victims suffered burns and scars, which are nothing too fatal. " +
                "After the whole presentation thing, Ashley suggested we just stay in the Centroid and not go anywhere because \"why should we risk injuries when we're safe here?\""
            },
            unlocked() {return maxedChallenge("polygon", 11) || player.planetary.unlocked},
        },

        d14: {
            title: "Document 14: Brief Nothingness",
            body() { return "We would stay in the Centroid cafeteria for who knows how long. A few other irrationally scared humans also remained here. " +
                "Ashley didn't move a lot, leaning into my side like she was my girlfriend (for the record, we are NOT dating... not yet at least). Also, really proud of you for " +
                "having a Planetary Fragment in JST. Those can be used on the 8 Planetary Generators. Anyway... after about an hour, we received an announcement " +
                "from the Void Masters, which TL;DR means it is now safe to venture outside as the Sacrificed Polygons have been contained in the \"Nullzone\". " +
                "My best guess is that the Nullzone is the real prison or containment center of The Void, where all the anomalies go. " +
                "Ashley and I decided to return to the Labyrinth to keep exploring it, and this time, I did NOT give the portal gun to her. " +
                "Anyway, as an avid Portal (and Portal 2) player and enjoyer, I used a technique called \"portal peeking\" to traverse the Labyrinth. " +
                "(Portal peeking: 1, set up portals. 2, enter one portal and shoot the portal you exit from elsewhere. 3, quickly move back through the exit portal " +
                "as the shot portal from 2 takes some time to land. 4, repeat.) <i>Side note: I did code it so that you lose all of your progress upon Planetary reset, " +
                "but the Planetary Generators will provide a massive jumpstart! (note: for AC6: 1.5e90 multi)"
            },
            unlocked() {return player.planetary.points.gte(1) || getBuyableAmount("planetary", 11).gte(1)},
        },

        d15: {
            title: "Document 15: Separation",
            body() { return "So, uhh... one of the Void Masters called me in for \"testing.\" He confirmed that it would be similar to Aperture Science-type testing. " +
                "However, instead of portals and the Companion Cube, I get Sokoban-style puzzles instead. It isn't the worst thing in the world " +
                "(in fact, I kinda love these types of grid-based pushing box puzzles), but it was 3-dimensional pushing box puzzles. " +
                "For context, I fell asleep in the cafeteria while Ashley curled into me like some yandere seeking warmth. It was only when she woke up " +
                "that she realized I had gone missing. What was it like in the \"Voidtesting?\" Pretty mundane. It is very Aperture-coded. " +
                "But the chambers, they get gradually more difficult... and... the <i>chambers... don't... end...</i> (internally: nice, you have planetary boosters. get 40 mercury generators for the next one.)"
            },
            unlocked() {return player.pbooster.unlocked}
        },
    },
    update(diff){
        player.fundamental.unlocked = hasUpgrade("unlock", 11)
        player.primitive.unlocked = hasUpgrade("unlock", 12)
        player.arithmetic.unlocked = hasUpgrade("unlock", 13)
        player.dimension.unlocked = hasUpgrade("unlock", 14)
        player.polygon.unlocked = hasUpgrade("unlock", 15)
        player.numbercore.unlocked = hasUpgrade("unlock", 16)
        player.corebooster.unlocked = hasUpgrade("unlock", 17)

        player.planetary.unlocked = hasUpgrade("unlock", 21)
        player.pbooster.unlocked = hasUpgrade("unlock", 22)
    },
    resetsNothing: true,
    tooltip() {return format(player.unlock.points) + " Unlock Points (" + format(player.unlock.nextLayerProgress.mul(100)) + "% to next reset layer)"},
});