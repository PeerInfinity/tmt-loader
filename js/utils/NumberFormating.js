function slog(n){ // slog10(x), .slog is bugged >=eee9e15
	n = new Decimal(n)
	return Decimal.add(n.layer,new Decimal(n.mag).slog())
}

function slogadd(n,add){
	n = new Decimal(n)
	return Decimal.tetrate(10,slog(n).add(add))
}
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

function distShort(s) {
	s = new Decimal(s)
	let scale1 = [1.616255e-35,1e-24,1e-21,1e-18,1e-15,1e-12,1e-9,1e-6,0.001,0.01,1,1e3,1e6,1e9,1.495978707e11,9.46e15,8.8e26]
	let scale2 = [" PL"," ym"," zm"," am"," fm"
	," pm"," nm"," um"," mm"," cm"," m"," km"
	," Mm", " Gm", " AU", " ly", " uni"]
	let id = 0;
		if (s.gte(scale1[scale1.length - 1])) id = scale1.length - 1;
		else {
			while (s.gte(scale1[id])) id++;
			if (id > 0) id--;
		}
	return format(s.div(scale1[id])) + scale2[id]
}

function verseTime(years) {
	s = slog(new Decimal(years)).sub(Decimal.log10(9))
	let verse1 = [2,3,4,5]
	let verse2 = ["multi","meta","xeno","hyper"]
	let id = 0;
		if (s.gte(verse1[verse1.length - 1])) id = verse1.length - 1;
		else {
			while (s.gte(verse1[id])) id++;
			if (id > 0) id--;
		}
	let mag = slogadd(years,-verse1[id]+1).div(1e9)
	return [mag,verse2[id]]
}
function formatTimeLong1(s) {
	s = new Decimal(s)
	let years = s.div(31556952)
	let mlt = verseTime(years)
	let arv1 = [1,1e15,1e30,1e45,1e60,1e75,1e90,1e105]
	let arv2 = ["","mega","giga","tera","peta","exa","zetta","yotta"]
	let id = 0;
		if (mlt[0].gte(arv1[arv1.length - 1])) id = arv1.length - 1;
		else {
			while (mlt[0].gte(arv1[id])) id++;
			if (id > 0) id--;
		}
	let verse = arv2[id]+(arv2[id]!=""?"-":"")+mlt[1]
	if (mlt[1]=="multi") {
		verse = arv2[id]
		if (arv2[id]=="") verse = "multi"}
	if (years.gte("6pt9")) return format(slog(years).pow10().div(9e6)) + " omniverse ages"
	if (years.gte("eee56") && years.lt("eee69")) return format(years.log10().log10().div(1e56)) + " new big bangs"
	if (years.gte("ee120") && years.lt("eee9")) return format(years.log10().div(1e120)) + " big rips"
	if (years.gte("ee9")) return format(mlt[0].div(arv1[id])) + " " + verse +"verse ages"
	if (years.gte(1e100)) return format(years.div(1e100)) + " black hole eras"
	if (years.gte(1e40)) return format(years.div(1e40)) + " degenerate eras"
	if (years.gte(1e9)) return format(years.div(1e9)) + " aeons"
	if (years.gte(1e3)) return format(years.div(1e3)) + " millenia"
	if (years.gte(1)) return format(years) + " years"
  if (s.gte(86400)) return format(s.div(86400)) + " days"
	if (s.gte(3600)) return format(s.div(3600)) + " hours"
	if (s.gte(60)) return format(s.div(60)) + " minutes"
	if (s.gte(1)) return format(s) + " seconds"
	if (s.gte(0.001)) return format(s.mul(1e3)) + " milliseconds"
	if (s.gte(1e-6)) return format(s.mul(1e6)) + " microseconds"
	if (s.gte(1e-9)) return format(s.mul(1e9)) + " nanoseconds"
	if (s.gte(1e-12)) return format(s.mul(1e12)) + " picoseconds"
	if (s.gte(1e-15)) return format(s.mul(1e15)) + " femtoseconds"
	if (s.gte(1e-18)) return format(s.mul(1e18)) + " attoseconds"
	if (s.gte(1e-21)) return format(s.mul(1e21)) + " zeptoseconds"
	if (s.gte(1e-24)) return format(s.mul(1e24)) + " yoctoseconds"
	return format(s.mul(1.855e43)) + " Planck Times"
}

function formatMass(g) {
    if (g < 1e-27) return format(g*1e30) + " qg"
    else if (g < 1e-24) return format(g*1e27) + " rg"
    else if (g < 1e-21) return format(g*1e24) + " yg"
    else if (g < 1e-18) return format(g*1e21) + " zg"
    else if (g < 1e-15) return format(g*1e18) + " ag"
    else if (g < 1e-12) return format(g*1e15) + " fg"
    else if (g < 1e-9) return format(g*1e12) + " pg"
    else if (g < 1e-6) return format(g*1e9) + " ng"
    else if (g < 1e-3) return format(g*1e6) + " mcg"
    else if (g < 1) return format(g*1e3) + " mg"
    else if (g < 1e3) return format(g) + " g"
    else if (g < 1e6) return format(g/1e3) + " kg"
    else if (g < 1.619e20) return format(g/1e6) + " tonnes"
    else if (g < 5.972e27) return format(g/1.619e20) + " MME"
    else if (g < 1.989e33) return format(g/5.972e27) + " M⊕"
    else if (g < 2.9835e45) return format(g/1.989e33) + " M☉"
    else if (g < 1.5e56) return format(g/2.9835e45) + " MMWG"
    else if (g < 1.5e71) return format(g.div(1.5e56)) + " uni"
    else if (g < 1.5e86) return format(g.div(1.5e71)) + " mlt"
    else if (g < 1.5e101) return format(g.div(1.5e86)) + " mgv"
    else if (g < 1.5e116) return format(g.div(1.5e101)) + " giv"
    else if (g < 1.5e131) return format(g.div(1.5e116)) + " tev"
    else if (g < 1.5e146) return format(g.div(1.5e131)) + " pev"
    else if (g < 1.5e161) return format(g.div(1.5e146)) + " exv"
    else if (g < 1.5e176) return format(g.div(1.5e161)) + " zev"
    else if (g < 1.5e191) return format(g.div(1.5e176)) + " yov"
    else if (g < 1.5e206) return format(g.div(1.5e191)) + " arv^10"
    else if (g < 1.5e221) return format(g.div(1.5e206)) + " arv^11"
    else if (g < 1.5e236) return format(g.div(1.5e221)) + " arv^12"
    else if (g < 1.5e251) return format(g.div(1.5e236)) + " arv^13"
    else if (g < 1.5e266) return format(g.div(1.5e251)) + " arv^14"
    else return format(g.div(1.5e266)) + " arv^15"
}
function formatSciEng(decimal, precision) {
	decimal = new Decimal(decimal)
	if (isNaN(decimal.sign)||isNaN(decimal.layer)||isNaN(decimal.mag)) {
		player.hasNaN = true;
		console.log(decimal)
		Decimal(0)
		for (i in player){
			if (player[i] == undefined) continue
			if (player[i].points != undefined) {
				if (isNaN(player[i].points.mag)) console.log(i + "'s points are NaN")
			}
		}
		
		return "NaN"
	}
	if (player.notation == 'Mixed Scientific' || player.notation == 'Mixed Engineering'){
		if (decimal.layer < 1 || (Math.abs(decimal.mag) < 63 && decimal.layer == 1)) return standard(decimal,precision)
	}
	if (decimal.sign < 0) return "-"+format(decimal.neg(), precision)
	if (decimal.mag<0) {
		if (decimal.layer > 3 || (decimal.mag < -1e10 && decimal.layer == 3)) return "1/" + format(decimal.recip(), precision)
		else exponentialFormat(decimal, precision)
	}
	if (decimal.mag == Number.POSITIVE_INFINITY) return "Infinity"
	if (decimal.layer > 3 || (decimal.mag > 1e10 && decimal.layer == 3)) {
		var slog = decimal.slog()
		if (slog.gte(1e9)) return "F" + formatWhole(slog.floor())
		if (slog.gte(100)) return Decimal.pow(10, slog.sub(slog.floor())).toStringWithDecimalPlaces(3) + "F" + commaFormat(slog.floor(), 0)
		else return Decimal.pow(10, slog.sub(slog.floor())).toStringWithDecimalPlaces(4) + "F" + commaFormat(slog.floor(), 0)
	} else if (decimal.layer > 2 || (Math.abs(decimal.mag) > 308 && decimal.layer == 2)) {
		return "e" + format(decimal.log10(), precision)
	} else if (decimal.layer > 1 || (Math.abs(decimal.mag) >= 1e12 && decimal.layer == 1)) {
		return "e" + format(decimal.log10(), 4)
	} else if (decimal.layer > 0 || decimal.mag >= 1e9) {
		return exponentialFormat(decimal, precision)
	} else if (decimal.mag >= 1000) {
		return commaFormat(decimal, 0)
	} else if (decimal.mag>=0.001) {
		return regularFormat(decimal, precision)
	} else if (decimal.sign!=0) {
		return exponentialFormat(decimal, precision)
	} else return regularFormat(decimal, precision)
}


function formatTimeLong(s) {
	s = new Decimal(s)
	let years = s.div(31556952)
	if (years.gte(1e100)) return format(years.div(1e100)) + " black hole eras"
	if (years.gte(1e40)) return format(years.div(1e40)) + " degenerate eras"
	if (years.gte(1e9)) return format(years.div(1e9)) + " aeons"
	if (years.gte(1e3)) return format(years.div(1e3)) + " millenia"
	if (years.gte(1)) return format(years) + " years"
	if (s.gte(86400)) return format(s.div(86400)) + " days"
	if (s.gte(3600)) return format(s.div(3600)) + " hours"
	if (s.gte(60)) return format(s.div(60)) + " minutes"
	if (s.gte(1)) return format(s) + " seconds"
	if (s.gte(0.001)) return format(s.mul(1e3)) + " milliseconds"
	if (s.gte(1e-6)) return format(s.mul(1e6)) + " microseconds"
	if (s.gte(1e-9)) return format(s.mul(1e9)) + " nanoseconds"
	if (s.gte(1e-12)) return format(s.mul(1e12)) + " picoseconds"
	if (s.gte(1e-15)) return format(s.mul(1e15)) + " femtoseconds"
	if (s.gte(1e-18)) return format(s.mul(1e18)) + " attoseconds"
	if (s.gte(1e-21)) return format(s.mul(1e21)) + " zeptoseconds"
	if (s.gte(1e-24)) return format(s.mul(1e24)) + " yoctoseconds"
	return format(s.mul(1.855e43)) + " Planck Times"
}

function formatSize(m) {
	m = new Decimal(m)
	let scale1 = [1.616255e-35,1e-24,1e-21,1e-18,1e-15,1e-12,1e-9,1e-6,0.001,0.01,1,1e3,1e6,1e9,1.495978707e11,9.46e15,8.8e26,1.34342e32,3.32072e33,6.44276e37,8.23084e40,4.80605e44,4.16272e53,1.16367e57,9.35666e57,1.32450e59,8.27814e60,4.16272e62,5.10879e65,1e200]
	let scale2 = [" Planck Lengths"," yoctometers"," zeptometers"," attometers"," femtometers"
	," picometers"," nanometers"," micrometers"," millimeters"," centimeters"," meters"," kilometers"
	," megameters", " gigameters", " astronomical units", " light-years", " observable universes"
  , " multiverses", " kiloverses", " megaverses", " gigaverses", " teraverses", " petaverses", " exaverses", " zettaverses", " yottaverses"
  , "xennaverses", "wekaverses", " vendekaverses", " omniverses"]
	let id = 0;
		if (m.gte(scale1[scale1.length - 1])) id = scale1.length - 1;
		else {
			while (m.gte(scale1[id])) id++;
			if (id > 0) id--;
		}
  
	return format(m.div(scale1[id])) + scale2[id]
}

function formatComp(s) { 
	s = new Decimal(s)
	let scale1 = [5.23598e-30,9e-17,6.2e-11,3.555e-6,4.73176e-4,0.062,2.5e3,4.1887902e12,1.08e21,1.53e24,1.41e27,1.4017341e37,6.7742e60,4e80,"e10310"]
	let scale2 = [" pre-Blueprint Particles."," red blood cells.", " grains of sand.", " teaspoons.", " infectant bottles.", " infected people."," Olympic-sized swimming pools."," Chicxulub asteroids."," Earths."
	," Jupiters."," Suns."," Stephenson 2-18s."," Milky Ways."," observable universes.", " existence-verses."]
	let id = 0;
		if (s.gte(scale1[scale1.length - 1])) id = scale1.length - 1;
		else {
			while (s.gte(scale1[id])) id++;
			if (id > 0) id--;
		}
	return format(s.div(scale1[id])) + scale2[id]
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
