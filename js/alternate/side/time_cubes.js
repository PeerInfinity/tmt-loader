'use strict';

addLayer('tic', {
    name: 'Time Cubes',
    image: './resources/images/cube.svg',
    nodeStyle: {
        'background-repeat': 'no-repeat',
        'background-position': 'center',
        'background-size': 'contain',
    },
    startData() {
        return {
            unlocked: false,
            points: D.dZero,
            invert: false,
            chal: {
                speed: D.dOne,
                time: D.dZero,
            },
        };
    },
    resource: 'time cubes',
    tooltip() { return `Time speed: *${format(tmp.tic.time_speed)}`; },
    layerShown() { return player.tic.unlocked; },
    color: '#FF00FF',
    row: 'side',
    position: 1.5,
    tabFormat: {
        'Generation': {
            content: [
                ['display-text', () => `Base time speed: ${shiftDown ? '[log10(cubes + 10)]' : format(tmp.tic.time_speed)} seconds/s`],
                ['display-text', () => `${layerColor('tic', format(player.tic.points), 'font-size:1.5em;')} (+${layerColor('tic', format(tmp.tic.cubes.gain))} /s) time cubes`],
                'blank',
                ['clickable', 11],
            ],
            unlocked() { return hasChallenge('b', 81); },
        },
        'Seal': {
            content: [
                ['display-text', () => `Base time speed: ${format(tmp.tic.time_speed)} seconds/s`],
                'blank',
                ['layer-proxy', ['b', [['challenge', 81]]]],
            ],
            unlocked() { return !hasChallenge('b', 81) || inChallenge('b', 81); },
        },
    },
    clickables: {
        11: {
            title() {
                if (player.tic.invert) return 'Restore time speed but stop producing time cubes';
                else return 'Reverse time speed but start producing time cubes';
            },
            onClick() { player.tic.invert = !player.tic.invert; },
            canClick() { return player.tic.invert || hasChallenge('b', 81); },
        },
    },
    cubes: {
        gain() {
            if (player.tic.invert && hasChallenge('b', 81)) return D.dOne;
            return D.dZero;
        },
    },
    time_speed(layer) {
        if (!hasChallenge('b', 81) && !inChallenge('b', 81)) return D.dOne;

        let speed = player.tic.points.max(0).add(10).log10();

        const main = [
            'xp', 'm', 't',
            'l', 'lo', 'f',
            'b', 's', 'a',
        ];

        if (main.includes(layer)) speed = speed.pow(tmp.a.change_efficiency);

        if (player.tic.invert) speed = speed.neg();

        if (inChallenge('b', 81)) {
            if (options.noRNG) {
                speed = speed.times(player.tic.chal.time.minus(1));
            } else {
                speed = speed.times(player.tic.chal.speed);
            }
        }

        return speed;
    },
    update(diff) {
        if (inChallenge('b', 81)) {
            player.tic.chal.time = D.add(player.tic.chal.time, diff);
            /** Time limit until a new change */
            const cap = options.noRNG ? 3 : 1;
            if (player.tic.chal.time.gte(cap)) {
                player.tic.chal.speed = D.add(player.tic.chal.speed, Math.random() - .5).max(-1).min(2);
                player.tic.chal.time = D.dZero;
            }
        }
        if (player.tic.invert) {
            addPoints('tic', D.times(tmp.tic.cubes.gain, diff));
        }
    },
    shouldNotify() { return inChallenge('b', 81) && canCompleteChallenge('b', 81); },
});
