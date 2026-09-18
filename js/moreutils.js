/**
 * Checks if an upgrade can be purchased in a layer
 *
 * @param {keyof Layers} layer Layer to check for
 * @param {number[]} [rows] Rows to check for, by default all rows are checked
 * @returns {Boolean} True if an unlocked upgrade can be purchased
 */
function canAffordLayerUpgrade(layer, rows = { includes: n => true, length: 1 }) {
    if (!tmp[layer].upgrades || !rows.length) return false;

    try {
        for (const id in tmp[layer].upgrades) {
            if (isNaN(id)) continue;
            const row = Math.floor(id / 10);
            if (!rows.includes(row)) continue;
            let upgrade = tmp[layer].upgrades[id];
            if (!upgrade.unlocked) continue;
            if (!hasUpgrade(layer, id) && canAffordUpgrade(layer, id)) return true;
        }
    } catch { };
    return false;
}
/**
 * Checks if a buyable can be purchased in a layer
 *
 * @param {keyof Layers} layer Layer to check for
 * @returns {Boolean} True if an unlocked buyable can be purchased
 */
function canAffordLayerBuyable(layer) {
    if (!tmp[layer].buyables) return false;

    for (let id in tmp[layer].buyables) {
        if (isNaN(id)) continue;
        let buyable = tmp[layer].buyables[id];
        if (!buyable.unlocked) continue;
        if (canBuyBuyable(layer, id)) return true;
    }
    return false;
}
/**
 * Checks if a challenge can be completed in a layer
 *
 * @param {keyof Layers} layer Layer to check for
 * @returns {Boolean} True if an unlocked challenge can be completed
 */
function canCompleteLayerChallenge(layer) {
    if (!tmp[layer].challenges) return false;

    for (let id in tmp[layer].challenges) {
        if (isNaN(id)) continue;
        let challenge = tmp[layer].challenges[id];
        if (!challenge.unlocked) continue;
        if (canCompleteChallenge(layer, id)) return true;
    }
    return false;
}
/**
 * Sums the amount of purchased buyables in a layer
 *
 * @param {keyof Layers} layer Layer to check in
 * @returns {Decimal} The amount of purchased buyables
 */
function layerBuyableAmount(layer) {
    if (!tmp[layer].buyables) return new Decimal(0);

    let sum = new Decimal(0);
    for (let id in tmp[layer].buyables) {
        if (typeof tmp[layer].buyables != 'object') continue;
        sum = sum.add(getBuyableAmount(layer, id));
    }
    return sum;
}
/**
 * Colors text with a layer's color
 *
 * @param {keyof Layers} layer
 * @param {string} text
 * @param {string} [style]
 * @returns {string}
 */
function layerColor(layer, text, style = "") {
    return `<span style="color:${tmp[layer].color};text-shadow:${tmp[layer].color} 0 0 10px;${style}">${text}</span>`;
}
/**
 * Colors text with an item's color
 *
 * @param {items} item
 * @param {string} text
 * @param {string} [style]
 * @returns {string}
 */
function itemColor(item, text, style = "") {
    const color = tmp.lo.items[item].style['background-color'];
    return `<span style="color:${color};text-shadow:${color} 0 0 10px;${style}">${text}</span>`;
}
/**
 * Like format, but returns an array of each coin types, limited to 100.
 *
 * If the highest coin type is above 1e9, it will be the only one returned.
 *
 * @param {DecimalSource} decimal
 * @param {number} coin_types Amount of coin types
 * @returns {string[]}
 */
function formatCoins(decimal, coin_types) {
    if (!coin_types) return [format(decimal)];

    let d = new Decimal(decimal);
    const limit = new Decimal(100).pow(coin_types).times(1e9);

    if (d.gte(limit)) {
        const arr = new Array(coin_types - 1).fill("0");
        arr.push(format(d.div(limit)));
        return arr;
    }

    return new Array(coin_types).fill(0).map((_, i) => {
        if (i == coin_types - 1) return formatWhole(d);
        let c = d.toNumber() % 100;
        d = d.div(100).floor();
        return formatWhole(c);
    });
}
/**
 * Shorthand for Decimal and shorter way to create one
 *
 * @type {((val: DecimalSource) => Decimal)&{[k in keyof typeof Decimal]: (typeof Decimal)[k]}}
 */
const D = new Proxy(val => new Decimal(val), {
    get(_, prop) { return Decimal[prop]; },
    ownKeys() { return Object.keys(Decimal); },
});
/**
 * Same as `player.<layer>.activeChallenge ?? false`
 *
 * @param {keyof Layers} layer
 * @returns {number|false}
 */
function activeChallenge(layer) {
    return player[layer].activeChallenge ?? false;
}
/**
 * Capitalizes the first letter
 *
 * @param {string} text
 * @returns {string}
 */
function capitalize(text) {
    return `${text}`.replace(/^./, s => s.toUpperCase());
}
/**
 * Capitalizes the first letter of each word
 *
 * @param {string} text
 */
function capitalize_words(text) {
    return `${text}`.replaceAll(/^.| ./g, s => s.toUpperCase());
}
/**
 * Rounds a number to a multiple of a power of `pow`
 *
 * Exemple:
 * ```js
 * powerRound(333, 100).eq(300); //true
 * ```
 *
 * @param {DecimalSource} decimal
 * @param {DecimalSource} pow
 * @returns {Decimal}
 */
function powerRound(decimal, pow) {
    let base = D.pow(pow, D.log(decimal, pow).floor()),
        mult = D.div(decimal, base).round();

    return base.times(mult);
}
/**
 * Returns the average of 2 or more hex colors
 *
 * @param {...string} colors
 * @returns {string}
 */
function colors_average(...colors) {
    if (!colors.length) return '#000000';
    if (colors.length == 1) return colors[0];

    return '#' + colors.map(color => Array.from({ length: 3 }, (_, i) => {
        const hex = color.slice(i * 2 + 1, (i + 1) * 2 + 1),
            val = parseInt(hex, 16);

        return val / color.length;
    }))
        .reduce(([pr, pg, pb], [cr, cg, cb]) => [pr + cr, pg + cg, pb + cb], [0, 0, 0])
        .map(num => Math.floor(num).toString(16).padStart(2, '0'))
        .join('');
}
/**
 * Converts hsl to rgb
 *
 * @param {number} hue Contained within [0,1]
 * @param {number} saturation Contained within [0,1]
 * @param {number} lightness Contained within [0,1]
 * @returns {[number, number, number]}
 *
 * @see https://stackoverflow.com/a/9493060
 */
function hsl_to_rgb(hue, saturation, lightness) {
    let r, g, b;

    if (saturation == 0) {
        // Achromatic
        r = g = b = lightness;
    } else {
        const q = lightness < .5 ? l * (1 + saturation) : lightness + saturation - lightness * saturation,
            p = 2 * lightness - q;
        r = hue_to_rgb(p, q, hue + 1 / 3);
        g = hue_to_rgb(p, q, hue);
        b = hue_to_rgb(p, q, hue - 1 / 3);
    }

    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
}
/**
 * @param {number} p
 * @param {number} q
 * @param {number} t
 */
function hue_to_rgb(p, q, t) {
    if (t < 0) t++;
    if (t > 1) t--;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
}
/**
 * Generates a random alphabetical string
 *
 * @param {number} length
 * @returns {string}
 */
function random_string_alpha(length) {
    return Array.from({ length }, () => String.fromCharCode(Math.floor(Math.random() * 26) + 65)).join('');
}
// Layer methods
/**
 * @param {string} building
 *
 * @returns {['row', [
 *  ['buyable', string],
 *  'blank',
 *  ['display-text', string],
 *  'blank',
 *  ['clickable', string],
 * ]] | undefined}
 */
function show_building(building) {
    if (building == '*' || !(building in tmp.c.buildings) || !(tmp.c.buildings[building].unlocked ?? true)) return;

    return ['row', [
        ['buyable', building],
        'blank',
        ['display-text', tmp.c.buildings[building].description],
        'blank',
        ['clickable', `select_${building}`],
    ]];
}
/**
 * @param {resources} resource
 * @param {DecimalSource} amount
 */
function gain_resource(resource, amount) {
    if (!resource) return;

    player.c.resources[resource].amount = D.add(player.c.resources[resource].amount, amount).max(0);
}
/**
 * @param {string} skill
 *
 * @returns {['row', [['bar', string], ['clickable', `add_${string}`], ['clickable', `remove_${string}`]]]|[]}
 */
function show_skill(skill) {
    if (!(skill in layers.l.skills)) return [];

    return ['row', [
        ['bar', skill],
        ['clickable', `add_${skill}`],
        ['clickable', `remove_${skill}`],
    ]];
}
/**
 * @type {((id: number) => items | false) & {
 *  cache: { [k: number]: items | false }
 * }}
 */
const grid_to_item = (id) => {
    if (!id) return false;

    const cache = grid_to_item.cache ??= {};
    if (!(id in cache)) {
        const item = Object.keys(tmp.lo.items)
            .filter(item => item != '*')
            .find(item => tmp.lo.items[item].grid == id) ?? false;
        cache[id] = item;
    }
    return cache[id];
};
/**
 * @param {string} enemy
 * @param {DecimalSource} kills
 * @returns {[items, Decimal][]}
 */
function get_enemy_drops(enemy, kills) {
    switch (enemy) {
        case 'slime': case 'goblin': case 'zombie': case 'ent':
            return get_type_drops(`enemy:${enemy}`, kills);
        case 'amalgam':
            return Object.entries(['slime', 'goblin', 'zombie', 'ent'].reduce((sum, enemy) => {
                get_enemy_drops(enemy, kills).forEach(([item, amount]) => sum[item] = D.add(sum[item], amount));

                return sum;
            }, {}));
        case 'star':
            return [['stardust', D.dOne]];
        default:
            return [];
    }
}
/**
 * @param {DecimalSource} amount
 * @returns {[items, Decimal][]}
 */
function get_mining_drops(amount) {
    amount = D.times(amount, tmp.m.ore.mine_mult);

    const drops = get_type_drops(`mining:${player.m.mode}`, D(amount));

    if (hasUpgrade('m', 32)) {
        let stone = drops.reduce((sum, [, amount]) => D.add(sum, amount), D.dZero);

        if (inChallenge('b', 12) && !hasUpgrade('s', 61)) stone = stone.div(D.add(player.lo.items.stone.amount.max(0), 10).log10());
        if (hasUpgrade('s', 61)) stone = stone.times(upgradeEffect('s', 61));

        // Merge into existing stone amount if possible
        const entry = drops.find(([item]) => item == 'stone') ?? false;
        if (entry) entry[1] = stone;
        else drops.push(['stone', stone]);
    }
    if (hasUpgrade('m', 52)) {
        const stone = drops.find(([item]) => item == 'stone');
        if (stone) {
            stone[1] = stone[1].times(upgradeEffect('m', 52));
        }
    }

    return drops;
}
/**
 * @param {string} tree
 * @param {DecimalSource} amount
 * @returns {[items, Decimal][]}
 */
function get_tree_drops(tree, amount) {
    switch (tree) {
        case 'driftwood':
        case 'oak':
        case 'birch':
        case 'baobab':
            return get_type_drops(`tree:${tree}`, D(amount));
        default:
            return [];
    }
}
/**
 * Computes the drops from a type
 *
 * @param {`${drop_sources}:${string}`} [type=player.xp.type]
 * @param {DecimalSource} [chance_multiplier=D.dOne]
 * @returns {[items, Decimal][]}
 */
function get_type_drops(type = player.xp.type, chance_multiplier = D.dOne) {
    if (!can_drop(type) || D.lte(chance_multiplier, 0)) return [];

    const items = ((inChallenge('b', 52) || hasChallenge('b', 52)) && !tmp.cas.deactivated) ? layers.cas.items.items(type) : layers.lo.items['*'].items(type),
        /** @type {{[item_id: string]: Decimal}} */
        results = {},
        /** @type {[string, Decimal][]} */
        to_roll = [],
        /** @type {(item_id: string, amount: DecimalSource) => Decimal} */
        add_to_results = (item_id, amount) => results[item_id] = D.add(results[item_id] ?? 0, amount);

    Object.entries(items.chances ?? {}).forEach(([item_id, chance]) => {
        const rchance = chance.times(chance_multiplier).times(tmp.lo.items['*'].global_chance_multiplier);
        if (rchance.gte(1) || options.noRNG) {
            add_to_results(item_id, rchance);
        } else {
            to_roll.push([item_id, rchance]);
        }
    });

    if (to_roll.length > 7) {
        to_roll.forEach(([item_id, chance]) => add_to_results(item_id, chance));
    } else {
        let rng = Math.random(),
            i = 0;
        for (; i < 2 ** to_roll.length && rng > 0; i++) {
            const bin = i.toString(2).padStart(to_roll.length, '0').split(''),
                chance = to_roll.map(([, chance], i) => {
                    if (bin[i] == '1') return chance;
                    else return D.dOne.minus(chance);
                }).reduce(D.times, D.dOne);
            rng -= chance.toNumber();
        }
        if (rng <= 0 && i > 0) i--;
        const bin = i.toString(2).padStart(to_roll.length, '0').split('');
        to_roll.forEach(([item], i) => {
            if (bin[i] == '1') add_to_results(item, 1);
        });
    }

    if (Object.keys(items.weights ?? {}).length > 0) {
        const entries = Object.entries(items.weights),
            total = entries.reduce((sum, [, weight]) => D.add(sum, weight), D.dZero);

        if (entries.length == 1) {
            add_to_results(entries[0][0], 1);
        } else if (D.gt(chance_multiplier, 10) || options.noRNG) {
            entries.forEach(([item_id, weight]) => {
                const amount = weight.div(total).times(chance_multiplier);

                add_to_results(item_id, amount);
            });
        } else {
            // There must be a better way to do this, but it looks like a pain to figure out
            for (let l = D.dZero; l.lt(chance_multiplier); l = l.add(1)) {
                let rng = D.times(Math.random(), total),
                    i = 0;
                while (rng.gt(0)) {
                    rng = rng.minus(entries[i][1]);
                    i++;
                }
                if (rng.lte(0) && i > 0) i--;
                const item = entries[i][0];
                add_to_results(item, 1);
            }
        }
    }

    Object.entries(results).forEach(([item, gain]) => {
        const upg = layers.s.investloans.item_upgrade[item] ?? false;
        if (inChallenge('b', 12)) {
            if (upg && hasUpgrade('s', upg)) return;
            results[item] = gain.div(D.add(player.lo.items[item].amount.max(0), 10).log10());
        }
        let gain_mult = tmp.lo.items["*"].gain_multiplier;

        if (upg && hasUpgrade('s', upg)) gain_mult = gain_mult.times(upgradeEffect('s', upg));

        results[item] = results[item].times(gain_mult);
    });

    if ((inChallenge('b', 52) || hasChallenge('b', 52)) && !tmp.cas.deactivated) {
        // Roll for tokens
        const chance = tmp.cas.token.chance.times(chance_multiplier);

        if (chance.gte(1) || options.noRNG) {
            addPoints('cas', chance);
        } else if (D.gt(chance, Math.random())) {
            addPoints('cas', 1);
        }
    }

    return Object.entries(results);
}
/**
 * Get drops as if the enemy were killed
 *
 * **Does a loot roll (only important if casino is unlocked)**
 *
 * @param {string} monster
 * @param {DecimalSource} kills
 * @returns {[items, Decimal][]}
 */
function get_monster_drops(monster, kills) {
    switch (monster) {
        case 'slime': case 'goblin': case 'zombie': case 'ent':
            return get_type_drops(`tamed_kill:${monster}`, kills);
        case 'amalgam': {
            const types = ['slime', 'goblin', 'zombie'];

            if (false) types.push('ent'); //todo unlock ent

            return types.reduce((sum, type) => [...sum, ...get_monster_drops(type, kills)], []);
        }
        default:
            return [];
    }
}
/**
 * @param {DecimalSource} chance
 */
function format_chance(chance) {
    if (D.gte(chance, 1) || options.noRNG) return `+${format(chance)}`;
    if (D.lte(chance, 0)) return format(0);

    const fractional = options.chanceMode == 'NOT_GUARANTEED' || (options.chanceMode == 'LESS_HALF' && D.lt(chance, .5));

    if (fractional) {
        return `1/${format(D.pow(chance, -1))}`;
    } else {
        return `${format(D.times(chance, 100))}%`;
    }
}
/**
 * @param {`${drop_sources}:${string}`} type
 */
function type_name(type) {
    /** @type {[drop_sources, string]} */
    const [from, sub] = type.split(':');
    switch (from) {
        case 'enemy':
            return tmp.xp.enemies[sub].name;
        case 'mining':
            return `${layers.m.ore.mode(sub)} ${tmp.m.name.toLowerCase()}`.trim();
        case 'tree':
            if (sub == 'convertion') return 'Convertion';
            return `Chopping ${tmp.t.trees[sub].name}`;
        case 'forge': {
            let text = 'Forge: ';
            if (sub == 'fuel') text += 'fueling';
            if (sub == 'smelt') text += 'smelting';
            return text;
        }
        case 'freezer': {
            let text = 'Freezer: ';
            if (sub == 'condensation') text += 'condensation';
            if (sub == 'cooling') text += 'cooling';
            if (sub == 'freezing') text += 'freezing';
            return text;
        }
        case 'tamed': case 'tamed_kill':
            return `tamed ${tmp.xp_alt.monsters[sub].name}`;
        case 'building':
            return `built ${tmp.c.buildings[sub].name}`;
        case 'plant':
            return `grown ${tmp.p.plants[sub].name}`;
    }
}
/**
 * @param {`${drop_sources}:${string}`} type
 */
function can_drop(type) {
    /** @type {[drop_sources, string]} */
    const [from, sub] = type.split(':');

    switch (from) {
        case 'enemy':
            return hasUpgrade('lo', 11) || hasUpgrade('s', 22) || sub == 'star';
        case 'mining':
            return tmp.m.layerShown;
        case 'tree':
            return tmp.t.layerShown;
        case 'forge':
            return tmp.f.layerShown;
        case 'freezer':
            return tmp.fr.layerShown;
        case 'tamed_kill':
        case 'tamed':
            return tmp.xp_alt.layerShown && (tmp.xp_alt.monsters[sub].unlocked ?? true);
        case 'building':
            return tmp.c.layerShown;
        case 'plant':
            return tmp.p.layerShown && (tmp.p.plants[sub].unlocked ?? true);
    }

    return false;
}
/**
 * @param {items|[items, DecimalSource][]} item
 * @param {DecimalSource} [amount]
 */
function gain_items(item, amount) {
    if (Array.isArray(item)) {
        item.forEach(([item, amount]) => player.lo.items[item].amount = D.add(player.lo.items[item].amount, amount).max(0));
    } else {
        player.lo.items[item].amount = D.add(player.lo.items[item].amount, amount).max(0);
    }
}
/**
 * Returns a row that displays the fuel
 *
 * @param {string} fuel
 * @returns {['row', [['clickable', `fuel_display_${string}`], ['display-text', string], ['clickable', `fuel_toggle_${string}`]]]|undefined}
 */
function show_fuel(fuel) {
    if (!fuel || !(tmp.f.fuels[fuel].unlocked ?? true)) return;

    const entry = tmp.f.fuels[fuel];

    return ['row', [
        ['clickable', `fuel_display_${fuel}`],
        'blank',
        ['display-text', `${format(entry.producing)} heat /s (${format(entry.heat)} each)`],
        'blank',
        ['clickable', `fuel_toggle_${fuel}`],
    ]];
}
function randomize_enemy_element() {
    Object.keys(layers.xp.enemies).forEach(type => player.xp.enemies[type].element = layers.mag.elements['*'].random());
}
/**
 * Returns 3 random items, one per type
 *
 * @returns {items[]}
 */
function randomize_tower_materials() {
    const low = Object.keys(run(layers.to.materials.low, layers.to.materials)),
        medium = Object.keys(run(layers.to.materials.medium, layers.to.materials)),
        high = Object.keys(run(layers.to.materials.high, layers.to.materials));

    return [
        low[Math.floor(low.length * Math.random())],
        medium[Math.floor(medium.length * Math.random())],
        high[Math.floor(high.length * Math.random())],
    ];
}
/**
 * Creates a new bingo card
 *
 * @returns {number[]}
 */
function create_card() {
    /** @type {number[]} */
    const card = [];
    for (let i = 0; i < 25; i++) {
        const n = roll_ball();
        if (card.includes(n)) i--;
        else card.push(n);
    }
    return card;
}
/**
 * Roll a random ball
 *
 * @returns {number}
 */
function roll_ball() {
    return Math.floor(Math.random() * (tmp.bin.balls.max - tmp.bin.balls.min) + tmp.bin.balls.min);
}
/**
 * Roll an unrolled ball
 *
 * @returns {number}
 */
function roll_new_ball() {
    if (player.bin.rolled.length > (tmp.bin.balls.max - tmp.bin.balls.min)) return;

    let n;
    do {
        n = roll_ball();
    } while (player.bin.rolled.includes(n));

    return n;
}
