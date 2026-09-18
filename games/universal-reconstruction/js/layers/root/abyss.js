addLayer("abyss", {
    name: "Abyss",
    symbol: "A",
    row: 3,
    displayRow: "challenge",
    position: 0,

    layerShown: false,
    color: '#000000',
    resource: "",

    startData() { return {}},
    resetsNothing: true,

    challenges: {
        11: {
            name: `Enter the Abyss`,
            challengeDescription: `Disable Pion and Spinor upgrade autobuyers.<br>Reduce the Pion and Spinor upgrade cost nerf, but Pion and Spinor upgrades additionally increase their own costs.`,
            goalDescription() { return `${formatWhole(Math.min(player.abyss.challenges[11]+1, 4))}/${formatWhole(temp.abyss.challenges[11].completionLimit)} automation upgrades purchased` },
            completionLimit: 4,
            canComplete() { return player.abyss.challenges[11] >= 4 || [14,15,16,17].map(id => hasUpgrade('skyrmion', id)).reduce((a,b) => a+b) > player.abyss.challenges[11] },
            rewardDescription: `More Pion and Spinor upgrade autobuyers`,
            unlocked() { return hasUpgrade('inflaton', 13) || temp.inflaton.deactivated },
            color: "#37d7ff",
            onEnter() {
                ['skyrmion', 'fome', 'acceleron', 'timecube', 'inflaton'].forEach(layer => player.abyss[layer] = getStartLayerData(layer))
                for (item of abyssSavedData.skyrmion) player.abyss.skyrmion[item] = player.skyrmion[item]
                for (item of abyssSavedData.fome) player.abyss.fome[item] = player.fome[item]
                for (item of abyssSavedData.acceleron) player.abyss.acceleron[item] = player.acceleron[item]
                for (item of abyssSavedData.timecube) player.abyss.timecube[item] = player.timecube[item]
                for (item of abyssSavedData.inflaton) player.abyss.inflaton[item] = player.inflaton[item]
                
                for (layer of ['skyrmion', 'fome', 'acceleron', 'timecube', 'inflaton']) swapLayerData(layer)
                for (let i = 0; i < 10; i++) // nasty hack, don't like this, but not sure of better option
                    updateTemp()
            },
            onExit() {
                for (item of abyssSavedData.skyrmion) player.abyss.skyrmion[item] = player.skyrmion[item]
                for (item of abyssSavedData.fome) player.abyss.fome[item] = player.fome[item]
                for (item of abyssSavedData.acceleron) player.abyss.acceleron[item] = player.acceleron[item]
                for (item of abyssSavedData.timecube) player.abyss.timecube[item] = player.timecube[item]
                for (item of abyssSavedData.inflaton) player.abyss.inflaton[item] = player.inflaton[item]
                
                for (layer of ['skyrmion', 'fome', 'acceleron', 'timecube', 'inflaton']) swapLayerData(layer)
            }
        }
    },
})

function swapLayerData(layer) {
    [player[layer], player.abyss[layer]] = [player.abyss[layer], player[layer]]
}

const abyssSavedData = {
    skyrmion: ['autobuyPion', 'autobuySpinor', 'forceTooltip', 'upgradeCosts', 'upgrades'],
    fome: ['autoInfinitesimal', 'autoProtoversal', 'autoQuantum', 'autoReform', 'autoSubplanck', 'autoSubspatial', 'forceTooltip', 'lastMilestone', 'milestones', 'unlocked'],
    acceleron: ['forceTooltip', 'lastMilestone', 'milestones', 'unlockOrder', 'unlocked', 'presets', 'presetNameZero', 'presetNameOne', 'presetNameTwo'],
    timecube: ['buySquareAmount', 'forceTooltip', 'unlocked'],
    inflaton: ['autoBuild', 'autoResearch', 'forceTooltip', 'unlockOrder', 'unlocked', 'upgradeCosts', 'upgrades']
}