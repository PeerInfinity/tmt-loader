
// A side layer with achievements, with no prestige
addLayer("a", {
    resource: "Achievements",
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0)
        }
    },
    color: "yellow",
    symbol: "🏆",
    symbol(){
        if (options.emojisEnabled == true) symbol = "🏆"
        else symbol = "A"
        return symbol
    },
    row: "side",
    position: "1",
    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("Achievements")
    },
    tabFormat: {
        "Achievements": {
            content: [
                ["display-text",
                    function () {
                        let txt = ""
                        txt = txt + `You have 
                        <h2><span style="color: Yellow; text-shadow: 0px 0px 20px #AD6F69; font-family: Lucida Console, Courier New, monospace">
                            ${(player.a.points)}/66</span></h2> Achievements`
                        return txt
                    }
                ],
                "blank",
                ["display-text",
                    'Achievements contain spoilers!',
                    { "color": "red", "font-size": "18px", }],
                "blank",
                "achievements",
            ],
        },
    },
    
    ifhasSomeAchievementsbutborisforgotthiscrap() {
        if (hasAchievement("a", 92) && player.a.points !== 66 && hasAchievement("a", 93)) player.a.points.add(2)
    },

    achievementPopups(){
        let popup = true
        if (options.AchievementPopup == true) popup = true;
        else popup = false
        return popup
    },
    achievements: {
        11: {
            name: "Summer is Over",
            done() { return player.r.points.gte(1) },
            tooltip: "1 Pen",
            goalTooltip: "Get 1 Pen", // Shows when achievement is not completed
            onComplete() { addPoints("a", 1) },
            style() {
                return {
                    "border-color": "#7CB9E8",
                    "border-width": "5px"
                }
            }
        },
}
})
