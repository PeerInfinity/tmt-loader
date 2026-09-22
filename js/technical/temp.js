var tmp = {};
var temp = tmp; // Proxy for tmp
var funcs = {};
var NaNalert = false;

// Tmp will not call these
var activeFunctions = [
  "startData",
  "onPrestige",
  "doReset",
  "update",
  "automate",
  "buy",
  "buyMax",
  "respec",
  "onPress",
  "onClick",
  "onHold",
  "masterButtonPress",
  "sellOne",
  "sellAll",
  "pay",
  "actualCostFunction",
  "actualEffectFunction",
  "effectDescription",
  "display",
  "fullDisplay",
  "effectDisplay",
  "rewardDisplay",
  "tabFormat",
  "content",
  "onComplete",
  "onPurchase",
  "onEnter",
  "onExit",
  "done",
  "getUnlocked",
  "getStyle",
  "getCanClick",
  "getTitle",
  "getDisplay",
  ...doNotCallTheseFunctionsEveryTick,
];

function setupTemp() {
  tmp.pointGen = {};
  tmp.backgroundStyle = {};
  tmp.displayThings = [];
  tmp.scrolled = 0;
  tmp.gameEnded = false;

  setupTempData(layers, tmp, funcs);
  for (const layer in layers) {
    tmp[layer].resetGain = {};
    tmp[layer].nextAt = {};
    tmp[layer].nextAtDisp = {};
    tmp[layer].canReset = {};
    tmp[layer].notify = {};
    tmp[layer].prestigeNotify = {};
    tmp[layer].computedNodeStyle = [];
    setupBuyables(layer);
    tmp[layer].trueGlowColor = [];
  }

  tmp.other = {
    lastPoints: player.points || decimalZero,
    oomps: decimalZero,
    screenWidth: 0,
    screenHeight: 0,
  };

  updateWidth();
}

const boolNames = ["unlocked", "deactivated"];

function setupTempData(layerData, tmpData, funcsData) {
  for (const item in layerData) {
    if (layerData[item] == null) {
      tmpData[item] = null;
    } else if (layerData[item] instanceof Decimal)
      tmpData[item] = layerData[item];
    else if (Array.isArray(layerData[item])) {
      tmpData[item] = [];
      funcsData[item] = [];
      setupTempData(layerData[item], tmpData[item], funcsData[item]);
    } else if (!!layerData[item] && layerData[item].constructor === Object) {
      tmpData[item] = {};
      funcsData[item] = [];
      setupTempData(layerData[item], tmpData[item], funcsData[item]);
    } else if (isFunction(layerData[item]) && !activeFunctions.includes(item)) {
      funcsData[item] = layerData[item];
      if (boolNames.includes(item)) tmpData[item] = false;
      else tmpData[item] = decimalOne; // The safest thing to put probably?
    } else {
      tmpData[item] = layerData[item];
    }
  }
}

function updateTemp() {
  updateTempData(layers, tmp, funcs);

  for (const layer in layers) {
    tmp[layer].resetGain = getResetGain(layer);
    tmp[layer].nextAt = getNextAt(layer);
    tmp[layer].nextAtDisp = getNextAt(layer, true);
    tmp[layer].canReset = canReset(layer);
    tmp[layer].trueGlowColor = tmp[layer].glowColor;
    tmp[layer].notify = shouldNotify(layer);
    tmp[layer].prestigeNotify = prestigeNotify(layer);
    if (tmp[layer].passiveGeneration === true) tmp[layer].passiveGeneration = 1; // new Decimal(true) = decimalZero
  }

  tmp.pointGen = getPointGen();
  tmp.backgroundStyle = readData(backgroundStyle);

  tmp.displayThings = displayThings.map((thing) =>
    typeof thing === "function" ? thing() : thing,
  );
}

function updateTempData(layerData, tmpData, funcsData, useThis) {
  for (const item in funcsData) {
    if (Array.isArray(layerData[item])) {
      if (item !== "tabFormat" && item !== "content")
        // These are only updated when needed
        updateTempData(
          layerData[item],
          tmpData[item],
          funcsData[item],
          useThis,
        );
    } else if (!!layerData[item] && layerData[item].constructor === Object) {
      updateTempData(layerData[item], tmpData[item], funcsData[item], useThis);
    } else if (isFunction(layerData[item]) && !isFunction(tmpData[item])) {
      const value =
        useThis === undefined
          ? layerData[item]()
          : layerData[item].call(useThis);
      Vue.set(tmpData, item, value);
    }
  }
}

function updateChallengeTemp(layer) {
  updateTempData(
    layers[layer].challenges,
    tmp[layer].challenges,
    funcs[layer].challenges,
  );
}

function updateBuyableTemp(layer) {
  updateTempData(
    layers[layer].buyables,
    tmp[layer].buyables,
    funcs[layer].buyables,
  );
}

function updateClickableTemp(layer) {
  updateTempData(
    layers[layer].clickables,
    tmp[layer].clickables,
    funcs[layer].clickables,
  );
}

function setupBuyables(layer) {
  for (const id in layers[layer].buyables) {
    if (isPlainObject(layers[layer].buyables[id])) {
      const buyable = layers[layer].buyables[id];
      buyable.actualCostFunction = buyable.cost;
      buyable.cost = function (x = player[this.layer].buyables[this.id]) {
        return layers[this.layer].buyables[this.id].actualCostFunction(x);
      };
      buyable.actualEffectFunction = buyable.effect;
      buyable.effect = function (x = player[this.layer].buyables[this.id]) {
        return layers[this.layer].buyables[this.id].actualEffectFunction(x);
      };
    }
  }
}

function checkDecimalNaN(x) {
  return x instanceof Decimal && x.neq(x);
}
