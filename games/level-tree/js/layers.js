addLayer("t", {
    name: "Training",
    symbol: "T",
    position: 0,
    row: 0,
    color: "#26FF00",
    resource: "Training",
    baseResource: "Exp",
    baseAmount() { return player.points },
    requires: new Decimal(10),
    type: "normal",
    exponent: 0.5,
    layerShown() { return true },

    startData() { 
        return {
            unlocked: true,
            points: new Decimal(0),
        }
    },
    gainMult() {
        let mult = new Decimal(1);
        if (hasUpgrade('t', 24)) mult = mult.times(upgradeEffect('t', 24));
        if (hasUpgrade('t', 25)) mult = mult.times(upgradeEffect('t', 25));

        if (hasUpgrade('l', 22)) mult = mult.times(upgradeEffect('l', 22));
        if (hasUpgrade('l', 25)) mult = mult.times(upgradeEffect('l', 25));
        
        if (hasUpgrade('m', 22)) mult = mult.times(layers.m.effect());

        mult = mult.times(layers.c.effect());
        return mult;
    },
    gainExp() {
        return new Decimal(1);
    },
    passiveGeneration() {
        if (hasUpgrade('l', 23)) return upgradeEffect('l', 23).div(100);
    },

    upgrades: {
        21: { 
            fullDisplay() {
                return `<span style="font-size: 14px;">-T11-</span><br>
                        ${hasUpgrade('l', 24) ? 
                            `Boost <span class="Expcs">Exp </span> gain by <br><span class="Tracs">Tra </span> ${hasUpgrade('p', 25) ? '<span class="Phycs">Phy </span><span class="Medcs">Med</span>' : ''} upgrades<br><br>` : 
                            'x2 <span class="Expcs">Exp</span> gain<br><br><br><br>'}
                        x${format(this.effect())} <span class="Expcs">Exp</span><br><br>
                        Cost: ${format(this.cost(), true)} <span class="Tracs">Tra</span>
                    `;
            },
            cost() {return new Decimal(2).times(player.c.c1up)},
            effect() {
                let eff = new Decimal(2);
                if (hasUpgrade('l', 24)) eff = eff.add(upgradeEffect('l', 24));
                if (hasUpgrade('p', 25)) eff = eff.add(upgradeEffect('p', 25));
                return eff;
            },
            unlocked() {
                if(player.a.points.gte(1)) { return true }//デフォ
                if(inChallenge("c", 12)) { return true }//C12
             },
            onPurchase() { if (inChallenge('c', 12)) { player.c.c1up = player.c.c1up.times(10) }}//C12
        },
        22: { 
            fullDisplay() {
                return `<span style="font-size: 14px;">-T12-</span><br>
                        <span class="Expcs">Exp</span> boosts <span class="Expcs">Exp</span> gain<br><br><br>
                        x${format(this.effect())} <span class="Expcs">Exp</span><br><br>
                        Cost: ${format(this.cost(),true)} <span class="Tracs">Tra</span>
                    `;
            },
            cost() {return new Decimal(2).times(player.c.c1up)},
            effect() { return player.points.add(1).pow(0.06) },
            unlocked() {
                if(hasUpgrade("t", 21)) { return true }//デフォ
                if(inChallenge("c", 12)) { return true }//C12
             },
            onPurchase() { if (inChallenge('c', 12)) { player.c.c1up = player.c.c1up.times(10) }}//C12
        },
        23: { 
            fullDisplay() {
                return `<span style="font-size: 14px;">-T13-</span><br>
                        <span class="Tracs">Tra</span> boosts <span class="Expcs">Exp</span> gain<br><br><br>
                        x${format(this.effect())} <span class="Expcs">Exp</span><br><br>
                        Cost: ${format(this.cost(),true)} <span class="Tracs">Tra</span>
                    `;
            },
            cost() {return new Decimal(3).times(player.c.c1up)},
            effect() { return player.t.points.add(2).pow(0.1) },
            unlocked() {
                if(hasUpgrade("t", 22)) { return true }//デフォ
                if(inChallenge("c", 12)) { return true }//C12
             },
            onPurchase() { if (inChallenge('c', 12)) { player.c.c1up = player.c.c1up.times(10) }}//C12
        },
        24: { 
            fullDisplay() {
                return `<span style="font-size: 14px;">-T14-</span><br>
                        <span class="Tracs">Tra</span> boosts <span class="Tracs">Tra</span> gain<br><br><br>
                        x${format(this.effect())} <span class="Tracs">Tra</span><br><br>
                        Cost: ${format(this.cost(),true)} <span class="Tracs">Tra</span>
                    `;
            },
            cost() {return new Decimal(17).times(player.c.c1up)},
            effect() { return player.t.points.add(2).pow(0.04) },
            unlocked() {
                if(player.l.points.gte(1) && hasUpgrade("t", 23)) { return true }//デフォ
                if(inChallenge("c", 12)) { return true }//C12
             },
            onPurchase() { if (inChallenge('c', 12)) { player.c.c1up = player.c.c1up.times(10) }}//C12
        },
        25: { 
            fullDisplay() {
                return `<span style="font-size: 14px;">-T15-</span><br>
                        x4 <span class="Tracs">Tra</span> gain<br><br><br><br>
                        x${format(this.effect())} <span class="Tracs">Tra</span><br><br>
                        Cost: ${format(this.cost(),true)} <span class="Tracs">Tra</span>
                    `;
            },
            cost() {return new Decimal(90).times(player.c.c1up)},
            effect() { return 4 },
            unlocked() {
                if(hasUpgrade("t", 24)) { return true }//デフォ
                if(inChallenge("c", 12)) { return true }//C12
             },
            onPurchase() { if (inChallenge('c', 12)) { player.c.c1up = player.c.c1up.times(10) }}//C12
        },
        26: { 
            fullDisplay() {
                return `<span style="font-size: 14px;">-T16-</span><br>
                        x6 <span class="Expcs">Exp</span> gain<br><br><br><br>
                        x${format(this.effect())} <span class="Expcs">Exp</span><br><br>
                        Cost: ${format(this.cost(),true)} <span class="Tracs">Tra</span>
                    `;
            },
            cost() {return new Decimal(1111).times(player.c.c1up)},
            effect() { return 6 },
            unlocked() {
                if(hasMilestone("m", 1) && hasUpgrade("t", 25)) { return true }//デフォ
                if(inChallenge("c", 12)) { return true }//C12
             },
            onPurchase() { if (inChallenge('c', 12)) { player.c.c1up = player.c.c1up.times(10) }}//C12
        },
        27: { 
            fullDisplay() {
                return `<span style="font-size: 14px;">-T17-</span><br>
                        Unlock new <span class="Tracs">Training buyable</span><br><br><br><br><br>
                        Cost: ${format(this.cost(),true)} <span class="Tracs">Tra</span>
                    `;
            },
            cost() { return new Decimal(hasUpgrade("p", 23) ? new Decimal(1).times(player.c.c1up) : new Decimal("1e100").times(player.c.c1up)) },
            unlocked() {
                if(hasMilestone("m", 1) && hasUpgrade("t", 26)) { return true }//デフォ
                if(inChallenge("c", 12)) { return true }//C12
             },
            onPurchase() { if (inChallenge('c', 12)) { player.c.c1up = player.c.c1up.times(10) }}//C12
        },
        31: { 
            fullDisplay() {
                return `<span style="font-size: 14px;">-T21-</span><br>
                        +0.4 to <span class="Tracs">-TB1-</span> base effect<br><br><br><br><br>
                        Cost: ${format(this.cost(),true)} <span class="Tracs">Tra</span>
                    `;
            },
            cost() { return new Decimal("5.00e11").times(player.c.c1up) },
            unlocked() {
                if(hasUpgrade("l", 32) && hasUpgrade("t", 27)) { return true }//デフォ
                if(hasUpgrade("l", 32) && inChallenge("c", 12)) { return true }//C12
             },
            onPurchase() { if (inChallenge('c', 12)) { player.c.c1up = player.c.c1up.times(10) }}//C12
        },
        32: { 
            fullDisplay() {
                return `<span style="font-size: 14px;">-T22-</span><br>
                        Divide <span class="Medcs">Med</span> cost by your all <span class="Tracs">Training buyables</span><br><br>
                        /${format(this.effect())} <span class="Medcs">Med cost</span><br><br>
                        Cost: ${format(this.cost(),true)} <span class="Tracs">Tra</span>
                    `;
            },
            effect() { return player.t.buyables[11].add(player.t.buyables[12]).add(player.t.buyables[13].times(3)) },
            cost() { return new Decimal("1.00e13").times(player.c.c1up) },
            unlocked() {
                if(hasUpgrade("l", 32) && hasUpgrade("t", 27)) { return true }//デフォ
                if(hasUpgrade("l", 32) && inChallenge("c", 12)) { return true }//C12
             },
            onPurchase() { if (inChallenge('c', 12)) { player.c.c1up = player.c.c1up.times(10) }}//C12
        },
        33: { 
            fullDisplay() {
                return `<span style="font-size: 14px;">-T23-</span><br>
                        Divide <span class="Medcs">Med</span> cost by your all <span class="Tracs">Training buyables</span><br><br>
                        /${format(this.effect())} <span class="Medcs">Med cost</span><br><br>
                        Cost: ${format(this.cost(),true)} <span class="Tracs">Tra</span>
                    `;
            },
            effect() { return player.t.buyables[11].add(player.t.buyables[12]).add(player.t.buyables[13].times(3)) },
            cost() { return new Decimal("2.00e100").times(player.c.c1up) },
            unlocked() {
                if(hasUpgrade("l", 32) && hasUpgrade("t", 27)) { return true }//デフォ
                if(hasUpgrade("l", 32) && inChallenge("c", 12)) { return true }//C12
             },
            onPurchase() { if (inChallenge('c', 12)) { player.c.c1up = player.c.c1up.times(10) }}//C12
        },
    },

    buyables: {
        11: {
            title: "-TB1-",
            cost(x) {
                let cost = Decimal.pow(11, x).times(player.c.c1up);
                if (hasUpgrade('p', 21)) { cost = cost.div(upgradeEffect('p', 21)) }
                return cost.ceil();
            },
            effect(x) {
                let eff = hasUpgrade("t", 31) ? 2.4 : 2;
                return Decimal.pow(eff, x.add(player.t.buyables[13]));
            },
            display() {
                let eff = hasUpgrade("t", 31) ? 2.4 : 2;
                let addT = player.t.buyables[13].gte(1) ? `+${format(player.t.buyables[13], true)}` : "";
                return `x${format(eff)} <span class="Expcs">Exp</span> gain<br><br><br>
                        <span style="font-size: 14px;">Amount</span>: ${format(player.t.buyables[11], true)}${addT}
                        x${format(tmp.t.buyables[11].effect)} <span class="Expcs">Exp</span><br>
                        Cost: ${format(tmp.t.buyables[11].cost, true)} <span class="Tracs">Tra</span>`;
            },
            canAfford() {
                return player.t.points.gte(tmp.t.buyables[11].cost);
            },
            buy() {
                let cost = this.cost();
                if (hasMilestone('p', 3)) cost = cost.div(2); // リソース計算
                if (!hasMilestone('p', 7)) player.t.points = player.t.points.sub(cost); // リソースからコストを減算
                if (inChallenge('c', 12)) player.c.c1up = player.c.c1up.times(10); // C12デバフ計算
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
            },
            unlocked() {
                return hasUpgrade("l", 21);
            },
            style: { 'height': '150px', 'width': '150px', 'font-size': '12px' },
        },
        12: {
            title: "-TB2-",
            cost(x) {
                let cost = Decimal.pow(x.add(1), x.add(1)).times(player.c.c1up);

                if (hasUpgrade('p', 22)) {
                    cost = cost.div(upgradeEffect('p', 22));
                }
                return cost.ceil();
            },
            effect(x) {
                let eff = new Decimal(x.add(player.t.buyables[13]))
                if (hasMilestone("c", 0)) eff = eff.times(2)
                return eff
            },
            display() {
                let addT = "";
                if (player.t.buyables[13].gte(1)) { 
                    addT = `+${format(player.t.buyables[13],true)}`
                }
                return `Gain <span class="Tracs">Tra</span> per second<br><br><br>
                        <span style="font-size: 14px;">Amount</span>: ${format(player.t.buyables[12],true)}${addT}
                        <span class="Tracs">Tra</span>: +${format(tmp.t.buyables[12].effect)}%/s<br>
                        Cost: ${format(tmp.t.buyables[12].cost,true)} <span class="Tracs">Tra</span>
                    `;
            },
            canAfford() { return player.t.points.gte(tmp.t.buyables[12].cost) },
            buy() {
                let cost = this.cost();

                if (hasMilestone('p', 4)) { cost = cost.div(2) }//リソース計算
                if (!hasMilestone('p', 8)) { player.t.points = player.t.points.sub(cost);}//リソースからコストを減算
                if (inChallenge('c', 12)) { player.c.c1up = player.c.c1up.times(10) }//C12デバフ計算
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
            },
            unlocked() { return hasMilestone('p', 1) },
            style: { 'height': '150px', 'width': '150px', 'font-size': '12px' },
        },
        13: {
            title: "-TB3-",
            cost(x) {
                let coss = new Decimal(x.gte(1) ? Decimal.pow(1000, x).times(player.c.c1up) : new Decimal(1).times(player.c.c1up));
                return coss.ceil();
            },
            effect(x) {
                return new Decimal.add(x);
            },
            display() {
                return `Add <span class="Tracs">TB1</span> and <span class="Tracs">TB2</span><br>for free<br><br>
                        <span style="font-size: 14px;">Amount</span>: ${format(player.t.buyables[13],true)}
                        +${format(tmp.t.buyables[13].effect,true)} <span class="Tracs">TB1</span> and <span class="Tracs">TB2</span><br>
                        Cost: ${format(tmp.t.buyables[13].cost,true)} <span class="Tracs">Tra</span>
                    `;
            },
            canAfford() { return player.t.points.gte(tmp.t.buyables[13].cost) },
            buy() {
                let cost = this.cost();

                player.t.points = player.t.points.sub(cost);//リソースからコストを減算
                if (inChallenge('c', 12)) { player.c.c1up = player.c.c1up.times(10) }//C12デバフ計算
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
            },
            unlocked() { return hasUpgrade('t', 27) },
            style: { 'height': '150px', 'width': '150px', 'font-size': '12px' },
        },
    },

    automate() {
        if (tmp.t.buyables[11].canAfford && player.m.autoTB1) {//TB1自動購入
            addBuyables('t', 11, 1);
            if (inChallenge('c', 12)) { player.c.c1up = player.c.c1up.times(10) }//C12デバフ計算

            let ca = 0;

            if (hasMilestone('p', 3)) { ca = 1; }
            if (hasMilestone('p', 7)) { ca = 2; }
            switch (ca) {
                case 0:
                    player.t.points = player.t.points.sub(tmp.t.buyables[11].cost);
                    break;
                case 1:
                    player.t.points = player.t.points.sub(tmp.t.buyables[11].cost.div(2));
                    break;
                case 2:
                    //消費なし
                    break;
            }
        }
        if (tmp.t.buyables[12].canAfford && player.m.autoTB2) {//TB2自動購入
            addBuyables('t', 12, 1);
            if (inChallenge('c', 12)) { player.c.c1up = player.c.c1up.times(10) }//C12デバフ計算
            
            let ca = 0;
            if (hasMilestone('p', 4)) { ca = 1; }
            if (hasMilestone('p', 8)) { ca = 2; }
            switch (ca) {
                case 0:
                    player.t.points = player.t.points.sub(tmp.t.buyables[12].cost);
                    break;
                case 1:
                    player.t.points = player.t.points.sub(tmp.t.buyables[12].cost.div(2));
                    break;
                case 2:
                    //消費なし
                    break;
            }
        }
    },

    tabFormat: [
        "main-display",
        "prestige-button",
        "blank",
        ["display-text", function() {
            if (hasUpgrade('l', 23)) {
                return 'Gain ' + format(upgradeEffect('l', 23)) + '% per second';
            }
        }],
        "blank",
        "buyables",
        "blank",
        "upgrades"
    ],

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            layerDataReset(this.layer);
            if (player.m.points.gte(1)) player.t.upgrades.push("21");
            if (player.m.points.gte(2)) player.t.upgrades.push("22");
            if (player.m.points.gte(3)) player.t.upgrades.push("23");
            if (player.m.points.gte(4)) player.t.upgrades.push("24");
            if (player.m.points.gte(5)) player.t.upgrades.push("25");
            if (player.m.points.gte(6)) player.t.upgrades.push("26");
            if (player.m.points.gte(7)) player.t.upgrades.push("27");
        }
    },
});

addLayer("m", {
    name: "Meditation",
    symbol: "M",
    position: 1,
    row: 1,
    color: "#00FFD9",
    resource: "Meditation",
    baseResource: "Training",
    baseAmount() { return player.t.points },
    requires: new Decimal(2000),
    type: "static",
    exponent: 2,
    base: 2,
    branches: "t",
    layerShown() { return hasAchievement("a", 13) },

    startData() { 
        return {
            unlocked: 0,
            points: new Decimal(0),
        }
    },
    effect() {
        return Decimal.pow(1.6, player.m.points)
    },
    effectDescription() { 
        if (!hasUpgrade('m', 22)){return "<br>x" + format(this.effect()) + " Exp gain"
        } else {
        return "<br>x" + format(this.effect()) + " Exp and Training gain"
        }
    },
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('t', 32)) mult = mult.div(upgradeEffect('t', 32))
        return mult
    },
    gainExp() {
        let mult = new Decimal(1)
        return mult
    },
    
    upgrades: {
        21: {
            fullDisplay() {
                return `<span style="font-size: 14px;">-M11-</span><br>
                        x2 <span class="Phycs">Phy</span>  gain<br><br><br><br>
                        x${format(this.effect())} <span class="Phycs">Phy</span><br><br>
                        Cost: ${format(this.cost(),true)} <span class="Medcs">Med</span>
                    `;
            },
            cost() { return new Decimal(4) },
            effect() { return new Decimal(2) },
        },
        22: {
            fullDisplay() {
                return `<span style="font-size: 14px;">-M12-</span><br>
                        Add <span class="Tracs">Tra</span> gain to <span class="Medcs">Med effect</span><br><br><br><br><br>
                        Cost: ${format(this.cost(),true)} <span class="Medcs">Med</span>
                    `;
            },
            cost() { return new Decimal(5) },
            unlocked() { return hasUpgrade("m", 21) && hasMilestone("c", 1) },
        },
        23: {
            fullDisplay() {
                return `<span style="font-size: 14px;">-M13-</span><br>
                        Add <span class="Tracs">Tra</span> gain to <span class="Medcs">Med effect</span><br><br><br><br><br>
                        Cost: ${format(this.cost(),true)} <span class="Medcs">Med</span>
                    `;
            },
            cost() { return new Decimal(7) },
            unlocked() { return hasUpgrade("m", 22) && hasMilestone("p", 10) },
        },
        24: {
            fullDisplay() {
                return `<span style="font-size: 14px;">-M13-</span><br>
                        Add <span class="Tracs">Tra</span> gain to <span class="Medcs">Med effect</span><br><br><br><br><br>
                        Cost: ${format(this.cost(),true)} <span class="Medcs">Med</span>
                    `;
            },
            cost() { return new Decimal(5) },
            unlocked() { return hasUpgrade("m", 22) && hasMilestone("p", 10) },
        },
    },

    milestones: {
        0: { 
            requirementDescription: "1 Med",
            effectDescription() {
                return `Keep <span class="Tracs">Tra</span> upgrades based on <span class="Medcs">Med</span><br>
                        Boost <span class="Tracs">Tra/sec</span> by <span class="Medcs">Med</span> owned
                    `;
            },
            done() { return player.m.points.gte(1) }
        },
        1: { 
            requirementDescription: "2 Med",
            effectDescription() {
                return `Unlock 2 new <span class="Tracs">Tra upgrades</span>
                    `;
            },
            done() { return player.m.points.gte(2) }
        },
        2: { 
            requirementDescription: "3 Med",
            effectDescription: "Gain TRA per second by ACP",
            effectDescription() {
                return `Boost <span class="Tracs">Tra/sec</span> by Achievement owned
                    `;
            },
            done() { return player.m.points.gte(3) }
        },
    },

    buyables: {
        11: {
            title: "-MB1-",
            cost(x) {
                return Decimal.pow(2, x.add(1));
            },
            effect(x) {
                return Decimal.pow(2, x);
            },
            display() {
                let addT = player.t.buyables[13].gte(1) ? `+${format(player.t.buyables[13], true)}` : "";
                return `x2 <span class="Expcs">Exp</span> gain<br><br><br>
                        <span style="font-size: 14px;">Amount</span>: ${format(player.m.buyables[11], true)}
                        x${format(tmp.m.buyables[11].effect)} <span class="Expcs">Exp</span><br>
                        Cost: ${format(tmp.m.buyables[11].cost, true)} <span class="Medcs">Med</span>`;
            },
            canAfford() {
                return player.m.points.gte(tmp.m.buyables[11].cost);
            },
            buy() {
                player.m.points = player.m.points.sub(cost); // リソースからコストを減算
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
            },
            unlocked() {
                return hasUpgrade("m", 23);
            },
            style: { 'height': '150px', 'width': '150px', 'font-size': '12px' },
        },
    },

    tabFormat: [//mフォーマット
        "main-display",
        "prestige-button",
        "blank",
        "buyables",
        "blank",
        "upgrades" ,
        "blank",
        "milestones",
    ],
})

addLayer("p", {//Physical
    name: "Physical",
    symbol: "P",
    position: 3,
    row: 1,
    color: "#FF5900",
    resource: "Physical",
    baseResource: "TRA",
    baseAmount() { return player.t.points },
    requires: new Decimal(200000),
    type: "normal",
    exponent: 0.4,
    branches: "t",
    layerShown() { return hasUpgrade('l', 25) },

    startData() { 
        return {
            unlocked: false,
            points: new Decimal(0),
        }
    },
    effect() {
        return player.p.points.add(1).pow(0.2)
    },
    effectDescription() { 
        return `<br>x${format(this.effect())} <span class="Expcs">Exp</span> gain`;
    },
    gainMult() {
        let mult = new Decimal(1)
        if (hasMilestone("p", 2)) mult = mult.times(1.5)
        if (hasUpgrade("m", 21)) mult = mult.times(upgradeEffect('m', 21))
        if (hasMilestone("c", 1)) mult = mult.times(2)
        if (hasMilestone("c", 2)) mult = mult.times(3)
        if (hasMilestone("c", 3)) mult = mult.times(2)
        return mult
    },

    upgrades: {//pアップグレード
        21: {
            fullDisplay() {
                return `<span style="font-size: 14px;">-P11-</span><br>
                        Divide <span class="Tracs">TB1</span> cost<br>by <span class="Medcs">Med</span><br><br><br>
                        /${format(this.effect())} <span class="Tracs">TB1</span> cost<br><br>
                        Cost: ${format(this.cost(),true)} <span class="Phycs">Phy</span>
                    `;
            },
            cost() { return new Decimal(5) },
            effect() { return player.m.points.add(1) },
            effectDisplay() { return "/" + format(this.effect()) },
        },
        22: {
            fullDisplay() {
                return `<span style="font-size: 14px;">-P12-</span><br>
                        Divide <span class="Tracs">TB2</span> cost<br>by <span class="Medcs">Med</span><br><br><br>
                        /${format(this.effect())} <span class="Tracs">TB2</span> cost<br><br>
                        Cost: ${format(this.cost(),true)} <span class="Phycs">Phy</span>
                    `;
            },
            cost() { return new Decimal(25) },
            effect() { return player.m.points.add(1) },
            effectDisplay() { return "/" + format(this.effect()) },
            unlocked() { return hasUpgrade("p", 21) },
        },
        23: {
            fullDisplay() {
                return `<span style="font-size: 14px;">-P13-</span><br>
                        Significantly reduces the cost of <span class="Tracs">-T17-</span><br><br><br><br>
                        Cost: ${format(this.cost(),true)} <span class="Phycs">Phy</span>
                    `;
            },
            cost() { return new Decimal(1000) },
            unlocked() { return hasUpgrade("p", 22) && hasMilestone("c", 2)},
        },
        24: {
            fullDisplay() {
                return `<span style="font-size: 14px;">-P14-</span><br>
                        Boost <span class="Expcs">Exp</span> gain by <span class="Phycs">Phy milestones</span><br><br><br>
                        x${format(this.effect())} <span class="Expcs">Exp</span><br><br>
                        Cost: ${format(this.cost(),true)} <span class="Phycs">Phy</span>
                    `;
            },
            cost() { return new Decimal(100000) },
            effect() { return player.p.milestones.length },
            unlocked() { return hasUpgrade("p", 23) },
        },
        25: {
            fullDisplay() {
                return `<span style="font-size: 14px;">-P15-</span><br>
                        Add the number of <span class="Phycs">Phy</span> and <span class="Medcs">Med</span> upgrade to the<br><span class="Tracs">-T11-</span> effect<br><br><br>
                        Cost: ${format(this.cost(),true)} <span class="Phycs">Phy</span>
                    `;
            },
            cost() { return new Decimal(200000) },
            effect() { return Decimal.add(player.p.upgrades.length).add(player.m.upgrades.length).div(2) },
            unlocked() { return hasUpgrade("p", 24) },
        },
    },

    milestones: {//pマイルストーン
        0: { 
            requirementDescription: "1 Phy -PM1-",
            effectDescription() {
                if (hasMilestone("p", 5)) {
                    return `Autobuy <span class="Tracs">-TB1-</span> and <span class="Tracs">-TB2-</span>
                `;
                }
                else {
                    return `Autobuy <span class="Tracs">-TB1-</span>
                `;
                }
            },

            done() { 
                return player.p.points.gte(1);
            },
            toggles: function() {
                let data = [["m", "autoTB1"]];
                if (hasMilestone("p", 5)) {
                    data.push(["m", "autoTB2"]);
                }
                return data;
            },
        },
        1: { 
            requirementDescription: "2 Phy -PM2-",
            effectDescription() {
                    return `Unlock new <span class="Tracs">Training buyable</span>`;
            },
            done() { return player.p.points.gte(2) },
            unlocked() { return milestoneShown_one(this.layer, this.id, "last") },

        },
        2: { 
            requirementDescription: "3 Phy -PM3-",
            effectDescription() {
                return `x1.5 <span class="Phycs">Phy</span> gain`;
        },
            done() { return player.p.points.gte(3) },
            unlocked() { return milestoneShown_one(this.layer, this.id, "last") },
        },
        3: { 
            requirementDescription: "5 Phy -PM4-",
            effectDescription() {
                return `Buying <span class="Tracs">-TB1-</span> uses half the resources`;
        },
            done() { return player.p.points.gte(5) },
            unlocked() { return hasMilestone('p', 2) && milestoneShown_one(this.layer, this.id, "last")},
        },
        4: { 
            requirementDescription: "10 Phy -PM5-",
            effectDescription() {
                return `Buying <span class="Tracs">-TB2-</span> uses half the resources`;
        },
            done() { return player.p.points.gte(10) },
            unlocked() { return hasMilestone('p', 2) && milestoneShown_one(this.layer, this.id, "last")},
        },
        5: { 
            requirementDescription: "15 Phy -PM6-",
            effectDescription() {
                return `Add <span class="Tracs">-TB2-</span> to the effect of <span class="Phycs">-PM1-</span>`;
        },
            done() { return player.p.points.gte(15) },
            unlocked() { return hasMilestone('p', 3) && milestoneShown_one(this.layer, this.id, "last")},
        },
        6: { 
            requirementDescription: "55 Phy -PM7-",
            effectDescription() {
                return `x2 <span class="Expcs">Exp</span> gain`;
        },
            done() { return player.p.points.gte(55) },
            unlocked() { return hasMilestone('p', 5) && milestoneShown_one(this.layer, this.id, "last")},
        },
        7: { 
            requirementDescription: "100 Phy -PM8-",
            effectDescription() {
                return `<span class="Tracs">-TB1-</span> costs no resources`;
        },
            done() { return player.p.points.gte(100) },
            unlocked() { return hasMilestone("p", 6) && milestoneShown_one(this.layer, this.id, "last")},
        },
        8: { 
            requirementDescription: "10,000 Phy -PM9-",
            effectDescription() {
                return `<span class="Tracs">-TB2-</span> costs no resources`;
        },
            done() { return player.p.points.gte(10000) },
            unlocked() { return hasMilestone("p", 6) && milestoneShown_one(this.layer, this.id, "last")},
        },
        9: { 
            requirementDescription: "600,000 Phy -PM10-",
            effectDescription() {
                return `x3 <span class="Expcs">Exp</span> gain`;
        },
            done() { return player.p.points.gte("600,000") },
            unlocked() { return hasMilestone('p', 8) && milestoneShown_one(this.layer, this.id, "last")},
        },
        10: { 
            requirementDescription: "1e6 Phy -PM11-",
            effectDescription() {
                return `Unlock 2 new <span class="Medcs">Meditation upgrade</span>`;
        },
            done() { return player.p.points.gte("1e6") },
            unlocked() { return hasMilestone('p', 9) && milestoneShown_one(this.layer, this.id, "last")},
        },
    },

    tabFormat: [//pフォーマット
        "main-display",
        "prestige-button",
        "blank",
        "upgrades" ,
        "milestones",
        ["display-text", function() {//マイルストーン
            return `<div style="text-align: center; font-size: 20px;">-Achieved Milestone-</div><br>
            <div style="text-align: left;">
                ${hasMilestone('p', 2) ? '2 Phy -PM2- : Unlock new <span class="Tracs">Training buyable</span><br>' : ''}
                ${hasMilestone('p', 3) ? '3 Phy -PM3- : x1.5 <span class="Phycs">Phy</span> gain<br>' : ''}
                ${hasMilestone('p', 4) ? '5 Phy -PM4- : Buying <span class="Tracs">-TB1-</span> uses half the resources<br>' : ''}
                ${hasMilestone('p', 5) ? '10 Phy -PM5- : Buying <span class="Tracs">-TB2-</span> uses half the resources<br>' : ''}
                ${hasMilestone('p', 6) ? '15 Phy -PM6- : <span class="Tracs">-TB1-</span> costs no resources<br>' : ''}
                ${hasMilestone('p', 7) ? '55 Phy -PM7- : x2 <span class="Expcs">Exp</span> gain<br>' : ''}
                ${hasMilestone('p', 8) ? '100 Phy -PM8- : <span class="Tracs">-TB1-</span> costs no resources<br>' : ''}
                ${hasMilestone('p', 9) ? '10,000 Phy -PM9- : <span class="Tracs">-TB2-</span> costs no resources<br>' : ''}
                ${hasMilestone('p', 10) ? '600,000 Phy -PM10- : x3 <span class="Expcs">Exp</span> gain<br>' : ''}
                ${hasMilestone('p', 11) ? '1e6 Phy -PM11- : Unlock 2 new <span class="Medcs">Meditation upgrade</span>' : ''}
            </div>
            <br><br><br><br>
            `;
        }],
    ],
})

addLayer("c", {//Challenge
    name: "Challenge",
    symbol: "C",
    position: 2,
    row: 1,
    color: "#FFD900",
    resource: "Challenge",
    branches: "t",
    layerShown() { return hasUpgrade('l', 31) },

    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            c1up: new Decimal(1),
        }
    },
    effect() { 
        return Decimal.pow(2,player.c.points)
    },
    effectDescription() { 
        return "<br>x" + format(this.effect()) + " TRA gain" 
    },

    challenges: {//cチャレンジ
        11: {
            name: "-C1-",
            completionLimit: 3,

            challengeDescription() {
                return "complete: " + challengeCompletions('c', 11) + "/3<br><br>Training layer item cost x" + format(Decimal.pow(10, challengeCompletions('c', 11) * 2 + 2)) + "<br>all Training layer reset.<br><br>"
            },

            goalDescription(){
                switch (challengeCompletions('c', 11)) {
                    case 0: return "1.00e8 Exp<br>"
                    case 1: return "1.00e9<br>"
                    case 2: return "1.00e14<br>"
                }
            },

            canComplete(){
                switch (challengeCompletions('c', 11)) {
                    case 0: return player.points.gte("1e8")
                    case 1: return player.points.gte("1e9")
                    case 2: return player.points.gte("1e14")
                }
            },

            rewardDescription: "Get 1 Challenge point",

            onEnter() {
                player.points = new Decimal(0)
                player.t.points = new Decimal(0)
                player.t.upgrades = []
                player.t.buyables[11] = new Decimal(0)
                player.t.buyables[12] = new Decimal(0)
                player.t.buyables[13] = new Decimal(0)
                player.c.c1up = Decimal.pow(10, challengeCompletions('c', 11) * 2 + 2)//upgrade倍率コンプリート回数
            },
            onExit() {
                player.c.c1up = new Decimal(1)
            },
            onComplete() {
                player.c.points = player.c.points.add(1)
            },
        },

        12: {
            name: "-C2-",
            completionLimit: 3,
            challengeDescription() {return "complete: " + challengeCompletions('c', 12) + "/3<br><br>Each Training layer item purchase multiplies its cost by 10.<br>all Training layer reset.<br>" },
            
            goalDescription(){
                switch (challengeCompletions('c', 12)) {
                    case 0: return "1.00e7 Exp<br>"
                    case 1: return "4.00e8<br>"
                    case 2: return "4.00e100<br>"
                }
            },
            
            canComplete(){
                switch (challengeCompletions('c', 12)) {
                    case 0: return player.points.gte("1e7")
                    case 1: return player.points.gte("4e8")
                    case 2: return player.points.gte("4e100")
                }
            },

            rewardDescription: "Get 1 Challenge point",

            onEnter() {
                player.points = new Decimal(0)
                player.t.points = new Decimal(0)
                player.t.upgrades = []
                player.t.buyables[11] = new Decimal(0)
                player.t.buyables[12] = new Decimal(0)
                player.t.buyables[13] = new Decimal(0)
            },
            onExit() {
                player.c.c1up = new Decimal(1)
            },
            onComplete() {
                player.c.points = player.c.points.add(1)
            },
        },
    },

    milestones: {//cマイルストーン
        0: { 
            requirementDescription: "1 Cha -CM1-",
            effectDescription() {
                return `Double <span class="Tracs">-TB2-</span> effect
            `;
        },
            done() { return player.c.points.gte(1) },
        },
        1: { 
            requirementDescription: "2 Cha -CM2-",
            effectDescription() {
                return `x2 <span class="Phycs">Phy</span> gain<br>Unlock new <span class="Medcs">Meditation upgrade</span>
            `;
        },
            done() { 
                return player.c.points.gte(2);
            },
            unlocked() { return hasMilestone("c", 0) },
        },
        2: { 
            requirementDescription: "3 Cha -CM3-",
            effectDescription() {
                return `x3 <span class="Phycs">Phy</span> gain<br>Unlock new <span class="Phycs">Physical upgrade</span>
            `;
        },
            done() { return player.c.points.gte(3) },
            unlocked() { return hasMilestone("c", 1) },
        },
        3: { 
            requirementDescription: "4 Cha -CM4-",
            effectDescription() {
                return `x2 <span class="Phycs">Phy</span> gain
            `;
        },
            done() { return player.c.points.gte(4) },
            unlocked() { return hasMilestone("c", 2) },
        },
    },

    tabFormat: [//cタブレイアウト
        "main-display",
        "challenges",
        "blank",
        "milestones"
    ],
})

addLayer("l", {//Level
    color: "#FF00A6",
    resource: "Lvl",
    row: "side",
    layerShown() { return hasAchievement("a", 12) },

    startData() { 
        return {
            unlocked: true,
            points: new Decimal(0),
            level_cost: new Decimal(0),
        }
    },
    tooltip() {
        return ("Lvl." + player.l.points)
    },

    upgrades: {//Lアップグレード
        21: {
            currencyInternalName: "points",
            fullDisplay() {
                return `<span style="font-size: 14px;">Lvl.1</span><br>
                        Unlock new <span class="Tracs">Training buyable</span><br><br><br><br><br>
                        Cost: ${format(this.cost(),true)} <span class="Expcs">Exp</span>
                    `;
            },
            cost() { return new Decimal(50) },
            onPurchase() { player.l.points = player.l.points.add(1) },
        },
        22: {
            currencyInternalName: "points",
            fullDisplay() {
                return `<span style="font-size: 14px;">Lvl.2</span><br>
                        <span class="Lvlcs">Lvl</span> boosts <span class="Tracs">Tra</span> gain<br><br><br>
                        x${format(this.effect())} <span class="Tracs">Tra</span><br><br>
                        Cost: ${format(this.cost(),true)} <span class="Expcs">Exp</span>
                    `;
            },
            cost() { return new Decimal(300) },
            effect() { return Decimal.pow(1.2, player.l.points) },
            effectDisplay() { return format(this.effect()) + "x" },
            onPurchase() { player.l.points = player.l.points.add(1) },
            unlocked() { return hasUpgrade("l", 21) },
        },
        23: {
            currencyLayer: "t",
            currencyInternalName: "points",
            fullDisplay() {
                return `<span style="font-size: 14px;">Lvl.3</span><br>
                        Gain <span class="Tracs">Tra</span><br>per second<br>based on <span class="Lvlcs">Lvl</span><br><br><br><br>
                        Cost: ${format(this.cost(),true)} <span class="Tracs">Tra</span>
                    `;
            },
            tooltip() {
                return `The effects are listed in the Training layer
                    `;
            },
            cost() { return new Decimal(50) },
            effect() {
                let eff = Decimal.add(player.l.points)
                if (hasMilestone("m", 0)) eff = eff.add(player.m.points)
                if (hasMilestone("m", 2)) eff = eff.add(player.a.points)
                eff = eff.add(buyableEffect("t", 12))

                return eff
            },
            onPurchase() { player.l.points = player.l.points.add(1) },
            unlocked() { return hasUpgrade("l", 22) },
        },
        24: {
            currencyInternalName: "points",
            fullDisplay() {
                return `<span style="font-size: 14px;">Lvl.4</span><br>
                        Change the effect of <span class="Tracs">-T11-</span> to be stronger<br><br><br><br>
                        Cost: ${format(this.cost(),true)} <span class="Expcs">Exp</span>
                    `;
            },
            cost() { return new Decimal(500000) },
            effect() { return Decimal.add(player.t.upgrades.length).div(2) },
            onPurchase() { player.l.points = player.l.points.add(1) },
            unlocked() { return hasUpgrade("l", 23) },
        },
        25: {
            currencyLayer: "m",
            currencyInternalName: "points",
            fullDisplay() {
                return `<span style="font-size: 14px;">Lvl.5</span><br>
                        Unlock <span class="Phycs">new layer</span><br>x2 <span class="Tracs">Tra</span> gain<br><br><br>
                        x${format(this.effect())} <span class="Tracs">Tra</span><br><br>
                        Cost: ${format(this.cost(),true)} <span class="Medcs">Med</span>
                    `;
            },
            cost() { return new Decimal(3) },
            effect() { return 2 },
            onPurchase() { player.l.points = player.l.points.add(1) },
            unlocked() { return hasUpgrade("l", 24) },
        },
        31: {
            currencyInternalName: "points",
            currencyLayer: "p",
            fullDisplay() {
                return `<span style="font-size: 14px;">Lvl.6</span><br>
                        Unlock <span class="Chacs">new layer</span><br><br><br><br><br><br>
                        Cost: ${format(this.cost(),true)} <span class="Phycs">Phy</span>
                    `;
            },
            cost() { return new Decimal(20) },
            onPurchase() { player.l.points = player.l.points.add(1) },
            unlocked() { return hasUpgrade("l", 25) },
        },
        32: {
            fullDisplay() {
                return `<span style="font-size: 14px;">Lvl.7</span><br>
                        Unlock 7 <span class="Tracs">Tra upgrades</span><br><br><br><br><br>
                        Reach 4 <span class="Chacs">Cha</span>
                    `;
            },
            canAfford() { return player.c.points.gte(4) },
            onPurchase() { player.l.points = player.l.points.add(1) },
            unlocked() { return hasUpgrade("l", 31) },
        },
    },

})

addLayer("a", {//Achievement
    resource: "Achievement",
    row: "side",
    color: "#FFD733",

    startData() { 
        return {
            unlocked: true,
            points: new Decimal(0),
        }
    },
    tooltip() {
        return ("Achievements")
    },

    achievements: {
        11: {
            name: "Reach 1 Tra",
            done() { return player.t.points.gte(1) },
            tooltip: "Reward: Add ACP to the effect of base Exp",
            onComplete() { player.a.points = player.a.points.add(1) }
        },
        12: {
            name: "Purchase -T13-",
            done() { return hasUpgrade("t", 23) },
            tooltip: "Reward: Unlock LevelUp",
            onComplete() { player.a.points = player.a.points.add(1) }
        },
        13: {
            name: "Purchase -T15-",
            done() { return hasUpgrade("t", 25) },
            tooltip: "Reward: Unlock new layer",
            onComplete() { player.a.points = player.a.points.add(1) }
        },
        14: {
            name: "Reach Lvl.5",
            done() { return hasUpgrade("l", 25) },
            onComplete() { player.a.points = player.a.points.add(1) }
        },
        15: {
            name: "Reach 5 Phy",
            done() { return player.p.points.gte(5) },
            onComplete() { player.a.points = player.a.points.add(1) }
        },
        16: {
            name: "Complete One Challenge",
            done() { return player.c.points.gte(1) },
            onComplete() { player.a.points = player.a.points.add(1) }
        },
        17: {
            name: "Long time no see!",
            done() { return hasUpgrade('p', 25) },
            onComplete() { player.a.points = player.a.points.add(1) }
        },
    },
})
