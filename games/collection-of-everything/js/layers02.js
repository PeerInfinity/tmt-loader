addLayer("met11",{
    name: "",
    symbol:"<img src='js/Tree1/MetalMaster.png' style='width:calc(80% - 2px);height:calc(80% - 2px);margin:10%'></img>",
    position: 1,
    startData(){return{
        unlocked: false,
        points: new Decimal(0),
        gauge: new Decimal(0),
    }},
    requires: new Decimal(1e22),
    resource: "Copper",
    baseResource: "Knowledge",
    baseAmount() {return player.points},
    canReset(){
        if(player.s.PickPow.gte(14)&&player.points.gte(1e22)) return true
    },
    type: "normal",
    exponent: 0.5,
    branches: ['s'],
    gainMult() {
        let mult = new Decimal(1)
        mult = mult.div(player.met11.gauge.max(1))
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 3,
    displayRow:1,
    color: "#b87333",
    layerShown(){
        if((hasChallenge('st',22)||player.met11.points>0)&&player.switch.treeSelect==2) return true
    },
    update(diff){
        if(player.met11.total>0) player.met11.gauge = player.met11.gauge.add(new Decimal(0.0005).times(player.met11.points)).min(100)
    },
    onPrestige(){
        player.met11.gauge = new Decimal(0)
    },
    /*bars: {
		lichen: {
			direction: RIGHT,
			height: 50,
			width: 400,
			progress() {
				return player.met11.gauge.div(100)
			},
			fillStyle: {
				"background-color":"#9BC2B1",
			},
            borderStyle:{
                "border":"5px solid",
                "border-color":"#b87333",
            }
		}
	},
    upgrades:{
        11:{
            title:"Simple Copper Ore",
            description:"Your Stone materials gain is multiplied based on Copper",
            cost: new Decimal(10),
            tooltip:"A pebble that's harder than any other pebbles!",
        },
        12:{
            title:"Simple Copper Ore",
            description:"Your Stone materials gain is multiplied based on Copper",
            cost: new Decimal(10),
            tooltip:"A pebble that's harder than any other pebbles!",
        },
    },*/
    tabFormat:[
        "main-display", "resource-display", "prestige-button","blank", ["display-text", function(){
            return "You have "+formatWhole(player.s.PickPow)+" Pickaxe Power<br><br>Need at least 14 Pickaxe Power to mine Copper<br><br><br><h3>Warning! Prestiging now for 1st time will give you achievement, but it will reset most of the stuff </h3>"
        }], "blank","upgrades" , "blank",["bar","lichen"],"blank"/*, ["display-text", function(){
            return "Your Lichen Gauge "+format(player.met11.gauge)+"/100"
        }]*/
    ]
})

/*addLayer("met12",{
    name: "",
    symbol:"<img src='js/Tree1/MetalMaster.png' style='width:calc(80% - 2px);height:calc(80% - 2px);margin:10%'></img>",
    position: 0,
    increaseUnlockOrder:["met13"],
    startData(){return{
        unlocked: false,
        points: new Decimal(0),
        unlockOrder: 1,
    }},
    requires() {return new Decimal(1e22).times(new Decimal(1e10).pow(player.met12.unlockOrder))},
    resource: "Tin",
    baseResource: "Knowledge",
    baseAmount() {return player.points},
    type: "normal",
    exponent: 0.5,
    branches: ['s'],
    gainMult() {
        let mult = new Decimal(1)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 3,
    color: "#7F743F",
    layerShown(){
        if((hasChallenge('st',22)||player.met11.points>0)&&player.switch.treeSelect==2) return true
    },
})

addLayer("met13",{
    name: "",
    symbol:"<img src='js/Tree1/MetalMaster.png' style='width:calc(80% - 2px);height:calc(80% - 2px);margin:10%'></img>",
    position: 2,
    increaseUnlockOrder:["met12"],
    startData(){return{
        unlocked: false,
        points: new Decimal(0),
        unlockOrder: 1,
    }},
    requires() {return new Decimal(1e22).times(new Decimal(1e10).pow(player.met13.unlockOrder))},
    resource: "Iron",
    baseResource: "Knowledge",
    baseAmount() {return player.points},
    type: "normal",
    exponent: 0.5,
    branches: ['s'],
    gainMult() {
        let mult = new Decimal(1)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 3,
    color: "#a0a0a0",
    layerShown(){
        if((hasChallenge('st',22)||player.met11.points>0)&&player.switch.treeSelect==2) return true
    },
})

addLayer("met21",{
    name: "",
    symbol:"<img src='js/Tree1/MetalMaster.png' style='width:calc(80% - 2px);height:calc(80% - 2px);margin:10%'></img>",
    position: 1,
    startData(){return{
        unlocked: true,
        points: new Decimal(0),
    }},
    requires: new Decimal(20),
    resource: "Gold",
    baseResource: "Knowledge",
    baseAmount() {return player.points},
    type: "normal",
    exponent: 0.5,
    branches: ['s'],
    gainMult() {
        let mult = new Decimal(1)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 4,
    color: "#d4af37",
    layerShown(){
        if((hasChallenge('st',22)||player.met11.points>0)&&player.switch.treeSelect==2) return true
    },
})

addLayer("met22",{
    name: "",
    symbol:"<img src='js/Tree1/MetalMaster.png' style='width:calc(80% - 2px);height:calc(80% - 2px);margin:10%'></img>",
    position: 0,
    startData(){return{
        unlocked: true,
        points: new Decimal(0),
    }},
    requires: new Decimal(20),
    resource: "Silver",
    baseResource: "Knowledge",
    baseAmount() {return player.points},
    type: "normal",
    exponent: 0.5,
    branches: ['s'],
    gainMult() {
        let mult = new Decimal(1)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 4,
    color: "#c0c0c0",
    layerShown(){
        if((hasChallenge('st',22)||player.met11.points>0)&&player.switch.treeSelect==2) return true
    },
})

addLayer("met23",{
    name: "",
    symbol:"<img src='js/Tree1/MetalMaster.png' style='width:calc(80% - 2px);height:calc(80% - 2px);margin:10%'></img>",
    position: 2,
    startData(){return{
        unlocked: true,
        points: new Decimal(0),
    }},
    requires: new Decimal(20),
    resource: "Platinum",
    baseResource: "Knowledge",
    baseAmount() {return player.points},
    type: "normal",
    exponent: 0.5,
    branches: ['s'],
    gainMult() {
        let mult = new Decimal(1)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 4,
    color: "#ADD9DB",
    layerShown(){
        if((hasChallenge('st',22)||player.met11.points>0)&&player.switch.treeSelect==2) return true
    },
})

addLayer("sili",{
    name: "",
    symbol:"<img src='js/Tree1/MetalMaster.png' style='width:calc(80% - 2px);height:calc(80% - 2px);margin:10%'></img>",
    position: 2,
    startData(){return{
        unlocked: true,
        points: new Decimal(0),
    }},
    requires: new Decimal(20),
    resource: "Silicon",
    baseResource: "Knowledge",
    baseAmount() {return player.points},
    type: "normal",
    exponent: 0.5,
    branches: ['s'],
    gainMult() {
        let mult = new Decimal(1)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 3,
    color: "#303030",
    layerShown(){
        if((hasChallenge('st',22)||player.met11.points>0)&&player.switch.treeSelect==2) return true
    },
})*/

addLayer("auto",{
    name: "",
    symbol:"<img src='js/Lab1.png' style='width:calc(80% - 2px);height:calc(80% - 2px);margin:10%'></img>",
    position: 2,
    startData(){return{
        unlocked: false,
        points: new Decimal(0),
    }},
    requires: new Decimal(1e300),
    resource: "",
    baseResource: "Knowledge",
    baseAmount() {return player.points},
    type: "normal",
    exponent: 0.5,
    branches: ['s'],
    gainMult() {
        let mult = new Decimal(1)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 0,
    color: "#ffd0a0",
    canClick(){
        return false
    },
    tooltip:"Automatic Production Laboratory",
    layerShown(){
        if(hasChallenge('st',22)||player.met11.points>0) return true
    },
    prestigeNotify(){
        return false
    },
    tabFormat:[]
})

addLayer("switch",{
    name: "",
    symbol:"<img src='js/Lab1.png' style='width:calc(80% - 2px);height:calc(80% - 2px);margin:10%'></img>",
    position: 0,
    startData(){return{
        unlocked: true,
        points: new Decimal(0),
        treeSelect: 1,
        treeMax: 1,
    }},
    requires: new Decimal(20),
    resource: "",
    baseResource: "Knowledge",
    baseAmount() {return player.points},
    type: "normal",
    exponent: 0.5,
    branches: ['s'],
    gainMult() {
        let mult = new Decimal(1)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    update(diff){
        if(player.met11.total>0) player.switch.treeMax = 2
    },
    prestigeNotify(){
        return false
    },
    row: 0,
    color: "#ffd0a0",
    tooltip:"Switch of Scientific Trees",
    clickables:{
        11:{
            title:"Botany and Biology Research Tree",
            display(){ return "<h2>This tree Contains: </h2><br><img src='js/Bamboo.png' style='width:32px;height:32px;margin:0%'></img><img src='js/Mush.png' style='width:32px;height:32px;margin:0%'></img><img src='js/Wood.png' style='width:32px;height:32px;margin:0%'></img><img src='js/Crops.png' style='width:32px;height:32px;margin:0%'></img><img src='js/Meat.png' style='width:32px;height:32px;margin:0%'></img><img src='js/Stone.png' style='width:32px;height:32px;margin:0%'></img>\n\
            Click to switch to This tree"},
            style(){
                const style = {"width": "400px"}
                return style
            },
            canClick(){
                if(player.switch.treeSelect==1) return false
                return true
            },
            onClick(){
                player.switch.treeSelect = 1
            },
            unlocked: true,
        },
        12:{
            title:"Metallurgy Research Tree",
            display(){ return "<h2>This tree Contains: Copper\n\
            Click to switch to This tree"},
            style(){
                const style = {"width": "400px"}
                return style
            },
            canClick(){
                if(player.switch.treeSelect==2) return false
                return true
            },
            onClick(){
                player.switch.treeSelect = 2
            },
            unlocked(){
                if(player.switch.treeMax>=2||hasChallenge('st',22)) return true
                return false
            },
        },
    },
    tabFormat:[
        "clickables"
    ],
    layerShown(){
        if(hasChallenge('st',22)||player.met11.points>0) return true
    },
})