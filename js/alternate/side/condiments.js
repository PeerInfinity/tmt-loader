'use strict';

addLayer('con', {
    name: 'Condiments',
    image: `./resources/images/salt-shaker.svg`,
    startData() {
        return {
            points: D.dZero,
            unlocked: false,
            condiments: Object.fromEntries(
                Object.keys(layers.con.condiments)
                    .filter(condiment => condiment != '*')
                    .map(condiment => [condiment, { amount: D.dZero, }])
            ),
            swap: false,
            bought: D.dZero,
            respecs: D.dZero,
        };
    },
    layerShown() { return player.con.unlocked; },
    nodeStyle() {
        const style = {
            'background-repeat': 'no-repeat',
            'background-position': 'center',
            'background-size': 'contain',
        };

        if (tmp.con.condiments['*']?.highest) style['border-color'] = tmp.con.condiments[tmp.con.condiments['*'].highest]?.color;

        return style;
    },
    color: '#CC9955',
    row: 'side',
    position: 3.5,
    resource: 'spice',
    type: 'none',
    tabFormat: {
        'Condiments': {
            content: [
                ['display-text', () => {
                    let change_str = '';

                    const change = tmp.con.spice.gain;

                    if (shiftDown) change_str = tmp.con.spice.formula;
                    else if (D.abs(change).gt(1e-4)) change_str = ` (${layerColor('con', (change.gt(0) ? '+' : '-') + format(change))} /s)`;

                    return `You have ${layerColor('con', format(player.con.points), 'font-size:1.5em;')}${change_str} ${tmp.con.resource}`;
                }],
                ['display-text', () => {
                    const highest = tmp.con.condiments['*'].highest;
                    let name;

                    if (!highest) name = 'none';
                    else name = `<span style="color:${tmp.con.condiments[highest].color};">${tmp.con.condiments[highest].name}</span>`;

                    return `Current active condiment: ${name}`;
                }],
                'blank',
                [
                    'column',
                    () => Object.keys(layers.con.condiments)
                        .filter(cond => cond != '*' && cond != '')
                        .map(cond => {
                            const amount = player.con.condiments[cond].amount,
                                tmp_cond = tmp.con.condiments[cond];

                            let change_str = '',
                                change = D.times(amount, tmp.con.condiments['*'].loss).neg()
                                    .add(tmp.con.condiments[cond].gain);
                            if (D.abs(change).gt(1e-4)) change_str = ` (<span style="color:${tmp_cond.color}">${(change.gt(0) ? '+' : '') + format(change)}</span> /s)`;

                            return ['display-text', `You have <span style="color:${tmp_cond.color};font-size:1.25em;">${format(amount)}</span>${change_str} ${tmp_cond.name}`];
                        })
                ],
                ['display-text', () => `<span class="warning">You lose ${formatWhole(tmp.con.condiments['*'].loss.times(100))}% of your condiment amounts every second</span>`],
                ['display-text', () => `Using the good condiment multiplies food duration by ${format(tmp.con.condiments['*'].bonus)}`],
                ['display-text', () => `<span class="warning">Using the bad condiment multiplies food duration by ${format(tmp.con.condiments['*'].malus)}</span>`],
                'blank',
                'grid',
                'blank',
                ['clickables', [1, 2]],
            ],
            unlocked() { return inChallenge('b', 91) || hasChallenge('b', 91); },
        },
        'Effects': {
            content: [
                [
                    'layer-table',
                    () => {
                        const condiment_color = (condiment, text) => `<span style="color:${tmp.con.condiments[condiment].color}">${text}</span>`,
                            /** @param {string} condiment */
                            effects = condiment => {
                                /** @type {string[]} */
                                const pros = [],
                                    /** @type {string[]} */
                                    cons = [],
                                    eff = tmp.con.condiments[condiment].effect,
                                    /** @type {Computed<Layers['con']['condiments'][string]['formulas']>} */
                                    formulas = tmp.con.condiments[condiment].formulas,
                                    /** @type {Computed<Layers['con']['condiments'][string]['positive']>} */
                                    {
                                        to = {},
                                        k = {},
                                        fr = {},
                                    } = tmp.con.condiments[condiment].positive;

                                if ('material_cost' in to) {
                                    let mult_text;
                                    if (shiftDown) {
                                        mult_text = `[${formulas.to.material_cost}]`;
                                    }

                                    if (to.material_cost) {
                                        pros.push(`Divides tower block costs by ${mult_text ?? format(eff.to?.material_cost.pow(-1))}`);
                                    } else {
                                        cons.push(`Multiplies tower block costs by ${mult_text ?? format(eff.to?.material_cost)}`);
                                    }
                                }
                                if ('floor_cost' in to) {
                                    let mult_text;
                                    if (shiftDown) {
                                        mult_text = `[${formulas.to.floor_cost}]`;
                                    }

                                    if (to.floor_cost) {
                                        pros.push(`Divides tower floor cost by ${mult_text ?? format(eff.to?.floor_cost)}`);
                                    } else {
                                        cons.push(`Multiplies tower floor cost by ${mult_text ?? format(eff.to?.floor_cost.pow(-1))}`);
                                    }
                                }

                                if ('oven_size' in k) {
                                    let add_text;
                                    if (shiftDown) {
                                        add_text = `[${formulas.k.oven_size}]`;
                                    } else {
                                        add_text = format(eff.k?.oven_size.abs());
                                    }

                                    if (k.oven_size) {
                                        pros.push(`Increases oven size by ${add_text}`);
                                    } else {
                                        cons.push(`Decreases oven size by ${add_text}`);
                                    }
                                }
                                if ('stomach_size' in k) {
                                    let add_text;
                                    if (shiftDown) {
                                        add_text = `[${formulas.k.stomach_size}]`;
                                    } else {
                                        add_text = format(eff.k?.stomach_size.abs());
                                    }

                                    if (k.stomach_size) {
                                        pros.push(`Increases stomach size by ${add_text}`);
                                    } else {
                                        cons.push(`Decreases stomach size by ${add_text}`);
                                    }
                                }

                                if ('water' in fr) {
                                    let mult_text;
                                    if (shiftDown) {
                                        mult_text = `[${formulas.fr.water}]`;
                                    }

                                    if (fr.water) {
                                        pros.push(`Multiplies water gain by ${mult_text ?? format(eff.fr?.water)}`);
                                    } else {
                                        cons.push(`Divides water gain by ${mult_text ?? format(eff.fr?.water.pow(-1))}`);
                                    }
                                }
                                if ('cold' in fr) {
                                    let mult_text;
                                    if (shiftDown) {
                                        mult_text = `[${formulas.fr.cold}]`;
                                    }

                                    if (fr.cold) {
                                        pros.push(`Multiplies cold gain by ${mult_text ?? format(eff.fr?.cold)}`);
                                    } else {
                                        cons.push(`Divides cold gain by ${mult_text ?? format(eff.fr?.cold.pow(-1))}`);
                                    }
                                }

                                return { pros, cons, };
                            },
                            condiments = Object.keys(layers.con.condiments)
                                .filter(cond => cond != '*' && cond != ''),
                            total_effects = () => {
                                /** @type {string[]} */
                                const lines = [],
                                    {
                                        to,
                                        k,
                                        fr,
                                    } = tmp.con.condiments['*'].total,
                                    pos = text => `<span style="color:#55AA55;">${text}</span>`,
                                    neg = text => `<span class="warning">${text}</span>`;

                                if (to.material_cost.eq_tolerance(1, .001)) {
                                    lines.push(`No effects on tower block costs`);
                                } else if (to.material_cost.lt(1)) {
                                    lines.push(pos(`Divide tower block costs by ${format(to.material_cost.pow(-1))}`));
                                } else {
                                    lines.push(neg(`Multiply tower block costs by ${format(to.material_cost)}`));
                                }
                                if (to.floor_cost.eq_tolerance(1, .001)) {
                                    lines.push(`No effects on tower floor costs`);
                                } else if (to.floor_cost.gt(1)) {
                                    lines.push(pos(`Divide tower floor costs by ${format(to.floor_cost)}`));
                                } else {
                                    lines.push(neg(`Multiply tower floor costs by ${format(to.floor_cost.pow(-1))}`));
                                }

                                if (k.oven_size.eq_tolerance(0, .001)) {
                                    lines.push(`No effects on oven size`);
                                } else if (k.oven_size.gt(0)) {
                                    lines.push(pos(`Increase oven size by ${format(k.oven_size)}`));
                                } else {
                                    lines.push(neg(`Decrease oven size by ${format(k.oven_size.abs())}`));
                                }
                                if (k.stomach_size.eq_tolerance(0, .001)) {
                                    lines.push(`No effects on stomach size`);
                                } else if (k.stomach_size.gt(0)) {
                                    lines.push(pos(`Increase stomach size by ${format(k.stomach_size)}`));
                                } else {
                                    lines.push(neg(`Decrease stomach size by ${format(k.stomach_size.abs())}`));
                                }

                                if (fr.water.eq_tolerance(1, .001)) {
                                    lines.push(`No effects on water gain`);
                                } else if (fr.water.gt(1)) {
                                    lines.push(pos(`Multiply water gain by ${format(fr.water)}`));
                                } else {
                                    lines.push(neg(`Divide water gain by ${format(fr.water.pow(-1))}`));
                                }
                                if (fr.cold.eq_tolerance(1, .001)) {
                                    lines.push(`No effects on cold gain`);
                                } else if (fr.cold.gt(1)) {
                                    lines.push(pos(`Multiply cold gain by ${format(fr.cold)}`));
                                } else {
                                    lines.push(neg(`Divide cold gain by ${format(fr.cold.pow(-1))}`));
                                }

                                return lines.map(eff => ['display-text', eff]);
                            };

                        const lines = [
                            ['Condiment', 'Amount', 'Effects'],
                            ...condiments.map(cond => {
                                let change = D.times(tmp.con.condiments['*'].loss, player.con.condiments[cond].amount).neg()
                                    .add(tmp.con.condiments[cond].gain),
                                    change_str = '';
                                const effect = effects(cond);

                                if (D.abs(change).gt(1e-4)) change_str = ` (${condiment_color(cond, (change.gt(0) ? '+' : '') + format(change))} /s)`;

                                return [
                                    [['display-text', condiment_color(cond, capitalize(tmp.con.condiments[cond].name))]],
                                    [['display-text', condiment_color(cond, format(player.con.condiments[cond].amount)) + change_str]],
                                    [
                                        ...effect.pros.map(eff => ['display-text', `<span style="color:#55AA55;">${eff}</span>`]),
                                        'h-line',
                                        ...effect.cons.map(eff => ['display-text', `<span class="warning">${eff}</span>`]),
                                    ],
                                ];
                            }),
                        ];

                        if (inChallenge('b', 91)) lines.push([
                            [['display-text', 'None']],
                            [['display-text', format(player.con.points)]],
                            [
                                //['display-text', 'With no condiment selected:'],
                                ...effects('').cons.map(eff => ['display-text', `<span class="warning">${eff}</span>`])
                            ],
                        ]);

                        lines.push([
                            [['display-text', '<u>Total</u>']],
                            [],
                            [...total_effects()],
                        ]);

                        return lines;
                    },
                ],
                'blank',
                ['clickables', [1]],
            ],
            unlocked() { return inChallenge('b', 91) || hasChallenge('b', 91); },
        },
        'Seal': {
            content: [
                ['layer-proxy', ['b', [['challenge', 91]]]],
            ],
            unlocked() { return !hasChallenge('b', 91) || inChallenge('b', 91); },
        },
    },
    clickables: {
        11: {
            title: 'Random Condiment',
            display() {
                const cost = shiftDown ? `[${tmp.con.condiments['*'].cost_formula}]` : format(tmp.con.condiments['*'].cost);
                return `Cost: ${cost} spice`;
            },
            canClick() {
                return (inChallenge('b', 91) || hasChallenge('b', 91)) &&
                    D.gte(player.con.points, tmp.con.condiments['*'].cost) &&
                    // I pray this is right
                    Object.values(player.con.grid).filter(data => data.condiment != '').length < 25;
            },
            onClick() {
                if (!this.canClick()) return;

                const condiment = ['pepper', 'mint', 'vinegar', 'ginger'][Math.floor(Math.random() * 4)],
                    empty = Object.keys(player.con.grid)
                        .map(id => +id)
                        .filter(id => player.con.grid[id].condiment == ''),
                    cell = empty[Math.floor(Math.random() * empty.length)];

                player.con.grid[cell].condiment = condiment;
                player.con.grid[cell].tier = D.dOne;
                player.con.points = D.minus(player.con.points, tmp.con.condiments['*'].cost);
                player.con.bought = D.add(player.con.bought, 1);
            },
            onHold() {
                if (!this.canClick()) return;

                const condiment = ['pepper', 'mint', 'vinegar', 'ginger'][Math.floor(Math.random() * 4)],
                    empty = Object.keys(player.con.grid)
                        .map(id => +id)
                        .filter(id => player.con.grid[id].condiment == ''),
                    cell = empty[Math.floor(Math.random() * empty.length)];

                player.con.grid[cell].condiment = condiment;
                player.con.grid[cell].tier = D.dOne;
                player.con.points = D.minus(player.con.points, tmp.con.condiments['*'].cost);
                player.con.bought = D.add(player.con.bought, 1);
            },
            style() {
                const colors = ['pepper', 'vinegar', 'mint', 'ginger']
                    .map((cond, i) => [`${tmp.con.condiments[cond].color} ${25 * i}%`, `${tmp.con.condiments[cond].color} ${25 * i + 25}%`])
                    .flat();
                if (tmp[this.layer].clickables[this.id].canClick) return {
                    'background-image': `conic-gradient(${colors.join(',')})`,
                    'background-repeat': 'no-repeat',
                    'background-position': 'center',
                    'background-size': 'contain',
                };
            },
        },
        12: {
            title: 'Pepper',
            display() {
                const cost = shiftDown ? `[${tmp.con.condiments['*'].cost_formula_specific}]` : format(tmp.con.condiments['*'].cost_specific);
                return `Cost: ${cost} spice`;
            },
            canClick() {
                return (inChallenge('b', 91) || hasChallenge('b', 91)) &&
                    D.gte(player.con.points, tmp.con.condiments['*'].cost_specific) &&
                    // I pray this is right
                    Object.values(player.con.grid).filter(data => data.condiment != '').length < 25;
            },
            onClick() {
                if (!this.canClick()) return;

                const condiment = 'pepper',
                    empty = Object.keys(player.con.grid)
                        .map(id => +id)
                        .filter(id => player.con.grid[id].condiment == ''),
                    cell = empty[Math.floor(Math.random() * empty.length)];

                player.con.grid[cell].condiment = condiment;
                player.con.grid[cell].tier = D.dOne;
                player.con.points = D.minus(player.con.points, tmp.con.condiments['*'].cost);
                player.con.bought = D.add(player.con.bought, 1);
            },
            onHold() {
                if (!this.canClick()) return;

                const condiment = 'pepper',
                    empty = Object.keys(player.con.grid)
                        .map(id => +id)
                        .filter(id => player.con.grid[id].condiment == ''),
                    cell = empty[Math.floor(Math.random() * empty.length)];

                player.con.grid[cell].condiment = condiment;
                player.con.grid[cell].tier = D.dOne;
                player.con.points = D.minus(player.con.points, tmp.con.condiments['*'].cost);
                player.con.bought = D.add(player.con.bought, 1);
            },
            style() {
                if (tmp[this.layer].clickables[this.id].canClick) return {
                    'background-color': tmp.con.condiments.pepper.color,
                };
            },
        },
        13: {
            title: 'Mint',
            display() {
                const cost = shiftDown ? `[${tmp.con.condiments['*'].cost_formula_specific}]` : format(tmp.con.condiments['*'].cost_specific);
                return `Cost: ${cost} spice`;
            },
            canClick() {
                return (inChallenge('b', 91) || hasChallenge('b', 91)) &&
                    D.gte(player.con.points, tmp.con.condiments['*'].cost_specific) &&
                    // I pray this is right
                    Object.values(player.con.grid).filter(data => data.condiment != '').length < 25;
            },
            onClick() {
                if (!this.canClick()) return;

                const condiment = 'mint',
                    empty = Object.keys(player.con.grid)
                        .map(id => +id)
                        .filter(id => player.con.grid[id].condiment == ''),
                    cell = empty[Math.floor(Math.random() * empty.length)];

                player.con.grid[cell].condiment = condiment;
                player.con.grid[cell].tier = D.dOne;
                player.con.points = D.minus(player.con.points, tmp.con.condiments['*'].cost);
                player.con.bought = D.add(player.con.bought, 1);
            },
            onHold() {
                if (!this.canClick()) return;

                const condiment = 'mint',
                    empty = Object.keys(player.con.grid)
                        .map(id => +id)
                        .filter(id => player.con.grid[id].condiment == ''),
                    cell = empty[Math.floor(Math.random() * empty.length)];

                player.con.grid[cell].condiment = condiment;
                player.con.grid[cell].tier = D.dOne;
                player.con.points = D.minus(player.con.points, tmp.con.condiments['*'].cost);
                player.con.bought = D.add(player.con.bought, 1);
            },
            style() {
                if (tmp[this.layer].clickables[this.id].canClick) return {
                    'background-color': tmp.con.condiments.mint.color,
                };
            },
        },
        14: {
            title: 'Vinegar',
            display() {
                const cost = shiftDown ? `[${tmp.con.condiments['*'].cost_formula_specific}]` : format(tmp.con.condiments['*'].cost_specific);
                return `Cost: ${cost} spice`;
            },
            canClick() {
                return (inChallenge('b', 91) || hasChallenge('b', 91)) &&
                    D.gte(player.con.points, tmp.con.condiments['*'].cost_specific) &&
                    // I pray this is right
                    Object.values(player.con.grid).filter(data => data.condiment != '').length < 25;
            },
            onClick() {
                if (!this.canClick()) return;

                const condiment = 'vinegar',
                    empty = Object.keys(player.con.grid)
                        .map(id => +id)
                        .filter(id => player.con.grid[id].condiment == ''),
                    cell = empty[Math.floor(Math.random() * empty.length)];

                player.con.grid[cell].condiment = condiment;
                player.con.grid[cell].tier = D.dOne;
                player.con.points = D.minus(player.con.points, tmp.con.condiments['*'].cost);
                player.con.bought = D.add(player.con.bought, 1);
            },
            onHold() {
                if (!this.canClick()) return;

                const condiment = 'vinegar',
                    empty = Object.keys(player.con.grid)
                        .map(id => +id)
                        .filter(id => player.con.grid[id].condiment == ''),
                    cell = empty[Math.floor(Math.random() * empty.length)];

                player.con.grid[cell].condiment = condiment;
                player.con.grid[cell].tier = D.dOne;
                player.con.points = D.minus(player.con.points, tmp.con.condiments['*'].cost);
                player.con.bought = D.add(player.con.bought, 1);
            },
            style() {
                if (tmp[this.layer].clickables[this.id].canClick) return {
                    'background-color': tmp.con.condiments.vinegar.color,
                };
            },
        },
        15: {
            title: 'Ginger',
            display() {
                const cost = shiftDown ? `[${tmp.con.condiments['*'].cost_formula_specific}]` : format(tmp.con.condiments['*'].cost_specific);
                return `Cost: ${cost} spice`;
            },
            canClick() {
                return (inChallenge('b', 91) || hasChallenge('b', 91)) &&
                    D.gte(player.con.points, tmp.con.condiments['*'].cost_specific) &&
                    // I pray this is right
                    Object.values(player.con.grid).filter(data => data.condiment != '').length < 25;
            },
            onClick() {
                if (!this.canClick()) return;

                const condiment = 'ginger',
                    empty = Object.keys(player.con.grid)
                        .map(id => +id)
                        .filter(id => player.con.grid[id].condiment == ''),
                    cell = empty[Math.floor(Math.random() * empty.length)];

                player.con.grid[cell].condiment = condiment;
                player.con.grid[cell].tier = D.dOne;
                player.con.points = D.minus(player.con.points, tmp.con.condiments['*'].cost);
                player.con.bought = D.add(player.con.bought, 1);
            },
            onHold() {
                if (!this.canClick()) return;

                const condiment = 'ginger',
                    empty = Object.keys(player.con.grid)
                        .map(id => +id)
                        .filter(id => player.con.grid[id].condiment == ''),
                    cell = empty[Math.floor(Math.random() * empty.length)];

                player.con.grid[cell].condiment = condiment;
                player.con.grid[cell].tier = D.dOne;
                player.con.points = D.minus(player.con.points, tmp.con.condiments['*'].cost);
                player.con.bought = D.add(player.con.bought, 1);
            },
            style() {
                if (tmp[this.layer].clickables[this.id].canClick) return {
                    'background-color': tmp.con.condiments.ginger.color,
                };
            },
        },
        21: {
            title: 'Respec your condiments',
            display() { return `You must have bought at least ${formatWhole(player.con.respecs)} condiments`; },
            canClick() {
                return (inChallenge('b', 91) || hasChallenge('b', 91)) &&
                    D.gte(player.con.bought, player.con.respecs);
            },
            onClick() {
                if (!confirm('Are you sure you want to respec your condiments?')) return;
                player.con.respecs = D.add(player.con.respecs, 1);
                player.con.points = D.dZero;
                Object.values(player.con.condiments).forEach(data => data.amount = D.dZero);
                Object.values(player.con.grid).forEach(data => {
                    data.condiment = '';
                    data.tier = D.dZero;
                });
                player.con.bought = D.dZero;
            },
        },
    },
    grid: {
        rows: 5,
        cols: 5,
        getStartData(_) {
            return {
                condiment: '',
                tier: D.dZero,
            };
        },
        getTitle(data, _) { return capitalize(tmp.con.condiments[data.condiment].name); },
        getDisplay(data, _) {
            if (data.condiment) {
                return `Grade ${formatWhole(data.tier)}\
                    +${format(D.pow(2.5, data.tier.minus(1)))} /s`;
            }
        },
        getStyle(data, id) {
            if (id == player.con.swap) return { 'background-color': '#FFFFFF' };
            if (data.condiment) return { 'background-color': tmp.con.condiments[data.condiment].color };
            return { 'background-color': '#664422' };
        },
        onClick(data, id) {
            if (!player.con.swap) {
                // Mark for swapping
                player.con.swap = id;
                return;
            } else if (id == player.con.swap) {
                // Unmark for swapping
                player.con.swap = false;
                return;
            }

            const target = player.con.grid[player.con.swap];
            if (target.condiment == data.condiment && target.tier.eq(data.tier)) {
                // Merge merge merge
                data.tier = D.add(data.tier, 1);
                target.tier = D.dZero;
                target.condiment = '';
                player.con.swap = false;
            } else {
                // Swap
                [data.tier, target.tier] = [target.tier, data.tier];
                [data.condiment, target.condiment] = [target.condiment, data.condiment];
                player.con.swap = false;
            }
        },
    },
    spice: {
        gain() {
            if (!inChallenge('b', 91) && !hasChallenge('b', 91)) return D.dZero;

            return ['pepper', 'mint', 'vinegar', 'ginger'].reduce((sum, condiment) => D.add(sum, player.con.condiments[condiment].amount.add(10).log10().minus(1)), 0);
        },
        formula: 'log10(pepper + 10) + log10(mint + 10) + log10(vinegar + 10) + log10(ginger + 10)',
    },
    condiments: {
        '*': {
            loss() { return D(.01); },
            total: {
                to: {
                    material_cost() {
                        return Object.values(tmp.con.condiments)
                            .map(value => 'effect' in value ? (value.effect.to?.material_cost ?? D.dOne) : D.dOne)
                            .reduce(D.times, 1);
                    },
                    floor_cost() {
                        return Object.values(tmp.con.condiments)
                            .map(value => 'effect' in value ? (value.effect.to?.floor_cost ?? D.dOne) : D.dOne)
                            .reduce(D.times, 1);
                    },
                },
                k: {
                    oven_size() {
                        return Object.values(tmp.con.condiments)
                            .map(value => 'effect' in value ? (value.effect.k?.oven_size ?? D.dZero) : D.dZero)
                            .reduce(D.add, 0);
                    },
                    stomach_size() {
                        return Object.values(tmp.con.condiments)
                            .map(value => 'effect' in value ? (value.effect.k?.stomach_size ?? D.dZero) : D.dZero)
                            .reduce(D.add, 0);
                    },
                },
                fr: {
                    water() {
                        return Object.values(tmp.con.condiments)
                            .map(value => 'effect' in value ? (value.effect.fr?.water ?? D.dOne) : D.dOne)
                            .reduce(D.times, 1);
                    },
                    cold() {
                        return Object.values(tmp.con.condiments)
                            .map(value => 'effect' in value ? (value.effect.fr?.cold ?? D.dOne) : D.dOne)
                            .reduce(D.times, 1);
                    },
                },
            },
            bonus: D(1.25),
            malus: D(.75),
            highest() {
                const condiments = Object.entries(player.con.condiments)
                    .filter(([, data]) => D.gt(data.amount, 0));

                if (!condiments.length) return '';

                return condiments.sort(([, data_a], [, data_b]) => D.cmp(data_b.amount, data_a.amount))[0][0];
            },
            cost(x = player.con.bought) {
                if (D.lte(x)) return D.dZero;

                return D.minus(x, 1).pow_base(1.5);
            },
            cost_formula: '(bought - 1) ^ 1.5',
            cost_specific(x = player.con.bought) { return this.cost(D.add(x, 3)); },
            cost_formula_specific: '(bought + 2) ^ 1.5',
        },
        '': {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.con.condiments).find(condiment => layers.con.condiments[condiment] == this); },
            effect() {
                if (inChallenge('b', 91)) {
                    const amount = player.con.points,
                        amlo = D.add(amount, 50).log(50).max(0).minus(1);
                    return {
                        to: {
                            material_cost: D.pow(2, amlo),
                            floor_cost: D.pow(.5, amlo),
                        },
                        k: {
                            oven_size: amlo.neg(),
                            stomach_size: amlo.neg(),
                        },
                        fr: {
                            water: D.pow(.5, amlo),
                            cold: D.pow(.5, amlo),
                        },
                    };
                };
                return {};
            },
            formulas() {
                if (inChallenge('b', 91)) return {
                    to: {
                        material_cost: '2 ^ (log50(spice + 50) - 1)',
                        floor_cost: '2 ^ (log50(spice + 50) - 1)',
                    },
                    k: {
                        oven_size: 'log50(spice + 50) - 1',
                        stomach_size: 'log50(spice + 50) - 1',
                    },
                    fr: {
                        water: '2 ^ (log50(spice + 50) - 1)',
                        cold: '2 ^ (log50(spice + 50) - 1)',
                    },
                };
                return {};
            },
            positive() {
                if (inChallenge('b', 91)) return {
                    to: {
                        material_cost: false,
                        floor_cost: false,
                    },
                    k: {
                        oven_size: false,
                        stomach_size: false,
                    },
                    fr: {
                        water: false,
                        cold: false,
                    },
                };
                return {};
            },
            name: 'none',
            color: '#FFFFFF',
        },
        pepper: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.con.condiments).find(condiment => layers.con.condiments[condiment] == this); },
            effect() {
                /** @type {Decimal} */
                const amount = player.con.condiments[this.id].amount,
                    amlo = D.add(amount, 10).log(10).max(0).minus(1);

                return {
                    k: {
                        oven_size: amlo,
                        stomach_size: amlo,
                    },
                    fr: {
                        water: D.pow(.5, amlo),
                        cold: D.pow(.5, amlo),
                    },
                };
            },
            formulas: {
                k: {
                    oven_size: 'log10(pepper + 10) - 1',
                    stomach_size: 'log10(pepper + 10) - 1',
                },
                fr: {
                    water: '2 ^ (log10(pepper + 10) - 1)',
                    cold: '2 ^ (log10(pepper + 10) - 1)',
                },
            },
            positive: {
                k: {
                    oven_size: true,
                    stomach_size: true,
                },
                fr: {
                    water: false,
                    cold: false,
                },
            },
            name: 'pepper',
            color: '#DD3355',
            gain() {
                if (!inChallenge('b', 91) && !hasChallenge('b', 91)) return D.dZero;

                return Object.values(player.con.grid)
                    .filter(data => data.condiment == this.id)
                    .reduce((sum, data) => D.add(sum, D.pow(2.5, data.tier.minus(1))), 0);
            },
        },
        mint: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.con.condiments).find(condiment => layers.con.condiments[condiment] == this); },
            effect() {
                /** @type {Decimal} */
                const amount = player.con.condiments[this.id].amount,
                    amlo = D.add(amount, 10).log(10).max(0).minus(1);

                return {
                    to: {
                        material_cost: D.pow(2, amlo),
                    },
                    k: {
                        oven_size: amlo.neg(),
                    },
                    fr: {
                        water: D.pow(2, amlo),
                        cold: D.pow(2, amlo),
                    },
                };
            },
            formulas: {
                to: {
                    material_cost: '2 ^ (log10(mint + 10) - 1)',
                },
                k: {
                    oven_size: 'log10(mint + 10) - 1',
                },
                fr: {
                    water: '2 ^ (log10(mint + 10) - 1)',
                    cold: '2 ^ (log10(mint + 10) - 1)'
                },
            },
            positive: {
                to: {
                    material_cost: false,
                },
                k: {
                    oven_size: false,
                },
                fr: {
                    water: true,
                    cold: true,
                },
            },
            name: 'mint',
            color: '#99FF99',
            gain() {
                if (!inChallenge('b', 91) && !hasChallenge('b', 91)) return D.dZero;

                return Object.values(player.con.grid)
                    .filter(data => data.condiment == this.id)
                    .reduce((sum, data) => D.add(sum, D.pow(2.5, data.tier.minus(1))), 0);
            },
        },
        vinegar: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.con.condiments).find(condiment => layers.con.condiments[condiment] == this); },
            effect() {
                /** @type {Decimal} */
                const amount = player.con.condiments[this.id].amount,
                    amlo = D.add(amount, 10).log(10).max(0).minus(1);

                return {
                    to: {
                        floor_cost: D.pow(2, amlo),
                    },
                    k: {
                        oven_size: amlo,
                        stomach_size: amlo.neg(),
                    },
                    fr: {
                        water: D.pow(.5, amlo),
                    },
                };
            },
            formulas: {
                to: {
                    floor_cost: '2 ^ (log10(vinegar + 10) - 1)',
                },
                k: {
                    oven_size: 'log10(vinegar + 10) - 1',
                    stomach_size: 'log10(vinegar + 10) - 1',
                },
                fr: {
                    water: '2 ^ (log10(vinegar + 10) - 1)'
                },
            },
            positive: {
                to: {
                    floor_cost: true,
                },
                k: {
                    oven_size: true,
                    stomach_size: false,
                },
                fr: {
                    water: false,
                },
            },
            name: 'vinegar',
            color: '#CC9944',
            gain() {
                if (!inChallenge('b', 91) && !hasChallenge('b', 91)) return D.dZero;

                return Object.values(player.con.grid)
                    .filter(data => data.condiment == this.id)
                    .reduce((sum, data) => D.add(sum, D.pow(2.5, data.tier.minus(1))), 0);
            },
        },
        ginger: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.con.condiments).find(condiment => layers.con.condiments[condiment] == this); },
            effect() {
                /** @type {Decimal} */
                const amount = player.con.condiments[this.id].amount,
                    amlo = D.add(amount, 10).log(10).max(0).minus(1);

                return {
                    to: {
                        material_cost: D.pow(.5, amlo),
                        floor_cost: D.pow(2, amlo),
                    },
                    k: {
                        oven_size: amlo.neg(),
                    },
                    fr: {
                        cold: D.pow(.5, amlo),
                    },
                };
            },
            formulas: {
                to: {
                    material_cost: '2 ^ (log10(ginger + 10) - 1)',
                    floor_cost: '2 ^ (log10(ginger + 10) - 1)',
                },
                k: {
                    oven_size: 'log10(ginger + 10) - 1',
                },
                fr: {
                    cold: '2 ^ (log10(ginger + 10) - 1)',
                },
            },
            positive: {
                to: {
                    material_cost: false,
                    floor_cost: true,
                },
                k: {
                    oven_size: false,
                },
                fr: {
                    cold: true,
                },
            },
            name: 'ginger',
            color: '#BB6600',
            gain() {
                if (!inChallenge('b', 91) && !hasChallenge('b', 91)) return D.dZero;

                return Object.values(player.con.grid)
                    .filter(data => data.condiment == this.id)
                    .reduce((sum, data) => D.add(sum, D.pow(2.5, data.tier.minus(1))), 0);
            },
        },
    },
    update(diff) {
        if (!tmp.con.layerShown) return;

        player.con.points = D.times(tmp.con.spice.gain, diff).add(player.con.points);

        Object.entries(player.con.condiments).forEach(([cond, data]) => {
            const gain = tmp.con.condiments[cond].gain,
                loss = D.times(data.amount, tmp.con.condiments['*'].loss),
                sum = D.minus(gain, loss);

            player.con.condiments[cond].amount = D.add(player.con.condiments[cond].amount, sum.times(diff));
        });
    },
    shouldNotify() { return inChallenge('b', 91) && canCompleteChallenge('b', 91); },
    prestigeNotify() { return D.gte(player.con.points, tmp.con.condiments['*'].cost); },
});
