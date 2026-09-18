addLayer("e", {
    name: "E", // Privalomas arba nebūtinas sluoksnio pavadinimas
    symbol: "E", // Raidė, kuri rodoma ant paties mygtuko apskritimo
    position: 0, // Horizontali mygtuko pozicija eilutėje
    row: 5, // Eilutė, kurioje yra mygtukas (0 yra pirmoji eilutė)
    
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    
    color: "#ff0000",
    requires: new Decimal(10), // Kiek reikia turėti bazinio resurso, kad gautumėte e tašką
    resource: "E letter points", // Valiutos, kurią gaunate, pavadinimas
    baseResource: "D letter points", // Valiutos, kuria mokate, pavadinimas
    
    baseAmount() { return player.d.points }, // Paima esamą D sluoksnio taškų kiekį
    type: "static", // static: kaina priklauso nuo to, kiek D taškų jau turite užsiauginę
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
                "box-shadow": "0px 0px 25px #ffffff",
                "border-color": "#ffffff"
            }
        }
        return {}
    },

    autoPrestige() {
        // AUTO PASIEKIMAI // Nuperka tašką tik tada, kai turite B pasiekimą IR kai tikrai užtenka taškų kainai
        return hasMilestone('e', 10) || hasMilestone('e', '10')
    },

    // 🌟 KODAS, KAD NEDIINGTŲ: Užtikrina, kad jūsų turimi B taškai ir patobulinimai niekur nedingtų po pirkimo
    keepFeatures() {
        return true;
    },

    // 🌟 KODAS, KAD NEDINGTŲ: Sluoksnis išlieka matomas, jei turite bent 10 A taškų ARBA jei jau esate nusipirkę bent 1 B tašką
    layerShown() {
        // Rodoma tik tada, kai žaidėjas turi bent 10 A taškų ARBA jau yra gavęs bent 1 B tašką
        return player.d.points.gte(5) || player[this.layer].best.gte(1)
    },
    
    //layerShown() {
        //return player.a.points.gte(10) || player[this.layer].best.gte(1) || player[this.layer].unlocked;
    //},

    hotkeys: [
        { key: "e", description: "E: Reset for E letter points", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    
    branches: ["d"], // Jungiamoji linija, einanti į D sluoksnį
    
    milestones: {
    1: {
    requirementDescription: "1 E letter points",
    effectDescription: "x5 point boost",
    done() { return player.e.points.gte(1) },
    
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
    /*2: {
        requirementDescription: "2 E letter points",
        effectDescription: "Auto B points generation",
        done() { return player.e.points.gte(2) },
        unlocked()
        {
return hasMilestone('e', 1)
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
        requirementDescription: "3 E letter points",
        effectDescription: "Auto C points generation",
        done() { return player.e.points.gte(3) },
        unlocked()
        {
return hasMilestone('e', 2)
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
        requirementDescription: "4 E letter points",
        effectDescription: "x2 points gain",
        done() { return player.e.points.gte(4) },
        unlocked()
        {
return hasMilestone('e', 3)
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
        requirementDescription: "5 E letter points",
        effectDescription: "x2.5 points gain",
        done() { return player.e.points.gte(5) },
        unlocked()
        {
return hasMilestone('e', 4)
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
        requirementDescription: "6 E letter points",
        effectDescription: "x3 points gain",
        done() { return player.e.points.gte(6) },
        unlocked()
        {
return hasMilestone('e', 5)
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
        requirementDescription: "7 E letter points",
        effectDescription: "x4 points gain",
        done() { return player.e.points.gte(7) },
        unlocked()
        {
return hasMilestone('e', 6)
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
        requirementDescription: "8 E letter points",
        effectDescription: "x5 points gain",
        done() { return player.e.points.gte(8) },
        unlocked()
        {
return hasMilestone('e', 7)
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
        requirementDescription: "9 E letter points",
        effectDescription: "x6 points gain",
        done() { return player.e.points.gte(9) },
        unlocked()
        {
return hasMilestone('e', 8)
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
        requirementDescription: "10 E letter points",
        effectDescription: "Auto E points generation and x10 points gain",
        done() { return player.e.points.gte(10) },
        unlocked()
        {
return hasMilestone('e', 9)
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
    },*/
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