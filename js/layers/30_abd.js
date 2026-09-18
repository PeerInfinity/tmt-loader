addLayer("ab", {
    tabFormat: {
        "Abdicate": {
            content:[
                "main-display",
                ["display-text", function() { return "You Have <h2><b style='color:#BF40BF;'>" + format(player["p"].points) + "</b></h2> PP" },],
                "blank",
            ],
        },
    },
    componentStyles: {
        "prestige-button"() { return {"border-radius": "15px 15px 15px 15px"} }
    },
    name: "abdicate", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Ab", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    nodeStyle() {
        var style = {"margin": "15px", "background": "#808080", "background-origin": "border-box"}
        if (options.nodeStyle) style["border-radius"] = "15px 15px 15px 15px";
        return style 
    },
    color: "#808080",
    requires: new Decimal(10).pow(8000), // Can be a function that takes requirement increases into account
    resource: "Lives", // Name of prestige currency
    baseResource: "PP", // Name of resource prestige is based on
    baseAmount() {return player["p"].points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1, // Prestige currency exponent
    update(diff) {

    },
    getNextAt(canMax=true) {
        canMax = new Decimal(10).pow(8000)
        canMax = canMax.mul(new Decimal(10).pow(new Decimal(2000).mul(tmp.ab.getResetGain.div(tmp.ab.gainMult).pow(0.75))))
        return canMax
    },
    getResetGain() {
        gain = new Decimal(0)
        if (player["p"].points.gte(new Decimal(10).pow(8000))) {
            gain = gain.add((player["p"].points.log10().sub(8000).div(2000).pow(new Decimal(1).div(0.75))).add(1))
            gain = Decimal.floor(gain)
            gain = gain.mul(tmp.ab.gainMult)
            gain = Decimal.floor(gain)
            return gain
        }
        else return gain
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
    passiveGeneration() { 
        return false
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    displayRow: 3,
    layerShown(){return hasUpgrade("st",51)},
    branches: ["p"],
    clickables: {
    },
    buyables: {
    },
    upgrades: {
    },
    automate() {
        
    },
    doReset(resettingLayer) {
        let keep=[];
        if (layers[resettingLayer].row > this.row) {layerDataReset("ab", keep);
        }
    },
    onPrestige(gain) {
    },
})