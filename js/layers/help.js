let helpData = {
    skyrmion: {
        id: "skyrmion",
        title: "Skyrmions",
        text: `Skyrmions generate Pions and Spinors, which are then used to buy upgrades to Skyrmions, Pions, and Spinors. But be warned - for every upgrade you buy, upgrades for the other currency become that much more expensive`,
        unlocked() { return temp.skyrmion.layerShown }
    },
    fome: {
        id: "fome",
        title: "Foam",
        text: `Initially, you will only have Protoversal Foam available, which generates at a small rate based on your current Skyrmion count. After you've generated enough Foam, you may enlarge it, with each dimension multiplying that Foam's generation rate<br><br>Each time you enlarge your Foam, you will also gain a level of one of that Foam's boosts. The order in which you enlarge your Foam doesn't matter, only the number of times you have enlarged that Foam in total. The first enlargement will always give a level of the first boost, the second a level of the second boost, and so on until the fifth boost, after which the cycle will repeat.<br><br>Once you have attained enough of a given Foam, you may condense it, allowing you to generate Foam of the next tier up (Protoversal -> Infinitesimal -> Subspatial -> Subplanck -> Quantum). If you once again reach a large enough amount of that Foam, you may be able to re-form it, granting a small exponential boost to its production. However, re-forming is not a simple process, and requires additional re-formations of lower tier Foams to have been completed - Subspatial Foam<sup>2</sup> requires having re-formed Infinitesimal Foam to Infinitesimal Foam<sup>3</sup>, which itself requires having re-formed Protoversal Foam to Protoversal Foam<sup>4</sup>`,
        unlocked() { return temp.fome.layerShown }
    },
    acceleron: {
        id: "acceleron",
        title: "Acceleron",
        text: "Accelerons, being the particles that allow the progression of Time, will increase the tick rate for themselves and all lower layers - that is, Foam and Skyrmions. Eventually, though, just a small tick rate boost isn't enough, and so will begin the construction of Entropic Loops. Entropic Loops are time-based production sources, requiring the reversal of time and the consumption of your Accelerons in order to build. Once constructed, Entropic Loops will, most of the time, do nothing - but once their interval has past, they will grant their effect. The first Entropic Loop may be quick to complete, and appear correspondingly weak, but once enough Accelerons are built up, its effect will become quite powerful.<br><br>After completing the second Entropic Loop, you will unlock Entropic Enhancements. These upgrades are powerful but specialized, at first only allowing the purchase of one upgrade per row. Additionally, each purchased Entropic Enhancement requires increasingly more Entropy to buy, a static resource that is only gained via the completion of Entropic Loops. Completion of more Entropic Loops may also provide more Entropic Enhancements, although that may not always be the case. Don't worry though - if you pick the wrong Enhancements, or wish to switch which Enhancements are active, you may sell them all at the click of a button, regaining all your Entropy and resetting nothing.<br><br>With your third Entropic Loop, Time Cubes become unlocked, a resource that is only produced through the third Entropic Loop's interval. These strange artifacts don't do much on their own, but maybe they can be used to ugprade and enhance the various Acceleron features",
        unlocked() { return temp.acceleron.layerShown }
    },
    inflaton: {
        id: "inflaton",
        title: "Inflaton",
        text: "Inflatons are an aweful resource to behold - the things are supremely unstable, requiring nothing more than the mere presence of a second in order to start duplicating rapidly - an effect that only intensifies as more of the things appear. Worse yet, they increase the distances between <i>everything</i>, causing all your hard-earned resources to scatter into the great void, far beyond your reach. Fortunately, you find yourself able to hold onto a small area of newly-expanded space, onto which you may be able to design and attach some automated facilities.<br><br>Once you start investigating your Quantum Field, researches become available. Selecting an available research project will begin researching it, allowing you to generate research points until you have gained enough to complete the project. These researches are largely simple effects, but completing them may give insights into how to retain more and more of your resources, and how to stabilize enough space, to use this horrible inflation effect to progress your goals, and even give insights into more projects you might need to dive into.<br><br>Once you have managed to safely contain multiple Inflatons at once, as well as gained a firmer grip on your Foam, you may notice a suspicious effect - even though the Inflatons are not currently active, their mere presence seems to be causing fluctuations in your Foam, causing more to be produced where there was previously none. It seems the effect of each Inflaton is weak, but with enough gathered, the increased generation may prove to be quite valuable...",
        unlocked() { return temp.inflaton.layerShown }
    },
    entangled: {
        id: "entangled",
        title: "Entangled Strings",
        text: "These massive dimensional threads seem to encompass both everything and nothing at once. Maybe with some more work, you may figure out a way to use these to provide more substance to your fledgling spacetime",
        unlocked() { return temp.entangled.layerShown }
    }
}