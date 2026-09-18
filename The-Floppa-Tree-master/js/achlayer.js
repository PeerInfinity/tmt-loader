addLayer("a", {
    name: "achievements",
    symbol: "A",
    position: 0, 
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    color: "yellow",
    row: "side",
    layerShown(){return true},
    tooltip: "Achievements",
    achievements: {
        11: {
            name: "1. Your first flop!",
            done(){return player.f.points.gte(1)},
            tooltip: "Get first flop..."
        },
        12: {
            name: "2. Infinity Boost",

done() {
  return hasUpgrade('f', 13)
},
            tooltip: "Buy 'effect flop' Upgrade"
        },
        13: {
            name: "3.  Flops for points, points for flops",
            done() {
  return hasUpgrade('f', 15)
},
            tooltip: "Buy 'point flop' Upgrade"
        },
        14: {
            name: "4. 10 billions flop points!",
            done(){return player.points.gte(1e10)},
            tooltip: "Get (not) first flop...",
	},
	        15: {
            name: "5. A new beginning",
            done(){return hasUpgrade('f', 25)},
            tooltip: "Unlock a new layer",
	},
	        16: {
            name: "6. First Win",
            done(){return hasChallenge('b', 11)},
            tooltip: "Complete 'First Fight' Challenge",
	},
	        17: {
            name: "7. Good dumplings it's a very very tasty",
            done(){return hasUpgrade('b', 13)},
            tooltip: "Buy 'Dumplings' Upgrade",
},
        18: {
            name: "8. 1/6.5 from Infinity",
            done(){return player.points.gte(1e40)},
            tooltip: "Get e40 floppa points",
        
	},
    }
})
