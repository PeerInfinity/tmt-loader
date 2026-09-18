'use strict';

addLayer('fr', {
    name: 'Freezer',
    symbol: 'F',
    startData() {
        return {
            points: D.dZero,
            unlocked: false,
            recipes: Object.fromEntries(
                Object.keys(layers.fr.recipes)
                    .map(recipe => [recipe, {
                        amount_freezing: D.dZero,
                        amount_target: D.dZero,
                        progress: D.dZero,
                        auto: false,
                    }])
            )
        };
    },
    color() {
        /** @type {[DecimalSource, [number, number, number]][]} */
        const color_points = [
            [1, [0xCC, 0xCC, 0xCC]],
            ['1e10', [0x00, 0xCC, 0xFF]],
            ['1e20', [0x00, 0xAA, 0xFF]],
            ['1e30', [0x00, 0x88, 0xFF]],
            ['1e40', [0x00, 0x66, 0xFF]],
            ['1e50', [0x00, 0x44, 0xFF]],
        ],
            i = color_points.findIndex(([n]) => D.gte(n, player.fr.points.max(0)));

        if (i == color_points.length - 1 || i == 0) {
            return `#${color_points[i][1].map(n => n.toString(16)).join('')}`;
        }

        const min = D.log10(color_points[i - 1][0]),
            color_min = color_points[i - 1][1],
            max = D.log10(color_points[i][0]),
            color_max = color_points[i][1],
            current = D.log10(player.fr.points),
            fraction = current.minus(min).div(max).max(0).min(1).toNumber();

        return `#${Array.from({ length: 3 }, (_, i) => Math.floor(color_max[i] * fraction + color_min[i] * (1 - fraction)).toString(16).padStart(2, '0')).join('')}`;
    },
    row: 1,
    position: 2.5,
    resource: 'cold',
    layerShown() { return player[this.layer].unlocked && !tmp[this.layer].deactivated; },
    deactivated() { return inChallenge('b', 31); },
    hotkeys: [
        {
            key: 'r',
            description: 'R: Display freezer layer',
            unlocked() { return player.fr.unlocked; },
            onPress() { showTab('fr'); },
        },
    ],
    tabFormat: {
        'Freezer': {
            content: [
                () => {
                    const speed = D.times(layers.clo.time_speed('fr'), layers.tic.time_speed('fr'));

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                ['display-text', () => {
                    let change_str = '';

                    const change = tmp.lo.items.water.sources.total_per_second;

                    if (D.abs(change).gt(1e-4)) change_str = ` (${itemColor('water', (change.gt(0) ? '+' : '') + format(change))} /s)`;

                    return `You have ${itemColor('water', format(player.lo.items.water.amount), 'font-size:1.5em;')}${change_str} water`;
                }],
                ['display-text', () => {
                    let change_str = '';

                    const change = tmp.fr.cold.gain;

                    if (D.abs(change).gt(1e-4)) change_str = ` (${layerColor('fr', (change.gt(0) ? '+' : '') + format(change))} /s)`;

                    return `You have ${layerColor('fr', format(player.fr.points), 'font-size:1.5em;')}${change_str} cold`;
                }],
                ['display-text', () => {
                    let change_str = '';

                    const change = tmp.lo.items.ice.sources.total_per_second;

                    if (D.abs(change).gt(1e-4)) change_str = ` (${itemColor('ice', (change.gt(0) ? '+' : '') + format(change))} /s)`;

                    return `You have ${itemColor('ice', format(player.lo.items.ice.amount), 'font-size:1.5em;')}${change_str} ice,\
                        multiplying cold gain by ${shiftDown ? `[${tmp.fr.ice.mult_formula}]` : format(tmp.fr.ice.mult)}`;
                }],
                ['display-text', `<span class="warning">1% of your water is converted into cold each second</span>`],
                ['display-text', `<span class="warning">You lose 1% of your cold each second</span>`],
                () => { if (inChallenge('b', 32) && !false) return ['display-text', '<span class="warning">(technically 2% because of your challenges)</span>']; },
                ['display-text', `<span class="warning">1% of your water and cold is converted into ice each second</span>`],
                'blank',
                'buyables',
            ],
        },
        'Freezing': {
            content: [
                () => {
                    const speed = D.times(layers.clo.time_speed('fr'), layers.tic.time_speed('fr'));

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                ['display-text', () => {
                    const change = tmp.fr.cold.gain;
                    let change_str = '';

                    if (D.abs(change).gt(1e-4)) change_str = ` (${layerColor('fr', (change.gt(0) ? '+' : '') + format(change))} /s)`;

                    return `You have ${layerColor('fr', format(player.fr.points), 'font-size:1.5em;')}${change_str} cold`;
                }],
                ['display-text', `<span class="warning">You lose 1% of your cold each second</span>`],
                () => { if (inChallenge('b', 32) && !false) return ['display-text', '<span class="warning">(technically 2% because of your challenges)</span>']; },
                ['display-text', () => `Your cold divides time requirements by ${shiftDown ? `[${tmp.fr.cold.speed_formula}]` : format(tmp.fr.cold.speed)}`],
                () => {
                    const slow = tmp.f.heat.slow;
                    if (slow.minus(1).abs().gt(1e-4)) return [
                        'display-text',
                        `Your heat multiplies time requirements by ${shiftDown ? `[${tmp.f.heat.slow_formula}]` : format(slow)}`,
                    ];
                },
                'blank',
                ['display-text', () => `Your freezer's size prevents producing more than ${format(tmp.fr.recipes['*'].size)} of each recipes per second`],
                [
                    'display-text',
                    () => `Hold <span style="${ctrlDown && !shiftDown ? 'text-decoration:underline;' : ''}">control for *10</span>,\
                        <span style="${!ctrlDown && shiftDown ? 'text-decoration:underline;' : ''}">shift for *25</span>,\
                        and <span style="${ctrlDown && shiftDown ? 'text-decoration:underline;' : ''}">both for *250</span>`
                ],
                ['display-text', '<span class="warning">Freezing will only progress as long as the freezer is cold enough</span>'],
                'blank',
                [
                    'column',
                    () => Object.keys(layers.fr.recipes)
                        .filter(recipe => recipe != '*')
                        .map(recipe => layers.fr.recipes['*'].show_recipes(recipe))
                ],
            ],
        },
    },
    update(diff) {
        if (tmp.clo.layerShown) diff = D.times(diff, layers.clo.time_speed(this.layer));
        if (tmp.tic.layerShown) diff = D.times(diff, layers.tic.time_speed(this.layer));

        // Condensation
        gain_items('water', D.times(tmp.fr.water.total_gain, diff));

        // Cooling
        addPoints(this.layer, D.times(tmp.fr.cold.gain, diff));

        // Freeze water
        gain_items('ice', D.times(tmp.fr.ice.gain, diff));

        // Freezing recipes
        Object.keys(layers.fr.recipes)
            .filter(recipe => recipe != '*' && player.fr.recipes[recipe].amount_freezing.gt(0))
            .forEach(recipe_id => {
                const precipe = player.fr.recipes[recipe_id],
                    recipe = tmp.fr.recipes[recipe_id];

                // Too hot, no progress
                if (player.fr.points.lt(recipe.cold)) return;

                precipe.progress = precipe.progress.add(diff);

                if (precipe.progress.gte(recipe.time)) {
                    gain_items(recipe.produces, precipe.amount_freezing);
                    precipe.progress = D.dZero;
                    precipe.amount_freezing = D.dZero;
                }
            });
    },
    automate() {
        Object.entries(player.fr.recipes)
            .forEach(([id, recipe]) => {
                // Prevent overflow in some cases
                if (recipe.amount_target.gt(tmp.fr.recipes['*'].size)) recipe.amount_target = tmp.fr.recipes['*'].size;
                if (recipe.auto && id in tmp.fr.recipes) clickClickable('fr', `recipe_display_${id}_${tmp.fr.recipes[id].consumes.length}`);
            });
    },
    type: 'none',
    buyables: {
        11: {
            title() {
                const amount = getBuyableAmount(this.layer, this.id);
                if (amount.gt(1)) return `Glaciers (${formatWhole(amount)})`;
                return 'Glacier';
            },
            display() {
                if (!shiftDown) {
                    const amount = getBuyableAmount(this.layer, this.id),
                        /** @type {{[item in items]: Decimal}} */
                        cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(player.lo.items[item].amount)}/${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Increase water generation by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    Cost: ${cost}`;
                } else {
                    let effect_formula = '3√(amount)',
                        cost_formula = '1.5 ^ amount * 10';

                    const cost_list = [
                        `[${cost_formula}] ${tmp.lo.items.ice.name}`,
                    ];

                    return `Increase water generation by [${effect_formula}]<br><br>\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    'ice': D.pow(1.5, x).times(10),
                };

                return cost;
            },
            effect(x) {
                if (tmp.fr.deactivated) x = D.dZero;
                return D.root(x, 3);
            },
            canAfford() {
                return Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .forEach(([item, amount]) => gain_items(item, D.times(amount, tmp.lo.items['*'].craft_consumption).neg()));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.ice.style['background-color'];

                return style;
            },
        },
        12: {
            title() {
                const amount = getBuyableAmount(this.layer, this.id);
                if (amount.gt(1)) return `Freezing Rings (${formatWhole(amount)})`;
                return 'Freezing Ring';
            },
            display() {
                if (!shiftDown) {
                    const amount = getBuyableAmount(this.layer, this.id),
                        /** @type {{[item in items]: Decimal}} */
                        cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(player.lo.items[item].amount)}/${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Multiply cold gain by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    Cost: ${cost}`;
                } else {
                    let effect_formula = 'log4(amount + 4)',
                        cost_formula = '1.5 ^ amount * 3';

                    const cost_list = [
                        `[${cost_formula}] ${tmp.lo.items.icestone.name}`,
                    ];

                    return `Multiply cold gain by [${effect_formula}]<br><br>\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    'icestone': D.pow(1.5, x).times(3),
                };

                return cost;
            },
            effect(x) {
                if (tmp.fr.deactivated) x = D.dZero;
                return D.add(x, 4).log(4);
            },
            canAfford() {
                return Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .forEach(([item, amount]) => gain_items(item, D.times(amount, tmp.lo.items['*'].craft_consumption).neg()));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.icestone.style['background-color'];

                return style;
            },
        },
        13: {
            title() {
                const amount = getBuyableAmount(this.layer, this.id);
                if (amount.gt(1)) return `Rust Pickaxes (${formatWhole(amount)})`;
                return 'Rust Pickaxe';
            },
            display() {
                if (!shiftDown) {
                    const amount = getBuyableAmount(this.layer, this.id),
                        /** @type {{[item in items]: Decimal}} */
                        cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(player.lo.items[item].amount)}/${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Multiply mines production by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    Cost: ${cost}`;
                } else {
                    let effect_formula = '2√(amount + 1)',
                        cost_formula = '1.2 ^ amount';

                    const cost_list = [
                        `[${cost_formula}] ${tmp.lo.items.rust_ingot.name}`,
                    ];

                    return `Multiply mines production by [${effect_formula}]<br><br>\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    'rust_ingot': D.pow(1.2, x),
                };

                return cost;
            },
            effect(x) {
                if (tmp.fr.deactivated) x = D.dZero;
                return D.add(x, 1).root(2);
            },
            canAfford() {
                return Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .forEach(([item, amount]) => gain_items(item, D.times(amount, tmp.lo.items['*'].craft_consumption).neg()));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.rust_ingot.style['background-color'];

                return style;
            },
        },
        21: {
            title() {
                const amount = getBuyableAmount(this.layer, this.id);
                if (amount.gt(1)) return `Ice Molds (${formatWhole(amount)})`;
                return 'Ice Molds';
            },
            display() {
                if (!shiftDown) {
                    const amount = getBuyableAmount(this.layer, this.id),
                        /** @type {{[item in items]: Decimal}} */
                        cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(player.lo.items[item].amount)}/${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Multiply ice gain by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    Cost: ${cost}`;
                } else {
                    let effect_formula = 'amount / 10 + 1',
                        cost_formula = '1.8 ^ amount * 25';

                    const cost_list = [
                        `[${cost_formula}] ${tmp.lo.items.ice.name}`,
                    ];

                    return `Multiply ice gain by [${effect_formula}]<br><br>\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    'ice': D.pow(1.8, x).times(25),
                };

                return cost;
            },
            effect(x) {
                if (tmp.fr.deactivated) x = D.dZero;
                return D.div(x, 10).add(1);
            },
            canAfford() {
                return Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .forEach(([item, amount]) => gain_items(item, D.times(amount, tmp.lo.items['*'].craft_consumption).neg()));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.ice.style['background-color'];

                return style;
            },
            unlocked() { return getBuyableAmount(this.layer, this.id - 10).gt(0); },
        },
        22: {
            title() {
                const amount = getBuyableAmount(this.layer, this.id);
                if (amount.gt(1)) return `Cooling (${formatWhole(amount)})`;
                return 'Cooling';
            },
            display() {
                if (!shiftDown) {
                    const amount = getBuyableAmount(this.layer, this.id),
                        /** @type {{[item in items]: Decimal}} */
                        cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(player.lo.items[item].amount)}/${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Divide city coal consumption by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    Cost: ${cost}`;
                } else {
                    let effect_formula = 'amount / 20 + 1',
                        cost_formula = '1.75 ^ amount * 5';

                    const cost_list = [
                        `[${cost_formula}] ${tmp.lo.items.icestone.name}`,
                    ];

                    return `Divide city coal consumption by [${effect_formula}]<br><br>\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    'icestone': D.pow(1.75, x).times(5),
                };

                return cost;
            },
            effect(x) {
                if (tmp.fr.deactivated) x = D.dZero;
                return D.div(x, 20).add(1);
            },
            canAfford() {
                return Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .forEach(([item, amount]) => gain_items(item, D.times(amount, tmp.lo.items['*'].craft_consumption).neg()));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.icestone.style['background-color'];

                return style;
            },
            unlocked() { return getBuyableAmount(this.layer, this.id - 10).gt(0); },
        },
        23: {
            title() {
                const amount = getBuyableAmount(this.layer, this.id);
                if (amount.gt(1)) return `Rust Coins (${formatWhole(amount)})`;
                return 'Rust Coin';
            },
            display() {
                if (!shiftDown) {
                    const amount = getBuyableAmount(this.layer, this.id),
                        /** @type {{[item in items]: Decimal}} */
                        cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(player.lo.items[item].amount)}/${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Multiplies coin gain by ${format(buyableEffect(this.layer, this.id))}<br><br>\
                    Cost: ${cost}`;
                } else {
                    let effect_formula = '1.05 ^ amount',
                        cost_formula = '1.4 ^ amount * 2.5';

                    const cost_list = [
                        `[${cost_formula}] ${tmp.lo.items.rust_ingot.name}`,
                    ];

                    return `Multiplies coin gain by [${effect_formula}]<br><br>\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    'rust_ingot': D.pow(1.4, x).times(2.5),
                };

                return cost;
            },
            effect(x) {
                if (tmp.fr.deactivated) x = D.dZero;
                return D.pow(1.05, x);
            },
            canAfford() {
                return Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .forEach(([item, amount]) => gain_items(item, D.times(amount, tmp.lo.items['*'].craft_consumption).neg()));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.rust_ingot.style['background-color'];

                return style;
            },
            unlocked() { return getBuyableAmount(this.layer, this.id - 10).gt(0); },
        },
        31: {
            title() {
                const amount = getBuyableAmount(this.layer, this.id);
                if (amount.gt(1)) return `Seed Bank (${formatWhole(amount)})`;
                return 'Seed Bank';
            },
            display() {
                if (!shiftDown) {
                    const amount = getBuyableAmount(this.layer, this.id),
                        /** @type {{[item in items]: Decimal}} */
                        cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(player.lo.items[item].amount)}/${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Multiply seeds harvested by ${format(buyableEffect(this.layer, this.id).seed)}\
                    and keep ${formatWhole(buyableEffect(this.layer, this.id).p_hold)} seeds of each plant<br><br>\
                    Cost: ${cost}`;
                } else {
                    let effect_formula_seed = '1.01 ^ amount',
                        effect_formula_keep = 'amount',
                        cost_formula = '2.1 ^ amount * 50';

                    const cost_list = [
                        `[${cost_formula}] ${tmp.lo.items.ice.name}`,
                    ];

                    return `Multiply seeds harvested by [${effect_formula_seed}]\
                    and keep ${effect_formula_keep} seeds of each plant<br><br>\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    'ice': D.pow(2.1, x).times(50),
                };

                return cost;
            },
            effect(x) {
                if (tmp.fr.deactivated) x = D.dZero;
                return {
                    seed: D.pow(1.01, x),
                    p_hold: x,
                };
            },
            canAfford() {
                return Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .forEach(([item, amount]) => gain_items(item, D.times(amount, tmp.lo.items['*'].craft_consumption).neg()));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.ice.style['background-color'];

                return style;
            },
            unlocked() { return getBuyableAmount(this.layer, this.id - 10).gt(0); },
        },
        32: {
            title() {
                const amount = getBuyableAmount(this.layer, this.id);
                if (amount.gt(1)) return `Icestone Carvings (${formatWhole(amount)})`;
                return 'Icestone Carving';
            },
            display() {
                if (!shiftDown) {
                    const amount = getBuyableAmount(this.layer, this.id),
                        /** @type {{[item in items]: Decimal}} */
                        cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(player.lo.items[item].amount)}/${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Multiply science gain by ${format(buyableEffect(this.layer, this.id).science)}\
                    and keep ${formatWhole(buyableEffect(this.layer, this.id).xp_hold)} XP upgrades<br><br>\
                    Cost: ${cost}`;
                } else {
                    let effect_formula_science = 'amount / 20 + 1',
                        effect_formula_keep = 'amount',
                        cost_formula = '2 ^ amount * 10';

                    const cost_list = [
                        `[${cost_formula}] ${tmp.lo.items.icestone.name}`,
                    ];

                    return `Multiply science gain by [${effect_formula_science}]\
                    and keep [${effect_formula_keep}] XP upgrades<br><br>\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    'icestone': D.pow(2, x).times(10),
                };

                return cost;
            },
            effect(x) {
                if (tmp.fr.deactivated) x = D.dZero;
                return {
                    science: D.div(x, 20).add(1),
                    xp_hold: x,
                };
            },
            canAfford() {
                return Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .forEach(([item, amount]) => gain_items(item, D.times(amount, tmp.lo.items['*'].craft_consumption).neg()));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.icestone.style['background-color'];

                return style;
            },
            unlocked() { return getBuyableAmount(this.layer, this.id - 10).gt(0); },
        },
        33: {
            title() {
                const amount = getBuyableAmount(this.layer, this.id);
                if (amount.gt(1)) return `Rust Boxes (${formatWhole(amount)})`;
                return 'Rust Box';
            },
            display() {
                if (!shiftDown) {
                    const amount = getBuyableAmount(this.layer, this.id),
                        /** @type {{[item in items]: Decimal}} */
                        cost_obj = this.cost(amount),
                        cost = listFormat.format(Object.entries(cost_obj).map(([item, amount]) => `${format(player.lo.items[item].amount)}/${format(amount)} ${tmp.lo.items[item].name}`));

                    return `Multiply monster production by ${format(buyableEffect(this.layer, this.id).monster)}\
                    and keep ${formatWhole(buyableEffect(this.layer, this.id).c_hold)} city upgrades<br><br>\
                    Cost: ${cost}`;
                } else {
                    let effect_formula_monster = '1.5 ^ amount',
                        effect_formula_keep = 'amount',
                        cost_formula = '1.6 ^ amount * 5';

                    const cost_list = [
                        `[${cost_formula}] ${tmp.lo.items.rust_ingot.name}`,
                    ];

                    return `Multiply monster production by [${effect_formula_monster}]\
                    and keep [${effect_formula_keep}] city upgrades<br><br>\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) {
                const cost = {
                    'rust_ingot': D.pow(1.6, x).times(5),
                };

                return cost;
            },
            effect(x) {
                if (tmp.fr.deactivated) x = D.dZero;
                return {
                    monster: D.pow(1.5, x),
                    c_hold: x,
                };
            },
            canAfford() {
                return Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
            buy() {
                Object.entries(tmp[this.layer].buyables[this.id].cost)
                    .forEach(([item, amount]) => gain_items(item, D.times(amount, tmp.lo.items['*'].craft_consumption).neg()));
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.lo.items.rust_ingot.style['background-color'];

                return style;
            },
            unlocked() { return getBuyableAmount(this.layer, this.id - 10).gt(0); },
        },
        41: {
            title() {
                const amount = getBuyableAmount(this.layer, this.id);
                if (amount.gt(1)) return `Starspots (${formatWhole(amount)})`;
                return 'Starspot';
            },
            display() {
                if (!shiftDown) {
                    const amount = getBuyableAmount(this.layer, this.id),
                        /** @type {Decimal} */
                        cost = this.cost(amount);

                    return `Reduces effect star level by ${formatWhole(buyableEffect(this.layer, this.id))}<br><br>\
                    Cost: ${format(cost)} ${tmp.fr.resource}`;
                } else {
                    let effect_formula = 'amount / 2',
                        cost_formula = '2 ^ amount * 50';

                    const cost_list = [
                        `[${cost_formula}] ${tmp.fr.resource}`,
                    ];

                    return `Reduces effect star level by [${effect_formula}]<br><br>\
                    Cost: ${listFormat.format(cost_list)}`;
                }
            },
            cost(x) { return D.pow(2, x).times(50); },
            effect(x) {
                if (tmp.fr.deactivated) x = D.dZero;
                return D.div(x, 2);
            },
            canAfford() { return D.gte(player.fr.points, tmp[this.layer].buyables[this.id].cost); },
            buy() {
                player.fr.points = D.minus(player.fr.points, tmp[this.layer].buyables[this.id].cost);
                addBuyables(this.layer, this.id, 1);
            },
            style() {
                const style = {};

                if (canBuyBuyable(this.layer, this.id)) style['background-color'] = tmp.fr.color;

                return style;
            },
        },
    },
    recipes: {
        '*': {
            regexes: {
                bar: /^recipe_(cold|time)_([a-z_]+)$/,
                display: /^recipe_(display)_([a-z_]+)_(\d+)$/,
                amount: /^recipe_(increase|decrease|auto)_([a-z_]+)$/,
            },
            show_recipes(recipe_id) {
                if (!recipe_id || !(tmp.fr.recipes[recipe_id].unlocked ?? true)) return;

                const recipe = tmp.fr.recipes[recipe_id];

                return ['row', [
                    ...recipe.consumes.map((_, i) => ['clickable', `recipe_display_${recipe_id}_${i}`]),
                    ['bar', `recipe_cold_${recipe_id}`],
                    ['bar', `recipe_time_${recipe_id}`],
                    // I can't put a text-input on a subitem so I'll have to do with what I can
                    ['clickable', `recipe_decrease_${recipe_id}`],
                    ['clickable', `recipe_display_${recipe_id}_${recipe.consumes.length}`],
                    ['clickable', `recipe_increase_${recipe_id}`],
                    ['clickable', `recipe_auto_${recipe_id}`],
                ]];
            },
            size() {
                let size = D.dTen;

                if (hasUpgrade('f', 13)) size = size.add(D.pow(upgradeEffect('f', 13).recipe, tmp.a.change_efficiency));

                return size.floor();
            },
            default_amount(recipe, amount) {
                if (D.gt(amount, 0)) return D(amount);
                if (!recipe) return D.dOne;

                const precipe = player.fr.recipes[recipe];
                if (precipe.amount_freezing.gt(0)) return precipe.amount_freezing;
                if (precipe.amount_target.gt(0)) return precipe.amount_target;
                return D.dOne;
            },
            speed() {
                let speed = D.dOne;

                speed = speed.times(tmp.fr.cold.speed);

                speed = speed.div(tmp.f.heat.slow);

                return speed;
            },
        },
        // Simple convertions
        soaked_log: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.fr.recipes).find(recipe => layers.fr.recipes[recipe] == this); },
            cold: D(1),
            consumes(amount) {
                amount = layers.fr.recipes['*'].default_amount(this.id, amount);

                /** @type {[items, Decimal][]} */
                const items = [
                    ['normal_log', D.times(amount, 10)],
                ];

                const upg = layers.s.investloans.item_upgrade[this.produces] ?? false;
                if (upg && hasUpgrade('s', upg)) {
                    items.forEach(([, amount], i) => items[i] = D.div(amount, upgradeEffect('s', upg)));
                } else if (inChallenge('b', 12)) {
                    items.forEach(([, amount], i) => items[i] = D.times(amount, D.add(D.max(player.lo.items[this.produces].amount, 0), 10).log10()));
                }

                return items;
            },
            produces: 'soaked_log',
            time(amount) {
                amount = layers.fr.recipes['*'].default_amount(this.id, amount);

                let time = D.times(amount, 2.5).add(10);

                time = time.div(tmp.fr.recipes['*'].speed);

                return time;
            },
            formulas: {
                'normal_log': 'amount * 10',
                'time': 'amount * 2.5 + 10',
            },
        },
        slime_core: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.fr.recipes).find(recipe => layers.fr.recipes[recipe] == this); },
            cold: D(5),
            consumes(amount) {
                amount = layers.fr.recipes['*'].default_amount(this.id, amount);

                /** @type {[items, Decimal][]} */
                const items = [
                    ['slime_goo', D.times(amount, 100)],
                    ['slime_core_shard', D.times(amount, 10)],
                ];

                const upg = layers.s.investloans.item_upgrade[this.produces] ?? false;
                if (upg && hasUpgrade('s', upg)) {
                    items.forEach(([, amount], i) => items[i] = D.div(amount, upgradeEffect('s', upg)));
                } else if (inChallenge('b', 12)) {
                    items.forEach(([, amount], i) => items[i] = D.times(amount, D.add(D.max(player.lo.items[this.produces].amount, 0), 10).log10()));
                }

                return items;
            },
            produces: 'slime_core',
            time(amount) {
                amount = layers.fr.recipes['*'].default_amount(this.id, amount);

                let time = D.times(amount, 3).add(15);

                time = time.div(tmp.fr.recipes['*'].speed);

                return time;
            },
            formulas: {
                'slime_goo': 'amount * 100',
                'slime_core_shard': 'amount * 10',
                'time': 'amount * 3 + 15',
            },
        },
        rusty_gear: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.fr.recipes).find(recipe => layers.fr.recipes[recipe] == this); },
            cold: D(10),
            consumes(amount) {
                amount = layers.fr.recipes['*'].default_amount(this.id, amount);

                /** @type {[items, Decimal][]} */
                const items = [
                    ['iron_ore', D.pow(amount, 1.25).times(50)],
                ];

                const upg = layers.s.investloans.item_upgrade[this.produces] ?? false;
                if (upg && hasUpgrade('s', upg)) {
                    items.forEach(([, amount], i) => items[i] = D.div(amount, upgradeEffect('s', upg)));
                } else if (inChallenge('b', 12)) {
                    items.forEach(([, amount], i) => items[i] = D.times(amount, D.add(D.max(player.lo.items[this.produces].amount, 0), 10).log10()));
                }

                return items;
            },
            produces: 'rusty_gear',
            time(amount) {
                amount = layers.fr.recipes['*'].default_amount(this.id, amount);

                let time = D.times(amount, 15).add(45);

                time = time.div(tmp.fr.recipes['*'].speed);

                return time;
            },
            formulas: {
                'iron_ore': 'amount ^ 1.25 * 50',
                'time': 'amount * 15 + 45',
            },
        },
        // Materials
        icestone: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.fr.recipes).find(recipe => layers.fr.recipes[recipe] == this); },
            cold: D(50),
            consumes(amount) {
                amount = layers.fr.recipes['*'].default_amount(this.id, amount);

                /** @type {[items, Decimal][]} */
                const items = [
                    ['stone', D.pow(amount, 1.25).times(50)],
                    ['ice', D.pow(amount, 1.25).times(10)],
                ];

                const upg = layers.s.investloans.item_upgrade[this.produces] ?? false;
                if (upg && hasUpgrade('s', upg)) {
                    items.forEach(([, amount], i) => items[i] = D.div(amount, upgradeEffect('s', upg)));
                } else if (inChallenge('b', 12)) {
                    items.forEach(([, amount], i) => items[i] = D.times(amount, D.add(D.max(player.lo.items[this.produces].amount, 0), 10).log10()));
                }

                return items;
            },
            produces: 'icestone',
            time(amount) {
                amount = layers.fr.recipes['*'].default_amount(this.id, amount);

                let time = D.times(amount, 30).add(60);

                time = time.div(tmp.fr.recipes['*'].speed);

                return time;
            },
            formulas: {
                'stone': 'amount ^ 1.25 * 50',
                'ice': 'amount ^ 1.25 * 10',
                'time': 'amount * 30 + 60',
            },
        },
        rust_ingot_crude: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.fr.recipes).find(recipe => layers.fr.recipes[recipe] == this); },
            cold: D(100),
            consumes(amount) {
                amount = layers.fr.recipes['*'].default_amount(this.id, amount);

                /** @type {[items, Decimal][]} */
                const items = [
                    ['iron_ore', D.pow(amount, 1.5).times(75)],
                    ['water', D.pow(amount, 1.25).times(25)],
                ];

                const upg = layers.s.investloans.item_upgrade[this.produces] ?? false;
                if (upg && hasUpgrade('s', upg)) {
                    items.forEach(([, amount], i) => items[i] = D.div(amount, upgradeEffect('s', upg)));
                } else if (inChallenge('b', 12)) {
                    items.forEach(([, amount], i) => items[i] = D.times(amount, D.add(D.max(player.lo.items[this.produces].amount, 0), 10).log10()));
                }

                return items;
            },
            produces: 'rust_ingot',
            time(amount) {
                amount = layers.fr.recipes['*'].default_amount(this.id, amount);

                let time = D.pow(1.125, amount).times(40).add(120);

                time = time.div(tmp.fr.recipes['*'].speed);

                return time;
            },
            formulas: {
                'iron_ore': 'amount ^ 1.5 * 75',
                'water': 'amount ^ 1.25 * 25',
                'time': '1.125 ^ amount * 40 + 120',
            },
        },
        rust_ingot: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.fr.recipes).find(recipe => layers.fr.recipes[recipe] == this); },
            cold: D(100),
            consumes(amount) {
                amount = layers.fr.recipes['*'].default_amount(this.id, amount);

                /** @type {[items, Decimal][]} */
                const items = [
                    ['iron_ingot', D.pow(amount, 1.5).times(7.5)],
                    ['water', D.pow(amount, 1.25).times(25)],
                ];

                const upg = layers.s.investloans.item_upgrade[this.produces] ?? false;
                if (upg && hasUpgrade('s', upg)) {
                    items.forEach(([, amount], i) => items[i] = D.div(amount, upgradeEffect('s', upg)));
                } else if (inChallenge('b', 12)) {
                    items.forEach(([, amount], i) => items[i] = D.times(amount, D.add(D.max(player.lo.items[this.produces].amount, 0), 10).log10()));
                }

                return items;
            },
            produces: 'rust_ingot',
            time(amount) {
                amount = layers.fr.recipes['*'].default_amount(this.id, amount);

                let time = D.pow(1.125, amount).times(30).add(100);

                time = time.div(tmp.fr.recipes['*'].speed);

                return time;
            },
            formulas: {
                'iron_ingot': 'amount ^ 1.5 * 7.5',
                'water': 'amount ^ 1.25 * 25',
                'time': '1.125 ^ amount * 30 + 120',
            },
        },
        // Challenge
        holy_water: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.fr.recipes).find(recipe => layers.fr.recipes[recipe] == this); },
            cold: D(125),
            consumes(amount) {
                amount = layers.fr.recipes['*'].default_amount(this.id, amount);

                /** @type {[items, Decimal][]} */
                const items = [
                    ['water', D.times(amount, 100)],
                    ['copper_ingot', D.pow(amount, 1.25).times(50)],
                    ['gold_ingot', D.pow(amount, 1.25)],
                ];

                const upg = layers.s.investloans.item_upgrade[this.produces] ?? false;
                if (upg && hasUpgrade('s', upg)) {
                    items.forEach(([, amount], i) => items[i] = D.div(amount, upgradeEffect('s', upg)));
                } else if (inChallenge('b', 12)) {
                    items.forEach(([, amount], i) => items[i] = D.times(amount, D.add(D.max(player.lo.items[this.produces].amount, 0), 10).log10()));
                }

                return items;
            },
            produces: 'holy_water',
            time(amount) {
                amount = layers.f.recipes['*'].default_amount(this.id, amount);

                let time = D.times(amount, 30).add(300);

                time = time.div(tmp.f.recipes['*'].speed);

                return time;
            },
            formulas: {
                'water': 'amount * 100',
                'copper_ingot': '(amount ^ 1.25) * 50',
                'gold_ingot': 'amount ^ 1.25',
                'time': 'amount * 30 + 300',
            },
            unlocked() { return tmp.lo.items['holy_water'].unlocked ?? true; },
        },
    },
    water: {
        gain() {
            if (!player.fr.unlocked) return D.dZero;

            let gain = D.dOne;

            gain = gain.add(buyableEffect('fr', 11));

            gain = gain.times(tmp.bin.cards.multipliers['fr'] ?? 1);

            gain = gain.times(tmp.k.dishes.ice_cream.effect);

            gain = gain.times(tmp.k.dishes.popsicle.effect);

            gain = gain.times(tmp.con.condiments['*'].total.fr.water ?? D.dOne);

            return gain;
        },
        total_gain() { return D.add(tmp.fr.water.gain, tmp.fr.cold.consumes).add(tmp.fr.ice.consumes); },
    },
    cold: {
        gain() {
            if (!player.fr.unlocked) return D.dZero;

            let gain = D.div(player.lo.items.water.amount, 100);

            gain = gain.times(tmp.fr.ice.mult);

            gain = gain.times(buyableEffect('fr', 12));

            gain = gain.times(tmp.k.dishes.ice_cream.effect);

            gain = gain.times(tmp.k.dishes.popsicle.effect);

            gain = gain.times(tmp.con.condiments['*'].total.fr.cold ?? D.dOne);

            const loss = player.fr.points.div(100);

            return gain.add(tmp.fr.ice.consumes).minus(loss);
        },
        consumes() {
            if (!player.fr.unlocked) return D.dZero;

            return D.div(player.lo.items.water.amount, 100).neg();
        },
        speed() { return D.dTwo.pow(D.log10(player.fr.points.max(0).add(1)).div(50)); },
        speed_formula: '2 ^ (log10(cold + 1) / 50)',
        slow() { return D.dTwo.pow(D.log10(player.fr.points.max(0).add(1)).div(100)).pow(tmp.a.change_efficiency); },
        slow_formula: '2 ^ (log10(cold + 1) / 100)',
    },
    ice: {
        gain() {
            let gain = D.min(player.fr.points, player.lo.items.water.amount).div(500);

            gain = gain.times(buyableEffect('fr', 21));

            gain = gain.times(tmp.k.dishes.ice_cream.effect);

            gain = gain.times(tmp.k.dishes.popsicle.effect);

            return gain;
        },
        consumes() { return D.min(player.fr.points, player.lo.items.water.amount).div(100).neg(); },
        mult() { return D.add(player.lo.items.ice.amount, 1).log10().pow_base(1.02); },
        mult_formula: '1.02 ^ log10(ice + 1)',
    },
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        const keep = [],
            // Keep amounts being made and automation
            /** @type {[id: string, data: {amount_target: Decimal, auto: boolean}][]} */
            rec = Object.entries(player.fr.recipes).map(([id, data]) => [id, {
                amount_target: data.amount_target,
                auto: data.auto,
            }]);

        layerDataReset(this.layer, keep);
        rec.forEach(([id, data]) => {
            player.fr.recipes[id].amount_target = data.amount_target
            player.fr.recipes[id].auto = data.auto;
        });
    },
    branches: [() => tmp.lo.layerShown ? ['lo', 3] : 'k'],
    clickables: new Proxy({}, {
        /** @returns {Clickable<'fr'>} */
        get(obj, prop) {
            // Required to not break the auto stuff
            if (prop == 'constructor') return obj.constructor;
            if (prop == 'layer') return 'f';

            if (prop in obj) return obj[prop];

            const display_matches = layers.fr.recipes['*'].regexes.display.exec(prop);
            if (display_matches) {
                /** @type {[string, 'display', string, string]} */
                const [, , recipe_id, index] = display_matches,
                    recipe = () => tmp.fr?.recipes[recipe_id],
                    precipe = () => player.fr.recipes[recipe_id],
                    /** @type {() => [items, Decimal]} */
                    entry = () => {
                        if (+index < recipe().consumes.length) {
                            let e = recipe().consumes[+index];
                            // I'm assuming the problem is here
                            if (!e || !Array.isArray(e)) return ['stone', D.dZero];
                            else e = Array.from(e);
                            e[1] = e[1].neg();
                            return e;
                        } else {
                            let amount;
                            if (precipe().amount_freezing.gt(0)) amount = precipe().amount_freezing;
                            else amount = precipe().amount_target;

                            return [recipe().produces, amount];
                        }
                    },
                    is_output = () => +index == recipe().consumes.length,
                    has_materials = () => recipe().consumes.every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));

                if (!recipe()) return;

                return obj[prop] ??= {
                    canClick() { return !is_output() || precipe().amount_freezing.lte(0) && precipe().amount_target.gt(0) && has_materials(); },
                    display() {
                        if (!shiftDown) {
                            return `<h3>${capitalize(tmp.lo?.items[entry()[0]].name)}</h3><br>\
                                ${format(player.lo.items[entry()[0]].amount)}<br>\
                                ${D.gt(entry()[1], 0) ? '+' : ''}${format(entry()[1])}<br>\
                                ${is_output() && precipe().amount_freezing.gt(0) ? '<br><i>In progress</i>' : ''}`;
                        } else {
                            return `<h3>${capitalize(tmp.lo?.items[entry()[0]].name)}</h3><br>\
                                Formula: ${recipe().formulas[entry()[0]] ?? 'amount'}\
                                ${is_output() && precipe().amount_freezing.gt(0) ? '<br><i>In progress</i>' : ''}`;
                        }
                    },
                    unlocked() { return recipe().unlocked ?? true; },
                    style() {
                        const style = Object.assign({
                            'height': '80px',
                            'width': '80px',
                            'min-height': 'unset',
                            'transform': 'unset',
                            'color': 'black',
                        }, tmp.lo?.items[entry()[0]].style);

                        if (is_output()) {
                            if (precipe().amount_freezing.gt(0)) {
                                style['filter'] = 'drop-shadow(0 0 5px skyblue)';
                            } else if (precipe().amount_target.lte(0) || !has_materials()) {
                                style['filter'] = 'brightness(75%)';
                            }
                        }

                        return style;
                    },
                    onClick() {
                        if (is_output()) {
                            const amount = precipe().amount_target;

                            recipe().consumes.forEach(([item, amount]) => {
                                gain_items(item, D.neg(amount));
                            });
                            precipe().amount_freezing = amount;
                        }
                    },
                };
            }

            const amount_matches = layers.fr.recipes['*'].regexes.amount.exec(prop);
            if (amount_matches) {
                /** @type {[string, 'increase'|'decrease'|'auto', string]} */
                const [, mode, recipe_id] = amount_matches,
                    recipe = () => tmp.fr?.recipes[recipe_id],
                    precipe = () => player.fr?.recipes[recipe_id],
                    change = () => {
                        let amount = D.dOne;

                        if (ctrlDown) amount = amount.times(10);

                        if (shiftDown) amount = amount.times(25);

                        return amount;
                    };

                if (!recipe()) return;

                return obj[prop] ??= {
                    canClick() {
                        switch (mode) {
                            case 'increase':
                                if (precipe().amount_target.gte(tmp.fr.recipes['*'].size)) return false;
                                break;
                            case 'decrease':
                                if (precipe().amount_target.lte(0)) return false;
                                break;
                            case 'auto':
                                break;
                        }
                        return true;
                    },
                    display() {
                        switch (mode) {
                            case 'increase':
                                return '+';
                            case 'decrease':
                                return '-';
                            case 'auto':
                                if (precipe().auto) return 'ON';
                                return 'OFF';
                        }
                    },
                    unlocked() { return recipe().unlocked ?? true; },
                    style: {
                        'height': '40px',
                        'width': '40px',
                        'min-height': 'unset',
                    },
                    onClick() {
                        let amount = change();
                        switch (mode) {
                            case 'auto':
                                precipe().auto = !precipe().auto;
                                break;
                            case 'decrease':
                                amount = amount.neg();
                            case 'increase':
                                precipe().amount_target = precipe().amount_target.add(amount).min(tmp.fr.recipes['*'].size).max(0);
                                break;
                        }
                    },
                    tooltip() {
                        if (mode == 'auto') {
                            return 'Automatically run the recipe';
                        }
                    },
                };
            }
        },
        getOwnPropertyDescriptor(_, prop) {
            if (prop == 'layer' ||
                layers.fr.recipes['*'].regexes.display.exec(prop) ||
                layers.fr.recipes['*'].regexes.amount.exec(prop)) return {
                    enumerable: true,
                    configurable: true,
                };
        },
        has(_, prop) {
            return !!layers.fr.recipes['*'].regexes.display.exec(prop) ||
                layers.fr.recipes['*'].regexes.amount.exec(prop);
        },
        ownKeys(_) {
            return [
                ...Object.keys(layers.fr.recipes)
                    .filter(recipe => recipe != '*')
                    .map(recipe => {
                        /** @type {number} */
                        let length = 1;
                        if (tmp.fr && Array.isArray(tmp.fr.recipes[recipe].consumes)) length = tmp.fr.recipes[recipe].consumes.length;
                        else if (layers.fr) length = layers.fr.recipes[recipe].consumes(D(1)).length + 1;

                        return [
                            ...Array.from({ length }, (_, i) => `recipe_display_${recipe}_${i}`),
                            `recipe_increase_${recipe}`,
                            `recipe_decrease_${recipe}`,
                            `recipe_auto_${recipe}`,
                        ];
                    })
                    .flat(),
            ];
        },
    }),
    bars: new Proxy({}, {
        /** @returns {Bar<'fr'>} */
        get(obj, prop) {
            // Required to not break the auto stuff
            if (prop == 'constructor') return obj.constructor;
            if (prop == 'layer') return 'f';

            if (prop in obj) return obj[prop];

            const matches = layers.fr.recipes['*'].regexes.bar.exec(prop);
            if (matches) {
                /** @type {[string, 'cold'|'time', string]} */
                const [, mode, recipe_id] = matches,
                    recipe = () => tmp.fr?.recipes[recipe_id];

                return obj[prop] ??= {
                    direction: { 'cold': UP, 'time': RIGHT }[mode],
                    width: { 'cold': 80, 'time': 160, }[mode],
                    height: 80,
                    unlocked() { return recipe().unlocked ?? true; },
                    progress() {
                        switch (mode) {
                            case 'cold':
                                return D.div(player.fr.points, recipe().cold);
                            case 'time':
                                return D.div(player.fr.recipes[recipe_id].progress, recipe().time);
                        }
                    },
                    display() {
                        if (mode == 'cold') return `${format(player.fr.points)} / ${format(recipe().cold)}`;
                        if (!shiftDown) {
                            return `${formatTime(player.fr.recipes[recipe_id].progress)} / ${formatTime(recipe().time)}`;
                        } else {
                            return `Formula: ${recipe().formulas.time}s`;
                        }
                    },
                    fillStyle() { if (mode == 'cold') return { 'background-color': '#0088FF', }; },
                    textStyle() {
                        let color = 'white';
                        if (mode == 'cold') color = 'lightgray';
                        if (mode == 'time') color = 'gray';
                        return { color };
                    },
                };
            }
        },
        getOwnPropertyDescriptor(_, prop) {
            if (prop == 'layer' || layers.fr.recipes['*'].regexes.bar.exec(prop)) return {
                enumerable: true,
                configurable: true,
            };
        },
        has(_, prop) { return !!layers.fr.recipes['*'].regexes.bar.exec(prop); },
        ownKeys(_) {
            return [
                ...Object.keys(layers.fr.recipes)
                    .filter(recipe => recipe != '*')
                    .map(recipe => [`recipe_cold_${recipe}`, `recipe_time_${recipe}`])
                    .flat(),
            ];
        },
    }),
    componentStyles: {
        'clickable': {
            'background-repeat': 'no-repeat',
            'background-position': 'center',
            'background-size': 'contain',
        },
        'buyable': {
            'height': '120px',
            'width': '120px',
        },
    },
    shouldNotify() { return canAffordLayerBuyable('fr'); },
});
