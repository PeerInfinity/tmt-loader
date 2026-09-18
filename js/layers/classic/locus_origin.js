addLayer("locus_origin", {
    name: "Locus of Origins",
    symbol: "O",
    row: 0,
    position: 0,

    layerShown() { return temp.locus_origin.paused ? false : player.locus_origin.unlocked },
    paused() { return player.universeTab !== "classic" },
    resource: "Alkahest",
    color: "#ffffff",
    type: "none",

    startData() {
        return {
            unlocked: false,
            points: decimalZero,
            best: decimalZero
        }
    },

    tabFormat: {
        "Origin": {
            content: [

            ]
        },
        "Water": {
            content: [
                
            ]
        },
        "Earth": {
            content: [
                
            ]
        },
        "Fire": {
            content: [
                
            ]
        },
        "Air": {
            content: [
                
            ]
        }
    }
})