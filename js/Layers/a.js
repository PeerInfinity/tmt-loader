
// A side layer with achievements, with no prestige
addLayer("a", {
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    color: "green",
    resource: "Achievements", 
    row: "side",
    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("Achievements")
    },
    achievementPopups: true,
    achievements: {
        11: {
            image: "images/a/discord.png",
            name: "Get me!",
            done() {return true}, // This one is a freebie
            goalTooltip: "How did this happen?", // Shows when achievement is not completed
            doneTooltip: "You did it!", // Showed when the achievement is completed
        },
        12: {
            name: "Impossible!",
            done() {return false},
            goalTooltip: "Mwahahaha!", // Shows when achievement is not completed
            doneTooltip: "HOW????", // Showed when the achievement is completed
            textStyle: {'color': '#04e050'},
        },
        13: {
            name: "B",
            done() {return player.b.points.gte(1)},
            goalTooltip: "Get a B point.",
            doneTooltip: "Reward: permanently double your " + BASEPOINTS + " gain.", // Showed when the achievement is completed
            onComplete() {console.log("BBBBBBBBBBBBBB!")}
        },
        14: {
            name: "C",
            done() {return player.c.points.gte(1)},
            goalTooltip: "Sailing the high Cs.",
            doneTooltip: "Reward: permanently double your " + BASEPOINTS + " gain.", // Showed when the achievement is completed
            onComplete() {console.log("Sailing the high Cs!")}
        },
        21: {
            name: "2B",
            done() {return player.b.points.gte(43)},
            goalTooltip: "2 be or not 2 be.",
            doneTooltip: "Reward: permanently multiply your " + BASEPOINTS + " gain by 10.", // Showed when the achievement is completed
            onComplete() {console.log("You've been hexed!")}
        },

    },
/*    midsection: ["grid", "blank"],
    grid: {
        maxRows: 3,
        rows: 2,
        cols: 2,
        getStartData(id) {
            return id
        },
        getUnlocked(id) { // Default
            return true
        },
        getCanClick(data, id) {
            return player.points.eq(10)
        },
        getStyle(data, id) {
            return {'background-color': '#'+ (data*1234%999999)}
        },
        onClick(data, id) { // Don't forget onHold
            player[this.layer].grid[id]++
        },
        getTitle(data, id) {
            return "Gridable #" + id
        },
        getDisplay(data, id) {
            return data
        },
    },*/
},
)