var METAMILESTONES=[
		{
			requirementDescription: "1st Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(0)},
            done() {return player[this.layer].points.gte(1)}, // Used to determine when to give the milestone
            effectDescription: function(){
				if(player.um.meta.gte(1))return "Autoget Milestones and Milestone Upgrades. (Upgraded)"
				return "Autoget Milestones."
			},
        },
		{
			requirementDescription: "2nd Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(1)},
            done() {return player[this.layer].points.gte(2)}, // Used to determine when to give the milestone
            effectDescription: function(){
				if(player.um.meta.gte(2))return "6th and 27th Milestone's effect ^2 (Upgraded)"
				return "27th Milestone's effect ^2"
			},
        },
		{
			requirementDescription: "3rd Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(2)},
            done() {return player[this.layer].points.gte(3)}, // Used to determine when to give the milestone
            effectDescription: function(){
				if(player.um.meta.gte(3))return "6th and 27th Milestone's effect ^2 (Upgraded)"
				return "27th Milestone's effect ^2"
			},
        },
		{
			requirementDescription: "4th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(3)},
            done() {return player[this.layer].points.gte(4)}, // Used to determine when to give the milestone
            effectDescription: function(){
				if(player.um.meta.gte(4))return "6th and 27th Milestone's effect ^2 (Upgraded)"
				return "27th Milestone's effect ^2"
			},
        },
		{
			requirementDescription: "5th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(4)},
            done() {return player[this.layer].points.gte(5)}, // Used to determine when to give the milestone
            effectDescription:  function(){
				if(player.um.meta.gte(5))return "Third Milestone's effect is better based on your meta-milestones. (Upgraded)";
				return "Third Milestone's effect is better based on your meta-milestones.";
			},
        },
		{
			requirementDescription: "6th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(5)},
            done() {return player[this.layer].points.gte(6)}, // Used to determine when to give the milestone
            effectDescription: function(){
				if(player.um.meta.gte(6))return "6th and 27th Milestone's effect ^2 (Upgraded)"
				return "27th Milestone's effect ^1.5"
			},
        },
		{
			requirementDescription: "7th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(6)},
            done() {return player[this.layer].points.gte(7)}, // Used to determine when to give the milestone
            effectDescription: function(){
				if(player.um.meta.gte(7))return "6th and 27th Milestone's effect ^2 (Upgraded)"
				return "27th Milestone's effect ^1.5"
			},
        },
		{
			requirementDescription: "8th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(7)},
            done() {return player[this.layer].points.gte(8)}, // Used to determine when to give the milestone
            effectDescription: function(){
				if(player.um.meta.gte(8))return "6th and 27th Milestone's effect ^2 (Upgraded)"
				return "27th Milestone's effect ^1.5"
			},
        },
		{
			requirementDescription: "9th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(8)},
            done() {return player[this.layer].points.gte(9)}, // Used to determine when to give the milestone
            effectDescription: function(){
				if(player.um.meta.gte(9))return "6th and 27th Milestone's effect ^2 (Upgraded)"
				return "6th Milestone's effect ^1.5"
			},
        },
		{
			requirementDescription: "10th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(9)},
            done() {return player[this.layer].points.gte(10)}, // Used to determine when to give the milestone
            effectDescription: function(){
				if(player.um.meta.gte(10))return "Third Milestone's effect is better based on your meta-milestones. (Upgraded)";
				return "Third Milestone's effect is better based on your meta-milestones."
			},
        },
		{
			requirementDescription: "11th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(10)},
            done() {return player[this.layer].points.gte(11)}, // Used to determine when to give the milestone
            effectDescription: function(){
				if(player.um.meta.gte(11))return "6th and 27th Milestone's effect ^2 (Upgraded)"
				return "27th Milestone's effect ^1.2"
			},
        },
		{
			requirementDescription: "12th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(11)},
            done() {return player[this.layer].points.gte(12)}, // Used to determine when to give the milestone
            effectDescription: function(){
				if(player.um.meta.gte(12))return "6th and 27th Milestone's effect ^2 (Upgraded)"
				return "27th Milestone's effect ^1.2"
			},
        },
		{
			requirementDescription: "13th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(12)},
            done() {return player[this.layer].points.gte(13)}, // Used to determine when to give the milestone
            effectDescription: function(){
				if(player.um.meta.gte(13))return "6th and 27th Milestone's effect ^2 (Upgraded)"
				return "6th Milestone's effect ^1.2"
			},
        },
		{
			requirementDescription: "14th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(13)},
            done() {return player[this.layer].points.gte(14)}, // Used to determine when to give the milestone
            effectDescription: function(){
				if(player.um.meta.gte(14))return "6th and 27th Milestone's effect ^2 (Upgraded)"
				return "6th Milestone's effect ^1.2"
			},
        },
		{
			requirementDescription: "15th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(14)},
            done() {return player[this.layer].points.gte(15)}, // Used to determine when to give the milestone
            effectDescription: function(){
				if(player.um.meta.gte(15))return "Third Milestone's effect is better based on your meta-milestones. (Upgraded)";
				return "Third Milestone's effect is better based on your meta-milestones."
			},
        },
		{
			requirementDescription: "16th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(15)},
            done() {return player[this.layer].points.gte(16)}, // Used to determine when to give the milestone
            effectDescription: function(){
				if(player.um.meta.gte(16))return "6th and 27th Milestone's effect ^2 (Upgraded)"
				return "27th Milestone's effect ^1.2"
			},
        },
		{
			requirementDescription: "17th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(16)},
            done() {return player[this.layer].points.gte(17)}, // Used to determine when to give the milestone
            effectDescription: function(){
				if(player.um.meta.gte(17))return "6th and 27th Milestone's effect ^2 (Upgraded)"
				return "6th Milestone's effect ^1.7"
			},
        },
		{
			requirementDescription: "18th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(17)},
            done() {return player[this.layer].points.gte(18)}, // Used to determine when to give the milestone
            effectDescription: function(){
				if(player.um.meta.gte(18))return "6th and 27th Milestone's effect ^2 (Upgraded)"
				return "27th Milestone's effect ^1.8"
			},
        },
		{
			requirementDescription: "19th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(18)},
            done() {return player[this.layer].points.gte(19)}, // Used to determine when to give the milestone
            effectDescription: function(){
				if(player.um.meta.gte(19))return "6th and 27th Milestone's effect ^2 (Upgraded)"
				return "27th Milestone's effect ^1.9"
			},
        },
		{
			requirementDescription: "20th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(19)},
            done() {return player[this.layer].points.gte(20)}, // Used to determine when to give the milestone
            effectDescription: function(){
				if(player.um.meta.gte(20))return "Third Milestone's effect is better based on your meta-milestones. (Upgraded)";
				return "Third Milestone's effect is better based on your meta-milestones."
			},
        },
		{
			requirementDescription: "21st Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(20)},
            done() {return player[this.layer].points.gte(21)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Transcend Point gain is doubled"
			},
        },
		{
			requirementDescription: "22nd Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(21)},
            done() {return player[this.layer].points.gte(22)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Transcend Point gain is doubled"
			},
        },
		{
			requirementDescription: "23rd Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(22)},
            done() {return player[this.layer].points.gte(23)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Transcend Point gain is doubled"
			},
        },
		{
			requirementDescription: "24th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(23)},
            done() {return player[this.layer].points.gte(24)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Transcend Point gain is doubled"
			},
        },
		{
			requirementDescription: "25th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(24)},
            done() {return player[this.layer].points.gte(25)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Transcend Point gain is boosted based on your meta-milestones. Currently: "+format(tmp.mm.meta25Effect)+"x";
			},
        },
		{
			requirementDescription: "26th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(25)},
            done() {return player[this.layer].points.gte(26)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Prestige Energy gain is doubled";
			},
        },
		{
			requirementDescription: "27th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(26)},
            done() {return player[this.layer].points.gte(27)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Prestige Energy gain is doubled";
			},
        },
		{
			requirementDescription: "28th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(27)},
            done() {return player[this.layer].points.gte(28)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Prestige Energy gain is doubled";
			},
        },
		{
			requirementDescription: "29th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(28)},
            done() {return player[this.layer].points.gte(29)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Prestige Energy gain is doubled";
			},
        },
		{
			requirementDescription: "30th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(29)},
            done() {return player[this.layer].points.gte(30)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "25th Meta-Milestone's effect ^2, Unlock a new layer.";
			},
        },
		{
			requirementDescription: "31st Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(30)},
            done() {return player[this.layer].points.gte(31)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Prestige Energy gain is doubled";
			},
        },
		{
			requirementDescription: "32nd Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(31)},
            done() {return player[this.layer].points.gte(32)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Prestige Energy gain is doubled";
			},
        },
		{
			requirementDescription: "33rd Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(32)},
            done() {return player[this.layer].points.gte(33)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Prestige Energy gain is doubled";
			},
        },
		{
			requirementDescription: "34th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(33)},
            done() {return player[this.layer].points.gte(34)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Prestige Energy gain is doubled";
			},
        },
		{
			requirementDescription: "35th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(34)},
            done() {return player[this.layer].points.gte(35)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Base Prestige Energy gain ^1.1, Prestige Energy gain is multiplied by 1.741";
			},
        },
		{
			requirementDescription: "36th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(35)},
            done() {return player[this.layer].points.gte(36)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Super Energy gain is doubled";
			},
        },
		{
			requirementDescription: "37th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(36)},
            done() {return player[this.layer].points.gte(37)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Super Energy gain is doubled";
			},
        },
		{
			requirementDescription: "38th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(37)},
            done() {return player[this.layer].points.gte(38)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Super Energy gain is doubled";
			},
        },
		{
			requirementDescription: "39th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(38)},
            done() {return player[this.layer].points.gte(39)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Super Energy gain is doubled";
			},
        },
		{
			requirementDescription: "40th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(39)},
            done() {return player[this.layer].points.gte(40)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Reincarnation Point gain is doubled";
			},
        },
		{
			requirementDescription: "41st Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(40)},
            done() {return player[this.layer].points.gte(41)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Super Energy gain is doubled";
			},
        },
		{
			requirementDescription: "42nd Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(41)},
            done() {return player[this.layer].points.gte(42)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Super Energy gain is doubled";
			},
        },
		{
			requirementDescription: "43rd Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(42)},
            done() {return player[this.layer].points.gte(43)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Super Energy gain is doubled";
			},
        },
		{
			requirementDescription: "44th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(43)},
            done() {return player[this.layer].points.gte(44)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Super Energy gain is doubled";
			},
        },
		{
			requirementDescription: "45th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(44)},
            done() {return player[this.layer].points.gte(45)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Reincarnation Point gain is doubled";
			},
        },
		{
			requirementDescription: "46th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(45)},
            done() {return player[this.layer].points.gte(46)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Hyper Energy gain is doubled";
			},
        },
		{
			requirementDescription: "47th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(46)},
            done() {return player[this.layer].points.gte(47)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Hyper Energy gain is doubled";
			},
        },
		{
			requirementDescription: "48th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(47)},
            done() {return player[this.layer].points.gte(48)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Hyper Energy gain is doubled";
			},
        },
		{
			requirementDescription: "49th Meta-Milestone",
            unlocked() {return player[this.layer].best.gte(48)},
            done() {return player[this.layer].points.gte(49)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Hyper Energy gain is doubled";
			},
        },
	]
	
var meta_st=function(){
	if(player.um.meta.gt(this.id)){
		return {backgroundColor: "#cccc00"};
	}
	return {};
}
for(var milestoneId in METAMILESTONES){
	METAMILESTONES[milestoneId].style=meta_st;
}

addLayer("mm", {
    name: "meta-milestone", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "MM", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#A057B0",
    requires(){
		//if(player.mm.points.gte(20))return new Decimal(Infinity);
		let b=new Decimal(40);
		if(hasUpgrade("t",72))b=b.div(upgradeEffect("t",72));
		return b;
	}, // Can be a function that takes requirement increases into account
    resource: "meta-milestones", // Name of prestige currency
    baseResource() {if(player.r.stage>=1)return "effective milestones";return "milestones"}, // Name of resource prestige is based on
    baseAmount() {return player.m.effective}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
	base: new Decimal(1.047),
	exponent: function(){
		return new Decimal(1)
	},
    hotkeys: [
        {key: "M", description: "Shift+M: Get Meta-Milestone", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.m.effective.gte(40) && player.r.universe==0},
	resetsNothing(){return true},
	autoPrestige(){return player.em.points.gte(1)},
	milestones: METAMILESTONES,
    resetDescription: "Get ",
	branches:["m"],
	doReset(){},
	meta25Effect(){
		let ret=player.mm.points.div(10);
		if(player.mm.points.gte(30))ret=ret.pow(2);
		return ret;
	},
	roundUpCost: true
})