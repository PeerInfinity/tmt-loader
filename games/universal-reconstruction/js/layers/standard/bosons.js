addLayer("bosons", {
    name: "Bosons",
    symbol: "W",
    row: 0,
    position: 0,

    layerShown() { return temp.bosons.paused ? false : player.bosons.unlocked },
    paused() { return player.universeTab !== "standard" },
    resource() { return player.bosons.points.equals(1) ? "Boson" : "Bosons" },
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
