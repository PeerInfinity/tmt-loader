'use strict';

addLayer('mag', {
    name: 'Magic',
    symbol: '✨',
    startData() {
        return {
            points: D.dZero,
            unlocked: true,
            element: 'none',
        };
    },
    layerShown() { return (inChallenge('b', 61) || hasChallenge('b', 61)) && !hasUpgrade('a', 44); },
    deactivated() { return hasUpgrade('a', 44); },
    nodeStyle() {
        const style = {};

        if (player.mag.element != 'none') style['border-color'] = tmp.mag.elements[player.mag.element].color;

        return style;
    },
    color: '#9966CC',
    row: 'side',
    position: 3,
    resource: 'mana',
    type: 'none',
    tabFormat: {
        'Elements': {
            content: [
                ['display-text', () => {
                    let gain_text = '';
                    if (shiftDown) {
                        gain_text = ` (+${layerColor('mag', `[${tmp.mag.mana.formula}]`)} /s)`;
                    } else if (tmp.mag.mana.gain.gt(.001)) {
                        gain_text = ` (+${layerColor('mag', format(tmp.mag.mana.gain))} /s)`;
                    }

                    return `You have ${layerColor('mag', format(player.mag.points), 'font-size:1.5em;')}${gain_text} mana`;
                }],
                ['display-text', () => `Changing element costs ${layerColor('mag', format(tmp.mag.mana.cost))} mana`],
                [
                    'display-text',
                    () => `Stronger elements deal *${format(tmp.mag.elements['*'].strong_multiplier)} damage,\
                        and weaker elements deal *${format(tmp.mag.elements['*'].weak_multiplier)} damage`
                ],
                'blank',
                //todo convert to layer-table
                ['display-text', () => {
                    /** @param {string} element */
                    const row = element => {
                        const { pros, cons } = effects(element),
                            elem = tmp.mag.elements[element],
                            strong = elem.strong.length ?
                                elem.strong
                                    .map(elem => `<span style="color:${tmp.mag.elements[elem].color};">${capitalize(tmp.mag.elements[elem].name)}</span>`)
                                    .join('<br/>') : 'None';

                        return `<tr>\
                            <td rowspan="2" style="color:${elem.color};">${capitalize(elem.name)}</td>\
                            <td style="color:#55AA55;">${pros.length ? pros.join('<br>') : 'No positives'}</td>\
                            <td rowspan="2">${strong}</td>
                            <td rowspan="2">\
                                <input type="radio" name="mag.element"\
                                    ${element == player.mag.element ? 'checked=""' : ''}\
                                    onclick="if (player.mag.points.gte(tmp.mag.mana.cost) && player.mag.element != '${element}') {
                                        player.mag.points = player.mag.points.minus(tmp.mag.mana.cost);
                                        player.mag.element = '${element}';
                                    }"
                                    ${player.mag.points.lt(tmp.mag.mana.cost) ? 'disabled=""' : ''}/>\
                            </td>\
                        </tr>\
                        <tr>\
                            <td class="warning">${cons.length ? cons.join('<br>') : 'No negatives'}</td>\
                        </tr>`;
                    },
                        /** @param {string} element */
                        effects = element => {
                            /** @type {string[]} */
                            const pros = [],
                                /** @type {string[]} */
                                cons = [],
                                {
                                    xp = {},
                                    mining = {},
                                    tree = {},
                                } = tmp.mag.elements[element].effects;

                            if ('damage_multiplier' in xp && D.neq(xp.damage_multiplier, 1)) {
                                const mult = xp.damage_multiplier,
                                    text = `Multiplies enemy damage by ${format(mult)}`;
                                if (D.gt(mult, 1)) pros.push(text);
                                else cons.push(text);
                            }
                            if ('drop_multiplier' in xp && D.neq(xp.drop_multiplier, 1)) {
                                const mult = xp.drop_multiplier,
                                    text = `Multiplies enemy drops by ${format(mult)}`;
                                if (D.gt(mult, 1)) pros.push(text);
                                else cons.push(text);
                            }
                            if ('regen_multiplier' in mining && D.neq(mining.regen_multiplier, 1)) {
                                const mult = mining.regen_multiplier,
                                    text = `Multiplies ore regeneration by ${format(mult)}`;
                                if (D.gt(mult, 1)) pros.push(text);
                                else cons.push(text);
                            }
                            if ('chance_multiplier' in mining && D.neq(mining.chance_multiplier, 1)) {
                                const mult = mining.chance_multiplier,
                                    text = `Multiplies mining chance by ${format(mult)}`;
                                if (D.gt(mult, 1)) pros.push(text);
                                else cons.push(text);
                            }
                            if ('size_multiplier' in tree && D.neq(tree.size_multiplier, 1)) {
                                const mult = tree.size_multiplier,
                                    text = `Multiplies tree size by ${format(mult)}`;
                                if (D.gt(mult, 1)) pros.push(text);
                                else cons.push(text);
                            }
                            if ('damage_multiplier' in tree && D.neq(tree.damage_multiplier, 1)) {
                                const mult = tree.damage_multiplier,
                                    text = `Multiplies tree damage by ${format(mult)}`;
                                if (D.gt(mult, 1)) pros.push(text);
                                else cons.push(text);
                            }

                            return { pros, cons, };
                        };

                    return `<table class="layer-table" style="--color:${tmp.mag.color};">\
                        <tr>\
                            <th>Element</th>\
                            <th>Effects</th>\
                            <th>Stronger Against</th>\
                            <th></th>\
                        </tr>\
                        ${Object.keys(layers.mag.elements).filter(element => element != '*').map(row).join('')}\
                    </table>`;
                }],
            ],
        },
    },
    elements: {
        '*': {
            weak_multiplier: D(1 / 3),
            strong_multiplier: D(3),
            element(enemy) {
                if (!inChallenge('b', 61) && !hasChallenge('b', 61)) return 'none';
                if (inChallenge('b', 61)) return this.random();

                switch (enemy) {
                    case 'player':
                    case 'star':
                    default: return 'none';
                    case 'slime': return 'water';
                    case 'goblin': return 'air';
                    case 'zombie': return 'fire';
                    case 'world_tree':
                    case 'ent': return 'earth';
                    case 'amalgam': return this.random();
                }
            },
            random() {
                const elements = Object.keys(tmp.mag.elements).filter(element => element != '*');

                return elements[Math.floor(Math.random() * elements.length)];
            },
        },
        none: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.mag.elements).find(element => layers.mag.elements[element] == this); },
            effects() {
                if (inChallenge('b', 61)) return {
                    xp: {
                        damage_multiplier: D.dZero,
                    },
                    mining: {
                        chance_multiplier: D.dZero,
                    },
                    tree: {
                        damage_multiplier: D.dZero,
                    },
                };

                return {};
            },
            name: 'none',
            color: '#FFFFFF',
            strong: [],
            _weak: null,
            get weak() { return this._weak ??= Object.keys(layers.mag.elements).filter(element => layers.mag.elements[element].strong?.includes(this.id)); },
        },
        fire: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.mag.elements).find(element => layers.mag.elements[element] == this); },
            effects() {
                if (tmp.mag.deactivated) return {};

                return {
                    xp: {
                        damage_multiplier: D.dTwo,
                        drop_multiplier: D(.5),
                    },
                    mining: {
                        regen_multiplier: D(.5),
                        chance_multiplier: D.dTwo,
                    },
                    tree: {
                        damage_multiplier: D.dTwo,
                        size_multiplier: D(.5),
                    },
                };
            },
            name: 'fire',
            color: '#FF8800',
            strong: ['air'],
            _weak: null,
            get weak() { return this._weak ??= Object.keys(layers.mag.elements).filter(element => layers.mag.elements[element].strong?.includes(this.id)); },
        },
        air: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.mag.elements).find(element => layers.mag.elements[element] == this); },
            effects() {
                if (tmp.mag.deactivated) return {};

                return {
                    xp: {
                        drop_multiplier: D.dTwo,
                    },
                    tree: {
                        damage_multiplier: D(.5),
                    },
                };
            },
            name: 'air',
            color: '#CCCC55',
            strong: ['earth'],
            _weak: null,
            get weak() { return this._weak ??= Object.keys(layers.mag.elements).filter(element => layers.mag.elements[element].strong?.includes(this.id)); },
        },
        earth: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.mag.elements).find(element => layers.mag.elements[element] == this); },
            effects() {
                if (tmp.mag.deactivated) return {};

                return {
                    xp: {
                        drop_multiplier: D(.5),
                    },
                    mining: {
                        regen_multiplier: D.dTwo,
                    },
                };
            },
            name: 'earth',
            color: '#775522',
            strong: ['water'],
            _weak: null,
            get weak() { return this._weak ??= Object.keys(layers.mag.elements).filter(element => layers.mag.elements[element].strong?.includes(this.id)); },
        },
        water: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.mag.elements).find(element => layers.mag.elements[element] == this); },
            effects() {
                if (tmp.mag.deactivated) return {};

                return {
                    mining: {
                        chance_multiplier: D(.5),
                    },
                    tree: {
                        size_multiplier: D.dTwo,
                    },
                };
            },
            name: 'water',
            color: '#4444BB',
            strong: ['fire'],
            _weak: null,
            get weak() { return this._weak ??= Object.keys(layers.mag.elements).filter(element => layers.mag.elements[element].strong?.includes(this.id)); },
        },
    },
    mana: {
        gain() {
            let gain = D(.5),
                div = player.mag.points.add(10).log10();

            return gain.div(div);
        },
        formula: '0.5 / log10(mana + 10)',
        cost() {
            if (inChallenge('b', 61)) return D(50);
            return D(100);
        },
    },
    update(diff) {
        if (!tmp.mag.layerShown) return;

        addPoints('mag', D.times(tmp.mag.mana.gain, diff));
    },
    prestigeNotify() { return player.mag.points.gte(tmp.mag.mana.cost); },
});
