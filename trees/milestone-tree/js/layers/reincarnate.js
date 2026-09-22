
addLayer("r", {
    name: "reincarnate", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
	    points: new Decimal(0),
	    power: new Decimal(0),
	    stage: 0,
	    universe: 0,
    }},
    color: "#00FFFF",
    requires1(){
		if(player.r.stage>=2)return new Decimal(1e10);
		return Decimal.pow(10,10*Math.sqrt(10));
	},
    requires(){
		if(player.r.activeChallenge)return new Decimal(Infinity);
		return tmp.r.requires1;
	},
    resource: "reincarnation points", // Name of prestige currency
    baseResource: "transcend points", // Name of resource prestige is based on
    baseAmount() {return player.t.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    row: 6, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "r", description: "R: Reset for reincarnation points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.m.effective.gte(199) || player.r.unlocked},
	branches: ["t","a"],
	softcap:new Decimal(Infinity),
	softcapPower:new Decimal(1),
	gainMult(){
		let mult=new Decimal(1);
		if(player.m.effective.gte(200))mult=mult.mul(tmp.m.milestone200Effect);
		if(player.mm.points.gte(40))mult=mult.mul(2);
		if(player.em.points.gte(10))mult=mult.mul(2);
		if(player.mm.points.gte(45))mult=mult.mul(2);
		if(hasUpgrade("pp",14))mult=mult.mul(upgradeEffect("pp",14));
		if(player.ep.buyables[11].gte(9)) mult = mult.mul(tmp.ep.nineEffect);
		if(hasUpgrade("r",12))mult=mult.mul(2);
		if(hasUpgrade("ep",21))mult=mult.mul(upgradeEffect("ep",21));
		return mult;
	},
	getResetGain() {
		if(player.t.points.lt(tmp.r.requires1))return new Decimal(0);
		let amt=Decimal.log10(player.t.points.add(10)).pow(tmp.m.milestone208Effect).div(1000).mul(tmp.r.gainMult);
		amt=amt.floor();
		return amt;
	},
	getNextAt() {
		if(player.t.points.lt(tmp.r.requires1))return new Decimal(tmp.r.requires1);
		let amt=Decimal.log10(player.t.points.add(10)).pow(tmp.m.milestone208Effect).div(1000).mul(tmp.r.gainMult);
		amt=amt.floor().plus(1).div(tmp.r.gainMult);
		amt=Decimal.pow(10,amt.mul(1000).pow(tmp.m.milestone208Effect.recip()));
		return amt;
	},
	hardcap:new Decimal(1e99),
	passiveGeneration(){
		return 0;
	},
	tabFormat: {
		"Main":{
			content:[
				"main-display","prestige-button","resource-display",
				["display-text",function(){return "You have "+format(player.r.power)+" Reincarnation Power"}],
				["display-text",function(){if(player.r.universe==1)return "Welcome to The Milestone Tree NG+!";if(player.r.unlocked)return "Welcome to The Milestone Tree NG-"+player.r.stage+"!";return "";}]
				,["clickable",11],"buyables","upgrades"
			]
		},"Challenges":{
			content:[
				"main-display",
				"challenges"
			],
			unlocked(){return player.m.effective.gte(250);}
		},/*"Special Transcend Points":{
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
		},*/
	},
	update(diff){
		if(player.r.points.gte(layers.r.hardcap))player.r.points=new Decimal(layers.r.hardcap);
		if(player.r.stage>=1)player.r.power=player.r.power.add(layers.r.powerGain().mul(diff));//.min(6.66e55);
		if(hasUpgrade("r",14)&&player.r.stage==1){
			layerDataReset("t",[]);
			layerDataReset("a",[]);
			layerDataReset("ap",[]);
			layerDataReset("he",[]);
			layerDataReset("hb",[]);
			layerDataReset("hp",[]);
			layerDataReset("se",[]);
			layerDataReset("em",[]);
			layerDataReset("um",[]);
			layerDataReset("sp",[]);
			layerDataReset("pe",[]);
			layerDataReset("pb",[]);
			layerDataReset("p",[]);
			layerDataReset("mm",[]);
			layerDataReset("pp",[]);
			layerDataReset("ep",[]);
			layerDataReset("cp",[]);
			layerDataReset("mp",[]);
			layerDataReset("r",["upgrades","points","best","times","unlocked"]);
			player.points=new Decimal(10);
			player.r.stage=2;
			player.r.points=player.r.points.add(2e7);
			updateTemp();
			updateTemp();
			updateTemp();
			updateTemp();
			updateTemp();
			player.r.stage=2;
		}
	},
	powerGain(){
		let ret=player.points.max(10).log10().sub(1).mul(player.r.points.pow(player.m.effective.gte(215)?1.7+player.m.points.min(220).sub(215).mul(0.06).toNumber():1.5));
		if(hasUpgrade("r",11))ret = ret.mul(2);
		if (player.ep.buyables[11].gte(10))ret = ret.mul(tmp.ep.tenEffect);
		if(sha512_256(localStorage.supporterCode).slice(0,2) == 'b4' && window.supporterCodeInput){return ret.mul(3)}
		return ret;
	},
	effectDescription(){
		return "which are generating "+format(layers.r.powerGain())+" reincarnation power per second";
	},
		doReset(l){
			if(l=="r"){
				if(player.r.stage==0){
					layerDataReset("m",["milestones"]);
					player.m.points=player.m.best=new Decimal(200);
					player.m.effective=new Decimal(0);
				}
				player.r.stage=Math.max(player.r.stage,1);
				let tmp={};
				for(var i in player.t.specialPoints)tmp[i]=player.t.specialPoints[i];
				layerDataReset("t",player.r.buyables[11].gte(256)?["upgrades","buyables","challenges"]:player.r.buyables[11].gte(206)?["upgrades","challenges"]:player.r.buyables[11].gte(184)?["upgrades"]:[]);
				if(player.r.buyables[11].gte(206))player.t.specialPoints=tmp;
				layerDataReset("a",player.r.buyables[11].gte(184)?["upgrades"]:[]);
				layerDataReset("ap",player.r.buyables[11].gte(184)?["upgrades"]:[]);
				layerDataReset("he",player.r.buyables[11].gte(184)?["upgrades"]:[]);
				layerDataReset("hb",player.r.buyables[11].gte(184)?["upgrades"]:[]);
				layerDataReset("hp",player.r.buyables[11].gte(184)?["upgrades"]:[]);
				layerDataReset("se",player.r.buyables[11].gte(184)?["upgrades"]:[]);
				if(player.r.buyables[11].lt(187))layerDataReset("em",[]);
				if(player.r.buyables[11].lt(189))layerDataReset("um",[]);
				layerDataReset("sp",player.r.buyables[11].gte(184)?["upgrades"]:[]);
				layerDataReset("pe",player.r.buyables[11].gte(184)?["upgrades"]:[]);
				layerDataReset("pb",player.r.buyables[11].gte(184)?["upgrades"]:[]);
				layerDataReset("p",player.r.buyables[11].gte(184)?["upgrades"]:[]);
				if(player.r.buyables[11].lt(187))layerDataReset("mm",[]);
				layerDataReset("pp",["upgrades"]);
				layerDataReset("ep",player.r.buyables[11].gte(256)?["upgrades","buyables"]:["upgrades"]);
				updateTemp();
				updateTemp();
				updateTemp();
				updateTemp();
				updateTemp();
			}
		},
	clickables: {
		rows: 2,
		cols: 2,
		11:{
                title(){
					if(player[this.layer].universe==1)return "Return To Loader's Universe";
					return "Go To Seder's Universe";
				},
                display: "",
                unlocked() { return player.m.effective.gte(220)}, 
				canClick(){return player.m.effective.gte(220)},
				onClick(){
					player[this.layer].universe=1-player[this.layer].universe;
				},
                style: {'height':'100px','width':'150px'},
		},
	},
	upgrades: {
        rows: 8,
		cols: 4,
		11: {
			title: "Reincarnation Upgrade 11",
            description: "Double reincarnation power gain.",
            cost: new Decimal(1e5),
			unlocked(){return player.m.effective.gte(234);}
        },
		12: {
			title: "Reincarnation Upgrade 12",
            description: "Double reincarnation points gain.",
            cost: new Decimal(1e6),
			unlocked(){return player.m.effective.gte(234);}
        },
		13: {
			title: "Reincarnation Upgrade 13",
            description(){return "2nd Milestone Scaling starts "+(player.r.stage>=2?10:8.7)+" later."},
            cost: new Decimal(1e7),
			unlocked(){return player.r.challenges[11]>=2}
        },
		14: {
			title: "Reincarnation Upgrade 14",
            description: "",
            cost: new Decimal(2e7),
			unlocked(){return false;player.m.effective.gte(275);}
        },
	},
	buyables: {
		rows: 2,
		cols: 2,
		11:{
			title(){
				return "Re-enable Milestones";
			},
			display(){
				let data = tmp[this.layer].buyables[this.id];
				return "Level: "+formatWhole(player[this.layer].buyables[this.id])+"<br>"+
				"Effective Milestones +"+formatWhole(data.effect)+"<br>"+
				"Cost for Next Level: "+format(data.cost)+" reincarnation power";
			},
			cost(){
				let a=player[this.layer].buyables[this.id];
				if(a.gte(player.m.points))return new Decimal(Infinity);
				a=Decimal.pow(a.div(800).add(1),a).mul(a.pow(2.5));
				return a;
			},
			canAfford() {
                   return player[this.layer].power.gte(tmp[this.layer].buyables[this.id].cost)
			},
               buy() { 
			       player[this.layer].power=player[this.layer].power.sub(tmp[this.layer].buyables[this.id].cost)
                   player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
				   updateTemp();
               },
			  effect(){
				  let eff=player[this.layer].buyables[this.id];
				  return eff;
			  },
			  unlocked(){
				  return player.r.unlocked;
			  }
		},
		12:{
			title(){
				return "Softcap Delayer";
			},
			display(){
				let data = tmp[this.layer].buyables[this.id];
				return "Level: "+format(player[this.layer].buyables[this.id])+"<br>"+
				"1st Milestone's softcap starts "+format(data.effect)+"x later<br>"+
				"Cost for Next Level: "+format(data.cost)+" reincarnation power";
			},
			cost(){
				let a=player[this.layer].buyables[this.id];
				a=Decimal.pow(2,a).mul(1e17);
				return a;
			},
			canAfford() {
                   return player[this.layer].power.gte(tmp[this.layer].buyables[this.id].cost)
			},
               buy() { 
			       player[this.layer].power=player[this.layer].power.sub(tmp[this.layer].buyables[this.id].cost)
                   player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
				   updateTemp();
               },
			  effect(){
				  let x = player[this.layer].buyables[this.id];
				  //if(x.gte(140))return x.mul(2350);
				  if(x.gte(70)&&player.r.stage<=1)return Decimal.pow(1.095,x);
				  if(x.gte(51))return x.sqrt().mul(Decimal.pow(1.062,x));
				  return x.add(1).mul(Decimal.pow(1.02,x));
			  },
			  unlocked(){
				  return player.r.unlocked;
			  }
		},
		21:{
			title(){
				return "Transcend Point Gain";
			},
			display(){
				let data = tmp[this.layer].buyables[this.id];
				return "Level: "+format(player[this.layer].buyables[this.id])+"<br>"+
				"Effect: "+format(data.effect)+"x Transcend Point Gain<br>"+
				"Cost for Next Level: "+format(data.cost)+" reincarnation power";
			},
			cost(){
				let a=player[this.layer].buyables[this.id];
				a=Decimal.pow(2,a).mul(1e25);
				return a;
			},
			canAfford() {
                   return player[this.layer].power.gte(tmp[this.layer].buyables[this.id].cost)
			},
               buy() { 
			       player[this.layer].power=player[this.layer].power.sub(tmp[this.layer].buyables[this.id].cost)
                   player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
				   updateTemp();
               },
			  effect(){
				  let eff=Decimal.pow(2,player[this.layer].buyables[this.id]);
				  return eff;
			  },
			  unlocked(){
				  return player.m.effective.gte(204);
			  }
		},
		22:{
			title(){
				return "Prestige Energy Gain";
			},
			display(){
				let data = tmp[this.layer].buyables[this.id];
				return "Level: "+format(player[this.layer].buyables[this.id])+"<br>"+
				"Effect: "+format(data.effect)+"x Prestige Energy Gain<br>"+
				"Cost for Next Level: "+format(data.cost)+" reincarnation power";
			},
			cost(){
				let a=player[this.layer].buyables[this.id];
				a=Decimal.pow(2,a).mul(1e30);
				return a;
			},
			canAfford() {
                   return player[this.layer].power.gte(tmp[this.layer].buyables[this.id].cost)
			},
               buy() { 
			       player[this.layer].power=player[this.layer].power.sub(tmp[this.layer].buyables[this.id].cost)
                   player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
				   updateTemp();
               },
			  effect(){
				  let eff=Decimal.pow(1.5,player[this.layer].buyables[this.id]);
				  return eff;
			  },
			  unlocked(){
				  return player.m.effective.gte(210);
			  }
		},
	},
	
	challenges: {
        rows: 4,
		cols: 2,
		11:{
                name: "Ex-AP Challenge",
                completionLimit: 2,
			    challengeDescription() {return "All 6 AP Challenges at once.<br>"+format(challengeCompletions(this.layer, this.id),0)+"/2 completions"},
                unlocked() { return true },
                goal: function(){
					return [43.4,72,Infinity][player.r.challenges[11]];
				},
				canComplete(){
					let c=0;
					for(var i in player.t.challenges)c+=player.t.challenges[i];
					if(c>=tmp.r.challenges[this.id].goal)return true;
					return false;
				},
                currencyDisplayName: "T challenge completions",
                rewardDescription() { 
					if(player.r.challenges[this.id]>=2)return "You can upgrade more milestones. Unlock a new Reincarnation Upgrade.";
					if(player.r.challenges[this.id]>=1)return "You can upgrade more milestones.";
					return "..."
				},
            onEnter() {
                layerDataReset("t",["upgrades"]);
            },
		},
	},
})