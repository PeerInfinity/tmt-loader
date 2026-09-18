addLayer("ach", {
    name: "Achievements", 
    symbol: "🏆", 
    position: 99, // Didelis skaičius nustumia mygtuką į patį dešinį kraštą
    row: "side",  // "side" numeta mygtuką į viršutinę žaidimo juostą
    color: "#e6c229", 

    // 🌟 MAŽESNIS MYGTUKAS IR JO POZICIJA
    nodeStyle() {
        return {
            "width": "45px",          // Standartinis yra 80px, čia sumažintas
            "height": "45px",         // Padarytas žemesnis
            "font-size": "16px",      // Mažesnis tekstas/emodži viduje
            "margin-left": "auto",    // Prispaudžia prie dešinio krašto
            "border-radius": "8px",   // Kvadratas su švelniais kampais
        }
    },

    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},

    type: "none", 
    resource: "achievements",
    layerShown() { return true },

    // 🏆 Patys pasiekimai
    achievements: {
        11: {
            name: "First step",
            done() { 
                // Kadangi pasiekimų sluoksnis dabar vadinasi "ach", tikriname tikrąjį "a" sluoksnį
                return player.a && player.a.points.gte(1) 
            },
            tooltip: "Collect 1 A point",
            rewardDescription: "A taškų gavimas padidėja 2 kartus.",
        },
        12: {
            name: "First step",
            done() { 
                // Kadangi pasiekimų sluoksnis dabar vadinasi "ach", tikriname tikrąjį "a" sluoksnį
                return player.a && player.a.points.gte(10) 
            },
            tooltip: "Collect 10 A point",
            rewardDescription: "A taškų gavimas padidėja 2 kartus.",
        },
        13: {
            name: "First step",
            done() { 
                // Kadangi pasiekimų sluoksnis dabar vadinasi "ach", tikriname tikrąjį "a" sluoksnį
                return player.a && player.a.points.gte(100) 
            },
            tooltip: "Collect 100 A point",
            rewardDescription: "A taškų gavimas padidėja 2 kartus.",
        },
        21: {
            name: "Second step",
            done() { 
                return player.b && player.b.points.gte(1) 
            },
            tooltip: "Collect 1 B point",
            rewardDescription: "Atrakina naują paslaptį.",
        },
        22: {
            name: "Second step",
            done() { 
                return player.b && player.b.points.gte(10) 
            },
            tooltip: "Collect 10 B point",
            rewardDescription: "Atrakina naują paslaptį.",
        },
        23: {
            name: "Second step",
            done() { 
                return player.b && player.b.points.gte(100) 
            },
            tooltip: "Collect 100 B point",
            rewardDescription: "Atrakina naują paslaptį.",
        },
        31: {
            name: "Third step",
            done() { 
                return player.c && player.c.points.gte(1) 
            },
            tooltip: "Collect 1 C point",
            rewardDescription: "Atrakina naują paslaptį.",
        },
        32: {
            name: "Third step",
            done() { 
                return player.c && player.c.points.gte(10) 
            },
            tooltip: "Collect 10 C point",
            rewardDescription: "Atrakina naują paslaptį.",
        },
        33: {
            name: "Third step",
            done() { 
                return player.c && player.c.points.gte(100) 
            },
            tooltip: "Collect 100 C point",
            rewardDescription: "Atrakina naują paslaptį.",
        },
        41: {
            name: "Fourth step",
            done() { 
                return player.c && player.d.points.gte(1) 
            },
            tooltip: "Collect 1 D point",
            rewardDescription: "Atrakina naują paslaptį.",
        },
        42: {
            name: "Fourth step",
            done() { 
                return player.c && player.d.points.gte(10) 
            },
            tooltip: "Collect 10 D point",
            rewardDescription: "Atrakina naują paslaptį.",
        },
        43: {
            name: "Fourth step",
            done() { 
                return player.c && player.d.points.gte(100) 
            },
            tooltip: "Collect 100 D point",
            rewardDescription: "Atrakina naują paslaptį.",
        },
        /*51: {
            name: "Fifth step",
            done() { 
                return player.c && player.c.points.gte(1) 
            },
            tooltip: "Collect 1 C point",
            rewardDescription: "Atrakina naują paslaptį.",
        },*/
    },

    tabFormat: [
        "blank",
        "achievements", 
    ]
})