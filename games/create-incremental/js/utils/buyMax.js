function buyMax(item = "None") {
	// Optimisation levels:
	// Very Bad - bascially just spams the buy button
	// Bad - Very Bad but does multiple per attempt (doesn't get the exact amount right)
	// Good - uses a limited amount of checks that can't scale infinitely / can rarely scale infinitely
	// Very Good - has no noticable lag spike
	// Super Good - uses a set amount of checks that cannot scale
	// Perfect - uses a single check / equation

	// Power Pylons
	// Current Optimisation - Very Good

	// Editors Note:
	// What the fuck is this bullshit

	if (item === "Power") {
		const pylons = [
			{
				// PPyA
				pylon() {
					return player.P.pylobA;
				},
				unlocked() {
					return tmp.P.clickables[11].unlocked;
				},
				clickableID: 11,
				spends: "points",
				exponent(amount) {
					let expo = new Decimal(1.5);
					if (hasMilestone("P", 6)) expo = expo.sub(0.05);
					if (hasUpgrade("HC", 33)) expo = expo.sub(0.2);
					if (amount.gte(1001)) expo = expo.add(amount.sub(1000).div(100).pow(2));
					return expo;
				},
				divisor() {
					let divi = new Decimal(1);
					if (hasMilestone("P", 9)) divi = divi.times(player.SR.points.add(1).pow(6));
					if (hasUpgrade("HC", 34)) divi = divi.times(100000);
					return divi;
				},
				purchasing: "pylobA",
				aaaaaaaaaa: "pylonA",
			},
			{
				// PPyB
				pylon() {
					return player.P.pylobB;
				},
				unlocked() {
					return tmp.P.clickables[12].unlocked;
				},
				clickableID: 12,
				spends: "pylonA",
				exponent(amount) {
					let expo = new Decimal(2);
					if (hasMilestone("P", 6)) expo = expo.sub(0.05);
					if (hasUpgrade("HC", 33)) expo = expo.sub(0.2);
					if (amount.gte(1001)) expo = expo.add(amount.sub(1000).div(100).pow(2));
					return expo;
				},
				divisor() {
					let divi = new Decimal(1);
					if (hasMilestone("P", 9)) divi = divi.times(player.SR.points.add(1).pow(5));
					if (hasUpgrade("HC", 34)) divi = divi.times(100000);
					return divi;
				},
				purchasing: "pylobB",
				aaaaaaaaaa: "pylonB",
			},
			{
				// PPyC
				pylon() {
					return player.P.pylobC;
				},
				unlocked() {
					return tmp.P.clickables[13].unlocked;
				},
				clickableID: 13,
				spends: "pylonB",
				exponent(amount) {
					let expo = new Decimal(2.5);
					if (hasMilestone("P", 6)) expo = expo.sub(0.05);
					if (hasUpgrade("HC", 33)) expo = expo.sub(0.2);
					if (amount.gte(1001)) expo = expo.add(amount.sub(1000).div(100));
					return expo;
				},
				divisor() {
					let divi = new Decimal(1);
					if (hasMilestone("P", 9)) divi = divi.times(player.SR.points.add(1).pow(4));
					if (hasUpgrade("HC", 34)) divi = divi.times(100000);
					return divi;
				},
				purchasing: "pylobC",
				aaaaaaaaaa: "pylonC",
			},
			{
				// PPyD
				pylon() {
					return player.P.pylobD;
				},
				unlocked() {
					return tmp.P.clickables[14].unlocked;
				},
				clickableID: 14,
				spends: "pylonC",
				exponent(amount) {
					let expo = new Decimal(3);
					if (hasMilestone("P", 6)) expo = expo.sub(0.05);
					if (hasUpgrade("HC", 33)) expo = expo.sub(0.2);
					if (amount.gte(1001)) expo = expo.add(amount.sub(1000).div(100));
					return expo;
				},
				divisor() {
					let divi = new Decimal(1);
					if (hasMilestone("P", 9)) divi = divi.times(player.SR.points.add(1).pow(3));
					if (hasUpgrade("HC", 34)) divi = divi.times(100000);
					return divi;
				},
				purchasing: "pylobD",
				aaaaaaaaaa: "pylonD",
			},
			{
				// PPyE
				pylon() {
					return player.P.pylobE;
				},
				unlocked() {
					return tmp.P.clickables[15].unlocked;
				},
				clickableID: 15,
				spends: "pylonD",
				exponent(amount) {
					let expo = new Decimal(3.5);
					if (hasMilestone("P", 6)) expo = expo.sub(0.05);
					if (hasUpgrade("HC", 33)) expo = expo.sub(0.2);
					if (amount.gte(1001)) expo = expo.add(amount.sub(1000).div(100));
					return expo;
				},
				divisor() {
					let divi = new Decimal(1);
					if (hasMilestone("P", 9)) divi = divi.times(player.SR.points.add(1).pow(2));
					if (hasUpgrade("HC", 34)) divi = divi.times(100000);
					return divi;
				},
				purchasing: "pylobE",
				aaaaaaaaaa: "pylonE",
			},
			{
				// PPyF
				pylon() {
					return player.P.pylobF;
				},
				unlocked() {
					return tmp.P.clickables[16].unlocked;
				},
				clickableID: 16,
				spends: "pylonE",
				exponent(amount) {
					let expo = new Decimal(4);
					if (hasMilestone("P", 6)) expo = expo.sub(0.05);
					if (hasUpgrade("HC", 33)) expo = expo.sub(0.2);
					if (amount.gte(1001)) expo = expo.add(amount.sub(1000).div(100));
					return expo;
				},
				divisor() {
					let divi = new Decimal(1);
					if (hasMilestone("P", 9)) divi = divi.times(player.SR.points.add(1));
					if (hasUpgrade("HC", 34)) divi = divi.times(100000);
					return divi;
				},
				purchasing: "pylobF",
				aaaaaaaaaa: "pylonF",
			},
		];
		for (let index = 0; index < pylons.length; index++) {
			const pylondata = pylons[index];
			const baseAmount = pylondata.pylon();
			const id = pylondata.clickableID;
			let tobuy = new Decimal(0);

			if (pylondata.unlocked()) {
				if (tmp.P.clickables[id].canClick) {
					tobuy = baseAmount.div(32).add(1);
					while (costFormula(baseAmount, pylondata, tobuy).lte(player.P[pylondata.spends])) {
						tobuy = tobuy.times(2);
					}

					let lastamount = tobuy.div(2);
					let previous = tobuy.div(2);
					let lastchange = "increase";

					for (let index = 0; index <= 20; index++) {
						if (
							costFormula(baseAmount, pylondata, tobuy).lte(player.P[pylondata.spends]) &&
							lastchange == "increase"
						) {
							lastchange = "decrease";
							lastamount = previous;
						}
						if (
							costFormula(baseAmount, pylondata, tobuy).gt(player.P[pylondata.spends]) &&
							lastchange == "decrease"
						) {
							lastchange = "increase";
							lastamount = previous;
						}
						previous = tobuy;
						tobuy = tobuy.add(lastamount).div(2);
					}
				}
				if (tobuy.gte(1)) {
					if (!hasMilestone("P", 11)) {
						player.P[pylondata.spends] = player.P[pylondata.spends].sub(
							costFormula(baseAmount, pylondata, tobuy)
						);
						if (player.P[pylondata.spends].lt(0)) player.P[pylondata.spends] = new Decimal(0);
					}
					player.P[pylondata.purchasing] = player.P[pylondata.purchasing].add(tobuy).floor();
					player.P[pylondata.aaaaaaaaaa] = player.P[pylondata.aaaaaaaaaa].add(tobuy).floor();
				}
			}
		}
	}

	// Cash Buyables
	// Current Optimisation - Very Good

	if (item === "Cash") {
		let buy1 = player.points.add(1).max(1).log(10).sub(5).ceil();
		if (hasMilestone("UMF", 2)) buy1 = buy1.times(tmp.UMF.milestones[2].effect);
		if (buy1.gte(getBuyableAmount("U", 11))) setBuyableAmount("U", 11, buy1);

		const buy2data = {
			amount() {
				return getBuyableAmount("U", 12);
			},
			unlocked() {
				return tmp.U.buyables[12].unlocked;
			},
			cost(amount) {
				return layers.U.buyables[12].cost(amount);
			},
		};

		let tobuy = new Decimal(0);
		if (buy2data.unlocked() && layers.U.buyables[12].cost(getBuyableAmount("U", 12)).lte(player.points)) {
			tobuy = buy2data.amount().div(32).add(1);
			while (buy2data.cost(tobuy.add(getBuyableAmount("U", 12))).lte(player.points)) {
				tobuy = tobuy.times(2);
			}

			let lastamount = tobuy.div(2);
			let previous = tobuy.div(2);
			let lastchange = "increase";

			for (let index = 0; index <= 20; index++) {
				if (
					buy2data.cost(tobuy.add(getBuyableAmount("U", 12))).lte(player.points) &&
					lastchange == "increase"
				) {
					lastchange = "decrease";
					lastamount = previous;
				}
				if (buy2data.cost(tobuy.add(getBuyableAmount("U", 12))).gt(player.points) && lastchange == "decrease") {
					lastchange = "increase";
					lastamount = previous;
				}
				previous = tobuy;
				tobuy = tobuy.add(lastamount).div(2);
			}
		}
		if (tobuy.gte(1)) {
			addBuyables("U", 12, tobuy.ceil());
		}
	}

	// Rebirth Buyables
	// Current Optimisation: Perfect

	if (item === "Rebirth") {
		let buy1expo = new Decimal(2);
		if (hasChallenge("SR", 21)) buy1expo = buy1expo.sub(0.5);
		let buy1 = player.R.points
			.div(20000)
			.add(1)
			.max(1)
			.log(10)
			.div(new Decimal(1.2).max(1).log(10))
			.pow(new Decimal(1).div(buy1expo))
			.ceil();

		if (buy1.gte(getBuyableAmount("R", 11))) setBuyableAmount("R", 11, buy1);

		let buy2expo = new Decimal(2);
		if (hasChallenge("SR", 21)) buy2expo = buy2expo.sub(0.25);
		let buy2 = player.R.points
			.div(1000000)
			.add(1)
			.max(1)
			.log(10)
			.div(new Decimal(3).max(1).log(10))
			.pow(new Decimal(1).div(buy2expo))
			.ceil();

		if (buy2.gte(getBuyableAmount("R", 12))) setBuyableAmount("R", 12, buy2);
	}

	// Matter Buyables
	// Dark Matter Optimisation: Very Good
	// Exotic Matter Optimisation: Very Good

	if (item === "DMatter") {
		let countmult = new Decimal(1);
		let buy1;
		if (hasMilestone("BH", 0)) countmult = countmult.times(2);
		if (player.DM.points.gte(Decimal.times(100, Decimal.pow(2, 400)))) {
			buy1 = player.DM.points.div(100).max(1).log(2).div(400).pow(0.5).times(401).ceil().times(countmult).add(1);
		} else {
			buy1 = player.DM.points.div(100).max(1).log(2).floor().times(countmult).add(1);
		}
		if (buy1.gte(getBuyableAmount("DM", 11))) setBuyableAmount("DM", 11, buy1);

		let tobuy = new Decimal(0);
		if (layers.DM.buyables[12].cost(getBuyableAmount("DM", 12)).lte(player.DM.points)) {
			tobuy = getBuyableAmount("DM", 12).div(32).add(1);
			while (layers.DM.buyables[12].cost(tobuy.add(getBuyableAmount("DM", 12))).lte(player.DM.points)) {
				tobuy = tobuy.times(2);
			}

			let lastamount = tobuy.div(2);
			let previous = tobuy.div(2);
			let lastchange = "increase";

			for (let index = 0; index <= 20; index++) {
				if (
					layers.DM.buyables[12].cost(tobuy.add(getBuyableAmount("DM", 12))).lte(player.DM.points) &&
					lastchange == "increase"
				) {
					lastchange = "decrease";
					lastamount = previous;
				}
				if (
					layers.DM.buyables[12].cost(tobuy.add(getBuyableAmount("DM", 12))).gt(player.DM.points) &&
					lastchange == "decrease"
				) {
					lastchange = "increase";
					lastamount = previous;
				}
				previous = tobuy;
				tobuy = tobuy.add(lastamount).div(2);
			}
		}
		if (tobuy.gte(1)) {
			addBuyables("DM", 12, tobuy.ceil());
		}

		let buyBH1;
		let buyBH2;
		if (player.BH.points.gt(0)) {
			buyBH1 = player.BH.points
				.max(1)
				.log(1000)
				.max(1)
				.log(1.1).mul(2)
				.ceil();
			buyBH2 = player.BH.points
				.max(1)
				.log(1e6)
				.max(1)
				.log(1.4).mul(2)
				.ceil();

			if (buyBH1.gte(getBuyableAmount("BH", 11))) setBuyableAmount("BH", 11, buyBH1);
			if (buyBH2.gte(getBuyableAmount("BH", 12))) setBuyableAmount("BH", 12, buyBH2);
			console.log(format(buyBH1))
		}
	}

	if (item === "EMatter") {
		let buy1;
		if (player.EM.points.div(10).add(1).max(1).log(1.5).gte(250)) {
			buy1 = player.EM.points.div(10).add(1).max(1).log(1.5);
			buy1 = buy1.sub(250).pow(0.5).add(250);
		} else {
			buy1 = player.EM.points.div(10).add(1).max(1).log(1.5);
		}
		if (hasUpgrade("EM", 22)) buy1 = buy1.times(2);
		buy1 = buy1.floor().add(1);

		if (buy1.gte(getBuyableAmount("EM", 11))) {
			setBuyableAmount("EM", 11, buy1);
			player.EM.points = player.EM.points.sub(layers.EM.buyables[11].cost(buy1.sub(1)));
		}

		let buy2;
		if (player.EM.points.div(1e25).add(1).max(1).log(5).gte(250)) {
			buy2 = player.EM.points.div(1e25).add(1).max(1).log(5);
			buy2 = buy2.sub(150).pow(0.5).add(150);
		} else {
			buy2 = player.EM.points.div(1e25).add(1).max(1).log(5);
		}
		if (hasUpgrade("EM", 22)) buy2 = buy2.times(2);
		buy2 = buy2.floor().add(1);

		if (buy2.gte(getBuyableAmount("EM", 12))) {
			setBuyableAmount("EM", 12, buy2);
			player.EM.points = player.EM.points.sub(layers.EM.buyables[12].cost(buy2.sub(1)));
		}

		if (player.EM.points.lt(0)) player.EM.points = new Decimal(0);
	}
}

function costFormula(baseAmount, pylondata, tobuy) {
	const newTotal = baseAmount.add(tobuy);
	const divisor = pylondata.divisor();
	return pylondata.exponent(newTotal).pow(newTotal).div(divisor);
}
