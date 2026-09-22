// ============================================================================
//  THE CLASSIC+ TREE v0.3 - WAY MORE CONTENT
//  10 layers: P (0) - B/G/M (1) - T/W (2) - H/Q (3) - E (4) + A/S side
//  Each layer showcases different TMT features. Copy a layer to make your own!
//  Docs: /docs -> upgrades.md, milestones.md, buyables.md, challenges.md, etc
// ============================================================================

// ---------------- BUY MAX (everything below Eternity) ----------------
// All buyables in rows 0-3 (P, B, G, M, T, W, H, Q) are buy-maxable:
// clicking one buys as many levels as you can afford (Shift+click buys a
// single level). Eternity and above (E, U, R, S) stay one-at-a-time.
//
// "currency" is the object whose .points the buyable spends
// (e.g. player.p for prestige points, player for regular points).
// Buys level-by-level so it works with every cost curve in this tree,
// including G Mk I's post-10 discount and its 25-level purchase limit.
function buyMaxLevels(layer, id, currency) {
	let bought = 0
	const data = layers[layer].buyables[id]
	while (bought < 10000) {
		const x = getBuyableAmount(layer, id)
		if (data.purchaseLimit !== undefined && x.gte(data.purchaseLimit)) break
		const cost = data.cost(x)
		if (!currency.points.gte(cost)) break
		currency.points = currency.points.sub(cost)
		setBuyableAmount(layer, id, x.add(1))
		bought++
	}
	if (bought > 0) updateBuyableTemp(layer)
	return bought
}

// ---------------- ROW 0: PRESTIGE (P) - Expanded ----------------
addLayer("p", {
    name: "prestige",
    symbol: "P",
    position: 0,
    startData() { return { unlocked: true, points: new Decimal(0), best: new Decimal(0), auto: false }},
    color: "#4BDC13",
    requires: new Decimal(10),
    resource: "prestige points",
    baseResource: "points",
    baseAmount() {return player.points},
    type: "normal",
    exponent: 0.5,
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('p', 14)) mult = mult.times(upgradeEffect('p', 14))
        if (hasUpgrade('p', 32)) mult = mult.times(upgradeEffect('p', 32))
        if (hasUpgrade('b', 11)) mult = mult.times(upgradeEffect('b', 11))
        if (hasUpgrade('b', 13)) mult = mult.times(2)
        if (hasUpgrade('m', 11)) mult = mult.times(upgradeEffect('m', 11))
        if (hasMilestone('g', 0)) mult = mult.times(2)
        if (hasMilestone('p', 3)) mult = mult.times(2.5)
        if (hasAchievement('a', 12)) mult = mult.times(1.5)
        if (hasAchievement('a', 33)) mult = mult.times(2)
        if (player.r && hasUpgrade('r', 11)) mult = mult.times(upgradeEffect('r', 11))
        return mult
    },
    gainExp() {
        let exp = new Decimal(1)
        if (hasUpgrade('t', 11)) exp = exp.times(1.05)
        if (hasUpgrade('q', 12)) exp = exp.times(1.08)
        if (hasMilestone('e', 0)) exp = exp.times(1.1)
        return exp
    },
    row: 0,
    hotkeys: [{key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}}],
    layerShown(){return true},
    effect() {
        let eff = player.p.points.add(1).pow(0.5)
        if (hasUpgrade('p', 23)) eff = eff.pow(1.5)
        if (hasUpgrade('p', 31)) eff = eff.pow(1.25)
        if (hasUpgrade('g', 12)) eff = eff.times(upgradeEffect('g', 12))
        if (hasUpgrade('m', 13)) eff = eff.times(upgradeEffect('m', 13))
        if (hasAchievement('a', 24)) eff = eff.times(1.5)
        if (!hasMilestone('p',8) && !hasUpgrade('p',64)) { if (eff.gte(1000)) eff = eff.div(1000).pow(0.5).times(1000) }
        if (hasUpgrade('e', 12)) eff = eff.pow(1.1)
        if (hasUpgrade('p', 62)) eff = eff.pow(upgradeEffect('p', 62))
        if (hasChallenge('p', 11)) eff = eff.pow(1.4)
        if (hasChallenge('p', 21)) eff = eff.pow(2)
        return eff
    },
    effectDescription() { return "which are boosting points by "+format(tmp.p.effect)+"x" },
    bars: {
        prestigeBar: {
            direction: RIGHT, width: 350, height: 22,
            progress() { return player.p.points.div(player.p.best.add(10)).toNumber() },
            display() { return formatWhole(player.p.points)+" / "+formatWhole(player.p.best.add(10))+" best" },
            fillStyle: {'background-color': "#4BDC13"}, baseStyle: {'background-color': "#222"}, textStyle: {'color': "white"},
        }
    },
    upgrades: {
        11: { title: "The Start", description: "Double point gain.", cost: new Decimal(1) },
        12: {
            description: "Prestige points boost point gain.", cost: new Decimal(2),
            effect() { return player.p.points.add(1).pow(0.4) }, effectDisplay() { return format(this.effect())+"x" },
            unlocked() { return hasUpgrade('p', 11) },
        },
        13: {
            description: "Points boost prestige gain.", cost: new Decimal(5),
            effect() { return player.points.add(1).log10().add(1).pow(0.8) }, effectDisplay() { return format(this.effect())+"x" },
            unlocked() { return hasUpgrade('p', 12) },
        },
        14: {
            title: "Synergy", description: "Generators boost prestige gain.", cost: new Decimal(10),
            effect() { return player.g.points.add(1).pow(0.3) }, effectDisplay() { return format(this.effect())+"x" },
            unlocked() { return hasUpgrade('p', 13) && player.g.unlocked },
        },
        21: { description: "Unlock Boosters.", cost: new Decimal(20), unlocked() { return hasUpgrade('p', 13) } },
        22: { description: "Unlock Generators. Keep P upgrades on reset.", cost: new Decimal(30), unlocked() { return hasUpgrade('p', 21) } },
        23: { description: "P effect is ^1.5 stronger.", cost: new Decimal(100), unlocked() { return hasMilestone('b', 1) || hasMilestone('g',1) } },
        24: { description: "Gain 100% of prestige gain per second.", cost: new Decimal(250), unlocked() { return hasUpgrade('p', 23) } },
        31: { description: "P effect ^1.25 and prestige gain +25%.", cost: new Decimal(500), effect() { return new Decimal(1.25) }, unlocked() { return hasUpgrade('p', 24) && player.m.unlocked } },
        32: { description: "Mana boosts prestige gain.", cost: new Decimal(1000), effect() { return player.m.points.add(1).pow(0.35) }, effectDisplay(){ return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('p',31) && hasUpgrade('m',11)} },
        33: { description: "Unlock Mana (if not yet). Prestige gain x3.", cost: new Decimal(2500), unlocked(){ return hasUpgrade('p',32)} },
        34: { description: "Keep B/G/M upgrades on T/W resets.", cost: new Decimal(5000), unlocked(){ return hasUpgrade('p',33) && hasMilestone('t',1)} },
        // Row 2 unlocks
        41: { description: "Time Shards boost point gain x2.", cost: new Decimal(25000), effect(){ return new Decimal(2)}, unlocked(){ return hasUpgrade('p',34) && player.t.unlocked} },
        42: { description: "Warp Shards boost prestige gain.", cost: new Decimal(1e6), effect(){ return player.w.points.add(1).pow(0.4)}, effectDisplay(){return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('p',41) && player.w.unlocked} },
        // Row 5 — Hyper/Quantum era
        51: { title: "Hyper Prestige", description: "Hyper points massively boost prestige gain.", cost: new Decimal(1e8), effect(){ return player.h.points.add(1).pow(0.8)}, effectDisplay(){return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('p',42) && player.h.unlocked} },
        52: { title: "Quantum Prestige", description: "Quantum shards boost prestige gain.", cost: new Decimal(1e10), effect(){ return player.q.points.add(1).pow(0.6)}, effectDisplay(){return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('p',51) && player.q.unlocked} },
        53: { description: "P effect ^1.2 and P buyables are 50% cheaper.", cost: new Decimal(1e12), unlocked(){ return hasUpgrade('p',52)} },
        54: { description: "Gain 500% prestige passively. Keep all P upgrades on E reset.", cost: new Decimal(1e15), unlocked(){ return hasUpgrade('p',53)} },
        // Row 6 — Eternity era
        61: { title: "Eternal Prestige", description: "Eternity points boost prestige gain.", cost: new Decimal(1e20), effect(){ return player.e.points.add(1).pow(1.2)}, effectDisplay(){return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('p',54) && player.e.unlocked} },
        62: { description: "P effect is raised to the number of P milestones you have.", cost: new Decimal(1e25), effect(){ let count=0; for(let i=0;i<=8;i++) if(hasMilestone('p',i)) count++; return new Decimal(1).add(count*0.05)}, effectDisplay(){return "^"+format(this.effect())}, unlocked(){ return hasUpgrade('p',61)} },
        63: { description: "Points ^1.05. Unlock a third P buyable.", cost: new Decimal(1e30), unlocked(){ return hasUpgrade('p',62)} },
        64: { title: "Infinite Prestige", description: "P effect softcap is removed entirely.", cost: new Decimal(1e40), unlocked(){ return hasUpgrade('p',63) && player.e.best.gte(6)} },
    },
    buyables: {
        11: {
            title: "Prestige Condenser",
            cost(x){ return new Decimal(100).pow(x).times(100) },
            effect(x){ let eff = Decimal.pow(1.5, x); if(hasUpgrade('p',34)) eff=eff.times(1.5); return eff; },
            display(){
                let d=tmp[this.layer].buyables[this.id];
                return "Cost: "+format(d.cost)+" prestige<br>Amount: "+formatWhole(player.p.buyables[this.id])+"<br>Effect: "+format(d.effect)+"x prestige gain"
            },
            unlocked(){ return hasUpgrade('p',34) },
            canAfford(){ return player.p.points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy(){ let c=tmp[this.layer].buyables[this.id].cost; player.p.points=player.p.points.sub(c); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); },
            buyMax(){ buyMaxLevels(this.layer, this.id, player.p) },
            style:{'height':'110px'},
        },
        12: {
            title: "Point Amplifier",
            cost(x){ return new Decimal(10).pow(x).times(1e4) },
            effect(x){ return Decimal.pow(2, x) },
            display(){
                let d=tmp[this.layer].buyables[this.id];
                return "Cost: "+format(d.cost)+" points<br>Amount: "+formatWhole(player.p.buyables[this.id])+"<br>Effect: "+format(d.effect)+"x points"
            },
            unlocked(){ return hasMilestone('p',4) },
            canAfford(){ return player.points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy(){ let c=tmp[this.layer].buyables[this.id].cost; player.points=player.points.sub(c); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); },
            buyMax(){ buyMaxLevels(this.layer, this.id, player) },
            style:{'height':'110px'},
        },
        13: {
            title: "Prestige Singularity",
            cost(x){ return hasUpgrade('p',53) ? new Decimal(1e6).pow(x).times(1e10) : new Decimal(1e8).pow(x).times(1e10) },
            effect(x){ return Decimal.pow(1e3, x) },
            display(){
                let d=tmp[this.layer].buyables[this.id];
                return "Cost: "+format(d.cost)+" prestige<br>Amount: "+formatWhole(player.p.buyables[this.id])+"<br>Effect: "+format(d.effect)+"x to ALL gains"
            },
            unlocked(){ return hasUpgrade('p',63) },
            canAfford(){ return player.p.points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy(){ let c=tmp[this.layer].buyables[this.id].cost; player.p.points=player.p.points.sub(c); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); },
            buyMax(){ buyMaxLevels(this.layer, this.id, player.p) },
            style:{'height':'110px', 'background-color':'#226622'},
        },
    },
    challenges: {
        11: {
            name: "No Boosters",
            challengeDescription: "B effect is disabled. B upgrades do nothing.",
            goalDescription: "Reach 1e7 points",
            canComplete(){ return player.points.gte(1e7) },
            rewardDescription: "P gain x2, B effect +25%",
            rewardEffect(){ return new Decimal(2) }, rewardDisplay(){ return format(this.rewardEffect())+"x"},
            unlocked(){ return hasUpgrade('p',31) },
        },
        12: {
            name: "Prestige Purge",
            challengeDescription: "All layer effects disabled. Only base generation + P upgrades work. Point gain ^0.2.",
            goalDescription: "Reach 1e15 points",
            canComplete(){ return player.points.gte(1e15) },
            rewardDescription: "P effect ^1.4 and all layer effects +20%",
            rewardEffect(){ return new Decimal(1.4) }, rewardDisplay(){ return "^"+format(this.rewardEffect())},
            unlocked(){ return hasMilestone('p',6) },
        },
        21: {
            name: "Ultimate Prestige",
            challengeDescription: "You start with 0 points and only P upgrades. Everything else resets. Point gain ^0.1.",
            goalDescription: "Reach 1e25 points",
            canComplete(){ return player.points.gte(1e25) },
            rewardDescription: "P effect is squared. P gain x100.",
            unlocked(){ return hasUpgrade('p',64) },
        },
    },
    milestones: {
        0: { requirementDescription: "5 prestige", effectDescription: "Keep P upgrades on row-1 resets. Autobuy P.", done() { return player.p.best.gte(5) }, toggles: [["p", "auto"]] },
        1: { requirementDescription: "20 prestige", effectDescription: "Unlock 2 more P upgrades. Points x2.", done() { return player.p.best.gte(20) }, unlocked() { return hasMilestone('p', 0) } },
        2: { requirementDescription: "50 prestige", effectDescription: "Gain x1.5 more prestige.", done() { return player.p.best.gte(50) }, unlocked() { return hasMilestone('p', 1) } },
        3: { requirementDescription: "500 prestige", effectDescription: "Prestige gain x2.5, keep P buyables", done() { return player.p.best.gte(500) }, unlocked() { return hasMilestone('p', 2)} },
        4: { requirementDescription: "5,000 prestige", effectDescription: "Points x2, unlock P buyables & challenge", done() { return player.p.best.gte(5000) }, unlocked() { return hasMilestone('p',3)} },
        5: { requirementDescription: "1e6 prestige", effectDescription: "Gain 50% prestige passively, keep milestones on E", done() { return player.p.best.gte(1e6) }, unlocked() { return hasMilestone('p',4)} },
        6: { requirementDescription: "1e9 prestige", effectDescription: "P effect ^1.3, unlock P challenge 2", done() { return player.p.best.gte(1e9) }, unlocked() { return hasMilestone('p',5)} },
        7: { requirementDescription: "1e15 prestige", effectDescription: "P buyables scale 3x slower, keep P buyables on all resets", done() { return player.p.best.gte(1e15) }, unlocked() { return hasMilestone('p',6)} },
        8: { requirementDescription: "1e25 prestige", effectDescription: "P gain x10, P effect softcap removed", done() { return player.p.best.gte(1e25) }, unlocked() { return hasMilestone('p',7)} },
    },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let keep = []
            if (hasMilestone('p', 0)) keep.push("upgrades")
            if (hasMilestone('p', 1) && player.p.best.gte(20)) keep.push("milestones")
            if (hasMilestone('p', 3)) keep.push("buyables")
            if (hasMilestone('p', 4) && hasMilestone('t',2)) keep.push("challenges")
            layerDataReset(this.layer, keep)
        }
    },
    passiveGeneration() { if (hasUpgrade('p', 24) || hasUpgrade('p', 54)) return 5; if (hasMilestone('t', 0)) return 0.1; if (hasMilestone('p',5)) return 0.5; return 0 },
    autoUpgrade() { return hasMilestone('p', 0) && player.p.auto },
    tabFormat: {
        "Main": { content: ["main-display","prestige-button","resource-display","blank",["bar","prestigeBar"],"blank",["display-text", function() {return hasMilestone('p',0)?"Milestone 0 gives autobuyer!":"Get 5 prestige for autobuyer!"} ],"blank","milestones","blank","upgrades"]},
        "Buyables": { content: ["main-display","blank","buyables","blank",["display-text", function(){return "Condensers boost prestige. Amplifiers boost points.<br>Click to buy max, Shift+click to buy one!"}]], unlocked(){return hasMilestone('p',4)}},
        "Challenge": { content: ["main-display","blank","challenges"], unlocked(){return hasMilestone('p',4)}},
    }
})

// ---------------- ROW 1 LEFT: BOOSTERS (B) - Expanded ----------------
addLayer("b", {
    name: "boosters", symbol: "B", position: 0,
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), auto: false }},
    color: "#FF8800",
    requires: new Decimal(100), resource: "boosters", baseResource: "prestige points", baseAmount() {return player.p.points},
    type: "static", exponent: 1.2, base: 10, row: 1, branches: ["p"],
    layerShown() { return hasUpgrade('p', 21) || player.b.unlocked },
    effect() {
        let eff = Decimal.pow(2.5, player.b.points)
        if (hasUpgrade('b', 12)) eff = eff.times(upgradeEffect('b', 12))
        if (hasUpgrade('b', 23)) eff = eff.pow(1.2)
        if (!hasMilestone('b',7)) { if (eff.gte(1e6)) eff = eff.div(1e6).pow(0.3).times(1e6) }
        if (hasUpgrade('e', 11)) eff = eff.pow(1.1)
        if (hasMilestone('b',8)) eff = eff.pow(2)
        if (hasAchievement('a',71)) eff = eff.pow(1.5)
        return eff
    },
    effectDescription() { return "which are boosting point gain by "+format(tmp.b.effect)+"x" },
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('b', 14)) mult = mult.div(1.5)
        if (hasMilestone('b', 2)) mult = mult.div(1.5)
        if (hasMilestone('b', 5)) mult = mult.div(2)
        if (hasUpgrade('q', 13)) mult = mult.div(1.3)
        return mult
    },
    bars: {
        boosterBar: { direction: RIGHT, width: 320, height: 20, progress() { return player.b.points.div(15).toNumber() }, display(){ return formatWhole(player.b.points)+"/15 for next milestone"}, fillStyle:{'background-color':"#FF8800"}, baseStyle:{'background-color':"#333"}, },
    },
    canBuyMax: true, // buy max is free now - everything below Eternity is buy-maxable
    autoPrestige() { return hasMilestone('b', 3) && player.b.auto },
    hotkeys: [{key: "b", description: "B: Reset for boosters", onPress(){if (canReset(this.layer)) doReset(this.layer)}}],
    upgrades: {
        11: { description: "Boosters boost prestige gain.", cost: new Decimal(1), effect() { return Decimal.pow(1.5, player.b.points) }, effectDisplay() { return format(this.effect())+"x" } },
        12: { description: "Boosters boost their own effect.", cost: new Decimal(2), effect() { return player.b.points.add(1).pow(0.5) }, effectDisplay() { return format(this.effect())+"x" }, unlocked() { return hasUpgrade('b', 11) } },
        13: { description: "Double prestige gain and point effect of B.", cost: new Decimal(3), unlocked() { return hasUpgrade('b', 12) } },
        14: { description: "Booster cost scaling is 30% cheaper.", cost: new Decimal(5), unlocked() { return hasUpgrade('b', 13) } },
        21: { description: "Unlock Booster Engine buyable.", cost: new Decimal(8), unlocked() { return hasUpgrade('b', 14) } },
        22: { description: "Booster effect ^1.2 and prestige x1.5.", cost: new Decimal(12), unlocked() { return hasUpgrade('b', 21) }, effect(){ return new Decimal(1.2)} },
        23: { description: "Boosters boost Mana gain.", cost: new Decimal(20), effect(){ return player.b.points.add(1).pow(0.4)}, effectDisplay(){ return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('b',22) && player.m.unlocked }},
        31: { description: "Unlock B challenge: Overclocked.", cost: new Decimal(50), unlocked(){ return hasUpgrade('b',23)} },
        32: { description: "Gain 1 free Booster Engine level.", cost: new Decimal(100), unlocked(){ return hasUpgrade('b',31)}, onPurchase(){ setBuyableAmount('b',11, getBuyableAmount('b',11).add(1)) }},
        33: { description: "B milestones also give +1 free Generator.", cost: new Decimal(250), unlocked(){ return hasUpgrade('b',32)} },
        // Row 4 — Row 3/4 era
        41: { title: "Hyper Boosters", description: "Hyper points boost B effect.", cost: new Decimal(500), effect(){ return player.h.points.add(1).pow(0.3)}, effectDisplay(){ return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('b',33) && player.h.unlocked} },
        42: { description: "B effect softcap is 10x weaker. B cost scaling -20%.", cost: new Decimal(1000), unlocked(){ return hasUpgrade('b',41)} },
        43: { description: "Unlock B challenge 2: Booster Overdrive.", cost: new Decimal(2000), unlocked(){ return hasUpgrade('b',42)} },
        51: { title: "Eternal Boosters", description: "Eternity points boost B effect.", cost: new Decimal(5000), effect(){ return player.e.points.add(1).pow(0.5)}, effectDisplay(){ return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('b',43) && player.e.unlocked} },
        52: { description: "B effect ^1.3. All B buyables are 50% cheaper.", cost: new Decimal(10000), unlocked(){ return hasUpgrade('b',51)} },
        53: { description: "Gain 25% boosters passively. B milestones also boost points.", cost: new Decimal(25000), unlocked(){ return hasUpgrade('b',52)} },
    },
    buyables: {
        11: {
            title: "Booster Engine", cost(x) { return new Decimal(10).pow(x.pow(1.25)) }, effect(x) { let eff = Decimal.pow(3, x); if (hasUpgrade('g', 13)) eff = eff.pow(1.2); if(hasUpgrade('b',22)) eff=eff.times(1.5); return eff; },
            display() { let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" boosters<br>Amount: "+formatWhole(player.b.buyables[this.id])+"<br>Effect: "+format(d.effect)+"x to points" },
            unlocked() { return hasUpgrade('b', 21) }, canAfford() { return player.b.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() { let c=tmp[this.layer].buyables[this.id].cost; player.b.points=player.b.points.sub(c); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); },
            buyMax(){ buyMaxLevels(this.layer, this.id, player.b) },
            style: {'height':'120px'},
        },
        12: {
            title: "Booster Farm", cost(x){ return new Decimal(100).pow(x).times(10) }, effect(x){ return Decimal.pow(2, x)},
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" prestige points<br>Amount: "+formatWhole(player.b.buyables[this.id])+"<br>Effect: "+format(d.effect)+"x to B effect"},
            unlocked(){ return hasMilestone('b',4)}, canAfford(){ return player.p.points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy(){ let c=tmp[this.layer].buyables[this.id].cost; player.p.points=player.p.points.sub(c); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); },
            buyMax(){ buyMaxLevels(this.layer, this.id, player.p) },
            style:{'height':'110px'},
        },
        13: {
            title: "Auto-Booster", cost(x){ return new Decimal(1000).pow(x).times(1e4) }, effect(x){ return x.gte(1) ? new Decimal(1.1).pow(x) : new Decimal(1) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" points<br>Amount: "+formatWhole(player.b.buyables[this.id])+"<br>Effect: passive B gain "+format(d.effect.times(100).sub(100))+"%"},
            unlocked(){ return hasMilestone('b',5)}, canAfford(){ return player.points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy(){ let c=tmp[this.layer].buyables[this.id].cost; player.points=player.points.sub(c); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); },
            buyMax(){ buyMaxLevels(this.layer, this.id, player) },
            style:{'height':'110px'},
        },
    },
    challenges: {
        11: {
            name: "Overclocked", challengeDescription: "You can only have 1 booster. Prestige gain is ^0.5.",
            goalDescription: "Reach 1e8 points with 1 booster", canComplete(){ return player.points.gte(1e8) && player.b.points.lte(1) },
            rewardDescription: "B effect x1.5 and keep B upgrades on reset",
            rewardEffect(){ return new Decimal(1.5)}, rewardDisplay(){ return format(this.rewardEffect())+"x"},
            unlocked(){ return hasUpgrade('b',31)},
        },
        12: {
            name: "Booster Overdrive",
            challengeDescription: "B effect is inverted (divides instead of multiplies). Point gain ^0.3.",
            goalDescription: "Reach 1e15 points", canComplete(){ return player.points.gte(1e15) },
            rewardDescription: "B effect ^1.5 and B buyables are 2x cheaper",
            unlocked(){ return hasUpgrade('b',43)},
        },
    },
    milestones: {
        0: { requirementDescription: "1 booster", effectDescription: "Keep P upgrades, gain 2x points", done() {return player.b.best.gte(1)} },
        1: { requirementDescription: "3 boosters", effectDescription: "Unlock another P upgrade. Autobuy B.", done() {return player.b.best.gte(3)}, toggles: [["b","auto"]], unlocked() {return hasMilestone('b',0)} },
        2: { requirementDescription: "6 boosters", effectDescription: "B cost /1.5", done() {return player.b.best.gte(6)}, unlocked() {return hasMilestone('b',1)} },
        3: { requirementDescription: "10 boosters", effectDescription: "Auto-prestige for boosters", done() {return player.b.best.gte(10)}, unlocked() {return hasMilestone('b',2)} },
        4: { requirementDescription: "20 boosters", effectDescription: "Unlock Booster Farm buyable", done(){ return player.b.best.gte(20)}, unlocked(){return hasMilestone('b',3)} },
        5: { requirementDescription: "35 boosters", effectDescription: "B cost /2, points x3", done(){ return player.b.best.gte(35)}, unlocked(){return hasMilestone('b',4)} },
        6: { requirementDescription: "50 boosters", effectDescription: "Gain 10% boosters passively", done(){ return player.b.best.gte(50)}, unlocked(){return hasMilestone('b',5)} },
        7: { requirementDescription: "100 boosters", effectDescription: "B effect softcap removed, B cost /3", done(){ return player.b.best.gte(100)}, unlocked(){return hasMilestone('b',6)} },
        8: { requirementDescription: "200 boosters", effectDescription: "B effect ^2, gain 50% boosters passively", done(){ return player.b.best.gte(200)}, unlocked(){return hasMilestone('b',7)} },
    },
    passiveGeneration(){ return hasMilestone('b',8) ? 0.5 : hasMilestone('b',6) ? 0.1 : 0 },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let keep = []
            if (hasMilestone('b', 0)) keep.push("milestones")
            if (hasMilestone('b', 1) || hasChallenge('b',11)) keep.push("upgrades")
            if (hasMilestone('b',4)) keep.push("buyables")
            layerDataReset(this.layer, keep)
        }
    },
    tabFormat: ["main-display","prestige-button","resource-display","blank",["bar","boosterBar"],"blank","milestones","blank","upgrades","blank","buyables","blank","challenges"],
})

// ---------------- ROW 1 MIDDLE: GENERATORS (G) - Expanded ----------------
addLayer("g", {
    name: "generators", symbol: "G", position: 1,
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), total: new Decimal(0), auto: false }},
    color: "#0080FF",
    requires: new Decimal(20), resource: "generators", baseResource: "prestige points", baseAmount() {return player.p.points},
    type: "normal", exponent: 0.4, gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('g', 11)) mult = mult.times(upgradeEffect('g', 11))
        if (hasUpgrade('b', 13)) mult = mult.times(1.5)
        if (hasUpgrade('p', 41)) mult = mult.times(2)
        if (hasMilestone('g', 5)) mult = mult.times(2)
        return mult
    }, gainExp() { return new Decimal(1) },
    row: 1, branches: ["p"],
    layerShown() { return hasUpgrade('p', 22) || player.g.unlocked },
    effect() {
        let eff = Decimal.pow(2, player.g.points).times(buyableEffect('g', 11))
        if (hasUpgrade('g', 14)) eff = eff.pow(1.1)
        if (hasUpgrade('g', 23)) eff = eff.times(upgradeEffect('g', 23))
        if (hasUpgrade('w', 12)) eff = eff.times(1.5)
        if (hasUpgrade('g', 41)) eff = eff.times(upgradeEffect('g', 41))
        if (hasUpgrade('g', 51)) eff = eff.times(upgradeEffect('g', 51))
        if (hasMilestone('g',7)) eff = eff.pow(2)
        if (hasAchievement('a',72)) eff = eff.pow(1.5)
        return eff
    },
    effectDescription() { return "which are boosting points by "+format(tmp.g.effect)+"x" },
    bars: {
        power: { direction: RIGHT, width: 320, height: 20, progress() { return player.g.points.div(30).toNumber() }, display() { return format(player.g.points)+"/30 generators"}, fillStyle: {'background-color': "#0080FF"}, baseStyle: {'background-color': "#222"}, textStyle: {'color': "white"}, },
        overcharge: { direction: UP, width: 40, height: 200, progress() { return getBuyableAmount('g', 11).div(15).toNumber() }, display() { return formatWhole(getBuyableAmount('g',11))+"/15" }, fillStyle: {'background-color': "#00FFFF"}, unlocked() { return hasUpgrade('g', 12) }, },
        gridPower: { direction: RIGHT, width: 300, height: 18, progress(){ return getBuyableAmount('g',13).div(5).toNumber()}, display(){ return "Grid Tech: "+formatWhole(getBuyableAmount('g',13))+"/5"}, fillStyle:{'background-color':"#44ff44"}, unlocked(){ return hasMilestone('g',5)}, },
    },
    grid: {
        rows: 3, cols: 3, maxRows: 3, maxCols: 3,
        getStartData(id){ return 0 },
        getUnlocked(id){ return hasMilestone('g',4) },
        getCanClick(data, id){ return player.g.points.gte(5) && data < 2 },
        getStyle(data, id){ if(data==0) return {'background-color':"#222"}; if(data==1) return {'background-color':"#0080FF"}; return {'background-color':"#00ff00"}; },
        onClick(data, id){
            let cur = player.g.grid[id];
            if(cur < 2){
                if(player.g.points.gte(5)){
                    player.g.points = player.g.points.sub(5);
                    player.g.grid[id] = cur + 1;
                }
            }
        },
        getTitle(data, id){ return "Tile "+id },
        getDisplay(data, id){ return data==0?"Empty":data==1?"Charged":"Overcharged" },
        getTooltip(data, id){ return "Cost: 5 generators. Click to upgrade." },
    },
    upgrades: {
        11: { description: "Generators boost prestige gain.", cost: new Decimal(2), effect() { return player.g.points.add(1).pow(0.6) }, effectDisplay() { return format(this.effect())+"x" } },
        12: { description: "Generators boost P's effect.", cost: new Decimal(5), effect() { return player.g.points.add(1).pow(0.25) }, effectDisplay() { return format(this.effect())+"x" }, unlocked() { return hasUpgrade('g', 11) } },
        13: { description: "Booster Engine buyable is 20% stronger.", cost: new Decimal(8), unlocked() { return hasUpgrade('g', 12) } },
        14: { description: "Generator effect ^1.1", cost: new Decimal(15), unlocked() { return hasUpgrade('g', 13) } },
        21: { description: "Unlock Grid (3x3). Spend G to charge tiles for +10% each.", cost: new Decimal(25), unlocked(){ return hasUpgrade('g',14)} },
        22: { description: "Grid gives +0.1x per Overcharged tile to point gain.", cost: new Decimal(50), effect(){ let c=0; for(let id in player.g.grid) if(player.g.grid[id]==2) c++; return new Decimal(1).add(c*0.1)}, effectDisplay(){ return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('g',21)} },
        23: { description: "Generators boost Warp gain.", cost: new Decimal(100), effect(){ return player.g.points.add(1).pow(0.3)}, effectDisplay(){ return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('g',22) && player.w.unlocked }},
        31: { description: "Unlock G challenge: Blackout.", cost: new Decimal(250), unlocked(){ return hasUpgrade('g',23)} },
        32: { description: "Keep G grid on reset.", cost: new Decimal(500), unlocked(){ return hasUpgrade('g',31)} },
        33: { description: "G milestones give +1 Mana.", cost: new Decimal(1000), effect(){ return new Decimal(1)}, unlocked(){ return hasUpgrade('g',32) && player.m.unlocked }},
        // Row 4 — Hyper/Quantum era
        41: { title: "Hyper Generators", description: "Hyper points boost G effect.", cost: new Decimal(5000), effect(){ return player.h.points.add(1).pow(0.3)}, effectDisplay(){ return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('g',33) && player.h.unlocked} },
        42: { description: "Generator effect ^1.2. Grid tiles give double bonus.", cost: new Decimal(10000), unlocked(){ return hasUpgrade('g',41)} },
        43: { description: "Unlock G challenge 2: Generator Overload.", cost: new Decimal(25000), unlocked(){ return hasUpgrade('g',42)} },
        51: { title: "Eternal Generators", description: "Eternity points boost G effect.", cost: new Decimal(50000), effect(){ return player.e.points.add(1).pow(0.5)}, effectDisplay(){ return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('g',43) && player.e.unlocked} },
        52: { description: "G effect ^1.3. All G buyables are 50% cheaper.", cost: new Decimal(100000), unlocked(){ return hasUpgrade('g',51)} },
        53: { description: "Gain 25% generators passively. Grid auto-clicks.", cost: new Decimal(250000), unlocked(){ return hasUpgrade('g',52)} },
    },
    challenges: {
        11: {
            name: "Blackout", challengeDescription: "Point gain ^0.4, G effect disabled.",
            goalDescription: "Reach 1e9 points", canComplete(){ return player.points.gte(1e9)},
            rewardDescription: "G effect x2", rewardEffect(){ return new Decimal(2)}, unlocked(){ return hasUpgrade('g',31)},
        },
        12: {
            name: "Generator Overload", challengeDescription: "Grid tiles cost 50 G each. All G buyables are disabled. Point gain ^0.3.",
            goalDescription: "Reach 1e18 points", canComplete(){ return player.points.gte(1e18)},
            rewardDescription: "G effect ^1.5 and Grid bonus doubled",
            unlocked(){ return hasUpgrade('g',43)},
        },
    },
    buyables: {
        11: {
            title: "Generator Mk I", cost(x) { if (x.gte(10)) x = x.pow(1.5).div(10).pow(0.5); return new Decimal(5).pow(x).times(10) },
            effect(x) { let eff = Decimal.pow(1.8, x); return eff },
            display() { let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" prestige<br>Amount: "+formatWhole(player.g.buyables[this.id])+"<br>Effect: "+format(d.effect)+"x to G effect" },
            unlocked() { return true }, canAfford() { return player.p.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() { let c=tmp[this.layer].buyables[this.id].cost; player.p.points=player.p.points.sub(c); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); },
            buyMax(){ buyMaxLevels(this.layer, this.id, player.p) },
            style: {'height':'120px'}, purchaseLimit: new Decimal(25),
        },
        12: {
            title: "Generator Mk II", cost(x) { return new Decimal(1000).pow(x).times(1e6) }, effect(x) { return Decimal.pow(10, x) },
            display() { let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" points<br>Amount: "+formatWhole(player.g.buyables[this.id])+"<br>Effect: "+format(d.effect)+"x to points" },
            unlocked() { return hasMilestone('g', 2) }, canAfford() { return player.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() { let c=tmp[this.layer].buyables[this.id].cost; player.points=player.points.sub(c); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); },
            buyMax(){ buyMaxLevels(this.layer, this.id, player) },
            style: {'height':'120px'},
        },
        13: {
            title: "Generator Core", cost(x){ return new Decimal(1e6).pow(x).times(1e12) }, effect(x){ return Decimal.pow(5, x)},
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" points<br>Amount: "+formatWhole(player.g.buyables[this.id])+"<br>Effect: "+format(d.effect)+"x to Warp gain"},
            unlocked(){ return hasMilestone('g',5)}, canAfford(){ return player.points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy(){ let c=tmp[this.layer].buyables[this.id].cost; player.points=player.points.sub(c); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); },
            buyMax(){ buyMaxLevels(this.layer, this.id, player) },
            style:{'height':'110px'},
        },
    },
    clickables: {
        11: {
            title: "Overclock!", display() { return "Click to gain 10% of G gain instantly!<br>Cooldown: "+format(player.g.clickables[11] || 0)+"s" },
            canClick() { return (player.g.clickables[11]||0) <= 0 }, onClick() { let gain = tmp.g.resetGain.times(0.1).max(1); player.g.points = player.g.points.add(gain); player.g.clickables[11] = 5 },
            style: {'height':'100px', 'background-color':'#004488'}, unlocked() { return hasMilestone('g', 1) },
        },
        12: {
            title: "Grid Overload", display(){ return "Spend 20 G to +1 all grid tiles<br>Cost: 20 G" },
            canClick(){ return player.g.points.gte(20) && hasMilestone('g',4) }, onClick(){ if(player.g.points.gte(20)){ player.g.points=player.g.points.sub(20); for(let id in player.g.grid) if(player.g.grid[id]<2) player.g.grid[id]++; }},
            style:{'height':'80px','background-color':'#005500'}, unlocked(){ return hasUpgrade('g',21)},
        },
    },
    milestones: {
        0: { requirementDescription: "2 generators", effectDescription: "Prestige gain x2, keep P upgrades", done() {return player.g.best.gte(2)} },
        1: { requirementDescription: "5 generators", effectDescription: "Unlock clickables + keep G buyables on reset", done() {return player.g.best.gte(5)}, unlocked() {return hasMilestone('g',0)} },
        2: { requirementDescription: "10 generators", effectDescription: "Unlock Mk II buyable & bars", done() {return player.g.best.gte(10)}, unlocked() {return hasMilestone('g',1)} },
        3: { requirementDescription: "20 generators", effectDescription: "Gain 50% of G gain per second passively", done() {return player.g.best.gte(20)}, unlocked() {return hasMilestone('g',2)} },
        4: { requirementDescription: "35 generators", effectDescription: "Unlock Grid", done(){ return player.g.best.gte(35)}, unlocked(){return hasMilestone('g',3)} },
        5: { requirementDescription: "60 generators", effectDescription: "Unlock Core buyable, keep grid", done(){ return player.g.best.gte(60)}, unlocked(){return hasMilestone('g',4)} },
        6: { requirementDescription: "100 generators", effectDescription: "G effect softcap removed, G cost /3", done(){ return player.g.best.gte(100)}, unlocked(){return hasMilestone('g',5)} },
        7: { requirementDescription: "200 generators", effectDescription: "G effect ^2, gain 50% generators passively", done(){ return player.g.best.gte(200)}, unlocked(){return hasMilestone('g',6)} },
        8: { requirementDescription: "500 generators", effectDescription: "Grid tiles auto-charge, G buyables scale 3x slower", done(){ return player.g.best.gte(500)}, unlocked(){return hasMilestone('g',7)} },
    },
    update(diff) { if (player.g.clickables[11] > 0) player.g.clickables[11] = Math.max(0, player.g.clickables[11] - diff) },
    passiveGeneration() { return hasMilestone('g', 7) ? 0.5 : hasMilestone('g', 3) ? 0.5 : 0 },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let keep = []
            if (hasMilestone('g', 0)) keep.push("milestones")
            if (hasMilestone('g', 1)) keep.push("buyables")
            if (hasMilestone('g', 4) && hasUpgrade('g',32)) keep.push("grid")
            layerDataReset(this.layer, keep)
        }
    },
    tabFormat: {
        "Generators": { content: ["main-display","prestige-button","resource-display","blank",["bar","power"],"blank","milestones","blank","upgrades","blank","buyables","blank","clickables"]},
        "Grid": { content: [["display-text", function(){return "Grid: Spend 5 G per tile. Overcharged tiles give huge bonus!"}], "blank","grid","blank",["bar","gridPower"],"blank","clickables"], unlocked(){ return hasMilestone('g',4)}},
        "Stats": { content: [["display-text", function() {return "You have "+formatWhole(player.g.points)+" generators, boosting points by "+format(tmp.g.effect)+"x" }], "blank", ["bar","overcharge"], "blank", ["display-text", function() {return "Mk I amount: "+formatWhole(getBuyableAmount('g',11))+" (effect "+format(buyableEffect('g',11))+"x) | Grid: "+Object.values(player.g.grid).filter(v=>v==2).length+" overcharged"}]], unlocked() {return hasMilestone('g',2)} },
    },
})

// ---------------- ROW 1 RIGHT: MANA (M) - NEW ----------------
addLayer("m", {
    name: "mana", symbol: "M", position: 2,
    startData(){ return { unlocked: false, points: new Decimal(0), best: new Decimal(0), auto: false }},
    color: "#00FF88",
    requires: new Decimal(50), resource: "mana", baseResource: "prestige points", baseAmount(){ return player.p.points },
    type: "normal", exponent: 0.45,
    gainMult(){
        let m=new Decimal(1);
        if(hasUpgrade('m',12)) m=m.times(upgradeEffect('m',12));
        if(hasUpgrade('b',23)) m=m.times(upgradeEffect('b',23));
        if(hasUpgrade('g',33)) m=m.times(2);
        if(hasMilestone('m',2)) m=m.times(2);
        return m;
    },
    gainExp(){ return new Decimal(1)},
    row: 1, branches: ["p"],
    layerShown(){ return hasUpgrade('p',33) || player.m.unlocked },
    effect(){
        let eff=player.m.points.add(1).pow(0.6);
        if(hasUpgrade('m',13)) eff=eff.pow(1.3);
        if(hasUpgrade('p',32)) eff=eff.times(1.2);
        if(hasUpgrade('m',41)) eff=eff.times(upgradeEffect('m',41));
        if(hasUpgrade('m',51)) eff=eff.times(upgradeEffect('m',51));
        if(hasMilestone('m',4)) eff=eff.pow(1.5);
        if(hasMilestone('m',5)) eff=eff.pow(2);
        if(hasAchievement('a',73)) eff=eff.pow(1.5);
        return eff;
    },
    effectDescription(){ return "which boost point & prestige gain by "+format(tmp.m.effect)+"x" },
    bars: {
        manaBar: { direction: RIGHT, width: 320, height: 20, progress(){ return player.m.points.div(50).toNumber()}, display(){ return format(player.m.points)+" / 50 mana"}, fillStyle:{'background-color':"#00FF88"}, baseStyle:{'background-color':"#003322"}, },
        spellCharge: { direction: UP, width: 35, height: 180, progress(){ return getBuyableAmount('m',11).div(10).toNumber()}, display(){ return formatWhole(getBuyableAmount('m',11))+"/10"}, fillStyle:{'background-color':"#88ff88"}, unlocked(){return hasUpgrade('m',11)}, },
    },
    upgrades: {
        11: { description: "Mana boosts prestige gain.", cost: new Decimal(3), effect(){ return player.m.points.add(1).pow(0.5)}, effectDisplay(){return format(this.effect())+"x"} },
        12: { description: "Points boost mana gain.", cost: new Decimal(5), effect(){ return player.points.add(1).log10().add(1).pow(0.6)}, effectDisplay(){return format(this.effect())+"x"}, unlocked(){return hasUpgrade('m',11)} },
        13: { description: "Mana effect ^1.3.", cost: new Decimal(10), unlocked(){return hasUpgrade('m',12)} },
        21: { description: "Unlock Mana Spells buyables.", cost: new Decimal(20), unlocked(){return hasUpgrade('m',13)} },
        22: { description: "Mana Spells boost B effect.", cost: new Decimal(50), effect(){ return buyableEffect('m',11).pow(0.3)}, effectDisplay(){return format(this.effect())+"x"}, unlocked(){return hasUpgrade('m',21)} },
        23: { description: "Gain 25% mana per second passively.", cost: new Decimal(100), unlocked(){return hasUpgrade('m',22)} },
        31: { description: "Unlock M challenge: Drought.", cost: new Decimal(250), unlocked(){return hasUpgrade('m',23)} },
        32: { description: "Keep M upgrades on W reset.", cost: new Decimal(500), unlocked(){return hasUpgrade('m',31)} },
        // Row 4 — Hyper/Quantum era
        41: { title: "Hyper Mana", description: "Hyper points boost Mana effect.", cost: new Decimal(2000), effect(){ return player.h.points.add(1).pow(0.3)}, effectDisplay(){ return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('m',32) && player.h.unlocked} },
        42: { description: "Mana effect ^1.3. Mana Spells are 50% cheaper.", cost: new Decimal(5000), unlocked(){ return hasUpgrade('m',41)} },
        43: { description: "Unlock M challenge 2: Mana Storm.", cost: new Decimal(10000), unlocked(){ return hasUpgrade('m',42)} },
        51: { title: "Eternal Mana", description: "Eternity points boost Mana effect.", cost: new Decimal(25000), effect(){ return player.e.points.add(1).pow(0.5)}, effectDisplay(){ return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('m',43) && player.e.unlocked} },
        52: { description: "Gain 50% mana passively. Mana Spells give double bonus.", cost: new Decimal(50000), unlocked(){ return hasUpgrade('m',51)} },
    },
    buyables: {
        11: {
            title: "Mana Spell", cost(x){ return new Decimal(10).pow(x).times(10) },
            effect(x){ let eff=Decimal.pow(2, x); if(hasUpgrade('m',22)) eff=eff.pow(1.2); return eff; },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" mana<br>Amount: "+formatWhole(player.m.buyables[this.id])+"<br>Effect: "+format(d.effect)+"x to points"},
            unlocked(){ return hasUpgrade('m',21)}, canAfford(){ return player.m.points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy(){ let c=tmp[this.layer].buyables[this.id].cost; player.m.points=player.m.points.sub(c); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); },
            buyMax(){ buyMaxLevels(this.layer, this.id, player.m) },
            style:{'height':'110px'},
        },
        12: {
            title: "Enchanted Prestige", cost(x){ return new Decimal(100).pow(x).times(1000) },
            effect(x){ return Decimal.pow(3, x)},
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" points<br>Amount: "+formatWhole(player.m.buyables[this.id])+"<br>Effect: "+format(d.effect)+"x to prestige gain"},
            unlocked(){ return hasMilestone('m',2)}, canAfford(){ return player.points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy(){ let c=tmp[this.layer].buyables[this.id].cost; player.points=player.points.sub(c); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); },
            buyMax(){ buyMaxLevels(this.layer, this.id, player) },
            style:{'height':'110px'},
        },
    },
    challenges: {
        11: {
            name: "Drought", challengeDescription: "Mana gain is ^0.1, point gain ^0.7",
            goalDescription: "Reach 1e9 points", canComplete(){ return player.points.gte(1e9)},
            rewardDescription: "Mana effect x2", rewardEffect(){return new Decimal(2)}, unlocked(){ return hasUpgrade('m',31)},
        },
        12: {
            name: "Mana Storm", challengeDescription: "All Mana Spells are disabled. Point gain ^0.3.",
            goalDescription: "Reach 1e15 points", canComplete(){ return player.points.gte(1e15)},
            rewardDescription: "M effect ^1.5 and M buyables are 2x cheaper",
            unlocked(){ return hasUpgrade('m',43)},
        },
    },
    clickables: {
        11: {
            title: "Channel Mana", display(){ return "Gain 20% of mana gain<br>Cooldown: "+format(player.m.clickables[11]||0)+"s"},
            canClick(){ return (player.m.clickables[11]||0)<=0 && hasUpgrade('m',21)}, onClick(){ let g=tmp.m.resetGain.times(0.2).max(1); player.m.points=player.m.points.add(g); player.m.clickables[11]=8; },
            style:{'height':'90px','background-color':'#008855'}, unlocked(){ return hasMilestone('m',1)},
        }
    },
    milestones: {
        0: { requirementDescription: "3 mana", effectDescription: "Keep P upgrades, prestige x2", done(){ return player.m.best.gte(3)} },
        1: { requirementDescription: "10 mana", effectDescription: "Unlock Channel, keep M buyables", done(){ return player.m.best.gte(10)}, unlocked(){return hasMilestone('m',0)} },
        2: { requirementDescription: "25 mana", effectDescription: "Mana gain x2, unlock Enchanted buyable", done(){ return player.m.best.gte(25)}, unlocked(){return hasMilestone('m',1)} },
        3: { requirementDescription: "60 mana", effectDescription: "Gain 25% mana passively, keep milestones", done(){ return player.m.best.gte(60)}, unlocked(){return hasMilestone('m',2)} },
        4: { requirementDescription: "150 mana", effectDescription: "M effect ^1.5, M buyables scale 2x slower", done(){ return player.m.best.gte(150)}, unlocked(){return hasMilestone('m',3)} },
        5: { requirementDescription: "500 mana", effectDescription: "M effect ^2, gain 100% mana passively", done(){ return player.m.best.gte(500)}, unlocked(){return hasMilestone('m',4)} },
    },
    update(diff){ if(player.m.clickables[11]>0) player.m.clickables[11]=Math.max(0, player.m.clickables[11]-diff); },
    passiveGeneration(){ return hasMilestone('m',5) ? 1.0 : hasUpgrade('m',23) ? 0.25 : hasMilestone('m',3) ? 0.25 : 0 },
    doReset(resettingLayer){
        if(layers[resettingLayer].row > this.row){
            let keep=[];
            if(hasMilestone('m',0)) keep.push("milestones");
            if(hasMilestone('m',1)) keep.push("buyables");
            if(hasUpgrade('m',32)) keep.push("upgrades");
            layerDataReset(this.layer, keep);
        }
    },
    tabFormat: ["main-display","prestige-button","resource-display","blank",["bar","manaBar"],"blank","milestones","blank","upgrades","blank","buyables","blank","clickables","blank",["bar","spellCharge"]],
})

// ---------------- ROW 2: TIME (T) - Expanded ----------------
addLayer("t", {
    name: "time shards", symbol: "T", position: 0,
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), auto: false }},
    color: "#AA00FF",
    requires: new Decimal(2000), resource: "time shards", baseResource: "prestige points", baseAmount() {return player.p.points},
    type: "normal", exponent: 0.3,
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('t', 12)) mult = mult.times(2)
        if (hasUpgrade('t', 22)) mult = mult.times(3)
        if (player.b.points.gte(5)) mult = mult.times(player.b.points)
        if (hasUpgrade('p',41)) mult = mult.times(1.5)
        if (hasMilestone('t',4)) mult = mult.times(2)
        if (player.r && hasUpgrade('r',11)) mult = mult.times(upgradeEffect('r',11))
        return mult
    },
    gainExp() { return new Decimal(1) },
    row: 2, branches: [["b","#FF8800"], ["g","#0080FF"]],
    layerShown() { return hasMilestone('b', 2) && hasMilestone('g', 2) || player.t.unlocked },
    effect() {
        let eff = player.t.points.add(1).pow(0.7)
        if (hasChallenge('t', 11)) eff = eff.times(challengeEffect('t', 11))
        if (hasChallenge('t', 12)) eff = eff.times(challengeEffect('t', 12))
        if (hasUpgrade('t', 23)) eff = eff.pow(1.15)
        return eff
    },
    effectDescription() { return "which are boosting points & prestige by "+format(tmp.t.effect)+"x" },
    infoboxes: {
        lore: {
            title: "The Time Rift",
            body: "At row 2, the tree converges. Time Shards need BOTH boosters and generators. Enter challenges to multiply your power!<br><br>Tip: Do T challenges in order. Reward from 11 helps with 12. New: Try Warp after Time!",
            unlocked() { return true },
        },
    },
    bars: {
        timeBar: { direction: RIGHT, width: 400, height: 25, progress() { return player.t.points.div(player.t.points.add(10)).toNumber() }, display() { return format(player.t.points)+" time shards" }, fillStyle: {'background-color': "#AA00FF"}, unlocked() { return true }, },
        challengeBar: { direction: RIGHT, width: 300, height: 18, progress(){ return new Decimal(challengeCompletions('t',11)+challengeCompletions('t',12)).div(4).toNumber()}, display(){ return "T Challenges: "+(challengeCompletions('t',11)+challengeCompletions('t',12))+"/4"}, fillStyle:{'background-color':"#cc88ff"}, unlocked(){ return hasChallenge('t',11)}, },
    },
    upgrades: {
        11: { description: "Time Shards boost G effect.", cost: new Decimal(1), effect() { return player.t.points.add(1).pow(0.5) }, effectDisplay() { return format(this.effect())+"x" } },
        12: { description: "Double T gain.", cost: new Decimal(2), unlocked() { return hasUpgrade('t', 11) } },
        13: { description: "Unlock Hyper layer.", cost: new Decimal(5), unlocked() { return hasUpgrade('t', 12) } },
        21: { description: "T effect ^1.15 and unlock Warp (W).", cost: new Decimal(20), effect(){ return new Decimal(1.15)}, unlocked(){ return hasUpgrade('t',13) && hasMilestone('t',2)} },
        22: { description: "T gain x3 and keep B/G on W reset.", cost: new Decimal(50), unlocked(){ return hasUpgrade('t',21)} },
        23: { description: "Time Shards boost Mana gain x2.", cost: new Decimal(100), effect(){ return new Decimal(2)}, unlocked(){ return hasUpgrade('t',22)} },
        31: { description: "Unlock T buyables.", cost: new Decimal(500), unlocked(){ return hasUpgrade('t',23) && hasMilestone('t',3)} },
        32: { description: "Auto-prestige T.", cost: new Decimal(2000), unlocked(){ return hasUpgrade('t',31)} },
        // Row 4 — Hyper/Quantum era
        41: { title: "Hyper Time", description: "Hyper points boost T effect.", cost: new Decimal(5000), effect(){ return player.h.points.add(1).pow(0.3)}, effectDisplay(){ return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('t',32) && player.h.unlocked} },
        42: { description: "T effect ^1.3. T buyables are 50% cheaper.", cost: new Decimal(10000), unlocked(){ return hasUpgrade('t',41)} },
        43: { description: "T milestones also boost Eternity gain.", cost: new Decimal(25000), effect(){ let count=0; for(let i=0;i<=7;i++) if(hasMilestone('t',i)) count++; return new Decimal(1).add(count*0.1)}, effectDisplay(){ return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('t',42)} },
        51: { title: "Eternal Time", description: "Eternity points boost T effect.", cost: new Decimal(50000), effect(){ return player.e.points.add(1).pow(0.5)}, effectDisplay(){ return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('t',43) && player.e.unlocked} },
        52: { description: "T effect ^1.5. Gain 50% T passively.", cost: new Decimal(100000), unlocked(){ return hasUpgrade('t',51)} },
    },
    buyables: {
        11: {
            title: "Time Accelerator", cost(x){ return new Decimal(10).pow(x).times(10) }, effect(x){ return Decimal.pow(2, x)},
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" time shards<br>Amount: "+formatWhole(player.t.buyables[this.id])+"<br>Effect: "+format(d.effect)+"x to point gain"},
            unlocked(){ return hasUpgrade('t',31)}, canAfford(){ return player.t.points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy(){ let c=tmp[this.layer].buyables[this.id].cost; player.t.points=player.t.points.sub(c); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); },
            buyMax(){ buyMaxLevels(this.layer, this.id, player.t) },
            style:{'height':'110px'},
        },
        12: {
            title: "Chronal Prestige", cost(x){ return new Decimal(100).pow(x).times(100) }, effect(x){ return Decimal.pow(1.8, x)},
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" time shards<br>Amount: "+formatWhole(player.t.buyables[this.id])+"<br>Effect: "+format(d.effect)+"x to prestige gain"},
            unlocked(){ return hasUpgrade('t',31) && player.w.unlocked}, canAfford(){ return player.t.points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy(){ let c=tmp[this.layer].buyables[this.id].cost; player.t.points=player.t.points.sub(c); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); },
            buyMax(){ buyMaxLevels(this.layer, this.id, player.t) },
            style:{'height':'110px'},
        },
    },
    clickables: {
        11: {
            title: "Time Warp", display(){ return "Reset T progress but gain 5% of T gain<br>Cooldown: "+format(player.t.clickables[11]||0)+"s"},
            canClick(){ return (player.t.clickables[11]||0)<=0 && player.t.unlocked}, onClick(){ let g=tmp.t.resetGain.times(0.05).max(1); player.t.points=player.t.points.add(g); player.t.clickables[11]=10; },
            style:{'height':'90px','background-color':'#6600aa'}, unlocked(){ return hasMilestone('t',2)},
        }
    },
    challenges: {
        11: {
            name: "Slowdown", challengeDescription: "Point gain is square-rooted (much slower).", goalDescription: "Reach 1e6 points", canComplete() { return player.points.gte(1e6) },
            rewardDescription: "Time effect is stronger (x^1.2)", rewardEffect() { let eff = player.t.points.add(1).pow(0.2); return eff }, rewardDisplay() { return format(this.rewardEffect())+"x" }, unlocked() { return player.t.unlocked },
        },
        12: {
            name: "Taxation", challengeDescription: "You can't buy P upgrades 11-14. Point gain ^0.7", goalDescription: "Reach 5e7 points", canComplete() { return player.points.gte(5e7) },
            rewardDescription: "Gain 2x more prestige points", rewardEffect() { return new Decimal(2) }, rewardDisplay() { return format(this.rewardEffect())+"x" }, unlocked() { return hasChallenge('t', 11) }, countsAs: [11],
        },
        21: {
            name: "Hyper Tax", challengeDescription: "Boosters and Generators do nothing. G effect is disabled.", goalDescription: "Reach 1e10 points", canComplete() { return player.points.gte(1e10) },
            rewardDescription: "Keep B and G milestones on T reset", unlocked() { return hasChallenge('t', 12) },
        },
        22: {
            name: "Mana Drought", challengeDescription: "M effect disabled, P gain ^0.6", goalDescription: "Reach 1e12 points", canComplete(){ return player.points.gte(1e12)},
            rewardDescription: "M effect x2", rewardEffect(){ return new Decimal(2)}, unlocked(){ return hasChallenge('t',21) && player.m.unlocked },
        },
        31: {
            name: "Warped Time", challengeDescription: "W effect disabled, T gain ^0.5", goalDescription: "Reach 1e15 points", canComplete(){ return player.points.gte(1e15)},
            rewardDescription: "T & W gain x2", rewardEffect(){ return new Decimal(2)}, unlocked(){ return hasChallenge('t',22) && player.w.unlocked },
        },
    },
    milestones: {
        0: { requirementDescription: "1 time shard", effectDescription: "Keep B upgrades, gain 10% prestige passively", done() {return player.t.best.gte(1)} },
        1: { requirementDescription: "3 time shards", effectDescription: "Keep G upgrades+buyables, T gain x2", done() {return player.t.best.gte(3)}, unlocked() {return hasMilestone('t',0)} },
        2: { requirementDescription: "8 time shards", effectDescription: "Auto-buy T upgrades, keep T upgrades on next layer", done() {return player.t.best.gte(8)}, unlocked() {return hasMilestone('t',1)} },
        3: { requirementDescription: "25 time shards", effectDescription: "Unlock T buyables & Warp (W) on the tree", done(){ return player.t.best.gte(25)}, unlocked(){ return hasMilestone('t',2)} },
        4: { requirementDescription: "100 time shards", effectDescription: "T buyables x2, Warp gain x2", done(){ return player.t.best.gte(100)}, unlocked(){ return hasMilestone('t',3)} },
        5: { requirementDescription: "500 time shards", effectDescription: "Gain 20% T passively", done(){ return player.t.best.gte(500)}, unlocked(){ return hasMilestone('t',4)} },
        6: { requirementDescription: "2000 time shards", effectDescription: "T effect softcap removed, T buyables scale 3x slower", done(){ return player.t.best.gte(2000)}, unlocked(){ return hasMilestone('t',5)} },
        7: { requirementDescription: "10000 time shards", effectDescription: "T effect ^2, gain 100% T passively", done(){ return player.t.best.gte(10000)}, unlocked(){ return hasMilestone('t',6)} },
    },
    update(diff){ if(player.t.clickables[11]>0) player.t.clickables[11]=Math.max(0, player.t.clickables[11]-diff); },
    passiveGeneration(){ return hasMilestone('t',7) ? 1.0 : hasMilestone('t',5) ? 0.2 : hasUpgrade('t',32) ? 0.1 : 0 },
    autoUpgrade(){ return hasMilestone('t',2) },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
            let keep = ["milestones"]
            if (hasMilestone('t', 1) || hasChallenge('t', 21)) keep.push("upgrades")
            if (hasMilestone('t', 2)) keep.push("challenges")
            if (hasMilestone('t',3)) keep.push("buyables")
            layerDataReset(this.layer, keep)
        }
    },
    tabFormat: ["main-display","prestige-button","resource-display","blank",["infobox","lore"],"blank",["bar","timeBar"],"blank",["bar","challengeBar"],"blank","milestones","blank","upgrades","blank","buyables","blank","clickables","blank","challenges"],
})

// ---------------- ROW 2 MIDDLE: WARP (W) - NEW ----------------
addLayer("w", {
    name: "warp shards", symbol: "W", position: 1,
    startData(){ return { unlocked:false, points:new Decimal(0), best:new Decimal(0), auto:false }},
    color: "#00AAFF",
    requires: new Decimal(5000), resource: "warp shards", baseResource: "prestige points", baseAmount(){ return player.p.points },
    type: "normal", exponent: 0.28,
    gainMult(){
        let m=new Decimal(1);
        if(hasUpgrade('w',11)) m=m.times(upgradeEffect('w',11));
        if(hasUpgrade('t',31)) m=m.times(2);
        if(player.g.points.gte(10)) m=m.times(player.g.points.div(10).add(1));
        if(hasUpgrade('w',22)) m=m.times(3);
        if(player.r && hasUpgrade('r',11)) m=m.times(upgradeEffect('r',11));
        return m;
    },
    gainExp(){ return new Decimal(1)},
    row: 2, branches: [["g","#0080FF"], ["m","#00FF88"], ["t","#AA00FF"]],
    layerShown(){
        return hasUpgrade('t', 21)
            || hasMilestone('t', 3)
            || (hasMilestone('g', 4) && hasMilestone('m', 2))
            || player.w.unlocked
    },
    tooltipLocked(){
        return "Unlock Warp by buying Time upgrade 21, reaching 25 Time shards, or getting 35 Generators + 25 Mana"
    },
    effect(){
        let eff=player.w.points.add(1).pow(0.65);
        if(hasChallenge('w',11)) eff=eff.times(challengeEffect('w',11));
        if(hasUpgrade('w',13)) eff=eff.pow(1.2);
        return eff;
    },
    effectDescription(){ return "which boost points and time gain by "+format(tmp.w.effect)+"x"},
    infoboxes: {
        lore: { title: "Warp Rift", body: "Warp needs Generators + Mana. It converges with Time at Row 3. Warp challenges are brutal but Warp buyables are insane!", unlocked(){return true}},
    },
    bars: {
        warpBar: { direction: RIGHT, width: 380, height: 24, progress(){ return player.w.points.div(player.w.points.add(15)).toNumber()}, display(){ return format(player.w.points)+" warp shards"}, fillStyle:{'background-color':"#00AAFF"}, },
        charge: { direction: UP, width: 40, height: 180, progress(){ return getBuyableAmount('w',11).div(10).toNumber()}, display(){ return formatWhole(getBuyableAmount('w',11))+"/10"}, fillStyle:{'background-color':"#88ccff"}, unlocked(){return hasUpgrade('w',12)}, },
    },
    upgrades: {
        11: { description: "Warp boosts point gain.", cost: new Decimal(2), effect(){ return player.w.points.add(1).pow(0.5)}, effectDisplay(){return format(this.effect())+"x"} },
        12: { description: "Warp boosts Time gain.", cost: new Decimal(4), effect(){ return player.w.points.add(1).pow(0.4)}, effectDisplay(){return format(this.effect())+"x"}, unlocked(){return hasUpgrade('w',11)} },
        13: { description: "Warp effect ^1.2.", cost: new Decimal(10), unlocked(){return hasUpgrade('w',12)} },
        21: { description: "Unlock Warp buyables.", cost: new Decimal(25), unlocked(){return hasUpgrade('w',13)} },
        22: { description: "Warp gain x3.", cost: new Decimal(60), unlocked(){return hasUpgrade('w',21)} },
        23: { description: "Keep G/M upgrades on W reset.", cost: new Decimal(150), unlocked(){return hasUpgrade('w',22)} },
        31: { description: "Unlock W challenges.", cost: new Decimal(500), unlocked(){return hasUpgrade('w',23)} },
        32: { description: "Auto-warp prestige (toggle in milestones).", cost: new Decimal(2000), unlocked(){return hasUpgrade('w',31)} },
        // Row 4 — Hyper/Quantum era
        41: { title: "Hyper Warp", description: "Hyper points boost Warp effect.", cost: new Decimal(5000), effect(){ return player.h.points.add(1).pow(0.3)}, effectDisplay(){ return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('w',32) && player.h.unlocked} },
        42: { description: "Warp effect ^1.3. Warp buyables are 50% cheaper.", cost: new Decimal(10000), unlocked(){ return hasUpgrade('w',41)} },
        43: { description: "Warp milestones also boost Eternity gain.", cost: new Decimal(25000), effect(){ let count=0; for(let i=0;i<=5;i++) if(hasMilestone('w',i)) count++; return new Decimal(1).add(count*0.1)}, effectDisplay(){ return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('w',42)} },
        51: { title: "Eternal Warp", description: "Eternity points boost Warp effect.", cost: new Decimal(50000), effect(){ return player.e.points.add(1).pow(0.5)}, effectDisplay(){ return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('w',43) && player.e.unlocked} },
        52: { description: "Warp effect ^1.5. Gain 50% Warp passively.", cost: new Decimal(100000), unlocked(){ return hasUpgrade('w',51)} },
    },
    buyables: {
        11: {
            title: "Warp Drive", cost(x){ return new Decimal(10).pow(x).times(10) }, effect(x){ return Decimal.pow(2.5, x)},
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" warp<br>Amount: "+formatWhole(player.w.buyables[this.id])+"<br>Effect: "+format(d.effect)+"x to points"},
            unlocked(){ return hasUpgrade('w',21)}, canAfford(){ return player.w.points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy(){ let c=tmp[this.layer].buyables[this.id].cost; player.w.points=player.w.points.sub(c); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); },
            buyMax(){ buyMaxLevels(this.layer, this.id, player.w) },
            style:{'height':'110px'},
        },
        12: {
            title: "Time Dilation", cost(x){ return new Decimal(50).pow(x).times(100) }, effect(x){ return Decimal.pow(1.6, x)},
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" time shards<br>Amount: "+formatWhole(player.w.buyables[this.id])+"<br>Effect: "+format(d.effect)+"x to Warp gain"},
            unlocked(){ return hasUpgrade('w',21) && player.t.unlocked}, canAfford(){ return player.t.points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy(){ let c=tmp[this.layer].buyables[this.id].cost; player.t.points=player.t.points.sub(c); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); },
            buyMax(){ buyMaxLevels(this.layer, this.id, player.t) },
            style:{'height':'110px'},
        },
        13: {
            title: "Mana Warp", cost(x){ return new Decimal(100).pow(x).times(500) }, effect(x){ return Decimal.pow(3, x)},
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" mana<br>Amount: "+formatWhole(player.w.buyables[this.id])+"<br>Effect: "+format(d.effect)+"x to Mana gain"},
            unlocked(){ return hasMilestone('w',2)}, canAfford(){ return player.m.points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy(){ let c=tmp[this.layer].buyables[this.id].cost; player.m.points=player.m.points.sub(c); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); },
            buyMax(){ buyMaxLevels(this.layer, this.id, player.m) },
            style:{'height':'110px'},
        },
    },
    challenges: {
        11: {
            name: "Warped", challengeDescription: "All row 1 effects ^0.5, point gain ^0.5",
            goalDescription: "Reach 1e13 points", canComplete(){return player.points.gte(1e13)},
            rewardDescription: "Warp effect x1.5", rewardEffect(){ return new Decimal(1.5)}, unlocked(){ return hasUpgrade('w',31)},
        },
        12: {
            name: "Overwarped", challengeDescription: "You can't gain Warp. Gain is frozen at current warp. Point gain ^0.6",
            goalDescription: "Reach 1e16 points", canComplete(){return player.points.gte(1e16)},
            rewardDescription: "Keep Warp buyables on reset", unlocked(){ return hasChallenge('w',11)},
        },
    },
    milestones: {
        0: { requirementDescription: "2 warp", effectDescription: "Keep G/M upgrades, time gain x2", done(){ return player.w.best.gte(2)} },
        1: { requirementDescription: "6 warp", effectDescription: "Keep Warp upgrades, Q gain x2", done(){ return player.w.best.gte(6)}, toggles: [["w","auto"]], unlocked(){return hasMilestone('w',0)} },
        2: { requirementDescription: "15 warp", effectDescription: "Unlock Mana Warp buyable, Warp gain x2", done(){ return player.w.best.gte(15)}, unlocked(){return hasMilestone('w',1)} },
        3: { requirementDescription: "40 warp", effectDescription: "Gain 15% Warp passively", done(){ return player.w.best.gte(40)}, unlocked(){return hasMilestone('w',2)} },
        4: { requirementDescription: "100 warp", effectDescription: "W effect ^1.5, W buyables scale 2x slower", done(){ return player.w.best.gte(100)}, unlocked(){return hasMilestone('w',3)} },
        5: { requirementDescription: "300 warp", effectDescription: "W effect ^2, gain 50% Warp passively", done(){ return player.w.best.gte(300)}, unlocked(){return hasMilestone('w',4)} },
    },
    passiveGeneration(){ return hasMilestone('w',5) ? 0.5 : hasMilestone('w',3) ? 0.15 : 0 },
    autoPrestige(){ return hasUpgrade('w',32) && player.w.auto },
    doReset(resettingLayer){
        if(layers[resettingLayer].row > this.row){
            let keep=[];
            if(hasMilestone('w',0)) keep.push("milestones");
            if(hasMilestone('w',1)) keep.push("upgrades");
            if(hasChallenge('w',12)) keep.push("buyables");
            layerDataReset(this.layer, keep);
        }
    },
    tabFormat: ["main-display","prestige-button","resource-display","blank",["infobox","lore"],"blank",["bar","warpBar"],"blank","milestones","blank","upgrades","blank","buyables","blank","challenges","blank",["bar","charge"]],
})

// ---------------- ROW 3: HYPER (H) - Expanded ----------------
addLayer("h", {
    name: "hyper", symbol: "H", position: 0,
    startData() { return { unlocked: false, points: new Decimal(0), best: new Decimal(0), auto: false }},
    color: "#DD2222",
    requires: new Decimal(20), resource: "hyper points", baseResource: "time shards", baseAmount() {return player.t.points},
    type: "static", base: 2.5, exponent: 1.4, row: 3, branches: ["t"],
    canBuyMax: true, // buy max is free now - everything below Eternity is buy-maxable
    layerShown() { return hasUpgrade('t', 13) || player.h.unlocked },
    effect() {
        let eff = Decimal.pow(100, player.h.points)
        if (hasUpgrade('h', 12)) eff = eff.pow(1.5)
        if (hasUpgrade('h', 22)) eff = eff.pow(1.3)
        if (hasUpgrade('h', 31)) eff = eff.times(buyableEffect('h',11))
        if (eff.gte("1e40")) eff = eff.div("1e40").pow(0.5).times("1e40")
        if (!hasMilestone('h',5)) { if (eff.gte("1e100")) eff = eff.div("1e100").pow(0.3).times("1e100") }
        if (hasUpgrade('h', 41)) eff = eff.times(upgradeEffect('h', 41))
        if (hasUpgrade('h', 51)) eff = eff.times(upgradeEffect('h', 51))
        if (hasMilestone('h',6)) eff = eff.pow(2)
        return eff
    },
    effectDescription() { return "which are boosting ALL previous gains by "+format(tmp.h.effect)+"x" },
    prestigeButtonText() {
        let gain = (typeof tmp !== 'undefined' && tmp.h && tmp.h.resetGain instanceof Decimal) ? tmp.h.resetGain : getResetGain(this.layer)
        let at = (typeof tmp !== 'undefined' && tmp.h && tmp.h.nextAt instanceof Decimal) ? tmp.h.nextAt : getNextAt(this.layer)
        if (gain.gte(1)) return "Reset for <b>"+formatWhole(gain)+"</b> hyper points<br>Next at "+formatWhole(at)+" time shards"
        return "Need "+formatWhole(at)+" time shards ("+formatWhole(player.t.points)+"/"+formatWhole(at)+")"
    },
    bars: {
        hyperBar: { direction: RIGHT, width: 400, height: 24, progress(){ return player.h.points.div(player.h.points.add(8)).toNumber()}, display(){ return formatWhole(player.h.points)+" hyper"}, fillStyle:{'background-color':"#DD2222"}, },
    },
    upgrades: {
        11: { description: "Hyper points boost T gain.", cost: new Decimal(1), effect() { return player.h.points.add(1).pow(0.8) }, effectDisplay() { return format(this.effect())+"x" } },
        12: { description: "Hyper effect ^1.5", cost: new Decimal(2), unlocked() { return hasUpgrade('h', 11) } },
        13: { description: "Gain 5x more points, unlock Quantum (needs Warp).", cost: new Decimal(3), unlocked() { return hasUpgrade('h', 12) } },
        21: { description: "Hyper boosts Warp gain.", cost: new Decimal(5), effect(){ return player.h.points.add(1).pow(0.5)}, effectDisplay(){ return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('h',13)} },
        22: { description: "Hyper effect ^1.3.", cost: new Decimal(10), unlocked(){ return hasUpgrade('h',21)} },
        23: { description: "Unlock H buyables.", cost: new Decimal(20), unlocked(){ return hasUpgrade('h',22)} },
        31: { description: "H buyable boosts point gain.", cost: new Decimal(50), effect(){ return buyableEffect('h',11)}, effectDisplay(){ return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('h',23)} },
        32: { description: "Unlock H challenges.", cost: new Decimal(100), unlocked(){ return hasUpgrade('h',31)} },
        33: { description: "Keep H upgrades on Q reset.", cost: new Decimal(250), unlocked(){ return hasUpgrade('h',32)} },
        // Row 4 — Quantum/Eternity era
        41: { title: "Quantum Hyper", description: "Quantum shards boost H effect.", cost: new Decimal(500), effect(){ return player.q.points.add(1).pow(0.3)}, effectDisplay(){ return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('h',33) && player.q.unlocked} },
        42: { description: "H effect ^1.3. H buyables are 50% cheaper.", cost: new Decimal(1000), unlocked(){ return hasUpgrade('h',41)} },
        43: { description: "H milestones also boost Eternity gain.", cost: new Decimal(2000), effect(){ let count=0; for(let i=0;i<=6;i++) if(hasMilestone('h',i)) count++; return new Decimal(1).add(count*0.1)}, effectDisplay(){ return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('h',42)} },
        51: { title: "Eternal Hyper", description: "Eternity points boost H effect.", cost: new Decimal(5000), effect(){ return player.e.points.add(1).pow(0.5)}, effectDisplay(){ return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('h',43) && player.e.unlocked} },
        52: { description: "H effect ^1.5. Gain 50% Hyper passively.", cost: new Decimal(10000), unlocked(){ return hasUpgrade('h',51)} },
    },
    buyables: {
        11: {
            title: "Hyper Core", cost(x){ return new Decimal(5).pow(x).times(5) }, effect(x){ return Decimal.pow(10, x)},
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" hyper<br>Amount: "+formatWhole(player.h.buyables[this.id])+"<br>Effect: "+format(d.effect)+"x to points"},
            unlocked(){ return hasUpgrade('h',23)}, canAfford(){ return player.h.points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy(){ let c=tmp[this.layer].buyables[this.id].cost; player.h.points=player.h.points.sub(c); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); },
            buyMax(){ buyMaxLevels(this.layer, this.id, player.h) },
            style:{'height':'110px'},
        },
        12: {
            title: "Hyper Prestige", cost(x){ return new Decimal(10).pow(x).times(50) }, effect(x){ return Decimal.pow(2, x)},
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" hyper<br>Amount: "+formatWhole(player.h.buyables[this.id])+"<br>Effect: "+format(d.effect)+"x to prestige gain"},
            unlocked(){ return hasMilestone('h',2)}, canAfford(){ return player.h.points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy(){ let c=tmp[this.layer].buyables[this.id].cost; player.h.points=player.h.points.sub(c); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); },
            buyMax(){ buyMaxLevels(this.layer, this.id, player.h) },
            style:{'height':'110px'},
        },
    },
    challenges: {
        11: {
            name: "Hyper Slow", challengeDescription: "Point gain ^0.6, T gain ^0.5. H effect disabled.",
            goalDescription: "Reach 1e20 points", canComplete(){ return player.points.gte(1e20)},
            rewardDescription: "H effect x2", rewardEffect(){ return new Decimal(2)}, unlocked(){ return hasUpgrade('h',32)},
        },
        12: {
            name: "No Hyper", challengeDescription: "You can't gain Hyper. Point gain ^0.4",
            goalDescription: "Reach 1e25 points", canComplete(){ return player.points.gte(1e25)},
            rewardDescription: "Keep H buyables on reset", unlocked(){ return hasChallenge('h',11)},
        },
    },
    milestones: {
        0: { requirementDescription: "1 hyper", effectDescription: "Keep T milestones and auto-buy T", done() {return player.h.best.gte(1)} },
        1: { requirementDescription: "3 hyper", effectDescription: "Boosters and Generators are 3x cheaper", done() {return player.h.best.gte(3)}, unlocked() {return hasMilestone('h',0)} },
        2: { requirementDescription: "8 hyper", effectDescription: "Unlock Hyper Prestige buyable", done(){ return player.h.best.gte(8)}, unlocked(){return hasMilestone('h',1)} },
        3: { requirementDescription: "20 hyper", effectDescription: "Gain 10% hyper passively", done(){ return player.h.best.gte(20)}, unlocked(){return hasMilestone('h',2)} },
        4: { requirementDescription: "50 hyper", effectDescription: "H effect softcaps later (1e100 → 1e120)", done(){ return player.h.best.gte(50)}, unlocked(){return hasMilestone('h',3)} },
        5: { requirementDescription: "100 hyper", effectDescription: "H effect softcap removed, H cost /3", done(){ return player.h.best.gte(100)}, unlocked(){return hasMilestone('h',4)} },
        6: { requirementDescription: "200 hyper", effectDescription: "H effect ^2, gain 50% hyper passively", done(){ return player.h.best.gte(200)}, unlocked(){return hasMilestone('h',5)} },
    },
    passiveGeneration(){ return hasMilestone('h',6) ? 0.5 : hasMilestone('h',3) ? 0.1 : 0 },
    hotkeys: [{key: "h", description: "H: Reset for hyper points", onPress(){if (canReset(this.layer)) doReset(this.layer)}}],
    doReset(resettingLayer) {
        if(layers[resettingLayer].row > this.row){
            let keep=[];
            if(hasMilestone('h',0)) keep.push("milestones");
            if(hasUpgrade('h',33) || hasChallenge('h',12)) keep.push("upgrades");
            if(hasMilestone('h',2)) keep.push("buyables");
            layerDataReset(this.layer, keep);
        }
    },
    tabFormat: ["main-display","prestige-button","blank","resource-display","blank",["bar","hyperBar"],"blank","milestones","blank","upgrades","blank","buyables","blank","challenges"],
})

// ---------------- ROW 3: QUANTUM (Q) - NEW ----------------
addLayer("q", {
    name: "quantum", symbol: "Q", position: 1,
    startData(){ return { unlocked:false, points:new Decimal(0), best:new Decimal(0), auto:false }},
    color: "#00FFAA",
    requires: new Decimal(15), resource: "quantum shards", baseResource: "warp shards", baseAmount(){ return player.w.points },
    type: "static", base: 2.2, exponent: 1.3, row: 3, branches: [["w","#00AAFF"], ["t","#AA00FF"]],
    canBuyMax: true, // buy max is free now - everything below Eternity is buy-maxable
    layerShown(){
        return (hasUpgrade('h', 13) && (player.w.unlocked || (player.w.best && player.w.best.gte(1)) || hasUpgrade('t', 21) || hasMilestone('t', 3)))
            || player.q.unlocked
    },
    tooltipLocked(){
        return "Need Hyper upgrade 13 and Warp unlocked (Time upgrade 21 or 25 Time shards)"
    },
    effect(){
        let eff=Decimal.pow(50, player.q.points);
        if(hasUpgrade('q',12)) eff=eff.pow(1.4);
        if(hasUpgrade('q',23)) eff=eff.times(buyableEffect('q',11));
        if(eff.gte("1e60")) eff=eff.div("1e60").pow(0.4).times("1e60");
        return eff;
    },
    effectDescription(){ return "which boost points, warp, and hyper by "+format(tmp.q.effect)+"x"},
    prestigeButtonText(){
        let gain=(tmp.q && tmp.q.resetGain instanceof Decimal) ? tmp.q.resetGain : getResetGain(this.layer);
        let at=(tmp.q && tmp.q.nextAt instanceof Decimal) ? tmp.q.nextAt : getNextAt(this.layer);
        if(gain.gte(1)) return "Reset for <b>"+formatWhole(gain)+"</b> quantum<br>Next at "+formatWhole(at)+" warp";
        return "Need "+formatWhole(at)+" warp ("+formatWhole(player.w.points)+"/"+formatWhole(at)+")";
    },
    infoboxes: {
        lore: { title: "Quantum Foam", body: "Quantum needs Warp + Time. It bridges Row 2 to Eternity. Quantum challenges disable Warp/Time — bring Hyper!", unlocked(){ return true}},
    },
    bars: {
        quantumBar: { direction: RIGHT, width: 380, height: 22, progress(){ return player.q.points.div(player.q.points.add(10)).toNumber()}, display(){ return formatWhole(player.q.points)+" quantum"}, fillStyle:{'background-color':"#00FFAA"}, },
    },
    upgrades: {
        11: { description: "Quantum boosts point gain.", cost: new Decimal(2), effect(){ return player.q.points.add(1).pow(0.7)}, effectDisplay(){return format(this.effect())+"x"} },
        12: { description: "Quantum effect ^1.4 and prestige x2.", cost: new Decimal(5), unlocked(){return hasUpgrade('q',11)} },
        13: { description: "Quantum makes Warp cheaper (cost /1.3).", cost: new Decimal(10), unlocked(){return hasUpgrade('q',12)} },
        21: { description: "Unlock Quantum buyables.", cost: new Decimal(20), unlocked(){return hasUpgrade('q',13)} },
        22: { description: "Quantum boosts Hyper gain.", cost: new Decimal(40), effect(){ return player.q.points.add(1).pow(0.5)}, effectDisplay(){return format(this.effect())+"x"}, unlocked(){return hasUpgrade('q',21)} },
        23: { description: "Quantum Core buyable boosts point gain.", cost: new Decimal(80), unlocked(){return hasUpgrade('q',22)} },
        31: { description: "Unlock Q challenges.", cost: new Decimal(150), unlocked(){return hasUpgrade('q',23)} },
        32: { description: "Keep Q upgrades on E reset.", cost: new Decimal(300), unlocked(){return hasUpgrade('q',31)} },
        // Row 4 — Eternity era
        41: { title: "Eternal Quantum", description: "Eternity points boost Q effect.", cost: new Decimal(600), effect(){ return player.e.points.add(1).pow(0.5)}, effectDisplay(){ return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('q',32) && player.e.unlocked} },
        42: { description: "Q effect ^1.3. Q buyables are 50% cheaper.", cost: new Decimal(1200), unlocked(){ return hasUpgrade('q',41)} },
        43: { description: "Q milestones also boost Eternity gain.", cost: new Decimal(2500), effect(){ let count=0; for(let i=0;i<=5;i++) if(hasMilestone('q',i)) count++; return new Decimal(1).add(count*0.1)}, effectDisplay(){ return format(this.effect())+"x"}, unlocked(){ return hasUpgrade('q',42)} },
        51: { description: "Q effect ^1.5. Gain 50% Quantum passively.", cost: new Decimal(5000), unlocked(){ return hasUpgrade('q',43)} },
    },
    buyables: {
        11: {
            title: "Quantum Core", cost(x){ return new Decimal(3).pow(x).times(3) }, effect(x){ return Decimal.pow(5, x)},
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" quantum<br>Amount: "+formatWhole(player.q.buyables[this.id])+"<br>Effect: "+format(d.effect)+"x to points"},
            unlocked(){ return hasUpgrade('q',21)}, canAfford(){ return player.q.points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy(){ let c=tmp[this.layer].buyables[this.id].cost; player.q.points=player.q.points.sub(c); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); },
            buyMax(){ buyMaxLevels(this.layer, this.id, player.q) },
            style:{'height':'110px'},
        },
        12: {
            title: "Quantum Flux", cost(x){ return new Decimal(10).pow(x).times(10) }, effect(x){ return Decimal.pow(2, x)},
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" quantum<br>Amount: "+formatWhole(player.q.buyables[this.id])+"<br>Effect: "+format(d.effect)+"x to prestige"},
            unlocked(){ return hasMilestone('q',2)}, canAfford(){ return player.q.points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy(){ let c=tmp[this.layer].buyables[this.id].cost; player.q.points=player.q.points.sub(c); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); },
            buyMax(){ buyMaxLevels(this.layer, this.id, player.q) },
            style:{'height':'110px'},
        },
    },
    challenges: {
        11: {
            name: "Quantum Lock", challengeDescription: "Warp & Time effects disabled. Point gain ^0.5",
            goalDescription: "Reach 1e30 points", canComplete(){ return player.points.gte(1e30)},
            rewardDescription: "Quantum effect x2", rewardEffect(){ return new Decimal(2)}, unlocked(){ return hasUpgrade('q',31)},
        },
        12: {
            name: "No Quantum", challengeDescription: "Can't gain Quantum. Point gain ^0.4, all row 2 effects ^0.5",
            goalDescription: "Reach 1e35 points", canComplete(){ return player.points.gte(1e35)},
            rewardDescription: "Keep Quantum buyables on reset", unlocked(){ return hasChallenge('q',11)},
        },
    },
    milestones: {
        0: { requirementDescription: "2 quantum", effectDescription: "Keep Warp milestones, hyper gain x2", done(){ return player.q.best.gte(2)} },
        1: { requirementDescription: "5 quantum", effectDescription: "Keep Quantum upgrades, time x2", done(){ return player.q.best.gte(5)}, unlocked(){return hasMilestone('q',0)} },
        2: { requirementDescription: "12 quantum", effectDescription: "Unlock Quantum Flux buyable", done(){ return player.q.best.gte(12)}, unlocked(){return hasMilestone('q',1)} },
        3: { requirementDescription: "25 quantum", effectDescription: "Gain 10% quantum passively", done(){ return player.q.best.gte(25)}, unlocked(){return hasMilestone('q',2)} },
        4: { requirementDescription: "50 quantum", effectDescription: "Q effect ^1.5, Q buyables scale 2x slower", done(){ return player.q.best.gte(50)}, unlocked(){return hasMilestone('q',3)} },
        5: { requirementDescription: "100 quantum", effectDescription: "Q effect ^2, gain 50% quantum passively", done(){ return player.q.best.gte(100)}, unlocked(){return hasMilestone('q',4)} },
    },
    passiveGeneration(){ return hasMilestone('q',5) ? 0.5 : hasMilestone('q',3) ? 0.1 : 0 },
    doReset(resettingLayer){
        if(layers[resettingLayer].row > this.row){
            let keep=[];
            if(hasMilestone('q',0)) keep.push("milestones");
            if(hasUpgrade('q',32) || hasChallenge('q',12)) keep.push("upgrades");
            if(hasMilestone('q',2)) keep.push("buyables");
            layerDataReset(this.layer, keep);
        }
    },
    tabFormat: ["main-display","prestige-button","blank","resource-display","blank",["infobox","lore"],"blank",["bar","quantumBar"],"blank","milestones","blank","upgrades","blank","buyables","blank","challenges"],
})

// ---------------- ROW 4: ETERNITY (E) - NEW ENDGAME ----------------
addLayer("e", {
    name: "eternity", symbol: "E", position: 0,
    startData(){ return { unlocked:false, points:new Decimal(0), best:new Decimal(0) }},
    color: "#FFD700",
    requires: new Decimal(25), resource: "eternity points", baseResource: "hyper points", baseAmount(){ return player.h.points },
    type: "static", base: 3, exponent: 1.5, row: 4, branches: [["h","#DD2222"], ["q","#00FFAA"]],
    layerShown(){ return hasUpgrade('h',13) && hasUpgrade('q',11) || player.e.unlocked },
    gainMult(){
        let mult = new Decimal(1);
        if(player.r && tmp.r && tmp.r.effect) mult = mult.div(tmp.r.effect.pow(0.08));
        if(player.r && tmp.r && tmp.r.buyables && tmp.r.buyables[12]) mult = mult.div(buyableEffect('r',12));
        if(player.s2 && hasUpgrade('s2', 31)) mult = mult.div(upgradeEffect('s2', 31));
        return mult;
    },
    effect(){
        let eff=Decimal.pow(1000, player.e.points);
        if(hasUpgrade('e',12)) eff=eff.pow(1.5);
        if(hasUpgrade('e',22)) eff=eff.times(buyableEffect('e',11));
        if(eff.gte("1e200")) eff=eff.div("1e200").pow(0.3).times("1e200");
        return eff;
    },
    effectDescription(){ return "which boost EVERYTHING by "+format(tmp.e.effect)+"x (and unlocks final upgrades)"},
    prestigeButtonText(){
        let gain=(tmp.e && tmp.e.resetGain instanceof Decimal) ? tmp.e.resetGain : getResetGain(this.layer);
        let at=(tmp.e && tmp.e.nextAt instanceof Decimal) ? tmp.e.nextAt : getNextAt(this.layer);
        if(gain.gte(1)) return "Reset for <b>"+formatWhole(gain)+"</b> eternity<br>Next at "+formatWhole(at)+" hyper";
        return "Need "+formatWhole(at)+" hyper ("+formatWhole(player.h.points)+"/"+formatWhole(at)+")";
    },
    bars: {
        eternityBar: { direction: RIGHT, width: 500, height: 30, progress(){ return player.e.points.div(10).toNumber()}, display(){ return formatWhole(player.e.points)+" / 10 Eternity — WIN! ("+format(player.points)+"/1e500)"}, fillStyle:{'background-color':"#FFD700", 'background-image':"linear-gradient(90deg, #FFD700, #FF8800)"}, baseStyle:{'background-color':"#332200"}, textStyle:{'color':"#fff", 'text-shadow':"1px 1px 2px black"}, },
    },
    upgrades: {
        11: { description: "Eternity boosts hyper effect.", cost: new Decimal(1), effect(){ return player.e.points.add(1).pow(1.2)}, effectDisplay(){return format(this.effect())+"x"}, },
        12: { description: "Eternity effect ^1.5 and point gain x10.", cost: new Decimal(2), unlocked(){return hasUpgrade('e',11)} },
        13: { description: "Keep Eternity milestones on reset, time x5.", cost: new Decimal(3), unlocked(){return hasUpgrade('e',12)} },
        21: { description: "Unlock Eternity buyables.", cost: new Decimal(5), unlocked(){return hasUpgrade('e',13)} },
        22: { description: "Eternity Core boosts point gain.", cost: new Decimal(10), effect(){ return buyableEffect('e',11)}, effectDisplay(){return format(this.effect())+"x"}, unlocked(){return hasUpgrade('e',21)} },
        23: { description: "Gain 5x more prestige, keep all row 1 upgrades.", cost: new Decimal(15), unlocked(){return hasUpgrade('e',22)} },
        31: { description: "Unlock Eternity challenge: True Eternity.", cost: new Decimal(25), unlocked(){return hasUpgrade('e',23)} },
        32: { description: "Eternity points boost Quantum gain.", cost: new Decimal(50), effect(){ return player.e.points.add(1).pow(0.6)}, effectDisplay(){return format(this.effect())+"x"}, unlocked(){return hasUpgrade('e',31)} },
        // Row 5 — Universe/Singularity era
        41: { title: "Eternal Mastery", description: "Eternity effect ^1.3. All layer effects +25%.", cost: new Decimal(75), unlocked(){return hasUpgrade('e',32)} },
        42: { description: "E buyables are 50% cheaper. E buyables give double effect.", cost: new Decimal(100), unlocked(){return hasUpgrade('e',41)} },
        43: { description: "Gain 100% Eternity passively. E milestones also boost Universe gain.", cost: new Decimal(150), effect(){ let count=0; for(let i=0;i<=5;i++) if(hasMilestone('e',i)) count++; return new Decimal(1).add(count*0.15)}, effectDisplay(){ return format(this.effect())+"x"}, unlocked(){return hasUpgrade('e',42)} },
        51: { title: "Infinite Eternity", description: "E effect softcap removed. E effect ^2.", cost: new Decimal(200), unlocked(){return hasUpgrade('e',43)} },
        // Row 6 — Post-game
        61: { title: "Eternal Dominion", description: "All layer effects ^1.5. Points ^1.1.", cost: new Decimal(300), unlocked(){return hasUpgrade('e',51)} },
        62: { description: "E buyables give triple effect. E milestones give double bonuses.", cost: new Decimal(500), unlocked(){return hasUpgrade('e',61)} },
        63: { description: "Gain 500% Eternity passively. Unlock E challenge 2.", cost: new Decimal(750), unlocked(){return hasUpgrade('e',62)} },
        64: { title: "Eternal Infinity", description: "E effect ^3. All layer costs /10.", cost: new Decimal(1000), unlocked(){return hasUpgrade('e',63)} },
    },
    buyables: {
        11: {
            title: "Eternity Core", cost(x){ return new Decimal(2).pow(x).times(2) }, effect(x){ return Decimal.pow(10, x)},
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" eternity<br>Amount: "+formatWhole(player.e.buyables[this.id])+"<br>Effect: "+format(d.effect)+"x to points"},
            unlocked(){ return hasUpgrade('e',21)}, canAfford(){ return player.e.points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy(){ let c=tmp[this.layer].buyables[this.id].cost; player.e.points=player.e.points.sub(c); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); },
            style:{'height':'110px'},
        },
        12: {
            title: "Eternal Prestige", cost(x){ return new Decimal(5).pow(x).times(5) }, effect(x){ return Decimal.pow(5, x)},
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" eternity<br>Amount: "+formatWhole(player.e.buyables[this.id])+"<br>Effect: "+format(d.effect)+"x to all early gains"},
            unlocked(){ return hasMilestone('e',2)}, canAfford(){ return player.e.points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy(){ let c=tmp[this.layer].buyables[this.id].cost; player.e.points=player.e.points.sub(c); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); },
            style:{'height':'110px'},
        },
    },
    challenges: {
        11: {
            name: "True Eternity", challengeDescription: "All previous effects ^0.3, you can't gain Eternity. Point gain ^0.2",
            goalDescription: "Reach 1e100 points inside", canComplete(){ return player.points.gte("1e100")},
            rewardDescription: "Eternity effect x5", rewardEffect(){ return new Decimal(5)}, unlocked(){ return hasUpgrade('e',31)},
        },
        12: {
            name: "Eternal Void", challengeDescription: "ALL effects disabled. Only base generation works. Point gain ^0.05.",
            goalDescription: "Reach 1e50 points inside", canComplete(){ return player.points.gte("1e50")},
            rewardDescription: "E effect ^2 and all layer effects +50%",
            unlocked(){ return hasUpgrade('e',63)},
        },
    },
    milestones: {
        0: { requirementDescription: "1 eternity", effectDescription: "Keep H/Q milestones, gain 5x prestige", done(){ return player.e.best.gte(1)} },
        1: { requirementDescription: "3 eternity", effectDescription: "Keep all row 2 upgrades, point gain x5", done(){ return player.e.best.gte(3)}, unlocked(){return hasMilestone('e',0)} },
        2: { requirementDescription: "6 eternity", effectDescription: "Unlock Eternal Prestige buyable", done(){ return player.e.best.gte(6)}, unlocked(){return hasMilestone('e',1)} },
        3: { requirementDescription: "10 eternity", effectDescription: "WIN! + Keep everything on E reset", done(){ return player.e.best.gte(10)}, unlocked(){return hasMilestone('e',2)} },
        4: { requirementDescription: "25 eternity", effectDescription: "E effect ^1.5, unlock Universe layer", done(){ return player.e.best.gte(25)}, unlocked(){return hasMilestone('e',3)} },
        5: { requirementDescription: "50 eternity", effectDescription: "E effect ^2, gain 100% E passively", done(){ return player.e.best.gte(50)}, unlocked(){return hasMilestone('e',4)} },
        6: { requirementDescription: "100 eternity", effectDescription: "E effect ^3, all layer costs /5", done(){ return player.e.best.gte(100)}, unlocked(){return hasMilestone('e',5)} },
        7: { requirementDescription: "200 eternity", effectDescription: "E effect ^5, unlock E buyable 3", done(){ return player.e.best.gte(200)}, unlocked(){return hasMilestone('e',6)} },
    },
    passiveGeneration(){ return hasMilestone('e',5) ? 1.0 : 0 },
    hotkeys: [{key: "e", description: "E: Reset for eternity", onPress(){if(canReset(this.layer)) doReset(this.layer)}}],
    tabFormat: ["main-display","prestige-button","blank","resource-display","blank",["bar","eternityBar"],"blank","milestones","blank","upgrades","blank","buyables","blank","challenges"],
})

// ---------------- SIDE: ACHIEVEMENTS (A) - Expanded to 24 ----------------
addLayer("a", {
    startData() { return { unlocked: true }},
    color: "gold", row: "side", layerShown() { return true }, tooltip() { return "Achievements" },
    achievements: {
        11: { name: "Prestigious", done() { return player.p.best.gte(1) }, tooltip: "Get 1 prestige point. Reward: Points x1.5", onComplete() { console.log("First prestige!") } },
        12: { name: "Boosted", done() { return player.b.best.gte(1) }, tooltip: "Get 1 booster. Reward: Points & prestige x1.5", unlocked() { return player.b.unlocked } },
        13: { name: "Generated", done() { return player.g.best.gte(1) }, tooltip: "Get 1 generator. Reward: Points x1.2", unlocked() { return player.g.unlocked } },
        14: { name: "Timely", done() { return player.t.best.gte(1) }, tooltip() { return "Get 1 time shard. Reward: Points x"+format(this.effect()) }, effect() { return player.t.best.add(1).pow(0.15) }, unlocked() { return player.t.unlocked } },
        15: { name: "Mana Flow", done(){ return player.m.best.gte(1)}, tooltip: "Get 1 mana. Reward: Points x1.3", unlocked(){ return player.m.unlocked } },
        16: { name: "Warped", done(){ return player.w.best.gte(1)}, tooltip: "Get 1 warp shard. Reward: Points x1.3", unlocked(){ return player.w.unlocked } },
        21: { name: "Challenge Accepted", done() { return hasChallenge('t', 11) }, tooltip: "Complete Time Challenge 11", unlocked() { return player.t.unlocked } },
        22: { name: "Hyper!", done() { return player.h.best.gte(1) }, tooltip: "Get 1 hyper point.", unlocked() { return player.h.unlocked } },
        23: { name: "Speedrun", done() { return player.points.gte(1e9) && player.h.best.lte(0) }, tooltip: "Reach 1e9 points without any hyper points.", unlocked() { return player.t.unlocked } },
        24: { name: "Overkill", done() { return player.points.gte("1e20") }, tooltip: "Reach 1e20 points", unlocked() { return player.h.unlocked } },
        31: { name: "Quantum Leap", done(){ return player.q.best.gte(1)}, tooltip: "Get 1 quantum shard. Reward: Points x1.5", unlocked(){ return player.q.unlocked } },
        32: { name: "Eternal", done(){ return player.e.best.gte(1)}, tooltip: "Get 1 eternity point.", unlocked(){ return player.e.unlocked } },
        33: { name: "Grid Master", done(){ return Object.values(player.g.grid).filter(v=>v==2).length>=5 }, tooltip: "Get 5 Overcharged grid tiles.", unlocked(){ return hasMilestone('g',4)} },
        34: { name: "Spellweaver", done(){ return getBuyableAmount('m',11).gte(5)}, tooltip: "Get 5 Mana Spells.", unlocked(){ return player.m.unlocked } },
        35: { name: "Time Lord", done(){ return player.t.best.gte(100)}, tooltip: "Get 100 time shards.", unlocked(){ return player.t.unlocked } },
        36: { name: "Warp Lord", done(){ return player.w.best.gte(40)}, tooltip: "Get 40 warp shards.", unlocked(){ return player.w.unlocked } },
        41: { name: "Hyper Lord", done(){ return player.h.best.gte(20)}, tooltip: "Get 20 hyper points.", unlocked(){ return player.h.unlocked } },
        42: { name: "True Eternity", done(){ return hasChallenge('e',11)}, tooltip: "Complete True Eternity challenge.", unlocked(){ return player.e.unlocked } },
        43: { name: "Millionaire", done(){ return player.points.gte("1e100")}, tooltip: "Reach 1e100 points.", unlocked(){ return player.e.unlocked } },
        44: { name: "Secret", done(){ return player.points.gte(69) && player.p.points.gte(69)}, tooltip: "Nice.", unlocked(){ return player.p.unlocked } },
        51: { name: "No Prestige Speedrun", done(){ return player.points.gte(1e6) && player.p.best.lte(0)}, tooltip: "Reach 1e6 points with 0 prestige. Impossible?", unlocked(){ return player.p.unlocked } },
        52: { name: "Collector", done(){ return hasUpgrade('p',42) && hasUpgrade('b',33) && hasUpgrade('g',33) && hasUpgrade('m',32) }, tooltip: "Get all row 1 final upgrades.", unlocked(){ return player.e.unlocked } },
        53: { name: "Completionist", done(){ return Object.keys(player.a.achievements).length>=20}, tooltip: "Get 20 achievements.", unlocked(){ return player.a.achievements.length>=10} },
        // Singularity achievements (v0.7)
        61: { name: "Singularity!", done(){ return player.s2 && player.s2.best.gte(1)}, tooltip: "Get 1 singularity.", unlocked(){ return player.s2 && player.s2.unlocked} },
        62: { name: "Grid Collapse", done(){ if (!player.s2 || !player.s2.grid) return false; let c=0; for(let k in player.s2.grid) if(player.s2.grid[k]===2) c++; return c>=5}, tooltip: "Get 5 Singulons on the Collapse Grid.", unlocked(){ return player.s2 && hasUpgrade('s2',21)} },
        63: { name: "Rift Master", done(){ return hasChallenge('s2',11) && hasChallenge('s2',12)}, tooltip: "Complete both Singularity Rift Alpha and Omega.", unlocked(){ return player.s2 && hasUpgrade('s2',23)} },
        64: { name: "Multiverse Collapse", done(){ return player.s2 && player.s2.best.gte(10)}, tooltip: "Get 10 singularities.", unlocked(){ return player.s2 && player.s2.best.gte(5)} },
        65: { name: "Absolute Singularity", done(){ return player.s2 && player.s2.best.gte(20)}, tooltip: "Reach 20 singularities. ULTIMATE VICTORY!", unlocked(){ return player.s2 && player.s2.best.gte(15)} },
        // Row 7 — Deep progression
        71: { name: "Booster God", done(){ return player.b.best.gte(100)}, tooltip: "Get 100 boosters. Reward: B effect ^1.5", effect(){ return new Decimal(1.5)}, unlocked(){ return player.b.best.gte(50)} },
        72: { name: "Generator God", done(){ return player.g.best.gte(100)}, tooltip: "Get 100 generators. Reward: G effect ^1.5", effect(){ return new Decimal(1.5)}, unlocked(){ return player.g.best.gte(50)} },
        73: { name: "Mana God", done(){ return player.m.best.gte(100)}, tooltip: "Get 100 mana. Reward: M effect ^1.5", effect(){ return new Decimal(1.5)}, unlocked(){ return player.m.best.gte(50)} },
        74: { name: "Time Lord Supreme", done(){ return player.t.best.gte(1000)}, tooltip: "Get 1000 time shards.", unlocked(){ return player.t.best.gte(100)} },
        75: { name: "Warp Lord Supreme", done(){ return player.w.best.gte(200)}, tooltip: "Get 200 warp shards.", unlocked(){ return player.w.best.gte(100)} },
        76: { name: "Hyper Lord Supreme", done(){ return player.h.best.gte(100)}, tooltip: "Get 100 hyper points.", unlocked(){ return player.h.best.gte(50)} },
        // Row 8 — Challenge mastery
        81: { name: "Challenge Master", done(){ return hasChallenge('t',11) && hasChallenge('t',12) && hasChallenge('t',21) && hasChallenge('t',22) && hasChallenge('t',31)}, tooltip: "Complete all Time challenges.", unlocked(){ return hasChallenge('t',21)} },
        82: { name: "Warp Breaker", done(){ return hasChallenge('w',11) && hasChallenge('w',12)}, tooltip: "Complete all Warp challenges.", unlocked(){ return hasChallenge('w',11)} },
        83: { name: "Hyper Breaker", done(){ return hasChallenge('h',11) && hasChallenge('h',12)}, tooltip: "Complete all Hyper challenges.", unlocked(){ return hasChallenge('h',11)} },
        84: { name: "Quantum Breaker", done(){ return hasChallenge('q',11) && hasChallenge('q',12)}, tooltip: "Complete all Quantum challenges.", unlocked(){ return hasChallenge('q',11)} },
        85: { name: "Eternity Breaker", done(){ return hasChallenge('e',11)}, tooltip: "Complete True Eternity.", unlocked(){ return hasChallenge('e',11)} },
        86: { name: "Prestige Breaker", done(){ return hasChallenge('p',11) && hasChallenge('p',12)}, tooltip: "Complete all Prestige challenges.", unlocked(){ return hasChallenge('p',12)} },
        // Row 9 — Point milestones
        91: { name: "Billionaire", done(){ return player.points.gte("1e9")}, tooltip: "Reach 1e9 points. Reward: Points x1.5", effect(){ return new Decimal(1.5)}, unlocked(){ return player.points.gte("1e6")} },
        92: { name: "Trillionaire", done(){ return player.points.gte("1e12")}, tooltip: "Reach 1e12 points. Reward: Points x2", effect(){ return new Decimal(2)}, unlocked(){ return player.points.gte("1e9")} },
        93: { name: "Quadrillionaire", done(){ return player.points.gte("1e15")}, tooltip: "Reach 1e15 points. Reward: Points x3", effect(){ return new Decimal(3)}, unlocked(){ return player.points.gte("1e12")} },
        94: { name: "Quintillionaire", done(){ return player.points.gte("1e18")}, tooltip: "Reach 1e18 points.", unlocked(){ return player.points.gte("1e15")} },
        95: { name: "Sextillionaire", done(){ return player.points.gte("1e21")}, tooltip: "Reach 1e21 points.", unlocked(){ return player.points.gte("1e18")} },
        96: { name: "Googol", done(){ return player.points.gte("1e100")}, tooltip: "Reach 1e100 points. Reward: Points x5", effect(){ return new Decimal(5)}, unlocked(){ return player.points.gte("1e50")} },
        // Row 10 — Ultimate achievements
        101: { name: "Multiverse Master", done(){ return player.u && player.u.best.gte(10)}, tooltip: "Get 10 Universe points.", unlocked(){ return player.u && player.u.unlocked} },
        102: { name: "Reality Bender", done(){ return player.r && player.r.best.gte(10)}, tooltip: "Get 10 Reality shards.", unlocked(){ return player.r && player.r.unlocked} },
        103: { name: "Full Completionist", done(){ return Object.keys(player.a.achievements).length>=40}, tooltip: "Get 40 achievements.", unlocked(){ return Object.keys(player.a.achievements).length>=30} },
        104: { name: "The Ultimate", done(){ return player.points.gte("1e250")}, tooltip: "Reach 1e250 points.", unlocked(){ return player.points.gte("1e100")} },
        105: { name: "Infinite Power", done(){ return player.points.gte("1e500")}, tooltip: "Reach 1e500 points. THE ULTIMATE GOAL!", unlocked(){ return player.points.gte("1e250")} },
        // Row 11 — Singularity mastery
        111: { name: "Singularity Master", done(){ return player.s2 && player.s2.best.gte(5)}, tooltip: "Get 5 singularities.", unlocked(){ return player.s2 && player.s2.best.gte(2)} },
        112: { name: "Field Day", done(){ return player.s2 && player.s2.field && player.s2.field.gte(100)}, tooltip: "Reach 100 Singularity Field.", unlocked(){ return player.s2 && hasUpgrade('s2',14)} },
        113: { name: "Grid Perfectionist", done(){ if (!player.s2 || !player.s2.grid) return false; let c=0; for(let k in player.s2.grid) if(player.s2.grid[k]===2) c++; return c>=9}, tooltip: "Fill the entire Collapse Grid with Singulons.", unlocked(){ return player.s2 && hasUpgrade('s2',21)} },
        114: { name: "Rift Survivor", done(){ return hasChallenge('s2',11)}, tooltip: "Complete Singularity Rift Alpha.", unlocked(){ return player.s2 && hasUpgrade('s2',23)} },
        115: { name: "Rift Conqueror", done(){ return hasChallenge('s2',12)}, tooltip: "Complete Singularity Rift Omega.", unlocked(){ return player.s2 && hasChallenge('s2',11)} },
        116: { name: "Timeline Collapser", done(){ return hasChallenge('s2',21)}, tooltip: "Complete Collapsed Timeline challenge.", unlocked(){ return player.s2 && hasChallenge('s2',12)} },
        // Row 12 — Universe mastery
        121: { name: "Multiverse Traveler", done(){ return player.u && player.u.best.gte(5)}, tooltip: "Get 5 Universe points.", unlocked(){ return player.u && player.u.unlocked} },
        122: { name: "Classic Explorer", done(){ return player.u && player.u.classic && player.u.classic.points.gte(50)}, tooltip: "Get 50 Classic PP.", unlocked(){ return player.u && hasUpgrade('u',14)} },
        123: { name: "Rewritten Explorer", done(){ return player.u && player.u.rewritten && player.u.rewritten.points.gte(50)}, tooltip: "Get 50 Rewritten PP.", unlocked(){ return player.u && hasUpgrade('u',21)} },
        124: { name: "Demo Explorer", done(){ return player.u && player.u.demo && player.u.demo.points.gte(50)}, tooltip: "Get 50 Demo Candies.", unlocked(){ return player.u && hasUpgrade('u',34)} },
        125: { name: "Incrementverse Explorer", done(){ return player.u && player.u.incrementverse && player.u.incrementverse.points.gte(50)}, tooltip: "Get 50 Incrementreeverse points.", unlocked(){ return player.u && hasUpgrade('u',35)} },
        126: { name: "Basic Explorer", done(){ return player.u && player.u.basic && player.u.basic.points.gte(50)}, tooltip: "Get 50 Basic Tree points.", unlocked(){ return player.u && hasUpgrade('u',42)} },
        127: { name: "Milestone Explorer", done(){ return player.u && player.u.miletree && player.u.miletree.points.gte(50)}, tooltip: "Get 50 Milestone Tree points.", unlocked(){ return player.u && hasUpgrade('u',43)} },
        // Row 13 — Reality mastery
        131: { name: "Reality Shaper", done(){ return player.r && player.r.best.gte(5)}, tooltip: "Get 5 Reality shards.", unlocked(){ return player.r && player.r.best.gte(2)} },
        132: { name: "Stability Master", done(){ return player.r && player.r.stability && player.r.stability.gte(100)}, tooltip: "Reach 100 Reality Stability.", unlocked(){ return player.r && hasUpgrade('r',14)} },
        133: { name: "Dimensional Architect", done(){ return getBuyableAmount('r',11).gte(10) && getBuyableAmount('r',12).gte(10)}, tooltip: "Get 10 of each Reality Dimension.", unlocked(){ return player.r && hasUpgrade('r',21)} },
        // Row 14 — Challenge mastery
        141: { name: "Purist", done(){ return hasChallenge('p',11) && hasChallenge('p',12) && hasChallenge('p',21)}, tooltip: "Complete ALL Prestige challenges.", unlocked(){ return hasChallenge('p',12)} },
        142: { name: "Booster Addict", done(){ return hasChallenge('b',11) && hasChallenge('b',12)}, tooltip: "Complete ALL Booster challenges.", unlocked(){ return hasChallenge('b',11)} },
        143: { name: "Generator Freak", done(){ return hasChallenge('g',11) && hasChallenge('g',12)}, tooltip: "Complete ALL Generator challenges.", unlocked(){ return hasChallenge('g',11)} },
        144: { name: "Mana Drain", done(){ return hasChallenge('m',11) && hasChallenge('m',12)}, tooltip: "Complete ALL Mana challenges.", unlocked(){ return hasChallenge('m',11)} },
        145: { name: "Time Paradox", done(){ return hasChallenge('t',11) && hasChallenge('t',12) && hasChallenge('t',21) && hasChallenge('t',22) && hasChallenge('t',31)}, tooltip: "Complete ALL Time challenges.", unlocked(){ return hasChallenge('t',21)} },
        146: { name: "Warp Anomaly", done(){ return hasChallenge('w',11) && hasChallenge('w',12)}, tooltip: "Complete ALL Warp challenges.", unlocked(){ return hasChallenge('w',11)} },
        147: { name: "Hyper Distortion", done(){ return hasChallenge('h',11) && hasChallenge('h',12)}, tooltip: "Complete ALL Hyper challenges.", unlocked(){ return hasChallenge('h',11)} },
        148: { name: "Quantum Entanglement", done(){ return hasChallenge('q',11) && hasChallenge('q',12)}, tooltip: "Complete ALL Quantum challenges.", unlocked(){ return hasChallenge('q',11)} },
        149: { name: "Eternal Loop", done(){ return hasChallenge('e',11)}, tooltip: "Complete True Eternity.", unlocked(){ return hasChallenge('e',11)} },
        140: { name: "Challenge God", done(){ return hasChallenge('p',11) && hasChallenge('b',11) && hasChallenge('g',11) && hasChallenge('m',11) && hasChallenge('t',11) && hasChallenge('w',11) && hasChallenge('h',11) && hasChallenge('q',11) && hasChallenge('e',11)}, tooltip: "Complete at least one challenge in every layer.", unlocked(){ return hasChallenge('e',11)} },
        // Row 15 — Upgrade mastery
        151: { name: "Prestige Collector", done(){ let c=0; for(let id in tmp.p.upgrades) if(hasUpgrade('p',id)) c++; return c>=15}, tooltip: "Get 15 Prestige upgrades.", unlocked(){ return hasUpgrade('p',42)} },
        152: { name: "Booster Collector", done(){ let c=0; for(let id in tmp.b.upgrades) if(hasUpgrade('b',id)) c++; return c>=10}, tooltip: "Get 10 Booster upgrades.", unlocked(){ return hasUpgrade('b',33)} },
        153: { name: "Generator Collector", done(){ let c=0; for(let id in tmp.g.upgrades) if(hasUpgrade('g',id)) c++; return c>=10}, tooltip: "Get 10 Generator upgrades.", unlocked(){ return hasUpgrade('g',33)} },
        154: { name: "Mana Collector", done(){ let c=0; for(let id in tmp.m.upgrades) if(hasUpgrade('m',id)) c++; return c>=8}, tooltip: "Get 8 Mana upgrades.", unlocked(){ return hasUpgrade('m',32)} },
        155: { name: "Time Collector", done(){ let c=0; for(let id in tmp.t.upgrades) if(hasUpgrade('t',id)) c++; return c>=8}, tooltip: "Get 8 Time upgrades.", unlocked(){ return hasUpgrade('t',32)} },
        156: { name: "Warp Collector", done(){ let c=0; for(let id in tmp.w.upgrades) if(hasUpgrade('w',id)) c++; return c>=8}, tooltip: "Get 8 Warp upgrades.", unlocked(){ return hasUpgrade('w',32)} },
        157: { name: "Hyper Collector", done(){ let c=0; for(let id in tmp.h.upgrades) if(hasUpgrade('h',id)) c++; return c>=8}, tooltip: "Get 8 Hyper upgrades.", unlocked(){ return hasUpgrade('h',33)} },
        158: { name: "Quantum Collector", done(){ let c=0; for(let id in tmp.q.upgrades) if(hasUpgrade('q',id)) c++; return c>=8}, tooltip: "Get 8 Quantum upgrades.", unlocked(){ return hasUpgrade('q',32)} },
        159: { name: "Eternity Collector", done(){ let c=0; for(let id in tmp.e.upgrades) if(hasUpgrade('e',id)) c++; return c>=8}, tooltip: "Get 8 Eternity upgrades.", unlocked(){ return hasUpgrade('e',32)} },
        // Row 16 — Milestone mastery
        161: { name: "Prestige Milestone King", done(){ let c=0; for(let id in tmp.p.milestones) if(hasMilestone('p',id)) c++; return c>=7}, tooltip: "Get 7 Prestige milestones.", unlocked(){ return hasMilestone('p',5)} },
        162: { name: "Booster Milestone King", done(){ let c=0; for(let id in tmp.b.milestones) if(hasMilestone('b',id)) c++; return c>=7}, tooltip: "Get 7 Booster milestones.", unlocked(){ return hasMilestone('b',5)} },
        163: { name: "Generator Milestone King", done(){ let c=0; for(let id in tmp.g.milestones) if(hasMilestone('g',id)) c++; return c>=7}, tooltip: "Get 7 Generator milestones.", unlocked(){ return hasMilestone('g',5)} },
        164: { name: "Time Milestone King", done(){ let c=0; for(let id in tmp.t.milestones) if(hasMilestone('t',id)) c++; return c>=6}, tooltip: "Get 6 Time milestones.", unlocked(){ return hasMilestone('t',4)} },
        165: { name: "Hyper Milestone King", done(){ let c=0; for(let id in tmp.h.milestones) if(hasMilestone('h',id)) c++; return c>=5}, tooltip: "Get 5 Hyper milestones.", unlocked(){ return hasMilestone('h',3)} },
        // Row 17 — Point milestones
        171: { name: "Sextillionaire", done(){ return player.points.gte("1e21")}, tooltip: "Reach 1e21 points.", unlocked(){ return player.points.gte("1e18")} },
        172: { name: "Septillionaire", done(){ return player.points.gte("1e24")}, tooltip: "Reach 1e24 points.", unlocked(){ return player.points.gte("1e21")} },
        173: { name: "Octillionaire", done(){ return player.points.gte("1e27")}, tooltip: "Reach 1e27 points.", unlocked(){ return player.points.gte("1e24")} },
        174: { name: "Nonillionaire", done(){ return player.points.gte("1e30")}, tooltip: "Reach 1e30 points.", unlocked(){ return player.points.gte("1e27")} },
        175: { name: "Decillionaire", done(){ return player.points.gte("1e33")}, tooltip: "Reach 1e33 points.", unlocked(){ return player.points.gte("1e30")} },
        176: { name: "Undecillionaire", done(){ return player.points.gte("1e36")}, tooltip: "Reach 1e36 points.", unlocked(){ return player.points.gte("1e33")} },
        177: { name: "Duodecillionaire", done(){ return player.points.gte("1e39")}, tooltip: "Reach 1e39 points.", unlocked(){ return player.points.gte("1e36")} },
        178: { name: "Tredecillionaire", done(){ return player.points.gte("1e42")}, tooltip: "Reach 1e42 points.", unlocked(){ return player.points.gte("1e39")} },
        179: { name: "Quattuordecillionaire", done(){ return player.points.gte("1e45")}, tooltip: "Reach 1e45 points.", unlocked(){ return player.points.gte("1e42")} },
        170: { name: "Quindecillionaire", done(){ return player.points.gte("1e48")}, tooltip: "Reach 1e48 points.", unlocked(){ return player.points.gte("1e45")} },
        // Row 18 — Ultimate point milestones
        181: { name: "Sexdecillionaire", done(){ return player.points.gte("1e51")}, tooltip: "Reach 1e51 points.", unlocked(){ return player.points.gte("1e48")} },
        182: { name: "Septendecillionaire", done(){ return player.points.gte("1e54")}, tooltip: "Reach 1e54 points.", unlocked(){ return player.points.gte("1e51")} },
        183: { name: "Octodecillionaire", done(){ return player.points.gte("1e57")}, tooltip: "Reach 1e57 points.", unlocked(){ return player.points.gte("1e54")} },
        184: { name: "Novemdecillionaire", done(){ return player.points.gte("1e60")}, tooltip: "Reach 1e60 points.", unlocked(){ return player.points.gte("1e57")} },
        185: { name: "Vigintillionaire", done(){ return player.points.gte("1e63")}, tooltip: "Reach 1e63 points.", unlocked(){ return player.points.gte("1e60")} },
        186: { name: "Centillionaire", done(){ return player.points.gte("1e303")}, tooltip: "Reach 1e303 points.", unlocked(){ return player.points.gte("1e100")} },
        187: { name: "Googolplex", done(){ return player.points.gte("1e1e100")}, tooltip: "Reach 1e1e100 points.", unlocked(){ return player.points.gte("1e1000")} },
        // Row 19 — Special achievements
        191: { name: "Speed Demon", done(){ return player.timePlayed < 3600 && player.e.best.gte(1)}, tooltip: "Reach Eternity in under 1 hour.", unlocked(){ return player.e.unlocked} },
        192: { name: "Pacifist", done(){ return player.points.gte("1e50") && !hasChallenge('t',11)}, tooltip: "Reach 1e50 points without completing any Time challenges.", unlocked(){ return player.t.unlocked} },
        193: { name: "Minimalist", done(){ return player.points.gte("1e30") && player.b.best.lte(3) && player.g.best.lte(3)}, tooltip: "Reach 1e30 points with ≤3 boosters and ≤3 generators.", unlocked(){ return player.b.unlocked} },
        194: { name: "Perfectionist", done(){ let total=0; for(let l of ["p","b","g","m","t","w","h","q","e"]){ if(layers[l] && layers[l].milestones){ for(let id in layers[l].milestones) if(hasMilestone(l,id)) total++ }} return total>=50}, tooltip: "Get 50 total milestones across all layers.", unlocked(){ return player.e.unlocked} },
        195: { name: "Upgrade Hoarder", done(){ let total=0; for(let l of ["p","b","g","m","t","w","h","q","e"]){ if(tmp[l] && tmp[l].upgrades){ for(let id in tmp[l].upgrades) if(hasUpgrade(l,id)) total++ }} return total>=60}, tooltip: "Get 60 total upgrades across all layers.", unlocked(){ return player.e.unlocked} },
        196: { name: "Achievement Hunter", done(){ return Object.keys(player.a.achievements).length>=60}, tooltip: "Get 60 achievements.", unlocked(){ return Object.keys(player.a.achievements).length>=40} },
        197: { name: "The Collector", done(){ return Object.keys(player.a.achievements).length>=80}, tooltip: "Get 80 achievements.", unlocked(){ return Object.keys(player.a.achievements).length>=60} },
        198: { name: "Completionist Supreme", done(){ return Object.keys(player.a.achievements).length>=100}, tooltip: "Get 100 achievements.", unlocked(){ return Object.keys(player.a.achievements).length>=80} },
        199: { name: "The Legend", done(){ return player.points.gte("1e1000")}, tooltip: "Reach 1e1000 points.", unlocked(){ return player.points.gte("1e500")} },
        190: { name: "Beyond Infinity", done(){ return player.points.gte("1e10000")}, tooltip: "Reach 1e10000 points.", unlocked(){ return player.points.gte("1e1000")} },
        // Row 20 — Secret achievements
        201: { name: "Nice", done(){ return player.points.gte(69) && player.p.points.gte(69) && player.b.best.gte(69)}, tooltip: "Get 69 of points, prestige, AND boosters.", unlocked(){ return player.b.best.gte(50)} },
        202: { name: "Lucky 7s", done(){ return player.points.gte(7777) && player.p.points.gte(777)}, tooltip: "Get 7777 points and 777 prestige.", unlocked(){ return player.p.best.gte(500)} },
        203: { name: "Power of Two", done(){ return player.points.gte(65536)}, tooltip: "Reach 65536 (2^16) points.", unlocked(){ return player.points.gte(10000)} },
        204: { name: "Millionaire (Real)", done(){ return player.points.gte(1e6) && player.timePlayed < 600}, tooltip: "Reach 1 million points in under 10 minutes.", unlocked(){ return player.points.gte(1000)} },
        205: { name: "Layer Cake", done(){ let count=0; for(let l of ["p","b","g","m","t","w","h","q","e"]) if(player[l] && player[l].unlocked) count++; return count>=9}, tooltip: "Unlock ALL 9 main layers.", unlocked(){ return player.q.unlocked} },
        // Row 21 — Deep post-game
        211: { name: "Reality Master", done(){ return player.r && player.r.best.gte(25)}, tooltip: "Get 25 Reality shards.", unlocked(){ return player.r && player.r.best.gte(10)} },
        212: { name: "Singularity God", done(){ return player.s2 && player.s2.best.gte(50)}, tooltip: "Get 50 singularities.", unlocked(){ return player.s2 && player.s2.best.gte(20)} },
        213: { name: "Field Master", done(){ return player.s2 && player.s2.field && player.s2.field.gte(1000)}, tooltip: "Reach 1000 Singularity Field.", unlocked(){ return player.s2 && hasUpgrade('s2',14)} },
        214: { name: "Collapse Master", done(){ return player.s2 && player.s2.collapses >= 50}, tooltip: "Perform 50 grid collapses.", unlocked(){ return player.s2 && hasUpgrade('s2',21)} },
        215: { name: "Universe Master", done(){ return player.u && player.u.best.gte(25)}, tooltip: "Get 25 Universe points.", unlocked(){ return player.u && player.u.best.gte(10)} },
        216: { name: "Eternity Master", done(){ return player.e && player.e.best.gte(50)}, tooltip: "Get 50 Eternity points.", unlocked(){ return player.e && player.e.best.gte(25)} },
        217: { name: "Hyper Master", done(){ return player.h && player.h.best.gte(200)}, tooltip: "Get 200 Hyper points.", unlocked(){ return player.h && player.h.best.gte(100)} },
        218: { name: "Quantum Master", done(){ return player.q && player.q.best.gte(100)}, tooltip: "Get 100 Quantum shards.", unlocked(){ return player.q && player.q.best.gte(50)} },
        219: { name: "Time Master", done(){ return player.t && player.t.best.gte(10000)}, tooltip: "Get 10000 Time shards.", unlocked(){ return player.t && player.t.best.gte(1000)} },
        210: { name: "Warp Master", done(){ return player.w && player.w.best.gte(300)}, tooltip: "Get 300 Warp shards.", unlocked(){ return player.w && player.w.best.gte(100)} },
        // Row 22 — Ultimate achievements
        221: { name: "Omega", done(){ return player.points.gte("1e100000")}, tooltip: "Reach 1e100000 points.", unlocked(){ return player.points.gte("1e10000")} },
        222: { name: "Absolute", done(){ return player.points.gte("1e1000000")}, tooltip: "Reach 1e1000000 points.", unlocked(){ return player.points.gte("1e100000")} },
        223: { name: "Transcendent", done(){ return player.points.gte("1e10000000")}, tooltip: "Reach 1e10000000 points.", unlocked(){ return player.points.gte("1e1000000")} },
        224: { name: "Omnipotent", done(){ return player.points.gte("1e100000000")}, tooltip: "Reach 1e100000000 points.", unlocked(){ return player.points.gte("1e10000000")} },
        225: { name: "The End", done(){ return player.points.gte("1e1000000000")}, tooltip: "Reach 1e1000000000 points. Is there even more?", unlocked(){ return player.points.gte("1e100000000")} },
        // Row 23 — Omniverse Achievements (v0.8)
        231: { name: "Omniverse Awakened", done(){ return player.o && player.o.best.gte(1)}, tooltip: "Attain 1 Omniverse Energy. Transend reality!", unlocked(){ return player.o && player.o.unlocked} },
        232: { name: "Cosmic Field Pioneer", done(){ return player.o && player.o.field && player.o.field.gte(100)}, tooltip: "Reach 100 Omniverse Field.", unlocked(){ return player.o && hasUpgrade('o', 14)} },
        233: { name: "Matrix Synthesizer", done(){ return player.o && player.o.syntheses >= 10}, tooltip: "Perform 10 Omni-Matrix syntheses.", unlocked(){ return player.o && hasUpgrade('o', 21)} },
        234: { name: "Omega Challenger", done(){ return hasChallenge('o', 11) || hasChallenge('o', 12) || hasChallenge('o', 13) || hasChallenge('o', 14)}, tooltip: "Complete any Omega Challenge.", unlocked(){ return player.o && hasUpgrade('o', 23)} },
        235: { name: "Omniverse Master", done(){ return player.o && player.o.best.gte(20)}, tooltip: "Reach 20 Omniverse Energy.", unlocked(){ return player.o && player.o.best.gte(5)} },
        236: { name: "Grand Omega Conqueror", done(){ return hasChallenge('o', 11) && hasChallenge('o', 12) && hasChallenge('o', 13) && hasChallenge('o', 14)}, tooltip: "Complete ALL 4 Omega Challenges!", unlocked(){ return player.o && hasUpgrade('o', 23)} },
        // Row 24 — 12-Universe Voyager Achievements (v0.8)
        241: { name: "Dimensional Voyager", done(){ return player.u && player.u.dimensions && player.u.dimensions.points.gte(50)}, tooltip: "Reach 50 Dimensional Shards in PT: Dimensions universe.", unlocked(){ return player.u && hasUpgrade('u', 51)} },
        242: { name: "Subatomic Master", done(){ return player.u && player.u.particles && player.u.particles.points.gte(50)}, tooltip: "Reach 50 Atoms in Particle Increment Tree universe.", unlocked(){ return player.u && hasUpgrade('u', 52)} },
        243: { name: "Alphabet Overlord", done(){ return player.u && player.u.pro && player.u.pro.points.gte(50)}, tooltip: "Reach 50 Pro Points in The Pro Tree universe.", unlocked(){ return player.u && hasUpgrade('u', 53)} },
        244: { name: "High Roller", done(){ return player.u && player.u.dice && player.u.dice.points.gte(50)}, tooltip: "Roll 50 Dice in The Dice Tree universe.", unlocked(){ return player.u && hasUpgrade('u', 54)} },
        245: { name: "Next-Gen Pioneer", done(){ return player.u && player.u.ng && player.u.ng.points.gte(50)}, tooltip: "Reach 50 NG Points in PT: Rewritten NG+ universe.", unlocked(){ return player.u && hasUpgrade('u', 55)} },
        246: { name: "Master of Twelve Realms", done(){ return player.u && player.u.best.gte(25) && (player.o && player.o.best.gte(1))}, tooltip: "Attain 25 Universe points and enter the Omniverse.", unlocked(){ return player.u && player.u.unlocked} },
        // Row 25 — Finality (v0.8 Full)
        251: { name: "Finality Dawns", done(){ return player.f && player.f.best.gte(1)}, tooltip: "Attain 1 Finality. What remains, remains.", unlocked(){ return player.f && player.f.unlocked} },
        252: { name: "Spire Builder", done(){ return player.f && getBuyableAmount('f', 11).gte(5)}, tooltip: "Reach 5 levels of the Eternal Spire.", unlocked(){ return player.f && hasMilestone('f', 1)} },
        253: { name: "Sigil Bearer", done(){ return player.f && player.f.sigils >= 5}, tooltip: "Etch 5 permanent Sigils of Power.", unlocked(){ return player.f && hasMilestone('f', 2)} },
        254: { name: "Final Challenger", done(){ return player.f && (hasChallenge('f', 11) || hasChallenge('f', 12) || hasChallenge('f', 13) || hasChallenge('f', 14))}, tooltip: "Complete any Final Challenge.", unlocked(){ return player.f && hasMilestone('f', 3)} },
        255: { name: "TRUE ENDING", done(){ return player.f && player.f.best.gte(8)}, tooltip: "Attain 8 Finality. You have reached the true end of the tree. Congratulations!", unlocked(){ return player.f && hasMilestone('f', 3)} },
        256: { name: "Beyond The Beyond", done(){ return player.f && player.f.best.gte(25)}, tooltip: "Attain 25 Finality. ABSOLUTE FINALITY.", unlocked(){ return player.f && player.f.best.gte(8)} },
        257: { name: "Fifteen Realms", done(){ return player.u && player.u.best.gte(1000)}, tooltip: "Attain 1,000 Universe points. Master of all fifteen realms.", unlocked(){ return player.u && hasUpgrade('u', 61)} },
        258: { name: "Finality Conqueror", done(){ return player.f && hasChallenge('f', 11) && hasChallenge('f', 12) && hasChallenge('f', 13) && hasChallenge('f', 14)}, tooltip: "Complete ALL 4 Final Challenges!", unlocked(){ return player.f && hasMilestone('f', 3)} },
        // Row 26 — Transfinite points (v0.8 Full)
        261: { name: "Transfinite", done(){ return player.points.gte("1e2500")}, tooltip: "Reach 1e2500 points.", unlocked(){ return player.f && player.f.unlocked} },
        262: { name: "Beyond Infinity", done(){ return player.points.gte("1e5000")}, tooltip: "Reach 1e5000 points.", unlocked(){ return player.points.gte("1e2500")} },
        263: { name: "The Final Number", done(){ return player.points.gte("1e10000")}, tooltip: "Reach 1e10000 points. This is getting ridiculous.", unlocked(){ return player.points.gte("1e5000")} },
        264: { name: "Century of Glory", done(){ return Object.keys(player.a.achievements).length>=80}, tooltip: "Get 80 achievements.", unlocked(){ return Object.keys(player.a.achievements).length>=60} },
        265: { name: "Omega Paragon", done(){ return player.o && hasUpgrade('o', 53)}, tooltip: "Unlock the Omega Paragon upgrade.", unlocked(){ return player.o && hasUpgrade('o', 43)} },
        266: { name: "The Whole Tree", done(){ return player.f && player.f.best.gte(8) && player.o && player.o.best.gte(50) && player.s2 && player.s2.best.gte(50) && player.u && player.u.best.gte(1000)}, tooltip: "True Ending + 50 Omniverse + 50 Singularities + 1,000 Universe points. The Complete Tree.", unlocked(){ return player.f && hasMilestone('f', 3)} },
    },
    tabFormat: ["main-display", "achievements"],
    achievementPopups: true,
})

// ---------------- SIDE: STATS (S) - NEW ----------------
addLayer("s", {
    startData(){ return { unlocked: true }},
    color: "#888888", row: "side", layerShown(){ return true }, tooltip(){ return "Stats & Lore"},
    tabFormat: {
        "Stats": {
            content: [
                "main-display",
                ["display-text", function(){ return "You have "+format(player.points)+" points<br>Best: "+format(player.best || player.points)+" | Total time: "+formatTime(player.timePlayed)}],
                "blank",
                ["display-text", function(){
                    let txt="<b>Layer Breakdown:</b><br>";
                    for(let l of ["p","b","g","m","t","w","h","q","e","u","r","s2","o","f"]){
                        if(player[l] && player[l].points && (player[l].unlocked || player[l].best.gte(1))) txt+= l.toUpperCase()+": "+formatWhole(player[l].points)+" (best "+formatWhole(player[l].best)+")<br>";
                    }
                    return txt;
                }],
                "blank",
                ["infobox","lore"],
                "blank",
                ["bar","hyperBar"],
                ["bar","quantumBar"],
                ["bar","eternityBar"],
            ]
        },
        "Lore": {
            content: [
                ["infobox","story"],
                ["display-text", function(){ return hasAchievement('a',32) ? "<i>You have touched eternity. What comes after?</i>" : "<i>Reach Eternity to unlock the true ending...</i>"}],
            ]
        }
    },
    bars: {
        hyperBar: { direction: RIGHT, width: 300, height: 20, progress(){ return player.h.points.div(10).toNumber()}, display(){ return "Hyper: "+formatWhole(player.h.points)+"/10"}, fillStyle:{'background-color':"#DD2222"}, },
        quantumBar: { direction: RIGHT, width: 300, height: 20, progress(){ return player.q.points.div(10).toNumber()}, display(){ return "Quantum: "+formatWhole(player.q.points)+"/10"}, fillStyle:{'background-color':"#00FFAA"}, },
        eternityBar: { direction: RIGHT, width: 300, height: 20, progress(){ return player.e.points.div(10).toNumber()}, display(){ return "Eternity: "+formatWhole(player.e.points)+"/10 WIN"}, fillStyle:{'background-color':"#FFD700"}, },
    },
    infoboxes: {
        lore: { title: "Progress", body: "This side layer shows your stats across all rows. Row 0 → Row 4 is the main path. Row 1 has 3 branches (B/G/M) that converge into Row 2 (T/W), then Row 3 (H/Q), then Eternity. Each row keeps previous milestones if you earn them!", },
        story: { title: "The Tree's Story", body: "In the beginning there were Points. Then Prestige. Then Boosters and Generators learned to cooperate, and Mana flowed. Time and Warp bent reality, Hyper and Quantum broke it, and Eternity... Eternity remembers. <br><br> Your goal: 10 Eternity Points. Or 1e500 points if you prefer brute force. Good luck.", },
    },
})

// ---------------- SIDE: MASTERY (MA) - EXPANDED v0.8 ----------------
addLayer("ma", {
    startData(){ return { unlocked: true }},
    color: "#FFD700",
    row: "side",
    layerShown(){ return player.e && player.e.unlocked },
    tooltip(){ return "Mastery" },
    tabFormat: {
        "Mastery": {
            content: [
                "main-display",
                ["display-text", function(){
                    let total = 0
                    let max = 0
                    let allLayers = ["p","b","g","m","t","w","h","q","e","u","r","s2","o"]
                    // Count milestones
                    for (let l of allLayers){
                        if (layers[l] && layers[l].milestones){
                            for (let id in layers[l].milestones){
                                max++
                                if (hasMilestone(l, id)) total++
                            }
                        }
                    }
                    // Count upgrades
                    for (let l of allLayers){
                        if (layers[l] && layers[l].upgrades){
                            for (let id in layers[l].upgrades){
                                max++
                                if (hasUpgrade(l, id)) total++
                            }
                        }
                    }
                    // Count achievements
                    if (layers.a && layers.a.achievements){
                        for (let id in layers.a.achievements){
                            max++
                            if (hasAchievement('a', id)) total++
                        }
                    }
                    let pct = max > 0 ? (total / max * 100) : 0
                    return "<h3>Mastery: "+format(pct,1)+"% ("+total+"/"+max+")</h3>"
                }],
                "blank",
                ["display-text", function(){
                    let txt = "<b>Layer Progress:</b><br>"
                    let layerIds = ["p","b","g","m","t","w","h","q","e","u","r","s2","o","f"]
                    let names = ["Prestige","Boosters","Generators","Mana","Time","Warp","Hyper","Quantum","Eternity","Universe","Reality","Singularity","Omniverse","Finality"]
                    for (let i = 0; i < layerIds.length; i++){
                        let l = layerIds[i]
                        let ups = 0, upsMax = 0, ms = 0, msMax = 0
                        if (player[l]){
                            if (tmp[l] && tmp[l].upgrades){
                                for (let id in tmp[l].upgrades){ upsMax++; if (hasUpgrade(l, id)) ups++ }
                            }
                            if (tmp[l] && tmp[l].milestones){
                                for (let id in tmp[l].milestones){ msMax++; if (hasMilestone(l, id)) ms++ }
                            }
                            txt += "<b>"+names[i]+"</b>: "+formatWhole(player[l].points)+" pts | Upgrades: "+ups+"/"+upsMax+" | Milestones: "+ms+"/"+msMax+"<br>"
                        }
                    }
                    return txt
                }],
                "blank",
                ["display-text", function(){
                    let ach = 0, achMax = 0
                    if (layers.a && layers.a.achievements){
                        for (let id in layers.a.achievements){ achMax++; if (hasAchievement('a', id)) ach++ }
                    }
                    return "<b>Achievements:</b> "+ach+"/"+achMax+" ("+format(ach/achMax*100,1)+"%)"
                }],
                "blank",
                ["display-text", function(){
                    return "<b>Total Points:</b> "+format(player.points)+"<br><b>Best Points:</b> "+format(player.best || player.points)+"<br><b>Time Played:</b> "+formatTime(player.timePlayed)
                }],
            ]
        },
        "Lore": {
            content: [
                ["display-text", function(){
                    return "<h3>The Mastery System (v0.8 Omniverse)</h3><br>Mastery tracks your overall progress across all 13 core layers and 12 multiverse universes. Complete upgrades, milestones, and achievements to reach 100% mastery.<br><br>"+
                    "<b>Current Goal:</b> "+(player.o && player.o.best.gte(50) ? "You have reached Transcendent Victory!" : player.s2 && player.s2.best.gte(20) ? "You have reached the Singularity! Now transcend reality in the Omniverse (Ω)." : "Explore the tree to reach Eternity, Universe, Reality, Singularity, and the Omniverse.")+"<br><br>"+
                    "<b>Ultimate Goals:</b><br>"+
                    "• Reach 1e10000 points<br>"+
                    "• Complete all Omega and Final challenges<br>"+
                    "• Attain 50 Omniverse Energy, then 8 Finality (TRUE ENDING)<br>"+
                    "• Master all 15 universes in the Multiverse Hub"
                }]
            ]
        }
    },
})
