function buyableCostFormula(layer, id) {
    x = getBuyableAmount(layer, id)

    if (layer == 'A') {
        if (id == '11') return "1.015^(x^1.5)"
        else if (id == '12') {
             let val = "1.25^(x^1.5)" 
            if (hasUpgrade('A',53)) val = "1.25^(x^1.25)"
            return val
        }
        else if (id == '13') {
            let val = "2^(x^1.5)" 
            if (hasUpgrade('A',45)) val = "2^(x^1.38)"
            return val
        }
        else if (id == '21') return "1.1^(x^2)"
        else if (id == '22') return "1.25^(x^2)"
        else if (id == '23') {
            let val = "2^(x^2.5)" 
            if (hasUpgrade('A',55)) val = "2^(x^2.25)"
            return val
        }
    } else if (layer == 'B'){
        if (id == '11') { 
            let val = "1.2^(x^1.5)"
            if (hasUpgrade('D',16)) val = "1.05^(x^1.5)"
            return val}
        else if (id == '12') {
            let power = new Decimal("2")
            let val = "1.75^(x^"+power+")" 
            if (hasMilestone('G',2)) power = power.sub(milestoneEffect('G',2)) ; val = "1.75^(x^"+power+")"
            if (hasUpgrade('G',35)) val = "1.5^(x^"+power+")"
            return val
        }
        else if (id == '13') return "1.025*1e5^(x^2)"
        else if (id == '21') return "1.035*1e12^(x^1.5)"
        else if (id == '22') {
            let val = "1.055*1e25^(x^2)"
            if (hasUpgrade("G",34)) val = "1.055*1e22^(x^2)"
            return val
        }
        else if (id == '23') return "base*1.075*1e30^(x^1.7)"
    } else if (layer == 'D'){
        if (id == '11') return "base*1.01^x²"
        else if (id == '12') return "base*1.12^x²"
        else if (id == '13') {
            let val = "base*2.5^x^2.25"
            if (hasUpgrade('D',212)) val = "base*2.5^x^2.1"
            return val
        }
        else if (id == '14') return "base*5^x^2.25"
    }
}

function buyableBulk(layer){
    let amt = new Decimal(1)

    if (layer == 'A'){
        if (hasMilestone('B', 4)) amt = amt.times(10)
        if (hasMilestone('B', 5)) amt = amt.times(3)
        if (hasMilestone('G', 2)) amt = amt.times(3)
        if (hasMilestone('G', 5)) amt = amt.times(10)
    }
    if (layer == 'B'){
        if (hasMilestone('G', 5)) amt = amt.times(10)
        if (hasMilestone('D', 0)) amt = amt.times(5)
        if (hasMilestone('D',7)) amt = amt.times(5)
    }
    return amt
}

function getAutoBuySpeed(layer){
    let mult = new Decimal(1)
    if (layer == "A") {
        if (hasUpgrade('B', 33)) mult = mult.times(2)
        if (hasUpgrade('G', 11)) mult = mult.times(10)
        if (hasMilestone('G', 5)) mult = mult.times(5)
        if (hasMilestone('D', 0)) mult = mult.times(player.D.resets.add(1))
    }
    if (layer == "B") {
        if (hasMilestone('G', 2)) mult = mult.times(3)
        if (hasMilestone('G', 5)) mult = mult.times(5)
    }
    return mult
}

function buyAllAtOnce(layer, bulk = new Decimal(1)) {
    if (!player[layer].buyables) return
    for (let id in layers[layer].buyables) {
        if (!isNaN(id)) {
            const buyable = layers[layer].buyables[id]
            if (buyable.canAfford?.()) {
                let remaining = new Decimal(bulk)
                while (remaining.gte(1) && buyable.canAfford?.()) {
                    buyable.buy()
                    remaining = remaining.sub(1)
                }
            }
        }
    }
}

function generalizedBuyableLogic(diff, layer, condition) {
    if (!player[layer].buyables) return

    if (!player[layer].buyableTime) player[layer].buyableTime = new Decimal(0)
    player[layer].buyableTime = player[layer].buyableTime.add(diff)

    const speed = getAutoBuySpeed(layer).max(1)
    const tickInterval = new Decimal(1).div(speed)
    const bulk = buyableBulk(layer)

    const ids = Object.keys(layers[layer].buyables)
        .filter(id => !isNaN(id))
        .sort((a, b) => Number(a) - Number(b))

    while (player[layer].buyableTime.gte(tickInterval)) {
        player[layer].buyableTime = player[layer].buyableTime.sub(tickInterval)

        if (condition) {
            buyAllAtOnce(layer, bulk)
        } else {
            for (let id of ids) {
                const buyable = layers[layer].buyables[id]
                if (buyable.canAfford?.()) {
                    let remaining = new Decimal(bulk)
                    while (remaining.gte(1) && buyable.canAfford?.()) {
                        buyable.buy()
                        remaining = remaining.sub(1)
                    }
                    break
                }
            }
        }
    }
}

function safeBuy(layer, cost, currency = "points") {
    let curr = new Decimal(player[layer][currency])
    if (!curr.gte(cost)) return false
    player[layer][currency] = curr.sub(cost)
    if (player[layer][currency].lt(0) || Decimal.isNaN(player[layer][currency])) {
        player[layer][currency] = decimalZero
    }
    return true
}