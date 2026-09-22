// ============================================================================
//  Save Slots & Save Bank System
//  Allows multiple save files, named saves, and a save bank for backup/restore
// ============================================================================

const SAVE_SLOTS_KEY = getModID() + "_slots";
const SAVE_BANK_KEY = getModID() + "_bank";
const MAX_SAVE_SLOTS = 10;
const MAX_BANK_SLOTS = 20;

// Current active slot (0 = default/main save)
let currentSaveSlot = 0;

// Save slot metadata
function getSaveSlotKey(slot) {
    return getModID() + "_slot_" + slot;
}

// Get all save slot info
function getSaveSlots() {
    try {
        let raw = safeStorage.getItem(SAVE_SLOTS_KEY);
        if (raw) return JSON.parse(raw);
    } catch(e) {}
    return [];
}

// Save slot metadata
function saveSlotMeta(slots) {
    try {
        safeStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots));
    } catch(e) {
        console.warn("[SaveSlots] Failed to save slot metadata:", e);
    }
}

// Create a new save slot
function createSaveSlot(name) {
    let slots = getSaveSlots();
    if (slots.length >= MAX_SAVE_SLOTS) {
        if (typeof doPopup !== "undefined") doPopup("none", "Maximum " + MAX_SAVE_SLOTS + " save slots reached!", "Error", 3, "#ff4444");
        return false;
    }
    
    let slotId = slots.length;
    let slot = {
        id: slotId,
        name: name || ("Save " + (slotId + 1)),
        created: Date.now(),
        lastSaved: Date.now(),
        version: VERSION.num,
        points: "0",
        timePlayed: 0,
    };
    
    slots.push(slot);
    saveSlotMeta(slots);
    
    // Save current player data to this slot
    saveToSlot(slotId);
    
    if (typeof doPopup !== "undefined") doPopup("none", "Created save slot: " + slot.name, "Slot Created", 3, "#4BDC13");
    return true;
}

// Save current game to a slot
function saveToSlot(slotId) {
    try {
        let data = btoa(JSON.stringify(player));
        safeStorage.setItem(getSaveSlotKey(slotId), data);
        
        // Update slot metadata
        let slots = getSaveSlots();
        if (slots[slotId]) {
            slots[slotId].lastSaved = Date.now();
            slots[slotId].version = VERSION.num;
            slots[slotId].points = formatWhole(player.points);
            slots[slotId].timePlayed = player.timePlayed;
            saveSlotMeta(slots);
        }
        return true;
    } catch(e) {
        console.warn("[SaveSlots] Failed to save to slot " + slotId + ":", e);
        return false;
    }
}

// Load game from a slot
function loadFromSlot(slotId) {
    try {
        let data = safeStorage.getItem(getSaveSlotKey(slotId));
        if (!data) {
            if (typeof doPopup !== "undefined") doPopup("none", "No save found in slot " + (slotId + 1), "Error", 3, "#ff4444");
            return false;
        }
        
        let decoded;
        try { decoded = JSON.parse(atob(data)); } catch(e) {
            try { decoded = JSON.parse(decodeURIComponent(escape(atob(data)))); } catch(e2) {
                decoded = JSON.parse(data);
            }
        }
        
        player = Object.assign(getStartPlayer(), decoded);
        currentSaveSlot = slotId;
        fixSave();
        versionCheck();
        save();
        window.location.reload();
        return true;
    } catch(e) {
        console.warn("[SaveSlots] Failed to load from slot " + slotId + ":", e);
        if (typeof doPopup !== "undefined") doPopup("none", "Failed to load slot " + (slotId + 1) + ": " + e.message, "Error", 5, "#ff4444");
        return false;
    }
}

// Delete a save slot
function deleteSaveSlot(slotId) {
    if (slotId === 0) {
        if (typeof doPopup !== "undefined") doPopup("none", "Cannot delete the main save slot!", "Error", 3, "#ff4444");
        return false;
    }
    
    let slots = getSaveSlots();
    if (!slots[slotId]) return false;
    
    // Remove save data
    safeStorage.removeItem(getSaveSlotKey(slotId));
    
    // Remove from metadata
    slots.splice(slotId, 1);
    
    // Re-index remaining slots
    for (let i = 0; i < slots.length; i++) {
        slots[i].id = i;
    }
    
    saveSlotMeta(slots);
    
    // If we deleted the current slot, switch to slot 0
    if (currentSaveSlot === slotId) {
        currentSaveSlot = 0;
        loadFromSlot(0);
    } else if (currentSaveSlot > slotId) {
        currentSaveSlot--;
    }
    
    if (typeof doPopup !== "undefined") doPopup("none", "Deleted save slot", "Slot Deleted", 3, "#ff8800");
    return true;
}

// Rename a save slot
function renameSaveSlot(slotId, newName) {
    let slots = getSaveSlots();
    if (slots[slotId]) {
        slots[slotId].name = newName;
        saveSlotMeta(slots);
        return true;
    }
    return false;
}

// Export a save slot to clipboard
function exportSaveSlot(slotId) {
    try {
        let data = safeStorage.getItem(getSaveSlotKey(slotId));
        if (!data) {
            if (typeof doPopup !== "undefined") doPopup("none", "No save in slot " + (slotId + 1), "Error", 3, "#ff4444");
            return;
        }
        
        const el = document.createElement("textarea");
        el.value = data;
        document.body.appendChild(el);
        el.select();
        el.setSelectionRange(0, 99999);
        document.execCommand("copy");
        document.body.removeChild(el);
        
        if (typeof doPopup !== "undefined") doPopup("none", "Slot " + (slotId + 1) + " exported to clipboard!", "Exported", 3, "#4BDC13");
    } catch(e) {
        if (typeof doPopup !== "undefined") doPopup("none", "Export failed: " + e.message, "Error", 5, "#ff4444");
    }
}

// Import a save from clipboard to a slot
function importSaveSlot(slotId) {
    let imported = prompt("Paste your save string for slot " + (slotId + 1) + ":");
    if (!imported) return;
    
    try {
        // Validate it's a valid save
        let decoded;
        try { decoded = JSON.parse(atob(imported)); } catch(e) {
            try { decoded = JSON.parse(decodeURIComponent(escape(atob(imported)))); } catch(e2) {
                decoded = JSON.parse(imported);
            }
        }
        
        // Save to slot
        safeStorage.setItem(getSaveSlotKey(slotId), imported);
        
        // Update metadata
        let slots = getSaveSlots();
        if (!slots[slotId]) {
            slots[slotId] = {
                id: slotId,
                name: "Imported Save",
                created: Date.now(),
                lastSaved: Date.now(),
                version: decoded.version || "unknown",
                points: "0",
                timePlayed: decoded.timePlayed || 0,
            };
        }
        slots[slotId].lastSaved = Date.now();
        slots[slotId].points = decoded.points ? formatWhole(new Decimal(decoded.points)) : "?";
        saveSlotMeta(slots);
        
        if (typeof doPopup !== "undefined") doPopup("none", "Imported to slot " + (slotId + 1) + "!", "Imported", 3, "#4BDC13");
    } catch(e) {
        if (typeof doPopup !== "undefined") doPopup("none", "Import failed: " + e.message, "Error", 5, "#ff4444");
    }
}

// ===== SAVE BANK =====
// The save bank stores snapshots of your game that you can restore later

function getSaveBank() {
    try {
        let raw = safeStorage.getItem(SAVE_BANK_KEY);
        if (raw) return JSON.parse(raw);
    } catch(e) {}
    return [];
}

function saveBankMeta(bank) {
    try {
        safeStorage.setItem(SAVE_BANK_KEY, JSON.stringify(bank));
    } catch(e) {
        console.warn("[SaveBank] Failed to save bank metadata:", e);
    }
}

function getBankSlotKey(bankId) {
    return getModID() + "_bank_" + bankId;
}

// Deposit current game into bank
function depositToBank(name) {
    let bank = getSaveBank();
    if (bank.length >= MAX_BANK_SLOTS) {
        if (typeof doPopup !== "undefined") doPopup("none", "Save bank is full! (Max " + MAX_BANK_SLOTS + "). Delete some first.", "Bank Full", 3, "#ff4444");
        return false;
    }
    
    let bankId = bank.length;
    let entry = {
        id: bankId,
        name: name || ("Bank " + (bankId + 1) + " - " + formatWhole(player.points) + " pts"),
        deposited: Date.now(),
        version: VERSION.num,
        points: formatWhole(player.points),
        timePlayed: player.timePlayed,
        achievements: Object.keys(player.a.achievements).length,
    };
    
    // Save game data
    try {
        let data = btoa(JSON.stringify(player));
        safeStorage.setItem(getBankSlotKey(bankId), data);
    } catch(e) {
        if (typeof doPopup !== "undefined") doPopup("none", "Failed to save to bank: " + e.message, "Error", 5, "#ff4444");
        return false;
    }
    
    bank.push(entry);
    saveBankMeta(bank);
    
    if (typeof doPopup !== "undefined") doPopup("none", "Deposited to bank: " + entry.name, "Deposited", 3, "#4BDC13");
    return true;
}

// Withdraw from bank (load)
function withdrawFromBank(bankId) {
    let bank = getSaveBank();
    if (!bank[bankId]) {
        if (typeof doPopup !== "undefined") doPopup("none", "No save in bank slot " + (bankId + 1), "Error", 3, "#ff4444");
        return false;
    }
    
    try {
        let data = safeStorage.getItem(getBankSlotKey(bankId));
        if (!data) {
            if (typeof doPopup !== "undefined") doPopup("none", "Bank save data missing!", "Error", 3, "#ff4444");
            return false;
        }
        
        // Auto-save current game to main slot before loading
        saveToSlot(currentSaveSlot);
        
        let decoded;
        try { decoded = JSON.parse(atob(data)); } catch(e) {
            try { decoded = JSON.parse(decodeURIComponent(escape(atob(data)))); } catch(e2) {
                decoded = JSON.parse(data);
            }
        }
        
        player = Object.assign(getStartPlayer(), decoded);
        fixSave();
        versionCheck();
        save();
        window.location.reload();
        return true;
    } catch(e) {
        if (typeof doPopup !== "undefined") doPopup("none", "Failed to withdraw: " + e.message, "Error", 5, "#ff4444");
        return false;
    }
}

// Delete from bank
function deleteFromBank(bankId) {
    let bank = getSaveBank();
    if (!bank[bankId]) return false;
    
    safeStorage.removeItem(getBankSlotKey(bankId));
    bank.splice(bankId, 1);
    
    // Re-index
    for (let i = 0; i < bank.length; i++) {
        bank[i].id = i;
    }
    
    saveBankMeta(bank);
    if (typeof doPopup !== "undefined") doPopup("none", "Deleted from bank", "Deleted", 3, "#ff8800");
    return true;
}

// Export from bank
function exportBankSlot(bankId) {
    try {
        let data = safeStorage.getItem(getBankSlotKey(bankId));
        if (!data) {
            if (typeof doPopup !== "undefined") doPopup("none", "No save in bank slot " + (bankId + 1), "Error", 3, "#ff4444");
            return;
        }
        
        const el = document.createElement("textarea");
        el.value = data;
        document.body.appendChild(el);
        el.select();
        el.setSelectionRange(0, 99999);
        document.execCommand("copy");
        document.body.removeChild(el);
        
        if (typeof doPopup !== "undefined") doPopup("none", "Bank slot " + (bankId + 1) + " exported to clipboard!", "Exported", 3, "#4BDC13");
    } catch(e) {
        if (typeof doPopup !== "undefined") doPopup("none", "Export failed: " + e.message, "Error", 5, "#ff4444");
    }
}

// Format time played for display
function formatSaveTime(seconds) {
    if (!seconds) return "0s";
    if (seconds < 60) return Math.floor(seconds) + "s";
    if (seconds < 3600) return Math.floor(seconds / 60) + "m " + Math.floor(seconds % 60) + "s";
    if (seconds < 86400) return Math.floor(seconds / 3600) + "h " + Math.floor((seconds % 3600) / 60) + "m";
    return Math.floor(seconds / 86400) + "d " + Math.floor((seconds % 86400) / 3600) + "h";
}

// Format date for display
function formatSaveDate(timestamp) {
    if (!timestamp) return "Unknown";
    let d = new Date(timestamp);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}
