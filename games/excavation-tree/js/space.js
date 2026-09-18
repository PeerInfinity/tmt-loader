addLayer("RO", {
    name: "Rocket", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "RO", // This appears on the layer's node. Default is the id with the first letter capitalized
    startData() { return {
        unlocked() { return hasUpgrade("mti", 12)},
        info: "?",
        mode: 0, // mode 0 is system view, 1 is planet view
        select: 0,
        r: 5,
        c: 5
    }},
    tooltip: "",
    layerShown() {return hasUpgrade("mti", 12)},
    color: "#7c5685",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "", // Name of prestige currency
    baseResource: "experience", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: "side", // Row the layer is in on the tree (0 is the first row)
    grid: {
        rows() { return player.RO.r }, // If these are dynamic make sure to have a max value as well!
        cols() { return player.RO.c },
        maxRows: 10,
        maxCols: 10,
        getStartData(id) {
            return 0
        },
        getUnlocked(id) { // Default
            return true
        },
        getCanClick(data, id) {
            return true
        },
        onClick(data, id) { 
        	switch(player.RO.mode) {
        	    case 0:
                    switch(id) {
                    	case 303:
                            player.RO.info = "The starting system."
                            break
                        default:
                            player.RO.info = "?"
                    }
                    break
                case 1:
                    switch(id) {
                    	case 404:
                            player.RO.info = "Not discovered yet."
                            break
                        case 306:
                            player.RO.info = "Name: Ori-612al. This is the planet where everything started. It's your main planet of operations."
                            break
                        case 402:
                            player.RO.info = "Name: Static-A. There's something weird about it being too static in motion..."
                            break
                        case 705:
                            player.RO.info = "Name: Chall-E26-E. No upgrades detected on this planet. What could it hold?"
                            break
                        default:
                            player.RO.info = "?"
                    }
                }
            player.RO.select = id
        },
        getDisplay(data, id) {
        	switch(player.RO.mode) {
        	    case 0:
                    switch(id) {
                    	case 303:
                            return "Main System"
                            break
                        default:
                            return "?"
                    }
                    break
                case 1:
                    switch(id) {
                    	case 404:
                            return "?"
                            break
                        default:
                            return ""
                    }
                }
        },
        getStyle(data, id) {  
        	switch(player.RO.mode) {
        	    case 0:
                    switch(id) {
                    	case 303:
                            return {"height": "40px", "width": "40px", "background": "yellow", "border-radius": "50%", "box-shadow": "0px 0px 10px yellow"}
                            break
                        default:
                            return {"height": "40px", "width": "40px", "background": "gray"}
                    }
                    break
                case 1:
                    switch(id) {
                    	case 404:
                            return {"height": "40px", "width": "40px", "background": "black", "border-radius": "50%", "color": "white"}
                            break
                        case 306:
                            return {"height": "40px", "width": "40px", "background": "url(resources/Ori-612al.png)", "border-radius": "50%"}
                            break
                        case 402:
                            return {"height": "40px", "width": "40px", "background": "url(resources/Static-A.png)", "border-radius": "50%"}
                            break
                        case 705:
                            return {"height": "40px", "width": "40px", "background": "url(resources/Chall-E26-E.png)", "border-radius": "50%"}
                            break
                        default:
                            return {"height": "40px", "width": "40px", "background": "gray"}
                    }
                    break
            }
        }
    },
    clickables: {
        11: {
            display() {return "Press to go to the celestial body you have just selected."},
            canClick()  {return true},
            onClick() {
            	switch(player.RO.mode) {
            	    case 0:
                        switch(player.RO.select) {
                        	case 303:
                                player.RO.mode = 1
                                player.RO.r = 7
                                player.RO.c = 7
                        }
                        break
                    case 1:
                        switch(player.RO.select) {
                        	case 402:
                                player.area = "statica"
                                player.formal = "Static-A"
                                break
                            case 705:
                                player.area = "challe26e"
                                player.formal = "Chall-E26-E"
                                break
                        	case 306:
                                player.area = "main"
                                player.formal = "Ori-612al"
                        }
                }
            }
        },
        12: {
            display() {return "Go back"},
            canClick()  {
                if (player.RO.mode==1) {
                	return true
                } else {
                	return false
                }
            },
            onClick() {
            	player.RO.mode = 0
                player.RO.r = 5
                player.RO.c = 5
            }
        }
    },
    tabFormat: [
        "main-display",
        "resource-display",
        "grid",
        ["display-text", function() { return "You are inside "+player.formal+"." }],
        ["display-text", function() { return "Click to go to that system/planet/star. Also displays information about it." }],
        ["display-text", function() { return player[this.layer].info }],
        "clickables"
    ]
})