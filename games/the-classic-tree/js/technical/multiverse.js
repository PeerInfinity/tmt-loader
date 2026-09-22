// ============================================================================
//  MULTIVERSE  (js/technical/multiverse.js)
// ============================================================================
//  Turns the Universe (U) layer's transport buttons into a full multiverse
//  switcher. Three pieces live here:
//
//  1) THE BRIDGE — every vendored tree in trees/ saves to *this origin's*
//     localStorage under its own cpt_* key (we created those keys; see
//     trees/README.md). So the hub can read the REAL game's save and digest it.
//     That is what makes playing the other trees worth doing: their genuine
//     progress feeds the Universe effect instead of being pure sightseeing.
//
//  2) THE SWITCHER — one widget, three view modes:
//       scan  : live dashboard of all 11 sourced realms, zero extra engines
//       reel  : one iframe, auto-cycling through every tree
//       swarm : a grid of live trees, IntersectionObserver-gated and capped
//     plus Σ ALL, which is swarm with the cap lifted on purpose.
//
//  3) HARD CUT — park the hub (opacity 0, no pointer events: still ticking,
//     still saving) and give the whole viewport to the other tree. The ◀ RETURN
//     pill lives *inside* that tree's document, but it gets there by injection:
//     every frame is same-origin, so the hub appends the pill to the child's
//     documentElement and keeps the click handler in its own closure. Nothing
//     in trees/ is modified, so the snapshots stay pristine and updatable.
//
//  Everything is defensive on purpose. Foreign saves have a dozen shapes and
//  are untrusted data: a throw while decoding must degrade to "no signal" and
//  must never reach the 50 ms game loop.
//
//  RENDERING RULE (this is the part that bites): the hub widget is raw-html, so
//  Vue re-evaluates its function every tick. Therefore the hub widget never
//  hosts iframes — all live frames belong to #mvRoot, and data refreshes must
//  not rewrite containers. Iframes are only ever appended/removed individually.
// ============================================================================

var MULTIVERSE = {
	// realms the hub can read real saves for. `probe` lists preferred paths in
	// the foreign player object; anything else is found by the generic sweep.
	REALMS: [
		{ key: "classic", label: "Classic 1.0", save: "cpt_classic",
			probe: ["points", "p.points", "b.points", "g.points", "m.points", "t.points", "w.points", "h.points"] },
		{ key: "rewritten", label: "PT: Rewritten", save: "cpt_rewritten",
			probe: ["points", "p.points", "prestige.points"] },
		{ key: "ng", label: "PT: Rewritten NG+", save: "cpt_ng",
			probe: ["points", "p.points", "prestige.points"] },
		{ key: "demo", label: "TMT Demo", save: "cpt_demo",
			probe: ["points", "a.points", "c.points", "f.points"] },
		{ key: "incrementverse", label: "Incrementreeverse", save: "cpt_incrementreeverse",
			probe: ["points"] },
		{ key: "basic", label: "The Basic Tree", save: "cpt_basic",
			probe: ["points", "d.points"] },
		{ key: "miletree", label: "Milestone Tree", save: "cpt_miletree",
			probe: ["points", "m.points", "prestige.points"] },
		{ key: "dimensions", label: "PT: Dimensions", save: "cpt_dimensions",
			probe: ["points", "p.points"] },
		{ key: "particles", label: "Particle Tree", save: "cpt_particles",
			probe: ["points", "e.points"], packed: true },
		{ key: "pro", label: "The Pro Tree", save: "cpt_pro",
			probe: ["points"] },
		{ key: "dice", label: "The Dice Tree", save: "cpt_dice",
			probe: ["points"] },
	],

	mode: "scan",
	open: false,
	cut: false,          // hard cut: park the hub instead of overlaying it
	maxLive: 4,          // concurrent live trees in swarm mode
	automatic: true,     // auto-mount frames in view; "halt all" clears this
	allArmed: false,
	TTL: 4000,           // ms between save scans
	realms: [],          // last scan results
	checkedAt: 0,
	frames: {},          // key -> { el, state, cell }
	reel: { on: false, i: 0, ms: 9000, timer: null, key: null },
	version: 0,          // bump on data change (safe to repaint)
	structVersion: 0,    // bump on layout change (repaints containers)
	_html: null,
	_htmlKey: "",
	bonusCache: null,
	error: null,
}

// ---------------------------------------------------------------------------
//  1. THE BRIDGE
// ---------------------------------------------------------------------------

// Numbers in these saves are strings, because break_eternity's toJSON() emits
// "1e1234" (legacy trees store {mantissa,exponent}). Values like "1e1e11" blow
// straight past Number(), so we parse to log10 — the only magnitude we need.
// Returns log10(value), floored at 0, hard-capped at 1e15.
function mvLog10(v) {
	if (v === null || v === undefined || v === "") return 0
	if (typeof v === "boolean") return 0

	if (typeof v === "number") {
		if (isNaN(v)) return 0
		if (v === Infinity) return 1e15
		return v > 1 ? Math.log10(v) : 0
	}

	if (typeof v === "object") {
		if (typeof v.mantissa === "number" && typeof v.exponent === "number") {
			if (v.mantissa <= 0) return 0
			if (v.exponent === Infinity) return 1e15
			if (!isFinite(v.exponent)) return 0
			return Math.max(0, v.exponent + Math.log10(v.mantissa))
		}
		if (typeof v.mag === "number" && typeof v.layer === "number") {
			if (v.sign <= 0) return 0
			if (v.layer === 0) return v.mag > 1 ? Math.log10(v.mag) : 0
			if (v.layer === 1) return isFinite(v.mag) ? Math.max(0, v.mag) : 1e15
			return 1e15
		}
		return 0
	}

	var s = String(v).trim()
	if (!s) return 0
	var m = /^(-?\.?\d+(?:\.\d+)?)(?:e(-?\d+(?:\.\d+)?)(?:e(-?\d+(?:\.\d+)?))?)?$/i.exec(s)
	if (!m) {
		var n = Number(s)
		if (isFinite(n)) return n > 1 ? Math.log10(n) : 0
		return /e\d/i.test(s) ? 1e15 : 0 // sci-ish but unparseable: huge, capped
	}
	var mant = Number(m[1])
	if (!(mant > 0)) return 0
	var exp = 0
	if (m[2] !== undefined) {
		exp = Number(m[2])
		if (m[3] !== undefined) {
			var nest = Number(m[3])
			exp = isFinite(nest) ? exp * Math.pow(10, Math.min(nest, 15)) : 1e15
		}
	}
	var out = exp + Math.log10(mant)
	if (!isFinite(out) || out > 1e15) return 1e15
	return out > 0 ? out : 0
}

function mvB64ToText(b64) {
	var bin = atob(b64.replace(/[\s"']/g, ""))
	var bytes = new Uint8Array(bin.length)
	for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
	// UTF-8 covers both btoa(JSON.stringify(x)) and btoa(unescape(encodeURIComponent(JSON.stringify(x)))).
	// The CJK trees (pro/dice/miletree) need it; the ASCII ones are unaffected.
	try {
		return new TextDecoder("utf-8").decode(bytes)
	} catch (e) {
		return bin
	}
}

// The Particle Increment Tree packs with pako (zlib) + markers + a base64
// mangle. Reversing it needs DecompressionStream, so this one is async.
function mvUnpackPIT(raw) {
	var START = "PITSaveFile", END = "EndOfSaveFile"
	if (typeof raw !== "string" || raw.indexOf(START) !== 0 || raw.slice(-END.length) !== END) return null
	if (typeof DecompressionStream === "undefined" || typeof Response === "undefined") return null
	var s = raw.slice(START.length, raw.length - END.length)
	// undo in reverse encode order: strip pad was first, then 0→0a, +→0b, /→0c
	s = s.replace(/0c/g, "/").replace(/0b/g, "+").replace(/0a/g, "0")
	while (s.length % 4) s += "="
	try {
		var bin = atob(s)
		var bytes = new Uint8Array(bin.length)
		for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
		var ds = new DecompressionStream("deflate")
		return new Response(new Blob([bytes]).stream().pipeThrough(ds)).text()
	} catch (e) {
		return null
	}
}

// PT: Rewritten and NG+ persist every named slot: { set:"default", default:{...player} }
function mvUnwrap(obj) {
	if (!obj || typeof obj !== "object") return null
	if (obj.player && typeof obj.player === "object") return obj.player
	if (typeof obj.set === "string" && obj[obj.set] && typeof obj[obj.set] === "object") return obj[obj.set]
	if (obj.points !== undefined || obj.tab !== undefined) return obj
	for (var k in obj) {
		var v = obj[k]
		if (v && typeof v === "object" && !Array.isArray(v) && (v.points !== undefined || v.tab !== undefined)) return v
	}
	return obj
}

function mvDecode(raw) {
	if (typeof raw !== "string" || !raw) return null
	var text = null
	try { text = mvB64ToText(raw) } catch (e) { text = null } // atob throws on a non-base64 save
	if (text !== null) {
		try {
			var o = JSON.parse(text)
			if (o && typeof o === "object") return o
		} catch (e) { /* fell through */ }
	}
	// Not base64 at all (or a lenient decoder produced garbage): raw JSON save.
	try {
		var direct = JSON.parse(raw)
		return direct && typeof direct === "object" ? direct : null
	} catch (e) {
		return null
	}
}

// "How far did they actually get?" — schema-free on purpose: 11 games, 11
// shapes. Probe the known paths, then sweep layer-ish objects.
function mvDigest(player, probe) {
	var out = { log: 0, path: null, layers: 0, upgrades: 0, milestones: 0 }
	if (!player || typeof player !== "object") return out

	var read = function (path) {
		var cur = player
		var parts = path.split(".")
		for (var i = 0; i < parts.length; i++) {
			if (!cur || typeof cur !== "object") return undefined
			cur = cur[parts[i]]
		}
		return cur
	}

	for (var p = 0; probe && p < probe.length; p++) {
		var lg = mvLog10(read(probe[p]))
		if (lg > out.log) { out.log = lg; out.path = probe[p] }
	}

	for (var k in player) {
		var sub = player[k]
		if (!sub || typeof sub !== "object" || Array.isArray(sub)) continue
		var sl = mvLog10(sub.points)
		if (sl > out.log) { out.log = sl; out.path = k + ".points" }
		if (sub.points !== undefined) out.layers++
		if (sub.upgrades && sub.upgrades.length) out.upgrades += sub.upgrades.length
		if (sub.milestones && sub.milestones.length) out.milestones += sub.milestones.length
	}

	if (out.log > 1e15) out.log = 1e15
	return out
}

MULTIVERSE.decode = mvDecode
MULTIVERSE.unwrap = mvUnwrap
MULTIVERSE.log10 = mvLog10
MULTIVERSE.digest = mvDigest

// A foreign save can be megabytes of JSON. Digesting one costs real main-thread
// time, so we fingerprint the stored string first (length + tail) and skip the
// parse entirely when a realm has not written since the previous scan.
MULTIVERSE._sigs = {}

function mvSig(raw) {
	if (raw == null) return "none"
	return raw.length + ":" + raw.slice(-24)
}

function mvScanSync() {
	var out = []
	for (var i = 0; i < MULTIVERSE.REALMS.length; i++) {
		var r = MULTIVERSE.REALMS[i]
		var cached = MULTIVERSE.record(r.key)
		var raw = (typeof localStorage !== "undefined" && localStorage) ? localStorage.getItem(r.save) : null
		var sig = mvSig(raw)
		if (cached && MULTIVERSE._sigs[r.key] === sig && sig !== "none") {
			// unchanged since last digest — carry the record over untouched
			out.push(cached)
			MULTIVERSE._sigs[r.key] = sig
			continue
		}
		MULTIVERSE._sigs[r.key] = sig
		var rec = { key: r.key, label: r.label, save: r.save, found: false, log: 0, layers: 0, upgrades: 0, milestones: 0, packed: !!r.packed }
		try {
			var obj = mvUnwrap(mvDecode(raw))
			if (obj) {
				var d = mvDigest(obj, r.probe)
				rec.found = d.log > 0 || d.layers > 0
				rec.log = d.log
				rec.path = d.path
				rec.layers = d.layers
				rec.upgrades = d.upgrades
				rec.milestones = d.milestones
			}
		} catch (e) {
			MULTIVERSE.error = (e && e.message) || String(e)
		}
		out.push(rec)
	}
	return out
}

// Packed saves resolve in the background so no render path waits on inflate().
var mvPackedPending = false
function mvScanPacked() {
	if (mvPackedPending || typeof DecompressionStream === "undefined") return
	var target = null
	for (var i = 0; i < MULTIVERSE.realms.length; i++) {
		if (MULTIVERSE.realms[i].packed && !MULTIVERSE.realms[i].found) { target = MULTIVERSE.REALMS[i]; break }
	}
	if (!target) return
	mvPackedPending = true
	try {
		var raw = (typeof localStorage !== "undefined" && localStorage) ? localStorage.getItem(target.save) : null
		var p = mvUnpackPIT(raw)
		if (!p || typeof p.then !== "function") { mvPackedPending = false; return }
		p.then(function (text) {
			try {
				var d = mvDigest(mvUnwrap(JSON.parse(text)), target.probe)
				var rec = MULTIVERSE.record(target.key)
				if (rec && (d.log > 0 || d.layers > 0)) {
					rec.found = true; rec.log = d.log; rec.layers = d.layers
					rec.upgrades = d.upgrades; rec.milestones = d.milestones
					MULTIVERSE.bonusCache = mvBonusFrom(MULTIVERSE.realms)
					MULTIVERSE.dirty()
				}
			} catch (e) {}
			mvPackedPending = false
		}).catch(function () { mvPackedPending = false })
	} catch (e) {
		mvPackedPending = false
	}
}

MULTIVERSE.scan = function (force) {
	var now = typeof Date !== "undefined" ? Date.now() : 0
	if (!force && now - MULTIVERSE.checkedAt < MULTIVERSE.TTL) return MULTIVERSE.realms
	MULTIVERSE.realms = mvScanSync()
	MULTIVERSE.checkedAt = now
	MULTIVERSE.bonusCache = mvBonusFrom(MULTIVERSE.realms)
	MULTIVERSE.dirty()
	mvScanPacked()
	return MULTIVERSE.realms
}

MULTIVERSE.dirty = function () {
	MULTIVERSE.version++
	MULTIVERSE._html = null
}
MULTIVERSE.restruct = function () {
	MULTIVERSE.structVersion++
	MULTIVERSE.version++
	MULTIVERSE._html = null
}

MULTIVERSE.record = function (key) {
	for (var i = 0; i < MULTIVERSE.realms.length; i++) if (MULTIVERSE.realms[i].key === key) return MULTIVERSE.realms[i]
	return null
}
MULTIVERSE.config = function (key) {
	for (var i = 0; i < MULTIVERSE.REALMS.length; i++) if (MULTIVERSE.REALMS[i].key === key) return MULTIVERSE.REALMS[i]
	return null
}

// ---------------------------------------------------------------------------
//  2. THE BONUS — real progress feeds the Universe layer
// ---------------------------------------------------------------------------
// Per realm: x(1 + 0.05*sqrt(log10 progress)), capped at x100. Sub-linear, so
// a tree you left at 1e1000 is worth ~2.6x and a "1e1e11" save can't break the
// game. Every realm with a real save counts; you do not have to be standing in it.
MULTIVERSE.REALM_CAP = 100

function mvRealmMult(log) {
	if (!(log > 0)) return 1
	// sqrt keeps "further along" worth less per decade; REALM_CAP is the hard
	// stop, so a 1e1e11 save still can't hand out more than x100 to one realm.
	var s = 1 + 0.05 * Math.sqrt(log)
	return s > MULTIVERSE.REALM_CAP ? MULTIVERSE.REALM_CAP : s
}
MULTIVERSE.realmMult = mvRealmMult

function mvBonusFrom(realms) {
	var total = 1, hit = 0
	for (var i = 0; realms && i < realms.length; i++) {
		var r = realms[i]
		if (!r.found || !(r.log > 0)) continue
		total *= mvRealmMult(r.log)
		hit++
	}
	if (typeof Decimal === "undefined") return { mult: total, hit: hit, d: null }
	return { mult: total, hit: hit, d: new Decimal(total > 1 ? total : 1) }
}

MULTIVERSE.bonus = function () {
	if (!MULTIVERSE.bonusCache) MULTIVERSE.bonusCache = mvBonusFrom(MULTIVERSE.realms)
	return MULTIVERSE.bonusCache
}

// What universe.js multiplies by: always a Decimal >= 1, never throws.
MULTIVERSE.bonusDecimal = function () {
	try {
		var b = MULTIVERSE.bonus()
		if (b && b.d && b.d.gte && b.d.gte(1)) return b.d
	} catch (e) {}
	return new Decimal(1)
}

function mvFmtLog(log) {
	if (!(log > 0)) return "—"
	if (typeof format === "function" && typeof Decimal !== "undefined") {
		try { return format(new Decimal(10).pow(Math.min(log, 1e9))) } catch (e) {}
	}
	return "1e" + Math.round(log)
}
MULTIVERSE.fmtLog = mvFmtLog

MULTIVERSE.liveCount = function () {
	var n = 0
	for (var k in MULTIVERSE.frames) if (MULTIVERSE.frames[k].state === "live") n++
	return n
}

MULTIVERSE.summaryText = function () {
	var b = MULTIVERSE.bonus()
	var live = 0
	for (var i = 0; i < MULTIVERSE.realms.length; i++) if (MULTIVERSE.realms[i].found) live++
	return "<b>" + live + "/" + MULTIVERSE.REALMS.length + "</b> realms report a real save &nbsp;•&nbsp; convergence <b>x" +
		(typeof format === "function" ? format(b.mult) : b.mult.toFixed(2)) + "</b>" +
		(MULTIVERSE.liveCount() ? " &nbsp;•&nbsp; <b>" + MULTIVERSE.liveCount() + "</b> tree" + (MULTIVERSE.liveCount() > 1 ? "s" : "") + " live" : "") +
		(MULTIVERSE.error ? ' <span style="color:#ff8899">\u26a0 ' + mvEsc(MULTIVERSE.error) + "</span>" : "")
}

// ---------------------------------------------------------------------------
//  3. STYLES
// ---------------------------------------------------------------------------
function mvInjectStyles() {
	if (typeof document === "undefined" || document.getElementById("mvStyles")) return
	var css = `
	.mv-root{max-width:920px;margin:0 auto;padding:4px 6px;font-family:'Chakra Petch',Arial,sans-serif;color:#fff}
	.mv-bar{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center;margin:4px 0 10px}
	.mv-seg{display:flex;gap:4px;border:1px solid #AA00FF55;border-radius:8px;padding:3px;background:#18002e}
	.mv-seg>div{cursor:pointer;padding:5px 12px;border-radius:6px;font-size:13px;font-weight:700;color:#c9a6ff;user-select:none}
	.mv-seg>div.on{background:linear-gradient(135deg,#AA00FF,#55009a);color:#fff;box-shadow:0 0 10px #aa00ff88}
	.mv-btn{cursor:pointer;padding:6px 12px;border-radius:8px;border:2px solid #AA00FF;color:#fff;font-weight:700;
		font-size:13px;user-select:none;background:linear-gradient(135deg,#3d0077,#1a0033);white-space:nowrap}
	.mv-btn:hover{background:linear-gradient(135deg,#6a00cc,#2a0055)}
	.mv-btn.on{border-color:#00FF7F}
	.mv-btn.mv-all{border-color:#FFD700;background:linear-gradient(135deg,#7a5c00,#1a1200);box-shadow:0 0 12px #ffd70055}
	.mv-btn.mv-all:hover{background:linear-gradient(135deg,#a8860b,#2a2000)}
	.mv-btn.mv-warn{border-color:#FF3377;background:linear-gradient(135deg,#77002a,#2a0010)}
	.mv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px}
	.mv-cell{position:relative;border:2px solid #44446a;border-radius:10px;background:#141426;overflow:hidden;
		display:flex;flex-direction:column;min-height:118px;box-sizing:border-box;padding-bottom:4px}
	.mv-cell.live{border-color:#AA00FF;box-shadow:0 0 12px #aa00ff55}
	.mv-cell.nosave{opacity:.7}
	.mv-head{display:flex;align-items:center;gap:6px;padding:6px 8px 2px;font-size:12px;font-weight:700}
	.mv-dot{width:8px;height:8px;border-radius:50%;flex:0 0 auto}
	.mv-sub{padding:0 8px 4px;font-size:10px;color:#a8a8c8;line-height:1.5}
	.mv-meter{height:4px;background:#26263c;margin:0 8px 6px;border-radius:2px;overflow:hidden}
	.mv-meter>i{display:block;height:100%;background:linear-gradient(90deg,#6a00cc,#AA00FF,#FFD700);transition:width .4s}
	.mv-foot{margin-top:auto;display:flex;gap:5px;padding:5px 8px 2px;flex-wrap:wrap}
	.mv-foot>div{cursor:pointer;font-size:11px;font-weight:700;padding:4px 8px;border-radius:6px;
		border:1px solid #ffffff33;background:#ffffff10;user-select:none}
	.mv-foot>div:hover{background:#ffffff22}
	.mv-live{position:absolute;top:5px;right:8px;font-size:9px;letter-spacing:.06em;color:#8dffb0}
	.mv-rows{display:flex;flex-direction:column;gap:3px;max-width:640px;margin:0 auto}
	.mv-row{display:flex;align-items:center;gap:8px;font-size:11px;padding:3px 6px;border-radius:6px;background:#14142699}
	.mv-row .nm{flex:0 0 128px;font-weight:700;text-align:left}
	.mv-row .sig{flex:1 1 auto;color:#a8a8c8;text-align:left}
	.mv-row .go{cursor:pointer;padding:2px 8px;border:1px solid #ffffff33;border-radius:5px;background:#ffffff10;user-select:none}
	.mv-reelwrap{position:relative;background:#000;border:2px solid #AA00FF;border-radius:10px;overflow:hidden}
	.mv-reelwrap iframe{display:block;width:100%;height:66vh;border:0;background:#000}
	.mv-strip{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin:6px 0}
	.mv-strip>div{cursor:pointer;font-size:10px;padding:3px 7px;border-radius:999px;border:1px solid #ffffff22;color:#cbb;user-select:none}
	.mv-strip>div.on{border-color:#FFD700;color:#fff;background:#3d3200}
	.mv-swarm{display:grid;grid-template-columns:repeat(auto-fill,minmax(430px,1fr));gap:8px;max-height:76vh;
		overflow:auto;padding:4px;background:#0a0a14;border:1px solid #2a2a44;border-radius:10px}
	.mv-frame{position:relative;padding-top:56.25%;background:#000;border:1px solid #33335a;border-radius:8px;overflow:hidden}
	.mv-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0;background:#000}
	.mv-poster{position:absolute;inset:0;display:flex;flex-direction:column;gap:6px;align-items:center;
		justify-content:center;background:repeating-linear-gradient(45deg,#12121f,#12121f 10px,#15152a 10px,#15152a 20px);
		font-size:12px;color:#9a9ac0;text-align:center;padding:10px;box-sizing:border-box}
	.mv-poster>div{cursor:pointer;padding:4px 10px;border:1px solid #AA00FF;border-radius:6px;color:#fff}
	.mv-note{font-size:10px;color:#8a8ab0;text-align:center;margin-top:8px;line-height:1.5}
	#mvRoot{position:fixed;inset:0;z-index:99997;display:none;flex-direction:column;background:#05050c}
	#mvRoot.mv-open{display:flex}
	#mvTop{flex:0 0 auto;display:flex;align-items:center;gap:8px;padding:6px 10px;min-height:44px;flex-wrap:wrap;
		background:linear-gradient(90deg,#14002b,#2a0055 45%,#14002b);border-bottom:2px solid #AA00FF;
		box-shadow:0 0 18px rgba(170,0,255,.55)}
	#mvTop .mv-spacer{flex:1 1 auto}
	#mvTopStatus{font-size:11px;color:#c9a6ff}
	#mvBody{flex:1 1 auto;overflow:auto;padding:10px}
	/* parked hub: invisible and unclickable, but still laid out, ticking, saving */
	.cpt-parked{opacity:0!important;pointer-events:none!important}
	`
	var el = document.createElement("style")
	el.id = "mvStyles"
	el.textContent = css
	document.head.appendChild(el)
}

function mvEsc(s) {
	return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function mvTree(key) {
	return (typeof TRANSPORT_TREES !== "undefined" && TRANSPORT_TREES[key]) || null
}
MULTIVERSE.tree = mvTree

function mvRealmLabel(key) {
	var t = mvTree(key)
	if (t && t.short) return t.short
	var c = MULTIVERSE.config(key)
	return c ? c.label : key
}

// ---------------------------------------------------------------------------
//  4. THE HUB WIDGET (never hosts iframes — see the rendering rule up top)
// ---------------------------------------------------------------------------
function multiverseSwitcherHTML() {
	if (typeof document === "undefined") return ""
	// Memoized: the hub re-evaluates this every 50 ms tick, and Vue skips the DOM
	// patch only when the string is identical, so version is the sole trigger.
	var key = [MULTIVERSE.version, MULTIVERSE.cut, MULTIVERSE.maxLive, MULTIVERSE.mode].join("|")
	if (MULTIVERSE._htmlKey === key && MULTIVERSE._html !== null) return MULTIVERSE._html

	var b = MULTIVERSE.bonus()
	var h = '<div class="mv-root">'
	h += '<div class="mv-bar">' +
		'<div class="mv-seg">' +
			'<div data-mv="open:scan" class="' + (MULTIVERSE.open && MULTIVERSE.mode === "scan" ? "on" : "") + '">◫ scan</div>' +
			'<div data-mv="open:reel" class="' + (MULTIVERSE.open && MULTIVERSE.mode === "reel" ? "on" : "") + '">⟳ reel</div>' +
			'<div data-mv="open:swarm" class="' + (MULTIVERSE.open && MULTIVERSE.mode === "swarm" ? "on" : "") + '">⛁ swarm</div>' +
		"</div>" +
		'<div class="mv-btn mv-all" data-mv="all">Σ ALL</div>' +
		'<div class="mv-btn' + (MULTIVERSE.cut ? " on" : "") + '" data-mv="cut">' + (MULTIVERSE.cut ? "☖ hard cut: ON" : "☐ hard cut: off") + "</div>" +
		'<div class="mv-btn" data-mv="rescan">↻ rescan</div>' +
	"</div>"
	h += '<div style="text-align:center;font-size:11px;color:#cbb;margin:2px 0 6px">' + MULTIVERSE.summaryText() +
		(b.hit ? " — fed by <b>" + b.hit + "</b> realm" + (b.hit > 1 ? "s" : "") : " — enter a realm to open a channel") + "</div>"

	h += '<div class="mv-rows">'
	for (var i = 0; i < MULTIVERSE.realms.length; i++) {
		var r = MULTIVERSE.realms[i]
		var t = mvTree(r.key) || {}
		h += '<div class="mv-row' + (r.found ? "" : " nosave") + '">' +
			'<span class="mv-dot" style="background:' + (t.color || "#888") + '"></span>' +
			'<span class="nm">' + mvEsc(mvRealmLabel(r.key)) + "</span>" +
			'<span class="sig">' + (r.found
				? "real save • " + mvFmtLog(r.log) + (r.upgrades ? " • " + r.upgrades + " upgrades" : "") +
					" • boost x" + mvRealmMult(r.log).toFixed(2)
				: (r.packed ? "packed save — unreadable on this browser" : "no save on this origin")) + "</span>" +
			'<span class="go" data-mv="enter:' + r.key + '">⟡ teleport</span>' +
			'<span class="go" data-mv="reel:' + r.key + '">▶</span>' +
			"</div>"
	}
	h += "</div>"
	h += '<div class="mv-note">Scan reads each bundled game’s own save from this origin — it costs nothing and starts no engines. ' +
		"It shows that tree's last autosave, not a live feed. <b>▶</b> drops it into the reel.</div>"
	h += "</div>"

	MULTIVERSE._htmlKey = key
	MULTIVERSE._html = h
	return h
}

// One-line entry for the transport terminal block on the U hub tab.
function multiverseTerminalHTML() {
	if (typeof document === "undefined") return ""
	var h = '<div class="mv-root" style="max-width:760px"><div class="mv-bar">' +
		'<div class="mv-btn" data-mv="open:scan">⛁ UNIVERSE SWITCHER</div>' +
		'<div class="mv-btn mv-all" data-mv="all">Σ ALL REALMS</div>' +
		'<div style="font-size:11px;color:#cbb">' + MULTIVERSE.summaryText() + "</div>" +
		"</div></div>"
	return h
}

// ---------------------------------------------------------------------------
//  5. FULL-SCREEN SWITCHER + HARD CUT
// ---------------------------------------------------------------------------
function mvBoot() {
	if (typeof document === "undefined" || document.getElementById("mvRoot")) return
	mvInjectStyles()
	var root = document.createElement("div")
	root.id = "mvRoot"
	root.innerHTML =
		'<div id="mvTop">' +
			'<div class="mv-btn mv-warn" data-mv="close">◀ RETURN TO CLASSIC+</div>' +
			'<div class="mv-seg">' +
				'<div data-mv="mode:scan">◫ scan</div>' +
				'<div data-mv="mode:reel">⟳ reel</div>' +
				'<div data-mv="mode:swarm">⛁ swarm</div>' +
			"</div>" +
			'<div class="mv-btn mv-all" data-mv="all">Σ ALL</div>' +
			'<div class="mv-btn" data-mv="rescan">↻</div>' +
			'<div class="mv-spacer"></div>' +
			'<div id="mvTopStatus"></div>' +
		"</div>" +
		'<div id="mvBody"></div>'
	document.body.appendChild(root)
	window.addEventListener("keydown", mvKeyHandler)
}

function mvKeyHandler(e) {
	if (e && e.key === "Escape" && MULTIVERSE.open) {
		e.preventDefault()
		mvClose()
	}
}

// What a hard cut hides. Deliberately NOT #app: the popup container and the
// particle layer live in there too, and you still want to be able to read a
// "Mass Transport" warning while parked. Park the game panels instead.
// opacity, NOT display:none — TMT's updateWidth()/resizeCanvas() and the
// scrolled check read live geometry, and a collapsed layout feeds them zeros.
MULTIVERSE.PARK_SEL = ["#treeTab", "#treeOverlay", "#treeCanvas", "#optionWheel", ".particle-container"]

MULTIVERSE.parkedEls = function () {
	if (typeof document === "undefined") return []
	var out = []
	for (var i = 0; i < MULTIVERSE.PARK_SEL.length; i++) {
		var list = document.querySelectorAll(MULTIVERSE.PARK_SEL[i])
		for (var j = 0; j < list.length; j++) out.push(list[j])
	}
	if (!out.length) {
		var app = document.getElementById("app")
		if (app) out.push(app) // unfamiliar layout: fall back to the whole root
	}
	return out
}

MULTIVERSE.park = function (on) {
	var els = MULTIVERSE.parkedEls()
	for (var i = 0; i < els.length; i++) {
		if (els[i].classList) els[i].classList[on ? "add" : "remove"]("cpt-parked")
	}
}
MULTIVERSE.isParked = function () {
	var els = MULTIVERSE.parkedEls()
	return !!(els.length && els[0].classList && els[0].classList.contains("cpt-parked"))
}

function mvOpen(mode) {
	if (typeof document === "undefined") return
	mvBoot()
	// Switching modes must not leave the previous mode's trees running.
	if (MULTIVERSE.open && mode && mode !== MULTIVERSE.mode) mvHalt()
	if (mode) MULTIVERSE.mode = mode
	MULTIVERSE.open = true
	MULTIVERSE.automatic = true
	if (MULTIVERSE.mode === "reel") mvReelInit()
	MULTIVERSE.scan(true)
	var root = document.getElementById("mvRoot")
	if (root) root.classList.add("mv-open")
	MULTIVERSE.park(MULTIVERSE.cut)
	MULTIVERSE.restruct()
	mvRender(true)
	if (MULTIVERSE.mode === "swarm") { mvObserveCells(); mvMountVisible() }
	if (MULTIVERSE.mode === "reel") { mvReelEnsure(); mvReelStartIfDue() }
}

function mvClose() {
	MULTIVERSE.open = false
	MULTIVERSE.reel.on = false
	if (MULTIVERSE.reel.timer) { clearInterval(MULTIVERSE.reel.timer); MULTIVERSE.reel.timer = null }
	mvHalt()
	MULTIVERSE.park(false)
	var root = document.getElementById("mvRoot")
	if (root) root.classList.remove("mv-open")
	MULTIVERSE.dirty()
}

function mvBodySig() {
	// Structural repaints only: never include a scan refresh here, or mounted
	// iframes get destroyed twice a second. Scan mode has no iframes, so there
	// version is allowed to force a repaint.
	var base = [MULTIVERSE.mode, MULTIVERSE.maxLive, MULTIVERSE.reel.key, MULTIVERSE.allArmed].join(":")
	return MULTIVERSE.mode === "scan" ? base + ":" + MULTIVERSE.version : base + ":" + MULTIVERSE.structVersion
}

function mvScanGridHTML() {
	var h = '<div class="mv-bar"><div class="mv-btn" data-mv="reel:play">' + (MULTIVERSE.reel.on ? "⏸ reel running" : "▶ reel through all") + "</div></div>"
	h += '<div class="mv-grid" id="mvScanGrid">'
	for (var i = 0; i < MULTIVERSE.realms.length; i++) {
		var r = MULTIVERSE.realms[i]
		var t = mvTree(r.key) || {}
		var live = !!MULTIVERSE.frames[r.key]
		var pct = r.log > 0 ? Math.min(100, Math.round((Math.min(r.log, 40) / 40) * 100)) : 0
		h += '<div class="mv-cell' + (live ? " live" : "") + (r.found ? "" : " nosave") + '">' +
			'<div class="mv-head"><span class="mv-dot" style="background:' + (t.color || "#888") + '"></span>' + mvEsc(mvRealmLabel(r.key)) + "</div>" +
			'<div class="mv-sub">' + (r.found
				? mvFmtLog(r.log) + " progress" + (r.layers ? " • " + r.layers + " layers" : "") + (r.upgrades ? " • " + r.upgrades + " upgrades" : "")
				: "no save on this origin") + "</div>" +
			'<div class="mv-meter"><i style="width:' + pct + '%"></i></div>' +
			'<div class="mv-foot">' +
				'<div data-mv="enter:' + r.key + '">⟡ teleport</div>' +
				'<div data-mv="reel:' + r.key + '">▶ reel</div>' +
				'<div data-mv="tab:' + r.key + '">hub tab</div>' +
			"</div></div>"
	}
	h += "</div>"
	h += '<div class="mv-note">' + MULTIVERSE.summaryText() + '</div>'
	return h
}

function mvReelHTML() {
	var order = MULTIVERSE.REALMS.map(function (r) { return r.key })
	var cur = MULTIVERSE.reel.key || order[0]
	var t = mvTree(cur) || {}
	var h = '<div class="mv-strip">'
	for (var i = 0; i < order.length; i++) {
		h += '<div data-mv="reel:' + order[i] + '"' + (order[i] === cur ? ' class="on"' : "") + ">" +
			(MULTIVERSE.reel.on && i === MULTIVERSE.reel.i ? "▶ " : "") + mvEsc(mvRealmLabel(order[i])) + "</div>"
	}
	h += "</div>"
	h += '<div class="mv-reelwrap"><iframe id="mvReelFrame" title="Reel"></iframe></div>'
	h += '<div class="mv-bar">' +
		'<div class="mv-btn" data-mv="reel:prev">⏮</div>' +
		'<div class="mv-btn" data-mv="reel:play">' + (MULTIVERSE.reel.on ? "⏸ pause" : "▶ auto-cycle") + "</div>" +
		'<div class="mv-btn" data-mv="reel:next">⏭</div>' +
		'<div class="mv-btn" data-mv="reel:speed">' + Math.round(MULTIVERSE.reel.ms / 1000) + "s / realm</div>" +
		'<div class="mv-btn" data-mv="flush">💾 save tree</div>' +
	"</div>"
	h += '<div class="mv-note">Running <b>' + mvEsc(t.name || cur) + "</b> — one tree at a time. Cycling flushes the outgoing " +
		"tree’s save first, so nothing is lost between realms.</div>"
	return h
}

function mvSwarmHTML() {
	var order = MULTIVERSE.REALMS.map(function (r) { return r.key })
	var cap = MULTIVERSE.maxLive
	var h = '<div class="mv-bar">' +
		'<div class="mv-btn mv-all" data-mv="all">' + (MULTIVERSE.allArmed ? "⚠ CONFIRM: MOUNT ALL " + order.length : "Σ ALL — mount every tree") + "</div>" +
		'<div class="mv-btn" data-mv="cap:up">cap ' + (cap === Infinity ? "∞" : cap) + " ▲</div>" +
		'<div class="mv-btn" data-mv="cap:down">cap ▼</div>' +
		'<div class="mv-btn" data-mv="flush">💾 save trees</div>' +
		'<div class="mv-btn mv-warn" data-mv="halt">◼ halt all</div>' +
	"</div>"
	h += '<div class="mv-swarm" id="mvSwarmGrid">'
	for (var i = 0; i < order.length; i++) {
		var k = order[i]
		h += '<div class="mv-frame" data-mvcell="' + k + '" id="mvCell_' + k + '">' +
			'<div class="mv-poster">' + mvEsc(mvRealmLabel(k)) +
			"<div data-mv=\"wake:" + k + "\">wake</div></div></div>"
	}
	h += "</div>"
	h += '<div class="mv-note">Every frame in view is a <b>full second instance of that game</b>: its own Vue app and its own ' +
		"50&nbsp;ms loop. <b>cap</b> is how many stay mounted; anything scrolled far out of view is flushed and unloaded. " +
		"Σ ALL lifts the cap — 11 engines on the thread that also runs Classic+.</div>"
	return h
}

// A container rewrite destroys every iframe inside it, and re-inserting an
// iframe elsewhere in the same document reloads it — so live frames cannot be
// carried across a structural repaint. Flush them and drop the records, or the
// stale entries would make those realms look mounted while nothing is on screen.
function mvAbandonFrames() {
	var keys = Object.keys(MULTIVERSE.frames)
	if (!keys.length) return
	for (var i = 0; i < keys.length; i++) mvFlushChild(MULTIVERSE.frames[keys[i]].el)
	MULTIVERSE.frames = {}
}

function mvRender(force) {
	if (typeof document === "undefined") return
	var body = document.getElementById("mvBody")
	if (!body) return
	var sig = mvBodySig()
	if (force || body.getAttribute("data-sig") !== sig) {
		mvAbandonFrames()
		body.innerHTML = '<div class="mv-root">' +
			(MULTIVERSE.mode === "reel" ? mvReelHTML() : MULTIVERSE.mode === "swarm" ? mvSwarmHTML() : mvScanGridHTML()) +
			"</div>"
		body.setAttribute("data-sig", sig)
		if (MULTIVERSE.mode === "swarm") { mvObserveCells(); mvMountVisible() }
		if (MULTIVERSE.mode === "reel") mvReelEnsure()
	}
	mvRenderStatus()
}

function mvRenderStatus() {
	if (typeof document === "undefined") return
	var st = document.getElementById("mvTopStatus")
	if (st) st.innerHTML = MULTIVERSE.summaryText() + " • " + MULTIVERSE.mode
}

// keep the open switcher's numbers fresh without ever repainting iframes
if (typeof setInterval !== "undefined") {
	setInterval(function () {
		if (typeof document === "undefined" || !MULTIVERSE.open) return
		MULTIVERSE.scan(false)
		if (MULTIVERSE.mode === "scan") mvRender()
		else mvRenderStatus()
	}, 2500)
	// warm the hub readout + the bonus even while the switcher is closed. This is
	// a fingerprint check, not a parse, so 12s is plenty for a background tick.
	setInterval(function () {
		if (typeof document === "undefined") return
		MULTIVERSE.checkedAt = 0
		MULTIVERSE.scan(true)
	}, 12000)

	// coming back to the tab (or to the hub from a tree) refreshes immediately
	document.addEventListener("visibilitychange", function () {
		if (document.visibilityState === "visible") MULTIVERSE.scan(true)
	})
}

// ---------------------------------------------------------------------------
//  6. FRAME LIFECYCLE
// ---------------------------------------------------------------------------
function mvFrameSrc(key) {
	var t = mvTree(key)
	if (!t || !t.url) return "about:blank"
	// No query params: the child needs no idea it is embedded, the hub drives
	// it from outside. A cache-buster is added only on explicit reload.
	return t.url
}
MULTIVERSE.frameSrc = mvFrameSrc

// ---------------------------------------------------------------------------
//  6b. CROSS-FRAME DRESSING — same-origin, so the hub reaches into the tree
// ---------------------------------------------------------------------------
// Puts a ◀ RETURN pill inside the other game's own document. Appended to
// documentElement rather than body: Vue owns #app and body can be rewritten by
// a tree's own boot code, while <html> children outside the app subtree are
// left alone. Re-run on every load, because a reload gives us a fresh document.
var MV_PILL_CSS =
	"#cptReturnPill{position:fixed;left:12px;bottom:12px;z-index:2147483000;" +
	"display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none;" +
	"padding:8px 14px;border-radius:999px;background:#77002a;border:2px solid #FF3377;" +
	"color:#fff;font:700 13px/1.2 system-ui,'Segoe UI',Arial,sans-serif;" +
	"box-shadow:0 0 14px rgba(255,51,119,.7);opacity:.93}" +
	"#cptReturnPill:hover{transform:translateY(-1px);opacity:1}" +
	"#cptReturnPill .k{opacity:.7;font-weight:500;border-left:1px solid #ffffff44;padding-left:6px}" +
	"#cptReturnHint{position:fixed;left:12px;bottom:46px;z-index:2147483000;color:#ffb8cf;" +
	"font:500 11px/1.4 system-ui,Arial,sans-serif;text-shadow:0 1px 2px #000;opacity:0;" +
	"transition:opacity .35s;pointer-events:none}"

function mvDressFrame(iframe, opts) {
	opts = opts || {}
	var dress = function () {
		var doc = null
		try { doc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document) } catch (e) { return }
		if (!doc || !doc.documentElement) return
		if (opts.onLoad) { try { opts.onLoad() } catch (e) {} }
		if (doc.getElementById("cptReturnPill")) return
		try {
			var st = doc.createElement("style")
			st.id = "cptReturnStyles"
			st.textContent = MV_PILL_CSS
			doc.documentElement.appendChild(st)

			var pill = doc.createElement("div")
			pill.id = "cptReturnPill"
			pill.title = opts.title || "Return to The Classic+ Tree (Esc also works)"
			pill.innerHTML = '<span>◀ ' + mvEsc(opts.label || "RETURN TO CLASSIC+") + '</span><span class="k">Esc</span>'
			pill.onclick = function (e) { if (e && e.preventDefault) e.preventDefault(); if (opts.onReturn) opts.onReturn() }
			doc.documentElement.appendChild(pill)

			if (opts.hint) {
				var hint = doc.createElement("div")
				hint.id = "cptReturnHint"
				hint.textContent = opts.hint
				doc.documentElement.appendChild(hint)
				setTimeout(function () { hint.style.opacity = ".9" }, 500)
				setTimeout(function () { hint.style.opacity = "0" }, 6000)
			}
		} catch (e) {
			// Cross-origin or mid-navigation. The hub's own bar/pill/Esc still work.
		}
	}
	dress()
	iframe.addEventListener("load", dress)
}
MULTIVERSE.dressFrame = mvDressFrame

// Flush a tree's own save. Same-origin, so this is a direct call rather than a
// message: every bundled game exposes a global save() (verified for all 11),
// and PT: Rewritten's takes a default slot name.
function mvFlushChild(iframe) {
	try {
		var w = iframe && iframe.contentWindow
		if (!w) return false
		if (typeof w.save === "function") { w.save(); return true }
		if (typeof w.setLocalStorage === "function") { w.setLocalStorage(); return true }
	} catch (e) {}
	return false
}
MULTIVERSE.flushChild = mvFlushChild

// Esc inside the frame: the hub already hooks keydown on the child window, but
// a tree that stops propagation would eat it, so mirror the pill onto the key.
function mvBindEsc(iframe, onReturn) {
	try {
		var w = iframe.contentWindow
		if (!w || !w.addEventListener) return
		if (w.__cptEscBound) return
		w.__cptEscBound = true
		w.addEventListener("keydown", function (e) {
			if (e && e.key === "Escape") { e.preventDefault(); onReturn() }
		})
	} catch (e) {}
}

function mvMount(key) {
	if (typeof document === "undefined") return
	var t = mvTree(key)
	if (!t || !t.url) return
	var cell = document.getElementById("mvCell_" + key)
	if (!cell || (MULTIVERSE.frames[key] && MULTIVERSE.frames[key].el)) return
	var f = document.createElement("iframe")
	f.title = t.name || key
	f.setAttribute("allow", "autoplay; fullscreen")
	var poster = cell.querySelector(".mv-poster")
	if (poster) poster.style.display = "none"
	cell.appendChild(f)
	var rec = { el: f, state: "booting", cell: cell }
	MULTIVERSE.frames[key] = rec
	mvDressFrame(f, {
		label: "RETURN — " + mvRealmLabel(key),
		hint: "This tree is running inside the Classic+ multiverse. Your hub keeps ticking behind it.",
		onReturn: function () { mvUnmount(key); MULTIVERSE.scan(true) },
		onLoad: function () { rec.state = "live"; if (cell.classList) cell.classList.add("live"); mvBindEsc(f, function () { mvUnmount(key) }); mvRenderStatus() },
	})
	f.src = mvFrameSrc(key)
	mvRenderStatus()
}

function mvUnmount(key) {
	var fr = MULTIVERSE.frames[key]
	if (!fr) return
	delete MULTIVERSE.frames[key]
	var done = function () {
		try {
			fr.el.src = "about:blank"
			if (fr.el.parentNode) fr.el.parentNode.removeChild(fr.el)
			if (fr.cell) {
				var poster = fr.cell.querySelector(".mv-poster")
				if (poster) poster.style.display = ""
			}
			if (fr.cell && fr.cell.classList) fr.cell.classList.remove("live")
		} catch (e) {}
		delete MULTIVERSE.frames[key]
		MULTIVERSE.dirty()
		mvRenderStatus()
	}
	delete MULTIVERSE.frames[key]
	// Save first (synchronous, same-origin), then unload one beat later so the
	// write definitely lands before the document goes away.
	mvFlushChild(fr.el)
	setTimeout(done, 60)
}

function mvHalt() {
	// halt means halt: no auto-remount until the user wakes something or
	// switches mode. Otherwise a render that re-observes the grid would put
	// every frame straight back.
	MULTIVERSE.automatic = false
	for (var k in MULTIVERSE.frames) mvUnmount(k)
	MULTIVERSE.frames = {}
}

function mvEnforceCap() {
	var cap = MULTIVERSE.maxLive
	if (cap === Infinity) return
	var keys = Object.keys(MULTIVERSE.frames)
	if (keys.length <= cap) return
	for (var i = 0; i < keys.length - cap; i++) mvUnmount(keys[i])
}

var mvIO = null
function mvObserveCells() {
	if (typeof document === "undefined") return
	if (typeof IntersectionObserver === "undefined") { mvMountVisible(); return }
	if (mvIO) { try { mvIO.disconnect() } catch (e) {} }
	mvIO = new IntersectionObserver(function (entries) {
		for (var i = 0; i < entries.length; i++) {
			var en = entries[i]
			var key = en.target.getAttribute("data-mvcell")
			if (!key) continue
			if (en.isIntersecting) {
				if (MULTIVERSE.maxLive === Infinity || MULTIVERSE.liveCount() < MULTIVERSE.maxLive) mvMount(key)
			} else if (MULTIVERSE.frames[key] && MULTIVERSE.maxLive !== Infinity && en.intersectionRatio <= 0) {
				mvUnmount(key)
			}
		}
	}, { root: document.getElementById("mvBody"), rootMargin: "260px 0px", threshold: [0, 0.35] })
	var cells = document.querySelectorAll(".mv-frame[data-mvcell]")
	for (var c = 0; c < cells.length; c++) mvIO.observe(cells[c])
}

function mvMountVisible() {
	if (!MULTIVERSE.automatic) return
	var order = MULTIVERSE.REALMS.map(function (r) { return r.key })
	for (var i = 0; i < order.length; i++) {
		if (MULTIVERSE.maxLive !== Infinity && MULTIVERSE.liveCount() >= MULTIVERSE.maxLive) break
		mvMount(order[i])
	}
}

// ---------------------------------------------------------------------------
//  7. REEL
// ---------------------------------------------------------------------------
function mvReelKeys() { return MULTIVERSE.REALMS.map(function (r) { return r.key }) }

// Set the reel's current realm before anything renders: an empty reel.key here
// would change mvBodySig() on the next tick and rebuild the frame, reloading it.
function mvReelInit() {
	var order = mvReelKeys()
	if (!order.length) return
	if (!MULTIVERSE.reel.key || mvReelKeys().indexOf(MULTIVERSE.reel.key) === -1) {
		MULTIVERSE.reel.i = Math.max(0, Math.min(order.length - 1, MULTIVERSE.reel.i || 0))
		MULTIVERSE.reel.key = order[MULTIVERSE.reel.i]
	} else {
		MULTIVERSE.reel.i = Math.max(0, order.indexOf(MULTIVERSE.reel.key))
	}
}

function mvReelEnsure() {
	var f = document.getElementById("mvReelFrame")
	if (!f) return
	mvReelInit()
	if (!f.__mvDressed) {
		f.__mvDressed = true
		mvDressFrame(f, {
			label: "RETURN TO CLASSIC+",
			hint: "Reel mode — one tree at a time. \u23ed swaps to the next realm.",
			onReturn: function () { mvFlushChild(f); mvClose() },
			onLoad: function () { mvBindEsc(f, function () { mvFlushChild(f); mvClose() }) },
		})
	}
	var want = mvFrameSrc(MULTIVERSE.reel.key)
	if (f.getAttribute("src") !== want) f.src = want
}

function mvReelGo(i) {
	var order = mvReelKeys()
	MULTIVERSE.reel.i = ((i % order.length) + order.length) % order.length
	MULTIVERSE.reel.key = order[MULTIVERSE.reel.i]
	MULTIVERSE.restruct()
	mvRender(true)
	MULTIVERSE.dirty()
}

function mvReelStep(dir) {
	mvFlushOne(null)
	mvReelGo(MULTIVERSE.reel.i + (dir || 1))
}

function mvReelPlay() {
	MULTIVERSE.reel.on = !MULTIVERSE.reel.on
	mvReelStartIfDue()
	MULTIVERSE.dirty()
	if (MULTIVERSE.open) mvRender(true)
}

function mvReelStartIfDue() {
	if (MULTIVERSE.reel.timer) { clearInterval(MULTIVERSE.reel.timer); MULTIVERSE.reel.timer = null }
	if (!MULTIVERSE.reel.on) return
	MULTIVERSE.reel.timer = setInterval(function () {
		if (!MULTIVERSE.open || !MULTIVERSE.reel.on) return
		mvReelStep(1)
	}, Math.max(2000, MULTIVERSE.reel.ms))
}

function mvReelSpeed() {
	var steps = [4000, 6000, 9000, 15000, 30000, 60000]
	MULTIVERSE.reel.ms = steps[(steps.indexOf(MULTIVERSE.reel.ms) + 1) % steps.length]
	mvReelStartIfDue()
	MULTIVERSE.dirty()
	if (MULTIVERSE.open && MULTIVERSE.mode === "reel") mvRender(true)
}

// ---------------------------------------------------------------------------
//  8. ACTIONS
// ---------------------------------------------------------------------------
function mvFlushOne(key) {
	if (typeof document === "undefined") return
	if (!key) { mvFlushChild(document.getElementById("mvReelFrame")); return }
	var fr = MULTIVERSE.frames[key]
	if (fr) mvFlushChild(fr.el)
}

function mvFlushAll() {
	mvFlushOne(null)
	for (var k in MULTIVERSE.frames) mvFlushOne(k)
	mvPopup("Flushed every mounted tree to its own save key.", "Multiverse", 2, "#00FF7F")
	setTimeout(function () { MULTIVERSE.scan(true) }, 450)
}

function mvPopup(html, title, secs, color) {
	if (typeof doPopup === "function") { try { doPopup("none", html, title, secs, color); return } catch (e) {} }
	if (typeof console !== "undefined") console.log("[multiverse] " + title + ": " + String(html).replace(/<[^>]*>/g, ""))
}

function mvEnter(key) {
	MULTIVERSE.scan(true)
	if (typeof openTransport === "function") { openTransport(key, { cut: MULTIVERSE.cut }); return }
	if (typeof window !== "undefined" && window.location) window.location.href = mvFrameSrc(key)
}

// Σ ALL. From the hub it opens the swarm and mounts everything; from the
// swarm it arms/disarms the cap lift, because 11 live engines deserves a
// second click.
function mvAll() {
	MULTIVERSE.automatic = true
	if (!MULTIVERSE.open) { mvOpen("swarm") }
	if (MULTIVERSE.mode !== "swarm") { mvHalt(); MULTIVERSE.mode = "swarm"; mvReelGo(MULTIVERSE.reel.i || 0) }
	if (MULTIVERSE.maxLive === Infinity) {
		MULTIVERSE.maxLive = 4
		MULTIVERSE.allArmed = false
		MULTIVERSE.restruct()
		mvHalt()
		mvRender(true)
		mvMountVisible()
		mvPopup("Cap restored to 4. Off-screen trees unloaded.", "Multiverse", 3, "#AA00FF")
		return
	}
	if (!MULTIVERSE.allArmed) {
		MULTIVERSE.allArmed = true
		MULTIVERSE.restruct()
		mvRender(true)
		mvPopup("<b>11 full games at once.</b><br>~11.5 MB of script, ~134k lines, 11 Vue apps and 11 timers sharing the " +
			"main thread with Classic+. Expect a hard stutter; phones will likely reload the tab.<br><br>" +
			"Press <b>Σ ALL</b> again to mount everything, or raise the cap to step up gradually.",
			"⚠ Mass Transport", 9, "#FFD700")
		setTimeout(function () {
			if (MULTIVERSE.allArmed && MULTIVERSE.maxLive !== Infinity) { MULTIVERSE.allArmed = false; MULTIVERSE.restruct(); mvRender(true) }
		}, 12000)
		return
	}
	MULTIVERSE.allArmed = false
	MULTIVERSE.maxLive = Infinity
	MULTIVERSE.restruct()
	mvRender(true)
	for (var i = 0; i < MULTIVERSE.REALMS.length; i++) mvMount(MULTIVERSE.REALMS[i].key)
	mvPopup("All realms mounted. ◀ RETURN or <b>◼ halt all</b> to get your frame rate back.", "Mass Transport", 5, "#FFD700")
}

function mvCap(delta) {
	MULTIVERSE.automatic = true
	var cur = MULTIVERSE.maxLive === Infinity ? MULTIVERSE.REALMS.length : MULTIVERSE.maxLive
	MULTIVERSE.maxLive = Math.max(1, Math.min(MULTIVERSE.REALMS.length, cur + delta))
	MULTIVERSE.allArmed = false
	MULTIVERSE.restruct()
	mvRender(true)
	mvEnforceCap()
	mvMountVisible()
}

// Ask the U layer to jump to a realm's own microtab. Best-effort: TMT keeps
// subtab state on the player object, and we must not throw if it moves.
function mvJumpMicrotab(key) {
	try {
		if (typeof player !== "undefined") {
			player.subtabs = player.subtabs || {}
			player.subtabs.u = player.subtabs.u || {}
			player.subtabs.u.universes = MULTIVERSE.config(key) ? key : "hub"
		}
		if (typeof updateTabFormats === "function") updateTabFormats()
		if (typeof needCanvasUpdate !== "undefined") needCanvasUpdate = true
	} catch (e) {}
	mvPopup("Universe tab: <b>" + mvEsc(mvRealmLabel(key)) + "</b>", "Multiverse", 2, "#AA00FF")
	MULTIVERSE.scan(true)
}

function mvAction(spec) {
	var parts = String(spec).split(":")
	var act = parts[0], arg = parts[1]
	switch (act) {
		case "open": mvOpen(arg); break
		case "close": mvClose(); break
		case "mode":
			MULTIVERSE.automatic = true
			MULTIVERSE.mode = arg
			mvHalt()
			MULTIVERSE.restruct()
			mvRender(true)
			if (arg === "swarm") { mvObserveCells(); mvMountVisible() }
			if (arg === "reel") { mvReelEnsure(); mvReelStartIfDue() }
			break
		case "cut":
			MULTIVERSE.cut = !MULTIVERSE.cut
			if (typeof TRANSPORT_OPT !== "undefined") TRANSPORT_OPT.cut = MULTIVERSE.cut
			MULTIVERSE.park(MULTIVERSE.open && MULTIVERSE.cut)
			MULTIVERSE.dirty()
			mvPopup(MULTIVERSE.cut ? "Hard cut ON — teleporting hides the hub entirely." : "Hard cut OFF — transport keeps the hub bar.", "Multiverse", 3, "#AA00FF")
			break
		case "rescan": MULTIVERSE.scan(true); MULTIVERSE.dirty(); mvRender(true); break
		case "enter": mvEnter(arg); break
		case "tab": mvJumpMicrotab(arg); break
		case "wake": MULTIVERSE.automatic = true; mvMount(arg); mvEnforceCap(); break
		case "halt": mvHalt(); mvRender(true); MULTIVERSE.dirty(); break
		case "cap": mvCap(arg === "up" ? 1 : -1); break
		case "flush": mvFlushAll(); break
		case "all": mvAll(); break
		case "reel":
			if (arg === "next") mvReelStep(1)
			else if (arg === "prev") mvReelStep(-1)
			else if (arg === "play") mvReelPlay()
			else if (arg === "speed") mvReelSpeed()
			else {
				var idx = mvReelKeys().indexOf(arg)
				if (idx >= 0) {
					MULTIVERSE.mode = "reel"
					if (!MULTIVERSE.open) mvOpen("reel")
					MULTIVERSE.restruct()
					mvReelGo(idx)
				}
			}
			break
	}
}
MULTIVERSE.action = mvAction

// ---------------------------------------------------------------------------
//  9. WIRING — delegated clicks; Vue re-renders raw-html so no inline handlers
// ---------------------------------------------------------------------------
if (typeof document !== "undefined" && document.addEventListener) {
	document.addEventListener("click", function (e) {
		var el = e.target && e.target.closest ? e.target.closest("[data-mv]") : null
		if (!el) return
		e.preventDefault()
		e.stopPropagation()
		try {
			mvAction(el.getAttribute("data-mv"))
		} catch (err) {
			MULTIVERSE.error = (err && err.message) || String(err)
			if (typeof console !== "undefined") console.warn("[multiverse]", err)
		}
	}, true)

	if (document.readyState === "complete") setTimeout(function () { MULTIVERSE.scan(true) }, 600)
	else window.addEventListener("load", function () { setTimeout(function () { MULTIVERSE.scan(true) }, 600) })
}
