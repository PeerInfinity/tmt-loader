addLayer("um", {
    name: "upgraded milestone", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "UM", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
		meta: new Decimal(0),
    }},
    color: "#ccbb00",
    requires(){
		if(player.r.stage>=2){
			if(player.em.points.gte(9))return new Decimal(1);
			if(player.em.points.gte(5))return new Decimal("e3e12");
			return new Decimal("ee13");
		}
		if(player.r.stage>=1){
			if(player.um.points.gte(99)&&player.r.challenges[11]<1)return new Decimal(Infinity);
			if(player.em.points.gte(9))return new Decimal(1);
			if(player.em.points.gte(5))return new Decimal("e5e16");
			return new Decimal("ee17");
		}
		if(player.um.points.gte(50))return new Decimal(Infinity);
		if(player.em.points.gte(5))return new Decimal("e6e12");
		return new Decimal("ee13");
	},
    resource: "upgraded milestones", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    base(){
		if(player.r.stage>=2){
			if(player.um.points.gte(37))return new Decimal("ee7");
			if(player.um.points.gte(20))return new Decimal("ee10").pow(Decimal.pow(0.1,player.um.points.sub(22).div(5)));
			if(player.em.points.gte(9))return new Decimal("ee11");
			if(player.em.points.gte(5))return new Decimal("e5e11");
			return new Decimal("ee12");
		}
		if(player.r.stage>=1){
			if(player.um.points.gte(99))return new Decimal("ee20");
			if(player.um.points.gte(95))return new Decimal("e2e17");
			if(player.um.points.gte(90))return new Decimal("ee17");
			if(player.um.points.gte(50))return new Decimal("e7e16");
			if(player.em.points.gte(9))return new Decimal("e3e16");
			if(player.em.points.gte(5))return new Decimal("e5e16");
			return new Decimal("ee17");
		}
		if(player.um.points.gte(42))return new Decimal("e62e11");
		if(player.um.points.gte(40))return new Decimal("e71e11");
		if(player.um.points.gte(21))return new Decimal("e103e10");
		if(player.um.points.gte(13))return new Decimal("e95e10");
		if(player.um.points.gte(8))return new Decimal("e85e10");
		return new Decimal("ee12");
	},
	effectDescription(){
		if(player.um.meta.gte(1)){
			return "providing "+formatWhole(player.um.meta)+" upgraded Meta-Milestones.";
		}
		return "";
	},
	exponent: function(x){
		if(x===undefined)x=player.um.points;
		var p=new Decimal(1.9);
		if(player.r.stage>=2){
			p=new Decimal(1.25).add(x.pow(1.5).min(x.mul(2.5)).div(25));
		}else if(player.r.stage>=1){
			p=new Decimal(1.5);
			let scaling=x.sub(10).div(20);
			if(x.gte(99))scaling=x.div(14);
			if(x.gte(119))scaling=x.div(Decimal.sub(20,x.div(30).mul(2)).min(1));
			p=p.add(scaling);
		}else if(x.gte(24)){
			let scaling=x.sub(23).div(35);
			p=p.add(scaling);
		}
		return p;
	},
    hotkeys: [
        {key: "u", description: "U: Get Upgraded Milestone", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.m.effective.gte(160) && player.r.universe==0},
	resetsNothing(){return true},
	autoPrestige(){return false},
    resetDescription: "Get ",
	doReset(){},
	tabFormat: ["main-display","prestige-button","resource-display"],
	branches(){
		if(player.m.effective.gte(184)||player.r.stage>=1){
			return ["pb"];
		}
		return ["m"];
	},
	update(){
		player.um.meta=player.um.points.sub(35).max(0).div(5).floor();
		if(player.um.meta.gte(1)){//quick autobuy
			while(true){
				let req=layers.um.requires().mul(layers.um.base().pow(Decimal.pow(player.um.points,layers.um.exponent())));
				if(player.points.gt(req))player.um.points=player.um.points.add(1);
				else break;
			}
		}
	}
})