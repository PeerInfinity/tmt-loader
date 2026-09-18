'use strict';

addLayer('s', {
    name: 'Shop',
    symbol: 'S',
    startData() {
        return {
            unlocked: false,
            points: D.dZero,
            short_mode: false,
            respecced: false,
        };
    },
    tooltip() {
        if (player.s.short_mode) {
            /** @type {[string, number][]} */
            const coins = formatCoins(player.s.points, layers.s.coins.types.length).map((c, i) => [c, i]).filter(([c]) => (+c) > 0);
            if (!coins.length) coins.push(['0', 0]);
            return coins.map(([c, i]) => `<span style="color:${layers.s.coins.types[i][1]};">${c}</span>`).join(' | ');
        } else {
            return layers.s.coins.format(player.s.points, false, true).join('<br>');
        }
    },
    layerShown() { return (inChallenge('b', 12) || player.s.unlocked) && !tmp.s.deactivated; },
    deactivated() { return inChallenge('b', 31); },
    color: '#DDDD22',
    row: 2,
    position: 1,
    hotkeys: [
        {
            key: 's',
            description: 'S: Reset for coins',
            unlocked() { return tmp.s.layerShown; },
            onPress() { doReset('s'); },
        },
        {
            key: 'S',
            description: 'Shift + S: Display shop layer',
            unlocked() { return tmp.s.layerShown; },
            onPress() { showTab('s'); },
        },
    ],
    tabFormat: {
        'Upgrades': {
            content: [
                ['display-text', () => `You have ${tmp.s.coins.format}`],
                'prestige-button',
                ['display-text', () => `Your items have ${format(tmp.s.baseAmount)} total value`],
                'blank',
                () => {
                    const speed = D.times(layers.clo.time_speed('s'), layers.tic.time_speed('s'));

                    if (speed.neq(1)) return [
                        'column', [
                            ['display-text', `Time speed: *${format(speed)}`],
                            'blank',
                        ],
                    ];
                },
                'blank',
                ['upgrades', [1, 2, 3]],
            ],
        },
        'Loans': {
            content: [
                ['display-text', () => `You have ${tmp.s.coins.format}`],
                'prestige-button',
                'blank',
                ['display-text', () => {
                    const type = {
                        'loan': 'repaid loans',
                        'debt': 'repaid debts',
                        'investment': 'investments',
                    }[tmp.s.investloans.type];
                    return `You have ${formatWhole(tmp.s.investloans.amount)} effective ${type}`;
                }],
                ['display-text', () => {
                    const type = {
                        'loan': 'a loan',
                        'debt': 'a debt',
                        'investment': 'an investment',
                    }[tmp.s.investloans.type];
                    return `<span class="warning">Buying ${type} increases the price of all the others</span>`;
                }],
                () => tmp.s.investloans.use_loans ? undefined : ['display-text', '<span class="warning">Investments are reset on boss reset</span>'],
                'blank',
                ['clickable', 11],
                ['upgrades', [4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 8]],
            ],
            name() { return `${capitalize(tmp.s.investloans.type)}s`; },
        },
    },
    clickables: {
        11: {
            title() { return `Respec ${capitalize(tmp.s.investloans.type)}s`; },
            onClick() {
                if (!confirm(`Doing this will not refund your ${tmp.s.investloans.type}s and will force a Shop reset.\nAre you sure?`)) return;

                player.s.respecced = true;
                player.s.upgrades = player.s.upgrades.filter(id => !layers.s.investloans.is_upg_loan(id));
                doReset('s', true);
            },
            canClick() { return tmp.s.investloans.amount.gt(0); },
        },
    },
    upgrades: {
        //#region Loans/Investments
        41: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Experience ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Experience';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate experience challenge penality';
                if (!shiftDown) return 'Boost experience gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                const pieces = [];
                switch (tmp.s.investloans.type) {
                    case 'loan':
                        if (tmp.xp.layerShown) pieces.push(`/${format(D.add(player.xp.points.max(0), 10).log10())}`);
                        if (tmp.xp_alt.layerShown) pieces.push(`/${format(D.add(player.xp_alt.points.max(0), 10).log10().pow(tmp.a.change_efficiency))}`);
                        return pieces.join('<br>');
                    case 'debt':
                        if (tmp.xp.layerShown) pieces.push(`-${format(D.div(player.xp.points.max(0), 100).floor())}/s`);
                        if (tmp.xp_alt.layerShown) pieces.push(`-${format(D.div(player.xp_alt.points.max(0), 100).pow(tmp.a.change_efficiency).floor())}/s`);
                        return pieces.join('<br>');
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
        },
        42: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Kills ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Kills';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate kills challenge penality';
                if (!shiftDown) return 'Boost kills gain based on investments owned';
                let formula = 'investments / 100 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 100).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(tmp.xp.total.kills.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(tmp.xp.total.kills.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
            unlocked() { return tmp.xp.layerShown; },
        },
        43: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Levels ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Levels';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate levels challenge penality';
                if (!shiftDown) return 'Reduce level cost based on investments owned';
                let formula = 'investments / 5 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 5).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `cost *${format(D.add(player.l.points.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.l.points.max(0), 100).floor())}/s`;
                    case 'investment': return `cost /${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
            unlocked() { return tmp.l.layerShown; },
        },
        51: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Slime Goo ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Slime Goo';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate slime goo challenge penality';
                if (!shiftDown) return 'Boost slime goo gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.slime_goo.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.slime_goo.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
        },
        52: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Slime Core Shards ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Slime Core Shards';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate slime core shards challenge penality';
                if (!shiftDown) return 'Boost slime core shard gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.slime_core_shard.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.slime_core_shard.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
        },
        53: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Slime Cores ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Slime Cores';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate slime cores challenge penality';
                if (!shiftDown) return 'Boost slime core gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.slime_core.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.slime_core.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
        },
        61: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Stone ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Stone';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate stone challenge penality';
                if (!shiftDown) return 'Boost stone gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.stone.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.stone.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
        },
        62: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Copper Ore ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Copper Ore';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate copper ore challenge penality';
                if (!shiftDown) return 'Boost copper ore gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.copper_ore.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.copper_ore.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
        },
        63: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Tin Ore ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Tin Ore';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate tin ore challenge penality';
                if (!shiftDown) return 'Boost tin ore gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.tin_ore.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.tin_ore.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
        },
        71: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Red Fabric ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Red Fabric';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate red fabric challenge penality';
                if (!shiftDown) return 'Boost red fabric gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.red_fabric.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.red_fabric.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
        },
        72: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Pyrite Coin ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Pyrite Coins';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate pyrite coin challenge penality';
                if (!shiftDown) return 'Boost pyrite coin gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.pyrite_coin.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.pyrite_coin.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
        },
        73: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Rusty Gear ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Rusty Gears';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate rusty gear challenge penality';
                if (!shiftDown) return 'Boost rusty gear gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.rusty_gear.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.rusty_gear.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
        },
        81: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Boss ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Bosses';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Allows completion of the challenge';
                if (!shiftDown) return 'Boost investments amount by bosses';
                let formula = 'bosses';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dZero;
                return player.b.points;
            },
            effectDisplay() {
                if (tmp.s.investloans.use_loans) return '';
                return `+${format(upgradeEffect(this.layer, this.id))}`;
            },
            cost() {
                let cost = D(1.5).pow(layers.s.investloans.amount(true).add(4));

                if (inChallenge('b', 32)) cost = cost.times(2);

                return powerRound(cost, 100);
            },
            style() {
                let width = '360px';

                if (inChallenge('b', 32) || hasChallenge('b', 32)) width = '600px';

                return { width };
            },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
        },
        91: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Rotten Flesh ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Rotten Flesh';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate rotten flesh challenge penality';
                if (!shiftDown) return 'Boost rotten flesh gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.rotten_flesh.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.rotten_flesh.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
            unlocked() { return hasChallenge('b', 32) || inChallenge('b', 32); },
        },
        92: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Brain ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Brains';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate brain challenge penality';
                if (!shiftDown) return 'Boost brain gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.brain.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.brain.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
            unlocked() { return hasChallenge('b', 32) || inChallenge('b', 32); },
        },
        101: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Coal ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Coal';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate coal challenge penality';
                if (!shiftDown) return 'Boost coal gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.coal.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.coal.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
            unlocked() { return (hasChallenge('b', 32) || inChallenge('b', 32)) && player.m.show_deep; },
        },
        102: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Iron Ore ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Iron Ore';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate iron ore challenge penality';
                if (!shiftDown) return 'Boost iron ore gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.iron_ore.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.iron_ore.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
            unlocked() { return hasChallenge('b', 32) || inChallenge('b', 32); },
        },
        103: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Gold Ore ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Gold Ore';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate gold ore challenge penality';
                if (!shiftDown) return 'Boost gold ore gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.gold_ore.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.gold_ore.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
            unlocked() { return (hasChallenge('b', 32) || inChallenge('b', 32)) && player.m.show_deep; },
        },
        111: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Soaked Log ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Soaked Logs';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate soaked log challenge penality';
                if (!shiftDown) return 'Boost soaked log gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.soaked_log.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.soaked_log.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
            unlocked() { return (hasChallenge('b', 32) || inChallenge('b', 32)) && tmp.t.layerShown; },
        },
        112: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Normal Log ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Normal Logs';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate normal log challenge penality';
                if (!shiftDown) return 'Boost normal log gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.normal_log.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.normal_log.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
            unlocked() { return (hasChallenge('b', 32) || inChallenge('b', 32)) && (tmp.t.layerShown || tmp.c.layerShown); },
        },
        113: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Plank ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Planks';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate plank challenge penality';
                if (!shiftDown) return 'Boost plank gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.plank.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.plank.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
            unlocked() { return (hasChallenge('b', 32) || inChallenge('b', 32)) && (tmp.t.layerShown || tmp.c.layerShown); },
        },
        121: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Heat ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Heat';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate heat challenge penality';
                if (!shiftDown) return 'Boost heat gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.f.points.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.f.points.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
            unlocked() { return (hasChallenge('b', 32) || inChallenge('b', 32)) && tmp.f.layerShown; },
        },
        122: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Bronze Ingot ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Bronze Ingots';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate bronze ingot challenge penality';
                if (!shiftDown) return 'Boost bronze ingot gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.bronze_ingot.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.bronze_ingot.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
            unlocked() { return (hasChallenge('b', 32) || inChallenge('b', 32)) && player.f.alloys; },
        },
        123: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Steel Ingot ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Steel Ingots';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate steel ingot challenge penality';
                if (!shiftDown) return 'Boost steel ingot gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.steel_ingot.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.steel_ingot.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
            unlocked() { return (hasChallenge('b', 32) || inChallenge('b', 32)) && player.f.alloys; },
        },
        131: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Stone Brick ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Stone Bricks';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate stone brick challenge penality';
                if (!shiftDown) return 'Boost stone brick gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.stone_brick.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.stone_brick.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
            unlocked() { return (hasChallenge('b', 32) || inChallenge('b', 32)) && tmp.f.layerShown; },
        },
        132: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Copper Ingot ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Copper Ingots';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate copper ingot challenge penality';
                if (!shiftDown) return 'Boost copper ingot gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.copper_ingot.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.copper_ingot.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
            unlocked() { return (hasChallenge('b', 32) || inChallenge('b', 32)) && tmp.f.layerShown; },
        },
        133: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Tin Ingot ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Tin Ingots';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate tin ingot challenge penality';
                if (!shiftDown) return 'Boost tin ingot gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.tin_ingot.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.tin_ingot.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
            unlocked() { return (hasChallenge('b', 32) || inChallenge('b', 32)) && tmp.f.layerShown; },
        },
        141: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Iron Ingot ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Iron Ingots';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate iron ingot challenge penality';
                if (!shiftDown) return 'Boost iron ingot gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.iron_ingot.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.iron_ingot.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
            unlocked() { return (hasChallenge('b', 32) || inChallenge('b', 32)) && tmp.f.layerShown; },
        },
        142: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Gold Ingot ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Gold Ingots';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate gold ingot challenge penality';
                if (!shiftDown) return 'Boost gold ingot gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.gold_ingot.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.gold_ingot.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
            unlocked() { return (hasChallenge('b', 32) || inChallenge('b', 32)) && tmp.f.layerShown; },
        },
        143: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Holy Water ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Holy Water';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate holy water challenge penality';
                if (!shiftDown) return 'Boost holy water gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.holy_water.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.holy_water.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
            unlocked() { return (hasChallenge('b', 32) || inChallenge('b', 32)) && tmp.lo.items.holy_water.unlocked; },
        },
        151: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Leaf ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Leaves';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate leaf challenge penality';
                if (!shiftDown) return 'Boost leaf gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.leaf.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.leaf.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
            unlocked() { return (hasChallenge('b', 32) || inChallenge('b', 32)) && hasChallenge('b', 21); },
        },
        152: {
            title() {
                if (tmp.s.investloans.use_loans) return `Repay Seed ${capitalize(tmp.s.investloans.type)}`;
                return 'Invest in Seeds';
            },
            description() {
                if (tmp.s.investloans.use_loans) return 'Negate seed challenge penality';
                if (!shiftDown) return 'Boost seed gain based on investments owned';
                let formula = 'investments / 10 + 1';

                return `Formula: ${formula}`;
            },
            effect() {
                if (tmp.s.investloans.use_loans) return D.dOne;
                return D.div(tmp.s.investloans.amount, 10).add(1);
            },
            effectDisplay() {
                switch (tmp.s.investloans.type) {
                    case 'loan': return `/${format(D.add(player.lo.items.seed.amount.max(0), 10).log10())}`;
                    case 'debt': return `-${format(D.div(player.lo.items.seed.amount.max(0), 100).floor())}/s`;
                    case 'investment': return `*${format(upgradeEffect(this.layer, this.id))}`;
                }
            },
            cost() { return powerRound(D(1.5).pow(layers.s.investloans.amount(true)), 100); },
            costDisplay() { return `Cost: ${layers.s.coins.format(tmp[this.layer].upgrades[this.id].cost, false)}`; },
            unlocked() { return (hasChallenge('b', 32) || inChallenge('b', 32)) && hasChallenge('b', 21); },
        },
        //#endregion Loans/Investments
        //#region Normal upgrades
        11: {
            title: 'Mining Map',
            description: 'Mining chance is rooted, and it can go above 1',
            cost: D.dOne,
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost, false)}`; },
            effect() {
                let root = D(3);

                if (hasUpgrade('s', 33)) root = root.add(upgradeEffect('s', 33));

                return root;
            },
            effectDisplay() { return `${format(upgradeEffect(this.layer, this.id))}√`; },
        },
        12: {
            title: 'Multi-Level Marketing',
            description() {
                if (!shiftDown) return 'Levels boost coins gain';

                let formula = '2√(levels + 1)';

                return `Formula: ${formula}`;
            },
            cost: D(2),
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost, false)}`; },
            effect() {
                let mult = player.l.points.add(1).root(2);

                return mult;
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
        },
        13: {
            title: 'Blueprint Makers',
            description() {
                if (!shiftDown) return 'Shop upgrades reduce loot crafting costs';

                let formula = '0.95^upgrades';

                return `Formula: ${formula}`;
            },
            cost: D(5),
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost, false)}`; },
            effect() {
                let mult = D(.95).pow(player.s.upgrades.filter(id => !layers.s.investloans.is_upg_loan(id)).length);

                return mult;
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
        },
        21: {
            title: 'Shiny Sword',
            description() {
                if (!shiftDown) return 'Coins boost damage';

                let formula = 'log8(coins + 8)';

                return `Formula: ${formula}`;
            },
            cost: D(10),
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost, false)}`; },
            effect() {
                let mult = player.s.points.max(0).add(8).log(8);

                if (hasUpgrade('s', 33)) mult = mult.add(upgradeEffect('s', 33));

                return mult;
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
        },
        22: {
            title: 'Crafting Tools',
            description() {
                return `Allows getting items and crafting with metals.<br>\
                Changes the effect of ${layerColor('lo', tmp.lo.upgrades[11].title)} and ${layerColor('m', tmp.m.upgrades[33].title)}'s formula`;
            },
            cost: D(25),
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost, false)}`; },
        },
        23: {
            title: 'Book of Skills',
            description: 'Skill points are stronger',
            cost: D(50),
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost, false)}`; },
            effect() {
                let mult = D(2);

                mult = mult.add(tmp.l.skills.reading.effect);

                return mult;
            },
            effectDisplay() { return `*${format(upgradeEffect(this.layer, this.id))}`; },
        },
        31: {
            title: 'Crafting Quality Improvements',
            description: 'Increase item values',
            effect() {
                let add = D(1);

                if (hasUpgrade('s', 33)) add = add.times(upgradeEffect('s', 33));

                return add;
            },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id))} value`; },
            cost: D(100),
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost, false)}`; },
        },
        32: {
            title: 'Cash Shop',
            description() {
                if (!shiftDown) return `${tmp.s.investloans.use_loans ? 'Loans' : 'Investments'} decrease level costs`;

                let formula = `2√(${tmp.s.investloans.use_loans ? 'loans' : 'investments'} + 2)`;

                return `Formula: ${formula}`;
            },
            effect() { return tmp.s.investloans.amount.add(2).root(2); },
            effectDisplay() { return `/${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(300),
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost, false)}`; },
        },
        33: {
            title: 'Better Paper',
            description: 'Increase effects of first column of upgrades',
            effect() { return D(1); },
            effectDisplay() { return `+${format(upgradeEffect(this.layer, this.id))}`; },
            cost: D(750),
            costDisplay() { return `Cost: ${layers.s.coins.format(this.cost, false)}`; },
        },
        //#endregion Normal upgrades
    },
    type: 'normal',
    baseAmount() { return D.add(tmp.lo.items["*"].value, tmp.k.dishes['*'].value); },
    baseResource: 'crafts total value',
    requires: D(100),
    exponent: D(.5),
    prestigeButtonText() {
        const next = player.s.points.gte(100) || getResetGain('s').gte(1_000) ? '' : `<br>Next at ${format(getNextAt('s'))} total value`;
        return `Sell your items for ${layers.s.coins.format(getResetGain('s'), false)}${next}`;
    },
    coins: {
        types: [['copper', '#BB7733'], ['bronze', '#C4995E'], ['iron', '#CCCCCC'], ['gold', '#FFDD00'], ['platinum', '#CCCCFF']],
        format(amount = player.s.points, color = true, split = false) {
            /** @type {[string, number][]} */
            const coins = formatCoins(amount, this.types.length).map((c, i) => [c, i]).filter(([c]) => (+c) > 0);
            if (!coins.length) coins.push(['0', 0]);
            const lines = coins.map(([c, i]) => {
                return `<span${color ? ` style="color:${this.types[i][1]};font-size:1.5em;text-shadow:${this.types[i][1]} 0 0 10px;font-family:'Lucida Console', 'Courier New', monospace;"` : ''}>${c}</span> ${this.types[i][0]} coins`;
            }).reverse();
            if (split) return lines;
            return listFormat.format(lines);
        },
    },
    investloans: {
        amount(real = false) {
            let amount = D(player.s.upgrades.filter(id => id >= 41).length);

            if (!real && hasUpgrade('s', 81)) amount = amount.add(upgradeEffect('s', 81));

            return amount;
        },
        use_loans() { return inChallenge('b', 12) || inChallenge('b', 32); },
        type() {
            if (inChallenge('b', 12)) return 'loan';
            if (inChallenge('b', 32)) return 'debt';
            return 'investment';
        },
        item_upgrade: {
            'slime_goo': 51, 'slime_core_shard': 52, 'slime_core': 53,
            'stone': 61, 'copper_ore': 62, 'tin_ore': 63,
            'red_fabric': 71, 'pyrite_coin': 72, 'rusty_gear': 73,
            'rotten_flesh': 91, 'brain': 92,
            'coal': 101, 'iron_ore': 102, 'gold_ore': 103,
            'soaked_log': 111, 'normal_log': 112, 'plank': 113,
            'bronze_ingot': 122, 'steel_ingot': 123,
            'stone_brick': 131, 'copper_ingot': 132, 'tin_ingot': 133,
            'iron_ingot': 141, 'gold_ingot': 142, 'holy_water': 143,
            'leaf': 151, 'seed': 152,
        },
        is_upg_loan(id) {
            if (!id) return false;

            return id >= 41;
        },
    },
    branches: [() => tmp.lo.layerShown ? 'lo' : ['k', 3]],
    gainMult() {
        let mult = D.dOne;

        if (hasUpgrade('s', 12)) mult = mult.times(upgradeEffect('s', 12));

        mult = mult.times(buyableEffect('lo', 32).coin_mult);

        if (hasUpgrade('m', 63)) mult = mult.times(upgradeEffect('m', 63));

        mult = mult.times(tmp.l.skills.bartering.effect);

        mult = mult.times(buyableEffect('fr', 23));

        return mult;
    },
    doReset(layer) {
        if (layers[layer].row <= this.row) return;

        /** @type {number[]} */
        const kept_upgrades = [];
        if (layer == 'b') {
            // Keep non investments
            kept_upgrades.push(...player.s.upgrades.filter(id => !layers.s.investloans.is_upg_loan(id)));
        }

        layerDataReset(this.layer, []);

        player.s.upgrades.push(...kept_upgrades);
    },
});
