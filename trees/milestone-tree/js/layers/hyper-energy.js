
addLayer("he", {
    name: "hyper energy", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "HE", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#FF3300",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "hyper energy", // Name of prestige currency
    baseResource: "hyper-prestige points", // Name of resource prestige is based on
    baseAmount() {return player.hp.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "ctrl+e", description: "Ctrl+E: Collect Hyper Energy", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.m.effective.gte(150) && player.r.universe==0},
	branches(){
		if(player.r.stage>=1)return ["se","em"];
		if(player.m.effective.gte(189)){//unstable
			if(Date.now()%1300<300)return ["se","um"];
			if(Date.now()%1300<600)return ["se","em"];
			if(Date.now()%1300<900)return ["um","em"];
			if(Date.now()%1300<1200)return ["em","hp"];
			return ["hp","se"];
		}
		return ["hp","se"];
	},
	base: function(){
		let b=new Decimal("10");
		return b;
	},
	exponent: function(){
		return new Decimal(1);
	},
	directMult(){
		let b=new Decimal(1);
		if(player.mm.points.gte(46))b=b.mul(2);
		if(player.mm.points.gte(47))b=b.mul(2);
		if(player.mm.points.gte(48))b=b.mul(2);
		if(player.mm.points.gte(49))b=b.mul(2);
		return b;
	},
	resetsNothing:true,
	doReset(l){},
	canBuyMax:true,
	autoPrestige(){return player.m.effective.gte(150)},
	upgrades: {
        rows: 2,
        cols: 4,
		11: {
			title: "Hyper Energy Upgrade 11",
            description: "1st Milestone's softcap starts later based on your hyper energy.",
            cost: new Decimal(1.45e10),
            unlocked() { return true}, // The upgrade is only visible when this is true
			effect() {
				let b=player.he.points.add(1).log10().div(90);
				if(hasUpgrade("he",13))b=b.mul(2);
				if(hasUpgrade("he",21))b=b.mul(1.5);
				if(hasUpgrade("he",23))b=b.mul(1.25);
				return b.add(1);
            },
            effectDisplay() { return format(this.effect(),4)+"x later" }, // Add formatting to the effect
        },
		12: {
			title: "Hyper Energy Upgrade 12",
            description: "Milestone Cost Scaling is weaker based on your hyper energy.",
            cost: new Decimal(2.56e10),
            unlocked() { return true}, // The upgrade is only visible when this is true
			effect() {
				let b=player.he.points.add(1).log10().div(500);
				if(hasUpgrade("he",14))b=b.mul(2);
				return b.add(1);
            },
            effectDisplay() { return format(this.effect(),4)+"x" }, // Add formatting to the effect
        },
		13: {
			title: "Hyper Energy Upgrade 13",
            description: "Hyper Energy Upgrade 11 is boosted.",
            cost: new Decimal(3.07e10),
            unlocked() { return true}, // The upgrade is only visible when this is true
        },
		14: {
			title: "Hyper Energy Upgrade 14",
            description: "Hyper Energy Upgrade 12 is boosted.",
            cost: new Decimal(9.5e10),
            unlocked() { return true}, // The upgrade is only visible when this is true
        },
		21: {
			title: "Hyper Energy Upgrade 21",
            description: "Hyper Energy Upgrade 11 is boosted.",
            cost: new Decimal(1.55e13),
            unlocked() { return player.em.points.gte(6)}, // The upgrade is only visible when this is true
        },
		22: {
			title: "Hyper Energy Upgrade 22",
            description: "Transcend point gain is boosted based on your hyper energy.",
            cost: new Decimal(2.83e13),
            unlocked() { return player.em.points.gte(6)}, // The upgrade is only visible when this is true
			effect() {
				let base=1.05;
                let ret = Decimal.pow(base,Decimal.log10(player[this.layer].points.add(1)).pow(0.9).add(1))
                return ret;
            },
            effectDisplay() { return format(this.effect(),4)+"x" }, // Add formatting to the effect
        },
		23: {
			title: "Hyper Energy Upgrade 23",
            description: "Hyper Energy Upgrade 11 is boosted.",
            cost: new Decimal(1e14),
            unlocked() { return player.em.points.gte(6)}, // The upgrade is only visible when this is true
        },
		24: {
			title: "Hyper Energy Upgrade 24",
            description: "Increase the effects of Prestige Energy  Upgrade 11 and Super Energy  Upgrade 11.",
            cost: new Decimal(2e14),
            unlocked() { return player.em.points.gte(6)}, // The upgrade is only visible when this is true
        },
	},
	
    resetDescription: "Collect ",
	tabFormat: [
		"main-display",
		"prestige-button",
		["display-text",function(){
			let power=new Decimal(1).div(tmp.he.exponent);
			return "Hyper Energy="+format(tmp.he.directMult)+"*log10(Hyper Prestige Points)^"+format(power);
		}],
		"upgrades"
	],
})

