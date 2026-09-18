'use strict';

addLayer('m', {
    name: 'Mining',
    symbol: 'M',
    startData() {
        return {
            points: D.dZero,
            unlocked: true,
            health: D.dZero,
            short_mode: false,
            last_drops: [],
            last_drops_times: D.dZero,
            mode: 'shallow',
            show_deep: false,
            auto_upgrade: true,
        };
    },
    tooltip() {
        if (player.m.short_mode) {
            const style = item => {
                const color = tmp.lo.items[item].style['background-color'],
                    shadow = tmp.lo.items[item].style['color'] ?? color;
                return `<span style="color:${color};text-shadow:${shadow} 0 0 10px;">${formatWhole(player.lo.items[item].amount)}</span>`;
            };

            return layers.m.ore.items.filter(item => tmp.lo.items[item].unlocked).map(style).join(', ');
        } else {
            const line = item => `${formatWhole(player.lo.items[item].amount)} ${tmp.lo.items[item].name}`;

            return layers.m.ore.items.filter(item => tmp.lo.items[item].unlocked).map(line).join('<br>');
        }
    },
    layerShown() { return (hasChallenge('b', 11) || inChallenge('b', 11)) && !tmp[this.layer].deactivated; },
    deactivated() { return inChallenge('b', 31) || hasUpgrade('a', 12); },
    color() {
        switch (player.m.mode) {
            case 'deep': return '#BBBBBB';
            default:
            case "shallow": return '#DDDDDD';
        }
    },
    row: 0,
    position: 1,
    resource: 'ores',
    hotkeys: [
        {
            key: 'M',
            description: 'Shift + M: Display mining layer',
            unlocked() { return tmp.m.layerShown; },
            onPress() { showTab('m'); },
        },
        {
            key: 'ArrowUp',
            description: '↑ (in M): Mine shallower',
            unlocked() { return hasUpgrade('m', 52); },
            onPress() {
                if (player.tab == 'm' && player.m.mode != 'shallow') {
                    player.m.mode = {
                        'deep': 'shallow',
                    }[player.m.mode] ?? 'shallow';
                };
            },
        },
        {
            key: 'ArrowDown',
            description: '↓ (in M): Mine deeper',
            unlocked() { return hasUpgrade('m', 52); },
            onPress() {
                if (player.tab == 'm' && player.m.mode != 'deep') {
                    player.m.mode = {
                        'shallow': 'deep',
                    }[player.m.mode] ?? 'deep';
                };
            },
        },
    ],
    tabFormat: {
        'Mining': {
            content: [
                () => {
                    const speed = D.times(layers.clo.time_speed('m'), layers.tic.time_speed('m'));

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
                            shadow = itemp.style['color'] ?? color;
                        return `<span style="color:${color};text-shadow:${shadow} 0 0 10px;font-size:1.5em;">${formatWhole(player.lo.items[item].amount)}</span> ${itemp.name}`;
                    };

                    return `You have ${listFormat.format(layers.m.ore.items.filter(item => tmp.lo.items[item].unlocked).map(line))}.`;
                }],
                ['row', [
                    ['display-text', 'Short tooltip mode'],
                    'blank',
                    ['toggle', ['m', 'short_mode']],
                ]],
                'blank',
                ['bar', 'health'],
                ['clickables', [1]],
                () => { if (player.m.show_deep) return ['display-text', `Mining ${tmp.m.ore.mode}`]; },
                'blank',
                ['display-text', () => `Chance to mine something: ${format_chance(tmp.m.ore.chance)}`],
                () => { if (tmp.m.ore.mine_mult.neq(1)) return ['display-text', `Mining *${format(tmp.m.ore.mine_mult)} ore`]; },
                ['display-text', () => {
                    let drops = 'nothing',
                        count = '';

                    const last_drops = player.m.last_drops,
                        last_count = player.m.last_drops_times;
                    if (last_drops.length) drops = listFormat.format(last_drops.map(([item, amount]) => `${format(amount)} ${layers.lo.items[item].name}`));
                    if (last_count.gt(1)) count = ` (${formatWhole(last_count)} times)`;

                    return `Mined ${drops}${count}`;
                }],
            ],
        },
        'Upgrades': {
            content: [
                ['display-text', () => {
                    const line = item => {
                        const itemp = tmp.lo.items[item],
                            color = itemp.style['background-color'],
                            shadow = itemp.style['color'] ?? color;
                        return `<span style="color:${color};text-shadow:${shadow} 0 0 10px;font-size:1.5em;">${formatWhole(player.lo.items[item].amount)}</span> ${itemp.name}`;
                    };

                    return `You have ${listFormat.format(layers.m.ore.items.filter(item => tmp.lo.items[item].unlocked).map(line))}.`;
                }],
                ['row', [
                    ['display-text', 'Short tooltip mode'],
                    'blank',
                    ['toggle', ['m', 'short_mode']]
                ]],
                () => hasChallenge('b', 21) ? ['row', [
                    ['display-text', 'Automatically buy upgrades'],
                    'blank',
                    ['toggle', ['m', 'auto_upgrade']],
                ]] : undefined,
                'blank',
                'upgrades',
            ],
            buttonStyle() {
                // If you figure out why shouldNotify does nothing when it returns true, I'll use it again.
                // Until then, it's done manually
                const style = {};
                if (canAffordLayerUpgrade('m')) style['box-shadow'] = 'var(--hqProperty2a), 0 0 20px #ff0000';
                return style;
            },
        },
    },
    clickables: {
        11: {
            style: {
                'background-image': `url('./resources/images/previous-button.svg')`,
                'transform': 'rotate(90deg)',
            },
            canClick() { return player.m.mode != 'shallow'; },
            onClick() {
                player.m.mode = {
                    'deep': 'shallow',
                }[player.m.mode] ?? 'shallow';
            },
            unlocked() { return hasUpgrade('m', 52); },
        },
        12: {
            style: { 'background-image': `url('./resources/images/pickaxe.svg')`, },
            canClick() { return player.m.health.gte(1); },
            onClick() {
                player.m.health = player.m.health.minus(1);

                /** @type {[string, Decimal][]} */
                let drops = [];

                if (options.noRNG) {
                    drops = get_mining_drops(tmp.m.ore.chance);
                } else if (tmp.m.ore.chance.gt(Math.random())) {
                    drops = get_mining_drops(1);
                } else {
                    drops = [];
                }

                const equal = drops.length == player.m.last_drops.length &&
                    drops.every(([item, amount]) => player.m.last_drops.some(([litem, lamount]) => item == litem && D.eq(amount, lamount)));

                if (equal) {
                    player.m.last_drops_times = D.add(player.m.last_drops_times, 1);
                } else {
                    player.m.last_drops_times = D.dOne;
                    player.m.last_drops = drops;
                }

                gain_items(drops);
            },
            onHold() {
                player.m.health = player.m.health.minus(1);

                /** @type {[string, Decimal][]} */
                let drops = [];

                if (options.noRNG) {
                    drops = get_mining_drops(tmp.m.ore.chance);
                } else if (tmp.m.ore.chance.gt(Math.random())) {
                    drops = get_mining_drops(1);
                } else {
                    drops = [];
                }

                const equal = drops.length == player.m.last_drops.length &&
                    drops.every(([item, amount]) => player.m.last_drops.some(([litem, lamount]) => item == litem && D.eq(amount, lamount)));

                if (equal) {
                    player.m.last_drops_times = D.add(player.m.last_drops_times, 1);
                } else {
                    player.m.last_drops_times = D.dOne;
                    player.m.last_drops = drops;
                }

                gain_items(drops);
            },
        },
        13: {
            style: {
                'background-image': `url('./resources/images/previous-button.svg')`,
                'transform': 'rotate(-90deg)',
            },
            canClick() { return player.m.mode != 'deep'; },
            onClick() {
                player.m.mode = {
                    'shallow': 'deep',
                }[player.m.mode] ?? 'deep';
            },
            unlocked() { return hasUpgrade('m', 52); },
        },
    },
    upgrades: {
        11: {
            title: 'Stone Pickaxe',
            description: 'Double ore health',
            effect() { return D(2); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(10),
            item: 'stone',
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
            title: 'Copper Pickaxe',
            description() {
                if (!shiftDown) return 'Ore health boosts mining chance';

                let formula = 'log7(ore health + 7)';

                return `Formula: ${formula}`;
            },
            effect() { return player.m.health.max(0).add(7).log(7); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(5),
            item: 'copper_ore',
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
            title: 'Tin Pickaxe',
            description() {
                if (!shiftDown) {
                    if (hasUpgrade('m', 32)) return 'Kills boost mining chance';
                    return 'Kills boost ore chances (does not apply to stone)';
                }

                let formula = 'log3(kills + 3)';
                if (hasUpgrade('m', 32)) formula = `2√(${formula})`;

                return `Formula: ${formula}`;
            },
            effect() {
                let ore_chance = D.dOne,
                    mine_chance = D.dOne,
                    effect = tmp.xp.total.kills.max(0).add(3).log(3);

                if (hasUpgrade('m', 32)) {
                    mine_chance = effect.root(2);
                } else {
                    ore_chance = effect;
                }

                return {
                    mine_chance,
                    ore_chance,
                };
            },
            effectDisplay() {
                const k = hasUpgrade('m', 32) ? 'mine_chance' : 'ore_chance';
                return `*${format(upgradeEffect(this.layer, this.id)[k])}`;
            },
            cost: D(1),
            item: 'tin_ore',
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
            title: 'Stone Sword',
            description() {
                if (!shiftDown) return 'Stone boosts damage';

                let formula = '5√(stone + 1)';

                return `Formula: ${formula}`;
            },
            effect() { return D.add(player.lo.items.stone.amount, 1).root(5); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(50),
            unlocked() { return hasUpgrade(this.layer, this.id - 10) || hasChallenge('b', 12); },
            item: 'stone',
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
            title: 'Copper Drill',
            description: 'Automatically mine the whole ore when it\'s full',
            cost: D(20),
            unlocked() { return hasUpgrade(this.layer, this.id - 10) || hasChallenge('b', 12); },
            item: 'copper_ore',
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
            title: 'Tin Minecart',
            description() {
                if (!shiftDown) return 'Ore health boosts ore regeneration speed';

                let formula = '7√(ore health + 1)';

                return `Formula: ${formula}`;
            },
            effect() { return player.m.health.max(0).add(1).root(7); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(3),
            unlocked() { return hasUpgrade(this.layer, this.id - 10) || hasChallenge('b', 12); },
            item: 'tin_ore',
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
            title: 'Stone Tablet',
            description() {
                if (!shiftDown) return 'Stone boosts skill speed';

                let formula = 'log10(stone + 10)';

                return `Formula: ${formula}`;
            },
            effect() { return D.add(player.lo.items.stone.amount.max(0), 10).log10(); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(250),
            unlocked() { return hasUpgrade(this.layer, this.id - 10) || hasChallenge('b', 12); },
            item: 'stone',
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
            title: 'Copper Filter',
            description() { return `Get as much stone as ores<br>Stop getting stone otherwise<br>${layerColor('m', tmp.m.upgrades[13].title, 'text-shadow:#000 0 0 10px')}\'s effect is changed`; },
            cost: D(80),
            unlocked() { return hasUpgrade(this.layer, this.id - 10) || hasChallenge('b', 12); },
            item: 'copper_ore',
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
            title: 'Tin Anvil',
            description() {
                if (!shiftDown) {
                    let text = '';

                    if (!hasUpgrade('s', 22)) text += 'Allow crafting items with metals<br>';

                    text += 'Tin boosts max ore health';

                    return text;
                }

                let formula = '5√(tin ore)';

                if (hasUpgrade('s', 22)) formula = '3√(tin ore)';

                return `Formula: ${formula}`;
            },
            effect() {
                if (!hasUpgrade('s', 22)) return D.root(player.lo.items.tin_ore.amount, 5);

                return D.root(player.lo.items.tin_ore.amount, 3);
            },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(9),
            unlocked() { return hasUpgrade(this.layer, this.id - 10) || hasChallenge('b', 12); },
            item: 'tin_ore',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
        },
        41: {
            title: 'Coal Pickaxe',
            description: 'How does this thing even stay intact?<br>Double mining chance',
            effect() { return D.dTwo; },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(1),
            item: 'coal',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    style['background-color'] = tmp.lo.items[this.item].style['background-color'];
                    style['color'] = tmp.lo.items[this.item].style['color'];
                }

                return style;
            },
            unlocked() { return player.m.show_deep; },
        },
        42: {
            title: 'Iron Pickaxe',
            description() {
                if (!shiftDown) return 'Kills boost ore health';

                let formula = 'log100(kills + 100)';

                return `Formula: ${formula}`;
            },
            effect() { return tmp.xp.total.kills.max(0).add(100).log(100); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(1),
            item: 'iron_ore',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
            unlocked() { return hasChallenge('b', 12); },
        },
        43: {
            title: 'Gold Pickaxe',
            description: 'Increases amount of mined ores',
            effect() { return D(1.5); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(1),
            item: 'gold_ore',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
            unlocked() { return player.m.show_deep; },
        },
        51: {
            title: 'Coal Forge',
            description() { return `Unlock the forge<br>Boost ${layerColor('lo', tmp.lo.buyables[21].title)} effect`; },
            effect() { return D(1.1); },
            effectDisplay() { return `^${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(7),
            item: 'coal',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    style['background-color'] = tmp.lo.items[this.item].style['background-color'];
                    style['color'] = tmp.lo.items[this.item].style['color'];
                }

                return style;
            },
            unlocked() { return player.m.show_deep; },
            onPurchase() { player.f.unlocked = true; },
        },
        52: {
            title: 'Iron Shaft',
            description: 'Allows deep mining<br>Doubles stone gain',
            effect() { return D.dTwo; },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(5),
            item: 'iron_ore',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
            unlocked() { return hasChallenge('b', 12); },
            onPurchase() { player.m.show_deep = true; },
        },
        53: {
            title: 'Gold Collector',
            description() {
                if (!shiftDown) return 'Gold boosts drop chances';

                let formula = 'log18(gold ore + 18)';

                return `Formula: ${formula}`;
            },
            effect() {
                let gold = player.lo.items.gold_ore.amount;

                gold = gold.add(buyableEffect('lo', 53));

                return gold.max(0).add(18).log(18);
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(3),
            item: 'gold_ore',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
            unlocked() { return player.m.show_deep; },
        },
        61: {
            title: 'Fire Axe',
            description() {
                if (!shiftDown) return 'Coal boosts tree damage';

                let formula = '7√(coal + 1)';

                return `Formula: ${formula}`;
            },
            effect() { return D.add(player.lo.items.coal.amount, 1).root(7); },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(49),
            item: 'coal',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) {
                    style['background-color'] = tmp.lo.items[this.item].style['background-color'];
                    style['color'] = tmp.lo.items[this.item].style['color'];
                }

                return style;
            },
            unlocked() { return player.m.show_deep; },
        },
        62: {
            title: 'Iron Axe',
            description: 'Unlock a new layer<br>Increase tree damage',
            onPurchase() { player.t.unlocked = true; },
            effect() { return D.dOne; },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(25),
            item: 'iron_ore',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
            unlocked() { return hasChallenge('b', 12); },
        },
        63: {
            title: 'Gold Coins',
            description() {
                if (!shiftDown) return 'Gold boosts coin gain';

                let formula = 'log9(gold ore + 9)';

                return `Formula: ${formula}`;
            },
            effect() {
                let gold = player.lo.items.gold_ore.amount;

                gold = gold.add(buyableEffect('lo', 53));

                return gold.max(0).add(9).log(9);
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(9),
            item: 'gold_ore',
            currencyInternalName: 'amount',
            currencyDisplayName() { return tmp.lo.items[this.item].name; },
            currencyLocation() { return player.lo.items[this.item]; },
            style() {
                const style = {};

                if (!hasUpgrade(this.layer, this.id) && canAffordUpgrade(this.layer, this.id)) style['background-color'] = tmp.lo.items[this.item].style['background-color'];

                return style;
            },
            unlocked() { return player.m.show_deep; },
        },
    },
    bars: {
        health: {
            direction: RIGHT,
            width: 200,
            height: 50,
            progress() {
                const max = tmp.m.ore.health;
                return D.div(player.m.health ?? max, max);
            },
            display() { return `${format(player.m.health)} / ${format(tmp.m.ore.health)}<br />(+${format(tmp.m.ore.regen)}/s)`; },
            baseStyle: { 'background-color': '#222222', },
            fillStyle: { 'background-color': '#DDDDDD', },
            textStyle: { 'color': 'gray', },
        },
    },
    ore: {
        health() {
            let health = D(10);

            if (hasUpgrade('m', 33)) health = health.add(upgradeEffect('m', 33));

            if (hasUpgrade('m', 11)) health = health.times(upgradeEffect('m', 11));
            if (hasUpgrade('m', 42)) health = health.times(upgradeEffect('m', 42));

            health = health.times(buyableEffect('lo', 21));

            return health;
        },
        regen() {
            let regen = D.dOne;

            regen = regen.add(tmp.l.skills.mining.effect);

            if (hasChallenge('b', 62) && !inChallenge('b', 62)) regen = regen.add(tmp.sta.stats.regeneration.effect);

            if (hasUpgrade('m', 23)) regen = regen.times(upgradeEffect('m', 23));

            regen = regen.times(buyableEffect('lo', 82).regen);

            regen = regen.times(tmp.mag.elements[player.mag.element].effects.mining?.regen_multiplier ?? 1);

            return regen;
        },
        chance(mode = player.m.mode) {
            /** @type {Decimal} */
            let chance;
            switch (mode) {
                default:
                case 'shallow':
                    chance = D(1 / 3);
                    break;
                case 'deep':
                    chance = D(1 / 16);
                    break;
            }

            if (hasUpgrade('m', 12)) chance = chance.times(upgradeEffect('m', 12));
            if (hasUpgrade('m', 13)) chance = chance.times(upgradeEffect('m', 13).mine_chance);
            if (hasUpgrade('m', 41)) chance = chance.times(upgradeEffect('m', 41));

            chance = chance.times(buyableEffect('lo', 22));
            chance = chance.times(buyableEffect('lo', 23).chance_mult);

            chance = chance.times(tmp.mag.elements[player.mag.element].effects.mining?.chance_multiplier ?? 1);

            if (hasUpgrade('s', 11)) chance = chance.root(upgradeEffect('s', 11));
            else chance = chance.min(1);

            return chance;
        },
        mode(mode = player.m.mode) {
            switch (mode) {
                default:
                case 'shallow':
                    return player.m.show_deep ? 'shallow' : '';
                case 'deep':
                    return 'deep';
            };
        },
        items: [
            'stone', 'copper_ore', 'tin_ore', // T0
            'coal', 'iron_ore', 'gold_ore', // T1
        ],
        mine_mult() {
            let mult = D.dOne;

            if (hasUpgrade('f', 22)) mult = D.times(mult, upgradeEffect('f', 22));

            if (hasUpgrade('m', 43)) mult = D.times(mult, upgradeEffect('m', 43));

            if (hasUpgrade('t', 23)) mult = D.times(mult, upgradeEffect('t', 23));

            return mult;
        },
    },
    update(diff) {
        if (tmp.clo.layerShown) diff = D.times(diff, layers.clo.time_speed(this.layer));
        if (tmp.tic.layerShown) diff = D.times(diff, layers.tic.time_speed(this.layer));

        if (player.m.health.lt(tmp.m.ore.health)) {
            const regen = tmp.m.ore.regen.times(diff);

            player.m.health = player.m.health.add(regen).min(tmp.m.ore.health);
        }
    },
    automate() {
        if (hasUpgrade('m', 22) && player.m.health.gte(tmp.m.ore.health)) {
            const chance = player.m.health.times(tmp.m.ore.chance),
                drops = get_mining_drops(chance),
                equal = drops.length == player.m.last_drops.length &&
                    drops.every(([item, amount]) => player.m.last_drops.some(([litem, lamount]) => item == litem && D.eq(amount, lamount)));
            if (equal) {
                player.m.last_drops_times = D.add(player.m.last_drops_times, 1);
            } else {
                player.m.last_drops_times = D.dOne;
                player.m.last_drops = drops;
            }
            gain_items(drops);
            player.m.health = D.dZero;
        }

        if (player.m.mode == 'deep' && !hasUpgrade('m', 52)) player.m.mode = 'shallow';
    },
    type: 'none',
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        const keep = ['show_deep', 'mode', 'short_mode'],
            max_ups = D.add(buyableEffect('lo', 23).m_hold, buyableEffect('fr', 33).c_hold.pow(tmp.a.change_efficiency)).floor(),
            kept_ups = [...player.m.upgrades];

        kept_ups.length = D.min(kept_ups.length, max_ups).toNumber();

        layerDataReset(this.layer, keep);
        layers.m.ore.items.forEach(item => player.lo.items[item].amount = D.dZero);
        player.m.upgrades.push(...kept_ups);
    },
    branches: ['lo'],
    prestigeNotify() { return !hasUpgrade('m', 22) && player.m.health.gte(tmp.m.ore.health); },
    componentStyles: {
        upgrade: {
            'border-radius': 0,
        }
    },
    autoUpgrade() { return hasChallenge('b', 21) && player.m.auto_upgrade && !tmp.m.deactivated; },
});
