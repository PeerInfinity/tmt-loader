addLayer("a", {
    name: "A layer", 
    symbol: "A", 
    position: 0, 
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(1), 
    resource: "A letter points", 
    baseResource: "points", 
    baseAmount() {return player.points}, 
    type: "static", 
    exponent: 1.1, 
    gainMult() { 
        let gain = new Decimal(1)
        if (hasUpgrade("a", 12)) gain = gain.times(50)
        return gain
    },
    gainExp() { 
        return new Decimal(1)
    },
    row: 1,
    nodeStyle() {
        if (tmp[this.layer].canReset) {
            return {
                "box-shadow": "0px 0px 25px #ff0000",
                "border-color": "#ff0000"
            }
        }
        return {}
    },
     autoPrestige() {
        // Nuperka tašką tik tada, kai turite B pasiekimą IR kai tikrai užtenka taškų kainai
        return hasMilestone('b', 11) || hasMilestone('b', '11')
    },
    hotkeys: [
        {key: "a", description: "A: Reset for A letter points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},


 // Nepamirškite uždaryti sluoksnio skliaustelio pabaigoje

    
    milestones: {
    1: {
    requirementDescription: "1 A letter points",
    effectDescription: "x1.2 points gain",
    done() { return player.a.points.gte(1) },
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
        requirementDescription: "2 A letter points",
        effectDescription: "x1.4 points gain",
        done() { return player.a.points.gte(2) },
        unlocked()
        {
return hasMilestone('a', 1)
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
        requirementDescription: "3 A letter points",
        effectDescription: "x1.6 points gain",
        done() { return player.a.points.gte(3) },
        unlocked()
        {
return hasMilestone('a', 2)
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
        requirementDescription: "4 A letter points",
        effectDescription: "x1.8 points gain",
        done() { return player.a.points.gte(4) },
        unlocked()
        {
return hasMilestone('a', 3)
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
        requirementDescription: "5 A letter points",
        effectDescription: "x2 points gain",
        done() { return player.a.points.gte(5) },
        unlocked()
        {
return hasMilestone('a', 4)
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
        requirementDescription: "6 A letter points",
        effectDescription: "x2.2 points gain",
        done() { return player.a.points.gte(6) },
        unlocked()
        {
return hasMilestone('a', 5)
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
        requirementDescription: "7 A letter points",
        effectDescription: "x2.4 points gain",
        done() { return player.a.points.gte(7) },
        unlocked()
        {
return hasMilestone('a', 6)
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
        requirementDescription: "8 A letter points",
        effectDescription: "x2.6 points gain",
        done() { return player.a.points.gte(8) },
        unlocked()
        {
return hasMilestone('a', 7)
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
        requirementDescription: "9 A letter points",
        effectDescription: "x2.8 points gain",
        done() { return player.a.points.gte(9) },
        unlocked()
        {
return hasMilestone('a', 8)
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
        requirementDescription: "10 A letter points",
        effectDescription: "Open new layer and x4 points gain",
        done() { return player.a.points.gte(10) },
        unlocked()
        {
return hasMilestone('a', 9)
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
    11: {
        requirementDescription: "13 A letter points",
        effectDescription: "x7 points gain",
        done() { return player.a.points.gte(13) },
        unlocked()
        {
return hasMilestone('a', 10)
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
    12: {
        requirementDescription: "16 A letter points",
        effectDescription: "x10 points gain",
        done() { return player.a.points.gte(16) },
        unlocked()
        {
return hasMilestone('a', 11)
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
    13: {
        requirementDescription: "20 A letter points",
        effectDescription: "x13 points gain",
        done() { return player.a.points.gte(20) },
        unlocked()
        {
return hasMilestone('a', 12)
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


addLayer("b", {
    name: "B layer", // Privalomas arba nebūtinas sluoksnio pavadinimas
    symbol: "B", // Raidė, kuri rodoma ant paties mygtuko apskritimo
    position: 0, // Horizontali mygtuko pozicija eilutėje
    row: 2, // Eilutė, kurioje yra mygtukas (0 yra pirmoji eilutė)
    
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    
    color: "#4BDC13",
    requires: new Decimal(5), // Kiek reikia turėti bazinio resurso, kad gautumėte B tašką
    resource: "B letter points", // Valiutos, kurią gaunate, pavadinimas
    baseResource: "A letter points", // Valiutos, kuria mokate, pavadinimas
    
    baseAmount() { return player.a.points }, // Paima esamą A sluoksnio taškų kiekį
    type: "static", // static: kaina priklauso nuo to, kiek B taškų jau turite užsiauginę
    exponent: 0.3, // Valiutos gavimo eksponentė
    
    gainMult() { // Valiutos gavimo daugikliai iš patobulinimų
        let gain = new Decimal(1)
        if (hasUpgrade("b", 12)) gain = gain.times(2000)
        return gain
    },
    
    gainExp() { // Valiutos gavimo eksponentės bonusai
        return new Decimal(1)
    },

    // 🔴 RAUDONAS ŠVYTĖJIMAS: Užsidega aplink mygtuką, kai pasiekiate reikiamą A taškų kiekį
    nodeStyle() {
        if (tmp[this.layer].canReset) {
            return {
                "box-shadow": "0px 0px 25px #ff0000",
                "border-color": "#ff0000"
            }
        }
        return {}
    },

    // 🌟 KODAS, KAD NEDIINGTŲ: Užtikrina, kad jūsų turimi B taškai ir patobulinimai niekur nedingtų po pirkimo
    keepFeatures() {
        return true;
    },

    // 🌟 KODAS, KAD NEDINGTŲ: Sluoksnis išlieka matomas, jei turite bent 10 A taškų ARBA jei jau esate nusipirkę bent 1 B tašką
    layerShown() {
        return player.a.points.gte(10) || player[this.layer].best.gte(1) || player[this.layer].unlocked;
    },

    hotkeys: [
        { key: "b", description: "B: Reset for B letter points", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    
    branches: ["a"], // Jungiamoji linija, einanti į A sluoksnį
    
    milestones: {
    1: {
    requirementDescription: "1 B letter points",
    effectDescription: "x1.2 points gain",
    done() { return player.b.points.gte(1) },
    
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
        requirementDescription: "2 B letter points",
        effectDescription: "x1.3 points gain",
        done() { return player.b.points.gte(2) },
        unlocked()
        {
return hasMilestone('b', 1)
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
        requirementDescription: "3 B letter points",
        effectDescription: "x1.4 points gain",
        done() { return player.b.points.gte(3) },
        unlocked()
        {
return hasMilestone('b', 2)
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
        requirementDescription: "4 B letter points",
        effectDescription: "x1.5 points gain",
        done() { return player.b.points.gte(4) },
        unlocked()
        {
return hasMilestone('b', 3)
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
        requirementDescription: "5 B letter points",
        effectDescription: "x1.6 points gain",
        done() { return player.b.points.gte(5) },
        unlocked()
        {
return hasMilestone('b', 4)
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
        requirementDescription: "6 B letter points",
        effectDescription: "x1.8 points gain",
        done() { return player.b.points.gte(6) },
        unlocked()
        {
return hasMilestone('b', 5)
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
        requirementDescription: "7 B letter points",
        effectDescription: "x2 points gain",
        done() { return player.b.points.gte(7) },
        unlocked()
        {
return hasMilestone('b', 6)
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
        requirementDescription: "8 B letter points",
        effectDescription: "x2.4 points gain",
        done() { return player.b.points.gte(8) },
        unlocked()
        {
return hasMilestone('b', 7)
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
        requirementDescription: "9 B letter points",
        effectDescription: "x2.8 points gain",
        done() { return player.b.points.gte(9) },
        unlocked()
        {
return hasMilestone('b', 8)
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
        requirementDescription: "10 B letter points",
        effectDescription: "x3.2 points gain",
        done() { return player.b.points.gte(10) },
        unlocked()
        {
return hasMilestone('b', 9)
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
    11: {
        requirementDescription: "15 B letter points",
        effectDescription: "Auto A points generation and x3.6 points gain",
        done() { return player.b.points.gte(15) },
        unlocked()
        {
return hasMilestone('b', 10)
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
