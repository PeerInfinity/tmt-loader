
addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#658091",
    requires(){
		return new Decimal(2000);
	},
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
		if(player.ap.activeChallenge==31||player.r.activeChallenge==11)return new Decimal(0);
		if(player.m.effective.gte(6))mult=mult.mul(tmp.m.milestone6Effect);
		if(hasUpgrade("p",13))mult=mult.mul(upgradeEffect("p",13));
		if(hasUpgrade("p",14))mult=mult.mul(upgradeEffect("p",14));
		if(player.m.effective.gte(22))mult=mult.mul(player.um.points.gte(22)?100:22);
		if(hasUpgrade("sp",13))mult=mult.mul(upgradeEffect("sp",13));
		if(hasUpgrade("sp",14))mult=mult.mul(upgradeEffect("sp",14));
		if(hasUpgrade("hp",13))mult=mult.mul(upgradeEffect("hp",13));
		if(hasUpgrade("hp",14))mult=mult.mul(upgradeEffect("hp",14));
		if(hasUpgrade("ap",12))mult=mult.mul(upgradeEffect("ap",12));
		mult=mult.mul(tmp.sp.buyables[11].effect);
		mult=mult.mul(tmp.hp.buyables[11].effect);
		mult=mult.mul(tmp.p.buyables[12].effect);
		if(sha512_256(localStorage.supporterCode).slice(0,2) == 'b4' && window.supporterCodeInput){return mult.mul(2)}
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
		let m=layers.pb.effect();
		if(hasUpgrade("t",12))m=m.mul(1.005);
		if(hasUpgrade("t",32))m=m.mul(1.005);
		if(player.t.activeChallenge==21||player.t.activeChallenge==31||player.t.activeChallenge==41)m=m.mul(tmp.t.dilationEffect);
		m=m.mul(layers.t.getSpecialEffect(21));
		if(player.um.points.gte(5))m=m.mul(1.01);
		if(player.um.points.gte(22))m=m.mul(1.01);
		return m;
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
	exponent(){
		if(player.r.stage>=2)return 1e-5;
		return 0.5;
	},
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.m.effective.gte(5)},
	upgrades: {
        rows: 4,
        cols: 4,
		11: {
			title: "Prestige Upgrade 11",
            description: "First Milestone's effect is boosted by your prestige points.",
            cost: new Decimal(1),
            unlocked() { return true}, // The upgrade is only visible when this is true
			effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
				let base=3;
				if(player.m.effective.gte(11))base+=0.5;
				if(player.m.effective.gte(31))base+=0.5;
				if(player.m.effective.gte(44))base+=0.2;
				if(player.m.effective.gte(54))base+=0.3;
				if(player.m.effective.gte(64))base+=0.1;
				if(player.m.effective.gte(74))base+=0.244;
				if(player.m.effective.gte(84))base+=0.156;
				if(player.m.effective.gte(94))base+=0.1;
				if(player.um.points.gte(10))base+=0.9;
				if(player.um.points.gte(11))base+=1;
				if(player.um.points.gte(31))base+=0.5;
				if(player.um.points.gte(44))base+=0.1;//7.6
				if(player.um.points.gte(54))base+=1;//8.6
				if(player.um.points.gte(64))base+=0.4;//9
				if(player.um.points.gte(74))base+=0.4;//9.4
				if(player.um.points.gte(84))base+=0.1;//9.5
				if(player.um.points.gte(94))base+=0.1;//9.6
                let ret = Decimal.pow(base,Decimal.log10(player[this.layer].points.add(1)).pow(0.9).add(1))
                if (hasUpgrade('pp',12)) ret = ret.pow(upgradeEffect('pp', 12))
                return ret;
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
		12: {
			title: "Prestige Upgrade 12",
            description: "First Milestone's effect is boosted by your prestige points.",
            cost: new Decimal(4),
            unlocked() { return true}, // The upgrade is only visible when this is true
			effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
				let base=2;
				if(player.m.effective.gte(12))base+=0.4;
				if(player.m.effective.gte(32))base+=0.2;
				if(player.m.effective.gte(44))base+=0.2;
				if(player.m.effective.gte(54))base+=0.2;
				if(player.m.effective.gte(64))base+=0.1;
				if(player.m.effective.gte(74))base+=0.1;
				if(player.m.effective.gte(84))base+=0.1;
				if(player.m.effective.gte(94))base+=0.1;
				if(player.um.points.gte(10))base+=0.1;
				if(player.um.points.gte(12))base+=0.5;
				if(player.um.points.gte(32))base+=0.5;
				if(player.um.points.gte(44))base+=0.1;//4.6
				if(player.um.points.gte(54))base+=0.1;//4.7
				if(player.um.points.gte(64))base+=0.1;//4.8
				if(player.um.points.gte(74))base+=0.1;//4.9
				if(player.um.points.gte(84))base+=0.1;//5
				if(player.um.points.gte(94))base+=0.1;//5.3
                let ret = Decimal.pow(base,Decimal.log10(player[this.layer].points.add(1)).pow(0.9).add(1))
                if (hasUpgrade('pp',12)) ret = ret.pow(upgradeEffect('pp', 12))
                return ret;
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
		13: {
			title: "Prestige Upgrade 13",
            description: "Prestige Point gain is boosted by your prestige points.",
            cost: new Decimal(100000000),
            unlocked() { return player.m.effective.gte(10)}, // The upgrade is only visible when this is true
			effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
				let base=1.4;
				if(player.m.effective.gte(13))base+=0.1;
				if(player.m.effective.gte(33))base+=0.05;
				if(player.m.effective.gte(44))base+=0.05;
				if(player.m.effective.gte(54))base+=0.1;
				if(player.m.effective.gte(64))base+=0.05;
				if(player.m.effective.gte(74))base+=0.1;
				if(player.m.effective.gte(84))base+=0.05;
				if(player.m.effective.gte(94))base+=0.05;
				if(player.um.points.gte(13))base+=0.05;
				if(player.um.points.gte(15))base+=0.05;
				if(player.um.points.gte(33))base+=0.15;//2.2
				if(player.um.points.gte(44))base+=0.3;//2.5
				if(player.um.points.gte(54))base+=0.5;//3
				if(player.um.points.gte(64))base+=0.1;//3.1
				if(player.um.points.gte(74))base+=0.2;//3.3
				if(player.um.points.gte(84))base+=0.1;//3.4
				if(player.um.points.gte(94))base+=0.2;//3.6
                let ret = Decimal.pow(base,Decimal.log10(player[this.layer].points.add(1)).pow(0.9).add(1))
                if (hasUpgrade('pp',12)) ret = ret.pow(upgradeEffect('pp', 12))
                return ret;
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
		14: {
			title: "Prestige Upgrade 14",
            description: "Prestige Point gain is boosted by your prestige points.",
            cost: new Decimal(1e11),
            unlocked() { return player.m.effective.gte(10)}, // The upgrade is only visible when this is true
			effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
				let base=1.2;
				if(player.m.effective.gte(14))base+=0.05;
				if(player.m.effective.gte(34))base+=0.1;
				if(player.m.effective.gte(44))base+=0.05;
				if(player.m.effective.gte(54))base+=0.1;
				if(player.m.effective.gte(64))base+=0.05;
				if(player.m.effective.gte(74))base+=0.1;
				if(player.m.effective.gte(84))base+=0.05;
				if(player.m.effective.gte(94))base+=0.05;
				if(player.um.points.gte(14))base+=0.05;
				if(player.um.points.gte(15))base+=0.05;
				if(player.um.points.gte(34))base+=0.15;//2
				if(player.um.points.gte(44))base+=0.1;//2.1
				if(player.um.points.gte(54))base+=0.1;//2.2
				if(player.um.points.gte(64))base+=0.1;//2.3
				if(player.um.points.gte(74))base+=0.2;//2.5
				if(player.um.points.gte(84))base+=0.1;//2.6
				if(player.um.points.gte(94))base+=0.1;//2.7
                let ret = Decimal.pow(base,Decimal.log10(player[this.layer].points.add(1)).pow(0.9).add(1))
                if (hasUpgrade('pp',12)) ret = ret.pow(upgradeEffect('pp', 12))
                return ret;
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
		21: {
			title: "Prestige Upgrade 21",
            description(){ if(player.um.points.gte(21))return "6th Milestone's effect is squared";return "6th Milestone's effect ^1.5";},
            cost: new Decimal(1e25),
            unlocked() { return player.m.effective.gte(15)}, // The upgrade is only visible when this is true
        },
		22: {
			title: "Prestige Upgrade 22",
            description(){ if(player.um.points.gte(21))return "6th Milestone's effect is squared";return "6th Milestone's effect ^1.5";},
            cost: new Decimal(1e33),
            unlocked() { return player.m.effective.gte(15)}, // The upgrade is only visible when this is true
        },
		23: {
			title: "Prestige Upgrade 23",
            description: "Third Milestone's effect is boosted by your prestige points.",
            cost: new Decimal(1e63),
            unlocked() { return player.m.effective.gte(21)}, // The upgrade is only visible when this is true
        },
		24: {
			title: "Prestige Upgrade 24",
            description: "Third Milestone's effect is boosted by your prestige points.",
            cost: new Decimal(1e80),
            unlocked() { return player.m.effective.gte(21)}, // The upgrade is only visible when this is true
        },
		31: {
			title: "Prestige Upgrade 31",
            description: "Milestone Cost Scaling is weaker based on your prestige points.",
            cost: new Decimal("1e6810"),
			effect(){
				let p=player.p.points.add(1e20).log10().log10().div(77);
				if(hasUpgrade("p",32))p=p.mul(2);
				if(hasUpgrade("p",33))p=p.mul(1.5);
				if(hasUpgrade("p",34))p=p.mul(1.2);
				if(hasUpgrade("t",21))p=p.mul(1.1);
				if(player.um.points.gte(45))p=p.mul(1.001);
				if(player.um.points.gte(45)&&hasUpgrade("p",32))p=p.mul(1.001);
				if(player.um.points.gte(45)&&hasUpgrade("p",33))p=p.mul(1.001);
				if(player.um.points.gte(45)&&hasUpgrade("p",34))p=p.mul(1.001);
				return p.add(1);
			},
            unlocked() { return player.m.effective.gte(45)}, // The upgrade is only visible when this is true
            effectDisplay() { return format(this.effect(),4)+"x weaker" }, // Add formatting to the effect
        },
		32: {
			title: "Prestige Upgrade 32",
            description: "Prestige Upgrade 31 is boosted.",
            cost: new Decimal("1e8740"),
            unlocked() { return player.m.effective.gte(45)}, // The upgrade is only visible when this is true
        },
		33: {
			title: "Prestige Upgrade 33",
            description: "Prestige Upgrade 31 is boosted.",
            cost: new Decimal("1e10920"),
            unlocked() { return player.m.effective.gte(45)}, // The upgrade is only visible when this is true
        },
		34: {
			title: "Prestige Upgrade 34",
            description: "Prestige Upgrade 31 is boosted.",
            cost: new Decimal("1e16330"),
            unlocked() { return player.m.effective.gte(45)}, // The upgrade is only visible when this is true
        },
		41: {
			title: "Prestige Upgrade 41",
            description: "Same as Prestige Upgrade 23. To buy this upgrade, You need to complete AP challenge 4 19.7 times.",
            cost(){
				if(player.ap.challenges[22]<19.7 && !player.um.points.gte(124))return new Decimal(Infinity);
				return new Decimal("e185e9");
			},
            unlocked() { return player.m.effective.gte(124)}, // The upgrade is only visible when this is true
        },
		42: {
			title: "Prestige Upgrade 42",
            description: "Same as Prestige Upgrade 23. To buy this upgrade, You need to complete AP challenge 3 14.1 times.",
            cost(){
				if(player.ap.challenges[21]<14.1 && !player.um.points.gte(124))return new Decimal(Infinity);
				return new Decimal("e210e9");
			},
            unlocked() { return player.m.effective.gte(124)}, // The upgrade is only visible when this is true
        },
		43: {
			title: "Prestige Upgrade 43",
            description: "First Prestige buyable is boosted. You can buy this upgrade while you're in T challenge 2.",
            cost(){
				if(player.t.activeChallenge!=12 && !player.um.points.gte(124))return new Decimal(Infinity);
				return new Decimal("e1875e5");
			},
            unlocked() { return player.m.effective.gte(124)}, // The upgrade is only visible when this is true
        },
		44: {
			title: "Prestige Upgrade 44",
            description: "First Prestige buyable is boosted. You can buy this upgrade while you're in T challenge 4.",
            cost(){
				if(player.t.activeChallenge!=22 && !player.um.points.gte(124))return new Decimal(Infinity);
				return new Decimal("e5e5");
			},
            unlocked() { return player.m.effective.gte(124)}, // The upgrade is only visible when this is true
			currencyDisplayName(){ return "points"},
			currencyInternalName(){ return "points"},
        },
	},
	buyables: {
		rows: 1,
		cols: 2,
		11:{
			title(){
				return "Softcap Delayer";
			},
			display(){
				let data = tmp[this.layer].buyables[this.id];
				return "Level: "+format(player[this.layer].buyables[this.id])+"<br>"+
				"1st Milestone's softcap starts "+format(data.effect)+"x later<br>"+
				"Cost for Next Level: "+format(data.cost)+" Prestige points";
			},
			cost(){
				let a=player[this.layer].buyables[this.id];
				a=Decimal.pow(2,a);
				return new Decimal(1).mul(Decimal.pow((player.um.points.gte(123)?"ee8":player.um.points.gte(121)?"e3e8":hasUpgrade("ep",12)?"ee9":"ee10"),a));
			},
			canAfford() {
                   return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)
			},
               buy() { 
                   player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
               },
			  effect(){
				  if(player.ap.activeChallenge==32||player.r.activeChallenge==11)return new Decimal(1);
				  let b=0.03;
				  if(hasUpgrade("p",43))b+=0.011;
				  if(hasUpgrade("p",44))b+=0.011;
				  if(player.m.effective.gte(162))b+=0.008;
                  if (hasUpgrade('pp', 13))b+=upgradeEffect('pp', 13);
				  let eff=new Decimal(1).add(player[this.layer].buyables[this.id].mul(b));
				  eff=eff.pow(tmp.ap.challenges[32].rewardEffect);
				  return eff;
			  },
			  unlocked(){
				  return player.m.effective.gte(121);
			  }
		},
		12:{
			title(){
				return "Prestige Multiplier";
			},
			display(){
				let data = tmp[this.layer].buyables[this.id];
				return "Level: "+format(player[this.layer].buyables[this.id])+"<br>"+
				"Prestige Point is multiplied by "+format(data.effect)+"<br>"+
				"Cost for Next Level: "+format(data.cost)+" Prestige points";
			},
			cost(){
				let a=player[this.layer].buyables[this.id];
				if(a.gte(3)){
					let p=1.3;
					a=a.div(3).pow(p).mul(3);
				}
				return Decimal.pow("1e100000",a);
			},
			canAfford() {
                   return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)
			},
               buy() { 
                   player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
               },
			  effect(){
				  if(player.ap.activeChallenge==32||player.r.activeChallenge==11)return new Decimal(1);
				  let eff=new Decimal("1e10000").pow(player[this.layer].buyables[this.id]);
				  eff=eff.pow(tmp.ap.challenges[32].rewardEffect);
				  return eff;
			  },
			  unlocked(){
				  return player.m.effective.gte(156);
			  }
		},
	},
	branches: ["m"],
	passiveGeneration(){
		if(player.um.points.gte(20))return 1e20;
		if(player.m.effective.gte(135))return 1e10;
		if(player.m.effective.gte(20))return 100;
		return 0;
	},
	softcap(){
		if(player.t.activeChallenge==32||player.t.activeChallenge==42)return getPointSoftcapStart();
		return getPointHardcapStart();
	},
	softcapPower(){
		return new Decimal(0);
	},
		doReset(l){
			if(l=="p"){return;}
			if(l=="sp")if(player.um.points.gte(26))layerDataReset("p",["upgrades","buyables"]);else if(player.m.effective.gte(26))layerDataReset("p",["upgrades"]);else layerDataReset("p",[]);
			if(l=="pb")if(player.um.points.gte(60))layerDataReset("p",["upgrades","buyables"]);else if(player.m.effective.gte(60))layerDataReset("p",["upgrades"]);else layerDataReset("p",[]);
			if(l=="hp")if(player.um.points.gte(65))layerDataReset("p",["upgrades","buyables"]);else if(player.m.effective.gte(65))layerDataReset("p",["upgrades"]);else layerDataReset("p",[]);
			if(l=="ap")if(player.um.points.gte(81))layerDataReset("p",["upgrades","buyables"]);else if(player.m.effective.gte(81))layerDataReset("p",["upgrades"]);else layerDataReset("p",[]);
			if(l=="t")if(player.um.points.gte(100))layerDataReset("p",["upgrades","buyables"]);else if(player.m.effective.gte(100))layerDataReset("p",["upgrades"]);else layerDataReset("p",[]);
			if(l=="hb")if(player.um.points.gte(104))layerDataReset("p",["upgrades","buyables"]);else if(player.m.effective.gte(104))layerDataReset("p",["upgrades"]);else layerDataReset("p",[]);
			if(l=="a")layerDataReset("p",["upgrades"]);
		},
	update(){
		if(player.m.effective.gte(123)){
			var target=player.p.points.add(1).div(1).log(player.um.points.gte(123)?"ee8":player.um.points.gte(121)?"e3e8":hasUpgrade("ep",12)?"ee9":"ee10").max(0.1).log(2);
			target=target.add(1).floor();
			if(target.gt(player.p.buyables[11])){
				player.p.buyables[11]=target;
			}
		}
		if(player.m.effective.gte(156)){
			var target=player.p.points.add(1).log("1e100000");
			if(target.gte(3)){
				let p=1.3;
				target=target.div(3).pow(1/p).mul(3);
			}
			target=target.add(1).floor();
			if(target.gt(player.p.buyables[12])){
				player.p.buyables[12]=target;
			}
		}
	}
})