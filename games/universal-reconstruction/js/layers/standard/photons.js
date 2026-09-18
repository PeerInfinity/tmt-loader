addLayer("photons", {
    name: "Photons",
    symbol: "P",
    row: 0,
    position: 0,

    layerShown() { return temp.photons.paused ? false : player.photons.unlocked },
    paused() { return player.universeTab !== "standard" },
    resource() { return player.photons.points.equals(1) ? "Photon" : "Photons" },
    color: "#ffff33",
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
