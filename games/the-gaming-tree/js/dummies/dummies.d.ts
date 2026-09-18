type CompareResult = -1 | 0 | 1;
type DecimalSource = string | number | Decimal;
type Computable<T> = T | (() => T);
type Computed<T> = T extends (...args: any) => any ? ReturnType<T> : T;
type RComputed<T> = { [k in keyof T]: T[k] extends (...args: any) => any ? ReturnType<T[k]> : RComputed<T[k]> };
type CSSStyles = { [k in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[k] };
type AchievementTypes = 'normal' | 'bonus' | 'secret';
type TabFormatEntries<L extends keyof Layers> = ['display-text', Computable<string>] | ['display-image', Computable<string>] | ['raw-html', Computable<string>] |
    'h-line' | 'v-line' |
    'blank' | ['blank', height: number] | ['blank', width: number, height: number] |
['row', TabFormatEntries<L>[]] | ['column', TabFormatEntries<L>[]] |
    'main-display' | ['main-display', precision: number] |
    'resource-display' | 'prestige-button' |
['text-input', keyof Player[L]] |
['slider', [name: keyof Player[L], min: number, max: number]] |
['drop-down', [name: keyof Player[L], options: string[]]] |
['drop-down-double', [name: keyof Player[L], options: [value: string, display: string][]]] |
    'upgrades' | 'milestones' | 'challenges' | 'achievements' | 'buyables' | 'clickables' |
['upgrades' | 'milestones' | 'challenges' | 'achievments' | 'buyables' | 'clickables', rows: number[]] |
['upgrade' | 'milestone' | 'challenge' | 'achievment' | 'buyable' | 'clickable', id: number] |
['microtabs', microtabs: string[]] |
['bar', id: string] |
['infobox', id: string] |
['tree', (keyof Layers)[][]] |
['upgrade-tree' | 'buyable-tree' | 'clickable-tree', number[][]] |
['toggle', [layer: keyof Layers, id: string]] |
['layer-proxy', [layer: keyof Layers, data: TabFormatEntries<keyof Layers>[]]] |
    'respec-button' | 'master-button' |
['sell-one', id: number] | ['sell-all', id: number] |
[
    'layer-table',
    [
        layer?: keyof Layers,
        headers: string[],
        ...string[][]
    ]
];

declare class Decimal {
    //#region Constants
    static readonly dZero: Decimal;
    static readonly dOne: Decimal;
    static readonly dNegOne: Decimal;
    static readonly dTwo: Decimal;
    static readonly dTen: Decimal;
    static readonly dNaN: Decimal;
    static readonly dInf: Decimal;
    static readonly dNegInf: Decimal;
    static readonly dNumberMax: Decimal;
    static readonly dNumberMin: Decimal;
    //#endregion Constants

    //#region Static functions
    static fromComponents(sign: number, layer: number, mag: number): Decimal
    static fromComponents_noNormalize(sign: number, layer: number, mag: number): Decimal
    static fromMantissaExponent(mantissa: number, exponent: number): Decimal
    static fromMantissaExponent_noNormalize(mantissa: number, exponent: number): Decimal
    static fromDecimal(value: Decimal): Decimal
    static fromNumber(value: number): Decimal
    static fromString(value: string): Decimal
    static fromValue(value: DecimalSource): Decimal
    static fromValue_noAlloc(value: DecimalSource): Decimal
    static abs(value: DecimalSource): Decimal
    static neg(value: DecimalSource): Decimal
    static negate(value: DecimalSource): Decimal
    static negated(value: DecimalSource): Decimal
    static sign(value: DecimalSource): number
    static sgn(value: DecimalSource): number
    static round(value: DecimalSource): Decimal
    static floor(value: DecimalSource): Decimal
    static ceil(value: DecimalSource): Decimal
    static trunc(value: DecimalSource): Decimal
    static add(value: DecimalSource, other: DecimalSource): Decimal
    static plus(value: DecimalSource, other: DecimalSource): Decimal
    static sub(value: DecimalSource, other: DecimalSource): Decimal
    static subtract(value: DecimalSource, other: DecimalSource): Decimal
    static minus(value: DecimalSource, other: DecimalSource): Decimal
    static mul(value: DecimalSource, other: DecimalSource): Decimal
    static multiply(value: DecimalSource, other: DecimalSource): Decimal
    static times(value: DecimalSource, other: DecimalSource): Decimal
    static div(value: DecimalSource, other: DecimalSource): Decimal
    static divide(value: DecimalSource, other: DecimalSource): Decimal
    static recip(value: DecimalSource): Decimal
    static reciprocal(value: DecimalSource): Decimal
    static reciprocate(value: DecimalSource): Decimal
    static cmp(value: DecimalSource, other: DecimalSource): CompareResult
    static cmpabs(value: DecimalSource, other: DecimalSource): CompareResult
    static compare(value: DecimalSource, other: DecimalSource): CompareResult
    static isNaN(value: DecimalSource): boolean
    static isFinite(value: DecimalSource): boolean
    static eq(value: DecimalSource, other: DecimalSource): boolean
    static equals(value: DecimalSource, other: DecimalSource): boolean
    static neq(value: DecimalSource, other: DecimalSource): boolean
    static notEquals(value: DecimalSource, other: DecimalSource): boolean
    static lt(value: DecimalSource, other: DecimalSource): boolean
    static lte(value: DecimalSource, other: DecimalSource): boolean
    static gt(value: DecimalSource, other: DecimalSource): boolean
    static gte(value: DecimalSource, other: DecimalSource): boolean
    static max(value: DecimalSource, other: DecimalSource): Decimal
    static min(value: DecimalSource, other: DecimalSource): Decimal
    static minabs(value: DecimalSource, other: DecimalSource): Decimal
    static maxabs(value: DecimalSource, other: DecimalSource): Decimal
    static clamp(value: DecimalSource, min: DecimalSource, max: DecimalSource): Decimal
    static clampMin(value: DecimalSource, min: DecimalSource): Decimal
    static clampMax(value: DecimalSource, max: DecimalSource): Decimal
    static cmp_tolerance(value: DecimalSource, other: DecimalSource, tolerance: number): CompareResult
    static compare_tolerance(value: DecimalSource, other: DecimalSource, tolerance: number): CompareResult
    static eq_tolerance(value: DecimalSource, other: DecimalSource, tolerance: number): boolean
    static equals_tolerance(value: DecimalSource, other: DecimalSource, tolerance: number): boolean
    static neq_tolerance(value: DecimalSource, other: DecimalSource, tolerance: number): boolean
    static notEquals_tolerance(value: DecimalSource, other: DecimalSource, tolerance: number): boolean
    static lt_tolerance(value: DecimalSource, other: DecimalSource, tolerance: number): boolean
    static lte_tolerance(value: DecimalSource, other: DecimalSource, tolerance: number): boolean
    static gt_tolerance(value: DecimalSource, other: DecimalSource, tolerance: number): boolean
    static gte_tolerance(value: DecimalSource, other: DecimalSource, tolerance: number): boolean
    static pLog10(value: DecimalSource): Decimal
    static absLog10(value: DecimalSource): Decimal
    static log10(value: DecimalSource): Decimal
    static log(value: DecimalSource, base: DecimalSource): Decimal
    static log2(value: DecimalSource): Decimal
    static ln(value: DecimalSource): Decimal
    static logarithm(value: DecimalSource, base: DecimalSource): Decimal
    static pow(value: DecimalSource, other: DecimalSource): Decimal
    static pow10(value: DecimalSource): Decimal
    static root(value: DecimalSource, other: DecimalSource): Decimal
    static factorial(value: DecimalSource, _other?: never): Decimal
    static gamma(value: DecimalSource, _other?: never): Decimal
    static lngamma(value: DecimalSource, _other?: never): Decimal
    static exp(value: DecimalSource): Decimal
    static sqr(value: DecimalSource): Decimal
    static sqrt(value: DecimalSource): Decimal
    static cube(value: DecimalSource): Decimal
    static cbrt(value: DecimalSource): Decimal
    static tetrate(value: DecimalSource, height?: number, payload?: DecimalSource): Decimal
    static iteratedexp(value: DecimalSource, height?: number, payload?: Decimal): Decimal
    static iteratedlog(value: DecimalSource, base?: DecimalSource, times?: number): Decimal
    static layeradd10(value: DecimalSource, diff: DecimalSource): Decimal
    static layeradd(value: DecimalSource, diff: number, base?: number): Decimal
    static slog(value: DecimalSource, base?: number): Decimal
    static lambertw(value: DecimalSource): Decimal
    static ssqrt(value: DecimalSource): Decimal
    static pentate(value: DecimalSource, height?: number, payload?: DecimalSource): Decimal
    /**
     * If you're willing to spend 'resourcesAvailable' and want to buy something
     * with exponentially increasing cost each purchase (start at priceStart,
     * multiply by priceRatio, already own currentOwned), how much of it can you buy?
     * Adapted from Trimps source code.
     */
    static affordGeometricSeries(resourcesAvailable: DecimalSource, priceStart: DecimalSource, priceRatio: DecimalSource, currentOwned: DecimalSource): Decimal
    /**
     * How much resource would it cost to buy (numItems) items if you already have currentOwned,
     * the initial price is priceStart and it multiplies by priceRatio each purchase?
     */
    static sumGeometricSeries(numItems: DecimalSource, priceStart: DecimalSource, priceRatio: DecimalSource, currentOwned: DecimalSource): Decimal
    /**
     * If you're willing to spend 'resourcesAvailable' and want to buy something with additively
     * increasing cost each purchase (start at priceStart, add by priceAdd, already own currentOwned),
     * how much of it can you buy?
     */
    static affordArithmeticSeries(resourcesAvailable: DecimalSource, priceStart: DecimalSource, priceAdd: DecimalSource, currentOwned: DecimalSource): Decimal
    /**
     * How much resource would it cost to buy (numItems) items if you already have currentOwned,
     * the initial price is priceStart and it adds priceAdd each purchase?
     * Adapted from http://www.mathwords.com/a/arithmetic_series.htm
     */
    static sumArithmeticSeries(numItems: DecimalSource, priceStart: DecimalSource, priceAdd: DecimalSource, currentOwned: DecimalSource): Decimal
    /**
     * When comparing two purchases that cost (resource) and increase your resource/sec by (deltaRpS),
     * the lowest efficiency score is the better one to purchase.
     * From Frozen Cookies:
     * http://cookieclicker.wikia.com/wiki/Frozen_Cookies_(JavaScript_Add-on)#Efficiency.3F_What.27s_that.3F
     */
    static efficiencyOfPurchase(cost: DecimalSource, currentRpS: DecimalSource, deltaRpS: DecimalSource): Decimal
    static randomDecimalForTesting(maxLayers: number): Decimal
    static affordGeometricSeries_core(resourcesAvailable: Decimal, priceStart: Decimal, priceRatio: Decimal, currentOwned: DecimalSource): Decimal
    static sumGeometricSeries_core(numItems: DecimalSource, priceStart: Decimal, priceRatio: Decimal, currentOwned: DecimalSource): Decimal
    static affordArithmeticSeries_core(resourcesAvailable: Decimal, priceStart: Decimal, priceAdd: Decimal, currentOwned: Decimal): Decimal
    static sumArithmeticSeries_core(numItems: Decimal, priceStart: Decimal, priceAdd: Decimal, currentOwned: Decimal): Decimal
    static efficiencyOfPurchase_core(cost: Decimal, currentRpS: Decimal, deltaRpS: Decimal): Decimal
    static slog_critical(base: number, height: number): number
    static tetrate_critical(base: number, height: number): number
    static critical_section(base: number, height: number, grid: number[][]): number
    //#endregion Static functions

    constructor(value?: DecimalSource)

    //#region Properties
    sign: number;
    mag: number;
    layer: number;
    m: number;
    e: number;
    s: number;
    mantissa: number;
    exponent: number;
    //#endregion Properties

    //#region Methods
    normalize(): this
    fromComponents(sign: number, layer: number, mag: number): this
    fromComponents_noNormalize(sign: number, layer: number, mag: number): this
    fromMantissaExponent(mantissa: number, exponent: number): this
    fromMantissaExponent_noNormalize(mantissa: number, exponent: number): this
    fromDecimal(value: Decimal): this
    fromNumber(value: number): this
    fromString(value: string): Decimal
    fromValue(value: DecimalSource): Decimal
    toNumber(): number
    mantissaWithDecimalPlaces(places: number): number
    magnitudeWithDecimalPlaces(places: number): number
    toString(): string
    toExponential(places: number): string
    toFixed(places: number): string
    toPrecision(places: number): string
    valueOf(): string
    toJSON(): string
    toStringWithDecimalPlaces(places: number): string
    abs(): Decimal
    neg(): Decimal
    negate(): Decimal
    negated(): Decimal
    sgn(): number
    round(): this | Decimal
    floor(): this | Decimal
    ceil(): this | Decimal
    trunc(): this | Decimal
    add(value: DecimalSource): this | Decimal
    plus(value: DecimalSource): Decimal
    sub(value: DecimalSource): Decimal
    subtract(value: DecimalSource): Decimal
    minus(value: DecimalSource): Decimal
    mul(value: DecimalSource): Decimal
    multiply(value: DecimalSource): Decimal
    times(value: DecimalSource): Decimal
    div(value: DecimalSource): Decimal
    divide(value: DecimalSource): Decimal
    divideBy(value: DecimalSource): Decimal
    dividedBy(value: DecimalSource): Decimal
    recip(): Decimal
    reciprocal(): Decimal
    reciprocate(): Decimal
    /**
     * -1 for less than value, 0 for equals value, 1 for greater than value
     */
    cmp(value: DecimalSource): CompareResult
    cmpabs(value: DecimalSource): CompareResult
    compare(value: DecimalSource): CompareResult
    isNan(): boolean
    isFinite(): boolean
    eq(value: DecimalSource): boolean
    equals(value: DecimalSource): boolean
    neq(value: DecimalSource): boolean
    notEquals(value: DecimalSource): boolean
    lt(value: DecimalSource): boolean
    lte(value: DecimalSource): boolean
    gt(value: DecimalSource): boolean
    gte(value: DecimalSource): boolean
    max(value: DecimalSource): Decimal
    min(value: DecimalSource): Decimal
    maxabs(value: DecimalSource): Decimal
    minabs(value: DecimalSource): Decimal
    clamp(min: DecimalSource, max: DecimalSource): Decimal
    clampMin(min: DecimalSource): Decimal
    clampMax(max: DecimalSource): Decimal
    cmp_tolerance(value: DecimalSource, tolerance: number): CompareResult
    compare_tolerance(value: DecimalSource, tolerance: number): CompareResult
    /**
     * Tolerance is a relative tolerance, multiplied by the greater of the magnitudes of the two arguments.
     * For example, if you put in 1e-9, then any number closer to the
     * larger number than (larger number)*1e-9 will be considered equal.
     */
    eq_tolerance(value: DecimalSource, tolerance: number): boolean
    equals_tolerance(value: DecimalSource, tolerance: number): boolean
    neq_tolerance(value: DecimalSource, tolerance: number): boolean
    notEquals_tolerance(value: DecimalSource, tolerance: number): boolean
    lt_tolerance(value: DecimalSource, tolerance: number): boolean
    lte_tolerance(value: DecimalSource, tolerance: number): boolean
    gt_tolerance(value: DecimalSource, tolerance: number): boolean
    gte_tolerance(value: DecimalSource, tolerance: number): boolean
    pLog10(): Decimal
    absLog10(): Decimal
    log10(): Decimal
    log(base: DecimalSource): Decimal
    log2(): Decimal
    ln(): Decimal
    logarithm(base: DecimalSource): Decimal
    pow(value: DecimalSource): Decimal
    pow10(): Decimal
    pow_base(value: DecimalSource): Decimal
    root(value: DecimalSource): Decimal
    factorial(): Decimal
    gamma(): Decimal
    lngamma(): Decimal
    exp(): Decimal
    sqr(): Decimal
    sqrt(): Decimal
    cube(): Decimal
    cbrt(): Decimal
    tetrate(height?: number, payload?: DecimalSource): Decimal
    iteratedexp(height?: number, payload?: Decimal): Decimal
    iteratedlog(base?: DecimalSource, times?: number): Decimal
    slog(base?: DecimalSource): Decimal
    layeradd10(diff: DecimalSource): Decimal
    layeradd(diff: number, base: DecimalSource): Decimal
    lambertw(): Decimal
    ssqrt(): Decimal
    pentate(height?: number, payload?: DecimalSource): Decimal
    sin(): this | Decimal
    cos(): Decimal
    tan(): this | Decimal
    asin(): this | Decimal
    acos(): Decimal
    atan(): this | Decimal
    sinh(): Decimal
    cosh(): Decimal
    tanh(): Decimal
    asinh(): Decimal
    acosh(): Decimal
    atanh(): Decimal
    /**
     * Joke function from Realm Grinder
     */
    ascensionPenalty(ascensions: DecimalSource): Decimal
    /**
     * Joke function from Cookie Clicker. It's 'egg'
     */
    egg(): Decimal
    lessThanOrEqualTo(other: DecimalSource): boolean
    lessThan(other: DecimalSource): boolean
    greaterThanOrEqualTo(other: DecimalSource): boolean
    greaterThan(other: DecimalSource): boolean
    //#endregion Methods
}

declare class Layer<L extends string> {
    /**
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar to access the saved value.
     * It makes copying code to new layers easier. It is also assigned to all upgrades and buyables and such.
     */
    readonly layer: L
    /**
     * Used in reset confirmations (and the default infobox title).
     * If absent, it just uses the layer's id.
     */
    name?: string
    /**
     * A function to return the default save data for this layer.
     * Add any variables you have to it. Make sure to use `Decimal` values rather than normal numbers.
     */
    startData(): Player[L]
    /**
     * A color associated with this layer, used in many places. (A string in hex format with a #)
     */
    color: string
    /**
     * The row of the layer, starting at 0.
     * This affects where the node appears on the standard tree, and which resets affect the layer.
     *
     * Using "side" instead of a number will cause the layer to appear off to the side as a smaller node
     * (useful for achievements and statistics). Side layers are not affected by resets unless you add a doReset to them.
     */
    row: number | 'side'
    /**
     * **OVERRIDE**
     *
     * Changes where the layer node appears without changing where it is in the reset order.
     */
    displayRow?: Computable<number>
    /**
     * Name of the main currency you gain by resetting on this layer.
     */
    resource: string
    /**
     * A function that calculates and returns the current values of any bonuses inherent to the main currency.
     * Can return a value or an object containing multiple values.
     * *You will also have to implement the effect where it is applied.*
     */
    effect?(): any
    /**
     * A function that returns a description of this effect.
     * If the text stays constant, it can just be a string.
     */
    effectDescription?: Computable<string>
    /**
     * A function returning a bool which determines if this layer's node should be visible on the tree.
     * It can also return "ghost", which will hide the layer, but its node will still take up space in the tree.
     * Defaults to true.
     */
    layerShown?(): boolean | 'ghost'
    /**
     * An array containing information on any hotkeys associated with this layer
     */
    hotkeys?: Hotkey[]
    /**
     * A "CSS object" where the keys are CSS attributes, containing any CSS that should affect this layer's entire tab.
     */
    style?: Computable<CSSStyles>
    /**
     * Use this if you want to add extra things to your tab or change the layout.
     *
     * See the docs about it.
     */
    tabFormat?: {
        [id: string]: {
            /**
             * The tab layout code for the subtab, in the tab layout format.
             */
            content: Computable<TabFormatEntries<L>[]>
            /**
             * Applies CSS to the whole subtab when switched to, in the form of an "CSS Object", where the keys are CSS attributes,
             * and the values are the values for those attributes (both as strings).
             */
            style?: Computable<CSSStyles>
            /**
             * A CSS object, which affects the appearance of the button for that subtab.
             */
            buttonStyle?: Computable<CSSStyles>,
            /**
             * A function to determine if the button for this subtab should be visible.
             * By default, a subtab is always unlocked. You can't use the "this" keyword in this function.
             */
            unlocked?: Computable<boolean>,
            /**
             * If true, the tab button will be highlighted to notify the player that there is something there.
             */
            shouldNotify?(): boolean,
            /**
             * If true, the tab button will be highlighted to notify the player that there is something there.
             */
            prestigeNotify?(): boolean,
            /**
             * specifies the color that the subtab glows. If this subtab is causing the main layer to node glow
             * (and it would't otherwise) the node also glows this color. Is NOT overridden by embedding a layer.
             */
            glowColor?: Computable<string>,
            /**
             * **SIGNIFICANT**
             *
             * The id of another layer. If you have this, it will override "content", "style" and "shouldNotify",
             * instead displaying the entire layer in the subtab.
             */
            embedLayer?: string,
            /**
             * Specifies the shown name of the subtab
             */
            name?: Computable<string>,
        }
    }
    /**
     * An alternative to `tabFormat`, which is inserted in between Milestones and Buyables in the standard tab layout. (cannot do subtabs)
     */
    midsection?: (string | [string, any])[]

    // Big features
    /**
     * A set of one-time purchases which can have unique upgrade conditions, currency costs, and bonuses.
     */
    upgrades: { [id: string]: Upgrade<L> }
    /**
     * A list of bonuses gained upon reaching certain thresholds of a resource. Often used for automation/QOL.
     */
    milestones: { [id: string]: Milestone<L> }
    /**
     * The player can enter challenges, which make the game harder.
     * If they reach a goal and beat the challenge, they recieve a bonus.
     */
    challenges?: { [id: string]: Challenge<L> }
    /**
     * Effectively upgrades that can be bought multiple times, and are optionally respeccable. Many uses.
     */
    buyables?: {
        /**
         * To add a respec button, or something similar,
         * add the respecBuyables function to the main buyables object (not individual buyables).
         */
        respecBuyables?(): void,
        /**
         * This is called when the button is pressed (after a toggleable confirmation message).
         */
        respec?(): void,
        /**
         * Text to display on the respec Button.
         */
        respecText?: Computable<string>
        /**
         * A function determining whether or not to show the button,
         * if `respecBuyables` is defined. Defaults to true if absent.
         */
        showRespec?(): boolean,
        /**
         * A custom confirmation message on respec, in place of the default one.
         */
        respecMessage?: Computable<string>
    } & {
        [id: string]: Buyable<L>,
    }
    /**
     * Extremely versatile and generalized buttons which can only be clicked sometimes.
     */
    clickables?: {
        /**
         * If present, an additional button will appear above the clickables. Pressing it will call this function.
         */
        masterButtonPress?(): void,
        /**
         * Text to display on the Master Button.
         */
        masterButtonText?: Computable<string>
        /**
         * A function determining whether or not to show the button, if `masterButtonPress` is defined. Defaults to true if absent.
         */
        showMasterButton?(): boolean,
    } & {
        [id: string]: Clickable<L>,
    }
    /**
     * An area that functions like a set of subtabs,
     * with buttons at the top changing the content within. (Advanced)
     */
    microtabs?: {
        [id: string]: {
            [id: string]: {
                /**
                 * The tab layout code for the subtab, in the tab layout format.
                 */
                content: (string | [string, any])[],
                /**
                 * Applies CSS to the whole subtab when switched to, in the form of an "CSS Object", where the keys are CSS attributes,
                 * and the values are the values for those attributes (both as strings).
                 */
                style?: Computable<CSSStyles>
                /**
                 * A CSS object, which affects the appearance of the button for that subtab.
                 */
                buttonStyle?: Computable<CSSStyles>,
                /**
                 * A function to determine if the button for this subtab should be visible.
                 * By default, a subtab is always unlocked. You can't use the "this" keyword in this function.
                 */
                unlocked?: Computable<boolean>,
                /**
                 * If true, the tab button will be highlighted to notify the player that there is something there.
                 */
                shouldNotify?(): boolean,
                /**
                 * If true, the tab button will be highlighted to notify the player that there is something there.
                 */
                prestigeNotify?(): boolean,
                /**
                 * specifies the color that the subtab glows. If this subtab is causing the main layer to node glow
                 * (and it would't otherwise) the node also glows this color. Is NOT overridden by embedding a layer.
                 */
                glowColor?: Computable<string>,
                /**
                 * **SIGNIFICANT**
                 *
                 * The id of another layer. If you have this, it will override "content", "style" and "shouldNotify",
                 * instead displaying the entire layer in the subtab.
                 */
                embedLayer?: string,
            }
        }
    }
    /**
     * Display some information as a progress bar, gague, or similar. They are highly customizable, and can be vertical as well.
     */
    bars?: { [id: string]: Bar<L> }
    /**
     * Kind of like milestones, but with a different display style and some other differences. Extra features are on the way at a later date!
     */
    achievements?: { [id: string]: Achievement<L> }
    /**
     * If false, disables popup message when you get the achievement. True by default.
     */
    achievementPopups?: Computable<boolean>;
    /**
     * If false, disables popup message when you get the milestone. True by default.
     */
    milestonePopups?: Computable<boolean>;
    /**
     * Displays some text in a box that can be shown or hidden.
     */
    infoboxes?: { [id: string]: Infobox<L> }
    /**
     * A grid of buttons that behave the same, but have their own data.
     */
    grid?: {
        /**
         * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
         */
        readonly layer: string,

        /**
         * The amount of rows of gridable to display.
         */
        rows: Computable<number>,
        /**
         * The amount of columns of gridable to display.
         */
        cols: Computable<number>,
        /**
         * If rows are dynamic, you need to define the maximum amount that there can be
         * (you can increase it when you update the game though). These CANNOT be dynamic.
         */
        maxRows: number,
        /**
         * If cols are dynamic, you need to define the maximum amount that there can be
         * (you can increase it when you update the game though). These CANNOT be dynamic.
         */
        maxCols: number,
        /**
         * Creates the default data for the gridable at this position. This can be an object, or a regular value.
         */
        getStartData(id: number): Player[L]['grid'][number],
        /**
         * Returns true if the gridable at this position should be visible.
         */
        getUnlocked?(id: number): boolean,
        /**
         * Returns text that should displayed at the top in a larger font, based on the position and data of the gridable.
         */
        getTitle?(data: Player[L]['grid'][number], id: number): string,
        /**
         * Returns everything that should be displayed on the gridable after the title, based on the position and data of the gridable.
         */
        getDisplay?(data: Player[L]['grid'][number], id: number): string,
        /**
         * Returns CSS to apply to this gridable, in the form of an object where the keys are CSS attributes,
         * and the values are the values for those attributes (both as strings).
         */
        getStyle?(data: Player[L]['grid'][number], id: number): CSSStyles,
        /**
         * A function returning a bool to determine if you can click a gridable,
         * based on its data and position. If absent, you can always click it.
         */
        getCanClick?(data: Player[L]['grid'][number], id: number): boolean,
        /**
         * A function that implements clicking on the gridable, based on its position and data.
         */
        onClick(data: Player[L]['grid'][number], id: number): void,
        /**
         * A function that is called 20x/sec when the button is held for at least 0.25 seconds.
         */
        onHold?(data: Player[L]['grid'][number], id: number): void,
        /**
         * A function that calculates and returns a gridable's effect,
         * based on its position and data. (Whatever that means for a gridable)
         */
        getEffect?(data: Player[L]['grid'][number], id: number): void,
        /**
         * Adds a tooltip to the gridables, appears when they hovered over.
         * Can use basic HTML. Default is no tooltip. If this returns an empty value, that also disables the tooltip.
         */
        getTooltip?(data: Player[L]['grid'][number], id: number): string,
    }

    /**
     * Determines which prestige formula you use. Defaults to "none".
     *
     * - "normal": The amount of currency you gain is independent of its current amount (like Prestige). The formula before bonuses is based on `baseResource^exponent`
     * - "static": The cost is dependent on your total after reset. The formula before bonuses is based on `base^(x^exponent)`
     * - "custom": You can define everything, from the calculations to the text on the button, yourself. (See more at the bottom)
     * - "none": This layer does not prestige, and therefore does not need any of the other features in this section.
     */
    type?: 'normal' | 'static' | 'custom' | 'none'
    /**
     * The name of the resource that determines how much of the main currency you gain on reset.
     */
    baseResource: string
    /**
     * A function that gets the current value of the base resource.
     */
    baseAmount(): Decimal
    /**
     * A Decimal, the amount of the base needed to gain 1 of the prestige currency.
     * Also the amount required to unlock the layer.
     * You can instead make this a function, to make it harder if another layer was unlocked first (based on unlockOrder).
     */
    requires: Computable<Decimal>
    /**
     * Used as described in type
     */
    exponent: Decimal
    /**
     * Required for "static" layers, used as described in type.
     * If absent, defaults to 2. Must be greater than 1.
     */
    base?: Decimal
    /**
     * A bool, which is true if the resource cost needs to be rounded up.
     * (use if the base resource is a "static" currency.)
     */
    roundUpCost?: boolean
    /**
     * For normal layers, this function calculates the multiplier
     * on resource gain from upgrades and boosts and such. Plug in most bonuses here.
     *
     * For static layers, it instead multiplies the cost of the resource.
     * (So to make a boost you want to make gainMult smaller.)
     */
    gainMult?(): Decimal
    /**
     * For normal layers, this function calculates the exponent
     * on resource gain from upgrades and boosts and such. Plug in most bonuses here.
     *
     * For static layers, it instead roots the cost of the resource.
     * (So to make a boost you want to make gainExp larger.)
     */
    gainExp?(): Decimal
    /**
     * Directly multiplies the resource gain, after exponents and softcaps.
     *
     * For static layers, actually multiplies resource gain instead of reducing the cost.
     */
    directMult?(): Decimal
    /**
     * For normal layers, gain beyond `softcap` points is put to the `softcapPower`th power.
     *
     * Default for softcap is e1e7.
     */
    softcap?: Computable<Decimal>
    /**
     * For normal layers, gain beyond `softcap` points is put to the `softcapPower`th power.
     *
     * Default for power is 0.5.
     */
    softcapPower?: Computable<Decimal>

    /**
     * Required for static layers, function used to determine if buying max is permitted.
     */
    canBuyMax?: Computable<boolean>
    /**
     * A function that triggers when this layer prestiges, just before you gain the currency.
     * Can be used to have secondary resource gain on prestige, or to recalculate things or whatnot.
     */
    onPrestige?(gain: Decimal): void
    /**
     * Use this to replace "Reset for " on the Prestige button with something else.
     */
    resetDescription?: Computable<string>
    /**
     * Use this to make the entirety of the text a Prestige button contains.
     * Only required for custom layers, but usable by all types.
     */
    prestigeButtonText?(): string
    /**
     * You automatically generate your gain times this number every second (does nothing if absent).
     * This is good for automating Normal layers.
     */
    passiveGeneration?: Computable<number>
    /**
     * If true, the layer will always automatically do a prestige if it can.
     * This is good for automating Static layers.
     */
    autoPrestige?: Computable<boolean>

    /**
     * The text that appears on this layer's node. Default is the layer id with the first letter capitalized.
     */
    symbol?: Computable<string>
    /**
     * **override**
     *
     * The url (local or global) of an image that goes on the node. (Overrides symbol)
     */
    image?: string
    /**
     * Determines the horizontal position of the layer in its row in a standard tree.
     * By default, it uses the layer id, and layers are sorted in alphabetical order.
     */
    position?: number
    /**
     * An array of layer/node ids.
     * On a tree, a line will appear from this layer to all of the layers in the list.
     * Alternatively, an entry in the array can be a 2-element array consisting of the layer id and a color value.
     * The color value can either be a string with a hex color code, or a number from 1-3 (theme-affected colors).
     * A third element in the array optionally specifies line width.
     */
    branches?: Computable<(keyof Layers)[] | [keyof Layers, string | 1 | 2 | 3, number?][]>
    /**
     * A CSS object, where the keys are CSS attributes, which styles this layer's node on the tree.
     */
    nodeStyle: Computable<CSSStyles>
    /**
     * Functions that return text, which is the tooltip for the node when the layer is unlocked.
     * By default the tooltips behave the same as in the original Prestige Tree.
     * If the value is "", the tooltip will be disabled.
     */
    tooltip?(): string
    /**
     * Functions that return text, which is the tooltip for the node when the layer is locked.
     * By default the tooltips behave the same as in the original Prestige Tree.
     * If the value is "", the tooltip will be disabled.
     */
    tooltipLocked?(): string
    /**
     * Adds a mark to the corner of the node. If it's "true" it will be a star, but it can also be an image URL.
     */
    marked?: Computable<string>

    /**
     * Is triggered when a layer on a row greater than or equal to this one does a reset.
     * The default behavior is to reset everything on the row, but only if it was triggered by a layer in a higher row.
     * `doReset` is always called for side layers, but for these the default behavior is to reset nothing.
     *
     * If you want to keep things, determine what to keep based on `resettingLayer`,
     * `milestones`, and such, then call `layerDataReset(layer, keep)`, where `layer` is this layer,
     * and `keep` is an array of the names of things to keep.
     * It can include things like "points", "best", "total" (for this layer's prestige currency),
     * "upgrades", any unique variables like "generatorPower", etc.
     * If you want to only keep specific upgrades or something like that, save them in a separate variable,
     * then call `layerDataReset`, and then set `player[this.layer].upgrades` to the saved upgrades.
     */
    doReset?(resettingLayer: keyof Layers): void
    /**
     * This function is called every game tick.
     * Use it for any passive resource production or time-based things.
     * `diff` is the time since the last tick.
     */
    update?(diff: number): void
    /**
     * If true, the game will attempt to buy this layer's upgrades every tick. Defaults to false.
     */
    autoUpgrade?: Computable<boolean>
    /**
     * This function is called every game tick, after production.
     * Use it to activate automation things that aren't otherwise supported.
     */
    automate?(): void
    /**
     * Returns true if this layer shouldn't trigger any resets when you prestige.
     */
    resetsNothing?: Computable<boolean>
    /**
     * An array of layer ids. When this layer is unlocked for the first time,
     * the `unlockOrder` value for any not-yet-unlocked layers in this list increases.
     * This can be used to make them harder to unlock.
     */
    //increaseUnlockOrder?: string[]
    /**
     * A function to return true if this layer should be highlighted in the tree.
     * The layer will automatically be highlighted if you can buy an upgrade whether you have this or not.
     */
    shouldNotify?(): boolean
    /**
     * The color that this layer will be highlighted if it should notify.
     * The default is red. You can use this if you want several different notification types!
     */
    glowColor?: Computable<string>
    /**
     * An object that contains a set of functions returning CSS objects. Each of these will be applied to any components on the layer with the type of its id. Example:
     *
     * ```js
     * componentStyles: {
     *     "challenge"() { return {'height': '200px'} },
     *     "prestige-button"() { return {'color': '#AA66AA'} }
     * }
     * ```
     */
    componentStyles?: Computable<{ [k: string]: CSSStyles }>
    /**
     * If true, this layer will use the left tab instead of the right tab.
     */
    leftTab?: Computable<boolean>
    /**
     * A layer's id. If a layer has a previousTab,
     * the layer will always have a back arrow and pressing the back arrow on this layer will take you to the layer with this id.
     */
    previousTab?: Computable<string>
    /**
     * If this is true, `hasUpgrade`, `hasChallenge`, `hasAchievement`,
     * and `hasMilestone` will return false for things in the layer,
     * and you will be unable to buy or click things, or gain achievements/milestones on the layer.
     * You will have to disable effects of buyables, the innate layer effect, and possibly other things yourself.
     */
    deactivated?: Computable<boolean>

    /**
     * Returns how many points you should get if you reset now.
     * You can call `getResetGain(this.layer, useType = "static")` or similar to calculate what
     * your gain would be under another prestige type (provided you have all of the required features in the layer).
     */
    getResetGain?(): Decimal
    /**
     * Returns how many of the base currency you need to get to the next point.
     * `canMax` is an optional variable used with Static-ish layers to differentiate between
     * if it's looking for the first point you can reset at, or the requirement for any gain at all (Supporting both is good).
     * You can also call `getNextAt(this.layer, canMax=false, useType = "static")` or
     * similar to calculate what your next at would be under another prestige type
     * (provided you have all of the required features in the layer).
     */
    getNextAt?(canMax: boolean): Decimal
    /**
     * Return true only if you have the resources required to do a prestige here.
     */
    canReset?(): boolean
    /**
     * Returns true if this layer should be subtly highlighted to indicate you
     * can prestige for a meaningful gain.
     */
    prestigeNotify?(): boolean
}

declare class Achievement<L extends string> {
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
     */
    readonly layer: L;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the achievement was stored under, for convenient access.
     */
    readonly id: string;

    /**
     * Displayed at the top of the achievement. * The only visible text.
     * It can also be a function that returns updating text. * Can use basic HTML.
     */
    name?: Computable<string>;
    /**
     * A function returning a boolean to determine if the achievement should be awarded.
     */
    done(): boolean
    /**
     * Default tooltip for the achievement, appears when it is hovered over.
     * Should convey the goal and any reward for completing the achievement.
     * It can also be a function that returns updating text.
     * Can use basic HTML. Setting this to "" disables the tooltip.
     */
    tooltip?: Computable<string>;
    /**
     * A function that calculates and returns the current values of any bonuses from the achievement.
     * Can return a value or an object containing multiple values.
     */
    effect?(): any
    /**
     * A function returning a bool to determine if the achievement is visible or not. Default is unlocked.
     */
    unlocked?(): boolean
    /**
     * This function will be called when the achievement is completed.
     */
    onComplete?(): void
    /**
     * Puts the image from the given URL (relative or absolute) in the achievement.
     */
    image?: string;
    /**
     * Applies CSS to this achievement, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    style?: Computable<CSSStyles>;
    /**
     * Applies CSS to the text, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    textStyle?: Computable<CSSStyles>;
    /**
     * @deprecated
     *
     * Appears when the achievement is hovered over and locked, overrides the basic tooltip.
     * This is to display the goal (or a hint).
     * It can also be a function that returns updating text. Can use basic HTML.
     */
    goalTooltip?: Computable<string>;
    /**
     * @deprecated
     *
     * Appears when the achievement is hovered over and completed, overrides the basic tooltip.
     * This can display what the player achieved (the goal), and the rewards, if any.
     * It can also be a function that returns updating text. Can use basic HTML.
     */
    doneTooltip?: Computable<string>;
}

declare class Bar<L extends string> {
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
     */
    readonly layer: L;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the bar was stored under, for convenient access.
     */
    readonly id: string;

    /**
     * UP (0), DOWN (1), LEFT (2), or RIGHT (3) (not strings).
     *
     * Determines the direction that the bar is filled as it progresses.
     * RIGHT means from left to right.
     */
    direction: 0 | 1 | 2 | 3;
    /**
     * The size in pixels of the bar, but as numbers (no "px" at the end).
     */
    width: number;
    /**
     * The size in pixels of the bar, but as numbers (no "px" at the end).
     */
    height: number;
    /**
     * A function that returns the portion of the bar that is filled, from "empty" at 0 to "full" at 1, updating automatically.
     * (Nothing bad happens if the value goes out of these bounds, and it can be a number or `Decimal`.)
     */
    progress(): number | Decimal
    /**
     * A function that returns text to be displayed on top of the bar, can use HTML.
     */
    display?: Computable<string>
    /**
     * A function returning a bool to determine if the bar is visible or not.
     * Default is unlocked.
     */
    unlocked?(): boolean
    /**
     * Apply CSS to the unfilled portion on the bar,
     * in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    baseStyle?: Computable<CSSStyles>
    /**
     * Apply CSS to the filled portion on the bar,
     * in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    fillStyle?: Computable<CSSStyles>
    /**
     * Apply CSS to the border on the bar,
     * in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    borderStyle?: Computable<CSSStyles>
    /**
     * Apply CSS to the display text on the bar,
     * in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    textStyle?: Computable<CSSStyles>
    /**
     * If this is true, the bar will instantly snap to the current value instead of animating in between.
     * Good for things involving precise timing.
     */
    instant?: Computable<boolean>
}

declare class Buyable<L extends string> {
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
     */
    readonly layer: L;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the buyable was stored under, for convenient access.
     */
    readonly id: number;

    /**
     * Displayed at the top in a larger font.
     */
    title?: Computable<string>
    /**
     * Cost for buying the next buyable.
     * Can have an optional argument "x" to calculate the cost of the x+1th purchase. (x is a `Decimal`).
     * Can return an object if there are multiple currencies.
     */
    cost(x: Decimal): any
    /**
     * A function that calculates and returns the current values of bonuses of this buyable.
     * Can have an optional argument "x" to calculate the effect of having x of the buyable.
     * Can return a value or an object containing multiple values.
     */
    effect?(x: Decimal): any
    /**
     * A function returning everything that should be displayed on the buyable after the title,
     * likely including the description, amount bought, cost, and current effect. Can use basic HTML.
     */
    display: Computable<string>
    /**
     * A function returning a bool to determine if the buyable is visible or not. Default is unlocked.
     */
    unlocked?: Computable<boolean>
    /**
     * A function returning a bool to determine if you can buy one of the buyables.
     */
    canAfford(): boolean
    /**
     * A function that implements buying one of the buyable, including spending the currency.
     */
    buy(): void
    /**
     * A function that implements buying as many of the buyable as possible.
     */
    buyMax?(): void
    /**
     * Applies CSS to this buyable, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    style?: Computable<CSSStyles>;
    /**
     * The limit on how many of the buyable can be bought.
     * The default is no limit.
     */
    purchaseLimit?: Computable<Decimal>
    /**
     * Adds a mark to the corner of the buyable.
     * If it's "true" it will be a star, but it can also be an image URL.
     */
    marked?: Computable<boolean | string>
    /**
     * Adds a tooltip to this buyable, appears when it is hovered over.
     * Can use basic HTML. Default is no tooltip.
     * If this returns an empty value, that also disables the tooltip.
     */
    tooltip?: Computable<string>
    /** Additionnal amount to be added to the buyable amount to compute the effects */
    bonusAmount?(): Decimal
    /**
     * Called when the button is pressed.
     * The standard use would be to decrease the amount of the buyable,
     * and possibly return some currency to the player.
     */
    sellOne?(): void
    /**
     * Called when the button is pressed.
     * The standard use would be to reset the amount of the buyable,
     * and possibly return some currency to the player.
     */
    sellAll?(): void
    /**
     * Booleans determining whether or not to show the buttons.
     * If `canSellOne` is absent but `sellOne` is present,
     * the appropriate button will always show.
     */
    canSellOne?(): boolean
    /**
     * Booleans determining whether or not to show the buttons.
     * If `canSellAll` is absent but `sellAll` is present,
     * the appropriate button will always show.
     */
    canSellAll?(): boolean
    /**
     * This is primarially useful for buyable trees. An array of buyable ids.
     * A line will appear from this buyable to all of the buyables in the list.
     * Alternatively, an entry in the array can be a 2-element array consisting of the buyable id and a color value.
     * The color value can either be a string with a hex color code, or a number from 1-3 (theme-affected colors).
     * A third element in the array optionally specifies line width.
     */
    branches?: Computable<string[] | [string, string | 1 | 2 | 3, number?][]>
}

declare class Challenge<L extends string> {
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
     */
    readonly layer: L;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the challenge was stored under, for convenient access.
     */
    readonly id: string;

    /**
     * Name of the challenge, can be a string or a function. Can use basic HTML.
     */
    name: Computable<string>
    /**
     * A description of what makes the challenge a challenge.
     * *You will need to implement these elsewhere.*
     * It can also be a function that returns updating text. Can use basic HTML.
     */
    challengeDescription: Computable<string>
    /**
     * A description of the win condition for the challenge.
     * It can also be a function that returns updating text.
     * Can use basic HTML.
     */
    goalDescription: Computable<string>
    /**
     * A function that returns true if you meet the win condition for the challenge.
     * Returning a number will allow bulk completing the challenge.
     */
    canComplete(): boolean | number
    /**
     * A description of the reward's effect.
     * *You will also have to implement the effect where it is applied.*
     * Can use basic HTML.
     */
    rewardDescription: Computable<string>
    /**
     * A function that calculates and returns the current values of any bonuses from the reward.
     * Can return a value or an object containing multiple values. Can use basic HTML.
     */
    rewardEffect?(): any
    /**
     * A function that returns a display of the current effects of the reward with formatting.
     * Default behavior is to just display the a number appropriately formatted.
     */
    rewardDisplay?(): string
    /**
     * **OVERRIDE**
     *
     * Overrides the other displays and descriptions,
     * and lets you set the full text for the challenge. Can use basic HTML.
     */
    fullDisplay?(): string
    /**
     * A function returning a bool to determine if the challenge is visible or not. Default is unlocked.
     */
    unlocked?(): boolean
    /**
     * This function will be called when the challenge is completed when previously incomplete.
     */
    onComplete?(): void
    /**
     * This function will be called when entering the challenge.
     */
    onEnter?(): void
    /**
     * This function will be called when exiting the challenge in any way.
     */
    onExit?(): void
    /**
     * If a challenge combines the effects of other challenges in this layer, you can use this.
     * An array of challenge ids. The player is effectively in all of those challenges when in the current one.
     */
    countsAs?: number[]
    /**
     * The amount of times you can complete this challenge. Default is 1 completion.
     */
    completionLimit?: number
    /**
     * Applies CSS to this challenge, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    style?: Computable<CSSStyles>
    /**
     * Applies CSS to this challenge's button, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    buttonStyle?: Computable<CSSStyles>
    /**
     * Adds a mark to the corner of the challenge.
     * If it's "true" it will be a star, but it can also be an image URL.
     * By default, if the challenge has multiple completions, it will be starred at max completions.
     */
    marked?: Computable<boolean | string>
}

declare class Clickable<L extends string> {
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
     */
    readonly layer: L;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the clickable was stored under, for convenient access.
     */
    readonly id: string;

    /**
     * Displayed at the top in a larger font.
     */
    title?: Computable<string>
    /**
     * A function that calculates and returns the current values of bonuses of this clickable.
     * Can return a value or an object containing multiple values.
     */
    effect?(): any
    /**
     * A function returning everything that should be displayed on the clickable after the title,
     * likely changing based on its state. Can use basic HTML.
     */
    display: Computable<string>
    /**
     * A function returning a bool to determine if the clickable is visible or not. Default is unlocked.
     */
    unlocked?(): boolean
    /**
     * A function returning a bool to determine if you can click the clickable.
     */
    canClick(): boolean
    /**
     * A function that implements clicking the clickable.
     */
    onClick(): void
    /**
     * A function that is called 20x/sec when the button is held for at least 0.25 seconds.
     */
    onHold(): void
    /**
     * Applies CSS to this clickable, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    style?: Computable<CSSStyles>
    /**
     * Adds a mark to the corner of the clickable.
     * If it's "true" it will be a star, but it can also be an image URL.
     */
    marked?: Computable<boolean | string>
    /**
     * Adds a tooltip to this clickable, appears when it is hovered over.
     * Can use basic HTML. Default is no tooltip.
     * If this returns an empty value, that also disables the tooltip.
     */
    tooltip?: Computable<string>
    /**
     * This is primarially useful for clickable trees. An array of clickable ids.
     * A line will appear from this clickable to all of the clickables in the list.
     * Alternatively, an entry in the array can be a 2-element array consisting of the clickable id and a color value.
     * The color value can either be a string with a hex color code, or a number from 1-3 (theme-affected colors).
     * A third element in the array optionally specifies line width.
     */
    branches?: Computable<string[] | [string, string | 1 | 2 | 3, number?][]>
}

declare class Infobox<L extends string> {
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
     */
    readonly layer: L;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the infobox was stored under, for convenient access.
     */
    readonly id: string;

    /**
     * The text displayed above the main box. Can use basic HTML.
     */
    title: Computable<string>
    /**
     * The text displayed inside the box. Can use basic HTML.
     */
    body: Computable<string>
    /**
     * Apply CSS to the infobox in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    style?: Computable<CSSStyles>
    /**
     * Apply CSS to the title button of the infobox,
     * in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    titleStyle?: Computable<CSSStyles>
    /**
     * Apply CSS to the body of the infobox,
     * in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    bodyStyle?: Computable<CSSStyles>
    /**
     * A function returning a bool to determine if the infobox is visible or not. Default is unlocked.
     */
    unlocked?(): boolean
}

declare class Hotkey {
    /**
     * What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" for holding down ctrl.
     */
    key: string
    /**
     * The description of the hotkey that is displayed in the game's How To Play tab.
     */
    description: Computable<string>
    onPress(): void
    /**
     * Determines if you can use the hotkey.
     */
    unlocked?: Computable<boolean>
}

declare class Milestone<L extends string> {
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
     */
    readonly layer: L;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the milestone was stored under, for convenient access.
     */
    readonly id: string;

    /**
     * A string describing the requirement for unlocking this milestone.
     * Suggestion: Use a "total". Can use basic HTML.
     */
    requirementDescription: Computable<string>
    /**
     * Current effect of the milestone
     */
    effect?: Computable<any>
    /**
     * A string describing the reward for having the milestone.
     * *You will have to implement the reward elsewhere.*
     * Can use basic HTML.
     */
    effectDescription: Computable<string>
    /**
     * A function returning a boolean to determine if the milestone should be awarded.
     */
    done(): boolean
    /**
     * This function will be called when the milestone is completed.
     */
    onComplete?(): void
    /**
     * Creates toggle buttons that appear on the milestone when it is unlocked.
     * The toggles can toggle a given boolean value in a layer.
     * It is defined as an array of paired items, one pair per toggle.
     * The first is the internal name of the layer the value being toggled is stored in,
     * and the second is the internal name of the variable to toggle. (e.g. [["b", "auto"], ["g", "auto"])
     *
     * **Tip:** Toggles are not de-set if the milestone becomes locked! In this case, you should also check if the player has the milestone.
     */
    toggles?: [string, string][]
    /**
     * Applies CSS to this milestone, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    style?: Computable<CSSStyles>
    /**
     * A function returning a boolean to determine if the milestone should be shown. If absent, it is always shown.
     */
    unlocked?: Computable<boolean>
    /**
     * Adds a tooltip to this milestone, appears when it is hovered over.
     * Can use basic HTML. Default is no tooltip.
     * If this returns an empty value, that also disables the tooltip.
     */
    tooltip?: Computable<string>
}

declare class Particle {
    /**
     * The amount of time, in seconds, that the particle will last. Default is 3.
     */
    time?: number
    /**
     * The amount of seconds that fading out at the end should take (part of the total lifetime). Default is 1.
     */
    fadeOutTime?: number
    /**
     * The amount of seconds that fading in should take (part of the total lifetime). Default is 0.
     */
    fadeInTime?: number

    /**
     * The image the particle should display. `""` will display no image. Default is a generic particle.
     */
    image?: string
    /**
     * Displays text on the particle. Can use basic HTML.
     */
    text?: string
    /**
     * Lets you apply other CSS styling to the particle.
     */
    style?: CSSStyles
    /**
     * The dimensions of the particle. Default is 35.
     */
    width?: number
    /**
     * The dimensions of the particle. Default is 35.
     */
    height?: number
    /**
     * Sets the color of the image to this color.
     */
    color?: string

    /**
     * The angle that the particle should face. Default is 0.
     */
    angle?: number
    /**
     * The initial angle that the particles should move in, before spread is factored in. Default is whatever angle is.
     */
    dir?: number
    /**
     * If there are several particles, they will be spread out by this many degrees, centered on dir. Default is 30.
     */
    spread?: number

    /**
     * The amount that the (visual) angle of the particle should change by. Default is 0.
     */
    rotation?: number
    /**
     * The starting speed of the particle. Default is 15.
     */
    speed?: number
    /**
     * The amount the particle should accelerate downwards. Default is 0.
     */
    gravity?: number

    /**
     * The starting coordinates of the particle. Default is at the mouse position.
     */
    x?: number
    /**
     * The starting coordinates of the particle. Default is at the mouse position.
     */
    y?: number
    /**
     * How far from the start each particle should appear. Default is 10.
     */
    offset?: number
    /**
     * Set initially based on other properties, then used to update movement.
     */
    xVel?: number
    /**
     * Set initially based on other properties, then used to update movement.
     */
    yVel?: number

    /**
     * When changing tabs, if leaving the `layer` tab, this particle will be erased.
     */
    layer?: string

    /**
     * Called each tick. Lets you do more advanced visual and movement behaviors by changing other properties.
     */
    update?(): void
    /**
     * Called when the particle is interacted with.
     */
    onClick?(): void
    /**
     * Called when the particle is interacted with.
     */
    onMouseOver?(): void
    /**
     * Called when the particle is interacted with.
     */
    onMouseLeave?(): void
}

declare class TreeNode {
    /**
     * The node's color. (A string in hex format with a #)
     */
    color?: string
    /**
     * The text on the button (The id capitalized by default)
     */
    symbol?: string
    /**
     * Returns true if the player can click the node. ()
     */
    canClick?(): boolean
    /**
     * The function called when the node is clicked.
     */
    onClick?(): boolean
    /**
     * A function returning a bool which determines if this node should be visible.
     * It can also return "ghost", which will hide the layer,
     * but its node will still take up space in its tree.
     */
    layerShown?: Computable<number | 'ghost'>
    /**
     * An array of layer/node ids. On a tree, a line will appear from this node to all of the nodes in the list.
     * Alternatively, an entry in the array can be a 2-element array consisting of the id and a color value.
     * The color value can either be a string with a hex color code, or a number from 1-3 (theme-affected colors).
     */
    branches?: Computable<string[] | [string, string | 1 | 2 | 3, number?][]>
    /**
     * A CSS object, where the keys are CSS attributes, which styles this node on the tree.
     */
    nodeStyle?: Computable<CSSStyles>
    /**
     * Functions that return text, which is the tooltip for the node when the layer is unlocked.
     * By default the tooltips behave the same as in the original Prestige Tree.
     */
    tooltip?: Computable<string>
    /**
     * Functions that return text, which is the tooltip for the node when the layer is locked.
     * By default the tooltips behave the same as in the original Prestige Tree.
     */
    tooltipLocked?: Computable<string>
    /**
     * The row that this node appears in (for the default tree).
     */
    row?: number
    /**
     * Determines the horizontal position of the layer in its row in a default tree. By default, it uses the id,
     * and layers/nodes are sorted in alphabetical order.
     */
    position?: number
}

declare class Upgrade<L extends string> {
    /**
     * **assigned automagically**
     *
     * It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.
     */
    readonly layer: L;
    /**
     * **assigned automagically**
     *
     * It's the "key" which the upgradae was stored under, for convenient access.
     */
    readonly id: string;

    /**
     * Displayed at the top in a larger font. It can also be a function that returns updating text. Can use basic HTML.
     */
    title?: Computable<string>
    /**
     * A description of the upgrade's effect.
     * *You will also have to implement the effect where it is applied.*
     * It can also be a function that returns updating text. Can use basic HTML.
     */
    description: Computable<string>
    /**
     * A function that calculates and returns the current values of any bonuses from the upgrade.
     * Can return a value or an object containing multiple values.
     */
    effect?: Computable<any>
    /**
     * A function that returns a display of the current effects of the upgrade with formatting. Default displays nothing. Can use basic HTML.
     */
    effectDisplay?(): string
    /**
     * **OVERRIDE**
     *
     * Overrides the other displays and descriptions, and lets you set the full text for the upgrade. Can use basic HTML.
     */
    fullDisplay?: Computable<string>
    /**
     * **sort of optional**
     *
     * A Decimal for the cost of the upgrade.
     * By default, upgrades cost the main prestige currency for the layer.
     */
    cost?: Computable<Decimal>
    /**
     * **OVERRIDE**
     *
     * Overrides the cost display without overriding anything else.
     */
    costDisplay?(): string
    /**
     * A function returning a bool to determine if the upgrade is visible or not. Default is unlocked.
     */
    unlocked?: Computable<boolean>
    /**
     * This function will be called when the upgrade is purchased.
     * Good for upgrades like "makes this layer act like it was unlocked first".
     */
    onPurchase?(): void
    /**
     * Applies CSS to this upgrade, in the form of an object where the keys are CSS attributes,
     * and the values are the values for those attributes (both as strings).
     */
    style?: Computable<CSSStyles>
    /**
     * Adds a tooltip to this upgrade, appears when it is hovered over.
     * Can use basic HTML. Default is no tooltip.
     * If this returns an empty value, that also disables the tooltip.
     */
    tooltip?: Computable<string>
    /**
     * **OVERRIDE**
     *
     * A function determining if you are able to buy the upgrade.
     *
     * (If you also have a cost, it will check both the cost and this function)
     */
    canAfford?(): boolean
    /**
     * **OVERRIDE**
     *
     * A function that reduces your currencies when you buy the upgrade.
     */
    pay?(): void
    /**
     * This is primarially useful for upgrade trees. An array of upgrade ids.
     * A line will appear from this upgrade to all of the upgrades in the list.
     * Alternatively, an entry in the array can be a 2-element array consisting of the upgrade id and a color value.
     * The color value can either be a string with a hex color code, or a number from 1-3 (theme-affected colors).
     * A third element in the array optionally specifies line width.
     */
    branches?: Computable<string[] | [string, string | 1 | 2 | 3, number?][]>
}
declare class CurrencyUpgrade<T, L extends string> extends Upgrade<L> {
    /**
     * The name to display for the currency for the upgrade.
     */
    currencyDisplayName: string
    /**
     * The internal name for that currency.
     */
    currencyInternalName: keyof T
    /**
     * The internal name of the layer that currency is stored in.
     * If it's not in a layer (like Points), omit.
     * If it's not stored directly in a layer, instead use `currencyLocation`.
     */
    currencyLayer?: string
    /**
     * If your currency is stored in something inside a layer (e.g. a buyable's amount), you can access it this way.
     * This is a function returning the object in "player" that contains the value (like `player[this.layer].buyables`)
     */
    currencyLocation?(): T
}

declare class LayerData {
    unlocked: boolean
    points: Decimal
    total?: Decimal
    best?: Decimal
    //unlockOrder?: string[]
    resetTime?: number
    upgrades?: number[]
    milestones?: number[]
    activeChallenge?: number | null
    buyables?: { [id: number]: Decimal }
    challenges?: { [id: number]: number }
}

type drop_sources = 'enemy' | 'mining' | 'tree' | 'forge' | 'tamed' | 'tamed_kill' | 'building' | 'plant' | 'freezer';
type resources = 'science' | 'energy';
type items = 'slime_goo' | 'slime_core_shard' | 'slime_core' |
    'red_fabric' | 'pyrite_coin' | 'rusty_gear' |
    'rotten_flesh' | 'brain' |
    'leaf' | 'seed' |
    'stone' | 'copper_ore' | 'tin_ore' | 'coal' | 'iron_ore' | 'gold_ore' |
    'stone_brick' | 'copper_ingot' | 'tin_ingot' | 'iron_ingot' | 'gold_ingot' |
    'bronze_ingot' | 'steel_ingot' |
    'soaked_log' | 'normal_log' | 'plank' |
    'wheat' | 'corn' | 'strawberry' | 'potato' | 'eggplant' | 'egg' |
    'water' | 'ice' |
    'icestone' | 'rust_ingot' |
    'stardust' | 'holy_water';
type temperatures = 'none' | 'low' | 'medium' | 'high' | 'burning';
type dishes = 'failure' |
    'grilled_corn' | 'roasted_eggplant' |
    'bread' | 'berries_bowl' | 'french_fries' |
    'fried_eggs' | 'cake' |
    'ice_cream' | 'popsicle' |
    'slime_juice' | 'monster_meal' | 'star_crunch';
type time_units = 'seconds' | 'tames' | 'kills';

type Layers = {
    // Side
    ach: Layer<'ach'> & {
        getAchievementsRows(type?: AchievementTypes): number[]
        getAchievements(type?: AchievementTypes): string[]
        totalAchievements(type?: AchievementTypes): Decimal
        ownedAchievements(type?: AchievementTypes): Decimal
    }
    clo: Layer<'clo'> & {
        upgrades: {
            [id: number]: Upgrade<'clo'> & { price?: [items, Decimal][] }
        }
        time_speed(layer?: keyof Layers, visual?: boolean): Decimal
    }
    cas: Layer<'cas'> & {
        items: {
            /** Reverse lookup for item drops */
            sources(item: items): {
                chances: { [source: `${drop_sources}:${string}`]: Decimal }
                weights: { [source: `${drop_sources}:${string}`]: Decimal }
                per_second: { [source: `${drop_sources}:${string}`]: Decimal }
                other: `${drop_sources}:${string}`[]
            }
            /**
             * Reverse lookup for items
             *
             * Points to the original item (that was swapped)
             */
            base(item: items, type?: 'chances' | 'weights' | 'challenge'): string
            /** Copy of layers.lo.items.*.items but modified to apply swaps */
            items(source: `${drop_sources}:${string}`): {
                chances?: { [item_id in items]: Decimal }
                weights?: { [item_id in items]: Decimal }
            }
            shuffle(): Record<string, string>
            swap_cost(): Decimal
            swap_cost_formula(): string
            /** Makes an item be replaced with another */
            swap(from: items, dest: items, type?: 'chances' | 'weights' | 'challenge'): void
            /** Removes items swapped with themselves from the player data */
            clean_swaps(): void
            /** Returns a row that displays the swapping */
            show_row(item: items): ['row', [
                ['clickable', `swap_chances_left_${string}`],
                ['clickable', `swap_weights_left_${string}`],
                'blank',
                ['display-text', ' is currently replaced by '],
                'blank',
                ['clickable', `swap_chances_right_${string}`],
                ['clickable', `swap_weights_right_${string}`],
            ]] | undefined
        }
        token: {
            chance(): Decimal
        }
        regex: RegExp
    }
    mag: Layer<'mag'> & {
        elements: {
            '*': {
                /** Damage multiplier when an element is used against a stronger one */
                weak_multiplier: Decimal
                /** Damage multiplier when an element is used against a weaker one */
                strong_multiplier: Decimal
                /**
                 * Returns the element for an entity
                 *
                 * May return a different element on subsequent calls
                 */
                element(enemy: string): string
                /** Returns a random element */
                random(): string
            }
        } & {
            [element: string]: {
                readonly id: string
                name: string
                color: Computable<string>
                effects(): {
                    xp?: {
                        damage_multiplier?: Decimal
                        drop_multiplier?: Decimal
                    }
                    mining?: {
                        regen_multiplier?: Decimal
                        chance_multiplier?: Decimal
                    }
                    tree?: {
                        size_multiplier?: Decimal
                        damage_multiplier?: Decimal
                    }
                }
                /** Strong against */
                strong: string[]
                /** Weak against */
                readonly weak: string[]
            }
        }
        mana: {
            gain(): Decimal
            formula: Computable<string>
            cost: Computable<Decimal>
        }
    }
    sta: Layer<'sta'> & {
        stats: {
            '*': {
                total(): Decimal
                left(): Decimal
                /** Amount of points gained on kill */
                gain(): Decimal
                gain_formula: string
                regex: RegExp
                show_row(stat: string): [['row', [
                    ['display-text', string],
                    'blank',
                    ['clickable', `${string}_increase`],
                    'blank',
                    ['clickable', `${string}_decrease`],
                ]], 'blank'] | undefined
            }
        } & {
            [stat: string]: {
                readonly id: string
                name: string
                effect(): Decimal
                text(): string
            }
        }
    }
    // Row 0
    xp: Layer<'xp'> & {
        color_kill: string
        enemies: {
            '*': {
                color_level(level?: DecimalSource): string
                level_mult(): Decimal
                level_exp(): Decimal
                health_mult(): Decimal
                health_add(): Decimal
                exp_mult(): Decimal
                exp_cap(): Decimal
                kill_mult(): Decimal
                damage_mult(): Decimal
                damage_add(): Decimal
                /** Damage multiplier for dps on the current enemy */
                dps_mult_active(): Decimal
                /** Damage multiplier for dps on all enemies */
                dps_mult_inactive(): Decimal
                /** Added % of health regeneration */
                regen_add(): Decimal
                drops_mult(): Decimal
                /** List of currently unlocked enemies */
                list(): string[]
            }
        } & {
            [type: string]: {
                readonly type: string
                /** Current levels */
                level(): Decimal
                /** Color version of level */
                color_level(): string
                /** Color of the enemy */
                color: Computable<string>
                health(level?: DecimalSource): Decimal
                experience(level?: DecimalSource): Decimal
                /** Gained kills on death */
                kills(): Decimal
                /** Current name (lowercase) */
                name: Computable<string>
                damage(): Decimal
                /** Amount of damage dealt every second */
                dps(): Decimal
                /** Amount of health regenerated each second */
                regen(level?: DecimalSource): Decimal
                /** Determines whether the enemy is visible */
                unlocked(): boolean
            }
        }
        total: {
            kills(): Decimal
        }
    }
    m: Layer<'m'> & {
        upgrades: {
            [id: number]: Upgrade<'m'> & { item: items }
        }
        ore: {
            health(): Decimal
            regen(): Decimal
            chance(mode?: Player['m']['mode']): Decimal
            /** Name of the mode */
            mode(mode?: Player['m']['mode']): string
            /** List of items tracked by the layer */
            items: items[]
            mine_mult(): Decimal
        }
    }
    t: Layer<'t'> & {
        upgrades: {
            [id: number]: Upgrade<'t'> & { item: string }
        }
        trees: {
            '*': {
                health_mult(): Decimal
                growth_mult(): Decimal
                /** Base damage, may be changed depending on trees */
                damage_base(): Decimal
                /** Damage multiplier for dps on the current tree */
                dps_mult_active(): Decimal
                /** Damage multiplier for dps on all trees */
                dps_mult_inactive(): Decimal
                size_add(): Decimal
                size_mult(): Decimal
                cap_add(): Decimal
                cap_mult(): Decimal
                /** Added % of health regeneration */
                regen_add(): Decimal
                /** Tracked items for display */
                items: string[]
                /** Chance to get wood when hitting a tree */
                chance(): Decimal
                /** Total amount of logs */
                logs(): Decimal
            }
        } & {
            [tree: string]: {
                readonly id: string
                unlocked(): boolean
                health: Computable<Decimal>
                name: Computable<string>
                growth: Computable<Decimal>
                regen: Computable<Decimal>
                damage: Computable<Decimal>
                dps: Computable<Decimal>
                /** Amount of wood when felling a tree */
                size: Computable<Decimal>
                cap: Computable<Decimal>
            }
        }
        convertion: {
            /** Items that can be converted to planks */
            from: items[]
            /** Amount of an item being converted at once */
            rate(item?: items): Decimal
            /** Multiplier to planks produced from an item */
            efficiency(item?: items): Decimal
            /** Actual amount of an item consumed/produced each second by convertion */
            per_second(item?: items): Decimal
        }
    }
    // Row 1
    l: Layer<'l'> & {
        regex: RegExp
        skills: {
            '*': {
                max(): Decimal
                /** Skill points remaining for use */
                left(): Decimal
                speed(): Decimal
                /** Bonus skill points for all skills (excluding locked ones) */
                bonus(): Decimal
            }
            [skill: string]: {
                readonly id: string
                effect(): Decimal
                needed(): Decimal
                unlocked(): boolean
                text(): string
                name: string
            }
        }
    }
    lo: Layer<'lo'> & {
        buyables: Layer<'lo'>['buyables'] & {
            [id: number]: Buyable<'lo'> & {
                /** Value per buyable */
                value(): Decimal
                cost(): { [item in items]: Decimal }
            }
        }
        items: {
            '*': {
                global_chance_multiplier(): Decimal
                /** Total amount of items */
                amount(): Decimal
                /** Total weight of a type (or all types) */
                weight(type?: `${drop_sources}:${string}`): typeof type extends string ? Decimal : { [key: `${drop_sources}:${string}`]: Decimal }
                has_anvil(): boolean
                /** Total value of all buyables */
                value: Computable<Decimal>
                /** Multiplier to items gained */
                gain_multiplier: Computable<Decimal>
                /** Multiplier to effective buyable costs */
                craft_consumption: Computable<Decimal>
                /** Items dropped by a type, split between chances and weights */
                items(type: `${drop_sources}:${string}`): {
                    chances?: { [item_id in items]: Decimal }
                    weights?: { [item_id in items]: Decimal }
                }
            }
        } & {
            [id in items]: {
                readonly id: id
                readonly grid: number
                sources: {
                    readonly id: id
                    /**
                     * Odds for the item to drop from a given type
                     *
                     * If the value is greater or equal to 1, the drop is guaranteed to be the chance
                     */
                    chances?: Computable<{ [type: `${drop_sources}:${string}`]: Decimal }>
                    /**
                     * Odds for the item to drop from a given type
                     *
                     * Actual odds are `weight/total weight`
                     */
                    weights?: Computable<{ [type: `${drop_sources}:${string}`]: Decimal }>
                    /**
                     * Amount gained/lost per second from another source
                     *
                     * Done by the other source
                     */
                    per_second?: Computable<{ [type: `${drop_sources}:${string}`]: Decimal }>
                    total_per_second?: Computable<Decimal>
                    other?: Computable<`${drop_sources}:${string}`[]>
                }
                /** Item style */
                style?: Computable<CSSStyles>
                name: Computable<string>
                unlocked?: Computable<boolean>
            }
        }
    }
    f: Layer<'f'> & {
        fuels: {
            '*': {
                regex: RegExp
                /** Maximum amount of a fuel that can be consumed per second */
                size(): Decimal
                /** Amount of the item being consumed every second */
                consuming(item: items): Decimal
            }
            [fuel: string]: {
                readonly id: string
                heat: Computable<Decimal>
                /** @default true */
                unlocked?: Computable<boolean>
                item: items
                /** Currently consuming amount of fuel */
                consuming: Computable<Decimal>
                /** Currently producing amount of heat */
                producing: Computable<Decimal>
            }
        }
        recipes: {
            '*': {
                /** List of regexes for the clickables and bar */
                regexes: {
                    bar: RegExp
                    display: RegExp
                    amount: RegExp
                }
                /** Returns a row that displays the recipe */
                show_recipe(recipe: string): TabFormatEntries<'f'>[] | undefined
                /** Maximum amount of items produced at once */
                size(): Decimal
                /** Computes a recipe's default amount (for tmp display) */
                default_amount(recipe: string, amount?: Decimal): Decimal
                speed(): Decimal
            }
            [recipe: string]: {
                readonly id: string
                /** Required heat to start producing */
                heat: Computable<Decimal>
                /** @default true */
                unlocked?: Computable<boolean>
                /**
                 * A recipe will not run if it can't consume everything
                 * @param amount Target amount to produce
                 *
                 * Defaults to currently being produced, or wanted produced
                 */
                consumes(amount?: Decimal): [item: items, amount: Decimal][]
                /** Produced item */
                produces: items
                /**
                 * Time it takes to produce the item in seconds
                 * @param amount Target amount to produce
                 *
                 * Defaults to currently being produced, or wanted produced
                 */
                time(amount?: Decimal): Decimal
                /** Formulas that determine amounts consumed **and** time */
                formulas: Computable<{ [key in items | 'time']: string }>
            }
        }
        heat: {
            /** Speed multiplier from heat */
            speed(): Decimal
            speed_formula: Computable<string>
            /** Total heat gained every second (used only for display) */
            gain(): Decimal
            /** Multiplier to heat gain */
            mult(): Decimal
            /** Speed divider from heat to freezer */
            slow(): Decimal
            slow_formula: Computable<string>
        }
    }
    // Row 2
    b: Layer<'b'> & {}
    s: Layer<'s'> & {
        coins: {
            /** List of coins */
            types: [name: string, color: string][]
            /** Default format coin method which returns a string with the amount of every coin type */
            format(amount?: DecimalSource, color?: boolean, split?: false): string
            /** Alternate format coin method that splits coin types in their own entry */
            format(amount?: DecimalSource, color?: boolean, split: true): string[]
        }
        investloans: {
            /**
             * Amount of investments/loans bought
             *
             * If real, coins the boss investment as 1 (instead of its current value)
             */
            amount(real?: boolean): Decimal
            /** Determines whether the player is in a loan/debt challenge */
            use_loans(): boolean
            type(): 'loan' | 'debt' | 'investment'
            /** List of investments/loans linked to specific items */
            item_upgrade: {
                [item in items]: number | undefined
            }
            /** Checks whether the upgrade id is an investment/loan/debt */
            is_upg_loan(id?: number): boolean
        }
    }
    a: Layer<'a'> & {
        upgrades: {
            [id: number]: Upgrade<'a'> & { item: items }
        }
        /** Efficiency of alt effects on normal gains and vice versa as an exponent */
        change_efficiency(): Decimal
    }
    // Alt Side
    suc: Layer<'suc'> & {
        getSuccessesRows(type?: AchievementTypes): number[]
        getSuccesses(type?: AchievementTypes): string[]
        totalSuccesses(type?: AchievementTypes): Decimal
        ownedSuccesses(type?: AchievementTypes): Decimal
    }
    tic: Layer<'tic'> & {
        time_speed(layer?: string): Decimal
        cubes: {
            gain(): Decimal
        }
    }
    bin: Layer<'bin'> & {
        cards: {
            /** List of existing cards */
            list(): (keyof Layers)[]
            /** List of potential cards */
            possibles(): (keyof Layers)[]
            /** List of cards available */
            availables(): (keyof Layers)[]
            /** Cost of a new card in bingo bucks */
            cost(): Decimal
            cost_formula: Computable<string>
            show_card(card?: Player['bin']['show']): [
                layer: keyof Layers,
                never[],
                ...string[][]
            ] | never[]
            /** Checks if a specific card has a bingo */
            has_bingo(card: number[]): boolean
            /** Checks if any card has a bingo */
            bingo(): false | (keyof Layers)[]
            multiplier(layer: keyof Layers): Decimal
            multipliers(): { [layer in keyof Layers]?: Decimal }
        }
        balls: {
            /** Time between rolls */
            time: Computable<Decimal>
            /** Lowest number for a bingo ball */
            min: Computable<number>
            /** Highest number for a bingo ball */
            max: Computable<number>
            /** Full grid of all potential balls */
            grid(): [
                never[],
                ...string[][]
            ]
        }
    }
    con: Layer<'con'> & {
        spice: {
            gain(): Decimal
            formula: Computable<string>
        }
        condiments: {
            '*': {
                /** Loss of all condiments */
                loss(): Decimal
                total: {
                    to: {
                        /** cost multiplier */
                        material_cost(): Decimal
                        /** gain multiplier */
                        floor_cost(): Decimal
                    }
                    k: {
                        /** addition */
                        oven_size(): Decimal
                        /** addition */
                        stomach_size(): Decimal
                    }
                    /** gain multipliers */
                    fr: {
                        water(): Decimal
                        cold(): Decimal
                    }
                }
                /** Multiplier to correct food duration with the highest condiment */
                bonus: Computable<Decimal>
                /** Multiplier to incorrect food duration with the highest condiment */
                malus: Computable<Decimal>
                /** Condiment with highest amount */
                highest(): string
                /**
                 * Cost of a random condiment after buying `x`
                 */
                cost(x?: DecimalSource): Decimal
                cost_formula: string
                cost_specific(x?: DecimalSource): Decimal
                cost_formula_specific: string
                /** Amount to add to the bought amount for specific condiment purchase */
            }
            [condiment: string]: {
                readonly id: string
                effect(): {
                    to?: {
                        /** cost multiplier */
                        material_cost?: Decimal
                        /** gain multiplier */
                        floor_cost?: Decimal
                    }
                    k?: {
                        /** addition */
                        oven_size?: Decimal
                        /** addition */
                        stomach_size?: Decimal
                    }
                    /** gain multipliers */
                    fr?: {
                        water?: Decimal
                        cold?: Decimal
                    }
                }
                formulas: Computable<{
                    to?: {
                        material_cost?: string
                        floor_cost?: string
                    }
                    k?: {
                        oven_size?: string
                        stomach_size?: string
                    }
                    fr?: {
                        water?: string
                        cold?: string
                    }
                }>
                /**
                 * If set and true, says the effect as positive
                 * If set and false, says the effect as negative
                 */
                positive: Computable<{
                    to?: {
                        material_cost?: boolean
                        floor_cost?: boolean
                    }
                    k?: {
                        oven_size?: boolean
                        stomach_size?: boolean
                    }
                    fr?: {
                        water?: boolean
                        cold?: boolean
                    }
                }>
                name: string
                color: string
                gain(): Decimal
            }
        }
    }
    // Alt Row 0
    xp_alt: Layer<'xp_alt'> & {
        color_tame: string
        monsters: {
            '*': {
                /** List of currently unlocked monsters */
                list(): string[]
                /** Sum of experience gained per second */
                experience(): Decimal
                experience_mult(): Decimal
                progress_mult(): Decimal
                difficulty_add(): Decimal
                difficulty_mult(): Decimal
                produce_mult(): Decimal
                tames_mult(): Decimal
                tames_passive_mult(): Decimal
            }
        } & {
            [type: string]: {
                readonly type: string
                /** Color of the monster */
                color: Computable<string>
                name: Computable<string>
                /** Amount of progress needed to tame */
                difficulty(tamed?: DecimalSource): Decimal
                progress_gain(): Decimal
                /** Total amount of experience produced every second */
                experience(tamed?: DecimalSource): Decimal
                tames(): Decimal
                /**
                 * Determines whether the monster is visible
                 *
                 * If absent, defaults to true
                 */
                unlocked?: Computable<boolean>
                /** Total items produced per second */
                produces(tamed?: DecimalSource): [items, Decimal][]
                /** Amount of the monster gained every second */
                passive_tame(tamed?: DecimalSource): Decimal
            }
        }
        total: {
            tamed(): Decimal
        }
    }
    c: Layer<'c'> & {
        upgrades: {
            [id: number]: Upgrade<'c'> & {
                resource_costs?: Computable<[resources, Decimal][]>
                item_costs?: Computable<[items, Decimal][]>
            }
        }
        buildings: {
            '*': {
                regex: RegExp
                placed(): { [building: string]: Decimal }
                enabled(): { [building: string]: Decimal }
                description(building_id: string, effect?: string): string
                produce_mult(): Decimal
                item_produce_mult(): Decimal
                consume_mult(): Decimal
                item_consume_mult(): Decimal
                cost_mult(): Decimal
            }
        } & {
            [building: string]: {
                readonly id: string
                name: Computable<string>
                style: {
                    /** General style shared by all others */
                    general: CSSStyles
                    buyable?: CSSStyles
                    select?: CSSStyles
                    grid?: CSSStyles
                }
                description: Computable<string>
                produces(amount_placed?: DecimalSource): {
                    /** Total items produced per second */
                    items?: [items, Decimal][]
                    /** Total resources produced per second */
                    resources?: [resources, Decimal][]
                }
                consumes?(amount_placed?: DecimalSource): {
                    /** Total items consumed per second */
                    items?: [items, Decimal][]
                    /** Total resources consumed per second */
                    resources?: [resources, Decimal][]
                }
                effect?(amount_placed?: Decimal): any
                /** Cost in items at amount */
                cost(amount_built?: DecimalSource): [item: items, cost: Decimal][]
                formulas: {
                    cost: Computable<[item: items, formula: string][]>
                    effect?: Computable<string>
                }
                unlocked?: Computable<boolean>
            }
        }
        resources: {
            '*': {
                gain_mult(): Decimal
            }
        } & {
            [resource in resources]: {
                readonly id: resource
                name: Computable<string>
                color: Computable<string>
                gain_mult(): Decimal
                /**
                 * **Theorical** gain from all active buildings
                 *
                 * May be negative
                 */
                gain(): Decimal
            }
        }
        floors: {
            /**
             * Highest available floor (at least 0)
             *
             * Effectively means that there are `max + 1` floors available
             */
            max: Computable<number>
        }
    }
    p: Layer<'p'> & {
        plants: {
            '*': {
                /** List of unlocked plants */
                list(): string[]
                harvest_mult(): Decimal
                grow_mult(): Decimal
                seeds_mult(): Decimal
                regexes: {
                    select: RegExp
                    infuse: RegExp
                }
            }
        } & {
            [plant: string]: {
                readonly id: string
                name: Computable<string>
                style: {
                    /** General style shared by all others */
                    general: CSSStyles
                    grid?: CSSStyles
                }
                /**
                 * List of ages, in seconds as (min, max]
                 *
                 * Going beyond the highest will kill the plant
                 */
                ages: Computable<[from: DecimalSource, to: DecimalSource][]>
                /** Time to maturation (as in, first age it can be harvest for something) */
                maturation: Computable<DecimalSource>
                /** List of images to display for the age */
                images: string[]
                /** Items produced at an age */
                produce(age: Decimal): [items, Decimal][]
                /** Full list of produced items */
                produces: items[]
                /** Amount of seeds earned from harvest */
                seeds(age: Decimal): Decimal
                effect?(): any
                effect_text?(): string
                /** If true, the plant will notify the player it's ready */
                notify(): boolean
                unlocked?: Computable<boolean>
                infusions: { [item in items]: string }
                /**
                 * If not empty, a hint will be shown in the infusion tab
                 *
                 * The hint is not shown if the seed is unlocked
                 */
                hint?: Computable<string>
            }
        }
    }
    // Alt Row 1
    to: Layer<'to'> & {
        /**
         * List of random materials for each random type
         *
         * Cost is `req * base ^ (exp ^ amount)`
         */
        materials: {
            cost_mult(): Decimal
        } & {
            [type in 'low' | 'medium' | 'high']: Computable<{
                [item in items]: {
                    base: DecimalSource
                    exp: DecimalSource
                }
            }>
        }
    }
    k: Layer<'k'> & {
        temperatures: {
            current(): temperatures
            info: { [temp in temperatures]: {
                color: string
                name: string
                min?: DecimalSource
                max?: DecimalSource
            } }
            regex: RegExp
        }
        recipes: {
            '*': {
                regexes: {
                    display: RegExp
                    amount: RegExp
                    bar: RegExp
                }
                show_recipe(recipe: string): TabFormatEntries<'k'>[] | undefined
                /** Maximum amount of items produced at once */
                size(): Decimal
                /** Computes a recipe's default amount (for tmp display) */
                default_amount(recipe: string, amount?: Decimal): Decimal
                speed(): Decimal
                can_cook(recipe_id: string): boolean
            }
            [recipe: string]: {
                readonly id: string
                /**
                 * Required heats to cook the dish
                 * Other heats will cancel the dish
                 */
                heats: Computable<temperatures[]>
                /** @default true */
                unlocked?: Computable<boolean>
                /**
                 * A recipe will not run if it can't consume everything
                 * @param amount Target amount to produce
                 *
                 * Defaults to currently being produced, or wanted produced
                 */
                consumes(amount?: Decimal): [item: items, amount: Decimal][]
                /** Produced food */
                produces: dishes
                /**
                 * Time it takes to produce the item in seconds
                 * @param amount Target amount to produce
                 *
                 * Defaults to currently being produced, or wanted produced
                 */
                time(amount?: Decimal): Decimal
                /** Formulas that determine amounts consumed **and** time */
                formulas: Computable<{ [key in items | 'time']: string }>
            }
        }
        dishes: {
            '*': {
                /** Converts a grid id to an item id (or false if there is none) */
                grid_to_dish: ((id: number) => dishes | false) & {
                    cache: { [k: number]: dishes | false }
                }
                /** Total amount of dishes */
                amount(): Decimal
                /** Total value of all dishes */
                value: Computable<Decimal>
                /**
                 * Maximum amount of active dishes
                 *
                 * Newly eaten dishes will overwrite the **oldest** one
                 */
                size(): number
                /**
                 * Computes a dish's default duration (for tmp display)
                 *
                 * Returns, in order, given duration, time left from active effect, 0
                 */
                default_duration(dish: dishes, duration?: Decimal): Decimal
                description_active(effect: number): string
                description_dish(dish: dishes): string
                units: { [unit in time_units]: {
                    format(amount: Decimal): string
                    /** Name to display */
                    name: string
                } }
                duration_mult(): Decimal
            }
        } & {
            [dish in dishes]: {
                readonly id: dish
                readonly grid: number
                /** Dish style */
                style?: Computable<CSSStyles>
                name: Computable<string>
                type: 'food' | 'drink'
                /** @default true */
                unlocked?: Computable<boolean>
                duration: {
                    readonly id: dish
                    unit: time_units
                    time: Computable<DecimalSource>
                }
                effect(duration: Decimal): any
                effect_description(duration: Decimal): string
                /** Value per dish */
                value: Computable<Decimal>
                condiment: {
                    good: string[]
                    bad: string[]
                }
            }
        }
    }
    fr: Layer<'fr'> & {
        buyables: Layer<'fr'>['buyables'] & {
            [id: string]: Buyable<'fr'> & {
                cost(): { [item in items]: Decimal }
            }
        }
        water: {
            /** Amount of water generated by condensation every second */
            gain(): Decimal
            /** Total amount of water generated by condensation every second */
            total_gain(): Decimal
        }
        cold: {
            /** Amount of cold generated by cooling every second */
            gain(): Decimal
            /** Amount of water consumed by cooling every second */
            consumes(): Decimal
            /** Speed multiplier from cold */
            speed(): Decimal
            speed_formula: Computable<string>
            /** Speed divider from cold to forge */
            slow(): Decimal
            slow_formula: Computable<string>
        }
        ice: {
            /** Amount of ice generated by freezing every second */
            gain(): Decimal
            /** Amount of water and cold consumed by freezing every second */
            consumes(): Decimal
            /** Multiplier to cold production */
            mult(): Decimal
            mult_formula: Computable<string>
        }
        recipes: {
            '*': {
                /** List of regexes for the clickables and bar */
                regexes: {
                    bar: RegExp
                    display: RegExp
                    amount: RegExp
                }
                /** Returns a row that displays the recipe */
                show_recipes(recipe_id: string): TabFormatEntries<'fr'>[] | undefined
                /** Maximum amount of items produced at once */
                size(): Decimal
                /** Computes a recipe's default amount (for tmp display) */
                default_amount(recipe: string, amount?: Decimal): Decimal
                speed(): Decimal
            }
            [recipe: string]: {
                readonly id: string
                /** Required cold to start producing */
                cold: Computable<Decimal>
                /** @default true */
                unlocked?: Computable<boolean>
                /**
                 * A recipe will not run if it can't consume everything
                 * @param amount Target amount to produce
                 *
                 * Defaults to currently being produced, or wanted produced
                 */
                consumes(amount?: Decimal): [item: items, amount: Decimal][]
                /** Produced item */
                produces: items
                /**
                 * Time it takes to produce the item in seconds
                 * @param amount Target amount to produce
                 *
                 * Defaults to currently being produced, or wanted produced
                 */
                time(amount?: Decimal): Decimal
                /** Formulas that determine amounts consumed **and** time */
                formulas: Computable<{ [key in items | 'time']: string }>
            }
        }
    }
    // Special
    star: Layer<'star'> & {
        star: {
            /** Time to hit a target, in seconds */
            time: Computable<Decimal>
            /** Size of the grid */
            size: Computable<Decimal>
            /** Amount of targets on the grid */
            targets: Computable<Decimal>
        }
    }
};
type Temp = {
    displayThings: (string | (() => string))[]
    gameEnded: boolean
    other: {
        lastPoints: Decimal,
        oomps: Decimal,
        screenWidth: number,
        screenHeight: number,
    }
    scrolled: boolean
} & RComputed<Layers>;
type Player = {
    devSpeed: string
    hasNaN: boolean
    keepGoing: boolean
    lastSafeTab: string
    navTab: string
    offTime: {
        remain: number,
    }
    points: Decimal
    subtabs: {
        [key in keyof Layers]: {
            mainTabs: string,
        }
    }
    tab: string
    time: number
    timePlayed: number
    version: string
    versionType: string
    // Side
    ach: LayerData & {
        short_mode: boolean
    }
    clo: LayerData & {
        /** If true, uses advanced materials from the forge */
        use_advanced: boolean
    }
    cas: LayerData & {
        /**
         * Each entry shares an `item_id` key, which points to the replacing item_id
         *
         * Example: With `chances['driftwood'] == 'brain'`, brains will drop instead of driftwood
         */
        swaps: {
            /** Swapped values of `item.sources.chances` */
            chances: { [item_id: string]: string }
            /** Swapped values of `item.sources.weights` */
            weights: { [item_id: string]: string }
            /** Swapped values of both `item.sources.weights` and `item.sources.chances` */
            challenge: { [item_id: string]: string }
            count: Decimal
        }
        /** Items being swapped, false if none */
        swapping: {
            chances: string | false
            weights: string | false
            challenge: string | false
        }
        /** Amount of times swapped */
        count: Decimal
        /** Amount of times respecced */
        respecs: Decimal
    }
    mag: LayerData & {
        /** Current selected element */
        element: string
    }
    sta: LayerData & {
        stats: {
            [stat: string]: {
                /** Amount of points in a stat */
                points: Decimal,
            }
        }
    }
    // Row 0
    xp: LayerData & {
        /** Current selected enemy */
        type: string
        clicked: boolean
        enemies: {
            [enemy: string]: {
                /** Enemy health left */
                health: Decimal
                kills: Decimal
                last_drops: [string, Decimal][]
                /** Amount of times the value in last_drops was dropped */
                last_drops_times: Decimal
                /** Current element, irrelevant if magic is locked */
                element: string
                /** Star-only saved name */
                name?: string
            }
        }
        auto: {
            attack_current: boolean
            attack_all: boolean
            upgrade: boolean
        }
    }
    m: LayerData & {
        health: Decimal
        last_drops: [string, Decimal][]
        /** Amount of times the value in last_drops was dropped */
        last_drops_times: Decimal
        short_mode: boolean
        mode: 'shallow' | 'deep'
        /** If true, shows deep mining upgrades */
        show_deep: boolean
        auto_upgrade: boolean
    }
    t: LayerData & {
        short_mode: boolean
        clicked: boolean
        trees: {
            [id: string]: {
                amount: Decimal
                health: Decimal
                last_drops: [string, Decimal][]
                /** Amount of times the value in last_drops was dropped */
                last_drops_times: Decimal
            }
        }
        /** Current selected tree */
        current: string
        /** Current focused tree, only used with `options.noRNG` */
        focus: string
        convert: boolean
        auto_upgrade: boolean
    }
    // Row 1
    l: LayerData & {
        /** Amount of points being added/removed from a skill */
        change: Decimal
        skills: {
            [skill: string]: {
                /** Amount of points in a skill */
                points: Decimal
                /** Current level of the skill */
                level: Decimal
                /** Progress towards next level of the skill */
                progress: Decimal
            }
        }
    }
    lo: LayerData & {
        /** Replaces `unlocked` to allow buying the only upgrade */
        shown: boolean
        items: {
            [id in items]: {
                amount: Decimal,
            }
        }
    }
    f: LayerData & {
        /**
         * List of fuels
         *
         * If `true`, the fuel is consumed to produce heat
         */
        fuels: { [fuel: string]: boolean }
        recipes: {
            [recipe: string]: {
                /**
                 * Current amount being smelted
                 *
                 * 0 if not being smelted
                 */
                amount_smelting: Decimal
                /** Current input value */
                amount_target: Decimal
                /**
                 * Progress in seconds since the recipe was started
                 *
                 * If amount_smelting > 0, increase this one until >= tmp.f.recipes.time(amount_smelting)
                 */
                progress: Decimal
                /**
                 * If true, the recipe is rerun on completion
                 */
                auto: boolean
            }
        }
        /** If true, shows alloys upgrades and buyables */
        alloys: boolean
    }
    // Row 2
    b: LayerData & {
        /** If true, bosses are automatically started unless beaten */
        auto_start: boolean
        final_challenges: number[]
    }
    s: LayerData & {
        short_mode: boolean
        respecced: boolean
    }
    a: LayerData & {}
    // Alt Side
    suc: LayerData & {
        short_mode: boolean
    }
    tic: LayerData & {
        /** If true, time speed is inverted and produce time cubes */
        invert: boolean
        /** Challenge only */
        chal: {
            speed: Decimal
            time: Decimal
        }
    }
    bin: LayerData & {
        cards: {
            [layer in keyof Layers]?: {
                spots: number[]
                /** Consecutive wins */
                wins: Decimal
            }
        }
        /** Rolled numbers */
        rolled: number[]
        respecs: Decimal
        /** Time until next bingo ball */
        time: Decimal
        /** Currently selected bingo card */
        show: keyof Layers | ''
        bingo_notify: boolean
        warn: {
            respec: boolean
            create: boolean
        }
        /**
         * noRNG only
         *
         * Swaps highest win streak with the selected layer
         */
        swap: keyof Layers | ''
    }
    con: LayerData & {
        condiments: {
            [condiment: string]: {
                amount: Decimal
            }
        }
        grid: {
            [id: number]: {
                /** Condiment on the cell */
                condiment: string
                /** Condiment tier */
                tier: Decimal
            }
        }
        swap: number | false
        bought: Decimal
        respecs: Decimal
    }
    // Alt Row 0
    xp_alt: LayerData & {
        type: string
        clicked: boolean
        monsters: {
            [monster: string]: {
                /** Monster progress left */
                progress: Decimal
                tamed: Decimal
                last_drops: [string, Decimal][]
                /** Amount of times the value in last_drops was dropped */
                last_drops_times: Decimal
            }
        }
        auto_upgrade: boolean
    }
    c: LayerData & {
        floors: {
            [id: number]: {
                /** Building placed on that tile */
                building: string
                /** Whether the building is active */
                enabled: boolean
            }
        }[]
        /** Current floor to show */
        floor: number
        mode: 'place' | 'destroy' | 'toggle'
        /** Currently selected building for placement */
        building: string
        resources: {
            [resource in resources]: {
                amount: Decimal
            }
        }
        auto_research: boolean
    }
    p: LayerData & {
        grid: {
            [id: number]: {
                /** Plant placed on that tile */
                plant: string
                /** Age of the plant */
                age: Decimal
            }
        }
        /** Currently selected plant for placement */
        plant: string
        infuse_target: string
        infuse_item: string
        /** Last crop type harvested */
        last_harvest: string
        plants: {
            [plant: string]: {
                /** Amount of seeds in storage */
                seeds: Decimal
                harvested: Decimal
                dead: Decimal
                /** Known infusions */
                infusions: string[]
                last_harvest: [string, Decimal][]
                last_harvest_seeds: Decimal
                last_harvest_count: Decimal
            }
        }
    }
    // Alt Row 1
    to: LayerData & {
        random: items[]
    }
    k: LayerData & {
        recipes: {
            [recipe: string]: {
                /**
                 * Current amount being smelted
                 *
                 * 0 if not being smelted
                 */
                amount_cooking: Decimal
                /** Current input value */
                amount_target: Decimal
                /**
                 * Progress in seconds since the recipe was started
                 *
                 * If amount_cooking > 0, increase this one until >= tmp.f.recipes.time(amount_cooking)
                 */
                progress: Decimal
                /**
                 * If true, the recipe is rerun on completion
                 */
                auto: boolean
            }
        }
        /** Active dishes */
        active: {
            id: dishes
            units: time_units
            time: Decimal
        }[]
        dishes: { [dish in dishes]: {
            amount: Decimal
        } }
        /** Current target temperature set in the kitchen */
        mode: temperatures
        selected: dishes | ''
    }
    fr: LayerData & {
        recipes: {
            [recipe: string]: {
                /**
                 * Current amount being frozen
                 *
                 * 0 if not being frozen
                 */
                amount_freezing: Decimal
                /** Current input value */
                amount_target: Decimal
                /**
                 * Progress in seconds since the recipe was started
                 *
                 * If amount_freezing > 0, increase this one until >= tmp.f.recipes.time(amount_freezing)
                 */
                progress: Decimal
                /**
                 * If true, the recipe is rerun on completion
                 */
                auto: boolean
            }
        }
    }
    // Special
    star: LayerData & {
        targets: number[]
        /** Time left to hit a target, in seconds */
        time: Decimal
        /** If true, leaves from the star fight automatically */
        auto_leave: boolean
    }
};
/** Adds the items in question to the player data */
function gain_items(items: [items, DecimalSource][]): void
/** Adds the item in question to the player data */
function gain_items(item: items, amount: DecimalSource): void
