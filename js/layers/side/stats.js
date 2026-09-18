'use strict';

addLayer('sta', {
    name: 'Stats',
    symbol: '📈',
    startData() {
        return {
            points: D.dZero,
            unlocked: true,
            stats: Object.fromEntries(Object.keys(layers.sta.stats).map(stat => [stat, { points: D.dZero, }])),
        };
    },
    layerShown() { return inChallenge('b', 62) || hasChallenge('b', 62); },
    color: '#00AA99',
    row: 'side',
    position: 4,
    resource: 'stat points',
    type: 'none',
    tabFormat: {
        'Stats': {
            content: [
                ['display-text', () => {
                    let gain_text = '';
                    if (shiftDown) {
                        gain_text = `[${tmp.sta.stats['*'].gain_formula}]`;
                    } else {
                        gain_text = formatSmall(tmp.sta.stats['*'].gain);
                    }

                    return `You have ${layerColor('sta', format(player.sta.points), 'font-size:1.5em;')} (+${layerColor('sta', gain_text)} /kill) stat points`;
                },],
                ['display-text', () => {
                    return `You have ${layerColor('sta', formatWhole(tmp.sta.stats['*'].left))} unused stat points`;
                },],
                'blank',
                [
                    'column',
                    () => Object.keys(layers.sta.stats)
                        .filter(skill => skill != '*')
                        .map(stat => layers.sta.stats['*'].show_row(stat))
                        .flat(),
                ],
            ],
        }
    },
    stats: {
        '*': {
            total() { return player.sta.points; },
            left() { return tmp.sta.stats['*'].total.minus(Object.values(player.sta.stats).reduce((sum, stat) => D.add(sum, stat.points), D.dZero)).floor(); },
            gain() { return D.div(1, D.pow(1.25, player.sta.points.floor())); },
            gain_formula: '1 / (1.25 ^ floor(stat points))',
            regex: /^([a-z]+)_(increase|decrease)$/,
            show_row(stat) {
                if (!(stat in tmp.sta.stats) || stat == '*') return;

                return [['row', [
                    ['display-text', tmp.sta.stats[stat].text],
                    'blank',
                    ['clickable', `${stat}_increase`],
                    'blank',
                    ['clickable', `${stat}_decrease`],
                ]], 'blank'];
            },
        },
        health: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.sta.stats).find(item => layers.sta.stats[item] == this); },
            name: 'health',
            effect() {
                return D.add(player.sta.stats[this.id].points, 2).log2();
            },
            text() {
                const effect = tmp.sta.stats[this.id].effect;

                let formula = 'log2(points + 2)';

                if (inChallenge('b', 62)) {
                    return `${formatWhole(player.sta.stats[this.id].points)} points in health<br>\
                        Multiply health by ${shiftDown ? `[${formula}]` : format(effect)}`;
                } else {
                    return `${formatWhole(player.sta.stats[this.id].points)} points in health<br>\
                        Divide enemy health by ${shiftDown ? `[${formula}]` : format(effect)}`;
                }
            },
        },
        attack: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.sta.stats).find(item => layers.sta.stats[item] == this); },
            name: 'attack',
            effect() {
                return D.add(player.sta.stats[this.id].points, 1).root(2);
            },
            text() {
                const effect = tmp.sta.stats[this.id].effect;

                let formula = '2√(points + 1)';

                return `${formatWhole(player.sta.stats[this.id].points)} points in damage<br>\
                    Multiply damage by ${shiftDown ? `[${formula}]` : format(effect)}`;
            },
        },
        defense: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.sta.stats).find(item => layers.sta.stats[item] == this); },
            name: 'defense',
            effect() {
                return D.add(player.sta.stats[this.id].points, 4).log(4);
            },
            text() {
                const effect = tmp.sta.stats[this.id].effect;

                let formula = 'log4(points + 4)';

                if (inChallenge('b', 62)) {
                    return `${formatWhole(player.sta.stats[this.id].points)} points in defense<br>\
                        Divide enemy damage by ${shiftDown ? `[${formula}]` : format(effect)}`;
                } else {
                    return `${formatWhole(player.sta.stats[this.id].points)} points in defense<br>\
                        Multiply tree size by ${shiftDown ? `[${formula}]` : format(effect)}`;
                }
            },
        },
        regeneration: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.sta.stats).find(item => layers.sta.stats[item] == this); },
            name: 'regeneration',
            effect() {
                return D.div(player.sta.stats[this.id].points, 50);
            },
            text() {
                const effect = tmp.sta.stats[this.id].effect;

                let formula = 'points / 50';

                if (inChallenge('b', 62)) {
                    return `${formatWhole(player.sta.stats[this.id].points)} points in regeneration<br>\
                        Increase regeneration by ${shiftDown ? `[${formula}]` : format(effect)}`;
                } else {
                    return `${formatWhole(player.sta.stats[this.id].points)} points in regeneration<br>\
                        Increase ore regeneration by ${shiftDown ? `[${formula}]` : format(effect)}`;
                }
            },
        },
    },
    prestigeNotify() { return tmp.sta.stats['*'].left.gte(1); },
    // Oh boy! More Proxies
    clickables: new Proxy({}, {
        /** @returns {Clickable<'sta'>} */
        get(obj, prop) {
            // Required to not break the auto stuff
            if (prop == 'constructor') return obj.constructor;
            if (prop == 'layer') return 'sta';

            if (prop in obj) return obj[prop];

            const matches = layers.sta.stats['*'].regex.exec(prop);
            if (matches) {
                /** @type {[string, string, 'increase'|'decrease']} */
                const [, stat, mode] = matches,
                    pstat = () => player.sta.stats[stat];
                return obj[prop] ??= {
                    canClick() { return D.gte(mode == 'increase' ? tmp.sta.stats['*'].left : pstat().points, 1); },
                    onClick() {
                        switch (mode) {
                            case 'increase':
                                if (tmp.sta.stats['*'].left.lt(1)) return;
                                pstat().points = pstat().points.add(1);
                                break;
                            case 'decrease':
                                if (pstat().points.lt(1)) return;
                                pstat().points = pstat().points.minus(1);
                                break;
                        }
                    },
                    display() { return `${mode == 'increase' ? '+' : '-'}${formatWhole(1)} stat point`; },
                    style: {
                        'height': '80px',
                        'width': '80px',
                        'min-height': 'unset',
                    },
                };
            }
        },
        getOwnPropertyDescriptor(_, prop) {
            if (prop == 'layer' || layers.sta.stats['*'].regex.exec(prop)) return {
                enumerable: true,
                configurable: true,
            };
        },
        has(_, prop) { return prop != '*' && !!layers.sta.stats['*'].regex.exec(prop); },
        ownKeys(_) {
            return Object.keys(layers.sta.stats)
                .filter(stat => stat != '*')
                .map(stat => [`${stat}_increase`, `${stat}_decrease`])
                .flat();
        },
    }),
});
