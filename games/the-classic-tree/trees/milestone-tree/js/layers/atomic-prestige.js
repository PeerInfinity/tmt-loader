function scaleAPChall1(x){
	x=new Decimal(x);
	if(x.gte(100))x=x.div(100).log(1.01).add(100);
	if(x.gte(200))x=x.div(100).log(1.005).add(200);
	if(x.gte(500))x=x.div(100).log(1.002).add(500);
	return x;
}

function scaleAPChall2(x){
	x=new Decimal(x);
	if(x.gte(500))x=Decimal.pow(1.002,x.sub(500)).mul(500);
	if(x.gte(200))x=Decimal.pow(1.005,x.sub(200)).mul(200);
	if(x.gte(100))x=Decimal.pow(1.01,x.sub(100)).mul(100);
	return x;
}

addLayer("ap", {
    name: "atomic-prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "AP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#A0E0E0",
    requires: new Decimal("1e1997"), // Can be a function that takes requirement increases into account
    resource: "atomic-prestige points", // Name of prestige currency
    baseResource: "hyper-prestige points", // Name of resource prestige is based on
    baseAmount() {return player.hp.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
		if(hasUpgrade("ap",21))mult=mult.mul(upgradeEffect("ap",21));
		if(hasUpgrade("t",62))mult=mult.mul(upgradeEffect("t",62));
		if(sha512_256(localStorage.supporterCode).slice(0,2) == 'b4' && window.supporterCodeInput){return mult.mul(2)}
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let m=layers.a.effect();
		if(hasUpgrade("t",22))m=m.mul(1.01);
		if(player.um.points.gte(80))m=m.mul(1.04);
		return m;
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
	exponent(){
		if(player.r.stage>=2)return 2e-3;
		return 5e-3;
	},
    hotkeys: [
        {key: "a", description: "A: Reset for atomic-prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.m.effective.gte(80) && player.r.universe==0},
	branches(){
		if(player.r.stage>=1)return ["se","hp"];
		return ["hp"]
	},
	softcap(){
		return getPointHardcapStart();
	},
	softcapPower(){
		return new Decimal(0);
	},
	
	upgrades: {
        rows: 4,
		cols: 4,
		11: {
			title: "Atomic-Prestige Upgrade 11",
            description: "First Milestone's effect is boosted by your atomic-prestige points.",
            cost: new Decimal(1),
            unlocked() { return true}, // The upgrade is only visible when this is true
			effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
				let base=new Decimal("1e2000");
				if(player.m.effective.gte(84))base=base.mul("1e4000");
				if(player.m.effective.gte(94))base=base.mul("1e4000");
				if(player.um.points.gte(84))base=base.mul("1e500");
				if(player.um.points.gte(94))base=base.mul("1e500");//1e11000
                let ret = Decimal.pow(base,Decimal.log10(player[this.layer].points.add(1)).pow(0.9).add(1))
				if(player.um.points.gte(84))return ret.mul("e2e5");
                return ret.mul("1e48000").mul(Decimal.pow("1e500",player[this.layer].points.min(140)));
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
		12: {
			title: "Atomic-Prestige Upgrade 12",
            description: "Prestige Point gain is boosted by your atomic-prestige points.",
            cost: new Decimal(4),
            unlocked() { return true}, // The upgrade is only visible when this is true
			effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
				let base=new Decimal("1e1000");
				if(player.m.effective.gte(84))base=base.mul("1e2000");
				if(player.m.effective.gte(94))base=base.mul("1e2000");
				if(player.um.points.gte(84))base=base.mul("1e2500");
				if(player.um.points.gte(94))base=base.mul("1e1000");//1e8500
                let ret = Decimal.pow(base,Decimal.log10(player[this.layer].points.add(1)).pow(0.9).add(1))
				if(player.um.points.gte(84))return ret.mul("e2e5");
                return ret.mul("1e39000").mul(Decimal.pow("1e150",player[this.layer].points.min(500)));
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
		13: {
			title: "Atomic-Prestige Upgrade 13",
            description: "Super-Prestige Point gain is boosted by your atomic-prestige points.",
            cost: new Decimal(5000),
            unlocked() { return true}, // The upgrade is only visible when this is true
			effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
				let base=new Decimal("1e5000");
				if(player.m.effective.gte(84))base=base.mul("1e1000");
				if(player.m.effective.gte(94))base=base.mul("1e1000");
				if(player.um.points.gte(84))base=base.mul("1e100");
				if(player.um.points.gte(94))base=base.mul("1e100");//1e7200
                let ret = Decimal.pow(base,Decimal.log10(player[this.layer].points.add(1)).pow(0.9).add(1))
				if(player.um.points.gte(84))return ret.mul("e2e5");
                return ret.mul("1e20000").mul(Decimal.pow("1e30",player[this.layer].points.sqrt().min(2300)));
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
		14: {
			title: "Atomic-Prestige Upgrade 14",
            description: "Hyper-Prestige Point gain is boosted by your atomic-prestige points.",
            cost: new Decimal(50000),
            unlocked() { return true}, // The upgrade is only visible when this is true
			effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
				let base=new Decimal("1e15");
				if(player.m.effective.gte(84))base=base.mul("1e10");
				if(player.m.effective.gte(94))base=base.mul("1e10");
				if(player.um.points.gte(84))base=base.mul("1e65");
				if(player.um.points.gte(94))base=base.mul("1e900");
				if(player.m.effective.gte(262))base=base.mul("1e4000");//1e5000
                let ret = Decimal.pow(base,Decimal.log10(player[this.layer].points.add(1)).pow(0.9).add(1))
				return ret;
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
		21: {
			title: "Atomic-Prestige Upgrade 21",
            description: "Atomic-Prestige Point gain is boosted by your atomic-prestige points.",
            cost: new Decimal(200000),
            unlocked() { return true}, // The upgrade is only visible when this is true
			effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
				let base=new Decimal(1.4);
				if(player.m.effective.gte(262))base=new Decimal("1e100");//1e100
				if(player.m.effective.gte(267))base=new Decimal("1e500");//1e500
				if(player.m.effective.gte(272))base=new Decimal("1e2500");//1e2500
                let ret = Decimal.pow(base,Decimal.log10(player[this.layer].points.add(1)).pow(0.9).add(1))
				return ret;
            },
            effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        },
		22: {
			title: "Atomic-Prestige Upgrade 22",
            description: "Each upgrade in this row unlocks an Atomic-Prestige challenge.",
            cost: new Decimal(2e9),
            unlocked() { return true}, // The upgrade is only visible when this is true
        },
		23: {
			title: "Atomic-Prestige Upgrade 23",
            description: "Milestone Cost Scaling is weaker based on your atomic-prestige points.",
            cost: new Decimal(3e18),
            unlocked() { return true}, // The upgrade is only visible when this is true
			effect() {
				let p=player.ap.points.add(1e20).log10().log10().div(200);
				if(hasUpgrade("ap",24))p=p.mul(4);
				if(hasUpgrade("ap",33))p=p.mul(2);
				if(hasUpgrade("ap",34))p=p.mul(1.2);
				return p.add(1);
            },
            effectDisplay() { return format(this.effect(),4)+"x weaker" }, // Add formatting to the effect
        },
		24: {
			title: "Atomic-Prestige Upgrade 24",
            description: "Atomic-Prestige Upgrade 23 is boosted.",
            cost: new Decimal(2e35),
            unlocked() { return true}, // The upgrade is only visible when this is true
        },
		31: {
			title: "Atomic-Prestige Upgrade 31",
            description: "The Second Hyper-Prestige buyable's effect ^1.5.",
            cost: new Decimal("1e5470"),
            unlocked() { return hasUpgrade("t",44);}, // The upgrade is only visible when this is true
        },
		32: {
			title: "Atomic-Prestige Upgrade 32",
            description: "1st Milestone's softcap starts later based on your atomic-prestige points.",
            cost: new Decimal("1e5613"),
            unlocked() { return hasUpgrade("t",44);}, // The upgrade is only visible when this is true
			effect() {
				let p=player.ap.points.add(1e20).log10().log10().div(57);
				if(hasUpgrade("ap",33))p=p.mul(2);
				if(hasUpgrade("ap",34))p=p.mul(1.2);
				if(hasUpgrade("ap",41))p=p.mul(1.2);
				if(hasUpgrade("ap",42))p=p.mul(1.2369791666666666666666666666667);
				if(hasUpgrade("ap",43))p=p.mul(1.2307692307692307692307692307692);
				if(hasUpgrade("ap",44))p=p.mul(1.3);
				return p.add(1);
            },
            effectDisplay() { return format(this.effect(),4)+"x later" },
        },
		33: {
			title: "Atomic-Prestige Upgrade 33",
            description: "Atomic-Prestige Upgrade 23 and 32 are boosted.",
            cost: new Decimal("1e6045"),
            unlocked() { return hasUpgrade("t",44);}, // The upgrade is only visible when this is true
        },
		34: {
			title: "Atomic-Prestige Upgrade 34",
            description: "Atomic-Prestige Upgrade 23 and 32 are boosted.",
            cost: new Decimal("1e6951"),
            unlocked() { return hasUpgrade("t",44);}, // The upgrade is only visible when this is true
        },
		41: {
			title: "Atomic-Prestige Upgrade 41",
            description: "Atomic-Prestige Upgrade 32 is better. You can buy this upgrade while you're in T challenge 2.",
            cost(){
				if(player.t.activeChallenge!=12)return new Decimal(Infinity);
				return new Decimal("e5e27");
			},
            unlocked() { return player.m.effective.gte(231)}, // The upgrade is only visible when this is true
        },
		42: {
			title: "Atomic-Prestige Upgrade 42",
            description: "Atomic-Prestige Upgrade 32 is better. You can buy this upgrade while you're in T challenge 4.",
            cost(){
				if(player.t.activeChallenge!=22)return new Decimal(Infinity);
				return new Decimal("e5e28");
			},
            unlocked() { return player.m.effective.gte(231)}, // The upgrade is only visible when this is true
        },
		43: {
			title: "Atomic-Prestige Upgrade 43",
            description: "Atomic-Prestige Upgrade 32 is better. You can buy this upgrade while you're in T challenge 6.",
            cost(){
				if(player.t.activeChallenge!=32)return new Decimal(Infinity);
				return new Decimal("ee23");
			},
            unlocked() { return player.m.effective.gte(231)}, // The upgrade is only visible when this is true
        },
		44: {
			title: "Atomic-Prestige Upgrade 44",
            description: "Atomic-Prestige Upgrade 32 is better. You can buy this upgrade while you're in T challenge 8.",
            cost(){
				if(player.t.activeChallenge!=42)return new Decimal(Infinity);
				return new Decimal("e42e32");
			},
            unlocked() { return player.m.effective.gte(231)}, // The upgrade is only visible when this is true
        },
	},
	
	challenges: {
        rows: 3,
		cols: 2,
		11:{
                name: "No Prestige Boost",
                completionLimit: Infinity,
			    challengeDescription() {return "You can't gain prestige boosts.<br>"+format(challengeCompletions(this.layer, this.id),player.m.effective.gte(120)?4:0)+(player.m.effective.gte(230)?"+"+format(layers.ap.freeChall(),4):"")+" completions"},
                unlocked() { return hasUpgrade("ap",22) && hasUpgrade("ap",21) },
                goal: function(){
					if(player.m.effective.gte(120))return this.goalAfter120(Math.ceil(player.ap.challenges[11]+0.001));
					if(player.ap.challenges[11]>=5)return new Decimal("1e46730000").pow(Decimal.pow(1.3,Decimal.pow(scaleAPChall2(player.ap.challenges[11])-5,1.5)));
					return [new Decimal("1e1960000"),new Decimal("1e3550000"),new Decimal("1e4950000"),new Decimal("1e8150000"),new Decimal("e21640000")][player.ap.challenges[11]]
				},
                currencyDisplayName: "points",
                currencyInternalName: "points",
                rewardDescription() { return "Prestige Boost's effect is better." },
		completionsAfter120(){
				let a=1.32;
				let b=1.3;
				let c=1.4e6;
				if(player.m.effective.gte(130))a-=0.02,c-=4e5;
				if(player.m.effective.gte(168))a-=0.02;
				if(player.m.effective.gte(193)&&player.r.stage>=1)a-=0.03;
				if(player.um.points.gte(120))a-=0.01;
				
				let p=player.points;
				
				if(p.lte(Decimal.pow(10,c)))return 0;
				return scaleAPChall1(p.log10().div(c).log(a).pow(new Decimal(1).div(b).mul(buyableEffect('ap', 12)))).toNumber();
		},
		goalAfter120(x=player.ap.challenges[11]){
				x=scaleAPChall2(x);
				let a=1.32;
				let b=1.3;
				let c=1.4e6;
				if(player.m.effective.gte(130))a-=0.02,c-=4e5;
				if(player.m.effective.gte(168))a-=0.02;
				if(player.m.effective.gte(193)&&player.r.stage>=1)a-=0.03;
				if(player.um.points.gte(120))a-=0.01;
				
				return Decimal.pow(10,Decimal.pow(a,Decimal.pow(x,new Decimal(b).div(buyableEffect('ap', 12)))).mul(c));
		},
		canComplete(){
			return player.points.gte(tmp.ap.challenges[this.id].goal)&&player.m.effective.lt(110);
		},
		
		},
		12:{
                name: "No Super-Prestige",
                completionLimit: Infinity,
			    challengeDescription() {return "You can't gain super-prestige points.<br>"+format(challengeCompletions(this.layer, this.id),player.m.effective.gte(120)?4:0)+(player.m.effective.gte(230)?"+"+format(layers.ap.freeChall(),4):"")+" completions"},
                unlocked() { return hasUpgrade("ap",22) && hasUpgrade("ap",22) },
                goal: function(){
					if(player.m.effective.gte(120))return this.goalAfter120(Math.ceil(player.ap.challenges[12]+0.001));
					if(player.ap.challenges[12]>=5)return new Decimal("1e60560000").pow(Decimal.pow(1.3,Decimal.pow(scaleAPChall2(player.ap.challenges[12])-5,1.5)));
					return [new Decimal("1e2300000"),new Decimal("1e4870000"),new Decimal("1e7000000"),new Decimal("e12500000"),new Decimal("e28880000")][player.ap.challenges[12]]
				},
                currencyDisplayName: "points",
                currencyInternalName: "points",
				rewardEffect() {
					let comp=player.ap.challenges[12]+layers.ap.freeChall().toNumber();
                    let ret = 1+comp*0.05;
					if(comp>=5){
						ret=1.2+comp*0.01;
						if(player.m.effective.gte(122))ret=1.175+comp*0.015;
						if(player.m.effective.gte(138))ret=1.15+comp*0.02;
						if(player.m.effective.gte(144))ret=1.125+comp*0.025;
						if(player.m.effective.gte(196)&&player.r.stage>=1)ret=1.1+comp*0.03;
						if(player.m.effective.gte(197)&&player.r.stage>=1)ret=1.075+comp*0.035;
						if(player.m.effective.gte(198)&&player.r.stage>=1)ret=1.05+comp*0.04;
						if(player.um.points.gte(122))ret=1.045+comp*0.041;
					}
                    return ret;
                },
                rewardDisplay() { return "Super-Prestige points ^"+format(this.rewardEffect()) },
                rewardDescription() { return "Super-Prestige points is boosted based on this challenge's completions." },
		completionsAfter120(){
				let a=1.32;
				let b=1.3;
				let c=1.7e6;
				if(player.m.effective.gte(130))a-=0.01,c-=2e5;
				if(player.m.effective.gte(152))a-=0.01,c-=5e5;
				if(player.m.effective.gte(168))a-=0.02;
				if(player.m.effective.gte(193)&&player.r.stage>=1)a-=0.03;
				if(player.um.points.gte(120))a-=0.01;
				
				let p=player.points;
				
				if(p.lte(Decimal.pow(10,c)))return 0;
				return scaleAPChall1(p.log10().div(c).log(a).pow(new Decimal(1).div(b).mul(buyableEffect('ap', 12)))).toNumber();
		},
		goalAfter120(x=player.ap.challenges[12]){
				x=scaleAPChall2(x);
				let a=1.32;
				let b=1.3;
				let c=1.7e6;
				if(player.m.effective.gte(130))a-=0.01,c-=2e5;
				if(player.m.effective.gte(152))a-=0.01,c-=5e5;
				if(player.m.effective.gte(168))a-=0.02;
				if(player.m.effective.gte(193)&&player.r.stage>=1)a-=0.03;
				if(player.um.points.gte(120))a-=0.01;
				
				return Decimal.pow(10,Decimal.pow(a,Decimal.pow(x,new Decimal(b).div(buyableEffect('ap', 12)))).mul(c));
		},
		canComplete(){
			return player.points.gte(tmp.ap.challenges[this.id].goal)&&player.m.effective.lt(110);
		},
		
		},
		21:{
                name: "No Self-Boost",
                completionLimit: Infinity,
			    challengeDescription() {return "3rd milestone's effect is always 1.<br>"+format(challengeCompletions(this.layer, this.id),player.m.effective.gte(120)?4:0)+(player.m.effective.gte(230)?"+"+format(layers.ap.freeChall(),4):"")+" completions"},
                unlocked() { return hasUpgrade("ap",22) && hasUpgrade("ap",23) },
                goal: function(){
					if(player.m.effective.gte(120))return this.goalAfter120(Math.ceil(player.ap.challenges[21]+0.001));
					if(player.ap.challenges[21]>=5)return new Decimal("1e57090000").pow(Decimal.pow(1.3,Decimal.pow(scaleAPChall2(player.ap.challenges[21])-5,1.5)));
					return [new Decimal("1e1615000"),new Decimal("1e4130000"),new Decimal("1e7150000"),new Decimal("e18060000"),new Decimal("e34850000")][player.ap.challenges[21]]
				},
                currencyDisplayName: "points",
                currencyInternalName: "points",
                rewardDescription() { return "3rd milestone's effect is better." },
			completionsAfter120(){
				let a=1.3;
				let b=1.36;
				let c=1.14e6;
				if(player.m.effective.gte(130))c-=1.4e5,b-=0.02;
				if(player.m.effective.gte(152))b-=0.04;
				if(player.m.effective.gte(168))a-=0.02;
				if(player.m.effective.gte(193)&&player.r.stage>=1)a-=0.03;
				if(player.um.points.gte(120))a-=0.01;
				
				let p=player.points;
				
				if(p.lte(Decimal.pow(10,c)))return 0;
				return scaleAPChall1(p.log10().div(c).log(a).pow(new Decimal(1).div(b).mul(buyableEffect('ap', 12)))).toNumber();
			},
			goalAfter120(x=player.ap.challenges[21]){
				x=scaleAPChall2(x);
				let a=1.3;
				let b=1.36;
				let c=1.14e6;
				if(player.m.effective.gte(130))c-=1.4e5,b-=0.02;
				if(player.m.effective.gte(152))b-=0.04;
				if(player.m.effective.gte(168))a-=0.02;
				if(player.m.effective.gte(193)&&player.r.stage>=1)a-=0.03;
				if(player.um.points.gte(120))a-=0.01;
				return Decimal.pow(10,Decimal.pow(a,Decimal.pow(x,new Decimal(b).div(buyableEffect('ap', 12)))).mul(c));
			},
			canComplete(){
				return player.points.gte(tmp.ap.challenges[this.id].goal)&&player.m.effective.lt(110);
			},
		
		},
		22:{
                name: "Reduced Points",
                completionLimit: Infinity,
			    challengeDescription() {
			if(player.m.effective.gte(122))return "1st milestone's effect is replaced by (log10(1st milestone's effect+1))^(milestones)<br>"+format(challengeCompletions(this.layer, this.id),player.m.effective.gte(120)?4:0)+(player.m.effective.gte(230)?"+"+format(layers.ap.freeChall(),4):"")+" completions";
			return "1st milestone's effect is replaced by (log10(1st milestone's effect+1))^100<br>"+format(challengeCompletions(this.layer, this.id),4)+(player.m.effective.gte(230)?"+"+format(layers.ap.freeChall(),4):"")+" completions";
		},
                unlocked() { return hasUpgrade("ap",22) && hasUpgrade("ap",24) },
                goal: function(){
					if(player.m.effective.gte(120))return this.goalAfter120(Math.ceil(player.ap.challenges[22]+0.001));
					if(player.ap.challenges[22]>=5)return new Decimal("1e740").pow(Decimal.pow(1.035,scaleAPChall2(player.ap.challenges[22])-5));
					return [new Decimal("1e614"),new Decimal("1e627"),new Decimal("1e671"),new Decimal("1e713"),new Decimal("1e725")][player.ap.challenges[22]]
				},
                currencyDisplayName: "points",
                currencyInternalName: "points",
                rewardDescription() { return "3rd milestone's effect is better, again." },
		completionsAfter120(){
			if(player.m.effective.gte(274)){
				return scaleAPChall1(player.points.add(10).log10().div(500).mul(buyableEffect('ap', 12)).log(1.03)).toNumber();
			}
			if(player.m.effective.gte(245)){
				return scaleAPChall1(player.points.add(10).log10().div(500).mul(buyableEffect('ap', 12)).log(1.035)).toNumber();
			}
			let p=player.points.add(10).log10().div(600).log(1.035);
			if(p.lte(3)){
				return p.toNumber()/2+3;
			}
			return scaleAPChall1(p).toNumber();
		},
		goalAfter120(x=player.ap.challenges[22]){
				x=scaleAPChall2(x);
			if(player.m.effective.gte(274)){
				return Decimal.pow(10,Decimal.pow(1.03,x).mul(500).div(buyableEffect('ap', 12)));
			}
			if(player.m.effective.gte(245)){
				return Decimal.pow(10,Decimal.pow(1.035,x).mul(500).div(buyableEffect('ap', 12)));
			}
			if(player.ap.challenges[22]<=3){
				return Decimal.pow(10,Decimal.pow(1.035,x*2-3).mul(600));
			}
			return Decimal.pow(10,Decimal.pow(1.035,x).mul(600));
		},
		canComplete(){
			return player.points.gte(tmp.ap.challenges[this.id].goal)&&player.m.effective.lt(110);
		},
		
		},
		31:{
                name: "No Prestige",
                completionLimit: Infinity,
			    challengeDescription() {return "You can't gain prestige points.<br>"+format(challengeCompletions(this.layer, this.id),player.m.effective.gte(120)?4:0)+(player.m.effective.gte(230)?"+"+format(layers.ap.freeChall(),4):"")+" completions"},
                unlocked() { return player.m.effective.gte(95) },
                goal: function(){
					if(player.m.effective.gte(120))return this.goalAfter120(Math.ceil(player.ap.challenges[31]+0.001));
					if(player.ap.challenges[31]>=5)return new Decimal("1e18040000").pow(Decimal.pow(1.3,Decimal.pow(scaleAPChall2(player.ap.challenges[31])-5,1.5)));
					return [new Decimal("1e3891000"),new Decimal("1e4171000"),new Decimal("1e6322000"),new Decimal("1e8035000"),new Decimal("1e9196000")][player.ap.challenges[31]]
				},
                currencyDisplayName: "points",
                currencyInternalName: "points",
                rewardDescription() { return "Prestige Boost's effect is better." },
		completionsAfter120(){
			let a=1.2;
			let b=1.36;
			let c=1.7e6;
			if(player.m.effective.gte(136))b-=0.01,c-=1e5;
			if(player.m.effective.gte(152))c-=6e5;
			if(player.um.points.gte(95))b-=0.001;
			if(player.m.effective.gte(236))b-=0.001;
			if(player.m.effective.gte(242))b-=0.003;
			if(player.m.effective.gte(248))b-=0.005;
			
			let p=player.points;
			
			if(p.lte(Decimal.pow(10,c)))return 0;
			return scaleAPChall1(p.log10().div(c).log(a).pow(new Decimal(1).div(b).mul(buyableEffect('ap', 12)))).toNumber();
		},
		goalAfter120(x=player.ap.challenges[31]){
				x=scaleAPChall2(x);
			let a=1.2;
			let b=1.36;
			let c=1.7e6;
			if(player.m.effective.gte(136))b-=0.01,c-=1e5;
			if(player.m.effective.gte(152))c-=6e5;
			if(player.um.points.gte(95))b-=0.001;
			if(player.m.effective.gte(236))b-=0.001;
			if(player.m.effective.gte(242))b-=0.003;
			if(player.m.effective.gte(248))b-=0.005;
			return Decimal.pow(10,Decimal.pow(a,Decimal.pow(x,new Decimal(b).div(buyableEffect('ap', 12)))).mul(c));
		},
		canComplete(){
			return player.points.gte(tmp.ap.challenges[this.id].goal)&&player.m.effective.lt(110);
		},
		
		},
		32:{
                name: "Disabled Buyables",
                completionLimit: Infinity,
			    challengeDescription() {return "All Prestige, Super-Prestige and Hyper-Prestige buyables have no effect.<br>"+format(challengeCompletions(this.layer, this.id),player.m.effective.gte(120)?4:0)+(player.m.effective.gte(230)?"+"+format(layers.ap.freeChall(),4):"")+" completions"},
                unlocked() { return player.m.effective.gte(128) },
                goal: function(){
					return this.goalAfter120(Math.ceil(player.ap.challenges[32]+0.002));
				},
                currencyDisplayName: "points",
                currencyInternalName: "points",
				rewardEffect() {
                    let ret = 1+(player.ap.challenges[32]+layers.ap.freeChall().toNumber())*0.05;
                    return ret;
                },
                rewardDisplay() { return "Effect of All Prestige, Super-Prestige and Hyper-Prestige Buyables ^"+format(this.rewardEffect()) },
                rewardDescription() { return "Effect of All Prestige, Super-Prestige and Hyper-Prestige Buyables is better." },
		completionsAfter120(){
			let a=1.2;
			let b=1.5;
			let c=3e10;
			if(player.m.effective.gte(130))c-=1e10;
			if(player.m.effective.gte(141))c-=1e10;
			if(player.m.effective.gte(152))c-=5e9;
			if(player.m.effective.gte(169))c-=3.85e9;
			if(player.m.effective.gte(195))c-=1.05e9;
			if(player.m.effective.gte(202))c-=9e7;
			if(player.m.effective.gte(209))c-=9e6;
			if(player.m.effective.gte(212))b-=0.02;
			if(player.m.effective.gte(218))b-=0.005;
			if(player.m.effective.gte(225))b-=0.005;
			if(player.m.effective.gte(229))b-=0.005;
			if(player.m.effective.gte(237))b-=0.005;
			if(player.m.effective.gte(249))b-=0.01;
			if(player.m.effective.gte(261))b-=player.m.points.sub(260).div(1000).min(0.1).toNumber();
			if(player.m.effective.gte(273))b-=0.01;
			
			let p=player.points;
			
			if(p.lte(Decimal.pow(10,c)))return 0;
			return scaleAPChall1(p.log10().div(c).log(a).pow(new Decimal(1).div(b).mul(buyableEffect('ap', 12)))).toNumber();
		},
		goalAfter120(x=player.ap.challenges[31]){
				x=scaleAPChall2(x);
			let a=1.2;
			let b=1.5;
			let c=3e10;
			if(player.m.effective.gte(130))c-=1e10;
			if(player.m.effective.gte(141))c-=1e10;
			if(player.m.effective.gte(152))c-=5e9;
			if(player.m.effective.gte(169))c-=3.85e9;
			if(player.m.effective.gte(195))c-=1.05e9;
			if(player.m.effective.gte(202))c-=9e7;
			if(player.m.effective.gte(209))c-=9e6;
			if(player.m.effective.gte(212))b-=0.02;
			if(player.m.effective.gte(218))b-=0.005;
			if(player.m.effective.gte(225))b-=0.005;
			if(player.m.effective.gte(229))b-=0.005;
			if(player.m.effective.gte(237))b-=0.005;
			if(player.m.effective.gte(249))b-=0.01;
			if(player.m.effective.gte(261))b-=player.m.points.sub(260).div(1000).min(0.1).toNumber();
			if(player.m.effective.gte(273))b-=0.01;
			return Decimal.pow(10,Decimal.pow(a,Decimal.pow(x,new Decimal(b).div(buyableEffect('ap', 12)))).mul(c));
		},
		canComplete(){
			return player.points.gte(tmp.ap.challenges[this.id].goal)&&player.m.effective.lt(110);
		},
		
		},
	},
	freeChall(){
		let ret=new Decimal(0);
		if(player.ep.buyables[11].gte(1))ret=ret.add(layers.ep.oneEffect());
		return ret;
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
				"Cost for Next Level: "+format(data.cost)+" Atomic-Prestige points";
			},
			cost(){
				let a=player[this.layer].buyables[this.id];
				a=Decimal.pow(2,a);
				return new Decimal(1).mul(Decimal.pow("e5e23",a));
			},
			canAfford() {
                   return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)
			},
               buy() { 
                   player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
               },
			  effect(){
				  let b=0.03;
				  let eff=new Decimal(1).add(player[this.layer].buyables[this.id].mul(b));
				  if(player.m.effective.gte(222))eff=eff.pow(tmp.ap.challenges[32].rewardEffect);
				  return eff;
			  },
			  unlocked(){
				  return player.m.effective.gte(221);
			  }
		},
		12:{
		title(){
			return "Challenge Slayer";
		},
		display(){
			let data = tmp[this.layer].buyables[this.id];
			return "Level: "+format(player[this.layer].buyables[this.id])+"<br>"+
			"Reduce AP Challenges base costs by /"+format(data.effect,4)+" (based on exotic prestige points)<br>"+
			"Cost for Next Level: "+format(data.cost)+" Atomic-Prestige points";
		},
		cost(){
				let a=player[this.layer].buyables[this.id];
				a=Decimal.pow(2,a);
				return new Decimal(1).mul(Decimal.pow("e4e34",a));
		},
		canAfford() {
			   return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)
		},
		   buy() { 
			   player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
		   },
		  effect(){
			  let b=0.0002;
			  let eff=new Decimal(1).add(player[this.layer].buyables[this.id].mul(b)).pow(player.ep.points.add(1).log10().add(1).log10().pow(0.5));
			  //if (hasMalware("m",2)) eff=eff.mul(milestoneEffect("m",2))
			  return eff;
		  },
		  unlocked(){
			  return player.em.points.gte(14);
		  },
	},

	},
	passiveGeneration(){
		if(player.um.points.gte(90))return 1e20;
		if(player.m.effective.gte(135))return 1e10;
		if(player.m.effective.gte(90))return 5;
		return 0;
	},
		doReset(l){
			if(l=="ap"){return;}
			if(l=="t")if(player.um.points.gte(102))layerDataReset("ap",["upgrades","buyables"]);else if(player.m.effective.gte(102))layerDataReset("ap",["upgrades"]);else layerDataReset("ap",[]);
			if(l=="a")layerDataReset("ap",["upgrades"]);
		},
		update(){
			if(player.m.effective.gte(103)&&!player.t.activeChallenge&&!player.r.activeChallenge){
				let keep=3;
				if(player.m.effective.gte(108))keep=6;
				player.ap.challenges[11]=Math.max(player.ap.challenges[11],keep);
				player.ap.challenges[12]=Math.max(player.ap.challenges[12],keep);
				player.ap.challenges[21]=Math.max(player.ap.challenges[21],keep);
				player.ap.challenges[22]=Math.max(player.ap.challenges[22],keep);
				player.ap.challenges[31]=Math.max(player.ap.challenges[31],keep);
			}
			if(player.um.points.gte(103)){
				let keep=3;
				if(player.um.points.gte(108))keep=6;
				if(player.um.points.gte(114))keep=10;
				player.ap.challenges[11]=Math.max(player.ap.challenges[11],keep);
				player.ap.challenges[12]=Math.max(player.ap.challenges[12],keep);
				player.ap.challenges[21]=Math.max(player.ap.challenges[21],keep);
				player.ap.challenges[22]=Math.max(player.ap.challenges[22],keep);
				player.ap.challenges[31]=Math.max(player.ap.challenges[31],keep);
				player.ap.challenges[32]=Math.max(player.ap.challenges[32],keep);
			}
			if(player.m.effective.gte(110)&&player.m.effective.lt(120)){
				if(player.ap.activeChallenge){
					if(player.points.gte(layers.ap.challenges[player.ap.activeChallenge].goal())){
						player.ap.challenges[player.ap.activeChallenge]++;
					}
				}
			}
			if(player.m.effective.gte(120)){
				if(player.ap.activeChallenge){
					player.ap.challenges[player.ap.activeChallenge]=Math.max(player.ap.challenges[player.ap.activeChallenge],layers.ap.challenges[player.ap.activeChallenge].completionsAfter120());
				}
			}
			if(player.m.effective.gte(114)){
				for(var i in player.ap.challenges){
					player.t.highestAPC[player.t.activeChallenge||0][i]=Math.max(player.t.highestAPC[player.t.activeChallenge||0][i],player.ap.challenges[i]);
					player.ap.challenges[i]=Math.max(player.t.highestAPC[player.t.activeChallenge||0][i],player.ap.challenges[i]);
				}
			}
			if(player.m.effective.gte(145)){
				player.ap.challenges[11]=Math.max(player.ap.challenges[11],layers.ap.challenges[11].completionsAfter120());
			}
			if(player.m.effective.gte(146)){
				player.ap.challenges[12]=Math.max(player.ap.challenges[12],layers.ap.challenges[12].completionsAfter120());
			}
			if(player.m.effective.gte(147)){
				player.ap.challenges[21]=Math.max(player.ap.challenges[21],layers.ap.challenges[21].completionsAfter120());
			}
			if(player.m.effective.gte(148)){
				player.ap.challenges[31]=Math.max(player.ap.challenges[31],layers.ap.challenges[31].completionsAfter120());
			}
			if(player.m.effective.gte(149)){
				player.ap.challenges[32]=Math.max(player.ap.challenges[32],layers.ap.challenges[32].completionsAfter120());
			}
			if(player.m.effective.gte(157)&&player.r.activeChallenge==11){
				player.ap.challenges[22]=Math.max(player.ap.challenges[22],layers.ap.challenges[22].completionsAfter120());
			}else if(player.m.effective.gte(274)){
				player.ap.challenges[22]=Math.max(player.ap.challenges[22],getPointGenBeforeSoftcap().add(1e100).log10().pow(player.m.points).add(10).mul(player.m.points).log10().div(500).mul(buyableEffect('ap', 12)).log(1.03).toNumber());
			}else if(player.m.effective.gte(245)){
				player.ap.challenges[22]=Math.max(player.ap.challenges[22],getPointGenBeforeSoftcap().add(1e100).log10().pow(player.m.points).add(10).mul(player.m.points).log10().div(500).mul(buyableEffect('ap', 12)).log(1.035).toNumber());
			}else if(player.m.effective.gte(161)){
				player.ap.challenges[22]=Math.max(player.ap.challenges[22],getPointGenBeforeSoftcap().add(1e100).log10().pow(player.m.points).add(10).mul(player.m.points).log10().div(600).log(1.035).toNumber());
			}else if(player.m.effective.gte(157)){
				player.ap.challenges[22]=Math.max(player.ap.challenges[22],player.points.add(1e100).log10().pow(player.m.points).add(10).log10().div(600).log(1.035).toNumber());
			}
		if(player.m.effective.gte(222)){
			var target=player.ap.points.add(1).div(1).log("e5e23").max(0.1).log(2);
			target=target.add(1).floor();
			if(target.gt(player.ap.buyables[11])){
				player.ap.buyables[11]=target;
			}
		}
		if(player.m.effective.gte(254)&&player.em.points.gte(14)){
			var target=player.ap.points.add(1).div(1).log("e4e34").max(0.1).log(2);
			target=target.add(1).floor();
			if(target.gt(player.ap.buyables[12])){
				player.ap.buyables[12]=target;
			}
		}
			
		}
})