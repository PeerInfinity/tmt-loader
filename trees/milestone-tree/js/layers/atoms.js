
addLayer("a", {
    name: "atoms", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#AAFFD7",
    requires(){
		r = new Decimal("e27e9");
        return r
	}, // Can be a function that takes requirement increases into account
    resource: "atoms", // Name of prestige currency
    baseResource: "atomic-prestige points", // Name of resource prestige is based on
    baseAmount() {return player.ap.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 5, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "A", description: "Shift+A: Reset for atoms", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.m.effective.gte(175) && player.r.universe==0},
	branches(){
		if(player.r.stage>=1)return ["hb","he"];
		if(player.m.effective.gte(192)){//unstable
			if(Date.now()%1110<370)return ["ap","he"];
			if(Date.now()%1110<740)return ["hb","he"];
			return ["ap","hb"];
		}
		return ["ap","hb"];
	},
	softcap:new Decimal(Infinity),
	softcapPower:new Decimal(1),
	base: new Decimal("e5e9"),
	exponent: function(x){
		if(x===undefined)x=player.a.points;
		let p=new Decimal(2);
		if(x.gte(10)){
			let scaling=x.sub(10).pow(2).div(1000);
			p=p.add(scaling);
		}
		return p;
	},
	effect(){
		let p=0.5;
		let m=0.02;
		let e=0;
		return new Decimal(1).add(player.a.points.add(e).pow(p).mul(m));
	},
	effectDescription(){
		return "atomic-prestige points and hyper boost effect ^"+format(layers.a.effect(),4)
	},
	
	resetsNothing(){return player.m.effective.gte(186)&&player.r.stage>=1},
		doReset(l){
			if(l=="t"){return;}
			if(l=="a"){return;}
		},
	//autoPrestige(){return player.m.effective.gte(999)},
	update(){
		if(player.m.effective.gte(186)&&player.r.stage>=1){//quick autobuy
			while(true){
				let req=layers.a.requires().mul(layers.a.base.pow(Decimal.pow(player.a.points,layers.a.exponent())));
				if(player.ap.points.gt(req))player.a.points=player.a.points.add(1);
				else break;
			}
		}
	},
	upgrades: {
        rows: 4,
        cols: 4,
		11: {
			title: "Atom Upgrade 11",
            description: "Atom affects the 1st Milestone's softcap.",
            cost: new Decimal(5),
            unlocked() { return player.m.effective.gte(179)}, // The upgrade is only visible when this is true
			effect() {
				let p=tmp.a.effect;
				return p;
            },
            effectDisplay() { return format(this.effect(),4)+"x later" },
        },
		12: {
			title: "Atom Upgrade 12",
            description: "Hyper Boost Upgrade 12 is boosted.",
            cost: new Decimal(6),
            unlocked() { return player.m.effective.gte(179)}, // The upgrade is only visible when this is true
        },
		13: {
			title: "Atom Upgrade 13",
            description: "Hyper Boost Upgrade 12 is boosted.",
            cost: new Decimal(25),
            unlocked() { return player.m.effective.gte(185)}, // The upgrade is only visible when this is true
        },
		14: {
			title: "Atom Upgrade 14",
            description: "Hyper Boost Upgrade 12 is boosted.",
            cost: new Decimal(26),
            unlocked() { return player.m.effective.gte(185)}, // The upgrade is only visible when this is true
        },
		21: {
			title: "Atom Upgrade 21",
            description: "Hyper Boost Upgrade 12 is boosted.",
            cost: new Decimal(55),
            unlocked() { return player.m.effective.gte(190)&&player.r.stage>=1}, // The upgrade is only visible when this is true
        },
		22: {
			title: "Atom Upgrade 22",
            description: "Hyper Boost Upgrade 12 is boosted.",
            cost: new Decimal(62),
            unlocked() { return player.m.effective.gte(190)&&player.r.stage>=1}, // The upgrade is only visible when this is true
        },
		23: {
			title: "Atom Upgrade 23",
            description: "Non-Extra Atoms provide extra Hyper Boosts.",
            cost: new Decimal(71),
			effect() {
				let exp=0.1;
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
            unlocked() { return player.m.effective.gte(207)}, // The upgrade is only visible when this is true
        },
		24: {
			title: "Atom Upgrade 24",
            description: "Atom Upgrade 23 is boosted.",
            cost: new Decimal(75),
            unlocked() { return player.m.effective.gte(207)}, // The upgrade is only visible when this is true
        },
	},
	
})
