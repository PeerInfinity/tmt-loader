// ============================================================================
//  MULTIVERSE TRANSPORT  (js/technical/transport.js)
// ============================================================================
//  Lets the Universe (U) layer "transport" you into the *full, playable* copy
//  of another prestige tree, rather than just abstracting it into a buyable.
//
//  Every tree in TRANSPORT_TREES is a real, unmodified copy of the original
//  open-source game, vendored into /trees/<slug>/ and served from this same
//  origin. Pressing a transport button loads it into a full-screen overlay
//  with an iframe, so the Classic+ Tree keeps running (and saving) behind it.
//
//  Why an overlay instead of a link?
//    - Your Classic+ progress keeps ticking while you play the other tree.
//    - One button to come back (no browser back-button roulette).
//    - Still fully escapable: there's an "open in new tab" button too.
//
//  SAVE ISOLATION: every vendored tree's `modInfo.id` was rewritten to a
//  unique `cpt_*` key, because localStorage is shared per-origin. Without
//  this, PT: Rewritten and PT: Rewritten NG+ (both `ptr`) would overwrite
//  each other's saves. Do not "restore" the original ids.
//
//  Two things were added since the first version, both driven from
//  js/technical/multiverse.js:
//    - TRANSPORT_OPT.cut ("hard cut"): the hub is parked (opacity 0, no pointer
//      events — still ticking, still saving) and the bar is hidden, so the
//      other tree owns the viewport outright.
//    - MULTIVERSE.dressFrame(): every bundled tree is same-origin, so the hub
//      injects a ◀ RETURN pill into the child's own document and calls the
//      child's global save() before unloading. No file under trees/ is touched.
// ============================================================================

// Live options for the transport layer. multiverse.js writes to these.
var TRANSPORT_OPT = {
	cut: false,      // hard cut instead of overlay-with-bar
	dress: true,     // inject a return pill inside the framed tree
}

var TRANSPORT_TREES = {
	// ---- Real, vendored open-source trees ---------------------------------
	classic: {
		name: "Prestige Tree Classic 1.0",
		short: "Classic 1.0",
		url: "trees/prestige-tree-classic/index.html",
		repo: "https://github.com/Jacorb90/Prestige-Tree-Classic",
		author: "Jacorb90 (with Aarex, idea by papyrus)",
		license: "MIT",
		color: "#4BDC13",
		real: true,
		note: "The original 7-row tree that started it all.",
	},
	rewritten: {
		name: "Prestige Tree Rewritten",
		short: "PT: Rewritten",
		url: "trees/prestige-tree-rewritten/index.html",
		repo: "https://github.com/Jacorb90/Prestige-Tree",
		author: "Jacorb90",
		license: "MIT",
		color: "#FF8800",
		real: true,
		note: "The v1.3 rewrite — 30 layers of refined Prestige Tree.",
	},
	ng: {
		name: "Prestige Tree Rewritten NG+",
		short: "PT: Rewritten NG+",
		url: "trees/prestige-tree-rewritten-ng/index.html",
		repo: "https://github.com/Seder3214/Prestige-Tree-Rewritten-NG",
		author: "Seder3214",
		license: "MIT",
		color: "#00FF7F",
		real: true,
		note: "New Game Plus expansion built on Rewritten.",
	},
	demo: {
		name: "The Modding Tree — Demo",
		short: "TMT Demo",
		url: "demo.html",
		repo: "https://github.com/Acamaeda/The-Modding-Tree",
		author: "Acamaeda",
		license: "MIT",
		color: "#00CC88",
		real: true,
		note: "The official TMT example mod, shipped in this repo.",
	},
	incrementverse: {
		name: "The Incrementreeverse",
		short: "Incrementreeverse",
		url: "trees/incrementreeverse/index.html",
		repo: "https://github.com/pg132/The-Modding-Tree",
		author: "pg132",
		license: "MIT (TMT) + Prestige-tree-license",
		color: "#FF44AA",
		real: true,
		note: "A finished 16-layer community tree.",
	},
	basic: {
		name: "The Basic Tree",
		short: "The Basic Tree",
		url: "trees/basic-tree/index.html",
		repo: "https://github.com/gapples2/The-Modding-Tree",
		author: "gapples2 & thepaperpilot",
		license: "MIT (TMT) + Prestige-tree-license",
		color: "#AAAAAA",
		real: true,
		note: "Dust, Cheapeners, Darkness, Exponents, Funity, Games.",
	},
	miletree: {
		name: "The Milestone Tree",
		short: "The Milestone Tree",
		url: "trees/milestone-tree/index.html",
		repo: "https://github.com/loader3229/milestone-tree",
		author: "loader3229 (qq1010903229)",
		license: "MIT (TMT) + Prestige-tree-license",
		color: "#FFD700",
		real: true,
		note: "A whole mod built around milestones.",
	},
	dimensions: {
		name: "Prestige Tree: Dimensions",
		short: "PT: Dimensions",
		url: "trees/prestige-tree-dimensions/index.html",
		repo: "https://github.com/loader3229/Prestige-Tree-Dimensions",
		author: "loader3229 (qq1010903229)",
		license: "MIT (TMT) + Prestige-tree-license",
		color: "#00BFFF",
		real: true,
		note: "10k+ lines of dimensional progression.",
	},
	particles: {
		name: "The Particle Increment Tree",
		short: "Particle Tree",
		url: "trees/particle-increment-tree/index.html",
		repo: "https://github.com/cokecole526/The-Particle-Increment-Tree",
		author: "cokecole526",
		license: "Not stated by author — see trees/README.md",
		color: "#FFD700",
		real: true,
		note: "Electrons, protons, neutrons and quarks. (Chinese UI)",
	},
	pro: {
		name: "The Pro Tree",
		short: "The Pro Tree",
		url: "trees/the-pro-tree/index.html",
		repo: "https://github.com/chuangyou123/The-pro-tree",
		author: "chuangyou123 (ProGamesGrinder)",
		license: "MIT (TMT) + Prestige-tree-license",
		color: "#FF0077",
		real: true,
		note: "A massive 40+ layer tree. (Chinese UI)",
	},
	dice: {
		name: "The Dice Tree",
		short: "The Dice Tree",
		url: "trees/the-dice-tree/index.html",
		repo: "https://github.com/chuangyou123/The-Dice-Tree-ZH.github.io",
		author: "chuangyou123",
		license: "MIT (TMT) + Prestige-tree-license",
		color: "#FFA500",
		real: true,
		note: "Luck, pips and dice rollers. (Chinese UI)",
	},

	// ---- The hub itself ---------------------------------------------------
	classicPlus: {
		name: "The Classic+ Tree (this game)",
		short: "Classic+ Hub",
		url: null,
		repo: "https://github.com/certainjellyfish9204/The-Modding-Tree",
		author: "certainjellyfish9204",
		license: "MIT",
		color: "#AA00FF",
		real: true,
		self: true,
		note: "You are already here.",
	},

	// ---- Universes with no external source --------------------------------
	// These three are original to this mod. They live only as in-game
	// buyables; there is no separate full game to transport into, so the
	// button says so instead of pretending otherwise.
	galaxy: {
		name: "The Galaxy Tree",
		short: "The Galaxy Tree",
		url: null,
		repo: null,
		author: "Classic+ (original content)",
		license: "MIT",
		color: "#6644FF",
		real: false,
		note: "Original to Classic+ — no separate source game exists.",
	},
	synergism: {
		name: "Synergism",
		short: "Synergism",
		url: null,
		repo: null,
		author: "Classic+ (original content)",
		license: "MIT",
		color: "#00DDFF",
		real: false,
		note: "Original to Classic+ — no separate source game exists.",
	},
	circuit: {
		name: "The Circuit Tree",
		short: "The Circuit Tree",
		url: null,
		repo: null,
		author: "Classic+ (original content)",
		license: "MIT",
		color: "#33FF99",
		real: false,
		note: "Original to Classic+ — no separate source game exists.",
	},
}

// The overlay's DOM + state
var transportState = {
	key: null,
	visible: false,
	root: null,
	frame: null,
	titleEl: null,
	metaEl: null,
	newTabEl: null,
	booted: false,
}

// ---------------------------------------------------------------------------
//  Styles (injected once)
// ---------------------------------------------------------------------------
function transportInjectStyles() {
	if (document.getElementById("transportStyles")) return
	let css = `
	#transportOverlay {
		position: fixed; inset: 0; z-index: 99999;
		display: none; flex-direction: column;
		background: #000; color: #fff;
		font-family: 'Chakra Petch', 'Inter', Arial, sans-serif;
		opacity: 0;
		transition: opacity 0.28s ease;
	}
	#transportOverlay.tp-open { display: flex; }
	#transportOverlay.tp-shown { opacity: 1; }
	/* hard cut: no bar, the other tree owns the screen (its own ◀ RETURN pill
	   comes from cpt-return.js, and Esc still works from the parent handler) */
	#transportOverlay.tp-cut #transportBar { display: none; }
	#transportOverlay.tp-cut ~ #transportPill { bottom: 12px; }

	#transportBar {
		flex: 0 0 auto; display: flex; align-items: center; gap: 8px;
		padding: 6px 10px; box-sizing: border-box;
		min-height: 46px;
		background: linear-gradient(90deg, #14002b, #2a0055 45%, #14002b);
		border-bottom: 2px solid #AA00FF;
		box-shadow: 0 0 18px rgba(170,0,255,0.55);
	}
	#transportBar .tp-btn {
		cursor: pointer; user-select: none;
		padding: 6px 12px; border-radius: 6px;
		background: #3d0077; border: 1px solid #AA00FF; color: #fff;
		font-size: 14px; font-weight: 700; white-space: nowrap;
		transition: background 0.15s, transform 0.1s;
	}
	#transportBar .tp-btn:hover { background: #6a00cc; transform: translateY(-1px); }
	#transportBar .tp-btn:active { transform: translateY(0); }
	#transportBar .tp-back { background: #77002a; border-color: #FF3377; }
	#transportBar .tp-back:hover { background: #bb0044; }

	#transportTitle { font-size: 16px; font-weight: 700; margin-left: 6px; }
	#transportMeta {
		flex: 1 1 auto; text-align: right; font-size: 11px;
		color: #c9a6ff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
	}
	#transportMeta a { color: #d8b6ff; }
	#transportFrame { flex: 1 1 auto; width: 100%; border: 0; background: #000; display: block; }

	/* Teleport flash */
	#transportFlash {
		position: fixed; inset: 0; z-index: 100000; pointer-events: none;
		background: radial-gradient(circle at center, rgba(200,120,255,0.95), rgba(60,0,120,0.85) 45%, rgba(0,0,0,0) 72%);
		opacity: 0;
	}
	#transportFlash.tp-flash { animation: tpflash 0.62s ease-out; }
	@keyframes tpflash {
		0%   { opacity: 0; transform: scale(0.35); }
		28%  { opacity: 1; transform: scale(1.05); }
		100% { opacity: 0; transform: scale(1.6); }
	}

	/* Small "return" pill, for when the bar is hidden */
	#transportPill {
		position: fixed; right: 12px; bottom: 12px; z-index: 100001;
		display: none; cursor: pointer; user-select: none;
		padding: 8px 14px; border-radius: 999px;
		background: #77002a; border: 2px solid #FF3377; color: #fff;
		font-family: 'Chakra Petch', Arial, sans-serif; font-size: 13px; font-weight: 700;
		box-shadow: 0 0 14px rgba(255,51,119,0.7);
	}
	#transportPill:hover { background: #bb0044; }
	`
	let el = document.createElement("style")
	el.id = "transportStyles"
	el.textContent = css
	document.head.appendChild(el)
}

// ---------------------------------------------------------------------------
//  Build the overlay (lazily, once)
// ---------------------------------------------------------------------------
function transportBoot() {
	if (transportState.booted) return
	transportInjectStyles()

	let root = document.createElement("div")
	root.id = "transportOverlay"
	root.innerHTML = `
		<div id="transportBar">
			<div class="tp-btn tp-back" id="transportBack">◀ RETURN TO CLASSIC+ HUB</div>
			<div class="tp-btn" id="transportReload">⟳ Reload</div>
			<div class="tp-btn" id="transportNewTab">↗ New Tab</div>
			<div id="transportTitle">Transport</div>
			<div id="transportMeta"></div>
		</div>
		<iframe id="transportFrame" title="Ported tree" allow="autoplay; fullscreen"></iframe>
	`
	document.body.appendChild(root)

	let flash = document.createElement("div")
	flash.id = "transportFlash"
	document.body.appendChild(flash)

	let pill = document.createElement("div")
	pill.id = "transportPill"
	pill.textContent = "◀ Return to Classic+ Hub"
	document.body.appendChild(pill)

	transportState.root = root
	transportState.frame = root.querySelector("#transportFrame")
	transportState.titleEl = root.querySelector("#transportTitle")
	transportState.metaEl = root.querySelector("#transportMeta")
	transportState.newTabEl = root.querySelector("#transportNewTab")

	root.querySelector("#transportBack").onclick = closeTransport
	pill.onclick = closeTransport
	root.querySelector("#transportReload").onclick = () => {
		if (!transportState.frame || !transportState.key) return
		let t = TRANSPORT_TREES[transportState.key]
		if (!t) return
		// bust the iframe cache so a reload truly reloads
		let base = transportFrameSrc(t)
		transportState.frame.src = base + (base.indexOf("?") === -1 ? "?" : "&") + "r=" + Date.now()
	}
	root.querySelector("#transportNewTab").onclick = () => {
		if (!transportState.key) return
		let t = TRANSPORT_TREES[transportState.key]
		if (t && t.url) window.open(t.url, "_blank", "noopener")
	}

	// ESC closes. Focus is usually inside the iframe, so we hook both windows.
	window.addEventListener("keydown", transportKeyHandler)
	transportState.frame.addEventListener("load", () => {
		try {
			transportState.frame.contentWindow.addEventListener("keydown", transportKeyHandler)
		} catch (e) { /* cross-origin or not-ready; parent handler still works */ }
		// Put a return pill inside the tree itself, when we can reach its DOM.
		if (TRANSPORT_OPT.dress && typeof MULTIVERSE !== "undefined" && MULTIVERSE.dressFrame) {
			MULTIVERSE.dressFrame(transportState.frame, {
				label: "RETURN TO CLASSIC+",
				hint: "You are playing another tree inside the Classic+ multiverse. The hub keeps running behind this frame.",
				onReturn: function () { closeTransport() },
			})
		}
	})

	transportState.booted = true
}

function transportKeyHandler(e) {
	if (e.key === "Escape" && transportState.visible) {
		e.preventDefault()
		closeTransport()
	}
}

// ---------------------------------------------------------------------------
//  Open / close
// ---------------------------------------------------------------------------
function transportFrameSrc(t) {
	if (!t || !t.url) return "about:blank"
	return t.url
}

function openTransport(key, opts) {
	opts = opts || {}
	let t = TRANSPORT_TREES[key]
	if (!t) { console.warn("openTransport: unknown tree '" + key + "'"); return }
	if (!t.url) { transportNoSource(t); return }

	transportBoot()

	transportState.key = key
	transportState.titleEl.textContent = "⟡ " + t.name
	transportState.metaEl.innerHTML =
		"by <b>" + t.author + "</b> &nbsp;•&nbsp; " + t.license +
		(t.repo ? ` &nbsp;•&nbsp; <a href="${t.repo}" target="_blank" rel="noopener">source ↗</a>` : "")
	transportState.newTabEl.style.display = t.url ? "" : "none"

	// hard cut wins over the persisted toggle unless explicitly overridden
	var cut = opts.cut === undefined ? TRANSPORT_OPT.cut : !!opts.cut
	transportState.root.classList[cut ? "add" : "remove"]("tp-cut")
	transportState.cut = cut
	if (typeof MULTIVERSE !== "undefined" && MULTIVERSE.park) MULTIVERSE.park(cut)

	let want = transportFrameSrc(t)
	// compare ignoring the cache-buster we may have added on reload
	if ((transportState.frame.getAttribute("src") || "").split("&r=")[0] !== want) {
		transportState.frame.src = want
	}

	// Teleport flash
	let flash = document.getElementById("transportFlash")
	if (flash) {
		flash.classList.remove("tp-flash")
		void flash.offsetWidth // restart the animation
		flash.classList.add("tp-flash")
	}

	transportState.root.classList.add("tp-open")
	// next frame, so the opacity transition actually runs
	requestAnimationFrame(() => {
		transportState.root.classList.add("tp-shown")
	})
	document.getElementById("transportPill").style.display = "block"
	transportState.visible = true

	doPopup && doPopup("none",
		(cut ? "Hub parked — " : "Transporting to ") + "<b>" + t.name + "</b>…" +
		(cut ? "<br><small>The Classic+ Tree is invisible but still running and saving.</small>" : ""),
		cut ? "Hard Cut" : "Multiverse Transport", cut ? 3 : 2, t.color)
}

function closeTransport() {
	if (!transportState.booted) return
	transportState.root.classList.remove("tp-shown")
	transportState.visible = false
	if (transportState.cut) {
		transportState.root.classList.remove("tp-cut")
		transportState.cut = false
		if (typeof MULTIVERSE !== "undefined" && MULTIVERSE.park) MULTIVERSE.park(MULTIVERSE.open && MULTIVERSE.cut)
	}
	document.getElementById("transportPill").style.display = "none"
	setTimeout(() => {
		if (!transportState.visible) transportState.root.classList.remove("tp-open")
	}, 290)
	// NOTE: we deliberately do NOT clear the iframe src — the other tree keeps
	// its state (and its own autosave) if you jump back in later.
	// Ask it to write that save now, so the hub's scan sees current progress.
	try {
		if (typeof MULTIVERSE !== "undefined" && MULTIVERSE.flushChild) MULTIVERSE.flushChild(transportState.frame)
	} catch (e) {}
	if (typeof MULTIVERSE !== "undefined" && MULTIVERSE.dirty) {
		setTimeout(() => { try { MULTIVERSE.scan(true) } catch (e) {} }, 350)
	}
}

function transportNoSource(t) {
	let msg = t.self
		? "You're already standing in the <b>Classic+ Hub</b> — this is the tree you're playing right now."
		: "<b>" + t.name + "</b> has no separate source game. It's original to Classic+ and exists "
			+ "as the in-game buyables on this tab, not as a standalone tree."
	doPopup && doPopup("none", msg, t.self ? "Already Home" : "No External Source", 4, t.color)
}

// Small helper the U layer uses to render consistent transport buttons.
// Returns an HTML string for a ["raw-html"] tabFormat entry.
function transportButtonHTML(key, extra) {
	let t = TRANSPORT_TREES[key]
	if (!t) return ""
	let label, sub
	if (t.self) {
		label = "⌂ YOU ARE HERE"
		sub = "Classic+ Hub — the tree you are playing"
	} else if (t.real) {
		label = "⟡ TRANSPORT INTO " + t.short.toUpperCase()
		sub = "Plays the full original game in-place"
	} else {
		label = "∅ NO SEPARATE SOURCE"
		sub = "Original to Classic+ — in-game buyables only"
	}
	let bg = t.real && !t.self ? "linear-gradient(135deg, " + t.color + ", #2a0055)" : "#333355"
	let disabled = (!t.real || t.self) ? "tp-disabled" : ""
	// If multiverse.js is loaded, show whether this realm has a *real* save on
	// this origin — the same signal that feeds the Convergence bonus.
	let bridge = ""
	if (!t.self && t.real && typeof MULTIVERSE !== "undefined" && MULTIVERSE.record) {
		let rec = MULTIVERSE.record(key)
		if (rec) {
			bridge = rec.found
				? `<span style="color:#8dffb0">◉ real save seen</span> · ${typeof MULTIVERSE.fmtLog === "function" ? MULTIVERSE.fmtLog(rec.log) : ""}`
				: `<span style="color:#ff8899">○ no save on this origin yet</span>`
		}
	}
	return `<div class="tp-transport-wrap" style="margin-top:8px">
		<div class="tp-transport-btn ${disabled}" data-transport="${key}" style="
			display:inline-block; cursor:${(!t.real || t.self) ? "default" : "pointer"};
			padding:10px 18px; border-radius:8px; border:2px solid ${t.color};
			background:${bg}; color:#fff; font-weight:700; font-size:15px;
			box-shadow:0 0 14px ${t.color}66; user-select:none;
			opacity:${(!t.real || t.self) ? 0.55 : 1}; transition:transform .12s;">
			${label}
		</div>
		<div style="font-size:11px; color:#bbb; margin-top:3px">${sub}${extra ? " &nbsp;•&nbsp; " + extra : ""}${bridge ? "<br>" + bridge : ""}</div>
	</div>`
}

// A compact grid of every universe, used as the "Multiverse Transport Terminal"
// on the hub tab. Real trees are clickable; unsourced ones are visibly inert.
function transportHubHTML() {
	let order = [
		"classicPlus", "classic", "rewritten", "ng", "demo", "incrementverse",
		"basic", "miletree", "dimensions", "particles", "pro", "dice",
		"galaxy", "synergism", "circuit",
	]
	let html = `<div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; max-width:760px; margin:0 auto;">`
	for (let k of order) {
		let t = TRANSPORT_TREES[k]
		if (!t) continue
		let live = t.real && !t.self
		let badge = t.self ? "⌂" : (live ? "⟡" : "∅")
		let subtitle = t.self ? "you are here"
			: live ? "full game"
			: "no separate source"
		html += `
		<div class="tp-transport-btn" data-transport="${k}" title="${t.name}${t.repo ? "\n" + t.repo : ""}" style="
			width:168px; box-sizing:border-box; text-align:center;
			cursor:${live ? "pointer" : "default"};
			padding:8px 10px; border-radius:8px;
			border:2px solid ${t.color};
			background:${live ? "linear-gradient(135deg, " + t.color + "55, #1a0033)" : "#2a2a3d"};
			color:#fff; opacity:${live ? 1 : 0.5};
			box-shadow:${live ? "0 0 10px " + t.color + "55" : "none"};
			transition:transform .12s;">
			<div style="font-weight:700; font-size:13px;">${badge} ${t.short}</div>
			<div style="font-size:10px; color:#cbb; margin-top:2px;">${subtitle}</div>
		</div>`
	}
	html += `</div>`
	return html
}

// Delegated click handling: works with Vue-rendered HTML, no wiring needed.
document.addEventListener("click", function (e) {
	let el = e.target.closest ? e.target.closest("[data-transport]") : null
	if (!el) return
	e.preventDefault()
	e.stopPropagation()
	openTransport(el.getAttribute("data-transport"))
}, true)
