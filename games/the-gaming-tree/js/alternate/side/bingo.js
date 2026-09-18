'use strict';

addLayer('bin', {
    name: 'Bingo',
    image: './resources/images/conway-life-glider.svg',
    nodeStyle: {
        'background-repeat': 'no-repeat',
        'background-position': 'center',
        'background-size': 'contain',
    },
    startData() {
        return {
            unlocked: false,
            points: D(5),
            cards: {},
            rolled: [],
            respecs: D.dZero,
            show: '',
            bingo_notify: true,
            time: D.dZero,
            warn: {
                respec: true,
                create: true,
            },
        };
    },
    layerShown() { return player.bin.unlocked; },
    color: '#445599',
    row: 'side',
    position: 2.5,
    resource: 'bingo bucks',
    type: 'none',
    tabFormat: {
        'Bingo': {
            content: [
                ['display-text', () => `You have ${layerColor('bin', format(player.bin.points), 'font-size:1.5em;')} ${tmp.bin.resource}`],
                ['display-text', `You gain 1 bingo bucks when you roll a number on a bingo card`],
                ['row', () => {
                    if (options.noRNG) return [
                        ['display-text', 'Swap best win streak with '],
                        'blank',
                        ['drop-down-double', ['swap', () => [
                            ['', 'none'],
                            ...tmp.bin.cards.list.map(layer => [layer, tmp[layer].name]),
                        ]]]
                    ];
                }],
                ['display-text', () => {
                    if (inChallenge('b', 82)) return;
                    return `<span class="warning">You have respecced ${formatWhole(player.bin.respecs)} times</span>`;
                }],
                'blank',
                ['display-text', () => `Last ball rolled: ${player.bin.rolled.length ? formatWhole(player.bin.rolled.at(-1)) : 'none'}`],
                ['bar', 'roll'],
                ['clickables', [1]],
                ['row', [
                    ['display-text', 'Warnings: '],
                    'blank',
                    ['clickable', 'warn_respec'],
                    'blank',
                    ['clickable', 'warn_create'],
                ]],
                'blank',
                ['drop-down-double', ['show', () => [
                    ['', 'none'],
                    ...tmp.bin.cards.list.map(layer => [layer, tmp[layer].name]),
                ]]],
                ['layer-table', () => {
                    if (player.bin.show == '') return tmp.bin.balls.grid;
                    return tmp.bin.cards.show_card;
                }],
                [
                    'display-text',
                    () => {
                        if (player.bin.show == '') return `Rolled ${formatWhole(player.bin.rolled.length)} balls`;

                        let text = `Current layer multiplier: ${format(tmp.bin.cards.multiplier)} `
                        if (!inChallenge('b', 82)) text += `(${formatWhole(player.bin.cards[player.bin.show].wins)} victories)`;
                        return text;
                    }
                ],
            ],
            unlocked() { return inChallenge('b', 82) || hasChallenge('b', 82); },
        },
        'Seal': {
            content: [
                ['layer-proxy', ['b', [['challenge', 82]]]],
            ],
            unlocked() { return !hasChallenge('b', 82) || inChallenge('b', 82); },
        },
    },
    cards: {
        list() { return Object.keys(player.bin.cards); },
        possibles() {
            /** @type {(keyof Layers)[]} */
            const layers = [
                'xp_alt', 'c', 'p',
                'to', 'k', 'fr',
                //'bl', //'v', //'sp', //'yy', //todo
            ];

            return layers.filter(layer => player[layer].unlocked && tmp[layer].layerShown);
        },
        availables() { return tmp.bin.cards.possibles.filter(layer => !(layer in player.bin.cards)); },
        cost() {
            const base = D.div(player.bin.respecs, 100).add(3);

            return base.pow(tmp.bin.cards.list.length).times(5);
        },
        cost_formula: '5 * (3 + respecs / 100) ^ bingo cards',
        has_bingo(spots) {
            if (!spots || player.bin.rolled.length < 5) return;

            /** @param {number[]} spots */
            const check_rows = spots => {
                return Array.from({ length: 5 }).some(
                    (_, i) => spots.slice(i * 5, (i + 1) * 5)
                        .every(num => player.bin.rolled.includes(num))
                );
            },
                /** @param {number[]} spots */
                check_cols = spots => {
                    return Array.from({ length: 5 }).some(
                        (_, i) => spots.filter((_, j) => j % 5 == i)
                            .every(num => player.bin.rolled.includes(num))
                    );
                },
                /** @param {number[]} spots */
                check_diags = spots => {
                    return player.bin.rolled.includes(spots[12]) && (
                        [0, 6, 18, 24].every(i => player.bin.rolled.includes(spots[i])) ||
                        [4, 8, 16, 20].every(i => player.bin.rolled.includes(spots[i]))
                    );
                };

            return check_rows(spots) || check_cols(spots) || check_diags(spots);
        },
        bingo() {
            if (player.bin.rolled.length < 5) return false;

            const bingos = Object.entries(player.bin.cards)
                .filter(([, { spots }]) => this.has_bingo(spots));

            if (!bingos.length) return false;

            return bingos.map(([layer]) => layer);
        },
        show_card(card = player.bin.show) {
            if (!card) return [];

            const bingo = player.bin.cards[card]?.spots;
            if (!bingo) return [];

            return [
                card,
                [],
                ...Array.from(
                    { length: 5 },
                    (_, i) => bingo.slice(i * 5, (i + 1) * 5).map(i => {
                        const style = ['font-size: 1.25em'];

                        if (player.bin.rolled.includes(i)) style.push('color: #77BB77');

                        return [['display-text', `<span style="${style.join(';')}">${formatWhole(i)}</span>`]];
                    })
                ),
            ];
        },
        multiplier(layer = player.bin.show) {
            if (!layer || !(layer in player.bin.cards)) return D.dOne;

            let card = player.bin.cards[layer];

            if (inChallenge('b', 82)) {
                if (this.has_bingo(card.spots)) return D.dOne;

                const rows = Math.min(
                    ...Array.from({ length: 5 })
                        .map((_, i) => card.spots.slice(i * 5, (i + 1) * 5)
                            .filter(num => player.bin.rolled.includes(num)).length)
                ) * 2,
                    cols = Math.min(
                        ...Array.from({ length: 5 })
                            .map((_, i) => card.spots.filter((num, j) => j % 5 == i && player.bin.rolled.includes(num)).length)
                    ) * 2,
                    spots = card.spots.filter(n => player.bin.rolled.includes(n)).length;

                return D.add(rows, cols).add(spots).div(50);
            } else {
                if (options.noRNG && player.bin.swap) {
                    const best = Object.entries(player.bin.cards).reduce(([, best], [, current]) => D.gt(best.wins, current.wins), [, { wins: D.dZero }]);
                    if (layer == player.bin.swap) {
                        // Find highest win streak and use it
                        card = best;
                    } else if (card == best) {
                        // If this is the highest, use swap target
                        card = player.bin.cards[player.bin.swap];
                    }
                }

                return D.div(card.wins, 2).add(1);
            }
        },
        multipliers() { return Object.fromEntries(tmp.bin.cards.possibles.map(layer => [layer, this.multiplier(layer)])); },
    },
    balls: {
        time: D.dTen,
        min: 1,
        max: 100,
        grid() {
            const side = Math.ceil((tmp.bin.balls.max - tmp.bin.balls.min) ** .5),
                /** @type {(x: number, y: number) => string} */
                num = (x, y) => {
                    const n = x * side + y + tmp.bin.balls.min;
                    if (n > tmp.bin.balls.max) return '';
                    const style = ['font-size: 1.25em'];

                    if (player.bin.rolled.includes(n)) style.push('color: #77BB77');

                    return `<span style="${style.join(';')}">${formatWhole(n)}</span>`;
                };

            return [
                [],
                ...Array.from(
                    { length: side },
                    (_, i) => Array.from({ length: side }, (_, j) => [['display-text', num(i, j)]])
                )
            ];
        },
    },
    clickables: {
        11: {
            title: 'Respec Bingo Cards',
            canClick() { return tmp.bin.cards.list.length > 0; },
            onClick() {
                if (player.bin.warn.respec && !confirm('This will reset your entire Bingo layer\nProceed?')) return;
                player.bin.cards = {};
                player.bin.respecs = D.add(player.bin.respecs, 1);
                player.bin.points = layers.bin.cards.cost();
                player.bin.rolled.length = 0;
                player.bin.time = D.dZero;
            },
            unlocked() { return !inChallenge('b', 82); },
        },
        12: {
            title: 'New Bingo Card',
            canClick() { return tmp.bin.cards.availables.length > 0 && D.gte(player.bin.points, tmp.bin.cards.cost); },
            onClick() {
                if (player.bin.warn.create && !confirm('This will reset your bingo cards and rolled balls\nProceed?')) return;
                const availables = tmp.bin.cards.availables,
                    cost = tmp.bin.cards.cost;

                if (D.lt(player.bin.points, cost) || availables.length <= 0) return;

                tmp.bin.cards.list.forEach(layer => player.bin.cards[layer].spots = create_card());

                const layer = availables[Math.floor(Math.random() * availables.length)];

                player.bin.cards[layer] = {
                    spots: create_card(),
                    wins: D.dZero,
                };
                player.bin.rolled.length = 0;
                player.bin.time = D.dZero;
                player.bin.points = D.dZero;
            },
            unlocked() { return !inChallenge('b', 82); },
            display() {
                const cost = shiftDown ? `[${tmp.bin.cards.cost_formula}]` : format(tmp.bin.cards.cost);
                return `Cost: ${cost} ${tmp.bin.resource}`;
            },
        },
        'warn_respec': {
            unlocked() { return !inChallenge('b', 82); },
            canClick() { return !inChallenge('b', 82); },
            onClick() { player.bin.warn.respec = !player.bin.warn.respec; },
            display() { return player.bin.warn.respec ? 'ON' : 'OFF'; },
            style: {
                'height': '40px',
                'width': '40px',
                'min-height': 'unset',
                'font-size': '.8em',
            },
        },
        'warn_create': {
            unlocked() { return !inChallenge('b', 82); },
            canClick() { return !inChallenge('b', 82); },
            onClick() { player.bin.warn.create = !player.bin.warn.create; },
            display() { return player.bin.warn.create ? 'ON' : 'OFF'; },
            style: {
                'height': '40px',
                'width': '40px',
                'min-height': 'unset',
                'font-size': '.8em',
            },
        },
    },
    bars: {
        roll: {
            direction: RIGHT,
            width: 200,
            height: 50,
            progress() {
                const max = tmp.bin.balls.time;
                return D.div(player.bin.time ?? max, max);
            },
            display() {
                let text = `${formatTime(player.bin.time)} / ${formatTime(tmp.bin.balls.time)}`;

                return text;
            },
            textStyle: { 'color': 'gray', },
        },
    },
    update(diff) {
        if (!tmp.bin.layerShown) return;

        if (inChallenge('b', 82) || hasChallenge('b', 82)) {
            player.bin.time = D.add(player.bin.time, diff);
        }

        if (player.bin.time.gte(tmp.bin.balls.time)) {
            // Roll a new ball
            player.bin.time = D.minus(player.bin.time, tmp.bin.balls.time);
            const ball = roll_new_ball();

            if (typeof ball === 'undefined') return;
            player.bin.rolled.push(ball);

            const includes = Object.values(player.bin.cards)
                .filter(({ spots }) => spots.includes(ball))
                .length;
            player.bin.points = D.add(player.bin.points, includes);

            // Check for bingos
            const bingo = tmp.bin.cards.bingo;
            if (bingo) {
                Object.entries(player.bin.cards).forEach(([layer, data]) => {
                    if (bingo.includes(layer)) data.wins = D.add(data.wins, 1);
                    else data.wins = D.dZero;

                    data.spots = create_card();
                });
                player.bin.rolled = [];

                doPopup('achievement', `${listFormat.format(bingo.map(layer => tmp[layer].name))}`, 'Bingo!', 3, tmp.bin.color);
            }
        }
    },
    shouldNotify() { return inChallenge('b', 82) && canCompleteChallenge('b', 82); },
    prestigeNotify() { return hasChallenge('b', 82) && tmp.bin.cards.availables.length > 0 && D.gte(player.bin.points, tmp.bin.cards.cost); },
});
