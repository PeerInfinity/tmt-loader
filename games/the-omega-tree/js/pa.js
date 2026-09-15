addLayer("pa", {
    name: "Point Amount",
    symbol: "Pa",
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
    }},

    color: "#FFFFFF",                       // The color for this layer, which affects many elements.
    resource: "Point Amount",            // The name of this layer's main prestige resource.
    row: "side",                                 // The row this layer is on (0 is the first row).
    tooltip(){return "Point Amount"},
    layerShown() { return true },          // Returns a bool for if this layer's node should be visible in the tree.
    tabFormat: [
        "main-display",
        ["microtabs", "stuff"],
        ["blank", "65px"],
    ],
    microtabs: {
        stuff: {
            "Point Amount": {
                unlocked() {return true},
                content: [
                    ["blank", "15px"],
                    ["display-text", function() {
                        return "You have <h2 style='color: #ffffff; text-shadow: 0 0 10px #ffffff'>" + format(player.points) + "</h2> Points."
                    }],
                    ["display-text", function() {
                        if (player.points.lte(8.1e9))
                        return "The number of Points is "+ format(player.points.div(2024)) + " times of current year (2024)"
                        else if (player.points.lte(1e20))
                        return "The number of Points is "+ format(player.points.div(8.1e9)) + " times of World Population (2024) amount."
                        else if (player.points.lte(1e180))
                        return "If you wrote 3 numbers a second, it would take you "+ format(player.points.log(10).div(3)) + " seconds to write down your Points amount.<br>"
                        else if (player.points.lte("1e10800"))
                        return "If you wrote 3 numbers a second, it would take you "+ format(player.points.log(10).div(180)) + " minutes to write down your Points amount."
                        else if (player.points.lte("1e259200"))
                        return "If you wrote 3 numbers a second, it would take you "+ format(player.points.log(10).div(10800)) + " hours to write down your Points amount."
                        else if (player.points.lte("1e94608000"))
                        return "If you wrote 3 numbers a second, it would take you "+ format(player.points.log(10).div(259200)) + " days to write down your Points amount."
                        else if (player.points.lte("e9.4608e10"))
                            return "If you wrote 3 numbers a second, it would take you "+ format(player.points.log(10).div(94608000)) + " years to write down your Points amount."
                            else 
                            return "If you wrote 3 numbers a second, it would take you "+ formatTimeLong(player.points.log(10).div(3)) + " to write down your Cleared Courses amount."
                        }],
                ]
            },
        },
    },
})