'use strict';

addLayer('xp', {
    name: 'Experience Points',
    symbol: 'XP',
    startData() {
        return {
            unlocked: true,
            points: D.dZero,
            type: 'slime',
            clicked: false,
            enemies: Object.fromEntries(Object.keys(layers.xp.enemies).map(type => [type, {
                health: D.dZero,
                kills: D.dZero,
                last_drops: [],
                last_drops_times: D.dZero,
                element: 'none',
            }])),
            auto: {
                attack_current: true,
                attack_all: true,
                upgrade: true,
            },
        };
    },
    tooltip() {
        return `${formatWhole(player.xp.points)} experience<br>${formatWhole(tmp.xp.total.kills)} kills`;
    },
    color() { return tmp.xp.enemies[player.xp.type].color; },
    layerShown() { return !tmp.xp.deactivated; },
    deactivated() { return hasUpgrade('a', 11); },
    color_kill: '#999955',
    row: 0,
    position: 0,
    resource: 'experience',
    hotkeys: [
        {
            key: 'X',
            description: 'Shift + X: Display experience points layer',
            unlocked() { return player.xp.unlocked && !tmp.xp.deactivated; },
            onPress() { if (player.xp.unlocked) showTab('xp'); },
        },
        {
            key: 'ArrowUp',
            description: '↑ (in XP): Switch to previous enemy',
            unlocked() { return tmp.xp.enemies['*'].list.length > 1 && !tmp.xp.deactivated; },
            onPress() {
                const types = tmp.xp.enemies['*'].list;
                if (player.tab == 'xp' && player.xp.type != types[0]) {
                    const i = types.indexOf(player.xp.type);
                    if (i == -1) player.xp.type = types[0];
                    else player.xp.type = types[i - 1];
                };
            },
        },
        {
            key: 'ArrowDown',
            description: '↓ (in XP): Switch to next enemy',
            unlocked() { return tmp.xp.enemies['*'].list.length > 1 && !tmp.xp.deactivated; },
            onPress() {
                const types = tmp.xp.enemies['*'].list;
                if (player.tab == 'xp' && player.xp.type != types[types.length - 1]) {
                    const i = types.indexOf(player.xp.type);
                    if (i == -1) player.xp.type = types[0];
                    else player.xp.type = types[i + 1];
                };
            },
        },
    ],
    tabFormat: {
        'Enemy': {
            content: [
                () => {
                    const speed = D.times(layers.clo.time_speed('xp'), layers.tic.time_speed('xp'));

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
                        const kill_style = (text, ...style) => `<span style="color:${tmp.xp.color_kill};text-shadow:${tmp.xp.color_kill} 0 0 10px;${style.join(';')}">${text}</span>`,
                            capped = D.gte(player.xp.points, tmp.xp.enemies['*'].exp_cap),
                            xp_text = capped ? '' : `(${layerColor('xp', `+${format(tmp.xp.enemies[player.xp.type].experience)}`)}) `,
                            xp_cap = tmp.xp.enemies['*'].exp_cap,
                            kill_pieces = [];
                        if (tmp.xp.total.kills.neq(player.xp.enemies[player.xp.type].kills)) {
                            kill_pieces.push(kill_style(`<span title="Kills from the current enemy">${format(player.xp.enemies[player.xp.type].kills)}</span>`));
                        }
                        if (tmp.xp.enemies[player.xp.type].kills.neq(1)) {
                            kill_pieces.push(kill_style(`+${format(tmp.xp.enemies[player.xp.type].kills)}`));
                        }

                        const kill_text = kill_pieces.length ? ` (${kill_pieces.join(', ')})` : '';

                        return `You have ${layerColor('xp', formatWhole(player.xp.points), 'font-size:1.5em;')}\
                            ${xp_text}/ ${layerColor('xp', format(xp_cap))} experience\
                            and ${kill_style(formatWhole(tmp.xp.total.kills), 'font-size:1.5em')}${kill_text} kills`;
                    },
                ],
                () => {
                    if (tmp.xp.enemies['*'].drops_mult.neq(1) && can_drop('enemy:'))
                        return ['display-text', `Drop chances multiplier: *${format(tmp.xp.enemies['*'].drops_mult)}`];
                },
                'blank',
                ['bar', 'health'],
                ['display-text', () => {
                    let text = '';
                    if (options.colorLevels) {
                        text = capitalize(tmp.xp.enemies[player.xp.type].color_level);
                    } else {
                        text = `Level ${formatWhole(tmp.xp.enemies[player.xp.type].level)}`;
                    }

                    let element = '';
                    if (inChallenge('b', 61) || hasChallenge('b', 61)) {
                        const elem = player.xp.enemies[player.xp.type].element;
                        element = `(<span style="color:${tmp.mag.elements[elem].color};">${tmp.mag.elements[elem].name}</span>)`;
                    }

                    return `${text} ${tmp.xp.enemies[player.xp.type].name} ${element}`;
                }],
                'blank',
                ['clickables', [1]],
                'blank',
                ['display-text', () => `Current damage: ${format(tmp.xp.enemies[player.xp.type].damage)}`],
                () => {
                    if (inChallenge('b', 62) || hasChallenge('b', 62)) {
                        return ['column', [
                            ['row', [
                                ['display-text', 'Auto attack current enemy'],
                                'blank',
                                ['clickable', 'auto_attack_current'],
                            ]],
                            ['row', [
                                ['display-text', 'Auto attack all enemies'],
                                'blank',
                                ['clickable', 'auto_attack_all'],
                            ]],
                        ]];
                    }
                },
                'blank',
                ['display-text', () => {
                    const type = player.xp.type;
                    if (!can_drop('enemy:') || player.xp.enemies[type].kills.lte(0)) return;

                    let drops = 'nothing',
                        count = '';
                    const last_drops = player.xp.enemies[type].last_drops,
                        last_count = player.xp.enemies[type].last_drops_times;
                    if (last_drops.length) drops = listFormat.format(last_drops.map(([item, amount]) => `${format(amount)} ${layers.lo.items[item].name}`));
                    if (last_count.gt(1)) count = ` (${formatWhole(last_count)} times)`;

                    return `${capitalize(tmp.xp.enemies[type].name)} dropped ${drops}${count}`;
                }],
                () => {
                    if (inChallenge('b', 62)) return ['column', [
                        'blank',
                        ['bar', 'player'],
                        ['display-text', `You take ${format(tmp.xp.enemies.player.damage)} damage per attack`],
                    ]];
                },
            ],
        },
        'Upgrades': {
            content: [
                [
                    'display-text',
                    () => {
                        const kill_style = (text, ...style) => `<span style="color:${tmp.xp.color_kill};text-shadow:${tmp.xp.color_kill} 0 0 10px;${style.join(';')}">${text}</span>`;
                        return `You have ${layerColor('xp', format(player.xp.points, player.xp.points.gte('1e9') ? 2 : 0), 'font-size:1.5em;')} experience
                            and ${kill_style(formatWhole(tmp.xp.total.kills), 'font-size:1.5em')} kills`;
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
                    ],
                        next = upgs.find(([id, kills]) => !hasUpgrade('xp', id) && !tmp.xp.upgrades[id].unlocked && D.lt(tmp.xp.total.kills, kills));
                    if (!next) return;

                    return ['display-text', `You will unlock a new upgrades at ${formatWhole(next[1])} kills`];
                },
                () => hasChallenge('b', 12) ? ['row', [
                    ['display-text', 'Automatically buy upgrades'],
                    'blank',
                    ['clickable', 'auto_upgrade'],
                ]] : undefined,
                'blank',
                ['upgrades', [1, 2, 3, 4]],
            ],
            buttonStyle() {
                // If you figure out why shouldNotify does nothing when it returns true, I'll use it again.
                // Until then, it's done manually
                const style = {};
                if (canAffordLayerUpgrade('xp')) style['box-shadow'] = 'var(--hqProperty2a), 0 0 20px #ff0000';
                return style;
            },
        },
        'Info': {
            content: [
                [
                    'display-text',
                    () => {
                        const kill_style = (text, ...style) => `<span style="color:${tmp.xp.color_kill};text-shadow:${tmp.xp.color_kill} 0 0 10px;${style.join(';')}">${text}</span>`;
                        return `You have ${layerColor('xp', format(player.xp.points, player.xp.points.gte('1e9') ? 2 : 0), 'font-size:1.5em;')} experience
                            and ${kill_style(formatWhole(tmp.xp.total.kills), 'font-size:1.5em')} kills`;
                    },
                ],
                'blank',
                [
                    'layer-table',
                    () => {
                        const headers = ['Enemy', 'Health', 'Experience', 'Kills', options.colorLevels ? 'Color' : 'Level'],
                            show_dps = hasChallenge('b', 12),
                            show_element = hasChallenge('b', 61) || inChallenge('b', 61),
                            enemy_style = (type, text, ...style) => {
                                const color = tmp.xp.enemies[type].color;
                                return `<span style="color:${color};text-shadow:${color} 0 0 10px;${style.join(';')}">${text}</span>`
                            },
                            kill_style = (text, ...style) => `<span style="color:${tmp.xp.color_kill};text-shadow:${tmp.xp.color_kill} 0 0 10px;${style.join(';')}">${text}</span>`;

                        if (show_dps) headers.push('DPS');
                        if (show_element) headers.push('Element');

                        return [
                            headers,
                            ...tmp.xp.enemies['*'].list.map(type => {
                                const enemy = tmp.xp.enemies[type],
                                    kill_text = enemy.kills.neq(1) ? ` (+${kill_style(format(enemy.kills))})` : '',
                                    lines = [
                                        [['display-text', capitalize(enemy.name)]],
                                        [['display-text', `${format(player.xp.enemies[type].health)} / ${format(enemy.health)}`]],
                                        [['display-text', enemy_style(type, `+${format(enemy.experience)}`)]],
                                        [['display-text', kill_style(format(player.xp.enemies[type].kills)) + kill_text]],
                                        [['display-text', options.colorLevels ? capitalize(enemy.color_level) : formatWhole(enemy.level)]],
                                    ];

                                if (show_dps) {
                                    let line = format(enemy.dps);

                                    if (type == player.xp.type) line = `<u>${line}</u>`

                                    lines.push([['display-text', line]]);
                                }
                                if (show_element) {
                                    const element = tmp.mag.elements[player.xp.enemies[type].element];

                                    lines.push([['display-text', `<span style="color:${element.color};">${element.name}</span>`]]);
                                }

                                return lines;
                            }),
                        ];
                    },
                ],
            ],
            unlocked() { return tmp.xp.enemies['*'].list.length > 1 || inChallenge('b', 41); }, // Otherwise it'd show what you can see in the main view
        },
    },
    clickables: {
        11: {
            style: { 'background-image': `url('./resources/images/previous-button.svg')`, },
            unlocked() { return tmp.xp.enemies['*'].list.length > 1; },
            canClick() { return player.xp.type != tmp.xp.enemies['*'].list[0]; },
            onClick() {
                const i = tmp.xp.enemies['*'].list.indexOf(player.xp.type);
                if (i == -1) player.xp.type = tmp.xp.enemies['*'].list[0];
                else player.xp.type = tmp.xp.enemies['*'].list[i - 1];
            },
        },
        12: {
            style: { 'background-image': `url('./resources/images/gladius.svg')`, },
            canClick() { return D.gt(player.xp.enemies[player.xp.type].health, 0); },
            onClick() {
                if (player.xp.type == 'star') {
                    player.star.time = tmp.star.star.time;
                    showTab('none');
                    showNavTab('star');
                    return;
                }
                if (inChallenge('b', 62)) {
                    player.xp.enemies.player.health = D.minus(player.xp.enemies.player.health, tmp.xp.enemies.player.damage);
                }

                player.xp.enemies[player.xp.type].health = D.minus(player.xp.enemies[player.xp.type].health, tmp.xp.enemies[player.xp.type].damage);
                player.xp.clicked = true;
            },
            onHold() {
                if (player.xp.type == 'star') {
                    player.star.time = tmp.star.star.time;
                    showTab('none');
                    showNavTab('star');
                    return;
                }
                if (inChallenge('b', 62)) {
                    player.xp.enemies.player.health = D.minus(player.xp.enemies.player.health, tmp.xp.enemies.player.damage.div(3));
                }

                player.xp.enemies[player.xp.type].health = D.minus(player.xp.enemies[player.xp.type].health, tmp.xp.enemies[player.xp.type].damage.div(3));
                player.xp.clicked = true;
            },
        },
        13: {
            style: { 'background-image': `url('./resources/images/next-button.svg')`, },
            unlocked() { return tmp.xp.enemies['*'].list.length > 1; },
            canClick() { return player.xp.type != tmp.xp.enemies['*'].list[tmp.xp.enemies['*'].list.length - 1]; },
            onClick() {
                const i = tmp.xp.enemies['*'].list.indexOf(player.xp.type);
                if (i == -1) player.xp.type = tmp.xp.enemies['*'].list[0];
                else player.xp.type = tmp.xp.enemies['*'].list[i + 1];
            },
        },
        // Auto clickables that look like toggles
        'auto_attack_current': {
            unlocked() { return inChallenge('b', 62) || hasChallenge('b', 62); },
            canClick() { return inChallenge('b', 62) || hasChallenge('b', 62); },
            onClick() { player.xp.auto.attack_current = !player.xp.auto.attack_current; },
            display() { return player.xp.auto.attack_current ? 'ON' : 'OFF'; },
            style: {
                'height': '40px',
                'width': '40px',
                'min-height': 'unset',
                'font-size': '.8em',
            },
        },
        'auto_attack_all': {
            unlocked() { return inChallenge('b', 62) || hasChallenge('b', 62); },
            canClick() { return inChallenge('b', 62) || hasChallenge('b', 62); },
            onClick() { player.xp.auto.attack_all = !player.xp.auto.attack_all; },
            display() { return player.xp.auto.attack_all ? 'ON' : 'OFF'; },
            style: {
                'height': '40px',
                'width': '40px',
                'min-height': 'unset',
                'font-size': '.8em',
            },
        },
        'auto_upgrade': {
            unlocked() { return hasChallenge('b', 12); },
            canClick() { return hasChallenge('b', 12); },
            onClick() { player.xp.auto.upgrade = !player.xp.auto.upgrade; },
            display() { return player.xp.auto.upgrade ? 'ON' : 'OFF'; },
            style: {
                'height': '40px',
                'width': '40px',
                'min-height': 'unset',
                'font-size': '.8em',
            },
        },
    },
    upgrades: {
        11: {
            title: 'Sharper Sword',
            description: 'Double damage',
            effect() {
                let base = D(2);

                if (hasUpgrade('xp', 32)) base = base.pow(upgradeEffect('xp', 32));

                return base;
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return tmp.xp.total.kills.gte(5) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(5),
        },
        12: {
            title: 'Stronger Monsters',
            description: 'Monsters have more health and give more experience',
            effect() {
                let health = D(10),
                    experience = D(1.5);

                if (hasUpgrade('xp', 32)) {
                    health = health.times(upgradeEffect('xp', 32));
                    experience = experience.pow(upgradeEffect('xp', 32));
                }

                return { health, experience };
            },
            effectDisplay() {
                /** @type {{health: Decimal, experience: Decimal}} */
                const { health, experience } = upgradeEffect(this.layer, this.id);
                return `+${format(health)} health, *${format(experience)} xp`;
            },
            unlocked() { return tmp.xp.total.kills.gte(10) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(10),
        },
        13: {
            title: 'Bloodthirst',
            description() {
                if (!shiftDown) {
                    return 'Enemy kills boost experience gain';
                } else {
                    let formula = 'log10(kills + 10)';

                    return `Formula: ${formula}`;
                }
            },
            effect() {
                let effect = tmp.xp.total.kills.max(0).add(10).log10();

                effect = effect.times(tmp.l.skills.vampirism.effect);

                if (hasUpgrade('xp', 32)) effect = effect.pow(upgradeEffect('xp', 32));

                return effect;
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return tmp.xp.total.kills.gte(15) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(15),
        },
        21: {
            title: 'Bloodlust',
            description() {
                if (!shiftDown) {
                    return 'Enemy health boosts damage';
                } else {
                    let formula = '10√(max health + 1) - 1';

                    return `Formula: ${formula}`;
                }
            },
            effect() {
                let effect = tmp.xp.enemies[player.xp.type].health.add(1).root(10).minus(1);

                effect = effect.times(tmp.l.skills.vampirism.effect);

                return effect;
            },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return tmp.xp.total.kills.gte(30) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(50),
        },
        22: {
            title: 'Sword Trap',
            description() {
                let amount = '25%';
                if (hasChallenge('b', 11)) amount = '50%';
                let text = `Passively deal ${amount} of your damage every second`;
                if (hasChallenge('b', 12)) text += `<br>Passively deal 25% of your damage to <u>every</u> monsters every second (see Info tab for current DPS)`;

                return text;
            },
            effect() {
                let active = D(.25),
                    global = D.dZero;

                if (hasChallenge('b', 11)) active = D(.5);

                if (hasChallenge('b', 12)) global = active.div(2);

                return { active, global };
            },
            effectDisplay() {
                if (hasChallenge('b', 12)) return '';
                return `${format(tmp.xp.enemies[player.xp.type].damage.times(upgradeEffect(this.layer, this.id).active))} /s`;
            },
            unlocked() { return tmp.xp.total.kills.gte(50) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(150),
        },
        23: {
            title: 'Notebook',
            description: 'Double experience gain',
            effect() {
                let effect = D.dTwo;

                effect = effect.add(tmp.l.skills.reading.effect);

                return effect;
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return tmp.xp.total.kills.gte(70) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(250),
        },
        31: {
            title: 'Sword of Knowledge',
            description() {
                if (!shiftDown) {
                    return 'Experience boosts damage';
                } else {
                    let formula = 'log5(experience + 5)';

                    return `Formula: ${formula}`;
                }
            },
            effect() { return player.xp.points.max(0).max(0).add(5).log(5); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return tmp.xp.total.kills.gte(100) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(400),
        },
        32: {
            title: 'Book of Numbers',
            description: 'Reapply first row upgrades effects',
            unlocked() { return tmp.xp.total.kills.gte(125) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            effect() {
                let effect = D.dTwo;

                effect = effect.add(tmp.l.skills.reading.effect);

                return effect;
            },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id).minus(1))} times`; },
            cost: D(600),
        },
        33: {
            title: 'Better Power',
            description: 'Unlock 2 new layers<br>Deal 50% more damage',
            effect() { return D(1.5); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return tmp.xp.total.kills.gte(150) || hasUpgrade(this.layer, this.id) || hasChallenge('b', 11); },
            cost: D(900),
        },
        41: {
            title: 'Sword of Death',
            description() {
                if (!shiftDown) {
                    return 'Enemy kills boost damage';
                } else {
                    let formula = 'log9(kills + 9)';

                    return `Formula: ${formula}`;
                }
            },
            effect() { return tmp.xp.total.kills.max(0).add(9).log(9); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return inChallenge('b', 31) || hasChallenge('b', 31); },
            cost: D(195),
        },
        42: {
            title: 'Forbidden Knowledge',
            description() {
                if (!shiftDown) {
                    return 'Experience boosts experience gain';
                } else {
                    let formula = '15√(experience) + 1';

                    return `Formula: ${formula}`;
                }
            },
            effect() { return player.xp.points.root(15).add(1); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            unlocked() { return inChallenge('b', 31) || hasChallenge('b', 31); },
            cost: D(850),
        },
        43: {
            title: 'Cryptoslime',
            description: 'Goblins can also drop slime items at 10% of the rate.<br>Slime level *1.1',
            effect() {
                let level_mult = D(1.1),
                    chance_mult = D(.1);

                return { level_mult, chance_mult };
            },
            effectDisplay() { return `level *${format(upgradeEffect(this.layer, this.id).level_mult)}, chance *${format(upgradeEffect(this.layer, this.id).chance_mult)}`; },
            unlocked() { return inChallenge('b', 31) || hasChallenge('b', 31); },
            cost: D(2222),
        },
    },
    bars: {
        health: {
            direction: RIGHT,
            width: 200,
            height: 50,
            progress() {
                const max = tmp.xp.enemies[player.xp.type].health;
                return D.div(player.xp.enemies[player.xp.type].health ?? max, max);
            },
            display() {
                let text = `${format(player.xp.enemies[player.xp.type].health)} / ${format(tmp.xp.enemies[player.xp.type].health)}`;

                const regen = tmp.xp.enemies[player.xp.type].regen;
                if (regen.gt(0)) {
                    text += `<br>(+${format(regen)} /s)`;
                }

                return text;
            },
            baseStyle: { 'background-color': 'red' },
            fillStyle: { 'background-color': 'lime' },
            textStyle: { 'color': 'black' },
        },
        player: {
            direction: RIGHT,
            width: 200,
            height: 50,
            progress() {
                const max = tmp.xp.enemies.player.health;
                return D.div(player.xp.enemies.player.health ?? max, max);
            },
            display() {
                let text = `${format(player.xp.enemies.player.health)} / ${format(tmp.xp.enemies.player.health)}`;

                const regen = tmp.xp.enemies.player.regen;
                if (regen.gt(0)) {
                    text += `<br>(+${format(regen)} /s)`;
                }

                return text;
            },
            baseStyle: { 'background-color': 'red' },
            fillStyle: { 'background-color': 'lime' },
            textStyle: { 'color': 'black' },
            unlocked() { return inChallenge('b', 62); },
        },
    },
    update(diff) {
        if (tmp.clo.layerShown) diff = D.times(diff, layers.clo.time_speed(this.layer));
        if (tmp.tic.layerShown) diff = D.times(diff, layers.tic.time_speed(this.layer));

        for (const type of tmp.xp.enemies['*'].list) {
            if (player.xp.enemies[type].health.lte(0)) continue;

            const dps = tmp.xp.enemies[type].dps,
                regen = tmp.xp.enemies[type].regen;

            if (dps.gt(0)) {
                player.xp.clicked = true;
                player.xp.enemies[type].health = D.minus(player.xp.enemies[type].health, dps.times(diff));
            }

            if (regen.gt(0)) {
                player.xp.enemies[type].health = D.add(player.xp.enemies[type].health, regen.times(diff));
            }
        }
        if (inChallenge('b', 62)) {
            const type = 'player';

            if (player.xp.enemies[type].health.gt(0)) {
                const dps = tmp.xp.enemies[type].dps,
                    regen = tmp.xp.enemies[type].regen;

                if (dps.gt(0)) {
                    player.xp.clicked = true;
                    player.xp.enemies[type].health = D.minus(player.xp.enemies[type].health, dps.times(diff));
                }

                if (regen.gt(0)) {
                    player.xp.enemies[type].health = D.add(player.xp.enemies[type].health, regen.times(diff));
                }
            }
        }
    },
    automate() {
        for (const type of tmp.xp.enemies['*'].list) {
            const player_data = player.xp.enemies[type];

            if (D.gt(player_data.health, tmp.xp.enemies[type].health)) player_data.health = tmp.xp.enemies[type].health;
            if (D.lte(player_data.health, 0)) {
                if (player.xp.clicked) {
                    // Workaround for starting at undefined
                    const xp_gain = tmp.xp.enemies[type].experience,
                        kills_gain = tmp.xp.enemies[type].kills;

                    addPoints('xp', xp_gain);
                    player_data.kills = D.add(player_data.kills, kills_gain);

                    if (can_drop(`enemy:${type}`)) {
                        let drops_mult = kills_gain;

                        drops_mult = drops_mult.times(tmp.xp.enemies['*'].drops_mult);

                        const drops = get_enemy_drops(type, drops_mult),
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

                    if (inChallenge('b', 61)) {
                        player_data.element = tmp.mag.elements['*'].random;
                    } else if (hasChallenge('b', 61)) {
                        player_data.element = layers.mag.elements['*'].element(type);
                    }
                    if (inChallenge('b', 62) || hasChallenge('b', 62)) {
                        addPoints('sta', tmp.sta.stats['*'].gain);
                    }
                    if (type == 'star') {
                        player_data.name = random_string_alpha(Math.floor(Math.random() * 12) + 4).toLowerCase();
                    }
                    player.k.active.filter(data => data.units == 'kills')
                        .forEach(data => data.time = D.minus(data.time, 1));
                }

                player_data.health = D.add(player_data.health, layers.xp.enemies[type].health(layers.xp.enemies[type].level(player_data.kills)));
            }
        }
        if (inChallenge('b', 62)) {
            const player_data = player.xp.enemies.player;

            if (D.gt(player_data.health, tmp.xp.enemies.player.health)) {
                player_data.health = tmp.xp.enemies.player.health;
            }
            if (D.lte(player_data.health, 0)) {
                doReset('lo', true);
            }
        }
    },
    type: 'none',
    enemies: {
        '*': {
            color_level(level = 0) {
                const l = D(level);
                if (format(l) == 'NaN') return 'unknown';
                /** @type {{[k in number|'e'|'F'|'.'|'-']: (len: number) => string}} */
                const map = {
                    0: len => [
                        'black',
                        'ebony',
                        'dark',
                        'grim',
                        'inky',
                        'vantablack',
                        'onyx',
                    ][len - 1] ?? 'black',
                    1: len => [
                        'gray',
                        'dusty',
                        'light gray',
                        'ashen',
                        'grey',
                        'slate',
                        'light grey',
                        'silver',
                    ][len - 1] ?? 'gray',
                    2: len => [
                        'red',
                        'carmine',
                        'carnelian',
                        'cardinal',
                        'crimson',
                        'coquelicot',
                        'scarlet',
                        'ruby',
                    ][len - 1] ?? 'red',
                    3: len => [
                        'orange',
                        'carrot',
                        'fulvous',
                        'flame',
                        'ginger',
                        'sunset',
                        'tangerine',
                        'amber',
                    ][len - 1] ?? 'orange',
                    4: len => [
                        'yellow',
                        'sunglow',
                        'mustard',
                        'jonquil',
                        'mango',
                        'jasmine',
                        'lemon',
                        'gold',
                    ][len - 1] ?? 'yellow',
                    5: len => [
                        'green',
                        'volt',
                        'mint',
                        'chartreuse',
                        'harlequin',
                        'olive',
                        'moss',
                        'jade',
                    ][len - 1] ?? 'green',
                    6: len => [
                        'blue',
                        'zaffre',
                        'verdigris',
                        'ultramarine',
                        'glaucous',
                        'azure',
                        'cerulean',
                        'sapphire',
                    ][len - 1] ?? 'blue',
                    7: len => [
                        'magenta',
                        'purple',
                        'violet',
                        'lavender',
                        'orchid',
                        'lilac',
                        'plum',
                        'amethyst',
                    ][len - 1] ?? 'magenta',
                    8: len => [
                        'brown',
                        'beige',
                        'chestnut',
                        'chocolate',
                        'coffee',
                        'tan',
                        'sepia',
                        'bronze',
                    ][len - 1] ?? 'brown',
                    9: len => [
                        'white',
                        'snow',
                        'pale',
                        'bleached',
                        'ghostly',
                        'cream',
                        'light',
                        'ivory',
                    ][len - 1] ?? 'white',
                    'e': len => 'shifted through',
                    'F': len => 'tainted by',
                    '.': len => 'covered by',
                    '-': len => 'negative',
                };

                return formatWhole(l).replaceAll(/(.)\1*/g, s => `${map[s[0]](s.length)} `);
            },
            level_mult() {
                return D.dOne;
            },
            level_exp() {
                let exp = D.dOne;

                if (inChallenge('b', 22)) exp = D.dTwo;

                return exp;
            },
            health_mult() {
                let mult = D.dOne;

                mult = mult.div(buyableEffect('lo', 13));

                if (hasChallenge('b', 62) && !inChallenge('b', 62)) mult = mult.div(tmp.sta.stats.health.effect);

                return mult;
            },
            health_add() {
                let add = D.dZero;

                if (hasUpgrade('xp', 12)) add = add.add(upgradeEffect('xp', 12).health);

                return add;
            },
            exp_mult() {
                let mult = D.dOne;

                if (hasUpgrade('xp', 12)) mult = mult.times(upgradeEffect('xp', 12).experience);
                if (hasUpgrade('xp', 13)) mult = mult.times(upgradeEffect('xp', 13));
                if (hasUpgrade('xp', 23)) mult = mult.times(upgradeEffect('xp', 23));
                if (hasUpgrade('xp', 42)) mult = mult.times(upgradeEffect('xp', 42));

                mult = mult.times(tmp.l.skills.learning.effect);

                mult = mult.times(buyableEffect('lo', 11));

                if (inChallenge('b', 12) && !hasUpgrade('s', 41)) mult = mult.div(player.xp.points.max(0).add(10).log10());
                if (hasUpgrade('s', 41)) mult = mult.div(upgradeEffect('s', 41));

                // Alt
                if (hasUpgrade('xp_alt', 21)) mult = mult.times(upgradeEffect('xp_alt', 21).pow(tmp.a.change_efficiency));
                if (hasUpgrade('xp_alt', 23)) mult = mult.times(upgradeEffect('xp_alt', 23).pow(tmp.a.change_efficiency));
                if (hasUpgrade('xp_alt', 42)) mult = mult.times(upgradeEffect('xp_alt', 42).pow(tmp.a.change_efficiency));

                if (hasUpgrade('c', 33)) mult = mult.times(upgradeEffect('c', 33).pow(tmp.a.change_efficiency));

                mult = mult.times(D.pow(tmp.k.dishes.failure.effect, tmp.a.change_efficiency));

                return mult;
            },
            exp_cap() {
                let cap = getNextAt('l', false);

                if (inChallenge('b', 32)) cap = cap.times(1.05); // Allows getting a level

                cap = cap.times(tmp.to.effect);

                return cap;
            },
            kill_mult() {
                let mult = D.dOne;

                if (inChallenge('b', 12) && !hasUpgrade('s', 42)) mult = mult.div(tmp.xp.total.kills.max(0).add(10).log10());
                if (hasUpgrade('s', 42)) mult = mult.times(upgradeEffect('s', 42));

                return mult;
            },
            damage_mult() {
                let mult = D.dOne;

                mult = mult.times(tmp.mag.elements[player.mag.element].effects.xp?.damage_multiplier ?? 1);
                if (mult.eq(0)) return D.dZero;

                if (hasUpgrade('xp', 11)) mult = mult.times(upgradeEffect('xp', 11));
                if (hasUpgrade('xp', 31)) mult = mult.times(upgradeEffect('xp', 31));
                if (hasUpgrade('xp', 33)) mult = mult.times(upgradeEffect('xp', 33));
                if (hasUpgrade('xp', 41)) mult = mult.times(upgradeEffect('xp', 41));

                if (hasUpgrade('m', 21)) mult = mult.times(upgradeEffect('m', 21));

                if (hasUpgrade('t', 21)) mult = mult.times(upgradeEffect('t', 21));

                mult = mult.times(tmp.l.skills.attacking.effect);

                mult = mult.times(buyableEffect('lo', 31));
                mult = mult.times(buyableEffect('lo', 42).xp_damage_mult);

                if (hasUpgrade('f', 21)) mult = mult.times(upgradeEffect('f', 21));

                if (hasUpgrade('s', 21)) mult = mult.times(upgradeEffect('s', 21));

                mult = mult.times(tmp.sta.stats.attack.effect);

                return mult;
            },
            damage_add() {
                let add = D.dZero;

                if (hasUpgrade('xp', 21)) add = add.add(upgradeEffect('xp', 21));

                return add;
            },
            dps_mult_active() {
                if ((inChallenge('b', 62) || hasChallenge('b', 62)) && !player.xp.auto.attack_current) return D.dZero;

                let mult = D.dZero;

                if (hasUpgrade('xp', 22)) mult = mult.add(upgradeEffect('xp', 22).active);

                return mult;
            },
            dps_mult_inactive() {
                if ((inChallenge('b', 62) || hasChallenge('b', 62)) && !player.xp.auto.attack_all) return D.dZero;

                let mult = D.dZero;

                if (hasUpgrade('xp', 22)) mult = mult.add(upgradeEffect('xp', 22).global);

                return mult;
            },
            regen_add() {
                let add = D.dZero;

                if (inChallenge('b', 21)) add = add.add(.05);

                return add;
            },
            drops_mult() {
                let mult = D.dOne;

                mult = mult.times(tmp.mag.elements[player.mag.element].effects.xp?.drop_multiplier ?? 1);

                return mult;
            },
            list() {
                return Object.keys(layers.xp.enemies)
                    .filter(type => type != '*' && tmp.xp.enemies[type].unlocked);
            },
        },
        // Normal enemies
        slime: {
            _type: null,
            get type() { return this._type ??= Object.keys(layers.xp.enemies).find(item => layers.xp.enemies[item] == this); },
            level() {
                const kills = player.xp.enemies[this.type].kills ?? D.dZero;

                let level = D.div(kills, 10).root(2);

                level = level.times(tmp.xp.enemies['*'].level_mult);

                if (hasUpgrade('xp', 43)) level = level.times(upgradeEffect('xp', 43).level_mult);

                level = level.pow(tmp.xp.enemies['*'].level_exp);

                return level.floor();
            },
            color_level() { return layers.xp.enemies['*'].color_level(tmp.xp.enemies[this.type].level); },
            color: '#77BB77',
            health(level) {
                level ??= tmp.xp.enemies[this.type].level;

                let health = D(2).pow(level).times(10);

                health = health.add(tmp.xp.enemies['*'].health_add);

                health = health.times(tmp.xp.enemies['*'].health_mult);

                if (inChallenge('b', 11)) health = health.times(5);
                if (inChallenge('b', 31)) health = health.times(2.5);

                return health;
            },
            experience(level) {
                let exp = D.add(1, level ?? tmp.xp.enemies[this.type].level);

                exp = exp.times(tmp.xp.enemies['*'].exp_mult);

                exp = exp.times(D.pow(buyableEffect('lo', 11), .1));

                return exp.min(tmp.xp.enemies['*'].exp_cap.minus(player.xp.points)).max(0);
            },
            kills() {
                let kills = D.dOne;

                kills = kills.times(tmp.xp.enemies['*'].kill_mult);

                return kills;
            },
            name: 'slime',
            damage() {
                let damage = D.dOne;

                damage = damage.add(tmp.xp.enemies['*'].damage_add);

                damage = damage.times(tmp.xp.enemies['*'].damage_mult);

                if (tmp.mag.elements[player.mag.element].strong.includes(player.xp.enemies[this.type].element)) {
                    damage = damage.times(tmp.mag.elements['*'].strong_multiplier);
                } else if (tmp.mag.elements[player.mag.element].weak.includes(player.xp.enemies[this.type].element)) {
                    damage = damage.times(tmp.mag.elements['*'].weak_multiplier);
                }

                return damage;
            },
            dps() {
                let dps = tmp.xp.enemies['*'].dps_mult_inactive;

                if (this.type == player.xp.type) dps = dps.add(tmp.xp.enemies['*'].dps_mult_active);

                if (dps.eq(0)) return D.dZero;

                return dps.times(tmp.xp.enemies[this.type].damage);
            },
            regen(level) {
                let regen_perc = D.dZero;

                regen_perc = regen_perc.add(tmp.xp.enemies['*'].regen_add);

                if (regen_perc.eq(0)) return D.dZero;

                return regen_perc.times(this.health(level ?? tmp.xp.enemies[this.type].level));
            },
            unlocked() { return !inChallenge('b', 41); },
        },
        goblin: {
            _type: null,
            get type() { return this._type ??= Object.keys(layers.xp.enemies).find(item => layers.xp.enemies[item] == this); },
            level() {
                const kills = player.xp.enemies[this.type].kills ?? D.dZero;

                let level = D.div(kills, 10).root(2);

                level = level.times(tmp.xp.enemies['*'].level_mult);

                level = level.pow(tmp.xp.enemies['*'].level_exp);

                return level.floor();
            },
            color_level() { return layers.xp.enemies['*'].color_level(tmp.xp.enemies[this.type].level); },
            color: '#33DD33',
            health(level) {
                level ??= tmp.xp.enemies[this.type].level;

                let health = D(3).pow(level).times(15);

                health = health.add(tmp.xp.enemies['*'].health_add);

                health = health.times(tmp.xp.enemies['*'].health_mult);

                return health;
            },
            experience(level) {
                let exp = D.pow(level ?? tmp.xp.enemies[this.type].level, 2).add(2);

                exp = exp.times(tmp.xp.enemies['*'].exp_mult);

                return exp.min(tmp.xp.enemies['*'].exp_cap.minus(player.xp.points)).max(0);
            },
            kills() {
                let kills = D.dOne;

                kills = kills.times(tmp.xp.enemies['*'].kill_mult);

                return kills;
            },
            name: 'goblin',
            damage() {
                let damage = D.dOne;

                damage = damage.add(tmp.xp.enemies['*'].damage_add);

                damage = damage.times(tmp.xp.enemies['*'].damage_mult);

                if (tmp.mag.elements[player.mag.element].strong.includes(player.xp.enemies[this.type].element)) {
                    damage = damage.times(tmp.mag.elements['*'].strong_multiplier);
                } else if (tmp.mag.elements[player.mag.element].weak.includes(player.xp.enemies[this.type].element)) {
                    damage = damage.times(tmp.mag.elements['*'].weak_multiplier);
                }

                return damage;
            },
            dps() {
                let dps = tmp.xp.enemies['*'].dps_mult_inactive;

                if (this.type == player.xp.type) dps = dps.add(tmp.xp.enemies['*'].dps_mult_active);

                if (dps.eq(0)) return D.dZero;

                return dps.times(tmp.xp.enemies[this.type].damage);
            },
            regen(level) {
                let regen_perc = D.dZero;

                regen_perc = regen_perc.add(tmp.xp.enemies['*'].regen_add);

                if (regen_perc.eq(0)) return D.dZero;

                return regen_perc.times(this.health(level ?? tmp.xp.enemies[this.type].level));
            },
            unlocked() { return hasChallenge('b', 11) && !inChallenge('b', 31) && !inChallenge('b', 41); },
        },
        zombie: {
            _type: null,
            get type() { return this._type ??= Object.keys(layers.xp.enemies).find(item => layers.xp.enemies[item] == this); },
            level() {
                const kills = player.xp.enemies[this.type].kills ?? D.dZero;

                let level = D.div(kills, 10).root(2);

                level = level.times(tmp.xp.enemies['*'].level_mult);

                level = level.pow(tmp.xp.enemies['*'].level_exp);

                return level.floor();
            },
            color_level() { return layers.xp.enemies['*'].color_level(tmp.xp.enemies[this.type].level); },
            color: '#779900',
            health(level) {
                level ??= tmp.xp.enemies[this.type].level;

                let health = D(2.5).pow(level).times(20);

                health = health.add(tmp.xp.enemies['*'].health_add);

                health = health.times(tmp.xp.enemies['*'].health_mult);

                return health;
            },
            experience(level) {
                let exp = D.pow(level ?? tmp.xp.enemies[this.type].level, 2.5).add(4);

                exp = exp.times(tmp.xp.enemies['*'].exp_mult);

                return exp.min(tmp.xp.enemies['*'].exp_cap.minus(player.xp.points)).max(0);
            },
            kills() {
                let kills = D.dOne;

                kills = kills.times(tmp.xp.enemies['*'].kill_mult);

                return kills;
            },
            name: 'zombie',
            damage() {
                let damage = D.dOne;

                damage = damage.add(tmp.xp.enemies['*'].damage_add);

                damage = damage.times(tmp.xp.enemies['*'].damage_mult);

                if (tmp.mag.elements[player.mag.element].strong.includes(player.xp.enemies[this.type].element)) {
                    damage = damage.times(tmp.mag.elements['*'].strong_multiplier);
                } else if (tmp.mag.elements[player.mag.element].weak.includes(player.xp.enemies[this.type].element)) {
                    damage = damage.times(tmp.mag.elements['*'].weak_multiplier);
                }

                return damage;
            },
            dps() {
                let dps = tmp.xp.enemies['*'].dps_mult_inactive;

                if (this.type == player.xp.type) dps = dps.add(tmp.xp.enemies['*'].dps_mult_active);

                if (dps.eq(0)) return D.dZero;

                return dps.times(tmp.xp.enemies[this.type].damage);
            },
            regen(level) {
                let regen_perc = D(.01);

                regen_perc = regen_perc.add(tmp.xp.enemies['*'].regen_add);

                if (regen_perc.eq(0)) return D.dZero;

                return regen_perc.times(this.health(level ?? tmp.xp.enemies[this.type].level));
            },
            unlocked() { return hasChallenge('b', 12) && !inChallenge('b', 31) && !inChallenge('b', 41); },
        },
        ent: {
            _type: null,
            get type() { return this._type ??= Object.keys(layers.xp.enemies).find(item => layers.xp.enemies[item] == this); },
            level() {
                const kills = player.xp.enemies[this.type].kills ?? D.dZero;

                let level = D.div(kills, 10).root(2);

                level = level.times(tmp.xp.enemies['*'].level_mult);

                level = level.pow(tmp.xp.enemies['*'].level_exp);

                return level.floor();
            },
            color_level() { return layers.xp.enemies['*'].color_level(tmp.xp.enemies[this.type].level); },
            color: '#884411',
            health(level) {
                level ??= tmp.xp.enemies[this.type].level;

                let health = D(2.25).pow(level).times(50);

                health = health.add(tmp.xp.enemies['*'].health_add);

                health = health.times(tmp.xp.enemies['*'].health_mult);

                return health;
            },
            experience(level) {
                let exp = D.pow(level ?? tmp.xp.enemies[this.type].level, 3).add(8);

                exp = exp.times(tmp.xp.enemies['*'].exp_mult);

                return exp.min(tmp.xp.enemies['*'].exp_cap.minus(player.xp.points)).max(0);
            },
            kills() {
                let kills = D.dOne;

                kills = kills.times(tmp.xp.enemies['*'].kill_mult);

                return kills;
            },
            name: 'ent',
            damage() {
                let damage = D.dOne;

                damage = damage.add(tmp.xp.enemies['*'].damage_add);

                damage = damage.times(tmp.xp.enemies['*'].damage_mult);

                if (tmp.mag.elements[player.mag.element].strong.includes(player.xp.enemies[this.type].element)) {
                    damage = damage.times(tmp.mag.elements['*'].strong_multiplier);
                } else if (tmp.mag.elements[player.mag.element].weak.includes(player.xp.enemies[this.type].element)) {
                    damage = damage.times(tmp.mag.elements['*'].weak_multiplier);
                }

                damage = damage.add(tmp.t.trees['*'].damage_base);

                return damage;
            },
            dps() {
                let dps = tmp.xp.enemies['*'].dps_mult_inactive;

                if (this.type == player.xp.type) dps = dps.add(tmp.xp.enemies['*'].dps_mult_active);

                if (dps.eq(0)) return D.dZero;

                return dps.times(tmp.xp.enemies[this.type].damage);
            },
            regen(level) {
                let regen_perc = D(.05);

                regen_perc = regen_perc.add(tmp.xp.enemies['*'].regen_add);

                if (regen_perc.eq(0)) return D.dZero;

                return regen_perc.times(this.health(level ?? tmp.xp.enemies[this.type].level));
            },
            unlocked() { return hasChallenge('b', 21) && !inChallenge('b', 31) && !inChallenge('b', 41); },
        },
        // Challenges enemies
        amalgam: {
            _type: null,
            get type() { return this._type ??= Object.keys(layers.xp.enemies).find(item => layers.xp.enemies[item] == this); },
            level() {
                const kills = player.xp.enemies[this.type].kills ?? D.dZero;

                let level = D.div(kills, 10).root(2);

                level = level.times(tmp.xp.enemies['*'].level_mult);

                level = level.pow(tmp.xp.enemies['*'].level_exp);

                return level.floor();
            },
            color_level() { return layers.xp.enemies['*'].color_level(tmp.xp.enemies[this.type].level); },
            color() { return colors_average(...['slime', 'goblin', 'zombie', 'ent'].map(type => tmp.xp.enemies[type].color)); },
            health(level) {
                level ??= tmp.xp.enemies[this.type].level;

                return ['slime', 'goblin', 'zombie', 'ent'].reduce((sum, type) => D.add(sum, layers.xp.enemies[type].health(level)), D.dZero);
            },
            experience(level) {
                level ??= tmp.xp.enemies[this.type].level;

                return ['slime', 'goblin', 'zombie', 'ent'].reduce((sum, type) => D.add(sum, layers.xp.enemies[type].experience(level)), D.dZero);
            },
            kills() {
                let kills = D.dOne;

                kills = kills.times(tmp.xp.enemies['*'].kill_mult);

                return kills;
            },
            name: 'amalgam',
            damage() {
                let damage = D.dOne;

                damage = damage.add(tmp.xp.enemies['*'].damage_add);

                damage = damage.times(tmp.xp.enemies['*'].damage_mult);

                if (tmp.mag.elements[player.mag.element].strong.includes(player.xp.enemies[this.type].element)) {
                    damage = damage.times(tmp.mag.elements['*'].strong_multiplier);
                } else if (tmp.mag.elements[player.mag.element].weak.includes(player.xp.enemies[this.type].element)) {
                    damage = damage.times(tmp.mag.elements['*'].weak_multiplier);
                }

                return damage;
            },
            dps() {
                let dps = tmp.xp.enemies['*'].dps_mult_inactive;

                if (this.type == player.xp.type) dps = dps.add(tmp.xp.enemies['*'].dps_mult_active);

                if (dps.eq(0)) return D.dZero;

                return dps.times(tmp.xp.enemies[this.type].damage);
            },
            regen(level) {
                level ??= tmp.xp.enemies[this.type].level;

                return ['slime', 'goblin', 'zombie', 'ent'].reduce((sum, type) => D.add(sum, layers.xp.enemies[type].regen(level)), D.dZero);
            },
            unlocked() { return inChallenge('b', 41); },
        },
        world_tree: {
            _type: null,
            get type() { return this._type ??= Object.keys(layers.xp.enemies).find(item => layers.xp.enemies[item] == this); },
            level() {
                const kills = tmp.xp.total.kills;

                let level = D.div(kills, 10).root(2);

                level = level.times(tmp.xp.enemies['*'].level_mult);

                level = level.pow(tmp.xp.enemies['*'].level_exp);

                return level.floor();
            },
            color_level() { return layers.xp.enemies['*'].color_level(tmp.xp.enemies[this.type].level); },
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
            health(level) {
                level ??= tmp.xp.enemies[this.type].level;

                let health = D(2.25).pow(level).times(250);

                health = health.add(tmp.xp.enemies['*'].health_add);

                health = health.times(tmp.xp.enemies['*'].health_mult);

                return health;
            },
            experience(level) {
                let exp = D.pow(level ?? tmp.xp.enemies[this.type].level, 2).times(D.log10(tmp.xp.total.kills.max(0).add(1)));

                exp = exp.times(tmp.xp.enemies['*'].exp_mult);

                return exp.min(tmp.xp.enemies['*'].exp_cap.minus(player.xp.points)).max(0);
            },
            kills() {
                let kills = D.dOne;

                kills = kills.times(tmp.xp.enemies['*'].kill_mult);

                return kills;
            },
            name() {
                let name = 'world tree';

                if (tmp.xp.total.kills.lte(10)) return `${name} (sickly)`;
                if (tmp.xp.total.kills.lte(100)) return name;
                if (tmp.xp.total.kills.lte(1000)) return `${name} (healthy)`;
                return `${name} (restored)`;
            },
            damage() {
                let damage = D.dOne;

                damage = damage.add(tmp.xp.enemies['*'].damage_add);

                damage = damage.times(tmp.xp.enemies['*'].damage_mult);

                if (tmp.mag.elements[player.mag.element].strong.includes(player.xp.enemies[this.type].element)) {
                    damage = damage.times(tmp.mag.elements['*'].strong_multiplier);
                } else if (tmp.mag.elements[player.mag.element].weak.includes(player.xp.enemies[this.type].element)) {
                    damage = damage.times(tmp.mag.elements['*'].weak_multiplier);
                }

                damage = damage.add(tmp.t.trees['*'].damage_base);

                return damage;
            },
            dps() {
                let dps = tmp.xp.enemies['*'].dps_mult_inactive;

                if (this.type == player.xp.type) dps = dps.add(tmp.xp.enemies['*'].dps_mult_active);

                if (dps.eq(0)) return D.dZero;

                return dps.times(tmp.xp.enemies[this.type].damage);
            },
            regen(level) {
                let regen_perc = D(.05);

                regen_perc = regen_perc.add(tmp.xp.enemies['*'].regen_add);

                if (regen_perc.eq(0)) return D.dZero;

                return regen_perc.times(this.health(level ?? tmp.xp.enemies[this.type].level));
            },
            unlocked() { return !inChallenge('b', 31) && inChallenge('b', 42); },
        },
        player: {
            _type: null,
            get type() { return this._type ??= Object.keys(layers.xp.enemies).find(item => layers.xp.enemies[item] == this); },
            level() {
                const kills = player.xp.enemies[this.type].kills ?? D.dZero;

                let level = D.div(kills, 10).root(2);

                level = level.times(tmp.xp.enemies['*'].level_mult);

                level = level.pow(tmp.xp.enemies['*'].level_exp);

                return level.floor();
            },
            color_level() { return layers.xp.enemies['*'].color_level(tmp.xp.enemies[this.type].level); },
            color() { return colors[options.theme].points; },
            health(level) {
                let health = D(10);

                health = health.times(tmp.sta.stats.health.effect);

                return health;
            },
            experience: D.dZero,
            kills: D.dOne,
            name: 'You',
            damage() {
                let damage = D.add(tmp.xp.enemies[player.xp.type].level, 1);

                damage = damage.div(tmp.sta.stats.defense.effect);

                return damage;
            },
            dps() {
                let dps = D.dZero;

                if (tmp.xp.enemies['*'].dps_mult_active.gt(0)) dps = dps.add(tmp.xp.enemies[player.xp.type].level).add(1);

                if (tmp.xp.enemies['*'].dps_mult_inactive.gt(0)) ['slime', 'goblin', 'zombie', 'ent'].forEach(type => dps = dps.add(tmp.xp.enemies[type].level).add(1));

                dps = dps.div(tmp.sta.stats.defense.effect);

                return dps;
            },
            regen() {
                let regen = D.dZero;

                regen = regen.add(tmp.sta.stats.regeneration.effect);

                return regen;
            },
            unlocked: false,
        },
        // Final enemy
        star: {
            _type: null,
            get type() { return this._type ??= Object.keys(layers.xp.enemies).find(item => layers.xp.enemies[item] == this); },
            level() {
                let kills = player.lo.items.stardust.amount;

                kills = kills.minus(buyableEffect('fr', 41));

                return kills;
            },
            color_level() { return layers.xp.enemies['*'].color_level(tmp.xp.enemies[this.type].level); },
            color() {
                const cycle = 300,
                    hue = (player.xp.resetTime % cycle) / cycle,
                    saturation = 1,
                    lightness = .85;

                return '#' + hsl_to_rgb(hue, saturation, lightness).map(num => num.toString(16).padStart(2, '0')).join('');
            },
            health(level) {
                level ??= tmp.xp.enemies[this.type].level;

                let health = D.pow(2, level).times(10);

                health = health.times(tmp.c.buildings.observatory.effect).max(1);

                return health.ceil();
            },
            experience: D.dZero,
            kills: D.dOne,
            name() { return player.xp.enemies[this.type].name ??= random_string_alpha(Math.floor(Math.random() * 12) + 4).toLowerCase(); },
            damage: D.dOne,
            dps: D.dZero,
            regen: D.dZero,
            unlocked() { return hasChallenge('b', 22) && !inChallenge('b', 31) && !inChallenge('b', 41); },
        },
    },
    total: {
        kills() {
            return Object.values(player.xp.enemies).reduce((sum, data) => D.add(sum, data.kills), D.dZero);
        },
    },
    doReset(layer, force = false) {
        if (!force && layers[layer].row <= this.row) return;

        /** @type {(keyof player['xp'])[]} */
        const keep = ['type'],
            max_ups = D.add(buyableEffect('lo', 12).xp_hold, buyableEffect('fr', 32).xp_hold.pow(tmp.a.change_efficiency)).floor(),
            kept_ups = [...player.xp.upgrades],
            auto = { ...player.xp.auto };

        kept_ups.length = D.min(kept_ups.length, max_ups).toNumber();

        layerDataReset(this.layer, keep);
        player.xp.upgrades.push(...kept_ups);
        Object.keys(player.xp.enemies).forEach(type => player.xp.enemies[type] = {
            health: tmp.xp.enemies[type].health,
            last_drops: [],
            last_drops_times: D.dZero,
            kills: D.dZero,
            element: layers.mag.elements['*'].element(type),
        });
        player.xp.auto = auto;
    },
    autoUpgrade() { return hasChallenge('b', 12) && player.xp.auto.upgrade && !tmp.xp.deactivated; },
});
