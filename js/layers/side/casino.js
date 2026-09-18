'use strict';

addLayer('cas', {
    name: 'Casino',
    symbol: '🎲',
    startData() {
        return {
            unlocked: true,
            points: D.dZero,
            swaps: {
                challenge: {},
                chances: {},
                weights: {},
            },
            count: D.dZero,
            respecs: D.dZero,
            swapping: {
                challenge: false,
                chances: false,
                weights: false,
            },
        };
    },
    layerShown() { return (inChallenge('b', 52) || hasChallenge('b', 52)) && !hasUpgrade('a', 34); },
    deactivated() { return hasUpgrade('a', 34); },
    color: '#BBAA66',
    row: 'side',
    position: 2,
    resource: 'tokens',
    type: 'none',
    tabFormat: {
        'Swap': {
            content: [
                ['display-text', () => `You have ${layerColor('cas', format(player.cas.points), 'font-size:1.5em;')} tokens`],
                ['display-text', () => `Your next swap will cost ${shiftDown ? `[${tmp.cas.items.swap_cost_formula}]` : format(tmp.cas.items.swap_cost)} tokens`],
                ['display-text', () => `You have swapped ${format(player.cas.count)} times`],
                ['display-text', () => `You have ${format(tmp.cas.token.chance.times(100))}% to get a token every item drop roll`],
                ['display-text', () => `<span class="warning">You need to swap ${format(player.cas.respecs)} times to respec</span>`],
                'blank',
                ['display-text', 'Click an item on the left column to select it.'],
                ['display-text', 'Click an item on the right column to swap with the selected item.'],
                ['display-text', '<sub>Because of the way the game is made, some items cannot be swapped with others.</sub>'],
                'blank',
                ['clickable', 'respec_swaps'],
                //todo convert to layer-table
                [
                    'column',
                    () => Object.keys(layers.lo.items)
                        .filter(item => item != '*')
                        .map(item => layers.cas.items.show_row(item))
                ],
            ],
        },
    },
    items: {
        sources(item_id) {
            if (!item_id) return {};
            if (tmp.cas.deactivated) return tmp.lo.items[item_id].sources;

            const swaps = player.cas.swaps;
            if (inChallenge('b', 52)) {
                const item = tmp.lo.items[item_id],
                    sources = Object.assign({}, item.sources);

                if (item_id in swaps.challenge) {
                    const base = tmp.lo.items[layers.cas.items.base(item_id)];

                    sources.chances = base.sources.chances ?? {};
                    sources.weights = base.sources.weights ?? {};
                }

                return sources;
            } else if (!hasChallenge('b', 52)) {
                // In case the player tries accessing without the challenge
                return tmp.lo.items[item_id].sources;
            } else {
                const item = tmp.lo.items[item_id],
                    sources = Object.assign({}, item.sources);

                if (item_id in swaps.chances) sources.chances = tmp.lo.items[layers.cas.items.base(item_id, 'chances')].sources.chances ?? {};
                if (item_id in swaps.weights) sources.weights = tmp.lo.items[layers.cas.items.base(item_id, 'weights')].sources.weights ?? {};

                return sources;
            }
        },
        base(item, type) {
            if (!item || tmp.cas.deactivated) return '';
            if (!type) {
                if (inChallenge('b', 52)) type = 'challenge';
                else return '';
            }

            if (!(type in player.cas.swaps)) return '';

            return (Object.entries(player.cas.swaps[type]).find(([, it]) => it == item) ?? [''])[0];
        },
        items(source) {
            if (!source) return {};
            if (tmp.cas.deactivated) return layers.lo.items['*'].items(source);

            const swaps = player.cas.swaps;
            if (inChallenge('b', 52)) {
                const original = layers.lo.items['*'].items(source),
                    items = {
                        chances: {},
                        weights: {},
                    };

                if ('chances' in original) {
                    Object.entries(original.chances).forEach(([item, amount]) => {
                        if (item in swaps.challenge) items.chances[swaps.challenge[item]] = amount;
                        else items.chances[item] = amount;
                    });
                }
                if ('weights' in original) {
                    Object.entries(original.weights).forEach(([item, amount]) => {
                        if (item in swaps.challenge) items.weights[swaps.challenge[item]] = amount;
                        else items.weights[item] = amount;
                    });
                }

                return items;
            } else if (!hasChallenge('b', 52)) {
                // In case the player tries accessing without the challenge
                return layers.lo.items['*'].items(source);
            } else {
                const original = layers.lo.items['*'].items(source),
                    items = {
                        chances: {},
                        weights: {},
                    };

                if ('chances' in original) {
                    Object.entries(original.chances).forEach(([item, amount]) => {
                        if (item in swaps.chances) items.chances[swaps.chances[item]] = amount;
                        else items.chances[item] = amount;
                    });
                }
                if ('weights' in original) {
                    Object.entries(original.weights).forEach(([item, amount]) => {
                        if (item in swaps.weights) items.weights[swaps.weights[item]] = amount;
                        else items.weights[item] = amount;
                    });
                }

                return items;
            }
        },
        shuffle() {
            const items = Object.keys(layers.lo.items).filter(item => item != '*' && item != 'stardust' && (tmp.lo.items[item].unlocked ?? true));
            let targets = [...items];
            if (options.noRNG) {
                targets.unshift(...targets.splice(Math.floor(targets.length / 2)));
            } else {
                for (let i = targets.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [targets[i], targets[j]] = [targets[j], targets[i]];
                }
            }

            return Object.fromEntries(
                Array.from({ length: items.length }, (_, i) => [items[i], targets[i]])
            );
        },
        swap_cost() {
            let base = D.dTwo;

            if (inChallenge('b', 52)) base = D(1.5);

            return D.pow(base, player.cas.count);
        },
        swap_cost_formula() {
            if (inChallenge('b', 52)) return '1.5 ^ swaps';
            return '2 ^ swaps';
        },
        swap(from, dest, type) {
            if (!from || !dest || from == dest) return;
            if (!type) {
                if (inChallenge('b', 52)) type = 'challenge';
                else return '';
            }

            const swaps = player.cas.swaps[type];
            [swaps[from], swaps[dest]] = [swaps[dest] ?? dest, swaps[from] ?? from];

            this.clean_swaps();
        },
        clean_swaps() {
            Object.values(player.cas.swaps)
                .forEach(swaps => {
                    if (swaps instanceof Decimal) return;

                    Object.values(swaps).forEach(item => {
                        if (swaps[item] == item) delete swaps[item];
                    });
                });
        },
        show_row(item_id) {
            if (!item_id || item_id == '*') return;

            const item = tmp.lo.items[item_id];
            if (!(item.unlocked ?? true) && !(inChallenge('b', 52) && item_id in player.cas.swaps.challenge)) return;

            if (inChallenge('b', 52)) {
                if (!(item_id in player.cas.swaps.challenge)) return;
            } else {
                if (!('weights' in item.sources || 'chances' in item.sources)) return;
            }

            return ['row', [
                ['clickable', `swap_weights_left_${item_id}`],
                ['clickable', `swap_chances_left_${item_id}`],
                'blank',
                ['display-text', ' is currently replaced by '],
                'blank',
                ['clickable', `swap_weights_right_${item_id}`],
                ['clickable', `swap_chances_right_${item_id}`],
            ]];
        },
    },
    token: {
        chance() {
            return D(.05);
        },
    },
    regex: /^swap_(chances|weights)_(left|right)_([a-z_]+)$/,
    // The M in TMT stands for More proxies
    clickables: new Proxy({}, {
        /** @returns {Clickable<'cas'>} */
        get(obj, prop) {
            // Required to not break the auto stuff
            if (prop == 'constructor') return obj.constructor;
            if (prop == 'layer') return 'cas';

            if (prop in obj) return obj[prop];

            const swap_matches = layers.cas.regex.exec(prop);
            if (swap_matches) {
                /** @type {[string, 'chances'|'weights', 'left'|'right', string]} */
                const [, r_mode, side, item_id] = swap_matches,
                    item = () => tmp.lo?.items[item_id],
                    mode = () => inChallenge('b', 52) ? 'challenge' : r_mode,
                    target = () => tmp.lo?.items[player.cas.swaps[mode()][item_id] ?? item_id];

                return obj[prop] ??= {
                    canClick() {
                        if (side == 'left') return true;
                        if (player.cas.points.lt(tmp.cas.items.swap_cost)) return false;
                        if (inChallenge('b', 52) && player.cas.swapping.challenge) return true;
                        if (player.cas.swapping[mode()]) return true;
                        return false;
                    },
                    onClick() {
                        if (side == 'left') {
                            if (player.cas.swapping[mode()]) {
                                player.cas.swapping[mode()] = false;
                            } else {
                                player.cas.swapping[mode()] = item_id;
                            }
                        } else {
                            player.cas.points = player.cas.points.minus(tmp.cas.items.swap_cost);
                            player.cas.count = player.cas.count.add(1);
                            layers.cas.items.swap(item_id, player.cas.swapping[mode()], mode());
                            player.cas.swapping[mode()] = false;
                        }
                    },
                    display() {
                        if (inChallenge('b', 52) && r_mode == 'weights') return '';
                        if (!inChallenge('b', 52) && !(r_mode in item().sources)) return '';

                        let mode_text = {
                            challenge: 'challenge',
                            chances: 'chances',
                            weights: 'weights',
                        }[mode()];

                        return `<h3>${capitalize((side == 'left' ? item() : target()).name)}</h3><br><br>${capitalize(mode_text)}`;
                    },
                    unlocked() {
                        //if (mode() == 'challenge' && item_id in player.cas.swaps.challenge) return true;
                        if (!(item().unlocked ?? true) && !(item_id in player.cas.swaps[mode()])) return false;

                        if (inChallenge('b', 52)) return r_mode == 'chances';

                        //return r_mode in item().sources;
                        return true;
                    },
                    style() {
                        if (inChallenge('b', 52) && r_mode == 'weights') return { 'display': 'none', };
                        if (!inChallenge('b', 52) && !(r_mode in item().sources)) {
                            return {
                                'height': '80px',
                                'width': '80px',
                                'min-height': 'unset',
                                'background-color': 'transparent',
                                'box-shadow': 'none',
                                'border-width': '0',
                                'cursor': 'initial',
                            };
                        }

                        const style = Object.assign({
                            'height': '80px',
                            'width': '80px',
                            'min-height': 'unset',
                            'background-repeat': 'no-repeat',
                            'background-position': 'center',
                            'background-size': 'contain',
                        }, ((side == 'left' ? item() : target()) ?? {}).style);

                        if (item_id == player.cas.swapping[mode()] && side == 'left') style.boxShadow = '#BBAA66 0 0 20px';

                        return style;
                    },
                };
            }

            if (prop == 'respec_swaps') {
                return {
                    canClick() { return player.cas.count.gt(player.cas.respecs); },
                    onClick() {
                        if (!confirm('Are you sure you want to respec your casino layer?')) return;

                        player.cas.count = D.dZero;
                        player.cas.swaps.chances = {};
                        player.cas.swaps.weights = {};
                        player.cas.swapping.chances = false;
                        player.cas.swapping.weights = false;
                        player.cas.points = D.dZero;
                        player.cas.respecs = D.add(player.cas.respecs, 1);
                    },
                    display: 'Respec Swaps',
                    unlocked() { return hasChallenge('b', 52) && !inChallenge('b', 52); },
                };
            }
        },
        getOwnPropertyDescriptor(_, prop) {
            if (prop == 'layer' || layers.cas.regex.exec(prop) || prop == 'respec_swaps') return {
                enumerable: true,
                configurable: true,
            };
        },
        has(_, prop) { return layers.cas.regex.exec(prop) || prop == 'respec_swaps'; },
        ownKeys(_) {
            return [
                ...Object.keys(layers.lo.items)
                    .filter(item => item != '*')
                    .map(item => [`swap_chances_left_${item}`, `swap_chances_right_${item}`, `swap_weights_left_${item}`, `swap_weights_right_${item}`])
                    .flat(),
                'respec_swaps',
            ];
        },
    }),
    prestigeNotify() { return player.cas.points.gte(tmp.cas.items.swap_cost); },
});
