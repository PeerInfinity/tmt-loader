// ************ Save stuff ************
let getModID = () => modInfo.id ?? `${modInfo.name.replace(/\s+/g, '-')}-${modInfo.author.replace(/\s+/g, '-')}`;

// ============================================================================
//  Safe Storage Fallback - localStorage with graceful degradation
//  Tries: localStorage -> sessionStorage -> in-memory
//  Why: localStorage can fail due to:
//    - Private/Incognito mode (Safari, Firefox blocks it)
//    - User blocked 3rd-party storage / disabled cookies
//    - QuotaExceededError (5-10MB full)
//    - SecurityError (sandboxed iframe)
//  Without this, `localStorage.setItem` throws and `save()` crashes,
//  wiping progress. With fallback, game keeps running and warns player.
// ============================================================================

let _fallbackStore = {};              // in-memory fallback (lost on refresh)
let _usingFallback = false;           // are we currently not using localStorage?
let _fallbackType = "localStorage";   // "localStorage" | "sessionStorage" | "memory"
let _fallbackWarned = false;
let _fallbackError = null;

function isStorageAvailable(type) {
    try {
        const storage = window[type];
        if (!storage) return false;
        const testKey = "__storage_test__";
        storage.setItem(testKey, testKey);
        storage.removeItem(testKey);
        return true;
    } catch (e) {
        return false;
    }
}

// Detect at script load if localStorage is already broken
try {
    if (!isStorageAvailable("localStorage")) {
        _usingFallback = true;
        _fallbackType = isStorageAvailable("sessionStorage") ? "sessionStorage" : "memory";
        console.warn(`[SafeStorage] localStorage unavailable at startup, using ${_fallbackType} fallback`);
    }
} catch (e) {
    _usingFallback = true;
    _fallbackType = "memory";
}

// Unified storage wrapper with same API as localStorage
let safeStorage = {
    getItem(key) {
        // If not in fallback, try localStorage first
        if (!_usingFallback) {
            try {
                if (window.localStorage) {
                    return window.localStorage.getItem(key);
                }
            } catch (e) {
                console.warn("[SafeStorage] localStorage.getItem failed, switching to fallback:", e);
                _usingFallback = true;
                _fallbackError = e;
                _fallbackType = isStorageAvailable("sessionStorage") ? "sessionStorage" : "memory";
                // try fallback immediately
                if (_fallbackType === "sessionStorage") {
                    try { return window.sessionStorage.getItem(key) ?? (_fallbackStore[key] ?? null); } catch(e2) { return _fallbackStore[key] ?? null; }
                }
                return _fallbackStore[key] ?? null;
            }
        } else {
            // Already in fallback mode — try sessionStorage then memory
            if (_fallbackType === "sessionStorage") {
                try {
                    // sessionStorage might also recover localStorage? Try localStorage one more time opportunistically
                    try {
                        if (window.localStorage) {
                            const v = window.localStorage.getItem(key);
                            // if localStorage now works and has the key, migrate back
                            if (v !== null) {
                                // localStorage recovered, switch back
                                _usingFallback = false;
                                _fallbackType = "localStorage";
                                console.log("[SafeStorage] localStorage recovered on getItem");
                                return v;
                            }
                        }
                    } catch(e) {}
                    return window.sessionStorage.getItem(key) ?? (_fallbackStore[key] ?? null);
                } catch (e) {
                    return _fallbackStore[key] ?? null;
                }
            }
            return _fallbackStore[key] ?? null;
        }
        // Fallback if window.localStorage is undefined
        return _fallbackStore[key] ?? null;
    },
    setItem(key, value) {
        // Optimistic: try localStorage even if in fallback — maybe quota was cleared
        if (_usingFallback) {
            try {
                if (window.localStorage && isStorageAvailable("localStorage")) {
                    window.localStorage.setItem(key, value);
                    // Success! Migrate back to localStorage
                    if (_fallbackType !== "localStorage") {
                        console.log("[SafeStorage] Migrated back to localStorage");
                        _usingFallback = false;
                        _fallbackType = "localStorage";
                        // Also clear fallback store copy
                        delete _fallbackStore[key];
                        try { if (window.sessionStorage) window.sessionStorage.removeItem(key); } catch(e) {}
                    }
                    return true;
                }
            } catch (e) {
                // Still failed, stay in fallback
            }
        }

        if (!_usingFallback) {
            try {
                if (!window.localStorage) throw new Error("localStorage is undefined");
                window.localStorage.setItem(key, value);
                return true;
            } catch (e) {
                console.warn("[SafeStorage] localStorage.setItem failed, switching to fallback:", e);
                _usingFallback = true;
                _fallbackError = e;
                // Choose best fallback
                if (isStorageAvailable("sessionStorage")) {
                    _fallbackType = "sessionStorage";
                    try {
                        window.sessionStorage.setItem(key, value);
                        _fallbackStore[key] = value; // keep memory copy too
                        warnFallback(e);
                        return true; // sessionStorage persists until tab close
                    } catch (e2) {
                        _fallbackType = "memory";
                        _fallbackStore[key] = value;
                        warnFallback(e2);
                        return false; // memory only
                    }
                } else {
                    _fallbackType = "memory";
                    _fallbackStore[key] = value;
                    warnFallback(e);
                    return false;
                }
            }
        } else {
            // Already in fallback
            if (_fallbackType === "sessionStorage") {
                try {
                    window.sessionStorage.setItem(key, value);
                    _fallbackStore[key] = value;
                    return true;
                } catch (e) {
                    _fallbackType = "memory";
                    _fallbackStore[key] = value;
                    warnFallback(e);
                    return false;
                }
            } else {
                _fallbackStore[key] = value;
                if (!_fallbackWarned) warnFallback(new Error("memory fallback active"));
                return false; // memory is not persistent across refresh
            }
        }
    },
    removeItem(key) {
        try {
            if (!_usingFallback && window.localStorage) {
                window.localStorage.removeItem(key);
            }
        } catch (e) {}
        // Always clean fallback copies too
        delete _fallbackStore[key];
        try { if (window.sessionStorage) window.sessionStorage.removeItem(key); } catch(e) {}
    },
    // Helpers for debugging / UI
    isFallback() { return _usingFallback; },
    getFallbackType() { return _fallbackType; },
    getFallbackError() { return _fallbackError; }
};

// Expose globally for mod.js displayThings and console debugging
// `isUsingFallbackStorage` is checked in mod.js to show a banner
function isUsingFallbackStorage() { return _usingFallback; }
function getFallbackStorageType() { return _fallbackType; }
try { window.safeStorage = safeStorage; window.isUsingFallbackStorage = isUsingFallbackStorage; } catch(e) {}

function warnFallback(error) {
    if (_fallbackWarned) return;
    _fallbackWarned = true;
    _fallbackError = error;
    let msg = "";
    let title = "⚠️ Save Warning!";
    let color = "#ffcc00";
    if (_fallbackType === "memory") {
        title = "⚠️ Saves Will Be Lost on Refresh!";
        msg = "localStorage is unavailable (private mode, storage blocked, or quota full).<br><br>Your progress is now kept in <b>MEMORY ONLY</b> and will be <b>LOST when you refresh or close the tab</b>!<br><br>Please go to <b>Options → Export</b> and <b>copy your save regularly</b>. You can Import it later to restore.<br><br><small>Error: " + (error && error.message ? error.message : error) + "</small>";
        color = "#ff4444";
    } else if (_fallbackType === "sessionStorage") {
        msg = "localStorage failed (quota full or blocked). Using <b>sessionStorage</b> fallback — saves will last until you close the tab. Please <b>Export</b> your save to keep it permanently!<br><small>Error: " + (error && error.message ? error.message : error) + "</small>";
    } else {
        msg = "Storage issue: " + (error && error.message ? error.message : error) + "<br>Your save may not persist. Please Export.";
    }
    console.warn("[SafeStorage] " + msg.replace(/<[^>]*>/g, ' '));
    // Try popup, fallback to alert. Delay to ensure Vue/Popups are ready.
    const tryPopup = () => {
        if (typeof doPopup !== "undefined") {
            doPopup("none", msg, title, 10, color);
        } else if (typeof alert !== "undefined") {
            alert(msg.replace(/<[^>]*>/g, ''));
        }
    };
    // If game hasn't loaded yet, wait a bit
    if (typeof player === "undefined" || typeof tmp === "undefined") {
        setTimeout(tryPopup, 1500);
        // also try again after load
        setTimeout(tryPopup, 4000);
    } else {
        setTimeout(tryPopup, 500);
    }
}

function save(force) {
    NaNcheck(player)
    if (NaNalert && !force) return
    try {
        // Encode player and options (same encoding as original: btoa(unescape(encodeURIComponent(JSON.stringify))))
        // Wrap separately so one failing doesn't block the other
        let playerStr, optionsStr;
        try {
            playerStr = btoa(unescape(encodeURIComponent(JSON.stringify(player))));
        } catch (e) {
            console.error("[Save] Failed to encode player:", e);
            // Fallback: try plain btoa(JSON.stringify) without unicode handling
            try { playerStr = btoa(JSON.stringify(player)); } catch(e2) { throw e2; }
        }
        try {
            optionsStr = btoa(unescape(encodeURIComponent(JSON.stringify(options))));
        } catch (e) {
            console.error("[Save] Failed to encode options:", e);
            try { optionsStr = btoa(JSON.stringify(options)); } catch(e2) { throw e2; }
        }

        const key = getModID();
        const optKey = getModID()+"_options";

        const ok1 = safeStorage.setItem(key, playerStr);
        const ok2 = safeStorage.setItem(optKey, optionsStr);

        // If we fell back to memory, make it obvious in console (warn already shown)
        if (!ok1 || !ok2) {
            console.warn(`[Save] Saved to fallback (${safeStorage.getFallbackType()}) — not persistent!`);
            // Keep a direct memory copy as extra backup in case encoding changes
            try { _fallbackStore[key+"_raw"] = JSON.stringify(player); } catch(e) {}
        } else {
            // Success: if we were previously in fallback but now recovered, clear warning flag so next failure will warn again
            // (don't clear _fallbackWarned permanently, let it reset only after recovery)
            if (_usingFallback === false && _fallbackWarned && _fallbackType === "localStorage") {
                // recovered, allow future warnings again after a while
                // keep warned true to avoid spam, but we could reset after 1 minute
            }
        }
    } catch (e) {
        console.error("[Save] Save failed completely:", e);
        // Last-ditch: store raw JSON in memory so session isn't lost
        try { 
            _fallbackStore[getModID()+"_raw"] = JSON.stringify(player);
            _fallbackStore[getModID()] = JSON.stringify(player); // also try plain
        } catch(e2) {}
        if (!_fallbackWarned) warnFallback(e);
        // Show extra popup for critical failure
        if (typeof doPopup !== "undefined") {
            setTimeout(() => doPopup("none", "Critical save failure! Your progress could not be written.<br><br>Please <b>Export</b> immediately from Options!<br><small>" + (e.message||e) + "</small>", "💥 Save Failed!", 12, "#ff0000"), 500);
        }
    }
}
function startPlayerBase() {
    return {
        tab: layoutInfo.startTab,
        navTab: (layoutInfo.showTree ? layoutInfo.startNavTab : "none"),
        time: Date.now(),
        notify: {},
        versionType: getModID(),
        version: VERSION.num,
        beta: VERSION.beta,
        timePlayed: 0,
        keepGoing: false,
        hasNaN: false,

        points: modInfo.initialStartPoints,
        subtabs: {},
        lastSafeTab: (readData(layoutInfo.showTree) ? "none" : layoutInfo.startTab)
    };
}
function getStartPlayer() {
    playerdata = startPlayerBase();

    if (addedPlayerData) {
        extradata = addedPlayerData();
        for (thing in extradata)
            playerdata[thing] = extradata[thing];
    }

    playerdata.infoboxes = {};
    for (layer in layers) {
        playerdata[layer] = getStartLayerData(layer);

        if (layers[layer].tabFormat && !Array.isArray(layers[layer].tabFormat)) {
            playerdata.subtabs[layer] = {};
            playerdata.subtabs[layer].mainTabs = Object.keys(layers[layer].tabFormat)[0];
        }
        if (layers[layer].microtabs) {
            if (playerdata.subtabs[layer] == undefined)
                playerdata.subtabs[layer] = {};
            for (item in layers[layer].microtabs)
                playerdata.subtabs[layer][item] = Object.keys(layers[layer].microtabs[item])[0];
        }
        if (layers[layer].infoboxes) {
            if (playerdata.infoboxes[layer] == undefined)
                playerdata.infoboxes[layer] = {};
            for (item in layers[layer].infoboxes)
                playerdata.infoboxes[layer][item] = false;
        }

    }
    return playerdata;
}
function getStartLayerData(layer) {
    layerdata = {};
    if (layers[layer].startData)
        layerdata = layers[layer].startData();

    if (layerdata.unlocked === undefined)
        layerdata.unlocked = true;
    if (layerdata.total === undefined)
        layerdata.total = decimalZero;
    if (layerdata.best === undefined)
        layerdata.best = decimalZero;
    if (layerdata.resetTime === undefined)
        layerdata.resetTime = 0;
    if (layerdata.forceTooltip === undefined)
        layerdata.forceTooltip = false;

    layerdata.buyables = getStartBuyables(layer);
    if (layerdata.noRespecConfirm === undefined) layerdata.noRespecConfirm = false
    if (layerdata.clickables == undefined)
        layerdata.clickables = getStartClickables(layer);
    layerdata.spentOnBuyables = decimalZero;
    layerdata.upgrades = [];
    layerdata.milestones = [];
    layerdata.lastMilestone = null;
    layerdata.achievements = [];
    layerdata.challenges = getStartChallenges(layer);
    layerdata.grid = getStartGrid(layer);
    layerdata.prevTab = ""

    return layerdata;
}
function getStartBuyables(layer) {
    let data = {};
    if (layers[layer].buyables) {
        for (id in layers[layer].buyables)
            if (isPlainObject(layers[layer].buyables[id]))
                data[id] = decimalZero;
    }
    return data;
}
function getStartClickables(layer) {
    let data = {};
    if (layers[layer].clickables) {
        for (id in layers[layer].clickables)
            if (isPlainObject(layers[layer].clickables[id]))
                data[id] = "";
    }
    return data;
}
function getStartChallenges(layer) {
    let data = {};
    if (layers[layer].challenges) {
        for (id in layers[layer].challenges)
            if (isPlainObject(layers[layer].challenges[id]))
                data[id] = 0;
    }
    return data;
}
function getStartGrid(layer) {
    let data = {};
    if (! layers[layer].grid) return data
    if (layers[layer].grid.maxRows === undefined) layers[layer].grid.maxRows=layers[layer].grid.rows
    if (layers[layer].grid.maxCols === undefined) layers[layer].grid.maxCols=layers[layer].grid.cols

    for (let y = 1; y <= layers[layer].grid.maxRows; y++) {
        for (let x = 1; x <= layers[layer].grid.maxCols; x++) {
            data[100*y + x] = layers[layer].grid.getStartData(100*y + x)
        }
    }
    return data;
}

function fixSave() {
    defaultData = getStartPlayer();
    fixData(defaultData, player);

    for (layer in layers) {
        if (player[layer].best !== undefined)
            player[layer].best = new Decimal(player[layer].best);
        if (player[layer].total !== undefined)
            player[layer].total = new Decimal(player[layer].total);

        if (layers[layer].tabFormat && !Array.isArray(layers[layer].tabFormat)) {

            if (!Object.keys(layers[layer].tabFormat).includes(player.subtabs[layer].mainTabs))
                player.subtabs[layer].mainTabs = Object.keys(layers[layer].tabFormat)[0];
        }
        if (layers[layer].microtabs) {
            for (item in layers[layer].microtabs)
                if (!Object.keys(layers[layer].microtabs[item]).includes(player.subtabs[layer][item]))
                    player.subtabs[layer][item] = Object.keys(layers[layer].microtabs[item])[0];
        }
    }
}
function fixData(defaultData, newData) {
    for (item in defaultData) {
        if (defaultData[item] == null) {
            if (newData[item] === undefined)
                newData[item] = null;
        }
        else if (Array.isArray(defaultData[item])) {
            if (newData[item] === undefined)
                newData[item] = defaultData[item];

            else
                fixData(defaultData[item], newData[item]);
        }
        else if (defaultData[item] instanceof Decimal) { // Convert to Decimal
            if (newData[item] === undefined)
                newData[item] = defaultData[item];

            else
                newData[item] = new Decimal(newData[item]);
        }
        else if ((!!defaultData[item]) && (typeof defaultData[item] === "object")) {
            if (newData[item] === undefined || (typeof defaultData[item] !== "object"))
                newData[item] = defaultData[item];

            else
                fixData(defaultData[item], newData[item]);
        }
        else {
            if (newData[item] === undefined)
                newData[item] = defaultData[item];
        }
    }
}
function load() {
    let get = null;
    try {
        get = safeStorage.getItem(getModID());
        // Also check raw fallback copy if get is null but we have raw
        if ((get === null || get === undefined) && _fallbackStore[getModID()+"_raw"]) {
            try { get = btoa(unescape(encodeURIComponent(_fallbackStore[getModID()+"_raw"]))); } catch(e) { get = _fallbackStore[getModID()]; }
        }
        // Extra: if still null, check memory store directly
        if ((get === null || get === undefined) && _fallbackStore[getModID()]) {
            get = _fallbackStore[getModID()];
            // if it's plain JSON not base64, handle below
        }
    } catch (e) {
        console.warn("[Load] safeStorage.getItem threw:", e);
        get = _fallbackStore[getModID()] ?? null;
        if (!_fallbackWarned) warnFallback(e);
    }

    if (get === null || get === undefined) {
        player = getStartPlayer();
        options = getStartOptions();
    }
    else {
        try {
            // Try standard decode: atob -> decodeURIComponent(escape)
            // Handle both base64-encoded and raw JSON (from fallback)
            let decoded;
            try {
                decoded = JSON.parse(decodeURIComponent(escape(atob(get))));
            } catch (e) {
                // Maybe it's raw JSON string (fallback without encoding)
                try { decoded = JSON.parse(atob(get)); } catch(e2) {
                    // Try plain JSON
                    decoded = JSON.parse(get);
                }
            }
            player = Object.assign(getStartPlayer(), decoded);
            fixSave();
            loadOptions();
        } catch (e) {
            console.error("[Load] Failed to parse save, starting new game:", e);
            // Corrupted save - offer to keep fallback raw or reset
            if (typeof doPopup !== "undefined") {
                setTimeout(() => doPopup("none", "Your save was corrupted and could not be loaded.<br>Starting a new game. If you have an Export string, use Options → Import.<br><small>" + (e.message||e) + "</small>", "Corrupted Save", 8, "#ff4444"), 1000);
            }
            player = getStartPlayer();
            options = getStartOptions();
        }
    }

    if (options.offlineProd) {
        if (player.offTime === undefined)
            player.offTime = { remain: 0 };
        player.offTime.remain += (Date.now() - player.time) / 1000;
    }
    player.time = Date.now();
    versionCheck();
    changeTheme();
    changeTreeQuality();
    if (typeof applyGameFont === "function") applyGameFont(options.font);
    updateLayers();
    setupModInfo();

    setupTemp();
    updateTemp();
    updateTemp();
    updateTabFormats()
    loadVue();

    // After load, if we're in fallback, warn again (now that Vue/popups are ready)
    if (_usingFallback && !_fallbackWarned) {
        warnFallback(_fallbackError || new Error("fallback active at load"));
    } else if (_usingFallback) {
        // Even if already warned at script load (before Vue), show popup again now that UI is ready
        if (_fallbackType === "memory" || _fallbackType === "sessionStorage") {
            setTimeout(() => warnFallback(_fallbackError || new Error("fallback still active")), 800);
            // Reset warned flag to allow the popup to show (warnFallback checks _fallbackWarned)
            // So temporarily allow
            let wasWarned = _fallbackWarned;
            _fallbackWarned = false;
            setTimeout(() => warnFallback(_fallbackError || new Error("fallback still active")), 900);
            _fallbackWarned = wasWarned;
            // Actually we want to show it, so do it directly:
            setTimeout(() => {
                if (typeof doPopup !== "undefined") {
                    let msg = _fallbackType === "memory"
                        ? "⚠️ You are in <b>MEMORY-ONLY mode</b> — saves will be lost on refresh! Export often!"
                        : "⚠️ Using <b>sessionStorage</b> — saves last until tab close. Export!";
                    doPopup("none", msg, "Save Mode: " + _fallbackType, 8, "#ffcc00");
                }
            }, 1000);
        }
    }
}

function loadOptions() {
    let get2 = null;
    try {
        get2 = safeStorage.getItem(getModID()+"_options");
        if ((get2 === null || get2 === undefined) && _fallbackStore[getModID()+"_options"]) {
            get2 = _fallbackStore[getModID()+"_options"];
        }
    } catch (e) {
        console.warn("[LoadOptions] getItem failed:", e);
        get2 = _fallbackStore[getModID()+"_options"] ?? null;
    }
    try {
        if (get2) {
            let decoded;
            try { decoded = JSON.parse(decodeURIComponent(escape(atob(get2)))); } 
            catch (e) { try { decoded = JSON.parse(atob(get2)); } catch(e2) { decoded = JSON.parse(get2); } }
            options = Object.assign(getStartOptions(), decoded);
        } else {
            options = getStartOptions()
        }
        if (themes.indexOf(options.theme) < 0) theme = "default"
        fixData(options, getStartOptions())
    } catch (e) {
        console.error("[LoadOptions] Failed to parse options, resetting:", e);
        options = getStartOptions();
    }
}

function setupModInfo() {
    modInfo.changelog = changelog;
    modInfo.winText = winText ? winText : `Congratulations! You have reached the end and beaten this game, but for now...`;

}
function fixNaNs() {
    NaNcheck(player);
}
function NaNcheck(data) {
    for (item in data) {
        if (data[item] == null) {
        }
        else if (Array.isArray(data[item])) {
            NaNcheck(data[item]);
        }
        else if (data[item] !== data[item] || checkDecimalNaN(data[item])) {
            if (!NaNalert) {
                clearInterval(interval);
                NaNalert = true;
                alert("Invalid value found in player, named '" + item + "'. Please let the creator of this mod know! You can refresh the page, and you will be un-NaNed.")
                return
            }
        }
        else if (data[item] instanceof Decimal) {
        }
        else if ((!!data[item]) && (data[item].constructor === Object)) {
            NaNcheck(data[item]);
        }
    }
}
function exportSave() {
    //if (NaNalert) return
    let str;
    try {
        // Use same format as save: plain btoa(JSON.stringify) for export (matches importSave)
        // Keep compat: exportSave originally used btoa(JSON.stringify(player)) without unicode wrapper
        str = btoa(JSON.stringify(player));
    } catch (e) {
        // Fallback with unicode handling
        str = btoa(unescape(encodeURIComponent(JSON.stringify(player))));
    }

    const el = document.createElement("textarea");
    el.value = str;
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, 99999);
    document.execCommand("copy");
    document.body.removeChild(el);
    // Also show popup for feedback, especially important in fallback mode
    if (typeof doPopup !== "undefined") {
        let extra = "";
        if (_usingFallback) extra = "<br><br><small>⚠️ You are in " + _fallbackType + " mode — keep this string safe! Your browser is not saving persistently.</small>";
        doPopup("none", "Save exported to clipboard!" + extra, "Exported!", 4, "#4BDC13");
    }
}
function importSave(imported = undefined, forced = false) {
    if (imported === undefined)
        imported = prompt("Paste your save here");
    if (!imported) return;
    try {
        // Try both decode methods (unicode-wrapped and plain)
        let decoded;
        try { decoded = JSON.parse(atob(imported)); } catch(e) {
            try { decoded = JSON.parse(decodeURIComponent(escape(atob(imported)))); } catch(e2) { decoded = JSON.parse(imported); }
        }
        tempPlr = Object.assign(getStartPlayer(), decoded);
        if (tempPlr.versionType != getModID() && !forced && !confirm("This save appears to be for a different mod! Are you sure you want to import?")) // Wrong save (use "Forced" to force it to accept.)
            return;
        player = tempPlr;
        player.versionType = getModID();
        fixSave();
        versionCheck();
        NaNcheck(save)
        save();
        window.location.reload();
    } catch (e) {
        console.error("[Import] Failed:", e);
        if (typeof doPopup !== "undefined") doPopup("none", "Import failed! Is the string valid?<br><small>" + (e.message||e) + "</small>", "Import Error", 5, "#ff4444");
        else alert("Import failed: " + e);
        return;
    }
}
function versionCheck() {
    let setVersion = true;

    if (player.versionType === undefined || player.version === undefined) {
        player.versionType = getModID();
        player.version = 0;
    }

    if (setVersion) {
        if (player.versionType == getModID() && VERSION.num > player.version) {
            player.keepGoing = false;
            if (fixOldSave)
                fixOldSave(player.version);
        }
        player.versionType = getStartPlayer().versionType;
        player.version = VERSION.num;
        player.beta = VERSION.beta;
    }
}
var saveInterval = setInterval(function () {
    if (player === undefined)
        return;
    if (tmp.gameEnded && !player.keepGoing)
        return;
    if (options.autosave)
        save();
}, 5000);

window.onbeforeunload = () => {
    // Fixed: originally checked player.autosave (non-existent), now checks options.autosave and player.autosave for compat
    if ((typeof options !== "undefined" && options.autosave) || (typeof player !== "undefined" && player.autosave)) {
        save();
    }
};
