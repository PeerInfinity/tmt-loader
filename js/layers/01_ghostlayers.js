addLayer("ln03", {
    name: "ln03", 
    symbol: "", 
    position: 3,
    canclick(){return false},
    nodeStyle() { return {"margin": "15px",} },
    row: 0,
    color: "#000000",
    layerShown() {
        if (tmp["inf"].layerShown) return "ghost"
        else return false
    }
})

addLayer("ln04", {
    name: "ln04", 
    symbol: "", 
    position: 4,
    canclick(){return false},
    nodeStyle() { return {"margin": "15px",} },
    row: 0,
    color: "#000000",
    layerShown() {
        if (tmp["inf"].layerShown) return "ghost"
        else return false
    }
})

addLayer("ln13", {
    name: "ln13", 
    symbol: "", 
    position: 3,
    canclick(){return false},
    nodeStyle() { return {"margin": "15px",} },
    row: 1,
    color: "#000000",
    layerShown() {
        if (tmp["res"].layerShown) return "ghost"
        else return false
    }
})

addLayer("ln24", {
    name: "ln24", 
    symbol: "", 
    position: 4,
    canclick(){return false},
    nodeStyle() { return {"margin": "15px",} },
    row: 2,
    color: "#000000",
    layerShown() {
        if (tmp["g"].layerShown) return "ghost"
        else return false
    }
})

addLayer("ln25", {
    name: "ln25", 
    symbol: "", 
    position: 5,
    canclick(){return false},
    nodeStyle() { return {"margin": "15px",} },
    row: 2,
    color: "#000000",
    layerShown() {
        if (tmp["fd"].layerShown) return false
        else if (tmp["pu"].layerShown) return "ghost"
        else return false
    }
})