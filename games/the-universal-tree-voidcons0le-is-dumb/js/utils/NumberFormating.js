
function exponentialFormat(num, precision, mantissa = true) {
    let e = num.log10().floor()
    let m = num.div(Decimal.pow(10, e))
    if (m.toStringWithDecimalPlaces(precision) == 10) {
        m = decimalOne
        e = e.add(1)
    }
    e = (e.gte(1e9) ? format(e, 3) : (e.gte(10000) ? commaFormat(e, 0) : e.toStringWithDecimalPlaces(0)))
    if (mantissa)
        return m.toStringWithDecimalPlaces(precision) + "e" + e
    else return "e" + e
}

function commaFormat(num, precision) {
    if (num === null || num === undefined) return "NaN"
    if (num.mag < 0.001) return (0).toFixed(precision)
    let init = num.toStringWithDecimalPlaces(precision)
    let portions = init.split(".")
    portions[0] = portions[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
    if (portions.length == 1) return portions[0]
    return portions[0] + "." + portions[1]
}


function regularFormat(num, precision) {
    if (num === null || num === undefined) return "NaN"
    if (num.mag < 0.0001) return (0).toFixed(precision)
    if (num.mag < 0.1 && precision !==0) precision = Math.max(precision, 4)
    return num.toStringWithDecimalPlaces(precision)
}

function fixValue(x, y = 0) {
    return x || new Decimal(y)
}

function sumValues(x) {
    x = Object.values(x)
    if (!x[0]) return decimalZero
    return x.reduce((a, b) => Decimal.add(a, b))
}

// ===============================
// NumberFormatting.js for TMT
// Standard, Scientific, Engineering, Letters
// Short-illions up to 10^3003+
// ===============================

// --- Short-illion arrays for STANDARD notation ---
const ONES = ["", "Un", "Do", "Tr", "Qa", "Qi", "Sx", "Sp", "Oc", "No"];
const TENS = ["", "Dc", "Vg", "Tg", "Qd", "Qt", "Sx", "Sp", "Oc", "No"];
const HUNDREDS = ["", "Ce", "UCe", "DCe", "TCe", "QaCe", "QiCe", "SxCe", "SpCe", "OcCe"];

// --- Get suffix for a given tier ---
function getIllionSuffix(tier) {
    const BASE = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
    if (tier < BASE.length) return BASE[tier];

    const hundredsDigit = Math.floor(tier / 100);
    const tensDigit = Math.floor((tier % 100) / 10);
    const onesDigit = tier % 10;

    return (ONES[onesDigit] || "") + (TENS[tensDigit] || "") + (HUNDREDS[hundredsDigit] || "");
}

// --- Main format dispatcher ---
function format(decimal, precision = 2, small) {
    small = small || modInfo.allowSmall;
    decimal = new Decimal(decimal);

    if (isNaN(decimal.sign) || isNaN(decimal.layer) || isNaN(decimal.mag)) {
        player.hasNaN = true;
        return "NaN";
    }

    if (decimal.sign < 0) return "-" + format(decimal.neg(), precision, small);
    if (decimal.mag === Number.POSITIVE_INFINITY) return "Infinity";

    if (decimal.gte(1e6)) return formatByNotation(decimal, precision);
    if (decimal.gte(1e3)) return commaFormat(decimal, 0);
    if (decimal.gte(0.0001) || !small) return regularFormat(decimal, precision);
    if (decimal.eq(0)) return (0).toFixed(precision);

    // Tiny numbers
    decimal = invertOOM(decimal);
    return exponentialFormat(decimal, precision);
}

// --- Dispatch to selected notation ---
function formatByNotation(decimal, precision = 2) {
    const notation = options.notation || "standard";
    switch (notation) {
        case "scientific":
            return exponentialFormat(decimal, precision);
        case "engineering":
            return formatEngineering(decimal, precision);
        case "letters":
            return formatLetters(decimal, precision);
        case "standard":
        default:
            return formatStandard(decimal, precision);
    }
}

// --- STANDARD (short illion) ---
function formatStandard(decimal, precision = 2) {
    if (decimal.lt(1e3)) return regularFormat(decimal, precision);

    const tier = Math.floor(decimal.log10().div(3).floor().toNumber());
    const mantissa = decimal.div(Decimal.pow(10, tier * 3));
    const suffix = getIllionSuffix(tier);

    return mantissa.toStringWithDecimalPlaces(precision) + suffix;
}

// --- ENGINEERING ---
function formatEngineering(decimal, precision = 2) {
    const exp = decimal.log10().div(3).floor().mul(3);
    const mantissa = decimal.div(Decimal.pow(10, exp));
    return mantissa.toStringWithDecimalPlaces(precision) + "e" + exp.toStringWithDecimalPlaces(0);
}

// --- LETTERS ---
function formatLetters(decimal, precision = 2) {
    const tier = Math.floor(decimal.log10().div(3).floor().toNumber());
    const mantissa = decimal.div(Decimal.pow(10, tier * 3));
    const letters = getLetters(tier);
    return mantissa.toStringWithDecimalPlaces(precision) + letters;
}

function getLetters(index) {
    let str = "";
    while (index >= 0) {
        str = String.fromCharCode(65 + (index % 26)) + str;
        index = Math.floor(index / 26) - 1;
    }
    return str;
}

function formatWhole(decimal) {
    decimal = new Decimal(decimal)
    if (decimal.gte(1e9)) return format(decimal, 2)
    if (decimal.lte(0.99) && !decimal.eq(0)) return format(decimal, 2)
    return format(decimal, 0)
}

function formatTime(s) {
    if (s < 60) return format(s) + "s"
    else if (s < 3600) return formatWhole(Math.floor(s / 60)) + "m " + format(s % 60) + "s"
    else if (s < 86400) return formatWhole(Math.floor(s / 3600)) + "h " + formatWhole(Math.floor(s / 60) % 60) + "m " + format(s % 60) + "s"
    else if (s < 31536000) return formatWhole(Math.floor(s / 86400) % 365) + "d " + formatWhole(Math.floor(s / 3600) % 24) + "h " + formatWhole(Math.floor(s / 60) % 60) + "m " + format(s % 60) + "s"
    else return formatWhole(Math.floor(s / 31536000)) + "y " + formatWhole(Math.floor(s / 86400) % 365) + "d " + formatWhole(Math.floor(s / 3600) % 24) + "h " + formatWhole(Math.floor(s / 60) % 60) + "m " + format(s % 60) + "s"
}

function toPlaces(x, precision, maxAccepted) {
    x = new Decimal(x)
    let result = x.toStringWithDecimalPlaces(precision)
    if (new Decimal(result).gte(maxAccepted)) {
        result = new Decimal(maxAccepted - Math.pow(0.1, precision)).toStringWithDecimalPlaces(precision)
    }
    return result
}

// Will also display very small numbers
function formatSmall(x, precision=2) { 
    return format(x, precision, true)    
}

function invertOOM(x){
    let e = x.log10().ceil()
    let m = x.div(Decimal.pow(10, e))
    e = e.neg()
    x = new Decimal(10).pow(e).times(m)

    return x
}