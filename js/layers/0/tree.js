'use strict';

//todo? tree colors for layer display
addLayer('t', {
    name: 'Tree',
    symbol: 'T',
    startData() {
        return {
            unlocked: false,
            short_mode: false,
            clicked: false,
            trees: Object.fromEntries(Object.keys(layers.t.trees).map(item => [item, {
                amount: D.dZero,
                health: D.dZero,
                last_drops: [],
                last_drops_times: D.dZero,
            }])),
            current: '',
            focus: '',
            convert: false,
            auto_upgrade: true,
        };
    },
    tooltip() {
        if (player.t.short_mode) {
            const style = item => {
                const color = tmp.lo.items[item].style['background-color'];
                return `<span style="color:${color};text-shadow:${color} 0 0 10px;">${formatWhole(player.lo.items[item].amount)}</span>`;
            };

            return tmp.t?.trees['*'].items.map?.(style).join(', ');
        } else {
            const line = item => `${formatWhole(player.lo.items[item].amount)} ${tmp.lo.items[item].name}`;

            return tmp.t?.trees['*'].items.map?.(line).join('<br>');
        }
    },
    layerShown() { return player[this.layer].unlocked && !tmp[this.layer].deactivated; },
    deactivated() { return inChallenge('b', 31) || hasUpgrade('a', 13); },
    color: '#CC7700',
    row: 0,
    position: 2,
    resource: 'wood',
    hotkeys: [
        {
            key: 'T',
            description: 'Shift + T: Display tree layer',
            unlocked() { return tmp.t.layerShown; },
            onPress() { showTab('t'); },
        },
    ],
    tabFormat: {
        'Forest': {
            content: [
                () => {
                    const speed = D.times(layers.clo.time_speed('t'), layers.tic.time_speed('t'));

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                ['display-text', () => {
                    const line = item => {
                        const itemp = tmp.lo.items[item],
                            color = itemp.style['background-color'],
                            change = layers.t.convertion.per_second(item),
                            change_str = change.abs().gt(.001) && player.t.convert ? ` (<span style="color:${color};text-shadow:${color} 0 0 10px">${change.gt(0) ? '+' : ''}${format(change)}</span> /s)` : '';
                        return `<span style="color:${color};text-shadow:${color} 0 0 10px;font-size:1.5em;">\
                        ${formatWhole(player.lo.items[item].amount)}\
                        </span>${change_str} ${itemp.name}`;
                    };

                    return `You have ${listFormat.format(tmp.t?.trees['*'].items.filter(item => tmp.lo.items[item].unlocked).map(line))}.`;
                }],
                ['row', [
                    ['display-text', 'Short tooltip mode'],
                    'blank',
                    ['toggle', ['t', 'short_mode']]
                ]],
                () => hasUpgrade('t', 12) ? ['row', [
                    ['display-text', 'Convert wood'],
                    'blank',
                    ['toggle', ['t', 'convert']],
                ]] : undefined,
                'blank',
                ['bar', 'health'],
                ['clickables', [1]],
                ['display-text', () => `Current damage: ${format(tmp.t?.trees['*'].damage_base)}`],
                ['display-text', () => `Chance to cut an additionnal piece of wood: ${format_chance(tmp.t?.trees['*'].chance)}`],
                ['display-text', () => {
                    let drops = 'nothing',
                        count = '';

                    const last_drops = player.t.trees[player.t.current].last_drops,
                        last_count = player.t.trees[player.t.current].last_drops_times;
                    if (last_drops.length) drops = listFormat.format(last_drops.map(([item, amount]) => `${format(amount)} ${layers.lo.items[item].name}`));
                    if (last_count.gt(1)) count = ` (${formatWhole(last_count)} times)`;

                    return `Cut ${drops}${count}`;
                }],
                'blank',
                () => {
                    if (options.noRNG) return ['row', [
                        ['display-text', 'Current tree focused'],
                        'blank',
                        ['drop-down-double',
                            ['focus', [
                                ['', 'none'],
                                ...Object.keys(layers.t.trees)
                                    .filter(tree => tree != '*' && (tmp.t?.trees[tree].unlocked ?? true))
                                    .map(tree => [tree, tmp.t?.trees[tree].name])
                            ]],
                        ],
                    ]];
                },
                ['display-text', () => {
                    /** @param {string} tree */
                    const row = tree => {
                        const regen = tmp.t?.trees[tree].growth;

                        return `<tr>\
                            <td>${capitalize(tmp.t?.trees[tree].name)}</td>\
                            <td>${format(player.t.trees[tree].amount)} / ${format(tmp.t?.trees[tree].cap)} ${regen.gt(0) ? `(+${format(regen)}/s)` : ''}</td>\
                            <td>${format(tmp.t?.trees[tree].size)}</td>\
                        </tr>`;
                    };

                    return `<table class="layer-table" style="--color:${tmp.t.color}">\
                        <tr>\
                            <th>Tree</th>\
                            <th>Amount</th>\
                            <th>Size</th>\
                        </tr>\
                        ${Object.keys(tmp.t?.trees).filter(tree => tree != '*' && tmp.t?.trees[tree].unlocked).map(row).join('')}\
                    </table>`;
                }],
            ],
        },
        'Upgrades': {
            content: [
                ['display-text', () => {
                    const line = item => {
                        const itemp = tmp.lo.items[item],
                            color = itemp.style['background-color'],
                            change = layers.t.convertion.per_second(item),
                            change_str = change.abs().gt(.001) && player.t.convert ? ` (<span style="color:${color};text-shadow:${color} 0 0 10px">${change.gt(0) ? '+' : ''}${format(change)}</span> /s)` : '';
                        return `<span style="color:${color};text-shadow:${color} 0 0 10px;font-size:1.5em;">\
                        ${formatWhole(player.lo.items[item].amount)}\
                        </span>${change_str} ${itemp.name}`;
                    };

                    return `You have ${listFormat.format(tmp.t?.trees['*'].items.filter(item => tmp.lo.items[item].unlocked).map(line))}.`;
                }],
                ['row', [
                    ['display-text', 'Short tooltip mode'],
                    'blank',
                    ['toggle', ['t', 'short_mode']]
                ]],
                () => hasUpgrade('t', 12) ? ['row', [
                    ['display-text', 'Convert wood'],
                    'blank',
                    ['toggle', ['t', 'convert']],
                ]] : undefined,
                () => hasChallenge('b', 22) ? ['row', [
                    ['display-text', 'Automatically buy upgrades'],
                    'blank',
                    ['toggle', ['t', 'auto_upgrade']],
                ]] : undefined,
                'blank',
                ['upgrades', [1, 2, 3]],
            ],
            buttonStyle() {
                // If you figure out why shouldNotify does nothing when it returns true, I'll use it again.
                // Until then, it's done manually
                const style = {};
                if (canAffordLayerUpgrade('t')) style['box-shadow'] = 'var(--hqProperty2a), 0 0 20px #ff0000';
                return style;
            },
        },
    },
    clickables: {
        11: {
            style: { 'background-image': `url('./resources/images/wood-axe.svg')`, },
            canClick() { return player.t.current && D.gt(player.t.trees[player.t.current].health, 0); },
            onClick() {
                player.t.clicked = true;
                const type = player.t.current,
                    damage = tmp.t?.trees['*'].damage_base.min(player.t.trees[type].health);
                if (!type) return;

                player.t.trees[type].health = player.t.trees[type].health.minus(damage);

                /** @type {[string, Decimal][]} */
                let drops = [];

                if (options.noRNG) {
                    drops = get_tree_drops(type, damage.times(tmp.t?.trees['*'].chance));
                } else if (tmp.t?.trees['*'].chance.gt(Math.random())) {
                    drops = get_tree_drops(type, damage);
                } else {
                    drops = [];
                }

                const equal = drops.length == player.t.trees[type].last_drops.length &&
                    drops.every(([item, amount]) => player.t.trees[type].last_drops.some(([litem, lamount]) => item == litem && D.eq(amount, lamount)));

                if (equal) {
                    player.t.trees[type].last_drops_times = D.add(player.t.trees[type].last_drops_times, 1);
                } else {
                    player.t.trees[type].last_drops_times = D.dOne;
                    player.t.trees[type].last_drops = drops;
                }

                gain_items(drops);
            },
            onHold() {
                player.t.clicked = true;
                const type = player.t.current,
                    damage = tmp.t?.trees['*'].damage_base.min(player.t.trees[type].health);
                if (!type) return;

                player.t.trees[type].health = player.t.trees[type].health.minus(damage);

                /** @type {[string, Decimal][]} */
                let drops = [];

                if (options.noRNG) {
                    drops = get_tree_drops(type, damage.times(tmp.t?.trees['*'].chance));
                } else if (tmp.t?.trees['*'].chance.gt(Math.random())) {
                    drops = get_tree_drops(type, damage);
                } else {
                    drops = [];
                }

                const equal = drops.length == player.t.trees[type].last_drops.length &&
                    drops.every(([item, amount]) => player.t.trees[type].last_drops.some(([litem, lamount]) => item == litem && D.eq(amount, lamount)));

                if (equal) {
                    player.t.trees[type].last_drops_times = D.add(player.t.trees[type].last_drops_times, 1);
                } else {
                    player.t.trees[type].last_drops_times = D.dOne;
                    player.t.trees[type].last_drops = drops;
                }

                gain_items(drops);
            },
        },
        // Focus clickables
        21: {
            title: 'Focus on no specific tree',
            display() { return player.t.focus == '' ? 'ON' : 'OFF'; },
            canClick() { return player.t.focus != ''; },
            onClick() { player.t.focus = ''; },
            unlocked() { return true; },
            tooltip: 'Default behavior',
        },
        22: {
            title: 'Focus on Driftwood',
            display() { return player.t.focus == 'driftwood' ? 'ON' : 'OFF'; },
            canClick() { return player.t.focus != 'driftwood'; },
            onClick() { player.t.focus = 'driftwood'; },
            unlocked() { return tmp.t?.trees.driftwood.unlocked ?? true; },
        },
        23: {
            title: 'Focus on Oak',
            display() { return player.t.focus == 'oak' ? 'ON' : 'OFF'; },
            canClick() { return player.t.focus != 'oak'; },
            onClick() { player.t.focus = 'oak'; },
            unlocked() { return tmp.t?.trees.oak.unlocked ?? true; },
        },
        24: {
            title: 'Focus on Birch',
            display() { return player.t.focus == 'birch' ? 'ON' : 'OFF'; },
            canClick() { return player.t.focus != 'birch'; },
            onClick() { player.t.focus = 'birch'; },
            unlocked() { return tmp.t?.trees.birch.unlocked ?? true; },
        },
        25: {
            title: 'Focus on Baobab',
            display() { return player.t.focus == 'baobab' ? 'ON' : 'OFF'; },
            canClick() { return player.t.focus != 'baobab'; },
            onClick() { player.t.focus = 'baobab'; },
            unlocked() { return tmp.t?.trees.baobab.unlocked ?? true; },
        },
    },
    upgrades: {
        11: {
            title: 'Soaked Axe',
            description: 'Double tree health,<br>+50% tree size',
            effect() {
                return {
                    health: D.dTwo,
                    size: D(1.5),
                };
            },
            effectDisplay() {
                /** @type {{health: Decimal, size: Decimal}} */
                const effect = upgradeEffect(this.layer, this.id);
                return `*${format(effect.health)} tree health, *${format(effect.size)} tree size`;
            },
            cost: D(10),
            item: 'soaked_log',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
        },
        12: {
            title: 'Saw',
            description: 'Convert 1% of your logs into planks',
            effect() { return D(.01); },
            effectDisplay() { return `${format(upgradeEffect(this.layer, this.id).times(100))}%`; },
            cost: D(20),
            item: 'normal_log',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
        },
        13: {
            title: 'Wood Chips',
            description: 'Double tree growth speed',
            effect() {
                let effect = D.dTwo;

                if (inChallenge('b', 22)) effect = effect.root(2);

                return effect;
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(30),
            item: 'plank',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
        },
        21: {
            title: 'Wet Weapon',
            description() {
                if (!shiftDown) {
                    return 'Soaked Logs boost damage';
                }

                let formula = '7√(soaked logs + 1)';

                return `Formula: ${formula}`;
            },
            effect() { return D.add(player.lo.items.soaked_log.amount, 1).root(7); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return hasUpgrade(this.layer, this.id - 10) || hasChallenge('b', 21); },
            cost: D(25),
            item: 'soaked_log',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
        },
        22: {
            title: 'Mechanical Sawmill',
            description: 'Passively cut the current tree with 25% of your damage',
            effect() { return D(.25); },
            effectDisplay() { return `${format(D.times(upgradeEffect(this.layer, this.id), tmp.t?.trees['*'].damage_base))} dps`; },
            unlocked() { return hasUpgrade(this.layer, this.id - 10) || hasChallenge('b', 21); },
            cost: D(80),
            item: 'normal_log',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
        },
        23: {
            title: 'Mineshaft',
            description() {
                if (!shiftDown) {
                    return 'Planks increase mined amount';
                }

                let formula = '2√(planks) / 25 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                let effect = D.root(player.lo.items.plank.amount, 2).div(25).add(1);

                if (inChallenge('b', 22)) effect = effect.root(2);

                return effect;
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return hasUpgrade(this.layer, this.id - 10) || hasChallenge('b', 21); },
            cost: D(100),
            item: 'plank',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
        },
        31: {
            title: 'Driftwood Destroyer',
            description: 'Increases damage by driftwood health when chopping driftwood<br>Or by 10% of it when not',
            effect() {
                if (player.t.current != 'driftwood') return tmp.t?.trees['driftwood'].health.times(.1);
                return tmp.t?.trees['driftwood'].health;
            },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return hasUpgrade(this.layer, this.id - 10) || hasChallenge('b', 21); },
            cost: D(100),
            item: 'soaked_log',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
        },
        32: {
            title: 'Bartering Station',
            description: 'Unlock a new skill to earn more coins',
            unlocked() { return hasUpgrade(this.layer, this.id - 10) || hasChallenge('b', 21); },
            cost: D(320),
            item: 'normal_log',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
        },
        33: {
            title: 'Crafting Table',
            description: 'Crafting now consumes 90% of costs',
            effect() {
                let effect = D(.9);

                if (inChallenge('b', 22)) effect = effect.root(2);

                return effect;
            },
            effectDisplay() { return `*${format(D.times(upgradeEffect(this.layer, this.id), 100))}%`; },
            unlocked() { return hasUpgrade(this.layer, this.id - 10) || hasChallenge('b', 21); },
            cost: D(444),
            item: 'plank',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
        },
    },
    bars: {
        health: {
            direction: RIGHT,
            width: 200,
            height: 50,
            progress() {
                let max = tmp.t?.trees[player.t.current]?.health;
                if (D.lte(max, 0)) return 0;
                return D.div(player.t.trees[player.t.current].health ?? max, max);
            },
            display() {
                const current = player.t.current,
                    regen = tmp.t?.trees[current].regen,
                    regen_text = regen.neq(0) ? `<br>(+${format(regen)} /s)` : '';
                return `${capitalize(tmp.t?.trees[current].name)}<br>\
                ${format(player.t.trees[current].health)} / ${format(tmp.t?.trees[current].health)}\
                ${regen_text}`;
            },
            baseStyle: { 'background-color': 'brown' },
            fillStyle: { 'background-color': 'lime' },
            textStyle: { 'color': 'black' },
        },
    },
    trees: {
        '*': {
            health_mult() {
                let mult = D.dOne;

                if (hasUpgrade('t', 11)) mult = mult.times(upgradeEffect('t', 11).health);

                return mult;
            },
            growth_mult() {
                let mult = D.dOne;

                if (hasUpgrade('t', 13)) mult = mult.times(upgradeEffect('t', 13));

                mult = mult.times(buyableEffect('lo', 91));

                return mult;
            },
            damage_base() {
                let damage = D.dOne;

                if (hasUpgrade('m', 62)) damage = damage.add(upgradeEffect('m', 62));

                if (hasUpgrade('t', 31)) damage = damage.add(upgradeEffect('t', 31));

                damage = damage.add(buyableEffect('lo', 42).tree_damage);

                if (hasUpgrade('m', 61)) damage = damage.times(upgradeEffect('m', 61));

                damage = damage.times(tmp.mag.elements[player.mag.element].effects.tree?.damage_multiplier ?? 1);

                return damage;
            },
            dps_mult_inactive() {
                let mult = D.dZero;

                return mult;
            },
            dps_mult_active() {
                let mult = D.dZero;

                if (hasUpgrade('t', 22)) mult = mult.add(upgradeEffect('t', 22));

                return mult;
            },
            size_add() {
                let add = D.dZero;

                add = add.add(buyableEffect('lo', 83).size);

                return add;
            },
            size_mult() {
                let mult = D.dOne;

                if (hasUpgrade('t', 11)) mult = mult.times(upgradeEffect('t', 11).size);

                if (hasUpgrade('f', 23)) mult = mult.times(upgradeEffect('f', 23));

                mult = mult.times(tmp.mag.elements[player.mag.element].effects.tree?.size_multiplier ?? 1);

                mult = mult.times(tmp.l.skills.growing.effect);

                if (hasChallenge('b', 42)) mult = mult.times(1.5);

                if (hasChallenge('b', 62) && !inChallenge('b', 62)) mult = mult.times(tmp.sta.stats.defense.effect);

                return mult;
            },
            cap_add() {
                let add = D.dZero;

                add = add.add(buyableEffect('lo', 92));

                return add;
            },
            cap_mult() {
                let mult = D.dOne;

                mult = mult.times(buyableEffect('lo', 62).cap);

                return mult;
            },
            regen_add() {
                let add = D.dZero;

                if (hasChallenge('b', 41)) add = add.add(.01);

                return add;
            },
            items: ['soaked_log', 'normal_log', 'plank'],
            chance() {
                let chance = D(1 / 10);

                chance = chance.times(buyableEffect('lo', 93));

                return chance.min(1);
            },
        },
        driftwood: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.t.trees).find(item => layers.t.trees[item] == this); },
            unlocked: true,
            health() {
                let health = D(5);

                health = health.add(buyableEffect('lo', 61)?.soaked);

                health = health.times(tmp.t?.trees['*'].health_mult);

                return health;
            },
            name: 'driftwood',
            growth() {
                let regen = D(1 / 20);

                regen = regen.times(tmp.t?.trees['*'].growth_mult);

                return regen;
            },
            damage() {
                let damage = tmp.t?.trees['*'].damage_base;

                return damage;
            },
            dps() {
                let mult = tmp.t?.trees['*'].dps_mult_inactive;

                if (player.t.current == this.id) mult = mult.add(tmp.t?.trees['*'].dps_mult_active);

                return tmp.t?.trees[this.id].damage.times(mult);
            },
            size() {
                let size = D(5);

                size = size.add(buyableEffect('lo', 61).soaked);

                size = size.add(tmp.t?.trees['*'].size_add);

                size = size.times(tmp.t?.trees['*'].size_mult);

                return size;
            },
            cap() {
                let cap = D(1);

                cap = cap.add(tmp.t?.trees['*'].cap_add);

                cap = cap.times(tmp.t?.trees['*'].cap_mult);

                return cap.floor();
            },
            regen() {
                let mult = tmp.t?.trees['*'].regen_add;

                if (mult.eq(0)) return D.dZero;

                return mult.times(tmp.t?.trees[this.id].health);
            },
        },
        oak: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.t.trees).find(item => layers.t.trees[item] == this); },
            unlocked: true,
            health() {
                let health = D(15);

                health = health.times(tmp.t?.trees['*'].health_mult);

                return health;
            },
            name: 'oak',
            growth() {
                let regen = player.t.trees[this.id].amount.add(1).root(2).div(50);

                regen = regen.times(tmp.t?.trees['*'].growth_mult);

                return regen;
            },
            damage() {
                let damage = tmp.t?.trees['*'].damage_base;

                return damage;
            },
            dps() {
                let mult = tmp.t?.trees['*'].dps_mult_inactive;

                if (player.t.current == this.id) mult = mult.add(tmp.t?.trees['*'].dps_mult_active);

                return tmp.t?.trees[this.id].damage.times(mult);
            },
            size() {
                let size = D(20);

                size = size.add(tmp.t?.trees['*'].size_add);

                size = size.times(tmp.t?.trees['*'].size_mult);

                return size;
            },
            cap() {
                let cap = D(100);

                cap = cap.add(tmp.t?.trees['*'].cap_add);

                cap = cap.times(tmp.t?.trees['*'].cap_mult);

                return cap.floor();
            },
            regen() {
                let mult = tmp.t?.trees['*'].regen_add;

                if (mult.eq(0)) return D.dZero;

                return mult.times(tmp.t?.trees[this.id].health);
            },
        },
        birch: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.t.trees).find(item => layers.t.trees[item] == this); },
            unlocked: true,
            health() {
                let health = D(10);

                health = health.times(tmp.t?.trees['*'].health_mult);

                return health;
            },
            name: 'birch',
            growth() {
                let regen = player.t.trees[this.id].amount.add(1).root(2).div(35);

                regen = regen.times(tmp.t?.trees['*'].growth_mult);

                return regen;
            },
            damage() {
                let damage = tmp.t?.trees['*'].damage_base;

                return damage;
            },
            dps() {
                let mult = tmp.t?.trees['*'].dps_mult_inactive;

                if (player.t.current == this.id) mult = mult.add(tmp.t?.trees['*'].dps_mult_active);

                return tmp.t?.trees[this.id].damage.times(mult);
            },
            size() {
                let size = D(10);

                size = size.add(tmp.t?.trees['*'].size_add);

                size = size.times(tmp.t?.trees['*'].size_mult);

                return size;
            },
            cap() {
                let cap = D(100);

                cap = cap.add(tmp.t?.trees['*'].cap_add);

                cap = cap.times(tmp.t?.trees['*'].cap_mult);

                return cap.floor();
            },
            regen() {
                let mult = tmp.t?.trees['*'].regen_add;

                if (mult.eq(0)) return D.dZero;

                return mult.times(tmp.t?.trees[this.id].health);
            },
        },
        baobab: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.t.trees).find(item => layers.t.trees[item] == this); },
            unlocked() { return hasChallenge('b', 42); },
            health() {
                let health = D(20);

                health = health.times(tmp.t?.trees['*'].health_mult);

                return health;
            },
            name: 'baobab',
            growth() {
                let regen = player.t.trees[this.id].amount.add(1).root(2).div(100);

                regen = regen.times(tmp.t?.trees['*'].growth_mult);

                return regen;
            },
            damage() {
                let damage = tmp.t?.trees['*'].damage_base;

                return damage;
            },
            dps() {
                let mult = tmp.t?.trees['*'].dps_mult_inactive;

                if (player.t.current == this.id) mult = mult.add(tmp.t?.trees['*'].dps_mult_active);

                return tmp.t?.trees[this.id].damage.times(mult);
            },
            size() {
                let size = D(40);

                size = size.add(tmp.t?.trees['*'].size_add);

                size = size.times(tmp.t?.trees['*'].size_mult);

                return size;
            },
            cap() {
                let cap = D(10);

                cap = cap.add(tmp.t?.trees['*'].cap_add);

                cap = cap.times(tmp.t?.trees['*'].cap_mult);

                return cap.floor();
            },
            regen() {
                let mult = tmp.t?.trees['*'].regen_add;

                if (mult.eq(0)) return D.dZero;

                return mult.times(tmp.t?.trees[this.id].health);
            },
        },
        // Special tree for when the player is not chopping any
        '': {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.t.trees).find(item => layers.t.trees[item] == this); },
            unlocked: false,
            health: D.dZero,
            name: 'none',
            growth: D.dZero,
            damage() {
                let damage = tmp.t?.trees['*'].damage_base;

                return damage;
            },
            dps() {
                let mult = tmp.t?.trees['*'].dps_mult_inactive;

                if (player.t.current == this.id) mult = mult.add(tmp.t?.trees['*'].dps_mult_active);

                return tmp.t?.trees[this.id].damage.times(mult);
            },
            size: D.dZero,
            cap: D.dZero,
            regen: D.dZero,
        },
    },
    convertion: {
        from: ['soaked_log', 'normal_log'],
        rate(item) {
            if (!item || !this.from.includes(item)) return D.dZero;

            let percent = D.dZero;

            if (hasUpgrade('t', 12)) percent = percent.add(upgradeEffect('t', 12));

            let amount = player.lo.items[item].amount;

            return amount.times(percent);
        },
        efficiency(item) {
            if (!item || !this.from.includes(item)) return D.dZero;

            let efficiency = D.dZero;

            switch (item) {
                case 'soaked_log': efficiency = D(.25); break;
                case 'normal_log': efficiency = D(1); break;
            }

            efficiency = efficiency.add(buyableEffect('lo', 63).plank);

            if (hasUpgrade('s', 113)) efficiency = efficiency.times(upgradeEffect('s', 113));

            if (inChallenge('b', 22)) efficiency = efficiency.div(2);

            return efficiency;
        },
        per_second(item = 'plank') {
            if (item == 'plank') {
                let gain = this.from.map(item => this.rate(item).times(this.efficiency(item))).reduce(D.add, D.dZero);

                if (inChallenge('b', 12)) gain = gain.div(D.add(player.lo.items.plank.amount.max(0), 10).log10());

                return gain;
            }

            if (!this.from.includes(item)) return D.dZero;

            return layers.t.convertion.rate(item).neg();
        },
    },
    update(diff) {
        if (!player.t.unlocked || !tmp.t.layerShown) return;

        if (tmp.clo.layerShown) diff = D.times(diff, layers.clo.time_speed(this.layer));
        if (tmp.tic.layerShown) diff = D.times(diff, layers.tic.time_speed(this.layer));

        // Convert logs to planks
        if (player.t.convert && tmp.t.convertion.per_second.gt(0)) {
            ['plank', ...layers.t.convertion.from].forEach(item => {
                const gain = layers.t.convertion.per_second(item);
                if (gain.eq(0)) return;

                gain_items(item, gain.times(diff));
            });
        }

        for (const tree of Object.keys(layers.t.trees).filter(tree => tree != '*' && tmp.t?.trees[tree].unlocked)) {
            const player_tree = player.t.trees[tree],
                tmp_tree = tmp.t?.trees[tree];

            // Grow tree
            if (tmp_tree.growth.gt(0) && player_tree.amount.lt(tmp_tree.cap)) {
                player_tree.amount = player_tree.amount.add(tmp_tree.growth.times(diff));
            }

            // Heal tree
            if (D.gt(player_tree.health, 0) && tmp_tree.regen.gt(0) && player_tree.health.lt(tmp_tree.health)) {
                player_tree.health = player_tree.health.add(tmp_tree.regen.times(diff));
            }

            // Cut tree
            if (tmp_tree.dps.gt(0)) {
                player.t.clicked = true;
                const damage = tmp_tree.dps.times(diff),
                    drops = get_tree_drops(tree, damage);

                if (drops.length) {
                    gain_items(drops);

                    const equal = drops.length == player_tree.last_drops.length &&
                        drops.every(([item, amount]) => player_tree.last_drops.some(([litem, lamount]) => item == litem && D.eq(amount, lamount)));
                    if (equal) {
                        player_tree.last_drops_times = D.add(player_tree.last_drops_times, 1);
                    } else {
                        player_tree.last_drops_times = D.dOne;
                        player_tree.last_drops = drops;
                    }
                }

                player_tree.health = player_tree.health.minus(damage);
            }
        }
    },
    automate() {
        for (const tree of Object.keys(layers.t.trees).filter(tree => tree != '*')) {
            if (D.lte(player.t.trees[tree].health, 0)) {
                // Tree is dead
                if (player.t.clicked) {
                    const drops = get_tree_drops(tree, tmp.t?.trees[tree].size);

                    player.t.trees[tree].last_drops.push(...drops);
                    player.t.trees[tree].last_drops_times = D.dOne;
                    gain_items(drops);
                }

                player.t.trees[tree].health = tmp.t?.trees[tree].health;

                if (tree == player.t.current) player.t.current = '';
            }
        }

        if (!player.t.current && Object.values(player.t.trees).some(({ amount }) => amount.gte(1))) {
            // No tree and there is one available
            /** @type {string} */
            let tree;
            const random_tree = () => {
                const trees = Object.entries(player.t.trees)
                    .filter(([, { amount }]) => amount.gte(1))
                    .map(([tree]) => tree);
                return trees[Math.floor(Math.random() * trees.length)];
            };
            if (options.noRNG) {
                // The player gets the focused tree when available
                if (player.t.trees[player.t.focus].amount.gte(1)) tree = player.t.focus;
                else tree = random_tree();
            } else {
                tree = random_tree();
            }

            player.t.trees[tree].amount = player.t.trees[tree].amount.minus(1);
            player.t.current = tree;
        }
    },
    type: 'none',
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        const keep = ['convert', 'short_mode', 'focus'],
            max_ups = D.add(buyableEffect('lo', 62).t_hold, buyableEffect('fr', 31).p_hold.pow(tmp.a.change_efficiency)).floor(),
            kept_ups = [...player.t.upgrades];

        kept_ups.length = D.min(kept_ups.length, max_ups).toNumber();

        layerDataReset(this.layer, keep);
        layers.t.trees['*'].items.forEach(item => player.lo.items[item].amount = D.dZero);
        Object.keys(player.t.trees).forEach(tree => player.t.trees[tree] = {
            amount: D.dZero,
            health: D.dZero,
            last_drops: [],
            last_drops_times: D.dZero,
        });
        player.t.upgrades.push(...kept_ups);
    },
    branches: [() => player.f.unlocked ? 'f' : 'lo'],
    prestigeNotify() { return !hasUpgrade('t', 22) && player.t.current; },
    autoUpgrade() { return hasChallenge('b', 22) && player.t.auto_upgrade && !tmp.t.deactivated; },
});
