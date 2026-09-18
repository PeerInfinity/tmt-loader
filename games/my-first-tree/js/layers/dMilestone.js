addLayer("d", {
    name: "D layer", // Privalomas arba nebūtinas sluoksnio pavadinimas
    symbol: "D", // Raidė, kuri rodoma ant paties mygtuko apskritimo
    position: 0, // Horizontali mygtuko pozicija eilutėje
    row: 4, // Eilutė, kurioje yra mygtukas (0 yra pirmoji eilutė)
    
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    
    color: "#ff9900",
    requires: new Decimal(5), // Kiek reikia turėti bazinio resurso, kad gautumėte D tašką
    resource: "D letter points", // Valiutos, kurią gaunate, pavadinimas
    baseResource: "C letter points", // Valiutos, kuria mokate, pavadinimas
    
    baseAmount() { return player.c.points }, // Paima esamą C sluoksnio taškų kiekį
    type: "static", // static: kaina priklauso nuo to, kiek C taškų jau turite užsiauginę
    exponent: 0, // Valiutos gavimo eksponentė
    
    gainMult() { // Valiutos gavimo daugikliai iš patobulinimų
        let gain = new Decimal(1)
        if (hasUpgrade("c", 12)) gain = gain.times(2000)
        return gain
    },
    
    gainExp() { // Valiutos gavimo eksponentės bonusai
        return new Decimal(1)
    },

    // 🔴 RAUDONAS ŠVYTĖJIMAS: Užsidega aplink mygtuką, kai pasiekiate reikiamą A taškų kiekį
    nodeStyle() {
        if (tmp[this.layer].canReset) {
            return {
                "box-shadow": "0px 0px 25px #0004ff",
                "border-color": "#0004ff"
            }
        }
        return {}
    },

    autoPrestige() {
        // AUTO PASIEKIMAI // Nuperka tašką tik tada, kai turite B pasiekimą IR kai tikrai užtenka taškų kainai
        return hasMilestone('d', 10) || hasMilestone('d', '10')
    },

    // 🌟 KODAS, KAD NEDIINGTŲ: Užtikrina, kad jūsų turimi B taškai ir patobulinimai niekur nedingtų po pirkimo
    keepFeatures() {
        return true;
    },

    // 🌟 KODAS, KAD NEDINGTŲ: Sluoksnis išlieka matomas, jei turite bent 10 A taškų ARBA jei jau esate nusipirkę bent 1 B tašką
    layerShown() {
        // Rodoma tik tada, kai žaidėjas turi bent 10 A taškų ARBA jau yra gavęs bent 1 B tašką
        return player.c.points.gte(10) || player[this.layer].best.gte(1)
    },
    
    //layerShown() {
        //return player.a.points.gte(10) || player[this.layer].best.gte(1) || player[this.layer].unlocked;
    //},

    hotkeys: [
        { key: "d", description: "D: Reset for D letter points", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    
    branches: ["c"], // Jungiamoji linija, einanti į C sluoksnį
    
    milestones: {
    1: {
    requirementDescription: "1 D letter points",
    effectDescription: "Auto A points generation",
    done() { return player.d.points.gte(1) },
    
    // STILIAUS PATOBULINIMAS:
    style() {
        return {
            "background-color": player[this.layer].milestones.includes(this.id) ? "#4CAF50" : "#222222", // Žalias jei gautas, tamsiai pilkas jei ne
            "border": "2px solid #FFD700", // Auksinis rėmelis
            "border-radius": "15px", // Suapvalinti kampai
            "box-shadow": "0px 0px 10px #FFD700", // Švytėjimo efektas
            "color": "#FFFFFF", // Balta teksto spalva
            "padding": "10px",
            "width": "750px", // Pailgina bloką horizontaliai (galite keisti skaičių)
            "min-height": "100px", // Jei norite, kad būtų ir aukštesnis vertikaliai
            "padding": "15px 30px", // Prideda daugiau vietos vafliams viduje (viršuj/apačioj ir šonuose)
            "margin": "10px auto", // Centruoja pailgintą bloką ekrane
        }
    }
},
    2: {
        requirementDescription: "2 D letter points",
        effectDescription: "Auto B points generation",
        done() { return player.d.points.gte(2) },
        unlocked()
        {
return hasMilestone('d', 1)
},
         style() {
        return {
            "background-color": player[this.layer].milestones.includes(this.id) ? "#4CAF50" : "#222222", // Žalias jei gautas, tamsiai pilkas jei ne
            "border": "2px solid #FFD700", // Auksinis rėmelis
            "border-radius": "15px", // Suapvalinti kampai
            "box-shadow": "0px 0px 10px #FFD700", // Švytėjimo efektas
            "color": "#FFFFFF", // Balta teksto spalva
            "padding": "10px",
            "width": "750px", // Pailgina bloką horizontaliai (galite keisti skaičių)
            "min-height": "100px", // Jei norite, kad būtų ir aukštesnis vertikaliai
            "padding": "15px 30px", // Prideda daugiau vietos vafliams viduje (viršuj/apačioj ir šonuose)
            "margin": "10px auto", // Centruoja pailgintą bloką ekrane
        }
    }
    },
    3: {
        requirementDescription: "3 D letter points",
        effectDescription: "Auto C points generation",
        done() { return player.d.points.gte(3) },
        unlocked()
        {
return hasMilestone('d', 2)
},
         style() {
        return {
            "background-color": player[this.layer].milestones.includes(this.id) ? "#4CAF50" : "#222222", // Žalias jei gautas, tamsiai pilkas jei ne
            "border": "2px solid #FFD700", // Auksinis rėmelis
            "border-radius": "15px", // Suapvalinti kampai
            "box-shadow": "0px 0px 10px #FFD700", // Švytėjimo efektas
            "color": "#FFFFFF", // Balta teksto spalva
            "padding": "10px",
            "width": "750px", // Pailgina bloką horizontaliai (galite keisti skaičių)
            "min-height": "100px", // Jei norite, kad būtų ir aukštesnis vertikaliai
            "padding": "15px 30px", // Prideda daugiau vietos vafliams viduje (viršuj/apačioj ir šonuose)
            "margin": "10px auto", // Centruoja pailgintą bloką ekrane
        }
    }
    },    
    4: {
        requirementDescription: "4 D letter points",
        effectDescription: "x2 points gain",
        done() { return player.d.points.gte(4) },
        unlocked()
        {
return hasMilestone('d', 3)
},
 style() {
        return {
            "background-color": player[this.layer].milestones.includes(this.id) ? "#4CAF50" : "#222222", // Žalias jei gautas, tamsiai pilkas jei ne
            "border": "2px solid #FFD700", // Auksinis rėmelis
            "border-radius": "15px", // Suapvalinti kampai
            "box-shadow": "0px 0px 10px #FFD700", // Švytėjimo efektas
            "color": "#FFFFFF", // Balta teksto spalva
            "padding": "10px",
            "width": "750px", // Pailgina bloką horizontaliai (galite keisti skaičių)
            "min-height": "100px", // Jei norite, kad būtų ir aukštesnis vertikaliai
            "padding": "15px 30px", // Prideda daugiau vietos vafliams viduje (viršuj/apačioj ir šonuose)
            "margin": "10px auto", // Centruoja pailgintą bloką ekrane
        }
    }
    },
    5: {
        requirementDescription: "5 D letter points",
        effectDescription: "x2.5 points gain",
        done() { return player.d.points.gte(5) },
        unlocked()
        {
return hasMilestone('d', 4)
},
 style() {
        return {
            "background-color": player[this.layer].milestones.includes(this.id) ? "#4CAF50" : "#222222", // Žalias jei gautas, tamsiai pilkas jei ne
            "border": "2px solid #FFD700", // Auksinis rėmelis
            "border-radius": "15px", // Suapvalinti kampai
            "box-shadow": "0px 0px 10px #FFD700", // Švytėjimo efektas
            "color": "#FFFFFF", // Balta teksto spalva
            "padding": "10px",
            "width": "750px", // Pailgina bloką horizontaliai (galite keisti skaičių)
            "min-height": "100px", // Jei norite, kad būtų ir aukštesnis vertikaliai
            "padding": "15px 30px", // Prideda daugiau vietos vafliams viduje (viršuj/apačioj ir šonuose)
            "margin": "10px auto", // Centruoja pailgintą bloką ekrane
        }
    }
    },
    6: {
        requirementDescription: "6 D letter points",
        effectDescription: "x3 points gain",
        done() { return player.d.points.gte(6) },
        unlocked()
        {
return hasMilestone('d', 5)
},
 style() {
        return {
            "background-color": player[this.layer].milestones.includes(this.id) ? "#4CAF50" : "#222222", // Žalias jei gautas, tamsiai pilkas jei ne
            "border": "2px solid #FFD700", // Auksinis rėmelis
            "border-radius": "15px", // Suapvalinti kampai
            "box-shadow": "0px 0px 10px #FFD700", // Švytėjimo efektas
            "color": "#FFFFFF", // Balta teksto spalva
            "padding": "10px",
            "width": "750px", // Pailgina bloką horizontaliai (galite keisti skaičių)
            "min-height": "100px", // Jei norite, kad būtų ir aukštesnis vertikaliai
            "padding": "15px 30px", // Prideda daugiau vietos vafliams viduje (viršuj/apačioj ir šonuose)
            "margin": "10px auto", // Centruoja pailgintą bloką ekrane
        }
    }
    },
    7: {
        requirementDescription: "7 D letter points",
        effectDescription: "x4 points gain",
        done() { return player.d.points.gte(7) },
        unlocked()
        {
return hasMilestone('d', 6)
},
 style() {
        return {
            "background-color": player[this.layer].milestones.includes(this.id) ? "#4CAF50" : "#222222", // Žalias jei gautas, tamsiai pilkas jei ne
            "border": "2px solid #FFD700", // Auksinis rėmelis
            "border-radius": "15px", // Suapvalinti kampai
            "box-shadow": "0px 0px 10px #FFD700", // Švytėjimo efektas
            "color": "#FFFFFF", // Balta teksto spalva
            "padding": "10px",
            "width": "750px", // Pailgina bloką horizontaliai (galite keisti skaičių)
            "min-height": "100px", // Jei norite, kad būtų ir aukštesnis vertikaliai
            "padding": "15px 30px", // Prideda daugiau vietos vafliams viduje (viršuj/apačioj ir šonuose)
            "margin": "10px auto", // Centruoja pailgintą bloką ekrane
        }
    }
    },
    8: {
        requirementDescription: "8 D letter points",
        effectDescription: "x5 points gain",
        done() { return player.d.points.gte(8) },
        unlocked()
        {
return hasMilestone('d', 7)
},
 style() {
        return {
            "background-color": player[this.layer].milestones.includes(this.id) ? "#4CAF50" : "#222222", // Žalias jei gautas, tamsiai pilkas jei ne
            "border": "2px solid #FFD700", // Auksinis rėmelis
            "border-radius": "15px", // Suapvalinti kampai
            "box-shadow": "0px 0px 10px #FFD700", // Švytėjimo efektas
            "color": "#FFFFFF", // Balta teksto spalva
            "padding": "10px",
            "width": "750px", // Pailgina bloką horizontaliai (galite keisti skaičių)
            "min-height": "100px", // Jei norite, kad būtų ir aukštesnis vertikaliai
            "padding": "15px 30px", // Prideda daugiau vietos vafliams viduje (viršuj/apačioj ir šonuose)
            "margin": "10px auto", // Centruoja pailgintą bloką ekrane
        }
    }
    },
    9: {
        requirementDescription: "9 D letter points",
        effectDescription: "x6 points gain",
        done() { return player.d.points.gte(9) },
        unlocked()
        {
return hasMilestone('d', 8)
},
 style() {
        return {
            "background-color": player[this.layer].milestones.includes(this.id) ? "#4CAF50" : "#222222", // Žalias jei gautas, tamsiai pilkas jei ne
            "border": "2px solid #FFD700", // Auksinis rėmelis
            "border-radius": "15px", // Suapvalinti kampai
            "box-shadow": "0px 0px 10px #FFD700", // Švytėjimo efektas
            "color": "#FFFFFF", // Balta teksto spalva
            "padding": "10px",
            "width": "750px", // Pailgina bloką horizontaliai (galite keisti skaičių)
            "min-height": "100px", // Jei norite, kad būtų ir aukštesnis vertikaliai
            "padding": "15px 30px", // Prideda daugiau vietos vafliams viduje (viršuj/apačioj ir šonuose)
            "margin": "10px auto", // Centruoja pailgintą bloką ekrane
        }
    }
    },
    10: {
        requirementDescription: "10 D letter points",
        effectDescription: "Auto D points generation and x10 points gain",
        done() { return player.d.points.gte(10) },
        unlocked()
        {
return hasMilestone('d', 9)
},
 style() {
        return {
            "background-color": player[this.layer].milestones.includes(this.id) ? "#4CAF50" : "#222222", // Žalias jei gautas, tamsiai pilkas jei ne
            "border": "2px solid #FFD700", // Auksinis rėmelis
            "border-radius": "15px", // Suapvalinti kampai
            "box-shadow": "0px 0px 10px #FFD700", // Švytėjimo efektas
            "color": "#FFFFFF", // Balta teksto spalva
            "padding": "10px",
            "width": "750px", // Pailgina bloką horizontaliai (galite keisti skaičių)
            "min-height": "100px", // Jei norite, kad būtų ir aukštesnis vertikaliai
            "padding": "15px 30px", // Prideda daugiau vietos vafliams viduje (viršuj/apačioj ir šonuose)
            "margin": "10px auto", // Centruoja pailgintą bloką ekrane
        }
    }
    },
},
/*upgrades: {
    11: {
        title: "paaiskinimas",
        description: "2x points",
        cost: new Decimal(1),
        
    },
    12: {
        title: "paaiskinimas",
        description: "3x points",
        cost: new Decimal(2),
        unlocked()
        {
return hasUpgrade('p', 11)
},
    },
    21: {
        title: "paaiskinimas",
        description: "points boost points",
        cost: new Decimal(5),
        unlocked()
        {
return hasUpgrade('p', 12)
},
effect()
{
let eff = player.points.plus(2).pow(0.5)

return eff
},
 effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
    },
    
},*/

})