'use strict';

addLayer('ach', {
    name: 'Achievements',
    symbol: '⭐',
    startData() {
        return {
            unlocked: true,
            short_mode: false,
        };
    },
    color: '#FFFF00',
    row: 'side',
    resource: 'achievements',
    type: 'none',
    position: 0,
    layerShown() { return !hasUpgrade('a', 14); },
    tabFormat: {
        'Achievements': {
            content: [
                ['display-text', () => `You have ${formatWhole(layers.ach.ownedAchievements())} / ${formatWhole(layers.ach.totalAchievements())} achievements`],
                ['row', [
                    ['display-text', 'Short tooltip mode'],
                    'blank',
                    ['toggle', ['ach', 'short_mode']]
                ]],
                'blank',
                ['achievements', () => layers.ach.getAchievementsRows()],
            ],
        },
        'Bonus': {
            content: [
                ['display-text', () => `You have ${formatWhole(layers.ach.ownedAchievements('bonus'))} / ${formatWhole(layers.ach.totalAchievements('bonus'))} bonus achievements`],
                ['row', [
                    ['display-text', 'Short tooltip mode'],
                    'blank',
                    ['toggle', ['ach', 'short_mode']]
                ]],
                'blank',
                ['achievements', () => layers.ach.getAchievementsRows('bonus')],
            ],
            unlocked() { return layers.ach.totalAchievements('bonus').gte(1); },
            buttonStyle: {
                'border-color': 'rgb(0,127,255)',
            },
            name: 'Bonus Achievements',
        },
        'Secrets': {
            content: [
                ['display-text', () => `You have ${formatWhole(layers.ach.ownedAchievements('secret'))} secret achievements`],
                ['row', [
                    ['display-text', 'Short tooltip mode'],
                    'blank',
                    ['toggle', ['ach', 'short_mode']]
                ]],
                'blank',
                ['achievements', () => layers.ach.getAchievementsRows('secret')],
            ],
            unlocked() {
                return layers.ach.ownedAchievements('secret').gte(1);
            },
            buttonStyle: {
                'border-color': 'rgb(127,0,255)',
            },
            name: 'Secret Achievements',
        },
    },
    achievements: {
        //#region Normal achievements
        11: {
            name: 'Murderer',
            tooltip: 'Kill an innocent slime',
            done() { return player.xp.enemies.slime.kills.gte(1); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.xp.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.xp.color;
                return s;
            },
        },
        12: {
            name: 'Tougher enemies',
            tooltip: 'Get your slimes to level 1',
            done() { return tmp.xp.enemies['slime'].level.gte(1); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.xp.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.xp.color;
                return s;
            },
        },
        13: {
            name: 'Passive damage',
            tooltip: 'Build a sword trap',
            done() { return hasUpgrade('xp', 22); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.xp.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.xp.color;
                return s;
            },
        },
        14: {
            name: 'Reapply',
            tooltip: 'Reapply your first 3 upgrades\' effects',
            done() { return hasUpgrade('xp', 32); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.xp.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.xp.color;
                return s;
            },
        },
        15: {
            name: 'A quarter of a thousand',
            tooltip: 'Kill 250 innocent slimes',
            done() { return player.xp.enemies.slime.kills.gte(250); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.xp.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.xp.color;
                return s;
            },
        },
        31: {
            name: 'Level up!',
            tooltip: 'Gain a level',
            done() { return player.l.points.gte(1); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.l.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.l.color;
                return s;
            },
            unlocked() { return tmp.l.layerShown; },
        },
        32: {
            name: 'Trained attack',
            tooltip() { return `Get 10 levels of ${(tmp.l.skills.attacking.unlocked || hasAchievement(this.layer, this.id)) ? tmp.l.skills.attacking.name : '???'}`; },
            done() { return player.l.skills.attacking.level.gte(10); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.l.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.l.color;
                return s;
            },
            unlocked() { return tmp.l.layerShown; },
        },
        33: {
            name: 'Learned to learn',
            tooltip() { return `Get 10 levels of ${(tmp.l.skills.learning.unlocked || hasAchievement(this.layer, this.id)) ? tmp.l.skills.learning.name : '???'}`; },
            done() { return player.l.skills.learning.level.gte(10); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.l.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.l.color;
                return s;
            },
            unlocked() { return tmp.l.layerShown; },
        },
        34: {
            name: 'Back for blood',
            tooltip() { return `Get 10 levels of ${(tmp.l.skills.vampirism.unlocked || hasAchievement(this.layer, this.id)) ? tmp.l.skills.vampirism.name : '???'}`; },
            done() { return player.l.skills.vampirism.level.gte(10); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.l.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.l.color;
                return s;
            },
            unlocked() { return tmp.l.layerShown; },
        },
        35: {
            name: 'Advanced reading techniques',
            tooltip() { return `Get 10 levels of ${(tmp.l.skills.reading.unlocked || hasAchievement(this.layer, this.id)) ? tmp.l.skills.reading.name : '???'}`; },
            done() { return player.l.skills.reading.level.gte(10); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.l.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.l.color;
                return s;
            },
            unlocked() { return tmp.l.layerShown; },
        },
        51: {
            name: 'Sweet loot',
            tooltip: 'Get an item',
            done() { return tmp.lo.items["*"].amount.gte(1); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.lo.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.lo.color;
                return s;
            },
            unlocked() { return tmp.lo.layerShown; },
        },
        52: {
            name: 'Slime formation',
            tooltip: 'Make a book of slimes',
            done() { return getBuyableAmount('lo', 11).gte(1); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.lo.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.lo.color;
                return s;
            },
            unlocked() { return tmp.lo.layerShown; },
        },
        53: {
            name: 'Keep killing',
            tooltip: 'Keep your sword trap',
            done() { return hasUpgrade('xp', 22) && buyableEffect('lo', 12).xp_hold.gte(player.xp.upgrades.indexOf(22) + 1); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.lo.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.lo.color;
                return s;
            },
            unlocked() { return tmp.lo.layerShown; },
        },
        54: {
            name: 'Another trap',
            tooltip: 'Make a sticky trap',
            done() { return getBuyableAmount('lo', 13).gte(1); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.lo.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.lo.color;
                return s;
            },
            unlocked() { return tmp.lo.layerShown; },
        },
        55: {
            name: 'Full passive',
            tooltip: 'Keep all experience upgrades',
            done() { return buyableEffect('lo', 12).xp_hold.gte(9); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.lo.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.lo.color;
                return s;
            },
            unlocked() { return tmp.lo.layerShown; },
        },
        71: {
            name: '>:(',
            tooltip: 'Fight the first boss',
            done() { return activeChallenge('b') == 11; },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.b.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.b.color;
                return s;
            },
            unlocked() { return tmp.b.layerShown; },
        },
        72: {
            name: 'Calm before the storm',
            tooltip: 'Defeat the Slime King',
            done() { return hasChallenge('b', 11); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.b.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.b.color;
                return s;
            },
            unlocked() { return tmp.b.layerShown; },
        },
        73: {
            name: 'Stonks',
            tooltip() {
                if (player.b.points.lt(2)) return 'Defeat ???';
                return 'Defeat the goblin CEO';
            },
            done() { return hasChallenge('b', 12); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.b.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.b.color;
                return s;
            },
            unlocked() { return tmp.b.layerShown; },
        },
        74: {
            name: 'Diligent',
            tooltip() {
                if (player.b.points.lt(3)) return 'Defeat ???';
                return 'Defeat the eternal lich';
            },
            done() { return hasChallenge('b', 21); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.b.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.b.color;
                return s;
            },
            unlocked() { return tmp.b.layerShown; },
        },
        75: {
            name: 'Hungry for more',
            tooltip() {
                if (player.b.points.lt(4)) return 'Destroy ???';
                return 'Destroy the kudzu';
            },
            done() { return hasChallenge('b', 22); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.b.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.b.color;
                return s;
            },
            unlocked() { return tmp.b.layerShown; },
        },
        111: {
            name: 'Rock and stone',
            tooltip: 'Mine something',
            done() { return ['stone', 'copper_ore', 'tin_ore'].some(id => D.gte(player.lo.items[id].amount, 1)); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.m.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.m.color;
                return s;
            },
            unlocked() { return tmp.m.layerShown; },
        },
        112: {
            name: 'Autonomous',
            tooltip: 'Get a drill',
            done() { return hasUpgrade('m', 22); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.m.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.m.color;
                return s;
            },
            unlocked() { return tmp.m.layerShown; },
        },
        114: {
            name: 'Permanent mark',
            tooltip: 'Get a stone tablet',
            done() { return hasUpgrade('m', 31); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.m.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.m.color;
                return s;
            },
            unlocked() { return tmp.m.layerShown; },
        },
        113: {
            name: 'More stone',
            tooltip: 'Get a filter',
            done() { return hasUpgrade('m', 32); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.m.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.m.color;
                return s;
            },
            unlocked() { return tmp.m.layerShown; },
        },
        115: {
            name: 'Anvil',
            tooltip: 'Start crafting stone items',
            done() { return hasUpgrade('m', 33); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.m.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.m.color;
                return s;
            },
            unlocked() { return tmp.m.layerShown; },
        },
        121: {
            name: 'Heating up',
            tooltip: 'Get a stone furnace',
            done() { return getBuyableAmount('lo', 21).gte(1); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.lo.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.lo.color;
                return s;
            },
            unlocked() { return tmp.m.layerShown; },
        },
        122: {
            name: 'The helper we never got',
            tooltip: 'Get a copper golem',
            done() { return getBuyableAmount('lo', 22).gte(1); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.lo.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.lo.color;
                return s;
            },
            unlocked() { return tmp.m.layerShown; },
        },
        123: {
            name: 'A bigger can',
            tooltip: 'Get a tin chest',
            done() { return getBuyableAmount('lo', 23).gte(1); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.lo.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.lo.color;
                return s;
            },
            unlocked() { return tmp.m.layerShown; },
        },
        124: {
            name: 'Stay passive',
            tooltip: 'Get enough tin chests to keep Copper Drill',
            done() { return hasUpgrade('m', 22) && buyableEffect('lo', 23).m_hold.gt(player.m.upgrades.indexOf(22)); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.lo.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.lo.color;
                return s;
            },
            unlocked() { return tmp.m.layerShown; },
        },
        125: {
            name: 'Off to never visit again',
            tooltip: 'Keep all mining upgrades',
            done() { return buyableEffect('lo', 23).m_hold.gte(9); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.lo.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.lo.color;
                return s;
            },
            unlocked() { return tmp.m.layerShown; },
        },
        131: {
            name: 'Real money',
            tooltip: 'Get a coin',
            done() { return player.s.points.gte(1); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.s.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.s.color;
                return s;
            },
            unlocked() { return tmp.s.layerShown; },
        },
        132: {
            name: 'Scammer',
            tooltip: 'Start a MLM',
            done() { return hasUpgrade('s', 12); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.s.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.s.color;
                return s;
            },
            unlocked() { return tmp.s.layerShown; },
        },
        133: {
            name: 'Keep on crafting',
            tooltip: 'Buy crafting tools',
            done() { return hasUpgrade('s', 22); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.s.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.s.color;
                return s;
            },
            unlocked() { return tmp.s.layerShown; },
        },
        134: {
            name: 'Trickled Down',
            tooltip: 'Get your cheaper levels',
            done() { return hasUpgrade('s', 32); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.s.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.s.color;
                return s;
            },
            unlocked() { return tmp.s.layerShown; },
        },
        135: {
            name: 'More Investments',
            tooltip: 'Get the strongest investment',
            done() { return !inChallenge('b', 12) && !inChallenge('b', 32) && hasUpgrade('s', 81); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.s.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.s.color;
                return s;
            },
            unlocked() { return tmp.s.layerShown; },
        },
        151: {
            name: 'Deeper down',
            tooltip: 'Go deeper in the earth',
            done() { return player.m.mode == 'deep'; },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.m.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.m.color;
                return s;
            },
            unlocked() { return player.m.show_deep; },
        },
        152: {
            name: 'Carbon mining',
            tooltip: 'Get a coal pickaxe',
            done() { return hasUpgrade('m', 41); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.m.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.m.color;
                return s;
            },
            unlocked() { return player.m.show_deep; },
        },
        153: {
            name: 'Fake coins',
            tooltip: 'Get some more fake coins to sell',
            done() { return hasUpgrade('m', 63); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.m.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.m.color;
                return s;
            },
            unlocked() { return player.m.show_deep; },
        },
        154: {
            name: 'Gold pile (empty)',
            tooltip: 'Get a free pile of gold',
            done() { return getBuyableAmount('lo', 53).gt(0); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.m.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.m.color;
                return s;
            },
            unlocked() { return player.m.show_deep; },
        },
        155: {
            name: 'Free crafts',
            tooltip: 'Get bonus levels to crafted items',
            done() { return Object.keys(layers.lo.buyables).filter(id => !isNaN(id)).some(id => tmp.lo.buyables[+id].bonusAmount?.gt(0)); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.m.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.m.color;
                return s;
            },
            unlocked() { return player.m.show_deep; },
        },
        161: {
            name: 'Bigger trees',
            tooltip: 'Increase tree sizes',
            done() { return hasUpgrade('t', 11); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.t.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.t.color;
                return s;
            },
            unlocked() { return tmp.t.layerShown; },
        },
        162: {
            name: 'I hope it\'s a ratio of 1:4', // No it's not
            tooltip: 'Start making planks',
            done() { return hasUpgrade('t', 12); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.t.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.t.color;
                return s;
            },
            unlocked() { return tmp.t.layerShown; },
        },
        163: {
            name: 'Safety first',
            tooltip: 'Build a mineshaft',
            done() { return hasUpgrade('t', 23); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.t.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.t.color;
                return s;
            },
            unlocked() { return tmp.t.layerShown; },
        },
        164: {
            name: 'Professionnal swindler',
            tooltip: 'Get bartering to level 10',
            done() { return player.l.skills.bartering.level.gte(10); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.l.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.l.color;
                return s;
            },
            unlocked() { return tmp.t.layerShown; },
        },
        165: {
            name: 'Just like a monarchy',
            tooltip: 'Make a plank ruler',
            done() { return getBuyableAmount('lo', 63).gte(1); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.t.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.t.color;
                return s;
            },
            unlocked() { return tmp.t.layerShown; },
        },
        171: {
            name: 'Fire in the hole',
            tooltip: 'Burn something',
            done() { return player.f.points.gt(0); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.f.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.f.color;
                return s;
            },
            unlocked() { return tmp.f.layerShown; },
        },
        172: {
            name: 'Better minerals',
            tooltip: 'Smelt an ingot',
            done() { return ['copper_ingot', 'iron_ingot', 'tin_ingot', 'gold_ingot'].some(item => D.gt(player.lo.items[item].amount, 0)); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.f.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.f.color;
                return s;
            },
            unlocked() { return tmp.f.layerShown; },
        },
        173: {
            name: 'Horizon',
            tooltip: 'Make an alloy',
            done() { return ['bronze_ingot', 'steel_ingot'].some(item => D.gt(player.lo.items[item].amount, 0)); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.f.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.f.color;
                return s;
            },
            unlocked() { return tmp.f.layerShown; },
        },
        174: {
            name: 'Improved tooling',
            tooltip: 'Make alloy tools',
            done() { return player.f.upgrades.some(id => id > 20); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.f.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.f.color;
                return s;
            },
            unlocked() { return tmp.f.layerShown; },
        },
        175: {
            name: 'In the wind',
            tooltip: 'Fuse alloys into something colder',
            done() { return getBuyableAmount('lo', 73).gt(0); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.f.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.f.color;
                return s;
            },
            unlocked() { return tmp.f.layerShown; },
        },
        191: {
            name: 'One Less Star',
            tooltip: 'Kill a star',
            done() { return player.xp.enemies.star.kills.gte(1); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.xp.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.xp.color;
                return s;
            },
            unlocked() { return hasChallenge('b', 22); },
        },
        192: {
            name: 'Uncaught TypeError: player.xp is undefined',
            tooltip: 'No more murder',
            done() { return hasUpgrade('a', 11); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.a.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) {
                    s['background-image'] = tmp.a.nodeStyle['background-image'];
                    s['background-origin'] = tmp.a.nodeStyle['background-origin'];
                }
                return s;
            },
            unlocked() { return hasChallenge('b', 22); },
        },
        193: {
            name: 'Uncaught TypeError: player.m is null',
            tooltip: 'Stop mining',
            done() { return hasUpgrade('a', 12); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.a.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) {
                    s['background-image'] = tmp.a.nodeStyle['background-image'];
                    s['background-origin'] = tmp.a.nodeStyle['background-origin'];
                }
                return s;
            },
            unlocked() { return hasChallenge('b', 22); },
        },
        194: {
            name: 'Uncaught TypeError: player.t is unset',
            tooltip: 'Lose your trees',
            done() { return hasUpgrade('a', 13); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.a.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) {
                    s['background-image'] = tmp.a.nodeStyle['background-image'];
                    s['background-origin'] = tmp.a.nodeStyle['background-origin'];
                }
                return s;
            },
            unlocked() { return hasChallenge('b', 22); },
        },
        195: {
            name: 'Goodbye',
            tooltip: 'Lose your achievements',
            done() { return false; },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.ach.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = tmp.ach.color;
                return s;
            },
            unlocked() { return hasChallenge('b', 22); },
        },
        201: {
            name: 'Cascade',
            tooltip: 'Enter the final challenge',
            done() { return inChallenge('b', 71); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.ach.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = '#FFFFFF';
                return s;
            },
            unlocked() { return hasChallenge('b', 22); },
        },
        202: {
            name: 'Calm, at last',
            tooltip: 'Defeat the Slime King once more',
            done() { return inChallenge('b', 71) && !inChallenge('b', 11); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.ach.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = '#FFFFFF';
                return s;
            },
            unlocked() { return hasChallenge('b', 22); },
        },
        203: {
            name: 'Generous',
            tooltip: 'Defeat the Globlin CEO once more',
            done() { return inChallenge('b', 71) && !inChallenge('b', 12); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.ach.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = '#FFFFFF';
                return s;
            },
            unlocked() { return hasChallenge('b', 22); },
        },
        204: {
            name: 'Vigor',
            tooltip: 'Defeat the Eternal Lich once more',
            done() { return inChallenge('b', 71) && !inChallenge('b', 21); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.ach.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = '#FFFFFF';
                return s;
            },
            unlocked() { return hasChallenge('b', 22); },
        },
        205: {
            name: 'Temperate',
            tooltip: 'Destroy the Kudzu once more',
            done() { return inChallenge('b', 71) && !inChallenge('b', 22); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.ach.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = '#FFFFFF';
                return s;
            },
            unlocked() { return hasChallenge('b', 22); },
        },
        206: {
            name: 'The end of the world',
            tooltip: 'Finish the final challenge',
            done() { return hasChallenge('b', 71); },
            onComplete() { doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Achievement Unlocked!", 3, tmp.ach.color); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = '#FFFFFF';
                return s;
            },
            unlocked() { return [201, 202, 203, 204].every(id => hasAchievement('ach', id)); },
        },
        //#endregion Normal achievements
        //#region Bonus achievements
        81: {
            name: 'Revenge',
            tooltip: 'Defeat the Slime Prince',
            done() { return hasChallenge('b', 31); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Bonus Achievement Unlocked!", 3, 'rgb(0,127,255)'); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(0,127,255)';
                return s;
            },
            unlocked() { return hasChallenge('b', 11); },
        },
        82: {
            name: 'Second in power',
            tooltip() {
                if (!hasChallenge('b', 12)) return 'Defeat ???';

                return 'Defeat the goblin president';
            },
            done() { return hasChallenge('b', 32); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Bonus Achievement Unlocked!", 3, 'rgb(0,127,255)'); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(0,127,255)';
                return s;
            },
            unlocked() { return hasChallenge('b', 11); },
        },
        83: {
            name: 'Amalgam',
            tooltip() {
                if (!hasChallenge('b', 21)) return 'Defeat ???';

                return 'Defeat the amalgam';
            },
            done() { return hasChallenge('b', 41); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Bonus Achievement Unlocked!", 3, 'rgb(0,127,255)'); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(0,127,255)';
                return s;
            },
            unlocked() { return hasChallenge('b', 11); },
        },
        84: {
            name: 'Going global',
            tooltip() {
                if (!hasChallenge('b', 22)) return 'Destroy ???';

                return 'Destroy the world tree';
            },
            done() { return hasChallenge('b', 42); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Bonus Achievement Unlocked!", 3, 'rgb(0,127,255)'); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(0,127,255)';
                return s;
            },
            unlocked() { return hasChallenge('b', 11); },
        },
        85: {
            name: 'Boss Star',
            tooltip: 'Beat all 4 bonus bosses',
            done() { return [31, 32, 41, 42].every(id => hasChallenge('b', id)); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Bonus Achievement Row Completed!", 3, 'rgb(0,127,255)'); },
            style() {
                let s = { 'background-image': `url('./resources/images/round-star.svg')`, };
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(0,127,255)';
                return s;
            },
            unlocked() { return hasChallenge('b', 11); },
        },
        91: {
            name: 'In strides',
            tooltip() {
                if (!hasChallenge('b', 31)) return 'Unlock ???';

                return 'Unlock the Clock';
            },
            done() { return hasChallenge('b', 51); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Bonus Achievement Unlocked!", 3, 'rgb(0,127,255)'); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(0,127,255)';
                return s;
            },
            unlocked() { return [31, 32, 41, 42].some(id => hasChallenge('b', id)); },
        },
        92: {
            name: 'Roll the dice',
            tooltip() {
                if (!hasChallenge('b', 32)) return 'Unlock ???';

                return 'Unlock the Casino';
            },
            done() { return hasChallenge('b', 52); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Bonus Achievement Unlocked!", 3, 'rgb(0,127,255)'); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(0,127,255)';
                return s;
            },
            unlocked() { return [31, 32, 41, 42].some(id => hasChallenge('b', id)); },
        },
        93: {
            name: 'Wizardry',
            tooltip() {
                if (!hasChallenge('b', 41)) return 'Unlock ???';

                return 'Unlock Magic';
            },
            done() { return hasChallenge('b', 61); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Bonus Achievement Unlocked!", 3, 'rgb(0,127,255)'); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(0,127,255)';
                return s;
            },
            unlocked() { return [31, 32, 41, 42].some(id => hasChallenge('b', id)); },
        },
        94: {
            name: 'SP',
            tooltip() {
                if (!hasChallenge('b', 42)) return 'Unlock ???';

                return 'Unlock Stats';
            },
            done() { return hasChallenge('b', 62); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Bonus Achievement Unlocked!", 3, 'rgb(0,127,255)'); },
            style() {
                let s = {};
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(0,127,255)';
                return s;
            },
            unlocked() { return [31, 32, 41, 42].some(id => hasChallenge('b', id)); },
        },
        95: {
            name: 'Relic Star',
            tooltip: 'Get all 4 relics',
            done() { return [51, 52, 61, 62].every(id => hasChallenge('b', id)); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Bonus Achievement Row Completed!", 3, 'rgb(0,127,255)'); },
            style() {
                let s = { 'background-image': `url('./resources/images/round-star.svg')`, };
                if (hasAchievement(this.layer, this.id)) s['background-color'] = 'rgb(0,127,255)';
                return s;
            },
            unlocked() { return [31, 32, 41, 42].some(id => hasChallenge('b', id)); },
        },
        //todo bonus achievements for bonus challenges in final challenge
        //#endregion Bonus achievements
        //#region Secret achievements
        21: {
            name: 'Straight to the end',
            tooltip: 'Get only the last experience upgrade',
            done() { return player.xp.upgrades.length == 1 && hasUpgrade('xp', 33); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Secret Achievement Unlocked!", 3, 'rgb(127,0,255)'); },
            style: { 'background-color': 'rgb(127,0,255)' },
            unlocked() { return hasAchievement(this.layer, this.id); },
        },
        41: {
            name: 'Skill issue',
            tooltip: 'Get 5 levels without any skill',
            done() { return player.l.points.gte(5) && Object.values(player.l.skills).every(skill => skill.level.lte(0)); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Secret Achievement Unlocked!", 3, 'rgb(127,0,255)'); },
            style: { 'background-color': 'rgb(127,0,255)' },
            unlocked() { return hasAchievement(this.layer, this.id); },
        },
        61: {
            name: 'Pure luck',
            tooltip: 'Get all drops from an enemy at once without any chance boost',
            done() {
                if (tmp.lo.items["*"].global_chance_multiplier.gt(1) ||
                    !can_drop('enemy:') ||
                    tmp.xp.enemies['*'].drops_mult.gt(1) ||
                    options.noRNG) return false;

                return (tmp.lo.items["*"].global_chance_multiplier.lte(1) &&
                    [['slime', 3], ['goblin', 3], ['zombie', 3], ['ent', 3]]
                        .some(([type, len]) => player.xp.enemies[type].last_drops.length == len && player.xp.enemies[type].kills.gt(0))) ||
                    hasAchievement('ach', 181);
            },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Secret Achievement Unlocked!", 3, 'rgb(127,0,255)'); },
            style: { 'background-color': 'rgb(127,0,255)' },
            unlocked() { return hasAchievement(this.layer, this.id); },
        },
        101: {
            name: 'You\'re done, please stop',
            tooltip: () => `Get ${format(10_000)} kills fighting the Slime King`,
            done() { return inChallenge('b', 11) && player.xp.enemies.slime.kills.gte(1e4); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Secret Achievement Unlocked!", 3, 'rgb(127,0,255)'); },
            style: { 'background-color': 'rgb(127,0,255)' },
            unlocked() { return hasAchievement(this.layer, this.id); },
        },
        102: {
            name: 'Hardcore',
            tooltip: 'Beat the Slime Prince without any experience upgrades',
            done() { return player.xp.upgrades.length == 0 && inChallenge('b', 31) && canCompleteChallenge('b', 31); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Secret Achievement Unlocked!", 3, 'rgb(127,0,255)'); },
            style: { 'background-color': 'rgb(127,0,255)' },
            unlocked() { return hasAchievement(this.layer, this.id); },
        },
        141: {
            name: 'Nullified',
            tooltip: 'Pay off all your debts/loans in the goblin CEO',
            done() { return player.s.upgrades.filter(layers.s.investloans.is_upg_loan).length >= 13 && inChallenge('b', 12); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Secret Achievement Unlocked!", 3, 'rgb(127,0,255)'); },
            style: { 'background-color': 'rgb(127,0,255)' },
            unlocked() { return hasAchievement(this.layer, this.id); },
        },
        142: {
            name: 'Direct',
            tooltip: 'Pay off only the boss debt/loan',
            done() { return !player.s.respecced && player.s.upgrades.filter(layers.s.investloans.is_upg_loan) == 1 && hasUpgrade('s', 81) && (inChallenge('b', 12) || inChallenge('b', 32)); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Secret Achievement Unlocked!", 3, 'rgb(127,0,255)'); },
            style: { 'background-color': 'rgb(127,0,255)' },
            unlocked() { return hasAchievement(this.layer, this.id); },
        },
        143: {
            name: 'Another Level',
            tooltip: 'Lose a level to your loans',
            done() { return inChallenge('b', 32) && player.l.points.gt(100); },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Secret Achievement Unlocked!", 3, 'rgb(127,0,255)'); },
            style: { 'background-color': 'rgb(127,0,255)' },
            unlocked() { return hasAchievement(this.layer, this.id); },
        },
        181: {
            name: 'Jackpot',
            tooltip: 'Get all drops from the amalgam',
            done() {
                if (tmp.lo.items["*"].global_chance_multiplier.neq(1) ||
                    !can_drop('enemy:') ||
                    tmp.xp.enemies['*'].drops_mult.gt(1) ||
                    options.noRNG ||
                    !inChallenge('b', 41)) return false;

                return player.xp.enemies.amalgam.last_drops.length == 12;
            },
            onComplete() { if (tmp.ach.layerShown) doPopup("achievement", tmp[this.layer].achievements[this.id].name, "Secret Achievement Unlocked!", 3, 'rgb(127,0,255)'); },
            style: { 'background-color': 'rgb(127,0,255)' },
            unlocked() { return hasAchievement(this.layer, this.id); },
        },
        //#endregion Secret achievements
    },
    tooltip() {
        if (player.ach.short_mode) {
            let pieces = [
                layerColor('ach', `${formatWhole(layers.ach.ownedAchievements())} / ${formatWhole(layers.ach.totalAchievements())}`),
            ];
            if (tmp.ach.tabFormat['Bonus'].unlocked) {
                const color = tmp.ach.tabFormat['Bonus'].buttonStyle['border-color'];
                pieces.push(`<span style="color:${color};text-shadow:${color} 0 0 10px";>${formatWhole(layers.ach.ownedAchievements('bonus'))} / ${formatWhole(layers.ach.totalAchievements('bonus'))}</span>`);
            }
            if (layers.ach.ownedAchievements('secret').gte(1)) {
                const color = tmp.ach.tabFormat['Secrets'].buttonStyle['border-color'];
                pieces.push(`<span style="color:${color};text-shadow:${color} 0 0 10px;">${formatWhole(layers.ach.ownedAchievements('secret'))}</span>`);
            }
            return pieces.join(' | ');
        } else {
            let lines = [
                `<span style="white-space: nowrap">${formatWhole(layers.ach.ownedAchievements())} / ${formatWhole(layers.ach.totalAchievements())} achievements</span>`
            ];

            if (tmp.ach.tabFormat['Bonus'].unlocked) {
                lines.push(`<span style="white-space: nowrap">${formatWhole(layers.ach.ownedAchievements('bonus'))} / ${formatWhole(layers.ach.totalAchievements('bonus'))} bonus achievements</span>`)
            }
            if (layers.ach.ownedAchievements('secret').gte(1)) {
                lines.push(`${formatWhole(layers.ach.ownedAchievements('secret'))} secrets`);
            }

            return lines.join('<br />');
        }
    },
    getAchievementsRows(type = 'normal') {
        let rows = [];

        switch (type) {
            case 'normal':
            default:
                rows = [1, 3, 5, 12, 7, 11, 15, 13, 16, 17, 19, 20];
                break;
            case 'bonus':
                rows = [8, 9];
                break;
            case 'secret':
                rows = [2, 4, 6, 10, 14, 18];
                break;
        }

        return rows;
    },
    getAchievements(type = 'normal') {
        let rows = layers.ach.getAchievementsRows(type);

        if (!rows.length) return [];

        return Object.keys(layers.ach.achievements).filter(id => {
            if (isNaN(id)) return false;

            if (!(tmp.ach.achievements[id].unlocked ?? true)) return false;

            return rows.some(r => RegExp(`^${r}\\d$`).test(id));
        });
    },
    totalAchievements(type = 'normal') { return D(this.getAchievements(type).length); },
    ownedAchievements(type = 'normal') { return D(this.getAchievements(type).filter(id => hasAchievement('ach', id)).length); },
    achievementPopups: false,
});
