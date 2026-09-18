addLayer("gluons", {
    name: "Gluons",
    symbol: "G",
    row: 0,
    position: 0,

    layerShown() { return temp.gluons.paused ? false : player.gluons.unlocked },
    paused() { return player.universeTab !== "standard" },
    resource() { return player.gluons.points.equals(1) ? "Gluon" : "Gluons" },
    color: "#1fbffd",
    type: "none",

    startData() {
        return {
            unlocked: false,
            points: decimalZero,
            best: decimalZero
        }
    },

    tabFormat: [
        "main-display",
        "blank",
        "prestige-button",
        "blank",
    ]
})
