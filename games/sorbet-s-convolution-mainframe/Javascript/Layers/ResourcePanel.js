addLayer("resourcepanel", {
    startData() {return {
        unlocked: true,
        points: new Decimal(0),
        resourceText: ``,
        mineralsText: ``,
        artifactText: ``
    }},
    update() {
        let txt = ``

        txt += `<big style="color: ${temp.universe.color}; text-shadow: 0 0 10px ${temp.universe.color}">${formatWhole(player.universe.points)}</big> Destroyed Universes<br>`
        if (player.universe.points.gte(10)) {txt += `<lightGlow-><big>${format(player.universe.godParticles)}</big></lightGlow-> God Particles<br><br>`} else {txt += `Resource Unlocks at Universe 11<br><br>`}

        if (hasMilestone("ach", 11)) {txt += `<big><nerfRed>${formatWhole(player.lam.inputCount())}</nerfRed></big> ???<br><br>`} else {txt += `Resource Unlocks after some achievment is unlocked...`}

        txt += `<big style="color: ${temp.LArtifact.color}; text-shadow: 0 0 10px ${temp.LArtifact.color}">${formatWhole(player.LArtifact.points)}</big> Discovered Layer Artifacts<br><br>`

        txt += `<big style="color: ${temp.money.color}; text-shadow: 0 0 10px ${temp.money.color}">${format(player.money.points)}</big> Money<br><br>`

        if (player.universe.points.gte(16)) {txt += `<big style="color: ${temp.LPrestige.color}; text-shadow: 0 0 10px ${temp.LPrestige.color}">${format(player.LPrestige.points)}</big> Prestige Essence<br><br>`} else {txt += `Resource Unlocks at Universe 17<br><br>`}

        if (player.universe.points.gte(19)) {txt += `<big style="color: ${temp.booster.color}; text-shadow: 0 0 10px ${temp.booster.color}">${formatWhole(player.booster.points)}</big> Boosters<br>`} else {txt += `Resource Unlocks at Universe 20<br>`}
        if (player.universe.points.gte(35)) {txt += `<big style="color: gold; text-shadow: 0 0 10px gold">${formatWhole(player.booster.altered.golden)}</big> Golden Boosters<br>`} else {txt += `Resource Unlocks at Universe 36<br>`}
        if (player.universe.points.gte(35)) {txt += `<big style="color: dimgray; text-shadow: 0 0 10px dimgray">${formatWhole(player.booster.altered.heavy)}</big> Heavy Boosters<br><br>`} else {txt += `Resource Unlocks at Universe 36<br><br>`}
        if (player.universe.points.gte(45)) {txt += `<big style="color: #EEE; text-shadow: 0 0 10px #EEE">${format(player.sorbet.points)}</big> ${temp.sorbet.resource}<br>`} else {txt += `Resource Unlocks at Universe 46<br>`}

        if (player.universe.points.gte(67)) {txt += `<big style="text-shadow: 0 0 10px white">${format(player.sorbet.colors.pure)}</big> Pure Globs<br>`} else {txt += `Resource Unlocks at Universe 68<br>`}
        if (player.universe.points.gte(67)) {txt += `<big style="color: black; text-shadow: 0 0 10px white">${format(player.sorbet.colors.dark)}</big> Dark Globs<br>`} else {txt += `Resource Unlocks at Universe 68<br>`}
        if (player.universe.points.gte(69)) {txt += `<big style="color: #007600; text-shadow: 0 0 10px #DDDDDD40">${format(player.sorbet.colors.greenCrystal)}</big> Green Crystal Globs<br>`} else {txt += `Resource Unlocks at Universe 70<br>`}
        if (player.universe.points.gte(69)) {txt += `<big style="color: #760000; text-shadow: 0 0 10px #DDDDDD40">${format(player.sorbet.colors.redCrystal)}</big> Red Crystal Globs<br>`} else {txt += `Resource Unlocks at Universe 70<br>`}
        if (player.universe.points.gte(70)) {txt += `<big style="color: #766576; text-shadow: 0 0 10px #EEEEEE60">${format(player.sorbet.colors.shark)}</big> Sharkskin Globs<br>`} else {txt += `Resource Unlocks at Universe 71<br>`}
        if (player.universe.points.gte(70)) {txt += `<big style="text-shadow: 0 0 15px #333">${format(player.sorbet.colors.ink)}</big> Inkfur Globs<br>`} else {txt += `Resource Unlocks at Universe 71<br>`}
        if (player.universe.points.gte(73)) {txt += `<big style="text-shadow: 0 0 10px #FFFFFF66">${format(player.sorbet.colors.mimic)}</big> Mimic Globs<br>`} else {txt += `Resource Unlocks at Universe 74<br>`}
        if (player.universe.points.gte(75)) {txt += `<big style="text-shadow: 0 0 5px #870000">${format(player.sorbet.colors.true)}</big> True Globs<br>`} else {txt += `Resource Unlocks at Universe 76<br>`}
        if (player.universe.points.gte(76)) {txt += `<big style="color: #88FF88; text-shadow: 0 0 10px #66FF66AA">${format(player.sorbet.colors.plant)}</big> Plant Globs<br>`} else {txt += `Resource Unlocks at Universe 77<br>`}
        if (player.universe.points.gte(76)) {txt += `<big style="color: #CC9900; text-shadow: 0 0 10px #BB8800">${format(player.sorbet.colors.magma)}</big> Magma Globs<br>`} else {txt += `Resource Unlocks at Universe 77<br>`}
        if (player.universe.points.gte(76)) {txt += `<big style="color: #3333AA; text-shadow: 0 0 10px #222277">${format(player.sorbet.colors.alien)}</big> Alien Globs<br><br>`} else {txt += `Resource Unlocks at Universe 77<br><br>`}

        if (player.universe.points.gte(80)) {txt += `<big style="color: ${temp.eh.color}; text-shadow: 0 0 10px ${temp.eh.color}">${format(player.eh.points)}</big> Singularities<br><br>`} else {txt += `Resource Unlocks at Universe 81<br><br>`}

        if (player.universe.points.gte(81)) {txt += `<big style="color: ${temp.colin.color}; text-shadow: 0 0 10px ${temp.colin.color}">${formatWhole(player.colin.points)}</big> "Motivation"<br>`} else {txt += `Resource Unlocks at Universe 82<br>`}
        if (player.universe.points.gte(91)) {txt += `<big style="color: silver; text-shadow: 0 0 6px silver;">${format(player.colin.distance)}</big> Distance<br>`} else {txt += `Resource unlocks at Universe 91<br>`}
        
        player.resourcepanel.resourceText = txt

        txt = ``

        player.resourcepanel.mineralsText = txt

        txt = ``

        

    },
    symbol: "<small>PAN</small>",
    layerShown() {return options.enableResourcePanel},
    row: "side",
    type: "none",
    tooltip: "Resource Panel",
    microtabs: {
        index: {
            "Layer Resources": {
                content: ["blank", ["display-text", function() {return player.resourcepanel.resourceText}]],
            }
        }
    },
    tabFormat: [
        ["display-text", "<h1>Resource Panel</h1>"],
        "blank",
        ["microtabs", "index"]
    ],
    componentStyles: {
        "microtabs"() {return {"border-color":"transparent"}}
    }
})