'use strict';

addLayer('c', {
    name: 'City',
    symbol: 'C',
    startData() {
        return {
            points: D.dZero,
            unlocked: false,
            mode: 'place',
            building: '',
            resources: Object.fromEntries(
                Object.keys(layers.c.resources)
                    .map(resource => [resource, {
                        amount: D.dZero,
                    }])
            ),
            auto_research: true,
            floors: [{}],
            floor: 0,
        };
    },
    tooltip() { return `${formatWhole(layerBuyableAmount('c'))} buildings`; },
    deactivated() { return inChallenge('b', 31); },
    layerShown() { return player.c.unlocked; },
    color: '#666677',
    row: 0,
    position: 1.5,
    resource: 'buildings',
    hotkeys: [
        {
            key: 'c',
            description: 'C: Display city layer',
            unlocked() { return tmp.c.layerShown; },
            onPress() { showTab('c'); },
        },
        {
            key: 'ArrowUp',
            description: '↑ (in C): Move to a higher floor',
            unlocked() { return hasMilestone('to', 1); },
            onPress() {
                if (player.tab == 'c' && player.c.floor < tmp.c.floors.max) {
                    player.c.floor++;
                };
            },
        },
        {
            key: 'ArrowDown',
            description: '↓ (in C): Move to a lower floor',
            unlocked() { return hasMilestone('to', 1); },
            onPress() {
                if (player.tab == 'c' && player.c.floor > 0) {
                    player.c.floor--;
                };
            },
        },
    ],
    tabFormat: {
        'City': {
            content: [
                [
                    'display-text',
                    () => {
                        const mode = {
                            'place': 'placing buildings',
                            'destroy': 'destroying buildings',
                            'toggle': 'toggling buildings',
                        }[player.c.mode];
                        return `Current mode: ${mode}`;
                    },
                ],
                ['row', [
                    ['clickable', 'place'],
                    'blank',
                    ['clickable', 'destroy'],
                    'blank',
                    ['clickable', 'toggle'],
                ]],
                [
                    'row',
                    () => Object.keys(layers.c.buildings)
                        .filter(id => tmp.c.buildings[id].unlocked ?? true)
                        .map(id => ['clickable', `quick_${id}`])
                ],
                'blank',
                'grid',
                'blank',
                () => {
                    if (tmp.c.floors.max > 0) return ['column', [
                        ['display-text', `Current floor: ${formatWhole(player.c.floor)}`],
                        ['row', [
                            ['clickable', 'up'],
                            'blank',
                            ['clickable', 'down'],
                        ]],
                    ]];
                },
            ],
        },
        'Buildings': {
            content: [
                () => {
                    const speed = D.times(layers.clo.time_speed('c'), layers.tic.time_speed('c'));

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                () => {
                    if (hasUpgrade('c', 51)) {
                        const gain = tmp.c.resources.energy.gain;

                        let gain_str = '';
                        if (D.abs(gain).gt(1e-4)) gain_str = ` (<span style="color:${tmp.c.resources.energy.color};">${(gain.gt(0) ? '+' : '') + format(gain)}</span> /s)`;

                        return ['column', [
                            [
                                'display-text',
                                `You have <span style="color:${tmp.c.resources.energy.color};font-size:1.5em;">\
                                ${format(player.c.resources.energy.amount)}\
                                </span>\
                                ${gain_str}\
                                ${tmp.c.resources.energy.name}`,
                            ],
                            'blank',
                        ]]
                    };
                },
                //todo convert to layer-table
                ['column', () => Object.keys(layers.c.buildings).map(id => show_building(id))],
            ],
        },
        'Research': {
            content: [
                [
                    'display-text',
                    () => {
                        const gain = tmp.c.resources.science.gain;

                        let gain_str = '';
                        if (D.abs(gain).gt(1e-4)) gain_str = ` (<span style="color:${tmp.c.resources.science.color};">${(gain.gt(0) ? '+' : '') + format(gain)}</span> /s)`;

                        return `You have <span style="color:${tmp.c.resources.science.color};font-size:1.5em;">${format(player.c.resources.science.amount)}</span>${gain_str} ${tmp.c.resources.science.name}`;
                    }
                ],
                ['row', [
                    ['display-text', 'Automatically research'],
                    'blank',
                    ['toggle', ['c', 'auto_research']]
                ]],
                'blank',
                ['upgrade-tree', [
                    [11],
                    [21, 22, 23],
                    [31, 32, 33],
                    [41, 42, 43],
                    [51],
                    [61, 62, 63, 64],
                    [71, 72, 73, 74],
                    [81, 82, 83, 84],
                    [91],
                ]],
            ],
            unlocked() { return D.gt(player.c.resources.science.amount, 0) || player.c.upgrades.length > 0; },
            buttonStyle() {
                // If you figure out why shouldNotify does nothing when it returns true, I'll use it again.
                // Until then, it's done manually
                const style = {
                    'border-color': tmp.c.resources.science.color,
                };
                if (canAffordLayerUpgrade('c')) style['box-shadow'] = 'var(--hqProperty2a), 0 0 20px #ff0000';
                return style;
            },
        },
    },
    grid: {
        cols() {
            let cols = 5;

            if (hasUpgrade('c', 41)) cols += upgradeEffect('c', 41);
            if (hasUpgrade('c', 82)) cols += upgradeEffect('c', 82);

            return cols;
        },
        maxCols: 7,
        rows() {
            let rows = 5;

            if (hasUpgrade('c', 42)) rows += upgradeEffect('c', 42);
            if (hasUpgrade('c', 81)) rows += upgradeEffect('c', 81);

            return rows;
        },
        maxRows: 7,
        getStartData(_) { return {}; },
        getCanClick(_, id) {
            const data = (player.c.floors[player.c.floor] ??= {})[id] ??= {
                building: '',
                enabled: true,
            };
            switch (player.c.mode) {
                case 'place':
                    return data.building == '' &&
                        player.c.building != '' &&
                        D.gte(getBuyableAmount('c', player.c.building), D.add(tmp.c.buildings['*'].placed[player.c.building], 1));
                case 'destroy':
                case 'toggle':
                    return data.building != '';
            }
        },
        onClick(_, id) {
            const data = (player.c.floors[player.c.floor] ??= {})[id] ??= {
                building: '',
                enabled: true,
            };
            switch (player.c.mode) {
                case 'place':
                    if (
                        data.building == '' &&
                        player.c.building != '' &&
                        D.gte(getBuyableAmount('c', player.c.building), D.add(tmp.c.buildings['*'].placed[player.c.building], 1))
                    ) {
                        data.building = player.c.building;
                        if (D.lt(getBuyableAmount('c', player.c.building), D.add(tmp.c.buildings['*'].placed[player.c.building], 2))) player.c.building = '';
                    }
                    return;
                case 'destroy':
                    if (data.building != '') data.building = '';
                    return;
                case 'toggle':
                    data.enabled = !data.enabled;
                    return;
            }
        },
        getStyle(_, id) {
            const data = (player.c.floors[player.c.floor] ??= {})[id];
            if (!(data?.building in tmp.c.buildings)) return {};

            const building = tmp.c.buildings[data.building];

            return Object.assign(
                {
                    'font-size': '1em',
                }, // Ensures that general style is not overwritten
                building.style.general,
                building.style.grid ?? {},
            );
        },
        getTooltip(_, id) {
            const data = (player.c.floors[player.c.floor] ??= {})[id] ??= {
                building: '',
                enabled: true,
            };
            if (data?.building in tmp.c.buildings) return capitalize(tmp.c.buildings[data.building].name);
            return 'Empty';
        },
        getDisplay(_, id) {
            const data = (player.c.floors[player.c.floor] ??= {})[id];
            if (data?.building in tmp.c.buildings) return data.enabled ? 'ON' : 'OFF';
        },
    },
    upgrades: {
        11: {
            title: 'Improved Making',
            description: '+10% item production and consumption',
            effect() { return D(1.1); },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id).minus(1).times(100))}%`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs: [['science', D(1)]],
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => gain_items(item, D.neg(cost)));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => gain_resource(resource, D.neg(cost)));
            },
        },
        21: {
            title: 'Deeper Digging',
            description: '+50% quarry and mine productions',
            effect() { return D(1.5); },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id).minus(1).times(100))}%`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs() { return [['science', D(1).times([21, 22, 23].filter(id => hasUpgrade('c', id)).length + 1)]]; },
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 11) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => gain_items(item, D.neg(cost)));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => gain_resource(resource, D.neg(cost)));
            },
            branches: [11],
        },
        22: {
            title: 'Lighter Wood',
            description: '+50% forest and sawmill productions and consumptions',
            effect() { return D(1.5); },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id).minus(1).times(100))}%`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs() { return [['science', D(1).times([21, 22, 23].filter(id => hasUpgrade('c', id)).length + 1)]]; },
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 11) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => gain_items(item, D.neg(cost)));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => gain_resource(resource, D.neg(cost)));
            },
            branches: [11],
        },
        23: {
            title: 'Leather Gloves',
            description: '+50% taming progress',
            effect() { return D(1.5); },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id).minus(1).times(100))}%`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs() { return [['science', D(1).times([21, 22, 23].filter(id => hasUpgrade('c', id)).length + 1)]]; },
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 11) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => gain_items(item, D.neg(cost)));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => gain_resource(resource, D.neg(cost)));
            },
            branches: [11],
            unlocked() { return player.xp_alt.unlocked; },
        },
        31: {
            title: 'Cheaper Beams',
            description: '-25% quarry and mine costs',
            effect() { return D(.75); },
            effectDisplay() { return `-${format(D.minus(1, upgradeEffect(this.layer, this.id)).times(100))}%`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs() { return [['science', D(2).times([31, 32, 33].filter(id => hasUpgrade('c', id)).length + 1)]]; },
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 21) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => gain_items(item, D.neg(cost)));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => gain_resource(resource, D.neg(cost)));
            },
            branches: [21],
        },
        32: {
            title: 'Harder Wood',
            description: '-25% forest and sawmill costs',
            effect() { return D(.75); },
            effectDisplay() { return `-${format(D.minus(1, upgradeEffect(this.layer, this.id)).times(100))}%`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs() { return [['science', D(2).times([31, 32, 33].filter(id => hasUpgrade('c', id)).length + 1)]]; },
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 22) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => gain_items(item, D.neg(cost)));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => gain_resource(resource, D.neg(cost)));
            },
            branches: [22],
        },
        33: {
            title: 'Pet House',
            description: '+33% experience gain',
            effect() { return D(4 / 3); },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id).minus(1).times(100))}%`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs() { return [['science', D(2).times([31, 32, 33].filter(id => hasUpgrade('c', id)).length + 1)]]; },
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 23) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => gain_items(item, D.neg(cost)));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => gain_resource(resource, D.neg(cost)));
            },
            branches: [23],
            unlocked() { return player.xp_alt.unlocked; },
        },
        41: {
            title: 'Stone Foundations',
            description: '+1 city columns',
            effect() { return 1; },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id))}`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs() { return [['science', D(4).times([41, 42, 43].filter(id => hasUpgrade('c', id)).length + 1)]]; },
            item_costs: [['stone', D(50)], ['copper_ore', 25], ['tin_ore', 12.5]],
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 31) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => gain_items(item, D.neg(cost)));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => gain_resource(resource, D.neg(cost)));
            },
            branches: [31],
        },
        42: {
            title: 'Wood Palisade',
            description: '+1 city rows',
            effect() { return 1; },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id))}`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs() { return [['science', D(4).times([41, 42, 43].filter(id => hasUpgrade('c', id)).length + 1)]]; },
            item_costs: [['normal_log', D(50)], ['plank', 25]],
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 32) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => gain_items(item, D.neg(cost)));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => gain_resource(resource, D.neg(cost)));
            },
            branches: [32],
        },
        43: {
            title: 'Token Trap',
            description() { return `${layerColor('xp_alt', tmp.xp_alt.upgrades[22].title)} can catch goblins`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs() { return [['science', D(4).times([41, 42, 43].filter(id => hasUpgrade('c', id)).length + 1)]]; },
            item_costs: [['pyrite_coin', D(10)]],
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 33) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => gain_items(item, D.neg(cost)));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => gain_resource(resource, D.neg(cost)));
            },
            branches: [33],
            unlocked() { return player.xp_alt.unlocked; },
        },
        51: {
            title: 'Improved Blueprints',
            description() {
                let text = '+20% production and consumption<br>Unlock a new set of buildings';
                if (tmp.lo.layerShown) text += '<br>Counts as an anvil';
                return text;
            },
            effect() { return D(1.2); },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id).minus(1).times(100))}%`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs: [['science', D(15)]],
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return [41, 42, 43].filter(id => hasUpgrade('c', id)).length >= 2 &&
                    (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => gain_items(item, D.neg(cost)));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => gain_resource(resource, D.neg(cost)));
            },
            branches: [41, 42, 43],
        },
        61: {
            title: 'Richer Ground',
            description: '+100% quarry and forest productions',
            effect() { return D(2.0); },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id).minus(1).times(100))}%`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs() { return [['science', D(2).pow([61, 62, 63, 64].filter(id => hasUpgrade('c', id)).length).times(20)]]; },
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 51) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => gain_items(item, D.neg(cost)));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => gain_resource(resource, D.neg(cost)));
            },
            branches: [51],
            unlocked() { return hasUpgrade('c', 51); },
        },
        62: {
            title: 'Metal Recycling',
            description: '+100% mine and sawmill productions and consumptions',
            effect() { return D(2.0); },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id).minus(1).times(100))}%`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs() { return [['science', D(2).pow([61, 62, 63, 64].filter(id => hasUpgrade('c', id)).length).times(20)]]; },
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 51) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => gain_items(item, D.neg(cost)));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => gain_resource(resource, D.neg(cost)));
            },
            branches: [51],
            unlocked() { return hasUpgrade('c', 51); },
        },
        63: {
            title: 'Warmer Coal',
            description: '+50% deep mine and coal generator productions and consumptions',
            effect() { return D(1.5); },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id).minus(1).times(100))}%`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs() { return [['science', D(2).pow([61, 62, 63, 64].filter(id => hasUpgrade('c', id)).length).times(20)]]; },
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 51) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => gain_items(item, D.neg(cost)));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => gain_resource(resource, D.neg(cost)));
            },
            branches: [51],
            unlocked() { return hasUpgrade('c', 51); },
        },
        64: {
            title: 'Sickle',
            description: '+50% plant harvest items',
            effect() { return D(1.5); },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id).minus(1).times(100))}%`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs() { return [['science', D(2).pow([61, 62, 63, 64].filter(id => hasUpgrade('c', id)).length).times(20)]]; },
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 51) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => gain_items(item, D.neg(cost)));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => gain_resource(resource, D.neg(cost)));
            },
            branches: [51],
            unlocked() { return hasUpgrade('c', 51) && player.p.unlocked; },
        },
        71: {
            title: 'Root Strengthening',
            description() {
                if (!shiftDown) {
                    return 'Bought quarries and forests boost each other\'s productions';
                }
                let formula_forest = '2√(quarries + 1)',
                    formula_quarry = '2√(forests + 1)';

                return `Quarry formula: ${formula_quarry}, forest formula: ${formula_forest}`;
            },
            effect() {
                let forest = getBuyableAmount('c', 'quarry').add(1).root(2),
                    quarry = getBuyableAmount('c', 'forest').add(1).root(2);

                return { quarry, forest, };
            },
            effectDisplay() {
                /** @type {{quarry: Decimal, forest: Decimal}} */
                const effect = upgradeEffect(this.layer, this.id);
                return `*${format(effect.forest)} quarry production, *${format(effect.quarry)} forest production`;
            },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs() { return [['science', D(2).pow([71, 72, 73, 74].filter(id => hasUpgrade('c', id)).length).times(30)]]; },
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 61) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => gain_items(item, D.neg(cost)));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => gain_resource(resource, D.neg(cost)));
            },
            branches: [61],
            unlocked() { return hasUpgrade('c', 51); },
        },
        72: {
            title: 'Metal Recycling',
            description() {
                if (!shiftDown) {
                    return 'Bought mines and sawmills boost each other\'s productions and consumptions';
                }
                let formula_sawmill = '3√(mines + 1)',
                    formula_mine = '3√(sawmills + 1)';

                return `Mine formula: ${formula_mine}, sawmill formula: ${formula_sawmill}`;
            },
            effect() {
                let sawmill = getBuyableAmount('c', 'mine').add(1).root(3),
                    mine = getBuyableAmount('c', 'sawmill').add(1).root(3);

                return { mine, sawmill, };
            },
            effectDisplay() {
                /** @type {{mine: Decimal, sawmill: Decimal}} */
                const effect = upgradeEffect(this.layer, this.id);
                return `*${format(effect.sawmill)} quarry production, *${format(effect.mine)} forest production`;
            },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs() { return [['science', D(2).pow([71, 72, 73, 74].filter(id => hasUpgrade('c', id)).length).times(30)]]; },
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 62) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => gain_items(item, D.neg(cost)));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => gain_resource(resource, D.neg(cost)));
            },
            branches: [62],
            unlocked() { return hasUpgrade('c', 51); },
        },
        73: {
            title: 'Improved Structural Beams',
            description: '-25% deep mine and coal generator costs',
            effect() { return D(.75); },
            effectDisplay() { return `-${format(D.minus(1, upgradeEffect(this.layer, this.id)).times(100))}%`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs() { return [['science', D(2).pow([71, 72, 73, 74].filter(id => hasUpgrade('c', id)).length).times(30)]]; },
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 63) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => gain_items(item, D.neg(cost)));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => gain_resource(resource, D.neg(cost)));
            },
            branches: [63],
            unlocked() { return hasUpgrade('c', 51); },
        },
        74: {
            title: 'Greenhouse',
            description: '+10% plant grow speed',
            effect() { return D(1.1); },
            effectDisplay() { return `+${format(D.minus(upgradeEffect(this.layer, this.id), 1).times(100))}%`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs() { return [['science', D(2).pow([71, 72, 73, 74].filter(id => hasUpgrade('c', id)).length).times(30)]]; },
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 64) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => gain_items(item, D.neg(cost)));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => gain_resource(resource, D.neg(cost)));
            },
            branches: [64],
            unlocked() { return hasUpgrade('c', 51) && player.p.unlocked; },
        },
        81: {
            title: 'Terrain Expansion',
            description: '+1 city rows',
            effect() { return 1; },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id))}`; },
            resource_costs() { return [['science', D(2).pow([81, 82, 83, 84].filter(id => hasUpgrade('c', id)).length).times(50)]]; },
            item_costs: [['stone', D(150)], ['normal_log', 150]],
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 71) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => gain_items(item, D.neg(cost)));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => gain_resource(resource, D.neg(cost)));
            },
            branches: [71],
            unlocked() { return hasUpgrade('c', 51); },
        },
        82: {
            title: 'Reinforced Foundations',
            description: '+1 city columns',
            effect() { return 1; },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id))}`; },
            resource_costs() { return [['science', D(2).pow([81, 82, 83, 84].filter(id => hasUpgrade('c', id)).length).times(50)]]; },
            item_costs: [['plank', D(150)], ['copper_ore', 150], ['tin_ore', 75]],
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 72) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => gain_items(item, D.neg(cost)));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => gain_resource(resource, D.neg(cost)));
            },
            branches: [72],
            unlocked() { return hasUpgrade('c', 51); },
        },
        83: {
            title: 'Reduced Item Usage',
            description: '-25% building consumption',
            effect() { return D(.75); },
            effectDisplay() { return `-${format(D.minus(1, upgradeEffect(this.layer, this.id)).times(100))}%`; },
            resource_costs() { return [['science', D(2).pow([81, 82, 83, 84].filter(id => hasUpgrade('c', id)).length).times(50)]]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 73) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => gain_items(item, D.neg(cost)));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => gain_resource(resource, D.neg(cost)));
            },
            branches: [73],
            unlocked() { return hasUpgrade('c', 51); },
        },
        84: {
            title: 'Bigger Garden',
            description: '+1 garden columns',
            effect() { return 1; },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id))}`; },
            resource_costs() { return [['science', D(2).pow([81, 82, 83, 84].filter(id => hasUpgrade('c', id)).length).times(50)]]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return hasUpgrade('c', 74) && (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                    .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => gain_items(item, D.neg(cost)));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => gain_resource(resource, D.neg(cost)));
            },
            branches: [74],
            unlocked() { return hasUpgrade('c', 51) && player.p.unlocked; },
        },
        91: {
            title: 'Reimproved Blueprints',
            description() {
                if (!shiftDown) {
                    return 'Science reduces buildings consumption and boosts buildings production';
                }
                let formula = '1.1 ^ log10(science + 10)';

                return `Formula: ${formula}`;
            },
            effect() { return D.pow(1.1, player.c.resources.science.amount.max(0).add(10).log10()); },
            effectDisplay() { return `/${format(upgradeEffect(this.layer, this.id))}`; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    let color;
                    const tmphis = tmp[this.layer].upgrades[+this.id];

                    if (Array.isArray(tmphis.resource_costs) &&
                        tmphis.resource_costs.length > 0) {
                        color = tmp.c.resources[tmphis.resource_costs[0][0]].color;
                    } else {
                        color = tmp.c.color;
                    }

                    style['background-color'] = color;
                }

                return style;
            },
            resource_costs: [['science', D(1e3)]],
            costDisplay() {
                /** @type {string[]} */
                const cost_pieces = [
                    ...(tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .map(([item, cost]) => `${formatWhole(cost)} ${tmp.lo.items[item].name}`),
                    ...(tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .map(([resource, cost]) => `${formatWhole(cost)} ${tmp.c.resources[resource].name}`),
                ];

                return `Cost: ${listFormat.format(cost_pieces)}`;
            },
            canAfford() {
                return [81, 82, 83].filter(id => hasUpgrade('c', id)).length >= 3 &&
                    (tmp[this.layer].upgrades[this.id].item_costs ?? [])
                        .every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)) &&
                    (tmp[this.layer].upgrades[this.id].resource_costs ?? [])
                        .every(([resource, cost]) => D.gte(player.c.resources[resource].amount, cost));
            },
            pay() {
                (tmp[this.layer].upgrades[+this.id].item_costs ?? [])
                    .forEach(([item, cost]) => gain_items(item, D.neg(cost)));
                (tmp[this.layer].upgrades[+this.id].resource_costs ?? [])
                    .forEach(([resource, cost]) => gain_resource(resource, D.neg(cost)));
            },
            branches: [81, 82, 83, 84],
            unlocked() { return hasUpgrade('c', 51); },
        },
        /*
        TODO
        101-121: boost deep mine/coal generator
        102-122: boost research center/observatory
        103-123: boost smelter/arc furnace
        104-124: boost ???
        105-125: boost ???
        131: boost ???
        */
    },
    buyables: new Proxy({}, {
        /** @returns {Buyable<'c'>} */
        get(obj, prop) {
            // Required to not break the auto stuff
            if (prop == 'constructor') return obj.constructor;
            if (prop == 'layer') return 'c';

            if (prop in obj) return obj[prop];

            if (prop in layers.c.buildings && prop != '*') {
                const tmpuilding = () => tmp.c.buildings[prop];

                return obj[prop] ??= {
                    title() { return capitalize(tmpuilding().name); },
                    display() {
                        const cost = listFormat.format(tmpuilding().cost.map(([item, cost]) => {
                            let c;
                            if (shiftDown) c = `[${tmpuilding().formulas.cost.find(([i]) => i == item)[1]}]`;
                            else c = `${format(player.lo.items[item].amount)}/${format(cost)}`;

                            return `${c} ${tmp.lo.items[item].name}`;
                        }));

                        return `Cost: ${cost}`;
                    },
                    cost(x) { return layers.c.buildings[prop].cost(x); },
                    unlocked() { return tmpuilding().unlocked ?? true; },
                    canAfford() { return Array.isArray(tmpuilding().cost) && tmpuilding().cost.every(([item, cost]) => D.gte(player.lo.items[item].amount, cost)); },
                    buy() {
                        tmpuilding().cost.forEach(([item, cost]) => gain_items(item, D.neg(cost)));
                        addBuyables(this.layer, this.id, 1);
                    },
                    style() {
                        const style = {
                            'height': '120px',
                            'width': '120px',
                            'min-height': 'unset',
                        },
                            cant = {
                                'background': '#bf8f8f',
                                'cursor': 'not-allowed',
                            };

                        return Object.assign(
                            style,
                            tmpuilding().style.general,
                            tmpuilding().style.buyable ?? {},
                            canBuyBuyable(this.layer, this.id) ? {} : cant,
                        );
                    },
                };
            }
        },
        getOwnPropertyDescriptor(_, prop) {
            if (prop == 'layer' || prop in layers.c.buildings) return {
                enumerable: true,
                configurable: true,
            };
        },
        has(_, prop) { return prop in layers.c.buildings; },
        ownKeys(_) { return Object.keys(layers.c.buildings).filter(id => id != '*'); },
    }),
    clickables: new Proxy({}, {
        /** @returns {Clickable<'c'>} */
        get(obj, prop) {
            // Required to not break the auto stuff
            if (prop == 'constructor') return obj.constructor;
            if (prop == 'layer') return 'c';

            if (prop in obj) return obj[prop];

            if (prop == 'place') {
                return obj[prop] ??= {
                    display: 'Set current mode to place buildings',
                    canClick() { return player.c.mode != 'place'; },
                    onClick() { player.c.mode = 'place'; },
                };
            }
            if (prop == 'destroy') {
                return obj[prop] ??= {
                    display: 'Set current mode to destroy buildings',
                    canClick() { return player.c.mode != 'destroy'; },
                    onClick() { player.c.mode = 'destroy'; },
                };
            }
            if (prop == 'toggle') {
                return obj[prop] ??= {
                    display: 'Set current mode to toggle buildings',
                    canClick() { return player.c.mode != 'toggle'; },
                    onClick() { player.c.mode = 'toggle'; },
                };
            }
            if (prop == 'up') {
                return {
                    style: {
                        'background-image': `url('./resources/images/previous-button.svg')`,
                        'transform': 'rotate(90deg)',
                    },
                    canClick() { return player.c.floor < tmp.c.floors.max; },
                    onClick() {
                        player.c.floor++;
                        if (typeof player.c.floors[player.c.floor] !== 'object') player.c.floors[player.c.floor] = {};
                    },
                    unlocked() { return tmp.c.floors.max > 0; },
                };
            }
            if (prop == 'down') {
                return {
                    style: {
                        'background-image': `url('./resources/images/previous-button.svg')`,
                        'transform': 'rotate(-90deg)',
                    },
                    canClick() { return player.c.floor > 0; },
                    onClick() { player.c.floor--; },
                    unlocked() { return tmp.c.floors.max > 0; },
                };
            }

            const matches = layers.c.buildings['*'].regex.exec(prop);
            if (matches) {
                /** @type {[string, 'select'|'quick', string]} */
                const [, type, building] = matches;

                return obj[prop] ??= {
                    canClick() { return D.gte(getBuyableAmount('c', building), D.add(tmp.c.buildings['*'].placed[building], 1)); },
                    onClick() {
                        if (player.c.building == building) player.c.building = '';
                        else player.c.building = building;
                    },
                    display() {
                        switch (type) {
                            case 'select':
                                const select = player.c.building == building ? 'Selected' : 'Select';
                                return `${select} ${tmp.c.buildings[building].name}`;
                            case 'quick':
                                const placed = tmp.c.buildings['*'].placed[building] ?? D.dZero,
                                    total = getBuyableAmount('c', building);
                                return `${capitalize(tmp.c.buildings[building].name)}<br>${formatWhole(placed)} / ${formatWhole(total)}`;
                        }
                    },
                    style() {
                        let base = {},
                            add = {};
                        const cant = {};

                        if (type == 'quick') {
                            base = {
                                'height': '80px',
                                'width': '80px',
                                'min-height': 'unset',
                            };
                            add = tmp.c.buildings[building].style.grid;
                        }
                        if (player.c.building == building) base['box-shadow'] = `${tmp.c.color} 0 0 20px`;
                        if (!tmp[this.layer].clickables[this.id].canClick) {
                            cant['background'] = '#bf8f8f';
                            cant['cursor'] = 'not-allowed';
                        }

                        return Object.assign(
                            base,
                            tmp.c.buildings[building].style.general,
                            tmp.c.buildings[building].style.select,
                            add,
                            cant,
                        );
                    },
                    unlocked: true,
                };
            }
        },
        getOwnPropertyDescriptor(_, prop) {
            if (prop == 'layer' ||
                layers.c.buildings['*'].regex.exec(prop) ||
                ['place', 'destroy', 'toggle', 'up', 'down'].includes(prop)) return {
                    enumerable: true,
                    configurable: true,
                };
        },
        has(_, prop) {
            return layers.c.buildings['*'].regex.exec(prop) ||
                ['place', 'destroy', 'toggle', 'up', 'down'].includes(prop);
        },
        ownKeys(_) {
            return [
                'place',
                'destroy',
                'toggle',
                'up',
                'down',
                ...Object.keys(layers.c.buildings).map(id => [`select_${id}`, `quick_${id}`]).flat(),
            ];
        },
    }),
    buildings: {
        '*': {
            regex: /^(select|quick)_([a-z_]+)$/,
            placed() {
                return player.c.floors.reduce(
                    /** @param {{[building: string]: Decimal}} full */
                    (full, grid) => {
                        return Object.entries(grid)
                            .reduce((sum, [id, data]) => {
                                // Check if id is in the grid
                                if (
                                    Math.floor(id / 100) <= tmp.c.grid.rows &&
                                    id % 100 <= tmp.c.grid.cols
                                ) sum[data.building] = D.add(sum[data.building], 1);
                                return sum;
                            }, full);
                    }, {});
            },
            enabled() {
                return player.c.floors.reduce(
                    /** @param {{[building: string]: Decimal}} full */
                    (full, grid) => {
                        return Object.entries(grid)
                            .reduce((sum, [id, data]) => {
                                // Check if id is in the grid
                                if (
                                    Math.floor(id / 100) <= tmp.c.grid.rows &&
                                    id % 100 <= tmp.c.grid.cols &&
                                    // Check if building is turned on
                                    data.enabled
                                ) sum[data.building] = D.add(sum[data.building], 1);
                                return sum;
                            }, full);
                    }, {});
            },
            description(building_id, effect = '') {
                if (!building_id) return '';

                const building = tmp.c.buildings[building_id],
                    placed = tmp.c.buildings['*'].placed[building_id] ?? D.dZero,
                    total = getBuyableAmount('c', building_id),
                    /** @type {string[]} */
                    production_parts = [],
                    produces = building.produces ?? {},
                    /** @type {string[]} */
                    consumption_parts = [],
                    consumes = building.consumes ?? {},
                    bonus = D(tmp.c.buildings.duplicator.effect[building_id]),
                    bonus_text = bonus.gt(0) ? ` (+${format(bonus)})` : '';

                if ('items' in produces) {
                    production_parts.push(
                        ...produces.items
                            .map(([item, amount]) => `+${format(amount)} ${tmp.lo.items[item].name}`)
                    );
                }
                if ('resources' in produces) {
                    production_parts.push(
                        ...produces.resources
                            .map(([resource, amount]) => `<span style="color:${tmp.c.resources[resource].color};">+${format(amount)}</span> ${tmp.c.resources[resource].name}`)
                    );
                }

                if ('items' in consumes) {
                    consumption_parts.push(
                        ...consumes.items
                            .map(([item, amount]) => `-${format(amount)} ${tmp.lo.items[item].name}`)
                    );
                }
                if ('resources' in consumes) {
                    consumption_parts.push(
                        ...consumes.resources
                            .map(([resource, amount]) => `<span style="color:${tmp.c.resources[resource].color};">-${format(amount)}</span> ${tmp.c.resources[resource].name}`)
                    );
                }

                const produce_text = production_parts.length > 0 ? `They produce ${listFormat.format(production_parts)} /s<br>` : '',
                    consume_text = consumption_parts.length > 0 ? `They consume ${listFormat.format(consumption_parts)} /s<br>` : '';

                if (effect.length) effect += '<br>';

                return `You have ${formatWhole(placed)}${bonus_text} / ${formatWhole(total)} ${building.name}<br>\
                    ${effect}\
                    ${consume_text}\
                    ${produce_text}`;
            },
            produce_mult() {
                let mult = D.dOne;

                if (hasUpgrade('c', 51)) mult = mult.times(upgradeEffect('c', 51));
                if (hasUpgrade('c', 91)) mult = mult.times(upgradeEffect('c', 91));

                if (tmp.bin.layerShown) mult = mult.times(tmp.bin.cards.multipliers['c'] ?? 1);

                mult = mult.times(tmp.k.dishes.failure.effect);
                mult = mult.times(tmp.k.dishes.bread.effect);

                return mult;
            },
            item_produce_mult() {
                let mult = D.dOne;

                if (hasUpgrade('c', 11)) mult = mult.times(upgradeEffect('c', 11));

                return mult;
            },
            consume_mult() {
                let mult = D.dOne;

                if (hasUpgrade('c', 51)) mult = mult.times(upgradeEffect('c', 51));
                if (hasUpgrade('c', 83)) mult = mult.times(upgradeEffect('c', 83));
                if (hasUpgrade('c', 91)) mult = mult.div(upgradeEffect('c', 91));

                if (tmp.bin.layerShown) mult = mult.times(tmp.bin.cards.multipliers['c'] ?? 1);

                mult = mult.times(tmp.k.dishes.failure.effect);
                mult = mult.times(tmp.k.dishes.bread.effect);
                mult = mult.div(tmp.k.dishes.french_fries.effect);

                return mult;
            },
            item_consume_mult() {
                let mult = D.dOne;

                if (hasUpgrade('c', 11)) mult = mult.times(upgradeEffect('c', 11));

                return mult;
            },
            cost_mult() { return D.dOne; },
        },
        // T0
        quarry: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.buildings).find(item => layers.c.buildings[item] == this); },
            name: 'stone quarry',
            description() { return layers.c.buildings['*'].description(this.id); },
            style: {
                general: {
                    'background-color'() { return tmp.lo.items.stone.style['background-color']; },
                },
                grid: {
                    'background-image'() { return tmp.lo.items.stone.style['background-image']; },
                },
            },
            produces(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[string, Decimal][]} */
                const items = [['stone', D(1 / 3)]];

                items.forEach(([item, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].produce_mult).times(tmp.c.buildings['*'].item_produce_mult);

                    if (hasUpgrade('c', 21)) mult = mult.times(upgradeEffect('c', 21));
                    if (hasUpgrade('c', 61)) mult = mult.times(upgradeEffect('c', 61));
                    if (hasUpgrade('c', 71)) mult = mult.times(upgradeEffect('c', 71).quarry);

                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;
                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount.max(0), 10).log10().pow(tmp.a.change_efficiency));
                    }

                    items[i][1] = D.times(amount, mult);
                });

                return {
                    items,
                };
            },
            cost(amount_built) {
                const built = D(amount_built ?? getBuyableAmount('c', this.id));

                /** @type {[string, Decimal][]} */
                const cost = [
                    ['stone', D.pow(built, 1.1).times(10)],
                ];

                cost.forEach(([, amount], i) => {
                    let mult = tmp.c.buildings['*'].cost_mult;

                    if (hasUpgrade('c', 31)) mult = mult.times(upgradeEffect('c', 31));

                    cost[i][1] = D.times(amount, mult);
                });

                return cost;
            },
            formulas: {
                cost: [['stone', '(built ^ 1.1) * 10']],
            },
        },
        mine: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.buildings).find(item => layers.c.buildings[item] == this); },
            name: 'mine',
            description() { return layers.c.buildings['*'].description(this.id); },
            style: {
                general: {
                    'background-image'() {
                        return `linear-gradient(to right, ${tmp.lo.items.copper_ore.style['background-color']},\
                        ${tmp.lo.items.tin_ore.style['background-color']})`;
                    },
                    'background-origin': 'border-box',
                },
                grid: {
                    'background-image'() {
                        return `url('./resources/images/ore.svg'), linear-gradient(to right, ${tmp.lo.items.copper_ore.style['background-color']},\
                        ${tmp.lo.items.tin_ore.style['background-color']})`;
                    },
                },
            },
            produces(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[string, Decimal][]} */
                const items = [['copper_ore', D(1 / 7)], ['tin_ore', D(1 / 28)]];

                items.forEach(([item, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].produce_mult).times(tmp.c.buildings['*'].item_produce_mult);

                    if (hasUpgrade('c', 21)) mult = mult.times(upgradeEffect('c', 21));
                    if (hasUpgrade('c', 62)) mult = mult.times(upgradeEffect('c', 62));
                    if (hasUpgrade('c', 72)) mult = mult.times(upgradeEffect('c', 72).mine);

                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;
                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount.max(0), 10).log10().pow(tmp.a.change_efficiency));
                    }

                    mult = mult.times(buyableEffect('fr', 13));

                    items[i][1] = D.times(amount, mult);
                });

                return {
                    items,
                };
            },
            cost(amount_built) {
                const built = D(amount_built ?? getBuyableAmount('c', this.id));

                /** @type {[string, Decimal][]} */
                const cost = [
                    ['stone', D.pow(1.5, built).times(15)],
                    ['plank', D.pow(1.25, built).times(50)],
                ];

                cost.forEach(([, amount], i) => {
                    let mult = tmp.c.buildings['*'].cost_mult;

                    if (hasUpgrade('c', 31)) mult = mult.times(upgradeEffect('c', 31));

                    cost[i][1] = D.times(amount, mult);
                });

                return cost;
            },
            formulas: {
                cost: [['stone', '(1.5 ^ built) * 10'], ['plank', '(1.5 ^ built) * 50']],
            },
        },
        forest: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.buildings).find(item => layers.c.buildings[item] == this); },
            name: 'forest',
            description() { return layers.c.buildings['*'].description(this.id); },
            style: {
                general: {
                    'background-color'() { return tmp.lo.items.normal_log.style['background-color']; },
                },
                grid: {
                    'background-image'() { return tmp.lo.items.normal_log.style['background-image']; },
                },
            },
            produces(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[string, Decimal][]} */
                const items = [['normal_log', D(1 / 2)]];

                items.forEach(([item, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].produce_mult).times(tmp.c.buildings['*'].item_produce_mult);

                    if (hasUpgrade('c', 22)) mult = mult.times(upgradeEffect('c', 22));
                    if (hasUpgrade('c', 61)) mult = mult.times(upgradeEffect('c', 61));
                    if (hasUpgrade('c', 71)) mult = mult.times(upgradeEffect('c', 71).forest);

                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;

                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount.max(0), 10).log10().pow(tmp.a.change_efficiency));
                    }

                    items[i][1] = D.times(amount, mult);
                });

                return {
                    items,
                };
            },
            cost(amount_built) {
                const built = D(amount_built ?? getBuyableAmount('c', this.id));

                /** @type {[string, Decimal][]} */
                const cost = [
                    ['normal_log', D.pow(built, 1.2).times(20)],
                ];

                cost.forEach(([, amount], i) => {
                    let mult = tmp.c.buildings['*'].cost_mult;

                    if (hasUpgrade('c', 32)) mult = mult.times(upgradeEffect('c', 32));

                    cost[i][1] = D.times(amount, mult);
                });

                return cost;
            },
            formulas: {
                cost: [['normal_log', '(built ^ 1.2) * 20']],
            },
        },
        sawmill: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.buildings).find(item => layers.c.buildings[item] == this); },
            name: 'sawmill',
            description() { return layers.c.buildings['*'].description(this.id); },
            style: {
                general: {
                    'background-color'() { return tmp.lo.items.plank.style['background-color']; },
                },
                grid: {
                    'background-image'() { return tmp.lo.items.plank.style['background-image']; },
                },
            },
            produces(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[string, Decimal][]} */
                const items = [['plank', D(1 / 4)]];

                items.forEach(([item, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].produce_mult).times(tmp.c.buildings['*'].item_produce_mult);

                    if (hasUpgrade('c', 22)) mult = mult.times(upgradeEffect('c', 22));
                    if (hasUpgrade('c', 62)) mult = mult.times(upgradeEffect('c', 62));
                    if (hasUpgrade('c', 72)) mult = mult.times(upgradeEffect('c', 72).sawmill);

                    if (item == 'plank') {
                        mult = mult.times(D.add(1, D.pow(buyableEffect('lo', 63).plank, tmp.a.change_efficiency)));

                        if (inChallenge('b', 22)) mult = mult.times(D.pow(1 / 2, tmp.a.change_efficiency));
                    }

                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;

                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount.max(0), 10).log10().pow(tmp.a.change_efficiency));
                    }

                    items[i][1] = D.times(amount, mult);
                });

                return {
                    items,
                };
            },
            consumes(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[string, Decimal][]} */
                const items = [['normal_log', D(1 / 4)]];

                items.forEach(([, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].consume_mult).times(tmp.c.buildings['*'].item_consume_mult);

                    if (hasUpgrade('c', 22)) mult = mult.times(upgradeEffect('c', 22));
                    if (hasUpgrade('c', 62)) mult = mult.times(upgradeEffect('c', 62));
                    if (hasUpgrade('c', 72)) mult = mult.times(upgradeEffect('c', 72).sawmill);

                    items[i][1] = D.times(amount, mult);
                });

                return {
                    items,
                };
            },
            cost(amount_built) {
                const built = D(amount_built ?? getBuyableAmount('c', this.id));

                /** @type {[string, Decimal][]} */
                const cost = [
                    ['normal_log', D.pow(1.2, built).times(20)],
                    ['stone', D.pow(1.3, built).times(10)],
                ];

                cost.forEach(([, amount], i) => {
                    let mult = tmp.c.buildings['*'].cost_mult;

                    if (hasUpgrade('c', 32)) mult = mult.times(upgradeEffect('c', 32));

                    cost[i][1] = D.times(amount, mult);
                });

                return cost;
            },
            formulas: {
                cost: [['normal_log', '(1.2 ^ built) * 20'], ['stone', '(1.3 ^ built) * 10']],
            },
        },
        research_center: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.buildings).find(item => layers.c.buildings[item] == this); },
            name: 'research center',
            description() { return layers.c.buildings['*'].description(this.id); },
            style: {
                general: {
                    'background-color'() { return tmp.c.resources.science.color; },
                },
                grid: {
                    'background-image': `url('./resources/images/erlenmeyer.svg')`,
                },
            },
            produces(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[keyof typeof player.c.resources, Decimal][]} */
                const resources = [['science', D(1 / 20)]];

                resources.forEach(([resource, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].produce_mult)
                        .times(tmp.c.resources[resource].gain_mult);

                    resources[i][1] = D.times(amount, mult);
                });

                return {
                    resources,
                };
            },
            cost(amount_built) {
                const built = D(amount_built ?? getBuyableAmount('c', this.id));

                /** @type {[string, Decimal][]} */
                const cost = [
                    ['copper_ore', D.pow(1.5, built).times(10)],
                    ['stone', D.pow(1.5, built).times(50)],
                ];

                cost.forEach(([, amount], i) => {
                    let mult = tmp.c.buildings['*'].cost_mult;

                    cost[i][1] = D.times(amount, mult);
                });

                return cost;
            },
            formulas: {
                cost: [['copper_ore', '(1.5 ^ built) * 10'], ['stone', '(1.5 ^ built) * 50']],
            },
        },
        // T1
        deep_mine: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.buildings).find(item => layers.c.buildings[item] == this); },
            name: 'deep mine',
            description() { return layers.c.buildings['*'].description(this.id); },
            style: {
                general: {
                    'background-image'() {
                        return `linear-gradient(to right, ${tmp.lo.items.coal.style['background-color']},\
                        ${tmp.lo.items.iron_ore.style['background-color']},\
                        ${tmp.lo.items.gold_ore.style['background-color']})`;
                    },
                    'background-origin': 'border-box',
                },
                grid: {
                    'background-image'() {
                        return `url('./resources/images/ore.svg'), linear-gradient(to right, ${tmp.lo.items.coal.style['background-color']},\
                        ${tmp.lo.items.iron_ore.style['background-color']},\
                        ${tmp.lo.items.gold_ore.style['background-color']})`;
                    },
                },
            },
            produces(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[string, Decimal][]} */
                const items = [
                    ['coal', D(1 / 32)],
                    ['iron_ore', D(1 / 110)],
                    ['gold_ore', D(1 / 882)],
                ];

                items.forEach(([item, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].produce_mult).times(tmp.c.buildings['*'].item_produce_mult);

                    if (hasUpgrade('c', 21)) mult = mult.times(upgradeEffect('c', 21));
                    if (hasUpgrade('c', 63)) mult = mult.times(upgradeEffect('c', 63));

                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;
                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount.max(0), 10).log10().pow(tmp.a.change_efficiency));
                    }

                    mult = mult.times(buyableEffect('fr', 13));

                    items[i][1] = D.times(amount, mult);
                });

                return {
                    items,
                };
            },
            cost(amount_built) {
                const built = D(amount_built ?? getBuyableAmount('c', this.id));

                /** @type {[string, Decimal][]} */
                const cost = [
                    ['stone', D.pow(1.5, built).times(40)],
                    ['normal_log', D.pow(1.25, built).times(100)],
                ];

                cost.forEach(([, amount], i) => {
                    let mult = tmp.c.buildings['*'].cost_mult;

                    if (hasUpgrade('c', 73)) mult = mult.times(upgradeEffect('c', 73));

                    cost[i][1] = D.times(amount, mult);
                });

                return cost;
            },
            formulas: {
                cost: [['stone', '(1.5 ^ built) * 40'], ['normal_log', '(1.25 ^ built) * 100']],
            },
            unlocked() { return hasUpgrade('c', 51); },
        },
        coal_generator: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.buildings).find(item => layers.c.buildings[item] == this); },
            name: 'coal generator',
            description() { return layers.c.buildings['*'].description(this.id); },
            style: {
                general: {
                    'background-color'() { return tmp.lo.items.coal.style['background-color']; },
                },
                grid: {
                    'background-image': `url('./resources/images/electric.svg')`,
                },
            },
            produces(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[keyof typeof player.c.resources, Decimal][]} */
                const resources = [['energy', D(1 / 20)]];

                resources.forEach(([resource, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].produce_mult)
                        .times(tmp.c.resources[resource].gain_mult);

                    if (hasUpgrade('c', 63)) mult = mult.times(upgradeEffect('c', 63));

                    resources[i][1] = D.times(amount, mult);
                });

                return {
                    resources,
                };
            },
            consumes(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[items, Decimal][]} */
                const items = [['coal', D(1 / 20)]];

                items.forEach(([item, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].consume_mult).times(tmp.c.buildings['*'].item_consume_mult);

                    if (hasUpgrade('c', 63)) mult = mult.times(upgradeEffect('c', 63));

                    if (item == 'coal') mult = mult.div(buyableEffect('fr', 22));

                    items[i][1] = D.times(amount, mult);
                });

                return {
                    items,
                };
            },
            cost(amount_built) {
                const built = D(amount_built ?? getBuyableAmount('c', this.id));

                /** @type {[string, Decimal][]} */
                const cost = [
                    ['stone', D.pow(1.25, built).times(50)],
                    ['iron_ore', D.pow(1.1, built).times(10)],
                ];

                cost.forEach(([, amount], i) => {
                    let mult = tmp.c.buildings['*'].cost_mult;

                    if (hasUpgrade('c', 73)) mult = mult.times(upgradeEffect('c', 73));

                    cost[i][1] = D.times(amount, mult);
                });

                return cost;
            },
            formulas: {
                cost: [['stone', '(1.25 ^ built) * 50'], ['iron_ore', '(1.1 ^ built) * 10']],
            },
            unlocked() { return hasUpgrade('c', 51); },
        },
        observatory: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.buildings).find(item => layers.c.buildings[item] == this); },
            name: 'observatory',
            description() {
                const building = tmp.c.buildings[this.id],
                    effect = shiftDown ? `[${building.formulas.effect}]` : format(building.effect),
                    effect_text = `They multiply star health by ${effect} (minimum 1 health)`;
                return layers.c.buildings['*'].description(this.id, effect_text);
            },
            style: {
                general: {
                    'background-image'() { return `linear-gradient(to right, ${tmp.c.resources.energy.color}, ${tmp.c.resources.science.color})`; },
                    'background-origin': 'border-box',
                },
                grid: {
                    'background-image'() {
                        return `url('./resources/images/observatory.svg'), linear-gradient(to right, ${tmp.c.resources.energy.color}, ${tmp.c.resources.science.color})`;
                    },
                },
            },
            produces(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[keyof typeof player.c.resources, Decimal][]} */
                const resources = [['science', D(1)]];

                resources.forEach(([resource, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].produce_mult)
                        .times(tmp.c.resources[resource].gain_mult);

                    resources[i][1] = D.times(amount, mult);
                });

                return {
                    resources,
                };
            },
            consumes(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[resources, Decimal][]} */
                const resources = [['energy', D(1 / 10)]];

                resources.forEach(([resource, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].produce_mult)
                        .times(tmp.c.resources[resource].gain_mult);

                    resources[i][1] = D.times(amount, mult);
                });

                return {
                    resources,
                };
            },
            effect(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                return D(.95).pow(placed);
            },
            cost(amount_built) {
                const built = D(amount_built ?? getBuyableAmount('c', this.id));

                /** @type {[string, Decimal][]} */
                const cost = [
                    ['iron_ore', D.pow(1.2, built).times(10)],
                    ['gold_ore', D.pow(1.1, built)],
                ];

                cost.forEach(([, amount], i) => {
                    let mult = tmp.c.buildings['*'].cost_mult;

                    cost[i][1] = D.times(amount, mult);
                });

                return cost;
            },
            formulas: {
                cost: [['iron_ore', '(1.2 ^ built) * 10'], ['gold_ore', '1.1 ^ built']],
                effect: '0.95 ^ (amount placed)',
            },
            unlocked() { return hasUpgrade('c', 51); },
        },
        duplicator: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.buildings).find(item => layers.c.buildings[item] == this); },
            name: 'duplicator',
            description() {
                const building = tmp.c.buildings[this.id],
                    /** @type {[string, Decimal]} */
                    effect = Object.entries(building.effect),
                    effect_text = 'They give ' + (effect.length ? listFormat.format(effect.map(([building, amount]) => `${format(amount)} effective ${tmp.c.buildings[building]?.name}`)) : 'no effective buildings');
                return layers.c.buildings['*'].description(this.id, effect_text);
            },
            style: {
                general: {
                    'background-color'() { return tmp.c.color; },
                },
                grid: {
                    'background-image': `url('./resources/images/mirror-mirror.svg')`,
                },
            },
            effect(_) {
                return player.c.floors.reduce(
                    /** @param {{[building: string]: Decimal}} full */
                    (full, grid) => {
                        const places = Object.keys(grid)
                            .map(id => +id)
                            .filter(id => grid[id]?.building == this.id && grid[id]?.enabled);

                        places.map(id => {
                            const row = Math.floor(id / 100),
                                col = id % 100,
                                side_ids = [
                                    (row - 1) * 100 + col,
                                    (row + 1) * 100 + col,
                                    row * 100 + col - 1,
                                    row * 100 + col + 1,
                                ];

                            return side_ids
                                .filter(id => id in grid && !['', this.id].includes(grid[id]?.building ?? '') && grid[id]?.enabled)
                                .forEach(id => full[grid[id].building] = D.add(full[grid[id].building], .1));
                        });

                        return full;
                    }, {});
            },
            cost(amount_built) {
                const built = D(amount_built ?? getBuyableAmount('c', this.id));

                /** @type {[string, Decimal][]} */
                const cost = [
                    ['gold_ore', D.pow(2, built)],
                ];

                cost.forEach(([, amount], i) => {
                    let mult = tmp.c.buildings['*'].cost_mult;

                    cost[i][1] = D.times(amount, mult);
                });

                return cost;
            },
            formulas: {
                cost: [['gold_ore', '2 ^ built']],
            },
            unlocked() { return hasUpgrade('c', 51); },
        },
        // Tower
        smelter: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.buildings).find(item => layers.c.buildings[item] == this); },
            name: 'smelter',
            description() { return layers.c.buildings['*'].description(this.id); },
            style: {
                general: {
                    'background-image'() {
                        return `linear-gradient(to right, ${tmp.lo.items.stone.style['background-color']},\
                        ${tmp.lo.items.copper_ore.style['background-color']},\
                        ${tmp.lo.items.tin_ore.style['background-color']})`;
                    },
                    'background-origin': 'border-box',
                },
                grid: {
                    'background-image'() {
                        return `url('./resources/images/flamer.svg'), linear-gradient(to right, ${tmp.lo.items.stone.style['background-color']},\
                        ${tmp.lo.items.copper_ore.style['background-color']},\
                        ${tmp.lo.items.tin_ore.style['background-color']})`;
                    },
                },
            },
            produces(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[items, Decimal][]} */
                const items = [
                    ['stone_brick', D(1 / 6)],
                    ['copper_ingot', D(1 / 14)],
                    ['tin_ingot', D(1 / 56)],
                ];

                // Prevent softlock for those without enough Tower milestones
                if (hasMilestone('to', 7) || inChallenge('b', 21) || inChallenge('b', 41)) items.push(
                    ['iron_ingot', D(1 / 220)],
                    ['gold_ingot', D(1 / 441)],
                );

                items.forEach(([item, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].produce_mult).times(tmp.c.buildings['*'].item_produce_mult);

                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;
                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount.max(0), 10).log10().pow(tmp.a.change_efficiency));
                    }

                    items[i][1] = D.times(amount, mult);
                });

                return {
                    items,
                };
            },
            consumes(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[items, Decimal][]} */
                const items = [
                    ['coal', D(1 / 5)],
                    ['stone', D(20 / 6)],
                    ['copper_ore', D(75 / 14)],
                    ['tin_ore', D(50 / 56)],
                ];

                // Prevent softlock for those without enough Tower milestones
                if (hasMilestone('to', 7) || inChallenge('b', 21) || inChallenge('b', 41)) items.push(
                    ['iron_ore', D(100 / 220)],
                    ['gold_ore', D(25 / 441)],
                );

                items.forEach(([item, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].consume_mult).times(tmp.c.buildings['*'].item_consume_mult);

                    if (item == 'coal') mult = mult.div(buyableEffect('fr', 22));

                    items[i][1] = D.times(amount, mult);
                });

                return {
                    items,
                };
            },
            cost(amount_built) {
                const built = D(amount_built ?? getBuyableAmount('c', this.id));

                /** @type {[string, Decimal][]} */
                const cost = [
                    ['stone', D.pow(1.4, built).times(100)],
                    ['iron_ore', D.pow(1.25, built).times(25)],
                ];

                cost.forEach(([, amount], i) => {
                    let mult = tmp.c.buildings['*'].cost_mult;

                    cost[i][1] = D.times(amount, mult);
                });

                return cost;
            },
            formulas: {
                cost: [['stone', '(1.4 ^ built) * 100'], ['iron_ore', '(1.25 ^ built) * 25']],
            },
            // Prevent softlock for those without enough Tower milestones
            unlocked() { return hasMilestone('to', 3) || inChallenge('b', 21) || inChallenge('b', 41); },
        },
        well: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.buildings).find(item => layers.c.buildings[item] == this); },
            name: 'well',
            description() { return layers.c.buildings['*'].description(this.id); },
            style: {
                general: {
                    'background-color'() { return tmp.lo.items.water.style['background-color']; },
                },
                grid: {
                    'background-image': `url('./resources/images/well.svg')`,
                },
            },
            produces(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[items, Decimal][]} */
                const items = [
                    ['water', D(1 / 10)],
                ];

                items.forEach(([item, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].produce_mult).times(tmp.c.buildings['*'].item_produce_mult);

                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;
                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount.max(0), 10).log10().pow(tmp.a.change_efficiency));
                    }

                    items[i][1] = D.times(amount, mult);
                });

                return {
                    items,
                };
            },
            cost(amount_built) {
                const built = D(amount_built ?? getBuyableAmount('c', this.id));

                /** @type {[items, Decimal][]} */
                const cost = [
                    ['stone', D.pow(1.75, built).times(100)],
                ];

                cost.forEach(([, amount], i) => {
                    let mult = tmp.c.buildings['*'].cost_mult;

                    cost[i][1] = D.times(amount, mult);
                });

                return cost;
            },
            formulas: {
                cost: [['stone', '(1.75 ^ built) * 100']],
            },
            unlocked() { return hasMilestone('to', 6); },
        },
        arc_furnace: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.buildings).find(item => layers.c.buildings[item] == this); },
            name: 'arc furnace',
            description() { return layers.c.buildings['*'].description(this.id); },
            style: {
                general: {
                    'background-image'() {
                        return `linear-gradient(to right, ${tmp.lo.items.steel_ingot.style['background-color']},\
                        ${tmp.lo.items.bronze_ingot.style['background-color']})`;
                    },
                    'background-origin': 'border-box',
                },
                grid: {
                    'background-image'() {
                        return `url('./resources/images/furnace.svg'),\
                        linear-gradient(to right, ${tmp.lo.items.steel_ingot.style['background-color']},\
                        ${tmp.lo.items.bronze_ingot.style['background-color']})`;
                    },
                },
            },
            produces(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[items, Decimal][]} */
                const items = [
                    ['bronze_ingot', D(1 / 25)],
                    ['steel_ingot', D(1 / 250)],
                ];

                items.forEach(([item, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].produce_mult).times(tmp.c.buildings['*'].item_produce_mult);

                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;
                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount.max(0), 10).log10().pow(tmp.a.change_efficiency));
                    }

                    items[i][1] = D.times(amount, mult);
                });

                return {
                    items,
                };
            },
            consumes(amount_placed) {
                const placed = D(amount_placed ?? tmp.c.buildings['*'].enabled[this.id])
                    .add(tmp.c.buildings.duplicator.effect[this.id]);

                /** @type {[items, Decimal][]} */
                const items = [
                    // bronze
                    ['copper_ingot', D(3 / 50)],
                    ['tin_ingot', D(3 / 50)],
                    // steel
                    ['iron_ingot', D(10 / 250)],
                    ['coal', D(150 / 250)],
                ],
                    /** @type {[resources, Decimal][]} */
                    resources = [['energy', D(1 / 5)]];

                items.forEach(([, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].consume_mult).times(tmp.c.buildings['*'].item_consume_mult);

                    items[i][1] = D.times(amount, mult);
                });
                resources.forEach(([resource, amount], i) => {
                    let mult = placed.times(tmp.c.buildings['*'].produce_mult)
                        .times(tmp.c.resources[resource].gain_mult);

                    resources[i][1] = D.times(amount, mult);
                });

                return {
                    items,
                    resources,
                };
            },
            cost(amount_built) {
                const built = D(amount_built ?? getBuyableAmount('c', this.id));

                /** @type {[items, Decimal][]} */
                const cost = [
                    ['iron_ore', D.pow(1.4, built).times(15)],
                    ['gold_ore', D.pow(1.25, built).times(50)],
                ];

                cost.forEach(([, amount], i) => {
                    let mult = tmp.c.buildings['*'].cost_mult;

                    cost[i][1] = D.times(amount, mult);
                });

                return cost;
            },
            formulas: {
                cost: [['iron_ore', '(1.4 ^ built) * 15'], ['gold_ore', '(1.25 ^ built) * 50']],
            },
            unlocked() { return hasMilestone('to', 7); },
        },
        /**
         * TODO
         *
         * Restaurant -> cooks
         * Factory -> crafts
         * Shop -> auto sells
         *
         * Oil Well -> oil + coal
         * Refinery -> energy + oil => fuel
         * Fuel Generator -> fuel => energy
         * Launch Pad -> fuel => research + stardust
         */
    },
    resources: {
        '*': {
            gain_mult() {
                let mult = D.dOne;

                if (tmp.bin.layerShown) mult = mult.times(tmp.bin.cards.multipliers['c'] ?? 1);

                return mult;
            },
        },
        science: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.resources).find(res => layers.c.resources[res] == this); },
            name: 'science',
            color: '#AA99FF',
            gain_mult() {
                let mult = tmp.c.resources['*'].gain_mult;

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else if (inChallenge('b', 12)) {
                    mult = mult.div(D.add(player.c.resources[this.id].amount.max(0), 10).log10().pow(tmp.a.change_efficiency));
                }

                mult = mult.times(buyableEffect('fr', 32).science);

                return mult;
            },
            gain() {
                return Object.keys(tmp.c.buildings)
                    .filter(building => building != '*' && (tmp.c.buildings[building].unlocked ?? true) && D.gt(player.c.buyables[building], 0))
                    .reduce((sum, building) => {
                        const build = tmp.c.buildings[building];

                        if (build.consumes && 'resources' in build.consumes) {
                            sum = D.minus(
                                sum,
                                build.consumes.resources
                                    .filter(([res]) => res == this.id)
                                    .reduce((sum, [, cons]) => D.add(sum, cons), 0)
                            );
                        }
                        if (build.produces && 'resources' in build.produces) {
                            sum = D.add(
                                sum,
                                build.produces.resources
                                    .filter(([res]) => res == this.id)
                                    .reduce((sum, [, cons]) => D.add(sum, cons), 0)
                            );
                        }

                        return sum;
                    }, D.dZero);
            },
        },
        energy: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.c.resources).find(res => layers.c.resources[res] == this); },
            name: 'energy',
            color: '#FFEE00',
            gain_mult() {
                let mult = tmp.c.resources['*'].gain_mult;

                const upg = false;
                if (upg && hasUpgrade('s', upg)) {
                    mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                } else if (inChallenge('b', 12)) {
                    mult = mult.div(D.add(player.c.resources[this.id].amount.max(0), 10).log10().pow(tmp.a.change_efficiency));
                }

                mult = mult.times(tmp.p.plants.potato_battery.effect);

                return mult;
            },
            gain() {
                return Object.keys(tmp.c.buildings)
                    .filter(building => building != '*' && (tmp.c.buildings[building].unlocked ?? true) && D.gt(player.c.buyables[building], 0))
                    .reduce((sum, building) => {
                        const build = tmp.c.buildings[building];

                        if (build.consumes && 'resources' in build.consumes) {
                            sum = D.minus(
                                sum,
                                build.consumes.resources
                                    .filter(([res]) => res == this.id)
                                    .reduce((sum, [, cons]) => D.add(sum, cons), 0)
                            );
                        }
                        if (build.produces && 'resources' in build.produces) {
                            sum = D.add(
                                sum,
                                build.produces.resources
                                    .filter(([res]) => res == this.id)
                                    .reduce((sum, [, cons]) => D.add(sum, cons), 0)
                            );
                        }

                        return sum;
                    }, D.dZero);
            },
        },
    },
    floors: {
        max() {
            let max = D.dZero;

            if (hasMilestone('to', 1)) max = max.add(tmp.to.milestones[1].effect);

            return max.toNumber();
        },
    },
    update(diff) {
        if (tmp.clo.layerShown) diff = D.times(diff, layers.clo.time_speed(this.layer));
        if (tmp.tic.layerShown) diff = D.times(diff, layers.tic.time_speed(this.layer));

        Object.keys(layers.c.buildings).forEach(building => {
            const build = tmp.c.buildings[building];

            if (!(build.unlocked ?? true)) return;

            if (build.consumes) {
                let can_consume = true;

                if (can_consume && 'items' in build.consumes && Array.isArray(build.consumes.items)) {
                    can_consume &&= build.consumes.items.every(([item, amount]) => D.gte(player.lo.items[item].amount, D.times(amount, diff)));
                }
                if (can_consume && 'resources' in build.consumes && Array.isArray(build.consumes.resources)) {
                    can_consume &&= build.consumes.resources.every(([resource, amount]) => D.gte(player.c.resources[resource].amount, D.times(amount, diff)));
                }

                if (!can_consume) return;

                if ('items' in build.consumes && Array.isArray(build.consumes.items)) {
                    const consumption = build.consumes.items.map(([item, amount]) => [item, D.times(amount, diff).neg()]);

                    gain_items(consumption);
                }

                if ('resources' in build.consumes && Array.isArray(build.consumes.resources)) {
                    build.consumes.resources.forEach(([resource, amount]) => {
                        gain_resource(resource, D.times(amount, diff).neg());
                    });
                }
            }
            if (build.produces) {
                if ('items' in build.produces && Array.isArray(build.produces.items)) {
                    const production = build.produces.items.map(([item, amount]) => [item, D.times(amount, diff)]);

                    gain_items(production);
                }
                if ('resources' in build.produces && Array.isArray(build.produces.resources)) {
                    build.produces.resources.forEach(([resource, amount]) => {
                        gain_resource(resource, D.times(amount, diff));
                    });
                }
            }
        });
    },
    automate() {
        if (player.c.floor > tmp.c.floors.max) player.c.floor = tmp.c.floors.max;
        if (player.c.floor < 0) player.c.floor = 0;
    },
    type: 'none',
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        /** @type {(keyof player['c'])[]} */
        const keep = [],
            max_ups = D.add(buyableEffect('lo', 23).m_hold.pow(tmp.a.change_efficiency), buyableEffect('fr', 33).c_hold).floor(),
            kept_ups = [...player[this.layer].upgrades];

        kept_ups.length = D.min(kept_ups.length, max_ups).toNumber();

        layerDataReset(this.layer, keep);
        player[this.layer].upgrades.push(...kept_ups);
        Object.keys(player.c.resources).forEach(res => player.c.resources[res] = { amount: D.dZero, });
        player.c.floors = [{}];
    },
    branches: [() => tmp.k.layerShown ? 'k' : ['lo', 3]],
    autoUpgrade() { return hasChallenge('b', 21) && player.c.auto_research && player.c.unlocked; },
});
