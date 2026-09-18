'use strict';

addLayer('b', {
    name: 'boss',
    symbol: 'B',
    startData() {
        return {
            unlocked: false,
            points: D.dZero,
            auto_start: true,
            final_challenges: [],
        };
    },
    tooltipLocked() { return 'Danger approaches'; },
    layerShown() { return player.b.unlocked || tmp.xp.total.kills.gte(250); },
    color: '#AA5555',
    row: 3, // The shop exits the challenge otherwise
    displayRow: 2,
    position: 0,
    resource: 'bosses',
    hotkeys: [
        {
            key: 'B',
            description: 'Shift + B: Display boss layer',
            unlocked() { return player.b.unlocked; },
            onPress() { if (player.b.unlocked) showTab('b'); },
        },
    ],
    tabFormat: {
        'Bosses': {
            content: [
                'main-display',
                'prestige-button',
                () => {
                    const id = activeChallenge('b');
                    if (!id) return;
                    return ['display-text', `In challenge: ${layerColor('b', layers.b.challenges[id].name)}`];
                },
                'blank',
                () => {
                    const speed = D.times(layers.clo.time_speed('b'), layers.tic.time_speed('b'));

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                ['display-text', () => `<span class="warning">Boss challenges ${player.b.auto_start ? 'are automatically entered and ' : ''}cannot be exited.</span>`],
                'blank',
                ['challenges', [1, 2]],
            ],
        },
        'Mini-Bossess': {
            content: [
                'main-display',
                'prestige-button',
                () => {
                    const id = activeChallenge('b');
                    if (!id) return;
                    return ['display-text', `In challenge: ${layerColor('b', layers.b.challenges[id].name)}`];
                },
                'blank',
                () => {
                    const speed = D.times(layers.clo.time_speed('b'), layers.tic.time_speed('b'));

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                ['display-text', '<span class="warning">Mini-boss challenges cannot be exited.</span>'],
                ['display-text', '<span style="color:#00CCCC;">Mini-boss challenges are optional.</span>'],
                'blank',
                ['challenges', [3, 4]],
            ],
            unlocked() { return hasChallenge('b', 11); },
            buttonStyle: { 'border-color': '#CC6666', },
        },
        'Relics': {
            content: [
                'main-display',
                'prestige-button',
                () => {
                    const id = activeChallenge('b');
                    if (!id) return;
                    return ['display-text', `In challenge: ${layerColor('b', layers.b.challenges[id].name)}`];
                },
                'blank',
                () => {
                    const speed = D.times(layers.clo.time_speed('b'), layers.tic.time_speed('b'));

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                ['display-text', '<span style="color:#00CCCC;">Relic challenges are optional.</span>'],
                'blank',
                ['challenges', [5, 6]],
            ],
            unlocked() { return [31, 32, 41, 42].some(id => hasChallenge('b', id)); },
            buttonStyle: { 'border-color': '#7777EE', },
        },
        'Universe': {
            content: [
                'main-display',
                'prestige-button',
                () => {
                    const id = activeChallenge('b');
                    if (!id) return;
                    return ['display-text', `In challenge: ${layerColor('b', layers.b.challenges[id].name)}`];
                },
                'blank',
                () => {
                    const speed = D.times(layers.clo.time_speed('b'), layers.tic.time_speed('b'));

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                ['display-text', () => `<span class="warning" style="font-size:1.5em;">This challenge cannot be exited.</span>`],
                'blank',
                ['challenges', [7]],
                'blank',
                ['column', () => {
                    const row = challenge => {
                        let color,
                            beaten;
                        switch (+challenge) {
                            case 11:
                            case 12:
                            case 21:
                            case 22:
                                color = '#AA5555';
                                break;
                            case 31:
                            case 32:
                            case 41:
                            case 42:
                                color = '#CC6666';
                                break;
                            case 51:
                            case 52:
                            case 61:
                            case 62:
                                color = '#7777EE';
                                break;
                            case 81:
                                color = tmp.tic.color;
                                break;
                            case 82:
                                color = tmp.bin.color;
                                break;
                            case 91:
                                color = tmp.con.color;
                                break;
                            case 92:
                            //todo color = alt stats
                        }
                        if (inChallenge('b', 71)) {
                            if (player.b.final_challenges.includes(challenge)) beaten = 'active';
                            else beaten = 'beaten';
                        } else {
                            beaten = 'inactive';
                        }

                        return ['display-text', `<span style="color:${color}">${tmp.b.challenges[challenge].name}</span> is ${beaten}`];
                    };

                    return Object.keys(layers.b.challenges).filter(id => hasChallenge('b', id) && id != 71).map(id => row(+id));
                }],
            ],
            unlocked() { return hasChallenge('b', 22); },
            buttonStyle: { 'border-color': '#FFFFFF', },
        },
    },
    challenges: {
        // Bosses
        11: {
            name: 'Slime King\'s Wrath',
            challengeDescription: 'Slime health is multiplied by 5, unlock a new layer.',
            goalDescription() {
                const progress = tmp.xp.total.kills.min(1_000);
                return `Kill another ${formatWhole(progress)}/${formatWhole(1_000)} slimes`;
            },
            canComplete() { return tmp.xp.total.kills.gte(1_000); },
            rewardDescription() {
                if (!hasChallenge(this.layer, this.id)) {
                    return 'The Slime King has a lot of treasure, surely you can find something of use in there.';
                } else {
                    return `Unlock goblins and keep the new layer. Your experience upgrades are always visible and ${layerColor('xp', tmp.xp.upgrades[22].title, 'text-shadow:#000 0 0 10px')}'s effect is doubled.`;
                }
            },
            unlocked() { return player.b.points.gte(1); },
            buttonStyle() {
                const active = activeChallenge('b'),
                    style = {};
                if (active && (active < 50 || active == 71) && !canCompleteChallenge(this.layer, this.id)) style.display = 'none';
                return style;
            },
        },
        12: {
            name: 'The Goblin CEO',
            challengeDescription: 'All resource gains are divided by log10(amount + 10), unlock a new layer.',
            goalDescription: 'Pay off the final loan.',
            canComplete() { return hasUpgrade('s', 81); },
            rewardDescription() {
                return `Unlock zombies and keep the new layer.\
                    Your mining upgrades are always visible,\
                    ${layerColor('xp', tmp.xp.upgrades[22].title, 'text-shadow:#000 0 0 10px')} also affects all enemies at half its amount,\
                    and automate xp upgrade.`;
            },
            unlocked() { return player.b.points.gte(2); },
            buttonStyle() {
                const active = activeChallenge('b'),
                    style = {};
                if (active && (active < 50 || active == 71) && !canCompleteChallenge(this.layer, this.id)) style.display = 'none';
                return style;
            },
        },
        21: {
            name: 'The Eternal Lich',
            challengeDescription: 'All enemies gain 5% of health regeneration, you lose 1% of skill progress per second, but you unlock a new item.',
            goalDescription: 'Make holy water and purify the monsters.',
            canComplete() { return player.lo.items.holy_water.amount.gt(0); },
            rewardDescription: 'Unlock ents. Your tree upgrades are always visible. Unlock a skill for mining, get a free skill point, and automate mining upgrades.',
            unlocked() { return player.b.points.gte(3); },
            buttonStyle() {
                const active = activeChallenge('b'),
                    style = {};
                if (active && (active < 50 || active == 71) && !canCompleteChallenge(this.layer, this.id)) style.display = 'none';
                return style;
            },
        },
        22: {
            name: 'Kudzu',
            challengeDescription: 'Enemy level is squared, plank gain is halved, third column tree upgrades\' effects are square rooted.',
            goalDescription() {
                const progress = player.f.points.min(1e3);
                return `Reach ${formatWhole(progress)}/${formatWhole(1e3)} heat`;
            },
            canComplete() { return player.f.points.gte(1e3); },
            rewardDescription: 'Unlock stars, the alternator, a skill for trees, and automate tree upgrades.',
            unlocked() { return player.b.points.gte(4); },
            buttonStyle() {
                const active = activeChallenge('b'),
                    style = {};
                if (active && (active < 50 || active == 71) && !canCompleteChallenge(this.layer, this.id)) style.display = 'none';
                return style;
            },
        },
        // Mini-bosses
        31: {
            name: 'Slime Prince\'s Anger',
            challengeDescription: 'You can only fight slimes, and their health is multiplied by 2.5. Most other layers are disabled.',
            goalDescription() {
                const progress = tmp.xp.total.kills.min(250);
                return `Kill ${formatWhole(progress)}/${formatWhole(250)} slimes`;
            },
            canComplete() { return tmp.xp.total.kills.gte(250); },
            rewardDescription: 'New XP upgrades, slime item drops are doubled.',
            unlocked() { return hasChallenge('b', 11); },
            buttonStyle() {
                const active = activeChallenge('b'),
                    style = { 'background-color': '#CC6666', };
                if (active && (active < 50 || active == 71) && !canCompleteChallenge(this.layer, this.id)) style.display = 'none';
                return style;
            },
            onEnter() { player.xp.type = 'slime'; },
        },
        32: {
            name: 'The Goblin President',
            challengeDescription: 'Lose 1% (rounded down) of your lower rows resources every second.<br>Get new debts to pay off.<br>Double price of final debt.',
            goalDescription: 'Pay off your final debt',
            canComplete() { return hasUpgrade('s', 81); },
            rewardDescription: 'Your portfolio grows, goblin item drops are doubled.',
            unlocked() { return hasChallenge('b', 12); },
            buttonStyle() {
                const active = activeChallenge('b'),
                    style = { 'background-color': '#CC6666', };
                if (active && (active < 50 || active == 71) && !canCompleteChallenge(this.layer, this.id)) style.display = 'none';
                return style;
            },
        },
        41: {
            name: 'The Incomplete Ghost',
            challengeDescription: 'Fight all the enemies at once. As one.',
            goalDescription() {
                const progress = player.lo.items.holy_water.amount.min(5);
                return `'We're gonna need more holy water. ${formatWhole(progress)}/${formatWhole(5)} should be enough`;
            },
            canComplete() { return player.lo.items.holy_water.amount.gte(5); },
            rewardDescription: 'Double zombie drops, and trees regenerate 1% of their health.',
            unlocked() { return hasChallenge('b', 21); },
            buttonStyle() {
                const active = activeChallenge('b'),
                    style = { 'background-color': '#CC6666', };
                if (active && (active < 50 || active == 71) && !canCompleteChallenge(this.layer, this.id)) style.display = 'none';
                return style;
            },
            onEnter() {
                player.xp.type = 'amalgam';
                player.xp_alt.type = 'amalgam';
            },
            onExit() {
                if (player.xp.type == 'amalgam') player.xp.type = 'slime';
                if (player.xp_alt.type == 'amalgam') player.xp_alt.type = 'slime';
            },
            onComplete() {
                if (player.xp.type == 'amalgam') player.xp.type = 'slime';
                if (player.xp_alt.type == 'amalgam') player.xp_alt.type = 'slime';
            },
        },
        42: {
            name: 'The World Tree',
            challengeDescription: 'Unlock a new enemy, the World Tree, which absorbs the spirit of the fallen.',
            goalDescription: 'Destroy it',
            canComplete() { return player.xp.enemies.world_tree.kills.gte(1); },
            rewardDescription: 'Double ent drops, trees are 50% bigger, and unlock a new tree.',
            unlocked() { return hasChallenge('b', 22); },
            buttonStyle() {
                const active = activeChallenge('b'),
                    style = { 'background-color': '#CC6666', };
                if (active && (active < 50 || active == 71) && !canCompleteChallenge(this.layer, this.id)) style.display = 'none';
                return style;
            },
            onComplete() { if (player.xp.type == 'world_tree') player.xp.type = 'slime'; },
            onExit() { if (player.xp.type == 'world_tree') player.xp.type = 'slime'; },
        },
        // Relics
        51: {
            name: 'The Broken Clock',
            challengeDescription: 'Time is much slower. This affects all passive content.',
            goalDescription: 'Fix The Clock',
            canComplete() { return [41, 42, 43].every(id => hasUpgrade('clo', id)); },
            rewardDescription: 'Unlock The Clock, a special layer to speed time up.',
            unlocked() { return hasChallenge('b', 31); },
            buttonStyle() {
                const active = activeChallenge('b'),
                    style = { 'background-color': '#7777EE', };
                if (active && (active < 50 || active == 71) && !canCompleteChallenge(this.layer, this.id)) style.display = 'none';
                return style;
            },
            // Removes repair upgrades
            onEnter() { player.clo.upgrades = player.clo.upgrades.filter(id => Math.floor(id / 10) != 4); },
        },
        52: {
            name: 'Misfortune',
            challengeDescription: 'Item drops are shuffled (only affects unlocked items).<br>Swap cost base is decreased for the challenge.',
            goalDescription: 'Restore the items drops to their original sources.',
            canComplete() { return Object.keys(player.cas.swaps.challenge).length == 0; },
            rewardDescription: 'Unlock The Casino, a special layer to change your luck.',
            unlocked() { return hasChallenge('b', 32); },
            buttonStyle() {
                const active = activeChallenge('b'),
                    style = { 'background-color': '#7777EE', };
                if (active && (active < 50 || active == 71) && !canCompleteChallenge(this.layer, this.id)) style.display = 'none';
                return style;
            },
            onEnter() {
                layerDataReset('cas', ['respecs']);
                player.cas.swaps.challenge = layers.cas.items.shuffle();
                layers.cas.items.clean_swaps();
            },
            onComplete() { layerDataReset('cas', ['respecs']); },
            onExit() { layerDataReset('cas', ['respecs']); },
        },
        61: {
            name: 'Differences',
            challengeDescription: 'Enemies are given a random element which is randomized on death. Not using an element effectively disables row 1 layers.',
            goalDescription() {
                const progress = tmp.xp.total.kills.min(250);
                return `Kill ${formatWhole(progress)}/${formatWhole(250)} enemies`;
            },
            canComplete() { return tmp.xp.total.kills.gte(250); },
            rewardDescription: 'Unlock Magic.',
            unlocked() { return hasChallenge('b', 41); },
            buttonStyle() {
                const active = activeChallenge('b'),
                    style = { 'background-color': '#7777EE', };
                if (active && (active < 50 || active == 71) && !canCompleteChallenge(this.layer, this.id)) style.display = 'none';
                return style;
            },
            onEnter() {
                player.mag.points = D(50);
                randomize_enemy_element();
            },
            onComplete() {
                player.mag.points = D.dZero;
                player.mag.element = 'none';
            },
            onExit() {
                player.mag.element = 'none';
            },
        },
        62: {
            name: 'True Fight',
            challengeDescription: 'Enemies strike back. If you die, your row 1 layers are reset. Unlock a toggle for auto attacking and a new layer to help.',
            goalDescription() {
                const progress = tmp.xp.total.kills.min(250);
                return `Kill ${formatWhole(progress)}/${formatWhole(250)} enemies`;
            },
            canComplete() { return tmp.xp.total.kills.gte(250); },
            rewardDescription: 'Unlock Stats.',
            unlocked() { return hasChallenge('b', 42); },
            buttonStyle() {
                const active = activeChallenge('b'),
                    style = { 'background-color': '#7777EE', };
                if (active && (active < 50 || active == 71) && !canCompleteChallenge(this.layer, this.id)) style.display = 'none';
                return style;
            },
            onEnter() {
                player.xp.enemies.player.health = tmp.xp.enemies.player.health;
                layerDataReset('sta');
            },
            onComplete() { layerDataReset('sta'); },
        },
        // Final
        71: {
            name: 'Big Crunch',
            challengeDescription() {
                let text = 'Enter all your beaten challenges at once. They are automatically completed and affect both sides.';
                if (!false) {
                    text = `<b class="warning">Your world is too small for this challenge.</b><br>\
                    ${text}`;
                }

                return text;
            },
            goalDescription: 'Complete all the challenges',
            canComplete: false,
            rewardDescription: 'Win the game. As in, truly win the game.',
            countsAs() { return player.b.final_challenges; },
            unlocked() { return hasChallenge('b', 22); },
            buttonStyle() {
                const active = activeChallenge('b'),
                    style = { 'background-color': '#FFFFFF', };
                if (active && (active < 50 || active == 71) && !canCompleteChallenge(this.layer, this.id) || true) style.display = 'none';
                return style;
            },
            onEnter() {
                const challenges = Object.keys(layers.b.challenges).filter(id => hasChallenge('b', id) && id != 71).map(id => +id);

                player.b.final_challenges = challenges;

                // Mini boss challenges
                if (challenges.includes(41)) {
                    player.xp.type = 'amalgam';
                } else if (challenges.includes(31)) {
                    player.xp.type = 'slime';
                }
                // Relic challenges
                if (challenges.includes(51)) {
                    player.clo.upgrades = player.clo.upgrades.filter(id => Math.floor(id / 10) != 4);
                }
                if (challenges.includes(52)) {
                    layerDataReset('cas');
                    player.cas.swaps.challenge = layers.cas.items.shuffle();
                    layers.cas.items.clean_swaps();
                    player.cas.respecs = D.dZero;
                }
                if (challenges.includes(61)) {
                    player.mag.points = D(50);
                    randomize_enemy_element();
                }
                // Seal challenges
                if (challenges.includes(82)) {
                    player.bin.cards = {};
                    player.bin.rolled = [];
                    tmp.bin.cards.possibles.forEach(layer => player.bin.cards[layer] = { spots: create_card(), wins: D.dZero, });
                }
                if (challenges.includes(91)) {
                    player.con.points = D.dZero;
                    Object.values(player.con.condiments).forEach(data => data.amount = D.dZero);
                    Object.values(player.con.grid).forEach(data => {
                        data.condiment = '';
                        data.tier = D.dZero;
                    });
                    player.con.bought = D.dZero;
                    player.con.respecs = D.dZero;
                }
            },
        },
        // Seals
        81: {
            name: 'Time Cubes Seal',
            challengeDescription: `\
                Time is multiplied by a random number between -1 and 2 every second<br><br>\
                <span class="warning">This works like a Boss challenge</span>`,
            goalDescription() {
                if (tmp.xp_alt.layerShown) {
                    return `Tame ${formatWhole(tmp.xp_alt.total.tamed.min(100))}/${formatWhole(100)} monsters`;
                } else {
                    return `Kill ${formatWhole(tmp.xp.total.kills.min(250))}/${formatWhole(250)} enemies`;
                }
            },
            canComplete() {
                if (tmp.xp_alt.layerShown) {
                    return tmp.xp_alt.total.tamed.gte(100);
                } else {
                    return tmp.xp.total.kills.gte(250);
                }
            },
            rewardDescription: 'Unlock the true potential of Time Cubes',
            buttonStyle() {
                const active = activeChallenge('b'),
                    style = { 'background-color': tmp.tic.color, };
                if (active && (active < 50 || active == 71) && !canCompleteChallenge(this.layer, this.id)) style.display = 'none';
                return style;
            },
            unlocked() { return hasUpgrade('a', 24); },
            onComplete() { player.subtabs.tic.mainTabs = 'Generation'; },
        },
        82: {
            name: 'Bingo Seal',
            challengeDescription: `\
                All lower resources gain are multiplied by their layer's bingo progress<br><br>\
                <span class="warning">This works like a Boss challenge</span>`,
            goalDescription: 'Get a bingo',
            canComplete() { return Object.values(player.bin.cards).some(({ wins }) => D.gt(wins, 0)); },
            rewardDescription: 'Unlock the true potential of Bingo',
            buttonStyle() {
                const active = activeChallenge('b'),
                    style = { 'background-color': tmp.bin.color, };
                if (active && (active < 50 || active == 71) && !canCompleteChallenge(this.layer, this.id)) style.display = 'none';
                return style;
            },
            unlocked() { return hasUpgrade('a', 34); },
            onEnter() {
                player.bin.points = D(0);
                player.bin.time = D.dZero;
                player.bin.cards = {};
                player.bin.rolled = [];
                tmp.bin.cards.possibles.forEach(layer => player.bin.cards[layer] = { spots: create_card() });
            },
            onExit() {
                player.bin.cards = {};
                player.bin.rolled = [];
                player.bin.show = '';
            },
            onComplete() {
                player.bin.points = D(5);
                player.subtabs.tic.mainTabs = 'Bingo';
                player.bin.cards = {};
                player.bin.rolled = [];
                player.bin.respecs = D.dZero;
                player.bin.time = D.dZero;
                player.bin.show = '';
            },
        },
        91: {
            name: 'Condiment Seal',
            challengeDescription: `\
                Unlock food condiments. Not using a condiment heavily nerfs row 2 layers.\
                <span class="warning">This works like a Boss challenge</span>`,
            goalDescription() {
                const highest = Object.values(player.con.grid)
                    .filter(data => data.condiment != '')
                    .sort((a, b) => D.cmp(b.tier, a.tier));
                return `Get a grade ${formatWhole(highest[0]?.tier)}/5 condiment`;
            },
            canComplete() {
                const highest = Object.values(player.con.grid)
                    .filter(data => data.condiment != '')
                    .sort((a, b) => D.cmp(b.tier, a.tier));
                return D.gte(highest[0]?.tier, 5);
            },
            rewardDescription: 'Unlock the true potential of Condiments<br>Your condiment respecs are reset',
            buttonStyle() {
                const active = activeChallenge('b'),
                    style = { 'background-color': tmp.con.color, };
                if (active && (active < 50 || active == 71) && !canCompleteChallenge(this.layer, this.id)) style.display = 'none';
                return style;
            },
            unlocked() { return hasUpgrade('a', 44); },
            onEnter() {
                player.con.points = D.dZero;
                Object.values(player.con.condiments).forEach(data => data.amount = D.dZero);
                Object.values(player.con.grid).forEach(data => {
                    data.condiment = '';
                    data.tier = D.dZero;
                });
                player.con.bought = D.dZero;
            },
            onExit() {
                player.con.points = D.dZero;
                Object.values(player.con.condiments).forEach(data => data.amount = D.dZero);
                Object.values(player.con.grid).forEach(data => {
                    data.condiment = '';
                    data.tier = D.dZero;
                });
                player.con.bought = D.dZero;
            },
            onComplete() {
                player.subtabs.con.mainTabs = 'Condiments';
                player.con.points = D.dZero;
                Object.values(player.con.condiments).forEach(data => data.amount = D.dZero);
                Object.values(player.con.grid).forEach(data => {
                    data.condiment = '';
                    data.tier = D.dZero;
                });
                player.con.bought = D.dZero;
                player.con.respecs = D.dZero;
            },
        },
        //todo 92
    },
    automate() {
        if (player.b.auto_start && !player.b.activeChallenge) {
            const id = [11, 12, 21, 22].find(id => tmp.b.challenges[id]?.unlocked && !hasChallenge('b', id));
            if (id) startChallenge('b', id);
        }
    },
    update(diff) {
        if (tmp.clo.layerShown) diff = D.times(diff, layers.clo.time_speed(this.layer));
        if (tmp.tic.layerShown) diff = D.times(diff, layers.tic.time_speed(this.layer));

        if (inChallenge('b', 21)) {
            Object.entries(player.l.skills).forEach(([skill, { progress }]) => {
                player.l.skills[skill].progress = D.minus(player.l.skills[skill].progress, progress.div(100)).max(0);
            });
        }
        if (inChallenge('b', 32)) {
            /** @param {DecimalSource} amount */
            const get_loss = (amount, alt = false) => {
                if (D.lte(amount, 0)) return D.dZero;
                let loss = D.div(amount, 100).floor();
                if (alt) loss = loss.pow(tmp.a.change_efficiency);
                loss = loss.times(diff).min(amount);
                if (isNaN(loss.mag) || isNaN(loss.sign) || isNaN(loss.layer)) return D.dZero;
                return loss;
            };

            if (!hasUpgrade('s', 41)) {
                player.xp.points = player.xp.points.minus(get_loss(player.xp.points)).max(0);
                player.xp_alt.points = player.xp_alt.points.minus(get_loss(player.xp_alt.points, true)).max(0);
            }
            if (!hasUpgrade('s', 42)) {
                const total = tmp.xp.total.kills,
                    loss = get_loss(total);
                if (loss.gt(0)) Object.entries(player.xp.enemies).forEach(([, data]) => {
                    const l = data.kills.div(total).times(loss);
                    data.kills = data.kills.minus(l).max(0);
                });
            }
            if (!false) {
                const total = tmp.xp_alt.total.tamed,
                    loss = get_loss(total, true);
                if (loss.gt(0)) Object.entries(player.xp_alt.monsters).forEach(([, data]) => {
                    const l = data.tamed.div(total).times(loss);
                    data.tamed = data.tamed.minus(l).max(0);
                });
            }
            if (!hasUpgrade('s', 43)) {
                player.l.points = player.l.points.minus(get_loss(player.l.points)).max(0);
            }
            if (!false) {
                player.to.points = player.to.points.minus(get_loss(player.to.points, true)).max(0);
            }
            if (!hasUpgrade('s', 121)) {
                player.f.points = player.f.points.minus(get_loss(player.f.points)).max(0);
            }
            if (!false) {
                player.fr.points = player.fr.points.minus(get_loss(player.fr.points, true)).max(0);
            }
            // Items
            Object.entries(player.lo.items).forEach(([item, data]) => {
                if (item == 'stardust') return;

                const upg = layers.s.investloans.item_upgrade[item] ?? false;
                if (!upg || !hasUpgrade('s', upg)) gain_items(item, get_loss(data.amount).neg());
            });
            // Resources
            Object.entries(player.c.resources).forEach(([resource, data]) => {
                if (!false) return;

                gain_resource(resource, get_loss(data.amount).neg());
            });
        }
    },
    type: 'custom',
    getResetGain() {
        if (player.b.points.lt(1)) return D(+player.xp.enemies.slime.kills.gte(1_000));
        if (player.b.points.lt(2)) return D(+player.xp.enemies.goblin.kills.gte(1_000));
        if (player.b.points.lt(3)) return D(+player.xp.enemies.zombie.kills.gte(1_000));
        if (player.b.points.lt(4)) return D(+player.xp.enemies.ent.kills.gte(1_000));
        return D.dZero;
    },
    baseAmount() {
        if (player.b.points.lt(1)) return player.xp.enemies.slime.kills;
        if (player.b.points.lt(2)) return player.xp.enemies.goblin.kills;
        if (player.b.points.lt(3)) return player.xp.enemies.zombie.kills;
        if (player.b.points.lt(4)) return player.xp.enemies.ent.kills;
        return D.dZero;
    },
    getNextAt() {
        if (player.b.points.lt(4)) return D(1_000);
        return D.dInf;
    },
    canReset() {
        if (player.b.activeChallenge) return false;
        if (player.b.points.lt(1)) return player.xp.enemies.slime.kills.gte(1_000);
        if (player.b.points.lt(2)) return player.xp.enemies.goblin.kills.gte(1_000);
        if (player.b.points.lt(3)) return player.xp.enemies.zombie.kills.gte(1_000);
        if (player.b.points.lt(4)) return player.xp.enemies.ent.kills.gte(1_000);
        return false;
    },
    prestigeButtonText() {
        if (player.b.points.eq(0)) return `Your next boss will be at ${formatWhole(getNextAt('b'))} ${tmp.xp.enemies['slime'].name} kills`;
        if (player.b.points.eq(1)) {
            const name = hasChallenge('b', 11) ? tmp.xp.enemies['goblin'].name : '???';
            return `Your next boss will be at ${formatWhole(getNextAt('b'))} ${name} kills`;
        }
        if (player.b.points.eq(2)) {
            const name = hasChallenge('b', 12) ? tmp.xp.enemies['zombie'].name : '???';
            return `Your next boss will be at ${formatWhole(getNextAt('b'))} ${name} kills`;
        }
        if (player.b.points.eq(3)) {
            const name = hasChallenge('b', 21) ? tmp.xp.enemies['ent'].name : '???';
            return `Your next boss will be at ${formatWhole(getNextAt('b'))} ${name} kills`;
        }
        return 'There are no more bosses to fight';
    },
    prestigeNotify() { return tmp.b.getResetGain.gte(1); },
    shouldNotify() { return activeChallenge('b') !== false && activeChallenge('b') < 80 && canCompleteChallenge('b', player.b.activeChallenge); },
    roundUpCost: true,
    autoPrestige: true,
    branches() {
        /** @type {string[]} */
        const branches = [];

        if (inChallenge('b', 31)) {
            if (tmp.xp.layerShown) branches.push('xp');
            else branches.push(['xp_alt', 3]);
        } else {
            if (tmp.l.layerShown) branches.push('l');
            else branches.push(['to', 3]);
        }

        return branches;
    },
});
