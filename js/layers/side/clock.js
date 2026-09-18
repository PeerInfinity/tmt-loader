'use strict';

//todo add buyMax to buyables
addLayer('clo', {
    name: 'Clock',
    symbol: '⏲',
    startData() {
        return {
            unlocked: true,
            use_advanced: false,
        };
    },
    layerShown() { return (inChallenge('b', 51) || hasChallenge('b', 51)) && !tmp[this.layer].deactivated; },
    deactivated() { return hasUpgrade('a', 24); },
    color: '#FFFFFF',
    row: 'side',
    resource: 'time',
    type: 'none',
    position: 1,
    tabFormat: {
        'Time Speed': {
            content: [
                ['display-text', () => `Base time speed: ${format(tmp.clo.time_speed)} seconds/s`],
                ['display-text', () => inChallenge('b', 51) ? '' : `<span class="warning">Time speed is lower for higher rows</span>`],
                'blank',
                () => {
                    if (inChallenge('b', 51)) {
                        return ['upgrades', [4]];
                    } else {
                        return ['upgrade-tree', [
                            [11, 12, 13],
                            [21, 22, 23],
                            [31, 32, 33],
                        ]];
                    }
                },
            ],
        },
        'Time Gears': {
            content: [
                ['display-text', () => `Base time speed: ${format(tmp.clo.time_speed)} seconds/s`],
                'blank',
                ['buyables', [1, 2, 3, 4, 5, 6]],
            ],
            unlocked() { return hasChallenge('b', 51); },
        },
    },
    upgrades: {
        11: {
            title: 'Experience connector',
            description() {
                if (!shiftDown) return 'Applies time speed to experience layer';

                let formula = 'time speed';

                return `Formula: ${formula}`;
            },
            effectDisplay() { return `*${format(layers.clo.time_speed('xp', true))}`; },
            price: [['slime_goo', D(32)], ['slime_core_shard', D(8)], ['slime_core', D.dOne]],
            costDisplay() { return `Cost: ${listFormat.format(this.price.map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`))}`; },
            canAfford() { return this.price.every(([item, cost]) => player.lo.items[item].amount.gte(cost)) && !inChallenge('b', 51); },
            pay() { this.price.forEach(([item, cost]) => gain_items(item, D.neg(cost))); },
            branches: [21, 22],
            style() {
                const style = {};
                if (hasUpgrade(this.layer, this.id)) style['background-color'] = tmp.xp.color;
                return style;
            },
            unlocked() { return hasChallenge('b', 51) && tmp.xp.layerShown; },
        },
        12: {
            title: 'Mining connector',
            description() {
                if (!shiftDown) return 'Applies time speed to mining layer';

                let formula = 'time speed';

                return `Formula: ${formula}`;
            },
            effectDisplay() { return `*${format(layers.clo.time_speed('m', true))}`; },
            price: [['stone', D(32)], ['copper_ore', D(8)], ['tin_ore', D.dOne]],
            costDisplay() { return `Cost: ${listFormat.format(this.price.map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`))}`; },
            canAfford() { return this.price.every(([item, cost]) => player.lo.items[item].amount.gte(cost)) && !inChallenge('b', 51); },
            pay() { this.price.forEach(([item, cost]) => gain_items(item, D.neg(cost))); },
            branches: [22],
            style() {
                const style = {};
                if (hasUpgrade(this.layer, this.id)) style['background-color'] = tmp.m.color;
                return style;
            },
            unlocked() { return hasChallenge('b', 51) && tmp.m.layerShown; },
        },
        13: {
            title() {
                if (!player.t.unlocked) return '??? connector';
                return 'Tree connector';
            },
            description() {
                if (!shiftDown) {
                    if (!player.t.unlocked) return 'Applies time speed to ??? layer';

                    return 'Applies time speed to tree layer';
                }

                let formula = 'time speed';

                return `Formula: ${formula}`;
            },
            effectDisplay() { return `*${format(layers.clo.time_speed('t', true))}`; },
            price: [['soaked_log', D(32)], ['normal_log', D(8)], ['plank', D.dOne]],
            costDisplay() { return `Cost: ${listFormat.format(this.price.map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`))}`; },
            canAfford() { return this.price.every(([item, cost]) => player.lo.items[item].amount.gte(cost)) && !inChallenge('b', 51); },
            pay() { this.price.forEach(([item, cost]) => gain_items(item, D.neg(cost))); },
            unlocked() { return hasChallenge('b', 51) && player.t.unlocked; },
            style() {
                const style = {};
                if (hasUpgrade(this.layer, this.id)) style['background-color'] = tmp.t.color;
                return style;
            },
            branches() { return [player.f.unlocked ? 23 : 22]; },
        },
        21: {
            title: 'Level connector',
            description() {
                if (!shiftDown) return 'Applies time speed to level layer';

                let formula = '2√(time speed)';

                return `Formula: ${formula}`;
            },
            effectDisplay() { return `*${format(layers.clo.time_speed('l', true))}`; },
            costDisplay() { return `Requires: ${formatWhole(5)} levels`; },
            canAfford() { return player.l.points.gte(5); },
            pay() { },
            branches: [31],
            style() {
                const style = {};
                if (hasUpgrade(this.layer, this.id)) style['background-color'] = tmp.l.color;
                return style;
            },
            unlocked() { return hasChallenge('b', 51) && tmp.l.layerShown; },
        },
        22: {
            title: 'Loot connector',
            description() {
                if (!shiftDown) return 'Applies time speed to loot layer';

                let formula = '2√(time speed)';

                return `Formula: ${formula}`;
            },
            effectDisplay() { return `*${format(layers.clo.time_speed('lo', true))}`; },
            price: [['slime_goo', D(32)], ['copper_ore', D(8)], ['rusty_gear', D.dOne]],
            costDisplay() { return `Cost: ${listFormat.format(this.price.map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`))}`; },
            canAfford() { return this.price.every(([item, cost]) => player.lo.items[item].amount.gte(cost)) && !inChallenge('b', 51); },
            pay() { this.price.forEach(([item, cost]) => gain_items(item, D.neg(cost))); },
            style() {
                const style = {};
                if (hasUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.color;
                return style;
            },
            unlocked() { return hasChallenge('b', 51) && tmp.lo.layerShown; },
            branches: [23, 32],
        },
        23: {
            title() {
                if (!player.f.unlocked) return '??? connector';
                return 'Forge connector';
            },
            description() {
                if (!shiftDown) {
                    if (!player.f.unlocked) return 'Applies time speed to ??? layer';

                    return 'Applies time speed to forge layer';
                }

                let formula = '2√(time speed)';

                return `Formula: ${formula}`;
            },
            effectDisplay() { return `*${format(layers.clo.time_speed('f', true))}`; },
            price: [['bronze_ingot', D(32)], ['steel_ingot', D(8)]],
            costDisplay() { return `Cost: ${listFormat.format(this.price.map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`))}`; },
            canAfford() { return this.price.every(([item, cost]) => player.lo.items[item].amount.gte(cost)) && !inChallenge('b', 51); },
            pay() { this.price.forEach(([item, cost]) => gain_items(item, D.neg(cost))); },
            style() {
                const style = {};
                if (hasUpgrade(this.layer, this.id)) style['background-color'] = tmp.f.color;
                return style;
            },
            unlocked() { return hasChallenge('b', 51) && player.f.unlocked; },
            branches: [22, 33],
        },
        31: {
            title: 'Boss connector',
            description() {
                if (!shiftDown) return 'Applies time speed to boss layer';

                let formula = '4√(time speed)';

                return `Formula: ${formula}`;
            },
            effectDisplay() { return `*${format(layers.clo.time_speed('b', true))}`; },
            costDisplay: 'Cost: Free!',
            canAfford() { return !inChallenge('b', 51); },
            pay() { },
            style() {
                const style = {};
                if (hasUpgrade(this.layer, this.id)) style['background-color'] = tmp.b.color;
                return style;
            },
            unlocked() { return hasChallenge('b', 51) && tmp.b.layerShown; },
        },
        32: {
            title() {
                if (!player.s.unlocked) return '??? connector';
                return 'Shop connector';
            },
            description() {
                if (!shiftDown) {
                    if (!player.s.unlocked) return 'Applies time speed to ??? layer';

                    return 'Applies time speed to level layer';
                }

                let formula = '4√(time speed)';

                return `Formula: ${formula}`;
            },
            effectDisplay() { return `*${format(layers.clo.time_speed('s', true))}`; },
            costDisplay() {
                if (!player.s.unlocked) return 'Cost: Unknown';

                return layers.s.coins.format(this.cost, false);
            },
            cost: D(100),
            canAfford() { return !inChallenge('b', 51) && player.s.points.gte(this.cost); },
            pay() { player.s.points = player.s.points.minus(this.cost); },
            unlocked() { return hasChallenge('b', 51) && tmp.s.layerShown; },
        },
        33: {
            title() {
                if (!tmp.a.layerShown) return '??? connector';

                return 'Alternator connector';
            },
            description() {
                if (!tmp.a.layerShown) {
                    if (!false) return 'Applies time speed to ??? layer';

                    return 'Applies time speed to alternator layer';
                }

                let formula = '4√(time speed)';

                return `Formula: ${formula}`;
            },
            effectDisplay() { return `*${format(layers.clo.time_speed('a', true))}`; },
            price: [['stardust', D(1)]],
            costDisplay() { return `Requires: ${listFormat.format(this.price.map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`))}`; },
            canAfford() { return this.price.every(([item, cost]) => player.lo.items[item].amount.gte(cost)) && !inChallenge('b', 51); },
            pay() { },
            style() {
                const style = {};
                if (hasUpgrade(this.layer, this.id)) {
                    style['background-image'] = tmp.a.nodeStyle['background-image'];
                    style['background-origin'] = tmp.a.nodeStyle['background-origin'];
                }
                return style;
            },
            unlocked() { return hasChallenge('b', 51) && tmp.a.layerShown; },
        },
        41: {
            title: 'Hour Hand',
            description: 'Missing piece of The Clock<br>Doubles time speed',
            effect() { return D.dTwo; },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(100),
            item: 'slime_goo',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
            unlocked() { return inChallenge('b', 51); },
        },
        42: {
            title: 'Minute Hand',
            description: 'Missing piece of The Clock<br>Doubles time speed',
            effect() { return D.dTwo; },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(50),
            item: 'copper_ore',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
            unlocked() { return inChallenge('b', 51); },
        },
        43: {
            title: 'Second Hand',
            description: 'Missing piece of The Clock<br>Doubles time speed',
            effect() { return D.dTwo; },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(10),
            item: 'rusty_gear',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
            unlocked() { return inChallenge('b', 51); },
        },
    },
    buyables: {
        // enemy
        11: {
            title: 'Slime Gear',
            display() {
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(getBuyableAmount(this.layer, this.id)),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} slime gears\
                    increase time speed by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    Cost: ${cost}`;
                } else {
                    let effect_formula = 'amount / 30',
                        cost_formula_goo = '(1.5 ^ amount) * 32',
                        cost_formula_shard = '(1.5 ^ amount) * 8',
                        cost_formula_core = '1.5 ^ amount';

                    const cost_list = [
                        `[${cost_formula_goo}] ${tmp.lo.items.slime_goo.name}`,
                        `[${cost_formula_shard}] ${tmp.lo.items.slime_core_shard.name}`,
                        `[${cost_formula_core}] ${tmp.lo.items.slime_core.name}`,
                    ];

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} slime gears\
                    increase time speed by [${effect_formula}]<br><br>\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                return {
                    slime_goo: D(1.5).pow(x).times(32),
                    slime_core_shard: D(1.5).pow(x).times(8),
                    slime_core: D(1.5).pow(x),
                };
            },
            effect(x) { return D.div(x, 30); },
            canAfford() {
                return Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => gain_items(item, D.neg(amount)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.xp.enemies['slime'].color;

                return style;
            },
            unlocked() { return hasChallenge('b', 51); },
        },
        12: {
            title: 'Goblin Gear',
            display() {
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(getBuyableAmount(this.layer, this.id)),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} goblin gears\
                    increase time speed by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    Cost: ${cost}`;
                } else {
                    let effect_formula = 'amount / 20',
                        cost_formula_fabric = '(1.5 ^ amount) * 32',
                        cost_formula_coin = '(1.5 ^ amount) * 8',
                        cost_formula_gear = '(1.5 ^ amount)';

                    const cost_list = [
                        `[${cost_formula_fabric}] ${tmp.lo.items.red_fabric.name}`,
                        `[${cost_formula_coin}] ${tmp.lo.items.pyrite_coin.name}`,
                        `[${cost_formula_gear}] ${tmp.lo.items.rusty_gear.name}`,
                    ];

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} goblin gears\
                        increase time speed by [${effect_formula}]<br><br>\
                        Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                return {
                    red_fabric: D(1.5).pow(x).times(32),
                    pyrite_coin: D(1.5).pow(x).times(8),
                    rusty_gear: D(1.5).pow(x),
                };
            },
            effect(x) { return D.div(x, 20); },
            canAfford() {
                return Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => gain_items(item, D.neg(amount)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.xp.enemies['goblin'].color;

                return style;
            },
            unlocked() { return hasChallenge('b', 51); },
        },
        13: {
            title: 'Zombie Gear',
            display() {
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(getBuyableAmount(this.layer, this.id)),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} zombie gears\
                    increase time speed by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    Cost: ${cost}`;
                } else {
                    let effect_formula = 'amount / 15',
                        cost_formula_flesh = '(1.5 ^ amount) * 32',
                        cost_formula_iron = '(1.5 ^ amount) * 8',
                        cost_formula_brain = '1.5 ^ amount';

                    if (player.clo.use_advanced) {
                        cost_formula_iron += ` / ${format(D.pow(upgradeEffect('f', 11)['iron_ingot'], -1))}`;
                    }

                    const cost_list = [
                        `[${cost_formula_flesh}] ${tmp.lo.items.rotten_flesh.name}`,
                        `[${cost_formula_iron}] ${tmp.lo.items.iron_ore.name}`,
                        `[${cost_formula_brain}] ${tmp.lo.items.brain.name}`,
                    ];

                    if (player.clo.use_advanced) {
                        cost_list[1] = `[${cost_formula_iron}] ${tmp.lo.items.iron_ingot.name}`;
                    }

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} zombie gears\
                    increase time speed by [${effect_formula}]<br><br>\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    rotten_flesh: D(1.5).pow(x).times(32),
                    iron_ore: D(1.5).pow(x).times(8),
                    brain: D(1.5).pow(x),
                };

                if (player.clo.use_advanced) {
                    cost['iron_ingot'] = cost['iron_ore'].times(upgradeEffect('f', 11)['iron_ingot']);
                    delete cost['iron_ore'];
                }

                return cost;
            },
            effect(x) { return D.div(x, 15); },
            canAfford() {
                return Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => gain_items(item, D.neg(amount)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.xp.enemies['zombie'].color;

                return style;
            },
            unlocked() { return hasChallenge('b', 51) && hasChallenge('b', 12); },
        },
        14: {
            title: 'Ent Gear',
            display() {
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(getBuyableAmount(this.layer, this.id)),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} ent gears\
                    increase time speed by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    Cost: ${cost}`;
                } else {
                    let effect_formula = 'amount / 15',
                        cost_formula_leaf = '(1.5 ^ amount) * 32',
                        cost_formula_log = '(1.5 ^ amount) * 8',
                        cost_formula_seed = '1.5 ^ amount';

                    const cost_list = [
                        `[${cost_formula_leaf}] ${tmp.lo.items.leaf.name}`,
                        `[${cost_formula_log}] ${tmp.lo.items.normal_log.name}`,
                        `[${cost_formula_seed}] ${tmp.lo.items.seed.name}`,
                    ];

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} ent gears\
                    increase time speed by [${effect_formula}]<br><br>\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    leaf: D(1.5).pow(x).times(32),
                    normal_log: D(1.5).pow(x).times(8),
                    seed: D(1.5).pow(x),
                };

                return cost;
            },
            effect(x) { return D.div(x, 15); },
            canAfford() {
                return Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => gain_items(item, D.neg(amount)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.xp.enemies['ent'].color;

                return style;
            },
            unlocked() { return hasChallenge('b', 51) && hasChallenge('b', 21); },
        },
        // mining
        21: {
            title: 'Stone Gear',
            display() {
                const anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>';
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(getBuyableAmount(this.layer, this.id)),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} stone gears\
                    increase time speed by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    ${anvil_req}\
                    Cost: ${cost}`;
                } else {
                    let effect_formula = 'amount / 20',
                        cost_formula = '(2 ^ amount) * 100';

                    if (player.clo.use_advanced) {
                        cost_formula += ` / ${format(D.pow(upgradeEffect('f', 11)['stone_brick'], -1))}`;
                    }

                    const cost_list = [
                        `[${cost_formula}] ${tmp.lo.items.stone.name}`,
                    ];

                    if (player.clo.use_advanced) {
                        cost_list[0] = `[${cost_formula}] ${tmp.lo.items.stone_brick.name}`;
                    }

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} stone gears\
                    increase time speed by [${effect_formula}]<br><br>\
                    ${anvil_req}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    stone: D(2).pow(x).times(100),
                };

                if (player.clo.use_advanced) {
                    cost['stone_brick'] = cost['stone'].times(upgradeEffect('f', 11)['stone_brick']);
                    delete cost['stone'];
                }

                return cost;
            },
            effect(x) { return D.div(x, 20); },
            canAfford() {
                return tmp.lo.items['*'].has_anvil && Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => gain_items(item, D.neg(amount)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.stone.style['background-color'];

                return style;
            },
            unlocked() { return hasChallenge('b', 51); },
        },
        22: {
            title: 'Crude Bronze Gear',
            display() {
                const anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>';
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(getBuyableAmount(this.layer, this.id)),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} crude bronze gears\
                    increase time speed by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    ${anvil_req}\
                    Cost: ${cost}`;
                } else {
                    let effect_formula = 'amount * 3 / 40',
                        cost_formula_copper = '(1.75 ^ amount) * 50',
                        cost_formula_tin = '(1.75 ^ amount) * 5';

                    if (player.clo.use_advanced) {
                        cost_formula_copper += ` / ${format(D.pow(upgradeEffect('f', 11)['copper_ingot'], -1))}`;
                        cost_formula_tin += ` / ${format(D.pow(upgradeEffect('f', 11)['tin_ingot'], -1))}`;
                    }

                    const cost_list = [
                        `[${cost_formula_copper}] ${tmp.lo.items.copper_ore.name}`,
                        `[${cost_formula_tin}] ${tmp.lo.items.tin_ore.name}`,
                    ];

                    if (player.clo.use_advanced) {
                        cost_list[0] = `[${cost_formula_copper}] ${tmp.lo.items.copper_ingot.name}`;
                        cost_list[1] = `[${cost_formula_tin}] ${tmp.lo.items.tin_ingot.name}`;
                    }

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} crude bronze gears\
                    increase time speed by [${effect_formula}]<br><br>\
                    ${anvil_req}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    copper_ore: D(1.75).pow(x).times(50),
                    tin_ore: D(1.75).pow(x).times(5),
                };

                if (player.clo.use_advanced) {
                    cost['copper_ingot'] = cost['copper_ore'].times(upgradeEffect('f', 11)['copper_ingot']);
                    delete cost['copper_ore'];
                    cost['tin_ingot'] = cost['tin_ore'].times(upgradeEffect('f', 11)['tin_ingot']);
                    delete cost['tin_ore'];
                }

                return cost;
            },
            effect(x) { return D.times(x, 3).div(40); },
            canAfford() {
                return tmp.lo.items['*'].has_anvil && Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => gain_items(item, D.neg(amount)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = '#C4995E';

                return style;
            },
            unlocked() { return hasChallenge('b', 51); },
        },
        // shop
        31: {
            title: 'Money Gear',
            display() {
                if (!shiftDown) {
                    /** @type {Decimal} */
                    const cost = this.cost(getBuyableAmount(this.layer, this.id));

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} money gears\
                    increase time speed by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    Cost: ${layers.s.coins.format(cost, false)}`;
                } else {
                    let effect_formula = 'amount / 15',
                        cost_formula = '(2 ^ amount) * 100';

                    const cost_list = [
                        `[${cost_formula}] copper coins`,
                    ];

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} money gears\
                    increase time speed by [${effect_formula}]<br><br>\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) { return D.dTwo.pow(x).times(100); },
            effect(x) { return D.div(x, 15); },
            canAfford() { return this.cost(getBuyableAmount(this.layer, this.id)).lte(player.s.points); },
            buy() {
                player.s.points = player.s.points.minus(this.cost(getBuyableAmount(this.layer, this.id)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = layers.s.color;

                return style;
            },
            unlocked() { return player.s.unlocked; },
        },
        // deep mining
        41: {
            title: 'Iron Gear',
            display() {
                const anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>';
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(getBuyableAmount(this.layer, this.id)),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} iron gears\
                    increase time speed by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    ${anvil_req}\
                    Cost: ${cost}`;
                } else {
                    let effect_formula = 'amount / 10',
                        cost_formula = '(2 ^ amount) * 25';

                    if (player.clo.use_advanced) {
                        cost_formula += ` / ${format(D.pow(upgradeEffect('f', 11)['iron_ingot'], -1))}`;
                    }

                    const cost_list = [
                        `[${cost_formula}] ${tmp.lo.items.iron_ore.name}`,
                    ];

                    if (player.clo.use_advanced) {
                        cost_list[0] = `[${cost_formula}] ${tmp.lo.items.iron_ingot.name}`;
                    }

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} iron gears\
                    increase time speed by [${effect_formula}]<br><br>\
                    ${anvil_req}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    iron_ore: D(2).pow(x).times(25),
                };

                if (player.clo.use_advanced) {
                    cost['iron_ingot'] = cost['iron_ore'].times(upgradeEffect('f', 11)['iron_ingot']);
                    delete cost['iron_ore'];
                }

                return cost;
            },
            effect(x) { return D.div(x, 10); },
            canAfford() {
                return tmp.lo.items['*'].has_anvil && Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => gain_items(item, D.neg(amount)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = '#888888';

                return style;
            },
            unlocked() { return hasChallenge('b', 51) && hasChallenge('b', 12); },
        },
        42: {
            title: 'Gold Gear',
            display() {
                const anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>';
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(getBuyableAmount(this.layer, this.id)),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} gold gears\
                    increase time speed by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    ${anvil_req}\
                    Cost: ${cost}`;
                } else {
                    let effect_formula = 'amount / 20',
                        cost_formula = '(3 ^ amount) * 5';

                    if (player.clo.use_advanced) {
                        cost_formula += ` / ${format(D.pow(upgradeEffect('f', 11)['gold_ingot'], -1))}`;
                    }

                    const cost_list = [
                        `[${cost_formula}] ${tmp.lo.items.gold_ore.name}`,
                    ];

                    if (player.clo.use_advanced) {
                        cost_list[0] = `[${cost_formula}] ${tmp.lo.items.gold_ingot.name}`;
                    }

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} gold gears\
                    increase time speed by [${effect_formula}]<br><br>\
                    ${anvil_req}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    gold_ore: D(3).pow(x).times(5),
                };

                if (player.clo.use_advanced) {
                    cost['gold_ingot'] = cost['gold_ore'].times(upgradeEffect('f', 11)['gold_ingot']);
                    delete cost['gold_ore'];
                }

                return cost;
            },
            effect(x) { return D.div(x, 20); },
            canAfford() {
                return tmp.lo.items['*'].has_anvil && Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => gain_items(item, D.neg(amount)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = 'gold';

                return style;
            },
            unlocked() { return hasChallenge('b', 51) && player.m.show_deep; },
        },
        // tree
        51: {
            title: 'Wooden Gear',
            display() {
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(getBuyableAmount(this.layer, this.id)),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} wooden gears\
                    increase time speed by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    Cost: ${cost}`;
                } else {
                    let effect_formula = 'amount / 20',
                        cost_formula_soaked = '(1.5 ^ amount) * 32',
                        cost_formula_normal = '(1.5 ^ amount) * 8',
                        cost_formula_plank = '1.5 ^ amount';

                    const cost_list = [
                        `[${cost_formula_soaked}] ${tmp.lo.items.soaked_log.name}`,
                        `[${cost_formula_normal}] ${tmp.lo.items.normal_log.name}`,
                        `[${cost_formula_plank}] ${tmp.lo.items.plank.name}`,
                    ];

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} wooden gears\
                    increase time speed by [${effect_formula}]<br><br>\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                return {
                    soaked_log: D(1.5).pow(x).times(32),
                    normal_log: D(1.5).pow(x).times(8),
                    plank: D(1.5).pow(x),
                };
            },
            effect(x) { return D.div(x, 20); },
            canAfford() {
                return Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => gain_items(item, D.neg(amount)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = layers.t.color;

                return style;
            },
            unlocked() { return hasChallenge('b', 51) && tmp.t.layerShown; },
        },
        // forge
        61: {
            title: 'Bronze Gear',
            display() {
                const anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>',
                    heat_req = `<span ${D.gt(player.f.points, this.heat) ? '' : 'style="color:#CC3333;'}">Requires ${format(this.heat)} heat</span><br>`;
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(getBuyableAmount(this.layer, this.id)),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} bronze gears\
                    increase time speed by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    ${anvil_req}\
                    ${heat_req}\
                    Cost: ${cost}`;
                } else {
                    let effect_formula = 'amount / 9',
                        cost_formula = '(3 ^ amount) * 30';

                    const cost_list = [
                        `[${cost_formula}] ${tmp.lo.items.bronze_ingot.name}`,
                    ];

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} bronze gears\
                    increase time speed by [${effect_formula}]<br><br>\
                    ${anvil_req}\
                    ${heat_req}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            heat: D(1000),
            cost(x) {
                const cost = {
                    bronze_ingot: D(3).pow(x).times(30),
                };

                return cost;
            },
            effect(x) { return D.div(x, 9); },
            canAfford() {
                return tmp.lo.items['*'].has_anvil && D.gt(player.f.points, this.heat) && Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => gain_items(item, D.neg(amount)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.bronze_ingot.style['background-color'];

                return style;
            },
            unlocked() { return hasChallenge('b', 51) && player.f.alloys; },
        },
        62: {
            title: 'Steel Gear',
            display() {
                const anvil_req = tmp.lo.items['*'].has_anvil ? '' : '<span style="color:#CC3333;">Requires an anvil</span><br>',
                    heat_req = `<span ${D.gt(player.f.points, this.heat) ? '' : 'style="color:#CC3333;'}">Requires ${format(this.heat)} heat</span><br>`;
                if (!shiftDown) {
                    /** @type {{[item: string]: Decimal}} */
                    const cost_obj = this.cost(getBuyableAmount(this.layer, this.id)),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} steel gears\
                    increase time speed by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    ${anvil_req}\
                    ${heat_req}\
                    Cost: ${cost}`;
                } else {
                    let effect_formula = 'amount / 9',
                        cost_formula = '(5 ^ amount) * 50';

                    const cost_list = [
                        `[${cost_formula}] ${tmp.lo.items.steel_ingot.name}`,
                    ];

                    return `Your ${formatWhole(getBuyableAmount(this.layer, this.id))} steel gears\
                    increase time speed by [${effect_formula}]<br><br>\
                    ${anvil_req}\
                    ${heat_req}\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            heat: D(2000),
            cost(x) {
                const cost = {
                    steel_ingot: D(5).pow(x).times(50),
                };

                return cost;
            },
            effect(x) { return D.div(x, 9); },
            canAfford() {
                return tmp.lo.items['*'].has_anvil && D.gt(player.f.points, this.heat) && Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(this.cost(getBuyableAmount(this.layer, this.id)))
                    .forEach(([item, amount]) => gain_items(item, D.neg(amount)));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.steel_ingot.style['background-color'];

                return style;
            },
            unlocked() { return hasChallenge('b', 51) && player.f.alloys; },
        },
    },
    tooltip() { return `Time speed: *${format(tmp.clo.time_speed)}`; },
    time_speed(layer, visual = false) {
        if (!inChallenge('b', 51) && !hasChallenge('b', 51) || tmp[this.layer].deactivated) return D.dOne;

        let speed = D.dOne;

        if (inChallenge('b', 51)) {
            speed = speed.div(8);

            if (hasUpgrade('clo', 41)) speed = speed.times(upgradeEffect('clo', 41));
            if (hasUpgrade('clo', 42)) speed = speed.times(upgradeEffect('clo', 42));
            if (hasUpgrade('clo', 43)) speed = speed.times(upgradeEffect('clo', 43));
        }

        if (visual || layer || (!visual && !layer)) {
            let allow = true;

            // Check whether we can actually speed up the layer
            if (layer && !visual) {
                const links = {
                    'xp': 11, 'm': 12, 't': 13,
                    'l': 21, 'lo': 22, 'f': 23,
                    'b': 31, 's': 32, 'a': 33,

                    'xp_alt': 11, 'c': 12, 'p': 13,
                    'to': 21, 'k': 22, 'fr': 23,
                    //'bl': 31, 'v': 32, 'sp': 33, 'yy': 33,
                };

                allow = layer in links && hasUpgrade(this.layer, links[layer]);
            }

            // Add speed from buyables
            if (allow) {
                speed = speed.add(buyableEffect('clo', 11));
                speed = speed.add(buyableEffect('clo', 12));
                speed = speed.add(buyableEffect('clo', 13));
                speed = speed.add(buyableEffect('clo', 14));
                speed = speed.add(buyableEffect('clo', 21));
                speed = speed.add(buyableEffect('clo', 22));
                speed = speed.add(buyableEffect('clo', 31));
                speed = speed.add(buyableEffect('clo', 41));
                speed = speed.add(buyableEffect('clo', 42));
                speed = speed.add(buyableEffect('clo', 51));
            }

            // Root as per row and alt
            if (layer) {
                let row = tmp[layer]?.displayRow ?? tmp[layer]?.row ?? 0;
                if (row == 'side') row = 0;

                speed = speed.root(D.dTwo.pow(row));

                const alt = [
                    'xp_alt', 'c', 'p',
                    'to', 'k', 'fr',
                    //'bl', 'v', 'sp', 'yy',
                ];

                if (alt.includes(layer)) speed = speed.pow(tmp.a.change_efficiency);
            }
        }

        const alt = [
            'xp_alt', 'c', 'p',
            'to', 'k', 'fr',
            //'bl', 'v', 'sp', 'yy',
        ];

        if (alt.includes(layer)) speed = speed.pow(tmp.a.change_efficiency);

        return speed;
    },
    componentStyles: {
        'buyable': {
            height: '150px',
            width: '150px',
        }
    },
});
