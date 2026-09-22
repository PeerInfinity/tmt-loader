addLayer("pp", {
    name: "prestige power", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "PP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        power: new Decimal(0),
    }},
    color: "#652021",
    requires(){
		if(player.r.stage>=2)return new Decimal('e7e13');
		return new Decimal('e4e28');
	},
    resource: "prestige power", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade(this.layer, 22)) mult = mult.mul(upgradeEffect(this.layer, 22))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
		let m= new Decimal(1)
        if (hasUpgrade('mp', 11)) m=m.mul(upgradeEffect('mp', 11))
		return m;
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
	exponent(){
		if(player.r.stage>=2)return 1e-14;
		return 1e-28;
	},
    hotkeys: [
        {key: "W", description: "W: Reset for prestige power", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.m.effective.gte(220) && player.r.universe==1},
	upgrades: {
        rows: 4,
        cols: 4,
		11: {
			title: "Prestige Power Upgrade 11",
            description: "First Milestone's softcap starts later by your prestige power strength.",
            cost: new Decimal(23),
            currencyDisplayName: "Hz of Prestige Power", // Use if using a nonstandard currency
            currencyInternalName: "power", // Use if using a nonstandard currency
            currencyLayer: "pp",
            unlocked() { return true}, // The upgrade is only visible when this is true
			effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = Decimal.log10(player[this.layer].power.add(10)).pow(0.1);
                return ret;
            },
            effectDisplay() { return format(this.effect())+"x later" }, // Add formatting to the effect
        },
        12: {
			title: "Prestige Power Upgrade 12",
            description: "1st row of prestige upgrades are boosted by your prestige power strength.",
            cost: new Decimal(1600),
            currencyDisplayName: "Hz of Prestige Power", // Use if using a nonstandard currency
            currencyInternalName: "power", // Use if using a nonstandard currency
            currencyLayer: "pp",
            unlocked() { return true}, // The upgrade is only visible when this is true
			effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = Decimal.log10(player[this.layer].power.add(10)).pow(0.05);
                return ret;
            },
            effectDisplay() { return "^"+format(this.effect()) }, // Add formatting to the effect
        },
        13: {
			title: "Prestige Power Upgrade 13",
            description: "1st Prestige Buyable effect is boosted by your prestige power strength.",
            cost: new Decimal(10000),
            currencyDisplayName: "Hz of Prestige Power", // Use if using a nonstandard currency
            currencyInternalName: "power", // Use if using a nonstandard currency
            currencyLayer: "pp",
            unlocked() { return true}, // The upgrade is only visible when this is true
			effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = Decimal.log10(player[this.layer].power.add(1)).pow(0.05).div(1000).toNumber();
				if (hasUpgrade('pp', 21)) ret *= 2;
                return ret;
            },
            effectDisplay() { return "+"+format(this.effect())+" to base" }, // Add formatting to the effect
        },
        14: {
			unlocked() {return player.m.effective.gte(243)},
			title: "Prestige Power Upgrade 14",
            description: "Reincarnation Point gain is boosted by your prestige power strength.",
            cost: new Decimal(1e16),
            currencyDisplayName: "Hz of Prestige Power", // Use if using a nonstandard currency
            currencyInternalName: "power", // Use if using a nonstandard currency
            currencyLayer: "pp",
            unlocked() { return true}, // The upgrade is only visible when this is true
			effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player[this.layer].power.add(1).log10().add(1).log10().div(5).add(1)
                return ret;
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
        21: {
			unlocked() {return player.m.effective.gte(243)},
			title: "Prestige Power Upgrade 21",
			description: "Prestige Power Upgrade 13 is better.<br>Req: Power Scaler - [17 Lvl]",
			cost: new Decimal(1e10),
			canAfford() {return player.pp.buyables[11].gte(17) && player.pp.power.gte(1e10)},
			currencyDisplayName: "Hz of Prestige Power", // Use if using a nonstandard currency
			currencyInternalName: "power", // Use if using a nonstandard currency
			currencyLayer: "pp", // The upgrade is only visible when this is true
		},
        22: {
			unlocked() {return player.m.effective.gte(243)},
			title: "Prestige Power Upgrade 22",
			description: "Exotic Prestige Points boosts Prestige Power gain.<br>Req: Power Scaler - [35 Lvl]",
			cost: new Decimal(1e21),
			canAfford() {return player.pp.buyables[11].gte(35) && player.pp.power.gte(1e21)},
            currencyDisplayName: "Hz of Prestige Power", // Use if using a nonstandard currency
            currencyInternalName: "power", // Use if using a nonstandard currency
            currencyLayer: "pp", // The upgrade is only visible when this is true
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
				let base=new Decimal("1e1000");
                let ret = Decimal.pow(base,Decimal.log10(player.ep.points.add(1)).pow(0.9).add(1))
				return ret;
            },
            effectDisplay() { return "x"+format(this.effect()) },
        },

	},
    buyables: {
		rows: 1,
		cols: 1,
		11:{
			title(){
				return "Power Scaler";
			},
			display(){
				let data = tmp[this.layer].buyables[this.id];
				return "Level: "+format(player[this.layer].buyables[this.id])+"<br>"+
				"Strenghens Prestige Power by "+format(data.effect)+" Hz/s (based on milestones)<br>"+
				"Cost for Next Level: "+format(data.cost)+" Prestige power";
			},
			cost(){
				let a=player[this.layer].buyables[this.id];
				a=Decimal.pow(2,a);
				return new Decimal(3).mul(a.pow(1.4).ceil());
			},
			canAfford() {
                   return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)
			},
               buy() { 
                player.pp.points = player.pp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
               },
			  effect(){
				  let b=0.23;
				  let eff=new Decimal(0).add(player[this.layer].buyables[this.id].mul(b).mul(player.m.points.pow(0.15)));
                  if (hasUpgrade('ep',14))eff=(player[this.layer].buyables[this.id].mul(player.m.points)).pow(player[this.layer].buyables[this.id].add(1).log10().add(1).log10().add(1));
                  if (player.m.points.gte(223)) eff = eff.times(tmp.m.milestone223Effect)
				  return eff;
			  },
			  unlocked(){
				  return true;
			  }
		},
	},
    tabFormat: {
		"Main":{
			content:[
				"main-display","prestige-button","resource-display",
				["display-text",function(){return "Your Prestige Power is "+format(player.pp.power) + " Hz powerful"}],
                'buyables',
                'upgrades',

			]
		},
	},
	branches: ["p"],
	softcap:new Decimal(Infinity),
	softcapPower:new Decimal(1),
	passiveGeneration(){
        if (player.m.points.gte(224)) return 100
		return 0;
	},
		doReset(l){
			if(l=="pp")layerDataReset("p",["upgrades"]);
		},
	update(diff){
        if (player.pp.buyables[11].gte(1)) player.pp.power = player.pp.power.add(buyableEffect('pp', 11).times(diff));//.min(1.14514e50);
			
		if(player.m.effective.gte(224)){
			var target=player.pp.points.add(1).div(3).root(1.4).log(2);
			target=target.add(1).floor();
			if(target.gt(player.pp.buyables[11])){
				player.pp.buyables[11]=target;
			}
		}
	}
})