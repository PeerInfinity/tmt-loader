addLayer("ep", {
    name: "exotic prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "EP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color() {return "#648c11"},
    requires(){
		return new Decimal("1e8000");
	},
    resource() {return "exotic prestige points"},
    baseResource() {return "prestige power"}, // Name of resource prestige is based on
    baseAmount() {return player.pp.points}, // Get the current amount of baseResource
    type() {return 'normal'}, // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
		if (player.mp.buyables[11].gte(1) && player.mp.activeChallenge!=21) mult = mult.mul(buyableEffect('mp',11))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
		let m=new Decimal(1);
		return m;
    },
	exponent(){
		return 1e-3;
	},
    oneEffect() {
		if(inChallenge("mp",11))return new Decimal(0);
        let eff = player.ep.points.add(1).log10().add(1).log10().div(10);
		if (player.em.best.gte(13)) eff = eff.mul(2)
		if (player.mp.buyables[12].gte(3))eff = eff.mul(1.1)
		eff = eff.mul(player.ep.buyables[11].add(9).div(10).floor().max(1).log10().div(10).add(1));
		return eff;
    },
    twoEffect() {
		if(inChallenge("mp",11))return new Decimal(1);
        let eff = player.ep.points.add(10).log10();
		let sclevel=player.ep.buyables[11].add(8).div(10).floor();
		if(player.mp.buyables[12].gte(1))sclevel = sclevel.add(1);
		if(sclevel.gte(3)){
			if(eff.gte(10))eff = eff.mul(1e9).pow(0.1).max(eff.log10().mul(10));
		}else if(sclevel.gte(2)){
			if(eff.gte(10))eff = eff.log10().mul(10);
		}else{
			if(eff.gte(3))eff = eff.div(3).log10().add(1).mul(3);
		}
		eff = eff.mul(challengeEffect("mp",11));
		return eff;
    },
	threeEffect() {
		if(inChallenge("mp",11))return new Decimal(1);
        let eff = player.ep.points.add(10).log10().pow(0.01).div(player.mp.buyables[12].gte(2)?4000:10000).add(1)
        return eff.toNumber();
    },
	fourEffect() {
        let eff = new Decimal(1);
		return eff;
    },
	fiveEffect() {
		if(inChallenge("mp",11))return new Decimal(1);
        let eff = player.ep.points.add(1).log10().add(1).log10().add(1).log10().div(10).add(1).pow(0.5)
		if (player.mp.buyables[12].gte(4)) eff = player.ep.points.add(1).log10().add(1).log10().add(1).log10().div(5).add(1).pow(0.5)
        return eff;
    },
	sixEffect() {
		if(inChallenge("mp",11))return new Decimal(1);
        let eff = player.ep.points.add(10).log10();
		if(player.mp.buyables[12].gte(5)){
			if(eff.gte(10))eff = eff.log10().mul(10);
		}else{
			if(eff.gte(3))eff = eff.div(3).log10().add(1).mul(3);
		}
		return eff;
	},
	sevenEffect() {
		if(inChallenge("mp",11))return new Decimal(0);
        let eff = player.ep.points.add(1).log10().add(1).log10().add(1).log10().add(1);
		if (player.em.best.gte(15)) eff = player.ep.points.add(1).log10().add(1).log10().add(1);
		if (player.mp.buyables[12].gte(7)) eff = player.ep.points.add(1).log10().add(1).log10().add(1).pow(1.05);
		eff = eff.add(challengeEffect("mp",12));
        return eff;
    },
	eightEffect() {
		if(inChallenge("mp",11))return new Decimal(1);
        let eff = player.ep.points.add(1).log10().add(1).log10().add(1).log10().div(10).add(1).pow(0.5);
		if (player.mp.buyables[12].gte(6)) eff = player.ep.points.add(1).log10().add(1).log10().add(1).log10().div(5).add(1).pow(0.5);
		return eff;
    },
	nineEffect() {
		if(inChallenge("mp",11))return new Decimal(1);
        let eff = player.ep.points.add(1).log10().add(1).log10().add(1).log10().div(10).add(1).pow(0.5);
		if (player.mp.buyables[12].gte(8)) eff = player.ep.points.add(1).log10().add(1).log10().add(1).log10().div(5).add(1).pow(0.5);
		return eff;
    },
	tenEffect() {
		if(inChallenge("mp",11))return new Decimal(1);
        let eff = player.ep.points.add(1).log10().add(1).log10().add(1).log10().div(10).add(1);
		if (player.mp.buyables[12].gte(9)) eff = player.ep.points.add(1).log10().add(1).log10().add(1).log10().div(5).add(1);
		return eff;
    },
    row: 3,
    hotkeys: [
        {key: "x", description: "X: Reset for exotic prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.m.effective.gte(230) && player.r.universe==1},
	upgrades: {
        rows: 4,
        cols: 4,
		11: {
			title: "Exotic Prestige Upgrade 11",
            description: "4th Milestone's effect is boosted by your exotic prestige points.<br>Req: Fusion Tier 2",
            cost: new Decimal(25),
            unlocked() { return true;}, // The upgrade is only visible when this is true
			effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
				let base=1.2;
                let ret = Decimal.pow(base,Decimal.log10(player[this.layer].points.add(1)).pow(0.275).add(1)).max(1)
                ret = softcap(ret,new Decimal(1e9),0.1);
				if(ret.gte(1e50))ret = player[this.layer].points.add(1).log10().pow(4);
				return ret;
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
		12: {
			title: "Exotic Prestige Upgrade 12",
            description: "Prestige Buyable 'Softcap Delayer' is cheaper.",
            cost: new Decimal('ee6'),
            unlocked() { return player.mp.buyables[21].gte(1)&& player.mp.activeChallenge!=21}, // The upgrade is only visible when this is true
        },
		13: {
			title: "Exotic Prestige Upgrade 13",
            description: "Super Prestige Buyable 'Softcap Delayer' is cheaper.",
            cost: new Decimal('e2e7'),
            unlocked() { return player.mp.buyables[21].gte(2)&& player.mp.activeChallenge!=21}, // The upgrade is only visible when this is true
        },
		14: {
			title: "Exotic Prestige Upgrade 14",
            description: "Change the formula for Power Scaler.",
            cost: new Decimal('ee9'),
            unlocked() { return player.mp.buyables[21].gte(3)&& player.mp.activeChallenge!=21},
        },
		21: {
			title: "Exotic Prestige Upgrade 21",
            description: "Reincarnation Point gain is boosted by your exotic prestige points.",
            cost: new Decimal('ee11'),
            unlocked() { return player.mp.buyables[21].gte(4)&& player.mp.activeChallenge!=21},
			effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player[this.layer].points.add(1).log10().add(1).log10().add(1).log10().div(20).add(1)
				if(hasUpgrade("ep",22))ret = player[this.layer].points.add(1).log10().add(1).log10().add(1).log10().div(10).add(1).pow(1.1)
                return ret;
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
		22: {
			title: "Exotic Prestige Upgrade 22",
            description: "Exotic Prestige Upgrade 21 is better",
            cost: new Decimal('ee13'),
            unlocked() { return player.mp.buyables[21].gte(5)&& player.mp.activeChallenge!=21},
        },
	},
	buyables: {
		rows: 2,
		cols: 2,
		11:{
			title(){
				return "<h3 class='ef'>Exotic Fusioner</h3>";
			},
			display(){
				let data = tmp[this.layer].buyables[this.id];
				return "<h4 class='ef'>Tier: "+format(player[this.layer].buyables[this.id],0)+"<br></h4>"+
				"Unlocking "+format(data.effect,0)+" more effects<br>"+
				"Cost for Next Tier: "+format(data.cost,0)+" Exotic Prestige points";
			},
			cost(){
				if(player.m.effective.gte(264))return Decimal.pow(1.5,Decimal.pow(1.4,player.ep.buyables[11].pow(2)));
				if(player.ep.buyables[11].gte(9))return Decimal.dInf;
				return [new Decimal("2"),new Decimal("8"),new Decimal("512"),new Decimal("1e55"),new Decimal("1e170"), new Decimal('1e2000'),new Decimal('1e150000'),new Decimal('1e3330000'),new Decimal("ee9"),Decimal.dInf][player.ep.buyables[11].toNumber()]
			},
			canAfford() {
                   return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)
			},
               buy() { 
                player.ep.points = player.ep.points.sub(this.cost())
                   player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
               },
			  effect(){
				  let b=1;
                  let eff=new Decimal(0).add(player[this.layer].buyables[this.id].mul(b)).min(10);
				  return eff;
			  },
			  unlocked(){
				  return true;
			  },
			  style() {
				if (player.ep.points.lt(this.cost())) return {
					'border-radius': '0%',
					'color':'white',
					'background-color':'black',
					'border':'2px solid',
					'height':'100px'
				}
				else return {
					'border-radius': '0%',
					'color':'white',
					'background-color':'rgb(68, 68, 68)',
					'border':'2px solid',
					'height':'100px'
				}
			  }, 
		},
	},
    tabFormat: {
		"Main":{
			content:[
				"main-display","prestige-button","resource-display",
				["display-text",function(){table = ''
                if (player.ep.buyables[11].gte(1)) table += '1st effect'+(player.ep.buyables[11].gte(11)?' (Tier '+formatWhole(player.ep.buyables[11].add(9).div(10).floor())+")":'')+': +' + format(tmp.ep.oneEffect,4) + " free completions for each AP challenge"
                if (player.ep.buyables[11].gte(2)) table += '<br>2nd effect'+(player.ep.buyables[11].gte(11)?' (Tier '+formatWhole(player.ep.buyables[11].add(8).div(10).floor())+")":'')+': ' + format(tmp.ep.twoEffect,4) + "x Transcend Points gain"
				if (player.ep.buyables[11].gte(3)) table += '<br>3rd effect'+(player.ep.buyables[11].gte(11)?' (Tier '+formatWhole(player.ep.buyables[11].add(7).div(10).floor())+")":'')+': Hyper Boost effect base +' + format(tmp.ep.threeEffect-1,4)
				if (player.ep.buyables[11].gte(4)) table += '<br>4th effect'+(player.ep.buyables[11].gte(11)?' (Tier '+formatWhole(player.ep.buyables[11].add(6).div(10).floor())+")":'')+': Transcend Points hardcap starts ' + format(tmp.ep.fourEffect,4) + "x later"
				if (player.ep.buyables[11].gte(5)) table += '<br>5th effect'+(player.ep.buyables[11].gte(11)?' (Tier '+formatWhole(player.ep.buyables[11].add(5).div(10).floor())+")":'')+': Hyper-Prestige Points ^' + format(tmp.ep.fiveEffect,4)
				if (player.ep.buyables[11].gte(6)) table += '<br>6th effect'+(player.ep.buyables[11].gte(11)?' (Tier '+formatWhole(player.ep.buyables[11].add(4).div(10).floor())+")":'')+': ' + format(tmp.ep.sixEffect,4) + "x Special Transcend Points gain"
				if (player.ep.buyables[11].gte(7)) table += '<br>7th effect'+(player.ep.buyables[11].gte(11)?' (Tier '+formatWhole(player.ep.buyables[11].add(3).div(10).floor())+")":'')+': +' + format(tmp.ep.sevenEffect,4) + " free Prestige Boosts"
				if (player.ep.buyables[11].gte(8)) table += '<br>8th effect'+(player.ep.buyables[11].gte(11)?' (Tier '+formatWhole(player.ep.buyables[11].add(2).div(10).floor())+")":'')+': Base prestige energy gain ^' + format(tmp.ep.eightEffect,4)
				if (player.ep.buyables[11].gte(9)) table += '<br>9th effect'+(player.ep.buyables[11].gte(11)?' (Tier '+formatWhole(player.ep.buyables[11].add(1).div(10).floor())+")":'')+': ' + format(tmp.ep.nineEffect,4) + "x Reincarnation Points gain"
				if (player.ep.buyables[11].gte(10)) table += '<br>10th effect'+(player.ep.buyables[11].gte(11)?' (Tier '+formatWhole(player.ep.buyables[11].add(0).div(10).floor())+")":'')+': ' + format(tmp.ep.tenEffect,4) + "x Reincarnation Power gain"
				return table}],
				"buyables",
                "upgrades"
			]
		},
    },
	branches: ["pp"],
	passiveGeneration(){
		if(player.m.effective.gte(233))return 100;
		return 0;
	},
	softcap(){
		return new Decimal(Infinity);
	},
	softcapPower(){
		return new Decimal(1);
	},
		doReset(l){
			if(l=="ep")layerDataReset("pp",["upgrades"]);
		},
	update(diff){
	}
})