addLayer("sc", {
    startData() { return { unlocked: true } },
    color: "blue",
    symbol: "SC",
    row: "side",
    layerShown() { return hasUpgrade('lab', 194) },
    tooltip: "Softcaps",

    nodeStyle(){
        return {
            animation: 'aniforsc 2.5s infinite alternate',
            '-webkit-animation':'aniforsc 2.5s infinite alterbate'
        }
    },


    tabFormat:
        [
            ["display-text",
                function () { return "<h3 style='color: #c939db;'>Memory</h3><br>Softcap:" + format(tmp["mem"].softcap) + "<br>Gaining exponent:" + format(tmp["mem"].softcapPower) },
                {}],
            "blank",
            ["display-text",
                function () { return "<h3 style='color: #00bdf9;'>Research Point</h3><br>Softcap:" + format(layers.lab.pointsoftcap()) },
                {}],
            function () { if (player.lab.buyables[12].gte(100)) return "blank" },
            ["display-text",
                function () { if (player.lab.buyables[12].gte(100)) return "<h3>Fragment</h3> <h3 style='color: #00bdf9;'>Transformer</h3><br>Effect hardcap ends at ^1.1" + ((hasAchievement('a', 113)) ? "<br>Exceeding levels give weaker effect instead" : "") },
                {}],
            function () { if (player.lab.buyables[13].gte(200)) return "blank" },
            ["display-text",
                function () { if (player.lab.buyables[13].gte(200)) return "<h3 style='color: #c939db;'>Memory</h3> <h3 style='color: #00bdf9;'>Transformer</h3><br>Effect hardcap ends at ^+0.2" + ((hasAchievement('a', 113)) ? "<br>Exceeding levels give weaker effect instead" : "") },
                {}],
            function () { if (player.lab.buyables[21].gte(40000) || buyableEffect('lab', 21).gt(1500)) return "blank" },
            ["display-text",
                function () {
                    let des = "";
                    if (player.lab.buyables[21].gte(40000) || buyableEffect('lab', 21).gt(1500)) des += "<h3 style='color: #ededed;'>Light</h3> <h3 style='color: #00bdf9;'>Transformer</h3>";
                    if (player.lab.buyables[21].gte(40000)) des += "<br>Cost ^1.5 after transformed 40,000 times"
                    if (buyableEffect('lab', 21).gt(1500)) des += "<br>Effect softcap:1,500x<br>Softcap exponent:0.25"
                    return des;
                },
                {}],
            function () { if (player.lab.buyables[22].gte(40000) || buyableEffect('lab', 22).gt(1500)) return "blank" },
            ["display-text",
                function () {
                    let des = "";
                    if (player.lab.buyables[22].gte(40000) || buyableEffect('lab', 21).gt(1500)) des += "<h3 style='color: #383838;'>Dark</h3> <h3 style='color: #00bdf9;'>Transformer</h3>";
                    if (player.lab.buyables[22].gte(40000)) des += "<br>Cost ^1.5 after transformed 40,000 times"
                    if (buyableEffect('lab', 22).gt(1500)) des += "<br>Effect softcap:1,500x<br>Softcap exponent:0.25"
                    return des;
                },
                {}],
            "blank",
            ["display-text",
                function () {
                    if (buyableEffect('lab',31).lte(2e6)) return "";
                    let des = "<h3 style='color: #ffa0be;'>Doll</h3> <h3 style='color: #00bdf9;'>Transformer</h3><br>"
                    des +="Effect Softcap: 2e6x<br>";
                    des +="Exponent: 1/3"
                    return des;
                },
                {}],
            "blank",
            ["display-text",
                function () { return "<h3 style='color: #ddeee3;'>World Step Height</h3><br>Softcap:" + format(layers.world.WorldstepHeightsc()) + "<br>Exceeding exponent:" + format(layers.world.WorldstepHeightscexp()) },
                {}],
            "blank",
            ["display-text",
                function () { return "<h3 style='color: #eec109;'>Fixed</h3> <h3 style='color: #ddeee3;'>World Step effect</h3><br>Softcap:" + format(layers.world.fixedsoftcap()) + "<br>Exponent:" + format(layers.world.fixedsoftcapexp()) },
                {}],
            "blank",
            ["display-text",
                function () {
                    let des = "<h3 style='color: #e8272a;'>Restricted</h3> <h3 style='color: #ddeee3;'>World Step effect</h3><br>Softcap:" + format(layers.world.restrictsoftcap()) + "<br>Exponent:" + format(layers.world.restrictsoftcapexp())
                    if (!hasUpgrade('storylayer', 43)) des += ("<br>Hardcap ends at:" + format(layers.world.restricthardcap()))
                    else des += ("<br>Secondary softcap:" + format(layers.world.restricthardcap()) + "<br>Exceeding effect log10-ed two times, then times Secondary softcap.")
                    return des;
                },
                {}],
            "blank",
            ["display-text",
                function () {
                    return "";
                    //if (!(player['awaken'].current == 'zero'||player['awaken'].awakened.includes('zero'))) return "";
                    //if (tmp["zero"].challenges[11].effectAWtoRF.lte(1000)) return "";
                    let des = "<h3 style='color: #ffe6f6;'>Glowing Roses effect</h3><br>"
                    des +="Effect to Red & Forgotten Layer Softcap: 1000x<br>";
                    des +="Exponent: 1/3"
                    return des;
                },
                {}],
            "blank",
            ["display-text",
                function () {
                    //if (!(player['awaken'].current == 'axium'||player['awaken'].awakened.includes('axium'))) return "";
                    if (tmp["axium"].movetimes.lte(1e100)) return "";//没准可以改
                    let des = "<h3>Times You Can Move in </h3><h3 style='color: #716f5e;'>Maze</h3><br>"
                    des +="Softcap: 3e100 Times<br>";
                    des +="Exponent: 0.25"
                    return des;
                },
                {}],
            "blank",
            ["display-text",
                function () {
                    return "";
                    //if (layers.ins.insEffect().Bra().lte(5e20)) return "";
                    let des = "<h3 style='color: #009641;'>Brazil</h3> <h3 style='color: #45b5d3;'>Institution Site</h3><h3> Effect</h3><br>"
                    des +="Effect Softcap: 5e20x<br>";
                    des +="Exponent: 0.75"
                    return des;
                },
                {}],
        ],
})