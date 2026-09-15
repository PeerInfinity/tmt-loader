addLayer("tp", {
    name: "tp", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "TP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    passiveGeneration() {
        if (hasAchievement("a", 262)) return (hasAchievement("a", 262)?1:0)
        if (hasMilestone("le", 3)) return (hasMilestone("le", 3)?1:0)
        if (hasAchievement("a", 231)) return (hasAchievement("a", 231)?0.05:0)
        },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["microtabs", "stuff"],
        ["blank", "25px"],
    ],
    tooltip(){
        return "<h3>Time Power</h3><br>" + format(player.tp.points) + " TP"
      },
      autoUpgrade() { if (hasAchievement("a" , 233)) return true},
      microtabs: {
        stuff: {
                        "Upgrades": {
                            unlocked() {return (hasAchievement("a", 11))},
                    content: [
                        ["blank", "15px"],
                        ["raw-html", () => `<h4 style="opacity:.5">Last layer before you unlock a new major layer!</h4>`],
                        ["upgrades", [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]]
                    ],
                },
            },
        },
        upgrades: {
            11: {
                title: "The Timer I (TP11)",
                description: "+40% Time Power",
                cost: new Decimal(2),
                    },
                12: {
                    title: "The Timer II (TP12)",
                    description: "+50% Time Power",
                    cost: new Decimal(3),
                    unlocked() {
                        return hasUpgrade("tp", 11)
                    
                    }
                        },
                        13: {
                            title: "The Time Limit Sacrifice (TP13)",
                            description: "+30% Time Power and 50x Sacrifice Points and Cells",
                            cost: new Decimal(5),
                            unlocked() {
                                return hasUpgrade("tp", 12)
                            
                            }
                                },
                                14: {
                                    title: "The Time Limit Sacrifice II (TP14)",
                                    description: "+40% Time Power and 10x Sacrifice Points and Cells",
                                    cost: new Decimal(10),
                                    unlocked() {
                                        return hasUpgrade("tp", 13)
                                    
                                    }
                                        },
                                        15: {
                                            title: "The Time Limit Sacrifice III (TP15)",
                                            description: "+60% Time Power and 3x Sacrifice Points",
                                            cost: new Decimal(30),
                                            unlocked() {
                                                return hasUpgrade("tp", 14)
                                            
                                            }
                                                },
                                                21: {
                                                    title: "The Timer III (TP21)",
                                                    description: "+50% Time Power again",
                                                    cost: new Decimal(60),
                                                    unlocked() {
                                                        return hasUpgrade("tp", 15)
                                                    
                                                    }
                                                        },
                                                        22: {
                                                            title: "Sacrifice Exponential (TP22)",
                                                            description: "100x Sacrifice Points",
                                                            cost: new Decimal(120),
                                                            unlocked() {
                                                                return hasUpgrade("tp", 21)
                                                            
                                                            }
                                                                },
                                                                23: {
                                                                    title: "The Time Limit Sacrifice IV (TP23)",
                                                                    description: "1.7x Time Power and 5x Sacrifice Points",
                                                                    cost: new Decimal(250),
                                                                    unlocked() {
                                                                        return hasUpgrade("tp", 22)
                                                                    
                                                                    }
                                                                        },
                                                                        24: {
                                                                            title: "The Time Limit Sacrifice V (TP24)",
                                                                            description: "2x Time Power, 20x Sacrifice Points and Cells",
                                                                            cost: new Decimal(600),
                                                                            unlocked() {
                                                                                return hasUpgrade("tp", 23)
                                                                            
                                                                            }
                                                                                },
                                                                                25: {
                                                                                    title: "The Time Limit Sacrifice VI (TP25)",
                                                                                    description: "1.5x Time Power, 50x Sacrifice Points and Cells",
                                                                                    cost: new Decimal(1e3),
                                                                                    unlocked() {
                                                                                        return hasUpgrade("tp", 24)
                                                                                    
                                                                                    }
                                                                                        },
                                                                                        31: {
                                                                                            title: "The Timer IV (TP31)",
                                                                                            description: "2.1x Time Power",
                                                                                            cost: new Decimal(2.5e3),
                                                                                            unlocked() {
                                                                                                return hasUpgrade("tp", 25)
                                                                                            
                                                                                            }
                                                                                                },
                                                                                                32: {
                                                                                                    title: "The Time Limit Sacrifice VII (TP32)",
                                                                                                    description: "1.3x Time Power, 20x Sacrifice Points and Cells",
                                                                                                    cost: new Decimal(1.75e4),
                                                                                                    unlocked() {
                                                                                                        return hasUpgrade("tp", 31)
                                                                                                    
                                                                                                    }
                                                                                                        },
                                                                                                        33: {
                                                                                                            title: "The Time Limit Sacrifice VIII (TP33)",
                                                                                                            description: "1.7x Time Power, 10x Sacrifice Points",
                                                                                                            cost: new Decimal(4e4),
                                                                                                            unlocked() {
                                                                                                                return hasUpgrade("tp", 32)
                                                                                                            
                                                                                                            }
                                                                                                                },
                                                                                                                34: {
                                                                                                                    title: "The Time Limit Sacrifice IX (TP34)",
                                                                                                                    description: "2x Time Power, 50x Sacrifice Points and Cells",
                                                                                                                    cost: new Decimal(1e5),
                                                                                                                    unlocked() {
                                                                                                                        return hasUpgrade("tp", 33)
                                                                                                                    
                                                                                                                    }
                                                                                                                        },
                                                                                                                        35: {
                                                                                                                            title: "The Time Limit Sacrifice X (TP35)",
                                                                                                                            description: "2x Time Power, 10x Sacrifice Points",
                                                                                                                            cost: new Decimal(3e5),
                                                                                                                            unlocked() {
                                                                                                                                return hasUpgrade("tp", 34)
                                                                                                                            
                                                                                                                            }
                                                                                                                                },
                                                                                                                                41: {
                                                                                                                                    title: "The Time Limit Sacrifice XI (TP41)",
                                                                                                                                    description: "1.3x Time Power, 100x Sacrifice Points",
                                                                                                                                    cost: new Decimal(1e6),
                                                                                                                                    unlocked() {
                                                                                                                                        return hasUpgrade("tp", 35)
                                                                                                                                    
                                                                                                                                    }
                                                                                                                                        },
                                                                                                                                        42: {
                                                                                                                                            title: "The Time Limit Sacrifice XII (TP42)",
                                                                                                                                            description: "2x Time Power, 14x Sacrifice Points",
                                                                                                                                            cost: new Decimal(2e6),
                                                                                                                                            unlocked() {
                                                                                                                                                return hasUpgrade("tp", 41)
                                                                                                                                            
                                                                                                                                            }
                                                                                                                                                },
                                                                                                                                                43: {
                                                                                                                                                    title: "The Time Limit Sacrifice XIII (TP43)",
                                                                                                                                                    description: "2.5x Time Power, 20x Sacrifice Points",
                                                                                                                                                    cost: new Decimal(4.5e6),
                                                                                                                                                    unlocked() {
                                                                                                                                                        return hasUpgrade("tp", 42)
                                                                                                                                                    
                                                                                                                                                    }
                                                                                                                                                        },
                                                                                                                                                        44: {
                                                                                                                                                            title: "The Time Limit Sacrifice XIV (TP44)",
                                                                                                                                                            description: "2.5x Time Power, 50x Sacrifice Points",
                                                                                                                                                            cost: new Decimal(1e7),
                                                                                                                                                            unlocked() {
                                                                                                                                                                return hasUpgrade("tp", 43)
                                                                                                                                                            
                                                                                                                                                            }
                                                                                                                                                                },
                                                                                                                                                                45: {
                                                                                                                                                                    title: "The Time Limit Sacrifice XV (TP45)",
                                                                                                                                                                    description: "4x Time Power, 100x Sacrifice Points",
                                                                                                                                                                    cost: new Decimal(2e7),
                                                                                                                                                                    unlocked() {
                                                                                                                                                                        return hasUpgrade("tp", 44)
                                                                                                                                                                    
                                                                                                                                                                    }
                                                                                                                                                                        },
                                                                                                                                                                        51: {
                                                                                                                                                                            title: "The Time Limit Sacrifice XVI (TP51)",
                                                                                                                                                                            description: "2x Time Power, 20x Sacrifice Points",
                                                                                                                                                                            cost: new Decimal(4e7),
                                                                                                                                                                            unlocked() {
                                                                                                                                                                                return hasUpgrade("tp", 45)
                                                                                                                                                                            
                                                                                                                                                                            }
                                                                                                                                                                                },
                                                                                                                                                                                52: {
                                                                                                                                                                                    title: "The Time Limit Sacrifice XVII (TP52)",
                                                                                                                                                                                    description: "2x Time Power, 10x Sacrifice Points",
                                                                                                                                                                                    cost: new Decimal(222222222),
                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                        return hasUpgrade("tp", 51)
                                                                                                                                                                                    
                                                                                                                                                                                    }
                                                                                                                                                                                        },
                                                                                                                                                                                        53: {
                                                                                                                                                                                            title: "The Time Limit Sacrifice XVIII (TP53)",
                                                                                                                                                                                            description: "2x Time Power, 30x Sacrifice Points",
                                                                                                                                                                                            cost: new Decimal(3e8),
                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                return hasUpgrade("tp", 52)
                                                                                                                                                                                            
                                                                                                                                                                                            }
                                                                                                                                                                                                },
                                                                                                                                                                                                54: {
                                                                                                                                                                                                    title: "The Time Limit Sacrifice XIX (TP54)",
                                                                                                                                                                                                    description: "3.5x Time Power, 120x Sacrifice Points",
                                                                                                                                                                                                    cost: new Decimal(8e8),
                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                        return hasUpgrade("tp", 53)
                                                                                                                                                                                                    
                                                                                                                                                                                                    }
                                                                                                                                                                                                        },
                                                                                                                                                                                                        55: {
                                                                                                                                                                                                            title: "The Time Limit Sacrifice XX (TP55)",
                                                                                                                                                                                                            description: "1.2x Time Power, 80x Sacrifice Points",
                                                                                                                                                                                                            cost: new Decimal(1e9),
                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                return hasUpgrade("tp", 54)
                                                                                                                                                                                                            
                                                                                                                                                                                                            }
                                                                                                                                                                                                                },
                                                                                                                                                                                                                61: {
                                                                                                                                                                                                                    title: "The Time Limit Sacrifice XXI (TP61)",
                                                                                                                                                                                                                    description: "3x Time Power, 20x Sacrifice Points",
                                                                                                                                                                                                                    cost: new Decimal(3e9),
                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                        return hasUpgrade("tp", 55)
                                                                                                                                                                                                                    
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                        },
                                                                                                                                                                                                                        62: {
                                                                                                                                                                                                                            title: "The Time Limit Sacrifice XXII (TP62)",
                                                                                                                                                                                                                            description: "2.5x Time Power, 50x Sacrifice Points",
                                                                                                                                                                                                                            cost: new Decimal(1e10),
                                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                                return hasUpgrade("tp", 61)
                                                                                                                                                                                                                            
                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                63: {
                                                                                                                                                                                                                                    title: "The Time Limit Sacrifice XXIII (TP63)",
                                                                                                                                                                                                                                    description: "2.5x Time Power, 100x Sacrifice Points",
                                                                                                                                                                                                                                    cost: new Decimal(4e10),
                                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                                        return hasUpgrade("tp", 62)
                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                        64: {
                                                                                                                                                                                                                                            title: "Risk (TP64)",
                                                                                                                                                                                                                                            description: "Make the Time Power req to e360 but divide TP gain by 1.05x",
                                                                                                                                                                                                                                            cost: new Decimal(1e11),
                                                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                                                return hasUpgrade("tp", 63)
                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                65: {
                                                                                                                                                                                                                                                    title: "The Time Limit Sacrifice XXIV (TP65)",
                                                                                                                                                                                                                                                    description: "4x Time Power, 50x Sacrifice Points",
                                                                                                                                                                                                                                                    cost: new Decimal(1e11),
                                                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                                                        return hasUpgrade("tp", 64)
                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                        71: {
                                                                                                                                                                                                                                                            title: "The Time Limit Sacrifice XXV (TP71)",
                                                                                                                                                                                                                                                            description: "2x Time Power, 10x Sacrifice Points",
                                                                                                                                                                                                                                                            cost: new Decimal(2.5e11),
                                                                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                                                                return hasUpgrade("tp", 65)
                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                72: {
                                                                                                                                                                                                                                                                    title: "The Time Limit Sacrifice XXVI (TP72)",
                                                                                                                                                                                                                                                                    description: "2.5x Time Power, 20x Sacrifice Points",
                                                                                                                                                                                                                                                                    cost: new Decimal(3.5e11),
                                                                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                                                                        return hasUpgrade("tp", 71)
                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                        73: {
                                                                                                                                                                                                                                                                            title: "The Time Limit Sacrifice XXVII (TP73)",
                                                                                                                                                                                                                                                                            description: "3x Time Power, 20x Sacrifice Points",
                                                                                                                                                                                                                                                                            cost: new Decimal(6e11),
                                                                                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                                                                                return hasUpgrade("tp", 72)
                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                74: {
                                                                                                                                                                                                                                                                                    title: "The Time Limit Sacrifice XXVIII (TP74)",
                                                                                                                                                                                                                                                                                    description: "2.5x Time Power, 20x Sacrifice Points",
                                                                                                                                                                                                                                                                                    cost: new Decimal(6.5e11),
                                                                                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                                                                                        return hasUpgrade("tp", 73)
                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                        75: {
                                                                                                                                                                                                                                                                                            title: "The Time Limit Sacrifice XXIX (TP75)",
                                                                                                                                                                                                                                                                                            description: "3x Time Power, 100x Sacrifice Points",
                                                                                                                                                                                                                                                                                            cost: new Decimal(1e12),
                                                                                                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                                                                                                return hasUpgrade("tp", 74)
                                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                                81: {
                                                                                                                                                                                                                                                                                                    title: "The Time Limit Sacrifice XXX (TP81)",
                                                                                                                                                                                                                                                                                                    description: "1.5x Time Power, 100x Sacrifice Points",
                                                                                                                                                                                                                                                                                                    cost: new Decimal(3e12),
                                                                                                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                                                                                                        return hasUpgrade("tp", 75)
                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                                        82: {
                                                                                                                                                                                                                                                                                                            title: "The Time Limit Sacrifice XXXI (TP82)",
                                                                                                                                                                                                                                                                                                            description: "2x Time Power, 230x Sacrifice Points",
                                                                                                                                                                                                                                                                                                            cost: new Decimal(1e13),
                                                                                                                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                                                                                                                return hasUpgrade("tp", 81)
                                                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                                                83: {
                                                                                                                                                                                                                                                                                                                    title: "The Time Limit Sacrifice XXXII (TP83)",
                                                                                                                                                                                                                                                                                                                    description: "1.5x Time Power, 200x Sacrifice Points",
                                                                                                                                                                                                                                                                                                                    cost: new Decimal(2.222e13),
                                                                                                                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                                                                                                                        return hasUpgrade("tp", 82)
                                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                                                        84: {
                                                                                                                                                                                                                                                                                                                            title: "The Time Limit Sacrifice XXXIII (TP84)",
                                                                                                                                                                                                                                                                                                                            description: "5x Time Power, 300x Sacrifice Points",
                                                                                                                                                                                                                                                                                                                            cost: new Decimal(5e13),
                                                                                                                                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                                                                                                                                return hasUpgrade("tp", 83)
                                                                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                                                                85: {
                                                                                                                                                                                                                                                                                                                                    title: "The Time Limit Sacrifice XXXIV (TP85)",
                                                                                                                                                                                                                                                                                                                                    description: "2x Time Power, 350x Sacrifice Points",
                                                                                                                                                                                                                                                                                                                                    cost: new Decimal(2.5e14),
                                                                                                                                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                                                                                                                                        return hasUpgrade("tp", 84)
                                                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                                                                        91: {
                                                                                                                                                                                                                                                                                                                                            title: "Risk II (TP91)",
                                                                                                                                                                                                                                                                                                                                            description: "Make the Time Power req to e320 but divide TP gain by 1.08x",
                                                                                                                                                                                                                                                                                                                                            cost: new Decimal(5e14),
                                                                                                                                                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                                                                                                                                                return hasUpgrade("tp", 85)
                                                                                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                                                                                92: {
                                                                                                                                                                                                                                                                                                                                                    title: "The Time Limit Sacrifice XXXV (TP92)",
                                                                                                                                                                                                                                                                                                                                                    description: "3x Time Power, 150x Sacrifice Points",
                                                                                                                                                                                                                                                                                                                                                    cost: new Decimal(5e14),
                                                                                                                                                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                                                                                                                                                        return hasUpgrade("tp", 91)
                                                                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                                                                                        93: {
                                                                                                                                                                                                                                                                                                                                                            title: "The Time Limit Sacrifice XXXVI (TP93)",
                                                                                                                                                                                                                                                                                                                                                            description: "2x Time Power, 130x Sacrifice Points",
                                                                                                                                                                                                                                                                                                                                                            cost: new Decimal(2e15),
                                                                                                                                                                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                                                                                                                                                                return hasUpgrade("tp", 92)
                                                                                                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                                                                                                94: {
                                                                                                                                                                                                                                                                                                                                                                    title: "The Time Limit Sacrifice XXXVII (TP94)",
                                                                                                                                                                                                                                                                                                                                                                    description: "3x Time Power, 200x Sacrifice Points",
                                                                                                                                                                                                                                                                                                                                                                    cost: new Decimal(1e16),
                                                                                                                                                                                                                                                                                                                                                                    unlocked() {
                                                                                                                                                                                                                                                                                                                                                                        return hasUpgrade("tp", 93)
                                                                                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                                                                                                        95: {
                                                                                                                                                                                                                                                                                                                                                                            title: "The Time Limit Sacrifice XXXVIII (TP95)",
                                                                                                                                                                                                                                                                                                                                                                            description: "2x Time Power, 500x Sacrifice Points",
                                                                                                                                                                                                                                                                                                                                                                            cost: new Decimal(2e16),
                                                                                                                                                                                                                                                                                                                                                                            unlocked() {
                                                                                                                                                                                                                                                                                                                                                                                return hasUpgrade("tp", 94)
                                                                                                                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                },
                                                                                                
                        },                                                                                                                                                                                                                                                                                                                                                                                 
    color: "#E10600",
    requires() {if (hasUpgrade("tp", 91)) return new Decimal("1e320")
    else if (hasUpgrade("tp", 64)) return new Decimal("1e360")
    else return new Decimal("1e400")},      resource: "Time Power", // Name of prestige currency
    baseResource: "Energy", // Name of resource prestige is based on
    baseAmount() {return player.e.points}, // Get the current amount of baseResource
    branches: ["c", "l"],
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: "eee1e-3008",    
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(5)
        if (hasUpgrade('tp', 11)) mult = mult.times(1.4)
        if (hasUpgrade('tp', 12)) mult = mult.times(1.5)
        if (hasUpgrade('tp', 13)) mult = mult.times(1.3)
        if (hasUpgrade('tp', 14)) mult = mult.times(1.4)
        if (hasUpgrade('scp', 115)) mult = mult.times(2)
        if (hasUpgrade('tp', 15)) mult = mult.times(1.6)
        if (hasUpgrade('tp', 21)) mult = mult.times(1.5)
        if (hasUpgrade('scp', 121)) mult = mult.times(12)
        if (hasUpgrade('tp', 23)) mult = mult.times(1.7)
        if (hasUpgrade('tp', 24)) mult = mult.times(2)
        if (hasUpgrade('tp', 25)) mult = mult.times(2)
        if (hasUpgrade('tp', 31)) mult = mult.times(2.1)
        if (hasUpgrade('scp', 122)) mult = mult.times(2)
        if (hasUpgrade('tp', 32)) mult = mult.times(1.3)
        if (hasUpgrade('tp', 33)) mult = mult.times(1.7)
        if (hasUpgrade('scp', 123)) mult = mult.times(3)
        if (hasUpgrade('tp', 34)) mult = mult.times(2)
        if (hasUpgrade('scp', 124)) mult = mult.times(4)
        if (hasUpgrade('tp', 35)) mult = mult.times(2)
        if (hasUpgrade('tp', 41)) mult = mult.times(1.3)
        if (hasUpgrade('scp', 125)) mult = mult.times(3)
        if (hasUpgrade('tp', 42)) mult = mult.times(2)
        if (hasUpgrade('tp', 43)) mult = mult.times(2.5)
        if (hasUpgrade('tp', 44)) mult = mult.times(2.5)
        if (hasUpgrade('tp', 45)) mult = mult.times(4)
        if (hasUpgrade('tp', 51)) mult = mult.times(2)
        if (hasUpgrade('tp', 52)) mult = mult.times(2)
        if (hasUpgrade('tp', 53)) mult = mult.times(2)
        if (hasUpgrade('tp', 54)) mult = mult.times(3.5)
        if (hasUpgrade('tp', 55)) mult = mult.times(1.2)
        if (hasUpgrade('tp', 61)) mult = mult.times(3)
        if (hasUpgrade('tp', 62)) mult = mult.times(2.5)
        if (hasUpgrade('tp', 63)) mult = mult.times(2.5)
        if (hasUpgrade('tp', 64)) mult = mult.times(0.95)
        if (hasUpgrade('tp', 65)) mult = mult.times(4)
        if (hasUpgrade('tp', 71)) mult = mult.times(2)
        if (hasUpgrade('tp', 72)) mult = mult.times(2.5)
        if (hasUpgrade('tp', 73)) mult = mult.times(3)
        if (hasUpgrade('tp', 74)) mult = mult.times(2.5)
        if (hasUpgrade('tp', 75)) mult = mult.times(3)
        if (hasUpgrade('tp', 81)) mult = mult.times(1.5)
        if (hasUpgrade('tp', 82)) mult = mult.times(2)
        if (hasUpgrade('tp', 83)) mult = mult.times(1.5)
        if (hasUpgrade('tp', 84)) mult = mult.times(5)
        if (hasUpgrade('tp', 85)) mult = mult.times(2)
        if (hasUpgrade('tp', 91)) mult = mult.times(0.92)
        if (hasUpgrade('tp', 92)) mult = mult.times(3)
        if (hasUpgrade('tp', 93)) mult = mult.times(2)
        if (hasUpgrade('tp', 94)) mult = mult.times(3)
        if (hasUpgrade('tp', 95)) mult = mult.times(2)
        if (hasUpgrade('scp', 131)) mult = mult.times(3)
        if (hasMilestone('le', 1)) mult = mult.times(3)
        if (hasUpgrade('le', 12)) mult = mult.times(upgradeEffect('le', 12))
        if (hasUpgrade('le', 14)) mult = mult.pow(1.3)
        if (hasUpgrade('le', 24)) mult = mult.times(upgradeEffect('le',24))
        if (hasUpgrade('le', 31)) mult = mult.times(upgradeEffect('le',31))
        if (hasUpgrade('le', 32)) mult = mult.times(upgradeEffect('le',32))
        if (hasUpgrade('le', 35)) mult = mult.times(upgradeEffect('le',35))
                                                        if (hasUpgrade('le', 43)) mult = mult.times(upgradeEffect('le',43))
                                                        mult = mult.times(buyableEffect('le', 11))
                                                                                                                        if (hasMilestone('st', 1)) mult = mult.times(250)
                                                                                                                                if (hasMilestone('st', 2)) mult = mult.times(1e11)
                                                                                                                                if (hasMilestone('st', 4)) mult = mult.times(100)
                                                                if (hasAchievement('a', 275)) mult = mult.times("1e8")
                                                                if (hasUpgrade('cp', 53)) mult = mult.pow(1.1)
if (hasUpgrade('cp', 83)) mult = mult.pow(1.2)
        if (inChallenge('dp', 11)) mult = mult.div(Infinity)
    if (hasUpgrade('rp', 12)) mult = mult.div(Infinity)

                                                                                                                                return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 5, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "T", description: "T: Reset for Time Power", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){if (hasUpgrade("rp", 12)) return false
    else return (hasChallenge("sa", 12) || player[this.layer].unlocked)},})

