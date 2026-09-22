class LRUCache extends Map {
  #maximumSize;
  constructor(maximumSize) {
    super();
    this.#maximumSize = maximumSize;
  }
  get(key) {
    const value = super.get(key);
    if (value === undefined) return;
    super.delete(key);
    super.set(key, value);
    return value;
  }
  set(key, value) {
    if (super.has(key)) {
      throw new Error("Cannot update existing keys in the cache");
    }
    if (this.size === this.#maximumSize) {
      const [firstEntry] = this;
      if (firstEntry !== undefined && !super.has(firstEntry[0])) {
        super.delete(firstEntry[0]);
      }
    }
    return super.set(key, value);
  }
}
const MAX_SIGNIFICANT_DIGITS = 17;
const EXP_LIMIT = 9e15;
const LAYER_DOWN = Math.log10(9e15);
const FIRST_NEG_LAYER = 9e-15;
const MAX_ES_IN_A_ROW = 5;
const DEFAULT_FROM_STRING_CACHE_SIZE = 2047;
const IGNORE_COMMAS = true;
const powersOf10 = [];
for (let i = -324 + 1; i <= 308; i++) {
  powersOf10.push(Number(`1e${i}`));
}
const COMMAS_ARE_DECIMAL_POINTS = false;
function powerOf10(power) {
  return powersOf10[power + 323];
}
const critical_headers = [2, Math.E, 3, 4, 5, 6, 7, 8, 9, 10];
const critical_tetr_values = [
  [
    1, 1.0891180521811202527, 1.1789767925673958433, 1.2701455431742086633,
    1.3632090180450091941, 1.4587818160364217007, 1.5575237916251418333,
    1.6601571006859253673, 1.7674858188369780435, 1.8804192098842727359, 2,
  ],
  [
    1,
    1.1121114330934078681,
    1.2310389249316089299,
    1.3583836963111376089,
    1.4960519303993531879,
    1.646354233751194581,
    1.8121385357018724464,
    1.9969713246183068478,
    2.205389554552754433,
    2.4432574483385252544,
    Math.E,
  ],
  [
    1, 1.1187738849693603, 1.2464963939368214, 1.38527004705667,
    1.5376664685821402, 1.7068895236551784, 1.897001227148399,
    2.1132403089001035, 2.362480153784171, 2.6539010333870774, 3,
  ],
  [
    1, 1.1367350847096405, 1.2889510672956703, 1.4606478703324786,
    1.6570295196661111, 1.8850062585672889, 2.1539465047453485,
    2.476829779693097, 2.872061932789197, 3.3664204535587183, 4,
  ],
  [
    1, 1.1494592900767588, 1.319708228183931, 1.5166291280087583,
    1.748171114438024, 2.0253263297298045, 2.3636668498288547,
    2.7858359149579424, 3.3257226212448145, 4.035730287722532, 5,
  ],
  [
    1, 1.159225940787673, 1.343712473580932, 1.5611293155111927,
    1.8221199554561318, 2.14183924486326, 2.542468319282638, 3.0574682501653316,
    3.7390572020926873, 4.6719550537360774, 6,
  ],
  [
    1, 1.1670905356972596, 1.3632807444991446, 1.5979222279405536,
    1.8842640123816674, 2.2416069644878687, 2.69893426559423,
    3.3012632110403577, 4.121250340630164, 5.281493033448316, 7,
  ],
  [
    1, 1.1736630594087796, 1.379783782386201, 1.6292821855668218,
    1.9378971836180754, 2.3289975651071977, 2.8384347394720835,
    3.5232708454565906, 4.478242031114584, 5.868592169644505, 8,
  ],
  [
    1, 1.1793017514670474, 1.394054150657457, 1.65664127441059,
    1.985170999970283, 2.4069682290577457, 2.9647310119960752,
    3.7278665320924946, 4.814462547283592, 6.436522247411611, 9,
  ],
  [
    1, 1.1840100246247336579, 1.4061375836156954169, 1.6802272208863963918,
    2.026757028388618927, 2.477005606344964758, 3.0805252717554819987,
    3.9191964192627283911, 5.135152840833186423, 6.9899611795347148455, 10,
  ],
];
const critical_slog_values = [
  [
    -1, -0.9194161097107025, -0.8335625019330468, -0.7425599821143978,
    -0.6466611521029437, -0.5462617907227869, -0.4419033816638769,
    -0.3342645487554494, -0.224140440909962, -0.11241087890006762, 0,
  ],
  [
    -1, -0.90603157029014, -0.80786507256596, -0.7064666939634,
    -0.60294836853664, -0.49849837513117, -0.39430303318768, -0.29147201034755,
    -0.19097820800866, -0.09361896280296, 0,
  ],
  [
    -1, -0.9021579584316141, -0.8005762598234203, -0.6964780623319391,
    -0.5911906810998454, -0.486050182576545, -0.3823089430815083,
    -0.28106046722897615, -0.1831906535795894, -0.08935809204418144, 0,
  ],
  [
    -1, -0.8917227442365535, -0.781258746326964, -0.6705130326902455,
    -0.5612813129406509, -0.4551067709033134, -0.35319256652135966,
    -0.2563741554088552, -0.1651412821106526, -0.0796919581982668, 0,
  ],
  [
    -1, -0.8843387974366064, -0.7678744063886243, -0.6529563724510552,
    -0.5415870994657841, -0.4352842206588936, -0.33504449124791424,
    -0.24138853420685147, -0.15445285440944467, -0.07409659641336663, 0,
  ],
  [
    -1, -0.8786709358426346, -0.7577735191184886, -0.6399546189952064,
    -0.527284921869926, -0.4211627631006314, -0.3223479611761232,
    -0.23107655627789858, -0.1472057700818259, -0.07035171210706326, 0,
  ],
  [
    -1, -0.8740862815291583, -0.7497032990976209, -0.6297119746181752,
    -0.5161838335958787, -0.41036238255751956, -0.31277212146489963,
    -0.2233976621705518, -0.1418697367979619, -0.06762117662323441, 0,
  ],
  [
    -1, -0.8702632331800649, -0.7430366914122081, -0.6213373075161548,
    -0.5072025698095242, -0.40171437727184167, -0.30517930701410456,
    -0.21736343968190863, -0.137710238299109, -0.06550774483471955, 0,
  ],
  [
    -1, -0.8670016295947213, -0.7373984232432306, -0.6143173985094293,
    -0.49973884395492807, -0.394584953527678, -0.2989649949848695,
    -0.21245647317021688, -0.13434688362382652, -0.0638072667348083, 0,
  ],
  [
    -1, -0.8641642839543857, -0.732534623168535, -0.6083127477059322,
    -0.4934049257184696, -0.3885773075899922, -0.29376029055315767,
    -0.2083678561173622, -0.13155653399373268, -0.062401588652553186, 0,
  ],
];
function decimalPlaces(value, places) {
  const len = places + 1;
  const numDigits = Math.ceil(Math.log10(Math.abs(value)));
  const rounded =
    Math.round(value * Math.pow(10, len - numDigits)) *
    Math.pow(10, numDigits - len);
  return parseFloat(rounded.toFixed(Math.max(len - numDigits, 0)));
}
function f_maglog10(n) {
  return Math.sign(n) * Math.log10(Math.abs(n));
}
function f_gamma(n) {
  if (!isFinite(n)) {
    return n;
  }
  if (n < -50) {
    if (n === Math.trunc(n)) {
      return Number.NEGATIVE_INFINITY;
    }
    return 0;
  }
  let scal1 = 1;
  while (n < 10) {
    scal1 = scal1 * n;
    ++n;
  }
  n -= 1;
  let l = 0.9189385332046727;
  l = l + (n + 0.5) * Math.log(n);
  l = l - n;
  const n2 = n * n;
  let np = n;
  l = l + 1 / (12 * np);
  np = np * n2;
  l = l + 1 / (360 * np);
  np = np * n2;
  l = l + 1 / (1260 * np);
  np = np * n2;
  l = l + 1 / (1680 * np);
  np = np * n2;
  l = l + 1 / (1188 * np);
  np = np * n2;
  l = l + 691 / (360360 * np);
  np = np * n2;
  l = l + 7 / (1092 * np);
  np = np * n2;
  l = l + 3617 / (122400 * np);
  return Math.exp(l) / scal1;
}
const OMEGA = 0.56714329040978387299997;
function f_lambertw(z, tol = 1e-10) {
  let w;
  let wn;
  if (!Number.isFinite(z) || z === 0) return z;
  if (z === 1) return OMEGA;
  w = z < 10 ? 0 : Math.log(z) - Math.log(Math.log(z));
  for (let i = 0; i < 100; ++i) {
    wn = (z * Math.exp(-w) + w * w) / (w + 1);
    if (Math.abs(wn - w) < tol * Math.abs(wn)) return wn;
    w = wn;
  }
  throw new Error(`Iteration failed to converge: ${z}`);
}
function d_lambertw(z, tol = 1e-10) {
  let w;
  let ew;
  let wewz;
  let wn;
  if (!z.isFinite() || z.equals(Decimal.dZero)) {
    return z;
  }
  if (z.eq(Decimal.dOne)) {
    return new Decimal(OMEGA);
  }
  w = Decimal.ln(z);
  for (let i = 0; i < 100; ++i) {
    ew = w.neg().exp();
    wewz = w.sub(z.mul(ew));
    wn = w.sub(
      wewz.div(
        w
          .add(Decimal.dOne)
          .sub(
            w
              .add(Decimal.dTwo)
              .mul(wewz)
              .div(Decimal.dTwo.mul(w).add(Decimal.dTwo)),
          ),
      ),
    );
    if (Decimal.abs(wn.sub(w)).lt(Decimal.abs(wn).mul(tol))) {
      return wn;
    }
    w = wn;
  }
  throw new Error(`Iteration failed to converge: ${z.toString()}`);
}
class Decimal {
  static dZero = new Decimal(0);
  static dOne = new Decimal(1);
  static dNegOne = new Decimal(-1);
  static dTwo = new Decimal(2);
  static dTen = new Decimal(10);
  static dNaN = new Decimal().fromComponents_noNormalize(
    Number.NaN,
    Number.NaN,
    Number.NaN,
  );
  static dInf = new Decimal().fromComponents_noNormalize(
    1,
    Number.POSITIVE_INFINITY,
    Number.POSITIVE_INFINITY,
  );
  static dNegInf = new Decimal().fromComponents_noNormalize(
    -1,
    Number.NEGATIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  );
  static dNumberMax = new Decimal().fromComponents(1, 0, Number.MAX_VALUE);
  static dNumberMin = new Decimal().fromComponents(1, 0, Number.MIN_VALUE);
  static fromStringCache = new LRUCache(DEFAULT_FROM_STRING_CACHE_SIZE);
  sign = 0;
  mag = 0;
  layer = 0;
  constructor(value) {
    if (value instanceof Decimal) this.fromDecimal(value);
    else if (typeof value === "number") this.fromNumber(value);
    else if (typeof value === "string") this.fromString(value);
  }
  get m() {
    if (this.sign === 0) return 0;
    else if (this.layer === 0) {
      const exp = Math.floor(Math.log10(this.mag));
      let man;
      if (this.mag === 5e-324) {
        man = 5;
      } else {
        man = this.mag / powerOf10(exp);
      }
      return this.sign * man;
    } else if (this.layer === 1) {
      const residue = this.mag - Math.floor(this.mag);
      return this.sign * Math.pow(10, residue);
    } else return this.sign;
  }
  get e() {
    if (this.sign === 0) {
      return 0;
    } else if (this.layer === 0) {
      return Math.floor(Math.log10(this.mag));
    } else if (this.layer === 1) {
      return Math.floor(this.mag);
    } else if (this.layer === 2) {
      return Math.floor(Math.sign(this.mag) * Math.pow(10, Math.abs(this.mag)));
    } else return this.mag * Number.POSITIVE_INFINITY;
  }
  get mantissa() {
    return this.m;
  }
  get exponent() {
    return this.e;
  }
  static fromComponents(sign, layer, mag) {
    return new Decimal().fromComponents(sign, layer, mag);
  }
  static fromComponents_noNormalize(sign, layer, mag) {
    return new Decimal().fromComponents_noNormalize(sign, layer, mag);
  }
  static fromMantissaExponent(mantissa, exponent) {
    return new Decimal().fromMantissaExponent(mantissa, exponent);
  }
  static fromMantissaExponent_noNormalize(mantissa, exponent) {
    return new Decimal().fromMantissaExponent_noNormalize(mantissa, exponent);
  }
  static fromDecimal(value) {
    return new Decimal().fromDecimal(value);
  }
  static fromNumber(value) {
    return new Decimal().fromNumber(value);
  }
  static fromString(value) {
    return new Decimal().fromString(value);
  }
  static fromValue(value) {
    return new Decimal().fromValue(value);
  }
  static fromValue_noAlloc(value) {
    if (value in decimalMap) return decimalMap[value];
    return value instanceof Decimal ? value : new Decimal(value);
  }
  static abs(value) {
    return Decimal.fromValue_noAlloc(value).abs();
  }
  static neg(value) {
    return Decimal.fromValue_noAlloc(value).neg();
  }
  static negate(value) {
    return Decimal.fromValue_noAlloc(value).neg();
  }
  static negated(value) {
    return Decimal.fromValue_noAlloc(value).neg();
  }
  static round(value) {
    return Decimal.fromValue_noAlloc(value).round();
  }
  static floor(value) {
    return Decimal.fromValue_noAlloc(value).floor();
  }
  static ceil(value) {
    return Decimal.fromValue_noAlloc(value).ceil();
  }
  static trunc(value) {
    return Decimal.fromValue_noAlloc(value).trunc();
  }
  static add(value, other) {
    return Decimal.fromValue_noAlloc(value).add(other);
  }
  static plus(value, other) {
    return Decimal.fromValue_noAlloc(value).add(other);
  }
  static sub(value, other) {
    return Decimal.fromValue_noAlloc(value).sub(other);
  }
  static subtract(value, other) {
    return Decimal.fromValue_noAlloc(value).sub(other);
  }
  static minus(value, other) {
    return Decimal.fromValue_noAlloc(value).sub(other);
  }
  static mul(value, other) {
    return Decimal.fromValue_noAlloc(value).mul(other);
  }
  static multiply(value, other) {
    return Decimal.fromValue_noAlloc(value).mul(other);
  }
  static times(value, other) {
    return Decimal.fromValue_noAlloc(value).mul(other);
  }
  static div(value, other) {
    return Decimal.fromValue_noAlloc(value).div(other);
  }
  static divide(value, other) {
    return Decimal.fromValue_noAlloc(value).div(other);
  }
  static recip(value) {
    return Decimal.fromValue_noAlloc(value).recip();
  }
  static reciprocal(value) {
    return Decimal.fromValue_noAlloc(value).recip();
  }
  static reciprocate(value) {
    return Decimal.fromValue_noAlloc(value).reciprocate();
  }
  static cmp(value, other) {
    return Decimal.fromValue_noAlloc(value).cmp(other);
  }
  static cmpabs(value, other) {
    return Decimal.fromValue_noAlloc(value).cmpabs(other);
  }
  static compare(value, other) {
    return Decimal.fromValue_noAlloc(value).cmp(other);
  }
  static isNaN(value) {
    value = Decimal.fromValue_noAlloc(value);
    return isNaN(value.sign) || isNaN(value.layer) || isNaN(value.mag);
  }
  static isFinite(value) {
    value = Decimal.fromValue_noAlloc(value);
    return isFinite(value.sign) && isFinite(value.layer) && isFinite(value.mag);
  }
  static eq(value, other) {
    return Decimal.fromValue_noAlloc(value).eq(other);
  }
  static equals(value, other) {
    return Decimal.fromValue_noAlloc(value).eq(other);
  }
  static neq(value, other) {
    return Decimal.fromValue_noAlloc(value).neq(other);
  }
  static notEquals(value, other) {
    return Decimal.fromValue_noAlloc(value).notEquals(other);
  }
  static lt(value, other) {
    return Decimal.fromValue_noAlloc(value).lt(other);
  }
  static lte(value, other) {
    return Decimal.fromValue_noAlloc(value).lte(other);
  }
  static gt(value, other) {
    return Decimal.fromValue_noAlloc(value).gt(other);
  }
  static gte(value, other) {
    return Decimal.fromValue_noAlloc(value).gte(other);
  }
  static max(value, other) {
    return Decimal.fromValue_noAlloc(value).max(other);
  }
  static min(value, other) {
    return Decimal.fromValue_noAlloc(value).min(other);
  }
  static minabs(value, other) {
    return Decimal.fromValue_noAlloc(value).minabs(other);
  }
  static maxabs(value, other) {
    return Decimal.fromValue_noAlloc(value).maxabs(other);
  }
  static clamp(value, min, max) {
    return Decimal.fromValue_noAlloc(value).clamp(min, max);
  }
  static clampMin(value, min) {
    return Decimal.fromValue_noAlloc(value).clampMin(min);
  }
  static clampMax(value, max) {
    return Decimal.fromValue_noAlloc(value).clampMax(max);
  }
  static cmp_tolerance(value, other, tolerance) {
    return Decimal.fromValue_noAlloc(value).cmp_tolerance(other, tolerance);
  }
  static compare_tolerance(value, other, tolerance) {
    return Decimal.fromValue_noAlloc(value).cmp_tolerance(other, tolerance);
  }
  static eq_tolerance(value, other, tolerance) {
    return Decimal.fromValue_noAlloc(value).eq_tolerance(other, tolerance);
  }
  static equals_tolerance(value, other, tolerance) {
    return Decimal.fromValue_noAlloc(value).eq_tolerance(other, tolerance);
  }
  static neq_tolerance(value, other, tolerance) {
    return Decimal.fromValue_noAlloc(value).neq_tolerance(other, tolerance);
  }
  static notEquals_tolerance(value, other, tolerance) {
    return Decimal.fromValue_noAlloc(value).notEquals_tolerance(
      other,
      tolerance,
    );
  }
  static lt_tolerance(value, other, tolerance) {
    return Decimal.fromValue_noAlloc(value).lt_tolerance(other, tolerance);
  }
  static lte_tolerance(value, other, tolerance) {
    return Decimal.fromValue_noAlloc(value).lte_tolerance(other, tolerance);
  }
  static gt_tolerance(value, other, tolerance) {
    return Decimal.fromValue_noAlloc(value).gt_tolerance(other, tolerance);
  }
  static gte_tolerance(value, other, tolerance) {
    return Decimal.fromValue_noAlloc(value).gte_tolerance(other, tolerance);
  }
  static pLog10(value) {
    return Decimal.fromValue_noAlloc(value).pLog10();
  }
  static absLog10(value) {
    return Decimal.fromValue_noAlloc(value).absLog10();
  }
  static log10(value) {
    return Decimal.fromValue_noAlloc(value).log10();
  }
  static log(value, base) {
    return Decimal.fromValue_noAlloc(value).log(base);
  }
  static log2(value) {
    return Decimal.fromValue_noAlloc(value).log2();
  }
  static ln(value) {
    return Decimal.fromValue_noAlloc(value).ln();
  }
  static logarithm(value, base) {
    return Decimal.fromValue_noAlloc(value).logarithm(base);
  }
  static pow(value, other) {
    return Decimal.fromValue_noAlloc(value).pow(other);
  }
  static pow10(value) {
    return Decimal.fromValue_noAlloc(value).pow10();
  }
  static root(value, other) {
    return Decimal.fromValue_noAlloc(value).root(other);
  }
  static factorial(value, _other) {
    return Decimal.fromValue_noAlloc(value).factorial();
  }
  static gamma(value, _other) {
    return Decimal.fromValue_noAlloc(value).gamma();
  }
  static lngamma(value, _other) {
    return Decimal.fromValue_noAlloc(value).lngamma();
  }
  static exp(value) {
    return Decimal.fromValue_noAlloc(value).exp();
  }
  static sqr(value) {
    return Decimal.fromValue_noAlloc(value).sqr();
  }
  static sqrt(value) {
    return Decimal.fromValue_noAlloc(value).sqrt();
  }
  static cube(value) {
    return Decimal.fromValue_noAlloc(value).cube();
  }
  static cbrt(value) {
    return Decimal.fromValue_noAlloc(value).cbrt();
  }
  static tetrate(
    value,
    height = 2,
    payload = new Decimal().fromComponents_noNormalize(1, 0, 1),
  ) {
    return Decimal.fromValue_noAlloc(value).tetrate(height, payload);
  }
  static iteratedexp(
    value,
    height = 2,
    payload = new Decimal().fromComponents_noNormalize(1, 0, 1),
  ) {
    return Decimal.fromValue_noAlloc(value).iteratedexp(height, payload);
  }
  static iteratedlog(value, base = 10, times = 1) {
    return Decimal.fromValue_noAlloc(value).iteratedlog(base, times);
  }
  static layeradd10(value, diff) {
    return Decimal.fromValue_noAlloc(value).layeradd10(diff);
  }
  static layeradd(value, diff, base = 10) {
    return Decimal.fromValue_noAlloc(value).layeradd(diff, base);
  }
  static slog(value, base = 10) {
    return Decimal.fromValue_noAlloc(value).slog(base);
  }
  static lambertw(value) {
    return Decimal.fromValue_noAlloc(value).lambertw();
  }
  static ssqrt(value) {
    return Decimal.fromValue_noAlloc(value).ssqrt();
  }
  static pentate(
    value,
    height = 2,
    payload = new Decimal().fromComponents_noNormalize(1, 0, 1),
  ) {
    return Decimal.fromValue_noAlloc(value).pentate(height, payload);
  }
  static affordGeometricSeries(
    resourcesAvailable,
    priceStart,
    priceRatio,
    currentOwned,
  ) {
    return this.affordGeometricSeries_core(
      Decimal.fromValue_noAlloc(resourcesAvailable),
      Decimal.fromValue_noAlloc(priceStart),
      Decimal.fromValue_noAlloc(priceRatio),
      currentOwned,
    );
  }
  static sumGeometricSeries(numItems, priceStart, priceRatio, currentOwned) {
    return this.sumGeometricSeries_core(
      numItems,
      Decimal.fromValue_noAlloc(priceStart),
      Decimal.fromValue_noAlloc(priceRatio),
      currentOwned,
    );
  }
  static affordArithmeticSeries(
    resourcesAvailable,
    priceStart,
    priceAdd,
    currentOwned,
  ) {
    return this.affordArithmeticSeries_core(
      Decimal.fromValue_noAlloc(resourcesAvailable),
      Decimal.fromValue_noAlloc(priceStart),
      Decimal.fromValue_noAlloc(priceAdd),
      Decimal.fromValue_noAlloc(currentOwned),
    );
  }
  static sumArithmeticSeries(numItems, priceStart, priceAdd, currentOwned) {
    return this.sumArithmeticSeries_core(
      Decimal.fromValue_noAlloc(numItems),
      Decimal.fromValue_noAlloc(priceStart),
      Decimal.fromValue_noAlloc(priceAdd),
      Decimal.fromValue_noAlloc(currentOwned),
    );
  }
  static efficiencyOfPurchase(cost, currentRpS, deltaRpS) {
    return this.efficiencyOfPurchase_core(
      Decimal.fromValue_noAlloc(cost),
      Decimal.fromValue_noAlloc(currentRpS),
      Decimal.fromValue_noAlloc(deltaRpS),
    );
  }
  static randomDecimalForTesting(maxLayers) {
    if (Math.random() * 20 < 1) {
      return new Decimal().fromComponents_noNormalize(0, 0, 0);
    }
    const randomsign = Math.random() > 0.5 ? 1 : -1;
    if (Math.random() * 20 < 1) {
      return new Decimal().fromComponents_noNormalize(randomsign, 0, 1);
    }
    const layer = Math.floor(Math.random() * (maxLayers + 1));
    let randomexp =
      layer === 0 ? Math.random() * 616 - 308 : Math.random() * 16;
    if (Math.random() > 0.9) {
      randomexp = Math.trunc(randomexp);
    }
    let randommag = Math.pow(10, randomexp);
    if (Math.random() > 0.9) {
      randommag = Math.trunc(randommag);
    }
    return new Decimal().fromComponents(randomsign, layer, randommag);
  }
  static affordGeometricSeries_core(
    resourcesAvailable,
    priceStart,
    priceRatio,
    currentOwned,
  ) {
    const actualStart = priceStart.mul(priceRatio.pow(currentOwned));
    return Decimal.floor(
      resourcesAvailable
        .div(actualStart)
        .mul(priceRatio.sub(1))
        .add(1)
        .log10()
        .div(priceRatio.log10()),
    );
  }
  static sumGeometricSeries_core(
    numItems,
    priceStart,
    priceRatio,
    currentOwned,
  ) {
    return priceStart
      .mul(priceRatio.pow(currentOwned))
      .mul(Decimal.sub(1, priceRatio.pow(numItems)))
      .div(Decimal.sub(1, priceRatio));
  }
  static affordArithmeticSeries_core(
    resourcesAvailable,
    priceStart,
    priceAdd,
    currentOwned,
  ) {
    const actualStart = priceStart.add(currentOwned.mul(priceAdd));
    const b = actualStart.sub(priceAdd.div(2));
    const b2 = b.pow(2);
    return b
      .neg()
      .add(b2.add(priceAdd.mul(resourcesAvailable).mul(2)).sqrt())
      .div(priceAdd)
      .floor();
  }
  static sumArithmeticSeries_core(
    numItems,
    priceStart,
    priceAdd,
    currentOwned,
  ) {
    const actualStart = priceStart.add(currentOwned.mul(priceAdd));
    return numItems
      .div(2)
      .mul(actualStart.mul(2).plus(numItems.sub(1).mul(priceAdd)));
  }
  static efficiencyOfPurchase_core(cost, currentRpS, deltaRpS) {
    return cost.div(currentRpS).add(cost.div(deltaRpS));
  }
  normalize() {
    if (this.sign === 0 || (this.mag === 0 && this.layer === 0)) {
      this.sign = 0;
      this.mag = 0;
      this.layer = 0;
      return this;
    }
    if (this.layer === 0 && this.mag < 0) {
      this.mag = -this.mag;
      this.sign = -this.sign;
    }
    if (this.layer === 0 && this.mag < FIRST_NEG_LAYER) {
      this.layer += 1;
      this.mag = Math.log10(this.mag);
      return this;
    }
    let absmag = Math.abs(this.mag);
    let signmag = Math.sign(this.mag);
    if (absmag >= EXP_LIMIT) {
      this.layer += 1;
      this.mag = signmag * Math.log10(absmag);
      return this;
    } else {
      while (absmag < LAYER_DOWN && this.layer > 0) {
        this.layer -= 1;
        if (this.layer === 0) {
          this.mag = Math.pow(10, this.mag);
        } else {
          this.mag = signmag * Math.pow(10, absmag);
          absmag = Math.abs(this.mag);
          signmag = Math.sign(this.mag);
        }
      }
      if (this.layer === 0) {
        if (this.mag < 0) {
          this.mag = -this.mag;
          this.sign = -this.sign;
        } else if (this.mag === 0) {
          this.sign = 0;
        }
      }
    }
    return this;
  }
  fromComponents(sign, layer, mag) {
    this.sign = sign;
    this.layer = layer;
    this.mag = mag;
    this.normalize();
    return this;
  }
  fromComponents_noNormalize(sign, layer, mag) {
    this.sign = sign;
    this.layer = layer;
    this.mag = mag;
    return this;
  }
  fromMantissaExponent(mantissa, exponent) {
    this.layer = 1;
    this.sign = Math.sign(mantissa);
    mantissa = Math.abs(mantissa);
    this.mag = exponent + Math.log10(mantissa);
    this.normalize();
    return this;
  }
  fromMantissaExponent_noNormalize(mantissa, exponent) {
    this.fromMantissaExponent(mantissa, exponent);
    return this;
  }
  fromDecimal(value) {
    this.sign = value.sign;
    this.layer = value.layer;
    this.mag = value.mag;
    return this;
  }
  fromNumber(value) {
    if (!Number.isFinite(value)) {
      this.sign = Math.sign(value);
      this.mag = value;
      this.layer = value;
      return this;
    }
    this.mag = Math.abs(value);
    this.sign = Math.sign(value);
    this.layer = 0;
    this.normalize();
    return this;
  }
  fromString(value) {
    const originalValue = value;
    const cached = Decimal.fromStringCache.get(originalValue);
    if (cached !== undefined) return this.fromDecimal(cached);
    value = value.replace(",", "");
    const pentationparts = value.split("^^^");
    if (pentationparts.length === 2) {
      const base = parseFloat(pentationparts[0]);
      const height = parseFloat(pentationparts[1]);
      const heightparts = pentationparts[1].split(";");
      let payload = 1;
      if (heightparts.length === 2) {
        payload = parseFloat(heightparts[1]);
        if (!Number.isFinite(payload)) payload = 1;
      }
      if (Number.isFinite(base) && Number.isFinite(height)) {
        const result = Decimal.pentate(base, height, payload);
        this.sign = result.sign;
        this.layer = result.layer;
        this.mag = result.mag;
        Decimal.fromStringCache.set(originalValue, Decimal.fromDecimal(this));
        return this;
      }
    }
    const tetrationparts = value.split("^^");
    if (tetrationparts.length === 2) {
      const base = parseFloat(tetrationparts[0]);
      const height = parseFloat(tetrationparts[1]);
      const heightparts = tetrationparts[1].split(";");
      let payload = 1;
      if (heightparts.length === 2) {
        payload = parseFloat(heightparts[1]);
        if (!isFinite(payload)) {
          payload = 1;
        }
      }
      if (isFinite(base) && isFinite(height)) {
        const result = Decimal.tetrate(base, height, payload);
        this.sign = result.sign;
        this.layer = result.layer;
        this.mag = result.mag;
        Decimal.fromStringCache.set(originalValue, Decimal.fromDecimal(this));
        return this;
      }
    }
    const powparts = value.split("^");
    if (powparts.length === 2) {
      const base = parseFloat(powparts[0]);
      const exponent = parseFloat(powparts[1]);
      if (isFinite(base) && isFinite(exponent)) {
        const result = Decimal.pow(base, exponent);
        this.sign = result.sign;
        this.layer = result.layer;
        this.mag = result.mag;
        Decimal.fromStringCache.set(originalValue, Decimal.fromDecimal(this));
        return this;
      }
    }
    value = value.trim().toLowerCase();
    let base;
    let height;
    let ptparts = value.split("pt");
    if (ptparts.length === 2) {
      base = 10;
      height = parseFloat(ptparts[0]);
      ptparts[1] = ptparts[1].replace("(", "");
      ptparts[1] = ptparts[1].replace(")", "");
      let payload = parseFloat(ptparts[1]);
      if (!isFinite(payload)) {
        payload = 1;
      }
      if (isFinite(base) && isFinite(height)) {
        const result = Decimal.tetrate(base, height, payload);
        this.sign = result.sign;
        this.layer = result.layer;
        this.mag = result.mag;
        Decimal.fromStringCache.set(originalValue, Decimal.fromDecimal(this));
        return this;
      }
    }
    ptparts = value.split("p");
    if (ptparts.length === 2) {
      base = 10;
      height = parseFloat(ptparts[0]);
      ptparts[1] = ptparts[1].replace("(", "");
      ptparts[1] = ptparts[1].replace(")", "");
      let payload = parseFloat(ptparts[1]);
      if (!isFinite(payload)) {
        payload = 1;
      }
      if (isFinite(base) && isFinite(height)) {
        const result = Decimal.tetrate(base, height, payload);
        this.sign = result.sign;
        this.layer = result.layer;
        this.mag = result.mag;
        Decimal.fromStringCache.set(originalValue, Decimal.fromDecimal(this));
        return this;
      }
    }
    const parts = value.split("e");
    const ecount = parts.length - 1;
    if (ecount === 0) {
      const numberAttempt = parseFloat(value);
      if (isFinite(numberAttempt)) {
        this.fromNumber(numberAttempt);
        Decimal.fromStringCache.set(originalValue, Decimal.fromDecimal(this));
        return this;
      }
    } else if (ecount === 1) {
      const numberAttempt = parseFloat(value);
      if (isFinite(numberAttempt) && numberAttempt !== 0) {
        this.fromNumber(numberAttempt);
        Decimal.fromStringCache.set(originalValue, Decimal.fromDecimal(this));
        return this;
      }
    }
    const newparts = value.split("e^");
    if (newparts.length === 2) {
      this.sign = 1;
      if (newparts[0].charAt(0) == "-") {
        this.sign = -1;
      }
      let layerstring = "";
      for (let i = 0; i < newparts[1].length; ++i) {
        const chrcode = newparts[1].charCodeAt(i);
        if ((chrcode >= 43 && chrcode <= 57) || chrcode === 101) {
          layerstring += newparts[1].charAt(i);
        } else {
          this.layer = parseFloat(layerstring);
          this.mag = parseFloat(newparts[1].substr(i + 1));
          this.normalize();
          Decimal.fromStringCache.set(originalValue, Decimal.fromDecimal(this));
          return this;
        }
      }
    }
    if (ecount < 1) {
      this.sign = 0;
      this.layer = 0;
      this.mag = 0;
      Decimal.fromStringCache.set(originalValue, Decimal.fromDecimal(this));
      return this;
    }
    const mantissa = parseFloat(parts[0]);
    if (mantissa === 0) {
      this.sign = 0;
      this.layer = 0;
      this.mag = 0;
      Decimal.fromStringCache.set(originalValue, Decimal.fromDecimal(this));
      return this;
    }
    let exponent = parseFloat(parts[parts.length - 1]);
    if (ecount >= 2) {
      const me = parseFloat(parts[parts.length - 2]);
      if (isFinite(me)) {
        exponent *= Math.sign(me);
        exponent += f_maglog10(me);
      }
    }
    if (!isFinite(mantissa)) {
      this.sign = parts[0] === "-" ? -1 : 1;
      this.layer = ecount;
      this.mag = exponent;
    } else if (ecount === 1) {
      this.sign = Math.sign(mantissa);
      this.layer = 1;
      this.mag = exponent + Math.log10(Math.abs(mantissa));
    } else {
      this.sign = Math.sign(mantissa);
      this.layer = ecount;
      if (ecount === 2) {
        const result = Decimal.mul(
          new Decimal().fromComponents(1, 2, exponent),
          Decimal.fromValue_noAlloc(mantissa),
        );
        this.sign = result.sign;
        this.layer = result.layer;
        this.mag = result.mag;
        Decimal.fromStringCache.set(originalValue, Decimal.fromDecimal(this));
        return this;
      } else {
        this.mag = exponent;
      }
    }
    this.normalize();
    Decimal.fromStringCache.set(originalValue, Decimal.fromDecimal(this));
    return this;
  }
  fromValue(value) {
    if (value instanceof Decimal) {
      return this.fromDecimal(value);
    }
    if (typeof value === "number") {
      return this.fromNumber(value);
    }
    if (typeof value === "string") {
      return this.fromString(value);
    }
    this.sign = 0;
    this.layer = 0;
    this.mag = 0;
    return this;
  }
  toNumber() {
    if (!Number.isFinite(this.layer)) {
      return Number.NaN;
    }
    if (this.layer === 0) {
      return this.sign * this.mag;
    } else if (this.layer === 1) {
      return this.sign * Math.pow(10, this.mag);
    } else {
      return this.mag > 0
        ? this.sign > 0
          ? Number.POSITIVE_INFINITY
          : Number.NEGATIVE_INFINITY
        : 0;
    }
  }
  mantissaWithDecimalPlaces(places) {
    if (isNaN(this.m)) {
      return Number.NaN;
    }
    if (this.m === 0) {
      return 0;
    }
    return decimalPlaces(this.m, places);
  }
  magnitudeWithDecimalPlaces(places) {
    if (isNaN(this.mag)) {
      return Number.NaN;
    }
    if (this.mag === 0) {
      return 0;
    }
    return decimalPlaces(this.mag, places);
  }
  toString() {
    if (isNaN(this.layer) || isNaN(this.sign) || isNaN(this.mag)) {
      return "NaN";
    }
    if (
      this.mag === Number.POSITIVE_INFINITY ||
      this.layer === Number.POSITIVE_INFINITY
    ) {
      return this.sign === 1 ? "Infinity" : "-Infinity";
    }
    if (this.layer === 0) {
      if ((this.mag < 1e21 && this.mag > 1e-7) || this.mag === 0) {
        return (this.sign * this.mag).toString();
      }
      return this.m + "e" + this.e;
    } else if (this.layer === 1) {
      return this.m + "e" + this.e;
    } else {
      if (this.layer <= MAX_ES_IN_A_ROW) {
        return (
          (this.sign === -1 ? "-" : "") + "e".repeat(this.layer) + this.mag
        );
      } else {
        return (
          (this.sign === -1 ? "-" : "") + "(e^" + this.layer + ")" + this.mag
        );
      }
    }
  }
  toExponential(places) {
    if (this.layer === 0) {
      return (this.sign * this.mag).toExponential(places);
    }
    return this.toStringWithDecimalPlaces(places);
  }
  toFixed(places) {
    if (this.layer === 0) {
      return (this.sign * this.mag).toFixed(places);
    }
    return this.toStringWithDecimalPlaces(places);
  }
  toPrecision(places) {
    if (this.e <= -7) {
      return this.toExponential(places - 1);
    }
    if (places > this.e) {
      return this.toFixed(places - this.exponent - 1);
    }
    return this.toExponential(places - 1);
  }
  valueOf() {
    return this.toString();
  }
  toJSON() {
    return this.toString();
  }
  toStringWithDecimalPlaces(places) {
    if (this.layer === 0) {
      if ((this.mag < 1e21 && this.mag > 1e-7) || this.mag === 0) {
        return (this.sign * this.mag).toFixed(places);
      }
      return (
        decimalPlaces(this.m, places) + "e" + decimalPlaces(this.e, places)
      );
    } else if (this.layer === 1) {
      return (
        decimalPlaces(this.m, places) + "e" + decimalPlaces(this.e, places)
      );
    } else {
      if (this.layer <= MAX_ES_IN_A_ROW) {
        return (
          (this.sign === -1 ? "-" : "") +
          "e".repeat(this.layer) +
          decimalPlaces(this.mag, places)
        );
      } else {
        return (
          (this.sign === -1 ? "-" : "") +
          "(e^" +
          this.layer +
          ")" +
          decimalPlaces(this.mag, places)
        );
      }
    }
  }
  abs() {
    return new Decimal().fromComponents_noNormalize(
      this.sign === 0 ? 0 : 1,
      this.layer,
      this.mag,
    );
  }
  neg() {
    return new Decimal().fromComponents_noNormalize(
      -this.sign,
      this.layer,
      this.mag,
    );
  }
  negate() {
    return this.neg();
  }
  negated() {
    return this.neg();
  }
  sgn() {
    return this.sign;
  }
  round() {
    if (this.mag < 0) {
      return Decimal.dZero;
    }
    if (this.layer === 0) {
      return new Decimal().fromComponents(this.sign, 0, Math.round(this.mag));
    }
    return this;
  }
  floor() {
    if (this.mag < 0) {
      return Decimal.dZero;
    }
    if (this.layer === 0) {
      return new Decimal().fromComponents(this.sign, 0, Math.floor(this.mag));
    }
    return this;
  }
  ceil() {
    if (this.mag < 0) {
      return Decimal.dZero;
    }
    if (this.layer === 0) {
      return new Decimal().fromComponents(this.sign, 0, Math.ceil(this.mag));
    }
    return this;
  }
  trunc() {
    if (this.mag < 0) {
      return Decimal.dZero;
    }
    if (this.layer === 0) {
      return new Decimal().fromComponents(this.sign, 0, Math.trunc(this.mag));
    }
    return this;
  }
  add(value) {
    const decimal = Decimal.fromValue_noAlloc(value);
    if (!Number.isFinite(this.layer)) {
      return this;
    }
    if (!Number.isFinite(decimal.layer)) {
      return decimal;
    }
    if (this.sign === 0) {
      return decimal;
    }
    if (decimal.sign === 0) {
      return this;
    }
    if (
      this.sign === -decimal.sign &&
      this.layer === decimal.layer &&
      this.mag === decimal.mag
    ) {
      return new Decimal().fromComponents_noNormalize(0, 0, 0);
    }
    let a;
    let b;
    if (this.layer >= 2 || decimal.layer >= 2) {
      return this.maxabs(decimal);
    }
    if (Decimal.cmpabs(this, decimal) > 0) {
      a = this;
      b = decimal;
    } else {
      a = decimal;
      b = this;
    }
    if (a.layer === 0 && b.layer === 0) {
      return Decimal.fromNumber(a.sign * a.mag + b.sign * b.mag);
    }
    const layera = a.layer * Math.sign(a.mag);
    const layerb = b.layer * Math.sign(b.mag);
    if (layera - layerb >= 2) {
      return a;
    }
    if (layera === 0 && layerb === -1) {
      if (Math.abs(b.mag - Math.log10(a.mag)) > MAX_SIGNIFICANT_DIGITS) {
        return a;
      } else {
        const magdiff = Math.pow(10, Math.log10(a.mag) - b.mag);
        const mantissa = b.sign + a.sign * magdiff;
        return new Decimal().fromComponents(
          Math.sign(mantissa),
          1,
          b.mag + Math.log10(Math.abs(mantissa)),
        );
      }
    }
    if (layera === 1 && layerb === 0) {
      if (Math.abs(a.mag - Math.log10(b.mag)) > MAX_SIGNIFICANT_DIGITS) {
        return a;
      } else {
        const magdiff = Math.pow(10, a.mag - Math.log10(b.mag));
        const mantissa = b.sign + a.sign * magdiff;
        return new Decimal().fromComponents(
          Math.sign(mantissa),
          1,
          Math.log10(b.mag) + Math.log10(Math.abs(mantissa)),
        );
      }
    }
    if (Math.abs(a.mag - b.mag) > MAX_SIGNIFICANT_DIGITS) {
      return a;
    } else {
      const magdiff = Math.pow(10, a.mag - b.mag);
      const mantissa = b.sign + a.sign * magdiff;
      return new Decimal().fromComponents(
        Math.sign(mantissa),
        1,
        b.mag + Math.log10(Math.abs(mantissa)),
      );
    }
  }
  plus(value) {
    return this.add(value);
  }
  sub(value) {
    return this.add(Decimal.fromValue_noAlloc(value).neg());
  }
  subtract(value) {
    return this.sub(value);
  }
  minus(value) {
    return this.sub(value);
  }
  mul(value) {
    const decimal = Decimal.fromValue_noAlloc(value);
    if (!Number.isFinite(this.layer)) {
      return this;
    }
    if (!Number.isFinite(decimal.layer)) {
      return decimal;
    }
    if (this.sign === 0 || decimal.sign === 0) {
      return new Decimal().fromComponents_noNormalize(0, 0, 0);
    }
    if (this.layer === decimal.layer && this.mag === -decimal.mag) {
      return new Decimal().fromComponents_noNormalize(
        this.sign * decimal.sign,
        0,
        1,
      );
    }
    let a;
    let b;
    if (
      this.layer > decimal.layer ||
      (this.layer == decimal.layer &&
        Math.abs(this.mag) > Math.abs(decimal.mag))
    ) {
      a = this;
      b = decimal;
    } else {
      a = decimal;
      b = this;
    }
    if (a.layer === 0 && b.layer === 0) {
      return Decimal.fromNumber(a.sign * b.sign * a.mag * b.mag);
    }
    if (a.layer >= 3 || a.layer - b.layer >= 2) {
      return new Decimal().fromComponents(a.sign * b.sign, a.layer, a.mag);
    }
    if (a.layer === 1 && b.layer === 0) {
      return new Decimal().fromComponents(
        a.sign * b.sign,
        1,
        a.mag + Math.log10(b.mag),
      );
    }
    if (a.layer === 1 && b.layer === 1) {
      return new Decimal().fromComponents(a.sign * b.sign, 1, a.mag + b.mag);
    }
    if (a.layer === 2 && b.layer === 1) {
      const newmag = new Decimal()
        .fromComponents(Math.sign(a.mag), a.layer - 1, Math.abs(a.mag))
        .add(
          new Decimal().fromComponents(
            Math.sign(b.mag),
            b.layer - 1,
            Math.abs(b.mag),
          ),
        );
      return new Decimal().fromComponents(
        a.sign * b.sign,
        newmag.layer + 1,
        newmag.sign * newmag.mag,
      );
    }
    if (a.layer === 2 && b.layer === 2) {
      const newmag = new Decimal()
        .fromComponents(Math.sign(a.mag), a.layer - 1, Math.abs(a.mag))
        .add(
          new Decimal().fromComponents(
            Math.sign(b.mag),
            b.layer - 1,
            Math.abs(b.mag),
          ),
        );
      return new Decimal().fromComponents(
        a.sign * b.sign,
        newmag.layer + 1,
        newmag.sign * newmag.mag,
      );
    }
    throw Error("Bad arguments to mul: " + this + ", " + value);
  }
  multiply(value) {
    return this.mul(value);
  }
  times(value) {
    return this.mul(value);
  }
  div(value) {
    const decimal = Decimal.fromValue_noAlloc(value);
    return this.mul(decimal.recip());
  }
  divide(value) {
    return this.div(value);
  }
  divideBy(value) {
    return this.div(value);
  }
  dividedBy(value) {
    return this.div(value);
  }
  recip() {
    if (this.mag === 0) {
      return Decimal.dNaN;
    } else if (this.layer === 0) {
      return new Decimal().fromComponents(this.sign, 0, 1 / this.mag);
    } else {
      return new Decimal().fromComponents(this.sign, this.layer, -this.mag);
    }
  }
  reciprocal() {
    return this.recip();
  }
  reciprocate() {
    return this.recip();
  }
  cmp(value) {
    const decimal = Decimal.fromValue_noAlloc(value);
    if (this.sign > decimal.sign) {
      return 1;
    }
    if (this.sign < decimal.sign) {
      return -1;
    }
    return this.sign * this.cmpabs(value);
  }
  cmpabs(value) {
    const decimal = Decimal.fromValue_noAlloc(value);
    const layera = this.mag > 0 ? this.layer : -this.layer;
    const layerb = decimal.mag > 0 ? decimal.layer : -decimal.layer;
    if (layera > layerb) {
      return 1;
    }
    if (layera < layerb) {
      return -1;
    }
    if (this.mag > decimal.mag) {
      return 1;
    }
    if (this.mag < decimal.mag) {
      return -1;
    }
    return 0;
  }
  compare(value) {
    return this.cmp(value);
  }
  isNan() {
    return isNaN(this.sign) || isNaN(this.layer) || isNaN(this.mag);
  }
  isFinite() {
    return isFinite(this.sign) && isFinite(this.layer) && isFinite(this.mag);
  }
  eq(value) {
    const decimal = Decimal.fromValue_noAlloc(value);
    return (
      this.sign === decimal.sign &&
      this.layer === decimal.layer &&
      this.mag === decimal.mag
    );
  }
  equals(value) {
    return this.eq(value);
  }
  neq(value) {
    return !this.eq(value);
  }
  notEquals(value) {
    return this.neq(value);
  }
  lt(value) {
    return this.cmp(value) === -1;
  }
  lte(value) {
    return !this.gt(value);
  }
  gt(value) {
    return this.cmp(value) === 1;
  }
  gte(value) {
    return !this.lt(value);
  }
  max(value) {
    const decimal = Decimal.fromValue_noAlloc(value);
    return this.lt(decimal) ? decimal : this;
  }
  min(value) {
    const decimal = Decimal.fromValue_noAlloc(value);
    return this.gt(decimal) ? decimal : this;
  }
  maxabs(value) {
    const decimal = Decimal.fromValue_noAlloc(value);
    return this.cmpabs(decimal) < 0 ? decimal : this;
  }
  minabs(value) {
    const decimal = Decimal.fromValue_noAlloc(value);
    return this.cmpabs(decimal) > 0 ? decimal : this;
  }
  clamp(min, max) {
    return this.max(min).min(max);
  }
  clampMin(min) {
    return this.max(min);
  }
  clampMax(max) {
    return this.min(max);
  }
  cmp_tolerance(value, tolerance) {
    const decimal = Decimal.fromValue_noAlloc(value);
    return this.eq_tolerance(decimal, tolerance) ? 0 : this.cmp(decimal);
  }
  compare_tolerance(value, tolerance) {
    return this.cmp_tolerance(value, tolerance);
  }
  eq_tolerance(value, tolerance) {
    const decimal = Decimal.fromValue_noAlloc(value);
    if (tolerance == null) {
      tolerance = 1e-7;
    }
    if (this.sign !== decimal.sign) {
      return false;
    }
    if (Math.abs(this.layer - decimal.layer) > 1) {
      return false;
    }
    let magA = this.mag;
    let magB = decimal.mag;
    if (this.layer > decimal.layer) {
      magB = f_maglog10(magB);
    }
    if (this.layer < decimal.layer) {
      magA = f_maglog10(magA);
    }
    return (
      Math.abs(magA - magB) <=
      tolerance * Math.max(Math.abs(magA), Math.abs(magB))
    );
  }
  equals_tolerance(value, tolerance) {
    return this.eq_tolerance(value, tolerance);
  }
  neq_tolerance(value, tolerance) {
    return !this.eq_tolerance(value, tolerance);
  }
  notEquals_tolerance(value, tolerance) {
    return this.neq_tolerance(value, tolerance);
  }
  lt_tolerance(value, tolerance) {
    const decimal = Decimal.fromValue_noAlloc(value);
    return !this.eq_tolerance(decimal, tolerance) && this.lt(decimal);
  }
  lte_tolerance(value, tolerance) {
    const decimal = Decimal.fromValue_noAlloc(value);
    return this.eq_tolerance(decimal, tolerance) || this.lt(decimal);
  }
  gt_tolerance(value, tolerance) {
    const decimal = Decimal.fromValue_noAlloc(value);
    return !this.eq_tolerance(decimal, tolerance) && this.gt(decimal);
  }
  gte_tolerance(value, tolerance) {
    const decimal = Decimal.fromValue_noAlloc(value);
    return this.eq_tolerance(decimal, tolerance) || this.gt(decimal);
  }
  pLog10() {
    if (this.lt(Decimal.dZero)) {
      return Decimal.dZero;
    }
    return this.log10();
  }
  absLog10() {
    if (this.sign === 0) {
      return Decimal.dNaN;
    } else if (this.layer > 0) {
      return new Decimal().fromComponents(
        Math.sign(this.mag),
        this.layer - 1,
        Math.abs(this.mag),
      );
    } else {
      return new Decimal().fromComponents(1, 0, Math.log10(this.mag));
    }
  }
  log10() {
    if (this.sign <= 0) {
      return Decimal.dNaN;
    } else if (this.layer > 0) {
      return new Decimal().fromComponents(
        Math.sign(this.mag),
        this.layer - 1,
        Math.abs(this.mag),
      );
    } else {
      return new Decimal().fromComponents(this.sign, 0, Math.log10(this.mag));
    }
  }
  log(base) {
    base = Decimal.fromValue_noAlloc(base);
    if (this.sign <= 0) {
      return Decimal.dNaN;
    }
    if (base.sign <= 0) {
      return Decimal.dNaN;
    }
    if (base.sign === 1 && base.layer === 0 && base.mag === 1) {
      return Decimal.dNaN;
    } else if (this.layer === 0 && base.layer === 0) {
      return new Decimal().fromComponents(
        this.sign,
        0,
        Math.log(this.mag) / Math.log(base.mag),
      );
    }
    return Decimal.div(this.log10(), base.log10());
  }
  log2() {
    if (this.sign <= 0) {
      return Decimal.dNaN;
    } else if (this.layer === 0) {
      return new Decimal().fromComponents(this.sign, 0, Math.log2(this.mag));
    } else if (this.layer === 1) {
      return new Decimal().fromComponents(
        Math.sign(this.mag),
        0,
        Math.abs(this.mag) * 3.321928094887362,
      );
    } else if (this.layer === 2) {
      return new Decimal().fromComponents(
        Math.sign(this.mag),
        1,
        Math.abs(this.mag) + 0.5213902276543247,
      );
    } else {
      return new Decimal().fromComponents(
        Math.sign(this.mag),
        this.layer - 1,
        Math.abs(this.mag),
      );
    }
  }
  ln() {
    if (this.sign <= 0) {
      return Decimal.dNaN;
    } else if (this.layer === 0) {
      return new Decimal().fromComponents(this.sign, 0, Math.log(this.mag));
    } else if (this.layer === 1) {
      return new Decimal().fromComponents(
        Math.sign(this.mag),
        0,
        Math.abs(this.mag) * 2.302585092994046,
      );
    } else if (this.layer === 2) {
      return new Decimal().fromComponents(
        Math.sign(this.mag),
        1,
        Math.abs(this.mag) + 0.36221568869946325,
      );
    } else {
      return new Decimal().fromComponents(
        Math.sign(this.mag),
        this.layer - 1,
        Math.abs(this.mag),
      );
    }
  }
  logarithm(base) {
    return this.log(base);
  }
  pow(value) {
    const decimal = Decimal.fromValue_noAlloc(value);
    const a = this;
    const b = decimal;
    if (a.sign === 0) {
      return b.eq(0) ? new Decimal().fromComponents_noNormalize(1, 0, 1) : a;
    }
    if (a.sign === 1 && a.layer === 0 && a.mag === 1) {
      return a;
    }
    if (b.sign === 0) {
      return new Decimal().fromComponents_noNormalize(1, 0, 1);
    }
    if (b.sign === 1 && b.layer === 0 && b.mag === 1) {
      return a;
    }
    const result = a.absLog10().mul(b).pow10();
    if (this.sign === -1) {
      if (Math.abs(b.toNumber() % 2) % 2 === 1) {
        return result.neg();
      } else if (Math.abs(b.toNumber() % 2) % 2 === 0) {
        return result;
      }
      return Decimal.dNaN;
    }
    return result;
  }
  pow10() {
    if (!Number.isFinite(this.layer) || !Number.isFinite(this.mag)) {
      return Decimal.dNaN;
    }
    let a = this;
    if (a.layer === 0) {
      const newmag = Math.pow(10, a.sign * a.mag);
      if (Number.isFinite(newmag) && Math.abs(newmag) >= 0.1) {
        return new Decimal().fromComponents(1, 0, newmag);
      } else {
        if (a.sign === 0) {
          return Decimal.dOne;
        } else {
          a = new Decimal().fromComponents_noNormalize(
            a.sign,
            a.layer + 1,
            Math.log10(a.mag),
          );
        }
      }
    }
    if (a.sign > 0 && a.mag >= 0) {
      return new Decimal().fromComponents(a.sign, a.layer + 1, a.mag);
    }
    if (a.sign < 0 && a.mag >= 0) {
      return new Decimal().fromComponents(-a.sign, a.layer + 1, -a.mag);
    }
    return Decimal.dOne;
  }
  pow_base(value) {
    return Decimal.fromValue_noAlloc(value).pow(this);
  }
  root(value) {
    const decimal = Decimal.fromValue_noAlloc(value);
    return this.pow(decimal.recip());
  }
  factorial() {
    if (this.mag < 0) {
      return this.add(1).gamma();
    } else if (this.layer === 0) {
      return this.add(1).gamma();
    } else if (this.layer === 1) {
      return Decimal.exp(Decimal.mul(this, Decimal.ln(this).sub(1)));
    } else {
      return Decimal.exp(this);
    }
  }
  gamma() {
    if (this.mag < 0) {
      return this.recip();
    } else if (this.layer === 0) {
      if (this.lt(new Decimal().fromComponents_noNormalize(1, 0, 24))) {
        return Decimal.fromNumber(f_gamma(this.sign * this.mag));
      }
      const t = this.mag - 1;
      let l = 0.9189385332046727;
      l = l + (t + 0.5) * Math.log(t);
      l = l - t;
      const n2 = t * t;
      let np = t;
      let lm = 12 * np;
      let adj = 1 / lm;
      let l2 = l + adj;
      if (l2 === l) {
        return Decimal.exp(l);
      }
      l = l2;
      np = np * n2;
      lm = 360 * np;
      adj = 1 / lm;
      l2 = l - adj;
      if (l2 === l) {
        return Decimal.exp(l);
      }
      l = l2;
      np = np * n2;
      lm = 1260 * np;
      let lt = 1 / lm;
      l = l + lt;
      np = np * n2;
      lm = 1680 * np;
      lt = 1 / lm;
      l = l - lt;
      return Decimal.exp(l);
    } else if (this.layer === 1) {
      return Decimal.exp(Decimal.mul(this, Decimal.ln(this).sub(1)));
    } else {
      return Decimal.exp(this);
    }
  }
  lngamma() {
    return this.gamma().ln();
  }
  exp() {
    if (this.mag < 0) {
      return Decimal.dOne;
    }
    if (this.layer === 0 && this.mag <= 709.7) {
      return Decimal.fromNumber(Math.exp(this.sign * this.mag));
    } else if (this.layer === 0) {
      return new Decimal().fromComponents(
        1,
        1,
        this.sign * Math.log10(Math.E) * this.mag,
      );
    } else if (this.layer === 1) {
      return new Decimal().fromComponents(
        1,
        2,
        this.sign * (Math.log10(0.4342944819032518) + this.mag),
      );
    } else {
      return new Decimal().fromComponents(
        1,
        this.layer + 1,
        this.sign * this.mag,
      );
    }
  }
  sqr() {
    return this.pow(2);
  }
  sqrt() {
    if (this.layer === 0) {
      return Decimal.fromNumber(Math.sqrt(this.sign * this.mag));
    } else if (this.layer === 1) {
      return new Decimal().fromComponents(
        1,
        2,
        Math.log10(this.mag) - 0.3010299956639812,
      );
    } else {
      const result = Decimal.div(
        new Decimal().fromComponents_noNormalize(
          this.sign,
          this.layer - 1,
          this.mag,
        ),
        new Decimal().fromComponents_noNormalize(1, 0, 2),
      );
      result.layer += 1;
      result.normalize();
      return result;
    }
  }
  cube() {
    return this.pow(3);
  }
  cbrt() {
    return this.pow(1 / 3);
  }
  tetrate(
    height = 2,
    payload = new Decimal().fromComponents_noNormalize(1, 0, 1),
  ) {
    if (height === 1) {
      return Decimal.pow(this, payload);
    }
    if (height === 0) {
      return new Decimal(payload);
    }
    if (this.eq(Decimal.dOne)) {
      return Decimal.dOne;
    }
    if (this.eq(-1)) {
      return Decimal.pow(this, payload);
    }
    if (height === Number.POSITIVE_INFINITY) {
      const this_num = this.toNumber();
      if (
        this_num <= 1.44466786100976613366 &&
        this_num >= 0.06598803584531253708
      ) {
        if (this_num > 1.444667861009099) {
          return Decimal.fromNumber(Math.E);
        }
        const negln = Decimal.ln(this).neg();
        return negln.lambertw().div(negln);
      } else if (this_num > 1.44466786100976613366) {
        return Decimal.fromNumber(Number.POSITIVE_INFINITY);
      } else {
        return Decimal.dNaN;
      }
    }
    if (this.eq(Decimal.dZero)) {
      let result = Math.abs((height + 1) % 2);
      if (result > 1) {
        result = 2 - result;
      }
      return Decimal.fromNumber(result);
    }
    if (height < 0) {
      return Decimal.iteratedlog(payload, this, -height);
    }
    payload = Decimal.fromValue_noAlloc(payload);
    const oldheight = height;
    height = Math.trunc(height);
    const fracheight = oldheight - height;
    if (this.gt(Decimal.dZero) && this.lte(1.44466786100976613366)) {
      height = Math.min(10000, height);
      for (let i = 0; i < height; ++i) {
        const old_payload = payload;
        payload = this.pow(payload);
        if (old_payload.eq(payload)) {
          return payload;
        }
      }
      if (fracheight != 0) {
        const next_payload = this.pow(payload);
        return payload.mul(1 - fracheight).add(next_payload.mul(fracheight));
      }
      return payload;
    }
    if (fracheight !== 0) {
      if (payload.eq(Decimal.dOne)) {
        if (this.gt(10)) {
          payload = this.pow(fracheight);
        } else {
          payload = Decimal.fromNumber(
            Decimal.tetrate_critical(this.toNumber(), fracheight),
          );
          if (this.lt(2)) {
            payload = payload.sub(1).mul(this.minus(1)).plus(1);
          }
        }
      } else {
        if (this.eq(10)) {
          payload = payload.layeradd10(fracheight);
        } else {
          payload = payload.layeradd(fracheight, this);
        }
      }
    }
    for (let i = 0; i < height; ++i) {
      payload = this.pow(payload);
      if (!isFinite(payload.layer) || !isFinite(payload.mag)) {
        return payload.normalize();
      }
      if (payload.layer - this.layer > 3) {
        return new Decimal().fromComponents_noNormalize(
          payload.sign,
          payload.layer + (height - i - 1),
          payload.mag,
        );
      }
      if (i > 10000) {
        return payload;
      }
    }
    return payload;
  }
  iteratedexp(
    height = 2,
    payload = new Decimal().fromComponents_noNormalize(1, 0, 1),
  ) {
    return this.tetrate(height, payload);
  }
  iteratedlog(base = 10, times = 1) {
    if (times < 0) {
      return Decimal.tetrate(base, -times, this);
    }
    base = Decimal.fromValue_noAlloc(base);
    let result = Decimal.fromDecimal(this);
    const fulltimes = times;
    times = Math.trunc(times);
    const fraction = fulltimes - times;
    if (result.layer - base.layer > 3) {
      const layerloss = Math.min(times, result.layer - base.layer - 3);
      times -= layerloss;
      result.layer -= layerloss;
    }
    for (let i = 0; i < times; ++i) {
      result = result.log(base);
      if (!isFinite(result.layer) || !isFinite(result.mag)) {
        return result.normalize();
      }
      if (i > 10000) {
        return result;
      }
    }
    if (fraction > 0 && fraction < 1) {
      if (base.eq(10)) {
        result = result.layeradd10(-fraction);
      } else {
        result = result.layeradd(-fraction, base);
      }
    }
    return result;
  }
  slog(base = 10, iterations = 100) {
    let step_size = 0.001;
    let has_changed_directions_once = false;
    let previously_rose = false;
    let result = this.slog_internal(base).toNumber();
    for (var i = 1; i < iterations; ++i) {
      let new_decimal = new Decimal(base).tetrate(result);
      let currently_rose = new_decimal.gt(this);
      if (i > 1) {
        if (previously_rose != currently_rose) {
          has_changed_directions_once = true;
        }
      }
      previously_rose = currently_rose;
      if (has_changed_directions_once) {
        step_size /= 2;
      } else {
        step_size *= 2;
      }
      step_size = Math.abs(step_size) * (currently_rose ? -1 : 1);
      result += step_size;
      if (step_size === 0) {
        break;
      }
    }
    return Decimal.fromNumber(result);
  }
  slog_internal(base = 10) {
    base = Decimal.fromValue_noAlloc(base);
    if (base.lte(Decimal.dZero)) {
      return Decimal.dNaN;
    }
    if (base.eq(Decimal.dOne)) {
      return Decimal.dNaN;
    }
    if (base.lt(Decimal.dOne)) {
      if (this.eq(Decimal.dOne)) {
        return Decimal.dZero;
      }
      if (this.eq(Decimal.dZero)) {
        return Decimal.dNegOne;
      }
      return Decimal.dNaN;
    }
    if (this.mag < 0 || this.eq(Decimal.dZero)) {
      return Decimal.dNegOne;
    }
    let result = 0;
    let copy = Decimal.fromDecimal(this);
    if (copy.layer - base.layer > 3) {
      const layerloss = copy.layer - base.layer - 3;
      result += layerloss;
      copy.layer -= layerloss;
    }
    for (let i = 0; i < 100; ++i) {
      if (copy.lt(Decimal.dZero)) {
        copy = Decimal.pow(base, copy);
        result -= 1;
      } else if (copy.lte(Decimal.dOne)) {
        return Decimal.fromNumber(
          result + Decimal.slog_critical(base.toNumber(), copy.toNumber()),
        );
      } else {
        result += 1;
        copy = Decimal.log(copy, base);
      }
    }
    return Decimal.fromNumber(result);
  }
  static slog_critical(base, height) {
    if (base > 10) {
      return height - 1;
    }
    return Decimal.critical_section(base, height, critical_slog_values);
  }
  static tetrate_critical(base, height) {
    return Decimal.critical_section(base, height, critical_tetr_values);
  }
  static critical_section(base, height, grid) {
    height *= 10;
    if (height < 0) {
      height = 0;
    }
    if (height > 10) {
      height = 10;
    }
    if (base < 2) {
      base = 2;
    }
    if (base > 10) {
      base = 10;
    }
    let lower = 0;
    let upper = 0;
    for (let i = 0; i < critical_headers.length; ++i) {
      if (critical_headers[i] == base) {
        lower = grid[i][Math.floor(height)];
        upper = grid[i][Math.ceil(height)];
        break;
      } else if (critical_headers[i] < base && critical_headers[i + 1] > base) {
        const basefrac =
          (base - critical_headers[i]) /
          (critical_headers[i + 1] - critical_headers[i]);
        lower =
          grid[i][Math.floor(height)] * (1 - basefrac) +
          grid[i + 1][Math.floor(height)] * basefrac;
        upper =
          grid[i][Math.ceil(height)] * (1 - basefrac) +
          grid[i + 1][Math.ceil(height)] * basefrac;
        break;
      }
    }
    const frac = height - Math.floor(height);
    if (lower <= 0 || upper <= 0) {
      return lower * (1 - frac) + upper * frac;
    } else {
      return Math.pow(
        base,
        (Math.log(lower) / Math.log(base)) * (1 - frac) +
          (Math.log(upper) / Math.log(base)) * frac,
      );
    }
  }
  layeradd10(diff) {
    diff = Decimal.fromValue_noAlloc(diff).toNumber();
    const result = Decimal.fromDecimal(this);
    if (diff >= 1) {
      if (result.mag < 0 && result.layer > 0) {
        result.sign = 0;
        result.mag = 0;
        result.layer = 0;
      } else if (result.sign === -1 && result.layer == 0) {
        result.sign = 1;
        result.mag = -result.mag;
      }
      const layeradd = Math.trunc(diff);
      diff -= layeradd;
      result.layer += layeradd;
    }
    if (diff <= -1) {
      const layeradd = Math.trunc(diff);
      diff -= layeradd;
      result.layer += layeradd;
      if (result.layer < 0) {
        for (let i = 0; i < 100; ++i) {
          result.layer++;
          result.mag = Math.log10(result.mag);
          if (!isFinite(result.mag)) {
            if (result.sign === 0) {
              result.sign = 1;
            }
            if (result.layer < 0) {
              result.layer = 0;
            }
            return result.normalize();
          }
          if (result.layer >= 0) {
            break;
          }
        }
      }
    }
    while (result.layer < 0) {
      result.layer++;
      result.mag = Math.log10(result.mag);
    }
    if (result.sign === 0) {
      result.sign = 1;
      if (result.mag === 0 && result.layer >= 1) {
        result.layer -= 1;
        result.mag = 1;
      }
    }
    result.normalize();
    if (diff !== 0) {
      return result.layeradd(diff, 10);
    }
    return result;
  }
  layeradd(diff, base) {
    const slogthis = this.slog(base).toNumber();
    const slogdest = slogthis + diff;
    if (slogdest >= 0) {
      return Decimal.tetrate(base, slogdest);
    } else if (!Number.isFinite(slogdest)) {
      return Decimal.dNaN;
    } else if (slogdest >= -1) {
      return Decimal.log(Decimal.tetrate(base, slogdest + 1), base);
    } else {
      return Decimal.log(
        Decimal.log(Decimal.tetrate(base, slogdest + 2), base),
        base,
      );
    }
  }
  lambertw() {
    if (this.lt(-0.3678794411710499)) {
      throw Error("lambertw is unimplemented for results less than -1, sorry!");
    } else if (this.mag < 0) {
      return Decimal.fromNumber(f_lambertw(this.toNumber()));
    } else if (this.layer === 0) {
      return Decimal.fromNumber(f_lambertw(this.sign * this.mag));
    } else if (this.layer === 1) {
      return d_lambertw(this);
    } else if (this.layer === 2) {
      return d_lambertw(this);
    }
    if (this.layer >= 3) {
      return new Decimal().fromComponents_noNormalize(
        this.sign,
        this.layer - 1,
        this.mag,
      );
    }
    throw "Unhandled behavior in lambertw()";
  }
  ssqrt() {
    if (this.sign == 1 && this.layer >= 3) {
      return new Decimal().fromComponents_noNormalize(
        this.sign,
        this.layer - 1,
        this.mag,
      );
    }
    const lnx = this.ln();
    return lnx.div(lnx.lambertw());
  }
  pentate(
    height = 2,
    payload = new Decimal().fromComponents_noNormalize(1, 0, 1),
  ) {
    payload = Decimal.fromValue_noAlloc(payload);
    const oldheight = height;
    height = Math.trunc(height);
    const fracheight = oldheight - height;
    if (fracheight !== 0) {
      if (payload.eq(Decimal.dOne)) {
        ++height;
        payload = Decimal.fromNumber(fracheight);
      } else {
        if (this.eq(10)) {
          payload = payload.layeradd10(fracheight);
        } else {
          payload = payload.layeradd(fracheight, this);
        }
      }
    }
    for (let i = 0; i < height; ++i) {
      payload = this.tetrate(payload.toNumber());
      if (!isFinite(payload.layer) || !isFinite(payload.mag)) {
        return payload.normalize();
      }
      if (i > 10) {
        return payload;
      }
    }
    return payload;
  }
  sin() {
    if (this.mag < 0) {
      return this;
    }
    if (this.layer === 0) {
      return Decimal.fromNumber(Math.sin(this.sign * this.mag));
    }
    return new Decimal().fromComponents_noNormalize(0, 0, 0);
  }
  cos() {
    if (this.mag < 0) {
      return Decimal.dOne;
    }
    if (this.layer === 0) {
      return Decimal.fromNumber(Math.cos(this.sign * this.mag));
    }
    return new Decimal().fromComponents_noNormalize(0, 0, 0);
  }
  tan() {
    if (this.mag < 0) {
      return this;
    }
    if (this.layer === 0) {
      return Decimal.fromNumber(Math.tan(this.sign * this.mag));
    }
    return new Decimal().fromComponents_noNormalize(0, 0, 0);
  }
  asin() {
    if (this.mag < 0) {
      return this;
    }
    if (this.layer === 0) {
      return Decimal.fromNumber(Math.asin(this.sign * this.mag));
    }
    return new Decimal().fromComponents_noNormalize(
      Number.NaN,
      Number.NaN,
      Number.NaN,
    );
  }
  acos() {
    if (this.mag < 0) {
      return Decimal.fromNumber(Math.acos(this.toNumber()));
    }
    if (this.layer === 0) {
      return Decimal.fromNumber(Math.acos(this.sign * this.mag));
    }
    return new Decimal().fromComponents_noNormalize(
      Number.NaN,
      Number.NaN,
      Number.NaN,
    );
  }
  atan() {
    if (this.mag < 0) {
      return this;
    }
    if (this.layer === 0) {
      return Decimal.fromNumber(Math.atan(this.sign * this.mag));
    }
    return Decimal.fromNumber(Math.atan(this.sign * 1.8e308));
  }
  sinh() {
    return this.exp().sub(this.negate().exp()).div(2);
  }
  cosh() {
    return this.exp().add(this.negate().exp()).div(2);
  }
  tanh() {
    return this.sinh().div(this.cosh());
  }
  asinh() {
    return Decimal.ln(this.add(this.sqr().add(1).sqrt()));
  }
  acosh() {
    return Decimal.ln(this.add(this.sqr().sub(1).sqrt()));
  }
  atanh() {
    if (this.abs().gte(1)) {
      return new Decimal().fromComponents_noNormalize(
        Number.NaN,
        Number.NaN,
        Number.NaN,
      );
    }
    return Decimal.ln(this.add(1).div(Decimal.fromNumber(1).sub(this))).div(2);
  }
  ascensionPenalty(ascensions) {
    if (ascensions === 0) {
      return this;
    }
    return this.root(Decimal.pow(10, ascensions));
  }
  egg() {
    return this.add(9);
  }
  lessThanOrEqualTo(other) {
    return this.cmp(other) < 1;
  }
  lessThan(other) {
    return this.cmp(other) < 0;
  }
  greaterThanOrEqualTo(other) {
    return this.cmp(other) > -1;
  }
  greaterThan(other) {
    return this.cmp(other) > 0;
  }
}

const decimalMap = {
  [-1]: Decimal.dNegOne,
  0: Decimal.dZero,
  1: Decimal.dOne,
  2: Decimal.dTwo,
  10: Decimal.dTen,
};
