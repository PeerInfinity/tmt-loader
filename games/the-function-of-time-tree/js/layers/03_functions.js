function getMax(points, cost, expo) {
    max = new Decimal(0)
    max = max.add(Decimal.floor((((new Decimal(points).div(cost).mul(new Decimal(expo).sub(1)).add(1.01)).log10()).div(new Decimal(expo).log10()))))
    return max
}

function subCost(expo, bAmt, baseC) {
    sub = (new Decimal(expo).pow(new Decimal(bAmt).add(max)).sub(1).div(new Decimal(expo).sub(1)).sub(new Decimal(expo).pow(bAmt).sub(1).div(new Decimal(expo).sub(1)))).mul(new Decimal(baseC))
    return sub
}

function startft() {
    start = new Decimal(1)
    if (player["f"].best.gte(1e18) || hasAchievement("A", 51)) start = new Decimal(3600)
    return start
}

function buyMaxDistri(layer, type) {
    able = new Decimal(0)
    if ((layer == "f") && (type =="1")) {
        if (canBuyBuyable("f", 11)) able = able.add(1)
        if (canBuyBuyable("f", 21)) able = able.add(1)
        if (canBuyBuyable("f", 31)) able = able.add(1)
        if (canBuyBuyable("f", 41)) able = able.add(1)
        if (hasChallenge("inf",12)) able = new Decimal(1)
    }
    else if ((layer == "res") && (type =="1")) {
        if (canBuyBuyable("res", 11)) able = able.add(1)
        if (canBuyBuyable("res", 12)) able = able.add(1)
        if (hasChallenge("inf",21)) able = new Decimal(1)
    }
    else if ((layer == "res") && (type =="2")) {
        if (canBuyBuyable("res", 21)) able = able.add(1)
        if (canBuyBuyable("res", 22)) able = able.add(1)
        if (canBuyBuyable("res", 31)) able = able.add(1)
        if (canBuyBuyable("res", 32)) able = able.add(1)
        if (canBuyBuyable("res", 41)) able = able.add(1)
        if (canBuyBuyable("res", 42)) able = able.add(1)
        if (hasChallenge("inf",22)) able = new Decimal(1)
    }
    else if ((layer == "g") && (type =="1")) {
        if (canBuyBuyable("g", 11)) able = able.add(1)
        if (canBuyBuyable("g", 21)) able = able.add(1)
        if (canBuyBuyable("g", 31)) able = able.add(1)
        if (canBuyBuyable("g", 41)) able = able.add(1)
    }
    else if ((layer == "g") && (type =="2")) {
        if (canBuyBuyable("g", 12)) able = able.add(1)
        if (canBuyBuyable("g", 22)) able = able.add(1)
        if (canBuyBuyable("g", 32)) able = able.add(1)
        if (canBuyBuyable("g", 42)) able = able.add(1)
    }
    return able
}

function layer1reset() {
    let keep=[];
    {layerDataReset("f", keep);}
    {layerDataReset("u", keep);
        if (hasUpgrade("fd",13)) player["u"].upgrades = player["u"].upgrades.concat([11,12,13,14,15]);
        if (hasUpgrade("fd",13)) player["u"].upgrades = player["u"].upgrades.concat([21,22,23,24,25]);
        if (hasUpgrade("fd",13)) player["u"].upgrades = player["u"].upgrades.concat([31,32,33,34,35]);
        if (hasAchievement("A", 26)) player["u"].upgrades = player["u"].upgrades.concat([35]);
        if (hasAchievement("A", 21)) player["u"].upgrades = player["u"].upgrades.concat([21]);
        if (hasAchievement("A", 21)) player["u"].upgrades = player["u"].upgrades.concat([14]);
    }
    {layerDataReset("res", keep);
        if (hasUpgrade("fd",13)) player["res"].upgrades = player["res"].upgrades.concat([11,12,13,14,15]);
        if (hasUpgrade("fd",13)) player["res"].upgrades = player["res"].upgrades.concat([21,22,23,24,25]);
        if (hasAchievement("A", 31)) player["res"].upgrades = player["res"].upgrades.concat([15]);
    }
    {layerDataReset("tm", keep);}
    player["pu"].points = player["pu"].points.pow(0)
    setBuyableAmount("g", 11, getBuyableAmount("g", 11).mul(0))
    setBuyableAmount("g", 21, getBuyableAmount("g", 21).mul(0))
    setBuyableAmount("g", 31, getBuyableAmount("g", 31).mul(0))
    setBuyableAmount("g", 41, getBuyableAmount("g", 41).mul(0))
    player["inf"].ms3amt = player["inf"].ms3amt.mul(0)
    player["inf"].ms1amt = player["inf"].ms1amt.mul(0)
    player["g"].points = player["g"].points.pow(0)
    player.points = player.points.pow(0)
}

function layer2reset() {
    let keep=[];
    {layerDataReset("p", keep);
        if (hasAchievement("A",75)) player["p"].upgrades = player["p"].upgrades.concat([22]);
        if (hasAchievement("A", 51)) player["p"].upgrades = player["p"].upgrades.concat([23]);
        if (hasAchievement("A", 51)) player["p"].upgrades = player["p"].upgrades.concat([15]);
        if (hasAchievement("A", 51)) player["p"].upgrades = player["p"].upgrades.concat([13]);
    }
    {layerDataReset("g", keep);}
    {layerDataReset("pu", keep);
        if (hasAchievement("A", 61)) player["pu"].upgrades = player["pu"].upgrades.concat([23]);
        if (hasAchievement("A", 61)) player["pu"].upgrades = player["pu"].upgrades.concat([14]);
    }
    {layerDataReset("fd", keep);
        if (hasAchievement("A",75)) player["fd"].upgrades = player["fd"].upgrades.concat([13]);
    }
    {layerDataReset("st", keep);}
    layer1reset()
}