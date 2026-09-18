'use strict';

addLayer('l', {
    name: 'Level',
    symbol: 'L',
    startData() {
        return {
            unlocked: false,
            points: D.dZero,
            change: D.dOne,
            skills: Object.fromEntries(
                Object.keys(layers.l.skills)
                    .filter(skill => skill != '*')
                    .map(skill => [skill, { points: D.dZero, level: D.dZero, progress: D.dZero, }])
            ),
        };
    },
    layerShown() { return (player.l.unlocked || hasUpgrade('xp', 33)) && !tmp[this.layer].deactivated; },
    deactivated() { return inChallenge('b', 31) || hasUpgrade('a', 21); },
    color: '#6699BB',
    row: 1,
    position: 0,
    resource: 'levels',
    hotkeys: [
        {
            key: 'l',
            description: 'L: Reset for levels',
            unlocked() { return tmp.l.layerShown; },
            onPress() { doReset('l'); },
        },
        {
            key: 'L',
            description: 'Shift + L: Display levels layer',
            unlocked() { return tmp.l.layerShown; },
            onPress() { showTab('l'); },
        },
    ],
    tabFormat: {
        'Skills': {
            content: [
                'main-display',
                'prestige-button',
                'blank',
                () => {
                    const speed = D.times(layers.clo.time_speed('l'), layers.tic.time_speed('l'));

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                ['display-text', () => `Skill points: ${layerColor('l', format(tmp.l.skills["*"].left))} / ${layerColor('l', format(tmp.l.skills["*"].max))}`],
                () => {
                    if (tmp.l.skills['*'].bonus.gt(0)) return ['display-text', `Every skill has an additionnal ${format(tmp.l.skills['*'].bonus)} points assigned`];
                },
                ['text-input', 'change'],
                'blank',
                [
                    'column',
                    () => Object.keys(layers.l.skills)
                        .filter(skill => skill != '*')
                        .map(skill => show_skill(skill))
                ],
            ],
        },
        'Milestones': {
            content: [
                'main-display',
                'prestige-button',
                'blank',
                'milestones',
            ],
        },
    },
    /*
    I know what you're thinking, looking at this.
    > Why not just make a bar and 2 clickables for each skill?
    Because it's annoying to copy paste the same things for every skill.
    Especially when you're still adding some.
    */
    regex: /^(add|remove)_([a-z_]+)$/,
    clickables: new Proxy({}, {
        /** @returns {Clickable<'l'>} */
        get(obj, prop) {
            // Required to not break the auto stuff
            if (prop == 'constructor') return obj.constructor;
            if (prop == 'layer') return 'l';

            if (prop in obj) return obj[prop];

            const matches = layers.l.regex.exec(prop);
            if (matches) {
                /** @type {[string, 'add'|'remove', string]} */
                const [, mode, skill] = matches,
                    pskill = () => player.l.skills[skill];
                return obj[prop] ??= {
                    canClick() { return player.l.change.lte(mode == 'add' ? tmp.l.skills["*"].left : pskill().points) && player.l.change.gt(0); },
                    onClick() {
                        switch (mode) {
                            case 'add':
                                if (tmp.l.skills['*'].left.lt(player.l.change) || player.l.change.lte(0)) break;
                                pskill().points = pskill().points.add(player.l.change);
                                break;
                            case 'remove':
                                if (pskill().points.lt(player.l.change) || player.l.change.lte(0)) break;
                                pskill().points = pskill().points.minus(player.l.change);
                                break;
                        }
                    },
                    display() { return `${mode == 'add' ? 'Add' : 'Remove'} ${format(player.l.change)} skills points ${mode == 'add' ? 'to' : 'from'} ${tmp.l.skills[skill].name}`; },
                    unlocked() { return tmp.l.skills[skill].unlocked; },
                };
            }
        },
        getOwnPropertyDescriptor(_, prop) {
            if (prop == 'layer' || layers.l.regex.exec(prop)) return {
                enumerable: true,
                configurable: true,
            };
        },
        has(_, prop) { return prop != '*' && !!layers.l.regex.exec(prop); },
        ownKeys(_) {
            return Object.keys(layers.l.skills)
                .filter(skill => skill != '*')
                .map(skill => [`add_${skill}`, `remove_${skill}`])
                .flat();
        },
    }),
    bars: new Proxy({}, {
        /** @returns {Bar<'l'>} */
        get(obj, prop) {
            // Required to not break the auto stuff
            if (prop == 'constructor') return obj.constructor;
            if (prop == 'layer') return 'l';

            if (prop in obj) return obj[prop];

            if (prop in layers.l.skills && prop != '*') {
                return obj[prop] ??= {
                    direction: RIGHT,
                    width: 300,
                    height: 70,
                    unlocked() { return tmp.l?.skills?.[prop]?.unlocked; },
                    progress() { return D.div(player.l.skills[prop].progress, tmp.l?.skills?.[prop]?.needed); },
                    display() { return tmp.l?.skills?.[prop]?.text; },
                    textStyle: { 'color': 'gray', },
                };
            }
        },
        getOwnPropertyDescriptor(_, prop) {
            if (prop == 'layer' || (prop in layers.l.skills && prop != '*')) return {
                enumerable: true,
                configurable: true,
            };
        },
        has(_, prop) { return prop != '*' && prop in layers.l.skills; },
        ownKeys(_) { return Object.keys(layers.l.skills).filter(skill => skill != '*'); },
    }),
    milestones: {
        1: {
            requirementDescription: 'Get a level',
            effectDescription: 'Unlock a skill to deal more damage',
            done() { return player.l.points.gte(1); },
        },
        2: {
            requirementDescription: 'Get 3 levels',
            effectDescription: 'Unlock a skill to get more experience',
            unlocked() { return hasMilestone('l', 1); },
            done() { return player.l.points.gte(3); },
        },
        3: {
            requirementDescription: 'Get 5 levels',
            effectDescription: 'Unlock a skill to boost some upgrades',
            unlocked() { return hasMilestone('l', 2); },
            done() { return player.l.points.gte(5); },
        },
        4: {
            requirementDescription: 'Get 7 levels',
            effectDescription: 'Unlock a skill to boost some more upgrades',
            unlocked() { return hasMilestone('l', 3); },
            done() { return player.l.points.gte(7); },
        },
    },
    skills: {
        '*': {
            max() {
                let max = player.l.points;

                max = max.add(buyableEffect('lo', 43));

                if (hasChallenge('b', 21)) max = max.add(1);

                return max;
            },
            left() { return tmp.l.skills["*"].max.minus(Object.values(player.l.skills).reduce((u, { points }) => u.add(points), D.dZero)); },
            speed() {
                let speed = D.dOne;

                if (hasUpgrade('m', 31)) speed = speed.times(upgradeEffect('m', 31));

                speed = speed.times(buyableEffect('lo', 33));

                return speed;
            },
            bonus() {
                let bonus = D.dZero;

                if (hasUpgrade('f', 31)) bonus = bonus.add(upgradeEffect('f', 31));

                return bonus;
            },
        },
        attacking: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.l.skills).find(id => layers.l.skills[id] == this); },
            needed() { return player.l.skills[this.id].level.add(1).pow(2).times(25); },
            effect() {
                let level = player.l.skills[this.id].level;
                if (tmp.l.deactivated) level = D.dZero;
                return D(1.15).pow(level);
            },
            unlocked() { return hasMilestone('l', 1); },
            text() {
                if (!shiftDown) {
                    return `Attacking level ${formatWhole(player.l.skills[this.id].level)}<br>\
                    ${format(player.l.skills[this.id].points)} points assigned to attacking<br>\
                    Damage *${format(tmp.l.skills[this.id].effect)}`;
                } else {
                    let effect_formula = '1.15 ^ level';

                    return `Attacking level ${formatWhole(player.l.skills[this.id].level)}<br>\
                    ${format(player.l.skills[this.id].points)} points assigned to attacking<br>\
                    Damage *[${effect_formula}]`;
                }
            },
            name: 'attacking',
        },
        learning: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.l.skills).find(id => layers.l.skills[id] == this); },
            needed() { return player.l.skills[this.id].level.add(1).pow(1.9).times(60); },
            effect() {
                let level = player.l.skills[this.id].level;
                if (tmp.l.deactivated) level = D.dZero;
                return D(1.1).pow(level);
            },
            unlocked() { return hasMilestone('l', 2); },
            text() {
                if (!shiftDown) {
                    return `Learning level ${formatWhole(player.l.skills[this.id].level)}<br>\
                    ${format(player.l.skills[this.id].points)} points assigned to learning<br>\
                    Experience gain *${format(tmp.l.skills[this.id].effect)}`;
                } else {
                    let effect_formula = '1.1 ^ level';

                    return `Learning level ${formatWhole(player.l.skills[this.id].level)}<br>\
                    ${format(player.l.skills[this.id].points)} points assigned to learning<br>\
                    Experience gain *[${effect_formula}]`;
                }
            },
            name: 'learning',
        },
        vampirism: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.l.skills).find(id => layers.l.skills[id] == this); },
            needed() { return player.l.skills[this.id].level.add(1).pow(1.8).times(270); },
            effect() {
                let level = player.l.skills[this.id].level;
                if (tmp.l.deactivated) level = D.dZero;
                return D(1 / 50).times(level).add(1);
            },
            unlocked() { return hasMilestone('l', 3); },
            text() {
                if (!shiftDown) {
                    return `Vampirism level ${formatWhole(player.l.skills[this.id].level)}<br>\
                    ${format(player.l.skills[this.id].points)} points assigned to vampirism<br>\
                    ${layerColor('xp', tmp.xp.upgrades[13].title)} and ${layerColor('xp', tmp.xp.upgrades[21].title)} effects *${format(tmp.l.skills[this.id].effect)}`;
                } else {
                    let effect_formula = 'level / 50 + 1';

                    return `Vampirism level ${formatWhole(player.l.skills[this.id].level)}<br>\
                    ${format(player.l.skills[this.id].points)} points assigned to vampirism<br>\
                    ${layerColor('xp', tmp.xp.upgrades[13].title)} and ${layerColor('xp', tmp.xp.upgrades[21].title)} effects *[${effect_formula}]`;
                }
            },
            name: 'vampirism',
        },
        reading: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.l.skills).find(id => layers.l.skills[id] == this); },
            needed() { return player.l.skills[this.id].level.add(1).pow(1.8).times(130); },
            effect() {
                let level = player.l.skills[this.id].level;
                if (tmp.l.deactivated) level = D.dZero;
                return D(1 / 100).times(level);
            },
            unlocked() { return hasMilestone('l', 4); },
            text() {
                /** @type {[keyof Layers, number][]} */
                const upgrades = [
                    ['xp', 23],
                    ['xp', 32],
                    ['xp_alt', 23],
                    ['xp_alt', 32],
                    ['s', 23],
                ],
                    list = listFormat.format(upgrades.filter(([layer]) => tmp[layer].layerShown).map(([layer, upgrade]) => layerColor(layer, tmp[layer].upgrades[upgrade].title)));

                if (!shiftDown) {
                    return `Reading level ${formatWhole(player.l.skills[this.id].level)}<br>\
                    ${format(player.l.skills[this.id].points)} points assigned to reading<br>\
                    ${list} effects +${format(tmp.l.skills[this.id].effect)}`;
                } else {
                    let effect_formula = 'level / 100';

                    return `Reading level ${formatWhole(player.l.skills[this.id].level)}<br>\
                    ${format(player.l.skills[this.id].points)} points assigned to reading<br>\
                    ${list} effects +[${effect_formula}]`;
                }
            },
            name: 'reading',
        },
        bartering: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.l.skills).find(id => layers.l.skills[id] == this); },
            needed() { return player.l.skills[this.id].level.add(1).pow(2).times(100); },
            effect() {
                let level = player.l.skills[this.id].level;
                if (tmp.l.deactivated) level = D.dZero;
                return D(1.01).pow(level);
            },
            unlocked() { return hasUpgrade('t', 32); },
            text() {
                if (!shiftDown) {
                    return `Bartering level ${formatWhole(player.l.skills[this.id].level)}<br>\
                    ${format(player.l.skills[this.id].points)} points assigned to bartering<br>\
                    Coins gain *${format(tmp.l.skills[this.id].effect)}`;
                } else {
                    let effect_formula = '1.01 ^ level';

                    return `Bartering level ${formatWhole(player.l.skills[this.id].level)}<br>\
                    ${format(player.l.skills[this.id].points)} points assigned to bartering<br>\
                    Coins gain *[${effect_formula}]`;
                }
            },
            name: 'bartering',
        },
        mining: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.l.skills).find(id => layers.l.skills[id] == this); },
            needed() { return player.l.skills[this.id].level.add(1).pow(2.5).times(50); },
            effect() {
                let level = player.l.skills[this.id].level;
                if (tmp.l.deactivated) level = D.dZero;
                return D.div(level, 20);
            },
            unlocked() { return hasChallenge('b', 21); },
            text() {
                if (!shiftDown) {
                    return `Mining level ${formatWhole(player.l.skills[this.id].level)}<br>\
                    ${format(player.l.skills[this.id].points)} points assigned to mining<br>\
                    Ore regeneration +${format(tmp.l.skills[this.id].effect)}`;
                } else {
                    let effect_formula = 'level / 20';

                    return `Mining level ${formatWhole(player.l.skills[this.id].level)}<br>\
                    ${format(player.l.skills[this.id].points)} points assigned to mining<br>\
                    Ore regeneration +[${effect_formula}]`;
                }
            },
            name: 'mining',
        },
        growing: {
            _id: null,
            get id() { return this._id ??= Object.keys(layers.l.skills).find(id => layers.l.skills[id] == this); },
            needed() { return player.l.skills[this.id].level.add(1).pow(3).times(25); },
            effect() {
                let level = player.l.skills[this.id].level;
                if (tmp.l.deactivated) level = D.dZero;
                return D.pow(1.05, level);
            },
            unlocked() { return hasChallenge('b', 22); },
            text() {
                if (!shiftDown) {
                    return `Growing level ${formatWhole(player.l.skills[this.id].level)}<br>\
                    ${format(player.l.skills[this.id].points)} points assigned to growing<br>\
                    Tree size *${format(tmp.l.skills[this.id].effect)}`;
                } else {
                    let effect_formula = '1.05 ^ level';

                    return `Growing level ${formatWhole(player.l.skills[this.id].level)}<br>\
                    ${format(player.l.skills[this.id].points)} points assigned to growing<br>\
                    Tree size *[${effect_formula}]`;
                }
            },
            name: 'growing',
        },
    },
    update(diff) {
        if (tmp.clo.layerShown) diff = D.times(diff, layers.clo.time_speed(this.layer));
        if (tmp.tic.layerShown) diff = D.times(diff, layers.tic.time_speed(this.layer));

        let skill_speed = D.times(diff, tmp.l.skills["*"].speed);

        let passive_points = tmp.l.skills['*'].bonus;

        Object.entries(player.l.skills)
            .filter(([skill, { points }]) => points.gt(0) || (passive_points.gt(0) && (tmp.l.skills[skill].unlocked ?? true)))
            .forEach(([, skill]) => {
                let { points } = skill;

                points = points.add(passive_points);

                if (hasUpgrade('s', 23)) points = points.times(upgradeEffect('s', 23));

                skill.progress = skill.progress.add(points.pow(2).times(skill_speed));
            });
    },
    automate() {
        Object.entries(player.l.skills).forEach(([skill, pdata]) => {
            const tdata = tmp.l.skills[skill];
            if (!(tdata.unlocked ?? true) && D.gt(player.l.skills[skill].points, 0)) {
                player.l.skills[skill].points = D.dZero;
            }
            while (pdata.progress.gte(tdata.needed)) {
                const tdata = tmp.l.skills[skill];
                pdata.progress = pdata.progress.minus(tdata.needed);
                pdata.level = pdata.level.add(1);
            }
        });
    },
    gainMult() {
        let div = D.dOne;

        div = div.div(buyableEffect('lo', 71));

        if (inChallenge('b', 12) && !hasUpgrade('s', 43)) div = div.div(player.l.points.max(0).add(10).log10());
        if (hasUpgrade('s', 43)) div = div.div(upgradeEffect('s', 43));

        if (hasUpgrade('s', 32)) div = div.div(upgradeEffect('s', 32));

        div = div.div(buyableEffect('lo', 81).divide);

        return div;
    },
    type: 'static',
    baseResource: 'experience points',
    baseAmount() {
        const max = tmp.xp.enemies['*'].exp_cap;
        let amount;
        if (tmp.xp.layerShown) amount = player.xp.points;
        else amount = player.xp_alt.points;
        return amount.min(max);
    },
    requires: D(12_500),
    base: D.dTwo,
    exponent: D.dTwo,
    roundUpCost: true,
    branches: [() => tmp.xp.layerShown ? 'xp' : ['xp_alt', 3]],
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        const keep = [];

        layerDataReset(this.layer, keep);
    },
    shouldNotify() { return tmp.l.skills['*'].left.gt(0) && Object.keys(layers.l.skills).some(skill => skill != '*' && (tmp.l.skills[skill].unlocked ?? true)); },
    canBuyMax: true,
});
