'use strict';

addLayer('to', {
    name: 'Tower',
    symbol: 'T',
    startData() {
        return {
            unlocked: false,
            points: D.dZero,
            random: randomize_tower_materials(),
        };
    },
    layerShown() { return player.to.unlocked && !tmp[this.layer].deactivated; },
    deactivated() { return inChallenge('b', 31); },
    effect() {
        if (tmp.to.deactivated) return D.dOne;
        return D.add(player.to.points, 2).log2();
    },
    effectDescription() { return `multiplying XP cap by ${shiftDown ? '[log2(floors + 2)]' : format(tmp.to.effect)}`; },
    tooltip() {
        return `${formatWhole(player.to.points)} floors<br>\
        ${formatWhole(layerBuyableAmount('to'))} materials`;
    },
    color: '#996644',
    row: 1,
    position: 0.5,
    resource: 'floors',
    hotkeys: [
        {
            key: 'f',
            description: 'F: Reset for floors',
            unlocked() { return player.to.unlocked; },
            onPress() { doReset('to'); },
        },
        {
            key: 't',
            description: 'T: Display floors layer',
            unlocked() { return player.to.unlocked; },
            onPress() { showTab('to'); },
        },
    ],
    tabFormat: {
        'Floors': {
            content: [
                'main-display',
                'prestige-button',
                'blank',
                'milestones',
            ],
        },
        'Materials': {
            content: [
                'main-display',
                'prestige-button',
                'blank',
                'buyables',
            ],
        },
    },
    milestones: {
        1: {
            requirementDescription: 'Layering: Build a floor',
            effect() { return D.root(player.to.points, 2).floor(); },
            effectDescription() {
                const effect = shiftDown ? '[2√(floors)]' : formatWhole(tmp[this.layer].milestones[this.id].effect);
                return `Increase city size by ${effect} layers`;
            },
            done() { return player.to.points.gte(1); },
        },
        2: {
            requirementDescription: 'Hatchery: Build 2 floors',
            effect() { return D.pow(1.1, player.to.points); },
            effectDescription() {
                const effect = shiftDown ? '[1.1 ^ floors]' : format(tmp[this.layer].milestones[this.id].effect);
                return `Multiply taming progress gain by ${effect}<br>\
                    Unlock zombies`;
            },
            done() { return player.to.points.gte(2); },
        },
        3: {
            requirementDescription: 'Engineering: Build 3 floors',
            effectDescription() {
                const effect = shiftDown ? '[log10(science + 10)]' : format(tmp[this.layer].milestones[this.id].effect);
                return `Unlock more tower materials<br>\
                    Unlock the ability to build smelters<br>\
                    Science divides materials costs by ${effect}<br>\
                    Keep this milestone`;
            },
            effect() { return player.c.resources.science.amount.add(10).log10(); },
            done() { return player.to.points.gte(3); },
        },
        4: {
            requirementDescription: 'Planetarium: Build 4 floors',
            effect() { return D.add(player.to.points, 2).log2(); },
            effectDescription() {
                const effect = shiftDown ? '[log2(floors + 2)]' : format(tmp[this.layer].milestones[this.id].effect);
                return `Multiply star time by ${effect}`;
            },
            done() { return player.to.points.gte(4); },
        },
        5: {
            requirementDescription: 'Greenhouse: Build 5 floors',
            effect() { return D.pow(1.25, player.to.points); },
            effectDescription() {
                const effect = shiftDown ? '[1.25 ^ floors]' : format(tmp[this.layer].milestones[this.id].effect);
                return `Multiply harvest yield by ${effect}`;
            },
            done() { return player.to.points.gte(5); },
        },
        6: {
            requirementDescription: 'Dowsing Rod: Build 6 floors',
            effectDescription: 'Unlock the ability to build wells',
            done() { return player.to.points.gte(6); },
        },
        7: {
            requirementDescription: 'Advanced Engineering: Build 7 floors',
            effectDescription: `Unlock more tower materials<br>\
                Smelters can smelt iron and gold<br>\
                Unlock the ability to build arc furnaces<br>\
                Keep this milestone`,
            done() { return player.to.points.gte(7); },
        },
    },
    buyables: {
        // Random
        11: {
            title() { return `${formatWhole(getBuyableAmount(this.layer, this.id))} ${capitalize_words(tmp.lo.items[player.to.random[0]].name)} Block`; },
            display() {
                const item = player.to.random[0];

                let cost = '';
                if (shiftDown) {
                    const entry = tmp.to.materials.low[item];
                    cost = `[${format(entry.base)} * ${format(entry.exp)} ^ amount]`;
                } else {
                    cost = `${format(player.lo.items[item].amount)}/${format(tmp[this.layer].buyables[this.id].cost)} ${tmp.lo.items[item].name}`;
                }

                return `Cost: ${cost}`;
            },
            cost() {
                const item = player.to.random[0],
                    entry = tmp.to.materials.low[item];
                if (!entry) return;

                let cost = D.pow(entry.exp, getBuyableAmount(this.layer, this.id)).times(entry.base);

                cost = cost.times(tmp.to.materials.cost_mult);

                return cost;
            },
            canAfford() {
                const item = player.to.random[0];

                return D.gte(player.lo.items[item].amount, tmp[this.layer].buyables[this.id].cost);
            },
            buy() {
                const item = player.to.random[0];

                gain_items(item, tmp[this.layer].buyables[this.id].cost.neg());
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const item = player.to.random[0],
                    style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items[item].style['background-color'];

                return style;
            },
        },
        12: {
            title() { return `${formatWhole(getBuyableAmount(this.layer, this.id))} ${capitalize_words(tmp.lo.items[player.to.random[1]].name)} Block`; },
            display() {
                const item = player.to.random[1];

                let cost = '';
                if (shiftDown) {
                    const entry = tmp.to.materials.medium[item];
                    cost = `[${format(entry.base)} * ${format(entry.exp)} ^ amount]`;
                } else {
                    cost = `${format(player.lo.items[item].amount)}/${format(tmp[this.layer].buyables[this.id].cost)} ${tmp.lo.items[item].name}`;
                }

                return `Cost: ${cost}`;
            },
            cost() {
                const item = player.to.random[1],
                    entry = tmp.to.materials.medium[item];
                if (!entry) return;

                let cost = D.pow(entry.exp, getBuyableAmount(this.layer, this.id)).times(entry.base);

                cost = cost.times(tmp.to.materials.cost_mult);

                return cost;
            },
            canAfford() {
                const item = player.to.random[1];

                return D.gte(player.lo.items[item].amount, tmp[this.layer].buyables[this.id].cost);
            },
            buy() {
                const item = player.to.random[1];

                gain_items(item, tmp[this.layer].buyables[this.id].cost.neg());
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const item = player.to.random[1],
                    style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items[item].style['background-color'];

                return style;
            },
            unlocked() { return hasMilestone('to', 3); },
        },
        13: {
            title() { return `${formatWhole(getBuyableAmount(this.layer, this.id))} ${capitalize_words(tmp.lo.items[player.to.random[2]].name)} Block`; },
            display() {
                const item = player.to.random[2];

                let cost = '';
                if (shiftDown) {
                    const entry = tmp.to.materials.high[item];
                    cost = `[${format(entry.base)} * ${format(entry.exp)} ^ amount]`;
                } else {
                    cost = `${format(player.lo.items[item].amount)}/${format(tmp[this.layer].buyables[this.id].cost)} ${tmp.lo.items[item].name}`;
                }

                return `Cost: ${cost}`;
            },
            cost() {
                const item = player.to.random[2],
                    entry = tmp.to.materials.high[item];
                if (!entry) return;

                let cost = D.pow(entry.exp, getBuyableAmount(this.layer, this.id)).times(entry.base);

                cost = cost.times(tmp.to.materials.cost_mult);

                return cost;
            },
            canAfford() {
                const item = player.to.random[2];

                return D.gte(player.lo.items[item].amount, tmp[this.layer].buyables[this.id].cost);
            },
            buy() {
                const item = player.to.random[2];

                gain_items(item, tmp[this.layer].buyables[this.id].cost.neg());
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const item = player.to.random[2],
                    style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items[item].style['background-color'];

                return style;
            },
            unlocked() { return hasMilestone('to', 7); },
        },
        // Basic Materials
        21: {
            title() { return `${formatWhole(getBuyableAmount(this.layer, this.id))} Stone Block`; },
            display() {
                let cost = '';

                if (shiftDown) {
                    cost = '[75 * 1.5 ^ amount]';
                } else {
                    cost = `${format(player.lo.items.stone.amount)}/${format(tmp[this.layer].buyables[this.id].cost)} ${tmp.lo.items.stone.name}`;
                }

                return `Cost: ${cost}`;
            },
            cost() {
                let cost = D.pow(1.5, getBuyableAmount(this.layer, this.id)).times(75);

                cost = cost.times(tmp.to.materials.cost_mult);

                return cost;
            },
            canAfford() { return D.gte(player.lo.items.stone.amount, tmp[this.layer].buyables[this.id].cost); },
            buy() {
                gain_items('stone', tmp[this.layer].buyables[this.id].cost.neg());
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.stone.style['background-color'];

                return style;
            },
        },
        22: {
            title() { return `${formatWhole(getBuyableAmount(this.layer, this.id))} Plank Block`; },
            display() {
                let cost = '';

                if (shiftDown) {
                    cost = '[75 * 1.5 ^ amount]';
                } else {
                    cost = `${format(player.lo.items.plank.amount)}/${format(tmp[this.layer].buyables[this.id].cost)} ${tmp.lo.items.plank.name}`;
                }

                return `Cost: ${cost}`;
            },
            cost() {
                let cost = D.pow(1.5, getBuyableAmount(this.layer, this.id)).times(75);

                cost = cost.times(tmp.to.materials.cost_mult);

                return cost;
            },
            canAfford() { return D.gte(player.lo.items.plank.amount, tmp[this.layer].buyables[this.id].cost); },
            buy() {
                gain_items('plank', tmp[this.layer].buyables[this.id].cost.neg());
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.plank.style['background-color'];

                return style;
            },
        },
        23: {
            title() { return `${formatWhole(getBuyableAmount(this.layer, this.id))} Copper Ore Block`; },
            display() {
                let cost = '';

                if (shiftDown) {
                    cost = '[25 * 1.5 ^ amount]';
                } else {
                    cost = `${format(player.lo.items.copper_ore.amount)}/${format(tmp[this.layer].buyables[this.id].cost)} ${tmp.lo.items.copper_ore.name}`;
                }

                return `Cost: ${cost}`;
            },
            cost() {
                let cost = D.pow(1.5, getBuyableAmount(this.layer, this.id)).times(25);

                cost = cost.times(tmp.to.materials.cost_mult);

                return cost;
            },
            canAfford() { return D.gte(player.lo.items.copper_ore.amount, tmp[this.layer].buyables[this.id].cost); },
            buy() {
                gain_items('copper_ore', tmp[this.layer].buyables[this.id].cost.neg());
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.copper_ore.style['background-color'];

                return style;
            },
        },
        // Decent Materials
        31: {
            title() { return `${formatWhole(getBuyableAmount(this.layer, this.id))} Stone Brick Block`; },
            display() {
                let cost = '';

                if (shiftDown) {
                    cost = '[75 * 1.5 ^ amount]';
                } else {
                    cost = `${format(player.lo.items.stone_brick.amount)}/${format(tmp[this.layer].buyables[this.id].cost)} ${tmp.lo.items.stone_brick.name}`;
                }

                return `Cost: ${cost}`;
            },
            cost() {
                let cost = D.pow(1.5, getBuyableAmount(this.layer, this.id)).times(75);

                cost = cost.times(tmp.to.materials.cost_mult);

                return cost;
            },
            canAfford() { return D.gte(player.lo.items.stone_brick.amount, tmp[this.layer].buyables[this.id].cost); },
            buy() {
                gain_items('stone_brick', tmp[this.layer].buyables[this.id].cost.neg());
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.stone_brick.style['background-color'];

                return style;
            },
            unlocked() { return hasMilestone('to', 3); },
        },
        32: {
            title() { return `${formatWhole(getBuyableAmount(this.layer, this.id))} Copper Ingot Block`; },
            display() {
                let cost = '';

                if (shiftDown) {
                    cost = '[75 * 1.5 ^ amount]';
                } else {
                    cost = `${format(player.lo.items.copper_ingot.amount)}/${format(tmp[this.layer].buyables[this.id].cost)} ${tmp.lo.items.copper_ingot.name}`;
                }

                return `Cost: ${cost}`;
            },
            cost() {
                let cost = D.pow(1.5, getBuyableAmount(this.layer, this.id)).times(75);

                cost = cost.times(tmp.to.materials.cost_mult);

                return cost;
            },
            canAfford() { return D.gte(player.lo.items.copper_ingot.amount, tmp[this.layer].buyables[this.id].cost); },
            buy() {
                gain_items('copper_ingot', tmp[this.layer].buyables[this.id].cost.neg());
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.copper_ingot.style['background-color'];

                return style;
            },
            unlocked() { return hasMilestone('to', 3); },
        },
        33: {
            title() { return `${formatWhole(getBuyableAmount(this.layer, this.id))} Iron Ore Block`; },
            display() {
                let cost = '';

                if (shiftDown) {
                    cost = '[50 * 1.25 ^ amount]';
                } else {
                    cost = `${format(player.lo.items.iron_ore.amount)}/${format(tmp[this.layer].buyables[this.id].cost)} ${tmp.lo.items.iron_ore.name}`;
                }

                return `Cost: ${cost}`;
            },
            cost() {
                let cost = D.pow(1.25, getBuyableAmount(this.layer, this.id)).times(50);

                cost = cost.times(tmp.to.materials.cost_mult);

                return cost;
            },
            canAfford() { return D.gte(player.lo.items.iron_ore.amount, tmp[this.layer].buyables[this.id].cost); },
            buy() {
                gain_items('iron_ore', tmp[this.layer].buyables[this.id].cost.neg());
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.iron_ore.style['background-color'];

                return style;
            },
            unlocked() { return hasMilestone('to', 3); },
        },
        // Great Materials
        41: {
            title() { return `${formatWhole(getBuyableAmount(this.layer, this.id))} Iron Ingot Block`; },
            display() {
                let cost = '';

                if (shiftDown) {
                    cost = '[50 * 1.25 ^ amount]';
                } else {
                    cost = `${format(player.lo.items.iron_ingot.amount)}/${format(tmp[this.layer].buyables[this.id].cost)} ${tmp.lo.items.iron_ingot.name}`;
                }

                return `Cost: ${cost}`;
            },
            cost() {
                let cost = D.pow(1.25, getBuyableAmount(this.layer, this.id)).pow_base(2).times(50);

                cost = cost.times(tmp.to.materials.cost_mult);

                return cost;
            },
            canAfford() { return D.gte(player.lo.items.iron_ingot.amount, tmp[this.layer].buyables[this.id].cost); },
            buy() {
                gain_items('iron_ingot', tmp[this.layer].buyables[this.id].cost.neg());
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.iron_ingot.style['background-color'];

                return style;
            },
            unlocked() { return hasMilestone('to', 7); },
        },
        42: {
            title() { return `${formatWhole(getBuyableAmount(this.layer, this.id))} Bronze Ingot Block`; },
            display() {
                let cost = '';

                if (shiftDown) {
                    cost = '[5 * 1.25 ^ amount]';
                } else {
                    cost = `${format(player.lo.items.bronze_ingot.amount)}/${format(tmp[this.layer].buyables[this.id].cost)} ${tmp.lo.items.bronze_ingot.name}`;
                }

                return `Cost: ${cost}`;
            },
            cost() {
                let cost = D.pow(1.25, getBuyableAmount(this.layer, this.id)).times(5);

                cost = cost.times(tmp.to.materials.cost_mult);

                return cost;
            },
            canAfford() { return D.gte(player.lo.items.bronze_ingot.amount, tmp[this.layer].buyables[this.id].cost); },
            buy() {
                gain_items('bronze_ingot', tmp[this.layer].buyables[this.id].cost.neg());
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.bronze_ingot.style['background-color'];

                return style;
            },
            unlocked() { return hasMilestone('to', 7); },
        },
        43: {
            title() { return `${formatWhole(getBuyableAmount(this.layer, this.id))} Steel Ingot Block`; },
            display() {
                let cost = '';

                if (shiftDown) {
                    cost = '[25 * 1.25 ^ amount]';
                } else {
                    cost = `${format(player.lo.items.steel_ingot.amount)}/${format(tmp[this.layer].buyables[this.id].cost)} ${tmp.lo.items.steel_ingot.name}`;
                }

                return `Cost: ${cost}`;
            },
            cost() {
                let cost = D.pow(1.25, getBuyableAmount(this.layer, this.id)).times(25);

                cost = cost.times(tmp.to.materials.cost_mult);

                return cost;
            },
            canAfford() { return D.gte(player.lo.items.steel_ingot.amount, tmp[this.layer].buyables[this.id].cost); },
            buy() {
                gain_items('steel_ingot', tmp[this.layer].buyables[this.id].cost.neg());
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.steel_ingot.style['background-color'];

                return style;
            },
            unlocked() { return hasMilestone('to', 7); },
        },
    },
    materials: {
        cost_mult() {
            let mult = D.dOne;

            if (hasMilestone('to', 3)) mult = mult.div(tmp.to.milestones[3].effect);

            mult = mult.times(tmp.con.condiments['*'].total.to.material_cost ?? D.dOne);

            return mult;
        },
        low() {
            const low = {
                'slime_goo': {
                    base: 100,
                    exp: 2,
                },
                'red_fabric': {
                    base: 100,
                    exp: 1.75,
                },
                'normal_log': {
                    base: 100,
                    exp: 2,
                },
                'wheat': {
                    base: 100,
                    exp: 1.5,
                },
            };

            if (tmp.xp_alt?.monsters.zombie.unlocked) low['rotten_flesh'] = {
                base: 100,
                exp: 1.5,
            }

            if (player?.fr?.unlocked) low['ice'] = {
                base: 10,
                exp: 2,
            };

            return low;
        },
        medium() {
            const medium = {
                'slime_core_shard': {
                    base: 50,
                    exp: 2,
                },
                'pyrite_coin': {
                    base: 50,
                    exp: 1.75,
                },
                'corn': {
                    base: 50,
                    exp: 1.5,
                },
            };

            if (player?.fr?.unlocked) {
                medium['icestone'] = {
                    base: 10,
                    exp: 1.75,
                };
                medium['rust_ingot'] = {
                    base: 10,
                    exp: 1.5,
                };
            }

            return medium;
        },
        high() {
            const high = {
                'slime_core': {
                    base: 5,
                    exp: 2,
                },
                'rusty_gear': {
                    base: 5,
                    exp: 1.75,
                },
                'coal': {
                    base: 50,
                    exp: 2,
                },
                'eggplant': {
                    base: 25,
                    exp: 1.5,
                },
            };

            if (tmp.xp_alt?.monsters.zombie.unlocked) high['brain'] = {
                base: 5,
                exp: 1.5,
            }

            return high;
        },
    },
    baseResource: 'building materials',
    baseAmount() { return layerBuyableAmount('to'); },
    type: 'custom',
    getResetGain() {
        if (D.eq(0, tmp.to.gainMult)) return D.dZero;

        let start = D.div(12.5, tmp.to.gainMult),
            ratio = D(2);

        let max_gain = D.affordGeometricSeries(tmp.to.baseAmount, start, ratio, player.to.points);

        if (!tmp.to.canBuyMax) max_gain = max_gain.min(1);

        return max_gain;
    },
    getNextAt(canMax) {
        if (D.eq(0, tmp.to.gainMult)) return D.dInf;

        let start = D.div(12.5, tmp.to.gainMult),
            ratio = D(2);

        if (!canMax) {
            return player.to.points.pow_base(ratio).times(start);
        } else {
            return tmp.to.baseAmount.div(start).log(ratio).floor().add(1).pow(ratio).times(start);
        }
    },
    canReset() { return getResetGain('to').gte(1); },
    prestigeButtonText() {
        return `Reset for +<b>${formatWhole(getResetGain('to'))}</b> floors<br><br>\
        Next: ${formatWhole(tmp.to.baseAmount)} / ${formatWhole(getNextAt('to'))} ${tmp.to.baseResource}`;
    },
    branches: ['xp_alt'],
    doReset(layer) {
        if (layer == 'to') {
            Object.keys(tmp.to.buyables)
                .filter(id => !['layer', 'rows', 'cols'].includes(id))
                .forEach(id => setBuyableAmount('to', id, D.dZero));
            player.to.random = randomize_tower_materials();
        } else if (tmp[layer].row > this.row) {
            const milestones = [];
            if (hasMilestone('to', 3)) milestones.push(3);
            if (hasMilestone('to', 7)) milestones.push(7);

            layerDataReset(this.layer);

            player.to.milestones.push(...milestones);
        }
    },
    prestigeNotify() { return canReset('to') || canAffordLayerBuyable('to'); },
    gainMult() {
        let mult = D.dOne;

        if (tmp.bin.layerShown) mult = mult.times(tmp.bin.cards.multipliers['to'] ?? 1);

        mult = mult.times(tmp.k.dishes.popsicle.effect);

        mult = mult.times(tmp.con.condiments['*'].total.to.floor_cost ?? D.dOne);

        return mult;
    },
});
