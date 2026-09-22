
addLayer("em", {
    name: "extra-milestone", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "EM", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#B070C0",
    requires(){
		let b=new Decimal(30);
		return b;
	}, // Can be a function that takes requirement increases into account
    resource: "extra-milestones", // Name of prestige currency
    baseResource: "meta-milestones", // Name of resource prestige is based on
    baseAmount() {return player.mm.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
	base: new Decimal(1.03),
	exponent: function(){
		return new Decimal(1)
	},
    hotkeys: [
        {key: "ctrl+m", description: "Ctrl+M: Get Extra-Milestone", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.mm.points.gte(30) && player.r.universe==0},
	resetsNothing(){return true},
	autoPrestige(){return false},
	milestones: [
		{
			requirementDescription: "1st Extra-Milestone",
            unlocked() {return player[this.layer].best.gte(0)},
            done() {return player[this.layer].points.gte(1)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Autoget Meta-Milestones."
			},
        },
		{
			requirementDescription: "2nd Extra-Milestone",
            unlocked() {return player[this.layer].best.gte(1)},
            done() {return player[this.layer].points.gte(2)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Third Milestone's effect is better based on your extra-milestones."
			},
        },
		{
			requirementDescription: "3rd Extra-Milestone",
            unlocked() {return player[this.layer].best.gte(2)},
            done() {return player[this.layer].points.gte(3)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Unlock new Super Energy upgrades."
			},
        },
		{
			requirementDescription: "4th Extra-Milestone",
            unlocked() {return player[this.layer].best.gte(3)},
            done() {return player[this.layer].points.gte(4)}, // Used to determine when to give the milestone
            effectDescription: function(){
	            if(player.em.points.gte(8))return format(player.em.points)+"x Transcend Point gain"
	            if(player.em.points.gte(7))return format(player.em.points.sqrt())+"x Transcend Point gain"
				return "1.1x Transcend Point gain"
			},
        },
		{
			requirementDescription: "5th Extra-Milestone",
            unlocked() {return player[this.layer].best.gte(4)},
            done() {return player[this.layer].points.gte(5)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Milestone Upgrades are cheaper.";
			},
        },
		{
			requirementDescription: "6th Extra-Milestone",
            unlocked() {return player[this.layer].best.gte(5)},
            done() {return player[this.layer].points.gte(6)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Unlock new Hyper Energy upgrades."
			},
        },
		{
			requirementDescription: "7th Extra-Milestone",
            unlocked() {return player[this.layer].best.gte(6)},
            done() {return player[this.layer].points.gte(7)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "4th Extra-Milestone's effect is better based on your Extra-Milestones."
			},
        },
		{
			requirementDescription: "8th Extra-Milestone",
            unlocked() {return player[this.layer].best.gte(7)},
            done() {return player[this.layer].points.gte(8)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "4th Extra-Milestone's effect is squared."
			},
        },
		{
			requirementDescription: "9th Extra-Milestone",
            unlocked() {return player[this.layer].best.gte(8)},
            done() {return player[this.layer].points.gte(9)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Milestone Upgrades are cheaper.";
			},
        },
		{
			requirementDescription: "10th Extra-Milestone",
            unlocked() {return player[this.layer].best.gte(9)},
            done() {return player[this.layer].points.gte(10)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Reincarnation Point gain is doubled";
			},
        },
		{
			requirementDescription: "11th Extra-Milestone",
            unlocked() {return player[this.layer].best.gte(10)},
            done() {return player[this.layer].points.gte(11)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Unlock a Transcend Buyable.";
			},
        },
		{
			requirementDescription: "12th Extra-Milestone",
            unlocked() {return player[this.layer].best.gte(11)},
            done() {return player[this.layer].points.gte(12)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Unlock a Transcend Buyable.";
			},
        },
		{
			requirementDescription: "13th Extra-Milestone",
            unlocked() {return player[this.layer].best.gte(12)},
            done() {return player[this.layer].points.gte(13)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "First Exotic-Prestige points effect is doubled.";
			},
        },
		{
			requirementDescription: "14th Extra-Milestone",
            unlocked() {return player[this.layer].best.gte(13)},
            done() {return player[this.layer].points.gte(14)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "Unlock an AP Buyable.";
			},
        },
		{
			requirementDescription: "15th Extra-Milestone",
            unlocked() {return player[this.layer].best.gte(14)},
            done() {return player[this.layer].points.gte(15)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "7th Exotic-Prestige points effect is better, and +1 'Exotic Fusioner II' Max Level";
			},
        },
		{
			requirementDescription: "16th Extra-Milestone",
            unlocked() {return player[this.layer].best.gte(15)},
            done() {return player[this.layer].points.gte(16)}, // Used to determine when to give the milestone
            effectDescription: function(){
				return "+1 'Exotic Fusioner II' Max Level";
			},
        },
	],
	branches(){
		if(player.r.stage>=1)return ["pb","pe"];
		if(player.m.effective.gte(184)){//unstable
			if(Date.now()%1200<400)return ["pb"];
			if(Date.now()%1200<800)return ["pe"];
			return ["mm"];
		}
		return ["mm"];
	},
    resetDescription: "Get ",
	doReset(){},
	roundUpCost: true
})