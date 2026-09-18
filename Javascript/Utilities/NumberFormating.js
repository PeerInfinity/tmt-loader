
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

function format(decimal, precision = 2, small) {
    small = small || modInfo.allowSmall
    decimal = new Decimal(decimal)
    if (isNaN(decimal.sign) || isNaN(decimal.layer) || isNaN(decimal.mag)) {
        player.hasNaN = true;
        return "NaN"
    }
    if (decimal.sign < 0) return "-" + format(decimal.neg(), precision, small)
    if (decimal.mag == Number.POSITIVE_INFINITY) return "Infinity"
    if (decimal.gte("eeee1000")) {
        var slog = decimal.slog()
        if (slog.gte(1e6)) return "F" + format(slog.floor())
        else return Decimal.pow(10, slog.sub(slog.floor())).toStringWithDecimalPlaces(3) + "F" + commaFormat(slog.floor(), 0)
    }
    else if (decimal.gte("1e1000000")) return exponentialFormat(decimal, 0, false)
    else if (decimal.gte("1e10000")) return exponentialFormat(decimal, 0)
    else if (decimal.gte(1e9)) return exponentialFormat(decimal, precision)
    else if (decimal.gte(1e3)) return commaFormat(decimal, 0)
    else if (decimal.gte(0.0001) || !small) return regularFormat(decimal, precision)
    else if (decimal.eq(0)) return (0).toFixed(precision)

    decimal = invertOOM(decimal)
    let val = ""
    if (decimal.lt("1e1000")){
        val = exponentialFormat(decimal, precision)
        return val.replace(/([^(?:e|F)]*)$/, '-$1')
    }
    else   
        return format(decimal, precision) + "⁻¹"

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

// Custom Formatting After This
function formatTimeEX(x, places = 2) {
    let a = new Decimal(60)
    let b = new Decimal(3600)
    let c = b.times(24)
    let d = c.times(365.25)
    let e = d.times(237500000)
    let f = d.times(Number.MAX_VALUE)
    let g = f.pow(Number.MAX_VALUE)

    if (x.lt(a)) return `${format(x, places)} Seconds`
    if (x.lt(b)) return `${format(x.div(a), places)} Minutes`
    if (x.lt(c)) return `${format(x.div(b), places)} Hours`
    if (x.lt(d)) return `${format(x.div(c), places)} Days`
    if (x.lt(e)) return `${format(x.div(d), places)} Calendar Years`
    if (x.lt(f)) return `${format(x.div(e), places)} Galactic Years`
    if (x.lt(g)) return `${format(x.div(f).log(Number.MAX_VALUE), places)} Infinity Years`
    else return `${format(x.div(g).log(new Decimal(Number.MAX_VALUE).pow(Number.MAX_VALUE)), places)} Eternity Years`
}

function formatDistance(x, places = 2) {
    let a = new Decimal("e3") // Kilometers
    let b = new Decimal("e6") // Megameters
    let c = new Decimal("e9") // Gigameters
    let d = c.times(149.597871) // Astronomical Units
    let e = d.times(63239.74) // Light Years
    let f = e.times("9.37e10") // Observable Universes
    let g = f.pow(f) // Multiverses

    if (x.lt(a)) return `${format(x, places)} Meters`
    if (x.lt(b)) return `${format(x.div(a), places)} Kilometers`
    if (x.lt(c)) return `${format(x.div(b), places)} Megameters`
    if (x.lt(d)) return `${format(x.div(c), places)} Gigameters`
    if (x.lt(e)) return `${format(x.div(d), places)} AU (Astronomical Units)`
    if (x.lt(f)) return `${format(x.div(e), places)} LY (Light Years)`
    if (x.lt(g)) return `${format(x.log(f), places + 2)} Universes`
    else return `${format(x.log(g), places + 3)} Multiverses`
}

function formatSpeed(x, places = 2) {
    let a = new Decimal(343)
    let b = new Decimal(299792458)

    if (x.lt(a)) return `${format(x, places)} Meters/sec.`
    if (x.lt(b)) return `Mach ${format(x.div(a), places)}`
    else return `${format(x.div(b))}c`
}