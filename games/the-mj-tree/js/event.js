addLayer("event", {
    name: "Events",
    symbol: "E",
    position: 0,
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    tooltip(){
      return "Events!"
    },
    color: "#4BDC13",
    requires: new Decimal(10),
    resource: "prestige points",
    baseResource: "points",
    baseAmount() {return player.points},
    type: "normal",
    exponent: 0.5,
    gainMult() {
        let mult = new Decimal(1)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    tabFormat: [
      ["display-text", function(){ return "A new update, coming soon." }],
    ],
    row: "side", // Only if "side" is valid in your framework
    layerShown(){return false}
})
