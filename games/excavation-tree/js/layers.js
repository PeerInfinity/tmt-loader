addLayer("S", {
    name: "Sticks", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
	points: new Decimal(0),
	st: new Decimal(0)
    }},
    nodeStyle: {
	"border-radius": "10% / 10%",
	"width": "50px",
	"height": "125px"
    },
    doReset(reset) {
	let keep = [];
	if ( hasMilestone("ST", 4) ) keep.push("upgrades")
	if (layers[reset].row > this.row) layerDataReset("S", keep)
    },
    passiveGeneration() {
	if ( hasUpgrade("T", 41) ) {
		return new Decimal(1)
	} else {
		if ( hasUpgrade("R", 14) ) {
			return new Decimal(0.1)
		} else {
		    if ( hasUpgrade("W", 24) ) {
			    return new Decimal(0.01)
		    } else {
				return new Decimal(0)
		    }
		}
	}
    },
    microtabs: {
        stuff: {
            "Tier 1": {
                content: [
                    ["column", [ ["row", [ ["upgrade", 11], ["upgrade", 12], ["upgrade", 13], ["upgrade", 14] ] ], ["row", [ ["upgrade", 21], ["upgrade", 22], ["upgrade", 23], ["upgrade", 24] ] ], ["row", [ ["upgrade", 31], ["upgrade", 32], ["upgrade", 33], ["upgrade", 34] ] ], ["row", [ ["upgrade", 41], ["upgrade", 42], ["upgrade", 43] ] ] ] ] // columns of rows.
                ],
            },
            "Tier 2": {
                content: [
                    ["column", [ ["row", [ ["upgrade", 51], ["upgrade", 52], ["upgrade", 53], ["upgrade", 54] ] ], ["row", [ ["upgrade", 61], ["upgrade", 62], ["upgrade", 63], ["upgrade", 64] ] ] ] ]
                ],
                unlocked() {return hasMilestone("F", 0) }
            },
        }
    },
    branches: ["W", "ST", "L"],
    color: "#a86e34",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "sticks", // Name of prestige currency
    baseResource: "experience", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
	if ( hasUpgrade("S", 21) ) mult = mult.times(upgradeEffect("S", 21))
	if ( hasUpgrade("S", 24) ) mult = mult.times(2)
	if ( hasUpgrade("S", 31) ) mult = mult.times(upgradeEffect("S", 31))
	if ( hasUpgrade("L", 11) ) mult = mult.times(upgradeEffect("L", 11))
	if ( hasMilestone("ST", 3) ) mult = mult.times( player.ST.points.plus(1.5).pow(hasUpgrade("ST", 14) ? 0.75:0.5) )
	if ( hasUpgrade("TI", 11) ) mult = mult.times(10)
	if ( hasUpgrade("TI", 13) ) mult = mult.times(2)
	mult = mult.times(getBuyableAmount("M", 14).times(0.1).plus(1))
	if ( hasUpgrade("S", 42) ) mult = mult.times(2)
	if ( hasUpgrade("R", 24) ) mult = mult.times(5)
	if ( hasUpgrade("S", 61) ) mult = mult.times(upgradeEffect("S", 61))
	if ( hasUpgrade("S", 64) ) mult = mult.times(5)
	if ( hasUpgrade("B", 22) ) mult = mult.times(2)
	if ( hasUpgrade("F", 11) ) mult = mult.times(10)
	if(hasMilestone("C", 0)) mult = mult.times(3)
	mult = mult.times(getBuyableAmount("C", 32).times(2).plus(1))
	if(hasMilestone("C", 1))mult=mult.times(10)
	if(hasMilestone("F", 4))mult=mult.times(10)
	if ( hasUpgrade("F", 12) ) mult = mult.times(100)
	if(hasUpgrade("B", 24))mult=mult.times(upgradeEffect("B", 24))
	if( player.L.status.eq(1) ) {
		mult = mult.times(0.5)
	}
	if( player.L.status.eq(2) ) {
		mult = mult.times(2)
	} // status goes first
	if ( inChallenge("B", 12) ) mult = mult.div(100) // divide comes first
	if ( inChallenge("B", 13) ) mult = mult.sqrt() // sqrt comes first
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {
            key: "s", // What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" for holding down ctrl.
            description: "s: reset your exp for sticks", // The description of the hotkey that is displayed in the game's How To Play tab
            onPress() { if (player.S.unlocked) if (canReset(this.layer)) doReset("S") },
        }
    ],
    stonestick() {
    	let mult = new Decimal(1)
        if( player.L.status.eq(1) ) {
		    mult = mult.times(0.5)
	    }
	    if( player.L.status.eq(2) ) {
		    mult = mult.times(2)
	    } // status goes first
	    return mult
    },
    buyables: {
    	11: {
        	cost: new Decimal(2500),
		title: "Merge",
        	display() { return "Convert 2500 sticks, 1000 wood into "+format(tmp.S.stonestick)+" stone sticks" },
        	canAfford() { return player.S.points.gte(new Decimal(2500)) && player.W.points.gte(new Decimal(1000)) && hasUpgrade("ST", 12) },
		unlocked() { return hasUpgrade("ST", 12) },
        	buy() {
			player.S.points = player.S.points.sub(2500)
            		player.W.points = player.W.points.sub(1000)
            		setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
	    		player.S.st = player.S.st.plus(tmp.S.stonestick)
        	}
	}
    },
    upgrades: {
	    11: {
		title: "Practice",
		description: "Gain 1 experience per second.",
		cost: new Decimal(0)
	    },
	    12: {
		title: "Crafting",
		description: "Sticks boost experience.",
		cost: new Decimal(1),
		effect() { 
			let gain = new Decimal(1)
			if( inChallenge("B", 11) ) gain = new Decimal(2)
			if ( hasUpgrade("S", 23) )
				return player.S.points.plus(2).pow(0.45).pow(1.1).div(gain)
			else
				return player.S.points.plus(2).pow(0.45).div(gain)
		},
		effectDisplay() { return format(upgradeEffect("S", 12))+"x" },
		unlocked() { return hasUpgrade("S", 11) },
		tooltip() {
			if ( hasUpgrade("S", 23) )
				return "((x+1)^0.45)^1.1"
			else
				return "(x+1)^0.45"
		}
	    },
            13: {
		title: "Trial and Error",
		description: "Experience boosts Experience.",
		cost: new Decimal(5),
		effect() { 
			let gain = new Decimal(1)
			if( inChallenge("B", 11) ) gain = new Decimal(2)
			if ( hasUpgrade("W", 22) )
				return player.points.plus(2).log10().pow(0.5).plus(1).pow(1.08).div(gain)
			else
				return player.points.plus(2).log10().pow(0.5).plus(1).div(gain)
		},
		effectDisplay() { return format(upgradeEffect("S", 13))+"x" },
		unlocked() { return hasUpgrade("S", 12) },
		tooltip() {
			if ( hasUpgrade("W", 22) )
				return "((log(x+2)^0.5)+1)^1.08"
			else
				return "(log(x+2)^0.5)+1"
		}
	    },
	    14: {
		title: "Wood Cutting",
		description: "Unlocks Wood layer, and experience gain is added by 3.",
		cost: new Decimal(10),
		unlocked() { return hasUpgrade("S", 13) },
		tooltip: "+3"
	    },
	    21: {
		title: "Experienced Sticks",
		description: "Boost sticks depending on experience",
		cost: new Decimal(15),
		effect() { return player.points.plus(100).log10().pow(0.1) },
		effectDisplay() { return format(upgradeEffect("S", 21))+"x" },
		unlocked() { return hasUpgrade("W", 12) },
		tooltip: "(log(x+100)^0.1)"
	    },
	    22: {
		title: "Technology Break-out",
		description: "Unlock achievements and the tech tree",
		cost: new Decimal(25),
		unlocked() { return hasUpgrade("W", 12) },
	    },
	    23: {
		title: "High Quality Crafting",
		description: "Boost Crafting effect to the power of 1.1",
		cost: new Decimal(30),
		unlocked() { return hasUpgrade("T", 21) },
	    },
	    24: {
		title: "Not ENOUGH STICKS!",
		description: "Boost Sticks by x2",
		cost: new Decimal(40),
		unlocked() { return hasUpgrade("S", 23) },
	    },
	    31: {
		title: "Sticking Sticks",
		description: "Sticks boost itself",
		cost: new Decimal(200),
		unlocked() { return hasUpgrade("T", 32) },
		effect() { 
			let gain = new Decimal(1)
			if( inChallenge("B", 11) ) gain = new Decimal(2)
            return player.S.points.plus(2).log10().pow(0.5).plus(0.75).div(gain)
        },
		effectDisplay() { return format(upgradeEffect("S", 31))+"x" },
		tooltip: "(log(x+2)^0.5)+0.75"
	    },
	    32: {
		title: "Hydroponic",
		description: "Unlock the leaves layer and boost experience by x2",
		cost: new Decimal(1000),
		unlocked() { return hasUpgrade("S", 31) },
	    },
	    33: {
		fullDisplay() {  
			return "<font size=-1.5><b>Larger Trees</b></font> <br>Boost Stone Wood effect to the power of 1.2</br> <br>Cost: 10K sticks, 2 stone sticks, 5 tree centimeters</br>"
		},
		canAfford() { return player.S.points.gte(new Decimal(10000)) && player.S.st.gte(new Decimal(2)) && player.TR.points.gte(new Decimal(5)) },
		unlocked() { return hasUpgrade("ST", 12) },
		pay() {
			player.S.points = player.S.points.sub(10000);
			player.S.st = player.S.st.sub(2);
			player.TR.points = player.TR.points.sub(5)
		}
	    },
	    34: {
		fullDisplay() {  
			return "<font size=-1.5><b>Even MORE EXPERIENCE</b></font> <br>Boost Expierence, now from wood! Effect to the power of 1.1</br> <br>Cost: 15K sticks, 3 stone sticks, 7 tree centimeters</br>"
		},
		canAfford() { return player.S.points.gte(new Decimal(15000)) && player.S.st.gte(new Decimal(3)) && player.TR.points.gte(new Decimal(7)) },
		unlocked() { return hasUpgrade("S", 33) },
		pay() {
			player.S.points = player.S.points.sub(15000);
			player.S.st = player.S.st.sub(3);
			player.TR.points = player.TR.points.sub(7)
		}
	    },
	    41: {
		title: "The beginning of the end",
		description: "Unlock more battery challenges",
		cost: new Decimal(100), // Used to be 1K
		currencyDisplayName: "stone sticks",
		currencyInternalName: "st",
		currencyLayer: "S",
		unlocked() {return hasUpgrade("M", 14)}
	    },
	    42: {
		title: "Stick it out",
		description: "Double stick gain",
		cost: new Decimal("1e10"),
		unlocked() { return hasUpgrade("S", 41) },
	    },
	    51: {
		title: "Testing", // Tier 2
		description: "Double EXP Gain",
		cost: new Decimal("5e10"),
	    },
	    52: {
		title: "Merging",
		description: "Sticks slightly boost experience.",
		cost: new Decimal("7e10"),
		effect() { 
			let gain = new Decimal(1)
			if( inChallenge("B", 11) ) gain = new Decimal(2)
			if(!hasUpgrade("S", 63))
		        return player.S.points.plus(1).log10().plus(2).pow(0.1).div(gain) // you little log10 NaN >:(
		    else
		        return player.S.points.plus(1).log10().plus(2).pow(0.1).pow(1.1).div(gain)
		},
		effectDisplay() { return format(upgradeEffect("S", 52))+"x" },
		unlocked() { return hasUpgrade("S", 51) },
		tooltip() {
			if(!hasUpgrade("S", 63))
		        return "(log(x+1)+2)^0.1"
		    else
		        return "((log(x+1)+2)^0.1)^1.1"
		}
	    },
	    53: {
		title: "Leftover Notes",
		description: "Experience slightly boosts experience.",
		cost: new Decimal("9e10"),
		effect() { 
			let gain = new Decimal(1)
			if( inChallenge("B", 11) ) gain = new Decimal(2)
			return player.points.plus(2).log10().plus(1).pow(0.075).div(gain)
		},
		effectDisplay() { return format(upgradeEffect("S", 53))+"x" },
		unlocked() { return hasUpgrade("S", 52) },
		tooltip() {
			return "(log(x+2)+1)^0.075"
		}
	    },
	    54: {
		title: "Cutting Wood",
		description: "Unlock more wood upgrades",
		cost: new Decimal("2e11"),
		unlocked() { return hasUpgrade("S", 53) },
	    },
	    43: {
		title: "Wait...", // back to t1
		description: "Unlock the... Antimatter Dimensions Layer??????",
		cost: new Decimal("4e11"),
		unlocked() { return hasUpgrade("W", 32) },
		tooltip: "WHAT"
	    },
	    61: {
		title: "Skilled Sticks", // back to t2
		description: "Boost sticks slightly based on experience",
		cost: new Decimal("2.5e11"),
		effect() { return player.points.plus(1000).log10().pow(0.05) },
		effectDisplay() { return format(upgradeEffect("S", 61))+"x" },
		unlocked() { return hasUpgrade("R", 23) },
		tooltip: "(log(x+1000)^0.05)"
	    },
	    62: {
		title: "Advanced Modifications",
		description: "Double research per researcher",
		cost: new Decimal("3e11"),
		unlocked() { return hasUpgrade("S", 61) },
	    },
	    63: {
		title: "Professional Merging",
		description: "Boost Merging upgrade to the power of 1.1",
		cost: new Decimal("4e11"),
		unlocked() { return hasUpgrade("S", 62) },
	    },
	    64: {
		title: "WE NEED STICKS",
		description: "Boost sticks by x5",
		cost: new Decimal("4e12"),
		unlocked() { return hasUpgrade("S", 63) },
	    },
    },
    layerShown(){return inArea("main")},
    isActive(){return tmp.S.layerShown},
    tabFormat: [
    	["row", [
    		"main-display", 
    		["display-image", "resources/stickicon.png", {"width": "50px", "height": "50px", "position": "relative", "bottom": "10px"}]
    	]],
    	["row", [
    		["display-text", function() { if ( hasUpgrade("ST", 12) ) return "You have "+format(player.S.st)+" stone sticks" }],
    		["display-image", function() { if ( hasUpgrade("ST", 12) ) {return "resources/stonestickicon.png"} else {return "resources/none.png"}}, function() {if ( hasUpgrade("ST", 12) ) { return {"width": "50px", "height": "50px", "position": "relative", "bottom": "2px"}} else { return {"display": "none", "width": "50px", "height": "50px", "position": "relative", "bottom": "2px"}}}]
    	]],
	["display-text", function() { return "Your sticks has a boost of ×<em>"+format(tmp[this.layer].gainMult)+"</em>"}, { "color": "#a86e34", "font-size": "16px"}],
	"prestige-button",
    	"blank",
    	"buyables",
    	"blank",
    	["microtabs", "stuff"]
    ],
    autoUpgrade() {return hasUpgrade("CO", 11)},
    update(diff){
    	if(hasUpgrade("CO", 16)){
    		player.S.st = player.S.st.plus(new Decimal(100).times(diff))
    	}
    }
}),

addLayer("W", {
    name: "Wood", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "W", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    branches: ["ST"],
    startData() { return {
        unlocked() {
        	if (inChallenge("B", 11))
            return false
        else
            return hasUpgrade("S", 14)
        },
	points: new Decimal(0),
	refinedwood: new Decimal(0),
    }},
    color: "#eb9846",
    requires: new Decimal(100), // Can be a function that takes requirement increases into account
    resource: "wood", // Name of prestige currency
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
            let gain2 = new Decimal(1);
			if ( hasUpgrade("W", 11) ) gain2 = gain2.plus(1);
			if ( hasUpgrade("ST", 11) ) gain2 = gain2.plus(2);
			if ( hasUpgrade("W", 14) ) gain2 = gain2.times(upgradeEffect("W", 14));
			if ( hasUpgrade("L", 12) ) gain2 = gain2.times(upgradeEffect("L", 12));
			if ( hasMilestone("ST", 5) ) gain2 = gain2.times(4);
			if ( hasUpgrade("L", 13) ) gain2 = gain2.times(upgradeEffect("L", 13));
			if ( hasUpgrade("R", 13) ) gain2 = gain2.times(upgradeEffect("R", 13));
			if ( hasUpgrade("L", 15) ) gain2 = gain2.times(upgradeEffect("L", 15));
			if ( hasUpgrade("TI", 11) ) gain2 = gain2.times(10);
			if ( hasUpgrade("W", 31) ) gain2 = gain2.times(2);
			gain2 = gain2.times(getBuyableAmount("M", 15).times(0.1).plus(1))
			if ( hasUpgrade("W", 32) ) gain2 = gain2.times(2);
			if ( hasUpgrade("F", 31) ) gain2 = gain2.times(10);
			if(hasMilestone("C", 0)) gain2 = gain2.times(3);
			gain2 = gain2.times(getBuyableAmount("C", 31).times(2).plus(1))
			if(hasMilestone("C", 1))gain2=gain2.times(10)
			if ( hasUpgrade("F", 32) )gain2=gain2.times(100)
			if( player.L.status.eq(1) ) {
		        gain2 = gain2.times(0.5)
	        }
	        if( player.L.status.eq(2) ) {
		        gain2 = gain2.times(2)
	        } // status goes first
			if ( inChallenge("B", 12) ) gain2 = gain2.div(100);
			if ( inChallenge("B", 13) ) gain2 = gain2.sqrt();
			return gain2
    },
    nodeStyle: {
	"border-radius": "25% / 25%",
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    doReset(reset) {
	keep = []
	if ( hasUpgrade("R", 11) ) keep.push("upgrades")
	if ( layers[reset].row > this.row ) layerDataReset("W", keep)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    clickables: {
    	11: {
		title: "Chop",
        	display() { return "Click to chop a tree which would grant you wood." },
		canClick() {return true},
		style: {
			transform: "translate(0px, -10px)"
		},
		onClick() { 
			let gain2 = tmp[this.layer].gainMult;
			player.W.points = player.W.points.plus(gain2) 
		},
		onHold() { 
			if ( hasUpgrade("T", 11) )
				gain2 = tmp[this.layer].gainMult;
				player.W.points = player.W.points.plus(gain2) 
		}
	    }
    },
    rice() {
    	let rice = new Decimal(1)
			if ( hasUpgrade("L", 22) ) rice = rice.times(2)
			if( player.L.status.eq(1) ) {
		        rice = rice.times(0.5)
	        }
	        if( player.L.status.eq(2) ) {
		       rice = rice.times(2)
	        } // status goes first
	        return rice
    },
    buyables: {
    	11: {
        	cost: new Decimal(1000),
		title: "Convert",
        	display() {
				return "Convert 1000 wood into "+format(tmp.W.rice)+" refined wood (buys max)"
		},
        	canAfford() { return player.W.points.gte(new Decimal(1000)) && hasUpgrade("W", 21) },
		unlocked() { return hasUpgrade("W", 21) },
        	buy() {
			// doing buy max on my own bcuz it wont work and it will NaN >:(
			let amount = player.W.points.div(1000).floor()
			let cost = amount.times(1000)
			setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(amount))
			player.W.points = player.W.points.sub(cost)
			player.W.refinedwood = player.W.refinedwood.plus(amount.times(tmp.W.rice))
		}
	}
    },
    upgrades: {
	    11: {
		title: "Chopper",
		description: "Gain 1 more wood per click",
		cost: new Decimal(25),
	    },
	    12: {
		title: "UpGs",
		description: "Unlock 2 more stick upgrades",
		cost: new Decimal(40),
		unlocked() { return hasUpgrade("W", 11) }
	    },
	    13: {
		title: "Experience, now from wood!",
		description: "Wood now boosts experience (Softcap 5x)",
		cost: new Decimal(500),
		unlocked() { return hasUpgrade("T", 11) },
		effect() { 
			if ( upgradeEffect("W", 13) < new Decimal(5) )
				if ( hasUpgrade("S", 34) )
					return player.W.points.plus(5).log10().pow(0.4).plus(1).pow(1.1)
				else
					return player.W.points.plus(5).log10().pow(0.4).plus(1)
			else
				return new Decimal(5)
		},
		effectDisplay() { return format(upgradeEffect("W", 13))+"x" },
		tooltip() {
			if ( hasUpgrade("S", 34) )
				return "((log(x+5)^0.4)+1)^1.1"
			else
				return "(log(x+5)^0.4)+1"
		}
	    },
	    14: {
		title: "Stone Wood",
		description: "Stone boosts wood",
		cost: new Decimal(1000),
		unlocked() { return hasUpgrade("T", 31) },
		effect() { 
			if ( hasUpgrade("S", 33) )
				return player.ST.points.plus(1.25).pow(0.5).pow(1.2)
			else
				return player.ST.points.plus(1.25).pow(0.5)
		},
		effectDisplay() { return format(upgradeEffect("W", 14))+"x" },
		tooltip() { 
			if ( hasUpgrade("S", 33) ) 
				return "((x+1.25)^0.5)^1.2" 
			else
				return "(x+1.25)^0.5"
		},
	    },
	    21: {
		title: "NEW and IMPROVED",
		description: "Unlock Refined Wood type",
		cost: new Decimal(1500),
		unlocked() { return hasUpgrade("ST", 11) }
	    },
	    22: {
		fullDisplay() {  
			return "<font size=-1.5><b>Successfully Failed</b></font> <br>Boost trial and error effect to the power of 1.08</br> <br>Cost: 1000 Wood, 2 refined wood</br>"
		},
		canAfford() { return player.W.points.gte(new Decimal(1000)) && player.W.refinedwood.gte(new Decimal(2)) },
		unlocked() { return hasUpgrade("W", 21) },
		pay() {
			player.W.points = player.W.points.sub(1000);
			player.W.refinedwood = player.W.refinedwood.sub(2)
		}
	    },
	    23: {
		fullDisplay() {  
			return "<font size=-1.5><b>Dont leaf me...</b></font> <br>Double leaf gain</br> <br>Cost: 10K Wood, 10 refined wood</br>"
		},
		canAfford() { return player.W.points.gte(new Decimal(10000)) && player.W.refinedwood.gte(new Decimal(10)) },
		unlocked() { return hasUpgrade("R", 12) },
		pay() {
			player.W.points = player.W.points.sub(10000);
			player.W.refinedwood = player.W.refinedwood.sub(10)
		}
	    },
	    24: {
		fullDisplay() {  
			return "<font size=-1.5><b>Reproducing Sticks</b></font> <br>Passively generate 1% of sticks</br> <br>Cost: 20K Wood, 20 refined wood</br>"
		},
		canAfford() { return player.W.points.gte(new Decimal(20000)) && player.W.refinedwood.gte(new Decimal(20)) },
		unlocked() { return hasUpgrade("W", 23) },
		pay() {
			player.W.points = player.W.points.sub(20000);
			player.W.refinedwood = player.W.refinedwood.sub(20)
		}
	    },
	    31: {
		fullDisplay() {  
			return "<font size=-1.5><b>Wood Zapping</b></font> <br>Double wood gain and unlock more tree upgrades</br> <br>Cost: 1e9 wood, 1,000,000 refined wood</br>"
		},
		canAfford() { return player.W.points.gte(new Decimal("1e9")) && player.W.refinedwood.gte(new Decimal("1e6")) },
		unlocked() { return hasUpgrade("TI", 13) },
		pay() {
			player.W.points = player.W.points.sub("1e9");
			player.W.refinedwood = player.W.refinedwood.sub("1e6")
		}
	    },
	    32: {
		fullDisplay() {  
			return "<font size=-1.5><b>Stay the same</b></font> <br>Unlock more tier 1 stick upgrades, double wood gain</br> <br>Cost: 1e11 wood, 1e8 refined wood</br>"
		},
		canAfford() { return player.W.points.gte(new Decimal("1e11")) && player.W.refinedwood.gte(new Decimal("1e8")) },
		unlocked() { return hasUpgrade("S", 54) },
		pay() {
			player.W.points = player.W.points.sub("1e11");
			player.W.refinedwood = player.W.refinedwood.sub("1e8")
		}
	    }
    },
    layerShown() { 
    	if (inChallenge("B", 11))
            return false
        else
            return hasUpgrade("S", 14) && inArea("main")
    },
    isActive() {return tmp.W.layerShown},
    tabFormat: [
    	["row", [
    		"main-display", 
    		["display-image", "resources/woodicon.png", {"width": "50px", "height": "50px", "position": "relative", "bottom": "10px"}]
    	]],
    	["row", [
    		["display-text", function() { return "You have "+format(player.W.refinedwood)+" refined wood" }],
    		["display-image", "resources/refinedwoodicon.png", {"width": "50px", "height": "50px", "position": "relative", "bottom": "2px"}]
    	]],
    	["display-text", function() { return "Your wood has a boost of ×<em>"+format(tmp[this.layer].gainMult)+"</em>"}, { "color": "#eb9846", "font-size": "16px"}],
    	"blank",
    	"buyables",
    	"blank",
    	"clickables",
    	"blank",
    	"upgrades"
    ],
    autoUpgrade() {return hasUpgrade("CO", 12)},
    update(diff){
    	if(hasUpgrade("CO", 17)){
    		player.W.refinedwood = player.W.refinedwood.plus(player.W.points.pow(0.5).times(diff))
    	}
    	if(hasUpgrade("CO", 14)) {
    		let gain = tmp.W.gainMult.div(100)
    		let real = gain.times(diff)
    		player.W.points = player.W.points.plus(real)
    	}
    }
}),

addLayer("T", {
    name: "Tech", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "T", // This appears on the layer's node. Default is the id with the first letter capitalized
    startData() { return {
        unlocked() { return hasUpgrade("S", 22) || hasUpgrade("L", 11) || hasUpgrade("TI", 11) },
		points: new Decimal(0),
    }},
    color: "#cf46eb",
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "research", // Name of prestige currency
    baseResource: "sticks", // Name of resource prestige is based on
    baseAmount() {return player.S.points}, // Get the current amount of baseResource
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
    buyables: {
    	11: {
        	cost: new Decimal(25),
		title: "Study - 25 Sticks",
        	display() { return "Study and get 1 research" },
        	canAfford() { return player.S.points.gte( new Decimal(25) ) },
		style: {
			transform: "translate(0px, -10px)"
		},
        	buy() {
            		player.S.points = player.S.points.sub(25)
            		setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
	    		player.T.points = player.T.points.plus(1)
        	}
	},
	12: {
        	cost: new Decimal(25),
		title: "Study - 1e23 Ethereal Sticks",
        	display() { return "Study and get 1e15 research" },
        	canAfford() { return player.ES2.points.gte( new Decimal("1e23") ) },
		style: {
			transform: "translate(0px, -10px)"
		},
		unlocked() {return hasUpgrade("T", 43)},
        	buy() {
            		player.ES2.points = player.ES2.points.sub("1e23")
            		setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
	    		player.T.points = player.T.points.plus("1e15")
        	}
	}
    },
    upgrades: {
	    11: {
		title: "Inventing Fire",
		description: "Unlock more wood upgrades, and get the ability to hold wood clickable.",
		cost: new Decimal(1),
		branches: [21, 22]
	    },
	    21: {
		title: "Sticks are useful!!!",
		description: "Unlock more stick upgrades",
		cost: new Decimal(3),
		unlocked() { return hasUpgrade("T", 11) },
		branches: [31]
	    },
            22: {
		title: "Stone Age",
		description: "Unlock the stone layer",
		cost: new Decimal(5),
		unlocked() { return hasUpgrade("T", 11) },
		branches: [32, 33]
	    },
	    31: {
		title: "Wood Expansion",
		description: "Unlock even more wood upgrades",
		cost: new Decimal(10),
		unlocked() { return hasUpgrade("T", 21) },
	    },
	    32: {
		title: "Stone Tools",
		description: "Unlock even more stick upgrades",
		cost: new Decimal(15),
		unlocked() { return hasUpgrade("T", 22) },
	    },
	    33: {
		title: "Tin Cans",
		branches: [41, 42],
		description: "Unlock the tin layer",
		cost: new Decimal(500000),
		unlocked() { return hasUpgrade("T", 22) },
		},
		41: {
		title: "Ctiks",
		description: "Gain 100% of your sticks",
		cost: new Decimal(1000000),
		unlocked() { return hasChallenge("B", 11) },
	    },
	    42: {
		title: "Industrial Age",
		description: "Unlock the coal layer",
		cost: new Decimal("1e10"),
		unlocked() { return hasUpgrade("F", 41) },
		branches: [43]
	    },
	    43: {
		title: "Otherworldly Research",
		description: "Unlock a new study buyable",
		cost: new Decimal("1e11"),
		branches: [44],
		unlocked() { return hasUpgrade("T", 42)&&hasAchievement("AD", 26) },
	    },
	    44: {
		title: "The Base of Wiring",
		description: "Unlock the Copper layer",
		cost: new Decimal("2e16"),
		unlocked() { return hasUpgrade("T", 43)},
	    }
    },
    layerShown() { return (hasUpgrade("S", 22) || hasUpgrade("L", 11) || hasUpgrade("TI", 11) || hasMilestone("C", 0)) && inArea("main") },
    isActive() {return tmp.T.layerShown},
    tabFormat: [
    	["row", [
    		"main-display",
    		["display-image", "resources/researchicon.png", {"width": "50px", "height": "50px", "position": "relative", "bottom": "10px"}]
    	]],
    	"buyables",
    	["row", [["upgrade", 11]]],
    	"blank",
    	["row", [["upgrade", 21], "blank", ["upgrade", 22]]],
    	"blank",
    	["row", [["upgrade", 31], "blank", ["upgrade", 32], "blank", ["upgrade", 33]]],
    	"blank",
    	["row", [["upgrade", 41], "blank", ["upgrade", 42]]],
    	"blank",
    	["upgrade", 43],
    	"blank",
    	["upgrade", 44]
    ]
}),

addLayer("ACH", {
    name: "Achievements", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "ACH", // This appears on the layer's node. Default is the id with the first letter capitalized
    startData() { return {
        unlocked() { return hasUpgrade("S", 22) || hasUpgrade("L", 11) | hasUpgrade("TI", 11) }
    }},
    tooltip: "",
    color: "#f5c542",
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
    achievements: {
    	11: {
        	name: "skilled",
        	done() { return player.points.gte(1000) },
		tooltip: "get 1000 experience",
		image: "resources/Ach1.png"
    	},
	12: {
        	name: "its hard",
        	done() { return player.ST.points.gte(1) },
		tooltip: "get 1 stone",
		image: "resources/Ach2.png"
    	},
	13: {
        	name: "dont step",
        	done() { return player.L.points.gte(1) },
		tooltip: "get 1 leaf",
		image: "resources/Ach3.png"
    	},
	14: {
        	name: "not the same",
        	done() { return player.W.refinedwood.gte(1) },
		tooltip: "get 1 refined wood",
		image: "resources/Ach4.png"
    	},
	15: {
        	name: "small but big",
        	done() { return player.TR.points.gte(50) && hasMilestone("ST", 2) },
		tooltip: "have your tree be 50 centimeters tall",
		image: "resources/Ach5.png"
    	},
	16: {
        	name: "stop chopping",
        	done() { return player.W.points.gte(1500) },
		tooltip: "get 1500 wood",
		image: "resources/Ach6.png"
    	},
	21: {
        	name: "nanotubes",
        	done() { return player.points.gte(1000000) },
		tooltip: "get 1M experience",
		image: "resources/Ach7.png"
    	},
	22: {
        	name: "aleph / 100,000",
        	done() { return player.S.points.gte(100000) },
		tooltip: "get 100K sticks",
		image: "resources/Ach8.png"
    	},
	23: {
        	name: "its the same",
        	done() { return player.W.refinedwood.gte(10) },
		tooltip: "get 10 refined wood",
		image: "resources/Ach9.png"
    	},
	24: {
        	name: "no salary",
        	done() { return player.R.points.gte(1) },
		tooltip: "hire 1 researcher",
		image: "resources/Ach10.png"
    	},
    25: {
        	name: "count leaves",
        	done() { return player.L.points.gte(100000) },
		tooltip: "count 100,000 leaves",
		image: "resources/Ach11.png"
    	},
    26: {
        	name: "unpaid people",
        	done() { return player.R.points.gte(1000) },
		tooltip: "hire 1,000 researchers",
		image: "resources/Ach12.png"
    	},
    31: {
        	name: "stone?",
        	done() { return player.TI.points.gte(1) },
		tooltip: "acquire 1 tin",
		image: "resources/Ach13.png"
    	},
    32: {
        	name: "willionare",
        	done() { return player.W.points.gte("1e9") },
		tooltip: "have 1e9 wood",
		image: "resources/Ach14.png"
    	},
    33: {
        	name: "batterying",
        	done() { return player.B.points.gte(1) && hasUpgrade("TI", 11) },
		tooltip: "have 1 power or more",
		image: "resources/Ach15.png"
    	},
    34: {
        	name: "not so broken",
        	done() { return hasChallenge("B", 11) },
		tooltip: "complete broken sticks challenge",
		image: "resources/Ach16.png"
    	},
    35: {
        	name: "whoops",
        	done() { return player.B.points.gte(500) },
		tooltip: "have more than 500 power",
		image: "resources/Ach17.png"
    	},
    36: {
        	name: "re-re-re-refined",
        	done() { return player.W.refinedwood.gte(1000000) },
		tooltip: "get 1M refined wood",
		image: "resources/Ach18.png"
    	},
    41: {
        	name: "impossible",
        	done() { return player.TI.points.gte(2) },
		tooltip: "get 2 tin",
		image: "resources/Ach19.png"
    	},
    42: {
        	name: "a lillion",
        	done() { return player.L.points.gte("1e6") },
		tooltip: "get a million leaves",
		image: "resources/Ach20.png"
    	},
    43: {
        	name: "dollar stores sells wood now",
        	done() { return player.W.points.gte("1e10") },
		tooltip: "get 1e10 wood",
		image: "resources/Ach21.png"
    	},
    44: {
        	name: "yeowch",
        	done() { return player.B.points.gte(4000) },
		tooltip: "get 4000 power",
		image: "resources/Ach22.png"
    	},
    45: {
        	name: "secret ingredient",
        	done() { return player.TR.seed.gte(0.0001) },
		tooltip: "buy 1 seed",
		image: "resources/Ach23.png"
    	},
    46: {
        	name: "sticks > humans",
        	done() { return player.S.points.gte("1e10") },
		tooltip: "get 1e10 sticks",
		image: "resources/Ach24.png"
    	},
    51: {
        	name: "successfully dumb",
        	done() { return player.points.gte("1e7") && inChallenge("B", 12) },
		tooltip: "get 10M experience during the Ineffective Learning battery challenge",
		image: "resources/Ach25.png"
    	},
    52: {
        	name: "attract.",
        	done() { return player.M.points.gte(3) },
		tooltip: "get 3 magnets",
		image: "resources/Ach26.png"
    	},
    53: {
        	name: "burger khalifa",
        	done() { return player.TR.points.gte("1e5") },
		tooltip: "have your tree be taller than 100,000 centimeters",
		image: "resources/Ach27.png"
    	},
    54: {
        	name: "stonks",
        	done() { return player.M.box.gte(5) },
		tooltip: "get 5 boxes",
		image: "resources/Ach28.png"
    	},
    55: {
        	name: "moneh moneh moneh",
        	done() { return player.M.cash.gte(250) },
		tooltip: "get 250 cash",
		image: "resources/Ach29.png"
    	},
    56: {
        	name: "root of the problem",
        	done() { return hasChallenge("B", 13) },
		tooltip: "complete tree root challenge",
		image: "resources/Ach30.png"
    	},
    61: {
        	name: "1 big step",
        	done() { return player.TR.points.gte("1e6") },
		tooltip: "make your tree be bigger than 1M centimeters",
		image: "resources/Ach31.png"
    	},
    62: {
        	name: "riches to rags",
        	done() { return player.F.points.gte(1) },
		tooltip: "acquire fire stage 1",
		image: "resources/Ach32.png"
    	},
    63: {
        	name: "above average",
        	done() { return hasUpgrade("S", 51) },
		tooltip: "get a tier 2 stick upgrade",
		image: "resources/Ach33.png"
    	},
    64: {
        	name: "zoooooooooom",
        	done() { return player.S.points.gte("1e12") },
		tooltip: "get a trillion (1e12) sticks",
		image: "resources/Ach34.png"
    	},
    65: {
        	name: "the great wall of cap",
        	done() { return player.AD.points.gte("2e8") },
		tooltip: "get 2e8 antimatter reward: unlock an antimatter upgrade",
		image: "resources/Ach35.png"
    	},
    66: {
        	name: "too expensive",
        	done() { return player.F.points.gte(2) },
		tooltip: "acquire fire stage 2",
		image: "resources/Ach36.png"
    	},
    71: {
        	name: "stickocalypse",
        	done() { return player.S.points.gte("1e13") },
		tooltip: "get 1e13 sticks",
		image: "resources/Ach37.png"
    	},
    72: {
        	name: "futuristic sticks",
        	done() { return hasUpgrade("S", 61) && hasUpgrade("S", 62) && hasUpgrade("S", 63) && hasUpgrade("S", 64) },
		tooltip: "get all row 2 tier 2 stick upgrades",
		image: "resources/Ach38.png"
    	},
    73: {
        	name: "feel the thunder",
        	done() { return player.B.points.gte(10000) },
		tooltip: "get 10,000 power",
		image: "resources/Ach39.png"
    	},
    74: {
        	name: "the choice",
        	done() { return player.F.fp.gte(1) },
		tooltip: "get 1 fire point",
		image: "resources/Ach40.png"
    	},
    75: {
        	name: "indesicive",
        	done() { return hasUpgrade("F", 11) && hasUpgrade("F", 21) },
		tooltip: "get the 2 starting fire point upgrades reward: get a new recovery",
		image: "resources/Ach41.png"
    	},
    76: {
        	name: "it's lit",
        	done() { return player.C.points.gte(1) },
		tooltip: "get a coal",
		image: "resources/Ach42.png"
    	},
    81: {
        	name: "mini... skilled",
        	done() { return player.C.mini.gte(1000) },
		tooltip: "have 1000 mini experience",
		image: "resources/Ach43.png"
    	},
    82: {
        	name: "its easy",
        	done() { return player.mst.points.gte(1) },
		tooltip: "get 1 mini stone",
		image: "resources/Ach44.png"
    	},
    83: {
        	name: "please step",
        	done() { return player.ml.points.gte(1) },
		tooltip: "get 1 mini leaf",
		image: "resources/Ach45.png"
    	},
    84: {
        	name: "nano experience nano-nanotubes",
        	done() { return player.C.mini.gte(1000000) },
		tooltip: "get 1M mini experience",
		image: "resources/Ach46.png"
    	},
    85: {
        	name: "aleph / 0.1",
        	done() { return player.ms.points.gte(100000) },
		tooltip: "get 100,000 mini sticks",
		image: "resources/Ach47.png"
    	},
    86: {
        	name: "minimum wage",
        	done() { return player.mr.points.gte(1) },
		tooltip: "have 1 mini researcher",
		image: "resources/Ach48.png"
    	},
    91: {
        	name: "little versions",
        	done() { return player.C.mp.gte(1) },
		tooltip: "get 1 mini point",
		image: "resources/Ach49.png"
    	},
    92: {
        	name: "reepeeteetive",
        	done() { return player.C.mp.gte(2) },
		tooltip: "get 2 mini points",
		image: "resources/Ach50.png"
    	},
    93: {
        	name: "expand",
        	done() { return getBuyableAmount("C", 41).gte(1) },
		tooltip: "buy the x-pansion upgrade",
		image: "resources/Ach51.png"
    	},
    94: {
        	name: "maxed",
        	done() { return getBuyableAmount("C", 11).gte(5) && getBuyableAmount("C", 21).gte(5) && getBuyableAmount("C", 22).gte(5) && getBuyableAmount("C", 31).gte(5) && getBuyableAmount("C", 32).gte(5) && getBuyableAmount("C", 33).gte(5) && getBuyableAmount("C", 34).gte(1) && getBuyableAmount("C", 41).gte(1)},
		tooltip: "max every upgrade from the mini upgrade tree up until row 4",
		image: "resources/Ach52.png"
    	},
    95: {
        	name: "man behind everything",
        	done() { return hasUpgrade("L", 23)},
		tooltip: "unlock statuses",
		image: "resources/Ach53.png"
    	},
    96: {
        	name: "another world",
        	done() { return !inArea("main")},
		tooltip: "exit the planet",
		image: "resources/Ach54.png"
    	},
    101: {
        	name: "isitreal?",
        	done() { return player.ES2.points.gte(1000)},
		tooltip: "get 1000 ethereal sticks",
		image: "resources/Ach55.png"
    	},
    102: {
        	name: "upgrades? it's all yours, my friend.",
        	done() { return getBuyableAmount("ES2", 11).gte(4)},
		    tooltip: "max out content",
		    image: "resources/Ach56.png"
    	},
    103: {
        	name: "it's very convenient",
        	done() { return maxedChallenge("CE3", 11)},
		    tooltip: "max inconvenient challenge",
		    image: "resources/Ach57.png"
    	},
    104: {
        	name: "the opposite of what?",
        	done() { return maxedChallenge("CE3", 12)},
		    tooltip: "max the opposite challenge",
		    image: "resources/Ach58.png"
    	},
    105: {
        	name: "at the speed of exp",
        	done() { return getBuyableAmount("CE3", 11).gte(1)},
		    tooltip: "buy the speedrun buyable",
		    image: "resources/Ach59.png"
    	},
    106: {
        	name: "A+",
        	done() { return hasChallenge("CE3", 21)},
		    tooltip: "complete the first test",
		    image: "resources/Ach60.png"
    	},
    111: {
        	name: "what is it",
        	done() { return player.M2.points.gte(1)},
		    tooltip: "get a monoium",
		    image: "resources/Ach61.png"
    	},
    112: {
        	name: "galaxy delivery",
        	done() { return hasUpgrade("ES2", 34)},
		    tooltip: "buy the 'Imported' upgrade",
		    image: "resources/Ach62.png"
    	},
    113: {
        	name: "TooEz",
        	done() { return player.DS3.points.gte(1)},
		    tooltip: "reset for a difficult stick",
		    image: "resources/Ach63.png"
    	},
    114: {
        	name: "a whole bunch",
        	done() { return player.DS3.points.gte(10)},
		    tooltip: "have 10 difficult sticks",
		    image: "resources/Ach64.png"
    	},
    115: {
        	name: "stick lines",
        	done() { return hasUpgrade("CO", 11)&&hasUpgrade("CO", 12)&&hasUpgrade("CO", 13)},
		    tooltip: "buy all row 1 copper upgrades",
		    image: "resources/Ach65.png"
    	},
    	116: {
        	name: "mind paying taxes",
        	done() { return player.M.cash.gte("1e5")},
		    tooltip: "have 100,000+ cash",
		    image: "resources/Ach66.png"
    	},
    	121: {
        	name: "wildfire",
        	done() { return player.F.points.gte(6)},
		    tooltip: "get 6 fire stages",
		    image: "resources/Ach67.png"
    	},
    	122: {
        	name: "the megawatt",
        	done() { return player.B.points.gte("1e6")},
		    tooltip: "have 1,000,000 power",
		    image: "resources/Ach68.png"
    	},
    	123: { //secret ach
        	name: "REALLY effective",
        	done() { return player.points.gte("1e30")&&inChallenge("B", 12)},
		    tooltip() { 
		    	if(hasAchievement(this.layer, this.id)) {
		    		return "have 1e30 exp during the Ineffective Learning challenge"
		    	} else {
		    		return "maybe way too effective"
		    	}
		    },
		    image: "resources/Ach69.png"
    	},
    	124: {
        	name: "rank #1",
        	done() { return getBuyableAmount("CO", 12).gte(1)},
		    tooltip: "get rank 1",
		    image: "resources/Ach70.png"
    	},
    	125: {
        	name: "where's the reward",
        	done() { return getBuyableAmount("CO", 12).gte(4)},
		    tooltip: "get rank 4",
		    image: "resources/Ach71.png"
    	},
    	126: {
        	name: "upperclassman",
        	done() { return getBuyableAmount("CO", 13).gte(1)},
		    tooltip: "get tier 1",
		    image: "resources/Ach72.png"
    	},
    },
    
    layerShown() { return hasUpgrade("S", 22) || hasUpgrade("L", 11) || hasUpgrade("TI", 11) || hasMilestone("C", 0) }
}),

addLayer("ST", {
    name: "Stone", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "ST", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked() { return hasUpgrade("T", 22) },
	points: new Decimal(0),
	total: new Decimal(0)
    }},
    branches: ["L", "R", "TI"],
    color: "#7a7a7a",
    requires: new Decimal(50), // Can be a function that takes requirement increases into account
    resource: "stone", // Name of prestige currency
    baseResource: "sticks", // Name of resource prestige is based on
    baseAmount() {return player.S.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
    	if ( hasUpgrade("ST", 13) )
            exp = new Decimal(1.5)
        else
            exp = new Decimal(1.75)
        return exp
    }, // Prestige currency exponent
    canBuyMax() { return hasUpgrade("ST", 13) },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {
            key: "S", // What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" for holding down ctrl.
            description: "shift + s: reset your sticks for stone", // The description of the hotkey that is displayed in the game's How To Play tab
            onPress() { if (player.ST.unlocked) if (canReset(this.layer)) doReset("ST") },
        }
    ],
    milestones: {
    	0: {
        	requirementDescription: "1 Total Stone",
        	effectDescription: "Stone boosts experience",
        	done() { return player.ST.total.gte(1) },
		tooltip: "(x+0.25)^1.05"
    	},
	1: {
        	requirementDescription: "3 Total Stone",
        	effectDescription: "Unlock researchers",
        	done() { return player.ST.total.gte(3) }
    	},
	2: {
        	requirementDescription: "5 Total Stone",
        	effectDescription: "Unlock the tree layer",
        	done() { return player.ST.total.gte(5) }
    	},
	3: {
        	requirementDescription: "7 Total Stone",
        	effectDescription: "Stone boosts sticks",
        	done() { return player.ST.total.gte(7) },
		    tooltip() {
	            if ( hasUpgrade("ST", 14) )
                    return "(x+1.5)^0.75"
                else
                    return "(x+1.5)^0.5"
            }
    	},
	4: {
        	requirementDescription: "9 Total Stone",
        	effectDescription: "Stick upgrades don't reset",
        	done() { return player.ST.total.gte(9) }
    	},
	5: {
        	requirementDescription: "11 Total Stone",
        	effectDescription: "x4 wood",
        	done() { return player.ST.total.gte(11) }
    	}

    },
    upgrades: {
	    11: {
		title: "Stone Axe",
		description: "+2 Wood per chop and unlock more wood upgrades",
		cost: new Decimal(2)
	    },
	    12: {
		title: "Stone Sticks",
		description: "Unlock more stick upgrades and unlock stone sticks",
		cost: new Decimal(4),
		unlocked() { return hasUpgrade("ST", 11) }
	    },
	    13: {
		title: "Tunnel",
		description: "Decrease sticks needed for stone requirement, and get ability to buy max stone",
		cost: new Decimal(5),
		unlocked() { return hasChallenge("B", 11) }
	    },
	    14: {
		title: "Stoicks",
		description: "Increase boost to sticks by stone",
		cost: new Decimal(9),
		unlocked() { return hasUpgrade("ST", 13) }
	    }
    },
    layerShown(){ return hasUpgrade("T", 22) && inArea("main") },
    isActive(){return tmp[this.layer].layerShown},
    tabFormat: [
    	["row", [
    		"main-display", 
    		["display-image", "resources/stoneicon.png", {"width": "50px", "height": "50px", "position": "relative", "bottom": "10px"}]
    	]],
    	["display-text", function() { return "You have made a total of "+format(player.ST.total)+" stone" }],
    	"prestige-button",
    	"blank",
    	"upgrades",
    	"blank",
    	"milestones"
    ],
    autoPrestige() {return hasUpgrade("CO", 13)},
    resetsNothing() {return hasUpgrade("CO", 15)},
    autoUpgrade() {return hasUpgrade("CO", 15)}
}),

addLayer("L", {
    name: "Leaves", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "L", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked() { return hasUpgrade("S", 32) },
	points: new Decimal(0),
	energy: new Decimal(0),
	heat: new Decimal(0),
	status: new Decimal(0), // status id's [ 0 = normal] [1 is slowed] [2 is overclock]
	a: new Decimal(0)
    }},
    doReset(reset) {
    player.L.status = new Decimal(0)
	keep = [];
	if (reset == "R") keep.push("upgrades");
	if (reset == "R") layerDataReset("L", keep)
	if(hasUpgrade("CO", 19)&&reset!="R") keep.push("upgrades")
	if (layers[reset].row > this.row) layerDataReset("L", keep)
    },
    nodeStyle: {
	"border-radius": "50% / 75%",
    },
    color: "#32a852",
    requires: new Decimal(5), // Can be a function that takes requirement increases into account
    resource: "leaves", // Name of prestige currency
    baseResource: "refined wood", // Name of resource prestige is based on
    baseAmount() {return player.W.refinedwood}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
	if ( hasUpgrade("W", 23) ) mult = mult.times(2)
	if ( hasUpgrade("L", 14) ) mult = mult.times(upgradeEffect("L", 14))
	if ( hasUpgrade("L", 21) ) mult = mult.times(2)
	if ( hasUpgrade("TI", 11) ) mult = mult.times(2)
	if ( hasUpgrade("TI", 12) ) mult = mult.times(upgradeEffect("TI", 12))
	if(hasMilestone("C", 1))mult=mult.times(10)
	if( player.L.status.eq(1) ) {
		        mult = mult.times(0.5)
	        }
	        if( player.L.status.eq(2) ) {
		        mult = mult.times(2)
	        } // status goes first
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {
            key: "l", // What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" for holding down ctrl.
            description: "l: reset your ref. wood for leaves", // The description of the hotkey that is displayed in the game's How To Play tab
            onPress() { if (player.L.unlocked) if (canReset(this.layer)) doReset("L") },
        }
    ],
    upgrades: {
	    11: {
		title: "Books of Knowledge",
		description: "Leaves boost sticks and tech tree and achievements stay.",
		cost: new Decimal(1),
		effect() { 
			return player.L.points.times(1.5).plus(1.1).log10().pow(0.2).plus(1)
		},
		effectDisplay() { return format(upgradeEffect("L", 11))+"x" },
		tooltip: "(log((x*1.5)+1.1)^0.2)+1"
	    },
	    12: {
		title: "Wood from Leaves!?!?",
		description: "Leaves boost wood",
		cost: new Decimal(2),
		effect() { 
			return player.L.points.plus(1.25).pow(0.5).plus(0.5)
		},
		effectDisplay() { return format(upgradeEffect("L", 12))+"x" },
		tooltip: "((x+1.25)^0.5)+0.5"
	    },
	    13: {
		title: "Artificial Wood Growth",
		description: "Tree Centimeters boost wood",
		cost: new Decimal(5),
		effect() { 
			return player.TR.points.plus(1).log10().pow(0.4).plus(1)
		},
		effectDisplay() { return format(upgradeEffect("L", 13))+"x" },
		tooltip: "(log(x+1)^0.4)+1"
	    },
	    14: {
		title: "Let's research leaves?",
		description: "Researchers boost leaves",
		cost: new Decimal(10),
		effect() { 
			return player.R.points.plus(2).pow(0.4)
		},
		effectDisplay() { return format(upgradeEffect("L", 14))+"x" },
		tooltip: "(x+2)^0.4"
	    },
	    15: {
		title: "Branches",
		description: "Wood boost itself",
		cost: new Decimal(15),
		effect() { 
			return player.W.points.plus(5).log10().pow(0.2).plus(1)
		},
		effectDisplay() { return format(upgradeEffect("L", 15))+"x" },
		tooltip: "(log(x+5)^0.5)+1"
	    },
	    21: {
		title: "Autumn",
		description: "x2 Leaf Gain",
		cost: new Decimal(20),
		unlocked() { return hasUpgrade("R", 14) }
	    },
	    22: {
		title: "Re-Refining",
		description: "x2 Refined Wood",
		cost: new Decimal(25),
		unlocked() { return hasUpgrade("L", 21) }
	    },
	    23: {
		title: "Full Control",
		description: "Unlock Statuses",
		cost: new Decimal(10000000),
		unlocked() { return getBuyableAmount("C", 41).gte(1) }
	    },
	    24: {
		title: "Supporting Leaves",
		description: "Unlock more mini tree upgrades",
		cost: new Decimal(50000000),
		unlocked() { return hasUpgrade("L", 23) }
	    }
    },
    buyables: {
    	11: {
        	cost: new Decimal(0),
		title: "Normal Status",
        	display() { return "Change status to Normal. <br> Normal Effects: x1 All resources </br>" },
		unlocked() { return hasUpgrade("L", 23) },
        	canAfford() { return player.L.status.neq( new Decimal(0) ) && player.L.a.eq(0) },
        	buy() {
            		player.L.status = new Decimal(0)
        	}
	},
	12: {
        	cost: new Decimal(0),
		title: "Slowed Status",
        	display() { return "Change status to Slowed. <br> Slowed Effects: x0.5 All resources, +6% energy/s, -1 heat/s.</br>" },
		unlocked() { return hasUpgrade("L", 23) },
        	canAfford() { return player.L.status.neq( new Decimal(1) ) && player.L.a.eq(0)  },
        	buy() {
            		player.L.status = new Decimal(1)
        	}
	},
	13: {
        	cost: new Decimal(0),
		title: "Overclocked Status",
        	display() { return "Change status to Overclocked. <br> Overclocked Effects: x1.5 All resources, -3% energy/s, +1 heat/s.</br>" },
		unlocked() { return hasUpgrade("L", 23) },
        	canAfford() { return player.L.status.neq( new Decimal(2) ) && player.L.a.eq(0) && player.L.energy.gt(0) },
        	buy() {
            		player.L.status = new Decimal(2)
        	}
	},
	},
	bars: {
         energyBar: {
             direction: RIGHT,
             width: 500,
             height: 50,
             progress() { return player.L.energy.div(100) },
             fillStyle: {
             	"background-color": "#a8a632"
             },
             borderStyle: {
             	"border-color": "#66651e",
                 "border": "10px solid"
             }
         },
         heatBar: {
             direction: RIGHT,
             width: 500,
             height: 50,
             progress() { return player.L.heat.div(100) },
             fillStyle: {
             	"background-color": "#b8170b"
             },
             borderStyle: {
             	"border-color": "#75150e",
                 "border": "10px solid"
             }
         }
    },
    infoboxes: {
        note: {
            title: "Note",
            body() { return "All resources means every resource EXCEPT fire layer and the currencies inside it, magnet layer and the currencies inside it, all layers unlocked via tech tree, and the currencies inside them, the side layers, battery layer, and the Mini tree. <br> If your heat is maximized, it will set status to slowed UNTIL it goes into 0. </br>" },
        }
    },
    microtabs: {
        stuff: {
            Upgrades: {
                content: [
                    "upgrades"
                ]
            },
            Statuses: {
                content: [
                    ["infobox", "note"],
                    "blank",
                    ["row", [ ["bar", "energyBar"], "blank", ["display-text", function() { return "You have "+format(player.L.energy)+" energy." }] ] ],
                    "blank",
                    ["row", [ ["bar", "heatBar"], "blank", ["display-text", function() { return "You have "+format(player.L.heat)+" heat." }] ] ],
                    "blank",
                    ["display-text", function() {
                    	if(player.L.status.eq(0)) return "Current Status: Normal"
                        if(player.L.status.eq(1)) return "Current Status: Slowed"
                        if(player.L.status.eq(2)) return "Current Status: Overclocked"
                    }],
                    "blank",
                    "buyables"
                ],
                unlocked() { return hasUpgrade("L", 23) }
            }
        }
    },
    update(diff) {
    	if (player.L.status.eq(1) || player.L.a.eq(1) ) {
    	    if(player.L.a.neq(1)) {
                if (player.L.energy.lt(100) )player.L.energy = player.L.energy.plus(new Decimal(0.2))
                if (player.L.heat.gt(0) )player.L.heat = player.L.heat.sub(new Decimal(0.03))
            }
            if(player.L.a.eq(1)) {
            	player.L.status = new Decimal(1)
                if (player.L.energy.lt(100) )player.L.energy = player.L.energy.plus(new Decimal(0.2))
                if (player.L.heat.gt(0) )player.L.heat = player.L.heat.sub(new Decimal(0.03))
                if (player.L.heat.lte(0))player.L.a = new Decimal(0)
            }
        }
        
        if (player.L.status.eq(2)) {
        	if (player.L.energy.lte(0)) player.L.status = new Decimal(0)
            if (player.L.energy.gt(0) )player.L.energy = player.L.energy.sub(new Decimal(0.1))
            if (player.L.heat.lt(100) )player.L.heat = player.L.heat.plus(new Decimal(0.03))
        }
        
        if (player.L.heat.gte(100)) {
        	player.L.status = new Decimal(1)
            player.L.a = new Decimal(1)
        }
    },
    layerShown(){ return hasUpgrade("S", 32) && inArea("main")},
    isActive(){return tmp[this.layer].layerShown},
    tabFormat: [
    	["row", [
    		"main-display", 
    		["display-image", "resources/leaficon.png", {"width": "50px", "height": "50px", "position": "relative", "bottom": "10px"}]
    	]],
         "resource-display",
	    ["display-text", function() { return "Your leaves has a boost of ×<em>"+format(tmp[this.layer].gainMult)+"</em>"}, { "color": "#32a852", "font-size": "16px"}],
    	"prestige-button",
        ["microtabs", "stuff"]
    ],
}),

addLayer("R", {
    name: "Researchers", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: -1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked() { return hasMilestone("ST", 1) },
	points: new Decimal(0),
	rpr: new Decimal(1),
	rps() { return player.R.rpr.times(player.R.points) }
    }},
    color: "#7240b3",
    requires: new Decimal(5), // Can be a function that takes requirement increases into account
    resource: "researchers", // Name of prestige currency
    baseResource: "leaves", // Name of resource prestige is based on
    baseAmount() {return player.L.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    automate() {
	gain5 = new Decimal(1)
	if ( hasUpgrade("R", 12) ) gain5 = gain5.times(2)
	if ( hasUpgrade("R", 15) ) gain5 = gain5.times(upgradeEffect("R", 15))
	if ( hasUpgrade("R", 21) ) gain5 = gain5.times(2)
	if ( hasUpgrade("R", 22) ) gain5 = gain5.times(2)
	if ( hasUpgrade("S", 62) ) gain5 = gain5.times(2)
	if ( hasUpgrade("F", 41) ) gain5 = gain5.times(100)
	player.R.rpr = new Decimal(0).plus(gain5)
	player.R.rps = player.R.rpr.times(player.R.points)
	player.T.points = player.T.points.plus(player.R.rps)
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
	if ( hasUpgrade("R", 14) ) mult = mult.times(upgradeEffect("R", 14))
	if(hasMilestone("C", 1))mult=mult.times(10)
	if( player.L.status.eq(1) ) {
		        mult = mult.times(0.5)
	        }
	        if( player.L.status.eq(2) ) {
		        mult = mult.times(2)
	        } // status goes first
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {
            key: "r", // What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" for holding down ctrl.
            description: "r: reset your leaves for researchers", // The description of the hotkey that is displayed in the game's How To Play tab
            onPress() { if (player.R.unlocked) if (canReset(this.layer)) doReset("R") },
        }
    ],
    upgrades: {
	    11: {
		title: "Artifical Wood",
		description: "Wood upgrades don't reset",
		cost: new Decimal(1),
		unlocked() { return player.R.points.gte(new Decimal(2)) || hasUpgrade("R", 11) }
	    },
	    12: {
		title: "Re-searching",
		description: "Double research gain from researchers and unlock more wood upgrades",
		cost: new Decimal(3),
		unlocked() { return hasUpgrade("R", 11) }
	    },
	    13: {
		title: "Serious Work",
		description: "Researchers boost wood",
		cost: new Decimal(5),
		unlocked() { return hasUpgrade("R", 12) },
		effect() { 
			return player.R.points.plus(1.5).pow(0.45)
		},
		effectDisplay() { return format(upgradeEffect("R", 13))+"x" },
		tooltip: "(x+1)^0.45"
	    },
	    14: {
		title: "Discover the BIG BANG",
		description: "Passively gain 10% of sticks, Researchers boost itself and unlock more leaf upgrades",
		cost: new Decimal(7),
		unlocked() { return hasUpgrade("R", 13) },
		effect() { 
			return player.R.points.plus(2).log10().pow(0.4).plus(1)
		},
		effectDisplay() { return format(upgradeEffect("R", 14))+"x" },
		tooltip: "((log(x+2))^0.4)+1"
	    },
	    15: {
		fullDisplay() {  
			return "<font size=-1.5><b>Tree Knowledge</b></font> <br>Boost research per researcher by tree centimeters</br> <br>((log(x+2))^0.4)+1</br> <br>Cost: 20 researchers, 10,000 research</br>"
		},
		canAfford() { return player.R.points.gte(new Decimal(20)) && player.T.points.gte(new Decimal(10000)) },
		unlocked() { return hasUpgrade("R", 14) },
		pay() {
			player.R.points = player.R.points.sub(20);
			player.T.points = player.T.points.sub(10000)
		},
		effect() {
			return player.TR.points.plus(2).log10().pow(0.4).plus(1)
		},
		tooltip() { return "Effect: "+format(player.TR.points.plus(2).log10().pow(0.4).plus(1))+"x" }
	    },
	21: {
		title: "Paid Workers",
		description: "Research per researcher is doubled",
		cost: new Decimal(100),
		unlocked() { return hasMilestone("F", 1) },
		currencyDisplayName: "cash",
		currencyInternalName: "cash",
		currencyLayer: "M",
	    },
	22: {
		title: "Double Pay",
		description: "Research per researcher is doubled again",
		cost: new Decimal(3000),
		unlocked() { return hasUpgrade("R", 21) }
	    },
	23: {
		title: "Chemical Modification",
		description: "Unlock more tier 2 stick upgrades, double EXP gain",
		cost: new Decimal(4000),
		unlocked() { return hasUpgrade("R", 22) }
	    },
	24: {
		title: "Saving Energy",
		description: "Unlock more battery upgrades, x5 stick gain",
		cost: new Decimal(150),
		unlocked() { return hasUpgrade("R", 23) },
		currencyDisplayName: "cash",
		currencyInternalName: "cash",
		currencyLayer: "M",
	    },
    },
    layerShown(){ return hasMilestone("ST", 1) && inArea("main")},
    isActive(){return tmp[this.layer].layerShown},
    tabFormat: [
    	["row", [
    		"main-display", 
    		["display-image", "resources/researchericon.png", {"width": "50px", "height": "50px", "position": "relative", "bottom": "10px"}]
    	]],
        "resource-display",
    	["display-text", function() { return "Your researchers are making "+format(player.R.rps)+" research per tick, where each researcher makes "+format(player.R.rpr)+" research." }],
        ["display-text", function() { return "Your researchers has a boost of ×<em>"+format(tmp[this.layer].gainMult)+"</em>"}, { "color": "#7240b3", "font-size": "16px"}],
	    "prestige-button",
	    "blank",
    	"upgrades"
    ],
    doReset(reset) {
		keep = []
		if ( hasUpgrade("CO", 18) ) keep.push("upgrades")
		if ( layers[reset].row > this.row ) layerDataReset("R", keep)
    }
}),

addLayer("TR", {
    name: "Tree", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "TR", // This appears on the layer's node. Default is the id with the first letter capitalized
    startData() { return {
        unlocked() { return hasMilestone("ST", 2) },
	points: new Decimal(1),
	sps: new Decimal(0.001),
	fert: new Decimal(0),
	seed: new Decimal(0)
    }},
    automate() {
	gain4 = new Decimal(0.001)
	if ( hasUpgrade("TR", 11) ) gain4 = gain4.times(2)
	if ( hasUpgrade("TR", 12) ) gain4 = gain4.times(2)
	if ( hasUpgrade("TR", 13) ) gain4 = gain4.times(2)
	player.TR.fert = player.TR.fert.plus(player.TR.seed)
	player.TR.sps = new Decimal(0).plus(gain4).plus(player.TR.fert)
	player.TR.points = player.TR.points.plus(player.TR.sps)
    },
    color: "#2f5e1a",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "centimeters", // Name of prestige currency
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
    buyables: {
    	11: {
        	cost: new Decimal(25),
		title: "Apply Fertilizer - 100 research",
        	display() { return "Fertilize the tree and get +0.0001 more centimeters per tick" },
		unlocked() { return hasUpgrade("TR", 12) },
        	canAfford() { return player.T.points.gte( new Decimal(100) ) },
		style: {
			transform: "translate(0px, -10px)"
		},
        	buy() {
            		player.T.points = player.T.points.sub(100)
            		setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
	    		player.TR.fert = player.TR.fert.plus(0.0001)
        	}
	},
	12: {
        	cost: new Decimal("1e6"),
		title: "Plant Seeds - 1,000,000 research",
        	display() { return "Plant a seed and get +1 more fertilizers per tick" },
		unlocked() { return hasUpgrade("TR", 14) },
        	canAfford() { return player.T.points.gte( new Decimal("1e6") ) },
		style: {
			transform: "translate(0px, -10px)"
		},
        	buy() {
            		player.T.points = player.T.points.sub("1e6")
            		setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
	    		player.TR.seed = player.TR.seed.plus(0.0001)
        	}
	}
    },
    upgrades: {
	    11: {
		title: "Faster Growth",
		description: "Double growth",
		cost: new Decimal(3),
	    },
	    12: {
		title: "Fertilizers",
		description: "Unlock fertilizers and double growth",
		cost: new Decimal(5),
		unlocked() { return hasUpgrade("TR", 11) }
	    },
	    13: {
		title: "Electree-cee-tree",
		description: "Unlock more battery upgrades and double growth",
		cost: new Decimal(50),
		unlocked() { return hasUpgrade("W", 31) }
	    },
	    14: {
		title: "PolyNomial",
		description: "Unlock seed buyable",
		cost: new Decimal(100),
		unlocked() { return hasUpgrade("TR", 13) }
	    }
    },
    layerShown() { return hasMilestone("ST", 2) && inArea("main")},
    isActive(){return tmp[this.layer].layerShown},
    tabFormat: [
	["display-text", function() { return "Your tree is "+format(player.TR.points)+" centimeters tall, and it is growing "+format(player.TR.sps)+" centimeters per tick." }],
    	["display-image", "resources/Tree.png"],
    	"blank",
	"buyables",
	"blank",
    	"upgrades"
    ]
}),

addLayer("TI", {
    name: "Tin", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "TI", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked(){return hasUpgrade("T", 33)},
	points: new Decimal(0),
	tinium: new Decimal(0),
    }},
    branches: ["B", ["F", 1, 5], "C" ],
    doReset(reset) {
	let keep = [];
	if (layers[reset].row > this.row) layerDataReset("TI", keep)
    },
    color: "#dfe3eb",
    requires: new Decimal(5), // Can be a function that takes requirement increases into account
    resource: "tin", // Name of prestige currency
    baseResource: "stone", // Name of resource prestige is based on
    baseAmount() {return player.ST.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {
            key: "t", // What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" for holding down ctrl.
            description: "t: reset your stone for tin", // The description of the hotkey that is displayed in the game's How To Play tab
            onPress() { if (player.TI.unlocked) if (canReset(this.layer)) doReset("TI") },
        }
    ],
    nodeStyle: {
	"border-radius": "25% / 25%",
	transform: "rotate(5deg)"
    },
    buyables: {
    	11: {
        	cost: new Decimal(100),
		title: "Tiniumify",
        	display() { return "Convert 1000 leaves and 100 tin into 1 tinium" },
        	canAfford() { return player.TI.points.gte(new Decimal(100)) && player.L.points.gte(new Decimal(1000)) },
		unlocked() { return false },
        	buy() {
			player.TI.points = player.TI.points.sub(100)
            		player.L.points = player.L.points.sub(1000)
            		setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
	    		player.TI.tinium = player.TI.tinium.plus(1)
        	}
	}
    },
    upgrades: {
	    11: {
		title: "Ore Power",
		description: "x10 sticks, wood and experience, x2 leaves, and unli access to tech tree and achievements",
		cost: new Decimal(1)
	    },
	    12: {
		title: "Tinland!",
		description: "Unlocks Recovery Layer (PERMANENT), Unlocks battery layer and tin boosts leaves.",
		cost: new Decimal(1),
		effect() {
			return player.TI.points.plus(1.5).pow(0.5)
		},
		effectDisplay() { return format(upgradeEffect("TI", 12))+"x" },
		tooltip: "(x+1.5)^0.5"
	    },
	    13: {
		title: "Tin Sticks n Batteries",
		description: "Double stick gain, and unlock more wood and battery upgrades, unlock more recoveries",
		cost: new Decimal(2),
		unlocked() { return hasChallenge("B", 11) }
	    }
    },
    layerShown(){return hasUpgrade("T", 33) && inArea("main")},
    isActive(){return tmp[this.layer].layerShown},
    tabFormat: [
    	["row", [
    		"main-display", 
    		["display-image", "resources/tinicon.png", {"width": "50px", "height": "50px", "position": "relative", "bottom": "10px"}]
    	]],
	["display-text", function() { if ( player.TI.tinium.gte(new Decimal(1)) ) return "You have "+format(player.TI.tinium)+" tinium" }],
	"prestige-button",
    	"blank",
    	"buyables",
    	"blank",
    	"upgrades"
    ],
    roundUpCost: true
}),

addLayer("RE", {
    name: "Recovery", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "RE", // This appears on the layer's node. Default is the id with the first letter capitalized
    startData() { return {
        unlocked() { return hasUpgrade("TI", 12) && !inChallenge("B", 12) && !inChallenge("B", 13) },
	points: new Decimal(1),
    }},
    color: "#ededed",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "jacorb", // Name of prestige currency
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    nodeStyle: {
	"border-radius": "10% / 10%",
    },
    row: "side", // Row the layer is in on the tree (0 is the first row)
    buyables: {
    	11: {
        	cost: new Decimal(1),
		title: "Get 10 tree centimeters for 1 researcher (Must have less than the currency purchased)",
        	display() { return "Recovery Buyable" },
        	canAfford() { return player.R.points.gte( new Decimal(1) ) && player.TR.points.lt( new Decimal(10) ) },
        	buy() {
            		setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
	    		player.TR.points = new Decimal(10)
        	},
		style: {
			"border-radius": "50%",
    		}
	},
	12: {
        	cost: new Decimal(1),
		title: "Get 3 leaves for 1 tin (Must have less than the currency purchased)",
        	display() { return "Recovery Buyable" },
        	canAfford() { return player.TI.points.gte( new Decimal(1) ) && player.L.points.lt( new Decimal(3) ) },
        	buy() {
            		setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
	    		player.L.points = new Decimal(3)
        	},
		style: {
			"border-radius": "50%",
    		}
	},
	13: {
        	cost: new Decimal(1),
		title: "Get 2 stone for 1 tin (Must have less than the currency purchased)",
        	display() { return "Recovery Buyable" },
        	canAfford() { return player.TI.points.gte( new Decimal(1) ) && player.ST.points.lt( new Decimal(2) ) },
        	buy() {
            		setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.ST.total = player.ST.total.plus(2)
	    		player.ST.points = new Decimal(2)
        	},
		style: {
			"border-radius": "50%",
    		}
	},
	14: {
        	cost: new Decimal(1),
		    title: "Get 10 researchers for 500 power (Must have less than the currency purchased)",
        	display() { return "Recovery Buyable" },
        	canAfford() { return player.B.points.gte( new Decimal(500) ) && player.R.points.lt( new Decimal(10) ) },
        	buy() {
            	setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
	    		player.R.points = new Decimal(10)
        	},
		    style: {
			    "border-radius": "50%",
    		},
            unlocked() {return hasUpgrade("TI", 13)}
	},
	21: {
        	cost: new Decimal(1),
		    title: "Get 10 leaves with fire stage 1 (Won't fetch currency)",
        	display() { return "Recovery Buyable" },
        	canAfford() { return player.F.points.gte(1) },
        	buy() {
            	setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
	    		player.L.points = player.L.points.plus(10)
        	},
		    style: {
			    "border-radius": "50%",
    		},
            unlocked() {return hasMilestone("F", 0)}
	},
	22: {
        	cost: new Decimal(1),
		    title: "Get row 1 stone upgrades with fire stage 1 (Must have atleast 1 not-bought row 1 stone upgrade)",
        	display() { return "Recovery Buyable" },
        	canAfford() { return player.F.points.gte(1) && !hasUpgrade("ST", 11) || !hasUpgrade("ST", 12) || !hasUpgrade("ST", 13) || !hasUpgrade("ST", 14) },
        	buy() {
            	setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
	    		if ( !hasUpgrade("ST", 11) ) player.ST.upgrades.push("11"); player.ST.total = player.ST.total.plus(2)
	            if ( !hasUpgrade("ST", 12) ) player.ST.upgrades.push("12"); player.ST.total = player.ST.total.plus(4)
	            if ( !hasUpgrade("ST", 13) ) player.ST.upgrades.push("13"); player.ST.total = player.ST.total.plus(5)
	            if ( !hasUpgrade("ST", 14) ) player.ST.upgrades.push("14"); player.ST.total = player.ST.total.plus(9)
        	},
		    style: {
			    "border-radius": "50%",
    		},
            unlocked() {return hasMilestone("F", 0)}
	},
	23: {
        	cost: new Decimal(1),
		    title: "Get 2000 researchers with 2 fire stages (Must have less than the currency purchased)",
        	display() { return "Recovery Buyable" },
        	canAfford() { return player.F.points.gte( new Decimal(2) ) && player.R.points.lt( new Decimal(2000) ) },
        	buy() {
            	setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
	    		player.R.points = new Decimal(2000)
        	},
		    style: {
			    "border-radius": "50%",
    		},
            unlocked() {return hasUpgrade("AD", 11)}
	},
	24: {
        	cost: new Decimal(1),
		    title: "Get 5 million leaves with 2 fire stages (Must have less than the currency purchased)",
        	display() { return "Recovery Buyable" },
        	canAfford() { return player.F.points.gte( new Decimal(2) ) && player.L.points.lt( 5000000 ) },
        	buy() {
            	setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
	    		player.L.points = new Decimal("5e6")
        	},
		    style: {
			    "border-radius": "50%",
    		},
            unlocked() {return hasAchievement("ACH", 75)}
	},
	31: {
        	cost: new Decimal(1),
		    title: "Get 250 cash with 1 fire stage (Must have less than the currency purchased)",
        	display() { return "Recovery Buyable" },
        	canAfford() { return player.F.points.gte( new Decimal(1) ) && player.M.cash.lt( 250 ) },
        	buy() {
            	setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
	    		player.M.cash = new Decimal(250)
        	},
		    style: {
			    "border-radius": "50%",
    		},
            unlocked() {return hasUpgrade("F", 31)}
	},
	32: {
        	cost: new Decimal(1),
		    title: "Get 2 fire stage with 1 coal (Must have less than the currency purchased)",
        	display() { return "Recovery Buyable" },
        	canAfford() { return player.C.points.gte( new Decimal(1) ) && player.F.points.lt( 2 ) },
        	buy() {
            	setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
	    		player.F.points = new Decimal(2)
	            player.F.total = new Decimal(2)
        	},
		    style: {
			    "border-radius": "50%",
    		},
            unlocked() {return hasMilestone("C", 0)}
	},
	33: {
        	cost: new Decimal(1),
		    title: "Get 2 tin with 1 coal (Must have less than the currency purchased)",
        	display() { return "Recovery Buyable" },
        	canAfford() { return player.C.points.gte( new Decimal(1) ) && player.TI.points.lt( 2 ) },
        	buy() {
            	setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
	    		player.TI.points = new Decimal(2)
        	},
		    style: {
			    "border-radius": "50%",
    		},
            unlocked() {return hasMilestone("C", 0)}
	},
    },
    layerShown() { return (hasUpgrade("TI", 12) || hasMilestone("C", 0) && !inChallenge("B", 12) && !inChallenge("B", 13)) && inArea("main") },
    isActive(){return tmp[this.layer].layerShown},
    tabFormat: [
	["display-text", function() { return "Welcome to the Recovery Layer, in here you will get some recovery buyables. Currency you use to buy will NOT be spent."}],
    	"blank",
	"buyables"
    ],
    tooltip: ""
}),

addLayer("B", {
    name: "Battery", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
    startData() { return {
        unlocked() { return hasUpgrade("TI", 12) },
        points: new Decimal(0),
        speed: new Decimal(0.1),
        cap: new Decimal(100),
        save: false,
    }},
    doReset(layer) {
    	if (layer == "M") player.B.points = new Decimal(0)
        if (layers[layer].row > this.row) layerDataReset("B")
    },
    branches: ["M"],
    bars: {
         bigBar: {
             direction: RIGHT,
             width: 500,
             height: 50,
             progress() { return player.B.points.div(player.B.cap) },
             fillStyle: {
             	"background-color": "#c9c36b"
             },
             borderStyle: {
             	"border-color": "#707070",
                 "border": "10px solid"
             }
         }
    },
    automate() {
	gain4 = new Decimal(0.1)
	gain4 = gain4.plus(getBuyableAmount("B", 11).times(0.02))
	gain4 = gain4.plus(getBuyableAmount("B", 13).times(0.04))
	if (hasUpgrade("B", 12)) gain4 = gain4.times(2)
	if (hasChallenge("B", 12)) gain4 = gain4.times(2)
	if (hasUpgrade("B", 22)) gain4 = gain4.times(2)
	if(hasMilestone("C", 0)) gain4 = gain4.times(3)
	if(hasMilestone("C", 1))gain4=gain4.times(5)
	if(hasUpgrade("B", 31))gain4=gain4.times(50)
	if(inChallenge("B", 21))gain4=gain4.pow(0.5)
	if(hasUpgrade("M", 21))gain4=gain4.times(upgradeEffect("M", 21))
	hat = new Decimal(100)
	hat = hat.plus(getBuyableAmount("B", 12).times(25))
	if (hasUpgrade("B", 11)) hat = hat.times(2)
	if (hasUpgrade("B", 13)) hat = hat.times(2)
	if (hasUpgrade("B", 14)) hat = hat.times(2)
	if (hasUpgrade("B", 21)) hat = hat.times(2)
	if (hasUpgrade("B", 23)) hat = hat.times(2)
	if(hasChallenge("B", 13)) hat = hat.times(2)
	if(hasMilestone("C", 0)) hat = hat.times(3)
	if(hasUpgrade("B", 31))hat=hat.times(10)
	if(inChallenge("B", 21))hat=hat.pow(0.5)
	if(hasUpgrade("M", 21))hat=hat.times(upgradeEffect("M", 21))
	player.B.cap = new Decimal(0).plus(hat)
	player.B.speed = new Decimal(0).plus(gain4)
	if (player.B.points.lt(player.B.cap) ) player.B.points = player.B.points.plus(player.B.speed)
    },
    microtabs: {
        stuff: {
            Upgrades: {
                content: [
                    "upgrades"
                ]
            },
            Challenges: {
                content: [
                    "challenges"
                ],
                unlocked() { return hasUpgrade("B", 12) }
            }
        }
    },
    color: "#c9c36b",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "power", // Name of prestige currency
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: "2", // Row the layer is in on the tree (0 is the first row)
    position: 1,
    challenges: {
        11: {
            name: "Broken Sticks",
            challengeDescription: "Perform a row 3 reset and every stick upgrade's effect will be halved, and wood layer won't unlock.",
            goalDescription: "Get 1000 experience",
            rewardDescription: "Unlock more stone, tin and tech tree upgrades",
            style: {
	              "border-radius": "5% / 5%"
            },
            onEnter() {
            	player.points = new Decimal(10)
                doReset("TI", true)
            },
            canComplete: function() {return player.points.gte(1000)}
        },
        12: {
            name: "Ineffective Learning",
            challengeDescription: "Reset sticks, wood and stick and wood upgrades, and divide experience, stick and wood gain by 100, disable recoveries",
            goalDescription: "Get 1M experience",
            rewardDescription: "Unlock the magnet layer, and double charge gain",
            style: {
	              "border-radius": "5% / 5%"
            },
            unlocked() {return hasUpgrade("B", 21)},
            onEnter() {
            	player.points = new Decimal(10),
                player.S.points = new Decimal(0),
                player.W.points = new Decimal(0),
                player.S.upgrades = [],
                player.W.upgrades = []
            },
            canComplete: function() {return player.points.gte("1e6")}
        },
        13: {
            name: "Tree Roots",
            challengeDescription: "Reset sticks, wood and stick and wood upgrades, and square root wood, sticks and experience, disable recoveries",
            goalDescription: "Get 1e9 experience",
            rewardDescription: "Double capacity and unlock fire stages",
            style: {
	              "border-radius": "5% / 5%"
            },
            unlocked() {return hasUpgrade("S", 41)},
            onEnter() {
            	player.points = new Decimal(10),
                player.S.points = new Decimal(0),
                player.W.points = new Decimal(0),
                player.S.upgrades = ["41"],
                player.W.upgrades = []
            },
            canComplete: function() {return player.points.gte("1e9")}
        },
        21: {
            name: "Power Outage",
            challengeDescription: "Reset power and buyables, charge and capacity are ^0.5",
            goalDescription: "Get 195 power",
            rewardDescription: "Unlock more battery upgrades",
            style: {
	              "border-radius": "5% / 5%"
            },
            unlocked() {return hasUpgrade("F", 42)},
            onEnter() {
            	player.B.points = new Decimal(0)
            	setBuyableAmount("B", 11, new Decimal(0))
            	setBuyableAmount("B", 12, new Decimal(0))
            	setBuyableAmount("B", 13, new Decimal(0))
            },
            canComplete: function() {return player.B.points.gte(195)}
        },
    },
    buyables: {
    	11: {
        	cost() {
                    return new Decimal(90).pow(new Decimal(1.04).pow(getBuyableAmount("B", 11)) )
            },
            style: {
	              "border-radius": "5% / 5%"
            },
		title() { return "Battery Charger - "+getBuyableAmount(this.layer, this.id) },
        	display() { return "Speed up the battery, which is adding to your charge gain by "+format(getBuyableAmount(this.layer, this.id).times(0.02))+"<br>Cost: "+format(this.cost())+" Power</br>"},
		unlocked() { return true},
        	canAfford() { return player.B.points.gte( this.cost() ) },
        	buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        	}
	},
	12: {
        	cost() {
                    return new Decimal(100).pow(new Decimal(1.04).pow(getBuyableAmount(this.layer, this.id)) )
            },
            style: {
	              "border-radius": "5% / 5%"
            },
		title() { return "Longer Battery - "+getBuyableAmount(this.layer, this.id) },
        	display() { return "Make your battery longer, which is adding to your capacity by "+format(getBuyableAmount(this.layer, this.id).times(25))+"<br>Cost: "+format(this.cost())+" Power</br>"},
		unlocked() { return true},
        	canAfford() { return player.B.points.gte( this.cost() ) },
        	buy() {
            	player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        	}
	},
	13: {
        	cost() {
                    return new Decimal(1000).pow(new Decimal(1.04).pow(getBuyableAmount(this.layer, this.id)) )
            },
            style: {
	              "border-radius": "5% / 5%"
            },
		title() { return "Faster Electricity - "+getBuyableAmount(this.layer, this.id) },
        	display() { return "Electricity is faster, which is adding to your charge gain by "+format(getBuyableAmount(this.layer, this.id).times(0.04))+"<br>Cost: "+format(this.cost())+" Power</br>"},
		unlocked() { return hasUpgrade("B", 14)},
        	canAfford() { return player.B.points.gte( this.cost() ) },
        	buy() {
            	player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        	}
	}
    },
    nodeStyle: {
	"border-radius": "10% / 10%",
	"width": "125px",
	"height": "50px"
    },
    upgrades: {
	    11: {
		title: "We love some power",
		description: "Double battery capacity",
		cost: new Decimal(175),
		style: {
	              "border-radius": "5% / 5%"
        }
        },
        12:{
		title: "Electrifying",
		description: "Unlock challenges and double charge gain",
		cost: new Decimal(400),
		unlocked() { return hasUpgrade("B", 11) },
		style: {
	              "border-radius": "5% / 5%"
        }
	    },
	    13:{
		title: "Fork and Outlet",
		description: "Double capacity",
		cost: new Decimal(600),
		unlocked() { return hasUpgrade("TI", 13) },
		style: {
	              "border-radius": "5% / 5%"
        }
	    },
	    14:{
		title: "Static Electricity",
		description: "Unlock another buyable and double capacity",
		cost: new Decimal(1250),
		unlocked() { return hasUpgrade("TR", 13) },
		style: {
	              "border-radius": "5% / 5%"
        }
	    },
	    21:{
		title: "Training",
		description: "Unlock another challenge and double capacity",
		cost: new Decimal(2000),
		unlocked() { return hasUpgrade("B", 14) },
		style: {
	              "border-radius": "5% / 5%"
        }
	    },
	    22:{
		title: "Electrified Sticks",
		description: "Double stick gain, and double charge gain.",
		cost: new Decimal(3000),
		unlocked() { return hasUpgrade("R", 24) },
		style: {
	              "border-radius": "5% / 5%"
        }
	    },
	    23:{
		title: "Energized Skill",
		description: "Double experience gain, double capacity",
		cost: new Decimal(5000),
		unlocked() { return hasUpgrade("B", 22) },
		style: {
	              "border-radius": "5% / 5%"
        }
	    },
	    24:{
		title: "Powered Sticks",
		description: "Sticks are boosted based on your power",
		cost: new Decimal(100000),
		unlocked() { return hasChallenge("B", 21) },
		style: {
	              "border-radius": "5% / 5%"
        },
        effect() {return player.B.points.plus(10000).pow(0.4)},
        effectDisplay() {return format(upgradeEffect(this.layer, this.id))+"x"},
        tooltip: "(x+10,000)^0.4"
	    },
	    31:{
		title: "Steam Generators",
		description: "x50 charge gain, x10 capacity",
		cost: new Decimal(125000),
		unlocked() { return hasChallenge("B", 21) },
		style: {
	              "border-radius": "5% / 5%"
        }
	    },
	    32:{
		title: "Experiencing Sparks",
		description: "Experience is boosted by your power",
		cost: new Decimal("1e6"),
		unlocked() { return hasChallenge("B", 21) },
		style: {
	              "border-radius": "5% / 5%"
        },
        effect() {return player.B.points.plus(625).sqrt()},
        effectDisplay() {return format(upgradeEffect(this.layer, this.id))+"x"},
        tooltip: "sqrt(x+625)"
	    },
	    33:{
		title: "NetMag",
		description: "Unlock more magnet upgrades",
		cost: new Decimal("1.25e6"),
		unlocked() { return hasChallenge("B", 21) },
		style: {
	              "border-radius": "5% / 5%"
        }
	    },
    },
    tooltip() { return format(player[this.layer].points)+"/"+format(player[this.layer].cap)+" power" },
    layerShown() { return hasUpgrade("TI", 12) && inArea("main")},
    isActive(){return tmp[this.layer].layerShown},
    tabFormat: [
    ["row", [
		["display-text", function() { return "Your battery is storing "+format(player[this.layer].points)+" power, and is getting charged "+format(player.B.speed)+" per tick, and has a maximum of "+format(player[this.layer].cap)+" power, which boosts experience gain by ×"+format(player.B.points.plus(15).log10().pow(0.5))}],
		["display-image", "resources/batteryicon.png", {"width": "50px", "height": "50px", "position": "relative", "bottom": "0px"}]
	]],
    "blank",
    ["bar", "bigBar"],
    "blank",
    "blank",
	"buyables",
	"blank",
    ["microtabs", "stuff"]
    ]
}),

addLayer("M", {
    name: "Magnets", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked(){return hasChallenge("B", 12) },
	points: new Decimal(0),
	
	cloth: new Decimal(0),
	plastic: new Decimal(0),
	box: new Decimal(0),
	spoon: new Decimal(0),
	bottle: new Decimal(0),
	att: new Decimal(0),
	best: new Decimal(0),
	cash: new Decimal(0)
    }},
    nodeStyle: {
    	"background": "linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(0,0,255,1) 100%)",
        "background-origin": "border-box"
    },
    doReset(reset) {
    	if (reset == "F") player.M.cash = new Decimal(0)
        if (layers[reset].row > this.row) layerDataReset("M")
    },
    microtabs: {
        stuff: {
            Upgrades: {
                content: [
                    "upgrades"
                ],
                unlocked() {return player.M.points.gte(2)}
            },
            Attraction: {
                content: [
                    ["display-text", function() {
                    	return "Here you can use your magnets to attract! (Holding also works)"
                        	
                    }],
                    "blank",
                    ["buyable", 11]
                ],
                unlocked() {return player.M.points.gte(1)}
            },
            Inventory: {
                content: [
                    ["display-text", function() { 
                    	if(player.M.bottle.gte(1))
                            return "You have "+format(player.M.bottle)+" bottles, which sell for "+format(player.M.bottle)+" cash."
                    }],
                    ["display-text", function() { 
                    	if(player.M.spoon.gte(1))
                            return "You have "+format(player.M.spoon)+" spoons, which sell for "+format(player.M.spoon.times(2))+" cash."
                    }],
                    ["display-text", function() { 
                    	if(player.M.box.gte(1))
                            return "You have "+format(player.M.box)+" boxes, which sell for "+format(player.M.box.times(4))+" cash."
                    }],
                    ["display-text", function() { 
                    	if(player.M.plastic.gte(1))
                            return "You have "+format(player.M.plastic)+" plastic, which sell for "+format(player.M.plastic.times(8))+" cash."
                    }],
                    ["display-text", function() { 
                    	if(player.M.cloth.gte(1))
                            return "You have "+format(player.M.cloth)+" cloth, which sell for "+format(player.M.cloth.times(16))+" cash."
                    }],
                    ["buyable", 12]
                ],
                unlocked() {return player.M.points.gte(1)}
            },
            Shop: {
                content: [
                	["row", [
                 	   ["display-text", function() { return "You have "+format(player.M.cash)+" cash" }],
                 	   ["display-image", "resources/cashicon.png", {"width": "50px", "height": "50px", "position": "relative", "bottom": "0px"}]
                	]],
                    ["row", [ ["buyable", 13], ["buyable", 14], ["buyable", 15] ] ]
                ],
                unlocked() {return player.M.points.gte(1)}
            }
        }
    },
    color: "#7303fc",
    requires: new Decimal(500), // Can be a function that takes requirement increases into account
    resource: "magnets", // Name of prestige currency
    baseResource: "power", // Name of resource prestige is based on
    baseAmount() {return player.B.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {
            key: "m", // What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" for holding down ctrl.
            description: "m: reset your power for magnets", // The description of the hotkey that is displayed in the game's How To Play tab
            onPress() { if (player.M.unlocked) if (canReset(this.layer)) doReset("M") },
        }
    ],
    resetDescription: "Create ",
    buyables: {
    	    11: { // Attraction Button
            	cost: new Decimal(2500),
		        title: "Attract",
            	display() { return "Attract from a random spot for a chance to get an object" },
            	canAfford() { return true },
            	buy() {
            	    if (Math.floor( Math.random() * 17) == 16 && hasUpgrade("M", 13) ) {
			            player.M.cloth = player.M.cloth.plus(1)
			            player.M.att = new Decimal(5)
			            console.log("cloth")
			            console.log(player.M.att)
			        }
            	    else if (Math.floor( Math.random() * 9) == 8 && hasUpgrade("M", 13) ) {
			            player.M.plastic = player.M.plastic.plus(1)
			            player.M.att = new Decimal(4)
			            console.log("plastic")
			            console.log(player.M.att)
			        }
			        else if (Math.floor( Math.random() * 5) == 4) {
			            player.M.box = player.M.box.plus(1)
			            player.M.att = new Decimal(3)
			            console.log("box")
			            console.log(player.M.att)
			        }
			        else if (Math.floor(Math.random() * 3) == 2 ) {
			            player.M.spoon = player.M.spoon.plus(1)
			            player.M.att = new Decimal(2)
			            console.log("spoon")
			            console.log(player.M.att)
			        }
			        else
			            player.M.bottle = player.M.bottle.plus(1) // amt
			            player.M.att = new Decimal(1) // id
			            console.log(Math.floor(Math.random() * 3))
            	},
                style: {
	              "background": "linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(0,0,255,1) 100%)",
	              "background-origin": "border-box",
	              "border-radius": "0%"
                }
	        },
            12: { // Sell All
            	cost: new Decimal(2500),
		        title: "Sell All",
            	display() { 
            	    let lol = player.M.bottle.plus(player.M.spoon.times(2).plus(player.M.box.times(4).plus(player.M.plastic.times(8).plus(player.M.cloth.times(16)))))
                    if(hasUpgrade("M", 12)) lol = lol.times(upgradeEffect("M", 12))
                    if(hasMilestone("C", 0)) lol = lol.times(3)
                    if(hasMilestone("F", 2)) lol = lol.times(new Decimal(5).pow(milestoneLength("F")-2))
                    return "Sell your objects which gives you "+format(lol)+" cash."},
            	canAfford() { return true },
            	buy() {
            	    let smth = player.M.bottle.plus(player.M.spoon.times(2).plus(player.M.box.times(4).plus(player.M.plastic.times(8).plus(player.M.cloth.times(16)))))
                    if(hasUpgrade("M", 12)) smth = smth.times(upgradeEffect("M", 12)).plus(1)
                    if(hasMilestone("C", 0)) smth = smth.times(3)
                    if(hasMilestone("F", 2)) smth = smth.times(new Decimal(5).pow(milestoneLength("F")-2))
                    player.M.cash = player.M.cash.plus(smth)
			        player.M.bottle = new Decimal(0)
			        player.M.spoon = new Decimal(0)
			        player.M.box = new Decimal(0)
			        player.M.plastic = new Decimal(0)
			        player.M.cloth = new Decimal(0)
            	},
                style: {
	              "background": "linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(0,0,255,1) 100%)",
	              "background-origin": "border-box",
	              "border-radius": "0%"
                }
	        },
	        13: {
        	cost() {
                    return new Decimal(25).pow(new Decimal(1.04).pow(getBuyableAmount(this.layer, this.id)) )
            },
            style: {
	              "background": "linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(0,0,255,1) 100%)",
	              "background-origin": "border-box",
                },
		title() { return "Attracted EXP - "+getBuyableAmount(this.layer, this.id)},
        	display() { return "Attract stray EXP, which is multiplying your experience gain by ×"+format(getBuyableAmount(this.layer, this.id).times(0.1).plus(1))+"<br>Cost: "+format(this.cost())+" Cash</br>"},
		unlocked() { return true},
        	canAfford() { return player.M.cash.gte( this.cost() ) },
        	buy() {
            	player[this.layer].cash = player[this.layer].cash.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        	}
	},
	14: {
        	cost() {
                    return new Decimal(50).pow(new Decimal(1.04).pow(getBuyableAmount(this.layer, this.id)) )
            },
            style: {
	              "background": "linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(0,0,255,1) 100%)",
	              "background-origin": "border-box"
                },
		title() { return "Magnetized Sticks - "+getBuyableAmount(this.layer, this.id)},
        	display() { return "Magnetize sticks, which is multiplying stick gain by ×"+format(getBuyableAmount(this.layer, this.id).times(0.1).plus(1))+"<br>Cost: "+format(this.cost())+" Cash</br>"},
		unlocked() { return hasUpgrade("M", 11) },
        	canAfford() { return player.M.cash.gte( this.cost() ) },
        	buy() {
            	player[this.layer].cash = player[this.layer].cash.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        	}
	},
	15: {
        	cost() {
                    return new Decimal(500).pow(new Decimal(1.04).pow(getBuyableAmount(this.layer, this.id)) )
            },
            style: {
	              "background": "linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(0,0,255,1) 100%)",
	              "background-origin": "border-box",
                },
		title() { return "Red N' Blue - "+getBuyableAmount(this.layer, this.id)},
        	display() { return "Color wood red and blue, which is multiplying wood by ×"+format(getBuyableAmount(this.layer, this.id).times(0.1).plus(1))+"<br>Cost: "+format(this.cost())+" Cash</br>"},
		unlocked() { return hasUpgrade("M", 13) },
        	canAfford() { return player.M.cash.gte( this.cost() ) },
        	buy() {
            	player[this.layer].cash = player[this.layer].cash.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        	}
	},
    },
    upgrades: {
	    11: {
		title: "Magnetricting",
		description: "Unlock more shop buyables",
		cost: new Decimal(1),
		unlocked() {return player.M.points.gte(2)}
	    },
	    12: {
		title: "Cash grows on trees",
		description: "Tree centimeters boost cash gained from selling",
		cost: new Decimal(75),
		currencyDisplayName: "cash",
		currencyInternalName: "cash",
		currencyLayer: "M",
		unlocked() {return hasUpgrade(this.layer, 11)},
		effect() { return player.TR.points.plus(1).log10().pow(0.2) },
		effectDisplay() { return format(upgradeEffect("M", 12).plus(1))+"x" },
		tooltip: "log(x+1)^0.2"
	    },
	    13: {
		title: "Monopoly",
		description: "Unlock more shop buyables and unlock more objects",
		cost: new Decimal(250),
		currencyDisplayName: "cash",
		currencyInternalName: "cash",
		currencyLayer: "M",
		unlocked() {return hasUpgrade(this.layer, 12)}
	    },
	    14: {
		title: "The end of the beginning",
		description: "Unlock more stick upgrades",
		cost: new Decimal(5),
		currencyDisplayName: "cloth",
		currencyInternalName: "cloth",
		currencyLayer: "M",
		unlocked() {return hasUpgrade(this.layer, 13)}
	    },
	    21: {
		title: "Bottled Power",
		description: "Boost both charge gain and capacity based on your bottles",
		cost: new Decimal(6),
		unlocked() {return hasUpgrade("B", 33)},
		effect() { return player.M.bottle.plus(10).sqrt() },
		effectDisplay() { return format(upgradeEffect("M", 21).plus(1))+"x" },
		tooltip: "sqrt(x+10)"
	    }
    },
    layerShown(){return hasChallenge("B", 12) && inArea("main")},
    isActive(){return tmp[this.layer].layerShown},
    tabFormat: [
    	["row", [
   	 	"main-display",
   	 	["display-image", "resources/magneticon.png", {"width": "50px", "height": "50px", "position": "relative", "bottom": "10px"}]
    	]],
        "resource-display",
	    "prestige-button",
    	"blank",
    	["microtabs", "stuff"]
    ]
}),

addLayer("F", {
    name: "Fire Stages", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "F", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: -1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked() { return hasChallenge("B", 13) },
	points: new Decimal(0),
	total: new Decimal(0),
	fp: new Decimal(0)
    }},
    branches: ["C"],
    microtabs: {
        stuff: {
            Milestones: {
                content: [
                    "milestones"
                ],
                unlocked() {return player.M.points.gte(2)}
            },
            Sacrifice: {
                content: [
                    ["display-text", function() {
                    	return "Sacrifice your tin for a fire point."
                    }],
                    ["row", [
                 	   ["display-text", function() { return "You have <span style='text-shadow: 0px 0px 10px red'>"+player.F.fp+"</span> fire points" }, {"color": "red"} ],
                 	   ["display-image", "resources/firepointicon.png", {"width": "50px", "height": "50px", "position": "relative", "bottom": "0px"}]
                	]],
                    "blank",
                    ["buyable", 11],
                    "blank",
                    "upgrades"
                ],
                unlocked() {return player.F.points.gte(2)}
            },
        }
    },
    color: "#e03a3a",
    requires: new Decimal(500), // Can be a function that takes requirement increases into account
    resource: "fire stages", // Name of prestige currency
    baseResource: "cash", // Name of resource prestige is based on
    baseAmount() {return player.M.cash}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
    	exp = 1.5
        return exp
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {
            key: "f", // What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" for holding down ctrl.
            description: "f: reset your cash for fire stages", // The description of the hotkey that is displayed in the game's How To Play tab
            onPress() { if (player.F.unlocked) if (canReset(this.layer)) doReset("F") },
        }
    ],
    buyables: {
    	11: {
        	cost: new Decimal(3),
            style: {
	              "border-radius": "25%",
	              "height": "125px",
	              "width": "175px",
	              "border": "5px solid",
	              "border-color": "rgba(0, 0, 0, 0.125)"
                },
		title() { return "Sacrifice for +1 fire point"},
        	display() { return "Req: "+player.TI.points+"/3 tin"},
        	canAfford() { return player.TI.points.gte(3) },
        	buy() {
            	player.TI.points = new Decimal(0)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.F.fp = player.F.fp.plus(1)
        	}
	},
	},
	upgrades: {
		11: {
		    title: "Fahrenheit Sticks",
		    description: "x10 sticks",
		    cost: new Decimal(1),
		    style: {
			    "border-radius": "50%"
			},
			currencyDisplayName: "fire points",
		    currencyInternalName: "fp",
		    currencyLayer: "F"
	    },
	    12: {
		    title: "Red Hot Sticks",
		    description: "x100 sticks",
		    cost: new Decimal(2),
		    style: {
			    "border-radius": "50%"
			},
			currencyDisplayName: "fire points",
		    currencyInternalName: "fp",
		    currencyLayer: "F",
		    unlocked(){return hasMilestone("F", 5)}
	    },
	    21: {
		    title: "Volcanic Experience",
		    description: "x10 experience",
		    cost: new Decimal(1),
		    style: {
			    "border-radius": "50%"
			},
			currencyDisplayName: "fire points",
		    currencyInternalName: "fp",
		    currencyLayer: "F"
	    },
	    22: {
		    title: "Molten Experience",
		    description: "x100 experience",
		    cost: new Decimal(2),
		    style: {
			    "border-radius": "50%"
			},
			currencyDisplayName: "fire points",
		    currencyInternalName: "fp",
		    currencyLayer: "F",
		    unlocked(){return hasMilestone("F", 5)}
	    },
	    31: {
		    title: "Scorching Wood",
		    description: "x10 wood, more recoveries!!",
		    cost: new Decimal(1),
		    style: {
			    "border-radius": "50%"
			},
			unlocked() { return hasAchievement("ACH", 75) },
			currencyDisplayName: "fire points",
		    currencyInternalName: "fp",
		    currencyLayer: "F"
	    },
	    32: {
		    title: "Solar Wood",
		    description: "x100 wood",
		    cost: new Decimal(2),
		    style: {
			    "border-radius": "50%"
			},
			currencyDisplayName: "fire points",
		    currencyInternalName: "fp",
		    currencyLayer: "F",
		    unlocked(){return hasMilestone("F", 5)}
	    },
	    41: {
		    title: "Burning Speed",
		    description: "x100 research per researcher, unlock new tech",
		    cost: new Decimal(1),
		    style: {
			    "border-radius": "50%"
			},
			unlocked() { return hasUpgrade("F", 31) },
			currencyDisplayName: "fire points",
		    currencyInternalName: "fp",
		    currencyLayer: "F"
	    },
	    42: {
		    title: "Fork and Volcano",
		    description: "Unlock new battery challenges",
		    cost: new Decimal(2),
		    style: {
			    "border-radius": "50%"
			},
			currencyDisplayName: "fire points",
		    currencyInternalName: "fp",
		    currencyLayer: "F",
		    unlocked(){return hasMilestone("F", 5)}
	    },
	},
    milestones: {
    	0: {
        	requirementDescription: "Fire Stage 1",
        	effectDescription: "Unlock tier 2 stick upgrades, more recoveries",
        	done() { return player.F.points.gte(1) }
    	},
        1: {
        	requirementDescription: "Fire Stage 2",
        	effectDescription: "Unlock sacrifice, more researcher upgrades",
        	done() { return player.F.points.gte(2) && hasUpgrade("AD", 11) },
            unlocked() { return hasUpgrade("AD", 11) }
    	},
    	2: {
        	requirementDescription: "Fire Stage 3",
        	effectDescription() { return "x5 cash every milestone after this starting here<br>Currently: "+format(Decimal.max(new Decimal(5).pow(milestoneLength("F")-2), new Decimal(1)))+"x"},
        	done() { return player.F.points.gte(3) && hasUpgrade("CO", 21) },
            unlocked() { return hasUpgrade("CO", 21) }
    	},
    	3: {
        	requirementDescription: "Fire Stage 4",
        	effectDescription() { return "x100 experience"},
        	done() { return player.F.points.gte(4) && hasUpgrade("CO", 21) },
            unlocked() { return hasUpgrade("CO", 21) }
    	},
    	4: {
        	requirementDescription: "Fire Stage 5",
        	effectDescription() { return "x100 sticks"},
        	done() { return player.F.points.gte(5) && hasMilestone("C", 1) },
            unlocked() { return hasMilestone("C", 1) }
    	},
    	5: {
        	requirementDescription: "Fire Stage 6",
        	effectDescription() { return "Unlock new sacrifice upgrades"},
        	done() { return player.F.points.gte(6) && hasMilestone("C", 1) },
            unlocked() { return hasMilestone("C", 1) }
    	},
    },
    resetDescription: "Evolve for ",
    layerShown(){ return hasChallenge("B", 13) && inArea("main")},
    isActive(){return tmp[this.layer].layerShown},
    tabFormat: [
    	["row", [
    		["display-text", function() { return "You are on Fire Stage <em style='text-shadow: 0px 0px 10px red'>"+player.F.points+"</em>"}, { "color": "red", "font-size": "32px"}],
    		["display-image", "resources/fireicon.png", {"width": "50px", "height": "50px", "position": "relative", "bottom": "0px"}]
    	]],
    	"resource-display",
	    "prestige-button",
	    "blank",
	    ["microtabs", "stuff"]
    ],
    tooltip() { return "Fire Stage "+player.F.points },
    nodeStyle: {
    	background: "radial-gradient(circle, rgba(255,255,0,1) 0%, rgba(255,0,0,1) 100%)",
    	"background-origin": "border-box"
    },
}),

addLayer("AD", {
    name: "Antimatter Dimensions", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "AD", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked() { return hasUpgrade("S", 43) },
	    points: new Decimal(0),
	    best: new Decimal(0),
	    tick: new Decimal(1),
	    one: new Decimal(0),
	    onem: new Decimal(1),
	    two: new Decimal(0),
	    twom: new Decimal(1),
	    threem: new Decimal(1),
	    fourm: new Decimal(1),
	    fivem: new Decimal(1),
	    sixm: new Decimal(1),
	    sevenm: new Decimal(1),
	    eightm: new Decimal(1),
	    cap: new Decimal(2), // get tickspeed hardcapped
	    ant: new Decimal("2e8"),
	    soft: new Decimal("2ee8"),
	    reload: false,
	    sacmult: new Decimal(1)
    }},
    nodeStyle: {
    	background: "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(0,0,0,1) 100%)",
    	"background-origin": "border-box",
        width: "120px",
        height: "120px",
        "font-size": "60px"
    },
    color: "#ffffff",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "antimatter", // Name of prestige currency
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    calculateAnti() { // Calculate antimatter gain (runs at 30 milli)
        onem = new Decimal(1) // one multiplier
        if ( hasAchievement("AD", 14) ) onem = onem.times(player.points.plus(1).log10().pow(0.1))
        if (getBuyableAmount("AD", 22).gte(1)) onem = onem.times(new Decimal(2).pow(getBuyableAmount("AD", 22)))
        twom = new Decimal(1) // two multi
        if (getBuyableAmount("AD", 22).gte(2)) twom = twom.times(new Decimal(2).pow(getBuyableAmount("AD", 22).sub(1)))
        threem = new Decimal(1) // three multi
        if (getBuyableAmount("AD", 22).gte(3)) threem = threem.times(new Decimal(2).pow(getBuyableAmount("AD", 22).sub(2)))
        fourm = new Decimal(1) // four multi
        if (getBuyableAmount("AD", 22).gte(4)) fourm = fourm.times(new Decimal(2).pow(getBuyableAmount("AD", 22).sub(3)))
        fivem = new Decimal(1) // five multi
        if (getBuyableAmount("AD", 22).gte(5)) fivem = fivem.times(new Decimal(2).pow(getBuyableAmount("AD", 22).sub(4)))
        sixm = new Decimal(1) // six multi
        if (getBuyableAmount("AD", 22).gte(6)) sixm = sixm.times(new Decimal(2).pow(getBuyableAmount("AD", 22).sub(5)))
        sevenm = new Decimal(1) // seven multi
        if (getBuyableAmount("AD", 22).gte(7)) sevenm = sevenm.times(new Decimal(2).pow(getBuyableAmount("AD", 22).sub(6)))
        eightm = new Decimal(1) // eight multi
        if (getBuyableAmount("AD", 22).gte(8)) eightm = eightm.times(new Decimal(2).pow(getBuyableAmount("AD", 22).sub(7)))
        eightm = eightm.times(player.AD.sacmult) //sacmult 8th
        player.AD.onem = onem // set display onem
        player.AD.twom = twom // display twom
        player.AD.threem = threem // display threem
        player.AD.fourm = fourm // display fourm
        player.AD.fivem = fivem // display fivem
        player.AD.sixm = sixm // display sixm
        player.AD.sevenm = sevenm // display sevenm
        player.AD.eightm = eightm // display eightm
    	gain = new Decimal(1) // Antimatter per second
        one = new Decimal(0) // 1st dimensions per second
        two = new Decimal(0) // 2nd dimensions per second
        three = new Decimal(0) // 3rd dimensions per second
        four = new Decimal(0) // 4th dimensions per second
        five = new Decimal(0) // 5th dimensions per second
        six = new Decimal(0) // 6th dimensions per second
        seven = new Decimal(0) // 7th dimensions per second
        one = one.plus(getBuyableAmount("AD", 12).times(0.1)) // Dim 1 polynomial by dim 2
        two = two.plus(getBuyableAmount("AD", 13).times(0.1)) // Dim 2 polynomial by dim 3
        three = three.plus(getBuyableAmount("AD", 14).times(0.1)) // Dim 3 polynomial by dim 4
        four = four.plus(getBuyableAmount("AD", 15).times(0.1)) // Dim 4 polynomial by dim 5
        five = five.plus(getBuyableAmount("AD", 16).times(0.1)) // Dim 5 polynomial by dim 6
        six = six.plus(getBuyableAmount("AD", 17).times(0.1)) // Dim 6 polynomial by dim 7
        seven = seven.plus(getBuyableAmount("AD", 18).times(0.1)) // Dim 7 polynomial by dim 8
        gain = gain.plus(getBuyableAmount("AD", 11).times(onem)) // Dim 1 * One multi
        one = one.times(twom) // Dim 2 boost to one
        two = two.times(threem) // Dim 3 boost to two
        three = three.times(fourm) // Dim 4 boost to three
        four = four.times(fivem) // Dim 5 boost to four
        five = five.times(sixm) // Dim 6 boost to five
        six = six.times(sevenm) // Dim 7 boost to six
        seven = seven.times(eightm) // Dim 8 boost to seven
        gain = gain.times(player.AD.tick) // tickspeed
        one = one.times(player.AD.tick) // tickspeed
        two = two.times(player.AD.tick) // tickspeed
        three = three.times(player.AD.tick) // tickspeed
        four = four.times(player.AD.tick) // tickspeed
        five = five.times(player.AD.tick) // tickspeed
        six = six.times(player.AD.tick) // tickspeed
        seven = seven.times(player.AD.tick) // tickspeed
        if(hasAchievement("AD", 25)) gain = gain.times(10) // adch11 boost
        onereal = one.div(30) // divide
        tworeal = two.div(30) // divide
        threereal = three.div(30) // divide
        fourreal = four.div(30) // divide
        fivereal = five.div(30) // divide
        sixreal = six.div(30) // divide
        sevenreal = seven.div(30) // divide
        real = gain.div(30) // Divide by 30 mills so its actually seconds.
        
        let ant = new Decimal("2e8")
        let soft = new Decimal("2ee8")
        if(hasUpgrade("AD", 12)) ant = new Decimal("2e16")
        if(hasUpgrade("AD", 14)) ant = new Decimal("2ee16")
        if(hasUpgrade("AD", 14)) soft = new Decimal("2e16")
        if(hasUpgrade("AD", 21))soft=new Decimal("2e200")
        player.AD.ant = ant
        player.AD.soft = soft
        
        if(player.AD.points.gte(soft)) real = real.pow(0.8)
        if(player.AD.points.gte(soft)) gain = gain.pow(0.8)
        
        if( tmp.AD.layerShown ) if(player.AD.points.lt(ant)) player.AD.points = player.AD.points.plus(real) // Add antimatter
        if(player.AD.points.lt(player.AD.ant)) setBuyableAmount(this.layer, 11, getBuyableAmount(this.layer, 11).plus(onereal))
        if(player.AD.points.lt(player.AD.ant)) setBuyableAmount(this.layer, 12, getBuyableAmount(this.layer, 12).plus(tworeal))
        if(player.AD.points.lt(player.AD.ant)) setBuyableAmount(this.layer, 13, getBuyableAmount(this.layer, 13).plus(threereal))
        if(player.AD.points.lt(player.AD.ant)) setBuyableAmount(this.layer, 14, getBuyableAmount(this.layer, 14).plus(fourreal))
        if(player.AD.points.lt(player.AD.ant)) setBuyableAmount(this.layer, 15, getBuyableAmount(this.layer, 15).plus(fivereal))
        if(player.AD.points.lt(player.AD.ant)) setBuyableAmount(this.layer, 16, getBuyableAmount(this.layer, 16).plus(sixreal))
        if(player.AD.points.lt(player.AD.ant)) setBuyableAmount(this.layer, 17, getBuyableAmount(this.layer, 17).plus(sevenreal))
        return gain
    },
    news: "test",
    buyables: {
    	11: { // Dim 1
        	cost() {
                    return new Decimal(10).plus(getBuyableAmount(this.layer, this.id).times(15))
            },
            style: {
	              "width": "125px",
	              "height": "75px",
	              "border-radius": "0%"
                },
		title() { return "1st Dimension"},
        	display() { return "Cost: "+format(this.cost())+" Antimatter"},
        	canAfford() { return player.AD.points.gte( this.cost() ) },
        	buy() {
            	let first = new Decimal(10)
                let exp = new Decimal(15)
                let most = first.plus(getBuyableAmount(this.layer, this.id).times(exp))
                let max = player[this.layer].points.div(most).floor()
                player[this.layer].points = player[this.layer].points.sub(most)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(max))
        	}
	},
	12: { // Dim 2
        	cost() {
                    return new Decimal(100).plus(getBuyableAmount(this.layer, this.id).times(150))
            },
            unlocked() {return hasAchievement(this.layer, 11)},
            style: {
	              "width": "125px",
	              "height": "75px",
	              "border-radius": "0%"
                },
		title() { return "2nd Dimension"},
        	display() { return "Cost: "+format(this.cost())+" Antimatter"},
        	canAfford() { return player.AD.points.gte( this.cost() ) },
        	buy() {
            	let first = new Decimal(100)
                let exp = new Decimal(150)
                let most = first.plus(getBuyableAmount(this.layer, this.id).times(exp))
                let max = player[this.layer].points.div(most).floor()
                player[this.layer].points = player[this.layer].points.sub(most)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(max))
                setBuyableAmount(this.layer, 11, new Decimal(0))
        	}
	},
	13: { // Dim 3
        	cost() {
                    return new Decimal(1000).plus(getBuyableAmount(this.layer, this.id).times(1500))
            },
            unlocked() {return hasAchievement(this.layer, 12)},
            style: {
	              "width": "125px",
	              "height": "75px",
	              "border-radius": "0%"
                },
		title() { return "3rd Dimension"},
        	display() { return "Cost: "+format(this.cost())+" Antimatter"},
        	canAfford() { return player.AD.points.gte( this.cost() ) },
        	buy() {
            	let first = new Decimal(1000)
                let exp = new Decimal(1500)
                let most = first.plus(getBuyableAmount(this.layer, this.id).times(exp))
                let max = player[this.layer].points.div(most).floor()
                player[this.layer].points = player[this.layer].points.sub(most)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(max))
                setBuyableAmount(this.layer, 11, new Decimal(0))
                setBuyableAmount(this.layer, 12, new Decimal(0))
        	}
	},
	14: { // Dim 4
        	cost(x) {
                    return new Decimal(10000).times(new Decimal(hasUpgrade("AD", 13) ? "2" : "5e9").pow(x))
            },
            unlocked() {return hasAchievement(this.layer, 15)},
            style: {
	              "width": "125px",
	              "height": "75px",
	              "border-radius": "0%"
                },
		title() { return "4th Dimension"},
        	display() { return "Cost: "+format(this.cost())+" Antimatter"},
        	canAfford() { return player.AD.points.gte( this.cost() ) },
        	buy() {
            	let first = new Decimal(10000)
                let exp = hasUpgrade("AD", 13) ? new Decimal("2") : new Decimal("5e9")
                let max = Decimal.affordGeometricSeries(player.AD.points, 10000, exp, getBuyableAmount(this.layer, this.id))
                let most = Decimal.sumGeometricSeries(max, 10000, exp, getBuyableAmount(this.layer, this.id))
                player[this.layer].points = player[this.layer].points.sub(most)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(max))
                setBuyableAmount(this.layer, 11, new Decimal(0))
                setBuyableAmount(this.layer, 12, new Decimal(0))
                setBuyableAmount(this.layer, 13, new Decimal(0))
        	}
	},
	15: { // Dim 5
        	cost(x) {
                    return new Decimal("1e6").times(new Decimal(2).pow(x))
            },
            unlocked() {return getBuyableAmount("AD", 22).gte(1)},
            style: {
	              "width": "125px",
	              "height": "75px",
	              "border-radius": "0%"
                },
		title() { return "5th Dimension"},
        	display() { return "Cost: "+format(this.cost())+" Antimatter"},
        	canAfford() { return player.AD.points.gte( this.cost() ) },
        	buy() {
            	let first = new Decimal("1e6")
                let exp = new Decimal(2)
                let max = Decimal.affordGeometricSeries(player.AD.points, new Decimal(1e6), exp, getBuyableAmount(this.layer, this.id))
                let most = Decimal.sumGeometricSeries(max, new Decimal(1e6), exp, getBuyableAmount(this.layer, this.id))
                player[this.layer].points = player[this.layer].points.sub(most)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(max))
                setBuyableAmount(this.layer, 11, new Decimal(0))
                setBuyableAmount(this.layer, 12, new Decimal(0))
                setBuyableAmount(this.layer, 13, new Decimal(0))
                setBuyableAmount(this.layer, 14, new Decimal(0))
        	}
	},
	16: { // Dim 6
        	cost(x) {
                    return new Decimal("1e9").times(new Decimal(2).pow(x))
            },
            unlocked() {return getBuyableAmount("AD", 22).gte(2)},
            style: {
	              "width": "125px",
	              "height": "75px",
	              "border-radius": "0%"
                },
		title() { return "6th Dimension"},
        	display() { return "Cost: "+format(this.cost())+" Antimatter"},
        	canAfford() { return player.AD.points.gte( this.cost() ) },
        	buy() {
            	let first = new Decimal("1e9")
                let exp = new Decimal(2)
                let max = Decimal.affordGeometricSeries(player.AD.points, new Decimal("1e9"), exp, getBuyableAmount(this.layer, this.id))
                let most = Decimal.sumGeometricSeries(max, new Decimal("1e9"), exp, getBuyableAmount(this.layer, this.id))
                player[this.layer].points = player[this.layer].points.sub(most)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(max))
                setBuyableAmount(this.layer, 11, new Decimal(0))
                setBuyableAmount(this.layer, 12, new Decimal(0))
                setBuyableAmount(this.layer, 13, new Decimal(0))
                setBuyableAmount(this.layer, 14, new Decimal(0))
                setBuyableAmount(this.layer, 15, new Decimal(0))
        	}
	},
	17: { // Dim 7
        	cost(x) {
                    return new Decimal("1e43").times(new Decimal(2).pow(x))
            },
            unlocked() {return getBuyableAmount("AD", 22).gte(3)},
            style: {
	              "width": "125px",
	              "height": "75px",
	              "border-radius": "0%"
                },
		title() { return "7th Dimension"},
        	display() { return "Cost: "+format(this.cost())+" Antimatter"},
        	canAfford() { return player.AD.points.gte( this.cost() ) },
        	buy() {
            	let first = new Decimal("1e43")
                let exp = new Decimal(2)
                let max = Decimal.affordGeometricSeries(player.AD.points, new Decimal("1e43"), exp, getBuyableAmount(this.layer, this.id))
                let most = Decimal.sumGeometricSeries(max, new Decimal("1e43"), exp, getBuyableAmount(this.layer, this.id))
                player[this.layer].points = player[this.layer].points.sub(most)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(max))
                setBuyableAmount(this.layer, 11, new Decimal(0))
                setBuyableAmount(this.layer, 12, new Decimal(0))
                setBuyableAmount(this.layer, 13, new Decimal(0))
                setBuyableAmount(this.layer, 14, new Decimal(0))
                setBuyableAmount(this.layer, 15, new Decimal(0))
                setBuyableAmount(this.layer, 16, new Decimal(0))
        	}
	},
	18: { // Dim 8
        	cost(x) {
                    return new Decimal("1e61").times(new Decimal(2).pow(x))
            },
            unlocked() {return getBuyableAmount("AD", 22).gte(4)},
            style: {
	              "width": "125px",
	              "height": "75px",
	              "border-radius": "0%"
                },
		title() { return "8th Dimension"},
        	display() { return "Cost: "+format(this.cost())+" Antimatter"},
        	canAfford() { return player.AD.points.gte( this.cost() ) },
        	buy() {
            	let first = new Decimal("1e61")
                let exp = new Decimal(2)
                let max = Decimal.affordGeometricSeries(player.AD.points, new Decimal("1e61"), exp, getBuyableAmount(this.layer, this.id))
                let most = Decimal.sumGeometricSeries(max, new Decimal("1e61"), exp, getBuyableAmount(this.layer, this.id))
                player[this.layer].points = player[this.layer].points.sub(most)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(max))
                setBuyableAmount(this.layer, 11, new Decimal(0))
                setBuyableAmount(this.layer, 12, new Decimal(0))
                setBuyableAmount(this.layer, 13, new Decimal(0))
                setBuyableAmount(this.layer, 14, new Decimal(0))
                setBuyableAmount(this.layer, 15, new Decimal(0))
                setBuyableAmount(this.layer, 16, new Decimal(0))
        	}
	},
	21: { // Tickspeed (xe10 after 34 amount)
        	cost() {
                    return new Decimal(1000).times(Decimal.max(new Decimal(1e10).pow(getBuyableAmount(this.layer, this.id).sub(34)), new Decimal(1))).times(new Decimal(10).pow(getBuyableAmount(this.layer, this.id)))
            },
            style: {
	              "width": "175px",
	              "height": "125px",
	              "border-radius": "0%"
                },
		title() { return "Increase Tickspeed"},
        	display() { return "Cost: "+format(this.cost())+" Antimatter <br> Tickspeed: "+format(player.AD.tick)+"/s</br>"+"<br> You have a tickspeed maximum of "+format(new Decimal(2).pow(player.AD.cap))+"/s </br>"},
        	canAfford() { return player.AD.points.gte( this.cost() ) && getBuyableAmount(this.layer, this.id).lt(player.AD.cap) },
        	buy() { // Each buy, x10
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.AD.tick = player.AD.tick.times(2)
                setBuyableAmount(this.layer, 11, new Decimal(0))
                setBuyableAmount(this.layer, 12, new Decimal(0))
                setBuyableAmount(this.layer, 13, new Decimal(0))
                setBuyableAmount(this.layer, 14, new Decimal(0))
                setBuyableAmount(this.layer, 15, new Decimal(0))
                setBuyableAmount(this.layer, 16, new Decimal(0))
                setBuyableAmount(this.layer, 17, new Decimal(0))
                setBuyableAmount(this.layer, 18, new Decimal(0))
        	}
	},
	22: { // Dimboost (+15 8th dims)
        	cost() { 
        		let need = new Decimal(15)
        		if(getBuyableAmount(this.layer, this.id).gte(5)) need = need.plus(new Decimal(15).times(getBuyableAmount(this.layer, this.id).sub(4)))
        		return need
        	},
            style: {
	              "width": "175px",
	              "height": "125px",
	              "border-radius": "0%"
                },
		title() { return "Dimension Boost ("+format(getBuyableAmount(this.layer, this.id))+")"},
        	display() { 
     	   	let dimneed = ""
        		if(getBuyableAmount(this.layer, this.id).eq(0)) dimneed = "4th dimensions"
        		if(getBuyableAmount(this.layer, this.id).eq(1)) dimneed = "5th dimensions"
        		if(getBuyableAmount(this.layer, this.id).eq(2)) dimneed = "6th dimensions"
        		if(getBuyableAmount(this.layer, this.id).eq(3)) dimneed = "7th dimensions"
        		if(getBuyableAmount(this.layer, this.id).gte(4)) {
        			dimneed = "8th dimensions"
        		}
 	       	return "Cost: "+format(this.cost())+" "+dimneed+"<br>Also increases tickspeed maximum"
        	},
        	canAfford() { 
        		let di = 0
      	  	if(getBuyableAmount(this.layer, this.id).eq(0)) di = 14
        		if(getBuyableAmount(this.layer, this.id).eq(1)) di = 15
       	 	if(getBuyableAmount(this.layer, this.id).eq(2)) di = 16
   	     	if(getBuyableAmount(this.layer, this.id).eq(3)) di = 17
        		if(getBuyableAmount(this.layer, this.id).gte(4)) di = 18
    	    	return getBuyableAmount(this.layer, di).gte( this.cost() )
        	},
        	buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.AD.cap = player.AD.cap.plus(8)
                setBuyableAmount(this.layer, 11, new Decimal(0))
                setBuyableAmount(this.layer, 12, new Decimal(0))
                setBuyableAmount(this.layer, 13, new Decimal(0))
                setBuyableAmount(this.layer, 14, new Decimal(0))
                setBuyableAmount(this.layer, 15, new Decimal(0))
                setBuyableAmount(this.layer, 16, new Decimal(0))
                setBuyableAmount(this.layer, 17, new Decimal(0))
                setBuyableAmount(this.layer, 18, new Decimal(0))
                player.AD.points = new Decimal(0)
                //DANG I FORGOT TO  RESET TICKSPEED
                setBuyableAmount(this.layer, 21, new Decimal(0))
                player.AD.tick = new Decimal(1)
        	}
		},
		23: { // Dimensional Sacrifice
        	cost() {
                    return new Decimal(0)
            },
            unlocked() {return getBuyableAmount("CO", 12).gte(6)},
            style: {
	              "width": "100%",
	              "height": "70px",
	              "border-radius": "0%"
                },
		title() { return "Dimensional Sacrifice"},
        	display() { 
        		let sacmult = getBuyableAmount(this.layer, 11).plus(1).log10().div(10).pow(2)
        		let real = Decimal.max(new Decimal(1), sacmult.sub(player.AD["sacmult"]))
        		return "Reset your dimensions except for the 8th dimension for a boost to the 8th dimension.<br>Boost: "+format(real)+"x<br>Sacrifice Mult: "+format(player.AD["sacmult"])+"x"
        	},
        	canAfford() {
        		if(getBuyableAmount("AD", 18).lte(0))return false
        		// formula is ((log10(1stdims))/10)^2
        		let sacmult = getBuyableAmount(this.layer, 11).plus(1).log10().div(10).pow(2)
        		let real = Decimal.max(new Decimal(1), sacmult.sub(player.AD["sacmult"]))
        		if(real.lte(1))return false
        		return true
        	},
        	buy() { // Disable if new mult is less or equal to 1 or no 8th dims
        		let sacmult = getBuyableAmount(this.layer, 11).plus(1).log10().div(10).pow(2)
                player.AD["sacmult"] = sacmult
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                setBuyableAmount(this.layer, 11, new Decimal(0))
                setBuyableAmount(this.layer, 12, new Decimal(0))
                setBuyableAmount(this.layer, 13, new Decimal(0))
                setBuyableAmount(this.layer, 14, new Decimal(0))
                setBuyableAmount(this.layer, 15, new Decimal(0))
                setBuyableAmount(this.layer, 16, new Decimal(0))
                setBuyableAmount(this.layer, 17, new Decimal(0))
        	}
	},
    },
    row: "side", // Row the layer is in on the tree (0 is the first row)
    layerShown(){ return hasUpgrade("S", 43) && inArea("main")},
    isActive(){return tmp[this.layer].layerShown},
    microtabs: {
        stuff: {
            Dimensions: {
                content: [
                    "blank",
                    ["buyable", 21],
                    "blank",
                    ["buyable", 23],
                    "blank",
                    ["row", [ ["display-text", function() { return "<b>You have "+format(getBuyableAmount("AD", 11))+" 1st dimensions <br>×"+format(player.AD.onem)+"</br></b>"}, { "font-size": "16px"}], "blank", ["buyable", 11]] ],
                    "blank",
                    ["row", [ ["display-text", function() { return "<b>You have "+format(getBuyableAmount("AD", 12))+" 2nd dimensions <br>×"+format(player.AD.twom)+"</br></b>"}, { "font-size": "16px"}], "blank", ["buyable", 12]] ],
                    "blank",
                    ["row", [ ["display-text", function() { return "<b>You have "+format(getBuyableAmount("AD", 13))+" 3rd dimensions <br>×"+format(player.AD.threem)+"</br></b>"}, { "font-size": "16px"}], "blank", ["buyable", 13]] ],
                    "blank",
                    ["row", [ ["display-text", function() { return "<b>You have "+format(getBuyableAmount("AD", 14))+" 4th dimensions <br>×"+format(player.AD.fourm)+"</br></b>"}, { "font-size": "16px"}], "blank", ["buyable", 14]] ],
                    "blank",
                    ["row", [ ["display-text", function() { return "<b>You have "+format(getBuyableAmount("AD", 15))+" 5th dimensions <br>×"+format(player.AD.fivem)+"</br></b>"}, { "font-size": "16px"}], "blank", ["buyable", 15]] ],
                    "blank",
                    ["row", [ ["display-text", function() { return "<b>You have "+format(getBuyableAmount("AD", 16))+" 6th dimensions <br>×"+format(player.AD.sixm)+"</br></b>"}, { "font-size": "16px"}], "blank", ["buyable", 16]] ],
                    "blank",
                    ["row", [ ["display-text", function() { return "<b>You have "+format(getBuyableAmount("AD", 17))+" 7th dimensions <br>×"+format(player.AD.sevenm)+"</br></b>"}, { "font-size": "16px"}], "blank", ["buyable", 17]] ],
                    "blank",
                    ["row", [ ["display-text", function() { return "<b>You have "+format(getBuyableAmount("AD", 18))+" 8th dimensions <br>×"+format(player.AD.eightm)+"</br></b>"}, { "font-size": "16px"}], "blank", ["buyable", 18]] ],
                    "blank",
                    ["buyable", 22]
                ],
            },
            Upgrades: {
                content: [
                    "upgrades"
                ],
            },
            Achievements: {
            	content: [
                    "achievements"
                ],
            }
        }
    },
    achievements: {
    	11: {
        	name: "start... somewhere",
        	done() { return player.AD.points.gte(100) },
		    tooltip: "get 100 antimatter <br>reward: unlock the 2nd dimension</br>",
		    image: "resources/Adch1.png"
    	},
        12: {
        	name: "2 antimatter = 2 dimensions?",
        	done() { return getBuyableAmount(this.layer, 12).gte(1) },
		    tooltip: "Get the 2nd dimension <br> Reward: unlock the 3rd dimension </br>",
		    image: "resources/Adch2.png"
    	},
        13: {
        	name: "usain bolt",
        	done() { return getBuyableAmount(this.layer, 21).gte(1) },
		    tooltip: "Increase your tickspeed",
		    image: "resources/Adch3.png"
    	},
        14: {
        	name: "thirty third",
        	done() { return getBuyableAmount(this.layer, 13).gte(3) },
		    tooltip: "have 3 3rd dimensions <br> reward: experience boosts dimension 1 production </br>",
		    image: "resources/Adch4.png"
    	},
        15: {
        	name: "cheat-tah",
        	done() { return getBuyableAmount(this.layer, 21).gte(2) },
		    tooltip: "Increase your tickspeed 2 times <br> reward: unlock 4th dimension </br>",
		    image: "resources/Adch5.png"
    	},
        16: {
        	name: "family friendly",
        	done() { return getBuyableAmount(this.layer, 14).gte(1) },
		    tooltip: "have 1 4th dimension <br> reward: a very huge cost scale :troll: </br>",
		    image: "resources/Adch6.png"
    	},
    	21: {
        	name: "a really high five",
        	done() { return getBuyableAmount(this.layer, 15).gte(1) },
		    tooltip: "have 1 5th dimension",
		    image: "resources/Adch7.png"
    	},
    	22: {
        	name: "we also couldnt afford 9",
        	done() { return getBuyableAmount(this.layer, 16).gte(1) },
		    tooltip: "have 1 6th dimension",
		    image: "resources/Adch8.png"
    	},
    	23: {
        	name: "triple seven",
        	done() { return getBuyableAmount(this.layer, 17).gte(3) },
		    tooltip: "have 3 7th dimensions",
		    image: "resources/Adch9.png"
    	},
    	24: {
        	name: "-90 degrees to infinity",
        	done() { return getBuyableAmount(this.layer, 18).gte(1) },
		    tooltip: "have 1 8th dimensions",
		    image: "resources/Adch10.png"
    	},
    	25: {
        	name: "fast and boostrious",
        	done() { return getBuyableAmount(this.layer, 22).gte(10) },
		    tooltip: "do 10 dimension boosts<br>reward: 10x antimatter",
		    image: "resources/Adch11.png"
    	},
    	26: {
        	name: "1 e google",
        	done() { return player[this.layer].points.gte("1e100") },
		    tooltip: "have 1e100 antimatter<br>reward: unlock new techs in tech tree",
		    image: "resources/Adch12.png"
    	},
    	31: {
        	name: "toss it in the trash",
        	done() { return player[this.layer].sacmult.gte(2) },
		    tooltip: "do a dim sacrifice<br>reward: new AD upgrades",
		    image: "resources/Adch13.png"
    	},
    	32: {
        	name: "boostrious and fast 2",
        	done() { return getBuyableAmount(this.layer, 22).gte(30) },
		    tooltip: "do 30 dimension boosts",
		    image: "resources/Adch14.png"
    	},
    },
    upgrades: {
	    11: {
		title: "Thats so lit!",
		description: "Unlock more fire stage milestones, unlock a new recovery",
		cost: new Decimal("1e6"),
		unlocked() { return hasAchievement("ACH", 65) }
	    },
	    12: {
		title: "Sum Moar",
		description: "Move the antimatter hardcap to 2e16",
		cost: new Decimal("2e8"),
		unlocked() { return hasUpgrade("M2", 19) }
	    },
	    13: {
		title: "CostCo",
		description: "4th dimension cost scale is greatly better",
		cost: new Decimal("4e8"),
		unlocked() { return hasUpgrade("M2", 19) }
	    },
	    14: {
		title: "Softer Matter",
		description: "Antimatter hard cap turns into soft cap",
		cost: new Decimal("2e16"),
		unlocked() { return hasUpgrade("M2", 19) }
	    },
	    21: {
		title: "AntiAntiMatter",
		description: "Move the antimatter softcap to 2e200",
		cost: new Decimal("1e100"),
		unlocked() { return hasAchievement("AD", 31) }
	    },
	    22: {
		title: "AntiExperience",
		description: "Experience is boosted by your antimatter",
		cost: new Decimal("1e191"),
		unlocked() { return hasAchievement("AD", 31) },
		effect() {return player.AD.points.plus(1).log(2)},
		effectDisplay() {return format(this.effect())+"x"},
		tooltip : "log2(x+1)"
	    },
    },
    tabFormat: [
        ["display-text", function() { return "<div id='newstick'><div id='news'></div></div>"} ],
        ["row", [
    		"main-display",
    		["display-image", "resources/antimattericon.png", {"width": "50px", "height": "50px", "position": "relative", "bottom": "5px"}]
    	]],
        ["display-text", function() { return "You are making <b><font size=+1>"+format(tmp.AD.calculateAnti)+"</b></font> antimatter/s"}, { "font-size": "20px"}],
        "resource-display",
        ["display-text", function() { if(player.AD.points.gte(player.AD.soft))return "Softcapped"}],
        ["display-text", function() { if(player.AD.points.gte(player.AD.ant))return "You have the maximum antimatter! <br>Maximum antimatter: "+format(player.AD.ant)+"</br>"}, { "color": "red", "font-size": "32px"}],
	    "blank",
	    ["microtabs", "stuff"]
    ],
    fixtick(){
    	if(player.tab=="AD"){
    		if(!player.AD.newsreload){
    			setTimeout(newsticking, 1000)
    			player.AD.newsreload = true
    		}
    	} else {
    		player.AD.newsreload = false
    	}
    }
})
