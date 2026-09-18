'use strict';

addLayer('xp_alt', {
    name: 'Experience Points',
    symbol: 'XP',
    startData() {
        return {
            points: D.dZero,
            unlocked: false,
            clicked: false,
            type: 'slime',
            monsters: Object.fromEntries(
                Object.keys(layers.xp_alt.monsters)
                    .map(type => [type, {
                        progress: D.dZero,
                        tamed: D.dZero,
                        last_drops: [],
                        last_drops_times: D.dZero,
                    }])
            ),
            auto_upgrade: true,
        };
    },
    tooltip() {
        return `${formatWhole(player.xp_alt.points)} experience<br>${formatWhole(tmp.xp_alt.total.tamed)} tamed monsters`;
    },
    layerShown() { return player[this.layer].unlocked; },
    color() { return tmp.xp_alt.monsters[player.xp_alt.type].color; },
    color_tame: '#6666AA',
    row: 0,
    position: 0.5,
    resource: 'experience',
    hotkeys: [
        {
            key: 'x',
            description() {
                if (tmp.xp.layerShown) return 'X: Display alternate experience points layer';
                return 'X: Display experience points layer';
            },
            unlocked() { return player.xp_alt.unlocked; },
            onPress() { if (player.xp_alt.unlocked) showTab('xp_alt'); },
        },
        {
            key: 'ArrowUp',
            description() {
                if (!tmp.xp.layerShown) return '↑ (in XP): Switch to previous monster';
                return '↑ (in alt XP): Switch to previous monster';
            },
            unlocked() { return tmp.xp_alt.monsters['*'].list.length > 1; },
            onPress() {
                const types = tmp.xp_alt.monsters['*'].list;
                if (player.tab == 'xp_alt' && player.xp_alt.type != types[0]) {
                    const i = types.indexOf(player.xp_alt.type);
                    if (i == -1) player.xp_alt.type = types[0];
                    else player.xp_alt.type = types[i - 1];
                };
            },
        },
        {
            key: 'ArrowDown',
            description() {
                if (!tmp.xp.layerShown) return '↓ (in XP): Switch to next monster';
                return '↓ (in alt XP): Switch to next monster';
            },
            unlocked() { return tmp.xp_alt.monsters['*'].list.length > 1; },
            onPress() {
                const types = tmp.xp_alt.monsters['*'].list;
                if (player.tab == 'xp_alt' && player.xp_alt.type != types[types.length - 1]) {
                    const i = types.indexOf(player.xp_alt.type);
                    if (i == -1) player.xp_alt.type = types[0];
                    else player.xp_alt.type = types[i + 1];
                };
            },
        },
    ],
    tabFormat: {
        'Monster': {
            content: [
                () => {
                    const speed = D.times(layers.clo.time_speed('xp_alt'), layers.tic.time_speed('xp_alt'));

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                [
                    'display-text',
                    () => {
                        const tame_style = (text, ...style) => `<span style="color:${tmp.xp_alt.color_tame};text-shadow:${tmp.xp_alt.color_tame} 0 0 10px;${style.join(';')}">${text}</span>`,
                            capped = D.gte(player.xp_alt.points, tmp.xp.enemies['*'].exp_cap),
                            xp_text = capped ? '' : `(${layerColor('xp_alt', `+${format(tmp.xp_alt.monsters['*'].experience)}`)} /s) `,
                            xp_cap = tmp.xp.enemies['*'].exp_cap,
                            tame_pieces = [];
                        if (tmp.xp_alt.total.tamed.neq(player.xp_alt.monsters[player.xp_alt.type].tamed)) {
                            tame_pieces.push(tame_style(`<span title="Amount of current monster tamed">${format(player.xp_alt.monsters[player.xp_alt.type].tamed)}</span>`));
                        }
                        if (tmp.xp_alt.monsters[player.xp_alt.type].tames.neq(1)) {
                            tame_pieces.push(tame_style(`+${format(tmp.xp_alt.monsters[player.xp_alt.type].tames)}`));
                        }

                        const tame_text = tame_pieces.length ? ` (${tame_pieces.join(', ')})` : '';

                        return `You have ${layerColor('xp_alt', format(player.xp_alt.points), 'font-size:1.5em;')}\
                            ${xp_text}/ ${layerColor('xp_alt', format(xp_cap))} experience\
                            and ${tame_style(formatWhole(tmp.xp_alt.total.tamed), 'font-size:1.5em')}${tame_text} tamed monsters`;
                    },
                ],
                'blank',
                ['bar', 'progress'],
                ['display-text', () => `${capitalize(tmp.xp_alt.monsters[player.xp_alt.type].name)}`],
                'blank',
                ['clickables', [1]],
                'blank',
                ['display-text', () => `Progress gain: ${format(tmp.xp_alt.monsters[player.xp_alt.type].progress_gain)}`],
                ['display-text', () => {
                    const type = player.xp_alt.type;
                    if (!can_drop(`tamed_kill:${type}`) || player.xp_alt.monsters[type].last_drops_times.lte(0)) return;

                    let drops = 'nothing',
                        count = '';
                    const last_drops = player.xp_alt.monsters[type].last_drops,
                        last_count = player.xp_alt.monsters[type].last_drops_times;
                    if (last_drops.length) drops = listFormat.format(last_drops.map(([item, amount]) => `${format(amount)} ${layers.lo.items[item].name}`));
                    if (last_count.gt(1)) count = ` (${formatWhole(last_count)} times)`;

                    return `${capitalize(tmp.xp_alt.monsters[type].name)} dropped ${drops}${count}`;
                }],
            ],
        },
        'Upgrades': {
            content: [
                [
                    'display-text',
                    () => {
                        const tame_style = (text, ...style) => `<span style="color:${tmp.xp_alt.color_tame};text-shadow:${tmp.xp_alt.color_tame} 0 0 10px;${style.join(';')}">${text}</span>`;
                        return `You have ${layerColor('xp_alt', format(player.xp_alt.points), 'font-size:1.5em;')} experience
                            and ${tame_style(formatWhole(tmp.xp_alt.total.tamed), 'font-size:1.5em')} tamed monsters`;
                    },
                ],
                () => {
                    if (hasChallenge('b', 11)) return;

                    /** @type {[number, DecimalSource][]} */
                    const upgs = [
                        [11, 5],
                        [12, 10],
                        [13, 15],
                        [21, 30],
                        [22, 50],
                        [23, 70],
                        [31, 100],
                        [32, 125],
                        [33, 150],
                        [51, 567],
                    ],
                        next = upgs.find(([id, tames]) => !hasUpgrade('xp_alt', id) && !tmp.xp_alt.upgrades[id].unlocked && D.lt(tmp.xp_alt.total.tamed, tames));
                    if (!next) return;

                    return ['display-text', `You will unlock a new upgrades at ${formatWhole(next[1])} kills`];
                },
                () => hasChallenge('b', 12) ? ['row', [
                    ['display-text', 'Automatically buy upgrades'],
                    'blank',
                    ['toggle', ['xp_alt', 'auto_upgrade']],
                ]] : undefined,
                'blank',
                ['upgrades', [1, 2, 3, 4, 5]],
            ],
            buttonStyle() {
                // If you figure out why shouldNotify does nothing when it returns true, I'll use it again.
                // Until then, it's done manually
                const style = {};
                if (canAffordLayerUpgrade('xp_alt')) style['box-shadow'] = 'var(--hqProperty2a), 0 0 20px #ff0000';
                return style;
            },
        },
        'Info': {
            content: [
                [
                    'display-text',
                    () => {
                        const tame_style = (text, ...style) => `<span style="color:${tmp.xp_alt.color_tame};text-shadow:${tmp.xp_alt.color_tame} 0 0 10px;${style.join(';')}">${text}</span>`;
                        return `You have ${layerColor('xp_alt', format(player.xp_alt.points), 'font-size:1.5em;')} experience
                            and ${tame_style(formatWhole(tmp.xp_alt.total.tamed), 'font-size:1.5em')} tamed monsters`;
                    },
                ],
                'blank',
                ['layer-table', () => {
                    const tame_style = (text, ...style) => `<span style="color:${tmp.xp_alt.color_tame};text-shadow:${tmp.xp_alt.color_tame} 0 0 10px;${style.join(';')}">${text}</span>`,
                        monster_style = (type, text, ...style) => {
                            const color = tmp.xp_alt.monsters[type].color;
                            return `<span style="color:${color};text-shadow:${color} 0 0 10px;${style.join(';')}">${text}</span>`;
                        };

                    return [
                        ['Monster', 'Progress', 'Tamed', 'Experience', 'Production'],
                        ...tmp.xp_alt.monsters['*'].list.map(type => {
                            const monster = tmp.xp_alt.monsters[type],
                                tames = monster.tames,
                                items = Array.from(
                                    { length: monster.produces.length },
                                    (_, i) => ['display-text', `+${format(monster.produces[i][1])} ${tmp.lo.items[monster.produces[i][0]].name} /s`]
                                );

                            /** @type {string[]} */
                            let tame_pieces = [];
                            if (tames.neq(1)) {
                                tame_pieces.push(`+${tame_style(format(tames))}`);
                            }
                            if (monster.passive_tame.gte(1e-4)) {
                                tame_pieces.push(`+${tame_style(format(monster.passive_tame))} /s`);
                            }

                            const tames_text = tame_pieces.length > 0 ? ` (${tame_pieces.join(', ')})` : '';

                            return [
                                [['display-text', capitalize(monster.name)]],
                                [['display-text', `${format(player.xp_alt.monsters[type].progress)} / ${format(monster.difficulty)}`]],
                                [['display-text', `${tame_style(format(player.xp_alt.monsters[type].tamed))} ${tames_text}`]],
                                [['display-text', `${monster_style(type, `+${format(monster.experience)}`)} /s`]],
                                items,
                            ];
                        })
                    ];
                }],
            ],
        },
    },
    clickables: {
        11: {
            style: { 'background-image': `url('./resources/images/previous-button.svg')`, },
            unlocked() { return tmp.xp_alt.monsters['*'].list.length > 1; },
            canClick() { return player.xp_alt.type != tmp.xp_alt.monsters['*'].list[0]; },
            onClick() {
                const i = tmp.xp_alt.monsters['*'].list.indexOf(player.xp_alt.type);
                if (i == -1) player.xp_alt.type = tmp.xp_alt.monsters['*'].list[0];
                else player.xp_alt.type = tmp.xp_alt.monsters['*'].list[i - 1];
            },
        },
        12: {
            style: { 'background-image': `url('./resources/images/open-palm.svg')`, },
            canClick() { return D.lt(player.xp_alt.monsters[player.xp_alt.type].progress, tmp.xp_alt.monsters[player.xp_alt.type].difficulty); },
            onClick() {
                const type = player.xp_alt.type;

                player.xp_alt.monsters[type].progress = D.add(player.xp_alt.monsters[type].progress, tmp.xp_alt.monsters[type].progress_gain);
                player.xp_alt.clicked = true;
            },
            onHold() {
                const type = player.xp_alt.type;

                player.xp_alt.monsters[type].progress = D.add(player.xp_alt.monsters[type].progress, tmp.xp_alt.monsters[type].progress_gain.div(3));
                player.xp_alt.clicked = true;
            },
        },
        13: {
            style: { 'background-image': `url('./resources/images/gladius.svg')`, },
            canClick() { return D.gte(player.xp_alt.monsters[player.xp_alt.type].tamed, 1); },
            onClick() {
                const type = player.xp_alt.type,
                    player_data = player.xp_alt.monsters[type];

                // Special, you still get a kill for murdering the friendly creature!
                if (type in player.xp.enemies) {
                    player.xp.enemies[type].kills = D.add(player.xp.enemies[type].kills, tmp.xp.enemies[type].kills);
                }

                if (can_drop(`tamed_kill:${type}`)) {
                    // However, you don't get the xp drop multipliers
                    const drops = get_monster_drops(type, D.dOne),
                        equal = drops.length == player_data.last_drops.length &&
                            drops.every(([item, amount]) => player_data.last_drops.some(([litem, lamount]) => item == litem && D.eq(amount, lamount)));

                    if (equal) {
                        player_data.last_drops_times = D.add(player_data.last_drops_times, 1);
                    } else {
                        player_data.last_drops_times = D.dOne;
                        player_data.last_drops = drops;
                    }

                    gain_items(drops);
                }

                if (inChallenge('b', 62) || hasChallenge('b', 62)) {
                    addPoints('sta', tmp.sta.stats['*'].gain);
                }

                player.xp_alt.monsters[type].tamed = D.minus(player.xp_alt.monsters[type].tamed, 1);
                player.k.active.filter(data => data.units == 'kills')
                    .forEach(data => data.time = D.minus(data.time, 1));
            },
            onHold() {
                const type = player.xp_alt.type,
                    player_data = player.xp_alt.monsters[type];

                // Special, you still get a kill for murdering the friendly creature!
                if (type in player.xp.enemies) {
                    player.xp.enemies[type].kills = D.add(player.xp.enemies[type].kills, tmp.xp.enemies[type].kills);
                }

                if (can_drop(`tamed_kill:${type}`)) {
                    // However, you don't get the xp drop multipliers
                    const drops = get_monster_drops(type, D.dOne),
                        equal = drops.length == player_data.last_drops.length &&
                            drops.every(([item, amount]) => player_data.last_drops.some(([litem, lamount]) => item == litem && D.eq(amount, lamount)));

                    if (equal) {
                        player_data.last_drops_times = D.add(player_data.last_drops_times, 1);
                    } else {
                        player_data.last_drops_times = D.dOne;
                        player_data.last_drops = drops;
                    }

                    gain_items(drops);
                }

                if (inChallenge('b', 62) || hasChallenge('b', 62)) {
                    addPoints('sta', tmp.sta.stats['*'].gain);
                }

                player.xp_alt.monsters[type].tamed = D.minus(player.xp_alt.monsters[type].tamed, 1);
                player.k.active.filter(data => data.units == 'kills')
                    .forEach(data => data.time = D.minus(data.time, 1));
            },
            tooltip: 'Kill one of this monster, gain its normal drops, but stop gaining XP',
        },
        14: {
            style: { 'background-image': `url('./resources/images/next-button.svg')`, },
            unlocked() { return tmp.xp_alt.monsters['*'].list.length > 1; },
            canClick() { return player.xp_alt.type != tmp.xp_alt.monsters['*'].list[tmp.xp_alt.monsters['*'].list.length - 1]; },
            onClick() {
                const i = tmp.xp_alt.monsters['*'].list.indexOf(player.xp_alt.type);
                if (i == -1) player.xp_alt.type = tmp.xp_alt.monsters['*'].list[0];
                else player.xp_alt.type = tmp.xp_alt.monsters['*'].list[i + 1];
            },
        },
    },
    bars: {
        progress: {
            direction: RIGHT,
            width: 200,
            height: 50,
            progress() {
                const max = tmp.xp_alt.monsters[player.xp_alt.type].difficulty;
                return D.div(player.xp_alt.monsters[player.xp_alt.type].progress ?? max, max);
            },
            display() {
                let text = `${format(player.xp_alt.monsters[player.xp_alt.type].progress)} / ${format(tmp.xp_alt.monsters[player.xp_alt.type].difficulty)}`;

                return text;
            },
            baseStyle: { 'background-color': '#BB3333' },
            fillStyle: { 'background-color': '#3333BB' },
            textStyle: { 'color': 'black' },
        },
    },
    upgrades: {
        11: {
            title: 'Tastier Treats',
            description: 'Double taming progress gain',
            effect() {
                let base = D(2);

                return base;
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return tmp.xp_alt.total.tamed.gte(5) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(5),
        },
        12: {
            title: 'Softer Monsters',
            description: 'Monsters are more difficult and give more items',
            effect() {
                let difficulty = D(5),
                    produce = D(1.25);

                return { difficulty, produce, };
            },
            effectDisplay() {
                /** @type {{difficulty: Decimal, produce: Decimal}} */
                const { difficulty, produce } = upgradeEffect(this.layer, this.id);
                return `+${format(difficulty)} difficulty, *${format(produce)} production`;
            },
            unlocked() { return tmp.xp_alt.total.tamed.gte(10) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(10),
        },
        13: {
            title: 'Friendsmell',
            description() {
                if (!shiftDown) {
                    return 'Tamed monsters boost taming progress gain';
                } else {
                    let formula = 'log10(tamed + 10)';

                    return `Formula: ${formula}`;
                }
            },
            effect() {
                let effect = tmp.xp_alt.total.tamed.max(0).add(10).log10();

                return effect;
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return tmp.xp_alt.total.tamed.gte(15) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(15),
        },
        21: {
            title: 'Sweet Scent',
            description() {
                if (!shiftDown) {
                    return 'Taming difficulty boosts experience';
                } else {
                    let formula = '10√(difficulty + 1)';

                    return `Formula: ${formula}`;
                }
            },
            effect() {
                let effect = tmp.xp_alt.monsters[player.xp_alt.type].difficulty.add(1).root(10);

                return effect;
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return tmp.xp_alt.total.tamed.gte(30) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(50),
        },
        22: {
            title: 'Slime Trap',
            description() {
                if (!shiftDown) {
                    let monsters = ['slimes'];

                    if (hasUpgrade('c', 43)) monsters.push('goblins');

                    return `Passively catch ${listFormat.format(monsters)}`;
                } else {
                    let formula = 'progress gain / difficulty';

                    return `Formula: ${formula}`;
                }
            },
            unlocked() { return tmp.xp_alt.total.tamed.gte(50) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(150),
        },
        23: {
            title: 'Group Reading',
            description: 'Double experience gain',
            effect() {
                let effect = D.dTwo;

                effect = effect.add(tmp.l.skills.reading.effect.pow(tmp.a.change_efficiency));

                return effect;
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return tmp.xp_alt.total.tamed.gte(70) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(250),
        },
        31: {
            title: 'Crunchy Carrots',
            description() {
                if (!shiftDown) {
                    return 'Tamed monsters boost taming progress gain';
                } else {
                    let formula = 'log5(tamed + 5)';

                    return `Formula: ${formula}`;
                }
            },
            effect() { return tmp.xp_alt.total.tamed.max(0).add(5).log(5); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return tmp.xp_alt.total.tamed.gte(100) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(400),
        },
        32: {
            title: 'How to Care for Monsters for Dummies',
            description: '+50% monster production',
            effect() {
                let mult = D(1.5);

                mult = mult.add(tmp.l.skills.reading.effect.pow(tmp.a.change_efficiency));

                return mult;
            },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id).minus(1).times(100))}%`; },
            unlocked() { return tmp.xp_alt.total.tamed.gte(125) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(600),
        },
        33: {
            title: 'Shiny Coin',
            description: 'Unlock goblins<br>Halve taming difficulty',
            effect() { return D(2); },
            effectDisplay() { return `/${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return tmp.xp_alt.total.tamed.gte(150) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(900),
        },
        41: {
            title: 'Fish Fingers',
            description() {
                if (!shiftDown) {
                    return 'Killed monsters reduces taming difficulty'
                        // + `<br>You are a horrible person.`
                        ;
                } else {
                    let formula = 'log10(kills + 10)';

                    return `Formula: ${formula}`;
                }
            },
            effect() { return tmp.xp.total.kills.max(0).add(10).log10(); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return inChallenge('b', 31) || hasChallenge('b', 31); },
            cost: D(195),
        },
        42: {
            title: 'Cursed Information',
            description() {
                if (!shiftDown) {
                    return 'Experience boosts experience gain';
                } else {
                    let formula = '15√(experience) + 1';

                    return `Formula: ${formula}`;
                }
            },
            effect() { return player.xp_alt.points.root(15).add(1); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return inChallenge('b', 31) || hasChallenge('b', 31); },
            cost: D(850),
        },
        43: {
            title: 'Bigger Monsters',
            description: 'Increase tamed monsters amount',
            effect() { return D(1.25); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return inChallenge('b', 31) || hasChallenge('b', 31); },
            cost: D(2222),
        },
        51: {
            title: 'Stellar Spice',
            description() {
                if (!shiftDown) {
                    return 'Tamed monsters increase star time';
                } else {
                    let formula = 'tamed / 50';

                    return `Formula: ${formula}`;
                }
            },
            effect() { return tmp.xp_alt.total.tamed.div(50); },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return tmp.xp_alt.total.tamed.gte(567) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(1234),
        },
    },
    monsters: {
        '*': {
            list() {
                return Object.keys(layers.xp_alt.monsters)
                    .filter(type => type != '*' && (tmp.xp_alt.monsters[type].unlocked ?? true));
            },
            experience() {
                return Object.keys(layers.xp_alt.monsters)
                    .filter(type => type != '*' && (tmp.xp_alt.monsters[type].unlocked ?? true))
                    .reduce((sum, type) => D.add(sum, tmp.xp_alt.monsters[type].experience), D.dZero);
            },
            experience_mult() {
                let mult = D.dOne;

                if (hasUpgrade('xp_alt', 21)) mult = mult.times(upgradeEffect('xp_alt', 21));
                if (hasUpgrade('xp_alt', 23)) mult = mult.times(upgradeEffect('xp_alt', 23));
                if (hasUpgrade('xp_alt', 42)) mult = mult.times(upgradeEffect('xp_alt', 42));

                if (hasUpgrade('c', 33)) mult = mult.times(upgradeEffect('c', 33));

                if (tmp.bin.layerShown) mult = mult.times(tmp.bin.cards.multipliers['xp_alt'] ?? 1);

                mult = mult.times(tmp.k.dishes.failure.effect);

                // Main
                if (hasUpgrade('xp', 12)) mult = mult.times(upgradeEffect('xp', 12).experience.pow(tmp.a.change_efficiency));
                if (hasUpgrade('xp', 13)) mult = mult.times(upgradeEffect('xp', 13).pow(tmp.a.change_efficiency));
                if (hasUpgrade('xp', 23)) mult = mult.times(upgradeEffect('xp', 23).pow(tmp.a.change_efficiency));
                if (hasUpgrade('xp', 42)) mult = mult.times(upgradeEffect('xp', 42).pow(tmp.a.change_efficiency));

                mult = mult.times(tmp.l.skills.learning.effect.pow(tmp.a.change_efficiency));

                mult = mult.times(buyableEffect('lo', 11).pow(tmp.a.change_efficiency));

                if (inChallenge('b', 12) && !hasUpgrade('s', 41)) {
                    let div = player.xp_alt.points.max(0).add(10).log10().pow(tmp.a.change_efficiency);
                    mult = mult.div(div);
                }
                if (hasUpgrade('s', 41)) mult = mult.div(upgradeEffect('s', 41).pow(tmp.a.change_efficiency));

                return mult;
            },
            progress_mult() {
                let mult = D.dOne;

                if (hasUpgrade('xp_alt', 11)) mult = mult.times(upgradeEffect('xp_alt', 11));
                if (hasUpgrade('xp_alt', 13)) mult = mult.times(upgradeEffect('xp_alt', 13));
                if (hasUpgrade('xp_alt', 31)) mult = mult.times(upgradeEffect('xp_alt', 31));

                if (hasUpgrade('c', 23)) mult = mult.times(upgradeEffect('c', 23));

                if (hasMilestone('to', 2)) mult = mult.times(tmp.to.milestones[2].effect);

                mult = mult.times(tmp.p.plants.candy_corn.effect);

                mult = mult.times(tmp.k.dishes.cake.effect);

                return mult;
            },
            difficulty_add() {
                let add = D.dZero;

                if (hasUpgrade('xp_alt', 12)) add = add.add(upgradeEffect('xp_alt', 12).difficulty);

                return add;
            },
            difficulty_mult() {
                let mult = D.dOne;

                if (hasUpgrade('xp_alt', 33)) mult = mult.div(upgradeEffect('xp_alt', 33));
                if (hasUpgrade('xp_alt', 41)) mult = mult.div(upgradeEffect('xp_alt', 41));

                return mult;
            },
            produce_mult() {
                let mult = D.dOne;

                if (hasUpgrade('xp_alt', 12)) mult = mult.times(upgradeEffect('xp_alt', 12).produce);
                if (hasUpgrade('xp_alt', 32)) mult = mult.times(upgradeEffect('xp_alt', 32));

                if (tmp.bin.layerShown) mult = mult.times(tmp.bin.cards.multipliers['xp_alt'] ?? 1);

                mult = mult.times(tmp.k.dishes.fried_eggs.effect.prod);

                mult = mult.times(buyableEffect('fr', 33).monster);

                return mult;
            },
            tames_mult() {
                let mult = D.dOne;

                if (inChallenge('b', 12) && !false) {
                    mult = mult.div(tmp.xp_alt.total.tamed.max(0).add(10).log10());
                }

                if (hasUpgrade('xp_alt', 43)) mult = mult.times(upgradeEffect('xp_alt', 43));

                mult = mult.times(tmp.k.dishes.fried_eggs.effect.tames);

                return mult;
            },
            tames_passive_mult() {
                let mult = D.dOne;

                mult = mult.times(tmp.k.dishes.berries_bowl.effect);

                return mult;
            },
        },
        // Normal monsters
        slime: {
            _type: null,
            get type() { return this._type ??= Object.keys(layers.xp_alt.monsters).find(item => layers.xp_alt.monsters[item] == this); },
            color: '#884488',
            name() { return tmp.xp.enemies[this.type].name; },
            difficulty(tamed) {
                tamed ??= player.xp_alt.monsters[this.type].tamed ?? D.dZero;

                let exp = D(1.1),
                    base = D(10);

                let difficulty = exp.pow(tamed).times(base);

                difficulty = difficulty.add(tmp.xp_alt.monsters['*'].difficulty_add);

                difficulty = difficulty.times(tmp.xp_alt.monsters['*'].difficulty_mult);

                return difficulty;
            },
            progress_gain() {
                let gain = D.dOne;

                gain = gain.times(tmp.xp_alt.monsters['*'].progress_mult);

                return gain;
            },
            experience(tamed) {
                const monst = D(tamed ?? player.xp_alt.monsters[this.type].tamed);

                let exp = D(.01);

                exp = exp.times(tmp.xp_alt.monsters['*'].experience_mult);

                exp = exp.times(D.pow(buyableEffect('lo', 11), .1).pow(tmp.a.change_efficiency));

                return exp.times(monst).min(tmp.xp.enemies['*'].exp_cap.minus(player.xp_alt.points).add(1)).max(0);
            },
            tames() {
                let tames = D.dOne;

                tames = tames.times(tmp.xp_alt.monsters['*'].tames_mult);

                return tames;
            },
            produces(tamed) {
                const monst = D(tamed ?? player.xp_alt.monsters[this.type].tamed);

                /** @type {[string, Decimal][]} */
                const base = [
                    ['slime_goo', D(1 / 30),],
                    ['slime_core_shard', D(1 / 160),],
                ];

                base.forEach(([item, amount], i) => {
                    let mult = monst.times(tmp.xp_alt.monsters['*'].produce_mult);
                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;

                    mult = mult.times(tmp.k.dishes.ice_cream.effect);

                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount.max(0), 10).log10().pow(tmp.a.change_efficiency));
                    }

                    base[i][1] = D.times(amount, mult)
                });

                return base;
            },
            passive_tame(tamed) {
                if (!hasUpgrade('xp_alt', 22)) return D.dZero;

                tamed ??= player.xp_alt.monsters[this.type].tamed ?? D.dZero;

                /** @type {typeof tmp.xp_alt.monsters[string]} */
                const monster = tmp.xp_alt.monsters[this.type];

                let gain = D.div(monster.progress_gain, layers.xp_alt.monsters[this.type].difficulty(tamed))
                    .times(monster.tames).times(tmp.xp_alt.monsters['*'].tames_passive_mult);

                return gain;
            },
            unlocked() { return !inChallenge('b', 41) },
        },
        goblin: {
            _type: null,
            get type() { return this._type ??= Object.keys(layers.xp_alt.monsters).find(item => layers.xp_alt.monsters[item] == this); },
            color: '#44FF44',
            name() { return tmp.xp.enemies[this.type].name; },
            difficulty(tamed) {
                tamed ??= player.xp_alt.monsters[this.type].tamed ?? D.dZero;

                let exp = D(1.15),
                    base = D(20);

                let difficulty = exp.pow(tamed).times(base);

                difficulty = difficulty.add(tmp.xp_alt.monsters['*'].difficulty_add);

                difficulty = difficulty.times(tmp.xp_alt.monsters['*'].difficulty_mult);

                return difficulty;
            },
            progress_gain() {
                let gain = D.dOne;

                gain = gain.times(tmp.xp_alt.monsters['*'].progress_mult);

                return gain;
            },
            experience(tamed) {
                const monst = D(tamed ?? player.xp_alt.monsters[this.type].tamed);

                let exp = D(.04);

                exp = exp.times(tmp.xp_alt.monsters['*'].experience_mult);

                return exp.times(monst).min(tmp.xp.enemies['*'].exp_cap.minus(player.xp_alt.points).add(1)).max(0);
            },
            tames() {
                let tames = D.dOne;

                tames = tames.times(tmp.xp_alt.monsters['*'].tames_mult);

                return tames;
            },
            produces(tamed) {
                const monst = D(tamed ?? player.xp_alt.monsters[this.type].tamed);

                /** @type {[string, Decimal][]} */
                const base = [
                    ['red_fabric', D(1 / 40),],
                    ['pyrite_coin', D(1 / 250),],
                ];

                base.forEach(([item, amount], i) => {
                    let mult = monst.times(tmp.xp_alt.monsters['*'].produce_mult);
                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;

                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount.max(0), 10).log10().pow(tmp.a.change_efficiency));
                    }

                    base[i][1] = D.times(amount, mult)
                });

                return base;
            },
            passive_tame(tamed) {
                /** @type {typeof tmp.xp_alt.monsters[string]} */
                const monster = tmp.xp_alt.monsters[this.type];

                if (!hasUpgrade('xp_alt', 22) || !hasUpgrade('c', 43) || !monster.unlocked) return D.dZero;

                tamed ??= player.xp_alt.monsters[this.type].tamed ?? D.dZero;

                let gain = D.div(monster.progress_gain, layers.xp_alt.monsters[this.type].difficulty(tamed))
                    .times(monster.tames).times(tmp.xp_alt.monsters['*'].tames_passive_mult);

                return gain;
            },
            unlocked() { return hasUpgrade('xp_alt', 33) && !inChallenge('b', 41) },
        },
        zombie: {
            _type: null,
            get type() { return this._type ??= Object.keys(layers.xp_alt.monsters).find(item => layers.xp_alt.monsters[item] == this); },
            color: '#557700',
            name() { return tmp.xp.enemies[this.type].name; },
            difficulty(tamed) {
                tamed ??= player.xp_alt.monsters[this.type].tamed ?? D.dZero;

                let exp = D(1.2),
                    base = D(40);

                let difficulty = exp.pow(tamed).times(base);

                difficulty = difficulty.add(tmp.xp_alt.monsters['*'].difficulty_add);

                difficulty = difficulty.times(tmp.xp_alt.monsters['*'].difficulty_mult);

                return difficulty;
            },
            progress_gain() {
                let gain = D.dOne;

                gain = gain.times(tmp.xp_alt.monsters['*'].progress_mult);

                return gain;
            },
            experience(tamed) {
                const monst = D(tamed ?? player.xp_alt.monsters[this.type].tamed);

                let exp = D(.08);

                exp = exp.times(tmp.xp_alt.monsters['*'].experience_mult);

                return exp.times(monst).min(tmp.xp.enemies['*'].exp_cap.minus(player.xp_alt.points).add(1)).max(0);
            },
            tames() {
                let tames = D.dOne;

                tames = tames.times(tmp.xp_alt.monsters['*'].tames_mult);

                return tames;
            },
            produces(tamed) {
                const monst = D(tamed ?? player.xp_alt.monsters[this.type].tamed);

                /** @type {[string, Decimal][]} */
                const base = [
                    ['rotten_flesh', D(1 / 50),],
                    ['brain', D(1 / 3430),],
                ];

                base.forEach(([item, amount], i) => {
                    let mult = monst.times(tmp.xp_alt.monsters['*'].produce_mult);
                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;

                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount.max(0), 10).log10().pow(tmp.a.change_efficiency));
                    }

                    base[i][1] = D.times(amount, mult)
                });

                return base;
            },
            passive_tame(tamed) {
                let mult = D.dZero;

                mult = mult.add(tmp.k.dishes.monster_meal.effect);

                if (mult.lte(0)) return D.dZero;

                tamed ??= player.xp_alt.monsters[this.type].tamed ?? D.dZero;

                /** @type {typeof tmp.xp_alt.monsters[string]} */
                const monster = tmp.xp_alt.monsters[this.type];

                let gain = D.div(monster.progress_gain, layers.xp_alt.monsters[this.type].difficulty(tamed))
                    .times(monster.tames)
                    .times(tmp.xp_alt.monsters['*'].tames_passive_mult)
                    .times(mult);

                return gain;
            },
            unlocked() { return hasMilestone('to', 2) && !inChallenge('b', 41); },
        },
        ent: {
            _type: null,
            get type() { return this._type ??= Object.keys(layers.xp_alt.monsters).find(item => layers.xp_alt.monsters[item] == this); },
            color: '#448811',
            name() { return tmp.xp.enemies[this.type].name; },
            difficulty(tamed) {
                tamed ??= player.xp_alt.monsters[this.type].tamed ?? D.dZero;

                let exp = D(1.25),
                    base = D(80);

                let difficulty = exp.pow(tamed).times(base);

                difficulty = difficulty.add(tmp.xp_alt.monsters['*'].difficulty_add);

                difficulty = difficulty.times(tmp.xp_alt.monsters['*'].difficulty_mult);

                return difficulty;
            },
            progress_gain() {
                let gain = D.dOne;

                gain = gain.times(tmp.xp_alt.monsters['*'].progress_mult);

                return gain;
            },
            experience(tamed) {
                const monst = D(tamed ?? player.xp_alt.monsters[this.type].tamed);

                let exp = D(.16);

                exp = exp.times(tmp.xp_alt.monsters['*'].experience_mult);

                return exp.times(monst).min(tmp.xp.enemies['*'].exp_cap.minus(player.xp_alt.points).add(1)).max(0);
            },
            tames() {
                let tames = D.dOne;

                tames = tames.times(tmp.xp_alt.monsters['*'].tames_mult);

                return tames;
            },
            produces(tamed) {
                const monst = D(tamed ?? player.xp_alt.monsters[this.type].tamed);

                /** @type {[string, Decimal][]} */
                const base = [
                    ['leaf', D(1 / 60),],
                    ['seed', D(1 / 5120),],
                ];

                base.forEach(([item, amount], i) => {
                    let mult = monst.times(tmp.xp_alt.monsters['*'].produce_mult);
                    const upg = tmp.s.investloans.item_upgrade[item] ?? false;

                    if (upg && hasUpgrade('s', upg)) {
                        mult = mult.times(upgradeEffect('s', upg).pow(tmp.a.change_efficiency));
                    } else if (inChallenge('b', 12)) {
                        mult = mult.div(D.add(player.lo.items[item].amount.max(0), 10).log10().pow(tmp.a.change_efficiency));
                    }

                    base[i][1] = D.times(amount, mult)
                });

                return base;
            },
            passive_tame(tamed) { return D.dZero; },
            unlocked: false,
        },
        // Challenge
        world_tree: {
            _type: null,
            get type() { return this._type ??= Object.keys(layers.xp_alt.monsters).find(item => layers.xp_alt.monsters[item] == this); },
            color() {
                /** @type {[DecimalSource, [number, number, number]][]} */
                const color_points = [
                    [1, [0xCC, 0xAA, 0x66]],
                    [1e3, [0x55, 0x99, 0x66]],
                ],
                    i = color_points.findIndex(([n]) => D.gte(n, tmp.xp.total.kills.max(1).min(1e3)));

                if (i == 0) {
                    return `#${color_points[i][1].map(n => n.toString(16)).join('')}`;
                }
                const min = D.log10(color_points[i - 1][0]),
                    color_min = color_points[i - 1][1],
                    max = D.log10(color_points[i][0]),
                    color_max = color_points[i][1],
                    current = D.log10(tmp.xp.total.kills.max(1)),
                    fraction = current.minus(min).div(max).max(0).min(1).toNumber();

                return `#${Array.from({ length: 3 }, (_, i) => Math.floor(color_max[i] * fraction + color_min[i] * (1 - fraction)).toString(16).padStart(2, '0')).join('')}`;
            },
            name() { return tmp.xp.enemies[this.type].name; },
            difficulty(tamed) {
                tamed ??= tmp.xp_alt.total.tamed;

                let exp = D(1.75),
                    base = D(250);

                let difficulty = exp.pow(tamed).times(base);

                difficulty = difficulty.add(tmp.xp_alt.monsters['*'].difficulty_add);

                difficulty = difficulty.times(tmp.xp_alt.monsters['*'].difficulty_mult);

                return difficulty;
            },
            progress_gain() {
                let gain = D.dOne;

                gain = gain.times(tmp.xp_alt.monsters['*'].progress_mult);

                return gain;
            },
            experience(tamed) { return D.dZero; },
            tames() { return D.dOne; },
            produces(tamed) { return []; },
            passive_tame(tamed) { return D.dZero; },
            unlocked() { return !inChallenge('b', 31) && inChallenge('b', 42); },
        },
        amalgam: {
            _type: null,
            get type() { return this._type ??= Object.keys(layers.xp_alt.monsters).find(item => layers.xp_alt.monsters[item] == this); },
            color() {
                const types = ['slime', 'goblin', 'zombie'];

                if (false) types.push('ent'); //todo unlock ent

                return colors_average(...types.map(type => tmp.xp_alt.monsters[type].color));
            },
            name() { return tmp.xp.enemies[this.type].name; },
            difficulty(tamed) {
                tamed ??= player.xp_alt.monsters[this.type].tamed;
                const types = ['slime', 'goblin', 'zombie'];

                if (false) types.push('ent'); //todo unlock ent

                return types.reduce((sum, type) => D.add(sum, layers.xp_alt.monsters[type].difficulty(tamed)), 0);
            },
            progress_gain() {
                let gain = D.dOne;

                gain = gain.times(tmp.xp_alt.monsters['*'].progress_mult);

                return gain;
            },
            experience(tamed) {
                tamed ??= player.xp_alt.monsters[this.type].tamed;
                const types = ['slime', 'goblin', 'zombie'];

                if (false) types.push('ent'); //todo unlock ent

                return types.reduce((sum, type) => D.add(sum, layers.xp_alt.monsters[type].experience(tamed)), 0);
            },
            tames() { return D.dOne; },
            produces(tamed) {
                tamed ??= player.xp_alt.monsters[this.type].tamed;
                const types = ['slime', 'goblin', 'zombie'];

                if (false) types.push('ent'); //todo unlock ent

                return types.reduce((sum, type) => [...sum, ...layers.xp_alt.monsters[type].produces(tamed)], []);
            },
            passive_tame(tamed) {
                tamed ??= player.xp_alt.monsters[this.type].tamed;
                const types = ['slime', 'goblin', 'zombie'];

                if (false) types.push('ent'); //todo unlock ent

                return D.div(types.reduce((sum, type) => D.add(sum, layers.xp_alt.monsters[type].passive_tame(tamed)), 0), types.length);
            },
            unlocked() { return inChallenge('b', 41); },
        },
    },
    total: {
        tamed() {
            return Object.values(player.xp_alt.monsters).reduce((sum, data) => D.add(sum, data.tamed), D.dZero);
        },
    },
    type: 'none',
    doReset(layer, force = false) {
        if (!force && layers[layer].row <= this.row) return;

        /** @type {(keyof player['xp_alt'])[]} */
        const keep = ['type'],
            max_ups = D.add(buyableEffect('lo', 12).xp_hold.pow(tmp.a.change_efficiency), buyableEffect('fr', 32).xp_hold).floor(),
            kept_ups = [...player.xp_alt.upgrades];

        kept_ups.length = D.min(kept_ups.length, max_ups).toNumber();

        layerDataReset(this.layer, keep);
        player.xp_alt.upgrades.push(...kept_ups);
        Object.keys(player.xp_alt.monsters).forEach(type => player.xp_alt.monsters[type] = {
            progress: D.dZero,
            last_drops: [],
            last_drops_times: D.dZero,
            tamed: D.dZero,
        });
    },
    update(diff) {
        if (tmp.clo.layerShown) diff = D.times(diff, layers.clo.time_speed(this.layer));
        if (tmp.tic.layerShown) diff = D.times(diff, layers.tic.time_speed(this.layer));

        addPoints('xp_alt', D.times(tmp.xp_alt.monsters['*'].experience, diff));

        for (const type of tmp.xp_alt.monsters['*'].list) {
            if (D.gt(player.xp_alt.monsters[type].tamed, 0)) {
                /** @type {[string, Decimal][]} */
                const production = tmp.xp_alt.monsters[type].produces.map(([item, amount]) => [item, D.times(diff, amount)]);

                gain_items(production);
            }
            if (D.gt(tmp.xp_alt.monsters[type].passive_tame, 0)) {
                const tames = D.times(tmp.xp_alt.monsters[type].passive_tame, diff);
                player.xp_alt.monsters[type].tamed = D.add(player.xp_alt.monsters[type].tamed, tames);
                player.k.active.filter(data => data.units == 'tames')
                    .forEach(data => data.time = D.minus(data.time, tames));
            }
        }
    },
    automate() {
        for (const type of tmp.xp_alt.monsters['*'].list) {
            const player_data = player.xp_alt.monsters[type];

            if (D.gte(player_data.progress, tmp.xp_alt.monsters[type].difficulty)) {
                if (player.xp_alt.clicked) {
                    // Workaround for starting at undefined
                    player_data.progress = D.minus(player_data.progress, tmp.xp_alt.monsters[type].difficulty);
                    player_data.tamed = D.add(player_data.tamed, tmp.xp_alt.monsters[type].tames);
                    player.k.active.filter(data => data.units == 'tames')
                        .forEach(data => data.time = D.minus(data.time, 1));
                }
            }
        }
        if (!(tmp.xp_alt.monsters[player.xp_alt.type].unlocked ?? true)) player.xp_alt.type = 'slime';
    },
    autoUpgrade() { return player.xp_alt.auto_upgrade && hasChallenge('b', 12) && player.xp_alt.unlocked; },
});
