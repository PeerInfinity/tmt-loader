
const typeName = {
    div: "Trojan",
    pm: "Backdoor",
    unload: "Unloader",
    pow: "P-Unloader",
}
function formatRoman(num) {
    var roman = {
        M̅̅:1000000000,L̅̅M̅̅:900000000,L̅̅:500000000,C̅̅L̅̅:400000000, C̅̅:100000000, L̅̅C̅̅:90000000,L̅̅:50000000,X̅̅L̅̅:40000000, X̅̅:10000000,M̅X̅̅:9000000,V̅̅:5000000,M̅V̅̅:4000000,M̅:1000000,C̅M̅:900000,D̅:500000,C̅D̅:400000,C̅: 100000,X̅C̅:90000,L̅:50000,X̅L̅:40000, X̅: 10000,MX̅: 9000,V̅:5000,MV̅:4000,M: 1000, CM: 900, D: 500, CD: 400,
      C: 100, XC: 90, L: 50, XL: 40,
      X: 10, IX: 9, V: 5, IV: 4, I: 1
      
    };
    var str = '';
  
    for (var i of Object.keys(roman)) {
      var q = Math.floor(num / roman[i]);
      num -= q * roman[i];
      str += i.repeat(q);
    }
  
    return str;
}
addLayer("cp", {
    name: "corruptions", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "CP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        formatted: new Decimal(0),
    }},
    tooltip() {
        return format(player.cp.points,0)+ " corruptions fixed"
    },
    nodeStyle() {
        return {
            'border': '5px solid green',
            'border-style': 'dashed',
            'color':'green',
        }
    },
    canReset: false,
    color: "black",
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    row: 5, // Row the layer is in on the tree (0 is the first row)
    upgrades: {
        rows: 4,
		cols: 4,/*
		11: {
			title: "Corrupted Upgrade 11",
            description: "You can fix 2 corruptions at the same time.<br>(Point divider will be the highest from active ones).",
            unlocked() {return false;player.pm.best.gte(7)},
            cost: new Decimal(100),
            currencyDisplayName: "corruption essences",
            currencyInternalName: "formatted",
            currencyLayer:"cp",
            style() {
                    if (hasUpgrade('cp',11)) return {
                        'background':'#00520b',
                        'border-color':'lime',
                        'color':'lime',
                        'border-radius':'0%',
                    }
                    
                    else if (player.cp.formatted.gte(this.cost)) return {
                        'background':'#444',
                        'border-color':'lime',
                        'color':'lime',
                        'border-radius':'0%',
                        'cursor':'pointer',
                    }
                   else return {
                        'background':'#0f0f0f',
                        'border-color':'lime',
                        'color':'lime',
                        'border-radius':'0%',
                    }
            },
        },
		12: {
			title: "Corrupted Upgrade 12",
            description: "Prestige Milestones boosts Corruption's Reward and corruption essences effect.",
            costDescription() {return "Cost: 150 corruption essences<br>1e16 Points"},
            unlocked() {return false;player.pm.best.gte(8)},
            cost: new Decimal(150),
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
				let base=2;
				let ret = player.pm.best.div(20).add(1).add(player.pm.best.mul(player.cm.points.gte(1)?tmp.cm.cMilestone1Effect:0))
                return ret;
            },
			canAfford() {
				return (player.points.gte(1e16)&&player.cp.formatted.gte(this.cost))
			},
			pay() {
				player.cp.formatted = player.cp.formatted.sub(this.cost)
				player.points = player.points.sub(1e16)
			},
            effectDisplay() { return format(this.effect())+"x" },
        style() {
            if (hasUpgrade('cp',12)) return {
                'background':'#00520b',
                'border-color':'lime',
                'color':'lime',
                'border-radius':'0%'
            }
            
            if (this.canAfford()) return {
                'background':'#444',
                'border-color':'lime',
                'color':'lime',
                'border-radius':'0%',
                'cursor':'pointer',
            }
           return {
                'background':'#0f0f0f',
                'border-color':'lime',
                'color':'lime',
                'border-radius':'0%',
            }
        },
    },
    13: {
        title: "Corrupted Upgrade 13",
        description: "Prestige Milestones and Points reduces Essence Fusioner <b>Scaled</b> scaling strength.",
        costDescription() {return "Cost: 5000 corruption essences<br>1e23 Points"},
        unlocked() {return false;player.pm.best.gte(11)},
        cost: new Decimal(5000),
        effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
            let ret = (player.pm.best.pow(0.375)).div(10).mul(player.points.add(1).log10().add(1).log(5))
            return ret.min(0.9);
        },
        canAfford() {
            return (player.points.gte(1e23)&&player.cp.formatted.gte(this.cost))
        },
        pay() {
            player.cp.formatted = player.cp.formatted.sub(this.cost)
            player.points = player.points.sub(1e23)
        },
        effectDisplay() { return format(this.effect().mul(100))+"%" },
    style() {
        if (hasUpgrade('cp',13)) return {
            'background':'#00520b',
            'border-color':'lime',
            'color':'lime',
            'border-radius':'0%'
        }
        
        if (this.canAfford()) return {
            'background':'#444',
            'border-color':'lime',
            'color':'lime',
            'border-radius':'0%',
            'cursor':'pointer',
        }
       return {
            'background':'#0f0f0f',
            'border-color':'lime',
            'color':'lime',
            'border-radius':'0%',
        }
    },
},*/
	},
    grid: {
		rows: 2,
		cols: 2,
        getStartData(id) {
            return {level: 0,active: false,fixed: false,type:"div",cautPower:0}
        },
        getUnlocked(id) { // Default
            return true
        },
        getCanClick(data, id) {
            return true
        },
        getStyle(data,id) {
            if (data.level<1) {
                return {
                    'background':'#3b3939',
                    'width':'100px',
                    'height':'100px',
                    'border-radius':'0%'
                }
            }
            else if (data.active==true) {
                return {
                    'background':'#0f0f0f',
                    'border-color':'yellow',
                    'color':'lime',
                    'width':'100px',
                    'height':'100px',
                    'border-radius':'0%',
                }
            }
            else{
                return {
                    'background':'#0f0f0f',
                    'border-color':'lime',
                    'color':'lime',
                    'width':'100px',
                    'height':'100px',
                    'border-radius':'0%'
                }
            }
        },
        getTooltipStyle(data,id) {
            if (data === undefined || data.level<1) return {
                'background':'rgba(0,0,0,0)',
            }
               else {
                switch (options.changeCorruptTooltipPlace) {
                    case "right":
                        return {  
                        'border':'2px solid transparent',
                        'border-image':'linear-gradient(to right, lime 0%, #52f552 50%,lime 100%)',
                        'background':'#0f0f0f',
                        'right': '0%',
                        'left':'260%',
                        'bottom': '5%',
                        'width':'300px',
                        'border-image-slice': '1'
                    };
                    case "left":
                        return {  
                            'border':'2px solid lime',
                            'border-image':'linear-gradient(to right, lime 0%, #52f552 50%,lime 100%)',
                            'background':'#0f0f0f',
                            'right': '0%',
                            'left':'-160%',
                            'bottom': '5%',
                            'width':'300px',
                            'border-image-slice': '1'
                        };
                    case "bottom":
                        return {  
                            'border':'2px solid lime',
                            'border-image':'linear-gradient(to right, lime 0%, #52f552 50%,lime 100%)',
                            'background':'#0f0f0f',
                            'right': '0%',
                            'bottom': '-100%',
                            'width':'300px',
                            'border-image-slice': '1'
                        };
                    case "top":
                        return {  
                            'border':'2px solid lime',
                            'border-image':'linear-gradient(to right, lime 0%, #52f552 50%,lime 100%)',
                            'background':'#0f0f0f',
                            'right': '0%',
                            'bottom': '100%',
                            'width':'300px',
                            'border-image-slice': '1'
                        };
                }
                }
        },
        getTooltip(data,id) {
            if (data === undefined || data.level<1){
				return;
            }else{
				let ret="<h5>To fix, get "+format(tmp.cp.challenges[id].goal)+(data.type=="pm"?" prestige essences":" points")+" while corruption is active.<br>When active, ";
				if(id==201){
					ret=ret+"^"+format(tmp.cp.challenges[id].nerfEffect,5)+" to points gain.<br>"+"Reward: Get " + format(layers.cp.challenges[id].rewardEffect(1),0)+" corruption essences on fix.";
				}else{
					ret=ret+"/"+format(tmp.cp.challenges[id].nerfEffect,5)+" to" +(data.type=="pm"?" prestige essences":" points") +"  gain.<br>"+"Reward: Get " + format(layers.cp.challenges[id].rewardEffect(1),0)+" corruption essences on fix.";
				}
				return ret;
			}
        },
        onClick(data, id) {
			startChallenge("cp",id);
        },
        getDisplay(data, id) {
            table=''
            if (data.level<1) table="This hard drive is stable. No corruptions detected."
            else table= `<h3>${typeName[data.type]}</h3>`+(data.cautPower>0?"<br>(Caution "+formatRoman(data.cautPower)+")<br>":"<br>")+ `Corruption` +"<br>Level: <h3>"+formatRoman(data.level)+"</h3><br>Progress to fix: [==========]"
            for(i=1;i<11;i++){
                if (data.active==true && data.type=='div') {
                if (player.points.gte(tmp.cp.challenges[id].goal.mul(new Decimal(0.1).mul(i)))) {
                    table = table.replace('=','█')        
                 }
            }
            else if (data.active==true && data.type=='pm') {
                if (player.pm.essence.gte(tmp.cp.challenges[id].goal.mul(new Decimal(0.1).mul(i)))) {
                    table = table.replace('=','█')        
                 }
            }
            else if (data.active==true && data.type=='unload') {
                if (player.points.gte(tmp.cp.challenges[id].goal.pow(new Decimal(0.1).mul(i)))) {
                    table = table.replace('=','█')        
                 }
            }
            }
            if (data.active==true&& data.type=='div'){
                table+="<br>-< "+format(player.points.div(tmp.cp.challenges[id].goal).mul(100).min(100))+"% >-" 
            }
            if (data.active==true&& data.type=='pm'){
                table+="<br>-< "+format(player.pm.essence.div(tmp.cp.challenges[id].goal).mul(100).min(100))+"% >-" 
            }
            if (data.active==true&& data.type=='unload'){
                table+="<br>-< "+format(player.points.add(10).log10().div(tmp.cp.challenges[id].goal.add(10).log10()).mul(100).min(100))+"% >-" 
            }
            return table
        },
    },
    buyables: {
        11:{
			title(){
				return "<h3 class='corr'>Increase Caution Level</h3>";
			},
			display(){
				let data = tmp[this.layer].buyables[this.id];
				return "Total buyed: "+format(player[this.layer].buyables[this.id])+"<br>"+"Increase Caution Level on random corruption. <br>Cost: "+format(data.cost)+" Corruption Essences";
			},
			cost(x) {return new Decimal(1000000).mul(x.add(1).pow(x/10));
			},
			canAfford() {
                   return player.cp.formatted.gte(tmp[this.layer].buyables[this.id].cost)
			},
               buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                   player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                   player.cp.formatted=player.cp.formatted.sub(cost)
                   let grid = player.cp.grid
                   let slots = Object.keys(grid).filter(x=>grid[x].level>0)
                   if (slots.length) {
                       let slot = slots[Math.floor(Math.random() * slots.length)]
                       player.cp.grid[slot] = { level: getGridData('cp',slots[i]).level,active:false,fixed:false,type:getGridData('cp',slots[i]).type,cautPower:1 }
               }
               },
			  unlocked(){
				  return false;player.pm.best.gte(15);
			  },
			  style() {
				if (player.cp.formatted.lt(this.cost())) return {
					'border-radius': '0%',
					'color':'white',
					'background-color':'black',
					'border':'2px solid',
					'height':'125px',
					'width':'200px',
				}
				else return {
					'border-radius': '0%',
					'color':'white',
					'background-color':'rgb(68, 68, 68)',
					'border':'2px solid',
					'height':'125px',
					'width':'200px',
                    'cursor':'pointer',
				}
            }
        },
        21:{
            sellOne() {
                player.cp.buyables[21]=player.cp.buyables[21].sub(1).max(0)
                let cost = new Decimal(100000).mul(player.cp.buyables[21].add(1).pow(new Decimal(player.cp.buyables[21]/5).add(1)))
                player.cp.formatted=player.cp.formatted.add(cost)
            },
            canSellOne() {return player.cp.buyables[21].gt(0)},
			title(){
				return "<h3 class='corr'>Corruption Booster</h3>";
			},
			display(){
				let data = tmp[this.layer].buyables[this.id];
				return "Total buyed: "+format(player[this.layer].buyables[this.id])+"<br>"+"Boosts corruption essences effect. <br>Cost: "+format(data.cost)+" Corruption Essences"+"<br>Currently: "+format(this.effect())+"x";
			},
			cost(x) {return new Decimal(100000).mul(x.add(1).pow(new Decimal(x/5).add(1)));
			},
			canAfford() {
                   return player.cp.formatted.gte(tmp[this.layer].buyables[this.id].cost)
			},
               buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                   player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                   player.cp.formatted=player.cp.formatted.sub(cost)
               },
			  unlocked(){
				  return false;player.cm.best.gte(4);
			  },
            effect(x) {
                let eff = x*100.56*(3**(x+1))+1
                return softcap(new Decimal(eff),new Decimal(1e14),0.5)
            },
			  style() {
				if (player.cp.formatted.lt(this.cost())) return {
					'border-radius': '0%',
					'color':'white',
					'background-color':'black',
					'border':'2px solid',
					'height':'125px',
					'width':'200px',
				}
				else return {
					'border-radius': '0%',
					'color':'white',
					'background-color':'rgb(68, 68, 68)',
					'border':'2px solid',
					'height':'125px',
					'width':'200px',
                    'cursor':'pointer',
				}
            }
        },
        22:{
            sellOne() {
                player.cp.buyables[22]=player.cp.buyables[22].sub(1).max(0)
                let cost=new Decimal(200000).mul(player.cp.buyables[22].add(1).pow(new Decimal((player.cp.buyables[22])/5).add(1)))
                player.cp.formatted=player.cp.formatted.add(cost)
            },
            canSellOne() {return player.cp.buyables[22].gt(0)},
			title(){
				return "<h3 class='corr'>Corruption Simplifier</h3>";
			},
			display(){
				let data = tmp[this.layer].buyables[this.id];
				return "Total buyed: "+format(player[this.layer].buyables[this.id])+"<br>"+"Reduces corruptions goals. <br>Cost: "+format(data.cost)+" Corruption Essences"+"<br>Currently: /"+format(this.effect());
			},
			cost(x) {return new Decimal(200000).mul(x.add(1).pow(new Decimal(x/5).add(1)));
			},
			canAfford() {
                   return player.cp.formatted.gte(tmp[this.layer].buyables[this.id].cost)
			},
               buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                   player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                   player.cp.formatted=player.cp.formatted.sub(cost)
               },
			  unlocked(){
				  return false;player.cm.best.gte(4);
			  },
            effect(x) {
                let eff = x*20.85*(2.5**(x+1))+1
                return softcap(new Decimal(eff),new Decimal(1e6),0.25)
            },
			  style() {
				if (player.cp.formatted.lt(this.cost())) return {
					'border-radius': '0%',
					'color':'white',
					'background-color':'black',
					'border':'2px solid',
					'height':'125px',
					'width':'200px',
				}
				else return {
					'border-radius': '0%',
					'color':'white',
					'background-color':'rgb(68, 68, 68)',
					'border':'2px solid',
					'height':'125px',
					'width':'200px',
                    'cursor':'pointer',
				}
            }
        },
    },
	nBoostEffect(){
		return player.cp.formatted.add(1).log10().div(100).add(1);
	},
    layerShown(){return player.m.effective.gte(270) && player.r.universe == 1},
    tabFormat: {
        "Main": {
            content:[
                    ["display-text", function(){return "You fixed <h2 style='color:  lime; text-shadow: lime 0px 0px 10px;'>"+format(player.cp.points,0)+"</h2> corruptions."}],
                    ["display-text", function(){if(true){
						return "You have <h2 style='color:  green; text-shadow: green 0px 0px 10px;'> "+format(player.cp.formatted,0)+"</h2> corruption essences, which boosts 1st milestone by ^"+ format(tmp.cp.nBoostEffect)
					}return "You have <h2 style='color:  green; text-shadow: green 0px 0px 10px;'> "+format(player.cp.formatted,0)+"</h2> corruption essences, which boosts points and Prestige Essences gain by "+ format(1)+ "x (points boost works outside of prestige universe)"}],
                     "blank",
                "blank",
                "grid"
                ]
            },
            "Upgrades": {
                unlocked() {return false;player.pm.best.gte(7)},
                content:[
                    function() { if (player.tab == "cp")  return ["column", [
						["display-text", "You fixed <h2 style='color:  lime; text-shadow: lime 0px 0px 10px;'>"+format(player.cp.points,0)+"</h2> corruptions."],
                        "prestige-button",
                        ["display-text", "You have <h2 style='color:  green; text-shadow: green 0px 0px 10px;'> "+format(player.cp.formatted,0)+"</h2> corruption essences, which boosts points and Prestige Essences gain by "+ format(corruptEffect())+ "x (points boost works outside of prestige universe)"],
                         "blank",
                    "upgrades",
                    "blank",
                    ]
                ]
         },
         ]
                },/*
                "Caution": {
                    unlocked() {return player.pm.best.gte(15)},
                    content:[
                        function() { if (player.tab == "cp")  return ["column", [
                            ["display-text", "You caused <h2 style='color:  black; text-shadow: white 0px 0px 10px;'> "+format(player.cp.points,0)+"</h2> corruptions."],
                            "prestige-button",
                            ["display-text", "You have <h2 style='color:  green; text-shadow: green 0px 0px 10px;'> "+format(player.cp.formatted)+"</h2> corruption essences, which boosts points and Prestige Essences gain by "+ format(corruptEffect())+ "x (points boost works outside of prestige universe)"],
                            ["display-text", "Note: It is highly recommended to NOT get Caution power for now.<br> Caution Power affects corruption's goal, reward, and debuff. Also it stays on disk permanently, even if it has no corruption."],
                             "blank",
                        ["buyable",11],
                        "blank",
                        ]
                    ]
             },
             ]
                },
                "Antivirus": {
                    unlocked() {return player.cm.best.gte(4)},
                    content:[
                        function() { if (player.tab == "cp")  return ["column", [
                            ["display-text", "You caused <h2 style='color:  black; text-shadow: white 0px 0px 10px;'> "+format(player.cp.points,0)+"</h2> corruptions."],
                            "prestige-button",
                            ["display-text", "You have <h2 style='color:  green; text-shadow: green 0px 0px 10px;'> "+format(player.cp.formatted)+"</h2> corruption essences, which boosts points and Prestige Essences gain by "+ format(corruptEffect())+ "x (points boost works outside of prestige universe)"],
                            ["display-text", "Antivirus auto-detects and fixes level 0-"+format(antiCorrupt(),0)+" corruptions"],
                            "blank",
                            ["buyables",[2]],
                            "blank",
                        ]
                    ]
                },
                ]
                    },*/
		},

	branches: ["mp","r"],
    update(diff) {
		player.cp.points=new Decimal(player.cp.challenges[101]+player.cp.challenges[102]+player.cp.challenges[201]+player.cp.challenges[202]);
		player.cp.formatted=new Decimal(challengeEffect("cp",101).add(challengeEffect("cp",102)).add(challengeEffect("cp",201)).add(challengeEffect("cp",202)));
		if(player.m.effective.gte(270)){
			player.cp.grid[201]={level: player.cp.challenges[201]+1,active:player.cp.activeChallenge==201,fixed:false,type:"unload",cautPower:0}
		}
		if(player.cp.activeChallenge==201 && player.points.gte(layers.cp.challenges[201].goal())){
			player.cp.challenges[201]++;
			delete player.cp.activeChallenge;
			doPopup("none","Corruption was fixed!","Corruption Info",3,"lime");
		}
    },
	challenges: {
		101: {
			name: "Trojan",
			completionLimit: Infinity,
			challengeDescription() {return "Reduce point gain<br>"+format(challengeCompletions(this.layer, this.id),0)  +" completions"},
			unlocked() { return false },
			goal: function(){
				return new Decimal(1);
			},
			canComplete(){
				return player.points.gte(tmp.cp.challenges[this.id].goal);
			},
			nerfEffect(){
				return new Decimal(player.cp.challenges[101]).add(2).mul(3).pow(1+player.cp.challenges[101]/10)
			},
			rewardEffect(a){
				if(a==1)return Decimal.pow(player.cp.challenges[101]+1,3).sub(Decimal.pow(player.cp.challenges[101],3));
				return Decimal.pow(player.cp.challenges[101],3);
			},
			currencyDisplayName: "Points",
		},
		102: {
			name: "Backdoor",
			completionLimit: Infinity,
			challengeDescription() {return "Reduce point gain<br>"+format(challengeCompletions(this.layer, this.id),0)  +" completions"},
			unlocked() { return false },
			goal: function(){
				return new Decimal(1);
			},
			canComplete(){
				return player.points.gte(tmp.cp.challenges[this.id].goal);
			},
			nerfEffect(){
				return new Decimal(player.cp.challenges[102]).add(2).mul(1.5).pow(1+player.cp.challenges[102]/10)
			},
			rewardEffect(a){
				if(a==1)return Decimal.pow(player.cp.challenges[102]+1,3).sub(Decimal.pow(player.cp.challenges[102],3));
				return Decimal.pow(player.cp.challenges[102],3);
			},
			currencyDisplayName: "Points",
		},
		201: {
			name: "Unloader",
			completionLimit: Infinity,
			challengeDescription() {return "Reduce point gain<br>"+format(challengeCompletions(this.layer, this.id),0)  +" completions"},
            onEnter() {
                layerDataReset("t",["buyables","upgrades","challenges"])
                layerDataReset('pp',["upgrades"])
                layerDataReset('p',["upgrades"])
				layerDataReset('sp',["upgrades"])
				layerDataReset('pe',["upgrades"])
				layerDataReset('hp',["upgrades"])
				layerDataReset('ap',["upgrades","challenges"])
				layerDataReset('pb',["upgrades"])
				layerDataReset('hb',["upgrades"])
				layerDataReset('se',["upgrades"])
                layerDataReset("ep",["buyables","upgrades"])
				player.points=new Decimal(10)
            },
			unlocked() { return player.m.effective.gte(270) },
			goal: function(){
				let ret=Decimal.pow(10,Decimal.pow(10,player.cp.challenges[201]*0.3+36));
				if(player.cp.challenges[201]>=9)ret = ret.pow(0.46);
				return ret;
			},
			canComplete(){
				return player.points.gte(tmp.cp.challenges[this.id].goal);
			},
			nerfEffect(){
				return new Decimal(player.cp.challenges[201]).add(2).mul(5).pow(1+player.cp.challenges[201]/10).recip()
			},
			rewardEffect(a){
				if(a==1)return Decimal.pow(player.cp.challenges[201]+1,3).sub(Decimal.pow(player.cp.challenges[201],3));
				return Decimal.pow(player.cp.challenges[201],3);
			},
			currencyDisplayName: "Points",
		},
		202: {
			name: "P-Unloader",
			completionLimit: Infinity,
			challengeDescription() {return "Reduce point gain<br>"+format(challengeCompletions(this.layer, this.id),0)  +" completions"},
			unlocked() { return false },
			goal: function(){
				return new Decimal(1);
			},
			canComplete(){
				return player.points.gte(tmp.cp.challenges[this.id].goal);
			},
			nerfEffect(){
				return new Decimal(player.cp.challenges[202]).add(2).mul(1.5).pow(1+player.cp.challenges[202]/10).recip()
			},
			rewardEffect(a){
				if(a==1)return Decimal.pow(player.cp.challenges[202]+1,3).sub(Decimal.pow(player.cp.challenges[202],3));
				return Decimal.pow(player.cp.challenges[202],3);
			},
			currencyDisplayName: "Points",
		},
	},
	doReset(l){
		return;
	}
})