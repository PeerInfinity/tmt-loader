addLayer("a",{
    name: "Achievements",
    symbol: "A",
    position: 2,
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    tooltip: "Achievements",
    color: "#FFFF00",
    resource: "Achievement Points",
    type: "none",
    row: "side",
    achievements: {
        rows: 5,
        cols: 6,
        11: {
            name: "Start",
            tooltip: "Start generating points with particles",
            done() {
                return hasUpgrade('p',11)
            },
        },
        12: {
            name: "Particle's power",
            tooltip: "Boost point generation further with particles",
            done() {
                return hasUpgrade('p',12)
            },
        },
        13: {
            name: "Interactions",
            tooltip: "Entangle particles into interactions",
            done() {
                return player.i.unlocked
            },
        },
        14: {
            name: "Isolated particles",
            tooltip: "Keep some points on reset for quick startup",
            done() {
                return hasMilestone('i',0)
            },
        },
    }
})
