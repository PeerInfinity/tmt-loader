addLayer("z", {
    name: "Dota 2",
    symbol: "z",
    position: 1,
    hotkeys: [
        {key: "1", onPress(){clickClickable("z", "31") }},
        {key: "2", onPress(){clickClickable("z", "32") }},
        {key: "3", onPress(){clickClickable("z", "33") }},
        {key: "4", onPress(){clickClickable("z", "34") }},
    ],
    startData() { return {
        unlocked: false,
        macro: new Decimal(0),
        expectedButton: new Decimal(0),
        pressedButton: new Decimal(0),
        micro: new Decimal(0),
        cycle: new Decimal(0),
		points: new Decimal(0),
        req: new Decimal(50),
        total: new Decimal(0),
        setBuyableAmount: new Decimal(0),
        energy: new Decimal(0),
        energyGain: new Decimal(0),
        energyGain2: new Decimal(0),
        poopGain: new Decimal(0),
        MMR: new Decimal(0),
        progress1: new Decimal(0),
        progress2: new Decimal(0),
        progress3: new Decimal(0),
        poopChance: new Decimal(0), 
        playText : new String(0),
        playTime1 : new Decimal(0),
        playPick : new Decimal(0),
        play1 : new Decimal(0),
        pick: new Decimal(0),
        cpick: new Decimal(0),
        pickChance: new Decimal(0),
        playTime2 : new Decimal(0),
        play2 : new Decimal(0),
        playTime3 : new Decimal(0),
        realplayTime3: new Decimal(0),
        play3 : new Decimal(0),
        pickChance1: new Decimal(0),
        power1: new Decimal(0),
        pickChance2: new Decimal(0),
        power2: new Decimal(0),
        pickChance3: new Decimal(0),
        power3: new Decimal(0),
        pickChance4: new Decimal(0),
        power4: new Decimal(0),
        pickChance5: new Decimal(0),
        power5: new Decimal(0),
        winChance : new Decimal(80),
        line : new Decimal(0),
        late: new Decimal(0),
        win: new Decimal(0),
        MMRGain: new Decimal(1),
        timeMan: new Decimal(0),
        cd: new Decimal(0)
    }},
    canReset() { return new Decimal(player.o.points).gte(player[this.layer].getNextAt) },
    layerShown() { return player[this.layer].unlocked || hasUpgrade("o", 31) },
    color: "#D3D3D3",
    getResetGain(useType="custom") { return Math.floor(new Decimal(player.o.points).div(1e87).log(1e30).sub(player.z.total).plus(1) ) },
    getNextAt(canMax=true) {
        return new Decimal(1e87).times(new Decimal(1e30).pow(player.z.total))
    },
    prestigeButtonText() {
        return "Redeem "+ format(tmp[this.layer].getResetGain) +" acts" + "\n\
        Next at " + format(tmp[this.layer].getNextAt)
    },
    requires: new Decimal(1e87),
    row: "3",
    resource: "Acts",
    baseResource: "motivation points",
    autoPrestige() { return false },
    doReset(resettingLayer) {
        if(layers[resettingLayer].row <= this.row) return;
            let keep = [player[this.layer].micro, player[this.layer].macro, ]

            layerDataReset(this.layer)
            player[this.layer].micro = keep[0]
            player[this.layer].macro = keep[1]
    },
    resetsNothing() { return true },
    baseAmount() {return player.o.points},
    type: "custom",
    autoPrestige() { return true },
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    directMult() {
        mult = new Decimal(1)
        mult = mult.times(buyableEffect("w", 13))
        return mult
    },
    canBuyMax() { return true },
    tabFormat: {
        "Dota 2": {
        content: [
        "main-display",
        "total",
        "blank",
        "resource-display",
        "blank",
        ["row", [
            ["clickable", '11'],
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            ["clickable", '12'],
        ]],
        "blank",
        ["row", [
            "blank",
            "blank",         
            ["bar", 'bar1'],
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            ["bar", 'bar2'],
            "blank",
            "blank",
            "blank",
            ["bar", 'bar3'],
        ]],
        "blank",
        ["row", [
            ["clickable", '13'],
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            "blank",
            ["clickable", '14'],
        ]],
        "blank",
        ["display-text", 
            function() { return "Energy: "+format(player[this.layer].energy) }
        ],
        "blank",
        ["display-text", 
            function() { 
                let data = player[this.layer]
                let req = data.req
                if (hasUpgrade("z", 13)) req = new Decimal(req).times(5)
                if (hasUpgrade("z", 15)) req = new Decimal(req).times(5)
                if (hasUpgrade("z", 24)) req = new Decimal(req).times(5)
                if (hasUpgrade("y", 12)) req = new Decimal(req).times(10)
                if (hasUpgrade("y", 13)) req = new Decimal(req).times(10)
                if (hasUpgrade("y", 14) && hasUpgrade("z", 24)) req = new Decimal(req).times(50)
                
                return "Needed energy: "+format(req) 
            }
        ],
        "blank",
        ["clickable", '15'],
        "blank",
        ["display-text",
            function() { return player[this.layer].playText }
        ],
        "blank",
        ["row", [
            ["clickable", "21"],
            ["clickable", "22"],
            ["clickable", "23"],
            ["clickable", "24"],
            ["clickable", "25"],
        ]],
        "blank",
        ["display-text",
            function() { 
                let MMRlimit = new Decimal(1e10).mul(new Decimal(5).pow(player[this.layer].macro.add(player[this.layer].micro)))
                return "MMR: " + format(player[this.layer].MMR) + " / " + format(MMRlimit)
            }
        ],
        "blank",
        "upgrades",
        "blank",
        ]},
        "ImmortalDraft": {
            name: "Immortal Draft",
            content: [
                ["infobox", "12"],
                ["blank", "30px"],
                ["display-text",
                    function() { return "<h1>Macro skill level: " + format(player[this.layer].macro) + "</h1>"}
                ],
                ["display-text",
                    function() { 
                        let req = new Decimal(500000).mul(new Decimal(player[this.layer].macro).add(1))
                        let color = "#FFFFFF"
                        if (player.k.points.gte(req)) color = "#32CD32"
                        return "<h4><font color="+ color +">IQ needed for level up: " + format(player.k.points) +" / "+format(req) + "</font></h4>"
                    }
                ],
                ["blank", "10px"],
                ["clickable", "41"],
                ["blank", "30px"],
                ["display-text",
                    function() { return "<h1>Micro skill level: " + format(player[this.layer].micro) + "</h1>"}
                ],
                ["display-text",
                    function() { 
                        let req = new Decimal(1e10).mul(new Decimal(10).pow(player[this.layer].micro))
                        let color = "#FFFFFF"
                        if (player.z.energy.gte(req)) color = "#32CD32"
                        return "<h4><font color="+ color +">Energy needed for level up attemp: " + format(player.z.energy) +" / "+format(req) + "</font></h4>"
                    }
                ],
                ["blank", "10px"],
                ["clickable", "42"],
                ["blank", "30px"],
                ["display-text",
                    function() { 
                        let Button = new Decimal(0)
                        if (new Decimal(player[this.layer].expectedButton).eq(new Decimal(1))) Button = "1"
                        if (new Decimal(player[this.layer].expectedButton).eq(new Decimal(2))) Button = "2"
                        if (new Decimal(player[this.layer].expectedButton).eq(new Decimal(3))) Button = "3"
                        if (new Decimal(player[this.layer].expectedButton).eq(new Decimal(4))) Button = "4"
                        let color = "#FFFFFF"
                        if (new Decimal(player[this.layer].pressedButton).eq(player[this.layer].expectedButton) & !new Decimal(player[this.layer].pressedButton).eq(new Decimal(0))) color = "#32CD32"
                        if (!player[this.layer].pressedButton.eq(player[this.layer].expectedButton) & !new Decimal(player[this.layer].pressedButton).eq(new Decimal(0))) color = "red"
                        if (new Decimal(Button).eq(new Decimal(0))) Button = ""
                        return "<h1><font size=12 color="+ color +">"+Button+"</font></h1>"
                    }
                ],
                ["blank", "30px"],
                ["row", [
                    ["clickable", "31"],
                    ["clickable", "32"],
                    ["clickable", "33"],
                    ["clickable", "34"],
                ]],
                ["blank", "10px"],
                ["clickable", "16"],
                ["blank", "10px"],
                ["buyable", "11"],
                ["blank", "10px"],
                "milestones",
            ],
            unlocked() { return hasUpgrade("r", 31) || tmp.z.tabFormat.ImmortalDraft.unlocked },
        },
    },
    infoboxes: {
        12: {
            title: "Immortal Draft",
            body() { 
                return "Для игры на рангах Титан вам нужны отличные умения.\n\
                Именно поэтому теперь вы можете тренировать свой микро скилл.\n\
                Это поможет вам увеличить максимальный ММР, который вы можете получить, а также ускорит игры."
            },
        },
    },
    bars: {
        bar1: {
            unlocked() { return true },
            direction: UP,
            width: 30,
            height: 350,
            progress() {
                return player[this.layer].progress1
            },
        },
        bar2: {
            unlocked() { return true },
            direction: UP,
            width: 30,
            height: 350,
            progress() {
                return player[this.layer].progress2
            }, 
        },
        bar3: {
            unlocked() { return true },
            direction: UP,
            width: 10,
            height: 350,
            progress() {
                return player[this.layer].progress3
            }, 
            fillStyle(){ return { "color": "#D66206"} },
        },
    },
    clickables: {
        11: {
            display() {return "+"},
            canClick() { return new Decimal(player[this.layer].progress1).lte(0.9) && new Decimal(player.z.points).gte(1)},
            onClick() { 
                player.z.points = new Decimal(player.z.points).sub(1)
                player[this.layer].progress1 = new Decimal(player[this.layer].progress1).plus(0.1)
            },
        },
        12: {
            display() {return "+"},
            canClick() { return new Decimal(player[this.layer].progress2).lte(0.9) && new Decimal(player.z.points).gte(1)},
            onClick() { 
                player.z.points = new Decimal(player.z.points).sub(1)
                player[this.layer].progress2 = new Decimal(player[this.layer].progress2).plus(0.1)
            },
        },
        13: {
            display() {return "-"},
            canClick() { return new Decimal(player[this.layer].progress1).gte(0.1) },
            onClick() { 
                player.z.points = new Decimal(player.z.points).plus(1)
                player[this.layer].progress1 = new Decimal(player[this.layer].progress1).sub(0.1)
            },
        },
        14: {
            display() {return "-"},
            canClick() { return new Decimal(player[this.layer].progress2).gte(0.1) },
            onClick() { 
                player.z.points = new Decimal(player.z.points).plus(1)
                player[this.layer].progress2 = new Decimal((player[this.layer].progress2).sub(0.1))
            },
        },
        15: {
            display() {return "Play Dota 2"},
            canClick() { 
                let data = player[this.layer]
                let req = data.req
                if (hasUpgrade("z", 13)) req = new Decimal(req).times(5)
                if (hasUpgrade("z", 15)) req = new Decimal(req).times(5)
                if (hasUpgrade("z", 24)) req = new Decimal(req).times(5)
                if (hasUpgrade("y", 12)) req = new Decimal(req).times(10)
                if (hasUpgrade("y", 13)) req = new Decimal(req).times(10)
                if (hasUpgrade("y", 14) && hasUpgrade("z", 24)) req = new Decimal(req).times(50)
                if (new Decimal(player[this.layer].play).eq(0) && new Decimal(player[this.layer].play2).eq(0) && new Decimal(player[this.layer].pick).eq(0)) return player[this.layer].energy.gte(req)
                else return false
            },
            onClick() { 
                let data = player[this.layer]
                let req = data.req
                if (hasUpgrade("z", 13)) req = new Decimal(req).times(5)
                if (hasUpgrade("z", 15)) req = new Decimal(req).times(5)
                if (hasUpgrade("z", 24)) req = new Decimal(req).times(5)
                if (hasUpgrade("y", 12)) req = new Decimal(req).times(10)
                if (hasUpgrade("y", 13)) req = new Decimal(req).times(10)
                if (hasUpgrade("y", 14) && hasUpgrade("z", 24)) req = new Decimal(req).times(50)
                data.play = new Decimal(1)
                data.energy = new Decimal(data.energy).sub(req)
                data.MMRGain = new Decimal(1)
                if (hasUpgrade("y", 15)) data.MMRGain = new Decimal(3)
                if (hasUpgrade("z", 13)) data.MMRGain = data.MMRGain.times(5)
                if (hasUpgrade("z", 15)) data.MMRGain = data.MMRGain.times(5)
                if (hasUpgrade("z", 24)) data.MMRGain = data.MMRGain.times(4)
                if (hasUpgrade("y", 12)) data.MMRGain = data.MMRGain.times(4)
                if (hasUpgrade("y", 13)) data.MMRGain = data.MMRGain.times(4)
                if (hasUpgrade("y", 14) && hasUpgrade("z", 24)) data.MMRGain = data.MMRGain.times(3)
                if (hasUpgrade("y", 22)) data.MMRGain = data.MMRGain.times(upgradeEffect("y", 22))
                if (hasUpgrade("r", 22)) data.MMRGain = data.MMRGain.times(upgradeEffect("r", 22))
                if (hasUpgrade("z", 35)) data.MMRGain = data.MMRGain.times(upgradeEffect("z", 35))
                if (hasUpgrade("y", 25)) data.MMRGain = data.MMRGain.times(20)
                if (hasUpgrade("r", 25)) data.MMRGain = data.MMRGain.times(10)
                if (hasUpgrade("y", 34)) data.MMRGain = data.MMRGain.times(upgradeEffect("y", 34))
            },
        },
        16: {
            unlocked() { return hasUpgrade("y", 36) },
            display() {
                let data = player[this.layer]
                if (data.timeMan.eq(0)) return "On"
                if (data.timeMan.eq(1)) return "Off"
            },
            canClick() { 
                return new Decimal(player.z.cd).eq(0)
            },
            onClick() { 
                let data = player[this.layer]
                data.cd = new Decimal(5)
                if (data.timeMan.eq(0)) {
                    data.timeMan = new Decimal(1)
                    player.devSpeed = new Decimal(1).div(buyableEffect("z", 11))
                }
                else {
                    data.timeMan = new Decimal(0)
                    player.devSpeed = new Decimal(1)
                }
            },
        },
        21: {
            unlocked() { return player[this.layer].pick.eq(1) },
            canClick() { return true },
            onClick() { 
                player[this.layer].play = new Decimal(0)
                player[this.layer].pick = new Decimal(0)
                player[this.layer].play2 = new Decimal(1)
                player[this.layer].pickChance = Math.random() * 100
                if (new Decimal(player[this.layer].pickChance).lte(player[this.layer].pickChance1)) player[this.layer].cpick = new Decimal(1)
                else player[this.layer].cpick = new Decimal(0)
                lineChance = new Decimal(Math.random()* 100)
                if (new Decimal(lineChance).lte(50)) player[this.layer].line = new Decimal(1)
                else player[this.layer].line = new Decimal(0)
                if (new Decimal(player[this.layer].pick).eq(1)) player[this.layer].winChance = new Decimal(player[this.layer].winChance).mul(0.7)
                if (new Decimal(player[this.layer].line).eq(1)) player[this.layer].winChance = new Decimal(player[this.layer].winChance).mul(1.2)
                else player[this.layer].winChance = new Decimal(player[this.layer].winChance).div(1.2)
                lateChance = new Decimal(Math.random()* 100)
                if (new Decimal(lateChance).lte(50)) player[this.layer].late = new Decimal(1)
                else player[this.layer].late = new Decimal(0)
                if (new Decimal(player[this.layer].late).eq(1)) player[this.layer].winChance = new Decimal(player[this.layer].winChance).mul(1.2)
                else player[this.layer].winChance = new Decimal(player[this.layer].winChance).div(1.2)
                player[this.layer].winChance = new Decimal(player[this.layer].winChance).mul(player[this.layer].power1).div(100)
                win = new Decimal(Math.random() * 100)
                if (new Decimal(win).lte(player[this.layer].winChance)) player[this.layer].win = new Decimal(1)
                else player[this.layer].win = new Decimal(0)
            },
            display() {
                return "1"+"\n\
                Counte pick chance: " + format(player[this.layer].pickChance1)+ "%" +"\n\
                Hero power: " + format(player[this.layer].power1)+ "%"
            },
        },
        22: {
            unlocked() { return player[this.layer].pick.eq(1) },
            canClick() { return true },
            onClick() { 
                player[this.layer].play = new Decimal(0)
                player[this.layer].pick = new Decimal(0)
                player[this.layer].play2 = new Decimal(1)
                player[this.layer].pickChance = Math.random() * 100
                if (new Decimal(player[this.layer].pickChance).lte(player[this.layer].pickChance2)) player[this.layer].cpick = new Decimal(1)
                else player[this.layer].cpick = new Decimal(0)
                lineChance = new Decimal(Math.random()* 100)
                if (new Decimal(lineChance).lte(50)) player[this.layer].line = new Decimal(1)
                else player[this.layer].line = new Decimal(0)
                if (new Decimal(player[this.layer].pick).eq(1)) player[this.layer].winChance = new Decimal(player[this.layer].winChance).mul(0.7)
                if (new Decimal(player[this.layer].line).eq(1)) player[this.layer].winChance = new Decimal(player[this.layer].winChance).mul(1.2)
                else player[this.layer].winChance = new Decimal(player[this.layer].winChance).div(1.2)
                lateChance = new Decimal(Math.random()* 100)
                if (new Decimal(lateChance).lte(50)) player[this.layer].late = new Decimal(1)
                else player[this.layer].late = new Decimal(0)
                if (new Decimal(player[this.layer].late).eq(1)) player[this.layer].winChance = new Decimal(player[this.layer].winChance).mul(1.2)
                else player[this.layer].winChance = new Decimal(player[this.layer].winChance).div(1.2)
                player[this.layer].winChance = new Decimal(player[this.layer].winChance).mul(player[this.layer].power2).div(100)
                win = new Decimal(Math.random() * 100)
                if (new Decimal(win).lte(player[this.layer].winChance)) player[this.layer].win = new Decimal(1)
                else player[this.layer].win = new Decimal(0)
            },
            display() {
                return "2"+"\n\
                Counte pick chance: " + format(player[this.layer].pickChance2)+ "%" +"\n\
                Hero power: " + format(player[this.layer].power2) + "%"
            },
        },
        23: {
            unlocked() { return player[this.layer].pick.eq(1) },
            canClick() { return true },
            onClick() { 
                player[this.layer].play = new Decimal(0)
                player[this.layer].pick = new Decimal(0)
                player[this.layer].play2 = new Decimal(1)
                player[this.layer].pickChance = Math.random() * 100
                if (new Decimal(player[this.layer].pickChance).lte(player[this.layer].pickChance3)) player[this.layer].cpick = new Decimal(1)
                else player[this.layer].cpick = new Decimal(0)
                lineChance = new Decimal(Math.random()* 100)
                if (new Decimal(lineChance).lte(50)) player[this.layer].line = new Decimal(1)
                else player[this.layer].line = new Decimal(0)
                if (new Decimal(player[this.layer].pick).eq(1)) player[this.layer].winChance = new Decimal(player[this.layer].winChance).mul(0.7)
                if (new Decimal(player[this.layer].line).eq(1)) player[this.layer].winChance = new Decimal(player[this.layer].winChance).mul(1.2)
                else player[this.layer].winChance = new Decimal(player[this.layer].winChance).div(1.2)
                lateChance = new Decimal(Math.random()* 100)
                if (new Decimal(lateChance).lte(50)) player[this.layer].late = new Decimal(1)
                else player[this.layer].late = new Decimal(0)
                if (new Decimal(player[this.layer].late).eq(1)) player[this.layer].winChance = new Decimal(player[this.layer].winChance).mul(1.2)
                else player[this.layer].winChance = new Decimal(player[this.layer].winChance).div(1.2)
                player[this.layer].winChance = new Decimal(player[this.layer].winChance).mul(player[this.layer].power3).div(100)
                win = new Decimal(Math.random() * 100)
                if (new Decimal(win).lte(player[this.layer].winChance)) player[this.layer].win = new Decimal(1)
                else player[this.layer].win = new Decimal(0)
            },
            display() {
                return "3"+"\n\
                Counte pick chance: " + format(player[this.layer].pickChance3)+ "%" + "\n\
                Hero power: " + format(player[this.layer].power3) + "%"
            },
        },
        24: {
            unlocked() { return player[this.layer].pick.eq(1) },
            canClick() { return true },
            onClick() { 
                player[this.layer].play = new Decimal(0)
                player[this.layer].pick = new Decimal(0)
                player[this.layer].play2 = new Decimal(1)
                player[this.layer].pickChance = Math.random() * 100
                if (new Decimal(player[this.layer].pickChance).lte(player[this.layer].pickChance4)) player[this.layer].cpick = new Decimal(1)
                else player[this.layer].cpick = new Decimal(0)
                lineChance = new Decimal(Math.random()* 100)
                if (new Decimal(lineChance).lte(50)) player[this.layer].line = new Decimal(1)
                else player[this.layer].line = new Decimal(0)
                if (new Decimal(player[this.layer].pick).eq(1)) player[this.layer].winChance = new Decimal(player[this.layer].winChance).mul(0.7)
                if (new Decimal(player[this.layer].line).eq(1)) player[this.layer].winChance = new Decimal(player[this.layer].winChance).mul(1.2)
                else player[this.layer].winChance = new Decimal(player[this.layer].winChance).div(1.2)
                lateChance = new Decimal(Math.random()* 100)
                if (new Decimal(lateChance).lte(50)) player[this.layer].late = new Decimal(1)
                else player[this.layer].late = new Decimal(0)
                if (new Decimal(player[this.layer].late).eq(1)) player[this.layer].winChance = new Decimal(player[this.layer].winChance).mul(1.2)
                else player[this.layer].winChance = new Decimal(player[this.layer].winChance).div(1.2)
                player[this.layer].winChance = new Decimal(player[this.layer].winChance).mul(player[this.layer].power4).div(100)
                win = new Decimal(Math.random() * 100)
                if (new Decimal(win).lte(player[this.layer].winChance)) player[this.layer].win = new Decimal(1)
                else player[this.layer].win = new Decimal(0)
            },
            display() {
                return "4"+"\n\
                Counte pick chance: " + format(player[this.layer].pickChance4)+ "%"+ "\n\
                Hero power: " + format(player[this.layer].power4)+"%"
            },
        },
        25: {
            unlocked() { return player[this.layer].pick.eq(1) },
            canClick() { return true },
            onClick() {
                player[this.layer].play = new Decimal(0)
                player[this.layer].pick = new Decimal(0)
                player[this.layer].play2 = new Decimal(1)
                player[this.layer].pickChance = Math.random() * 100
                if (new Decimal(player[this.layer].pickChance).lte(player[this.layer].pickChance5)) player[this.layer].cpick = new Decimal(1)
                else player[this.layer].cpick = new Decimal(0)
                lineChance = new Decimal(Math.random()* 100)
                if (new Decimal(lineChance).lte(50)) player[this.layer].line = new Decimal(1)
                else player[this.layer].line = new Decimal(0)
                if (new Decimal(player[this.layer].pick).eq(1)) player[this.layer].winChance = new Decimal(player[this.layer].winChance).mul(0.7)
                if (new Decimal(player[this.layer].line).eq(1)) player[this.layer].winChance = new Decimal(player[this.layer].winChance).mul(1.2)
                else player[this.layer].winChance = new Decimal(player[this.layer].winChance).div(1.2)
                lateChance = new Decimal(Math.random()* 100)
                if (new Decimal(lateChance).lte(50)) player[this.layer].late = new Decimal(1)
                else player[this.layer].late = new Decimal(0)
                if (new Decimal(player[this.layer].late).eq(1)) player[this.layer].winChance = new Decimal(player[this.layer].winChance).mul(1.2)
                else player[this.layer].winChance = new Decimal(player[this.layer].winChance).div(1.2)
                player[this.layer].winChance = new Decimal(player[this.layer].winChance).mul(player[this.layer].power5).div(100)
                win = new Decimal(Math.random() * 100)
                if (new Decimal(win).lte(player[this.layer].winChance)) player[this.layer].win = new Decimal(1)
                else player[this.layer].win = new Decimal(0)
            },
            display() {
                return "5"+"\n\
                Counte pick chance: " + format(player[this.layer].pickChance5)+"%" +"\n\
                Hero power: " + format(player[this.layer].power5) + "%"
            },
        },
        31: {
            display() {return "<h1>1</h1>"},
            canClick() { return player[this.layer].pressedButton.eq(new Decimal(0)) & player[this.layer].play3.eq(new Decimal(1)) },
            onClick() { 
                player[this.layer].pressedButton = new Decimal(1)
            },
        },
        32: {
            display() {return "<h1>2</h1>"},
            canClick() { return player[this.layer].pressedButton.eq(new Decimal(0)) & player[this.layer].play3.eq(new Decimal(1)) },
            onClick() { 
                player[this.layer].pressedButton = new Decimal(2)
            },
        },
        33: {
            display() {return "<h1>3</h1>"},
            canClick() { return player[this.layer].pressedButton.eq(new Decimal(0)) & player[this.layer].play3.eq(new Decimal(1)) },
            onClick() { 
                player[this.layer].pressedButton = new Decimal(3)
            },
        },
        34: {
            display() {return "<h1>4</h1>"},
            canClick() { return player[this.layer].pressedButton.eq(new Decimal(0)) & player[this.layer].play3.eq(new Decimal(1)) },
            onClick() { 
                player[this.layer].pressedButton = new Decimal(4)
            },
        },
        41: {
            display() {return "Level up"},
            canClick() { 
                let req = new Decimal(500000).mul(new Decimal(player[this.layer].macro).add(1))
                if (player.k.points.gte(req)) return true
                else return false
            },
            onClick() { 
                player[this.layer].macro = player[this.layer].macro.add(1)
            },
        },
        42: {
            display() {return "Level up attemp"},
            canClick() { 
                let req = new Decimal(1e10).mul(new Decimal(10).pow(player[this.layer].micro))
                if (player[this.layer].energy.gte(req) & player[this.layer].play3.eq(new Decimal(0)) ) return true
                else return false
            },
            onClick() { 
                let req = new Decimal(1e10).mul(new Decimal(10).pow(player[this.layer].micro))
                player.z.energy = player.z.energy.sub(req)
                player[this.layer].play3 = new Decimal(1)
            },
        },
    },
    update(diff) {
        let data = player[this.layer]
        if (data.progress1.gte(0.1)) {
            data.energyGain1 =  new Decimal(5).pow(data.progress1.times(10).sub(1)) * diff
            if (hasUpgrade("z", 11)) data.energyGain1 = new Decimal(data.energyGain1).mul(3)
            if (hasUpgrade("z", 25)) data.energyGain1 = new Decimal(data.energyGain1).mul(5)
            if (hasUpgrade("y", 11)) data.energyGain1 = new Decimal(data.energyGain1).mul(2)
            if (hasUpgrade("y", 21)) data.energyGain1 = new Decimal(data.energyGain1).times(upgradeEffect("y", 21))
            if (hasUpgrade("z", 33)) data.energyGain1 = new Decimal(data.energyGain1).times(upgradeEffect("z", 33))
            if (hasUpgrade("z", 34)) data.energyGain1 = new Decimal(data.energyGain1).times(upgradeEffect("z", 34))
            if (hasUpgrade("y", 33)) data.energyGain1 = new Decimal(data.energyGain1).times(1e6)
            data.energy = data.energy.plus(data.energyGain1)
        }
        if (data.progress2.gte(0.1)) {
            data.poopChance = new Decimal(Math.random())
            data.energyGain2 =  new Decimal(7).pow(data.progress2.times(10).sub(1)).times(3) * diff
            if (hasUpgrade("z", 11)) data.energyGain2 = new Decimal(data.energyGain2).mul(3)
            if (hasUpgrade("z", 25)) data.energyGain2 = new Decimal(data.energyGain2).mul(5)
            if (hasUpgrade("y", 11)) data.energyGain2 = new Decimal(data.energyGain2).mul(2)
            if (hasUpgrade("y", 21)) data.energyGain2 = new Decimal(data.energyGain2).times(upgradeEffect("y", 21))
            if (hasUpgrade("z", 33)) data.energyGain2 = new Decimal(data.energyGain2).times(upgradeEffect("z", 33))
            if (hasUpgrade("z", 34)) data.energyGain2 = new Decimal(data.energyGain2).times(upgradeEffect("z", 34))
            if (hasUpgrade("y", 33)) data.energyGain2 = new Decimal(data.energyGain2).times(1e6)
            data.energy = data.energy.plus(data.energyGain2)
            data.poopGain = new Decimal(0.03).times(data.progress2.times(10)) * diff
            if (hasUpgrade("z", 21)) data.poopGain = new Decimal(data.poopGain).div(3)
            if (hasUpgrade("z", 32)) data.poopGain = new Decimal(data.poopGain).div(30)
            data.progress3 = data.progress3.plus(data.poopGain)
        }
        if (data.progress2.lte(0) && data.progress3.gte(0)) {
            let poopDic = new Decimal(0.001)
            if (hasUpgrade("z", 21)) poopDic = new Decimal(poopDic).mul(3)
            if (hasUpgrade("z", 32)) poopDic = new Decimal(poopDic).mul(30)
            data.progress3 = new Decimal(data.progress3.sub(poopDic))
        }
        if (data.poopChance.lte(data.progress3.div(100))) {
            data.energy = data.energy.div(2)
            data.progress3 = new Decimal(0)
        }
        if (new Decimal(data.play).eq(1)) {
            let gameSpeed = new Decimal(1)
            if (hasUpgrade("z", 12)) gameSpeed = new Decimal(gameSpeed).mul(1.5)
            if (hasUpgrade("z", 23)) gameSpeed = new Decimal(gameSpeed).mul(1.5)
            if (hasUpgrade("y", 11)) gameSpeed = new Decimal(gameSpeed).mul(1.5)
            if (hasUpgrade("y", 23)) gameSpeed = new Decimal(gameSpeed).mul(2)
            gameSpeed = gameSpeed.mul(1.5).pow(player[this.layer].micro.add(player[this.layer].macro))
            data.playTime = new Decimal(data.playTime).plus(gameSpeed * diff )
            if (new Decimal(data.playTime).gte(0) && new Decimal(data.playTime).lte(3)) data.playText = new String("Подбор игроков...")
            if (new Decimal(data.playTime).gte(3)) {
                if (hasMilestone("y", 6)) {
                    player[this.layer].play = new Decimal(0)
                    player[this.layer].pick = new Decimal(0)
                    player[this.layer].play2 = new Decimal(1)
                    player[this.layer].pickChance = Math.random() * 100
                    if (new Decimal(player[this.layer].pickChance).lte(player[this.layer].pickChance5)) player[this.layer].cpick = new Decimal(1)
                    else player[this.layer].cpick = new Decimal(0)
                    lineChance = new Decimal(Math.random()* 100)
                    if (new Decimal(lineChance).lte(50)) player[this.layer].line = new Decimal(1)
                    else player[this.layer].line = new Decimal(0)
                    if (new Decimal(player[this.layer].pick).eq(1)) player[this.layer].winChance = new Decimal(player[this.layer].winChance).mul(0.7)
                    if (new Decimal(player[this.layer].line).eq(1)) player[this.layer].winChance = new Decimal(player[this.layer].winChance).mul(1.2)
                    else player[this.layer].winChance = new Decimal(player[this.layer].winChance).div(1.2)
                    lateChance = new Decimal(Math.random()* 100)
                    if (new Decimal(lateChance).lte(50)) player[this.layer].late = new Decimal(1)
                    else player[this.layer].late = new Decimal(0)
                    if (new Decimal(player[this.layer].late).eq(1)) player[this.layer].winChance = new Decimal(player[this.layer].winChance).mul(1.2)
                    else player[this.layer].winChance = new Decimal(player[this.layer].winChance).div(1.2)
                    player[this.layer].winChance = new Decimal(player[this.layer].winChance)
                    win = new Decimal(Math.random() * 100)
                    if (new Decimal(win).lte(player[this.layer].winChance)) player[this.layer].win = new Decimal(1)
                    else player[this.layer].win = new Decimal(0)
                }
                else {
                    data.playText = new String("Выбор героя...")
                    data.play = new Decimal(0)
                    data.playTime = new Decimal(0)
                    data.pick = new Decimal(1)
                    data.pickChance1 = new Decimal(Math.floor((Math.random() * 60 ) + 20))
                    data.power1 = new Decimal(Math.floor((Math.random() * 60 ) + 40))
                    data.pickChance2 = new Decimal(Math.floor((Math.random() * 60 ) + 20))
                    data.power2 = new Decimal(Math.floor((Math.random() * 60 ) + 40))
                    data.pickChance3 = new Decimal(Math.floor((Math.random() * 60 ) + 20))
                    data.power3 = new Decimal(Math.floor((Math.random() * 60 ) + 40))
                    data.pickChance4 = new Decimal(Math.floor((Math.random() * 60 ) + 20))
                    data.power4 = new Decimal(Math.floor((Math.random() * 60 ) + 40))
                    data.pickChance5 = new Decimal(Math.floor((Math.random() * 60 ) + 20))
                    data.power5 = new Decimal(Math.floor((Math.random() * 60 ) + 40))
                }
            }
        }
        if (new Decimal(data.play2).eq(1)) {
            let gameSpeed = new Decimal(1)
            if (hasUpgrade("z", 12)) gameSpeed = new Decimal(gameSpeed).mul(1.5)
            if (hasUpgrade("z", 23)) gameSpeed = new Decimal(gameSpeed).mul(1.5)
            if (hasUpgrade("y", 11)) gameSpeed = new Decimal(gameSpeed).mul(1.5)
            gameSpeed = gameSpeed.mul(1.5).pow(player[this.layer].micro.add(player[this.layer].macro))
            data.playTime2 = new Decimal(data.playTime2).plus(gameSpeed * diff)
            if (new Decimal(data.playTime2).lte(3) && new Decimal(data.cpick).eq(0))  data.playText = new String("Вас не контрПикнули")
            if (new Decimal(data.playTime2).lte(3) && new Decimal(data.cpick).eq(1))  data.playText = new String("Вас контрПикнули")
            if (new Decimal(data.playTime2).gte(3) && new Decimal(data.playTime2).lte(6)) data.playText = new String("Лайнинг...")
            if (new Decimal(data.playTime2).gte(6) && new Decimal(data.playTime2).lte(9) && new Decimal(data.line).eq(0))  data.playText = new String("Вы проиграли Лайн")
            if (new Decimal(data.playTime2).gte(6) && new Decimal(data.playTime2).lte(9) && new Decimal(data.line).eq(1))  data.playText = new String("Вы выиграли Лайн")
            if (new Decimal(data.playTime2).gte(9) && new Decimal(data.playTime2).lte(12) && new Decimal(data.late).eq(0))  data.playText = new String("Вы плохо играете в лейте")
            if (new Decimal(data.playTime2).gte(9) && new Decimal(data.playTime2).lte(12) && new Decimal(data.late).eq(1))  data.playText = new String("Вы хорошо играете в лейте")
            if (new Decimal(data.playTime2).gte(12) && new Decimal(data.playTime2).lte(15) && new Decimal(data.win).eq(0))  data.playText = new String("Вы проиграли, -" + format(data.MMRGain) +"MMR")
            if (new Decimal(data.playTime2).gte(12) && new Decimal(data.playTime2).lte(15) && new Decimal(data.win).eq(1))  data.playText = new String("Вы Выиграли, +" + format(data.MMRGain) + "MMR")
            if (new Decimal(data.playTime2).gte(15)) {
                if (new Decimal(data.win).eq(1)) {
                    data.winChance = new Decimal(80)
                    data.winChance = data.winChance.div(1.1)
                    if (hasUpgrade("y", 11)) data.winChance = data.winChance.mul(1.2)
                    if (hasUpgrade("y", 23)) data.winChance = data.winChance.mul(1.1)
                    let MMRlimit = new Decimal(1e10).mul(new Decimal(5).pow(player[this.layer].macro.add(player[this.layer].micro)))
                    if (new Decimal(data.MMR).plus(data.MMRGain).gte(MMRlimit)) data.MMR = new Decimal(MMRlimit)
                    else data.MMR = new Decimal(data.MMR).plus(data.MMRGain)
                }
                if (new Decimal(data.win).eq(0)) { 
                    data.winChance = new Decimal(80)
                    data.winChance = data.winChance.mul(1.2)
                    if (hasUpgrade("y", 11)) data.winChance = data.winChance.mul(1.2)
                    if (hasUpgrade("y", 23)) data.winChance = data.winChance.mul(1.1)
                    if (new Decimal(data.MMR).sub(data.MMRGain).gte(0)) {
                        data.MMR = new Decimal(data.MMR).sub(data.MMRGain)
                    }
                    else data.MMR = new Decimal(0)
                }
                data.play2 = new Decimal(0)
                data.pick = new Decimal(0)
                data.line = new Decimal(0)

                data.late = new Decimal(0)
                data.win = new Decimal(0)
                data.playTime2 = new Decimal(0)
            }
        }
        if (new Decimal(data.play3).eq(1)) {
            let gameSpeed = new Decimal(1)
            gameSpeed = gameSpeed.mul(1.1).pow(player[this.layer].micro)
            data.playTime3 = new Decimal(data.playTime3).plus(gameSpeed * diff)
            data.realplayTime3 = new Decimal(data.realplayTime3).plus(diff)
            if (data.cycle.eq(new Decimal(0))) {
                data.cycle = data.cycle.add(1)
                let expectedButtonCode = new Decimal(Math.floor(Math.random() * 100))
                if (expectedButtonCode.lte(30)) data.expectedButton = new Decimal(1)
                if (expectedButtonCode.lte(60) & expectedButtonCode.gte(30)) data.expectedButton = new Decimal(2)
                if (expectedButtonCode.lte(90) & expectedButtonCode.gte(60)) data.expectedButton = new Decimal(3)
                if (expectedButtonCode.gte(90)) data.expectedButton = new Decimal(4)
            }
            if (data.playTime3.gte(4)) {
                if (new Decimal(data.expectedButton).eq(data.pressedButton)) {
                    data.pressedButton = new Decimal(0)
                    data.playTime3 = new Decimal(0)
                    let expectedButtonCode = new Decimal(Math.floor(Math.random() * 100))
                    if (expectedButtonCode.lte(30)) data.expectedButton = new Decimal(1)
                    if (expectedButtonCode.lte(60) & expectedButtonCode.gte(30)) data.expectedButton = new Decimal(2)
                    if (expectedButtonCode.lte(90) & expectedButtonCode.gte(60)) data.expectedButton = new Decimal(3)
                    if (expectedButtonCode.gte(90)) data.expectedButton = new Decimal(4)
                    let gameSpeed = new Decimal(1)
                    gameSpeed = gameSpeed.mul(new Decimal(1.1).pow(player[this.layer].micro))
                    if (new Decimal(new Decimal(20).sub(data.realplayTime3)).lte(new Decimal(4).div(gameSpeed))) {
                        data.pressedButton = new Decimal(0) 
                        data.expectedButton = new Decimal(0)
                        data.play3 = new Decimal(0)
                        data.realplayTime3 = new Decimal(0)
                        data.playTime3 = new Decimal(0)
                        data.cycle = new Decimal(0)
                        data.micro = data.micro.add(1)
                    }
                }
                else {
                    data.pressedButton = new Decimal(0)
                    data.expectedButton = new Decimal(0)
                    data.play3 = new Decimal(0)
                    data.realplayTime3 = new Decimal(0)
                    data.playTime3 = new Decimal(0)
                    data.cycle = new Decimal(0)
                }
            }
            let timeCap = new Decimal(20)
            if (data.micro.gte(10)) timeCap = new Decimal(10)
            if (data.micro.gte(20)) timeCap = new Decimal(4)
            timeCap = new Decimal(timeCap).div(player.devSpeed)
            if (data.realplayTime3.gte(timeCap) ) {
                data.pressedButton = new Decimal(0)
                data.expectedButton = new Decimal(0)
                data.play3 = new Decimal(0)
                data.realplayTime3 = new Decimal(0)
                data.playTime3 = new Decimal(0)
                data.cycle = new Decimal(0)
                data.micro = data.micro.add(1)
            }
        }
        if (hasMilestone("z", 0)) {
            let MMRlimit = new Decimal(1e10).mul(new Decimal(5).pow(player[this.layer].macro.add(player[this.layer].micro)))
            if (!player[this.layer].MMR.eq(MMRlimit)) clickClickable("z", 15)
        }
        if (!new Decimal(data.cd).eq(0)) {
            data.cd = new Decimal(data.cd).sub(new Decimal(0.1).div(player.devSpeed))
            if (new Decimal(data.cd).lte(0)) data.cd = new Decimal(0)
        }
    },
    upgrades: {
        11: {
            unlocked() {return true},
            title: "Energy drink",
            description: "x3 to energy",
            cost: new Decimal(1),
            currencyInternalName() { return "MMR" },
            currencyLocation() { return player[this.layer] },
            currencyDisplayName() { return "MMR" },
        },
        12: {
            unlocked() {return true},
            title: "Turbo rating",
            description: "x1.5 to game speed",
            cost: new Decimal(2),
            currencyInternalName() { return "MMR" },
            currencyLocation() { return player[this.layer] },
            currencyDisplayName() { return "MMR" },
        },
        13: {
            unlocked() {return true},
            title: "Harder games",
            description: "x5 to games requiments and to MMR gain",
            cost: new Decimal(3),
            currencyInternalName() { return "MMR" },
            currencyLocation() { return player[this.layer] },
            currencyDisplayName() { return "MMR" },
        },
        14: {
            unlocked() {return true},
            title: "INT money",
            description: "Money 5th upgrade boost better",
            cost: new Decimal(5),
            currencyInternalName() { return "MMR" },
            currencyLocation() { return player[this.layer] },
            currencyDisplayName() { return "MMR" },
        },
        15: {
            unlocked() {return true},
            title: "Harder games 2",
            description: "x5 to games requiments and to MMR gain",
            cost: new Decimal(10),
            currencyInternalName() { return "MMR" },
            currencyLocation() { return player[this.layer] },
            currencyDisplayName() { return "MMR" },
        },
        21: {
            unlocked() {return hasUpgrade("z", 15)},
            title: "Clisma",
            description: "divide poopChanceGain by 3",
            cost: new Decimal(25),
            currencyInternalName() { return "MMR" },
            currencyLocation() { return player[this.layer] },
            currencyDisplayName() { return "MMR" },
        },
        22: {
            unlocked() {return hasUpgrade("z", 15)},
            title: "IQ empower",
            description: "x2.2 to IQ",
            cost: new Decimal(25),
            currencyInternalName() { return "MMR" },
            currencyLocation() { return player[this.layer] },
            currencyDisplayName() { return "MMR" },
        },
        23: {
            unlocked() {return hasUpgrade("z", 15)},
            title: "Turbo Voin",
            description: "another x1.5 to game speed",
            cost: new Decimal(50),
            currencyInternalName() { return "MMR" },
            currencyLocation() { return player[this.layer] },
            currencyDisplayName() { return "MMR" },
        },
        24: {
            unlocked() {return hasUpgrade("z", 15)},
            title: "Harder games v3",
            description: "x5 to games requiments and x4 to MMR gain",
            cost: new Decimal(75),
            currencyInternalName() { return "MMR" },
            currencyLocation() { return player[this.layer] },
            currencyDisplayName() { return "MMR" },
        },
        25: {
            unlocked() {return hasUpgrade("z", 15)},
            title: "sleep",
            description: "x5 to energy gain",
            cost: new Decimal(100),
            currencyInternalName() { return "MMR" },
            currencyLocation() { return player[this.layer] },
            currencyDisplayName() { return "MMR" },
        },
        31: {
            unlocked() {return hasUpgrade("r", 22) && hasUpgrade("z", 25)},
            title: "raging on game",
            description: "MMR boosts rage and rage speed ^1.5",
            cost: new Decimal(5000),
            currencyInternalName() { return "MMR" },
            currencyLocation() { return player[this.layer] },
            currencyDisplayName() { return "MMR" },
            effect() {
                return new Decimal(player[this.layer].MMR).add(1).pow(5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, 31))+"x" },
        },
        32: {
            unlocked() {return hasUpgrade("z", 31) & tmp.z.tabFormat.ImmortalDraft.unlocked},
            title: "Buttplug",
            description: "Poopchance /30",
            cost: new Decimal(2.5e11),
            currencyInternalName() { return "MMR" },
            currencyLocation() { return player[this.layer] },
            currencyDisplayName() { return "MMR" },
        },
        33: {
            unlocked() {return hasUpgrade("z", 32)},
            title: "acts overflow",
            description: "total acts boosts energy",
            cost: new Decimal(1.25e12),
            currencyInternalName() { return "MMR" },
            currencyLocation() { return player[this.layer] },
            currencyDisplayName() { return "MMR" },
            effect() {
                return player.z.total.mul(2)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, 33))+"x" },
        },
        34: {
            unlocked() {return hasUpgrade("z", 33)},
            title: "MMR motivation",
            description: "MMR boosts energy",
            cost: new Decimal(4e12),
            currencyInternalName() { return "MMR" },
            currencyLocation() { return player[this.layer] },
            currencyDisplayName() { return "MMR" },
            effect() {
                return player.z.MMR.div(1e11).add(1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, 34))+"x" },
        },
        35: {
            unlocked() {return hasUpgrade("z", 34)},
            title: "skill result",
            description: "MMR boost based on skill",
            cost: new Decimal(1e13),
            currencyInternalName() { return "MMR" },
            currencyLocation() { return player[this.layer] },
            currencyDisplayName() { return "MMR" },
            effect() {
                return player.z.macro.add(player.z.micro).add(1).mul(5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, 35))+"x" },
        },
    },
    milestones: {
        0: {
            unlocked() {return hasMilestone("z", 0) },
            requirementDescription: "Micro level 5",
            effectDescription: "Auto play Dota",
            done() { return player.z.micro.gte(5) },
        },
    },
    buyables: {
        11: {
            title: "Time being",
            unlocked() {
                if (hasUpgrade("y", 36)) return true
                else return hasUpgrade("y", 36)
            },
            cost(x) { 
                return new Decimal(50).mul(new Decimal(x).add(1)) 
            },
            display() { return "Waste your acts to slow down time" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            purchaseLimit() {
                return new Decimal(10)
            },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            display() { 
                let data = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(data.cost) + " Acts\n\
                Amount: " + player[this.layer].buyables[this.id] + "/"+new Decimal(10)+"\n\
                Slow down time by  " + format(data.effect) + "x"
            },
            effect(x) { 
                return new Decimal(1.15).pow(x)
            }, 
            effectDisplay(x) { return format(buyableEffect(this.layer, this.id))+"x" },
        },
    },
})
