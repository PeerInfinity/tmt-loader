
addLayer("t", {
    name: "transcend", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "T", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
	points: new Decimal(0),
	specialPoints: {
		11: new Decimal(0),
		12: new Decimal(0),
		21: new Decimal(0),
		22: new Decimal(0),
		31: new Decimal(0),
		32: new Decimal(0),
		41: new Decimal(0),
		42: new Decimal(0),
	},
	highestAPC: {
		0: {
			11: 0,
			12: 0,
			21: 0,
			22: 0,
			31: 0,
			32: 0,
			41: 0,
		},
		11: {
			11: 0,
			12: 0,
			21: 0,
			22: 0,
			31: 0,
			32: 0,
			41: 0,
		},
		12: {
			11: 0,
			12: 0,
			21: 0,
			22: 0,
			31: 0,
			32: 0,
			41: 0,
		},
		21: {
			11: 0,
			12: 0,
			21: 0,
			22: 0,
			31: 0,
			32: 0,
			41: 0,
		},
		22: {
			11: 0,
			12: 0,
			21: 0,
			22: 0,
			31: 0,
			32: 0,
			41: 0,
		},
		31: {
			11: 0,
			12: 0,
			21: 0,
			22: 0,
			31: 0,
			32: 0,
			41: 0,
		},
		32: {
			11: 0,
			12: 0,
			21: 0,
			22: 0,
			31: 0,
			32: 0,
			41: 0,
		},
		41: {
			11: 0,
			12: 0,
			21: 0,
			22: 0,
			31: 0,
			32: 0,
			41: 0,
		},
		42: {
			11: 0,
			12: 0,
			21: 0,
			22: 0,
			31: 0,
			32: 0,
			41: 0,
		},
	}
    }},
    color: "#FFFF00",
    requires1(){
		if(player.m.effective.gte(163))return new Decimal("1e510");
		if(player.m.effective.gte(137))return new Decimal("1e640");
		return new Decimal("1e850");
	},
    requires(){
		if(player.t.activeChallenge)return new Decimal(Infinity);
		return tmp.t.requires1;
	},
    resource: "transcend points", // Name of prestige currency
    baseResource: "atomic-prestige points", // Name of resource prestige is based on
    baseAmount() {return player.ap.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    row: 5, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "t", description: "T: Reset for transcend points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.m.effective.gte(99) && player.r.universe==0},
	branches(){
		if(player.r.stage>=1)return ["he","ap"];
		return ["ap"]
	},
	softcap:new Decimal(Infinity),
	softcapPower:new Decimal(1),
	gainMult(){
		let mult=new Decimal(1);
		if(player.mm.points.gte(21))mult=mult.mul(2);
		if(player.mm.points.gte(22))mult=mult.mul(2);
		if(player.mm.points.gte(23))mult=mult.mul(2);
		if(player.mm.points.gte(24))mult=mult.mul(2);
		if(player.mm.points.gte(25))mult=mult.mul(tmp.mm.meta25Effect);
		if(hasUpgrade("pe",21))mult=mult.mul(upgradeEffect("pe",21));
		if(hasUpgrade("se",22))mult=mult.mul(upgradeEffect("se",22));
		if(hasUpgrade("he",22))mult=mult.mul(upgradeEffect("he",22));
		if(hasUpgrade("t",63))mult=mult.mul(upgradeEffect("t",63));
		if(player.em.points.gte(4))mult=mult.mul(player.em.points.gte(8)?player.em.points:player.em.points.gte(7)?player.em.points.sqrt():1.1);
		if(player.m.effective.gte(163))mult=mult.mul(1.1);
		if(player.m.effective.gte(200))mult=mult.mul(tmp.m.milestone200Effect);
		if(player.um.points.gte(99))mult=mult.mul(1.1);
		mult=mult.mul(buyableEffect("r",21));
		if (player.ep.buyables[11].gte(2)) mult = mult.mul(tmp.ep.twoEffect);
		return mult;
	},
	getResetGain() {
		if(player.ap.points.lt(tmp.t.requires1))return new Decimal(0);
		let amt=Decimal.log10(player.ap.points).sub(player.um.points.gte(99)?300:player.m.effective.gte(163)?500:600).div(250).pow(tmp.m.milestone208Effect).mul(tmp.t.gainMult);
		amt=amt.floor();
		return amt;
	},
	getNextAt() {
		if(player.ap.points.lt(tmp.t.requires1))return new Decimal(tmp.t.requires1);
		let amt=Decimal.log10(player.ap.points).sub(player.um.points.gte(99)?300:player.m.effective.gte(163)?500:600).div(250).pow(tmp.m.milestone208Effect).mul(tmp.t.gainMult);
		amt=amt.floor().plus(1).div(tmp.t.gainMult);
		amt=Decimal.pow(10,amt.pow(tmp.m.milestone208Effect.recip()).mul(250).add(player.um.points.gte(99)?300:player.m.effective.gte(163)?500:600));
		return amt;
	},
	getNextSPAt() {
		if(!player.t.activeChallenge)return new Decimal(0);
		let amt=player.t.specialPoints[player.t.activeChallenge].plus(1).div(tmp.t.gainMult).div(player.ep.buyables[11].gte(6)?tmp.ep.sixEffect:1);
		amt=Decimal.pow(10,amt.pow(tmp.m.milestone208Effect.recip()).mul(250).add(player.um.points.gte(99)?300:player.m.effective.gte(163)?500:600));
		if(amt.lt(tmp.t.requires1))return new Decimal(tmp.t.requires1);
		return amt;
	},
	upgrades: {
        rows: 8,
		cols: 4,
		11: {
			title: "Transcend Upgrade 11",
            description: "Third Milestone's effect ^1.005",
            cost: new Decimal(1),
        },
		12: {
			title: "Transcend Upgrade 12",
            description: "Prestige Point gain ^1.005",
            cost: new Decimal(1),
        },
		13: {
			title: "Transcend Upgrade 13",
            description: "Super-Prestige Point gain ^1.005",
            cost: new Decimal(1),
        },
		14: {
			title: "Transcend Upgrade 14",
            description: "Hyper-Prestige Point gain ^1.005",
            cost: new Decimal(1),
        },
		21: {
			title: "Transcend Upgrade 21",
            description: "Prestige and Super-Prestige Upgrade 31 is boosted.",
            cost: new Decimal(5),
        },
		22: {
			title: "Transcend Upgrade 22",
            description: "Atomic-Prestige Point gain ^1.01",
            cost: new Decimal(10),
        },
		23: {
			title: "Transcend Upgrade 23",
            description: "Third Milestone's effect ^1.005",
            cost: new Decimal(15),
        },
		24: {
			title: "Transcend Upgrade 24",
            description: "Prestige Boost is cheaper",
            cost: new Decimal(20),
        },
		31: {
			title: "Transcend Upgrade 31",
            description: "Third Milestone's effect ^1.005",
            cost: new Decimal(50),
        },
		32: {
			title: "Transcend Upgrade 32",
            description: "Prestige Point gain ^1.005",
            cost: new Decimal(75),
        },
		33: {
			title: "Transcend Upgrade 33",
            description: "Super-Prestige Point gain ^1.005",
            cost: new Decimal(100),
        },
		34: {
			title: "Transcend Upgrade 34",
            description: "Hyper-Prestige Point gain ^1.005",
            cost: new Decimal(125),
        },
		41: {
			title: "Transcend Upgrade 41",
            description(){return "Hyper Boost cost /"+format("1e60000")},
            cost: new Decimal(300),
			unlocked(){return player.m.effective.gte(104);}
        },
		42: {
			title: "Transcend Upgrade 42",
            description(){return "Gain an extra Hyper Boost."},
            cost: new Decimal(400),
			unlocked(){return player.m.effective.gte(104);}
        },
		43: {
			title: "Transcend Upgrade 43",
            description(){return "Hyper Boost's effect is better."},
            cost: new Decimal(500),
			unlocked(){return player.m.effective.gte(104);}
        },
		44: {
			title: "Transcend Upgrade 44",
            description(){return "Unlock a new row of Atomic-Prestige upgrades."},
            cost: new Decimal(600),
			unlocked(){return player.m.effective.gte(104);}
        },
		51: {
			title: "Transcend Upgrade 51",
            description(){return "First HP buyable's effect ^2.1"},
            cost: new Decimal(30000),
			unlocked(){return player.m.effective.gte(111);}
        },
		52: {
			title: "Transcend Upgrade 52",
            description(){return "Milestone cost scaling starts later based on your transcend points."},
            cost: new Decimal(60000),
			unlocked(){return player.m.effective.gte(111);},
			effect(){
				if(player.r.stage>=1)return player.t.points.add(10).log10().sqrt();
				let b = player.t.points.add(10).log10().sqrt().mul(1.2);
				if(player.t.points.add(10).log10().gte(625/36))b = player.t.points.add(10).log10().mul(0.288);
				if(hasUpgrade("t",81))b = player.t.points.add(10).log10().sqrt().mul(1.2).max(player.t.points.add(10).log10().mul(0.3)).add(0.65);
				if(player.r.stage==0)b = b.min(11);
				return new Decimal(9).plus(b);
			},
            effectDisplay() { return "+"+format(this.effect(),4) },
        },
		53: {
			title: "Transcend Upgrade 53",
            description(){return "Reduce the 1st Milestone's softcap's potency."},
            cost: new Decimal(2e6),
			unlocked(){return player.m.effective.gte(111);},
        },
		54: {
			title: "Transcend Upgrade 54",
            description(){return "1st Milestone's softcap starts later based on your transcend points."},
            cost: new Decimal(1e7),
			unlocked(){return player.m.effective.gte(111);},
			effect(){
				let p=0.8;
				let m=0.05;
				if(player.m.effective.gte(128)){
					p+=0.1;
				}
				if(hasUpgrade("t",83)){
					p+=0.1;
				}
				let eff=player.t.points.add(10).log10().pow(p).mul(m);
				return new Decimal(1).plus(eff);
			},
            effectDisplay() { return format(this.effect(),4)+"x later" },
        },
		61: {
			title: "Transcend Upgrade 61",
            description(){return "All Dilation Effects +0.05"},
            cost: new Decimal(1e10),
			unlocked(){return player.m.effective.gte(125);},
        },
		62: {
			title: "Transcend Upgrade 62",
            description(){return "Atomic-Prestige point gain is boosted based on your transcend points."},
            cost: new Decimal(1e11),
			unlocked(){return player.m.effective.gte(125);},
			effect(){
				let base=80;
                let ret = Decimal.pow(base,Decimal.log10(player[this.layer].points.add(1)).pow(0.9).add(1))
                return ret;
			},
            effectDisplay() { return format(this.effect())+"x" },
        },
		63: {
			title: "Transcend Upgrade 63",
            description(){return "Transcend point gain is boosted based on your transcend points."},
            cost: new Decimal(6e11),
			unlocked(){return player.m.effective.gte(125);},
			effect(){
				let base=1.05;
				if(hasUpgrade("t",84))base+=0.05;
                let ret = Decimal.pow(base,Decimal.log10(player[this.layer].points.add(1)).pow(0.9).add(1))
                return ret;
			},
            effectDisplay() { return format(this.effect())+"x" },
        },
		64: {
			title: "Transcend Upgrade 64",
            description(){return "Hyper Boost cost /"+format("1e300000")},
            cost: new Decimal(4e12),
			unlocked(){return player.m.effective.gte(125);}
        },
		71: {
			title: "Transcend Upgrade 71",
            description(){return "Hyper Boost cost /"+format("1e30000")},
            cost: new Decimal(1e13),
			unlocked(){return player.m.effective.gte(136);}
        },
		72: {
			title: "Transcend Upgrade 72",
            description(){return "Meta-Milestones are cheaper based on Transcend Points."},
            cost: new Decimal(2e13),
			unlocked(){return player.m.effective.gte(136);},
			effect(){
				let p=0.5;
				let m=0.01;
				if(hasUpgrade("t",74))m+=0.01;
				let eff=player.t.points.add(10).log10().pow(p).mul(m);
				return new Decimal(1).plus(eff);
			},
            effectDisplay() { return "/"+format(this.effect(),4) },
        },
		73: {
			title: "Transcend Upgrade 73",
            description(){return "1st Milestone's softcap starts later based on AP challenge completions."},
            cost: new Decimal(3e13),
			unlocked(){return player.m.effective.gte(136);},
			effect(){
				let c=0;
				for(var i in player.ap.challenges)c+=player.ap.challenges[i];
				c+=layers.ap.freeChall().toNumber()*6;
				let p=2;
				if(hasUpgrade("t",74))p+=0.1;
				let m=1e-5;
				if(hasUpgrade("t",82))m*=1.5;
				let eff=new Decimal(c).pow(p).mul(m);
				return new Decimal(1).plus(eff);
			},
            effectDisplay() { return format(this.effect(),4)+"x later" },
        },
		74: {
			title: "Transcend Upgrade 74",
            description(){return "Transcend Upgrade 72 and 73 are boosted."},
            cost: new Decimal(1.5e14),
			unlocked(){return player.m.effective.gte(136);},
        },
		81: {
			title: "Transcend Upgrade 81",
            description(){return "Transcend Upgrade 52 is boosted."},
            cost: new Decimal(5e17),
			unlocked(){return player.m.effective.gte(153);},
        },
		82: {
			title: "Transcend Upgrade 82",
            description(){return "Transcend Upgrade 73 is better."},
            cost: new Decimal(3e19),
			unlocked(){return player.m.effective.gte(153);},
        },
		83: {
			title: "Transcend Upgrade 83",
            description(){return "Transcend Upgrade 54 is better."},
            cost: new Decimal(4e20),
			unlocked(){return player.m.effective.gte(153);},
        },
		84: {
			title: "Transcend Upgrade 84",
            description(){return "Transcend Upgrade 63 is better."},
            cost: new Decimal(5e22),
			unlocked(){return player.m.effective.gte(153);},
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
				"Cost for Next Level: "+format(data.cost)+" Transcend Points";
			},
			cost(){
				let a=player[this.layer].buyables[this.id];
				a=Decimal.pow(2,a).mul(1e77);
				return a;
			},
			canAfford() {
                   return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)
			},
               buy() { 
			       player[this.layer].points=player[this.layer].points.sub(tmp[this.layer].buyables[this.id].cost)
                   player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
               },
			  effect(){
				  let b=0.05;
				  let eff=new Decimal(1).add(player[this.layer].buyables[this.id].mul(b));
				  return eff;
			  },
			  unlocked(){
				  return player.em.points.gte(11);
			  }
		},
		12:{
			title(){
				return "Super Prestige Boost";
			},
			display(){
				let data = tmp[this.layer].buyables[this.id];
				return "Level: "+format(player[this.layer].buyables[this.id])+"<br>"+
				"Super Prestige Points ^"+format(data.effect)+"<br>"+
				"Cost for Next Level: "+format(data.cost)+" Transcend Points";
			},
			cost(){
				let a=player[this.layer].buyables[this.id];
				a=Decimal.pow(10,a).mul(1e90);
				return a;
			},
			canAfford() {
                   return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)
			},
               buy() { 
			       player[this.layer].points=player[this.layer].points.sub(tmp[this.layer].buyables[this.id].cost)
                   player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
               },
			  effect(){
				  let b=0.005;
				  let eff=new Decimal(1).add(player[this.layer].buyables[this.id].mul(b));
				  return eff;
			  },
			  unlocked(){
				  return player.em.points.gte(12);
			  }
		},
	},
	challenges: {
        rows: 4,
		cols: 2,
		11:{
                name: "Dilation",
                completionLimit: Infinity,
			    challengeDescription() {return "1st milestone's effect ^"+format(tmp.t.dilationEffect)+"<br>"+format(challengeCompletions(this.layer, this.id),player.m.effective.gte(219)?4:0)  +" completions"},
                unlocked() { return true },
                goal: function(){
					if(player.m.effective.gte(201)&&player.t.challenges[this.id]>=layers.t.linearComp())return Math.ceil(player.t.challenges[this.id]+0.001)*layers.t.linearComp();
					if(player.m.effective.gte(110))return Math.ceil(player.t.challenges[11]+0.001)*Math.ceil(player.t.challenges[11]+0.001);
					return 2*Math.pow(3,player.t.challenges[11]);
				},
				canComplete(){
					let c=0;
					for(var i in player.ap.challenges)c+=player.ap.challenges[i];
					c+=layers.ap.freeChall().toNumber()*6;
					if(c>=tmp.t.challenges[this.id].goal)return true;
					return false;
				},
                currencyDisplayName: "AP challenge completions",
                rewardDescription() { return "3rd milestone's effect is better." },
		},
		12:{
                name: "Softcapped",
                completionLimit: Infinity,
			    challengeDescription() {return "1st milestone's softcap starts earlier<br>"+format(challengeCompletions(this.layer, this.id),player.m.effective.gte(219)?4:0)+" completions"},
                unlocked() { return player.m.effective.gte(104) },
                goal: function(){
					if(player.m.effective.gte(201)&&player.t.challenges[this.id]>=layers.t.linearComp())return Math.ceil(player.t.challenges[this.id]+0.001)*layers.t.linearComp();
					return Math.ceil(player.t.challenges[this.id]+0.001)*Math.ceil(player.t.challenges[this.id]+0.001);
				},
				canComplete(){
					let c=0;
					for(var i in player.ap.challenges)c+=player.ap.challenges[i];
					c+=layers.ap.freeChall().toNumber()*6;
					if(c>=tmp.t.challenges[this.id].goal)return true;
					return false;
				},
				rewardEffect() {
		if(player.m.effective.lt(112) && player.t.activeChallenge==12)return 1;
                    let ret = 1+player.t.challenges[12]*(player.um.points.gte(112)?0.101:0.1);
                    return ret;
                },
				rewardDisplay() {
                    return format(this.rewardEffect())+"x later";
                },
                currencyDisplayName: "AP challenge completions",
                rewardDescription() { 
				if(player.m.effective.lt(112))return "1st milestone's softcap starts later, but the reward is disabled in this challenge.";
				else return "1st milestone's softcap starts later.";
		 },
		},
		21:{
                name: "Prestige Dilation",
                completionLimit: Infinity,
			    challengeDescription() {return "1st milestone's effect and prestige point gain ^"+format(tmp.t.dilationEffect)+"<br>"+format(challengeCompletions(this.layer, this.id),player.m.effective.gte(219)?4:0) +" completions"},
                unlocked() { return player.m.effective.gte(109) },
                goal: function(){
					if(player.m.effective.gte(201)&&player.t.challenges[this.id]>=layers.t.linearComp())return Math.ceil(player.t.challenges[this.id]+0.001)*layers.t.linearComp();
					return Math.ceil(player.t.challenges[this.id]+0.001)*Math.ceil(player.t.challenges[this.id]+0.001);
				},
				canComplete(){
					let c=0;
					for(var i in player.ap.challenges)c+=player.ap.challenges[i];
					c+=layers.ap.freeChall().toNumber()*6;
					if(c>=tmp.t.challenges[this.id].goal)return true;
					return false;
				},
                currencyDisplayName: "AP challenge completions",
                rewardDescription() { return "3rd milestone's effect is better." },
		},
		22:{
                name: "Hardcapped",
                completionLimit: Infinity,
			    challengeDescription() {return "'Softcapped' is applied, and 1st milestone's softcap is its hardcap.<br>"+format(challengeCompletions(this.layer, this.id),player.m.effective.gte(219)?4:0) +" completions"},
                unlocked() { return player.m.effective.gte(115) },
                goal: function(){
					if(player.m.effective.gte(201)&&player.t.challenges[this.id]>=layers.t.linearComp())return Math.ceil(player.t.challenges[this.id]+0.001)*layers.t.linearComp();
					return Math.ceil(player.t.challenges[this.id]+0.001)*Math.ceil(player.t.challenges[this.id]+0.001);
				},
				canComplete(){
					let c=0;
					for(var i in player.ap.challenges)c+=player.ap.challenges[i];
					c+=layers.ap.freeChall().toNumber()*6;
					if(c>=tmp.t.challenges[this.id].goal)return true;
					return false;
				},
				rewardEffect() {
		            let ret = 1+player.t.challenges[22]*(player.um.points.gte(112)?0.101:0.1);
                    return ret;
                },
				rewardDisplay() {
                    return format(this.rewardEffect())+"x later";
                },
                currencyDisplayName: "AP challenge completions",
                rewardDescription() { return "1st milestone's softcap starts later." },
		},
		31:{
                name: "Super Dilation",
                completionLimit: Infinity,
			    challengeDescription() {return "1st milestone's effect, prestige point gain and super-prestige point gain ^"+format(tmp.t.dilationEffect)+"<br>"+format(challengeCompletions(this.layer, this.id),player.m.effective.gte(219)?4:0) +" completions"},
                unlocked() { return player.m.effective.gte(125) },
                goal: function(){
					if(player.m.effective.gte(201)&&player.t.challenges[this.id]>=layers.t.linearComp())return Math.ceil(player.t.challenges[this.id]+0.001)*layers.t.linearComp();
					return Math.ceil(player.t.challenges[this.id]+0.001)*Math.ceil(player.t.challenges[this.id]+0.001);
				},
				canComplete(){
					let c=0;
					for(var i in player.ap.challenges)c+=player.ap.challenges[i];
					c+=layers.ap.freeChall().toNumber()*6;
					if(c>=tmp.t.challenges[this.id].goal)return true;
					return false;
				},
                currencyDisplayName: "AP challenge completions",
                rewardDescription() { return "3rd milestone's effect is better." },
		},
		32:{
                name: "Prestige Hardcapped",
                completionLimit: Infinity,
			    challengeDescription() {return "'Hardcapped' is applied, and prestige point gain is affected by 1st Milestone's softcap<br>"+format(challengeCompletions(this.layer, this.id),player.m.effective.gte(219)?4:0)+" completions"},
                unlocked() { return player.m.effective.gte(137) },
                goal: function(){
					if(player.m.effective.gte(201)&&player.t.challenges[this.id]>=layers.t.linearComp())return Math.ceil(player.t.challenges[this.id]+0.001)*layers.t.linearComp();
					return Math.ceil(player.t.challenges[this.id]+0.001)*Math.ceil(player.t.challenges[this.id]+0.001);
				},
				canComplete(){
					let c=0;
					for(var i in player.ap.challenges)c+=player.ap.challenges[i];
					c+=layers.ap.freeChall().toNumber()*6;
					if(c>=tmp.t.challenges[this.id].goal)return true;
					return false;
				},
				rewardEffect() {
		            let ret = 1+player.t.challenges[32]*(player.um.points.gte(112)?0.101:0.1);
                    return ret;
                },
				rewardDisplay() {
                    return format(this.rewardEffect())+"x later";
                },
                currencyDisplayName: "AP challenge completions",
                rewardDescription() { return "1st milestone's softcap starts later." },
		},
		41:{
                name: "Hyper Dilation",
                completionLimit: Infinity,
			    challengeDescription() {return "'Super Dilation' is applied, and hyper-prestige point gain ^"+format(tmp.t.dilationEffect)+"<br>"+format(challengeCompletions(this.layer, this.id),player.m.effective.gte(219)?4:0)+" completions"},
                unlocked() { return player.m.effective.gte(158) },
                goal: function(){
					if(player.m.effective.gte(201)&&player.t.challenges[this.id]>=layers.t.linearComp())return Math.ceil(player.t.challenges[this.id]+0.001)*layers.t.linearComp();
					return Math.ceil(player.t.challenges[this.id]+0.001)*Math.ceil(player.t.challenges[this.id]+0.001);
				},
				canComplete(){
					let c=0;
					for(var i in player.ap.challenges)c+=player.ap.challenges[i];
					c+=layers.ap.freeChall().toNumber()*6;
					if(c>=tmp.t.challenges[this.id].goal)return true;
					return false;
				},
                currencyDisplayName: "AP challenge completions",
                rewardDescription() { return "3rd milestone's effect is better." },
		},
		42:{
                name: "Super Hardcapped",
                completionLimit: Infinity,
			    challengeDescription() {return "'Prestige Hardcapped' is applied, and super prestige point gain is affected by 1st Milestone's softcap<br>"+format(challengeCompletions(this.layer, this.id),player.m.effective.gte(219)?4:0)+" completions"},
                unlocked() { return player.m.effective.gte(170) },
                goal: function(){
					if(player.m.effective.gte(201)&&player.t.challenges[this.id]>=layers.t.linearComp())return Math.ceil(player.t.challenges[this.id]+0.001)*layers.t.linearComp();
					return Math.ceil(player.t.challenges[this.id]+0.001)*Math.ceil(player.t.challenges[this.id]+0.001);
				},
				canComplete(){
					let c=0;
					for(var i in player.ap.challenges)c+=player.ap.challenges[i];
					c+=layers.ap.freeChall().toNumber()*6;
					if(c>=tmp.t.challenges[this.id].goal)return true;
					return false;
				},
				rewardEffect() {
		            let ret = 1+player.t.challenges[42]*0.02;
					if(player.m.effective.gte(171))ret = 1+player.t.challenges[42]*0.043;
					if(player.m.effective.gte(172))ret = 1+player.t.challenges[42]*0.06;
					if(player.m.effective.gte(173))ret = 1+player.t.challenges[42]*0.08;
					if(player.m.effective.gte(174))ret = 1+player.t.challenges[42]*(player.um.points.gte(112)?0.101:0.1);
                    return ret;
                },
				rewardDisplay() {
                    return format(this.rewardEffect())+"x later";
                },
                currencyDisplayName: "AP challenge completions",
                rewardDescription() { return "1st milestone's softcap starts later." },
		},
	},
	hardcap(){
		return new Decimal(Number.MAX_VALUE)
	},
	passiveGeneration(){
		if(player.t.activeChallenge)return 0;
		if(player.m.effective.gte(246))return 50;
		if(player.m.effective.gte(205))return 32;
		if(player.m.effective.gte(183))return 21;
		if(player.m.effective.gte(178))return 11;
		if(player.m.effective.gte(164))return 6;
		if(player.m.effective.gte(154))return 3;
		if(player.m.effective.gte(151))return 2;
		if(player.m.effective.gte(133))return 1;
		if(player.m.effective.gte(130))return 0.8;
		if(player.m.effective.gte(127))return 0.6;
		if(player.m.effective.gte(123))return 0.45;
		if(player.m.effective.gte(120))return 0.3;
		if(player.m.effective.gte(119))return 0.2;
		if(player.m.effective.gte(118))return 0.1;
		if(player.m.effective.gte(117))return 0.05;
		if(player.m.effective.gte(116))return 0.02;
		if(player.m.effective.gte(115))return 0.01;
		if(player.m.effective.gte(113))return 0.005;
		if(player.m.effective.gte(110))return 0.002;
		return 0;
	},
	tabFormat: {
		"Main":{
			content:[
				"main-display","prestige-button","resource-display",
				["display-text",function(){if(player.r.stage>=1)return "Transcend point is hardcapped at "+format(layers.t.hardcap());return "";}],
				"buyables","upgrades",

			]
		},"Challenges":{
			content:[
				"main-display",
				["display-text",function(){return "AP challenge is applied after T challenge, softcap is applied after AP challenge"}],
				["display-text",function(){
					let c=0;
					for(var i in player.ap.challenges)c+=player.ap.challenges[i];
					return "AP challenge completions: "+format(c,4)+(player.m.effective.gte(230)?("+"+format(layers.ap.freeChall().toNumber()*6,4)):"");
				}],
				"challenges"
			]
		},"Special Transcend Points":{
			content:[
				"main-display",
				["display-text",function(){return "Reach "+format(tmp.t.requires1)+" atomic-prestige points in a Transcend Challenge to gain Special Transcend Points!"}],
				function(){if(!player.t.activeChallenge)return ["display-text",""];return "resource-display"},
				["display-text",function(){if(!player.t.activeChallenge || player.t.specialPoints[player.t.activeChallenge].gte(1e6))return "";return "Next "+layers.t.getSpecialTPName(player.t.activeChallenge)+" at "+format(tmp.t.getNextSPAt)+" atomic-prestige points"}],
				["display-text",function(){return "You have "+format(player.t.specialPoints[11])+" Dilated Transcend Points, 3rd Milestone's effect ^"+format(layers.t.getSpecialEffect(11),4)}],
				["display-text",function(){return "You have "+format(player.t.specialPoints[12])+" Softcapped Transcend Points, 1st Milestone's softcap starts "+format(layers.t.getSpecialEffect(12),4)+"x later"}],
				["display-text",function(){return "You have "+format(player.t.specialPoints[21])+" Prestige-Dilated Transcend Points, Prestige Point gain ^"+format(layers.t.getSpecialEffect(21),4)}],
				["display-text",function(){return "You have "+format(player.t.specialPoints[22])+" Hardcapped Transcend Points, 1st Milestone's softcap starts "+format(layers.t.getSpecialEffect(22),4)+"x later"}],
				["display-text",function(){return "You have "+format(player.t.specialPoints[31])+" Super-Dilated Transcend Points, Super-Prestige Point gain ^"+format(layers.t.getSpecialEffect(31),4)}],
				["display-text",function(){return "You have "+format(player.t.specialPoints[32])+" Prestige-Hardcapped Transcend Points, 1st Milestone's softcap starts "+format(layers.t.getSpecialEffect(32),4)+"x later"}],
				["display-text",function(){return "You have "+format(player.t.specialPoints[41])+" Hyper-Dilated Transcend Points, Hyper-Prestige Point gain ^"+format(layers.t.getSpecialEffect(41),4)}],
				["display-text",function(){return "You have "+format(player.t.specialPoints[42])+" Super-Hardcapped Transcend Points, 1st Milestone's softcap starts "+format(layers.t.getSpecialEffect(42),4)+"x later"}],
			],
			unlocked(){return player.m.effective.gte(130);}
		},
	},
	linearComp(){
		let ret=15;
		if(player.m.effective.gte(255))ret-=1;
		if(player.um.points.gte(110))ret-=0.5;
		return ret;
	},
	update(){
		if(player.t.points.gte(layers.t.hardcap()))player.t.points=new Decimal(layers.t.hardcap());
		if(player.m.effective.gte(219)){
			let c=0;
			for(var i in player.ap.challenges)c+=player.ap.challenges[i];
			c+=layers.ap.freeChall().toNumber()*6;
			for(var i in player.t.specialPoints){
				player.t.challenges[i]=Math.max(player.t.challenges[i],Math.max(Math.sqrt(c),c/layers.t.linearComp()));
				if(player.t.specialPoints[i].lt(layers.t.getResetGain().mul(player.ep.buyables[11].gte(6)?tmp.ep.sixEffect:1))){
					player.t.specialPoints[i]=layers.t.getResetGain().mul(player.ep.buyables[11].gte(6)?tmp.ep.sixEffect:1);
				}
			}
		}else{
			if(player.m.effective.gte(130) && player.t.activeChallenge){
				if(player.t.specialPoints[player.t.activeChallenge].lt(layers.t.getResetGain().mul(player.ep.buyables[11].gte(6)?tmp.ep.sixEffect:1))){
					player.t.specialPoints[player.t.activeChallenge]=layers.t.getResetGain().mul(player.ep.buyables[11].gte(6)?tmp.ep.sixEffect:1);
				}
			}
			if(player.m.effective.gte(114)&&player.t.activeChallenge){
				if(layers.t.challenges[player.t.activeChallenge].canComplete()){
					player.t.challenges[player.t.activeChallenge]++;
				}
			}
			if(player.m.effective.gte(176)){
				if(layers.t.challenges[11].canComplete()){
					player.t.challenges[11]++;
				}
				if(player.t.specialPoints[11].lt(layers.t.getResetGain().mul(player.ep.buyables[11].gte(6)?tmp.ep.sixEffect:1))){
					player.t.specialPoints[11]=layers.t.getResetGain().mul(player.ep.buyables[11].gte(6)?tmp.ep.sixEffect:1);
				}
			}
			if(player.m.effective.gte(177)){
				if(layers.t.challenges[12].canComplete()){
					player.t.challenges[12]++;
				}
				if(player.t.specialPoints[12].lt(layers.t.getResetGain().mul(player.ep.buyables[11].gte(6)?tmp.ep.sixEffect:1))){
					player.t.specialPoints[12]=layers.t.getResetGain().mul(player.ep.buyables[11].gte(6)?tmp.ep.sixEffect:1);
				}
			}
			if(player.m.effective.gte(188)){
				if(layers.t.challenges[21].canComplete()){
					player.t.challenges[21]++;
				}
				if(player.t.specialPoints[21].lt(layers.t.getResetGain().mul(player.ep.buyables[11].gte(6)?tmp.ep.sixEffect:1))){
					player.t.specialPoints[21]=layers.t.getResetGain().mul(player.ep.buyables[11].gte(6)?tmp.ep.sixEffect:1);
				}
			}
			if(player.m.effective.gte(192)&&player.r.stage>=1){
				if(layers.t.challenges[22].canComplete()){
					player.t.challenges[22]++;
				}
				if(player.t.specialPoints[22].lt(layers.t.getResetGain().mul(player.ep.buyables[11].gte(6)?tmp.ep.sixEffect:1))){
					player.t.specialPoints[22]=layers.t.getResetGain().mul(player.ep.buyables[11].gte(6)?tmp.ep.sixEffect:1);
				}
			}
			if(player.m.effective.gte(211)&&player.r.stage>=1){
				if(layers.t.challenges[31].canComplete()){
					player.t.challenges[31]++;
				}
				if(player.t.specialPoints[31].lt(layers.t.getResetGain().mul(player.ep.buyables[11].gte(6)?tmp.ep.sixEffect:1))){
					player.t.specialPoints[31]=layers.t.getResetGain().mul(player.ep.buyables[11].gte(6)?tmp.ep.sixEffect:1);
				}
			}
			if(player.m.effective.gte(213)&&player.r.stage>=1){
				if(layers.t.challenges[41].canComplete()){
					player.t.challenges[41]++;
				}
				if(player.t.specialPoints[41].lt(layers.t.getResetGain().mul(player.ep.buyables[11].gte(6)?tmp.ep.sixEffect:1))){
					player.t.specialPoints[41]=layers.t.getResetGain().mul(player.ep.buyables[11].gte(6)?tmp.ep.sixEffect:1);
				}
			}
			if(player.m.effective.gte(214)&&player.r.stage>=1){
				if(layers.t.challenges[32].canComplete()){
					player.t.challenges[32]++;
				}
				if(player.t.specialPoints[32].lt(layers.t.getResetGain().mul(player.ep.buyables[11].gte(6)?tmp.ep.sixEffect:1))){
					player.t.specialPoints[32]=layers.t.getResetGain().mul(player.ep.buyables[11].gte(6)?tmp.ep.sixEffect:1);
				}
			}
			if(player.m.effective.gte(217)&&player.r.stage>=1){
				if(layers.t.challenges[42].canComplete()){
					player.t.challenges[42]++;
				}
				if(player.t.specialPoints[42].lt(layers.t.getResetGain().mul(player.ep.buyables[11].gte(6)?tmp.ep.sixEffect:1))){
					player.t.specialPoints[42]=layers.t.getResetGain().mul(player.ep.buyables[11].gte(6)?tmp.ep.sixEffect:1);
				}
			}
		}
	},
	dilationEffect(){
		let eff=0.45;
		if(hasUpgrade("t",61))eff+=0.05;
		return eff;
	},
	getSpecialTPName(x){
		if(x==11)return "Dilated Transcend Point";
		if(x==12)return "Softcapped Transcend Point";
		if(x==21)return "Prestige-Dilated Transcend Point";
		if(x==22)return "Hardcapped Transcend Point";
		if(x==31)return "Super-Dilated Transcend Point";
		if(x==32)return "Prestige-Hardcapped Transcend Point";
		if(x==41)return "Hyper-Dilated Transcend Point";
		if(x==42)return "Super-Hardcapped Transcend Point";
	},
	getSpecialEffect(x){
		if(inChallenge("mp",12))return new Decimal(1);
		let effect=(player.t.specialPoints[x] ?? new Decimal(0)).add(1).log10().div(100).add(1);
		return effect;
	},
	
		doReset(l){
			if(l=="t"){return;}
			if(l=="a"){return;}
		},
})