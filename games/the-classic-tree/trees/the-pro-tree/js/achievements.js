addLayer("a", {
    
    startData() {
        return {
            unlocked: true,
			points: new EN(0),
        }
    },
    color: "yellow",
    symbol: "🏆",
    row: "side",
    layerShown() {
        return true
    },
    tooltip() {
        return ("Achievements")
    },
    achievements: {
        11: {
            name: "开始",
            done() {
                return player.points.gte(1)
            },
            tooltip: "获得 1 点数。<br>奖励：1 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(1)
			},
        },
        12: {
            name: "新的重置！",
            done() {
                return player.b.points.gte("1")
            },
            tooltip: "获得 <b>按钮力量</b>。<br>奖励：2 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(2)
			},
        },
        13: {
            name: "更多升级！",
            done() {
                if (hasUpgrade("p", 21)) return true
            },
            tooltip: "购买第 2 行的第一个升级<br>奖励：4 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(4)
			},
        },
        14: {
            name: "保留一些东西",
            done() {
                if (hasUpgrade("b", 21)) return true
            },
            tooltip: "购买按钮力量升级第 2 行的第一个升级。<br>奖励：8 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(8)
			},
        },
        15: {
            name: "古戈尔！",
            done() {
                return player.points.gte(1e100)
            },
            tooltip: "获得 1e100 点数。<br>奖励：16 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(16)
			},
        },
        16: {
            name: "又一个重置层！",
            done() {
                return player.ant.points.gte("1")
            },
            tooltip: "获得一只蚂蚁。<br>奖励：32 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(32)
			},
        },
        17: {
            name: "升级更多！",
            done() {
                if (hasUpgrade("ant", 21)) return true
            },
            tooltip: "购买蚂蚁升级第 2 行的第一个升级。<br>奖励：64 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(64)
			},
        },
        21: {
            name: "无穷",
            done() {
                return player.points.gte("1.80e308")
            },
            tooltip: "获得 1.80e308 点数。<br>奖励：128 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(128)
			},
        },
        22: {
            name: "1k 数量级",
            done() {
                return player.points.gte("1e1000")
            },
            tooltip: "获得 1e1,000 点数。<br>奖励：256 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(256)
			},
        },
        23: {
            name: "摸一摸草",
            done() {
                return player.g.points.gte("1")
            },
            tooltip: "获得 1 草。<br>奖励：500 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(512)
			},
        },
        24: {
            name: "不错",
            done() {
                return player.g.points.gte(69420)
            },
            tooltip: "获得 69,420 草。<br>奖励：1,024 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(1024)
			},
        },
        25: {
            name: "Millilion",
            done() {
                return player.points.gte("1e3003")
            },
            tooltip: "获得 1e3,003 点数。<br>奖励：2,048 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(2048)
			},
        },
		    26: {
            name: "还有更多层？！？",
            done() {
                return player.c.points.gte(1)
            },
            tooltip: "获得 1 杯子。<br>奖励：4,096 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(4096)
			},
        },
		        27: {
            name: "10k 数量级",
            done() {
                return player.points.gte("ee4")
            },
            tooltip: "获得 1e10,000 点数。<br>奖励：8,192 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(8192)
			},
				},
		        31: {
            name: "十的三十三次方草！",
            done() {
                return player.g.points.gte("e33")
            },
            tooltip: "获得 1e33 草。<br>奖励：16,384 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(16384)
			},
        },
		        32: {
            name: "掷骰",
            done() {
                return player.d.points.gte("1")
            },
            tooltip: "获得 1 骰子。<br>奖励：32,768 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(32768)
			},
        },
		        33: {
            name: "骰子里的最大数字！",
            done() {
                return player.d.points.gte("6")
            },
            tooltip: "获得 6 骰子。<br>奖励：65,536 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(65536)
			},
        },
		        34: {
            name: "古戈尔草",
            done() {
                return player.g.points.gte("1e100")
            },
            tooltip: "获得 1e100 草。<br>奖励：131,072 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(131072)
			},
        },
		
		        35: {
            name: "Myrillion 点数",
            done() {
                return player.points.gte("1e30003")
            },
            tooltip: "获得 1e30,003 点数。<br>奖励：262,144 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(262144)
			},
        },
		        36: {
            name: "更多草",
            done() {
                return player.g.points.gte("1e420")
            },
            tooltip: "获得 1e420 草<br>奖励：524,288 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(524288)
			},
        },
		        37: {
            name: "第 4 行！",
            done() {
                return player.f.points.gte("1")
            },
            tooltip: "获得 1 水果。<br>奖励：1,048,576 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(1048576)
			},
        },
		    41: {
            name: "充满挑战",
            done() {
                if (hasChallenge("b", 11)) return true
            },
            tooltip: "完成一个挑战。<br>奖励：2,097,152 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(2097152)
			},
        },
		        42: {
            name: "100k 数量级！",
            done() {
                return player.points.gte("1e100000")
            },
            tooltip: "获得 1e100,000 点数。<br>奖励：4,194,304 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(4194304)
			},
		},
		        43: {
            name: "激烈！",
            done() {
                if (hasChallenge("b", 13)) return true
            },
            tooltip: "完成第 3 个挑战。<br>奖励：8,388,608 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(8388608)
			},
		},
		        44: {
            name: "无穷杯子！",
            done() {
                return player.c.points.gte(1.79e308)
            },
            tooltip: "获得 1.80e308 杯子。<br>奖励：16,777,216 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(16777216)
			},
		},
		        45: {
            name: "Millilion 草！",
            done() {
                return player.g.points.gte("1e3003")
            },
            tooltip: "获得 1e3,003 草。<br>奖励：33,554,432 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(33554432)
			},
		},
		        46: {
            name: "黑暗水果？",
            done() {
                return player.f.points.gte("e50")
            },
            tooltip: "获得 1e50 水果。<br>奖励：67,108,864 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(67108864)
			},
		},
        47: {
            name: "Maximusmillion！",
            done() {
                return player.points.gte("ee6")
            },
            tooltip: "获得 1e1,000,000 点数。<br>奖励：137,217,728 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(134217728)
			},
		},
        51: {
            name: "一年",
            done() {
                return player.ant.points.gte("2023")
            },
            tooltip: "获得 2,023 蚂蚁。<br>奖励：268,435,456 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(268435456)
			},
		},
        52: {
            name: "无情",
            done() {
                if (hasChallenge("c", 11)) return true
            },
            tooltip: "完成第 1 个杯子挑战。<br>奖励：536,870,912 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(536870912)
			},
		},
        53: {
            name: "幸运 7",
            done() {
                return player.g.points.gte("7e7777")
            },
            tooltip: "获得 7e7,777 草。<br>奖励：1e9 飞升点数",
			onComplete() {
				return player.a.points = player.a.points.add(1e9)
			},
        },
        54: {
                name: "终于有新层了！",
                done() {
                    return player.e.points.gte("1")
                },
                tooltip: "获得 1 电。<br>奖励：1e10 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add(1e10)
                },
            },
            55: {
                name: "Micrillion！",
                done() {
                    return player.points.gte("1e3000003")
                },
                tooltip: "获得 1e3,000,003 点数。<br>奖励：1e11 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add(1e11)
                },
            },
            56: {
                name: "通货膨胀！？",
                done() {
                    return player.points.gte("ee7")
                },
                tooltip: "获得 1e10,000,000 点数。<br>奖励：1e12 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add(1e12)
                },
            },
            57: {
                name: "人民比点数还多！？！",
                done() {
                    return player.p.points.gte("ee8")
                },
                tooltip: "获得 1e100,000,000 人民。<br>奖励：1e13 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add(1e13)
                },
            },
            61: {
                name: "真快！",
                done() {
                    return player.h.points.gte("1")
                },
                tooltip: "获得 1 房屋。<br>奖励：1e14 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add(1e14)
                },
            },
            62: {
                name: "Maximusbillion！",
                done() {
                    return player.points.gte("ee9")
                },
                tooltip: "获得 e1e9 点数。<br>奖励：1e15 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add(1e15)
                },
            },
            63: {
                name: "Trialogue！",
                done() {
                    return player.points.gte("ee10")
                },
                tooltip: "获得 e1e10 点数。<br>奖励：1e16 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add(1e16)
                },
            },
            64: {
                name: "冰封",
                done() {
                    return player.i.points.gte("1")
                },
                tooltip: "获得 1 冰。<br>奖励：1e17 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add(1e17)
                },
            },
            65: {
                name: "Maximustrillion！",
                done() {
                    return player.points.gte("ee12")
                },
                tooltip: "获得 e1e12 点数。<br>奖励：1e18 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add(1e18)
                },
            },
            66: {
                name: "第二年",
                done() {
                    return player.d.points.gte("2024")
                },
                tooltip: "获得 2,024 骰子。<br>奖励：1e19 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add(1e19)
                },
            },
            67: {
                name: "大数字！",
                done() {
                    return player.points.gte("ee15")
                },
                tooltip: "获得 e1e15 点数。<br>奖励：1e20 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add(1e20)
                },
            },
            71: {
                name: "第 5 行！",
                done() {
                    return player.j.points.gte("1")
                },
                tooltip: "获得 1 铃铛。<br>奖励：1e23 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add(1e23)
                },
            },
            72: {
                name: "第三年",
                done() {
                    return player.e.points.gte("2025")
                },
                tooltip: "获得 2,025 电。<br>奖励：1e26 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add(1e26)
                },
            },
            73: {
                name: "世界之铃",
                done() {
                    return player.j.points.gte("1e10")
                },
                tooltip: "获得 1e10 铃铛。<br>奖励：1e29 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add(1e29)
                },
            },
            74: {
                name: "疯狂",
                done() {
                    if (hasChallenge("j", 11)) return true
                },
                tooltip: "完成第 1 个铃铛挑战。<br>奖励：1e32 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add(1e32)
                },
            },
            75: {
                name: "Maximusdecillion！",
                done() {
                    return player.points.gte("e1e33")
                },
                tooltip: "获得 e1e33 点数。<br>奖励：1e35 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add(1e35)
                },
            },
            76: {
                name: "第四年",
                done() {
                    return player.i.points.gte("2026")
                },
                tooltip: "获得 2,026 冰。<br>奖励：1e38 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add(1e38)
                },
            },
            77: {
                name: "古戈尔普勒克斯",
                done() {
                    return player.points.gte("e1e100")
                },
                tooltip: "获得 e1e100 点数。<br>奖励：1e41 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add(1e41)
                },
            },
            81: {
                name: "无穷^2",
                done() {
                    return player.points.gte("e1.80e308")
                },
                tooltip: "获得 e1.80e308 点数。<br>奖励：1e51 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add(1e51)
                },
            },
            82: {
                name: "什么时候有数量级^2？",
                done() {
                    return player.points.gte("e1e1000")
                },
                tooltip: "获得 e1e1,000 点数。<br>奖励：1e61 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add(1e61)
                },
            },
            83: {
                name: "Killillion 点数！",
                done() {
                    return player.points.gte("e1e3003")
                },
                tooltip: "获得 e1e3,003 点数。<br>奖励：1e100 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add(1e100)
                },
            },
            84: {
                name: "光年？",
                done() {
                    return player.ant.points.gte("1e2023")
                },
                tooltip: "获得 1e2,023 蚂蚁。<br>奖励：1e200 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add(1e200)
                },
            },
            85: {
                name: "大数字",
                done() {
                    return player.points.gte("eee4")
                },
                tooltip: "获得 e1e10,000 点数。<br>奖励：1e300 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add(1e300)
                },
            },
            86: {
                name: "非常大的数字！",
                done() {
                    return player.points.gte("ee1000000")
                },
                tooltip: "获得 e1e1,000,000 点数。<br>奖励：1e1,000 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add("1e1000")
                },
            },
            87: {
                name: "OMEGA 级大数字！",
                done() {
                    return player.points.gte("ee10000000000")
                },
                tooltip: "获得 ee1e10 点数。<br>奖励：1e10,000 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add("1e10000")
                },
            },
            91: {
                name: "上锁",
                done() {
                    return player.k.points.gte("1")
                },
                tooltip: "获得 1 钥匙。<br>奖励：1e5,000,000 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add("1e5000000")
                },
            },
            92: {
                name: "已经？",
                done() {
                    return player.k.points.gte("1.80e308")
                },
                tooltip: "获得 1.80e308 钥匙。<br>奖励：e1e10 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add("ee10")
                },
            },
            93: {
                name: "古戈尔二次普勒克斯",
                done() {
                    return player.points.gte("eee100")
                },
                tooltip: "获得 ee1e100 点数。<br>奖励：e1e69 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add("ee69")
                },
            },
            94: {
                name: "永无止境。",
                done() {
                    return player.l.points.gte("1")
                },
                tooltip: "获得 1 光。<br>奖励：e1e300 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add("ee300")
                },
            },
            95: {
                name: "极端",
                done() {
                    if (hasChallenge("j", 12)) return true
                },
                tooltip: "完成第 2 个铃铛挑战。<br>奖励：e1e1,000 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add("ee1000")
                },
            },
            96: {
                name: "Kalillion 点数！",
                done() {
                    return player.points.gte("eee3003")
                },
                tooltip: "获得 ee1e3,003 点数。<br>奖励：e1e3,003 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add("ee3003")
                },
            },
            97: {
                name: "黑暗？",
                done() {
                    return player.l.points.gte("1.80e308")
                },
                tooltip: "获得 1.80e308 光。<br>奖励：e1e5,000 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add("ee5000")
                },
            },
            101: {
                name: "值得",
                done() {
                    return player.m.points.gte("1")
                },
                tooltip: "获得 1 金钱。<br>奖励：e1e10,000 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add("ee10000")
                },
            },
            102: {
                name: "越来越接近 F 记数法",
                done() {
                    return player.points.gte("eeee9")
                },
                tooltip: "获得 eee1e9 点数。<br>奖励：ee1e10,000,000 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add("ee10000000")
                },
            },
            103: {
                name: "书本",
                done() {
                    return player.n.points.gte("1")
                },
                tooltip: "获得 1 笔记本。<br>奖励：ee1e10 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add("eee10")
                },
            },
            104: {
                name: "古戈尔三次普勒克斯",
                done() {
                    return player.points.gte("eeee100")
                },
                tooltip: "获得 eee1e100 点数。<br>奖励：ee1e100 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add("eee100")
                },
            },
            105: {
                name: "Hepillion 点数",
                done() {
                    return player.points.gte("eeee3003")
                },
                tooltip: "获得 eee1e3,003 点数。<br>奖励：ee1e1,000 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add("eee1000")
                },
            },
            106: {
                name: "快到了！",
                done() {
                    return player.points.gte("eeeee9")
                },
                tooltip: "获得 eeee1e9 点数。<br>奖励：ee1e10,000,000 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add("eeee7")
                },
            },
            107: {
                name: "F 记数法！",
                done() {
                    return player.points.gte("eeeee10")
                },
                tooltip: "获得 1F6 点数。<br>奖励：eee1e10 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add("eeee10")
                },
            },
            111: {
                name: "第 6 行！",
                done() {
                    return player.o.points.gte("1")
                },
                tooltip: "获得 1 洋葱。<br>奖励：eee1e11 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add("eeee11")
                },
            },
            112: {
                name: "自动升级！",
                done() {
                    if (hasUpgrade("o", 13)) return true
                },
                tooltip: "获得第 3 个洋葱升级。<br>奖励：eee1e12 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add("eeee12")
                },
            },
            113: {
                name: "最富有！",
                done() {
                    return player.m.points.gte("2e11")
                },
                tooltip: "获得 2.000e11 金钱。<br>奖励：eee1e14 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add("eeee14")
                },
            },
            114: {
                name: "可怕",
                done() {
                    if (hasChallenge("o", 11)) return true
                },
                tooltip: "完成第 1 个洋葱挑战。<br>奖励：eee1e18 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add("eeee18")
                },
            },
            115: {
            name: "第五年",
                done() {
                    return player.n.points.gte("2027")
                },
                tooltip: "获得 2,027 笔记本。<br>奖励：eee1e26 飞升点数",
                onComplete() {
                    return player.a.points = player.a.points.add("eeee26")
                },
            },
            116: {
                name: "什么时候循环？",
                    done() {
                        return player.q.points.gte("1")
                    },
                    tooltip: "获得 1 四边形。<br>奖励：1F6 飞升点数",
                    onComplete() {
                        return player.a.points = player.a.points.add("eeeee10")
                    },
                },
                117: {
                    name: "通货膨胀又来了！！？？",
                        done() {
                            return player.points.gte("eeeeeee10")
                        },
                        tooltip: "获得 1F8 点数。<br>奖励：2F6 飞升点数",
                        onComplete() {
                            return player.a.points = player.a.points.add("eeeee100")
                        },
                    },
                    121: {
                        name: "好多方块？",
                            done() {
                                return player.q.points.gte("e1.79e308")
                            },
                            tooltip: "获得 e1.79e308 四边形。<br>奖励：5F6 飞升点数",
                            onComplete() {
                                return player.a.points = player.a.points.add("eeeee100000")
                            },
                        },
                        122: {
                            name: "甲板",
                                done() {
                                    return player.points.gte("eeeeeeeee10")
                                },
                                tooltip: "获得 1F10 点数。<br>奖励：1F7 飞升点数",
                                onComplete() {
                                    return player.a.points = player.a.points.add("eeeeee10")
                                },
                            },
                            123: {
                                name: "圆",
                                    done() {
                                        return player.r.points.gte("1")
                                    },
                                    tooltip: "获得 1 戒指。<br>奖励：1F8 飞升点数",
                                    onComplete() {
                                        return player.a.points = player.a.points.add("eeeeeee10")
                                    },
                                },
                                124: {
                                    name: "钻石戒指？",
                                        done() {
                                            return player.r.points.gte("ee10")
                                        },
                                        tooltip: "获得 e1e10 戒指。<br>奖励：1.301F8 飞升点数",
                                        onComplete() {
                                            return player.a.points = player.a.points.add("eeeeeee20")
                                        },
                                    },
                                    125: {
                                        name: "光速",
                                            done() {
                                                return player.points.gte("eeeeeeeeeee10")
                                            },
                                            tooltip: "获得 1F12 点数。<br>奖励：1F9 飞升点数",
                                            onComplete() {
                                                return player.a.points = player.a.points.add("eeeeeeee10")
                                            },
                                        },
                                        126: {
                                            name: "灾难性",
                                            done() {
                                                if (hasChallenge("o", 11)) return true
                                            },
                                            tooltip: "完成第 6 个洋葱挑战。<br>奖励：1F10 飞升点数",
                                            onComplete() {
                                                return player.a.points = player.a.points.add("eeeeeeeee10")
                                            },
                                        },
                                        127: {
                                        name: "无穷大数字！",
                                            done() {
                                                return player.points.gte("eeeeeeeeeeeeeeeee10")
                                            },
                                            tooltip: "获得 1F18 点数。<br>奖励：1F13 飞升点数",
                                            onComplete() {
                                                return player.a.points = player.a.points.add("eeeeeeeeeeee10")
                                            },
                                        },
                                        131: {
                                            name: "沙漠",
                                                done() {
                                                    return player.s.points.gte("1")
                                                },
                                                tooltip: "获得 1 沙子。<br>奖励：1F14 飞升点数",
                                                onComplete() {
                                                    return player.a.points = player.a.points.add("eeeeeeeeeeeee10")
                                                },
                                            },
                                            132: {
                                                name: "子货币！",
                                                    done() {
                                                        return player.s.sanddunes.gte("1")
                                                    },
                                                    tooltip: "获得 1 沙丘。<br>奖励：1F15 飞升点数",
                                                    onComplete() {
                                                        return player.a.points = player.a.points.add("eeeeeeeeeeeeee10")
                                                    },
                                                },
                                                133: {
                                                    name: "购买！",
                                                        done() {
                                                            return player.s.buyables[11].gte("1")
                                                        },
                                                        tooltip: "获得第一个可购买项。<br>奖励：1F16 飞升点数",
                                                        onComplete() {
                                                            return player.a.points = player.a.points.add("eeeeeeeeeeeeeee10")
                                                        },
                                                    },
                                                    134: {
                                                        name: "自动购买！",
                                                            done() {
                                                                if (hasMilestone("s", 1)) return true
                                                            },
                                                            tooltip: "获得自动购买项。<br>奖励：1F18 飞升点数",
                                                            onComplete() {
                                                                return player.a.points = player.a.points.add("eeeeeeeeeeeeeeeee10")
                                                            },
                                                        },
                                                        135: {
                                                            name: "超级不错",
                                                                done() {
                                                                    return player.points.gte("10^^69")
                                                                },
                                                                tooltip: "获得 1F69 点数。<br>奖励：1F30 飞升点数",
                                                                onComplete() {
                                                                    return player.a.points = player.a.points.add("10^^30")
                                                                },
                                                            },
                                                            136: {
                                                                name: "天堂",
                                                                    done() {
                                                                        return player.t.points.gte("1")
                                                                    },
                                                                    tooltip: "获得 1 树。<br>奖励：1F33 飞升点数",
                                                                    onComplete() {
                                                                        return player.a.points = player.a.points.add("10^^33")
                                                                    },
                                                                },
                                                                137: {
                                                                    name: "#TeamTrees",
                                                                        done() {
                                                                            return player.t.points.gte("1.80e308")
                                                                        },
                                                                        tooltip: "获得 1.80e308 树。<br>奖励：1F36 飞升点数",
                                                                        onComplete() {
                                                                            return player.a.points = player.a.points.add("10^^36")
                                                                        },
                                                                    },
                                                                    141: {
                                                                        name: "Giggol",
                                                                            done() {
                                                                                return player.points.gte("10^^100")
                                                                            },
                                                                            tooltip: "获得 1F100 点数。<br>奖励：1F40 飞升点数",
                                                                            onComplete() {
                                                                                return player.a.points = player.a.points.add("10^^40")
                                                                            },
                                                                        },
                                                                        142: {
                                                                            name: "小永恒",
                                                                                done() {
                                                                                    return player.points.gte("10^^308")
                                                                                },
                                                                                tooltip: "获得 1F308 点数。<br>奖励：1F50 飞升点数",
                                                                                onComplete() {
                                                                                    return player.a.points = player.a.points.add("10^^50")
                                                                                },
                                                                            },
                                                                            143: {
                                                                                name: "神圣",
                                                                                    done() {
                                                                                        return player.points.gte("10^^1000")
                                                                                    },
                                                                                    tooltip: "获得 1F1,000 点数。<br>奖励：1F100 飞升点数",
                                                                                    onComplete() {
                                                                                        return player.a.points = player.a.points.add("10^^100")
                                                                                    },
                                                                                },
                                                                                144: {
                                                                                    name: "太空",
                                                                                        done() {
                                                                                            return player.u.points.gte("1")
                                                                                        },
                                                                                        tooltip: "获得 1 宇宙。<br>奖励：1F150 飞升点数",
                                                                                        onComplete() {
                                                                                            return player.a.points = player.a.points.add("10^^150")
                                                                                        },
                                                                                    },
                                                                                    145: {
                                                                                        name: "星系",
                                                                                            done() {
                                                                                                return player.u.stars.gte("1")
                                                                                            },
                                                                                            tooltip: "获得 1 星星。<br>奖励：1F200 飞升点数",
                                                                                            onComplete() {
                                                                                                return player.a.points = player.a.points.add("10^^200")
                                                                                            },
                                                                                        },
                                                                                        146: {
                                                                                            name: "多重宇宙？",
                                                                                                done() {
                                                                                                    return player.u.stars.gte("eee1.797e308")
                                                                                                },
                                                                                                tooltip: "获得 eee1.797e308 星星。<br>奖励：1F250 飞升点数",
                                                                                                onComplete() {
                                                                                                    return player.a.points = player.a.points.add("10^^250")
                                                                                                },
                                                                                            },
                                                                                            147: {
                                                                                                name: "500 个升级",
                                                                                                done() {
                                                                                                    if (hasUpgrade("t", 55)) return true
                                                                                                },
                                                                                                tooltip: "获得树的最后一个升级。<br>奖励：1F499 飞升点数",
                                                                                                onComplete() {
                                                                                                    return player.a.points = player.a.points.add("10^^499")
                                                                                                },
                                                                                            },
                                                                                            151: {
                                                                                                name: "超级不错",
                                                                                                    done() {
                                                                                                        return player.points.gte("10^^69420")
                                                                                                    },
                                                                                                    tooltip: "获得 1F69,420 点数。<br>奖励：1F666 飞升点数，并且 OU71 强 4,096 倍。",
                                                                                                    onComplete() {
                                                                                                        return player.a.points = player.a.points.add("10^^666")
                                                                                                    },
                                                                                                },
                                                                                                152: {
                                                                                                name: "天哪！",
                                                                                                    done() {
                                                                                                        return player.points.gte("10^^1000000")
                                                                                                    },
                                                                                                    tooltip: "获得 F1,000,000 点数。<br>奖励：1F1,000 飞升点数",
                                                                                                    onComplete() {
                                                                                                        return player.a.points = player.a.points.add("10^^1000")
                                                                                                    },
                                                                                                },
                                                                                                153: {
                                                                                                    name: "黑暗",
                                                                                                        done() {
                                                                                                            return player.v.points.gte("1")
                                                                                                        },
                                                                                                        tooltip: "获得 1 虚空。<br>奖励：1F2,000 飞升点数。",
                                                                                                        onComplete() {
                                                                                                            return player.a.points = player.a.points.add("10^^2000")
                                                                                                        },
                                                                                                    },
                                                                                                154: {
                                                                                                    name: "一个全新的世界 + 青铜",
                                                                                                        done() {
                                                                                                            return player.re.points.gte("1")
                                                                                                        },
                                                                                                        tooltip: "进行一个新重置层。<br>点数不再受成就点数加成。",
                                                                                                        onComplete() {
                                                                                                            return player.a.points = player.a.points.add("0")
                                                                                                        },
                                                                                                    },
                                                                                                    155: {
                                                                                                        name: "双 F",
                                                                                                            done() {
                                                                                                                return player.points.gte("10^^9e15")
                                                                                                            },
                                                                                                            tooltip: "获得 FF2.080 点数。",
                                                                                                            onComplete() {
                                                                                                                return player.a.points = player.a.points.add("0")
                                                                                                            },
                                                                                                        },
                                                                                                        156: {
                                                                                                    name: "砍树",
                                                                                                        done() {
                                                                                                            return player.w.total.gte("1")
                                                                                                        },
                                                                                                        tooltip: "获得 1 木头。",
                                                                                                        onComplete() {
                                                                                                            return player.a.points = player.a.points.add("0")
                                                                                                        },
                                                                                                    },
                                                                                                    157: {
                                                                                                        name: "还有更多升级！",
                                                                                                            done() {
                                                                                                                if (hasUpgrade("re", 55)) return true
                                                                                                            },
                                                                                                            tooltip: "获得轮回升级 55。",
                                                                                                            onComplete() {
                                                                                                                return player.a.points = player.a.points.add("0")
                                                                                                            },
                                                                                                        },
                                                                                                        161: {
                                                                                                            name: "黄色",
                                                                                                                done() {
                                                                                                                    if (hasUpgrade("re", 55)) return true
                                                                                                                },
                                                                                                                tooltip: "获得 1 徽章。",
                                                                                                                onComplete() {
                                                                                                                    return player.a.points = player.a.points.add("0")
                                                                                                                },
                                                                                                            },
                                                                                                        162: {
                                                                                                            name: "箭矢",
                                                                                                                done() {
                                                                                                                    return player.points.gte("10^^1e99")
                                                                                                                },
                                                                                                                tooltip: "获得 FF2.300 点数。",
                                                                                                                onComplete() {
                                                                                                                    return player.a.points = player.a.points.add("0")
                                                                                                                },
                                                                                                            },
                                                                                                        163: {
                                                                                                            name: "身体",
                                                                                                                done() {
                                                                                                                    return player.x.total.gte("1")
                                                                                                                },
                                                                                                                tooltip: "获得 1 X 射线。",
                                                                                                                onComplete() {
                                                                                                                    return player.a.points = player.a.points.add("0")
                                                                                                                },
                                                                                                            },
                                                                                                            164: {
                                                                                                                name: "EternityNum",
                                                                                                                    done() {
                                                                                                                        return player.points.gte("10^^1.79e308")
                                                                                                                    },
                                                                                                                    tooltip: "获得 FF2.396 点数。",
                                                                                                                    onComplete() {
                                                                                                                        return player.a.points = player.a.points.add("0")
                                                                                                                    },
                                                                                                                },
                                                                                                                165: {
                                                                                                                    name: "后院",
                                                                                                                        done() {
                                                                                                                            return player.y.total.gte("1")
                                                                                                                        },
                                                                                                                        tooltip: "获得 1 庭院。",
                                                                                                                        onComplete() {
                                                                                                                            return player.a.points = player.a.points.add("0")
                                                                                                                        },
                                                                                                                    },
                                                                                                                    166: {
                                                                                                                        name: "相当不错",
                                                                                                                            done() {
                                                                                                                                return player.points.gte("10^^1e1450")
                                                                                                                            },
                                                                                                                            tooltip: "获得 FF2.500 点数。",
                                                                                                                            onComplete() {
                                                                                                                                return player.a.points = player.a.points.add("0")
                                                                                                                            },
                                                                                                                        },
                                                                                                                        167: {
                                                                                                                            name: "白银",
                                                                                                                                done() {
                                                                                                                                    return player.re.points.gte("1e9")
                                                                                                                                },
                                                                                                                                tooltip: "获得 1.000e9 奖牌。",
                                                                                                                                onComplete() {
                                                                                                                                    return player.a.points = player.a.points.add("0")
                                                                                                                                },
                                                                                                                            },
                                                                                                                            171: {
                                                                                                                                name: "最后的动物名",
                                                                                                                                    done() {
                                                                                                                                        return player.z.total.gte("1")
                                                                                                                                    },
                                                                                                                                    tooltip: "获得 1 斑马。",
                                                                                                                                    onComplete() {
                                                                                                                                        return player.a.points = player.a.points.add("0")
                                                                                                                                    },
                                                                                                                                },
                                                                                                                                172: {
                                                                                                                                    name: "消失的货币",
                                                                                                                                        done() {
                                                                                                                                            if (hasUpgrade("z", 12)) return true
                                                                                                                                        },
                                                                                                                                        tooltip: "移除人民层。",
                                                                                                                                        onComplete() {
                                                                                                                                            return player.a.points = player.a.points.add("0")
                                                                                                                                        },
                                                                                                                                    },
                                                                                                                                    173: {
                                                                                                                                        name: "更多消失的货币",
                                                                                                                                            done() {
                                                                                                                                                if (hasUpgrade("z", 41)) return true
                                                                                                                                            },
                                                                                                                                            tooltip: "移除第 2 行到第 4 行的层。",
                                                                                                                                            onComplete() {
                                                                                                                                                return player.a.points = player.a.points.add("0")
                                                                                                                                            },
                                                                                                                                        },
                                                                                                                                        174: {
                                                                                                                                            name: "恐怖",
                                                                                                                                            done() {
                                                                                                                                                if (hasChallenge("z", 51)) return true
                                                                                                                                            },
                                                                                                                                            tooltip: "完成第 9 个斑马挑战。",
                                                                                                                                            onComplete() {
                                                                                                                                                return player.a.points = player.a.points.add("0")
                                                                                                                                            },
                                                                                                                                        },
                                                                                                                                        175: {
                                                                                                                                            name: "回到小数字？",
                                                                                                                                                done() {
                                                                                                                                                    if (hasUpgrade("z", 55)) return true
                                                                                                                                                },
                                                                                                                                                tooltip: "移除第 5 行的层。",
                                                                                                                                                onComplete() {
                                                                                                                                                    return player.a.points = player.a.points.add("0")
                                                                                                                                                },
                                                                                                                                            },
                                                                                                                                            176: {
                                                                                                                                                name: "五级幂",
                                                                                                                                                    done() {
                                                                                                                                                        if (hasUpgrade("re", 105)) return true
                                                                                                                                                    },
                                                                                                                                                    tooltip: "获得最后一个轮回升级。",
                                                                                                                                                    onComplete() {
                                                                                                                                                        return player.a.points = player.a.points.add("0")
                                                                                                                                                    },
                                                                                                                                                },
                                                                                                                                                177: {
                                                                                                                                                    name: "F 数量级^数量级",
                                                                                                                                                        done() {
                                                                                                                                                            return player.points.gte("10^^e1eeee10")
                                                                                                                                                        },
                                                                                                                                                        tooltip: "获得 FF6.000 点数。",
                                                                                                                                                        onComplete() {
                                                                                                                                                            return player.a.points = player.a.points.add("0")
                                                                                                                                                        },
                                                                                                                                                    },
                                                                                                                                                    181: {
                                                                                                                                                        name: "三重 F！",
                                                                                                                                                            done() {
                                                                                                                                                                return player.points.gte("10^^^3")
                                                                                                                                                            },
                                                                                                                                                            tooltip: "获得 FFF1.000 点数。",
                                                                                                                                                            onComplete() {
                                                                                                                                                                return player.a.points = player.a.points.add("0")
                                                                                                                                                            },
                                                                                                                                                        },
                                                                        
                                                                                                                                182: {
                                                                                                                                name: "路径",
                                                                                                                                    done() {
                                                                                                                                        return player.ar.total.gte("1")
                                                                                                                                    },
                                                                                                                                    tooltip: "获得 1 箭矢。",
                                                                                                                                    onComplete() {
                                                                                                                                        return player.a.points = player.a.points.add("0")
                                                                                                                                    },
                                                                                                                                },

                                                                                                                                    183: {
                                                                                                                                                    name: "FF 数量级^数量级",
                                                                                                                                                        done() {
                                                                                                                                                            return player.points.gte("10^^10^^9e15")
                                                                                                                                                        },
                                                                                                                                                        tooltip: "获得 FFF2.080 点数。",
                                                                                                                                                        onComplete() {
                                                                                                                                                            return player.a.points = player.a.points.add("0")
                                                                                                                                                        },
                                                                                                                                                    },
                                                                                                                                                    184: {
                                                                                                                                                    name: "EternityNum 数量级^数量级",
                                                                                                                                                        done() {
                                                                                                                                                            return player.points.gte("10^^10^^1.79e308")
                                                                                                                                                        },
                                                                                                                                                        tooltip: "获得 FFF2.396 点数。",
                                                                                                                                                        onComplete() {
                                                                                                                                                            return player.a.points = player.a.points.add("0")
                                                                                                                                                        },
                                                                                                                                                    },
                                                                                                                                                    185: {
                                                                                                                                    name: "四重 F！",
                                                                                                                                        done() {
                                                                                                                                            return player.points.gte("10^^^4")
                                                                                                                                        },
                                                                                                                                        tooltip: "获得 FFFF1.000 点数。",
                                                                                                                                        onComplete() {
                                                                                                                                            return player.a.points = player.a.points.add("0")
                                                                                                                                        },
                                                                                                                                    },
                                                                                                                                    186: {
                                                                                                                                        name: "足球",
                                                                                                                                            done() {
                                                                                                                                                return player.ba.total.gte("1")
                                                                                                                                            },
                                                                                                                                            tooltip: "获得 1 球。",
                                                                                                                                            onComplete() {
                                                                                                                                                return player.a.points = player.a.points.add("0")
                                                                                                                                            },
                                                                                                                                        },
                                                                                                                                        187: {
                                                                                                                                            name: "750 个升级",
                                                                                                                                            done() {
                                                                                                                                                if (hasUpgrade("ba", 55)) return true
                                                                                                                                            },
                                                                                                                                            tooltip: "获得球的最后一个升级。",
                                                                                                                                            onComplete() {
                                                                                                                                                return player.a.points = player.a.points.add("0")
                                                                                                                                            },
                                                                                                                                        },
                                                                                                                                        191: {
                                                                                                                                            name: "终极通货膨胀",
                                                                                                                                                done() {
                                                                                                                                                    if (hasUpgrade("re", 112)) return true
                                                                                                                                                },
                                                                                                                                                tooltip: "提升轮回升级 105 的效果。",
                                                                                                                                                onComplete() {
                                                                                                                                                    return player.a.points = player.a.points.add("0")
                                                                                                                                                },
                                                                                                                                            },
                                                                                                                                            192: {
                                                                                                                                                name: "免费成就",
                                                                                                                                                    done() {
                                                                                                                                                        if (hasAchievement("a",191)) return true
                                                                                                                                                    },
                                                                                                                                                    tooltip: "免费成就。",
                                                                                                                                                    onComplete() {
                                                                                                                                                        return player.a.points = player.a.points.add("0")
                                                                                                                                                    },
                                                                                                                                                },
                                                                                                                                                193: {
                                                                                                                                                    name: "G 记数法！",
                                                                                                                                                        done() {
                                                                                                                                                            return player.points.gte("10^^^5")
                                                                                                                                                        },
                                                                                                                                                        tooltip: "获得 1G5 点数。",
                                                                                                                                                        onComplete() {
                                                                                                                                                            return player.a.points = player.a.points.add("0")
                                                                                                                                                        },
                                                                                                                                                    },
                                                                                                                                            194: {
                                                                                                                                                name: "G 数量级^数量级",
                                                                                                                                                    done() {
                                                                                                                                                        return player.points.gte("10^^^6")
                                                                                                                                                    },
                                                                                                                                                    tooltip: "获得 1G6 点数！",
                                                                                                                                                    onComplete() {
                                                                                                                                                        return player.a.points = player.a.points.add("0")
                                                                                                                                                    },
                                                                                                                                                },
                                                                                                                                                195: {
                                                                                                                                                    name: "第 8 行！",
                                                                                                                                                        done() {
                                                                                                                                                            return player.ci.points.gte("1")
                                                                                                                                                        },
                                                                                                                                                        tooltip: "获得一个圆！",
                                                                                                                                                        onComplete() {
                                                                                                                                                            return player.a.points = player.a.points.add("0")
                                                                                                                                                        },
                                                                                                                                                    },
                                                                                                                                                    196: {
                                                                                                                                                        name: "黄金",
                                                                                                                                                            done() {
                                                                                                                                                                return player.re.points.gte("1e33")
                                                                                                                                                            },
                                                                                                                                                            tooltip: "获得 1.000e33 奖牌。",
                                                                                                                                                            onComplete() {
                                                                                                                                                                return player.a.points = player.a.points.add("0")
                                                                                                                                                            },
                                                                                                                                                        },
                                                                                                                                                        197: {
                                                                                                                                                            name: "新挑战？",
                                                                                                                                                                done() {
                                                                                                                                                                    if (hasUpgrade("re", 121)) return true
                                                                                                                                                                },
                                                                                                                                                                tooltip: "获得第 56 个轮回升级。",
                                                                                                                                                                onComplete() {
                                                                                                                                                                    return player.a.points = player.a.points.add("0")
                                                                                                                                                                },
                                                                                                                                                            },
                                                                                                                                                            201: {
                                                                                                                                                                name: "指数增长",
                                                                                                                                                                    done() {
                                                                                                                                                                        return player.points.gte("10^^^12")
                                                                                                                                                                    },
                                                                                                                                                                    tooltip: "获得 1G12 点数！",
                                                                                                                                                                    onComplete() {
                                                                                                                                                                        return player.a.points = player.a.points.add("0")
                                                                                                                                                                    },
                                                                                                                                                                },
                                                                                                                                                                202: {
                                                                                                                                                                    name: "不真实",
                                                                                                                                                                        done() {
                                                                                                                                                                            if (hasChallenge("re", 11)) return true
                                                                                                                                                                        },
                                                                                                                                                                        tooltip: "完成第 1 个轮回挑战。",
                                                                                                                                                                        onComplete() {
                                                                                                                                                                            return player.a.points = player.a.points.add("0")
                                                                                                                                                                        },
                                                                                                                                                                    },
                                                                                                                                                                    203: {
                                                                                                                                                                        name: "嘎嘎",
                                                                                                                                                                            done() {
                                                                                                                                                                                return player.du.points.gte("1")
                                                                                                                                                                            },
                                                                                                                                                                            tooltip: "获得一只鸭子！",
                                                                                                                                                                            onComplete() {
                                                                                                                                                                                return player.a.points = player.a.points.add("0")
                                                                                                                                                                            },
                                                                                                                                                                        },
                                                                                                                                                                        204: {
                                                                                                                                                                            name: "幸运 7 第二部分",
                                                                                                                                                                                done() {
                                                                                                                                                                                    if (hasUpgrade("du", 12)) return true
                                                                                                                                                                                },
                                                                                                                                                                                tooltip: "获得 777 个升级。",
                                                                                                                                                                                onComplete() {
                                                                                                                                                                                    return player.a.points = player.a.points.add("0")
                                                                                                                                                                                },
                                                                                                                                                                            },
                                                                                                                                                                            205: {
                                                                                                                                                                                name: "n i l",
                                                                                                                                                                                    done() {
                                                                                                                                                                                        if (hasChallenge("re", 31)) return true
                                                                                                                                                                                    },
                                                                                                                                                                                    tooltip: "完成第 5 个轮回挑战。",
                                                                                                                                                                                    onComplete() {
                                                                                                                                                                                        return player.a.points = player.a.points.add("0")
                                                                                                                                                                                    },
                                                                                                                                                                                },
                                                                                                                                                                                206: {
                                                                                                                                                                                    name: "鸡",
                                                                                                                                                                                        done() {
                                                                                                                                                                                            return player.eg.points.gte("1")
                                                                                                                                                                                        },
                                                                                                                                                                                        tooltip: "获得一个蛋！",
                                                                                                                                                                                        onComplete() {
                                                                                                                                                                                            return player.a.points = player.a.points.add("0")
                                                                                                                                                                                        },
                                                                                                                                                                                    },
                                                                                                                                                                                    207: {
                                                                                                                                                                                        name: "Gaggol",
                                                                                                                                                                                            done() {
                                                                                                                                                                                                return player.points.gte("10^^^100")
                                                                                                                                                                                            },
                                                                                                                                                                                            tooltip: "获得 1G100 点数！",
                                                                                                                                                                                            onComplete() {
                                                                                                                                                                                                return player.a.points = player.a.points.add("0")
                                                                                                                                                                                            },
                                                                                                                                                                                        },
                                                                                                                                                                                        211: {
                                                                                                                                                                                    name: "燃烧",
                                                                                                                                                                                        done() {
                                                                                                                                                                                            return player.fi.points.gte("1")
                                                                                                                                                                                        },
                                                                                                                                                                                        tooltip: "获得一团火！",
                                                                                                                                                                                        onComplete() {
                                                                                                                                                                                            return player.a.points = player.a.points.add("0")
                                                                                                                                                                                        },
                                                                                                                                                                                    },
                                                                                                                                                                                    212: {
                                                                                                                                                                                        name: "超强+++",
                                                                                                                                                                                            done() {
                                                                                                                                                                                                return player.points.gte("10^^^1000")
                                                                                                                                                                                            },
                                                                                                                                                                                            tooltip: "获得 1G1,000 点数！",
                                                                                                                                                                                            onComplete() {
                                                                                                                                                                                                return player.a.points = player.a.points.add("0")
                                                                                                                                                                                            },
                                                                                                                                                                                        },
                                                                                                                                                                                        213: {
                                                                                                                                                                                            name: "视频",
                                                                                                                                                                                                done() {
                                                                                                                                                                                                    return player.ga.points.gte("1")
                                                                                                                                                                                                },
                                                                                                                                                                                                tooltip: "获得一个游戏！",
                                                                                                                                                                                                onComplete() {
                                                                                                                                                                                                    return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                },
                                                                                                                                                                                            },
                                                                                                                                                                                            214: {
                                                                                                                                                                                                name: "轮回很快要消失？",
                                                                                                                                                                                                    done() {
                                                                                                                                                                                                        if (hasUpgrade("ga", 54)) return true
                                                                                                                                                                                                    },
                                                                                                                                                                                                    tooltip: "移除第 6 行的所有层。",
                                                                                                                                                                                                    onComplete() {
                                                                                                                                                                                                        return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                    },
                                                                                                                                                                                                },
                                                                                                                                                                                                215: {
                                                                                                                                                                                                    name: "超强^2",
                                                                                                                                                                                                        done() {
                                                                                                                                                                                                            return player.points.gte("10^^^1000000")
                                                                                                                                                                                                        },
                                                                                                                                                                                                        tooltip: "获得 G1,000,000 点数！",
                                                                                                                                                                                                        onComplete() {
                                                                                                                                                                                                            return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                        },
                                                                                                                                                                                                    },
                                                                                                                                                                                                    216: {
                                                                                                                                                                                                        name: "打破！",
                                                                                                                                                                                                            done() {
                                                                                                                                                                                                                return player.ha.points.gte("1")
                                                                                                                                                                                                            },
                                                                                                                                                                                                            tooltip: "获得一把锤子！",
                                                                                                                                                                                                            onComplete() {
                                                                                                                                                                                                                return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                            },
                                                                                                                                                                                                        },
                                                                                                                                                                                                        217: {
                                                                                                                                                                                                            name: "GG！",
                                                                                                                                                                                                                done() {
                                                                                                                                                                                                                    return player.points.gte("10^^^9.007e15")
                                                                                                                                                                                                                },
                                                                                                                                                                                                                tooltip: "获得 GG1.318 点数！",
                                                                                                                                                                                                                onComplete() {
                                                                                                                                                                                                                    return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                },
                                                                                                                                                                                                            },
                                                                                                                                                                                                            221: {
                                                                                                                                                                                                                name: "紧急情况！",
                                                                                                                                                                                                                    done() {
                                                                                                                                                                                                                        if (hasUpgrade("is", 31)) return true
                                                                                                                                                                                                                    },
                                                                                                                                                                                                                    tooltip: "获得 911 个升级。",
                                                                                                                                                                                                                    onComplete() {
                                                                                                                                                                                                                        return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                    },
                                                                                                                                                                                                                },
                                                                                                                                                                                                                222: {
                                                                                                                                                                                                                    name: "奖牌通货膨胀！",
                                                                                                                                                                                                                        done() {
                                                                                                                                                                                                                            return player.re.points.gte("1e1000")
                                                                                                                                                                                                                        },
                                                                                                                                                                                                                        tooltip: "获得 1e1,000 奖牌。",
                                                                                                                                                                                                                        onComplete() {
                                                                                                                                                                                                                            return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                        },
                                                                                                                                                                                                                    },
                                                                                                                                                                                                                    223: {
                                                                                                                                                                                                                        name: "铂金",
                                                                                                                                                                                                                            done() {
                                                                                                                                                                                                                                return player.re.points.gte("1e3003")
                                                                                                                                                                                                                            },
                                                                                                                                                                                                                            tooltip: "获得 1e3,003 奖牌。",
                                                                                                                                                                                                                            onComplete() {
                                                                                                                                                                                                                                return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                            },
                                                                                                                                                                                                                        },
                                                                                                                                                                                                                        224: {
                                                                                                                                                                                                                            name: "大沙滩",
                                                                                                                                                                                                                                done() {
                                                                                                                                                                                                                                    return player.is.points.gte("1")
                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                tooltip: "获得一座岛屿！",
                                                                                                                                                                                                                                onComplete() {
                                                                                                                                                                                                                                    return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                },
                                                                                                                                                                                                                            },
                                                                                                                                                                                                                            225: {
                                                                                                                                                                                                                                name: "有用",
                                                                                                                                                                                                                                    done() {
                                                                                                                                                                                                                                        return player.ju.points.gte("1")
                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                    tooltip: "获得一杯果汁！",
                                                                                                                                                                                                                                    onComplete() {
                                                                                                                                                                                                                                        return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                226: {
                                                                                                                                                                                                                                    name: "多次完成！",
                                                                                                                                                                                                                                        done() {
                                                                                                                                                                                                                                            if (hasUpgrade("re", 151)) return true
                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                        tooltip: "获得第 71 个轮回升级。",
                                                                                                                                                                                                                                        onComplete() {
                                                                                                                                                                                                                                            return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                    227: {
                                                                                                                                                                                                                                        name: "超级终极 OMEGA 破坏平衡",
                                                                                                                                                                                                                                            done() {
                                                                                                                                                                                                                                                if (hasUpgrade("re", 155)) return true
                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                            tooltip: "获得第 75 个轮回升级。",
                                                                                                                                                                                                                                            onComplete() {
                                                                                                                                                                                                                                                return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                    231: {
                                                                                                                                                                                                                                        name: "比社区树终点还大！",
                                                                                                                                                                                                                                            done() {
                                                                                                                                                                                                                                                return player.points.gte("10^^^10^^10")
                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                            tooltip: "获得 GG2.000 点数！",
                                                                                                                                                                                                                                            onComplete() {
                                                                                                                                                                                                                                                return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                        232: {
                                                                                                                                                                                                                                            name: "真正的树来了！",
                                                                                                                                                                                                                                                done() {
                                                                                                                                                                                                                                                    if (hasUpgrade("re", 161)) return true
                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                tooltip: "解锁一个新的子标签页。",
                                                                                                                                                                                                                                                onComplete() {
                                                                                                                                                                                                                                                    return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                            233: {
                                                                                                                                                                                                                                                name: "超级破坏平衡",
                                                                                                                                                                                                                                                    done() {
                                                                                                                                                                                                                                                        if (hasUpgrade("re", 202)) return true
                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                    tooltip: "获得徽章为奖牌获取赋能升级。",
                                                                                                                                                                                                                                                    onComplete() {
                                                                                                                                                                                                                                                        return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                234: {
                                                                                                                                                                                                                                                    name: "世界纪录被打破",
                                                                                                                                                                                                                                                        done() {
                                                                                                                                                                                                                                                            return player.re.points.gte("1e10000")
                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                        tooltip: "获得 1e10,000 奖牌。",
                                                                                                                                                                                                                                                        onComplete() {
                                                                                                                                                                                                                                                            return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                    235: {
                                                                                                                                                                                                                                                        name: "e̸r̶̥̓r̵̬̐o̷̠͒r̵̜͝",
                                                                                                                                                                                                                                                            done() {
                                                                                                                                                                                                                                                                if (hasChallenge("re", 81)) return true
                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                            tooltip: "完成第 15 个轮回挑战。<br>（救命！）",
                                                                                                                                                                                                                                                            onComplete() {
                                                                                                                                                                                                                                                                return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                        236: {
                                                                                                                                                                                                                                                            name: "哇",
                                                                                                                                                                                                                                                                done() {
                                                                                                                                                                                                                                                                    return player.points.gte("10^^^10^^10^^10")
                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                tooltip: "获得 GG3.000 点数！",
                                                                                                                                                                                                                                                                onComplete() {
                                                                                                                                                                                                                                                                    return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                            237: {
                                                                                                                                                                                                                                                                name: "又一个重置层？",
                                                                                                                                                                                                                                                                    done() {
                                                                                                                                                                                                                                                                        return player.su.points.gte("1")
                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                    tooltip: "进行一次超新星重置。<br>奖励：获得 x1.5 中子星。",
                                                                                                                                                                                                                                                                    onComplete() {
                                                                                                                                                                                                                                                                        return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                241: {
                                                                                                                                                                                                                                                                    name: "通往 Maximusmillion 奖牌的一半！",
                                                                                                                                                                                                                                                                        done() {
                                                                                                                                                                                                                                                                            return player.re.points.gte("1e500000")
                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                        tooltip: "获得 1e500,000 奖牌。",
                                                                                                                                                                                                                                                                        onComplete() {
                                                                                                                                                                                                                                                                            return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                    242: {
                                                                                                                                                                                                                                                                        name: "通往三重 G 的一半！",
                                                                                                                                                                                                                                                                            done() {
                                                                                                                                                                                                                                                                                return player.points.gte("10^^^10^^^5")
                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                            tooltip: "获得 GG5.000 点数！",
                                                                                                                                                                                                                                                                            onComplete() {
                                                                                                                                                                                                                                                                                return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                        243: {
                                                                                                                                                                                                                                                                            name: "矿石！",
                                                                                                                                                                                                                                                                                done() {
                                                                                                                                                                                                                                                                                    return player.su.stones.gte("1")
                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                tooltip: "获得 1 石头。",
                                                                                                                                                                                                                                                                                onComplete() {
                                                                                                                                                                                                                                                                                    return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                            244: {
                                                                                                                                                                                                                                                                        name: "三重 G！",
                                                                                                                                                                                                                                                                            done() {
                                                                                                                                                                                                                                                                                return player.points.gte("10^^^10^^^10")
                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                            tooltip: "获得 GGG1.000 点数。",
                                                                                                                                                                                                                                                                            onComplete() {
                                                                                                                                                                                                                                                                                return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                        245: {
                                                                                                                                                                                                                                                                            name: "等级！",
                                                                                                                                                                                                                                                                                done() {
                                                                                                                                                                                                                                                                                    return player.su.crystaltiers.gte("1")
                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                tooltip: "获得你的第一个水晶等级。",
                                                                                                                                                                                                                                                                                onComplete() {
                                                                                                                                                                                                                                                                                    return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                            246: {
                                                                                                                                                                                                                                                                            name: "级别！",
                                                                                                                                                                                                                                                                                done() {
                                                                                                                                                                                                                                                                                    return player.su.crystallevels.gte("1")
                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                tooltip: "获得你的第一个水晶级别。",
                                                                                                                                                                                                                                                                                onComplete() {
                                                                                                                                                                                                                                                                                    return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                            247: {
                                                                                                                                                                                                                                                                            name: "阶段！",
                                                                                                                                                                                                                                                                                done() {
                                                                                                                                                                                                                                                                                    return player.su.crystalstages.gte("1")
                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                tooltip: "获得你的第一个水晶阶段。",
                                                                                                                                                                                                                                                                                onComplete() {
                                                                                                                                                                                                                                                                                    return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                            251: {
                                                                                                                                                                                                                                                                                name: "第 1,000 个升级！",
                                                                                                                                                                                                                                                                                    done() {
                                                                                                                                                                                                                                                                                        if (hasUpgrade("su", 535)) return true
                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                    tooltip: "获得第 1,000 个升级和最后一个超新星升级。",
                                                                                                                                                                                                                                                                                    onComplete() {
                                                                                                                                                                                                                                                                                        return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                252: {
                                                                                                                                                                                                                                                                                    name: "基本上没有层剩下了。",
                                                                                                                                                                                                                                                                                        done() {
                                                                                                                                                                                                                                                                                            if (hasUpgrade("su", 535)) return true
                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                        tooltip: "移除第 6 行到第 7 行的层（不包括虚空）。",
                                                                                                                                                                                                                                                                                        onComplete() {
                                                                                                                                                                                                                                                                                            return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                     253: {
                                                                                                                                                                                                                                                                            name: "游戏还没有结束……",
                                                                                                                                                                                                                                                                                done() {
                                                                                                                                                                                                                                                                                    return player.sa.points.gte("1")
                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                tooltip: "进行你的第一次牺牲重置。",
                                                                                                                                                                                                                                                                                onComplete() {
                                                                                                                                                                                                                                                                                    return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                            254: {
                                                                                                                                                                                                                                                                                name: "点数终于又开始增长了。",
                                                                                                                                                                                                                                                                                    done() {
                                                                                                                                                                                                                                                                                        return player.points.gte("10^^^10^^^10^^10")
                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                    tooltip: "获得 GGG2.000 点数。",
                                                                                                                                                                                                                                                                                    onComplete() {
                                                                                                                                                                                                                                                                                        return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                255: {
                                                                                                                                                                                                                                                                                    name: "四重 G！",
                                                                                                                                                                                                                                                                                        done() {
                                                                                                                                                                                                                                                                                            return player.points.gte("10^^^^4")
                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                        tooltip: "获得 GGGG1.000 点数。",
                                                                                                                                                                                                                                                                                        onComplete() {
                                                                                                                                                                                                                                                                                            return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                     256: {
                                                                                                                                                                                                                                                                            name: "超越？？？",
                                                                                                                                                                                                                                                                                done() {
                                                                                                                                                                                                                                                                                    return player.sa.points.gte("1e100")
                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                tooltip: "获得一个古戈尔 SP。",
                                                                                                                                                                                                                                                                                onComplete() {
                                                                                                                                                                                                                                                                                    return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                            257: {
                                                                                                                                                                                                                                                                                name: "2^10 个升级！",
                                                                                                                                                                                                                                                                                    done() {
                                                                                                                                                                                                                                                                                        if (hasUpgrade("sa", 54)) return true
                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                    tooltip: "购买 1,024 个升级！",
                                                                                                                                                                                                                                                                                    onComplete() {
                                                                                                                                                                                                                                                                                        return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                261: {
                                                                                                                                                                                                                                                                                name: "挑战还没有结束……",
                                                                                                                                                                                                                                                                                    done() {
                                                                                                                                                                                                                                                                                        return player.sa.challengepoint.gte("1")
                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                    tooltip: "获得你的第一个挑战点……",
                                                                                                                                                                                                                                                                                    onComplete() {
                                                                                                                                                                                                                                                                                        return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                262: {
                                                                                                                                                                                                                                                                                    name: "太难了",
                                                                                                                                                                                                                                                                                        done() {
                                                                                                                                                                                                                                                                                            if (hasChallenge("sa", 13)) return true
                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                        tooltip: "完成第 3 个牺牲挑战。",
                                                                                                                                                                                                                                                                                        onComplete() {
                                                                                                                                                                                                                                                                                            return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                    263: {
                                                                                                                                                                                                                                                                                        name: "充能。",
                                                                                                                                                                                                                                                                                            done() {
                                                                                                                                                                                                                                                                                                return player.sa.challengepower.gte("1")
                                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                                            tooltip: "获得你的第一个挑战力量……",
                                                                                                                                                                                                                                                                                            onComplete() {
                                                                                                                                                                                                                                                                                                return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                        264: {
                                                                                                                                                                                                                                                                                            name: "通货膨胀回归？",
                                                                                                                                                                                                                                                                                                done() {
                                                                                                                                                                                                                                                                                                    return player.sa.challengeexp.gte("1")
                                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                                tooltip: "获得你的第一个挑战指数。",
                                                                                                                                                                                                                                                                                                onComplete() {
                                                                                                                                                                                                                                                                                                    return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                                            265: {
                                                                                                                                                                                                                                                                                                name: "H 点数！！！！",
                                                                                                                                                                                                                                                                                                    done() {
                                                                                                                                                                                                                                                                                                        return player.points.gte("10^^^^5")
                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                    tooltip: "获得 1.000H5 点数。",
                                                                                                                                                                                                                                                                                                    onComplete() {
                                                                                                                                                                                                                                                                                                        return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                                266: {
                                                                                                                                                                                                                                                                                                    name: "挑战的类型？",
                                                                                                                                                                                                                                                                                                        done() {
                                                                                                                                                                                                                                                                                                            return player.sa.challengetet.gte("1")
                                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                                        tooltip: "获得你的第一个挑战迭代幂。",
                                                                                                                                                                                                                                                                                                        onComplete() {
                                                                                                                                                                                                                                                                                                            return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                267: {
                                                                                                                                                                                                                                                                                                    name: "终点还远着呢……",
                                                                                                                                                                                                                                                                                                        done() {
                                                                                                                                                                                                                                                                                                            return player.sa.challengepent.gte("1")
                                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                                        tooltip: "获得你的第一个挑战五级数。",
                                                                                                                                                                                                                                                                                                        onComplete() {
                                                                                                                                                                                                                                                                                                            return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                    271: {
                                                                                                                                                                                                                                                                                                name: "五级幂级别的破坏平衡。",
                                                                                                                                                                                                                                                                                                    done() {
                                                                                                                                                                                                                                                                                                        return player.points.gte("10^^^^10")
                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                    tooltip: "获得 1.000H10 点数。",
                                                                                                                                                                                                                                                                                                    onComplete() {
                                                                                                                                                                                                                                                                                                        return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                                272: {
                                                                                                                                                                                                                                                                                                    name: "GEGGOL 点数",
                                                                                                                                                                                                                                                                                                        done() {
                                                                                                                                                                                                                                                                                                            return player.points.gte("10^^^^100")
                                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                                        tooltip: "获得 1.000H100 点数。",
                                                                                                                                                                                                                                                                                                        onComplete() {
                                                                                                                                                                                                                                                                                                            return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                                    273: {
                                                                                                                                                                                                                                                                                                        name: "不。",
                                                                                                                                                                                                                                                                                                            done() {
                                                                                                                                                                                                                                                                                                                if (hasChallenge("sa", 42)) return true
                                                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                                                            tooltip: "完成最后一个牺牲挑战。",
                                                                                                                                                                                                                                                                                                            onComplete() {
                                                                                                                                                                                                                                                                                                                return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                                        274: {
                                                                                                                                                                                                                                                                                name: "1,028 很有趣！",
                                                                                                                                                                                                                                                                                    done() {
                                                                                                                                                                                                                                                                                        if (hasUpgrade("ap", 13)) return true
                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                    tooltip: "购买 1,028 个升级！",
                                                                                                                                                                                                                                                                                    onComplete() {
                                                                                                                                                                                                                                                                                        return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                275: {
                                                                                                                                                                                                                                                                                    name: "没命玩",
                                                                                                                                                                                                                                                                                        done() {
                                                                                                                                                                                                                                                                                            return player.points.gte("10^^^^1000")
                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                        tooltip: "获得 1H1,000 点数。<br>奖励：终点。",
                                                                                                                                                                                                                                                                                        onComplete() {
                                                                                                                                                                                                                                                                                            return player.a.points = player.a.points.add("0")
                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                            

    },
    tabFormat: ["blank", ["display-text", function() {
        return "<h3 style='color: yellow;'>成就： " + player.a.achievements.length + "/" + (Object.keys(tmp.a.achievements).length - 2) + "</h4><br>你拥有 <h2 style='color: yellow; text-shadow: 0 0 10px yellow'>" + format(player.a.points) + "</h3> 成就点数。<br><h4 style='color: #ffffff;'>为点数获取提供 x" + format(player.a.points.add(1).pow(0.56).pow(player.a.points.sub(1e61).max(1))) + "。</h3><br>" + "<h4 style='color: grey;'>该效果在 1e61 飞升点数时大幅增强。" + "</h4>"
    }
    ], "blank", "blank", "achievements", ],
}, )