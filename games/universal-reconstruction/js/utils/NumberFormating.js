
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
    if (decimal.mag == Number.POSITIVE_INFINITY) return "Infinite"
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

function formatSingleTime(s) {
    if (s < 60) return `${format(s)}s`
    else if (s < 3600) return `${format(s/60)}m`
    else if (s < 86400) return `${format(s/3600)}h`
    else if (s < 31536000) return `${format(s/86400)}d`
    else return `${format(s/31536000)}y`
}

function toPlaces(x, precision, maxAccepted) {
    x = new Decimal(x)
    let result = x.toStringWithDecimalPlaces(precision)
    if (new Decimal(result).gte(maxAccepted)) {
        result = new Decimal(maxAccepted - Math.pow(0.1, precision)).toStringWithDecimalPlaces(precision)
    }
    return result
}

function formatLength(l) {
    l = new Decimal(l)
    if (l.lt(6.187e10)) return `${format(l)}ℓ<sub>P</sub>`
    
    l = l.dividedBy(6.187e10)
    if (l.lt(1e3)) return `${format(l)}ym`
    else if (l.lt(1e6)) return `${format(l.dividedBy(1e3))}zm`
    else if (l.lt(1e9)) return `${format(l.dividedBy(1e6))}am`
    else if (l.lt(1e12)) return `${format(l.dividedBy(1e9))}fm`
    else if (l.lt(1e15)) return `${format(l.dividedBy(1e12))}pm`
    else if (l.lt(1e18)) return `${format(l.dividedBy(1e15))}nm`
    else if (l.lt(1e21)) return `${format(l.dividedBy(1e18))}μm`
    else if (l.lt(1e24)) return `${format(l.dividedBy(1e21))}mm`
    else if (l.lt(1e27)) return `${format(l.dividedBy(1e24))}m`
    else if (l.lt(1e30)) return `${format(l.dividedBy(1e27))}km`
    else if (l.lt(1e33)) return `${format(l.dividedBy(1e30))}Mm`
    else if (l.lt(1e36)) return `${format(l.dividedBy(1e33))}Gm`
    else if (l.lt(1e39)) return `${format(l.dividedBy(1e36))}Tm`
    else if (l.lt(1e42)) return `${format(l.dividedBy(1e39))}Pm`
    else if (l.lt(9.461e42)) return `${format(l.dividedBy(1e42))}ly`
    else if (l.lt(3.086e43)) return `${format(l.dividedBy(9.461e42))}pc`
    else if (l.lt(3.086e46)) return `${format(l.dividedBy(3.086e43))}kpc`
    else if (l.lt(3.086e49)) return `${format(l.dividedBy(3.086e46))}Mpc`
    return `${format(l.dividedBy(3.086e49))}Gpc`
}

function formatRoman(x) {
    x = new Decimal(x).trunc().toNumber()
    if (x > 4000) return format(x)
    else if (x < 1) return "Nulla"
    
    let out = []
    let nums = [1,4,5,9,10,40,50,90,100,400,500,900,1000]
    let syms = ['I', 'IV', 'V', 'IX', 'X', 'XL', 'L', 'XC', 'C', 'CD', 'D', 'CM', 'M']
    let i = 12
    while (x > 0) {
        let div = Math.floor(x / nums[i])
        x = x % nums[i]
        while (div--)
            out.push(syms[i])
        i--
    }
    
    return out.join('')
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

function formatShort(x) {
    return x.gte(1e4) ? exponentialFormat(x, 0) : format(x, 0)
}