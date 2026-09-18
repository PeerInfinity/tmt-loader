'use strict';

// Special layer for fighting the star
addLayer('star', {
    row: 0,
    position: 999,
    startData() {
        return {
            unlocked: true,
            points: D.dZero,
            targets: [],
            time: D.dZero,
            auto_leave: true,
        };
    },
    type: 'none',
    nodeStyle: { 'display': 'none', },
    layerShown: false,
    color() { return tmp.xp.enemies.star.color; },
    tabFormat: {
        'Star': {
            name() { return capitalize(player.xp.enemies.star.name); },
            content: [
                [
                    'display-text',
                    () => {
                        const kill_style = (text, ...style) => `<span style="color:${tmp.xp.color_kill};text-shadow:${tmp.xp.color_kill} 0 0 10px;${style.join(';')}">${text}</span>`,
                            kill_pieces = [];
                        if (tmp.xp.total.kills.neq(player.xp.enemies.star.kills)) {
                            kill_pieces.push(kill_style(`<span title="Kills from the current enemy">${format(player.xp.enemies.star.kills)}</span>`));
                        }
                        if (tmp.xp.enemies.star.kills.neq(1)) {
                            kill_pieces.push(kill_style(`+${format(tmp.xp.enemies.star.kills)}`));
                        }

                        const kill_text = kill_pieces.length ? ` (${kill_pieces.join(', ')})` : '';

                        return `You have <span style="color:${tmp.xp.enemies.star.color};text-shadow:${tmp.xp.enemies.star.color} 0 0 10px;font-size:1.5em;">\
                            ${format(player.lo.items.stardust.amount)}</span> ${capitalize(tmp.lo.items.stardust.name)}\
                            and ${kill_style(formatWhole(tmp.xp.total.kills), 'font-size: 1.5em')}${kill_text} kills\
                            </span>`;
                    }
                ],
                'blank',
                ['bar', 'health'],
                'blank',
                ['bar', 'time'],
                'grid',
                'blank',
                ['row', [
                    ['display-text', 'Leave fight on kill'],
                    'blank',
                    ['toggle', ['star', 'auto_leave']],
                ]],
                ['clickable', 11],
            ],
        },
    },
    bars: {
        health: {
            direction: RIGHT,
            width: 200,
            height: 50,
            progress() {
                const max = tmp.xp.enemies.star.health;
                return D.div(player.xp.enemies.star.health ?? max, max);
            },
            display() {
                let text = `${format(player.xp.enemies.star.health)} / ${format(tmp.xp.enemies.star.health)}`;

                const regen = tmp.xp.enemies.star.regen;
                if (regen.gt(0)) {
                    text += `<br>(+${format(regen)} /s)`;
                }

                return text;
            },
            baseStyle: { 'background-color': 'transparent', },
            fillStyle: { 'background-color'() { return tmp.xp.enemies.star.color }, },
            textStyle: { 'color': 'black', 'text-shadow': 'white 0 0 20px', },
        },
        time: {
            direction: RIGHT,
            width: 200,
            height: 50,
            progress() {
                const max = tmp.star.star.time;
                return D.div(player.star.time ?? max, max);
            },
            display() { return `${formatTime(player.star.time)} / ${formatTime(tmp.star.star.time)}`; },
            baseStyle: { 'background-color': 'darkred', },
            fillStyle: { 'background-color': 'darkblue', },
            textStyle: { 'color': 'white', },
        },
    },
    clickables: {
        11: {
            style: { 'background-image': `url('./resources/images/exit-door.svg')`, },
            canClick: true,
            onClick() {
                showNavTab('tree-tab');
                showTab(tmp.xp.layerShown ? 'xp' : 'a');
                player.star.time = tmp.star.star.time;
            },
            tooltip: 'Escape the star and return to XP',
        },
    },
    star: {
        time() {
            let base_time = D(5);

            if (hasUpgrade('xp_alt', 33)) base_time = base_time.add(upgradeEffect('xp_alt', 33));

            base_time = base_time.add(tmp.k.dishes.star_crunch.effect.time);

            let time = D.div(base_time, D.add(tmp.xp.enemies.star.level, 1).pow(2).max(1));

            time = time.times(tmp.p.plants.starflower.effect);

            if (hasMilestone('to', 4)) time = time.times(tmp.to.milestones[4].effect);

            return time;
        },
        size() { return D(3).add(tmp.xp.enemies.star.level).min(10).max(1).floor(); },
        targets() {
            let targets = D.add(tmp.xp.enemies.star.level, 1);

            return targets.max(1);
        },
    },
    grid: {
        maxCols: 10,
        maxRows: 10,
        cols() { return tmp.star.star.size.toNumber(); },
        rows() { return tmp.star.star.size.toNumber(); },
        getStartData() { return {}; },
        getStyle(_, id) {
            if (player.star.targets.includes(id)) {
                return { 'background-color': 'brown', };
            } else {
                return { 'background-color': 'orange', };
            }
        },
        getCanClick(_, id) { return player.star.targets.includes(id); },
        onClick(_, id) {
            if (player.star.targets.includes(id)) {
                player.xp.clicked = true;
                player.xp.enemies.star.health = D.minus(player.xp.enemies.star.health, 1);
                player.star.time = tmp.star.star.time;

                if (player.star.auto_leave && D.lte(player.xp.enemies.star.health, 0)) {
                    showNavTab('tree-tab');
                    showTab(tmp.xp.layerShown ? 'xp' : 'a');
                } else {
                    player.star.targets = [];
                    for (let i = 0; D.lt(i, tmp.star.star.targets); i++) {
                        const col = Math.floor(Math.random() * tmp.star.grid.cols) + 1,
                            row = Math.floor(Math.random() * tmp.star.grid.rows) + 1;
                        player.star.targets.push(row * 100 + col);
                    }
                }
            }
        },
    },
    update(diff) {
        if (player.navTab != this.layer && player.tab != this.layer) return;

        player.star.time = D.minus(player.star.time, diff);

        if (D.lte(player.star.time, 0)) {
            player.star.time = tmp.star.star.time;
            player.star.targets = [];
            for (let i = 0; D.lt(i, tmp.star.star.targets); i++) {
                const col = Math.floor(Math.random() * tmp.star.grid.cols) + 1,
                    row = Math.floor(Math.random() * tmp.star.grid.rows) + 1;
                player.star.targets.push(row * 100 + col);
            }
        }
    },
});
