addLayer("A", {
    name: "Achievement",
	startData() { return {unlocked: true}},
	color: "#ffff00",
	symbol: "A",
	row: "side",
	position: 0,
	layerShown() { return true },
    tooltip: "Achievements", 
    achievements: {
        11: {
            name: "First",
            tooltip:"Get the first upgrade, reward: point x1.25 ",
            done()  {
                if (hasUpgrade('N',11)) return true
            }
        },
        12: {
            name: "Super click",
            tooltip:"Get the fourth upgrade, reward: Number x3.",
            done()  {
                if (hasUpgrade('N',14)) return true
            }
        },
        13: {
            name: "Factor",
            tooltip:"Get 1 factor.",
            done()  {
                if (hasMilestone('F',1)) return true
            }       
         },
         14: {
            name: "Challenged",
           tooltip:"complete / factor. Reward: Number x2.",
            done()  {
                if (hasChallenge('F',11)) return true
            }
        },
        15: {
            name: "Automation",
            tooltip:"Get 5 factors.",
            done()  {
                if (hasMilestone('F',5)) return true
            }
        },
        16: {
            name: "Ten Upgrade",
            tooltip:"Get 10 upgrade.",
            done()  {
                if (hasUpgrade('N',23)) return true
            }
        },
        17: {
            name: "More and more",
            tooltip:"Get 1 upgrade factor.",
            done()  {
                if (hasMilestone('UF',1)) return true
            }
        },
  
        21: {
            name: "Base++",
            tooltip:"Get 12 Number upgrade.",
            done()  {
                if (hasUpgrade('N',32)) return true
            }
        },
        22: {
            name: "Buyable challenge?",
            tooltip:"Complete Buyable upgrader once.",
            done()  {
                if (challengeCompletions('UF', 11)>=1) return true
            }
        },
        23: {
            name: "Buyable challenge!",
            tooltip:"Complete Buyable upgrader three times.",
            done()  {
                if (challengeCompletions('UF', 11)>=3) return true
            }
        },
        24: {
            name: "~2^10 factor",
            tooltip:"Get 1000 factor",
            done()  {
                if (hasMilestone('F', 1000)) return true
            }
        },
        25: {
            name: "one to fifteen",
            tooltip:"Get 15 Number upgrade",
            done()  {
                if (hasUpgrade('N', 35)) return true
            }
        },
        26: {
            name: "Super Challenged",
            tooltip:"Complete Super 3 in 1",
            done()  {
                if (hasChallenge('F', 43)) return true
            }
        },
      
        27: {
            name: "Inflatity",
            tooltip:"Get 1 Infinity.",
            done()  {
                if (hasMilestone('I', 1)) return true
            }
        },
        31:{
            name: "Omega Cheaper",
            tooltip:"Get 18 Number Upgrade, reward: Number x5.",
            done()  {
                if (hasUpgrade('N',43)) return true
            },
            unlocked(){
                return (hasMilestone('I',1)||hasMilestone('MS',1)||player.X.points.gte(1))
            }
        },
        32:{
            name: "Second infinity",
            tooltip:"Get 2 Infinity, reward: Unlock 1 upgrade.",
            done()  {
                if (hasMilestone('I',2)) return true
            },
            unlocked(){
                return (hasMilestone('I',1)||hasMilestone('MS',1)||player.X.points.gte(1))
            }
        },
        33:{
            name: "Free Infinity",
            tooltip:"Get 3 Infinity.",
            done()  {
                if (hasMilestone('I',3)) return true
            },
            unlocked(){
                return (hasMilestone('I',1)||hasMilestone('MS',1)||player.X.points.gte(1))
            }
        },
        34:{
            name: "True Infinity",
            tooltip:"Get 1.8e308 point.",
            done()  {
                if (player.points.gte(1.79e308)) return true
            },
            unlocked(){
                return (hasMilestone('I',1)||hasMilestone('MS',1)||player.X.points.gte(1))
            }
        },
        35:{
            name: "Impossible?",
            tooltip:"Get 1.8e258 Number in IC2, reward: Number x1e50 in Row 1, 3 Infinity Challenge.",
            done()  {
                if (player.N.points.gte(1.79e258)&&inChallenge('I',12)) return true
            },
            unlocked(){
                return (hasMilestone('I',1)||hasMilestone('MS',1)||player.X.points.gte(1))
            }
        },  
        36:{
            name: "OM",
            tooltip:"Get 1 Factor shift.",
            done()  {
                if (player.FS.points.gte(1)) return true
            },
            unlocked(){
                return (hasMilestone('I',1)||hasMilestone('MS',1)||player.X.points.gte(1))
            }
        },  
        37:{
            name: "I find the miss one!",
            tooltip:"Get '-3'",
            done()  {
                if (hasUpgrade('NN',13)) return true
            },
            unlocked(){
                return (hasMilestone('I',1)||hasMilestone('MS',1)||player.X.points.gte(1))
            }
        },  
        41:{
            name: "Don't forget achievements",
            tooltip:"Get 1e50 Negative numbers in IC5, reward: Unlock 1 Number buyable.",
            done()  {
                if (player.NN.points.gte(1e50)&&inChallenge('I',31)) return true
            },
            unlocked(){
                return (hasMilestone('I',1)||hasMilestone('MS',1)||player.X.points.gte(1))
            }
        },  
        42:{
            name: "I forget achievements",
            tooltip:"Get 1 Infinity point.",
            done()  {
                if (player.IP.points.gte(1)) return true
            },
            unlocked(){
                return (hasMilestone('I',1)||hasMilestone('MS',1)||player.X.points.gte(1))
            }
        },  
        43:{
            name: "twofinity challenge",
            tooltip:"Complete Infinity Point challenge 1",
            done()  {
                if (hasChallenge('IP',11)) return true
            },
            unlocked(){
                return (hasMilestone('I',1)||hasMilestone('MS',1)||player.X.points.gte(1))
            }
        },  
        44:{
            name: "Nine egg",
            tooltip:"Get IP upgrade 33.",
            done()  {
                if (hasUpgrade('IP',33)) return true
            },
            unlocked(){
                return (hasMilestone('I',1)||hasMilestone('MS',1)||player.X.points.gte(1))
            }
        },  
        45:{
            name: "Omega Upgrade",
            tooltip:"Get 23 Factor Upgrade. Reward: Number x1e5",
            done()  {
                if (hasUpgrade('F',36)) return true
            },
            unlocked(){
                return (hasMilestone('I',1)||hasMilestone('MS',1)||player.X.points.gte(1))
            }
        }, 
        46:{
            name: "Don't forget achievements again.",
            tooltip:"Get 1e25000 Number in IC3. Reward: Unlock 1 Infinity challenge.",
            done()  {
                if (player.N.points.gte("1e25000")&&inChallenge('I',21))  return true
            },
            unlocked(){
                return (hasMilestone('I',1)||hasMilestone('MS',1)||player.X.points.gte(1))
            }
        }, 
        47:{
            name: "+ - x / ^",
            tooltip:"Get 1 Mathematics Symbol. Reward: Always keep factor shift milestone on reset.",
            done()  {
                if (hasMilestone('MS',1))  return true
            },
            unlocked(){
                return (hasMilestone('I',1)||hasMilestone('MS',1)||player.X.points.gte(1))
            }
        }, 
        51:{
            name: "Five 1",
            tooltip:"Get e11111 IP, reward: IP gain ^1.05 and x 1e40",
            done()  {
                if (player.IP.points.gte("1e11111"))  return true
            },
            unlocked(){
                return hasMilestone('MS',1)||player.X.points.gte(1)
            }
        }, 
        52:{
            name: "The first layer",
            tooltip:"Get 1 prestige point.",
            done()  {
                if (player.MS.Prestige.gte("1"))  return true
            },
            unlocked(){
                return hasMilestone('MS',1)||player.X.points.gte(1)
            }
        }, 
        53:{
            name: "Over Cheaper",
            tooltip:"Complete NNC4.",
            done()  {
                if (hasChallenge('NN',22))  return true
            },
            unlocked(){
                return hasMilestone('MS',1)||player.X.points.gte(1)
            }
        }, 
        54:{
            name: "The sixth row layer",
            tooltip:"Get 1 super prestige point.",
            done()  {
                if (player.MS.Prestige2.gte("1"))  return true
            },
            unlocked(){
                return hasMilestone('MS',1)||player.X.points.gte(1)
            }
        },
            55:{
                name: "Infinity time",
                tooltip:"Get 1 Eternity point.",
                done()  {
                    if (player.E.points.gte("1"))  return true
                },
                unlocked(){
                    return hasMilestone('MS',1)||player.X.points.gte(1)
                }
        }, 
        56:{
            name: "- NN",
            tooltip:"Complete NNC6.",
            done()  {
                if (hasChallenge('NN',32))  return true
            },
            unlocked(){
                return hasMilestone('MS',1)||player.X.points.gte(1)
            }
    }, 
    57:{
        name: "Feature Factor",
        tooltip:"Get the '-' upgrade in UF layer.",
        done()  {
            if (hasUpgrade('UF',32))  return true
        },
        unlocked(){
            return hasMilestone('MS',1)||player.X.points.gte(1)
        }
},
61:{
    name: "True OM",
    tooltip:"Get 1 Ordinal.",
    done()  {
        if (hasMilestone('O',1))  return true
    },
    unlocked(){
        return hasMilestone('O',1)||hasMilestone('M',1)||player.X.points.gte(1)
    }
},
62:{
    name: "Mathematician",
    tooltip:"Get 1 Mathematician.",
    done()  {
        if (hasMilestone('M',1))  return true
    },
    unlocked(){
        return hasMilestone('O',1)||hasMilestone('M',1)||player.X.points.gte(1)
    }
},
63:{
    name: "get Both",
    tooltip:"Get 1 Ordinal  Mathematician.",
    done()  {
        if (hasMilestone('M',1)&&hasMilestone('O',1))  return true
    },
    unlocked(){
        return hasMilestone('O',1)||hasMilestone('M',1)||player.X.points.gte(1)
    }
},

64:{
    name: "ω boost",
    tooltip:"Do ω once.",
    done()  {
        if (hasMilestone('M',1)&&hasMilestone('O',1))  return true
    },
    unlocked(){
        return hasMilestone('O',1)||hasMilestone('M',1)||player.X.points.gte(1)
    }
},
65:{
    name: "Speed",
    tooltip:"Make game speed >1.",
    done()  {
        if (hasMilestone('MS',8e29))  return true
    },
    unlocked(){
        return hasMilestone('O',1)||hasMilestone('M',1)||player.X.points.gte(1)
    }
},
66:{
    name: "Tickspeed from AD",
    tooltip:"Unlock tickspeed.",
    done()  {
        if (hasUpgrade('UF',43))  return true
    },
    unlocked(){
        return hasMilestone('O',1)||hasMilestone('M',1)||player.X.points.gte(1)
    }
},
67:{
    name: "The greatest shapes",
    tooltip:"Get 1 shapes.",
    done()  {
        if (hasMilestone('S',1))  return true
    },
    unlocked(){
        return hasMilestone('O',1)||hasMilestone('M',1)||player.X.points.gte(1)
    }
},
71:{
    name: "A new game",
    tooltip:"Get 1 ???.",
    done()  {
        if (player.X.points.gte(1))  return true
    },
    unlocked(){
        return player.X.points.gte(1)
    }
},
72:{
    name: "Non upgraded upgrade factor",
    tooltip:"Get 1 upgrade factor with 1 ???.",
    done()  {
        if (player.X.points.gte(1)&&player.UF.points.gte(1))  return true
    },
    unlocked(){
        return player.X.points.gte(1)
    }
},
73:{
    name: "Infinity X",
    tooltip:"Get 1 Infinity with 1 ???.",
    done()  {
        if (player.X.points.gte(1)&&player.I.points.gte(1))  return true
    },
    unlocked(){
        return player.X.points.gte(1)
    }
},
74:{
    name: "Negative help us",
    tooltip:"Reach 1.8e308 points with 1 ???. Reward: Unlock '-3' earlier",
    done()  {
        if (player.X.points.gte(1)&&player.points.gte("1.8e308"))  return true
    },
    unlocked(){
        return player.X.points.gte(1)
    }
},
75:{
    name: "OM rewritten",
    tooltip:"Reach 1 Factor Shift with 1 ???.",
    done()  {
        if (player.X.points.gte(1)&&player.FS.points.gte("1"))  return true
    },
    unlocked(){
        return player.X.points.gte(1)
    }
},
76:{
    name: "Infinityal",
    tooltip:"Complete a Infinity challenge with 1 ???.",
    done()  {
        if (player.X.points.gte(1)&&challengeCompletions("I",71)>=1)  return true
    },
    unlocked(){
        return player.X.points.gte(1)
    }
},
77:{
    name: "New things",
    tooltip:"Get 1 zero",
    done()  {
        if (player.X.points.gte(1)&&player.Z.points.gte(1))  return true
    },
    unlocked(){
        return player.X.points.gte(1)
    }
},
    }

    
})