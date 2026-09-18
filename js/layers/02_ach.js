addLayer("A", {
    tabFormat: [
        "blank", 
        ["display-text", function() { return "<h2>Achievements: "+player.A.achievements.length+"/"+(Object.keys(tmp.A.achievements).length-2) + "</h2><br> damn, this is full of spoilers, not anymore..." }], 
        "blank", "blank",
        "achievements",
    ],
    startData() { return {
        unlocked: true,
    }},
    color: "#FFE4B5",
    row: "side",
    nodeStyle() {
        var style = {}
        if (options.nodeStyle) style["border-radius"] = "15px 15px 15px 15px";
        return style
    },
    layerShown() {return true}, 
    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("Achievements")
    },
    achievements: {
        11: {
            name: "a",
            done() { return getBuyableAmount("f", 11).gte(1) },
            tooltip: "<b>The 'a' variable</b><br><br> Have 1 'a' variable amount.",
            style(){ 
                if (tmp["A"].achievements[21].unlocked) return {"border-radius": "15px 0px 0px 0px",'height': '64px', 'width': '64px'}
                else return {"border-radius": "15px 0px 0px 15px",'height': '64px', 'width': '64px'}
            },
        },
        12: {
            name: "b",
            done() { return getBuyableAmount("f", 21).gte(1) },
            tooltip: "<b>The 'b' variable</b><br><br> Have 1 'b' variable amount.",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
        },
        13: {
            name: "c",
            done() { return getBuyableAmount("f", 31).gte(1) },
            tooltip: "<b>The 'c' variable</b><br><br> Have 1 'c' variable amount.",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
        },
        14: {
            name: "d",
            done() { return getBuyableAmount("f", 41).gte(1) },
            tooltip: "<b>The 'd' variable</b><br><br> Have 1 'd' variable amount.",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
        },
        15: {
            name: "= 100",
            done() { return (buyableEffect("f",11).add(buyableEffect("f",21)).add(buyableEffect("f",31)).add(buyableEffect("f",41))).gte(100) },
            tooltip: "<b>a + b + c + d</b><br><br> The sum of your 'a, b, c, and d' variable is 100",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
        },
        16: {
            name: "= 666",
            done() { return (buyableEffect("f",11).add(buyableEffect("f",21)).add(buyableEffect("f",31)).add(buyableEffect("f",41))).gte(666) },
            tooltip: "<b>and again <br> a + b + c + d</b><br><br> The sum of your 'a, b, c, and d' variable is 666<br><br>Reward: Unlock Buy Max buttons for 'a, b, c, and d' variables",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px', "color": "#680CA6"}
            },
        },
        17: {
            name: "777.777e777",
            done() { return player["f"].points.gte(new Decimal(777.777).mul(new Decimal(10).pow(777))) },
            tooltip: "<b>seven hundred seventy seven point seven hundred seventy seven letter 'e' seven hundred seventy seven</b><br><br> Reach f(t)=777.777e777",
            style(){ 
                return {"font-size": "7px", "border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
        },
        18: {
            name: "---",
            done() { return false },
            tooltip: "<b>You will not get this until the very endgame, and yes, I will complete this remake</b><br><br> Reach Endgame",
            style(){ 
                if (tmp["A"].achievements[28].unlocked) return {"border-radius": "0px 15px 0px 0px",'height': '64px', 'width': '64px'}
                else return {"border-radius": "0px 15px 15px 0px",'height': '64px', 'width': '64px'}
            },
        },
        21: {
            name: "U",
            done() { return hasUpgrade("u",11) },
            tooltip: "<b>The 'U' variable</b><br><br> Buy the first 'U' Upgrade",
            style(){ 
                if (tmp["A"].achievements[31].unlocked) return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
                else return {"border-radius": "0px 0px 0px 15px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["f"].best.gte(10000) || hasAchievement("A",21)},
        },
        22: {
            name: "First row",
            done() { return hasUpgrade("u",11) && hasUpgrade("u",12) && hasUpgrade("u",13) && hasUpgrade("u",14) && hasUpgrade("u",15) },
            tooltip: "<b>5 each row</b><br><br> Buy the first row of 'U' Upgrades",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["f"].best.gte(10000) || hasAchievement("A",21)},
        },
        23: {
            name: "Another first row",
            done() { return hasUpgrade("u",21) },
            tooltip: "<b>Res-Upgrades</b><br><br> Unlock the first row of Res-Upgrades",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["f"].best.gte(10000) || hasAchievement("A",21)},
        },
        24: {
            name: "Second row",
            done() { return hasUpgrade("u",21) && hasUpgrade("u",22) && hasUpgrade("u",23) && hasUpgrade("u",24) && hasUpgrade("u",25) },
            tooltip: "<b>A total of 10</b><br><br> Buy the second row of 'U' Upgrades",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["f"].best.gte(10000) || hasAchievement("A",21)},
        },
        25: {
            name: "Ten milli-U-n",
            done() { return player['u'].points.gte(10000000) },
            tooltip: "<b>yikes we gonna do this again</b><br><br> Have 10,000,000 'U' variable value <br><br> Reward: Unlock Buy Max buttons for Variable Upgrades in Research",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px', "color": "#680CA6"}
            },
            unlocked() {return player["f"].best.gte(10000) || hasAchievement("A",21)},
        },
        26: {
            name: "Third row",
            done() { return hasUpgrade("u",31) && hasUpgrade("u",32) && hasUpgrade("u",33) && hasUpgrade("u",34) && hasUpgrade("u",35) },
            tooltip: "<b>Now 15</b><br><br> Buy the third row of 'U' Upgrades",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["f"].best.gte(10000) || hasAchievement("A",21)},
        },
        27: {
            name: "A (2) HUNDRED ???",
            done() { return player['u'].points.gte(new Decimal(10).pow(200)) },
            tooltip: "<b>sheesh</b><br><br> Have 1e200 'U' variable value",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["f"].best.gte(10000) || hasAchievement("A",21)},
        },
        28: {
            name: "a thousand",
            done() { return player['u'].points.gte(new Decimal(10).pow(1000)) },
            tooltip: "<b>a filler</b><br><br> get 1e1000 blah blah blah",
            style(){ 
                if (tmp["A"].achievements[38].unlocked) return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
                else return {"border-radius": "0px 0px 15px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["f"].best.gte(10000) || hasAchievement("A",21)},
        },
        31: {
            name: "Research",
            done() { return getBuyableAmount("res",11).gte(1) },
            tooltip: "<b>Gain Knowledge</b><br><br> Start gaining Knowledge",
            style(){ 
                if (tmp["A"].achievements[41].unlocked) return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
                else return {"border-radius": "0px 0px 0px 15px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasUpgrade("u",14) || hasAchievement("A",31)},
        },
        32: {
            name: "Uno",
            done() { return player["res"].points.gte(1) },
            tooltip: "<b>A whole number</b><br><br> Have 1 Knowledge",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasUpgrade("u",14) || hasAchievement("A",31)},
        },
        33: {
            name: "Smart",
            done() { return hasUpgrade("res",11) && hasUpgrade("res",12) && hasUpgrade("res",13) && hasUpgrade("res",14) && hasUpgrade("res",15) },
            tooltip: "<b>not smart enough</b><br><br> Buy the first row of Res-Upgrades",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasUpgrade("u",14) || hasAchievement("A",31)},
        },
        34: {
            name: "Uno base",
            done() { return buyableEffect("res",11).gte(1) },
            tooltip: "<b>OMG ONE OMG</b><br><br> Additive Research Upgrade base is 1<br><br>Reward: Unlock Buy Max buttons for Research Upgrades in Research",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px', "color": "#680CA6"}
            },
            unlocked() {return hasUpgrade("u",14) || hasAchievement("A",31)},
        },
        35: {
            name: "base-10",
            done() { return buyableEffect("res",11).gte(10) },
            tooltip: "<b>WOOWOWOW</b><br><br> Additive Research Upgrade base is 10<br><br>Reward: Unlock Buy All buttons for Res-Upgrades",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px', "color": "#680CA6"}
            },
            unlocked() {return hasUpgrade("u",14) || hasAchievement("A",31)},
        },
        36: {
            name: "A HUNDRED ???",
            done() { return buyableEffect("res",11).gte(100) },
            tooltip: "<b>buying this rn is a worthless</b><br><br> Additive Research Upgrade base is 100",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasUpgrade("u",14) || hasAchievement("A",31)},
        },
        37: {
            name: "TEN???",
            done() { return buyableEffect("res",11).gte(1e10) },
            tooltip: "<b>1e10</b><br><br> How is that possible, 1e10 base?...",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasUpgrade("u",14) || hasAchievement("A",31)},
        },
        38: {
            name: "---",
            done() { return false },
            tooltip: "<b>---</b><br><br> ---",
            style(){ 
                if (tmp["A"].achievements[48].unlocked) return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
                else return {"border-radius": "0px 0px 15px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasUpgrade("u",14) || hasAchievement("A",31)},
        },
        41: {
            name: "Time Machine",
            done() { return getBuyableAmount("tm",11).gte(1) },
            tooltip: "<b>Gain Time Fragments</b><br><br> Start gaining Time Fragments",
            style(){ 
                if (tmp["A"].achievements[51].unlocked) return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
                else return {"border-radius": "0px 0px 0px 15px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasUpgrade("res",15) || hasAchievement("A",41)},
        },
        42: {
            name: "Warp Warp Time",
            done() { return getBuyableAmount("tm",22).gte(1) },
            tooltip: "<b>Faster and more Time</b><br><br> Do 1 Warp Warp Time",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasUpgrade("res",15) || hasAchievement("A",41)},
        },
        43: {
            name: "The acronymn one",
            done() { return getBuyableAmount("tm",21).gte(1) },
            tooltip: "<b>More more more Time Fragments</b><br><br> Have 1 Time Fragment Generator Enhancer",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasUpgrade("res",15) || hasAchievement("A",41)},
        },
        44: {
            name: "2^20",
            done() { return getPointGen().gte(1048576) },
            tooltip: "<b>This is not the speed of potato</b><br><br> Gain 1,048,576 Time per second<br><br>Reward: Unlock Buy Max buttons for Light Machines in Time Machine",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px', "color": "#680CA6"}
            },
            unlocked() {return hasUpgrade("res",15) || hasAchievement("A",41)},
        },
        45: {
            name: "Free Senior",
            done() { return buyableEffect("fd", 11).add(buyableEffect("fd", 12)).gte(60) },
            tooltip: "<b>Oh God that sounds weird</b><br><br> Have atleast 60 free levels of T.F.G.E. and Warp Warp Time",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasUpgrade("res",15) || hasAchievement("A",41)},
        },
        46: {
            name: "big numbers",
            done() { return player["tm"].points.gte(new Decimal(2).pow(1024)) },
            tooltip: "<b>meh infinity is not a big deal rn...</b><br><br> Have 1.80e308 Time Fragments",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasUpgrade("res",15) || hasAchievement("A",41)},
        },
        47: {
            name: "---",
            done() { return false },
            tooltip: "<b>---</b><br><br> ---",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasUpgrade("res",15) || hasAchievement("A",41)},
        },
        48: {
            name: "---",
            done() { return false },
            tooltip: "<b>---</b><br><br> ---",
            style(){ 
                if (tmp["A"].achievements[58].unlocked) return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
                else return {"border-radius": "0px 0px 15px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasUpgrade("res",15) || hasAchievement("A",41)},
        },
        51: {
            name: "Prestige",
            done() { return player["p"].best.gte(1) },
            tooltip: "<b>Reset Layer 1</b><br><br> Do Prestige to gain atleast 1 PP<br><br>Reward: Unlock g(t) and start with f(t) = 3,600",
            style(){ 
                if (tmp["A"].achievements[61].unlocked) return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px', "color": "#680CA6"}
                else return {"border-radius": "0px 0px 0px 15px",'height': '64px', 'width': '64px', "color": "#680CA6"}
            },
            unlocked() {return player["f"].best.gte(1e18) || hasAchievement("A",51)},
        },
        52: {
            name: "w",
            done() { return getBuyableAmount("g", 11).gte(1) },
            tooltip: "<b>The 'w' variable</b><br><br> Have w ≥ 1",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["f"].best.gte(1e18) || hasAchievement("A",51)},
        },
        53: {
            name: "x",
            done() { return getBuyableAmount("g", 21).gte(1) },
            tooltip: "<b>wait where is...</b><br><br> Have x ≥ 1",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["f"].best.gte(1e18) || hasAchievement("A",51)},
        },
        54: {
            name: "y",
            done() { return getBuyableAmount("g", 31).gte(1) },
            tooltip: "<b>but why did we skip</b><br><br> Have y ≥ 1",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["f"].best.gte(1e18) || hasAchievement("A",51)},
        },
        55: {
            name: "z",
            done() { return getBuyableAmount("g", 41).gte(1) },
            tooltip: "<b>weird™</b><br><br> Have z ≥ 1<br><br>Reward: Unlock Buy Max buttons for 'w, x, y, and z' variables",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px', "color": "#680CA6"}
            },
            unlocked() {return player["f"].best.gte(1e18) || hasAchievement("A",51)},
        },
        56: {
            name: "inPPinite",
            done() { return player["p"].best.gte(new Decimal(2).pow(1024)) },
            tooltip: "<b>a lot of PP</b><br><br> have infinite PP, PP means Prestige Points not...<br><br>Reward: Unlock Buy Max button for Boost 'w, x, y, & z' Variable",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px', "color": "#680CA6"}
            },
            unlocked() {return player["f"].best.gte(1e18) || hasAchievement("A",51)},
        },
        57: {
            name: "---",
            done() { return false },
            tooltip: "<b>---</b><br><br> ---",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["f"].best.gte(1e18) || hasAchievement("A",51)},
        },
        58: {
            name: "---",
            done() { return false },
            tooltip: "<b>---</b><br><br> ---",
            style(){ 
                if (tmp["A"].achievements[68].unlocked) return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
                else return {"border-radius": "0px 0px 15px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["f"].best.gte(1e18) || hasAchievement("A",51)},
        },
        61: {
            name: "Dejavu",
            done() { return hasUpgrade("p",13) },
            tooltip: "<b>This already happened</b><br><br> Unlock 'pU' Upgrades",
            style(){ 
                if (tmp["A"].achievements[71].unlocked) return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
                else return {"border-radius": "0px 0px 0px 15px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasUpgrade("p",13) || hasAchievement("A",61)},
        },
        62: {
            name: "a bit tiring",
            done() { return (hasUpgrade("pu",11) && hasUpgrade("pu",12) && hasUpgrade("pu",13) && hasUpgrade("pu",14) && hasUpgrade("pu",15) && hasUpgrade("pu",21) && hasUpgrade("pu",22) && hasUpgrade("pu",23) && hasUpgrade("pu",24) && hasUpgrade("pu",25)) },
            tooltip: "<b>completed as of now</b><br><br> Buy the first two rows of 'pU' Upgrades<br><br> Reward: Unlock Buy All buttons for 'U' Upgrades",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px', "color": "#680CA6"}
            },
            unlocked() {return hasUpgrade("p",13) || hasAchievement("A",61)},
        },
        63: {
            name: "r u lost?",
            done() { return player["g"].points.gte(new Decimal(10).pow(1000)) },
            tooltip: "<b>yes</b><br><br> Have g(t)=1e1000",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasUpgrade("p",13) || hasAchievement("A",61)},
        },
        64: {
            name: "A (2) HUNDRED ??? <br> part 2",
            done() { return player['pu'].points.gte(new Decimal(10).pow(200)) },
            tooltip: "<b>sheesh part 2</b><br><br> Have 1e200 'pU' Variable value",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasUpgrade("p",13) || hasAchievement("A",61)},
        },
        65: {
            name: "---",
            done() { return false },
            tooltip: "<b>---</b><br><br> ---",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasUpgrade("p",13) || hasAchievement("A",61)},
        },
        66: {
            name: "---",
            done() { return false },
            tooltip: "<b>---</b><br><br> ---",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasUpgrade("p",13) || hasAchievement("A",61)},
        },
        67: {
            name: "---",
            done() { return false },
            tooltip: "<b>---</b><br><br> ---",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasUpgrade("p",13) || hasAchievement("A",61)},
        },
        68: {
            name: "---",
            done() { return false },
            tooltip: "<b>---</b><br><br> ---",
            style(){ 
                if (tmp["A"].achievements[78].unlocked) return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
                else return {"border-radius": "0px 0px 15px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasUpgrade("p",13) || hasAchievement("A",61)},
        },
        71: {
            name: "∞",
            done() { return player["f"].points.gte(new Decimal(2).pow(1024)) },
            tooltip: "<b>The infinity</b><br><br> Unlock the Infinity",
            style(){ 
                if (tmp["A"].achievements[81].unlocked) return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
                else return {"border-radius": "0px 0px 0px 15px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["f"].points.gte(new Decimal(2).pow(1024)) || hasAchievement("A",71)},
        },
        72: {
            name: "BROKEN",
            done() { return hasChallenge("inf",11) },
            tooltip: "<b>no longer infinity</b><br><br> Break the infinity",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["f"].points.gte(new Decimal(2).pow(1024)) || hasAchievement("A",71)},
        },
        73: {
            name: "anti-∞",
            done() { return hasChallenge("inf",32) },
            tooltip: "<b>no longer infinity again</b><br><br> Break the infinity again",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["f"].points.gte(new Decimal(2).pow(1024)) || hasAchievement("A",71)},
        },
        74: {
            name: "Bruh ∞ again",
            done() { return player.points.gte(new Decimal(2).pow(1024)) },
            tooltip: "<b>Probably the real infinity</b><br><br> Reach the real 'Infinity'",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["f"].points.gte(new Decimal(2).pow(1024)) || hasAchievement("A",71)},
        },
        75: {
            name: "From the top",
            done() { return player["inf"].points.gte(1) },
            tooltip: "<b>AGAIN?????</b><br><br> Have atleast 1 ∞<br><br> Reward: Keep 4-D Upgrade 1.3 and Pres-Upgrade 2.2",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px', "color": "#680CA6"}
            },
            unlocked() {return player["f"].points.gte(new Decimal(2).pow(1024)) || hasAchievement("A",71)},
        },
        76: {
            name: "---",
            done() { return false },
            tooltip: "<b>---</b><br><br> ---",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["f"].points.gte(new Decimal(2).pow(1024)) || hasAchievement("A",71)},
        },
        77: {
            name: "---",
            done() { return false },
            tooltip: "<b>---</b><br><br> ---",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["f"].points.gte(new Decimal(2).pow(1024)) || hasAchievement("A",71)},
        },
        78: {
            name: "---",
            done() { return false },
            tooltip: "<b>---</b><br><br> ---",
            style(){ 
                if (tmp["A"].achievements[88].unlocked) return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
                else return {"border-radius": "0px 0px 15px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["f"].points.gte(new Decimal(2).pow(1024)) || hasAchievement("A",71)},
        },
        81: {
            name: "4th Dimension",
            done() { return player["fd"].unlocked },
            tooltip: "<b>The next to 3rd Dimension</b><br><br> Unlock the 4th Dimension",
            style(){ 
                if (tmp["A"].achievements[91].unlocked) return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
                else return {"border-radius": "0px 0px 0px 15px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["fd"].unlocked || hasAchievement("A",81)},
        },
        82: {
            name: "Such a weak machine",
            done() { return getResetGain("fd").gte(new Decimal(2).pow(32)) },
            tooltip: "<b>Greatly reduced</b><br><br> Reach certain amout of production of Distortion where it cannot be handled by the machine, as easy as that...",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["fd"].unlocked || hasAchievement("A",81)},
        },
        83: {
            name: "---",
            done() { return false },
            tooltip: "<b>---</b><br><br> ---",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["fd"].unlocked || hasAchievement("A",81)},
        },
        84: {
            name: "---",
            done() { return false },
            tooltip: "<b>---</b><br><br> ---",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["fd"].unlocked || hasAchievement("A",81)},
        },
        85: {
            name: "---",
            done() { return false },
            tooltip: "<b>---</b><br><br> ---",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["fd"].unlocked || hasAchievement("A",81)},
        },
        86: {
            name: "---",
            done() { return false },
            tooltip: "<b>---</b><br><br> ---",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["fd"].unlocked || hasAchievement("A",81)},
        },
        87: {
            name: "---",
            done() { return false },
            tooltip: "<b>---</b><br><br> ---",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["fd"].unlocked || hasAchievement("A",81)},
        },
        88: {
            name: "---",
            done() { return false },
            tooltip: "<b>---</b><br><br> ---",
            style(){ 
                if (tmp["A"].achievements[98].unlocked) return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
                else return {"border-radius": "0px 0px 15px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return player["fd"].unlocked || hasAchievement("A",81)},
        },
        91: {
            name: "Study Tree",
            done() { return hasMilestone("inf",5) },
            tooltip: "<b>Get bombarded by pop-ups</b><br><br> Unlock the Study Tree",
            style(){ 
                return {"border-radius": "0px 0px 0px 15px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasMilestone("inf",5) || hasAchievement("A",91)},
        },
        92: {
            name: "The Boom",
            done() { return hasUpgrade("st",41) && hasUpgrade("st",42) && hasUpgrade("st",43) },
            tooltip: "<b>Inflation go brrrrrr</b><br><br> What is happening?!?!?!?!",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasMilestone("inf",5) || hasAchievement("A",91)},
        },
        93: {
            name: "---",
            done() { return false },
            tooltip: "<b>---</b><br><br> ---",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasMilestone("inf",5) || hasAchievement("A",91)},
        },
        94: {
            name: "---",
            done() { return false },
            tooltip: "<b>---</b><br><br> ---",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasMilestone("inf",5) || hasAchievement("A",91)},
        },
        95: {
            name: "---",
            done() { return false },
            tooltip: "<b>---</b><br><br> ---",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasMilestone("inf",5) || hasAchievement("A",91)},
        },
        96: {
            name: "---",
            done() { return false },
            tooltip: "<b>---</b><br><br> ---",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasMilestone("inf",5) || hasAchievement("A",91)},
        },
        97: {
            name: "---",
            done() { return false },
            tooltip: "<b>---</b><br><br> ---",
            style(){ 
                return {"border-radius": "0px 0px 0px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasMilestone("inf",5) || hasAchievement("A",91)},
        },
        98: {
            name: "---",
            done() { return false },
            tooltip: "<b>---</b><br><br> ---",
            style(){ 
                return {"border-radius": "0px 0px 15px 0px",'height': '64px', 'width': '64px'}
            },
            unlocked() {return hasMilestone("inf",5) || hasAchievement("A",91)},
        },
    }
})