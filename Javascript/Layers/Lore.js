addLayer("Loren", {
    startData() {return {
        unlocked: true,
        points: new Decimal(0)
    }},
    symbol: "<small style='color:darkred'>LORE</small>",
    color: "#340003",
    layerShown: true,
    type: "none",
    row: "side",
    tooltip: "Informations",
    tabFormat: [
        ["display-text", "<small>Coming Soon</small>"],
    ],
    microtabs: {
        index: {
            "Sorbet": {
                content: [["display-image", "Media/CharacterFiles/SorbetLore.png"]]
            }
        }
    },
    clickables: {
        11: {
            display: "<text style='color:white'>Lore entry image size (600 x 200)</text>",
            unlocked: true,
            canClick: true,
            onClick() {return 0},
            style() {return {"width":"600px", "height":"200px", "border-radius":"0"}}
        }
    }
})