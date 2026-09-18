addLayer("LArtifact", {
    startData() {return {
        unlocked() {return true},
        points: new Decimal(0),

        moneyPrinters: new Decimal(0),
        mpProd() {
            let base = new Decimal(0)
            return base
        },

        exoskeletons: new Decimal(0),
        exoProd() {
            let base = new Decimal(0)
            return base
        }
    }},
    update() {
    },
    symbol: "<small>ART</small>",
    color: "#772343",
    layerShown: true,
    type: "none",
    row: "side",
    resource: "Total Artifacts",
    tooltip: "Layer Artifacts",
    microtabs: {
        index: {
        }
    },
    componentStyles: {
        "microtabs"() {return {"border-color":"transparent"}}
    },
    tabFormat: [
        "main-display",
        ["display-text", "<small>Coming Soon</small>"],
        "blank",
        ["microtabs", "index"]
    ],
})