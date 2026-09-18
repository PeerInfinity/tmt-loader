addLayer("gravitons", {
    name: "Gravitons",
    symbol: "γ",
    row: 0,
    position: 0,

    layerShown() { return temp.gravitons.paused ? false : player.gravitons.unlocked },
    paused() { return player.universeTab !== "standard" },
    resource() { return player.gluons.points.equals(1) ? "Graviton" : "Gravitons" },
    color: "#c994e3",
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
