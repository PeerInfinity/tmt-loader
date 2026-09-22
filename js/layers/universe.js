// ============================================================================
//  UNIVERSE LAYER (U) - Travel the Multiverse (12 Distinct Universes!)
//  Row 5 hub that lets you visit 12 different community trees ported from git clones.
//  Clones located at /tmp/PT-Classic, /tmp/PT-Rewritten, /tmp/The-Basic-Tree,
//  /tmp/Incrementreeverse, /tmp/PT-Dimensions, /tmp/The-Particle-Tree,
//  /tmp/The-Pro-Tree, /tmp/The-Dice-Tree, /tmp/PT-Rewritten-NG.
//
//  v0.9: the transport terminal became a full UNIVERSE SWITCHER (scan / reel /
//  swarm) and the vendored trees now feed back into this layer through the
//  Multiverse Convergence bonus — see js/technical/multiverse.js.
// ============================================================================

// Display names for every realm. Keys match TRANSPORT_TREES in
// js/technical/transport.js, so the raw save key never leaks into the UI again.
var UNIVERSE_LABELS = {
    classicPlus: "Classic+ Hub",
    classic: "Classic 1.0",
    rewritten: "PT: Rewritten",
    ng: "PT: Rewritten NG+",
    demo: "TMT Demo",
    incrementverse: "Incrementreeverse",
    basic: "The Basic Tree",
    miletree: "The Milestone Tree",
    dimensions: "PT: Dimensions",
    particles: "The Particle Tree",
    pro: "The Pro Tree",
    dice: "The Dice Tree",
    galaxy: "The Galaxy Tree",
    synergism: "Synergism",
    circuit: "The Circuit Tree",
}
function universeLabel(key) { return UNIVERSE_LABELS[key] || key }

addLayer("u", {
    name: "multiverse",
    symbol: "U",
    position: 0,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        activeUniverse: "classicPlus",
        travelCooldown: 0,
        classic: {
            points: new Decimal(0),
            boosters: new Decimal(0),
            generators: new Decimal(0),
        },
        rewritten: {
            points: new Decimal(0),
            boosters: new Decimal(0),
            generators: new Decimal(0),
            time: new Decimal(0),
        },
        demo: {
            points: new Decimal(0),
            candies: new Decimal(0),
            farm: new Decimal(0),
        },
        incrementverse: {
            points: new Decimal(0),
            incrementy: new Decimal(0),
            prestige: new Decimal(0),
        },
        basic: {
            points: new Decimal(0),
            cheapeners: new Decimal(0),
            darkness: new Decimal(0),
            exponents: new Decimal(0),
            funity: new Decimal(0),
            games: new Decimal(0),
        },
        miletree: {
            points: new Decimal(0),
            prestige: new Decimal(0),
            superPrestige: new Decimal(0),
            transcend: new Decimal(0),
            reincarnate: new Decimal(0),
        },
        dimensions: {
            points: new Decimal(0),
            dim1: new Decimal(0),
            dim2: new Decimal(0),
            dimBoost: new Decimal(0),
        },
        particles: {
            points: new Decimal(0),
            electrons: new Decimal(0),
            protons: new Decimal(0),
            neutrons: new Decimal(0),
            quarks: new Decimal(0),
        },
        pro: {
            points: new Decimal(0),
            ants: new Decimal(0),
            grass: new Decimal(0),
            supernova: new Decimal(0),
            void: new Decimal(0),
        },
        dice: {
            points: new Decimal(0),
            d6: new Decimal(0),
            d12: new Decimal(0),
            d20: new Decimal(0),
            luck: new Decimal(0),
        },
        ng: {
            points: new Decimal(0),
            ngBoosters: new Decimal(0),
            metaGenerators: new Decimal(0),
            hyperTime: new Decimal(0),
        },
        galaxy: {
            points: new Decimal(0),
            stars: new Decimal(0),
        },
        synergism: {
            points: new Decimal(0),
            nodes: new Decimal(0),
        },
        circuit: {
            points: new Decimal(0),
            volts: new Decimal(0),
        },
    }},
    color: "#AA00FF",
    requires: new Decimal(10), // 10 Eternity
    resource: "universe points",
    baseResource: "eternity points",
    baseAmount() { return player.e.points },
    type: "static",
    base: 2.5,
    exponent: 1.6,
    row: 5,
    branches: [["e","#FFD700"], ["s2","#FF00FF"]],
    layerShown() { return hasMilestone('e', 2) || player.u.unlocked },

    effect() {
        let eff = Decimal.pow(5, player.u.points);
        // Bonus from active universe
        const uniBonus = {
            "classic": 1.5,
            "rewritten": 2.0,
            "demo": 1.8,
            "incrementverse": 2.2,
            "basic": 1.7,
            "miletree": 2.3,
            "dimensions": 2.5,
            "particles": 2.6,
            "pro": 2.8,
            "dice": 3.0,
            "ng": 3.2,
            "classicPlus": 2.5,
        };
        let b = uniBonus[player.u.activeUniverse] || 2.0;
        eff = eff.times(b);

        // Bonuses from individual universe progress
        if (player.u.classic && player.u.classic.points.gt(0)) eff = eff.times(player.u.classic.points.add(1).pow(0.1));
        if (player.u.rewritten && player.u.rewritten.points.gt(0)) eff = eff.times(player.u.rewritten.points.add(1).pow(0.12));
        if (player.u.demo && player.u.demo.points.gt(0)) eff = eff.times(player.u.demo.points.add(1).pow(0.11));
        if (player.u.incrementverse && player.u.incrementverse.points.gt(0)) eff = eff.times(player.u.incrementverse.points.add(1).pow(0.13));
        if (player.u.basic && player.u.basic.points.gt(0)) eff = eff.times(player.u.basic.points.add(1).pow(0.1));
        if (player.u.miletree && player.u.miletree.points.gt(0)) eff = eff.times(player.u.miletree.points.add(1).pow(0.12));
        if (player.u.dimensions && player.u.dimensions.points.gt(0)) eff = eff.times(player.u.dimensions.points.add(1).pow(0.14));
        if (player.u.particles && player.u.particles.points.gt(0)) eff = eff.times(player.u.particles.points.add(1).pow(0.15));
        if (player.u.pro && player.u.pro.points.gt(0)) eff = eff.times(player.u.pro.points.add(1).pow(0.16));
        if (player.u.dice && player.u.dice.points.gt(0)) eff = eff.times(player.u.dice.points.add(1).pow(0.15));
        if (player.u.ng && player.u.ng.points.gt(0)) eff = eff.times(player.u.ng.points.add(1).pow(0.18));

        // Multiverse Convergence (upgrade 66): the REAL progress saved inside the
        // bundled trees feeds back in. multiverse.js reads each tree's own save
        // key off this origin's localStorage and caches the digest, so this costs
        // nothing per tick and never touches localStorage from the game loop.
        if (hasUpgrade('u', 66) && typeof MULTIVERSE !== "undefined" && MULTIVERSE.bonusDecimal) {
            eff = eff.times(MULTIVERSE.bonusDecimal());
        }

        if (eff.gte("1e100")) eff = eff.div("1e100").pow(0.5).times("1e100");
        return eff;
    },
    effectDescription() {
        let active = player.u.activeUniverse;
        let name = universeLabel(active);
        let out = "which boost ALL points by "+format(tmp.u.effect)+"x<br>Active Universe: <b>"+name+"</b>";
        if (hasUpgrade('u', 66) && typeof MULTIVERSE !== "undefined" && MULTIVERSE.bonus) {
            let b = MULTIVERSE.bonus();
            out += "<br>Multiverse Convergence: <b>x"+format(b.mult)+"</b> from "
                + b.hit + " real save" + (b.hit === 1 ? "" : "s")
                + " in the bundled trees";
        }
        return out;
    },
    prestigeButtonText() {
        let gain = (tmp.u && tmp.u.resetGain instanceof Decimal) ? tmp.u.resetGain : getResetGain(this.layer);
        let at = (tmp.u && tmp.u.nextAt instanceof Decimal) ? tmp.u.nextAt : getNextAt(this.layer);
        if (gain.gte(1)) return "Reset for <b>"+formatWhole(gain)+"</b> universe points<br>Next at "+formatWhole(at)+" eternity";
        return "Need "+formatWhole(at)+" eternity ("+formatWhole(player.e.points)+"/"+formatWhole(at)+")";
    },
    bars: {
        universeBar: {
            direction: RIGHT, width: 500, height: 28,
            progress() { return player.u.points.div(player.u.points.add(5)).toNumber() },
            display() { return formatWhole(player.u.points)+" Universe Points — "+(player.u.activeUniverse) },
            fillStyle: {'background-color': "#AA00FF", 'background-image': "linear-gradient(90deg, #AA00FF, #FF00FF)"},
            baseStyle: {'background-color': "#220044"},
            textStyle: {'color': "white", 'text-shadow': "1px 1px 2px black"},
        },
        classicProgress: {
            direction: RIGHT, width: 300, height: 18,
            progress() { return (player.u.classic ? player.u.classic.points : new Decimal(0)).div(100).toNumber() },
            display() { return "Classic PP: "+formatWhole(player.u.classic ? player.u.classic.points : 0)+" / 100"},
            fillStyle: {'background-color': "#4BDC13"},
            unlocked() { return player.u.activeUniverse === "classic" },
        },
        rewrittenProgress: {
            direction: RIGHT, width: 300, height: 18,
            progress() { return (player.u.rewritten ? player.u.rewritten.points : new Decimal(0)).div(100).toNumber() },
            display() { return "Rewritten PP: "+formatWhole(player.u.rewritten ? player.u.rewritten.points : 0)+" / 100"},
            fillStyle: {'background-color': "#FF8800"},
            unlocked() { return player.u.activeUniverse === "rewritten" },
        },
        dimensionsProgress: {
            direction: RIGHT, width: 300, height: 18,
            progress() { return (player.u.dimensions ? player.u.dimensions.points : new Decimal(0)).div(100).toNumber() },
            display() { return "Dimensional Shards: "+formatWhole(player.u.dimensions ? player.u.dimensions.points : 0)+" / 100"},
            fillStyle: {'background-color': "#00BFFF"},
            unlocked() { return player.u.activeUniverse === "dimensions" },
        },
        particlesProgress: {
            direction: RIGHT, width: 300, height: 18,
            progress() { return (player.u.particles ? player.u.particles.points : new Decimal(0)).div(100).toNumber() },
            display() { return "Particle Core: "+formatWhole(player.u.particles ? player.u.particles.points : 0)+" / 100"},
            fillStyle: {'background-color': "#FFD700"},
            unlocked() { return player.u.activeUniverse === "particles" },
        },
        proProgress: {
            direction: RIGHT, width: 300, height: 18,
            progress() { return (player.u.pro ? player.u.pro.points : new Decimal(0)).div(100).toNumber() },
            display() { return "Pro Alphabet Points: "+formatWhole(player.u.pro ? player.u.pro.points : 0)+" / 100"},
            fillStyle: {'background-color': "#FF0077"},
            unlocked() { return player.u.activeUniverse === "pro" },
        },
        diceProgress: {
            direction: RIGHT, width: 300, height: 18,
            progress() { return (player.u.dice ? player.u.dice.points : new Decimal(0)).div(100).toNumber() },
            display() { return "Dice Rolls: "+formatWhole(player.u.dice ? player.u.dice.points : 0)+" / 100"},
            fillStyle: {'background-color': "#FFA500"},
            unlocked() { return player.u.activeUniverse === "dice" },
        },
        ngProgress: {
            direction: RIGHT, width: 300, height: 18,
            progress() { return (player.u.ng ? player.u.ng.points : new Decimal(0)).div(100).toNumber() },
            display() { return "NG+ Power: "+formatWhole(player.u.ng ? player.u.ng.points : 0)+" / 100"},
            fillStyle: {'background-color': "#00FF7F"},
            unlocked() { return player.u.activeUniverse === "ng" },
        },
        demoProgress: {
            direction: RIGHT, width: 300, height: 18,
            progress() { return (player.u.demo ? player.u.demo.points : new Decimal(0)).div(100).toNumber() },
            display() { return "Demo Candies: "+formatWhole(player.u.demo ? player.u.demo.points : 0)+" / 100"},
            fillStyle: {'background-color': "#00CC88"},
            unlocked() { return player.u.activeUniverse === "demo" },
        },
        incrementProgress: {
            direction: RIGHT, width: 300, height: 18,
            progress() { return (player.u.incrementverse ? player.u.incrementverse.points : new Decimal(0)).div(100).toNumber() },
            display() { return "Incrementreeverse: "+formatWhole(player.u.incrementverse ? player.u.incrementverse.points : 0)+" / 100"},
            fillStyle: {'background-color': "#FF44AA"},
            unlocked() { return player.u.activeUniverse === "incrementverse" },
        },
        basicProgress: {
            direction: RIGHT, width: 300, height: 18,
            progress() { return (player.u.basic ? player.u.basic.points : new Decimal(0)).div(100).toNumber() },
            display() { return "Basic Tree: "+formatWhole(player.u.basic ? player.u.basic.points : 0)+" / 100"},
            fillStyle: {'background-color': "#446688"},
            unlocked() { return player.u.activeUniverse === "basic" },
        },
        miletreeProgress: {
            direction: RIGHT, width: 300, height: 18,
            progress() { return (player.u.miletree ? player.u.miletree.points : new Decimal(0)).div(100).toNumber() },
            display() { return "Miletree: "+formatWhole(player.u.miletree ? player.u.miletree.points : 0)+" / 100"},
            fillStyle: {'background-color': "#66AA44"},
            unlocked() { return player.u.activeUniverse === "miletree" },
        },
        galaxyProgress: {
            direction: RIGHT, width: 300, height: 18,
            progress() { return (player.u.galaxy ? player.u.galaxy.points : new Decimal(0)).div(100).toNumber() },
            display() { return "Galactic Power: "+formatWhole(player.u.galaxy ? player.u.galaxy.points : 0)+" / 100"},
            fillStyle: {'background-color': "#5555CC"},
            unlocked() { return player.u.activeUniverse === "galaxy" },
        },
        synergismProgress: {
            direction: RIGHT, width: 300, height: 18,
            progress() { return (player.u.synergism ? player.u.synergism.points : new Decimal(0)).div(100).toNumber() },
            display() { return "Synergy: "+formatWhole(player.u.synergism ? player.u.synergism.points : 0)+" / 100"},
            fillStyle: {'background-color': "#CC4488"},
            unlocked() { return player.u.activeUniverse === "synergism" },
        },
        circuitProgress: {
            direction: RIGHT, width: 300, height: 18,
            progress() { return (player.u.circuit ? player.u.circuit.points : new Decimal(0)).div(100).toNumber() },
            display() { return "Circuit Power: "+formatWhole(player.u.circuit ? player.u.circuit.points : 0)+" / 100"},
            fillStyle: {'background-color': "#88AA22"},
            unlocked() { return player.u.activeUniverse === "circuit" },
        },
    },
    infoboxes: {
        lore: {
            title: "The Multiverse Nexus",
            body: `
                Welcome to the <b>Multiverse Hub</b>. Travel to any of the <b>12 distinct community universes</b>, each adapted directly from real open-source GitHub repositories cloned into <code>/tmp</code>.<br><br>
                Each universe grants an active multiplier and specialized buyable trees ported directly from the source code. Upgrades and buyables are preserved across timeline shifts.
            `,
        },
        classicLore: {
            title: "Classic Universe (1.0) - Jacorb90",
            body: `<b>Source:</b> <code>/tmp/PT-Classic</code> (Jacorb90, 7 rows, 22 layers, 7889 lines). Ported as buyables 11-13 (Prestige, Boosters, Generators).`,
        },
        rewrittenLore: {
            title: "Rewritten Universe (PT:R) - Jacorb90",
            body: `<b>Source:</b> <code>/tmp/PT-Rewritten</code> (Jacorb90, 30 layers, 9915 lines). Ported as buyables 21-23 (P/B/T).`,
        },
        dimLore: {
            title: "Dimensional Universe - loader3229",
            body: `<b>Source:</b> <code>/tmp/PT-Dimensions</code> (loader3229, 10488 lines). Ported as buyables 61-64 (Spatial Shards, Dim 1-2, Dim Boost).`,
        },
        particleLore: {
            title: "Particle Universe - cokecole526",
            body: `<b>Source:</b> <code>/tmp/The-Particle-Tree</code> (cokecole526, 614 lines). Ported as buyables 71-74 (Electrons, Protons, Neutrons, Quarks).`,
        },
        proLore: {
            title: "Pro Tree Universe - chuangyou123",
            body: `<b>Source:</b> <code>/tmp/The-Pro-Tree</code> (chuangyou123, 240k+ lines, 40+ layers). Ported as buyables 81-84 (Ants, Grass, Supernova, Void).`,
        },
        diceLore: {
            title: "Dice Tree Universe - chuangyou123",
            body: `<b>Source:</b> <code>/tmp/The-Dice-Tree</code> (chuangyou123, 60649 lines). Ported as buyables 91-94 (D6, D12, D20, Luck Charm).`,
        },
        ngLore: {
            title: "Rewritten NG+ Universe - Seder3214",
            body: `<b>Source:</b> <code>/tmp/PT-Rewritten-NG</code> (Seder3214, 12492 lines). Ported as buyables 101-104 (NG Boosters, Meta-Gen, Hyper-Time).`,
        },
    },
    upgrades: {
        11: { description: "Universe Points boost points.", cost: new Decimal(1), effect(){ return player.u.points.add(1).pow(0.5)}, effectDisplay(){ return format(this.effect())+"x"} },
        12: { description: "Active Universe bonus +50%.", cost: new Decimal(2), unlocked(){ return hasUpgrade('u',11)} },
        13: { description: "Passive universe generation (+10% / sec).", cost: new Decimal(5), unlocked(){ return hasUpgrade('u',12)} },
        21: { description: "All Universe buyables are 2x cheaper.", cost: new Decimal(10), unlocked(){ return hasUpgrade('u',13)} },
        22: { description: "Multiverse Core effect +100%.", cost: new Decimal(25), unlocked(){ return hasUpgrade('u',21)} },
        23: { description: "Universe effect softcap pushed to 1e200.", cost: new Decimal(50), unlocked(){ return hasUpgrade('u',22)} },
        31: { description: "Unlock Classic Challenges.", cost: new Decimal(100), unlocked(){ return hasUpgrade('u',23)} },
        32: { description: "Unlock Rewritten Challenges.", cost: new Decimal(250), unlocked(){ return hasUpgrade('u',31)} },
        33: { description: "Unlock All 22 Classic Layers.", cost: new Decimal(500), unlocked(){ return hasUpgrade('u',32)} },
        34: { description: "Unlock Demo Universe travel.", cost: new Decimal(750), unlocked(){ return hasUpgrade('u',33)} },
        35: { description: "Unlock Incrementreeverse Universe travel.", cost: new Decimal(1200), unlocked(){ return hasUpgrade('u',34)} },
        41: { description: "Keep Universe upgrades on Eternity reset.", cost: new Decimal(2000), unlocked(){ return hasUpgrade('u',35)} },
        42: { description: "Unlock The Basic Tree universe.", cost: new Decimal(3000), unlocked(){ return hasUpgrade('u',41)} },
        43: { description: "Unlock The Milestone Tree universe.", cost: new Decimal(4000), unlocked(){ return hasUpgrade('u',42)} },
        51: { description: "Unlock PT: Dimensions universe.", cost: new Decimal(5000), unlocked(){ return hasUpgrade('u',43)} },
        52: { description: "Unlock Particle Increment Tree universe.", cost: new Decimal(6000), unlocked(){ return hasUpgrade('u',51)} },
        53: { description: "Unlock The Pro Tree universe.", cost: new Decimal(7500), unlocked(){ return hasUpgrade('u',52)} },
        54: { description: "Unlock The Dice Tree universe.", cost: new Decimal(9000), unlocked(){ return hasUpgrade('u',53)} },
        55: { description: "Unlock PT: Rewritten NG+ universe.", cost: new Decimal(12000), unlocked(){ return hasUpgrade('u',54)} },
        // Row 6 — The Deep Realms (v0.8 Full)
        61: { description: "Unlock The Galaxy Tree universe.", cost: new Decimal(20000), unlocked(){ return hasUpgrade('u',55)} },
        62: { description: "Unlock Synergism universe.", cost: new Decimal(30000), unlocked(){ return hasUpgrade('u',61)} },
        63: { description: "Unlock The Circuit Tree universe.", cost: new Decimal(50000), unlocked(){ return hasUpgrade('u',62)} },
        64: { description: "Universe effect ^1.15.", cost: new Decimal(75000), unlocked(){ return hasUpgrade('u',63)} },
        65: { description: "Active universe bonus ^1.5.", cost: new Decimal(100000), unlocked(){ return hasUpgrade('u',64)} },
        // Row 6 — Multiverse Convergence (v0.9): makes the *real* games pay back
        66: { description: "Multiverse Convergence: each bundled tree you actually play boosts the Universe effect by +5%\u00b7\u221alog\u2081\u2080(progress), up to x100 per realm.", cost: new Decimal(150000), unlocked(){ return hasUpgrade('u',65)} },
    },
    buyables: {
        // Classic buyables
        11: {
            title: "Classic: Prestige (P)",
            cost(x){ return Decimal.pow(10, x).times(10) },
            effect(x){ return Decimal.pow(2, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x points" },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.classic) player.u.classic.points=player.u.classic.points.add(1); },
            style:{'height':'120px', 'background-color':"#4BDC13"},
        },
        12: {
            title: "Classic: Booster (B)",
            cost(x){ return Decimal.pow(20, x).times(50) },
            effect(x){ return Decimal.pow(2.5, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x B gain" },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.classic) player.u.classic.boosters=player.u.classic.boosters.add(1); },
            style:{'height':'120px', 'background-color':"#2a8c08"},
        },
        13: {
            title: "Classic: Generator (G)",
            cost(x){ return Decimal.pow(20, x).times(50) },
            effect(x){ return Decimal.pow(2.2, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x G gain" },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.classic) player.u.classic.generators=player.u.classic.generators.add(1); },
            style:{'height':'120px', 'background-color':"#1a5c05"},
        },

        // Rewritten buyables
        21: {
            title: "Rewritten: Prestige (P)",
            cost(x){ return Decimal.pow(15, x).times(20) },
            effect(x){ return Decimal.pow(2.2, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x" },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.rewritten) player.u.rewritten.points=player.u.rewritten.points.add(1); },
            style:{'height':'120px', 'background-color':"#FF8800"},
        },
        22: {
            title: "Rewritten: Booster (B)",
            cost(x){ return Decimal.pow(25, x).times(60) },
            effect(x){ return Decimal.pow(2.6, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x" },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.rewritten) player.u.rewritten.boosters=player.u.rewritten.boosters.add(1); },
            style:{'height':'120px', 'background-color':"#cc6600"},
        },
        23: {
            title: "Rewritten: Time (T)",
            cost(x){ return Decimal.pow(30, x).times(100) },
            effect(x){ return Decimal.pow(3.0, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x" },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.rewritten) player.u.rewritten.time=player.u.rewritten.time.add(1); },
            style:{'height':'120px', 'background-color':"#994400"},
        },

        // Dimensions buyables (loader3229)
        61: {
            title: "Spatial Shard",
            cost(x){ return Decimal.pow(15, x).times(30) },
            effect(x){ return Decimal.pow(3, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x points" },
            unlocked(){ return hasUpgrade('u', 51) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.dimensions) player.u.dimensions.points=player.u.dimensions.points.add(1); },
            style:{'height':'120px', 'background-color':"#00BFFF"},
        },
        62: {
            title: "1st Dimension",
            cost(x){ return Decimal.pow(25, x).times(80) },
            effect(x){ return Decimal.pow(4, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x Dim 1 power" },
            unlocked(){ return hasUpgrade('u', 51) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.dimensions) player.u.dimensions.dim1=player.u.dimensions.dim1.add(1); },
            style:{'height':'120px', 'background-color':"#0088cc"},
        },
        63: {
            title: "Dimension Boost",
            cost(x){ return Decimal.pow(50, x).times(200) },
            effect(x){ return Decimal.pow(2, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: +"+format(d.effect)+" Dim multiplier" },
            unlocked(){ return hasUpgrade('u', 51) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.dimensions) player.u.dimensions.dimBoost=player.u.dimensions.dimBoost.add(1); },
            style:{'height':'120px', 'background-color':"#005588"},
        },

        // Particle buyables (cokecole526)
        71: {
            title: "Electrons",
            cost(x){ return Decimal.pow(12, x).times(25) },
            effect(x){ return Decimal.pow(2.5, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x charge" },
            unlocked(){ return hasUpgrade('u', 52) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.particles) player.u.particles.electrons=player.u.particles.electrons.add(1); },
            style:{'height':'120px', 'background-color':"#FFD700"},
        },
        72: {
            title: "Protons & Neutrons",
            cost(x){ return Decimal.pow(20, x).times(75) },
            effect(x){ return Decimal.pow(3.5, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x mass" },
            unlocked(){ return hasUpgrade('u', 52) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.particles) player.u.particles.protons=player.u.particles.protons.add(1); },
            style:{'height':'120px', 'background-color':"#ccaa00"},
        },
        73: {
            title: "Quark Core",
            cost(x){ return Decimal.pow(40, x).times(250) },
            effect(x){ return Decimal.pow(5, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x binding" },
            unlocked(){ return hasUpgrade('u', 52) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.particles) player.u.particles.quarks=player.u.particles.quarks.add(1); },
            style:{'height':'120px', 'background-color':"#998800"},
        },

        // Pro Tree buyables (chuangyou123)
        81: {
            title: "Ant Colony",
            cost(x){ return Decimal.pow(15, x).times(35) },
            effect(x){ return Decimal.pow(3, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x swarm" },
            unlocked(){ return hasUpgrade('u', 53) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.pro) player.u.pro.ants=player.u.pro.ants.add(1); },
            style:{'height':'120px', 'background-color':"#FF0077"},
        },
        82: {
            title: "Supernova Core",
            cost(x){ return Decimal.pow(30, x).times(150) },
            effect(x){ return Decimal.pow(6, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x blast" },
            unlocked(){ return hasUpgrade('u', 53) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.pro) player.u.pro.supernova=player.u.pro.supernova.add(1); },
            style:{'height':'120px', 'background-color':"#cc0055"},
        },

        // Dice Tree buyables (chuangyou123)
        91: {
            title: "D20 Roller",
            cost(x){ return Decimal.pow(20, x).times(40) },
            effect(x){ return Decimal.pow(4, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x roll power" },
            unlocked(){ return hasUpgrade('u', 54) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.dice) player.u.dice.d20=player.u.dice.d20.add(1); },
            style:{'height':'120px', 'background-color':"#FFA500"},
        },
        92: {
            title: "Luck Charm",
            cost(x){ return Decimal.pow(35, x).times(200) },
            effect(x){ return Decimal.pow(3, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x critical bonus" },
            unlocked(){ return hasUpgrade('u', 54) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.dice) player.u.dice.luck=player.u.dice.luck.add(1); },
            style:{'height':'120px', 'background-color':"#cc8400"},
        },

        // NG+ buyables (Seder3214)
        101: {
            title: "NG+ Booster",
            cost(x){ return Decimal.pow(25, x).times(50) },
            effect(x){ return Decimal.pow(5, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x NG power" },
            unlocked(){ return hasUpgrade('u', 55) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.ng) player.u.ng.ngBoosters=player.u.ng.ngBoosters.add(1); },
            style:{'height':'120px', 'background-color':"#00FF7F"},
        },
        102: {
            title: "Meta-Generator",
            cost(x){ return Decimal.pow(50, x).times(300) },
            effect(x){ return Decimal.pow(8, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x generation" },
            unlocked(){ return hasUpgrade('u', 55) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.ng) player.u.ng.metaGenerators=player.u.ng.metaGenerators.add(1); },
            style:{'height':'120px', 'background-color':"#00cc66"},
        },

        // TMT Demo buyables (v0.8 Full)
        41: {
            title: "Demo: Candy Machine",
            cost(x){ return Decimal.pow(18, x).times(40) },
            effect(x){ return Decimal.pow(2.8, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x sweetness" },
            unlocked(){ return hasUpgrade('u', 34) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.demo) player.u.demo.candies=player.u.demo.candies.add(1); },
            style:{'height':'120px', 'background-color':"#00CC88"},
        },
        42: {
            title: "Demo: Candy Farm",
            cost(x){ return Decimal.pow(30, x).times(120) },
            effect(x){ return Decimal.pow(4, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x harvest" },
            unlocked(){ return hasUpgrade('u', 34) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.demo) player.u.demo.farm=player.u.demo.farm.add(1); },
            style:{'height':'120px', 'background-color':"#009966"},
        },

        // Incrementreeverse buyables (v0.8 Full)
        43: {
            title: "Incrementree: Incrementy Gen",
            cost(x){ return Decimal.pow(16, x).times(30) },
            effect(x){ return Decimal.pow(2.4, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x incrementy" },
            unlocked(){ return hasUpgrade('u', 35) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.incrementverse) player.u.incrementverse.incrementy=player.u.incrementverse.incrementy.add(1); },
            style:{'height':'120px', 'background-color':"#FF44AA"},
        },
        44: {
            title: "Incrementree: Prestige Tree",
            cost(x){ return Decimal.pow(28, x).times(90) },
            effect(x){ return Decimal.pow(3.4, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x mini-prestige" },
            unlocked(){ return hasUpgrade('u', 35) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.incrementverse) player.u.incrementverse.prestige=player.u.incrementverse.prestige.add(1); },
            style:{'height':'120px', 'background-color':"#CC2288"},
        },

        // The Basic Tree buyables (v0.8 Full)
        45: {
            title: "Basic: Cheapener",
            cost(x){ return Decimal.pow(14, x).times(25) },
            effect(x){ return Decimal.pow(2.2, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x cheapness" },
            unlocked(){ return hasUpgrade('u', 42) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.basic) player.u.basic.cheapeners=player.u.basic.cheapeners.add(1); },
            style:{'height':'120px', 'background-color':"#446688"},
        },
        46: {
            title: "Basic: Darkness Amp",
            cost(x){ return Decimal.pow(26, x).times(80) },
            effect(x){ return Decimal.pow(3.2, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x darkness" },
            unlocked(){ return hasUpgrade('u', 42) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.basic) player.u.basic.darkness=player.u.basic.darkness.add(1); },
            style:{'height':'120px', 'background-color':"#222244"},
        },
        47: {
            title: "Basic: Exponent Bolt",
            cost(x){ return Decimal.pow(45, x).times(220) },
            effect(x){ return Decimal.pow(5, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x exponents" },
            unlocked(){ return hasUpgrade('u', 42) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.basic) player.u.basic.exponents=player.u.basic.exponents.add(1); },
            style:{'height':'120px', 'background-color':"#111122"},
        },

        // The Milestone Tree buyables (v0.8 Full)
        51: {
            title: "Miletree: Prestige",
            cost(x){ return Decimal.pow(20, x).times(50) },
            effect(x){ return Decimal.pow(3, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x mini-milestones" },
            unlocked(){ return hasUpgrade('u', 43) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.miletree) player.u.miletree.prestige=player.u.miletree.prestige.add(1); },
            style:{'height':'120px', 'background-color':"#66AA44"},
        },
        52: {
            title: "Miletree: Super Prestige",
            cost(x){ return Decimal.pow(38, x).times(150) },
            effect(x){ return Decimal.pow(4.5, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x super prestige" },
            unlocked(){ return hasUpgrade('u', 43) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.miletree) player.u.miletree.superPrestige=player.u.miletree.superPrestige.add(1); },
            style:{'height':'120px', 'background-color':"#448822"},
        },

        // The Galaxy Tree buyables (v0.8 Full)
        111: {
            title: "Galaxy: Star Core",
            cost(x){ return Decimal.pow(22, x).times(60) },
            effect(x){ return Decimal.pow(3.6, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x starlight" },
            unlocked(){ return hasUpgrade('u', 61) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.galaxy) player.u.galaxy.stars=player.u.galaxy.stars.add(1); },
            style:{'height':'120px', 'background-color':"#5555CC"},
        },
        112: {
            title: "Galaxy: Galactic Engine",
            cost(x){ return Decimal.pow(44, x).times(180) },
            effect(x){ return Decimal.pow(5.5, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x gravity" },
            unlocked(){ return hasUpgrade('u', 61) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.galaxy) player.u.galaxy.points=player.u.galaxy.points.add(1); },
            style:{'height':'120px', 'background-color':"#3333AA"},
        },

        // Synergism buyables (v0.8 Full)
        121: {
            title: "Synergism: Synergy Node",
            cost(x){ return Decimal.pow(25, x).times(70) },
            effect(x){ return Decimal.pow(4, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x synergy" },
            unlocked(){ return hasUpgrade('u', 62) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.synergism) player.u.synergism.nodes=player.u.synergism.nodes.add(1); },
            style:{'height':'120px', 'background-color':"#CC4488"},
        },
        122: {
            title: "Synergism: Synergic Overlord",
            cost(x){ return Decimal.pow(50, x).times(250) },
            effect(x){ return Decimal.pow(6, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x overlordship" },
            unlocked(){ return hasUpgrade('u', 62) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.synergism) player.u.synergism.points=player.u.synergism.points.add(1); },
            style:{'height':'120px', 'background-color':"#992266"},
        },

        // The Circuit Tree buyables (v0.8 Full)
        131: {
            title: "Circuit: Volt Coil",
            cost(x){ return Decimal.pow(28, x).times(80) },
            effect(x){ return Decimal.pow(4.2, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x voltage" },
            unlocked(){ return hasUpgrade('u', 63) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.circuit) player.u.circuit.volts=player.u.circuit.volts.add(1); },
            style:{'height':'120px', 'background-color':"#88AA22"},
        },
        132: {
            title: "Circuit: Quantum Circuit",
            cost(x){ return Decimal.pow(55, x).times(300) },
            effect(x){ return Decimal.pow(6.5, x) },
            display(){ let d=tmp[this.layer].buyables[this.id]; return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x current" },
            unlocked(){ return hasUpgrade('u', 63) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost) },
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); if(player.u.circuit) player.u.circuit.points=player.u.circuit.points.add(1); },
            style:{'height':'120px', 'background-color':"#557711"},
        },

        // Multiverse Core
        31: {
            title: "Multiverse Core",
            cost(x){ return Decimal.pow(3, x).times(5) },
            effect(x){
                let eff = Decimal.pow(1.5, x);
                if(hasUpgrade('u',22)) eff = eff.pow(2);
                return eff;
            },
            display(){
                let d=tmp[this.layer].buyables[this.id];
                return "Cost: "+format(d.cost)+" U<br>Lvl: "+formatWhole(player.u.buyables[this.id])+"<br>Eff: "+format(d.effect)+"x to ALL universes"
            },
            unlocked(){ return hasMilestone('u',2) },
            canAfford(){ return player.u.points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy(){ player.u.points=player.u.points.sub(tmp[this.layer].buyables[this.id].cost); setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1)); },
            style:{'height':'130px', 'background-color':"#AA00FF"},
        },
    },
    clickables: {
        11: {
            title: "Travel: Classic 1.0",
            display(){ return player.u.activeUniverse==="classic" ? "<b>ACTIVE</b><br>Classic Universe<br>Bonus: x1.5" : "Travel to<br><b>Classic 1.0</b><br>Cost: 1 U<br>Bonus: x1.5" },
            canClick(){ return player.u.points.gte(1) && player.u.activeUniverse !== "classic" && (player.u.travelCooldown||0)<=0 },
            onClick(){
                if(player.u.points.gte(1)){
                    player.u.points = player.u.points.sub(1);
                    player.u.activeUniverse = "classic";
                    player.u.travelCooldown = 5;
                    doPopup("none","Traveled to Classic 1.0 Universe! Point gain x1.5","Universe Shift",3,"#4BDC13");
                }
            },
            style(){ return {'background-color': player.u.activeUniverse==="classic" ? "#00aa00" : "#225511", 'height':'100px'}},
        },
        12: {
            title: "Travel: Rewritten (PT:R)",
            display(){ return player.u.activeUniverse==="rewritten" ? "<b>ACTIVE</b><br>PT: Rewritten<br>Bonus: x2.0" : "Travel to<br><b>PT: Rewritten</b><br>Cost: 1 U<br>Bonus: x2.0" },
            canClick(){ return player.u.points.gte(1) && player.u.activeUniverse !== "rewritten" && (player.u.travelCooldown||0)<=0 },
            onClick(){
                if(player.u.points.gte(1)){
                    player.u.points = player.u.points.sub(1);
                    player.u.activeUniverse = "rewritten";
                    player.u.travelCooldown = 5;
                    doPopup("none","Traveled to PT: Rewritten Universe! Point gain x2.0","Universe Shift",3,"#FF8800");
                }
            },
            style(){ return {'background-color': player.u.activeUniverse==="rewritten" ? "#00aa00" : "#553311", 'height':'100px'}},
        },
        13: {
            title: "Travel: Classic+ Hub",
            display(){ return player.u.activeUniverse==="classicPlus" ? "<b>ACTIVE</b><br>Classic+ Hub<br>Bonus: x2.5" : "Return to<br><b>Classic+ Hub</b><br>Cost: 1 U<br>Bonus: x2.5" },
            canClick(){ return player.u.points.gte(1) && player.u.activeUniverse !== "classicPlus" && (player.u.travelCooldown||0)<=0 },
            onClick(){
                if(player.u.points.gte(1)){
                    player.u.points = player.u.points.sub(1);
                    player.u.activeUniverse = "classicPlus";
                    player.u.travelCooldown = 5;
                    doPopup("none","Returned to Classic+ Hub! Point gain x2.5","Universe Shift",3,"#AA00FF");
                }
            },
            style(){ return {'background-color': player.u.activeUniverse==="classicPlus" ? "#00aa00" : "#441155", 'height':'100px'}},
        },
        15: {
            title: "Travel: TMT Demo",
            display(){ return player.u.activeUniverse==="demo" ? "<b>ACTIVE</b><br>TMT Demo<br>Bonus: x1.8" : "Travel to<br><b>TMT Demo</b><br>Cost: 2 U<br>Bonus: x1.8" },
            canClick(){ return player.u.points.gte(2) && player.u.activeUniverse !== "demo" && (player.u.travelCooldown||0)<=0 },
            onClick(){
                if(player.u.points.gte(2)){
                    player.u.points = player.u.points.sub(2);
                    player.u.activeUniverse = "demo";
                    player.u.travelCooldown = 5;
                    doPopup("none","Traveled to TMT Demo Universe! Point gain x1.8","Universe Shift",3,"#00CC88");
                }
            },
            style(){ return {'background-color': player.u.activeUniverse==="demo" ? "#00aa00" : "#114433", 'height':'100px'}},
            unlocked(){ return hasUpgrade('u',34)},
        },
        16: {
            title: "Travel: Incrementreeverse",
            display(){ return player.u.activeUniverse==="incrementverse" ? "<b>ACTIVE</b><br>Incrementreeverse<br>Bonus: x2.2" : "Travel to<br><b>Incrementreeverse</b><br>Cost: 2 U<br>Bonus: x2.2" },
            canClick(){ return player.u.points.gte(2) && player.u.activeUniverse !== "incrementverse" && (player.u.travelCooldown||0)<=0 },
            onClick(){
                if(player.u.points.gte(2)){
                    player.u.points = player.u.points.sub(2);
                    player.u.activeUniverse = "incrementverse";
                    player.u.travelCooldown = 5;
                    doPopup("none","Traveled to Incrementreeverse! Point gain x2.2","Universe Shift",3,"#FF44AA");
                }
            },
            style(){ return {'background-color': player.u.activeUniverse==="incrementverse" ? "#00aa00" : "#661144", 'height':'100px'}},
            unlocked(){ return hasUpgrade('u',35)},
        },
        17: {
            title: "Travel: PT: Dimensions",
            display(){ return player.u.activeUniverse==="dimensions" ? "<b>ACTIVE</b><br>PT: Dimensions<br>Bonus: x2.5" : "Travel to<br><b>PT: Dimensions</b><br>Cost: 3 U<br>Bonus: x2.5" },
            canClick(){ return player.u.points.gte(3) && player.u.activeUniverse !== "dimensions" && (player.u.travelCooldown||0)<=0 },
            onClick(){
                if(player.u.points.gte(3)){
                    player.u.points = player.u.points.sub(3);
                    player.u.activeUniverse = "dimensions";
                    player.u.travelCooldown = 5;
                    doPopup("none","Traveled to PT: Dimensions Universe! Point gain x2.5","Universe Shift",3,"#00BFFF");
                }
            },
            style(){ return {'background-color': player.u.activeUniverse==="dimensions" ? "#00aa00" : "#003355", 'height':'100px'}},
            unlocked(){ return hasUpgrade('u',51)},
        },
        18: {
            title: "Travel: Particle Tree",
            display(){ return player.u.activeUniverse==="particles" ? "<b>ACTIVE</b><br>Particle Tree<br>Bonus: x2.6" : "Travel to<br><b>Particle Tree</b><br>Cost: 3 U<br>Bonus: x2.6" },
            canClick(){ return player.u.points.gte(3) && player.u.activeUniverse !== "particles" && (player.u.travelCooldown||0)<=0 },
            onClick(){
                if(player.u.points.gte(3)){
                    player.u.points = player.u.points.sub(3);
                    player.u.activeUniverse = "particles";
                    player.u.travelCooldown = 5;
                    doPopup("none","Traveled to Particle Tree Universe! Point gain x2.6","Universe Shift",3,"#FFD700");
                }
            },
            style(){ return {'background-color': player.u.activeUniverse==="particles" ? "#00aa00" : "#554400", 'height':'100px'}},
            unlocked(){ return hasUpgrade('u',52)},
        },
        19: {
            title: "Travel: The Pro Tree",
            display(){ return player.u.activeUniverse==="pro" ? "<b>ACTIVE</b><br>The Pro Tree<br>Bonus: x2.8" : "Travel to<br><b>The Pro Tree</b><br>Cost: 4 U<br>Bonus: x2.8" },
            canClick(){ return player.u.points.gte(4) && player.u.activeUniverse !== "pro" && (player.u.travelCooldown||0)<=0 },
            onClick(){
                if(player.u.points.gte(4)){
                    player.u.points = player.u.points.sub(4);
                    player.u.activeUniverse = "pro";
                    player.u.travelCooldown = 5;
                    doPopup("none","Traveled to The Pro Tree Universe! Point gain x2.8","Universe Shift",3,"#FF0077");
                }
            },
            style(){ return {'background-color': player.u.activeUniverse==="pro" ? "#00aa00" : "#550022", 'height':'100px'}},
            unlocked(){ return hasUpgrade('u',53)},
        },
        20: {
            title: "Travel: The Dice Tree",
            display(){ return player.u.activeUniverse==="dice" ? "<b>ACTIVE</b><br>The Dice Tree<br>Bonus: x3.0" : "Travel to<br><b>The Dice Tree</b><br>Cost: 4 U<br>Bonus: x3.0" },
            canClick(){ return player.u.points.gte(4) && player.u.activeUniverse !== "dice" && (player.u.travelCooldown||0)<=0 },
            onClick(){
                if(player.u.points.gte(4)){
                    player.u.points = player.u.points.sub(4);
                    player.u.activeUniverse = "dice";
                    player.u.travelCooldown = 5;
                    doPopup("none","Traveled to The Dice Tree Universe! Point gain x3.0","Universe Shift",3,"#FFA500");
                }
            },
            style(){ return {'background-color': player.u.activeUniverse==="dice" ? "#00aa00" : "#553300", 'height':'100px'}},
            unlocked(){ return hasUpgrade('u',54)},
        },
        21: {
            title: "Travel: PT: Rewritten NG+",
            display(){ return player.u.activeUniverse==="ng" ? "<b>ACTIVE</b><br>PT: Rewritten NG+<br>Bonus: x3.2" : "Travel to<br><b>PT: Rewritten NG+</b><br>Cost: 5 U<br>Bonus: x3.2" },
            canClick(){ return player.u.points.gte(5) && player.u.activeUniverse !== "ng" && (player.u.travelCooldown||0)<=0 },
            onClick(){
                if(player.u.points.gte(5)){
                    player.u.points = player.u.points.sub(5);
                    player.u.activeUniverse = "ng";
                    player.u.travelCooldown = 5;
                    doPopup("none","Traveled to PT: Rewritten NG+ Universe! Point gain x3.2","Universe Shift",3,"#00FF7F");
                }
            },
            style(){ return {'background-color': player.u.activeUniverse==="ng" ? "#00aa00" : "#005522", 'height':'100px'}},
            unlocked(){ return hasUpgrade('u',55)},
        },
        22: {
            title: "Travel: The Galaxy Tree",
            display(){ return player.u.activeUniverse==="galaxy" ? "<b>ACTIVE</b><br>The Galaxy Tree<br>Bonus: x3.4" : "Travel to<br><b>The Galaxy Tree</b><br>Cost: 6 U<br>Bonus: x3.4" },
            canClick(){ return player.u.points.gte(6) && player.u.activeUniverse !== "galaxy" && (player.u.travelCooldown||0)<=0 },
            onClick(){
                if(player.u.points.gte(6)){
                    player.u.points = player.u.points.sub(6);
                    player.u.activeUniverse = "galaxy";
                    player.u.travelCooldown = 5;
                    doPopup("none","Traveled to The Galaxy Tree! Point gain x3.4","Universe Shift",3,"#6666FF");
                }
            },
            style(){ return {'background-color': player.u.activeUniverse==="galaxy" ? "#00aa00" : "#222266", 'height':'100px'}},
            unlocked(){ return hasUpgrade('u',61)},
        },
        23: {
            title: "Travel: Synergism",
            display(){ return player.u.activeUniverse==="synergism" ? "<b>ACTIVE</b><br>Synergism<br>Bonus: x3.6" : "Travel to<br><b>Synergism</b><br>Cost: 8 U<br>Bonus: x3.6" },
            canClick(){ return player.u.points.gte(8) && player.u.activeUniverse !== "synergism" && (player.u.travelCooldown||0)<=0 },
            onClick(){
                if(player.u.points.gte(8)){
                    player.u.points = player.u.points.sub(8);
                    player.u.activeUniverse = "synergism";
                    player.u.travelCooldown = 5;
                    doPopup("none","Traveled to Synergism! Point gain x3.6","Universe Shift",3,"#FF66AA");
                }
            },
            style(){ return {'background-color': player.u.activeUniverse==="synergism" ? "#00aa00" : "#662244", 'height':'100px'}},
            unlocked(){ return hasUpgrade('u',62)},
        },
        24: {
            title: "Travel: The Circuit Tree",
            display(){ return player.u.activeUniverse==="circuit" ? "<b>ACTIVE</b><br>The Circuit Tree<br>Bonus: x3.8" : "Travel to<br><b>The Circuit Tree</b><br>Cost: 10 U<br>Bonus: x3.8" },
            canClick(){ return player.u.points.gte(10) && player.u.activeUniverse !== "circuit" && (player.u.travelCooldown||0)<=0 },
            onClick(){
                if(player.u.points.gte(10)){
                    player.u.points = player.u.points.sub(10);
                    player.u.activeUniverse = "circuit";
                    player.u.travelCooldown = 5;
                    doPopup("none","Traveled to The Circuit Tree! Point gain x3.8","Universe Shift",3,"#AAFF66");
                }
            },
            style(){ return {'background-color': player.u.activeUniverse==="circuit" ? "#00aa00" : "#445522", 'height':'100px'}},
            unlocked(){ return hasUpgrade('u',63)},
        },
    },
    challenges: {
        11: {
            name: "Classic Challenge: 2019",
            challengeDescription: "You are stuck in Classic 1.0 balance (200 req for B/G, static 1.25). Point gain ^0.6",
            goalDescription: "Reach 1e12 points", canComplete(){ return player.points.gte(1e12)},
            rewardDescription: "Classic buyables x2", rewardEffect(){ return new Decimal(2)}, unlocked(){ return hasUpgrade('u',31)},
        },
        12: {
            name: "Rewritten Challenge: Mastery",
            challengeDescription: "Rewritten mastery active. Point gain ^0.5, prestige gain ^0.5",
            goalDescription: "Reach 1e18 points", canComplete(){ return player.points.gte(1e18)},
            rewardDescription: "Rewritten buyables x2", rewardEffect(){ return new Decimal(2)}, unlocked(){ return hasUpgrade('u',32)},
        },
        21: {
            name: "Multiverse Collapse",
            challengeDescription: "Active universe bonus disabled. All universe buyables cost x10.",
            goalDescription: "Reach 1e25 points", canComplete(){ return player.points.gte(1e25)},
            rewardDescription: "Universe effect ^1.2", unlocked(){ return hasChallenge('u',12)},
        },
    },
    milestones: {
        0: { requirementDescription: "1 universe point", effectDescription: "Keep Eternity milestones, point gain x2", done(){ return player.u.best.gte(1)} },
        1: { requirementDescription: "3 universe points", effectDescription: "Unlock Multiverse Scan, keep upgrades on E reset", done(){ return player.u.best.gte(3)}, unlocked(){return hasMilestone('u',0)} },
        2: { requirementDescription: "8 universe points", effectDescription: "Unlock Multiverse Core buyable, Universe gain x2", done(){ return player.u.best.gte(8)}, unlocked(){return hasMilestone('u',1)} },
        3: { requirementDescription: "20 universe points", effectDescription: "Gain 10% universe passively, keep buyables", done(){ return player.u.best.gte(20)}, unlocked(){return hasMilestone('u',2)} },
        4: { requirementDescription: "50 universe points", effectDescription: "Travel cooldown halved (5s → 2.5s)", done(){ return player.u.best.gte(50)}, unlocked(){return hasMilestone('u',3)} },
        5: { requirementDescription: "100 universe points", effectDescription: "Omniversal Link: All universe buyables ^1.2", done(){ return player.u.best.gte(100)}, unlocked(){return hasMilestone('u',4)} },
        6: { requirementDescription: "1,000 universe points", effectDescription: "Active universe bonus +0.5", done(){ return player.u.best.gte(1000)}, unlocked(){return hasMilestone('u',5)} },
        7: { requirementDescription: "10,000 universe points", effectDescription: "Active universe bonus x2", done(){ return player.u.best.gte(10000)}, unlocked(){return hasMilestone('u',6)} },
    },
    update(diff){
        if(player.u.travelCooldown>0) player.u.travelCooldown = Math.max(0, player.u.travelCooldown - diff);
        // Passive universe generation (upgrade 13: 10%/s, milestone 3: +10%/s)
        let rate = 0;
        if (hasUpgrade('u', 13)) rate += 0.1;
        if (hasMilestone('u', 3)) rate += 0.1;
        if (rate > 0 && tmp.u && tmp.u.resetGain instanceof Decimal && tmp.u.resetGain.gte(1)) {
            player.u.points = player.u.points.add(tmp.u.resetGain.times(rate).times(diff));
            player.u.best = player.u.best.max(player.u.points);
            player.u.total = player.u.total.add(tmp.u.resetGain.times(rate).times(diff));
        }
    },
    microtabs: {
        universes: {
            "hub": {
                content: [
                    ["display-text", function(){ return "Active: <b>"+universeLabel(player.u.activeUniverse)+"</b> | Cooldown: "+format(player.u.travelCooldown||0)+"s"}],
                    "blank",
                    ["row", [["clickable",11],["clickable",12],["clickable",13],["clickable",15],["clickable",16]]],
                    "blank",
                    ["row", [["clickable",17],["clickable",18],["clickable",19],["clickable",20],["clickable",21]]],
                    "blank",
                    ["row", [["clickable",22],["clickable",23],["clickable",24]]],
                    "blank",
                    ["display-text", function(){ return "Travel costs Universe Points and switches your active bonus. The buyables on each universe tab are Classic+'s <i>own interpretation</i> of that game — the real thing is one click away below."}],
                    "blank",
                    ["display-text", function(){ return "<h3>⟡ MULTIVERSE TRANSPORT TERMINAL</h3>Click a realm to drop into the <b>full, playable original game</b>. Your Classic+ run keeps going while you're gone."}],
                    ["raw-html", function(){ return transportHubHTML() }],
                    ["raw-html", function(){ return typeof multiverseTerminalHTML === "function" ? multiverseTerminalHTML() : "" }],
                    "blank",
                    ["display-text", function(){ return "<i>⟡ = full standalone game bundled with this repo &nbsp;•&nbsp; ⌂ = this tree &nbsp;•&nbsp; ∅ = original to Classic+, no separate source</i>"}],
                    "blank",
                    ["infobox","lore"],
                    "blank",
                    ["bar","universeBar"],
                ]
            },
            "switcher": {
                unlocked(){ return hasMilestone('u',1) || hasUpgrade('u',66) },
                buttonStyle: {'border-color': '#FFD700'},
                content: [
                    ["display-text", function(){ return "<h3>\u26c1 UNIVERSE SWITCHER</h3>"
                        + (typeof MULTIVERSE === "undefined"
                            ? "<span style='color:#ff8899'>js/technical/multiverse.js failed to load.</span>"
                            : "scan = every realm\u2019s real save, no extra engines &nbsp;\u2022&nbsp; reel = one live tree, cycling &nbsp;\u2022&nbsp; swarm = many live trees at once")}],
                    ["raw-html", function(){ return typeof multiverseSwitcherHTML === "function" ? multiverseSwitcherHTML() : "" }],
                    "blank",
                    ["display-text", function(){ return hasUpgrade('u',66)
                        ? "<i>Convergence is online: progress you make inside a bundled tree raises this layer\u2019s multiplier on its own merits.</i>"
                        : "<i>Multiverse Convergence (upgrade U-66) makes these real saves pay off. The switcher works without it.</i>"}],
                    "blank",
                    ["bar","universeBar"],
                ]
            },
            "classic": {
                content: [
                    ["infobox","classicLore"],
                    "blank",
                    ["display-text", function(){ return "Classic Universe Progress: "+formatWhole(player.u.classic ? player.u.classic.points : 0)+" PP"}],
                    ["bar","classicProgress"],
                    "blank",
                    ["row", [["buyable",11],["buyable",12],["buyable",13]]],
                    "blank",
                    ["raw-html", function(){ return transportButtonHTML("classic") }],
                ]
            },
            "rewritten": {
                content: [
                    ["infobox","rewrittenLore"],
                    "blank",
                    ["display-text", function(){ return "Rewritten Progress: "+formatWhole(player.u.rewritten ? player.u.rewritten.points : 0)+" PP"}],
                    ["bar","rewrittenProgress"],
                    "blank",
                    ["row", [["buyable",21],["buyable",22],["buyable",23]]],
                    "blank",
                    ["raw-html", function(){ return transportButtonHTML("rewritten") }],
                ]
            },
            "dimensions": {
                content: [
                    ["infobox","dimLore"],
                    "blank",
                    ["display-text", function(){ return "Dimensions Progress: "+formatWhole(player.u.dimensions ? player.u.dimensions.points : 0)+" Shards"}],
                    ["bar","dimensionsProgress"],
                    "blank",
                    ["row", [["buyable",61],["buyable",62],["buyable",63]]],
                    "blank",
                    ["raw-html", function(){ return transportButtonHTML("dimensions") }],
                ]
            },
            "particles": {
                content: [
                    ["infobox","particleLore"],
                    "blank",
                    ["display-text", function(){ return "Particle Core: "+formatWhole(player.u.particles ? player.u.particles.points : 0)+" Atoms"}],
                    ["bar","particlesProgress"],
                    "blank",
                    ["row", [["buyable",71],["buyable",72],["buyable",73]]],
                    "blank",
                    ["raw-html", function(){ return transportButtonHTML("particles") }],
                ]
            },
            "pro": {
                content: [
                    ["infobox","proLore"],
                    "blank",
                    ["display-text", function(){ return "The Pro Tree Progress: "+formatWhole(player.u.pro ? player.u.pro.points : 0)+" Pro Points"}],
                    ["bar","proProgress"],
                    "blank",
                    ["row", [["buyable",81],["buyable",82]]],
                    "blank",
                    ["raw-html", function(){ return transportButtonHTML("pro") }],
                ]
            },
            "dice": {
                content: [
                    ["infobox","diceLore"],
                    "blank",
                    ["display-text", function(){ return "The Dice Tree: "+formatWhole(player.u.dice ? player.u.dice.points : 0)+" Dice Rolled"}],
                    ["bar","diceProgress"],
                    "blank",
                    ["row", [["buyable",91],["buyable",92]]],
                    "blank",
                    ["raw-html", function(){ return transportButtonHTML("dice") }],
                ]
            },
            "ng": {
                content: [
                    ["infobox","ngLore"],
                    "blank",
                    ["display-text", function(){ return "PT: Rewritten NG+ Progress: "+formatWhole(player.u.ng ? player.u.ng.points : 0)+" NG Points"}],
                    ["bar","ngProgress"],
                    "blank",
                    ["row", [["buyable",101],["buyable",102]]],
                    "blank",
                    ["raw-html", function(){ return transportButtonHTML("ng") }],
                ]
            },
            "demo": {
                content: [
                    ["infobox","demoLore"],
                    "blank",
                    ["display-text", function(){ return "Demo Progress: "+formatWhole(player.u.demo ? player.u.demo.points : 0)+" Candies"}],
                    ["bar","demoProgress"],
                    "blank",
                    ["row", [["buyable",41],["buyable",42]]],
                    "blank",
                    ["raw-html", function(){ return transportButtonHTML("demo") }],
                ]
            },
            "incrementverse": {
                content: [
                    ["infobox","incrementLore"],
                    "blank",
                    ["display-text", function(){ return "Incrementreeverse Progress: "+formatWhole(player.u.incrementverse ? player.u.incrementverse.points : 0)+" Points"}],
                    ["bar","incrementProgress"],
                    "blank",
                    ["row", [["buyable",43],["buyable",44]]],
                    "blank",
                    ["raw-html", function(){ return transportButtonHTML("incrementverse") }],
                ]
            },
            "basic": {
                content: [
                    ["infobox","basicLore"],
                    "blank",
                    ["display-text", function(){ return "Basic Tree Progress: "+formatWhole(player.u.basic ? player.u.basic.points : 0)+" Points"}],
                    ["bar","basicProgress"],
                    "blank",
                    ["row", [["buyable",45],["buyable",46],["buyable",47]]],
                    "blank",
                    ["raw-html", function(){ return transportButtonHTML("basic") }],
                ]
            },
            "miletree": {
                content: [
                    ["infobox","miletreeLore"],
                    "blank",
                    ["display-text", function(){ return "Miletree Progress: "+formatWhole(player.u.miletree ? player.u.miletree.points : 0)+" Points"}],
                    ["bar","miletreeProgress"],
                    "blank",
                    ["row", [["buyable",51],["buyable",52]]],
                    "blank",
                    ["raw-html", function(){ return transportButtonHTML("miletree") }],
                ]
            },
            "galaxy": {
                content: [
                    ["infobox","galaxyLore"],
                    "blank",
                    ["display-text", function(){ return "Galaxy Progress: "+formatWhole(player.u.galaxy ? player.u.galaxy.points : 0)+" | Stars: "+formatWhole(player.u.galaxy ? player.u.galaxy.stars : 0)}],
                    ["bar","galaxyProgress"],
                    "blank",
                    ["row", [["buyable",111],["buyable",112]]],
                    "blank",
                    ["raw-html", function(){ return transportButtonHTML("galaxy") }],
                ]
            },
            "synergism": {
                content: [
                    ["infobox","synergismLore"],
                    "blank",
                    ["display-text", function(){ return "Synergism Progress: "+formatWhole(player.u.synergism ? player.u.synergism.points : 0)+" | Nodes: "+formatWhole(player.u.synergism ? player.u.synergism.nodes : 0)}],
                    ["bar","synergismProgress"],
                    "blank",
                    ["row", [["buyable",121],["buyable",122]]],
                    "blank",
                    ["raw-html", function(){ return transportButtonHTML("synergism") }],
                ]
            },
            "circuit": {
                content: [
                    ["infobox","circuitLore"],
                    "blank",
                    ["display-text", function(){ return "Circuit Progress: "+formatWhole(player.u.circuit ? player.u.circuit.points : 0)+" | Volts: "+formatWhole(player.u.circuit ? player.u.circuit.volts : 0)}],
                    ["bar","circuitProgress"],
                    "blank",
                    ["row", [["buyable",131],["buyable",132]]],
                    "blank",
                    ["raw-html", function(){ return transportButtonHTML("circuit") }],
                ]
            },
        },
    },
    tabFormat: {
        "Multiverse": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "resource-display",
                "blank",
                ["microtabs","universes"],
                "blank",
                ["bar","universeBar"],
            ],
        },
        "Upgrades & Core": {
            content: ["main-display","blank","upgrades","blank","buyables","blank",["display-text", function(){return "Multiverse Core boosts ALL universes."}],"blank",["bar","universeBar"]],
        },
        "Challenges": {
            content: ["main-display","blank","challenges","blank","milestones"],
        },
    },
    hotkeys: [{key: "u", description: "U: Reset for universe points", onPress(){if(canReset(this.layer)) doReset(this.layer)}}],
    doReset(resettingLayer){
        // Universe does not reset by lower layers
    },
})
