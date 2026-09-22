function respecBuyables(layer) {
  if (!layers[layer].buyables) return;
  if (!layers[layer].buyables.respec) return;
  if (
    !player[layer].noRespecConfirm &&
    !confirm(
      tmp[layer].buyables.respecMessage ||
        'Are you sure you want to respec? This will force you to do a "' +
          (tmp[layer].name ? tmp[layer].name : layer) +
          '" reset as well!',
    )
  )
    return;
  layers[layer].buyables.respec();
  updateBuyableTemp(layer);
  document.activeElement.blur();
}

function canAffordUpgrade(layer, id) {
  const upg = tmp[layer].upgrades[id];
  if (tmp[layer].deactivated) return false;
  if (tmp[layer].upgrades[id].canAfford === false) return false;
  let cost = tmp[layer].upgrades[id].cost;
  if (cost !== undefined) return canAffordPurchase(layer, upg, cost);
  return true;
}

function canBuyBuyable(layer, id) {
  const b = temp[layer].buyables[id];
  return (
    b.unlocked &&
    run(b.canAfford, b) &&
    player[layer].buyables[id].lt(b.purchaseLimit) &&
    !tmp[layer].deactivated
  );
}

function canAffordPurchase(layer, thing, cost) {
  if (thing.currencyInternalName) {
    const name = thing.currencyInternalName;
    if (thing.currencyLocation) {
      return !thing.currencyLocation[name].lt(cost);
    } else if (thing.currencyLayer) {
      const lr = thing.currencyLayer;
      return !player[lr][name].lt(cost);
    } else {
      return !player[name].lt(cost);
    }
  } else {
    return !player[layer].points.lt(cost);
  }
}

function buyUpg(layer, id) {
  if (!tmp[layer].upgrades || !tmp[layer].upgrades[id]) return;
  let upg = tmp[layer].upgrades[id];
  if (!player[layer].unlocked || player[layer].deactivated) return;
  if (!tmp[layer].upgrades[id].unlocked) return;
  if (player[layer].upgrades.includes(id)) return;
  if (upg.canAfford === false) return;
  let pay = layers[layer].upgrades[id].pay;
  if (pay !== undefined) run(pay, layers[layer].upgrades[id]);
  else {
    let cost = tmp[layer].upgrades[id].cost;

    if (upg.currencyInternalName) {
      let name = upg.currencyInternalName;
      if (upg.currencyLocation) {
        if (upg.currencyLocation[name].lt(cost)) return;
        upg.currencyLocation[name] = upg.currencyLocation[name].sub(cost);
      } else if (upg.currencyLayer) {
        let lr = upg.currencyLayer;
        if (player[lr][name].lt(cost)) return;
        player[lr][name] = player[lr][name].sub(cost);
      } else {
        if (player[name].lt(cost)) return;
        player[name] = player[name].sub(cost);
      }
    } else {
      if (player[layer].points.lt(cost)) return;
      player[layer].points = player[layer].points.sub(cost);
    }
  }
  player[layer].upgrades.push(id);
  if (upg.onPurchase != undefined) run(upg.onPurchase, upg);
  needCanvasUpdate = true;
}

const buyUpgrade = buyUpg;

function buyMaxBuyable(layer, id) {
  if (!player[layer].unlocked) return;
  if (!tmp[layer].buyables[id].unlocked) return;
  if (!tmp[layer].buyables[id].canBuy) return;
  if (!layers[layer].buyables[id].buyMax) return;
  layers[layer].buyables[id].buyMax();
  updateBuyableTemp(layer);
}

function buyBuyable(layer, id) {
  if (!player[layer].unlocked) return;
  if (!tmp[layer].buyables[id].unlocked) return;
  if (!tmp[layer].buyables[id].canBuy) return;
  layers[layer].buyables[id].buy();
  updateBuyableTemp(layer);
}

function clickClickable(layer, id) {
  if (!player[layer].unlocked || tmp[layer].deactivated) return;
  if (!tmp[layer].clickables[id].unlocked) return;
  if (!tmp[layer].clickables[id].canClick) return;
  layers[layer].clickables[id].onClick();
  updateClickableTemp(layer);
}

function clickGrid(layer, id) {
  if (!player[layer].unlocked || tmp[layer].deactivated) return;
  if (!run(layers[layer].grid.getUnlocked, layers[layer].grid, id)) return;
  if (!gridRun(layer, "getCanClick", player[layer].grid[id], id)) return;
  gridRun(layer, "onClick", player[layer].grid[id], id);
}

function inChallenge(layer, id) {
  const challenge = player[layer].activeChallenge ?? 0;
  if (challenge == id) return true;

  return tmp[layer].challenges[challenge]?.countsAs?.includes(id) ?? false;
}

let onTreeTab = true;

function showTab(name, prev) {
  if (LAYERS.includes(name) && !layerunlocked(name)) return;
  if (player.tab !== name) clearParticles((p) => p.layer === player.tab);
  if (tmp[name] && player.tab === name && isPlainObject(tmp[name].tabFormat)) {
    player.subtabs[name].mainTabs = Object.keys(layers[name].tabFormat)[0];
  }
  player.tab = name;
  if (tmp[name] && tmp[name].row !== "side" && tmp[name].row !== "otherside")
    player.lastSafeTab = name;
  updateTabFormats();
  needCanvasUpdate = true;
  document.activeElement.blur();
}

function showNavTab(name, prev) {
  if (LAYERS.includes(name) && !layerunlocked(name)) return;
  if (player.navTab !== name) clearParticles((p) => p.layer === player.navTab);
  if (tmp[name] && tmp[name].previousTab !== undefined)
    prev = tmp[name].previousTab;
  if (name !== "none" && prev && !tmp[prev]?.leftTab == !tmp[name]?.leftTab)
    player[name].prevTab = prev;
  else if (player[name]) player[name].prevTab = "";
  player.navTab = name;
  updateTabFormats();
  needCanvasUpdate = true;
}

function goBack(layer) {
  let nextTab = "none";
  if (player[layer].prevTab) nextTab = player[layer].prevTab;
  if (
    player.navTab === "none" &&
    (tmp[layer]?.row == "side" || tmp[layer].row == "otherside")
  )
    nextTab = player.lastSafeTab;

  if (tmp[layer].leftTab) showNavTab(nextTab, layer);
  else showTab(nextTab, layer);
}

function layOver(obj1, obj2) {
  for (const x in obj2) {
    if (obj2[x] instanceof Decimal) obj1[x] = new Decimal(obj2[x]);
    else if (obj2[x] instanceof Object) layOver(obj1[x], obj2[x]);
    else obj1[x] = obj2[x];
  }
}

function prestigeNotify(layer) {
  if (layers[layer].prestigeNotify) return layers[layer].prestigeNotify();

  if (isPlainObject(tmp[layer].tabFormat)) {
    for (const subtab in tmp[layer].tabFormat) {
      if (subtabResetNotify(layer, "mainTabs", subtab)) return true;
    }
  }
  for (const family in tmp[layer].microtabs) {
    for (const subtab in tmp[layer].microtabs[family]) {
      if (subtabResetNotify(layer, family, subtab)) return true;
    }
  }
  if (tmp[layer].autoPrestige || tmp[layer].passiveGeneration) return false;
  else if (tmp[layer].type == "static") return tmp[layer].canReset;
  else if (tmp[layer].type == "normal")
    return (
      tmp[layer].canReset &&
      tmp[layer].resetGain.gte(player[layer].points.div(10))
    );
  else return false;
}

function notifyLayer(name) {
  if (player.tab === name || !layerunlocked(name)) return;
  player.notify[name] = 1;
}

function subtabShouldNotify(layer, family, id) {
  let subtab = {};
  if (family === "mainTabs") subtab = tmp[layer].tabFormat[id];
  else subtab = tmp[layer].microtabs[family][id];
  if (!subtab.unlocked) return false;
  if (subtab.embedLayer) return tmp[subtab.embedLayer].notify;
  else return subtab.shouldNotify;
}

function subtabResetNotify(layer, family, id) {
  let subtab = {};
  if (family == "mainTabs") subtab = tmp[layer].tabFormat[id];
  else subtab = tmp[layer].microtabs[family][id];
  if (subtab.embedLayer) return tmp[subtab.embedLayer].prestigeNotify;
  else return subtab.prestigeNotify;
}

function nodeShown(layer) {
  return layerShown(layer);
}

function layerunlocked(layer) {
  if (tmp[layer] && tmp[layer].type == "none") return player[layer].unlocked;
  return (
    LAYERS.includes(layer) &&
    (player[layer].unlocked || (tmp[layer].canReset && tmp[layer].layerShown))
  );
}

function keepGoing() {
  player.keepGoing = true;
  needCanvasUpdate = true;
}

const toNumber = Number;

function updateMilestones(layer) {
  if (tmp[layer].deactivated) return;
  for (const id in layers[layer].milestones) {
    if (!hasMilestone(layer, id) && layers[layer].milestones[id].done()) {
      player[layer].milestones.push(id);
      if (layers[layer].milestones[id].onComplete)
        layers[layer].milestones[id].onComplete();
      if (
        tmp[layer].milestonePopups ||
        tmp[layer].milestonePopups === undefined
      )
        doPopup(
          "milestone",
          tmp[layer].milestones[id].requirementDescription,
          "Milestone Gotten!",
          3,
          tmp[layer].color,
        );
      player[layer].lastMilestone = id;
    }
  }
}

function updateAchievements(layer) {
  if (tmp[layer].deactivated) return;
  for (const id in layers[layer].achievements) {
    if (
      isPlainObject(layers[layer].achievements[id]) &&
      !hasAchievement(layer, id) &&
      layers[layer].achievements[id].done()
    ) {
      player[layer].achievements.push(id);
      if (layers[layer].achievements[id].onComplete)
        layers[layer].achievements[id].onComplete();
      if (
        tmp[layer].achievementPopups ||
        tmp[layer].achievementPopups === undefined
      )
        doPopup(
          "achievement",
          tmp[layer].achievements[id].name,
          "Achievement Gotten!",
          3,
          tmp[layer].color,
        );
    }
  }
}

function addTime(diff, layer) {
  let data = player;
  let time = data.timePlayed;
  if (layer) {
    data = data[layer];
    time = data.time;
  }
  if (layer) data.time = time;
  else data.timePlayed = time;
}

let shiftDown = false;
let ctrlDown = false;

document.addEventListener("keydown", (e) => {
  if (player === undefined) return;
  shiftDown = e.shiftKey;
  ctrlDown = e.ctrlKey;
  if (tmp.gameEnded && !player.keepGoing) return;
  let key = e.key;
  if (ctrlDown) key = "ctrl+" + key;
  if (onFocused) return;
  if (ctrlDown && hotkeys[key]) e.preventDefault();
  if (hotkeys[key]) {
    const k = hotkeys[key];
    if (player[k.layer].unlocked && tmp[k.layer].hotkeys[k.id].unlocked)
      k.onPress();
  }
});

document.addEventListener("keyup", (e) => {
  shiftDown = e.shiftKey;
  ctrlDown = e.ctrlKey;
});

let onFocused = false;

function focused(x) {
  onFocused = x;
}

function isFunction(obj) {
  return typeof obj === "function";
}

function isPlainObject(obj) {
  return obj != null && obj.constructor === Object;
}

document.title = modInfo.name;

// Converts a string value to whatever it's supposed to be
function toValue(value, oldValue) {
  if (oldValue instanceof Decimal) {
    value = new Decimal(value);
    if (checkDecimalNaN(value)) return decimalZero;
    return value;
  }
  if (!isNaN(oldValue)) return Number(value);
  return value;
}

// Variables that must be defined to display popups
const activePopups = [];
let popupID = 0;

// Function to show popups
function doPopup(type, text, title, timer, color) {
  let popupTitle = "";
  let popupType = "";
  switch (type) {
    case "achievement":
      popupTitle = "Achievement Unlocked!";
      popupType = "achievement-popup";
      break;
    case "challenge":
      popupTitle = "Challenge Complete";
      popupType = "challenge-popup";
      break;
    default:
      popupTitle = "Something Happened?";
      popupType = "default-popup";
      break;
  }
  if (title != "") popupTitle = title;
  let popupMessage = text;
  let popupTimer = timer;

  activePopups.push({
    time: popupTimer,
    type: popupType,
    title: popupTitle,
    message: popupMessage + "\n",
    id: popupID,
    color: color,
  });
  popupID++;
}

//Function to reduce time on active popups
function adjustPopupTime(diff) {
  for (const popup in activePopups) {
    activePopups[popup].time -= diff;
    if (activePopups[popup].time < 0) {
      activePopups.splice(popup, 1); // Remove popup when time hits 0
    }
  }
}

function run(func, target, ...args) {
  return typeof func === "function" ? func.call(target, ...args) : func;
}

function gridRun(layer, func, data, id) {
  if (isFunction(layers[layer].grid[func])) {
    return layers[layer].grid[func].call(layers[layer].grid, id);
  }
  return layers[layer].grid[func];
}
