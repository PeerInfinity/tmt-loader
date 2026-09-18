'use strict';

addLayer('k', {
    name: 'Kitchen',
    symbol: '🍽',
    startData() {
        return {
            unlocked: false,
            points: D.dZero,
            recipes: Object.fromEntries(
                Object.keys(layers.k.recipes).map((recipe) => [recipe, {
                    amount_cooking: D.dZero,
                    amount_target: D.dZero,
                    progress: D.dZero,
                    auto: false,
                }])
            ),
            active: [],
            dishes: Object.fromEntries(
                Object.keys(layers.k.dishes).map((dish) => [dish, {
                    amount: D.dZero,
                }])
            ),
            mode: 'none',
            selected: '',
        };
    },
    tooltip() { return `${formatWhole(tmp.k.dishes["*"].amount)} dishes`; },
    layerShown() { return player[this.layer].unlocked && !tmp[this.layer].deactivated; },
    deactivated() { return inChallenge('b', 31); },
    color: '#5588AA',
    row: 1,
    position: 1.5,
    hotkeys: [
        {
            key: 'k',
            description: 'K: Display kitchen layer',
            unlocked() { return tmp.k.layerShown; },
            onPress() { showTab('k'); },
        }
    ],
    tabFormat: {
        'Cooking': {
            content: [
                () => {
                    const speed = D.times(layers.clo.time_speed('k'), layers.tic.time_speed('k'));

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                ['display-text', () => `Current kitchen temperature: ${tmp.k.temperatures.info[tmp.k.temperatures.current].name}`],
                ['row', [
                    ['clickable', 'heat_none'],
                    'blank',
                    ['clickable', 'heat_low'],
                    'blank',
                    ['clickable', 'heat_medium'],
                    'blank',
                    ['clickable', 'heat_high'],
                ]],
                [
                    'display-text',
                    () => `Hold <span style="${ctrlDown && !shiftDown ? 'text-decoration:underline;' : ''}">control for *10</span>,\
                    <span style="${!ctrlDown && shiftDown ? 'text-decoration:underline;' : ''}">shift for *25</span>,\
                    and <span style="${ctrlDown && shiftDown ? 'text-decoration:underline;' : ''}">both for *250</span>`
                ],
                ['display-text', () => `Due to your oven's size, you can only cook up to ${formatWhole(tmp.k.recipes['*'].size)} of the same food at a time`],
                'blank',
                [
                    'column',
                    () => Object.keys(layers.k.recipes)
                        .filter(recipe => recipe != '*')
                        .map(recipe => layers.k.recipes['*'].show_recipe(recipe))
                ],
            ],
        },
        'Foods': {
            content: [
                ['clickable', 'consume'],
                ['display-text', 'Click a food to see its effects'],
                'blank',
                ['display-text', () => { if (player.k.selected) return layers.k.dishes['*'].description_dish(player.k.selected); }],
                'blank',
                'grid',
            ],
        },
        'Active Buffs': {
            content: [
                () => {
                    const speed = D.times(layers.clo.time_speed('k'), layers.tic.time_speed('k'));

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                ['display-text', () => `Due to your stomach capacity, you can only have up to ${formatWhole(tmp.k.dishes['*'].size)} active buffs`],
                ['display-text', () => `<span class="warning">Eating food with all your active effects slots filled will overwrite the <u>oldest</u> one</span>`],
                ['display-text', () => `<span class="warning">Eating food that is already active will only refresh its duration</span>`],
                'blank',
                ['display-text', () => { if (!player.k.active.length) return 'No active food effects'; }],
                [
                    'column',
                    () => Array.from(
                        { length: player.k.active.length },
                        (_, i) => [
                            ['display-text', layers.k.dishes['*'].description_active(i)],
                            'h-line',
                        ]
                    ).flat(),
                ],
            ],
        },
        'Items': {
            content: [
                () => {
                    const mult = tmp.lo.items["*"].gain_multiplier;

                    if (mult.neq(1)) return [
                        'column', [
                            ['display-text', `Global gain multiplier (does not apply to chances): *${format(mult)}`],
                            'blank',
                        ],
                    ];
                },
                () => {
                    const mult = tmp.lo.items["*"].global_chance_multiplier;

                    if (mult.neq(1)) return [
                        'column', [
                            ['display-text', `Global chance multiplier: *${format(mult)}`],
                            'blank',
                        ],
                    ];
                },
                () => {
                    if (
                        Object.keys(tmp.lo.items).some(item => item != '*' &&
                            (tmp.lo.items[item].unlocked ?? true) &&
                            'per_second' in tmp.lo.items[item].sources)
                    ) return ['display-text', 'Production per second depends on the layer doing it'];
                },
                'blank',
                ['layer-proxy', ['lo', ['grid']]],
            ],
        },
    },
    type: 'none',
    branches: ['xp_alt'],
    temperatures: {
        current() {
            const heat = player.f.points;
            if (heat.lte(1)) return 'none';
            if (heat.lte(10)) return 'low';
            if (heat.lte(50)) return 'medium';
            if (heat.lte(150)) return 'high';
            return 'burning';
        },
        info: {
            none: {
                color: '#CCCCCC',
                name: 'room temperature',
                max: 1,
            },
            low: {
                color: '#CC3333',
                name: 'warm',
                min: 1,
                max: 10,
            },
            medium: {
                color: '#DD0000',
                name: 'hot',
                min: 10,
                max: 50,
            },
            high: {
                color: '#DD7700',
                name: 'boiling',
                min: 50,
                max: 150,
            },
            burning: {
                color: '#FF7700',
                name: 'burning',
                min: 150,
            },
        },
        regex: /^heat_(none|low|medium|high)$/,
    },
    /**
     * TODO
     * tea: boost ent, tree, wood
     *  https://game-icons.net/1x1/delapouite/ice-cubes.html
     *  leaf, water, ice
     */
    recipes: {
        '*': {
            regexes: {
                display: /^recipe_(display)_([a-z_]+)_(\d+)$/,
                bar: /^recipe_(time)_([a-z_]+)$/,
                amount: /^recipe_(increase|decrease|auto)_([a-z_]+)$/,
            },
            show_recipe(recipe_id) {
                if (!recipe_id || !(tmp.k.recipes[recipe_id].unlocked ?? true) || recipe_id == '*') return;

                const recipe = tmp.k.recipes[recipe_id];

                return ['row', [
                    ...recipe.consumes.map((_, i) => ['clickable', `recipe_display_${recipe_id}_${i}`]),
                    'blank',
                    [
                        'display-text',
                        recipe.heats.map(temp => `<span style="color:${tmp.k.temperatures.info[temp].color}">\
                            ${capitalize(tmp.k.temperatures.info[temp].name)}\
                        </span>`).join('<br>')
                    ],
                    'blank',
                    ['bar', `recipe_time_${recipe_id}`],
                    'blank',
                    // I can't put a text-input on a subitem so I'll have to do with what I can
                    ['clickable', `recipe_decrease_${recipe_id}`],
                    ['clickable', `recipe_display_${recipe_id}_${recipe.consumes.length}`],
                    ['clickable', `recipe_increase_${recipe_id}`],
                    ['clickable', `recipe_auto_${recipe_id}`],
                ]];
            },
            size() {
                let size = D.dOne;

                size = size.add(tmp.con.condiments['*'].total.k.oven_size ?? D.dZero);

                return size.round().max(0);
            },
            default_amount(recipe, amount) {
                if (D.gt(amount, 0)) return D(amount);
                if (!recipe) return D.dOne;

                const precipe = player.k.recipes[recipe];
                if (!precipe) return D.dZero;
                if (precipe.amount_cooking.gt(0)) return precipe.amount_cooking;
                if (precipe.amount_target.gt(0)) return precipe.amount_target;
                return D.dOne;
            },
            speed() {
                let mult = D.dOne;

                mult = mult.times(tmp.k.dishes.slime_juice.effect);

                return mult;
            },
            can_cook(recipe_id) {
                if (!recipe_id || !(recipe_id in tmp.k.recipes) || recipe_id == '*') return false;

                return (tmp.k.recipes[recipe_id].unlocked ?? true) &&
                    tmp.k.recipes[recipe_id].consumes.every(([item, amount]) => D.gte(player.lo.items[item].amount, amount));
            },
        },
        grilled_corn: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.k.recipes).find(recipe => layers.k.recipes[recipe] == this); },
            heats: ['low', 'medium'],
            consumes(amount) {
                amount = layers.k.recipes['*'].default_amount(this.id, amount);

                return [['corn', D.pow(1.5, amount)]];
            },
            produces: 'grilled_corn',
            time(amount) {
                amount = layers.k.recipes['*'].default_amount(this.id, amount);

                return D.times(amount, 5).add(10);
            },
            formulas: {
                'corn': '1.5 ^ amount',
                'time': 'amount * 5 + 10',
            },
        },
        roasted_eggplant: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.k.recipes).find(recipe => layers.k.recipes[recipe] == this); },
            heats: ['medium', 'high',],
            consumes(amount) {
                amount = layers.k.recipes['*'].default_amount(this.id, amount);

                return [['eggplant', D.pow(1.5, amount)]];
            },
            produces: 'roasted_eggplant',
            time(amount) {
                amount = layers.k.recipes['*'].default_amount(this.id, amount);

                return D.times(amount, 5).add(10);
            },
            formulas: {
                'eggplant': '1.5 ^ amount',
                'time': 'amount * 5 + 10',
            },
        },
        bread: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.k.recipes).find(recipe => layers.k.recipes[recipe] == this); },
            heats: ['low', 'medium',],
            consumes(amount) {
                amount = layers.k.recipes['*'].default_amount(this.id, amount);

                return [['wheat', D.pow(1.5, amount).times(3)]];
            },
            produces: 'bread',
            time(amount) {
                amount = layers.k.recipes['*'].default_amount(this.id, amount);

                return D.times(amount, 10).add(30);
            },
            formulas: {
                'wheat': '1.5 ^ amount * 3',
                'time': 'amount * 10 + 30',
            },
        },
        berries_bowl: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.k.recipes).find(recipe => layers.k.recipes[recipe] == this); },
            heats: ['none',],
            consumes(amount) {
                amount = layers.k.recipes['*'].default_amount(this.id, amount);

                return [['strawberry', D.pow(1.5, amount).times(5)], ['plank', D.pow(1.1, amount)]];
            },
            produces: 'berries_bowl',
            time(amount) {
                amount = layers.k.recipes['*'].default_amount(this.id, amount);

                return D.times(amount, 20);
            },
            formulas: {
                'strawberry': '1.5 ^ amount * 5',
                'plank': '1.1 ^ amount',
                'time': 'amount * 20',
            },
        },
        french_fries: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.k.recipes).find(recipe => layers.k.recipes[recipe] == this); },
            heats: ['high', 'burning',],
            consumes(amount) {
                amount = layers.k.recipes['*'].default_amount(this.id, amount);

                return [['potato', D.pow(1.5, amount).times(2)]];
            },
            produces: 'french_fries',
            time(amount) {
                amount = layers.k.recipes['*'].default_amount(this.id, amount);

                return D.times(amount, 15).add(30);
            },
            formulas: {
                'potato': '1.5 ^ amount * 2',
                'time': 'amount * 15 + 30',
            },
        },
        fried_eggs: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.k.recipes).find(recipe => layers.k.recipes[recipe] == this); },
            heats: ['medium', 'high',],
            consumes(amount) {
                amount = layers.k.recipes['*'].default_amount(this.id, amount);

                return [['egg', D.pow(1.25, amount).times(2)]];
            },
            produces: 'fried_eggs',
            time(amount) {
                amount = layers.k.recipes['*'].default_amount(this.id, amount);

                return D.times(amount, 15).add(30);
            },
            formulas: {
                'egg': '1.25 ^ amount * 2',
                'time': 'amount * 15 + 30',
            },
        },
        cake: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.k.recipes).find(recipe => layers.k.recipes[recipe] == this); },
            heats: ['high',],
            consumes(amount) {
                amount = layers.k.recipes['*'].default_amount(this.id, amount);

                return [['egg', D.pow(1.25, amount).times(4)], ['wheat', D.pow(1.5, amount).times(8)]];
            },
            produces: 'cake',
            time(amount) {
                amount = layers.k.recipes['*'].default_amount(this.id, amount);

                return D.times(amount, 30).add(60);
            },
            formulas: {
                'egg': '1.25 ^ amount * 4',
                'wheat': '1.5 ^ amount * 8',
                'time': 'amount * 30 + 60',
            },
        },
        ice_cream: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.k.recipes).find(recipe => layers.k.recipes[recipe] == this); },
            heats: ['none',],
            consumes(amount) {
                amount = layers.k.recipes['*'].default_amount(this.id, amount);

                return [
                    ['strawberry', D.pow(1.5, amount).times(5)],
                    ['slime_goo', D.pow(2, amount).times(25)],
                    ['ice', D.pow(1.25, amount)]
                ];
            },
            produces: 'ice_cream',
            time(amount) {
                amount = layers.k.recipes['*'].default_amount(this.id, amount);

                return D.times(amount, 10).add(50);
            },
            formulas: {
                'strawberry': '1.5 ^ amount * 5',
                'slime_goo': '2 ^ amount * 25',
                'ice': '1.25 ^ amount',
                'time': 'amount * 10 + 50',
            },
        },
        popsicle: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.k.recipes).find(recipe => layers.k.recipes[recipe] == this); },
            heats: ['none',],
            consumes(amount) {
                amount = layers.k.recipes['*'].default_amount(this.id, amount);

                return [
                    ['plank', D.pow(1.1, amount)],
                    ['ice', D.pow(1.25, amount).times(10)]
                ];
            },
            produces: 'popsicle',
            time(amount) {
                amount = layers.k.recipes['*'].default_amount(this.id, amount);

                return D.times(amount, 10).add(30);
            },
            formulas: {
                'plank': '1.1 ^ amount',
                'ice': '1.25 ^ amount * 10',
                'time': 'amount * 10 + 30',
            },
        },
        slime_juice: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.k.recipes).find(recipe => layers.k.recipes[recipe] == this); },
            heats: ['none', 'low',],
            consumes(amount) {
                amount = layers.k.recipes['*'].default_amount(this.id, amount);

                return [['slime_goo', D.pow(2, amount).times(10)], ['strawberry', D.pow(1.5, amount).times(5)]];
            },
            produces: 'slime_juice',
            time(amount) {
                amount = layers.k.recipes['*'].default_amount(this.id, amount);

                return D.times(amount, 10).add(30);
            },
            formulas: {
                'slime_goo': '2 ^ amount * 10',
                'strawberry': '1.5 ^ amount * 5',
                'time': 'amount * 10 + 30',
            },
        },
        monster_meal: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.k.recipes).find(recipe => layers.k.recipes[recipe] == this); },
            heats: ['high', 'burning',],
            consumes(amount) {
                amount = layers.k.recipes['*'].default_amount(this.id, amount);

                return [
                    ['slime_goo', D.pow(2, amount).times(25)],
                    ['rotten_flesh', D.pow(2, amount).times(15)],
                    ['brain', D.pow(2, amount)],
                ];
            },
            produces: 'monster_meal',
            time(amount) {
                amount = layers.k.recipes['*'].default_amount(this.id, amount);

                return D.times(amount, 20).add(20);
            },
            formulas: {
                'slime_goo': '2 ^ amount * 25',
                'rotten_flesh': '2 ^ amount * 15',
                'brain': '2 ^ amount',
                'time': '20 * amount + 20',
            },
            unlocked() { return tmp.xp_alt.monsters.zombie.unlocked || tmp.xp_alt.monsters.amalgam.unlocked; },
        },
        star_crunch: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.k.recipes).find(recipe => layers.k.recipes[recipe] == this); },
            heats: ['medium', 'high',],
            consumes(amount) {
                amount = layers.k.recipes['*'].default_amount(this.id, amount);

                return [
                    ['copper_ore', D.pow(1.75, amount).times(50)],
                    ['tin_ore', D.pow(1.75, amount).times(25)],
                    ['gold_ore', D.pow(1.75, amount).times(7.5)],
                    ['stardust', amount],
                ];
            },
            produces: 'star_crunch',
            time(amount) {
                amount = layers.k.recipes['*'].default_amount(this.id, amount);

                return D.pow(1.25, amount).times(60);
            },
            formulas: {
                'copper_ore': '1.75 ^ amount * 50',
                'tin_ore': '1.75 ^ amount * 25',
                'gold_ore': '1.75 ^ amount * 7.5',
                'stardust': 'amount',
                'time': '1.25 ^ amount * 60',
            },
        },
    },
    dishes: {
        '*': {
            amount() { return Object.values(player.k.dishes).reduce((sum, { amount }) => D.add(sum, amount), D.dZero); },
            value() {
                return Object.values(tmp.k.dishes).reduce((sum, dish) => {
                    if (!(dish.unlocked ?? true) || !('id' in dish)) return sum;
                    return D.add(sum, dish.value);
                }, D.dZero);
            },
            size() {
                let size = D.dOne;

                size = size.add(tmp.k.dishes.star_crunch.effect.size);

                size = size.add(tmp.con.condiments['*'].total.k.stomach_size ?? D.dZero);

                return size.round().max(0).toNumber();
            },
            grid_to_dish(id) {
                if (!id) return false;

                const cache = layers.k.dishes['*'].grid_to_dish.cache ??= {};
                if (!(id in cache)) {
                    const dish = Object.keys(tmp.k.dishes)
                        .filter(dish => dish != '*')
                        .find(dish => tmp.k.dishes[dish].grid == id) ?? false;
                    cache[id] = dish;
                }
                return cache[id];
            },
            default_duration(dish, duration) {
                if (D.gt(duration, 0)) return D(duration);
                if (!dish) return D.dZero;

                const active = player.k.active.find(({ id }) => id == dish);
                if (active) return active.time;
                return D.dZero;
            },
            description_active(effect = 0) {
                if (effect > tmp.k.dishes['*'].size || effect >= player.k.active.length) return;

                const active = player.k.active[effect],
                    dish = tmp.k.dishes[active.id],
                    /** @type {time_units} */
                    unit = dish.duration.unit,
                    duration_format = layers.k.dishes['*'].units[unit].format,
                    name = layers.k.dishes['*'].units[unit].name;

                return `<h3>${capitalize(dish.name)}</h3><br>\
                    ${duration_format(active.time)} / ${duration_format(dish.duration.time)} ${name}<br>\
                    ${layers.k.dishes[active.id].effect_description(active.time)}`;
            },
            description_dish(dish_id) {
                if (!dish_id || !(tmp.k.dishes[dish_id].unlocked ?? true)) return;

                const dish = tmp.k.dishes[dish_id],
                    /** @type {time_units} */
                    unit = dish.duration.unit,
                    duration_format = layers.k.dishes['*'].units[unit].format,
                    name = layers.k.dishes['*'].units[unit].name,
                    /** @type {(condiment: string) => string} */
                    condiment_text = condiment => `<span style="color:${tmp.con.condiments[condiment].color};">${tmp.con.condiments[condiment].name}</span>`,
                    good = (tmp.con.layerShown && dish.condiment.good.length) ? `Tastes better with ${listFormat.format(dish.condiment.good.map(condiment_text))}<br>` : '',
                    bad = (tmp.con.layerShown && dish.condiment.bad.length) ? `Tastes worse with ${listFormat.format(dish.condiment.bad.map(condiment_text))}<br>` : '',
                    value = shiftDown ? `Value: ${format(dish.value)} each` : `Total value: ${format(D.times(dish.value, player.k.dishes[dish_id].amount))}`;

                return `${capitalize(dish.name)}<br>\
                        Duration: ${duration_format(dish.duration.time)} ${name}<br>\
                        ${layers.k.dishes[dish_id].effect_description(dish.duration.time)}<br>\
                        ${good}${bad}\
                        ${value}`;
            },
            units: {
                kills: {
                    format,
                    name: 'kills',
                },
                tames: {
                    format,
                    name: 'tames',
                },
                seconds: {
                    format: formatTime,
                    // Seconds doesn't get a name because every form of time is going through this
                    name: '',
                },
            },
            duration_mult() {
                let mult = D.dOne;

                mult = mult.times(tmp.bin.cards.multipliers['k'] ?? 1);

                return mult;
            },
        },
        failure: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.k.dishes).find(/**@param {dishes} dish*/dish => layers.k.dishes[dish] == this); },
            grid: 101,
            style: {
                'background-image': `url('./resources/images/carrion.svg')`,
                'background-color': '#CCCCCC',
            },
            name: 'failed food',
            type: 'food',
            duration: {
                _id: null,
                get id() { return this._id ??= Object.keys(layers.k.dishes).find(/**@param {dishes} dish*/dish => layers.k.dishes[dish].duration == this); },
                unit: 'seconds',
                time() {
                    let time = D(10);

                    time = time.times(tmp.k.dishes['*'].duration_mult);

                    if (tmp.k.dishes[this.id].condiment.good.includes(tmp.con.condiments['*'].highest)) {
                        time = time.times(tmp.con.condiments['*'].bonus);
                    }
                    if (tmp.k.dishes[this.id].condiment.bad.includes(tmp.con.condiments['*'].highest)) {
                        time = time.times(tmp.con.condiments['*'].malus);
                    }

                    return time;
                },
            },
            effect(duration) {
                duration = layers.k.dishes['*'].default_duration(this.id, duration);
                if (tmp.k.deactivated) duration = D.dZero;
                if (D.gt(duration, 0)) return D(.5);
                return D.dOne;
            },
            effect_description(duration) { return `Multiplies XP gain, building production/consumption, and harvest yield by 0.5`; },
            value() {
                let value = D.dZero;

                if (hasUpgrade('s', 31)) value = value.add(upgradeEffect('s', 31).pow(tmp.a.change_efficiency));

                return value;
            },
            condiment: {
                good: [],
                bad: [],
            },
        },
        grilled_corn: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.k.dishes).find(/**@param {dishes} dish*/dish => layers.k.dishes[dish] == this); },
            grid: 201,
            style: {
                'background-image': `url('./resources/images/corn.svg')`,
                'background-color': '#EEDD44',
            },
            name: 'grilled corn',
            type: 'food',
            duration: {
                _id: null,
                get id() { return this._id ??= Object.keys(layers.k.dishes).find(/**@param {dishes} dish*/dish => layers.k.dishes[dish].duration == this); },
                unit: 'seconds',
                time() {
                    let time = D(150);

                    time = time.times(tmp.k.dishes['*'].duration_mult);

                    if (tmp.k.dishes[this.id].condiment.good.includes(tmp.con.condiments['*'].highest)) {
                        time = time.times(tmp.con.condiments['*'].bonus);
                    }
                    if (tmp.k.dishes[this.id].condiment.bad.includes(tmp.con.condiments['*'].highest)) {
                        time = time.times(tmp.con.condiments['*'].malus);
                    }

                    return time;
                },
            },
            effect(duration) {
                duration = layers.k.dishes['*'].default_duration(this.id, duration);
                if (tmp.k.deactivated) duration = D.dZero;
                if (D.gt(duration, 0)) return D.div(duration, 60).add(1);
                return D.dOne;
            },
            effect_description(duration) {
                if (D.lte(duration, 0)) duration = D(tmp.k.dishes[this.id].duration.time);
                let effect = shiftDown ? '[time left / 60 + 1]' : format(this.effect(duration));
                return `Multiplies plant harvest yield by ${effect}`;
            },
            value() {
                let value = D.dOne;

                if (hasUpgrade('s', 31)) value = value.add(upgradeEffect('s', 31).pow(tmp.a.change_efficiency));

                return value;
            },
            condiment: {
                good: ['pepper'],
                bad: ['mint'],
            },
        },
        roasted_eggplant: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.k.dishes).find(/**@param {dishes} dish*/dish => layers.k.dishes[dish] == this); },
            grid: 202,
            style: {
                'background-image': `url('./resources/images/aubergine.svg')`,
                'background-color': '#553344',
                'color': '#888888',
            },
            name: 'roasted eggplant',
            type: 'food',
            duration: {
                _id: null,
                get id() { return this._id ??= Object.keys(layers.k.dishes).find(/**@param {dishes} dish*/dish => layers.k.dishes[dish].duration == this); },
                unit: 'seconds',
                time() {
                    let time = D(60);

                    time = time.times(tmp.k.dishes['*'].duration_mult);

                    if (tmp.k.dishes[this.id].condiment.good.includes(tmp.con.condiments['*'].highest)) {
                        time = time.times(tmp.con.condiments['*'].bonus);
                    }
                    if (tmp.k.dishes[this.id].condiment.bad.includes(tmp.con.condiments['*'].highest)) {
                        time = time.times(tmp.con.condiments['*'].malus);
                    }

                    return time;
                },
            },
            effect(duration) {
                duration = layers.k.dishes['*'].default_duration(this.id, duration);
                if (tmp.k.deactivated) duration = D.dZero;
                if (D.gt(duration, 0)) return D.pow(2, D.div(duration, 60));
                return D.dOne;
            },
            effect_description(duration) {
                if (D.lte(duration, 0)) duration = D(tmp.k.dishes[this.id].duration.time);
                let effect = shiftDown ? '[2 ^ (time left / 60)]' : format(this.effect(duration));
                return `Multiplies plant growth speed by ${effect}`;
            },
            value() {
                let value = D.dOne;

                if (hasUpgrade('s', 31)) value = value.add(upgradeEffect('s', 31).pow(tmp.a.change_efficiency));

                return value;
            },
            condiment: {
                good: ['pepper'],
                bad: ['ginger'],
            },
        },
        bread: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.k.dishes).find(/**@param {dishes} dish*/dish => layers.k.dishes[dish] == this); },
            grid: 301,
            style: {
                'background-image': `url('./resources/images/sliced-bread.svg')`,
                'background-color': '#FFCC88',
            },
            name: 'bread',
            type: 'food',
            duration: {
                _id: null,
                get id() { return this._id ??= Object.keys(layers.k.dishes).find(/**@param {dishes} dish*/dish => layers.k.dishes[dish].duration == this); },
                unit: 'seconds',
                time() {
                    let time = D(120);

                    time = time.times(tmp.k.dishes['*'].duration_mult);

                    if (tmp.k.dishes[this.id].condiment.good.includes(tmp.con.condiments['*'].highest)) {
                        time = time.times(tmp.con.condiments['*'].bonus);
                    }
                    if (tmp.k.dishes[this.id].condiment.bad.includes(tmp.con.condiments['*'].highest)) {
                        time = time.times(tmp.con.condiments['*'].malus);
                    }

                    return time;
                },
            },
            effect(duration) {
                duration = layers.k.dishes['*'].default_duration(this.id, duration);
                if (tmp.k.deactivated) duration = D.dZero;
                if (D.gt(duration, 0)) return D.pow(1.25, D.div(duration, 20));
                return D.dOne;
            },
            effect_description(duration) {
                if (D.lte(duration, 0)) duration = D(tmp.k.dishes[this.id].duration.time);
                let effect = shiftDown ? '[1.25 ^ (time left / 20)]' : format(this.effect(duration));
                return `Multiplies city production/consumption by ${effect}`;
            },
            value() {
                let value = D.dTwo;

                if (hasUpgrade('s', 31)) value = value.add(upgradeEffect('s', 31).pow(tmp.a.change_efficiency));

                return value;
            },
            condiment: {
                good: ['ginger'],
                bad: ['mint'],
            },
        },
        berries_bowl: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.k.dishes).find(/**@param {dishes} dish*/dish => layers.k.dishes[dish] == this); },
            grid: 302,
            style: {
                'background-image': `url('./resources/images/berries-bowl.svg')`,
                'background-color': '#FF44AA',
            },
            name: 'berries bowl',
            type: 'food',
            duration: {
                _id: null,
                get id() { return this._id ??= Object.keys(layers.k.dishes).find(/**@param {dishes} dish*/dish => layers.k.dishes[dish].duration == this); },
                unit: 'seconds',
                time() {
                    let time = D(20);

                    time = time.times(tmp.k.dishes['*'].duration_mult);

                    if (tmp.k.dishes[this.id].condiment.good.includes(tmp.con.condiments['*'].highest)) {
                        time = time.times(tmp.con.condiments['*'].bonus);
                    }
                    if (tmp.k.dishes[this.id].condiment.bad.includes(tmp.con.condiments['*'].highest)) {
                        time = time.times(tmp.con.condiments['*'].malus);
                    }

                    return time;
                },
            },
            effect(duration) {
                duration = layers.k.dishes['*'].default_duration(this.id, duration);
                if (tmp.k.deactivated) duration = D.dZero;
                if (D.gt(duration, 0)) return D.pow(1.5, D.div(duration, 5));
                return D.dOne;
            },
            effect_description(duration) {
                if (D.lte(duration, 0)) duration = D(tmp.k.dishes[this.id].duration.time);
                let effect = shiftDown ? '[1.5 ^ (time left / 5)]' : format(this.effect(duration));
                return `Multiplies passive monster gain by ${effect}`;
            },
            value() {
                let value = D.dTwo;

                if (hasUpgrade('s', 31)) value = value.add(upgradeEffect('s', 31).pow(tmp.a.change_efficiency));

                return value;
            },
            condiment: {
                good: ['mint'],
                bad: ['pepper'],
            },
        },
        french_fries: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.k.dishes).find(/**@param {dishes} dish*/dish => layers.k.dishes[dish] == this); },
            grid: 303,
            style: {
                'background-image': `url('./resources/images/french-fries.svg')`,
                'background-color': '#FFDD88',
            },
            name: 'french fries',
            type: 'food',
            duration: {
                _id: null,
                get id() { return this._id ??= Object.keys(layers.k.dishes).find(/**@param {dishes} dish*/dish => layers.k.dishes[dish].duration == this); },
                unit: 'seconds',
                time() {
                    let time = D(30);

                    time = time.times(tmp.k.dishes['*'].duration_mult);

                    if (tmp.k.dishes[this.id].condiment.good.includes(tmp.con.condiments['*'].highest)) {
                        time = time.times(tmp.con.condiments['*'].bonus);
                    }
                    if (tmp.k.dishes[this.id].condiment.bad.includes(tmp.con.condiments['*'].highest)) {
                        time = time.times(tmp.con.condiments['*'].malus);
                    }

                    return time;
                },
            },
            effect(duration) {
                duration = layers.k.dishes['*'].default_duration(this.id, duration);
                if (tmp.k.deactivated) duration = D.dZero;
                if (D.gt(duration, 0)) return D.pow(1.25, D.div(duration, 10));
                return D.dOne;
            },
            effect_description(duration) {
                if (D.lte(duration, 0)) duration = D(tmp.k.dishes[this.id].duration.time);
                let effect = shiftDown ? '[1.25 ^ (time left / 10)]' : format(this.effect(duration));
                return `Divides city consumption by ${effect}`;
            },
            value() {
                let value = D.dTwo;

                if (hasUpgrade('s', 31)) value = value.add(upgradeEffect('s', 31).pow(tmp.a.change_efficiency));

                return value;
            },
            condiment: {
                good: ['vinegar'],
                bad: ['ginger'],
            },
        },
        fried_eggs: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.k.dishes).find(/**@param {dishes} dish*/dish => layers.k.dishes[dish] == this); },
            grid: 401,
            style: {
                'background-image': `url('./resources/images/fried-eggs.svg')`,
                'background-color': '#EEDDCC',
            },
            name: 'fried eggs',
            type: 'food',
            duration: {
                _id: null,
                get id() { return this._id ??= Object.keys(layers.k.dishes).find(/**@param {dishes} dish*/dish => layers.k.dishes[dish].duration == this); },
                unit: 'tames',
                time() {
                    let time = D(10);

                    time = time.times(tmp.k.dishes['*'].duration_mult);

                    if (tmp.k.dishes[this.id].condiment.good.includes(tmp.con.condiments['*'].highest)) {
                        time = time.times(tmp.con.condiments['*'].bonus);
                    }
                    if (tmp.k.dishes[this.id].condiment.bad.includes(tmp.con.condiments['*'].highest)) {
                        time = time.times(tmp.con.condiments['*'].malus);
                    }

                    return time;
                },
            },
            effect(duration) {
                duration = layers.k.dishes['*'].default_duration(this.id, duration);
                if (tmp.k.deactivated) duration = D.dZero;
                if (D.gt(duration, 0)) return { tames: D.dTwo, prod: D(.5), };
                return { tames: D.dOne, prod: D.dOne };
            },
            effect_description(duration) { return `Multiplies monster tames by 2, but divides monster production by 2`; },
            value() {
                let value = D(3);

                if (hasUpgrade('s', 31)) value = value.add(upgradeEffect('s', 31).pow(tmp.a.change_efficiency));

                return value;
            },
            condiment: {
                good: ['pepper'],
                bad: ['mint'],
            },
        },
        cake: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.k.dishes).find(/**@param {dishes} dish*/dish => layers.k.dishes[dish] == this); },
            grid: 402,
            style: {
                'background-image': `url('./resources/images/cake-slice.svg')`,
                'background-color': '#CCDDEE',
            },
            name: 'cake',
            type: 'food',
            duration: {
                _id: null,
                get id() { return this._id ??= Object.keys(layers.k.dishes).find(/**@param {dishes} dish*/dish => layers.k.dishes[dish].duration == this); },
                unit: 'tames',
                time() {
                    let time = D(20);

                    time = time.times(tmp.k.dishes['*'].duration_mult);

                    if (tmp.k.dishes[this.id].condiment.good.includes(tmp.con.condiments['*'].highest)) {
                        time = time.times(tmp.con.condiments['*'].bonus);
                    }
                    if (tmp.k.dishes[this.id].condiment.bad.includes(tmp.con.condiments['*'].highest)) {
                        time = time.times(tmp.con.condiments['*'].malus);
                    }

                    return time;
                },
            },
            effect(duration) {
                duration = layers.k.dishes['*'].default_duration(this.id, duration);
                if (tmp.k.deactivated) duration = D.dZero;
                if (D.gt(duration, 0)) return D.pow(1.25, D.div(duration, 5));
                return D.dOne;
            },
            effect_description(duration) {
                if (D.lte(duration, 0)) duration = D(tmp.k.dishes[this.id].duration.time);
                let effect = shiftDown ? '[1.25 ^ (time left / 5)]' : format(this.effect(duration));
                return `Multiplies taming progress by ${effect}`;
            },
            value() {
                let value = D(4);

                if (hasUpgrade('s', 31)) value = value.add(upgradeEffect('s', 31).pow(tmp.a.change_efficiency));

                return value;
            },
            condiment: {
                good: ['mint'],
                bad: ['vinegar'],
            },
        },
        ice_cream: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.k.dishes).find(/**@param {dishes} dish*/dish => layers.k.dishes[dish] == this); },
            grid: 501,
            style: {
                'background-image': `url('./resources/images/ice-cream-cone.svg')`,
                'background-color': '#FFAAAA',
            },
            name: 'ice cream',
            type: 'food',
            duration: {
                _id: null,
                get id() { return this._id ??= Object.keys(layers.k.dishes).find(/**@param {dishes} dish*/dish => layers.k.dishes[dish].duration == this); },
                unit: 'seconds',
                time() {
                    let time = D(60);

                    time = time.times(tmp.k.dishes['*'].duration_mult);

                    if (tmp.k.dishes[this.id].condiment.good.includes(tmp.con.condiments['*'].highest)) {
                        time = time.times(tmp.con.condiments['*'].bonus);
                    }
                    if (tmp.k.dishes[this.id].condiment.bad.includes(tmp.con.condiments['*'].highest)) {
                        time = time.times(tmp.con.condiments['*'].malus);
                    }

                    return time;
                },
            },
            effect(duration) {
                duration = layers.k.dishes['*'].default_duration(this.id, duration);
                if (tmp.k.deactivated) duration = D.dZero;
                if (D.gt(duration, 0)) return D.pow(1.1, D.div(duration, 15));
                return D.dOne;
            },
            effect_description(duration) {
                if (D.lte(duration, 0)) duration = D(tmp.k.dishes[this.id].duration.time);
                let effect = shiftDown ? '[1.1 ^ (time left / 15)]' : format(this.effect(duration));
                return `Multiplies slime and freezer production by ${effect}`;
            },
            value() {
                let value = D(3);

                if (hasUpgrade('s', 31)) value = value.add(upgradeEffect('s', 31).pow(tmp.a.change_efficiency));

                return value;
            },
            unlocked() { return tmp.fr.layerShown; },
            condiment: {
                good: ['mint'],
                bad: ['ginger'],
            },
        },
        popsicle: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.k.dishes).find(/**@param {dishes} dish*/dish => layers.k.dishes[dish] == this); },
            grid: 502,
            style: {
                'background-image': `url('./resources/images/ice-pop.svg')`,
                'background-color': '#BBBBFF',
            },
            name: 'popsicle',
            type: 'food',
            duration: {
                _id: null,
                get id() { return this._id ??= Object.keys(layers.k.dishes).find(/**@param {dishes} dish*/dish => layers.k.dishes[dish].duration == this); },
                unit: 'seconds',
                time() {
                    let time = D(30);

                    time = time.times(tmp.k.dishes['*'].duration_mult);

                    if (tmp.k.dishes[this.id].condiment.good.includes(tmp.con.condiments['*'].highest)) {
                        time = time.times(tmp.con.condiments['*'].bonus);
                    }
                    if (tmp.k.dishes[this.id].condiment.bad.includes(tmp.con.condiments['*'].highest)) {
                        time = time.times(tmp.con.condiments['*'].malus);
                    }

                    return time;
                },
            },
            effect(duration) {
                duration = layers.k.dishes['*'].default_duration(this.id, duration);
                if (tmp.k.deactivated) duration = D.dZero;
                if (D.gt(duration, 0)) return D.pow(1.2, D.div(duration, 10));
                return D.dOne;
            },
            effect_description(duration) {
                if (D.lte(duration, 0)) duration = D(tmp.k.dishes[this.id].duration.time);
                let effect = shiftDown ? '[1.2 ^ (time left / 10)]' : format(this.effect(duration));
                const tower_effect = tmp.to.layerShown ? ' and divides tower cost' : '';
                return `Multiplies freezer production${tower_effect} by ${effect}`;
            },
            value() {
                let value = D(3);

                if (hasUpgrade('s', 31)) value = value.add(upgradeEffect('s', 31).pow(tmp.a.change_efficiency));

                return value;
            },
            unlocked() { return tmp.fr.layerShown; },
            condiment: {
                good: ['mint'],
                bad: ['pepper'],
            },
        },
        slime_juice: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.k.dishes).find(/**@param {dishes} dish*/dish => layers.k.dishes[dish] == this); },
            grid: 601,
            style: {
                'background-image': `url('./resources/images/glass-shot.svg')`,
                'background-color': '#77BBBB',
            },
            name: 'slime juice',
            type: 'drink',
            duration: {
                _id: null,
                get id() { return this._id ??= Object.keys(layers.k.dishes).find(/**@param {dishes} dish*/dish => layers.k.dishes[dish].duration == this); },
                unit: 'seconds',
                time() {
                    let time = D(60);

                    time = time.times(tmp.k.dishes['*'].duration_mult);

                    if (tmp.k.dishes[this.id].condiment.good.includes(tmp.con.condiments['*'].highest)) {
                        time = time.times(tmp.con.condiments['*'].bonus);
                    }
                    if (tmp.k.dishes[this.id].condiment.bad.includes(tmp.con.condiments['*'].highest)) {
                        time = time.times(tmp.con.condiments['*'].malus);
                    }

                    return time;
                },
            },
            effect(duration) {
                duration = layers.k.dishes['*'].default_duration(this.id, duration);
                if (tmp.k.deactivated) duration = D.dZero;
                if (D.gt(duration, 0)) return D.dTwo;
                return D.dOne;
            },
            effect_description(duration) { return `Multiplies cooking speed by 2`; },
            value() {
                let value = D(3);

                if (hasUpgrade('s', 31)) value = value.add(upgradeEffect('s', 31).pow(tmp.a.change_efficiency));

                return value;
            },
            condiment: {
                good: ['ginger'],
                bad: ['vinegar'],
            },
        },
        monster_meal: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.k.dishes).find(/**@param {dishes} dish*/dish => layers.k.dishes[dish] == this); },
            grid: 602,
            style: {
                'background-image': `url('./resources/images/hot-meal.svg')`,
                'background-color': '#779977',
            },
            name: 'monster meal',
            type: 'food',
            duration: {
                _id: null,
                get id() { return this._id ??= Object.keys(layers.k.dishes).find(/**@param {dishes} dish*/dish => layers.k.dishes[dish].duration == this); },
                unit: 'tames',
                time() {
                    let time = D(45);

                    time = time.times(tmp.k.dishes['*'].duration_mult);

                    if (tmp.k.dishes[this.id].condiment.good.includes(tmp.con.condiments['*'].highest)) {
                        time = time.times(tmp.con.condiments['*'].bonus);
                    }
                    if (tmp.k.dishes[this.id].condiment.bad.includes(tmp.con.condiments['*'].highest)) {
                        time = time.times(tmp.con.condiments['*'].malus);
                    }

                    return time;
                },
            },
            effect(duration) {
                duration = layers.k.dishes['*'].default_duration(this.id, duration);
                if (tmp.k.deactivated) duration = D.dZero;
                if (D.gt(duration, 0)) return D.div(duration, 30);
                return D.dZero;
            },
            effect_description(duration) {
                if (D.lte(duration, 0)) duration = D(tmp.k.dishes[this.id].duration.time);
                let effect = shiftDown ? '[time left / 30 * 100]' : format(this.effect(duration).times(100));
                return `Passively tames zombies with ${effect}% efficiency`;
            },
            value() {
                let value = D(3);

                if (hasUpgrade('s', 31)) value = value.add(upgradeEffect('s', 31).pow(tmp.a.change_efficiency));

                return value;
            },
            unlocked() { return tmp.xp_alt.monsters.zombie.unlocked || tmp.xp_alt.monsters.amalgam.unlocked; },
            condiment: {
                good: ['mint'],
                bad: ['ginger'],
            },
        },
        star_crunch: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.k.dishes).find(/**@param {dishes} dish*/dish => layers.k.dishes[dish] == this); },
            grid: 603,
            style: {
                'background-image': `url('./resources/images/staryu.svg')`,
                'background-color'() { return tmp.xp.enemies.star.color; },
            },
            name: 'star crunch',
            duration: {
                _id: null,
                get id() { return this._id ??= Object.keys(layers.k.dishes).find(/**@param {dishes} dish*/dish => layers.k.dishes[dish].duration == this); },
                unit: 'seconds',
                time() {
                    let time = D(300);

                    time = time.times(tmp.k.dishes['*'].duration_mult);

                    if (tmp.k.dishes[this.id].condiment.good.includes(tmp.con.condiments['*'].highest)) {
                        time = time.times(tmp.con.condiments['*'].bonus);
                    }
                    if (tmp.k.dishes[this.id].condiment.bad.includes(tmp.con.condiments['*'].highest)) {
                        time = time.times(tmp.con.condiments['*'].malus);
                    }

                    return time;
                },
            },
            effect(duration) {
                duration = layers.k.dishes['*'].default_duration(this.id, duration);
                if (tmp.k.deactivated) duration = D.dZero;
                if (D.gt(duration, 0)) return { time: D.div(duration, 10), size: D.dTwo };
                return { time: D.dZero, size: D.dZero };
            },
            effect_description(duration) {
                if (D.lte(duration, 0)) duration = D(tmp.k.dishes[this.id].duration.time);
                let effect = shiftDown ? '[time left / 10]' : formatTime(this.effect(duration).time);
                return `Increases base star time by ${effect}, and stomach size by 2`;
            },
            value() {
                let value = D.dTen;

                if (hasUpgrade('s', 31)) value = value.add(upgradeEffect('s', 31).pow(tmp.a.change_efficiency));

                return value;
            },
            condiment: {
                good: ['mint', 'pepper'],
                bad: ['vinegar', 'ginger'],
            },
        },
    },
    grid: {
        rows: 6,
        cols: 3,
        getStartData(_) { return {}; },
        getStyle(_, id) {
            const dish_id = layers.k.dishes['*'].grid_to_dish(id);
            if (!dish_id || !(tmp.k.dishes[dish_id].unlocked ?? true)) return { 'display': 'none', };

            const dish = tmp.k.dishes[dish_id],
                selected = player.k.selected == dish_id ? { 'box-shadow': '#5588AA 0 0 20px' } : {};
            return Object.assign(
                {
                    'background-repeat': 'no-repeat',
                    'background-position': 'center',
                    'background-size': 'contain',
                    'color': 'black',
                },
                dish.style,
                selected,
            );
        },
        getUnlocked(_, id) {
            if (id === undefined) return true;
            const dish_id = layers.k.dishes['*'].grid_to_dish(id);
            if (!dish_id) return false;

            return tmp.k.dishes[dish_id].unlocked ?? true;
        },
        getTitle(_, id) {
            const dish_id = layers.k.dishes['*'].grid_to_dish(id);
            if (!dish_id) return;

            const dish = tmp.k.dishes[dish_id];

            return capitalize_words(dish.name);
        },
        getDisplay(_, id) {
            const dish_id = layers.k.dishes['*'].grid_to_dish(id);
            if (!dish_id) return;

            return format(player.k.dishes[dish_id].amount);
        },
        getTooltip(_, id) {
            const dish_id = layers.k.dishes['*'].grid_to_dish(id);
            if (!dish_id) return;

            return capitalize(tmp.k.dishes[dish_id].name);
        },
        onClick(_, id) {
            const dish_id = layers.k.dishes['*'].grid_to_dish(id);
            if (!dish_id) return;

            if (player.k.selected == dish_id) player.k.selected = '';
            else player.k.selected = dish_id;
        },
    },
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        const keep = ['mode'],
            /** @type {[id: string, data: {amount_target: Decimal, auto: boolean}][]} */
            rec = Object.entries(player.k.recipes).map(([id, data]) => [id, {
                amount_target: data.amount_target,
                auto: data.auto,
            }]);

        layerDataReset(this.layer, keep);

        if (!keep.includes('active')) player.k.active = [];

        rec.forEach(([id, data]) => {
            player.k.recipes[id].amount_target = data.amount_target;
            player.k.recipes[id].auto = data.auto;
        });
    },
    clickables: new Proxy({}, {
        /** @returns {Clickable<'k'>} */
        get(obj, prop) {
            // Required to not break the auto stuff
            if (prop == 'constructor') return obj.constructor;
            if (prop == 'layer') return 'f';

            if (prop in obj) return obj[prop];

            if (prop == 'consume') {
                return obj[prop] ??= {
                    title() {
                        const dish_id = player.k.selected,
                            name = dish_id ? tmp.k.dishes[dish_id].name : 'nothing',
                            type = {
                                'food': 'Eat',
                                'drink': 'Drink',
                            }[tmp.k.dishes[dish_id]?.type] ?? 'Consume';
                        return `${type} ${name}`;
                    },
                    canClick() { return player.k.selected != '' && D.gte(player.k.dishes[player.k.selected].amount, 1) && D.gt(tmp.k.dishes['*'].size, 0); },
                    onClick() {
                        const selected = player.k.selected;

                        if (!selected || D.lt(player.k.dishes[selected].amount, 1)) return;

                        player.k.dishes[selected].amount = D.minus(player.k.dishes[selected].amount, 1);

                        // Check if dish is already active
                        const index = player.k.active.findIndex(({ id }) => id == selected);
                        if (index != -1) {
                            player.k.active.splice(index, 1);
                        }

                        player.k.active.push({
                            id: selected,
                            units: tmp.k.dishes[selected].duration.unit,
                            time: tmp.k.dishes[selected].duration.time,
                        });

                        if (D.gt(player.k.active.length, tmp.k.dishes['*'].size)) {
                            player.k.active.shift();
                        }
                    },
                };
            }

            const temp_matches = layers.k.temperatures.regex.exec(prop);
            if (temp_matches) {
                /** @type {[string, temperatures]} */
                const [, temp] = temp_matches;

                return obj[prop] ??= {
                    display() { return `Set temperature to ${tmp.k.temperatures.info[temp].name}`; },
                    canClick() { return player.k.mode != temp; },
                    onClick() { player.k.mode = temp; },
                };
            }

            const recipe_display_matches = layers.k.recipes['*'].regexes.display.exec(prop);
            if (recipe_display_matches) {
                /** @type {[string, 'display', string, string]} */
                const [, , recipe_id, index] = recipe_display_matches,
                    recipe = () => tmp.k?.recipes[recipe_id],
                    precipe = () => player.k?.recipes[recipe_id],
                    /** @type {() => [items|dishes, Decimal]} */
                    entry = () => {
                        if (+index < recipe().consumes.length) {
                            let e = [...recipe().consumes[+index]];
                            e[1] = e[1].neg();
                            return e;
                        } else {
                            let amount;
                            if (precipe().amount_cooking.gt(0)) amount = precipe().amount_cooking;
                            else amount = precipe().amount_target;

                            return [recipe().produces, amount];
                        }
                    },
                    is_output = () => +index == recipe().consumes.length;

                if (!recipe()) return;

                return obj[prop] ??= {
                    canClick() {
                        return !is_output() ||
                            precipe().amount_cooking.lte(0) &&
                            precipe().amount_target.gt(0) &&
                            layers.k.recipes['*'].can_cook(recipe_id) &&
                            recipe().heats.includes(tmp.k.temperatures.current) &&
                            tmp.k.recipes['*'].size.gte(precipe().amount_target);
                    },
                    display() {
                        const out = is_output(),
                            name = (out ? tmp.k?.dishes : tmp.lo?.items)[entry()[0]].name;
                        if (!shiftDown) {
                            const amount = (out ? player.k.dishes : player.lo.items)[entry()[0]].amount;
                            return `<h3>${capitalize(name)}</h3><br>\
                                ${format(amount)}<br>\
                                ${D.gt(entry()[1], 0) ? '+' : ''}${format(entry()[1])}\
                                ${out && precipe().amount_cooking.gt(0) ? '<br><i>In progress</i>' : ''}`;
                        } else {
                            return `<h3>${capitalize(name)}</h3><br>\
                                Formula: ${recipe().formulas[entry()[0]] ?? 'amount'}\
                                ${out && precipe().amount_cooking.gt(0) ? '<br><i>In progress</i>' : ''}`;
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
                        }, (is_output() ? tmp.k?.dishes : tmp.lo?.items)[entry()[0]].style);

                        if (is_output()) {
                            if (precipe().amount_cooking.gt(0)) {
                                style['filter'] = 'drop-shadow(0 0 5px orange)';
                            } else if (precipe().amount_target.lte(0) || !layers.k.recipes['*'].can_cook(recipe_id) || !recipe().heats.includes(tmp.k.temperatures.current)) {
                                style['filter'] = 'brightness(75%)';
                            }
                        }

                        return style;
                    },
                    onClick() {
                        if (is_output()) {
                            const amount = precipe().amount_target.max(tmp.k.recipes['*'].size);

                            if (amount.lte(0)) return;

                            recipe().consumes.forEach(([item, cost]) => {
                                gain_items(item, D.times(cost, amount).neg());
                            });
                            precipe().amount_cooking = amount;
                        }
                    },
                };
            }

            const recipe_amount_matches = layers.k.recipes['*'].regexes.amount.exec(prop);
            if (recipe_amount_matches) {
                /** @type {[string, 'increase'|'decrease'|'auto', string]} */
                const [, mode, recipe_id] = recipe_amount_matches,
                    recipe = () => tmp.k?.recipes[recipe_id],
                    precipe = () => player.k?.recipes[recipe_id],
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
                                if (precipe().amount_target.gte(tmp.k.recipes['*'].size)) return false;
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
                    unlocked() {
                        if (mode == 'auto') return false;
                        return recipe().unlocked ?? true;
                    },
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
                                precipe().amount_target = precipe().amount_target.add(amount).min(tmp.k.recipes['*'].size).max(0);
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
                layers.k.temperatures.regex.exec(prop) ||
                layers.k.recipes['*'].regexes.display.exec(prop) ||
                layers.k.recipes['*'].regexes.amount.exec(prop) ||
                prop == 'consume') return {
                    enumerable: true,
                    configurable: true,
                };
        },
        has(_, prop) {
            return tmp.k.temperatures.regex.exec(prop) ||
                layers.k.recipes['*'].regexes.display.exec(prop) ||
                layers.k.recipes['*'].regexes.amount.exec(prop) || prop == 'consume';
        },
        ownKeys() {
            return [
                ...Object.keys(layers.k.temperatures.info).map(temp => `heat_${temp}`),
                ...Object.keys(layers.k.recipes)
                    .filter(recipe => recipe != '*')
                    .map(recipe => {
                        let length = 1;
                        if (tmp.k && Array.isArray(tmp.k.recipes[recipe].consumes)) length = tmp.k.recipes[recipe].consumes.length + 1;
                        else if (layers.k) length = layers.k.recipes[recipe].consumes(D(1)).length + 1;

                        return [
                            ...Array.from({ length }, (_, i) => `recipe_display_${recipe}_${i}`),
                            `recipe_increase_${recipe}`,
                            `recipe_decrease_${recipe}`,
                            `recipe_auto_${recipe}`,
                        ];
                    }).flat(),
                'consume',
            ];
        },
    }),
    bars: new Proxy({}, {
        /** @returns {Bar<'k'>} */
        get(obj, prop) {
            // Required to not break the auto stuff
            if (prop == 'constructor') return obj.constructor;
            if (prop == 'layer') return 'f';

            if (prop in obj) return obj[prop];

            const bar_matches = layers.k.recipes['*'].regexes.bar.exec(prop);
            if (bar_matches) {
                /** @type {[string, 'time', string]} */
                const [, , recipe_id] = bar_matches,
                    recipe = () => tmp.k?.recipes[recipe_id];

                if (!recipe()) return {};

                return obj[prop] ??= {
                    direction: RIGHT,
                    width: 160,
                    height: 80,
                    unlocked() { return recipe().unlocked ?? true; },
                    progress() { return D.div(player.k.recipes[recipe_id]?.progress, recipe().time); },
                    display() {
                        if (!shiftDown) {
                            return `${formatTime(player.k.recipes[recipe_id]?.progress)} / ${formatTime(recipe().time)}`;
                        } else {
                            return `Formula: ${recipe().formulas.time}`;
                        }
                    },
                    textStyle: { 'color': 'gray', },
                };
            }
        },
        getOwnPropertyDescriptor(_, prop) {
            if (prop == 'layer' ||
                layers.k.recipes['*'].regexes.bar.exec(prop)) return {
                    enumerable: true,
                    configurable: true,
                };
        },
        has(_, prop) { return layers.k.recipes['*'].regexes.bar.exec(prop); },
        ownKeys() {
            return [
                ...Object.keys(layers.k.recipes)
                    .filter(recipe => recipe != '*')
                    .map(recipe => `recipe_time_${recipe}`),
            ];
        },
    }),
    update(diff) {
        if (tmp.clo.layerShown) diff = D.times(diff, layers.clo.time_speed(this.layer));
        if (tmp.tic.layerShown) diff = D.times(diff, layers.tic.time_speed(this.layer));

        // Tick down active effects
        player.k.active.filter(data => data.units == 'seconds')
            .forEach(data => {
                data.time = D.minus(data.time, diff);
            });

        // Remove finished active effects
        player.k.active = player.k.active.filter(data => D.gt(data.time, 0));

        // Cook
        Object.keys(layers.k.recipes)
            .filter(recipe => recipe != '*' && player.k.recipes[recipe].amount_cooking.gt(0))
            .forEach(recipe_id => {
                const precipe = player.k.recipes[recipe_id],
                    recipe = tmp.k.recipes[recipe_id];

                /** @type {false|dishes} */
                let result = false;

                // Wrong temperature
                if (!recipe.heats.includes(tmp.k.temperatures.current)) {
                    result = 'failure';
                }

                // Tick recipe progress
                const gain = D.times(diff, tmp.k.recipes['*'].speed);
                precipe.progress = D.add(precipe.progress, gain);

                if (D.gte(precipe.progress, recipe.time)) {
                    result = recipe.produces;
                }

                if (result) {
                    player.k.dishes[result].amount = D.add(player.k.dishes[result].amount, 1);
                    precipe.progress = D.dZero;
                    precipe.amount_cooking = D.dZero;
                }
            });

        // Heat the kitchen
        const info = tmp.k.temperatures.info[player.k.mode];
        let gain = D.dZero;
        // Do not do anything for room temp or burning
        if (!['burning', 'none'].includes(player.k.mode) && D.gt(info.min, 0)) {
            if (D.lt(player.f.points, info.min)) {
                // Warm by 10% of minimum
                gain = D.div(info.min, 10).times(diff);
            } else if (D.lt(player.f.points, info.max)) {
                // Regulate to middle temperature
                gain = D.add(info.min, info.max).div(200).times(diff);
            }
            // else Let it cool naturally
        }
        addPoints('f', gain);
    },
    automate() {
        Object.entries(player.k.recipes)
            .forEach(([id, recipe]) => {
                // Prevent overflow in some cases
                if (recipe.amount_target.gt(tmp.k.recipes['*'].size)) recipe.amount_target = tmp.k.recipes['*'].size;
                if (recipe.auto && id in tmp.k.recipes) clickClickable('k', `recipe_display_${id}_${tmp.k.recipes[id].consumes.length}`);
            });
    },
    prestigeNotify() {
        return Object.keys(layers.k.recipes)
            .some(recipe_id => layers.k.recipes['*'].can_cook(recipe_id) && D.lte(player.k.recipes[recipe_id].amount_cooking, 0));
    },
});
