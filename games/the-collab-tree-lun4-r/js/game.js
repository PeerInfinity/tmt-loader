let player;
let needCanvasUpdate = true;

const TMT_VERSION = {
  tmtNum: "2.6.6.2",
  tmtName: "Fixed Reality",
};

function getResetGain(layer, useType) {
  let type = useType;
  if (!useType) {
    type = tmp[layer].type;
    if (layers[layer].getResetGain !== undefined)
      return layers[layer].getResetGain();
  }
  if (tmp[layer].type == "none") return Decimal.dZero;
  if (tmp[layer].gainExp.eq(Decimal.dZero)) return decimalZero;
  if (type === "static") {
    if (!tmp[layer].canBuyMax || tmp[layer].baseAmount.lt(tmp[layer].requires))
      return Decimal.dOne;
    let gain = tmp[layer].baseAmount
      .div(tmp[layer].requires)
      .div(tmp[layer].gainMult)
      .max(1)
      .log(tmp[layer].base)
      .times(tmp[layer].gainExp)
      .pow(Decimal.pow(tmp[layer].exponent, -1));
    gain = gain.times(tmp[layer].directMult);
    return gain
      .floor()
      .sub(player[layer].points)
      .add(Decimal.dOne)
      .max(Decimal.dOne);
  } else if (type === "normal") {
    if (tmp[layer].baseAmount.lt(tmp[layer].requires)) return Decimal.dZero;
    let gain = tmp[layer].baseAmount
      .div(tmp[layer].requires)
      .pow(tmp[layer].exponent)
      .times(tmp[layer].gainMult)
      .pow(tmp[layer].gainExp);
    if (gain.gte(tmp[layer].softcap))
      gain = gain
        .pow(tmp[layer].softcapPower)
        .times(tmp[layer].softcap.pow(decimalOne.sub(tmp[layer].softcapPower)));
    gain = gain.times(tmp[layer].directMult);
    return gain.floor().max(Decimal.dZero);
  } else if (type === "custom") {
    return layers[layer].getResetGain();
  } else {
    return decimalZero;
  }
}

function getNextAt(layer, canMax = false, useType) {
  let type = useType;
  if (!useType) {
    type = tmp[layer].type;
    if (layers[layer].getNextAt !== undefined)
      return layers[layer].getNextAt(canMax);
  }
  if (tmp[layer].type === "none") return new Decimal(Infinity);

  if (tmp[layer].gainMult.lte(Decimal.dZero)) return new Decimal(Infinity);
  if (tmp[layer].gainExp.lte(Decimal.dZero)) return new Decimal(Infinity);

  if (type === "static") {
    if (!tmp[layer].canBuyMax) canMax = false;
    let amt = player[layer].points
      .plus(
        canMax && tmp[layer].baseAmount.gte(tmp[layer].nextAt)
          ? tmp[layer].resetGain
          : Decimal.dZero,
      )
      .div(tmp[layer].directMult);
    let extraCost = Decimal.pow(
      tmp[layer].base,
      amt.pow(tmp[layer].exponent).div(tmp[layer].gainExp),
    ).times(tmp[layer].gainMult);
    let cost = extraCost.times(tmp[layer].requires).max(tmp[layer].requires);
    if (tmp[layer].roundUpCost) cost = cost.ceil();
    return cost;
  } else if (type === "normal") {
    let next = tmp[layer].resetGain.add(1).div(tmp[layer].directMult);
    if (next.gte(tmp[layer].softcap))
      next = next
        .div(tmp[layer].softcap.pow(decimalOne.sub(tmp[layer].softcapPower)))
        .pow(decimalOne.div(tmp[layer].softcapPower));
    next = next
      .root(tmp[layer].gainExp)
      .div(tmp[layer].gainMult)
      .root(tmp[layer].exponent)
      .times(tmp[layer].requires)
      .max(tmp[layer].requires);
    if (tmp[layer].roundUpCost) next = next.ceil();
    return next;
  } else if (type === "custom") {
    return layers[layer].getNextAt(canMax);
  } else {
    return decimalZero;
  }
}

function softcap(value, cap, power = 0.5) {
  if (value.lte(cap)) return value;
  else return value.pow(power).times(cap.pow(decimalOne.sub(power)));
}

function shouldNotify(layer) {
  for (const id in tmp[layer].upgrades) {
    if (isPlainObject(layers[layer].upgrades[id])) {
      if (
        canAffordUpgrade(layer, id) &&
        !hasUpgrade(layer, id) &&
        tmp[layer].upgrades[id].unlocked
      ) {
        return true;
      }
    }
  }
  if (
    player[layer].activeChallenge &&
    canCompleteChallenge(layer, player[layer].activeChallenge)
  ) {
    return true;
  }

  if (tmp[layer].shouldNotify) return true;

  if (isPlainObject(tmp[layer].tabFormat)) {
    for (const subtab in tmp[layer].tabFormat) {
      if (subtabShouldNotify(layer, "mainTabs", subtab)) {
        tmp[layer].trueGlowColor =
          tmp[layer].tabFormat[subtab].glowColor || defaultGlow;

        return true;
      }
    }
  }

  for (const family in tmp[layer].microtabs) {
    for (const subtab in tmp[layer].microtabs[family]) {
      if (subtabShouldNotify(layer, family, subtab)) {
        tmp[layer].trueGlowColor =
          tmp[layer].microtabs[family][subtab].glowColor;
        return true;
      }
    }
  }

  return false;
}

function canReset(layer) {
  if (layers[layer].canReset !== undefined)
    return run(layers[layer].canReset, layers[layer]);
  else if (tmp[layer].type === "normal")
    return tmp[layer].baseAmount.gte(tmp[layer].requires);
  else if (tmp[layer].type === "static")
    return tmp[layer].baseAmount.gte(tmp[layer].nextAt);
  else return false;
}

function rowReset(row, layer) {
  for (const lr in ROW_LAYERS[row]) {
    if (layers[lr].doReset) {
      if (!isNaN(row)) Vue.set(player[lr], "activeChallenge", null); // Exit challenges on any row reset on an equal or higher row
      layers[lr].doReset(layer);
    } else if (tmp[layer].row > tmp[lr].row && !isNaN(row)) layerDataReset(lr);
  }
}

function layerDataReset(layer, keep = []) {
  const storedData = {
    unlocked: player[layer].unlocked,
    forceTooltip: player[layer].forceTooltip,
    noRespecConfirm: player[layer].noRespecConfirm,
    prevTab: player[layer].prevTab,
  };

  for (const thing in keep) {
    if (player[layer][keep[thing]] !== undefined)
      storedData[keep[thing]] = player[layer][keep[thing]];
  }

  Vue.set(player[layer], "buyables", getStartBuyables(layer));
  Vue.set(player[layer], "clickables", getStartClickables(layer));
  Vue.set(player[layer], "challenges", getStartChallenges(layer));
  Vue.set(player[layer], "grid", getStartGrid(layer));

  layOver(player[layer], getStartLayerData(layer));
  player[layer].upgrades = [];
  player[layer].milestones = [];
  player[layer].achievements = [];

  for (const thing in storedData) {
    player[layer][thing] = storedData[thing];
  }
}

function addPoints(layer, gain) {
  player[layer].points = player[layer].points.add(gain).max(0);
  player[layer].best = player[layer].best.max(player[layer].points);
  player[layer].total = player[layer].total.add(gain);
}

function generatePoints(layer, diff) {
  addPoints(layer, tmp[layer].resetGain.times(diff));
}

function doReset(layer, force = false) {
  if (tmp[layer].type === "none") return;
  const row = tmp[layer].row;
  if (!force) {
    if (tmp[layer].canReset === false) return;

    if (tmp[layer].baseAmount.lt(tmp[layer].requires)) return;
    let gain = tmp[layer].resetGain;
    if (tmp[layer].type === "static") {
      if (tmp[layer].baseAmount.lt(tmp[layer].nextAt)) return;
      gain = tmp[layer].canBuyMax ? gain : Decimal.dOne;
    }

    layers[layer].onPrestige?.(gain);

    addPoints(layer, gain);
    updateMilestones(layer);
    updateAchievements(layer);

    if (!player[layer].unlocked) {
      player[layer].unlocked = true;
      needCanvasUpdate = true;

      if (tmp[layer].increaseUnlockOrder) {
        const lrs = tmp[layer].increaseUnlockOrder;
        for (const lr in lrs)
          if (!player[lrs[lr]].unlocked) player[lrs[lr]].unlockOrder++;
      }
    }
  }

  if (tmp[layer].resetsNothing) return;
  tmp[layer].baseAmount = Decimal.dZero;

  for (const layerResetting in layers) {
    if (
      row >= layers[layerResetting].row &&
      (!force || layerResetting != layer)
    )
      completeChallenge(layerResetting);
  }

  player.points = row == 0 ? Decimal.dZero : getStartPoints();

  for (let x = row; x >= 0; x--) rowReset(x, layer);
  for (const r in OTHER_LAYERS) {
    rowReset(r, layer);
  }

  player[layer].resetTime = 0;

  updateTemp();
  updateTemp();
}

function resetRow(row) {
  if (
    prompt(
      'Are you sure you want to reset this row? It is highly recommended that you wait until the end of your current run before doing this! Type "I WANT TO RESET THIS" to confirm',
    ) !== "I WANT TO RESET THIS"
  )
    return;
  const preLayers = ROW_LAYERS[row - 1];
  const layers = ROW_LAYERS[row];
  const postLayers = ROW_LAYERS[row + 1];
  rowReset(row + 1, postLayers[0]);
  doReset(preLayers[0], true);
  for (const layer in layers) {
    player[layer].unlocked = false;
    if (player[layer].unlockOrder) player[layer].unlockOrder = 0;
  }
  player.points = getStartPoints();
  updateTemp();
  resizeCanvas();
}

function startChallenge(layer, x) {
  let enter = false;
  if (!player[layer].unlocked || !tmp[layer].challenges[x].unlocked) return;
  if (player[layer].activeChallenge == x) {
    completeChallenge(layer, x);
    Vue.set(player[layer], "activeChallenge", null);
  } else {
    enter = true;
  }
  doReset(layer, true);
  if (enter) {
    Vue.set(player[layer], "activeChallenge", x);
    run(layers[layer].challenges[x].onEnter, layers[layer].challenges[x]);
  }
  updateChallengeTemp(layer);
}

function canCompleteChallenge(layer, x) {
  if (x != player[layer].activeChallenge) return;
  const challenge = tmp[layer].challenges[x];
  return challenge.canComplete;
}

function completeChallenge(layer) {
  const id = player[layer].activeChallenge;
  if (!id) return;

  const completions = canCompleteChallenge(layer, id);
  if (!completions) {
    Vue.set(player[layer], "activeChallenge", null);
    layers[layer].challenges[id].onExit?.();
    return;
  }
  if (
    player[layer].challenges[id] < tmp[layer].challenges[id].completionLimit
  ) {
    needCanvasUpdate = true;
    player[layer].challenges[id] += completions;
    player[layer].challenges[id] = Math.min(
      player[layer].challenges[id],
      tmp[layer].challenges[id].completionLimit,
    );
    layers[layer].challenges[id].onComplete?.();
  }
  Vue.set(player[layer], "activeChallenge", null);
  layers[layer].challenges[id].onExit?.();
  updateChallengeTemp(layer);
}

VERSION.withoutName =
  "v" +
  VERSION.num +
  (VERSION.pre
    ? " Pre-Release " + VERSION.pre
    : VERSION.pre
    ? " Beta " + VERSION.beta
    : "");
VERSION.withName =
  VERSION.withoutName + (VERSION.name ? ": " + VERSION.name : "");

function autobuyUpgrades(layer) {
  if (!tmp[layer].upgrades) return;
  for (const id in tmp[layer].upgrades)
    if (
      isPlainObject(tmp[layer].upgrades[id]) &&
      (layers[layer].upgrades[id].canAfford === undefined ||
        layers[layer].upgrades[id].canAfford() === true)
    )
      buyUpgrade(layer, id);
}

function gameLoop(diff) {
  if (isEndgame() || tmp.gameEnded) {
    tmp.gameEnded = true;
    clearParticles();
  }

  if (tmp.gameEnded && !player.keepGoing) {
    diff = 0;
    clearParticles();
  }

  diff = Math.min(diff, maxTickLength());
  addTime(diff);
  player.points = player.points.add(tmp.pointGen.times(diff)).max(0);

  for (let x = 0; x <= maxRow; x++) {
    for (const item in TREE_LAYERS[x]) {
      const layer = TREE_LAYERS[x][item];
      player[layer].resetTime += diff;
      if (tmp[layer].passiveGeneration)
        generatePoints(layer, diff * tmp[layer].passiveGeneration);
      if (layers[layer].update) layers[layer].update(diff);
    }
  }

  for (const row in OTHER_LAYERS) {
    for (const item in OTHER_LAYERS[row]) {
      const layer = OTHER_LAYERS[row][item];
      player[layer].resetTime += diff;
      if (tmp[layer].passiveGeneration)
        generatePoints(layer, diff * tmp[layer].passiveGeneration);
      if (layers[layer].update) layers[layer].update(diff);
    }
  }

  for (let x = maxRow; x >= 0; x--) {
    for (const item in TREE_LAYERS[x]) {
      const layer = TREE_LAYERS[x][item];
      if (tmp[layer].autoPrestige && tmp[layer].canReset) doReset(layer);
      if (layers[layer].automate) layers[layer].automate();
      if (tmp[layer].autoUpgrade) autobuyUpgrades(layer);
    }
  }

  for (const row in OTHER_LAYERS) {
    for (const item in OTHER_LAYERS[row]) {
      const layer = OTHER_LAYERS[row][item];
      if (tmp[layer].autoPrestige && tmp[layer].canReset) doReset(layer);
      if (layers[layer].automate) layers[layer].automate();
      player[layer].best = player[layer].best.max(player[layer].points);
      if (tmp[layer].autoUpgrade) autobuyUpgrades(layer);
    }
  }

  for (const layer in layers) {
    if (layers[layer].milestones) updateMilestones(layer);
    if (layers[layer].achievements) updateAchievements(layer);
  }
}

function hardReset(resetOptions) {
  if (
    !confirm(
      "Are you sure you want to do this? You will lose all your progress!",
    )
  )
    return;
  player = null;
  if (resetOptions) options = null;
  save(true);
  window.location.reload();
}

let ticking = false;

let interval = setInterval(() => {
  if (player === undefined || tmp === undefined) return;
  if (tmp.gameEnded && !player.keepGoing) return;
  ticking = true;
  const now = Date.now();
  let diff = (now - player.time) / 1e3;
  const trueDiff = diff;
  if (player.offTime !== undefined) {
    if (player.offTime.remain > modInfo.offlineLimit * 3600)
      player.offTime.remain = modInfo.offlineLimit * 3600;
    if (player.offTime.remain > 0) {
      let offlineDiff = Math.max(player.offTime.remain / 10, diff);
      player.offTime.remain -= offlineDiff;
      diff += offlineDiff;
    }
    if (!options.offlineProd || player.offTime.remain <= 0)
      player.offTime = undefined;
  }
  if (player.devSpeed) diff *= player.devSpeed;
  player.time = now;
  if (needCanvasUpdate) {
    resizeCanvas();
    needCanvasUpdate = false;
  }
  tmp.scrolled = document.getElementById("treeTab")?.scrollTop > 30;
  updateTemp();
  updateOomps(diff);
  updateWidth();
  updateTabFormats();
  gameLoop(diff);
  fixNaNs();
  adjustPopupTime(trueDiff);
  updateParticles(trueDiff);
  ticking = false;
}, 50);

setInterval(() => {
  needCanvasUpdate = true;
}, 500);
