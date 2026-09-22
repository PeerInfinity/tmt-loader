
addLayer("hb", {
    name: "hyper boost", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "HB", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#90FFC0",
    requires(){
		r = new Decimal("1e470000");
		if(hasUpgrade("t",41))r=r.div("1e60000");
		if(hasUpgrade("t",64))r=r.div("1e300000");
		if(hasUpgrade("t",71))r=r.div("1e30000");
		if(player.um.points.gte(104))r=r.div("1e70000");
        return r
	}, // Can be a function that takes requirement increases into account
    resource: "hyper boosts", // Name of prestige currency
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
        {key: "B", description: "Shift+B: Reset for hyper boosts", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.m.effective.gte(104) && player.r.universe==0},
	branches(){
		if(player.r.stage>=1)return ["um","em"];
		if(player.m.effective.gte(189)){//unstable
			if(Date.now()%1300<300)return ["pb","um"];
			if(Date.now()%1300<600)return ["pb","em"];
			if(Date.now()%1300<900)return ["um","em"];
			if(Date.now()%1300<1200)return ["um","hp"];
			return ["hp","pb"];
		}
		return ["hp","pb"];
	},
	softcap:new Decimal(Infinity),
	softcapPower:new Decimal(1),
	base: function(x){
		if(player.um.points.gte(116))return new Decimal("1e30000")
		return new Decimal("1e100000")
	},
	exponent: function(x){
		if(x===undefined)x=player.hb.points;
		let p=new Decimal(1.25);
		if(x.gte(10)){
			let scaling=x.sub(10).pow(2).div(1000);
			if(player.m.effective.gte(119))scaling=scaling.div(1.2);
			if(player.um.points.gte(104))scaling=scaling.div(1.01);
			if(player.um.points.gte(119))scaling=scaling.div(1.01);
			p=p.add(scaling);
		}
		return p;
	},
	effect(){
		let p=0.5;
		let m=0.02;
		let e=0;
		if(hasUpgrade("t",42))e++;
		if(hasUpgrade("t",43)){
			m+=0.02;
		}
		if(hasUpgrade("hb",13)){
			m+=0.004;
		}
		if(hasUpgrade("hb",14)){
			m+=0.003;
		}
		if (player.ep.buyables[11].gte(3)){
			m+=(tmp.ep.threeEffect-1)
		}

		if(hasUpgrade("a",23)){
			e=e+upgradeEffect("a",23).toNumber();
		}
		return new Decimal(1).add(player.hb.points.add(e).pow(p).mul(m)).pow(layers.a.effect());
	},
	effectDescription(){
		return "hyper-prestige points and prestige boost effect ^"+format(layers.hb.effect(),4)
	},
	
	upgrades: {
        rows: 4,
		cols: 4,
		11: {
			title: "Hyper Boost Upgrade 11",
            description: "Hyper Boost effect affects the 1st Milestone's softcap.",
            cost: new Decimal(7),
			effect() {
				let p=tmp.hb.effect;
				return p;
            },
            effectDisplay() { return format(this.effect(),4)+"x later" },
        },
		12: {
			title: "Hyper Boost Upgrade 12",
            description: "Non-Extra Hyper Boosts provide extra Prestige Boosts.",
            cost: new Decimal(12),
			effect() {
				let exp=0.7;
				if(hasUpgrade("hb",21))exp+=0.05;
				if(hasUpgrade("hb",22))exp+=0.05;
				if(hasUpgrade("hb",23))exp+=0.05;
				if(hasUpgrade("hb",24))exp+=0.05;
				if(hasUpgrade("hb",32))exp+=0.02;
				if(hasUpgrade("hb",33))exp+=0.02;
				if(hasUpgrade("hb",34))exp+=0.01;
				if(hasUpgrade("a",12))exp+=0.01;
				if(hasUpgrade("a",13))exp+=0.01;
				if(hasUpgrade("a",14))exp+=0.01;
				if(hasUpgrade("a",21))exp+=0.01;
				if(hasUpgrade("a",22))exp+=0.01;
				let p=player.hb.points.pow(exp);
				return p;
            },
            effectDisplay() { return "+"+format(this.effect(),4) },
        },
		13: {
			title: "Hyper Boost Upgrade 13",
            description: "Hyper Boost's effect is better.",
            cost: new Decimal(20),
        },
		14: {
			title: "Hyper Boost Upgrade 14",
            description: "Hyper Boost's effect is better.",
            cost: new Decimal(26),
        },
		21: {
			title: "Hyper Boost Upgrade 21",
            description: "Hyper Boost Upgrade 12 is boosted.",
            cost: new Decimal(33),
        },
		22: {
			title: "Hyper Boost Upgrade 22",
            description: "Hyper Boost Upgrade 12 is boosted.",
            cost: new Decimal(35),
        },
		23: {
			title: "Hyper Boost Upgrade 23",
            description: "Hyper Boost Upgrade 12 is boosted.",
            cost: new Decimal(40),
        },
		24: {
			title: "Hyper Boost Upgrade 24",
            description: "Hyper Boost Upgrade 12 is boosted.",
            cost: new Decimal(42),
        },
		31: {
			title: "Hyper Boost Upgrade 31",
            description: "Atom Upgrade 23's effect provide extra Prestige Boosts.",
            cost: new Decimal(113),
			effect() {
				let exp=0.1
				if(hasUpgrade("a",24))exp+=0.2;
				if(player.m.effective.gte(252))exp+=0.1;
				if(player.m.effective.gte(253))exp+=0.1;
				if(hasUpgrade("hb",41))exp+=0.05;
				if(hasUpgrade("hb",42))exp+=0.05;
				if(hasUpgrade("hb",43))exp+=0.05;
				if(hasUpgrade("hb",44))exp+=0.05;
				let p=player.a.points.pow(exp);
				return p;
            },
            effectDisplay() { return "+"+format(this.effect(),4) },
            unlocked() { return player.m.effective.gte(216)}, // The upgrade is only visible when this is true
        },
		32: {
			title: "Hyper Boost Upgrade 32",
            description: "Hyper Boost Upgrade 12 is boosted.",
            cost: new Decimal(115),
            unlocked() { return player.m.effective.gte(216)}, // The upgrade is only visible when this is true
        },
		33: {
			title: "Hyper Boost Upgrade 33",
            description: "Hyper Boost Upgrade 12 is boosted.",
            cost: new Decimal(123),
            unlocked() { return player.m.effective.gte(216)}, // The upgrade is only visible when this is true
        },
		34: {
			title: "Hyper Boost Upgrade 34",
            description: "Hyper Boost Upgrade 12 is boosted.",
            cost: new Decimal(126),
            unlocked() { return player.m.effective.gte(216)}, // The upgrade is only visible when this is true
        },
		41: {
			title: "Hyper Boost Upgrade 41",
            description: "Atom Upgrade 23 is boosted. You can buy this upgrade while you're in T challenge 1.",
            cost(){
				if(player.t.activeChallenge!=11)return new Decimal(Infinity);
				return new Decimal(139);
			},
            unlocked() { return player.m.effective.gte(257)}, // The upgrade is only visible when this is true
        },
		42: {
			title: "Hyper Boost Upgrade 42",
            description: "Atom Upgrade 23 is boosted. You can buy this upgrade while you're in T challenge 3.",
            cost(){
				if(player.t.activeChallenge!=21)return new Decimal(Infinity);
				return new Decimal(142);
			},
            unlocked() { return player.m.effective.gte(257)}, // The upgrade is only visible when this is true
        },
		43: {
			title: "Hyper Boost Upgrade 43",
            description: "Atom Upgrade 23 is boosted. You can buy this upgrade while you're in T challenge 5.",
            cost(){
				if(player.t.activeChallenge!=31)return new Decimal(Infinity);
				return new Decimal(146);
			},
            unlocked() { return player.m.effective.gte(257)}, // The upgrade is only visible when this is true
        },
		44: {
			title: "Hyper Boost Upgrade 44",
            description: "Atom Upgrade 23 is boosted. You can buy this upgrade while you're in T challenge 7.",
            cost(){
				if(player.t.activeChallenge!=41)return new Decimal(Infinity);
				return new Decimal(151);
			},
            unlocked() { return player.m.effective.gte(257)}, // The upgrade is only visible when this is true
        },
	},
	resetsNothing(){return player.m.effective.gte(111)},
		doReset(l){
			if(l=="hb"){return;}
			if(l=="t")if(player.m.effective.gte(134))layerDataReset("hb",["upgrades"]);else layerDataReset("hb",[]);
			if(l=="a")layerDataReset("hb",["upgrades"]);
		},
	//autoPrestige(){return player.m.effective.gte(116)},
	update(){
		if(player.m.effective.gte(116)){//quick autobuy
			while(true){
				let req=layers.hb.requires().mul(layers.hb.base().pow(Decimal.pow(player.hb.points,layers.hb.exponent())));
				if(player.hp.points.gt(req))player.hb.points=player.hb.points.add(1);
				else break;
			}
		}
	},
	
})
