
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

// ============================================================================
// Eternal Notations support — credit: MathCookie17
// Library: https://github.com/MathCookie17/Eternal-Notations (MIT)
// Built on break_eternity.js, 144 presets + 65 notations, up to 10^^(10^308)
// We keep TMT's original format as fallback ("tmt" notation) and add Eternal.
// ============================================================================
let eternalNotationsEnabled = false
let currentEternalNotation = null
let currentNotationId = "tmt" // tmt = original, others are Eternal preset names

// Map our option ids to EternalNotations presets
function getEternalPreset(id) {
    if (typeof EternalNotations === "undefined") return null
    const presets = EternalNotations.Presets
    const htmlPresets = EternalNotations.HTMLPresets
    switch(id) {
        case "eternalADGreekLetters": return presets.ADGreekLetters || htmlPresets.ADGreekLetters
        case "eternalADLongScale": return presets.ADLongScale || htmlPresets.ADLongScale
        case "eternalADMixedScientific": return presets.ADMixedScientific || htmlPresets.ADMixedScientific
        case "eternalADMixedScientificLongScale": return presets.ADMixedScientificLongScale || htmlPresets.ADMixedScientificLongScale
        case "eternalADMyriad": return presets.ADMyriad || htmlPresets.ADMyriad
        case "eternalADRoman": return presets.ADRoman || htmlPresets.ADRoman
        case "eternalADStandard": return presets.ADStandard || htmlPresets.ADStandard
        case "eternalAarexLongScale": return presets.AarexLongScale || htmlPresets.AarexLongScale
        case "eternalAarexMixedScientific": return presets.AarexMixedScientific || htmlPresets.AarexMixedScientific
        case "eternalAarexMixedScientificLongScale": return presets.AarexMixedScientificLongScale || htmlPresets.AarexMixedScientificLongScale
        case "eternalAarexMyriad": return presets.AarexMyriad || htmlPresets.AarexMyriad
        case "eternalAarexStandard": return presets.AarexStandard || htmlPresets.AarexStandard
        case "eternalAlphabet": return presets.Alphabet || htmlPresets.Alphabet
        case "eternalAlphabetDigits": return presets.AlphabetDigits || htmlPresets.AlphabetDigits
        case "eternalAlphaquint": return presets.Alphaquint || htmlPresets.Alphaquint
        case "eternalAlternateBase": return typeof presets.AlternateBase === "function" ? presets.AlternateBase(10) : (presets.AlternateBase || htmlPresets.AlternateBase)
        case "eternalBalancedTernary": return presets.BalancedTernary || htmlPresets.BalancedTernary
        case "eternalBaseE": return typeof presets.BaseE === "function" ? presets.BaseE(10) : (presets.BaseE || htmlPresets.BaseE)
        case "eternalBasePhi": return typeof presets.BasePhi === "function" ? presets.BasePhi(10) : (presets.BasePhi || htmlPresets.BasePhi)
        case "eternalBasePi": return typeof presets.BasePi === "function" ? presets.BasePi(10) : (presets.BasePi || htmlPresets.BasePi)
        case "eternalBaseThreeHalves": return typeof presets.BaseThreeHalves === "function" ? presets.BaseThreeHalves(10) : (presets.BaseThreeHalves || htmlPresets.BaseThreeHalves)
        case "eternalBijectiveDecimal": return presets.BijectiveDecimal || htmlPresets.BijectiveDecimal
        case "eternalBinary": return presets.Binary || htmlPresets.Binary
        case "eternalBinaryIL": return presets.BinaryIL || htmlPresets.BinaryIL
        case "eternalBinarySI": return presets.BinarySI || htmlPresets.BinarySI
        case "eternalBinarySIWritten": return presets.BinarySIWritten || htmlPresets.BinarySIWritten
        case "eternalBlind": return presets.Blind || htmlPresets.Blind
        case "eternalBrackets": return presets.Brackets || htmlPresets.Brackets
        case "eternalColoredDominoes": return typeof htmlPresets.ColoredDominoes === "function" ? htmlPresets.ColoredDominoes(6) : htmlPresets.ColoredDominoes
        case "eternalCombinedD": return presets.CombinedD || htmlPresets.CombinedD
        case "eternalCookieFonsterExtendedSI": return presets.CookieFonsterExtendedSI || htmlPresets.CookieFonsterExtendedSI
        case "eternalCubeRoot": return presets.CubeRoot || htmlPresets.CubeRoot
        case "eternalDefault": return presets.Default || htmlPresets.Default
        case "eternalDominoes": return presets.Dominoes || htmlPresets.Dominoes
        case "eternalDots": return presets.Dots || htmlPresets.Dots
        case "eternalDoubleBinaryNames": return presets.DoubleBinaryNames || htmlPresets.DoubleBinaryNames
        case "eternalDoubleBinaryPrefixes": return presets.DoubleBinaryPrefixes || htmlPresets.DoubleBinaryPrefixes
        case "eternalDoubleFactorials": return presets.DoubleFactorials || htmlPresets.DoubleFactorials
        case "eternalDoubleLogarithm": return presets.DoubleLogarithm || htmlPresets.DoubleLogarithm
        case "eternalDozenal23": return presets.Dozenal23 || htmlPresets.Dozenal23
        case "eternalDozenalXE": return presets.DozenalXE || htmlPresets.DozenalXE
        case "eternalDuodecimal": return presets.Duodecimal || htmlPresets.Duodecimal
        case "eternalElementLetters": return presets.ElementLetters || htmlPresets.ElementLetters
        case "eternalEmoji": return presets.Emoji || htmlPresets.Emoji
        case "eternalEmojiAlphabet": return presets.EmojiAlphabet || htmlPresets.EmojiAlphabet
        case "eternalEngineering": return presets.Engineering || htmlPresets.Engineering
        case "eternalEternity": return presets.Eternity || htmlPresets.Eternity
        case "eternalExponentTower": return presets.ExponentTower || htmlPresets.ExponentTower
        case "eternalExponentTowerK": return presets.ExponentTowerK || htmlPresets.ExponentTowerK
        case "eternalFactoradic": return presets.Factoradic || htmlPresets.Factoradic
        case "eternalFactorial": return presets.Factorial || htmlPresets.Factorial
        case "eternalFactorialAmount": return presets.FactorialAmount || htmlPresets.FactorialAmount
        case "eternalFactorialHyperscientific": return presets.FactorialHyperscientific || htmlPresets.FactorialHyperscientific
        case "eternalFactorialScientific": return presets.FactorialScientific || htmlPresets.FactorialScientific
        case "eternalFastGrowingHierarchy": return presets.FastGrowingHierarchy || htmlPresets.FastGrowingHierarchy
        case "eternalFillingFractions": return presets.FillingFractions || htmlPresets.FillingFractions
        case "eternalFours": return presets.Fours || htmlPresets.Fours
        case "eternalGreekAlphabet": return presets.GreekAlphabet || htmlPresets.GreekAlphabet
        case "eternalGreekLetters": return presets.GreekLetters || htmlPresets.GreekLetters
        case "eternalGrid": return typeof presets.Grid === "function" ? presets.Grid(10) : (presets.Grid || htmlPresets.Grid)
        case "eternalHardyHierarchy": return presets.HardyHierarchy || htmlPresets.HardyHierarchy
        case "eternalHearts": return presets.Hearts || htmlPresets.Hearts
        case "eternalHexadecimal": return presets.Hexadecimal || htmlPresets.Hexadecimal
        case "eternalHyperE": return presets.HyperE || htmlPresets.HyperE
        case "eternalHyperSI": return presets.HyperSI || htmlPresets.HyperSI
        case "eternalHyperSIWritten": return presets.HyperSIWritten || htmlPresets.HyperSIWritten
        case "eternalHyperscientific": return presets.Hyperscientific || htmlPresets.Hyperscientific
        case "eternalHypersplit": return presets.Hypersplit || htmlPresets.Hypersplit
        case "eternalHypersplitBase2": return presets.HypersplitBase2 || htmlPresets.HypersplitBase2
        case "eternalHypersplitBase3": return presets.HypersplitBase3 || htmlPresets.HypersplitBase3
        case "eternalIncreasingOperator": return presets.IncreasingOperator || htmlPresets.IncreasingOperator
        case "eternalIncreasingOperatorBase2": return presets.IncreasingOperatorBase2 || htmlPresets.IncreasingOperatorBase2
        case "eternalIncreasingOperatorBase3": return presets.IncreasingOperatorBase3 || htmlPresets.IncreasingOperatorBase3
        case "eternalIncreasingRoot": return typeof presets.IncreasingRoot === "function" ? presets.IncreasingRoot(10) : (presets.IncreasingRoot || htmlPresets.IncreasingRoot)
        case "eternalIncreasingSuperRoot": return typeof presets.IncreasingSuperRoot === "function" ? presets.IncreasingSuperRoot(10) : (presets.IncreasingSuperRoot || htmlPresets.IncreasingSuperRoot)
        case "eternalInfinity": return presets.Infinity || htmlPresets.Infinity
        case "eternalLetterDigits": return presets.LetterDigits || htmlPresets.LetterDigits
        case "eternalLetters": return presets.Letters || htmlPresets.Letters
        case "eternalLogarithm": return presets.Logarithm || htmlPresets.Logarithm
        case "eternalLogarithmBase": return typeof presets.LogarithmBase === "function" ? presets.LogarithmBase(10) : (presets.LogarithmBase || htmlPresets.LogarithmBase)
        case "eternalLongScale": return presets.LongScale || htmlPresets.LongScale
        case "eternalLooseFraction": return presets.LooseFraction || htmlPresets.LooseFraction
        case "eternalLooseMixedNumber": return presets.LooseMixedNumber || htmlPresets.LooseMixedNumber
        case "eternalMediumFraction": return presets.MediumFraction || htmlPresets.MediumFraction
        case "eternalMediumMixedNumber": return presets.MediumMixedNumber || htmlPresets.MediumMixedNumber
        case "eternalMixedSI": return presets.MixedSI || htmlPresets.MixedSI
        case "eternalMixedScientific": return presets.MixedScientific || htmlPresets.MixedScientific
        case "eternalMixedScientificLongScale": return presets.MixedScientificLongScale || htmlPresets.MixedScientificLongScale
        case "eternalMyriad": return presets.Myriad || htmlPresets.Myriad
        case "eternalNaturalLogarithm": return presets.NaturalLogarithm || htmlPresets.NaturalLogarithm
        case "eternalNaturalPentaLogarithm": return presets.NaturalPentaLogarithm || htmlPresets.NaturalPentaLogarithm
        case "eternalNaturalSuperLogarithm": return presets.NaturalSuperLogarithm || htmlPresets.NaturalSuperLogarithm
        // NumericDominoes is a factory: (highest) => LetterDigitsNotation. Highest = 6 gives the
        // standard "double six" set of 28 tiles, same argument Colored Dominoes uses below.
        case "eternalNumericDominoes": return typeof presets.NumericDominoes === "function" ? presets.NumericDominoes(6) : (presets.NumericDominoes || htmlPresets.NumericDominoes)
        case "eternalOctal": return presets.Octal || htmlPresets.Octal
        case "eternalOmega": return presets.Omega || htmlPresets.Omega
        case "eternalOmegaLayerNumber": return presets.OmegaLayerNumber || htmlPresets.OmegaLayerNumber
        case "eternalOmegaLayers": return presets.OmegaLayers || htmlPresets.OmegaLayers
        case "eternalOmegaLayersRamped": return presets.OmegaLayersRamped || htmlPresets.OmegaLayersRamped
        case "eternalOmegaMetaZero": return presets.OmegaMetaZero || htmlPresets.OmegaMetaZero
        case "eternalOmegaMetaZeroAlphaAmount": return presets.OmegaMetaZeroAlphaAmount || htmlPresets.OmegaMetaZeroAlphaAmount
        case "eternalOmegaShort": return presets.OmegaShort || htmlPresets.OmegaShort
        case "eternalParentheses": return presets.Parentheses || htmlPresets.Parentheses
        case "eternalPentaLogarithm": return presets.PentaLogarithm || htmlPresets.PentaLogarithm
        case "eternalPentaLogarithmBase": return typeof presets.PentaLogarithmBase === "function" ? presets.PentaLogarithmBase(10) : (presets.PentaLogarithmBase || htmlPresets.PentaLogarithmBase)
        case "eternalPentaRoot": return typeof presets.PentaRoot === "function" ? presets.PentaRoot(10) : (presets.PentaRoot || htmlPresets.PentaRoot)
        case "eternalPentaScientific": return presets.PentaScientific || htmlPresets.PentaScientific
        case "eternalPentaSquareRoot": return typeof presets.PentaSquareRoot === "function" ? presets.PentaSquareRoot(10) : (presets.PentaSquareRoot || htmlPresets.PentaSquareRoot)
        case "eternalPolynomial": return typeof presets.Polynomial === "function" ? presets.Polynomial(10) : (presets.Polynomial || htmlPresets.Polynomial)
        case "eternalPowerTower": return presets.PowerTower || htmlPresets.PowerTower
        case "eternalPowersOfOne": return presets.PowersOfOne || htmlPresets.PowersOfOne
        case "eternalPreciseFraction": return presets.PreciseFraction || htmlPresets.PreciseFraction
        case "eternalPreciseMixedNumber": return presets.PreciseMixedNumber || htmlPresets.PreciseMixedNumber
        case "eternalPrime": return presets.Prime || htmlPresets.Prime
        case "eternalPsiDash": return presets.PsiDash || htmlPresets.PsiDash
        case "eternalPsiDashBinary": return presets.PsiDashBinary || htmlPresets.PsiDashBinary
        case "eternalPsiLetters": return presets.PsiLetters || htmlPresets.PsiLetters
        case "eternalPsiLettersBinary": return presets.PsiLettersBinary || htmlPresets.PsiLettersBinary
        case "eternalQuaternary": return presets.Quaternary || htmlPresets.Quaternary
        case "eternalRationalFunction": return typeof presets.RationalFunction === "function" ? presets.RationalFunction(10) : (presets.RationalFunction || htmlPresets.RationalFunction)
        case "eternalRomanNumerals": return presets.RomanNumerals || htmlPresets.RomanNumerals
        case "eternalRoot": return typeof presets.Root === "function" ? presets.Root(10) : (presets.Root || htmlPresets.Root)
        case "eternalSI": return presets.SI || htmlPresets.SI
        case "eternalSIWritten": return presets.SIWritten || htmlPresets.SIWritten
        case "eternalSandcastleBuilder": return presets.SandcastleBuilder || htmlPresets.SandcastleBuilder
        case "eternalSandcastleBuilderWritten": return presets.SandcastleBuilderWritten || htmlPresets.SandcastleBuilderWritten
        case "eternalScientific": return presets.Scientific || htmlPresets.Scientific
        case "eternalSeptecoman": return presets.Septecoman || htmlPresets.Septecoman
        case "eternalSeximal": return presets.Seximal || htmlPresets.Seximal
        // SimplifiedWritten is a factory: (base) => HypersplitNotation. Base 10 is the preset's
        // "Simplified Written" name case (any other base gets "(Base X)" appended by the library).
        case "eternalSimplifiedWritten": return typeof presets.SimplifiedWritten === "function" ? presets.SimplifiedWritten(10) : (presets.SimplifiedWritten || htmlPresets.SimplifiedWritten)
        case "eternalSquare": return presets.Square || htmlPresets.Square
        case "eternalSquareRoot": return presets.SquareRoot || htmlPresets.SquareRoot
        case "eternalStandard": return presets.Standard || htmlPresets.Standard
        case "eternalSuperLogarithm": return presets.SuperLogarithm || htmlPresets.SuperLogarithm
        case "eternalSuperLogarithmBase": return typeof presets.SuperLogarithmBase === "function" ? presets.SuperLogarithmBase(10) : (presets.SuperLogarithmBase || htmlPresets.SuperLogarithmBase)
        case "eternalSuperRoot": return typeof presets.SuperRoot === "function" ? presets.SuperRoot(10) : (presets.SuperRoot || htmlPresets.SuperRoot)
        case "eternalSuperSquareRoot": return presets.SuperSquareRoot || htmlPresets.SuperSquareRoot
        case "eternalSuperSquareScientific": return presets.SuperSquareScientific || htmlPresets.SuperSquareScientific
        case "eternalTernary": return presets.Ternary || htmlPresets.Ternary
        case "eternalTetrationFloat": return presets.TetrationFloat || htmlPresets.TetrationFloat
        case "eternalTriangular": return presets.Triangular || htmlPresets.Triangular
        case "eternalTripentated": return typeof presets.Tripentated === "function" ? presets.Tripentated(10) : (presets.Tripentated || htmlPresets.Tripentated)
        case "eternalTritetrated": return typeof presets.Tritetrated === "function" ? presets.Tritetrated(10) : (presets.Tritetrated || htmlPresets.Tritetrated)
        case "eternalTritetratedProduct": return presets.TritetratedProduct || htmlPresets.TritetratedProduct
        case "eternalWeakHyperscientific": return presets.WeakHyperscientific || htmlPresets.WeakHyperscientific
        case "eternalXYZ": return presets.XYZ || htmlPresets.XYZ
        default: return null
    }
}

function setNotation(id) {
    currentNotationId = id
    if (id === "tmt") {
        eternalNotationsEnabled = false
        currentEternalNotation = null
    } else {
        let preset = getEternalPreset(id)
        // A usable preset must be a Notation instance (some library presets are factories that need
        // arguments - if one slips through un-called it has no .format and would throw every frame).
        if (preset && typeof preset.format === "function") {
            eternalNotationsEnabled = true
            currentEternalNotation = preset
        } else {
            // Fallback if EternalNotations not loaded, preset not found, or preset isn't a Notation
            eternalNotationsEnabled = false
            currentEternalNotation = null
            console.warn("[Eternal Notations] Preset not usable (not found, library not loaded, or not a Notation), falling back to TMT:", id, preset)
        }
    }
    // Save to options if available
    if (typeof options !== "undefined") options.notation = id
    if (typeof player !== "undefined" && player !== null) save()
}

// Display names for every notation id (used by the Options dropdown and the cycle button)
const NOTATION_NAMES = {
    "tmt": "TMT (default)",
    "eternalADGreekLetters": "ADGreek Letters",
    "eternalADLongScale": "ADLong Scale",
    "eternalADMixedScientific": "ADMixed Scientific",
    "eternalADMixedScientificLongScale": "ADMixed Scientific Long Scale",
    "eternalADMyriad": "ADMyriad",
    "eternalADRoman": "ADRoman",
    "eternalADStandard": "AD Standard",
    "eternalAarexLongScale": "Aarex Long Scale",
    "eternalAarexMixedScientific": "Aarex Mixed Scientific",
    "eternalAarexMixedScientificLongScale": "Aarex Mixed Scientific Long Scale",
    "eternalAarexMyriad": "Aarex Myriad",
    "eternalAarexStandard": "Aarex Standard",
    "eternalAlphabet": "Alphabet",
    "eternalAlphabetDigits": "Alphabet Digits",
    "eternalAlphaquint": "Alphaquint",
    "eternalAlternateBase": "Alternate Base",
    "eternalBalancedTernary": "Balanced Ternary",
    "eternalBaseE": "Base E",
    "eternalBasePhi": "Base Phi",
    "eternalBasePi": "Base Pi",
    "eternalBaseThreeHalves": "Base Three Halves",
    "eternalBijectiveDecimal": "Bijective Decimal",
    "eternalBinary": "Binary",
    "eternalBinaryIL": "Binary IL",
    "eternalBinarySI": "Binary SI",
    "eternalBinarySIWritten": "Binary SIWritten",
    "eternalBlind": "Blind",
    "eternalBrackets": "Brackets",
    "eternalColoredDominoes": "Colored Dominoes",
    "eternalCombinedD": "Combined D",
    "eternalCookieFonsterExtendedSI": "Cookie Fonster Extended SI",
    "eternalCubeRoot": "Cube Root",
    "eternalDefault": "Default",
    "eternalDominoes": "Dominoes",
    "eternalDots": "Dots",
    "eternalDoubleBinaryNames": "Double Binary Names",
    "eternalDoubleBinaryPrefixes": "Double Binary Prefixes",
    "eternalDoubleFactorials": "Double Factorials",
    "eternalDoubleLogarithm": "Double Logarithm",
    "eternalDozenal23": "Dozenal23",
    "eternalDozenalXE": "Dozenal XE",
    "eternalDuodecimal": "Duodecimal",
    "eternalElementLetters": "Element Letters",
    "eternalEmoji": "Emoji",
    "eternalEmojiAlphabet": "Emoji Alphabet",
    "eternalEngineering": "Engineering",
    "eternalEternity": "Eternity",
    "eternalExponentTower": "Exponent Tower",
    "eternalExponentTowerK": "Exponent Tower K",
    "eternalFactoradic": "Factoradic",
    "eternalFactorial": "Factorial",
    "eternalFactorialAmount": "Factorial Amount",
    "eternalFactorialHyperscientific": "Factorial Hyperscientific",
    "eternalFactorialScientific": "Factorial Scientific",
    "eternalFastGrowingHierarchy": "Fast Growing Hierarchy",
    "eternalFillingFractions": "Filling Fractions",
    "eternalFours": "Fours",
    "eternalGreekAlphabet": "Greek Alphabet",
    "eternalGreekLetters": "Greek Letters",
    "eternalGrid": "Grid",
    "eternalHardyHierarchy": "Hardy Hierarchy",
    "eternalHearts": "Hearts",
    "eternalHexadecimal": "Hexadecimal",
    "eternalHyperE": "Hyper E",
    "eternalHyperSI": "Hyper SI",
    "eternalHyperSIWritten": "Hyper SIWritten",
    "eternalHyperscientific": "Hyperscientific",
    "eternalHypersplit": "Hypersplit",
    "eternalHypersplitBase2": "Hypersplit Base2",
    "eternalHypersplitBase3": "Hypersplit Base3",
    "eternalIncreasingOperator": "Increasing Operator",
    "eternalIncreasingOperatorBase2": "Increasing Operator Base2",
    "eternalIncreasingOperatorBase3": "Increasing Operator Base3",
    "eternalIncreasingRoot": "Increasing Root",
    "eternalIncreasingSuperRoot": "Increasing Super Root",
    "eternalInfinity": "Infinity",
    "eternalLetterDigits": "Letter Digits",
    "eternalLetters": "Letters",
    "eternalLogarithm": "Logarithm",
    "eternalLogarithmBase": "Logarithm Base",
    "eternalLongScale": "Long Scale",
    "eternalLooseFraction": "Loose Fraction",
    "eternalLooseMixedNumber": "Loose Mixed Number",
    "eternalMediumFraction": "Medium Fraction",
    "eternalMediumMixedNumber": "Medium Mixed Number",
    "eternalMixedSI": "Mixed SI",
    "eternalMixedScientific": "Mixed Scientific",
    "eternalMixedScientificLongScale": "Mixed Scientific Long Scale",
    "eternalMyriad": "Myriad",
    "eternalNaturalLogarithm": "Natural Logarithm",
    "eternalNaturalPentaLogarithm": "Natural Penta Logarithm",
    "eternalNaturalSuperLogarithm": "Natural Super Logarithm",
    "eternalNumericDominoes": "Numeric Dominoes",
    "eternalOctal": "Octal",
    "eternalOmega": "Omega",
    "eternalOmegaLayerNumber": "Omega Layer Number",
    "eternalOmegaLayers": "Omega Layers",
    "eternalOmegaLayersRamped": "Omega Layers Ramped",
    "eternalOmegaMetaZero": "Omega Meta Zero",
    "eternalOmegaMetaZeroAlphaAmount": "Omega Meta Zero Alpha Amount",
    "eternalOmegaShort": "Omega Short",
    "eternalParentheses": "Parentheses",
    "eternalPentaLogarithm": "Penta Logarithm",
    "eternalPentaLogarithmBase": "Penta Logarithm Base",
    "eternalPentaRoot": "Penta Root",
    "eternalPentaScientific": "Penta Scientific",
    "eternalPentaSquareRoot": "Penta Square Root",
    "eternalPolynomial": "Polynomial",
    "eternalPowerTower": "Power Tower",
    "eternalPowersOfOne": "Powers Of One",
    "eternalPreciseFraction": "Precise Fraction",
    "eternalPreciseMixedNumber": "Precise Mixed Number",
    "eternalPrime": "Prime",
    "eternalPsiDash": "Psi Dash",
    "eternalPsiDashBinary": "Psi Dash Binary",
    "eternalPsiLetters": "Psi Letters",
    "eternalPsiLettersBinary": "Psi Letters Binary",
    "eternalQuaternary": "Quaternary",
    "eternalRationalFunction": "Rational Function",
    "eternalRomanNumerals": "Roman Numerals",
    "eternalRoot": "Root",
    "eternalSI": "SI",
    "eternalSIWritten": "SIWritten",
    "eternalSandcastleBuilder": "Sandcastle Builder",
    "eternalSandcastleBuilderWritten": "Sandcastle Builder Written",
    "eternalScientific": "Scientific",
    "eternalSeptecoman": "Septecoman",
    "eternalSeximal": "Seximal",
    "eternalSimplifiedWritten": "Simplified Written",
    "eternalSquare": "Square",
    "eternalSquareRoot": "Square Root",
    "eternalStandard": "Standard",
    "eternalSuperLogarithm": "Super Logarithm",
    "eternalSuperLogarithmBase": "Super Logarithm Base",
    "eternalSuperRoot": "Super Root",
    "eternalSuperSquareRoot": "Super Square Root",
    "eternalSuperSquareScientific": "Super Square Scientific",
    "eternalTernary": "Ternary",
    "eternalTetrationFloat": "Tetration Float",
    "eternalTriangular": "Triangular",
    "eternalTripentated": "Tripentated",
    "eternalTritetrated": "Tritetrated",
    "eternalTritetratedProduct": "Tritetrated Product",
    "eternalWeakHyperscientific": "Weak Hyperscientific",
    "eternalXYZ": "XYZ",
}

function getCurrentNotationName() {
    return NOTATION_NAMES[currentNotationId] || currentNotationId
}


// Cycle through notations for options button
const NOTATIONS = [
    "tmt", "eternalADGreekLetters", "eternalADLongScale", "eternalADMixedScientific", "eternalADMixedScientificLongScale", "eternalADMyriad", "eternalADRoman", "eternalADStandard", "eternalAarexLongScale", "eternalAarexMixedScientific", 
    "eternalAarexMixedScientificLongScale", "eternalAarexMyriad", "eternalAarexStandard", "eternalAlphabet", "eternalAlphabetDigits", "eternalAlphaquint", "eternalAlternateBase", "eternalBalancedTernary", "eternalBaseE", "eternalBasePhi", 
    "eternalBasePi", "eternalBaseThreeHalves", "eternalBijectiveDecimal", "eternalBinary", "eternalBinaryIL", "eternalBinarySI", "eternalBinarySIWritten", "eternalBlind", "eternalBrackets", "eternalColoredDominoes", 
    "eternalCombinedD", "eternalCookieFonsterExtendedSI", "eternalCubeRoot", "eternalDefault", "eternalDominoes", "eternalDots", "eternalDoubleBinaryNames", "eternalDoubleBinaryPrefixes", "eternalDoubleFactorials", "eternalDoubleLogarithm", 
    "eternalDozenal23", "eternalDozenalXE", "eternalDuodecimal", "eternalElementLetters", "eternalEmoji", "eternalEmojiAlphabet", "eternalEngineering", "eternalEternity", "eternalExponentTower", "eternalExponentTowerK", 
    "eternalFactoradic", "eternalFactorial", "eternalFactorialAmount", "eternalFactorialHyperscientific", "eternalFactorialScientific", "eternalFastGrowingHierarchy", "eternalFillingFractions", "eternalFours", "eternalGreekAlphabet", "eternalGreekLetters", 
    "eternalGrid", "eternalHardyHierarchy", "eternalHearts", "eternalHexadecimal", "eternalHyperE", "eternalHyperSI", "eternalHyperSIWritten", "eternalHyperscientific", "eternalHypersplit", "eternalHypersplitBase2", 
    "eternalHypersplitBase3", "eternalIncreasingOperator", "eternalIncreasingOperatorBase2", "eternalIncreasingOperatorBase3", "eternalIncreasingRoot", "eternalIncreasingSuperRoot", "eternalInfinity", "eternalLetterDigits", "eternalLetters", "eternalLogarithm", 
    "eternalLogarithmBase", "eternalLongScale", "eternalLooseFraction", "eternalLooseMixedNumber", "eternalMediumFraction", "eternalMediumMixedNumber", "eternalMixedSI", "eternalMixedScientific", "eternalMixedScientificLongScale", "eternalMyriad", 
    "eternalNaturalLogarithm", "eternalNaturalPentaLogarithm", "eternalNaturalSuperLogarithm", "eternalNumericDominoes", "eternalOctal", "eternalOmega", "eternalOmegaLayerNumber", "eternalOmegaLayers", "eternalOmegaLayersRamped", "eternalOmegaMetaZero", 
    "eternalOmegaMetaZeroAlphaAmount", "eternalOmegaShort", "eternalParentheses", "eternalPentaLogarithm", "eternalPentaLogarithmBase", "eternalPentaRoot", "eternalPentaScientific", "eternalPentaSquareRoot", "eternalPolynomial", "eternalPowerTower", 
    "eternalPowersOfOne", "eternalPreciseFraction", "eternalPreciseMixedNumber", "eternalPrime", "eternalPsiDash", "eternalPsiDashBinary", "eternalPsiLetters", "eternalPsiLettersBinary", "eternalQuaternary", "eternalRationalFunction", 
    "eternalRomanNumerals", "eternalRoot", "eternalSI", "eternalSIWritten", "eternalSandcastleBuilder", "eternalSandcastleBuilderWritten", "eternalScientific", "eternalSeptecoman", "eternalSeximal", "eternalSimplifiedWritten", 
    "eternalSquare", "eternalSquareRoot", "eternalStandard", "eternalSuperLogarithm", "eternalSuperLogarithmBase", "eternalSuperRoot", "eternalSuperSquareRoot", "eternalSuperSquareScientific", "eternalTernary", "eternalTetrationFloat", 
    "eternalTriangular", "eternalTripentated", "eternalTritetrated", "eternalTritetratedProduct", "eternalWeakHyperscientific", "eternalXYZ"
]
// Options -> Notation dropdown. The <select> in systemComponents.js renders these
// and calls setNotationFromDropdown() on change.
function getNotationOptions() {
    return NOTATIONS.map(function(id) {
        return { id: id, name: NOTATION_NAMES[id] || id }
    })
}

function setNotationFromDropdown(id) {
    if (!id) return
    setNotation(id)
    if (typeof needCanvasUpdate !== "undefined") needCanvasUpdate = true
}

function cycleNotation() {
    let idx = NOTATIONS.indexOf(currentNotationId)
    let next = NOTATIONS[(idx + 1) % NOTATIONS.length]
    setNotation(next)
    // Also update options.notation for save
    if (typeof options !== "undefined") options.notation = next
}

// Try to restore notation from options after load
function initNotationFromOptions() {
    if (typeof options !== "undefined" && options.notation) {
        setNotation(options.notation)
    } else if (typeof player !== "undefined" && player.notation) {
        setNotation(player.notation)
    } else {
        setNotation("tmt")
    }
}

// Auto-init when EternalNotations loads (defer a bit to ensure options exists)
setTimeout(() => {
    try { initNotationFromOptions() } catch(e) {}
}, 500)

// Original TMT format as fallback
function formatTMT(decimal, precision = 2, small) {
    small = small || (typeof modInfo !== "undefined" && modInfo.allowSmall)
    decimal = new Decimal(decimal)
    if (isNaN(decimal.sign) || isNaN(decimal.layer) || isNaN(decimal.mag)) {
        if (typeof player !== "undefined" && player) player.hasNaN = true;
        return "NaN"
    }
    if (decimal.sign < 0) return "-" + formatTMT(decimal.neg(), precision, small)
    if (decimal.mag == Number.POSITIVE_INFINITY) return "Infinity"
    if (decimal.gte("eeee1000")) {
        var slog = decimal.slog()
        if (slog.gte(1e6)) return "F" + formatTMT(slog.floor())
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
        return formatTMT(decimal, precision) + "⁻¹"

}

function format(decimal, precision = 2, small) {
    // If Eternal Notations is enabled and available, use it
    if (eternalNotationsEnabled && currentEternalNotation && typeof EternalNotations !== "undefined") {
        try {
            decimal = new Decimal(decimal)
            if (isNaN(decimal.sign) || isNaN(decimal.layer) || isNaN(decimal.mag)) {
                if (typeof player !== "undefined" && player) player.hasNaN = true;
                return "NaN"
            }
            // Eternal Notations handles all numbers, including small and negative, so we can just call it
            // It expects a Decimal, and returns a string
            return currentEternalNotation.format(decimal)
        } catch (e) {
            console.warn("[Eternal Notations] format failed, falling back to TMT:", e)
            return formatTMT(decimal, precision, small)
        }
    }
    return formatTMT(decimal, precision, small)
}

function formatWhole(decimal) {
    decimal = new Decimal(decimal)
    if (eternalNotationsEnabled && currentEternalNotation) {
        // For whole numbers, Eternal Notations will handle it, but we want no decimals for small numbers
        // We can just call format with precision 0 for <1e9
        if (decimal.gte(1e9)) return format(decimal, 2)
        if (decimal.lte(0.99) && !decimal.eq(0)) return format(decimal, 2)
        return format(decimal, 0)
    }
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
