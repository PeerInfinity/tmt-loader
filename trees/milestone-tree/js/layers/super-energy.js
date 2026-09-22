
addLayer("se", {
    name: "super energy", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SE", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#FF6600",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "super energy", // Name of prestige currency
    baseResource: "super-prestige points", // Name of resource prestige is based on
    baseAmount() {return player.sp.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "E", description: "Shift+E: Collect Super Energy", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.m.effective.gte(140) && player.r.universe==0},
	branches(){
		if(player.r.stage>=1)return ["sp","pe"];
		if(player.m.effective.gte(186)){//unstable
			if(Date.now()%1500<500)return ["pb","pe"];
			if(Date.now()%1500<1000)return ["sp","pb"];
			return ["sp","pe"];
		}
		return ["sp","pe"];
	},
	base: 10,
	directMult(){
		let b=new Decimal(1);
		if(player.mm.points.gte(36))b=b.mul(2);
		if(player.mm.points.gte(37))b=b.mul(2);
		if(player.mm.points.gte(38))b=b.mul(2);
		if(player.mm.points.gte(39))b=b.mul(2);
		if(player.mm.points.gte(41))b=b.mul(2);
		if(player.mm.points.gte(42))b=b.mul(2);
		if(player.mm.points.gte(43))b=b.mul(2);
		if(player.mm.points.gte(44))b=b.mul(2);
		return b;
	},
	exponent: function(){
		return new Decimal(1);
	},
	resetsNothing:true,
	doReset(l){},
	canBuyMax:true,
	autoPrestige(){return player.m.effective.gte(140)},
	upgrades: {
        rows: 2,
        cols: 4,
		11: {
			title: "Super Energy Upgrade 11",
            description: "1st Milestone's softcap starts later based on your super energy.",
            cost: new Decimal(1.11e12),
            unlocked() { return true}, // The upgrade is only visible when this is true
			effect() {
				let b=player.se.points.add(1).log10().div(100);
				if(hasUpgrade("se",13))b=b.mul(1.5);
				if(hasUpgrade("se",21))b=b.mul(1.5);
				if(hasUpgrade("he",24))b=b.mul(3/2.25);
				return b.add(1);
            },
            effectDisplay() { return format(this.effect(),4)+"x later" }, // Add formatting to the effect
        },
		12: {
			title: "Super Energy Upgrade 12",
            description: "Milestone Cost Scaling is weaker based on your super energy.",
            cost: new Decimal(1.46e12),
            unlocked() { return true}, // The upgrade is only visible when this is true
			effect() {
				let b=player.se.points.add(1).log10().div(200);
				if(hasUpgrade("se",14))b=b.mul(1.5);
				if(hasUpgrade("se",23))b=b.mul(1.2);
				return b.add(1);
            },
            effectDisplay() { return format(this.effect(),4)+"x" }, // Add formatting to the effect
        },
		13: {
			title: "Super Energy Upgrade 13",
            description: "Super Energy Upgrade 11 is boosted.",
            cost: new Decimal(8.33e12),
            unlocked() { return true}, // The upgrade is only visible when this is true
        },
		14: {
			title: "Super Energy Upgrade 14",
            description: "Super Energy Upgrade 12 is boosted.",
            cost: new Decimal(1.09e13),
            unlocked() { return true}, // The upgrade is only visible when this is true
        },
		21: {
			title: "Super Energy Upgrade 21",
            description: "Super Energy Upgrade 11 is boosted.",
            cost: new Decimal(3.17e13),
            unlocked() { return player.em.points.gte(3)}, // The upgrade is only visible when this is true
        },
		22: {
			title: "Super Energy Upgrade 22",
            description: "Transcend point gain is boosted based on your super energy.",
            cost: new Decimal(3.51e13),
            unlocked() { return player.em.points.gte(3)}, // The upgrade is only visible when this is true
			effect() {
				let base=1.1;
				if(hasUpgrade("se",24))base+=0.05;
                let ret = Decimal.pow(base,Decimal.log10(player[this.layer].points.add(1)).pow(0.9).add(1))
                return ret;
            },
            effectDisplay() { return format(this.effect(),4)+"x" }, // Add formatting to the effect
        },
		23: {
			title: "Super Energy Upgrade 23",
            description: "Super Energy Upgrade 12 is boosted.",
            cost: new Decimal(7.14e13),
            unlocked() { return player.em.points.gte(3)}, // The upgrade is only visible when this is true
        },
		24: {
			title: "Super Energy Upgrade 24",
            description: "Super Energy Upgrade 22 is boosted.",
            cost: new Decimal(2.59e14),
            unlocked() { return player.em.points.gte(3)}, // The upgrade is only visible when this is true
        },
	},
	
    resetDescription: "Collect ",
	tabFormat: [
		"main-display",
		"prestige-button",
		["display-text",function(){
			let power=new Decimal(1).div(tmp.se.exponent);
			return "Super Energy="+format(tmp.se.directMult)+"*log10(Super Prestige Points)^"+format(power);
		}],
		"upgrades"
	],
})

