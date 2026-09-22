// ************ Options ************

let options = {}

function getStartOptions() {
	return {
		autosave: true,
		msDisplay: "always",
		theme: "default",
		hqTree: false,
		offlineProd: true,
		hideChallenges: false,
		showStory: true,
		forceOneTab: false,
		oldStyle: false,
		forceTooltips: true,
		hideMilestonePopups: false,
		notation: "tmt", // Eternal Notations: tmt, eternalDefault, eternalScientific, etc. (credit: MathCookie17)
		font: "orbitron",
	}
}

const GAME_FONTS = {
	// --- Sci-Fi & Cyberpunk ---
	orbitron: { name: "Sci-Fi: Orbitron (Default)", family: '"Orbitron"', node: "32px", letter: "0.04em", weight: "700" },
	audiowide: { name: "Sci-Fi: Audiowide", family: '"Audiowide"', node: "30px", letter: "0.02em", weight: "400" },
	exo2: { name: "Sci-Fi: Exo 2", family: '"Exo 2"', node: "36px", letter: "0.02em", weight: "700" },
	rajdhani: { name: "Sci-Fi: Rajdhani (HUD)", family: '"Rajdhani"', node: "40px", letter: "0.06em", weight: "700" },
	electrolize: { name: "Sci-Fi: Electrolize", family: '"Electrolize"', node: "32px", letter: "0.02em", weight: "400" },
	chakrapetch: { name: "Sci-Fi: Chakra Petch", family: '"Chakra Petch"', node: "32px", letter: "0.03em", weight: "700" },
	teko: { name: "Sci-Fi: Teko (Condensed)", family: '"Teko"', node: "44px", letter: "0.05em", weight: "700" },
	michroma: { name: "Sci-Fi: Michroma", family: '"Michroma"', node: "26px", letter: "0.04em", weight: "400" },
	russo: { name: "Sci-Fi: Russo One", family: '"Russo One"', node: "32px", letter: "0.02em", weight: "400" },
	quantico: { name: "Sci-Fi: Quantico", family: '"Quantico"', node: "32px", letter: "0.03em", weight: "700" },
	syncopate: { name: "Sci-Fi: Syncopate (Wide)", family: '"Syncopate"', node: "22px", letter: "0.08em", weight: "700" },
	megrim: { name: "Sci-Fi: Megrim (Cyber)", family: '"Megrim"', node: "34px", letter: "0.04em", weight: "400" },

	// --- Code & Monospace ---
	classic: { name: "Code: Inconsolata (Classic)", family: '"Inconsolata"', node: "40px", letter: "0", weight: "bold" },
	firacode: { name: "Code: Fira Code", family: '"Fira Code"', node: "32px", letter: "0", weight: "700" },
	jetbrains: { name: "Code: JetBrains Mono", family: '"JetBrains Mono"', node: "32px", letter: "0", weight: "700" },
	spacemono: { name: "Code: Space Mono", family: '"Space Mono"', node: "30px", letter: "0", weight: "700" },
	robotomono: { name: "Code: Roboto Mono", family: '"Roboto Mono"', node: "32px", letter: "0", weight: "700" },
	courier: { name: "Code: Courier Prime", family: '"Courier Prime"', node: "32px", letter: "0", weight: "700" },
	sharetech: { name: "Code: Share Tech Mono", family: '"Share Tech Mono"', node: "34px", letter: "0", weight: "400" },
	novamono: { name: "Code: Nova Mono", family: '"Nova Mono"', node: "34px", letter: "0", weight: "400" },
	specialelite: { name: "Code: Typewriter (Special Elite)", family: '"Special Elite"', node: "28px", letter: "0.02em", weight: "400" },

	// --- Retro, Pixel & Gaming ---
	pressstart: { name: "Retro: Press Start 2P (Pixel)", family: '"Press Start 2P"', node: "16px", letter: "0", weight: "400" },
	vt323: { name: "Retro: VT323 (CRT Terminal)", family: '"VT323"', node: "42px", letter: "0.02em", weight: "400" },
	silkscreen: { name: "Retro: Silkscreen", family: '"Silkscreen"', node: "24px", letter: "0.02em", weight: "700" },
	dotgothic: { name: "Retro: DotGothic16", family: '"DotGothic16"', node: "30px", letter: "0", weight: "400" },
	monoton: { name: "Retro: Monoton (Neon)", family: '"Monoton"', node: "28px", letter: "0.05em", weight: "400" },
	bungee: { name: "Retro: Bungee", family: '"Bungee"', node: "26px", letter: "0.02em", weight: "400" },
	bungeeshade: { name: "Retro: Bungee Shade", family: '"Bungee Shade"', node: "26px", letter: "0.02em", weight: "400" },
	blackops: { name: "Retro: Black Ops One", family: '"Black Ops One"', node: "30px", letter: "0.03em", weight: "400" },
	fasterone: { name: "Retro: Faster One", family: '"Faster One"', node: "26px", letter: "0.02em", weight: "400" },
	creepster: { name: "Retro: Creepster (Horror)", family: '"Creepster"', node: "32px", letter: "0.03em", weight: "400" },

	// --- Modern Clean Sans ---
	inter: { name: "Clean: Inter", family: '"Inter"', node: "34px", letter: "0", weight: "700" },
	montserrat: { name: "Clean: Montserrat", family: '"Montserrat"', node: "32px", letter: "0.02em", weight: "700" },
	poppins: { name: "Clean: Poppins", family: '"Poppins"', node: "32px", letter: "0.01em", weight: "700" },
	outfit: { name: "Clean: Outfit", family: '"Outfit"', node: "34px", letter: "0.01em", weight: "700" },
	spacegrotesk: { name: "Clean: Space Grotesk", family: '"Space Grotesk"', node: "32px", letter: "0.02em", weight: "700" },
	rubik: { name: "Clean: Rubik", family: '"Rubik"', node: "34px", letter: "0", weight: "700" },
	righteous: { name: "Clean: Righteous", family: '"Righteous"', node: "30px", letter: "0.03em", weight: "400" },
	comfortaa: { name: "Clean: Comfortaa (Rounded)", family: '"Comfortaa"', node: "30px", letter: "0", weight: "700" },
	fredoka: { name: "Clean: Fredoka (Friendly)", family: '"Fredoka"', node: "32px", letter: "0", weight: "700" },

	// --- Fantasy, Serif & Academic ---
	cinzel: { name: "Fantasy: Cinzel", family: '"Cinzel"', node: "28px", letter: "0.08em", weight: "700", generic: "serif" },
	cinzeldec: { name: "Fantasy: Cinzel Decorative", family: '"Cinzel Decorative"', node: "26px", letter: "0.08em", weight: "700", generic: "serif" },
	playfair: { name: "Fantasy: Playfair Display", family: '"Playfair Display"', node: "32px", letter: "0", weight: "600", generic: "serif" },
	medieval: { name: "Fantasy: MedievalSharp", family: '"MedievalSharp"', node: "32px", letter: "0.02em", weight: "400", generic: "serif" },
	pirata: { name: "Fantasy: Pirata One (Gothic)", family: '"Pirata One"', node: "34px", letter: "0.03em", weight: "400", generic: "serif" },
	almendra: { name: "Fantasy: Almendra", family: '"Almendra"', node: "30px", letter: "0.02em", weight: "700", generic: "serif" },
	marcellus: { name: "Fantasy: Marcellus (Roman)", family: '"Marcellus"', node: "30px", letter: "0.04em", weight: "400", generic: "serif" },
	uncial: { name: "Fantasy: Uncial Antiqua", family: '"Uncial Antiqua"', node: "28px", letter: "0.03em", weight: "400", generic: "serif" },
	caesar: { name: "Fantasy: Caesar Dressing", family: '"Caesar Dressing"', node: "32px", letter: "0.03em", weight: "400", generic: "serif" },
	unifraktur: { name: "Fantasy: Blackletter (Unifraktur)", family: '"UnifrakturMaguntia"', node: "30px", letter: "0", weight: "400", generic: "serif" },

	// --- LaTeX & Mathematical ---
	latex: { name: "Math: LaTeX (Computer Modern)", family: '"KaTeX_Main", "KaTeX_Math", "Computer Modern Serif", "STIX Two Text"', node: "32px", letter: "0", weight: "400", generic: "serif" },
	latexitalic: { name: "Math: LaTeX Math Italic", family: '"KaTeX_Math", "KaTeX_Main", "STIX Two Text"', node: "34px", letter: "0", weight: "400", generic: "serif" },
	stix: { name: "Math: STIX Two (Journal)", family: '"STIX Two Text"', node: "34px", letter: "0", weight: "400", generic: "serif" },

	// --- Handwritten & Fun ---
	marker: { name: "Fun: Permanent Marker", family: '"Permanent Marker"', node: "26px", letter: "0.02em", weight: "400", generic: "cursive" },
	comic: { name: "Fun: Comic Neue", family: '"Comic Neue"', node: "32px", letter: "0", weight: "700", generic: "cursive" },
	bangers: { name: "Fun: Bangers (Comic Book)", family: '"Bangers"', node: "34px", letter: "0.04em", weight: "400", generic: "cursive" },
	caveat: { name: "Fun: Caveat (Handwritten)", family: '"Caveat"', node: "38px", letter: "0", weight: "700", generic: "cursive" },
	pacifico: { name: "Fun: Pacifico (Brush Script)", family: '"Pacifico"', node: "28px", letter: "0", weight: "400", generic: "cursive" },
}

function getFontOptions() {
	return Object.keys(GAME_FONTS).map(function(id) { return { id: id, name: GAME_FONTS[id].name } })
}

function applyGameFont(id) {
	if (!id || !GAME_FONTS[id]) id = (options && options.font) || "orbitron"
	if (!GAME_FONTS[id]) id = "classic"
	if (options) options.font = id
	let f = GAME_FONTS[id]
	let generic = f.generic || "monospace"
	let stack = f.family + ', "DozenalFallback", "Noto Sans Symbols", "Noto Sans Symbols 2", "Segoe UI Symbol", ' + generic
	let root = document.documentElement
	if (!root || !root.style) return
	root.style.setProperty("--game-font", stack)
	root.style.setProperty("--game-node-font", f.node)
	root.style.setProperty("--game-letter-spacing", f.letter)
	root.style.setProperty("--game-font-weight", f.weight)
	if (typeof needCanvasUpdate !== "undefined") needCanvasUpdate = true
}

function setFontFromDropdown(id) {
	applyGameFont(id)
	if (typeof save === "function") save()
}

function toggleOpt(name) {
	if (name == "oldStyle" && styleCooldown > 0)
		return;

	options[name] = !options[name];
	if (name == "hqTree")
		changeTreeQuality();
	if (name == "oldStyle")
		updateStyle();
}
var styleCooldown = 0;
function updateStyle() {
	styleCooldown = 1;
	let css = document.getElementById("styleStuff");
	css.href = options.oldStyle ? "oldStyle.css" : "style.css";
	needCanvasUpdate = true;
}
function changeTreeQuality() {
	var on = options.hqTree;
	document.body.style.setProperty('--hqProperty1', on ? "2px solid" : "4px solid");
	document.body.style.setProperty('--hqProperty2a', on ? "-4px -4px 4px rgba(0, 0, 0, 0.25) inset" : "-4px -4px 4px rgba(0, 0, 0, 0) inset");
	document.body.style.setProperty('--hqProperty2b', on ? "0px 0px 20px var(--background)" : "");
	document.body.style.setProperty('--hqProperty3', on ? "2px 2px 4px rgba(0, 0, 0, 0.25)" : "none");
}
function toggleAuto(toggle) {
	Vue.set(player[toggle[0]], [toggle[1]], !player[toggle[0]][toggle[1]]);
	needCanvasUpdate=true
}

const MS_DISPLAYS = ["ALL", "LAST, AUTO, INCOMPLETE", "AUTOMATION, INCOMPLETE", "INCOMPLETE", "NONE"];

const MS_SETTINGS = ["always", "last", "automation", "incomplete", "never"];

function adjustMSDisp() {
	options.msDisplay = MS_SETTINGS[(MS_SETTINGS.indexOf(options.msDisplay) + 1) % 5];
}
function milestoneShown(layer, id) {
	complete = player[layer].milestones.includes(id);
	auto = layers[layer].milestones[id].toggles;

	switch (options.msDisplay) {
		case "always":
			return true;
			break;
		case "last":
			return (auto) || !complete || player[layer].lastMilestone === id;
			break;
		case "automation":
			return (auto) || !complete;
			break;
		case "incomplete":
			return !complete;
			break;
		case "never":
			return false;
			break;
	}
	return false;
}

let formatOption = (opt) => opt ? 'ON' : 'OFF'
