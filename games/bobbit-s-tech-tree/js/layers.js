//top = 108
//upgRowHeight = 160
//(row-1)*upgRowHeight+top

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }

  function hints() {
    if (player.unlockedIds.includes(507) && player.showHub == false) {
        player.makeBlue.push(507)
        player.makeBlue.push(101)
    }
    else {
    for (var item of player.Alchemy.combinations) {
        flag = true
        
        if (!player.unlockedIds.includes(player.Alchemy.layerIds[item[0]]))
            
        {
        for (var thingy of item[1]) {
            temp =getKeyByValue(player.Alchemy.idsToLayers,thingy)
            temp = Number(temp)
            if (!(player.unlockedIds.includes(temp))&& thingy != "null") {
                
                
                flag = false
            } }
            
        }
        else {
            flag = false
        }
        if (flag == true) {
            
            for (var thingy of item[1]) {
                if (thingy != "null" || undefined) {
                player.makeBlue.push(Number(getKeyByValue(player.Alchemy.idsToLayers,thingy)))
                
            }}}}
        }}
addNode("C", {
    symbol: "Core",
    canClick() { return true},
    row: 0,
    
    onClick() {player.col = "green",
    player.showAlchemy = true,
    player.showPS = true,
    
    player.unlockedIds.push(player.Alchemy.layerIds["PS"]),
    player.unlockedElems.push("Primordial_soup")
    },
    tooltip() {return "The start of everything"},
    color() {return player.col},
	layerShown() {return player.showCore}
    
})

addNode("PS", {
    symbol: "Primordial soup",
    canClick() {return true},
    row: 1,
    onClick() {return ""},
    tooltip() {return "Life begins"},
    nodeStyle:  {
        "font-size": "20px",
    },
    branches: ["C"],
    layerShown() {return player.showPS && player.lifeShow}
})

addLayer("Alchemy2", {
    symbol: "A",
    row: "side",
    name: "Alchemy",
    resource: "",
    layerShown() {return player.showAlchemy &&player.hubWorld},
    tooltip() {return "Find new nodes"},
    color: "orange",
    
    grid: {
        rows: 10,
        cols: 10,
        getStartData(id) {
            return id
        },
        onClick(data, id) { 
            if (player.Alchemy2.clicked ==id) {
                player.Alchemy2.clicked =0
            }
            else if (player.Alchemy2.clicked2 == id) {
                player.Alchemy2.clicked2 =0
            }
            else if (player.Alchemy2.clicked3 == id) {
                player.Alchemy2.clicked3 = 0
            }
            else if (player.Alchemy2.clicked4 == id) {
                player.Alchemy2.clicked4 = 0
            }
            else if (player.Alchemy2.clicked5 == id) {
                player.Alchemy2.clicked5 = 0
            }
            else {
                player.Alchemy2.clicked5=player.Alchemy2.clicked4
                player.Alchemy2.clicked4 = player.Alchemy2.clicked3
                player.Alchemy2.clicked3 = player.Alchemy2.clicked2
                player.Alchemy2.clicked2 = player.Alchemy2.clicked
            player.Alchemy2.clicked = id
        }},
        getDisplay(data, id) {
            ""
             
        },
        getTitle(data, id) {
            let title =  player.Alchemy2.idsToLayers[id]
            while (title.indexOf("_") != -1) {
				title = title.replace("_"," ")
			}
            return title
        },
        getUnlocked(id) {
            if (player.unlockedIds.includes(id)) {
                return id
            }
        },
        getStyle(data,id) {
            if (id == player.Alchemy2.clicked || id ==player.Alchemy2.clicked2 || id == player.Alchemy2.clicked3 || id == player.Alchemy2.clicked4 || id == player.Alchemy2.clicked5) {
                return{
                "background-color":"green",
				"font-size":"8px"
				
        }}
        
        else if (player.makeBlue.includes(id)) {
            
            return {
                "background-color":"blue",
				"font-size":"8px"
        }
        }
    else {
       
        return {
            "background-color":"red",
			"font-size":"8px"
        }}
    }
    },
    clickables: {
        11: {
            title: "Merge",
            display() {return ""},
            canClick() {return true},
            style()
            {return {
            "background-color": "yellow"}},

        
        onClick() {
            elem1 = player.Alchemy2.idsToLayers[player.Alchemy2.clicked]
            elem2 = player.Alchemy2.idsToLayers[player.Alchemy2.clicked2]
            elem3 = player.Alchemy2.idsToLayers[player.Alchemy2.clicked3]
            elem4 = player.Alchemy2.idsToLayers[player.Alchemy2.clicked4]
            elem5 = player.Alchemy2.idsToLayers[player.Alchemy2.clicked5]
            var elems = 0
            if (elem1 != "null") {
                elems += 1
            }
            if (elem2 != "null") {
                elems += 1 
            }
            if (elem3 != "null") {
                elems +=1
            }
            if (elem4 != "null") {
                elems += 1
            }
            if (elem5 != "null") {
                elems += 1
            }
            
            for (var item of player.Alchemy2.combinations) {
                
                
                if (item[1].includes(elem1) && item[1].includes(elem2) && item[1].length-1 == elems && item[1].includes(elem3) && item[1].includes(elem4) && item[1].includes(elem5)) {
                    player.unlocks[item[0]] = true
                    player.unlockedIds.push(player.Alchemy2.layerIds[item[0]])
                    
                }
            }
		let humanReq = ["Alchemy","Human","null"]
		
        
        if (humanReq.includes(elem1) && humanReq.includes(elem2) && humanReq.length-1 == elems && humanReq.includes(elem3) && humanReq.includes(elem4) && humanReq.includes(elem5)) {
            player.humanUnlock = true
        }
		
		}},
        12: {
            title: "hint mode",
            display() {return "activated: " + player.hintMode},
            canClick() {return true},
            style()
            {return {
            "background-color": "yellow"}},
            onClick() {
                player.hintMode = !player.hintMode
                
                if (player.hintMode == true) {
                if (player.humanUnlock==false) {
					player.makeBlue.push(210)
					player.makeBlue.push(301)
				}}
                    else {
                        player.makeBlue = []

                    }
                }},
        13: {
            title: "Answer",
            display() {return ""},
            canClick() {return true},
            style()
            {return {
            "background-color": "yellow"}},
            onClick() {
				if (player.humanUnlock==false)
                {window.alert("Human + alchemy = ?")}
                
                    

                }
            }

        },

            
        
    infoboxes: {
        intro: {
            title: "Hub world",
            body() {return "Welcome to the hub world! Here you combine elements to unlock entire branches of the tree! Many elements have been removed to make things simpler."}
        },
		
		
    },
    startData() { return {
        
        combinations: [[["L"],["Primordial_soup", "Core","null"]],[["Aa"],["Primordial_soup","null"]],[["N"],["Amino_acids", "Primordial_soup","null"]],[["Dna"],["Life","Primordial_soup","null"]],[["PC"],["DNA","Amino_acids","null"]], [['Nu'],['Prokaryotic_cells','DNA','null']], [['EC'],['Amino_acids','Prokaryotic_cells','Nucleus','null']], [['O'],['Eukaryotic_cells','null']], [['T'],['Eukaryotic_cells','Organisation','null']], [['Cy'],['Nutrients','Prokaryotic_cells','Organisation','null']], [['M'],['Nutrients','Cytoplasm','null']], [['BFS'],['Membrane','Tissue','null']], [['FF'],['Nutrients','Biological_Filtration_System','null']], [['S'],['Tissue','Organisation','Filtration_feeding','null']], [['Co'],['Organisation','Sponge','null']], [['BC'],['Nutrients','Organisation','null']], [['Tx'],['Biological_chemical','Coral','null']], [['Jf'],['Toxin','Coral','null']], [['Sw'],['Nutrients','Jellyfish','null']], [['F'],['Organisation','Swimming','null']], [['Air'],['Life','Biological_chemical','null']], [['Lu'],['Organisation','Biological_chemical','Fish','Air','null']], [['Am'],['Lungs','Fish','null']], [['Ogn'],['Biological_chemical','Organisation','Tissue','null']], [['Bl'],['Biological_chemical','Amphibian','null']], [['OS'],['Organisation','Blood','Organs','null']], [['CS'],['Lungs','Blood','Organ_system','null']], [['Mu'],['Organisation','Tissue','Circulatory_system','null']], [['R'],['Nutrients','Biological_chemical','Muscles','null']], [['NS'],['Organ_system','Receptor','null']], [['Br'],['Amphibian','Organs','Circulatory_system','Nervous_system','null']], [['Mlk'],['Nutrients','Blood','null']], [['MG'],['Milk','Organs','null']], [['Ma'],['Organisation','Amphibian','Blood','Mammary_glands','null']], [['P'],['Nutrients','Amphibian','null']], [['W'],['Primordial_soup','Air','null']], [['Ms'],['Nutrients','Plants','Water','null']], [['Gr'],['Organisation','Plants','Moss','null']], [['VP'],['Nutrients','Organisation','Grass','null']], [['Tr'],['Vascular_plants','null']], [['Pr'],['Trees','Mammal','null']], [['Arm'],['Nutrients','Primates','Muscles','null']], [['Ha'],['Arm','null']], [['Hu'],['Hands','Primates','Brain','null']]],
        specialCombos: [[["Hub"],["Alchemy","Core","null"]]],
        layerIds: {"C": 101,"L": 102,"Aa": 103,"N":104,"Dna":105,"PC":106,'EC':107,'O':108,'F':109,'Air':110,'Am':201,'Ogn':202,'Bl':203,'OS':204,'Br':205,'Ma':206,'P':207,'W':208,'Pr':209,'Hu':210
    },
        
        clicked: 0,
        clicked2: 0,
        clicked3: 0,
		

        clicked4: 0,
        clicked5: 0,
        idsToLayers: {0: "null",101: "Core",102: "Life",103: "Amino_acids",104: "Nutrients",105: "DNA",106: "Prokaryotic_cells",107:'Eukaryotic_cells',108:'Organisation',109:'Fish',110:'Air',201:'Amphibian',202:'Organs',203:'Blood',204:'Organ_system',205:'Brain',206:'Mammal',207:'Plants',208:'Water',209:'Primates',210:'Human',301:"Alchemy"
    },
        
    }},
    tabFormat: {
        "info": {
			content: [
				["infobox", "intro"],
				["infobox","completion"],
			]},
        "main": {
			content: ["grid",
        "clickables"]}
}
}),
addNode("L", {
    symbol: "life",
    canClick() {return true},
    row: 1,
    tooltip() {return "Chemicals turn into life"},
    branches: ["C"],
    layerShown() {return (player.unlocks["L"] && player.lifeShow)} 
})

addNode("Aa", {
    symbol: "Amino acids",
    canClick() {return true},
    row: 2,
    position: 2,
    tooltip() {return "The building blocks of life"},
    branches: ["PS"],
    layerShown() {return player.unlocks["Aa"] && player.lifeShow} 
})
addNode("N", {
    symbol: "Nutrients",
    canClick() {return true},
    row: 3,
    position: 2,
    tooltip() {return "To power life, chemicals come together."},
    branches: ["Aa"],
    layerShown() {return player.unlocks["N"] && player.lifeShow} ,
    nodeStyle:  {
        "font-size": "20px",
    }
})
addNode("Dna", {
    symbol: "DNA",
    canClick() {return true},
    row: 2,
    position: 1,
    tooltip() {return "What makes life unique"},
    branches: ["PS","L"],
    layerShown() {return player.unlocks["Dna"] && player.lifeShow} 
})
addNode("PC", {
    symbol: "Prokaryotic cells",
    canClick() {return true},
    row: 3,
    position: 1,
    tooltip() {return "Cells begin to take shape"},
    branches: ["Dna","Aa"],
    layerShown() {return player.unlocks["PC"] && player.lifeShow},
    nodeStyle:  {
        "font-size": "20px",
    } 
}),
addNode('Nu', {
	symbol: 'Nucleus',
	canClick() {return true},
	row: 4,
	tooltip() {return 'Organisation begins in cells'},
	branches: ['PC'],
	layerShown() {return player.unlocks['Nu'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('EC', {
	symbol: 'Eukaryotic cells',
	canClick() {return true},
	row: 5,
	tooltip() {return 'Cells begin to develop'},
	branches: ['Nu'],
	layerShown() {return player.unlocks['EC'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('O', {
	symbol: 'Organisation',
	canClick() {return true},
	row: 6,
	tooltip() {return 'Cells begin to come together to build something more'},
	branches: ['EC'],
	layerShown() {return player.unlocks['O'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('T', {
	symbol: 'Tissue',
	canClick() {return true},
	row: 7,
    position: 3,
	tooltip() {return 'A larger structure is formed out of cells'},
	branches: ['O'],
	layerShown() {return player.unlocks['T'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('Cy', {
	symbol: 'Cytoplasm',
	canClick() {return true},
	row: 7,
    position: 1,
	tooltip() {return 'Once simple cells are now beginning to become quite complex'},
	branches: ['O'],
	layerShown() {return player.unlocks['Cy'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('M', {
	symbol: 'Membrane',
	canClick() {return true},
	row: 8,
    position: 1,
	tooltip() {return 'Cells are beginning to control the substances around them'},
	branches: ['Cy'],
	layerShown() {return player.unlocks['M'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('BFS', {
	symbol: 'Biological Filtration System',
	canClick() {return true},
	row: 9,
	tooltip() {return 'In order to make more complicated life forms, life must master the transportation of substances'},
	branches: ['M'],
	layerShown() {return player.unlocks['BFS'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('FF', {
	symbol: 'Filtration feeding',
	canClick() {return true},
	row: 10,
	tooltip() {return 'More energy is required. Therefore, new ways need to be designed to maximise the energy received.'},
	branches: ['BFS'],
	layerShown() {return player.unlocks['FF'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('S', {
	symbol: 'Sponge',
	canClick() {return true},
	row: 11,
	tooltip() {return 'Complex multicellular organisms can now be formed. '},
	branches: ['FF'],
	layerShown() {return player.unlocks['S'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('Co', {
	symbol: 'Coral',
	canClick() {return true},
	row: 12,
	tooltip() {return 'The evolution of multicellular organisms begins'},
	branches: ['S'],
	layerShown() {return player.unlocks['Co'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('BC', {
	symbol: 'Biological chemical',
	canClick() {return true},
	row: 7,
    position: 2,
	tooltip() {return 'Life is beginning to generate its own materials'},
	branches: ['O'],
	layerShown() {return player.unlocks['BC'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('Tx', {
	symbol: 'Toxin',
	canClick() {return true},
	row: 13,
	tooltip() {return 'Life is learning to defend itself'},
	branches: ['Co'],
	layerShown() {return player.unlocks['Tx'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('Jf', {
	symbol: 'Jellyfish',
	canClick() {return true},
	row: 14,
	tooltip() {return 'Animals are now beginning to emerge'},
	branches: ['Tx'],
	layerShown() {return player.unlocks['Jf'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('Sw', {
	symbol: 'Swimming',
	canClick() {return true},
	row: 15,
	tooltip() {return 'Life is now traversing all through the ocean'},
	branches: ['Jf'],
	layerShown() {return player.unlocks['Sw'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('F', {
	symbol: 'Fish',
	canClick() {return true},
	row: 16,
	tooltip() {return 'The oceans has now exploded with a variety of different life!'},
	branches: ['Sw'],
	layerShown() {return player.unlocks['F'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('Air', {
	symbol: 'Air',
	canClick() {return true},
	row: 8,
    position: 2,
	tooltip() {return 'Life is now beginning to slowly influence the atmosphere'},
	branches: ['BC'],
	layerShown() {return player.unlocks['Air'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('Lu', {
	symbol: 'Lungs',
	canClick() {return true},
	row: 17,
	tooltip() {return 'From gills to lungs, the land is in sight'},
	branches: ['F'],
	layerShown() {return player.unlocks['Lu'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('Am', {
	symbol: 'Amphibian',
	canClick() {return true},
	row: 18,
	tooltip() {return 'Animals emerge onto land'},
	branches: ['Lu'],
	layerShown() {return player.unlocks['Am'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('Ogn', {
	symbol: 'Organs',
	canClick() {return true},
	row: 8,
    position: 3,
	tooltip() {return 'From cell to tissue to organ. Life is growing increasingly complex.'},
	branches: ['T', 'BC'],
	layerShown() {return player.unlocks['Ogn'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('Bl', {
	symbol: 'Blood',
	canClick() {return true},
	row: 19,
	tooltip() {return 'Specialised liquids are now being made within the human body'},
	branches: ['Am'],
	layerShown() {return player.unlocks['Bl'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('OS', {
	symbol: 'Organ system',
    position: 2,
	canClick() {return true},
	row: 20,
	tooltip() {return 'One organ simply is not enough to control an entire general role of an organism. More organisation is required'},
	branches: ['Bl'],
	layerShown() {return player.unlocks['OS'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('CS', {
	symbol: 'Circulatory system',
	canClick() {return true},
	row: 21,
    position: 2,
	tooltip() {return 'To transport the necessary nutrients, vast structures are required'},
	branches: ['OS'],
	layerShown() {return player.unlocks['CS'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('Mu', {
	symbol: 'Muscles',
	canClick() {return true},
	row: 22,
	tooltip() {return 'In order for life to move, many nutrients need to be transported'},
	branches: ['CS'],
	layerShown() {return player.unlocks['Mu'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('R', {
	symbol: 'Receptor',
	canClick() {return true},
	row: 23,
	tooltip() {return 'Life now needs to learn to react to its environment'},
	branches: ['Mu'],
	layerShown() {return player.unlocks['R'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('NS', {
	symbol: 'Nervous system',
	canClick() {return true},
	row: 24,
	tooltip() {return 'Organisms are now fully responsive to its environment. Next sentience?'},
	branches: ['R'],
	layerShown() {return player.unlocks['NS'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('Br', {
	symbol: 'Brain',
    position: 1,
	canClick() {return true},
	row: 25,
	tooltip() {return 'Thoughts, all though primitive, are emerging'},
	branches: ['NS'],
	layerShown() {return player.unlocks['Br'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('Mlk', {
	symbol: 'Milk',
    position: 1,
	canClick() {return true},
	row: 20,
	tooltip() {return 'Organisms can now produce substances to feed their young'},
	branches: ['Bl'],
	layerShown() {return player.unlocks['Mlk'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('MG', {
	symbol: 'Mammary glands',
    position: 1,
	canClick() {return true},
	row: 21,
	tooltip() {return 'Yes, THAT body part'},
	branches: ['Mlk'],
	layerShown() {return player.unlocks['MG'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('Ma', {
	symbol: 'Mammal',
	canClick() {return true},
	row: 22,
	tooltip() {return 'Life is climbing up the ladder of scentience'},
	branches: ['MG'],
	layerShown() {return player.unlocks['Ma'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('P', {
	symbol: 'Plants',
	canClick() {return true},
	row: 19,
	tooltip() {return 'Evolving alongside animals, plants progress'},
	branches: ['Am'],
	layerShown() {return player.unlocks['P'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('W', {
	symbol: 'Water',
	canClick() {return true},
	row: 9,
	tooltip() {return 'From being surrounded to it to having to seek it. Water is still essential.'},
	branches: ['Air'],
	layerShown() {return player.unlocks['W'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('Ms', {
	symbol: 'Moss',
    position: 3,
	canClick() {return true},
	row: 20,
	tooltip() {return 'Plants claim land'},
	branches: ['P'],
	layerShown() {return player.unlocks['Ms'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('Gr', {
	symbol: 'Grass',
	canClick() {return true},
	row: 21,
    position: 3,
	tooltip() {return 'Slowly but surely, plants advance upwards'},
	branches: ['Ms'],
	layerShown() {return player.unlocks['Gr'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('VP', {
	symbol: 'Vascular plants',
	canClick() {return true},
	row: 22,
	tooltip() {return 'Like animals, plants grows in complexity'},
	branches: ['Gr'],
	layerShown() {return player.unlocks['VP'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('Tr', {
	symbol: 'Trees',
	canClick() {return true},
	row: 23,
	tooltip() {return 'Plants are now towering above all other life forms.'},
	branches: ['VP'],
	layerShown() {return player.unlocks['Tr'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('Pr', {
	symbol: 'Primates',
	canClick() {return true},
	row: 24,
	tooltip() {return 'Life begins to close in on humanity'},
	branches: ['Tr'],
	layerShown() {return player.unlocks['Pr'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('Arm', {
	symbol: 'Arm',
    position: 2,
	canClick() {return true},
	row: 25,
	tooltip() {return 'Living in the trees causes limbs to develop'},
	branches: ['Pr'],
	layerShown() {return player.unlocks['Arm'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('Ha', {
	symbol: 'Hands',
	canClick() {return true},
	row: 26,
	tooltip() {return 'Nearly there...'},
	branches: ['Arm'],
	layerShown() {return player.unlocks['Ha'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',
	}
}),
addNode('Hu', {
	symbol: 'Human',
	canClick() {return true},
	row: 27,
	tooltip() {return 'The destination of life or just the beginning?'},
	branches: ['Ha'],
	layerShown() {return player.unlocks['Hu'] && player.lifeShow},
	nodeStyle: {
		'font-size': '20px',

	},
    color() {return player.huCol},
    onClick() {
        
        player.Alchemy.layerIds["Alc"] = 507
        player.Alchemy.idsToLayers[507] = "Alchemy"
        player.unlockedIds.push(507)
		player.huCol = "green"
        player.hintMode=false
    }
})
addNode("Hub", {
    row: "side",
    layerShown() {return player.showHub},
    symbol: "H",
    tooltip() {return "Enter the tech tree!"},
    onClick() {player.lifeShow = false
	player.hubWorld = true
player.showHumanity = false
player.tab = "none"
document.getElementById("treeTab").scrollTo(0,0)
player.showCore=true
player.hintMode=false
player.makeBlue = []},
    canClick() {return true}
}),

addNode("Life", {
	
	row: 1,
	layerShown() {return player.hubWorld},
	symbol: "Life to humans",
	onClick() {player.lifeShow = true
	player.hubWorld = false
    player.tab = "none"
    document.getElementById("treeTab").scrollTo(0,0)
    player.hintMode=false
    player.makeBlue = []},
	canClick() {return true},
	branches: ["C"],
	nodeStyle: {
		'font-size': '20px',
	},
	tooltip: ""
})

addNode("Humanity", {
	row: 2,
	layerShown() {return player.hubWorld&&player.humanUnlock},
	symbol: "Rise of humanity",
	onClick() {player.showHub = true
	player.hubWorld = false
player.showHumanity = true
player.tab = "none"
document.getElementById("treeTab").scrollTo(0,0)
player.showCore = false},
	branches: ["Life"],
	nodeStyle: {
		'font-size': '20px',
	},
	tooltip: "Humanity begins.",
	canClick: true,
	
})


addNode("Human", {
	row: 1,
	layerShown() {return player.showHumanity},
	symbol: "Human",
	tooltip: "Intelligent life has been created",
	onClick() {},
	branches: ["Life2"],
	canClick: true,
	nodeStyle: {
		'font-size': '20px',
	},
})

addNode("Life2", {
	
	row: 0,
	layerShown() {return player.showHumanity},
	symbol: "Life to humans",
	onClick() {player.lifeShow = true
	player.hubWorld = false
player.showHumanity = false
player.showCore=true
player.tab = "none"
document.getElementById("treeTab").scrollTo(0,0)},
	canClick() {return true},
	
	nodeStyle: {
		'font-size': '20px',
	},
	tooltip: ""
}),
addLayer("Alchemy", {
    symbol: "A",
    row: "side",
    name: "Alchemy",
    resource: "",
    layerShown() {return player.showAlchemy &&player.lifeShow},
    tooltip() {return "Find new nodes"},
    color: "yellow",
    
    grid: {
        rows: 10,
        cols: 10,
        getStartData(id) {
            return id
        },
        onClick(data, id) { 
            if (player.Alchemy.clicked ==id) {
                player.Alchemy.clicked =0
            }
            else if (player.Alchemy.clicked2 == id) {
                player.Alchemy.clicked2 =0
            }
            else if (player.Alchemy.clicked3 == id) {
                player.Alchemy.clicked3 = 0
            }
            else if (player.Alchemy.clicked4 == id) {
                player.Alchemy.clicked4 = 0
            }
            else if (player.Alchemy.clicked5 == id) {
                player.Alchemy.clicked5 = 0
            }
            else {
                player.Alchemy.clicked5=player.Alchemy.clicked4
                player.Alchemy.clicked4 = player.Alchemy.clicked3
                player.Alchemy.clicked3 = player.Alchemy.clicked2
                player.Alchemy.clicked2 = player.Alchemy.clicked
            player.Alchemy.clicked = id
        }},
        getDisplay(data, id) {
            ""
             
        },
        getTitle(data, id) {
            let title =  player.Alchemy.idsToLayers[id]
			
            while (title.indexOf("_") != -1) {
				title = title.replace("_"," ")
			}
            return title
        },
        getUnlocked(id) {
            if (player.unlockedIds.includes(id)) {
                return id
            }
        },
        getStyle(data,id) {
            if (id == player.Alchemy.clicked || id ==player.Alchemy.clicked2 || id == player.Alchemy.clicked3 || id == player.Alchemy.clicked4 || id == player.Alchemy.clicked5) {
                return{
                "background-color":"green",
				"font-size":"8px"
				
        }}
        
        else if (player.makeBlue.includes(id)) {
            
            return {
                "background-color":"blue",
				"font-size":"8px"
        }
        }
    else {
       
        return {
            "background-color":"red",
			"font-size":"8px"
        }}
    }
    },
    clickables: {
        11: {
            title: "Merge",
            display() {return ""},
            canClick() {return true},
            style()
            {return {
            "background-color": "yellow"}},

        
        onClick() {
            elem1 = player.Alchemy.idsToLayers[player.Alchemy.clicked]
            elem2 = player.Alchemy.idsToLayers[player.Alchemy.clicked2]
            elem3 = player.Alchemy.idsToLayers[player.Alchemy.clicked3]
            elem4 = player.Alchemy.idsToLayers[player.Alchemy.clicked4]
            elem5 = player.Alchemy.idsToLayers[player.Alchemy.clicked5]
            var elems = 0
            if (elem1 != "null") {
                elems += 1
            }
            if (elem2 != "null") {
                elems += 1 
            }
            if (elem3 != "null") {
                elems +=1
            }
            if (elem4 != "null") {
                elems += 1
            }
            if (elem5 != "null") {
                elems += 1
            }
            
            for (var item of player.Alchemy.combinations) {
                
                
                if (item[1].includes(elem1) && item[1].includes(elem2) && item[1].length-1 == elems && item[1].includes(elem3) && item[1].includes(elem4) && item[1].includes(elem5)) {
                    player.unlocks[item[0]] = true
                    player.unlockedIds.push(player.Alchemy.layerIds[item[0]])
                    player.Alchemy.clicked=0
                    player.Alchemy.clicked2=0
                    player.Alchemy.clicked3=0
                    player.Alchemy.clicked4=0
                    player.Alchemy.clicked5=0
                    player.makeBlue = []
                    if (player.hintMode) {hints()}
                }
            }
        for (var item of player.Alchemy.specialCombos) {
            if (item[1].includes(elem1) && item[1].includes(elem2) && item[1].length-1 == elems && item[1].includes(elem3) && item[1].includes(elem4) && item[1].includes(elem5)) {
                player.showHub = true
        }}
		
		}},
        12: {
            title: "hint mode",
            display() {return "activated: " + player.hintMode},
            canClick() {return true},
            style()
            {return {
            "background-color": "yellow"}},
            onClick() {
                player.hintMode = !player.hintMode
                
                if (player.hintMode == true) {
                    
                hints()}
                    else {
                        player.makeBlue = []

                    }
                }},
        13: {
            title: "Answer",
            display() {return ""},
            canClick() {return true},
            style()
            {return {
            "background-color": "yellow"}},
            onClick() {
				if (player.unlockedIds.includes(507)&&player.showHub==false) {
					alert("Core + Alchemy = ?")
				}
				else {
                for (let item in player.Alchemy.idsToLayers) {
                    item=Number(item)
                    
                    if (!player.unlockedIds.includes(item) && item != 0) {
                        temp = item
                        break
                    }
                }
                
                toFind = getKeyByValue(player.Alchemy.layerIds,temp)

                for (var item of player.Alchemy.combinations) {
                    if (item[0] == toFind) {
                    message = ""
                for (var text of item[1]) {
                    
                    if (text != "null") {
                        text=text.replaceAll("_"," ")
                        message = message + text + " + "
                    }}
                
				message = message.slice(0,-1)
                message = message + " = ?"
                alert(message)
                }}

                
                    

                }
            }

        }},

            
        
    infoboxes: {
        intro: {
            title: "Intro",
            body() {return "Welcome to Bobbit's tech tree! Select elements and merge to unlock more on the tree. As you progress, you will unlock more features! Activating hint mode will highlight elements that you can currently use in a combo, pressing answer will just tell you the combo. (intro tab will also update later...)"}
        },
		completion: {
			title: "Beyond life?",
			body() {return "Congrats, you have completed this tree! However, this is only the beginning. You may have noticed that human have turned orange. You can click any nodes which are orange. These can be clicked to give you a special element which you can use to unlock additional trees and features."},
			unlocked() {if (player.unlockedIds.includes(Number(506))) {
				return true}
				else {
					return false}
				}
		}
    },
    startData() { return {
        combinations: [[["L"],["Primordial_soup", "Core","null"]],[["Aa"],["Primordial_soup","null"]],[["N"],["Amino_acids", "Primordial_soup","null"]],[["Dna"],["Life","Primordial_soup","null"]],[["PC"],["DNA","Amino_acids","null"]], [['Nu'],['Prokaryotic_cells','DNA','null']], [['EC'],['Amino_acids','Prokaryotic_cells','Nucleus','null']], [['O'],['Eukaryotic_cells','null']], [['T'],['Eukaryotic_cells','Organisation','null']], [['Cy'],['Nutrients','Prokaryotic_cells','Organisation','null']], [['M'],['Nutrients','Cytoplasm','null']], [['BFS'],['Membrane','Tissue','null']], [['FF'],['Nutrients','Biological_Filtration_System','null']], [['S'],['Tissue','Organisation','Filtration_feeding','null']], [['Co'],['Organisation','Sponge','null']], [['BC'],['Nutrients','Organisation','null']], [['Tx'],['Biological_chemical','Coral','null']], [['Jf'],['Toxin','Coral','null']], [['Sw'],['Nutrients','Jellyfish','null']], [['F'],['Organisation','Swimming','null']], [['Air'],['Life','Biological_chemical','null']], [['Lu'],['Organisation','Biological_chemical','Fish','Air','null']], [['Am'],['Lungs','Fish','null']], [['Ogn'],['Biological_chemical','Organisation','Tissue','null']], [['Bl'],['Biological_chemical','Amphibian','null']], [['OS'],['Organisation','Blood','Organs','null']], [['CS'],['Lungs','Blood','Organ_system','null']], [['Mu'],['Organisation','Tissue','Circulatory_system','null']], [['R'],['Nutrients','Biological_chemical','Muscles','null']], [['NS'],['Organ_system','Receptor','null']], [['Br'],['Amphibian','Organs','Circulatory_system','Nervous_system','null']], [['Mlk'],['Nutrients','Blood','null']], [['MG'],['Milk','Organs','null']], [['Ma'],['Organisation','Amphibian','Blood','Mammary_glands','null']], [['P'],['Nutrients','Amphibian','null']], [['W'],['Primordial_soup','Air','null']], [['Ms'],['Nutrients','Plants','Water','null']], [['Gr'],['Organisation','Plants','Moss','null']], [['VP'],['Nutrients','Organisation','Grass','null']], [['Tr'],['Vascular_plants','null']], [['Pr'],['Trees','Mammal','null']], [['Arm'],['Nutrients','Primates','Muscles','null']], [['Ha'],['Arm','null']], [['Hu'],['Hands','Primates','Brain','null']]],
        specialCombos: [[["Hub"],["Alchemy","Core","null"]]],
        layerIds: {"C": 101,"PS": 102,"L": 103,"Aa": 104,"N":105,"Dna":106,"PC":107,'Nu':108,'EC':109,'O':110,'T':201,'Cy':202,'M':203,'BFS':204,'FF':205,'S':206,'Co':207,'BC':208,'Tx':209,'Jf':210,'Sw':301,'F':302,'Air':303,'Lu':304,'Am':305,'Ogn':306,'Bl':307,'OS':308,'CS':309,'Mu':310,'R':401,'NS':402,'Br':403,'Mlk':404,'MG':405,'Ma':406,'P':407,'W':408,'Ms':409,'Gr':410,'VP':501,'Tr':502,'Pr':503,'Arm':504,'Ha':505,'Hu':506
    },
        
        clicked: 0,
        clicked2: 0,
        clicked3: 0,


        clicked4: 0,
        clicked5: 0,
        idsToLayers: {0: "null",101: "Core",102: "Primordial_soup",103: "Life",104: "Amino_acids",105: "Nutrients",106: "DNA",107: "Prokaryotic_cells",108:'Nucleus',109:'Eukaryotic_cells',110:'Organisation',201:'Tissue',202:'Cytoplasm',203:'Membrane',204:'Biological_Filtration_System',205:'Filtration_feeding',206:'Sponge',207:'Coral',208:'Biological_chemical',209:'Toxin',210:'Jellyfish',301:'Swimming',302:'Fish',303:'Air',304:'Lungs',305:'Amphibian',306:'Organs',307:'Blood',308:'Organ_system',309:'Circulatory_system',310:'Muscles',401:'Receptor',402:'Nervous_system',403:'Brain',404:'Milk',405:'Mammary_glands',406:'Mammal',407:'Plants',408:'Water',409:'Moss',410:'Grass',501:'Vascular_plants',502:'Trees',503:'Primates',504:'Arm',505:'Hands',506:'Human'
    },
        
    }},
    tabFormat: {
        "info": {
			content: [
				["infobox", "intro"],
				["infobox","completion"],
			]},
        "main": {
			content: ["grid",
        "clickables"]}
}
})

addNode("HuExp", {
    row: 2,
	layerShown() {if (player.discoveries >= 2&&player.showHumanity==true) {
        return true}
        else {return false}
    },
	symbol: "Human exploration",
	tooltip: "Humanity begins to explore its surroundings",
	onClick() {},
	branches: ["Human"],
	canClick: true,
	nodeStyle: {
		'font-size': '18px',
	},
})

addNode("Sett", {
    row: 3,
    position: 1,
	layerShown() {if (player.discoveries >= 3&&player.showHumanity==true) {
        return true}
        else {return false}
    },
	symbol: "Settlement",
	tooltip: "A resemblance of civilisation now begins.",
	onClick() {},
	branches: ["HuExp"],
	canClick: true,
	nodeStyle: {
		'font-size': '18px',
	},
})

addNode("Idea", {
    row: 2,
	layerShown() {if (player.discoveries >= 1&&player.showHumanity==true) {
        return true}
        else {return false}
    },
	symbol: "Idea",
	tooltip: "Millions of years of evolution finally paid off - life becomes sapient",
	onClick() {},
	branches: ["Human"],
	canClick: true,
	nodeStyle: {
		'font-size': '18px',
	},
})

addNode("Phil", {
    row: 3,
    position: 2,
	layerShown() {if (player.discoveries >= 4&&player.showHumanity==true) {
        return true}
        else {return false}
    },
	symbol: "Philosophy",
	tooltip: "Now that life can think, it begins to question its origins.",
	onClick() {},
	branches: ["Idea"],
	canClick: true,
	nodeStyle: {
		'font-size': '18px',
	},
})
addNode("Prod1", {
    position: 1,
    row: 4,
	layerShown() {if (player.discoveries >= 5&&player.showHumanity==true) {
        
        return true}
        else {return false}
    },
	symbol: "Basic production",
	tooltip: "Like all life forms, humans begin to forage for supplies.",
	onClick() {},
	branches: ["Sett"],
	canClick: true,
	nodeStyle: {
		'font-size': '18px',
	},
})

addNode("Count", {
    row: 5,
    position: 2,
	layerShown() {if (player.discoveries >= 6&&player.showHumanity==true) {
        if (player.lockDiscoveries == false&&player.discoveries==6) {
            player.lockDiscoveries = true
        }
        return true}
        else {return false}
    },
	symbol: "Counting",
	tooltip: "Humans begin to associate symbols with amounts. ",
    tooltipLocked: "Requires many wood, many stone and many primitive food",
	onClick() {},
	branches: ["Prod1"],
	canClick() {
        
        if (player.counting == false && (player.Wood.wood < 2 ||player.rawmin.stone < 2 || player.Food.primFood < 2)) {
            
        
        
        return false}
        else {
            if (player.counting == false){
            player.counting=true
            player.rawmin.stone -=2
            player.Wood.wood -= 2
            player.Food.primFood -=2}
            else {
            if (player.discoveries==6){
                
                player.lockDiscoveries=false}
                return true}
    
    }},
	nodeStyle: {
		'font-size': '18px',
	},
})

addLayer("Wood", {
    row: 4,
    position: 4,
    layerShown() {if (player.discoveries >= 5 &&player.showHumanity==true)
        return true
        else {
            return false
        }
    },
    
    color: "brown",
    startData() {return { 
    wood: 0,
    woodGain: 1,
    stoneT: false,
    auto: false,
    planks: 0}},
    tooltip: "",
    effect() {if (player.Wood.auto&&player.tab =="Wood") {
        player.Wood.wood +=(player.Wood.woodGain / 20)
    }},
    clickables: {
        11: {
            title: "Gather",
            unlocked() {return !player.Wood.auto},
            display: "",
            canClick: true,
            onClick() {player.Wood.wood += player.Wood.woodGain},
            style()
            {return {
            "background-color": "yellow"}},
},
        12: {
            title: "Craft planks",
            unlocked() {return player.bronze},
            display: "Requires 100 wood",
            canClick() {if (player.Wood.wood >= 100) {return true}
        else {return false}},
            onClick() {player.Wood.planks += 1
            player.Wood.wood -= 100},
            style()
            {return {
            "background-color": "yellow"}},

        }},
milestones: {
    0: {
        requirementDescription: "Primitive axe (doubles wood production)",
        effectDescription: "Requires 20 wood and 20 stone",
        done() {if (player.Wood.wood >= 20 && player.rawmin.stone >= 20 && player.upgrade2) {
            return true}
        else {
            return false
        }
        },
        onComplete() {player.Wood.woodGain = 2
        player.Wood.wood -= 20
    player.rawmin.stone -= 20}
    },
    1: {
        requirementDescription: "Stone axe (Incraces production of wood to 5",
        effectDescription: "Requires 30 wood and 50 stone",
        done() {if (player.Wood.wood >= 30 && player.rawmin.stone >= 50 && player.Wood.woodGain ==2) {
            return true
        }else{return false}},
        onComplete() {player.Wood.woodGain = 5
            player.Wood.wood -= 30
            player.rawmin.stone -= 50
            player.Wood.stoneT = true}
},
2: {
    requirementDescription: "Bronze axe (Doubles wood production)",
    effectDescription: "Requires 5 bronze bars and 500 wood",
    done() {if (player.Wood.wood >= 500 && player.Metal.bronze >= 5 && player.bronze)
    {return true}
else {return false}},
onComplete() {player.Wood.wood -= 500
player.Metal.bronze -= 5
player.Wood.woodGain *= 2},
unlocked() {return player.bronze}
}},
tabFormat: {
    "Resources": {
        content: [
    ["display-text", function(){
        if (player.counting == false){
            if (player.Wood.wood==0) {
                return "You have no wood"
            }
            else if (player.Wood.wood==1) {
                return "You have some wood"
            }
            else {
                return "You have many wood"
            }
        }
    else {
        if (!player.bronze) {return "you have " +Math.floor(player.Wood.wood) + " wood"}
        else {return "you have " +Math.floor(player.Wood.wood) + " wood<br>You have " + Math.floor(player.Wood.planks) + " planks"}
    }}],
        "clickables"
    
]},
    "Tools": {
        content: ["milestones"],
        unlocked() {return player.upgrade2}
    }}})

addLayer("Food", {
    row: 4,
    position: 3,
    layerShown() {if (player.discoveries >= 5 &&player.showHumanity==true)
        return true
        else {
            return false
        }
    },
    
    color: "green",
    startData() {return { 
    primFood: 0,
    crops: 0,
    primFoodGain: 1,
    stoneT: false,
    cropReq: 10,
    livestock: 0}},
    tooltip: "",
    
    clickables: {
        11: {
            title: "Gather",
            unlocked() {return !hasUpgrade("Const",16)},
            display: "",
            canClick: true,
            onClick() {player.Food.primFood += player.Food.primFoodGain},
            style()
            {return {
            "background-color": "yellow"}}},
       12: {
        title: "Produce crops",
        unlocked() {return (!hasUpgrade("Const",16)&&player.upgrade)},
        display() {return "Requires " + player.Food.cropReq + " primitive food"},
        canClick() {if (player.Food.primFood>=player.Food.cropReq) {return true}
    else {return false}},
        onClick() {if (player.Food.primFood >= player.Food.cropReq) 
        {player.Food.crops += 1
        player.Food.primFood -= player.Food.cropReq}},
        style()
            {return {
            "background-color": "yellow"}},
        
},
    13: {
        title: "Produce livestock",
        unlocked() {return hasUpgrade("Const",17)},
        display() {return "Requires 20 crops"},
        canClick() {if (player.Food.crops >= 20) {return true}
    else {return false}},
        onClick() {if (player.Food.crops >= 20) {
            player.Food.livestock+=1
            player.Food.crops -= 20
        }},
        style()
            {return {
            "background-color": "yellow"}},
    }},
effect() {
    if (hasUpgrade("Const",16)&&player.tab=="Food") {
        player.Food.crops += (player.Food.primFoodGain / 100)
    }
},
milestones: {
    0: {
        requirementDescription: "Primitive hoe (doubles primitive food production)",
        effectDescription: "Requires 20 wood and 20 stone",
        done() {if (player.Wood.wood >= 20 && player.rawmin.stone >= 20 && player.upgrade2) {
            return true}
        else {
            return false
        }
        },
        onComplete() {player.Food.primFoodGain = 2
        player.Wood.wood -= 20
    player.rawmin.stone -= 20}
    },
    1: {
        requirementDescription: "Stone hoe (Incraces production of primitive food to 5)",
        effectDescription: "Requires 30 wood and 50 stone",
        done() {if (player.Wood.wood >= 30 && player.rawmin.stone >= 50 && player.Food.primFoodGain ==2) {
            return true}
            else {return false}
        },
        onComplete() {player.Food.primFoodGain = 5
            player.Wood.wood -= 30
            player.rawmin.stone -= 50
            player.Food.stoneT = true}
    },

    2: {
        requirementDescription: "Bronze hoe (Doubles food production)",
        effectDescription: "Requires 5 bronze bars and 500 wood",
        done() {if (player.Wood.wood >= 500 && player.Metal.bronze >= 5 && player.bronze)
        {return true}
    else {return false}},
    onComplete() {player.Wood.wood -= 500
    player.Metal.bronze -= 5
    player.Food.primFoodGain *= 2},
    unlocked() {return player.bronze}
    }
},
tabFormat: {
    "Resources": {
        content: [
    ["display-text", function(){
        if (player.counting == false){
            if (player.Food.primFood==0) {
                return "You have no primitive food"
            }
            else if (player.Food.primFood==1) {
                return "You have some primitive food"
            }
            else {
                return "You have many primitive food"
            }
        }
    else {
        line1= "You have " +player.Food.primFood + " primitive food"
        line2 = ""
        line3 = ""
        if (player.upgrade) {
            line2 = "<br>You have " + Math.floor(player.Food.crops) + " crops"
        }
        if (hasUpgrade("Const",17))
        {line3 = "<br>You have " + Math.floor(player.Food.livestock) + " livestock"}
        return (line1 + line2+line3)
    }}],
        "clickables"]},
        "Tools": {
            content: ["milestones"],
            unlocked() {return player.upgrade2}
        }}    

})

addLayer("rawmin", {
    symbol: "Raw minerals",
    row: 4,
    position: 5,
    layerShown() {if (player.discoveries >= 5 &&player.showHumanity==true)
        return true
        else {
            return false
        }
    },
    
    color: "gray",
    startData() {return { 
    stone: 0,
stoneGain: 1,
stoneT: false,
auto: false,
copper: 0,
coal: 0,
iron: 0,
tin: 0,
coalProd: 0.1,
copperProd: 0.05,
tinProd: 0.05}},
    tooltip: "",
    
    clickables: {
        11: {
            unlocked() {return !player.rawmin.auto},
            title: "Gather",
            display: "",
            canClick: true,
            onClick() {player.rawmin.stone+=player.rawmin.stoneGain},
            style()
            {return {
            "background-color": "yellow"}},
}},
effect() {if (player.rawmin.auto&&player.tab =="rawmin") {
    let amount = (player.rawmin.stoneGain / 20)
    if (hasUpgrade("Const", 15)) {
        player.rawmin.stone += (amount * 0.775)
        player.rawmin.copper += (amount * player.rawmin.copperProd)
        player.rawmin.tin += (amount * player.rawmin.tinProd)
        player.rawmin.coal += (amount * player.rawmin.coalProd)
        player.rawmin.iron += (amount * 0.025)
    }
    else {player.rawmin.stone += amount}

    
}},
milestones: {
    0: {
        requirementDescription: "Primitive pickaxe (doubles stone production)",
        effectDescription: "Requires 20 wood and 20 stone",
        done() {if (player.Wood.wood >= 20 && player.rawmin.stone >= 20 && player.upgrade2) {
            return true}
        else {
            return false
        }
        },
        onComplete() {player.rawmin.stoneGain = 2
        player.Wood.wood -= 20
    player.rawmin.stone -= 20}
    },

    1: {
        requirementDescription: "Stone pickaxe (Increaces production of stone to 5)",
        effectDescription: "Requires 30 wood and 50 stone",
        done() {if (player.Wood.wood >= 30 && player.rawmin.stone >= 50 && player.rawmin.stoneGain ==2) {
            return true
        }
    else {return false}},
        onComplete() {player.rawmin.stoneGain = 5
            player.Wood.wood -= 30
            player.rawmin.stone -= 50
            player.rawmin.stoneT = true
        }
    },

    2: {
        requirementDescription: "Bronze pickaxe (Doubles mineral production)",
        effectDescription: "Requires 5 bronze bars and 500 wood",
        done() {if (player.Wood.wood >= 500 && player.Metal.bronze >= 5 && player.bronze)
        {return true}
    else {return false}},
    onComplete() {player.Wood.wood -= 500
    player.Metal.bronze -= 5
    player.rawmin.stoneGain *= 2},
    unlocked() {return player.bronze}
    }
},

tabFormat: {
    "Resources": 
    {content: [
    ["display-text", function(){
        if (player.counting == false){
            if (player.rawmin.stone==0) {
                return "You have no stone"
            }
            else if (player.rawmin.stone==1) {
                return "You have some stone"
            }
            else {
                return "You have many stone"
            }
        }
    else {
        if (hasUpgrade("Const",15)) {
        return "you have " + Math.floor(player.rawmin.stone) + " stone<br>you have " + Math.floor(player.rawmin.copper) + " copper ore<br>you have " + Math.floor(player.rawmin.tin) + " tin ore<br>you have " + Math.floor(player.rawmin.coal) + " coal<br>you have " + Math.floor(player.rawmin.iron) + " iron ore"}
        else { return "you have " + Math.floor(player.rawmin.stone) + " stone"}
    }}],
        "clickables",
]},
"Tools": {
    content: ["milestones"],
    unlocked() {return player.upgrade2}
}}    
    
,
nodeStyle: {
    'font-size': '18px',
},
})

addNode("Agri", {
    row: 5,
    position: 1,
	layerShown() {if (player.discoveries >= 9&&player.showHumanity==true) {
        return true}
        else {return false}
    },
	symbol: "Agriculture",
	tooltip: "Humans advance from gathering to farming",
	onClick() {},
	branches: ["Prod1"],
	canClick: true,
	nodeStyle: {
		'font-size': '18px',
	},
})

addNode("FHuman", {
    row: 6,
	layerShown() {if ((player.discoveries >= 10&&player.showHumanity==true)) {
        if (player.lockDiscoveries == false&&player.discoveries==10) {
            player.lockDiscoveries = true
        }
        return true}
        else {return false}
    },
    position:1,
	symbol: "Farmer",
	tooltip: "As civilisation increases, so does the demand by the people",
    tooltipLocked: "Requires 10 wood, 10 stone and 10 primitive food",
	onClick() {},
	branches: ["Agri"],
	canClick() {
        
        if (player.upgrade==false &&(player.Wood.wood < 10 ||player.rawmin.stone < 10 || player.Food.primFood < 10)) {
        
        return false}
        else {
            if (player.upgrade == false&&player.discoveries==10){
            player.upgrade=true
            player.rawmin.stone -=10
            player.Wood.wood -= 10
            player.Food.primFood -= 10}
            else {
                if (player.discoveries==10){
                player.lockDiscoveries=false}
                return true}
    
    }},
	nodeStyle: {
		'font-size': '18px',
	},
})

addNode("Tools", {
    row: 3,
    position: 2,
	layerShown() {if ((player.discoveries >= 11&&player.showHumanity==true)) {
        if (player.lockDiscoveries == false&&player.discoveries==11) {
            player.lockDiscoveries = true
        }
        return true}
        else {return false}
    },
	symbol: "Tools",
	tooltip: "As community grows, so does the exchange of ideas.",
    tooltipLocked: "Requires 20 wood and 20 stone",
	onClick() {},
	branches: ["Idea"],
	canClick() {
        
        if (player.upgrade2==false &&(player.Wood.wood < 20 ||player.rawmin.stone < 20)) {
        
        return false}
        else {
            if (player.upgrade2 == false&&player.discoveries>=11){
            player.upgrade2=true
            player.rawmin.stone -=20
            player.Wood.wood -= 20}
            else {
                if (player.discoveries==11){
                player.lockDiscoveries=false}
                return true}
    
    }},
	nodeStyle: {
		'font-size': '18px',
	},
})
addNode("StoneAge", {
    row: 4,
    position: 2,
	layerShown() {if ((player.discoveries >= 12&&player.showHumanity==true)) {
        if (player.lockDiscoveries == false&&player.discoveries==12) {
            player.lockDiscoveries = true
        }
        return true}
        else {return false}
    },
	symbol: "Stone age",
	tooltip: "People begin to experiment with earth's minerals",
    tooltipLocked: "Requires 200 stone, 10 crops and all stone tools",
	onClick() {},
	branches: ["Tools", "Sett"],
	canClick() {
        
        if (player.upgrade3==false &&(player.rawmin.stone < 200 ||player.Food.crops < 10||player.Wood.stoneT == false || player.rawmin.stoneT == false || player.Food.stoneT == false)) {
        
        return false}
        else {
            if (player.upgrade3 == false&&player.discoveries>=12){
            player.upgrade3=true
            player.rawmin.stone -=200
            player.Food.crops -= 10
        }
            else {
                if (player.discoveries==12){
                player.lockDiscoveries=false}
                return true}
    
    }},
	nodeStyle: {
		'font-size': '18px',
	},
})
addNode("Time", {
    row: 6,
	layerShown() {if (player.discoveries >= 7&&player.showHumanity==true) {
        return true}
        else {return false}
    },
    position: 2,
	symbol: "Time",
	tooltip: "As the days pass, civilisation subdivides the day",
	onClick() {},
	branches: ["Count"],
	canClick: true,
	nodeStyle: {
		'font-size': '18px',
	},
})
addNode("dayN", {
    row: 7,
	layerShown() {if (player.discoveries >= 8&&player.showHumanity==true) {
        return true}
        else {return false}
    },
	symbol: "Day/night",
    position: 2,
	tooltip: "Slowly, people begin to notice patterns in the sky as time passes",
	onClick() {},
	branches: ["Time"],
	canClick: true,
	nodeStyle: {
		'font-size': '18px',
	},
})
addNode("Astr", {
    row: 8,
	layerShown() {if (player.discoveries >= 13&&player.showHumanity==true) {
        return true}
        else {return false}
    },
	symbol: "Astrology",
	tooltip: "Humanity plots the stars in the sky and studies them",
	onClick() {},
	branches: ["dayN"],
	canClick: true,
	nodeStyle: {
		'font-size': '18px',
	},
})
addNode("Mine1", {
    row: 5,
    position: 3,
	layerShown() {if (player.discoveries >= 14&&player.showHumanity==true) {
        player.rawmin.auto=true
        return true}
        else {return false}
    },
	symbol: "Basic mine",
	tooltip: "Humanity starts to delve deep into the planet",
	onClick() {},
	branches: ["StoneAge"],
	canClick: true,
	nodeStyle: {
		'font-size': '18px',
	},
})
addNode("Trade", {
    row: 5,
    position: 4,
	layerShown() {if ((player.discoveries >= 15&&player.showHumanity==true)) {
        if (player.lockDiscoveries == false&&player.discoveries==15) {
            player.lockDiscoveries = true
        }
        return true}
        else {return false}
    },
	symbol: "Trade",
	tooltip: "Civilisations begin to interact with each other",
    tooltipLocked: "Requires 200 wood, 10 crops and 100 stone",
	onClick() {},
	branches: ["StoneAge", "Prod1"],
	canClick() {
        
        if (player.upgrade4==false &&(player.rawmin.stone < 100 ||player.Food.crops < 10)) {
        
        return false}
        else {
            if (player.upgrade4 == false&&player.discoveries>=15){
            player.upgrade4=true
            player.rawmin.stone -=100
            player.Food.crops -= 10
            player.Wood.wood -= 200
        }
            else {
                if (player.discoveries==15){
                player.lockDiscoveries=false}
                return true}
    
    }},
	nodeStyle: {
		'font-size': '18px',
	},
})

addLayer("Const", {
    symbol: "Construction",
    position: 5,
    row: 5,
    branches: ["Food", "rawmin", "Wood"],
    tooltipLocked: "Requires 10 crops, 100 wood and 100 stone",
    tooltip: "Let the resource management commence!",
    nodeStyle: {
		'font-size': '18px',
	},
    color: "blue",
    startData() {
        return {
            unlocked: false,
            brp: 0,
            irp: 0,
            brpGain: 1
        }
    },
    layerShown() {if (player.upgrade4&&player.showHumanity) {
        return true
    }
else {return false}},
    unlocked() {if (player.upgrade5 == false && (player.Food.crops < 10|| player.Wood.wood < 100 || player.rawmin.stone < 100)){
        return false
    }
        else{
            if (player.upgrade5==false && player.upgrade4) {
                player.Food.crops -= 10
                player.Wood.wood -= 100
                player.rawmin.stone -= 100
                player.upgrade5 = true
                
                
            }
            
            player.Const.unlocked = true
        }},
        effect() {if (hasUpgrade("Const",22)&&player.tab=="Const") {player.Const.brp += (player.Const.brpGain / 50)}},
        clickables: {
            11: {
                unlocked() {return !hasUpgrade("Const",22)},
                title: "Make basic resource pack",
                display: "Requires 10 crops, 100 wood and 100 stone",
                canClick() {if (player.Food.crops >= 10&&player.Wood.wood >= 100 && player.rawmin.stone >= 100) {return true}
            else {return false}},
                onClick() {if (player.Food.crops >= 10&&player.Wood.wood >= 100 && player.rawmin.stone >= 100) {
                    player.Food.crops -= 10
                    player.rawmin.stone -= 100
                    player.Wood.wood -= 100
                    player.Const.brp += 1
                }},
                style()
                {return {
                "background-color": "yellow"}},
    },
            21: {
                unlocked() {return player.bronze},
                title: "Make intermediate resource pack",
                display: "Requires 10 livestock, 20 basic resource packs, 20 bronze bars, 5 iron bars, 1000 stone and 10 planks",
                canClick() {if (player.Food.livestock >= 10&&player.Const.brp >= 20&&player.Metal.bronze >= 20&&player.Metal.iron >= 5&&player.rawmin.stone>= 1000&&player.Wood.planks>= 10) {return true}
                else {return false}},
                onClick() {if (player.Food.livestock >= 10&&player.Const.brp >= 20&&player.Metal.bronze >= 20&&player.Metal.iron >= 5&&player.rawmin.stone>= 1000&&player.Wood.planks>= 10) {
                    player.Food.livestock -= 10
                    player.Const.brp -= 20
                    player.Metal.bronze -= 20
                    player.Metal.iron -= 5
                    player.Wood.planks -= 10
                    player.Const.irp += 1
                }},
                style()
                {return {
                "background-color": "yellow"}},
            }},
    upgrades: {
        11: {
            title: "Lumberjack",
            description: "Automates wood",
            cost() {},
            pay() {player.Const.brp -= 1},
            onPurchase() {player.Wood.auto = true},
            canAfford() {if (player.Const.brp >= 1) 
            { return true}
        else {return false}}
        },
        
        12: {
            title: "Fertiliser",
            description: "Half the amount of primitive food required to produce a crop",
            cost() {},
            pay() {player.Const.brp -= 1},
            onPurchase() {player.Food.cropReq = 5},
            canAfford() {if (player.Const.brp >= 1)
            {return true}
        else {return false}}
        },
        
        13: {
            title: "Village",
            description: "Doubles stone and wood production",
            cost() {},
            pay() {player.Const.brp -= 1},
            onPurchase() {player.Wood.woodGain *= 2
            player.rawmin.stoneGain *= 2},
            canAfford () {if (player.Const.brp >= 1)
            {return true}
        else {return false}}
        },

        14: {
            title: "Skilled workers",
            description: "Doubles stone and wood production again",
            cost() {},
            pay() {player.Const.brp -= 1},
            onPurchase() {player.Wood.woodGain *= 2
            player.rawmin.stoneGain *= 2},
            canAfford () {if (player.Const.brp >= 1&&hasUpgrade("Const",11)&&hasUpgrade("Const",12)&&hasUpgrade("Const",13))
                {return true}
            else {return false}},
            branches: [11, 12, 13]
        },
        15: {
            title: "Deeper mines",
            description: "Unlocks mining basic ores",
            cost() {},
            pay() {player.Const.brp -= 5},
            onPurchase () {"blah"},
            canAfford() {if (player.Const.brp >= 5&&hasUpgrade("Const",14))
        {return true}
    else {return false}},
            branches: [14]
        },

        16: {
            title: "Irrigation",
            description: "Remove primitive food and automate crops",
            cost() {},
            pay() {player.Const.brp -= 5},
            unlocked() {return player.bronze},
            canAfford() {if (player.Const.brp >=5) {return true}
        else {return false}},
        branches: [12]
        },

        17: {
            title: "Domestication",
            description: "Unlocks livestock",
            cost() {},
            pay() {player.Const.brp -= 5},
            unlocked() {return player.bronze},
            canAfford() {if (player.Const.brp >= 5) {return true}
        else {return false}},
            branches: [13]
        },

        18: {
            title: "Coal mining",
            description: "Doubles coal production",
            cost() {},
            pay() {player.Const.brp -= 10
            player.rawmin.coalProd*= 2},
            unlocked() {return hasUpgrade("Const",15)},
            canAfford() {if (player.Const.brp >= 10&&hasUpgrade("Const",15)) {return true}
        else {return false}},
        branches: [15]
        },

        19: {
            title: "Tin mining",
            description: "Doubles tin production",
            cost() {},
            pay() {player.Const.brp -= 10
            player.rawmin.tinProd *= 2},
            unlocked() {return hasUpgrade("Const",15)},
            canAfford() {if (player.Const.brp >= 10&&hasUpgrade("Const",15)) {return true}
        else {return false}},
        branches: [15]
        },

        20: {
            title: "copper mining",
            description: "Doubles copper production",
            cost() {},
            pay() {player.Const.brp -= 10
            player.rawmin.copperProd *= 2},
            unlocked() {return hasUpgrade("Const",15)},
            canAfford() {if (player.Const.brp >= 10&&hasUpgrade("Const",15)) {return true}
        else {return false}},
        branches: [15]
        },

        21: {
            title: "Plough",
            description: "Doubles crop yield",
            cost() {},
            pay() {player.Const.brp -= 10
            player.Food.primFoodGain*=2},
            unlocked() {return (hasUpgrade("Const",16)&&hasUpgrade("Const",17))},
            canAfford() {if (player.Const.brp >= 10&&hasUpgrade("Const",16)&&hasUpgrade("Const",17)) {return true}
        else {return false}},
        branches: [16,17]
        },

        22: {
            title: "Town",
            description: "Automates basic resource pack",
            cost() {},
            pay() {player.Const.irp -= 1},
            canAfford() {if (player.Const.irp >= 1) {return true}
        else {return false}}
        },

        23: {
            title: "Feudalism",
            description: "Doubles all raw minerals, food, wood production and basic resource pack production. Also speeds up human history to get so that making more complex resources makes more sense historically :P",
            cost() {},
            pay() {player.Const.irp -= 1
            player.Food.primFoodGain *= 2
            player.rawmin.stoneGain *= 2
            player.Wood.woodGain *= 2
            player.Const.brpGain*=2},
            canAfford() {if (player.Const.irp >= 1&&hasUpgrade("Const",22)) {return true}
            else {return false}},
            branches: [22]
        },


        
    },
    tabFormat: {
        "Basic resource pack": {
            content: [
        ["display-text",
    function() {return "You have " + Math.floor(player.Const.brp) + " Basic resource packs"}],
    ["clickables",[1]],
    ["upgrade-tree",[[11,12,13],[14,16, 17],[15,21],[18,19,20]]]]
    },

    "Intermediate resource pack": {
        content: [
            ["display-text",
            function() {return "You have " + player.Const.irp + " intermediate resource packs"}],
            ["clickables",[2]],
            ["upgrade-tree",[[22],[23]]]
        ],
        unlocked() {return player.bronze}

    }}
    

})

addLayer("Metal",{
    symbol: "Metals",
    position: 6,
    row: 5,
    branches: ["rawmin"],
    tooltipLocked: "Requires 5 basic resource packs",
    startData() {return {
        unlocked: false,
        bronze: 0,
        iron: 0,
    }},
    nodeStyle: {
		'font-size': '18px',
	},
    color: "grey",
    layerShown() {if (player.upgrade4&&player.showHumanity) {
        return true
    }
else {return false}},
unlocked() {if (player.upgrade6 == false && (player.Const.brp < 5)){
    return false
}
else{
    if (player.upgrade6==false && player.upgrade5) {
        player.Const.brp -= 5
        player.upgrade6 = true
        
    }
    
    player.Metal.unlocked = true
}},
clickables: {
    11: {
        unlocked() {return true},
        title: "Craft a bronze bar",
        display: "Requires 20 coal, 10 copper ore and 10 tin ore",
        canClick() {if (player.rawmin.coal >= 20&&player.rawmin.copper >= 10 && player.rawmin.tin >= 10) {return true}
        else {return false}},
        onClick() {if (player.rawmin.coal >= 20&&player.rawmin.copper >= 10 && player.rawmin.tin >= 10) {
            player.rawmin.coal -= 20
            player.rawmin.copper -= 10
            player.rawmin.tin -= 10
            player.Metal.bronze += 1
        }},
        style()
        {return {
        "background-color": "yellow"}},
},
    12: {
        
            unlocked() {return true},
            title: "Craft an iron bar",
            display: "Requires 50 coal and 20 iron ore",
            canClick() {if (player.rawmin.coal >= 50&&player.rawmin.iron>=20) {return true}
        else {return false}},
            onClick() {if (player.rawmin.coal >= 50&&player.rawmin.iron>=20) {
                player.rawmin.coal -= 50
                player.rawmin.iron -= 20
                player.Metal.iron += 1
            }},
            style()
            {return {
            "background-color": "yellow"}}
    }},
tabFormat: [
    ["display-text",
function() {return "You have " + player.Metal.bronze + " bronze bars<br>You have " + player.Metal.iron + " iron bars"}],
"clickables",]
})

addNode("BAge", {
    row: 6,
	layerShown() {if ((player.discoveries >= 16&&player.showHumanity==true)) {
        if (player.lockDiscoveries == false&&player.discoveries==16) {
            player.lockDiscoveries = true
        }
        return true}
        else {return false}
    },
	symbol: "Bronze age",
    position: 3,
	tooltip: "Finally, after a massive expansion in civilisation and exchange of ideas, bronze has been discovered.",
    tooltipLocked: "Requires 1 bronze bar",
	onClick() {},
	branches: ["Trade"],
	canClick() {
        
        if (player.upgrade7==false &&(player.Metal.bronze < 1)) {
        
        return false}
        else {
            if (player.upgrade7 == false&&player.discoveries==16){
            player.upgrade7=true
            player.Metal.bronze -= 1
            player.bronze=true}
            else {
                if (player.discoveries==16){
                player.lockDiscoveries=false}
                return true}
    
    }},
	nodeStyle: {
		'font-size': '18px',
	},
})

addNode("Immig", {
    row: 6,
	layerShown() {if (player.discoveries >= 17&&player.showHumanity==true) {
        return true}
        else {return false}
    },
    position: 4,
	symbol: "Immigration",
	tooltip: "Some civilisations are now large enough to attract people",
	onClick() {},
	branches: ["Trade"],
	canClick: true,
	nodeStyle: {
		'font-size': '18px',
	},
})

addNode("Logic", {
    row: 6,
	layerShown() {if (player.discoveries >= 18&&player.showHumanity==true) {
        return true}
        else {return false}
    },
    position: 2,
	symbol: "Logic",
	tooltip: "Philosophy begins to construct arguments in a more formal way",
	onClick() {},
	branches: ["Count"],
	canClick: true,
	nodeStyle: {
		'font-size': '18px',
	},
})

addNode("Math", {
    row: 7,
	layerShown() {if (player.discoveries >= 19&&player.showHumanity==true) {
        return true}
        else {return false}
    },
    position: 1,
	symbol: "Mathematics",
	tooltip: "Logic and counting develops into their own field",
	onClick() {},
	branches: ["Logic"],
	canClick: true,
	nodeStyle: {
		'font-size': '18px',
	},
})

addNode("Soon", {
    row: 7,
    layerShown() {if ((player.discoveries >= 20&&player.showHumanity==true)) {
        if (player.lockDiscoveries == false&&player.discoveries==20) {
            player.lockDiscoveries = true
        }
        return true}
        else {return false}
    },
    position: 3,
    onClick() {},
	branches: ["BAge"],
	canClick() {
    return false
    },
    tooltipLocked: "Coming soon",
	nodeStyle: {
		'font-size': '18px',
	},
})